"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Video, 
  ChevronRight,
  Filter
} from "lucide-react";
import Link from "next/link";

const upcomingReservations = [
  {
    id: 1,
    day: "22",
    month: "JUIL.",
    type: "Séance de coaching",
    topic: "Compréhension écrite",
    coach: "Coach Marie L.",
    time: "10:00 - 11:00",
    platform: "En ligne (Google Meet)",
    status: "Confirmée",
    iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-950/50"
  },
  {
    id: 2,
    day: "25",
    month: "JUIL.",
    type: "Séance de coaching",
    topic: "Production orale",
    coach: "Coach Jean P.",
    time: "14:00 - 15:00",
    platform: "En ligne (Google Meet)",
    status: "Confirmée",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/50"
  },
  {
    id: 3,
    day: "29",
    month: "JUIL.",
    type: "Séance de coaching",
    topic: "Simulation complète",
    coach: "Coach Marie L.",
    time: "09:00 - 10:30",
    platform: "En ligne (Google Meet)",
    status: "Confirmée",
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/50"
  }
];

const historyReservations = [
  { date: "18 juillet 2026", type: "Séance de coaching", subject: "Compréhension orale", trainer: "Coach Marie L.", status: "Terminée", statusBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  { date: "14 juillet 2026", type: "Test TCF Canada", subject: "Test blanc complet #2", trainer: "—", status: "Terminée", statusBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  { date: "05 juillet 2026", type: "Séance de coaching", subject: "Production écrite", trainer: "Coach Jean P.", status: "Terminée", statusBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  { date: "01 juillet 2026", type: "Séance de coaching", subject: "Vocabulaire avancé", trainer: "Coach Marie L.", status: "Annulée", statusBg: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400" },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState("Toutes");
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const newFlag = localStorage.getItem("griffon_user_new");
    if (newFlag === "true") {
      setIsNewUser(true);
    }
  }, []);

  const totalCount = isNewUser ? 0 : 7;
  const upcomingCount = isNewUser ? 0 : 3;
  const completedCount = isNewUser ? 0 : 3;
  const cancelledCount = isNewUser ? 0 : 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Mes réservations</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos réservations de séances et de tests.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {["Toutes", "Séances de coaching", "Tests TCF Canada", "À venir", "Passées", "Annulées"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 shrink-0">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</div>
              <div className="text-xs text-slate-500 font-medium">Total réservations</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{upcomingCount}</div>
              <div className="text-xs text-slate-500 font-medium">À venir</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{completedCount}</div>
              <div className="text-xs text-slate-500 font-medium">Terminées</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500 shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{cancelledCount}</div>
              <div className="text-xs text-slate-500 font-medium">Annulée</div>
            </div>
          </div>
        </div>

      </div>

      {/* Mes prochaines réservations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mes prochaines réservations</h2>
        
        {isNewUser ? (
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center text-slate-500 space-y-3">
            <CalendarIcon className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Aucune réservation enregistrée</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Vos réservations de coaching et d'examens s'afficheront ici au fur et à mesure de votre progression.
            </p>
            <a
              href="https://wa.me/22653360101"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Réserver avec un coach
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReservations.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-center min-w-[70px]">
                    <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">{item.day}</span>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{item.month}</span>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.type}</h3>
                    <p className="text-xs text-slate-500 font-medium">{item.topic}</p>
                    <p className="text-xs text-slate-400 font-normal">{item.coach}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-8 text-xs font-medium text-slate-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-slate-400" />
                    <span>{item.platform}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-xs">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique des réservations Table */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Historique des réservations</h2>
        
        {isNewUser ? (
          <p className="text-xs text-slate-400 text-center py-6">Aucun historique disponible pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Sujet / Test</th>
                  <th className="pb-3">Formateur</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {historyReservations.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-4 text-slate-900 dark:text-slate-200 font-bold">{row.date}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{row.type}</td>
                    <td className="py-4 text-slate-900 dark:text-white font-bold">{row.subject}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">{row.trainer}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${row.statusBg}`}>
                        {row.status}
                      </span>
                    </td>
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
