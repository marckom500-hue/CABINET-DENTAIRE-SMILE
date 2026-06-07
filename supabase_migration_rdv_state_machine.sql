-- ============================================================
-- MIGRATION: Amélioration de la machine à états des RDV
-- Ajoute des colonnes et des contraintes pour la robustesse
-- ============================================================

-- STEP 1: Ajouter la colonne is_urgent
ALTER TABLE rendez_vous ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;
COMMENT ON COLUMN rendez_vous.is_urgent IS 'True si le RDV est marqué comme urgent (priorité)';

-- STEP 2: Ajouter la colonne updated_at pour l'audit
ALTER TABLE rendez_vous ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
COMMENT ON COLUMN rendez_vous.updated_at IS 'Timestamp de la dernière modification';

-- STEP 3: Ajouter la contrainte: Si terminé, patient_present ne peut pas être NULL
ALTER TABLE rendez_vous ADD CONSTRAINT IF NOT EXISTS chk_termine_has_presence
  CHECK (statut != 'terminé' OR patient_present IS NOT NULL);

-- STEP 4: Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_rendez_vous_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rendez_vous_update_timestamp ON rendez_vous;
CREATE TRIGGER rendez_vous_update_timestamp
  BEFORE UPDATE ON rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION update_rendez_vous_updated_at();

-- STEP 5: Créer des index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_rendez_vous_statut ON rendez_vous(statut);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_medecin_date ON rendez_vous(medecin_id, date);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_date_statut ON rendez_vous(date, statut);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_is_urgent ON rendez_vous(is_urgent) 
  WHERE is_urgent = true;

-- STEP 6: Vérifier l'intégrité des données
SELECT 
  COUNT(*) as total_rdv,
  SUM(CASE WHEN statut = 'programmé' THEN 1 ELSE 0 END) as programmés,
  SUM(CASE WHEN statut = 'confirmé' THEN 1 ELSE 0 END) as confirmés,
  SUM(CASE WHEN statut = 'terminé' THEN 1 ELSE 0 END) as terminés,
  SUM(CASE WHEN statut = 'annulé' THEN 1 ELSE 0 END) as annulés,
  SUM(CASE WHEN statut = 'terminé' AND patient_present IS NULL THEN 1 ELSE 0 END) as erreurs_presence
FROM rendez_vous;

-- STEP 7: Afficher les RDV avec potential issues
SELECT 
  id,
  date,
  heure,
  statut,
  patient_present,
  is_urgent,
  'ERREUR: Terminé sans présence' as issue
FROM rendez_vous
WHERE statut = 'terminé' AND patient_present IS NULL
LIMIT 10;

-- ============================================================
-- Migrations complétées avec succès
-- ============================================================
