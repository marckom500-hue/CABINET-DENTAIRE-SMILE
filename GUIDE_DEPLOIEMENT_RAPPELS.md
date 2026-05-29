# 📱 Guide de Déploiement - Correction des Rappels Automatiques SMS

## 🎯 Problèmes Corrigés

1. ✅ **Cron job trop lent** : Passé de 1x/jour à toutes les 10 minutes
2. ✅ **Délai par défaut** : Configuré à 2 heures (modifiable via l'interface)
3. ✅ **Rappels manqués** : S'affichent maintenant dans le Dashboard
4. ✅ **Synchronisation temps réel** : Ajoutée via Supabase Realtime

## 📋 Étapes de Déploiement

### Étape 1 : Exécuter la Migration SQL

1. **Connectez-vous à Supabase Dashboard**
   - Allez sur https://supabase.com
   - Sélectionnez votre projet "SMILE"

2. **Ouvrez l'éditeur SQL**
   - Menu de gauche → **SQL Editor**
   - Cliquez sur **New Query**

3. **Exécutez le script de migration**
   - Copiez le contenu du fichier `supabase_correction_rappels_auto.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur **Run** ou appuyez sur `Ctrl+Enter`

4. **Vérifiez le résultat**
   - Le script devrait s'exécuter sans erreur
   - Vous devriez voir les résultats des requêtes de vérification
   - Notez le nom du cron job : `rappels-rdv-toutes-10min`

### Étape 2 : Vérifier la Configuration

1. **Vérifiez que le cron job est créé**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'rappels-rdv-toutes-10min';
   ```
   - Devrait afficher une ligne avec `schedule = '*/10 * * * *'`

2. **Vérifiez la configuration des rappels**
   ```sql
   SELECT * FROM public.rappels_config LIMIT 1;
   ```
   - Devrait afficher `delai_heures = 2`, `actif = true`, `envoi_auto = true`

3. **Vérifiez les index**
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'rappels_sms';
   ```
   - Devrait inclure `idx_rappels_sms_statut_created_at` et `idx_rappels_sms_rdv_id`

### Étape 3 : Tester le Système

#### Test 1 : Création d'un RDV test

1. **Créez un RDV dans l'application**
   - Allez dans la page **Rendez-vous**
   - Créez un RDV pour **aujourd'hui à 14h00** (par exemple)
   - Assurez-vous que le patient a un numéro de téléphone valide

2. **Attendez l'heure du rappel**
   - Si le RDV est à 14h00, le rappel doit être envoyé à **12h00** (2 heures avant)
   - Le cron job s'exécute toutes les 10 minutes, donc le rappel sera envoyé entre 12h00 et 12h10

3. **Vérifiez l'envoi du rappel**
   - Allez dans la page **Rappels SMS** → onglet **Historique**
   - Vous devriez voir le rappel avec le statut "Envoyé" ou "Échec"

#### Test 2 : Vérifier les rappels manqués dans le Dashboard

1. **Créez un RDV avec un numéro invalide** (pour simuler un échec)
   - Par exemple, un patient sans numéro de téléphone

2. **Attendez l'heure du rappel**

3. **Vérifiez le Dashboard**
   - Rafraîchissez la page d'accueil
   - Dans la section **Notifications**, vous devriez voir une notification d'erreur pour le rappel échoué
   - La notification devrait apparaître en **temps réel** (sans recharger la page)

### Étape 4 : Configurer le Délai d'Envoi

1. **Allez dans la page Rappels SMS**
2. **Cliquez sur l'onglet "Configuration"**
3. **Sélectionnez le délai souhaité** :
   - 2 heures avant (recommandé)
   - 6 heures avant
   - 12 heures avant
   - 24 heures avant
   - 48 heures avant
4. **Cliquez sur "Sauvegarder la configuration"**

Le système utilisera automatiquement ce délai pour les prochains rappels.

## 🔍 Dépannage

### Le cron job ne s'exécute pas

**Vérifiez que pg_cron est activé :**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```
- Si vide, allez dans **Settings** → **Extensions** et activez `pg_cron`

### Les rappels ne sont pas envoyés

1. **Vérifiez que les rappels automatiques sont activés :**
   ```sql
   SELECT actif, envoi_auto FROM public.rappels_config LIMIT 1;
   ```

2. **Vérifiez les logs du cron job :**
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobname = 'rappels-rdv-toutes-10min' 
   ORDER BY start_time DESC LIMIT 10;
   ```

3. **Vérifiez que l'Edge Function est déployée :**
   - Allez dans **Functions** → **send-rappel-rdv**
   - Assurez-vous qu'elle est déployée et active

### Les rappels manqués ne s'affichent pas dans le Dashboard

1. **Vérifiez que le hook est à jour :**
   - Le fichier `src/hooks/useMissedReminders.js` doit inclure la subscription temps réel
   - Redéployez l'application si nécessaire

2. **Vérifiez la console du navigateur :**
   - Ouvrez les DevTools (F12)
   - Regardez les logs pour voir si la subscription temps réel est active

3. **Testez manuellement :**
   ```sql
   SELECT * FROM public.rappels_sms 
   WHERE statut IN ('echec_permanent', 'echec', 'echec_temporaire')
   ORDER BY created_at DESC LIMIT 5;
   ```

### Erreur "could not find valid entry for job"

Cette erreur se produit si vous essayez de supprimer un cron job qui n'existe pas. La migration inclut maintenant une gestion d'erreur pour ignorer cette erreur. Si vous voyez cette erreur, ignorez-la simplement.

## 📊 Surveillance

### Voir l'historique des rappels

```sql
SELECT 
  r.id,
  r.statut,
  r.message,
  r.erreur,
  r.tentatives,
  r.created_at,
  p.nom,
  p.prenom,
  p.telephone,
  rdv.date,
  rdv.heure
FROM public.rappels_sms r
JOIN public.rendez_vous rdv ON r.rdv_id = rdv.id
JOIN public.patients p ON rdv.patient_id = p.id
ORDER BY r.created_at DESC
LIMIT 50;
```

### Statistiques des rappels

```sql
SELECT 
  statut,
  COUNT(*) as nombre,
  MAX(created_at) as dernier_rappel
FROM public.rappels_sms 
GROUP BY statut 
ORDER BY nombre DESC;
```

## 🚀 Next Steps

1. **Surveillez les premiers rappels automatiques** pendant quelques jours
2. **Ajustez le délai** si nécessaire via l'interface de configuration
3. **Vérifiez régulièrement** l'onglet "Erreurs & Renvois" pour les échecs
4. **Configurez les notifications** pour être alerté des problèmes

## 📞 Support

Si vous rencontrez des problèmes, consultez :
- `SMS_ERROR_HANDLING_GUIDE.md` - Guide de gestion des erreurs SMS
- `DIAGNOSTIC_RAPPELS_SMS.md` - Diagnostic des problèmes de rappels
- Les logs Supabase dans **Logs** → **Edge Functions**

---

**Date de création du guide :** 27/05/2026  
**Version :** 1.0  
**Fichiers modifiés :**
- `supabase_correction_rappels_auto.sql` (nouveau)
- `src/hooks/useMissedReminders.js` (mis à jour)