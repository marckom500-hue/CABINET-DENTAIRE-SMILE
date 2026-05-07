import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function usePatients() {
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)
  const { notify } = useNotifications()

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
    setPatients(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const ajouterPatient = async (p) => {
    const { error } = await supabase.from('patients').insert(p)
    if (error) {
      notify({ type:'error', message:`Patient non ajoute : ${error.message}` })
      throw error
    }
    notify({ type:'patient', message:`Patient ajoute : ${p.prenom ?? ''} ${p.nom ?? ''}`.trim() })
    await fetch()
  }

  const modifierPatient = async (id, p) => {
    const { error } = await supabase.from('patients').update(p).eq('id', id)
    if (error) {
      notify({ type:'error', message:`Patient non modifie : ${error.message}` })
      throw error
    }
    notify({ type:'patient', message:`Patient modifie : ${p.prenom ?? ''} ${p.nom ?? ''}`.trim() })
    await fetch()
  }

  const supprimerPatient = async (id) => {
    const patient = patients.find(p => p.id === id)
    const { error } = await supabase.from('patients').delete().eq('id', id)
    if (error) {
      notify({ type:'error', message:`Patient non supprime : ${error.message}` })
      throw error
    }
    notify({ type:'patient', message:`Patient supprime${patient ? ` : ${patient.prenom ?? ''} ${patient.nom ?? ''}` : ''}`.trim() })
    await fetch()
  }

  return { patients, loading, ajouterPatient, modifierPatient, supprimerPatient, refresh: fetch }
}
