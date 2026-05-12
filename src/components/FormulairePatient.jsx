// import { useState } from 'react'
// import FormField from './FormField'

// const empty = { nom:'', prenom:'', telephone:'', email:'', date_naissance:'', adresse:'', groupe_sanguin:'' }
// const today = new Date().toISOString().split('T')[0]

// function normalizePatient(patient) {
//   if (!patient) return empty
//   return {
//     nom: patient.nom ?? '',
//     prenom: patient.prenom ?? '',
//     telephone: patient.telephone ?? '',
//     email: patient.email ?? '',
//     date_naissance: patient.date_naissance ?? '',
//     adresse: patient.adresse ?? '',
//     groupe_sanguin: patient.groupe_sanguin ?? '',
//     statut: patient.statut ?? 'Actif',
//   }
// }

// export default function FormulairePatient({ patient, onSubmit, onCancel }) {
//   const [form, setForm] = useState(normalizePatient(patient))
//   const [saving, setSaving] = useState(false)
//   const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))
//   const setTelephone = (value) => set('telephone')(value.replace(/\D/g, '').slice(0, 9))

//   const phoneIsValid = /^6\d{8}$/.test(form.telephone ?? '')
//   const phoneTouched = Boolean(form.telephone)
//   const dateIsValid = !form.date_naissance || form.date_naissance <= today
//   const dateTouched = Boolean(form.date_naissance)
//   const canSubmit = Boolean(form.prenom && form.nom && phoneIsValid && dateIsValid)

//   const handleSubmit = async () => {
//     if (!canSubmit) return
//     setSaving(true)
//     try {
//       await onSubmit(form)
//     } catch {
//       // Le hook affiche deja la notification d'erreur.
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="space-y-3">
//       <div className="grid grid-cols-2 gap-3">
//         <FormField label="Prenom" value={form.prenom} onChange={set('prenom')} required />
//         <FormField label="Nom" value={form.nom} onChange={set('nom')} required />
//       </div>
//       <FormField
//         label="Telephone"
//         value={form.telephone}
//         onChange={setTelephone}
//         placeholder="6XXXXXXXX"
//         required
//         inputMode="numeric"
//         maxLength={9}
//         pattern="6[0-9]{8}"
//         validationState={phoneTouched ? (phoneIsValid ? 'success' : 'error') : undefined}
//         validationMessage={
//           phoneTouched
//             ? (phoneIsValid ? 'Numero valide' : 'Numero invalide : 9 chiffres requis et doit commencer par 6')
//             : '9 chiffres requis, le numero doit commencer par 6'
//         }
//       />
//       <FormField label="Email" type="email" value={form.email} onChange={set('email')} />
//       <FormField
//         label="Date de naissance"
//         type="date"
//         value={form.date_naissance}
//         onChange={set('date_naissance')}
//         max={today}
//         validationState={dateTouched ? (dateIsValid ? 'success' : 'error') : undefined}
//         validationMessage={
//           dateTouched
//             ? (dateIsValid ? 'Date valide' : "Date invalide : elle ne peut pas etre superieure a aujourd'hui")
//             : "Les dates futures sont bloquees dans le calendrier"
//         }
//       />
//       <FormField label="Groupe sanguin" type="select" value={form.groupe_sanguin} onChange={set('groupe_sanguin')}
//         options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
//       <FormField label="Adresse" type="textarea" value={form.adresse} onChange={set('adresse')} />
//       <div className="flex gap-3 pt-2">
//         <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
//           Annuler
//         </button>
//         <button onClick={handleSubmit} disabled={saving || !canSubmit}
//           className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
//           {saving ? 'Enregistrement...' : (patient ? 'Modifier' : 'Ajouter')}
//         </button>
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import FormField from './FormField'

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
 * Valide le nom ou prénom :
 * - uniquement des lettres (avec accents, tirets, apostrophes, espaces)
 * - au moins 3 lettres
 */
function validateName(value) {
  if (!value) return { valid: false, message: 'Ce champ est requis' }
  // Uniquement lettres (avec accents), tirets, apostrophes, espaces
  if (/[^a-zA-ZÀ-ÿ\s\-'']/.test(value)) {
    return { valid: false, message: 'Uniquement des lettres (pas de chiffres ni caractères spéciaux)' }
  }
  // Compter uniquement les lettres
  const lettersOnly = value.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (lettersOnly.length < 3) {
    return { valid: false, message: 'Au moins 3 lettres requises' }
  }
  return { valid: true, message: 'Valide' }
}

/**
 * Valide l'email :
 * - format local@domaine.ext
 * - domaine doit être dans la liste des domaines valides connus
 */
function validateEmail(value) {
  if (!value) return { valid: true, message: '' } // email optionnel
  // Vérification format de base
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
      message: `Domaine non reconnu. Utilisez un domaine valide (gmail.com, yahoo.fr, outlook.com…)`,
    }
  }
  return { valid: true, message: 'Email valide' }
}

export default function FormulairePatient({ patient, onSubmit, onCancel, onFormChange }) {
  // Remonte l'état du formulaire au parent (Topbar) pour détecter dirty
  // useEffect est déclaré après useState ci-dessous
  const [form, setForm] = useState(normalizePatient(patient))
  const [saving, setSaving] = useState(false)
  const [touched, setTouched] = useState({})

  // Notifie le parent à chaque changement (pour dirty detection dans Topbar)
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

  // Nom / Prénom : bloquer la saisie de chiffres et caractères spéciaux dès la frappe
  const setName = (k) => (value) => {
    // Autorise lettres, accents, espaces, tirets, apostrophes — bloque le reste
    const filtered = value.replace(/[^a-zA-ZÀ-ÿ\s\-'']/g, '')
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
      // Le hook affiche déjà la notification d'erreur.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Prénom"
          value={form.prenom}
          onChange={setName('prenom')}
          required
          validationState={touched.prenom ? (prenomValidation.valid ? 'success' : 'error') : undefined}
          validationMessage={
            touched.prenom
              ? prenomValidation.message
              : 'Au moins 3 lettres, uniquement des caractères alphabétiques'
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
              : 'Au moins 3 lettres, uniquement des caractères alphabétiques'
          }
        />
      </div>

      <FormField
        label="Téléphone"
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
            ? (phoneIsValid ? 'Numéro valide' : 'Numéro invalide : 9 chiffres requis, doit commencer par 6')
            : '9 chiffres requis, le numéro doit commencer par 6'
        }
      />

      {/* Email : type="text" pour contrôle manuel, validation domaine stricte */}
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
            : 'Format requis : prenom@gmail.com, prenom@yahoo.fr…'
        }
      />

      <FormField
        label="Date de naissance"
        type="date"
        value={form.date_naissance}
        onChange={set('date_naissance')}
        max={today}
        validationState={touched.date_naissance ? (dateIsValid ? 'success' : 'error') : undefined}
        validationMessage={
          touched.date_naissance
            ? (dateIsValid ? 'Date valide' : "Date invalide : elle ne peut pas être supérieure à aujourd'hui")
            : "Les dates futures sont bloquées dans le calendrier"
        }
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
