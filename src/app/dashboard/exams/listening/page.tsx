"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play, Pause, Volume2, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Headphones, AlertCircle, XCircle
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  audioText: string;
  text: string;
  options: string[];
  correct: number;
}

// ─── Données de démonstration ─────────────────────────────────────────────────
const DEMO_QUESTIONS: Question[] = [
  {
    id: 1,
    audioText: "Bonjour, je m'appelle Marie. J'ai déménagé au Canada il y a deux ans principalement pour des raisons professionnelles, car mon entreprise m'a offert un poste à Montréal. C'était une grande opportunité pour ma carrière.",
    text: "D'après l'enregistrement, pourquoi Marie a-t-elle décidé de déménager au Canada ?",
    options: [
      "Pour rejoindre sa famille",
      "Pour des raisons professionnelles",
      "Pour améliorer son français",
      "Pour des raisons climatiques",
    ],
    correct: 1,
  },
  {
    id: 2,
    audioText: "Bonjour, ici Pierre. Le processus d'immigration pour le Canada a été assez long. J'ai déposé mon dossier complet et il a fallu exactement 18 mois avant de recevoir ma confirmation de résidence permanente.",
    text: "Combien de temps a-t-il fallu à Pierre pour obtenir son visa de résidence permanente ?",
    options: ["6 mois", "1 an", "18 mois", "2 ans"],
    correct: 2,
  },
  {
    id: 3,
    audioText: "De nombreux nouveaux arrivants soulignent qu'au-delà des démarches administratives, la principale difficulté réside dans la reconnaissance de leurs diplômes étrangers et de leurs expériences professionnelles antérieures.",
    text: "Quelle est la principale difficulté mentionnée par les immigrants dans l'enregistrement ?",
    options: [
      "La barrière linguistique",
      "La reconnaissance des diplômes",
      "Le coût de la vie",
      "Le climat canadien",
    ],
    correct: 1,
  },
  {
    id: 4,
    audioText: "Pour faciliter l'insertion professionnelle et l'établissement des francophones au Canada, le Réseau de développement économique et d'employabilité propose un accompagnement personnalisé et gratuit.",
    text: "Selon le document audio, quel organisme accompagne les nouveaux arrivants francophones ?",
    options: [
      "Immigration Canada",
      "L'Alliance française",
      "Le Réseau de développement économique et d'employabilité",
      "La Commission scolaire",
    ],
    correct: 2,
  },
  {
    id: 5,
    audioText: "En tant que conseillère en immigration, mon premier conseil pour tous les candidats est de préparer soigneusement leur dossier en vérifiant chaque document à l'avance pour éviter tout retard.",
    text: "Quel conseil l'experte donne-t-elle aux candidats à l'immigration ?",
    options: [
      "Apprendre l'anglais avant de partir",
      "Préparer soigneusement leur dossier",
      "Choisir une grande ville",
      "S'inscrire à des cours en ligne",
    ],
    correct: 1,
  },
];

const TOTAL_TIME = 35 * 60; // 35 minutes en secondes

// ─── Composant Timer ──────────────────────────────────────────────────────────
function Timer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const isLow = seconds < 300;
  return (
    <div className={`flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums ${isLow ? "text-red-500 animate-pulse" : "text-foreground"}`}>
      <Clock className="h-4 w-4" />
      {mins}:{secs}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ListeningExamPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(DEMO_QUESTIONS.length).fill(null));
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Compte à rebours
  useEffect(() => {
    if (submitted) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(intervalRef.current!); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [submitted]);

  // Fonction de lecture vocale
  const playAudioForQuestion = (qIndex: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const question = DEMO_QUESTIONS[qIndex];
    const utterance = new SpeechSynthesisUtterance(question.audioText);
    utterance.lang = "fr-FR";
    utterance.rate = 0.92;
    utteranceRef.current = utterance;

    const estimatedDurationMs = (question.audioText.length / 14) * 1000;
    const startTime = Date.now();

    utterance.onstart = () => {
      setIsPlaying(true);
      setAudioProgress(0);
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(99, (elapsed / estimatedDurationMs) * 100);
        setAudioProgress(progress);
      }, 100);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setAudioProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stopper la voix
  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // Jouer automatiquement l'audio au changement de question
  useEffect(() => {
    if (submitted || showResult) {
      stopAudio();
      return;
    }
    playAudioForQuestion(currentQ);

    return () => {
      stopAudio();
    };
  }, [currentQ, submitted, showResult]);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudioForQuestion(currentQ);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    stopAudio();
    setSubmitted(true);
    setShowResult(true);
    clearInterval(intervalRef.current!);
  };

  const score = submitted
    ? answers.filter((a, i) => a === DEMO_QUESTIONS[i].correct).length
    : 0;

  const answeredCount = answers.filter((a) => a !== null).length;

  // ── Vue résultats ──
  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 text-center overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-primary" />
            <CardContent className="p-10 space-y-6">
              <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto">
                <Headphones className="h-10 w-10 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Résultats — Compréhension Orale</h2>
                <p className="text-muted-foreground">Voici votre performance sur cette session</p>
              </div>
              <div className="text-5xl font-black text-blue-500">
                {Math.round((score / DEMO_QUESTIONS.length) * 699)} <span className="text-lg font-bold text-slate-400">/ 699 pts</span>
              </div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold text-sm border border-blue-200 dark:border-blue-800">
                Niveau TCF Canada : {score >= 4 ? "B2 (Avancé - NCLC 8)" : score >= 3 ? "B1 (Intermédiaire - NCLC 6)" : "A2 (Élémentaire)"}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                  <p className="text-2xl font-bold text-emerald-500">{score}</p>
                  <p className="text-xs text-muted-foreground mt-1">Correctes</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                  <p className="text-2xl font-bold text-red-500">{DEMO_QUESTIONS.length - score}</p>
                  <p className="text-xs text-muted-foreground mt-1">Incorrectes</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                  <p className="text-2xl font-bold">{Math.round((score / DEMO_QUESTIONS.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Score</p>
                </div>
              </div>
              {/* Corrections détaillées */}
              <div className="text-left space-y-3">
                <h3 className="font-semibold">Corrections détaillées</h3>
                {DEMO_QUESTIONS.map((q, i) => {
                  const isCorrect = answers[i] === q.correct;
                  return (
                    <div key={q.id} className={`p-3 rounded-xl text-sm border ${isCorrect ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"}`}>
                      <div className="flex items-start gap-2">
                        {isCorrect
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                        <div>
                          <p className="font-medium">{q.text}</p>
                          <p className="text-xs text-slate-500 italic mt-0.5">"{q.audioText}"</p>
                          {!isCorrect && (
                            <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                              ✓ Bonne réponse : {q.options[q.correct]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button className="w-full" onClick={() => { setSubmitted(false); setShowResult(false); setAnswers(Array(DEMO_QUESTIONS.length).fill(null)); setCurrentQ(0); setTimeLeft(TOTAL_TIME); setAudioProgress(0); }}>
                Recommencer
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Vue examen ──
  const question = DEMO_QUESTIONS[currentQ];
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header examen */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Headphones className="h-5 w-5 text-blue-500" /> Compréhension Orale
          </h1>
          <p className="text-sm text-muted-foreground">{answeredCount}/{DEMO_QUESTIONS.length} répondues</p>
        </div>
        <div className="flex items-center gap-3">
          <Timer seconds={timeLeft} />
          <Button variant="outline" size="sm" onClick={handleSubmit} disabled={answeredCount === 0}>
            Terminer
          </Button>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          animate={{ width: `${(answeredCount / DEMO_QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Lecteur audio vocal IA */}
      <Card className="border-border/50 bg-white dark:bg-slate-950 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25 flex-shrink-0"
            >
              {isPlaying
                ? <Pause className="h-5 w-5 text-white" />
                : <Play className="h-5 w-5 text-white ml-0.5" />}
            </button>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  🔊 Audio TCF — Question {currentQ + 1}
                  {isPlaying && <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />}
                </span>
                <span className="flex items-center gap-1"><Volume2 className="h-3.5 w-3.5" /> Voix Fr</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600 rounded-full relative"
                  style={{ width: `${audioProgress}%` }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-blue-700 shadow" />
                </motion.div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{isPlaying ? "Lecture vocale en cours..." : audioProgress === 100 ? "Écoute terminée" : "Cliquez sur Play pour réécouter"}</span>
                <span>{Math.round(audioProgress)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question + Options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border-border/50 bg-white dark:bg-slate-950">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Question {currentQ + 1} / {DEMO_QUESTIONS.length}</Badge>
                {answers[currentQ] !== null && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">Répondu</Badge>
                )}
              </div>
              <CardTitle className="text-base font-medium leading-relaxed">{question.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    answers[currentQ] === i
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[currentQ] === i ? "border-blue-500 bg-blue-500" : "border-slate-300"
                    }`}>
                      {answers[currentQ] === i && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    {String.fromCharCode(65 + i)}. {opt}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentQ((q) => Math.max(0, q - 1))} disabled={currentQ === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Précédente
        </Button>
        {/* Points de navigation */}
        <div className="flex gap-1.5">
          {DEMO_QUESTIONS.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === currentQ ? "bg-blue-500 w-6" :
                answers[i] !== null ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
        {currentQ < DEMO_QUESTIONS.length - 1
          ? <Button onClick={() => setCurrentQ((q) => q + 1)}>Suivante <ChevronRight className="h-4 w-4 ml-1" /></Button>
          : <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4 mr-1" /> Terminer</Button>
        }
      </div>
    </div>
  );
}
