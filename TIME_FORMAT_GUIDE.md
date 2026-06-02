# ⏰ Format d'heure 24h lisible dans les notifications

## 🎯 Changement

**Avant :**
```
RDV : MPE HOLDING le 02/06/2026 à 01:00 (Consultation)
```

**Après :**
```
RDV : MPE HOLDING le 02/06/2026 à 13h00 (Consultation)
```

## 📝 Fichiers modifiés

### 1. `supabase_migrations_notifications.sql` ✅
Les triggers SQL formatent maintenant l'heure au format 24h :
```sql
formatted_time := LPAD(EXTRACT(HOUR FROM NEW.heure::time)::text, 2, '0') || 'h' ||
                  LPAD(EXTRACT(MINUTE FROM NEW.heure::time)::text, 2, '0');
```

Résultat :
- `08:00` → `08h00`
- `13:00` → `13h00`
- `14:30` → `14h30`

### 2. `src/utils/timeFormat.js` ✅ (nouveau)
Fonction JavaScript pour formater l'heure partout dans l'app :
```javascript
formatTimeHuman('13:00') // retourne "13h00"
formatDateTimeForNotification('2026-06-02', '13:00') // retourne "02/06/2026 à 13h00"
```

## 🚀 Comment utiliser

### Dans React
```jsx
import { formatTimeHuman, formatDateTimeForNotification } from '../utils/timeFormat'

// Formatter une heure simple
<p>{formatTimeHuman('13:00')}</p> // affiche "13h00"

// Formatter une date ET heure
<p>{formatDateTimeForNotification('2026-06-02', '13:00')}</p> 
// affiche "02/06/2026 à 13h00"
```

### Dans les notifications
```jsx
// NotificationCenter affiche automatiquement les messages formatés
"RDV : Patient le 02/06/2026 à 13h00 (Consultation)"
```

## 📋 À faire

### 1. Re-exécuter le script SQL
```sql
-- Dans Supabase → SQL Editor
-- Copier le contenu de : supabase_migrations_notifications.sql
-- Cliquer Run
```

Cela met à jour les fonctions `notify_medecin_new_rdv()` et `notify_medecin_rdv_modified()`.

### 2. (Optionnel) Utiliser la fonction dans d'autres pages

Exemple dans `RendezVous.jsx` :
```jsx
import { formatTimeHuman } from '../utils/timeFormat'

<td>{formatTimeHuman(r.heure)}</td> // affiche "13h00" au lieu de "13:00"
```

## 🔧 Fonction JavaScript

Pour utiliser dans l'app React :

```javascript
import { formatTimeHuman } from '../utils/timeFormat'

// Afficher une heure
console.log(formatTimeHuman('08:00'))   // "08h00"
console.log(formatTimeHuman('13:30'))   // "13h30"
console.log(formatTimeHuman('18:45'))   // "18h45"

// Afficher une date + heure
import { formatDateTimeForNotification } from '../utils/timeFormat'

console.log(formatDateTimeForNotification('2026-06-02', '13:00'))
// "02/06/2026 à 13h00"
```

## ✅ Avantages

- ✅ Format 24h standard (pas de AM/PM confus)
- ✅ Lisible et compact : "13h00" au lieu de "13:00"
- ✅ Cohérent avec le français : "14h30" comme on dit à l'oral
- ✅ Utilisable partout dans l'app avec `formatTimeHuman()`

## 📌 Note

Le format SQL `LPAD()` assure que les heures sont toujours 2 chiffres :
- `8:00` → `08h00` (pas `8h00`)
- Pareil pour les minutes
