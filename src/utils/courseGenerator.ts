import { PackType, PackPermissions } from "./subscriptionEngine";
import { listeningCourses, readingCourses, writingCourses, speakingCourses } from "../data/realCourses";
import { listeningQuestions, readingPassages, writingTasks, speakingTasks } from "../data/realExams";

function filterByPack(items: any[], pack: PackType) {
  if (!items || items.length === 0) return [];
  if (pack === "standard") return items.slice(0, Math.max(1, Math.ceil(items.length * 0.4)));
  if (pack === "griffon") return items.slice(0, Math.max(2, Math.ceil(items.length * 0.8)));
  return items; // VIP
}

function fillToTarget(items: any[], targetCount: number) {
  if (!items || items.length === 0 || targetCount === 0) return [];
  // En production : AUCUNE duplication ni répétition artificielle de cours ou de questions !
  // Chaque cours et chaque question doit être 100% unique, indépendant et authentique.
  const limit = Math.min(items.length, targetCount);
  return items.slice(0, limit);
}

export function generateLessonsForPack(baseLessons: any[], currentPack: PackType, packConfig: PackPermissions, type: "listening"|"reading"|"writing"|"speaking" = "listening") {
  let realData = [];
  if (baseLessons && baseLessons.length > 0) {
    realData = baseLessons;
  } else {
    switch (type) {
      case "listening": realData = listeningCourses; break;
      case "reading": realData = readingCourses; break;
      case "writing": realData = writingCourses; break;
      case "speaking": realData = speakingCourses; break;
    }
  }
  const filtered = filterByPack(realData, currentPack);
  return fillToTarget(filtered, packConfig.coursesCount);
}

export function generateExamQuestionsForPack(baseQuestions: any[], currentPack: PackType, packConfig: PackPermissions, type: "reading"|"listening"|"writing"|"speaking") {
  if (type === "listening") {
    const source = baseQuestions && baseQuestions.length > 0 ? baseQuestions : listeningQuestions;
    const filtered = filterByPack(source, currentPack);
    return fillToTarget(filtered, packConfig.questionsPerExam);
  }
  return [];
}

export function generateExamPassagesForPack(basePassages: any[], currentPack: PackType, packConfig: PackPermissions) {
  const source = basePassages && basePassages.length > 0 ? basePassages : readingPassages;
  const filtered = filterByPack(source, currentPack);
  const targetPassages = Math.ceil(packConfig.questionsPerExam / 2);
  const result = fillToTarget(filtered, targetPassages);
  
  // Clonage profond des passages et refonte propre des IDs des questions sans muter les données sources
  let qIdCounter = 1;
  return result.map((passage: any) => ({
    ...passage,
    questions: (passage.questions || []).map((q: any) => ({ ...q, id: qIdCounter++ }))
  }));
}

export function generateExamWritingTasksForPack(baseTasks: any[], currentPack: PackType, packConfig: PackPermissions, type: "writing"|"speaking") {
  const targetCount = packConfig.questionsPerExam > 10 ? 10 : packConfig.questionsPerExam;
  const sourceTasks = baseTasks && baseTasks.length > 0 ? baseTasks : (type === "writing" ? writingTasks : speakingTasks);
  const filtered = filterByPack(sourceTasks, currentPack);
  return fillToTarget(filtered, targetCount);
}


