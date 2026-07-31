"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, BookOpen, XCircle } from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";
import { getCurrentUserPack, PACK_CONFIGS, getExamDurationSecondsForPack } from "@/utils/subscriptionEngine";
import { useUserPack } from "@/hooks/useUserPack";
import { generateExamPassagesForPack } from "@/utils/courseGenerator";
import { createClient } from "@/utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

interface TextPassage {
  id: number;
  title: string;
  content: string;
  questions: Question[];
}

// ─── Passages de démonstration ────────────────────────────────────────────────
const BASE_PASSAGES: TextPassage[] = [
  {
    id: 1,
    title: "L'immigration francophone au Canada",
    content: `Le Canada accueille chaque année des centaines de milliers de nouveaux immigrants. Parmi eux, une proportion importante est francophone, attirée notamment par la province du Québec et les communautés francophones hors Québec.

Le gouvernement canadien a mis en place plusieurs programmes destinés spécifiquement aux immigrants francophones, reconnaissant ainsi la valeur de la diversité linguistique pour le tissu social et économique du pays. Ces programmes offrent des avantages en termes de traitement des demandes et d'intégration.

L'intégration des nouveaux arrivants francophones passe par plusieurs étapes : la reconnaissance des diplômes étrangers, l'apprentissage des particularités culturelles canadiennes, et la maîtrise des codes professionnels locaux. Des organismes comme les réseaux de développement économique et d'employabilité jouent un rôle clé dans cet accompagnement.`,
    questions: [
      {
        id: 1,
        text: "Quel est l'objectif principal du gouvernement canadien concernant les immigrants francophones ?",
        options: [
          "Limiter leur nombre pour préserver l'anglais",
          "Reconnaître la valeur de la diversité linguistique",
          "Les orienter exclusivement vers le Québec",
          "Leur imposer d'apprendre l'anglais",
        ],
        correct: 1,
      },
      {
        id: 2,
        text: "Quelle étape est mentionnée dans le processus d'intégration ?",
        options: [
          "L'obtention de la citoyenneté immédiate",
          "Le remboursement des frais de déménagement",
          "La reconnaissance des diplômes étrangers",
          "Le changement obligatoire de prénom",
        ],
        correct: 2,
      },
    ],
  },
  {
    id: 2,
    title: "Les villes canadiennes et la qualité de vie",
    content: `Régulièrement classées parmi les meilleures villes du monde pour leur qualité de vie, les métropoles canadiennes attirent des immigrants du monde entier. Vancouver, Toronto, Montréal et Ottawa se distinguent par leurs infrastructures développées, leurs systèmes de santé publique accessibles et leurs politiques d'inclusion sociale.

Montréal occupe une place particulière en tant que principal centre urbain francophone en Amérique du Nord. Avec ses universités de renommée mondiale, son secteur culturel dynamique et son coût de la vie relativement abordable comparé à Toronto ou Vancouver, elle constitue une destination de premier choix pour les immigrants francophones.

La ville dispose d'un réseau d'organismes communautaires solide qui facilite l'insertion professionnelle et sociale des nouveaux arrivants.`,
    questions: [
      {
        id: 3,
        text: "Pourquoi Montréal est-elle décrite comme une destination de premier choix pour les francophones ?",
        options: [
          "Car elle est la capitale fédérale",
          "Car elle offre le coût de la vie le plus bas",
          "Car c'est le principal centre urbain francophone d'Amérique du Nord",
          "Car elle n'a aucune communauté anglophone",
        ],
        correct: 2,
      },
    ],
  },
];

const TOTAL_TIME = 60 * 60; // 60 minutes

function Timer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const isLow = seconds < 300;

  if (!mounted) return null;

  return (
    <div className={`flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums ${isLow ? "text-red-500 animate-pulse" : ""}`}>
      <Clock className="h-4 w-4" />
      {mins}:{secs}
    </div>
  );
}

export default function ReadingExamPage() {
  const { pack, mounted } = useUserPack();
  if (!mounted) return null;
  const [timeLeft, setTimeLeft] = useState(() => getExamDurationSecondsForPack("griffon", TOTAL_TIME));
  useEffect(() => {
    setTimeLeft(getExamDurationSecondsForPack(pack, TOTAL_TIME));
  }, [pack]);
  const PASSAGES = React.useMemo<typeof BASE_PASSAGES>(() => generateExamPassagesForPack(BASE_PASSAGES, pack, PACK_CONFIGS[pack]), [pack]);

  const [currentPassage, setCurrentPassage] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<number, number | null>>({});
  const [showResult, setShowResult] = useState(false);

  // Resume Session Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect Saved Session on Mount
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_reading_exam");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && !parsed.showResult && (Object.keys(parsed.allAnswers || {}).length > 0 || parsed.currentPassage > 0)) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing de session de lecture:", e);
      }
    }
  }, []);

  // Auto-Save Progress
  useEffect(() => {
    if (!showResult && !showResumeModal && (Object.keys(allAnswers).length > 0 || currentPassage > 0)) {
      saveSessionState("tcf_session_reading_exam", {
        allAnswers,
        currentPassage,
        currentQ,
        timeLeft
      });
    }
  }, [allAnswers, currentPassage, currentQ, timeLeft, showResult, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (savedSessionData.allAnswers) setAllAnswers(savedSessionData.allAnswers);
      if (typeof savedSessionData.currentPassage === "number") {
        const safePassage = Math.min(savedSessionData.currentPassage, Math.max(0, PASSAGES.length - 1));
        setCurrentPassage(safePassage);
        if (typeof savedSessionData.currentQ === "number") {
          const passageQCount = PASSAGES[safePassage]?.questions?.length || 1;
          setCurrentQ(Math.min(savedSessionData.currentQ, Math.max(0, passageQCount - 1)));
        }
      }
      if (typeof savedSessionData.timeLeft === "number") setTimeLeft(savedSessionData.timeLeft);
    }
    setShowResumeModal(false);
  };

  // Restart Session Handler
  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_reading_exam");
    setAllAnswers({});
    setCurrentPassage(0);
    setCurrentQ(0);
    setTimeLeft(getExamDurationSecondsForPack(pack, TOTAL_TIME));
    setShowResumeModal(false);
  };

  useEffect(() => {
    if (showResult || showResumeModal) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { 
          clearInterval(timerRef.current!); 
          localStorage.removeItem("tcf_session_reading_exam");
          setShowResult(true); 
          return 0; 
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [showResult, showResumeModal]);

  const allQuestions = PASSAGES.flatMap((p) => p.questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.values(allAnswers).filter((v) => v !== null).length;
  const passage = PASSAGES[currentPassage];
  const question = passage.questions[currentQ];

  const handleAnswer = (qId: number, optionIndex: number) => {
    setAllAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleFinishTest = async () => {
    localStorage.removeItem("tcf_session_reading_exam");
    setShowResult(true);

    const scoreVal = allQuestions.filter((q) => allAnswers[q.id] === q.correct).length;
    const ratio = scoreVal / totalQuestions;
    const percentage = Math.round(ratio * 100);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("exam_sessions").insert({
          user_id: user.id,
          exam_type: "reading",
          status: "completed",
          score: percentage,
          answers: allAnswers,
          ai_feedback: {
            correctCount: scoreVal,
            totalQuestions,
            percentage
          }
        });
      }
    } catch (err) {
      console.warn("Notice enregistrement résultat lecture:", err);
    }
  };

  const score = showResult
    ? allQuestions.filter((q) => allAnswers[q.id] === q.correct).length
    : 0;

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 text-center overflow-hidden rounded-3xl shadow-xl">
            <div className="h-3 bg-gradient-to-r from-emerald-600 to-teal-500" />
            <CardContent className="p-8 space-y-6">
              <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto text-emerald-600">
                <BookOpen className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Résultats — Compréhension Écrite</h2>
              
              <div className="text-5xl font-black text-emerald-600">{score}/{totalQuestions}</div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                  <p className="text-xl font-bold text-emerald-600">{score}</p>
                  <p className="text-xs text-slate-500 font-medium">Correctes</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                  <p className="text-xl font-bold text-red-500">{totalQuestions - score}</p>
                  <p className="text-xs text-slate-500 font-medium">Incorrectes</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{Math.round((score / totalQuestions) * 100)}%</p>
                  <p className="text-xs text-slate-500 font-medium">Score</p>
                </div>
              </div>

              {/* Corrections */}
              <div className="text-left space-y-3 pt-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Corrections détaillées</h3>
                {allQuestions.map((q) => {
                  const isCorrect = allAnswers[q.id] === q.correct;
                  return (
                    <div key={q.id} className={`p-3.5 rounded-xl text-xs border ${isCorrect ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300" : "border-red-200 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-300"}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          : <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-bold">{q.text}</p>
                          {!isCorrect && (
                            <p className="mt-1 opacity-90">
                              Bonne réponse : <span className="font-bold">{q.options[q.correct]}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleRestartSession} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6"
                >
                  Refaire le test
                </Button>
                <Button 
                  onClick={() => window.location.href = "/dashboard/exams/speaking"}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl px-6 shadow-md"
                >
                  Passer au test suivant ➔
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/dashboard/exams"} 
                  className="rounded-xl font-bold"
                >
                  Retour aux examens
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-2 sm:px-4">
      {/* Reusable Resume Session Modal */}
      <ResumeSessionModal
        isOpen={showResumeModal}
        title="Test en cours détecté"
        message="Vous avez déjà commencé ce test. Souhaitez-vous reprendre là où vous en étiez ?"
        onResume={handleResumeSession}
        onRestart={handleRestartSession}
      />

      {/* Top Controls & Test Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = "/dashboard/exams"}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Compréhension Écrite (CE)
            </h1>
            <p className="text-xs text-slate-500">Passage {currentPassage + 1} / {PASSAGES.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/listening"}
            className="rounded-xl font-bold text-xs"
          >
            ← <span className="hidden sm:inline ml-1">Test précédent</span>
          </Button>
          <Timer seconds={timeLeft} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/speaking"}
            className="rounded-xl font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
          >
            <span className="hidden sm:inline mr-1">Test suivant</span> →
          </Button>
        </div>
      </div>

      {/* Navigation des questions (< / >) */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 flex-wrap">
        <button
          onClick={() => {
            if (currentQ > 0) {
              setCurrentQ(q => q - 1);
            } else if (currentPassage > 0) {
              setCurrentPassage(p => p - 1);
              setCurrentQ(PASSAGES[currentPassage - 1].questions.length - 1);
            }
          }}
          disabled={currentPassage === 0 && currentQ === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Question précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Question précédente</span>
        </button>

        <div className="text-sm font-bold text-slate-700 dark:text-slate-200 px-4 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          Passage {currentPassage + 1} — Question {currentQ + 1} sur {passage.questions.length}
        </div>

        <button
          onClick={() => {
            if (currentQ < passage.questions.length - 1) {
              setCurrentQ(q => q + 1);
            } else if (currentPassage < PASSAGES.length - 1) {
              setCurrentPassage(p => p + 1);
              setCurrentQ(0);
            }
          }}
          disabled={currentPassage === PASSAGES.length - 1 && currentQ === passage.questions.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Question suivante"
        >
          <span className="hidden sm:inline">Question suivante</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Passage Text */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
          <CardHeader>
            <Badge className="w-fit bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold border-none">
              Texte #{passage.id}
            </Badge>
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {passage.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {passage.content}
            </p>
          </CardContent>
        </Card>

        {/* Right Column: Question */}
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-2xl flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-1">
                <span>Question {currentQ + 1} sur {passage.questions.length}</span>
                <span>Total répondu : {answeredCount}/{totalQuestions}</span>
              </div>
              <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((opt, oi) => {
                const isSelected = allAnswers[question.id] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => handleAnswer(question.id, oi)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </CardContent>
          </div>

          {/* Navigation Controls */}
          <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentPassage === 0 && currentQ === 0}
              onClick={() => {
                if (currentQ > 0) {
                  setCurrentQ(q => q - 1);
                } else if (currentPassage > 0) {
                  setCurrentPassage(p => p - 1);
                  setCurrentQ(PASSAGES[currentPassage - 1].questions.length - 1);
                }
              }}
              className="rounded-xl font-bold text-xs"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Question précédente</span>
            </Button>

            {currentQ < passage.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQ(q => q + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                <span className="hidden sm:inline">Question suivante</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            ) : currentPassage < PASSAGES.length - 1 ? (
              <Button
                onClick={() => {
                  setCurrentPassage(p => p + 1);
                  setCurrentQ(0);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                <span className="hidden sm:inline">Passage suivant</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleFinishTest}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs"
              >
                Soumettre les résultats
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
