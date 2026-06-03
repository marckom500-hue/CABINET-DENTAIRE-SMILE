-- ============================================================
-- SETUP : Table de configuration + données mock
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. CRÉER TABLE app_config (mode mock/réel)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.app_config (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer la configuration par défaut
INSERT INTO public.app_config (key, value, description)
VALUES ('use_mock_data', 'false', 'true = utiliser données mock, false = données réelles')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ─────────────────────────────────────────────
-- 2. CRÉER TABLE factures_mock
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.factures_mock (
  id BIGSERIAL PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  acte TEXT NOT NULL,
  montant DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'paye',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_factures_mock_date ON public.factures_mock(date);
CREATE INDEX IF NOT EXISTS idx_factures_mock_patient ON public.factures_mock(patient_id);

-- RLS
ALTER TABLE public.factures_mock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent voir les factures mock"
  ON public.factures_mock FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────
-- 3. INSÉRER DONNÉES MOCK (36 factures, 6 mois)
-- ─────────────────────────────────────────────

DO $$
DECLARE
  p_ids UUID[];
BEGIN
  -- Récupérer 5 patients existants
  SELECT ARRAY_AGG(id) INTO p_ids FROM (SELECT id FROM public.patients LIMIT 5);
  
  IF array_length(p_ids, 1) < 5 THEN
    RAISE EXCEPTION 'Au moins 5 patients requis. Actuellement: %', array_length(p_ids, 1);
  END IF;

  -- Truncate la table avant insertion
  DELETE FROM public.factures_mock;

  INSERT INTO public.factures_mock (patient_id, acte, montant, date, statut)
  VALUES
  -- JANVIER 2026 (440k)
  (p_ids[1], 'Consultation', 25000, '2026-01-05', 'paye'),
  (p_ids[2], 'Détartrage', 45000, '2026-01-10', 'paye'),
  (p_ids[3], 'Extraction', 80000, '2026-01-15', 'paye'),
  (p_ids[1], 'Radiographie', 15000, '2026-01-20', 'paye'),
  (p_ids[4], 'Implant', 250000, '2026-01-25', 'paye'),
  (p_ids[5], 'Consultation', 25000, '2026-01-28', 'attente'),
  -- FÉVRIER 2026 (490k)
  (p_ids[2], 'Détartrage', 45000, '2026-02-03', 'paye'),
  (p_ids[3], 'Consultation', 25000, '2026-02-08', 'paye'),
  (p_ids[1], 'Extraction', 80000, '2026-02-12', 'paye'),
  (p_ids[4], 'Radiographie', 15000, '2026-02-18', 'paye'),
  (p_ids[5], 'Implant', 280000, '2026-02-22', 'paye'),
  (p_ids[2], 'Urgence', 50000, '2026-02-27', 'paye'),
  -- MARS 2026 (490k)
  (p_ids[1], 'Consultation', 25000, '2026-03-04', 'paye'),
  (p_ids[3], 'Détartrage', 45000, '2026-03-09', 'paye'),
  (p_ids[4], 'Extraction', 80000, '2026-03-13', 'paye'),
  (p_ids[5], 'Radiographie', 15000, '2026-03-19', 'paye'),
  (p_ids[1], 'Implant', 300000, '2026-03-24', 'paye'),
  (p_ids[2], 'Consultation', 25000, '2026-03-29', 'attente'),
  -- AVRIL 2026 (540k)
  (p_ids[3], 'Consultation', 25000, '2026-04-02', 'paye'),
  (p_ids[4], 'Détartrage', 45000, '2026-04-07', 'paye'),
  (p_ids[5], 'Extraction', 80000, '2026-04-11', 'paye'),
  (p_ids[1], 'Radiographie', 15000, '2026-04-16', 'paye'),
  (p_ids[2], 'Implant', 290000, '2026-04-21', 'paye'),
  (p_ids[3], 'Urgence', 60000, '2026-04-26', 'paye'),
  -- MAI 2026 (500k)
  (p_ids[4], 'Consultation', 25000, '2026-05-05', 'paye'),
  (p_ids[5], 'Détartrage', 45000, '2026-05-10', 'paye'),
  (p_ids[1], 'Extraction', 80000, '2026-05-14', 'paye'),
  (p_ids[2], 'Radiographie', 15000, '2026-05-20', 'paye'),
  (p_ids[3], 'Implant', 310000, '2026-05-25', 'paye'),
  (p_ids[4], 'Consultation', 25000, '2026-05-30', 'attente'),
  -- JUIN 2026 (540k)
  (p_ids[5], 'Consultation', 25000, '2026-06-02', 'paye'),
  (p_ids[1], 'Détartrage', 45000, '2026-06-07', 'paye'),
  (p_ids[2], 'Extraction', 80000, '2026-06-11', 'paye'),
  (p_ids[3], 'Radiographie', 15000, '2026-06-16', 'paye'),
  (p_ids[4], 'Implant', 320000, '2026-06-21', 'paye'),
  (p_ids[5], 'Urgence', 55000, '2026-06-26', 'paye');
  
  RAISE NOTICE '✓ 36 factures mock insérées avec succès!';
END $$;

-- ─────────────────────────────────────────────
-- 4. VÉRIFIER LES DONNÉES MOCK INSÉRÉES
-- ─────────────────────────────────────────────

SELECT 
  DATE_TRUNC('month', date)::date as mois,
  COUNT(*) as nombre_factures,
  SUM(montant) as total_mois
FROM public.factures_mock
GROUP BY DATE_TRUNC('month', date)
ORDER BY mois;

-- Résultat attendu :
-- mois       | nombre_factures | total_mois
-- 2026-01-01 | 6               | 440000
-- 2026-02-01 | 6               | 490000
-- 2026-03-01 | 6               | 490000
-- 2026-04-01 | 6               | 540000
-- 2026-05-01 | 6               | 500000
-- 2026-06-01 | 6               | 540000

-- ─────────────────────────────────────────────
-- 5. VÉRIFIER CONFIGURATION
-- ─────────────────────────────────────────────

SELECT * FROM public.app_config WHERE key = 'use_mock_data';
