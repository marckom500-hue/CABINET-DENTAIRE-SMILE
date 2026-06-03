import { useState } from 'react'
import { useAppConfig } from '../hooks/useAppConfig'

export default function AdminSettings() {
  const { value: useMockData, updateConfig, loading } = useAppConfig('use_mock_data', 'false')
  const [saving, setSaving] = useState(false)

  const handleToggle = async () => {
    setSaving(true)
    const newValue = useMockData === 'true' ? 'false' : 'true'
    await updateConfig(newValue)
    setSaving(false)
  }

  const isMockMode = useMockData === 'true'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">Paramètres Administrateur</h2>
        <p className="text-sm text-gray-500">Gestion des données et configuration</p>
      </div>

      {/* Section données de test */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Données des rapports</h3>
            <p className="text-sm text-gray-600 mb-4">
              {isMockMode 
                ? '🔵 Affichage des données de test (mock) pour les démonstrations et captures d\'écran'
                : '🟢 Affichage des données réelles du cabinet'
              }
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mode actuel :</span>
                <span className={`font-semibold ${isMockMode ? 'text-blue-600' : 'text-green-600'}`}>
                  {isMockMode ? 'DONNÉES MOCK' : 'DONNÉES RÉELLES'}
                </span>
              </div>
              <div className="text-gray-500 text-xs pt-2 border-t border-gray-200">
                {isMockMode 
                  ? 'Les rapports affichent 36 factures mock (jan-jun 2026) avec revenus 440k-540k FCFA par mois'
                  : 'Les rapports affichent les données réelles du cabinet'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={saving || loading}
          className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
            isMockMode
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? 'Changement en cours...' : `Basculer vers ${isMockMode ? 'DONNÉES RÉELLES' : 'DONNÉES MOCK'}`}
        </button>
      </div>

      {/* Infos sur les données mock */}
      {isMockMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3">📊 Données Mock Disponibles</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Période :</strong> Janvier - Juin 2026</p>
            <p><strong>Nombre de factures :</strong> 36 (6 par mois)</p>
            <div>
              <strong>Revenus mensuels :</strong>
              <ul className="list-disc list-inside ml-2 text-xs mt-1">
                <li>Jan : 440k FCFA</li>
                <li>Fév : 490k FCFA</li>
                <li>Mar : 490k FCFA</li>
                <li>Avr : 540k FCFA</li>
                <li>Mai : 500k FCFA</li>
                <li>Jun : 540k FCFA</li>
              </ul>
            </div>
            <p className="pt-2"><strong>Actes variés :</strong> Consultation, Détartrage, Extraction, Implant, Radiographie, Urgence</p>
          </div>
        </div>
      )}

      {/* Infos sur les données réelles */}
      {!isMockMode && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h4 className="font-semibold text-green-900 mb-3">✓ Mode Production</h4>
          <p className="text-sm text-green-800">
            Les rapports affichent l'activité réelle du cabinet. Les données mock ne sont pas utilisées.
          </p>
        </div>
      )}

      {/* Guide d'utilisation */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Guide d'utilisation</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong>Utiliser les données mock pour :</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Tester les rapports sans données réelles</li>
              <li>Prendre des captures d'écran pour des présentations</li>
              <li>Montrer des exemples de graphiques au client</li>
            </ul>
          </div>
          <div className="pt-2">
            <strong>Utiliser les données réelles pour :</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Visualiser l'activité réelle du cabinet</li>
              <li>Générer les rapports de gestion</li>
              <li>Suivre les objectifs mensuels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
