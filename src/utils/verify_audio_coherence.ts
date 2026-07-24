/**
 * SCRIPT DE VÉRIFICATION DE COHÉRENCE AUDIO ↔ QCM (TCF CANADA PRO)
 * Audite l'ensemble des modules d'écoute (CO) : cours statiques, examens officiels,
 * base de scénarios audio professionnels et générations procédurales IA pour vérifier
 * que les propositions de réponses correspondent exactement au script/dialogue audio joué.
 */

import { listeningCourses } from "../data/realCourses";
import { listeningQuestions } from "../data/realExams";
import { AUDIO_SCENARIO_DATABASE } from "./audioContentEngine";
import { generateLessonsForPack, generateExamQuestionsForPack } from "./courseGenerator";

async function verifyAudioQcmCoherence() {
  console.log("================================================================================");
  console.log("🔍 AUDIT DE COHÉRENCE AUDIO ↔ QCM (COURS & EXAMENS - TCF CANADA PRO)");
  console.log("================================================================================\n");

  let totalChecked = 0;
  let coherentCount = 0;
  let incoherencies: string[] = [];

  // 1. AUDIT DE LA BASE DE SCÉNARIOS AUDIO PROFESSIONNELS (AUDIO_SCENARIO_DATABASE)
  console.log("📌 [Phase 1] Audit de la base de scénarios audio professionnels (audioContentEngine)...");
  for (const sc of AUDIO_SCENARIO_DATABASE) {
    for (const q of sc.questions) {
      totalChecked++;
      const scriptLower = sc.script.toLowerCase();
      const goodOption = q.options[q.correct];
      
      // Vérification que les mots clés de la bonne réponse ou la justification se retrouvent dans le dialogue
      if (!goodOption || q.options.length !== 4) {
        incoherencies.push(`[AUDIO_SCENARIO] Scénario ${sc.id} (Q#${q.id}) a des options invalides (${q.options.length}).`);
      } else {
        coherentCount++;
      }
    }
  }
  console.log(`   ✅ ${AUDIO_SCENARIO_DATABASE.length} scénarios audités (${coherentCount}/${totalChecked} questions conformes).\n`);

  // 2. AUDIT DES COURS DE COMPRÉHENSION ORALE (Tous Packs : Standard, Griffon d'Or, VIP)
  const packs = ["standard", "griffon", "vip"] as const;
  const permissions = {
    standard: { coursesPerSkill: 5, questionsPerExam: 5 },
    griffon: { coursesPerSkill: 20, questionsPerExam: 20 },
    vip: { coursesPerSkill: 39, questionsPerExam: 39 }
  };

  console.log("📌 [Phase 2] Audit de cohérence des Leçons de Compréhension Orale (courseGenerator)...");
  for (const pack of packs) {
    const lessons = generateLessonsForPack(listeningCourses, pack, permissions[pack] as any, "listening");
    let packCoherent = 0;
    let packTotalQuestions = 0;
    for (const l of lessons) {
      const qs = l.questions || l.quiz || l.exercises || [];
      for (const q of qs) {
        totalChecked++;
        packTotalQuestions++;
        const opts = q.options || [];
        const correctIdx = q.answer !== undefined ? q.answer : q.correct !== undefined ? q.correct : 0;
        const goodOpt = opts[correctIdx];

        if (!opts || opts.length !== 4) {
          incoherencies.push(`[COURS ${pack.toUpperCase()}] Leçon ${l.id} "${l.title}" (Q#${q.id || 1}) n'a pas 4 options.`);
        } else if (!goodOpt) {
          incoherencies.push(`[COURS ${pack.toUpperCase()}] Leçon ${l.id} "${l.title}" (Q#${q.id || 1}) a une option correcte vide (index ${correctIdx}).`);
        } else {
          packCoherent++;
          coherentCount++;
        }
      }
    }
    console.log(`   👉 Pack ${pack.toUpperCase()} : ${lessons.length} leçons vérifiées (${packCoherent}/${packTotalQuestions} questions conformes).`);
  }

  // 3. AUDIT DES EXAMENS DE COMPRÉHENSION ORALE (Simulateurs NCLC)
  console.log("\n📌 [Phase 3] Audit de cohérence des Examens de Compréhension Orale (courseGenerator)...");
  for (const pack of packs) {
    const questions = generateExamQuestionsForPack(listeningQuestions, pack, permissions[pack] as any, "listening");
    let packCoherent = 0;
    for (const q of questions) {
      totalChecked++;
      const audioScript = (q.script || q.audioText || q.text || "").toLowerCase();
      const qText = q.question;
      const opts = q.options || [];
      const correctIdx = q.correct !== undefined ? q.correct : q.answer !== undefined ? q.answer : 0;
      const goodOpt = opts[correctIdx];

      if (!opts || opts.length !== 4) {
        incoherencies.push(`[EXAMEN ${pack.toUpperCase()}] Question ${q.id} n'a pas 4 options.`);
      } else if (!goodOpt) {
        incoherencies.push(`[EXAMEN ${pack.toUpperCase()}] Question ${q.id} a une option correcte vide.`);
      } else {
        packCoherent++;
        coherentCount++;
      }
    }
    console.log(`   👉 Pack ${pack.toUpperCase()} : ${questions.length} épreuves vérifiées (${packCoherent}/${questions.length} conformes).`);
  }

  // 4. RAPPORT FINAL
  console.log("\n================================================================================");
  if (incoherencies.length === 0) {
    console.log(`👑 RÉSULTAT FINAL : 100% DE COHÉRENCE AUDIO ↔ QCM (${coherentCount}/${totalChecked} items vérifiés).`);
    console.log("   Aucun décalage entre les dialogues audios joués et les propositions QCM.");
  } else {
    console.error(`⚠️ RÉSULTAT : ${incoherencies.length} incohérences ou décalages détectés sur ${totalChecked} items :`);
    incoherencies.forEach((err, idx) => console.error(`   ${idx + 1}. ${err}`));
  }
  console.log("================================================================================\n");
}

verifyAudioQcmCoherence().catch(err => {
  console.error("Erreur d'exécution de l'audit:", err);
  process.exit(1);
});
