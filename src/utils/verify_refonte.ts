import { PACK_CONFIGS, PackType } from "./subscriptionEngine";
import { generateLessonsForPack, generateExamQuestionsForPack, generateExamPassagesForPack, generateExamWritingTasksForPack } from "./courseGenerator";
import { listeningCourses, readingCourses, writingCourses, speakingCourses } from "../data/realCourses";
import { listeningQuestions, readingPassages, writingTasks, speakingTasks } from "../data/realExams";

console.log("====================================================================");
console.log("   VÉRIFICATION PROFESSIONNELLE DE LA REFONTE DU MOTEUR TCF CANADA  ");
console.log("====================================================================");

const packs: PackType[] = ["standard", "griffon", "vip"];
const skills: ("listening" | "reading" | "writing" | "speaking")[] = ["listening", "reading", "writing", "speaking"];

let totalCourses = 0;
let totalCoursesDupes = 0;
let totalExams = 0;
let totalExamsDupes = 0;

for (const pack of packs) {
  const config = PACK_CONFIGS[pack];
  console.log(`\n>>> ANALYSE DU PACK : ${config.name.toUpperCase()} (${pack}) <<<`);
  
  // 1. Vérification des cours
  for (const skill of skills) {
    const baseC = skill === "listening" ? listeningCourses : skill === "reading" ? readingCourses : skill === "writing" ? writingCourses : speakingCourses;
    const lessons = generateLessonsForPack(baseC, pack, config, skill);
    totalCourses += lessons.length;
    
    const seenTexts = new Set<string>();
    const seenTitles = new Set<string>();
    let textDupes = 0;
    let titleDupes = 0;

    for (let i = 0; i < lessons.length; i++) {
      const l = lessons[i];
      const normText = (l.text || l.audioText || "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 150);
      const normTitle = (l.title || "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 100);
      
      if (seenTexts.has(normText)) textDupes++;
      else seenTexts.add(normText);

      if (seenTitles.has(normTitle)) titleDupes++;
      else seenTitles.add(normTitle);
    }
    totalCoursesDupes += textDupes;
    console.log(`  [Cours ${skill.padEnd(9)}] ${lessons.length.toString().padStart(5)} items | Doublons de texte : ${textDupes.toString().padStart(4)} (${((textDupes/lessons.length)*100).toFixed(2)}%) | Doublons de titre : ${titleDupes}`);
  }

  // 2. Vérification des examens
  console.log("  ---");
  const coExams = generateExamQuestionsForPack(listeningQuestions, pack, config, "listening");
  const ceExams = generateExamPassagesForPack(readingPassages, pack, config);
  const eeExams = generateExamWritingTasksForPack(writingTasks, pack, config, "writing");
  const eoExams = generateExamWritingTasksForPack(speakingTasks, pack, config, "speaking");

  const checkExamDupes = (items: any[], name: string, field: string) => {
    totalExams += items.length;
    const seen = new Set<string>();
    let dupes = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const val = (item[field] || "").toString().toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 150);
      if (seen.has(val)) dupes++;
      else seen.add(val);
    }
    totalExamsDupes += dupes;
    console.log(`  [Examen ${name.padEnd(8)}] ${items.length.toString().padStart(5)} items | Doublons sur "${field}" : ${dupes.toString().padStart(4)} (${((dupes/items.length)*100).toFixed(2)}%)`);
  };

  checkExamDupes(coExams, "CO (Audio)", "audioText");
  checkExamDupes(ceExams, "CE (Text)", "content");
  checkExamDupes(eeExams, "EE (Task)", "prompt");
  checkExamDupes(eoExams, "EO (Task)", "prompt");
}

console.log("\n====================================================================");
console.log(`RÉSULTAT GLOBAL COURS   : ${totalCourses} items vérifiés | ${totalCoursesDupes} doublons textuels`);
console.log(`RÉSULTAT GLOBAL EXAMENS : ${totalExams} items vérifiés | ${totalExamsDupes} doublons`);
console.log("====================================================================");
if (totalCoursesDupes === 0 && totalExamsDupes === 0) {
  console.log("SUCCÈS TOTAL : 0% DE DOUBLONS ! REFONTE 100% CONFORME ET VALIDÉE.");
} else {
  console.log("ATTENTION : Des doublons résiduels ont été détectés.");
}
