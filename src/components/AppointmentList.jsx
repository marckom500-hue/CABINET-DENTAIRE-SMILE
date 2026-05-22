import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'

export default function AppointmentList({ appointments = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full min-h-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Rendez-vous du jour</h3>
      <div className="space-y-2 overflow-y-auto pr-1">
        {appointments.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8">Aucun rendez-vous aujourd'hui</div>
        )}
        {appointments.map(a => {
          const s = RDV_STATUS_META[normalizeRdvStatus(a.status)] ?? RDV_STATUS_META[RDV_STATUS.ATTENTE]
          return (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
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
