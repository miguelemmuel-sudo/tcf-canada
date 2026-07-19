"use client";

import { useState } from "react";
import { 
  FileCheck2, 
  TrendingUp, 
  Award, 
  Star, 
  ChevronRight, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  FileText 
} from "lucide-react";

const resultsHistory = [
  { test: "Test blanc complet #3", date: "20 juillet 2026", score: "82%", level: "B2", rank: "Top 20%" },
  { test: "Compréhension écrite #4", date: "18 juillet 2026", score: "80%", level: "B2", rank: "Top 25%" },
  { test: "Production écrite #3", date: "16 juillet 2026", score: "75%", level: "B1+", rank: "Top 30%" },
  { test: "Compréhension orale #5", date: "14 juillet 2026", score: "85%", level: "B2", rank: "Top 15%" },
  { test: "Production orale #3", date: "12 juillet 2026", score: "88%", level: "B2+", rank: "Top 10%" },
];

export default function ResultsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes résultats</h1>
          <p className="text-slate-500 text-sm mt-1">Suivez vos performances et analysez vos progrès.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <option>Tous les tests</option>
            <option>Examens blancs</option>
          </select>
        </div>
      </div>

      {/* 4 Metric Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">12</div>
              <div className="text-xs text-slate-500 font-medium">Tests réalisés</div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
            Voir l'historique <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">78%</div>
              <div className="text-xs text-slate-500 font-medium">Score moyen global</div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1">
            Voir les statistiques <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">Top 20%</div>
              <div className="text-xs text-slate-500 font-medium">Classement</div>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Parmi tous les candidats</span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500 shrink-0">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Niveau actuel</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">B2</div>
              <div className="text-[10px] text-slate-400">Niveau TCF Canada</div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Dernier Résultat & Évolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Dernier résultat */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dernier résultat</h2>
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">Nouveau</span>
          </div>

          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Test blanc complet #3</h3>
                <p className="text-xs text-slate-500">Simulé intégral - Conditions officielles TCF Canada</p>
                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                  <span>📅 20 juillet 2026</span>
                  <span>⏱ Durée : 2h10</span>
                  <span>📊 Niveau : B2</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600 block">82%</span>
              <span className="text-[11px] font-bold text-slate-500 block">Score global</span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-block mt-1">Très bon travail !</span>
            </div>
          </div>

          {/* Compétences détaillées */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Compétences détaillées</h3>

            <div className="space-y-3 text-xs font-bold">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Headphones className="h-4 w-4 text-blue-600" /> Compréhension orale</span>
                  <span className="text-slate-900 dark:text-white">85%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><BookOpen className="h-4 w-4 text-emerald-600" /> Compréhension écrite</span>
                  <span className="text-slate-900 dark:text-white">80%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[80%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><PenTool className="h-4 w-4 text-amber-500" /> Production écrite</span>
                  <span className="text-slate-900 dark:text-white">75%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[75%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Mic className="h-4 w-4 text-purple-600" /> Production orale</span>
                  <span className="text-slate-900 dark:text-white">88%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-[88%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Évolution et Informations du test */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Chart Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Évolution de mes scores</h2>

            {/* Simple Line Graph Simulation */}
            <div className="h-40 flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-blue-600">
              <div className="flex flex-col items-center gap-1">
                <span>62%</span>
                <div className="h-16 w-2 bg-blue-600 rounded-t-full" />
                <span className="text-slate-400 font-normal">Test #1</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>68%</span>
                <div className="h-20 w-2 bg-blue-600 rounded-t-full" />
                <span className="text-slate-400 font-normal">Test #2</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>72%</span>
                <div className="h-24 w-2 bg-blue-600 rounded-t-full" />
                <span className="text-slate-400 font-normal">Test #3</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>78%</span>
                <div className="h-28 w-2 bg-blue-600 rounded-t-full" />
                <span className="text-slate-400 font-normal">Test #4</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span>82%</span>
                <div className="h-32 w-2 bg-blue-600 rounded-t-full" />
                <span className="text-slate-400 font-normal">Test #5</span>
              </div>
            </div>
          </div>

          {/* Informations du test Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Informations du test</h2>

            <div className="space-y-3 font-medium text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Nom du test</span>
                <span className="font-bold text-slate-900 dark:text-white">Test blanc complet #3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type</span>
                <span className="font-bold text-slate-900 dark:text-white">Simulation intégrale</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Durée</span>
                <span className="font-bold text-slate-900 dark:text-white">2h10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="font-bold text-slate-900 dark:text-white">20 juillet 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Niveau obtenu</span>
                <span className="font-bold text-blue-600">B2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Correction</span>
                <span className="font-bold text-emerald-600">Correction détaillée disponible</span>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-[#07192f] hover:bg-[#0c284a] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2">
              <span>📄 Voir la correction détaillée</span>
            </button>
          </div>

        </div>

      </div>

      {/* Historique des résultats Table */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historique des résultats</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                <th className="pb-3">Test</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Niveau</th>
                <th className="pb-3">Classement</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {resultsHistory.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                  <td className="py-4 text-slate-900 dark:text-white font-bold">{row.test}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-300">{row.date}</td>
                  <td className="py-4 font-black text-emerald-600">{row.score}</td>
                  <td className="py-4 font-bold text-slate-900 dark:text-white">{row.level}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-300">{row.rank}</td>
                  <td className="py-4 text-right">
                    <button className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">
                      Voir détails <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
