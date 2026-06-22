import { useLanguage } from "@/contexts/LanguageContext";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import { translations } from "@/lib/translations";

export function useTranslation() {
  const { locale, setLocale } = useLanguage();

  const t = (key: string) => {
    if (key.includes(".")) {
      return translate(locale, key as MessageKey);
    }
    const legacy = translations[locale]?.[key] ?? translations.en?.[key];
    return legacy ?? key;
  };

  return { t, locale, setLocale };
}
