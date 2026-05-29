-- ============================================================
-- CORRECTION DES RAPPELS AUTOMATIQUES
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1. Supprimer l'ancien cron job (s'il existe)
SELECT cron.unschedule('rappels-rdv-quotidiens');

-- 2. Créer le nouveau cron job qui s'exécute toutes les heures
SELECT cron.schedule(
  'rappels-rdv-toutes-heures',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url    := current_setting('app.supabase_url') || '/functions/v1/send-rappel-rdv',
    body   := '{"mode":"auto"}'::jsonb,
    headers:= jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.anon_key')
    )
  );
  $$
);

-- 3. Mettre à jour la configuration par défaut (2 heures avant le RDV)
UPDATE public.rappels_config
SET delai_heures = 2, envoi_auto = true, actif = true
WHERE id = (SELECT id FROM public.rappels_config LIMIT 1);

-- 4. Vérifier que le cron job est créé
SELECT * FROM cron.job WHERE jobname = 'rappels-rdv-toutes-heures';

-- 5. Vérifier la configuration
SELECT * FROM public.rappels_config LIMIT 1;

-- Notes:
-- - Le cron job s'exécute maintenant toutes les heures (0 * * * *)
-- - Les rappels seront envoyés 2 heures avant chaque RDV
-- - Pour voir l'historique des exécutions: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
