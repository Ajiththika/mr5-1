import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api";

export interface StudentProgress {
  _id: string;
  student: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    level: string;
  };
  completedLessons: string[];
  progress: number; // 0-100
  status: "active" | "completed";
  lastAccessed?: string;
  enrolledAt: string;
}

export interface StudentDashboardStats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHoursLearned: number;
  streakDays: number;
  achievements: string[];
}

export interface LessonCompletion {
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
}

export const studentService = {
  /**
   * Get all enrollments for the current student
   */
  getMyEnrollments: async (params?: {
    page?: number;
    limit?: number;
    status?: "active" | "completed";
  }): Promise<ApiResponse<StudentProgress[]>> => {
    const response = await apiClient.get("/api/enrollments/my", { params });
    return response.data;
  },

  /**
   * Get a single enrollment by course ID
   */
  getEnrollmentByCourse: async (courseId: string): Promise<ApiResponse<StudentProgress>> => {
    const response = await apiClient.get(`/api/enrollments/course/${courseId}`);
    return response.data;
  },

  /**
   * Enroll in a course
   */
  enrollInCourse: async (courseId: string): Promise<ApiResponse<StudentProgress>> => {
    const response = await apiClient.post("/api/enrollments", { courseId });
    return response.data;
  },

  /**
   * Mark a lesson as complete and update progress
   */
  completeLesson: async (
    courseId: string,
    lessonId: string
  ): Promise<ApiResponse<StudentProgress>> => {
    const response = await apiClient.put(`/api/enrollments/${courseId}/lessons/${lessonId}/complete`);
    return response.data;
  },

  /**
   * Get student dashboard stats
   */
  getDashboardStats: async (): Promise<ApiResponse<StudentDashboardStats>> => {
    const response = await apiClient.get("/api/users/stats");
    return response.data;
  },

  /**
   * Get lessons for a specific course enrollment
   */
  getCourseLessons: async (courseId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/api/lessons/course/${courseId}`);
    return response.data;
  },

  /**
   * Submit an assignment
   */
  submitAssignment: async (
    assignmentId: string,
    data: { content: string; attachments?: string[] }
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/api/submissions`, {
      assignment: assignmentId,
      ...data,
    });
    return response.data;
  },

  /**
   * Get all submissions for the current student
   */
  getMySubmissions: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get("/api/submissions/my", { params });
    return response.data;
  },
};
