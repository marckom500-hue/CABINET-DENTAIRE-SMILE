# 📋 Cycle de Vie des Statuts - Transitions Validées

## 🎯 Vue d'ensemble

Les transitions de statuts sont maintenant **validées et documentées** pour garantir des états cohérents et prévisibles.

---

## 📘 Rendez-vous (RDV)

### Statuts
| Statut | Label | Couleur | Sens |
|--------|-------|---------|------|
| `programmé` | Programmé | Bleu | RDV prévu au calendrier |
| `confirmé` | Confirmé | Ambre | Patient a confirmé sa présence |
| `terminé` | Terminé | Vert | RDV effectué et clos |
| `annulé` | Annulé | Gris | RDV annulé |

### Diagramme de Transitions
```
┌─────────────┐
│ Programmé   │
└──────┬──────┘
       │
       ├─→ Confirmé ──┐
       │              │
       └─→ Annulé     │
                      │
                      ├─→ Terminé ──→ [TERMINAL]
                      │
                      └─→ Annulé ──→ [TERMINAL]
```

### Matrice de Transitions Valides
```
De "programmé"  → vers: confirmé, annulé
De "confirmé"   → vers: terminé, annulé
De "terminé"    → [TERMINAL - aucune transition]
De "annulé"     → [TERMINAL - aucune transition]
```

### Cas d'Usage
```javascript
// ✅ Valide: créer un RDV programmé
createRdv({ statut: 'programmé' })

// ✅ Valide: patient confirme sa présence
updateRdv(id, { statut: 'confirmé' })

// ✅ Valide: marquer le RDV comme terminé
updateRdv(id, { statut: 'terminé' })

// ❌ Invalide: passer de "terminé" à "confirmé"
updateRdv(id, { statut: 'confirmé' })  // ← ERREUR!

// ❌ Invalide: passer de "annulé" à "programmé"
updateRdv(id, { statut: 'programmé' }) // ← ERREUR!
```

---

## 💰 Devis

### Statuts
| Statut | Label | Couleur | Sens |
|--------|-------|---------|------|
| `brouillon` | Brouillon | Gris | Devis en cours d'édition |
| `envoye` | Envoyé | Bleu | Devis communiqué au patient |
| `accepte` | Accepté | Vert | Patient a accepté le devis |
| `rejete` | Rejeté | Rouge | Patient a refusé le devis |
| `facturise` | Facturisé | Teal | Devis convertis en facture |
| `annule` | Annulé | Gris-clair | Devis annulé |

### Diagramme de Transitions
```
┌──────────────┐
│  Brouillon   │
└──────┬───────┘
       │
       ├─→ Envoyé ─┬─→ Accepté ──┬─→ Facturisé ──→ [TERMINAL]
       │           │             │
       │           │             └─→ Annulé ──────→ [TERMINAL]
       │           │
       │           ├─→ Rejeté ───┬─→ Brouillon (relance)
       │           │             │
       │           │             └─→ Annulé ──────→ [TERMINAL]
       │           │
       │           └─→ Annulé ──────────────────→ [TERMINAL]
       │
       └─→ Annulé ────────────────────────────→ [TERMINAL]
```

### Matrice de Transitions Valides
```
De "brouillon"   → vers: envoye, annule
De "envoye"      → vers: accepte, rejete, annule
De "accepte"     → vers: facturise, annule
De "rejete"      → vers: brouillon, annule
De "facturise"   → vers: annule (rare, nécessite approbation)
De "annule"      → [TERMINAL - aucune transition]
```

### Cas d'Usage
```javascript
// ✅ Flux normal
createDevis({ statut: 'brouillon' })           // Créer le devis
updateDevis(id, { statut: 'envoye' })          // Envoyer au patient
updateDevis(id, { statut: 'accepte' })         // Patient accepte
updateDevis(id, { statut: 'facturise' })       // Convertir en facture

// ✅ Cas de relance après rejet
updateDevis(id, { statut: 'rejete' })          // Patient refuse
updateDevis(id, { statut: 'brouillon' })       // Modifier et relancer
updateDevis(id, { statut: 'envoye' })          // Renvoyer

// ✅ Annulation à n'importe quel moment
updateDevis(id, { statut: 'annule' })

// ❌ Invalide: sauter les étapes
updateDevis(id, { statut: 'accepte' })  // ← ERREUR! faut passer par 'envoye'

// ❌ Invalide: rejeté → envoyé directement
updateDevis(id, { statut: 'rejete' })
updateDevis(id, { statut: 'envoye' })   // ← ERREUR! faut passer par 'brouillon'

// ❌ Invalide: modification après facturisation
updateDevis(id, { statut: 'facturise' })
updateDevis(id, { montant: 100000 })    // ← ATTENTION! Devis facturisé = immuable?
```

### Remarques Importantes

#### Devis Facturisé
- Une fois `facturise`, le devis ne peut être que `annule`
- Cette transition est **rare** et devrait nécessiter une approbation
- ⚠️ **Question**: Que se passe-t-il avec la facture créée?
  - Faut-il annuler la facture aussi?
  - Faut-il créer un avoir?

#### Devis Rejeté → Brouillon (Relance)
- Cas classique : patient refuse, cabinet revient dessus
- Permet une relance sans repartir de zéro
- ✓ Logique : préserver l'historique (cf. audit trail)

---

## 📄 Facture

### Statuts
| Statut | Label | Couleur | Sens |
|--------|-------|---------|------|
| `attente` | En attente | Ambre | Facture émise, paiement attendu |
| `paye` | Payée | Teal | Facture payée |
| `annule` | Annulée | Rouge | Facture annulée |

### Diagramme de Transitions
```
┌─────────────┐
│  Attente    │
└──────┬──────┘
       │
       ├─→ Payee ──┬─→ Annule ──→ [TERMINAL]
       │           │
       │           └─→ [TERMINAL]
       │
       └─→ Annule ────────→ [TERMINAL]
```

### Matrice de Transitions Valides
```
De "attente"  → vers: paye, annule
De "paye"     → vers: annule (rare, ajustement/remboursement)
De "annule"   → [TERMINAL - aucune transition]
```

### Cas d'Usage
```javascript
// ✅ Flux normal
createFacture({ statut: 'attente' })        // Créer la facture
updateFacture(id, { statut: 'paye' })       // Patient paie

// ✅ Annulation
updateFacture(id, { statut: 'annule' })     // Annuler à tout moment

// ✅ Remboursement (rare)
updateFacture(id, { statut: 'paye' })       // Facture payée
updateFacture(id, { statut: 'annule' })     // Créer un avoir

// ❌ Invalide: revendiquer payé puis relancer
updateFacture(id, { statut: 'paye' })
updateFacture(id, { statut: 'attente' })    // ← ERREUR! Pas de retour arrière
```

---

## 🔧 Utiliser les Transitions dans le Code

### Vérifier si une Transition est Valide

```javascript
import { canTransitionDevis, getNextStatuses } from '../lib/statuses'

// Vérifier si la transition est autorisée
const result = canTransitionDevis('brouillon', 'accepte')
if (!result.valid) {
  console.error(result.error)
  // "Transition de 'brouillon' vers 'accepte' n'est pas autorisée. 
  //  Statuts valides: envoye, annule"
}

// Obtenir les statuts autorisés
const nextStatuses = getNextStatuses('envoye', 'devis')
// Retourne: ['accepte', 'rejete', 'annule']

// Afficher les options de changement de statut au user
<select value={devis.statut}>
  {getNextStatuses(devis.statut, 'devis').map(s => (
    <option key={s} value={s}>{DEVIS_STATUS_META[s].label}</option>
  ))}
</select>
```

### Implémenter une Validation d'Update

```javascript
// useDevis.js ou équivalent
async function updateDevisStatut(id, newStatut) {
  const devis = await fetchDevis(id)
  
  // Valider la transition
  const result = canTransitionDevis(devis.statut, newStatut)
  if (!result.valid) {
    throw new Error(result.error)
  }
  
  // Si accepté → créer une facture
  if (newStatut === DEVIS_STATUS.ACCEPTE) {
    await createFactureFromDevis(devis)
  }
  
  // Si facturisé → vérifier la facture existe
  if (newStatut === DEVIS_STATUS.FACTURISE) {
    const facture = await getFactureFromDevis(devis.id)
    if (!facture) throw new Error('Facture manquante')
  }
  
  // Mettre à jour
  return updateDevis(id, { statut: newStatut })
}
```

### Filtrer les Actions Disponibles

```javascript
function DevisActions({ devis }) {
  const nextStatuses = getNextStatuses(devis.statut, 'devis')
  
  return (
    <div className="flex gap-2">
      {nextStatuses.includes(DEVIS_STATUS.ENVOYE) && (
        <button onClick={() => send(devis.id)}>Envoyer</button>
      )}
      {nextStatuses.includes(DEVIS_STATUS.FACTURISE) && (
        <button onClick={() => invoice(devis.id)}>Facturer</button>
      )}
      {nextStatuses.includes(DEVIS_STATUS.ANNULE) && (
        <button onClick={() => cancel(devis.id)}>Annuler</button>
      )}
    </div>
  )
}
```

---

## 🧪 Tests

### Test des Transitions Valides
```javascript
import { canTransitionDevis } from '../lib/statuses'

describe('Devis Transitions', () => {
  test('brouillon → envoye', () => {
    expect(canTransitionDevis('brouillon', 'envoye').valid).toBe(true)
  })
  
  test('brouillon → accepte (invalide)', () => {
    const result = canTransitionDevis('brouillon', 'accepte')
    expect(result.valid).toBe(false)
  })
  
  test('terminé est terminal', () => {
    expect(canTransitionDevis('facturise', 'brouillon').valid).toBe(false)
  })
})
```

---

## ⚠️ Cas Spéciaux et Règles Métier

### Devis Accepté → Facturisé
**Question**: Faut-il:
- [ ] Créer automatiquement une facture?
- [ ] Vérifier que pas d'autre devis accepté pour le même patient?
- [ ] Archiver le devis automatiquement?

### Facture Payée → Annulée
**Question**: Faut-il:
- [ ] Créer un avoir automatiquement?
- [ ] Envoyer une notification au patient?
- [ ] Restreindre cette action (nécessiter approbation)?

### Devis Rejeté → Brouillon
**Avantage**: Permet une relance
**Risque**: Peut créer des doublon si on oublie de supprimer l'ancien

---

## 📊 Audit et Validation

Pour auditer les transitions de statuts:
```bash
# À implémenter: audit de cohérence
# - Vérifier que tous les devis en 'facturise' ont une facture
# - Vérifier qu'aucune transition invalide n'existe en DB
# - Alerter sur les anomalies
```

---

## 📚 Références du Code

### Fichier Principal
- `src/lib/statuses.js` : Définitions et validation

### Matrices de Transitions
- `RDV_TRANSITIONS` : Transitions RDV
- `DEVIS_TRANSITIONS` : Transitions Devis
- `FACTURE_TRANSITIONS` : Transitions Facture

### Fonctions de Validation
- `canTransitionRdv(current, next)` : Valide une transition RDV
- `canTransitionDevis(current, next)` : Valide une transition Devis
- `canTransitionFacture(current, next)` : Valide une transition Facture
- `getNextStatuses(current, type)` : Retourne les statuts autorisés

---

**Version**: 1.0
**Statut**: ✅ Transitions documentées et validées
**Date**: 2026-06-04
