import { PACK_CONFIGS, PackType } from "./subscriptionEngine";
import { generateLessonsForPack, generateExamQuestionsForPack, generateExamPassagesForPack, generateExamWritingTasksForPack } from "./courseGenerator";
import { listeningCourses, readingCourses, writingCourses, speakingCourses } from "../data/realCourses";
import { listeningQuestions, readingPassages, writingTasks, speakingTasks } from "../data/realExams";

console.log("====================================================================");
console.log("   AUDIT DE COHÉRENCE PÉDAGOGIQUE TCF CANADA (COURS & EXAMENS)      ");
console.log("====================================================================");

const packs: PackType[] = ["standard", "griffon", "vip"];
const skills: ("listening" | "reading" | "writing" | "speaking")[] = ["listening", "reading", "writing", "speaking"];

let totalItemsChecked = 0;
let totalQuestionsChecked = 0;
let coherenceErrors = 0;
let outOfBoundsErrors = 0;
let emptyFieldsErrors = 0;

for (const pack of packs) {
  const config = PACK_CONFIGS[pack];
  console.log(`\n>>> AUDIT DE COHÉRENCE : ${config.name.toUpperCase()} (${pack}) <<<`);
  
  // 1. Audit de cohérence des cours (Leçons)
  for (const skill of skills) {
    const baseC = skill === "listening" ? listeningCourses : skill === "reading" ? readingCourses : skill === "writing" ? writingCourses : speakingCourses;
    const lessons = generateLessonsForPack(baseC, pack, config, skill);
    totalItemsChecked += lessons.length;
    
    let lessonErrors = 0;
    let lessonQuestions = 0;

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      // Vérification des champs de base
      if (!l.title || !l.duration) {
        emptyFieldsErrors++;
        lessonErrors++;
        if (lessonErrors <= 3) console.error(`  [Erreur] Leçon #${l.id} (${skill}): Titre ou durée manquant.`);
      }

      // Vérification spécifique par compétence
      const mainText = l.text || l.audioText || (l as any).script || "";
      if (!mainText && skill !== "writing" && skill !== "speaking") {
        emptyFieldsErrors++;
        lessonErrors++;
        if (lessonErrors <= 3) console.error(`  [Erreur] Leçon #${l.id} (${skill}): Texte / AudioText vide.`);
      }

      // Vérification des QCM et questions
      if (l.questions && Array.isArray(l.questions)) {
        for (let qIdx = 0; qIdx < l.questions.length; qIdx++) {
          const q = l.questions[qIdx];
          lessonQuestions++;
          totalQuestionsChecked++;

          if (!q.q || !Array.isArray(q.options) || q.options.length < 2) {
            emptyFieldsErrors++;
            lessonErrors++;
            if (lessonErrors <= 3) console.error(`  [Erreur] Leçon #${l.id} Q#${qIdx+1}: Question ou options invalides.`);
            continue;
          }

          const ansIdx = q.answer !== undefined ? q.answer : q.correct;
          if (typeof ansIdx !== "number" || ansIdx < 0 || ansIdx >= q.options.length) {
            outOfBoundsErrors++;
            lessonErrors++;
            if (lessonErrors <= 3) console.error(`  [Erreur Index] Leçon #${l.id} Q#${qIdx+1}: Index de réponse ${ansIdx} hors limites [0-${q.options.length-1}].`);
          }

          const correctOptionText = q.options[ansIdx] || "";
          if (!correctOptionText.trim()) {
            coherenceErrors++;
            lessonErrors++;
            if (lessonErrors <= 3) console.error(`  [Erreur Cohérence] Leçon #${l.id} Q#${qIdx+1}: L'option correcte est vide.`);
          }
        }
      }
    }
    console.log(`  [Cours ${skill.padEnd(9)}] ${lessons.length.toString().padStart(5)} leçons | ${lessonQuestions.toString().padStart(5)} questions QCM | Conformité : ${lessonErrors === 0 ? "✅ 100%" : "❌ " + lessonErrors + " erreurs"}`);
  }

  // 2. Audit de cohérence des examens (Tests)
  console.log("  ---");
  const coExams = generateExamQuestionsForPack(listeningQuestions, pack, config, "listening");
  const ceExams = generateExamPassagesForPack(readingPassages, pack, config);
  const eeExams = generateExamWritingTasksForPack(writingTasks, pack, config, "writing");
  const eoExams = generateExamWritingTasksForPack(speakingTasks, pack, config, "speaking");

  const checkExamCoherence = (items: any[], name: string, type: "qcm" | "passage" | "task") => {
    totalItemsChecked += items.length;
    let errors = 0;
    let qCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (type === "qcm") {
        qCount++;
        totalQuestionsChecked++;
        if (!item.question || !Array.isArray(item.options) || item.options.length < 2) {
          emptyFieldsErrors++;
          errors++;
          continue;
        }
        const ansIdx = item.correct !== undefined ? item.correct : item.answer;
        if (typeof ansIdx !== "number" || ansIdx < 0 || ansIdx >= item.options.length) {
          outOfBoundsErrors++;
          errors++;
        }
        if (!item.audioText && !item.audioUrl && !item.script) {
          emptyFieldsErrors++;
          errors++;
        }
      } else if (type === "passage") {
        if (!item.title || !item.content || !Array.isArray(item.questions)) {
          emptyFieldsErrors++;
          errors++;
          continue;
        }
        for (const q of item.questions) {
          qCount++;
          totalQuestionsChecked++;
          if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
            emptyFieldsErrors++;
            errors++;
            continue;
          }
          if (typeof q.correct !== "number" || q.correct < 0 || q.correct >= q.options.length) {
            outOfBoundsErrors++;
            errors++;
          }
        }
      } else if (type === "task") {
        qCount++;
        totalQuestionsChecked++;
        if (!item.title || !item.prompt || !item.level) {
          emptyFieldsErrors++;
          errors++;
        }
        if (!item.minWords && !item.prepTimeMinutes && !item.durationSeconds && !item.durationMinutes) {
          emptyFieldsErrors++;
          errors++;
        }
      }
    }
    console.log(`  [Examen ${name.padEnd(8)}] ${items.length.toString().padStart(5)} épreuves | ${qCount.toString().padStart(5)} sous-tâches/QCM | Conformité : ${errors === 0 ? "✅ 100%" : "❌ " + errors + " erreurs"}`);
  };

  checkExamCoherence(coExams, "CO (Audio)", "qcm");
  checkExamCoherence(ceExams, "CE (Text)", "passage");
  checkExamCoherence(eeExams, "EE (Task)", "task");
  checkExamCoherence(eoExams, "EO (Task)", "task");
}

console.log("\n====================================================================");
console.log(`RÉSULTAT DU SCAN DE COHÉRENCE PÉDAGOGIQUE`);
console.log(`- Total d'items d'apprentissage vérifiés : ${totalItemsChecked}`);
console.log(`- Total de questions / QCM auditées        : ${totalQuestionsChecked}`);
console.log(`- Erreurs d'index hors limites [0, N-1]    : ${outOfBoundsErrors}`);
console.log(`- Erreurs de champs vides ou manquants     : ${emptyFieldsErrors}`);
console.log(`- Erreurs de cohérence question/réponse    : ${coherenceErrors}`);
console.log("====================================================================");

if (outOfBoundsErrors === 0 && emptyFieldsErrors === 0 && coherenceErrors === 0) {
  console.log("CERTIFICATION RÉUSSIE : 100% DE COHÉRENCE PÉDAGOGIQUE SUR LA PLATAFORME !");
} else {
  console.log("ATTENTION : Des incohérences ont été détectées et nécessitent une correction.");
}
