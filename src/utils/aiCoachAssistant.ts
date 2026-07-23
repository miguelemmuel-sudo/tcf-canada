// ─── Moteur IA de Messagerie Pédagogique Structurée (TCF Canada Pro) ────────
// Transforme chaque question utilisateur en réponse structurée, performante
// et riche en conseils selon le sujet abordé et le pack d'abonnement actif.

export interface AssistantReplyContext {
  userQuery: string;
  userPack: string;
  coachName?: string;
}

export function generateStructuredAssistantReply(context: AssistantReplyContext): string {
  const { userQuery, userPack, coachName = "Coach IA TCF" } = context;
  const lower = userQuery.toLowerCase();

  // 1. SALUTATIONS & REMERCIEMENTS
  if (/^(bonjour|salut|coucou|hello|bonsoir|hey)/i.test(lower) && lower.length < 25) {
    return `🎯 **Analyse de votre demande :** Prise de contact avec votre assistant ${coachName}.

💡 **Accueil Pédagogique :**
Bonjour ! Je suis votre coach personnel dédié à votre réussite au TCF Canada. Mon rôle est de vous guider à travers les exigences officielles (CECR et barème NCLC d'IRCC) pour maximiser votre score.

📌 **Comment puis-je vous aider aujourd'hui ?**
Vous pouvez m'interroger sur :
• **Les règles de grammaire & vocabulaire** (élision, subjonctif, connecteurs logiques...)
• **Les stratégies d'examen** (gestion du temps en Compréhension Écrite, écoute en Compréhension Orale...)
• **Les critères de notation** (tâches d'Expression Écrite 1, 2 et 3 ou Expression Orale...)
• **Votre plan de révision** et l'organisation de vos simulations.

🚀 **Prochaine étape :** Posez-moi directement votre question ou demandez-moi un conseil spécifique sur une épreuve !`;
  }

  if (/(merci|super|génial|parfait|d'accord|ok|top)/i.test(lower) && lower.length < 30) {
    return `🎯 **Analyse de votre demande :** Confirmation et suivi de votre progression.

💡 **Le mot du Coach :**
Avec grand plaisir ! La régularité et la précision sont les clés pour valider un **NCLC 7, 9 ou 10+** au TCF Canada. Chaque entraînement vous rapproche de votre objectif d'immigration.

📌 **Conseil de maintien :**
Ne relâchez pas vos efforts : essayez de compléter au moins **1 série de QCM (CE/CO)** et **1 production (EE/EO)** tous les deux jours pour maintenir vos automatismes linguistiques.

🚀 **Prochaine étape :** Renseignez-vous dans l'onglet **Cours** ou relancez une simulation complète dans l'onglet **Examens** !`;
  }

  // 2. SCORING, BARÈMES, NCLC & ENTRÉE EXPRESS IRCC
  if (/(point|score|barème|nclc|cecrl|ircc|entrée express|immigration|résidence|calcul|notation|résultat|combien de points)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Compréhension du barème officiel TCF Canada et de la conversion en niveaux NCLC pour l'immigration canadienne (IRCC).

💡 **Règles & Explications Pédagogiques :**
Le TCF Canada est noté sur une échelle de **100 à 699 points** pour les épreuves à choix multiples (CO / CE) et sur **20 points** (convertis sur 699) pour les épreuves d'expression (EE / EO).
Voici la grille officielle d'équivalence IRCC (Entrée Express) :
• **NCLC 10 à 12 (C1/C2 - Élevé)** ➔ 600 – 699 pts (16 - 20/20 en EE/EO)
• **NCLC 9 (C1 - Avancé)** ➔ 523 – 599 pts (14 - 15/20) — *Niveau recommandé pour un score CRS maximal !*
• **NCLC 8 (B2 - Supérieur)** ➔ 500 – 522 pts (12 - 13/20)
• **NCLC 7 (B2 - Seuil requis IRCC)** ➔ 453 – 499 pts (10 - 11/20) — *Score minimal obligatoire pour la plupart des programmes.*
• **NCLC 6 (B1)** ➔ 398 – 452 pts (7 - 9/20)

📌 **Conseils du Coach & Stratégie :**
1. **Évitez la zone de danger (NCLC 6) :** Une seule erreur en QCM peut parfois vous faire basculer de 455 pts (NCLC 7) à 445 pts (NCLC 6). Visz toujours l'excellence lors de vos entraînements (objectif 80% de bonnes réponses).
2. **Homogénéité :** IRCC prend souvent en compte votre note la plus basse parmi les 4 compétences. Ne négligez aucune épreuve !

🚀 **Plan d'action :**
${userPack.toLowerCase().includes("vip") 
  ? "👑 **Avantage VIP :** Demandez un audit personnalisé de votre relevé de notes lors de votre prochaine séance 1-on-1 pour cibler les points exacts qui vous manquent pour le NCLC 9." 
  : "Faites un test blanc dans l'onglet **Examens** pour obtenir votre estimation NCLC actuelle par notre moteur IA."}`;
  }

  // 3. EXPRESSION ÉCRITE (EE) — STRUCTURE, MOTS, FAUTES FLE
  if (/(écriture|écrite|rédaction|rédiger|courriel|lettre|essai|argumentatif|tâche 1|tache 1|tâche 2|tache 2|tâche 3|tache 3|nombre de mots|mot)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Méthodologie et critères d'évaluation de l'épreuve d'Expression Écrite (EE) au TCF Canada.

💡 **Règles & Explications Pédagogiques :**
L'épreuve d'Expression Écrite comporte 3 tâches obligatoires à réaliser en 60 minutes :
• **Tâche 1 (Courriel formel/informel) :** 60 à 120 mots (conseil : ciblez 80-100 mots). Vous devez décrire, inviter, remercier ou demander une information.
• **Tâche 2 (Compte rendu d'expérience) :** 120 à 150 mots. Rédaction d'un article, d'un blog ou d'une lettre relatant une expérience vécue avec vos impressions.
• **Tâche 3 (Essai argumentatif comparé) :** 120 à 180 mots. Comparaison de deux points de vue (Document A et Document B) suivie de votre propre prise de position justifiée.

📌 **Conseils du Coach & Stratégie d'Examen :**
1. **Le piège du comptage de mots :** Le respect de la fourchette de mots est éliminatoire ! Si vous écrivez 50 mots à la Tâche 1 ou 200 mots à la Tâche 3, vous subirez une pénalité sévère au barème NCLC.
2. **Éliminez les fautes FLE basiques :** Faites très attention aux élisions (*"d'informatique"* et non *"de informatique"*) et aux prépositions géographiques (*"au Canada"*, *"en France"*, *"à Montréal"*).
3. **Enrichissement lexical :** Remplacez les verbes pauvres (*faire, avoir, dire*) par des verbes précis (*effectuer, disposer de, affirmer, démontrer*).

🚀 **Plan d'action :**
Rendez-vous dans **Examens ➔ Expression Écrite**. Soumettez votre texte : notre nouveau moteur IA analysera instantanément votre syntaxe, vos connecteurs et vous fournira une correction modèle C1/C2 adaptative !`;
  }

  // 4. EXPRESSION ORALE (EO) — ENTRETIEN, JURY, FLUIDITÉ
  if (/(oral|parler|parole|entretien|examinateur|jury|prononciation|accent|stress|hésitation|tâche orale)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Stratégie de réussite et maîtrise de l'épreuve d'Expression Orale (EO) face à l'examinateur.

💡 **Règles & Explications Pédagogiques :**
L'épreuve d'Expression Orale se déroule en face à face (ou sur ordinateur en version surveillée) en 3 tâches graduées (durée totale : 12 minutes) :
• **Tâche 1 (Entretien dirigé sans préparation - 2 min) :** Présentation personnelle, parcours, projet d'immigration au Canada.
• **Tâche 2 (Exercice en interaction - 3 min 30 s) :** Jeu de rôle où vous devez poser des questions à l'examinateur (ex: louer un appartement, s'inscrire à un club).
• **Tâche 3 (Monologue argumenté - 4 min 30 s) :** Vous répondez à une question de société sans préparation et développez un point de vue structuré.

📌 **Conseils du Coach & Stratégie :**
1. **Gérez vos hésitations :** Au lieu de faire des *"euh..."* prolongés, utilisez des connecteurs de reformulation et de temporisation : *"C'est une question très intéressante...", "En ce qui concerne mon parcours...", "Il convient de souligner que..."*.
2. **Respectez le vouvoiement (Tâche 2) :** N'oubliez jamais d'utiliser le vouvoiement et le conditionnel de politesse (*"J'aimerais savoir...", "Pourriez-vous m'indiquer..."*).
3. **Rythme vocal :** Ne parlez pas trop vite sous l'effet du stress. Une articulation claire et un débit posé inspirent la confiance au niveau C1/C2.

🚀 **Plan d'action :**
${userPack.toLowerCase().includes("vip")
  ? "👑 **Privilège VIP :** Utilisez l'onglet **Réservations** pour planifier une simulation orale blanche avec votre coach et recevoir un retour en direct sur votre prononciation et votre fluidité !"
  : "Testez notre simulateur dans **Examens ➔ Expression Orale** pour vous entraîner à répondre dans le temps imparti (chronomètre officiel)."}`;
  }

  // 5. COMPRÉHENSION ÉCRITE (CE) — GESTION DU TEMPS, QCM, TEXTES LONGS
  if (/(lecture|lire|texte|compréhension écrite|qcm|question|document|temps|60 min)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Méthodologie et gestion du chronomètre pour l'épreuve de Compréhension Écrite (CE).

💡 **Règles & Explications Pédagogiques :**
L'épreuve de Compréhension Écrite comporte **39 questions à choix multiples (QCM)** à réaliser en **60 minutes exactes** (soit une moyenne de 1 min 30 s par question). Les questions suivent une progression de difficulté du niveau A1 (question 1) au niveau C2 (question 39).

📌 **Conseils du Coach & Stratégie :**
1. **Règle d'or de la gestion du temps :** Ne passez jamais plus d'une minute sur les questions 1 à 15 (très faciles/intermédiaires). Vous aurez besoin de 2 à 3 minutes par question pour les textes longs et philosophiques des niveaux C1/C2 (questions 25 à 39).
2. **Technique du balayage (Skimming/Scanning) :** Lisez TOUJOURS la question et les 4 options de réponse (A, B, C, D) *avant* de lire le texte. Cela permet de chercher directement l'information cible.
3. **Attention aux reformulations :** La bonne réponse n'utilise presque jamais les mêmes mots que le texte ; elle utilise des synonymes ou des paraphrases linguistiques.

🚀 **Plan d'action :**
Lancez une série d'entraînement dans l'onglet **Cours ➔ Compréhension Écrite** et observez nos explications détaillées pour comprendre chaque distracteur.`;
  }

  // 6. COMPRÉHENSION ORALE (CO) — AUDIO, ÉCOUTE, ACCENTS CANADIENS
  if (/(écoute|écouter|audio|son|compréhension orale|accent|québec|québécois|locuteur|vitesse)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Techniques d'écoute et maîtrise de l'épreuve de Compréhension Orale (CO).

💡 **Règles & Explications Pédagogiques :**
L'épreuve de Compréhension Orale comporte **39 questions en 35 minutes**.
⚠️ **Règle critique :** Chaque document sonore et chaque question ne sont diffusés qu'**UNE SEULE FOIS**. Il est impossible de revenir en arrière ou de mettre en pause lors de l'examen officiel.

📌 **Conseils du Coach & Stratégie :**
1. **L'anticipation visuelle :** Pendant les quelques secondes de silence avant le lancement de l'audio, lisez rapidement les options A, B, C et D sur votre écran pour deviner le contexte (lieu, personnages, problème).
2. **Familiarisation avec les accents :** Le TCF Canada intègre des voix avec des accents de France, du Québec, d'Acadie et de francophonie internationale. Habituez-vous aux prononciations québécoises (ex: *attendre / assister / fin de semaine*).
3. **Pièges phonétiques :** Méfiez-vous des mots qui se ressemblent phonétiquement mais ont des sens opposés (ex: *location* vs *colocation*, *émigrer* vs *immigrer*).

🚀 **Plan d'action :**
Pratiquez dans l'onglet **Examens ➔ Compréhension Orale** qui simule exactement le rythme de diffusion officiel sans pause.`;
  }

  // 7. GRAMMAIRE FLE, CONJUGAISON, ORTHOGRAPHE & PRÉPOSITIONS
  if (/(grammaire|conjugaison|subjonctif|participe passé|accord|préposition|élision|orthographe|syntaxe|règle)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Perfectionnement grammatical et élimination des erreurs syntaxiques en FLE.

💡 **Règles & Explications Pédagogiques :**
Au niveau B2/C1 (NCLC 7 à 9), le jury sanctionne lourdement 3 catégories d'erreurs :
1. **L'élision obligatoire :** On écrit *"d'informatique"*, *"l'université"*, *"d'emploi"* (et jamais *"de informatique"* ou *"la université"*).
2. **Les prépositions devant les noms de pays et villes :**
   • Pays féminins ou commençant par une voyelle ➔ **en** (*en France, en Iran, en Ontario*)
   • Pays masculins ➔ **au** (*au Canada, au Maroc, au Sénégal*)
   • Pays pluriels ➔ **aux** (*aux États-Unis, aux Pays-Bas*)
   • Villes ➔ **à** (*à Montréal, à Toronto, à Vancouver*)
3. **Infinitif vs Participe Passé :** Après une préposition (*pour, de, sans, à*), le verbe est TOUJOURS à l'infinitif (*"pour demander"*, *"sans oublier"*).

📌 **Conseils du Coach :**
Avant de valider une rédaction (EE), consacrez toujours 3 minutes de relecture exclusive pour chasser ces erreurs fréquentes. Une syntaxe irréprochable peut rehausser votre note d'un niveau NCLC complet !

🚀 **Plan d'action :**
Notre moteur IA d'évaluation détecte désormais automatiquement toutes ces fautes FLE et vous indique la règle exacte dans vos bilans de correction.`;
  }

  // 8. VOCABULARY & CONNECTEURS LOGIQUES
  if (/(vocabulaire|lexique|connecteur|transition|mot de liaison|synonyme|enrichir|enrichissement)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Enrichissement du vocabulaire et utilisation stratégique des connecteurs logiques.

💡 **Règles & Explications Pédagogiques :**
Le critère d'évaluation *"Étendue et maîtrise du lexique"* représente un quart de votre note en EE et EO.
Pour atteindre le niveau C1 (NCLC 9), vous devez articuler vos idées à l'aide de connecteurs académiques :
• **Pour ajouter une idée :** *De surcroît, par ailleurs, en outre, il convient d'ajouter que...*
• **Pour exprimer une opposition :** *Cependant, néanmoins, en revanche, toutefois, bien que...*
• **Pour expliquer la cause/conséquence :** *En effet, par conséquent, en raison de, dès lors...*
• **Pour conclure :** *En somme, pour conclure, en définitive, en dernière analyse...*

📌 **Conseils du Coach :**
Ne vous contentez pas d'aligner des phrases courtes avec *"et"*, *"mais"*, *"parce que"*. Structurez vos paragraphes autour de 2 ou 3 connecteurs puissants par texte.

🚀 **Plan d'action :**
Consultez les fiches de vocabulaire thématique dans **Cours** et utilisez au moins 3 nouveaux connecteurs lors de votre prochaine rédaction !`;
  }

  // 9. PLAN DE RÉVISION, GESTION DU STRESS & ORGANISATION
  if (/(plan|planning|révision|réviser|stress|peur|anxiété|organisation|combien de temps|préparation|agenda)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Organisation pédagogique, gestion du stress et planning optimal d'entraînement TCF.

💡 **Règles & Explications Pédagogiques :**
La préparation au TCF Canada s'apparente à un entraînement sportif : c'est la régularité et la simulation en conditions réelles qui réduisent l'anxiété le jour J.

📌 **Le Planning 14 Jours recommandé par l'Équipe Pédagogique :**
• **Jours 1 à 5 :** Révisez les bases dans l'onglet **Cours**. Complétez 2 leçons par compétence et apprenez par cœur 10 connecteurs logiques.
• **Jours 6 à 10 :** Pratique sectorielle. Faites des séries de 39 QCM en CE et CO en chronométrant strictement vos réponses.
• **Jours 11 à 13 :** Simulations complètes en conditions réelles dans **Examens** sans aucune aide externe ni interruption.
• **Jour 14 (Veille de l'examen) :** Repos cognitif, relecture légère de vos erreurs fréquentes et des conseils de votre Coach IA.

🚀 **Plan d'action :**
Suivez votre courbe de progression dans l'onglet **Progression** (l'objectif est d'atteindre une régularité de 30 à 45 minutes par jour).`;
  }

  // 10. RÉSERVATIONS, COACHING 1-ON-1 & VIP
  if (/(réservation|réserver|coach|coaching|1-on-1|humain|professeur|séance|rendez-vous|vip|whatsapp)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Accès à l'accompagnement personnalisé et aux séances de Coaching en direct.

💡 **Explication des Formules d'Accompagnement :**
• **Pack Standard & Griffon D'OR :** Vous bénéficiez de l'assistance illimitée du Coach IA 24/7, des corrections dynamiques automatisées et des examens blancs.
• **Pack VIP & Coaching :** Vous débloquez l'accès exclusif aux **séances individuelles 1-on-1 avec un évaluateur officiel FLE**, l'analyse statistique de vos faiblesses et le suivi WhatsApp en direct.

📌 **Conseils pour maximiser vos séances 1-on-1 :**
Avant votre rendez-vous, complétez au moins une épreuve d'Expression Orale et d'Expression Écrite sur la plateforme afin que votre coach puisse analyser votre diagnostic IA dès le début de la séance.

🚀 **Plan d'action :**
${userPack.toLowerCase().includes("vip")
  ? "👑 **Vous êtes membre VIP :** Allez directement dans l'onglet **Réservations** pour choisir la date et l'heure de votre prochaine session en visioconférence avec votre coach !"
  : "🌟 Pour bénéficier de cet encadrement individuel et d'un plan d'entraînement sur mesure, découvrez notre offre VIP dans l'onglet **Paramètres** ou **Abonnement**."}`;
  }

  // 11. DEMANDE DE SUJET OU D'EXEMPLE
  if (/(sujet|exemple|donne-moi|donne moi|propose|exercice|entraînement|question|test)/i.test(lower)) {
    return `🎯 **Analyse de votre demande :** Proposition d'un sujet d'entraînement pratique aux normes du TCF Canada.

💡 **Sujet d'entraînement immédiat (Expression Écrite — Tâche 2) :**
*Consigne officielle :*
Vous venez d'arriver au Canada pour vos études ou votre travail. Vous écrivez un article dans le journal de votre université ou sur votre blog professionnel pour raconter vos premières impressions sur votre nouvelle vie (logement, accueil, climat, démarches). Vous exprimez vos sentiments (surprises, difficultés, joies).

• **Volume exigé :** Entre 120 et 150 mots.
• **Critères clés :** Utilisation du passé composé / imparfait pour le récit, adjectifs d'émotion et connecteurs temporels (*dès mon arrivée, au début, ensuite, aujourd'hui*).

📌 **Conseils du Coach :**
Structurez votre texte en 3 paragraphes courts : 1. L'arrivée et l'installation, 2. Une surprise culturelle ou climatique, 3. Votre sentiment global et votre espoir pour l'avenir.

🚀 **Plan d'action :**
Copiez ce sujet, rédigez votre réponse et soumettez-la dans **Examens ➔ Expression Écrite** pour obtenir sa note NCLC et sa correction instantanée !`;
  }

  // 12. FALLBACK PÉDAGOGIQUE GÉNÉRAL STRUCTURÉ
  return `🎯 **Analyse de votre demande :** Accompagnement pédagogique et conseil stratégique TCF Canada.

💡 **Explication Pédagogique :**
J'ai bien pris en compte votre message concernant : *« ${userQuery} »*.
Au TCF Canada, la réussite ne dépend pas seulement de votre connaissance générale du français, mais de votre **capacité à répondre précisément aux exigences du barème IRCC** (NCLC 7 minimal pour l'immigration, NCLC 9 conseillé pour maximiser vos points Entrée Express).

📌 **Les 4 Piliers de notre Coaching :**
1. **Régularité :** 30 minutes de QCM par jour valent mieux que 4 heures une fois par semaine.
2. **Méthodologie QCM :** En lecture (CE) comme en écoute (CO), lisez les options avant d'analyser le document.
3. **Syntaxe irréprochable en rédaction :** Respect strict du nombre de mots (120-150 mots, 120-180 mots) et élimination des erreurs de prépositions (*au Canada*, *en France*).
4. **Fluidité à l'oral :** Connecteurs d'argumentation et vouvoiement de rigueur avec le jury.

🚀 **Comment souhaitez-vous poursuivre ?**
Précisez-moi votre besoin : voulez-vous un conseil sur la **Compréhension Écrite**, la **Compréhension Orale**, l'**Expression Écrite**, l'**Expression Orale** ou le **calcul de votre barème NCLC** ?`;
}
