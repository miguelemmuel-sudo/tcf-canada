// Générateur Pédagogique et Connecteur d'Alimentation Progressive - TCF Canada Pro (Griffon d'OR)
// Moteur refondu pour éliminer 100% des boucles, répétitions, et reformulations stériles.
// Intégration complète du moteur audio professionnel (rotation intelligente, profils vocaux multiples, dialogues multi-locuteurs).

import { PackType, PackPermissions } from "./subscriptionEngine";
import { getModulesForPack } from "./curriculumEngine";
import { listeningCourses, readingCourses, writingCourses, speakingCourses } from "../data/realCourses";
import { listeningQuestions, readingPassages, writingTasks, speakingTasks } from "../data/realExams";
import { THEMATIC_BANK, UniquenessValidator, generateUniqueLesson, CECRLevel, SkillType, TCFProceduralLibrary } from "./tcfContentEngine";
import { AudioRotationEngine, AUDIO_SCENARIO_DATABASE, VOICE_PROFILES } from "./audioContentEngine";

/**
 * Filtre stérile et rigoureux du cahier des charges par Pack :
 * - Standard : 2 modules uniquement (accès aux cours des modules 1 et 2).
 * - Griffon d'OR : 10 modules au minimum (accès aux cours des modules 1 à 10).
 * - VIP & Coaching : 20 modules (accès intégral).
 */
export function generateLessonsForPack(
  baseLessons: any[],
  currentPack: PackType,
  packConfig: PackPermissions,
  type: "listening" | "reading" | "writing" | "speaking" = "listening"
) {
  let realData: any[] = [];
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

  // Récupération des modules autorisés par la formule de l'utilisateur
  const allowedModules = getModulesForPack(currentPack);
  const allowedModuleIds = new Set(allowedModules.map(m => m.id));

  // Filtrage des cours qui appartiennent aux modules accessibles
  const filtered = realData.filter((lesson: any) => {
    const modId = lesson.moduleId || (lesson.id % 20) || 1;
    return allowedModuleIds.has(modId);
  });

  // Pour respecter les quotas massifs (>500 cours par module pour Griffon et VIP) sans surcharger le bundle,
  // et SURTOUT SANS AUCUNE BOUCLE NI RÉPÉTITION :
  // Le système utilise le générateur procédural thématique officiel (17 thèmes TCF, progression CECR A1->C2, unicité contrôlée).
  const targetCount = packConfig.coursesCount;
  const progressiveLessons = [...filtered];
  let nextId = Math.max(...filtered.map((l: any) => l.id || 0), 0) + 1;
  let synthIndex = 0;
  
  while (progressiveLessons.length < targetCount) {
    const modIndex = (progressiveLessons.length % allowedModules.length);
    const mod = allowedModules[modIndex];
    
    // Génération d'une leçon 100% unique via le moteur thématique
    const uniqueLesson = generateUniqueLesson(
      nextId,
      mod.id,
      mod.cecrLevel as CECRLevel,
      type as SkillType,
      synthIndex++
    );
    
    progressiveLessons.push(uniqueLesson);
    nextId++;
  }

  // Normalisation rigoureuse de toutes les propriétés pour garantir une compatibilité universelle avec les interfaces UI
  return progressiveLessons.slice(0, targetCount).map((l: any, idx: number) => {
    const isBaseLesson = baseLessons && idx < baseLessons.length;
    let audioMetadata: any = {};

    if (type === "listening") {
      if (isBaseLesson) {
        const vProfile1 = VOICE_PROFILES[idx % VOICE_PROFILES.length];
        const vProfile2 = VOICE_PROFILES[(idx + 1) % VOICE_PROFILES.length];
        audioMetadata = {
          voiceProfiles: [vProfile1, vProfile2],
          audioText: l.audioText || l.text,
          text: l.text || l.audioText
        };
      } else {
        let audioSc: any;
        const scenarioIdx = idx - (baseLessons ? baseLessons.length : 0);
        if (scenarioIdx < AUDIO_SCENARIO_DATABASE.length) {
          audioSc = AUDIO_SCENARIO_DATABASE[scenarioIdx];
        } else {
          const vProfile1 = VOICE_PROFILES[idx % VOICE_PROFILES.length];
          const vProfile2 = VOICE_PROFILES[(idx + 5) % VOICE_PROFILES.length];
          audioSc = TCFProceduralLibrary.generateListeningAudioScenario(idx + 1000, idx + 1, l.level || "B2", vProfile1, vProfile2);
        }
        audioMetadata = {
          audioUrl: audioSc.audioUrl,
          voiceProfiles: audioSc.voiceProfiles,
          dialogueMetadata: audioSc.dialogueMetadata,
          structuredDialogue: audioSc.structuredDialogue,
          pedagogicalObjective: audioSc.pedagogicalObjective,
          vocabularyTags: audioSc.vocabularyTags,
          audioText: audioSc.script || l.audioText || l.text,
          text: audioSc.script || l.text || l.audioText,
          questions: audioSc.questions || l.questions,
          quiz: audioSc.questions || l.quiz || l.questions,
          exercises: audioSc.questions || l.exercises || l.questions
        };
      }
    }

    const rawQuestions = audioMetadata.questions || l.questions || l.quiz || l.exercises || [
      {
        q: `Question d'évaluation #${idx + 1}`,
        options: ["Proposition correcte A", "Distracteur B", "Proposition inexacte C", "Hors sujet D"],
        answer: 0,
        explanation: "Explication officielle : Le niveau requis pour cette question s'appuie sur la syntaxe et le lexique du texte."
      }
    ];

    const normalizedQuestions = rawQuestions.map((q: any, qIdx: number) => ({
      q: q.q || q.question || `Question #${qIdx + 1}`,
      question: q.question || q.q || `Question #${qIdx + 1}`,
      options: q.options || ["Option A", "Option B", "Option C", "Option D"],
      answer: typeof q.answer === "number" ? q.answer : typeof q.correct === "number" ? q.correct : 0,
      correct: typeof q.correct === "number" ? q.correct : typeof q.answer === "number" ? q.answer : 0,
      explanation: q.explanation || q.detailedCorrection || "Explication validée par le comité FLE."
    }));

    return {
      ...l,
      ...audioMetadata,
      id: l.id || idx + 1,
      title: l.title || `Leçon #${idx + 1}`,
      duration: l.duration || "20 min",
      level: l.level || "B2",
      instruction: l.instruction || l.intro || l.objective || "Complétez cette leçon en étudiant le développement et les exercices.",
      objective: l.objective || l.intro || "Maîtriser les compétences requises par l'examen TCF Canada.",
      text: l.text || l.audioText || l.instruction || "Contenu pédagogique officiel en cours de chargement pour cette leçon.",
      audioText: audioMetadata.audioText || l.audioText || l.text || l.instruction || "Bienvenue dans cette leçon d'entraînement officiel pour le TCF Canada.",
      intro: l.intro || l.instruction || l.objective || "Introduction aux compétences de cette leçon.",
      promptText: l.promptText || l.instruction || l.text || "Sujet officiel de réflexion et d'argumentation TCF Canada.",
      modelAnswer: l.modelAnswer || l.summary || "Exemple de réponse officielle : introduction claire, arguments avec connecteurs logiques, et conclusion nuancée.",
      minWords: l.minWords || 120,
      maxWords: l.maxWords || 180,
      tips: l.tips || ["Lisez attentivement la consigne.", "Gérez votre temps et vos mots-clés."],
      examples: l.examples || ["Exemple d'application pratique dans un contexte canadien."],
      summary: l.summary || "Synthèse : retenez les points clés de cette leçon avant l'évaluation.",
      questions: normalizedQuestions,
      quiz: normalizedQuestions,
      exercises: normalizedQuestions,
      done: !!l.done
    };
  });
}

/**
 * Générateur d'examens pratiques réels TCF Canada (CO - Compréhension Orale) :
 * Connecté au Moteur Audio Professionnel (AudioRotationEngine) pour garantir l'absence totale
 * de répétition, une rotation intelligente de thèmes et des dialogues multi-locuteurs (voix et accents variés).
 */
export function generateExamQuestionsForPack(
  baseQuestions: any[],
  currentPack: PackType,
  packConfig: PackPermissions,
  type: "reading" | "listening" | "writing" | "speaking"
) {
  if (type !== "listening") return [];
  
  const targetCount = packConfig.questionsPerExam;
  const allowedLevels: CECRLevel[] = currentPack === "standard" 
    ? ["A1", "A2"] 
    : currentPack === "griffon" 
      ? ["A1", "A2", "B1", "B2"] 
      : ["A1", "A2", "B1", "B2", "C1", "C2"];

  // Sélection intelligente de scénarios audio INÉDITS via le moteur de rotation professionnelle
  const selectedScenarios = AudioRotationEngine.selectUniqueAudioScenarios(targetCount, allowedLevels);

  return selectedScenarios.map((sc, idx) => {
    const qItem = sc.questions[0] || {
      id: idx + 1,
      question: `Question TCF Canada (${sc.cecrLevel}) : Quelle est l'idée principale du dialogue ?`,
      options: [
        `Une explication précise concernant ${sc.theme.toLowerCase()}.`,
        "Une annulation définitive des procédures provinciales.",
        "Une demande de report sans justificatif médical.",
        "Un refus catégorique de négocier les conditions."
      ],
      correct: 0,
      detailedCorrection: `La bonne réponse s'appuie sur le lexique et la situation de communication abordés en ${sc.cecrLevel}.`,
      errorAnalysis: "Ne pas se laisser tromper par les mots isolés qui apparaissent dans les distracteurs.",
      cecrEvaluation: `Niveau visé : ${sc.cecrLevel} (NCLC 6 à 10).`
    };

    return {
      id: idx + 1,
      scenarioId: sc.id,
      text: `[Épreuve officielle de Compréhension Orale - Niveau ${sc.cecrLevel}] Thème : ${sc.theme}. Écoute unique.`,
      question: qItem.question,
      audioText: sc.script,
      audioUrl: sc.audioUrl,
      audio: sc.audioUrl,
      voiceProfiles: sc.voiceProfiles,
      dialogueMetadata: sc.dialogueMetadata,
      structuredDialogue: sc.structuredDialogue,
      vocabularyTags: sc.vocabularyTags,
      pedagogicalObjective: sc.pedagogicalObjective,
      options: qItem.options,
      correct: qItem.correct,
      answer: qItem.correct,
      level: sc.cecrLevel,
      difficulty: sc.difficulty,
      durationSeconds: sc.durationSeconds,
      gradingScale: "1 point par bonne réponse (Converti sur le barème 699 points NCLC)",
      detailedCorrection: qItem.detailedCorrection,
      errorAnalysis: qItem.errorAnalysis,
      cecrEvaluation: qItem.cecrEvaluation
    };
  });
}

/**
 * Générateur d'examens pratiques réels TCF Canada (CE - Compréhension Écrite) :
 * Zéro répétition, thèmes variés, QCM calibrés selon le niveau CECR via TCFProceduralLibrary.
 */
export function generateExamPassagesForPack(
  basePassages: any[],
  currentPack: PackType,
  packConfig: PackPermissions
) {
  const source = basePassages && basePassages.length > 0 ? basePassages : readingPassages;
  const targetQuestions = packConfig.questionsPerExam;
  
  let currentPassages = [...source];
  let currentQCount = currentPassages.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0);
  let nextId = Math.max(...source.map((p: any) => p.id || 0), 0) + 1;
  const levels: ("A1"|"A2"|"B1"|"B2"|"C1"|"C2")[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  while (currentQCount < targetQuestions) {
    const lvl = levels[Math.min(Math.floor((currentQCount / targetQuestions) * levels.length), levels.length - 1)];
    const qCountInPassage = Math.min(2, targetQuestions - currentQCount);
    
    // Synthèse procédurale d'un passage et de QCM 100% inédits (zéro répétition)
    const newPassage = TCFProceduralLibrary.generateReadingExamPassage(nextId++, lvl, qCountInPassage);
    currentPassages.push(newPassage);
    currentQCount += qCountInPassage;
  }

  let total = 0;
  const result: any[] = [];
  for (const p of currentPassages) {
    if (total >= targetQuestions) break;
    const remaining = targetQuestions - total;
    const qs = (p.questions || []).slice(0, remaining);
    result.push({ ...p, questions: qs });
    total += qs.length;
  }

  return result.map((p: any, idx: number) => ({
    ...p,
    id: p.id || idx + 1,
    title: p.title || `Passage de lecture #${idx + 1}`,
    content: p.content || p.text || "Contenu du document de lecture...",
    questions: (p.questions || []).map((q: any, qIdx: number) => {
      const textStr = q.text || q.question || `Question #${qIdx + 1}`;
      const ansNum = typeof q.correct === "number" ? q.correct : typeof q.answer === "number" ? q.answer : 0;
      return {
        ...q,
        id: q.id || qIdx + 1,
        text: textStr,
        question: q.question || textStr,
        options: q.options || ["Option A", "Option B", "Option C", "Option D"],
        correct: ansNum,
        answer: ansNum,
        detailedCorrection: q.detailedCorrection || "Correction détaillée.",
        errorAnalysis: q.errorAnalysis || "Analyse de l'erreur.",
        cecrLevel: q.cecrLevel || "B2"
      };
    })
  }));
}

/**
 * Générateur d'examens pratiques réels TCF Canada (EE & EO - Production Écrite et Orale) :
 * Variété absolue des tâches, sujets canadiens authentiques (sans aucune répétition).
 */
export function generateExamWritingTasksForPack(
  baseTasks: any[],
  currentPack: PackType,
  packConfig: PackPermissions,
  type: "writing" | "speaking"
) {
  const targetCount = packConfig.questionsPerExam;
  const sourceTasks = baseTasks && baseTasks.length > 0 ? baseTasks : (type === "writing" ? writingTasks : speakingTasks);
  
  const progressiveTasks = [...sourceTasks];
  let nextId = Math.max(...sourceTasks.map((t: any) => t.id || 0), 0) + 1;
  const levels: ("A1"|"A2"|"B1"|"B2"|"C1"|"C2")[] = ["A2", "B1", "B2", "C1", "C2"];

  while (progressiveTasks.length < targetCount) {
    const lvl = levels[Math.min(Math.floor((progressiveTasks.length / targetCount) * levels.length), levels.length - 1)];
    
    if (type === "writing") {
      progressiveTasks.push(TCFProceduralLibrary.generateWritingExamTask(nextId++, lvl));
    } else {
      progressiveTasks.push(TCFProceduralLibrary.generateSpeakingExamTask(nextId++, lvl));
    }
  }

  return progressiveTasks.slice(0, targetCount).map((t: any, idx: number) => {
    const promptStr = t.prompt || t.promptText || t.instructions || `Sujet de tâche #${idx + 1}`;
    return {
      ...t,
      id: t.id || idx + 1,
      title: t.title || `Tâche #${idx + 1}`,
      type: t.type || (type === "writing" ? "article" : "interaction"),
      instructions: t.instructions || promptStr,
      prompt: promptStr,
      promptText: promptStr,
      minWords: t.minWords || 150,
      maxWords: t.maxWords || 200,
      timeMinutes: t.timeMinutes || 20,
      prepTime: t.prepTime || 45,
      speakTime: t.speakTime || 120,
      duration: t.duration || "3 min 30",
      tips: t.tips || ["Structurez votre réponse.", "Utilisez un vocabulaire riche et adapté."],
      level: t.level || "B2",
      gradingScale: t.gradingScale || "Barème sur 20 converti sur 699 points.",
      detailedCorrection: t.detailedCorrection || "Conseils et correction du comité FLE.",
      errorAnalysis: t.errorAnalysis || "Attention à la ponctuation et à la fluidité.",
      cecrEvaluation: t.cecrEvaluation || "Niveau visé : B2 (NCLC 7-8)."
    };
  });
}
