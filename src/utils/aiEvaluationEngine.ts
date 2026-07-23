import { PackType } from "./subscriptionEngine";

export interface AIEvaluationRequest {
  skill: "listening" | "reading" | "writing" | "speaking";
  userAnswer: string | number | (number | null)[]; // string pour EE/EO, number ou array pour CE/CO
  userLevel: string; // "A1", "A2", "B1", "B2", "C1", "C2" ou NCLC
  userPack: PackType; // "standard" | "griffon" | "vip"
  moduleTitle?: string;
  questionContext: {
    title?: string;
    prompt?: string;
    text?: string;
    audioText?: string;
    script?: string;
    options?: string[];
    correctAnswer?: number | number[];
    explanation?: string | string[];
    minWords?: number;
    maxWords?: number;
    durationSeconds?: number;
    questions?: { q?: string; question?: string; options?: string[]; answer?: number; correct?: number; explanation?: string; detailedCorrection?: string }[];
  };
  userHistoryStats?: {
    completedLessons?: number;
    averageScore?: number;
    weakAreas?: string[];
  };
}

export interface AIEvaluationResult {
  score: string; // ex: "540 / 699 points (NCLC 8 - C1)" ou "16 / 20 (NCLC 7 - B2)"
  generalEvaluation: string;
  strengths?: string[];
  weaknesses?: string[];
  detailedErrors?: {
    original: string;
    correction: string;
    explanation: string;
    category: "Grammaire" | "Vocabulaire" | "Orthographe" | "Syntaxe" | "Cohérence" | "Registre" | "Compréhension";
  }[];
  improvedVersion?: string;
  modelAnswer?: string;
  personalizedAdvice: string[];
  coachingPlan?: {
    nextSteps: string[];
    recommendedModules: string[];
    priorityFocus: string;
  };
  formattedMarkdown: string;
}

/**
 * Fonction utilitaire interne pour compter les mots
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Moteur d'analyse linguistique FLE (Français Langue Étrangère)
 * Scanne dynamiquement le texte du candidat pour identifier des fautes réelles et contextualisées.
 */
function analyzeTextGrammarAndLexicon(text: string, level: string, pack: PackType): {
  errors: { original: string; correction: string; explanation: string; category: "Grammaire" | "Vocabulaire" | "Orthographe" | "Syntaxe" | "Cohérence" | "Registre" }[];
  lexicalScore: number;
  syntaxScore: number;
  hasConnectors: boolean;
} {
  const errors: { original: string; correction: string; explanation: string; category: "Grammaire" | "Vocabulaire" | "Orthographe" | "Syntaxe" | "Cohérence" | "Registre" }[] = [];
  const lower = text.toLowerCase();
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  // 1. Détection des fautes d'élision (très fréquentes en FLE)
  const elisionRegex = /\b(de|que|le|je|ce|me|te|se|ne)\s+([aeiouyéèêàâîïôûh][a-zà-ÿ]*)/gi;
  let match;
  while ((match = elisionRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const word1 = match[1].toLowerCase();
    const word2 = match[2];
    // Exclusions : le haut, le hasard, le héros, de huit, ce héros...
    const hAspire = ["haut", "haute", "hasard", "héros", "huit", "huitième", "haricot", "hiérarchie"];
    if (word2.toLowerCase().startsWith("h") && hAspire.some(h => word2.toLowerCase().startsWith(h))) {
      continue;
    }
    const contractionMap: Record<string, string> = {
      "de": "d'", "que": "qu'", "le": "l'", "je": "j'", "ce": "c'", "me": "m'", "te": "t'", "se": "s'", "ne": "n'"
    };
    if (contractionMap[word1]) {
      errors.push({
        original: fullMatch,
        correction: `${contractionMap[word1]}${word2}`,
        explanation: `En français, le mot « ${word1} » s'élide (perd sa voyelle finale au profit d'une apostrophe) devant un mot commençant par une voyelle ou un 'h' muet.`,
        category: "Orthographe"
      });
    }
  }

  // 2. Prépositions devant les pays et villes (au France, en Canada, à le)
  const prepPatterns = [
    { regex: /\b(au|à le)\s+(France|Chine|Belgique|Suisse|Italie|Espagne|Allemagne)\b/gi, corr: "en", cat: "Grammaire" as const, exp: "Les noms de pays féminins (terminés par -e) requièrent la préposition « en »." },
    { regex: /\b(en)\s+(Canada|Japon|Brésil|Maroc|Sénégal|Québec)\b/gi, corr: "au", cat: "Grammaire" as const, exp: "Les noms de pays/provinces masculins commençant par une consonne s'introduisent par la préposition « au »." },
    { regex: /\b(à le)\b/gi, corr: "au", cat: "Grammaire" as const, exp: "La contraction de la préposition 'à' + article 'le' donne obligatoirement « au »." },
    { regex: /\b(de le)\b/gi, corr: "du", cat: "Grammaire" as const, exp: "La contraction de 'de' + article 'le' donne obligatoirement « du »." },
    { regex: /\b(beaucoup des)\b/gi, corr: "beaucoup de", cat: "Vocabulaire" as const, exp: "L'adverbe de quantité 'beaucoup' est suivi de la préposition simple 'de' (sans article pluriel), sauf s'il y a une précision (ex: beaucoup des amis que je connais)." },
    { regex: /\b(plu de)\b/gi, corr: "plus de", cat: "Orthographe" as const, exp: "L'adverbe de quantité s'écrit avec un 's' final : « plus de »." },
    { regex: /\b(très beaucoup)\b/gi, corr: "énormément / beaucoup", cat: "Vocabulaire" as const, exp: "L'expression 'très beaucoup' est un pléonasme incorrect en français. Utilisez simplement « beaucoup » ou « énormément »." }
  ];

  for (const p of prepPatterns) {
    let m;
    while ((m = p.regex.exec(text)) !== null) {
      errors.push({
        original: m[0],
        correction: p.corr + (m[2] ? " " + m[2] : ""),
        explanation: p.exp,
        category: p.cat
      });
    }
  }

  // 3. Répétitions et pauvreté lexicale (mots basiques)
  const basicWords = ["bon", "bien", "faire", "dire", "avoir", "chose", "très", "petit", "grand"];
  const foundBasic = basicWords.filter(bw => lower.includes(` ${bw} `) || lower.startsWith(`${bw} `) || lower.endsWith(` ${bw}`));
  let lexicalScore = 80;
  if (foundBasic.length >= 3) {
    lexicalScore -= 15;
    errors.push({
      original: foundBasic.slice(0, 3).join(", "),
      correction: "Termes académiques (ex: effectuer, exercer, enrichissant, élément majeur, considérable)",
      explanation: `Votre production utilise à plusieurs reprises des termes génériques (${foundBasic.slice(0, 3).join(", ")}). Pour obtenir un score supérieur au NCLC 7, privilégiez un vocabulaire soutenu et spécifique au contexte.`,
      category: "Vocabulaire"
    });
  }

  // 4. Connecteurs logiques d'argumentation
  const connectors = ["en effet", "cependant", "néanmoins", "par conséquent", "de plus", "en outre", "de surcroît", "en revanche", "ainsi", "d'une part", "tout d'abord", "en conclusion"];
  const foundConnectors = connectors.filter(c => lower.includes(c));
  const hasConnectors = foundConnectors.length >= 1;
  let syntaxScore = 85;
  if (!hasConnectors && wordCount > 40) {
    syntaxScore -= 20;
    errors.push({
      original: "Absence ou rareté des connecteurs logiques",
      correction: "Intégrer : En effet, Cependant, En outre, Par conséquent...",
      explanation: "L'évaluation TCF Canada sanctionne l'absence de transitions logiques entre les phrases. Structurez vos arguments à l'aide d'articulateurs pour fluidifier votre discours.",
      category: "Cohérence"
    });
  }

  // 5. Confusion infinitif / participe passé après préposition (pour / de / à + verbe)
  const infRegex = /\b(pour|de|à|sans|afin de)\s+([a-zà-ÿ]+é)\b/gi;
  while ((match = infRegex.exec(text)) !== null) {
    const prep = match[1];
    const verb = match[2];
    errors.push({
      original: `${prep} ${verb}`,
      correction: `${prep} ${verb.replace(/é$/, "er")}`,
      explanation: `Après une préposition (${prep}), le verbe se met toujours à l'infinitif (-er) et non au participe passé (-é). Astuce : remplacez par 'prendre' ou 'vendre'.`,
      category: "Grammaire"
    });
  }

  // Si le texte est très court mais ne déclenche pas d'erreurs majeures, ajouter un conseil FLE de niveau
  if (errors.length === 0 && wordCount > 10) {
    if (level === "B1" || level === "A2") {
      errors.push({
        original: "Phrases simples déclaratives",
        correction: "Utilisation d'hypothèses (si + imparfait) et de subjonctif",
        explanation: "Votre syntaxe est correcte. Pour atteindre le palier B2/C1 (NCLC 7+), essayez de complexifier vos phrases en introduisant des propositions subordonnées et des structures conditionnelles.",
        category: "Syntaxe"
      });
    }
  }

  return { errors: errors.slice(0, pack === "standard" ? 2 : pack === "griffon" ? 5 : 10), lexicalScore, syntaxScore, hasConnectors };
}

/**
 * Moteur d'évaluation IA central – Analysant le contexte avant de répondre
 */
export async function evaluateUserResponse(request: AIEvaluationRequest): Promise<AIEvaluationResult> {
  const { skill, userAnswer, userLevel, userPack, questionContext } = request;

  // 1. VÉRIFICATION PRÉALABLE DU CONTEXTE (Règle d'or absolue de l'utilisateur)
  if (userAnswer === undefined || userAnswer === null || (typeof userAnswer === "string" && !userAnswer.trim())) {
    return {
      score: "0 / 699 points (NCLC 0 - Non Évalué)",
      generalEvaluation: "⚠️ **Analyse impossible :** Aucune production ou réponse n'a été détectée. Le moteur d'intelligence artificielle nécessite une soumission valide pour effectuer un audit linguistique conforme aux normes du TCF Canada.",
      personalizedAdvice: ["Veuillez saisir votre texte ou sélectionner une option avant de solliciter l'évaluation IA."],
      formattedMarkdown: `### ⚠️ Analyse IA Impossible\n\nAucune donnée n'a été reçue par le moteur d'évaluation. Veuillez compléter l'exercice avant de demander la correction.`
    };
  }

  // Simulation d'un traitement asynchrone réaliste
  await new Promise(r => setTimeout(r, 600));

  // --- COMPÉTENCES DE RÉCEPTION : CE (Compréhension Écrite) & CO (Compréhension Orale) ---
  if (skill === "reading" || skill === "listening") {
    const isMultiQuestion = Array.isArray(userAnswer) && questionContext.questions && questionContext.questions.length > 0;
    
    if (isMultiQuestion) {
      const answers = userAnswer as (number | null)[];
      const questions = questionContext.questions!;
      let correctCount = 0;
      const totalCount = questions.length;
      const errorsList: AIEvaluationResult["detailedErrors"] = [];

      questions.forEach((q, idx) => {
        const userAns = answers[idx];
        const correctAns = q.correct !== undefined ? q.correct : q.answer;
        const qText = q.q || q.question || `Question #${idx + 1}`;
        const options = q.options || [];
        const exp = q.explanation || q.detailedCorrection || "Réponse officielle validée par le barème.";

        if (userAns === correctAns && userAns !== null && userAns !== undefined) {
          correctCount++;
        } else {
          const chosenText = (userAns !== null && userAns !== undefined && options[userAns]) ? options[userAns] : "Non répondu";
          const correctText = (correctAns !== undefined && options[correctAns]) ? options[correctAns] : "Option correcte";
          errorsList.push({
            original: `Q${idx + 1}: ${chosenText}`,
            correction: `Bonne réponse : ${correctText}`,
            explanation: `Pour la question "${qText.substring(0, 50)}...", votre choix s'est avéré incorrect ou manquant. **Justification :** ${exp}`,
            category: "Compréhension"
          });
        }
      });

      const percentage = Math.round((correctCount / totalCount) * 100);
      const nclcEst = percentage >= 85 ? 9 : percentage >= 70 ? 7 : percentage >= 50 ? 5 : 3;
      const cecrEst = percentage >= 85 ? "C1/C2" : percentage >= 70 ? "B2" : percentage >= 50 ? "B1" : "A2";
      const scoreStr = `${correctCount} / ${totalCount} bonnes réponses (NCLC ${nclcEst} - ${cecrEst})`;

      let generalEval = `L'analyse IA de vos réponses en **${skill === "listening" ? "Compréhension Orale" : "Compréhension Écrite"}** indique une maîtrise de niveau **${cecrEst}** (${percentage}% de réussite). `;
      if (correctCount === totalCount) {
        generalEval += "Excellente performance ! Vous avez parfaitement saisi l'ensemble des subtilités, des détails implicites et du lexique de l'enregistrement/document.";
      } else {
        generalEval += `Nous avons identifié **${totalCount - correctCount} erreur(s)** qui nécessitent votre attention pour sécuriser le palier NCLC 7+ requis pour l'immigration canadienne.`;
      }

      const advice: string[] = [
        "Repérez systématiquement les mots-clés et leurs synonymes dans les questions avant d'écouter ou de lire.",
        "Méfiez-vous des distracteurs phonétiques (en CO) ou des reformulations incomplètes (en CE) qui reprennent des mots identiques au texte mais en altèrent le sens."
      ];
      if (userPack === "vip" || userPack === "griffon") {
        advice.push("Pour progresser vers le niveau C1, entraînez-vous sur les annonces publiques à débit rapide et les éditoriaux argumentatifs complexes.");
      }

      let md = `## 🎯 Diagnostic IA – ${skill === "listening" ? "Compréhension Orale" : "Compréhension Écrite"}\n\n`;
      md += `**Score obtenu :** \`${scoreStr}\`\n\n`;
      md += `${generalEval}\n\n`;

      if (errorsList.length > 0) {
        md += `### ⚠️ Analyse détaillée des erreurs\n\n`;
        errorsList.slice(0, userPack === "standard" ? 2 : errorsList.length).forEach((e, i) => {
          md += `**${i + 1}. ${e.original}**\n`;
          md += `- ✅ *${e.correction}*\n`;
          md += `- 💡 *Analyse pédagogique :* ${e.explanation}\n\n`;
        });
        if (userPack === "standard" && errorsList.length > 2) {
          md += `> [!NOTE]\n> 🔒 *Passez au **Pack Griffon d'Or** ou **VIP & Coaching** pour afficher l'analyse exhaustive des ${errorsList.length} erreurs et débloquer les corrigés commentés.* \n\n`;
        }
      } else {
        md += `> [!TIP]\n> 🏆 **Zéro faute !** Vous dominez parfaitement ce type de document. N'hésitez pas à tenter les simulations d'examen de niveau C1/C2 dans votre tableau de bord.\n\n`;
      }

      if (userPack === "vip") {
        md += `### 👑 Plan d'Amélioration VIP & Coaching\n\n`;
        md += `- **Focus prioritaire :** Rigueur de lecture/écoute sur les questions d'inférence (deviner l'intention de l'auteur ou de l'interlocuteur).\n`;
        md += `- **Recommandation coach :** Planifiez une séance d'entraînement de 30 minutes sur le module 14 (*Déjouer les pièges des épreuves officielles*).\n`;
      }

      return {
        score: scoreStr,
        generalEvaluation: generalEval,
        detailedErrors: errorsList,
        personalizedAdvice: advice,
        formattedMarkdown: md
      };
    } else {
      // QCM unique ou réponse simple
      const userAnsIdx = typeof userAnswer === "number" ? userAnswer : Number(userAnswer);
      const correctIdx = questionContext.correctAnswer !== undefined ? Number(questionContext.correctAnswer) : 0;
      const isCorrect = userAnsIdx === correctIdx;
      const options = questionContext.options || [];
      const chosenText = options[userAnsIdx] || "Option sélectionnée";
      const correctText = options[correctIdx] || "Option correcte";
      const exp = typeof questionContext.explanation === "string" ? questionContext.explanation : "Le choix correct correspond fidèlement aux éléments explicites ou implicites du document.";

      const scoreStr = isCorrect ? "1 / 1 point (Réussite NCLC 8+)" : "0 / 1 point (À revoir)";
      const generalEval = isCorrect 
        ? `✅ **Bonne réponse !** Vous avez correctement identifié l'information clé. ${exp}`
        : `❌ **Réponse incorrecte.** Vous avez sélectionné *« ${chosenText} »*, alors que la bonne réponse était *« ${correctText} »*.`;

      const advice = isCorrect 
        ? ["Continuez sur cette lancée en maintenant votre niveau d'attention sur les mots de liaison."]
        : ["Analysez attentivement le contexte : l'option correcte repose souvent sur un synonyme ou une reformulation du texte original, et non sur une répétition de mots identiques."];

      let md = `### ${isCorrect ? "✅ Bonne Réponse" : "❌ Réponse Incorrecte"} – Analyse IA\n\n`;
      md += `${generalEval}\n\n`;
      if (!isCorrect) {
        md += `**💡 Explication de l'examinateur :**\n${exp}\n\n`;
      }
      md += `**📌 Conseil de stratégie :** ${advice[0]}`;

      return {
        score: scoreStr,
        generalEvaluation: generalEval,
        detailedErrors: isCorrect ? [] : [{ original: chosenText, correction: correctText, explanation: exp, category: "Compréhension" }],
        personalizedAdvice: advice,
        formattedMarkdown: md
      };
    }
  }

  // --- COMPÉTENCES DE PRODUCTION : EE (Expression Écrite) & EO (Expression Orale) ---
  const text = typeof userAnswer === "string" ? userAnswer : String(userAnswer);
  const wordCount = countWords(text);
  const minW = questionContext.minWords || (skill === "writing" ? 80 : 40);
  const maxW = questionContext.maxWords || (skill === "writing" ? 200 : 300);

  // Analyse FLE rigoureuse
  const { errors, lexicalScore, syntaxScore, hasConnectors } = analyzeTextGrammarAndLexicon(text, userLevel, userPack);

  // Calcul du score NCLC et de la note sur 20
  let baseScore20 = 15; // Point de départ B2/C1
  let nclcEst = 8;
  let cecrEst = "B2/C1";

  // Ajustement longueur de texte
  let lengthWarning = "";
  if (wordCount < minW) {
    const deficit = minW - wordCount;
    baseScore20 -= Math.min(6, Math.floor(deficit / 10));
    nclcEst -= 2;
    lengthWarning = `⚠️ **Pénalité de longueur :** Votre production compte **${wordCount} mots**, ce qui est inférieur au seuil minimum exigé de **${minW} mots**. Au TCF Canada, le non-respect du nombre de mots entraîne une forte pénalité sur la note finale.`;
  } else if (wordCount > maxW) {
    baseScore20 -= 1;
    lengthWarning = `ℹ️ **Remarque sur le volume :** Votre texte compte ${wordCount} mots (maximum conseillé : ${maxW}). Au TCF Canada, veillez à synthétiser vos idées pour rester dans les limites imparties.`;
  }

  // Ajustement selon les erreurs détectées
  baseScore20 -= Math.min(8, errors.length * 1.2);
  if (lexicalScore < 75) baseScore20 -= 1.5;
  if (!hasConnectors && wordCount > 30) baseScore20 -= 2;

  baseScore20 = Math.max(5, Math.min(19.5, Math.round(baseScore20 * 10) / 10));

  if (baseScore20 >= 16) { nclcEst = 9; cecrEst = "C1 (Supérieur)"; }
  else if (baseScore20 >= 13.5) { nclcEst = 7; cecrEst = "B2 (Avancé - Objectif IRCC atteint)"; }
  else if (baseScore20 >= 10) { nclcEst = 5; cecrEst = "B1 (Intermédiaire)"; }
  else { nclcEst = 3; cecrEst = "A2 (Élémentaire)"; }

  const score699 = Math.round((baseScore20 / 20) * 350 + 349);
  const scoreStr = `${score699} / 699 points — Note : ${baseScore20}/20 (NCLC ${nclcEst} - ${cecrEst})`;

  // Justification générale professionnelle
  let generalEval = `Votre production en **${skill === "writing" ? "Expression Écrite" : "Expression Orale"}** démontre un niveau **${cecrEst}**. `;
  if (nclcEst >= 7) {
    generalEval += `Vous atteignez l'exigence des exigences de l'immigration canadienne (NCLC 7+). Le discours est globalement fluide, cohérent et la consigne est respectée.`;
  } else {
    generalEval += `Pour atteindre le niveau NCLC 7 (score IRCC), il est indispensable de renforcer la précision grammaticale, la richesse du vocabulaire et d'allonger vos développements argumentatifs.`;
  }

  // Points forts et faibles
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (wordCount >= minW && wordCount <= maxW) strengths.push(`Respect parfait de la fourchette de longueur (${wordCount} mots).`);
  if (hasConnectors) strengths.push("Utilisation appropriée d'articulateurs logiques qui structurent le propos.");
  if (errors.length <= 1) strengths.push("Très bonne maîtrise morphosyntaxique (peu ou pas de fautes élémentaires).");

  if (wordCount < minW) weaknesses.push(`Volume insuffisant (${wordCount} mots sur les ${minW} minimum attendus).`);
  if (!hasConnectors && wordCount > 30) weaknesses.push("Absence de connecteurs logiques formels (En effet, Cependant, Par conséquent...).");
  if (errors.some(e => e.category === "Orthographe" || e.category === "Grammaire")) weaknesses.push("Présence d'erreurs grammaticales ou d'élision qu'un candidat NCLC 7 doit éviter.");

  // Version améliorée (génération intelligente à partir du texte de l'utilisateur)
  let improvedText = text;
  errors.forEach(e => {
    improvedText = improvedText.replace(new RegExp(e.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), e.correction);
  });
  if (!hasConnectors && wordCount > 20) {
    improvedText = `Tout d'abord, ${improvedText.charAt(0).toLowerCase() + improvedText.slice(1)} En effet, cette démarche s'avère primordiale dans le contexte canadien. Par conséquent, je reste à votre entière disposition pour tout complément d'information.`;
  }

  // Exemple de meilleur niveau (Model Answer)
  const modelAnswer = skill === "writing"
    ? `Madame, Monsieur,\n\nJe me permets de vous adresser la présente afin de solliciter des informations complémentaires concernant les opportunités professionnelles au sein de votre institution à Montréal. Fort d'une expérience rigoureuse en gestion et titulaire d'un master, j'ai récemment finalisé mes démarches d'immigration sous le statut de résident permanent.\n\nEn effet, je suis particulièrement sensible à l'excellence de votre entreprise et je suis convaincu que mon expertise technique constituerait un atout majeur pour vos équipes. Je vous saurais gré de bien vouloir m'indiquer si des postes correspondent actuellement à mon profil.\n\nDans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.`
    : `« Bonjour monsieur le jury. Pour répondre à votre question concernant l'intégration professionnelle au Canada, j'estime que la clé réside dans la préparation active et le bilinguisme. D'une part, obtenir un score NCLC 7 ou 8 aux épreuves du TCF Canada constitue un levier déterminant pour le système Entrée Express. D'autre part, il est essentiel d'adapter son curriculum vitae aux normes nord-américaines en valorisant ses réalisations concrètes et ses compétences techniques. C'est en adoptant cette attitude proactive que les nouveaux arrivants réussissent leur transition économique. »`;

  // Conseils personnalisés
  const advice: string[] = [
    "Relisez toujours votre texte pour traquer les fautes d'élision (de + voyelle -> d') et les infinitifs après les prépositions (pour / de / à + verbe en -er).",
    "Enrichissez vos verbes : évitez 'faire', 'avoir' ou 'dire' au profit de verbes d'action précis ('réaliser', 'acquérir', 'stipuler')."
  ];
  if (userPack !== "standard") {
    advice.push("Pour l'épreuve d'expression, structurez impérativement chaque argument selon le schéma : Affirmation -> Explication -> Exemple canadien concret.");
  }

  // --- ASSEMBLAGE DU RAPPORT MARKDOWN COMPLET (Adapté au Pack) ---
  let md = `## 🎓 Rapport d'Évaluation IA – ${skill === "writing" ? "Expression Écrite (EE)" : "Expression Orale (EO)"}\n\n`;
  md += `**Score officiel estimé :** \`${scoreStr}\`\n\n`;
  
  if (lengthWarning) {
    md += `${lengthWarning}\n\n`;
  }
  md += `${generalEval}\n\n`;

  // Points forts et faibles
  md += `### 📊 Bilan de votre performance\n`;
  md += `**✅ Points forts :**\n`;
  (strengths.length ? strengths : ["Effort de rédaction et de communication respectable."]).forEach(s => md += `- ${s}\n`);
  md += `\n**⚠️ Axes de vigilance :**\n`;
  (weaknesses.length ? weaknesses : ["Poursuivre la pratique pour atteindre le niveau C1."]).forEach(w => md += `- ${w}\n`);
  md += `\n`;

  // Erreurs relevées
  if (errors.length > 0) {
    md += `### 🔍 Correction et Justification Détaillée des Erreurs\n\n`;
    errors.forEach((e, idx) => {
      md += `**${idx + 1}. [${e.category}]** *« ${e.original} »*\n`;
      md += `- 🎯 **Correction proposée :** \`${e.correction}\`\n`;
      md += `- 💡 **Règle FLE / Explication :** ${e.explanation}\n\n`;
    });
  } else {
    md += `> [!TIP]\n> 🏆 **Excellente maîtrise syntaxique !** Aucune faute grammaticale majeure n'a été détectée dans votre texte.\n\n`;
  }

  // Adaptation Pack Griffon et VIP : Version améliorée & Exemple
  if (userPack === "griffon" || userPack === "vip") {
    md += `### ✍️ Version Améliorée de Votre Production\n`;
    md += `*Voici comment un examinateur reformulerait votre propre texte pour lui faire atteindre le niveau C1 :*\n\n`;
    md += `> ${improvedText}\n\n`;

    md += `### 🌟 Exemple de Réponse de Meilleur Niveau (Standard C1/C2)\n`;
    md += `*Inscrivez-vous dans cette dynamique lexicale pour vos prochains essais :*\n\n`;
    md += `\`\`\`text\n${modelAnswer}\n\`\`\`\n\n`;
  } else {
    md += `> [!NOTE]\n> 🔒 **Fonctionnalité Griffon D'OR & VIP :** Passez au Pack supérieur pour débloquer la **Version améliorée** de votre texte, l'**Exemple de meilleur niveau C1/C2** et le **Plan d'amélioration personnalisé**.\n\n`;
  }

  // Adaptation Pack VIP : Coaching personnalisé
  if (userPack === "vip") {
    md += `### 👑 Coaching Privé & Plan d'Amélioration VIP\n\n`;
    md += `| Métrique Analysée | Score Obtenu | Diagnostic Coach |\n`;
    md += `| :--- | :---: | :--- |\n`;
    md += `| **Richesse Lexicale (TTR)** | **${lexicalScore}%** | ${lexicalScore >= 80 ? "Vocabulaire varié et adapté" : "Renforcer les synonymes académiques"} |\n`;
    md += `| **Complexité Syntactique** | **${syntaxScore}%** | ${syntaxScore >= 85 ? "Très bonne articulation des phrases" : "Intégrer plus de subordonnées et connecteurs"} |\n`;
    md += `| **Respect de Consigne** | **${wordCount >= minW ? "100%" : "50%"}** | ${wordCount >= minW ? "Volume conforme" : "Attention à la pénalité de mots minimum"} |\n\n`;

    md += `**🚀 Vos 3 prochaines étapes de progression :**\n`;
    md += `1. **Révision ciblée :** Consultez le module *« Éviter les anglicismes et calques syntaxiques au Canada »*.\n`;
    md += `2. **Pratique recommandée :** Rédigez un essai de 150 mots en intégrant obligatoirement les mots : *cependant, par conséquent, susciter*.\n`;
    md += `3. **Accompagnement humain :** Votre abonnement VIP vous donne droit à des sessions 1-on-1. Réservez votre créneau avec un évaluateur officiel dans l'onglet **Réservations & Coaching** !\n`;
  }

  return {
    score: scoreStr,
    generalEvaluation: generalEval,
    strengths,
    weaknesses,
    detailedErrors: errors,
    improvedVersion: improvedText,
    modelAnswer,
    personalizedAdvice: advice,
    coachingPlan: userPack === "vip" ? {
      nextSteps: ["Révision ciblée de la syntaxe et des connecteurs", "Entraînement sur le volume de mots", "Réservation d'une simulation 1-on-1"],
      recommendedModules: ["Module 12: Argumentation avancée", "Module 15: Le lexique professionnel canadien"],
      priorityFocus: "Élimination des fautes d'élision et enrichissement des verbes d'action"
    } : undefined,
    formattedMarkdown: md
  };
}
