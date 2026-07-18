"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, BookOpen, PenTool, Mic, Clock, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";

const exams = [
  {
    id: "listening",
    label: "Compréhension Orale",
    icon: Headphones,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-600",
    duration: "35 min",
    questions: 39,
    desc: "Écoutez des enregistrements et répondez aux questions sur leur contenu.",
    lastScore: "68%",
  },
  {
    id: "reading",
    label: "Compréhension Écrite",
    icon: BookOpen,
    color: "bg-violet-500",
    lightColor: "bg-violet-50 dark:bg-violet-950/30",
    textColor: "text-violet-600",
    duration: "60 min",
    questions: 39,
    desc: "Lisez des textes de nature diverse et répondez à des questions de compréhension.",
    lastScore: "75%",
  },
  {
    id: "writing",
    label: "Expression Écrite",
    icon: PenTool,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600",
    duration: "60 min",
    questions: 3,
    desc: "Rédigez des textes (courriel, article, lettre) sur des sujets variés.",
    lastScore: "70%",
  },
  {
    id: "speaking",
    label: "Expression Orale",
    icon: Mic,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600",
    duration: "12 min",
    questions: 3,
    desc: "Exprimez-vous à l'oral sur des tâches de la vie quotidienne et professionnelle.",
    lastScore: "65%",
  },
];

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Examens Blancs</h1>
          <p className="text-muted-foreground mt-1">Sélectionnez une épreuve pour commencer votre entraînement.</p>
        </div>
        <Button className="hidden md:flex">
          <PlayCircle className="h-4 w-4 mr-2" /> Examen Complet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/50 bg-white dark:bg-slate-950 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-xl ${exam.color} flex items-center justify-center`}>
                    <exam.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">{exam.lastScore} dernier score</Badge>
                </div>
                <CardTitle className="text-lg mt-3">{exam.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{exam.desc}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {exam.duration}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    {exam.questions} questions
                  </span>
                </div>
                <Button className="w-full group-hover:shadow-md transition-shadow" asChild>
                  <Link href={`/dashboard/exams/${exam.id}`}>
                    Commencer <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
