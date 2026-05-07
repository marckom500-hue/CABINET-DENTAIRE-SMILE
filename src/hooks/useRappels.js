import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

async function getFunctionErrorMessage(error) {
  const fallback = error?.message ?? 'Erreur inconnue'
  const response = error?.context

  if (!response || typeof response.clone !== 'function') {
    return fallback
  }

  try {
    const payload = await response.clone().json()
    return payload?.sms_error || payload?.error || payload?.message || fallback
  } catch {
    try {
      return await response.clone().text()
    } catch {
      return fallback
    }
  }
}

function parseFunctionData(data) {
  if (typeof data !== 'string') return data

  try {
    return JSON.parse(data)
  } catch {
    return { success: false, error: data }
  }
}

export function useRappels() {
  const [rappels, setRappels] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

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

  useEffect(() => {
    fetchRappels()
    fetchConfig()
  }, [])

  const sauvegarderConfig = async (c) => {
    if (config?.id) {
      await supabase.from('rappels_config').update(c).eq('id', config.id)
    } else {
      await supabase.from('rappels_config').insert(c)
    }
    fetchConfig()
  }

  const envoyerRappel = async (rdvId) => {
    setSending(true)
    try {
      const { data: rawData, error } = await supabase.functions.invoke('send-rappel-rdv', {
        body: { rdv_id: rdvId },
      })
      const data = parseFunctionData(rawData)

      await fetchRappels()

      if (error) {
        return { success: false, error: await getFunctionErrorMessage(error) }
      }

      if (data?.success === true && data?.statut === 'envoye') {
        return { success: true, data }
      }

      return {
        success: false,
        error: data?.sms_error || data?.error || "Echec de l'envoi du SMS",
      }
    } catch (err) {
      await fetchRappels()
      return { success: false, error: await getFunctionErrorMessage(err) }
    } finally {
      setSending(false)
    }
  }

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
    rappels,
    config,
    loading,
    sending,
    sauvegarderConfig,
    envoyerRappel,
    rdvSansRappel,
    refresh: fetchRappels,
  }
}
