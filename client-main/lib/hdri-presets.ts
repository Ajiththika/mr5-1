/** Local HDRI files (self-hosted — avoids raw.githack.com CDN failures). */
export const HDRI_PRESETS = {
  apartment: "/assets/hdri/lebombo_1k.hdr",
  city: "/assets/hdri/potsdamer_platz_1k.hdr",
  night: "/assets/hdri/dikhololo_night_1k.hdr",
  sunset: "/assets/hdri/venice_sunset_1k.hdr",
} as const;

export type HdriPreset = keyof typeof HDRI_PRESETS;

export function resolveHdriPath(preset: string): string | undefined {
  return HDRI_PRESETS[preset as HdriPreset];
}
