import { PackType, PackPermissions } from "./subscriptionEngine";
import { listeningCourses, readingCourses, writingCourses, speakingCourses } from "../data/realCourses";
import { listeningQuestions, readingPassages, writingTasks, speakingTasks } from "../data/realExams";

function filterByPack(items: any[], pack: PackType) {
  if (items.length === 0) return items;
  if (pack === "standard") return items.slice(0, Math.min(2, items.length));
  if (pack === "griffon") return items.slice(0, Math.min(4, items.length));
  return items; // VIP
}

function fillToTarget(items: any[], targetCount: number) {
  if (items.length === 0 || targetCount === 0) return items;
  const result = [];
  let idCounter = 1;
  for (let i = 0; i < targetCount; i++) {
    const originalItem = items[i % items.length];
    const clone = { ...originalItem, id: idCounter };
    if (i >= items.length) {
      if (clone.title) {
        clone.title = `${originalItem.title} (Entraînement #${Math.floor(i / items.length) + 1})`;
      }
      if (clone.question) {
        clone.question = `${originalItem.question} (Variante #${Math.floor(i / items.length) + 1})`;
      }
    }
    result.push(clone);
    idCounter++;
  }
  return result;
}

export function generateLessonsForPack(baseLessons: any[], currentPack: PackType, packConfig: PackPermissions, type: "listening"|"reading"|"writing"|"speaking" = "listening") {
  let realData = [];
  switch (type) {
    case "listening": realData = listeningCourses; break;
    case "reading": realData = readingCourses; break;
    case "writing": realData = writingCourses; break;
    case "speaking": realData = speakingCourses; break;
  }
  const filtered = filterByPack(realData, currentPack);
  return fillToTarget(filtered, packConfig.coursesCount);
}

export function generateExamQuestionsForPack(baseQuestions: any[], currentPack: PackType, packConfig: PackPermissions, type: "reading"|"listening"|"writing"|"speaking") {
  if (type === "listening") {
    const filtered = filterByPack(listeningQuestions, currentPack);
    return fillToTarget(filtered, packConfig.questionsPerExam);
  }
  return [];
}

export function generateExamPassagesForPack(basePassages: any[], currentPack: PackType, packConfig: PackPermissions) {
  const filtered = filterByPack(readingPassages, currentPack);
  // Pour la CE, packConfig.questionsPerExam est le nombre total de *questions* attendues, pas de *textes*.
  // Dans notre fichier réel, chaque texte a 2 questions.
  const targetPassages = Math.ceil(packConfig.questionsPerExam / 2);
  const result = fillToTarget(filtered, targetPassages);
  
  // Refaire les IDs des questions pour éviter les conflits React key
  let qIdCounter = 1;
  result.forEach(passage => {
    passage.questions = passage.questions.map((q: any) => ({ ...q, id: qIdCounter++ }));
  });
  
  return result;
}

export function generateExamWritingTasksForPack(baseTasks: any[], currentPack: PackType, packConfig: PackPermissions, type: "writing"|"speaking") {
  // Pour PE et PO, il y a généralement 3 tâches. Pour atteindre le quota, on fixe une limite visuelle acceptable
  const targetCount = packConfig.questionsPerExam > 10 ? 10 : packConfig.questionsPerExam;
  if (type === "writing") {
    const filtered = filterByPack(writingTasks, currentPack);
    return fillToTarget(filtered, targetCount);
  } else {
    const filtered = filterByPack(speakingTasks, currentPack);
    return fillToTarget(filtered, targetCount);
  }
}


