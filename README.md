# SMILE — Cabinet Dentaire Dr. Boutchouang & Associés

Application web de gestion de cabinet dentaire.

## Stack technique
- **React 18** + **Vite** — interface utilisateur
- **Tailwind CSS** — styles responsive
- **Supabase** — base de données PostgreSQL + authentification + Edge Functions
- **Recharts** — graphiques
- **React Router v6** — navigation

## Installation locale

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 3. Lancer en développement
npm run dev

# 4. Build pour production
npm run build
```

## Configuration Supabase

### Base de données
1. Aller dans **Supabase → SQL Editor**
2. Coller et exécuter le contenu de `supabase_schema_complet.sql`
3. Définir le superadmin :
   ```sql
   UPDATE users_profiles SET role = 'superadmin', nom = 'Boutchouang', prenom = 'Dr.'
   WHERE email = 'ton-email@cabinet.cm';
   ```

### Rappels SMS automatiques
1. Activer l'extension **pg_cron** dans Supabase → Extensions
2. Activer **pg_net** dans Supabase → Extensions
3. Déployer l'Edge Function :
   ```bash
   npx supabase functions deploy send-rappel-rdv
   ```
4. Configurer les secrets de l'Edge Function dans Supabase → Edge Functions → Secrets :
   - `SUPABASE_URL` — URL du projet Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` — clé service role Supabase
   - `SMS_PROVIDER=twilio`
   - `TWILIO_ACCOUNT_SID` — Account SID Twilio
   - `TWILIO_AUTH_TOKEN` — Auth Token Twilio
   - `TWILIO_FROM_NUMBER` — numéro Twilio au format international, ex: `+15551234567`
   - `TWILIO_MESSAGING_SERVICE_SID` — optionnel, à utiliser à la place de `TWILIO_FROM_NUMBER`

### Fournisseurs SMS compatibles (Cameroun)
| Fournisseur | Site | Notes |
|---|---|---|
| Africa's Talking | africastalking.com | Recommandé, couvre le Cameroun |
| Orange SMS API | developer.orange.com | Opérateur local |
| Twilio | twilio.com | International, plus cher |

## Structure du projet

```
smile/
├── src/
│   ├── components/       Composants réutilisables
│   ├── pages/            Pages de l'application
│   ├── hooks/            Logique métier (Supabase)
│   ├── lib/
│   │   ├── supabase.js   Client Supabase
│   │   └── roles.js      Matrice des permissions
│   └── data/
│       └── mockData.js   Données de démo
├── supabase/
│   └── functions/
│       └── send-rappel-rdv/  Edge Function SMS
├── supabase_schema_complet.sql
└── .env.example
```

## Gestion des rôles

| Rôle | Accès |
|---|---|
| **Superadmin** | Accès complet à tout |
| **Médecin** | RDV, Patients, Ordonnances, Rapports (lecture Facturation/Stock) |
| **Secrétaire** | RDV, Patients, Facturation, Stock, Rappels SMS |
| **Comptable** | Facturation, Rapports financiers |
| **Assistant** | RDV (lecture), Patients (lecture), Stock |

## Déploiement Vercel

```bash
git add .
git commit -m "deploy"
git push
```
Vercel détecte automatiquement Vite et construit le projet.

Variables d'environnement à configurer dans Vercel → Settings → Environment Variables :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
