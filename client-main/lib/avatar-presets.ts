export interface AvatarPreset {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "cadet-blue", name: "Cadet Blue", color: "#3b82f6", emoji: "🧑‍🎓" },
  { id: "scholar-green", name: "Scholar Green", color: "#22c55e", emoji: "📚" },
  { id: "innovator-purple", name: "Innovator Purple", color: "#a855f7", emoji: "🚀" },
  { id: "artist-pink", name: "Artist Pink", color: "#ec4899", emoji: "🎨" },
  { id: "engineer-orange", name: "Engineer Orange", color: "#f97316", emoji: "⚙️" },
  { id: "scientist-teal", name: "Scientist Teal", color: "#14b8a6", emoji: "🔬" },
  { id: "leader-gold", name: "Leader Gold", color: "#eab308", emoji: "⭐" },
  { id: "explorer-cyan", name: "Explorer Cyan", color: "#06b6d4", emoji: "🧭" },
];

export function getAvatarPreset(id: string): AvatarPreset | undefined {
  return AVATAR_PRESETS.find((p) => p.id === id);
}
