import type { LocaleCode } from "./config";
import { messages as coreMessages } from "./messages";
import { translations as legacyTranslations } from "@/lib/translations";

/** Merge canonical UI strings, legacy page copy, and locale-specific overrides. */
export function mergeTranslationLayers(locale: LocaleCode): Record<string, string> {
  const enBase = {
    ...(legacyTranslations.en ?? {}),
    ...(coreMessages.en ?? {}),
  };

  if (locale === "en") {
    return enBase;
  }

  const coreLocale = coreMessages[locale as keyof typeof coreMessages];
  return {
    ...enBase,
    ...(legacyTranslations[locale] ?? {}),
    ...(coreLocale ?? {}),
  };
}

async function importLocaleMessages(locale: LocaleCode): Promise<Record<string, string>> {
  switch (locale) {
    case "en":
      return (await import("./locales/en")).messages;
    case "ta":
      return (await import("./locales/ta")).messages;
    case "si":
      return (await import("./locales/si")).messages;
    case "zh":
      return (await import("./locales/zh")).messages;
    case "es":
      return (await import("./locales/es")).messages;
    case "fr":
      return (await import("./locales/fr")).messages;
    case "de":
      return (await import("./locales/de")).messages;
    case "nl":
      return (await import("./locales/nl")).messages;
    case "pt":
      return (await import("./locales/pt")).messages;
    case "ru":
      return (await import("./locales/ru")).messages;
    case "it":
      return (await import("./locales/it")).messages;
    case "ja":
      return (await import("./locales/ja")).messages;
    case "ko":
      return (await import("./locales/ko")).messages;
    case "ar":
      return (await import("./locales/ar")).messages;
    case "hi":
      return (await import("./locales/hi")).messages;
    case "bn":
      return (await import("./locales/bn")).messages;
    case "tr":
      return (await import("./locales/tr")).messages;
    case "id":
      return (await import("./locales/id")).messages;
    case "vi":
      return (await import("./locales/vi")).messages;
    case "th":
      return (await import("./locales/th")).messages;
    case "ms":
      return (await import("./locales/ms")).messages;
    case "pl":
      return (await import("./locales/pl")).messages;
    case "uk":
      return (await import("./locales/uk")).messages;
    case "nb":
      return (await import("./locales/nb")).messages;
    case "sv":
      return (await import("./locales/sv")).messages;
    case "da":
      return (await import("./locales/da")).messages;
    case "kl":
      return (await import("./locales/kl")).messages;
    case "fi":
      return (await import("./locales/fi")).messages;
    case "el":
      return (await import("./locales/el")).messages;
    case "he":
      return (await import("./locales/he")).messages;
    case "fa":
      return (await import("./locales/fa")).messages;
    case "ha":
      return (await import("./locales/ha")).messages;
    case "yo":
      return (await import("./locales/yo")).messages;
    case "ig":
      return (await import("./locales/ig")).messages;
    case "zu":
      return (await import("./locales/zu")).messages;
    case "am":
      return (await import("./locales/am")).messages;
    default:
      return (await import("./locales/en")).messages;
  }
}

export async function loadTranslations(locale: LocaleCode): Promise<Record<string, string>> {
  const localeMessages = await importLocaleMessages(locale);
  return {
    ...mergeTranslationLayers(locale),
    ...localeMessages,
  };
}
