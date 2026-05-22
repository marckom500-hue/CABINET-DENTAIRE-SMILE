import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'
import { DEVIS_STATUS, normalizeDevisStatus } from '../lib/statuses'

export function useDevis(patientId = null) {
  const [devis, setDevis] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()

  const fetch = async () => {
    setLoading(true)
    let query = supabase
      .from('devis')
      .select('*, lignes_devis(*)')
      .order('date_creation', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    const { data, error } = await query

    if (error) {
      notify({ type: 'error', message: `Erreur devis : ${error.message}` })
      setDevis([])
    } else {
      setDevis(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [patientId])

  const ajouter = async (data) => {
    const { error } = await supabase.from('devis').insert(data)
    if (error) {
      notify({ type: 'error', message: `Erreur ajout : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Devis créé' })
    await fetch()
  }

  const modifier = async (id, data) => {
    const { error } = await supabase
      .from('devis')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur modification : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Devis modifié' })
    await fetch()
  }

  const supprimer = async (id) => {
    const { error } = await supabase.from('devis').delete().eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur suppression : ${error.message}` })
      throw error
    }
    notify({ type: 'success', message: 'Devis supprimé' })
    await fetch()
  }

  const changerStatut = async (id, newStatut) => {
    const dataToUpdate = { statut: newStatut, updated_at: new Date().toISOString() }
    if (normalizeDevisStatus(newStatut) === DEVIS_STATUS.ACCEPTE) {
      dataToUpdate.date_acceptation = new Date().toISOString().split('T')[0]
    }
    await modifier(id, dataToUpdate)
  }

  return { devis, loading, ajouter, modifier, supprimer, changerStatut, refresh: fetch }
}

export function useLignesDevis(devisId) {
  const [lignes, setLignes] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()

  const fetch = async () => {
    if (!devisId) {
      setLignes([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('lignes_devis')
      .select('*')
      .eq('devis_id', devisId)
      .order('created_at')

    if (error) {
      notify({ type: 'error', message: `Erreur lignes : ${error.message}` })
      setLignes([])
    } else {
      setLignes(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch()
  }, [devisId])

  const ajouter = async (data) => {
    const { error } = await supabase
      .from('lignes_devis')
      .insert({ ...data, devis_id: devisId })
    if (error) {
      notify({ type: 'error', message: `Erreur ajout ligne : ${error.message}` })
      throw error
    }
    await fetch()
  }

  const modifier = async (id, data) => {
    const { error } = await supabase.from('lignes_devis').update(data).eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur modification : ${error.message}` })
      throw error
    }
    await fetch()
  }

  const supprimer = async (id) => {
    const { error } = await supabase.from('lignes_devis').delete().eq('id', id)
    if (error) {
      notify({ type: 'error', message: `Erreur suppression : ${error.message}` })
      throw error
    }
    await fetch()
  }

  return { lignes, loading, ajouter, modifier, supprimer, refresh: fetch }
}

export function useActesDentaires() {
  const [actes, setActes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('actes_dentaires').select('*').order('categorie')
      setActes(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { actes, loading }
}
