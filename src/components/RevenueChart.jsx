import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FACTURE_STATUS, normalizeFactureStatus } from '../lib/statuses'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function RevenueChart({ factures = [], loading = false }) {
  // Calculate monthly revenue from real data
  const currentYear = new Date().getFullYear()
  
  // Group factures by month for the current year
  const monthlyData = MONTHS.map((mois, index) => {
    const monthRevenue = factures
      .filter(f => {
        const fDate = new Date(f.date)
        return fDate.getFullYear() === currentYear && fDate.getMonth() === index && normalizeFactureStatus(f.statut) !== FACTURE_STATUS.ANNULE
      })
      .reduce((sum, f) => sum + (f.montant || 0), 0)
    
    return { mois, revenus: monthRevenue }
  })

  // Filter to show only months up to current month
  const currentMonth = new Date().getMonth()
  const displayData = monthlyData.slice(0, currentMonth + 1)

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 h-full">
        Chargement des revenus...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full min-h-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenus mensuels (FCFA)</h3>
      <div className="flex-1 min-h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={displayData} margin={{ top:4, right:4, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="mois" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={v => [`${v.toLocaleString('fr-FR')} FCFA`, 'Revenus']}
            contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #e2e8f0' }} />
          <Bar dataKey="revenus" fill="#0d9488" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
