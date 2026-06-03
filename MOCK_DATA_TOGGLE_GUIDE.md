# 🔄 Guide : Basculer entre Données Mock et Données Réelles

## 📋 Vue d'ensemble

SMILE dispose maintenant d'un système permettant de basculer facilement entre:
- **Données Mock** : 36 factures de test (Jan-Jun 2026) avec revenus 440k-540k FCFA/mois
- **Données Réelles** : Données réelles du cabinet

## 🚀 Installation

### 1️⃣ Exécuter la migration SQL

1. Accédez à **Supabase → SQL Editor**
2. Créez une nouvelle requête
3. Collez le contenu de `supabase_mock_data_setup.sql`
4. Cliquez **Exécuter**

Cette migration:
- ✓ Crée la table `app_config` (configuration globale)
- ✓ Crée la table `factures_mock` (données test)
- ✓ Insère 36 factures mock avec 5 patients
- ✓ Configure le mode par défaut sur "données réelles"

### 2️⃣ Vérifier l'installation

Exécutez cette requête pour confirmer:
```sql
SELECT * FROM public.app_config WHERE key = 'use_mock_data';
```

Résultat attendu:
```
| id | key             | value | description                                 |
|----|-----------------|-------|---------------------------------------------|
| 1  | use_mock_data   | false | true = données mock, false = données réelles |
```

## 🎮 Utilisation

### Accéder aux Paramètres Admin

1. **Connectez-vous en tant que Superadmin**
2. Dans le menu latéral, cliquez sur **"Paramètres Admin"** (en bas)
3. Vous verrez la section "Données des rapports"

### Basculer les données

**Bouton de bascule :**
```
[Basculer vers DONNÉES RÉELLES] ← si en mode mock
[Basculer vers DONNÉES MOCK]    ← si en mode réel
```

Cliquez pour changer de mode. Le changement s'applique **immédiatement** aux rapports.

### État actuel

L'interface affiche:
```
Mode actuel: [DONNÉES MOCK] ou [DONNÉES RÉELLES]
```

Les rapports affichent le symbole correspondant:
- 🔵 Données Mock
- 🟢 Données Réelles

## 📊 Données Mock Disponibles

**Période:** Janvier - Juin 2026  
**Total:** 36 factures réparties sur 6 mois

| Mois  | Factures | Revenus       | Statuts       |
|-------|----------|---------------|---------------|
| Jan   | 6        | 440 000 FCFA  | 5 payés, 1 attente |
| Fév   | 6        | 490 000 FCFA  | 6 payés       |
| Mar   | 6        | 490 000 FCFA  | 5 payés, 1 attente |
| Avr   | 6        | 540 000 FCFA  | 6 payés       |
| Mai   | 6        | 500 000 FCFA  | 5 payés, 1 attente |
| Jun   | 6        | 540 000 FCFA  | 6 payés       |

**Actes inclus:**
- Consultation (25k FCFA)
- Détartrage (45k FCFA)
- Extraction (80k FCFA)
- Implant (250-320k FCFA)
- Radiographie (15k FCFA)
- Urgence (50-60k FCFA)

**Patients utilisés:** Les 5 premiers patients de votre base de données

## 💡 Cas d'usage

### ✅ Utiliser les données Mock pour:
- 📸 Prendre des captures d'écran pour les présentations
- 🎓 Montrer des exemples au client
- 🧪 Tester les graphiques sans données réelles
- 📱 Démonstration de l'application

### ✅ Utiliser les données Réelles pour:
- 📈 Suivre l'activité réelle du cabinet
- 📊 Générer les rapports de gestion
- 💰 Analyser les revenus
- 🎯 Suivre les objectifs mensuels

## 🔧 Configuration Technique

### Architecture

```
app_config (table)
├── key: 'use_mock_data'
├── value: 'true' ou 'false'
└── description: texte

↓ lu par

useAppConfig('use_mock_data')
(hook React)

↓ utilisé par

useFactures()
├─ Si true  → SELECT FROM factures_mock
└─ Si false → SELECT FROM factures
```

### Hook React

```javascript
import { useAppConfig } from '@/hooks/useAppConfig'

// Dans votre composant:
const { value: useMockData, updateConfig } = useAppConfig('use_mock_data', 'false')

// Changer le mode:
await updateConfig('true')  // Mode mock
await updateConfig('false') // Mode réel

// Vérifier le mode:
if (useMockData === 'true') {
  console.log('Mode mock activé')
}
```

### Souscription Real-Time

Le hook inclut une souscription real-time à Supabase:
- Les changements de configuration s'appliquent **instantanément**
- Aucun rechargement de page nécessaire
- Tous les composants utilisant `useFactures()` se mettent à jour automatiquement

## 📍 Fichiers Modifiés

| Fichier | Changement |
|---------|-----------|
| `supabase_mock_data_setup.sql` | Migration : tables + données |
| `src/hooks/useAppConfig.js` | **Nouveau** : Hook config |
| `src/hooks/useFactures.js` | Modifié : utilise `useAppConfig` |
| `src/pages/AdminSettings.jsx` | **Nouveau** : Page paramètres |
| `src/App.jsx` | Modifié : route `/admin-settings` |
| `src/lib/roles.js` | Modifié : nav item admin settings |

## ⚠️ Important

### Permissions

Seuls les **Superadmins** peuvent accéder à la page Paramètres Admin et changer le mode.

### Données Mock Persistantes

Les données mock restent dans la base de données même si vous basculez en mode réel.
- Pour les effacer : `DELETE FROM factures_mock;` dans SQL Editor
- Pour les réinsérer : réexécutez `supabase_mock_data_setup.sql`

### Pas d'impact sur les vraies données

Le basculement n'affecte **jamais** la table `factures` réelle.
- Mode mock = lit `factures_mock`
- Mode réel = lit `factures`

## 🆘 Dépannage

### Les données mock ne s'affichent pas

1. Vérifiez que la table `factures_mock` contient des données:
   ```sql
   SELECT COUNT(*) FROM factures_mock;
   ```
   Résultat attendu: `36 lignes`

2. Vérifiez le mode actuel:
   ```sql
   SELECT value FROM app_config WHERE key = 'use_mock_data';
   ```
   Résultat attendu: `true`

3. Rafraîchissez l'application (Ctrl+F5)

### Les données réelles disparaissent

Ne vous inquiétez pas! Elles sont toujours dans `factures`:
```sql
SELECT COUNT(*) FROM factures;
```

Basculez simplement en mode réel depuis l'interface Admin.

### Erreur de permission

Assurez-vous d'être connecté en tant que **Superadmin**.
Demandez à votre administrateur d'exécuter:
```sql
UPDATE users_profiles 
SET role = 'superadmin' 
WHERE email = 'votre-email@cabinet.cm';
```

## 🎉 Prêt à utiliser!

Le système est installé et fonctionnel. Allez à **Paramètres Admin** pour basculer entre les données!
