"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, isLocaleCode } from "@/lib/i18n/config";
import { useLanguage } from "@/contexts/LanguageContext";

export function LocaleRouteSync() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguage();

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const hasLocalePrefix = segments[0] && isLocaleCode(segments[0]);

    if (!hasLocalePrefix && locale !== DEFAULT_LOCALE) {
      const nextPath = `/${locale}${pathname === "/" ? "" : pathname}`;
      router.replace(nextPath);
    }

    if (hasLocalePrefix && segments[0] !== locale) {
      const cleanPath = `/${segments.slice(1).join("/")}`;
      const nextPath = locale === DEFAULT_LOCALE ? cleanPath : `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
      router.replace(nextPath);
    }
  }, [locale, pathname, router]);

  return null;
}
