import Topbar from '../components/Topbar'
import KPICard from '../components/KPICard'
import AppointmentList from '../components/AppointmentList'
import PatientList from '../components/PatientList'
import DonutChart from '../components/DonutChart'
import Notifications from '../components/Notifications'
import RevenueChart from '../components/RevenueChart'
import StockList from '../components/StockList'

import { useRendezVous } from '../hooks/useRendezVous'
import { usePatients } from '../hooks/usePatients'
import { useFactures } from '../hooks/useFactures'
import { useStock } from '../hooks/useStock'
import { useDevis } from '../hooks/useDevis'
import { useAuthContext } from '../hooks/AuthContext'
import { useNotifications } from '../hooks/NotificationsContext'
import { DEVIS_STATUS, DEVIS_STATUS_META, FACTURE_STATUS, FACTURE_STATUS_META, RDV_STATUS, RDV_STATUS_META, normalizeDevisStatus, normalizeFactureStatus, normalizeRdvStatus } from '../lib/statuses'

const ACTE_COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#94a3b8', '#ef4444']

function getRdvDateTime(rdv) {
  return new Date(`${rdv.date?.split('T')[0] ?? ''}T${rdv.heure || '00:00'}`)
}

function formatVisitDate(rdv) {
  const date = getRdvDateTime(rdv)
  if (Number.isNaN(date.getTime())) return rdv.type_acte || 'RDV'
  const datePart = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  const timePart = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} - ${timePart} - ${rdv.type_acte || 'RDV'}`
}

function toAmount(value) {
  return Number(value || 0)
}

function formatMoney(value) {
  return `${toAmount(value).toLocaleString('fr-FR')} FCFA`
}

function sameMonth(dateValue, month, year) {
  const date = new Date(dateValue)
  return !Number.isNaN(date.getTime()) && date.getMonth() === month && date.getFullYear() === year
}

function isDevisAccepted(statut = '') {
  return ['accepté', 'accepte'].includes(statut.toLowerCase())
}

function isDevisPending(statut = '') {
  return ['brouillon', 'envoyé', 'envoye'].includes(statut.toLowerCase())
}

function FinanceCard({ label, value, tone = 'teal', detail }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  }
  return (
    <div className={`rounded-xl p-4 ${tones[tone] ?? tones.teal}`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-xl lg:text-2xl font-bold truncate">{value}</p>
      {detail && <p className="text-xs text-gray-500 mt-2 truncate">{detail}</p>}
    </div>
  )
}

function FinanceList({ title, rows, empty }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full min-h-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2 overflow-y-auto pr-1">
        {rows.length === 0 && <div className="text-sm text-gray-400 text-center py-8">{empty}</div>}
        {rows.map(row => (
          <div key={row.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{row.title}</p>
              <p className="text-xs text-gray-500 truncate">{row.subtitle}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">{formatMoney(row.amount)}</p>
              <p className={`text-xs ${row.tone || 'text-gray-500'}`}>{row.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuthContext()
  const { notifications } = useNotifications()
  const { rendezVous, loading: rdvLoading } = useRendezVous()
  const { patients } = usePatients()
  const { factures, loading: facturesLoading, encaisse } = useFactures()
  const { stock, loading: stockLoading } = useStock()
  const { devis, loading: devisLoading } = useDevis()

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = rendezVous.filter(r => {
    const rdvDate = r.date instanceof Date
      ? r.date.toISOString().split('T')[0]
      : r.date?.split('T')[0]
    return rdvDate === today
  })

  const appointmentsForList = todayAppointments.map(r => ({
    id: r.id,
    time: r.heure,
    schedule: formatVisitDate(r),
    patient: r.patients ? `${r.patients.prenom} ${r.patients.nom}` : 'Patient inconnu',
    type: r.type_acte,
    status: r.statut,
    color: RDV_STATUS_META[normalizeRdvStatus(r.statut)]?.color ?? '#94a3b8',
  }))

  const recentPatients = rendezVous
    .filter(r => r.patients && normalizeRdvStatus(r.statut) === RDV_STATUS.RECU)
    .sort((a, b) => getRdvDateTime(b) - getRdvDateTime(a))
    .reduce((list, rdv) => {
      const id = rdv.patient_id ?? `${rdv.patients.nom}-${rdv.patients.prenom}-${rdv.patients.telephone}`
      if (list.some(p => p.id === id)) return list
      return [
        ...list,
        {
          id,
          nom: rdv.patients.nom,
          prenom: rdv.patients.prenom,
          telephone: rdv.patients.telephone,
          statut: 'Recu',
          detail: formatVisitDate(rdv),
        },
      ]
    }, [])
    .slice(0, 8)

  const actesData = Object.entries(
    rendezVous
      .filter(r => r.type_acte && normalizeRdvStatus(r.statut) !== RDV_STATUS.ANNULE)
      .reduce((acc, rdv) => {
        acc[rdv.type_acte] = (acc[rdv.type_acte] || 0) + 1
        return acc
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], index) => ({
      label,
      value,
      color: ACTE_COLORS[index % ACTE_COLORS.length],
    }))

  const totalPatients = patients.length
  const urgentToday = todayAppointments.filter(a => normalizeRdvStatus(a.statut) === RDV_STATUS.URGENT).length
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyRevenue = factures
    .filter(f => {
      const fDate = new Date(f.date)
      return fDate.getMonth() === currentMonth && fDate.getFullYear() === currentYear && normalizeFactureStatus(f.statut) !== FACTURE_STATUS.ANNULE
    })
    .reduce((sum, f) => sum + (f.montant || 0), 0)

  const kpiData = [
    {
      id: 1,
      label: 'Patients total',
      value: totalPatients.toString(),
      trend: `${recentPatients.length} recus recemment`,
      trendUp: true,
      color: 'teal',
      icon: 'users',
    },
    {
      id: 2,
      label: "RDV aujourd'hui",
      value: todayAppointments.length.toString(),
      trend: `${urgentToday} urgents`,
      trendUp: null,
      color: 'blue',
      icon: 'calendar',
    },
    {
      id: 3,
      label: "Chiffre d'affaires",
      value: `${monthlyRevenue.toLocaleString('fr-FR')} FCFA`,
      trend: `${encaisse.toLocaleString('fr-FR')} FCFA encaisses`,
      trendUp: true,
      color: 'green',
      icon: 'money',
    },
    {
      id: 4,
      label: 'Urgences',
      value: urgentToday.toString(),
      trend: `${rendezVous.filter(r => normalizeRdvStatus(r.statut) === RDV_STATUS.URGENT).length} au total`,
      trendUp: urgentToday > 0 ? false : null,
      color: 'red',
      icon: 'alert',
    },
  ]

  const totalFacture = factures.reduce((sum, f) => sum + (normalizeFactureStatus(f.statut) !== FACTURE_STATUS.ANNULE ? toAmount(f.montant) : 0), 0)
  const restant = factures
    .filter(f => normalizeFactureStatus(f.statut) === FACTURE_STATUS.ATTENTE)
    .reduce((sum, f) => sum + toAmount(f.montant), 0)
  const facturesEnAttente = factures.filter(f => normalizeFactureStatus(f.statut) === FACTURE_STATUS.ATTENTE)
  const devisEnAttente = devis.filter(d => [DEVIS_STATUS.BROUILLON, DEVIS_STATUS.ENVOYE].includes(normalizeDevisStatus(d.statut)))
  const devisAcceptes = devis.filter(d => normalizeDevisStatus(d.statut) === DEVIS_STATUS.ACCEPTE)
  const devisAcceptesMontant = devisAcceptes.reduce((sum, d) => sum + toAmount(d.montant_total), 0)
  const monthlyEncaisse = factures
    .filter(f => normalizeFactureStatus(f.statut) === FACTURE_STATUS.PAYE && sameMonth(f.date, currentMonth, currentYear))
    .reduce((sum, f) => sum + toAmount(f.montant), 0)
  const monthlyPending = facturesEnAttente
    .filter(f => sameMonth(f.date, currentMonth, currentYear))
    .reduce((sum, f) => sum + toAmount(f.montant), 0)
  const recentFactures = [...factures]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 8)
    .map(f => ({
      id: f.id,
      title: f.patients ? `${f.patients.prenom} ${f.patients.nom}` : 'Patient non renseigne',
      subtitle: `${f.acte || 'Facture'} - ${f.date ? new Date(f.date).toLocaleDateString('fr-FR') : 'Sans date'}`,
      amount: f.montant,
      status: FACTURE_STATUS_META[normalizeFactureStatus(f.statut)]?.label ?? 'En attente',
      tone: normalizeFactureStatus(f.statut) === FACTURE_STATUS.PAYE ? 'text-green-600' : normalizeFactureStatus(f.statut) === FACTURE_STATUS.ANNULE ? 'text-gray-500' : 'text-amber-600',
    }))
  const recentDevis = [...devis]
    .sort((a, b) => new Date(b.date_creation || 0) - new Date(a.date_creation || 0))
    .slice(0, 8)
    .map(d => ({
      id: d.id,
      title: d.numero || 'Devis',
      subtitle: `${d.date_creation ? new Date(d.date_creation).toLocaleDateString('fr-FR') : 'Sans date'} - ${DEVIS_STATUS_META[normalizeDevisStatus(d.statut)]?.label ?? 'Brouillon'}`,
      amount: d.montant_total,
      status: DEVIS_STATUS_META[normalizeDevisStatus(d.statut)]?.label ?? 'Brouillon',
      tone: normalizeDevisStatus(d.statut) === DEVIS_STATUS.ACCEPTE ? 'text-green-600' : 'text-blue-600',
    }))
  const financeAlerts = [
    ...facturesEnAttente.slice(0, 5).map(f => ({
      id: `facture-${f.id}`,
      title: 'Facture en attente',
      subtitle: f.patients ? `${f.patients.prenom} ${f.patients.nom}` : f.acte || 'Facture',
      amount: f.montant,
      status: 'A encaisser',
      tone: 'text-amber-600',
    })),
    ...devisEnAttente.slice(0, 5).map(d => ({
      id: `devis-${d.id}`,
      title: 'Devis a suivre',
      subtitle: d.numero || d.statut || 'Devis',
      amount: d.montant_total,
      status: DEVIS_STATUS_META[normalizeDevisStatus(d.statut)]?.label ?? 'En cours',
      tone: 'text-blue-600',
    })),
  ].slice(0, 10)

  if (profile?.role === 'comptable') {
    return (
      <div className="space-y-3 md:space-y-4 pb-20 lg:pb-0 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        <Topbar />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <FinanceCard label="CA facture" value={formatMoney(totalFacture)} detail={`${formatMoney(monthlyRevenue)} ce mois`} />
          <FinanceCard label="Encaisse" value={formatMoney(encaisse)} tone="green" detail={`${formatMoney(monthlyEncaisse)} ce mois`} />
          <FinanceCard label="Reste a encaisser" value={formatMoney(restant)} tone="amber" detail={`${facturesEnAttente.length} facture(s) en attente`} />
          <FinanceCard label="Devis acceptes" value={formatMoney(devisAcceptesMontant)} tone="blue" detail={`${devisAcceptes.length} devis accepte(s)`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-3 lg:h-[calc(100%-9.25rem)] lg:min-h-0">
          <RevenueChart factures={factures} loading={facturesLoading} />
          <FinanceList title="Factures recentes" rows={facturesLoading ? [] : recentFactures} empty="Aucune facture recente" />
          <FinanceList title="Alertes financieres" rows={financeAlerts} empty="Aucune alerte financiere" />
          <FinanceList title="Devis recents" rows={devisLoading ? [] : recentDevis} empty="Aucun devis recent" />
          <FinanceCard label="Impayes du mois" value={formatMoney(monthlyPending)} tone="red" detail="Factures du mois non encaissees" />
          <FinanceCard label="Devis en suivi" value={devisEnAttente.length.toString()} tone="indigo" detail="Brouillons et devis envoyes" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4 pb-20 lg:pb-0 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
      <Topbar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiData.map(k => (
          <KPICard key={k.id} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-3 lg:h-[calc(100%-9.25rem)] lg:min-h-0">
        <div className="lg:min-h-0">
          {rdvLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 h-full">
              Chargement des rendez-vous du jour...
            </div>
          ) : (
            <AppointmentList appointments={appointmentsForList} />
          )}
        </div>
        <Notifications notifications={notifications} />
        <RevenueChart factures={factures} loading={facturesLoading} />
        <DonutChart data={actesData} />
        <PatientList patients={recentPatients} />
        <StockList stocks={stock} loading={stockLoading} />
      </div>
    </div>
  )
}
