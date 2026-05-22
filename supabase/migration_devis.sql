-- ============================================================
-- SMILE — Tables des Devis (Migration)
-- À exécuter dans Supabase → SQL Editor → Run
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE DEVIS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devis (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  numero                TEXT UNIQUE, -- Auto-généré: DEVIS-YYYYMMDD-0001
  date_creation         DATE NOT NULL DEFAULT CURRENT_DATE,
  date_validite         DATE NOT NULL, -- Date limite d'acceptation
  date_acceptation      DATE,
  montant_total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  TVA                   NUMERIC(12,2) DEFAULT 0,
  remise_percent        NUMERIC(5,2) DEFAULT 0,
  remise_montant        NUMERIC(12,2) DEFAULT 0,
  statut                TEXT DEFAULT 'brouillon' CHECK (statut IN ('brouillon','envoyé','accepté','rejeté','facturisé','annulé')),
  notes                 TEXT,
  conditions            TEXT, -- Conditions de paiement
  signature_patient_url TEXT, -- URL de la signature stockée
  signature_medecin_url TEXT, -- URL de la signature du médecin
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_devis_patient ON public.devis(patient_id);
CREATE INDEX idx_devis_statut ON public.devis(statut);
CREATE INDEX idx_devis_numero ON public.devis(numero);

ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devis_read"  ON public.devis 
  FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','comptable'));
CREATE POLICY "devis_write" ON public.devis 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 2. TABLE LIGNES_DEVIS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lignes_devis (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id        UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantite        NUMERIC(10,2) NOT NULL DEFAULT 1,
  prix_unitaire   NUMERIC(12,2) NOT NULL DEFAULT 0,
  montant         NUMERIC(12,2) NOT NULL DEFAULT 0, -- quantite * prix_unitaire
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lignes_devis ON public.lignes_devis(devis_id);

ALTER TABLE public.lignes_devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lignes_read"  ON public.lignes_devis 
  FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','comptable'));
CREATE POLICY "lignes_write" ON public.lignes_devis 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 3. TRIGGER : Auto-générer numéro de devis
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_devis_numero()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero IS NULL THEN
    NEW.numero := 'DEVIS-' || TO_CHAR(NEW.date_creation, 'YYYYMMDD') || '-' ||
                  LPAD(((SELECT COUNT(*) FROM public.devis WHERE date_creation = NEW.date_creation) + 1)::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_devis_numero ON public.devis;
CREATE TRIGGER trigger_devis_numero
  BEFORE INSERT ON public.devis
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_devis_numero();


-- ─────────────────────────────────────────────
-- 4. ACTES DENTAIRES STANDARD (pour quick-add dans devis)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.actes_dentaires (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom           TEXT NOT NULL UNIQUE,
  prix_standard NUMERIC(12,2),
  description   TEXT,
  categorie     TEXT, -- 'consultation', 'prevention', 'restauration', 'orthodontie', 'chirurgie'
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Insérer quelques actes standards
INSERT INTO public.actes_dentaires (nom, prix_standard, categorie) VALUES
('Consultation', 5000, 'consultation'),
('Détartrage', 10000, 'prevention'),
('Nettoyage', 8000, 'prevention'),
('Détection carie', 3000, 'consultation'),
('Oburation composite', 25000, 'restauration'),
('Dévitalisation', 50000, 'restauration'),
('Extraction dentaire', 15000, 'chirurgie'),
('Implant dentaire', 200000, 'chirurgie'),
('Détection traitement', 5000, 'consultation'),
('Visite de suivi', 5000, 'consultation')
ON CONFLICT DO NOTHING;

ALTER TABLE public.actes_dentaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "actes_read"  ON public.actes_dentaires FOR SELECT USING (true);
CREATE POLICY "actes_admin" ON public.actes_dentaires FOR ALL USING (public.get_my_role() = 'superadmin');


-- ─────────────────────────────────────────────
-- ✅ Vérification finale
-- ─────────────────────────────────────────────
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('devis', 'lignes_devis', 'actes_dentaires')
ORDER BY tablename;
