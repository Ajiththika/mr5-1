/**
 * Device-aware 3D performance profile (Mac Air M3 8GB friendly).
 */

export type PerformanceTier = "low" | "medium" | "high";

export interface PerformanceProfile3D {
  tier: PerformanceTier;
  dpr: [number, number];
  shadows: boolean;
  antialias: boolean;
  enableGaneshaModel: boolean;
  enableEnvironmentMap: boolean;
  maxFps: number;
}

function detectTier(): PerformanceTier {
  if (typeof window === "undefined") return "medium";

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 768px)").matches;

  if (isMobile || (memory !== undefined && memory < 4)) return "low";
  if (memory !== undefined && memory <= 8 && cores <= 8) return "medium";
  return "high";
}

export function get3DPerformanceProfile(): PerformanceProfile3D {
  const tier = detectTier();

  switch (tier) {
    case "low":
      return {
        tier,
        dpr: [1, 1],
        shadows: false,
        antialias: false,
        enableGaneshaModel: true,
        enableEnvironmentMap: false,
        maxFps: 30,
      };
    case "medium":
      return {
        tier,
        dpr: [1, 1.25],
        shadows: true,
        antialias: true,
        enableGaneshaModel: true,
        enableEnvironmentMap: true,
        maxFps: 30,
      };
    default:
      return {
        tier,
        dpr: [1, 1.5],
        shadows: true,
        antialias: true,
        enableGaneshaModel: true,
        enableEnvironmentMap: true,
        maxFps: 60,
      };
  }
}

/** Persist user override for heavy 3D models */
const GANESHA_PREF_KEY = "mr5-enable-ganesha-3d";

export function getGaneshaEnabledPreference(fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(GANESHA_PREF_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function setGaneshaEnabledPreference(enabled: boolean) {
  try {
    localStorage.setItem(GANESHA_PREF_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore */
  }
}
