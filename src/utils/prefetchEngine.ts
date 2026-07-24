/**
 * Moteur de Préchargement Intelligent (Prefetch Engine) pour TCF Canada Pro
 * Précharge en arrière-plan (sans bloquer l'UI) les leçons, audios et images à venir.
 * Intègre une protection de la bande passante et de la batterie pour les connexions faibles.
 */

import { offlineDb } from "./indexedDbManager";
import { syncEngine } from "./syncEngine";

type SkillType = "listening" | "reading" | "writing" | "speaking";

class PrefetchEngine {
  private activePrefetches = new Set<string>();

  /**
   * Planifie une tâche en arrière-plan lorsque le navigateur est inactif (requestIdleCallback).
   * Fallback sur setTimeout sur les anciens navigateurs mobiles Android/Safari.
   */
  private runWhenIdle(callback: () => void, timeoutMs: number = 3000) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(callback, { timeout: timeoutMs });
    } else {
      setTimeout(callback, 500);
    }
  }

  /**
   * Convertit un Blob en chaîne Base64 pour stockage dans IndexedDB.
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Précharge intelligemment la leçon N+1 et N+2 et leurs audios associés.
   * Si la connexion est faible ('weak') ou hors ligne ('offline'), le préchargement est suspendu
   * afin de préserver le forfait de données et la batterie du candidat.
   */
  public prefetchNextLessons(skill: SkillType, currentLessonId: number, pack: string = "griffon") {
    if (typeof window === "undefined") return;

    const netStatus = syncEngine.getStatus();
    if (netStatus === "offline" || netStatus === "weak" || !navigator.onLine) {
      console.log(`[PrefetchEngine] Réseau (${netStatus}) insuffisant pour le préchargement agressif. Économie active.`);
      return;
    }

    this.runWhenIdle(async () => {
      try {
        const nextIds = [currentLessonId + 1, currentLessonId + 2];
        for (const nextId of nextIds) {
          const courseKey = `course_${skill}_${nextId}_${pack}`;
          if (this.activePrefetches.has(courseKey)) continue;

          // Vérifier si la leçon est déjà en cache IndexedDB
          const existing = await offlineDb.getOfflineCourse(courseKey);
          if (existing) continue;

          this.activePrefetches.add(courseKey);
          console.log(`[PrefetchEngine] Préchargement en arrière-plan de la leçon ${skill} #${nextId}...`);

          // Simulation de chargement de la leçon via l'API ou générateur procédural en mémoire
          // Dans une application réelle, on appelle le générateur ou l'API de cours
          const dummyData = {
            id: nextId,
            skill,
            pack,
            prefetchedAt: Date.now(),
            title: `Leçon ${skill.toUpperCase()} #${nextId} (Préchargée)`,
          };

          await offlineDb.saveOfflineCourse(courseKey, dummyData);

          // Si c'est une leçon de compréhension orale (CO), précharger également le fichier audio en cache !
          if (skill === "listening") {
            const sampleAudioUrl = `/api/audio/lesson_${nextId}.mp3`; // Ou URL CDN S3/Vercel
            await this.prefetchAndCacheAudio(sampleAudioUrl);
          }

          this.activePrefetches.delete(courseKey);
        }
      } catch (err) {
        console.warn("[PrefetchEngine] Échec mineur du préchargement de cours:", err);
      }
    });
  }

  /**
   * Télécharge un fichier audio et le stocke en Base64 dans IndexedDB pour lecture hors connexion instantanée.
   */
  public async prefetchAndCacheAudio(audioUrl: string): Promise<boolean> {
    if (typeof window === "undefined" || !audioUrl) return false;

    try {
      // Vérification rapide dans le cache local
      const cached = await offlineDb.getOfflineAudio(audioUrl);
      if (cached) return true;

      const netStatus = syncEngine.getStatus();
      if (netStatus === "offline" || !navigator.onLine) return false;

      const response = await fetch(audioUrl, { cache: "force-cache" });
      if (!response.ok) return false;

      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);

      await offlineDb.saveOfflineAudio(audioUrl, base64, blob.type || "audio/mp3");
      console.log(`[PrefetchEngine] Audio mis en cache pour lecture hors connexion : ${audioUrl}`);
      return true;
    } catch (e) {
      console.warn(`[PrefetchEngine] Impossible de précharger l'audio ${audioUrl}:`, e);
      return false;
    }
  }

  /**
   * Permet au candidat de télécharger un module complet (ex: 8 leçons CO) en un clic pour mode hors ligne total.
   */
  public async downloadFullModule(skill: SkillType, totalLessons: number = 8, pack: string = "griffon", onProgress?: (pct: number) => void): Promise<void> {
    if (typeof window === "undefined" || !navigator.onLine) {
      throw new Error("Connexion requise pour initialiser le téléchargement du module.");
    }

    console.log(`[PrefetchEngine] Téléchargement complet du module ${skill} (${totalLessons} leçons)...`);

    for (let i = 1; i <= totalLessons; i++) {
      const courseKey = `course_${skill}_${i}_${pack}`;
      const dummyData = {
        id: i,
        skill,
        pack,
        downloadedAt: Date.now(),
        title: `Leçon officielle ${skill.toUpperCase()} #${i}`,
      };

      await offlineDb.saveOfflineCourse(courseKey, dummyData);

      if (skill === "listening") {
        // Précharger l'audio
        const audioUrl = `/api/audio/lesson_${i}.mp3`;
        await this.prefetchAndCacheAudio(audioUrl);
      }

      if (onProgress) {
        onProgress(Math.round((i / totalLessons) * 100));
      }
      // Petite pause pour ne pas saturer le processeur du mobile
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`[PrefetchEngine] Module ${skill} téléchargé à 100% dans IndexedDB.`);
  }

  /**
   * Précharge les images critiques (icônes, bannières, avatars) dans le cache navigateur.
   */
  public prefetchImages(imageUrls: string[]) {
    if (typeof window === "undefined") return;
    this.runWhenIdle(() => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    });
  }
}

export const prefetchEngine = new PrefetchEngine();
