"use client";

import { useState, useEffect } from "react";
import { 
  Headphones, 
  Target, 
  Trophy, 
  CheckCircle2, 
  ChevronRight,
  BookOpen,
  PenTool,
  Mic,
  Star,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";

const testsCategories = [
  { name: "Tous les tests", href: "/dashboard/exams" },
  { name: "Compréhension orale", href: "/dashboard/exams/listening" },
  { name: "Compréhension écrite", href: "/dashboard/exams/reading" },
  { name: "Production écrite", href: "/dashboard/exams/writing" },
  { name: "Production orale", href: "/dashboard/exams/speaking" }
];

export default function TestsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tous les tests");
  const userPack = getCurrentUserPack();
  const maxExams = PACK_CONFIGS[userPack].testsCount;
  const [stats, setStats] = useState({
    testsCount: 0,
    averageScore: 0,
    rankText: "Non classé"
  });

  useEffect(() => {
    const loadExamsStats = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: sessions, error } = await supabase
            .from("exam_sessions")
            .select("*")
            .eq("user_id", user.id);

          if (!error && sessions && sessions.length > 0) {
            const completed = sessions.filter(s => s.status === "completed" || s.score !== null);
            if (completed.length > 0) {
              const totalScore = completed.reduce((acc, curr) => acc + (curr.score || 0), 0);
              const avg = Math.round(totalScore / completed.length);
              setStats({
                testsCount: completed.length,
                averageScore: avg,
                rankText: avg >= 80 ? "Top 15%" : avg >= 70 ? "Top 25%" : "Top 40%"
              });
            }
          } else {
            setStats({
              testsCount: 0,
              averageScore: 0,
              rankText: "Non classé"
            });
          }
        }
      } catch (err) {
        console.error("Erreur chargement statistiques d'examens:", err);
      } finally {
        setLoading(false);
      }
    };

    loadExamsStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement des tests d'entraînement...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-xs text-slate-600 dark:text-slate-300">Entraînez-vous régulièrement pour enregistrer vos résultats et mesurer vos progrès.</p>
          </div>
        </div>
      </div>

      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tests pratiques</h1>
        <p className="text-slate-500 text-sm mt-1">Entraînez-vous avec des tests blancs et des exercices similaires à l'examen TCF Canada.</p>
      </div>

      {/* Direct Navigation Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {testsCategories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === cat.name
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{maxExams}</div>
            <div className="text-xs text-slate-500 font-medium">Tests ({PACK_CONFIGS[userPack].name})</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.testsCount}</div>
            <div className="text-xs text-slate-500 font-medium">Tests réalisés</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.averageScore}%</div>
            <div className="text-xs text-slate-500 font-medium">Score moyen</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.rankText}</div>
            <div className="text-xs text-slate-500 font-medium">Classement général</div>
          </div>
        </div>

      </div>

      {/* Tests Modules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Module CO */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                CO
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                35 minutes • 39 questions
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Compréhension orale</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Évaluez votre capacité à comprendre le français parlé à travers des enregistrements audio réels.
            </p>
          </div>

          <Link href="/dashboard/exams/listening" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
            <span>Démarrer le test de Compréhension Orale</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Module CE */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                CE
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                60 minutes • 39 questions
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Compréhension écrite</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Testez votre compréhension de textes rédigés en français (articles, documents administratifs, extraits).
            </p>
          </div>

          <Link href="/dashboard/exams/reading" className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
            <span>Démarrer le test de Compréhension Écrite</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Module PE */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                PE
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                60 minutes • 3 tâches
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Production écrite</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rédigez des messages, lettres et essais évalués automatiquement avec correction détaillée par IA.
            </p>
          </div>

          <Link href="/dashboard/exams/writing" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
            <span>Démarrer la Production Écrite</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Module PO */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                PO
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                12 minutes • 3 épreuves
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Production orale</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exprimez-vous à l'oral avec enregistrement audio en direct et évaluation automatique du score TCF.
            </p>
          </div>

          <Link href="/dashboard/exams/speaking" className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2">
            <span>Démarrer la Production Orale</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
