import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useFactures } from '../hooks/useFactures'
import { usePatients } from '../hooks/usePatients'
import { useRendezVous } from '../hooks/useRendezVous'
import { FACTURE_STATUS, RDV_STATUS, normalizeFactureStatus, normalizeRdvStatus } from '../lib/statuses'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// Objectifs mensuels (peut être déplacé dans une table de configuration)
const OBJECTIFS = [600000, 600000, 650000, 650000, 700000, 700000, 750000, 750000, 800000, 800000, 850000, 850000]

function getColorForActe(name) {
  const colors = {
    'Consultation': '#0d9488',
    'Détartrage': '#3b82f6',
    'Extraction': '#f59e0b',
    'Implant': '#8b5cf6',
    'Radiographie': '#ec4899',
    'Urgence': '#ef4444',
  }
  return colors[name] || '#94a3b8'
}

export default function Rapports() {
  const { factures, loading: facturesLoading } = useFactures()
  const { patients, loading: patientsLoading } = usePatients()
  const { rendezVous, loading: rdvLoading } = useRendezVous()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  // Calculate monthly revenue data from real factures
  const dataRevenus = MONTHS.slice(0, currentMonth + 1).map((mois, index) => {
    const monthRevenue = factures
      .filter(f => {
        const fDate = new Date(f.date)
        return fDate.getFullYear() === currentYear && fDate.getMonth() === index && normalizeFactureStatus(f.statut) !== FACTURE_STATUS.ANNULE
      })
      .reduce((sum, f) => sum + (f.montant || 0), 0)
    
    return { mois, revenus: monthRevenue, objectif: OBJECTIFS[index] || 700000 }
  })

  // Calculate patient evolution (nouveaux = created this month, retours = had RDV this month)
  const dataPatients = MONTHS.slice(0, currentMonth + 1).map((mois, index) => {
    // Nouveaux patients: created in this month
    const nouveaux = patients.filter(p => {
      const pDate = new Date(p.created_at)
      return pDate.getFullYear() === currentYear && pDate.getMonth() === index
    }).length

    // Patients de retour: had at least one RDV in this month
    const retours = rendezVous.filter(r => {
      const rDate = new Date(r.date)
      return rDate.getFullYear() === currentYear && rDate.getMonth() === index && normalizeRdvStatus(r.statut) !== RDV_STATUS.ANNULE
    }).length

    return { mois, nouveaux, retours }
  })

  // Calculate procedure distribution from rendez-vous
  const actesCount = {}
  rendezVous.forEach(r => {
    if (normalizeRdvStatus(r.statut) !== RDV_STATUS.ANNULE) {
      const type = r.type_acte || 'Autre'
      actesCount[type] = (actesCount[type] || 0) + 1
    }
  })

  const totalActes = Object.values(actesCount).reduce((s, v) => s + v, 0)
  const dataActes = Object.entries(actesCount).map(([name, value]) => ({
    name,
    value: totalActes > 0 ? Math.round((value / totalActes) * 100) : 0,
    color: getColorForActe(name)
  })).sort((a, b) => b.value - a.value)

  // If no data, show empty state
  if (facturesLoading || patientsLoading || rdvLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-xl">Chargement des rapports...</div>
      </div>
    )
  }

  const totalRevenus = dataRevenus.reduce((s, d) => s + d.revenus, 0)
  const totalPatientsSeen = dataPatients.reduce((s, d) => s + d.nouveaux + d.retours, 0)
  const totalEncaisse = factures.filter(f => normalizeFactureStatus(f.statut) === FACTURE_STATUS.PAYE).reduce((s, f) => s + (f.montant || 0), 0)
  const tauxRecouvrement = totalRevenus > 0 ? Math.round((totalEncaisse / totalRevenus) * 100) : 0
  const rdvHonores = rendezVous.filter(r => normalizeRdvStatus(r.statut) === RDV_STATUS.RECU).length
  const totalRdv = rendezVous.filter(r => normalizeRdvStatus(r.statut) !== RDV_STATUS.ANNULE).length
  const tauxRdvHonores = totalRdv > 0 ? Math.round((rdvHonores / totalRdv) * 100) : 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Rapports</h2>
        <p className="text-sm text-gray-500">Analyse de l'activité du cabinet — {currentYear}</p>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Revenus totaux',    value:`${(totalRevenus/1000).toFixed(0)}k FCFA`, color:'teal'   },
          { label:'Patients vus',      value:totalPatientsSeen,                          color:'blue'   },
          { label:'Taux recouvrement', value:`${tauxRecouvrement}%`,                      color:'green'  },
          { label:'RDV honorés',       value:`${tauxRdvHonores}%`,                        color:'purple' },
        ].map(k => (
          <div key={k.label} className={`bg-${k.color}-50 rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`text-xl font-bold text-${k.color}-700`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus vs Objectif */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenus vs Objectif (FCFA)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dataRevenus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `${v.toLocaleString('fr-FR')} FCFA`}
                contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #e2e8f0' }} />
              <Bar dataKey="revenus"  name="Revenus"  fill="#0d9488" radius={[4,4,0,0]} />
              <Bar dataKey="objectif" name="Objectif" fill="#ccfbf1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Évolution patients */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Évolution des patients</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dataPatients}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="nouveaux" name="Nouveaux" stroke="#0d9488" strokeWidth={2} dot={{ r:3 }} />
              <Line type="monotone" dataKey="retours"  name="Retours"  stroke="#3b82f6" strokeWidth={2} dot={{ r:3 }} />
              <Legend wrapperStyle={{ fontSize:12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition actes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Répartition des actes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dataActes} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {dataActes.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`}
                contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize:12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tableau récapitulatif */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Récapitulatif mensuel</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-semibold">Mois</th>
                  <th className="text-right py-2 text-gray-500 font-semibold">Revenus</th>
                  <th className="text-right py-2 text-gray-500 font-semibold">Patients</th>
                  <th className="text-right py-2 text-gray-500 font-semibold">Écart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataRevenus.map((d, i) => {
                  const p = dataPatients[i] || { nouveaux: 0, retours: 0 }
                  const ecart = d.revenus - d.objectif
                  return (
                    <tr key={d.mois}>
                      <td className="py-2 font-medium text-gray-700">{d.mois}</td>
                      <td className="py-2 text-right text-gray-900">{(d.revenus/1000).toFixed(0)}k</td>
                      <td className="py-2 text-right text-gray-600">{p.nouveaux + p.retours}</td>
                      <td className={`py-2 text-right font-medium ${ecart >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                        {ecart >= 0 ? '+' : ''}{(ecart/1000).toFixed(0)}k
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
