"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { 
  PenTool, CheckCircle2, ChevronLeft, ChevronRight, ArrowRight, BrainCircuit, Clock, AlertCircle 
} from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";
import { markCourseStarted, markLessonCompleted, addLearningTimeSeconds } from "@/utils/courseTracker";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";
import { useUserPack } from "@/hooks/useUserPack";
import { generateLessonsForPack } from "@/utils/courseGenerator";
import { evaluateUserResponse } from "@/utils/aiEvaluationEngine";

const BASE_LESSONS = [
  {
    id: 1, title: "Structure d'un courriel formel", duration: "12 min",
    instruction: `Vous avez reçu un courriel d'invitation à un entretien d'emploi dans une entreprise canadienne. Rédigez une réponse formelle (80–120 mots) dans laquelle vous :
• Remerciez pour l'invitation
• Confirmez votre disponibilité
• Posez une question sur le déroulement`,
    minWords: 80, maxWords: 120,
    modelAnswer: `Madame, Monsieur,

Je vous remercie vivement de votre invitation à un entretien pour le poste que j'ai sollicité. Je suis ravi(e) de vous confirmer ma disponibilité pour la date proposée.

Pourriez-vous me préciser si l'entretien se déroulera en présentiel ou en visioconférence, ainsi que la durée approximative ?

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Prénom Nom`,
    done: true
  },
  {
    id: 2, title: "Rédaction d'une lettre officielle", duration: "15 min",
    instruction: `Rédigez une lettre à la mairie de votre ville pour signaler un problème dans votre quartier (manque d'éclairage, problème de transport, etc.). Votre lettre doit contenir 100–150 mots et respecter la structure d'une lettre formelle.`,
    minWords: 100, maxWords: 150,
    modelAnswer: `Monsieur le Maire,

Je me permets de vous écrire afin de vous signaler un problème persistant dans le quartier Saint-Michel : l'éclairage public est défaillant depuis plusieurs semaines, ce qui représente un danger pour les piétons, notamment le soir.

Les résidents du quartier ont à plusieurs reprises contacté les services municipaux sans obtenir de réponse satisfaisante.

Je vous serais reconnaissant(e) de bien vouloir prendre les mesures nécessaires afin de remédier à cette situation dans les meilleurs délais.

Dans l'espoir d'une réponse favorable, je vous adresse, Monsieur le Maire, mes respectueuses salutations.

Prénom Nom`,
    done: false
  },
];

const AI_WRITING_FEEDBACK = [
  "✅ Structure : Votre courriel respecte bien la structure formelle (introduction, corps, salutation).",
  "💡 Vocabulaire : Utilisez des formules de politesse plus variées : 'Je vous saurais gré de...', 'Il me serait agréable de...'",
  "⚠️ Grammaire : Vérifiez l'accord des participes passés et la ponctuation après les virgules.",
  "📝 Cohérence : Bon enchaînement des idées. Ajoutez plus de connecteurs logiques.",
  "🎯 Score IA estimé : 71/100 — Niveau B1/B2 — Bon travail !",
];

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function WritingCoursePage() {
  const { pack, mounted } = useUserPack();
  


  const [currentLesson, setCurrentLesson] = useState(0);
  const LESSONS = React.useMemo<typeof BASE_LESSONS>(() => generateLessonsForPack(BASE_LESSONS, pack, PACK_CONFIGS[pack], "writing", currentLesson), [pack, currentLesson]);
  const [text, setText] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  // Load Session Progress
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_writing_course");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && (parsed.currentLesson > 0 || (parsed.text && parsed.text.trim().length > 0))) {
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
    if (!showResumeModal && (currentLesson > 0 || text.trim().length > 0)) {
      saveSessionState("tcf_session_writing_course", {
        currentLesson,
        text
      });
    }
  }, [currentLesson, text, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (typeof savedSessionData.currentLesson === "number") {
        setCurrentLesson(Math.min(savedSessionData.currentLesson, Math.max(0, LESSONS.length - 1)));
      }
      if (typeof savedSessionData.text === "string") setText(savedSessionData.text);
    }
    setShowResumeModal(false);
  };

  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_writing_course");
    setCurrentLesson(0);
    setText("");
    setShowResumeModal(false);
  };

  // Mark course as started and track learning time day by day
  useEffect(() => {
    markCourseStarted("pe", LESSONS.length);
    const timer = setInterval(() => {
      addLearningTimeSeconds(1);
    }, 1000);

  return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const lesson = LESSONS[currentLesson];
  const wordCount = countWords(text);
  const wordStatus = wordCount < lesson.minWords ? "under" : wordCount > lesson.maxWords ? "over" : "ok";

  const handleAI = useCallback(async () => {
    if (!text.trim()) return;
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const result = await evaluateUserResponse({
        skill: "writing",
        userAnswer: text,
        userLevel: "B1/B2",
        userPack: pack,
        questionContext: {
          title: lesson.title,
          prompt: lesson.instruction,
          minWords: lesson.minWords,
          maxWords: lesson.maxWords
        }
      });
      setAiFeedback(result.formattedMarkdown);
      markLessonCompleted("pe", currentLesson + 1, LESSONS.length);
    } catch (err) {
      console.error("Erreur IA cours écriture:", err);
      setAiFeedback("⚠️ **Erreur :** Impossible de générer la correction pour le moment.");
    } finally {
      setAiLoading(false);
    }
  }, [text, pack, lesson, currentLesson, LESSONS.length]);

  const reset = () => { setText(""); setAiFeedback(null); setShowModel(false); };

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
        <Link href="/dashboard/courses" className="hover:text-amber-600 flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Mes cours
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Expression écrite</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PenTool className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black">Expression Écrite (EE)</h1>
            <p className="text-amber-100 text-sm">Leçon {currentLesson + 1} sur {LESSONS.length}</p>
          </div>
        </div>
        <div className="w-full bg-amber-700/50 rounded-full h-2 mt-3">
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
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Leçon précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Leçon précédente</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1 justify-center">
          {(() => {
            const total = LESSONS.length;
            const getPages = () => {
              if (total <= 7) return Array.from({length: total}, (_, i) => i);
              if (currentLesson <= 3) return [0, 1, 2, 3, 4, -1, total - 1];
              if (currentLesson >= total - 4) return [0, -1, total - 5, total - 4, total - 3, total - 2, total - 1];
              return [0, -1, currentLesson - 1, currentLesson, currentLesson + 1, -1, total - 1];
            };
            
            return getPages().map((i, idx) => {
              if (i === -1) return <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-bold">...</span>;
              const l = LESSONS[i];
              if (!l) return null;
              return (
                <button key={l.id || i} onClick={() => { setCurrentLesson(i); reset(); }}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    i === currentLesson
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 border border-amber-400"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:border-amber-400 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400"
                  }`}
                >
                  {l.done && <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                  <span>Leçon {i + 1}</span>
                </button>
              );
            });
          })()}
        </div>

        <button
          onClick={() => {
            if (currentLesson < LESSONS.length - 1) {
              setCurrentLesson(c => c + 1); reset();
            } else {
              window.location.href = "/dashboard/courses/listening";
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30 transition-all shadow-sm shrink-0"
          title={currentLesson < LESSONS.length - 1 ? "Leçon suivante" : "Cours suivant"}
        >
          <span className="hidden sm:inline">{currentLesson < LESSONS.length - 1 ? "Leçon suivante" : "Cours suivant"}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Instructions + Editor Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Instructions */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white">{lesson.title}</h2>
            <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.duration}</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">Consigne</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{lesson.instruction}</p>
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Longueur requise : {lesson.minWords}–{lesson.maxWords} mots
          </div>

          <button onClick={() => setShowModel(!showModel)}
            className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
            {showModel ? "Masquer" : "Voir"} l'exemple de réponse
          </button>

          {showModel && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {lesson.modelAnswer}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Votre réponse</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              wordStatus === "ok" ? "bg-emerald-100 text-emerald-700" :
              wordStatus === "over" ? "bg-red-100 text-red-700" :
              "bg-slate-100 text-slate-600"
            }`}>
              {wordCount} / {lesson.maxWords} mots
            </span>
          </div>

          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setAiFeedback(null); }}
            placeholder={`Rédigez votre réponse ici...\n\nConseils :\n• Respectez la structure demandée\n• Vérifiez votre grammaire\n• Relisez avant de soumettre`}
            className="w-full h-56 resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />

          <div className="flex gap-2">
            <button onClick={handleAI} disabled={aiLoading || !text.trim() || wordStatus === "under"}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
              {aiLoading
                ? <><span className="animate-spin">⚙</span> Analyse...</>
                : <><BrainCircuit className="h-4 w-4" /> Corriger par IA</>
              }
            </button>
            <button onClick={reset} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 transition-colors">
              Effacer
            </button>
          </div>

          {aiFeedback && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900 space-y-4">
                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
                  <BrainCircuit className="h-4 w-4" /> Analyse IA
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
                      window.location.href = "/dashboard/courses/listening";
                    }
                    localStorage.removeItem("tcf_session_writing_course");
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 animate-pulse"
                >
                  <span>Passer au cours suivant</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button disabled={currentLesson === 0} onClick={() => { setCurrentLesson(c => c - 1); reset(); }}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">← Cours précédent</span>
        </button>
        <button
          onClick={() => {
            if (currentLesson < LESSONS.length - 1) {
              setCurrentLesson(c => c + 1); reset();
            } else {
              window.location.href = "/dashboard/courses/listening";
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <span className="hidden sm:inline">Cours suivant →</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
