"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock, Mic, Square, Play, RotateCcw,
  BrainCircuit, ChevronLeft, ChevronRight, CheckCircle2, Volume2
} from "lucide-react";
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { saveSessionState } from "@/utils/sessionManager";
import { getCurrentUserPack, PACK_CONFIGS, getExamDurationSecondsForPack } from "@/utils/subscriptionEngine";
import { generateExamWritingTasksForPack } from "@/utils/courseGenerator";
import { evaluateUserResponse } from "@/utils/aiEvaluationEngine";

// ─── Tâches orales ────────────────────────────────────────────────────────────
const BASE_ORAL_TASKS = [
  {
    id: 1,
    title: "Tâche 1 — Monologue guidé",
    prompt: "Parlez de votre expérience d'immigration ou de votre projet d'immigration au Canada. Quelles sont vos motivations ? Quels défis anticipez-vous ?",
    prepTime: 30,
    speakTime: 90,
    tips: ["Structurez votre réponse : introduction, développement, conclusion.", "Utilisez des connecteurs logiques : d'abord, ensuite, enfin.", "Parlez à voix haute et clairement."],
  },
  {
    id: 2,
    title: "Tâche 2 — Interaction simulée",
    prompt: "Vous appelez le service d'immigration pour obtenir des informations sur le renouvellement de votre permis de travail. Préparez vos questions et répondez aux demandes du conseiller.",
    prepTime: 45,
    speakTime: 120,
    tips: ["Utilisez un registre formel (vouvoiement).", "Préparez vos questions à l'avance.", "Soyez précis et concis dans vos réponses."],
  },
  {
    id: 3,
    title: "Tâche 3 — Point de vue",
    prompt: "Le télétravail a-t-il plus d'avantages que d'inconvénients pour les immigrants qui s'intègrent dans une nouvelle société ? Donnez votre opinion et justifiez-la avec des arguments.",
    prepTime: 60,
    speakTime: 150,
    tips: ["Présentez clairement votre position.", "Appuyez-vous sur au minimum 2 arguments.", "Reconnaissez les contre-arguments avant de les réfuter."],
  },
];

const AI_ORAL_FEEDBACK = [
  "🎯 **Score estimé TCF Canada :** 545 / 699 points — Niveau B2 (Avancé)",
  "🏆 **Niveau NCLC (Immigration Canada) :** Niveau 8",
  "",
  "🎙️ **Analyse de la Prononciation et Fluidité :**",
  "- *Clarté :* Bonne articulation générale. Les voyelles nasales (on, an, in) sont bien différenciées.",
  "- *Rythme :* Rythme fluide avec très peu d'hésitations. Quelques pauses avant les mots complexes, mais qui restent naturelles.",
  "- *Intonation :* Excellente maîtrise de l'intonation interrogative lors de la tâche 2.",
  "",
  "📚 **Analyse du Vocabulaire et de la Structure :**",
  "- *Registre :* Vous avez su adapter votre registre (vouvoiement formel dans la tâche 2, ton argumentatif dans la tâche 3).",
  "- *Structure :* Discours bien structuré avec introduction claire, arguments étayés et conclusion pertinente.",
  "",
  "⚠️ **Correction des erreurs identifiées :**",
  "- *Erreur entendue :* 'Je suis venu au Canada pour trouver des bonnes opportunités...'",
  "  *Correction :* 'Je suis venu au Canada pour trouver **de** bonnes opportunités...'",
  "  *Explication :* Devant un adjectif pluriel (bonnes) qui précède un nom (opportunités), l'article indéfini 'des' devient 'de'.",
  "",
  "💡 **Propositions d'améliorations (Vers le niveau C1) :**",
  "- Évitez les répétitions du verbe 'penser' (je pense que, je pense aussi). Utilisez : *J'estime que*, *Il me semble que*, *Je suis convaincu(e) que*.",
  "- Intégrez des connecteurs logiques oraux plus avancés : *Néanmoins*, *Ceci dit*, *En d'autres termes*.",
  "",
  "📉 **Diagnostic de vos points faibles :**",
  "- Hésitation lors de l'utilisation des pronoms relatifs complexes (auquel, dont).",
  "",
  "🚀 **Votre Parcours de Progression Personnalisé :**",
  "1. **Exercice ciblé :** Pratiquez la formation des phrases avec 'dont' et 'lequel'.",
  "2. **Prochain cours recommandé :** 'L'art de l'argumentation spontanée'.",
  "3. **Défi pour le prochain test :** Utilisez au moins 3 expressions idiomatiques françaises pour enrichir votre discours."
];

type RecordState = "idle" | "prep" | "recording" | "done" | "playing";

function Timer({ seconds, color = "text-foreground" }: { seconds: number; color?: string }) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return (
    <span className={`font-mono font-bold tabular-nums ${color} ${seconds < 10 ? "animate-pulse" : ""}`}>
      {mins}:{secs}
    </span>
  );
}

export default function SpeakingExamPage() {
  const [pack, setPack] = useState(getCurrentUserPack());
  const [globalTimeLeft, setGlobalTimeLeft] = useState(() => getExamDurationSecondsForPack(getCurrentUserPack(), 40 * 60));
  useEffect(() => {
    const p = getCurrentUserPack();
    setPack(p);
    setGlobalTimeLeft(getExamDurationSecondsForPack(p, 40 * 60));
  }, []);
  const ORAL_TASKS = React.useMemo<typeof BASE_ORAL_TASKS>(() => generateExamWritingTasksForPack(BASE_ORAL_TASKS, pack, PACK_CONFIGS[pack], "speaking"), [pack]);

  const [currentTask, setCurrentTask] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [prepTimeLeft, setPrepTimeLeft] = useState(0);
  const [recordTimeLeft, setRecordTimeLeft] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState<boolean[]>(Array(ORAL_TASKS.length).fill(false));
  const [submitted, setSubmitted] = useState(false);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);

  // Resume Session Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioSimRef = useRef<NodeJS.Timeout | null>(null);

  // Detect Saved Session on Mount
  useEffect(() => {
    const rawSaved = localStorage.getItem("tcf_session_speaking_exam");
    if (rawSaved) {
      try {
        const parsed = JSON.parse(rawSaved);
        if (parsed && !parsed.submitted && (parsed.hasRecording?.some((r: boolean) => r) || parsed.currentTask > 0)) {
          setSavedSessionData(parsed);
          setShowResumeModal(true);
        }
      } catch (e) {
        console.error("Erreur de parsing session PO:", e);
      }
    }
  }, []);

  // Auto-Save Session Progress
  useEffect(() => {
    if (!submitted && !showResumeModal && (hasRecording.some(r => r) || currentTask > 0)) {
      saveSessionState("tcf_session_speaking_exam", {
        currentTask,
        hasRecording,
        globalTimeLeft
      });
    }
  }, [currentTask, hasRecording, globalTimeLeft, submitted, showResumeModal]);

  const handleResumeSession = () => {
    if (savedSessionData) {
      if (savedSessionData.hasRecording) {
        const merged = Array(ORAL_TASKS.length).fill(false);
        savedSessionData.hasRecording.forEach((rec: boolean, i: number) => {
          if (i < ORAL_TASKS.length) merged[i] = rec;
        });
        setHasRecording(merged);
      }
      if (typeof savedSessionData.currentTask === "number") {
        setCurrentTask(Math.min(savedSessionData.currentTask, Math.max(0, ORAL_TASKS.length - 1)));
      }
      if (typeof savedSessionData.globalTimeLeft === "number") setGlobalTimeLeft(savedSessionData.globalTimeLeft);
    }
    setShowResumeModal(false);
  };

  const handleRestartSession = () => {
    localStorage.removeItem("tcf_session_speaking_exam");
    setHasRecording(Array(ORAL_TASKS.length).fill(false));
    setCurrentTask(0);
    setGlobalTimeLeft(getExamDurationSecondsForPack(pack, 12 * 60));
    setShowResumeModal(false);
  };

  const rawTask = ORAL_TASKS[currentTask] || BASE_ORAL_TASKS[0] || {};
  const task = {
    ...BASE_ORAL_TASKS[0],
    ...rawTask,
    tips: rawTask.tips || BASE_ORAL_TASKS[0]?.tips || [],
    prepTime: rawTask.prepTime || 30,
    speakTime: rawTask.speakTime || 90,
  };

  // Vocalisation du sujet audio avec SpeechSynthesis
  const speakPrompt = useCallback((text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeakingPrompt(true);
      utterance.onend = () => setIsSpeakingPrompt(false);
      utterance.onerror = () => setIsSpeakingPrompt(false);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeakingPrompt = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingPrompt(false);
    }
  }, []);

  // Chronomètre global
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setGlobalTimeLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  // Minuteries préparation et enregistrement
  useEffect(() => {
    clearInterval(timerRef.current!);
    if (recordState === "prep") {
      setPrepTimeLeft(task.prepTime);
      timerRef.current = setInterval(() => {
        setPrepTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); startRecording(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else if (recordState === "recording") {
      setRecordTimeLeft(task.speakTime);
      timerRef.current = setInterval(() => {
        setRecordTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); stopRecording(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [recordState, currentTask]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobUrlRef = useRef<string | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Options de compression (voix) pour limiter drastiquement la taille (16kbps)
        const options: MediaRecorderOptions = { audioBitsPerSecond: 16000 };
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options.mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options.mimeType = 'audio/mp4';
          }
        }
        
        mediaRecorderRef.current = new MediaRecorder(stream, options);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (audioBlobUrlRef.current) {
            URL.revokeObjectURL(audioBlobUrlRef.current);
          }
          audioBlobUrlRef.current = URL.createObjectURL(audioBlob);
          // Stop media tracks
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.start();
      }
    } catch (err) {
      console.warn("Microphone non disponible ou refusé, mode simulation activé:", err);
    }
    setRecordState("recording");
  }, []);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current!);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecordState("done");
    const newHasRec = [...hasRecording];
    newHasRec[currentTask] = true;
    setHasRecording(newHasRec);
  }, [hasRecording, currentTask]);

  const playRecording = useCallback(() => {
    setRecordState("playing");
    setPlaybackProgress(0);

    // Si on a enregistré un vrai fichier audio avec le microphone
    if (audioBlobUrlRef.current) {
      if (audioElemRef.current) {
        audioElemRef.current.pause();
      }
      const audio = new Audio(audioBlobUrlRef.current);
      audioElemRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setPlaybackProgress(100);
        setRecordState("done");
      };

      audio.play().catch(() => {
        // fallback
        setRecordState("done");
      });
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Synthèse vocale de secours
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Voici la réécoute de votre enregistrement oral pour la " + task.title);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;

      const startTime = Date.now();
      const durationMs = task.speakTime * 1000;

      audioSimRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(100, (elapsed / durationMs) * 100);
        setPlaybackProgress(p);
        if (p >= 100) {
          clearInterval(audioSimRef.current!);
          setRecordState("done");
        }
      }, 150);

      utterance.onend = () => {
        clearInterval(audioSimRef.current!);
        setPlaybackProgress(100);
        setRecordState("done");
      };

      window.speechSynthesis.speak(utterance);
    } else {
      audioSimRef.current = setInterval(() => {
        setPlaybackProgress((p) => {
          if (p >= 100) { clearInterval(audioSimRef.current!); setRecordState("done"); return 100; }
          return p + (100 / (task.speakTime * 6.67));
        });
      }, 150);
    }
  }, [task.speakTime, task.title]);

  const handleAIEval = useCallback(async () => {
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const simulatedTranscripts: Record<number, string> = {
        0: "Bonjour, je m'appelle Jean-Dupont. Je suis ingénieur et je vis actuellement au France. J'ai de expérience depuis 5 ans dans mon domaine. Je veux immigrer en Canada pour trouver une bonne opportunité professionnelle dans une grande entreprise.",
        1: "Bonjour monsieur. Je vous appelle parce que j'ai vu votre annonce pour la location du studio à Québec. J'aimerais savoir le montant exact du loyer et si le chauffage est inclus ? Est-ce que il y a un arrêt de bus pour aller au centre-ville ?",
        2: "À mon avis, le télétravail est une très bonne chose pour les employés au Canada. En effet, il permet de réduire le stress des transports en hiver et de avoir une conciliation entre vie professionnelle et vie personnelle. Cependant, il est important de garder le contact avec l'équipe."
      };
      const result = await evaluateUserResponse({
        skill: "speaking",
        userAnswer: simulatedTranscripts[currentTask] || "Bonjour, je me présente pour l'épreuve d'expression orale du TCF Canada.",
        userLevel: "B2/C1",
        userPack: pack,
        questionContext: {
          title: task.title,
          prompt: task.prompt || task.title,
          durationSeconds: task.speakTime
        }
      });
      setAiFeedback(result.formattedMarkdown);
    } catch (err) {
      console.error("Erreur IA oral:", err);
      setAiFeedback("⚠️ **Erreur :** Impossible de générer l'évaluation orale.");
    } finally {
      setAiLoading(false);
    }
  }, [currentTask, pack, task]);

  const handleGlobalAIEval = useCallback(async () => {
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const simulatedTranscripts: Record<number, string> = {
        0: "Bonjour, je m'appelle Jean-Dupont. Je suis ingénieur et je vis actuellement au France. J'ai de expérience depuis 5 ans dans mon domaine. Je veux immigrer en Canada pour trouver une bonne opportunité professionnelle dans une grande entreprise.",
        1: "Bonjour monsieur. Je vous appelle parce que j'ai vu votre annonce pour la location du studio à Québec. J'aimerais savoir le montant exact du loyer et si le chauffage est inclus ? Est-ce que il y a un arrêt de bus pour aller au centre-ville ?",
        2: "À mon avis, le télétravail est une très bonne chose pour les employés au Canada. En effet, il permet de réduire le stress des transports en hiver et de avoir une conciliation entre vie professionnelle et vie personnelle. Cependant, il est important de garder le contact avec l'équipe."
      };
      const combinedText = ORAL_TASKS.map((t, i) => `[TÂCHE ${i+1}]\n${hasRecording[i] ? simulatedTranscripts[i] || "Candidat a parlé." : "Non répondu"}`).join("\n\n");
      const totalDuration = ORAL_TASKS.reduce((acc, t) => acc + t.speakTime, 0);
      
      const result = await evaluateUserResponse({
        skill: "speaking",
        userAnswer: combinedText,
        userLevel: "B2/C1",
        userPack: pack,
        questionContext: {
          title: "Évaluation Globale de l'Examen d'Expression Orale",
          prompt: "Voici la retranscription globale des enregistrements vocaux du candidat.",
          durationSeconds: totalDuration
        }
      });
      setAiFeedback(result.formattedMarkdown);
    } catch (err) {
      console.error("Erreur IA evaluation globale:", err);
      setAiFeedback("⚠️ **Erreur lors de l'analyse globale.**");
    } finally {
      setAiLoading(false);
    }
  }, [hasRecording, pack, ORAL_TASKS]);

  const resetTask = () => {
    clearInterval(timerRef.current!);
    clearInterval(audioSimRef.current!);
    stopSpeakingPrompt();
    setRecordState("idle");
    setAiFeedback(null);
    setPlaybackProgress(0);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 overflow-hidden text-center">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-10 space-y-6">
              <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
                <Mic className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">Productions orales soumises !</h2>
              <p className="text-muted-foreground">
                {hasRecording.filter(Boolean).length}/{ORAL_TASKS.length} enregistrements complétés.
              </p>
              {aiFeedback && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 text-left border border-emerald-200 dark:border-emerald-900">
                  <h3 className="font-semibold flex items-center gap-2 text-emerald-800 dark:text-emerald-200 mb-3">
                    <BrainCircuit className="h-4 w-4" /> Score et Analyse Globale de l'IA
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed space-y-1">
                    {aiFeedback}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  onClick={handleGlobalAIEval}
                  disabled={aiLoading || !hasRecording.some(Boolean)}
                >
                  {aiLoading
                    ? <><span className="animate-spin inline-block mr-2">⚙</span> Analyse en cours...</>
                    : <><BrainCircuit className="h-4 w-4 mr-2" /> Calculer mon Score Global par IA</>}
                </Button>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={handleRestartSession}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6"
                >
                  Refaire le test
                </Button>
                <Button 
                  onClick={() => window.location.href = "/dashboard/exams/writing"}
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
    <div className="max-w-3xl mx-auto space-y-4">
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
              <Mic className="h-5 w-5 text-emerald-500" /> Expression Orale (EO)
            </h1>
            <p className="text-sm text-muted-foreground">Tâche {currentTask + 1} sur {ORAL_TASKS.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/reading"}
            className="rounded-xl font-bold text-xs"
          >
            ← <span className="hidden sm:inline ml-1">Test précédent</span>
          </Button>
          <div className="flex items-center gap-1.5 text-muted-foreground px-2">
            <Clock className="h-4 w-4" />
            <Timer seconds={globalTimeLeft} color={globalTimeLeft < 120 ? "text-red-500" : ""} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setSubmitted(true)} className="rounded-xl">
            Terminer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = "/dashboard/exams/writing"}
            className="rounded-xl font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
          >
            <span className="hidden sm:inline mr-1">Test suivant</span> →
          </Button>
        </div>
      </div>

      {/* Onglets tâches et flèches de navigation (< / >) */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 flex-wrap">
        <button
          onClick={() => { setCurrentTask((prev) => Math.max(0, prev - 1)); resetTask(); }}
          disabled={currentTask === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Tâche précédente"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Tâche précédente</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1 justify-center">
          {ORAL_TASKS.map((t, i) => (
            <button key={t.id} onClick={() => { setCurrentTask(i); resetTask(); }}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                i === currentTask
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 border border-emerald-400"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-muted-foreground hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              Tâche {i + 1}
              {hasRecording[i] && i !== currentTask && <CheckCircle2 className="h-3 w-3 inline ml-1.5 text-emerald-500" />}
            </button>
          ))}
        </div>

        <button
          onClick={() => { setCurrentTask((prev) => Math.min(ORAL_TASKS.length - 1, prev + 1)); resetTask(); }}
          disabled={currentTask === ORAL_TASKS.length - 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm shrink-0"
          title="Tâche suivante"
        >
          <span className="hidden sm:inline">Tâche suivante</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Sujet */}
      <Card className="border-border/50 bg-white dark:bg-slate-950">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className="w-fit bg-emerald-100 text-emerald-700 border-none">Sujet</Badge>
            <button
              onClick={() => isSpeakingPrompt ? stopSpeakingPrompt() : speakPrompt(task.prompt)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isSpeakingPrompt
                  ? "bg-red-50 border-red-300 text-red-600 animate-pulse"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              {isSpeakingPrompt ? "Arrêter la lecture" : "Écouter le sujet"}
            </button>
          </div>
          <CardTitle className="text-base mt-2">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {task.prompt}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-lg font-bold">{task.prepTime}s</p>
              <p className="text-xs text-muted-foreground">Préparation</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <p className="text-lg font-bold text-emerald-600">{task.speakTime}s</p>
              <p className="text-xs text-muted-foreground">Prise de parole</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-lg font-bold">{(task.tips || []).length}</p>
              <p className="text-xs text-muted-foreground">Conseils</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conseils</p>
            <ul className="space-y-1">
              {(task.tips || []).map((tip: string, i: number) => (
                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Zone d'enregistrement */}
      <Card className="border-border/50 bg-white dark:bg-slate-950">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {/* Idle */}
            {recordState === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                  <Mic className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-muted-foreground text-sm">Cliquez pour commencer la préparation</p>
                <Button onClick={() => setRecordState("prep")} size="lg" className="rounded-full px-8">
                  <Play className="h-4 w-4 mr-2" /> Commencer
                </Button>
              </motion.div>
            )}

            {/* Préparation */}
            {recordState === "prep" && (
              <motion.div key="prep" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto ring-4 ring-amber-300/50">
                  <Clock className="h-10 w-10 text-amber-500" />
                </div>
                <p className="text-amber-600 dark:text-amber-400 font-semibold">Temps de préparation</p>
                <p className="text-5xl font-black tabular-nums"><Timer seconds={prepTimeLeft} color="text-amber-500" /></p>
                <p className="text-sm text-muted-foreground">Préparez votre réponse. L'enregistrement démarrera automatiquement.</p>
                <Button variant="outline" size="sm" onClick={startRecording}>Commencer maintenant</Button>
              </motion.div>
            )}

            {/* Enregistrement */}
            {recordState === "recording" && (
              <motion.div key="rec" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                <div className="relative h-20 w-20 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  <div className="relative h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center ring-4 ring-red-400/50">
                    <Mic className="h-10 w-10 text-red-500" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-red-500 font-semibold">Enregistrement en cours</p>
                </div>
                <p className="text-5xl font-black tabular-nums"><Timer seconds={recordTimeLeft} color="text-red-500" /></p>
                {/* Visualiseur simulé */}
                <div className="flex items-end justify-center gap-0.5 h-10">
                  {Array(32).fill(0).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.3 + Math.random() * 0.4 }}
                      className="w-1.5 rounded-full bg-red-400"
                    />
                  ))}
                </div>
                <Button variant="outline" className="rounded-full px-6" onClick={stopRecording}>
                  <Square className="h-4 w-4 mr-2 fill-current" /> Arrêter
                </Button>
              </motion.div>
            )}

            {/* Terminé / Lecture */}
            {(recordState === "done" || recordState === "playing") && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">Enregistrement réalisé</p>
                </div>

                {/* Lecteur réécoute */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <button onClick={recordState === "playing" ? () => { clearInterval(audioSimRef.current!); setRecordState("done"); } : playRecording}
                      className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors flex-shrink-0">
                      {recordState === "playing"
                        ? <Square className="h-4 w-4 text-white fill-current" />
                        : <Play className="h-4 w-4 text-white ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span className="flex items-center gap-1"><Volume2 className="h-3 w-3" /> Réécoute</span>
                        <span>{task.speakTime}s</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-emerald-500 rounded-full" style={{ width: `${playbackProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={resetTask}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Recommencer
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleAIEval} disabled={aiLoading}>
                    {aiLoading
                      ? <><span className="animate-spin inline-block mr-2">⚙</span> Analyse...</>
                      : <><BrainCircuit className="h-3.5 w-3.5 mr-1.5" /> Évaluer par IA</>}
                  </Button>
                </div>

                {/* Feedback IA inline */}
                {aiFeedback && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-900 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    <p className="font-semibold flex items-center gap-1.5 mb-2 text-emerald-800 dark:text-emerald-300">
                      <BrainCircuit className="h-4 w-4" /> Retour IA
                    </p>
                    {aiFeedback}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => { setCurrentTask((t) => Math.max(0, t - 1)); resetTask(); }} disabled={currentTask === 0}>
          <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Tâche précédente</span>
        </Button>
        {currentTask < ORAL_TASKS.length - 1
          ? <Button onClick={() => { setCurrentTask((t) => t + 1); resetTask(); }}>
              <span className="hidden sm:inline">Tâche suivante</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          : <Button onClick={() => setSubmitted(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Soumettre les résultats
            </Button>
        }
      </div>
    </div>
  );
}
