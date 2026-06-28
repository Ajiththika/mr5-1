const PROGRESS_PREFIX = "mr5_classroom_progress_";

export interface ClassroomProgressSnapshot {
  courseId: string;
  sectionIndex: number;
  completedTopics: string[];
  updatedAt: number;
}

export function readClassroomProgress(courseId: string): ClassroomProgressSnapshot | null {
  if (typeof window === "undefined" || !courseId) return null;
  try {
    const raw = window.localStorage.getItem(`${PROGRESS_PREFIX}${courseId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ClassroomProgressSnapshot;
  } catch {
    return null;
  }
}

export function writeClassroomProgress(snapshot: ClassroomProgressSnapshot): void {
  if (typeof window === "undefined" || !snapshot.courseId) return;
  try {
    window.localStorage.setItem(
      `${PROGRESS_PREFIX}${snapshot.courseId}`,
      JSON.stringify(snapshot),
    );
  } catch {
    /* ignore */
  }
}
