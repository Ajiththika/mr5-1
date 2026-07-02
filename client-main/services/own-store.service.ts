import apiClient from "@/lib/apiClient";
import type { OwnStoreTabId } from "@/lib/own-store/tabs";

export interface OwnStoreProduct {
	_id: string;
	name: string;
	description: string;
	type: string;
	category?: string;
	priceCents: number;
	imageUrl?: string;
	isPremium?: boolean;
	isActive?: boolean;
	comingSoon?: boolean;
	features?: string[];
	metadata?: Record<string, unknown>;
	teacherSlug?: string;
	itemSlug?: string;
	slug?: string;
	owned?: boolean;
	equipped?: boolean;
	modelUrl?: string;
	personality?: string;
	expertise?: string[];
	voiceStyle?: string;
	teachingStyle?: string;
	greeting?: string;
	rating?: number;
	systemPrompt?: string;
}

export interface OwnStoreInventory {
	teachers: OwnStoreProduct[];
	items: OwnStoreProduct[];
	audio: OwnStoreProduct[];
	activities: OwnStoreProduct[];
	transport: OwnStoreProduct[];
	equipped: {
		teacher: string;
		clock: string;
		deskFan: string;
		bell: string;
		backgroundMusic: string;
		transport: string;
		activityPack: string;
		classroomPack: string;
	};
	welcomeMessage: string;
}

export const ownStoreService = {
	getCatalog: async (
		category?: OwnStoreTabId,
	): Promise<{
		success: boolean;
		data: OwnStoreProduct[];
		comingSoon?: OwnStoreProduct[];
	}> => {
		const params = category && category !== "inventory" ? { category } : {};
		const response = await apiClient.get("/api/shop/own-store/catalog", { params });
		return response.data;
	},

	getInventory: async (): Promise<{ success: boolean; data: OwnStoreInventory }> => {
		const response = await apiClient.get("/api/user/inventory");
		return response.data;
	},

	checkout: async (itemSlug: string) => {
		const response = await apiClient.post("/api/shop/own-store/checkout", { itemSlug });
		return response.data as {
			success: boolean;
			url?: string;
			sessionId?: string;
			isDemo?: boolean;
		};
	},

	verifyPurchase: async (sessionId: string) => {
		const response = await apiClient.get(`/api/shop/verify-purchase/${sessionId}`);
		return response.data;
	},

	equip: async (itemSlug: string) => {
		const response = await apiClient.put("/api/user/inventory/equip", { itemSlug });
		return response.data;
	},

	unequip: async (itemSlug: string) => {
		const response = await apiClient.put("/api/user/inventory/equip", {
			itemSlug,
			unequip: true,
		});
		return response.data;
	},

	updateClassroomSettings: async (welcomeMessage: string) => {
		const response = await apiClient.put("/api/user/classroom-settings", {
			welcomeMessage,
		});
		return response.data;
	},
};

export function productSlug(product: OwnStoreProduct): string {
	return product.slug ?? product.teacherSlug ?? product.itemSlug ?? "";
}

/** @deprecated Use productSlug */
export const itemSlug = productSlug;

export function toTeacherAvatarItem(item: OwnStoreProduct): import("@/services/teacher-avatar.service").TeacherAvatarItem {
	return {
		_id: item._id,
		teacherSlug: item.teacherSlug ?? productSlug(item),
		name: item.name,
		description: item.description,
		type: "teacher_avatar",
		priceCents: item.priceCents,
		imageUrl: item.imageUrl,
		modelUrl: item.modelUrl,
		personality: item.personality,
		expertise: item.expertise,
		isPremium: Boolean(item.isPremium),
		voiceStyle: item.voiceStyle,
		teachingStyle: item.teachingStyle,
		greeting: item.greeting,
		rating: item.rating,
		systemPrompt: item.systemPrompt,
	};
}

export type OwnStoreEquipped = OwnStoreInventory["equipped"];
export type OwnStoreCatalogItem = OwnStoreProduct;

export function formatOwnStorePrice(cents: number): string {
	if (cents <= 0) return "Free";
	return `$${(cents / 100).toFixed(2)}`;
}
