"use client";

import { useCallback, useEffect, useRef } from "react";

const DEFAULT_IDLE_MS = 30 * 60 * 1000;
const ACTIVITY_KEY = "mr5_last_activity";
const LOGOUT_EVENT = "mr5_session_logout";

export function broadcastSessionLogout() {
	if (typeof window === "undefined") return;
	localStorage.setItem(LOGOUT_EVENT, String(Date.now()));
}

export function useSessionInactivity(
	onIdle: () => void,
	idleMs: number = DEFAULT_IDLE_MS,
	enabled = true,
) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const touch = useCallback(() => {
		if (!enabled) return;
		const now = Date.now();
		localStorage.setItem(ACTIVITY_KEY, String(now));
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			const last = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
			if (Date.now() - last >= idleMs) onIdle();
		}, idleMs);
	}, [enabled, idleMs, onIdle]);

	useEffect(() => {
		if (!enabled) return;

		const events = ["mousedown", "keydown", "scroll", "touchstart", "visibilitychange"] as const;
		for (const event of events) {
			window.addEventListener(event, touch, { passive: true });
		}

		const onStorage = (e: StorageEvent) => {
			if (e.key === LOGOUT_EVENT) onIdle();
		};
		window.addEventListener("storage", onStorage);

		touch();

		return () => {
			for (const event of events) {
				window.removeEventListener(event, touch);
			}
			window.removeEventListener("storage", onStorage);
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [enabled, touch, onIdle]);
}
