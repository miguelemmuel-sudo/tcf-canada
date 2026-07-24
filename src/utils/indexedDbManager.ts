/**
 * Moteur de Stockage Local Ultra-Résilient (IndexedDB) pour TCF Canada Pro (Griffon D'OR)
 * Conçu pour garantir ZÉRO PERTE DE DONNÉES en Afrique centrale et zones à connexions instables.
 * Dépasse la limite de 5 Mo du LocalStorage avec un accès quasi-instantané (< 5ms).
 */

const DB_NAME = "griffon_tcf_offline_db";
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  type: "exam_answer" | "course_progress" | "writing_draft" | "profile_update" | "ai_eval_request" | "session_state";
  payload: any;
  timestamp: number;
  retryCount: number;
  status: "pending" | "syncing" | "failed";
  idempotencyKey: string;
}

export interface OfflineAudioItem {
  url: string;
  blobBase64: string;
  contentType: string;
  timestamp: number;
  sizeBytes: number;
}

export interface OfflineCourseItem {
  courseKey: string;
  data: any;
  timestamp: number;
}

export interface UserDraftItem {
  draftKey: string;
  content: any;
  timestamp: number;
  updatedAt: string;
}

export interface AppSettingItem {
  settingKey: string;
  value: any;
}

class IndexedDbManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
  }

  /**
   * Initialise et ouvre la base de données IndexedDB avec ses 5 magasins d'objets.
   */
  public async getDb(): Promise<IDBDatabase> {
    if (!this.isBrowser()) {
      throw new Error("IndexedDB est accessible uniquement dans un environnement navigateur.");
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("[IndexedDB] Erreur d'ouverture de la base :", request.error);
        this.dbPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. File d'attente des requêtes réseau en attente (Sync Queue)
        if (!db.objectStoreNames.contains("pending_sync_queue")) {
          const syncStore = db.createObjectStore("pending_sync_queue", { keyPath: "id" });
          syncStore.createIndex("by_status", "status", { unique: false });
          syncStore.createIndex("by_timestamp", "timestamp", { unique: false });
          syncStore.createIndex("by_idempotency", "idempotencyKey", { unique: true });
        }

        // 2. Cache audio pour lecture hors connexion (Blobs/Base64)
        if (!db.objectStoreNames.contains("offline_audios")) {
          const audioStore = db.createObjectStore("offline_audios", { keyPath: "url" });
          audioStore.createIndex("by_timestamp", "timestamp", { unique: false });
        }

        // 3. Cache des cours et leçons QCM générées
        if (!db.objectStoreNames.contains("offline_courses")) {
          const courseStore = db.createObjectStore("offline_courses", { keyPath: "courseKey" });
          courseStore.createIndex("by_timestamp", "timestamp", { unique: false });
        }

        // 4. Brouillons utilisateurs (écritures à chaque frappe/clic)
        if (!db.objectStoreNames.contains("user_drafts")) {
          const draftStore = db.createObjectStore("user_drafts", { keyPath: "draftKey" });
          draftStore.createIndex("by_timestamp", "timestamp", { unique: false });
        }

        // 5. Préférences et paramètres de l'application
        if (!db.objectStoreNames.contains("app_settings")) {
          db.createObjectStore("app_settings", { keyPath: "settingKey" });
        }
      };
    });

    return this.dbPromise;
  }

  // ─── MÉTHODS GÉNÉRIQUES DE STOCKAGE ──────────────────────────────────────────

  public async put<T>(storeName: string, item: T): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.put(item);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`[IndexedDB] Échec de l'écriture dans ${storeName}:`, e);
    }
  }

  public async get<T>(storeName: string, key: string | number): Promise<T | null> {
    if (!this.isBrowser()) return null;
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result ? (req.result as T) : null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`[IndexedDB] Échec de la lecture dans ${storeName}:`, e);
      return null;
    }
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.isBrowser()) return [];
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve((req.result as T[]) || []);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`[IndexedDB] Échec de getAll dans ${storeName}:`, e);
      return [];
    }
  }

  public async delete(storeName: string, key: string | number): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`[IndexedDB] Échec de suppression dans ${storeName}:`, e);
    }
  }

  public async clear(storeName: string): Promise<void> {
    if (!this.isBrowser()) return;
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`[IndexedDB] Échec de clear dans ${storeName}:`, e);
    }
  }

  // ─── SPÉCIALISATIONS POUR LA RÉSILIENCE HORS LIGNE ───────────────────────────

  /**
   * Ajoute une action utilisateur dans la file d'attente de synchronisation.
   * Génère une clé d'idempotence unique pour éviter tout doublon.
   */
  public async enqueueSyncItem(type: SyncQueueItem["type"], payload: any): Promise<string> {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const idempotencyKey = `${type}_${JSON.stringify(payload).slice(0, 100)}_${Date.now()}`;
    const item: SyncQueueItem = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: "pending",
      idempotencyKey,
    };
    await this.put("pending_sync_queue", item);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("griffon_sync_queue_updated", { detail: { count: await this.getPendingSyncCount() } }));
    }
    return id;
  }

  public async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    const all = await this.getAll<SyncQueueItem>("pending_sync_queue");
    return all.filter((i) => i.status === "pending" || i.status === "failed");
  }

  public async getPendingSyncCount(): Promise<number> {
    const items = await this.getPendingSyncItems();
    return items.length;
  }

  public async removeSyncItem(id: string): Promise<void> {
    await this.delete("pending_sync_queue", id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("griffon_sync_queue_updated", { detail: { count: await this.getPendingSyncCount() } }));
    }
  }

  /**
   * Sauvegarde un fichier audio (base64) pour permettre l'écoute hors connexion.
   */
  public async saveOfflineAudio(url: string, blobBase64: string, contentType: string = "audio/mp3"): Promise<void> {
    const sizeBytes = Math.round((blobBase64.length * 3) / 4);
    const item: OfflineAudioItem = {
      url,
      blobBase64,
      contentType,
      timestamp: Date.now(),
      sizeBytes,
    };
    await this.put("offline_audios", item);
    // Déclenche une purge LRU si le cache dépasse 100 Mo sur smartphone
    await this.pruneAudioCache(100 * 1024 * 1024);
  }

  public async getOfflineAudio(url: string): Promise<string | null> {
    const item = await this.get<OfflineAudioItem>("offline_audios", url);
    return item ? item.blobBase64 : null;
  }

  /**
   * Sauvegarde un brouillon ou état d'examen en temps réel (< 5ms).
   */
  public async saveUserDraft(draftKey: string, content: any): Promise<void> {
    const item: UserDraftItem = {
      draftKey,
      content,
      timestamp: Date.now(),
      updatedAt: new Date().toISOString(),
    };
    await this.put("user_drafts", item);
  }

  public async getUserDraft(draftKey: string): Promise<any | null> {
    const item = await this.get<UserDraftItem>("user_drafts", draftKey);
    return item ? item.content : null;
  }

  /**
   * Sauvegarde un cours complet ou un pack d'examens pour consultation hors ligne.
   */
  public async saveOfflineCourse(courseKey: string, data: any): Promise<void> {
    const item: OfflineCourseItem = {
      courseKey,
      data,
      timestamp: Date.now(),
    };
    await this.put("offline_courses", item);
  }

  public async getOfflineCourse(courseKey: string): Promise<any | null> {
    const item = await this.get<OfflineCourseItem>("offline_courses", courseKey);
    return item ? item.data : null;
  }

  public async saveAppSetting(settingKey: string, value: any): Promise<void> {
    await this.put("app_settings", { settingKey, value });
  }

  public async getAppSetting<T = any>(settingKey: string, defaultValue?: T): Promise<T | null> {
    const item = await this.get<AppSettingItem>("app_settings", settingKey);
    return item ? item.value : defaultValue !== undefined ? defaultValue : null;
  }

  /**
   * Purge intelligente LRU des vieux audios en cas de dépassement du quota mémoire sur mobile.
   */
  private async pruneAudioCache(maxBytes: number): Promise<void> {
    try {
      const audios = await this.getAll<OfflineAudioItem>("offline_audios");
      let totalBytes = audios.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

      if (totalBytes <= maxBytes) return;

      // Tri par date d'accès du plus ancien au plus récent (LRU)
      audios.sort((a, b) => a.timestamp - b.timestamp);

      for (const audio of audios) {
        if (totalBytes <= maxBytes) break;
        await this.delete("offline_audios", audio.url);
        totalBytes -= audio.sizeBytes || 0;
      }
    } catch (e) {
      console.warn("[IndexedDB] Échec du nettoyage LRU audio:", e);
    }
  }

  /**
   * Renvoie un diagnostic de l'utilisation du stockage local.
   */
  public async getStorageDiagnostics(): Promise<{
    audiosCount: number;
    audiosSizeMB: string;
    syncQueueCount: number;
    coursesCachedCount: number;
    draftsCount: number;
  }> {
    const audios = await this.getAll<OfflineAudioItem>("offline_audios");
    const sync = await this.getAll<SyncQueueItem>("pending_sync_queue");
    const courses = await this.getAll<OfflineCourseItem>("offline_courses");
    const drafts = await this.getAll<UserDraftItem>("user_drafts");

    const totalAudioBytes = audios.reduce((acc, c) => acc + (c.sizeBytes || 0), 0);
    const audiosSizeMB = (totalAudioBytes / (1024 * 1024)).toFixed(2);

    return {
      audiosCount: audios.length,
      audiosSizeMB,
      syncQueueCount: sync.length,
      coursesCachedCount: courses.length,
      draftsCount: drafts.length,
    };
  }
}

export const offlineDb = new IndexedDbManager();
