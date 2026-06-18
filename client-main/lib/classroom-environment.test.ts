import {
  deriveEnvironment,
  getTimePeriod,
  mapConditionToTheme,
  lerpLighting,
} from "@/lib/classroom-environment";

describe("classroom-environment", () => {
  const baseWeather = {
    condition: "Clear",
    temperature: 24,
    humidity: 45,
    windSpeed: 2,
    city: "Test City",
  };

  it("maps morning hours to morning period", () => {
    expect(getTimePeriod(8)).toBe("morning");
    expect(getTimePeriod(14)).toBe("afternoon");
    expect(getTimePeriod(18)).toBe("evening");
    expect(getTimePeriod(22)).toBe("night");
  });

  it("maps weather conditions to themes", () => {
    expect(mapConditionToTheme("Thunderstorm", 20, 3)).toBe("thunderstorm");
    expect(mapConditionToTheme("Rain", 18, 2)).toBe("rainy");
    expect(mapConditionToTheme("Fog", 12, 1)).toBe("foggy");
    expect(mapConditionToTheme("Clear", 4, 2)).toBe("cold");
    expect(mapConditionToTheme("Clear", 20, 10)).toBe("windy");
  });

  it("derives rain effects for rainy weather", () => {
    const env = deriveEnvironment(
      { ...baseWeather, condition: "Rain" },
      14,
    );
    expect(env.theme).toBe("rainy");
    expect(env.lighting.effects.rain).toBe(true);
  });

  it("derives night ceiling lighting", () => {
    const env = deriveEnvironment(baseWeather, 23);
    expect(env.timePeriod).toBe("night");
    expect(env.lighting.ceilingIntensity).toBeGreaterThan(0.5);
  });

  it("honors developer overrides", () => {
    const env = deriveEnvironment(baseWeather, 14, "foggy", "evening");
    expect(env.theme).toBe("foggy");
    expect(env.timePeriod).toBe("evening");
    expect(env.lighting.effects.fog).toBe(true);
  });

  it("lerps lighting smoothly toward target", () => {
    const from = deriveEnvironment(baseWeather, 10).lighting;
    const to = deriveEnvironment(
      { ...baseWeather, condition: "Rain" },
      22,
      null,
      "night",
    ).lighting;
    const blended = lerpLighting(from, to, 0.5);
    expect(blended.sunIntensity).toBeGreaterThan(to.sunIntensity);
    expect(blended.sunIntensity).toBeLessThan(from.sunIntensity);
    expect(blended.effects.rain).toBe(true);
  });
});
