import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useAllergies(patientId) {
  const [allergies, setAllergies] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()

  const fetch = async () => {
    if (!patientId) {
      setAllergies([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('allergies_patients')
      .select('*')
      .eq('patient_id', patientId)
      .order('gravite', { ascending: false })
    
    if (error) {
      notify({ type: 'error', message: `Erreur allergies : ${error.message}` })
      setAllergies([])
    } else {
      setAllergies(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [patientId])

  const ajouter = async (data) => {
    const { error } = await supabase
      .from('allergies_patients')
      .insert({ ...data, patient_id: patientId })
    if (error) {
      notify({ type: 'error', message: `Erreur ajout : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Allergie ajoutée' })
    await fetch()
  }

  const modifier = async (id, data) => {
    const { error } = await supabase
      .from('allergies_patients')
      .update(data)
      .eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur modification : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Allergie modifiée' })
    await fetch()
  }

  const supprimer = async (id) => {
    const { error } = await supabase
      .from('allergies_patients')
      .delete()
      .eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur suppression : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Allergie supprimée' })
    await fetch()
  }

  return { allergies, loading, ajouter, modifier, supprimer, refresh: fetch }
}
