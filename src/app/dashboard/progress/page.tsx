"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Clock, Target, Calendar, ChevronUp } from "lucide-react";

const weekData = [40, 55, 65, 48, 72, 68, 75];
const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function ProgressPage() {
  const max = Math.max(...weekData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ma Progression</h1>
        <p className="text-muted-foreground mt-1">Suivez votre évolution et atteignez vos objectifs.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Score global estimé", value: "72%", icon: Target, trend: "+5%", up: true },
          { label: "Niveau CECRL estimé", value: "B2", icon: TrendingUp, trend: "+1 niv.", up: true },
          { label: "Temps cette semaine", value: "6h30", icon: Clock, trend: "+1h vs sem. précédente", up: true },
          { label: "Jours consécutifs", value: "5", icon: Calendar, trend: "Record : 12", up: false },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/50 bg-white dark:bg-slate-950">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-0.5 ${stat.up ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {stat.up && <ChevronUp className="h-3 w-3" />}
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart + Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50 bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Scores cette semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-40">
                {weekData.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">{val}%</span>
                    <motion.div
                      className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors"
                      initial={{ height: 0 }}
                      animate={{ height: `${(val / max) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                    />
                    <span className="text-xs text-muted-foreground">{days[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Objectives */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50 bg-white dark:bg-slate-950 h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Objectifs du mois
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { label: "Score oral > 70%", progress: 65, done: false },
                { label: "10 examens blancs", progress: 80, done: false },
                { label: "Score écrit > 80%", progress: 100, done: true },
                { label: "30h de pratique", progress: 45, done: false },
              ].map((obj, i) => (
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
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${obj.done ? "bg-emerald-500" : "bg-primary"}`}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                Modifier les objectifs
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
