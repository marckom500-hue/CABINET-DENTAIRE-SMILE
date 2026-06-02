# 📬 Configuration des Notifications Médecin pour RDV

## Vue d'ensemble
Les médecins reçoivent automatiquement des notifications lorsqu'un RDV leur est assigné ou modifié.

## Étapes d'implémentation

### 1. **Exécuter le script SQL**
```sql
-- Dans Supabase → SQL Editor → Run
-- Copier et coller le contenu de : supabase_migrations_notifications.sql
```

Cela crée :
- ✅ Table `notifications` en BDD
- ✅ Trigger : notification automatique à chaque nouveau RDV
- ✅ Trigger : notification automatique à chaque modification de RDV
- ✅ RLS policies pour sécuriser l'accès

### 2. **Vérifier l'intégration des fichiers**

Les fichiers suivants ont été créés/modifiés :

- ✅ `src/components/NotificationCenter.jsx` — Composant UI
- ✅ `src/hooks/useDatabaseNotifications.js` — Logique métier
- ✅ `src/components/Topbar.jsx` — Intégration (modifié)
- ✅ `supabase_migrations_notifications.sql` — Migration BD

### 3. **Fonctionnalités**

#### Pour le médecin :
- 🔔 Badge avec compteur de notifications non-lues
- 📋 Liste des notifications (nouveau RDV, modification, réassignation)
- ✅ Marquer comme lu / Marquer tout comme lu
- 🗑️ Supprimer une notification
- ⏱️ Temps écoulé (5m, 1h, 2j, etc.)
- 📱 Real-time : les notifications arrivent en temps réel

#### Format de notification :
```
Titre : "Nouveau RDV assigné"
Message : "RDV : John Doe le 15/03/2024 à 14:30 (Détartrage)"
```

### 4. **Flux complet**

```
Secrétaire créé RDV
        ↓
Trigger SQL détecte INSERT
        ↓
Fonction SQL crée notification
        ↓
useDatabaseNotifications met à jour en temps réel
        ↓
Médecin voit la cloche avec badge rouge
        ↓
Médecin clique → Ouvre NotificationCenter
        ↓
Notification en haut de la liste
```

### 5. **Test en local**

```bash
# 1. Exécuter le script SQL
# 2. Actualiser la page (npm run dev)
# 3. Créer un RDV avec un médecin assigné
# 4. Vérifier que la notification apparaît immédiatement
```

## Architecture

### Table `notifications`
```sql
id          UUID      — Identifiant unique
user_id     UUID      — Médecin destinataire
type        TEXT      — rdv, patient, facture, stock, system
title       TEXT      — Titre court
message     TEXT      — Message détaillé
read        BOOLEAN   — État de lecture
related_id  UUID      — ID du RDV (pour lien direct)
related_type TEXT     — Type : rendez_vous
created_at  TIMESTAMPTZ — Timestamp
```

### Triggers SQL

#### `notify_medecin_new_rdv()`
- Déclenché : `AFTER INSERT ON rendez_vous`
- Insère 1 notification pour le médecin

#### `notify_medecin_rdv_modified()`
- Déclenché : `AFTER UPDATE ON rendez_vous`
- Insère 1 notification si modification importante

## Sécurité

- ✅ RLS policy : chaque médecin ne voit que ses notifications
- ✅ Edge Function n'utilise que le service role
- ✅ Timestamps en TIMESTAMPTZ (fuseau horaire)
- ✅ Cascade delete : suppression du médecin → suppression notifications

## Extensions optionnelles

### Notifications par SMS/Email
```sql
-- Ajouter dans le trigger :
INSERT INTO rappels_sms (...)
```

### Notification sur mobile (PWA)
```javascript
// Dans useDatabaseNotifications.js
if ('serviceWorker' in navigator) {
  new Notification('Nouveau RDV', { body: message })
}
```

### Webhook Slack/Teams
```bash
# Edge Function pour post dans Slack
supabase functions deploy notify-slack
```

## Support

Si une notification n'arrive pas :
1. Vérifier que le médecin est `actif = true`
2. Vérifier le log Supabase → Functions → Logs
3. Vérifier la RLS policy sur `notifications`
