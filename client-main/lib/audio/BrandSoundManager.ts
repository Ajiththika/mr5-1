import { getAudioEngine } from "./AudioEngine";
import type { SoundCategory } from "./types";

export class BrandSoundManager {
  play(category: SoundCategory): boolean {
    return getAudioEngine().playOneShot(category);
  }

  playButtonPrimary(): boolean {
    return this.play("BUTTON_PRIMARY");
  }

  playButtonSecondary(): boolean {
    return this.play("BUTTON_SECONDARY");
  }

  playNavigation(): boolean {
    return this.play("NAVIGATION");
  }

  playToggle(): boolean {
    return this.play("TOGGLE");
  }

  playSuccess(): boolean {
    return this.play("SUCCESS");
  }

  playError(): boolean {
    return this.play("ERROR");
  }

  playNotification(type: "info" | "success" | "warning" | "error"): boolean {
    const map: Record<typeof type, SoundCategory> = {
      info: "NOTIFICATION_INFO",
      success: "NOTIFICATION_SUCCESS",
      warning: "NOTIFICATION_WARNING",
      error: "NOTIFICATION_ERROR",
    };
    return this.play(map[type]);
  }

  playReward(): boolean {
    return this.play("REWARD");
  }

  playClassBell(): boolean {
    return this.play("CLASS_BELL");
  }

  playChatOpen(): boolean {
    return this.play("CHAT_OPEN");
  }

  playLanguageSwitch(): boolean {
    return this.play("LANGUAGE_SWITCH");
  }
}

let brandInstance: BrandSoundManager | null = null;

export function getBrandSoundManager(): BrandSoundManager {
  if (!brandInstance) brandInstance = new BrandSoundManager();
  return brandInstance;
}
