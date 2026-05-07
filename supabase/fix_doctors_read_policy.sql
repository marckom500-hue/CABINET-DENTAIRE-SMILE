-- ============================================================
-- FIX: Allow doctors to see other doctors for selection
-- ============================================================
-- This fixes the issue where regular doctors cannot select 
-- the superadmin (or other doctors) as treating physician
-- ============================================================

-- Add a new policy that allows users with medecin or superadmin role
-- to read other users_profiles for the purpose of selecting doctors
CREATE POLICY "profile_doctors_read" ON public.users_profiles 
FOR SELECT 
USING (
  public.get_my_role() IN ('superadmin', 'medecin')
  AND role IN ('superadmin', 'medecin')
);

-- Alternative: If you want all authenticated medical staff to see each other:
-- CREATE POLICY "profile_medical_staff_read" ON public.users_profiles 
-- FOR SELECT 
-- USING (
--   public.get_my_role() IN ('superadmin', 'medecin', 'secretaire', 'assistant')
--   AND role IN ('superadmin', 'medecin')
-- );

-- Verify the new policy exists
SELECT tablename, policyname, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users_profiles'
ORDER BY tablename, policyname;