export const RDV_STATUS = {
  CONFIRME: 'confirme',
  ATTENTE: 'attente',
  URGENT: 'urgent',
  RECU: 'recu',
  ANNULE: 'annule',
}

export const DEVIS_STATUS = {
  BROUILLON: 'brouillon',
  ENVOYE: 'envoye',
  ACCEPTE: 'accepte',
  REJETE: 'rejete',
  FACTURISE: 'facturise',
  ANNULE: 'annule',
}

export const FACTURE_STATUS = {
  ATTENTE: 'attente',
  PAYE: 'paye',
  ANNULE: 'annule',
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function normalizeRdvStatus(statut) {
  const value = normalizeText(statut)
  if (value === 'recu') return RDV_STATUS.RECU
  if (value === 'annule') return RDV_STATUS.ANNULE
  if (value === 'urgent') return RDV_STATUS.URGENT
  if (value === 'attente') return RDV_STATUS.ATTENTE
  return RDV_STATUS.CONFIRME
}

export function normalizeDevisStatus(statut) {
  const raw = String(statut || '').toLowerCase()
  const value = normalizeText(raw)
  if (raw.includes('envoy') || value === 'envoye') return DEVIS_STATUS.ENVOYE
  if (raw.includes('accept') || value === 'accepte') return DEVIS_STATUS.ACCEPTE
  if (raw.includes('rejet') || value === 'rejete') return DEVIS_STATUS.REJETE
  if (raw.includes('facturis') || value === 'facturise') return DEVIS_STATUS.FACTURISE
  if (raw.includes('annul') || value === 'annule') return DEVIS_STATUS.ANNULE
  return DEVIS_STATUS.BROUILLON
}

export function normalizeFactureStatus(statut) {
  const value = normalizeText(statut)
  if (value === 'paye') return FACTURE_STATUS.PAYE
  if (value === 'annule') return FACTURE_STATUS.ANNULE
  return FACTURE_STATUS.ATTENTE
}

export const RDV_STATUS_META = {
  [RDV_STATUS.CONFIRME]: { label: 'Confirme', cls: 'bg-teal-100 text-teal-700', color: '#0d9488' },
  [RDV_STATUS.ATTENTE]: { label: 'En attente', cls: 'bg-amber-100 text-amber-700', color: '#f59e0b' },
  [RDV_STATUS.URGENT]: { label: 'Urgent', cls: 'bg-red-100 text-red-700', color: '#f43f5e' },
  [RDV_STATUS.RECU]: { label: 'Recu au cabinet', cls: 'bg-emerald-100 text-emerald-700', color: '#10b981' },
  [RDV_STATUS.ANNULE]: { label: 'Annule', cls: 'bg-gray-100 text-gray-500', color: '#94a3b8' },
}

export const DEVIS_STATUS_META = {
  [DEVIS_STATUS.BROUILLON]: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-700' },
  [DEVIS_STATUS.ENVOYE]: { label: 'Envoye', cls: 'bg-blue-100 text-blue-700' },
  [DEVIS_STATUS.ACCEPTE]: { label: 'Accepte', cls: 'bg-green-100 text-green-700' },
  [DEVIS_STATUS.REJETE]: { label: 'Rejete', cls: 'bg-red-100 text-red-700' },
  [DEVIS_STATUS.FACTURISE]: { label: 'Facturise', cls: 'bg-teal-100 text-teal-700' },
  [DEVIS_STATUS.ANNULE]: { label: 'Annule', cls: 'bg-gray-200 text-gray-500' },
}

export const FACTURE_STATUS_META = {
  [FACTURE_STATUS.ATTENTE]: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  [FACTURE_STATUS.PAYE]: { label: 'Payee', cls: 'bg-teal-100 text-teal-700' },
  [FACTURE_STATUS.ANNULE]: { label: 'Annulee', cls: 'bg-red-100 text-red-700' },
}
