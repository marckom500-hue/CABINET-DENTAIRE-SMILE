const data = [
  { label:'Consultation', value:35, color:'#0d9488' },
  { label:'Détartrage',   value:25, color:'#3b82f6' },
  { label:'Extraction',   value:20, color:'#f59e0b' },
  { label:'Implant',      value:12, color:'#8b5cf6' },
  { label:'Autre',        value:8,  color:'#94a3b8' },
]
const total = data.reduce((s, d) => s + d.value, 0)

export default function DonutChart() {
  let offset = 0
  const r = 70, cx = 90, cy = 90, stroke = 28
  const circ = 2 * Math.PI * r

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Répartition des actes</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg width="180" height="180" viewBox="0 0 180 180" className="flex-shrink-0">
          {data.map((d, i) => {
            const pct = d.value / total
            const dash = pct * circ
            const gap  = circ - dash
            const seg = (
              <circle key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke={d.color} strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset * circ}
                transform="rotate(-90)" style={{ transformOrigin:`${cx}px ${cy}px` }} />
            )
            offset += pct
            return seg
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" className="text-xs" fill="#0f172a" fontSize="20" fontWeight="bold">{total}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="10">actes</text>
        </svg>
        <div className="space-y-2 flex-1">
          {data.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-gray-600 flex-1">{d.label}</span>
              <span className="text-xs font-semibold text-gray-800">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
