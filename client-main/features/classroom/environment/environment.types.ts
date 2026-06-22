import type { DerivedEnvironment, WeatherSnapshot } from "@/lib/classroom-environment";

export type FanSpeedLevel = "OFF" | "LOW" | "MEDIUM" | "HIGH" | "AUTO";

export type RoomMood =
  | "cozy"
  | "neutral"
  | "warm"
  | "cool"
  | "stuffy"
  | "fresh"
  | "breezy";

export interface ComputedEnvironment {
  fanIntensity: number;
  roomComfort: number;
  sunIntensity: number;
  curtainStrength: number;
  roomMood: RoomMood;
  comfortLabel: string;
}

export interface EnvironmentInputs {
  weather: WeatherSnapshot;
  derived: DerivedEnvironment;
}

export interface SmoothEnvironmentSnapshot extends ComputedEnvironment {
  timestamp: number;
}
