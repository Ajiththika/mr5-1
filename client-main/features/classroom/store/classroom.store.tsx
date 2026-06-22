"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { FanSpeedLevel } from "../environment/environment.types";

export interface ClassroomControls {
  fanEnabled: boolean;
  fanMode: FanSpeedLevel;
  lightsOn: boolean;
  curtainOpen: number;
}

export interface PlaytimeProgress {
  xp: number;
  stars: number;
  badges: string[];
  challengesCompleted: number;
}

interface ClassroomState {
  controls: ClassroomControls;
  playtime: PlaytimeProgress;
  playtimeOpen: boolean;
  challengeOpen: boolean;
}

type Action =
  | { type: "SET_FAN_ENABLED"; value: boolean }
  | { type: "SET_FAN_MODE"; value: FanSpeedLevel }
  | { type: "SET_LIGHTS"; value: boolean }
  | { type: "SET_CURTAIN"; value: number }
  | { type: "TOGGLE_PLAYTIME" }
  | { type: "TOGGLE_CHALLENGE" }
  | { type: "ADD_REWARD"; xp: number; stars: number; badge?: string };

const STORAGE_KEY = "mr5-classroom-playtime";

function loadProgress(): PlaytimeProgress {
  if (typeof window === "undefined") {
    return { xp: 0, stars: 0, badges: [], challengesCompleted: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PlaytimeProgress;
  } catch {
    /* ignore */
  }
  return { xp: 0, stars: 0, badges: [], challengesCompleted: 0 };
}

function saveProgress(progress: PlaytimeProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* ignore */
  }
}

const initialState: ClassroomState = {
  controls: {
    fanEnabled: false,
    fanMode: "AUTO",
    lightsOn: true,
    curtainOpen: 0.65,
  },
  playtime: loadProgress(),
  playtimeOpen: false,
  challengeOpen: false,
};

function reducer(state: ClassroomState, action: Action): ClassroomState {
  switch (action.type) {
    case "SET_FAN_ENABLED":
      return {
        ...state,
        controls: { ...state.controls, fanEnabled: action.value },
      };
    case "SET_FAN_MODE":
      return {
        ...state,
        controls: { ...state.controls, fanMode: action.value },
      };
    case "SET_LIGHTS":
      return {
        ...state,
        controls: { ...state.controls, lightsOn: action.value },
      };
    case "SET_CURTAIN":
      return {
        ...state,
        controls: {
          ...state.controls,
          curtainOpen: Math.max(0, Math.min(1, action.value)),
        },
      };
    case "TOGGLE_PLAYTIME":
      return { ...state, playtimeOpen: !state.playtimeOpen };
    case "TOGGLE_CHALLENGE":
      return { ...state, challengeOpen: !state.challengeOpen };
    case "ADD_REWARD": {
      const badges = action.badge
        ? [...new Set([...state.playtime.badges, action.badge])]
        : state.playtime.badges;
      const playtime: PlaytimeProgress = {
        xp: state.playtime.xp + action.xp,
        stars: state.playtime.stars + action.stars,
        badges,
        challengesCompleted: state.playtime.challengesCompleted + 1,
      };
      saveProgress(playtime);
      return { ...state, playtime };
    }
    default:
      return state;
  }
}

interface ClassroomStoreValue extends ClassroomState {
  setFanEnabled: (value: boolean) => void;
  setFanMode: (value: FanSpeedLevel) => void;
  setLightsOn: (value: boolean) => void;
  setCurtainOpen: (value: number) => void;
  togglePlaytime: () => void;
  toggleChallenge: () => void;
  addReward: (xp: number, stars: number, badge?: string) => void;
}

const ClassroomStoreContext = createContext<ClassroomStoreValue | null>(null);

export function ClassroomStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setFanEnabled = useCallback((value: boolean) => {
    dispatch({ type: "SET_FAN_ENABLED", value });
  }, []);

  const setFanMode = useCallback((value: FanSpeedLevel) => {
    dispatch({ type: "SET_FAN_MODE", value });
  }, []);

  const setLightsOn = useCallback((value: boolean) => {
    dispatch({ type: "SET_LIGHTS", value });
  }, []);

  const setCurtainOpen = useCallback((value: number) => {
    dispatch({ type: "SET_CURTAIN", value });
  }, []);

  const togglePlaytime = useCallback(() => {
    dispatch({ type: "TOGGLE_PLAYTIME" });
  }, []);

  const toggleChallenge = useCallback(() => {
    dispatch({ type: "TOGGLE_CHALLENGE" });
  }, []);

  const addReward = useCallback((xp: number, stars: number, badge?: string) => {
    dispatch({ type: "ADD_REWARD", xp, stars, badge });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setFanEnabled,
      setFanMode,
      setLightsOn,
      setCurtainOpen,
      togglePlaytime,
      toggleChallenge,
      addReward,
    }),
    [
      state,
      setFanEnabled,
      setFanMode,
      setLightsOn,
      setCurtainOpen,
      togglePlaytime,
      toggleChallenge,
      addReward,
    ],
  );

  return (
    <ClassroomStoreContext.Provider value={value}>
      {children}
    </ClassroomStoreContext.Provider>
  );
}

export function useClassroomStore() {
  const ctx = useContext(ClassroomStoreContext);
  if (!ctx) {
    throw new Error("useClassroomStore must be used within ClassroomStoreProvider");
  }
  return ctx;
}
