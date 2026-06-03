-- ============================================================
-- MIGRATION : Supprimer le statut "urgent" du système
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1. Modifier la contrainte CHECK de la table rendez_vous
-- Supprimer l'ancienne contrainte et créer une nouvelle sans "urgent"

ALTER TABLE public.rendez_vous 
DROP CONSTRAINT IF EXISTS rendez_vous_statut_check;

ALTER TABLE public.rendez_vous 
ADD CONSTRAINT rendez_vous_statut_check 
CHECK (statut IN ('confirme','attente','recu','annule'));

-- 2. Convertir les RDV avec statut "urgent" en "attente"
UPDATE public.rendez_vous 
SET statut = 'attente' 
WHERE statut = 'urgent';

-- 3. Vérifier que tous les statuts sont valides
SELECT DISTINCT statut, COUNT(*) as nombre
FROM public.rendez_vous
GROUP BY statut
ORDER BY nombre DESC;

-- Résultat attendu :
-- statut  | nombre
-- attente | X
-- confirme| X
-- recu    | X
-- annule  | X
-- (pas de "urgent")
