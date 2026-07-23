# Guide des fichiers du projet (TCF Canada Pro)

Ce document répertorie tous les fichiers principaux du projet permettant de modifier les différentes parties du site ainsi que le fonctionnement de la mise à jour de la photo de profil.

---

## 1. Landing Page (Page d'accueil principale)
- **Fichier principal :** [`src/app/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/page.tsx)
  *Permet de modifier les sections de présentation, tarifs, témoignages, hero banner, header et footer de la page d'accueil public.*

---

## 2. Interface de Connexion & Inscription (Auth)
- **Page de connexion :** [`src/app/(auth)/login/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/(auth)/login/page.tsx)
  *Permet d'adapter le formulaire d'authentification (email, mot de passe, bouton de connexion, redirection).*
- **Page d'inscription :** [`src/app/(auth)/register/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/(auth)/register/page.tsx)
  *Permet de modifier le formulaire de création de compte candidat.*

---

## 3. Ensemble du Dashboard Client (Structure & Pages)

### Structure globale (Layout & Barres de navigation)
- **Layout global du Dashboard :** [`src/app/dashboard/layout.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/layout.tsx)
- **Barre supérieure (Topbar avec photo & nom) :** [`src/components/dashboard/Topbar.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/components/dashboard/Topbar.tsx)
- **Barre latérale (Sidebar avec le menu) :** [`src/components/dashboard/Sidebar.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/components/dashboard/Sidebar.tsx)

### Pages du Dashboard Client
- **Tableau de bord principal :** [`src/app/dashboard/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/page.tsx)
- **Mes cours :** [`src/app/dashboard/courses/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/courses/page.tsx)
- **Tests pratiques :** [`src/app/dashboard/exams/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/exams/page.tsx)
- **Résultats :** [`src/app/dashboard/results/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/results/page.tsx)
- **Coaching :** [`src/app/dashboard/coaching/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/coaching/page.tsx)
- **Mes réservations :** [`src/app/dashboard/reservations/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/reservations/page.tsx)
- **Paiements :** [`src/app/dashboard/payments/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/payments/page.tsx)
- **Messages :** [`src/app/dashboard/messages/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/messages/page.tsx)
- **Mon profil :** [`src/app/dashboard/profile/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/profile/page.tsx)
- **Paramètres :** [`src/app/dashboard/settings/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/settings/page.tsx)

---

## 4. Synchronisation de la photo de profil (aux 2 endroits entourés en jaune)

Lorsque vous importez une nouvelle photo de profil sur la page **Mon Profil**, elle est instantanément mise à jour dans les deux emplacements indiqués :
1. **Sur l'image principale de la page Profil :** [`src/app/dashboard/profile/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/profile/page.tsx)
2. **Sur le petit avatar en haut à droite (Topbar) :** [`src/components/dashboard/Topbar.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/components/dashboard/Topbar.tsx)

### Comment fonctionne la synchronisation automatique ?
- La nouvelle image est sauvegardée dans le navigateur (`localStorage` sous la clé `griffon_avatar_url`).
- Un événement `storage` est émis pour avertir la **Topbar** de changer l'image instantanément sans nécessiter d'actualiser la page.

---

## 5. Architecture, Contenus Pédagogiques (Cours) et Simulateurs d'Examens (Tests TCF)

Cette section répertorie l'ensemble des fichiers gérant la formation, les tests officiels NCLC, les moteurs de génération IA sans doublon et les interfaces interactives du candidat.

### 📚 Données de Base et Banques d'Exercices (Contenus statiques initiaux)
- **Banque de leçons :** [`src/data/realCourses.ts`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/data/realCourses.ts)  
  *Contient les cours initiaux de Compréhension Orale (`listeningCourses`), Compréhension Écrite (`readingCourses`), Expression Écrite (`writingCourses`) et Expression Orale (`speakingCourses`).*
- **Banque d'épreuves officielles :** [`src/data/realExams.ts`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/data/realExams.ts)  
  *Contient les questions de test, chronomètres, barèmes NCLC sur 699 pts et corrections détaillées pour la Compréhension Orale (`listeningQuestions`), la Compréhension Écrite (`readingPassages`), l'Expression Écrite (`writingTasks`) et l'Expression Orale (`speakingTasks`).*

### ⚙️ Moteurs IA, Générateurs et Algorithmes Anti-Doublon (Logique 0 % répétition)
- **Moteur IA et bibliothèque procédurale :** [`src/utils/tcfContentEngine.ts`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/utils/tcfContentEngine.ts)  
  *Moteur central garantissant l'unicité absolue. Contient l'indexation bijective (`getBijectiveTuple`), la base des 120 thèmes canadiens authentiques (`TCF_TOPICS_DATABASE`), les matrices narratives par compétence (`TCFProceduralLibrary`) et le générateur de leçons inédites (`generateUniqueLesson`).*
- **Générateur et assembleur d'épreuves :** [`src/utils/courseGenerator.ts`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/utils/courseGenerator.ts)  
  *Interface le moteur IA pour produire dynamiquement les listes de cours (`generateLessonsForPack`) et d'examens (`generateExamQuestionsForPack`, `generateExamPassagesForPack`, `generateExamWritingTasksForPack`) selon le pack souscrit (Standard, Griffon d'Or, VIP).*
- **Moteur audio professionnel :** [`src/utils/audioContentEngine.ts`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/utils/audioContentEngine.ts)  
  *Gère la rotation intelligente des thèmes, des profils vocaux multi-locuteurs (accents québécois, acadiens, parisiens) et génère des scénarios audio d'écoute 100 % inédits (`AudioRotationEngine`).*
- **Gestionnaire des packs et quotas :** [`src/utils/subscriptionEngine.ts`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/utils/subscriptionEngine.ts)  
  *Définit les volumes d'accès et les niveaux CECR par abonnement (Standard : 20 items ; Griffon d'Or : 5 000 items ; VIP & Coaching : 10 000 items).*
- **Script d'audit mathématique :** [`src/utils/verify_refonte.ts`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/utils/verify_refonte.ts)  
  *Script d'automatisation validant qu'il n'y a aucun doublon textuel ou de titre sur plus de 60 000 items générés.*

### 🖥️ Interfaces des Cours (Leçons pédagogiques dans le Dashboard)
- **Page d'accueil "Mes Cours" :** [`src/app/dashboard/courses/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/courses/page.tsx)
- **Module Compréhension Orale (CO) :** [`src/app/dashboard/courses/listening/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/courses/listening/page.tsx)
- **Module Compréhension Écrite (CE) :** [`src/app/dashboard/courses/reading/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/courses/reading/page.tsx)
- **Module Expression Écrite (EE) :** [`src/app/dashboard/courses/writing/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/courses/writing/page.tsx)
- **Module Expression Orale (EO) :** [`src/app/dashboard/courses/speaking/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/courses/speaking/page.tsx)

### 📝 Interfaces des Tests / Examens Pratiques (Simulateurs officiels NCLC)
- **Page d'accueil "Tests Pratiques" :** [`src/app/dashboard/exams/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/exams/page.tsx)
- **Simulateur Compréhension Orale (CO) :** [`src/app/dashboard/exams/listening/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/exams/listening/page.tsx)
- **Simulateur Compréhension Écrite (CE) :** [`src/app/dashboard/exams/reading/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/exams/reading/page.tsx)
- **Simulateur Expression Écrite (EE) :** [`src/app/dashboard/exams/writing/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/exams/writing/page.tsx)
- **Simulateur Expression Orale (EO) :** [`src/app/dashboard/exams/speaking/page.tsx`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard/exams/speaking/page.tsx)

### 🎧 Ressources Audio
- **Dossier physique des fichiers audio statiques :** [`public/audio/`](file:///c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/public/audio)  
  *Contient les enregistrements MP3 de base (ex: `tcf_co_1.mp3`, `tcf_co_2.mp3`...). Les cours et examens procéduraux génèrent quant à eux des URL audio virtuelles et des dialogues multi-locuteurs dynamiques.*
