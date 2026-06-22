import { getAudioSettingsStore } from "./AudioSettingsStore";
import { getSoundDef } from "./proceduralSounds";
import type { SoundCategory } from "./types";

const MIN_INTERVAL_MS = 45;
const CATEGORY_COOLDOWN_MS: Partial<Record<SoundCategory, number>> = {
  BUTTON_PRIMARY: 55,
  BUTTON_SECONDARY: 55,
  TOGGLE: 70,
  NAVIGATION: 80,
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private unlocked = false;
  private lastGlobalPlay = 0;
  private lastCategoryPlay = new Map<SoundCategory, number>();

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  async unlock(): Promise<void> {
    if (typeof window === "undefined" || this.unlocked) return;
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    this.unlocked = true;
  }

  getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      return this.ensureContext();
    } catch {
      return null;
    }
  }

  getMasterGain(): GainNode | null {
    this.ensureContext();
    return this.masterGain;
  }

  setMasterVolume(volume: number): void {
    const store = getAudioSettingsStore();
    store.update({ masterVolume: Math.max(0, Math.min(1, volume)) });
    this.applyMasterGain();
  }

  setMuted(muted: boolean): void {
    getAudioSettingsStore().update({ muted });
    this.applyMasterGain();
  }

  applyMasterGain(): void {
    if (!this.masterGain) return;
    const vol = getAudioSettingsStore().effectiveVolume(1);
    this.masterGain.gain.setTargetAtTime(vol, this.getContext()!.currentTime, 0.02);
  }

  playOneShot(category: SoundCategory): boolean {
    const settings = getAudioSettingsStore().get();
    if (settings.muted) return false;

    const isButton =
      category === "BUTTON_PRIMARY" ||
      category === "BUTTON_SECONDARY" ||
      category === "TOGGLE" ||
      category === "NAVIGATION" ||
      category === "LANGUAGE_SWITCH" ||
      category === "CHAT_OPEN" ||
      category === "CARD_OPEN";

    if (isButton && !settings.buttonSounds && !settings.uiSounds) return false;
    if (category.startsWith("NOTIFICATION_") && !settings.notificationSounds) return false;
    if (category === "CLASS_BELL" && !settings.bellSounds) return false;
    if (category === "REWARD" && !settings.uiSounds) return false;

    const now = performance.now();
    const categoryCooldown = CATEGORY_COOLDOWN_MS[category] ?? MIN_INTERVAL_MS;
    const lastCat = this.lastCategoryPlay.get(category) ?? 0;
    if (now - this.lastGlobalPlay < MIN_INTERVAL_MS || now - lastCat < categoryCooldown) {
      return false;
    }

    const ctx = this.getContext();
    const dest = this.masterGain;
    if (!ctx || !dest) return false;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const def = getSoundDef(category);
    const volume = getAudioSettingsStore().effectiveVolume(def.baseVolume);
    if (volume <= 0.001) return false;

    try {
      def.play(ctx, dest, volume);
      this.lastGlobalPlay = now;
      this.lastCategoryPlay.set(category, now);
      return true;
    } catch {
      return false;
    }
  }

  dispose(): void {
    void this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.unlocked = false;
  }

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      throw new Error("Web Audio API unavailable");
    }
    this.ctx = new Ctx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.applyMasterGain();
    getAudioSettingsStore().subscribe(() => this.applyMasterGain());
    return this.ctx;
  }
}

let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) engineInstance = new AudioEngine();
  return engineInstance;
}
