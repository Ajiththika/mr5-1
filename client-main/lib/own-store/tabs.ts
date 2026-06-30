export const OWN_STORE_TAB_KEY = "mr5-own-store-tab";

export type OwnStoreTabId =
	| "teachers"
	| "classroom"
	| "audio"
	| "activities"
	| "transport"
	| "inventory";

export const OWN_STORE_TABS: { id: OwnStoreTabId; label: string }[] = [
	{ id: "teachers", label: "Teachers" },
	{ id: "classroom", label: "Classroom Items" },
	{ id: "audio", label: "Audio Pack" },
	{ id: "activities", label: "Activities" },
	{ id: "transport", label: "School Transport" },
	{ id: "inventory", label: "Inventory" },
];

export function isOwnStoreTabId(value: string | null): value is OwnStoreTabId {
	return OWN_STORE_TABS.some((tab) => tab.id === value);
}

export function readStoredTab(): OwnStoreTabId {
	if (typeof window === "undefined") return "teachers";
	try {
		const raw = localStorage.getItem(OWN_STORE_TAB_KEY);
		return isOwnStoreTabId(raw) ? raw : "teachers";
	} catch {
		return "teachers";
	}
}

export function writeStoredTab(tab: OwnStoreTabId) {
	if (typeof window === "undefined") return;
	localStorage.setItem(OWN_STORE_TAB_KEY, tab);
}
