import Topbar from '../components/Topbar'
import KPICard from '../components/KPICard'
import AppointmentList from '../components/AppointmentList'
import PatientList from '../components/PatientList'
import DonutChart from '../components/DonutChart'
import Notifications from '../components/Notifications'
import RevenueChart from '../components/RevenueChart'
import StockList from '../components/StockList'
import { mockPatients, mockStock } from '../data/mockData'
import { useRendezVous } from '../hooks/useRendezVous'
import { usePatients } from '../hooks/usePatients'
import { useFactures } from '../hooks/useFactures'
import { useNotifications } from '../hooks/NotificationsContext'

export default function Dashboard() {
  const { notifications } = useNotifications()
  const { rendezVous, loading: rdvLoading } = useRendezVous()
  const { patients, loading: patientsLoading } = usePatients()
  const { factures, loading: facturesLoading, total, encaisse } = useFactures()

  // Filter appointments for today
  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = rendezVous.filter(r => {
    // Compare date part only (YYYY-MM-DD format)
    const rdvDate = r.date instanceof Date 
      ? r.date.toISOString().split('T')[0] 
      : r.date.split('T')[0]
    return rdvDate === today
  })

  // Transform real appointments to match AppointmentList format
  const appointmentsForList = todayAppointments.map(r => ({
    id: r.id,
    time: r.heure,
    patient: r.patients ? `${r.patients.prenom} ${r.patients.nom}` : 'Patient inconnu',
    type: r.type_acte,
    status: r.statut,
    color: r.statut === 'confirme' ? '#0d9488' : 
           r.statut === 'urgent' ? '#f43f5e' : 
           r.statut === 'attente' ? '#f59e0b' : '#94a3b8'
  }))

  // Calculate real KPIs from database
  const totalPatients = patients.length
  const urgentToday = todayAppointments.filter(a => a.statut === 'urgent').length
  
  // Calculate monthly revenue (current month)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = factures
    .filter(f => {
      const fDate = new Date(f.date)
      return fDate.getMonth() === currentMonth && fDate.getFullYear() === currentYear
    })
    .reduce((sum, f) => sum + (f.montant || 0), 0)

  // Build KPIs with real data
  const kpiData = [
    { 
      id: 1, 
      label: 'Patients total', 
      value: totalPatients.toString(), 
      trend: '+12%', 
      trendUp: true, 
      color: 'teal', 
      icon: 'users' 
    },
    { 
      id: 2, 
      label: "RDV aujourd'hui", 
      value: todayAppointments.length.toString(), 
      trend: `${urgentToday} urgents`, 
      trendUp: null, 
      color: 'blue', 
      icon: 'calendar'
    },
    { 
      id: 3, 
      label: 'Chiffre d\'affaires', 
      value: `${monthlyRevenue.toLocaleString('fr-FR')} FCFA`, 
      trend: `${encaisse.toLocaleString('fr-FR')} FCFA encaissés`, 
      trendUp: true, 
      color: 'green', 
      icon: 'money'
    },
    { 
      id: 4, 
      label: 'Urgences', 
      value: urgentToday.toString(), 
      trend: `${rendezVous.filter(r => r.statut === 'urgent').length} cette semaine`, 
      trendUp: urgentToday > 0 ? false : null, 
      color: 'red', 
      icon: 'alert'
    },
  ]

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <Topbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiData.map(k => <KPICard key={k.id} {...k} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          {rdvLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              Chargement des rendez-vous...
            </div>
          ) : (
            <AppointmentList appointments={appointmentsForList} />
          )}
        </div>
        <Notifications notifications={notifications} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RevenueChart factures={factures} loading={facturesLoading} />
        <DonutChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <PatientList patients={mockPatients} /><StockList stocks={mockStock} />
      </div>
    </div>
  )
}
