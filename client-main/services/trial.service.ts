import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api";
import { TrialStatus } from "@/types/user";

export const trialService = {
    getStatus: async (): Promise<ApiResponse<TrialStatus>> => {
        const response = await apiClient.get("/api/trial/status");
        return response.data;
    },

    startTrial: async (): Promise<ApiResponse<TrialStatus>> => {
        const response = await apiClient.post("/api/trial/start");
        return response.data;
    },
};
