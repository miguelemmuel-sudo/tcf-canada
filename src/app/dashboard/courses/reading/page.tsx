"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, CheckCircle2, ChevronLeft, BrainCircuit, Clock, Award, Sparkles, Check, X 
} from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";

import { markCourseStarted, markLessonCompleted, addLearningTimeSeconds } from "@/utils/courseTracker";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";
import { generateLessonsForPack } from "@/utils/courseGenerator";

const BASE_LESSONS = [
  {
    id: 1, title: "Stratégies de lecture rapide", duration: "10 min",
    text: `La lecture rapide est une compétence essentielle pour réussir l'épreuve de compréhension écrite du TCF Canada. Elle consiste à identifier rapidement les informations-clés d'un texte sans lire chaque mot.

Les principales techniques incluent : le survol (skimming) pour saisir l'idée générale, l'écrémage (scanning) pour trouver une information précise, et la lecture sélective pour comprendre les parties importantes.

Pour s'améliorer, entraînez-vous à lire quotidiennement des articles de presse, des textes administratifs et des textes littéraires en français.`,
    questions: [
      { q: "Qu'est-ce que le 'skimming' ?", options: ["Lire mot à mot", "Saisir l'idée générale", "Chercher un mot précis", "Résumer le texte"], answer: 1, explanation: "Le skimming consiste à survoler le texte pour dégager rapidement l'idée générale." },
      { q: "Quel type de texte est recommandé pour s'entraîner ?", options: ["Textes en anglais", "Textes administratifs en français", "Textes en espagnol", "Textes de chimie"], answer: 1, explanation: "Les textes administratifs en français reflètent le format réel des épreuves TCF Canada." },
    ],
    done: true
  },
  {
    id: 2, title: "Comprendre les articles de presse", duration: "15 min",
    text: `Les articles de presse suivent une structure particulière appelée « pyramide inversée ». L'information la plus importante est placée au début de l'article, suivie de détails de plus en plus secondaires.

Un article de presse comprend généralement : un titre accrocheur (headline), un chapeau introductif (lead), le corps de l'article avec les 5W (Qui, Quoi, Quand, Où, Pourquoi), et parfois une conclusion ou une perspective.

Pour bien comprendre un article, identifiez d'abord le titre et le chapeau qui résument l'essentiel. Ensuite lisez les premiers paragraphes pour les faits principaux.`,
    questions: [
      { q: "Qu'est-ce que la 'pyramide inversée' ?", options: ["Un bâtiment célèbre", "Une structure rédactionnelle", "Un style littéraire", "Une règle de grammaire"], answer: 1, explanation: "C'est une structure journalistique plaçant l'essentiel au début." },
      { q: "Que signifient les '5W' dans le journalisme ?", options: ["Cinq voyelles", "Qui, Quoi, Quand, Où, Pourquoi", "Cinq thèmes", "Cinq règles"], answer: 1, explanation: "Les 5W représentent les 5 questions fondamentales : Who, What, When, Where, Why." },
    ],
    done: true
  },
  {
    id: 3, title: "Textes administratifs et formulaires", duration: "12 min",
    text: `Les textes administratifs sont courants dans la vie quotidienne au Canada. Ils incluent les formulaires d'immigration, les lettres officielles, les avis gouvernementaux et les contrats.

Pour comprendre ces textes, repérez les termes juridiques et administratifs fréquents : « conformément à », « en vertu de », « sous réserve de », « ci-joint », « à cet effet ».

Lors de l'examen TCF Canada, les textes administratifs testent votre capacité à extraire des informations précises comme des dates, des montants ou des conditions.`,
    questions: [
      { q: "Quel document est un texte administratif courant au Canada ?", options: ["Un roman", "Un formulaire d'immigration", "Un menu de restaurant", "Une chanson"], answer: 1, explanation: "Les formulaires d'immigration sont des exemples types de documents administratifs." },
      { q: "Que signifie 'ci-joint' ?", options: ["Ici à droite", "Document attaché", "En bas de page", "À lire plus tard"], answer: 1, explanation: "Le terme 'ci-joint' indique qu'un document est annexé ou joint à la lettre." },
    ],
    done: false
  },
];

const AI_TIPS = [
  "📖 Lisez le titre et les sous-titres avant le texte entier.",
  "🎯 Repérez les mots de liaison : cependant, toutefois, en revanche, ainsi.",
  "✏️ Soulignez mentalement les chiffres, noms propres et dates.",
  "🔍 Attention aux négations et aux nuances (ne … pas, peu, rarement).",
];

export default function ReadingCoursePage() {
  const [pack, setPack] = useState(getCurrentUserPack());
  
  useEffect(() => {
    setPack(getCurrentUserPack());
  }, []);

  const LESSONS = React.useMemo<typeof BASE_LESSONS>(() => generateLessonsForPack(BASE_LESSONS, pack, PACK_CONFIGS[pack]), [pack]);

  const [currentLesson, setCurrentLesson] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showAITips, setShowAITips] = useState(false);

  // Resume Session Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  // Mark course as started and track learning time day by day
  useEffect(() => {
    markCourseStarted("ce", LESSONS.length);
    const timer = setInterval(() => {
      addLearningTimeSeconds(1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect Saved Session on Mount
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_reading_course");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && !parsed.showResults && (Object.keys(parsed.answers || {}).length > 0 || parsed.currentLesson > 0)) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing de session de cours de lecture:", e);
      }
    }
  }, []);

  // Auto-Save Session Progress
  useEffect(() => {
    if (!showResults && !showResumeModal && (Object.keys(answers).length > 0 || currentLesson > 0)) {
      saveSessionState("tcf_session_reading_course", {
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
    localStorage.removeItem("tcf_session_reading_course");
    setCurrentLesson(0);
    setAnswers({});
    setShowResults(false);
    setShowResumeModal(false);
  };

  const lesson = LESSONS[currentLesson];
  const score = lesson.questions.filter((q, i) => answers[i] === q.answer).length;
  const totalQuestions = lesson.questions.length;
  const percentage = (score / totalQuestions) * 100;

  // TCF Level Calculation
  let tcfLevel = "B1";
  let nclcLevel = "NCLC 5-6";
  let tcfScore = "380 pts";
  let tcfBadgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300";

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
    nclcLevel = "NCLC 5";
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
        <Link href="/dashboard/courses" className="hover:text-emerald-600 flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Mes cours
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Compréhension écrite</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">Compréhension Écrite (CE)</h1>
            <p className="text-emerald-100 text-sm">Leçon {currentLesson + 1} sur {LESSONS.length}</p>
          </div>
        </div>
        <div className="w-full bg-emerald-800/50 rounded-full h-2 mt-3">
          <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${((currentLesson) / LESSONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Lesson Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {LESSONS.map((l, i) => (
          <button key={l.id} onClick={() => { setCurrentLesson(i); setAnswers({}); setShowResults(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              i === currentLesson
                ? "bg-emerald-600 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:border-emerald-300"
            }`}
          >
            {l.done && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
            Leçon {i + 1}
          </button>
        ))}
      </div>

      {/* Text to Read */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{lesson.title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.duration}</span>
            <button onClick={() => setShowAITips(!showAITips)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">
              <BrainCircuit className="h-3.5 w-3.5" /> Conseils IA
            </button>
          </div>
        </div>

        {showAITips && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900">
            <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <BrainCircuit className="h-4 w-4" /> Conseils IA pour la Compréhension Écrite
            </h3>
            <ul className="space-y-1.5">
              {AI_TIPS.map((tip, i) => <li key={i} className="text-xs text-slate-700 dark:text-slate-300">{tip}</li>)}
            </ul>
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{lesson.text}</p>
        </div>
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

                let btnStyle = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300";

                if (showResults) {
                  if (isCorrectOption) {
                    btnStyle = "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = "bg-red-100 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200 font-bold";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold dark:bg-emerald-950/60 dark:text-emerald-200";
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
                <span className="font-bold text-emerald-600 dark:text-emerald-400">💡 Explication : </span>
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
                  <Award className="h-6 w-6 text-emerald-600" />
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
              markLessonCompleted("ce", currentLesson + 1, LESSONS.length);
              localStorage.removeItem("tcf_session_reading_course");
            }} 
            disabled={Object.keys(answers).length < lesson.questions.length || showResults}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
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
                localStorage.removeItem("tcf_session_reading_course");
              }}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
            >
              Leçon suivante →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
