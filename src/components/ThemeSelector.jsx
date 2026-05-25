import { useState, useEffect } from 'react'

const THEMES = [
  { id: 'default',           name: 'Défaut',             description: 'Gris clair standard',               className: 'bg-gray-50',          preview: 'bg-gray-300' },
  { id: 'dental-abstract',   name: 'Abstrait Dental',    description: 'Motifs dentaires géométriques',      className: 'bg-dental-abstract',   preview: 'bg-gray-100' },
  { id: 'dental-serenity',   name: 'Sérénité',           description: 'Dégradé bleu-vert apaisant',         className: 'bg-dental-serenity',   preview: 'bg-gradient-to-br from-sky-50 to-emerald-50' },
  { id: 'dental-marble',     name: 'Marbre Blanc',       description: 'Texture marbre avec reflets',        className: 'bg-dental-marble',     preview: 'bg-white' },
  { id: 'dental-hexagon',    name: 'Hexagone Médical',   description: 'Réseau hexagonal discret',           className: 'bg-dental-hexagon',    preview: 'bg-gray-50' },
  { id: 'dental-office',     name: 'Cabinet Minimal',    description: 'Paysage de cabinet flouté',          className: 'bg-dental-office',     preview: 'bg-gradient-to-b from-slate-100 to-slate-50' },
  { id: 'dental-pastel',     name: 'Pastel Particules',  description: 'Dégradé pastel avec particules',     className: 'bg-dental-pastel',     preview: 'bg-gradient-to-br from-white via-emerald-50 to-sky-50' },
  { id: 'dental-dna',        name: 'ADN Dentaire',       description: 'Graphisme ADN et sourire',           className: 'bg-dental-dna',        preview: 'bg-gray-50' },
  { id: 'dental-metal',      name: 'Métal Brossé',       description: 'Argenté avec lueur douce',           className: 'bg-dental-metal',      preview: 'bg-gradient-to-br from-slate-200 to-slate-100' },
  { id: 'dental-blueprint',  name: 'Blueprint',          description: 'Papier médical technique',           className: 'bg-dental-blueprint',  preview: 'bg-gray-50' },
  { id: 'dental-cosmos',     name: 'Cosmos Tech',        description: 'Bleu froid innovation',              className: 'bg-dental-cosmos',     preview: 'bg-gradient-to-br from-slate-900 to-slate-800' },
  { id: 'dental-dark',       name: 'Nuit Absolue',       description: 'Thème sombre total avec lueurs',     className: 'bg-dental-dark',       preview: 'bg-gray-950' },
]

// Applique le thème UNIQUEMENT sur la zone de contenu, pas sur la sidebar
function applyTheme(themeId) {
  const themeArea = document.getElementById('theme-area')
  const html = document.documentElement

  // Retirer data-theme sombre si on change
  html.removeAttribute('data-theme')

  // Nettoyer tous les thèmes
  THEMES.forEach(t => {
    const classes = t.className.split(' ').filter(Boolean)
    classes.forEach(cls => {
      themeArea?.classList.remove(cls)
      document.body.classList.remove(cls)
    })
  })
  themeArea?.classList.remove('has-bg-dental')
  document.body.classList.remove('has-bg-dental')

  if (themeId === 'dental-dark') {
    html.setAttribute('data-theme', 'dark')
    themeArea?.classList.add('bg-dental-dark', 'has-bg-dental')
  } else if (themeId === 'dental-cosmos') {
    html.setAttribute('data-theme', 'cosmos')
    themeArea?.classList.add('bg-dental-cosmos', 'has-bg-dental')
  } else if (themeId !== 'default') {
    const selected = THEMES.find(t => t.id === themeId)
    if (selected) {
      const classes = selected.className.split(' ').filter(Boolean)
      classes.forEach(cls => themeArea?.classList.add(cls))
      themeArea?.classList.add('has-bg-dental')
    }
  }
}

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('dental-theme') || 'default'
  })

  // Appliquer le thème au montage
  useEffect(() => {
    applyTheme(currentTheme)
  }, [])

  // Appliquer à chaque changement
  useEffect(() => {
    localStorage.setItem('dental-theme', currentTheme)
    applyTheme(currentTheme)
  }, [currentTheme])

  return (
    <div className="relative">
      {/* Bouton fixe en bas à droite */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-all hover:scale-110"
        title="Changer le thème"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Panneau */}
          <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* En-tête */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-green-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Thème de l'application</h3>
                  <p className="text-xs text-gray-500 mt-1">Choisissez l'arrière-plan de votre choix</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Liste des thèmes */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => { setCurrentTheme(theme.id); setIsOpen(false) }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    currentTheme === theme.id
                      ? 'bg-teal-50 border-2 border-teal-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg ${theme.preview} border border-gray-200 flex-shrink-0`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{theme.name}</span>
                      {currentTheme === theme.id && (
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{theme.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Pied */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">Le thème est sauvegardé automatiquement</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
