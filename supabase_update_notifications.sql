-- ============================================================
-- Mise à jour des notifications (gestion des conflicts)
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. SUPPRIMER LES POLICIES EXISTANTES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

-- ─────────────────────────────────────────────
-- 2. RECRÉER LES POLICIES
-- ─────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert" ON public.notifications 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 3. SUPPRIMER LES TRIGGERS (si existent)
-- ─────────────────────────────────────────────
DROP TRIGGER IF EXISTS trigger_notify_medecin_new_rdv ON public.rendez_vous;
DROP TRIGGER IF EXISTS trigger_notify_medecin_rdv_modified ON public.rendez_vous;

-- ─────────────────────────────────────────────
-- 4. SUPPRIMER LES FONCTIONS (si existent)
-- ─────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.notify_medecin_new_rdv() CASCADE;
DROP FUNCTION IF EXISTS public.notify_medecin_rdv_modified() CASCADE;

-- ─────────────────────────────────────────────
-- 5. RECRÉER LES FONCTIONS
-- ─────────────────────────────────────────────

-- FONCTION : Notifier le médecin d'un nouveau RDV
CREATE OR REPLACE FUNCTION public.notify_medecin_new_rdv()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  formatted_time TEXT;
BEGIN
  -- Récupérer le nom du patient
  SELECT prenom || ' ' || nom INTO patient_name FROM public.patients WHERE id = NEW.patient_id;

  -- Formater l'heure au format 24h (13h00 au lieu de 01:00 PM)
  formatted_time := LPAD(EXTRACT(HOUR FROM NEW.heure::time)::text, 2, '0') || 'h' ||
                    LPAD(EXTRACT(MINUTE FROM NEW.heure::time)::text, 2, '0');

  -- Insérer la notification pour le médecin
  INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
  VALUES (
    NEW.medecin_id,
    'rdv',
    'Nouveau RDV assigné',
    'RDV : ' || COALESCE(patient_name, 'Patient inconnu') || ' le ' || TO_CHAR(NEW.date, 'DD/MM/YYYY') || ' à ' || formatted_time || ' (' || NEW.type_acte || ')',
    NEW.id,
    'rendez_vous'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FONCTION : Notifier le médecin d'une modification de RDV
CREATE OR REPLACE FUNCTION public.notify_medecin_rdv_modified()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  formatted_time TEXT;
BEGIN
  -- Notifier seulement si le médecin a changé ou les détails importants
  IF NEW.medecin_id != OLD.medecin_id OR 
     NEW.date != OLD.date OR 
     NEW.heure != OLD.heure THEN
    
    SELECT prenom || ' ' || nom INTO patient_name FROM public.patients WHERE id = NEW.patient_id;

    -- Formater l'heure au format 24h (13h00 au lieu de 01:00 PM)
    formatted_time := LPAD(EXTRACT(HOUR FROM NEW.heure::time)::text, 2, '0') || 'h' ||
                      LPAD(EXTRACT(MINUTE FROM NEW.heure::time)::text, 2, '0');

    IF NEW.medecin_id != OLD.medecin_id THEN
      -- Notifier le nouveau médecin
      INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
      VALUES (
        NEW.medecin_id,
        'rdv',
        'RDV réassigné',
        'Réassignation : ' || COALESCE(patient_name, 'Patient inconnu') || ' le ' || TO_CHAR(NEW.date, 'DD/MM/YYYY') || ' à ' || formatted_time,
        NEW.id,
        'rendez_vous'
      );
    ELSE
      -- Notifier le médecin de la modification
      INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
      VALUES (
        NEW.medecin_id,
        'rdv',
        'RDV modifié',
        'Modification : ' || COALESCE(patient_name, 'Patient inconnu') || ' le ' || TO_CHAR(NEW.date, 'DD/MM/YYYY') || ' à ' || formatted_time,
        NEW.id,
        'rendez_vous'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- 6. RECRÉER LES TRIGGERS
-- ─────────────────────────────────────────────

-- Trigger : déclencher la notification à chaque nouveau RDV
CREATE TRIGGER trigger_notify_medecin_new_rdv
  AFTER INSERT ON public.rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_medecin_new_rdv();

-- Trigger : déclencher la notification à chaque modification de RDV
CREATE TRIGGER trigger_notify_medecin_rdv_modified
  AFTER UPDATE ON public.rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_medecin_rdv_modified();

-- ─────────────────────────────────────────────
-- 7. VÉRIFICATION
-- ─────────────────────────────────────────────
SELECT 'Setup terminé avec succès!' AS message;

-- Vérifier les policies
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'notifications' ORDER BY policyname;

-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'rendez_vous' 
AND trigger_name LIKE 'trigger_notify%';
