-- ============================================================
-- MIGRATION : Nouveau workflow RDV (programmé, terminé, annulé)
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1. Ajouter la colonne patient_present
ALTER TABLE public.rendez_vous 
ADD COLUMN IF NOT EXISTS patient_present BOOLEAN DEFAULT NULL;

-- 2. Modifier la contrainte CHECK
ALTER TABLE public.rendez_vous 
DROP CONSTRAINT IF EXISTS rendez_vous_statut_check;

ALTER TABLE public.rendez_vous 
ADD CONSTRAINT rendez_vous_statut_check 
CHECK (statut IN ('programmé','confirmé','terminé','annulé'));

-- 3. Migrer les statuts existants vers "programmé"
UPDATE public.rendez_vous 
SET statut = 'programmé' 
WHERE statut IN ('attente', 'confirme', 'recu', 'urgent', 'programme');

-- 4. Vérifier les changements
SELECT DISTINCT statut, COUNT(*) as nombre
FROM public.rendez_vous
GROUP BY statut
ORDER BY statut;

-- Résultat attendu :
-- statut    | nombre
-- programmé | X
-- annulé    | Y
