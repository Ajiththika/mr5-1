import type { SoundCategory } from "./types";

type SoundDef = {
  category: SoundCategory;
  baseVolume: number;
  durationMs: number;
  play: (ctx: AudioContext, destination: AudioNode, volume: number) => void;
};

function env(gain: GainNode, ctx: AudioContext, peak: number, attack: number, release: number): void {
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);
}

function softClick(ctx: AudioContext, dest: AudioNode, volume: number, freq: number, release = 0.06): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.connect(gain);
  gain.connect(dest);
  env(gain, ctx, volume, 0.004, release);
  osc.start();
  osc.stop(ctx.currentTime + release + 0.02);
}

function sweep(ctx: AudioContext, dest: AudioNode, volume: number, from: number, to: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + 0.07);
  osc.connect(gain);
  gain.connect(dest);
  env(gain, ctx, volume, 0.005, 0.07);
  osc.start();
  osc.stop(now + 0.1);
}

function chime(ctx: AudioContext, dest: AudioNode, volume: number, freqs: number[], spacing = 0.07): void {
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * spacing);
    osc.connect(gain);
    gain.connect(dest);
    const start = ctx.currentTime + i * spacing;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume * (1 - i * 0.15), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
    osc.start(start);
    osc.stop(start + 0.24);
  });
}

function bell(ctx: AudioContext, dest: AudioNode, volume: number): void {
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    const peak = volume * (1 - i * 0.2);
    env(gain, ctx, peak, 0.01, 0.55 + i * 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.75);
  });
}

export const SOUND_REGISTRY: Record<SoundCategory, SoundDef> = {
  BUTTON_PRIMARY: {
    category: "BUTTON_PRIMARY",
    baseVolume: 0.14,
    durationMs: 70,
    play: (ctx, dest, vol) => softClick(ctx, dest, vol, 880, 0.055),
  },
  BUTTON_SECONDARY: {
    category: "BUTTON_SECONDARY",
    baseVolume: 0.1,
    durationMs: 60,
    play: (ctx, dest, vol) => softClick(ctx, dest, vol, 620, 0.05),
  },
  NAVIGATION: {
    category: "NAVIGATION",
    baseVolume: 0.08,
    durationMs: 90,
    play: (ctx, dest, vol) => sweep(ctx, dest, vol, 420, 720),
  },
  SUCCESS: {
    category: "SUCCESS",
    baseVolume: 0.12,
    durationMs: 280,
    play: (ctx, dest, vol) => chime(ctx, dest, vol, [660, 880, 1046]),
  },
  ERROR: {
    category: "ERROR",
    baseVolume: 0.09,
    durationMs: 120,
    play: (ctx, dest, vol) => softClick(ctx, dest, vol, 220, 0.1),
  },
  TOGGLE: {
    category: "TOGGLE",
    baseVolume: 0.11,
    durationMs: 65,
    play: (ctx, dest, vol) => softClick(ctx, dest, vol, 520, 0.045),
  },
  CARD_OPEN: {
    category: "CARD_OPEN",
    baseVolume: 0.09,
    durationMs: 100,
    play: (ctx, dest, vol) => sweep(ctx, dest, vol * 0.9, 380, 540),
  },
  NOTIFICATION_INFO: {
    category: "NOTIFICATION_INFO",
    baseVolume: 0.1,
    durationMs: 200,
    play: (ctx, dest, vol) => chime(ctx, dest, vol, [740]),
  },
  NOTIFICATION_SUCCESS: {
    category: "NOTIFICATION_SUCCESS",
    baseVolume: 0.11,
    durationMs: 260,
    play: (ctx, dest, vol) => chime(ctx, dest, vol, [587, 740]),
  },
  NOTIFICATION_WARNING: {
    category: "NOTIFICATION_WARNING",
    baseVolume: 0.1,
    durationMs: 220,
    play: (ctx, dest, vol) => chime(ctx, dest, vol, [440, 370]),
  },
  NOTIFICATION_ERROR: {
    category: "NOTIFICATION_ERROR",
    baseVolume: 0.09,
    durationMs: 140,
    play: (ctx, dest, vol) => softClick(ctx, dest, vol, 260, 0.09),
  },
  REWARD: {
    category: "REWARD",
    baseVolume: 0.13,
    durationMs: 350,
    play: (ctx, dest, vol) => chime(ctx, dest, vol, [523, 659, 784, 988], 0.06),
  },
  CLASS_BELL: {
    category: "CLASS_BELL",
    baseVolume: 0.16,
    durationMs: 800,
    play: (ctx, dest, vol) => bell(ctx, dest, vol),
  },
  CHAT_OPEN: {
    category: "CHAT_OPEN",
    baseVolume: 0.09,
    durationMs: 110,
    play: (ctx, dest, vol) => sweep(ctx, dest, vol, 500, 820),
  },
  LANGUAGE_SWITCH: {
    category: "LANGUAGE_SWITCH",
    baseVolume: 0.08,
    durationMs: 80,
    play: (ctx, dest, vol) => softClick(ctx, dest, vol, 700, 0.04),
  },
};

export function getSoundDef(category: SoundCategory): SoundDef {
  return SOUND_REGISTRY[category];
}
