import { supabase } from '../lib/supabase'
import { RDV_STATUS, normalizeRdvStatus } from '../lib/statuses'

function timeToMinutes(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

export async function checkSlotAvailability(date, heure, medecinId, excludeRdvId = null, duration = 30) {
  const query = supabase
    .from('rendez_vous')
    .select('id, heure, duree, statut')
    .eq('date', date)
    .eq('medecin_id', medecinId)

  if (excludeRdvId) {
    query.neq('id', excludeRdvId)
  }

  const { data: conflictingRdv } = await query

  if (!conflictingRdv || conflictingRdv.length === 0) {
    return { available: true, alternatives: [] }
  }

  const activeRdv = conflictingRdv.filter(rdv => normalizeRdvStatus(rdv.statut) !== RDV_STATUS.ANNULE)
  if (activeRdv.length === 0) {
    return { available: true, alternatives: [] }
  }

  const newTimeInMinutes = timeToMinutes(heure)
  if (newTimeInMinutes == null) {
    return { available: false, alternatives: [] }
  }

  for (const rdv of activeRdv) {
    const existingTimeInMinutes = timeToMinutes(rdv.heure)
    if (existingTimeInMinutes == null) continue
    const existingEndTime = existingTimeInMinutes + (rdv.duree || 30)
    const newEndTime = newTimeInMinutes + duration

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
    .select('heure, duree, statut')
    .eq('date', date)
    .eq('medecin_id', medecinId)

  // Créneaux de travail : 08:00 à 18:00
  const workStart = 8 * 60 // 8:00 en minutes
  const workEnd = 18 * 60 // 18:00 en minutes
  const slots = []
  const booked = new Set()

  // Marquer les créneaux occupés
  if (existingRdv && existingRdv.length > 0) {
    for (const rdv of existingRdv.filter(r => normalizeRdvStatus(r.statut) !== RDV_STATUS.ANNULE)) {
      const start = timeToMinutes(rdv.heure)
      if (start == null) continue
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
