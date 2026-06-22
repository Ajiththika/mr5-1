import apiClient from "@/lib/apiClient";

export interface Course {
	_id: string;
	title: string;
	description: string;
	category?: string;
	level: string;
	price: number;
	thumbnail?: string;
	language: string;
	teacher: {
		_id: string;
		name: string;
		email: string;
		profileImage?: string;
	};
	isApproved: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CoursesResponse {
	success: boolean;
	data: Course[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CourseSearchResponse {
	data: Course[];
	total: number;
	page: number;
	limit: number;
}

export const courseService = {
	searchCourses: async (params?: {
		search?: string;
		page?: number;
		limit?: number;
		category?: string;
		level?: string;
	}): Promise<CourseSearchResponse> => {
		const query: Record<string, string | number> = {
			page: params?.page ?? 1,
			limit: params?.limit ?? 50,
		};

		const search = params?.search?.trim();
		if (search) query.search = search;
		if (params?.category) query.category = params.category;
		if (params?.level) query.level = params.level;

		const response = await apiClient.get<CourseSearchResponse>(
			"/api/courses/search",
			{ params: query },
		);
		return response.data;
	},

	getAllCourses: async (params?: {
		page?: number;
		limit?: number;
		search?: string;
		level?: string;
		category?: string;
	}): Promise<CoursesResponse> => {
		const response = await apiClient.get<CoursesResponse>("/api/courses", {
			params,
		});
		return response.data;
	},

	getCourseById: async (id: string): Promise<{ success: boolean; data: Course }> => {
		const response = await apiClient.get<{ success: boolean; data: Course }>(
			`/api/courses/${id}`,
		);
		return response.data;
	},

	createCourse: async (data: Partial<Course>): Promise<{ success: boolean; data: Course }> => {
		const response = await apiClient.post<{ success: boolean; data: Course }>(
			"/api/courses",
			data,
		);
		return response.data;
	},
};

