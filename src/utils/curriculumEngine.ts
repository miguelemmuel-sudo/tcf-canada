// Moteur Curriculaire Officiel et Architecture d'Alimentation Progressive - TCF Canada Pro (Griffon d'OR)
// Rédigé par l'équipe pédagogique d'experts FLE et TCF Canada.

import { PackType } from "./subscriptionEngine";

export interface PedagogicalModule {
  id: number;
  title: string;
  cecrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Transversal";
  description: string;
  objectives: string[];
  skillsFocus: ("listening" | "reading" | "writing" | "speaking")[];
}

export const OFFICIAL_CURRICULUM: PedagogicalModule[] = [
  {
    id: 1,
    title: "Module 1 : Présentation du TCF Canada & Méthodologie d'Examen",
    cecrLevel: "Transversal",
    description: "Leçon fondamentale sur la structure des 4 épreuves obligatoires (CO, CE, EE, EO), le barème officiel sur 699 points, la grille de correspondance CECR (A1 à C2) et les stratégies de gestion du temps et du stress en conditions réelles.",
    objectives: [
      "Maîtriser le déroulement chronologique officiel des 4 épreuves du TCF Canada.",
      "Comprendre le système de cotation et les paliers de points requis pour l'immigration canadienne (Entrée express / NCLC 7 et plus).",
      "Éviter les pièges de pénalisation sur les QCM de compréhension et respecter les quotas de mots en expression écrite."
    ],
    skillsFocus: ["listening", "reading", "writing", "speaking"]
  },
  {
    id: 2,
    title: "Module 2 : Niveau A1 – Compréhension et Expressions de Base",
    cecrLevel: "A1",
    description: "Acquisition du socle élémentaire pour comprendre des salutations, des instructions simples, et identifier des informations chiffrées (heures, prix, dates) dans des annonces publiques brèves.",
    objectives: [
      "Identifier des mots familiers et des expressions très courantes dans des messages enregistrés lents et clairs.",
      "Repérer des informations concrètes dans des documents simples de la vie quotidienne (affiches, menus, horaires).",
      "Formuler des phrases courtes pour se présenter et répondre à des questions personnelles de base."
    ],
    skillsFocus: ["listening", "reading", "speaking"]
  },
  {
    id: 3,
    title: "Module 3 : Niveau A1/A2 – Vocabulaire Familier et Situations Pratiques",
    cecrLevel: "A2",
    description: "Extension de la compréhension aux transactions de la vie courante (achats, transports, hébergement) et rédaction de messages courts amicaux ou formels simples.",
    objectives: [
      "Comprendre l'essentiel d'annonces publiques dans les gares, aéroports et commerces.",
      "Rédiger un court message de remerciement, d'invitation ou de confirmation (Tâche 1 de l'épreuve d'expression écrite).",
      "Interagir dans un échange structuré sur un sujet familier avec l'examinateur."
    ],
    skillsFocus: ["listening", "reading", "writing", "speaking"]
  },
  {
    id: 4,
    title: "Module 4 : Niveau A2 – Compréhension de la Vie Sociale et Professionnelle",
    cecrLevel: "A2",
    description: "Analyse de courts articles de presse locale, d'e-mails professionnels simples et descriptions d'expériences personnelles au passé composé et à l'imparfait.",
    objectives: [
      "Distinguer la chronologie d'un événement raconté dans un court article ou un témoignage audio.",
      "Raconter une expérience personnelle passée avec précision temporelle.",
      "Poser des questions précises pour obtenir des informations pratiques lors de la Tâche 2 de l'expression orale."
    ],
    skillsFocus: ["listening", "reading", "writing", "speaking"]
  },
  {
    id: 5,
    title: "Module 5 : Niveau A2/B1 – Transition Grammaticale et Expression de l'Opinion",
    cecrLevel: "B1",
    description: "Franchissement du seuil d'autonomie B1. Maîtrise de l'expression de l'accord, du désaccord, et des articulations logiques élémentaires (parce que, donc, mais, cependant).",
    objectives: [
      "Comprendre les points principaux d'une émission de radio ou d'une conversation sur des sujets familiers.",
      "Rédiger un compte-rendu d'expérience en exprimant un sentiment ou une opinion justifiée (Tâche 2 d'expression écrite).",
      "Organiser un discours cohérent autour d'une idée principale en liant les phrases avec des connecteurs logiques."
    ],
    skillsFocus: ["listening", "reading", "writing", "speaking"]
  },
  {
    id: 6,
    title: "Module 6 : Niveau B1 – Argumentation de Base et Faits Divers",
    cecrLevel: "B1",
    description: "Lecture analytique d'articles de journaux, compréhension d'interviews radiophoniques et rédaction de textes argumentatifs courts avec exemples à l'appui.",
    objectives: [
      "Identifier l'intention de l'auteur et le ton (informatif, critique, humoristique) dans un document écrit ou sonore.",
      "Rédiger un texte structuré pour comparer deux points de vue et exprimer sa préférence en argumentant.",
      "Développer une argumentation orale spontanée face à une question d'actualité simple."
    ],
    skillsFocus: ["listening", "reading", "writing", "speaking"]
  },
  {
    id: 7,
    title: "Module 7 : Niveau B1+ – Structuration Logique et Lettres Formelles",
    cecrLevel: "B1",
    description: "Perfectionnement des structures syntaxiques formelles : lettre de réclamation, demande administrative et maîtrise des connecteurs de cause et de conséquence.",
    objectives: [
      "Respecter scrupuleusement le registre de langue (vouvoiement formel, formules de politesse administratives).",
      "Utiliser avec précision les articulateurs de cause (en raison de, étant donné que) et de conséquence (par conséquent, ainsi).",
      "Synthétiser rapidement les informations clés d'un enregistrement audio long (>2 minutes)."
    ],
    skillsFocus: ["reading", "writing"]
  },
  {
    id: 8,
    title: "Module 8 : Niveau B2 – Maîtrise de l'Argumentation Complexe",
    cecrLevel: "B2",
    description: "Atteinte du niveau NCLC 8 / B2 requis par de nombreux programmes d'immigration. Capacité à débattre sur des thèmes de société (écologie, télétravail, éducation, santé).",
    objectives: [
      "Comprendre des conférences et des discours longs impliquant une argumentation abstraite.",
      "Rédiger la Tâche 3 de l'expression écrite : comparer deux documents de points de vue opposés et prendre position de manière argumentée et nuancée.",
      "Défendre son opinion à l'oral en réfutant les contre-arguments de l'examinateur avec fluidité et assurance."
    ],
    skillsFocus: ["listening", "reading", "writing", "speaking"]
  },
  {
    id: 9,
    title: "Module 9 : Niveau B2 – Compréhension Fine et Implicite",
    cecrLevel: "B2",
    description: "Détection des nuances subtiles de l'opinion, de l'ironie légère et des sous-entendus dans des chroniques radiophoniques et des éditoriaux de presse.",
    objectives: [
      "Repérer l'implicite et les attitudes des locuteurs (scepticisme, enthousiasme, réserve) dans les documents sonores complexes.",
      "Analyser la structure logique d'un éditorial de presse ou d'un essai argumentatif.",
      "Enrichir son vocabulaire d'expressions idiomatiques précises et adaptées au contexte professionnel ou académique."
    ],
    skillsFocus: ["listening", "reading"]
  },
  {
    id: 10,
    title: "Module 10 : Niveau B2+ – Syntaxe Avancée et Modes Verbaux",
    cecrLevel: "B2",
    description: "Perfectionnement des modes verbaux avancés : subjonctif (obligation, doute, volonté), conditionnel passé (regret, reproche, hypothèse non réalisée) et concordance des temps.",
    objectives: [
      "Maîtriser l'emploi du subjonctif après les conjonctions d'opposition (bien que, quoique) et de but (afin que, pour que).",
      "Formuler des hypothèses complexes sur le passé et l'avenir lors des épreuves de production.",
      "Éliminer les calques et interférences linguistiques pour garantir une syntaxe française naturelle et rigoureuse."
    ],
    skillsFocus: ["writing", "speaking"]
  },
  {
    id: 11,
    title: "Module 11 : Niveau B2/C1 – Synthèse de Documents et Confrontation d'Idées",
    cecrLevel: "C1",
    description: "Franchissement vers le niveau Supérieur C1 (NCLC 9 et 10). Méthodologie experte de la synthèse documentaire : reformuler sans paraphraser et organiser une comparaison thématique.",
    objectives: [
      "Extraire les idées essentielles de deux textes aux points de vue divergents sans déformer l'opinion des auteurs.",
      "Reformuler avec ses propres mots (paraphrase élégante et nominalisation grammaticale).",
      "Structurer un plan comparatif imparable pour la Tâche 3 d'expression écrite."
    ],
    skillsFocus: ["reading", "writing"]
  },
  {
    id: 12,
    title: "Module 12 : Niveau C1 – Compréhension de Textes Spécialisés et Littéraires",
    cecrLevel: "C1",
    description: "Lecture approfondie d'articles économiques, scientifiques, sociologiques et littéraires extraits de revues francophones de référence (Le Monde, Courrier International, La Recherche).",
    objectives: [
      "Comprendre dans le détail des textes factuels et littéraires longs et complexes en appréciant les distinctions de style.",
      "Répondre aux QCM de compréhension écrite de niveau 5 et 6 sans se laisser piéger par les distracteurs subtils.",
      "Maîtriser le lexique abstrait et académique de haut niveau."
    ],
    skillsFocus: ["reading"]
  },
  {
    id: 13,
    title: "Module 13 : Niveau C1 – Maîtrise Stylistique et Registres de Langue",
    cecrLevel: "C1",
    description: "Adaptation parfaite du registre de langue (soutenu, formel, standard, journalistique) selon le destinataire et la situation de communication.",
    objectives: [
      "Maniement expert de la nominalisation pour rendre les productions écrites plus denses et percutantes.",
      "Utilisation des figures de style de base (litote, euphémisme, métaphore) pour nuancer un discours à l'oral.",
      "Perfectionnement de la prononciation, de l'intonation et du rythme d'élocution pour une prise de parole naturelle."
    ],
    skillsFocus: ["writing", "speaking"]
  },
  {
    id: 14,
    title: "Module 14 : Niveau C1+ – Articulation Logique de Haut Niveau et Réfutation",
    cecrLevel: "C1",
    description: "Techniques avancées du débat : faire une concession stratégique (certes... il n'en demeure pas moins que...), réfuter une thèse avec fermeté et diplomatie, et conclure avec impact.",
    objectives: [
      "Déployer des articulateurs logiques de concession et d'opposition de niveau C1/C2.",
      "Maintenir un monologue suivi et structuré de 4 minutes et 30 secondes en Tâche 3 d'expression orale sans hésitation longue.",
      "Réagir aux objections déstabilisantes de l'examinateur avec aplomb et cohérence argumentative."
    ],
    skillsFocus: ["listening", "speaking"]
  },
  {
    id: 15,
    title: "Module 15 : Niveau C1/C2 – Expression Orale Spontanée et Argumentation Chronométrée",
    cecrLevel: "C2",
    description: "Entraînement intensif en conditions réelles d'examen pour l'Expression Orale : préparation rapide de la Tâche 2 et structuration immédiate de la Tâche 3.",
    objectives: [
      "Optimiser les 2 minutes de préparation de la Tâche 2 pour formuler 8 à 10 questions précises, variées et grammaticalement irréprochables.",
      "Structurer mentalement en 30 secondes un plan dialectique (thèse, antithèse, synthèse personnelle) pour la Tâche 3.",
      "Atteindre le score maximal (NCLC 10+) en fluidité, richesse lexicale et aisance phonétique."
    ],
    skillsFocus: ["speaking"]
  },
  {
    id: 16,
    title: "Module 16 : Niveau C2 – Compréhension Sonore de Vitesse Rapide et Débats Télévisés",
    cecrLevel: "C2",
    description: "Entraînement sur des extraits audio d'émissions de débats rapides à plusieurs voix avec bruit de fond, accents francophones variés et débit d'élocution rapide.",
    objectives: [
      "Suivre une discussion animée entre plusieurs locuteurs natifs s'exprimant à débit rapide ou se coupant la parole.",
      "Identifier avec précision les accords, désaccords latents et compromis dans un enregistrement complexe de niveau 6.",
      "Répondre aux questions QCM les plus sélectives de la fin de l'épreuve de Compréhension Orale."
    ],
    skillsFocus: ["listening"]
  },
  {
    id: 17,
    title: "Module 17 : Niveau C2 – Précision Lexicale Absolue et Expressions Idiomatiques",
    cecrLevel: "C2",
    description: "Élimination définitive des approximations lexicales. Maîtrise des collocations exactes, des expressions idiomatiques avancées et des subtilités sémantiques.",
    objectives: [
      "Choisir le mot juste et précis en évitant les verbes passe-partout (faire, avoir, mettre, dire, voir).",
      "Comprendre et exploiter des expressions idiomatiques prestigieuses dans un contexte formel.",
      "Maîtriser les subtilités de la dérivation lexicale (préfixes, suffixes) pour enrichir instantanément son expression."
    ],
    skillsFocus: ["reading", "writing", "speaking"]
  },
  {
    id: 18,
    title: "Module 18 : Niveau C2 – Excellence Rédactionnelle en Expression Écrite",
    cecrLevel: "C2",
    description: "Entraînement de niveau maître sur les 3 tâches d'Expression Écrite en respectant à la virgule près les temps impartis et les quotas de mots officiels.",
    objectives: [
      "Rédiger la Tâche 1 en moins de 10 minutes avec une correction orthographique et grammaticale de 100%.",
      "Exécuter la Tâche 2 en 15 minutes avec une richesse de vocabulaire et une variété de structures impressionnantes.",
      "Finaliser la Tâche 3 en 35 minutes avec une synthèse irréprochable et une prise de position argumentée d'une logique implacable."
    ],
    skillsFocus: ["writing"]
  },
  {
    id: 19,
    title: "Module 19 : Perfectionnement Intensif & Stratégies Anti-Pièges QCM",
    cecrLevel: "Transversal",
    description: "Analyse décortiquée des méthodes de conception des QCM officiels du TCF Canada : repérage des distracteurs plausibles, gestion de l'incertitude et optimisation du score.",
    objectives: [
      "Reconnaître immédiatement les 3 types de distracteurs utilisés dans les épreuves CO et CE du TCF.",
      "Appliquer la méthode d'élimination logique pour maximiser ses chances sur les questions de niveau C1 et C2.",
      "Gérer sa courbe de concentration pendant les 1 heure et 35 minutes d'épreuves QCM continues."
    ],
    skillsFocus: ["listening", "reading"]
  },
  {
    id: 20,
    title: "Module 20 : Maîtrise Suprême & Simulations Blanches Officielles TCF Canada",
    cecrLevel: "C2",
    description: "L'aboutissement de la préparation Griffon d'OR : mise en situation globale de test d'immigration sous surveillance chronométrée stricte avec correction IA et évaluation de niveau NCLC.",
    objectives: [
      "Valider un niveau global NCLC 9 ou 10 (C1/C2) sur l'ensemble des 4 compétences de l'examen.",
      "Éliminer toute dépendance au hasard et consolider une assurance absolue avant le jour de l'épreuve officielle.",
      "Obtenir son attestation de préparation complète certifiée TCF Canada Pro."
    ],
    skillsFocus: ["listening", "reading", "writing", "speaking"]
  }
];

/**
 * Retourne la liste des modules accessibles selon la formule (Pack) de l'utilisateur.
 * Respect scrupuleux du cahier des charges officiel :
 * - Standard : Exactement 2 modules.
 * - Griffon d'OR : Au minimum 10 modules.
 * - VIP & Coaching : Exactement 20 modules (totalité).
 */
export function getModulesForPack(pack: PackType): PedagogicalModule[] {
  switch (pack) {
    case "standard":
      return OFFICIAL_CURRICULUM.slice(0, 2); // Exactement 2 modules
    case "griffon":
      return OFFICIAL_CURRICULUM.slice(0, 10); // Au minimum 10 modules
    case "vip":
    default:
      return OFFICIAL_CURRICULUM; // 20 modules
  }
}
