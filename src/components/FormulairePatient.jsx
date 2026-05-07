import { useState } from 'react'
import FormField from './FormField'

const empty = { nom:'', prenom:'', telephone:'', email:'', date_naissance:'', adresse:'', groupe_sanguin:'' }
const today = new Date().toISOString().split('T')[0]

function normalizePatient(patient) {
  if (!patient) return empty
  return {
    nom: patient.nom ?? '',
    prenom: patient.prenom ?? '',
    telephone: patient.telephone ?? '',
    email: patient.email ?? '',
    date_naissance: patient.date_naissance ?? '',
    adresse: patient.adresse ?? '',
    groupe_sanguin: patient.groupe_sanguin ?? '',
    statut: patient.statut ?? 'Actif',
  }
}

export default function FormulairePatient({ patient, onSubmit, onCancel }) {
  const [form, setForm] = useState(normalizePatient(patient))
  const [saving, setSaving] = useState(false)
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
  const setTelephone = (value) => set('telephone')(value.replace(/\D/g, '').slice(0, 9))

  const phoneIsValid = /^6\d{8}$/.test(form.telephone ?? '')
  const phoneTouched = Boolean(form.telephone)
  const dateIsValid = !form.date_naissance || form.date_naissance <= today
  const dateTouched = Boolean(form.date_naissance)
  const canSubmit = Boolean(form.prenom && form.nom && phoneIsValid && dateIsValid)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit(form)
    } catch {
      // Le hook affiche deja la notification d'erreur.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Prenom" value={form.prenom} onChange={set('prenom')} required />
        <FormField label="Nom" value={form.nom} onChange={set('nom')} required />
      </div>
      <FormField
        label="Telephone"
        value={form.telephone}
        onChange={setTelephone}
        placeholder="6XXXXXXXX"
        required
        inputMode="numeric"
        maxLength={9}
        pattern="6[0-9]{8}"
        validationState={phoneTouched ? (phoneIsValid ? 'success' : 'error') : undefined}
        validationMessage={
          phoneTouched
            ? (phoneIsValid ? 'Numero valide' : 'Numero invalide : 9 chiffres requis et doit commencer par 6')
            : '9 chiffres requis, le numero doit commencer par 6'
        }
      />
      <FormField label="Email" type="email" value={form.email} onChange={set('email')} />
      <FormField
        label="Date de naissance"
        type="date"
        value={form.date_naissance}
        onChange={set('date_naissance')}
        max={today}
        validationState={dateTouched ? (dateIsValid ? 'success' : 'error') : undefined}
        validationMessage={
          dateTouched
            ? (dateIsValid ? 'Date valide' : "Date invalide : elle ne peut pas etre superieure a aujourd'hui")
            : "Les dates futures sont bloquees dans le calendrier"
        }
      />
      <FormField label="Groupe sanguin" type="select" value={form.groupe_sanguin} onChange={set('groupe_sanguin')}
        options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
      <FormField label="Adresse" type="textarea" value={form.adresse} onChange={set('adresse')} />
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Annuler
        </button>
        <button onClick={handleSubmit} disabled={saving || !canSubmit}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Enregistrement...' : (patient ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </div>
  )
}
