import { PackType, PackPermissions } from "./subscriptionEngine";

export function generateLessonsForPack(baseLessons: any[], currentPack: PackType, packConfig: PackPermissions) {
  const targetCount = packConfig.coursesCount;
  
  if (baseLessons.length >= targetCount) {
    return baseLessons.slice(0, targetCount);
  }

  const generated = [...baseLessons];
  let idCounter = baseLessons.length > 0 ? baseLessons[baseLessons.length - 1].id + 1 : 1;

  for (let i = baseLessons.length; i < targetCount; i++) {
    let title = `Leçon ${idCounter} - Pratique avancée`;
    if (i < 20) {
      title = `Leçon ${idCounter} - Consolidation des bases`;
    } else if (i < 50) {
      title = `Leçon ${idCounter} - Exercices type TCF`;
    } else if (i < 100) {
      title = `Leçon ${idCounter} - Approfondissement intensif`;
    } else if (i < 200) {
      title = `Leçon ${idCounter} - Maîtrise des pièges TCF`;
    } else {
      title = `Leçon ${idCounter} - Entraînement niveau C1/C2`;
    }

    generated.push({
      id: idCounter,
      title,
      duration: `${15 + (i % 15)} min`,
      instruction: "Cette leçon est débloquée via votre abonnement. Elle simule un environnement TCF réel.",
      text: "Le contenu détaillé de ce cours est réservé à votre plan d'apprentissage personnalisé. L'IA générera le texte complet adapté à votre niveau.",
      audioText: "Ceci est un exercice d'écoute généré automatiquement. Préparez-vous à prendre des notes.",
      intro: "Introduction générée automatiquement.",
      promptText: "Sujet généré en fonction de vos performances récentes.",
      modelAnswer: "Un corrigé complet sera généré par l'IA une fois votre essai terminé.",
      minWords: 80,
      maxWords: 150,
      tips: ["Lisez attentivement la consigne.", "Gérez votre temps de réponse.", "Restez concentré sur le sujet."],
      questions: [
        {
          q: `Question de validation #${idCounter} :`,
          options: ["Option A (Correcte)", "Option B", "Option C", "Option D"],
          answer: 0,
          explanation: "L'explication détaillée s'affichera après votre réponse."
        }
      ],
      done: false,
      isGenerated: true
    });
    idCounter++;
  }
  
  return generated;
}

export function generateExamQuestionsForPack(baseQuestions: any[], currentPack: PackType, packConfig: PackPermissions, type: "reading"|"listening"|"writing"|"speaking") {
  const targetCount = packConfig.questionsPerExam;
  
  if (baseQuestions.length >= targetCount) {
    return baseQuestions.slice(0, targetCount);
  }

  const generated = [...baseQuestions];
  let idCounter = baseQuestions.length > 0 ? baseQuestions[baseQuestions.length - 1].id + 1 : 1;

  for (let i = baseQuestions.length; i < targetCount; i++) {
    generated.push({
      id: idCounter,
      audio: `/audio/tcf_mock_${(i % 5) + 1}.mp3`,
      text: "Document d'examen TCF authentique simulé. Veuillez lire attentivement pour répondre à la question ci-dessous.",
      question: `Question d'évaluation TCF #${idCounter} - Niveau estimé : ${i < 30 ? 'A2' : i < 60 ? 'B1/B2' : 'C1/C2'}`,
      options: ["Choix A", "Choix B", "Choix C", "Choix D"],
      answer: Math.floor(Math.random() * 4) // random fallback for UI simulation
    });
    idCounter++;
  }

  return generated;
}

export function generateExamPassagesForPack(basePassages: any[], currentPack: PackType, packConfig: PackPermissions) {
  const targetQuestionsCount = packConfig.questionsPerExam;
  
  let currentQuestionsCount = 0;
  basePassages.forEach(p => currentQuestionsCount += p.questions.length);

  if (currentQuestionsCount >= targetQuestionsCount) {
    return basePassages;
  }

  const generated = [...basePassages];
  let pIdCounter = basePassages.length > 0 ? basePassages[basePassages.length - 1].id + 1 : 1;
  let qIdCounter = 100;

  let questionsAdded = currentQuestionsCount;
  while (questionsAdded < targetQuestionsCount) {
    const qCount = Math.min(3, targetQuestionsCount - questionsAdded);
    const questions = [];
    for (let i = 0; i < qCount; i++) {
      questions.push({
        id: qIdCounter++,
        text: `Question de lecture TCF #${qIdCounter}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: Math.floor(Math.random() * 4)
      });
    }

    generated.push({
      id: pIdCounter++,
      title: `Texte d'évaluation TCF #${pIdCounter}`,
      content: "Document généré dynamiquement pour évaluer votre compréhension écrite au niveau requis par votre abonnement.",
      questions
    });

    questionsAdded += qCount;
  }

  return generated;
}

export function generateExamWritingTasksForPack(baseTasks: any[], currentPack: PackType, packConfig: PackPermissions, type: "writing"|"speaking") {
  // Le TCF comporte habituellement 3 tâches pour ces épreuves, 
  // mais on peut générer plus de tâches selon le pack si besoin, ou on simule juste 3 tâches max pour rester fidèle.
  // Selon le prompt VIP a 100 "questions". Pour Writing/Speaking, c'est spécial. On va générer le nombre de "tâches".
  const targetCount = packConfig.questionsPerExam > 10 ? 10 : packConfig.questionsPerExam; // On limite à 10 max pour l'expression pour ne pas casser l'UI.
  
  if (baseTasks.length >= targetCount) {
    return baseTasks.slice(0, targetCount);
  }

  const generated = [...baseTasks];
  let idCounter = baseTasks.length > 0 ? baseTasks[baseTasks.length - 1].id + 1 : 1;

  for (let i = baseTasks.length; i < targetCount; i++) {
    if (type === "writing") {
      generated.push({
        id: idCounter++,
        type: "synthese",
        title: `Tâche ${idCounter - 1} — Sujet d'expression généré`,
        instructions: `Ceci est une tâche d'expression écrite générée pour votre entraînement TCF (Sujet d'actualité). Rédigez un texte structuré. L'IA corrigera votre production.`,
        minWords: 150,
        maxWords: 200,
        timeMinutes: 20
      });
    } else {
      generated.push({
        id: idCounter++,
        title: `Tâche Orale ${idCounter - 1} — Sujet généré`,
        promptText: `Sujet généré par l'IA en fonction de votre niveau. Exprimez-vous spontanément et clairement sur ce thème.`,
        duration: "2 min"
      });
    }
  }

  return generated;
}
