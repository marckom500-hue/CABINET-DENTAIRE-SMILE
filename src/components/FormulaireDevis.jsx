import { useState, useEffect } from 'react'
import { useDevis, useLignesDevis, useActesDentaires } from '../hooks/useDevis'
import { usePatients } from '../hooks/usePatients'
import { useNotifications } from '../hooks/NotificationsContext'
import { supabase } from '../lib/supabase'
import { DEVIS_STATUS } from '../lib/statuses'

function getDefaultValidityDate() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().split('T')[0]
}

const createEmpty = () => ({ patient_id: '', date_validite: getDefaultValidityDate(), notes: '', conditions: '' })

export default function FormulaireDevis({ devis, onCancel, onClose }) {
  const { ajouter, modifier } = useDevis()
  const { patients } = usePatients()
  const { actes } = useActesDentaires()
  const { notify } = useNotifications()
  
  const [form, setForm] = useState(createEmpty)
  const [lignes, setLignes] = useState([])
  const [newLigne, setNewLigne] = useState({ description: '', quantite: 1, prix_unitaire: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (devis) {
      setForm({
        patient_id: devis.patient_id,
        date_validite: devis.date_validite,
        notes: devis.notes || '',
        conditions: devis.conditions || '',
      })
      setLignes(devis.lignes_devis || [])
    } else {
      setForm(createEmpty())
      setLignes([])
    }
  }, [devis])

  const addLigne = async () => {
    if (!newLigne.description || !newLigne.prix_unitaire) {
      notify({ type: 'error', message: 'Remplissez tous les champs' })
      return
    }

    const montant = Number(newLigne.quantite) * Number(newLigne.prix_unitaire)
    const ligne = { ...newLigne, quantite: Number(newLigne.quantite), prix_unitaire: Number(newLigne.prix_unitaire), montant }

    if (devis) {
      // Si on modifie un devis existant, insérer la ligne
      const { error } = await supabase
        .from('lignes_devis')
        .insert({ ...ligne, devis_id: devis.id })
      if (error) {
        notify({ type: 'error', message: `Erreur ajout ligne : ${error.message}` })
        return
      }
    }

    setLignes([...lignes, { ...ligne, id: Math.random() }])
    setNewLigne({ description: '', quantite: 1, prix_unitaire: 0 })
  }

  const removeLigne = (idx) => {
    setLignes(lignes.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!form.patient_id || lignes.length === 0) {
      notify({ type: 'error', message: 'Sélectionnez un patient et ajoutez au moins une ligne' })
      return
    }

    setSaving(true)
    try {
      const montantTotal = lignes.reduce((sum, l) => sum + (l.montant || 0), 0)
      const payload = {
        ...form,
        montant_total: montantTotal,
        statut: devis?.statut ?? DEVIS_STATUS.EN_ATTENTE,


      }

      if (devis) {
        await modifier(devis.id, payload)
      } else {
        const { data: newDevis, error: errDevis } = await supabase
          .from('devis')
          .insert(payload)
          .select()

        if (errDevis) throw errDevis

        const devisId = newDevis[0].id

        // Ajouter les lignes
        const lignesPayload = lignes.map(l => ({
          devis_id: devisId,
          description: l.description,
          quantite: l.quantite,
          prix_unitaire: l.prix_unitaire,
          montant: l.montant,
        }))

        const { error: errLignes } = await supabase
          .from('lignes_devis')
          .insert(lignesPayload)

        if (errLignes) throw errLignes

        notify({ type: 'success', message: `Devis créé : ${newDevis[0].numero}` })
      }

      onClose()
    } catch (error) {
      notify({ type: 'error', message: `Erreur : ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  const montantTotal = lignes.reduce((sum, l) => sum + (l.montant || 0), 0)
  const patientOptions = patients.map(p => ({ value: p.id, label: `${p.prenom} ${p.nom}` }))

  return (
    <div className="space-y-4">
      {/* Patient */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
        <select
          value={form.patient_id}
          onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Sélectionner un patient</option>
          {patientOptions.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Date validité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valable jusqu'au *</label>
        <input
          type="date"
          value={form.date_validite}
          onChange={(e) => setForm({ ...form, date_validite: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Lignes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Actes *</label>
        <div className="space-y-2 mb-3">
          {lignes.map((l, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium">{l.description}</p>
                <p className="text-xs text-gray-500">
                  {l.quantite} x {Number(l.prix_unitaire).toLocaleString('fr-FR')} = {Number(l.montant || 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <button
                onClick={() => removeLigne(idx)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Ajouter ligne */}
        <div className="space-y-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
          <input
            type="text"
            placeholder="Description de l'acte"
            value={newLigne.description}
            onChange={(e) => setNewLigne({ ...newLigne, description: e.target.value })}
            list="actes-list"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
          />
          <datalist id="actes-list">
            {actes.map(a => (
              <option key={a.id} value={a.nom} />
            ))}
          </datalist>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="Quantité"
              value={newLigne.quantite}
              onChange={(e) => setNewLigne({ ...newLigne, quantite: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Prix unitaire"
              value={newLigne.prix_unitaire}
              onChange={(e) => setNewLigne({ ...newLigne, prix_unitaire: e.target.value })}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
            />
            <button
              onClick={addLigne}
              className="px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Montant total */}
      <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-teal-900">Montant total</p>
          <p className="text-2xl font-bold text-teal-600">
            {Number(montantTotal).toLocaleString('fr-FR')} FCFA
          </p>
        </div>
      </div>

      {/* Notes et conditions */}
      <textarea
        placeholder="Notes internes..."
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        rows="2"
      />

      <textarea
        placeholder="Conditions de paiement..."
        value={form.conditions}
        onChange={(e) => setForm({ ...form, conditions: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        rows="2"
      />

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving || lignes.length === 0}
          className="flex-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Enregistrement...' : devis ? 'Modifier' : 'Créer'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
