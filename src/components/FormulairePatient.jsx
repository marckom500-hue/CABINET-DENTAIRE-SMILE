import { useState, useEffect } from 'react'
import FormField from './FormField'
import DateNaissancePicker from './DateNaissancePicker'

const empty = { nom: '', prenom: '', telephone: '', email: '', date_naissance: '', adresse: '', groupe_sanguin: '' }
const today = new Date().toISOString().split('T')[0]

// Liste des domaines de messagerie valides courants
const VALID_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.fr', 'hotmail.com', 'hotmail.fr',
  'outlook.com', 'outlook.fr', 'live.com', 'live.fr', 'icloud.com',
  'me.com', 'mac.com', 'protonmail.com', 'proton.me', 'aol.com',
  'orange.fr', 'sfr.fr', 'free.fr', 'laposte.net', 'wanadoo.fr',
  'bbox.fr', 'numericable.fr', 'neuf.fr', '9online.fr',
  'gmx.com', 'gmx.fr', 'mail.com', 'yandex.com', 'yandex.ru',
  'zoho.com', 'tutanota.com', 'fastmail.com', 'pm.me',
]

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

/**
 * Valide le nom ou prÃ©nom :
 * - uniquement des lettres (avec accents, tirets, apostrophes, espaces)
 * - au moins 3 lettres
 */
function validateName(value) {
  if (!value) return { valid: false, message: 'Ce champ est requis' }
  // Uniquement lettres (avec accents), tirets, apostrophes, espaces
  if (/[^\p{L}\s'-]/u.test(value)) {
    return { valid: false, message: 'Uniquement des lettres (pas de chiffres ni caractÃ¨res spÃ©ciaux)' }
  }
  // Compter uniquement les lettres
  const lettersOnly = value.replace(/[^\p{L}]/gu, '')
  if (lettersOnly.length < 3) {
    return { valid: false, message: 'Au moins 3 lettres requises' }
  }
  return { valid: true, message: 'Valide' }
}

/**
 * Valide l'email :
 * - format local@domaine.ext
 * - domaine doit Ãªtre dans la liste des domaines valides connus
 */
function validateEmail(value) {
  if (!value) return { valid: true, message: '' } // email optionnel
  // VÃ©rification format de base
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return { valid: false, message: 'Format invalide. Ex : prenom@gmail.com' }
  }
  const domain = value.split('@')[1]?.toLowerCase()
  if (!domain) {
    return { valid: false, message: 'Domaine manquant' }
  }
  if (!VALID_DOMAINS.includes(domain)) {
    return {
      valid: false,
      message: `Domaine non reconnu. Utilisez un domaine valide (gmail.com, yahoo.fr, outlook.comâ€¦)`,
    }
  }
  return { valid: true, message: 'Email valide' }
}

export default function FormulairePatient({ patient, onSubmit, onCancel, onFormChange }) {
  // Remonte l'Ã©tat du formulaire au parent (Topbar) pour dÃ©tecter dirty
  // useEffect est dÃ©clarÃ© aprÃ¨s useState ci-dessous
  const [form, setForm] = useState(normalizePatient(patient))
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({})

  // Notifie le parent Ã  chaque changement (pour dirty detection dans Topbar)
  useEffect(() => { onFormChange?.(form) }, [form]) // eslint-disable-line

  const set = (k) => (v) => {
    setForm(f => ({ ...f, [k]: v }))
    setTouched(t => ({ ...t, [k]: true }))
  }

  // Telephone : uniquement chiffres, max 9
  const setTelephone = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 9)
    setForm(f => ({ ...f, telephone: cleaned }))
    setTouched(t => ({ ...t, telephone: true }))
  }

  // Nom / PrÃ©nom : bloquer la saisie de chiffres et caractÃ¨res spÃ©ciaux dÃ¨s la frappe
  const setName = (k) => (value) => {
    // Autorise lettres, accents, espaces, tirets, apostrophes â€” bloque le reste
    const filtered = value.replace(/[^\p{L}\s'-]/gu, '')
    setForm(f => ({ ...f, [k]: filtered }))
    setTouched(t => ({ ...t, [k]: true }))
  }

  // Validations
  const prenomValidation = validateName(form.prenom)
  const nomValidation = validateName(form.nom)
  const emailValidation = validateEmail(form.email)

  const phoneIsValid = /^6\d{8}$/.test(form.telephone ?? '')
  const dateIsValid = !form.date_naissance || form.date_naissance <= today

  const canSubmit = Boolean(
    prenomValidation.valid &&
    nomValidation.valid &&
    phoneIsValid &&
    dateIsValid &&
    emailValidation.valid
  )

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit(form)
    } catch {
      // Le hook affiche dÃ©jÃ  la notification d'erreur.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Prenom"
          value={form.prenom}
          onChange={setName('prenom')}
          required
          validationState={touched.prenom ? (prenomValidation.valid ? 'success' : 'error') : undefined}
          validationMessage={
            touched.prenom
              ? prenomValidation.message
              : 'Au moins 3 lettres, uniquement des caractÃ¨res alphabÃ©tiques'
          }
        />
        <FormField
          label="Nom"
          value={form.nom}
          onChange={setName('nom')}
          required
          validationState={touched.nom ? (nomValidation.valid ? 'success' : 'error') : undefined}
          validationMessage={
            touched.nom
              ? nomValidation.message
              : 'Au moins 3 lettres, uniquement des caractÃ¨res alphabÃ©tiques'
          }
        />
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
        validationState={touched.telephone ? (phoneIsValid ? 'success' : 'error') : undefined}
        validationMessage={
          touched.telephone
            ? (phoneIsValid ? 'NumÃ©ro valide' : 'NumÃ©ro invalide : 9 chiffres requis, doit commencer par 6')
            : '9 chiffres requis, le numÃ©ro doit commencer par 6'
        }
      />

      {/* Email : type="text" pour contrÃ´le manuel, validation domaine stricte */}
      <FormField
        label="Email"
        type="text"
        inputMode="email"
        value={form.email}
        onChange={set('email')}
        placeholder="prenom@gmail.com"
        validationState={touched.email && form.email ? (emailValidation.valid ? 'success' : 'error') : undefined}
        validationMessage={
          touched.email && form.email
            ? emailValidation.message
            : 'Format requis : prenom@gmail.com, prenom@yahoo.frâ€¦'
        }
      />

      <DateNaissancePicker
        value={form.date_naissance}
        onChange={(val) => {
          setForm(f => ({ ...f, date_naissance: val }))
          setTouched(t => ({ ...t, date_naissance: true }))
        }}
        touched={touched.date_naissance}
      />

      <FormField
        label="Groupe sanguin"
        type="select"
        value={form.groupe_sanguin}
        onChange={set('groupe_sanguin')}
        options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
      />

      <FormField
        label="Adresse"
        type="textarea"
        value={form.adresse}
        onChange={set('adresse')}
      />

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !canSubmit}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : (patient ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </div>
  )
}
