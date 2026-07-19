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
