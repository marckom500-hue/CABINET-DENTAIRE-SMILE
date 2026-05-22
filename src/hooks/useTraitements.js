import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useTraitements(patientId) {
  const [traitements, setTraitements] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()

  const fetch = async () => {
    if (!patientId) {
      setTraitements([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('traitements')
      .select('*')
      .eq('patient_id', patientId)
      .order('date_debut', { ascending: false })
    
    if (error) {
      notify({ type: 'error', message: `Erreur traitements : ${error.message}` })
      setTraitements([])
    } else {
      setTraitements(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [patientId])

  const ajouter = async (data) => {
    const { error } = await supabase
      .from('traitements')
      .insert({ ...data, patient_id: patientId })
    if (error) {
      notify({ type: 'error', message: `Erreur ajout : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Traitement ajouté' })
    await fetch()
  }

  const modifier = async (id, data) => {
    const { error } = await supabase
      .from('traitements')
      .update(data)
      .eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur modification : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Traitement modifié' })
    await fetch()
  }

  const supprimer = async (id) => {
    const { error } = await supabase
      .from('traitements')
      .delete()
      .eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur suppression : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Traitement supprimé' })
    await fetch()
  }

  return { traitements, loading, ajouter, modifier, supprimer, refresh: fetch }
}
