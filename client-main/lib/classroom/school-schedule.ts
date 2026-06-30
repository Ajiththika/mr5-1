export const DEFAULT_SCHOOL_TIMEZONE = "Asia/Colombo";

const COUNTRY_TIMEZONE: Record<string, string> = {
  lk: "Asia/Colombo",
  "sri lanka": "Asia/Colombo",
};

export function resolveTimezoneFromCountry(
  country?: string | null,
  explicit?: string | null,
): string {
  if (explicit?.trim()) return explicit.trim();
  const key = country?.trim().toLowerCase() ?? "";
  return COUNTRY_TIMEZONE[key] ?? DEFAULT_SCHOOL_TIMEZONE;
}

export function resolveClockTimezone(
  country?: string | null,
  locationTz?: string | null,
  browserTz?: string | null,
): string {
  if (locationTz?.trim()) return locationTz.trim();
  if (country?.trim()) return resolveTimezoneFromCountry(country);
  return browserTz?.trim() || DEFAULT_SCHOOL_TIMEZONE;
}
