const fallbackData = [
  { label: 'Aucun acte', value: 1, color: '#e2e8f0' },
]

export default function DonutChart({ data = [] }) {
  const chartData = data.length > 0 ? data : fallbackData
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const displayTotal = total || 0
  let offset = 0
  const r = 54
  const cx = 70
  const cy = 70
  const stroke = 22
  const circ = 2 * Math.PI * r

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full min-h-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Repartition des actes</h3>
      <div className="flex items-center gap-4 min-h-0">
        <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
          {chartData.map((d, i) => {
            const pct = d.value / chartData.reduce((sum, item) => sum + item.value, 0)
            const dash = pct * circ
            const gap = circ - dash
            const seg = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset * circ}
                transform="rotate(-90)"
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            )
            offset += pct
            return seg
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="bold">{displayTotal}</text>
          <text x={cx} y={cy + 13} textAnchor="middle" fill="#94a3b8" fontSize="10">actes</text>
        </svg>
        <div className="space-y-2 flex-1 min-w-0 overflow-y-auto max-h-36 pr-1">
          {data.length === 0 ? (
            <div className="text-xs text-gray-400">Aucun acte enregistre</div>
          ) : chartData.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{d.label}</span>
              <span className="text-xs font-semibold text-gray-800">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
