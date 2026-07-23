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
import { ResumeSessionModal } from "@/components/ui/ResumeSessionModal";
import { UpsellBanner } from "@/components/ui/UpsellBanner";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";
import { findInterruptedSession, clearInterruptedSession, InterruptedSession, loadSessionsFromSupabase } from "@/utils/sessionManager";
import { loadCoursesProgressFromSupabase } from "@/utils/courseTracker";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Candidat");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    coursesCount: 8,
    testsCount: 0,
    averageScore: 0,
    globalProgress: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Interrupted session modal state
  const [interruptedSession, setInterruptedSession] = useState<InterruptedSession | null>(null);

  useEffect(() => {
    // Check for interrupted session upon reconnecting / returning to dashboard
    const activeSession = findInterruptedSession();
    if (activeSession) {
      setInterruptedSession(activeSession);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const loadUserData = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userErr } = await supabase.auth.getUser();
        const localEmail = typeof window !== "undefined" ? localStorage.getItem("griffon_user_email") : null;
        const localName = typeof window !== "undefined" ? localStorage.getItem("griffon_user_name") : null;

        if ((userErr || !user) && !localEmail) {
          console.warn("Utilisateur non connecté");
          router.push("/login");
          return;
        }

        const effectiveEmail = user?.email || localEmail || "";
        const effectiveId = user?.id || `local_user_${effectiveEmail}`;
        setUserEmail(effectiveEmail);
        setUserId(effectiveId);
        
        // Charger les sessions et la progression des cours depuis Supabase vers le localStorage
        if (user?.id) {
          await loadSessionsFromSupabase(user.id);
          await loadCoursesProgressFromSupabase(user.id);
        }
        
        // Re-vérifier s'il y a une session (au cas où elle vient d'être chargée)
        const activeSession = findInterruptedSession();
        if (activeSession) {
          setInterruptedSession(activeSession);
        }
        
        if (user?.id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile && (profile.first_name || profile.last_name)) {
            const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            setUserName(name);
          } else {
            const fallbackName = user.email ? user.email.split("@")[0] : (localName || "Candidat");
            setUserName(fallbackName);
          }
        } else {
          setUserName(localName || (effectiveEmail ? effectiveEmail.split("@")[0] : "Candidat"));
        }

        const { data: examSessions } = user?.id ? await supabase
          .from("exam_sessions")
          .select("*")
          .eq("user_id", effectiveId)
          .order("created_at", { ascending: false }) : { data: null };

        const { data: courseProgress } = user?.id ? await supabase
          .from("course_progress")
          .select("*")
          .eq("user_id", effectiveId) : { data: null };

        if (examSessions && examSessions.length > 0) {
          const completed = examSessions.filter(e => e.status === "completed");
          const totalScore = completed.reduce((acc, curr) => acc + (curr.score || 0), 0);
          const avg = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
          
          const coursesCompletedCount = courseProgress ? courseProgress.filter(c => (c.completion_percentage || 0) >= 100).length : 0;
          const progress = Math.min(100, Math.round(((completed.length * 5) + (coursesCompletedCount * 10))));
          
          const pack = getCurrentUserPack();

          setUserStats({
            coursesCount: PACK_CONFIGS[pack].coursesCount,
            testsCount: PACK_CONFIGS[pack].testsCount,
            averageScore: avg,
            globalProgress: progress,
          });

          setRecentActivities(examSessions.slice(0, 5));
        } else {
          const pack = getCurrentUserPack();
          setUserStats({
            coursesCount: PACK_CONFIGS[pack].coursesCount,
            testsCount: PACK_CONFIGS[pack].testsCount,
            averageScore: 0,
            globalProgress: 0,
          });
        }
      } catch (err) {
        console.error("Erreur chargement données profil:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleResumeSession = () => {
    if (interruptedSession) {
      router.push(interruptedSession.path);
    }
    setInterruptedSession(null);
  };

  const handleRestartSession = () => {
    if (interruptedSession) {
      clearInterruptedSession(interruptedSession.key);
    }
    setInterruptedSession(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Global Interrupted Session Popup Modal */}
      <ResumeSessionModal
        isOpen={Boolean(interruptedSession)}
        title={interruptedSession?.type === "test" ? "Test en cours détecté" : "Leçon en cours détectée"}
        message={
          interruptedSession
            ? `Vous avez une session en cours (${interruptedSession.title}). Souhaitez-vous reprendre là où vous en étiez ?`
            : "Vous avez déjà commencé ce test. Souhaitez-vous reprendre là où vous en étiez ?"
        }
        onResume={handleResumeSession}
        onRestart={handleRestartSession}
      />

      {/* Upsell Banner (Adapts automatically to current pack) */}
      <UpsellBanner />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0e2238] via-slate-900 to-amber-950/80 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Crown className="h-3.5 w-3.5" />
            <span>Membre TCF Canada Pro</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Bonjour, {userName} <span className="inline-block animate-bounce">🇨🇦</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Préparez et réussissez votre épreuve TCF Canada avec nos cours pratiques, nos simulations réelles et notre accompagnement d'experts.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/dashboard/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Passer un test d'évaluation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20"
            >
              <span>Explorer les cours</span>
            </Link>
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <img src="/griffon_logo.png" alt="Griffon Logo" className="w-96 h-96 object-contain" />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{userStats.coursesCount}</div>
            <div className="text-xs font-bold text-slate-500">Programmes de cours</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{userStats.testsCount}</div>
            <div className="text-xs font-bold text-slate-500">Tests d'examens inclus</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{userStats.averageScore}%</div>
            <div className="text-xs font-bold text-slate-500">Moyenne générale TCF</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{userStats.globalProgress}%</div>
            <div className="text-xs font-bold text-slate-500">Progression globale</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Recommended Modules & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recommended Course Modules */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Épreuves TCF Canada</h2>
            <Link href="/dashboard/courses" className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              <span>Voir tout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 font-extrabold text-[10px] uppercase">
                  Compréhension Orale
                </span>
                <span className="text-xs font-bold text-slate-400">39 questions</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Épreuve d'écoute TCF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Entraînez-vous avec des enregistrements audio réels.</p>
              <Link href="/dashboard/courses/listening" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:underline pt-1">
                <span>Commencer le module</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-extrabold text-[10px] uppercase">
                  Compréhension Écrite
                </span>
                <span className="text-xs font-bold text-slate-400">39 questions</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Épreuve de lecture TCF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Analysez des textes de difficulté progressive.</p>
              <Link href="/dashboard/courses/reading" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:underline pt-1">
                <span>Commencer le module</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 font-extrabold text-[10px] uppercase">
                  Production Écrite
                </span>
                <span className="text-xs font-bold text-slate-400">3 tâches</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Épreuve de rédaction TCF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Rédigez des courriels, lettres et essais corrigés par l'IA.</p>
              <Link href="/dashboard/courses/writing" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:underline pt-1">
                <span>Commencer le module</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 font-extrabold text-[10px] uppercase">
                  Production Orale
                </span>
                <span className="text-xs font-bold text-slate-400">3 tâches</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Épreuve d'expression orale TCF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Simulez des entretiens oraux avec enregistrement et correction.</p>
              <Link href="/dashboard/courses/speaking" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-600 hover:underline pt-1">
                <span>Commencer le module</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </div>

        {/* Right: Recent Activities */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Activités récentes</h2>

          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <Calendar className="h-8 w-8 mx-auto opacity-50" />
                <p className="text-xs font-medium">Aucune activité récente.</p>
                <p className="text-[11px] text-slate-400">Vos révisions et résultats d'examens s'afficheront ici.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{act.exam_type || "Examen TCF"}</h4>
                      <p className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                      {act.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
