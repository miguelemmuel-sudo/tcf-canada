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
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Candidat");
  const [userEmail, setUserEmail] = useState("");
  const [userStats, setUserStats] = useState({
    coursesCount: 8, // Les 8 cours du programme sont toujours accessibles
    testsCount: 0,   // 0 pour un nouveau client
    averageScore: 0, // 0% pour un nouveau client
    globalProgress: 0, // 0% pour un nouveau client
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const loadUserData = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userErr } = await supabase.auth.getUser();

        if (userErr || !user) {
          console.warn("Utilisateur non connecté");
          router.push("/login");
          return;
        }

        setUserEmail(user.email || "");
        
        // 1. Récupération stricte du profil du client connecté (RLS: auth.uid() = id)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile && (profile.first_name || profile.last_name)) {
          const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          setUserName(name);
        } else {
          const fallbackName = user.email ? user.email.split("@")[0] : "Candidat";
          setUserName(fallbackName);
        }

        // 2. Récupération des sessions d'examens uniquement pour CE client (RLS: auth.uid() = user_id)
        const { data: examSessions } = await supabase
          .from("exam_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        // 3. Récupération de la progression des cours uniquement pour CE client
        const { data: courseProgress } = await supabase
          .from("course_progress")
          .select("*")
          .eq("user_id", user.id);

        if (examSessions && examSessions.length > 0) {
          const completed = examSessions.filter(e => e.status === "completed");
          const totalScore = completed.reduce((acc, curr) => acc + (curr.score || 0), 0);
          const avg = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
          
          // Calcul dynamique du pourcentage de progression global
          const coursesCompletedCount = courseProgress ? courseProgress.filter(c => (c.completion_percentage || 0) >= 100).length : 0;
          const progress = Math.min(100, Math.round(((completed.length * 5) + (coursesCompletedCount * 10))));

          setUserStats({
            coursesCount: 8,
            testsCount: completed.length,
            averageScore: avg,
            globalProgress: progress,
          });

          setRecentActivities(examSessions.slice(0, 5));
        } else {
          // Premier accès ou 0 test réalisé : tout est à 0 / null sauf les 8 cours du catalogue
          setUserStats({
            coursesCount: 8,
            testsCount: 0,
            averageScore: 0,
            globalProgress: 0,
          });
          setRecentActivities([]);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données client Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement de votre espace candidat...</p>
        </div>
      </div>
    );
  }

  const coursesCount = userStats.coursesCount;
  const testsCount = userStats.testsCount;
  const averageScore = userStats.testsCount > 0 ? `${userStats.averageScore}%` : "0%";
  const globalProgress = userStats.globalProgress;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner de bienvenue */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#071d3a] via-[#09254a] to-[#041226] text-white p-6 md:p-8 overflow-hidden shadow-xl border border-blue-900/30">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            Bonjour {userName} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-blue-100/80 text-sm mt-2 leading-relaxed">
            Bienvenue sur votre espace TCF Canada Pro. Suivez vos cours et lancez vos entraînements pour enregistrer vos scores et suivre vos progrès.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link 
              href="/dashboard/courses"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Accéder aux cours</span>
            </Link>
            <Link 
              href="/dashboard/exams"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Target className="h-4 w-4" />
              <span>Lancer un test d'entraînement</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cartes d'indicateurs (Statistiques initialisées à 0 pour nouveau client, cours toujours accessibles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Carte 1: Cours disponibles (Catalogue toujours présent) */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cours disponibles</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{coursesCount}</p>
          </div>
        </div>

        {/* Carte 2: Tests effectués (0 par défaut) */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tests effectués</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{testsCount}</p>
          </div>
        </div>

        {/* Carte 3: Score moyen (0% par défaut) */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Score moyen</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{averageScore}</p>
          </div>
        </div>

        {/* Carte 4: Progression globale (0% par défaut) */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Progression globale</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{globalProgress}%</p>
          </div>
        </div>
      </div>

      {/* Section des cours et activités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Programme de cours */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Vos cours de préparation TCF Canada
            </h2>
            <Link href="/dashboard/courses" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 1, link: "/dashboard/courses/listening", title: "Compréhension Orale", desc: "40 exercices d'écoute et décodage sonore avec corrigés détaillés", level: "Tous niveaux" },
              { id: 2, link: "/dashboard/courses/reading", title: "Compréhension Écrite", desc: "Stratégies de lecture rapide et analyse de textes TCF", level: "Intermédiaire" },
              { id: 3, link: "/dashboard/courses/writing", title: "Expression Écrite", desc: "Rédaction des Tâches 1, 2 & 3 avec grille d'évaluation", level: "Avancé" },
              { id: 4, link: "/dashboard/courses/speaking", title: "Expression Orale", desc: "Mises en situation et entraînement à l'échange direct", level: "Intensif" }
            ].map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 inline-block mb-3">
                    {c.level}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{c.desc}</p>
                </div>
                <Link href={c.link} className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Accéder au cours <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne des activités récentes (Vide pour un nouveau client) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activités récentes</h2>
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-xs shadow-sm min-h-[220px] flex items-center justify-center">
            {recentActivities.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                  Aucune activité enregistrée. Réalisez votre 1er test pour enregistrer vos statistiques !
                </p>
                <Link href="/dashboard/exams" className="inline-block px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-500 transition-colors shadow-sm">
                  Lancer un test
                </Link>
              </div>
            ) : (
              <ul className="space-y-3 w-full">
                {recentActivities.map((act, i) => (
                  <li key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{act.exam_type}</p>
                      <p className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-blue-600">{act.score}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
