import { useState } from 'react'
import { useStock } from '../hooks/useStock'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PermissionGate } from '../components/RoleGuard'

const COULEURS = ['#0d9488','#3b82f6','#f59e0b','#f43f5e','#8b5cf6','#94a3b8']
const empty = { nom_produit:'', quantite:0, max:100, seuil:20, couleur:'#0d9488' }

export default function Stock() {
  const { stock, loading, ajouterArticle, modifierArticle, supprimerArticle } = useStock()
  const [modal, setModal]   = useState(false)
  const [editS, setEditS]   = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [form, setForm]     = useState(empty)
  const [saving, setSaving] = useState(false)

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const openCreate = () => { setEditS(null); setForm(empty); setModal(true) }
  const openEdit   = s  => { setEditS(s); setForm(s); setModal(true) }

  const handleSubmit = async () => {
    setSaving(true)
    if (editS) await modifierArticle(editS.id, form)
    else       await ajouterArticle(form)
    setSaving(false); setModal(false)
  }

  const critiques = stock.filter(s => s.quantite <= s.seuil).length

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Stock</h2>
          <p className="text-sm text-gray-500">{stock.length} article{stock.length > 1 ? 's' : ''}
            {critiques > 0 && <span className="ml-2 text-red-500 font-medium">· {critiques} en alerte</span>}
          </p>
        </div>
        <PermissionGate module="stock" requireWrite>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter article
          </button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)
        ) : stock.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">Aucun article en stock</div>
        ) : stock.map(s => {
          const pct      = Math.min(100, Math.round((s.quantite / s.max) * 100))
          const critique = s.quantite <= s.seuil
          return (
            <div key={s.id} className={`bg-white rounded-xl border p-4 ${critique ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.nom_produit}</p>
                  {critique && (
                    <span className="text-xs text-red-500 font-medium">⚠ Stock critique</span>
                  )}
                </div>
                <PermissionGate module="stock" requireWrite>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => openEdit(s)} className="p-1 text-gray-400 hover:text-teal-600 rounded transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setConfirmD(s)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </PermissionGate>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Quantité : <strong className={critique ? 'text-red-500' : 'text-gray-800'}>{s.quantite}</strong></span>
                <span>Max : {s.max}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width:`${pct}%`, backgroundColor: critique ? '#f43f5e' : (s.couleur ?? '#0d9488') }} />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Seuil alerte : {s.seuil}</p>
            </div>
          )
        })}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editS ? 'Modifier l\'article' : 'Ajouter un article'}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nom du produit</label>
            <input value={form.nom_produit} onChange={e => set('nom_produit')(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['quantite','max','seuil'].map(k => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{k === 'seuil' ? 'Seuil alerte' : k.charAt(0).toUpperCase() + k.slice(1)}</label>
                <input type="number" value={form[k]} onChange={e => set(k)(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Couleur</label>
            <div className="flex gap-2">
              {COULEURS.map(c => (
                <button key={c} onClick={() => set('couleur')(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${form.couleur === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : (editS ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmD} onConfirm={() => { supprimerArticle(confirmD.id); setConfirmD(null) }}
        onCancel={() => setConfirmD(null)} title="Supprimer l'article"
        message={`Supprimer "${confirmD?.nom_produit}" du stock ?`} />
    </div>
  )
}
