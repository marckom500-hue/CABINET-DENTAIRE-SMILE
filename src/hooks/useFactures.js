import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFactures() {
  const [factures, setFactures] = useState([])
  const [loading,  setLoading]  = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('factures')
      .select('*, patients(nom, prenom)')
      .order('date', { ascending: false })
    setFactures(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const ajouterFacture   = async (f)     => { await supabase.from('factures').insert(f); fetch() }
  const modifierFacture  = async (id, f) => { await supabase.from('factures').update(f).eq('id', id); fetch() }
  const supprimerFacture = async (id)    => { await supabase.from('factures').delete().eq('id', id); fetch() }

  const total    = factures.reduce((s, f) => s + (f.montant ?? 0), 0)
  const encaisse = factures.filter(f => f.statut === 'paye').reduce((s, f) => s + (f.montant ?? 0), 0)

  return { factures, loading, total, encaisse, ajouterFacture, modifierFacture, supprimerFacture }
}
