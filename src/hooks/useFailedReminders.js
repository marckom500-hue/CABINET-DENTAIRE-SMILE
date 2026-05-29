import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFailedReminders() {
  const [failedReminders, setFailedReminders] = useState([])
  const [retryQueue, setRetryQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadReminders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Rappels échoués
      const { data: failed, error: failedError } = await supabase
        .from('rappels_sms')
        .select(`
          id,
          rdv_id,
          statut,
          message,
          erreur,
          tentatives,
          derniere_tentative,
          rendez_vous(id, date, heure, type_acte, patient_id, patients(id, nom, prenom, telephone))
        `)
        .in('statut', ['echec_permanent', 'echec'])
        .order('derniere_tentative', { ascending: false })

      if (failedError) throw failedError

      // Queue de retry
      const { data: pending, error: pendingError } = await supabase
        .from('rappels_retry_queue')
        .select(`
          id,
          rappel_sms_id,
          rdv_id,
          patient_id,
          telephone,
          message,
          tentatives_restantes,
          prochain_retry,
          raison_echec,
          rendez_vous(id, date, heure, type_acte, patients(id, nom, prenom))
        `)
        .gt('tentatives_restantes', 0)
        .order('prochain_retry', { ascending: true })

      if (pendingError) throw pendingError

      setFailedReminders(failed || [])
      setRetryQueue(pending || [])
    } catch (err) {
      console.error('Erreur chargement rappels:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReminders()
    const interval = setInterval(loadReminders, 30000)
    return () => clearInterval(interval)
  }, [loadReminders])

  const retryReminder = useCallback(async (reminderId) => {
    try {
      const reminder = failedReminders.find(r => r.id === reminderId)
      if (!reminder) throw new Error('Rappel non trouvé')

      const session = await supabase.auth.getSession()
      if (!session.data.session) throw new Error('Non authentifié')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-rappel-rdv`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`,
          },
          body: JSON.stringify({ rdv_id: reminder.rdv_id }),
        }
      )

      const result = await response.json()

      if (result.success) {
        await supabase
          .from('rappels_sms')
          .update({ statut: 'envoye' })
          .eq('id', reminderId)

        await supabase
          .from('rappels_retry_queue')
          .delete()
          .eq('rappel_sms_id', reminderId)
      } else {
        await supabase.rpc('add_to_retry_queue', {
          p_rappel_sms_id: reminderId,
          p_rdv_id: reminder.rdv_id,
          p_patient_id: reminder.rendez_vous?.patient_id,
          p_telephone: reminder.rendez_vous?.patients?.telephone,
          p_message: reminder.message,
          p_raison_echec: result.error || 'Erreur lors du renvoi',
          p_tentatives_restantes: 2,
        })
      }

      await loadReminders()
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      throw err
    }
  }, [failedReminders, loadReminders])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await supabase
        .from('rappels_notifications')
        .update({ lue: true })
        .eq('id', notificationId)
    } catch (err) {
      console.error('Erreur marquage notification:', err)
    }
  }, [])

  const getStats = useCallback(() => {
    return {
      totalFailed: failedReminders.length,
      totalPending: retryQueue.length,
      totalIssues: failedReminders.length + retryQueue.length,
    }
  }, [failedReminders, retryQueue])

  return {
    failedReminders,
    retryQueue,
    loading,
    error,
    loadReminders,
    retryReminder,
    markAsRead,
    getStats,
  }
}

export function useReminderNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await supabase
          .from('rappels_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        setNotifications(data || [])
        setUnreadCount((data || []).filter(n => !n.lue).length)
      } catch (err) {
        console.error('Erreur chargement notifications:', err)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await supabase
        .from('rappels_notifications')
        .update({ lue: true })
        .eq('id', notificationId)

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, lue: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Erreur marquage notification:', err)
    }
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
  }
}
