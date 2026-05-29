-- Migration: Ajouter support retry automatique et gestion des erreurs SMS
-- À exécuter dans Supabase → SQL Editor

-- 1. Ajouter colonnes manquantes à rappels_sms
ALTER TABLE public.rappels_sms
ADD COLUMN IF NOT EXISTS tentatives INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS prochain_retry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS derniere_tentative TIMESTAMPTZ DEFAULT now();

-- 2. Créer table pour tracker les rappels en attente de retry
CREATE TABLE IF NOT EXISTS public.rappels_retry_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rappel_sms_id UUID REFERENCES public.rappels_sms(id) ON DELETE CASCADE,
  rdv_id UUID REFERENCES public.rendez_vous(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  telephone TEXT NOT NULL,
  message TEXT NOT NULL,
  tentatives_restantes INTEGER DEFAULT 3,
  prochain_retry TIMESTAMPTZ NOT NULL,
  raison_echec TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rappels_retry_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "retry_queue_read"  ON public.rappels_retry_queue FOR SELECT USING (public.get_my_role() IN ('superadmin','secretaire'));
CREATE POLICY "retry_queue_write" ON public.rappels_retry_queue FOR ALL USING (public.get_my_role() = 'superadmin');

-- 3. Créer table pour les notifications d'erreur
CREATE TABLE IF NOT EXISTS public.rappels_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('sms_failed', 'sms_retry', 'sms_success')),
  rdv_id UUID REFERENCES public.rendez_vous(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  lue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rappels_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read"  ON public.rappels_notifications FOR SELECT USING (public.get_my_role() IN ('superadmin','secretaire'));
CREATE POLICY "notifications_write" ON public.rappels_notifications FOR ALL USING (public.get_my_role() = 'superadmin');

-- 4. Fonction pour ajouter un rappel à la queue de retry
CREATE OR REPLACE FUNCTION public.add_to_retry_queue(
  p_rappel_sms_id UUID,
  p_rdv_id UUID,
  p_patient_id UUID,
  p_telephone TEXT,
  p_message TEXT,
  p_raison_echec TEXT,
  p_tentatives_restantes INTEGER DEFAULT 3
)
RETURNS UUID AS $$
DECLARE
  v_retry_id UUID;
BEGIN
  INSERT INTO public.rappels_retry_queue (
    rappel_sms_id,
    rdv_id,
    patient_id,
    telephone,
    message,
    tentatives_restantes,
    prochain_retry,
    raison_echec
  ) VALUES (
    p_rappel_sms_id,
    p_rdv_id,
    p_patient_id,
    p_telephone,
    p_message,
    p_tentatives_restantes,
    now() + interval '5 minutes',
    p_raison_echec
  )
  RETURNING id INTO v_retry_id;

  -- Créer une notification
  INSERT INTO public.rappels_notifications (type, rdv_id, patient_id, message)
  VALUES ('sms_retry', p_rdv_id, p_patient_id, 'SMS en attente de renvoi: ' || p_raison_echec);

  RETURN v_retry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour marquer un rappel comme succès
CREATE OR REPLACE FUNCTION public.mark_sms_success(p_rappel_sms_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.rappels_sms
  SET statut = 'envoye', derniere_tentative = now()
  WHERE id = p_rappel_sms_id;

  DELETE FROM public.rappels_retry_queue
  WHERE rappel_sms_id = p_rappel_sms_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour obtenir les rappels en attente de retry
CREATE OR REPLACE FUNCTION public.get_pending_retries()
RETURNS TABLE (
  id UUID,
  rappel_sms_id UUID,
  rdv_id UUID,
  patient_id UUID,
  telephone TEXT,
  message TEXT,
  tentatives_restantes INTEGER,
  raison_echec TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rq.id,
    rq.rappel_sms_id,
    rq.rdv_id,
    rq.patient_id,
    rq.telephone,
    rq.message,
    rq.tentatives_restantes,
    rq.raison_echec
  FROM public.rappels_retry_queue rq
  WHERE rq.prochain_retry <= now()
  AND rq.tentatives_restantes > 0
  ORDER BY rq.prochain_retry ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Mettre à jour la table rappels_sms pour supporter les nouveaux statuts
ALTER TABLE public.rappels_sms
DROP CONSTRAINT IF EXISTS rappels_sms_statut_check;

ALTER TABLE public.rappels_sms
ADD CONSTRAINT rappels_sms_statut_check
CHECK (statut IN ('envoye', 'echec_permanent', 'echec_temporaire', 'pending', 'echec'));

-- 8. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_rappels_retry_queue_prochain_retry 
ON public.rappels_retry_queue(prochain_retry) 
WHERE tentatives_restantes > 0;

CREATE INDEX IF NOT EXISTS idx_rappels_sms_rdv_id 
ON public.rappels_sms(rdv_id);

CREATE INDEX IF NOT EXISTS idx_rappels_notifications_lue 
ON public.rappels_notifications(lue) 
WHERE lue = false;
