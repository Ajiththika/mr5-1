import apiClient from "@/lib/apiClient";
import { handleApiError } from "@/lib/errorHandler";
import type {
  ActivityLogItem,
  ClassroomConfig,
  ContentApprovalItem,
  HubOverview,
  PaginationMeta,
  TeacherProfile,
} from "@/lib/power-admin/types";

interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

export const powerAdminService = {
  getOverview: async (): Promise<HubOverview> => {
    const res = await apiClient.get<{ success: boolean; data: HubOverview }>(
      "/api/power-admin/overview",
    );
    return res.data.data;
  },

  getActivity: async (limit = 25): Promise<ActivityLogItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: ActivityLogItem[] }>(
      "/api/power-admin/activity",
      { params: { limit } },
    );
    return res.data.data;
  },

  getTeachers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<Paginated<TeacherProfile>> => {
    const res = await apiClient.get<{ success: boolean; data: TeacherProfile[]; pagination: PaginationMeta }>(
      "/api/power-admin/teachers",
      { params },
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },

  getTeacher: async (id: string): Promise<TeacherProfile> => {
    const res = await apiClient.get<{ success: boolean; data: TeacherProfile }>(
      `/api/power-admin/teachers/${id}`,
    );
    return res.data.data;
  },

  updateTeacher: async (id: string, data: Partial<TeacherProfile>): Promise<TeacherProfile> => {
    const res = await apiClient.put<{ success: boolean; data: TeacherProfile }>(
      `/api/power-admin/teachers/${id}`,
      data,
    );
    return res.data.data;
  },

  cloneTeacher: async (id: string): Promise<TeacherProfile> => {
    const res = await apiClient.post<{ success: boolean; data: TeacherProfile }>(
      `/api/power-admin/teachers/${id}/clone`,
    );
    return res.data.data;
  },

  archiveTeacher: async (id: string): Promise<TeacherProfile> => {
    const res = await apiClient.patch<{ success: boolean; data: TeacherProfile }>(
      `/api/power-admin/teachers/${id}/archive`,
    );
    return res.data.data;
  },

  getClassrooms: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<Paginated<ClassroomConfig>> => {
    const res = await apiClient.get<{
      success: boolean;
      data: ClassroomConfig[];
      pagination: PaginationMeta;
    }>("/api/power-admin/classrooms", { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  createClassroom: async (data: Partial<ClassroomConfig>): Promise<ClassroomConfig> => {
    const res = await apiClient.post<{ success: boolean; data: ClassroomConfig }>(
      "/api/power-admin/classrooms",
      data,
    );
    return res.data.data;
  },

  updateClassroom: async (id: string, data: Partial<ClassroomConfig>): Promise<ClassroomConfig> => {
    const res = await apiClient.put<{ success: boolean; data: ClassroomConfig }>(
      `/api/power-admin/classrooms/${id}`,
      data,
    );
    return res.data.data;
  },

  getApprovals: async (params?: {
    page?: number;
    status?: string;
  }): Promise<Paginated<ContentApprovalItem>> => {
    const res = await apiClient.get<{
      success: boolean;
      data: ContentApprovalItem[];
      pagination: PaginationMeta;
    }>("/api/power-admin/approvals", { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  approveContent: async (id: string, comment?: string) => {
    const res = await apiClient.post(`/api/power-admin/approvals/${id}/approve`, { comment });
    return res.data.data;
  },

  rejectContent: async (id: string, reason: string, comment?: string) => {
    const res = await apiClient.post(`/api/power-admin/approvals/${id}/reject`, { reason, comment });
    return res.data.data;
  },

  publishContent: async (id: string) => {
    const res = await apiClient.post(`/api/power-admin/approvals/${id}/publish`);
    return res.data.data;
  },

  getAnalytics: async () => {
    const res = await apiClient.get("/api/power-admin/analytics");
    return res.data.data;
  },

  getRoles: async () => {
    const res = await apiClient.get("/api/power-admin/roles");
    return res.data.data;
  },

  assignRole: async (userId: string, adminRole: string) => {
    const res = await apiClient.patch(`/api/power-admin/roles/${userId}`, { adminRole });
    return res.data.data;
  },

  getContentLibrary: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await apiClient.get("/api/power-admin/content-library", { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  getCourseDetail: async (id: string) => {
    const res = await apiClient.get(`/api/power-admin/courses/${id}`);
    return res.data.data;
  },

  aiLessonAssist: async (payload: { type: string; topic?: string; content?: string }) => {
    try {
      const res = await apiClient.post("/api/power-admin/ai/lesson-assist", payload);
      return res.data.data;
    } catch (error) {
      handleApiError(error, "AI Lesson Assist");
      throw error;
    }
  },
};
