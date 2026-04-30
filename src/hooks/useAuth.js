import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('users_profiles').select('*').eq('id', userId).single()

    if (!error && data) {
      setProfile(data)
    } else {
      // Profil manquant → upsert minimal
      const { data: { user: au } } = await supabase.auth.getUser()
      if (au) {
        await supabase.from('users_profiles').upsert({
          id: au.id, email: au.email, nom: '', prenom: '', role: 'secretaire', actif: true,
        })
        const { data: fresh } = await supabase
          .from('users_profiles').select('*').eq('id', au.id).single()
        if (fresh) setProfile(fresh)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) { setLoading(true); fetchProfile(u.id) }
      else   { setProfile(null); setLoading(false)  }
    })
    return () => subscription.unsubscribe()
  }, [])

  const login  = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const logout = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null) }

  return { user, profile, role: profile?.role ?? null, loading, login, logout }
}
