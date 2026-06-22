import { FanPhysicsEngine, FAN_LEVEL_SPEED } from "../simulation/FanPhysicsEngine";
import { calculateComfort } from "../environment/ComfortCalculator";
import { computeEnvironment } from "../environment/EnvironmentEngine";
import { deriveEnvironment, getDefaultWeather } from "@/lib/classroom-environment";
import { FanAudioManager } from "@/lib/audio/FanAudioManager";
import { checkQuizAnswer, CLASSROOM_QUIZ } from "../playtime/MiniGameEngine";

describe("FanPhysicsEngine", () => {
  it("accelerates smoothly toward target speed", () => {
    const engine = new FanPhysicsEngine();
    engine.setTargetFromLevel("HIGH");
    let last = 0;
    for (let i = 0; i < 120; i++) {
      last = engine.step(1 / 60).currentSpeed;
    }
    expect(last).toBeGreaterThan(0.85);
    expect(last).toBeLessThanOrEqual(FAN_LEVEL_SPEED.HIGH);
  });

  it("decelerates to zero when turned off", () => {
    const engine = new FanPhysicsEngine();
    engine.setTargetFromLevel("HIGH");
    for (let i = 0; i < 60; i++) engine.step(1 / 60);
    engine.setTargetFromLevel("OFF");
    for (let i = 0; i < 180; i++) engine.step(1 / 60);
    expect(engine.step(0).currentSpeed).toBeLessThan(0.01);
  });

  it("auto mode uses environment intensity", () => {
    const engine = new FanPhysicsEngine();
    engine.setTargetFromLevel("AUTO", 0.7);
    expect(engine.targetSpeed).toBe(0.7);
  });
});

describe("ComfortCalculator", () => {
  it("returns comfort label for warm weather", () => {
    const result = calculateComfort(
      { condition: "Clear", temperature: 32, humidity: 60, windSpeed: 1 },
      "afternoon",
    );
    expect(result.roomComfort).toBeLessThan(80);
    expect(result.comfortLabel.toLowerCase()).toContain("warm");
  });
});

describe("EnvironmentEngine", () => {
  it("derives higher fan intensity in heat", () => {
    const hot = computeEnvironment({
      weather: { condition: "Clear", temperature: 34, humidity: 70, windSpeed: 1 },
      derived: deriveEnvironment(getDefaultWeather(), 14),
    });
    const mild = computeEnvironment({
      weather: getDefaultWeather(),
      derived: deriveEnvironment(getDefaultWeather(), 14),
    });
    expect(hot.fanIntensity).toBeGreaterThan(mild.fanIntensity);
  });
});

describe("FanAudioManager", () => {
  it("constructs without throwing in jsdom", () => {
    const manager = new FanAudioManager();
    manager.update(0.5, 0.016);
    manager.dispose();
  });
});

describe("MiniGameEngine", () => {
  it("validates quiz answers", () => {
    const q = CLASSROOM_QUIZ[0];
    expect(checkQuizAnswer(q, q.answerIndex)).toBe(true);
    expect(checkQuizAnswer(q, 0)).toBe(q.answerIndex === 0);
  });
});
