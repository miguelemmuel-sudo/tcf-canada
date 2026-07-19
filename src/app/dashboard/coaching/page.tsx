"use client";

import { useState } from "react";
import { 
  UserCheck, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Video, 
  ChevronRight, 
  FileText, 
  Download, 
  PlayCircle 
} from "lucide-react";

export default function CoachingPage() {
  const [activeTab, setActiveTab] = useState("Mes coachings");

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Coaching</h1>
        <p className="text-slate-500 text-sm mt-1">Bénéficiez d'un accompagnement personnalisé pour atteindre vos objectifs.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {["Mes coachings", "Réserver une séance", "Mes ressources", "Mes objectifs"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mes coachings</h2>
        <p className="text-xs text-slate-500">Retrouvez vos séances de coaching et votre suivi personnalisé.</p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">5</div>
              <div className="text-xs text-slate-500 font-medium">Séances réalisées</div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
            Voir l'historique <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500 shrink-0">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">2</div>
              <div className="text-xs text-slate-500 font-medium">Séances à venir</div>
            </div>
          </div>
          <span className="text-xs font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1">
            Voir le calendrier <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">80%</div>
              <div className="text-xs text-slate-500 font-medium">Objectifs atteints</div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1">
            Voir mes objectifs <ChevronRight className="h-3 w-3" />
          </span>
        </div>

      </div>

      {/* Grid: Prochaines séances & Dernier compte rendu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Prochaines séances */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Prochaines séances</h3>

            <div className="space-y-3">
              
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-center min-w-[55px]">
                    <span className="text-lg font-black text-slate-900 dark:text-white block leading-none">22</span>
                    <span className="text-[9px] font-bold text-slate-400 block">JUIL.</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Compréhension écrite</h4>
                    <p className="text-[11px] text-slate-400">10:00 - 11:00 • Coach Marie L.</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
                  Rejoindre
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-center min-w-[55px]">
                    <span className="text-lg font-black text-slate-900 dark:text-white block leading-none">25</span>
                    <span className="text-[9px] font-bold text-slate-400 block">JUIL.</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Production orale</h4>
                    <p className="text-[11px] text-slate-400">14:00 - 15:00 • Coach Jean P.</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
                  Rejoindre
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-center min-w-[55px]">
                    <span className="text-lg font-black text-slate-900 dark:text-white block leading-none">29</span>
                    <span className="text-[9px] font-bold text-slate-400 block">JUIL.</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Simulation complète</h4>
                    <p className="text-[11px] text-slate-400">09:00 - 10:30 • Coach Marie L.</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm">
                  Rejoindre
                </button>
              </div>

            </div>
          </div>

          <button className="w-full py-2.5 rounded-xl border border-blue-600 text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors">
            Voir toutes mes séances
          </button>
        </div>

        {/* Right: Dernier compte rendu */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Dernier compte rendu</h3>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">Excellent travail !</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Séance du 18 juillet 2026</span>
                <span className="text-slate-400 text-[11px]">Coach Marie L.</span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Très bonne progression dans l'ensemble. Votre compréhension orale s'est nettement améliorée.
              </p>

              <div className="space-y-1.5 font-medium">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span><strong>Points forts :</strong> Compréhension orale, vocabulaire</span>
                </div>
                <div className="flex items-center gap-2 text-amber-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span><strong>À travailler :</strong> Grammaire, production écrite</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span><strong>Recommandation :</strong> Continuez à pratiquer régulièrement</span>
                </div>
              </div>
            </div>
          </div>

          <button className="text-xs text-blue-600 font-bold hover:underline self-start flex items-center gap-1">
            Voir le compte rendu complet <ChevronRight className="h-3 w-3" />
          </button>
        </div>

      </div>

      {/* Grid: Mes objectifs & Ressources recommandées */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mes objectifs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Mes objectifs</h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">Améliorer la compréhension orale</span>
                  <span className="text-slate-500">85%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">Augmenter le vocabulaire</span>
                  <span className="text-slate-500">70%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-[70%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-700 dark:text-slate-200">Perfectionner la grammaire</span>
                  <span className="text-slate-500">60%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-[60%]" />
                </div>
              </div>
            </div>
          </div>

          <button className="text-xs text-blue-600 font-bold hover:underline self-start flex items-center gap-1 pt-2">
            Voir tous mes objectifs <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Ressources recommandées */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Ressources recommandées</h3>

            <div className="space-y-3 text-xs">
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Guide de préparation TCF Canada</h4>
                    <p className="text-[10px] text-slate-400">PDF • 2.5 Mo</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><Download className="h-4 w-4" /></button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center space-x-3">
                  <PlayCircle className="h-5 w-5 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Astuces pour la production orale</h4>
                    <p className="text-[10px] text-slate-400">Vidéo • 15 min</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><PlayCircle className="h-4 w-4" /></button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Exercices de grammaire avancée</h4>
                    <p className="text-[10px] text-slate-400">PDF • 1.8 Mo</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><Download className="h-4 w-4" /></button>
              </div>

            </div>
          </div>

          <button className="text-xs text-blue-600 font-bold hover:underline self-start flex items-center gap-1 pt-2">
            Voir toutes les ressources <ChevronRight className="h-3 w-3" />
          </button>
        </div>

      </div>

    </div>
  );
}
