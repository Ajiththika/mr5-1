import type { LocaleCode } from "./config";

export interface TranslationEntry {
  key: string;
  value: string;
}

export interface TranslationBundle {
  locale: LocaleCode;
  entries: TranslationEntry[];
}

const STORAGE_KEY = "mr5-translation-overrides";

export function loadTranslationOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveTranslationOverrides(overrides: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function mergeTranslations(base: Record<string, string>, overrides: Record<string, string>): Record<string, string> {
  return {
    ...base,
    ...overrides,
  };
}

export function getTranslationPreview(bundle: TranslationBundle, key: string) {
  const entry = bundle.entries.find((item) => item.key === key);
  return entry?.value ?? "";
}
