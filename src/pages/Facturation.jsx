import { useState } from 'react'
import { useFactures } from '../hooks/useFactures'
import { usePatients } from '../hooks/usePatients'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PermissionGate } from '../components/RoleGuard'
import { ACTES_OPTIONS } from '../lib/actes'
import PreviewPDFModal from '../components/PreviewPDFModal'
import { FACTURE_STATUS, FACTURE_STATUS_META, normalizeFactureStatus } from '../lib/statuses'
import { formatPhone } from '../utils/phone'
import { useNotifications } from '../hooks/NotificationsContext'

const empty = { patient_id:'', acte:'', montant:'', date: new Date().toISOString().split('T')[0], statut: FACTURE_STATUS.ATTENTE }
const today = new Date().toISOString().split('T')[0]

function normalizeFacture(facture) {
  if (!facture) return empty
  return {
    patient_id: facture.patient_id ?? '',
    acte: facture.acte ?? '',
    montant: facture.montant ?? '',
    date: facture.date ?? new Date().toISOString().split('T')[0],
    statut: normalizeFactureStatus(facture.statut),
  }
}

export default function Facturation() {
  const { factures, loading, total, encaisse, ajouterFacture, modifierFacture, supprimerFacture } = useFactures()
  const { patients, loading: loadingPatients } = usePatients()
  const { notify } = useNotifications()
  const [modal, setModal]       = useState(false)
  const [editF, setEditF]       = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [form, setForm]         = useState(empty)
  const [filtre, setFiltre]     = useState('tous')
  const [saving, setSaving]     = useState(false)
  const [previewF, setPreviewF] = useState(null)
  const [changingStatus, setChangingStatus] = useState(null)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const filtered = factures.filter(f => filtre === 'tous' || normalizeFactureStatus(f.statut) === filtre)
  const montantAttente = factures
    .filter(f => normalizeFactureStatus(f.statut) === FACTURE_STATUS.ATTENTE)
    .reduce((sum, f) => sum + Number(f.montant || 0), 0)

  const patientOptions = patients.map(p => ({
    value: p.id,
    label: `${p.prenom ?? ''} ${p.nom ?? ''}${p.telephone ? ` - ${formatPhone(p.telephone)}` : ''}`.trim(),
  }))

  const getPatientName = (patientId) => {
    const p = patients.find(x => x.id === patientId)
    return p ? `${p.prenom} ${p.nom}` : '—'
  }

  const dateTouched = Boolean(form.date)
  const dateIsValid = form.date ? form.date <= today : false
  const canSubmit = Boolean(form.patient_id && form.acte && form.montant !== '' && dateIsValid)

  const openCreate = () => { setEditF(null); setForm(empty); setModal(true) }
  const openEdit   = (f) => { setEditF(f); setForm(normalizeFacture(f)); setModal(true) }

  const handleChangeStatut = async (facture, nouveauStatut) => {
    setChangingStatus(facture.id)
    try {
      const payload = {
        ...facture,
        statut: nouveauStatut,
        montant: Number(facture.montant)
      }
      await modifierFacture(facture.id, payload)
      
      const statutLabel = {
        'attente': 'En attente',
        'paye': 'Payée',
        'annule': 'Annulée'
      }[nouveauStatut] || nouveauStatut
      
      notify({ type: 'success', message: `Statut mis à jour : ${statutLabel}` })
    } catch (error) {
      console.error('Erreur changement statut:', error)
      notify({ type: 'error', message: 'Erreur lors du changement de statut' })
    } finally {
      setChangingStatus(null)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      const payload = { ...form, montant: Number(form.montant ?? 0) }
      if (editF) await modifierFacture(editF.id, payload)
      else       await ajouterFacture(payload)
      setModal(false)
    } catch {
      // Le hook affiche déjà la notification d'erreur
    } finally {
      setSaving(false)
    }
  }

  const getSelectClass = (statut) => {
    const normalized = normalizeFactureStatus(statut)
    switch(normalized) {
      case FACTURE_STATUS.PAYE:
        return 'bg-teal-100 text-teal-700 border-teal-200'
      case FACTURE_STATUS.ANNULE:
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200'
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Facturation</h2>
          <p className="text-sm text-gray-500">{factures.length} facture{factures.length > 1 ? 's' : ''}</p>
        </div>
        <PermissionGate module="facturation" requireWrite>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle facture
          </button>
        </PermissionGate>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-teal-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total facturé</p>
          <p className="text-2xl font-bold text-teal-700">{total.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Encaissé</p>
          <p className="text-2xl font-bold text-green-700">{encaisse.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">En attente</p>
          <p className="text-2xl font-bold text-amber-700">{montantAttente.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'tous', label: 'Toutes' },
          { key: FACTURE_STATUS.PAYE, label: 'Payées' },
          { key: FACTURE_STATUS.ATTENTE, label: 'En attente' },
          { key: FACTURE_STATUS.ANNULE, label: 'Annulées' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filtre === f.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acte</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Chargement...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Aucune facture</td>
                </tr>
              ) : (
                filtered.map(f => {
                  const p = f.patients
                  const currentStatut = normalizeFactureStatus(f.statut)
                  return (
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p ? `${p.prenom} ${p.nom}` : getPatientName(f.patient_id)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{f.acte}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {Number(f.montant).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(f.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={currentStatut}
                          onChange={(e) => handleChangeStatut(f, e.target.value)}
                          disabled={changingStatus === f.id}
                          className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 ${getSelectClass(currentStatut)}`}
                        >
                          <option value={FACTURE_STATUS.ATTENTE}>En attente</option>
                          <option value={FACTURE_STATUS.PAYE}>Payée</option>
                          <option value={FACTURE_STATUS.ANNULE}>Annulée</option>
                        </select>
                        {changingStatus === f.id && (
                          <span className="inline-block ml-2 w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PermissionGate module="facturation" requireWrite>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(f)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Modifier">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => setPreviewF(f)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Aperçu / Télécharger PDF">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button onClick={() => setConfirmD(f)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </PermissionGate>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création/édition */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editF ? 'Modifier la facture' : 'Nouvelle facture'} confirmOnClose>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Patient</label>
            <select value={form.patient_id} onChange={e => set('patient_id')(e.target.value)} disabled={loadingPatients}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white disabled:bg-gray-50 disabled:text-gray-400">
              <option value="">-- Choisir un patient --</option>
              {patientOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Acte</label>
            <select value={form.acte} onChange={e => set('acte')(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option value="">-- Choisir un acte --</option>
              {ACTES_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Montant (FCFA)</label>
            <input type="number" value={form.montant ?? ''} onChange={e => set('montant')(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date ?? ''} onChange={e => set('date')(e.target.value)} max={today}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                dateTouched
                  ? (dateIsValid ? 'border-teal-300 focus:ring-teal-500' : 'border-red-300 focus:ring-red-500')
                  : 'border-gray-200 focus:ring-teal-500'
              }`} />
            <p className={`text-xs mt-1 ${dateTouched ? (dateIsValid ? 'text-teal-600' : 'text-red-600') : 'text-gray-400'}`}>
              {dateTouched
                ? (dateIsValid ? 'Date valide' : "Date invalide : elle ne peut pas être supérieure à aujourd'hui")
                : "Les dates futures sont bloquées dans le calendrier"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
            <select value={form.statut} onChange={e => set('statut')(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option value={FACTURE_STATUS.ATTENTE}>En attente</option>
              <option value={FACTURE_STATUS.PAYE}>Payée</option>
              <option value={FACTURE_STATUS.ANNULE}>Annulée</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={saving || !canSubmit}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : (editF ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm suppression */}
      <ConfirmDialog isOpen={!!confirmD}
        onConfirm={async () => { try { await supprimerFacture(confirmD.id); setConfirmD(null) } catch {} }}
        onCancel={() => setConfirmD(null)}
        title="Supprimer la facture"
        message="Supprimer définitivement cette facture ?" />

      {/* Modal PDF */}
      <PreviewPDFModal
        isOpen={!!previewF}
        onClose={() => setPreviewF(null)}
        document={previewF}
        type="facture"
        patientName={previewF ? getPatientName(previewF.patient_id) : ''}
      />
    </div>
  )
}