import apiClient from "@/lib/apiClient";

export interface TeacherAvatarItem {
	_id: string;
	teacherSlug: string;
	name: string;
	description: string;
	type: "teacher_avatar";
	priceCents: number;
	imageUrl?: string;
	modelUrl?: string;
	personality?: string;
	expertise?: string[];
	isPremium: boolean;
	voiceStyle?: string;
	teachingStyle?: string;
	greeting?: string;
	rating?: number;
	systemPrompt?: string;
}

export interface OwnedTeachersResponse {
	owned: string[];
	activeTeacherAvatar: string;
}

export const teacherAvatarService = {
	getCatalog: async (): Promise<{ success: boolean; data: TeacherAvatarItem[] }> => {
		const response = await apiClient.get("/api/shop/teacher-avatars");
		return response.data;
	},

	getOwned: async (): Promise<{ success: boolean; data: OwnedTeachersResponse }> => {
		const response = await apiClient.get("/api/shop/owned-teachers");
		return response.data;
	},

	setActive: async (teacherSlug: string) => {
		const response = await apiClient.put("/api/shop/active-teacher", { teacherSlug });
		return response.data;
	},

	checkout: async (teacherSlug: string) => {
		const response = await apiClient.post("/api/shop/teacher-checkout", { teacherSlug });
		return response.data as {
			success: boolean;
			url?: string;
			sessionId?: string;
			isDemo?: boolean;
		};
	},

	verifyPurchase: async (sessionId: string) => {
		const response = await apiClient.get(`/api/shop/verify-teacher/${sessionId}`);
		return response.data;
	},
};
