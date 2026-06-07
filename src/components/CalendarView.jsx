import { useState } from 'react'
import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'

export default function CalendarView({ rendezVous = [], onRdvClick, onDateClick, loading = false }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedRdv, setDraggedRdv] = useState(null)

  // Obtenir les jours du mois
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  // getDay(): 0=Dimanche, 1=Lundi... 6=Samedi
  // On veut: 0=Lundi, 1=Mardi... 6=Dimanche
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

  // Créer la grille du calendrier
  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }
  while (days.length % 7 !== 0) {
    days.push(null)
  }

  // Grouper les RDV par date
  const rdvByDate = {}
  rendezVous.forEach(rdv => {
    const dateKey = rdv.date ? rdv.date.split('T')[0] : null
    if (dateKey) {
      if (!rdvByDate[dateKey]) rdvByDate[dateKey] = []
      rdvByDate[dateKey].push(rdv)
    }
  })

  // Naviguer mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Formater une date pour la clé
  const formatDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date) => {
    return date.getMonth() === month && date.getFullYear() === year
  }

  // Drag & Drop handlers
  const handleDragStart = (e, rdv) => {
    setDraggedRdv(rdv)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetDate) => {
    e.preventDefault()
    if (!draggedRdv) return

    const newDate = formatDateKey(targetDate)
    const oldDate = draggedRdv.date
    
    if (newDate !== oldDate) {
      onRdvClick({ ...draggedRdv, date: newDate, action: 'move' })
    }
    setDraggedRdv(null)
  }

  const handleDragEnd = () => {
    setDraggedRdv(null)
  }

  // Nombres de semaines à afficher
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(currentDate)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{monthName}</h3>
          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
          <div key={day} className="p-3 text-center text-xs font-semibold text-gray-600 bg-gray-50 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="bg-gray-50">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0 border-b border-gray-200 last:border-b-0">
            {week.map((date, dayIndex) => {
              const dateKey = date ? formatDateKey(date) : null
              const dayRdv = dateKey ? rdvByDate[dateKey] || [] : []
              const isCurrent = date && isCurrentMonth(date)
              const isCurrentDay = date && isToday(date)

              return (
                <div
                  key={dayIndex}
                  onDragOver={handleDragOver}
                  onDrop={(e) => date && handleDrop(e, date)}
                  onClick={() => date && onDateClick && onDateClick(date)}
                  className={`
                    min-h-[120px] p-2 border-r border-gray-200 last:border-r-0 cursor-pointer transition-colors
                    ${isCurrentDay ? 'bg-teal-50' : isCurrent ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'}
                  `}
                >
                  {/* Date number */}
                  {date && (
                    <div className={`text-xs font-semibold mb-1 ${
                      isCurrentDay ? 'text-teal-600' : isCurrent ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>
                  )}

                  {/* RDV items */}
                  <div className="space-y-1">
                    {dayRdv.slice(0, 3).map((rdv, idx) => {
                      const statut = normalizeRdvStatus(rdv.statut)
                      const meta = RDV_STATUS_META[statut]
                      
                      if (!meta) return null
                      
                      return (
                        <div
                          key={rdv.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, rdv)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            e.stopPropagation()
                            onRdvClick(rdv)
                          }}
                          className={`
                            text-xs p-1.5 rounded cursor-move transition-all
                            ${meta.cls}
                            hover:shadow-md hover:scale-105
                            ${draggedRdv?.id === rdv.id ? 'opacity-50' : 'opacity-100'}
                          `}
                        >
                          <div className="font-medium truncate">{rdv.heure}</div>
                          <div className="text-xs truncate">
                            {rdv.patients?.prenom || 'Patient'}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Plus indicator */}
                    {dayRdv.length > 3 && (
                      <div className="text-xs text-gray-500 pl-1">
                        +{dayRdv.length - 3} autre{dayRdv.length > 4 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
