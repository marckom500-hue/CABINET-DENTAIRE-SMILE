// ============================================================
// DateNaissancePicker.jsx — version corrigée
// State interne pour que la sélection s'affiche immédiatement
// ============================================================
import { useState, useEffect } from 'react'

const MOIS = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
]

const CURRENT_YEAR = new Date().getFullYear()

function getDaysInMonth(month, year) {
  if (!month) return 31
  const y = year ? parseInt(year) : 2000
  return new Date(y, parseInt(month), 0).getDate()
}

function parseISO(iso) {
  if (!iso || iso.length < 10) return { jour: '', mois: '', annee: '' }
  const [annee, mois, jour] = iso.split('-')
  return { jour: jour ?? '', mois: mois ?? '', annee: annee ?? '' }
}

function toISO(jour, mois, annee) {
  if (!jour || !mois || !annee) return ''
  return `${annee}-${mois}-${String(jour).padStart(2, '0')}`
}

export default function DateNaissancePicker({ value = '', onChange, touched = false }) {
  const parsed = parseISO(value)
  // State interne : chaque select est contrôlé localement
  const [jour,  setJour]  = useState(parsed.jour)
  const [mois,  setMois]  = useState(parsed.mois)
  const [annee, setAnnee] = useState(parsed.annee)

  // Reset quand le parent vide le formulaire
  useEffect(() => {
    if (!value) { setJour(''); setMois(''); setAnnee('') }
  }, [value])

  const daysInMonth = getDaysInMonth(mois, annee)

  // Valeurs des options : '01'…'31' — padStart pour correspondre à parseISO
  const jours  = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))
  const annees = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => String(CURRENT_YEAR - i))

  const handleJour = (val) => { setJour(val); onChange(toISO(val, mois, annee)) }

  const handleMois = (val) => {
    setMois(val)
    let j = jour
    if (j) {
      const max = getDaysInMonth(val, annee)
      if (parseInt(j) > max) { j = String(max).padStart(2, '0'); setJour(j) }
    }
    onChange(toISO(j, val, annee))
  }

  const handleAnnee = (val) => {
    setAnnee(val)
    let j = jour
    if (j && mois) {
      const max = getDaysInMonth(mois, val)
      if (parseInt(j) > max) { j = String(max).padStart(2, '0'); setJour(j) }
    }
    onChange(toISO(j, mois, val))
  }

  const today      = new Date().toISOString().split('T')[0]
  const iso        = toISO(jour, mois, annee)
  const isComplete = Boolean(jour && mois && annee)
  const isFuture   = isComplete && iso > today

  const base = 'w-full px-3 py-2 text-sm border rounded-lg bg-white appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-8'

  const border = (hasVal) => {
    if (!touched || !hasVal || !isComplete) return 'border-gray-300'
    return isFuture ? 'border-red-400 bg-red-50' : 'border-emerald-400 bg-emerald-50'
  }

  const msgColor = !touched || !isComplete ? 'text-gray-400' : isFuture ? 'text-red-500' : 'text-emerald-600'
  const msgText  = !touched || !isComplete
    ? "Sélectionnez le jour, le mois et l'année"
    : isFuture ? 'La date ne peut pas être dans le futur' : 'Date valide'

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">Date de naissance</label>

      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <select value={jour} onChange={(e) => handleJour(e.target.value)} className={`${base} ${border(!!jour)}`}>
            <option value="">Jour</option>
            {jours.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
          <Chevron />
        </div>

        <div className="relative">
          <select value={mois} onChange={(e) => handleMois(e.target.value)} className={`${base} ${border(!!mois)}`}>
            <option value="">Mois</option>
            {MOIS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <Chevron />
        </div>

        <div className="relative">
          <select value={annee} onChange={(e) => handleAnnee(e.target.value)} className={`${base} ${border(!!annee)}`}>
            <option value="">Année</option>
            {annees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <Chevron />
        </div>
      </div>

      <p className={`text-xs mt-1 flex items-center gap-1 ${msgColor}`}>
        {!touched || !isComplete ? <InfoIcon /> : isFuture ? <XIcon /> : <CheckIcon />}
        {msgText}
      </p>
    </div>
  )
}

const Chevron = () => (
  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
)
const CheckIcon = () => (
  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)
const XIcon = () => (
  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const InfoIcon = () => (
  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
  </svg>
)