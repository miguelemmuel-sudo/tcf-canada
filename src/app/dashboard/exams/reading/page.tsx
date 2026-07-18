"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, BookOpen, XCircle } from "lucide-react";

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
const PASSAGES: TextPassage[] = [
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
  return (
    <div className={`flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums ${isLow ? "text-red-500 animate-pulse" : ""}`}>
      <Clock className="h-4 w-4" />
      {mins}:{secs}
    </div>
  );
}

export default function ReadingExamPage() {
  const [currentPassage, setCurrentPassage] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showResult) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); setShowResult(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [showResult]);

  const allQuestions = PASSAGES.flatMap((p) => p.questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.values(allAnswers).filter((v) => v !== null).length;
  const passage = PASSAGES[currentPassage];
  const question = passage.questions[currentQ];

  const handleAnswer = (qId: number, optionIndex: number) => {
    setAllAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const score = showResult
    ? allQuestions.filter((q) => allAnswers[q.id] === q.correct).length
    : 0;

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 text-center overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-primary" />
            <CardContent className="p-10 space-y-6">
              <div className="h-20 w-20 rounded-full bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto">
                <BookOpen className="h-10 w-10 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold">Résultats — Compréhension Écrite</h2>
              <div className="text-6xl font-black text-violet-500">{score}/{totalQuestions}</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                  <p className="text-2xl font-bold text-emerald-500">{score}</p>
                  <p className="text-xs text-muted-foreground mt-1">Correctes</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                  <p className="text-2xl font-bold text-red-500">{totalQuestions - score}</p>
                  <p className="text-xs text-muted-foreground mt-1">Incorrectes</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                  <p className="text-2xl font-bold">{Math.round((score / totalQuestions) * 100)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Score</p>
                </div>
              </div>
              {/* Corrections */}
              <div className="text-left space-y-3">
                <h3 className="font-semibold">Corrections détaillées</h3>
                {allQuestions.map((q) => {
                  const isCorrect = allAnswers[q.id] === q.correct;
                  return (
                    <div key={q.id} className={`p-3 rounded-xl text-sm border ${isCorrect ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium">{q.text}</p>
                          {!isCorrect && (
                            <p className="text-emerald-700 dark:text-emerald-400 mt-1">✓ {q.options[q.correct]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button className="w-full" onClick={() => { setShowResult(false); setAllAnswers({}); setCurrentPassage(0); setCurrentQ(0); setTimeLeft(TOTAL_TIME); }}>
                Recommencer
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-violet-500" /> Compréhension Écrite
          </h1>
          <p className="text-sm text-muted-foreground">{answeredCount}/{totalQuestions} répondues</p>
        </div>
        <div className="flex items-center gap-3">
          <Timer seconds={timeLeft} />
          <Button variant="outline" size="sm" onClick={() => setShowResult(true)} disabled={answeredCount === 0}>
            Terminer
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div className="h-full bg-violet-500 rounded-full" animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Layout : texte à gauche, question à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Texte */}
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-violet-600 border-violet-200">
                Texte {currentPassage + 1}/{PASSAGES.length}
              </Badge>
            </div>
            <CardTitle className="text-base mt-2">{passage.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line max-h-80 overflow-y-auto pr-2 space-y-3">
              {passage.content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div key={`${currentPassage}-${currentQ}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <Card className="border-border/50 bg-white dark:bg-slate-950 h-full">
              <CardHeader className="pb-3">
                <Badge variant="outline">Question {question.id} / {totalQuestions}</Badge>
                <CardTitle className="text-base font-medium leading-relaxed mt-2">{question.text}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {question.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(question.id, i)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                      allAnswers[question.id] === i
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                        : "border-slate-200 dark:border-slate-800 hover:border-violet-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${allAnswers[question.id] === i ? "border-violet-500 bg-violet-500" : "border-slate-300"}`}>
                        {allAnswers[question.id] === i && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                      {String.fromCharCode(65 + i)}. {opt}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline"
          onClick={() => {
            if (currentQ > 0) setCurrentQ(currentQ - 1);
            else if (currentPassage > 0) { setCurrentPassage(currentPassage - 1); setCurrentQ(PASSAGES[currentPassage - 1].questions.length - 1); }
          }}
          disabled={currentPassage === 0 && currentQ === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Précédente
        </Button>
        <div className="text-sm text-muted-foreground">
          Passage {currentPassage + 1} — Q{currentQ + 1}
        </div>
        {currentPassage < PASSAGES.length - 1 || currentQ < passage.questions.length - 1 ? (
          <Button onClick={() => {
            if (currentQ < passage.questions.length - 1) setCurrentQ(currentQ + 1);
            else { setCurrentPassage(currentPassage + 1); setCurrentQ(0); }
          }}>
            Suivante <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setShowResult(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="h-4 w-4 mr-1" /> Terminer
          </Button>
        )}
      </div>
    </div>
  );
}
