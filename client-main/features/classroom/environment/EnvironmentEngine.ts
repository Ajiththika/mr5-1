import { lerp } from "@/lib/classroom-environment";
import type { EnvironmentInputs, ComputedEnvironment } from "./environment.types";
import { calculateComfort } from "./ComfortCalculator";

export function computeEnvironment(inputs: EnvironmentInputs): ComputedEnvironment {
  const { weather, derived } = inputs;
  const comfort = calculateComfort(weather, derived.timePeriod);

  const heatFactor = Math.max(0, (weather.temperature - 22) / 14);
  const humidityFactor = Math.max(0, (weather.humidity - 55) / 45);
  const windRelief = Math.min(0.25, weather.windSpeed * 0.02);
  const timeHeat =
    derived.timePeriod === "afternoon" ? 0.12 : derived.isNight ? -0.08 : 0;

  const fanIntensity = Math.max(
    0,
    Math.min(1, heatFactor * 0.55 + humidityFactor * 0.35 + timeHeat - windRelief),
  );

  const sunIntensity = Math.max(
    0.35,
    Math.min(1.25, derived.lighting.sunIntensity / 1.18),
  );

  const curtainStrength = Math.max(
    0.15,
    Math.min(1, weather.windSpeed / 10 + (derived.lighting.effects.wind ? 0.35 : 0)),
  );

  return {
    fanIntensity,
    roomComfort: comfort.roomComfort,
    sunIntensity,
    curtainStrength: curtainStrength,
    roomMood: comfort.roomMood,
    comfortLabel: comfort.comfortLabel,
  };
}

export function lerpComputedEnvironment(
  from: ComputedEnvironment,
  to: ComputedEnvironment,
  t: number,
): ComputedEnvironment {
  return {
    fanIntensity: lerp(from.fanIntensity, to.fanIntensity, t),
    roomComfort: Math.round(lerp(from.roomComfort, to.roomComfort, t)),
    sunIntensity: lerp(from.sunIntensity, to.sunIntensity, t),
    curtainStrength: lerp(from.curtainStrength, to.curtainStrength, t),
    roomMood: to.roomMood,
    comfortLabel: to.comfortLabel,
  };
}
