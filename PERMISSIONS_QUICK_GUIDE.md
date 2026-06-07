# 🎯 Guide Rapide: Système de Permissions Standardisé

## 📌 Les 4 Niveaux de Permission

```javascript
import { canAccess, canRead, canWrite, isAdmin } from '../lib/roles'

// Hiérarchie (du moins au plus permissif):
// none (0) < read (1) < write (2) < admin (3)

'none'   // Aucun accès, module non visible
'read'   // Lecture seule
'write'  // Lecture + modification/création
'admin'  // Accès complet + configuration
```

## 🔍 Utiliser les Permissions dans le Code

### 1. Vérifier l'Accès Basique
```javascript
import { canAccess } from '../lib/roles'
import { useAuthContext } from '../hooks/AuthContext'

function MyComponent() {
  const { role } = useAuthContext()
  
  if (!canAccess(role, 'patients')) {
    return <AccessDenied />
  }
  
  return <PatientList />
}
```

### 2. Vérifier si on peut Écrire
```javascript
import { canWrite } from '../lib/roles'

function PatientForm() {
  const { role } = useAuthContext()
  
  if (!canWrite(role, 'patients')) {
    return <div>Lecture seule</div>
  }
  
  return <form>{/* form fields */}</form>
}
```

### 3. Utiliser RoleGuard (Component de Protection)
```javascript
import { RoleGuard } from '../components/RoleGuard'

// Protéger avec accès basique
<RoleGuard module="patients">
  <PatientList />
</RoleGuard>

// Protéger avec accès écriture
<RoleGuard module="patients" requireWrite>
  <PatientForm />
</RoleGuard>
```

### 4. Utiliser PermissionGate (Alternative légère)
```javascript
import { PermissionGate } from '../components/RoleGuard'

<PermissionGate module="patients">
  <button>Ajouter patient</button>
</PermissionGate>

// Avec fallback personnalisé
<PermissionGate 
  module="patients" 
  requireWrite
  fallback={<p>Vous n'avez pas les permissions</p>}
>
  <button>Modifier patient</button>
</PermissionGate>
```

### 5. Autres Fonctions Utilitaires
```javascript
import { canRead, isAdmin, getPermission } from '../lib/roles'

// Vérifier lecture seule
if (canRead(role, 'stock')) {
  // Montrer les données en lecture seule
}

// Vérifier accès admin
if (isAdmin(role, 'dashboard')) {
  // Montrer la configuration complète
}

// Obtenir le niveau exact
const perm = getPermission('medecin', 'stock')
// Retourne: 'read' | 'write' | 'admin' | 'none'
```

## 📋 Matrice de Permissions

### Par Module
| Module | Superadm | Médecin | Secrétaire | Comptable | Assistant |
|--------|----------|---------|-----------|-----------|-----------|
| Dashboard | admin | admin | read | read | read |
| Rendez-vous | admin | write | write | ❌ | read |
| Patients | admin | write | write | ❌ | read |
| Ordonnances | admin | write | ❌ | ❌ | ❌ |
| Facturation | admin | read | write | write | ❌ |
| Stock | admin | read | write | ❌ | write |
| Rapports | admin | admin | ❌ | read | ❌ |
| Rappels | admin | read | write | ❌ | ❌ |
| Gestion Users | admin | ❌ | ❌ | ❌ | ❌ |

### Par Rôle
```
Superadmin
├── Accès: tous les modules (admin)
├── Cas: créer users, configurer système

Médecin
├── Accès: dashboard, RDV, patients, ordonnances, stock(read)
├── Non: facturation management, user management
├── Cas: gérer ses RDV et patients

Secrétaire
├── Accès: dashboard, RDV, patients, facturation, stock, rappels
├── Non: ordonnances, rapports, user management
├── Cas: gérer l'agenda et les patients

Comptable
├── Accès: dashboard(read), facturation, devis, rapports(read)
├── Non: RDV, patients, ordonnances
├── Cas: gérer les finances

Assistant
├── Accès: dashboard(read), RDV(read), patients(read), stock(write)
├── Non: ordonnances, facturation, rapports
├── Cas: consulter infos et gérer stock
```

## 🚫 Pièges à Éviter

### ❌ Ne PAS faire
```javascript
// ❌ Vérifier si === 'crud' (valeur ancienne)
if (getPermission(role, 'patients') === 'crud') {
  // Ça ne fonctionne plus!
}

// ❌ Supposer false = pas d'accès (utiliser 'none')
if (getPermission(role, 'module') === false) {
  // Ça ne retourne plus false, retourne 'none'
}

// ❌ Mélanger les anciennes valeurs
if (perm === 'complet' || perm === 'lecture') {
  // Utilisez canRead() ou canWrite() à la place
}
```

### ✅ FAIRE plutôt
```javascript
// ✅ Utiliser les fonctions helpers
if (canRead(role, 'patients')) {
  // Montrer les données
}

if (canWrite(role, 'patients')) {
  // Montrer les formulaires
}

// ✅ Vérifier directement la valeur nouvelle
if (getPermission(role, 'module') === 'admin') {
  // Montrer configuration avancée
}

// ✅ Utiliser RoleGuard pour protéger les composants
<RoleGuard module="patients" requireWrite>
  <PatientForm />
</RoleGuard>
```

## 🔧 Ajouter une Nouvelle Permission

### Étape 1: Ajouter au PERMISSIONS object
```javascript
// src/lib/roles.js
export const PERMISSIONS = {
  // ... autres modules
  
  // Nouveau module
  new_feature: {
    superadmin: 'admin',
    medecin: 'write',
    secretaire: 'read',
    comptable: 'none',
    assistant: 'none'
  },
}
```

### Étape 2: Créer une RLS policy en DB
```sql
-- supabase_schema_complet.sql
CREATE POLICY "new_feature_read" ON public.new_feature 
  FOR SELECT USING (public.get_my_role() IN ('superadmin', 'medecin', 'secretaire'));

CREATE POLICY "new_feature_write" ON public.new_feature 
  FOR ALL USING (public.get_my_role() IN ('superadmin', 'medecin'));
```

### Étape 3: Ajouter à la navigation (optionnel)
```javascript
// src/lib/roles.js
export function getNavItems(role) {
  const all = [
    // ... items existants
    { path: '/new-feature', label: 'Nouvelle Fonctionnalité', module: 'new_feature', icon: 'star' },
  ]
  return all.filter(item => canAccess(role, item.module))
}
```

### Étape 4: Utiliser dans le composant
```javascript
// src/pages/NewFeature.jsx
import { RoleGuard } from '../components/RoleGuard'

export default function NewFeature() {
  return (
    <RoleGuard module="new_feature">
      {/* contenu protégé */}
    </RoleGuard>
  )
}
```

### Étape 5: Valider avec l'audit
```bash
node audit-permissions.js
# S'assurer que le nouveau module apparaît dans le rapport
```

## 📊 Audit et Validation

### Exécuter l'Audit
```bash
node audit-permissions.js
```

Cela vérifie:
- ✅ Tous les modules et rôles sont présents
- ✅ Hiérarchie des permissions
- ✅ Logique métier cohérente
- ✅ Distribution équilibrée
- ✅ Alignement RLS ↔ Frontend

### Lire le Rapport de Distribution
```
Distribution par niveau:
  ADMIN : 13 (24%)   ← Fonctionnalités critiques
  WRITE : 13 (24%)   ← Création/modification
  READ  : 10 (18%)   ← Consultation
  NONE  : 19 (35%)   ← Pas d'accès

Accès par rôle:
  superadmin  : 11/11 modules (admin everywhere)
  medecin     : 10/11 modules (high access)
  secretaire  :  7/11 modules
  comptable   :  4/11 modules
  assistant   :  4/11 modules
```

## 🧠 Comprendre la Hiérarchie

```
none  (0)  → Pas d'accès du tout
                  ↓
read  (1)  → Peut lire les données
                  ↓
write (2)  → Peut lire ET modifier
                  ↓
admin (3)  → Peut tout faire + configuration
```

### Implications Pratiques
```javascript
const LEVEL = { none: 0, read: 1, write: 2, admin: 3 }

// 'write' implique 'read' (sinon comment modifier?)
// 'admin' implique 'write' et 'read'

// Donc:
canRead(role, 'stock')  // true si write ou admin aussi
canWrite(role, 'stock') // false si seulement read
```

## 📞 Questions Fréquentes

### Q: Comment savoir si un utilisateur peut modifier?
```javascript
// Utiliser canWrite()
if (canWrite(role, 'patients')) {
  // Montrer les boutons modifier/supprimer
}
```

### Q: Quel rôle peut faire quoi?
```javascript
// Consulter la matrice ci-dessus ou:
import { getPermission } from '../lib/roles'

const perm = getPermission('medecin', 'facturation')
// Retourne: 'read' (lecture seule)
```

### Q: Comment ajouter une nouvelle permission?
```
Voir section "Ajouter une Nouvelle Permission" ci-dessus
```

### Q: Le système RLS en DB doit-il matcher?
```
OUI! L'audit vérifie l'alignement entre le frontend et la RLS.
Si vous modifiez les permissions, mettez à jour la RLS aussi.
```

### Q: Où trouver la documentation complète?
```
- PERMISSIONS_REFACTORING.md  : refactoring détaillé
- REFACTORING_SUMMARY.md      : résumé et checklist
- src/lib/roles.js            : code source
- audit-permissions.js        : audit automatisé
```

---

**Guide Version**: 1.0
**Statut**: ✅ Documentation complète et validée
**Dernière mise à jour**: 2026-06-04
