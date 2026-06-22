"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/hooks/useAudio";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

export function AudioSettingsPanel({ compact = false }: { compact?: boolean }) {
  const { settings, updateSettings, resetSettings, play } = useAudio();

  const toggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
    if (value) play("TOGGLE");
  };

  return (
    <div className={`space-y-4 ${compact ? "text-sm" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {settings.muted ? <VolumeX className="h-4 w-4 text-muted-foreground" /> : <Volume2 className="h-4 w-4 text-primary" />}
          <Label htmlFor="audio-master">Master mute</Label>
        </div>
        <Switch
          id="audio-master"
          checked={!settings.muted}
          onCheckedChange={(checked) => {
            updateSettings({ muted: !checked });
            if (checked) play("TOGGLE");
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="master-volume">Master volume ({Math.round(settings.masterVolume * 100)}%)</Label>
        <input
          id="master-volume"
          type="range"
          min={0}
          max={100}
          value={Math.round(settings.masterVolume * 100)}
          onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) / 100 })}
          className="w-full accent-primary"
        />
      </div>

      {settings.classAmbience && (
        <div className="space-y-2 pl-1 border-l-2 border-primary/20">
          <Label htmlFor="class-ambience-volume">
            Class ambience volume ({Math.round(settings.classAmbienceVolume * 100)}%)
          </Label>
          <input
            id="class-ambience-volume"
            type="range"
            min={5}
            max={50}
            value={Math.round(settings.classAmbienceVolume * 100)}
            onChange={(e) => updateSettings({ classAmbienceVolume: Number(e.target.value) / 100 })}
            className="w-full accent-primary"
          />
        </div>
      )}

      {(
        [
          ["buttonSounds", "Button sounds"],
          ["uiSounds", "UI sounds"],
          ["notificationSounds", "Notifications"],
          ["fanSound", "Classroom fan"],
          ["classAmbience", "Class ambience"],
          ["bellSounds", "Class bell"],
          ["voiceFeedback", "Voice feedback"],
          ["reducedAudio", "Reduced audio (accessibility)"],
          ["lowBandwidth", "Low bandwidth mode"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <Label htmlFor={`audio-${key}`}>{label}</Label>
          <Switch
            id={`audio-${key}`}
            checked={Boolean(settings[key])}
            onCheckedChange={(checked) => toggle(key, checked)}
          />
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            play("SUCCESS");
          }}
        >
          Preview sound
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={resetSettings}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
