"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUIPreferences } from "@/contexts/UIPreferencesContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Moon,
  Sun,
  Laptop,
  Palette,
  Check,
  RotateCcw,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Laptop, label: "System" },
] as const;

type ThemeMode = (typeof MODES)[number]["value"];

/**
 * Appearance: theme mode, color variants, and accessibility toggles.
 */
export function ThemeCustomizer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const {
    preferences,
    themes,
    activeTheme,
    setTheme: setColorVariant,
    resetToDefaults,
    updatePreferences,
  } = useUIPreferences();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleModeChange = (mode: ThemeMode) => {
    setTheme(mode);
    updatePreferences({ darkMode: mode });
  };

  const handleReset = () => {
    resetToDefaults();
    setTheme("system");
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled aria-label="Appearance">
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const previewGradient = activeTheme
    ? `linear-gradient(135deg, ${activeTheme.gradientFrom}, ${activeTheme.gradientTo})`
    : "linear-gradient(135deg, oklch(var(--primary)), oklch(var(--primary) / 0.7))";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 data-[state=open]:bg-muted"
          aria-label="Appearance settings"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[340px] p-0 overflow-hidden">
        {/* Live preview strip */}
        <div
          className="h-14 px-4 flex items-end pb-2 border-b border-border"
          style={{ background: previewGradient }}
        >
          <p className="text-xs font-semibold text-white drop-shadow-md">
            {activeTheme?.name ?? "Custom"} · {resolvedTheme === "light" ? "Light" : resolvedTheme === "dark" ? "Dark" : "Auto"}
          </p>
        </div>

        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Appearance</p>
              <p className="text-xs text-muted-foreground">Mode, color & comfort</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((mode) => (
                <Button
                  key={mode.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex flex-col gap-1 h-auto py-2.5",
                    theme === mode.value && "border-primary bg-primary/10 text-primary font-medium",
                  )}
                  onClick={() => handleModeChange(mode.value)}
                >
                  <mode.icon className="h-4 w-4" />
                  <span className="text-[10px]">{mode.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Color variant
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((variant) => {
                const selected = activeTheme?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setColorVariant(variant.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-muted/50",
                    )}
                  >
                    <span
                      className="h-9 w-9 shrink-0 rounded-lg shadow-inner"
                      style={{
                        background: `linear-gradient(135deg, ${variant.gradientFrom}, ${variant.gradientTo})`,
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium truncate">{variant.name}</span>
                      {selected && (
                        <span className="flex items-center gap-0.5 text-[10px] text-primary">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Reduce motion</p>
                  <p className="text-xs text-muted-foreground">Calmer UI</p>
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
                  <p className="text-sm font-medium">Compact layout</p>
                  <p className="text-xs text-muted-foreground">More on screen</p>
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
