// // import { useState } from 'react'
// import { useState, useEffect } from 'react' 
// import FormField from './FormField'
// import { usePatients } from '../hooks/usePatients'
// import { ACTES_OPTIONS } from '../lib/actes'

// const STATUTS = [
//   { value:'confirme', label:'Confirme' },
//   { value:'attente',  label:'En attente' },
//   { value:'urgent',   label:'Urgent' },
//   { value:'annule',   label:'Annule' },
// ]

// const DUREES = [
//   { value:'30',  label:'30 min' },
//   { value:'45',  label:'45 min' },
//   { value:'60',  label:'1h' },
//   { value:'90',  label:'1h30' },
//   { value:'120', label:'2h' },
// ]

// const empty = { patient_id:'', date:'', heure:'', type_acte:'Consultation', duree:'30', statut:'confirme', notes:'' }
// const today = new Date().toISOString().split('T')[0]

// function normalizeRdv(rdv) {
//   if (!rdv) return empty
//   return {
//     patient_id: rdv.patient_id ?? '',
//     date: rdv.date ?? '',
//     heure: rdv.heure ?? '',
//     type_acte: rdv.type_acte ?? 'Consultation',
//     duree: String(rdv.duree ?? '30'),
//     statut: rdv.statut ?? 'confirme',
//     notes: rdv.notes ?? '',
//   }
// }
//    export default function FormulaireRdv({ onSubmit, onCancel, onFormChange }) {
// // export default function FormulaireRdv({ rdv, onSubmit, onCancel }) {
//   const { patients, loading: loadingPatients } = usePatients()
//   const [form, setForm] = useState(normalizeRdv(rdv))
//   const [saving, setSaving] = useState(false)
//   const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

//   const patientOptions = patients.map(p => ({
//     value: p.id,
//     label: `${p.prenom ?? ''} ${p.nom ?? ''}${p.telephone ? ` - ${p.telephone}` : ''}`.trim(),
//   }))
//   const dateTouched = Boolean(form.date)
//   const dateIsValid = form.date ? form.date >= today : false
//   const canSubmit = Boolean(form.patient_id && form.date && form.heure && dateIsValid)

//   const handleSubmit = async () => {
//     if (!canSubmit) return
//     setSaving(true)
//     try {
//       await onSubmit({ ...form, duree: Number(form.duree) })
//     } catch {
//       // Le hook affiche deja la notification d'erreur.
//     } finally {
//       setSaving(false)
//     }
//   }

//   return (
//     <div className="space-y-3">
//       <FormField
//         label="Patient"
//         type="select"
//         value={form.patient_id}
//         onChange={set('patient_id')}
//         options={patientOptions}
//         required
//         disabled={loadingPatients}
//         hint={loadingPatients ? 'Chargement des patients...' : 'Selectionnez un patient deja enregistre'}
//       />
//       <div className="grid grid-cols-2 gap-3">
//         <FormField
//           label="Date"
//           type="date"
//           value={form.date}
//           onChange={set('date')}
//           required
//           min={today}
//           validationState={dateTouched ? (dateIsValid ? 'success' : 'error') : undefined}
//           validationMessage={
//             dateTouched
//               ? (dateIsValid ? 'Date de rendez-vous valide' : "Date invalide : choisissez aujourd'hui ou une date future")
//               : "Les dates passees sont bloquees pour un rendez-vous"
//           }
//         />
//         <FormField label="Heure" type="time" value={form.heure} onChange={set('heure')} required />
//       </div>
//       <FormField label="Type d'acte" type="select" value={form.type_acte} onChange={set('type_acte')} options={ACTES_OPTIONS} />
//       <div className="grid grid-cols-2 gap-3">
//         <FormField label="Duree" type="select" value={form.duree} onChange={set('duree')} options={DUREES} />
//         <FormField label="Statut" type="select" value={form.statut} onChange={set('statut')} options={STATUTS} />
//       </div>
//       <FormField label="Notes" type="textarea" value={form.notes} onChange={set('notes')} placeholder="Observations particulieres..." />
//       <div className="flex gap-3 pt-2">
//         <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
//         <button onClick={handleSubmit} disabled={saving || !canSubmit}
//           className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
//           {saving ? 'Enregistrement...' : (rdv ? 'Modifier' : 'Ajouter')}
//         </button>
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import FormField from './FormField'
import { usePatients } from '../hooks/usePatients'
import { ACTES_OPTIONS } from '../lib/actes'

const STATUTS = [
  { value:'confirme', label:'Confirme' },
  { value:'attente',  label:'En attente' },
  { value:'urgent',   label:'Urgent' },
  { value:'annule',   label:'Annule' },
]

const DUREES = [
  { value:'30',  label:'30 min' },
  { value:'45',  label:'45 min' },
  { value:'60',  label:'1h' },
  { value:'90',  label:'1h30' },
  { value:'120', label:'2h' },
]

const empty = { patient_id:'', date:'', heure:'', type_acte:'Consultation', duree:'30', statut:'confirme', notes:'' }
const today = new Date().toISOString().split('T')[0]

function normalizeRdv(rdv) {
  if (!rdv) return empty
  return {
    patient_id: rdv.patient_id ?? '',
    date: rdv.date ?? '',
    heure: rdv.heure ?? '',
    type_acte: rdv.type_acte ?? 'Consultation',
    duree: String(rdv.duree ?? '30'),
    statut: rdv.statut ?? 'confirme',
    notes: rdv.notes ?? '',
  }
}

export default function FormulaireRdv({ rdv, onSubmit, onCancel, onFormChange }) {
  const { patients, loading: loadingPatients } = usePatients()
  const [form, setForm] = useState(normalizeRdv(rdv))
  const [saving, setSaving] = useState(false)
  
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  // 👇 AJOUTEZ CE useEffect ICI (après useState, avant les const)
  useEffect(() => { 
    onFormChange?.(form) 
  }, [form]) // eslint-disable-line

  const patientOptions = patients.map(p => ({
    value: p.id,
    label: `${p.prenom ?? ''} ${p.nom ?? ''}${p.telephone ? ` - ${p.telephone}` : ''}`.trim(),
  }))
  
  const dateTouched = Boolean(form.date)
  const dateIsValid = form.date ? form.date >= today : false
  const canSubmit = Boolean(form.patient_id && form.date && form.heure && dateIsValid)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit({ ...form, duree: Number(form.duree) })
    } catch {
      // Le hook affiche deja la notification d'erreur.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <FormField
        label="Patient"
        type="select"
        value={form.patient_id}
        onChange={set('patient_id')}
        options={patientOptions}
        required
        disabled={loadingPatients}
        hint={loadingPatients ? 'Chargement des patients...' : 'Selectionnez un patient deja enregistre'}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Date"
          type="date"
          value={form.date}
          onChange={set('date')}
          required
          min={today}
          validationState={dateTouched ? (dateIsValid ? 'success' : 'error') : undefined}
          validationMessage={
            dateTouched
              ? (dateIsValid ? 'Date de rendez-vous valide' : "Date invalide : choisissez aujourd'hui ou une date future")
              : "Les dates passees sont bloquees pour un rendez-vous"
          }
        />
        <FormField label="Heure" type="time" value={form.heure} onChange={set('heure')} required />
      </div>
      <FormField label="Type d'acte" type="select" value={form.type_acte} onChange={set('type_acte')} options={ACTES_OPTIONS} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Duree" type="select" value={form.duree} onChange={set('duree')} options={DUREES} />
        <FormField label="Statut" type="select" value={form.statut} onChange={set('statut')} options={STATUTS} />
      </div>
      <FormField label="Notes" type="textarea" value={form.notes} onChange={set('notes')} placeholder="Observations particulieres..." />
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
        <button onClick={handleSubmit} disabled={saving || !canSubmit}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Enregistrement...' : (rdv ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </div>
  )
}