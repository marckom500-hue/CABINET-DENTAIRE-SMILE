import { useState } from 'react'
import { usePatients } from '../hooks/usePatients'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import FormulairePatient from '../components/FormulairePatient'
import { PermissionGate } from '../components/RoleGuard'

const STATUS_COLORS = { Actif:'bg-teal-100 text-teal-700', Urgent:'bg-red-100 text-red-700', Inactif:'bg-gray-100 text-gray-500', Nouveau:'bg-blue-100 text-blue-700' }

export default function Patients() {
  const { patients, loading, ajouterPatient, modifierPatient, supprimerPatient } = usePatients()
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(false)
  const [editP, setEditP]       = useState(null)
  const [confirmD, setConfirmD] = useState(null)

  const filtered = patients.filter(p =>
    `${p.nom} ${p.prenom} ${p.telephone}`.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditP(null); setModal(true) }
  const openEdit   = (p) => { setEditP(p);   setModal(true) }

  const handleSubmit = async (data) => {
    if (editP) await modifierPatient(editP.id, data)
    else       await ajouterPatient(data)
    setModal(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Patients</h2>
          <p className="text-sm text-gray-500">{patients.length} patient{patients.length > 1 ? 's' : ''} enregistré{patients.length > 1 ? 's' : ''}</p>
        </div>
        <PermissionGate module="patients" requireWrite>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau patient
          </button>
        </PermissionGate>
      </div>

      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Patient','Téléphone','Date naiss.','Statut','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Aucun patient trouvé</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {p.prenom?.[0]}{p.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.telephone}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[p.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                      {p.statut ?? 'Actif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PermissionGate module="patients" requireWrite>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmD(p)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editP ? 'Modifier le patient' : 'Nouveau patient'} confirmOnClose>
        <FormulairePatient patient={editP} onSubmit={handleSubmit} onCancel={() => setModal(false)} />
      </Modal>
      <ConfirmDialog isOpen={!!confirmD} onConfirm={async () => { try { await supprimerPatient(confirmD.id); setConfirmD(null) } catch {} }}
        onCancel={() => setConfirmD(null)} title="Supprimer le patient"
        message={`Supprimer définitivement ${confirmD?.prenom} ${confirmD?.nom} ?`} />
    </div>
  )
}
