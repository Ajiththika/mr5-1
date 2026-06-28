const BELL_SRC = "/assets/audio/school-period-bell.mp3";

let bellAudio: HTMLAudioElement | null = null;
let lastPlayedKey: string | null = null;
let lastPlayedAt = 0;

export function playSchoolPeriodBell(periodKey: string) {
	if (typeof window === "undefined") return;

	const now = Date.now();
	if (lastPlayedKey === periodKey && now - lastPlayedAt < 60_000) return;

	try {
		if (!bellAudio) {
			bellAudio = new Audio(BELL_SRC);
			bellAudio.preload = "auto";
		}
		bellAudio.currentTime = 0;
		bellAudio.volume = 0.55;
		void bellAudio.play().catch(() => {
			/* autoplay blocked until user gesture — silent fail */
		});
		lastPlayedKey = periodKey;
		lastPlayedAt = now;
	} catch {
		/* ignore */
	}
}

export function resetSchoolPeriodBell() {
	lastPlayedKey = null;
	lastPlayedAt = 0;
}
