import type { TimePeriod } from "@/lib/classroom-environment";
import type { WeatherSnapshot } from "@/lib/classroom-environment";
import type { RoomMood } from "./environment.types";

const IDEAL_TEMP = 24;
const IDEAL_HUMIDITY = 48;

export interface ComfortResult {
  roomComfort: number;
  roomMood: RoomMood;
  comfortLabel: string;
}

export function calculateComfort(
  weather: WeatherSnapshot,
  timePeriod: TimePeriod,
): ComfortResult {
  const tempDelta = Math.abs(weather.temperature - IDEAL_TEMP);
  const humidityDelta = Math.abs(weather.humidity - IDEAL_HUMIDITY);

  let comfort = 100 - tempDelta * 3.2 - humidityDelta * 0.35;
  if (weather.windSpeed > 10) comfort -= 8;
  if (weather.windSpeed >= 4 && weather.windSpeed <= 8) comfort += 4;
  if (timePeriod === "afternoon" && weather.temperature > 28) comfort -= 10;
  if (timePeriod === "night") comfort += 3;

  comfort = Math.round(Math.max(12, Math.min(98, comfort)));

  let roomMood: RoomMood = "neutral";
  let comfortLabel = "Comfortable";

  if (comfort >= 82) {
    roomMood = weather.windSpeed >= 4 ? "breezy" : "fresh";
    comfortLabel = "Fresh & comfortable";
  } else if (comfort >= 68) {
    roomMood = "cozy";
    comfortLabel = "Cozy classroom";
  } else if (weather.temperature >= 30) {
    roomMood = "warm";
    comfortLabel = "Warm — fan recommended";
  } else if (weather.temperature <= 14) {
    roomMood = "cool";
    comfortLabel = "Cool & crisp";
  } else if (weather.humidity >= 72) {
    roomMood = "stuffy";
    comfortLabel = "Humid — needs airflow";
  } else {
    roomMood = "neutral";
    comfortLabel = "Moderate comfort";
  }

  return { roomComfort: comfort, roomMood, comfortLabel };
}
