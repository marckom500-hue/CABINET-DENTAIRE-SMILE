export default function StockList({ stocks = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Stock consommables</h3>
      <div className="space-y-3">
        {stocks.map(s => {
          const pct = Math.round((s.quantite / s.max) * 100)
          const critique = s.quantite <= s.seuil
          return (
            <div key={s.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700 truncate">{s.nom}</span>
                <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${critique ? 'text-red-500' : 'text-gray-500'}`}>
                  {s.quantite}/{s.max}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: critique ? '#f43f5e' : s.couleur ?? '#0d9488' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
