import { useState } from 'react'
import { useRendezVous } from '../hooks/useRendezVous'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormulaireRdv from '../components/FormulaireRdv'
import { PermissionGate } from '../components/RoleGuard'
import CalendarView from '../components/CalendarView'
import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'

const FILTERS = [
  { key: 'tous', label: 'Tous' },
  { key: "aujourd'hui", label: "Aujourd'hui" },
  { key: RDV_STATUS.PROGRAMME, label: 'Programmés' },
  { key: 'confirmé', label: 'Confirmés' },
  { key: RDV_STATUS.TERMINE, label: 'Terminés' },
  { key: RDV_STATUS.ANNULE, label: 'Annulés' },
]

export default function RendezVous() {
  const { rendezVous, loading, ajouterRdv, modifierRdv, annulerRdv } = useRendezVous()
  const [modal, setModal] = useState(false)
  const [editR, setEditR] = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [filtre, setFiltre] = useState('tous')
  const [viewMode, setViewMode] = useState('list')

  const today = new Date().toISOString().split('T')[0]

  const filtered = rendezVous.filter(r => {
    if (filtre === "aujourd'hui") return r.date === today
    if (filtre !== 'tous') return normalizeRdvStatus(r.statut) === filtre
    return true
  })

  const openCreate = () => { setEditR(null); setModal(true) }
  const openEdit = (r) => { setEditR(r); setModal(true) }

  const handleSubmit = async (data) => {
    if (editR && editR.id) await modifierRdv(editR.id, data)
    else await ajouterRdv(data)
    setModal(false)
  }

  const handleCalendarRdvClick = (rdv) => {
    if (rdv.action === 'move') modifierRdv(rdv.id, { date: rdv.date })
    else {
      setEditR(rdv)
      setModal(true)
    }
  }

  const handleCalendarDateClick = (date) => {
    setEditR({ date })
    setModal(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Rendez-vous</h2>
          <p className="text-sm text-gray-500">{rendezVous.length} rendez-vous au total</p>
        </div>
        <PermissionGate module="rendez_vous" requireWrite>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau RDV
          </button>
        </PermissionGate>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              viewMode === 'list' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Liste
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              viewMode === 'calendar' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendrier
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFiltre(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filtre === f.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      {viewMode === 'calendar' && (
        <CalendarView
          rendezVous={filtered}
          onRdvClick={handleCalendarRdvClick}
          onDateClick={handleCalendarDateClick}
          loading={loading}
        />
      )}

      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Date', 'Heure', 'Patient', 'Médecin', 'Acte', 'Duree', 'Statut', 'Présence', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">Chargement...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">Aucun rendez-vous trouve</td></tr>
                ) : filtered.map(r => {
                  const s = RDV_STATUS_META[normalizeRdvStatus(r.statut)] ?? RDV_STATUS_META[RDV_STATUS.PROGRAMME]
                  const patient = r.patients
                  const medecin = r.users_profiles
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {new Date(r.date).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.heure}</td>
                      <td className="px-4 py-3 text-gray-900">
                        {patient ? `${patient.prenom} ${patient.nom}` : `ID: ${r.patient_id}`}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'Non assigné'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.type_acte}</td>
                      <td className="px-4 py-3 text-gray-500">{r.duree} min</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {r.statut === 'terminé' && (
                          r.patient_present === true ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">✓ Présent</span>
                          ) : r.patient_present === false ? (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-medium">✗ Absent</span>
                          ) : null
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PermissionGate module="rendez_vous" requireWrite>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => setConfirmD(r)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </PermissionGate>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editR ? 'Modifier le RDV' : 'Nouveau rendez-vous'} confirmOnClose>
        <FormulaireRdv rdv={editR} onSubmit={handleSubmit} onCancel={() => setModal(false)} />
      </Modal>
      <ConfirmDialog isOpen={!!confirmD} onConfirm={async () => { try { await annulerRdv(confirmD.id); setConfirmD(null) } catch {} }}
        onCancel={() => setConfirmD(null)} title="Annuler le RDV"
        message="Êtes-vous sûr de vouloir annuler ce rendez-vous ?"
        confirmLabel="Annuler"
        tone="warning" />
    </div>
  )
}
