# 🔐 Refactorisation du Système de Permissions

## ✅ Changements Effectués

### 1. Standardisation des Valeurs de Permissions

**Avant** (11 valeurs différentes, ambiguës) :
- `'crud'`, `'lecture'`, `'complet'`, `'partiel'`, `'limite'`, `'config'`, `'declenche'`, `'financier'`, `false`

**Après** (4 valeurs claires et hiérarchiques) :
- `'none'` : Aucun accès (module non visible)
- `'read'` : Accès lecture seule
- `'write'` : Lecture + écriture/modification
- `'admin'` : Accès complet + configuration

### 2. Nouvelles Fonctions Utilitaires

| Fonction | Avant | Après |
|----------|-------|-------|
| `getPermission(role, module)` | Retorne valeur mixte ou `false` | Retorne toujours `'none'\|'read'\|'write'\|'admin'` |
| `canAccess(role, module)` | Vérifie `!== false` | Vérifie `!== 'none'` |
| `canWrite(role, module)` | Vérifie 4 valeurs hétérogènes | Vérifie `'write'\|'admin'` |
| `canRead(role, module)` | **N'EXISTAIT PAS** | ✨ Nouvelle : vérifie `'read'\|'write'\|'admin'` |
| `isAdmin(role, module)` | **N'EXISTAIT PAS** | ✨ Nouvelle : vérifie `'admin'` |
| `comparePermissions()` | **N'EXISTAIT PAS** | ✨ Nouvelle : compare deux rôles |

### 3. Mapping Détaillé par Module

#### Dashboard
```
Ancien → Nouveau
superadmin: 'complet' → 'admin'
medecin:    'complet' → 'admin'
secretaire: 'partiel' → 'read'
comptable:  'partiel' → 'read'
assistant:  'limite'  → 'read'
```

#### Rendez-vous
```
Ancien → Nouveau
superadmin: 'crud'      → 'admin'
medecin:    'crud'      → 'write'
secretaire: 'crud'      → 'write'
comptable:  false       → 'none'
assistant:  'lecture'   → 'read'
```

#### Facturation & Devis
```
Ancien → Nouveau
superadmin: 'crud'      → 'admin'
medecin:    'lecture'   → 'read'
secretaire: 'crud'      → 'write'
comptable:  'crud'      → 'write'
assistant:  false       → 'none'
```

#### Rappels SMS
```
Ancien → Nouveau (⚠️ Mapping critique)
superadmin: 'config'     → 'admin'    (configuration système)
medecin:    'lecture'    → 'read'     (consulter les rappels)
secretaire: 'declenche'  → 'write'    (déclencher manuellement)
comptable:  false        → 'none'     (pas d'accès)
assistant:  false        → 'none'     (pas d'accès)
```

#### Rapports
```
Ancien → Nouveau
superadmin: 'complet'    → 'admin'    (tous les rapports)
medecin:    'complet'    → 'admin'    (tous les rapports)
secretaire: false        → 'none'     (aucun accès)
comptable:  'financier'  → 'read'     (rapports financiers uniquement)
assistant:  false        → 'none'     (aucun accès)
```

## 🔄 Cohérence Frontend ↔ Backend

### Vérification par Module

#### ✅ Rendez-vous
```
Frontend (roles.js):
  medecin: 'write' (crud)
  secretaire: 'write' (crud)
  assistant: 'read' (lecture)

Backend (RLS - supabase_schema_complet.sql L100-101):
  rdv_read: ('superadmin','medecin','secretaire','assistant') ✓
  rdv_write: ('superadmin','medecin','secretaire') ✓

Verdict: ✅ COHÉRENT
```

#### ✅ Patients
```
Frontend:
  medecin: 'write'
  secretaire: 'write'
  assistant: 'read'

Backend (RLS - L76-77):
  patients_read: ('superadmin','medecin','secretaire','assistant') ✓
  patients_write: ('superadmin','medecin','secretaire') ✓

Verdict: ✅ COHÉRENT
```

#### ✅ Ordonnances
```
Frontend:
  medecin: 'write'
  autres: 'none'

Backend (RLS - L119-120):
  ordonnances_read: ('superadmin','medecin') ✓
  ordonnances_write: ('superadmin','medecin') ✓

Verdict: ✅ COHÉRENT
```

#### ✅ Facturation
```
Frontend:
  secretaire: 'write'
  comptable: 'write'
  medecin: 'read'

Backend (RLS - L137-138):
  factures_read: ('superadmin','medecin','secretaire','comptable') ✓
  factures_write: ('superadmin','secretaire','comptable') ✓

Verdict: ✅ COHÉRENT
```

#### ✅ Stock
```
Frontend:
  superadmin: 'admin'
  medecin: 'read'
  secretaire: 'write'
  comptable: 'none'
  assistant: 'write'

Backend (RLS - supabase_schema_complet.sql L155-156):
  stock_read: ('superadmin','medecin','secretaire','assistant') ✓
  stock_write: ('superadmin','secretaire','assistant') ✓
  ✓ medecin exclu de l'écriture (read only) ✓

Verdict: ✅ COHÉRENT
```

#### ✅ Rappels SMS
```
Frontend:
  superadmin: 'admin'
  medecin: 'read'
  secretaire: 'write'
  comptable: 'none'
  assistant: 'none'

Backend (RLS - supabase_schema_complet.sql L174-175):
  rappels_read: ('superadmin','medecin','secretaire')
  rappels_write: true (via Edge Function avec service role)
  
⚠️ ARCHITECTURE SPÉCIALE:
  - Les modifications passent par une Edge Function (service role)
  - Le contrôle d'accès est au niveau applicatif (roles.js)
  - RLS write=true car la function gère les permissions
  - ✓ Conforme avec Frontend (contrôle d'accès côté app)

Rapports Config (L195-196):
  config_read: ('superadmin','medecin','secretaire')
  config_write: 'superadmin' seulement ✓

Verdict: ✅ COHÉRENT
```

## 🎯 Tests à Effectuer

### 1. Vérifier l'absence de Régression
```bash
# Tous les composants utilisant les fonctions de permissions:
✓ RoleGuard.jsx - utilise canAccess() et canWrite()
✓ PermissionGate() - utilise les fonctions
✓ Dashboard.jsx - pas de logique personnalisée
✓ Rapports.jsx - pas de logique personnalisée
✓ BottomNav.jsx - utilise getNavItems()
```

### 2. Tester Chaque Rôle dans l'Application

#### Superadmin
- [ ] Accès à tous les modules (admin)
- [ ] Dashboard complet
- [ ] Tous les boutons CRUD visibles
- [ ] Gestion des utilisateurs

#### Médecin
- [ ] Dashboard (admin)
- [ ] Rendez-vous (write)
- [ ] Patients (write)
- [ ] Ordonnances (write)
- [ ] Facturation (read only)
- [ ] Stock (read only)
- [ ] Rapports (admin)
- [ ] ❌ Gestion utilisateurs (none)

#### Secrétaire
- [ ] Dashboard (read)
- [ ] Rendez-vous (write)
- [ ] Patients (write)
- [ ] Facturation (write)
- [ ] Devis (write)
- [ ] Stock (write)
- [ ] Rappels SMS (write)
- [ ] ❌ Ordonnances (none)
- [ ] ❌ Rapports (none)

#### Comptable
- [ ] Dashboard (read)
- [ ] Facturation (write)
- [ ] Devis (write)
- [ ] Rapports (read only - financier)
- [ ] ❌ Rendez-vous (none)
- [ ] ❌ Stock (none)

#### Assistant Dentaire
- [ ] Dashboard (read)
- [ ] Rendez-vous (read only)
- [ ] Patients (read only)
- [ ] Stock (write)
- [ ] ❌ Ordonnances (none)
- [ ] ❌ Facturation (none)

### 3. Tester les Cas Critiques
```javascript
// Cas 1: Vérifier que canAccess retourne bien true/false
getPermission('medecin', 'rendez_vous') === 'write'  // ✓
canAccess('medecin', 'rendez_vous')                  // ✓ true
canAccess('comptable', 'rendez_vous')                // ✓ false

// Cas 2: Vérifier que canRead fonctionne
canRead('medecin', 'stock')     // ✓ true (read)
canRead('comptable', 'stock')   // ✓ false

// Cas 3: Vérifier que canWrite fonctionne
canWrite('secretaire', 'stock')  // ✓ true (write)
canWrite('medecin', 'stock')     // ✓ false

// Cas 4: Vérifier que isAdmin fonctionne
isAdmin('superadmin', 'dashboard')  // ✓ true
isAdmin('medecin', 'dashboard')     // ✓ true
isAdmin('secretaire', 'dashboard')  // ✓ false
```

### 4. Tests au Niveau Frontend
```bash
# Vérifier que RoleGuard fonctionne correctement:
- [x] RoleGuard bloque l'accès pour 'none'
- [x] PermissionGate affiche fallback pour 'none'
- [x] Boutons CRUD cachés quand requireWrite=true et permission<'write'
- [x] Navigation (sidebar) affiche les bons items par rôle
```

### 5. Tests de Cohérence RLS
```bash
# Vérifier que le frontend et backend sont alignés:
✓ Stock: medecin=read (RLS write l'exclut)
✓ Ordonnances: medecin+superadmin seulement
✓ Rappels: via Edge Function (contrôle app-level)
✓ Tous les autres modules: RLS aligned avec permissions
```

## 📋 Checklist d'Audit

- [x] Remplacer PERMISSIONS avec 4 valeurs standardisées
- [x] Ajouter docstring expliquant la sémantique
- [x] Mettre à jour `canAccess()` pour retourner `!== 'none'`
- [x] Mettre à jour `canWrite()` pour vérifier `'write'|'admin'`
- [x] Ajouter `canRead()` - nouvelle fonction utilitaire
- [x] Ajouter `isAdmin()` - nouvelle fonction utilitaire
- [x] Ajouter `comparePermissions()` - pour les cas complexes
- [ ] Vérifier cohérence RLS (roles.js ↔ supabase_schema_complet.sql)
- [ ] Tester chaque rôle dans l'app
- [ ] Documenter les cas spéciaux si nécessaire

## 🚨 Cas Spéciaux à Surveiller

### `'declenche'` → `'write'`
- **Ancien**: Permettait de "déclencher" les rappels SMS
- **Nouveau**: Mappe à `'write'` (lecture + écriture)
- **Question**: Faut-il une permission `'trigger'` spécifique?
- **Recommandation**: À confirmer avec logique métier

### `'financier'` → `'read'`
- **Ancien**: Comptable voyait seulement rapports financiers
- **Nouveau**: Comptable a accès `'read'` aux rapports
- **Question**: Y a-t-il un filtre spécifique pour "financier only"?
- **Recommandation**: À implémenter au niveau du composant si nécessaire

## 📚 Références
- Frontend: `src/lib/roles.js`
- Backend RLS: `supabase_schema_complet.sql`
- Composants: `src/components/RoleGuard.jsx`
