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
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Alertes</h3>
      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8">Aucune alerte recente</div>
        )}
        {notifications.map(n => {
          const t = TYPE_MAP[n.type] ?? TYPE_MAP.rdv
          return (
            <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${t.bg}`}>
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
