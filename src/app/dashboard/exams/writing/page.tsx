"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, PenTool, BrainCircuit, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

// ─── Tâches d'Expression Écrite ──────────────────────────────────────────────
const TASKS = [
  {
    id: 1,
    type: "courriel",
    title: "Tâche 1 — Courriel formel",
    instructions: `Vous avez reçu un courriel d'une entreprise canadienne vous demandant de vous présenter pour un poste dans votre domaine. 
    
Rédigez une réponse formelle en 150-200 mots dans laquelle vous :
• Remerciez pour l'invitation
• Présentez brièvement votre parcours professionnel
• Exprimez votre motivation pour ce poste
• Proposez une disponibilité pour un entretien`,
    minWords: 150,
    maxWords: 200,
    timeMinutes: 20,
  },
  {
    id: 2,
    type: "article",
    title: "Tâche 2 — Essai argumentatif",
    instructions: `L'immigration enrichit-elle la société d'accueil ?

Rédigez un texte argumentatif de 200-250 mots dans lequel vous exposez votre point de vue en vous appuyant sur des exemples concrets. Vous devez présenter au moins deux arguments et les illustrer.`,
    minWords: 200,
    maxWords: 250,
    timeMinutes: 25,
  },
  {
    id: 3,
    type: "synthese",
    title: "Tâche 3 — Synthèse de documents",
    instructions: `À partir des documents suivants (hypothétiques), rédigez une synthèse objective de 120-150 mots :
    
• Document A : Statistiques sur l'immigration francophone (2020-2024)
• Document B : Témoignage d'un immigrant récent au Québec
• Document C : Extrait de la politique d'immigration du gouvernement fédéral

Votre synthèse doit rendre compte des informations essentielles sans prendre position personnelle.`,
    minWords: 120,
    maxWords: 150,
    timeMinutes: 15,
  },
];

const AI_FEEDBACK = [
  "✅ Votre texte est bien structuré avec une introduction et une conclusion claires.",
  "💡 Conseil : Enrichissez votre vocabulaire — remplacez \"faire\" par des verbes plus précis comme \"réaliser\", \"accomplir\", \"effectuer\".",
  "⚠️ Attention à l'accord des participes passés dans les phrases composées.",
  "📝 Niveau estimé : B2 — Bonne maîtrise de la langue avec quelques imprécisions mineures.",
  "🎯 Score IA : 68/100 — Continuez à vous entraîner !",
];

const TOTAL_TIME = 60 * 60;

function Timer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return (
    <div className={`flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums ${seconds < 300 ? "text-red-500 animate-pulse" : ""}`}>
      <Clock className="h-4 w-4" /> {mins}:{secs}
    </div>
  );
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function WritingExamPage() {
  const [currentTask, setCurrentTask] = useState(0);
  const [texts, setTexts] = useState<string[]>(Array(TASKS.length).fill(""));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timerRef.current!);
  }, [submitted]);

  const handleAICorrection = useCallback(async () => {
    if (!texts[currentTask].trim()) return;
    setAiLoading(true);
    setAiFeedback(null);
    // Simulation appel IA (en production : appel API OpenAI)
    await new Promise((r) => setTimeout(r, 2000));
    setAiFeedback(AI_FEEDBACK.join("\n\n"));
    setAiLoading(false);
  }, [texts, currentTask]);

  const task = TASKS[currentTask];
  const wordCount = countWords(texts[currentTask]);
  const wordStatus = wordCount < task.minWords ? "under" : wordCount > task.maxWords ? "over" : "ok";

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 overflow-hidden text-center">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-600" />
            <CardContent className="p-10 space-y-6">
              <div className="h-20 w-20 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto">
                <PenTool className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">Productions soumises !</h2>
              <p className="text-muted-foreground">Vos textes ont été envoyés pour correction par IA.</p>
              <div className="grid grid-cols-3 gap-4">
                {TASKS.map((t, i) => (
                  <div key={t.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                    <p className="text-lg font-bold">{countWords(texts[i])}</p>
                    <p className="text-xs text-muted-foreground">mots — Tâche {i + 1}</p>
                  </div>
                ))}
              </div>
              {aiFeedback && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 text-left space-y-2 border border-amber-200 dark:border-amber-900">
                  <h3 className="font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <BrainCircuit className="h-4 w-4" /> Retour de l'IA
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {aiFeedback}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setSubmitted(false); setAiFeedback(null); }}>
                  Modifier
                </Button>
                <Button className="flex-1" onClick={handleAICorrection} disabled={aiLoading}>
                  {aiLoading ? <><span className="animate-spin mr-2">⚙</span> Analyse...</> : <><BrainCircuit className="h-4 w-4 mr-2" /> Corriger par IA</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PenTool className="h-5 w-5 text-amber-500" /> Expression Écrite
          </h1>
          <p className="text-sm text-muted-foreground">Tâche {currentTask + 1} sur {TASKS.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <Timer seconds={timeLeft} />
          <Button variant="outline" size="sm" onClick={() => setSubmitted(true)}>
            Soumettre
          </Button>
        </div>
      </div>

      {/* Onglets tâches */}
      <div className="flex gap-2">
        {TASKS.map((t, i) => (
          <button key={t.id} onClick={() => { setCurrentTask(i); setAiFeedback(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              i === currentTask
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/25"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-muted-foreground hover:border-amber-300"
            }`}
          >
            Tâche {i + 1}
            {texts[i].trim() && i !== currentTask && (
              <CheckCircle2 className="h-3 w-3 inline ml-1.5 text-emerald-500" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Consigne */}
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-100 text-amber-700 border-none">{task.type}</Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />{task.timeMinutes} min recommandées
              </Badge>
            </div>
            <CardTitle className="text-base mt-2">{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {task.instructions}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              Longueur requise : {task.minWords}–{task.maxWords} mots
            </div>

            {/* Feedback IA */}
            {aiFeedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed space-y-1"
              >
                <p className="font-semibold flex items-center gap-1.5 text-sm mb-2">
                  <BrainCircuit className="h-4 w-4 text-amber-500" /> Analyse IA
                </p>
                {aiFeedback}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Éditeur */}
        <Card className="border-border/50 bg-white dark:bg-slate-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Votre réponse</CardTitle>
              <div className={`text-sm font-mono font-bold px-2 py-0.5 rounded-md ${
                wordStatus === "ok" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : wordStatus === "over" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {wordCount} / {task.maxWords} mots
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={texts[currentTask]}
              onChange={(e) => {
                const newTexts = [...texts];
                newTexts[currentTask] = e.target.value;
                setTexts(newTexts);
                setAiFeedback(null);
              }}
              placeholder={`Rédigez votre ${task.type} ici...\n\nN'oubliez pas de respecter la structure et la longueur requises.`}
              className="w-full h-64 resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleAICorrection} disabled={aiLoading || !texts[currentTask].trim()}>
                {aiLoading
                  ? <><span className="animate-spin inline-block mr-2">⚙</span> Analyse en cours...</>
                  : <><BrainCircuit className="h-3.5 w-3.5 mr-1.5" /> Corriger par IA</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCurrentTask((t) => Math.max(0, t - 1))} disabled={currentTask === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Tâche précédente
        </Button>
        {currentTask < TASKS.length - 1
          ? <Button onClick={() => setCurrentTask((t) => t + 1)}>Tâche suivante <ChevronRight className="h-4 w-4 ml-1" /></Button>
          : <Button onClick={() => setSubmitted(true)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4 mr-1" /> Soumettre tout</Button>
        }
      </div>
    </div>
  );
}
