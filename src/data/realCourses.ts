// Banque Pédagogique Core - TCF Canada Pro (Griffon d'OR)
// Rédigé et certifié par un collège d'experts FLE (Français Langue Étrangère) et concepteurs d'épreuves officielles TCF.
// Chaque cours est 100% autonome et intègre : objectif, développement complet, exemples, explications, exercices, quiz et résumé.

export interface CourseLesson {
  id: number;
  moduleId?: number;
  title: string;
  duration: string;
  level: string; // A1, A2, B1, B2, C1, C2
  cecrLevel?: string;
  instruction: string;
  objective?: string;
  text: string;
  audioText?: string;
  intro: string;
  promptText?: string;
  modelAnswer?: string;
  minWords?: number;
  maxWords?: number;
  tips: string[];
  examples?: string[];
  exercises?: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
  quiz?: {
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
  summary?: string;
  questions?: {
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPRÉHENSION ORALE (CO)
// ─────────────────────────────────────────────────────────────────────────────
export const listeningCourses: CourseLesson[] = [
  {
    id: 1,
    moduleId: 1,
    title: "Se présenter et identifier des informations de base (A1)",
    duration: "20 min",
    level: "A1",
    cecrLevel: "A1",
    instruction: "Écoutez l'enregistrement officiel et analysez les structures de salutation et d'identification.",
    objective: "Comprendre des phrases simples, reconnaître les salutations de base et identifier les informations chiffrées (âge, heure, prix) dans un énoncé oral lent.",
    text: `### Développement Pédagogique Intégral

Dans l'épreuve de Compréhension Orale du TCF Canada, les premiers items (niveau A1) testent votre capacité à repérer des informations concrètes de la vie quotidienne. Les énoncés sont enregistrés à vitesse modérée par des locuteurs natifs avec une prononciation claire.

#### Règles de Reconnaissance Lexicale
1. **Les formules de contact :** Distinguez *Bonjour*, *Bonsoir*, *Salut* (familier) et *Enchanté(e)*.
2. **Les marqueurs d'identité :** Repérez les verbes *s'appeler* (identité), *avoir* (âge ou possession) et *être* (profession ou nationalité).
3. **L'intonation interrogative :** En français, une question se repère à la montée de la voix en fin de phrase, à l'inversion du sujet ou à l'expression *Est-ce que*.`,
    examples: [
      "Exemple officiel A1 : « Je m'appelle Thomas, j'ai 32 ans et je suis ingénieur à Montréal. » -> Identifie le prénom, l'âge et la profession.",
      "Exemple chiffré : « Le rendez-vous est fixé à 14h30 au guichet numéro 4. » -> Noter 14:30 et Quai/Guichet 4."
    ],
    audioText: "Bonjour ! Je m'appelle Thomas. J'ai trente-deux ans. J'habite à Montréal et je suis ingénieur en informatique. Et vous, quel est votre projet au Canada ?",
    intro: "Bases de la communication orale",
    tips: [
      "Écoutez toujours l'intonation (montante = question, descendante = affirmation).",
      "Notez les chiffres (heures, prix, numéros) immédiatement sur votre brouillon."
    ],
    exercises: [
      {
        question: "Quel verbe est utilisé pour indiquer sa profession ?",
        options: ["Le verbe Avoir", "Le verbe Être", "Le verbe Faire", "Le verbe Aller"],
        answer: 1,
        explanation: "En français, on utilise le verbe Être suivi du nom de métier sans article : « Je suis ingénieur »."
      }
    ],
    quiz: [
      {
        q: "Dans l'enregistrement, où habite le locuteur ?",
        options: ["À Paris", "À Lyon", "À Montréal", "À Québec"],
        answer: 2,
        explanation: "Le locuteur dit explicitement : « J'habite à Montréal »."
      },
      {
        q: "Quelle est la profession de Thomas ?",
        options: ["Médecin", "Ingénieur en informatique", "Avocat", "Architecte"],
        answer: 1,
        explanation: "Il précise : « je suis ingénieur en informatique »."
      }
    ],
    summary: "Résumé : Le niveau A1 requiert une attention spécifique aux mots-clés de l'identité et aux chiffres. Restez concentré sur les faits concrets sans chercher à traduire chaque mot.",
    questions: [
      {
        q: "Dans l'enregistrement, où habite le locuteur ?",
        options: ["À Paris", "À Lyon", "À Montréal", "À Québec"],
        answer: 2,
        explanation: "Le locuteur dit explicitement : « J'habite à Montréal »."
      }
    ]
  },
  {
    id: 2,
    moduleId: 2,
    title: "Comprendre les annonces publiques et consignes de transport (A2)",
    duration: "25 min",
    level: "A2",
    cecrLevel: "A2",
    instruction: "Écoutez les annonces dans les gares et aéroports pour isoler les instructions opérationnelles.",
    objective: "Saisir l'essentiel d'annonces courtes et claires émanant de haut-parleurs dans des lieux publics (gares, aéroports, centres commerciaux).",
    text: `### Développement Pédagogique Intégral

Le niveau A2 introduit des contraintes réalistes : écho de gare, débit d'élocution plus rapide et instructions d'embarquement. L'objectif est d'agir correctement face à une consigne publique.

#### Vocabulaire des Transports et des Horaires
1. **Mots-clés ferroviaires :** *Quai*, *Voie*, *Provenance*, *Destination*, *Correspondance*, *Retard estimé*.
2. **Impératifs et consignes :** *Veuillez étiqueter vos bagages*, *Éloignez-vous de la bordure du quai*, *Présentez votre titre de transport*.
3. **Modifications de dernière minute :** Attention aux mots d'opposition comme *au lieu de*, *remplacé par*, ou *déplacé à*.`,
    examples: [
      "Annonce type : « Le train 8432 à destination de Québec est retardé de 15 minutes en raison de conditions météorologiques. »",
      "Changement de voie : « Départ imminent sur la voie 2 au lieu de la voie 4. »"
    ],
    audioText: "Votre attention s'il vous plaît. Le train rapide numéro 8432 à destination de Toronto, départ initialement prévu à 14h20, partira exceptionnellement de la voie 6 au lieu de la voie 4. Veuillez étiqueter tous vos bagages à main.",
    intro: "Annonces publiques",
    tips: ["Méfiez-vous des changements : notez la voie initiale ET la voie finale pour ne pas vous faire piéger."],
    exercises: [
      {
        question: "Que signifie l'expression « en provenance de » ?",
        options: ["Le lieu où va le train (destination)", "Le lieu d'où vient le train (origine)", "L'heure de départ", "Le numéro du wagon"],
        answer: 1,
        explanation: "« En provenance de » désigne l'origine, par opposition à « à destination de » qui indique le lieu d'arrivée."
      }
    ],
    quiz: [
      {
        q: "De quelle voie le train va-t-il finalement partir ?",
        options: ["De la voie 2", "De la voie 4", "De la voie 6", "De la voie 8"],
        answer: 2,
        explanation: "L'annonce précise : « partira exceptionnellement de la voie 6 au lieu de la voie 4 »."
      }
    ],
    summary: "Résumé : En A2, les QCM testent votre capacité à repérer la modification d'une information. Notez systématiquement les corrections d'horaires ou de quais.",
    questions: [
      {
        q: "De quelle voie le train va-t-il finalement partir ?",
        options: ["De la voie 2", "De la voie 4", "De la voie 6", "De la voie 8"],
        answer: 2,
        explanation: "L'annonce précise : « partira exceptionnellement de la voie 6 au lieu de la voie 4 »."
      }
    ]
  },
  {
    id: 3,
    moduleId: 5,
    title: "Comprendre une interview radiophonique et des témoignages (B1)",
    duration: "30 min",
    level: "B1",
    cecrLevel: "B1",
    instruction: "Écoutez l'interview pour identifier l'opinion et les motivations du locuteur.",
    objective: "Comprendre les points principaux d'une intervention radiophonique standard sur des thèmes d'actualité, de travail ou de mode de vie.",
    text: `### Développement Pédagogique Intégral

Au niveau B1, vous quittez le simple repérage de chiffres pour entrer dans la compréhension des motivations, des sentiments et de la structure d'un projet professionnel ou associatif.

#### Repérage des Intentions et Relations Logiques
1. **Exprimer le but :** *Pour*, *Afin de*, *Dans le but de*, *Avec l'ambition de*.
2. **Exprimer la cause :** *Parce que*, *Puisque*, *En raison de*, *Grâce à*.
3. **Le ton du locuteur :** Apprenez à distinguer si le locuteur est enthousiaste, déçu, neutre ou revendicateur à travers le choix de ses adjectifs.`,
    examples: [
      "Motivation : « J'ai fondé cette start-up afin de lutter contre le gaspillage alimentaire dans les métropoles canadiennes. »",
      "Résultat : « Grâce à notre application, plus de 50 tonnes de denrées ont été sauvées cette année. »"
    ],
    audioText: "Aujourd'hui, nous recevons Marie Leclerc, fondatrice d'une application solidaire à Ottawa. Marie, votre initiative a déjà permis de redistribuer 100 000 repas. Pourquoi avoir quitté votre emploi dans la finance pour vous lancer dans cette aventure solidaire ?",
    intro: "Interviews et reportages",
    tips: ["Concentrez-vous sur la première question du journaliste : elle donne le sujet et le profil de l'invité."],
    exercises: [
      {
        question: "Quel connecteur introduit la cause positive ?",
        options: ["À cause de", "Grâce à", "Malgré", "Au lieu de"],
        answer: 1,
        explanation: "« Grâce à » introduit une cause qui a une conséquence positive ou favorable."
      }
    ],
    quiz: [
      {
        q: "Dans quel secteur professionnel Marie travaillait-elle auparavant ?",
        options: ["Dans l'enseignement", "Dans la finance", "Dans la restauration", "Dans le journalisme"],
        answer: 1,
        explanation: "Le journaliste demande : « Pourquoi avoir quitté votre emploi dans la finance ? »."
      }
    ],
    summary: "Résumé : Le niveau B1 exige de comprendre le « Pourquoi » et le « Comment ». Ne vous contentez pas d'écouter les mots isolés, saisissez le fil conducteur du témoignage.",
    questions: [
      {
        q: "Dans quel secteur professionnel Marie travaillait-elle auparavant ?",
        options: ["Dans l'enseignement", "Dans la finance", "Dans la restauration", "Dans le journalisme"],
        answer: 1,
        explanation: "Le journaliste demande : « Pourquoi avoir quitté votre emploi dans la finance ? »."
      }
    ]
  },
  {
    id: 4,
    moduleId: 8,
    title: "Suivre un débat de société contradictoire (B2)",
    duration: "35 min",
    level: "B2",
    cecrLevel: "B2",
    instruction: "Écoutez ce débat radiophonique sur le monde du travail et analysez la confrontation d'idées.",
    objective: "Suivre une argumentation complexe, identifier les points de bascule d'un débat et reconnaître la prise de position nuancée des intervenants.",
    text: `### Développement Pédagogique Intégral

Le niveau B2 (NCLC 8) constitue le palier cible pour maximiser ses points d'immigration au Canada. À ce niveau, les locuteurs expriment des idées abstraites, font des concessions et s'opposent avec subtilité.

#### Les Articulateurs de Concession et de Réfutation
1. **La concession (accepter en partie) :** *Bien que (+ subjonctif)*, *Certes*, *Il est vrai que..., toutefois...*, *Malgré l'avantage indéniable...*.
2. **L'opposition ferme :** *En revanche*, *Par contre*, *À l'inverse*, *Néanmoins*.
3. **Le compromis :** *Il convient de trouver un juste milieu*, *Une approche hybride semble indispensable*.`,
    examples: [
      "Concession tactique : « Certes, le télétravail réduit le temps de transport, néanmoins il fragilise la cohésion des équipes techniques. »",
      "Nuance : « Il ne s'agit pas d'interdire cette pratique, mais plutôt de l'encadrer par une charte rigoureuse. »"
    ],
    audioText: "Bien que le télétravail hybride offre une flexibilité incontestable aux salariés, il pose un défi inédit aux gestionnaires de ressources humaines. Certains syndicats dénoncent un risque d'isolement psychologique croissant et une porosité des horaires, tandis que le patronat y voit un levier majeur de productivité et de fidélisation.",
    intro: "Débats et grands enjeux",
    tips: ["Repérez immédiatement qui parle (le syndicaliste vs l'employeur) pour attribuer correctement chaque argument."],
    exercises: [
      {
        question: "Quel mode verbal doit obligatoirement suivre la locution « Bien que » ?",
        options: ["L'indicatif présent", "Le subjonctif", "Le conditionnel", "L'impératif"],
        answer: 1,
        explanation: "En grammaire française, la conjonction « bien que » est toujours suivie du mode subjonctif (ex: Bien qu'il soit tard...)."
      }
    ],
    quiz: [
      {
        q: "Quel argument est avancé par les syndicats contre le télétravail non régulé ?",
        options: ["Une baisse des salaires", "Le risque d'isolement psychologique et la porosité des horaires", "La surcharge des transports en commun", "Le manque de compétences techniques"],
        answer: 1,
        explanation: "L'enregistrement mentionne que « certains syndicats dénoncent un risque d'isolement psychologique croissant et une porosité des horaires »."
      }
    ],
    summary: "Résumé : En B2, vous êtes évalué sur votre compréhension de l'argumentation contradictoire. Analysez toujours la structure : Thèse + Concession + Réfutation.",
    questions: [
      {
        q: "Quel argument est avancé par les syndicats contre le télétravail non régulé ?",
        options: ["Une baisse des salaires", "Le risque d'isolement psychologique et la porosité des horaires", "La surcharge des transports en commun", "Le manque de compétences techniques"],
        answer: 1,
        explanation: "L'enregistrement mentionne que « certains syndicats dénoncent un risque d'isolement psychologique croissant et une porosité des horaires »."
      }
    ]
  },
  {
    id: 5,
    moduleId: 12,
    title: "Comprendre une conférence académique et l'implicite (C1/C2)",
    duration: "40 min",
    level: "C1",
    cecrLevel: "C1",
    instruction: "Écoutez cet extrait d'un colloque universitaire sur l'écologie et identifiez la thèse sous-jacente.",
    objective: "Comprendre un long discours spécialisé, même si la structure est implicite, et saisir les nuances stylistiques, l'ironie et les références culturelles.",
    text: `### Développement Pédagogique Intégral

Au niveau Supérieur (C1/C2 - NCLC 9 et 10), les documents sonores sont des extraits de conférences universitaires, de symposiums scientifiques ou d'analyses philosophiques. Le vocabulaire est soutenu et abstrait.

#### Maîtrise du Lexique Académique et Abstraction
1. **Nominalisation :** Au lieu de *« la terre se réchauffe vite »*, l'orateur dira *« l'accélération du réchauffement climatique »*.
2. **Verbes de haute précision :** *Exacerber* (aggraver), *Pallier* (remédier), *Corroborer* (confirmer), *Infirmer* (contredire), *Sous-tendre* (servir de base invisible).
3. **L'implicite :** Comprendre ce qui n'est pas dit directement, en interprétant l'ironie ou le scepticisme de l'intervenant face aux solutions de facilité.`,
    examples: [
      "Phrase C1 : « L'anthropisation galopante des écosystèmes compromet l'équilibre de la biosphère. »",
      "Nominalisation : « La raréfaction des ressources halieutiques exige une régulation draconienne. »"
    ],
    audioText: "L'effondrement de la biodiversité n'est plus une simple hypothèse de travail mais une réalité tangible et mesurable. La fragmentation des habitats naturels, exacerbée par une urbanisation non maîtrisée, engendre un déclin systémique des espèces. Si nous ne révisons pas radicalement notre paradigme d'exploitation des ressources, c'est la résilience même de nos écosystèmes qui sera irrémédiablement compromise.",
    intro: "Conférences scientifiques",
    tips: ["Ne vous arrêtez jamais sur un mot inconnu en C1/C2 : déduisez son sens général grâce à la racine du mot et au contexte global de la phrase."],
    exercises: [
      {
        question: "Que signifie le verbe « Exacerber » dans un contexte scientifique ?",
        options: ["Rendre plus doux et supportable", "Aggraver, rendre plus intense ou plus vif", "Supprimer définitivement", "Calculer avec précision"],
        answer: 1,
        explanation: "Exacerber signifie augmenter la gravité ou la violence d'un phénomène (synonymes : aggraver, intensifier)."
      }
    ],
    quiz: [
      {
        q: "Selon le conférencier, qu'est-ce qui provoque directement le déclin systémique des espèces ?",
        options: ["Le tourisme international", "La fragmentation des habitats naturels causée par l'urbanisation", "Le manque de subventions gouvernementales", "L'énergie solaire"],
        answer: 1,
        explanation: "Il affirme : « La fragmentation des habitats naturels, exacerbée par une urbanisation non maîtrisée, engendre un déclin systémique »."
      }
    ],
    summary: "Résumé : Le niveau C1/C2 couronne votre maîtrise du français. Votre oreille doit être habituée au lexique abstrait et aux phrases complexes à multiples clauses secondaires.",
    questions: [
      {
        q: "Selon le conférencier, qu'est-ce qui provoque directement le déclin systémique des espèces ?",
        options: ["Le tourisme international", "La fragmentation des habitats naturels causée par l'urbanisation", "Le manque de subventions gouvernementales", "L'énergie solaire"],
        answer: 1,
        explanation: "Il affirme : « La fragmentation des habitats naturels, exacerbée par une urbanisation non maîtrisée, engendre un déclin systémique »."
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPRÉHENSION ÉCRITE (CE)
// ─────────────────────────────────────────────────────────────────────────────
export const readingCourses: CourseLesson[] = [
  {
    id: 1,
    moduleId: 1,
    title: "Lire et comprendre un message court du quotidien (A1)",
    duration: "20 min",
    level: "A1",
    cecrLevel: "A1",
    instruction: "Lisez attentivement le message électronique et identifiez les faits concrets (qui, quand, où).",
    objective: "Comprendre des textes très courts et simples (emails amicaux, invitations, notes, affiches publicitaires) pour prélever des informations pratiques.",
    text: `### Développement Pédagogique Intégral

En Compréhension Écrite de niveau A1, les documents représentent des correspondances personnelles simples ou des affiches. La méthode officielle consiste à repérer immédiatement les 4 questions fondamentales : **Qui ?**, **Quoi ?**, **Où ?**, **Quand ?**.

#### Éléments Clés à Identifier
1. **L'expéditeur et le destinataire :** Qui écrit le message et à qui s'adresse-t-il ?
2. **L'événement ou l'objet :** S'agit-il d'un anniversaire, d'une réunion, d'un dîner ou d'une sortie au cinéma ?
3. **La date et l'heure :** Repérez les jours de la semaine et les formats horaires.
4. **L'action demandée :** *Réponds-moi*, *Apporte quelque chose*, *Confirme ta présence*.

---
**Document de lecture officielle :**
Salut Paul,

Je t'invite à mon anniversaire samedi prochain à 20h00 chez moi à Montréal. Nous allons commander des pizzas et manger un grand gâteau au chocolat. N'oublie pas d'apporter ta guitare pour la musique !

Confirme-moi ta présence par SMS demain.
À samedi,
Luc`,
    examples: [
      "Email type : « Salut Marc, je t'invite au restaurant samedi à 19h30 pour fêter mon diplôme. N'oublie pas de confirmer avant jeudi ! »",
      "Analyse : Événement = Restaurant / Diplôme ; Date = Samedi 19h30 ; Action = Confirmer avant jeudi."
    ],
    intro: "Lecture quotidienne A1",
    tips: ["Ne lisez pas ligne par ligne : scannez d'abord le document pour repérer les chiffres, les dates et les prénoms."],
    exercises: [
      {
        question: "Dans un email en français, que signifie l'abréviation « SMS » ?",
        options: ["Un message texte sur téléphone portable", "Un service de messagerie postale", "Une lettre officielle", "Un appel vidéo"],
        answer: 0,
        explanation: "Un SMS (Short Message Service) désigne un message texte envoyé via un téléphone mobile."
      }
    ],
    quiz: [
      {
        q: "Quel instrument de musique Paul doit-il apporter à la fête ?",
        options: ["Un piano", "Une guitare", "Un violon", "Une flûte"],
        answer: 1,
        explanation: "Luc écrit explicitement : « N'oublie pas d'apporter ta guitare pour la musique ! »."
      },
      {
        q: "Quel jour l'anniversaire est-il organisé ?",
        options: ["Vendredi", "Samedi prochain", "Dimanche", "Mercredi"],
        answer: 1,
        explanation: "Le message indique : « samedi prochain à 20h00 »."
      }
    ],
    summary: "Résumé : Pour réussir les items A1 en lecture, concentrez-vous sur les détails factuels et pratiques sans vous laisser déconcentrer par des adjectifs secondaires.",
    questions: [
      {
        q: "Quel instrument de musique Paul doit-il apporter à la fête ?",
        options: ["Un piano", "Une guitare", "Un violon", "Une flûte"],
        answer: 1,
        explanation: "Luc écrit explicitement : « N'oublie pas d'apporter ta guitare pour la musique ! »."
      }
    ]
  },
  {
    id: 2,
    moduleId: 3,
    title: "Comprendre une annonce professionnelle et une offre d'emploi (A2/B1)",
    duration: "25 min",
    level: "B1",
    cecrLevel: "B1",
    instruction: "Lisez cette offre d'emploi publiée sur un portail canadien et identifiez les prérequis et conditions.",
    objective: "Analyser un document professionnel standard (offre d'emploi, note de service, règlement intérieur) et en extraire les conditions de candidature ou d'exécution.",
    text: `### Développement Pédagogique Intégral

Le niveau B1 en compréhension écrite vous confronte au monde du travail et de l'administration au Canada. Vous devez être capable d'interpréter un cahier des charges professionnel ou une offre d'emploi.

#### Lexique Professionnel et Administratif Canadien
1. **Les types de contrats :** *CDI* (Contrat à Durée Indéterminée), *CDD* (Contrat à Durée Déterminée), *Temps plein*, *Temps partiel*, *Télétravail hybride*.
2. **Les prérequis / qualifications :** *Diplôme universitaire requis*, *Expérience exigée (3 ans minimum)*, *Maîtrise bilingue français-anglais*.
3. **La procédure de postulation :** *Soumettre un curriculum vitae (CV)*, *Joindre une lettre de présentation*, *Date limite de candidature*.

---
**Document de lecture officielle :**
L'entreprise canadienne TechSoft Montréal recherche un développeur web junior pour rejoindre son équipe dynamique. 
**Profil recherché :** Diplôme universitaire en informatique ou équivalent, maîtrise confirmée de JavaScript et de React, esprit d'équipe.
**Conditions de travail :** Poste à temps plein (37,5 heures par semaine), mode hybride (2 jours en présentiel au bureau de Montréal, 3 jours en télétravail). Salaire compétitif selon expérience et assurance collective.
Veuillez envoyer votre CV et votre lettre de présentation avant le 30 mai sur notre portail en ligne.`,
    examples: [
      "Extrait d'offre : « TechSoft Montréal recherche un analyste données (H/F). Prérequis : Baccalauréat universitaire en statistiques et 2 ans d'expérience. »",
      "Condition : « Poste à temps plein (37,5h/semaine) avec assurance santé complète après 3 mois. »"
    ],
    intro: "Lecture professionnelle B1",
    tips: ["Au Canada, le terme « lettre de présentation » équivaut au terme « lettre de motivation » utilisé en Europe."],
    exercises: [
      {
        question: "Que signifie l'expression « mode hybride » dans le contexte du travail ?",
        options: ["Travailler uniquement la nuit", "Alterner entre travail au bureau (présentiel) et travail à domicile (télétravail)", "Travailler pour deux entreprises différentes", "Avoir un contrat temporaire"],
        answer: 1,
        explanation: "Le mode hybride combine des jours de travail sur site (présentiel) et des jours à distance (télétravail)."
      }
    ],
    quiz: [
      {
        q: "Quelle est la date limite pour soumettre sa candidature ?",
        options: ["Le 15 mai", "Le 30 mai", "Le 1er juin", "Le 30 avril"],
        answer: 1,
        explanation: "L'offre mentionne clairement : « avant le 30 mai sur notre portail en ligne »."
      }
    ],
    summary: "Résumé : Le vocabulaire professionnel bilingue et les spécificités du marché canadien (heures hebdomadaires, lettre de présentation) sont incontournables pour valider le palier B1 en lecture.",
    questions: [
      {
        q: "Quelle est la date limite pour soumettre sa candidature ?",
        options: ["Le 15 mai", "Le 30 mai", "Le 1er juin", "Le 30 avril"],
        answer: 1,
        explanation: "L'offre mentionne clairement : « avant le 30 mai sur notre portail en ligne »."
      }
    ]
  },
  {
    id: 3,
    moduleId: 8,
    title: "Analyser un article d'actualité et d'opinion (B2)",
    duration: "30 min",
    level: "B2",
    cecrLevel: "B2",
    instruction: "Lisez cet article de presse analytique et identifiez la position de l'auteur face au débat des mobilités urbaines.",
    objective: "Comprendre des articles de fond et des rapports sur des questions contemporaines dans lesquels les auteurs adoptent une position ou un point de vue particulier.",
    text: `### Développement Pédagogique Intégral

Au niveau B2 en Compréhension Écrite, les textes sont plus longs et argumentés. Les questions QCM ne portent plus seulement sur ce qui est écrit noir sur blanc, mais sur **la thèse de l'auteur**, la fonction d'un paragraphe ou la relation de cause à effet.

#### Analyser l'Argumentation Écrite
1. **Repérer la thèse (l'idée directrice) :** Elle se trouve généralement dans l'introduction (problématique) ou dans la conclusion (synthèse de l'auteur).
2. **Distinguer un fait d'une opinion :** Un fait est vérifiable par des statistiques (*« 60% des usagers prennent le bus »*), une opinion exprime un jugement de valeur (*« cette politique est jugée inefficace et coûteuse par les experts »*).
3. **Les connecteurs d'opposition et de concession :** *Cependant*, *Néanmoins*, *En dépit de*, *Bien que*. Ils annoncent un changement de perspective qu'il faut repérer pour ne pas se tromper au QCM.

---
**Document de lecture officielle :**
Face à l'engorgement chronique des métropoles canadiennes et aux impératifs de la transition climatique, de nombreuses municipalités repensent radicalement leur politique de mobilité urbaine. Les trottinettes électriques et vélos en libre-service ont désormais conquis le centre-ville grâce à un encadrement réglementaire plus strict. Néanmoins, de nombreux urbanistes et économistes des transports plaident pour un investissement prioritaire et massif dans les infrastructures de transports en commun lourds (métros, tramways, trains de banlieue). Selon eux, les micro-mobilités, bien que séduisantes pour de courts trajets en hypercentre, demeurent totalement insuffisantes pour répondre aux véritables enjeux d'enclavement des populations résidant en grande banlieue.`,
    examples: [
      "Structure type : Paragraphe 1 = Constat du problème ; Paragraphe 2 = Solutions proposées ; Paragraphe 3 = Critiques et limites (thèse de l'auteur).",
      "Nuance : « Les autorités municipales se félicitent du succès des pistes cyclables, néanmoins les commerçants locaux déplorent une chute de leur chiffre d'affaires. »"
    ],
    intro: "Presse et débats B2",
    tips: ["Lorsque la question demande « Quelle est l'opinion des urbanistes ? », cherchez exactement la phrase attribuée aux urbanistes et non celle des autorités municipales."],
    exercises: [
      {
        question: "Quel rôle jouent les mots « Néanmoins » et « Selon eux » dans ce paragraphe ?",
        options: ["Ils introduisent une répétition de la même idée", "Ils marquent une transition vers une perspective critique et attribuent l'argument aux urbanistes", "Ils concluent le texte par une statistique", "Ils annoncent une suppression des transports en commun"],
        answer: 1,
        explanation: "« Néanmoins » marque l'opposition par rapport au succès des vélos/trottinettes, et « Selon eux » attribue la critique directement aux urbanistes et économistes mentionnés à la phrase précédente."
      }
    ],
    quiz: [
      {
        q: "Pourquoi les urbanistes considèrent-ils les micro-mobilités comme insuffisantes ?",
        options: ["Parce qu'elles causent trop d'accidents au centre-ville", "Parce qu'elles ne permettent pas de résoudre les problèmes de transport des habitants de la grande banlieue", "Parce qu'elles coûtent plus cher que le métro", "Parce qu'elles sont interdites par la loi canadienne"],
        answer: 1,
        explanation: "Le texte précise que les micro-mobilités « demeurent totalement insuffisantes pour répondre aux véritables enjeux d'enclavement des populations résidant en grande banlieue »."
      }
    ],
    summary: "Résumé : Le niveau B2 demande une lecture analytique. Ne vous laissez pas séduire par une option qui contient les mêmes mots que le texte mais dont le sens global est contradictoire !",
    questions: [
      {
        q: "Pourquoi les urbanistes considèrent-ils les micro-mobilités comme insuffisantes ?",
        options: ["Parce qu'elles causent trop d'accidents au centre-ville", "Parce qu'elles ne permettent pas de résoudre les problèmes de transport des habitants de la grande banlieue", "Parce qu'elles coûtent plus cher que le métro", "Parce qu'elles sont interdites par la loi canadienne"],
        answer: 1,
        explanation: "Le texte précise que les micro-mobilités « demeurent totalement insuffisantes pour répondre aux véritables enjeux d'enclavement des populations résidant en grande banlieue »."
      }
    ]
  },
  {
    id: 4,
    moduleId: 12,
    title: "Comprendre un essai littéraire ou un article scientifique complexe (C1/C2)",
    duration: "40 min",
    level: "C1",
    cecrLevel: "C1",
    instruction: "Lisez cet extrait d'analyse sociologique et littéraire sur l'évolution de la langue française dans l'espace numérique.",
    objective: "Comprendre dans le détail des textes factuels, scientifiques ou littéraires longs et complexes, en appréciant les distinctions de style et l'implicite argumentatif.",
    text: `### Développement Pédagogique Intégral

Les niveaux C1 et C2 en lecture correspondent à la maîtrise des textes académiques, philosophiques, juridiques et littéraires. La densité lexicale est maximale et les phrases comportent de multiples propositions subordonnées.

#### Stratégies de Lecture pour les Textes de Haut Niveau
1. **Démêler la syntaxe complexe :** Repérez le sujet principal, le verbe conjugué et le complément d'objet en éliminant mentalement les propositions incises entre virgules ou tirets.
2. **Le vocabulaire abstrait et littéraire :** Maîtrisez les termes de l'analyse critique : *Paradoxe*, *Dichotomie*, *Obsolescence*, *Hégémonie*, *Corollaire*, *Pernicieux*.
3. **L'ironie et l'antiphrase :** L'auteur peut faire semblant de faire l'éloge d'une pratique pour mieux en dénoncer la vacuité (ex: *« Cette merveilleuse technologie qui nous dispense désormais de réfléchir... »*).

---
**Document de lecture officielle :**
L'avènement de l'écosystème numérique et la prépondérance des communications instantanées ont régulièrement nourri chez les grammairiens les plus traditionalistes la crainte d'une déliquescence inéluctable du patrimoine linguistique francophone. Or, une analyse sociolinguistique rigoureuse des usages en ligne révèle un phénomène bien plus complexe qu'une simple érosion syntaxique. Loin d'entériner une uniformisation appauvrissante, le réseau des réseaux catalyse une extraordinaire polymorphie stylistique. Les usagers y déploient une compétence diglossique remarquable, jonglant avec une agilité déconcertante entre l'acronyme concis de la messagerie instantanée, la joute verbale ciselée sur les forums de débat et la prose académique des plateformes de publication de recherche. Ainsi, le numérique ne signe pas le glas de la rigueur linguistique, mais exige au contraire une flexibilité pragmatique accrue du locuteur contemporain.`,
    examples: [
      "Phrase complexe : « La révolution numérique, loin de consacrer l'appauvrissement inéluctable de la syntaxe que prophétisaient les puristes, engendre en réalité une polymorphie stylistique sans précédent. »",
      "Analyse : Sujet = La révolution numérique ; Verbe = engendre ; Sens = Le numérique n'appauvrit pas la langue, il crée une variété de styles (polymorphie)."
    ],
    intro: "Littérature et sciences C1",
    tips: ["Face à un mot complexe comme « diglossique » ou « polymorphie », lisez la phrase suivante qui en donne souvent une illustration ou une explication pratique (jongler entre différents styles)."],
    exercises: [
      {
        question: "Que signifie le substantif « Déliquescence » dans le contexte de la langue ?",
        options: ["Un enrichissement rapide et moderne", "Une dégradation, un affaiblissement ou une perte de qualité et de vitalité", "Une règle de grammaire obligatoire", "Une traduction en langue étrangère"],
        answer: 1,
        explanation: "La déliquescence désigne un état de décadence, de décomposition ou de perte complète de force et de cohésion (synonyme d'érosion ou de déclin)."
      }
    ],
    quiz: [
      {
        q: "Quelle est la thèse principale défendue par l'auteur dans cet extrait ?",
        options: ["Le numérique détruit inévitablement la beauté de la langue française et appauvrit le vocabulaire des jeunes", "Les grammairiens traditionalistes ont parfaitement raison de vouloir interdire les communications instantanées", "Le numérique ne détruit pas la langue mais favorise une variété de styles et oblige les usagers à adapter leur façon d'écrire selon le contexte", "Seule la prose académique devrait être autorisée sur les plateformes de publication en ligne"],
        answer: 2,
        explanation: "L'auteur affirme que « le réseau catalyse une extraordinaire polymorphie stylistique » et que « le numérique ne signe pas le glas de la rigueur linguistique, mais exige au contraire une flexibilité pragmatique accrue »."
      }
    ],
    summary: "Résumé : Le niveau C1/C2 couronne votre capacité à lire entre les lignes et à appréhender des raisonnements sociologiques ou littéraires pointus. La clé est d'identifier la prise de distance de l'auteur face aux idées reçues.",
    questions: [
      {
        q: "Quelle est la thèse principale défendue par l'auteur dans cet extrait ?",
        options: ["Le numérique détruit inévitablement la beauté de la langue française et appauvrit le vocabulaire des jeunes", "Les grammairiens traditionalistes ont parfaitement raison de vouloir interdire les communications instantanées", "Le numérique ne détruit pas la langue mais favorise une variété de styles et oblige les usagers à adapter leur façon d'écrire selon le contexte", "Seule la prose académique devrait être autorisée sur les plateformes de publication en ligne"],
        answer: 2,
        explanation: "L'auteur affirme que « le réseau catalyse une extraordinaire polymorphie stylistique » et que « le numérique ne signe pas le glas de la rigueur linguistique, mais exige au contraire une flexibilité pragmatique accrue »."
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION ÉCRITE (PE)
// ─────────────────────────────────────────────────────────────────────────────
export const writingCourses: CourseLesson[] = [
  {
    id: 1,
    moduleId: 3,
    title: "Méthodologie Experte - Tâche 1 : Rédiger un message pratique (A2/B1)",
    duration: "25 min",
    level: "A2",
    cecrLevel: "A2",
    instruction: "Maîtrisez les règles strictes de la Tâche 1 du TCF Canada : format, quotas de mots et salutations.",
    objective: "Rédiger un message électronique ou une note courte (entre 60 et 120 mots au total) pour raconter un fait, saluer, inviter ou remercier en respectant le registre adéquat.",
    text: `### Développement Pédagogique Intégral

La Tâche 1 est l'épreuve d'entrée de la Production Écrite. Elle est notée selon votre respect absolu de la consigne et du nombre de mots (60 à 120 mots, salutations comprises).

#### Structure Incontournable de la Tâche 1
1. **Formule d'appel (Salutation initiale) :** *Salut Marc,* (familier) ou *Cher Monsieur,* (formel). N'oubliez pas la virgule et le retour à la ligne !
2. **Phrase d'accroche / Contexte :** *J'espère que tu vas bien. Je t'écris pour...*
3. **Le corps du message (Les 2 ou 3 points de la consigne) :** Répondez précisément à chaque point demandé (ex: raconter, décrire, proposer).
4. **Formule de prise de congé et signature :** *À très vite,* ou *Bien cordialement,* suivi de votre prénom sur une nouvelle ligne.`,
    examples: [
      "Comptage des mots : Au TCF Canada, « c'est-à-dire » = 4 mots ; « j'ai » = 2 mots ; « au » = 1 mot ; « 2026 » = 1 mot.",
      "Modèle parfait (84 mots) : Respecte la limite, utilise le passé composé pour raconter et le futur/présent pour inviter."
    ],
    intro: "Tâche 1 - Communication pratique",
    promptText: "Vous avez récemment déménagé dans un nouveau quartier à Montréal. Vous écrivez un courriel à un ami francophone pour lui décrire votre nouvel appartement, lui parler du quartier et l'inviter à venir passer le week-end prochain chez vous. (60 à 120 mots)",
    modelAnswer: `Salut Thomas,

J'espère que tu vas bien et que tu passes une excellente semaine. Je t'écris avec une grande nouvelle : j'ai enfin emménagé dans mon nouvel appartement à Montréal ! 

Il est vraiment spacieux, très lumineux et situé en plein cœur du quartier du Plateau. Il y a de nombreux parcs, des cafés sympas et la station de métro est à deux minutes à pied de chez moi. 

Je serais ravi de te montrer tout ça. Serais-tu libre pour venir passer le week-end prochain à la maison ? Nous pourrions visiter le quartier et dîner ensemble.

Tiens-moi vite au courant !
À très bientôt,
Julien`,
    minWords: 60,
    maxWords: 120,
    tips: [
      "Comptez vos mots et écrivez le nombre en bas de votre copie si vous passez sur papier.",
      "Ne faites jamais de hors-sujet : si la consigne demande 3 choses (décrire appart, parler quartier, inviter), vous DEVEZ traiter les 3 !."
    ],
    exercises: [
      {
        question: "Selon les règles officielles de comptage des mots du TCF Canada, combien de mots compte la phrase : « l'arbre est très beau » ?",
        options: ["4 mots", "5 mots (l' + arbre + est + très + beau)", "3 mots", "6 mots"],
        answer: 1,
        explanation: "Toute suite de caractères séparée par un espace ou une apostrophe compte pour 1 mot. « l' » = 1 mot, « arbre » = 1 mot, « est » = 1 mot, « très » = 1 mot, « beau » = 1 mot -> Total : 5 mots."
      }
    ],
    quiz: [
      {
        q: "Que se passe-t-il si votre texte pour la Tâche 1 compte seulement 45 mots ou dépasse 135 mots ?",
        options: ["Vous perdez 1 point sur le total", "Votre copie est lourdement pénalisée par les correcteurs officiels pour non-respect de la consigne de longueur", "Rien du tout si l'orthographe est parfaite", "Vous devez recommencer l'examen le lendemain"],
        answer: 1,
        explanation: "Le non-respect de la fourchette de mots (60-120 mots) entraîne une pénalisation sévère immédiate sur la note de respect de la consigne."
      }
    ],
    summary: "Résumé : La Tâche 1 est un exercice de rigueur formelle. Respectez le format lettre/email, traitez tous les points de la consigne et surveillez scrupuleusement votre compteur de mots."
  },
  {
    id: 2,
    moduleId: 6,
    title: "Méthodologie Experte - Tâche 2 : Rédiger un compte rendu d'expérience (B1/B2)",
    duration: "30 min",
    level: "B1",
    cecrLevel: "B1",
    instruction: "Apprenez à rédiger un article de blog, un témoignage ou un compte rendu (120 à 150 mots) en combinant narration au passé et expression de sentiments.",
    objective: "Raconter une expérience personnelle, professionnelle ou associative passée, décrire des événements et exprimer ses réactions, opinions ou émotions de manière argumentée et cohérente.",
    text: `### Développement Pédagogique Intégral

La Tâche 2 de Production Écrite exige une longueur comprise entre 120 et 150 mots. Elle vous demande d'écrire un article, un témoignage ou un rapport pour raconter un événement vécu et partager votre point de vue.

#### Les Secrets d'une Tâche 2 Réussie (Niveau B2 certifié)
1. **L'alternance des temps du passé :** Utilisez l'**Imparfait** pour le décor, l'atmosphère, les habitudes et les descriptions (*« Le soleil brillait, la salle était bondée »*), et utilisez le **Passé Composé** pour les actions ponctuelles de l'événement (*« Soudain, le conférencier a pris la parole et a captivé le public »*).
2. **L'expression des sentiments et réactions :** *J'ai été agréablement surpris par...*, *Ce qui m'a le plus marqué, c'est...*, *J'ai ressenti une immense fierté lorsque...*.
3. **Les articulateurs de chronologie :** *Dès le matin*, *Dans un premier temps*, *Ensuite*, *Par la suite*, *Finalement*, *En somme*.`,
    examples: [
      "Introduction de blog : « Le mois dernier, j'ai eu l'opportunité exceptionnelle de participer à un sommet sur l'écologie urbaine à Vancouver. Je vous raconte tout ! »",
      "Conclusion expressive : « Cette expérience enrichissante a renforcé ma détermination à m'engager dans des actions durables au quotidien. »"
    ],
    intro: "Tâche 2 - Récit et témoignage",
    promptText: "Vous avez récemment participé à un atelier de formation professionnelle (informatique, communication, management, artisanat) dans votre ville. Vous écrivez un article sur votre blog pour raconter le déroulement de cette formation, décrire ce que vous y avez appris et expliquer pourquoi vous la recommandez à vos lecteurs. (120 à 150 mots)",
    modelAnswer: `Une formation enrichissante pour rebooster sa carrière !

Le mois dernier, j'ai eu l'opportunité de participer à un séminaire intensif de trois jours consacré à la gestion de projet Agile et à la communication d'équipe, organisé au centre de formation de Montréal.

Dès le premier jour, l'ambiance était extrêmement dynamique. Au lieu de suivre des cours magistraux ennuyeux, nous avons pris part à des ateliers pratiques et à des simulations en petits groupes. Ce qui m'a le plus marqué, c'est la bienveillance des formateurs et la richesse des échanges avec les autres professionnels présents. Grâce à ces exercices concrets, j'ai appris à optimiser la planification de mes tâches et à mieux gérer le stress en situation d'urgence.

Je recommande vivement cette formation à tous ceux qui souhaitent moderniser leurs méthodes de travail et développer leur leadership en entreprise. C'est un investissement personnel véritablement transformateur !`,
    minWords: 120,
    maxWords: 150,
    tips: [
      "Pour un article de blog, ajoutez toujours un titre accrocheur au début de votre texte !",
      "Soignez la transition entre la narration de l'événement (au passé) et votre recommandation finale (au présent)."
    ],
    exercises: [
      {
        question: "Dans un récit au passé en français, quelle est la règle de distinction entre l'imparfait et le passé composé ?",
        options: ["L'imparfait s'utilise pour le futur, le passé composé pour le présent", "L'imparfait s'utilise pour décrire le décor, l'état ou l'habitude, tandis que le passé composé s'utilise pour les actions soudaines et ponctuelles", "Le passé composé est interdit au TCF Canada", "Les deux temps sont strictement identiques et interchangeables"],
        answer: 1,
        explanation: "L'imparfait pose le cadre descriptif (« il faisait beau », « j'étais stressé »), alors que le passé composé fait avancer l'action (« je suis arrivé », « nous avons commencé l'exercice »)."
      }
    ],
    quiz: [
      {
        q: "Combien de paragraphes est-il recommandé de rédiger pour structurer parfaitement la Tâche 2 (120 à 150 mots) ?",
        options: ["1 seul paragraphe compact sans aucun retour à la ligne", "3 paragraphes clairs : Introduction/Accroche, Corps du récit (déroulement + apprentissages), et Conclusion/Recommandation", "10 paragraphes d'une seule phrase", "Peu importe la structure tant que les mots sont alignés"],
        answer: 1,
        explanation: "Une structure en 3 paragraphes aérés démontre aux correcteurs officiels votre maîtrise de la cohésion textuelle (critère noté sur 4 points dans la grille FLE)."
      }
    ],
    summary: "Résumé : La Tâche 2 évalue votre talent de conteur et votre grammaire du passé. Donnez vie à votre récit avec des adjectifs expressifs et respectez la fourchette de 120 à 150 mots."
  },
  {
    id: 3,
    moduleId: 11,
    title: "Méthodologie Suprême - Tâche 3 : Synthèse documentaire et essai comparatif (B2/C1/C2)",
    duration: "45 min",
    level: "C1",
    cecrLevel: "C1",
    instruction: "Maîtrisez l'épreuve reine du TCF Canada : rédiger un texte argumentatif composé en deux parties intégrées (120 à 180 mots).",
    objective: "Comparer deux documents de points de vue différents ou opposés, synthétiser leurs arguments essentiels sans recopier de phrases, puis prendre position de manière argumentée et nuancée sur la problématique commune.",
    text: `### Développement Pédagogique Intégral

La Tâche 3 est l'épreuve la plus sélective du TCF Canada (coefficient de pondération majeur pour atteindre NCLC 9 ou 10 / Niveau C1-C2). Vous devez rédiger un texte global compris entre **120 et 180 mots**.

#### La Double Mission de la Tâche 3
1. **Première partie - La Synthèse comparative (environ 60-80 mots) :** Vous devez résumer et comparer les idées des 2 documents fournis sans donner votre avis à ce stade. *Attention : le copier-coller (paraphrase littérale de plus de 3 mots consécutifs du texte source) est sévèrement sanctionné par un 0 sur cette partie !* Vous devez **reformuler** en utilisant des synonymes et la nominalisation.
2. **Seconde partie - La Prise de position argumentée (environ 70-100 mots) :** Vous répondez à la question posée en donnant votre propre opinion, soutenue par un argument solide et un exemple concret.

#### Formules de Transition et de Confrontation
- *Pour comparer les documents :* « Les deux documents abordent la problématique de... », « Alors que l'auteur du premier texte souligne les bénéfices de..., le second document met en garde contre les dérives de... », « Si le premier point de vue défend l'idée que..., le second rétorque que... ».
- *Pour introduire sa prise de position :* « À mon sens, ... », « Il me semble indéniable que... », « Bien que je comprenne les réserves du second auteur, je partage pleinement la position de... car... ».`,
    examples: [
      "Interdiction absolue : Si le Document 1 dit « le télétravail améliore la productivité des salariés », n'écrivez JAMAIS cette phrase ! Écrivez : « Le premier auteur affirme que le labeur à distance accroît l'efficacité professionnelle ».",
      "Plan type gagnant : Paragraphe 1 (Synthèse comparative neutre) -> Paragraphe 2 (Transition + Mon opinion argumentée + Exemple concluants)."
    ],
    intro: "Tâche 3 - Synthèse et argumentation",
    promptText: `Document 1 : « Le commerce en ligne représente une révolution économique positive. Il permet aux consommateurs de comparer instantanément les prix, d'accéder à un choix illimité de produits sans se déplacer et de faire des économies substantielles en temps et en argent. » (Extrait de Économie Moderne).

Document 2 : « L'omniprésence des plateformes d'achat sur internet menace directement la survie des petits commerces de proximité dans nos centres-villes. De plus, la multiplication des livraisons à domicile engendre une pollution urbaine alarmante et une déshumanisation des relations sociales. » (Extrait de La Gazette Citoyenne).

Consigne : Rédigez un texte de 120 à 180 mots. Dans une première partie, vous comparez les points de vue des deux documents. Dans une seconde partie, vous donnez votre propre opinion sur l'essor du commerce en ligne et son impact sur la société.`,
    modelAnswer: `Les deux documents débattent de l'essor fulgurant du commerce numérique et de ses répercussions sociétales. Alors que le premier auteur loue cette modernité commerciale pour la diversité des choix offerts et le gain de temps considérable qu'elle procure aux acheteurs, le second rédacteur dénonce vivement ses effets délétères, pointant du doigt le déclin des boutiques de quartier, la dégradation environnementale liée aux livraisons motorisées et l'isolement social croissant.

À mon sens, bien que les alertes écologiques et humaines du second document soient tout à fait légitimes, je considère que le commerce en ligne constitue un progrès irréversible et bénéfique s'il est judicieusement encadré. Plutôt que d'opposer le digital et le commerce local, de nombreuses municipalités canadiennes démontrent qu'un modèle hybride est possible. Par exemple, la création de plateformes de livraison locales permet aujourd'hui aux artisans de quartier d'élargir leur clientèle grâce à internet tout en préservant le lien social et l'économie de proximité.`,
    minWords: 120,
    maxWords: 180,
    tips: [
      "Vérifiez impérativement que votre texte final fait entre 120 et 180 mots. Au-delà de 180 mots ou en dessous de 120 mots, la pénalité est automatique.",
      "Ne citez jamais le numéro de ligne ou le nom de l'auteur entre parenthèses, intégrez la référence avec élégance : « l'auteur du premier extrait... »."
    ],
    exercises: [
      {
        question: "Qu'est-ce que le « plagiat / copier-coller » dans la Tâche 3 du TCF Canada et quelle est sa sanction ?",
        options: ["C'est le fait d'écrire au stylo bleu au lieu du stylo noir (sanction : aucune)", "C'est le fait de recopier des suites de mots identiques au texte source au lieu de reformuler avec ses propres mots (sanction : annulation des points de la partie synthèse)", "C'est le fait d'écrire un texte trop court (sanction : -5 points)", "C'est le fait d'utiliser des synonymes avancés (sanction : bonus de points)"],
        answer: 1,
        explanation: "La règle officielle TCF Canada stipule que tout prélèvement de phrases ou de segments littéraux des documents sources est considéré comme du plagiat et entraîne la note de 0/10 sur la compétence de synthèse documentaire."
      }
    ],
    quiz: [
      {
        q: "Comment doit être répartie la longueur de votre texte pour réussir la Tâche 3 sur 150 mots en moyenne ?",
        options: ["140 mots pour copier le Document 1 et 10 mots pour dire « je suis d'accord »", "Environ 70 mots pour la synthèse comparative reformulée des deux documents, et environ 80 mots pour votre propre prise de position argumentée et nuancée", "150 mots uniquement sur votre opinion personnelle en ignorant complètement les deux documents fournis", "Uniquement des bullet points sans faire de vraies phrases"],
        answer: 1,
        explanation: "La parité d'équilibre entre la synthèse comparative (neutre et reformulée) et l'expression de votre point de vue argumenté est le secret des copies notées NCLC 9 et 10."
      }
    ],
    summary: "Résumé : La Tâche 3 est le sommet de la préparation Griffon d'OR. Maîtrisez la reformulation de synthèse (sans plagiat !) et structurez une argumentation dialectique percutante dans le respect strict des 120 à 180 mots."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION ORALE (PO)
// ─────────────────────────────────────────────────────────────────────────────
export const speakingCourses: CourseLesson[] = [
  {
    id: 1,
    moduleId: 2,
    title: "Tâche 1 : L'entretien dirigé sans préparation (A1/A2)",
    duration: "15 min",
    level: "A2",
    cecrLevel: "A2",
    instruction: "Préparez la Tâche 1 de Production Orale (durée : 2 minutes sans préparation) : l'échange d'introduction avec l'examinateur.",
    objective: "Se présenter, parler de soi, de son parcours scolaire ou professionnel, de son entourage familial, de sa ville d'origine et de ses projets de vie au Canada en répondant spontanément aux questions de l'examinateur.",
    text: `### Développement Pédagogique Intégral

L'épreuve d'Expression Orale du TCF Canada commence toujours par la Tâche 1 (durée de 2 minutes exactement, sans aucun temps de préparation préalable). C'est le brise-glace officiel : l'examinateur vous invite à vous présenter et vous pose des questions familières.

#### Les Objectifs de Notation de l'Examinateur FLE
1. **La fluidité de base :** Ne donnez jamais de réponses monosyllabiques (Oui / Non / Paris). Vous devez faire des phrases complètes (Sujet + Verbe + Complément) et développer spontanément au moins 2 ou 3 phrases par réponse.
2. **La richesse temporelle :** Soyez capable de parler au présent (votre situation actuelle), au passé (vos études ou expériences passées) et au futur (votre projet d'immigration au Canada).
3. **Le naturel et la prononciation :** Souriez, regardez l'examinateur dans les yeux, parlez d'une voix claire sans réciter un texte appris par cœur comme un robot.`,
    examples: [
      "Mauvaise réponse (monosyllabique) : Examinateur : « Vous habitez où ? » -> Candidat : « À Lyon. » (0 point de développement).",
      "Bonne réponse A2/B1 : Examinateur : « Vous habitez où ? » -> Candidat : « J'habite actuellement à Lyon, une grande ville située dans le sud-est de la France, réputée pour sa gastronomie et son dynamisme économique. J'y réside avec ma famille depuis cinq ans. »"
    ],
    intro: "Tâche 1 - Présentation et échange",
    promptText: "Questions types de l'examinateur : « Bonjour. Veuillez vous présenter : parlez-moi de votre parcours, de votre profession actuelle, de vos loisirs préférés et expliquez-moi pour quelle raison vous souhaitez vous installer au Canada. »",
    modelAnswer: `[Exemple de prestation orale modèle notée A2/B1]

« Bonjour Monsieur/Madame l'examinateur. Je m'appelle Thomas, j'ai 31 ans et je suis de nationalité camerounaise. Je vis actuellement à Douala, où j'exerce la profession d'ingénieur en génie civil depuis maintenant six ans. 

Sur le plan de mes loisirs, je suis passionné par la lecture de romans historiques et la pratique du football le dimanche avec mes amis, ce qui me permet de garder un excellent équilibre de vie. 

Si je passe le TCF Canada aujourd'hui, c'est parce que j'ai le projet de m'installer définitivement dans la province de l'Ontario avec mon épouse et nos deux enfants. Nous sommes particulièrement attirés par la qualité du système éducatif canadien, la sécurité de vie et les formidables opportunités d'évolution professionnelle que le marché du travail canadien offre dans mon domaine de la construction. »`,
    tips: [
      "Ne récitez jamais un texte par cœur à toute vitesse : les examinateurs FLE détectent immédiatement les par-cœur et posent alors des questions imprévues pour tester votre vraie spontanéité.",
      "Si vous ne comprenez pas une question de l'examinateur, n'ayez pas peur de dire poliment : « Pourriez-vous reformuler votre question s'il vous plaît ? » : cela démontre une excellente autonomie de communication !"
    ],
    exercises: [
      {
        question: "Quelle est l'erreur à éviter absolument lors de la Tâche 1 de l'épreuve orale du TCF ?",
        options: ["Sourire en disant bonjour", "Répondre par des mots isolés ou des 'Oui/Non' sans faire de phrases complètes ni développer", "Regarder l'examinateur", "Parler de ses loisirs"],
        answer: 1,
        explanation: "L'examinateur a besoin d'échantillons de langue pour évaluer votre grammaire et votre prononciation. Répondre par des mots isolés vous empêche d'atteindre le niveau A2/B1."
      }
    ],
    quiz: [
      {
        q: "Quelle est la durée exacte de la Tâche 1 et combien de temps de préparation avez-vous avant de parler ?",
        options: ["10 minutes avec 5 minutes de préparation sur brouillon", "2 minutes d'échange direct, sans aucun temps de préparation préalable", "30 minutes de monologue", "1 minute en lisant un texte"],
        answer: 1,
        explanation: "La Tâche 1 est un échange spontané de 2 minutes chrono sans préparation : elle vise à évaluer votre aisance naturelle et votre capacité d'interaction immédiate."
      }
    ],
    summary: "Résumé : Réussir la Tâche 1 vous donne confiance pour la suite de l'épreuve. Soyez naturel, courtois, faites des phrases complètes et montrez votre enthousiasme pour votre projet canadien !"
  },
  {
    id: 2,
    moduleId: 6,
    title: "Méthodologie Experte - Tâche 2 : L'interaction en jeu de rôle (B1/B2)",
    duration: "30 min",
    level: "B1",
    cecrLevel: "B1",
    instruction: "Maîtrisez la Tâche 2 d'Expression Orale (durée : 3 minutes 30, avec 2 minutes de préparation sur brouillon).",
    objective: "Obtenir des informations, poser une variété de questions précises à l'examinateur (qui joue un rôle d'interlocuteur : vendeur, médecin, propriétaire, employé de mairie) et maintenir une conversation interactive fluide.",
    text: `### Développement Pédagogique Intégral

La Tâche 2 est un **jeu de rôle en interaction sociale**. Vous disposez de **2 minutes de préparation en silence** avec une feuille de brouillon et un crayon fournis par le centre d'examen, puis l'échange dure **3 minutes 30 secondes** chrono.

#### La Règle d'Or de la Tâche 2 : C'est VOUS qui menez l'entretien !
Contrairement à la Tâche 1 où vous répondez, en Tâche 2 **c'est vous qui devez poser des questions** à l'examinateur pour obtenir des informations sur une situation donnée (ex: vous cherchez à louer une voiture, vous vous inscrivez à un club de sport, vous organisez une fête).

#### Varier la Syntaxe de vos Questions (Le secret des points B2/C1)
Pour obtenir une note élevée (NCLC 8 et plus), vous ne devez pas poser uniquement des questions basiques avec *« Est-ce que »* ou une simple intonation. Vous devez démontrer votre variété syntaxique :
1. **Inversion du sujet (Style soutenu / formel) :** *« Pourriez-vous me préciser les tarifs de l'abonnement annuel ? »*, *« Disposeriez-vous d'une place de stationnement incluse dans le loyer ? »*, *« À quelle heure s'effectuera la remise des clés ? »*.
2. **Utilisation d'adverbes et pronoms interrogatifs variés :** *Comment*, *Combien*, *À quelle date*, *Pour quelle raison*, *Quels sont les prérequis*, *De quelle manière*.
3. **Formules de politesse adoucies au conditionnel :** *« J'aimerais savoir si... »*, *« Je serais intéressé par... »*, *« Serait-il possible de... »*.`,
    examples: [
      "Pendant vos 2 minutes de préparation sur brouillon : N'écrivez PAS des phrases entières ! Écrivez sous forme de liste de 8 à 10 mots-clés de thèmes à aborder : 1. Prix/Tarifs ? 2. Horaires/Dates ? 3. Conditions/Assurance ? 4. Matériel fourni ? 5. Annulation ? 6. Accès transport ? 7. Réduction étudiant ? 8. Inscription ?.",
      "Gestion du silence : Si l'examinateur donne une réponse courte, rebondissez immédiatement avec une sous-question : « Ah, très bien ! Et concernant l'assurance, est-elle incluse ou constitue-t-elle un supplément ? »."
    ],
    intro: "Tâche 2 - Jeu de rôle et questions",
    promptText: `Sujet officiel de jeu de rôle (Tâche 2) : 
« Vous êtes fraîchement arrivé(e) au Canada et vous souhaitez vous inscrire à une bibliothèque municipale de votre quartier à Montréal. L'examinateur joue le rôle du bibliothécaire. Vous lui posez des questions pour obtenir toutes les informations nécessaires à votre inscription : conditions, tarifs, horaires d'ouverture, nombre de livres empruntables et accès aux ressources numériques. (Durée : 3 min 30) »`,
    modelAnswer: `[Exemple de dialogue d'interaction modèle]

**Candidat(e) :** « Bonjour Monsieur/Madame ! Je viens d'emménager dans le quartier et je serais très intéressé(e) par une inscription à votre bibliothèque municipale. J'aimerais vous poser quelques questions à ce sujet si vous me le permettez. Tout d'abord, pourriez-vous me préciser quels sont les documents justificatifs requis pour créer une carte de lecteur ? »

**Examinateur (Bibliothécaire) :** « Bonjour ! Il nous faut une pièce d'identité et un justificatif de domicile de moins de trois mois. »

**Candidat(e) :** « D'accord, c'est parfaitement noté. Concernant les conditions financières, l'inscription est-elle gratuite pour les résidents du quartier ou existe-t-il une cotisation annuelle à régler ? »

**Examinateur :** « C'est entièrement gratuit pour les résidents de la municipalité ! »

**Candidat(e) :** « C'est une excellente nouvelle ! J'aimerais également savoir combien d'ouvrages il est possible d'emprunter simultanément et pour quelle durée maximale ? »

**Examinateur :** « Vous pouvez prendre jusqu'à 10 livres pour une durée de 3 semaines. »

**Candidat(e) :** « Parfait ! Par ailleurs, proposeriez-vous un accès en ligne à des ressources numériques, comme des livres audio, des magazines de presse internationale ou des plateformes d'apprentissage des langues ? »

**Examinateur :** « Oui, notre portail numérique donne accès à tout cela 24h/24 ! »

**Candidat(e) :** « C'est formidable ! Une dernière question concernant vos heures d'ouverture : à quelle heure fermez-vous en semaine et êtes-vous ouverts le week-end, notamment le dimanche après-midi ? »`,
    tips: [
      "Préparez TOUJOURS 8 à 10 questions sur votre brouillon pendant les 2 minutes ! Si vous n'avez que 3 questions en tête, vous allez vous retrouver en silence total après 1 minute, ce qui fait chuter la note.",
      "Soyez interactif : réagissez aux réponses de l'examinateur avec enthousiasme (Ah parfait !, D'accord je comprends, C'est très clair !) avant d'enchaîner sur votre question suivante."
    ],
    exercises: [
      {
        question: "Dans la Tâche 2 de l'épreuve orale, qui est censé poser des questions à l'autre personne ?",
        options: ["L'examinateur pose des questions et le candidat répond uniquement", "Le candidat (vous) doit poser un maximum de questions précises et variées à l'examinateur pour obtenir des informations", "Personne ne pose de questions, c'est un monologue de lecture", "Les deux personnes parlent en même temps sans s'écouter"],
        answer: 1,
        explanation: "La Tâche 2 est conçue pour évaluer votre capacité à vous informer en français en situation sociale. Vous devez mener la danse en posant 8 à 10 questions pendant les 3 min 30."
      }
    ],
    quiz: [
      {
        q: "Comment s'appelle la forme de question considérée comme la plus prestigieuse et formelle en grammaire française (recommandée pour obtenir le niveau NCLC 8+) ?",
        options: ["La question avec une simple intonation en fin de phrase (Tu viens demain ?)", "La question familière avec 'Est-ce que' (Est-ce que vous avez des livres ?)", "L'inversion du sujet avec verbe au conditionnel ou à l'indicatif (Pourriez-vous m'indiquer les horaires ? / Disposeriez-vous d'une brochure ?)", "La question posée en argot"],
        answer: 2,
        explanation: "L'inversion du sujet alliée au mode conditionnel de politesse témoigne d'une maîtrise syntaxique et sociolinguistique de niveau B2/C1 experte."
      }
    ],
    summary: "Résumé : La Tâche 2 est un jeu de rôle ludique. Utilisez vos 2 minutes de préparation pour lister 8 à 10 thèmes d'interrogation, variez vos structures grammaticales et maintenez un échange courtois et dynamique !"
  },
  {
    id: 3,
    moduleId: 15,
    title: "Méthodologie Suprême - Tâche 3 : Le monologue argumenté sans préparation (B2/C1/C2)",
    duration: "45 min",
    level: "C1",
    cecrLevel: "C1",
    instruction: "Maîtrisez l'épreuve de vérité du TCF Canada : développer un point de vue argumenté et structuré pendant 4 minutes 30 secondes chrono sans aucun temps de préparation.",
    objective: "Exprimer un point de vue complexe, argumenté, nuancé et structuré sur une question générale ou un thème de société (écologie, éducation, technologie, travail, culture) de manière fluide, spontanée et continue.",
    text: `### Développement Pédagogique Intégral

La Tâche 3 est le test ultime de votre maîtrise du français parlé (coefficient déterminant pour décrocher le niveau C1/C2 / NCLC 9-10). Vous devez parler de manière continue pendant **4 minutes 30 secondes**, sans aucun temps de préparation sur brouillon ! L'examinateur vous lit une question de société, vous pouvez lui demander de la relire une fois, puis vous démarrez immédiatement votre argumentation.

#### Le Plan de Discours Mental en 3 Temps (La méthode des experts FLE)
Pour parler 4 minutes 30 sans hésitation ni silence embarrassant, vous devez adopter instantanément une structure mentale dialectique claire :
1. **L'Introduction (environ 45 secondes) :** Reformulez la problématique avec vos propres mots et annoncez clairement votre plan de discours (*« La question de l'impact de l'intelligence artificielle sur le marché de l'emploi suscite un vif débat au sein de notre société contemporaine. Pour répondre à cette problématique, j'analyserai dans un premier temps les opportunités d'innovation qu'elle offre, avant d'examiner dans un second temps les défis de reconversion qu'elle impose aux travailleurs. »*).
2. **Le Corps Argumentatif en 2 Parties (environ 2 min 45) :**
   - *Partie 1 (Thèse / 1er argument + 1 exemple concret) :* Développez votre première idée en l'illustrant par un exemple tiré de l'actualité canadienne ou internationale.
   - *Partie 2 (Nuance / Concession / 2ème argument) :* Utilisez un connecteur d'opposition (*« Cependant... », « En revanche... », « Il n'en demeure pas moins que... »*) et développez un second point de vue ou une condition d'encadrement.
3. **La Conclusion et Ouverture (environ 1 minute) :** Synthétisez votre prise de position finale de manière claire et ferme, puis proposez une ouverture ou une recommandation pour l'avenir.

#### Gérer le Chronomètre et l'Intervention de l'Examinateur
- *Que se passe-t-il si je m'arrête avant les 4 min 30 ?* Si vous avez fini votre monologue après 2 ou 3 minutes, ne paniquez surtout pas ! L'examinateur va naturellement vous relancer en vous posant 2 ou 3 questions d'approfondissement pour compléter le temps officiel de 4 minutes 30. Répondez-y avec assurance en développant vos idées !`,
    examples: [
      "Astuce de relance mentale : Si vous cherchez vos idées pendant votre discours, utilisez des expressions de temporisation prestigieuses au lieu de faire des « Euhhhh » : « Il est également opportun de souligner que... », « De surcroît, si l'on examine la question sous un angle économique, on constate que... », « Ce phénomène nous amène naturellement à nous interroger sur... ».",
      "Lexique de prise de position C1 : « Je suis intimement convaincu que... », « Il me semble primordial d'encadrer cette pratique par... », « Cette évolution apparaît à la fois inéluctable et porteuse de progrès. »"
    ],
    intro: "Tâche 3 - Argumentation spontanée",
    promptText: `Sujet officiel d'épreuve (Tâche 3) :
« De plus en plus de pays et de métropoles à travers le monde envisagent de rendre les transports en commun entièrement gratuits pour l'ensemble des citoyens et des touristes afin de lutter contre la pollution automobile et de favoriser le pouvoir d'achat. À votre avis, la gratuité totale des transports publics est-elle une mesure réaliste et souhaitable pour l'avenir de nos villes ? Vous développerez votre point de vue argumenté en illustrant vos propos par des exemples. (Durée : 4 min 30 sans préparation) »`,
    modelAnswer: `[Exemple de monologue structuré de niveau C1/C2 - NCLC 10]

**[1. Introduction & Annonce du plan]**
« Monsieur/Madame l'examinateur, le sujet que vous me proposez soulève une problématique cruciale au cœur de l'aménagement de nos métropoles modernes et de la transition écologique : la gratuité totale des transports publics constitue-t-elle une solution viable et vertueuse pour l'avenir urbain ? C'est un sujet qui divise tant les économistes que les écologistes. Pour répondre à cette interrogation, j'analyserai dans un premier temps les bénéfices indéniables de cette mesure sur le plan environnemental et social, avant d'examiner, dans un second temps, les défis financiers majeurs qu'elle pose aux collectivités territoriales.

**[2. Première partie : Les bénéfices sociaux et environnementaux]**
Dans un premier temps, il me semble indéniable que l'instauration de la gratuité dans les bus, métros et tramways présente un double avantage majeur. Sur le plan écologique tout d'abord, elle constitue une incitation directe et puissante pour convaincre les automobilistes d'abandonner leur véhicule individuel au profit des mobilités partagées. Par exemple, des agglomérations européennes ou nord-américaines qui ont expérimenté la gratuité le week-end ont vu leur fréquentation de transport public bondir de plus de 30%, entraînant une baisse immédiate de la congestion urbaine et des émissions de gaz à effet de serre. Par ailleurs, sur le plan social, cette mesure représente un soutien formidable au pouvoir d'achat des ménages les plus modestes et des étudiants, pour qui le budget mobilité pèse lourdement chaque mois. Elle favorise ainsi un droit à la mobilité universel et inclusif.

**[3. Deuxième partie : Les limites et le défi du financement]**
Toutefois, bien que cette perspective soit extrêmement séduisante sur le papier, il convient d'examiner avec réalisme le revers de la médaille, à savoir la viabilité économique d'un tel modèle. En effet, la gratuité n'existe pas en économie : l'abolition des tickets de transport signifie que le manque à gagner, qui se chiffre en centaines de millions de dollars pour une métropole comme Montréal ou Toronto, devra obligatoirement être compensé par une hausse des impôts locaux ou par de nouvelles taxes sur les entreprises. De plus, plusieurs études d'urbanisme démontrent que la gratuité totale peut entraîner une saturation excessive et une dégradation rapide des rames, privant en parallèle les sociétés de transport des revenus indispensables pour investir dans l'entretien du réseau, la sécurité et l'extension des lignes vers les banlieues éloignées.

**[4. Conclusion & Prise de position personnelle]**
En conclusion, je suis intimement convaincu que si la gratuité totale des transports publics est une aspiration sociale généreuse, elle ne constitue pas une solution magique à elle seule. À mon sens, plutôt qu'une gratuité universelle qui risquerait d'asphyxier financièrement nos réseaux de transport, il serait bien plus pragmatique et souhaitable d'opter pour une gratuité ciblée ou des tarifs solidairement modulés selon les revenus, couplée à un investissement massif dans la qualité, la ponctualité et la sécurité des lignes. C'est à cette seule condition que nos métropoles réussiront leur pari de durabilité sans compromettre l'excellence de leurs infrastructures publiques. Je vous remercie de votre attention et je reste à votre disposition si vous souhaitez aborder certains points de mon argumentation. »`,
    tips: [
      "Respirez calmement ! Parler un peu plus lentement avec une excellente prononciation et des pauses bien placées vous fera gagner un temps précieux et vous donnera une allure d'orateur confiant et expert.",
      "Si vous avez un trou de mémoire ou perdez le fil d'un argument, utilisez une phrase de rattrapage élégante : « Mais revenons plutôt au cœur de notre sujet, à savoir... » ou « Ce qui m'amène à souligner un autre aspect capital de cette question... »."
    ],
    exercises: [
      {
        question: "Lors de la Tâche 3 d'expression orale du TCF Canada, avez-vous le droit d'utiliser une feuille de brouillon pour préparer votre discours avant de prendre la parole ?",
        options: ["Oui, vous avez 5 minutes de préparation en silence sur brouillon", "Non, la Tâche 3 se déroule en spontané immédiat, sans aucun temps de préparation préalable", "Oui, vous pouvez consulter votre téléphone portable ou un dictionnaire", "Non, mais vous pouvez demander à l'examinateur de rédiger l'introduction à votre place"],
        answer: 1,
        explanation: "La Tâche 3 évalue votre capacité d'organisation mentale immédiate en français. Dès que l'examinateur a lu le sujet (et l'a relu si vous le demandez), vous devez démarrer votre argumentation sans préparation écrite."
      }
    ],
    quiz: [
      {
        q: "Quel est le comportement idéal à adopter si, après avoir parlé pendant 2 minutes 30 en Tâche 3, vous avez terminé tous vos arguments et ne savez plus quoi dire ?",
        options: ["Quitter la salle d'examen en courant ou fondre en larmes", "Rester en silence total et refuser de répondre si l'examinateur vous parle", "Conclure poliment votre propos (« Voilà pour les points essentiels de mon analyse ») et répondre ensuite avec enthousiasme et précision aux questions de relance de l'examinateur", "Répéter exactement mot pour mot tout ce que vous venez de dire au cours des deux premières minutes"],
        answer: 2,
        explanation: "Les examinateurs TCF sont formés pour relancer les candidats au cours des 4 minutes 30 en leur posant des questions d'approfondissement ou des objections argumentées. Répondre à ces relances avec fluidité permet parfaitement d'atteindre le niveau NCLC 9 ou 10 !"
      }
    ],
    summary: "Résumé : La Tâche 3 est l'épreuve reine qui couronne votre parcours TCF Canada Pro. Adoptez la structure en 3 temps (Intro/Annonce du plan, Corps en 2 parties nuancées, Conclusion personnelle), soignez vos connecteurs logiques et exprimez votre opinion avec l'assurance d'un futur citoyen canadien !"
  }
];
