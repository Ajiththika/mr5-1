export type TeacherPresenceMode = "idle" | "teaching" | "question";

export const CAMERA_PITCH_MIN = -0.85;
export const CAMERA_PITCH_MAX = 0.85;

export const TEACHER_HEIGHT_MIN_M = 1.65;
export const TEACHER_HEIGHT_MAX_M = 1.8;

export function resolveTeacherHeightM(boardHeightM: number): number {
  const scaled = 1.62 + boardHeightM * 0.04;
  return Math.min(TEACHER_HEIGHT_MAX_M, Math.max(TEACHER_HEIGHT_MIN_M, scaled));
}

export interface TeacherIdleOffsets {
  chestY: number;
  weightX: number;
}

/** Subtle teacher breathing — realistic, not exaggerated. */
export function sampleTeacherIdleOffsets(
  elapsed: number,
  mode: TeacherPresenceMode,
): TeacherIdleOffsets {
  const amp =
    mode === "teaching" ? 0.0035 : mode === "question" ? 0.003 : 0.0025;
  const breath = Math.sin(elapsed * 1.15);
  return {
    chestY: breath * amp,
    weightX: Math.sin(elapsed * 0.35) * 0.004,
  };
}
