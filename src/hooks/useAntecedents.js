import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useAntecedents(patientId) {
  const [antecedents, setAntecedents] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()

  const fetch = async () => {
    if (!patientId) {
      setAntecedents([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('antecedents_patients')
      .select('*')
      .eq('patient_id', patientId)
      .order('date_occurrence', { ascending: false })
    
    if (error) {
      notify({ type: 'error', message: `Erreur antécédents : ${error.message}` })
      setAntecedents([])
    } else {
      setAntecedents(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [patientId])

  const ajouter = async (data) => {
    const { error } = await supabase
      .from('antecedents_patients')
      .insert({ ...data, patient_id: patientId })
    if (error) {
      notify({ type: 'error', message: `Erreur ajout : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Antécédent ajouté' })
    await fetch()
  }

  const modifier = async (id, data) => {
    const { error } = await supabase
      .from('antecedents_patients')
      .update(data)
      .eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur modification : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Antécédent modifié' })
    await fetch()
  }

  const supprimer = async (id) => {
    const { error } = await supabase
      .from('antecedents_patients')
      .delete()
      .eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur suppression : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Antécédent supprimé' })
    await fetch()
  }

  return { antecedents, loading, ajouter, modifier, supprimer, refresh: fetch }
}
