"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadTranslations } from "@/lib/i18n/loader";
import { translations } from "@/lib/translations";

export function useTranslation() {
  const { locale, setLocale } = useLanguage();
  const [messages, setMessages] = useState<Record<string, string>>(() => ({
    ...(translations.en ?? {}),
    ...(translations[locale] ?? {}),
  }));

  useEffect(() => {
    let active = true;

    loadTranslations(locale)
      .then((next) => {
        if (active) {
          setMessages(next);
        }
      })
      .catch(() => {
        if (active) {
          setMessages({
            ...(translations.en ?? {}),
            ...(translations[locale] ?? {}),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [locale]);

  const t = (key: string) => messages[key] ?? translations[locale]?.[key] ?? translations.en?.[key] ?? key;

  return { t, locale, setLocale };
}
