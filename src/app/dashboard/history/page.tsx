"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Search,
  Filter,
  Award,
  Calendar,
  ChevronRight,
  Sparkles,
  Headphones,
  FileText,
  Edit3,
  Mic,
  Zap,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { getLocalResults, ExamResultItem } from "@/utils/resultPersistence";

// Mock data in case user has no recorded exams yet
const DEMO_HISTORY: ExamResultItem[] = [
  {
    id: "demo_1",
    title: "Compréhension Orale — Test Blanc Officiel #1",
    type: "listening",
    score: 28,
    maxScore: 35,
    tcfScore: 540,
    nclcLevel: "NCLC 8",
    cecrlLevel: "B2+",
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    aiFeedback: "Excellente compréhension des sujets d'actualité et des conversations quotidiennes canadiennes.",
  },
  {
    id: "demo_2",
    title: "Compréhension Écrite — Session d'Évaluation",
    type: "reading",
    score: 29,
    maxScore: 39,
    tcfScore: 510,
    nclcLevel: "NCLC 7",
    cecrlLevel: "B2",
    completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    aiFeedback: "Très bon repérage des informations explicites. Attention aux nuances de registres formels.",
  },
  {
    id: "demo_3",
    title: "Expression Écrite — Tâche 1 & 2",
    type: "writing",
    score: 14,
    maxScore: 20,
    tcfScore: 480,
    nclcLevel: "NCLC 6",
    cecrlLevel: "B1+",
    completedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    aiFeedback: "Structure claire et respect des consignes de comptage de mots. Enrichissez vos connecteurs logiques.",
  },
  {
    id: "demo_4",
    title: "Quiz Express — Grammaire & Lexique",
    type: "quiz",
    score: 5,
    maxScore: 6,
    tcfScore: 580,
    nclcLevel: "NCLC 9",
    cecrlLevel: "C1",
    completedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    aiFeedback: "Maîtrise remarquable du subjonctif et de la voix passive.",
  },
];

export default function HistoryPage() {
  const [results, setResults] = useState<ExamResultItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedResult, setSelectedResult] = useState<ExamResultItem | null>(null);

  useEffect(() => {
    const localRes = getLocalResults();
    if (localRes.length > 0) {
      setResults(localRes);
    } else {
      setResults(DEMO_HISTORY);
    }
  }, []);

  const filtered = results.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "listening":
        return <Headphones className="w-5 h-5 text-blue-500" />;
      case "reading":
        return <FileText className="w-5 h-5 text-green-500" />;
      case "writing":
        return <Edit3 className="w-5 h-5 text-purple-500" />;
      case "speaking":
        return <Mic className="w-5 h-5 text-amber-500" />;
      case "quiz":
        return <Zap className="w-5 h-5 text-red-500" />;
      default:
        return <Award className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 font-bold">
              <History className="w-3.5 h-3.5 mr-1" /> Historique Complet
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 font-bold">
              {results.length} Sessions enregistrées
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Historique des Examens & Quiz
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Retrouvez tous vos scores TCF Canada, vos niveaux NCLC et les corrections détaillées délivrées par le moteur IA.
          </p>
        </div>

        <Button
          onClick={() => window.location.href = "/dashboard/certificates"}
          className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold py-6 px-6 rounded-2xl shadow-lg"
        >
          <Award className="w-5 h-5 mr-2" /> Générer mon Certificat
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une épreuve..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: "all", label: "Tous" },
            { id: "listening", label: "CO" },
            { id: "reading", label: "CE" },
            { id: "writing", label: "EE" },
            { id: "speaking", label: "EO" },
            { id: "quiz", label: "Quiz" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all shrink-0 ${
                filterType === tab.id
                  ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center border-slate-200 dark:border-slate-800 rounded-3xl">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Aucune évaluation trouvée</h3>
            <p className="text-xs text-slate-400 mt-1">Passez un examen ou un quiz pour alimenter votre historique.</p>
          </Card>
        ) : (
          filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-400/50 p-5 rounded-2xl shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0 mt-1 sm:mt-0">
                  {getIconForType(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <Badge variant="outline" className="font-bold text-[10px]">
                      {item.nclcLevel} ({item.cecrlLevel})
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.completedAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>
                      Score: <strong className="text-slate-900 dark:text-white">{item.score}/{item.maxScore}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold">Score TCF</p>
                  <p className="text-xl font-black text-red-600">{item.tcfScore} <span className="text-xs text-slate-400 font-semibold">/ 699</span></p>
                </div>

                <Button
                  onClick={() => setSelectedResult(item)}
                  variant="outline"
                  className="rounded-xl font-bold text-xs border-slate-300"
                >
                  Détails <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Feedback Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl max-w-xl w-full shadow-2xl space-y-6"
          >
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <Badge className="bg-red-600 text-white font-bold mb-2">
                  Détails de l'évaluation
                </Badge>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedResult.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <p className="text-xs text-slate-400 font-bold">Score TCF Canada</p>
                <p className="text-3xl font-black text-red-600 mt-1">{selectedResult.tcfScore} pts</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                <p className="text-xs text-slate-400 font-bold">Niveau NCLC</p>
                <p className="text-3xl font-black text-amber-500 mt-1">{selectedResult.nclcLevel}</p>
              </div>
            </div>

            {selectedResult.aiFeedback && (
              <div className="p-5 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Analyse IA Griffon D'OR
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedResult.aiFeedback}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setSelectedResult(null)}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl px-6"
              >
                Fermer
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
