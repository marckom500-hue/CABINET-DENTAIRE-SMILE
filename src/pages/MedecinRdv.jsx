import { useState } from 'react'
import { useMedecinRdv } from '../hooks/useMedecinRdv'
import { useMissedAppointmentsDetector } from '../hooks/useMissedAppointmentsDetector'
import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotifications } from '../hooks/NotificationsContext'
import { supabase } from '../lib/supabase'

export default function MedecinRdv() {
  const { rdvMedecin, loading, getRdvParJour, getRdvParSemaine, getRdvParMois, confirmerRdv, annulerRdv } = useMedecinRdv()
  useMissedAppointmentsDetector() // Détecter et marquer automatiquement les absents
  const { notify } = useNotifications()
  const [viewMode, setViewMode] = useState('jour')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [terminantRdv, setTerminantRdv] = useState(null)

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

  // Confirmer RDV: programmé → confirmé (médecin approuve)
  const handleConfirmerRdv = async (id) => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ statut: 'confirmé' })
        .eq('id', id)
      
      if (error) throw error
      notify({ type: 'success', message: 'RDV confirmé ✓' })
    } catch (err) {
      notify({ type: 'error', message: 'Erreur lors de la confirmation' })
    }
  }

  // Terminer RDV: confirmé → terminé + patient_present=true
  const handleTerminerRdv = async (rdv) => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ statut: 'terminé', patient_present: true })
        .eq('id', rdv.id)
      
      if (error) throw error
      notify({ type: 'success', message: 'RDV terminé ✓' })
      setTerminantRdv(null)
    } catch (err) {
      notify({ type: 'error', message: 'Erreur lors de la fin du RDV' })
    }
  }

  // Marquer absent: confirmé → terminé + patient_present=false
  const handleMarquerAbsent = async (rdv) => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ statut: 'terminé', patient_present: false })
        .eq('id', rdv.id)
      
      if (error) throw error
      notify({ type: 'success', message: 'Patient marqué absent ✗' })
      setTerminantRdv(null)
    } catch (err) {
      notify({ type: 'error', message: 'Erreur lors du marquage absent' })
    }
  }

  // Annuler RDV
  const handleAnnulerRdv = async () => {
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ statut: 'annulé' })
        .eq('id', confirmDialog.id)
      
      if (error) throw error
      notify({ type: 'success', message: 'RDV annulé' })
      setConfirmDialog(null)
    } catch (err) {
      notify({ type: 'error', message: 'Erreur lors de l\'annulation' })
    }
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

      {/* Guide d'utilisation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <strong>Workflow médecin:</strong> Programmé → 
        <span className="font-semibold text-blue-600">Confirmer</span> → 
        <span className="font-semibold text-blue-600">Terminer</span> ou 
        <span className="font-semibold text-blue-600">Absent</span> ou 
        <span className="font-semibold text-red-600">Annuler</span>
      </div>

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
                  {['Date', 'Heure', 'Patient', 'Acte', 'Durée', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rdvAffichees.map(r => {
                  const statut = normalizeRdvStatus(r.statut)
                  const s = RDV_STATUS_META[statut] ?? RDV_STATUS_META[RDV_STATUS.PROGRAMME]
                  const patient = r.patients
                  const estProgramme = statut === RDV_STATUS.PROGRAMME
                  const estConfirme = statut === 'confirmé'
                  
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
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {/* CONFIRMER - Visible quand programmé */}
                          {estProgramme && (
                            <button
                              onClick={() => handleConfirmerRdv(r.id)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 shadow-md rounded-lg transition-all"
                              title="Confirmer ce RDV"
                            >
                              ✓ Confirmer
                            </button>
                          )}

                          {/* TERMINER - Visible et actif seulement si confirmé */}
                          <button
                            onClick={() => setTerminantRdv(r)}
                            disabled={!estConfirme}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                              estConfirme
                                ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer'
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                            }`}
                            title={estConfirme ? 'Terminer ce RDV' : 'Confirmez d\'abord le RDV'}
                          >
                            ✓ Terminer
                          </button>

                          {/* ANNULER - Visible si programmé ou confirmé */}
                          {(estProgramme || estConfirme) && (
                            <button
                              onClick={() => setConfirmDialog(r)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 shadow-md rounded-lg transition-all"
                              title="Annuler ce RDV"
                            >
                              ✗ Annuler
                            </button>
                          )}
                        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total RDV</p>
          <p className="text-2xl font-bold text-gray-900">{rdvAffichees.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Programmés</p>
          <p className="text-2xl font-bold text-blue-600">
            {rdvAffichees.filter(r => normalizeRdvStatus(r.statut) === RDV_STATUS.PROGRAMME).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Confirmés</p>
          <p className="text-2xl font-bold text-green-600">
            {rdvAffichees.filter(r => normalizeRdvStatus(r.statut) === 'confirmé').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Terminés</p>
          <p className="text-2xl font-bold text-emerald-600">
            {rdvAffichees.filter(r => normalizeRdvStatus(r.statut) === RDV_STATUS.TERMINE).length}
          </p>
        </div>
      </div>

      {/* Dialog pour terminer RDV (présent/absent) */}
      <ConfirmDialog
        isOpen={!!terminantRdv}
        onConfirm={() => handleTerminerRdv(terminantRdv)}
        onCancel={() => setTerminantRdv(null)}
        title="Terminer le RDV"
        message={terminantRdv ? `Patient ${terminantRdv.patients?.prenom} ${terminantRdv.patients?.nom} présent et consultation terminée?` : ''}
        confirmLabel="Oui, terminé"
        cancelLabel="Annuler"
        tone="success"
      />

      {/* Dialog pour absence patient */}
      {terminantRdv && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50 pointer-events-none">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={() => setTerminantRdv(null)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Marquer absent?</h3>
            <p className="text-sm text-gray-600">
              Patient <strong>{terminantRdv?.patients?.prenom} {terminantRdv?.patients?.nom}</strong> n'est pas venu?
            </p>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setTerminantRdv(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleMarquerAbsent(terminantRdv)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                ✗ Absent
              </button>
              <button
                onClick={() => handleTerminerRdv(terminantRdv)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                ✓ Présent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog annulation */}
      <ConfirmDialog
        isOpen={!!confirmDialog}
        onConfirm={handleAnnulerRdv}
        onCancel={() => setConfirmDialog(null)}
        title="Annuler le RDV"
        message={confirmDialog ? `Êtes-vous sûr de vouloir annuler ce RDV avec ${confirmDialog.patients?.prenom} ${confirmDialog.patients?.nom}?` : ''}
        confirmLabel="Annuler"
        tone="warning"
      />
    </div>
  )
}
