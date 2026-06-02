# ✅ Checklist : Corriger l'affichage des médecins

## 🚀 Solution rapide (5 minutes)

### Étape 1 : Exécuter le script SQL de correction
1. Aller dans **Supabase → SQL Editor**
2. Copier-coller le contenu de : `supabase_fix_rls_medecins.sql`
3. Cliquer sur **Run**

Cela va :
- ✅ Ajouter les permissions RLS correctes
- ✅ Permettre aux secrétaires de voir les médecins
- ✅ Vérifier les médecins actifs

### Étape 2 : Vérifier les données
Après l'exécution, vous devriez voir :
```
id  | nom        | prenom | email           | role     | actif
────┼────────────┼────────┼─────────────────┼──────────┼──────
... | Boutchouang| Dr.    | doc@cabinet.cm  | medecin  | true
... | Dupont     | Marie  | marie@...       | medecin  | true
```

### Étape 3 : Tester dans l'app
1. Rafraîchir le navigateur (Ctrl+F5)
2. Aller dans **Rendez-vous → Nouveau RDV**
3. Les médecins doivent s'afficher maintenant ✅

---

## 🔍 Si ça ne marche toujours pas

### Utiliser le composant DiagnosticsRLS

1. Ouvrir `src/App.jsx` ou `src/pages/RendezVous.jsx`
2. Ajouter (temporairement) :
```jsx
import DiagnosticsRLS from '../components/DiagnosticsRLS'

export default function RendezVous() {
  return (
    <>
      {/* ... votre code ... */}
      <DiagnosticsRLS /> {/* 👈 Ajouter cette ligne */}
    </>
  )
}
```

3. Rafraîchir l'app
4. Un widget en bas à droite affichera :
   - ✅ Votre rôle
   - ✅ Le nombre de médecins trouvés
   - ❌ Les erreurs exactes

### Lire les erreurs exactes

Le widget DiagnosticsRLS montrera :
- Si c'est un **"Aucun médecin disponible"** → problème de données
- Si c'est une erreur RLS → problème de permissions
- Si c'est une erreur de connexion → problème Supabase

---

## 📋 Vérifications manuelles

### Dans Supabase Console :

```sql
-- 1. Vérifier les médecins
SELECT * FROM users_profiles WHERE role = 'medecin';

-- 2. Vérifier votre rôle
SELECT public.get_my_role();

-- 3. Vérifier les policies
SELECT policyname, permissive FROM pg_policies 
WHERE tablename = 'users_profiles';
```

---

## 🆘 Causes communes

| Symptôme | Cause | Solution |
|----------|-------|----------|
| "Chargement des médecins..." (infini) | Requête bloquée par RLS | Exécuter le script SQL |
| "Aucun médecin disponible" | Pas de médecins en BDD | Ajouter un médecin |
| "Erreur de chargement" | Permissions insuffisantes | Vérifier votre rôle |
| Liste vide | RLS policy trop restrictive | Exécuter le script SQL |

---

## 🧹 Nettoyage (après diagnostic)

Une fois que ça marche, supprimer le composant DiagnosticsRLS :

```jsx
// Supprimer ou commenter cette ligne
// <DiagnosticsRLS />
```

---

## 📞 Support

Si toujours bloqué après ces étapes :
1. Vérifier la console navigateur (F12) pour les erreurs JavaScript
2. Vérifier les logs Supabase : Supabase → Logs
3. Vérifier que l'URL Supabase est correcte dans `.env`
