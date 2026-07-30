"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  RotateCcw,
  Sparkles,
  BookOpen,
  Headphones,
  FileText,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Trophy,
} from "lucide-react";
import { saveExamResult } from "@/utils/resultPersistence";

interface QuizQuestion {
  id: number;
  category: "CO" | "CE" | "Grammaire" | "Vocabulaire";
  level: "A2" | "B1" | "B2" | "C1";
  question: string;
  context?: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUIZ_BANK: QuizQuestion[] = [
  {
    id: 1,
    category: "Grammaire",
    level: "B2",
    question: "Choisissez la forme correcte du subjonctif : 'Il est indispensable que tu ___ ton dossier avant la fin du mois.'",
    options: ["remplis", "remplisses", "remplira", "remplissais"],
    correct: 1,
    explanation: "Après l'expression impersonnelle 'il est indispensable que', on emploie obligatoirement le subjonctif présent : tu remplisses.",
  },
  {
    id: 2,
    category: "Vocabulaire",
    level: "B2",
    question: "Dans le contexte de l'immigration canadienne, quel terme désignait le système de sélection basé sur le profil de compétences ?",
    options: ["Entrée Express", "Permis Vacances Travail", "Sponsorisation locale", "Quota régional"],
    correct: 0,
    explanation: "'Entrée Express' est le système de gestion des demandes d'immigration pour les travailleurs qualifiés au Canada.",
  },
  {
    id: 3,
    category: "CE",
    level: "B1",
    context: "Le service d'accueil des francophones de Moncton offre un soutien personnalisé aux familles nouvellement arrivées pour faciliter leur insertion scolaire et professionnelle.",
    question: "Quel est l'objectif principal du service décrit ?",
    options: [
      "Vendre des logements aux immigrants",
      "Faciliter l'intégration des familles francophones",
      "Organiser des voyages touristiques",
      "Délivrer des permis de conduire",
    ],
    correct: 1,
    explanation: "Le texte indique explicitement qu'il vise à 'faciliter leur insertion scolaire et professionnelle'.",
  },
  {
    id: 4,
    category: "CO",
    level: "B2",
    context: "Enregistrement : 'Chers auditeurs, le transport collectif à Montréal est gratuit cet été pour les étudiants de moins de 25 ans inscrits dans une institution francophone.'",
    question: "À quelle condition le transport est-il gratuit ?",
    options: [
      "Pour tous les résidents de Montréal",
      "Pour les étudiants de moins de 25 ans inscrits dans un établissement francophone",
      "Uniquement les fins de semaine d'été",
      "Pour les touristes canadiens uniquement",
    ],
    correct: 1,
    explanation: "L'enregistrement spécifie l'âge (<25 ans) et le statut (étudiants dans un établissement francophone).",
  },
  {
    id: 5,
    category: "Grammaire",
    level: "C1",
    question: "Identifiez la tournure passive correcte : 'Le gouvernement annonce une révision des critères de sélection.'",
    options: [
      "Une révision des critères de sélection est annoncée par le gouvernement.",
      "Une révision des critères de sélection a été annoncer par le gouvernement.",
      "Le gouvernement est annoncé une révision des critères.",
      "Une révision sera annoncée par le gouvernement.",
    ],
    correct: 0,
    explanation: "Le présent de l'indicatif à la voix active 'annonce' devient 'est annoncée' au passif avec le participe passé accordé au féminin.",
  },
  {
    id: 6,
    category: "Vocabulaire",
    level: "B1",
    question: "Trouvez le synonyme contextuel du mot 'Établissement' dans : 'L'établissement des immigrants au Québec est encouragé.'",
    options: ["Construction", "Installation", "Fermeture", "Déplacement"],
    correct: 1,
    explanation: "Dans le vocabulaire TCF/Immigration, l'établissement désigne l'installation durable dans un nouveau lieu de résidence.",
  },
];

export default function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const filteredQuestions = QUIZ_BANK.filter(
    (q) => selectedCategory === "Tous" || q.category === selectedCategory
  );

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowExplanation(false);
    setIsFinished(false);
    setScore(0);
  };

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleValidateAnswer = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);

    const currentQ = filteredQuestions[currentIndex];
    const isCorrect = selectedAnswer === currentQ.correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setUserAnswers((prev) => [...prev, selectedAnswer]);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      const finalScore = score + (selectedAnswer === filteredQuestions[currentIndex].correct ? 1 : 0);
      const ratio = finalScore / filteredQuestions.length;
      const tcfScore = Math.round(100 + ratio * 599);
      
      let nclcLevel = "NCLC 6";
      let cecrlLevel = "B1";
      if (tcfScore >= 550) { nclcLevel = "NCLC 9"; cecrlLevel = "C1"; }
      else if (tcfScore >= 450) { nclcLevel = "NCLC 7"; cecrlLevel = "B2"; }

      saveExamResult({
        title: `Quiz Express (${selectedCategory})`,
        type: "quiz",
        score: finalScore,
        maxScore: filteredQuestions.length,
        tcfScore,
        nclcLevel,
        cecrlLevel,
        aiFeedback: `Quiz rapide terminé avec ${finalScore}/${filteredQuestions.length} bonnes réponses (${Math.round(ratio * 100)}%).`,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 font-bold">
              <Zap className="w-3.5 h-3.5 mr-1" /> Quiz Express TCF
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 font-bold">
              Entraînement Rapide
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Quiz d'Évaluation Rapide
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Testez vos connaissances en grammaire, vocabulaire, compréhension écrite et orale avec des QCM calibrés TCF Canada.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Banque active</p>
            <p className="text-lg font-black text-amber-400">{QUIZ_BANK.length} Questions</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
            <BrainCircuit className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>
      </div>

      {!quizStarted && !isFinished && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-6">
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-red-600" />
              Choisissez un domaine de révision
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {["Tous", "CO", "CE", "Grammaire", "Vocabulaire"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-2xl font-black text-sm transition-all border flex flex-col items-center gap-2 ${
                    selectedCategory === cat
                      ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/30 scale-105"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-red-400"
                  }`}
                >
                  {cat === "CO" && <Headphones className="w-5 h-5" />}
                  {cat === "CE" && <FileText className="w-5 h-5" />}
                  {cat === "Grammaire" && <Sparkles className="w-5 h-5" />}
                  {cat === "Vocabulaire" && <MessageSquare className="w-5 h-5" />}
                  {cat === "Tous" && <Zap className="w-5 h-5" />}
                  <span>{cat}</span>
                </button>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex items-start gap-4">
              <Award className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Format d'entraînement réactif</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Chaque question contient son explication détaillée. Vos réponses enregistrent automatiquement un score TCF et un équivalent NCLC dans votre profil.
                </p>
              </div>
            </div>

            <Button
              onClick={handleStartQuiz}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-base shadow-xl shadow-red-600/25"
            >
              Lancer le Quiz ({filteredQuestions.length} Questions)
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {quizStarted && !isFinished && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white font-black">
                Question {currentIndex + 1} / {filteredQuestions.length}
              </Badge>
              <Badge variant="outline" className="font-bold">
                {filteredQuestions[currentIndex].category} • Niveau {filteredQuestions[currentIndex].level}
              </Badge>
            </div>
            <div className="text-sm font-bold text-slate-500">
              Score actuel: <span className="text-red-600 font-extrabold">{score}</span>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {filteredQuestions[currentIndex].context && (
              <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border-l-4 border-red-600 text-sm italic text-slate-700 dark:text-slate-300">
                "{filteredQuestions[currentIndex].context}"
              </div>
            )}

            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">
              {filteredQuestions[currentIndex].question}
            </h3>

            <div className="space-y-3">
              {filteredQuestions[currentIndex].options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === filteredQuestions[currentIndex].correct;
                
                let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-400 text-slate-800 dark:text-slate-200";
                
                if (showExplanation) {
                  if (isCorrect) {
                    btnStyle = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300 font-bold";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-red-500/10 border-red-600 text-red-600 dark:text-red-400 font-bold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </span>

                    {showExplanation && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {showExplanation && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Explication Pédagogique
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {filteredQuestions[currentIndex].explanation}
                </p>
              </motion.div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              {!showExplanation ? (
                <Button
                  onClick={handleValidateAnswer}
                  disabled={selectedAnswer === null}
                  className="px-8 py-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Valider la réponse
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="px-8 py-5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold"
                >
                  {currentIndex + 1 < filteredQuestions.length ? "Question Suivante" : "Voir les Résultats"}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isFinished && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden text-center p-8 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-red-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-600/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Quiz Terminé !
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Votre résultat a été enregistré avec succès dans votre tableau de bord.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Bonnes réponses</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{score} / {filteredQuestions.length}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 font-semibold">Score TCF estimé</p>
              <p className="text-2xl font-black text-red-600">{Math.round(100 + (score / filteredQuestions.length) * 599)} pts</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-400 font-semibold">Niveau Équivalent</p>
              <p className="text-2xl font-black text-amber-500">
                {score >= filteredQuestions.length * 0.8 ? "NCLC 8 (B2)" : "NCLC 6 (B1)"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={handleStartQuiz}
              variant="outline"
              className="w-full sm:w-auto px-8 py-5 rounded-2xl font-bold border-slate-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Recommencer le Quiz
            </Button>
            <Button
              onClick={() => window.location.href = "/dashboard/history"}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Voir mon Historique
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
}
