"use client";

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCourseContent, type CourseContentBundle } from "@/lib/i18n/content";

interface LocalizedCourseContentProps {
  bundle?: CourseContentBundle;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function LocalizedCourseContent({ bundle, fallbackTitle, fallbackDescription }: LocalizedCourseContentProps) {
  const { locale } = useLanguage();

  const localized = useMemo(() => ({
    title: localizeCourseContent(bundle?.title, locale, fallbackTitle),
    description: localizeCourseContent(bundle?.description, locale, fallbackDescription),
  }), [bundle, fallbackDescription, fallbackTitle, locale]);

  return (
    <div className="space-y-2">
      {localized.title ? <h2 className="text-xl font-semibold">{localized.title}</h2> : null}
      {localized.description ? <p className="text-sm text-muted-foreground">{localized.description}</p> : null}
    </div>
  );
}
