import { useState, useEffect } from 'react'
import { convertTo12Hour } from '../utils/timeConversion'

export default function TimePickerAmPm({ value, onChange, required = false }) {
  const [timeInput, setTimeInput] = useState('')
  const [display12h, setDisplay12h] = useState('')

  // Convertir la valeur 24h en format input time et afficher en 12h
  useEffect(() => {
    if (value) {
      setTimeInput(value)
      setDisplay12h(convertTo12Hour(value))
    } else {
      setTimeInput('')
      setDisplay12h('')
    }
  }, [value])

  const handleTimeChange = (e) => {
    const val = e.target.value
    if (val) {
      setTimeInput(val)
      onChange(val)
      setDisplay12h(convertTo12Hour(val))
    } else {
      setTimeInput('')
      onChange('')
      setDisplay12h('')
    }
  }

  return (
    <div className="mb-3">
      <label className="block text-xs font-medium mb-1 text-gray-700">
        Heure <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2 items-end">
        <input
          type="time"
          value={timeInput}
          onChange={handleTimeChange}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        />
        {display12h && (
          <div className="px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg border border-teal-200 whitespace-nowrap">
            {display12h}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Heure sélectionnée affichée automatiquement en AM/PM
      </p>
    </div>
  )
}
