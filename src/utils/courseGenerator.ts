// Générateur Pédagogique et Connecteur d'Alimentation Progressive - TCF Canada Pro (Griffon d'OR)
// Moteur refondu pour éliminer 100% des boucles, répétitions, et reformulations stériles.
// Intégration complète du moteur audio professionnel (rotation intelligente, profils vocaux multiples, dialogues multi-locuteurs).

import { PackType, PackPermissions } from "./subscriptionEngine";
import { getModulesForPack } from "./curriculumEngine";
import { listeningCourses, readingCourses, writingCourses, speakingCourses } from "../data/realCourses";
import { listeningQuestions, readingPassages, writingTasks, speakingTasks } from "../data/realExams";
import { THEMATIC_BANK, UniquenessValidator, generateUniqueLesson, CECRLevel, SkillType, TCFProceduralLibrary } from "./tcfContentEngine";
import { AudioRotationEngine, AUDIO_SCENARIO_DATABASE, VOICE_PROFILES } from "./audioContentEngine";
import { QcmUniqueBankEngine } from "./qcmUniqueBankEngine";
import { sanitizeLessonOrExam } from "./textSanitizer";

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
          script: (l as any).script || l.audioText || l.text,
          structuredDialogue: (l as any).structuredDialogue,
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
        options: null, // forcer la génération unique
        answer: 0,
        explanation: null
      }
    ];

    // Utilitaires de rotation locaux (uniquement pour les options déjà cohérentes)
    function rotatePos(lessonId: number, qIndex: number): number {
      return (lessonId * 11 + qIndex * 17 + 3) % 4;
    }
    function swapToPos(opts: string[], newPos: number, oldPos: number): string[] {
      if (newPos === oldPos || newPos >= opts.length) return opts;
      const out = [...opts];
      const tmp = out[newPos]; out[newPos] = out[oldPos]; out[oldPos] = tmp;
      return out;
    }

    const normalizedQuestions = rawQuestions.map((q: any, qIdx: number) => {
      const qText = q.q || q.question || `Question #${qIdx + 1} : Quelle est l'idée principale abordée dans ce document ?`;
      const baseCorr = typeof q.answer === "number" ? q.answer : typeof q.correct === "number" ? q.correct : 0;

      // Détecter si les options sont authentiques (cohérentes avec la question) ou des placeholders
      const hasAuthenticOptions = q.options &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((o: string) => typeof o === "string" && o.trim().length > 0) &&
        !q.options[0]?.includes("Option A") &&
        !q.options[0]?.includes("Proposition correcte") &&
        !q.options[0]?.includes("Hors sujet D");

      if (hasAuthenticOptions) {
        // CONSERVER les options originales cohérentes avec la question
        // Appliquer seulement la rotation de position de la bonne réponse
        const newPos = rotatePos(idx + 1, qIdx + 1);
        const rotatedOpts = swapToPos(q.options, newPos, baseCorr);
        return {
          q: qText,
          question: qText,
          options: rotatedOpts,
          answer: newPos,
          correct: newPos,
          explanation: q.explanation || q.detailedCorrection || "Reportez-vous au texte ou dialogue pour identifier la bonne réponse.",
          detailedCorrection: q.detailedCorrection || q.explanation || "Reportez-vous au texte ou dialogue pour identifier la bonne réponse.",
          errorAnalysis: q.errorAnalysis || "Comparez chaque option avec le contenu précis du document.",
          cecrEvaluation: q.cecrEvaluation || `Niveau ${l.level || "B2"} — TCF Canada.`
        };
      } else {
        // Générer dynamiquement UNIQUEMENT pour les placeholders sans contenu réel
        const unique = QcmUniqueBankEngine.generateUniqueQcm({
          id: idx + 1,
          questionId: qIdx + 1,
          level: l.level || "B2",
          skill: type === "listening" ? "listening" : type === "reading" ? "reading" : "course",
          topic: l.title || `Leçon ${idx + 1}`,
          baseQuestionText: qText,
          baseOptions: undefined,
          baseCorrect: baseCorr,
          baseExplanation: undefined
        });
        return {
          q: unique.question,
          question: unique.question,
          options: unique.options,
          answer: unique.answer,
          correct: unique.correct,
          explanation: unique.detailedCorrection,
          detailedCorrection: unique.detailedCorrection,
          errorAnalysis: unique.errorAnalysis,
          cecrEvaluation: unique.cecrEvaluation
        };
      }
    });

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
  }).map((item: any) => sanitizeLessonOrExam(item));
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
    const rawQItem = sc.questions[0] || null;

    // Vérifier si le scénario a déjà une question cohérente avec son dialogue
    const hasAuthenticCoQuestion = rawQItem &&
      rawQItem.options &&
      Array.isArray(rawQItem.options) &&
      rawQItem.options.length === 4 &&
      rawQItem.options.every((o: string) => typeof o === "string" && o.trim().length > 0) &&
      !rawQItem.options[0]?.includes("Option A") &&
      !rawQItem.options[0]?.includes("Proposition correcte");

    let qItem: any;

    if (hasAuthenticCoQuestion) {
      // CONSERVER les options originales du dialogue audio (elles sont cohérentes avec le script)
      const origCorrect = typeof rawQItem.correct === "number" ? rawQItem.correct : 0;
      const scIdNum = typeof sc.id === "number" ? sc.id : (parseInt(String(sc.id), 10) || idx + 1);
      const newPos = (scIdNum * 11 + 1 * 17 + 3) % 4;
      const rotOpts = [...rawQItem.options];
      if (newPos !== origCorrect) {
        const tmp = rotOpts[newPos]; rotOpts[newPos] = rotOpts[origCorrect]; rotOpts[origCorrect] = tmp;
      }
      qItem = {
        id: idx + 1,
        question: rawQItem.question,
        options: rotOpts,
        correct: newPos,
        detailedCorrection: rawQItem.detailedCorrection || "Reportez-vous au dialogue audio pour justifier la réponse.",
        errorAnalysis: rawQItem.errorAnalysis || "Écoutez attentivement le dialogue et comparez chaque option.",
        cecrEvaluation: rawQItem.cecrEvaluation || `Niveau ${sc.cecrLevel} — NCLC TCF Canada.`
      };
    } else {
      // Générer dynamiquement UNIQUEMENT si aucune question cohérente n'existe
      const scIdNum = typeof sc.id === "number" ? sc.id : (parseInt(String(sc.id), 10) || idx + 1);
      const uniqueQcm = QcmUniqueBankEngine.generateUniqueQcm({
        id: scIdNum,
        questionId: 1,
        level: sc.cecrLevel || "B2",
        skill: "listening",
        topic: sc.theme || `Dialogue TCF Canada #${idx + 1}`,
        baseQuestionText: rawQItem?.question || undefined,
        baseOptions: undefined,
        baseCorrect: undefined,
        baseExplanation: undefined
      });
      qItem = {
        id: idx + 1,
        question: uniqueQcm.question,
        options: uniqueQcm.options,
        correct: uniqueQcm.correct,
        detailedCorrection: uniqueQcm.detailedCorrection,
        errorAnalysis: uniqueQcm.errorAnalysis,
        cecrEvaluation: uniqueQcm.cecrEvaluation
      };
    }

    return {
      id: idx + 1,
      scenarioId: sc.id,
      text: `[Épreuve officielle de Compréhension Orale - Niveau ${sc.cecrLevel}] Thème : ${sc.theme}. Écoute unique.`,
      question: qItem.question,
      audioText: sc.script,
      script: sc.script,
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
  }).map((item: any) => sanitizeLessonOrExam(item));
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
      const baseCorr = typeof q.correct === "number" ? q.correct : typeof q.answer === "number" ? q.answer : 0;

      // Vérifier si les options sont authentiques et cohérentes avec le passage
      const hasRealOptions = q.options &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((o: string) => typeof o === "string" && o.trim().length > 0) &&
        !q.options[0]?.includes("Option A") &&
        !q.options[0]?.includes("Proposition correcte");

      if (hasRealOptions) {
        // CONSERVER les options originales du passage, seulement rotation de position
        const newPos = ((p.id || idx + 1) * 11 + (qIdx + 1) * 17 + 3) % 4;
        const rotOpts = [...q.options];
        if (newPos !== baseCorr) {
          const tmp = rotOpts[newPos]; rotOpts[newPos] = rotOpts[baseCorr]; rotOpts[baseCorr] = tmp;
        }
        return {
          ...q,
          id: q.id || qIdx + 1,
          text: textStr,
          question: textStr,
          options: rotOpts,
          correct: newPos,
          answer: newPos,
          detailedCorrection: q.detailedCorrection || "Reportez-vous au texte pour justifier la réponse.",
          errorAnalysis: q.errorAnalysis || "Relisez le passage et comparez chaque option avec le texte.",
          cecrLevel: q.cecrLevel || "B2"
        };
      } else {
        // Générer dynamiquement seulement pour les placeholders
        const unique = QcmUniqueBankEngine.generateUniqueQcm({
          id: (p.id || idx + 1),
          questionId: qIdx + 1,
          level: q.cecrLevel || p.level || "B2",
          skill: "reading",
          topic: p.title || `Passage #${idx + 1}`,
          baseQuestionText: textStr,
          baseOptions: undefined,
          baseCorrect: baseCorr,
          baseExplanation: undefined
        });
        return {
          ...q,
          id: q.id || qIdx + 1,
          text: unique.question,
          question: unique.question,
          options: unique.options,
          correct: unique.correct,
          answer: unique.correct,
          detailedCorrection: unique.detailedCorrection,
          errorAnalysis: unique.errorAnalysis,
          cecrLevel: q.cecrLevel || "B2"
        };
      }
    })
  })).map((item: any) => sanitizeLessonOrExam(item));
}

/**
 * Générateur d'examens pratiques réels TCF Canada (EE & EO - Expression Écrite et Orale) :
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
  }).map((item: any) => sanitizeLessonOrExam(item));
}
