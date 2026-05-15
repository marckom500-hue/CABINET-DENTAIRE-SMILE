// import { useState, useEffect } from 'react'
// import { supabase } from '../lib/supabase'
// import { ROLES_LABELS, ROLES_COLORS } from '../lib/roles'
// import Modal from '../components/Modal'
// import ConfirmDialog from '../components/ConfirmDialog'
// import { useNotifications } from '../hooks/NotificationsContext'

// const ROLE_OPTIONS = Object.entries(ROLES_LABELS).map(([v, l]) => ({ value: v, label: l }))

// export default function Utilisateurs() {
//   const [users, setUsers]     = useState([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch]   = useState('')
//   const [modal, setModal]     = useState(false)
//   const [editU, setEditU]     = useState(null)
//   const [confirmD, setConfirmD] = useState(null)
//   const [form, setForm]       = useState({ nom:'', prenom:'', email:'', role:'secretaire', actif:true })
//   const [saving, setSaving]   = useState(false)
//   const [error, setError]     = useState('')
//   const { notify } = useNotifications()

//   const fetch = async () => {
//     setLoading(true)
//     const { data } = await supabase.from('users_profiles').select('*').order('created_at', { ascending: false })
//     setUsers(data ?? [])
//     setLoading(false)
//   }

//   useEffect(() => { fetch() }, [])

//   const openCreate = () => { setEditU(null); setForm({ nom:'', prenom:'', email:'', role:'secretaire', actif:true }); setError(''); setModal(true) }
//   const openEdit   = (u) => { setEditU(u); setForm({ nom:u.nom, prenom:u.prenom, email:u.email, role:u.role, actif:u.actif }); setError(''); setModal(true) }

//   const handleSave = async () => {
//     setSaving(true); setError('')
//     try {
//       if (editU) {
//         const { error: e } = await supabase.from('users_profiles')
//           .update({ nom:form.nom, prenom:form.prenom, role:form.role, actif:form.actif }).eq('id', editU.id)
//         if (e) throw e
//       } else {
//         // En production, utiliser une Edge Function pour créer l'utilisateur auth
//         // Ici on insère directement le profil (pour les comptes créés manuellement dans Supabase)
//         const { error: e } = await supabase.from('users_profiles').insert({
//           email: form.email, nom: form.nom, prenom: form.prenom, role: form.role, actif: true,
//         })
//         if (e) throw e
//       }
//       notify({ type:'user', message: editU ? 'Utilisateur modifie' : 'Utilisateur ajoute' })
//       await fetch(); setModal(false)
//     } catch (err) {
//       setError(err.message ?? 'Erreur lors de la sauvegarde')
//       notify({ type:'error', message:`Utilisateur non sauvegarde : ${err.message ?? 'Erreur inconnue'}` })
//     }
//     setSaving(false)
//   }

//   const handleToggleActif = async (u) => {
//     const { error } = await supabase.from('users_profiles').update({ actif: !u.actif }).eq('id', u.id)
//     if (error) {
//       notify({ type:'error', message:`Statut utilisateur non modifie : ${error.message}` })
//       return
//     }
//     notify({ type:'user', message:`Utilisateur ${!u.actif ? 'active' : 'desactive'}` })
//     fetch()
//   }

//   const handleDelete = async () => {
//     const { error } = await supabase.from('users_profiles').delete().eq('id', confirmD.id)
//     if (error) {
//       notify({ type:'error', message:`Utilisateur non supprime : ${error.message}` })
//       return
//     }
//     notify({ type:'user', message:'Utilisateur supprime' })
//     setConfirmD(null); fetch()
//   }

//   const filtered = users.filter(u =>
//     `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
//   )

//   return (
//     <div className="p-4 md:p-6 space-y-5">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Utilisateurs</h2>
//           <p className="text-sm text-gray-500">{users.length} compte{users.length > 1 ? 's' : ''}</p>
//         </div>
//         <button onClick={openCreate}
//           className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           Nouvel utilisateur
//         </button>
//       </div>

//       <div className="relative max-w-sm">
//         <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//         </svg>
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
//           className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
//       </div>

//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-200">
//                 {['Utilisateur','Email','Rôle','Statut','Dernière connexion','Actions'].map(h => (
//                   <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {loading ? (
//                 <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chargement...</td></tr>
//               ) : filtered.length === 0 ? (
//                 <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucun utilisateur</td></tr>
//               ) : filtered.map(u => {
//                 const rc = ROLES_COLORS[u.role] ?? ROLES_COLORS.assistant
//                 const initials = `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() || '??'
//                 return (
//                   <tr key={u.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
//                         <span className="font-medium text-gray-900">{u.prenom} {u.nom}</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-gray-500">{u.email}</td>
//                     <td className="px-4 py-3">
//                       <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${rc.bg} ${rc.text}`}>
//                         <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
//                         {ROLES_LABELS[u.role] ?? u.role}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <button onClick={() => handleToggleActif(u)}
//                         className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${u.actif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
//                         <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
//                         {u.actif ? 'Actif' : 'Inactif'}
//                       </button>
//                     </td>
//                     <td className="px-4 py-3 text-gray-500 text-xs">
//                       {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('fr-FR') : '—'}
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex gap-1">
//                         <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                           </svg>
//                         </button>
//                         <button onClick={() => setConfirmD(u)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <Modal isOpen={modal} onClose={() => setModal(false)} title={editU ? "Modifier l'utilisateur" : 'Nouvel utilisateur'} confirmOnClose>
//         <div className="space-y-3">
//           {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
//               <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
//                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
//               <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
//                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
//             </div>
//           </div>
//           {!editU && (
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
//               <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
//                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
//             </div>
//           )}
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">Rôle</label>
//             <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
//               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
//               {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//             </select>
//           </div>
//           {editU && (
//             <div className="flex items-center gap-3">
//               <input type="checkbox" id="actif" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))}
//                 className="w-4 h-4 text-teal-600 rounded border-gray-300" />
//               <label htmlFor="actif" className="text-sm text-gray-700">Compte actif</label>
//             </div>
//           )}
//           <div className="flex gap-3 pt-2">
//             <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
//             <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
//               {saving ? 'Enregistrement...' : (editU ? 'Modifier' : 'Créer')}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <ConfirmDialog isOpen={!!confirmD} onConfirm={handleDelete} onCancel={() => setConfirmD(null)}
//         title="Supprimer l'utilisateur"
//         message={`Supprimer définitivement le compte de ${confirmD?.prenom} ${confirmD?.nom} ?`} />
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ROLES_LABELS, ROLES_COLORS } from '../lib/roles'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useNotifications } from '../hooks/NotificationsContext'

const ROLE_OPTIONS = Object.entries(ROLES_LABELS).map(([v, l]) => ({ value: v, label: l }))

// ─────────────────────────────────────────────────────────────
// Formate la dernière connexion en texte relatif lisible
// ─────────────────────────────────────────────────────────────
function formatLastSignIn(dateStr) {
  if (!dateStr) return null  // null = jamais connecté

  const date  = new Date(dateStr)
  const now   = new Date()
  const diffMs = now - date
  const diffMin  = Math.floor(diffMs / 60_000)
  const diffH    = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1)   return { label: "À l'instant",       recent: true }
  if (diffMin < 60)  return { label: `Il y a ${diffMin} min`,  recent: true }
  if (diffH   < 24)  return { label: `Il y a ${diffH} h`,      recent: true }
  if (diffDays === 1) return { label: 'Hier',                   recent: false }
  if (diffDays < 7)  return { label: `Il y a ${diffDays} jours`, recent: false }
  if (diffDays < 30) return { label: `Il y a ${Math.floor(diffDays / 7)} sem.`, recent: false }

  // Au-delà d'un mois : date complète
  return {
    label: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    recent: false,
  }
}

export default function Utilisateurs() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(false)
  const [editU, setEditU]       = useState(null)
  const [viewU, setViewU]       = useState(null)
  const [confirmD, setConfirmD] = useState(null)
  const [form, setForm]         = useState({ nom:'', prenom:'', email:'', role:'secretaire', actif:true })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const { notify } = useNotifications()

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('users_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => {
    setEditU(null)
    setForm({ nom:'', prenom:'', email:'', role:'secretaire', actif:true })
    setError('')
    setModal(true)
  }
  const openEdit = (u) => {
    setEditU(u)
    setForm({ nom:u.nom, prenom:u.prenom, email:u.email, role:u.role, actif:u.actif })
    setError('')
    setModal(true)
  }
  const openProfile = (u) => {
    setViewU(u)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (editU) {
        const { error: e } = await supabase.from('users_profiles')
          .update({ nom:form.nom, prenom:form.prenom, role:form.role, actif:form.actif })
          .eq('id', editU.id)
        if (e) throw e
      } else {
        const { error: e } = await supabase.from('users_profiles').insert({
          email:form.email, nom:form.nom, prenom:form.prenom, role:form.role, actif:true,
        })
        if (e) throw e
      }
      notify({ type:'user', message: editU ? 'Utilisateur modifié' : 'Utilisateur ajouté' })
      await fetchUsers(); setModal(false)
    } catch (err) {
      setError(err.message ?? 'Erreur lors de la sauvegarde')
      notify({ type:'error', message:`Utilisateur non sauvegardé : ${err.message ?? 'Erreur inconnue'}` })
    }
    setSaving(false)
  }

  const handleToggleActif = async (u) => {
    const { error } = await supabase.from('users_profiles').update({ actif: !u.actif }).eq('id', u.id)
    if (error) { notify({ type:'error', message:`Statut non modifié : ${error.message}` }); return }
    notify({ type:'user', message:`Utilisateur ${!u.actif ? 'activé' : 'désactivé'}` })
    fetchUsers()
  }

  const handleDelete = async () => {
    const { error } = await supabase.from('users_profiles').delete().eq('id', confirmD.id)
    if (error) { notify({ type:'error', message:`Utilisateur non supprimé : ${error.message}` }); return }
    notify({ type:'user', message:'Utilisateur supprimé' })
    setConfirmD(null); fetchUsers()
  }

  const filtered = users.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Utilisateurs</h2>
          <p className="text-sm text-gray-500">{users.length} compte{users.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </button>
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white" />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Dernière connexion', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucun utilisateur</td></tr>
              ) : filtered.map(u => {
                const rc       = ROLES_COLORS[u.role] ?? ROLES_COLORS.assistant
                const initials = `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() || '??'
                const lastConn = formatLastSignIn(u.last_sign_in)

                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    {/* Utilisateur */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <span className="font-medium text-gray-900">{u.prenom} {u.nom}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>

                    {/* Rôle */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${rc.bg} ${rc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                        {ROLES_LABELS[u.role] ?? u.role}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActif(u)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                          u.actif
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {u.actif ? 'Actif' : 'Inactif'}
                      </button>
                    </td>

                    {/* Dernière connexion */}
                    <td className="px-4 py-3">
                      {lastConn ? (
                        <div className="flex items-center gap-1.5">
                          {/* Pastille verte si connexion récente (< 24h) */}
                          {lastConn.recent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${lastConn.recent ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                            {lastConn.label}
                          </span>
                        </div>
                      ) : (
                        /* Jamais connecté */
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 italic">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Jamais connecté
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openProfile(u)}
                          className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Voir le profil"
                          aria-label={`Voir le profil de ${u.prenom ?? ''} ${u.nom ?? ''}`.trim()}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Modifier">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmD(u)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale création / édition */}
      <Modal isOpen={modal} onClose={() => setModal(false)}
        title={editU ? "Modifier l'utilisateur" : 'Nouvel utilisateur'} confirmOnClose>
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
              <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
              <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          {!editU && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rôle</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {editU && (
            <div className="flex items-center gap-3">
              <input type="checkbox" id="actif" checked={form.actif}
                onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))}
                className="w-4 h-4 text-teal-600 rounded border-gray-300" />
              <label htmlFor="actif" className="text-sm text-gray-700">Compte actif</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
              {saving ? 'Enregistrement...' : (editU ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!viewU} onClose={() => setViewU(null)}
        title={`Profil de ${viewU?.prenom ?? ''} ${viewU?.nom ?? ''}`.trim()}>
        {viewU && (() => {
          const rc = ROLES_COLORS[viewU.role] ?? ROLES_COLORS.assistant
          const initials = `${viewU.prenom?.[0] ?? ''}${viewU.nom?.[0] ?? ''}`.toUpperCase() || '??'
          const lastConn = formatLastSignIn(viewU.last_sign_in)
          const createdAt = viewU.created_at
            ? new Date(viewU.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
            : 'Non renseigne'

          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">{viewU.prenom} {viewU.nom}</p>
                  <p className="text-sm text-gray-500 truncate">{viewU.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Role</p>
                  <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${rc.bg} ${rc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                    {ROLES_LABELS[viewU.role] ?? viewU.role}
                  </span>
                </div>

                <div className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Statut</p>
                  <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                    viewU.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${viewU.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {viewU.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Derniere connexion</p>
                  <p className={`mt-2 text-sm ${lastConn?.recent ? 'text-emerald-600 font-medium' : 'text-gray-700'}`}>
                    {lastConn?.label ?? 'Jamais connecte'}
                  </p>
                </div>

                <div className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date de creation</p>
                  <p className="mt-2 text-sm text-gray-700">{createdAt}</p>
                </div>
              </div>

              <button onClick={() => setViewU(null)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                Fermer
              </button>
            </div>
          )
        })()}
      </Modal>

      <ConfirmDialog isOpen={!!confirmD} onConfirm={handleDelete} onCancel={() => setConfirmD(null)}
        title="Supprimer l'utilisateur"
        message={`Supprimer définitivement le compte de ${confirmD?.prenom} ${confirmD?.nom} ?`} />
    </div>
  )
}
