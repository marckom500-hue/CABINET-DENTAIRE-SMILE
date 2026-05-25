// import { useState, useEffect } from 'react'
// import { supabase } from '../lib/supabase'
// import { ROLES_LABELS, ROLES_COLORS } from '../lib/roles'
// import Modal from '../components/Modal'
// import ConfirmDialog from '../components/ConfirmDialog'
// import { useNotifications } from '../hooks/NotificationsContext'

// const ROLE_OPTIONS = Object.entries(ROLES_LABELS).map(([v, l]) => ({ value: v, label: l }))

// // ============================================================
// // FONCTIONS POUR AVATARS COLORÃ‰S DYNAMIQUES
// // ============================================================

// function getAvatarColor(seed) {
//   let hash = 0;
//   for (let i = 0; i < seed.length; i++) {
//     hash = seed.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   const hue = Math.abs(hash % 360);
//   return `hsl(${hue}, 70%, 55%)`;
// }

// function getInitials(nom, prenom) {
//   if (!nom && !prenom) return '?';
//   return `${(prenom?.[0] || '').toUpperCase()}${(nom?.[0] || '').toUpperCase()}`;
// }

// // ============================================================
// // FORMATAGE DATE
// // ============================================================

// function formatLastSignIn(dateStr) {
//   if (!dateStr) return null
//   const date = new Date(dateStr)
//   const now = new Date()
//   const diffMin = Math.floor((now - date) / 60000)
//   const diffH = Math.floor((now - date) / 3600000)
//   const diffDays = Math.floor((now - date) / 86400000)

//   if (diffMin < 1) return { label: "Ã€ l'instant", recent: true }
//   if (diffMin < 60) return { label: `Il y a ${diffMin} min`, recent: true }
//   if (diffH < 24) return { label: `Il y a ${diffH} h`, recent: true }
//   if (diffDays === 1) return { label: 'Hier', recent: false }
//   if (diffDays < 7) return { label: `Il y a ${diffDays} jours`, recent: false }
//   if (diffDays < 30) return { label: `Il y a ${Math.floor(diffDays / 7)} sem.`, recent: false }
  
//   return {
//     label: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
//     recent: false,
//   }
// }

// export default function Utilisateurs() {
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState('')
//   const [modal, setModal] = useState(false)
//   const [editU, setEditU] = useState(null)
//   const [viewU, setViewU] = useState(null)
//   const [confirmD, setConfirmD] = useState(null)
//   const [showPassword, setShowPassword] = useState(false)
//   const [form, setForm] = useState({ 
//     nom: '', 
//     prenom: '', 
//     email: '', 
//     password: '', 
//     role: 'secretaire', 
//     actif: true,
//     specialite: ''
//   })
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const { notify } = useNotifications()

//   const fetchUsers = async () => {
//     setLoading(true)
//     const { data } = await supabase
//       .from('users_profiles')
//       .select('*')
//       .order('created_at', { ascending: false })
//     setUsers(data ?? [])
//     setLoading(false)
//   }

//   useEffect(() => { fetchUsers() }, [])

//   const openCreate = () => {
//     setEditU(null)
//     setShowPassword(false)
//     setForm({ 
//       nom: '', 
//       prenom: '', 
//       email: '', 
//       password: '', 
//       role: 'secretaire', 
//       actif: true,
//       specialite: ''
//     })
//     setError('')
//     setModal(true)
//   }

//   const openEdit = (u) => {
//     setEditU(u)
//     setShowPassword(false)
//     setForm({ 
//       nom: u.nom, 
//       prenom: u.prenom, 
//       email: u.email, 
//       role: u.role, 
//       actif: u.actif,
//       specialite: u.specialite || ''
//     })
//     setError('')
//     setModal(true)
//   }

//   const openProfile = (u) => setViewU(u)

//   const handleSave = async () => {
//     setSaving(true)
//     setError('')
    
//     try {
//       if (editU) {
//         const updateData = { 
//           nom: form.nom, 
//           prenom: form.prenom, 
//           role: form.role, 
//           actif: form.actif 
//         }
//         if (form.role === 'medecin' || form.role === 'superadmin') {
//           updateData.specialite = form.specialite
//         }
//         const { error: e } = await supabase
//           .from('users_profiles')
//           .update(updateData)
//           .eq('id', editU.id)
//         if (e) throw e
        
//         notify({ type: 'success', message: 'Utilisateur modifiÃ©' })
//         await fetchUsers()
//         setModal(false)
//       } else {
//         if (!form.password) throw new Error('Mot de passe requis')
//         if (!form.email) throw new Error('Email requis')
//         if (form.password.length < 6) throw new Error('6 caractÃ¨res minimum')

//         const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
//         const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

//         if (!SERVICE_ROLE_KEY) {
//           throw new Error('ClÃ© API manquante')
//         }

//         const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'apikey': SERVICE_ROLE_KEY,
//             'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
//           },
//           body: JSON.stringify({
//             email: form.email,
//             password: form.password,
//             email_confirm: true,
//             user_metadata: {
//               nom: form.nom,
//               prenom: form.prenom,
//               role: form.role,
//               specialite: form.specialite
//             }
//           })
//         })

//         const data = await response.json()

//         if (!response.ok) {
//           throw new Error(data.message || 'Erreur crÃ©ation utilisateur')
//         }

//         if (!data.id) {
//           throw new Error('ID utilisateur non reÃ§u')
//         }

//         const profileData = {
//           id: data.id,
//           email: form.email,
//           nom: form.nom,
//           prenom: form.prenom,
//           role: form.role,
//           actif: true
//         }
//         if ((form.role === 'medecin' || form.role === 'superadmin') && form.specialite) {
//           profileData.specialite = form.specialite
//         }

//         const { error: profileError } = await supabase
//           .from('users_profiles')
//           .upsert(profileData, { onConflict: 'id' })

//         if (profileError) {
//           console.error('Erreur upsert:', profileError)
//           throw new Error('Erreur crÃ©ation profil')
//         }

//         notify({ type: 'success', message: 'Utilisateur crÃ©Ã© avec succÃ¨s' })
//         await fetchUsers()
//         setModal(false)
//       }
//     } catch (err) {
//       const message = err?.message ?? 'Erreur'
//       setError(message)
//       notify({ type: 'error', message: message })
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleToggleActif = async (u) => {
//     const { error } = await supabase
//       .from('users_profiles')
//       .update({ actif: !u.actif })
//       .eq('id', u.id)
//     if (error) { 
//       notify({ type: 'error', message: error.message })
//       return 
//     }
//     notify({ type: 'success', message: `Utilisateur ${!u.actif ? 'activÃ©' : 'dÃ©sactivÃ©'}` })
//     fetchUsers()
//   }

//   const handleDelete = async () => {
//     const { error } = await supabase
//       .from('users_profiles')
//       .delete()
//       .eq('id', confirmD.id)
//     if (error) { 
//       notify({ type: 'error', message: error.message })
//       return 
//     }
//     notify({ type: 'success', message: 'Utilisateur supprimÃ©' })
//     setConfirmD(null)
//     fetchUsers()
//   }

//   const showMedicalFields = form.role === 'medecin' || form.role === 'superadmin'
//   const filtered = users.filter(u => `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase()))

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
//                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
//                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
//                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">RÃ´le</th>
//                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SpÃ©cialitÃ©</th>
//                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
//                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">DerniÃ¨re connexion</th>
//                 <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {loading ? (
//                 <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement...</td></tr>
//               ) : filtered.length === 0 ? (
//                 <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun utilisateur</td></tr>
//               ) : (
//                 filtered.map(u => {
//                   const rc = ROLES_COLORS[u.role] ?? ROLES_COLORS.assistant
//                   const lastConn = formatLastSignIn(u.last_sign_in)
//                   return (
//                     <tr key={u.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           <div 
//                             className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
//                             style={{ backgroundColor: getAvatarColor(u.email || u.id) }}
//                           >
//                             {getInitials(u.nom, u.prenom)}
//                           </div>
//                           <span className="font-medium text-gray-900">{u.prenom} {u.nom}</span>
//                         </div>
//                       </td>

//                       {/* PROFIL AVEC AVATAR */}
//                       {/* <td className="px-4 py-3">
//                           <div className="flex items-center gap-3">
//                              <img 
//                               src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(u.email)}`}
//                               alt={`Avatar de ${u.prenom} ${u.nom}`}
//                               className="w-8 h-8 rounded-full bg-gray-100"
//                               onError={(e) => {
//                                 e.target.onerror = null;
//                                 e.target.src = `https://api.dicebear.com/9.x/lorelei/svg?seed=${u.email}`;
//                               }}
//                             /> 
//                             <span className="font-medium text-gray-900">{u.prenom} {u.nom}</span>
//                           </div>
//                         </td> */}

//                       <td className="px-4 py-3 text-gray-500">{u.email}</td>
//                       <td className="px-4 py-3">
//                         <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${rc.bg} ${rc.text}`}>
//                           <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
//                           {ROLES_LABELS[u.role] ?? u.role}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-gray-500 text-xs">
//                         {(u.role === 'medecin' || u.role === 'superadmin') ? (u.specialite || 'â€”') : 'â€”'}
//                       </td>
//                       <td className="px-4 py-3">
//                         <button onClick={() => handleToggleActif(u)}
//                           className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${u.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
//                           <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
//                           {u.actif ? 'Actif' : 'Inactif'}
//                         </button>
//                       </td>
//                       <td className="px-4 py-3">
//                         {lastConn ? (
//                           <div className="flex items-center gap-1.5">
//                             {lastConn.recent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
//                             <span className={`text-xs ${lastConn.recent ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>{lastConn.label}</span>
//                           </div>
//                         ) : <span className="text-xs text-gray-400 italic">Jamais connectÃ©</span>}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex gap-1">
//                           <button onClick={() => openProfile(u)} className="p-1.5 text-gray-400 hover:text-sky-600 rounded-lg" title="Voir">
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             </svg>
//                           </button>
//                           <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg" title="Modifier">
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                             </svg>
//                           </button>
//                           <button onClick={() => setConfirmD(u)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg" title="Supprimer">
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                             </svg>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modal CrÃ©ation/Modification */}
//       <Modal isOpen={modal} onClose={() => setModal(false)} title={editU ? "Modifier" : "Nouvel utilisateur"} confirmOnClose>
//         <div className="space-y-3">
//           {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">PrÃ©nom *</label>
//               <input type="text" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})}
//                 className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500" />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
//               <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
//                 className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500" />
//             </div>
//           </div>
          
//           {!editU && (
//             <>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
//                 <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
//                   className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500" />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe *</label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={form.password}
//                     onChange={e => setForm({...form, password: e.target.value})}
//                     className="w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(value => !value)}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-teal-600 rounded"
//                     title={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
//                     aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
//                   >
//                     {showPassword ? (
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.88 4.24A9.956 9.956 0 0112 4c5 0 9.27 3.11 11 7.5a11.79 11.79 0 01-3.06 4.4M6.1 6.1A11.79 11.79 0 001 11.5C2.73 15.89 7 19 12 19c1.17 0 2.29-.17 3.34-.49" />
//                       </svg>
//                     ) : (
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">Minimum 6 caractÃ¨res</p>
//               </div>
//             </>
//           )}
          
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1">RÃ´le *</label>
//             <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
//               className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500">
//               {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
//             </select>
//           </div>
          
//           {showMedicalFields && (
//             <div className="border-t-2 border-teal-200 pt-3 mt-2">
//               <h3 className="text-sm font-semibold text-teal-700 mb-2">ðŸ‘¨â€âš•ï¸ Informations mÃ©dicales</h3>
//               <select value={form.specialite} onChange={e => setForm({...form, specialite: e.target.value})}
//                 className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500">
//                 <option value="">-- SÃ©lectionner une spÃ©cialitÃ© --</option>
//                 <option value="Chirurgie dentaire">Chirurgie dentaire</option>
//                 <option value="Orthodontie">Orthodontie</option>
//                 <option value="Parodontologie">Parodontologie</option>
//                 <option value="Endodontie">Endodontie</option>
//                 <option value="PÃ©dodontie">PÃ©dodontie</option>
//                 <option value="ProthÃ¨se">ProthÃ¨se dentaire</option>
//                 <option value="Implantologie">Implantologie</option>
//               </select>
//             </div>
//           )}
          
//           {editU && (
//             <div className="flex items-center gap-3">
//               <input type="checkbox" id="actif" checked={form.actif} onChange={e => setForm({...form, actif: e.target.checked})}
//                 className="w-4 h-4 text-teal-600 rounded" />
//               <label htmlFor="actif" className="text-sm text-gray-700">Compte actif</label>
//             </div>
//           )}
          
//           <div className="flex gap-3 pt-2">
//             <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Annuler</button>
//             <button onClick={handleSave} disabled={saving}
//               className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50">
//               {saving ? 'Enregistrement...' : (editU ? 'Modifier' : 'CrÃ©er')}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* Modal Profil */}
//       <Modal isOpen={!!viewU} onClose={() => setViewU(null)} title={`Profil de ${viewU?.prenom || ''} ${viewU?.nom || ''}`}>
//         {viewU && (
//           <div className="space-y-5">
//             <div className="flex items-center gap-4">
//               <div 
//                 className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md"
//                 style={{ backgroundColor: getAvatarColor(viewU.email || viewU.id) }}
//               >
//                 {getInitials(viewU.nom, viewU.prenom)}
//               </div>
//               <div>
//                 <p className="text-lg font-semibold">{viewU.prenom} {viewU.nom}</p>
//                 <p className="text-sm text-gray-500">{viewU.email}</p>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="border rounded-lg p-3"><p className="text-xs text-gray-400 uppercase">RÃ´le</p><p className="mt-2 font-medium">{ROLES_LABELS[viewU.role] || viewU.role}</p></div>
//               <div className="border rounded-lg p-3"><p className="text-xs text-gray-400 uppercase">Statut</p><p className="mt-2 font-medium">{viewU.actif ? 'Actif' : 'Inactif'}</p></div>
//               <div className="border rounded-lg p-3"><p className="text-xs text-gray-400 uppercase">DerniÃ¨re connexion</p><p className="mt-2">{formatLastSignIn(viewU.last_sign_in)?.label || 'Jamais'}</p></div>
//               <div className="border rounded-lg p-3"><p className="text-xs text-gray-400 uppercase">Date crÃ©ation</p><p className="mt-2">{viewU.created_at ? new Date(viewU.created_at).toLocaleDateString('fr-FR') : 'Non renseignÃ©'}</p></div>
//             </div>
//             <button onClick={() => setViewU(null)} className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Fermer</button>
//           </div>
//         )}
//       </Modal>

//       <ConfirmDialog isOpen={!!confirmD} onConfirm={handleDelete} onCancel={() => setConfirmD(null)}
//         title="Supprimer" message={`Supprimer ${confirmD?.prenom} ${confirmD?.nom} ?`} />
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

// ── Avatars colorés dynamiques ───────────────────────────────
function getAvatarColor(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return `hsl(${Math.abs(hash % 360)}, 70%, 55%)`
}
function getInitials(nom, prenom) {
  if (!nom && !prenom) return '?'
  return `${(prenom?.[0] || '').toUpperCase()}${(nom?.[0] || '').toUpperCase()}`
}

// ── Formatage dernière connexion ─────────────────────────────
function formatLastSignIn(dateStr) {
  if (!dateStr) return null
  const date     = new Date(dateStr)
  const now      = new Date()
  const diffMin  = Math.floor((now - date) / 60_000)
  const diffH    = Math.floor((now - date) / 3_600_000)
  const diffDays = Math.floor((now - date) / 86_400_000)
  if (diffMin  <  1) return { label: "À l'instant",              recent: true  }
  if (diffMin  < 60) return { label: `Il y a ${diffMin} min`,    recent: true  }
  if (diffH    < 24) return { label: `Il y a ${diffH} h`,        recent: true  }
  if (diffDays === 1) return { label: 'Hier',                     recent: false }
  if (diffDays <  7) return { label: `Il y a ${diffDays} jours`, recent: false }
  if (diffDays < 30) return { label: `Il y a ${Math.floor(diffDays / 7)} sem.`, recent: false }
  return {
    label: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    recent: false,
  }
}

const EMPTY_FORM = { nom: '', prenom: '', email: '', password: '', role: 'secretaire', actif: true, specialite: '' }

function UserAvatar({ user, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-14 h-14 text-lg'
  if (user.avatar_url) {
    return (
      <img src={user.avatar_url} alt={`${user.prenom} ${user.nom}`}
        className={`${dim} rounded-full object-cover flex-shrink-0 border border-gray-200`} />
    )
  }
  return (
    <div className={`${dim} rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}
      style={{ backgroundColor: getAvatarColor(user.email || user.id) }}>
      {getInitials(user.nom, user.prenom)}
    </div>
  )
}

export default function Utilisateurs() {
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [modal,        setModal]        = useState(false)
  const [editU,        setEditU]        = useState(null)
  const [viewU,        setViewU]        = useState(null)
  const [confirmD,     setConfirmD]     = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [avatarFile,   setAvatarFile]   = useState(null)
  const [avatarPreview,setAvatarPreview]= useState(null)
  const { notify } = useNotifications()

  // ── Chargement ───────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('users_profiles').select('*').order('created_at', { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }
  useEffect(() => { fetchUsers() }, [])

  // ── Ouverture modales ────────────────────────────────────────
  const openCreate = () => {
    setEditU(null); setShowPassword(false); setForm(EMPTY_FORM)
    setAvatarFile(null); setAvatarPreview(null)
    setError(''); setModal(true)
  }
  const openEdit = (u) => {
    setEditU(u); setShowPassword(false)
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, password: '', role: u.role, actif: u.actif, specialite: u.specialite || '' })
    setAvatarFile(null); setAvatarPreview(u.avatar_url || null)
    setError(''); setModal(true)
  }
  const openProfile = (u) => setViewU(u)

  // ── Sauvegarde ───────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (editU) {
        // ── Upload avatar si nouveau fichier ──
        let avatar_url = editU.avatar_url ?? null
        if (avatarFile) {
          const ext  = avatarFile.name.split('.').pop()
          const path = `${editU.id}.${ext}`
          const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
          if (upErr) throw upErr
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatar_url = `${urlData.publicUrl}?t=${Date.now()}`
        }
        // ── MODIFICATION directe du profil ──
        const updateData = { nom: form.nom, prenom: form.prenom, role: form.role, actif: form.actif, avatar_url }
        if (form.role === 'medecin' || form.role === 'superadmin') updateData.specialite = form.specialite
        const { error: e } = await supabase.from('users_profiles').update(updateData).eq('id', editU.id)
        if (e) throw e

      } else {
        // ── CRÉATION via Edge Function (jamais via service_role côté front) ──
        if (!form.prenom.trim()) throw new Error('Le prénom est requis')
        if (!form.nom.trim())    throw new Error('Le nom est requis')
        if (!form.email.trim())  throw new Error("L'email est requis")
        if (!form.password)      throw new Error('Le mot de passe est requis')
        if (form.password.length < 6) throw new Error('Le mot de passe doit contenir au moins 6 caractères')

        // Récupère le JWT de l'admin connecté — il sera vérifié par l'Edge Function
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !sessionData?.session?.access_token) {
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        }

        // ✅ Token passé dans headers (setAuth supprimé en supabase-js v2.x)
        const { data: rawData, error: fnError } = await supabase.functions.invoke('create-user', {
          body: {
            email:      form.email.trim(),
            password:   form.password,
            role:       form.role,
            nom:        form.nom.trim(),
            prenom:     form.prenom.trim(),
            actif:      true,
            specialite: (form.role === 'medecin' || form.role === 'superadmin') ? form.specialite : '',
          },
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
        })

        // Erreur réseau / fonction inaccessible
        if (fnError) {
          console.error('Edge Function error:', fnError)
          throw new Error(fnError.message ?? 'Impossible de contacter la fonction de création')
        }

        // Erreur métier renvoyée par la fonction dans le body
        const response = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
        if (response?.error) throw new Error(response.error)
      }

      notify({ type: 'success', message: editU ? 'Utilisateur modifié' : 'Utilisateur créé avec succès' })
      await fetchUsers()
      setModal(false)

    } catch (err) {
      const message = err?.message ?? 'Erreur inconnue'
      setError(message)
      notify({ type: 'error', message })
      console.error('handleSave:', err)
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle actif ─────────────────────────────────────────────
  const handleToggleActif = async (u) => {
    const { error } = await supabase.from('users_profiles').update({ actif: !u.actif }).eq('id', u.id)
    if (error) { notify({ type: 'error', message: error.message }); return }
    notify({ type: 'success', message: `Utilisateur ${!u.actif ? 'activé' : 'désactivé'}` })
    fetchUsers()
  }

  // ── Suppression ──────────────────────────────────────────────
  const handleDelete = async () => {
    const { error } = await supabase.from('users_profiles').delete().eq('id', confirmD.id)
    if (error) { notify({ type: 'error', message: error.message }); return }
    notify({ type: 'success', message: 'Utilisateur supprimé' })
    setConfirmD(null); fetchUsers()
  }

  const showMedicalFields = form.role === 'medecin' || form.role === 'superadmin'
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
                {['Utilisateur','Email','Rôle','Spécialité','Statut','Dernière connexion','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun utilisateur</td></tr>
              ) : filtered.map(u => {
                const rc       = ROLES_COLORS[u.role] ?? ROLES_COLORS.assistant
                const lastConn = formatLastSignIn(u.last_sign_in)
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} size="sm" />
                        <span className="font-medium text-gray-900">{u.prenom} {u.nom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${rc.bg} ${rc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                        {ROLES_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {(u.role === 'medecin' || u.role === 'superadmin') ? (u.specialite || '—') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActif(u)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                          u.actif ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {u.actif ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {lastConn ? (
                        <div className="flex items-center gap-1.5">
                          {lastConn.recent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                          <span className={`text-xs ${lastConn.recent ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                            {lastConn.label}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400 italic">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Jamais connecté
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openProfile(u)} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Voir le profil">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Modifier">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmD(u)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
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

          {/* Upload photo */}
          {editU && (
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <UserAvatar user={{ ...editU, avatar_url: avatarPreview }} size="lg" />
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Photo de profil</p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Choisir une photo
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setAvatarFile(file)
                      setAvatarPreview(URL.createObjectURL(file))
                    }}
                  />
                </label>
                {avatarFile && <p className="text-xs text-gray-400 mt-1 truncate max-w-[160px]">{avatarFile.name}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prénom *</label>
              <input value={form.prenom} onChange={e => setForm(f => ({...f, prenom: e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
              <input value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          {!editU && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({...f, password: e.target.value}))}
                    className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-teal-600 rounded"
                    title={showPassword ? 'Masquer' : 'Afficher'}>
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.88 4.24A9.956 9.956 0 0112 4c5 0 9.27 3.11 11 7.5a11.79 11.79 0 01-3.06 4.4M6.1 6.1A11.79 11.79 0 001 11.5C2.73 15.89 7 19 12 19c1.17 0 2.29-.17 3.34-.49" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rôle *</label>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {showMedicalFields && (
            <div className="border-t-2 border-teal-200 pt-3 mt-2">
              <h3 className="text-sm font-semibold text-teal-700 mb-2">👨‍⚕️ Informations médicales</h3>
              <select value={form.specialite} onChange={e => setForm(f => ({...f, specialite: e.target.value}))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">-- Sélectionner une spécialité --</option>
                <option value="Chirurgie dentaire">Chirurgie dentaire</option>
                <option value="Orthodontie">Orthodontie</option>
                <option value="Parodontologie">Parodontologie</option>
                <option value="Endodontie">Endodontie</option>
                <option value="Pédodontie">Pédodontie</option>
                <option value="Prothèse dentaire">Prothèse dentaire</option>
                <option value="Implantologie">Implantologie</option>
              </select>
            </div>
          )}

          {editU && (
            <div className="flex items-center gap-3">
              <input type="checkbox" id="actif" checked={form.actif}
                onChange={e => setForm(f => ({...f, actif: e.target.checked}))}
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

      {/* Modale profil */}
      <Modal isOpen={!!viewU} onClose={() => setViewU(null)}
        title={`Profil de ${viewU?.prenom ?? ''} ${viewU?.nom ?? ''}`.trim()}>
        {viewU && (() => {
          const rc       = ROLES_COLORS[viewU.role] ?? ROLES_COLORS.assistant
          const lastConn = formatLastSignIn(viewU.last_sign_in)
          const createdAt = viewU.created_at
            ? new Date(viewU.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
            : 'Non renseigné'
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <UserAvatar user={viewU} size="lg" />
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">{viewU.prenom} {viewU.nom}</p>
                  <p className="text-sm text-gray-500 truncate">{viewU.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Rôle</p>
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
                {(viewU.role === 'medecin' || viewU.role === 'superadmin') && viewU.specialite && (
                  <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Spécialité</p>
                    <p className="mt-2 text-sm text-gray-700">{viewU.specialite}</p>
                  </div>
                )}
                <div className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Dernière connexion</p>
                  <p className={`mt-2 text-sm ${lastConn?.recent ? 'text-emerald-600 font-medium' : 'text-gray-700'}`}>
                    {lastConn?.label ?? 'Jamais connecté'}
                  </p>
                </div>
                <div className="border border-gray-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date de création</p>
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