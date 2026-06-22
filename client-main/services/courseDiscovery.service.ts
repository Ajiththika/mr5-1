import apiClient from "@/lib/apiClient";

export interface SearchIntent {
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  intentType: "full_course" | "lesson" | "skill_path";
  subtopics: string[];
  durationWeeks: number;
  keywords: string[];
  confidence: number;
}

export interface CourseMatch {
  courseId: string;
  title: string;
  description?: string;
  level: string;
  category?: string;
  price: number;
  thumbnail?: string;
  teacher?: { name: string };
  isApproved: boolean;
  score: number;
  matchType: "exact" | "similar" | "related";
}

export interface DiscoveryResult {
  query: string;
  intent: SearchIntent;
  matches: CourseMatch[];
  partialModules: Array<{
    lessonId: string;
    lessonTitle: string;
    courseId?: string;
    courseTitle?: string;
  }>;
  recommendation: "open_existing" | "assemble_new" | "merge_partial";
  bestMatch?: { courseId: string; score: number; matchType: string };
  action: "open_existing" | "generate_or_merge";
  courseId?: string;
  accessPath?: string;
}

export interface GenerationJobResult {
  action: "open_existing" | "poll_job";
  jobId?: string;
  status?: string;
  courseId?: string;
  intent?: SearchIntent;
  matches?: CourseMatch[];
}

export interface GenerationJobStatus {
  jobId: string;
  query: string;
  intent: SearchIntent;
  status: "queued" | "matching" | "assembling" | "generating" | "completed" | "failed";
  recommendation?: string;
  reviewStatus?: string;
  course?: {
    _id: string;
    title: string;
    description?: string;
    level: string;
    price: number;
    thumbnail?: string;
    isApproved: boolean;
  };
  matchedCourses?: Array<{ _id: string; title: string; level: string }>;
  syllabus?: Record<string, unknown>;
  error?: string;
  auditLog?: Array<{ at: string; action: string; detail: string }>;
}

export interface SearchSuggestions {
  intent: SearchIntent;
  suggestions: string[];
  courses: CourseMatch[];
  recommendation: string;
}

export const courseDiscoveryService = {
  getSuggestions: async (q: string): Promise<SearchSuggestions> => {
    const response = await apiClient.get<{ success: boolean; data: SearchSuggestions }>(
      "/api/courses/discover",
      { params: { q } },
    );
    return response.data.data;
  },

  discover: async (query: string): Promise<DiscoveryResult> => {
    const response = await apiClient.post<{ success: boolean; data: DiscoveryResult }>(
      "/api/courses/discover",
      { query },
    );
    return response.data.data;
  },

  startGeneration: async (
    query: string,
    forceGenerate = false,
  ): Promise<GenerationJobResult> => {
    const response = await apiClient.post<{ success: boolean; data: GenerationJobResult }>(
      "/api/courses/generate",
      { query, forceGenerate },
    );
    return response.data.data;
  },

  getJobStatus: async (jobId: string): Promise<GenerationJobStatus> => {
    const response = await apiClient.get<{ success: boolean; data: GenerationJobStatus }>(
      `/api/courses/generation/${jobId}`,
    );
    return response.data.data;
  },
};
