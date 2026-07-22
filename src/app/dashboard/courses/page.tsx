"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, CheckCircle2, Clock, ChevronRight, PlayCircle, Lock,
  Volume2, PenTool, Mic, Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { getSummaryCourseStats, getStoredCoursesData } from "@/utils/courseTracker";
import { getCurrentUserPack, PACK_CONFIGS } from "@/utils/subscriptionEngine";
import { generateLessonsForPack } from "@/utils/courseGenerator";
import { getModulesForPack } from "@/utils/curriculumEngine";

const courseCategories = [
  { name: "Tous les cours", href: "/dashboard/courses" },
  { name: "Compréhension orale", href: "/dashboard/courses/listening" },
  { name: "Compréhension écrite", href: "/dashboard/courses/reading" },
  { name: "Production écrite", href: "/dashboard/courses/writing" },
  { name: "Production orale", href: "/dashboard/courses/speaking" }
];

const defaultCoursesList = [
  {
    id: "co",
    code: "CO",
    title: "Compréhension orale",
    desc: "Apprenez à comprendre des conversations et des documents audio similaires à l'examen TCF Canada.",
    progress: 0,
    lessons: "0 / 8 leçons",
    bgColor: "bg-blue-600",
    icon: Volume2,
    href: "/dashboard/courses/listening",
    color: "blue",
    lessons_list: [
      { id: 1, title: "Introduction à la CO TCF", duration: "12 min", done: false },
      { id: 2, title: "Conversations courtes — niveau A2", duration: "15 min", done: false },
      { id: 3, title: "Conversations longues — niveau B1", duration: "18 min", done: false },
      { id: 4, title: "Annonces et messages", duration: "14 min", done: false },
      { id: 5, title: "Débats et discussions", duration: "20 min", done: false },
      { id: 6, title: "Écoute sélective avancée", duration: "22 min", done: false },
      { id: 7, title: "Simulation — Compréhension orale B2", duration: "25 min", done: false },
      { id: 8, title: "Test final CO", duration: "30 min", done: false },
    ]
  },
  {
    id: "ce",
    code: "CE",
    title: "Compréhension écrite",
    desc: "Développez vos compétences de lecture et comprenez des textes variés en français.",
    progress: 0,
    lessons: "0 / 10 leçons",
    bgColor: "bg-emerald-600",
    icon: BookOpen,
    href: "/dashboard/courses/reading",
    color: "emerald",
    lessons_list: [
      { id: 1, title: "Stratégies de lecture rapide", duration: "10 min", done: false },
      { id: 2, title: "Comprendre les articles de presse", duration: "15 min", done: false },
      { id: 3, title: "Textes administratifs et formulaires", duration: "12 min", done: false },
      { id: 4, title: "Textes littéraires", duration: "18 min", done: false },
      { id: 5, title: "Inférences et implicite", duration: "20 min", done: false },
      { id: 6, title: "Vocabulaire en contexte", duration: "16 min", done: false },
      { id: 7, title: "Textes scientifiques et techniques", duration: "22 min", done: false },
      { id: 8, title: "Lecture et résumé", duration: "20 min", done: false },
      { id: 9, title: "Simulation — CE niveau B2", duration: "35 min", done: false },
      { id: 10, title: "Test final CE", duration: "40 min", done: false },
    ]
  },
  {
    id: "pe",
    code: "PE",
    title: "Production écrite",
    desc: "Apprenez à rédiger des textes clairs et structurés selon les critères du TCF Canada.",
    progress: 0,
    lessons: "0 / 10 leçons",
    bgColor: "bg-amber-500",
    icon: PenTool,
    href: "/dashboard/courses/writing",
    color: "amber",
    lessons_list: [
      { id: 1, title: "Structure d'un courriel formel", duration: "12 min", done: false },
      { id: 2, title: "Rédaction d'une lettre officielle", duration: "15 min", done: false },
      { id: 3, title: "Argumentation et cohérence", duration: "18 min", done: false },
      { id: 4, title: "Connecteurs logiques", duration: "10 min", done: false },
      { id: 5, title: "Essai argumentatif — B1", duration: "25 min", done: false },
      { id: 6, title: "Synthèse de documents", duration: "22 min", done: false },
      { id: 7, title: "Vocabulaire de l'argumentation", duration: "14 min", done: false },
      { id: 8, title: "Révision et correction", duration: "20 min", done: false },
      { id: 9, title: "Simulation PE — niveau B2", duration: "40 min", done: false },
      { id: 10, title: "Test final PE", duration: "45 min", done: false },
    ]
  },
  {
    id: "po",
    code: "PO",
    title: "Production orale",
    desc: "Entraînez-vous à parler en français sur des sujets variés et améliorez votre aisance.",
    progress: 0,
    lessons: "0 / 10 leçons",
    bgColor: "bg-purple-600",
    icon: Mic,
    href: "/dashboard/courses/speaking",
    color: "purple",
    lessons_list: [
      { id: 1, title: "Techniques de prise de parole", duration: "12 min", done: false },
      { id: 2, title: "Monologue guidé — Présentation personnelle", duration: "15 min", done: false },
      { id: 3, title: "Interaction simulée — Niveau A2/B1", duration: "20 min", done: false },
      { id: 4, title: "Exprimer son opinion", duration: "18 min", done: false },
      { id: 5, title: "Débat : pour et contre", duration: "22 min", done: false },
      { id: 6, title: "Vocabulaire oral et hésitations", duration: "15 min", done: false },
      { id: 7, title: "Prononciation avancée", duration: "18 min", done: false },
      { id: 8, title: "Simulation orale — Niveau B2", duration: "30 min", done: false },
      { id: 9, title: "Point de vue argumenté", duration: "25 min", done: false },
      { id: 10, title: "Test final PO", duration: "35 min", done: false },
    ]
  }
];

const colorMap: Record<string, { bg: string; light: string; text: string; bar: string; ring: string }> = {
  blue:    { bg: "bg-blue-600",    light: "bg-blue-50 dark:bg-blue-950/30",    text: "text-blue-600",    bar: "bg-blue-600",    ring: "ring-blue-300" },
  emerald: { bg: "bg-emerald-600", light: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600", bar: "bg-emerald-600", ring: "ring-emerald-300" },
  amber:   { bg: "bg-amber-500",   light: "bg-amber-50 dark:bg-amber-950/30",   text: "text-amber-600",   bar: "bg-amber-500",   ring: "ring-amber-300" },
  purple:  { bg: "bg-purple-600",  light: "bg-purple-50 dark:bg-purple-950/30",  text: "text-purple-600",  bar: "bg-purple-600",  ring: "ring-purple-300" },
};

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tous les cours");
  const userPack = getCurrentUserPack();
  const maxCourses = PACK_CONFIGS[userPack].coursesCount;
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>(defaultCoursesList);
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    lessonsCompleted: 0,
    totalTimeFormatted: "0h00",
  });

  const refreshCourseData = () => {
    const trackerStats = getSummaryCourseStats();
    const storedCourses = getStoredCoursesData();

    const updatedCourses = defaultCoursesList.map((c: any) => {
      const courseData = storedCourses[c.id];
      // On génère la vraie liste dynamique selon le pack
      let courseType: "listening" | "reading" | "writing" | "speaking" = "listening";
      if (c.id === "ce") courseType = "reading";
      if (c.id === "pe") courseType = "writing";
      if (c.id === "po") courseType = "speaking";
      
      const dynamicLessons = generateLessonsForPack([], userPack, PACK_CONFIGS[userPack], courseType);

      if (courseData) {
        const completedIds = new Set(courseData.completedLessons || []);
        const doneCount = completedIds.size;
        const totalCount = dynamicLessons.length;
        const percentage = Math.min(100, Math.round((doneCount / totalCount) * 100));

        const updatedLessonsList = dynamicLessons.map((l: any) => ({
          ...l,
          done: completedIds.has(l.id) || completedIds.has(l.id.toString()),
        }));

        return {
          ...c,
          progress: percentage,
          lessons: `${doneCount} / ${totalCount} leçons`,
          lessons_list: updatedLessonsList,
        };
      }
      return {
        ...c,
        lessons: `0 / ${dynamicLessons.length} leçons`,
        lessons_list: dynamicLessons.map((l: any) => ({ ...l, done: false })),
      };
    });

    setCourses(updatedCourses);

    setStats({
      coursesInProgress: trackerStats.coursesInProgress,
      lessonsCompleted: trackerStats.lessonsCompleted,
      totalTimeFormatted: trackerStats.totalTimeFormatted,
    });
  };

  useEffect(() => {
    refreshCourseData();
    setLoading(false);

    // Event Listeners for real-time updates
    const handleUpdate = () => refreshCourseData();
    window.addEventListener("storage_course_progress_updated", handleUpdate);
    window.addEventListener("storage_learning_time_updated", handleUpdate);

    return () => {
      window.removeEventListener("storage_course_progress_updated", handleUpdate);
      window.removeEventListener("storage_learning_time_updated", handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement du catalogue de cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes cours</h1>
        <p className="text-slate-500 text-sm mt-1">Accédez à votre programme de préparation TCF Canada.</p>
      </div>

      {/* Direct Navigation Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap gap-2">
          {courseCategories.map((cat) => (
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
      </div>

      {/* KPI Cards (Dynamic real-time values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{maxCourses}</div>
            <div className="text-xs text-slate-500 font-medium">{getModulesForPack(userPack).length} modules accessibles</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.coursesInProgress}</div>
            <div className="text-xs text-slate-500 font-medium">Cours en cours</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.lessonsCompleted}</div>
            <div className="text-xs text-slate-500 font-medium">Leçons complétées</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalTimeFormatted}</div>
            <div className="text-xs text-slate-500 font-medium">Temps d'apprentissage</div>
          </div>
        </div>
      </div>

      {/* Courses Cards List */}
      <div className="space-y-4">
        {courses.map((course) => {
          const c = colorMap[course.color];
          const isOpen = expandedCourse === course.id;
          return (
            <div key={course.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Course Header Row */}
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start space-x-5 flex-1">
                  <div className={`h-20 w-20 rounded-2xl ${c.bg} font-black text-2xl flex items-center justify-center shrink-0 shadow-md text-white`}>
                    {course.code}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{course.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{course.desc}</p>
                    <div className="pt-1 max-w-md">
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Progression : {course.progress}%</span>
                        <span>{course.lessons}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.bar} transition-all duration-500`} style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 w-full md:w-auto shrink-0">
                  <Link href={course.href} className={`w-full sm:w-auto px-6 py-2.5 rounded-xl ${c.bg} hover:opacity-90 text-white font-bold text-xs shadow-md transition-all text-center`}>
                    Accéder au cours
                  </Link>
                  <button
                    onClick={() => setExpandedCourse(isOpen ? null : course.id)}
                    className={`w-full sm:w-auto text-xs font-bold ${c.text} hover:underline py-1 flex items-center gap-1 justify-center`}
                  >
                    {isOpen ? "Masquer les leçons" : "Voir les leçons"}
                    <ChevronRight className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Expandable Lessons List */}
              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 pb-4">
                  <div className="py-4 space-y-2">
                    {course.lessons_list.map((lesson: any, idx: number) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        lesson.done 
                          ? "bg-slate-50 dark:bg-slate-900/80" 
                          : "bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800"
                      }`}>
                        <div className="flex items-center gap-3">
                          {lesson.done 
                            ? <CheckCircle2 className={`h-5 w-5 shrink-0 ${c.text}`} />
                            : <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0 flex items-center justify-center">
                                <Lock className="h-2.5 w-2.5 text-slate-400" />
                              </div>
                          }
                          <span className={`text-sm font-semibold ${lesson.done ? "text-slate-600 dark:text-slate-300" : "text-slate-800 dark:text-slate-200"}`}>
                            {idx + 1}. {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {lesson.duration}
                          </span>
                          <Link href={course.href} className={`text-xs font-bold ${c.text} hover:underline`}>
                            {lesson.done ? "Revoir" : "Commencer"}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
