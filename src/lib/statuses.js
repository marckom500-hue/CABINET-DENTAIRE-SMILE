export const RDV_STATUS = {
  PROGRAMME: 'programmé',
  CONFIRME: 'confirmé',
  TERMINE: 'terminé',
  ANNULE: 'annulé',
}

// Statuts Devis (cycle de vie)
// Ces valeurs doivent rester alignées avec la contrainte SQL devis_statut_check.
export const DEVIS_STATUS = {
  EN_ATTENTE: 'en_attente',
  ACCEPTE: 'accepté',
  CONVERTI_FACTURE: 'converti_facture',
  REJETE: 'rejeté',
  ANNULE: 'annulé',
  EXPIRE: 'expiré',

  // Alias conservés pour les anciens appels UI.
  BROUILLON: 'en_attente',
  ENVOYE: 'en_attente',
  FACTURISE: 'converti_facture',
}

export const FACTURE_STATUS = {
  ATTENTE: 'attente',
  PAYE: 'paye',
  ANNULE: 'annule',
}

export const RDV_TRANSITIONS = {
  [RDV_STATUS.PROGRAMME]: [RDV_STATUS.CONFIRME, RDV_STATUS.ANNULE],
  [RDV_STATUS.CONFIRME]: [RDV_STATUS.TERMINE, RDV_STATUS.ANNULE],
  [RDV_STATUS.TERMINE]: [],
  [RDV_STATUS.ANNULE]: [],
}

export const DEVIS_TRANSITIONS = {
  [DEVIS_STATUS.EN_ATTENTE]: [
    DEVIS_STATUS.ACCEPTE,
    DEVIS_STATUS.REJETE,
    DEVIS_STATUS.ANNULE,
    DEVIS_STATUS.EXPIRE,
  ],
  [DEVIS_STATUS.ACCEPTE]: [
    DEVIS_STATUS.CONVERTI_FACTURE,
    DEVIS_STATUS.REJETE,
    DEVIS_STATUS.ANNULE,
  ],
  [DEVIS_STATUS.CONVERTI_FACTURE]: [],
  [DEVIS_STATUS.REJETE]: [DEVIS_STATUS.EN_ATTENTE],
  [DEVIS_STATUS.ANNULE]: [DEVIS_STATUS.EN_ATTENTE],
  [DEVIS_STATUS.EXPIRE]: [DEVIS_STATUS.EN_ATTENTE],
}

export const FACTURE_TRANSITIONS = {
  [FACTURE_STATUS.ATTENTE]: [FACTURE_STATUS.PAYE, FACTURE_STATUS.ANNULE],
  [FACTURE_STATUS.PAYE]: [FACTURE_STATUS.ANNULE],
  [FACTURE_STATUS.ANNULE]: [],
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function normalizeRdvStatus(statut) {
  const value = normalizeText(statut)
  if (value === 'programme') return RDV_STATUS.PROGRAMME
  if (value === 'confirme') return RDV_STATUS.CONFIRME
  if (value === 'termine') return RDV_STATUS.TERMINE
  if (value === 'annule') return RDV_STATUS.ANNULE
  return RDV_STATUS.PROGRAMME
}

export function normalizeDevisStatus(statut) {
  const raw = String(statut || '')
  const value = normalizeText(raw)

  if (raw.includes('brouillon') || value === 'brouillon' || value === 'en_attente') return DEVIS_STATUS.EN_ATTENTE
  if (raw.includes('envoy') || value === 'envoye') return DEVIS_STATUS.EN_ATTENTE
  if (raw.includes('accept') || value === 'accepte') return DEVIS_STATUS.ACCEPTE
  if (raw.includes('converti') || value === 'converti_facture') return DEVIS_STATUS.CONVERTI_FACTURE
  if (raw.includes('facturis') || value === 'facturise') return DEVIS_STATUS.CONVERTI_FACTURE
  if (raw.includes('rejet') || value === 'rejete') return DEVIS_STATUS.REJETE
  if (raw.includes('annul') || value === 'annule') return DEVIS_STATUS.ANNULE
  if (raw.includes('expir') || value === 'expire') return DEVIS_STATUS.EXPIRE

  return DEVIS_STATUS.EN_ATTENTE
}

export function normalizeFactureStatus(statut) {
  const value = normalizeText(statut)
  if (value === 'paye') return FACTURE_STATUS.PAYE
  if (value === 'annule') return FACTURE_STATUS.ANNULE
  return FACTURE_STATUS.ATTENTE
}

function validateTransition(currentStatus, newStatus, transitions) {
  if (currentStatus === newStatus) {
    return { valid: true }
  }

  const allowedStatuses = transitions[currentStatus]

  if (!allowedStatuses) {
    return { valid: false, error: `Statut courant '${currentStatus}' est terminal (pas de transition possible)` }
  }

  if (!allowedStatuses.includes(newStatus)) {
    return {
      valid: false,
      error: `Transition de '${currentStatus}' vers '${newStatus}' n'est pas autorisée. Statuts valides: ${allowedStatuses.join(', ')}`,
    }
  }

  return { valid: true }
}

export function canTransitionRdv(currentStatus, newStatus) {
  const normalized = normalizeRdvStatus(currentStatus)
  const normalizedNew = normalizeRdvStatus(newStatus)
  return validateTransition(normalized, normalizedNew, RDV_TRANSITIONS)
}

export function canTransitionDevis(currentStatus, newStatus) {
  const normalized = normalizeDevisStatus(currentStatus)
  const normalizedNew = normalizeDevisStatus(newStatus)
  return validateTransition(normalized, normalizedNew, DEVIS_TRANSITIONS)
}

export function canTransitionFacture(currentStatus, newStatus) {
  const normalized = normalizeFactureStatus(currentStatus)
  const normalizedNew = normalizeFactureStatus(newStatus)
  return validateTransition(normalized, normalizedNew, FACTURE_TRANSITIONS)
}

export function getNextStatuses(currentStatus, statusType = 'devis') {
  const transitions = {
    rdv: RDV_TRANSITIONS,
    devis: DEVIS_TRANSITIONS,
    facture: FACTURE_TRANSITIONS,
  }

  let normalized = currentStatus
  if (statusType === 'rdv') normalized = normalizeRdvStatus(currentStatus)
  else if (statusType === 'devis') normalized = normalizeDevisStatus(currentStatus)
  else if (statusType === 'facture') normalized = normalizeFactureStatus(currentStatus)

  if (statusType === 'devis' && !transitions.devis?.[normalized]) {
    normalized = DEVIS_STATUS.EN_ATTENTE
  }

  return transitions[statusType]?.[normalized] ?? []
}

export const RDV_STATUS_META = {
  [RDV_STATUS.PROGRAMME]: { label: 'Programmé', cls: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
  [RDV_STATUS.CONFIRME]: { label: 'Confirmé', cls: 'bg-amber-100 text-amber-700', color: '#f59e0b' },
  [RDV_STATUS.TERMINE]: { label: 'Terminé', cls: 'bg-emerald-100 text-emerald-700', color: '#10b981' },
  [RDV_STATUS.ANNULE]: { label: 'Annulé', cls: 'bg-gray-100 text-gray-500', color: '#94a3b8' },
}

export const DEVIS_STATUS_META = {
  [DEVIS_STATUS.EN_ATTENTE]: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  [DEVIS_STATUS.ACCEPTE]: { label: 'Accepté', cls: 'bg-green-100 text-green-700' },
  [DEVIS_STATUS.CONVERTI_FACTURE]: { label: 'Converti en facture', cls: 'bg-teal-100 text-teal-700' },
  [DEVIS_STATUS.REJETE]: { label: 'Rejeté', cls: 'bg-red-100 text-red-700' },
  [DEVIS_STATUS.ANNULE]: { label: 'Annulé', cls: 'bg-gray-200 text-gray-500' },
  [DEVIS_STATUS.EXPIRE]: { label: 'Expiré', cls: 'bg-slate-100 text-slate-600' },
}

export const FACTURE_STATUS_META = {
  [FACTURE_STATUS.ATTENTE]: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  [FACTURE_STATUS.PAYE]: { label: 'Payee', cls: 'bg-teal-100 text-teal-700' },
  [FACTURE_STATUS.ANNULE]: { label: 'Annulee', cls: 'bg-red-100 text-red-700' },
}
