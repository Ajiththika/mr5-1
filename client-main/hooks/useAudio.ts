"use client";

import { useAudioContext } from "@/contexts/AudioContext";
import type { SoundCategory, VoiceEvent } from "@/lib/audio";

export function useAudio() {
  const { settings, updateSettings, resetSettings, play, playNotification, speak, unlock, isUnlocked } =
    useAudioContext();

  return {
    settings,
    updateSettings,
    resetSettings,
    play,
    playNotification,
    speak,
    unlock,
    isUnlocked,
    playClick: () => play("BUTTON_PRIMARY"),
    playToggle: () => play("TOGGLE"),
    playNav: () => play("NAVIGATION"),
    playReward: () => play("REWARD"),
    playBell: () => play("CLASS_BELL"),
    playChatOpen: () => play("CHAT_OPEN"),
    playLanguageSwitch: () => play("LANGUAGE_SWITCH"),
  };
}

export function useSoundOnClick(category: SoundCategory = "BUTTON_PRIMARY") {
  const { play } = useAudio();
  return () => play(category);
}

export function useVoiceFeedback() {
  const { speak, settings } = useAudio();
  return {
    speak,
    enabled: settings.voiceFeedback,
    welcomeBack: () => speak("welcome_back"),
    classStarted: () => speak("class_started"),
    taskCompleted: () => speak("task_completed"),
    challengeCompleted: () => speak("challenge_completed"),
  };
}
