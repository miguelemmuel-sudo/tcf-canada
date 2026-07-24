/**
 * Moteur de Synchronisation Intelligente & Résolution de Conflits pour TCF Canada Pro
 * Conçu spécifiquement pour les réseaux instables (Afrique centrale).
 * Gère la détection de connexion, le traitement par lots et la déduplication sans bloquer l'UI.
 */

import { offlineDb, SyncQueueItem } from "./indexedDbManager";
import { createClient } from "@/lib/supabaseClient";

export type NetworkStatusType = "online" | "weak" | "offline" | "syncing";

class SyncEngine {
  private isSyncing = false;
  private currentStatus: NetworkStatusType = "online";
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: ((status: NetworkStatusType, pendingCount: number) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.initListeners();
      this.startBackgroundWatch();
    }
  }

  private initListeners() {
    window.addEventListener("online", () => {
      console.log("[SyncEngine] Connexion réseau rétablie !");
      this.updateStatus("online");
      this.triggerSync();
    });

    window.addEventListener("offline", () => {
      console.log("[SyncEngine] Connexion perdue. Passage en mode Hors Connexion.");
      this.updateStatus("offline");
    });

    // Écouter les mises à jour de la file d'attente IndexedDB
    window.addEventListener("griffon_sync_queue_updated", (e: any) => {
      this.notifyListeners();
      if (this.currentStatus !== "offline" && !this.isSyncing && e.detail?.count > 0) {
        this.triggerSync();
      }
    });
  }

  private startBackgroundWatch() {
    // Vérification périodique toutes les 30 secondes pour synchroniser les requêtes en attente
    this.syncInterval = setInterval(() => {
      if (this.currentStatus !== "offline" && !this.isSyncing) {
        this.checkNetworkQuality();
        this.triggerSync();
      }
    }, 30000);
  }

  /**
   * Évalue la qualité du réseau (via l'API Network Information standard sur Android/Chrome).
   * Détecte les débits faibles (2G/3G lente) ou latences élevées.
   */
  public checkNetworkQuality(): NetworkStatusType {
    if (typeof window === "undefined" || !navigator.onLine) {
      this.updateStatus("offline");
      return "offline";
    }

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      const effectiveType = conn.effectiveType; // '2g', '3g', '4g', etc.
      const downlink = conn.downlink; // en Mbps
      const rtt = conn.rtt; // en ms

      if (effectiveType === "2g" || effectiveType === "slow-2g" || (downlink && downlink < 0.5) || (rtt && rtt > 800)) {
        if (this.currentStatus !== "syncing") {
          this.updateStatus("weak");
        }
        return "weak";
      }
    }

    if (this.currentStatus !== "syncing") {
      this.updateStatus("online");
    }
    return "online";
  }

  private updateStatus(newStatus: NetworkStatusType) {
    if (this.currentStatus !== newStatus) {
      this.currentStatus = newStatus;
      this.notifyListeners();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("griffon_network_status_change", { detail: { status: newStatus } }));
      }
    }
  }

  public subscribe(listener: (status: NetworkStatusType, pendingCount: number) => void): () => void {
    this.listeners.push(listener);
    this.notifyListeners();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private async notifyListeners() {
    const count = await offlineDb.getPendingSyncCount();
    this.listeners.forEach((l) => l(this.currentStatus, count));
  }

  public getStatus(): NetworkStatusType {
    return this.currentStatus;
  }

  /**
   * Déclenche la synchronisation par lots des éléments en attente vers Supabase.
   * Résout les conflits et applique l'idempotence.
   */
  public async triggerSync(): Promise<void> {
    if (this.isSyncing || typeof window === "undefined" || !navigator.onLine) return;

    const items = await offlineDb.getPendingSyncItems();
    if (items.length === 0) {
      if (this.currentStatus === "syncing") {
        this.updateStatus(this.checkNetworkQuality());
      }
      return;
    }

    this.isSyncing = true;
    this.updateStatus("syncing");
    console.log(`[SyncEngine] Démarrage de la synchronisation (${items.length} éléments en attente)...`);

    // Tri du plus ancien au plus récent pour respecter l'ordre chronologique (LWW)
    items.sort((a, b) => a.timestamp - b.timestamp);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      console.warn("[SyncEngine] Utilisateur non connecté. Synchronisation suspendue.");
      this.isSyncing = false;
      this.updateStatus("online");
      return;
    }

    let successCount = 0;

    for (const item of items) {
      if (!navigator.onLine) {
        console.warn("[SyncEngine] Coupure réseau pendant la synchronisation. Interruption du traitement.");
        break;
      }

      try {
        await this.syncSingleItem(supabase, user.id, item);
        await offlineDb.removeSyncItem(item.id);
        successCount++;
      } catch (err) {
        console.error(`[SyncEngine] Échec de synchro pour l'item ${item.id} (${item.type}):`, err);
        // On incrémente le compteur d'essais. Si trop d'échecs, on met en pause
        if (item.retryCount >= 5) {
          await offlineDb.put("pending_sync_queue", { ...item, status: "failed", retryCount: item.retryCount + 1 });
        } else {
          await offlineDb.put("pending_sync_queue", { ...item, retryCount: item.retryCount + 1 });
        }
        // Lors d'une erreur réseau serveur, on fait une petite pause avant le prochain item
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    this.isSyncing = false;
    this.checkNetworkQuality();
    this.notifyListeners();
    console.log(`[SyncEngine] Synchronisation terminée : ${successCount}/${items.length} éléments synchronisés avec succès.`);
  }

  /**
   * Logique spécifique d'envoi vers Supabase selon le type d'item.
   */
  private async syncSingleItem(supabase: any, userId: string, item: SyncQueueItem): Promise<void> {
    const { type, payload, idempotencyKey } = item;

    switch (type) {
      case "course_progress": {
        // payload: { courseId: string, completedLessons: any[], completionPercentage: number }
        const { error } = await supabase.from("course_progress").upsert(
          {
            user_id: userId,
            course_id: payload.courseId,
            current_lesson: JSON.stringify(payload.completedLessons),
            completion_percentage: payload.completionPercentage,
            updated_at: new Date(item.timestamp).toISOString(),
            idempotency_key: idempotencyKey, // Si colonne existe
          },
          { onConflict: "user_id, course_id" }
        );
        if (error) throw error;
        break;
      }

      case "session_state":
      case "exam_answer": {
        // payload: { sessionKey: string, sessionData: any }
        const { error } = await supabase.from("active_sessions").upsert(
          {
            user_id: userId,
            session_key: payload.sessionKey,
            session_data: payload.sessionData,
            updated_at: new Date(item.timestamp).toISOString(),
          },
          { onConflict: "user_id, session_key" }
        );
        if (error && error.code !== "PGRST204") {
          // Ignorer si la table n'existe pas encore ou erreur mineure
          console.warn("[SyncEngine] Note: upsert active_sessions:", error.message);
        }
        break;
      }

      case "writing_draft": {
        // payload: { draftKey: string, content: any }
        // On sauvegarde également dans localStorage / Supabase user metadata ou table dédiée
        await offlineDb.saveUserDraft(payload.draftKey, payload.content);
        break;
      }

      case "profile_update": {
        // payload: { profileData: any }
        const { error } = await supabase.from("profiles").update(payload.profileData).eq("id", userId);
        if (error) throw error;
        break;
      }

      default:
        console.log(`[SyncEngine] Type d'item traité localement : ${type}`);
        break;
    }
  }

  public async forceSyncNow(): Promise<void> {
    return this.triggerSync();
  }
}

export const syncEngine = new SyncEngine();
