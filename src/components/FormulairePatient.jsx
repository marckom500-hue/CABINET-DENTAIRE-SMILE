import { useState } from 'react'
import FormField from './FormField'

const empty = { nom:'', prenom:'', telephone:'', email:'', date_naissance:'', adresse:'', groupe_sanguin:'' }

export default function FormulairePatient({ patient, onSubmit, onCancel }) {
  const [form, setForm] = useState(patient ?? empty)
  const [saving, setSaving] = useState(false)
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setSaving(true)
    await onSubmit(form)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Prénom" value={form.prenom} onChange={set('prenom')} required />
        <FormField label="Nom"    value={form.nom}    onChange={set('nom')}    required />
      </div>
      <FormField label="Téléphone" value={form.telephone} onChange={set('telephone')} placeholder="6XX XXX XXX" />
      <FormField label="Email"     type="email" value={form.email} onChange={set('email')} />
      <FormField label="Date de naissance" type="date" value={form.date_naissance} onChange={set('date_naissance')} />
      <FormField label="Groupe sanguin" type="select" value={form.groupe_sanguin} onChange={set('groupe_sanguin')}
        options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
      <FormField label="Adresse" type="textarea" value={form.adresse} onChange={set('adresse')} />
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Annuler
        </button>
        <button onClick={handleSubmit} disabled={saving}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Enregistrement...' : (patient ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </div>
  )
}
