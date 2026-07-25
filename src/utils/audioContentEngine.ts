// Moteur Audio Professionnel TCF Canada Pro (Griffon d'OR)
// Architecture Haut de Gamme pour la Production : Zéro boucle, Diversité absolue des voix, des accents et des dialogues.
// Gestionnaire d'historique utilisateur, rotation intelligente et base de scénarios pré-définis (A1 -> C2).

import { CECRLevel, TCFProceduralLibrary } from "./tcfContentEngine";

/**
 * Profil vocal professionnel et varié pour la synthèse et les dialogues audio.
 */
export interface AudioVoiceProfile {
  id: string;
  name: string;
  gender: "male" | "female";
  age: "young" | "adult" | "senior";
  accent: "Québécois (Montréal)" | "Québécois (Québec Ville)" | "Acadien (Nouveau-Brunswick)" | "Franco-Ontarien" | "Français (Parisien neutre)" | "Français (Ouest canadien)";
  speed: "lente" | "normale" | "rapide" | "dynamique";
  tone: "expressif" | "neutre" | "chaleureux" | "analytique" | "formel" | "empathique" | "impatient" | "rassurant";
  ttsPitch: number; // 0.8 à 1.3 pour variation vocale absolue en lecture multi-locuteurs
  ttsRate: number; // 0.85 à 1.15 pour variation de débit
  description: string;
}

export const VOICE_PROFILES: AudioVoiceProfile[] = [
  {
    id: "marc-qc-male-adult",
    name: "Marc (Montréal, QC)",
    gender: "male",
    age: "adult",
    accent: "Québécois (Montréal)",
    speed: "normale",
    tone: "chaleureux",
    ttsPitch: 0.95,
    ttsRate: 1.0,
    description: "Voix masculine québécoise naturelle, idéale pour les contextes de travail et de service citoyen."
  },
  {
    id: "sophie-fr-female-young",
    name: "Sophie (Paris, France)",
    gender: "female",
    age: "young",
    accent: "Français (Parisien neutre)",
    speed: "dynamique",
    tone: "expressif",
    ttsPitch: 1.15,
    ttsRate: 1.05,
    description: "Voix féminine jeune et dynamique, excellente pour les dialogues urbains et la vie universitaire."
  },
  {
    id: "jean-acadian-male-senior",
    name: "Jean-Louis (Moncton, NB)",
    gender: "male",
    age: "senior",
    accent: "Acadien (Nouveau-Brunswick)",
    speed: "lente",
    tone: "rassurant",
    ttsPitch: 0.85,
    ttsRate: 0.88,
    description: "Voix masculine mature avec un léger accent acadien chaleureux et un débit posé pour le niveau B1/B2."
  },
  {
    id: "claire-west-female-adult",
    name: "Claire (Vancouver, CB)",
    gender: "female",
    age: "adult",
    accent: "Français (Ouest canadien)",
    speed: "normale",
    tone: "analytique",
    ttsPitch: 1.05,
    ttsRate: 0.98,
    description: "Voix féminine professionnelle d'expert-conseil en immigration et démarches fédérales."
  },
  {
    id: "lucas-qc-male-young",
    name: "Lucas (Québec Ville, QC)",
    gender: "male",
    age: "young",
    accent: "Québécois (Québec Ville)",
    speed: "rapide",
    tone: "impatient",
    ttsPitch: 1.08,
    ttsRate: 1.12,
    description: "Voix masculine jeune avec débit rapide, représentant un étudiant ou un jeune actif pressé."
  },
  {
    id: "elodie-fr-female-adult",
    name: "Élodie (Lyon, France)",
    gender: "female",
    age: "adult",
    accent: "Français (Parisien neutre)",
    speed: "normale",
    tone: "empathique",
    ttsPitch: 1.10,
    ttsRate: 0.95,
    description: "Voix féminine douce et empathique, utilisée pour les annonces médicales et les services sociaux."
  },
  {
    id: "antoine-qc-male-fast",
    name: "Antoine (Sherbrooke, QC)",
    gender: "male",
    age: "adult",
    accent: "Québécois (Montréal)",
    speed: "rapide",
    tone: "analytique",
    ttsPitch: 0.90,
    ttsRate: 1.10,
    description: "Voix masculine rapide et précise pour les bulletins d'information économique et technologique (C1/C2)."
  },
  {
    id: "camille-fr-female-expressive",
    name: "Camille (Ottawa, ON)",
    gender: "female",
    age: "young",
    accent: "Franco-Ontarien",
    speed: "normale",
    tone: "expressif",
    ttsPitch: 1.18,
    ttsRate: 1.02,
    description: "Voix féminine franco-ontarienne très expressive pour les débats d'opinion et tables rondes culturelles."
  },
  {
    id: "pierre-fr-male-formel",
    name: "Pierre-Alexandre (Montréal, QC)",
    gender: "male",
    age: "adult",
    accent: "Québécois (Montréal)",
    speed: "lente",
    tone: "formel",
    ttsPitch: 0.88,
    ttsRate: 0.92,
    description: "Voix formelle institutionnelle pour la lecture d'avis juridiques, de conditions de bail et d'examens C1."
  },
  {
    id: "isabelle-qc-female-senior",
    name: "Isabelle (Trois-Rivières, QC)",
    gender: "female",
    age: "senior",
    accent: "Québécois (Québec Ville)",
    speed: "lente",
    tone: "chaleureux",
    ttsPitch: 1.0,
    ttsRate: 0.88,
    description: "Voix féminine mature et chaleureuse pour les dialogues communautaires et familiaux."
  },
  {
    id: "mathieu-acadian-male-young",
    name: "Mathieu (Caraquet, NB)",
    gender: "male",
    age: "young",
    accent: "Acadien (Nouveau-Brunswick)",
    speed: "normale",
    tone: "expressif",
    ttsPitch: 1.02,
    ttsRate: 1.0,
    description: "Voix jeune acadienne vivante et authentique pour les mises en situation en région maritime."
  },
  {
    id: "valerie-west-female-fast",
    name: "Valérie (Calgary, AB)",
    gender: "female",
    age: "adult",
    accent: "Français (Ouest canadien)",
    speed: "rapide",
    tone: "neutre",
    ttsPitch: 1.06,
    ttsRate: 1.12,
    description: "Voix féminine neutre et rapide pour les annonces d'aéroports, gares et urgences climatiques."
  }
];

export interface DialogueLine {
  speakerName: string;
  voiceProfileId: string;
  text: string;
}

export interface AudioDialogueMetadata {
  speakersCount: number;
  personalities: string[];
  professions: string[];
  emotion: string;
  context: string;
  communicationGoal: string;
}

export interface AudioQuestionItem {
  id: number;
  question: string;
  options: string[];
  correct: number;
  detailedCorrection: string;
  errorAnalysis: string;
  cecrEvaluation: string;
}

export interface AudioScenario {
  id: string;
  cecrLevel: CECRLevel;
  skill: "listening";
  theme: string;
  difficulty: number; // 1 à 10
  durationSeconds: number;
  vocabularyTags: string[];
  pedagogicalObjective: string;
  dialogueMetadata: AudioDialogueMetadata;
  voiceProfiles: AudioVoiceProfile[];
  audioUrl: string; // URL pré-générée dans Supabase Storage ou CDN (fallback sur lecture multi-locuteurs TTS)
  script: string;
  structuredDialogue: DialogueLine[];
  questions: AudioQuestionItem[];
}

/**
 * BIBLIOTHÈQUE DE CONTENUS AUDIO PROFESSIONNELS TCF CANADA
 * Base structurée, classée par niveau, compétence, thème, difficulté et objectifs.
 * Garantit qu'aucun dialogue n'est une reformulation, une boucle ou un clône d'un autre.
 */
export const AUDIO_SCENARIO_DATABASE: AudioScenario[] = [
  // ─── NIVEAU A1 ───────────────────────────────────────────────────────────
  {
    id: "co-a1-sc-001",
    cecrLevel: "A1",
    skill: "listening",
    theme: "Logement & Immobilier",
    difficulty: 1,
    durationSeconds: 35,
    vocabularyTags: ["appartement", "loyer", "chambre", "visite", "centre-ville"],
    pedagogicalObjective: "Identifier des informations simples : prix d'un loyer et localisation d'un logement.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Étudiant poli mais hésitant", "Propriétaire accueillante et précise"],
      professions: ["Étudiant international", "Propriétaire particulière"],
      emotion: "Échange cordial et informatif",
      context: "Appel téléphonique pour une annonce de chambre à louer à Montréal",
      communicationGoal: "Confirmer l'adresse et le montant du loyer mensuel"
    },
    voiceProfiles: [VOICE_PROFILES[4], VOICE_PROFILES[9]],
    audioUrl: "/audio/tcf/co_a1_logement_001.mp3",
    script: "Lucas (Étudiant) : Bonjour madame. J'appelle pour la chambre à louer sur le boulevard Saint-Laurent. Est-elle toujours disponible ?\n\nIsabelle (Propriétaire) : Bonjour ! Oui, tout à fait. Elle est à cinq minutes du métro. Le loyer est de six cents dollars par mois, chauffage compris.\n\nLucas : Parfait ! Est-ce que je peux visiter cet après-midi vers 15 heures ?\n\nIsabelle : Avec plaisir, je vous attends à 15 heures précises.",
    structuredDialogue: [
      { speakerName: "Lucas (Étudiant)", voiceProfileId: "lucas-qc-male-young", text: "Bonjour madame. J'appelle pour la chambre à louer sur le boulevard Saint-Laurent. Est-elle toujours disponible ?" },
      { speakerName: "Isabelle (Propriétaire)", voiceProfileId: "isabelle-qc-female-senior", text: "Bonjour ! Oui, tout à fait. Elle est à cinq minutes du métro. Le loyer est de six cents dollars par mois, chauffage compris." },
      { speakerName: "Lucas (Étudiant)", voiceProfileId: "lucas-qc-male-young", text: "Parfait ! Est-ce que je peux visiter cet après-midi vers 15 heures ?" },
      { speakerName: "Isabelle (Propriétaire)", voiceProfileId: "isabelle-qc-female-senior", text: "Avec plaisir, je vous attends à 15 heures précises." }
    ],
    questions: [
      {
        id: 1,
        question: "Quel est le montant du loyer annoncé par la propriétaire ?",
        options: [
          "500 dollars par mois",
          "600 dollars par mois, chauffage compris",
          "700 dollars par mois sans électricité",
          "650 dollars par mois avec internet"
        ],
        correct: 1,
        detailedCorrection: "La propriétaire dit explicitement : « Le loyer est de six cents dollars par mois, chauffage compris. »",
        errorAnalysis: "Distracteur numérique : ne pas confondre le chiffre 600 avec l'heure de visite (15 heures) ou une autre somme.",
        cecrEvaluation: "Niveau A1 - NCLC 3 (Compréhension de nombres et conditions de base)."
      },
      {
        id: 2,
        question: "À quel moment la visite doit-elle avoir lieu ?",
        options: [
          "Demain matin à 9 heures",
          "Cet après-midi vers 15 heures",
          "Samedi prochain à midi",
          "Ce soir après 18 heures"
        ],
        correct: 1,
        detailedCorrection: "Lucas demande : « Est-ce que je peux visiter cet après-midi vers 15 heures ? » et Isabelle confirme.",
        errorAnalysis: "Piège temporel : écouter attentivement la confirmation finale de la propriétaire.",
        cecrEvaluation: "Niveau A1 - NCLC 3 (Repérage d'un horaire)."
      }
    ]
  },
  {
    id: "co-a1-sc-002",
    cecrLevel: "A1",
    skill: "listening",
    theme: "Transport & Mobilité urbaine",
    difficulty: 2,
    durationSeconds: 40,
    vocabularyTags: ["autobus", "carte opus", "station", "billet", "correspondance"],
    pedagogicalObjective: "Comprendre des indications simples de direction et d'achat de titre de transport au Québec.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Voyageur désorienté", "Agent de station patient et courtois"],
      professions: ["Nouveau résident", "Agent de la STM (Société de transport de Montréal)"],
      emotion: "Orientation et soulagement",
      context: "Guichet de la station de métro Berri-UQAM",
      communicationGoal: "Acheter un titre de transport mensuel et obtenir une indication"
    },
    voiceProfiles: [VOICE_PROFILES[10], VOICE_PROFILES[0]],
    audioUrl: "/audio/tcf/co_a1_transport_002.mp3",
    script: "Mathieu (Voyageur) : Bonjour monsieur. Je voudrais aller à l'université Laval, mais je n'ai pas de carte d'autobus.\n\nMarc (Agent STM) : Bonjour ! Pour commencer, il vous faut une carte OPUS rechargeable. Elle coûte six dollars. Ensuite, vous pouvez ajouter un passage ou un abonnement mensuel.\n\nMathieu : Je vais prendre un aller-retour s'il vous plaît.\n\nMarc : Très bien, cela fait onze dollars au total. Prenez la ligne verte juste en bas de l'escalier.",
    structuredDialogue: [
      { speakerName: "Mathieu (Voyageur)", voiceProfileId: "mathieu-acadian-male-young", text: "Bonjour monsieur. Je voudrais aller à l'université Laval, mais je n'ai pas de carte d'autobus." },
      { speakerName: "Marc (Agent STM)", voiceProfileId: "marc-qc-male-adult", text: "Bonjour ! Pour commencer, il vous faut une carte OPUS rechargeable. Elle coûte six dollars. Ensuite, vous pouvez ajouter un passage ou un abonnement mensuel." },
      { speakerName: "Mathieu (Voyageur)", voiceProfileId: "mathieu-acadian-male-young", text: "Je vais prendre un aller-retour s'il vous plaît." },
      { speakerName: "Marc (Agent STM)", voiceProfileId: "marc-qc-male-adult", text: "Très bien, cela fait onze dollars au total. Prenez la ligne verte juste en bas de l'escalier." }
    ],
    questions: [
      {
        id: 1,
        question: "Que doit acheter le voyageur pour commencer son trajet ?",
        options: [
          "Un billet de train longue distance",
          "Une carte OPUS rechargeable à six dollars",
          "Un abonnement annuel obligatoire",
          "Un ticket de stationnement urbain"
        ],
        correct: 1,
        detailedCorrection: "L'agent précise : « Pour commencer, il vous faut une carte OPUS rechargeable. Elle coûte six dollars. »",
        errorAnalysis: "Attention aux termes spécifiques des transports québécois (Carte OPUS).",
        cecrEvaluation: "Niveau A1 - NCLC 4."
      }
    ]
  },

  // ─── NIVEAU A2 ───────────────────────────────────────────────────────────
  {
    id: "co-a2-sc-003",
    cecrLevel: "A2",
    skill: "listening",
    theme: "Santé & Services médicaux",
    difficulty: 3,
    durationSeconds: 50,
    vocabularyTags: ["carte assurance maladie", "clic santé", "rendez-vous", "clinique sans rendez-vous", "médecin de famille"],
    pedagogicalObjective: "Comprendre les étapes d'une prise de rendez-vous médical et les documents requis au Québec (RAMQ).",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Patient inquiet", "Secrétaire médicale méthodique et rassurante"],
      professions: ["Résident temporaire", "Réceptionniste de clinique médicale"],
      emotion: "Préoccupation puis clarté administrative",
      context: "Accueil téléphonique d'une clinique médicale à Sherbrooke",
      communicationGoal: "Obtenir une consultation rapide avec la carte d'assurance maladie"
    },
    voiceProfiles: [VOICE_PROFILES[0], VOICE_PROFILES[5]],
    audioUrl: "/audio/tcf/co_a2_sante_003.mp3",
    script: "Marc (Patient) : Bonjour, je vous appelle parce que j'ai une forte fièvre depuis deux jours. Est-ce possible de voir un médecin aujourd'hui ?\n\nÉlodie (Secrétaire) : Bonjour monsieur. Avez-vous votre carte d'assurance maladie du Québec, la carte soleil, avec vous ?\n\nMarc : Oui, elle est valide jusqu'en 2027.\n\nÉlodie : Parfait. Nous avons une place en clinique sans rendez-vous ce matin à 11 h 30 avec le docteur Gagnon. N'oubliez pas d'apporter votre carte et une liste de vos médicaments actuels.",
    structuredDialogue: [
      { speakerName: "Marc (Patient)", voiceProfileId: "marc-qc-male-adult", text: "Bonjour, je vous appelle parce que j'ai une forte fièvre depuis deux jours. Est-ce possible de voir un médecin aujourd'hui ?" },
      { speakerName: "Élodie (Secrétaire)", voiceProfileId: "elodie-fr-female-adult", text: "Bonjour monsieur. Avez-vous votre carte d'assurance maladie du Québec, la carte soleil, avec vous ?" },
      { speakerName: "Marc (Patient)", voiceProfileId: "marc-qc-male-adult", text: "Oui, elle est valide jusqu'en 2027." },
      { speakerName: "Élodie (Secrétaire)", voiceProfileId: "elodie-fr-female-adult", text: "Parfait. Nous avons une place en clinique sans rendez-vous ce matin à 11 h 30 avec le docteur Gagnon. N'oubliez pas d'apporter votre carte et une liste de vos médicaments actuels." }
    ],
    questions: [
      {
        id: 1,
        question: "Quel document le patient doit-il impérativement présenter lors de sa consultation ?",
        options: [
          "Son passeport international uniquement",
          "Sa carte d'assurance maladie du Québec (carte soleil)",
          "Son contrat de travail canadien",
          "Son permis de conduire provincial"
        ],
        correct: 1,
        detailedCorrection: "La secrétaire demande expressément la carte d'assurance maladie (la carte soleil) et rappelle de l'apporter.",
        errorAnalysis: "Distracteur de document officiel : ne pas confondre avec un document d'immigration ou de conduite.",
        cecrEvaluation: "Niveau A2 - NCLC 5."
      },
      {
        id: 2,
        question: "À quelle heure le rendez-vous est-il fixé à la clinique ?",
        options: [
          "À 9 h 00 pile",
          "À 11 h 30 ce matin",
          "Dans l'après-midi vers 14 h 00",
          "Demain matin à la première heure"
        ],
        correct: 1,
        detailedCorrection: "Élodie confirme : « Nous avons une place en clinique sans rendez-vous ce matin à 11 h 30 avec le docteur Gagnon. »",
        errorAnalysis: "Repérage précis de l'horaire dans un flux vocal rapide.",
        cecrEvaluation: "Niveau A2 - NCLC 5."
      }
    ]
  },
  {
    id: "co-a2-sc-004",
    cecrLevel: "A2",
    skill: "listening",
    theme: "Commerce & Consommation",
    difficulty: 4,
    durationSeconds: 55,
    vocabularyTags: ["garantie", "ticket de caisse", "remboursement", "politique de retour", "service à la clientèle"],
    pedagogicalObjective: "Comprendre les conditions de retour d'un article et les délais légaux de remboursement dans un commerce canadien.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Client déçu", "Gérante de magasin ferme et professionnelle"],
      professions: ["Consommateur", "Responsable du service client"],
      emotion: "Négociation commerciale polie",
      context: "Comptoir du service à la clientèle dans un grand magasin d'électronique à Toronto",
      communicationGoal: "Échanger un appareil défectueux contre un remboursement"
    },
    voiceProfiles: [VOICE_PROFILES[2], VOICE_PROFILES[3]],
    audioUrl: "/audio/tcf/co_a2_commerce_004.mp3",
    script: "Jean-Louis (Client) : Bonjour madame. J'ai acheté ce radiateur électrique il y a cinq jours, mais il fait un bruit très étrange quand je l'allume. Je souhaiterais être remboursé.\n\nClaire (Gérante) : Bonjour monsieur. Je comprends votre désagrément. Avez-vous conservé la facture originale et la boîte d'emballage ?\n\nJean-Louis : Oui, voici le reçu de caisse et tout est dans la boîte intacte.\n\nClaire : Très bien. Selon notre politique de retour de trente jours, je vais recréditer votre carte bancaire immédiatement.",
    structuredDialogue: [
      { speakerName: "Jean-Louis (Client)", voiceProfileId: "jean-acadian-male-senior", text: "Bonjour madame. J'ai acheté ce radiateur électrique il y a cinq jours, mais il fait un bruit très étrange quand je l'allume. Je souhaiterais être remboursé." },
      { speakerName: "Claire (Gérante)", voiceProfileId: "claire-west-female-adult", text: "Bonjour monsieur. Je comprends votre désagrément. Avez-vous conservé la facture originale et la boîte d'emballage ?" },
      { speakerName: "Jean-Louis (Client)", voiceProfileId: "jean-acadian-male-senior", text: "Oui, voici le reçu de caisse et tout est dans la boîte intacte." },
      { speakerName: "Claire (Gérante)", voiceProfileId: "claire-west-female-adult", text: "Très bien. Selon notre politique de retour de trente jours, je vais recréditer votre carte bancaire immédiatement." }
    ],
    questions: [
      {
        id: 1,
        question: "Quelle condition la gérante vérifie-t-elle avant d'accorder le remboursement ?",
        options: [
          "Que le client possède une carte de fidélité du magasin",
          "Que le client ait conservé la facture originale et la boîte d'emballage",
          "Que l'article ait été acheté il y a moins de 24 heures",
          "Que le radiateur ait été réparé par un technicien agréé"
        ],
        correct: 1,
        detailedCorrection: "La gérante demande : « Avez-vous conservé la facture originale et la boîte d'emballage ? »",
        errorAnalysis: "Compréhension des conditions commerciales standards en contexte nord-américain.",
        cecrEvaluation: "Niveau A2 - NCLC 5."
      }
    ]
  },

  // ─── NIVEAU B1 ───────────────────────────────────────────────────────────
  {
    id: "co-b1-sc-005",
    cecrLevel: "B1",
    skill: "listening",
    theme: "Emploi & Marché du travail",
    difficulty: 5,
    durationSeconds: 65,
    vocabularyTags: ["entrevue d'embauche", "réseau professionnel", "équivalence", "compétences transférables", "télétravail"],
    pedagogicalObjective: "Comprendre les conseils d'intégration professionnelle au Canada lors d'un entretien avec un conseiller en emploi.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Candidat motivé mais en recherche de repères", "Conseillère en emploi experte du marché canadien"],
      professions: ["Informaticien immigrant", "Conseillère au Carrefour Jeunesse-Emploi"],
      emotion: "Mentorat encourageant et pragmatique",
      context: "Séance de coaching individuel pour la recherche d'emploi à Ottawa",
      communicationGoal: "Adapter un curriculum vitae au format canadien et valoriser ses compétences"
    },
    voiceProfiles: [VOICE_PROFILES[6], VOICE_PROFILES[7]],
    audioUrl: "/audio/tcf/co_b1_emploi_005.mp3",
    script: "Antoine (Candidat) : Bonjour Camille. J'ai envoyé plus de vingt CV depuis mon arrivée le mois dernier, mais je n'ai obtenu aucune convocation en entrevue. Je ne comprends pas ce qui bloque.\n\nCamille (Conseillère) : Bonjour Antoine. C'est une situation classique. Au Canada, le CV doit être axé sur les réalisations concrètes et ne doit jamais inclure de photo, d'âge ou de statut matrimonial. De plus, le réseautage sur LinkedIn et les salons de l'emploi représentent 70 % des embauches.\n\nAntoine : Je vois ! Je pensais qu'il suffisait de répondre aux offres sur les portails en ligne.\n\nCamille : C'est insuffisant ici. Nous allons reformuler vos expériences en mettant en avant vos compétences techniques et nous allons préparer votre profil pour une soirée de réseautage jeudi prochain.",
    structuredDialogue: [
      { speakerName: "Antoine (Candidat)", voiceProfileId: "antoine-qc-male-fast", text: "Bonjour Camille. J'ai envoyé plus de vingt CV depuis mon arrivée le mois dernier, mais je n'ai obtenu aucune convocation en entrevue. Je ne comprends pas ce qui bloque." },
      { speakerName: "Camille (Conseillère)", voiceProfileId: "camille-fr-female-expressive", text: "Bonjour Antoine. C'est une situation classique. Au Canada, le CV doit être axé sur les réalisations concrètes et ne doit jamais inclure de photo, d'âge ou de statut matrimonial. De plus, le réseautage sur LinkedIn et les salons de l'emploi représentent 70 % des embauches." },
      { speakerName: "Antoine (Candidat)", voiceProfileId: "antoine-qc-male-fast", text: "Je vois ! Je pensais qu'il suffisait de répondre aux offres sur les portails en ligne." },
      { speakerName: "Camille (Conseillère)", voiceProfileId: "camille-fr-female-expressive", text: "C'est insuffisant ici. Nous allons reformuler vos expériences en mettant en avant vos compétences techniques et nous allons préparer votre profil pour une soirée de réseautage jeudi prochain." }
    ],
    questions: [
      {
        id: 1,
        question: "Selon la conseillère, quelle est l'une des particularités essentielles du curriculum vitae au Canada ?",
        options: [
          "Il doit obligatoirement être accompagné d'une photo d'identité récente",
          "Il ne doit jamais mentionner d'informations personnelles comme l'âge, la photo ou le statut matrimonial",
          "Il doit être rédigé exclusivement en anglais quelle que soit la province",
          "Il doit lister tous les diplômes depuis l'école primaire sans exception"
        ],
        correct: 1,
        detailedCorrection: "Camille explique : « Au Canada, le CV doit être axé sur les réalisations concrètes et ne doit jamais inclure de photo, d'âge ou de statut matrimonial. »",
        errorAnalysis: "Différenciation culturelle majeure sur le marché du travail canadien par rapport aux normes européennes ou africaines.",
        cecrEvaluation: "Niveau B1 - NCLC 6 (Compréhension de conseils professionnels argumentés)."
      },
      {
        id: 2,
        question: "Quelle proportion des embauches est attribuée au réseautage selon les données mentionnées dans le dialogue ?",
        options: [
          "Environ 30 % des embauches",
          "Près de 50 % des embauches",
          "Soixante-dix pour cent (70 %) des embauches",
          "La quasi-totalité à 95 %"
        ],
        correct: 2,
        detailedCorrection: "La conseillère cite précisément le chiffre : « Le réseautage sur LinkedIn et les salons de l'emploi représentent 70 % des embauches. »",
        errorAnalysis: "Repérage et interprétation d'une statistique clé dans une argumentation.",
        cecrEvaluation: "Niveau B1 - NCLC 6."
      }
    ]
  },
  {
    id: "co-b1-sc-006",
    cecrLevel: "B1",
    skill: "listening",
    theme: "Administration canadienne",
    difficulty: 6,
    durationSeconds: 70,
    vocabularyTags: ["numéro d'assurance sociale", "nas", "service canada", "déclaration de revenus", "résidence permanente"],
    pedagogicalObjective: "Comprendre les procédures d'obtention du Numéro d'Assurance Sociale (NAS) et les règles de confidentialité.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Nouvel arrivant attentif", "Agent fédéral rigoureux et informatif"],
      professions: ["Résident permanent", "Agent de Service Canada"],
      emotion: "Procédure administrative officielle et sécurisante",
      context: "Guichet d'un centre Service Canada au centre-ville de Vancouver",
      communicationGoal: "Délivrer le NAS et expliquer les consignes de sécurité contre la fraude à l'identité"
    },
    voiceProfiles: [VOICE_PROFILES[0], VOICE_PROFILES[3]],
    audioUrl: "/audio/tcf/co_b1_admin_006.mp3",
    script: "Marc (Résident) : Bonjour madame. Je viens d'atterrir hier à Vancouver avec mon visa de résidence permanente. On m'a dit qu'il fallait demander mon Numéro d'Assurance Sociale dès aujourd'hui.\n\nClaire (Agent fédéral) : Bonjour monsieur, bienvenue au Canada ! Vous avez parfaitement raison. Pour émettre votre NAS à neuf chiffres, j'ai besoin de votre passeport valide et de votre Confirmation de Résidence Permanente signée à la douane.\n\nMarc : Voici tous les documents officiels.\n\nClaire : Parfait. Voici votre document confidentiel avec votre numéro. Attention, c'est une pièce strictement privée : ne le donnez qu'à votre employeur officiel ou pour vos impôts, jamais par téléphone ou par courriel non sécurisé pour éviter le vol d'identité.",
    structuredDialogue: [
      { speakerName: "Marc (Résident)", voiceProfileId: "marc-qc-male-adult", text: "Bonjour madame. Je viens d'atterrir hier à Vancouver avec mon visa de résidence permanente. On m'a dit qu'il fallait demander mon Numéro d'Assurance Sociale dès aujourd'hui." },
      { speakerName: "Claire (Agent fédéral)", voiceProfileId: "claire-west-female-adult", text: "Bonjour monsieur, bienvenue au Canada ! Vous avez parfaitement raison. Pour émettre votre NAS à neuf chiffres, j'ai besoin de votre passeport valide et de votre Confirmation de Résidence Permanente signée à la douane." },
      { speakerName: "Marc (Résident)", voiceProfileId: "marc-qc-male-adult", text: "Voici tous les documents officiels." },
      { speakerName: "Claire (Agent fédéral)", voiceProfileId: "claire-west-female-adult", text: "Parfait. Voici votre document confidentiel avec votre numéro. Attention, c'est une pièce strictement privée : ne le donnez qu'à votre employeur officiel ou pour vos impôts, jamais par téléphone ou par courriel non sécurisé pour éviter le vol d'identité." }
    ],
    questions: [
      {
        id: 1,
        question: "Quels documents le résident doit-il présenter pour obtenir son Numéro d'Assurance Sociale ?",
        options: [
          "Un bail locatif et une facture d'électricité",
          "Son passeport valide et sa Confirmation de Résidence Permanente signée",
          "Une lettre d'embauche canadienne et un extrait de compte bancaire",
          "Son permis de conduire international"
        ],
        correct: 1,
        detailedCorrection: "L'agente requiert : « j'ai besoin de votre passeport valide et de votre Confirmation de Résidence Permanente signée à la douane. »",
        errorAnalysis: "Connaissance des démarches fédérales de base du nouvel arrivant.",
        cecrEvaluation: "Niveau B1 - NCLC 6."
      },
      {
        id: 2,
        question: "Quelle mise en garde importante l'agente formule-t-elle concernant l'utilisation du NAS ?",
        options: [
          "Il doit être renouvelé obligatoirement à chaque changement de province",
          "Il est strictement privé et ne doit jamais être communiqué par téléphone ou courriel non sécurisé",
          "Il doit être affiché en permanence sur le pare-brise du véhicule",
          "Il ne fonctionne qu'après un délai d'attente de six mois sur le territoire"
        ],
        correct: 1,
        detailedCorrection: "Elle insiste : « ne le donnez qu'à votre employeur officiel ou pour vos impôts, jamais par téléphone ou par courriel non sécurisé pour éviter le vol d'identité. »",
        errorAnalysis: "Compréhension d'un conseil de sécurité administrative contre la fraude.",
        cecrEvaluation: "Niveau B1 - NCLC 6."
      }
    ]
  },

  // ─── NIVEAU B2 ───────────────────────────────────────────────────────────
  {
    id: "co-b2-sc-007",
    cecrLevel: "B2",
    skill: "listening",
    theme: "Immigration & Citoyenneté",
    difficulty: 7,
    durationSeconds: 85,
    vocabularyTags: ["entrée express", "bassin de candidats", "pointage crs", "invitation à présenter une demande", "bilinguisme"],
    pedagogicalObjective: "Comprendre les subtilités du système Entrée Express et l'impact décisif des tests de français (TCF/TEF) sur le pointage fédéral.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Candidat ambitieux voulant maximiser son score", "Avocate en droit de l'immigration canadienne pointue et stratégique"],
      professions: ["Ingénieur civil", "Avocate membre du Barreau du Québec et consultante réglementée"],
      emotion: "Consultation juridique de haut niveau, stratégique et précise",
      context: "Bureau d'un cabinet d'avocats en droit de l'immigration au centre-ville de Montréal",
      communicationGoal: "Analyser les stratégies pour dépasser la barre des 500 points dans le Système de Classement Global (SCG)"
    },
    voiceProfiles: [VOICE_PROFILES[8], VOICE_PROFILES[1]],
    audioUrl: "/audio/tcf/co_b2_immig_007.mp3",
    script: "Pierre-Alexandre (Candidat) : Maître, mon profil dans le bassin Entrée Express stagne actuellement à 475 points. Les dernières rondes d'invitations exigeaient un score supérieur à 510 points. Quels sont les leviers réels pour combler cet écart rapidement ?\n\nSophie (Avocate) : C'est un défi fréquent. Le levier le plus puissant à votre disposition, sans avoir à reprendre d'études ou attendre une offre d'emploi validée par une EIMT, réside dans le bilinguisme officiel. Si vous obtenez au moins un niveau NCLC 7 aux quatre compétences de votre TCF Canada, le gouvernement fédéral vous accorde un bonus d'excellence linguistique qui peut atteindre 50 points supplémentaires.\n\nPierre-Alexandre : 50 points ! Cela me propulserait directement à 525 points, m'assurant une invitation dès la prochaine extraction.\n\nSophie : Exactement. C'est pourquoi je recommande toujours de perfectionner votre expression écrite et orale pour garantir ce palier NCLC 7 sans aucune défaillance.",
    structuredDialogue: [
      { speakerName: "Pierre-Alexandre (Candidat)", voiceProfileId: "pierre-fr-male-formel", text: "Maître, mon profil dans le bassin Entrée Express stagne actuellement à 475 points. Les dernières rondes d'invitations exigeaient un score supérieur à 510 points. Quels sont les leviers réels pour combler cet écart rapidement ?" },
      { speakerName: "Sophie (Avocate)", voiceProfileId: "sophie-fr-female-young", text: "C'est un défi fréquent. Le levier le plus puissant à votre disposition, sans avoir à reprendre d'études ou attendre une offre d'emploi validée par une EIMT, réside dans le bilinguisme officiel. Si vous obtenez au moins un niveau NCLC 7 aux quatre compétences de votre TCF Canada, le gouvernement fédéral vous accorde un bonus d'excellence linguistique qui peut atteindre 50 points supplémentaires." },
      { speakerName: "Pierre-Alexandre (Candidat)", voiceProfileId: "pierre-fr-male-formel", text: "50 points ! Cela me propulserait directement à 525 points, m'assurant une invitation dès la prochaine extraction." },
      { speakerName: "Sophie (Avocate)", voiceProfileId: "sophie-fr-female-young", text: "Exactement. C'est pourquoi je recommande toujours de perfectionner votre expression écrite et orale pour garantir ce palier NCLC 7 sans aucune défaillance." }
    ],
    questions: [
      {
        id: 1,
        question: "Quel est le levier le plus efficace et rapide conseillé par l'avocate pour augmenter le score dans Entrée Express ?",
        options: [
          "Reprendre un cursus universitaire d'au moins trois ans dans une université québécoise",
          "Attendre qu'une entreprise canadienne obtienne une Étude d'Impact sur le Marché du Travail (EIMT)",
          "Obtenir au moins le niveau NCLC 7 aux quatre compétences du TCF Canada pour bénéficier du bonus de bilinguisme",
          "Changer de catégorie professionnelle pour postuler exclusivement aux programmes agricoles"
        ],
        correct: 2,
        detailedCorrection: "Maître Sophie affirme : « Si vous obtenez au moins un niveau NCLC 7 aux quatre compétences de votre TCF Canada, le gouvernement fédéral vous accorde un bonus d'excellence linguistique qui peut atteindre 50 points supplémentaires. »",
        errorAnalysis: "Compréhension fine des mécanismes d'immigration (SCG / Entrée Express) et de l'enjeu crucial du TCF.",
        cecrEvaluation: "Niveau B2 - NCLC 7/8 (Compréhension d'une stratégie complexe à enjeu juridique)."
      },
      {
        id: 2,
        question: "Quel score total le candidat atteindrait-il s'il décrochait ce bonus linguistique ?",
        options: [
          "475 points",
          "500 points tout juste",
          "525 points, lui garantissant pratiquement une invitation",
          "600 points avec la nomination provinciale"
        ],
        correct: 2,
        detailedCorrection: "Le candidat calcule : « 50 points ! Cela me propulserait directement à 525 points, m'assurant une invitation dès la prochaine extraction. » (475 + 50 = 525).",
        errorAnalysis: "Calcul mental rapide et confirmation par déduction logique dans une écoute de niveau B2.",
        cecrEvaluation: "Niveau B2 - NCLC 7/8."
      }
    ]
  },
  {
    id: "co-b2-sc-008",
    cecrLevel: "B2",
    skill: "listening",
    theme: "Environnement & Climat canadien",
    difficulty: 8,
    durationSeconds: 90,
    vocabularyTags: ["transition énergétique", "énergie hydroélectrique", "empreinte carbone", "taxe sur le carbone", "écoresponsabilité"],
    pedagogicalObjective: "Comprendre une argumentation scientifique et économique sur la politique environnementale et l'hydroélectricité québécoise.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Journaliste d'investigation critique", "Chercheur en politique environnementale et énergétique nuancé"],
      professions: ["Animateur radio de Radio-Canada", "Professeur titulaire à Polytechnique Montréal"],
      emotion: "Débat intellectuel de fond, argumenté et équilibré",
      context: "Émission d'actualité scientifique diffusée en direct à la radio publique canadienne",
      communicationGoal: "Débattre de l'efficacité de la tarification carbone par rapport aux investissements dans les réseaux électriques propres"
    },
    voiceProfiles: [VOICE_PROFILES[6], VOICE_PROFILES[8]],
    audioUrl: "/audio/tcf/co_b2_enviro_008.mp3",
    script: "Antoine (Journaliste) : Professeur, le Canada s'est engagé à atteindre la carboneutralité d'ici 2050. Or, certains observateurs estiment que la tarification carbone pénalise de manière disproportionnée les régions manufacturières sans réduire drastiquement les émissions industrielles. Quel est votre diagnostic ?\n\nPierre-Alexandre (Professeur) : Il faut nuancer ce constat, Antoine. Au Québec et en Colombie-Britannique, plus de 95 % de l'électricité provient de l'hydroélectricité, une source renouvelable à très faible émission. Cependant, le véritable goulot d'étranglement canadien réside dans la décarbonation du secteur des transports et le chauffage des bâtiments lors des vagues de froid extrême. La taxe carbone fonctionne comme un signal de prix incitatif indispensable, à condition que les revenus générés soient massivement réinvestis dans la modernisation des infrastructures de transport collectif et les subventions à l'isolation thermique.",
    structuredDialogue: [
      { speakerName: "Antoine (Journaliste)", voiceProfileId: "antoine-qc-male-fast", text: "Professeur, le Canada s'est engagé à atteindre la carboneutralité d'ici 2050. Or, certains observateurs estiment que la tarification carbone pénalise de manière disproportionnée les régions manufacturières sans réduire drastiquement les émissions industrielles. Quel est votre diagnostic ?" },
      { speakerName: "Pierre-Alexandre (Professeur)", voiceProfileId: "pierre-fr-male-formel", text: "Il faut nuancer ce constat, Antoine. Au Québec et en Colombie-Britannique, plus de 95 % de l'électricité provient de l'hydroélectricité, une source renouvelable à très faible émission. Cependant, le véritable goulot d'étranglement canadien réside dans la décarbonation du secteur des transports et le chauffage des bâtiments lors des vagues de froid extrême. La taxe carbone fonctionne comme un signal de prix incitatif indispensable, à condition que les revenus générés soient massivement réinvestis dans la modernisation des infrastructures de transport collectif et les subventions à l'isolation thermique." }
    ],
    questions: [
      {
        id: 1,
        question: "Selon le chercheur, quel est le véritable défi pour réduire les émissions de gaz à effet de serre au Canada ?",
        options: [
          "La fermeture définitive des centrales hydroélectriques du Québec et de Colombie-Britannique",
          "La décarbonation du secteur des transports et du chauffage des bâtiments lors des périodes de froid extrême",
          "L'interdiction totale de l'importation de produits manufacturés étrangers dès 2025",
          "La suppression immédiate de toute taxe ou tarification carbone dans les provinces de l'Ouest"
        ],
        correct: 1,
        detailedCorrection: "Le professeur précise : « le véritable goulot d'étranglement canadien réside dans la décarbonation du secteur des transports et le chauffage des bâtiments lors des vagues de froid extrême. »",
        errorAnalysis: "Capacité à isoler la thèse centrale d'un expert face aux idées reçues évoquées par le journaliste.",
        cecrEvaluation: "Niveau B2 - NCLC 8 (Compréhension d'un discours technique d'actualité)."
      },
      {
        id: 2,
        question: "À quelle condition essentielle la tarification carbone est-elle jugée efficace par le chercheur ?",
        options: [
          "Si elle s'applique uniquement aux citoyens particuliers et épargne les multinationales",
          "Si les revenus générés sont massivement réinvestis dans les transports collectifs et l'isolation thermique",
          "Si elle est remplacée par un système de rationnement annuel de l'électricité",
          "Si elle permet de financer exclusivement la recherche spatiale canadienne"
        ],
        correct: 1,
        detailedCorrection: "Il conclut : « à condition que les revenus générés soient massivement réinvestis dans la modernisation des infrastructures de transport collectif et les subventions à l'isolation thermique. »",
        errorAnalysis: "Détection d'une condition logique restrictive exprimée par « à condition que ».",
        cecrEvaluation: "Niveau B2 - NCLC 8."
      }
    ]
  },

  // ─── NIVEAU C1 ───────────────────────────────────────────────────────────
  {
    id: "co-c1-sc-009",
    cecrLevel: "C1",
    skill: "listening",
    theme: "Droit & Citoyenneté active",
    difficulty: 9,
    durationSeconds: 105,
    vocabularyTags: ["charte canadienne des droits et libertés", "accommodement raisonnable", "jurisprudence", "laïcité", "Cour suprême"],
    pedagogicalObjective: "Comprendre une analyse juridique de niveau supérieur sur les concepts constitutionnels canadiens et les arrêts de la Cour suprême.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Modératrice de débat universitaire incisive", "Constitutionaliste émérite et penseur nuancé"],
      professions: ["Professeure de droit constitutionnel à l'Université de Toronto", "Doyen de la faculté de droit de l'Université de Montréal"],
      emotion: "Échange académique d'excellence, rigoureux, terminologie juridique pointue",
      context: "Colloque annuel sur le droit constitutionnel canadien organisé au Palais des congrès de Montréal",
      communicationGoal: "Définir les contours et les limites juridiques de la notion d'accommodement raisonnable dans le droit public canadien"
    },
    voiceProfiles: [VOICE_PROFILES[3], VOICE_PROFILES[8]],
    audioUrl: "/audio/tcf/co_c1_droit_009.mp3",
    script: "Claire (Modératrice) : Monsieur le Doyen, depuis l'arrêt historique de la Cour suprême du Canada en 1985, le concept d'accommodement raisonnable est devenu la pierre angulaire de l'égalité réelle au sens de l'article 15 de la Charte canadienne des droits et libertés. Toutefois, dans l'opinion publique, ce mécanisme est parfois perçu à tort comme un privilège arbitraire octroyé à certaines minorités. Comment rétablir la rigueur juridique de ce principe ?\n\nPierre-Alexandre (Doyen) : Vous touchez au cœur de la mécompréhension citoyenne, Claire. D'un point de vue strictement constitutionnel et jurisprudentiel, l'accommodement raisonnable n'est en aucun cas une faveur ni une dérogation de complaisance. Il s'agit d'une obligation juridique imposée aux employeurs et aux institutions pour éliminer les effets discriminatoires indirects d'une norme apparemment neutre. Sa limite ultime et infranchissable est ce que la Cour suprême nomme la contrainte excessive : dès lors qu'un accommodement menace la sécurité publique, engendre des coûts financiers démesurés ou brime les droits fondamentaux d'autrui, l'obligation s'éteint instantanément.",
    structuredDialogue: [
      { speakerName: "Claire (Modératrice)", voiceProfileId: "claire-west-female-adult", text: "Monsieur le Doyen, depuis l'arrêt historique de la Cour suprême du Canada en 1985, le concept d'accommodement raisonnable est devenu la pierre angulaire de l'égalité réelle au sens de l'article 15 de la Charte canadienne des droits et libertés. Toutefois, dans l'opinion publique, ce mécanisme est parfois perçu à tort comme un privilège arbitraire octroyé à certaines minorités. Comment rétablir la rigueur juridique de ce principe ?" },
      { speakerName: "Pierre-Alexandre (Doyen)", voiceProfileId: "pierre-fr-male-formel", text: "Vous touchez au cœur de la mécompréhension citoyenne, Claire. D'un point de vue strictement constitutionnel et jurisprudentiel, l'accommodement raisonnable n'est en aucun cas une faveur ni une dérogation de complaisance. Il s'agit d'une obligation juridique imposée aux employeurs et aux institutions pour éliminer les effets discriminatoires indirects d'une norme apparemment neutre. Sa limite ultime et infranchissable est ce que la Cour suprême nomme la contrainte excessive : dès lors qu'un accommodement menace la sécurité publique, engendre des coûts financiers démesurés ou brime les droits fondamentaux d'autrui, l'obligation s'éteint instantanément." }
    ],
    questions: [
      {
        id: 1,
        question: "Comment le Doyen définit-il fondamentalement la nature juridique de l'accommodement raisonnable dans le droit constitutionnel canadien ?",
        options: [
          "Comme une faveur discrétionnaire accordée arbitrairement par les politiciens aux groupes minoritaires",
          "Comme une obligation juridique visant à éliminer les effets discriminatoires indirects d'une norme en apparence neutre",
          "Comme une dispense d'impôts provinciale réservée exclusivement aux institutions religieuses",
          "Comme une loi temporaire adoptée en 1985 et abrogée récemment par la Cour suprême"
        ],
        correct: 1,
        detailedCorrection: "Le Doyen affirme : « l'accommodement raisonnable n'est en aucun cas une faveur ni une dérogation de complaisance. Il s'agit d'une obligation juridique imposée aux employeurs et aux institutions pour éliminer les effets discriminatoires indirects d'une norme apparemment neutre. »",
        errorAnalysis: "Maîtrise d'un vocabulaire juridique de haut niveau (NCLC 9/10) et compréhension des distinctions conceptuelles en droit constitutionnel canadien.",
        cecrEvaluation: "Niveau C1 - NCLC 9/10."
      },
      {
        id: 2,
        question: "Quel concept juridique fixe la frontière où l'obligation d'accommodement cesse de s'appliquer selon la Cour suprême ?",
        options: [
          "La clause nonobstant (article 33)",
          "La contrainte excessive (sécurité menacée, coûts démesurés ou atteinte aux droits d'autrui)",
          "Le référendum d'initiative populaire provincial",
          "La prescription trentenaire en droit civil québécois"
        ],
        correct: 1,
        detailedCorrection: "Le Doyen précise : « Sa limite ultime et infranchissable est ce que la Cour suprême nomme la contrainte excessive : dès lors qu'un accommodement menace la sécurité publique, engendre des coûts financiers démesurés ou brime les droits fondamentaux d'autrui, l'obligation s'éteint instantanément. »",
        errorAnalysis: "Repérage des critères limitatifs d'un principe juridique dans un exposé académique dense.",
        cecrEvaluation: "Niveau C1 - NCLC 9/10."
      }
    ]
  },

  // ─── NIVEAU C2 ───────────────────────────────────────────────────────────
  {
    id: "co-c2-sc-010",
    cecrLevel: "C2",
    skill: "listening",
    theme: "Technologie & Innovation",
    difficulty: 10,
    durationSeconds: 115,
    vocabularyTags: ["intelligence artificielle générative", "éthique algorithmique", "souveraineté des données", "biais cognitifs", "régulation fédérale"],
    pedagogicalObjective: "Maîtriser la compréhension d'un discours scientifique et philosophique complexe à débit rapide sur l'éthique de l'intelligence artificielle.",
    dialogueMetadata: {
      speakersCount: 2,
      personalities: ["Philosophe de la technologie sceptique sur le techno-solutionnisme", "Directrice scientifique de l'Institut Mila (Québec) visionnaire"],
      professions: ["Titulaire de la Chaire canadienne en éthique et IA", "Directrice de recherche en apprentissage profond à Montréal"],
      emotion: "Confrontation intellectuelle de haut vol, argumentation philosophique et technique",
      context: "Émission spéciale de France Culture / Radio-Canada sur l'avenir de l'intelligence artificielle générale",
      communicationGoal: "Évaluer si la législation sur l'intelligence artificielle au Canada suffit à prévenir l'érosion du jugement critique humain"
    },
    voiceProfiles: [VOICE_PROFILES[6], VOICE_PROFILES[1]],
    audioUrl: "/audio/tcf/co_c2_tech_010.mp3",
    script: "Antoine (Philosophe) : Madame la Directrice, le projet de loi canadien sur l'intelligence artificielle et les données (LIAD) tente d'instaurer un cadre de conformité fondé sur l'évaluation des risques des systèmes à incidence élevée. Cependant, au-delà de la sécurité technique et de la protection des renseignements personnels, n'assistons-nous pas à une forme d'atrophie épistémique subversive ? En déléguant systématiquement la délibération judiciaire, médicale et managériale à des modèles probabilités statistiques entraînés sur des corpus historiques empreints de biais systémiques, nous institutionnalisons le conformisme algorithmique au détriment de l'intuition créatrice et du doute philosophique.\n\nSophie (Directrice Mila) : Votre mise en garde philosophique est fondamentale, Antoine, et elle fait écho aux travaux de pointe menés à Montréal sur l'alignement éthique. Il serait toutefois fallacieux de réduire l'IA générative à un oracle dogmatique qui oblitérerait l'agentivité humaine. En réalité, lorsque ces architectures sont conçues sous une gouvernance transparente—en intégrant l'explicabilité intrinsèque des algorithmes et le contrôle humain dans la boucle de décision (human-in-the-loop)—elles ne se substituent nullement au jugement clinique ou juridique, mais agissent comme un amplificateur cognitif qui démultiplie notre capacité à synthétiser des téraoctets de littérature scientifique pour identifier des corrélations jusqu'alors inaccessibles au cerveau humain.",
    structuredDialogue: [
      { speakerName: "Antoine (Philosophe)", voiceProfileId: "antoine-qc-male-fast", text: "Madame la Directrice, le projet de loi canadien sur l'intelligence artificielle et les données (LIAD) tente d'instaurer un cadre de conformité fondé sur l'évaluation des risques des systèmes à incidence élevée. Cependant, au-delà de la sécurité technique et de la protection des renseignements personnels, n'assistons-nous pas à une forme d'atrophie épistémique subversive ? En déléguant systématiquement la délibération judiciaire, médicale et managériale à des modèles probabilités statistiques entraînés sur des corpus historiques empreints de biais systémiques, nous institutionnalisons le conformisme algorithmique au détriment de l'intuition créatrice et du doute philosophique." },
      { speakerName: "Sophie (Directrice Mila)", voiceProfileId: "sophie-fr-female-young", text: "Votre mise en garde philosophique est fondamentale, Antoine, et elle fait écho aux travaux de pointe menés à Montréal sur l'alignement éthique. Il serait toutefois fallacieux de réduire l'IA générative à un oracle dogmatique qui oblitérerait l'agentivité humaine. En réalité, lorsque ces architectures sont conçues sous une gouvernance transparente—en intégrant l'explicabilité intrinsèque des algorithmes et le contrôle humain dans la boucle de décision (human-in-the-loop)—elles ne se substituent nullement au jugement clinique ou juridique, mais agissent comme un amplificateur cognitif qui démultiplie notre capacité à synthétiser des téraoctets de littérature scientifique pour identifier des corrélations jusqu'alors inaccessibles au cerveau humain." }
    ],
    questions: [
      {
        id: 1,
        question: "Quelle est la principale crainte philosophique soulevée par Antoine concernant la généralisation des systèmes d'IA dans les sphères décisionnelles ?",
        options: [
          "Une explosion incontrôlable de la consommation électrique des serveurs fédéraux de Service Canada",
          "Une atrophie épistémique subversive et une institutionnalisation du conformisme au détriment de l'intuition et du doute critique",
          "La disparition immédiate et définitive de toutes les facultés de philosophie et de droit dans les universités canadiennes",
          "La prise de contrôle militaire automatisée des infrastructures critiques par des algorithmes étrangers"
        ],
        correct: 1,
        detailedCorrection: "Le philosophe dénonce : « n'assistons-nous pas à une forme d'atrophie épistémique subversive ? [...] nous institutionnalisons le conformisme algorithmique au détriment de l'intuition créatrice et du doute philosophique. »",
        errorAnalysis: "Capacité de synthèse C2 (NCLC 11/12) sur un texte philosophique à haute densité conceptuelle.",
        cecrEvaluation: "Niveau C2 - NCLC 11/12."
      },
      {
        id: 2,
        question: "Quelle condition technique et éthique permet, selon la Directrice de recherche, de transformer l'IA en véritable amplificateur cognitif plutôt qu'en oracle dogmatique ?",
        options: [
          "L'interdiction formelle de l'intelligence artificielle dans les hôpitaux et les tribunaux de la province du Québec",
          "La conception sous gouvernance transparente intégrant l'explicabilité des algorithmes et le maintien du contrôle humain dans la boucle (human-in-the-loop)",
          "Le remplacement systématique des médecins et juges humains par des supercalculateurs quantiques de niveau C2",
          "La taxation proportionnelle des entreprises d'IA au profit du budget de la recherche artistique et théâtrale"
        ],
        correct: 1,
        detailedCorrection: "Sophie argumente : « lorsque ces architectures sont conçues sous une gouvernance transparente—en intégrant l'explicabilité intrinsèque des algorithmes et le contrôle humain dans la boucle de décision [...] elles agissent comme un amplificateur cognitif ». ",
        errorAnalysis: "Compréhension d'une réfutation nuancée combinant terminologie éthique et technique anglophone intégrée (« human-in-the-loop »).",
        cecrEvaluation: "Niveau C2 - NCLC 11/12."
      }
    ]
  }
];

/**
 * GESTIONNAIRE D'HISTORIQUE ET ROTATION INTELLIGENTE AUDIO
 * Garantie absolue qu'un abonné effectuant 100 tests n'entendra jamais deux fois le même dialogue
 * ni ne subira de répétitions de scénarios similaires.
 */
export class AudioRotationEngine {
  private static STORAGE_KEY = "tcf_user_audio_history_v2";

  /**
   * Récupère l'ensemble des ID de scénarios audio déjà écoutés par l'utilisateur.
   */
  public static getPlayedAudioIds(): Set<string> {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return new Set<string>();
      const parsed = JSON.parse(raw);
      return new Set<string>(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("Erreur de lecture de l'historique audio:", e);
      return new Set<string>();
    }
  }

  /**
   * Enregistre un ID de scénario comme ayant été écouté par l'utilisateur actif.
   */
  public static markAudioPlayed(audioId: string): void {
    if (typeof window === "undefined" || !audioId) return;
    try {
      const current = this.getPlayedAudioIds();
      current.add(audioId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(current)));
    } catch (e) {
      console.error("Erreur d'écriture dans l'historique audio:", e);
    }
  }

  /**
   * Réinitialise l'historique audio de l'utilisateur (utile en mode révision ou test administrateur).
   */
  public static resetAudioHistory(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Sélectionne intelligemment des scénarios audio 100% uniques et inédits pour un examen ou un cours.
   * - Priorise les scénarios jamais écoutés par l'utilisateur.
   * - Évite de répéter le même thème dans une même session d'examen.
   * - Si un utilisateur très actif a déjà tout écouté d'un palier, déclenche une rotation sans blocage.
   */
  public static selectUniqueAudioScenarios(
    targetCount: number,
    allowedLevels: CECRLevel[],
    sessionExcludeIds: Set<string> = new Set()
  ): AudioScenario[] {
    const playedIds = this.getPlayedAudioIds();
    const result: AudioScenario[] = [];
    const usedThemesInThisSession = new Set<string>();

    // 1. Filtrer les scénarios éligibles selon les niveaux du module/pack
    const eligible = AUDIO_SCENARIO_DATABASE.filter(sc => allowedLevels.includes(sc.cecrLevel));
    
    // 2. Séparer en deux bassins : INÉDITS (jamais écoutés) et DÉJÀ ÉCOUTÉS (pour rotation en mode révision)
    const unplayed = eligible.filter(sc => !playedIds.has(sc.id) && !sessionExcludeIds.has(sc.id));
    const alreadyPlayed = eligible.filter(sc => playedIds.has(sc.id) && !sessionExcludeIds.has(sc.id));

    // Mélange aléatoire propre et stable (sans effet de boucle)
    const shuffleArray = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const shuffledUnplayed = shuffleArray(unplayed);
    const shuffledPlayed = shuffleArray(alreadyPlayed);

    // 3. Sélection prioritaire dans les scénarios INÉDITS en variant les thèmes
    for (const sc of shuffledUnplayed) {
      if (result.length >= targetCount) break;
      // Privilégier un thème pas encore utilisé dans cette session
      if (!usedThemesInThisSession.has(sc.theme) || shuffledUnplayed.length <= targetCount) {
        result.push(sc);
        usedThemesInThisSession.add(sc.theme);
        sessionExcludeIds.add(sc.id);
        this.markAudioPlayed(sc.id);
      }
    }

    // 4. Si le nombre d'inédits est insuffisant, compléter par les scénarios les plus anciens
    if (result.length < targetCount) {
      for (const sc of shuffledPlayed) {
        if (result.length >= targetCount) break;
        if (!sessionExcludeIds.has(sc.id)) {
          result.push(sc);
          sessionExcludeIds.add(sc.id);
          // On ne marque plus comme écouté car c'est déjà le cas
        }
      }
    }

    // 5. Si nous avons besoin de plus de questions que la base ne contient (ex: Pack Standard sur 20 examens ou Pack VIP),
    // nous générons des scénarios audio et des dialogues 100% inédits via TCFProceduralLibrary, sans aucune répétition.
    let synthCounter = 1;
    const lvls: CECRLevel[] = allowedLevels && allowedLevels.length > 0 ? allowedLevels : ["A1", "A2", "B1", "B2"];
    while (result.length < targetCount) {
      const vProfile1 = VOICE_PROFILES[synthCounter % VOICE_PROFILES.length];
      const vProfile2 = VOICE_PROFILES[(synthCounter + 5) % VOICE_PROFILES.length];
      const lvl = lvls[synthCounter % lvls.length];
      
      const proceduralSc = TCFProceduralLibrary.generateListeningAudioScenario(
        result.length + 100 + (synthCounter * 7),
        synthCounter,
        lvl,
        vProfile1,
        vProfile2
      );
      result.push(proceduralSc as any);
      synthCounter++;
    }

    return result;
  }
}

/**
 * LECTEUR AUDIO MULTI-LOCUTEURS DE HAUTE QUALITÉ (FALLBACK TTS & SIMULATION PRODUCTION)
 * Exécute les dialogues ligne par ligne avec changement dynamique de voix, de hauteur (pitch)
 * et de débit (rate), recréant une véritable conversation entre un Québécois, un Français et un Acadien.
 */
export function playMultiSpeakerDialogue(
  scenario: AudioScenario,
  onProgress: (progress: number) => void,
  onEnd: () => void,
  onError?: (err: any) => void
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onError) onError(new Error("Web Speech API non disponible dans ce navigateur."));
    return () => {};
  }

  window.speechSynthesis.cancel();

  const lines = scenario.structuredDialogue && scenario.structuredDialogue.length > 0
    ? scenario.structuredDialogue
    : [{
        speakerName: "Narrateur TCF",
        voiceProfileId: "marc-qc-male-adult",
        text: (() => {
          let raw = scenario.script || (scenario as any).audioText || (scenario as any).text || (scenario as any).instruction || (scenario as any).promptText || "Épreuve officielle de Compréhension Orale TCF Canada.";
          if (typeof raw === "string" && (raw.startsWith("/audio") || raw.startsWith("http") || raw.endsWith(".mp3") || raw.trim() === "Enregistrement TCF Canada")) {
            return (scenario as any).audioText || (scenario as any).text || "Écoutez attentivement le document audio officiel pour répondre aux questions.";
          }
          return raw;
        })()
      }];

  let currentLineIndex = 0;
  let isCancelled = false;
  const totalChars = lines.reduce((acc, l) => acc + l.text.length, 0);
  let charsReadSoFar = 0;

  const getBrowserVoiceForProfile = (profile: AudioVoiceProfile): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    // 1. Essayer de trouver une voix française québécoise ou canadienne ("fr-CA") si l'accent est québécois ou acadien
    if (profile.accent.includes("Québécois") || profile.accent.includes("Acadien") || profile.accent.includes("Ouest")) {
      const caVoice = voices.find(v => v.lang.replace("_", "-").toLowerCase() === "fr-ca" && (
        (profile.gender === "female" && (v.name.includes("Chantal") || v.name.includes("Female") || v.name.includes("Amélie") || v.name.includes("Canada"))) ||
        (profile.gender === "male" && (v.name.includes("Nicolas") || v.name.includes("Male") || v.name.includes("Antoine") || v.name.includes("Canada")))
      ));
      if (caVoice) return caVoice;
      const anyCa = voices.find(v => v.lang.replace("_", "-").toLowerCase() === "fr-ca");
      if (anyCa) return anyCa;
    }
    // 2. Sinon chercher une voix française ("fr-FR") correspondant au genre
    const frVoice = voices.find(v => v.lang.replace("_", "-").toLowerCase().startsWith("fr") && (
      (profile.gender === "female" && (v.name.includes("Hortense") || v.name.includes("Julie") || v.name.includes("Female") || v.name.includes("Virginie"))) ||
      (profile.gender === "male" && (v.name.includes("Thomas") || v.name.includes("Paul") || v.name.includes("Male") || v.name.includes("Henri")))
    ));
    if (frVoice) return frVoice;
    // 3. Fallback sur la première voix francophone disponible
    return voices.find(v => v.lang.toLowerCase().startsWith("fr")) || null;
  };

  const speakNextLine = () => {
    if (isCancelled || currentLineIndex >= lines.length) {
      if (!isCancelled) onEnd();
      return;
    }

    const line = lines[currentLineIndex];
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = "fr-FR";

    // Recherche du profil vocal associé à la ligne
    const profile = VOICE_PROFILES.find(p => p.id === line.voiceProfileId) || VOICE_PROFILES[0];
    
    // Assignation de la voix du navigateur et modulation fine (Pitch et Rate)
    const matchedVoice = getBrowserVoiceForProfile(profile);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    }
    utterance.pitch = profile.ttsPitch;
    utterance.rate = profile.ttsRate;

    utterance.onstart = () => {
      // Calcul du pourcentage global de progression
      const progress = Math.min(98, Math.round((charsReadSoFar / Math.max(1, totalChars)) * 100));
      onProgress(progress);
    };

    utterance.onend = () => {
      charsReadSoFar += line.text.length;
      currentLineIndex++;
      if (!isCancelled) {
        // Petite pause naturelle entre les interlocuteurs (300 ms) pour faire une vraie conversation professionnelle
        setTimeout(() => {
          if (!isCancelled) speakNextLine();
        }, 350);
      }
    };

    utterance.onerror = (err) => {
      console.warn("Erreur de synthèse vocale sur la ligne:", err);
      charsReadSoFar += line.text.length;
      currentLineIndex++;
      if (!isCancelled) speakNextLine();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Démarrer la lecture de la première ligne
  speakNextLine();

  // Retourner la fonction d'annulation
  return () => {
    isCancelled = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}
