# TCF Canada Pro — Récapitulatif du projet (État actuel)

> **Date de mise à jour :** Juillet 2026  
> **Auteur :** Antigravity AI (Agent de développement)  
> **Destination :** Ce fichier est destiné aux agents suivants pour leur permettre de reprendre le développement exactement là où il a été arrêté.

---

## 🗂️ Localisation du projet

```
C:\Users\HP\Desktop\tati.html\monprojet1\projet\tcf-canada-pro\
```

## 🧱 Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Next.js | 16.2.10 | Framework principal (App Router) |
| React | 19.2.4 | UI |
| TypeScript | ^5 | Typage |
| Tailwind CSS | v4 | Styles |
| Framer Motion | ^12 | Animations |
| Lucide React | ^1.25 | Icônes |
| Supabase JS | ^2.110 | Base de données & Auth |
| @supabase/ssr | ^0.12 | Intégration Next.js SSR |
| clsx + tailwind-merge | - | Utilitaires CSS |
| class-variance-authority | - | Variantes de composants |
| @radix-ui/react-slot | - | Base pour Button |
| @radix-ui/react-label | - | Labels formulaires |
| tailwindcss-animate | - | Animations Tailwind |

---

## 🔗 Connexion Supabase

- **Project ID :** `ouraqvirmashzzstkqfx`
- **URL :** `https://ouraqvirmashzzstkqfx.supabase.co`
- **Région :** eu-west-1
- **Status :** ACTIVE_HEALTHY
- **Fichier .env.local :** configuré avec `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Tables créées dans Supabase :
- `public.profiles` (id, full_name, avatar_url, role, created_at)
- `public.exams` (id, title, description, type, duration_minutes, created_at)
- `public.questions` (id, exam_id, content, audio_url, options, correct_answer, points)
- `public.results` (id, user_id, exam_id, score, ai_feedback, completed_at)
- `public.subscriptions` (id, user_id, plan, status, current_period_end, created_at)

> **RLS activé** sur toutes les tables. Les politiques RLS sont **à créer** (prochaine étape).

---

## 📁 Architecture des fichiers

```
tcf-canada-pro/
├── .env.local                          ✅ Configuré (Supabase)
├── package.json                        ✅ Toutes dépendances installées
├── tailwind.config.ts                  ✅ (géré via globals.css Tailwind v4)
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ✅ Layout racine, Inter via <link>, lang="fr"
│   │   ├── globals.css                 ✅ Thème complet (Rouge Canada #D52B1E, dark mode)
│   │   ├── page.tsx                    ✅ Landing Page complète
│   │   ├── (auth)/
│   │   │   ├── layout.tsx              ✅ Layout centré avec logo
│   │   │   ├── login/page.tsx          ✅ Formulaire de connexion
│   │   │   └── register/page.tsx       ✅ Formulaire d'inscription
│   │   └── dashboard/
│   │       ├── layout.tsx              ✅ Layout avec Sidebar + Topbar
│   │       ├── page.tsx                ✅ Dashboard accueil (stats, progression, activité)
│   │       ├── exams/
│   │       │   ├── page.tsx            ✅ Sélection des 4 épreuves
│   │       │   ├── listening/page.tsx  ✅ Compréhension Orale complète
│   │       │   ├── reading/page.tsx    ✅ Compréhension Écrite complète
│   │       │   ├── writing/page.tsx    ✅ Expression Écrite + IA simulée
│   │       │   └── speaking/page.tsx   ✅ Expression Orale + IA simulée
│   │       ├── progress/page.tsx       ✅ Graphiques de progression + objectifs
│   │       ├── leaderboard/page.tsx    ✅ Classement mondial
│   │       ├── profile/page.tsx        ✅ Profil complet + notifications
│   │       ├── courses/                ⬜ Dossier créé, page à faire
│   │       ├── quiz/                   ⬜ Dossier créé, page à faire
│   │       ├── history/                ⬜ Dossier créé, page à faire
│   │       ├── certificates/           ⬜ Dossier créé, page à faire
│   │       └── settings/              ⬜ À créer
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx              ✅ Variantes : default, outline, ghost, glass
│   │   │   ├── card.tsx                ✅ Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter
│   │   │   ├── badge.tsx               ✅ Variantes : default, outline, glass
│   │   │   ├── input.tsx               ✅ Input stylé
│   │   │   └── label.tsx               ✅ Label Radix
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              ✅ Glassmorphism, liens, CTA, Framer Motion
│   │   │   └── Footer.tsx              ✅ Footer 4 colonnes
│   │   └── dashboard/
│   │       ├── Sidebar.tsx             ✅ Sidebar pliable, 11 liens, icônes Lucide
│   │       └── Topbar.tsx              ✅ Recherche, notifications, avatar utilisateur
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.ts               ✅ Client navigateur (createBrowserClient)
│   │       └── server.ts               ✅ Client serveur (createServerClient + cookies)
│   └── lib/
│       └── utils.ts                    ✅ Fonction cn() pour clsx + tailwind-merge
```

---

## ✅ Fonctionnalités implémentées

### Landing Page (`/`)
- [x] Navbar glassmorphism avec Framer Motion (slide depuis le haut)
- [x] Section Hero : titre, sous-titre, 2 boutons CTA, badge animé, fond gradient
- [x] Section "Pourquoi nous choisir" : 6 cartes animées au scroll
- [x] Section "4 Épreuves" : layout 2 colonnes, barres de progression animées
- [x] Section Témoignages : 3 avis avec étoiles (sur fond rouge Canada)
- [x] Section Tarifs : 3 plans (Gratuit, Premium, Premium Plus) — plan central mis en avant
- [x] Footer 4 colonnes avec liens

### Authentification (`/login`, `/register`)
- [x] Pages de connexion et inscription (UI uniquement, pas encore connecté à Supabase Auth)
- [x] Layout dédié centré avec logo
- [x] Composants Input, Label, Button

### Dashboard (`/dashboard`)
- [x] Sidebar pliable (11 liens : Accueil, Cours, Examens, Quiz, Progression, Historique, Classement, Certificats, Profil, Paramètres, Support + Déconnexion)
- [x] Topbar avec barre de recherche, cloche notifications, avatar
- [x] Page d'accueil : 4 KPIs (score moyen, examens, temps, série), barres de progression par épreuve, activité récente, accès rapide aux 4 épreuves
- [x] Page Examens : sélection des 4 épreuves avec cartes descriptives
- [x] Page Progression : graphique en barres animé (7 jours), 4 KPIs, objectifs du mois
- [x] Page Classement : top 9 mondial + position de l'utilisateur, filtres (Mondial / Hebdo / Pays)
- [x] Page Profil : avatar, informations, changement de mot de passe, toggles notifications

### Module Compréhension Orale (`/dashboard/exams/listening`)
- [x] Lecteur audio simulé (play/pause, barre de progression interactive, temps)
- [x] Chronomètre 35 minutes (alerte rouge < 5 min)
- [x] 5 questions QCM avec boutons radio personnalisés
- [x] Navigation entre questions (points de navigation visuels)
- [x] Sauvegarde des réponses en mémoire locale
- [x] Page de résultats avec score, corrections détaillées par question
- [x] Animations de transition entre questions (Framer Motion)

### Module Compréhension Écrite (`/dashboard/exams/reading`)
- [x] 2 textes authentiques sur l'immigration francophone canadienne
- [x] Layout deux colonnes : texte à gauche, QCM à droite
- [x] 3 questions au total avec navigation entre passages
- [x] Chronomètre 60 minutes
- [x] Page de résultats avec corrections détaillées

### Module Expression Écrite (`/dashboard/exams/writing`)
- [x] 3 tâches d'écriture (courriel formel, essai argumentatif, synthèse)
- [x] Éditeur textarea stylé avec compteur de mots en temps réel
- [x] Indicateur de longueur (sous-limite / ok / dépassement)
- [x] Chronomètre 60 minutes
- [x] Correction par IA **simulée** (2 secondes de chargement, feedback prédéfini)
- [x] Onglets pour naviguer entre les 3 tâches avec indicateur de complétion

### Module Expression Orale (`/dashboard/exams/speaking`)
- [x] 3 tâches orales (monologue, interaction, argumentation)
- [x] Phase de préparation avec minuterie (30 à 60 secondes selon tâche)
- [x] Phase d'enregistrement avec visualiseur audio animé (barres)
- [x] Simulation de réécoute avec barre de lecture
- [x] Évaluation par IA **simulée** avec feedback détaillé (prononciation, fluidité, vocabulaire, structure, niveau CECRL)
- [x] Bouton "recommencer" pour refaire l'enregistrement

---

## 🎨 Design System

| Élément | Valeur |
|---|---|
| Couleur primaire | Rouge Canada `#D52B1E` (HSL 356 75% 48%) |
| Police | Inter (chargée via `<link>` HTML) |
| Icônes | Lucide React |
| Coins | Arrondis (radius 0.5rem, cartes 2xl) |
| Glassmorphism | `bg-white/80 backdrop-blur-md` |
| Dark mode | Variables CSS + classe `.dark` |
| Animations | Framer Motion (fadeIn, slideIn, stagger, barres animées) |

---

## ⚠️ Ce qui reste à faire (Prochaines étapes)

### Priorité haute
- [ ] **Connexion Auth Supabase** : brancher les formulaires login/register sur `supabase.auth.signIn/signUp`
- [ ] **Middleware de protection des routes** : créer `src/middleware.ts` pour rediriger les utilisateurs non connectés
- [ ] **Politiques RLS Supabase** : ajouter les policies (users can read/write their own data)
- [ ] **Sauvegarde des résultats en BDD** : insérer les scores dans `public.results` après chaque examen
- [ ] **Page Cours** (`/dashboard/courses`) : liste des cours par compétence
- [ ] **Page Quiz** (`/dashboard/quiz`) : mode entraînement rapide
- [ ] **Page Historique** (`/dashboard/history`) : liste de tous les examens passés
- [ ] **Page Certificats** (`/dashboard/certificates`) : génération PDF

### Priorité moyenne
- [ ] **Dashboard Admin** (`/admin`) : gestion utilisateurs, examens, statistiques
- [ ] **PWA** : manifest.json, service worker, icônes
- [ ] **SEO** : robots.txt, sitemap.xml, Open Graph
- [ ] **Paiements** : architecture Stripe (webhooks, portail client)
- [ ] **Notifications** : système de rappels email (ex: Resend)
- [ ] **Vraie intégration IA** : OpenAI API pour correction écrite et orale

### Priorité basse
- [ ] Page FAQ complète (section accordéon)
- [ ] Modes examen complet (les 4 épreuves enchaînées)
- [ ] Système de badges et récompenses
- [ ] Blog
- [ ] Support chat intégré

---

## 🚀 Pour lancer le projet

```powershell
# Ajouter Node.js au PATH
$env:Path += ";C:\Program Files\nodejs"

# Aller dans le dossier projet
cd C:\Users\HP\Desktop\tati.html\monprojet1\projet\tcf-canada-pro

# Mode développement
npm run dev
# → http://localhost:3000

# Build production
npm run build
npm run start
```

---

## 📌 Notes importantes pour les agents suivants

1. **`npm` et `node` ne sont PAS dans le PATH système** — Il faut toujours préfixer les commandes avec `$env:Path += ";C:\Program Files\nodejs"`.
2. **Shadcn UI ne peut pas être initialisé** via `npx shadcn init` (timeout réseau vers ui.shadcn.com). Les composants ont été créés **manuellement** dans `src/components/ui/`.
3. **Google Fonts ne fonctionne pas pendant le build** (pas d'accès réseau). La police Inter est chargée via `<link>` dans `layout.tsx`.
4. **Les fonctionnalités IA sont simulées** (setTimeout) — En production, brancher sur l'API OpenAI.
5. **L'enregistrement audio est simulé** — La Web Audio API n'est pas encore branchée.
6. **Le fichier `globals.css` utilise Tailwind v4** (`@import "tailwindcss"` et `@theme {}` au lieu de `@tailwind base/components/utilities`).
