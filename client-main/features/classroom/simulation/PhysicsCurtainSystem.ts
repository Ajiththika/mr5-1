export interface CurtainPhysicsSnapshot {
  openLevel: number;
  swayX: number;
  swayZ: number;
  flutter: number;
}

export interface CurtainPhysicsInput {
  openLevel: number;
  windSpeed: number;
  fanSpeed: number;
  curtainStrength: number;
  elapsed: number;
}

const SWAY_DAMPING = 4.2;

export class PhysicsCurtainSystem {
  private swayX = 0;
  private swayZ = 0;
  private velocityX = 0;
  private velocityZ = 0;

  step(delta: number, input: CurtainPhysicsInput): CurtainPhysicsSnapshot {
    const openness = Math.max(0, Math.min(1, input.openLevel));
    const airflow =
      input.windSpeed * 0.04 * input.curtainStrength + input.fanSpeed * 0.18 * openness;

    const targetX = Math.sin(input.elapsed * 0.9) * airflow * 0.35;
    const targetZ = Math.cos(input.elapsed * 1.1 + 0.6) * airflow * 0.22;

    const blend = 1 - Math.exp(-SWAY_DAMPING * delta);
    this.velocityX += (targetX - this.swayX) * blend;
    this.velocityZ += (targetZ - this.swayZ) * blend;
    this.velocityX *= 1 - delta * 1.5;
    this.velocityZ *= 1 - delta * 1.5;
    this.swayX += this.velocityX * delta * 3.5;
    this.swayZ += this.velocityZ * delta * 3.5;

    const flutter = Math.sin(input.elapsed * 2.4 + this.swayX * 2) * airflow * 0.08 * openness;

    return {
      openLevel: openness,
      swayX: this.swayX,
      swayZ: this.swayZ,
      flutter,
    };
  }
}
