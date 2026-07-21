"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { loadTranslations, mergeTranslationLayers } from "@/lib/i18n/loader";
import type { LocaleCode } from "@/lib/i18n/config";

export function useTranslation() {
  const { locale, setLocale } = useLanguage();
  const [messages, setMessages] = useState<Record<string, string>>(() =>
    mergeTranslationLayers(locale),
  );

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
          setMessages(mergeTranslationLayers(locale));
        }
      });

    return () => {
      active = false;
    };
  }, [locale]);

  const t = (key: string, vars?: Record<string, string>) => {
    const template =
      messages[key] ??
      mergeTranslationLayers(locale as LocaleCode)[key] ??
      key;
    if (!vars) return template;
    return Object.entries(vars).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, value),
      template,
    );
  };

  return { t, locale, setLocale };
}
