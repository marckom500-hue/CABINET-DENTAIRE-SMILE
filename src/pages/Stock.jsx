// import { useState } from 'react'
// import { useStock } from '../hooks/useStock'
// import Modal from '../components/Modal'
// import ConfirmDialog from '../components/ConfirmDialog'
// import { PermissionGate } from '../components/RoleGuard'

// const COULEURS = ['#0d9488','#3b82f6','#f59e0b','#f43f5e','#8b5cf6','#94a3b8']
// const empty = { nom_produit:'', quantite:0, max:100, seuil:20, couleur:'#0d9488' }

// export default function Stock() {
//   const { stock, loading, ajouterArticle, modifierArticle, supprimerArticle } = useStock()
//   const [modal, setModal]   = useState(false)
//   const [editS, setEditS]   = useState(null)
//   const [confirmD, setConfirmD] = useState(null)
//   const [form, setForm]     = useState(empty)
//   const [saving, setSaving] = useState(false)

//   const set = k => v => setForm(f => ({ ...f, [k]: v }))

//   const openCreate = () => { setEditS(null); setForm(empty); setModal(true) }
//   const openEdit   = s  => { setEditS(s); setForm(s); setModal(true) }

//   const handleSubmit = async () => {
//     setSaving(true)
//     try {
//       if (editS) await modifierArticle(editS.id, form)
//       else       await ajouterArticle(form)
//       setModal(false)
//     } catch {
//       // Le hook affiche deja la notification d'erreur.
//     } finally {
//       setSaving(false)
//     }
//   }

//   const critiques = stock.filter(s => s.quantite <= s.seuil).length

//   return (
//     <div className="p-4 md:p-6 space-y-5">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Stock</h2>
//           <p className="text-sm text-gray-500">{stock.length} article{stock.length > 1 ? 's' : ''}
//             {critiques > 0 && <span className="ml-2 text-red-500 font-medium">· {critiques} en alerte</span>}
//           </p>
//         </div>
//         <PermissionGate module="stock" requireWrite>
//           <button onClick={openCreate}
//             className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Ajouter article
//           </button>
//         </PermissionGate>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {loading ? (
//           [1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)
//         ) : stock.length === 0 ? (
//           <div className="col-span-3 text-center py-12 text-gray-400">Aucun article en stock</div>
//         ) : stock.map(s => {
//           const pct      = Math.min(100, Math.round((s.quantite / s.max) * 100))
//           const critique = s.quantite <= s.seuil
//           return (
//             <div key={s.id} className={`bg-white rounded-xl border p-4 ${critique ? 'border-red-200' : 'border-gray-200'}`}>
//               <div className="flex items-start justify-between mb-3">
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-900 truncate">{s.nom_produit}</p>
//                   {critique && (
//                     <span className="text-xs text-red-500 font-medium">⚠ Stock critique</span>
//                   )}
//                 </div>
//                 <div className="flex gap-1 ml-2">
//                   <PermissionGate module="stock" requireWrite>
//                     <button onClick={() => openEdit(s)} className="p-1 text-gray-400 hover:text-teal-600 rounded transition-colors" title="Modifier">
//                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                       </svg>
//                     </button>
//                     <button onClick={() => setConfirmD(s)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors" title="Supprimer">
//                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                       </svg>
//                     </button>
//                   </PermissionGate>
//                 </div>
//               </div>
//               <div className="flex justify-between text-xs text-gray-500 mb-1.5">
//                 <span>Quantité : <strong className={critique ? 'text-red-500' : 'text-gray-800'}>{s.quantite}</strong></span>
//                 <span>Max : {s.max}</span>
//               </div>
//               <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
//                 <div className="h-full rounded-full transition-all"
//                   style={{ width:`${pct}%`, backgroundColor: critique ? '#f43f5e' : (s.couleur ?? '#0d9488') }} />
//               </div>
//               <p className="text-xs text-gray-400 mt-1.5">Seuil alerte : {s.seuil}</p>
//             </div>
//           )
//         })}
//       </div>

//       <Modal isOpen={modal} onClose={() => setModal(false)} title={editS ? 'Modifier l\'article' : 'Ajouter un article'} confirmOnClose>
//         <div className="space-y-3">
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">Nom du produit</label>
//             <input value={form.nom_produit} onChange={e => set('nom_produit')(e.target.value)}
//               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
//           </div>
//           <div className="grid grid-cols-3 gap-3">
//             {['quantite','max','seuil'].map(k => (
//               <div key={k}>
//                 <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{k === 'seuil' ? 'Seuil alerte' : k.charAt(0).toUpperCase() + k.slice(1)}</label>
//                 <input type="number" value={form[k]} onChange={e => set(k)(Number(e.target.value))}
//                   className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
//               </div>
//             ))}
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-2">Couleur</label>
//             <div className="flex gap-2">
//               {COULEURS.map(c => (
//                 <button key={c} onClick={() => set('couleur')(c)}
//                   className={`w-7 h-7 rounded-full transition-transform ${form.couleur === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
//                   style={{ backgroundColor: c }} />
//               ))}
//             </div>
//           </div>
//           <div className="flex gap-3 pt-2">
//             <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
//             <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
//               {saving ? 'Enregistrement...' : (editS ? 'Modifier' : 'Ajouter')}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <ConfirmDialog isOpen={!!confirmD} onConfirm={async () => { try { await supprimerArticle(confirmD.id); setConfirmD(null) } catch {} }}
//         onCancel={() => setConfirmD(null)} title="Supprimer l'article"
//         message={`Supprimer "${confirmD?.nom_produit}" du stock ?`} />
//     </div>
//   )
// }
























import { useState, useMemo } from 'react'
import { useStock } from '../hooks/useStock'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { PermissionGate } from '../components/RoleGuard'

const COULEURS = ['#0d9488','#3b82f6','#f59e0b','#f43f5e','#8b5cf6','#94a3b8']
const empty = { nom_produit:'', quantite:0, max:100, seuil:20, couleur:'#0d9488' }

function IconCart({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function IconHistory({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })
}

export default function Stock() {
  const {
    stock, loading,
    ajouterArticle, modifierArticle, supprimerArticle,
    commandes, loadingCommandes,
    validerCommande, marquerRecu,
  } = useStock()

  const [onglet,   setOnglet]   = useState('stock')   // 'stock' | 'commander' | 'historique'
  const [modal,    setModal]    = useState(false)
  const [editS,    setEditS]    = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [form,     setForm]     = useState(empty)
  const [saving,   setSaving]   = useState(false)

  // Lignes de commande en cours (avant validation)
  const [lignesCommande, setLignesCommande] = useState([])
  const [validating,     setValidating]     = useState(false)

  // Confirmation "marquer reçu"
  const [confirmRecu, setConfirmRecu] = useState(null)  // commande object

  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const openCreate = () => { setEditS(null); setForm(empty); setModal(true) }
  const openEdit   = s  => { setEditS(s); setForm(s); setModal(true) }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      if (editS) await modifierArticle(editS.id, form)
      else       await ajouterArticle(form)
      setModal(false)
    } catch {
      // hook gère la notif
    } finally {
      setSaving(false)
    }
  }

  const critiques = stock.filter(s => s.quantite <= s.seuil)
  const enAttente = commandes.filter(c => c.statut === 'en_attente')

  // IDs déjà dans la liste de commande
  const dejaDansCommande = useMemo(
    () => new Set(lignesCommande.map(l => l.articleId)),
    [lignesCommande]
  )

  // Ajouter un article critique dans "À commander"
  const ajouterACommander = (article) => {
    setLignesCommande(prev => {
      if (prev.find(l => l.articleId === article.id)) return prev
      const qteRecommandee = Math.max(article.seuil - article.quantite, article.seuil)
      return [...prev, {
        articleId:    article.id,
        nom_produit:  article.nom_produit,
        quantite:     article.quantite,
        seuil:        article.seuil,
        qteACommander: qteRecommandee,
      }]
    })
    setOnglet('commander')
  }

  const setQteCommande = (articleId, valeur) => {
    setLignesCommande(prev =>
      prev.map(l => l.articleId === articleId ? { ...l, qteACommander: Math.max(1, Number(valeur)) } : l)
    )
  }

  const retirerCommande = (articleId) => {
    setLignesCommande(prev => prev.filter(l => l.articleId !== articleId))
  }

  // Valider la commande → Supabase
  const handleValider = async () => {
    if (lignesCommande.length === 0) return
    setValidating(true)
    try {
      await validerCommande(lignesCommande)
      setLignesCommande([])
      setOnglet('historique')
    } catch {
      // hook gère la notif
    } finally {
      setValidating(false)
    }
  }

  // Marquer commande reçue → met à jour le stock
  const handleMarquerRecu = async () => {
    if (!confirmRecu) return
    try {
      await marquerRecu(confirmRecu.id, confirmRecu.commande_lignes)
      setConfirmRecu(null)
    } catch {
      // hook gère la notif
    }
  }

  // ─── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Stock</h2>
          <p className="text-sm text-gray-500">
            {stock.length} article{stock.length > 1 ? 's' : ''}
            {critiques.length > 0 && (
              <span className="ml-2 text-red-500 font-medium">· {critiques.length} en alerte</span>
            )}
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

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-200">

        {/* Stock */}
        <button onClick={() => setOnglet('stock')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            onglet === 'stock'
              ? 'bg-white border border-b-white border-gray-200 text-teal-700 -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}>
          Stock
        </button>

        {/* À commander */}
        <button onClick={() => setOnglet('commander')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            onglet === 'commander'
              ? 'bg-white border border-b-white border-gray-200 text-orange-600 -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}>
          <IconCart className="w-4 h-4" />
          À commander
          {lignesCommande.length > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {lignesCommande.length}
            </span>
          )}
        </button>

        {/* Historique */}
        <button onClick={() => setOnglet('historique')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            onglet === 'historique'
              ? 'bg-white border border-b-white border-gray-200 text-teal-700 -mb-px'
              : 'text-gray-500 hover:text-gray-700'
          }`}>
          <IconHistory className="w-4 h-4" />
          Historique
          {enAttente.length > 0 && (
            <span className="bg-teal-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {enAttente.length}
            </span>
          )}
        </button>
      </div>

      {/* ════════════════════════════════ ONGLET STOCK ════════════════════════════════ */}
      {onglet === 'stock' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)
          ) : stock.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-400">Aucun article en stock</div>
          ) : stock.map(s => {
            const pct      = Math.min(100, Math.round((s.quantite / s.max) * 100))
            const critique = s.quantite <= s.seuil
            const enCmd    = dejaDansCommande.has(s.id)
            return (
              <div key={s.id} className={`bg-white rounded-xl border p-4 ${critique ? 'border-red-200' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.nom_produit}</p>
                    {critique && <span className="text-xs text-red-500 font-medium">⚠ Stock critique</span>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <PermissionGate module="stock" requireWrite>
                      <button onClick={() => openEdit(s)}
                        className="p-1 text-gray-400 hover:text-teal-600 rounded transition-colors" title="Modifier">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setConfirmD(s)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors" title="Supprimer">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </PermissionGate>
                  </div>
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

                {/* Bouton Commander — visible uniquement si critique */}
                {critique && (
                  <button onClick={() => ajouterACommander(s)} disabled={enCmd}
                    className={`mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                      enCmd
                        ? 'bg-orange-50 text-orange-400 cursor-default border border-orange-200'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}>
                    <IconCart className="w-3.5 h-3.5" />
                    {enCmd ? 'Déjà dans la liste' : 'Commander'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ════════════════════════════ ONGLET À COMMANDER ════════════════════════════ */}
      {onglet === 'commander' && (
        <div className="space-y-4">

          {/* Bannière */}
          {lignesCommande.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconCart className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  {lignesCommande.length} article{lignesCommande.length > 1 ? 's' : ''} à commander
                </p>
                <p className="text-xs text-orange-600">Ajustez les quantités si nécessaire avant de valider</p>
              </div>
            </div>
          )}

          {/* Liste vide */}
          {lignesCommande.length === 0 && (
            <div className="text-center py-16 text-gray-400 space-y-3">
              <div className="flex justify-center">
                <IconCart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-sm font-medium">Aucun article à commander</p>
              <p className="text-xs">
                Depuis l'onglet <strong>Stock</strong>, cliquez sur{' '}
                <span className="text-orange-500 font-medium">Commander</span>{' '}
                sur les articles en stock critique.
              </p>
            </div>
          )}

          {/* Tableau des lignes */}
          {lignesCommande.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Article</th>
                    <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Stock actuel</th>
                    <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Seuil</th>
                    <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Qté à commander</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lignesCommande.map(l => {
                    const manque = l.seuil - l.quantite
                    return (
                      <tr key={l.articleId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{l.nom_produit}</p>
                          <p className="text-xs text-red-500 font-medium">
                            Manque {manque} unité{manque > 1 ? 's' : ''} pour atteindre le seuil
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-red-100 text-red-600 font-bold text-xs rounded-full px-2.5 py-1">
                            {l.quantite}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-gray-500 font-medium">{l.seuil}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input type="number" min={1} value={l.qteACommander}
                            onChange={e => setQteCommande(l.articleId, e.target.value)}
                            className="w-20 text-center px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => retirerCommande(l.articleId)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors" title="Retirer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pied */}
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <button onClick={() => setLignesCommande([])}
                  className="text-xs text-gray-400 hover:text-red-500 underline transition-colors">
                  Vider la liste
                </button>
                <button onClick={handleValider} disabled={validating}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {validating ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {validating ? 'Enregistrement...' : 'Valider la commande'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════ ONGLET HISTORIQUE ══════════════════════════════ */}
      {onglet === 'historique' && (
        <div className="space-y-3">
          {loadingCommandes ? (
            [1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)
          ) : commandes.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <IconHistory className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-medium">Aucune commande enregistrée</p>
            </div>
          ) : commandes.map(c => {
            const estRecu = c.statut === 'recue'
            return (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* En-tête commande */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      estRecu
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${estRecu ? 'bg-green-500' : 'bg-orange-500'}`} />
                      {estRecu ? 'Reçue' : 'En attente'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Commandé le {fmtDate(c.created_at)}
                      {estRecu && ` · Reçu le ${fmtDate(c.recu_le)}`}
                    </span>
                  </div>

                  {/* Bouton Marquer reçu */}
                  {!estRecu && (
                    <PermissionGate module="stock" requireWrite>
                      <button onClick={() => setConfirmRecu(c)}
                        className="flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Marquer reçu
                      </button>
                    </PermissionGate>
                  )}
                </div>

                {/* Lignes de la commande */}
                <div className="divide-y divide-gray-50">
                  {(c.commande_lignes ?? []).map(l => (
                    <div key={l.id} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-gray-800">{l.nom_produit}</span>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Stock au moment de la commande : <strong className="text-red-500">{l.quantite_actuelle}</strong></span>
                        <span>Seuil : {l.seuil}</span>
                        <span className="bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                          +{l.qte_commandee} unités
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal ajout / modification ──────────────────────────────────────── */}
      <Modal isOpen={modal} onClose={() => setModal(false)}
        title={editS ? "Modifier l'article" : 'Ajouter un article'} confirmOnClose>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nom du produit</label>
            <input value={form.nom_produit} onChange={e => set('nom_produit')(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['quantite','max','seuil'].map(k => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
                  {k === 'seuil' ? 'Seuil alerte' : k.charAt(0).toUpperCase() + k.slice(1)}
                </label>
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
            <button onClick={() => setModal(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : (editS ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Dialog suppression article ──────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirmD}
        onConfirm={async () => { try { await supprimerArticle(confirmD.id); setConfirmD(null) } catch {} }}
        onCancel={() => setConfirmD(null)}
        title="Supprimer l'article"
        message={`Supprimer "${confirmD?.nom_produit}" du stock ?`}
      />

      {/* ── Dialog marquer commande reçue ───────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirmRecu}
        onConfirm={handleMarquerRecu}
        onCancel={() => setConfirmRecu(null)}
        title="Marquer comme reçue"
        message={`Confirmer la réception de cette commande ? Les quantités en stock seront mises à jour automatiquement.`}
      />
    </div>
  )
}
