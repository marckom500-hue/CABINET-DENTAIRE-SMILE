import { useAuthContext } from '../hooks/AuthContext'
import { canAccess, canWrite } from '../lib/roles'

export function RoleGuard({ module, requireWrite = false, children }) {
  const { role, loading } = useAuthContext()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const ok = requireWrite ? canWrite(role, module) : canAccess(role, module)
  if (!ok) return <AccessDenied />
  return children
}

export function PermissionGate({ module, requireWrite = false, children, fallback = null }) {
  const { role } = useAuthContext()
  const ok = requireWrite ? canWrite(role, module) : canAccess(role, module)
  return ok ? children : (fallback ?? null)
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        Contactez l'administrateur.
      </p>
    </div>
  )
}
