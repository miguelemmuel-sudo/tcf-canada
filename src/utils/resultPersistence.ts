import { createClient } from "@/lib/supabaseClient";

export interface ExamResultItem {
  id: string;
  user_id?: string;
  exam_id?: string;
  title: string;
  type: "listening" | "reading" | "writing" | "speaking" | "quiz";
  score: number;
  maxScore: number;
  tcfScore: number; // 100 to 699
  nclcLevel: string; // e.g. "NCLC 7"
  cecrlLevel: string; // e.g. "B2"
  aiFeedback?: string;
  completedAt: string;
  details?: any;
}

const STORAGE_KEY = "tcf_pro_user_results";

/**
 * Save exam or quiz result to Supabase DB, falling back to LocalStorage
 */
export async function saveExamResult(result: Omit<ExamResultItem, "id" | "completedAt">): Promise<ExamResultItem> {
  const completedAt = new Date().toISOString();
  const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newResult: ExamResultItem = {
    ...result,
    id,
    completedAt,
  };

  // 1. Try saving to Supabase if client is configured
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      newResult.user_id = user.id;
      await supabase.from("results").insert({
        user_id: user.id,
        exam_id: result.type,
        score: result.tcfScore,
        ai_feedback: result.aiFeedback || `${result.nclcLevel} (${result.cecrlLevel}) - Score: ${result.tcfScore}/699`,
        completed_at: completedAt,
      });
    }
  } catch (err) {
    console.warn("Supabase result save fallback to local storage:", err);
  }

  // 2. Save to LocalStorage for instant UI access & offline support
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalResults();
      const updated = [newResult, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save result in localStorage", e);
    }
  }

  return newResult;
}

/**
 * Get all results from local storage and DB
 */
export function getLocalResults(): ExamResultItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Calculate overall user stats
 */
export function getUserOverallStats() {
  const results = getLocalResults();
  if (results.length === 0) {
    return {
      averageScore: 485,
      nclcAverage: "NCLC 7",
      totalExams: 0,
      totalQuizzes: 0,
      skillsBreakdown: {
        listening: { count: 0, avgTcf: 520, level: "NCLC 7" },
        reading: { count: 0, avgTcf: 510, level: "NCLC 7" },
        writing: { count: 0, avgTcf: 480, level: "NCLC 6" },
        speaking: { count: 0, avgTcf: 490, level: "NCLC 7" },
      },
    };
  }

  let totalTcf = 0;
  let quizCount = 0;
  let examCount = 0;
  const breakdown: Record<string, { total: number; count: number }> = {
    listening: { total: 0, count: 0 },
    reading: { total: 0, count: 0 },
    writing: { total: 0, count: 0 },
    speaking: { total: 0, count: 0 },
  };

  results.forEach((res) => {
    totalTcf += res.tcfScore;
    if (res.type === "quiz") {
      quizCount++;
    } else {
      examCount++;
    }
    if (breakdown[res.type]) {
      breakdown[res.type].total += res.tcfScore;
      breakdown[res.type].count++;
    }
  });

  const avg = Math.round(totalTcf / results.length);

  return {
    averageScore: avg,
    nclcAverage: getTcfNclcLevel(avg),
    totalExams: examCount,
    totalQuizzes: quizCount,
    skillsBreakdown: {
      listening: {
        count: breakdown.listening.count,
        avgTcf: breakdown.listening.count > 0 ? Math.round(breakdown.listening.total / breakdown.listening.count) : 520,
        level: getTcfNclcLevel(breakdown.listening.count > 0 ? Math.round(breakdown.listening.total / breakdown.listening.count) : 520),
      },
      reading: {
        count: breakdown.reading.count,
        avgTcf: breakdown.reading.count > 0 ? Math.round(breakdown.reading.total / breakdown.reading.count) : 510,
        level: getTcfNclcLevel(breakdown.reading.count > 0 ? Math.round(breakdown.reading.total / breakdown.reading.count) : 510),
      },
      writing: {
        count: breakdown.writing.count,
        avgTcf: breakdown.writing.count > 0 ? Math.round(breakdown.writing.total / breakdown.writing.count) : 480,
        level: getTcfNclcLevel(breakdown.writing.count > 0 ? Math.round(breakdown.writing.total / breakdown.writing.count) : 480),
      },
      speaking: {
        count: breakdown.speaking.count,
        avgTcf: breakdown.speaking.count > 0 ? Math.round(breakdown.speaking.total / breakdown.speaking.count) : 490,
        level: getTcfNclcLevel(breakdown.speaking.count > 0 ? Math.round(breakdown.speaking.total / breakdown.speaking.count) : 490),
      },
    },
  };
}

export function getTcfNclcLevel(score: number): string {
  if (score >= 600) return "NCLC 10+ (C2)";
  if (score >= 549) return "NCLC 9 (C1)";
  if (score >= 500) return "NCLC 8 (B2+)";
  if (score >= 450) return "NCLC 7 (B2)";
  if (score >= 400) return "NCLC 6 (B1+)";
  if (score >= 350) return "NCLC 5 (B1)";
  if (score >= 300) return "NCLC 4 (A2)";
  return "NCLC 3 (A1)";
}
