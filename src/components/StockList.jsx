export default function StockList({ stocks = [], loading = false }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full min-h-0 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Stock consommables</h3>
      <div className="space-y-3 overflow-y-auto pr-1">
        {loading && (
          <div className="text-sm text-gray-400 text-center py-8">Chargement du stock...</div>
        )}
        {!loading && stocks.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8">Aucun article en stock</div>
        )}
        {!loading && stocks.map(s => {
          const max = Number(s.max) || Math.max(Number(s.quantite) || 0, Number(s.seuil) || 1)
          const quantite = Number(s.quantite) || 0
          const pct = Math.min(100, Math.round((quantite / max) * 100))
          const critique = quantite <= Number(s.seuil || 0)
          return (
            <div key={s.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700 truncate">{s.nom_produit || s.nom}</span>
                <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${critique ? 'text-red-500' : 'text-gray-500'}`}>
                  {quantite}/{max}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: critique ? '#f43f5e' : s.couleur ?? '#0d9488' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
