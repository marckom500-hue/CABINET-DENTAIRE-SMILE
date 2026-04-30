import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const dataRevenus = [
  { mois:'Jan', revenus:520000, objectif:600000 },
  { mois:'Fév', revenus:680000, objectif:600000 },
  { mois:'Mar', revenus:750000, objectif:650000 },
  { mois:'Avr', revenus:620000, objectif:650000 },
  { mois:'Mai', revenus:890000, objectif:700000 },
  { mois:'Jun', revenus:840000, objectif:700000 },
]

const dataPatients = [
  { mois:'Jan', nouveaux:12, retours:28 },
  { mois:'Fév', nouveaux:18, retours:31 },
  { mois:'Mar', nouveaux:15, retours:35 },
  { mois:'Avr', nouveaux:22, retours:29 },
  { mois:'Mai', nouveaux:19, retours:38 },
  { mois:'Jun', nouveaux:25, retours:42 },
]

const dataActes = [
  { name:'Consultation', value:35, color:'#0d9488' },
  { name:'Détartrage',   value:25, color:'#3b82f6' },
  { name:'Extraction',   value:20, color:'#f59e0b' },
  { name:'Implant',      value:12, color:'#8b5cf6' },
  { name:'Autre',        value:8,  color:'#94a3b8' },
]

export default function Rapports() {
  const totalRevenus = dataRevenus.reduce((s, d) => s + d.revenus, 0)
  const totalPatients = dataPatients.reduce((s, d) => s + d.nouveaux + d.retours, 0)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif">Rapports</h2>
        <p className="text-sm text-gray-500">Analyse de l'activité du cabinet — 6 derniers mois</p>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Revenus totaux',    value:`${(totalRevenus/1000).toFixed(0)}k FCFA`, color:'teal'   },
          { label:'Patients vus',      value:totalPatients,                              color:'blue'   },
          { label:'Taux recouvrement', value:'87%',                                      color:'green'  },
          { label:'RDV honorés',       value:'94%',                                      color:'purple' },
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
                  const p = dataPatients[i]
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
