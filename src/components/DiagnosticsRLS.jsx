import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function DiagnosticsRLS() {
  const { user } = useAuth()
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDiagnostics = async () => {
      setLoading(true)
      const results = {}

      try {
        // 1. Vérifier l'utilisateur courant
        const { data: currentUser } = await supabase.auth.getUser()
        results.currentUser = currentUser?.user?.email || 'Anonyme'

        // 2. Récupérer le profil
        const { data: profile, error: profileError } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', user?.id)
          .single()
        results.profile = profile || { error: profileError?.message }

        // 3. Tester la requête médecins
        const { data: medecins, error: medecinError } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, role, actif')
          .in('role', ['medecin', 'superadmin'])
          .eq('actif', true)
        
        results.medecinsQuery = {
          count: medecins?.length || 0,
          data: medecins || [],
          error: medecinError?.message,
        }

        // 4. Tester la requête tous les users (pas de filtres)
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, role, actif')
        
        results.allUsersQuery = {
          count: allUsers?.length || 0,
          data: allUsers || [],
          error: allUsersError?.message,
        }

        // 5. Vérifier le rôle de l'utilisateur
        const { data: myRole } = await supabase.rpc('get_my_role')
        results.myRole = myRole || 'Impossible à déterminer'

      } catch (err) {
        results.error = err.message
      }

      setDiagnostics(results)
      setLoading(false)
    }

    runDiagnostics()
  }, [user?.id])

  if (loading) return <div className="p-4 text-gray-600">Diagnostic en cours...</div>

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto text-xs font-mono z-[999]">
      <h3 className="font-bold mb-2 text-red-600">🔧 Diagnostics RLS</h3>
      
      {diagnostics?.error && (
        <div className="mb-2 p-2 bg-red-100 text-red-800 rounded">
          Erreur globale: {diagnostics.error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <strong>Email:</strong> {diagnostics?.currentUser}
        </div>

        <div>
          <strong>Rôle:</strong> {diagnostics?.myRole || 'N/A'}
        </div>

        <div>
          <strong>Profil:</strong>
          {diagnostics?.profile?.error ? (
            <span className="text-red-600"> Erreur: {diagnostics.profile.error}</span>
          ) : (
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-20">
              {JSON.stringify(diagnostics?.profile, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <strong>Médecins trouvés:</strong> {diagnostics?.medecinsQuery?.count || 0}
          {diagnostics?.medecinsQuery?.error && (
            <span className="text-red-600"> Erreur: {diagnostics.medecinsQuery.error}</span>
          )}
          {diagnostics?.medecinsQuery?.data && diagnostics.medecinsQuery.data.length > 0 && (
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-24">
              {JSON.stringify(diagnostics.medecinsQuery.data, null, 2)}
            </pre>
          )}
        </div>

        <div>
          <strong>Tous les users:</strong> {diagnostics?.allUsersQuery?.count || 0}
          {diagnostics?.allUsersQuery?.error && (
            <span className="text-red-600"> Erreur: {diagnostics.allUsersQuery.error}</span>
          )}
          {diagnostics?.allUsersQuery?.data && diagnostics.allUsersQuery.data.length > 0 && (
            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-24">
              {JSON.stringify(diagnostics.allUsersQuery.data, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-3 w-full bg-teal-600 text-white rounded px-2 py-1 text-xs hover:bg-teal-700"
      >
        Rafraîchir
      </button>
    </div>
  )
}
