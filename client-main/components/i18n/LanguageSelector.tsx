"use client";

import { SUPPORTED_LOCALES, type LocaleCode } from "@/lib/i18n/config";
import { useTranslation } from "@/hooks/useTranslation";
import { useAudio } from "@/hooks/useAudio";

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ compact = false, className = "" }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useTranslation();
  const { playLanguageSwitch } = useAudio();

  const handleSelect = (code: LocaleCode) => {
    if (code !== locale) {
      playLanguageSwitch();
      setLocale(code);
    }
  };

  if (compact) {
    return (
      <select
        aria-label={t("footer.language")}
        value={locale}
        onChange={(e) => handleSelect(e.target.value as LocaleCode)}
        className={`cursor-pointer rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-blue-100 outline-none hover:border-sky-400/30 ${className}`}
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item.code} value={item.code} className="bg-slate-900">
            {item.nativeLabel}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {SUPPORTED_LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => handleSelect(item.code)}
          aria-pressed={locale === item.code}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
            locale === item.code
              ? "bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/30"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          {item.nativeLabel}
        </button>
      ))}
    </div>
  );
}
