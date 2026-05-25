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
    <div className="flex h-screen overflow-hidden" id="main-layout">

      {/* ── Sidebar desktop : dans le flux, fond blanc isolé du thème ────────── */}
      <aside
        className="hidden lg:block lg:flex-shrink-0 relative z-10"
        style={{ backgroundColor: 'var(--bg-sidebar)', backgroundImage: 'none' }}
      >
        <Sidebar onClose={null} />
      </aside>

      {/* ── Sidebar mobile : overlay complet par-dessus tout ─────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Fond sombre */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Panneau sidebar — fond blanc isolé du thème */}
          <div
            className="absolute inset-y-0 left-0 z-10"
            style={{ backgroundColor: 'var(--bg-sidebar)', backgroundImage: 'none' }}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Zone principale : reçoit le thème de fond ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden has-bg-dental" id="theme-area">

        {/* Topbar mobile */}
        <header
          className="lg:hidden flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-1)', backgroundImage: 'none' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-11 h-8 rounded-xl border border-teal-100 bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/SMILE.jpg" alt="Logo SMILE" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-teal-700 font-serif text-sm truncate">Cabinet DENTAIRE SMILE</span>
          </div>

          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold select-none">
            {profile?.prenom?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>

        {/* Contenu scrollable — le thème s'affiche ici */}
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
