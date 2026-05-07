import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useFactures() {
  const [factures, setFactures] = useState([])
  const [loading,  setLoading]  = useState(true)
  const { notify } = useNotifications()

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

  const ajouterFacture = async (f) => {
    const { error } = await supabase.from('factures').insert(f)
    if (error) {
      notify({ type:'error', message:`Facture non ajoutee : ${error.message}` })
      throw error
    }
    notify({ type:'facture', message:`Facture ajoutee : ${Number(f.montant ?? 0).toLocaleString('fr-FR')} FCFA` })
    await fetch()
  }

  const modifierFacture = async (id, f) => {
    const { error } = await supabase.from('factures').update(f).eq('id', id)
    if (error) {
      notify({ type:'error', message:`Facture non modifiee : ${error.message}` })
      throw error
    }
    notify({ type:'facture', message:`Facture modifiee : ${Number(f.montant ?? 0).toLocaleString('fr-FR')} FCFA` })
    await fetch()
  }

  const supprimerFacture = async (id) => {
    const facture = factures.find(f => f.id === id)
    const { error } = await supabase.from('factures').delete().eq('id', id)
    if (error) {
      notify({ type:'error', message:`Facture non supprimee : ${error.message}` })
      throw error
    }
    notify({ type:'facture', message:`Facture supprimee${facture?.acte ? ` : ${facture.acte}` : ''}` })
    await fetch()
  }

  const total    = factures.reduce((s, f) => s + (f.montant ?? 0), 0)
  const encaisse = factures.filter(f => f.statut === 'paye').reduce((s, f) => s + (f.montant ?? 0), 0)

  return { factures, loading, total, encaisse, ajouterFacture, modifierFacture, supprimerFacture }
}
