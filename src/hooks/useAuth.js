// import { useState, useEffect, useRef } from 'react'
// import { supabase } from '../lib/supabase'

// export function useAuth() {
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)

//   // Evite les fetch profile simultanes (source de spam reseau)
//   const profileLoadingRef = useRef(false)
//   // Evite de retraiter le meme utilisateur en boucle
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
//         return
//       }

//       // Profil manquant -> upsert minimal
//       const { data: userData } = await supabase.auth.getUser()
//       const au = userData?.user

//       if (au) {
//         await supabase.from('users_profiles').upsert({
//           id: au.id,
//           email: au.email,
//           nom: '',
//           prenom: '',
//           role: 'secretaire',
//           actif: true,
//         })

//         const { data: fresh } = await supabase
//           .from('users_profiles')
//           .select('*')
//           .eq('id', au.id)
//           .single()

//         if (fresh) setProfile(fresh)
//       } else {
//         setProfile(null)
//       }
//     } catch (err) {
//       console.error('fetchProfile error:', err)
//       setProfile(null)
//     } finally {
//       profileLoadingRef.current = false
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     let mounted = true

//     supabase.auth
//       .getSession()
//       .then(({ data: { session } }) => {
//         if (!mounted) return

//         const u = session?.user ?? null
//         setUser(u)

//         if (!u) {
//           setProfile(null)
//           setLoading(false)
//           lastUserIdRef.current = null
//           return
//         }

//         lastUserIdRef.current = u.id
//         setLoading(true)
//         fetchProfile(u.id)
//       })
//       .catch((err) => {
//         if (!mounted) return
//         console.error('getSession error:', err)
//         setUser(null)
//         setProfile(null)
//         setLoading(false)
//         lastUserIdRef.current = null
//       })

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (!mounted) return

//       const u = session?.user ?? null

//       // Si utilisateur identique et pas de chargement, on ignore
//       if (u && lastUserIdRef.current === u.id && !loading) return

//       setUser(u)

//       if (u) {
//         lastUserIdRef.current = u.id
//         setLoading(true)
//         fetchProfile(u.id)
//       } else {
//         lastUserIdRef.current = null
//         setProfile(null)
//         setLoading(false)
//       }
//     })

//     return () => {
//       mounted = false
//       subscription.unsubscribe()
//     }
//   }, [loading])

//   const login = async (email, password) => {
//     const result = await supabase.auth.signInWithPassword({ email, password })

//     // Fallback local: on force user pour ne pas dependre uniquement du listener
//     if (!result.error && result.data?.user) {
//       setUser(result.data.user)
//       lastUserIdRef.current = result.data.user.id
//     }

//     return result
//   }

//   const logout = async () => {
//     await supabase.auth.signOut()
//     setUser(null)
//     setProfile(null)
//     setLoading(false)
//     lastUserIdRef.current = null
//   }

//   return { user, profile, role: profile?.role ?? null, loading, login, logout }
// }
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Évite les fetch profile simultanés
  const profileLoadingRef = useRef(false)
  // Évite de retraiter le même utilisateur en boucle
  const lastUserIdRef = useRef(null)

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

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

      // Profil manquant → upsert minimal avec role = 'secretaire'
      console.warn('⚠️  Profil manquant, création auto')
      const { data: userData } = await supabase.auth.getUser()
      const au = userData?.user

      if (au) {
        const { error: upsertErr } = await supabase
          .from('users_profiles')
          .upsert({
            id: au.id,
            email: au.email,
            nom: '',
            prenom: '',
            role: 'secretaire',
            actif: true,
          })

        if (upsertErr) {
          console.error('❌ Erreur upsert profil :', upsertErr)
          setProfile(null)
          return
        }

        // Relit après upsert
        const { data: fresh, error: freshErr } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', au.id)
          .single()

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
          setProfile(null)
          setLoading(false)
          lastUserIdRef.current = null
          console.log('🔓 Pas de session')
          return
        }

        // Si c'est le même utilisateur que avant, skip
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
        setUser(null)
        setProfile(null)
        setLoading(false)
        lastUserIdRef.current = null
      }
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return

        const u = session?.user ?? null

        // Si utilisateur identique, on ignore
        if (u && lastUserIdRef.current === u.id) {
          return
        }

        setUser(u)

        if (u) {
          lastUserIdRef.current = u.id
          console.log('🔄 Auth change détecté, chargement profil')
          setLoading(true)
          fetchProfile(u.id)
        } else {
          lastUserIdRef.current = null
          setProfile(null)
          setLoading(false)
          console.log('🔓 Auth change : déconnexion')
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    // ✅ IMPORTANT : dépendance VIDE pour que l'effect ne s'exécute qu'UNE FOIS au montage
  }, [])

  const login = async (email, password) => {
    console.log('🔐 Tentative login :', email)
    const result = await supabase.auth.signInWithPassword({ email, password })

    if (!result.error && result.data?.user) {
      setUser(result.data.user)
      lastUserIdRef.current = result.data.user.id
      console.log('✅ Login OK, profil va charger')
    } else {
      console.error('❌ Login échoué :', result.error?.message)
    }

    return result
  }

  const logout = async () => {
    console.log('👋 Logout')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)
    lastUserIdRef.current = null
  }

  return {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    login,
    logout,
  }
}