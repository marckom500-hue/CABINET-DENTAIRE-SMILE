-- ============================================================
-- Migration Devis: nouveau cycle de vie des statuts
-- ============================================================
-- A executer dans Supabase SQL Editor.
--
-- Cycle:
-- en_attente -> accepte / rejete / annule / expire
-- accepte -> converti_facture / rejete / annule
-- converti_facture -> terminal
-- rejete / annule / expire -> optionnellement rouvert en en_attente
-- ============================================================

ALTER TABLE public.devis
  ADD COLUMN IF NOT EXISTS facture_id UUID REFERENCES public.factures(id) ON DELETE SET NULL;

DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.devis'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%statut%'
  LOOP
    EXECUTE format('ALTER TABLE public.devis DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
  END LOOP;
END $$;

ALTER TABLE public.devis
  ALTER COLUMN statut SET DEFAULT 'en_attente';

UPDATE public.devis
SET statut = CASE
  WHEN lower(statut) IN ('brouillon', 'envoyé', 'envoye') THEN 'en_attente'
  WHEN lower(statut) IN ('facturisé', 'facturise') THEN 'converti_facture'
  WHEN lower(statut) IN ('accepté', 'accepte') THEN 'accepté'
  WHEN lower(statut) IN ('rejeté', 'rejete') THEN 'rejeté'
  WHEN lower(statut) IN ('annulé', 'annule') THEN 'annulé'
  WHEN lower(statut) IN ('expiré', 'expire') THEN 'expiré'
  WHEN statut = 'converti_facture' THEN 'converti_facture'
  WHEN statut = 'en_attente' THEN 'en_attente'
  ELSE 'en_attente'
END;

ALTER TABLE public.devis
  ADD CONSTRAINT devis_statut_check
  CHECK (statut IN ('en_attente','accepté','converti_facture','rejeté','annulé','expiré'));

CREATE INDEX IF NOT EXISTS idx_devis_facture_id ON public.devis(facture_id);

CREATE OR REPLACE FUNCTION public.expire_devis_sans_action()
RETURNS void AS $$
BEGIN
  UPDATE public.devis
  SET statut = 'expiré',
      updated_at = now()
  WHERE statut = 'en_attente'
    AND date_creation <= CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT public.expire_devis_sans_action();
