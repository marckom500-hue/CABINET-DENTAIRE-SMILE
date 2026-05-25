import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useAuthContext } from '../hooks/AuthContext'
import { getNavItems, ROLES_LABELS, ROLES_COLORS } from '../lib/roles'
import { supabase } from '../lib/supabase'

const ICONS = {
  home:     "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  users:    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  invoice:  "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  stock:    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  bell:     "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  chart:    "M13 7h8m0 0v8m0-8l-9 9-4-4-6 6",
  admin:    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  rappels:  "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
}

export default function Sidebar({ onClose }) {
  const { role, profile, loading, logout, refreshProfile } = useAuthContext()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [preview, setPreview]         = useState(null)
  const fileInputRef = useRef(null)

  const effectiveRole = loading ? null : (role ?? 'secretaire')
  const navItems  = getNavItems(effectiveRole)
  const roleColor = ROLES_COLORS[effectiveRole] ?? ROLES_COLORS.secretaire

  const prenom = profile?.prenom?.trim() || ''
  const nom    = profile?.nom?.trim()    || ''
  const displayName = (prenom || nom) ? `${prenom} ${nom}`.trim() : 'Utilisateur'
  const initials = prenom && nom
    ? `${prenom[0]}${nom[0]}`.toUpperCase()
    : displayName.slice(0, 2).toUpperCase() || '??'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `${profile.id}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`
      await supabase.from('users_profiles').update({ avatar_url }).eq('id', profile.id)
      await refreshProfile()
    } catch (err) {
      console.error('Upload avatar:', err)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    // style inline pour forcer le fond blanc même si un thème CSS l'override
    <div
      className="w-72 h-full flex flex-col shadow-xl lg:shadow-none"
      style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-1)', backgroundImage: 'none' }}
    >

      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full border-2 border-teal-100 bg-white p-2 shadow-lg shadow-teal-900/10 ring-4 ring-teal-50 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src="/SMILE.jpg"
              alt="Logo SMILE"
              className="w-full h-full rounded-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold font-serif leading-tight" style={{ color: 'var(--text-1)' }}>CABINET DENTAIRE SMILE</h1>
            <p className="text-xs text-teal-600">Dr. Boutchouang &amp; Associés</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
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
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700 shadow-sm' : 'hover:bg-teal-50 hover:text-teal-700'
                }`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--text-2)' }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICONS[item.icon] || ICONS.home} />
              </svg>
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))
        )}
      </nav>

      {/* ── Footer profil ──────────────────────────────────────────────────── */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-1)' }}>
        <div
          onClick={() => { setPreview(profile?.avatar_url || null); setShowProfile(true) }}
          className="flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all group"
          style={{ backgroundColor: 'var(--bg-row)', border: '1px solid var(--border-1)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(13,148,136,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-row)' }}
        >
          {(profile?.avatar_url)
            ? <img src={profile.avatar_url} alt={displayName}
                className="w-10 h-10 rounded-2xl object-cover flex-shrink-0 border border-gray-200" />
            : <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {initials}
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-sm" style={{ color: 'var(--text-1)' }}>{displayName}</p>
            <span className={`text-xs px-2.5 py-0.5 rounded-full ${roleColor.bg} ${roleColor.text}`}>
              {ROLES_LABELS[effectiveRole] ?? 'Utilisateur'}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout() }}
            className="p-2 hover:text-red-500 rounded-xl transition-colors"
            style={{ color: 'var(--text-3)' }}
            title="Déconnexion"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Modale profil ─────────────────────────────────────────────────── */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfile(false)} />

          <div className="relative rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
            {/* Bandeau haut */}
            <div className="h-24 sm:h-32 bg-gradient-to-r from-teal-500 to-teal-600" />

            {/* Avatar centré sur le bandeau */}
            <div className="flex justify-center -mt-12 sm:-mt-14 mb-3">
              <div className="relative">
                {(preview || profile?.avatar_url)
                  ? <img src={preview || profile.avatar_url} alt={displayName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                  : <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-teal-600 border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                      {initials}
                    </div>
                }
                {/* Bouton caméra */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 w-8 h-8 sm:w-9 sm:h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
                  title="Changer la photo"
                >
                  {uploading
                    ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  }
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>

            {/* Infos */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-5">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{displayName}</p>
                <p className="text-sm sm:text-base mt-0.5 text-gray-500">{profile?.email}</p>
                <span className={`mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1 rounded-full ${roleColor.bg} ${roleColor.text}`}>
                  <span className={`w-2 h-2 rounded-full ${roleColor.dot}`} />
                  {ROLES_LABELS[effectiveRole] ?? 'Utilisateur'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {profile?.specialite && (
                  <div className="col-span-2 bg-teal-50 rounded-xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-1">Spécialité</p>
                    <p className="font-semibold text-teal-700 sm:text-base">{profile.specialite}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-1">Statut</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium ${
                    profile?.actif ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${profile?.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {profile?.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide mb-1">Membre depuis</p>
                  <p className="font-medium text-gray-700 text-xs sm:text-sm">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-center text-gray-400">Cliquez sur 📷 pour changer votre photo</p>

              <button
                onClick={() => setShowProfile(false)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base font-medium rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
