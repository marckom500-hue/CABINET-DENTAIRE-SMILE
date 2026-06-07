# 🚀 Quick Start: Valider les Transitions de Statuts

## Import Rapide
```javascript
import { 
  canTransitionDevis, 
  getNextStatuses,
  DEVIS_STATUS 
} from '../lib/statuses'
```

## 3 Cas d'Usage Courants

### 1️⃣ Vérifier avant de Mettre à Jour
```javascript
// Avant d'update
async function updateDevisStatut(devisId, newStatut) {
  const devis = await getDevis(devisId)
  
  // ✅ Valider
  const result = canTransitionDevis(devis.statut, newStatut)
  if (!result.valid) {
    alert(result.error) // "Transition... n'est pas autorisée..."
    return false
  }
  
  // ✅ Mettre à jour
  return updateDevis(devisId, { statut: newStatut })
}
```

### 2️⃣ Afficher les Boutons Dynamiques
```javascript
function DevisActions({ devis }) {
  const possible = getNextStatuses(devis.statut, 'devis')
  
  return (
    <div className="flex gap-2">
      {possible.includes(DEVIS_STATUS.ENVOYE) && (
        <button onClick={() => send()}>Envoyer</button>
      )}
      {possible.includes(DEVIS_STATUS.ACCEPTE) && (
        <button onClick={() => accept()}>Accepter</button>
      )}
      {possible.includes(DEVIS_STATUS.ANNULE) && (
        <button onClick={() => cancel()}>Annuler</button>
      )}
    </div>
  )
}
```

### 3️⃣ Créer un Dropdown de Changement
```javascript
function StatusSelector({ devis, onChangeStatus }) {
  const nextStatuses = getNextStatuses(devis.statut, 'devis')
  
  return (
    <select 
      value={devis.statut}
      onChange={(e) => onChangeStatus(e.target.value)}
    >
      <option disabled>{devis.statut}</option>
      {nextStatuses.map(s => (
        <option key={s} value={s}>
          {DEVIS_STATUS_META[s].label}
        </option>
      ))}
    </select>
  )
}
```

## Les 4 Statuts Finaux

| Statut | API | Validation | UI |
|--------|-----|------------|-----|
| Brouillon | `BROUILLON` | ✅ Peut aller vers 2 statuts | 📝 Éditable |
| Envoyé | `ENVOYE` | ✅ Peut aller vers 3 statuts | 📧 Attendu réponse |
| Accepté | `ACCEPTE` | ✅ Peut aller vers 2 statuts | ✅ Facturisable |
| Rejeté | `REJETE` | ✅ Peut relancer | ❌ À reviser |
| Facturisé | `FACTURISE` | ⚠️ Terminal (sauf annul) | 📄 Facture créée |
| Annulé | `ANNULE` | ❌ Terminal | ❌ Finalisé |

## Cheat Sheet - Transitions Autorisées

### Brouillon
```
Depuis "brouillon" on peut aller vers:
  → "envoye"      ✅ Envoyer au client
  → "annule"      ✅ Annuler
```

### Envoyé
```
Depuis "envoye" on peut aller vers:
  → "accepte"     ✅ Client accepte
  → "rejete"      ✅ Client refuse
  → "annule"      ✅ Annuler
```

### Accepté
```
Depuis "accepte" on peut aller vers:
  → "facturise"   ✅ Créer facture
  → "annule"      ✅ Annuler (rare)
```

### Rejeté
```
Depuis "rejete" on peut aller vers:
  → "brouillon"   ✅ Relancer (modifier + renvoyer)
  → "annule"      ✅ Annuler
```

### Facturisé
```
Depuis "facturise" on peut aller vers:
  → "annule"      ✅ Annuler (rare, avec approbation)
```

### Annulé
```
Depuis "annule" on peut aller vers:
  ❌ RIEN - C'est terminal!
```

## ⚠️ Erreurs Courantes à Éviter

```javascript
// ❌ MAUVAIS - Pas de validation
updateDevis(id, { statut: 'accepte' })  // Risque si en brouillon!

// ✅ BON - Avec validation
if (canTransitionDevis(devis.statut, 'accepte').valid) {
  updateDevis(id, { statut: 'accepte' })
}

// ❌ MAUVAIS - Supposer que n'importe quelle transition marche
const next = prompt("Nouveau statut?") // L'user tape n'importe quoi!

// ✅ BON - Afficher seulement les options valides
const options = getNextStatuses(devis.statut, 'devis')
<select>{options.map(o => <option>{o}</option>)}</select>
```

## Tester Localement
```bash
# Exécuter la suite de tests
node test-transitions.js

# Output:
# 🧪 Tests: Devis Transitions
# ✅ brouillon → envoyé (flux normal)
# ✅ envoyé → accepté (flux normal)
# ...
# ✅ TOUS LES TESTS SONT PASSÉS!
```

## Cas Spéciaux

### Relancer un Devis Après Rejet
```javascript
// User a rejeté, on veut relancer
// 1. Revenir à brouillon (modifier)
updateDevis(id, { statut: DEVIS_STATUS.BROUILLON })
// 2. Puis envoyer à nouveau
updateDevis(id, { statut: DEVIS_STATUS.ENVOYE })
```

### Annuler un Devis à Tout Moment
```javascript
// Depuis n'importe quel statut (sauf terminal)
const result = canTransitionDevis(devis.statut, DEVIS_STATUS.ANNULE)
if (result.valid) {
  updateDevis(id, { statut: DEVIS_STATUS.ANNULE })
}
```

### Vérifier les Options de Changement
```javascript
// Avant de montrer un dropdown/menu
const options = getNextStatuses(devis.statut, 'devis')
if (options.length === 0) {
  showMessage("Ce devis ne peut plus être modifié")
}
```

## Debugging

### Si une Transition Est Refusée
```javascript
const result = canTransitionDevis('brouillon', 'accepte')
// Affiche:
// {
//   valid: false,
//   error: "Transition de 'brouillon' vers 'accepte' n'est pas autorisée. 
//           Statuts valides: envoye, annule"
// }
```

### Vérifier les Transitions Possibles
```javascript
import { DEVIS_TRANSITIONS } from '../lib/statuses'

console.log(DEVIS_TRANSITIONS)
// Affiche la matrice complète
```

## 📚 Références
- Full Docs: `STATUS_LIFECYCLE.md`
- Tests: `test-transitions.js`
- Code: `src/lib/statuses.js`
- Solution: `STATUS_TRANSITIONS_SOLUTION.md`

---

**Besoin d'aide?** Lire `STATUS_LIFECYCLE.md` pour les diagrammes complets.
