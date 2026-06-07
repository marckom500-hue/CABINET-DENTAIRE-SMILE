# ✅ Solution Complète: Machine à États des RDV

## 📋 Problèmes résolus

### ✅ Q1: Peut-on annuler un RDV terminé?
**DÉCISION:** Non, sauf admin (correction d'erreur)
- Une fois terminé = données médicales immutables
- Annulation = suppression, incompatible avec terminé
- Alternative: créer un nouveau RDV

### ✅ Q2: Peut-on terminer sans confirmer?
**DÉCISION:** Non (déjà implémenté)
- Button "Terminer" disabled si `statut ≠ confirmé`

### ✅ Q3: Peut-on confirmer après avoir commencé?
**DÉCISION:** Non
- Une fois confirmé → ne peux pas revenir à PROGRAMMÉ
- Exception: "Rectifier" (revenir à PROGRAMMÉ) **seulement si terminé sans présence définie**

### ✅ Q4: Peut-on marquer absent si non confirmé?
**DÉCISION:** Oui, nouveau bouton "Absent dès départ"
- **De PROGRAMMÉ:** "Absent dès départ" → TERMINÉ [absent]
- **De CONFIRMÉ:** "Absent" → TERMINÉ [absent]

### ✅ Q5: Status "urgent" — quand l'utiliser?
**DÉCISION:** Statut SUPPRIMÉ, remplacé par flag `is_urgent`
- Flag séparé `is_urgent: BOOLEAN` pour marquer priorité
- Plus de confusion avec l'état du RDV

### ✅ Q6: Status "attente" — signifie quoi?
**DÉCISION:** Renommé en "programmé"
- Terminologie claire: programmé = calendaire, pas encore approuvé

---

## 🔄 Machine à États — Implémentation

### Fichiers créés

**1. `src/lib/rdvStateMachine.js`** (109 lignes)
```javascript
// Définit:
// - RDV_STATES (programmé, confirmé, terminé, annulé)
// - RDV_ACTIONS (confirmer, terminer, absent, etc.)
// - TRANSITIONS (qui peut faire quoi, depuis quel état)
// - Fonctions: canTransition(), getPossibleActions(), executeTransition()

export function canTransition(state, action, userRole, rdv)
export function getPossibleActions(state, userRole, rdv)
export function executeTransition(state, action, userRole, rdv)
```

**2. `supabase_migration_rdv_state_machine.sql`** (Migration BD)
```sql
-- Ajoute: is_urgent, updated_at, triggers, contraintes
-- Crée: index sur statut, medecin_id, date, etc.
```

**3. `MedecinRdv_v2.jsx`** (Nouvelle version)
```javascript
// Utilise getPossibleActions() pour afficher les boutons dynamiquement
// Plus de hardcoding: tout vient de la machine à états
// Meilleure UX: boutons contextuels selon l'état
```

**4. `RDV_STATE_MACHINE_RFC.md`** (Documentation complète)
```markdown
- Diagramme de la machine à états
- Règles de transition par état
- Permissions par rôle
- Tests à effectuer
```

---

## 📊 Transitions autorisées

### PROGRAMMÉ
```
✓ Confirmer       → CONFIRMÉ (médecin approuve)
✓ Absent départ   → TERMINÉ (patient absent avant confirmation)
✗ Annuler         → ANNULÉ (avant consultation)
```

### CONFIRMÉ
```
✓ Terminer (Présent) → TERMINÉ [present=true]  (patient est venu)
✓ Marquer absent     → TERMINÉ [present=false] (patient n'est pas venu)
✓ Rectifier          → PROGRAMMÉ (re-confirmer)
✗ Annuler            → ANNULÉ (avant ou pendant)
```

### TERMINÉ
```
↺ Rectifier → PROGRAMMÉ (si present=NULL, correction nécessaire)
✗ Annuler   → ANNULÉ (admin only, très rare)
```

### ANNULÉ
```
⟲ Restaurer → PROGRAMMÉ (admin only, correction d'erreur)
```

---

## 🎨 UI: Boutons affichés

### État PROGRAMMÉ
```
┌──────────────────┐
│ ✓ Confirmer      │ (green)
│ ✗ Absent départ  │ (orange) ← Nouveau!
│ ✗ Annuler        │ (red)
└──────────────────┘
```

### État CONFIRMÉ
```
┌──────────────────────────┐
│ ✓ Terminer (Présent)     │ (blue)
│ ✗ Marquer absent         │ (red)
│ ↺ Rectifier              │ (gray)
│ ✗ Annuler                │ (red, small)
└──────────────────────────┘
```

### État TERMINÉ
```
┌──────────────────┐
│ ↺ Rectifier      │ (gray, si present=NULL)
└──────────────────┘
```

---

## 🔐 Permissions par rôle

| Rôle | Actions | Notes |
|------|---------|-------|
| **Médecin** | Confirmer, Terminer, Absent, Rectifier, Annuler (avant/pendant) | Responsable du workflow |
| **Secrétaire** | Annuler (programmé) | Gestion administrative |
| **Superadmin** | TOUTES | Accès complet + corrections |
| **Assistant** | Lecture seulement | Pas d'actions |

---

## 📝 Utilisation dans le code

### Frontend: Afficher les actions disponibles
```javascript
import { getPossibleActions } from '../lib/rdvStateMachine'

// Dans le composant
const possibleActions = getPossibleActions(
  normalizeRdvStatus(rdv.statut),  // État actuel
  profile?.role || 'assistant',     // Rôle utilisateur
  rdv                                // Objet RDV (pour conditions)
)

// Afficher les boutons
{possibleActions.map(action => (
  <button onClick={() => handleTransition(rdv, action.action)}>
    {action.label}
  </button>
))}
```

### Backend: Valider une transition
```javascript
import { executeTransition } from '../lib/rdvStateMachine'

// Avant UPDATE en BD
const result = executeTransition(
  normalizeRdvStatus(rdv.statut),
  action,
  userRole,
  rdv
)

if (!result.success) {
  throw new Error(result.error)
}

// Exécuter l'UPDATE
await supabase
  .from('rendez_vous')
  .update({ 
    statut: result.newState,
    ...result.updateData 
  })
  .eq('id', rdv.id)
```

---

## 🧪 Checklist de validation

### Cas nominaux
- [ ] PROGRAMMÉ → Confirmer → CONFIRMÉ ✓
- [ ] CONFIRMÉ → Terminer (Présent) → TERMINÉ [present=true] ✓
- [ ] CONFIRMÉ → Absent → TERMINÉ [present=false] ✓
- [ ] PROGRAMMÉ → Absent départ → TERMINÉ [present=false] ✓
- [ ] CONFIRMÉ → Rectifier → PROGRAMMÉ ✓
- [ ] TERMINÉ (present=NULL) → Rectifier → PROGRAMMÉ ✓

### Cas de sécurité
- [ ] PROGRAMMÉ → Absent départ (pas de Confirmer) ✓
- [ ] CONFIRMÉ → Terminer (disabled si pas confirmé) ✓
- [ ] TERMINÉ (present=NOT NULL) → pas de Rectifier ✓
- [ ] ANNULÉ → Restaurer (admin only) ✓

### Permissions
- [ ] Secrétaire: peut annuler PROGRAMMÉ ✓
- [ ] Médecin: peut terminer CONFIRMÉ ✓
- [ ] Assistant: lecture seulement ✓
- [ ] Superadmin: toutes les actions ✓

---

## 🚀 Déploiement

### Étape 1: BD
```bash
# Exécuter dans Supabase SQL Editor
# Contenu: supabase_migration_rdv_state_machine.sql
```

### Étape 2: Frontend
```bash
# Remplacer MedecinRdv.jsx par MedecinRdv_v2.jsx
cp src/pages/MedecinRdv_v2.jsx src/pages/MedecinRdv.jsx

# Ou tester dans une branch separate avant de merger
```

### Étape 3: Validation
```bash
npm run dev
# Tester tous les cas nominaux et limites
```

---

## 📚 Fichiers créés/modifiés

| Fichier | Type | Ligne | Description |
|---------|------|------|-------------|
| `src/lib/rdvStateMachine.js` | ✨ NEW | 109 | Machine à états |
| `supabase_migration_rdv_state_machine.sql` | 🔄 Migration | 50+ | Colonnes + triggers |
| `RDV_STATE_MACHINE_RFC.md` | 📝 Doc | 350+ | Spécification complète |
| `MedecinRdv_v2.jsx` | ✨ NEW | 200 | Intégration machine états |
| `src/pages/MedecinRdv.jsx` | 🔄 À remplacer | - | Utilise MedecinRdv_v2 |

---

## ✨ Bénéfices

| Avant | Après |
|-------|-------|
| ❌ Transitions flues | ✅ Machine d'états robuste |
| ❌ Boutons hardcodés | ✅ Boutons dynamiques par état |
| ❌ Permissions ambigues | ✅ Matrice de permissions claire |
| ❌ "Urgent" = confusion | ✅ Flag `is_urgent` séparé |
| ❌ Pas de validation | ✅ Validation centralisée |
| ❌ Workflow médecin flou | ✅ Machine d'états documentée |

---

**✅ Prêt à déployer!**

