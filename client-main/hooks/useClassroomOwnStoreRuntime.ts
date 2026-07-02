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
import {
	markClassroomWelcomePlayed,
	shouldPlayClassroomWelcome,
} from "@/lib/classroom/classroom-welcome-schedule";

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
		return () => stopBackgroundMusic();
	}, [equipped.bell, equipped.backgroundMusic]);

	useEffect(() => {
		const ownedAudio =
			inventory?.audio.filter((a) => a.owned).map((a) => productSlug(a)) ?? [];
		const canSpeak =
			ownsWelcomeVoicePack(ownedAudio) || !user || welcomeMessage.length > 0;

		if (!canSpeak || !welcomeMessage || !shouldPlayClassroomWelcome()) {
			return;
		}

		markClassroomWelcomePlayed();
		const timer = window.setTimeout(() => {
			speakWelcomeMessage(welcomeMessage, activeTeacher?.name);
		}, 1200);
		return () => window.clearTimeout(timer);
		// Intentionally omit activeTeacher — welcome is once per day, not per teacher switch.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [welcomeMessage, inventory, user]);
}
