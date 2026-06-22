import { getAudioSettingsStore } from "./AudioSettingsStore";
import type { VoiceEvent } from "./types";

const VOICE_SCRIPTS: Record<VoiceEvent, string> = {
  welcome_back: "Welcome back to MR5 School.",
  class_started: "Class is starting. Let's learn together.",
  task_completed: "Great work. Task completed.",
  challenge_completed: "Challenge complete. Well done.",
};

export class VoiceFeedbackManager {
  private speaking = false;

  speak(event: VoiceEvent, override?: string): void {
    const settings = getAudioSettingsStore().get();
    if (!settings.voiceFeedback || settings.muted || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const text = override ?? VOICE_SCRIPTS[event];
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = getAudioSettingsStore().effectiveVolume(0.85);
    utterance.onstart = () => {
      this.speaking = true;
    };
    utterance.onend = () => {
      this.speaking = false;
    };
    utterance.onerror = () => {
      this.speaking = false;
    };

    window.speechSynthesis.speak(utterance);
  }

  cancel(): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    this.speaking = false;
  }

  get isSpeaking(): boolean {
    return this.speaking;
  }
}

let voiceInstance: VoiceFeedbackManager | null = null;

export function getVoiceFeedbackManager(): VoiceFeedbackManager {
  if (!voiceInstance) voiceInstance = new VoiceFeedbackManager();
  return voiceInstance;
}
