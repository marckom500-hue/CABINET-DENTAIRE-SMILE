-- Configuration du cron job pour traiter la queue de retry
-- À exécuter dans Supabase → SQL Editor

-- Vérifier que pg_cron est activé
-- Aller dans Supabase → Extensions et activer pg_cron si nécessaire

-- Créer le cron job pour traiter la queue toutes les 5 minutes
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

-- Vérifier que le cron job est créé
SELECT * FROM cron.job WHERE jobname = 'process-retry-queue-5min';

-- Pour désactiver le cron job (si nécessaire)
-- SELECT cron.unschedule('process-retry-queue-5min');

-- Pour voir l'historique des exécutions
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
