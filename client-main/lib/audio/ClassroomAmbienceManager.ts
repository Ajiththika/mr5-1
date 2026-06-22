import { getAudioEngine } from "./AudioEngine";
import { getAudioSettingsStore } from "./AudioSettingsStore";

/** Primary school classroom chatter — Freesound community (Birmingham UK). */
export const CLASSROOM_AMBIENCE_URL = "/assets/sounds/classroom-ambience.mp3";

const FADE_SPEED = 4.5;

/** Volume at fully closed curtains (muffled / distant chatter). */
const CLOSED_VOLUME_MUL = 0.22;
/** Volume at fully open curtains (clearer classroom ambience). */
const OPEN_VOLUME_MUL = 1;

function curtainVolumeMultiplier(openness: number): number {
  const open = Math.max(0, Math.min(1, openness));
  // Ease-in so small opens still feel noticeably brighter
  const t = Math.pow(open, 0.75);
  return CLOSED_VOLUME_MUL + t * (OPEN_VOLUME_MUL - CLOSED_VOLUME_MUL);
}

export class ClassroomAmbienceManager {
  private audio: HTMLAudioElement | null = null;
  private gain: GainNode | null = null;
  private muffler: BiquadFilterNode | null = null;
  private ready = false;
  private disposed = false;
  private playing = false;
  private curtainOpenness = 0.65;

  constructor(url = CLASSROOM_AMBIENCE_URL) {
    if (typeof window === "undefined") return;
    this.init(url);
  }

  private init(url: string): void {
    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    this.audio = audio;

    const ctx = getAudioEngine().getContext();
    if (ctx) {
      try {
        const source = ctx.createMediaElementSource(audio);
        this.muffler = ctx.createBiquadFilter();
        this.muffler.type = "lowpass";
        this.muffler.frequency.value = 3200;
        this.muffler.Q.value = 0.7;

        this.gain = ctx.createGain();
        this.gain.gain.value = 0;
        source.connect(this.muffler);
        this.muffler.connect(this.gain);
        this.gain.connect(ctx.destination);
      } catch {
        this.gain = null;
        this.muffler = null;
      }
    }

    audio.addEventListener("canplaythrough", () => {
      this.ready = true;
    });

    audio.addEventListener("error", () => {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[ClassroomAmbience] Could not load classroom-ambience.mp3 from /assets/sounds/",
        );
      }
    });
  }

  setCurtainOpenness(openness: number): void {
    this.curtainOpenness = Math.max(0, Math.min(1, openness));
  }

  update(delta: number): void {
    const settings = getAudioSettingsStore().get();
    const curtainMul = curtainVolumeMultiplier(this.curtainOpenness);
    const target =
      settings.classAmbience && !settings.muted
        ? getAudioSettingsStore().effectiveVolume(settings.classAmbienceVolume) * curtainMul
        : 0;

    const fade = 1 - Math.exp(-FADE_SPEED * delta);

    if (this.muffler) {
      // Closed curtains = muffled; open = full brightness
      const open = Math.max(0, Math.min(1, this.curtainOpenness));
      const cutoff = 900 + Math.pow(open, 0.8) * 5600;
      this.muffler.frequency.value += (cutoff - this.muffler.frequency.value) * fade;
    }

    if (this.gain) {
      this.gain.gain.value += (target - this.gain.gain.value) * fade;
    } else if (this.audio) {
      this.audio.volume += (target - this.audio.volume) * fade;
    }

    const current = this.gain?.gain.value ?? this.audio?.volume ?? 0;

    if (target > 0.008 && current > 0.005) {
      void this.ensurePlaying();
    } else if (target <= 0.008 && current < 0.01) {
      this.pause();
    }
  }

  private async ensurePlaying(): Promise<void> {
    const audio = this.audio;
    if (!audio || !this.ready || this.disposed || this.playing) return;

    try {
      await getAudioEngine().unlock();
      await audio.play();
      this.playing = true;
    } catch {
      /* autoplay blocked until user gesture */
    }
  }

  private pause(): void {
    const audio = this.audio;
    if (!audio || !this.playing) return;
    audio.pause();
    this.playing = false;
  }

  dispose(): void {
    if (!this.audio || this.disposed) return;
    this.disposed = true;
    try {
      this.audio.pause();
      this.audio.src = "";
    } catch {
      /* ignore */
    }
    this.gain?.disconnect();
    this.muffler?.disconnect();
    this.audio = null;
    this.gain = null;
    this.muffler = null;
    this.playing = false;
  }
}
