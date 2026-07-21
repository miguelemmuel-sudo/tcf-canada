// Utility for real-time tracking of course progress, completed lessons & learning time

const COURSES_PROGRESS_KEY = "griffon_courses_progress_v2";
const COMPLETED_LESSONS_KEY = "griffon_completed_lessons_v2";
const LEARNING_TIME_KEY = "griffon_learning_time_seconds_v2";

export interface CourseProgressData {
  courseId: string; // 'co', 'ce', 'pe', 'po'
  completedLessons: (string | number)[];
  totalLessons: number;
  inProgress: boolean;
}

export function getStoredCoursesData(): Record<string, CourseProgressData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COURSES_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredCoursesData(data: Record<string, CourseProgressData>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COURSES_PROGRESS_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("storage_course_progress_updated"));
  } catch (e) {
    console.error("Error saving course progress data:", e);
  }
}

export function getLearningTimeSeconds(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(LEARNING_TIME_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function addLearningTimeSeconds(addedSeconds: number) {
  if (typeof window === "undefined" || addedSeconds <= 0) return;
  try {
    const current = getLearningTimeSeconds();
    const updated = current + addedSeconds;
    localStorage.setItem(LEARNING_TIME_KEY, updated.toString());
    window.dispatchEvent(new Event("storage_learning_time_updated"));
  } catch (e) {
    console.error("Error updating learning time:", e);
  }
}

export function markCourseStarted(courseId: string, totalLessonsCount: number = 8) {
  if (typeof window === "undefined") return;
  const currentData = getStoredCoursesData();
  const existing = currentData[courseId] || {
    courseId,
    completedLessons: [],
    totalLessons: totalLessonsCount,
    inProgress: true,
  };

  currentData[courseId] = {
    ...existing,
    totalLessons: totalLessonsCount,
    inProgress: true,
  };

  saveStoredCoursesData(currentData);
}

export function markLessonCompleted(courseId: string, lessonId: string | number, totalLessonsCount: number = 8) {
  if (typeof window === "undefined") return;
  const currentData = getStoredCoursesData();
  const existing = currentData[courseId] || {
    courseId,
    completedLessons: [],
    totalLessons: totalLessonsCount,
    inProgress: true,
  };

  const completedSet = new Set(existing.completedLessons);
  completedSet.add(lessonId);

  currentData[courseId] = {
    ...existing,
    completedLessons: Array.from(completedSet),
    totalLessons: totalLessonsCount,
    inProgress: true,
  };

  saveStoredCoursesData(currentData);
}

export function formatTimeFromSeconds(seconds: number): string {
  if (seconds <= 0) return "0h00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes < 10 ? "0" : ""}${minutes}m`;
}

export function getSummaryCourseStats() {
  const coursesData = getStoredCoursesData();
  const timeSeconds = getLearningTimeSeconds();

  let coursesInProgress = 0;
  let totalLessonsCompleted = 0;

  // Defaults for the 4 modules
  const modules = ["co", "ce", "pe", "po"];
  modules.forEach((modId) => {
    const data = coursesData[modId];
    if (data) {
      if (data.inProgress || (data.completedLessons && data.completedLessons.length > 0)) {
        coursesInProgress++;
      }
      if (data.completedLessons) {
        totalLessonsCompleted += data.completedLessons.length;
      }
    }
  });

  return {
    coursesInProgress,
    lessonsCompleted: totalLessonsCompleted,
    totalTimeSeconds: timeSeconds,
    totalTimeFormatted: formatTimeFromSeconds(timeSeconds),
  };
}
