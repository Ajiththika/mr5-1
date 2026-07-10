import apiClient from "@/lib/apiClient";
import { handleApiError } from "@/lib/errorHandler";

export interface CertificateRequest {
	_id: string;
	certificateId: string;
	certificationId: string;
	student: {
		_id: string;
		name: string;
		email: string;
		profileImage?: string;
		country?: string;
		certificationId?: string;
	} | string;
	course: {
		_id: string;
		title: string;
		category?: string;
		level?: string;
		thumbnail?: string;
	} | string;
	instructor?: {
		_id: string;
		name: string;
	} | string;
	title: string;
	courseName: string;
	studentName: string;
	instructorName?: string;
	institution: string;
	country: string;
	finalScore?: number;
	grade: string;
	completionDate: string;
	status: "pending_instructor" | "pending_admin" | "issued" | "rejected" | "revoked" | "expired";
	verificationHash?: string;
	qrCodeUrl?: string;
	pdfUrl?: string;
	createdAt: string;
}

export interface CertificateStats {
	total: number;
	issued: number;
	pending: number;
	rejected: number;
	byCountry: Array<{ _id: string; count: number }>;
	monthlyIssued: Array<{ _id: { year: number; month: number }; count: number }>;
}

export interface PaginationResult<T> {
	success: boolean;
	total: number;
	page: number;
	pages: number;
	certificates: T[];
}

export const certificateService = {
	// Request a certificate (student)
	requestCertificate: async (enrollmentId: string): Promise<any> => {
		try {
			const response = await apiClient.post("/api/certificates/request", { enrollmentId });
			return response.data;
		} catch (error) {
			handleApiError(error, "Request Certificate");
			throw error;
		}
	},

	// Get student's own certificates
	getMyCertificates: async (): Promise<{ success: boolean; total: number; certificates: CertificateRequest[] }> => {
		try {
			const response = await apiClient.get<{ success: boolean; total: number; certificates: CertificateRequest[] }>("/api/certificates/my");
			return response.data;
		} catch (error) {
			handleApiError(error, "Fetch My Certificates");
			throw error;
		}
	},

	// Get certificate by ID (student owns or admin)
	getCertificateById: async (id: string): Promise<CertificateRequest> => {
		try {
			const response = await apiClient.get<{ success: boolean; certificate: CertificateRequest }>(`/api/certificates/${id}`);
			return response.data.certificate;
		} catch (error) {
			handleApiError(error, "Fetch Certificate");
			throw error;
		}
	},

	// Instructor approval
	instructorApprove: async (id: string): Promise<any> => {
		try {
			const response = await apiClient.patch(`/api/certificates/${id}/instructor-approve`);
			return response.data;
		} catch (error) {
			handleApiError(error, "Instructor Approve Certificate");
			throw error;
		}
	},

	// Admin approval
	adminApprove: async (id: string): Promise<any> => {
		try {
			const response = await apiClient.patch(`/api/certificates/${id}/admin-approve`);
			return response.data;
		} catch (error) {
			handleApiError(error, "Admin Approve Certificate");
			throw error;
		}
	},

	// Reject certificate
	rejectCertificate: async (id: string, reason: string): Promise<any> => {
		try {
			const response = await apiClient.patch(`/api/certificates/${id}/reject`, { reason });
			return response.data;
		} catch (error) {
			handleApiError(error, "Reject Certificate");
			throw error;
		}
	},

	// Get pending certificates (Admin)
	getPendingCertificates: async (params?: {
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<PaginationResult<CertificateRequest>> => {
		try {
			const response = await apiClient.get<any>("/api/certificates/admin/pending", { params });
			return response.data;
		} catch (error) {
			handleApiError(error, "Fetch Pending Certificates");
			throw error;
		}
	},

	// Get certificate stats (Admin)
	getCertificateStats: async (): Promise<CertificateStats> => {
		try {
			const response = await apiClient.get<{ success: boolean; stats: CertificateStats }>("/api/certificates/admin/stats");
			return response.data.stats;
		} catch (error) {
			handleApiError(error, "Fetch Certificate Stats");
			throw error;
		}
	},

	// Generate / Stream PDF Download url
	getDownloadUrl: (id: string): string => {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
		return `${baseUrl}/api/certificates/${id}/download`;
	}
};
