import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ThemeSelector from './ThemeSelector'
import { useAuthContext } from '../hooks/AuthContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile } = useAuthContext()

  useEffect(() => {
    // Appliquer le thème sauvegardé au chargement
    const savedTheme = localStorage.getItem('dental-theme')
    if (savedTheme && savedTheme !== 'default') {
      document.body.classList.add(savedTheme)
      document.body.classList.add('has-bg-dental')
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden has-bg-dental" id="main-layout">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-64 sm:w-72">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Theme Selector */}
        <ThemeSelector />
        
        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-teal-700 font-serif text-sm">
            Dr. Boutchouang & Associés
          </span>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}


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
//     }
//   }, [])

//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-50">
//       {/* Overlay pour mobile */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black/60 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 
//         lg:relative lg:translate-x-0 lg:z-auto w-72
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//       </aside>

//       {/* Contenu principal */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//          {/* Theme Selector */}
//         <ThemeSelector />

//         {/* Topbar Mobile */}
//         <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
//           <button 
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//             </svg>
//           </button>
          
//           <div className="font-semibold text-teal-700 font-serif">
//             Cabinet SMILE
//           </div>
          
//           <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold">
//             {profile?.prenom?.[0] || 'U'}
//           </div>
//         </div>

//         {/* Topbar Desktop + Contenu */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-4 md:p-6 lg:p-8">
//             {children}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }