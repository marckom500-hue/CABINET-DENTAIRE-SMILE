# ✅ Corriger l'erreur "policy already exists"

## 🚀 Solution rapide

### Étape 1 : Utiliser le nouveau script
1. Aller dans **Supabase → SQL Editor**
2. Copier-coller le contenu de : **`supabase_update_notifications.sql`**
3. Cliquer sur **Run**

Ce script :
- ✅ Supprime les policies existantes
- ✅ Supprime les triggers et fonctions existants
- ✅ Recréé tout avec les bonnes configurations
- ✅ Inclut les améliorations d'heure (13h00)

### Étape 2 : Vérifier
À la fin de l'exécution, vous devriez voir :
```
Setup terminé avec succès!

policyname                | permissive
──────────────────────────┼────────────
notifications_insert      | true
notifications_read_own    | true
notifications_update_own  | true
```

### Étape 3 : Tester
1. Rafraîchir l'app (Ctrl+F5)
2. Créer un nouveau RDV
3. La notification du médecin devrait afficher : "RDV : ... à 13h00"

## ❌ Ne pas faire

❌ N'exécutez PAS deux fois le script `supabase_migrations_notifications.sql`
✅ Utilisez `supabase_update_notifications.sql` à la place (qui gère les conflicts)

## 📋 Résumé des changements

| Before | After |
|--------|-------|
| Table `notifications` → CREATE | ✅ Existe déjà |
| Policies (erreur) | ✅ Recréées |
| Triggers (ancien format) | ✅ Mis à jour avec 13h00 |
| Fonctions (ancien format) | ✅ Mis à jour avec 13h00 |

## 🆘 Si ça ne marche toujours pas

Essayer de réinitialiser manuellement :

```sql
-- 1. Supprimer tout
DROP TRIGGER IF EXISTS trigger_notify_medecin_new_rdv ON public.rendez_vous;
DROP TRIGGER IF EXISTS trigger_notify_medecin_rdv_modified ON public.rendez_vous;
DROP FUNCTION IF EXISTS public.notify_medecin_new_rdv() CASCADE;
DROP FUNCTION IF EXISTS public.notify_medecin_rdv_modified() CASCADE;
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

-- 2. Puis exécuter supabase_update_notifications.sql
```
