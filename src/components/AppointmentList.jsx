const STATUS_MAP = {
  confirme: { label:'Confirmé',   cls:'bg-teal-100 text-teal-700'    },
  attente:  { label:'En attente', cls:'bg-amber-100 text-amber-700'  },
  urgent:   { label:'Urgent',     cls:'bg-red-100 text-red-700'      },
  annule:   { label:'Annulé',     cls:'bg-gray-100 text-gray-500'    },
}
export default function AppointmentList({ appointments = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Rendez-vous du jour</h3>
      <div className="space-y-3">
        {appointments.map(a => {
          const s = STATUS_MAP[a.status] ?? STATUS_MAP.attente
          return (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
              <span className="text-xs font-medium text-gray-500 w-12 flex-shrink-0">{a.time}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{a.patient}</p>
                <p className="text-xs text-gray-500">{a.type}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
