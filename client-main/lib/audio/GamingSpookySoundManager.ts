import { getAudioEngine } from "./AudioEngine";
import { getAudioSettingsStore } from "./AudioSettingsStore";

export const ZOMBIE_AMBIENT_URL = "/assets/sounds/zombie-ambient.mp3";
export const ZOMBIE_SCREECH_URL = "/assets/sounds/zombie-screech.mp3";

const FADE_SPEED = 5;

/** Looping spooky ambience during gaming rest (Pixabay + community SFX). */
export class GamingSpookySoundManager {
  private ambient: HTMLAudioElement | null = null;
  private screech: HTMLAudioElement | null = null;
  private gain: GainNode | null = null;
  private ambientReady = false;
  private ambientPlaying = false;
  private active = false;
  private disposed = false;

  constructor() {
    if (typeof window === "undefined") return;
    this.init();
  }

  private init(): void {
    const ambient = new Audio(ZOMBIE_AMBIENT_URL);
    ambient.loop = true;
    ambient.preload = "auto";
    this.ambient = ambient;

    const screech = new Audio(ZOMBIE_SCREECH_URL);
    screech.preload = "auto";
    this.screech = screech;

    const ctx = getAudioEngine().getContext();
    if (ctx) {
      try {
        const source = ctx.createMediaElementSource(ambient);
        this.gain = ctx.createGain();
        this.gain.gain.value = 0;
        source.connect(this.gain);
        this.gain.connect(ctx.destination);
      } catch {
        this.gain = null;
      }
    }

    ambient.addEventListener("canplaythrough", () => {
      this.ambientReady = true;
    });
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  update(delta: number): void {
    const settings = getAudioSettingsStore().get();
    const target =
      this.active && settings.classAmbience && !settings.muted
        ? getAudioSettingsStore().effectiveVolume(settings.classAmbienceVolume) * 0.42
        : 0;

    const fade = 1 - Math.exp(-FADE_SPEED * delta);

    if (this.gain) {
      this.gain.gain.value += (target - this.gain.gain.value) * fade;
    } else if (this.ambient) {
      this.ambient.volume += (target - this.ambient.volume) * fade;
    }

    const current = this.gain?.gain.value ?? this.ambient?.volume ?? 0;
    if (target > 0.01 && current > 0.005) {
      void this.ensureAmbientPlaying();
    } else if (target < 0.01 && current < 0.008) {
      this.pauseAmbient();
    }
  }

  async playScreech(): Promise<void> {
    const screech = this.screech;
    if (!screech || this.disposed) return;
    const settings = getAudioSettingsStore().get();
    if (settings.muted) return;

    try {
      await getAudioEngine().unlock();
      screech.currentTime = 0;
      screech.volume = getAudioSettingsStore().effectiveVolume(0.55);
      await screech.play();
    } catch {
      /* autoplay blocked */
    }
  }

  private async ensureAmbientPlaying(): Promise<void> {
    const audio = this.ambient;
    if (!audio || !this.ambientReady || this.disposed || this.ambientPlaying) return;
    try {
      await getAudioEngine().unlock();
      await audio.play();
      this.ambientPlaying = true;
    } catch {
      /* wait for gesture */
    }
  }

  private pauseAmbient(): void {
    const audio = this.ambient;
    if (!audio || !this.ambientPlaying) return;
    audio.pause();
    this.ambientPlaying = false;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.ambient?.pause();
    this.screech?.pause();
    this.gain?.disconnect();
    this.ambient = null;
    this.screech = null;
    this.gain = null;
  }
}

let instance: GamingSpookySoundManager | null = null;

export function getGamingSpookySoundManager(): GamingSpookySoundManager {
  if (!instance) instance = new GamingSpookySoundManager();
  return instance;
}
