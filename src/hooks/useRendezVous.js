import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRendezVous() {
  const [rendezVous, setRendezVous] = useState([])
  const [loading,    setLoading]    = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('rendez_vous')
      .select('*, patients(nom, prenom, telephone)')
      .order('date', { ascending: true })
    setRendezVous(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const ajouterRdv    = async (r)     => { await supabase.from('rendez_vous').insert(r); fetch() }
  const modifierRdv   = async (id, r) => { await supabase.from('rendez_vous').update(r).eq('id', id); fetch() }
  const supprimerRdv  = async (id)    => { await supabase.from('rendez_vous').delete().eq('id', id); fetch() }

  return { rendezVous, loading, ajouterRdv, modifierRdv, supprimerRdv, refresh: fetch }
}
