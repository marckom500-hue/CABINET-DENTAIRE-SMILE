import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'

/**
 * Hook pour détecter et marquer automatiquement les RDV passés non terminés comme absents
 * Exécution: toutes les minutes ou au montage du composant
 */
export function useMissedAppointmentsDetector() {
  const { notify } = useNotifications()

  useEffect(() => {
    const detectAndMarkMissed = async () => {
      try {
        // Obtenir l'heure actuelle
        const now = new Date()
        const currentDate = now.toISOString().split('T')[0]
        const currentTime = now.toTimeString().slice(0, 5) // Format HH:mm

        // Trouver les RDV:
        // - Dont la date+heure est passée
        // - Dont le statut n'est pas 'terminé' ou 'annulé'
        const { data: missedRdv, error: fetchError } = await supabase
          .from('rendez_vous')
          .select('id, date, heure, statut, patients(prenom, nom), duree')
          .neq('statut', 'terminé')
          .neq('statut', 'annulé')
          .or(`date.lt.${currentDate},and(date.eq.${currentDate},heure.lt.${currentTime})`)

        if (fetchError) {
          console.error('[useMissedAppointmentsDetector] Erreur fetch:', fetchError)
          return
        }

        if (!missedRdv || missedRdv.length === 0) {
          return
        }

        // Pour chaque RDV passé non terminé, marquer comme absent
        const updates = missedRdv.map(rdv => 
          supabase
            .from('rendez_vous')
            .update({ 
              statut: 'terminé', 
              patient_present: false 
            })
            .eq('id', rdv.id)
        )

        const results = await Promise.all(updates)

        // Vérifier les erreurs
        const errors = results.filter(r => r.error)
        if (errors.length > 0) {
          console.error('[useMissedAppointmentsDetector] Erreurs lors de la mise à jour:', errors)
          return
        }

        // Notifier si des RDV ont été marqués comme absents
        if (missedRdv.length > 0) {
          const absentPatients = missedRdv
            .map(rdv => `${rdv.patients?.prenom} ${rdv.patients?.nom}`)
            .join(', ')

          notify({
            type: 'warning',
            message: `${missedRdv.length} patient(s) marqué(s) absent: ${absentPatients}`
          })

          console.log(`[useMissedAppointmentsDetector] ${missedRdv.length} RDV marqués comme absents`)
        }
      } catch (err) {
        console.error('[useMissedAppointmentsDetector] Exception:', err)
      }
    }

    // Exécuter au montage
    detectAndMarkMissed()

    // Puis toutes les minutes pour mettre à jour en temps réel
    const interval = setInterval(detectAndMarkMissed, 60000) // 60 secondes

    return () => clearInterval(interval)
  }, [notify])
}
