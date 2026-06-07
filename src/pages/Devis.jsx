import { useState } from 'react'
import { useDevis } from '../hooks/useDevis'
import { usePatients } from '../hooks/usePatients'
import { useFactures } from '../hooks/useFactures'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormulaireDevis from '../components/FormulaireDevis'
import { PermissionGate } from '../components/RoleGuard'
import PreviewPDFModal from '../components/PreviewPDFModal'
import { DEVIS_STATUS, DEVIS_STATUS_META, normalizeDevisStatus, canTransitionDevis, getNextStatuses } from '../lib/statuses'

const FILTERS = [
  { key: 'tous', label: 'Tous' },
  { key: DEVIS_STATUS.EN_ATTENTE, label: 'En attente' },
  { key: DEVIS_STATUS.ACCEPTE, label: 'Acceptes' },
  { key: DEVIS_STATUS.CONVERTI_FACTURE, label: 'Convertis en facture' },
  { key: DEVIS_STATUS.REJETE, label: 'Rejetes' },
  { key: DEVIS_STATUS.ANNULE, label: 'Annules' },
  { key: DEVIS_STATUS.EXPIRE, label: 'Expires' },
]

export default function Devis() {
  const { devis, loading, modifier: modifierDevis, supprimer: supprimerDevis } = useDevis()
  const { patients } = usePatients()
  const { creerDepuisDevis } = useFactures()
  const [modal, setModal] = useState(false)
  const [editD, setEditD] = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [filtre, setFiltre] = useState('tous')
  const [previewD, setPreviewD] = useState(null)
  const [converting, setConverting] = useState(null)

  const filtered = devis.filter(d => filtre === 'tous' || normalizeDevisStatus(d.statut) === filtre)

  const openCreate = () => { setEditD(null); setModal(true) }
  const openEdit = (d) => { setEditD(d); setModal(true) }

  const handleStatusChange = async (id, newStatut) => {
    try {
      const currentDevis = devis.find(d => d.id === id)
      if (!currentDevis) return

      // Validate transition before update
      const validationResult = canTransitionDevis(currentDevis.statut, newStatut)
      if (!validationResult.valid) {
        alert(`❌ Transition non autorisée: ${validationResult.error}`)
        return
      }

      const normalizedNewStatus = normalizeDevisStatus(newStatut)
      await modifierDevis(id, {
        statut: normalizedNewStatus,
        ...(normalizedNewStatus === DEVIS_STATUS.ACCEPTE
          ? { date_acceptation: new Date().toISOString().split('T')[0] }
          : {}),
        ...(normalizedNewStatus === DEVIS_STATUS.EN_ATTENTE
          ? { date_acceptation: null, facture_id: null }
          : {}),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const getPatientName = (patientId) => {
    const p = patients.find(pat => pat.id === patientId)
    return p ? `${p.prenom} ${p.nom}` : 'Patient inconnu'
  }

  const handleConvertir = async (d) => {
    setConverting(d.id)
    try {
      // Validate transition to FACTURISE
      const validationResult = canTransitionDevis(d.statut, DEVIS_STATUS.CONVERTI_FACTURE)
      if (!validationResult.valid) {
        alert(`❌ Conversion impossible: ${validationResult.error}`)
        return
      }

      const facture = await creerDepuisDevis(d.id)
      // Conversion en facture = terminal, ne peut pas revenir en arrière
      await modifierDevis(d.id, {
        statut: DEVIS_STATUS.CONVERTI_FACTURE,
        ...(facture?.id ? { facture_id: facture.id } : {}),
      })

    } catch (e) {
      console.error(e)
    } finally {
      setConverting(null)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Devis</h2>
          <p className="text-sm text-gray-500">{devis.length} devis au total</p>
        </div>
        <PermissionGate module="devis" requireWrite>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau devis
          </button>
        </PermissionGate>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filtre === f.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Numero', 'Patient', 'Montant', 'Date', 'Validite', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun devis trouve</td></tr>
              ) : filtered.map(d => {
                const status = normalizeDevisStatus(d.statut)
                const meta = DEVIS_STATUS_META[status] ?? DEVIS_STATUS_META[DEVIS_STATUS.EN_ATTENTE]
                const statusValueList = Array.from(new Set([
                  status,
                  ...getNextStatuses(status, 'devis'),
                ].filter(Boolean))).filter(value => (
                  status === DEVIS_STATUS.CONVERTI_FACTURE || value !== DEVIS_STATUS.CONVERTI_FACTURE
                ))
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.numero}</td>
                    <td className="px-4 py-3 text-gray-600">{getPatientName(d.patient_id)}</td>
                    <td className="px-4 py-3 font-semibold text-teal-600">
                      {(d.montant_total ?? 0).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(d.date_validite).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGate
                        module="devis"
                        requireWrite
                        fallback={<span className={`text-xs font-medium px-2 py-1 rounded-full ${meta.cls}`}>{meta.label}</span>}
                      >
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(d.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 ${meta.cls}`}
                        >
                          {statusValueList.map(value => (
                            <option key={value} value={value}>
                              {(DEVIS_STATUS_META[value] ?? DEVIS_STATUS_META[status])?.label ?? value}
                            </option>
                          ))}
                        </select>

                      </PermissionGate>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <PermissionGate module="devis" requireWrite>
                          <button onClick={() => openEdit(d)}
                            className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Modifier">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </PermissionGate>
                        <button onClick={() => setPreviewD(d)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Apercu / Telecharger PDF">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <PermissionGate module="devis" requireWrite>
                          <button
                            onClick={() => handleConvertir(d)}
                            disabled={converting === d.id || status !== DEVIS_STATUS.ACCEPTE}

                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={status !== DEVIS_STATUS.ACCEPTE ? 'Devis doit etre accepte pour convertir' : 'Convertir en facture'}>
                            {converting === d.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h8" />
                              </svg>
                            )}
                          </button>
                          <button onClick={() => setConfirmD(d)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editD ? 'Modifier le devis' : 'Nouveau devis'} confirmOnClose>
        <FormulaireDevis devis={editD} onCancel={() => setModal(false)} onClose={() => setModal(false)} />
      </Modal>

      <ConfirmDialog isOpen={!!confirmD}
        onConfirm={async () => { try { await supprimerDevis(confirmD.id); setConfirmD(null) } catch {} }}
        onCancel={() => setConfirmD(null)}
        title="Supprimer le devis"
        message={`Supprimer le devis ${confirmD?.numero} ?`} />

      <PreviewPDFModal
        isOpen={!!previewD}
        onClose={() => setPreviewD(null)}
        document={previewD}
        type="devis"
        patientName={previewD ? getPatientName(previewD.patient_id) : ''}
      />
    </div>
  )
}
