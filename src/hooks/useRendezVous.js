// import { useState, useEffect } from 'react'
// import { supabase } from '../lib/supabase'
// import { useNotifications } from './NotificationsContext'

// export function useRendezVous() {
//   const [rendezVous, setRendezVous] = useState([])
//   const [loading,    setLoading]    = useState(true)
//   const { notify } = useNotifications()

//   const fetch = async () => {
//     setLoading(true)
//     const { data } = await supabase
//       .from('rendez_vous')
//       .select('*, patients(nom, prenom, telephone), users_profiles(nom, prenom)')
//       .order('date', { ascending: true })
//     setRendezVous(data ?? [])
//     setLoading(false)
//   }

//   useEffect(() => { fetch() }, [])

//   const ajouterRdv = async (r) => {
//     const { error } = await supabase.from('rendez_vous').insert(r)
//     if (error) {
//       notify({ type:'error', message:`RDV non ajoute : ${error.message}` })
//       throw error
//     }
//     notify({ type:'rdv', message:`RDV ajoute le ${r.date} a ${r.heure}` })
//     await fetch()
//   }

//   const modifierRdv = async (id, r) => {
//     const { error } = await supabase.from('rendez_vous').update(r).eq('id', id)
//     if (error) {
//       notify({ type:'error', message:`RDV non modifie : ${error.message}` })
//       throw error
//     }
//     notify({ type:'rdv', message:`RDV modifie le ${r.date} a ${r.heure}` })
//     await fetch()
//   }

//   const annulerRdv = async (id) => {
//     const rdv = rendezVous.find(r => r.id === id)
//     const { error } = await supabase.from('rendez_vous').update({ statut: 'annule' }).eq('id', id)
//     if (error) {
//       notify({ type:'error', message:`RDV non annule : ${error.message}` })
//       throw error
//     }
//     notify({ type:'rdv', message:`RDV annule${rdv ? ` : ${rdv.date} a ${rdv.heure}` : ''}` })
//     await fetch()
//   }

//   return { rendezVous, loading, ajouterRdv, modifierRdv, annulerRdv, refresh: fetch }
// }


import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

export function useRendezVous() {
  const [rendezVous, setRendezVous] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()

  // 🔥 fetch mémorisé
  const fetch = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('rendez_vous')
      .select('*, patients(nom, prenom, telephone), users_profiles(nom, prenom)')
      .order('date', { ascending: true })

    setRendezVous(prev => {
      // évite re-render inutile si identique
      if (JSON.stringify(prev) === JSON.stringify(data)) return prev
      return data ?? []
    })

    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  // 🔥 AJOUT optimisé (pas de refetch)
  const ajouterRdv = async (r) => {
    const { data, error } = await supabase
      .from('rendez_vous')
      .insert(r)
      .select()
      .single()

    if (error) {
      notify({ type: 'error', message: error.message })
      throw error
    }

    // ✅ update local
    setRendezVous(prev => [...prev, data])

    notify({ type: 'rdv', message: `RDV ajouté` })
  }

  // 🔥 MODIFICATION optimisée
  const modifierRdv = async (id, r) => {
    const { data, error } = await supabase
      .from('rendez_vous')
      .update(r)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      notify({ type: 'error', message: error.message })
      throw error
    }

    // ✅ update local
    setRendezVous(prev =>
      prev.map(item => item.id === id ? data : item)
    )

    notify({ type: 'rdv', message: `RDV modifié` })
  }

  // 🔥 ANNULATION optimisée
  const annulerRdv = async (id) => {
    const { error } = await supabase
      .from('rendez_vous')
      .update({ statut: 'annule' })
      .eq('id', id)

    if (error) {
      notify({ type: 'error', message: error.message })
      throw error
    }

    // ✅ update local
    setRendezVous(prev =>
      prev.map(r =>
        r.id === id ? { ...r, statut: 'annule' } : r
      )
    )

    notify({ type: 'rdv', message: `RDV annulé` })
  }

  return {
    rendezVous,
    loading,
    ajouterRdv,
    modifierRdv,
    annulerRdv,
    refresh: fetch
  }
}