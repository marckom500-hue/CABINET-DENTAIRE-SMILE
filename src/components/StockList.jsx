export default function StockList({ stocks = [], loading = false }) {
  return (
    <div className="rounded-xl border p-4 h-full min-h-0 flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-1)' }}>
      <h3 className="text-sm font-semibold mb-3 text-gray-900">Stock consommables</h3>
      <div className="space-y-3 overflow-y-auto pr-1">
        {loading && <div className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>Chargement du stock...</div>}
        {!loading && stocks.length === 0 && <div className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>Aucun article en stock</div>}
        {!loading && stocks.map(s => {
          const max = Number(s.max) || Math.max(Number(s.quantite) || 0, Number(s.seuil) || 1)
          const quantite = Number(s.quantite) || 0
          const pct = Math.min(100, Math.round((quantite / max) * 100))
          const critique = quantite <= Number(s.seuil || 0)
          return (
            <div key={s.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium truncate" style={{ color: 'var(--text-2)' }}>{s.nom_produit || s.nom}</span>
                <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${critique ? 'text-red-500' : ''}`}
                  style={critique ? {} : { color: 'var(--text-3)' }}>
                  {quantite}/{max}
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-row)' }}>
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
