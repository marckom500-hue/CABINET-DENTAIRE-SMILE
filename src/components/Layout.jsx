// import { useState, useEffect } from 'react'
// import Sidebar from './Sidebar'
// import ThemeSelector from './ThemeSelector'
// import { useAuthContext } from '../hooks/AuthContext'

// export default function Layout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const { profile } = useAuthContext()

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('dental-theme')
//     if (savedTheme && savedTheme !== 'default') {
//       document.body.classList.add(savedTheme)
//       document.body.classList.add('has-bg-dental')
//     }
//   }, [])

//   // Fermer la sidebar si on passe en desktop
//   useEffect(() => {
//     const mq = window.matchMedia('(min-width: 1024px)')
//     const handler = (e) => { if (e.matches) setSidebarOpen(false) }
//     mq.addEventListener('change', handler)
//     return () => mq.removeEventListener('change', handler)
//   }, [])

//   return (
//     <div className="flex h-screen overflow-hidden has-bg-dental" id="main-layout">

//       {/* ── Overlay mobile ───────────────────────────────────────────────────── */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-20 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
//       <aside
//         className={`
//           fixed inset-y-0 left-0 z-30
//           lg:static lg:z-auto lg:flex-shrink-0
//           transition-transform duration-300 ease-in-out
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//         `}
//       >
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//       </aside>

//       {/* ── Zone principale ──────────────────────────────────────────────────── */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

//         {/* Topbar mobile */}
//         <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10 flex-shrink-0">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
//             aria-label="Ouvrir le menu"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           </button>

//           <span className="font-semibold text-teal-700 font-serif">Cabinet SMILE</span>

//           <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold select-none">
//             {profile?.prenom?.[0]?.toUpperCase() || 'U'}
//           </div>
//         </header>

//         {/* Contenu scrollable */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-6 lg:p-8">
//             {children}
//           </div>
//         </main>

//         {/* Bouton thème — toujours en bas à droite */}
//         <ThemeSelector />
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ThemeSelector from './ThemeSelector'
import { useAuthContext } from '../hooks/AuthContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile } = useAuthContext()

  useEffect(() => {
    const savedTheme = localStorage.getItem('dental-theme')
    if (savedTheme && savedTheme !== 'default') {
      document.body.classList.add(savedTheme)
      document.body.classList.add('has-bg-dental')
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden has-bg-dental" id="main-layout">

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR DESKTOP — dans le flux normal, toujours visible
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:block lg:flex-shrink-0">
        <Sidebar onClose={null} />
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR MOBILE — overlay fixe par-dessus le contenu
      ══════════════════════════════════════════════════════════════════════ */}
      <div className={`
        lg:hidden fixed inset-0 z-40
        transition-all duration-300
        ${sidebarOpen ? 'visible' : 'invisible pointer-events-none'}
      `}>
        {/* Fond sombre */}
        <div
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Panneau */}
        <aside className={`
          absolute inset-y-0 left-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ZONE PRINCIPALE — occupe tout l'écran sur mobile
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar mobile */}
        <header className="lg:hidden flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="font-semibold text-teal-700 font-serif">Cabinet SMILE</span>

          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold select-none">
            {profile?.prenom?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Bouton thème */}
        <ThemeSelector />
      </div>
    </div>
  )
}
