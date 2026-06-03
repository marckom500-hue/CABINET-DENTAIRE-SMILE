# 📊 Mock Data Revenus — Guide pour captures d'écran

## 🎯 Objectif

Ajouter des factures de test pour voir les graphiques des revenus mensuels dans la page Rapports.

---

## 🚀 Étapes

### Étape 1 : Récupérer les IDs patients

1. Aller dans **Supabase → SQL Editor**
2. Exécuter cette requête :

```sql
SELECT id, nom, prenom FROM public.patients LIMIT 5;
```

**Note les IDs** (ce seront tes `patient_id_1`, `patient_id_2`, etc.)

**Exemple de résultat :**
```
id                                   | nom    | prenom
─────────────────────────────────────┼────────┼────────
550e8400-e29b-41d4-a716-446655440000 | ESSAMA | Paul
550e8400-e29b-41d4-a716-446655440001 | NKANA  | Marie
550e8400-e29b-41d4-a716-446655440002 | MVOGO  | Jean
```

### Étape 2 : Adapter le script SQL

1. Ouvrir le fichier : `MOCK_DATA_REVENUS.sql`
2. Remplacer :
   - `patient_id_1` → `550e8400-e29b-41d4-a716-446655440000`
   - `patient_id_2` → `550e8400-e29b-41d4-a716-446655440001`
   - Etc.

### Étape 3 : Exécuter le script

1. Aller dans **Supabase → SQL Editor**
2. Copier-coller le script modifié
3. Cliquer **Run**

**Résultat attendu :**
```
36 rows inserted
```

### Étape 4 : Vérifier les données

Exécuter dans Supabase :

```sql
SELECT 
  DATE_TRUNC('month', date)::date as mois,
  COUNT(*) as factures,
  SUM(montant) as total
FROM public.factures
WHERE EXTRACT(YEAR FROM date) = 2026
GROUP BY mois
ORDER BY mois;
```

**Résultat attendu :**
```
mois       | factures | total
───────────┼──────────┼──────────
2026-01-01 | 6        | 440000
2026-02-01 | 6        | 490000
2026-03-01 | 6        | 490000
2026-04-01 | 6        | 540000
2026-05-01 | 6        | 500000
2026-06-01 | 6        | 540000
```

### Étape 5 : Voir les graphiques

1. Rafraîchir l'app : **Ctrl+F5**
2. Aller dans **Rapports**
3. Voir les graphiques :
   - **Revenus vs Objectif** (barres)
   - **Évolution patients** (courbe)
   - **Répartition des actes** (donut)
   - **Tableau récapitulatif** (données mensuelles)

### Étape 6 : Prendre captures d'écran

**Captures à faire :**

1. **KPIs généraux**
   ```
   ┌──────────────┬──────────────┬──────────────┬──────────────┐
   │ Revenus      │ Patients vus │ Taux recutr. │ RDV honorés  │
   │ 2.9m FCFA    │ 42           │ 85%          │ 75%          │
   └──────────────┴──────────────┴──────────────┴──────────────┘
   ```

2. **Graphique Revenus vs Objectif**
   - Voir les barres mensuelles
   - Comparer revenus vs objectifs

3. **Graphique Patients**
   - Voir la courbe d'évolution
   - Nouveaux vs Retours

4. **Répartition Actes**
   - Voir le donut chart
   - Répartition des types d'actes

5. **Tableau Récapitulatif**
   - Voir le résumé mensuel
   - Écarts vs objectifs

---

## 📊 Données Mock générées

### Revenus par mois

| Mois | Revenus | Objectif | État |
|------|---------|----------|------|
| Jan | 440 000 | 600 000 | ❌ -160 000 |
| Fév | 490 000 | 600 000 | ❌ -110 000 |
| Mar | 490 000 | 650 000 | ❌ -160 000 |
| Avr | 540 000 | 650 000 | ❌ -110 000 |
| Mai | 500 000 | 700 000 | ❌ -200 000 |
| Jun | 540 000 | 700 000 | ❌ -160 000 |

### Types d'actes

- **Consultation** : 25 000 FCFA
- **Détartrage** : 45 000 FCFA
- **Extraction** : 80 000 FCFA
- **Radiographie** : 15 000 FCFA
- **Implant** : 250-320 000 FCFA
- **Urgence** : 50-60 000 FCFA

### Statuts factures

- **60% Payées** : 12 factures
- **10% Attente** : 2 factures
- **30% Réservées** : pour captures

---

## ⚙️ Configurations optionnelles

### Modifier les montants

Si tu veux des revenus différents, changer dans le script :

```sql
('patient_id_1', 'Implant', 250000, ...)  -- Changer 250000
                          ^^^^^^
```

### Modifier les dates

Pour mettre à jour les mois :

```sql
('patient_id_1', 'Consultation', 25000, '2026-01-05', ...)
                                                        ^^^^
```

### Ajouter plus de factures

Dupliquer les blocs de mois et adapter les dates.

---

## 🧹 Nettoyer après captures

Si tu veux supprimer les données de test :

```sql
DELETE FROM public.factures 
WHERE date >= '2026-01-01' AND date <= '2026-06-30';
```

---

## ✨ Résultat final

**Avant** (pas de données) :
```
Revenus totaux : 0 FCFA
Patients vus : 0
Graphiques : vides
```

**Après** (avec mock data) :
```
Revenus totaux : 2.9m FCFA
Patients vus : 42
Graphiques : remplis avec données
KPIs : affichent les chiffres
```

---

## 📸 Captures à faire

1. **Dashboard complet** (KPIs + graphiques)
2. **Zoom sur graphique Revenus** (pour présentation)
3. **Zoom sur tableau Récapitulatif** (pour détails)
4. **Mobile** (vérifier responsive)

**C'est prêt pour les captures ! 🎬**
