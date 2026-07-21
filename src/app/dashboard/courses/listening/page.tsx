"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { 
  Volume2, Play, Pause, RotateCcw, CheckCircle2, 
  ChevronLeft, BrainCircuit, Clock, Headphones, Award, Sparkles, Check, X
} from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";

import { markCourseStarted, markLessonCompleted, addLearningTimeSeconds } from "@/utils/courseTracker";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";
import { generateLessonsForPack } from "@/utils/courseGenerator";

const BASE_LESSONS = [
  {
    id: 1, title: "Introduction à la CO TCF", duration: "12:00",
    audioText: "Bienvenue dans le cours de compréhension orale TCF Canada. Dans cette leçon, vous allez apprendre les stratégies essentielles pour réussir les épreuves d'écoute.",
    questions: [
      { q: "Quel est le thème principal de ce document audio ?", options: ["La cuisine française", "Les stratégies d'écoute TCF", "Les voyages au Canada", "La météo"], answer: 1, explanation: "Le document aborde spécifiquement les stratégies d'écoute pour le TCF Canada." },
      { q: "Combien de parties comporte l'épreuve de compréhension orale ?", options: ["2", "3", "4", "5"], answer: 1, explanation: "L'épreuve de compréhension orale comprend 3 grandes sections de difficulté progressive." },
    ],
    done: true
  },
  {
    id: 2, title: "Conversations courtes — niveau A2/B1", duration: "15:00",
    audioText: "Écoutez cette courte conversation entre deux amis qui planifient un voyage à Montréal. Marie dit à Jean qu'elle a réservé un hôtel près du Vieux-Port pour trois nuits.",
    questions: [
      { q: "Où Marie a-t-elle réservé l'hôtel ?", options: ["À Québec", "Près du Vieux-Port", "À Ottawa", "À Toronto"], answer: 1, explanation: "Marie indique explicitement avoir réservé un hôtel près du Vieux-Port à Montréal." },
      { q: "Pour combien de nuits ?", options: ["1 nuit", "2 nuits", "3 nuits", "4 nuits"], answer: 2, explanation: "Le document mentionne clairement une réservation de trois nuits." },
    ],
    done: true
  },
  {
    id: 3, title: "Annonces et messages — niveau B2/C1", duration: "14:00",
    audioText: "Annonce à la gare de Montréal : Le train numéro 245 à destination de Québec aura un retard de vingt minutes. Les voyageurs sont priés de se rendre au quai numéro sept.",
    questions: [
      { q: "Quel train est retardé ?", options: ["Train 254", "Train 245", "Train 524", "Train 452"], answer: 1, explanation: "L'annonce à la gare précise qu'il s'agit du train numéro 245." },
      { q: "De combien de minutes est le retard ?", options: ["10 minutes", "15 minutes", "20 minutes", "25 minutes"], answer: 2, explanation: "Le retard annoncé est exactement de vingt minutes (20 min)." },
    ],
    done: false
  },
];

const AI_TIPS = [
  "🎯 Concentrez-vous sur les mots-clés : qui, quoi, quand, où.",
  "📝 Prenez des notes pendant l'écoute — ne tentez pas de tout mémoriser.",
  "🔄 Écoutez une deuxième fois pour confirmer vos réponses.",
  "⚡ Anticipez le contexte en lisant les options avant l'écoute.",
];

export default function ListeningCoursePage() {
  const [pack, setPack] = useState(getCurrentUserPack());
  
  useEffect(() => {
    setPack(getCurrentUserPack());
  }, []);

  const LESSONS = React.useMemo<typeof BASE_LESSONS>(() => generateLessonsForPack(BASE_LESSONS, pack, PACK_CONFIGS[pack]), [pack]);

  const [currentLesson, setCurrentLesson] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showAITips, setShowAITips] = useState(false);

  // Resume Session Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Mark course as started and track learning time day by day
  useEffect(() => {
    markCourseStarted("co", LESSONS.length);
    const timer = setInterval(() => {
      addLearningTimeSeconds(1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect Saved Session on Mount
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_listening_course");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && !parsed.showResults && (Object.keys(parsed.answers || {}).length > 0 || parsed.currentLesson > 0)) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing de session de cours:", e);
      }
    }
  }, []);

  // Auto-Save Session Progress
  useEffect(() => {
    if (!showResults && !showResumeModal && (Object.keys(answers).length > 0 || currentLesson > 0)) {
      saveSessionState("tcf_session_listening_course", {
        currentLesson,
        answers
      });
    }
  }, [currentLesson, answers, showResults, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (typeof savedSessionData.currentLesson === "number") {
        setCurrentLesson(Math.min(savedSessionData.currentLesson, Math.max(0, LESSONS.length - 1)));
      }
      if (savedSessionData.answers) setAnswers(savedSessionData.answers);
    }
    setShowResumeModal(false);
  };

  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_listening_course");
    setCurrentLesson(0);
    setAnswers({});
    setShowResults(false);
    setShowResumeModal(false);
  };

  const lesson = LESSONS[currentLesson];

  const playAudio = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(lesson.audioText);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.onstart = () => { setIsSpeaking(true); setIsPlaying(true); };
    utterance.onend = () => { setIsSpeaking(false); setIsPlaying(false); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPlaying(false); };
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, lesson.audioText]);

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlaying(false);
    }
  };

  const score = lesson.questions.filter((q, i) => answers[i] === q.answer).length;
  const totalQuestions = lesson.questions.length;
  const percentage = (score / totalQuestions) * 100;

  // TCF Level Calculation
  let tcfLevel = "B1";
  let nclcLevel = "NCLC 5";
  let tcfScore = "380 pts";
  let tcfBadgeBg = "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300";

  if (percentage === 100) {
    tcfLevel = "C1 (Avancé - Expert)";
    nclcLevel = "NCLC 8-9";
    tcfScore = "560 / 699 pts";
    tcfBadgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300";
  } else if (percentage >= 50) {
    tcfLevel = "B2 (Intermédiaire Supérieur)";
    nclcLevel = "NCLC 7";
    tcfScore = "450 / 699 pts";
    tcfBadgeBg = "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300";
  } else {
    tcfLevel = "B1 (Intermédiaire)";
    nclcLevel = "NCLC 5-6";
    tcfScore = "350 / 699 pts";
    tcfBadgeBg = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300";
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Resume Session Modal */}
      <ResumeSessionModal
        isOpen={showResumeModal}
        title="Leçon en cours détectée"
        message="Vous avez déjà commencé cette leçon. Souhaitez-vous reprendre là où vous en étiez ?"
        onResume={handleResumeSession}
        onRestart={handleRestartSession}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/dashboard/courses" className="hover:text-blue-600 flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Mes cours
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Compréhension orale</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">Compréhension Orale (CO)</h1>
            <p className="text-blue-100 text-sm">Leçon {currentLesson + 1} sur {LESSONS.length}</p>
          </div>
        </div>
        <div className="w-full bg-blue-800/50 rounded-full h-2 mt-3">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${((currentLesson) / LESSONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Lesson Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {LESSONS.map((l, i) => (
          <button key={l.id} onClick={() => { setCurrentLesson(i); setAnswers({}); setShowResults(false); stopAudio(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              i === currentLesson
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:border-blue-300"
            }`}
          >
            {l.done && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
            Leçon {i + 1}
          </button>
        ))}
      </div>

      {/* Audio Player */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{lesson.title}</h2>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" /> {lesson.duration}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSpeaking ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-100 text-blue-600"}`}>
              {isSpeaking ? "🔊 Lecture en cours..." : "Prêt à jouer"}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={stopAudio} className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-300 transition-colors">
              <RotateCcw className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button onClick={playAudio}
              className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isSpeaking ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {isSpeaking ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>
            <button onClick={() => setShowAITips(!showAITips)} className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center hover:bg-amber-200 transition-colors">
              <BrainCircuit className="h-4 w-4 text-amber-600" />
            </button>
          </div>

          <p className="text-xs text-center text-slate-400">Cliquez sur ▶ pour écouter le document audio</p>
        </div>

        {/* AI Tips */}
        {showAITips && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900">
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <BrainCircuit className="h-4 w-4" /> Conseils IA pour la Compréhension Orale
            </h3>
            <ul className="space-y-1.5">
              {AI_TIPS.map((tip, i) => <li key={i} className="text-xs text-slate-700 dark:text-slate-300">{tip}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Questions & Correction */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">Questions de compréhension</h3>
        
        {lesson.questions.map((q, qi) => (
          <div key={qi} className="space-y-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{qi + 1}. {q.q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrectOption = oi === q.answer;

                let btnStyle = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300";

                if (showResults) {
                  if (isCorrectOption) {
                    btnStyle = "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = "bg-red-100 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200 font-bold";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-blue-100 border-blue-500 text-blue-900 font-bold dark:bg-blue-950/60 dark:text-blue-200";
                }

                return (
                  <button 
                    key={oi}
                    disabled={showResults}
                    onClick={() => setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showResults && isCorrectOption && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                    {showResults && isSelected && !isCorrectOption && <X className="h-4 w-4 text-red-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation when verified */}
            {showResults && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-blue-600 dark:text-blue-400">💡 Explication : </span>
                {q.explanation}
              </div>
            )}
          </div>
        ))}

        {/* Automatic Evaluation Results & TCF Level Card */}
        {showResults && (
          <div className={`p-5 rounded-2xl border space-y-3 animate-in fade-in zoom-in duration-200 ${tcfBadgeBg}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/60 dark:bg-slate-900/60 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">Résultat Automatique TCF</h4>
                  <p className="text-xs font-semibold opacity-90">
                    {score}/{totalQuestions} réponses correctes ({percentage}%)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 font-black text-xs shadow-sm border border-slate-200 dark:border-slate-800 inline-block">
                  Équivalence : {nclcLevel}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-300/40 dark:border-slate-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold">Niveau TCF estimé : </span>
                <span className="font-black text-sm">{tcfLevel}</span>
              </div>
              <div>
                <span className="font-bold">Score TCF : </span>
                <span className="font-black text-sm">{tcfScore}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button 
            onClick={() => {
              setShowResults(true);
              markLessonCompleted("co", currentLesson + 1, LESSONS.length);
              localStorage.removeItem("tcf_session_listening_course");
            }} 
            disabled={Object.keys(answers).length < lesson.questions.length || showResults}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Vérifier mes réponses</span>
          </button>

          {showResults && currentLesson < LESSONS.length - 1 && (
            <button 
              onClick={() => { 
                setCurrentLesson(c => c + 1); 
                setAnswers({}); 
                setShowResults(false); 
                stopAudio(); 
                localStorage.removeItem("tcf_session_listening_course");
              }}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors"
            >
              Leçon suivante →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
