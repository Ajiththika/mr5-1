import { getAudioSettingsStore } from "./AudioSettingsStore";
import { getBrandSoundManager } from "./BrandSoundManager";
import { FanAudioManager } from "./FanAudioManager";
import { ClassroomAmbienceManager } from "./ClassroomAmbienceManager";

describe("AudioSettingsStore", () => {
  beforeEach(() => {
    getAudioSettingsStore().reset();
  });

  it("persists master volume updates", () => {
    getAudioSettingsStore().update({ masterVolume: 0.5 });
    expect(getAudioSettingsStore().get().masterVolume).toBe(0.5);
  });

  it("returns zero effective volume when muted", () => {
    getAudioSettingsStore().update({ muted: true });
    expect(getAudioSettingsStore().effectiveVolume(1)).toBe(0);
  });
});

describe("BrandSoundManager", () => {
  it("respects mute setting", () => {
    getAudioSettingsStore().reset();
    getAudioSettingsStore().update({ muted: true });
    expect(getBrandSoundManager().play("BUTTON_PRIMARY")).toBe(false);
  });
});

describe("FanAudioManager", () => {
  it("constructs and updates without throwing in jsdom", () => {
    const manager = new FanAudioManager();
    manager.setEnvironment({ temperature: 32, humidity: 70, comfort: 55 });
    manager.update(0.6, 0.016);
    manager.dispose();
  });
});

describe("ClassroomAmbienceManager", () => {
  it("constructs and updates without throwing in jsdom", () => {
    const manager = new ClassroomAmbienceManager();
    manager.update(0.016);
    manager.dispose();
  });

  it("defaults class ambience to a subtle volume", () => {
    getAudioSettingsStore().reset();
    expect(getAudioSettingsStore().get().classAmbienceVolume).toBe(0.3);
  });

  it("lowers gain when curtains are closed", () => {
    const manager = new ClassroomAmbienceManager();
    manager.setCurtainOpenness(0);
    manager.update(0.1);
    manager.setCurtainOpenness(1);
    manager.update(0.1);
    manager.dispose();
  });
});
