/**
 * Optimiseur de requêtes Supabase & Cache en mémoire (Supabase Optimizer)
 * Réduit les échanges réseau au strict minimum, applique la sélection précise de colonnes
 * (pas de SELECT * inutile) et intègre une pagination / mise en cache pour l'Afrique centrale.
 */

import { createClient } from "@/lib/supabaseClient";
import { offlineDb } from "./indexedDbManager";

// Cache mémoire ultrarapide pour éviter de solliciter IndexedDB ou Supabase sur des données figées
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 heures

class SupabaseOptimizer {
  private getFromMemoryCache(key: string): any | null {
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    return null;
  }

  private setInMemoryCache(key: string, data: any): void {
    memoryCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Récupération optimisée du profil utilisateur : sélectionne uniquement les colonnes indispensables
   * au rendu du tableau de bord (id, full_name, email, pack, avatar_url, country).
   */
  public async fetchOptimizedProfile(userId: string, forceRefresh: boolean = false): Promise<any | null> {
    const cacheKey = `profile_${userId}`;
    if (!forceRefresh) {
      const mem = this.getFromMemoryCache(cacheKey);
      if (mem) return mem;

      // Vérification dans IndexedDB si hors ligne
      const local = await offlineDb.getAppSetting<any>(cacheKey);
      if (local) {
        this.setInMemoryCache(cacheKey, local);
        return local;
      }
    }

    if (typeof window !== "undefined" && !navigator.onLine) {
      return null;
    }

    try {
      const supabase = createClient();
      // SELECTION STRICTE : on évite d'extraire des colonnes volumineuses inutiles
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, pack, avatar_url, country, updated_at")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.warn("[SupabaseOptimizer] Erreur fetchProfile:", error.message);
        return null;
      }

      if (data) {
        this.setInMemoryCache(cacheKey, data);
        await offlineDb.saveAppSetting(cacheKey, data);
        return data;
      }
    } catch (e) {
      console.warn("[SupabaseOptimizer] Échec réseau fetchProfile:", e);
    }

    return null;
  }

  /**
   * Récupération paginée et optimisée de l'historique des résultats d'examens d'un candidat.
   */
  public async fetchOptimizedExamResults(userId: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const cacheKey = `exam_results_${userId}_${limit}_${offset}`;
    const mem = this.getFromMemoryCache(cacheKey);
    if (mem) return mem;

    if (typeof window !== "undefined" && !navigator.onLine) {
      const local = await offlineDb.getAppSetting<any[]>(cacheKey);
      return local || [];
    }

    try {
      const supabase = createClient();
      // Sélection des colonnes essentielles de résumé (pas les traces complètes QCM)
      const { data, error } = await supabase
        .from("exam_results")
        .select("id, exam_type, score, created_at, time_spent_seconds")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.warn("[SupabaseOptimizer] Erreur fetchExamResults:", error.message);
        return [];
      }

      if (data && data.length > 0) {
        this.setInMemoryCache(cacheKey, data);
        await offlineDb.saveAppSetting(cacheKey, data);
        return data;
      }
    } catch (e) {
      console.warn("[SupabaseOptimizer] Échec réseau fetchExamResults:", e);
    }

    return [];
  }

  /**
   * Purge le cache mémoire et local d'un utilisateur (utile après une modification de profil ou déconnexion).
   */
  public async invalidateUserCache(userId: string): Promise<void> {
    memoryCache.delete(`profile_${userId}`);
    await offlineDb.delete("app_settings", `profile_${userId}`);
  }
}

export const supabaseOptimizer = new SupabaseOptimizer();
