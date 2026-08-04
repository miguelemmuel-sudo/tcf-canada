"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, PenTool, BrainCircuit, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";
import { getCurrentUserPack, PACK_CONFIGS, getExamDurationSecondsForPack } from "@/utils/subscriptionEngine";
import { useUserPack } from "@/hooks/useUserPack";
import { generateExamWritingTasksForPack } from "@/utils/courseGenerator";
import { evaluateUserResponse } from "@/utils/aiEvaluationEngine";
import { createClient } from "@/utils/supabase/client";

// ─── Tâches d'Expression Écrite ──────────────────────────────────────────────
const BASE_TASKS = [
  {
    id: 1,
    type: "courriel",
    title: "Tâche 1 — Courriel formel",
    instructions: `Vous avez reçu un courriel d'une entreprise canadienne vous demandant de vous présenter pour un poste dans votre domaine. 
    
Rédigez une réponse formelle en 150-200 mots dans laquelle vous :
• Remerciez pour l'invitation
• Présentez brièvement votre parcours professionnel
• Exprimez votre motivation pour ce poste
• Proposez une disponibilité pour un entretien`,
    minWords: 150,
    maxWords: 200,
    timeMinutes: 20,
  },
  {
    id: 2,
    type: "article",
    title: "Tâche 2 — Essai argumentatif",
    instructions: `L'immigration enrichit-elle la société d'accueil ?

Rédigez un texte argumentatif de 200-250 mots dans lequel vous exposez votre point de vue en vous appuyant sur des exemples concrets. Vous devez présenter au moins deux arguments et les illustrer.`,
    minWords: 200,
    maxWords: 250,
    timeMinutes: 25,
  },
  {
    id: 3,
    type: "synthese",
    title: "Tâche 3 — Synthèse de documents",
    instructions: `À partir des documents suivants (hypothétiques), rédigez une synthèse objective de 120-150 mots :
    
• Document A : Statistiques sur l'immigration francophone (2020-2024)
• Document B : Témoignage d'un immigrant récent au Québec
• Document C : Extrait de la politique d'immigration du gouvernement fédéral

Votre synthèse doit rendre compte des informations essentielles sans prendre position personnelle.`,
    minWords: 120,
    maxWords: 150,
    timeMinutes: 15,
  },
];

const AI_FEEDBACK = [
  "🎯 **Score estimé TCF Canada :** 520 / 699 points — Niveau B2 (Avancé)",
  "🏆 **Équivalence NCLC (Immigration Canada) :** Niveau 7",
  "",
  "✅ **Ce qui est réussi :**",
  "- Votre texte est bien structuré avec une introduction et une conclusion claires.",
  "- L'utilisation des connecteurs logiques (Cependant, En effet) est maîtrisée.",
  "",
  "⚠️ **Correction et Explication des erreurs :**",
  "- *Erreur :* 'Je vous écris pour vous demandez...'",
  "  *Correction :* 'Je vous écris pour vous demander...'",
  "  *Explication :* Après une préposition (pour, de, à, sans), le verbe doit toujours être à l'infinitif.",
  "- *Erreur :* 'Beaucoup des personnes pensent que...'",
  "  *Correction :* 'Beaucoup de personnes pensent que...'",
  "  *Explication :* On utilise 'beaucoup de' (quantité indéterminée) et non 'beaucoup des' sauf si l'article défini est obligatoire (ex: beaucoup des amis que j'ai...).",
  "",
  "💡 **Propositions d'améliorations (Niveau C1) :**",
  "- Enrichissez votre vocabulaire : remplacez le verbe très commun 'faire' par des verbes plus précis comme 'réaliser', 'accomplir', ou 'effectuer'.",
  "- Utilisez le subjonctif pour exprimer une opinion subjective : 'Il est indispensable que nous prenions des mesures...'",
  "",
  "📉 **Diagnostic de vos points faibles :**",
  "- Conjugaison : Confusion occasionnelle entre le participe passé (-é) et l'infinitif (-er).",
  "- Lexique : Répétition de mots de base (très, faire, dire).",
  "",
  "🚀 **Votre Parcours de Progression Personnalisé :**",
  "1. **Exercice suggéré immédiat :** Révisez la règle de l'infinitif après préposition. [Générer un mini-quiz sur les verbes à l'infinitif]",
  "2. **Prochain cours recommandé :** 'L'art de la nuance : Remplacer les verbes passe-partout'.",
  "3. **Prochaine tâche TCF :** Rédigez un court essai sur la pollution urbaine en utilisant au moins 5 verbes d'opinion différents."
];

const TOTAL_TIME = 60 * 60;

function Timer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className={`flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums ${seconds < 300 ? "text-red-500 animate-pulse" : ""}`}>
      <Clock className="h-4 w-4" /> {mins}:{secs}
    </div>
  );
}

function countWords(text: string): number {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

export default function WritingExamPage() {
  const { pack, mounted } = useUserPack();
  const [timeLeft, setTimeLeft] = useState(() => getExamDurationSecondsForPack("griffon", TOTAL_TIME));
  useEffect(() => {
    setTimeLeft(getExamDurationSecondsForPack(pack, TOTAL_TIME));
  }, [pack]);
  const TASKS = React.useMemo<typeof BASE_TASKS>(() => generateExamWritingTasksForPack(BASE_TASKS, pack, PACK_CONFIGS[pack], "writing"), [pack]);

  const [currentTask, setCurrentTask] = useState(0);
  const [texts, setTexts] = useState<string[]>(Array(TASKS.length).fill(""));

  // Sécurité : resynchroniser la taille du tableau si le pack change après l'hydratation
  useEffect(() => {
    setTexts((prev) => {
      if (prev.length === TASKS.length) return prev;
      const newTexts = Array(TASKS.length).fill("");
      for (let i = 0; i < Math.min(prev.length, TASKS.length); i++) {
        newTexts[i] = prev[i];
      }
      return newTexts;
    });
  }, [TASKS.length]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Resume Session Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect Saved Session on Mount
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_writing_exam");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && !parsed.submitted && (parsed.texts?.some((t: string) => t.trim().length > 0) || parsed.currentTask > 0)) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing session PE:", e);
      }
    }
  }, []);

  // Auto-Save Session Progress
  useEffect(() => {
    if (!submitted && !showResumeModal && (texts.some(t => t.trim().length > 0) || currentTask > 0)) {
      saveSessionState("tcf_session_writing_exam", {
        currentTask,
        texts,
        timeLeft
      });
    }
  }, [currentTask, texts, timeLeft, submitted, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (savedSessionData.texts) {
        const merged = Array(TASKS.length).fill("");
        savedSessionData.texts.forEach((t: string, i: number) => {
          if (i < TASKS.length) merged[i] = t;
        });
        setTexts(merged);
      }
      if (typeof savedSessionData.currentTask === "number") {
        setCurrentTask(Math.min(savedSessionData.currentTask, Math.max(0, TASKS.length - 1)));
      }
      if (typeof savedSessionData.timeLeft === "number") setTimeLeft(savedSessionData.timeLeft);
    }
    setShowResumeModal(false);
  };

  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_writing_exam");
    setTexts(Array(TASKS.length).fill(""));
    setCurrentTask(0);
    setTimeLeft(getExamDurationSecondsForPack(pack, TOTAL_TIME));
    setShowResumeModal(false);
  };

  useEffect(() => {
    if (submitted || showResumeModal) return;
    timerRef.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timerRef.current!);
  }, [submitted, showResumeModal]);

  const task = TASKS[currentTask];

  const handleAICorrection = useCallback(async () => {
    if (!texts[currentTask].trim()) return;
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const result = await evaluateUserResponse({
        skill: "writing",
        userAnswer: texts[currentTask],
        userLevel: "B2/C1",
        userPack: pack,
        questionContext: {
          title: task.title,
          prompt: task.instructions,
          minWords: task.minWords,
          maxWords: task.maxWords,
          durationSeconds: task.timeMinutes * 60
        }
      });
      setAiFeedback(result.formattedMarkdown);
    } catch (err) {
      console.error("Erreur IA evaluation:", err);
      setAiFeedback("⚠️ **Erreur lors de l'analyse :** Impossible d'évaluer votre texte pour le moment.");
    } finally {
      setAiLoading(false);
    }
  }, [texts, currentTask, pack, task]);

  const handleGlobalAIEval = useCallback(async () => {
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const combinedText = TASKS.map((t, i) => `[TÂCHE ${i+1}]\n${texts[i] || "Non répondu"}`).join("\n\n");
      const totalMinWords = TASKS.reduce((acc, t) => acc + t.minWords, 0);
      const totalMaxWords = TASKS.reduce((acc, t) => acc + t.maxWords, 0);
      
      const result = await evaluateUserResponse({
        skill: "writing",
        userAnswer: combinedText,
        userLevel: "B2/C1",
        userPack: pack,
        questionContext: {
          title: "Évaluation Globale de l'Examen d'Expression Écrite",
          prompt: "Voici l'ensemble des productions du candidat pour l'examen.",
          minWords: totalMinWords,
          maxWords: totalMaxWords,
          durationSeconds: 60 * 60
        }
      });
      setAiFeedback(result.formattedMarkdown);
    } catch (err) {
      console.error("Erreur IA evaluation globale:", err);
      setAiFeedback("⚠️ **Erreur lors de l'analyse globale.**");
    } finally {
      setAiLoading(false);
    }
  }, [texts, pack]);

  const wordCount = countWords(texts[currentTask]);
  const wordStatus = wordCount < task.minWords ? "under" : wordCount > task.maxWords ? "over" : "ok";

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("exam_sessions").insert({
          user_id: user.id,
          exam_type: "writing",
          status: "completed",
          answers: texts
        });
      }
    } catch (err) {
      console.warn("Erreur sauvegarde db:", err);
    }
  };

  if (!mounted) return null;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 overflow-hidden text-center">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-10 space-y-6">
              <div className="h-20 w-20 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto">
                <PenTool className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">Productions soumises !</h2>
              <p className="text-muted-foreground">Vos textes ont été envoyés pour correction par IA.</p>
              <div className="grid grid-cols-3 gap-4">
                {TASKS.map((t, i) => (
                  <div key={t.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                    <p className="text-lg font-bold">{countWords(texts[i])}</p>
                    <p className="text-xs text-muted-foreground">mots — Tâche {i + 1}</p>
                  </div>
                ))}
              </div>
              {aiFeedback && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 text-left space-y-2 border border-amber-200 dark:border-amber-900">
                  <h3 className="font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <BrainCircuit className="h-4 w-4" /> Score et Analyse Globale de l'IA
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {aiFeedback}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setSubmitted(false); setAiFeedback(null); }}>
                  Modifier
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold" onClick={handleGlobalAIEval} disabled={aiLoading}>
                  {aiLoading ? <><span className="animate-spin mr-2">⚙</span> Calcul du Score...</> : <><BrainCircuit className="h-4 w-4 mr-2" /> Calculer mon Score Global</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Resume Session Modal */}
      <ResumeSessionModal
        isOpen={showResumeModal}
        title="Test en cours détecté"
        message="Vous avez déjà commencé ce test. Souhaitez-vous reprendre là où vous en étiez ?"
        onResume={handleResumeSession}
        onRestart={handleRestartSession}
      />

      {/* Header & Test Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = "/dashboard/exams"}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <PenTool className="h-5 w-5 text-amber-500" /> Expression Écrite (EE)
            </h1>
            <p className="text-sm text-muted-foreground">Tâche {currentTask + 1} sur {TASKS.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/speaking"}
            className="rounded-xl font-bold text-xs"
          >
            ← <span className="hidden sm:inline ml-1">Test précédent</span>
          </Button>
          <div className="flex items-center gap-1.5 text-muted-foreground px-2">
            <Clock className="h-4 w-4" />
            <Timer seconds={timeLeft} />
          </div>
          <Button variant="outline" size="sm" onClick={handleSubmit} className="rounded-xl">
            Soumettre
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/listening"}
            className="rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
          >
            <span className="hidden sm:inline mr-1">Test suivant</span> →
          </Button>
        </div>
      </div>

      {/* Onglets tâches et flèches de navigation (< / >) */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 flex-wrap">
        <button
          onClick={() => { setCurrentTask((prev) => Math.max(0, prev - 1)); setAiFeedback(null); }}
          disabled={currentTask === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Tâche précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Tâche précédente</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1 justify-center">
          {TASKS.map((t, i) => (
            <button key={t.id} onClick={() => { setCurrentTask(i); setAiFeedback(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                i === currentTask
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/25 border border-amber-400"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-muted-foreground hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
              }`}
            >
              Tâche {i + 1}
              {texts[i].trim() && i !== currentTask && (
                <CheckCircle2 className="h-3 w-3 inline ml-1.5 text-emerald-500" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => { setCurrentTask((prev) => Math.min(TASKS.length - 1, prev + 1)); setAiFeedback(null); }}
          disabled={currentTask === TASKS.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Tâche suivante"
        >
          <span className="hidden sm:inline">Tâche suivante</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Consigne */}
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-100 text-amber-700 border-none">{task.type}</Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />{task.timeMinutes} min recommandées
              </Badge>
            </div>
            <CardTitle className="text-base mt-2">{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {task.instructions}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              Longueur requise : {task.minWords}–{task.maxWords} mots
            </div>

            {/* Feedback IA */}
            {aiFeedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed space-y-1"
              >
                <p className="font-semibold flex items-center gap-1.5 text-sm mb-2">
                  <BrainCircuit className="h-4 w-4 text-amber-500" /> Analyse IA
                </p>
                {aiFeedback}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Éditeur */}
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Votre réponse</CardTitle>
              <div className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md ${
                wordStatus === "ok" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : wordStatus === "over" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {wordCount} / {task.maxWords} mots
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={texts[currentTask]}
              onChange={(e) => {
                const newTexts = [...texts];
                newTexts[currentTask] = e.target.value;
                setTexts(newTexts);
                setAiFeedback(null);
              }}
              placeholder={`Rédigez votre ${task.type} ici...\n\nN'oubliez pas de respecter la structure et la longueur requises.`}
              className="w-full h-64 resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleAICorrection} disabled={aiLoading || !texts[currentTask].trim()}>
                {aiLoading
                  ? <><span className="animate-spin inline-block mr-2">⚙</span> Analyse en cours...</>
                  : <><BrainCircuit className="h-3.5 w-3.5 mr-1.5" /> Corriger par IA</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentTask((t) => Math.max(0, t - 1))} disabled={currentTask === 0}>
          <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Tâche précédente</span>
        </Button>
        {currentTask < TASKS.length - 1
          ? <Button onClick={() => setCurrentTask((t) => t + 1)}><span className="hidden sm:inline">Tâche suivante</span> <ChevronRight className="h-4 w-4 sm:ml-1" /></Button>
          : <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4 mr-1" /> Soumettre les résultats</Button>
        }
      </div>
    </div>
  );
}
