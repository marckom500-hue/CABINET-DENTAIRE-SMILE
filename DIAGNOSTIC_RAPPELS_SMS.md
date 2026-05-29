## Diagnostic des Rappels SMS Automatiques

### Problèmes Identifiés et Corrections

#### 1. **Cron Job Exécuté Une Seule Fois par Jour**
**Problème:** Le cron job s'exécutait à 7h UTC (8h Cameroun) une seule fois par jour, ce qui ne permettait pas d'envoyer les rappels 2 heures avant chaque RDV.

**Solution:** Modifier le cron job pour s'exécuter toutes les heures:
```sql
-- Ancien (incorrect)
SELECT cron.schedule('rappels-rdv-quotidiens', '0 7 * * *', ...);

-- Nouveau (correct)
SELECT cron.schedule('rappels-rdv-toutes-heures', '0 * * * *', ...);
```

#### 2. **Délai par Défaut de 24 Heures**
**Problème:** La configuration par défaut utilisait `delai_heures = 24`, ce qui envoyait les rappels 24 heures avant le RDV au lieu de 2 heures.

**Solution:** Mettre à jour la configuration:
```sql
UPDATE public.rappels_config
SET delai_heures = 2
WHERE id = (SELECT id FROM public.rappels_config LIMIT 1);
```

#### 3. **Rappels Manqués Non Affichés dans le Dashboard**
**Problème:** Les rappels échoués n'apparaissaient pas dans la section "Alertes" du Dashboard.

**Solution:** 
- Créer un hook `useMissedReminders` pour charger les rappels échoués
- Intégrer les rappels manqués dans le composant `Notifications`
- Afficher les rappels avec le type `error` en rouge

#### 4. **Statuts de Rappels Incomplets**
**Problème:** La table `rappels_sms` n'avait que les statuts `envoye`, `echec`, `pending`, ce qui ne permettait pas de distinguer les erreurs temporaires des erreurs permanentes.

**Solution:** Ajouter les colonnes manquantes:
```sql
ALTER TABLE public.rappels_sms ADD COLUMN IF NOT EXISTS tentatives INTEGER DEFAULT 1;
ALTER TABLE public.rappels_sms ADD COLUMN IF NOT EXISTS derniere_tentative TIMESTAMPTZ DEFAULT now();
```

### Étapes de Correction

#### Étape 1: Exécuter le Script SQL
1. Aller dans **Supabase → SQL Editor**
2. Copier le contenu de `supabase_fix_reminders.sql`
3. Exécuter le script

#### Étape 2: Vérifier la Configuration
```sql
-- Vérifier que le cron job est actif
SELECT * FROM cron.job WHERE jobname = 'rappels-rdv-toutes-heures';

-- Vérifier la configuration des rappels
SELECT * FROM public.rappels_config LIMIT 1;

-- Vérifier les rappels échoués
SELECT * FROM public.rappels_sms 
WHERE statut IN ('echec', 'echec_permanent', 'echec_temporaire')
ORDER BY created_at DESC LIMIT 10;
```

#### Étape 3: Tester Manuellement
1. Créer un RDV pour dans 2 heures
2. Attendre que le cron job s'exécute (toutes les heures)
3. Vérifier que le rappel SMS a été envoyé
4. Vérifier que le rappel apparaît dans le Dashboard

### Vérification du Fonctionnement

#### Logs du Cron Job
```sql
-- Voir l'historique des exécutions
SELECT * FROM cron.job_run_details 
WHERE jobname = 'rappels-rdv-toutes-heures'
ORDER BY start_time DESC LIMIT 10;
```

#### Rappels Envoyés
```sql
-- Voir les rappels envoyés aujourd'hui
SELECT 
  r.id,
  r.rdv_id,
  r.statut,
  r.message,
  r.erreur,
  rv.date,
  rv.heure,
  p.prenom,
  p.nom
FROM public.rappels_sms r
LEFT JOIN public.rendez_vous rv ON r.rdv_id = rv.id
LEFT JOIN public.patients p ON rv.patient_id = p.id
WHERE DATE(r.created_at) = CURRENT_DATE
ORDER BY r.created_at DESC;
```

#### Rappels Échoués
```sql
-- Voir les rappels échoués
SELECT 
  r.id,
  r.rdv_id,
  r.statut,
  r.erreur,
  r.tentatives,
  r.derniere_tentative,
  rv.date,
  rv.heure,
  p.prenom,
  p.nom
FROM public.rappels_sms r
LEFT JOIN public.rendez_vous rv ON r.rdv_id = rv.id
LEFT JOIN public.patients p ON rv.patient_id = p.id
WHERE r.statut IN ('echec', 'echec_permanent', 'echec_temporaire')
ORDER BY r.created_at DESC;
```

### Configuration SMS

Vérifier que les secrets de l'Edge Function sont correctement configurés:
- `SUPABASE_URL` — URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — clé service role Supabase
- `SMS_PROVIDER` — fournisseur SMS (twilio, africastalking, gateway)
- Secrets spécifiques au fournisseur (API keys, tokens, etc.)

### Dépannage

#### Les rappels ne sont pas envoyés
1. Vérifier que le cron job est actif: `SELECT * FROM cron.job WHERE jobname = 'rappels-rdv-toutes-heures';`
2. Vérifier les logs du cron job: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
3. Vérifier que la configuration est activée: `SELECT actif, envoi_auto FROM public.rappels_config LIMIT 1;`
4. Vérifier que les patients ont un numéro de téléphone

#### Les rappels échouent
1. Vérifier les erreurs dans `rappels_sms`: `SELECT erreur FROM public.rappels_sms WHERE statut = 'echec' LIMIT 5;`
2. Vérifier que les secrets SMS sont correctement configurés
3. Vérifier que le fournisseur SMS est accessible
4. Vérifier que les numéros de téléphone sont au bon format

#### Les rappels n'apparaissent pas dans le Dashboard
1. Vérifier que le hook `useMissedReminders` est importé dans Dashboard.jsx
2. Vérifier que les rappels manqués sont dans la base de données
3. Vérifier que le composant `Notifications` reçoit les rappels manqués
