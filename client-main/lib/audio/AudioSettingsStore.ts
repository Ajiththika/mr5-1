import type { AudioSettings } from "./types";
import { DEFAULT_AUDIO_SETTINGS } from "./types";

const STORAGE_KEY = "mr5-audio-settings";

export class AudioSettingsStore {
  private settings: AudioSettings;
  private listeners = new Set<(s: AudioSettings) => void>();

  constructor() {
    this.settings = { ...DEFAULT_AUDIO_SETTINGS };
    if (typeof window !== "undefined") {
      this.settings = this.load();
    }
  }

  get(): AudioSettings {
    return { ...this.settings };
  }

  update(partial: Partial<AudioSettings>): AudioSettings {
    this.settings = { ...this.settings, ...partial };
    this.persist();
    this.listeners.forEach((fn) => fn(this.get()));
    return this.get();
  }

  reset(): AudioSettings {
    this.settings = { ...DEFAULT_AUDIO_SETTINGS };
    this.persist();
    this.listeners.forEach((fn) => fn(this.get()));
    return this.get();
  }

  subscribe(listener: (s: AudioSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  effectiveVolume(categoryVolume = 1): number {
    if (this.settings.muted) return 0;
    const base = this.settings.masterVolume * categoryVolume;
    return this.settings.reducedAudio ? base * 0.45 : base;
  }

  private load(): AudioSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
      return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_AUDIO_SETTINGS };
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      /* ignore quota errors */
    }
  }
}

let storeInstance: AudioSettingsStore | null = null;

export function getAudioSettingsStore(): AudioSettingsStore {
  if (!storeInstance) storeInstance = new AudioSettingsStore();
  return storeInstance;
}
