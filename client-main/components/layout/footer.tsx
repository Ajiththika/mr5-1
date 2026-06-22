"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";

const FOOTER_LINK_KEYS = [
  { key: "footer.home", href: "/" },
  { key: "footer.courses", href: "/courses" },
  { key: "footer.pricing", href: "/pricing" },
  { key: "footer.instructors", href: "/instructors" },
  { key: "footer.support", href: "/contact" },
] as const;

export function Footer({ year = 2025 }: { year?: number }) {
  const { t } = useTranslation();

  return (
    <footer role="contentinfo" className="relative z-50 mt-20 w-full px-6 py-8">
      <div className="mx-auto max-w-7xl rounded-[18px] border border-white/10 bg-white/5 p-6 shadow-[0_10px_24px_rgba(2,6,23,0.6),inset_0_6px_16px_rgba(255,255,255,0.02)] backdrop-blur-[10px] transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,184,255,0.15),inset_0_6px_16px_rgba(255,255,255,0.05)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative h-10 w-10">
                <Image
                  src="/assets/mr5-logo-neon.png"
                  alt="MR5 School logo"
                  fill
                  sizes="40px"
                  className="object-contain drop-shadow-[0_0_10px_rgba(0,184,255,0.5)]"
                />
              </div>
              <div>
                <div className="text-sm font-bold tracking-wide text-white transition-colors group-hover:text-[#00b8ff]">
                  MR5 School
                </div>
                <div className="text-xs font-medium text-blue-200/70">{t("footer.tagline")}</div>
              </div>
            </Link>

            <nav
              aria-label="Footer links"
              className="flex flex-wrap justify-center gap-4 text-sm font-medium text-blue-100/80 md:gap-8"
            >
              {FOOTER_LINK_KEYS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-all duration-300 hover:-translate-y-0.5 hover:text-[#00b8ff]"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <Link
              href="/contact"
              aria-label={t("footer.demo")}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,184,255,0.12), rgba(0,184,255,0.06))",
                border: "1px solid rgba(0,184,255,0.22)",
                boxShadow:
                  "0 6px 28px rgba(0,184,255,0.12), 0 2px 6px rgba(2,6,23,0.5)",
              }}
            >
              {t("footer.demo")}
            </Link>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-4 md:flex-row">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {t("footer.language")}
            </p>
            <LanguageSelector />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-[10px] text-blue-200/40 md:flex-row">
        <div>
          © {year} MR5 School. {t("footer.rights")}
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="transition-colors hover:text-blue-200">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-blue-200">
            {t("footer.privacy")}
          </Link>
          <Link href="/accessibility" className="transition-colors hover:text-blue-200">
            {t("footer.accessibility")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
