"use client";

import { useState, useEffect } from "react";
import { 
  FileCheck2, 
  TrendingUp, 
  Award, 
  Star, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  FileText,
  Loader2,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    testsCount: 0,
    averageScore: 0,
    rankText: "Non classé",
    level: "-",
    listeningAvg: 0,
    readingAvg: 0,
    writingAvg: 0,
    speakingAvg: 0,
  });

  useEffect(() => {
    const loadResultsFromSupabase = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Récupération stricte des sessions d'examens pour l'utilisateur connecté (RLS: user_id = auth.uid())
          const { data: sessions, error } = await supabase
            .from("exam_sessions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && sessions && sessions.length > 0) {
            setExamResults(sessions);
            const completed = sessions.filter((s: any) => s.status === "completed" || s.score !== null);
            
            if (completed.length > 0) {
              const totalScore = completed.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0);
              const avg = Math.round(totalScore / completed.length);

              // Calcul par épreuve
              const listening = completed.filter((s: any) => s.exam_type === 'listening');
              const reading = completed.filter((s: any) => s.exam_type === 'reading');
              const writing = completed.filter((s: any) => s.exam_type === 'writing');
              const speaking = completed.filter((s: any) => s.exam_type === 'speaking');

              const getAvg = (list: any[]) => list.length > 0 ? Math.round(list.reduce((a, c) => a + (c.score || 0), 0) / list.length) : avg;

              setUserStats({
                testsCount: completed.length,
                averageScore: avg,
                rankText: avg >= 80 ? "Top 15%" : avg >= 70 ? "Top 25%" : avg >= 50 ? "Top 40%" : "En progression",
                level: avg >= 85 ? "C1" : avg >= 75 ? "B2+" : avg >= 60 ? "B2" : avg >= 40 ? "B1" : "A2",
                listeningAvg: getAvg(listening),
                readingAvg: getAvg(reading),
                writingAvg: getAvg(writing),
                speakingAvg: getAvg(speaking),
              });
            }
          } else {
            // Utilisateur sans aucun test : tout à 0 / null
            setExamResults([]);
            setUserStats({
              testsCount: 0,
              averageScore: 0,
              rankText: "Non classé",
              level: "-",
              listeningAvg: 0,
              readingAvg: 0,
              writingAvg: 0,
              speakingAvg: 0,
            });
          }
        }
      } catch (err) {
        console.error("Erreur chargement résultats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadResultsFromSupabase();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement de vos résultats réels...</p>
        </div>
      </div>
    );
  }

  const hasData = examResults.length > 0 && userStats.testsCount > 0;
  const lastResult = hasData ? examResults[0] : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mes résultats</h1>
          <p className="text-slate-500 text-sm mt-1">Suivez vos performances réelles et découvrez votre évolution.</p>
        </div>
      </div>

      {/* 4 Cartes d'indicateurs métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{userStats.testsCount}</div>
              <div className="text-xs text-slate-500 font-medium">Tests réalisés</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {hasData ? `${userStats.averageScore}%` : "0%"}
              </div>
              <div className="text-xs text-slate-500 font-medium">Score moyen global</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{userStats.rankText}</div>
              <div className="text-xs text-slate-500 font-medium">Classement</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500 shrink-0">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Niveau actuel</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{userStats.level}</div>
              <div className="text-[10px] text-slate-400">Niveau TCF Canada</div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid Principal: Dernier résultat & Évolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dernier résultat */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dernier résultat</h2>
          </div>

          {!hasData ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <FileCheck2 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Aucun résultat enregistré</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Lancez votre premier test blanc d'entraînement pour obtenir votre premier bilan de compétences.
              </p>
              <Link
                href="/dashboard/exams"
                className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Passer un test d'entraînement
              </Link>
            </div>
          ) : (
            <>
              <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">{lastResult?.exam_type || "Test TCF"}</h3>
                    <p className="text-xs text-slate-500">Session d'entraînement officielle</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                      <span>📅 {new Date(lastResult?.created_at).toLocaleDateString()}</span>
                      <span>📊 Score : {lastResult?.score || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-600 block">{lastResult?.score || 0}%</span>
                  <span className="text-[11px] font-bold text-slate-500 block">Score obtenu</span>
                </div>
              </div>

              {/* Compétences détaillées */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Moyenne par épreuve</h3>

                <div className="space-y-3 text-xs font-bold">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Headphones className="h-4 w-4 text-blue-600" /> Compréhension orale</span>
                      <span className="text-slate-900 dark:text-white">{userStats.listeningAvg}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${userStats.listeningAvg}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><BookOpen className="h-4 w-4 text-emerald-600" /> Compréhension écrite</span>
                      <span className="text-slate-900 dark:text-white">{userStats.readingAvg}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${userStats.readingAvg}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><PenTool className="h-4 w-4 text-amber-500" /> Production écrite</span>
                      <span className="text-slate-900 dark:text-white">{userStats.writingAvg}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${userStats.writingAvg}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Mic className="h-4 w-4 text-purple-600" /> Production orale</span>
                      <span className="text-slate-900 dark:text-white">{userStats.speakingAvg}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${userStats.speakingAvg}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Évolution des scores */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Évolution des scores</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-extrabold text-[11px]">
                {examResults.length} test(s) enregistré(s)
              </span>
            </div>

            {!hasData ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <p>Aucun graphique disponible pour le moment.</p>
                <p className="text-[11px] text-slate-400">Vos progressions graphiques apparaîtront au fur et à mesure de vos examens.</p>
              </div>
            ) : (
              <div className="h-40 flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-blue-600">
                {examResults.slice(0, 5).reverse().map((res, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span>{res.score || 0}%</span>
                    <div 
                      className="w-3 bg-blue-600 rounded-t-full transition-all"
                      style={{ height: `${Math.max(10, (res.score || 0) * 1.2)}px` }}
                    />
                    <span className="text-slate-400 font-normal">Test #{i+1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Historique des résultats Table */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historique complet des résultats</h2>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs">
            {examResults.length} résultat(s)
          </span>
        </div>

        {!hasData ? (
          <p className="text-xs text-slate-400 text-center py-6">Aucun historique de résultat enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3">Type d'examen</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Statut</th>
                  <th className="pb-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {examResults.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-4 text-slate-900 dark:text-white font-bold uppercase">{row.exam_type}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="py-4 font-bold text-slate-600 dark:text-slate-300">{row.status}</td>
                    <td className="py-4 font-black text-emerald-600">{row.score !== null ? `${row.score}%` : 'En cours'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
