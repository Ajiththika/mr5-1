import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/api-base";

const getBaseURL = () =>
    typeof window !== "undefined" ? getApiBaseUrl() : "";

let guestSession = false;
let guestSessionUntil = 0;

const markGuestSession = () => {
    guestSession = true;
    guestSessionUntil = Date.now() + 60_000;
};

export const clearGuestSession = () => {
    guestSession = false;
    guestSessionUntil = 0;
};

const isGuestSession = () =>
    guestSession && Date.now() < guestSessionUntil;

/** Never attempt token refresh for these endpoints (prevents infinite loops). */
const AUTH_NO_REFRESH_PATHS = [
    "/api/auth/refresh",
    "/api/auth/login",
    "/api/auth/register",
];

const shouldSkipRefresh = (url?: string) =>
    AUTH_NO_REFRESH_PATHS.some((path) => url?.includes(path));

const isExpectedUnauthenticated = (url?: string, status?: number) =>
    status === 401 &&
    (url?.includes("/api/auth/me") ||
        url?.includes("/api/auth/refresh") ||
        url?.includes("/api/auth/providers"));

let lastAuthCall = 0;
const AUTH_CALL_DELAY = 1000;

const apiClient = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        if (config.url?.includes("/api/auth/me")) {
            const now = Date.now();
            const timeSinceLastCall = now - lastAuthCall;
            if (timeSinceLastCall < AUTH_CALL_DELAY) {
                await new Promise((resolve) =>
                    setTimeout(resolve, AUTH_CALL_DELAY - timeSinceLastCall),
                );
            }
            lastAuthCall = Date.now();
        }
        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 429) {
            return Promise.reject(
                new Error("Too many requests. Please try again later."),
            );
        }

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (shouldSkipRefresh(originalRequest.url)) {
                return Promise.reject(error);
            }

            if (isGuestSession()) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => apiClient(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await apiClient.post("/api/auth/refresh");
                processQueue(null);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                markGuestSession();

                const onLoginPage =
                    typeof window !== "undefined" &&
                    window.location.pathname.includes("/login");

                const isBackgroundProbe =
                    originalRequest.url?.includes("/api/auth/me") ||
                    originalRequest.url?.includes("/api/identity/me/notifications");

                if (
                    typeof window !== "undefined" &&
                    !onLoginPage &&
                    !isBackgroundProbe
                ) {
                    window.location.href = "/login?expired=true";
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (
            process.env.NODE_ENV === "development" &&
            !isExpectedUnauthenticated(originalRequest?.url, error.response?.status)
        ) {
            const payload = error.response?.data as { error?: string; message?: string } | undefined;
            console.error("API Error:", {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                error: payload?.error || payload?.message,
            });
        }

        return Promise.reject(error);
    },
);

export default apiClient;
