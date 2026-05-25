import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'

export default function AppointmentList({ appointments = [] }) {
  return (
    <div className="rounded-xl border p-4 h-full min-h-0 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Rendez-vous du jour</h3>
      <div className="space-y-2 overflow-y-auto pr-1">
        {appointments.length === 0 && (
          <div className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>Aucun rendez-vous aujourd'hui</div>
        )}
        {appointments.map(a => {
          const s = RDV_STATUS_META[normalizeRdvStatus(a.status)] ?? RDV_STATUS_META[RDV_STATUS.ATTENTE]
          return (
            <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-row)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-medium w-24 flex-shrink-0" style={{ color: 'var(--text-2)' }}>{a.schedule || a.time}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{a.patient}</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>{a.type}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.cls}`}>{s.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
