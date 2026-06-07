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

/**
 * PERMISSIONS STANDARDISÉES
 * Valeurs autorisées : 'none' | 'read' | 'write' | 'admin'
 * 
 * Sémantique:
 * - 'none': Aucun accès, module non visible
 * - 'read': Accès lecture seule, module visible
 * - 'write': Accès lecture + écriture/modification
 * - 'admin': Accès complet + configuration + audit
 */
export const PERMISSIONS = {
  // Tableau de bord
  dashboard:     { superadmin:'admin',    medecin:'admin',    secretaire:'read',     comptable:'read',      assistant:'read'    },
  
  // Rendez-vous
  rendez_vous:   { superadmin:'admin',    medecin:'write',    secretaire:'write',    comptable:'none',      assistant:'read'    },
  mes_rdv:       { superadmin:'admin',    medecin:'write',    secretaire:'none',     comptable:'none',      assistant:'none'    },
  
  // Patients
  patients:      { superadmin:'admin',    medecin:'write',    secretaire:'write',    comptable:'none',      assistant:'read'    },
  
  // Ordonnances
  ordonnances:   { superadmin:'admin',    medecin:'write',    secretaire:'none',     comptable:'none',      assistant:'none'    },
  
  // Facturation et Devis
  facturation:   { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'write',     assistant:'none'    },
  devis:         { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'write',     assistant:'none'    },
  
  // Stock
  stock:         { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'none',      assistant:'write'   },
  
  // Rapports et Rappels SMS
  rapports:      { superadmin:'admin',    medecin:'admin',    secretaire:'none',     comptable:'read',      assistant:'none'    },
  rappels:       { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'none',      assistant:'none'    },
  
  // Gestion utilisateurs
  gestion_users: { superadmin:'admin',    medecin:'none',     secretaire:'none',     comptable:'none',      assistant:'none'    },
}

// Niveau de permission (pour comparaison)
const PERMISSION_LEVELS = { none: 0, read: 1, write: 2, admin: 3 }

export function getPermission(role, module) {
  if (!role || !module) return 'none'
  return PERMISSIONS[module]?.[role] ?? 'none'
}

export function canAccess(role, module) { 
  const perm = getPermission(role, module)
  return perm !== 'none' 
}

export function canRead(role, module) { 
  const perm = getPermission(role, module)
  return perm === 'read' || perm === 'write' || perm === 'admin'
}

export function canWrite(role, module) { 
  const perm = getPermission(role, module)
  return perm === 'write' || perm === 'admin'
}

export function isAdmin(role, module) { 
  const perm = getPermission(role, module)
  return perm === 'admin'
}

/**
 * Compare deux rôles sur un module: returns > 0 si role1 a plus de permissions
 */
export function comparePermissions(role1, role2, module) {
  const p1 = PERMISSION_LEVELS[getPermission(role1, module)] ?? 0
  const p2 = PERMISSION_LEVELS[getPermission(role2, module)] ?? 0
  return p1 - p2
}

export function getNavItems(role) {
  if (!role) return []
  const all = [
    { path:'/',             label:'Tableau de bord', module:'dashboard',     icon:'home'     },
    { path:'/rendez-vous',  label:'Rendez-vous',     module:'rendez_vous',   icon:'calendar' },
    { path:'/mes-rdv',      label:'Mes RDV',         module:'mes_rdv',       icon:'calendar' },
    { path:'/patients',     label:'Patients',         module:'patients',      icon:'users'    },
    { path:'/ordonnances',  label:'Ordonnances',      module:'ordonnances',   icon:'document' },
    { path:'/facturation',  label:'Facturation',      module:'facturation',   icon:'invoice'  },
    { path:'/devis',        label:'Devis',            module:'devis',         icon:'quote'    },
    { path:'/stock',        label:'Stock',            module:'stock',         icon:'stock'    },
    { path:'/rappels',      label:'Rappels SMS',       module:'rappels',       icon:'bell'     },
    { path:'/rapports',     label:'Rapports',         module:'rapports',      icon:'chart'    },
    { path:'/utilisateurs', label:'Utilisateurs',     module:'gestion_users', icon:'admin'    },
    { path:'/admin-settings', label:'Paramètres Admin', module:'gestion_users', icon:'admin'  },
  ]
  return all.filter(item => canAccess(role, item.module))
}
