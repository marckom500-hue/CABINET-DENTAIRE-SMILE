# 🏥 Workflow RDV Médecin - Guide Complet

## 📋 Vue d'ensemble

**Nouveau workflow avec contrôle médecin:**

```
┌─ Programmé (par défaut)
│  ↓ [Médecin clique "Confirmer"]
├─ Confirmé (médecin approuve)
│  ├─ [Médecin clique "Terminer" + "Présent"] → Terminé (patient_present=true)
│  ├─ [Médecin clique "Terminer" + "Absent"] → Terminé (patient_present=false)
│  └─ [Médecin clique "Annuler"] → Annulé
└─ Annulé (n'importe quel moment)
```

---

## 🎯 Statuts RDV (4 statuts)

| Statut | Créé Par | Quand | Signification |
|--------|----------|-------|---------------|
| **Programmé** | Système | À la création du RDV | RDV créé, en attente d'approbation médecin |
| **Confirmé** | Médecin | Clique "Confirmer" | Médecin approuve le RDV, patient peut venir |
| **Terminé** | Médecin | Clique "Terminer" ou "Absent" | RDV complété (+ patient_present=true/false) |
| **Annulé** | Médecin/Système | Clique "Annuler" | RDV supprimé du calendrier |

---

## 🎮 Actions Médecin dans MedecinRdv.jsx

### **État: RDV Programmé**

```
Boutons disponibles:
┌─────────────────────────────┐
│ ✓ CONFIRMER (en subrillance) │ ← Vert/Actif
│ ✓ TERMINER (flou/désactivé)  │ ← Gris/Désactivé
│ ✗ ANNULER (en subrillance)   │ ← Rouge/Actif
└─────────────────────────────┘
```

**Actions possibles:**
- ✅ Clique **CONFIRMER** → RDV devient "Confirmé"
- ✅ Clique **ANNULER** → RDV devient "Annulé" (confirmation)
- ❌ **TERMINER** désactivé (gris/flou) - impossible à cliquer

### **État: RDV Confirmé**

```
Boutons disponibles:
┌──────────────────────────────┐
│ ✓ CONFIRMER (caché)          │ ← Disparu
│ ✓ TERMINER (en subrillance)  │ ← Bleu/Actif
│ ✗ ANNULER (en subrillance)   │ ← Rouge/Actif
└──────────────────────────────┘
```

**Actions possibles:**
- ✅ Clique **TERMINER** → Dialog: "Patient présent?" → Choix:
  - **Présent** → Terminé (patient_present=true)
  - **Absent** → Terminé (patient_present=false)
  - **Annuler** → Reste confirmé
- ✅ Clique **ANNULER** → RDV devient "Annulé"

### **État: RDV Terminé ou Annulé**

```
Boutons disponibles:
┌──────────────────────────┐
│ ✓ CONFIRMER (caché)      │ ← Disparu
│ ✓ TERMINER (caché)       │ ← Disparu
│ ✗ ANNULER (caché)        │ ← Disparu
└──────────────────────────┘

Pas d'actions possibles - RDV finalisé
```

---

## 💡 Dialog "Terminer le RDV" (Détail)

Quand médecin clique "TERMINER" sur un RDV confirmé:

```
┌──────────────────────────────────────────┐
│  Terminer le RDV                         │
├──────────────────────────────────────────┤
│                                          │
│  Patient Jean Martin présent et          │
│  consultation terminée?                  │
│                                          │
│  [Annuler]  [✗ Absent]  [✓ Présent]    │
└──────────────────────────────────────────┘
```

**3 choix:**
1. **Annuler** → Ferme dialog, reste confirmé
2. **✗ Absent** → Terminé + patient_present=false
3. **✓ Présent** → Terminé + patient_present=true

---

## 📊 Statut Visuel par Ligne

| Statut | Couleur | Badge | Actions |
|--------|---------|-------|---------|
| Programmé | Bleu | "Programmé" | ✓ Confirmer, ✗ Annuler, ✓ Terminer (flou) |
| Confirmé | Ambre | "Confirmé" | ✓ Terminer, ✗ Annuler |
| Terminé | Vert | "Terminé ✓" ou "Terminé ✗" | Aucun |
| Annulé | Gris | "Annulé" | Aucun |

---

## 🔄 Workflow Réel - Exemple du Jour

### **Matin: 09:00**

```
RDV #1 - Jean Dupont - 09:00 Consultation
│
Statut: [Programmé]
Actions: [✓ CONFIRMER] [✓ TERMINER*] [✗ ANNULER]
         (* gris/flou)

Médecin: "Oui, ce RDV est OK"
Clique: [✓ CONFIRMER]
│
Result: Jean Dupont - 09:00 Consultation
│
Statut: [Confirmé]
Actions: [✓ TERMINER] [✗ ANNULER]
```

### **09:15: Patient arrive**

```
(Aucune action de la part du médecin)
Jean vient d'arriver, consultation commence...
```

### **09:45: Consultation terminée**

```
Médecin: "Consultation faite, Jean était présent"
Clique: [✓ TERMINER]
│
Dialog: "Jean Martin présent?"
Clique: [✓ Présent]
│
Result: Jean Dupont - 09:00 Consultation
│
Statut: [Terminé] + patient_present=true
Actions: Aucun (finalisé)
│
Dashboard: Compté dans "Consultations complétées aujourd'hui"
```

### **09:30: RDV 2 - Marie Bernard**

```
Statut: [Programmé]
Actions: [✓ CONFIRMER] [✓ TERMINER*] [✗ ANNULER]

09:40 - Marie n'est pas arrivée
Médecin: "Marie n'est pas venue"
Clique: [✓ CONFIRMER] (approuve le RDV d'abord)
│
Statut: [Confirmé]
│
Clique: [✓ TERMINER]
Dialog: "Marie Bernard présent?"
Clique: [✗ Absent]
│
Result: Marie Bernard - 09:30 Consultation
│
Statut: [Terminé] + patient_present=false
Actions: Aucun
│
Dashboard: Compté dans "Absences aujourd'hui"
```

---

## 📈 Dashboard - KPI Mise à Jour

```
KPI du jour:

Total RDV:                    5
Programmés (en attente):      1
Confirmés (approuvés):        2
Terminés (faits):             2
├─ Présents:                  1
└─ Absents:                   1

Taux de présence: 50%
```

---

## 🔧 Implémentation - Statuts BD

```sql
-- Statuts valides
CHECK (statut IN ('programmé','confirmé','terminé','annulé'))

-- Colonne patient_present (NULL = pas encore déterminé)
patient_present BOOLEAN DEFAULT NULL
```

---

## ✨ Résumé pour Médecin

**Dans "Mes Rendez-vous":**

1. **RDV Programmé?** 
   - Tu dois d'abord le **CONFIRMER** (tu dis "oui, c'est bon")
   - Après seulement tu peux le **TERMINER**

2. **Après avoir confirmé:**
   - Tu peux le **TERMINER** (patient est venu et consultation faite)
   - Tu peux le **MARQUER ABSENT** (patient pas venu)
   - Tu peux l'**ANNULER** si besoin

3. **Une fois terminé/annulé:**
   - Plus d'actions possibles
   - RDV finalisé

---

## 🎯 Avantages

✅ **Contrôle médecin:** Seul le médecin valide les RDV  
✅ **Deux étapes:** Confirmation puis exécution  
✅ **Absence tracking:** Sait qui est venu vs absent  
✅ **Clair:** 4 statuts avec actions explicites  
✅ **Pratique:** 3 boutons max par état  
✅ **Sécurité:** Boutons grisés quand pas approprié  

---

## 🚀 Prochaines Étapes

1. **Exécuter la migration SQL** 
   - Fichier: `supabase_rdv_workflow_migration.sql`

2. **Rafraîchir l'app** (Ctrl+F5)

3. **Tester:**
   - Créer RDV → Doit être "Programmé"
   - Aller à "Mes RDV" (page médecin)
   - Vérifier boutons: Confirmer visible, Terminer gris
   - Clique Confirmer → Terminer devient actif
   - Clique Terminer → Dialog présent/absent

4. **Voir le Dashboard** pour les stats mises à jour
