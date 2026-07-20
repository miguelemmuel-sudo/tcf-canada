"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Video, 
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";

export default function ReservationsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Toutes");
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Récupération stricte des réservations du client connecté (RLS: auth.uid() = user_id)
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .filter("metadata->>type", "eq", "reservation")
            .order("created_at", { ascending: false });

          if (!error && data) {
            setReservations(data);
          } else {
            setReservations([]);
          }
        }
      } catch (err) {
        console.error("Erreur chargement réservations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  const upcomingReservations = reservations.filter(r => r.metadata?.status === "upcoming");
  const completedReservations = reservations.filter(r => r.metadata?.status === "completed");
  const cancelledReservations = reservations.filter(r => r.metadata?.status === "cancelled");

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Espace candidat - Mes réservations</h1>
        <p className="text-slate-500 text-sm mt-1">Gérez vos séances de coaching et vos créneaux d'examens.</p>
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
              <div className="text-2xl font-black text-slate-900 dark:text-white">{reservations.length}</div>
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
              <div className="text-2xl font-black text-slate-900 dark:text-white">{upcomingReservations.length}</div>
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
              <div className="text-2xl font-black text-slate-900 dark:text-white">{completedReservations.length}</div>
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
              <div className="text-2xl font-black text-slate-900 dark:text-white">{cancelledReservations.length}</div>
              <div className="text-xs text-slate-500 font-medium">Annulées</div>
            </div>
          </div>
        </div>

      </div>

      {/* Mes prochaines réservations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mes prochaines réservations</h2>
        
        {upcomingReservations.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center text-slate-500 space-y-3">
            <CalendarIcon className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Aucune réservation enregistrée</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Vos réservations de coaching et d'examens s'afficheront ici lorsque vous réserverez un créneau.
            </p>
            <a
              href="https://wa.me/22653360101"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Réserver avec un coach sur WhatsApp
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReservations.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-center min-w-[70px]">
                    <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">
                      {new Date(item.created_at).getDate()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      {new Date(item.created_at).toLocaleString('fr-FR', { month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{item.message}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-8 text-xs font-medium text-slate-500">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4 text-slate-400" />
                    <span>En ligne</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-xs">
                    Confirmée
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
        
        {reservations.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Aucun historique de réservation disponible pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Intitulé</th>
                  <th className="pb-3">Détails</th>
                  <th className="pb-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {reservations.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-4 text-slate-900 dark:text-slate-200 font-bold">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-300 font-bold">{row.title}</td>
                    <td className="py-4 text-slate-500">{row.message}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        {row.metadata?.status || "Confirmée"}
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
