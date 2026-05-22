-- ============================================================
-- SMILE — Tables du Dossier Médical (Migration)
-- À exécuter dans Supabase → SQL Editor → Run
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE ANTECEDENTS_PATIENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.antecedents_patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  type            TEXT NOT NULL, -- 'maladie', 'allergie', 'chirurgie', 'traitement', 'autre'
  description     TEXT NOT NULL,
  date_occurrence DATE,
  gravite         TEXT DEFAULT 'normal', -- 'normal', 'important', 'critique'
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_antecedents_patient ON public.antecedents_patients(patient_id);

ALTER TABLE public.antecedents_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "antecedents_read"  ON public.antecedents_patients 
  FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','assistant'));
CREATE POLICY "antecedents_write" ON public.antecedents_patients 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 2. TABLE TRAITEMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.traitements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  rdv_id          UUID REFERENCES public.rendez_vous(id) ON DELETE SET NULL,
  type_traitement TEXT NOT NULL, -- 'detartrage', 'carie', 'detartrage', 'implant', 'dévitalisation', etc.
  dent_numero     TEXT, -- numéro de dent (18-48)
  date_debut      DATE NOT NULL,
  date_fin        DATE,
  statut          TEXT DEFAULT 'en_cours', -- 'en_cours', 'termine', 'suspendu', 'annule'
  cout            NUMERIC(10,2),
  notes           TEXT,
  photo_avant_url TEXT, -- URL de la photo avant
  photo_apres_url TEXT, -- URL de la photo après
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_traitements_patient ON public.traitements(patient_id);
CREATE INDEX idx_traitements_rdv ON public.traitements(rdv_id);

ALTER TABLE public.traitements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "traitements_read"  ON public.traitements 
  FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','assistant'));
CREATE POLICY "traitements_write" ON public.traitements 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 3. TABLE ALLERGIES_PATIENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.allergies_patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  allergie        TEXT NOT NULL, -- nom de l'allergie
  gravite         TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'grave', 'critique'
  symptomes       TEXT,
  date_decouverte DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_allergies_patient ON public.allergies_patients(patient_id);

ALTER TABLE public.allergies_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allergies_read"  ON public.allergies_patients 
  FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','assistant'));
CREATE POLICY "allergies_write" ON public.allergies_patients 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 4. TABLE DOCUMENTS_PATIENTS (radiographies, etc.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents_patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  type_document   TEXT NOT NULL, -- 'radiographie', 'photo', 'scan', 'autre'
  titre           TEXT,
  url             TEXT NOT NULL, -- URL du fichier stocké
  date_creation   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_patient ON public.documents_patients(patient_id);

ALTER TABLE public.documents_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_read"  ON public.documents_patients 
  FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','assistant'));
CREATE POLICY "documents_write" ON public.documents_patients 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 5. TABLE NOTES_CONSULTATION
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes_consultation (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  rdv_id          UUID NOT NULL REFERENCES public.rendez_vous(id) ON DELETE CASCADE,
  medecin_id      UUID REFERENCES public.users_profiles(id),
  observations    TEXT,
  diagnostic      TEXT,
  plan_traitement TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notes_patient ON public.notes_consultation(patient_id);
CREATE INDEX idx_notes_rdv ON public.notes_consultation(rdv_id);

ALTER TABLE public.notes_consultation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_read"  ON public.notes_consultation 
  FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));
CREATE POLICY "notes_write" ON public.notes_consultation 
  FOR ALL USING (public.get_my_role() IN ('superadmin','medecin'));


-- ✅ Verification
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('antecedents_patients', 'traitements', 'allergies_patients', 'documents_patients', 'notes_consultation')
ORDER BY tablename;
