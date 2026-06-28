import apiClient from "@/lib/apiClient";
import type {
	AcademicSearchResponse,
	CertificateVerification,
	PrivacySettings,
	PublicProfile,
} from "@/types/identity";

const getApiBaseUrl = () =>
	process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:5001";

async function readIdentityResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		throw new Error(payload.error || "Identity request failed");
	}
	const payload = await response.json();
	return payload.data as T;
}

export async function searchAcademic(query: string, limit = 8) {
	const response = await apiClient.get<{ success: boolean; data: AcademicSearchResponse }>(
		"/api/identity/search",
		{ params: { q: query, limit } },
	);
	return response.data.data;
}

export async function fetchPublicProfile(uid: string) {
	const response = await apiClient.get<{ success: boolean; data: PublicProfile }>(
		`/api/identity/profiles/${encodeURIComponent(uid)}`,
	);
	return response.data.data;
}

export async function fetchPublicProfileServer(uid: string) {
	const response = await fetch(
		`${getApiBaseUrl()}/api/identity/profiles/${encodeURIComponent(uid)}`,
		{ next: { revalidate: 60 } },
	);
	return readIdentityResponse<PublicProfile>(response);
}

export async function verifyCertificate(verificationId: string) {
	const response = await apiClient.get<{ success: boolean; data: CertificateVerification }>(
		`/api/identity/certificates/verify/${encodeURIComponent(verificationId)}`,
	);
	return response.data.data;
}

export async function verifyCertificateServer(verificationId: string) {
	const response = await fetch(
		`${getApiBaseUrl()}/api/identity/certificates/verify/${encodeURIComponent(verificationId)}`,
		{ next: { revalidate: 300 } },
	);
	return readIdentityResponse<CertificateVerification>(response);
}

export async function fetchMyPrivacySettings() {
	const response = await apiClient.get<{ success: boolean; data: PrivacySettings }>(
		"/api/identity/me/privacy",
	);
	return response.data.data;
}

export async function updateMyPrivacySettings(payload: Partial<PrivacySettings>) {
	const response = await apiClient.patch<{ success: boolean; data: PrivacySettings }>(
		"/api/identity/me/privacy",
		payload,
	);
	return response.data.data;
}

export async function sendFriendRequest(recipientUid: string) {
	const response = await apiClient.post("/api/identity/me/friends", { recipientUid });
	return response.data.data;
}

export async function fetchFriendRequests() {
	const response = await apiClient.get<{ success: boolean; data: import("@/types/identity").IdentityFriendRecord[] }>(
		"/api/identity/me/friends",
	);
	return response.data.data;
}

export async function respondFriendRequest(requestId: string, action: "accept" | "decline" | "block") {
	const response = await apiClient.patch(`/api/identity/me/friends/${requestId}`, { action });
	return response.data.data;
}

export async function fetchIdentityNotifications(scope: "all" | "global" | "friends" | "personal" = "all") {
	const response = await apiClient.get<{ success: boolean; data: import("@/types/identity").IdentityNotification[] }>(
		"/api/identity/me/notifications",
		{ params: { scope: scope === "all" ? undefined : scope } },
	);
	return response.data.data;
}

export async function markIdentityNotificationRead(notificationId: string) {
	const response = await apiClient.patch(`/api/identity/me/notifications/${notificationId}/read`);
	return response.data.data;
}

export async function markAllIdentityNotificationsRead(scope: "all" | "global" | "friends" | "personal" = "all") {
	const response = await apiClient.patch("/api/identity/me/notifications/read-all", null, {
		params: scope === "all" ? {} : { scope },
	});
	return response.data;
}

export async function fetchLeaderboardFeed() {
	const response = await apiClient.get<{ success: boolean; data: import("@/types/identity").LeaderboardFeed }>(
		"/api/identity/leaderboard",
	);
	return response.data.data;
}

export async function fetchBadgeCatalog() {
	const response = await apiClient.get("/api/identity/badges");
	return response.data.data;
}
