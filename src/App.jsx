import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuthContext } from './hooks/AuthContext'
import { RoleGuard } from './components/RoleGuard'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RendezVous from './pages/RendezVous'
import MedecinRdv from './pages/MedecinRdv'
import Patients from './pages/Patients'
import Ordonnances from './pages/Ordonnances'
import Facturation from './pages/Facturation'
import Devis from './pages/Devis'
import Stock from './pages/Stock'
import Rappels from './pages/Rappels'
import Rapports from './pages/Rapports'
import Utilisateurs from './pages/Utilisateurs'
import { NotificationsProvider } from './hooks/NotificationsContext'

function AppRoutes() {
  const { user, loading } = useAuthContext()

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  )

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/"             element={<Dashboard />} />
        <Route path="/rendez-vous"  element={<RoleGuard module="rendez_vous"><RendezVous /></RoleGuard>} />
        <Route path="/mes-rdv"      element={<RoleGuard module="rendez_vous"><MedecinRdv /></RoleGuard>} />
        <Route path="/patients"     element={<RoleGuard module="patients"><Patients /></RoleGuard>} />
        <Route path="/ordonnances"  element={<RoleGuard module="ordonnances"><Ordonnances /></RoleGuard>} />
        <Route path="/facturation"  element={<RoleGuard module="facturation"><Facturation /></RoleGuard>} />
        <Route path="/devis"        element={<RoleGuard module="devis"><Devis /></RoleGuard>} />
        <Route path="/stock"        element={<RoleGuard module="stock"><Stock /></RoleGuard>} />
        <Route path="/rappels"      element={<RoleGuard module="rappels"><Rappels /></RoleGuard>} />
        <Route path="/rapports"     element={<RoleGuard module="rapports"><Rapports /></RoleGuard>} />
        <Route path="/utilisateurs" element={<RoleGuard module="gestion_users"><Utilisateurs /></RoleGuard>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <AppRoutes />
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
