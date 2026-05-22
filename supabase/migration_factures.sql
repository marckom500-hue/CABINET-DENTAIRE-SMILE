-- ============================================================
-- SMILE — Tables des Factures (Migration)
-- À exécuter dans Supabase → SQL Editor → Run
-- ============================================================

-- 1) TABLE FACTURES
CREATE TABLE IF NOT EXISTS public.factures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id        UUID REFERENCES public.devis(id) ON DELETE SET NULL,
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  numero          TEXT UNIQUE,
  date_emission   DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance   DATE,
  montant_ht      NUMERIC(12,2) NOT NULL DEFAULT 0,
  tva             NUMERIC(12,2) DEFAULT 0,
  montant_ttc     NUMERIC(12,2) NOT NULL DEFAULT 0,
  statut          TEXT DEFAULT 'brouillon' CHECK (statut IN ('brouillon','emise','payee','partiellement_payee','annulee')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_factures_patient ON public.factures(patient_id);
-- Ensure `numero` column exists when migrating from older schema
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS numero TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_factures_numero ON public.factures(numero);

ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "factures_read" ON public.factures;
CREATE POLICY "factures_read"  ON public.factures FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','comptable'));
DROP POLICY IF EXISTS "factures_write" ON public.factures;
CREATE POLICY "factures_write" ON public.factures FOR ALL USING (public.get_my_role() IN ('superadmin','comptable'));


-- 2) TABLE LIGNES_FACTURES
CREATE TABLE IF NOT EXISTS public.lignes_factures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id    UUID NOT NULL REFERENCES public.factures(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  quantite      NUMERIC(10,2) NOT NULL DEFAULT 1,
  prix_unitaire NUMERIC(12,2) NOT NULL DEFAULT 0,
  montant_ht    NUMERIC(12,2) NOT NULL DEFAULT 0,
  tva           NUMERIC(12,2) DEFAULT 0,
  montant_ttc   NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lignes_factures ON public.lignes_factures(facture_id);

ALTER TABLE public.lignes_factures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lignes_factures_read" ON public.lignes_factures;
CREATE POLICY "lignes_factures_read"  ON public.lignes_factures FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','comptable'));
DROP POLICY IF EXISTS "lignes_factures_write" ON public.lignes_factures;
CREATE POLICY "lignes_factures_write" ON public.lignes_factures FOR ALL USING (public.get_my_role() IN ('superadmin','comptable'));


-- 3) TRIGGER : Auto-générer numéro de facture
-- Ensure `date_emission` exists for legacy schemas and migrate `date` -> `date_emission` when present
ALTER TABLE public.factures ADD COLUMN IF NOT EXISTS date_emission DATE;
-- If some rows used `date` previously, copy values into `date_emission` when missing
UPDATE public.factures
SET date_emission = (to_jsonb(public.factures)->>'date')::date
WHERE date_emission IS NULL AND (to_jsonb(public.factures)->>'date') IS NOT NULL;

-- Create a robust trigger that handles both `date_emission` and legacy `date` column
CREATE OR REPLACE FUNCTION public.generate_facture_numero()
RETURNS TRIGGER AS $$
DECLARE
  d DATE;
  cnt INT;
BEGIN
  -- read date from NEW row safely via JSON extraction to avoid runtime errors when a column is missing
  d := COALESCE((row_to_json(NEW)->>'date_emission')::date, (row_to_json(NEW)->>'date')::date, CURRENT_DATE);

  IF NEW.numero IS NULL THEN
    -- count existing factures for the same period, using JSON extraction to tolerate legacy column names
    SELECT COUNT(*) INTO cnt FROM public.factures f
      WHERE COALESCE((to_jsonb(f)->>'date_emission')::date, (to_jsonb(f)->>'date')::date, CURRENT_DATE) = d;

    NEW.numero := 'FACT-' || TO_CHAR(d, 'YYYYMM') || '-' || LPAD((cnt + 1)::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_facture_numero ON public.factures;
CREATE TRIGGER trigger_facture_numero
  BEFORE INSERT ON public.factures
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_facture_numero();


-- 4) Vérification
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('factures','lignes_factures') ORDER BY tablename;
