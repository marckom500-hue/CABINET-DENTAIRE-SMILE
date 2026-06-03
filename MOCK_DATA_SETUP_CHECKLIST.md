# ✅ Checklist Installation — Données Mock/Réelles

## Étape 1 : Exécuter la migration SQL

- [ ] Ouvrir Supabase → SQL Editor
- [ ] Copier le contenu de `supabase_mock_data_setup.sql`
- [ ] Exécuter la requête
- [ ] Voir le message "✓ 36 factures mock insérées avec succès!"

## Étape 2 : Vérifier l'installation

Exécutez dans SQL Editor:
```sql
-- Vérifier la table config
SELECT * FROM public.app_config WHERE key = 'use_mock_data';

-- Vérifier les données mock (résultat: 36 lignes)
SELECT COUNT(*) FROM public.factures_mock;

-- Voir le résumé mensuel mock
SELECT 
  DATE_TRUNC('month', date)::date as mois,
  COUNT(*) as nombre_factures,
  SUM(montant) as total_mois
FROM public.factures_mock
GROUP BY DATE_TRUNC('month', date)
ORDER BY mois;
```

## Étape 3 : Rafraîchir l'application

- [ ] Appuyez sur **Ctrl+F5** (ou Cmd+Shift+R sur Mac)
- [ ] Connectez-vous en tant que **Superadmin**

## Étape 4 : Accéder aux paramètres

- [ ] Allez dans le **menu latéral gauche**
- [ ] Cliquez sur **"Paramètres Admin"** (en bas, avant la déconnexion)
- [ ] Vous devriez voir la section "Données des rapports"

## Étape 5 : Tester le basculement

### Test 1 : Données Mock
- [ ] Cliquez sur **"Basculer vers DONNÉES MOCK"**
- [ ] Attendez 2 secondes
- [ ] Allez à **Rapports**
- [ ] Observez les revenus mensuels: 440k, 490k, 490k, 540k, 500k, 540k FCFA

### Test 2 : Données Réelles
- [ ] Retournez à **Paramètres Admin**
- [ ] Cliquez sur **"Basculer vers DONNÉES RÉELLES"**
- [ ] Allez à **Rapports**
- [ ] Observez les revenus réels de votre cabinet

## ✨ C'est prêt!

Vous pouvez maintenant:
- 📸 Prendre des captures avec données mock pour les présentations
- 📊 Basculer aux données réelles pour le suivi réel
- 🔄 Passer d'un mode à l'autre instantanément (sans rechargement)

## 📖 Documentation Complète

Consultez `MOCK_DATA_TOGGLE_GUIDE.md` pour:
- Architecture technique
- Cas d'usage détaillés
- Dépannage
- Permissions
- Requêtes SQL utiles

## 🆘 En cas de problème

### Je ne vois pas "Paramètres Admin"

**Cause:** Vous n'êtes pas superadmin  
**Solution:** Connectez-vous avec le compte superadmin ou demandez au superadmin de vous promouvoir

### Les données mock ne s'affichent pas aux rapports

**Cause:** Les données ne sont pas chargées ou pas en mode mock  
**Solution:**
1. Vérifiez que le mode est bien "DONNÉES MOCK" dans Paramètres Admin
2. Appuyez sur Ctrl+F5 pour rafraîchir
3. Exécutez: `SELECT COUNT(*) FROM factures_mock;` pour vérifier les 36 lignes

### Erreur lors du changement de mode

**Cause:** Problème de permission Supabase  
**Solution:**
1. Vérifiez que vous êtes superadmin
2. Vérifiez que RLS est bien configuré (voir SQL)
3. Rafraîchissez la page

## 📞 Support

Pour toute question, consultez:
- `MOCK_DATA_TOGGLE_GUIDE.md` (documentation complète)
- `supabase_mock_data_setup.sql` (migration)
- `src/hooks/useAppConfig.js` (hook)
- `src/pages/AdminSettings.jsx` (interface)
