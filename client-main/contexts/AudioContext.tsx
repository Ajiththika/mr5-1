"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAudioEngine,
  getAudioSettingsStore,
  getBrandSoundManager,
  getVoiceFeedbackManager,
  type AudioSettings,
  type FanEnvironmentInput,
  type SoundCategory,
  type VoiceEvent,
} from "@/lib/audio";

interface AudioContextValue {
  settings: AudioSettings;
  updateSettings: (partial: Partial<AudioSettings>) => void;
  resetSettings: () => void;
  play: (category: SoundCategory) => boolean;
  playNotification: (type: "info" | "success" | "warning" | "error") => boolean;
  speak: (event: VoiceEvent, override?: string) => void;
  setFanEnvironment: (input: FanEnvironmentInput) => void;
  unlock: () => Promise<void>;
  isUnlocked: boolean;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(() => getAudioSettingsStore().get());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const fanEnvRef = React.useRef<FanEnvironmentInput>({});

  useEffect(() => {
    return getAudioSettingsStore().subscribe(setSettings);
  }, []);

  useEffect(() => {
    const unlock = () => {
      void getAudioEngine()
        .unlock()
        .then(() => setIsUnlocked(true));
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const updateSettings = useCallback((partial: Partial<AudioSettings>) => {
    getAudioSettingsStore().update(partial);
    getAudioEngine().applyMasterGain();
  }, []);

  const resetSettings = useCallback(() => {
    getAudioSettingsStore().reset();
    getAudioEngine().applyMasterGain();
  }, []);

  const play = useCallback((category: SoundCategory) => {
    return getBrandSoundManager().play(category);
  }, []);

  const playNotification = useCallback((type: "info" | "success" | "warning" | "error") => {
    return getBrandSoundManager().playNotification(type);
  }, []);

  const speak = useCallback((event: VoiceEvent, override?: string) => {
    getVoiceFeedbackManager().speak(event, override);
  }, []);

  const setFanEnvironment = useCallback((input: FanEnvironmentInput) => {
    fanEnvRef.current = input;
  }, []);

  const unlock = useCallback(async () => {
    await getAudioEngine().unlock();
    setIsUnlocked(true);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      play,
      playNotification,
      speak,
      setFanEnvironment,
      unlock,
      isUnlocked,
    }),
    [settings, updateSettings, resetSettings, play, playNotification, speak, setFanEnvironment, unlock, isUnlocked],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudioContext(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error("useAudioContext must be used within AudioProvider");
  }
  return ctx;
}
