-- ============================================================
-- MIGRATION CORRECTED : Nouveau workflow RDV avec statut confirmé
-- À exécuter dans Supabase → SQL Editor (une seule fois)
-- ============================================================

-- ⚠️ ÉTAPE 1 : Convertir TOUS les anciens statuts en "programmé"
-- Ceci doit être fait EN PREMIER avant de modifier la contrainte
UPDATE public.rendez_vous 
SET statut = 'programmé' 
WHERE statut IN ('attente', 'confirme', 'recu', 'urgent', 'programme');

-- Vérifier les changements
SELECT DISTINCT statut, COUNT(*) as nombre
FROM public.rendez_vous
GROUP BY statut
ORDER BY statut;

-- Résultat attendu :
-- programmé | X
-- annulé    | Y
-- (aucun autre statut)

-- ⚠️ ÉTAPE 2 : Supprimer l'ancienne contrainte
ALTER TABLE public.rendez_vous 
DROP CONSTRAINT IF EXISTS rendez_vous_statut_check;

-- ⚠️ ÉTAPE 3 : Ajouter la nouvelle contrainte avec les 4 nouveaux statuts
ALTER TABLE public.rendez_vous 
ADD CONSTRAINT rendez_vous_statut_check 
CHECK (statut IN ('programmé','confirmé','terminé','annulé'));

-- ⚠️ ÉTAPE 4 : Ajouter la colonne patient_present si elle n'existe pas
ALTER TABLE public.rendez_vous 
ADD COLUMN IF NOT EXISTS patient_present BOOLEAN DEFAULT NULL;

-- ⚠️ ÉTAPE 5 : Vérifier que tout est bon
SELECT 
  COUNT(*) as total_rdv,
  COUNT(DISTINCT statut) as nombre_statuts,
  STRING_AGG(DISTINCT statut, ', ' ORDER BY statut) as statuts
FROM public.rendez_vous;

-- Résultat attendu :
-- total_rdv | nombre_statuts | statuts
-- X         | 2 ou 3         | annulé, programmé (et peut-être confirmé, terminé si vous avez des RDV avec ces statuts)

-- ✅ Migration complète!
-- Les 4 statuts valides sont maintenant : programmé, confirmé, terminé, annulé
