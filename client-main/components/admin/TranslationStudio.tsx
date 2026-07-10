"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LOCALES, type LocaleCode } from "@/lib/i18n/config";
import { loadTranslationOverrides, saveTranslationOverrides } from "@/lib/i18n/manager";
import { loadTranslations } from "@/lib/i18n/loader";
import { translations } from "@/lib/translations";
import { toast } from "sonner";

const SAMPLE_KEYS = [
  "nav.startLearning",
  "homepage.title",
  "homepage.subtitle",
  "classroom.aiTeacher",
  "footer.language",
];

export function TranslationStudio() {
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    loadTranslations(locale).then((messages) => {
      if (!active) return;
      const base = { ...(translations.en ?? {}), ...(messages ?? {}) };
      const overrides = loadTranslationOverrides();
      setEntries(base);
      setDrafts({ ...base, ...Object.fromEntries(Object.entries(overrides).filter(([key]) => base[key] !== undefined)) });
    });
    return () => {
      active = false;
    };
  }, [locale]);

  const preview = useMemo(() => {
    return SAMPLE_KEYS.map((key) => ({ key, value: drafts[key] ?? entries[key] ?? "" }));
  }, [drafts, entries]);

  const updateDraft = (key: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveChanges = () => {
    const overrides = Object.fromEntries(
      Object.entries(drafts).filter(([key, value]) => value && entries[key] !== undefined && value !== entries[key]),
    );
    saveTranslationOverrides(overrides);
    setSaved(true);
    toast.success("Translation overrides saved locally");
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">Translation Studio</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Update high-impact copy and preview localized UI text in-place.
          </p>
        </div>
        <Select value={locale} onValueChange={(value) => setLocale(value as LocaleCode)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LOCALES.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.flag} {item.nativeLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Preview</h3>
            <Button size="sm" onClick={saveChanges}>
              {saved ? "Saved" : "Save overrides"}
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {preview.map((item) => (
              <div key={item.key} className="rounded-lg border border-border/60 bg-background p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.key}</p>
                <Input
                  value={item.value}
                  onChange={(event) => updateDraft(item.key, event.target.value)}
                  placeholder="Enter translated text"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-background/70 p-4">
          <h3 className="mb-3 text-sm font-semibold">Translation notes</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Overrides are stored locally in the browser for fast testing.</li>
            <li>Connect this panel to your CMS or database later for production persistence.</li>
            <li>Use it to test tone, clarity, and region-specific phrasing.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
