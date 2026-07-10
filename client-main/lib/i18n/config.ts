export interface LocaleOption {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: "ltr" | "rtl";
  voiceLocale?: string;
}

export const SUPPORTED_LOCALES: readonly LocaleOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", dir: "ltr", voiceLocale: "en-US" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇱🇰", dir: "ltr", voiceLocale: "ta-IN" },
  { code: "si", label: "Sinhala", nativeLabel: "සිංහල", flag: "🇱🇰", dir: "ltr", voiceLocale: "si-LK" },
  { code: "zh", label: "Mandarin Chinese", nativeLabel: "中文", flag: "🇨🇳", dir: "ltr", voiceLocale: "zh-CN" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸", dir: "ltr", voiceLocale: "es-ES" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷", dir: "ltr", voiceLocale: "fr-FR" },
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪", dir: "ltr", voiceLocale: "de-DE" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", flag: "🇳🇱", dir: "ltr", voiceLocale: "nl-NL" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", flag: "🇵🇹", dir: "ltr", voiceLocale: "pt-PT" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", flag: "🇷🇺", dir: "ltr", voiceLocale: "ru-RU" },
  { code: "it", label: "Italian", nativeLabel: "Italiano", flag: "🇮🇹", dir: "ltr", voiceLocale: "it-IT" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵", dir: "ltr", voiceLocale: "ja-JP" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", flag: "🇰🇷", dir: "ltr", voiceLocale: "ko-KR" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇦🇪", dir: "rtl", voiceLocale: "ar-SA" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳", dir: "ltr", voiceLocale: "hi-IN" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇧🇩", dir: "ltr", voiceLocale: "bn-BD" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe", flag: "🇹🇷", dir: "ltr", voiceLocale: "tr-TR" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr", voiceLocale: "id-ID" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", flag: "🇻🇳", dir: "ltr", voiceLocale: "vi-VN" },
  { code: "th", label: "Thai", nativeLabel: "ไทย", flag: "🇹🇭", dir: "ltr", voiceLocale: "th-TH" },
  { code: "ms", label: "Malay", nativeLabel: "Bahasa Melayu", flag: "🇲🇾", dir: "ltr", voiceLocale: "ms-MY" },
  { code: "pl", label: "Polish", nativeLabel: "Polski", flag: "🇵🇱", dir: "ltr", voiceLocale: "pl-PL" },
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська", flag: "🇺🇦", dir: "ltr", voiceLocale: "uk-UA" },
  { code: "nb", label: "Norwegian", nativeLabel: "Norsk", flag: "🇳🇴", dir: "ltr", voiceLocale: "nb-NO" },
  { code: "sv", label: "Swedish", nativeLabel: "Svenska", flag: "🇸🇪", dir: "ltr", voiceLocale: "sv-SE" },
  { code: "da", label: "Danish", nativeLabel: "Dansk", flag: "🇩🇰", dir: "ltr", voiceLocale: "da-DK" },
  { code: "kl", label: "Greenlandic", nativeLabel: "Kalaallisut", flag: "🇬🇱", dir: "ltr", voiceLocale: "kl-GL" },
  { code: "fi", label: "Finnish", nativeLabel: "Suomi", flag: "🇫🇮", dir: "ltr", voiceLocale: "fi-FI" },
  { code: "el", label: "Greek", nativeLabel: "Ελληνικά", flag: "🇬🇷", dir: "ltr", voiceLocale: "el-GR" },
  { code: "he", label: "Hebrew", nativeLabel: "עברית", flag: "🇮🇱", dir: "rtl", voiceLocale: "he-IL" },
  { code: "fa", label: "Persian", nativeLabel: "فارسی", flag: "🇮🇷", dir: "rtl", voiceLocale: "fa-IR" },
  { code: "ha", label: "Hausa", nativeLabel: "Hausa", flag: "🇳🇬", dir: "ltr", voiceLocale: "ha-NG" },
  { code: "yo", label: "Yoruba", nativeLabel: "Yorùbá", flag: "🇳🇬", dir: "ltr", voiceLocale: "yo-NG" },
  { code: "ig", label: "Igbo", nativeLabel: "Igbo", flag: "🇳🇬", dir: "ltr", voiceLocale: "ig-NG" },
  { code: "zu", label: "Zulu", nativeLabel: "isiZulu", flag: "🇿🇦", dir: "ltr", voiceLocale: "zu-ZA" },
  { code: "am", label: "Amharic", nativeLabel: "አማርኛ", flag: "🇪🇹", dir: "ltr", voiceLocale: "am-ET" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES.map((l) => l.code));

export function isLocaleCode(value: string): value is LocaleCode {
  return LOCALE_SET.has(value);
}

export function normalizeLocale(raw?: string | null): LocaleCode {
  if (!raw) return DEFAULT_LOCALE;
  const code = raw.split(",")[0].trim().toLowerCase();
  const short = code.split(/[-_]/)[0];
  if (isLocaleCode(short)) return short;
  if (isLocaleCode(code)) return code;
  return DEFAULT_LOCALE;
}

export function getLocaleOption(locale?: string | null): LocaleOption {
  const normalized = normalizeLocale(locale);
  return SUPPORTED_LOCALES.find((item) => item.code === normalized) ?? SUPPORTED_LOCALES[0];
}

export function getLocaleDirection(locale?: string | null): "ltr" | "rtl" {
  return getLocaleOption(locale).dir;
}

export function buildLocalePath(pathname: string, locale: LocaleCode): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === DEFAULT_LOCALE) return normalized === "/" ? "/" : normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && isLocaleCode(segments[0])) {
    return segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";
  }
  return pathname;
}
