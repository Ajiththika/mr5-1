"use client";

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCourseContent, type CourseContentBundle } from "@/lib/i18n/content";

interface LocalizedCourseContentProps {
  bundle?: CourseContentBundle;
  fallbackTitle?: string;
  fallbackDescription?: string;
  titleTag?: "h1" | "h2" | "h3" | "p";
  titleClassName?: string;
  descriptionClassName?: string;
}

export function LocalizedCourseContent({ bundle, fallbackTitle, fallbackDescription, titleTag = "h2", titleClassName, descriptionClassName }: LocalizedCourseContentProps) {
  const { locale } = useLanguage();

  const localized = useMemo(() => ({
    title: localizeCourseContent(bundle?.title, locale, fallbackTitle),
    description: localizeCourseContent(bundle?.description, locale, fallbackDescription),
  }), [bundle, fallbackDescription, fallbackTitle, locale]);

  const TitleTag = titleTag;

  return (
    <div className="space-y-2">
      {localized.title ? <TitleTag className={titleClassName ?? "text-xl font-semibold"}>{localized.title}</TitleTag> : null}
      {localized.description ? <p className={descriptionClassName ?? "text-sm text-muted-foreground"}>{localized.description}</p> : null}
    </div>
  );
}
