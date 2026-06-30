import apiClient from "@/lib/apiClient";

export interface ShopItem {
	_id: string;
	name: string;
	description: string;
	type: "hat" | "shirt" | "accessory" | "book" | "teacher_avatar";
	priceCents: number;
	imageUrl?: string;
}

export interface InventoryEntry {
	_id: string;
	item: ShopItem;
	equipped: boolean;
	purchasedAt: string;
}

export const shopService = {
	getItems: async (): Promise<{ success: boolean; data: ShopItem[] }> => {
		const response = await apiClient.get("/api/shop/items");
		return response.data;
	},

	getInventory: async (): Promise<{ success: boolean; data: InventoryEntry[] }> => {
		const response = await apiClient.get("/api/shop/inventory");
		return response.data;
	},

	purchase: async (itemId: string) => {
		const response = await apiClient.post("/api/shop/purchase", { itemId });
		return response.data;
	},

	equip: async (inventoryId: string) => {
		const response = await apiClient.put(`/api/shop/inventory/${inventoryId}/equip`);
		return response.data;
	},
};
