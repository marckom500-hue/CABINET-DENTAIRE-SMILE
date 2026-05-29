import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function RappelsFailedSMS() {
  const [failedReminders, setFailedReminders] = useState([])
  const [retryQueue, setRetryQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(null)

  useEffect(() => {
    loadFailedReminders()
    const interval = setInterval(loadFailedReminders, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadFailedReminders = async () => {
    try {
      // Rappels échoués permanents - Inclure aussi echec_temporaire
      const { data: failed } = await supabase
        .from('rappels_sms')
        .select(`
          id,
          rdv_id,
          statut,
          message,
          erreur,
          tentatives,
          derniere_tentative,
          created_at,
          rendez_vous(id, date, heure, type_acte, patients(nom, prenom, telephone))
        `)
        .in('statut', ['echec_permanent', 'echec', 'echec_temporaire'])
        .limit(100)

      // Trier par date du RDV (plus proche en premier)
      const sortedFailed = (failed || []).sort((a, b) => {
        const dateA = new Date(a.rendez_vous?.date || '9999-12-31')
        const dateB = new Date(b.rendez_vous?.date || '9999-12-31')
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime()
        }
        // Si même date, trier par heure
        const heureA = a.rendez_vous?.heure || '00:00'
        const heureB = b.rendez_vous?.heure || '00:00'
        return heureA.localeCompare(heureB)
      })

      // Rappels en attente de retry
      const { data: pending } = await supabase
        .from('rappels_retry_queue')
        .select(`
          id,
          rappel_sms_id,
          rdv_id,
          telephone,
          tentatives_restantes,
          prochain_retry,
          raison_echec,
          rendez_vous(date, heure, type_acte, patients(nom, prenom))
        `)
        .gt('tentatives_restantes', 0)
        .order('prochain_retry', { ascending: true })

      setFailedReminders(sortedFailed || [])
      setRetryQueue(pending || [])
    } catch (error) {
      console.error('Erreur chargement rappels:', error)
    } finally {
      setLoading(false)
    }
  }

  const retryManually = async (reminderId) => {
    setRetrying(reminderId)
    try {
      const reminder = failedReminders.find(r => r.id === reminderId)
      if (!reminder) return

      // Appeler l'Edge Function pour renvoyer le SMS
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-rappel-rdv`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ rdv_id: reminder.rdv_id }),
        }
      )

      const result = await response.json()

      if (result.success) {
        // Marquer comme succès
        await supabase
          .from('rappels_sms')
          .update({ statut: 'envoye' })
          .eq('id', reminderId)

        // Supprimer de la queue de retry
        await supabase
          .from('rappels_retry_queue')
          .delete()
          .eq('rappel_sms_id', reminderId)

        loadFailedReminders()
      } else {
        // Ajouter à la queue de retry
        await supabase.rpc('add_to_retry_queue', {
          p_rappel_sms_id: reminderId,
          p_rdv_id: reminder.rdv_id,
          p_patient_id: reminder.rendez_vous?.patients?.id,
          p_telephone: reminder.rendez_vous?.patients?.telephone,
          p_message: reminder.message,
          p_raison_echec: result.error || 'Erreur lors du renvoi',
          p_tentatives_restantes: 2,
        })

        loadFailedReminders()
      }
    } catch (error) {
      console.error('Erreur renvoi SMS:', error)
    } finally {
      setRetrying(null)
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Chargement...</div>
  }

  const totalFailed = failedReminders.length
  const totalPending = retryQueue.length

  return (
    <div className="space-y-6">
      {/* Résumé */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">Rappels échoués</p>
          <p className="text-2xl font-bold text-red-700">{totalFailed}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-600 font-medium">En attente de renvoi</p>
          <p className="text-2xl font-bold text-amber-700">{totalPending}</p>
        </div>
      </div>

      {/* Rappels échoués */}
      {totalFailed > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200">
            <h3 className="font-semibold text-red-900">Rappels échoués</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {failedReminders.map(reminder => (
              <div key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {reminder.rendez_vous?.patients?.prenom} {reminder.rendez_vous?.patients?.nom}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      RDV: {reminder.rendez_vous?.date} à {reminder.rendez_vous?.heure}
                    </p>
                    <p className="text-sm text-gray-600">
                      Type: {reminder.rendez_vous?.type_acte}
                    </p>
                    {reminder.erreur && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">
                        {reminder.erreur}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Tentatives: {reminder.tentatives || 1} | Dernière: {new Date(reminder.derniere_tentative).toLocaleString('fr-CM')}
                    </p>
                  </div>
                  <button
                    onClick={() => retryManually(reminder.id)}
                    disabled={retrying === reminder.id}
                    className="px-3 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {retrying === reminder.id ? 'Renvoi...' : 'Renvoyer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue de retry */}
      {totalPending > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
            <h3 className="font-semibold text-amber-900">En attente de renvoi automatique</h3>
            <p className="text-xs text-amber-700 mt-1">Ces rappels seront renvoyés automatiquement</p>
          </div>
          <div className="divide-y divide-gray-200">
            {retryQueue.map(item => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {item.rendez_vous?.patients?.prenom} {item.rendez_vous?.patients?.nom}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      RDV: {item.rendez_vous?.date} à {item.rendez_vous?.heure}
                    </p>
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                      {item.raison_echec}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Tentatives restantes: {item.tentatives_restantes} | Prochain renvoi: {new Date(item.prochain_retry).toLocaleString('fr-CM')}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                    En attente
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalFailed === 0 && totalPending === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-700 font-medium">✓ Tous les rappels SMS sont à jour</p>
        </div>
      )}
    </div>
  )
}
