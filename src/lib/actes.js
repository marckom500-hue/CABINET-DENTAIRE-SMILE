export const ACTES_DENTAIRES = [
  'Consultation',
  'Detartrage',
  'Extraction',
  'Implant',
  'Radiographie',
  'Orthodontie',
  'Blanchiment',
  'Soin carie',
  'Devitalisation',
  'Prothese dentaire',
  'Controle',
]

export const ACTES_OPTIONS = ACTES_DENTAIRES.map(acte => ({ value: acte, label: acte }))
