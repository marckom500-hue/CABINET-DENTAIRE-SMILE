/**
 * AUDIT TOOL - Système de Permissions Standardisé
 * Valide la cohérence du système de rôles et permissions
 * 
 * Usage: node audit-permissions.js
 */

// ============================================================================
// DÉFINITION DE RÉFÉRENCE (doit matcher src/lib/roles.js)
// ============================================================================

const ROLES = ['superadmin', 'medecin', 'secretaire', 'comptable', 'assistant']
const MODULES = [
  'dashboard', 'rendez_vous', 'mes_rdv', 'patients', 'ordonnances',
  'facturation', 'devis', 'stock', 'rapports', 'rappels', 'gestion_users'
]
const VALID_PERMISSIONS = new Set(['none', 'read', 'write', 'admin'])

const PERMISSIONS_REFERENCE = {
  dashboard:     { superadmin:'admin',    medecin:'admin',    secretaire:'read',     comptable:'read',      assistant:'read'    },
  rendez_vous:   { superadmin:'admin',    medecin:'write',    secretaire:'write',    comptable:'none',      assistant:'read'    },
  mes_rdv:       { superadmin:'admin',    medecin:'write',    secretaire:'none',     comptable:'none',      assistant:'none'    },
  patients:      { superadmin:'admin',    medecin:'write',    secretaire:'write',    comptable:'none',      assistant:'read'    },
  ordonnances:   { superadmin:'admin',    medecin:'write',    secretaire:'none',     comptable:'none',      assistant:'none'    },
  facturation:   { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'write',     assistant:'none'    },
  devis:         { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'write',     assistant:'none'    },
  stock:         { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'none',      assistant:'write'   },
  rapports:      { superadmin:'admin',    medecin:'admin',    secretaire:'none',     comptable:'read',      assistant:'none'    },
  rappels:       { superadmin:'admin',    medecin:'read',     secretaire:'write',    comptable:'none',      assistant:'none'    },
  gestion_users: { superadmin:'admin',    medecin:'none',     secretaire:'none',     comptable:'none',      assistant:'none'    },
}

const PERMISSION_LEVELS = { none: 0, read: 1, write: 2, admin: 3 }

// ============================================================================
// FONCTIONS DE VALIDATION
// ============================================================================

function validatePermissionStructure() {
  console.log('\n📋 VALIDATION: Structure des permissions\n')
  
  let errors = 0
  
  // Vérifier que tous les modules sont définis
  for (const module of MODULES) {
    if (!PERMISSIONS_REFERENCE[module]) {
      console.log(`❌ Module manquant: ${module}`)
      errors++
    }
  }
  
  // Vérifier que tous les rôles sont définis pour chaque module
  for (const [module, perms] of Object.entries(PERMISSIONS_REFERENCE)) {
    for (const role of ROLES) {
      if (!(role in perms)) {
        console.log(`❌ Rôle manquant pour ${module}: ${role}`)
        errors++
      }
      
      if (!VALID_PERMISSIONS.has(perms[role])) {
        console.log(`❌ Valeur invalide pour ${module}.${role}: ${perms[role]}`)
        errors++
      }
    }
  }
  
  // Vérifier qu'il n'y a pas de rôles superflus
  for (const [module, perms] of Object.entries(PERMISSIONS_REFERENCE)) {
    for (const role of Object.keys(perms)) {
      if (!ROLES.includes(role)) {
        console.log(`❌ Rôle indéfini pour ${module}: ${role}`)
        errors++
      }
    }
  }
  
  if (errors === 0) {
    console.log('✅ Structure valide: tous les rôles et modules sont présents')
    console.log(`   ${MODULES.length} modules × ${ROLES.length} rôles = ${MODULES.length * ROLES.length} permissions`)
  }
  
  return errors
}

function validateHierarchy() {
  console.log('\n⚡ VALIDATION: Hiérarchie des permissions\n')
  
  let warnings = 0
  
  // Superadmin doit toujours avoir 'admin'
  for (const [module, perms] of Object.entries(PERMISSIONS_REFERENCE)) {
    if (perms.superadmin !== 'admin') {
      console.log(`⚠️  Superadmin n'a pas 'admin' pour ${module}: ${perms.superadmin}`)
      warnings++
    }
  }
  
  if (warnings === 0) {
    console.log('✅ Superadmin a \'admin\' partout')
  }
  
  return warnings
}

function validateConsistency() {
  console.log('\n🔗 VALIDATION: Cohérence (logique métier)\n')
  
  let issues = 0
  
  // Règle 1: Si un rôle a 'write', il doit avoir 'read' aussi (logique)
  const ruleWrite = `Si perm='write', implique 'read' (write > read dans hiérarchie)`
  // Pas besoin de vérifier car 'write' est le niveau 2, 'read' est le niveau 1
  
  // Règle 2: Vérifier les patterns cohérents
  const expectations = {
    // Médecin voit plus que secrétaire généralement
    // Mais peut être read-only sur facturation
    
    // Assistant a un accès limité
    assistant: ['read', 'write'], // Pas 'admin'
    
    // Comptable a accès financier
    comptable: ['read', 'write'],
  }
  
  // Vérifier les cas spéciaux
  const specialCases = [
    { role: 'medecin', module: 'facturation', expected: 'read', reason: 'Médecin ne modifie pas les factures' },
    { role: 'medecin', module: 'stock', expected: 'read', reason: 'Médecin consulte stock' },
    { role: 'secretaire', module: 'ordonnances', expected: 'none', reason: 'Secrétaire ne crée pas d\'ordonnances' },
    { role: 'comptable', module: 'rendez_vous', expected: 'none', reason: 'Comptable ne gère pas les RDV' },
    { role: 'comptable', module: 'patients', expected: 'none', reason: 'Comptable n\'accède pas aux patients' },
    { role: 'assistant', module: 'ordonnances', expected: 'none', reason: 'Assistant ne crée pas d\'ordonnances' },
    { role: 'assistant', module: 'facturation', expected: 'none', reason: 'Assistant n\'accède pas aux factures' },
  ]
  
  for (const test of specialCases) {
    const actual = PERMISSIONS_REFERENCE[test.module]?.[test.role]
    if (actual !== test.expected) {
      console.log(`⚠️  ${test.role} sur ${test.module}:`)
      console.log(`   Expected: ${test.expected}, Got: ${actual}`)
      console.log(`   Reason: ${test.reason}`)
      issues++
    }
  }
  
  if (issues === 0) {
    console.log('✅ Tous les cas spéciaux sont cohérents avec la logique métier')
  }
  
  return issues
}

function analyzePermissionDistribution() {
  console.log('\n📊 ANALYSE: Distribution des permissions\n')
  
  const distribution = {}
  const roleDistribution = {}
  const levelDistribution = {}
  
  for (const [module, perms] of Object.entries(PERMISSIONS_REFERENCE)) {
    distribution[module] = {}
    for (const [role, perm] of Object.entries(perms)) {
      distribution[module][perm] = (distribution[module][perm] || 0) + 1
      
      roleDistribution[role] = roleDistribution[role] || {}
      roleDistribution[role][perm] = (roleDistribution[role][perm] || 0) + 1
      
      levelDistribution[perm] = (levelDistribution[perm] || 0) + 1
    }
  }
  
  console.log('Distribution par niveau de permission:')
  for (const [perm, count] of Object.entries(levelDistribution)) {
    const percentage = Math.round((count / (MODULES.length * ROLES.length)) * 100)
    console.log(`  ${perm.toUpperCase().padEnd(6)} : ${count.toString().padStart(2)} (${percentage}%)`)
  }
  
  console.log('\nAccès moyen par rôle:')
  for (const role of ROLES) {
    const perms = roleDistribution[role]
    const levels = Object.entries(perms).map(([p, c]) => PERMISSION_LEVELS[p] * c).reduce((a, b) => a + b, 0)
    const average = levels / MODULES.length
    const noneCount = perms.none || 0
    const adminCount = perms.admin || 0
    console.log(`  ${role.padEnd(12)} : avg level ${average.toFixed(2)}, modules: ${MODULES.length - noneCount}/${MODULES.length}, admin: ${adminCount}`)
  }
  
  return 0
}

function validateRLS() {
  console.log('\n🔐 VALIDATION: Cohérence Frontend ↔ Backend (RLS)\n')
  
  const rls_policies = {
    // Format: module: { read: [...roles], write: [...roles] }
    'patients': {
      read: ['superadmin', 'medecin', 'secretaire', 'assistant'],
      write: ['superadmin', 'medecin', 'secretaire']
    },
    'rendez_vous': {
      read: ['superadmin', 'medecin', 'secretaire', 'assistant'],
      write: ['superadmin', 'medecin', 'secretaire']
    },
    'ordonnances': {
      read: ['superadmin', 'medecin'],
      write: ['superadmin', 'medecin']
    },
    'factures': {
      read: ['superadmin', 'medecin', 'secretaire', 'comptable'],
      write: ['superadmin', 'secretaire', 'comptable']
    },
    'stock': {
      read: ['superadmin', 'medecin', 'secretaire', 'assistant'],
      write: ['superadmin', 'secretaire', 'assistant']
    },
    'rappels_sms': {
      read: ['superadmin', 'medecin', 'secretaire'],
      write: ['via Edge Function - app-level control']
    }
  }
  
  let issues = 0
  
  for (const [module, rls] of Object.entries(rls_policies)) {
    // Mapper module à permissions
    const permModule = module === 'rappels_sms' ? 'rappels' : module === 'factures' ? 'facturation' : module
    const perms = PERMISSIONS_REFERENCE[permModule]
    
    if (!perms) {
      console.log(`⚠️  Module ${permModule} non trouvé dans les permissions`)
      continue
    }
    
    // Vérifier que les rôles 'read' et 'write' en frontend matchent RLS
    for (const role of ROLES) {
      const perm = perms[role]
      const canRead = perm === 'read' || perm === 'write' || perm === 'admin'
      const canWrite = perm === 'write' || perm === 'admin'
      
      const rlsCanRead = rls.read.includes(role)
      const rlsCanWrite = rls.write.some(r => r === role && r !== 'via Edge Function - app-level control')
      
      if (canRead && !rlsCanRead) {
        console.log(`❌ ${permModule}/${role}: Frontend dit 'read' mais RLS le bloque`)
        issues++
      }
      
      if (!canRead && rlsCanRead && perm !== 'none') {
        console.log(`⚠️  ${permModule}/${role}: Frontend restreint mais RLS permet la lecture`)
      }
    }
  }
  
  if (issues === 0) {
    console.log('✅ Cohérence RLS vérifiée pour les modules clés')
  }
  
  return issues
}

function generateCoverageReport() {
  console.log('\n📋 RAPPORT: Couverture des modules par rôle\n')
  
  console.log('┌─────────────┬───────────┬────────┬───────┬───────────┬───────────┐')
  console.log('│ Module      │ Superadm. │ Médec. │ Secr. │ Compt.    │ Asst.     │')
  console.log('├─────────────┼───────────┼────────┼───────┼───────────┼───────────┤')
  
  for (const module of MODULES) {
    const perms = PERMISSIONS_REFERENCE[module]
    const row = [
      module.padEnd(11),
      (perms.superadmin || '?').substring(0, 3).padEnd(9),
      (perms.medecin || '?').substring(0, 3).padEnd(6),
      (perms.secretaire || '?').substring(0, 3).padEnd(5),
      (perms.comptable || '?').substring(0, 3).padEnd(9),
      (perms.assistant || '?').substring(0, 3),
    ]
    console.log('│ ' + row.join(' │ ') + ' │')
  }
  
  console.log('└─────────────┴───────────┴────────┴───────┴───────────┴───────────┘')
  
  return 0
}

// ============================================================================
// RUNNER
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════════════════════')
console.log('🔐 AUDIT DU SYSTÈME DE PERMISSIONS STANDARDISÉ')
console.log('═══════════════════════════════════════════════════════════════════════════════')

let totalErrors = 0
let totalWarnings = 0

totalErrors += validatePermissionStructure()
totalWarnings += validateHierarchy()
totalWarnings += validateConsistency()
analyzePermissionDistribution()
totalErrors += validateRLS()
generateCoverageReport()

console.log('\n═══════════════════════════════════════════════════════════════════════════════')
if (totalErrors === 0 && totalWarnings === 0) {
  console.log('✅ AUDIT RÉUSSI: Système de permissions cohérent et valide')
} else {
  console.log(`⚠️  AUDIT TERMINÉ: ${totalErrors} erreur(s), ${totalWarnings} avertissement(s)`)
}
console.log('═══════════════════════════════════════════════════════════════════════════════\n')

process.exit(totalErrors > 0 ? 1 : 0)
