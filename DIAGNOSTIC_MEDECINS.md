# 🔧 Diagnostic : Les médecins ne s'affichent pas

## Causes possibles

### 1. **Aucun médecin en base de données**
```sql
-- Vérifier dans Supabase → SQL Editor
SELECT id, nom, prenom, role, actif FROM public.users_profiles;
```

Si le résultat est vide, créer des médecins :
```sql
INSERT INTO public.users_profiles (nom, prenom, email, role, actif)
VALUES 
  ('Boutchouang', 'Dr.', 'doc1@cabinet.cm', 'medecin', true),
  ('Dupont', 'Marie', 'doc2@cabinet.cm', 'medecin', true);
```

### 2. **Les médecins existent mais sont `actif = false`**
```sql
-- Vérifier l'état actif
SELECT nom, prenom, actif FROM public.users_profiles WHERE role = 'medecin';

-- Corriger
UPDATE public.users_profiles SET actif = true WHERE role = 'medecin';
```

### 3. **Problème de RLS (Row Level Security)**

Les RLS policies peuvent bloquer l'accès. Vérifier :

```sql
-- Aller dans Supabase → SQL Editor
-- Exécuter une requête directe (sans RLS)
SELECT id, nom, prenom, role, actif 
FROM public.users_profiles 
WHERE role IN ('medecin', 'superadmin') 
AND actif = true;
```

Si ça marche ici mais pas dans l'app → problème RLS.

Vérifier les policies :
```sql
SELECT * FROM pg_policies WHERE tablename = 'users_profiles';
```

Surtout vérifier que :
```sql
-- Cette policy doit exister
CREATE POLICY "profile_admin_read" 
  ON public.users_profiles 
  FOR SELECT 
  USING (public.get_my_role() = 'superadmin');
```

### 4. **Votre utilisateur n'a pas les bonnes permissions**

Vérifier votre rôle :
```sql
-- En tant que secrétaire, vous ne pouvez peut-être pas voir les médecins
-- Ajouter une policy pour les secrétaires

CREATE POLICY "profile_secretary_read_doctors" 
  ON public.users_profiles 
  FOR SELECT 
  USING (
    public.get_my_role() IN ('superadmin', 'secretaire') 
    AND role IN ('medecin', 'superadmin')
  );
```

### 5. **Utiliser le composant DiagnosticsRLS**

1. Importer dans `src/App.jsx` ou `src/pages/RendezVous.jsx` :
```jsx
import DiagnosticsRLS from '../components/DiagnosticsRLS'

// Dans le return :
<DiagnosticsRLS />
```

2. Ouvrir l'app et regarder le composant en bas à droite
3. Il affichera :
   - ✅ Votre email et rôle
   - ✅ Nombre de médecins trouvés
   - ❌ Les erreurs RLS exactes
   - ✅ Les données brutes

## Checklist complète

- [ ] Au moins 1 médecin existe en BDD
- [ ] Le médecin a `role = 'medecin'` ou `'superadmin'`
- [ ] Le médecin a `actif = true`
- [ ] Votre utilisateur a `role = 'secretaire'` ou `'superadmin'`
- [ ] Les RLS policies autorisent la lecture (diagnostics l'indiquera)
- [ ] Pas d'erreur dans la console JS (F12)
- [ ] Pas d'erreur dans Supabase → Logs → Functions

## Solution rapide pour tester

Si vous avez accès à Supabase :

1. Aller dans Data Studio
2. Ouvrir la table `users_profiles`
3. Ajouter un utilisateur :
   - nom: "Test"
   - prenom: "Dr"
   - email: "test@test.com"
   - role: "medecin"
   - actif: ✓ (checked)

4. Rafraîchir le formulaire RDV

## Si encore bloqué

Exécuter en Supabase Console (remplacer YOUR_ID) :

```sql
-- Vérifier que la requête fonctionne
SELECT id, nom, prenom FROM users_profiles 
WHERE role IN ('medecin', 'superadmin') 
AND actif = true 
LIMIT 10;

-- Vérifier les permissions RLS
SELECT * FROM pg_policies 
WHERE tablename = 'users_profiles' 
ORDER BY policyname;

-- Voir votre rôle
SELECT public.get_my_role();
```

## Logs à consulter

### Console navigateur (F12)
```
- Chercher "Médecins chargés:"
- Chercher "Erreur chargement médecins:"
```

### Supabase Logs
```
Supabase → Logs → Realtime ou Query
Chercher la requête SELECT sur users_profiles
```

## Dernière option : désactiver temporairement RLS

⚠️ **DANGER** - À utiliser que pour débugger :

```sql
-- DÉSACTIVER RLS (pas en production!)
ALTER TABLE public.users_profiles DISABLE ROW LEVEL SECURITY;

-- Tester dans l'app
-- Une fois confirmé que ça marche → REactiver RLS

-- RÉACTIVER RLS
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
```
