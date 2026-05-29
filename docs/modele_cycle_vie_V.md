## II.1.6. Modèle de cycle de vie

Pour chaque produit (ou application) conçu et développé, on choisit une démarche pour le suivre tout au long du projet que l'on appelle cycle de vie du produit. Le cycle de vie est un cadre structurel qui décrit les phases et les processus par lesquels un logiciel passe depuis sa conception initiale jusqu'à sa fin de vie. Pour la réalisation de notre projet **SMILE** (Système de gestion de cabinet dentaire), nous avons opté pour le **modèle de cycle de vie en V**.

Le modèle en V, également appelé **V-Model**, est une extension du modèle en cascade qui met l'accent sur la validation et la vérification à chaque étape du développement. Contrairement au modèle Agile qui privilégie l'itération et la flexibilité, le modèle en V suit une approche séquentielle rigoureuse où chaque phase de développement correspond à une phase de test spécifique. Ce modèle est particulièrement adapté aux projets critiques comme les systèmes médicaux, où la qualité, la traçabilité et la fiabilité sont primordiales.

### Pourquoi le modèle en V pour SMILE ?

Le choix du modèle en V pour le projet SMILE se justifie par plusieurs facteurs :

1. **Criticité du domaine médical** : La gestion des données patients, des rendez-vous, des ordonnances et de la facturation nécessite une approche rigoureuse avec une validation complète à chaque étape.

2. **Exigences de traçabilité** : Dans un système de santé, il est essentiel de pouvoir tracer chaque fonctionnalité depuis les besoins utilisateurs jusqu'aux tests de validation.

3. **Sécurité des données** : La manipulation de données sensibles (informations patients, actes médicaux) impose des tests de sécurité approfondis et une validation formelle.

4. **Stabilité des besoins** : Les fonctionnalités d'un cabinet dentaire (gestion des patients, rendez-vous, facturation) sont bien définies et stables, ce qui correspond bien à l'approche séquentielle du V-Model.

5. **Conformité et certification** : Le modèle en V facilite la documentation complète requise pour d'éventuelles certifications dans le domaine médical.


### Déroulement du cycle en V

Le modèle en V se caractérise par une forme de V où la branche descendante représente les phases de conception et de développement, tandis que la branche montante représente les phases de test et de validation. Chaque phase de la branche descendante a une phase correspondante de test dans la branche montante.

#### **Branche descendante (Conception et Développement)**

1. **Analyse des besoins** : Recueil et spécification des besoins fonctionnels et non fonctionnels du cabinet dentaire SMILE. Cette phase identifie les exigences des différents acteurs (superadmin, médecin, secrétaire, comptable, assistant).

2. **Spécifications fonctionnelles** : Définition détaillée des fonctionnalités attendues : gestion des patients, prise de rendez-vous, création d'ordonnances, facturation, gestion du stock, rappels SMS, rapports statistiques.

3. **Conception globale (Architecture)** : Conception de l'architecture technique du système : choix de React pour le frontend, Supabase pour le backend, PostgreSQL pour la base de données, définition des composants principaux et de leurs interactions.

4. **Conception détaillée** : Conception précise de chaque module :

    - Modélisation de la base de données (tables patients, rendez_vous, ordonnances, factures, stock, etc.)
    - Conception des interfaces utilisateur (maquettes, wireframes)
    - Définition des politiques de sécurité RLS (Row Level Security)
    - Spécification des APIs et des flux de données
5. **Implémentation (Codage)** : Développement effectif de l'application selon les conceptions définies :

    - Développement des composants React (`FormulairePatient.jsx`, `FormulaireRdv.jsx`, etc.)
    - Implémentation des hooks personnalisés (`useMissedReminders.js`)
    - Configuration de Supabase (authentification, base de données, fonctions serveur)
    - Intégration des bibliothèques (Recharts pour les graphiques, jsPDF pour les PDF)

#### **Branche montante (Tests et Validation)**

6. **Tests unitaires** : Validation de chaque composant individuellement :

    - Tests des composants React (affichage, interactions, gestion d'état)
    - Tests des fonctions utilitaires (génération PDF, calculs financiers)
    - Tests des hooks personnalisés
    - Vérification que chaque unité de code fonctionne correctement isolément
7. **Tests d'intégration** : Validation des interactions entre les composants :

    - Tests d'intégration React ↔ Supabase
    - Tests des flux de données entre les modules (ex: patient → rendez-vous → ordonnance)
    - Tests des APIs et des fonctions serveur
    - Vérification que les différents modules communiquent correctement

    **Tests de validation** : Validation du système par rapport aux spécifications fonctionnelles :
8. -   Tests des scénarios métiers complets (prise de rendez-vous, consultation, facturation)
    - Tests des permissions par rôle (superadmin, médecin, secrétaire, etc.)
    - Tests de génération des documents (ordonnances PDF, rapports)
    - Vérification que le système répond aux besoins fonctionnels
9. **Tests d'acceptation** : Validation finale avec les utilisateurs réels du cabinet :

    - Tests en conditions réelles avec les données du cabinet SMILE
    - Validation de l'ergonomie et de l'expérience utilisateur
    - Tests de performance et de charge
    - Recette utilisateur et validation de la conformité aux attentes

### Avantages du modèle en V pour SMILE

- **Qualité élevée** : Les tests sont planifiés dès le début et exécutés systématiquement à chaque niveau
- **Traçabilité complète** : Chaque test peut être relié à une exigence spécifique du cahier des charges
- **Détection précoce des anomalies** : Les spécifications de test sont définies avant le codage, ce qui permet d'identifier les ambiguïtés tôt
- **Adapté aux projets critiques** : Particulièrement approprié pour les systèmes médicaux où les erreurs peuvent avoir des conséquences importantes
- **Documentation complète** : Produit une documentation exhaustive utile pour la maintenance et l'évolution
- **Validation formelle** : Chaque phase est validée avant de passer à la suivante, réduisant les risques de régression

### Inconvénients et limites

- **Peu flexible aux changements** : Une fois les spécifications figées, il est difficile de modifier les besoins
- **Livraison tardive** : Le produit n'est livré qu'en fin de cycle, après tous les tests
- **Coût des corrections** : Les erreurs détectées tardivement sont coûteuses à corriger
- **Rigidité** : Peu adapté aux projets où les besoins évoluent fréquemment
- **Temps de développement** : Peut être plus long que les approches itératives comme Agile

### Application concrète au projet SMILE

Pour le projet SMILE, le modèle en V s'est déroulé de la manière suivante :

**Phase 1 - Analyse des besoins** :

- Identification des acteurs (superadmin, médecin, secrétaire, comptable, assistant)
- Recueil des besoins fonctionnels (gestion patients, RDV, ordonnances, factures, stock, rappels SMS, rapports)
- Définition des besoins non fonctionnels (sécurité, ergonomie, performance, maintenabilité)

**Phase 2 - Spécifications** :

- Rédaction du cahier des charges détaillé
- Définition des user stories et critères d'acceptation
- Spécification des contraintes techniques (React, Supabase, PostgreSQL)

**Phase 3 - Conception globale** :

- Architecture technique : SPA React + Supabase Backend-as-a-Service
- Modélisation UML (diagrammes de classes, de séquence, d'état-transition, de déploiement)
- Choix des technologies : Tailwind CSS, React Router, Recharts, jsPDF

**Phase 4 - Conception détaillée** :

- Schéma de base de données PostgreSQL (tables : users_profiles, patients, rendez_vous, ordonnances, factures, stock, rappels_sms)
- Maquettes des interfaces utilisateur
- Définition des politiques de sécurité RLS
- Spécification des fonctions serveur (Edge Functions pour les rappels SMS)

**Phase 5 - Implémentation** :

- Développement des composants React (`Dashboard.jsx`, `RendezVous.jsx`, `FormulairePatient.jsx`, etc.)
- Configuration de Supabase (authentification, migrations SQL, politiques de sécurité)
- Intégration des fonctionnalités métier (génération PDF, graphiques statistiques, rappels SMS)

**Phase 6 - Tests unitaires** :

- Tests des composants React avec React Testing Library
- Tests des utilitaires (génération PDF, calculs financiers)
- Tests des hooks personnalisés (`useMissedReminders.js`)

**Phase 7 - Tests d'intégration** :

- Tests d'intégration React ↔ Supabase
- Tests des flux complets (création patient → prise de RDV → création ordonnance → facturation)
- Tests des permissions par rôle

**Phase 8 - Tests de validation** :

- Tests des scénarios métiers complets
- Validation des fonctionnalités critiques (sécurité des données, gestion des rendez-vous, facturation)
- Tests de génération des documents (ordonnances, rapports)

**Phase 9 - Tests d'acceptation** :

- Recette utilisateur avec les différents profils (médecin, secrétaire, comptable)
- Tests en conditions réelles avec des données de test représentatives
- Validation de l'ergonomie et de la performance
- Correction des derniers bugs avant déploiement

### Conclusion

Le modèle en V a permis de développer l'application SMILE avec une approche rigoureuse et structurée, garantissant une qualité élevée et une traçabilité complète des exigences jusqu'aux tests. Bien que moins flexible que l'approche Agile, ce modèle s'est avéré particulièrement adapté à un projet médical où la fiabilité, la sécurité et la conformité sont essentielles. La documentation complète produite facilitera également la maintenance et l'évolution future du système.