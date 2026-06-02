import { useState, useEffect } from 'react'
import { convertTo12Hour, convertTo24Hour } from '../utils/timeConversion'

export default function TimePickerAmPm({ value, onChange, required = false }) {
  const [display, setDisplay] = useState('')
  const [error, setError] = useState('')

  // Convertir la valeur 24h stockée en 12h pour l'affichage
  useEffect(() => {
    if (value) {
      setDisplay(convertTo12Hour(value))
    } else {
      setDisplay('')
    }
  }, [value])

  const handleChange = (e) => {
    const input = e.target.value.trim()
    setError('')

    if (!input) {
      setDisplay('')
      onChange('')
      return
    }

    // Accepter les formats :
    // "2:30 PM", "2:30PM", "14:30", "2:30 PM", etc.
    const cleanInput = input.toUpperCase().replace(/\s+/g, '')

    // Vérifier si c'est du format 12h (avec AM/PM)
    const match12h = cleanInput.match(/^(\d{1,2}):(\d{2})(AM|PM)$/)
    if (match12h) {
      const [, hours, minutes, period] = match12h
      let h = parseInt(hours, 10)
      const m = parseInt(minutes, 10)

      // Valider les heures et minutes
      if (h < 1 || h > 12 || m < 0 || m > 59) {
        setError('Format invalide')
        return
      }

      const time24 = convertTo24Hour(`${h}:${String(m).padStart(2, '0')} ${period}`)
      onChange(time24)
      setDisplay(`${h}:${String(m).padStart(2, '0')} ${period}`)
      return
    }

    // Sinon, considérer comme format 24h
    const match24h = input.match(/^(\d{1,2}):(\d{2})$/)
    if (match24h) {
      const [, hours, minutes] = match24h
      let h = parseInt(hours, 10)
      const m = parseInt(minutes, 10)

      // Valider
      if (h < 0 || h > 23 || m < 0 || m > 59) {
        setError('Format invalide')
        return
      }

      const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      onChange(time24)
      setDisplay(convertTo12Hour(time24))
      return
    }

    setError('Format invalide (utilisez HH:MM ou H:MM AM/PM)')
  }

  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1 text-gray-700">
        Heure <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={display}
        onChange={handleChange}
        placeholder="2:30 PM ou 14:30"
        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors border-gray-200"
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      <p className="text-xs text-gray-400 mt-1">
        Format accepté : 2:30 PM ou 14:30
      </p>
    </div>
  )
}
