/** Device profile buckets — layout/CSS only, no business logic. */
export type DeviceProfile =
  | "watch"
  | "phone"
  | "fold"
  | "tablet"
  | "laptop"
  | "desktop"
  | "tv"
  | "ultrawide";

export function resolveDeviceProfile(width: number, segmentCount = 1): DeviceProfile {
  if (segmentCount > 1) return "fold";
  if (width <= 400) return "watch";
  if (width <= 768) return "phone";
  if (width <= 1024) return "tablet";
  if (width <= 1440) return "laptop";
  if (width < 1920) return "desktop";
  if (width <= 3840) return "tv";
  return "ultrawide";
}

export function readViewportSegmentCount(): number {
  if (typeof window === "undefined") return 1;
  const segments = (
    window as Window & {
      viewport?: { segments?: unknown[] };
    }
  ).viewport?.segments;
  return Array.isArray(segments) && segments.length > 1 ? segments.length : 1;
}
