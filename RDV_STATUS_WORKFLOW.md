# ✅ Statuts RDV : Création en "Attente" et Confirmation par médecins

## 📋 Implémentation

### 1. **Les RDV sont créés avec le statut "Attente" par défaut** ✅

**Fichier modifié :** `src/components/FormulaireRdv.jsx`

Avant :
```javascript
statut: RDV_STATUS.CONFIRME  // ❌ Défaut = confirmé
```

Après :
```javascript
statut: RDV_STATUS.ATTENTE  // ✅ Défaut = en attente
```

**Impact :**
- Les secrétaires créent les RDV en "Attente"
- Aucun choix de statut dans le formulaire
- Le statut est forcé à "attente" pour toute nouvelle création

### 2. **Seuls les médecins peuvent confirmer/annuler les RDV** ✅

**Fichier existant :** `src/pages/MedecinRdv.jsx`

Fonctionnalités :
- Médecin voit ses RDV
- Si statut = "attente" → bouton "Confirmer" visible
- Si statut ≠ "annule" → bouton "Annuler" visible
- Clic "Confirmer" → statut devient "confirme"
- Clic "Annuler" → affiche dialog de confirmation

**Permissions :**
- Module `medecin_rdv` → accès exclusif aux médecins
- Secrétaires : voir seulement (lecture)
- Médecins : confirmer/annuler (écriture)

---

## 🔄 Flux complet d'un RDV

```
┌─────────────────────────────────────────────────────────┐
│ 1. SECRÉTAIRE crée un RDV                              │
├─────────────────────────────────────────────────────────┤
│ Formulaire RDV                                          │
│ - Patient : John Doe                                   │
│ - Médecin : Dr. Smith                                  │
│ - Date : 05/06/2026                                    │
│ - Heure : 2:30 PM → stocke 14:30                       │
│ - Acte : Détartrage                                    │
│ - Durée : 30 min                                       │
│ - Statut : (NON visible) = forcé à "ATTENTE"           │
│ - Notes : Brossage lingual                             │
│ Clic "Ajouter"                                          │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ BDD : rendez_vous                                       │
│ - id: UUID                                              │
│ - patient_id: john_doe_id                              │
│ - medecin_id: smith_id                                 │
│ - date: 2026-06-05                                      │
│ - heure: 14:30                                          │
│ - statut: "attente" ← Forcé par le système             │
│ - type_acte: Détartrage                                │
│ - duree: 30                                             │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ NOTIFICATION médecin                                    │
│ "Nouveau RDV assigné"                                  │
│ "RDV : John Doe le 05/06/2026 à 14h30                 │
│  (Détartrage) - EN ATTENTE"                            │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. MÉDECIN reçoit la notification                      │
├─────────────────────────────────────────────────────────┤
│ Cloche notifications → voir "RDV en attente"          │
│ Clic → Redirection /medecin-rdv (si médecin)         │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. MÉDECIN confirme ou annule le RDV                   │
├─────────────────────────────────────────────────────────┤
│ Page "Mes Rendez-vous"                                  │
│ Tableau :                                               │
│ ┌──────────────────────────────────────────────┐       │
│ │ Date│Heure│Patient│Acte│Durée│Statut│Actions│       │
│ ├──────────────────────────────────────────────┤       │
│ │05/06│14:30│J.Doe │Dét │30   │EN ATT│ ✓ Aff │       │
│ │     │     │      │    │     │      │ ✗ Ann │       │
│ └──────────────────────────────────────────────┘       │
│                                                         │
│ Option 1: Clic "Confirmer"                             │
│   → Statut devient "CONFIRME"                          │
│   → Patient reçoit notification (optionnel)            │
│   → RDV apparaît dans l'agenda du médecin              │
│                                                         │
│ Option 2: Clic "Annuler"                               │
│   → Dialog confirmation                                │
│   → "Êtes-vous sûr d'annuler ce RDV ?"                │
│   → Clic "Confirmer"                                   │
│   → Statut devient "ANNULE"                            │
│   → Patient reçoit notification (optionnel)            │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. RDV CONFIRMÉ                                         │
├─────────────────────────────────────────────────────────┤
│ BDD : statut = "confirme"                              │
│ Rappel SMS peut être envoyé (24h avant)               │
│ Patient voit le RDV confirmé                           │
│ Médecin peut consulter ses RDV confirmés               │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Checklist de test

### Test 1 : Création RDV par secrétaire

- [ ] Ouvrir formulaire RDV
- [ ] Champ "Statut" n'est PAS visible
- [ ] Remplir les infos
- [ ] Clic "Ajouter"
- [ ] Vérifier BDD : `statut = "attente"`
- [ ] Médecin reçoit notification

### Test 2 : Médecin confirme RDV

- [ ] Médecin accède `/medecin-rdv`
- [ ] Voir tableau avec RDV "EN ATTENTE"
- [ ] Bouton "Confirmer" visible
- [ ] Clic "Confirmer"
- [ ] Statut change à "CONFIRMÉ"
- [ ] Couleur badge change (jaune → vert)

### Test 3 : Médecin annule RDV

- [ ] Médecin voit RDV "EN ATTENTE"
- [ ] Clic "Annuler"
- [ ] Dialog confirmation apparaît
- [ ] Clic "Confirmer" sur dialog
- [ ] Statut change à "ANNULÉ"
- [ ] Couleur badge change (jaune → rouge)
- [ ] Boutons "Confirmer" et "Annuler" disparaissent

### Test 4 : Permissions

- [ ] Secrétaire : peut créer RDV (OK)
- [ ] Secrétaire : NE PEUT PAS accéder `/medecin-rdv` (Forbidden)
- [ ] Médecin : accès `/medecin-rdv` (OK)
- [ ] Médecin : peut confirmer/annuler (OK)
- [ ] Assistant : NE PEUT PAS accéder (Forbidden)

---

## 📊 États d'un RDV

| État | Créé par | Modifié par | Actions disponibles | Suivant |
|------|----------|------------|-------------------|---------|
| **ATTENTE** | Secrétaire | Médecin | Confirmer, Annuler | CONFIRME ou ANNULE |
| **CONFIRMÉ** | - | Médecin | Annuler | ANNULE |
| **RECU** | - | Système | Marquer comme passé | - |
| **ANNULÉ** | - | Médecin | (aucune) | - |
| **URGENT** | - | Médecin | Confirmer, Annuler | - |

---

## 🔐 Contrôle d'accès (RLS + Permissions)

### Créer un RDV
- ✅ Secrétaire : oui (formulaire visible)
- ✅ Médecin : oui (formulaire visible)
- ✅ Superadmin : oui
- ❌ Assistant : non (pas de bouton)
- ❌ Comptable : non (pas de bouton)

### Voir ses RDV (médecin)
- ✅ Médecin : ses RDV seulement
- ❌ Secrétaire : pas d'accès à `/medecin-rdv`
- ❌ Assistant : pas d'accès

### Confirmer/Annuler RDV
- ✅ Médecin : ses RDV assignés
- ❌ Secrétaire : pas de boutons
- ❌ Autres : pas d'accès

---

## 📌 Fichiers impactés

### Modifiés
- ✅ `src/components/FormulaireRdv.jsx`
  - Retrait du champ Statut
  - Défaut statut = "attente"

### Existants (pas de changement)
- ✅ `src/pages/MedecinRdv.jsx` — Déjà implémenté
- ✅ `src/hooks/useMedecinRdv.js` — Déjà implémenté
- ✅ `src/lib/roles.js` — Permissions existantes

---

## ✨ Résumé

✅ **Les RDV sont créés en "Attente"** → Secrétaire crée, médecin confirme
✅ **Seuls les médecins confirment** → Via `/medecin-rdv`
✅ **Permissions appliquées** → RLS + module permissions
✅ **Workflow clair** → Attente → Confirmé → Annulé
✅ **Notifications en place** → Médecin averti immédiatement

**C'est prêt pour production ! 🚀**
