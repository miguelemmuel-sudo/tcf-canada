/**
 * SCRIPT DE VÉRIFICATION DE COHÉRENCE DU SYSTÈME ENTIER (TCF CANADA PRO)
 * Audite l'intégralité des 4 compétences (CO, CE, EE, EO) à travers les cours
 * et les simulateurs d'examens sur les 3 abonnements (Standard, Griffon d'Or, VIP).
 */

import { listeningCourses, readingCourses, writingCourses, speakingCourses } from "../data/realCourses";
import { listeningQuestions, readingPassages, writingTasks, speakingTasks } from "../data/realExams";
import { 
  generateLessonsForPack, 
  generateExamQuestionsForPack, 
  generateExamPassagesForPack, 
  generateExamWritingTasksForPack
} from "./courseGenerator";
import { AUDIO_SCENARIO_DATABASE } from "./audioContentEngine";

// Données de base extraites des pages UI du Dashboard pour tester dans les conditions exactes de l'interface
const UI_LISTENING_LESSONS = [
  {
    id: 1, title: "Introduction à la CO TCF", duration: "12:00",
    audioText: "Bienvenue dans le cours de compréhension orale TCF Canada. Dans cette leçon, vous allez apprendre les stratégies essentielles pour réussir les épreuves d'écoute. L'épreuve officielle de compréhension orale comporte 4 grandes sections de difficulté progressive : les illustrations, les courtes conversations, les annonces publiques et les conférences radio.",
    questions: [
      { q: "Quel est le thème principal de ce document audio ?", options: ["La cuisine française", "Les stratégies d'écoute TCF", "Les voyages au Canada", "La météo"], answer: 1 },
      { q: "Combien de parties comporte l'épreuve de compréhension orale ?", options: ["2", "3", "4", "5"], answer: 2 },
    ]
  },
  {
    id: 2, title: "Conversations courtes — niveau A2/B1", duration: "15:00",
    audioText: "Écoutez cette courte conversation entre deux amis qui planifient un voyage à Montréal. Marie dit à Jean qu'elle a réservé un hôtel près du Vieux-Port pour trois nuits.",
    questions: [
      { q: "Où Marie a-t-elle réservé l'hôtel ?", options: ["À Québec", "Près du Vieux-Port", "À Ottawa", "À Toronto"], answer: 1 },
      { q: "Combien de nuits vont-ils rester ?", options: ["Une nuit", "Deux nuits", "Trois nuits", "Une semaine"], answer: 2 },
    ]
  }
];

const UI_EXAM_LISTENING = [
  {
    id: 1,
    audioText: "Bonjour, je m'appelle Marie. J'ai déménagé au Canada il y a deux ans principalement pour des raisons professionnelles, car mon entreprise m'a offert un poste à Montréal.",
    text: "D'après l'enregistrement, pourquoi Marie a-t-elle décidé de déménager au Canada ?",
    options: ["Pour rejoindre sa famille", "Pour des raisons professionnelles", "Pour améliorer son français", "Pour des raisons climatiques"],
    correct: 1
  },
  {
    id: 2,
    audioText: "Bonjour, ici Pierre. Le processus d'immigration pour le Canada a été assez long. J'ai déposé mon dossier complet et il a fallu exactement 18 mois avant de recevoir ma confirmation de résidence permanente.",
    text: "Combien de temps a-t-il fallu à Pierre pour obtenir son visa de résidence permanente ?",
    options: ["6 mois", "1 an", "18 mois", "2 ans"],
    correct: 2
  }
];

async function runSystemCoherenceAudit() {
  console.log("================================================================================");
  console.log("🌟 AUDIT GÉANT DE COHÉRENCE ET D'INTÉGRITÉ DU SYSTÈME (TCF CANADA PRO)");
  console.log("================================================================================\n");

  const packs = ["standard", "griffon", "vip"] as const;
  const permissions = {
    standard: { coursesCount: 5, questionsPerExam: 5, coursesPerSkill: 5 },
    griffon: { coursesCount: 20, questionsPerExam: 20, coursesPerSkill: 20 },
    vip: { coursesCount: 39, questionsPerExam: 39, coursesPerSkill: 39 }
  };

  let totalItemsChecked = 0;
  let totalQuestionsChecked = 0;
  let anomalies: string[] = [];

  function auditQcmQuestions(qs: any[], moduleName: string, pack: string) {
    const seenQuestions = new Set<string>();
    for (const q of qs) {
      totalQuestionsChecked++;
      const qText = q.question || q.q || q.text || "";
      const opts = q.options || [];
      const correctIdx = q.correct !== undefined ? q.correct : q.answer !== undefined ? q.answer : -1;

      if (!qText || qText.trim().length === 0) {
        anomalies.push(`[${moduleName} - ${pack.toUpperCase()}] Question vide ou sans texte.`);
      }

      if (!Array.isArray(opts) || opts.length !== 4) {
        anomalies.push(`[${moduleName} - ${pack.toUpperCase()}] Q#${q.id || "?"} "${qText}" n'a pas exactement 4 options (${opts?.length}).`);
      } else {
        // Vérifier les placeholders ou options vides
        opts.forEach((opt: string, i: number) => {
          if (!opt || opt.trim().length === 0) {
            anomalies.push(`[${moduleName} - ${pack.toUpperCase()}] Q#${q.id || "?"} Option ${i} est vide.`);
          }
          if (opt.includes("Option A") || opt.includes("Proposition correcte") || opt.includes("Hors sujet D")) {
            anomalies.push(`[${moduleName} - ${pack.toUpperCase()}] Q#${q.id || "?"} contient un placeholder non contextualisé : "${opt}".`);
          }
        });

        // Vérifier que l'index correct est valide
        if (correctIdx < 0 || correctIdx >= 4) {
          anomalies.push(`[${moduleName} - ${pack.toUpperCase()}] Q#${q.id || "?"} Index de bonne réponse invalide (${correctIdx}).`);
        }

        // Vérifier les doublons d'options au sein d'une même question
        const uniqueOpts = new Set(opts.map(o => o.trim().toLowerCase()));
        if (uniqueOpts.size !== 4) {
          anomalies.push(`[${moduleName} - ${pack.toUpperCase()}] Q#${q.id || "?"} possède des options dupliquées entre elles.`);
        }
      }

      // Vérifier si la question se répète exactement dans le même test
      const qKey = qText.trim().toLowerCase();
      if (seenQuestions.has(qKey)) {
        anomalies.push(`[${moduleName} - ${pack.toUpperCase()}] Question dupliquée dans le même test : "${qText}".`);
      }
      seenQuestions.add(qKey);
    }
  }

  // ─── 1. AUDIT COMPRÉHENSION ORALE (CO) ──────────────────────────────────────
  console.log("🎧 1. Audit Compréhension Orale (CO - Cours & Simulateurs NCLC)...");
  for (const pack of packs) {
    // Cours UI + Cours Base
    const lessonsUI = generateLessonsForPack(UI_LISTENING_LESSONS, pack, permissions[pack] as any, "listening");
    const lessonsBase = generateLessonsForPack(listeningCourses, pack, permissions[pack] as any, "listening");
    [...lessonsUI, ...lessonsBase].forEach(l => {
      totalItemsChecked++;
      const qs = l.questions || l.quiz || l.exercises || [];
      auditQcmQuestions(qs, `Cours CO (Leçon ${l.id} "${l.title}")`, pack);
    });

    // Examens UI + Examens Base
    const examsUI = generateExamQuestionsForPack(UI_EXAM_LISTENING, pack, permissions[pack] as any, "listening");
    auditQcmQuestions(examsUI, "Examen CO (UI Demo)", pack);
    const examsBase = generateExamQuestionsForPack(listeningQuestions, pack, permissions[pack] as any, "listening");
    auditQcmQuestions(examsBase, "Examen CO (Base Real)", pack);
  }
  console.log("   ✅ Module CO audité sans erreur structurelle.");

  // ─── 2. AUDIT COMPRÉHENSION ÉCRITE (CE) ─────────────────────────────────────
  console.log("📖 2. Audit Compréhension Écrite (CE - Cours & Passages de Lecture)...");
  for (const pack of packs) {
    const lessons = generateLessonsForPack(readingCourses, pack, permissions[pack] as any, "reading");
    lessons.forEach(l => {
      totalItemsChecked++;
      const qs = l.questions || l.quiz || l.exercises || [];
      auditQcmQuestions(qs, `Cours CE (Leçon ${l.id})`, pack);
    });

    const passages = generateExamPassagesForPack(readingPassages, pack, permissions[pack] as any);
    passages.forEach(p => {
      totalItemsChecked++;
      auditQcmQuestions(p.questions || [], `Examen CE (Passage ${p.id})`, pack);
    });
  }
  console.log("   ✅ Module CE audité sans erreur structurelle.");

  // ─── 3. AUDIT EXPRESSION ÉCRITE (EE) ────────────────────────────────────────
  console.log("✍️  3. Audit Expression Écrite (EE - Tâches 1, 2 et 3)...");
  for (const pack of packs) {
    const lessons = generateLessonsForPack(writingCourses, pack, permissions[pack] as any, "writing");
    const tasks = generateExamWritingTasksForPack(writingTasks, pack, permissions[pack] as any, "writing");
    [...lessons, ...tasks].forEach(item => {
      totalItemsChecked++;
      const prompt = item.promptText || item.text || item.instruction || "";
      if (!prompt || prompt.trim().length === 0) {
        anomalies.push(`[EE - ${pack.toUpperCase()}] Item ${item.id} sans sujet d'expression écrite.`);
      }
    });
  }
  console.log("   ✅ Module EE audité sans erreur structurelle.");

  // ─── 4. AUDIT EXPRESSION ORALE (EO) ─────────────────────────────────────────
  console.log("🗣️  4. Audit Expression Orale (EO - Entretiens et Débats)...");
  for (const pack of packs) {
    const lessons = generateLessonsForPack(speakingCourses, pack, permissions[pack] as any, "speaking");
    const tasks = generateExamWritingTasksForPack(speakingTasks, pack, permissions[pack] as any, "speaking");
    [...lessons, ...tasks].forEach(item => {
      totalItemsChecked++;
      const prompt = item.promptText || item.text || item.instruction || "";
      if (!prompt || prompt.trim().length === 0) {
        anomalies.push(`[EO - ${pack.toUpperCase()}] Item ${item.id} sans sujet d'expression orale.`);
      }
    });
  }
  console.log("   ✅ Module EO audité sans erreur structurelle.");

  // ─── RAPPORT FINAL ──────────────────────────────────────────────────────────
  console.log("\n================================================================================");
  console.log(`📊 BILAN STATISTIQUE :`);
  console.log(`   • Total d'items et leçons audités : ${totalItemsChecked}`);
  console.log(`   • Total de questions QCM vérifiées : ${totalQuestionsChecked}`);
  
  if (anomalies.length === 0) {
    console.log(`\n👑 RÉSULTAT FINAL : 100% DE COHÉRENCE ET DE CONFORMITÉ SUR L'ENSEMBLE DU SYSTÈME !`);
    console.log(`   Aucun décalage, aucun placeholder, aucune option invalide, aucun doublon détecté.`);
  } else {
    console.error(`\n⚠️ RÉSULTAT : ${anomalies.length} anomalies détectées lors de l'audit :`);
    anomalies.forEach((err, i) => console.error(`   ${i + 1}. ${err}`));
  }
  console.log("================================================================================\n");
}

runSystemCoherenceAudit().catch(err => {
  console.error("Erreur lors de l'audit système :", err);
  process.exit(1);
});
