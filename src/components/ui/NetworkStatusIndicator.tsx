"use client";

import React, { useState, useEffect } from "react";
import { syncEngine, NetworkStatusType } from "@/utils/syncEngine";
import { offlineDb } from "@/utils/indexedDbManager";
import { Wifi, WifiOff, AlertTriangle, RefreshCw, CheckCircle2, Database, ShieldCheck, Zap, HardDrive, X } from "lucide-react";

export function NetworkStatusIndicator() {
  const [status, setStatus] = useState<NetworkStatusType>("online");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<{
    audiosCount: number;
    audiosSizeMB: string;
    syncQueueCount: number;
    coursesCachedCount: number;
    draftsCount: number;
  }>({
    audiosCount: 0,
    audiosSizeMB: "0.00",
    syncQueueCount: 0,
    coursesCachedCount: 0,
    draftsCount: 0,
  });
  const [showFinishedFlash, setShowFinishedFlash] = useState<boolean>(false);

  useEffect(() => {
    // Synchronisation de l'état réseau
    const unsubscribe = syncEngine.subscribe((newStatus, count) => {
      if (status === "syncing" && newStatus === "online" && count === 0) {
        setShowFinishedFlash(true);
        setTimeout(() => setShowFinishedFlash(false), 4000);
      }
      setStatus(newStatus);
      setPendingCount(count);
    });

    return () => unsubscribe();
  }, [status]);

  const handleOpenModal = async () => {
    try {
      const diag = await offlineDb.getStorageDiagnostics();
      setDiagnostics(diag);
    } catch (e) {
      console.warn("Erreur chargement diagnostic:", e);
    }
    setShowModal(true);
  };

  // Affichage du badge selon le statut
  const renderBadge = () => {
    if (showFinishedFlash) {
      return (
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-in fade-in zoom-in duration-300"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Synchronisé</span>
        </button>
      );
    }

    switch (status) {
      case "offline":
        return (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/30 text-xs font-bold animate-pulse"
            title="Hors connexion - Sauvegarde locale active"
          >
            <WifiOff className="h-3.5 w-3.5 text-red-500" />
            <span className="hidden sm:inline">Hors ligne</span>
            {pendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>
        );

      case "weak":
        return (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/30 text-xs font-bold"
            title="Connexion faible / instable - Mode Économie de Données actif"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
            <span className="hidden sm:inline">Débit faible</span>
            <Zap className="h-3 w-3 text-amber-500" />
          </button>
        );

      case "syncing":
        return (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/30 text-xs font-bold"
            title="Synchronisation vers le serveur Supabase..."
          >
            <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />
            <span className="hidden sm:inline">Sync ({pendingCount})</span>
          </button>
        );

      case "online":
      default:
        return (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-all"
            title="Connexion excellente - Zéro perte de données"
          >
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden md:inline">Connecté</span>
            {pendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>
        );
    }
  };

  return (
    <>
      {renderBadge()}

      {/* MODAL DE DIAGNOSTIC ET RÉSILIENCE HORS LIGNE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                  Centre de Résilience & Connectivité
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Optimisé pour l&apos;Afrique centrale & réseaux instables
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Wifi className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  État du réseau :
                </span>
                <span className="font-extrabold px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {status === "online" && "🟢 Excellent (4G/Wifi)"}
                  {status === "weak" && "🟡 Débit Faible / 3G"}
                  {status === "offline" && "🔴 Hors Connexion"}
                  {status === "syncing" && "🔄 Synchronisation..."}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                {status === "offline" || status === "weak"
                  ? "⚡ Le mode Économie et le stockage local IndexedDB ont pris le relais pour vous garantir 0 perte de données et 0 coupure d'étude."
                  : "🚀 Votre connexion permet la synchronisation en temps réel et le préchargement transparent de vos prochains cours."}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-500" />
                Stockage Local (IndexedDB Zéro Perte)
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-purple-500" /> Audios en cache
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{diagnostics.audiosCount}</span>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">
                      {diagnostics.audiosSizeMB} Mo
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5 text-amber-500" /> File d&apos;attente
                  </span>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{diagnostics.syncQueueCount}</span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                      {diagnostics.syncQueueCount === 0 ? "Prêt" : "En attente"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Cours / QCM hors ligne :</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{diagnostics.coursesCachedCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Brouillons sauvés :</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{diagnostics.draftsCount}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  syncEngine.forceSyncNow();
                  handleOpenModal();
                }}
                disabled={status === "syncing" || !navigator.onLine}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${status === "syncing" ? "animate-spin" : ""}`} />
                Forcer la synchronisation maintenant
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Fermer le diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
