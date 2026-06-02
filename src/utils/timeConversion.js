/**
 * Convertit une heure au format 24h (HH:MM) en format 12h (h:MM AM/PM)
 * @param {string} time24 - Heure au format 24h (ex: "14:30")
 * @returns {string} - Heure au format 12h (ex: "2:30 PM")
 */
export function convertTo12Hour(time24) {
  if (!time24) return ''
  
  const [hours, minutes] = time24.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Convertit une heure au format 12h (h:MM AM/PM) en format 24h (HH:MM)
 * @param {string} time12 - Heure au format 12h (ex: "2:30 PM")
 * @returns {string} - Heure au format 24h (ex: "14:30")
 */
export function convertTo24Hour(time12) {
  if (!time12) return ''
  
  const [time, period] = time12.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Formate une heure en format 24h lisible (HH:MM → HHhMM)
 * @param {string} time24 - Heure au format 24h (ex: "14:30")
 * @returns {string} - Format lisible (ex: "14h30")
 */
export function formatTime24hReadable(time24) {
  if (!time24) return ''
  return time24.replace(':', 'h')
}

/**
 * Teste les conversions
 * Exemples :
 * - "09:00" → "9:00 AM"
 * - "14:30" → "2:30 PM"
 * - "2:30 PM" → "14:30"
 * - "9:00 AM" → "09:00"
 */
