import type { FanSpeedLevel } from "../environment/environment.types";

export const FAN_LEVEL_SPEED: Record<Exclude<FanSpeedLevel, "AUTO">, number> = {
  OFF: 0,
  LOW: 0.32,
  MEDIUM: 0.62,
  HIGH: 1,
};

const MAX_ANGULAR = (300 / 60) * Math.PI * 2;
const ACCEL = 1.8;
const DECEL = 2.4;

export interface FanPhysicsSnapshot {
  currentSpeed: number;
  targetSpeed: number;
  angularVelocity: number;
  wobble: number;
}

export class FanPhysicsEngine {
  currentSpeed = 0;
  targetSpeed = 0;
  private wobblePhase = 0;

  setTargetFromLevel(level: FanSpeedLevel, autoIntensity = 0): void {
    if (level === "AUTO") {
      this.targetSpeed = Math.max(0, Math.min(1, autoIntensity));
      return;
    }
    this.targetSpeed = FAN_LEVEL_SPEED[level];
  }

  step(delta: number): FanPhysicsSnapshot {
    const diff = this.targetSpeed - this.currentSpeed;
    const rate = diff > 0 ? ACCEL : DECEL;
    this.currentSpeed += diff * (1 - Math.exp(-rate * delta));

    if (this.targetSpeed === 0 && this.currentSpeed < 0.004) {
      this.currentSpeed = 0;
    }

    this.wobblePhase += delta * (0.35 + this.currentSpeed * 0.08);
    const wobbleRatio =
      this.targetSpeed > 0 ? this.currentSpeed / Math.max(this.targetSpeed, 0.01) : 0;
    const wobble = Math.sin(this.wobblePhase) * 0.0028 * wobbleRatio;

    return {
      currentSpeed: this.currentSpeed,
      targetSpeed: this.targetSpeed,
      angularVelocity: this.currentSpeed * MAX_ANGULAR,
      wobble,
    };
  }

  reset(): void {
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.wobblePhase = 0;
  }
}
