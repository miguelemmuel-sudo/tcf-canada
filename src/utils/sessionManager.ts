// Helper utility to detect, save, and manage interrupted test/course sessions with Supabase sync

import { createClient } from "@/lib/supabaseClient";

export interface InterruptedSession {
  key: string;
  path: string;
  title: string;
  type: "test" | "cours";
  timestamp: number;
}

const SESSION_KEYS: { key: string; path: string; title: string; type: "test" | "cours" }[] = [
  { key: "tcf_session_listening_exam", path: "/dashboard/exams/listening", title: "Examen Compréhension Orale", type: "test" },
  { key: "tcf_session_reading_exam", path: "/dashboard/exams/reading", title: "Examen Compréhension Écrite", type: "test" },
  { key: "tcf_session_writing_exam", path: "/dashboard/exams/writing", title: "Examen Production Écrite", type: "test" },
  { key: "tcf_session_speaking_exam", path: "/dashboard/exams/speaking", title: "Examen Production Orale", type: "test" },
  { key: "tcf_session_listening_course", path: "/dashboard/courses/listening", title: "Cours Compréhension Orale", type: "cours" },
  { key: "tcf_session_reading_course", path: "/dashboard/courses/reading", title: "Cours Compréhension Écrite", type: "cours" },
  { key: "tcf_session_writing_course", path: "/dashboard/courses/writing", title: "Cours Production Écrite", type: "cours" },
  { key: "tcf_session_speaking_course", path: "/dashboard/courses/speaking", title: "Cours Production Orale", type: "cours" },
];

/**
 * Finds an active interrupted session locally
 */
export function findInterruptedSession(): InterruptedSession | null {
  if (typeof window === "undefined") return null;

  for (const s of SESSION_KEYS) {
    const raw = localStorage.getItem(s.key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && !parsed.showResults) {
          const hasAnswers = parsed.answers && Object.keys(parsed.answers).length > 0;
          const hasProgress = typeof parsed.currentQuestion === "number" ? parsed.currentQuestion > 0 : false;
          const hasLessonProgress = typeof parsed.currentLesson === "number" ? parsed.currentLesson > 0 : false;

          if (hasAnswers || hasProgress || hasLessonProgress) {
            return {
              key: s.key,
              path: s.path,
              title: s.title,
              type: s.type,
              timestamp: parsed.timestamp || Date.now(),
            };
          }
        }
      } catch (e) {
        console.error("Error parsing session:", e);
      }
    }
  }

  return null;
}

/**
 * Clears an interrupted session locally and on Supabase
 */
export async function clearInterruptedSession(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from("active_sessions")
        .delete()
        .match({ user_id: user.id, session_key: key });
    }
  } catch (e) {
    console.error("Error clearing session:", e);
  }
}

/**
 * Clears all user-bound local storage data (sessions, course progress, profile, payment info)
 * Ensures 100% data isolation between different users on the same device.
 */
export function clearAllUserLocalData() {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove = [
      "griffon_user_name",
      "griffon_user_email",
      "griffon_user_phone",
      "griffon_user_country",
      "griffon_user_plan",
      "griffon_user_new",
      "griffon_courses_progress_v2",
      "griffon_completed_lessons_v2",
      "griffon_learning_time_seconds_v2",
      "griffon_user_payment_methods"
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    SESSION_KEYS.forEach(s => localStorage.removeItem(s.key));

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("griffon_avatar_url_") || key.startsWith("tcf_session_") || key.startsWith("pending_save_"))) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error("Error clearing user local data:", e);
  }
}

/**
 * Saves session state locally and debounces sync to Supabase
 */
const syncTimeouts: Record<string, NodeJS.Timeout> = {};

export function saveSessionState(key: string, data: any) {
  if (typeof window === "undefined") return;
  
  // Always save locally immediately
  try {
    const payload = { ...data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));

    // Clear existing timeout for this key
    if (syncTimeouts[key]) {
      clearTimeout(syncTimeouts[key]);
    }

    // Debounce Supabase sync by 2 seconds
    syncTimeouts[key] = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from("active_sessions")
            .upsert({
              user_id: user.id,
              session_key: key,
              session_data: payload,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id, session_key'
            });
        }
      } catch (err) {
        console.error("Failed to sync session to Supabase", err);
      }
    }, 2000);
  } catch (e) {
    console.error("Error saving session locally", e);
  }
}

/**
 * Loads sessions from Supabase into localStorage for the given user upon login/dashboard visit
 */
export async function loadSessionsFromSupabase(userId: string) {
  if (typeof window === "undefined") return;
  try {
    const supabase = createClient();
    const { data: sessions, error } = await supabase
      .from("active_sessions")
      .select("session_key, session_data")
      .eq("user_id", userId);
      
    if (error) {
      console.warn("Could not load sessions from Supabase. Table might not exist yet.", error);
      return;
    }
    
    if (sessions && sessions.length > 0) {
      sessions.forEach(session => {
        // We overwrite local state with the one from Supabase (assuming it's the latest if fetched upon login)
        localStorage.setItem(session.session_key, JSON.stringify(session.session_data));
      });
    }
  } catch (err) {
    console.error("Failed to fetch active sessions", err);
  }
}
