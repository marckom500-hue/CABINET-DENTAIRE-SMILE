# 🤖 Détection Automatique des Absents

## 📋 Vue d'ensemble

Nouveau système qui **détecte et marque automatiquement** les patients absents:

```
09:00 - Jean Dupont - RDV programmé
         Heure actuelle: 09:15
         Statut RDV: "programmé" (pas "terminé")
         ↓
         SYSTÈME: "Jean a dépassé son horaire sans être marqué comme présent!"
         ↓
         Action automatique: Marque comme "terminé" + "absent"
         ↓
         Notification: "Jean Dupont marqué absent au RDV"
```

---

## 🔧 Comment ça Marche

### **Hook: useMissedAppointmentsDetector()**

Fichier: `src/hooks/useMissedAppointmentsDetector.js`

**Logique:**
1. Récupère l'heure actuelle
2. Cherche tous les RDV où:
   - La date+heure est **passée**
   - Le statut n'est **pas** "terminé" ou "annulé"
3. Pour chaque RDV trouvé:
   - Change statut → "terminé"
   - Change patient_present → false
4. Notifie l'utilisateur
5. Se réexécute **toutes les minutes**

### **Intégration**

Ajouté dans `MedecinRdv.jsx`:
```javascript
export default function MedecinRdv() {
  const { rdvMedecin, loading, ... } = useMedecinRdv()
  useMissedAppointmentsDetector() // ← Détecte les absents automatiquement
  ...
}
```

---

## 📊 Exemple Réel

### **Scénario: Jour J**

```
09:00 - RDV Jean Dupont - "Programmé"
        ✓ Médecin confirme
        
09:15 - Heure actuelle
        Jean ne s'est pas présenté
        Système detect: RDV dépassé + pas terminé
        
ACTION AUTOMATIQUE:
  - Statut → "Terminé"
  - patient_present → false
  
RÉSULTAT:
  - Jean Dupont marqué "Absent" automatiquement
  - Notification: "Jean Dupont marqué absent au RDV"
  - Dashboard: Compté dans les absences
```

### **Cas Traités Automatiquement**

| Cas | Détecté? |
|-----|----------|
| RDV 09:00 passé à 09:15, statut=programmé | ✅ OUI |
| RDV 09:00 passé à 09:15, statut=confirmé | ✅ OUI |
| RDV 09:00 passé à 09:15, statut=terminé | ❌ NON (déjà terminé) |
| RDV 09:00 passé à 09:15, statut=annulé | ❌ NON (déjà annulé) |

---

## ⏱️ Fréquence de Vérification

**Tous les 60 secondes (1 minute)**

- Exécution au montage du composant MedecinRdv
- Puis vérification toutes les 60 secondes
- Arrêt du timer si composant démonté

**Implication:** 
- Délai max d'absence: ~1 minute après dépassement de l'heure
- Exemple: RDV 09:00 → marqué absent au plus tard à 09:01

---

## 🔔 Notifications

Quand un RDV est marqué comme absent automatiquement:

```
Notification: "1 patient(s) marqué(s) absent: Jean Dupont"
Type: warning (orange)
Durée: 3 secondes
```

---

## 📈 Impact sur le Dashboard

Une fois qu'un RDV est automatiquement marqué absent:

```
AVANT (09:00 RDV non marqué):
  - RDV aujourd'hui: 1 programmé
  - Consultations complétées: 0
  - Absences: 0

APRÈS (09:01 AUTO-MARQUÉ):
  - RDV aujourd'hui: 0 programmés
  - Consultations complétées: 0
  - Absences: 1 ✗
  - Patient reçu: N/A (patient_present=false)
```

---

## ⚙️ Configuration

### **Intervalle de Vérification**

Fichier: `src/hooks/useMissedAppointmentsDetector.js`, ligne ~50

```javascript
const interval = setInterval(detectAndMarkMissed, 60000) // 60 secondes = 1 minute
```

Pour changer à **30 secondes:**
```javascript
const interval = setInterval(detectAndMarkMissed, 30000) // 30 secondes
```

### **Requête Supabase**

Les RDV détectés sont ceux où:
```sql
date < aujourd'hui 
OR (date = aujourd'hui AND heure < maintenant)
AND statut NOT IN ('terminé', 'annulé')
```

---

## 💡 Cas Particuliers

### **Qu'est-ce qu'un "RDV passé"?**

```
RDV 09:00 avec durée 30 min
Heure actuelle: 09:15

Patient marqué absent car:
- Heure de départ (09:00) est passée
- Pas marqué comme "terminé" manuellement
```

**Note:** Le système n'attend pas la fin de la durée (09:30). Il marque absent dès que le RDV commence et n'est pas terminé.

### **Et si le patient arrive en retard?**

```
RDV 09:00, patient arrive à 09:10
Système: "RDV passé à 09:00, statut pas terminé"
AUTO-MARQUE ABSENT à 09:01

SOLUTION:
Médecin clique "Annuler" puis "Confirmer" à nouveau
pour rectifier
```

---

## 🎯 Workflow Complet avec Auto-Détection

```
09:00 RDV Jean Dupont
│
├─ 09:00-09:15: Patient peut encore arriver
│                Médecin peut confirmer manuellement
│
├─ 09:15: Heure passée
│          Système DÉTECTE
│          ↓
│          Auto-marque: "Terminé" + "Absent"
│          Notification: "Jean Dupont marqué absent"
│
└─ 09:16: RDV finalisé (absent)
           Dashboard mis à jour
           Plus d'actions possibles
```

---

## ✨ Avantages

✅ **Automatique:** Pas besoin de le faire manuellement  
✅ **Real-time:** Mis à jour chaque minute  
✅ **Fiable:** Détecte tous les RDV passés non terminés  
✅ **Transparent:** Notification à chaque détection  
✅ **Dashboard actualisé:** Stats des absences corrects  

---

## 🚀 Prochaines Étapes

1. **Rafraîchir l'app** (Ctrl+F5)
2. **Aller à MedecinRdv** (page "Mes RDV")
3. **Le hook s'active automatiquement**
4. **Créer un RDV test** avec une heure passée
5. **Attendre ~1 minute** → Il sera marqué absent automatiquement

---

## 🔍 Vérification

Pour vérifier que ça fonctionne:

1. Ouvrir **Console du navigateur** (F12)
2. Chercher les messages `[useMissedAppointmentsDetector]`
3. Vérifier que les RDV passés sont détectés

```
Console:
[useMissedAppointmentsDetector] 1 RDV marqués comme absents
```

---

## 🆘 Dépannage

### **Pas de détection**

**Cause:** Hook pas appelé ou interval trop long

**Solution:**
1. Vérifier que `useMissedAppointmentsDetector()` est dans MedecinRdv.jsx
2. Vérifier la console pour les erreurs
3. Vérifier que les RDV ont bien une heure passée

### **Marqué absent trop tôt**

**Cause:** RDV encore en cours mais système l'a marqué absent

**Solution:**
- Augmenter l'intervalle de 60s à 120s (2 minutes)
- Ou médecin confirme manuellement avant que ça se termine

### **Pas de notification**

**Cause:** Notifications fermées ou volume muet

**Solution:**
1. Vérifier les paramètres de notification du navigateur
2. Vérifier la console (F12) pour voir si le hook fonctionne
