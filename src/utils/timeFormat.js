/**
 * Formate une heure au format 24h lisible
 * @param {string} timeString - Heure au format HH:MM
 * @returns {string} - Heure formatée (ex: "13h00" ou "01h00")
 */
export function formatTimeHuman(timeString) {
  if (!timeString) return ''
  
  const [hours, minutes] = timeString.split(':')
  const h = parseInt(hours, 10)
  const m = parseInt(minutes, 10)
  
  // Format : "13h00" ou "08h30"
  return `${h.toString().padStart(2, '0')}h${m.toString().padStart(2, '0')}`
}

/**
 * Formate une date et heure pour les notifications
 * @param {string} date - Date au format YYYY-MM-DD
 * @param {string} timeString - Heure au format HH:MM
 * @returns {string} - Formaté comme "02/06/2026 à 13h00"
 */
export function formatDateTimeForNotification(date, timeString) {
  if (!date || !timeString) return ''
  
  // Convertir la date
  const dateObj = new Date(date + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  
  // Formater l'heure
  const formattedTime = formatTimeHuman(timeString)
  
  return `${formattedDate} à ${formattedTime}`
}
