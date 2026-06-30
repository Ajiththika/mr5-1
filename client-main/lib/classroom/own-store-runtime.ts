/** Maps equipped own-store slugs to classroom runtime assets (audio, etc.). */

const BELL_SRC = "/assets/audio/school-period-bell.mp3";
const AMBIENCE_SRC = "/assets/sounds/classroom-ambience.mp3";

const MUSIC_TRACKS: Record<string, string> = {
	audio_music_piano: AMBIENCE_SRC,
	audio_music_nature: AMBIENCE_SRC,
	audio_music_rain: AMBIENCE_SRC,
	audio_music_instrumental: AMBIENCE_SRC,
};

let bgAudio: HTMLAudioElement | null = null;

export function playEquippedBell(slug: string) {
	if (!slug || slug === "silent") return;
	const audio = new Audio(BELL_SRC);
	audio.volume = 0.55;
	void audio.play().catch(() => undefined);
}

export function startEquippedBackgroundMusic(slug: string) {
	stopBackgroundMusic();
	if (!slug || slug === "silent") return;
	const src = MUSIC_TRACKS[slug];
	if (!src) return;
	bgAudio = new Audio(src);
	bgAudio.loop = true;
	bgAudio.volume = 0.22;
	void bgAudio.play().catch(() => undefined);
}

export function stopBackgroundMusic() {
	if (!bgAudio) return;
	bgAudio.pause();
	bgAudio = null;
}

export function speakWelcomeMessage(text: string, voiceHint?: string) {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.rate = 0.95;
	utterance.pitch = voiceHint?.toLowerCase().includes("einstein") ? 0.9 : 1;
	window.speechSynthesis.cancel();
	window.speechSynthesis.speak(utterance);
}

export function ownsWelcomeVoicePack(ownedAudio: string[]) {
	return ownedAudio.includes("audio_welcome_pack");
}
