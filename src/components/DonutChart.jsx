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
    <div className="rounded-xl border p-4 h-full min-h-0 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)' }}>
      <h3 className="text-sm font-semibold mb-3 text-gray-900">Repartition des actes</h3>
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
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--text-1)">{displayTotal}</text>
          <text x={cx} y={cy + 13} textAnchor="middle" fontSize="10" fill="var(--text-3)">actes</text>
        </svg>
        <div className="space-y-2 flex-1 min-w-0 overflow-y-auto max-h-36 pr-1">
          {data.length === 0 ? (
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>Aucun acte enregistre</div>
          ) : chartData.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-2)' }}>{d.label}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
