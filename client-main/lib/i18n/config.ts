export const SUPPORTED_LOCALES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "si", label: "Sinhala", nativeLabel: "සිංහල" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES.map((l) => l.code));

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALE_SET.has(value);
}

export function normalizeLocale(raw?: string | null): LocaleCode {
  if (!raw) return DEFAULT_LOCALE;
  const code = raw.split(",")[0].trim().substring(0, 2).toLowerCase();
  if (code === "si" || code === "ta" || code === "de" || code === "nl" || code === "en") {
    return code;
  }
  return DEFAULT_LOCALE;
}
