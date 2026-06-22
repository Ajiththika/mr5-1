const LAST_GREETING_KEY = "mr5_last_voice_greeting_at";
const SESSION_GREETING_KEY = "mr5_voice_greeting_session";
export const GREETING_COOLDOWN_MS = 5 * 60 * 60 * 1000;

export function shouldPlayVoiceGreeting(now = Date.now()): boolean {
  if (typeof window === "undefined") return false;

  if (sessionStorage.getItem(SESSION_GREETING_KEY)) {
    return false;
  }

  try {
    const raw = localStorage.getItem(LAST_GREETING_KEY);
    if (!raw) return true;
    const last = Number.parseInt(raw, 10);
    if (!Number.isFinite(last)) return true;
    return now - last >= GREETING_COOLDOWN_MS;
  } catch {
    return false;
  }
}

export function markVoiceGreetingPlayed(at = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_GREETING_KEY, String(at));
    sessionStorage.setItem(SESSION_GREETING_KEY, "1");
  } catch {
    /* ignore storage errors */
  }
}

export function getVoiceGreetingCooldownRemainingMs(now = Date.now()): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(LAST_GREETING_KEY);
    if (!raw) return 0;
    const last = Number.parseInt(raw, 10);
    if (!Number.isFinite(last)) return 0;
    return Math.max(0, GREETING_COOLDOWN_MS - (now - last));
  } catch {
    return 0;
  }
}

export function resetVoiceGreetingSchedule(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LAST_GREETING_KEY);
    sessionStorage.removeItem(SESSION_GREETING_KEY);
  } catch {
    /* ignore */
  }
}
