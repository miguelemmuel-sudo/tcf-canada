"use client";

import { useState } from "react";
import { 
  Headphones, 
  FileCheck2, 
  Target, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  BookOpen,
  PenTool,
  Mic,
  Star
} from "lucide-react";
import Link from "next/link";

const testsCategories = ["Tous les tests", "Compréhension orale", "Compréhension écrite", "Production écrite", "Production orale"];

export default function TestsPage() {
  const [activeTab, setActiveTab] = useState("Tous les tests");

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Recommendation */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl font-black shrink-0">
            🏆
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Objectif : Réussir votre TCF Canada !</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">Entraînez-vous régulièrement pour améliorer votre score.</p>
          </div>
        </div>
      </div>

      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tests pratiques</h1>
        <p className="text-slate-500 text-sm mt-1">Entraînez-vous avec des tests blancs et des exercices similaires à l'examen TCF Canada.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {testsCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">12</div>
            <div className="text-xs text-slate-500 font-medium">Tests disponibles</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">5</div>
            <div className="text-xs text-slate-500 font-medium">Tests réalisés</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">78%</div>
            <div className="text-xs text-slate-500 font-medium">Score moyen</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">Top 20%</div>
            <div className="text-xs text-slate-500 font-medium">Classement</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Liste des tests & Test Blanc Complet Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Liste des tests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Liste des tests</h2>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span>Trier par :</span>
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 font-bold">
                <option>Plus récents</option>
                <option>Difficulté</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            
            {/* Active Highlight Test Blanc #3 */}
            <div className="bg-blue-50/90 dark:bg-blue-950/40 border-2 border-blue-600 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Test blanc complet #3</h3>
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">Nouveau</span>
                  </div>
                  <p className="text-xs text-slate-500">Simulation réelle – conditions d'examen</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                    <span>⏱ 2h10</span>
                    <span>📊 Niveau TCF Canada</span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/exams/listening" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1">
                <span>Commencer</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Test 2 */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Compréhension écrite #4</h3>
                  <p className="text-xs text-slate-500">Exercices ciblés et corrigés</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                    <span>⏱ 1h00</span>
                    <span>📊 Niveau intermédiaire</span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/exams/reading" className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1">
                <span>Commencer</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Test 3 */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                  <PenTool className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Production écrite #3</h3>
                  <p className="text-xs text-slate-500">Sujets type TCF Canada</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                    <span>⏱ 1h00</span>
                    <span>📊 Niveau avancé</span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/exams/writing" className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1">
                <span>Commencer</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Test 4 */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                  <Mic className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Production orale #3</h3>
                  <p className="text-xs text-slate-500">Simulations d'entretien</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                    <span>⏱ 0h15</span>
                    <span>📊 Niveau TCF Canada</span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/exams/speaking" className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1">
                <span>Commencer</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>

        {/* Right Detail Card for Test Blanc #3 */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Test blanc complet #3</h3>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current" /> Recommandé
              </span>
            </div>
            <p className="text-xs text-slate-500">Simulation intégrale de l'examen TCF Canada</p>

            <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ℹ Ce test reprend le format officiel du TCF Canada. Réalisez-le dans les mêmes conditions que l'examen pour une évaluation fiable.
            </div>

            <div className="space-y-2 text-xs font-medium">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Détails du test</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div>⏱ Durée : <strong>2h10</strong></div>
                <div>📊 Niveau : <strong>TCF Canada</strong></div>
                <div>📑 4 parties : <strong>CO, CE, PE, PO</strong></div>
                <div>✓ Correction détaillée à la fin</div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium pt-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Compétences évaluées</h4>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/exams/listening" className="p-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-center hover:bg-blue-100 transition-colors">Compréhension orale</Link>
                <Link href="/dashboard/exams/reading" className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-center hover:bg-emerald-100 transition-colors">Compréhension écrite</Link>
                <Link href="/dashboard/exams/writing" className="p-2 rounded-xl bg-amber-50 text-amber-700 font-bold text-center hover:bg-amber-100 transition-colors">Production écrite</Link>
                <Link href="/dashboard/exams/speaking" className="p-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-center hover:bg-purple-100 transition-colors">Production orale</Link>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Link href="/dashboard/exams/listening" className="w-full py-3 rounded-xl bg-[#07192f] hover:bg-[#0c284a] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2">
              <span>▶ Commencer le test maintenant</span>
            </Link>
            <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold text-xs hover:bg-slate-50">
              Voir les consignes officielles
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
