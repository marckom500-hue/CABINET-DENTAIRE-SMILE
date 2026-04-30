import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePatients() {
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
    setPatients(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const ajouterPatient  = async (p) => { await supabase.from('patients').insert(p); fetch() }
  const modifierPatient = async (id, p) => { await supabase.from('patients').update(p).eq('id', id); fetch() }
  const supprimerPatient = async (id) => { await supabase.from('patients').delete().eq('id', id); fetch() }

  return { patients, loading, ajouterPatient, modifierPatient, supprimerPatient, refresh: fetch }
}
