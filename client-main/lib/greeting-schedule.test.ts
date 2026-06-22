import {
  GREETING_COOLDOWN_MS,
  getVoiceGreetingCooldownRemainingMs,
  markVoiceGreetingPlayed,
  resetVoiceGreetingSchedule,
  shouldPlayVoiceGreeting,
} from "./greeting-schedule";

describe("greeting-schedule", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("allows the first voice greeting", () => {
    expect(shouldPlayVoiceGreeting()).toBe(true);
  });

  it("blocks repeat greeting within the same tab session", () => {
    markVoiceGreetingPlayed();
    expect(shouldPlayVoiceGreeting()).toBe(false);
  });

  it("blocks greeting on refresh within five hours", () => {
    markVoiceGreetingPlayed(Date.now());
    sessionStorage.clear();
    expect(shouldPlayVoiceGreeting()).toBe(false);
  });

  it("allows greeting again after five hours when tab is reopened", () => {
    const sixHoursAgo = Date.now() - GREETING_COOLDOWN_MS - 60_000;
    localStorage.setItem("mr5_last_voice_greeting_at", String(sixHoursAgo));
    sessionStorage.clear();
    expect(shouldPlayVoiceGreeting()).toBe(true);
  });

  it("reports remaining cooldown time", () => {
    markVoiceGreetingPlayed(Date.now());
    sessionStorage.clear();
    const remaining = getVoiceGreetingCooldownRemainingMs();
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(GREETING_COOLDOWN_MS);
  });

  it("resets schedule for testing", () => {
    markVoiceGreetingPlayed();
    resetVoiceGreetingSchedule();
    expect(shouldPlayVoiceGreeting()).toBe(true);
  });
});
