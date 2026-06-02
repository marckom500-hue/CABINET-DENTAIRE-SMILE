import { useState } from 'react'
import { useMedecinRdv } from '../hooks/useMedecinRdv'
import { RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'
import CalendarView from '../components/CalendarView'

export default function MedecinRdv() {
  const { rdvMedecin, loading, getRdvParJour, getRdvParSemaine, getRdvParMois } = useMedecinRdv()
  const [viewMode, setViewMode] = useState('jour') // 'jour', 'semaine', 'mois'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  let rdvAffichees = []
  let titre = ''

  if (viewMode === 'jour') {
    rdvAffichees = getRdvParJour(selectedDate)
    titre = `RDV du ${new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`
  } else if (viewMode === 'semaine') {
    const dateDebut = new Date(selectedDate)
    rdvAffichees = getRdvParSemaine(dateDebut)
    const dateFin = new Date(dateDebut)
    dateFin.setDate(dateFin.getDate() + 6)
    titre = `RDV de la semaine du ${dateDebut.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} au ${dateFin.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`
  } else if (viewMode === 'mois') {
    rdvAffichees = getRdvParMois(currentYear, currentMonth)
    titre = `RDV de ${new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
  }

  const handlePrevious = () => {
    const date = new Date(selectedDate)
    if (viewMode === 'jour') {
      date.setDate(date.getDate() - 1)
    } else if (viewMode === 'semaine') {
      date.setDate(date.getDate() - 7)
    }
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleNext = () => {
    const date = new Date(selectedDate)
    if (viewMode === 'jour') {
      date.setDate(date.getDate() + 1)
    } else if (viewMode === 'semaine') {
      date.setDate(date.getDate() + 7)
    }
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Mes Rendez-vous</h2>
        <p className="text-sm text-gray-500">{rdvMedecin.length} rendez-vous au total</p>
      </div>

      {/* Sélecteur de vue */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['jour', 'semaine', 'mois'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize ${
                viewMode === mode ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode === 'jour' ? 'Jour' : mode === 'semaine' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>

        {/* Navigation */}
        {viewMode !== 'mois' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Titre */}
      <h3 className="text-lg font-semibold text-gray-900">{titre}</h3>

      {/* Liste des RDV */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : rdvAffichees.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucun rendez-vous pour cette période</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Date', 'Heure', 'Patient', 'Acte', 'Durée', 'Statut'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rdvAffichees.map(r => {
                  const s = RDV_STATUS_META[normalizeRdvStatus(r.statut)] ?? RDV_STATUS_META['attente']
                  const patient = r.patients
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{r.heure}</td>
                      <td className="px-4 py-3 text-gray-900">
                        {patient ? `${patient.prenom} ${patient.nom}` : `ID: ${r.patient_id}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.type_acte}</td>
                      <td className="px-4 py-3 text-gray-500">{r.duree} min</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total RDV</p>
          <p className="text-2xl font-bold text-gray-900">{rdvAffichees.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Confirmés</p>
          <p className="text-2xl font-bold text-green-600">
            {rdvAffichees.filter(r => normalizeRdvStatus(r.statut) === 'confirme').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">
            {rdvAffichees.filter(r => normalizeRdvStatus(r.statut) === 'attente').length}
          </p>
        </div>
      </div>
    </div>
  )
}
