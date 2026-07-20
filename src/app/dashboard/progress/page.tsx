"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Clock, Target, Calendar, ChevronUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [userProgressData, setUserProgressData] = useState({
    estimatedScore: 0,
    cefrLevel: "-",
    weeklyHours: "0h00",
    streakDays: 0,
    weekData: [0, 0, 0, 0, 0, 0, 0],
    objectives: [
      { label: "Compléter un 1er examen blanc", progress: 0, done: false },
      { label: "Score oral > 70%", progress: 0, done: false },
      { label: "Score écrit > 70%", progress: 0, done: false },
      { label: "Accéder à tous les cours", progress: 100, done: true },
    ]
  });

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Récupération des examens de l'utilisateur connecté (RLS: auth.uid() = user_id)
          const { data: examSessions } = await supabase
            .from("exam_sessions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          // Récupération de la progression des cours
          const { data: courseProgress } = await supabase
            .from("course_progress")
            .select("*")
            .eq("user_id", user.id);

          if (examSessions && examSessions.length > 0) {
            const completed = examSessions.filter(e => e.status === "completed" || e.score !== null);
            if (completed.length > 0) {
              const totalScore = completed.reduce((acc, curr) => acc + (curr.score || 0), 0);
              const avg = Math.round(totalScore / completed.length);
              
              const level = avg >= 85 ? "C1" : avg >= 75 ? "B2+" : avg >= 60 ? "B2" : avg >= 40 ? "B1" : "A2";
              
              // Déterminer les scores des derniers 7 jours si possible
              const scores = completed.slice(0, 7).map(e => e.score || 0);
              while (scores.length < 7) scores.push(0);

              setUserProgressData({
                estimatedScore: avg,
                cefrLevel: level,
                weeklyHours: `${completed.length * 1}h30`,
                streakDays: Math.min(7, completed.length),
                weekData: scores,
                objectives: [
                  { label: "Compléter un 1er examen blanc", progress: 100, done: true },
                  { label: "Score oral > 70%", progress: Math.min(100, avg), done: avg >= 70 },
                  { label: "Score écrit > 70%", progress: Math.min(100, avg), done: avg >= 70 },
                  { label: "Accéder à tous les cours", progress: 100, done: true },
                ]
              });
            }
          } else {
            // NOUVEAU CLIENT : tout à 0 / null
            setUserProgressData({
              estimatedScore: 0,
              cefrLevel: "-",
              weeklyHours: "0h00",
              streakDays: 0,
              weekData: [0, 0, 0, 0, 0, 0, 0],
              objectives: [
                { label: "Compléter un 1er examen blanc", progress: 0, done: false },
                { label: "Score oral > 70%", progress: 0, done: false },
                { label: "Score écrit > 70%", progress: 0, done: false },
                { label: "Accéder à tous les cours", progress: 100, done: true },
              ]
            });
          }
        }
      } catch (err) {
        console.error("Erreur chargement progression:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...userProgressData.weekData, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ma Progression</h1>
        <p className="text-muted-foreground mt-1">Suivez votre évolution réelle et atteignez vos objectifs TCF Canada.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Score global estimé", value: userProgressData.estimatedScore > 0 ? `${userProgressData.estimatedScore}%` : "0%", icon: Target, trend: "Basé sur vos tests", up: true },
          { label: "Niveau CECRL estimé", value: userProgressData.cefrLevel, icon: TrendingUp, trend: "Évaluation continue", up: true },
          { label: "Temps estimé de pratique", value: userProgressData.weeklyHours, icon: Clock, trend: "Cette semaine", up: true },
          { label: "Jours consécutifs", value: `${userProgressData.streakDays}`, icon: Calendar, trend: "Série en cours", up: false },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-white dark:bg-slate-950">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs mt-1 text-slate-400">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Graphiques + Objectifs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des activités */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Évolution des scores d'entraînement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-40 pt-4">
                {userProgressData.weekData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">{val > 0 ? `${val}%` : '-'}</span>
                    <motion.div
                      className="w-full rounded-t-md bg-blue-600/80 hover:bg-blue-600 transition-colors min-h-[4px]"
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / maxVal) * 100}%` }}
                      transition={{ delay: 0.2 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                    />
                    <span className="text-xs text-muted-foreground">{days[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Objectifs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Objectifs de préparation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {userProgressData.objectives.map((obj, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${obj.done ? "line-through text-muted-foreground" : ""}`}>{obj.label}</span>
                    {obj.done
                      ? <Badge className="text-xs py-0 bg-emerald-100 text-emerald-700 border-none">✓ Atteint</Badge>
                      : <span className="text-muted-foreground text-xs">{obj.progress}%</span>
                    }
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${obj.progress}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${obj.done ? "bg-emerald-500" : "bg-blue-600"}`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
