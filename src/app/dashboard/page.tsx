"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  BookOpen, 
  FileCheck2, 
  Target, 
  Crown, 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  HelpCircle,
  Video,
  Package,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const [userName, setUserName] = useState("Candidat");
  const [isNewUser, setIsNewUser] = useState(false);
  const [userStats, setUserStats] = useState({
    coursesCount: 0,
    testsCount: 0,
    averageScore: 0,
    globalProgress: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("griffon_user_name") || "Candidat";
    setUserName(stored.split(" ")[0] || stored);
    const newFlag = localStorage.getItem("griffon_user_new");
    if (newFlag === "true") {
      setIsNewUser(true);
    }

    // Supabase Realtime Sync
    const loadSupabaseData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Fetch user stats
          const { data: stats } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (stats) {
            setUserStats({
              coursesCount: stats.courses_count || 0,
              testsCount: stats.tests_count || 0,
              averageScore: stats.average_score || 0,
              globalProgress: stats.global_progress || 0,
            });
            setIsNewUser(false);
          }

          // Fetch recent activities
          const { data: activities } = await supabase
            .from("user_activities")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (activities && activities.length > 0) {
            setRecentActivities(activities);
            setIsNewUser(false);
          }
        }
      } catch (err) {
        console.warn("Supabase fetch notice:", err);
      }
    };

    loadSupabaseData();
  }, []);

  // Metrics (Synced with Supabase or default state)
  const coursesCount = userStats.coursesCount || (isNewUser ? 0 : 8);
  const testsCount = userStats.testsCount || (isNewUser ? 0 : 12);
  const averageScore = userStats.averageScore ? `${userStats.averageScore}%` : (isNewUser ? "0%" : "78%");
  const globalProgress = userStats.globalProgress || (isNewUser ? 0 : 66);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner - Welcome */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#071d3a] via-[#09254a] to-[#041226] text-white p-6 md:p-8 overflow-hidden shadow-xl border border-blue-900/30">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            Bonjour {userName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Bienvenue dans votre espace candidat Griffon d'or.<br />
            {isNewUser 
              ? "Commencez vos premiers entraînements pour suivre votre progression !" 
              : "Continuez votre préparation et atteignez votre objectif TCF Canada."}
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-3 bg-[#0a2952]/80 border border-blue-800/50 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-400 font-medium block">Abonnement</span>
                <span className="text-xs font-bold text-amber-400">Actif (Essai)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#0a2952]/80 border border-blue-800/50 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-400 font-medium block">Pack actuel</span>
                <span className="text-xs font-bold text-amber-400">Nouveau Candidat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Griffon D'or Crest Logo Watermark */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center opacity-90">
          <img src="/griffon_logo.png" alt="Griffon D'or" className="h-20 w-auto object-contain" />
          <span className="text-xl font-black tracking-widest text-white mt-1">GRIFFON D'OR</span>
          <span className="text-xs text-amber-500 font-semibold tracking-wide">Préparation TCF Canada</span>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{coursesCount}</div>
              <div className="text-xs text-slate-500 font-medium">Cours suivis</div>
            </div>
          </div>
          <Link href="/dashboard/courses" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            Voir mes cours <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{testsCount}</div>
              <div className="text-xs text-slate-500 font-medium">Tests réalisés</div>
            </div>
          </div>
          <Link href="/dashboard/exams" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
            Voir mes tests <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{averageScore}</div>
              <div className="text-xs text-slate-500 font-medium">Score moyen</div>
            </div>
          </div>
          <Link href="/dashboard/results" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
            Voir mes résultats <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">Actif</div>
              <div className="text-xs text-slate-500 font-medium">Abonnement</div>
            </div>
          </div>
          <Link href="/dashboard/payments" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
            Voir détails <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link href="/dashboard/exams" className="group">
            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-blue-600">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Commencer un test TCF</h3>
                  <p className="text-[11px] text-slate-500">Entraînez-vous maintenant</p>
                </div>
              </div>
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/courses" className="group">
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-emerald-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Accéder aux cours</h3>
                  <p className="text-[11px] text-slate-500">Continuez votre apprentissage</p>
                </div>
              </div>
              <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/coaching" className="group">
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-amber-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Réserver une session live</h3>
                  <p className="text-[11px] text-slate-500">Coaching avec un expert</p>
                </div>
              </div>
              <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

          <Link href="/#packs" className="group">
            <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-purple-600">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voir nos packs</h3>
                  <p className="text-[11px] text-slate-500">Choisissez votre pack</p>
                </div>
              </div>
              <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* 3 Main Columns Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1: Mes cours en cours */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Mes cours en cours</h3>
              <Link href="/dashboard/courses" className="text-xs text-blue-600 font-semibold hover:underline">Voir tout</Link>
            </div>

            <div className="space-y-4">
              
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px]">CO</span>
                    <span>Compréhension orale</span>
                  </div>
                  <span className="text-slate-500">{isNewUser ? "0%" : "75%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-600 rounded-full ${isNewUser ? "w-[0%]" : "w-[75%]"}`} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">CE</span>
                    <span>Compréhension écrite</span>
                  </div>
                  <span className="text-slate-500">{isNewUser ? "0%" : "60%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-600 rounded-full ${isNewUser ? "w-[0%]" : "w-[60%]"}`} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px]">PE</span>
                    <span>Production écrite</span>
                  </div>
                  <span className="text-slate-500">{isNewUser ? "0%" : "40%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-amber-500 rounded-full ${isNewUser ? "w-[0%]" : "w-[40%]"}`} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px]">PO</span>
                    <span>Production orale</span>
                  </div>
                  <span className="text-slate-500">{isNewUser ? "0%" : "30%"}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-purple-600 rounded-full ${isNewUser ? "w-[0%]" : "w-[30%]"}`} />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Col 2: Mes résultats récents */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Mes résultats récents</h3>
              <Link href="/dashboard/results" className="text-xs text-blue-600 font-semibold hover:underline">Voir tout</Link>
            </div>

            {isNewUser ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <FileCheck2 className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p>Aucun test réalisé pour le moment.</p>
                <p className="text-[11px] text-slate-400 mt-1">Vos résultats s'afficheront ici après votre premier essai.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Test blanc complet #3</h4>
                    <p className="text-[10px] text-slate-400">20 juillet 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-black text-xs">
                    82%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Compréhension écrite</h4>
                    <p className="text-[10px] text-slate-400">18 juillet 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-black text-xs">
                    75%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Compréhension orale</h4>
                    <p className="text-[10px] text-slate-400">16 juillet 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-black text-xs">
                    80%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Production écrite</h4>
                    <p className="text-[10px] text-slate-400">15 juillet 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-black text-xs">
                    70%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Col 3: Ma progression globale */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Ma progression globale</h3>
            
            <div className="flex items-center gap-4">
              {/* Circular Gauge */}
              <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600"
                    strokeDasharray={`${globalProgress}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-xl font-black text-slate-900 dark:text-white">{globalProgress}%</div>
                  <div className="text-[9px] text-slate-400 font-semibold">Progression</div>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <span className="text-slate-600 dark:text-slate-300">Compréhension orale</span>
                  <span className="font-bold ml-auto">{isNewUser ? "0%" : "75%"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Compréhension écrite</span>
                  <span className="font-bold ml-auto">{isNewUser ? "0%" : "60%"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300">Production écrite</span>
                  <span className="font-bold ml-auto">{isNewUser ? "0%" : "40%"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-600" />
                  <span className="text-slate-600 dark:text-slate-300">Production orale</span>
                  <span className="font-bold ml-auto">{isNewUser ? "0%" : "30%"}</span>
                </div>
              </div>
            </div>

            {/* Target Card */}
            <div className="mt-5 p-3 rounded-xl bg-[#07192f] text-white flex items-center gap-3">
              <div className="text-amber-400 text-xl font-bold">★</div>
              <div>
                <h4 className="text-xs font-bold text-white">Objectif : TCF Canada</h4>
                <p className="text-[10px] text-slate-300">
                  {isNewUser ? "Commencez pour faire monter vos statistiques !" : "Persévérez ! Vous êtes sur la bonne voie."}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Need Help Footer Bar */}
      <div className="bg-blue-50/80 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-blue-600 shadow-sm">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Besoin d'aide ?</h3>
            <p className="text-xs text-slate-500">Contactez votre coach pour un accompagnement personnalisé.</p>
          </div>
        </div>
        <a
          href="https://wa.me/22653360101"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#07192f] hover:bg-[#0c284a] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
        >
          <span>Contacter mon coach</span>
          <MessageSquare className="h-4 w-4" />
        </a>
      </div>

      {/* Footer credits */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>© 2026 Griffon d'or - Préparation TCF Canada. Tous droits réservés.</div>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <a href="#" className="hover:underline">À propos</a>
          <a href="#" className="hover:underline">Conditions d'utilisation</a>
          <a href="#" className="hover:underline">Confidentialité</a>
        </div>
      </div>

    </div>
  );
}

