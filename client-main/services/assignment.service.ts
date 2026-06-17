import apiClient from "@/lib/apiClient";

export interface Assignment {
	_id: string;
	title: string;
	description?: string;
	course: {
		_id: string;
		title: string;
	};
	teacher?: {
		_id: string;
		name: string;
	};
	dueDate: string;
	createdAt: string;
}

export interface AssignmentsResponse {
	success: boolean;
	data: Assignment[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export const assignmentService = {
	getAssignments: async (params?: {
		page?: number;
		limit?: number;
		course?: string;
	}): Promise<AssignmentsResponse> => {
		const response = await apiClient.get<AssignmentsResponse>("/api/assignments", {
			params,
		});
		return response.data;
	},

	getAssignmentById: async (id: string): Promise<{ success: boolean; data: Assignment }> => {
		const response = await apiClient.get<{ success: boolean; data: Assignment }>(
			`/api/assignments/${id}`,
		);
		return response.data;
	},
};
