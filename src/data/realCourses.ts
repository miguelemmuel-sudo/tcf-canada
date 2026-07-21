export interface CourseLesson {
  id: number;
  title: string;
  duration: string;
  level: string; // A1, A2, B1, B2, C1, C2
  instruction: string;
  text: string;
  audioText: string;
  intro: string;
  promptText: string;
  modelAnswer: string;
  minWords: number;
  maxWords: number;
  tips: string[];
  questions: {
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
    title: "Se présenter et saluer (A1)",
    duration: "15 min",
    level: "A1",
    instruction: "Écoutez l'enregistrement et répondez aux questions de compréhension.",
    text: "Dans cette leçon, nous allons apprendre à reconnaître les salutations de base et les présentations personnelles. \n\n**Objectifs :**\n- Comprendre des mots familiers et des expressions très courantes.\n- Identifier les formules de salutations.",
    audioText: "Bonjour ! Je m'appelle Thomas. J'ai trente ans. J'habite à Paris et je suis ingénieur. Et vous, comment vous appelez-vous ?",
    intro: "Salutations de base",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Écoutez les intonations.", "Repérez les mots-clés : prénoms, âges, professions."],
    questions: [
      {
        q: "Comment s'appelle l'homme qui parle ?",
        options: ["Thomas", "Nicolas", "Julien", "Antoine"],
        answer: 0,
        explanation: "Il dit très clairement : 'Bonjour ! Je m'appelle Thomas.'"
      },
      {
        q: "Quelle est sa profession ?",
        options: ["Médecin", "Professeur", "Ingénieur", "Étudiant"],
        answer: 2,
        explanation: "Il précise : 'et je suis ingénieur.'"
      }
    ]
  },
  {
    id: 2,
    title: "Annonces dans un lieu public (A2)",
    duration: "20 min",
    level: "A2",
    instruction: "Écoutez les annonces et identifiez les informations essentielles.",
    text: "**Objectifs :**\n- Comprendre des expressions et un vocabulaire très fréquent relatifs à des annonces publiques (gare, aéroport, magasin).\n- Saisir l'essentiel d'annonces courtes et claires.",
    audioText: "Votre attention s'il vous plaît. Le train TGV numéro 8432 à destination de Lyon, départ prévu à 14h20, partira de la voie 4. Veuillez étiqueter vos bagages.",
    intro: "À la gare",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Notez toujours les chiffres (heures, numéros de quai/voie) sur votre brouillon."],
    questions: [
      {
        q: "Quelle est la destination du train ?",
        options: ["Paris", "Lyon", "Marseille", "Lille"],
        answer: 1,
        explanation: "L'annonce indique : 'à destination de Lyon'."
      }
    ]
  },
  {
    id: 3,
    title: "Comprendre une interview radio (B1)",
    duration: "25 min",
    level: "B1",
    instruction: "Écoutez l'extrait radiophonique et répondez aux questions.",
    text: "**Objectifs :**\n- Comprendre les points essentiels quand un langage clair et standard est utilisé.\n- Comprendre l'essentiel d'émissions de radio.",
    audioText: "Aujourd'hui, nous recevons Marie, créatrice d'une application pour réduire le gaspillage alimentaire. Marie, votre projet a déjà séduit 100 000 utilisateurs.",
    intro: "Interview : Écologie et start-up",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Essayez de repérer le thème principal dès la première phrase."],
    questions: [
      {
        q: "Quel est le but de l'application de Marie ?",
        options: ["Vendre des légumes en ligne", "Réduire le gaspillage alimentaire", "Trouver les supermarchés les moins chers", "Apprendre à cuisiner"],
        answer: 1,
        explanation: "Le journaliste mentionne qu'elle est 'créatrice d'une application pour réduire le gaspillage alimentaire'."
      }
    ]
  },
  {
    id: 4,
    title: "Débat sur le télétravail (B2)",
    duration: "30 min",
    level: "B2",
    instruction: "Écoutez attentivement ce débat et analysez les arguments.",
    text: "**Objectifs :**\n- Suivre une argumentation complexe si le sujet est familier.",
    audioText: "Bien que le télétravail offre une flexibilité indéniable, il pose le problème de la frontière entre vie privée et vie professionnelle. Certains employés dénoncent un isolement grandissant, tandis que les entreprises saluent une hausse de la productivité.",
    intro: "Débat société",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Repérez les connecteurs logiques (bien que, tandis que)."],
    questions: [
      {
        q: "Quel est un des inconvénients du télétravail évoqué par les employés ?",
        options: ["La baisse de la productivité", "L'isolement", "Le manque d'équipement", "Le coût de l'électricité"],
        answer: 1,
        explanation: "L'extrait précise : 'Certains employés dénoncent un isolement grandissant'."
      }
    ]
  },
  {
    id: 5,
    title: "Analyse d'une conférence scientifique (C1/C2)",
    duration: "40 min",
    level: "C1",
    instruction: "Prenez des notes pendant l'écoute. Cet exercice requiert une compréhension fine de l'implicite.",
    text: "**Objectifs :**\n- Comprendre un long discours même s'il n'est pas clairement structuré.",
    audioText: "L'effondrement de la biodiversité n'est plus une hypothèse d'école mais une réalité tangible, mesurable et alarmante. La perte des habitats naturels, exacerbée par l'anthropisation galopante, engendre un déclin systémique. Si nous ne révisons pas notre paradigme de croissance, c'est l'habitabilité même de notre biosphère qui est engagée.",
    intro: "Conférence : Crise environnementale",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Prêtez attention au vocabulaire abstrait et académique."],
    questions: [
      {
        q: "Selon l'orateur, qu'est-ce qui aggrave la perte des habitats naturels ?",
        options: ["Le braconnage", "L'anthropisation galopante", "Les températures", "L'inaction"],
        answer: 1,
        explanation: "L'orateur affirme : 'exacerbée par l'anthropisation galopante...'"
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
    title: "Lire un message simple (A1)",
    duration: "15 min",
    level: "A1",
    instruction: "Lisez ce texte court et répondez aux questions.",
    text: "Salut Paul,\n\nJe t'invite à mon anniversaire samedi prochain à 20h00 chez moi. Nous allons manger une grande pizza et un gâteau au chocolat. N'oublie pas d'apporter de la musique !\n\nÀ samedi,\nLuc",
    audioText: "",
    intro: "",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Cherchez les informations factuelles (qui, quoi, où, quand)."],
    questions: [
      {
        q: "Quel jour a lieu la fête ?",
        options: ["Vendredi", "Samedi", "Dimanche", "Lundi"],
        answer: 1,
        explanation: "Luc écrit : 'samedi prochain'."
      }
    ]
  },
  {
    id: 2,
    title: "Comprendre une offre d'emploi (A2/B1)",
    duration: "25 min",
    level: "B1",
    instruction: "Analysez cette offre d'emploi et répondez.",
    text: "L'entreprise TechSoft recherche un développeur web junior pour son agence à Lyon. \n**Profil recherché :** Diplôme en informatique, maîtrise de JavaScript et esprit d'équipe.\n**Conditions :** Contrat à durée indéterminée (CDI), 35h par semaine. Salaire négociable selon expérience.\nVeuillez envoyer votre CV et lettre de motivation avant le 30 avril.",
    audioText: "",
    intro: "",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Familiarisez-vous avec le vocabulaire du travail."],
    questions: [
      {
        q: "Quel type de contrat est proposé ?",
        options: ["Stage", "CDD", "CDI", "Intérim"],
        answer: 2,
        explanation: "Le texte indique : 'Contrat à durée indéterminée (CDI)'."
      }
    ]
  },
  {
    id: 3,
    title: "Article de presse : Les mobilités (B2)",
    duration: "30 min",
    level: "B2",
    instruction: "Lisez cet article extrait d'un magazine d'actualité.",
    text: "Face à l'engorgement des métropoles et aux impératifs climatiques, les villes repensent leur politique de mobilité. Les trottinettes électriques en libre-service ont désormais trouvé leur place grâce à des réglementations strictes. Néanmoins, certains urbanistes plaident pour un investissement massif dans les transports en commun lourds, jugeant les micro-mobilités insuffisantes pour répondre aux enjeux de la périphérie.",
    audioText: "",
    intro: "",
    promptText: "",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Faites attention au ton de l'auteur et aux arguments présentés."],
    questions: [
      {
        q: "Que pensent certains urbanistes des micro-mobilités ?",
        options: ["Qu'elles sont la solution", "Qu'elles polluent", "Qu'elles sont insuffisantes pour la périphérie", "Qu'elles coûtent trop cher"],
        answer: 2,
        explanation: "Les urbanistes jugent 'les micro-mobilités insuffisantes'."
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
    title: "Tâche 1 - Rédiger un message simple (A1/A2)",
    duration: "20 min",
    level: "A2",
    instruction: "Tâche 1 du TCF : Rédiger un message court.",
    text: "**Objectifs :**\n- Écrire un message simple (60 à 120 mots).\n- Saluer, formuler une invitation.\n\n**Structure :**\n1. Formule d'appel\n2. Objet du message\n3. Détails\n4. Formule de politesse",
    audioText: "",
    intro: "Tâche 1 - Message amical",
    promptText: "Vous avez découvert un nouveau restaurant dans votre ville. Vous écrivez un email à un ami francophone pour lui raconter votre expérience et l'inviter à y aller avec vous. (60 mots minimum)",
    modelAnswer: "Salut Thomas,\nJ'espère que tu vas bien. Hier, j'ai découvert un nouveau restaurant italien au centre-ville. La nourriture était délicieuse.\nJe voudrais t'inviter à y dîner avec moi samedi prochain à 20h. Es-tu libre ?\nTiens-moi au courant !\nÀ très vite,\nJulien",
    minWords: 60,
    maxWords: 120,
    tips: ["Ne dépassez pas le nombre de mots recommandé.", "N'oubliez pas les formules de début et de fin."],
    questions: [],
  },
  {
    id: 2,
    title: "Tâche 2 - Écrire un article, un compte rendu (B1)",
    duration: "30 min",
    level: "B1",
    instruction: "Tâche 2 du TCF : Raconter une expérience.",
    text: "**Objectifs :**\n- Rédiger un texte descriptif ou narratif (120 à 150 mots).\n- Parler au passé.",
    audioText: "",
    intro: "Tâche 2 - Récit d'expérience",
    promptText: "Vous avez participé à un événement sportif. Vous écrivez un article pour raconter cet événement et donner vos impressions. (120 mots minimum)",
    modelAnswer: "Le week-end dernier, j'ai eu la chance de participer au marathon de ma ville. C'était une expérience incroyable ! Dès le matin, l'ambiance était festive.\n\nAu début, j'étais un peu stressé, mais les encouragements du public m'ont beaucoup aidé. Finalement, j'ai franchi la ligne d'arrivée avec un immense sentiment de fierté. L'année prochaine, j'y participerai à nouveau !",
    minWords: 120,
    maxWords: 150,
    tips: ["Alternez l'imparfait et le passé composé."],
    questions: [],
  },
  {
    id: 3,
    title: "Tâche 3 - Exprimer et argumenter son point de vue (B2/C1)",
    duration: "40 min",
    level: "C1",
    instruction: "Tâche 3 du TCF : Comparer deux opinions et donner son avis.",
    text: "**Objectifs :**\n- Formuler et défendre son opinion avec des arguments solides (120 à 180 mots).",
    audioText: "",
    intro: "Tâche 3 - Essai argumentatif",
    promptText: "Deux internautes débattent de l'impact des réseaux sociaux. L'un pense qu'ils isolent, l'autre affirme qu'ils créent des communautés. Donnez votre opinion argumentée. (120 mots minimum)",
    modelAnswer: "Le débat sur l'impact des réseaux sociaux suscite de vives réactions. D'un côté, certains estiment que ces plateformes favorisent l'isolement social. De l'autre côté, de nombreux utilisateurs soulignent le pouvoir de rassembler des personnes.\n\nÀ mon sens, bien que les réseaux sociaux comportent un risque, ils demeurent un outil formidable s'ils sont utilisés avec modération.",
    minWords: 120,
    maxWords: 180,
    tips: ["Structurez votre texte en 3 paragraphes."],
    questions: [],
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTION ORALE (PO)
// ─────────────────────────────────────────────────────────────────────────────
export const speakingCourses: CourseLesson[] = [
  {
    id: 1,
    title: "Tâche 1 - L'entretien dirigé (A1/A2)",
    duration: "5 min",
    level: "A2",
    instruction: "Tâche 1 : Parler de vous sans préparation (2 minutes).",
    text: "**Objectifs :**\n- Se présenter, parler de son environnement, son travail, ses loisirs.",
    audioText: "",
    intro: "Tâche 1 - Entretien dirigé",
    promptText: "Parlez-moi de votre ville d'origine. Qu'est-ce que vous aimez y faire le week-end ?",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Ne donnez pas de réponses monosyllabiques (Oui/Non). Développez."],
    questions: [],
  },
  {
    id: 2,
    title: "Tâche 2 - L'interaction avec préparation (B1)",
    duration: "10 min",
    level: "B1",
    instruction: "Tâche 2 : Interagir pour obtenir des informations.",
    text: "**Objectifs :**\n- Poser des questions, s'informer sur une situation.",
    audioText: "",
    intro: "Tâche 2 - Interaction (Jeu de rôle)",
    promptText: "Vous voulez vous inscrire à un club de sport. Je suis l'employé(e). Posez-moi des questions.",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Variez la forme de vos questions."],
    questions: [],
  },
  {
    id: 3,
    title: "Tâche 3 - L'expression d'un point de vue (B2/C1)",
    duration: "15 min",
    level: "B2",
    instruction: "Tâche 3 : Argumenter de manière construite sans préparation.",
    text: "**Objectifs :**\n- Développer une opinion argumentée.",
    audioText: "",
    intro: "Tâche 3 - Point de vue argumenté",
    promptText: "La semaine de travail de quatre jours est de plus en plus testée par les entreprises. Pensez-vous que cela soit une bonne idée ?",
    modelAnswer: "",
    minWords: 0,
    maxWords: 0,
    tips: ["Organisez vos idées dans votre tête avant de parler."],
    questions: [],
  }
];
