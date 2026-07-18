"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  FileText,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  ChevronRight,
  Flame,
  Award,
} from "lucide-react";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
};

const stats = [
  { label: "Score moyen", value: "72%", icon: Target, color: "text-primary", bg: "bg-red-50 dark:bg-red-950/30" },
  { label: "Examens réalisés", value: "18", icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Temps de travail", value: "42h", icon: Clock, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { label: "Série actuelle", value: "5 jours 🔥", icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
];

const modules = [
  { label: "Compréhension Orale", icon: Headphones, score: 68, href: "/dashboard/exams/listening", color: "bg-blue-500" },
  { label: "Compréhension Écrite", icon: BookOpen, score: 75, href: "/dashboard/exams/reading", color: "bg-violet-500" },
  { label: "Expression Écrite", icon: PenTool, score: 70, href: "/dashboard/exams/writing", color: "bg-amber-500" },
  { label: "Expression Orale", icon: Mic, score: 65, href: "/dashboard/exams/speaking", color: "bg-emerald-500" },
];

const recentActivity = [
  { label: "Examen blanc complet", score: "78%", date: "Il y a 2h", badge: "Réussi" },
  { label: "Quiz Compréhension Orale", score: "65%", date: "Hier", badge: "À améliorer" },
  { label: "Expression Écrite - Tâche 2", score: "B2", date: "Il y a 2 jours", badge: "IA corrigé" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonjour, Miguel ! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Votre prochain objectif : atteindre le niveau <strong>B2+</strong> en 30 jours.
          </p>
        </div>
        <Button asChild className="hidden md:flex">
          <Link href="/dashboard/exams">
            Démarrer un examen <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="border-border/50 bg-white dark:bg-slate-950 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress by module + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score par épreuve */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-white dark:bg-slate-950 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Scores par épreuve
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((mod) => (
                <Link href={mod.href} key={mod.label} className="block group">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${mod.color} flex items-center justify-center flex-shrink-0`}>
                      <mod.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">{mod.label}</p>
                        <span className="text-sm font-bold">{mod.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${mod.score}%` }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                          className={`h-full rounded-full ${mod.color}`}
                        />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activité récente */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeIn}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{act.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{act.date}</span>
                      <Badge variant="outline" className="text-xs py-0">{act.badge}</Badge>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">{act.score}</span>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                <Link href="/dashboard/history">Voir tout l'historique</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={fadeIn}>
        <h2 className="text-base font-semibold mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href}>
              <Card className="border-border/50 bg-white dark:bg-slate-950 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className={`h-12 w-12 rounded-xl ${mod.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <mod.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium leading-tight">{mod.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
