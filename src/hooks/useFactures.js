import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'
import { FACTURE_STATUS, normalizeFactureStatus } from '../lib/statuses'
import { useAppConfig } from './useAppConfig'

export function useFactures() {
  const [factures, setFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()
  const { value: useMockData } = useAppConfig('use_mock_data', 'false')

  // Valeurs dérivées
  const total = factures.reduce((s, f) => s + (normalizeFactureStatus(f.statut) !== FACTURE_STATUS.ANNULE ? Number(f.montant ?? 0) : 0), 0)
  const encaisse = factures.reduce((s, f) => s + (normalizeFactureStatus(f.statut) === FACTURE_STATUS.PAYE ? Number(f.montant ?? 0) : 0), 0)

  const fetch = async (mockMode = useMockData) => {
    try {
      setLoading(true)
      const tableName = mockMode === 'true' ? 'factures_mock' : 'factures'
      console.log(`[useFactures] Chargement depuis table: ${tableName}`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*, patients(id, prenom, nom)')
        .order('date', { ascending: false })
      
      if (error) {
        console.error(`[useFactures] Erreur:`, error)
        notify({ type: 'error', message: `Erreur factures : ${error.message}` })
        setFactures([])
      } else {
        console.log(`[useFactures] ${data?.length || 0} factures chargées`)
        setFactures(data ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetch(useMockData) 
  }, [useMockData])

  const creerDepuisDevis = async (devisId) => {
    try {
      const { data: devisData, error: errD } = await supabase
        .from('devis')
        .select('*')
        .eq('id', devisId)
        .single()
      if (errD || !devisData) throw errD || new Error('Devis introuvable')

      const { data: lignes, error: errL } = await supabase
        .from('lignes_devis')
        .select('*')
        .eq('devis_id', devisId)
      if (errL) throw errL

      const montant = (lignes || []).reduce(
        (s, l) => s + (Number(l.prix_unitaire || 0) * Number(l.quantite || 1)),
        0
      )

      const facturePayload = {
        patient_id: devisData.patient_id,
        acte: devisData.description || devisData.acte || 'Conversion devis',
        montant: montant || Number(devisData.montant_total || 0),
        date: new Date().toISOString().split('T')[0],
        statut: 'attente',
      }

      const { data: insertFacture, error: errF } = await supabase
        .from('factures')
        .insert(facturePayload)
        .select('*')
        .single()
      if (errF) throw errF

      notify({ type: 'success', message: 'Facture créée depuis le devis ✓' })
      await fetch()
      return insertFacture
    } catch (error) {
      notify({ type: 'error', message: `Erreur conversion devis→facture : ${error.message}` })
      throw error
    }
  }

  const ajouterFacture = async (payload) => {
    try {
      const { data, error } = await supabase
        .from('factures')
        .insert(payload)
        .select('*')
        .single()
      if (error) throw error
      notify({ type: 'success', message: 'Facture ajoutée' })
      await fetch()
      return data
    } catch (error) {
      notify({ type: 'error', message: `Erreur ajout facture : ${error.message}` })
      throw error
    }
  }

  const modifierFacture = async (id, payload) => {
    try {
      const { data, error } = await supabase
        .from('factures')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw error
      notify({ type: 'success', message: 'Facture modifiée' })
      await fetch()
      return data
    } catch (error) {
      notify({ type: 'error', message: `Erreur modification facture : ${error.message}` })
      throw error
    }
  }

  const supprimerFacture = async (id) => {
    try {
      const { error } = await supabase
        .from('factures')
        .delete()
        .eq('id', id)
      if (error) throw error
      notify({ type: 'success', message: 'Facture supprimée' })
      await fetch()
      return true
    } catch (error) {
      notify({ type: 'error', message: `Erreur suppression facture : ${error.message}` })
      throw error
    }
  }

  return {
    factures,
    loading,
    total,
    encaisse,
    ajouterFacture,
    modifierFacture,
    supprimerFacture,
    creerDepuisDevis,
    refresh: fetch,
  }
}
