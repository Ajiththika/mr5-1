export type LegalDocumentType =
  | "platform_terms"
  | "privacy_policy"
  | "cookie_notice"
  | "refund_policy"
  | "acceptable_use"
  | "parental_consent"
  | "ai_features_addendum"
  | "spatial_telemetry_addendum";

export type AcceptanceMethod =
  | "clickwrap"
  | "oauth_register"
  | "api"
  | "admin_override";

export interface PendingLegalDocument {
  slug: string;
  title: string;
  type: LegalDocumentType;
  versionNumber: string;
  documentVersionId: string;
  effectiveAt: string;
}

export interface LegalConsentStatus {
  satisfied: boolean;
  pendingDocuments: PendingLegalDocument[];
}

export interface UserConsentPreferences {
  aiFeatures: boolean;
  spatialTelemetry: boolean;
  marketingEmail: boolean;
  analyticsEnhanced: boolean;
}

export interface AcceptLegalDocumentsPayload {
  documentVersionIds: string[];
  locale?: string;
  source?: string;
}
