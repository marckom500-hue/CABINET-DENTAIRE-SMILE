import { useState, useEffect } from 'react'
import FormField from './FormField'
import { usePatients } from '../hooks/usePatients'
import { supabase } from '../lib/supabase'
import { ACTES_OPTIONS } from '../lib/actes'
import { RDV_STATUS, RDV_STATUS_META, normalizeRdvStatus } from '../lib/statuses'
import { formatPhone } from '../utils/phone'
import QuickPatientForm from './QuickPatientForm'
import { checkSlotAvailability, getAvailableSlots } from '../hooks/useSlotAvailability'
import { useNotifications } from '../hooks/NotificationsContext'

const STATUTS = [
  { value: RDV_STATUS.CONFIRME, label: RDV_STATUS_META[RDV_STATUS.CONFIRME].label },
  { value: RDV_STATUS.ATTENTE,  label: RDV_STATUS_META[RDV_STATUS.ATTENTE].label  },
  { value: RDV_STATUS.URGENT,   label: RDV_STATUS_META[RDV_STATUS.URGENT].label   },
  { value: RDV_STATUS.RECU,     label: RDV_STATUS_META[RDV_STATUS.RECU].label     },
  { value: RDV_STATUS.ANNULE,   label: RDV_STATUS_META[RDV_STATUS.ANNULE].label   },
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
  statut: RDV_STATUS.CONFIRME, notes: '',
}
const today = new Date().toISOString().split('T')[0]

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
  const [form, setForm]   = useState(normalizeRdv(rdv))
  const [saving, setSaving] = useState(false)
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [slotError, setSlotError] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const { notify } = useNotifications()

  // ── Charger les médecins ──
  useEffect(() => {
    const fetchMedecins = async () => {
      setLoadingMedecins(true)
      const { data } = await supabase
        .from('users_profiles')
        .select('id, nom, prenom')
        .in('role', ['medecin', 'superadmin'])
        .eq('actif', true)
      setMedecins(data ?? [])
      setLoadingMedecins(false)
    }
    fetchMedecins()
  }, [])

  // ── true si on est en mode modification d'un RDV existant ──
  const isEdit = Boolean(rdv?.id)

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { setForm(normalizeRdv(rdv)) }, [rdv])
  useEffect(() => { onFormChange?.(form) }, [form, onFormChange])

  const patientOptions = patients.map(p => ({
    value: String(p.id),
    label: `${p.prenom ?? ''} ${p.nom ?? ''}${p.telephone ? ` - ${formatPhone(p.telephone)}` : ''}`.trim(),
  }))

  const medecinOptions = medecins.map(m => ({
    value: String(m.id),
    label: `Dr. ${m.prenom ?? ''} ${m.nom ?? ''}`.trim(),
  }))

  const dateTouched = Boolean(form.date)

  // Règle de validation de la date :
  // - Création  → date >= aujourd'hui (pas de RDV dans le passé)
  // - Modification → toute date est acceptée (le RDV peut être passé)
  const dateIsValid = form.date
    ? (isEdit ? true : form.date >= today)
    : false

  const canSubmit = Boolean(form.patient_id && form.medecin_id && form.date && form.heure && dateIsValid)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    setSlotError(null)
    try {
      // Vérifier la disponibilité du créneau (sauf en mode édition)
      if (!isEdit) {
        const { available } = await checkSlotAvailability(
          form.date,
          form.heure,
          form.medecin_id,
          rdv?.id
        )
        if (!available) {
          const slots = await getAvailableSlots(form.date, form.medecin_id, Number(form.duree))
          setAvailableSlots(slots)
          setSlotError(true)
          notify({
            type: 'error',
            message: 'Cette plage horaire n\'est pas disponible. Consultez l\'agenda complet du médecin.'
          })
          setSaving(false)
          return
        }
      }
      await onSubmit({ ...form, duree: Number(form.duree) })
    } catch {
      // Le hook affiche déjà la notification d'erreur.
    } finally {
      setSaving(false)
    }
  }

  const handlePatientCreated = async () => {
    await refreshPatients()
    // Le nouveau patient sera auto-sélectionné via l'effet useEffect suivant
  }

  // Message de validation de la date selon le contexte
  const dateValidationMessage = () => {
    if (!dateTouched) {
      return isEdit
        ? 'Vous pouvez modifier la date librement'
        : "Les dates passées sont bloquées pour un nouveau RDV"
    }
    if (!dateIsValid) return "Date invalide : choisissez aujourd'hui ou une date future"
    return 'Date valide'
  }

  // Auto-sélectionner le patient créé
  useEffect(() => {
    if (patients.length > 0 && !form.patient_id) {
      const lastPatient = patients[0]
      setForm(f => ({ ...f, patient_id: String(lastPatient.id) }))
    }
  }, [patients])

  return (
    <div className="space-y-3">
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

      <FormField
        label="Médecin"
        type="select"
        value={form.medecin_id}
        onChange={set('medecin_id')}
        options={medecinOptions}
        placeholder={loadingMedecins ? 'Chargement des médecins...' : 'Sélectionnez un médecin'}
        required
        disabled={loadingMedecins}
      />

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
        <FormField
          label="Heure"
          type="time"
          value={form.heure}
          onChange={set('heure')}
          required
        />
      </div>

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
        <FormField
          label="Statut"
          type="select"
          value={form.statut}
          onChange={set('statut')}
          options={STATUTS}
        />
      </div>

      <FormField
        label="Notes"
        type="textarea"
        value={form.notes}
        onChange={set('notes')}
        placeholder="Observations particulières..."
      />

      {slotError && availableSlots.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm font-medium text-yellow-800 mb-2">Créneaux disponibles :</p>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map(slot => (
              <button
                key={slot}
                onClick={() => {
                  setForm(f => ({ ...f, heure: slot }))
                  setSlotError(false)
                }}
                className="px-2 py-1 text-xs font-medium bg-white border border-yellow-300 hover:bg-yellow-100 rounded transition-colors"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

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
