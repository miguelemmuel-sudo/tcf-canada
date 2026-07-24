"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play, Pause, Volume2, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, Headphones, XCircle, Award, Target, Trophy, Sparkles, UserCheck, MapPin
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";
import { getCurrentUserPack, PACK_CONFIGS, getExamDurationSecondsForPack } from "@/utils/subscriptionEngine";
import { generateExamQuestionsForPack } from "@/utils/courseGenerator";
import { playMultiSpeakerDialogue, AudioScenario, AudioVoiceProfile } from "@/utils/audioContentEngine";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  audioText: string;
  text: string;
  options: string[];
  correct: number;
  voiceProfiles?: AudioVoiceProfile[];
  dialogueMetadata?: any;
  pedagogicalObjective?: string;
  vocabularyTags?: string[];
  durationSeconds?: number;
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
  const [pack, setPack] = useState(getCurrentUserPack());
  const [timeLeft, setTimeLeft] = useState(() => getExamDurationSecondsForPack(getCurrentUserPack(), TOTAL_TIME));
  useEffect(() => {
    const p = getCurrentUserPack();
    setPack(p);
    setTimeLeft(getExamDurationSecondsForPack(p, TOTAL_TIME));
  }, []);
  const QUESTIONS = React.useMemo<Question[]>(() => generateExamQuestionsForPack(DEMO_QUESTIONS, pack, PACK_CONFIGS[pack], "listening"), [pack]);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Resume Session Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cancelAudioRef = useRef<(() => void) | null>(null);

  // Detect Saved Session on Mount
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_listening_exam");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && !parsed.submitted && (parsed.answers?.some((a: any) => a !== null) || parsed.currentQ > 0)) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing de session sauvegardée:", e);
      }
    }
  }, []);

  // Auto-Save Session Progress on Change
  useEffect(() => {
    if (!submitted && !showResumeModal && (answers.some(a => a !== null) || currentQ > 0)) {
      saveSessionState("tcf_session_listening_exam", {
        answers,
        currentQ,
        timeLeft,
        submitted: false
      });
    }
  }, [answers, currentQ, timeLeft, submitted, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (savedSessionData.answers) {
        const merged = Array(QUESTIONS.length).fill(null);
        savedSessionData.answers.forEach((ans: any, i: number) => {
          if (i < QUESTIONS.length) merged[i] = ans;
        });
        setAnswers(merged);
      }
      if (typeof savedSessionData.currentQ === "number") {
        setCurrentQ(Math.min(savedSessionData.currentQ, Math.max(0, QUESTIONS.length - 1)));
      }
      if (typeof savedSessionData.timeLeft === "number") setTimeLeft(savedSessionData.timeLeft);
    }
    setShowResumeModal(false);
  };

  // Restart Handler
  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_listening_exam");
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrentQ(0);
    setTimeLeft(getExamDurationSecondsForPack(pack, TOTAL_TIME));
    setShowResumeModal(false);
  };

  // Compte à rebours
  useEffect(() => {
    if (submitted || showResumeModal) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(intervalRef.current!); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [submitted, showResumeModal]);

  const playAudioForQuestion = (qIndex: number) => {
    if (typeof window === "undefined") return;
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      cancelAudioRef.current = null;
    }
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    const question = QUESTIONS[qIndex];
    setIsPlaying(true);
    setAudioProgress(0);

    // Utilisation du lecteur multi-locuteurs avec diversité de voix (Québécois, Parisien, Acadien, etc.)
    const cancelFn = playMultiSpeakerDialogue(
      question as any,
      (progress) => setAudioProgress(progress),
      () => {
        setIsPlaying(false);
        setAudioProgress(100);
      },
      (err) => {
        console.warn("Erreur lecture audio TCF:", err);
        setIsPlaying(false);
      }
    );
    cancelAudioRef.current = cancelFn;
  };

  const stopAudio = () => {
    if (cancelAudioRef.current) {
      cancelAudioRef.current();
      cancelAudioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    if (submitted || showResult || showResumeModal) {
      stopAudio();
      return;
    }
    playAudioForQuestion(currentQ);
    return () => stopAudio();
  }, [currentQ, submitted, showResult, showResumeModal]);

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
    localStorage.removeItem("tcf_session_listening_exam");
    if (intervalRef.current) clearInterval(intervalRef.current);

    const correctCount = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
    const tcfEvaluation = calculateTcfScore(correctCount, QUESTIONS.length);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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
            totalQuestions: QUESTIONS.length,
          }
        });
      }
    } catch (err) {
      console.warn("Notice enregistrement résultat examen:", err);
    }
  };

  const correctCount = answers.filter((a, i) => a === QUESTIONS[i].correct).length;
  const tcfRes = calculateTcfScore(correctCount, QUESTIONS.length);
  const answeredCount = answers.filter((a) => a !== null).length;

  // ── Vue résultats (Attestation Officielle TCF Style) ──
  if (showResult) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-2 border-blue-600/30 bg-white dark:bg-slate-950 text-center overflow-hidden shadow-2xl rounded-3xl">
            <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
            <CardHeader className="pt-8 pb-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                <Trophy className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Attestation de Résultat TCF Canada</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Épreuve de Compréhension Orale — Simulation Réelle</p>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              
              {/* Badge Niveau NCLC */}
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-extrabold text-lg shadow-lg">
                <Sparkles className="h-5 w-5" />
                <span>Niveau : {tcfRes.cecrlLevel} — {tcfRes.nclcLevel}</span>
              </div>

              {/* Grid des scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-2xl font-black text-blue-600">{tcfRes.scoreTcf} pts</div>
                  <div className="text-xs text-slate-500 font-bold mt-1">Score TCF (100 - 699)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{correctCount}/{QUESTIONS.length}</div>
                  <div className="text-xs text-slate-500 font-bold mt-1">Bonnes réponses ({tcfRes.percentage}%)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-2xl font-black text-emerald-600">{tcfRes.nclcLevel}</div>
                  <div className="text-xs text-slate-500 font-bold mt-1">Équivalence NCLC</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 font-semibold">
                🎯 {tcfRes.nclcDescription}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleRestartSession}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6"
                >
                  Refaire le test
                </Button>
                <Button 
                  onClick={() => window.location.href = "/dashboard/exams/reading"}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl px-6 shadow-md"
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

  const currentQuestionData = QUESTIONS[currentQ] || DEMO_QUESTIONS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 px-2 sm:px-4">
      {/* Reusable Session Resume Modal */}
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
            <h1 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-600" />
              Compréhension Orale (CO)
            </h1>
            <p className="text-xs text-slate-500">Question {currentQ + 1} sur {QUESTIONS.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/writing"}
            className="rounded-xl font-bold text-xs"
          >
            ← Test précédent
          </Button>
          <Timer seconds={timeLeft} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/reading"}
            className="rounded-xl font-bold text-xs bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
          >
            Test suivant →
          </Button>
        </div>
      </div>

      {/* Bannières Métadonnées Professionnelles Audio (Voix, Accents, Scénarios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
          <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-200 block mb-0.5">Profils Vocaux & Accents Francophones</span>
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {currentQuestionData.voiceProfiles?.map((v: any) => `${v.name} (${v.accent})`).join(" & ") || "Marc (Montréal, QC) & Sophie (Paris, France)"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-0.5">Contexte du Scénario TCF</span>
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">
              {currentQuestionData.dialogueMetadata?.context || "Dialogue authentique en milieu canadien"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation des questions (< / >) */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 flex-wrap">
        <button
          onClick={() => setCurrentQ((prev) => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Question précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Question précédente</span>
        </button>

        <div className="text-sm font-bold text-slate-700 dark:text-slate-200 px-4 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          Question {currentQ + 1} sur {QUESTIONS.length}
        </div>

        <button
          onClick={() => setCurrentQ((prev) => Math.min(QUESTIONS.length - 1, prev + 1))}
          disabled={currentQ === QUESTIONS.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Question suivante"
        >
          <span>Question suivante</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Main Question Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between mb-3">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold border-none">
              Écoute Audio #{currentQuestionData.id}
            </Badge>
            <span className="text-xs font-semibold text-slate-400">
              Répondu : {answeredCount}/{QUESTIONS.length}
            </span>
          </div>

          {/* Player Box */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex items-center gap-4 border border-slate-200/60 dark:border-slate-800">
            <Button
              size="icon"
              onClick={togglePlay}
              className={`h-12 w-12 rounded-full shrink-0 ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
            </Button>

            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{isPlaying ? "🔊 Dialogue en cours d'écoute..." : "Prêt à l'écoute (Voix professionnelles)"}</span>
                <span>{Math.round(audioProgress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-200" style={{ width: `${audioProgress}%` }} />
              </div>
            </div>
          </div>
          
          {currentQuestionData.pedagogicalObjective && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
              🎯 <strong className="font-semibold">Objectif d'évaluation :</strong> {currentQuestionData.pedagogicalObjective}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-relaxed">
            {currentQuestionData.text}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestionData.options.map((opt, oi) => {
              const isSelected = answers[currentQ] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  onClick={() => handleAnswer(oi)}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600"
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </span>
                  {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                className="rounded-xl font-bold text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Question précédente
              </Button>

              {currentQ < QUESTIONS.length - 1 ? (
                <Button
                  onClick={() => setCurrentQ(q => Math.min(QUESTIONS.length - 1, q + 1))}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Question suivante <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl px-6"
              >
                Terminer & Soumettre
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
