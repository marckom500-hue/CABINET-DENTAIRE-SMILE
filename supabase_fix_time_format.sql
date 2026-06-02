-- ============================================================
-- FIX : Formatage d'heure corrigé (HH:MM → HHhMM)
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. SUPPRIMER LES FONCTIONS EXISTANTES
-- ─────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.notify_medecin_new_rdv() CASCADE;
DROP FUNCTION IF EXISTS public.notify_medecin_rdv_modified() CASCADE;

-- ─────────────────────────────────────────────
-- 2. NOUVELLE FONCTION : Format heure correct
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

  -- Formater l'heure directement depuis le texte HH:MM
  -- Exemple : "14:30" → "14h30"
  formatted_time := REPLACE(NEW.heure, ':', 'h');

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

    -- Formater l'heure directement depuis le texte HH:MM
    formatted_time := REPLACE(NEW.heure, ':', 'h');

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
-- 3. RECRÉER LES TRIGGERS
-- ─────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_notify_medecin_new_rdv ON public.rendez_vous;
DROP TRIGGER IF EXISTS trigger_notify_medecin_rdv_modified ON public.rendez_vous;

CREATE TRIGGER trigger_notify_medecin_new_rdv
  AFTER INSERT ON public.rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_medecin_new_rdv();

CREATE TRIGGER trigger_notify_medecin_rdv_modified
  AFTER UPDATE ON public.rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_medecin_rdv_modified();

-- ─────────────────────────────────────────────
-- 4. TEST : Vérifier le formatage
-- ─────────────────────────────────────────────

-- Tester manuellement :
SELECT 
  'Test 1: 14:30' as test,
  REPLACE('14:30', ':', 'h') as résultat;

SELECT 
  'Test 2: 08:00' as test,
  REPLACE('08:00', ':', 'h') as résultat;

SELECT 
  'Test 3: 16:45' as test,
  REPLACE('16:45', ':', 'h') as résultat;

-- ─────────────────────────────────────────────
-- 5. MESSAGE DE SUCCÈS
-- ─────────────────────────────────────────────
SELECT '✅ Formatage d''heure corrigé ! Format : HH:MM → HHhMM' AS message;
