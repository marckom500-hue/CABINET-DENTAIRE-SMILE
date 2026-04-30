const STATUS_MAP = {
  'Actif':    'bg-teal-100 text-teal-700',
  'Urgent':   'bg-red-100 text-red-700',
  'Inactif':  'bg-gray-100 text-gray-500',
  'Nouveau':  'bg-blue-100 text-blue-700',
}
export default function PatientList({ patients = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Patients récents</h3>
      <div className="space-y-2">
        {patients.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {p.prenom?.[0]}{p.nom?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{p.prenom} {p.nom}</p>
              <p className="text-xs text-gray-500">{p.telephone}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_MAP[p.statut] ?? 'bg-gray-100 text-gray-500'}`}>
              {p.statut}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
