# 🚀 Guide : Appliquer la Migration RDV Workflow

## ⚠️ IMPORTANT : Ordre des Opérations

**L'erreur arrive car vous avez des RDV avec les anciens statuts (attente, confirme, recu, urgent).**

**Solution:** Convertir les anciens statuts EN PREMIER, puis modifier la contrainte.

---

## ✅ Étapes à Suivre

### **Étape 1 : Ouvrir Supabase SQL Editor**

1. Allez à https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Cliquez **New Query**

### **Étape 2 : Exécuter la Migration Corrigée**

1. **Collez le contenu entier du fichier:** `supabase_rdv_workflow_migration_FINAL.sql`

2. **Cliquez RUN**

3. **Attendez la fin** (quelques secondes)

### **Étape 3 : Vérifier le Résultat**

Vous devez voir dans la console:
```
✓ INSERT completed successfully
✓ ALTER TABLE completed successfully
```

**Pas d'erreur = Succès! ✅**

### **Étape 4 : Rafraîchir l'Application**

Appuyez sur **Ctrl+F5** (ou Cmd+Shift+R sur Mac)

### **Étape 5 : Tester le Workflow**

#### Test 1: Créer un RDV
- Allez à **Rendez-vous**
- Cliquez **Nouveau RDV**
- Le statut doit être **"Programmé"** ✓

#### Test 2: Confirmer un RDV
- Allez à **Mes RDV** (page médecin)
- Vous devez voir:
  - Bouton **CONFIRMER** en vert/surbrillance
  - Bouton **TERMINER** en gris/flou
  - Bouton **ANNULER** en rouge/surbrillance
- Cliquez **CONFIRMER**
- Le bouton **TERMINER** devient bleu/actif ✓

#### Test 3: Terminer un RDV
- Cliquez **TERMINER**
- Une dialog apparaît: "Patient présent?" ✓
- Cliquez **Présent** ou **Absent**
- RDV passe en statut **"Terminé"** ✓

#### Test 4: Dashboard
- Allez à **Dashboard**
- Section "Patients reçus récemment" doit afficher les patients avec RDV terminé ✓

---

## 🔍 Dépannage

### **Erreur: "check constraint violation"**

**Cause:** Il reste encore des anciens statuts dans la BD

**Solution:**
```sql
-- Vérifier les statuts existants
SELECT DISTINCT statut, COUNT(*) 
FROM public.rendez_vous 
GROUP BY statut;

-- Si vous voyez d'autres statuts que programmé/annulé/confirmé/terminé:
UPDATE public.rendez_vous 
SET statut = 'programmé' 
WHERE statut NOT IN ('programmé', 'confirmé', 'terminé', 'annulé');

-- Puis réessayer la migration
```

### **Les boutons du médecin ne s'affichent pas correctement**

**Cause:** App pas rafraîchie après migration

**Solution:** Ctrl+Shift+Delete (vider cache) puis Ctrl+F5

### **Dashboard vide (pas de patients reçus)**

**Cause:** Pas encore de RDV terminés avec patient_present=true

**Solution:** Créer un RDV test et le marquer comme terminé+présent

---

## ✨ Résumé des Changements

### **Avant la Migration**

```
Statuts : attente, confirme, recu, urgent, annulé
Actions médecin : Confirmer, Annuler (sans Terminer)
patient_present : N'existe pas
```

### **Après la Migration**

```
Statuts : programmé, confirmé, terminé, annulé
Actions médecin : 
  - RDV Programmé: Confirmer, Annuler, Terminer(flou)
  - RDV Confirmé: Terminer, Annuler
  - RDV Terminé: Aucun (finalisé)
patient_present : true/false (marqué lors de la fin)
```

---

## 📋 Fichiers de Référence

- **Migration SQL:** `supabase_rdv_workflow_migration_FINAL.sql`
- **Workflow complet:** `RDV_DOCTOR_WORKFLOW_COMPLETE.md`
- **Code médecin:** `src/pages/MedecinRdv.jsx`

---

## 🎯 Checklist Finale

- [ ] Migration SQL exécutée sans erreurs
- [ ] App rafraîchie (Ctrl+F5)
- [ ] Nouveau RDV créé → Statut = "Programmé"
- [ ] Boutons médecin: Confirmer visible, Terminer gris
- [ ] Clique Confirmer → Terminer devient bleu
- [ ] Clique Terminer → Dialog présent/absent
- [ ] Dashboard affiche "Patients reçus" (RDV terminés)

**Si tout OK: Migration réussie! 🎉**

---

## 🆘 Besoin d'Aide?

Si erreur persistent:
1. Vérifier les logs de Supabase
2. Exécuter la requête de vérification pour voir les statuts actuels
3. Convertir manuellement les anciens statuts
4. Puis réappliquer la migration

**Prêt à exécuter?** Oui! 👍
