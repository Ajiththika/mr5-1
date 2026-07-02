"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import type { TeacherAvatarItem } from "@/services/teacher-avatar.service";
import { resolveTeacherSystemPrompt } from "@/lib/classroom/teacher-system-prompts";
import type {
	OwnStoreInventory,
	OwnStoreProduct,
} from "@/services/own-store.service";
import { productSlug, toTeacherAvatarItem } from "@/services/own-store.service";

const STORAGE_KEY = "mr5-active-teacher";
const OWN_STORE_KEY = "mr5-own-store-equipped";

type ActiveTeacherState = {
	activeTeacherSlug: string;
	ownedSlugs: string[];
	catalog: TeacherAvatarItem[];
	fadeToken: number;
};

type OwnStoreState = {
	inventory: OwnStoreInventory | null;
	equipped: OwnStoreInventory["equipped"];
	welcomeMessage: string;
};

type ActiveTeacherContextValue = ActiveTeacherState &
	OwnStoreState & {
		setCatalog: (items: TeacherAvatarItem[]) => void;
		setOwned: (owned: string[], active?: string) => void;
		setActiveTeacher: (slug: string) => void;
		syncInventory: (data: OwnStoreInventory) => void;
		setEquippedLocal: (partial: Partial<OwnStoreInventory["equipped"]>) => void;
		setWelcomeMessage: (message: string) => void;
		activeTeacher: TeacherAvatarItem | null;
		allOwnedSlugs: Set<string>;
	};

const DEFAULT_EQUIPPED: OwnStoreInventory["equipped"] = {
	teacher: "teacher_default",
	clock: "",
	deskFan: "",
	bell: "",
	backgroundMusic: "",
	transport: "",
	activityPack: "",
	classroomPack: "",
};

const ActiveTeacherContext = createContext<ActiveTeacherContextValue | null>(null);

function readStored(): Pick<ActiveTeacherState, "activeTeacherSlug" | "ownedSlugs"> {
	if (typeof window === "undefined") {
		return { activeTeacherSlug: "teacher_default", ownedSlugs: ["teacher_default"] };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { activeTeacherSlug: "teacher_default", ownedSlugs: ["teacher_default"] };
		const parsed = JSON.parse(raw) as Partial<ActiveTeacherState>;
		return {
			activeTeacherSlug: parsed.activeTeacherSlug ?? "teacher_default",
			ownedSlugs: parsed.ownedSlugs?.length
				? parsed.ownedSlugs
				: ["teacher_default"],
		};
	} catch {
		return { activeTeacherSlug: "teacher_default", ownedSlugs: ["teacher_default"] };
	}
}

function readEquippedStored(): OwnStoreInventory["equipped"] {
	if (typeof window === "undefined") return DEFAULT_EQUIPPED;
	try {
		const raw = localStorage.getItem(OWN_STORE_KEY);
		if (!raw) return DEFAULT_EQUIPPED;
		return { ...DEFAULT_EQUIPPED, ...JSON.parse(raw) };
	} catch {
		return DEFAULT_EQUIPPED;
	}
}

function writeStored(activeTeacherSlug: string, ownedSlugs: string[]) {
	if (typeof window === "undefined") return;
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({ activeTeacherSlug, ownedSlugs }),
	);
}

function writeEquippedStored(equipped: OwnStoreInventory["equipped"]) {
	if (typeof window === "undefined") return;
	localStorage.setItem(OWN_STORE_KEY, JSON.stringify(equipped));
}

function collectOwnedSlugs(inventory: OwnStoreInventory | null, teacherOwned: string[]) {
	const slugs = new Set<string>(["teacher_default", ...teacherOwned]);
	if (!inventory) return slugs;
	for (const group of [
		inventory.teachers,
		inventory.items,
		inventory.audio,
		inventory.activities,
		inventory.transport,
	]) {
		for (const item of group) {
			if (item.owned) slugs.add(productSlug(item));
		}
	}
	return slugs;
}

export function ActiveTeacherProvider({ children }: { children: ReactNode }) {
	const stored = readStored();
	const equippedStored = readEquippedStored();
	const [activeTeacherSlug, setActiveTeacherSlug] = useState(stored.activeTeacherSlug);
	const [ownedSlugs, setOwnedSlugs] = useState(stored.ownedSlugs);
	const [catalog, setCatalogState] = useState<TeacherAvatarItem[]>([]);
	const [fadeToken, setFadeToken] = useState(0);
	const [inventory, setInventory] = useState<OwnStoreInventory | null>(null);
	const [equipped, setEquipped] = useState<OwnStoreInventory["equipped"]>(equippedStored);
	const [welcomeMessage, setWelcomeMessageState] = useState(
		"Welcome to MR5 School.",
	);

	const setCatalog = useCallback((items: TeacherAvatarItem[]) => {
		setCatalogState(items);
	}, []);

	const setOwned = useCallback((owned: string[], active?: string) => {
		setOwnedSlugs(owned);
		const nextActive = active ?? activeTeacherSlug;
		if (active) setActiveTeacherSlug(active);
		writeStored(nextActive, owned);
	}, [activeTeacherSlug]);

	const setActiveTeacher = useCallback((slug: string) => {
		setActiveTeacherSlug(slug);
		setFadeToken((t) => t + 1);
		setEquipped((prev) => {
			const next = { ...prev, teacher: slug };
			writeEquippedStored(next);
			return next;
		});
		writeStored(slug, ownedSlugs);
	}, [ownedSlugs]);

	const syncInventory = useCallback((data: OwnStoreInventory) => {
		setInventory(data);
		setEquipped(data.equipped);
		setWelcomeMessageState(data.welcomeMessage);
		writeEquippedStored(data.equipped);
		const teachers = data.teachers.map(toTeacherAvatarItem);
		setCatalogState(teachers);
		const owned = data.teachers.filter((t) => t.owned).map((t) => productSlug(t));
		setOwnedSlugs(owned.length ? owned : ["teacher_default"]);
		if (data.equipped.teacher) {
			setActiveTeacherSlug(data.equipped.teacher);
		}
		writeStored(data.equipped.teacher ?? "teacher_default", owned);
	}, []);

	const setEquippedLocal = useCallback((partial: Partial<OwnStoreInventory["equipped"]>) => {
		setEquipped((prev) => {
			const next = { ...prev, ...partial };
			writeEquippedStored(next);
			return next;
		});
	}, []);

	const setWelcomeMessage = useCallback((message: string) => {
		setWelcomeMessageState(message);
	}, []);

	const activeTeacher = useMemo(
		() =>
			catalog.find((t) => t.teacherSlug === activeTeacherSlug) ??
			catalog.find((t) => t.teacherSlug === "teacher_default") ??
			null,
		[catalog, activeTeacherSlug],
	);

	const allOwnedSlugs = useMemo(
		() => collectOwnedSlugs(inventory, ownedSlugs),
		[inventory, ownedSlugs],
	);

	const value = useMemo(
		() => ({
			activeTeacherSlug,
			ownedSlugs,
			catalog,
			fadeToken,
			inventory,
			equipped,
			welcomeMessage,
			setCatalog,
			setOwned,
			setActiveTeacher,
			syncInventory,
			setEquippedLocal,
			setWelcomeMessage,
			activeTeacher,
			allOwnedSlugs,
		}),
		[
			activeTeacherSlug,
			ownedSlugs,
			catalog,
			fadeToken,
			inventory,
			equipped,
			welcomeMessage,
			setCatalog,
			setOwned,
			setActiveTeacher,
			syncInventory,
			setEquippedLocal,
			setWelcomeMessage,
			activeTeacher,
			allOwnedSlugs,
		],
	);

	return (
		<ActiveTeacherContext.Provider value={value}>{children}</ActiveTeacherContext.Provider>
	);
}

export function useActiveTeacher() {
	const ctx = useContext(ActiveTeacherContext);
	if (!ctx) {
		throw new Error("useActiveTeacher must be used within ActiveTeacherProvider");
	}
	return ctx;
}

export function useOwnStore() {
	return useActiveTeacher();
}

export function getTeacherPersonalityPrompt(teacher: TeacherAvatarItem | null): string {
	return resolveTeacherSystemPrompt(teacher);
}

export function findOwnedItem(
	inventory: OwnStoreInventory | null,
	slug: string,
): OwnStoreProduct | undefined {
	if (!inventory) return undefined;
	for (const group of [
		inventory.teachers,
		inventory.items,
		inventory.audio,
		inventory.activities,
		inventory.transport,
	]) {
		const found = group.find((i) => productSlug(i) === slug);
		if (found) return found;
	}
	return undefined;
}
