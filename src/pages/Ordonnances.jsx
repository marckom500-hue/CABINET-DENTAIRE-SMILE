import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PermissionGate } from '../components/RoleGuard'
import { useState as useS, useEffect } from 'react'

function useOrdonnances() {
  const [ordonnances, setOrdonnances] = useState([])
  const [loading, setLoading] = useState(true)
  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('ordonnances')
      .select('*, patients(nom, prenom)')
      .order('created_at', { ascending: false })
    setOrdonnances(data ?? [])
    setLoading(false)
  }
  useEffect(() => { fetch() }, [])
  const ajouter   = async (o)     => { await supabase.from('ordonnances').insert(o); fetch() }
  const modifier  = async (id, o) => { await supabase.from('ordonnances').update(o).eq('id', id); fetch() }
  const supprimer = async (id)    => { await supabase.from('ordonnances').delete().eq('id', id); fetch() }
  return { ordonnances, loading, ajouter, modifier, supprimer }
}

const empty = { patient_id:'', medicaments:'', posologie:'', duree:'7 jours', notes:'' }

export default function Ordonnances() {
  const { ordonnances, loading, ajouter, modifier, supprimer } = useOrdonnances()
  const [modal, setModal]     = useState(false)
  const [editO, setEditO]     = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [form, setForm]       = useState(empty)
  const [saving, setSaving]   = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }))

  const openCreate = () => { setEditO(null); setForm(empty); setModal(true) }
  const openEdit   = (o) => { setEditO(o); setForm({ patient_id:o.patient_id, medicaments:o.medicaments, posologie:o.posologie, duree:o.duree, notes:o.notes }); setModal(true) }

  const handleSubmit = async () => {
    setSaving(true)
    if (editO) await modifier(editO.id, form)
    else       await ajouter(form)
    setModal(false); setSaving(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Ordonnances</h2>
          <p className="text-sm text-gray-500">{ordonnances.length} ordonnance{ordonnances.length > 1 ? 's' : ''}</p>
        </div>
        <PermissionGate module="ordonnances" requireWrite>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle ordonnance
          </button>
        </PermissionGate>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Patient','Médicaments','Posologie','Durée','Date','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : ordonnances.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune ordonnance</td></tr>
              ) : ordonnances.map(o => {
                const patient = o.patients
                return (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {patient ? `${patient.prenom} ${patient.nom}` : `ID: ${o.patient_id}`}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <p className="truncate">{o.medicaments}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{o.posologie}</td>
                    <td className="px-4 py-3 text-gray-600">{o.duree}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGate module="ordonnances" requireWrite>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(o)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setConfirmD(o)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editO ? 'Modifier l\'ordonnance' : 'Nouvelle ordonnance'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ID Patient</label>
            <input value={form.patient_id} onChange={set('patient_id')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Médicaments</label>
            <textarea value={form.medicaments} onChange={set('medicaments')} rows={3}
              placeholder="Ex: Amoxicilline 500mg, Ibuprofène 400mg..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Posologie</label>
            <textarea value={form.posologie} onChange={set('posologie')} rows={2}
              placeholder="Ex: 1 comprimé 3x/jour pendant les repas"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Durée du traitement</label>
            <select value={form.duree} onChange={set('duree')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              {['3 jours','5 jours','7 jours','10 jours','14 jours','21 jours','1 mois'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2}
              placeholder="Instructions complémentaires..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : (editO ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmD} onConfirm={() => { supprimer(confirmD.id); setConfirmD(null) }}
        onCancel={() => setConfirmD(null)} title="Supprimer l'ordonnance"
        message="Supprimer définitivement cette ordonnance ?" />
    </div>
  )
}
