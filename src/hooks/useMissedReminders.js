import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useMissedReminders() {
  const [missedReminders, setMissedReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  // Fonction pour charger les rappels manqués
  const loadMissedReminders = useCallback(async () => {
    try {
      console.log('[useMissedReminders] Début chargement...')
      
      const { data, error } = await supabase
        .from('rappels_sms')
        .select(`
          id,
          rdv_id,
          statut,
          message,
          erreur,
          tentatives,
          created_at,
          rendez_vous!inner(
            id, 
            date, 
            heure, 
            type_acte, 
            patient_id,
            patients(
              id,
              nom, 
              prenom, 
              telephone
            )
          )
        `)
        .in('statut', ['echec_permanent', 'echec', 'echec_temporaire'])
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('[useMissedReminders] Erreur Supabase:', error)
        setMissedReminders([])
        return
      }

      console.log('[useMissedReminders] Données brutes:', data)
      
      // Filtrer les rappels qui ont des données valides
      const validReminders = (data || []).filter(r => {
        return r.rendez_vous && r.rendez_vous.patients
      })
      
      console.log('[useMissedReminders] Rappels valides:', validReminders.length)
      setMissedReminders(validReminders)
    } catch (error) {
      console.error('[useMissedReminders] Erreur chargement:', error)
      setMissedReminders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Charger les rappels au montage
    loadMissedReminders()

    // Rafraîchissement périodique (30 secondes)
    const interval = setInterval(loadMissedReminders, 30000)

    // Subscription temps réel pour les mises à jour immédiates
    channelRef.current = supabase
      .channel('rappels_sms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rappels_sms',
          filter: `statut=in.(echec_permanent,echec,echec_temporaire)`
        },
        (payload) => {
          console.log('[useMissedReminders] Changement détecté:', payload)
          // Recharger les données quand un changement est détecté
          loadMissedReminders()
        }
      )
      .subscribe()

    // Nettoyage
    return () => {
      clearInterval(interval)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [loadMissedReminders])

  return { missedReminders, loading }
}
