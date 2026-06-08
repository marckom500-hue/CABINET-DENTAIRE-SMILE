// // src/hooks/usePatientData.js
// import { useState, useEffect, useCallback } from 'react'
// import { supabase } from '../lib/supabase'

// export function usePatientData(patientId) {
//   const [ordonnances, setOrdonnances] = useState([])
//   const [factures, setFactures] = useState([])
//   const [rdvs, setRdvs] = useState([])
  
//   const [loading, setLoading] = useState({
//     ordonnances: true,
//     factures: true,
//     rdvs: true
//   })
  
//   const [error, setError] = useState({
//     ordonnances: null,
//     factures: null,
//     rdvs: null
//   })

//   // Récupérer les ordonnances du patient
//   const fetchOrdonnances = useCallback(async () => {
//     if (!patientId) return
    
//     setLoading(prev => ({ ...prev, ordonnances: true }))
//     setError(prev => ({ ...prev, ordonnances: null }))
    
//     try {
//       const { data, error } = await supabase
//         .from('ordonnances')
//         .select('*, medecin_traitant:users_profiles(nom, prenom)')
//         .eq('patient_id', patientId)
//         .order('created_at', { ascending: false })

//       if (error) throw error
      
//       setOrdonnances(data ?? [])
//     } catch (err) {
//       console.error('Erreur chargement ordonnances:', err)
//       setError(prev => ({ ...prev, ordonnances: err.message }))
//       setOrdonnances([])
//     } finally {
//       setLoading(prev => ({ ...prev, ordonnances: false }))
//     }
//   }, [patientId])

//   // Récupérer les factures du patient
//   const fetchFactures = useCallback(async () => {
//     if (!patientId) return
    
//     setLoading(prev => ({ ...prev, factures: true }))
//     setError(prev => ({ ...prev, factures: null }))
    
//     try {
//       const { data, error } = await supabase
//         .from('factures')
//         .select('*')
//         .eq('patient_id', patientId)
//         .order('created_at', { ascending: false })

//       if (error) throw error
      
//       setFactures(data ?? [])
//     } catch (err) {
//       console.error('Erreur chargement factures:', err)
//       setError(prev => ({ ...prev, factures: err.message }))
//       setFactures([])
//     } finally {
//       setLoading(prev => ({ ...prev, factures: false }))
//     }
//   }, [patientId])

//   // Récupérer les rendez-vous du patient
//   const fetchRdvs = useCallback(async () => {
//     if (!patientId) return
    
//     setLoading(prev => ({ ...prev, rdvs: true }))
//     setError(prev => ({ ...prev, rdvs: null }))
    
//     try {
//       const { data, error } = await supabase
//         .from('rendez_vous')
//         .select('*, medecin:users_profiles(nom, prenom)')
//         .eq('patient_id', patientId)
//         .order('date_heure', { ascending: false })

//       if (error) throw error
      
//       setRdvs(data ?? [])
//     } catch (err) {
//       console.error('Erreur chargement rendez-vous:', err)
//       setError(prev => ({ ...prev, rdvs: err.message }))
//       setRdvs([])
//     } finally {
//       setLoading(prev => ({ ...prev, rdvs: false }))
//     }
//   }, [patientId])

//   // Rafraîchir toutes les données
//   const refreshAll = useCallback(() => {
//     fetchOrdonnances()
//     fetchFactures()
//     fetchRdvs()
//   }, [fetchOrdonnances, fetchFactures, fetchRdvs])

//   // Charger les données au montage ou quand patientId change
//   useEffect(() => {
//     if (patientId) {
//       refreshAll()
//     } else {
//       // Reset si pas de patient
//       setOrdonnances([])
//       setFactures([])
//       setRdvs([])
//       setLoading({ ordonnances: false, factures: false, rdvs: false })
//       setError({ ordonnances: null, factures: null, rdvs: null })
//     }
//   }, [patientId, refreshAll])

//   return {
//     // Données
//     ordonnances,
//     factures,
//     rdvs,
    
//     // États de chargement
//     loading,
//     isLoading: loading.ordonnances || loading.factures || loading.rdvs,
    
//     // Erreurs
//     error,
    
//     // Actions
//     refreshAll,
//     refreshOrdonnances: fetchOrdonnances,
//     refreshFactures: fetchFactures,
//     refreshRdvs: fetchRdvs,
    
//     // Métadonnées
//     totalOrdonnances: ordonnances.length,
//     totalFactures: factures.length,
//     totalRdvs: rdvs.length,
    
//     // Statistiques financières
//     totalMontantFactures: factures.reduce((sum, f) => sum + (Number(f.montant) || 0), 0),
//     totalPaye: factures
//       .filter(f => f.statut === 'paye')
//       .reduce((sum, f) => sum + (Number(f.montant) || 0), 0),
//     totalImpaye: factures
//       .filter(f => f.statut !== 'paye')
//       .reduce((sum, f) => sum + (Number(f.montant) || 0), 0),
//   }
// }

// src/hooks/usePatientData.js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePatientData(patientId) {
  const [ordonnances, setOrdonnances] = useState([])
  const [factures, setFactures] = useState([])
  const [rdvs, setRdvs] = useState([])
  
  const [loading, setLoading] = useState({
    ordonnances: true,
    factures: true,
    rdvs: true
  })
  
  const [error, setError] = useState({
    ordonnances: null,
    factures: null,
    rdvs: null
  })

  // Récupérer les ordonnances du patient
  const fetchOrdonnances = useCallback(async () => {
    if (!patientId) return
    
    setLoading(prev => ({ ...prev, ordonnances: true }))
    setError(prev => ({ ...prev, ordonnances: null }))
    
    try {
      const { data, error } = await supabase
        .from('ordonnances')
        .select('*, medecin_traitant:users_profiles(nom, prenom)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setOrdonnances(data ?? [])
    } catch (err) {
      console.error('Erreur chargement ordonnances:', err)
      setError(prev => ({ ...prev, ordonnances: err.message }))
      setOrdonnances([])
    } finally {
      setLoading(prev => ({ ...prev, ordonnances: false }))
    }
  }, [patientId])

  // Récupérer les factures du patient
  const fetchFactures = useCallback(async () => {
    if (!patientId) return
    
    setLoading(prev => ({ ...prev, factures: true }))
    setError(prev => ({ ...prev, factures: null }))
    
    try {
      const { data, error } = await supabase
        .from('factures')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setFactures(data ?? [])
    } catch (err) {
      console.error('Erreur chargement factures:', err)
      setError(prev => ({ ...prev, factures: err.message }))
      setFactures([])
    } finally {
      setLoading(prev => ({ ...prev, factures: false }))
    }
  }, [patientId])

  // Récupérer les rendez-vous du patient - CORRIGÉ
  const fetchRdvs = useCallback(async () => {
    if (!patientId) return
    
    setLoading(prev => ({ ...prev, rdvs: true }))
    setError(prev => ({ ...prev, rdvs: null }))
    
    try {
      // ✅ CORRECTION ICI : utiliser 'date' et 'heure' au lieu de 'date_heure'
      const { data, error } = await supabase
        .from('rendez_vous')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false })
        .order('heure', { ascending: false })

      if (error) throw error
      
      // Récupérer les infos du médecin pour chaque RDV
      const rdvsAvecMedecin = await Promise.all(
        (data || []).map(async (rdv) => {
          if (rdv.id_praticien) {
            const { data: medecinData, error: medecinError } = await supabase
              .from('users_profiles')
              .select('nom, prenom')
              .eq('id', rdv.id_praticien)
              .single()
            
            if (!medecinError && medecinData) {
              return { ...rdv, medecin: medecinData }
            }
          }
          return rdv
        })
      )
      
      setRdvs(rdvsAvecMedecin)
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err)
      setError(prev => ({ ...prev, rdvs: err.message }))
      setRdvs([])
    } finally {
      setLoading(prev => ({ ...prev, rdvs: false }))
    }
  }, [patientId])

  // Rafraîchir toutes les données
  const refreshAll = useCallback(() => {
    fetchOrdonnances()
    fetchFactures()
    fetchRdvs()
  }, [fetchOrdonnances, fetchFactures, fetchRdvs])

  // Charger les données au montage ou quand patientId change
  useEffect(() => {
    if (patientId) {
      refreshAll()
    } else {
      // Reset si pas de patient
      setOrdonnances([])
      setFactures([])
      setRdvs([])
      setLoading({ ordonnances: false, factures: false, rdvs: false })
      setError({ ordonnances: null, factures: null, rdvs: null })
    }
  }, [patientId, refreshAll])

  return {
    // Données
    ordonnances,
    factures,
    rdvs,
    
    // États de chargement
    loading,
    isLoading: loading.ordonnances || loading.factures || loading.rdvs,
    
    // Erreurs
    error,
    
    // Actions
    refreshAll,
    refreshOrdonnances: fetchOrdonnances,
    refreshFactures: fetchFactures,
    refreshRdvs: fetchRdvs,
    
    // Métadonnées
    totalOrdonnances: ordonnances.length,
    totalFactures: factures.length,
    totalRdvs: rdvs.length,
    
    // Statistiques financières
    totalMontantFactures: factures.reduce((sum, f) => sum + (Number(f.montant) || 0), 0),
    totalPaye: factures
      .filter(f => f.statut === 'paye')
      .reduce((sum, f) => sum + (Number(f.montant) || 0), 0),
    totalImpaye: factures
      .filter(f => f.statut !== 'paye')
      .reduce((sum, f) => sum + (Number(f.montant) || 0), 0),
  }
}