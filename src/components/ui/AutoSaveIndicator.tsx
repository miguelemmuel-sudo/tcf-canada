'use client';

import React from 'react';
import { SaveStatus } from '@/lib/useAutoSave';
import { Cloud, CloudOff, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ status, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300 ${className}`}>
      {status === 'saving' && (
        <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          Sauvegarde en cours...
        </span>
      )}

      {status === 'saved' && (
        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Toutes les modifications sont enregistrées
        </span>
      )}

      {status === 'offline' && (
        <span className="flex items-center gap-1.5 text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2.5 py-1 rounded-full">
          <CloudOff className="w-3.5 h-3.5 text-sky-400" />
          Enregistré localement (Hors-ligne)
        </span>
      )}

      {status === 'error' && (
        <span className="flex items-center gap-1.5 text-rose-400 bg-rose-400/10 border border-rose-400/20 px-2.5 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          Erreur de sauvegarde
        </span>
      )}

      {status === 'idle' && (
        <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 border border-slate-700/50 px-2.5 py-1 rounded-full">
          <Cloud className="w-3.5 h-3.5 text-slate-400" />
          Synchro Supabase active
        </span>
      )}
    </div>
  );
};
