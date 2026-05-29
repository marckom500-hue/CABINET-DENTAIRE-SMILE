# Guide de Gestion des Erreurs SMS — SMILE

## Problème identifié

Erreur HTTP 404 lors de l'envoi automatique des rappels SMS :
```
Echec fournisseur SMS HTTP 404: Reponse HTML inattendue du fournisseur SMS HTTP 404. 
Verifiez l'URL et le serveur SMS.
```

**Causes possibles :**
- Serveur SMS (ngrok) hors ligne
- Tunnel ngrok non actif
- Serveur SMS local sur le port 8080 arrêté
- Fournisseur SMS indisponible

---

## Solution implémentée

### 1. Retry automatique avec backoff exponentiel

La fonction `send-rappel-rdv` réessaye automatiquement jusqu'à 3 fois :
- **1ère tentative** : immédiate
- **2ème tentative** : après 2 secondes
- **3ème tentative** : après 4 secondes
- **4ème tentative** : après 8 secondes

Seules les erreurs temporaires (502, 503, 504, timeout) déclenchent un retry.

### 2. Queue de retry persistante

Les rappels échoués sont stockés dans `rappels_retry_queue` avec :
- Nombre de tentatives restantes
- Raison de l'échec
- Prochain horaire de renvoi

**Renvois programmés :**
- 1ère tentative échouée → renvoi dans 10 minutes
- 2ème tentative échouée → renvoi dans 20 minutes
- 3ème tentative échouée → renvoi dans 30 minutes
- Après 3 échecs → marqué comme `echec_permanent`

### 3. Notifications d'erreur

Une notification est créée pour chaque :
- Rappel en attente de renvoi (`sms_retry`)
- Échec permanent (`sms_failed`)
- Succès après retry (`sms_success`)

### 4. Interface de gestion

Nouveau composant `RappelsFailedSMS.jsx` affichant :
- Liste des rappels échoués
- Queue de renvoi automatique
- Bouton de renvoi manuel
- Historique des tentatives

---

## Installation

### Étape 1 : Exécuter la migration SQL

1. Aller dans **Supabase → SQL Editor**
2. Coller le contenu de `supabase_migration_retry_sms.sql`
3. Cliquer sur **Run**

Cela crée :
- Colonnes `tentatives` et `prochain_retry` dans `rappels_sms`
- Table `rappels_retry_queue`
- Table `rappels_notifications`
- Fonctions PL/pgSQL pour gérer la queue

### Étape 2 : Déployer les Edge Functions

```bash
# Redéployer send-rappel-rdv avec le nouveau code
npx supabase functions deploy send-rappel-rdv

# Déployer la nouvelle fonction de traitement
npx supabase functions deploy process-retry-queue
```

### Étape 3 : Configurer le cron job pour process-retry-queue

Dans **Supabase → SQL Editor**, ajouter :

```sql
-- Exécute le traitement de la queue toutes les 5 minutes
SELECT cron.schedule(
  'process-retry-queue-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url    := current_setting('app.supabase_url') || '/functions/v1/process-retry-queue',
    body   := '{}'::jsonb,
    headers:= jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.anon_key')
    )
  );
  $$
);
```

### Étape 4 : Ajouter le composant à l'interface

Dans votre page d'administration (ex: `AdminDashboard.jsx`) :

```jsx
import RappelsFailedSMS from '../components/RappelsFailedSMS'

export default function AdminDashboard() {
  return (
    <div>
      {/* ... autres sections ... */}
      <RappelsFailedSMS />
    </div>
  )
}
```

---

## Utilisation

### Affichage du statut

Les rappels SMS ont maintenant 4 statuts :

| Statut | Signification |
|--------|---------------|
| `envoye` | SMS envoyé avec succès |
| `echec_temporaire` | Erreur temporaire, en attente de renvoi |
| `echec_permanent` | Échec après 3 tentatives, intervention manuelle requise |
| `pending` | En attente d'envoi initial |

### Renvoi manuel

1. Aller dans **Rappels SMS** → **Rappels échoués**
2. Cliquer sur **Renvoyer** pour un rappel spécifique
3. Le système réessaye immédiatement
4. Si succès → statut passe à `envoye`
5. Si échec → ajouté à la queue de retry

### Monitoring

Vérifier les rappels en attente :

```sql
-- Rappels échoués permanents
SELECT * FROM rappels_sms 
WHERE statut = 'echec_permanent' 
ORDER BY derniere_tentative DESC;

-- Queue de retry active
SELECT * FROM rappels_retry_queue 
WHERE tentatives_restantes > 0 
ORDER BY prochain_retry ASC;

-- Notifications non lues
SELECT * FROM rappels_notifications 
WHERE lue = false 
ORDER BY created_at DESC;
```

---

## Dépannage

### Le serveur SMS est hors ligne

**Symptôme :** Erreur HTTP 502 ou 504

**Solution :**
1. Vérifier que le serveur SMS est lancé sur le port 8080
2. Si utilisant ngrok : `ngrok http 8080`
3. Vérifier l'URL dans les variables d'environnement
4. Les rappels seront automatiquement renvoyés dans 5-30 minutes

### Tous les renvois échouent

**Symptôme :** Statut reste `echec_permanent` après 3 tentatives

**Solution :**
1. Vérifier les identifiants SMS (username, password, API key)
2. Vérifier que le fournisseur SMS n'a pas de limite de débit
3. Vérifier le format du numéro de téléphone (doit être au format Cameroun)
4. Consulter les logs de l'Edge Function dans Supabase

### Renvoi manuel ne fonctionne pas

**Symptôme :** Bouton "Renvoyer" ne répond pas

**Solution :**
1. Vérifier que l'utilisateur a le rôle `superadmin` ou `secretaire`
2. Vérifier la connexion Internet
3. Vérifier les logs du navigateur (F12 → Console)
4. Vérifier que l'Edge Function `send-rappel-rdv` est déployée

---

## Configuration avancée

### Modifier le délai de retry

Dans `supabase_migration_retry_sms.sql`, ligne avec `add_to_retry_queue` :

```sql
prochain_retry: now() + interval '5 minutes',  -- Changer ici
```

### Modifier le nombre de tentatives

Dans `send-rappel-rdv/index.ts` :

```typescript
const smsResult = await sendSmsWithRetry(phone, message, 5)  // 5 tentatives au lieu de 3
```

### Ajouter un webhook de notification

Créer une Edge Function qui envoie une notification email/Slack en cas d'échec permanent :

```typescript
// Dans process-retry-queue/index.ts, après "failed_permanent"
await fetch('https://hooks.slack.com/...', {
  method: 'POST',
  body: JSON.stringify({
    text: `Échec SMS pour ${retry.telephone}: ${sendResult.error}`
  })
})
```

---

## Checklist de déploiement

- [ ] Migration SQL exécutée
- [ ] Edge Functions déployées
- [ ] Cron job configuré
- [ ] Composant `RappelsFailedSMS` intégré
- [ ] Variables d'environnement vérifiées
- [ ] Serveur SMS testé et en ligne
- [ ] Logs vérifiés dans Supabase
- [ ] Test d'envoi manuel effectué
