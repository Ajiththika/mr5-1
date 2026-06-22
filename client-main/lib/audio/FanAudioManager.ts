import { getAudioEngine } from "./AudioEngine";
import { getAudioSettingsStore } from "./AudioSettingsStore";
import type { FanEnvironmentInput } from "./types";

const DEFAULT_URL = "/assets/sounds/fan-blowing.mp3";

export class FanAudioManager {
  private audio: HTMLAudioElement | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private motorGain: GainNode | null = null;
  private airGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private motorFilter: BiquadFilterNode | null = null;
  private airFilter: BiquadFilterNode | null = null;
  private ready = false;
  private disposed = false;
  private envInput: FanEnvironmentInput = {};

  constructor(url = DEFAULT_URL) {
    if (typeof window === "undefined") return;
    this.init(url);
  }

  setEnvironment(input: FanEnvironmentInput): void {
    this.envInput = input;
  }

  private init(url: string): void {
    if (typeof window === "undefined") return;

    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.volume = 1;
    this.audio = audio;

    const ctx = getAudioEngine().getContext();
    if (ctx) {
      try {
        this.source = ctx.createMediaElementSource(audio);
        this.motorFilter = ctx.createBiquadFilter();
        this.motorFilter.type = "lowpass";
        this.motorFilter.frequency.value = 420;

        this.airFilter = ctx.createBiquadFilter();
        this.airFilter.type = "highpass";
        this.airFilter.frequency.value = 900;

        this.motorGain = ctx.createGain();
        this.airGain = ctx.createGain();
        this.ambientGain = ctx.createGain();

        this.motorGain.gain.value = 0;
        this.airGain.gain.value = 0;
        this.ambientGain.gain.value = 0;

        this.source.connect(this.motorFilter);
        this.motorFilter.connect(this.motorGain);
        this.motorGain.connect(ctx.destination);

        this.source.connect(this.airFilter);
        this.airFilter.connect(this.airGain);
        this.airGain.connect(ctx.destination);

        this.source.connect(this.ambientGain);
        this.ambientGain.connect(ctx.destination);
      } catch {
        this.source = null;
        this.motorGain = null;
        this.airGain = null;
        this.ambientGain = null;
      }
    }

    audio.addEventListener("canplaythrough", () => {
      this.ready = true;
    });
  }

  update(speedNormalized: number, delta: number): void {
    const settings = getAudioSettingsStore().get();
    if (!settings.fanSound || settings.muted) {
      this.fadeAllToZero(delta);
      return;
    }

    const audio = this.audio;
    if (!audio || !this.ready || this.disposed) return;

    const clamped = Math.max(0, Math.min(1, speedNormalized));
    const envBoost = this.computeEnvironmentBoost();
    const effectiveSpeed = Math.min(1, clamped * envBoost);

    const targetRate = 0.68 + effectiveSpeed * 0.82;
    const motorVol = effectiveSpeed * 0.38 * getAudioSettingsStore().effectiveVolume(1);
    const airVol = effectiveSpeed * 0.28 * getAudioSettingsStore().effectiveVolume(1);
    const ambientVol = effectiveSpeed * 0.08 * getAudioSettingsStore().effectiveVolume(1);

    const fade = 1 - Math.exp(-5.5 * delta);

    if (this.motorGain && this.airGain && this.ambientGain) {
      if (effectiveSpeed > 0.02) {
        if (audio.paused) void audio.play().catch(() => undefined);
        audio.playbackRate += (targetRate - audio.playbackRate) * fade;
        this.motorGain.gain.value += (motorVol - this.motorGain.gain.value) * fade;
        this.airGain.gain.value += (airVol - this.airGain.gain.value) * fade;
        this.ambientGain.gain.value += (ambientVol - this.ambientGain.gain.value) * fade;
      } else {
        this.fadeAllToZero(delta);
      }
      return;
    }

    // Fallback without Web Audio graph
    const targetVolume = effectiveSpeed * 0.52;
    if (targetVolume > 0.025) {
      if (audio.paused) void audio.play().catch(() => undefined);
      audio.volume += (targetVolume - audio.volume) * fade;
      audio.playbackRate += (targetRate - audio.playbackRate) * fade;
    } else {
      audio.volume += (0 - audio.volume) * fade;
      if (audio.volume < 0.02) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      }
    }
  }

  dispose(): void {
    if (!this.audio || this.disposed) return;
    this.disposed = true;
    try {
      this.audio.pause();
      this.audio.src = "";
    } catch {
      /* ignore jsdom pause quirks */
    }
    this.source?.disconnect();
    this.motorGain?.disconnect();
    this.airGain?.disconnect();
    this.ambientGain?.disconnect();
    this.motorFilter?.disconnect();
    this.airFilter?.disconnect();
    this.audio = null;
  }

  private fadeAllToZero(delta: number): void {
    const audio = this.audio;
    if (!audio) return;
    const fade = 1 - Math.exp(-8 * delta);

    if (this.motorGain && this.airGain && this.ambientGain) {
      this.motorGain.gain.value += (0 - this.motorGain.gain.value) * fade;
      this.airGain.gain.value += (0 - this.airGain.gain.value) * fade;
      this.ambientGain.gain.value += (0 - this.ambientGain.gain.value) * fade;
      if (
        this.motorGain.gain.value < 0.01 &&
        this.airGain.gain.value < 0.01
      ) {
        audio.pause();
        audio.currentTime = 0;
      }
      return;
    }

    audio.volume += (0 - audio.volume) * fade;
    if (audio.volume < 0.02) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    }
  }

  private computeEnvironmentBoost(): number {
    const { temperature = 24, humidity = 50, comfort = 70 } = this.envInput;
    let boost = 1;
    if (temperature > 28) boost += (temperature - 28) * 0.015;
    if (humidity > 65) boost += (humidity - 65) * 0.004;
    if (comfort < 60) boost += (60 - comfort) * 0.008;
    return Math.min(1.35, boost);
  }
}
