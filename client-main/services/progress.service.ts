import apiClient from "@/lib/apiClient";

export interface CourseProgressData {
	completedLessonIds: string[];
	lessons: Array<{
		lesson: string;
		completedAt: string;
		watchPercent: number;
	}>;
	totalLessons: number;
	completedCount: number;
	progressPercent: number;
}

export const progressService = {
	completeLesson: async (
		lessonId: string,
		watchPercent = 100,
	): Promise<{
		success: boolean;
		data: {
			enrollmentProgress: number;
			completedLessons: number;
			totalLessons: number;
		};
	}> => {
		const response = await apiClient.post(`/api/progress/lessons/${lessonId}/complete`, {
			watchPercent,
		});
		return response.data;
	},

	getCourseProgress: async (
		courseId: string,
	): Promise<{ success: boolean; data: CourseProgressData }> => {
		const response = await apiClient.get(`/api/progress/courses/${courseId}`);
		return response.data;
	},
};
