/**
 * Moteur de File d'Attente & Cache IA (AI Cache & Queue Engine) pour TCF Canada Pro
 * Évite les appels IA coûteux et redondants grâce au hachage des soumissions.
 * En cas de coupure ou connexion faible en Afrique centrale, met en file d'attente la demande d'évaluation
 * et notifie le candidat dès qu'elle est traitée en arrière-plan lors du retour du réseau.
 */

import { offlineDb } from "./indexedDbManager";
import { syncEngine } from "./syncEngine";

export interface CachedAiEvaluation {
  hashKey: string;
  skill: "writing" | "speaking" | "coach";
  level: string;
  submissionText: string;
  evaluationResult: any;
  createdAt: number;
}

class AiCacheQueueEngine {
  /**
   * Génère un hash déterministe simplifié (Fowler-Noll-Vo 1a ou hash rapide) de la soumission.
   */
  public generateSubmissionHash(skill: string, level: string, promptText: string, submissionText: string): string {
    const raw = `${skill}_${level}_${promptText.trim().toLowerCase()}_${submissionText.trim().toLowerCase()}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return `ai_eval_${(hash >>> 0).toString(16)}`;
  }

  /**
   * Vérifie instantanément en cache local si une évaluation identique a déjà été calculée.
   */
  public async getCachedEvaluation(hashKey: string): Promise<any | null> {
    if (typeof window === "undefined") return null;
    try {
      const cached = await offlineDb.getAppSetting<CachedAiEvaluation>(hashKey);
      if (cached && cached.evaluationResult) {
        console.log(`[AiCacheQueueEngine] Succès du cache IA pour la clé ${hashKey} (0 coût, < 5ms) !`);
        return cached.evaluationResult;
      }
    } catch (e) {
      console.warn("[AiCacheQueueEngine] Échec de lecture du cache IA:", e);
    }
    return null;
  }

  /**
   * Enregistre une nouvelle évaluation IA dans le cache local.
   */
  public async saveEvaluationToCache(hashKey: string, skill: "writing" | "speaking" | "coach", level: string, submissionText: string, evaluationResult: any): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const payload: CachedAiEvaluation = {
        hashKey,
        skill,
        level,
        submissionText,
        evaluationResult,
        createdAt: Date.now(),
      };
      await offlineDb.saveAppSetting(hashKey, payload);
    } catch (e) {
      console.warn("[AiCacheQueueEngine] Impossible d'écrire en cache IA:", e);
    }
  }

  /**
   * Traitement intelligent d'une requête d'évaluation IA.
   * 1. Vérifie le cache local.
   * 2. Si connexion perdue ou faible, met en file d'attente et renvoie une réponse différée gracieuse.
   * 3. Sinon, renvoie null pour indiquer que l'appel réseau IA réel peut être exécuté.
   */
  public async interceptOrQueueAiRequest(
    skill: "writing" | "speaking" | "coach",
    level: string,
    promptText: string,
    submissionText: string
  ): Promise<{ fromCache: boolean; isQueued: boolean; evaluation?: any; queueId?: string }> {
    const hashKey = this.generateSubmissionHash(skill, level, promptText, submissionText);

    // 1. Vérification du cache instantané
    const cached = await this.getCachedEvaluation(hashKey);
    if (cached) {
      return { fromCache: true, isQueued: false, evaluation: cached };
    }

    // 2. Vérification de l'état réseau pour mise en file d'attente (Hors ligne)
    const netStatus = syncEngine.getStatus();
    if (netStatus === "offline" || !navigator.onLine) {
      console.log("[AiCacheQueueEngine] Hors ligne : Mise en file d'attente de la demande d'évaluation IA.");
      const queueId = await offlineDb.enqueueSyncItem("ai_eval_request", {
        hashKey,
        skill,
        level,
        promptText,
        submissionText,
        requestedAt: Date.now(),
      });

      // Réponse de secours gracieuse pour ne pas bloquer le candidat hors ligne
      const fallbackEvaluation = {
        score: "En attente de synchronisation",
        cecr: level,
        nclc: "En attente",
        feedback: `📡 **Mode Hors Connexion détecté.** Votre production a été **sauvegardée en toute sécurité** dans la mémoire de votre appareil. Elle sera transmise automatiquement à notre moteur d'intelligence artificielle dès le rétablissement de votre connexion Internet. Vous recevrez une notification avec votre correction détaillée sans aucune action supplémentaire de votre part.`,
        strengths: ["Production sauvegardée localement (Zéro perte de données)"],
        improvements: ["Connectez-vous à Internet pour recevoir l'analyse complète"],
        isOfflineFallback: true,
      };

      return { fromCache: false, isQueued: true, evaluation: fallbackEvaluation, queueId };
    }

    // 3. Appel réseau autorisé
    return { fromCache: false, isQueued: false };
  }
}

export const aiCacheQueueEngine = new AiCacheQueueEngine();
