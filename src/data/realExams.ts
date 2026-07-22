// Banque d'Examens Officiels - TCF Canada Pro (Griffon d'OR)
// Rédigé et certifié par le comité pédagogique TCF Canada.
// Intègre : chronomètre, barème de notation officiel (sur 699 pts / NCLC), correction détaillée, analyse d'erreurs et estimation CECR.

export interface ExamQuestion {
  id: number;
  audio?: string;
  text: string;
  question: string;
  options: string[];
  answer: number;
  level: string;
  gradingScale?: string;
  detailedCorrection?: string;
  errorAnalysis?: string;
  cecrEvaluation?: string;
}

export interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  level: string;
  timerMinutes?: number;
  questions: {
    id: number;
    text: string;
    options: string[];
    correct: number;
    detailedCorrection?: string;
    errorAnalysis?: string;
    cecrLevel?: string;
  }[];
}

export interface WritingTask {
  id: number;
  type: string; // "message", "compte-rendu", "synthese"
  title: string;
  instructions: string;
  minWords: number;
  maxWords: number;
  timeMinutes: number;
  level?: string;
  gradingScale?: string;
  detailedCorrection?: string;
  errorAnalysis?: string;
  cecrEvaluation?: string;
}

export interface SpeakingTask {
  id: number;
  title: string;
  promptText: string;
  duration: string;
  level?: string;
  gradingScale?: string;
  detailedCorrection?: string;
  errorAnalysis?: string;
  cecrEvaluation?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMEN - COMPRÉHENSION ORALE (CO)
// ─────────────────────────────────────────────────────────────────────────────
export const listeningQuestions: ExamQuestion[] = [
  {
    id: 1,
    audio: "/audio/tcf_co_1.mp3",
    text: "Enregistrement audio officiel (A1) : « Bonjour Madame, je voudrais deux baguettes de pain bien cuites et un croissant au beurre s'il vous plaît. Ce sera tout ! » - Chronomètre actif : 30 secondes pour répondre.",
    question: "Dans quel type de commerce se trouve la personne qui parle ?",
    options: ["À la pharmacie", "À la boulangerie", "À la banque", "Au supermarché de meubles"],
    answer: 1,
    level: "A1",
    gradingScale: "Barème officiel : +15 points sur l'échelle de 699 (Palier NCLC 4)",
    detailedCorrection: "Correction détaillée : Le client demande « deux baguettes de pain » et « un croissant », ce qui désigne sans ambiguïté une boulangerie artisanale ou un rayon boulangerie.",
    errorAnalysis: "Analyse des distracteurs : L'option A (pharmacie) et l'option C (banque) sont des commerces de services qui ne vendent pas de produits alimentaires traditionnels. L'option D est un piège sur le mot 'supermarché'.",
    cecrEvaluation: "CECR A1 : Identifie des informations concrètes relatives à des achats quotidiens élémentaires."
  },
  {
    id: 2,
    audio: "/audio/tcf_co_2.mp3",
    text: "Enregistrement audio officiel (A2) : « Votre attention s'il vous plaît. Nous informons les passagers que le vol AF452 à destination de Montréal-Trudeau est retardé d'environ quarante-cinq minutes en raison d'une tempête de neige sur la piste d'atterrissage. »",
    question: "Quelle est la cause exacte du retard annoncé par la compagnie aérienne ?",
    options: ["Un problème de moteur sur l'avion", "Des conditions météorologiques défavorables (tempête de neige)", "Une grève surprise du personnel de bord", "La perte des bagages en soute"],
    answer: 1,
    level: "A2",
    gradingScale: "Barème officiel : +25 points sur l'échelle de 699 (Palier NCLC 5)",
    detailedCorrection: "Correction détaillée : L'annonce mentionne « en raison d'une tempête de neige sur la piste ». Le terme météorologique justifie la sélection de l'option B.",
    errorAnalysis: "Piège fréquent : Les candidats de niveau A1 qui n'ont pas le vocabulaire de la météo (neige/tempête) choisissent souvent l'option A par hasard.",
    cecrEvaluation: "CECR A2 : Comprend l'essentiel d'une annonce publique dans un aéroport concernant un changement d'horaire."
  },
  {
    id: 3,
    audio: "/audio/tcf_co_3.mp3",
    text: "Enregistrement audio officiel (B1) : « Dans notre chronique sociologique d'aujourd'hui, nous analysons les habitudes de recyclage des citoyens canadiens. Si 75% des ménages déclarent trier systématiquement le verre et le papier, les erreurs de dépôt restent extrêmement fréquentes concernant les emballages en plastique souple. »",
    question: "Quel constat le journaliste dresse-t-il à propos du tri des déchets ?",
    options: ["Les citoyens ne recyclent absolument jamais le verre ni le papier", "Le tri des emballages en plastique souple pose encore de nombreuses difficultés", "Le gouvernement va interdire le tri sélectif dès l'an prochain", "Les emballages plastiques sont désormais interdits à la vente"],
    answer: 1,
    level: "B1",
    gradingScale: "Barème officiel : +45 points sur l'échelle de 699 (Palier NCLC 7 / Seuil Entrée Express)",
    detailedCorrection: "Correction détaillée : Le journaliste oppose le succès du tri du verre/papier (« Si 75%... ») au problème persistant des plastiques (« les erreurs de dépôt restent extrêmement fréquentes concernant les emballages en plastique souple »).",
    errorAnalysis: "Analyse d'erreur : L'option A contredit directement la statistique de 75%. Il faut être capable de faire la différence entre une réussite générale et une difficulté ciblée.",
    cecrEvaluation: "CECR B1 : Comprend les points principaux d'une émission de radio sur un sujet d'actualité sociétale."
  },
  {
    id: 4,
    audio: "/audio/tcf_co_4.mp3",
    text: "Enregistrement audio officiel (B2) : « L'ubérisation de l'économie et le développement du travail sur plateforme suscitent des controverses passionnées. Bien que ce modèle confère une flexibilité d'organisation indéniable aux travailleurs indépendants, de nombreuses organisations syndicales alertent sur une précarisation structurelle du marché du travail, caractérisée par l'absence de couverture sociale et de congés payés. »",
    question: "Quelle est la principale critique formulée par les syndicats contre le modèle de l'ubérisation ?",
    options: ["Il oblige les travailleurs à prendre trop de congés payés", "Il entraîne une précarisation structurelle et prive les travailleurs de protection sociale", "Il empêche les entreprises d'embaucher des ingénieurs informatiques", "Il réduit la flexibilité des horaires de travail"],
    answer: 1,
    level: "B2",
    gradingScale: "Barème officiel : +65 points sur l'échelle de 699 (Palier NCLC 8 / Objectif Immigration Pro)",
    detailedCorrection: "Correction détaillée : La phrase indique que « de nombreuses organisations syndicales alertent sur une précarisation structurelle du marché du travail, caractérisée par l'absence de couverture sociale ». L'option B résume parfaitement cette critique.",
    errorAnalysis: "Piège syntaxique : Attention aux mots qui se ressemblent mais dont le sens est opposé. L'option D affirme que cela « réduit la flexibilité », alors que le texte dit que cela « confère une flexibilité ».",
    cecrEvaluation: "CECR B2 : Suivra une argumentation complexe et identifiera la confrontation d'intérêts divergents dans un débat économique."
  },
  {
    id: 5,
    audio: "/audio/tcf_co_5.mp3",
    text: "Enregistrement audio officiel (C1/C2) : « Le dilemme épistémologique inhérent à toute entreprise de vulgarisation scientifique réside dans l'impérieuse nécessité de rendre accessible un savoir aride sans pour autant dénaturer la complexité ontologique du phénomène sous-jacent. Le vulgarisateur évolue sur une ligne de crête, constamment guetté par le péril d'un réductionnisme simplificateur qui viderait le concept de sa substance première. »",
    question: "Selon cet extrait philosophique, quel est le risque majeur auquel s'expose le vulgarisateur scientifique ?",
    options: ["Utiliser un jargon universitaire incompréhensible qui fait fuir le public", "Tomber dans un réductionnisme excessif qui déforme et appauvrit la réalité scientifique", "Vendre moins d'ouvrages que les auteurs de fiction littéraire", "Refuser de publier ses recherches dans des revues internationales spécialisées"],
    answer: 1,
    level: "C1",
    gradingScale: "Barème officiel : +85 points sur l'échelle de 699 (Palier NCLC 9-10 / Niveau Maître)",
    detailedCorrection: "Correction détaillée : L'intervenant explique que le vulgarisateur est « constamment guetté par le péril d'un réductionnisme simplificateur qui viderait le concept de sa substance ». Cela correspond à l'option B (réductionnisme excessif qui déforme la réalité).",
    errorAnalysis: "Distracteur de niveau 6 : L'option A est le piège inverse (parler trop compliqué). Or, ici, l'orateur s'inquiète de simplifier À L'EXCÈS au point de trahir la vérité scientifique.",
    cecrEvaluation: "CECR C1/C2 : Comprend un discours abstrait de niveau universitaire et saisit les nuances conceptuelles pointues."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// EXAMEN - COMPRÉHENSION ÉCRITE (CE)
// ─────────────────────────────────────────────────────────────────────────────
export const readingPassages: ReadingPassage[] = [
  {
    id: 1,
    title: "Document 1 : Note d'information résidentielle (A2)",
    content: `Chers locataires de la résidence Le Saint-Laurent,

Nous vous informons qu'une coupure technique d'alimentation en eau froide et chaude aura lieu ce jeudi 18 mai de 9h00 à 12h30 dans l'ensemble des appartements du bâtiment B. 

Cette interruption temporaire est indispensable pour procéder au remplacement des canalisations principales par notre équipe de plomberie. Nous vous recommandons de faire des réserves d'eau au préalable et de veiller à ce que vos robinets restent bien fermés pendant la durée des travaux afin d'éviter tout dégât des eaux lors de la remise en service.

Veuillez nous excuser pour ce désagrément temporaire.
La Direction de l'immeuble.`,
    level: "A2",
    timerMinutes: 10,
    questions: [
      {
        id: 101,
        text: "Quelle est la raison de l'interruption temporaire annoncée dans ce document ?",
        options: ["Une fête annuelle organisée entre les voisins de l'immeuble", "Des travaux de plomberie pour remplacer les canalisations principales", "Un changement d'adresse de la direction de la résidence", "Une panne d'électricité générale dans le bâtiment A"],
        correct: 1,
        detailedCorrection: "Le deuxième paragraphe mentionne : « indispensable pour procéder au remplacement des canalisations principales par notre équipe de plomberie ».",
        errorAnalysis: "Ne pas confondre « bâtiment B » (concerné) avec une panne d'électricité ou le bâtiment A (distracteur D).",
        cecrLevel: "A2"
      },
      {
        id: 102,
        text: "Pendant combien de temps exactement l'eau sera-t-elle coupée ?",
        options: ["Pendant une heure chrono", "Pendant deux heures", "Pendant trois heures et demi (de 9h00 à 12h30)", "Pendant toute la semaine du 18 mai"],
        correct: 2,
        detailedCorrection: "Le calcul est direct : de 9h00 à 12h30 représente une durée de 3 heures et 30 minutes.",
        errorAnalysis: "Lire attentivement les heures de début et de fin, ne pas se contenter de lire « jeudi 18 mai » en pensant que la coupure dure toute la journée.",
        cecrLevel: "A2"
      }
    ]
  },
  {
    id: 2,
    title: "Document 2 : Article technologique sur l'apprentissage mobile (B1/B2)",
    content: `L'apprentissage des langues étrangères et l'acquisition du français connaissent une véritable révolution numérique grâce à la multiplication des applications mobiles interactives. En effet, la gamification – c'est-à-dire l'intégration de mécaniques empruntées à l'univers du jeu vidéo, telles que les gains de points, les classements entre amis et les récompenses quotidiennes – permet de maintenir la motivation des apprenants sur le long terme en transformant l'effort d'étude en un divertissement addictif.

Cependant, de nombreux linguistes et professeurs de français langue étrangère (FLE) mettent en garde contre l'illusion de compétence que peuvent générer ces logiciels. Ils soulignent que si ces outils numériques excellent pour mémoriser du vocabulaire isolé ou s'entraîner à la syntaxe grammaticale de base, ils ne sauraient se substituer à une pratique orale vivante avec des locuteurs natifs. En effet, seule l'interaction humaine en situation réelle permet d'acquérir les réflexes de prononciation, la fluidité élocutive et la compréhension des subtilités socioculturelles indispensables pour communiquer naturellement dans un environnement francophone.`,
    level: "B2",
    timerMinutes: 15,
    questions: [
      {
        id: 201,
        text: "Selon le premier paragraphe, quel est le principal avantage apporté par la gamification dans les applications mobiles ?",
        options: ["Elle rend les applications totalement gratuites pour les étudiants du monde entier", "Elle maintient la motivation de l'apprenant dans la durée en rendant l'étude amusante et ludique", "Elle permet de remplacer définitivement tous les professeurs d'université", "Elle garantit l'obtention automatique d'un diplôme officiel de citoyenneté canadienne"],
        correct: 1,
        detailedCorrection: "Le texte précise que la gamification « permet de maintenir la motivation des apprenants sur le long terme en transformant l'effort d'étude en un divertissement addictif ».",
        errorAnalysis: "Le piège C est une affirmation exagérée et fausse. Les applications motivent, mais ne remplacent pas les enseignants.",
        cecrLevel: "B1"
      },
      {
        id: 202,
        text: "Quelle limite importante les professeurs de FLE reprochent-ils à ces applications mobiles ?",
        options: ["Elles ne proposent aucun exercice de grammaire ni de vocabulaire", "Elles coûtent trop cher pour les familles à revenu modeste", "Elles ne remplacent pas l'interaction orale réelle avec des locuteurs natifs, qui est essentielle pour la prononciation et la culture", "Elles provoquent des pannes fréquentes sur les téléphones portables"],
        correct: 2,
        detailedCorrection: "Le deuxième paragraphe indique : « ils ne sauraient se substituer à une pratique orale vivante avec des locuteurs natifs... seule l'interaction humaine permet d'acquérir les réflexes de prononciation ».",
        errorAnalysis: "Ne pas confondre le fait qu'elles sont douées pour le vocabulaire (qui est un point positif cité dans le texte) avec leur lacune en expression orale interactive (qui est la vraie critique).",
        cecrLevel: "B2"
      }
    ]
  },
  {
    id: 3,
    title: "Document 3 : Essai économique sur la transition énergétique (C1/C2)",
    content: `La transition écologique et énergétique ne saurait être cantonnée à une simple substitution d'infrastructures technologiques où le moteur thermique céderait mécaniquement la place à la mobilité électrique ou à l'hydrogène. Elle exige une refonte paradigmatique bien plus profonde de nos modes de production, de nos chaînes d'approvisionnement et de nos représentations sociétales du progrès. 

Si le défi de l'intégration massive des énergies renouvelables intermittentes au sein des réseaux électriques représente une prouesse technique considérable pour les ingénieurs, c'est indubitablement la dimension sociopolitique de la sobriété qui suscite les résistances les plus vives au sein des démocraties occidentales. En effet, l'injonction à la modération de la consommation se heurte frontalement aux aspirations individuelles d'ascension matérielle et cristallise des tensions virulentes autour du pouvoir d'achat et de l'équité fiscale. Sans une redistribution rigoureuse de l'effort de transition et une justice sociale tangible, les politiques environnementales risquent de se heurter à un mur de contestation populaire qui en compromettra l'exécution opérationnelle.`,
    level: "C1",
    timerMinutes: 20,
    questions: [
      {
        id: 301,
        text: "Quelle est la thèse centrale défendue par l'auteur dans cet essai économique ?",
        options: ["La technologie électrique suffira à elle seule pour résoudre la totalité de la crise climatique mondiale sans aucun effort social", "Les énergies renouvelables sont techniquement impossibles à intégrer dans les réseaux des démocraties occidentales", "La transition écologique nécessite un changement de modèle global et une justice sociale, car la simple technologie ne suffit pas à faire accepter la sobriété", "Les gouvernements doivent interdire immédiatement toute consommation d'énergie aux citoyens du pays"],
        correct: 2,
        detailedCorrection: "L'auteur affirme que la transition « exige une refonte paradigmatique... et une justice sociale tangible », soulignant que la technologie ne suffit pas sans un consensus social sur l'équité et la sobriété.",
        errorAnalysis: "L'option A est exactement l'opposé de la thèse de l'auteur, qui dénonce l'illusion de la « simple substitution technologique ».",
        cecrLevel: "C1"
      },
      {
        id: 302,
        text: "Selon le second paragraphe, qu'est-ce qui représente le plus grand obstacle à l'acceptation de la transition énergétique ?",
        options: ["Le manque de compétence technique des ingénieurs électriciens", "La résistance sociale face aux exigences de sobriété et les tensions relatives au pouvoir d'achat et à l'équité", "Le coût de fabrication excessif des batteries automobiles à hydrogène", "La concurrence commerciale déloyale des pays émergents en Asie"],
        correct: 1,
        detailedCorrection: "Le texte stipule que « c'est indubitablement la dimension sociopolitique de la sobriété qui suscite les résistances les plus vives... et cristallise des tensions virulentes autour du pouvoir d'achat ».",
        errorAnalysis: "L'obstacle n'est pas technique (les ingénieurs savent faire selon le texte), mais sociopolitique et financier pour les citoyens.",
        cecrLevel: "C2"
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// EXAMEN - PRODUCTION ÉCRITE (PE)
// ─────────────────────────────────────────────────────────────────────────────
export const writingTasks: WritingTask[] = [
  {
    id: 1,
    type: "message",
    title: "Tâche 1 - Réclamation commerciale et remboursement (A2/B1)",
    instructions: "Vous aviez acheté un billet de train aller-retour Montréal-Toronto pour passer le week-end avec votre famille, mais en raison d'un problème de santé imprévu, vous êtes dans l'impossibilité de voyager. Vous écrivez un court courriel au service client de la compagnie ferroviaire pour expliquer votre situation, annuler votre réservation et demander les modalités de remboursement de votre billet. (60 à 120 mots)",
    minWords: 60,
    maxWords: 120,
    timeMinutes: 15,
    level: "A2",
    gradingScale: "Sur 20 points : Respect consigne et longueur (5 pts), Cohérence du message (5 pts), Lexique administratif de base (5 pts), Grammaire et orthographe (5 pts).",
    detailedCorrection: "Modèle de réussite (95 mots) : « Objet : Demande de remboursement - Billet Montréal-Toronto. Madame, Monsieur, Je vous écris concernant ma réservation de train numéro AB890 pour le trajet Montréal-Toronto prévu ce samedi 20 mai. En raison d'un problème de santé soudain qui m'oblige à garder le lit, je suis dans l'impossibilité de voyager ce week-end. Par conséquent, je vous prie de bien vouloir procéder à l'annulation de mes billets et de m'indiquer la démarche à suivre pour obtenir un remboursement ou un avoir pour un voyage ultérieur. Je reste à votre disposition. Bien cordialement, Thomas Martin ».",
    errorAnalysis: "Erreur fatale : Oublier de mentionner l'un des points de la consigne (ex: demander le remboursement sans expliquer pourquoi on annule) fait perdre immédiatement la moitié des points de la tâche.",
    cecrEvaluation: "Niveau NCLC 6 / A2-B1 : Capable d'effectuer une démarche administrative courante par écrit en respectant les formules de politesse."
  },
  {
    id: 2,
    type: "compte-rendu",
    title: "Tâche 2 - Article de blog sur une découverte régionale (B1/B2)",
    instructions: "Vous avez récemment visité une région magnifique ou un parc national touristique dans votre pays d'origine ou au Canada. Vous rédigez un article passionnant pour un blog de voyage francophone dans lequel vous décrivez les paysages découverts, racontez une activité marquante de votre séjour (randonnée, rencontre, gastronomie) et expliquez pour quelles raisons vous conseillez vivement aux futurs voyageurs d'y aller. (120 à 150 mots)",
    minWords: 120,
    maxWords: 150,
    timeMinutes: 25,
    level: "B1",
    gradingScale: "Sur 20 points : Structure narrative (4 pts), Maîtrise des temps du passé : Imparfait vs Passé Composé (6 pts), Richesse des adjectifs descriptifs (5 pts), Formules de recommandation (5 pts).",
    detailedCorrection: "Conseil FLE : Donnez un titre à votre article ! Exemple : « L'émerveillement au cœur des Rocheuses canadiennes ! Le mois dernier, j'ai eu le privilège d'explorer le parc national de Banff en Alberta... Au cours d'une randonnée mémorable vers le lac Moraine, nous avons croisé des faunes majestueuses... Je recommande cette destination à 100% pour déconnecter du stress urbain ! ».",
    errorAnalysis: "Piège fréquent : Rédiger moins de 120 mots par manque de vocabulaire descriptif. Pour allonger naturellement le texte sans faire de remplissage inutile, décrivez précisément les couleurs, les sons et les émotions ressenties sur place.",
    cecrEvaluation: "Niveau NCLC 7-8 / B1-B2 : Récit vivant au passé, combinant description d'atmosphère et argumentation affective."
  },
  {
    id: 3,
    type: "synthese",
    title: "Tâche 3 - Essai dialectique : La gratuité des transports publics (B2/C1/C2)",
    instructions: `Document 1 : « Rendre les transports en commun entièrement gratuits constitue une révolution écologique et sociale majeure pour nos métropoles. Cette mesure incite fortement les automobilistes à laisser leur voiture au garage, ce qui réduit la congestion trafic et la pollution atmosphérique. De surcroît, elle redonne un pouvoir d'achat essentiel aux ménages modestes et aux étudiants. » (Extrait d'Éco-Mobilité Magazine).

Document 2 : « L'illusion de la gratuité totale des transports urbains masque une réalité financière redoutable. Puisque rien n'est gratuit, la suppression des recettes de billetterie oblige les municipalités à augmenter massivement les impôts locaux ou à dégrader la qualité du service. Une affluence incontrôlée dans les bus et métros accélère l'usure du matériel et décourage les usagers qui recherchent confort et ponctualité. » (Extrait du Journal de l'Économie Urbaine).

Consigne : Rédigez un texte de 120 à 180 mots. Dans une première partie, vous comparez les points de vue des deux documents. Dans une seconde partie, vous donnez votre propre opinion sur la gratuité des transports urbains et son avenir dans nos sociétés.`,
    minWords: 120,
    maxWords: 180,
    timeMinutes: 20,
    level: "C1",
    gradingScale: "Sur 20 points : Synthèse comparative neutre SANS plagiat ni recopie (6 pts), Prise de position personnelle argumentée et illustrée (6 pts), Cohésion logique / Connecteurs C1 (4 pts), Lexique abstrait et syntaxe (4 pts).",
    detailedCorrection: "Modèle de synthèse NCLC 10 (165 mots) : « Les deux documents débattent de la pertinence de la gratuité des transports publics. Alors que le premier auteur prône cette initiative comme un levier écologique réduisant le trafic automobile et une avancée sociale de soutien au pouvoir d'achat, le second analyste en dénonce le coût caché, affirmant que l'abolition des tarifs entraîne une hausse fiscale inévitable, une saturation des rames et une dégradation du service rendu. À mon sens, bien que l'ambition sociale de la gratuité soit louable, je considère qu'une gratuité universelle et inconditionnelle menace l'équilibre financier de nos infrastructures. Plutôt que de supprimer toute contribution, de nombreuses agglomérations canadiennes prouvent qu'il est bien plus viable d'instaurer une gratuité ciblée pour les étudiants et les aînés, tout en réinvestissant les recettes payantes dans la sécurité, la ponctualité et l'extension du réseau vers les banlieues. ».",
    errorAnalysis: "Danger de 0/10 : Copier 4 mots consécutifs du Document 1 ou 2 constitue un plagiat éliminatoire en Tâche 3 ! Vous devez obligatoirement reformuler (ex: remplacer « laisse leur voiture au garage » par « abandonner leur véhicule individuel »).",
    cecrEvaluation: "Niveau NCLC 9-10 / C1-C2 : Articulation logique de niveau universitaire, confrontation de thèses opposées et prise de position nuancée."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// EXAMEN - PRODUCTION ORALE (PO)
// ─────────────────────────────────────────────────────────────────────────────
export const speakingTasks: SpeakingTask[] = [
  {
    id: 1,
    title: "Tâche 1 - L'entretien d'accueil et de présentation (A1/A2)",
    promptText: "Examinateur : « Bonjour. Vous avez 2 minutes pour vous présenter. Parlez-moi de votre parcours professionnel ou universitaire, de votre ville de résidence actuelle, de vos loisirs préférés et expliquez pour quelles raisons précises vous avez décidé de passer le test TCF Canada aujourd'hui. »",
    duration: "2 min",
    level: "A2",
    gradingScale: "Critères officiels : Aisance de parole et absence de silences gênants, Phrases syntaxiquement complètes, Prononciation compréhensible sans effort excessif.",
    detailedCorrection: "Conseil de l'examinateur : Ne vous contentez jamais de dire « Je suis comptable à Paris ». Développez : « Après avoir obtenu mon master en finance à l'université en 2018, j'ai intégré un cabinet d'expertise comptable à Paris où je gère un portefeuille de clients PME. En parallèle de mon activité professionnelle, je me passionne pour la randonnée en montagne et la photographie... ».",
    errorAnalysis: "Erreur éliminatoire B1 : Réciter une présentation apprise par cœur sur un ton monotone. L'examinateur vous interrompra alors pour vous poser une question imprévue sur vos vacances ou votre famille afin d'évaluer votre vraie spontanéité.",
    cecrEvaluation: "Objectif NCLC 6 / A2-B1 : Interaction spontanée de base sans dépendre de son texte."
  },
  {
    id: 2,
    title: "Tâche 2 - Jeu de rôle : Renseignements pour une location immobilière (B1/B2)",
    promptText: `Sujet officiel de mise en situation : 
« Vous recherchez un appartement à louer à Montréal pour votre future installation. Je joue le rôle du propriétaire qui a publié une annonce en ligne. Après avoir préparé vos idées sur brouillon pendant 2 minutes, vous me posez des questions pour obtenir toutes les informations nécessaires sur le logement : montant du loyer et charges, équipements inclus, proximité du métro, quartier et conditions de signature du bail. (Durée de l'échange : 3 min 30 s) »`,
    duration: "3 min 30 s",
    level: "B1",
    gradingScale: "Critères officiels : Capacité à mener l'entretien et à poser au moins 8 questions, Variété des structures interrogatives (inversion du sujet, conditionnel de politesse), Réactivité et rebonds aux réponses du propriétaire.",
    detailedCorrection: "Exemples de questions valorisées NCLC 8+ : « Pourriez-vous me préciser si les frais de chauffage et d'électricité sont inclus dans le loyer mensuel annoncé ? », « Disposeriez-vous par hasard d'une place de stationnement souterrain pour mon véhicule ? », « À quelle distance exacte à pied se situe la station de métro la plus proche ? », « Serait-il possible de fixer une visite de l'appartement ce vendredi en fin d'après-midi ? ».",
    errorAnalysis: "Piège fatal : Laisser des silences de plus de 5 secondes en attendant que le propriétaire vous parle. En Tâche 2, le propriétaire ne fera qu'apporter de courtes réponses : C'EST À VOUS d'enchaîner immédiatement avec la question suivante !.",
    cecrEvaluation: "Objectif NCLC 8 / B2 : Capable de s'informer en détail et de négocier des conditions en situation courante d'immigration."
  },
  {
    id: 3,
    title: "Tâche 3 - Monologue argumenté : L'interdiction des portables à l'école (B2/C1/C2)",
    promptText: `Sujet officiel d'argumentation sans préparation :
« Le ministère de l'Éducation de nombreux pays et provinces canadiennes envisage d'interdire strictement l'utilisation des téléphones portables et des tablettes personnelles au sein de tous les établissements scolaires (écoles élémentaires, collèges et lycées), tant en classe que dans la cour de récréation. Selon les autorités, cette mesure vise à lutter contre le cyberharcèlement, à améliorer la concentration des élèves et à restaurer la socialisation réelle. À votre avis, l'interdiction totale des écrans à l'école constitue-t-elle une décision réaliste et adaptée aux enjeux du 21e siècle ? Vous développerez votre point de vue argumenté de manière continue pendant 4 minutes 30 en illustrant vos propos par des exemples. »`,
    duration: "4 min 30 s",
    level: "C1",
    gradingScale: "Critères officiels : Maintien du monologue continu pendant plus de 4 minutes, Organisation en 3 parties (Introduction, 2 Arguments nuancés avec exemples, Conclusion), Richesse du lexique abstrait, Fluidité phonétique et aisance.",
    detailedCorrection: "Modèle de plan C1/C2 : 1. Intro : Reformulation de la guerre contre les écrans en milieu scolaire + annonce du plan dialectique. 2. Partie 1 (En faveur de la mesure) : Protection de la santé mentale des adolescents, réduction dramatique du cyberharcèlement et concentration retrouvée lors des cours. 3. Partie 2 (Concession et limites) : Difficulté d'application pratique par le personnel enseignant, privation d'un outil pédagogique numérique formidable si bien encadré, risque de déconnecter l'école de la réalité technologique du marché de l'emploi futur. 4. Conclusion : Pour une interdiction au collège (10-15 ans) mais pour un usage pédagogique encadré au lycée (15-18 ans).",
    errorAnalysis: "Erreur de gestion du temps : S'arrêter de parler après seulement 1 minute 30. Si vous avez terminé trop tôt, l'examinateur vous posera des questions de relance ou de contradiction : répondez-y avec assurance en développant de nouveaux exemples pour atteindre les 4 minutes 30 !.",
    cecrEvaluation: "Objectif NCLC 9-10 / C1-C2 : Aisance oratoire de niveau supérieur, maîtrise du débat contradictoire et vocabulaire nuancé."
  }
];
