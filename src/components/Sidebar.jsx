// import { NavLink, useNavigate } from 'react-router-dom'
// import { useAuthContext } from '../hooks/AuthContext'
// import { getNavItems, ROLES_LABELS, ROLES_COLORS } from '../lib/roles'

// const ICONS = {
//   home:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
//   calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
//   users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
//   document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
//   invoice:  'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
//   stock:    'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
//   bell:     'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
//   chart:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
//   admin:    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
// }

// export default function Sidebar({ onClose }) {
//   const { role, profile, user, loading, logout } = useAuthContext()
//   const navigate  = useNavigate()
//   const navItems  = getNavItems(role)
//   const roleColor = ROLES_COLORS[role] ?? ROLES_COLORS.assistant

//   const prenom = profile?.prenom?.trim() || ''
//   const nom    = profile?.nom?.trim()    || ''
//   const email  = profile?.email || user?.email || ''

//   const displayName = prenom || nom
//     ? `${prenom} ${nom}`.trim()
//     : email.split('@')[0] || 'Utilisateur'

//   const initials = prenom && nom
//     ? `${prenom[0]}${nom[0]}`.toUpperCase()
//     : (prenom || email).slice(0, 2).toUpperCase() || '??'

//   const handleLogout = async () => { await logout(); navigate('/login') }

//   return (
//     <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg lg:shadow-none">
//       {/* Logo */}
//       <div className="p-5 border-b border-gray-100 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
//             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//             </svg>
//           </div>
//           <div>
//             <h1 className="text-sm font-bold text-gray-900 font-serif leading-tight">SMILE</h1>
//             <p className="text-xs text-teal-600 leading-tight">Dr. Boutchouang & Associés</p>
//           </div>
//         </div>
//         {onClose && (
//           <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         )}
//       </div>

//       {/* Navigation filtrée par rôle */}
//       <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
//         {loading ? (
//           <div className="space-y-1">
//             {[1,2,3,4].map(i => <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />)}
//           </div>
//         ) : navItems.map(item => (
//           <NavLink key={item.path} to={item.path} end={item.path === '/'}
//             onClick={onClose}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
//                 isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//               }`
//             }>
//             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ICONS[item.icon]} />
//             </svg>
//             <span>{item.label}</span>
//             {item.badge && (
//               <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
//                 {item.badge}
//               </span>
//             )}
//           </NavLink>
//         ))}
//       </nav>

//       {/* Footer : profil de l'utilisateur connecté */}
//       <div className="p-3 border-t border-gray-100">
//         {loading ? (
//           <div className="flex items-center gap-3 px-3 py-2">
//             <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
//             <div className="flex-1 space-y-1.5">
//               <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
//               <div className="h-2.5 bg-gray-100 rounded animate-pulse w-16" />
//             </div>
//           </div>
//         ) : (
//           <div className="flex items-center gap-3 px-3 py-2">
//             <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//               {initials}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
//               <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${roleColor.bg} ${roleColor.text}`}>
//                 <span className={`w-1.5 h-1.5 rounded-full ${roleColor.dot}`} />
//                 {ROLES_LABELS[role] ?? 'Utilisateur'}
//               </span>
//             </div>
//             <button onClick={handleLogout} title="Déconnexion"
//               className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//               </svg>
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/AuthContext'
import { getNavItems, ROLES_LABELS, ROLES_COLORS } from '../lib/roles'

const ICONS = {
  home:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  invoice:  'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  stock:    'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  bell:     'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  chart:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  admin:    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
}

export default function Sidebar({ onClose }) {
  const { role, profile, user, loading, logout } = useAuthContext()
  const navigate = useNavigate()

  // FIX : si profil chargé mais role null → fallback 'secretaire' pour toujours afficher la nav
  const effectiveRole = loading ? null : (role ?? 'secretaire')
  const navItems  = getNavItems(effectiveRole)
  const roleColor = ROLES_COLORS[effectiveRole] ?? ROLES_COLORS.secretaire

  const prenom = profile?.prenom?.trim() || ''
  const nom    = profile?.nom?.trim()    || ''
  const email  = profile?.email || user?.email || ''

  const displayName = (prenom || nom)
    ? `${prenom} ${nom}`.trim()
    : email.split('@')[0] || 'Utilisateur'

  const initials = prenom && nom
    ? `${prenom[0]}${nom[0]}`.toUpperCase()
    : (prenom || email).slice(0, 2).toUpperCase() || '??'

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg lg:shadow-none">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-700 to-teal-500 rounded-lg flex items-center justify-center">
           <img src="/SMILE.jpg" alt="Logo entreprise" className="h-14 w-14 object-contain" />
          </div>

          <div>
            <h1 className="text-sm font-bold text-gray-900 font-serif leading-tight">
              CABINET DENTAIRE SMILE
            </h1>
            <p className="text-xs text-teal-600 leading-tight">Dr. Boutchouang & Associés</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                <div className="h-3 bg-gray-200 rounded animate-pulse flex-1" />
              </div>
            ))}
          </div>
        ) : (
          navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ICONS[item.icon]} />
              </svg>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))
        )}
      </nav>

      {/* Footer profil */}
      <div className="p-3 border-t border-gray-100">
        {loading ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-2.5 bg-gray-100 rounded animate-pulse w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${roleColor.bg} ${roleColor.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleColor.dot}`} />
                {ROLES_LABELS[effectiveRole] ?? 'Utilisateur'}
              </span>
            </div>
            <button onClick={handleLogout} title="Déconnexion"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
