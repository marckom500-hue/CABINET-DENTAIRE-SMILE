const COLOR_MAP = {
  teal:  { bg:'bg-teal-50',  icon:'bg-teal-600',  text:'text-teal-700'  },
  blue:  { bg:'bg-blue-50',  icon:'bg-blue-600',  text:'text-blue-700'  },
  green: { bg:'bg-green-50', icon:'bg-green-600', text:'text-green-700' },
  red:   { bg:'bg-red-50',   icon:'bg-red-600',   text:'text-red-700'   },
}
export default function KPICard({ label, value, trend, trendUp, color = 'teal' }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal
  return (
    <div className={`${c.bg} rounded-xl p-4 md:p-5`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${c.text} mb-2`}>{value}</p>
      {trend && (
        <p className={`text-xs font-medium ${trendUp === true ? 'text-green-600' : trendUp === false ? 'text-red-500' : 'text-gray-500'}`}>
          {trendUp === true ? '↑' : trendUp === false ? '↓' : ''} {trend}
        </p>
      )}
    </div>
  )
}
