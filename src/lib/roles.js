export const ROLES = {
  SUPERADMIN: 'superadmin', MEDECIN: 'medecin',
  SECRETAIRE: 'secretaire', COMPTABLE: 'comptable', ASSISTANT: 'assistant',
}

export const ROLES_LABELS = {
  superadmin: 'Superadmin',   medecin:    'Médecin',
  secretaire: 'Secrétaire',   comptable:  'Comptable',
  assistant:  'Assistant dentaire',
}

export const ROLES_COLORS = {
  superadmin: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  medecin:    { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  secretaire: { bg: 'bg-teal-100',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
  comptable:  { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500'  },
  assistant:  { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-500'   },
}

export const PERMISSIONS = {
  dashboard:     { superadmin:'complet',   medecin:'complet',  secretaire:'partiel',  comptable:'partiel',   assistant:'limite'  },
  rendez_vous:   { superadmin:'crud',      medecin:'crud',     secretaire:'crud',     comptable:false,       assistant:'lecture' },
  patients:      { superadmin:'crud',      medecin:'crud',     secretaire:'crud',     comptable:false,       assistant:'lecture' },
  ordonnances:   { superadmin:'crud',      medecin:'crud',     secretaire:false,      comptable:false,       assistant:false     },
  facturation:   { superadmin:'crud',      medecin:'lecture',  secretaire:'crud',     comptable:'crud',      assistant:false     },
  stock:         { superadmin:'crud',      medecin:'lecture',  secretaire:'crud',     comptable:false,       assistant:'crud'    },
  rapports:      { superadmin:'complet',   medecin:'complet',  secretaire:false,      comptable:'financier', assistant:false     },
  rappels:       { superadmin:'config',    medecin:'lecture',  secretaire:'declenche',comptable:false,       assistant:false     },
  gestion_users: { superadmin:'crud',      medecin:false,      secretaire:false,      comptable:false,       assistant:false     },
}

export function getPermission(role, module) {
  if (!role || !module) return false
  return PERMISSIONS[module]?.[role] ?? false
}
export function canAccess(role, module)  { return getPermission(role, module) !== false }
export function canWrite(role, module)   {
  const p = getPermission(role, module)
  return p === 'crud' || p === 'complet' || p === 'config' || p === 'declenche'
}

export function getNavItems(role) {
  if (!role) return []
  const all = [
    { path:'/',             label:'Tableau de bord', module:'dashboard',     icon:'home'     },
    { path:'/rendez-vous',  label:'Rendez-vous',     module:'rendez_vous',   icon:'calendar' },
    { path:'/patients',     label:'Patients',         module:'patients',      icon:'users'    },
    { path:'/ordonnances',  label:'Ordonnances',      module:'ordonnances',   icon:'document' },
    { path:'/facturation',  label:'Facturation',      module:'facturation',   icon:'invoice'  },
    { path:'/stock',        label:'Stock',            module:'stock',         icon:'stock'    },
    { path:'/rappels',      label:'Rappels SMS',       module:'rappels',       icon:'bell'     },
    { path:'/rapports',     label:'Rapports',         module:'rapports',      icon:'chart'    },
    { path:'/utilisateurs', label:'Utilisateurs',     module:'gestion_users', icon:'admin'    },
  ]
  return all.filter(item => canAccess(role, item.module))
}
