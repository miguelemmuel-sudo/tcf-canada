'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from './supabaseClient';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface AutoSaveOptions<T> {
  tableName: string;
  matchKey: string;
  matchValue?: string | number;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export function useAutoSave<T extends Record<string, any>>(
  initialData: T,
  options: AutoSaveOptions<T>
) {
  const { tableName, matchKey, matchValue, debounceMs = 1500 } = options;
  const [data, setData] = useState<T>(initialData);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // Écoute de l'état réseau (Online / Offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Tenter de synchroniser les données hors ligne sauvegardées
      const pendingData = localStorage.getItem(`pending_save_${tableName}_${matchValue}`);
      if (pendingData) {
        try {
          const parsed = JSON.parse(pendingData);
          saveToSupabase(parsed);
          localStorage.removeItem(`pending_save_${tableName}_${matchValue}`);
        } catch (e) {
          console.error("Erreur de synchro offline:", e);
        }
      }
    };
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tableName, matchValue]);

  // Fonction de sauvegarde réelle dans Supabase avec fallback
  const saveToSupabase = useCallback(
    async (payload: T) => {
      if (!matchValue) return;

      if (!navigator.onLine) {
        setStatus('offline');
        localStorage.setItem(`pending_save_${tableName}_${matchValue}`, JSON.stringify(payload));
        return;
      }

      setStatus('saving');

      try {
        const { error } = await supabase
          .from(tableName)
          .upsert({ ...payload, [matchKey]: matchValue, updated_at: new Date().toISOString() } as any);

        if (error) throw error;

        setStatus('saved');
        options.onSaveSuccess?.();
      } catch (err) {
        console.error(`[AutoSave Error - ${tableName}]`, err);
        setStatus('error');
        options.onSaveError?.(err);
      }
    },
    [tableName, matchKey, matchValue, options, supabase]
  );

  // Effet de debounce lors du changement de `data`
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus('saving');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveToSupabase(data);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, debounceMs, saveToSupabase]);

  // Supabase Realtime Subscription pour la synchronisation multi-appareils
  useEffect(() => {
    if (!matchValue) return;

    const channel = supabase
      .channel(`realtime_${tableName}_${matchValue}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: tableName,
          filter: `${matchKey}=eq.${matchValue}`,
        },
        (payload) => {
          if (payload.new) {
            setData((prev) => ({ ...prev, ...payload.new }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, matchKey, matchValue, supabase]);

  return {
    data,
    setData,
    status,
    isOnline,
    forceSave: () => saveToSupabase(data),
  };
}
