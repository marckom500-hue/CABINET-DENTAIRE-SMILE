import { useState } from 'react'
import FormField from './FormField'
import { usePatients } from '../hooks/usePatients'
import Modal from './Modal'

export default function QuickPatientForm({ isOpen, onClose, onPatientCreated }) {
  const { ajouterPatient } = usePatients()
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', email: '' })
  const [saving, setSaving] = useState(false)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  const canSubmit = form.nom.trim() && form.prenom.trim()

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      await ajouterPatient(form)
      onPatientCreated()
      setForm({ nom: '', prenom: '', telephone: '', email: '' })
      onClose()
    } catch {
      // Notification déjà affichée par le hook
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau patient" confirmOnClose={false}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Prénom"
            type="text"
            value={form.prenom}
            onChange={set('prenom')}
            placeholder="Prénom"
            required
          />
          <FormField
            label="Nom"
            type="text"
            value={form.nom}
            onChange={set('nom')}
            placeholder="Nom"
            required
          />
        </div>
        <FormField
          label="Téléphone"
          type="tel"
          value={form.telephone}
          onChange={set('telephone')}
          placeholder="+237 XXX XX XX XX"
        />
        <FormField
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="email@example.com"
        />
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !canSubmit}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
