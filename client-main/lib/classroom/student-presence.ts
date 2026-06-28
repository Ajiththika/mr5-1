const BREATH_PERIOD_S = 3.6;

export interface StudentBreathOffsets {
  chestY: number;
  chestScale: number;
}

export function sampleStudentBreathOffsets(timeS: number): StudentBreathOffsets {
  const breath = Math.sin((timeS / BREATH_PERIOD_S) * Math.PI * 2);
  return {
    chestY: breath * 0.006,
    chestScale: 1 + breath * 0.012,
  };
}
