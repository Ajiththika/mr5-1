import type { LocaleCode } from "./config";

export interface TranslatedContent<T = string> {
  default?: T;
  translations?: Partial<Record<LocaleCode, T>>;
}

export interface CourseContentBundle {
  title?: TranslatedContent;
  description?: TranslatedContent;
  lessonTitle?: TranslatedContent;
  lessonBody?: TranslatedContent;
}

export function resolveTranslatedContent<T>(content?: TranslatedContent<T>, locale?: LocaleCode, fallback?: T): T | undefined {
  if (!content) return fallback;
  if (locale && content.translations?.[locale]) return content.translations[locale];
  return content.default ?? fallback;
}

export function localizeCourseContent<T>(
  content?: TranslatedContent<T>,
  locale?: LocaleCode,
  fallback?: T,
): T | undefined {
  return resolveTranslatedContent(content, locale, fallback);
}
