"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useUIPreferences } from "@/contexts/UIPreferencesContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Moon,
  Sun,
  Laptop,
  Palette,
  Check,
  RotateCcw,
  Zap,
  LayoutGrid,
  Sparkles,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Laptop, label: "System" },
] as const;

type ThemeMode = (typeof MODES)[number]["value"];

const COLLAPSED_SWATCH_COUNT = 5;

/**
 * Appearance: theme mode, accent colors, font scale, and accessibility toggles.
 */
export function ThemeCustomizer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const {
    preferences,
    themes,
    activeTheme,
    setTheme: setColorVariant,
    setCustomColor,
    resetToDefaults,
    updatePreferences,
  } = useUIPreferences();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [customHex, setCustomHex] = useState(
    activeTheme?.preview.primary?.replace("#", "") ?? "3B82F6",
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (activeTheme?.preview.primary) {
      setCustomHex(activeTheme.preview.primary.replace("#", ""));
    }
  }, [activeTheme?.preview.primary]);

  const visibleThemes = useMemo(
    () => (showAllColors ? themes : themes.slice(0, COLLAPSED_SWATCH_COUNT)),
    [showAllColors, themes],
  );

  const handleModeChange = (mode: ThemeMode) => {
    setTheme(mode);
    updatePreferences({ darkMode: mode });
  };

  const handleReset = () => {
    resetToDefaults();
    setTheme("system");
    setCustomHex("3B82F6");
    setShowAllColors(false);
  };

  const handleApplyCustomColor = () => {
    const normalized = customHex.trim().replace("#", "");
    if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) return;
    setCustomColor(`#${normalized}`);
  };

  const fontScalePercent = Math.round(preferences.fontScale * 100);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0"
        disabled
        aria-label="Appearance"
      >
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const previewGradient = activeTheme
    ? `linear-gradient(135deg, ${activeTheme.gradientFrom}, ${activeTheme.gradientTo})`
    : preferences.customPrimary
      ? `hsl(${preferences.customPrimary.h} ${preferences.customPrimary.s}% ${preferences.customPrimary.l}%)`
      : "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--primary) / 0.7))";

  const accentLabel = activeTheme?.name ?? "Custom";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-10 w-10 shrink-0 border-border/80 bg-card/80 shadow-sm transition-all",
            "hover:border-primary/40 hover:bg-primary/5",
            open && "border-primary/50 bg-primary/10 ring-2 ring-primary/20",
          )}
          aria-label="Appearance settings"
        >
          <Palette className="h-[18px] w-[18px]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-1.5rem),400px)] overflow-hidden p-0"
      >
        <div
          className="flex h-16 items-end border-b border-border/60 px-4 pb-2.5"
          style={{ background: previewGradient }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-white drop-shadow-md">
            {accentLabel} · {resolvedTheme === "light" ? "Light" : resolvedTheme === "dark" ? "Dark" : "Auto"}
          </p>
        </div>

        <div className="max-h-[min(70vh,560px)] space-y-5 overflow-y-auto p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Appearance</p>
              <p className="text-xs text-muted-foreground">Theme, accent & comfort</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Mode
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((mode) => (
                <Button
                  key={mode.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-auto flex-col gap-1.5 py-3",
                    theme === mode.value && "border-primary bg-primary/10 font-medium text-primary",
                  )}
                  onClick={() => handleModeChange(mode.value)}
                >
                  <mode.icon className="h-4 w-4" />
                  <span className="text-[11px]">{mode.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Accent color
              </Label>
              <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                {accentLabel}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {visibleThemes.map((variant) => {
                const selected = activeTheme?.id === variant.id;
                return (
                  <button
                    key={`lg-${variant.id}`}
                    type="button"
                    title={variant.name}
                    onClick={() => setColorVariant(variant.id)}
                    className={cn(
                      "relative aspect-square w-full rounded-xl border-2 transition-all",
                      selected
                        ? "border-white ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${variant.gradientFrom}, ${variant.gradientTo})`,
                    }}
                  >
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {visibleThemes.map((variant) => {
                const selected = activeTheme?.id === variant.id;
                return (
                  <button
                    key={`sm-${variant.id}`}
                    type="button"
                    title={variant.name}
                    onClick={() => setColorVariant(variant.id)}
                    className={cn(
                      "mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                      selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40",
                    )}
                    style={{ backgroundColor: variant.preview.primary }}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>

            {themes.length > COLLAPSED_SWATCH_COUNT && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-full text-xs text-muted-foreground"
                onClick={() => setShowAllColors((value) => !value)}
              >
                {showAllColors ? "Show less" : `Show ${themes.length - COLLAPSED_SWATCH_COUNT} more`}
              </Button>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
            <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Palette className="h-3.5 w-3.5" />
              Custom color
            </Label>
            <div className="flex items-center gap-2">
              <span
                className="h-10 w-10 shrink-0 rounded-lg border border-border shadow-inner"
                style={{
                  backgroundColor: /^[0-9A-Fa-f]{6}$/.test(customHex)
                    ? `#${customHex}`
                    : activeTheme?.preview.primary ?? "#3B82F6",
                }}
              />
              <div className="flex min-w-0 flex-1 items-center rounded-lg border border-border bg-background px-2">
                <span className="text-sm text-muted-foreground">#</span>
                <Input
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6))}
                  className="h-9 border-0 bg-transparent px-1 font-mono text-sm shadow-none focus-visible:ring-0"
                  aria-label="Custom accent hex color"
                />
              </div>
              <Button type="button" size="sm" className="h-9 shrink-0 px-3" onClick={handleApplyCustomColor}>
                Apply
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Type className="h-3.5 w-3.5" />
                Font size ({fontScalePercent}%)
              </Label>
            </div>
            <input
              type="range"
              min={85}
              max={125}
              step={5}
              value={fontScalePercent}
              onChange={(e) =>
                updatePreferences({ fontScale: Number(e.target.value) / 100 })
              }
              className="h-2 w-full cursor-pointer accent-primary"
              aria-label="Font size scale"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Small</span>
              <span>Default</span>
              <span>Large</span>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Accessibility
            </Label>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Reduce motion</p>
                  <p className="text-xs text-muted-foreground">Disable animations</p>
                </div>
              </div>
              <Switch
                checked={preferences.reduceMotion}
                onCheckedChange={(checked) => updatePreferences({ reduceMotion: checked })}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Compact mode</p>
                  <p className="text-xs text-muted-foreground">Denser UI layout</p>
                </div>
              </div>
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={(checked) => updatePreferences({ compactMode: checked })}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
