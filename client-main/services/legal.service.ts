import apiClient from "@/lib/apiClient";
import type {
  AcceptLegalDocumentsPayload,
  LegalConsentStatus,
  UserConsentPreferences,
} from "@/types/legal-consent";

export interface LegalDocumentSummary {
  slug: string;
  title: string;
  type: string;
  isMandatory: boolean;
  versionNumber: string;
  effectiveAt: string;
}

export interface LegalDocumentDetail extends LegalDocumentSummary {
  content: string;
  contentFormat: string;
  documentVersionId: string;
}

export const legalService = {
  async getStatus(): Promise<LegalConsentStatus> {
    const res = await apiClient.get<{ success: boolean; data: LegalConsentStatus }>(
      "/api/legal/status",
    );
    return res.data.data;
  },

  async getRequired() {
    const res = await apiClient.get<{
      success: boolean;
      data: LegalConsentStatus["pendingDocuments"];
    }>("/api/legal/required");
    return res.data.data;
  },

  async getMandatoryIds(): Promise<string[]> {
    const res = await apiClient.get<{ success: boolean; data: string[] }>(
      "/api/legal/mandatory-ids",
    );
    return res.data.data;
  },

  async accept(payload: AcceptLegalDocumentsPayload): Promise<LegalConsentStatus> {
    const res = await apiClient.post<{ success: boolean; data: LegalConsentStatus }>(
      "/api/legal/accept",
      payload,
    );
    return res.data.data;
  },

  async getDocument(slug: string): Promise<LegalDocumentDetail> {
    const res = await apiClient.get<{ success: boolean; data: LegalDocumentDetail }>(
      `/api/legal/documents/${slug}`,
    );
    return res.data.data;
  },

  async getPreferences(): Promise<UserConsentPreferences> {
    const res = await apiClient.get<{ success: boolean; data: UserConsentPreferences }>(
      "/api/legal/preferences",
    );
    return res.data.data;
  },

  async updatePreferences(
    updates: Partial<UserConsentPreferences>,
  ): Promise<UserConsentPreferences> {
    const res = await apiClient.patch<{ success: boolean; data: UserConsentPreferences }>(
      "/api/legal/preferences",
      updates,
    );
    return res.data.data;
  },
};
