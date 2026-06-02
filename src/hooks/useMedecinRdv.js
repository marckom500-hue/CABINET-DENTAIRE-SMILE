import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotifications } from './NotificationsContext'
import { useAuth } from './useAuth'

export function useMedecinRdv() {
  const [rdvMedecin, setRdvMedecin] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotifications()
  const { user } = useAuth()

  const fetch = async () => {
    if (!user?.id) return
    setLoading(true)
    const { data } = await supabase
      .from('rendez_vous')
      .select('*, patients(nom, prenom, telephone)')
      .eq('medecin_id', user.id)
      .order('date', { ascending: true })
    setRdvMedecin(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [user?.id])

  const getRdvParJour = (date) => {
    return rdvMedecin.filter(r => r.date === date)
  }

  const getRdvParSemaine = (dateDebut) => {
    const dateFin = new Date(dateDebut)
    dateFin.setDate(dateFin.getDate() + 6)
    return rdvMedecin.filter(r => {
      const rdvDate = new Date(r.date)
      return rdvDate >= dateDebut && rdvDate <= dateFin
    })
  }

  const getRdvParMois = (annee, mois) => {
    return rdvMedecin.filter(r => {
      const rdvDate = new Date(r.date)
      return rdvDate.getFullYear() === annee && rdvDate.getMonth() === mois
    })
  }

  return {
    rdvMedecin,
    loading,
    getRdvParJour,
    getRdvParSemaine,
    getRdvParMois,
    refresh: fetch
  }
}
