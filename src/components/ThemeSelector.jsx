import { useState, useEffect } from 'react'

const THEMES = [
  {
    id: 'default',
    name: 'Défaut',
    description: 'Gris clair standard',
    className: 'bg-gray-50',
    preview: 'bg-gray-300'
  },
  {
    id: 'dental-abstract',
    name: 'Abstrait Dental',
    description: 'Motifs dentaires géométriques stylisés',
    className: 'bg-dental-abstract',
    preview: 'bg-gray-100'
  },
  {
    id: 'dental-serenity',
    name: 'Sérénité',
    description: 'Dégradé bleu-vert apaisant',
    className: 'bg-dental-serenity',
    preview: 'bg-gradient-to-br from-sky-50 to-emerald-50'
  },
  {
    id: 'dental-marble',
    name: 'Marbre Blanc',
    description: 'Texture marbre avec reflets',
    className: 'bg-dental-marble',
    preview: 'bg-white'
  },
  {
    id: 'dental-hexagon',
    name: 'Hexagone Médical',
    description: 'Réseau hexagonal discret',
    className: 'bg-dental-hexagon',
    preview: 'bg-gray-50'
  },
  {
    id: 'dental-office',
    name: 'Cabinet Minimal',
    description: 'Paysage de cabinet flouté',
    className: 'bg-dental-office',
    preview: 'bg-gradient-to-b from-slate-100 to-slate-50'
  },
  {
    id: 'dental-pastel',
    name: 'Pastel Particules',
    description: 'Dégradé pastel avec particules',
    className: 'bg-dental-pastel',
    preview: 'bg-gradient-to-br from-white via-emerald-50 to-sky-50'
  },
  {
    id: 'dental-dna',
    name: 'ADN Dentaire',
    description: 'Graphisme ADN et sourire',
    className: 'bg-dental-dna',
    preview: 'bg-gray-50'
  },
  {
    id: 'dental-metal',
    name: 'Métal Brossé',
    description: 'Argenté avec lueur douce',
    className: 'bg-dental-metal',
    preview: 'bg-gradient-to-br from-slate-200 to-slate-100'
  },
  {
    id: 'dental-blueprint',
    name: 'Blueprint',
    description: 'Papier médical technique',
    className: 'bg-dental-blueprint',
    preview: 'bg-gray-50'
  },
  {
    id: 'dental-cosmos',
    name: 'Cosmos Tech',
    description: 'Bleu froid innovation',
    className: 'bg-dental-cosmos',
    preview: 'bg-gradient-to-br from-slate-900 to-slate-800'
  }
]

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('dental-theme') || 'default'
  })

  useEffect(() => {
    localStorage.setItem('dental-theme', currentTheme)
    
    // Appliquer le thème au body
    const body = document.body
    const layout = document.getElementById('main-layout')
    
    // Supprimer tous les thèmes du body et du layout
    THEMES.forEach(theme => {
      const classes = theme.className.split(' ').filter(c => c.trim())
      classes.forEach(cls => {
        body.classList.remove(cls)
        if (layout) layout.classList.remove(cls)
      })
    })
    
    // Ajouter le thème sélectionné
    const selectedTheme = THEMES.find(t => t.id === currentTheme)
    if (selectedTheme) {
      const classesToAdd = selectedTheme.className.split(' ').filter(c => c.trim())
      classesToAdd.forEach(cls => {
        body.classList.add(cls)
        if (layout) layout.classList.add(cls)
      })
      body.classList.add('has-bg-dental')
      if (layout) layout.classList.add('has-bg-dental')
    } else {
      body.classList.remove('has-bg-dental')
      if (layout) layout.classList.remove('has-bg-dental')
    }
  }, [currentTheme])

  return (
    <div className="relative">
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-all hover:scale-110"
        title="Changer le thème"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {/* Panneau de sélection */}
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
                  onClick={() => {
                    setCurrentTheme(theme.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    currentTheme === theme.id
                      ? 'bg-teal-50 border-2 border-teal-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {/* Aperçu */}
                  <div className={`w-12 h-12 rounded-lg ${theme.preview} border border-gray-200 flex-shrink-0`} />
                  
                  {/* Informations */}
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
              <p className="text-xs text-gray-500 text-center">
                Le thème est sauvegardé automatiquement
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


