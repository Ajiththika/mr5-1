import apiClient from "@/lib/apiClient";
import { EducationLevel } from "@/lib/education-levels";
import { User } from "@/types/user";

export interface ChatMemoryEntry {
  _id: string;
  role: "user" | "assistant" | "system";
  content: string;
  source?: string;
  mode?: "text" | "voice";
  createdAt: string;
}

export const studentLearningService = {
  async getLearningProfile(): Promise<{
    success: boolean;
    data: User & { educationLevels?: EducationLevel[] };
  }> {
    const response = await apiClient.get("/api/students/me/learning-profile");
    return response.data;
  },

  async updateLearningProfile(data: {
    age?: number;
    educationLevel?: EducationLevel;
    welcomeChatCompleted?: boolean;
  }) {
    const response = await apiClient.put("/api/students/me/learning-profile", data);
    return response.data;
  },

  async getChatMemory(limit = 40): Promise<{
    success: boolean;
    data: ChatMemoryEntry[];
  }> {
    const response = await apiClient.get("/api/students/me/chat-memory", {
      params: { limit },
    });
    return response.data;
  },

  async appendChatMemory(data: {
    role: "user" | "assistant" | "system";
    content: string;
    source?: string;
    mode?: "text" | "voice";
    course?: string;
  }) {
    const response = await apiClient.post("/api/students/me/chat-memory", data);
    return response.data;
  },

  async getAiContext(): Promise<{
    success: boolean;
    data: {
      profile: User;
      recentMessages: ChatMemoryEntry[];
    };
  }> {
    const response = await apiClient.get("/api/students/me/ai-context");
    return response.data;
  },
};
