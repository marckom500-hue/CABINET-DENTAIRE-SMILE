-- ============================================================
-- CORRECTION COMPLÈTE DES RAPPELS AUTOMATIQUES SMS
-- À exécuter dans Supabase → SQL Editor
-- ============================================================
-- Problèmes corrigés :
-- 1. Cron job trop lent (1x/jour → toutes les 10 minutes)
-- 2. Délai de 24h par défaut → 2 heures
-- 3. Rappels manqués non affichés dans le Dashboard
-- 4. Pas de synchronisation temps réel
-- ============================================================

-- ─────────────────────────────────────────────
-- ÉTAPE 0 : PRÉPARATION
-- ─────────────────────────────────────────────

-- 0.1. Supprimer l'ancien cron job s'il existe (ignorer les erreurs si n'existe pas)
-- Note: cron.unschedule retourne false si le job n'existe pas, mais ne lance pas d'erreur
-- Nous utilisons donc une approche différente pour éviter les erreurs
DO $$
DECLARE
  job_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM cron.job WHERE jobname = 'rappels-rdv-quotidiens'
  ) INTO job_exists;
  
  IF job_exists THEN
    PERFORM cron.unschedule('rappels-rdv-quotidiens');
  END IF;
END $$;

DO $$
DECLARE
  job_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM cron.job WHERE jobname = 'rappels-rdv-toutes-heures'
  ) INTO job_exists;
  
  IF job_exists THEN
    PERFORM cron.unschedule('rappels-rdv-toutes-heures');
  END IF;
END $$;

-- 0.2. Vérifier que pg_cron est activé
-- Aller dans Supabase → Extensions et activer pg_cron si nécessaire

-- ─────────────────────────────────────────────
-- ÉTAPE 1 : CONFIGURATION DU CRON JOB
-- ─────────────────────────────────────────────

-- 1.1. Créer le cron job qui s'exécute toutes les 10 minutes
SELECT cron.schedule(
  'rappels-rdv-toutes-10min',
  '*/10 * * * *',
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

-- 1.2. Vérifier que le cron job est créé
SELECT * FROM cron.job WHERE jobname = 'rappels-rdv-toutes-10min';

-- ─────────────────────────────────────────────
-- ÉTAPE 2 : CONFIGURATION DES RAPPELS
-- ─────────────────────────────────────────────

-- 2.1. Mettre à jour la configuration par défaut (respecte l'interface existante)
-- Cette configuration est celle visible dans l'onglet "Configuration" de la page Rappels
INSERT INTO public.rappels_config (id, delai_heures, envoi_auto, actif, message_template)
VALUES (
  gen_random_uuid(),
  2,
  true,
  true,
  'Bonjour {prenom}, vous avez un rendez-vous au Cabinet Dr. Boutchouang le {date} à {heure} ({type_acte}). Pour annuler ou reporter, appelez le 6XX XXX XXX.'
)
ON CONFLICT DO NOTHING;

-- 2.2. Si une configuration existe déjà, s'assurer qu'elle est active
UPDATE public.rappels_config 
SET actif = true, envoi_auto = true, updated_at = now()
WHERE id IS NOT NULL;

-- 2.2. Vérifier la configuration
SELECT * FROM public.rappels_config LIMIT 1;

-- ─────────────────────────────────────────────
-- ÉTAPE 3 : AMÉLIORATION DE LA TABLE RAPPELS_SMS
-- ─────────────────────────────────────────────

-- 3.1. S'assurer que la table rappels_sms a les bonnes colonnes
ALTER TABLE public.rappels_sms
ADD COLUMN IF NOT EXISTS tentatives INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS derniere_tentative TIMESTAMPTZ DEFAULT now();

-- 3.2. Mettre à jour la contrainte de statut pour inclure tous les statuts
ALTER TABLE public.rappels_sms
DROP CONSTRAINT IF EXISTS rappels_sms_statut_check;

ALTER TABLE public.rappels_sms
ADD CONSTRAINT rappels_sms_statut_check
CHECK (statut IN ('envoye', 'echec', 'echec_permanent', 'echec_temporaire', 'pending'));

-- 3.3. Créer un index pour améliorer les performances des requêtes de rappels manqués
CREATE INDEX IF NOT EXISTS idx_rappels_sms_statut_created_at 
ON public.rappels_sms(statut, created_at DESC) 
WHERE statut IN ('echec', 'echec_permanent', 'echec_temporaire');

CREATE INDEX IF NOT EXISTS idx_rappels_sms_rdv_id 
ON public.rappels_sms(rdv_id);

-- ─────────────────────────────────────────────
-- ÉTAPE 4 : VÉRIFICATIONS FINALES
-- ─────────────────────────────────────────────

-- 4.1. Vérifier que le cron job est bien planifié
SELECT 
  jobname as "Nom du cron",
  schedule as "Fréquence (cron)",
  database as "Base de données",
  username as "Utilisateur",
  active as "Actif"
FROM cron.job 
WHERE jobname = 'rappels-rdv-toutes-10min';

-- 4.2. Vérifier la configuration des rappels
SELECT 
  id,
  actif as "Actif",
  delai_heures as "Délai (heures)",
  envoi_auto as "Envoi auto",
  message_template as "Message",
  updated_at as "Mis à jour le"
FROM public.rappels_config 
LIMIT 1;

-- 4.3. Compter les rappels par statut (pour vérification)
SELECT 
  statut,
  COUNT(*) as nombre,
  MAX(created_at) as "Dernier rappel"
FROM public.rappels_sms 
GROUP BY statut 
ORDER BY nombre DESC;

-- ─────────────────────────────────────────────
-- ÉTAPE 5 : INSTRUCTIONS DE TEST
-- ─────────────────────────────────────────────

-- Pour tester manuellement un rappel SMS :
-- 1. Créer un RDV à 13h00 aujourd'hui
-- 2. Attendre 11h00 (2 heures avant)
-- 3. Le cron job s'exécutera automatiquement toutes les 10 minutes
-- 4. Vérifier dans la table rappels_sms si le rappel a été envoyé

-- Pour vérifier les logs d'exécution du cron :
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'rappels-rdv-toutes-10min' 
-- ORDER BY start_time DESC LIMIT 10;

-- Pour voir les rappels envoyés/échoués :
-- SELECT 
--   r.id,
--   r.rdv_id,
--   r.statut,
--   r.message,
--   r.erreur,
--   r.tentatives,
--   r.created_at,
--   rdv.date,
--   rdv.heure,
--   p.nom,
--   p.prenom,
--   p.telephone
-- FROM public.rappels_sms r
-- JOIN public.rendez_vous rdv ON r.rdv_id = rdv.id
-- JOIN public.patients p ON rdv.patient_id = p.id
-- ORDER BY r.created_at DESC
-- LIMIT 20;

-- ─────────────────────────────────────────────
-- ÉTAPE 6 : NETTOYAGE (OPTIONNEL)
-- ─────────────────────────────────────────────

-- Pour désactiver temporairement les rappels automatiques :
-- UPDATE public.rappels_config SET actif = false, envoi_auto = false;

-- Pour réactiver les rappels automatiques :
-- UPDATE public.rappels_config SET actif = true, envoi_auto = true;

-- Pour supprimer le cron job (si nécessaire) :
-- SELECT cron.unschedule('rappels-rdv-toutes-10min');

-- ============================================================
-- FIN DE LA MIGRATION
-- ============================================================
-- Après exécution de ce script :
-- 1. Les rappels seront envoyés 2 heures avant chaque RDV
-- 2. Le système vérifiera toutes les 10 minutes s'il y a des RDV à rappeler
-- 3. Les rappels manqués s'afficheront dans le Dashboard (après mise à jour du hook)
-- 4. La synchronisation sera en temps réel (après mise à jour du hook)
-- ============================================================