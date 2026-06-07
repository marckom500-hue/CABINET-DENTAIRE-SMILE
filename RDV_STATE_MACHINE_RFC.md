# RFC: Machine à États des Rendez-vous

## 🎯 Objectif
Clarifier les règles métier pour la gestion des RDV et implémenter une machine à états robuste et prévisible.

---

## 📊 Machine à États — Proposée

```
          ┌─────────────────────────────────────────────────┐
          │                                                 │
          v                                                 │
    ┌──────────────┐                                       │
    │  PROGRAMMÉ   │◄──────────────────────────────────────┘
    │  (Nouveau)   │
    └──────────────┘
          │
          │ ✓ Confirmer (Médecin approuve)
          v
    ┌──────────────┐
    │  CONFIRMÉ    │◄──────────────────┐
    │  (Validé)    │                   │
    └──────────────┘                   │
          │                            │
          ├─→ ✓ Terminer (Présent)    │
          │   └──> TERMINÉ [présent=true]
          │                            │
          ├─→ ✗ Absent (Non-présent)  │
          │   └──> TERMINÉ [présent=false]
          │                            │
          └─→ ✗ Annuler              │
              └──> ANNULÉ             │
                                      │
    ┌──────────────┐                  │
    │  TERMINÉ     │──┐               │
    │  (Fini)      │  │               │
    └──────────────┘  │               │
          ▲           │               │
          │           └──→ ✓ Rectifier─┤
          │                (correction)│
          │                            │
          └────────────────────────────┘

    ┌──────────────┐
    │  ANNULÉ      │
    │  (Supprimé)  │
    └──────────────┘
         ▲
         │ (rare, admin only)
         └──────────────────────────┐
                                    │
              De n'importe quel état
```

---

## 🔄 Règles de Transition

### État: PROGRAMMÉ
| Action | Destination | Qui? | Condition | Notes |
|--------|------------|------|-----------|-------|
| **Confirmer** | CONFIRMÉ | Médecin | Aucune | RDV approuvé par médecin |
| **Annuler** | ANNULÉ | Secrétaire | Aucune | Avant confirmation |

### État: CONFIRMÉ
| Action | Destination | Qui? | Condition | Notes |
|--------|------------|------|-----------|-------|
| **Terminer (Présent)** | TERMINÉ | Médecin | ✓ patient_present=true | Consultation effectuée |
| **Marquer Absent** | TERMINÉ | Médecin | ✗ patient_present=false | Patient n'est pas venu |
| **Annuler** | ANNULÉ | Médecin | Aucune | Après approbation |
| **Rectifier** | PROGRAMMÉ | Médecin | Aucune | Revenir pour re-confirmer |

### État: TERMINÉ
| Action | Destination | Qui? | Condition | Notes |
|--------|------------|------|-----------|-------|
| **Rectifier** | PROGRAMMÉ | Médecin/Admin | `patient_present IS NULL` | Besoin de corriger la présence |
| **Annuler** | ANNULÉ | Admin | Rare, correction erreur | Très exceptionnel |

### État: ANNULÉ
| Action | Destination | Qui? | Condition | Notes |
|--------|------------|------|-----------|-------|
| **Restaurer** | PROGRAMMÉ | Admin | `admin_only` | Très rare, correction d'erreur |

---

## ❓ Questions tranchées

### Q1: Peut-on annuler un RDV terminé?
**✅ RÉPONSE:** 
- **Non**, sauf par un admin (correction d'erreur)
- Raison: Un RDV terminé = données médicales sauvegardées = immuable
- Pour corriger: créer un nouvel RDV, pas annuler l'ancien

### Q2: Peut-on terminer sans confirmer?
**✅ RÉPONSE:** 
- **Non** (déjà implémenté)
- Button "Terminer" disabled si `statut ≠ 'confirmé'`

### Q3: Peut-on confirmer après avoir commencé?
**✅ RÉPONSE:** 
- **Non** (ajouter une vérification)
- Une fois confirmé → ne plus revenir à PROGRAMMÉ directement
- Exception: "Rectifier" (revenir à PROGRAMMÉ) que si terminé **sans présence définie**

### Q4: Peut-on marquer absent si non confirmé?
**✅ RÉPONSE:** 
- **Non** (déjà implémenté)
- Absent = terminer un RDV confirmé avec `patient_present=false`
- **Si patient absent dès départ:**
  - ❌ Ne pas passer par CONFIRMÉ
  - ✅ Passer directement: PROGRAMMÉ → TERMINÉ [absent]
  - Alternative: Créer un nouveau bouton "Absent dès départ" depuis PROGRAMMÉ

### Q5: Status "urgent" — quand l'utiliser?
**✅ RÉPONSE:** 
- **SUPPRIMÉ** (confuse avec "confirmé")
- Anciens "urgent" migrent → "confirmé"
- Pour marquer une urgence: utiliser un flag séparé `is_urgent: BOOLEAN`

### Q6: Status "attente" — signifie quoi?
**✅ RÉPONSE:** 
- **RENOMMÉ en "programmé"**
- "attente" = terme ambigu (attendre quoi? qui?)
- "programmé" = clair: RDV calendaire défini, pas encore approuvé par médecin

---

## 📋 Implémentation

### Base de données
```sql
-- Table complète
CREATE TABLE rendez_vous (
  id              UUID PRIMARY KEY,
  patient_id      UUID REFERENCES patients(id),
  medecin_id      UUID REFERENCES users_profiles(id),
  date            DATE NOT NULL,
  heure           TEXT NOT NULL,
  type_acte       TEXT NOT NULL,
  duree           INTEGER DEFAULT 30,
  
  -- État principal
  statut          TEXT NOT NULL DEFAULT 'programmé' 
                  CHECK (statut IN ('programmé','confirmé','terminé','annulé')),
  
  -- Présence (null si pas encore défini)
  patient_present BOOLEAN DEFAULT NULL,
  
  -- Urgence (flag supplémentaire)
  is_urgent       BOOLEAN DEFAULT false,
  
  -- Audit
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Contrainte: Si terminé, patient_present ne peut pas être NULL
ALTER TABLE rendez_vous ADD CONSTRAINT chk_termine_has_presence
  CHECK (statut != 'terminé' OR patient_present IS NOT NULL);
```

### Frontend: Machine à états
```javascript
// src/lib/rdvStateMachine.js

export const RDV_STATES = {
  PROGRAMME: 'programmé',
  CONFIRME: 'confirmé',
  TERMINE: 'terminé',
  ANNULE: 'annulé',
};

// Transitions autorisées: statut_actuel -> [actions possibles]
export const TRANSITIONS = {
  'programmé': [
    { action: 'confirmer', destination: 'confirmé', actor: 'medecin' },
    { action: 'annuler', destination: 'annulé', actor: 'secretaire' },
    { action: 'marquerAbsentDepart', destination: 'terminé', actor: 'medecin', data: { patient_present: false } },
  ],
  'confirmé': [
    { action: 'terminerPresent', destination: 'terminé', actor: 'medecin', data: { patient_present: true } },
    { action: 'marquerAbsent', destination: 'terminé', actor: 'medecin', data: { patient_present: false } },
    { action: 'annuler', destination: 'annulé', actor: 'medecin' },
    { action: 'rectifier', destination: 'programmé', actor: 'medecin' },
  ],
  'terminé': [
    { action: 'rectifier', destination: 'programmé', actor: 'medecin', condition: 'patient_present IS NULL' },
    { action: 'annuler', destination: 'annulé', actor: 'admin' },
  ],
  'annulé': [
    { action: 'restaurer', destination: 'programmé', actor: 'admin' },
  ],
};

export function canTransition(currentState, action, userRole) {
  const possibleTransitions = TRANSITIONS[currentState] || [];
  const transition = possibleTransitions.find(t => t.action === action);
  
  if (!transition) return false;
  
  // Vérifier que l'utilisateur a le rôle requis
  if (transition.actor !== 'any' && transition.actor !== userRole) {
    return false;
  }
  
  return true;
}

export function getTransitionData(state, action) {
  const possibleTransitions = TRANSITIONS[state] || [];
  const transition = possibleTransitions.find(t => t.action === action);
  return transition?.data || {};
}
```

---

## 🎨 UI/UX: Boutons affichés par état

### État: PROGRAMMÉ
```
┌─────────────────┐
│ ✓ Confirmer     │  (Vert - approuver)
│ ✗ Annuler       │  (Rouge - rejeter)
│ ✗ Absent départ │  (Orange - terminer sans confirmer)
└─────────────────┘
```

### État: CONFIRMÉ
```
┌─────────────────────────┐
│ ✓ Terminer (Présent)    │  (Bleu - valider)
│ ✗ Absent (Non-présent)  │  (Rouge - absence)
│ ↺ Rectifier             │  (Gris - annuler la confirmation)
│ ✗ Annuler               │  (Noir - dernière option)
└─────────────────────────┘
```

### État: TERMINÉ
```
┌──────────────────┐
│ ↺ Rectifier      │  (Gris - si présence pas définie)
│ ✗ Annuler        │  (Admin only, rare)
└──────────────────┘
```

---

## 📝 Documentation utilisateur

### Pour les Médecins
1. **Programmé** → Consulter le dossier patient
   - Si prêt à débuter → **Confirmer** ✓
   - Si besoin de reprogrammer → **Annuler** ✗

2. **Confirmé** → Démarrer la consultation
   - Patient arrivé → **Terminer (Présent)** ✓
   - Patient absent → **Absent** ✗
   - Besoin de reporter → **Rectifier** ↺

3. **Terminé** → Consultation enregistrée
   - Erreur de présence → **Rectifier** (si présence vide)
   - Erreur critique → Signaler à l'admin

### Pour les Secrétaires
1. **Programmé** → Appeler patient pour confirmer
   - Si confirmé par le patient → pas d'action
   - Si patient annule → **Annuler** ✗

---

## 🧪 Tests

### Cas nominaux
- [ ] Programmé → Confirmer → Terminer (Présent) ✓
- [ ] Programmé → Confirmer → Absent ✓
- [ ] Programmé → Confirmer → Rectifier → Confirmer ✓
- [ ] Programmé → Absent départ ✓

### Cas limites
- [ ] Button "Terminer" disabled si statut ≠ confirmé
- [ ] Pas possible de revenir à PROGRAMMÉ depuis CONFIRMÉ (sauf Rectifier)
- [ ] TERMINÉ sans présence → peut Rectifier
- [ ] TERMINÉ avec présence → ne peut pas Rectifier

---

## 🚀 Déploiement

### Phase 1: Database
1. ✅ Ajouter colonne `is_urgent BOOLEAN DEFAULT false`
2. ✅ Ajouter contrainte: `statut != 'terminé' OR patient_present IS NOT NULL`

### Phase 2: Frontend
1. Créer `src/lib/rdvStateMachine.js`
2. Mettre à jour `MedecinRdv.jsx` pour afficher boutons selon état
3. Mettre à jour `RendezVous.jsx` (page secrétaire)

### Phase 3: Validation
1. Tester tous les cas nominaux
2. Vérifier les permissions par rôle
3. Documenter dans le README

---

## 📚 Référence rapide

| Transition | De | À | Condition | Validé? |
|-----------|----|----|-----------|---------|
| Confirmer | Programmé | Confirmé | Aucune | ✅ |
| Terminer | Confirmé | Terminé | patient_present défini | ✅ |
| Absent | Confirmé | Terminé | patient_present=false | ✅ |
| Annuler | Programmé/Confirmé | Annulé | - | ✅ |
| Rectifier | Confirmé | Programmé | - | ✅ |
| Rectifier | Terminé | Programmé | patient_present IS NULL | ⚠️ Rare |

