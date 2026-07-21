export interface ExamQuestion {
  id: number;
  audio?: string;
  text: string;
  question: string;
  options: string[];
  answer: number;
  level: string;
}

export interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  level: string;
  questions: {
    id: number;
    text: string;
    options: string[];
    correct: number;
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
}

export interface SpeakingTask {
  id: number;
  title: string;
  promptText: string;
  duration: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMEN - COMPRÉHENSION ORALE (CO)
// ─────────────────────────────────────────────────────────────────────────────
export const listeningQuestions: ExamQuestion[] = [
  {
    id: 1,
    audio: "/audio/tcf_co_1.mp3", // En production, il faudra de vrais fichiers audio. Pour le moment l'UI utilise speechSynthesis si pas de fichier.
    text: "Audio : 'Bonjour, je voudrais deux baguettes et un croissant s'il vous plaît.'",
    question: "Où se trouve cette personne ?",
    options: ["À la pharmacie", "À la boulangerie", "À la banque", "Au supermarché"],
    answer: 1,
    level: "A1"
  },
  {
    id: 2,
    audio: "/audio/tcf_co_2.mp3",
    text: "Audio : 'Attention, le vol AF452 à destination de Montréal est retardé de 30 minutes en raison des conditions météorologiques.'",
    question: "Quelle est la cause du retard ?",
    options: ["Un problème technique", "La météo", "L'absence de l'équipage", "Un bagage oublié"],
    answer: 1,
    level: "A2"
  },
  {
    id: 3,
    audio: "/audio/tcf_co_3.mp3",
    text: "Audio : 'Dans notre émission d'aujourd'hui, nous parlons du tri sélectif. 60% des Français déclarent trier systématiquement le verre, mais les erreurs restent fréquentes pour les emballages plastiques.'",
    question: "Quel est le sujet principal de l'émission ?",
    options: ["La fabrication du plastique", "Le tri des déchets", "La consommation d'eau", "La pollution de l'air"],
    answer: 1,
    level: "B1"
  },
  {
    id: 4,
    audio: "/audio/tcf_co_4.mp3",
    text: "Audio : 'L'ubérisation de l'économie suscite de vifs débats. Si elle offre une flexibilité indéniable à ceux qui cherchent un complément de revenu, les syndicats dénoncent une précarisation de l'emploi dissimulée sous le statut de micro-entrepreneur.'",
    question: "Que dénoncent les syndicats ?",
    options: ["Le manque de clients", "La baisse des salaires des cadres", "La précarisation de l'emploi", "La suppression du statut d'entrepreneur"],
    answer: 2,
    level: "B2"
  },
  {
    id: 5,
    audio: "/audio/tcf_co_5.mp3",
    text: "Audio : 'Le dilemme inhérent à la vulgarisation scientifique réside dans la nécessité de simplifier sans pour autant trahir la complexité ontologique du phénomène étudié. Le vulgarisateur marche sur un fil, constamment guetté par le réductionnisme.'",
    question: "Quel est le risque principal de la vulgarisation scientifique selon cet extrait ?",
    options: ["Utiliser un vocabulaire trop spécialisé", "Être incompréhensible pour le grand public", "Simplifier à l'excès au point de déformer la réalité", "Générer moins de ventes de livres scientifiques"],
    answer: 2,
    level: "C1"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// EXAMEN - COMPRÉHENSION ÉCRITE (CE)
// ─────────────────────────────────────────────────────────────────────────────
export const readingPassages: ReadingPassage[] = [
  {
    id: 1,
    title: "Document 1",
    content: "Chers locataires,\nNous vous informons qu'une coupure d'eau aura lieu ce jeudi de 9h à 12h en raison de travaux sur les canalisations. Merci de prendre vos dispositions.\nLa Direction.",
    level: "A2",
    questions: [
      {
        id: 101,
        text: "De quoi informe ce document ?",
        options: ["D'une fête entre voisins", "D'une coupure d'eau", "D'un changement d'adresse", "D'une panne d'électricité"],
        correct: 1
      },
      {
        id: 102,
        text: "Combien de temps durera l'interruption ?",
        options: ["Une heure", "Deux heures", "Trois heures", "Toute la journée"],
        correct: 2
      }
    ]
  },
  {
    id: 2,
    title: "Document 2",
    content: "L'apprentissage des langues étrangères connaît une véritable révolution grâce aux applications mobiles. En effet, la gamification (l'utilisation de mécaniques de jeu) permet de maintenir la motivation des apprenants sur le long terme. Cependant, les professeurs soulignent que ces outils ne remplacent pas la pratique orale avec un locuteur natif pour maîtriser les subtilités culturelles.",
    level: "B1/B2",
    questions: [
      {
        id: 201,
        text: "Quel est l'avantage principal des applications selon le texte ?",
        options: ["Elles sont gratuites", "Elles maintiennent la motivation", "Elles remplacent les professeurs", "Elles apprennent la culture"],
        correct: 1
      },
      {
        id: 202,
        text: "Que manque-t-il à ces applications selon les professeurs ?",
        options: ["De la grammaire", "Des jeux", "La pratique avec un natif", "Des images"],
        correct: 2
      }
    ]
  },
  {
    id: 3,
    title: "Document 3",
    content: "La transition énergétique ne saurait se résumer à une simple substitution technologique. Elle exige une refonte paradigmatique de nos modes de production et de consommation. Si l'intégration des énergies renouvelables intermittentes représente un défi technique majeur pour la stabilité des réseaux, c'est surtout la dimension sociétale de la sobriété qui suscite les plus fortes résistances, cristallisant les tensions autour du pouvoir d'achat.",
    level: "C1/C2",
    questions: [
      {
        id: 301,
        text: "Quelle est la thèse défendue par l'auteur ?",
        options: ["La technologie résoudra tous les problèmes énergétiques", "Les énergies renouvelables sont impossibles à intégrer", "La transition nécessite un changement global et social", "Le pouvoir d'achat doit augmenter pour financer la transition"],
        correct: 2
      },
      {
        id: 302,
        text: "Qu'est-ce qui provoque le plus de résistances selon le texte ?",
        options: ["La technologie des éoliennes", "La dimension sociétale de la sobriété", "Le prix des panneaux solaires", "La stabilité des réseaux"],
        correct: 1
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
    title: "Tâche 1 - Message court",
    instructions: "Vous avez acheté un billet de train, mais vous ne pouvez plus partir. Vous écrivez un court email au service client pour demander comment annuler et vous faire rembourser.",
    minWords: 60,
    maxWords: 120,
    timeMinutes: 15
  },
  {
    id: 2,
    type: "compte-rendu",
    title: "Tâche 2 - Compte rendu ou article",
    instructions: "Vous avez récemment visité une région magnifique de votre pays. Vous écrivez un article pour un blog de voyage pour décrire ce lieu, raconter votre séjour et conseiller aux autres d'y aller.",
    minWords: 120,
    maxWords: 150,
    timeMinutes: 25
  },
  {
    id: 3,
    type: "synthese",
    title: "Tâche 3 - Essai argumentatif",
    instructions: "Sur un site d'actualité, deux lecteurs débattent de la gratuité des transports en commun. L'un affirme que cela réduit la pollution et aide les ménages modestes. L'autre soutient que cela dégrade le service et reporte le coût sur les impôts locaux. Écrivez un texte pour présenter les deux opinions, puis donnez votre point de vue argumenté.",
    minWords: 120,
    maxWords: 180,
    timeMinutes: 20
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// EXAMEN - PRODUCTION ORALE (PO)
// ─────────────────────────────────────────────────────────────────────────────
export const speakingTasks: SpeakingTask[] = [
  {
    id: 1,
    title: "Tâche 1 - Entretien dirigé",
    promptText: "Présentez-vous. Parlez de votre parcours professionnel ou de vos études. Quels sont vos projets pour l'avenir ?",
    duration: "2 min"
  },
  {
    id: 2,
    title: "Tâche 2 - Interaction (Jeu de rôle)",
    promptText: "Je suis propriétaire d'un appartement que vous souhaitez louer. Posez-moi des questions pour obtenir des informations sur le logement (prix, charges, quartier, équipements).",
    duration: "3 min 30 s"
  },
  {
    id: 3,
    title: "Tâche 3 - Expression d'un point de vue",
    promptText: "Le gouvernement de votre pays envisage d'interdire les téléphones portables dans tous les établissements scolaires (écoles, collèges, lycées). Êtes-vous pour ou contre cette mesure ? Argumentez votre réponse.",
    duration: "4 min 30 s"
  }
];
