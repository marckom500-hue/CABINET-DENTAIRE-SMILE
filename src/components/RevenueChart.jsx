import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { mois:'Jan', revenus:520000 },{ mois:'Fév', revenus:680000 },
  { mois:'Mar', revenus:750000 },{ mois:'Avr', revenus:620000 },
  { mois:'Mai', revenus:890000 },{ mois:'Jun', revenus:840000 },
]

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenus mensuels (FCFA)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top:4, right:4, left:0, bottom:0 }}>
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
  )
}
