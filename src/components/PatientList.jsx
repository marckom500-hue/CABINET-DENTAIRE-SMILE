import { formatPhone } from '../utils/phone'

const STATUS_MAP = {
  Actif: 'bg-teal-100 text-teal-700',
  Urgent: 'bg-red-100 text-red-700',
  Inactif: 'bg-gray-100 text-gray-500',
  Nouveau: 'bg-blue-100 text-blue-700',
  Recu: 'bg-teal-100 text-teal-700',
}

export default function PatientList({ patients = [] }) {
  return (
    <div className="rounded-xl border p-4 h-full min-h-0 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Patients recents</h3>
      <div className="space-y-2 overflow-y-auto pr-1">
        {patients.length === 0 && (
          <div className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>Aucun patient recu recemment</div>
        )}
        {patients.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-row)' }}>
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {p.prenom?.[0]}{p.nom?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--text-1)' }}>{p.prenom} {p.nom}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{p.detail || formatPhone(p.telephone)}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_MAP[p.statut] ?? 'bg-gray-100 text-gray-500'}`}>
              {p.statut}
            </span>
          </div>
        ))}}
      </div>
    </div>
  )
}
