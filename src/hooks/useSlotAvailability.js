import { supabase } from '../lib/supabase'

export async function checkSlotAvailability(date, heure, medecinId, excludeRdvId = null) {
  const query = supabase
    .from('rendez_vous')
    .select('id, heure, duree')
    .eq('date', date)
    .eq('medecin_id', medecinId)
    .neq('statut', 'annule')

  if (excludeRdvId) {
    query.neq('id', excludeRdvId)
  }

  const { data: conflictingRdv } = await query

  if (!conflictingRdv || conflictingRdv.length === 0) {
    return { available: true, alternatives: [] }
  }

  // Convertir les horaires en minutes pour comparaison
  const [newHour, newMin] = heure.split(':').map(Number)
  const newTimeInMinutes = newHour * 60 + newMin

  for (const rdv of conflictingRdv) {
    const [existingHour, existingMin] = rdv.heure.split(':').map(Number)
    const existingTimeInMinutes = existingHour * 60 + existingMin
    const existingEndTime = existingTimeInMinutes + (rdv.duree || 30)
    const newEndTime = newTimeInMinutes + 30

    // Chevauchement si : nouveau start < existing end ET nouveau end > existing start
    if (newTimeInMinutes < existingEndTime && newEndTime > existingTimeInMinutes) {
      return { available: false, alternatives: [] }
    }
  }

  return { available: true, alternatives: [] }
}

export async function getAvailableSlots(date, medecinId, duration = 30) {
  // Récupérer tous les RDV du médecin ce jour-là
  const { data: existingRdv } = await supabase
    .from('rendez_vous')
    .select('heure, duree')
    .eq('date', date)
    .eq('medecin_id', medecinId)
    .neq('statut', 'annule')

  // Créneaux de travail : 08:00 à 18:00
  const workStart = 8 * 60 // 8:00 en minutes
  const workEnd = 18 * 60 // 18:00 en minutes
  const slots = []
  const booked = new Set()

  // Marquer les créneaux occupés
  if (existingRdv && existingRdv.length > 0) {
    for (const rdv of existingRdv) {
      const [h, m] = rdv.heure.split(':').map(Number)
      const start = h * 60 + m
      const end = start + (rdv.duree || 30)
      for (let i = start; i < end; i += 15) {
        booked.add(i)
      }
    }
  }

  // Générer les créneaux disponibles
  for (let time = workStart; time + duration <= workEnd; time += 15) {
    let available = true
    for (let i = time; i < time + duration; i += 15) {
      if (booked.has(i)) {
        available = false
        break
      }
    }

    if (available) {
      const h = Math.floor(time / 60).toString().padStart(2, '0')
      const m = (time % 60).toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
  }

  return slots
}
