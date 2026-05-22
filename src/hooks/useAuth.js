import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const profileLoadingRef = useRef(false)
  const lastUserIdRef     = useRef(null)

  const fetchProfile = async (userId) => {
    if (!userId) { setProfile(null); setLoading(false); return }
    if (profileLoadingRef.current) return
    profileLoadingRef.current = true

    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
        console.log('âœ… Profil chargÃ© :', { email: data.email, role: data.role })
        return
      }

      // Profil manquant â†’ upsert minimal
      console.warn('âš ï¸  Profil manquant, crÃ©ation auto')
      const { data: userData } = await supabase.auth.getUser()
      const au = userData?.user

      if (au) {
        const { error: upsertErr } = await supabase.from('users_profiles').upsert({
          id: au.id, email: au.email, nom: '', prenom: '', role: 'secretaire', actif: true,
        })
        if (upsertErr) { console.error('âŒ Erreur upsert profil :', upsertErr); setProfile(null); return }

        const { data: fresh, error: freshErr } = await supabase
          .from('users_profiles').select('*').eq('id', au.id).single()

        if (!freshErr && fresh) {
          setProfile(fresh)
          console.log('âœ… Profil crÃ©Ã© :', { email: fresh.email, role: fresh.role })
        } else {
          console.error('âŒ Erreur lecture profil aprÃ¨s upsert :', freshErr)
          setProfile(null)
        }
      }
    } catch (err) {
      console.error('âŒ fetchProfile exception :', err)
      setProfile(null)
    } finally {
      profileLoadingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        const u = session?.user ?? null
        setUser(u)

        if (!u) {
          setProfile(null); setLoading(false); lastUserIdRef.current = null
          console.log('ðŸ”“ Pas de session')
          return
        }

        if (lastUserIdRef.current === u.id) {
          console.log('â­ï¸  MÃªme utilisateur, skip fetch')
          setLoading(false)
          return
        }

        lastUserIdRef.current = u.id
        console.log('ðŸ”„ Chargement profil pour :', u.email)
        await fetchProfile(u.id)
      } catch (err) {
        if (!mounted) return
        console.error('âŒ useEffect getSession error :', err)
        setUser(null); setProfile(null); setLoading(false); lastUserIdRef.current = null
      }
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      const u = session?.user ?? null
      if (u && lastUserIdRef.current === u.id) return
      setUser(u)
      if (u) {
        lastUserIdRef.current = u.id
        console.log('ðŸ”„ Auth change dÃ©tectÃ©, chargement profil')
        setLoading(true)
        fetchProfile(u.id)
      } else {
        lastUserIdRef.current = null
        setProfile(null); setLoading(false)
        console.log('ðŸ”“ Auth change : dÃ©connexion')
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // LOGIN â€” enregistre last_sign_in dans users_profiles
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const login = async (email, password) => {
    console.log('ðŸ” Tentative login :', email)
    const result = await supabase.auth.signInWithPassword({ email, password })

    if (!result.error && result.data?.user) {
      const u = result.data.user
      setUser(u)
      lastUserIdRef.current = u.id
      console.log('âœ… Login OK, profil va charger')

      // Enregistre le timestamp de connexion dans users_profiles
      const { error: tsErr } = await supabase
        .from('users_profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', u.id)

      if (tsErr) {
        console.warn('âš ï¸  Impossible de mettre Ã  jour last_sign_in :', tsErr.message)
      } else {
        console.log('ðŸ• last_sign_in enregistrÃ©')
      }
    } else {
      console.error('âŒ Login Ã©chouÃ© :', result.error?.message)
    }

    return result
  }

  const logout = async () => {
    console.log('ðŸ‘‹ Logout')
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setLoading(false); lastUserIdRef.current = null
  }

  return { user, profile, role: profile?.role ?? null, loading, login, logout }
}
