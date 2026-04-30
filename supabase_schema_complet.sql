-- ============================================================
-- SMILE — Schéma complet Supabase
-- À exécuter dans Supabase → SQL Editor → Run
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. TABLE USERS_PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom          TEXT NOT NULL DEFAULT '',
  prenom       TEXT NOT NULL DEFAULT '',
  email        TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT 'secretaire'
               CHECK (role IN ('superadmin','medecin','secretaire','comptable','assistant')),
  actif        BOOLEAN NOT NULL DEFAULT true,
  last_sign_in TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Trigger : profil automatique à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'secretaire')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Synchronise les comptes existants qui n'ont pas encore de profil
INSERT INTO public.users_profiles (id, email, role)
SELECT au.id, au.email, 'secretaire'
FROM auth.users au
LEFT JOIN public.users_profiles up ON up.id = au.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Helper : obtenir le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users_profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- RLS
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_self_read"       ON public.users_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile_admin_read"      ON public.users_profiles FOR SELECT USING (public.get_my_role() = 'superadmin');
CREATE POLICY "profile_admin_write"     ON public.users_profiles FOR ALL    USING (public.get_my_role() = 'superadmin');
CREATE POLICY "profile_self_update"     ON public.users_profiles FOR UPDATE USING (auth.uid() = id);


-- ─────────────────────────────────────────────
-- 2. TABLE PATIENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom             TEXT NOT NULL,
  prenom          TEXT NOT NULL,
  telephone       TEXT,
  email           TEXT,
  date_naissance  DATE,
  groupe_sanguin  TEXT,
  adresse         TEXT,
  statut          TEXT DEFAULT 'Actif',
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patients_read"  ON public.patients FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','assistant'));
CREATE POLICY "patients_write" ON public.patients FOR ALL    USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 3. TABLE RENDEZ_VOUS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rendez_vous (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  date        DATE NOT NULL,
  heure       TEXT NOT NULL,
  type_acte   TEXT NOT NULL DEFAULT 'Consultation',
  duree       INTEGER DEFAULT 30,
  statut      TEXT DEFAULT 'attente' CHECK (statut IN ('confirme','attente','urgent','annule')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rdv_read"  ON public.rendez_vous FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','assistant'));
CREATE POLICY "rdv_write" ON public.rendez_vous FOR ALL    USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));


-- ─────────────────────────────────────────────
-- 4. TABLE ORDONNANCES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ordonnances (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  medicaments  TEXT NOT NULL,
  posologie    TEXT,
  duree        TEXT DEFAULT '7 jours',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ordonnances ENABLE ROW LEVEL SECURITY;
-- Uniquement médecin et superadmin
CREATE POLICY "ordonnances_read"  ON public.ordonnances FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin'));
CREATE POLICY "ordonnances_write" ON public.ordonnances FOR ALL    USING (public.get_my_role() IN ('superadmin','medecin'));


-- ─────────────────────────────────────────────
-- 5. TABLE FACTURES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.factures (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  acte        TEXT,
  montant     NUMERIC(12,2) NOT NULL DEFAULT 0,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  statut      TEXT DEFAULT 'attente' CHECK (statut IN ('paye','attente','annule')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "factures_read"  ON public.factures FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','comptable'));
CREATE POLICY "factures_write" ON public.factures FOR ALL    USING (public.get_my_role() IN ('superadmin','secretaire','comptable'));


-- ─────────────────────────────────────────────
-- 6. TABLE STOCK
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_produit  TEXT NOT NULL,
  quantite     INTEGER NOT NULL DEFAULT 0,
  max          INTEGER NOT NULL DEFAULT 100,
  seuil        INTEGER NOT NULL DEFAULT 20,
  couleur      TEXT DEFAULT '#0d9488',
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_read"  ON public.stock FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire','assistant'));
CREATE POLICY "stock_write" ON public.stock FOR ALL    USING (public.get_my_role() IN ('superadmin','secretaire','assistant'));


-- ─────────────────────────────────────────────
-- 7. TABLE RAPPELS_SMS (historique)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rappels_sms (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdv_id     UUID REFERENCES public.rendez_vous(id) ON DELETE SET NULL,
  statut     TEXT DEFAULT 'pending' CHECK (statut IN ('envoye','echec','pending')),
  message    TEXT,
  erreur     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rappels_sms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rappels_read"  ON public.rappels_sms FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));
CREATE POLICY "rappels_write" ON public.rappels_sms FOR ALL USING (true); -- Edge Function utilise service role


-- ─────────────────────────────────────────────
-- 8. TABLE RAPPELS_CONFIG
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rappels_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actif             BOOLEAN NOT NULL DEFAULT true,
  delai_heures      INTEGER NOT NULL DEFAULT 24,
  message_template  TEXT NOT NULL DEFAULT 'Bonjour {prenom}, vous avez un RDV au Cabinet Dr. Boutchouang le {date} à {heure} ({type_acte}). Pour toute modification, appelez le 6XX XXX XXX.',
  envoi_auto        BOOLEAN NOT NULL DEFAULT true,
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Insère la config par défaut si elle n'existe pas
INSERT INTO public.rappels_config DEFAULT VALUES
ON CONFLICT DO NOTHING;

ALTER TABLE public.rappels_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_read"  ON public.rappels_config FOR SELECT USING (public.get_my_role() IN ('superadmin','medecin','secretaire'));
CREATE POLICY "config_write" ON public.rappels_config FOR ALL    USING (public.get_my_role() = 'superadmin');


-- ─────────────────────────────────────────────
-- 9. CRON JOB — Rappels automatiques quotidiens
-- Activer l'extension pg_cron dans Supabase → Extensions
-- ─────────────────────────────────────────────
-- Exécute la Edge Function chaque jour à 8h00 (heure Supabase = UTC)
-- Pour le Cameroun (UTC+1), 8h locale = 7h UTC

SELECT cron.schedule(
  'rappels-rdv-quotidiens',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url    := current_setting('app.supabase_url') || '/functions/v1/send-rappel-rdv',
    body   := '{"mode":"auto"}'::jsonb,
    headers:= jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.anon_key')
    )
  );
  $$
);


-- ─────────────────────────────────────────────
-- 10. DÉFINIR LE PREMIER SUPERADMIN
-- Décommente et remplace l'email par le tien
-- ─────────────────────────────────────────────
-- UPDATE public.users_profiles
-- SET role = 'superadmin', nom = 'Boutchouang', prenom = 'Dr.'
-- WHERE email = 'ton-email@cabinet.cm';


-- ─────────────────────────────────────────────
-- VÉRIFICATION FINALE
-- ─────────────────────────────────────────────
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
