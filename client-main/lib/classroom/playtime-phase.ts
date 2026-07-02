export type PlaytimePhase =
  | "idle"
  | "break_focus"
  | "break_rest"
  | "game_focus"
  | "game_rest";

export function isGamingTime(phase: PlaytimePhase): boolean {
  return phase === "game_rest";
}

export function isBreakTime(phase: PlaytimePhase): boolean {
  return phase === "break_rest";
}

export function isPlaytimeRest(phase: PlaytimePhase): boolean {
  return phase === "game_rest" || phase === "break_rest";
}

export function phaseLabel(phase: PlaytimePhase): string {
  switch (phase) {
    case "break_focus":
      return "Class time";
    case "break_rest":
      return "Break time";
    case "game_focus":
      return "Lesson time";
    case "game_rest":
      return "Game time";
    default:
      return "Ready";
  }
}
