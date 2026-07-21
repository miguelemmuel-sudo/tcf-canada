"use client";

import { RotateCcw, Play, History, RefreshCw } from "lucide-react";

interface ResumeSessionModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onResume: () => void;
  onRestart: () => void;
}

export function ResumeSessionModal({
  isOpen,
  title = "Test en cours détecté",
  message = "Vous avez déjà commencé ce test. Souhaitez-vous reprendre là où vous en étiez ?",
  onResume,
  onRestart
}: ResumeSessionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        
        {/* Soft Blue Icon Circle */}
        <div className="h-16 w-16 rounded-full bg-sky-100/70 dark:bg-sky-950/60 flex items-center justify-center mx-auto text-sky-600 dark:text-sky-400">
          <RotateCcw className="h-7 w-7 stroke-[2.2]" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Reprendre */}
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-white shrink-0" />
            <span>Reprendre</span>
          </button>

          {/* Recommencer */}
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>Recommencer</span>
          </button>
        </div>

      </div>
    </div>
  );
}
