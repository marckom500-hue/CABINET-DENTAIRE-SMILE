// import { useState, useEffect, useRef } from 'react'
// import { supabase } from '../lib/supabase'

// export function useAuth() {
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)

//   // Évite les fetch profile simultanés
//   const profileLoadingRef = useRef(false)
//   // Évite de retraiter le même utilisateur en boucle
//   const lastUserIdRef = useRef(null)

//   const fetchProfile = async (userId) => {
//     if (!userId) {
//       setProfile(null)
//       setLoading(false)
//       return
//     }

//     if (profileLoadingRef.current) return
//     profileLoadingRef.current = true

//     try {
//       const { data, error } = await supabase
//         .from('users_profiles')
//         .select('*')
//         .eq('id', userId)
//         .single()

//       if (!error && data) {
//         setProfile(data)
//         console.log('✅ Profil chargé :', { email: data.email, role: data.role })
//         return
//       }

//       // Profil manquant → upsert minimal avec role = 'secretaire'
//       console.warn('⚠️  Profil manquant, création auto')
//       const { data: userData } = await supabase.auth.getUser()
//       const au = userData?.user

//       if (au) {
//         const { error: upsertErr } = await supabase
//           .from('users_profiles')
//           .upsert({
//             id: au.id,
//             email: au.email,
//             nom: '',
//             prenom: '',
//             role: 'secretaire',
//             actif: true,
//           })

//         if (upsertErr) {
//           console.error('❌ Erreur upsert profil :', upsertErr)
//           setProfile(null)
//           return
//         }

//         // Relit après upsert
//         const { data: fresh, error: freshErr } = await supabase
//           .from('users_profiles')
//           .select('*')
//           .eq('id', au.id)
//           .single()

//         if (!freshErr && fresh) {
//           setProfile(fresh)
//           console.log('✅ Profil créé :', { email: fresh.email, role: fresh.role })
//         } else {
//           console.error('❌ Erreur lecture profil après upsert :', freshErr)
//           setProfile(null)
//         }
//       }
//     } catch (err) {
//       console.error('❌ fetchProfile exception :', err)
//       setProfile(null)
//     } finally {
//       profileLoadingRef.current = false
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     let mounted = true

//     ;(async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession()
//         if (!mounted) return

//         const u = session?.user ?? null
//         setUser(u)

//         if (!u) {
//           setProfile(null)
//           setLoading(false)
//           lastUserIdRef.current = null
//           console.log('🔓 Pas de session')
//           return
//         }

//         // Si c'est le même utilisateur que avant, skip
//         if (lastUserIdRef.current === u.id) {
//           console.log('⏭️  Même utilisateur, skip fetch')
//           setLoading(false)
//           return
//         }

//         lastUserIdRef.current = u.id
//         console.log('🔄 Chargement profil pour :', u.email)
//         await fetchProfile(u.id)
//       } catch (err) {
//         if (!mounted) return
//         console.error('❌ useEffect getSession error :', err)
//         setUser(null)
//         setProfile(null)
//         setLoading(false)
//         lastUserIdRef.current = null
//       }
//     })()

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         if (!mounted) return

//         const u = session?.user ?? null

//         // Si utilisateur identique, on ignore
//         if (u && lastUserIdRef.current === u.id) {
//           return
//         }

//         setUser(u)

//         if (u) {
//           lastUserIdRef.current = u.id
//           console.log('🔄 Auth change détecté, chargement profil')
//           setLoading(true)
//           fetchProfile(u.id)
//         } else {
//           lastUserIdRef.current = null
//           setProfile(null)
//           setLoading(false)
//           console.log('🔓 Auth change : déconnexion')
//         }
//       }
//     )

//     return () => {
//       mounted = false
//       subscription.unsubscribe()
//     }
//     // ✅ IMPORTANT : dépendance VIDE pour que l'effect ne s'exécute qu'UNE FOIS au montage
//   }, [])

//   const login = async (email, password) => {
//     console.log('🔐 Tentative login :', email)
//     const result = await supabase.auth.signInWithPassword({ email, password })

//     if (!result.error && result.data?.user) {
//       setUser(result.data.user)
//       lastUserIdRef.current = result.data.user.id
//       console.log('✅ Login OK, profil va charger')
//     } else {
//       console.error('❌ Login échoué :', result.error?.message)
//     }

//     return result
//   }

//   const logout = async () => {
//     console.log('👋 Logout')
//     await supabase.auth.signOut()
//     setUser(null)
//     setProfile(null)
//     setLoading(false)
//     lastUserIdRef.current = null
//   }

//   return {
//     user,
//     profile,
//     role: profile?.role ?? null,
//     loading,
//     login,
//     logout,
//   }
// }

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
        console.log('✅ Profil chargé :', { email: data.email, role: data.role })
        return
      }

      // Profil manquant → upsert minimal
      console.warn('⚠️  Profil manquant, création auto')
      const { data: userData } = await supabase.auth.getUser()
      const au = userData?.user

      if (au) {
        const { error: upsertErr } = await supabase.from('users_profiles').upsert({
          id: au.id, email: au.email, nom: '', prenom: '', role: 'secretaire', actif: true,
        })
        if (upsertErr) { console.error('❌ Erreur upsert profil :', upsertErr); setProfile(null); return }

        const { data: fresh, error: freshErr } = await supabase
          .from('users_profiles').select('*').eq('id', au.id).single()

        if (!freshErr && fresh) {
          setProfile(fresh)
          console.log('✅ Profil créé :', { email: fresh.email, role: fresh.role })
        } else {
          console.error('❌ Erreur lecture profil après upsert :', freshErr)
          setProfile(null)
        }
      }
    } catch (err) {
      console.error('❌ fetchProfile exception :', err)
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
          console.log('🔓 Pas de session')
          return
        }

        if (lastUserIdRef.current === u.id) {
          console.log('⏭️  Même utilisateur, skip fetch')
          setLoading(false)
          return
        }

        lastUserIdRef.current = u.id
        console.log('🔄 Chargement profil pour :', u.email)
        await fetchProfile(u.id)
      } catch (err) {
        if (!mounted) return
        console.error('❌ useEffect getSession error :', err)
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
        console.log('🔄 Auth change détecté, chargement profil')
        setLoading(true)
        fetchProfile(u.id)
      } else {
        lastUserIdRef.current = null
        setProfile(null); setLoading(false)
        console.log('🔓 Auth change : déconnexion')
      }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  // ─────────────────────────────────────────────────────────────
  // LOGIN — enregistre last_sign_in dans users_profiles
  // ─────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    console.log('🔐 Tentative login :', email)
    const result = await supabase.auth.signInWithPassword({ email, password })

    if (!result.error && result.data?.user) {
      const u = result.data.user
      setUser(u)
      lastUserIdRef.current = u.id
      console.log('✅ Login OK, profil va charger')

      // Enregistre le timestamp de connexion dans users_profiles
      const { error: tsErr } = await supabase
        .from('users_profiles')
        .update({ last_sign_in: new Date().toISOString() })
        .eq('id', u.id)

      if (tsErr) {
        console.warn('⚠️  Impossible de mettre à jour last_sign_in :', tsErr.message)
      } else {
        console.log('🕐 last_sign_in enregistré')
      }
    } else {
      console.error('❌ Login échoué :', result.error?.message)
    }

    return result
  }

  const logout = async () => {
    console.log('👋 Logout')
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setLoading(false); lastUserIdRef.current = null
  }

  return { user, profile, role: profile?.role ?? null, loading, login, logout }
}