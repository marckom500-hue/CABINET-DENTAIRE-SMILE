# 🎯 Analyse des Ambiguïtés du Système SMILE

## 📋 Vue d'ensemble
Ce document identifie et clarifie les ambiguïtés critiques qui posent des risques de confusion, d'erreurs de logique métier et d'incohérences dans le système de gestion du cabinet dentaire.

---

## 🔴 AMBIGUÏTÉS CRITIQUES

### 1. **Statuts des Rendez-vous — Incohérence majeure**

#### Problème
Le système définit les statuts de deux manières différentes **qui se contredisent**:

**Dans `supabase_schema_complet.sql` :**
```sql
statut TEXT DEFAULT 'attente' CHECK (statut IN ('confirme','attente','urgent','annule'))
```
→ 5 statuts: `confirme`, `attente`, `urgent`, `annule` (+ `attente` par défaut)

**Dans `src/lib/statuses.js` :**
```javascript
PROGRAMME: 'programmé',
CONFIRME: 'confirmé',
TERMINE: 'terminé',
ANNULE: 'annulé',
```
→ 4 statuts: `programmé`, `confirmé`, `terminé`, `annulé`

#### Conséquences
- ❌ Le statut `urgent` existe en DB mais n'existe pas en frontend
- ❌ Le statut `terminé` existe en frontend mais n'existe pas en DB
- ❌ La DB déclare `attente` (2 mots) mais le frontend utilise `programmé`
- ❌ Les normalisations utilisent des accents (`confirmé`) qui ne matchent pas la DB (`confirme`)
- ⚠️ Les workflows en frontend supposent que `terminé` est un statut valide, mais la DB ne l'accepte pas
- ⚠️ Les données stockées en DB ne respectent pas les constantes frontend

#### Risques
- 🔴 Erreurs de validation en base de données
- 🔴 Impossibilité de terminer un RDV dans le workflow médecin (`MedecinRdv.jsx`)
- 🔴 Données incohérentes entre ce qui est stocké et ce qui est affiché

#### Solution recommandée
```sql
-- METTRE À JOUR LA DB :
ALTER TABLE rendez_vous DROP CONSTRAINT rendez_vous_statut_check;
ALTER TABLE rendez_vous ADD CHECK (
  statut IN ('programmé','confirmé','terminé','annulé')
);
```

---

### 2. **Workflow Médecin — Logique floue et incomplète**

#### Problème
Le workflow dans `MedecinRdv.jsx` suppose un cycle:
```
Programmé → Confirmer → Terminer (+ Absent) → Annuler
```

Mais plusieurs ambiguïtés existent:

| Question | Actuellement | Réponse |
|----------|-------------|---------|
| **Peut-on annuler un RDV terminé?** | Non codé | ❓ Politique métier manquante |
| **Peut-on terminer sans confirmer?** | Non (button disabled) | ✓ Clair |
| **Peut-on confirmer après avoir commencé?** | Oui | ❓ Acceptable? |
| **Peut-on marquer absent si non confirmé?** | Non | ❓ Que faire si patient = absent dès départ? |
| **Status `urgent` — quand l'utiliser?** | ❌ Jamais codé | 🔴 Critère inconnu |
| **Status `attente` — signifie quoi?** | Probablement = `programmé` | ❓ Ambiguïté terminologique |

#### Code problématique
```javascript
// Dans MedecinRdv.jsx, le button Terminer :
disabled={!estConfirme}  // Impossible de terminer si pas confirmé

// Mais la DB accepte:
UPDATE rendez_vous SET statut = 'terminé' WHERE statut = 'attente'
// → Contournement possible en API directe!
```

#### Risques
- 🔴 Sécurité : contournement du workflow via API
- 🔴 Données : RDV marqués `terminé` sans passer par `confirmé`
- 🔴 Reporting : impossibilité de différencier `programmé` vs `attente`

#### Solution recommandée
**Clarifier le workflow métier en documentation :**
```markdown
### Workflow RDV (Machine à états)

1. **PROGRAMMÉ** → État initial après création
   - ✓ Peut passer à: CONFIRMÉ, ANNULÉ
   - ✗ Limites: Aucune

2. **CONFIRMÉ** → Médecin a validé le RDV
   - ✓ Peut passer à: TERMINÉ, ANNULÉ
   - ✗ Limites: Aucune

3. **TERMINÉ** → Consultation finie
   - Données: `patient_present` (true/false)
   - ✓ Peut passer à: ANNULÉ (correction)
   - ✗ Limites: Final (rarement réversible)

4. **ANNULÉ** → Supprimé du planning
   - ✓ Peut revenir à: PROGRAMMÉ (si débug nécessaire)
   - ✗ Limites: État terminal
```

---

### 3. **Champ `patient_present` — Définition incomplète**

#### Problème
Le champ `patient_present` (BOOLEAN) existe en code mais **n'existe pas en DB**.

```javascript
// Dans MedecinRdv.jsx:
const { error } = await supabase
  .from('rendez_vous')
  .update({ statut: 'terminé', patient_present: true })  // ← ERREUR!
  .eq('id', rdv.id)
```

#### Audit de la DB
```sql
-- Dans supabase_schema_complet.sql:
CREATE TABLE IF NOT EXISTS public.rendez_vous (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  medecin_id  UUID REFERENCES public.users_profiles(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  heure       TEXT NOT NULL,
  type_acte   TEXT NOT NULL DEFAULT 'Consultation',
  duree       INTEGER DEFAULT 30,
  statut      TEXT DEFAULT 'attente' CHECK (statut IN ('confirme','attente','urgent','annule')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
  -- ❌ MANQUANT: patient_present BOOLEAN
);
```

#### Risques
- 🔴 **CRITIQUE** : Les UPDATE sur `patient_present` échouent silencieusement
- 🔴 Impossible de savoir si patient était présent ou absent
- 🔴 Reporting de présence/absence non fiable
- 🔴 Dashboard affiche une colonne "Présence" qui ne correspond à rien en BD

#### Solution rapide (Migration)
```sql
ALTER TABLE rendez_vous ADD COLUMN patient_present BOOLEAN DEFAULT NULL;
COMMENT ON COLUMN rendez_vous.patient_present IS 'NULL=non défini, TRUE=présent, FALSE=absent';
```

---

### 4. **Rôles et Permissions — Mapping imprécis**

#### Problème
Le fichier `roles.js` définit les permissions avec des valeurs hétérogènes:

```javascript
PERMISSIONS = {
  rendez_vous: { 
    superadmin: 'crud',      // String: 'crud'
    medecin: 'crud',         // String: 'crud'
    secretaire: 'crud',      // String: 'crud'
    comptable: false,        // Boolean: false
    assistant: 'lecture'     // String: 'lecture'
  },
  stock: { 
    superadmin: 'crud',
    medecin: 'lecture',      // String: 'lecture'
    secretaire: 'crud',
    comptable: false,        // ← Incohérence
    assistant: 'crud'
  }
}
```

#### Ambiguïtés
1. **Types mixtes** : `'crud'`, `'lecture'`, `'complet'`, `'partiel'`, `false` — **11 valeurs différentes**
2. **Sémantique floue** :
   - `false` = pas d'accès? ou seulement `false` littéral?
   - `'complet'` = plus que `'crud'`? Comment?
   - `'partiel'` vs `'lecture'` — quelle différence?

3. **Fonction `canWrite()` ambigu**:
```javascript
function canWrite(role, module) {
  const p = getPermission(role, module)
  return p === 'crud' || p === 'complet' || p === 'config' || p === 'declenche'
}
```
→ Suppose que ces 4 valeurs signifient "peut écrire", mais:
- Pourquoi pas `'crud'` seul?
- Que signifie `'declenche'` pour rapports? (→ Dashboard.jsx utilise une logique personnalisée)

#### Risques
- 🔴 Permissions imprévisibles en cas d'ajout d'un rôle
- 🔴 RLS en base de données **ne reflète pas** ce schéma (voir ci-dessous)
- 🔴 Impossible d'auditer : "Qui peut faire quoi?"

#### Écart Frontend vs Backend (RLS)
```javascript
// frontend/roles.js
ordonnances: { 
  superadmin: 'crud', 
  medecin: 'crud',     // ← Frontend dit "crud"
  secretaire: false,   // ← Frontend dit "non"
}

// supabase_schema_complet.sql
CREATE POLICY "ordonnances_write" ON public.ordonnances 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin'));
-- ✓ Cohérent avec frontend (seul medecin et superadmin)

// Mais:
CREATE POLICY "factures_write" ON public.factures 
  FOR ALL USING (public.get_my_role() IN ('superadmin','secretaire','comptable'));
-- ❌ Comptable peut écrire les factures en DB
-- Mais roles.js dit: comptable: 'crud' (et dashboard utilise 'comptable' comme readonly!)
```

#### Solution recommandée
Standardiser sur un schéma unique et explicite:
```javascript
export const PERMISSIONS = {
  // Valeurs autorisées : 'none', 'read', 'write', 'admin'
  dashboard: { 
    superadmin: 'admin',
    medecin: 'read',
    secretaire: 'read',
    comptable: 'read',
    assistant: 'read'
  },
  
  // ... et simplifier canWrite():
  function canWrite(role, module) {
    const perm = getPermission(role, module)
    return perm === 'write' || perm === 'admin'
  }
}
```

---

### 5. **Statuts des Devis — Cycle de vie mal défini**

#### Problème
Les statuts existent en code mais leur **transition valide n'est pas documentée**.

```javascript
export const DEVIS_STATUS = {
  BROUILLON: 'brouillon',
  ENVOYE: 'envoye',
  ACCEPTE: 'accepte',
  REJETE: 'rejete',
  FACTURISE: 'facturise',
  ANNULE: 'annule',
}
```

#### Questions sans réponse
- ❓ `BROUILLON` → `ACCEPTE` directement (sans `ENVOYE`)? Est-ce valide?
- ❓ `REJETÉ` → `BROUILLON`? Possible?
- ❓ `FACTURISÉ` → `ANNULÉ`? Que se passe-t-il avec la facture?
- ❓ `ENVOYE` → `REJETÉ` → `ENVOYE` à nouveau? Allowed?

#### Risque
- 🔴 Pas de validation d'état : n'importe quelle transition est possible
- 🔴 Données illogiques : devis facturisé + rejeté = ?

#### Solution
Ajouter une matrice de transitions:
```javascript
export const DEVIS_TRANSITIONS = {
  'brouillon':  ['envoye', 'annule'],
  'envoye':     ['accepte', 'rejete', 'annule'],
  'accepte':    ['facturise', 'annule'],
  'rejete':     ['brouillon', 'annule'],
  'facturise':  ['annule'],  // Rare, nécessite approbation
  'annule':     []           // Terminal
}
```

---

### 6. **Workflow Rappels SMS — Timing ambigu**

#### Problème
La config des rappels a un champ `delai_heures` mais son usage est **ambigu**.

```sql
INSERT INTO public.rappels_config (delai_heures) VALUES (2)
```

**Question critique :** 2 heures = **avant ou après**?

Code dans la cronjob (schéma):
```sql
SELECT cron.schedule('rappels-rdv-toutes-heures', '0 * * * *', ...)
-- Exécute toutes les heures, mais le calcul du "2 heures avant" n'est pas visible
```

#### Ambiguïté dans `send-rappel-rdv` Edge Function
Le code n'est pas fourni, donc on suppose:
- ✓ Supposé: "Envoyer SMS 2 heures AVANT le RDV"
- ❓ Mais si RDV est à 14h00, on l'envoie à 12h00?
- ❓ Et si RDV est demain à 10h00, on l'envoie chaque heure jusqu'à demain 8h00?

#### Risques
- 🔴 SMS envoyés à mauvaise heure
- 🔴 SMS dupliqués (rappel envoyé à chaque cronjob)
- 🔴 SMS jamais envoyés (timing oublié)

#### Solution
Clarifier la config:
```sql
-- Meilleure sémantique:
ALTER TABLE rappels_config RENAME COLUMN delai_heures TO delai_avant_rdv_heures;

-- Et ajouter un flag:
ALTER TABLE rappels_config ADD COLUMN si_aucun_rappel_envoye BOOLEAN DEFAULT true;
-- Signifie: "n'envoyer qu'une seule fois, pas à chaque cronjob"
```

---

### 7. **Colonnes manquantes en BD — Découverte à l'exécution**

#### Problème
Plusieurs colonnes utilisées en frontend n'existent pas en DB:

| Colonne | Utilisée où | Existe en BD? | Statut |
|---------|-------------|-------------|--------|
| `patient_present` | `MedecinRdv.jsx` | ❌ NON | UPDATE échoue silencieusement |
| `medecin_id` | `RendezVous.jsx` | ✓ OUI | - |
| `type_acte` | Partout | ✓ OUI | - |
| `duree` | Dashboard, tables | ✓ OUI | - |

#### Audit détaillé
```javascript
// MedecinRdv.jsx:124-126
update({ statut: 'terminé', patient_present: true })
// ← patient_present n'existe pas en DB → UPDATE échoue

// Dashboard.jsx:142
r.patient_present === true ? (...) : r.patient_present === false ? (...)
// ← Lit patient_present qui ne peut jamais être définit → Jamais true/false
```

#### Risques
- 🔴 **CRITIQUE** : L'appel UPDATE échoue silencieusement (pas d'erreur affichée)
- 🔴 Patient marqué `terminé` mais pas `patient_present` = absence de feedback
- 🔴 Notifications ne passent jamais (voir Dashboard)

#### Solution
Migration urgente:
```sql
ALTER TABLE rendez_vous ADD COLUMN IF NOT EXISTS patient_present BOOLEAN;
CREATE INDEX idx_rendez_vous_patient_present ON rendez_vous(patient_present) 
WHERE patient_present IS NOT NULL;
```

---

### 8. **Normalisations de statuts — Logique incohérente**

#### Problème
Le fichier `statuses.js` normalise différemment selon le type:

```javascript
export function normalizeRdvStatus(statut) {
  const value = normalizeText(statut)
  if (value === 'confirme') return RDV_STATUS.CONFIRME    // ← 'confirme' (DB)
  if (value === 'termine') return RDV_STATUS.TERMINE      // ← 'termine' 
  // mais RDV_STATUS.TERMINE = 'terminé' (avec accent!)
  if (value === 'annule') return RDV_STATUS.ANNULE        // ← 'annule' (DB) vs 'annulé' (const)
  return RDV_STATUS.PROGRAMME                              // ← Default = 'programmé'
}
```

#### Le problème
```javascript
// Entrée DB: 'confirme' (accords en DB: pas d'accents)
normalizeText('confirme') → 'confirme'
if (value === 'confirme') return 'confirmé'  // ← Retourne 'confirmé' (avec accent!)

// Mais la DB stocke 'confirme' (sans accent)
// Donc: DB renvoie 'confirme' → convertit en 'confirmé' → compare avec 'confirmé' ✓
// Mais: comparaison ultérieure avec statut === 'confirmé' ← RISQUE !
```

#### Risques
- 🔴 Si DB contient `'Confirme'` (majuscule), la normalisation peut échouer
- 🔴 Les accents ne sont pas systématiquement gérés
- 🔴 Comparaisons ailleurs (`r.statut === 'confirm'`) fonctionnent rarement

#### Solution
Standardiser:
```javascript
// Option 1: TOUT en accents (recommandé pour l'UX)
export const RDV_STATUS = {
  PROGRAMME: 'programmé',
  CONFIRME: 'confirmé',
  TERMINE: 'terminé',
  ANNULE: 'annulé',
}

// ET mettre à jour la BD:
ALTER TABLE rendez_vous DROP CONSTRAINT ...;
ALTER TABLE rendez_vous ADD CHECK (
  statut IN ('programmé', 'confirmé', 'terminé', 'annulé')
);

// Option 2: TOUT sans accents (plus robuste)
// ... mais pénaliser l'UX
```

---

## 🟡 AMBIGUÏTÉS MINEURES

### 9. **Rôle "Médecin" — Permissions en lecture sur Facturation**

```javascript
facturation: { 
  superadmin: 'crud',
  medecin: 'lecture',      // ← Peut LIRE les factures
  secretaire: 'crud',
  comptable: 'crud',
}
```

**Question** : Pourquoi un médecin doit voir les factures? 
- ✓ Pour voir ses actes facturisés?
- ✗ Pour modifier des tarifs? (non, il a `lecture`)

**Risque** : Ambigu, mais pas critique.

---

### 10. **Assistant Dentaire — Permissions étendues sur Stock**

```javascript
stock: { 
  assistant: 'crud'  // ← Full CRUD sur le stock
}
```

**Question** : Un assistant peut **supprimer** des items du stock? Ou modifier des prix?

**Recommandation** : Spécifier en documentation métier.

---

### 11. **Format du numéro de téléphone**

Utilisé partout pour les SMS, mais:
- ❓ Format accepté : `+237 6XX XXX XXX`? Ou `6XX XXX XXX`?
- ❓ Validation : où?
- ❓ Stockage : normaliser? (ex: toujours `+237...`)

Voir `src/utils/phone.js` pour les détails.

---

## 📊 Tableau récapitulatif des priorités

| # | Ambiguïté | Sévérité | Affectés | Action |
|---|-----------|----------|----------|--------|
| 1 | Statuts RDV (DB vs frontend) | 🔴 CRITIQUE | Tous | Align BD + frontend |
| 2 | Workflow médecin mal documenté | 🔴 CRITIQUE | Médecins | Documenter machine à états |
| 3 | Colonne `patient_present` manquante | 🔴 CRITIQUE | MedecinRdv | Migration BD urgente |
| 4 | Permissions hétérogènes | 🟠 HAUTE | Sécurité | Refactor `roles.js` |
| 5 | Cycle de vie Devis obscur | 🟠 HAUTE | Facturation | Documenter transitions |
| 6 | Timing rappels SMS ambigu | 🟠 HAUTE | Rappels | Clarifier config |
| 7 | Normalisations incohérentes | 🟠 HAUTE | Frontend | Standardiser format |
| 8 | Écarts RLS vs frontend | 🟡 MOYEN | Sécurité | Audit complet |
| 9 | Permissions médecin/facturation | 🟡 MOYEN | UX | Clarifier métier |
| 10 | Assistant stock CRUD | 🟡 MOYEN | Métier | Définir limites |
| 11 | Format téléphone | 🟡 MOYEN | SMS | Normaliser utils |

---

## ✅ Actions recommandées (Priorité)

### Phase 1 (URGENT — 1-2 jours)
1. ✅ Synchroniser statuts RDV entre BD et frontend
2. ✅ Ajouter colonne `patient_present` en BD
3. ✅ Tester l'UPDATE de `patient_present` en MedecinRdv

### Phase 2 (COURT TERME — 3-5 jours)
4. ✅ Documenter la machine à états RDV
5. ✅ Refactor le schéma de permissions
6. ✅ Valider l'alignement RLS/frontend

### Phase 3 (MOYEN TERME — 1-2 semaines)
7. ✅ Documenter cycle de vie Devis
8. ✅ Clarifier config SMS + tester timing
9. ✅ Standardiser normalisations de statuts

---

## 📝 Template de correction par ambiguïté

Pour chaque ambiguïté, appliquer:
1. **Identifier** : Quelle est la vraie règle métier?
2. **Documenter** : Où? (dans code, BD, README)
3. **Implémenter** : Frontend + Backend
4. **Tester** : Cas aux limites
5. **Valider** : Avec métier (Dr. Boutchouang?)

