import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRappels() {
  const [rappels,  setRappels]  = useState([])
  const [config,   setConfig]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)

  const fetchRappels = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('rappels_sms')
      .select('*, rendez_vous(date, heure, type_acte, patients(nom, prenom, telephone))')
      .order('created_at', { ascending: false })
    setRappels(data ?? [])
    setLoading(false)
  }

  const fetchConfig = async () => {
    const { data } = await supabase
      .from('rappels_config')
      .select('*')
      .limit(1)
      .single()
    if (data) setConfig(data)
  }

  useEffect(() => { fetchRappels(); fetchConfig() }, [])

  const sauvegarderConfig = async (c) => {
    if (config?.id) {
      await supabase.from('rappels_config').update(c).eq('id', config.id)
    } else {
      await supabase.from('rappels_config').insert(c)
    }
    fetchConfig()
  }

  // Déclenche l'envoi d'un rappel manuel via Edge Function
  const envoyerRappel = async (rdvId) => {
    setSending(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-rappel-rdv', {
        body: { rdv_id: rdvId },
      })
      if (error) throw error
      await fetchRappels()
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setSending(false)
    }
  }

  // RDV de demain sans rappel envoyé (pour aperçu)
  const rdvSansRappel = async () => {
    const demain = new Date()
    demain.setDate(demain.getDate() + 1)
    const demainStr = demain.toISOString().split('T')[0]

    const { data } = await supabase
      .from('rendez_vous')
      .select('*, patients(nom, prenom, telephone)')
      .eq('date', demainStr)
      .not('statut', 'eq', 'annule')
    return data ?? []
  }

  return {
    rappels, config, loading, sending,
    sauvegarderConfig, envoyerRappel, rdvSansRappel,
    refresh: fetchRappels,
  }
}
