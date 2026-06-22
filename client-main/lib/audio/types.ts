export type SoundCategory =
  | "BUTTON_PRIMARY"
  | "BUTTON_SECONDARY"
  | "NAVIGATION"
  | "SUCCESS"
  | "ERROR"
  | "TOGGLE"
  | "CARD_OPEN"
  | "NOTIFICATION_INFO"
  | "NOTIFICATION_SUCCESS"
  | "NOTIFICATION_WARNING"
  | "NOTIFICATION_ERROR"
  | "REWARD"
  | "CLASS_BELL"
  | "CHAT_OPEN"
  | "LANGUAGE_SWITCH";

export type VoiceEvent =
  | "welcome_back"
  | "class_started"
  | "task_completed"
  | "challenge_completed";

export interface AudioSettings {
  masterVolume: number;
  muted: boolean;
  buttonSounds: boolean;
  uiSounds: boolean;
  fanSound: boolean;
  classAmbience: boolean;
  classAmbienceVolume: number;
  bellSounds: boolean;
  notificationSounds: boolean;
  voiceFeedback: boolean;
  reducedAudio: boolean;
  lowBandwidth: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.75,
  muted: false,
  buttonSounds: true,
  uiSounds: true,
  fanSound: true,
  classAmbience: true,
  classAmbienceVolume: 0.3,
  bellSounds: true,
  notificationSounds: true,
  voiceFeedback: false,
  reducedAudio: false,
  lowBandwidth: false,
};

export interface FanEnvironmentInput {
  temperature?: number;
  humidity?: number;
  comfort?: number;
  hour?: number;
}
