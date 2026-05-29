const TYPE_MAP = {
  urgent: { bg:'bg-red-50',    dot:'bg-red-500'    },
  stock:  { bg:'bg-amber-50',  dot:'bg-amber-500'  },
  rdv:    { bg:'bg-teal-50',   dot:'bg-teal-500'   },
  sms:    { bg:'bg-blue-50',   dot:'bg-blue-500'   },
  patient:{ bg:'bg-blue-50',   dot:'bg-blue-500'   },
  facture:{ bg:'bg-amber-50',  dot:'bg-amber-500'  },
  success:{ bg:'bg-teal-50',   dot:'bg-teal-500'   },
  error:  { bg:'bg-red-50',    dot:'bg-red-500'    },
  user:   { bg:'bg-indigo-50', dot:'bg-indigo-500' },
}
export default function Notifications({ notifications = [] }) {
  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.created_at || 0)
    const dateB = new Date(b.created_at || 0)
    return dateB - dateA
  })

  return (
    <div className="rounded-xl border p-4 h-full min-h-0 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)' }}>
      <h3 className="text-sm font-semibold mb-3 text-gray-900">Alertes</h3>
      <div className="space-y-2 overflow-y-auto pr-1 max-h-44 lg:max-h-none">
        {sortedNotifications.length === 0 && (
          <div className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>Aucune alerte recente</div>
        )}
        {sortedNotifications.map(n => {
          const t = TYPE_MAP[n.type] ?? TYPE_MAP.rdv
          return (
            <div key={n.id} className={`flex items-start gap-3 p-2.5 rounded-lg ${t.bg}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${t.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
