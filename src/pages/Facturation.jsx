import { useState } from 'react'
import { useFactures } from '../hooks/useFactures'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PermissionGate } from '../components/RoleGuard'

const STATUS_MAP = {
  paye:    { label:'Payé',       cls:'bg-teal-100 text-teal-700'   },
  attente: { label:'En attente', cls:'bg-amber-100 text-amber-700' },
  annule:  { label:'Annulé',     cls:'bg-red-100 text-red-700'     },
}

const empty = { patient_id:'', acte:'', montant:'', date: new Date().toISOString().split('T')[0], statut:'attente' }

export default function Facturation() {
  const { factures, loading, total, encaisse, ajouterFacture, modifierFacture, supprimerFacture } = useFactures()
  const [modal, setModal]     = useState(false)
  const [editF, setEditF]     = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [form, setForm]       = useState(empty)
  const [filtre, setFiltre]   = useState('tous')
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const filtered = factures.filter(f => filtre === 'tous' || f.statut === filtre)

  const openCreate = () => { setEditF(null); setForm(empty); setModal(true) }
  const openEdit   = (f) => { setEditF(f); setForm(f); setModal(true) }

  const handleSubmit = async () => {
    if (editF) await modifierFacture(editF.id, form)
    else       await ajouterFacture(form)
    setModal(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
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
          <p className="text-2xl font-bold text-amber-700">{(total - encaisse).toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {[{key:'tous',label:'Toutes'},{key:'paye',label:'Payées'},{key:'attente',label:'En attente'},{key:'annule',label:'Annulées'}].map(f => (
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
                {['Patient','Acte','Montant','Date','Statut','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune facture</td></tr>
              ) : filtered.map(f => {
                const s = STATUS_MAP[f.statut] ?? STATUS_MAP.attente
                const p = f.patients
                return (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{p ? `${p.prenom} ${p.nom}` : `ID: ${f.patient_id}`}</td>
                    <td className="px-4 py-3 text-gray-600">{f.acte}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{Number(f.montant).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(f.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span></td>
                    <td className="px-4 py-3">
                      <PermissionGate module="facturation" requireWrite>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(f)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => setConfirmD(f)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editF ? 'Modifier la facture' : 'Nouvelle facture'}>
        <div className="space-y-3">
          {[
            { label:'ID Patient', key:'patient_id' },
            { label:'Acte',       key:'acte'       },
            { label:'Montant (FCFA)', key:'montant', type:'number' },
            { label:'Date',       key:'date',  type:'date' },
          ].map(({ label, key, type='text' }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={form[key] ?? ''} onChange={e => set(key)(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
            <select value={form.statut} onChange={e => set('statut')(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option value="attente">En attente</option>
              <option value="paye">Payé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
            <button onClick={handleSubmit} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
              {editF ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!confirmD} onConfirm={() => { supprimerFacture(confirmD.id); setConfirmD(null) }}
        onCancel={() => setConfirmD(null)} title="Supprimer la facture" message="Supprimer définitivement cette facture ?" />
    </div>
  )
}
