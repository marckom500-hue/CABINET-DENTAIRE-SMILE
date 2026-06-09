// import { useState, useEffect } from 'react'
// import FormField from './FormField'
// import TimePickerAmPm from './TimePickerAmPm'
// import { usePatients } from '../hooks/usePatients'
// import { supabase } from '../lib/supabase'
// import { ACTES_OPTIONS } from '../lib/actes'
// import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'
// import { formatPhone } from '../utils/phone'
// import QuickPatientForm from './QuickPatientForm'
// import { checkSlotAvailability, getAvailableSlots } from '../hooks/useSlotAvailability'
// import { useNotifications } from '../hooks/NotificationsContext'

// const STATUTS = [
//   { value: RDV_STATUS.PROGRAMME, label: RDV_STATUS_META[RDV_STATUS.PROGRAMME].label },
//   { value: RDV_STATUS.TERMINE,   label: RDV_STATUS_META[RDV_STATUS.TERMINE].label   },
//   { value: RDV_STATUS.ANNULE,    label: RDV_STATUS_META[RDV_STATUS.ANNULE].label    },
// ]

// const DUREES = [
//   { value: '30',  label: '30 min' },
//   { value: '45',  label: '45 min' },
//   { value: '60',  label: '1h'     },
//   { value: '90',  label: '1h30'   },
//   { value: '120', label: '2h'     },
// ]

// const empty = {
//   patient_id: '', medecin_id: '', date: '', heure: '',
//   type_acte: 'Consultation', duree: '30',
//   statut: RDV_STATUS.PROGRAMME, notes: '',
// }
// const today = new Date().toISOString().split('T')[0]

// function timeToMinutes(time) {
//   const [hours, minutes] = String(time || '').split(':').map(Number)
//   if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
//   return hours * 60 + minutes
// }

// function hasOverlap(startTime, duration, rdvList, currentRdvId = null) {
//   const start = timeToMinutes(startTime)
//   if (start == null) return false
//   const end = start + Number(duration || 30)

//   return rdvList.some(rdv => {
//     if (currentRdvId && String(rdv.id) === String(currentRdvId)) return false
//     if (normalizeRdvStatus(rdv.statut) === RDV_STATUS.ANNULE) return false
//     const rdvStart = timeToMinutes(rdv.heure)
//     if (rdvStart == null) return false
//     const rdvEnd = rdvStart + Number(rdv.duree || 30)
//     return start < rdvEnd && end > rdvStart
//   })
// }

// function normalizeRdv(rdv) {
//   if (!rdv) return empty
//   return {
//     patient_id: rdv.patient_id != null ? String(rdv.patient_id) : '',
//     medecin_id: rdv.medecin_id != null ? String(rdv.medecin_id) : '',
//     date:       rdv.date      ?? '',
//     heure:      rdv.heure     ?? '',
//     type_acte:  rdv.type_acte ?? 'Consultation',
//     duree:      String(rdv.duree ?? '30'),
//     statut:     normalizeRdvStatus(rdv.statut),
//     notes:      rdv.notes     ?? '',
//   }
// }

// export default function FormulaireRdv({ rdv, onSubmit, onCancel, onFormChange }) {
//   const { patients, loading: loadingPatients, refresh: refreshPatients } = usePatients()
//   const [medecins, setMedecins] = useState([])
//   const [loadingMedecins, setLoadingMedecins] = useState(true)
//   const [medecinError, setMedecinError] = useState(null)
//   const [form, setForm]   = useState(normalizeRdv(rdv))
//   const [saving, setSaving] = useState(false)
//   const [showQuickForm, setShowQuickForm] = useState(false)
//   const [slotError, setSlotError] = useState(null)
//   const [availableSlots, setAvailableSlots] = useState([])
//   const [doctorAgenda, setDoctorAgenda] = useState([])
//   const [loadingAgenda, setLoadingAgenda] = useState(false)
//   const [agendaError, setAgendaError] = useState(null)
//   const { notify } = useNotifications()

//   // ── Charger les médecins ──
//   useEffect(() => {
//     const fetchMedecins = async () => {
//       setLoadingMedecins(true)
//       setMedecinError(null)
//       try {
//         const { data, error } = await supabase
//           .from('users_profiles')
//           .select('id, nom, prenom, role, actif')
//           .in('role', ['medecin', 'superadmin'])
//           .eq('actif', true)
        
//         if (error) {
//           console.error('Erreur chargement médecins:', error)
//           setMedecinError(error.message)
//           setMedecins([])
//         } else {
//           console.log('Médecins chargés:', data)
//           setMedecins(data ?? [])
//         }
//       } catch (err) {
//         console.error('Exception chargement médecins:', err)
//         setMedecinError(err.message)
//         setMedecins([])
//       } finally {
//         setLoadingMedecins(false)
//       }
//     }
//     fetchMedecins()
//   }, [])

//   // ── true si on est en mode modification d'un RDV existant ──
//   const isEdit = Boolean(rdv?.id)

//   const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

//   useEffect(() => { setForm(normalizeRdv(rdv)) }, [rdv])
//   useEffect(() => { onFormChange?.(form) }, [form, onFormChange])

//   useEffect(() => {
//     let cancelled = false

//     const fetchDoctorAgenda = async () => {
//       if (!form.medecin_id || !form.date) {
//         setDoctorAgenda([])
//         setAvailableSlots([])
//         setAgendaError(null)
//         return
//       }

//       setLoadingAgenda(true)
//       setAgendaError(null)
//       try {
//         const [{ data, error }, slots] = await Promise.all([
//           supabase
//             .from('rendez_vous')
//             .select('id, date, heure, duree, statut, type_acte, patients(nom, prenom)')
//             .eq('date', form.date)
//             .eq('medecin_id', form.medecin_id)
//             .order('heure', { ascending: true }),
//           getAvailableSlots(form.date, form.medecin_id, Number(form.duree || 30)),
//         ])

//         if (cancelled) return
//         if (error) {
//           setAgendaError(error.message)
//           setDoctorAgenda([])
//           setAvailableSlots([])
//         } else {
//           setDoctorAgenda(data ?? [])
//           setAvailableSlots(slots ?? [])
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setAgendaError(err.message)
//           setDoctorAgenda([])
//           setAvailableSlots([])
//         }
//       } finally {
//         if (!cancelled) setLoadingAgenda(false)
//       }
//     }

//     fetchDoctorAgenda()
//     return () => { cancelled = true }
//   }, [form.medecin_id, form.date, form.duree])

//   const patientOptions = patients.map(p => ({
//     value: String(p.id),
//     label: `${p.prenom ?? ''} ${p.nom ?? ''}${p.telephone ? ` - ${formatPhone(p.telephone)}` : ''}`.trim(),
//   }))

//   const medecinOptions = medecins.map(m => ({
//     value: String(m.id),
//     label: `Dr. ${m.prenom ?? ''} ${m.nom ?? ''}`.trim(),
//   }))

//   const selectedMedecin = medecins.find(m => String(m.id) === String(form.medecin_id))
//   const selectedDoctorLabel = selectedMedecin
//     ? `Dr. ${selectedMedecin.prenom ?? ''} ${selectedMedecin.nom ?? ''}`.trim()
//     : 'Medecin'
//   const activeAgenda = doctorAgenda.filter(r => normalizeRdvStatus(r.statut) !== RDV_STATUS.ANNULE)
//   const proposedSlotConflicts = hasOverlap(form.heure, form.duree, doctorAgenda, rdv?.id)

//   const dateTouched = Boolean(form.date)

//   // Règle de validation de la date :
//   // - Création  → date >= aujourd'hui (pas de RDV dans le passé)
//   // - Modification → toute date est acceptée (le RDV peut être passé)
//   const dateIsValid = form.date
//     ? (isEdit ? true : form.date >= today)
//     : false

//   const canSubmit = Boolean(form.patient_id && form.medecin_id && form.date && form.heure && dateIsValid)

//   const handleSubmit = async () => {
//     if (!canSubmit) return
//     setSaving(true)
//     setSlotError(null)
//     try {
//       // Vérifier la disponibilité du créneau (sauf en mode édition)
//       if (form.date && form.heure && form.medecin_id) {
//         const { available } = await checkSlotAvailability(
//           form.date,
//           form.heure,
//           form.medecin_id,
//           rdv?.id,
//           Number(form.duree || 30)
//         )
//         if (!available) {
//           const slots = await getAvailableSlots(form.date, form.medecin_id, Number(form.duree))
//           setAvailableSlots(slots)
//           setSlotError(true)
//           notify({
//             type: 'error',
//             message: 'Cette plage horaire n\'est pas disponible. Consultez l\'agenda complet du médecin.'
//           })
//           setSaving(false)
//           return
//         }
//       }
//       await onSubmit({ ...form, duree: Number(form.duree) })
//     } catch {
//       // Le hook affiche déjà la notification d'erreur.
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handlePatientCreated = async () => {
//     await refreshPatients()
//     // Le nouveau patient sera auto-sélectionné via l'effet useEffect suivant
//   }

//   // Message de validation de la date selon le contexte
//   const dateValidationMessage = () => {
//     if (!dateTouched) {
//       return isEdit
//         ? 'Vous pouvez modifier la date librement'
//         : "Les dates passées sont bloquées pour un nouveau RDV"
//     }
//     if (!dateIsValid) return "Date invalide : choisissez aujourd'hui ou une date future"
//     return 'Date valide'
//   }

//   // Auto-sélectionner le patient créé
//   useEffect(() => {
//     if (patients.length > 0 && !form.patient_id) {
//       const lastPatient = patients[0]
//       setForm(f => ({ ...f, patient_id: String(lastPatient.id) }))
//     }
//   }, [patients])

//   return (
//     <div className="space-y-3">
//       <div>
//         <div className="flex items-center justify-between gap-2 mb-2">
//           <label className="block text-sm font-medium text-gray-700">
//             Patient <span className="text-red-500">*</span>
//           </label>
//           <button
//             type="button"
//             onClick={() => setShowQuickForm(true)}
//             className="text-xs text-teal-600 hover:text-teal-700 font-medium"
//           >
//             + Ajouter un nouveau patient
//           </button>
//         </div>
//         <FormField
//           label=""
//           type="select"
//           value={form.patient_id}
//           onChange={set('patient_id')}
//           options={patientOptions}
//           placeholder={loadingPatients ? 'Chargement des patients...' : 'Sélectionnez un patient'}
//           required
//           disabled={loadingPatients}
//           hideLabel
//         />
//       </div>

//       <QuickPatientForm
//         isOpen={showQuickForm}
//         onClose={() => setShowQuickForm(false)}
//         onPatientCreated={handlePatientCreated}
//       />

//       <FormField
//         label="Médecin"
//         type="select"
//         value={form.medecin_id}
//         onChange={set('medecin_id')}
//         options={medecinOptions}
//         placeholder={loadingMedecins ? 'Chargement des médecins...' : (medecinError ? 'Erreur de chargement' : 'Sélectionnez un médecin')}
//         required
//         disabled={loadingMedecins || medecinError}
//       />
//       {medecinError && (
//         <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
//           ⚠️ Erreur : {medecinError}
//         </div>
//       )}
//       {!loadingMedecins && !medecinError && medecins.length === 0 && (
//         <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
//           ⚠️ Aucun médecin disponible. Vérifiez que vous avez des médecins actifs en base.
//         </div>
//       )}

//       <div className="grid grid-cols-2 gap-3">
//         <FormField
//           label="Date"
//           type="date"
//           value={form.date}
//           onChange={set('date')}
//           required
//           min={isEdit ? undefined : today}
//           validationState={dateTouched ? (dateIsValid ? 'success' : 'error') : undefined}
//           validationMessage={dateValidationMessage()}
//         />
//         <TimePickerAmPm
//           value={form.heure}
//           onChange={set('heure')}
//           required
//         />
//       </div>

//       <FormField
//         label="Type d'acte"
//         type="select"
//         value={form.type_acte}
//         onChange={set('type_acte')}
//         options={ACTES_OPTIONS}
//       />

//       <div className="grid grid-cols-2 gap-3">
//         <FormField
//           label="Durée"
//           type="select"
//           value={form.duree}
//           onChange={set('duree')}
//           options={DUREES}
//         />
//       </div>

//       {form.medecin_id && form.date && (
//         <div className="border border-gray-200 rounded-lg overflow-hidden">
//           <div className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
//             <div>
//               <p className="text-sm font-medium text-gray-900">Agenda du praticien</p>
//               <p className="text-xs text-gray-500">{selectedDoctorLabel} - {form.date}</p>
//             </div>
//             {loadingAgenda && (
//               <span className="text-xs text-gray-500">Chargement...</span>
//             )}
//           </div>

//           {agendaError ? (
//             <div className="p-3 text-xs text-red-600 bg-red-50">
//               Impossible de charger l'agenda : {agendaError}
//             </div>
//           ) : activeAgenda.length === 0 ? (
//             <div className="p-3 text-sm text-gray-500">
//               Aucun rendez-vous planifie pour cette date.
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100">
//               {activeAgenda.map(item => {
//                 const statut = normalizeRdvStatus(item.statut)
//                 const meta = RDV_STATUS_META[statut] ?? RDV_STATUS_META[RDV_STATUS.PROGRAMME]
//                 const patientName = item.patients
//                   ? `${item.patients.prenom ?? ''} ${item.patients.nom ?? ''}`.trim()
//                   : 'Patient'

//                 return (
//                   <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
//                     <div className="min-w-0">
//                       <p className="text-sm font-medium text-gray-900">
//                         {item.heure} - {Number(item.duree || 30)} min
//                       </p>
//                       <p className="text-xs text-gray-500 truncate">
//                         {patientName} - {item.type_acte || 'Acte non renseigne'}
//                       </p>
//                     </div>
//                     <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${meta.cls}`}>
//                       {meta.label}
//                     </span>
//                   </div>
//                 )
//               })}
//             </div>
//           )}

//           {form.heure && proposedSlotConflicts && (
//             <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border-t border-red-100">
//               Le creneau choisi chevauche un rendez-vous existant.
//             </div>
//           )}

//           {!proposedSlotConflicts && availableSlots.length > 0 && (
//             <div className="px-3 py-2 text-xs text-gray-500 bg-white border-t border-gray-100">
//               {availableSlots.length} creneaux compatibles avec cette duree sont disponibles.
//             </div>
//           )}
//         </div>
//       )}

//       <FormField
//         label="Notes"
//         type="textarea"
//         value={form.notes}
//         onChange={set('notes')}
//         placeholder="Observations particulières..."
//       />

//       {slotError && availableSlots.length > 0 && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//           <p className="text-sm font-medium text-yellow-800 mb-2">Créneaux disponibles :</p>
//           <div className="grid grid-cols-3 gap-2">
//             {availableSlots.map(slot => (
//               <button
//                 key={slot}
//                 onClick={() => {
//                   setForm(f => ({ ...f, heure: slot }))
//                   setSlotError(false)
//                 }}
//                 className="px-2 py-1 text-xs font-medium bg-white border border-yellow-300 hover:bg-yellow-100 rounded transition-colors"
//               >
//                 {slot}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="flex gap-3 pt-2">
//         <button
//           onClick={onCancel}
//           className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
//           Annuler
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={saving || !canSubmit}
//           className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
//           {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
//         </button>
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import FormField from './FormField'
import TimePickerAmPm from './TimePickerAmPm'
import { usePatients } from '../hooks/usePatients'
import { supabase } from '../lib/supabase'
import { ACTES_OPTIONS } from '../lib/actes'
import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'
import { formatPhone } from '../utils/phone'
import QuickPatientForm from './QuickPatientForm'
import { checkSlotAvailability, getAvailableSlots } from '../hooks/useSlotAvailability'
import { useNotifications } from '../hooks/NotificationsContext'

const STATUTS = [
  { value: RDV_STATUS.PROGRAMME, label: RDV_STATUS_META[RDV_STATUS.PROGRAMME].label },
  { value: RDV_STATUS.TERMINE,   label: RDV_STATUS_META[RDV_STATUS.TERMINE].label   },
  { value: RDV_STATUS.ANNULE,    label: RDV_STATUS_META[RDV_STATUS.ANNULE].label    },
]

const DUREES = [
  { value: '30',  label: '30 min' },
  { value: '45',  label: '45 min' },
  { value: '60',  label: '1h'     },
  { value: '90',  label: '1h30'   },
  { value: '120', label: '2h'     },
]

const empty = {
  patient_id: '', medecin_id: '', date: '', heure: '',
  type_acte: 'Consultation', duree: '30',
  statut: RDV_STATUS.PROGRAMME, notes: '',
}
const today = new Date().toISOString().split('T')[0]

function timeToMinutes(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function hasOverlap(startTime, duration, rdvList, currentRdvId = null) {
  const start = timeToMinutes(startTime)
  if (start == null) return false
  const end = start + Number(duration || 30)

  return rdvList.some(rdv => {
    if (currentRdvId && String(rdv.id) === String(currentRdvId)) return false
    if (normalizeRdvStatus(rdv.statut) === RDV_STATUS.ANNULE) return false
    const rdvStart = timeToMinutes(rdv.heure)
    if (rdvStart == null) return false
    const rdvEnd = rdvStart + Number(rdv.duree || 30)
    return start < rdvEnd && end > rdvStart
  })
}

function normalizeRdv(rdv) {
  if (!rdv) return empty
  return {
    patient_id: rdv.patient_id != null ? String(rdv.patient_id) : '',
    medecin_id: rdv.medecin_id != null ? String(rdv.medecin_id) : '',
    date:       rdv.date      ?? '',
    heure:      rdv.heure     ?? '',
    type_acte:  rdv.type_acte ?? 'Consultation',
    duree:      String(rdv.duree ?? '30'),
    statut:     normalizeRdvStatus(rdv.statut),
    notes:      rdv.notes     ?? '',
  }
}

export default function FormulaireRdv({ rdv, onSubmit, onCancel, onFormChange }) {
  const { patients, loading: loadingPatients, refresh: refreshPatients } = usePatients()
  const [medecins, setMedecins] = useState([])
  const [loadingMedecins, setLoadingMedecins] = useState(true)
  const [medecinError, setMedecinError] = useState(null)
  const [form, setForm]   = useState(normalizeRdv(rdv))
  const [saving, setSaving] = useState(false)
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [slotError, setSlotError] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [doctorAgenda, setDoctorAgenda] = useState([])
  const [loadingAgenda, setLoadingAgenda] = useState(false)
  const [agendaError, setAgendaError] = useState(null)
  const { notify } = useNotifications()

  // ── Charger les médecins ──
  useEffect(() => {
    const fetchMedecins = async () => {
      setLoadingMedecins(true)
      setMedecinError(null)
      try {
        const { data, error } = await supabase
          .from('users_profiles')
          .select('id, nom, prenom, role, actif')
          .in('role', ['medecin', 'superadmin'])
          .eq('actif', true)
        
        if (error) {
          console.error('Erreur chargement médecins:', error)
          setMedecinError(error.message)
          setMedecins([])
        } else {
          setMedecins(data ?? [])
        }
      } catch (err) {
        console.error('Exception chargement médecins:', err)
        setMedecinError(err.message)
        setMedecins([])
      } finally {
        setLoadingMedecins(false)
      }
    }
    fetchMedecins()
  }, [])

  const isEdit = Boolean(rdv?.id)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { setForm(normalizeRdv(rdv)) }, [rdv])
  useEffect(() => { onFormChange?.(form) }, [form, onFormChange])

  // ── Charger l'agenda et les créneaux disponibles ──
  useEffect(() => {
    let cancelled = false

    const fetchDoctorAgenda = async () => {
      if (!form.medecin_id || !form.date) {
        setDoctorAgenda([])
        setAvailableSlots([])
        setAgendaError(null)
        return
      }

      setLoadingAgenda(true)
      setAgendaError(null)
      try {
        const [{ data, error }, slots] = await Promise.all([
          supabase
            .from('rendez_vous')
            .select('id, date, heure, duree, statut, type_acte, patients(nom, prenom)')
            .eq('date', form.date)
            .eq('medecin_id', form.medecin_id)
            .order('heure', { ascending: true }),
          getAvailableSlots(form.date, form.medecin_id, Number(form.duree || 30)),
        ])

        if (cancelled) return
        if (error) {
          setAgendaError(error.message)
          setDoctorAgenda([])
          setAvailableSlots([])
        } else {
          setDoctorAgenda(data ?? [])
          setAvailableSlots(slots ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setAgendaError(err.message)
          setDoctorAgenda([])
          setAvailableSlots([])
        }
      } finally {
        if (!cancelled) setLoadingAgenda(false)
      }
    }

    fetchDoctorAgenda()
    return () => { cancelled = true }
  }, [form.medecin_id, form.date, form.duree])

  const patientOptions = patients.map(p => ({
    value: String(p.id),
    label: `${p.prenom ?? ''} ${p.nom ?? ''}${p.telephone ? ` - ${formatPhone(p.telephone)}` : ''}`.trim(),
  }))

  const medecinOptions = medecins.map(m => ({
    value: String(m.id),
    label: `Dr. ${m.prenom ?? ''} ${m.nom ?? ''}`.trim(),
  }))

  const selectedMedecin = medecins.find(m => String(m.id) === String(form.medecin_id))
  const selectedDoctorLabel = selectedMedecin
    ? `Dr. ${selectedMedecin.prenom ?? ''} ${selectedMedecin.nom ?? ''}`.trim()
    : 'Medecin'
  const activeAgenda = doctorAgenda.filter(r => normalizeRdvStatus(r.statut) !== RDV_STATUS.ANNULE)
  const proposedSlotConflicts = hasOverlap(form.heure, form.duree, doctorAgenda, rdv?.id)

  const dateTouched = Boolean(form.date)
  const dateIsValid = form.date
    ? (isEdit ? true : form.date >= today)
    : false

  const canSubmit = Boolean(form.patient_id && form.medecin_id && form.date && form.heure && dateIsValid && !proposedSlotConflicts)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    setSlotError(null)
    try {
      if (form.date && form.heure && form.medecin_id) {
        const { available } = await checkSlotAvailability(
          form.date,
          form.heure,
          form.medecin_id,
          rdv?.id,
          Number(form.duree || 30)
        )
        if (!available) {
          const slots = await getAvailableSlots(form.date, form.medecin_id, Number(form.duree))
          setAvailableSlots(slots)
          setSlotError(true)
          notify({
            type: 'error',
            message: 'Cette plage horaire n\'est pas disponible. Cliquez sur un créneau proposé.'
          })
          setSaving(false)
          return
        }
      }
      await onSubmit({ ...form, duree: Number(form.duree) })
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const handlePatientCreated = async () => {
    await refreshPatients()
  }

  const dateValidationMessage = () => {
    if (!dateTouched) {
      return isEdit
        ? 'Vous pouvez modifier la date librement'
        : "Les dates passées sont bloquées pour un nouveau RDV"
    }
    if (!dateIsValid) return "Date invalide : choisissez aujourd'hui ou une date future"
    return 'Date valide'
  }

  useEffect(() => {
    if (patients.length > 0 && !form.patient_id) {
      const lastPatient = patients[0]
      setForm(f => ({ ...f, patient_id: String(lastPatient.id) }))
    }
  }, [patients])

  return (
    <div className="space-y-3">
      {/* Patient */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Patient <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowQuickForm(true)}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium"
          >
            + Ajouter un nouveau patient
          </button>
        </div>
        <FormField
          label=""
          type="select"
          value={form.patient_id}
          onChange={set('patient_id')}
          options={patientOptions}
          placeholder={loadingPatients ? 'Chargement des patients...' : 'Sélectionnez un patient'}
          required
          disabled={loadingPatients}
          hideLabel
        />
      </div>

      <QuickPatientForm
        isOpen={showQuickForm}
        onClose={() => setShowQuickForm(false)}
        onPatientCreated={handlePatientCreated}
      />

      {/* Médecin */}
      <FormField
        label="Médecin"
        type="select"
        value={form.medecin_id}
        onChange={set('medecin_id')}
        options={medecinOptions}
        placeholder={loadingMedecins ? 'Chargement des médecins...' : (medecinError ? 'Erreur de chargement' : 'Sélectionnez un médecin')}
        required
        disabled={loadingMedecins || medecinError}
      />
      {medecinError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          ⚠️ Erreur : {medecinError}
        </div>
      )}
      {!loadingMedecins && !medecinError && medecins.length === 0 && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
          ⚠️ Aucun médecin disponible. Vérifiez que vous avez des médecins actifs en base.
        </div>
      )}

      {/* Date et Heure */}
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Date"
          type="date"
          value={form.date}
          onChange={set('date')}
          required
          min={isEdit ? undefined : today}
          validationState={dateTouched ? (dateIsValid ? 'success' : 'error') : undefined}
          validationMessage={dateValidationMessage()}
        />
        <TimePickerAmPm
          value={form.heure}
          onChange={set('heure')}
          required
        />
      </div>

      {/* Type d'acte et Durée */}
      <FormField
        label="Type d'acte"
        type="select"
        value={form.type_acte}
        onChange={set('type_acte')}
        options={ACTES_OPTIONS}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Durée"
          type="select"
          value={form.duree}
          onChange={set('duree')}
          options={DUREES}
        />
      </div>

      {/* Agenda et créneaux disponibles */}
      {form.medecin_id && form.date && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Agenda du praticien</p>
              <p className="text-xs text-gray-500">{selectedDoctorLabel} - {form.date}</p>
            </div>
            {loadingAgenda && <span className="text-xs text-gray-500">Chargement...</span>}
          </div>

          {agendaError ? (
            <div className="p-3 text-xs text-red-600 bg-red-50">
              Impossible de charger l'agenda : {agendaError}
            </div>
          ) : activeAgenda.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">
              Aucun rendez-vous planifié pour cette date.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {activeAgenda.map(item => {
                const statut = normalizeRdvStatus(item.statut)
                const meta = RDV_STATUS_META[statut] ?? RDV_STATUS_META[RDV_STATUS.PROGRAMME]
                const patientName = item.patients
                  ? `${item.patients.prenom ?? ''} ${item.patients.nom ?? ''}`.trim()
                  : 'Patient'
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {item.heure} - {Number(item.duree || 30)} min
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {patientName} - {item.type_acte || 'Acte non renseigné'}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Message de conflit */}
          {form.heure && proposedSlotConflicts && (
            <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border-t border-red-100">
              ⚠️ Le créneau choisi chevauche un rendez-vous existant.
            </div>
          )}

          {/* Créneaux disponibles - TOUJOURS affiché si disponible */}
          {availableSlots.length > 0 && (
            <div className={`px-3 py-2 text-xs border-t ${
              proposedSlotConflicts 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                : 'bg-white border-gray-100 text-gray-600'
            }`}>
              <p className="font-medium mb-2">
                📅 {proposedSlotConflicts ? 'Créneaux disponibles suggérés' : `${availableSlots.length} créneau(x) disponible(s)`} :
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSlots.slice(0, 8).map(slot => (
                  <button
                    key={slot}
                    onClick={() => {
                      setForm(f => ({ ...f, heure: slot }))
                      setSlotError(false)
                    }}
                    className="px-2 py-1 text-xs font-medium bg-white border border-gray-300 hover:bg-teal-50 hover:border-teal-400 rounded transition-colors"
                  >
                    {slot}
                  </button>
                ))}
                {availableSlots.length > 8 && (
                  <span className="text-xs text-gray-400 self-center">
                    +{availableSlots.length - 8} autres
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Message si aucun créneau */}
          {!loadingAgenda && availableSlots.length === 0 && form.medecin_id && form.date && (
            <div className="px-3 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-200">
              ⚠️ Aucun créneau disponible pour cette durée ({form.duree} min). 
              Essayez une durée plus courte ou une autre date.
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <FormField
        label="Notes"
        type="textarea"
        value={form.notes}
        onChange={set('notes')}
        placeholder="Observations particulières..."
      />

      {/* Boutons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !canSubmit}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </div>
  )
}