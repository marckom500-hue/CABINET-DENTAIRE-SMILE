import { useState } from 'react'
import { useAntecedents } from '../hooks/useAntecedents'
import { useTraitements } from '../hooks/useTraitements'
import { useAllergies } from '../hooks/useAllergies'

const GRAVITE_COLORS = {
  normal: 'bg-blue-100 text-blue-700',
  important: 'bg-amber-100 text-amber-700',
  grave: 'bg-red-100 text-red-700',
  critique: 'bg-red-200 text-red-800',
}

const STATUT_TRAITEMENT_COLORS = {
  en_cours: 'bg-blue-100 text-blue-700',
  termine: 'bg-green-100 text-green-700',
  suspendu: 'bg-amber-100 text-amber-700',
  annule: 'bg-red-100 text-red-700',
}

export default function MedicalRecord({ patient, isOpen, onClose }) {
  const { antecedents, loading: antLoading, ajouter: ajouterAnt, modifier: modifierAnt, supprimer: supprimerAnt } = useAntecedents(patient?.id)
  const { traitements, loading: trtLoading, ajouter: ajouterTrt, modifier: modifierTrt, supprimer: supprimerTrt } = useTraitements(patient?.id)
  const { allergies, loading: allLoading, ajouter: ajouterAll, modifier: modifierAll, supprimer: supprimerAll } = useAllergies(patient?.id)
  
  const [activeTab, setActiveTab] = useState('allergies')
  const [addingAntecedent, setAddingAntecedent] = useState(false)
  const [addingTraitement, setAddingTraitement] = useState(false)
  const [addingAllergie, setAddingAllergie] = useState(false)

  if (!isOpen || !patient) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dossier Médical</h3>
            <p className="text-sm text-gray-500">{patient.prenom} {patient.nom}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 bg-gray-50 px-4">
          {[
            { id: 'allergies', label: '⚠️ Allergies', count: allergies.length },
            { id: 'antecedents', label: '📋 Antécédents', count: antecedents.length },
            { id: 'traitements', label: '🦷 Traitements', count: traitements.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-teal-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 md:p-5">
          {/* ALLERGIES */}
          {activeTab === 'allergies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Allergies Enregistrées</h4>
                <button
                  onClick={() => setAddingAllergie(!addingAllergie)}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  + Ajouter
                </button>
              </div>

              {addingAllergie && (
                <AllergieForm 
                  onSubmit={async (data) => {
                    await ajouterAll(data)
                    setAddingAllergie(false)
                  }}
                  onCancel={() => setAddingAllergie(false)}
                />
              )}

              {allLoading ? (
                <p className="text-center text-gray-400 py-8">Chargement...</p>
              ) : allergies.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucune allergie enregistrée</p>
              ) : (
                <div className="space-y-2">
                  {allergies.map(allergie => (
                    <div key={allergie.id} className={`p-3 rounded-lg border border-red-200 ${GRAVITE_COLORS[allergie.gravite]}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{allergie.allergie}</p>
                          {allergie.symptomes && <p className="text-xs mt-1">Symptômes: {allergie.symptomes}</p>}
                        </div>
                        <button 
                          onClick={() => supprimerAll(allergie.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANTECEDENTS */}
          {activeTab === 'antecedents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Antécédents Médicaux</h4>
                <button
                  onClick={() => setAddingAntecedent(!addingAntecedent)}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  + Ajouter
                </button>
              </div>

              {addingAntecedent && (
                <AntecedentForm 
                  onSubmit={async (data) => {
                    await ajouterAnt(data)
                    setAddingAntecedent(false)
                  }}
                  onCancel={() => setAddingAntecedent(false)}
                />
              )}

              {antLoading ? (
                <p className="text-center text-gray-400 py-8">Chargement...</p>
              ) : antecedents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucun antécédent enregistré</p>
              ) : (
                <div className="space-y-2">
                  {antecedents.map(ant => (
                    <div key={ant.id} className={`p-3 rounded-lg border border-gray-200 ${GRAVITE_COLORS[ant.gravite]}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{ant.type}: {ant.description}</p>
                          <div className="flex gap-2 mt-1 text-xs">
                            {ant.date_occurrence && <span className="text-gray-600">{ant.date_occurrence}</span>}
                          </div>
                          {ant.notes && <p className="text-xs mt-1 text-gray-600">Notes: {ant.notes}</p>}
                        </div>
                        <button 
                          onClick={() => supprimerAnt(ant.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRAITEMENTS */}
          {activeTab === 'traitements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Historique des Traitements</h4>
                <button
                  onClick={() => setAddingTraitement(!addingTraitement)}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                >
                  + Ajouter
                </button>
              </div>

              {addingTraitement && (
                <TraitementForm 
                  onSubmit={async (data) => {
                    await ajouterTrt(data)
                    setAddingTraitement(false)
                  }}
                  onCancel={() => setAddingTraitement(false)}
                />
              )}

              {trtLoading ? (
                <p className="text-center text-gray-400 py-8">Chargement...</p>
              ) : traitements.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucun traitement enregistré</p>
              ) : (
                <div className="space-y-2">
                  {traitements.map(trt => (
                    <div key={trt.id} className={`p-3 rounded-lg border border-gray-200 ${STATUT_TRAITEMENT_COLORS[trt.statut]}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {trt.type_traitement}
                            {trt.dent_numero && <span className="text-xs ml-2">Dent {trt.dent_numero}</span>}
                          </p>
                          <div className="flex gap-2 mt-1 text-xs">
                            <span>{trt.date_debut}</span>
                            {trt.cout && <span>• {trt.cout.toLocaleString('fr-FR')} FCFA</span>}
                          </div>
                          {trt.notes && <p className="text-xs mt-1 text-gray-600">Notes: {trt.notes}</p>}
                        </div>
                        <button 
                          onClick={() => supprimerTrt(trt.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mini formulaires pour ajouter rapidement
function AllergieForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ allergie: '', gravite: 'normal', symptomes: '' })

  return (
    <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-2">
      <input
        type="text"
        placeholder="Nom de l'allergie"
        value={form.allergie}
        onChange={(e) => setForm({ ...form, allergie: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <input
        type="text"
        placeholder="Symptômes"
        value={form.symptomes}
        onChange={(e) => setForm({ ...form, symptomes: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <select
        value={form.gravite}
        onChange={(e) => setForm({ ...form, gravite: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="normal">Normal</option>
        <option value="grave">Grave</option>
        <option value="critique">Critique</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(form)}
          disabled={!form.allergie}
          className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

function AntecedentForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ type: 'maladie', description: '', date_occurrence: '', gravite: 'normal', notes: '' })

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
      >
        <option value="maladie">Maladie</option>
        <option value="allergie">Allergie</option>
        <option value="chirurgie">Chirurgie</option>
        <option value="traitement">Traitement</option>
        <option value="autre">Autre</option>
      </select>
      <input
        type="text"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
      />
      <input
        type="date"
        value={form.date_occurrence}
        onChange={(e) => setForm({ ...form, date_occurrence: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(form)}
          disabled={!form.description}
          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Enregistrer
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg">
          Annuler
        </button>
      </div>
    </div>
  )
}

function TraitementForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    type_traitement: 'detartrage',
    dent_numero: '',
    date_debut: new Date().toISOString().split('T')[0],
    statut: 'en_cours',
    cout: '',
    notes: ''
  })

  return (
    <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-2">
      <input
        type="text"
        placeholder="Type de traitement"
        value={form.type_traitement}
        onChange={(e) => setForm({ ...form, type_traitement: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
      />
      <input
        type="text"
        placeholder="Numéro de dent (ex: 18)"
        value={form.dent_numero}
        onChange={(e) => setForm({ ...form, dent_numero: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
      />
      <input
        type="number"
        placeholder="Coût en FCFA"
        value={form.cout}
        onChange={(e) => setForm({ ...form, cout: e.target.value })}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(form)}
          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Enregistrer
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg">
          Annuler
        </button>
      </div>
    </div>
  )
}
