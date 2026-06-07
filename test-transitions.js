/**
 * TEST AUTOMATISÉ - Validation des Transitions de Statuts
 * 
 * Teste tous les chemins valides et invalides pour les transitions
 * Usage: node test-transitions.js
 */

import {
  RDV_STATUS, DEVIS_STATUS, FACTURE_STATUS,
  RDV_TRANSITIONS, DEVIS_TRANSITIONS, FACTURE_TRANSITIONS,
  canTransitionRdv, canTransitionDevis, canTransitionFacture,
  getNextStatuses
} from './src/lib/statuses.js'

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition, message) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  ✅ ${message}`)
  } else {
    failedTests++
    console.log(`  ❌ ${message}`)
  }
}

function testSection(name) {
  console.log(`\n${name}`)
  console.log('=' .repeat(name.length))
}

// ============================================================================
// TESTS: RDV TRANSITIONS
// ============================================================================

testSection('🧪 Tests: Rendez-vous Transitions')

// Transitions valides
assert(canTransitionRdv(RDV_STATUS.PROGRAMME, RDV_STATUS.CONFIRME).valid, 
  'programmé → confirmé (valide)')
assert(canTransitionRdv(RDV_STATUS.PROGRAMME, RDV_STATUS.ANNULE).valid, 
  'programmé → annulé (valide)')
assert(canTransitionRdv(RDV_STATUS.CONFIRME, RDV_STATUS.TERMINE).valid, 
  'confirmé → terminé (valide)')
assert(canTransitionRdv(RDV_STATUS.CONFIRME, RDV_STATUS.ANNULE).valid, 
  'confirmé → annulé (valide)')

// Transitions invalides
assert(!canTransitionRdv(RDV_STATUS.PROGRAMME, RDV_STATUS.TERMINE).valid, 
  'programmé → terminé (invalide - pas de saut)')
assert(!canTransitionRdv(RDV_STATUS.TERMINE, RDV_STATUS.CONFIRME).valid, 
  'terminé → confirmé (invalide - terminal)')
assert(!canTransitionRdv(RDV_STATUS.ANNULE, RDV_STATUS.PROGRAMME).valid, 
  'annulé → programmé (invalide - terminal)')

// Pas de changement
assert(canTransitionRdv(RDV_STATUS.PROGRAMME, RDV_STATUS.PROGRAMME).valid, 
  'programmé → programmé (valide - pas de changement)')

// getNextStatuses
const rdvNext = getNextStatuses(RDV_STATUS.PROGRAMME, 'rdv')
assert(rdvNext.includes(RDV_STATUS.CONFIRME) && rdvNext.includes(RDV_STATUS.ANNULE),
  'getNextStatuses pour programmé retourne [confirmé, annulé]')
assert(getNextStatuses(RDV_STATUS.TERMINE, 'rdv').length === 0,
  'getNextStatuses pour terminé retourne []')

// ============================================================================
// TESTS: DEVIS TRANSITIONS
// ============================================================================

testSection('🧪 Tests: Devis Transitions')

// Flux normal
assert(canTransitionDevis(DEVIS_STATUS.BROUILLON, DEVIS_STATUS.ENVOYE).valid,
  'brouillon → envoyé (flux normal)')
assert(canTransitionDevis(DEVIS_STATUS.ENVOYE, DEVIS_STATUS.ACCEPTE).valid,
  'envoyé → accepté (flux normal)')
assert(canTransitionDevis(DEVIS_STATUS.ACCEPTE, DEVIS_STATUS.FACTURISE).valid,
  'accepté → facturisé (flux normal)')

// Cas de rejet et relance
assert(canTransitionDevis(DEVIS_STATUS.ENVOYE, DEVIS_STATUS.REJETE).valid,
  'envoyé → rejeté (flux rejet)')
assert(canTransitionDevis(DEVIS_STATUS.REJETE, DEVIS_STATUS.BROUILLON).valid,
  'rejeté → brouillon (relance après rejet)')
assert(canTransitionDevis(DEVIS_STATUS.BROUILLON, DEVIS_STATUS.ENVOYE).valid,
  'brouillon → envoyé (renvoie après modification)')

// Annulation à tout moment
assert(canTransitionDevis(DEVIS_STATUS.BROUILLON, DEVIS_STATUS.ANNULE).valid,
  'brouillon → annulé')
assert(canTransitionDevis(DEVIS_STATUS.ENVOYE, DEVIS_STATUS.ANNULE).valid,
  'envoyé → annulé')
assert(canTransitionDevis(DEVIS_STATUS.ACCEPTE, DEVIS_STATUS.ANNULE).valid,
  'accepté → annulé')
assert(canTransitionDevis(DEVIS_STATUS.FACTURISE, DEVIS_STATUS.ANNULE).valid,
  'facturisé → annulé (rare)')

// Transitions invalides
assert(!canTransitionDevis(DEVIS_STATUS.BROUILLON, DEVIS_STATUS.ACCEPTE).valid,
  'brouillon → accepté (invalide - saut obligatoire)')
assert(!canTransitionDevis(DEVIS_STATUS.REJETE, DEVIS_STATUS.ACCEPTE).valid,
  'rejeté → accepté (invalide - faut relancer)')
assert(!canTransitionDevis(DEVIS_STATUS.FACTURISE, DEVIS_STATUS.ACCEPTE).valid,
  'facturisé → accepté (invalide - terminal)')
assert(!canTransitionDevis(DEVIS_STATUS.ANNULE, DEVIS_STATUS.BROUILLON).valid,
  'annulé → brouillon (invalide - terminal)')

// getNextStatuses
const devisNextBrouillon = getNextStatuses(DEVIS_STATUS.BROUILLON, 'devis')
assert(
  devisNextBrouillon.length === 2 &&
  devisNextBrouillon.includes(DEVIS_STATUS.ENVOYE) &&
  devisNextBrouillon.includes(DEVIS_STATUS.ANNULE),
  'getNextStatuses pour brouillon retourne [envoyé, annulé]'
)

const devisNextEnvoye = getNextStatuses(DEVIS_STATUS.ENVOYE, 'devis')
assert(
  devisNextEnvoye.length === 3 &&
  devisNextEnvoye.includes(DEVIS_STATUS.ACCEPTE) &&
  devisNextEnvoye.includes(DEVIS_STATUS.REJETE) &&
  devisNextEnvoye.includes(DEVIS_STATUS.ANNULE),
  'getNextStatuses pour envoyé retourne [accepté, rejeté, annulé]'
)

assert(getNextStatuses(DEVIS_STATUS.ANNULE, 'devis').length === 0,
  'getNextStatuses pour annulé retourne []')

// ============================================================================
// TESTS: FACTURE TRANSITIONS
// ============================================================================

testSection('🧪 Tests: Facture Transitions')

// Flux normal
assert(canTransitionFacture(FACTURE_STATUS.ATTENTE, FACTURE_STATUS.PAYE).valid,
  'attente → payée (flux normal)')
assert(canTransitionFacture(FACTURE_STATUS.ATTENTE, FACTURE_STATUS.ANNULE).valid,
  'attente → annulée (annulation avant paiement)')

// Remboursement/avoir
assert(canTransitionFacture(FACTURE_STATUS.PAYE, FACTURE_STATUS.ANNULE).valid,
  'payée → annulée (remboursement/avoir)')

// Transitions invalides
assert(!canTransitionFacture(FACTURE_STATUS.PAYE, FACTURE_STATUS.ATTENTE).valid,
  'payée → attente (invalide - pas de retour)')
assert(!canTransitionFacture(FACTURE_STATUS.ANNULE, FACTURE_STATUS.ATTENTE).valid,
  'annulée → attente (invalide - terminal)')

// getNextStatuses
const factureNextAttente = getNextStatuses(FACTURE_STATUS.ATTENTE, 'facture')
assert(
  factureNextAttente.length === 2 &&
  factureNextAttente.includes(FACTURE_STATUS.PAYE) &&
  factureNextAttente.includes(FACTURE_STATUS.ANNULE),
  'getNextStatuses pour attente retourne [payée, annulée]'
)

assert(getNextStatuses(FACTURE_STATUS.ANNULE, 'facture').length === 0,
  'getNextStatuses pour annulée retourne []')

// ============================================================================
// TESTS: MESSAGES D'ERREUR
// ============================================================================

testSection('🧪 Tests: Messages d\'Erreur')

const err1 = canTransitionDevis(DEVIS_STATUS.BROUILLON, DEVIS_STATUS.ACCEPTE)
assert(!err1.valid && err1.error.includes('accepte'), 
  'Message d\'erreur inclut le statut cible invalide')

const err2 = canTransitionDevis(DEVIS_STATUS.ANNULE, DEVIS_STATUS.BROUILLON)
assert(!err2.valid && err2.error && err2.error.length > 0,
  'Message d\'erreur fourni pour statut terminal')

// ============================================================================
// RÉSULTATS
// ============================================================================

console.log('\n' + '='.repeat(60))
console.log('📊 RÉSULTATS DES TESTS')
console.log('='.repeat(60))
console.log(`Total    : ${totalTests}`)
console.log(`Passés   : ${passedTests} ✅`)
console.log(`Échoués  : ${failedTests} ❌`)
console.log(`Taux     : ${Math.round((passedTests / totalTests) * 100)}%`)

if (failedTests === 0) {
  console.log('\n✅ TOUS LES TESTS SONT PASSÉS!')
  process.exit(0)
} else {
  console.log(`\n❌ ${failedTests} TEST(S) ÉCHOUÉ(S)`)
  process.exit(1)
}
