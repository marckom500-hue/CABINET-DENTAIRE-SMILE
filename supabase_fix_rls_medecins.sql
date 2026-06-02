-- ============================================================
-- FIX RLS : Permettre aux secrétaires de lire les médecins
-- ============================================================

-- Vérifier les policies actuelles
SELECT * FROM pg_policies WHERE tablename = 'users_profiles' ORDER BY policyname;

-- ────────────────────────────────────────────────────────────
-- Solution 1 : Ajouter une policy pour secrétaires
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "secretaire_read_doctors" ON public.users_profiles;

CREATE POLICY "secretaire_read_doctors" 
  ON public.users_profiles 
  FOR SELECT 
  USING (
    -- Un secrétaire peut voir : superadmin, medecin, et les autres secrétaires
    public.get_my_role() IN ('superadmin', 'secretaire')
    AND role IN ('medecin', 'superadmin')
  );

-- ────────────────────────────────────────────────────────────
-- Solution 2 : Policy alternative plus permissive (si 1 ne marche pas)
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anyone_read_doctors" ON public.users_profiles;

CREATE POLICY "anyone_read_doctors" 
  ON public.users_profiles 
  FOR SELECT 
  USING (role IN ('medecin', 'superadmin'));

-- ────────────────────────────────────────────────────────────
-- Vérification : Tous les médecins actifs
-- ────────────────────────────────────────────────────────────

SELECT id, nom, prenom, email, role, actif, created_at
FROM public.users_profiles 
WHERE role IN ('medecin', 'superadmin') 
AND actif = true
ORDER BY nom, prenom;

-- ────────────────────────────────────────────────────────────
-- Debug : Vérifier votre rôle courant
-- ────────────────────────────────────────────────────────────

SELECT public.get_my_role() AS mon_role;

-- ────────────────────────────────────────────────────────────
-- Debug : Test requête médecins
-- ────────────────────────────────────────────────────────────

SELECT id, nom, prenom 
FROM public.users_profiles 
WHERE role IN ('medecin', 'superadmin') 
AND actif = true
LIMIT 10;
