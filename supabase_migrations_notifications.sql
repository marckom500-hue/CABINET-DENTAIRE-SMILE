-- ─────────────────────────────────────────────
-- TABLE NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users_profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'rdv' CHECK (type IN ('rdv','patient','facture','stock','system')),
  title       TEXT,
  message     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  related_id  UUID,
  related_type TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- FONCTION : Notifier le médecin d'un nouveau RDV
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_medecin_new_rdv()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  medecin_name TEXT;
BEGIN
  -- Récupérer les noms du patient et médecin
  SELECT prenom || ' ' || nom INTO patient_name FROM public.patients WHERE id = NEW.patient_id;
  SELECT prenom || ' ' || nom INTO medecin_name FROM public.users_profiles WHERE id = NEW.medecin_id;

  -- Insérer la notification pour le médecin
  INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
  VALUES (
    NEW.medecin_id,
    'rdv',
    'Nouveau RDV assigné',
    'RDV : ' || COALESCE(patient_name, 'Patient inconnu') || ' le ' || TO_CHAR(NEW.date, 'DD/MM/YYYY') || ' à ' || NEW.heure || ' (' || NEW.type_acte || ')',
    NEW.id,
    'rendez_vous'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger : déclencher la notification à chaque nouveau RDV
DROP TRIGGER IF EXISTS trigger_notify_medecin_new_rdv ON public.rendez_vous;
CREATE TRIGGER trigger_notify_medecin_new_rdv
  AFTER INSERT ON public.rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_medecin_new_rdv();

-- ─────────────────────────────────────────────
-- FONCTION : Notifier le médecin d'une modification de RDV
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_medecin_rdv_modified()
RETURNS TRIGGER AS $$
DECLARE
  patient_name TEXT;
  change_summary TEXT;
BEGIN
  -- Notifier seulement si le médecin a changé ou les détails importants
  IF NEW.medecin_id != OLD.medecin_id OR 
     NEW.date != OLD.date OR 
     NEW.heure != OLD.heure THEN
    
    SELECT prenom || ' ' || nom INTO patient_name FROM public.patients WHERE id = NEW.patient_id;

    IF NEW.medecin_id != OLD.medecin_id THEN
      -- Notifier le nouveau médecin
      INSERT INTO public.notifications (user_id, type, title, message, related_id, related_type)
      VALUES (
        NEW.medecin_id,
        'rdv',
        'RDV réassigné',
        'Réassignation : ' || COALESCE(patient_name, 'Patient inconnu') || ' le ' || TO_CHAR(NEW.date, 'DD/MM/YYYY') || ' à ' || NEW.heure,
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
        'Modification : ' || COALESCE(patient_name, 'Patient inconnu') || ' le ' || TO_CHAR(NEW.date, 'DD/MM/YYYY') || ' à ' || NEW.heure,
        NEW.id,
        'rendez_vous'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger : déclencher la notification à chaque modification de RDV
DROP TRIGGER IF EXISTS trigger_notify_medecin_rdv_modified ON public.rendez_vous;
CREATE TRIGGER trigger_notify_medecin_rdv_modified
  AFTER UPDATE ON public.rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_medecin_rdv_modified();
