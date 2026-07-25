"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Mic, Play, Square, RotateCcw, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight, 
  BrainCircuit, Clock, Volume2, Pause 
} from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";
import { markCourseStarted, markLessonCompleted, addLearningTimeSeconds } from "@/utils/courseTracker";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";
import { generateLessonsForPack } from "@/utils/courseGenerator";
import { evaluateUserResponse } from "@/utils/aiEvaluationEngine";

const BASE_LESSONS = [
  {
    id: 1, title: "Techniques de prise de parole", duration: "12 min",
    intro: `Dans cette leçon, vous allez apprendre les fondamentaux de la prise de parole en français pour l'examen TCF Canada. L'épreuve d'expression orale évalue votre capacité à communiquer spontanément et de manière cohérente.`,
    promptText: "Présentez-vous en 30 secondes. Parlez de votre parcours, vos motivations pour apprendre le français et votre projet d'immigration au Canada.",
    tips: ["Commencez toujours par vous présenter.", "Parlez lentement et distinctement.", "Utilisez des connecteurs : premièrement, ensuite, finalement."],
    done: true
  },
  {
    id: 2, title: "Monologue guidé — Présentation personnelle", duration: "15 min",
    intro: `Le monologue guidé est une partie importante de l'expression orale TCF Canada. Vous aurez un temps de préparation puis vous devrez parler pendant 1 à 2 minutes sur un sujet donné.`,
    promptText: "Parlez de votre ville d'origine et comparez-la avec ce que vous imaginez d'une ville canadienne. Quelles différences culturelles anticipez-vous ?",
    tips: ["Structurez : introduction, comparaison, conclusion.", "Évitez les longues pauses.", "Enrichissez avec des exemples concrets."],
    done: true
  },
  {
    id: 3, title: "Interaction simulée — Niveau A2/B1", duration: "20 min",
    intro: `L'interaction simulée vous demande de jouer un rôle dans une situation de communication quotidienne : appel téléphonique, demande d'information, réservation, etc.`,
    promptText: "Vous appelez une école de langue pour vous inscrire à des cours de français. Présentez-vous, demandez les horaires disponibles et les tarifs. Répondez aux questions de l'agent.",
    tips: ["Utilisez le vouvoiement dans un contexte formel.", "Soyez précis sur vos besoins.", "Reformulez si vous n'avez pas compris."],
    done: false
  },
];

const AI_ORAL_FEEDBACK = [
  "🎙️ Prononciation : Bonne clarté générale. Faites attention à l'intonation des questions.",
  "📊 Fluidité : Quelques pauses naturelles bien gérées. Réduisez les 'euh' et 'um'.",
  "📚 Vocabulaire : Bon registre formel. Enrichissez avec des expressions idiomatiques.",
  "🏗️ Structure : Introduction claire. Renforcez votre conclusion pour plus d'impact.",
  "⭐ Niveau estimé : B1/B2 — Score estimé : 68/100",
];

type RecordState = "idle" | "recording" | "done";

export default function SpeakingCoursePage() {
  const [pack, setPack] = useState(getCurrentUserPack());
  
  useEffect(() => {
    setPack(getCurrentUserPack());
  }, []);

  const LESSONS = React.useMemo<typeof BASE_LESSONS>(() => generateLessonsForPack(BASE_LESSONS, pack, PACK_CONFIGS[pack], "speaking"), [pack]);

  const [currentLesson, setCurrentLesson] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  // Load Session Progress
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_speaking_course");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && (parsed.currentLesson > 0 || parsed.recordState === "done")) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing session:", e);
      }
    }
  }, []);

  // Auto-Save Session Progress
  useEffect(() => {
    if (!showResumeModal && (currentLesson > 0 || recordState === "done")) {
      saveSessionState("tcf_session_speaking_course", {
        currentLesson,
        recordState
      });
    }
  }, [currentLesson, recordState, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (typeof savedSessionData.currentLesson === "number") {
        setCurrentLesson(Math.min(savedSessionData.currentLesson, Math.max(0, LESSONS.length - 1)));
      }
      if (savedSessionData.recordState) setRecordState(savedSessionData.recordState);
    }
    setShowResumeModal(false);
  };

  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_speaking_course");
    setCurrentLesson(0);
    setRecordState("idle");
    setShowResumeModal(false);
  };

  // Mark course as started and track learning time day by day
  useEffect(() => {
    markCourseStarted("po", LESSONS.length);
    const timer = setInterval(() => {
      addLearningTimeSeconds(1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const lesson = LESSONS[currentLesson];

  const speakPrompt = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isPlayingPrompt) {
      window.speechSynthesis.cancel();
      setIsPlayingPrompt(false);
      return;
    }
    const intro = new SpeechSynthesisUtterance(lesson.intro + " " + lesson.promptText);
    intro.lang = "fr-FR";
    intro.rate = 0.92;
    intro.onstart = () => setIsPlayingPrompt(true);
    intro.onend = () => setIsPlayingPrompt(false);
    intro.onerror = () => setIsPlayingPrompt(false);
    window.speechSynthesis.speak(intro);
  }, [isPlayingPrompt, lesson]);

  const stopPrompt = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingPrompt(false);
    }
  }, []);

  const startRecording = () => setRecordState("recording");
  const stopRecording = () => { setRecordState("done"); clearInterval(timerRef.current!); };

  const handleAIEval = async () => {
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const result = await evaluateUserResponse({
        skill: "speaking",
        userAnswer: "Bonjour, pour me présenter : je suis ingénieur et je vis actuellement au France. J'ai de expérience dans mon domaine depuis 4 ans. Je veux immigrer en Canada pour perfectionner mon anglais et français.",
        userLevel: "B1/B2",
        userPack: pack,
        questionContext: {
          title: lesson.title,
          prompt: lesson.promptText
        }
      });
      setAiFeedback(result.formattedMarkdown);
      markLessonCompleted("po", currentLesson + 1, LESSONS.length);
    } catch (err) {
      console.error("Erreur IA cours oral:", err);
      setAiFeedback("⚠️ **Erreur :** Impossible de générer la correction pour le moment.");
    } finally {
      setAiLoading(false);
    }
  };

  const reset = () => {
    stopPrompt();
    setRecordState("idle");
    setAiFeedback(null);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <ResumeSessionModal 
        isOpen={showResumeModal}
        title="Leçon en cours détectée"
        message="Vous avez déjà commencé cette leçon. Souhaitez-vous reprendre là où vous en étiez ?"
        onResume={handleResumeSession}
        onRestart={handleRestartSession}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/dashboard/courses" className="hover:text-purple-600 flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Mes cours
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Expression orale</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Mic className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">Expression Orale (EO)</h1>
            <p className="text-purple-100 text-sm">Leçon {currentLesson + 1} sur {LESSONS.length}</p>
          </div>
        </div>
        <div className="w-full bg-purple-800/50 rounded-full h-2 mt-3">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${(currentLesson / LESSONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Lesson Tabs & Arrow Navigation (< / >) */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 flex-wrap">
        <button
          onClick={() => {
            if (currentLesson > 0) {
              setCurrentLesson(c => c - 1); reset();
            }
          }}
          disabled={currentLesson === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Leçon précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Leçon précédente</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1 justify-center">
          {LESSONS.map((l, i) => (
            <button key={l.id} onClick={() => { setCurrentLesson(i); reset(); }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                i === currentLesson
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 border border-purple-400"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:border-purple-400 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400"
              }`}
            >
              {l.done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
              <span>Leçon {i + 1}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (currentLesson < LESSONS.length - 1) {
              setCurrentLesson(c => c + 1); reset();
            } else {
              window.location.href = "/dashboard/courses/writing";
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/30 transition-all shadow-sm shrink-0"
          title={currentLesson < LESSONS.length - 1 ? "Leçon suivante" : "Cours suivant"}
        >
          <span className="hidden sm:inline">{currentLesson < LESSONS.length - 1 ? "Leçon suivante" : "Cours suivant"}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Lesson Content */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{lesson.title}</h2>
          <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.duration}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{lesson.intro}</p>

        {/* Prompt Box */}
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Sujet à traiter</span>
            <button onClick={speakPrompt}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                isPlayingPrompt
                  ? "bg-red-50 border-red-300 text-red-600 animate-pulse"
                  : "bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              {isPlayingPrompt ? "Arrêter la lecture" : "Écouter le sujet"}
            </button>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{lesson.promptText}</p>
        </div>

        {/* Tips */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Conseils</p>
          {lesson.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="text-purple-500 mt-0.5">•</span> {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Recording Zone */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Zone d'enregistrement</h3>

        {recordState === "idle" && (
          <div className="text-center space-y-4 py-6">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
              <Mic className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Prêt à enregistrer votre réponse ?</p>
            <button onClick={startRecording}
              className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg transition-all">
              <Play className="h-4 w-4 inline mr-2" /> Commencer l'enregistrement
            </button>
          </div>
        )}

        {recordState === "recording" && (
          <div className="text-center space-y-4 py-6">
            <div className="relative h-20 w-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="relative h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center ring-4 ring-red-400/50">
                <Mic className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <p className="text-red-500 font-semibold animate-pulse">🔴 Enregistrement en cours...</p>
            <div className="flex items-end justify-center gap-0.5 h-8">
              {Array(24).fill(0).map((_, i) => (
                <div key={i} className="w-1.5 rounded-full bg-red-400 animate-pulse"
                  style={{ height: `${30 + Math.sin(i) * 50 + 20}%`, animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
            <button onClick={stopRecording}
              className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg transition-all">
              <Square className="h-4 w-4 inline mr-2 fill-current" /> Arrêter l'enregistrement
            </button>
          </div>
        )}

        {recordState === "done" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="font-semibold text-emerald-600">Enregistrement terminé !</p>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> Recommencer
              </button>
              <button onClick={handleAIEval} disabled={aiLoading}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {aiLoading
                  ? <><span className="animate-spin">⚙</span> Analyse IA...</>
                  : <><BrainCircuit className="h-4 w-4" /> Évaluer par IA</>
                }
              </button>
            </div>

            {aiFeedback && (
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900 space-y-4">
                <h4 className="font-bold text-sm text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-3">
                  <BrainCircuit className="h-4 w-4" /> Évaluation IA
                </h4>
                <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed space-y-1">
                  {aiFeedback}
                </div>
                <button 
                  onClick={() => { 
                    if (currentLesson < LESSONS.length - 1) {
                      setCurrentLesson(c => c + 1); 
                      reset(); 
                    } else {
                      window.location.href = "/dashboard/courses/writing";
                    }
                    localStorage.removeItem("tcf_session_speaking_course");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 animate-pulse"
                >
                  <span>Passer au cours suivant</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
