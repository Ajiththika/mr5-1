export const SEAT_STORAGE_KEY = "mr5_selected_seat";
export const DEFAULT_SEAT_ID = 3;

export function readStoredSeatId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SEAT_STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 9) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function writeStoredSeatId(seatId: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isInteger(seatId) || seatId < 1 || seatId > 9) return;
  try {
    localStorage.setItem(SEAT_STORAGE_KEY, String(seatId));
  } catch {
    /* private mode */
  }
}
