"use client";

import { useEffect } from "react";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { useOwnStore } from "@/contexts/ActiveTeacherContext";
import { ownStoreService, productSlug } from "@/services/own-store.service";
import {
	ownsWelcomeVoicePack,
	playEquippedBell,
	speakWelcomeMessage,
	startEquippedBackgroundMusic,
	stopBackgroundMusic,
} from "@/lib/classroom/own-store-runtime";

/** Applies equipped own-store assets when entering the classroom. */
export function useClassroomOwnStoreRuntime() {
	const { user } = useEnhancedUser();
	const {
		equipped,
		welcomeMessage,
		syncInventory,
		inventory,
		activeTeacher,
	} = useOwnStore();

	useEffect(() => {
		if (!user) return;
		ownStoreService
			.getInventory()
			.then((res) => syncInventory(res.data))
			.catch(() => undefined);
	}, [user, syncInventory]);

	useEffect(() => {
		if (equipped.bell) {
			playEquippedBell(equipped.bell);
		}
		startEquippedBackgroundMusic(equipped.backgroundMusic);

		const ownedAudio =
			inventory?.audio.filter((a) => a.owned).map((a) => productSlug(a)) ?? [];
		const canSpeak =
			ownsWelcomeVoicePack(ownedAudio) || !user || welcomeMessage.length > 0;

		if (canSpeak && welcomeMessage) {
			const timer = window.setTimeout(() => {
				speakWelcomeMessage(welcomeMessage, activeTeacher?.name);
			}, 1200);
			return () => {
				window.clearTimeout(timer);
				stopBackgroundMusic();
			};
		}

		return () => stopBackgroundMusic();
	}, [
		equipped.bell,
		equipped.backgroundMusic,
		welcomeMessage,
		inventory,
		user,
		activeTeacher?.name,
	]);
}
