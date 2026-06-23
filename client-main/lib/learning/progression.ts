/**
 * Non-violent learning progression — XP, levels, streaks, missions.
 */

export const XP_PER_LEVEL = 100;

export interface LearningProgression {
  xp: number;
  level: number;
  stars: number;
  badges: string[];
  streakDays: number;
  lastActiveDate: string | null;
  missionsCompleted: number;
  focusMode: boolean;
}

export const DEFAULT_PROGRESSION: LearningProgression = {
  xp: 0,
  level: 1,
  stars: 0,
  badges: [],
  streakDays: 0,
  lastActiveDate: null,
  missionsCompleted: 0,
  focusMode: false,
};

export function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function levelProgress(xp: number): { current: number; next: number; percent: number } {
  const level = xpToLevel(xp);
  const base = (level - 1) * XP_PER_LEVEL;
  const inLevel = xp - base;
  return {
    current: inLevel,
    next: XP_PER_LEVEL,
    percent: Math.min(100, Math.round((inLevel / XP_PER_LEVEL) * 100)),
  };
}

export function awardXp(
  progress: LearningProgression,
  amount: number,
  options?: { star?: boolean; badge?: string; mission?: boolean },
): LearningProgression {
  const xp = progress.xp + amount;
  return {
    ...progress,
    xp,
    level: xpToLevel(xp),
    stars: progress.stars + (options?.star ? 1 : 0),
    badges: options?.badge ? [...progress.badges, options.badge] : progress.badges,
    missionsCompleted: progress.missionsCompleted + (options?.mission ? 1 : 0),
  };
}

export function touchDailyStreak<T extends Pick<LearningProgression, "streakDays" | "lastActiveDate">>(
  progress: T,
  now = new Date(),
): T {
  const today = now.toISOString().slice(0, 10);
  if (progress.lastActiveDate === today) return progress;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  const streakDays =
    progress.lastActiveDate === yStr ? progress.streakDays + 1 : 1;

  return { ...progress, streakDays, lastActiveDate: today };
}

export const MISSION_TYPES = {
  COMPLETE_LESSON: { xp: 25, label: "Complete a lesson" },
  PASS_QUIZ: { xp: 40, label: "Pass a quiz" },
  CLASSROOM_FOCUS: { xp: 15, label: "Focus mode session" },
  DAILY_LOGIN: { xp: 10, label: "Daily learning streak" },
} as const;
