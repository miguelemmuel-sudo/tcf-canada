// Centralized Subscription & Access Control Engine for TCF Canada Pro (Griffon d'OR)

export type PackType = "standard" | "griffon" | "vip";

export interface PackPermissions {
  name: string;
  price: string;
  badge?: string;
  modulesCount: number;
  coursesCount: number;
  testsCount: number;
  questionsPerExam: number;
  aiWrittenCorrection: boolean;
  aiOralCorrection: boolean;
  aiGrammarAnalysis: boolean;
  aiLexicalSuggestions: boolean;
  aiUnlimitedGeneration: boolean;
  aiExaminerSimulator: boolean;
  aiPdfReport: boolean;
  coachingActive: boolean;
  reservationsActive: boolean;
  messagingActive: boolean;
  upsellBannerText?: string;
  nextPack?: PackType;
  nextPackName?: string;
}

export const PACK_CONFIGS: Record<PackType, PackPermissions> = {
  standard: {
    name: "Pack Standard",
    price: "15.000 FCFA",
    modulesCount: 2,
    coursesCount: 20, // 2 modules x 10 cours exactement = 20 cours au total
    testsCount: 20, // 20 véritables tests d'entraînement (5 CE, 5 CO, 5 EE, 5 EO)
    questionsPerExam: 20,
    aiWrittenCorrection: false,
    aiOralCorrection: false,
    aiGrammarAnalysis: false,
    aiLexicalSuggestions: false,
    aiUnlimitedGeneration: false,
    aiExaminerSimulator: false,
    aiPdfReport: false,
    coachingActive: false,
    reservationsActive: false,
    messagingActive: false,
    upsellBannerText: "Passez au Pack Griffon D'OR pour accéder à plus de 500 cours par module, des examens de plus de 80 questions et aux corrections IA avancées.",
    nextPack: "griffon",
    nextPackName: "Pack Griffon D'OR",
  },
  griffon: {
    name: "Pack Griffon D'OR",
    price: "25.000 FCFA",
    badge: "Le plus populaire",
    modulesCount: 10,
    coursesCount: 5000, // 10 modules x 500 cours via architecture progressive
    testsCount: 80,
    questionsPerExam: 80, // Tests complets de plus de 80 questions réparties sur les 4 compétences
    aiWrittenCorrection: true,
    aiOralCorrection: true,
    aiGrammarAnalysis: true,
    aiLexicalSuggestions: true,
    aiUnlimitedGeneration: false,
    aiExaminerSimulator: false,
    aiPdfReport: false,
    coachingActive: false,
    reservationsActive: false,
    messagingActive: true,
    upsellBannerText: "Passez au Pack VIP & Coaching pour bénéficier d'un accompagnement personnalisé, de 20 modules (10 000 cours), d'examens de 100 questions et d'un coaching individuel.",
    nextPack: "vip",
    nextPackName: "Pack VIP & Coaching",
  },
  vip: {
    name: "Pack VIP & Coaching",
    price: "100.000 FCFA",
    badge: "Offre Premium",
    modulesCount: 20,
    coursesCount: 10000, // 20 modules x 500 cours via architecture progressive
    testsCount: 100,
    questionsPerExam: 100, // Examens complets de 100 questions conformes au TCF Canada
    aiWrittenCorrection: true,
    aiOralCorrection: true,
    aiGrammarAnalysis: true,
    aiLexicalSuggestions: true,
    aiUnlimitedGeneration: true,
    aiExaminerSimulator: true,
    aiPdfReport: true,
    coachingActive: true,
    reservationsActive: true,
    messagingActive: true,
  },
};

export function getCurrentUserPack(): PackType {
  if (typeof window === "undefined") return "griffon";
  try {
    const saved = localStorage.getItem("griffon_user_plan");
    if (saved && (saved === "standard" || saved === "griffon" || saved === "vip")) {
      return saved as PackType;
    }
  } catch (e) {
    console.error("Error reading user pack:", e);
  }
  return "griffon"; // Default plan
}

export function setUserPack(pack: PackType) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("griffon_user_plan", pack);
    window.dispatchEvent(new Event("storage_user_pack_updated"));
  } catch (e) {
    console.error("Error setting user pack:", e);
  }
}

export function getPackPermissions(pack?: PackType): PackPermissions {
  const p = pack || getCurrentUserPack();
  return PACK_CONFIGS[p] || PACK_CONFIGS.griffon;
}

export function isFeatureAccessible(feature: "coaching" | "reservations" | "messages" | "ai_advanced" | "ai_premium", pack?: PackType): boolean {
  const config = getPackPermissions(pack);
  switch (feature) {
    case "coaching":
      return config.coachingActive;
    case "reservations":
      return config.reservationsActive;
    case "messages":
      return config.messagingActive;
    case "ai_advanced":
      return config.aiWrittenCorrection;
    case "ai_premium":
      return config.aiUnlimitedGeneration;
    default:
      return true;
  }
}

/**
 * Vérifie si l'utilisateur en cours est l'administrateur suprême (Administrateur réseau Miguel).
 * Permet l'accès gratuit, les tests de tous les packs et le contournement du paiement.
 */
export function isUserAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const isAdminFlag = localStorage.getItem("griffon_user_is_admin") === "true";
    const email = (localStorage.getItem("griffon_user_email") || "").toLowerCase().trim();
    const adminEmails = [
      "emmuel.proreseau@gmail.com",
      "joumefiomiguel@gmail.com",
      "miguelemmuel@gmail.com",
      "admin.miguel@griffondor.com",
      "miguel.admin@griffondor.com",
      "admin@griffondor.com",
      "miguel@griffondor.com"
    ];
    if (isAdminFlag || adminEmails.includes(email)) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Retourne la durée de l'examen en secondes selon le pack de l'utilisateur.
 * - Pack Standard : durée officielle conservée
 * - Pack Griffon D'OR : 1h 30 (90 minutes)
 * - Pack VIP & Coaching : 2h 00 (120 minutes)
 */
export function getExamDurationSecondsForPack(pack: PackType, baseSeconds: number): number {
  if (pack === "vip") {
    return 120 * 60; // 2 heures (120 minutes)
  }
  if (pack === "griffon") {
    return 90 * 60; // 1 heure 30 (90 minutes)
  }
  return baseSeconds; // Pack standard (durée standard de l'épreuve conservée)
}

/**
 * Retourne le libellé de durée pour les badges d'examen.
 */
export function getExamBadgeDurationText(pack: PackType, baseText: string): string {
  if (pack === "vip") {
    return "2h 00 (120 min)";
  }
  if (pack === "griffon") {
    return "1h 30 (90 min)";
  }
  return baseText;
}

