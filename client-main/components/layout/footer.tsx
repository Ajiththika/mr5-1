"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { ModelCreditNotice } from "@/components/3d/ModelCreditNotice";
import {
  MR5_CONTACT,
  formatPhoneDisplay,
  mapsHref,
  telHref,
} from "@/data/contact";
import { MR5_LOGO_PATH } from "@/lib/brand/logo";

const FOOTER_LINK_KEYS = [
  { key: "footer.home", href: "/" },
  { key: "footer.courses", href: "/courses" },
  { key: "footer.pricing", href: "/pricing" },
  { key: "footer.instructors", href: "/instructors" },
  { key: "footer.manifesto", href: "/about" },
  { key: "footer.connect", href: "/contact" },
] as const;

export function Footer({ year = 2025 }: { year?: number }) {
  const { t } = useTranslation();

  return (
    <footer
      role="contentinfo"
      className="relative z-50 mt-[var(--space-section)] w-full px-[max(1rem,var(--safe-left))] py-8 pr-[max(1rem,var(--safe-right))] pb-[max(2rem,var(--safe-bottom))]"
    >
      <div className="mx-auto w-full max-w-[var(--content-wide)] rounded-2xl border border-border bg-card/90 p-[clamp(1rem,3vw,1.5rem)] shadow-lg backdrop-blur-md transition-shadow hover:shadow-xl dark:bg-card/40 dark:shadow-[0_10px_24px_rgba(2,6,23,0.6)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative h-10 w-10">
                <Image
                  src={MR5_LOGO_PATH}
                  alt="MR5 School logo"
                  fill
                  sizes="40px"
                  className="object-contain drop-shadow-[0_0_10px_rgba(0,184,255,0.4)] dark:drop-shadow-[0_0_10px_rgba(0,184,255,0.5)]"
                />
              </div>
              <div>
                <div className="text-sm font-bold tracking-wide text-foreground transition-colors group-hover:text-primary">
                  MR5 School
                </div>
                <div className="text-xs font-medium text-muted-foreground">{t("footer.tagline")}</div>
              </div>
            </Link>

            <nav
              aria-label="Footer links"
              className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground md:gap-x-6"
            >
              {FOOTER_LINK_KEYS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-primary"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <Link
              href="/contact"
              aria-label={t("footer.demo")}
              className="rounded-full border border-primary/25 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              {t("footer.demo")}
            </Link>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-4 md:flex-row">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t("footer.language")}
            </p>
            <LanguageSelector />
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-6">
            {MR5_CONTACT.phones.map((phone) => (
              <a
                key={phone.id}
                href={telHref(phone.e164)}
                className="inline-flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {formatPhoneDisplay(phone.e164)}
              </a>
            ))}
            <a
              href={`mailto:${MR5_CONTACT.email}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {MR5_CONTACT.email}
            </a>
            <a
              href={mapsHref(MR5_CONTACT.address.mapsQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {MR5_CONTACT.address.line1}, {MR5_CONTACT.address.line2}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-[10px] text-muted-foreground md:flex-row">
        <div>
          © {year} MR5 School. {t("footer.rights")}
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="transition-colors hover:text-foreground">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            {t("footer.privacy")}
          </Link>
          <Link href="/accessibility" className="transition-colors hover:text-foreground">
            {t("footer.accessibility")}
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-3xl px-4">
        <ModelCreditNotice variant="footer" />
      </div>
    </footer>
  );
}
