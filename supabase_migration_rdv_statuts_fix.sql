-- ============================================================
-- MIGRATION: Correction des statuts de RENDEZ_VOUS
-- Synchronise BD et Frontend (les 4 vrais statuts)
-- ============================================================
-- BEFORE: 'confirme','attente','urgent','annule' (5 états confus)
-- AFTER:  'programmé','confirmé','terminé','annulé'   (4 états clairs)
-- ============================================================

-- STEP 1: Vérification des données existantes
-- Voir combien de RDV utilisent chaque statut
SELECT statut, COUNT(*) as count
FROM rendez_vous
GROUP BY statut
ORDER BY count DESC;

-- STEP 2: Ajouter la nouvelle colonne `patient_present` (pour marquer présence/absence)
ALTER TABLE rendez_vous ADD COLUMN IF NOT EXISTS patient_present BOOLEAN DEFAULT NULL;
COMMENT ON COLUMN rendez_vous.patient_present IS 'NULL=non défini, TRUE=patient présent, FALSE=patient absent';

-- STEP 3: Supprimer l'ancienne contrainte CHECK
ALTER TABLE rendez_vous DROP CONSTRAINT IF EXISTS rendez_vous_statut_check;

-- STEP 4: Ajouter la nouvelle contrainte CHECK avec les 4 statuts corrects
ALTER TABLE rendez_vous ADD CONSTRAINT rendez_vous_statut_check 
  CHECK (statut IN ('programmé','confirmé','terminé','annulé'));

-- STEP 5: Migrer les données existantes
-- 'attente' → 'programmé' (attente = programmé selon la logique frontend)
UPDATE rendez_vous SET statut = 'programmé' WHERE statut = 'attente';

-- 'urgent' → 'confirmé' (urgent = confirmé et prioritaire, frontend n'utilise pas 'urgent')
UPDATE rendez_vous SET statut = 'confirmé' WHERE statut = 'urgent';

-- 'confirme' → 'confirmé' (ajouter l'accent pour cohérence)
UPDATE rendez_vous SET statut = 'confirmé' WHERE statut = 'confirme';

-- 'annule' → 'annulé' (ajouter l'accent pour cohérence)
UPDATE rendez_vous SET statut = 'annulé' WHERE statut = 'annule';

-- STEP 6: Vérifier la migration
SELECT statut, COUNT(*) as count
FROM rendez_vous
GROUP BY statut
ORDER BY count DESC;

-- STEP 7: Créer un index sur patient_present pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient_present 
  ON rendez_vous(patient_present) 
  WHERE patient_present IS NOT NULL;

-- STEP 8: Créer un index composite pour les statistiques (terminé + présent)
CREATE INDEX IF NOT EXISTS idx_rendez_vous_termine_present 
  ON rendez_vous(statut, patient_present) 
  WHERE statut = 'terminé';

-- ============================================================
-- Vérification finale
-- ============================================================
SELECT 
  COUNT(*) as total_rdv,
  SUM(CASE WHEN statut = 'programmé' THEN 1 ELSE 0 END) as programmés,
  SUM(CASE WHEN statut = 'confirmé' THEN 1 ELSE 0 END) as confirmés,
  SUM(CASE WHEN statut = 'terminé' THEN 1 ELSE 0 END) as terminés,
  SUM(CASE WHEN statut = 'annulé' THEN 1 ELSE 0 END) as annulés,
  SUM(CASE WHEN patient_present IS NOT NULL THEN 1 ELSE 0 END) as avec_presence_définie
FROM rendez_vous;
