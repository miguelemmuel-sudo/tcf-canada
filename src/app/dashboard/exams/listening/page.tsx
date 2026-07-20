"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play, Pause, Volume2, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, Headphones, XCircle, Award, Target, Trophy, Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  audioText: string;
  text: string;
  options: string[];
  correct: number;
}

// ─── Données de questions TCF ───────────────────────────────────────────────
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

const TOTAL_TIME = 35 * 60; // 35 minutes

// ─── Calculateur officiel de score TCF (100 à 699 pts) & NCLC ─────────────────
function calculateTcfScore(correctCount: number, totalQuestions: number) {
  const ratio = correctCount / totalQuestions;
  
  // Échelle officielle TCF Canada (100 - 699 pts)
  const scoreTcf = Math.round(100 + ratio * 599);
  
  let nclcLevel = "NCLC 4";
  let cecrlLevel = "A2";
  let nclcDescription = "Niveau Élémentaire";

  if (scoreTcf >= 600) {
    nclcLevel = "NCLC 10 à 12";
    cecrlLevel = "C1 / C2";
    nclcDescription = "Maîtrise excellente / Autonome";
  } else if (scoreTcf >= 523) {
    nclcLevel = "NCLC 9";
    cecrlLevel = "C1";
    nclcDescription = "Utilisateur expérimenté";
  } else if (scoreTcf >= 500) {
    nclcLevel = "NCLC 8";
    cecrlLevel = "B2+";
    nclcDescription = "Niveau Avancé";
  } else if (scoreTcf >= 453) {
    nclcLevel = "NCLC 7";
    cecrlLevel = "B2";
    nclcDescription = "Seuil requis Résidence Permanente";
  } else if (scoreTcf >= 398) {
    nclcLevel = "NCLC 6";
    cecrlLevel = "B1+";
    nclcDescription = "Niveau Intermédiaire";
  } else if (scoreTcf >= 342) {
    nclcLevel = "NCLC 5";
    cecrlLevel = "B1";
    nclcDescription = "Niveau Intermédiaire initial";
  }

  return {
    scoreTcf,
    nclcLevel,
    cecrlLevel,
    nclcDescription,
    percentage: Math.round(ratio * 100),
  };
}

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

  const playAudioForQuestion = (qIndex: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const question = DEMO_QUESTIONS[qIndex];
    const utterance = new SpeechSynthesisUtterance(question.audioText);
    utterance.lang = "fr-FR";
    utterance.rate = 0.92;

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

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    if (submitted || showResult) {
      stopAudio();
      return;
    }
    playAudioForQuestion(currentQ);
    return () => stopAudio();
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

  const handleSubmit = async () => {
    stopAudio();
    setSubmitted(true);
    setShowResult(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const correctCount = answers.filter((a, i) => a === DEMO_QUESTIONS[i].correct).length;
    const tcfEvaluation = calculateTcfScore(correctCount, DEMO_QUESTIONS.length);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Enregistrer la session dans exam_sessions pour mettre à jour les statistiques client
        await supabase.from("exam_sessions").insert({
          user_id: user.id,
          exam_type: "listening",
          status: "completed",
          score: tcfEvaluation.percentage,
          ai_feedback: {
            scoreTcf: tcfEvaluation.scoreTcf,
            nclcLevel: tcfEvaluation.nclcLevel,
            cecrlLevel: tcfEvaluation.cecrlLevel,
            correctCount,
            totalQuestions: DEMO_QUESTIONS.length,
          }
        });
      }
    } catch (err) {
      console.warn("Notice enregistrement résultat examen:", err);
    }
  };

  const correctCount = answers.filter((a, i) => a === DEMO_QUESTIONS[i].correct).length;
  const tcfRes = calculateTcfScore(correctCount, DEMO_QUESTIONS.length);
  const answeredCount = answers.filter((a) => a !== null).length;

  // ── Vue résultats (Attestation Officielle TCF Style) ──
  if (showResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-2 border-blue-600/30 bg-white dark:bg-slate-950 text-center overflow-hidden shadow-2xl rounded-3xl">
            <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
            
            <CardContent className="p-6 md:p-10 space-y-6">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-left">
                  <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    TCF
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Attestation de Résultat</h3>
                    <p className="text-[11px] text-slate-400">Épreuve de Compréhension Orale</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-bold px-3 py-1 text-xs">
                  Session Officielle Complétée
                </Badge>
              </div>

              {/* Score TCF Classique (100 - 699 pts) */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Score Égalisé TCF Canada</p>
                
                <div className="flex items-center justify-center gap-2">
                  <span className="text-6xl font-black text-blue-600 dark:text-blue-400">{tcfRes.scoreTcf}</span>
                  <span className="text-lg font-bold text-slate-400 self-end mb-2">/ 699 pts</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white font-extrabold text-sm shadow-md">
                    Niveau {tcfRes.nclcLevel}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm">
                    CECRL : {tcfRes.cecrlLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                  Évaluation : <strong>{tcfRes.nclcDescription}</strong>
                </p>
              </div>

              {/* Détails métriques */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200/60 dark:border-emerald-900/40">
                  <p className="text-2xl md:text-3xl font-black text-emerald-600">{correctCount}</p>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Bonnes réponses</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200/60 dark:border-rose-900/40">
                  <p className="text-2xl md:text-3xl font-black text-rose-600">{DEMO_QUESTIONS.length - correctCount}</p>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Erreurs</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200/60 dark:border-blue-900/40">
                  <p className="text-2xl md:text-3xl font-black text-blue-600">{tcfRes.percentage}%</p>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">Taux de réussite</p>
                </div>
              </div>

              {/* Analyse pédagogique IA */}
              <div className="text-left bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-200/60 dark:border-blue-900/50 space-y-2">
                <h4 className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" /> Analyse & Conseils du Coach IA TCF
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {tcfRes.scoreTcf >= 453 
                    ? "Félicitations ! Votre résultat dépasse le seuil NCLC 7 requis pour la résidence permanente au Canada. Poursuivez votre entraînement sur les épreuves écrites."
                    : "Votre score est encourageant. Pour atteindre le niveau NCLC 7 (453 pts), entraînez-vous quotidiennement à l'écoute sélective des documents radio et débats."
                  }
                </p>
              </div>

              {/* Corrections détaillées */}
              <div className="text-left space-y-3 pt-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Correction détaillée par question</h3>
                {DEMO_QUESTIONS.map((q, i) => {
                  const isCorrect = answers[i] === q.correct;
                  return (
                    <div key={q.id} className={`p-4 rounded-2xl text-xs border ${isCorrect ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-rose-200 bg-rose-50/50 dark:bg-rose-950/20"}`}>
                      <div className="flex items-start gap-2.5">
                        {isCorrect
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          : <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">Q{i+1}. {q.text}</p>
                          <p className="text-[11px] text-slate-500 italic">" {q.audioText} "</p>
                          {!isCorrect && (
                            <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                              ✓ Réponse correcte : {q.options[q.correct]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs shadow-lg" onClick={() => { setSubmitted(false); setShowResult(false); setAnswers(Array(DEMO_QUESTIONS.length).fill(null)); setCurrentQ(0); setTimeLeft(TOTAL_TIME); setAudioProgress(0); }}>
                Refaire le test d'entraînement
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Vue Examen ──
  const question = DEMO_QUESTIONS[currentQ];
  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12">
      {/* Header Examen */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Headphones className="h-5 w-5 text-blue-600" /> Compréhension Orale TCF
          </h1>
          <p className="text-xs text-slate-500">{answeredCount}/{DEMO_QUESTIONS.length} questions répondues</p>
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
          className="h-full bg-blue-600 rounded-full"
          animate={{ width: `${(answeredCount / DEMO_QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Lecteur Audio */}
      <Card className="border-border/50 bg-white dark:bg-slate-950 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/25 shrink-0"
            >
              {isPlaying
                ? <Pause className="h-5 w-5 text-white" />
                : <Play className="h-5 w-5 text-white ml-0.5" />}
            </button>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
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
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{isPlaying ? "Lecture vocale..." : "Cliquez sur Play pour écouter"}</span>
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
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[currentQ] === i ? "border-blue-600 bg-blue-600" : "border-slate-300"
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
        <div className="flex gap-1.5">
          {DEMO_QUESTIONS.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === currentQ ? "bg-blue-600 w-6" :
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
