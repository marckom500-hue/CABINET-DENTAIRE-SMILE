import { useState } from 'react'
import FormField from './FormField'

const TYPES_ACTES = ['Consultation','Détartrage','Extraction','Implant','Radiographie','Orthodontie','Blanchiment']
const STATUTS     = [
  { value:'confirme', label:'Confirmé' },{ value:'attente',  label:'En attente' },
  { value:'urgent',   label:'Urgent'   },{ value:'annule',   label:'Annulé'     },
]
const DUREES = [
  { value:'30',  label:'30 min' },{ value:'45',  label:'45 min' },
  { value:'60',  label:'1h'     },{ value:'90',  label:'1h30'   },{ value:'120', label:'2h' },
]

const empty = { patient_id:'', date:'', heure:'', type_acte:'Consultation', duree:'30', statut:'confirme', notes:'' }

export default function FormulaireRdv({ rdv, onSubmit, onCancel }) {
  const [form, setForm] = useState(rdv ?? empty)
  const [saving, setSaving] = useState(false)
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => { setSaving(true); await onSubmit(form); setSaving(false) }

  return (
    <div className="space-y-3">
      <FormField label="ID Patient" value={form.patient_id} onChange={set('patient_id')}
        hint="Entrez l'ID du patient (recherche par nom à venir)" />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Date" type="date" value={form.date} onChange={set('date')} required />
        <FormField label="Heure" type="time" value={form.heure} onChange={set('heure')} required />
      </div>
      <FormField label="Type d'acte" type="select" value={form.type_acte} onChange={set('type_acte')} options={TYPES_ACTES} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Durée" type="select" value={form.duree} onChange={set('duree')} options={DUREES} />
        <FormField label="Statut" type="select" value={form.statut} onChange={set('statut')} options={STATUTS} />
      </div>
      <FormField label="Notes" type="textarea" value={form.notes} onChange={set('notes')} placeholder="Observations particulières..." />
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Annuler</button>
        <button onClick={handleSubmit} disabled={saving}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Enregistrement...' : (rdv ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </div>
  )
}
