-- ============================================================
-- VÉRIFICATION: Est-ce que patient_present existe en BD?
-- ============================================================

-- STEP 1: Vérifier la structure de la table rendez_vous
\d rendez_vous

-- OU plus détaillé:
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'rendez_vous' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 2: Vérifier spécifiquement patient_present
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'rendez_vous' 
  AND column_name = 'patient_present'
  AND table_schema = 'public'
) as patient_present_exists;

-- STEP 3: Vérifier is_urgent
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'rendez_vous' 
  AND column_name = 'is_urgent'
  AND table_schema = 'public'
) as is_urgent_exists;

-- STEP 4: Vérifier updated_at
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'rendez_vous' 
  AND column_name = 'updated_at'
  AND table_schema = 'public'
) as updated_at_exists;

-- STEP 5: Afficher TOUTES les colonnes et leurs types
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'rendez_vous';
