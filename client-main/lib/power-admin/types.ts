export type PublishStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export interface HubOverview {
  totalTeachers: number;
  totalCourses: number;
  totalClassrooms: number;
  totalStudents: number;
  publishedContent: number;
  draftContent: number;
  pendingApprovals: number;
  activeSessions: number;
  activeClassrooms: number;
  totalEnrollments: number;
  completedLessons: number;
  engagementRate: number;
  systemHealth: {
    api: string;
    database: string;
    aiService: string;
  };
}

export interface TeacherProfile {
  id: string;
  displayName?: string;
  specialization: string;
  subjectExpertise?: string[];
  languageStyle?: string;
  teachingTone?: string;
  experienceLevel?: string;
  bio?: string;
  status?: string;
  rating?: number;
  totalStudents?: number;
  tags?: string[];
  notes?: string;
  studio?: {
    avatarType?: string;
    voiceProfile?: string;
    speakingSpeed?: number;
    friendliness?: number;
    expertMode?: boolean;
    emotionPreset?: string;
    backgroundScene?: string;
    classroomBehavior?: string;
    templateName?: string;
  };
  user?: { name: string; email: string; avatarPreset?: string };
  courses?: { title: string; publishStatus?: string }[];
}

export interface ClassroomConfig {
  id: string;
  name: string;
  description?: string;
  course?: { title: string };
  teacher?: { displayName?: string; specialization?: string };
  theme?: string;
  background?: string;
  mode?: string;
  status?: string;
  panels?: string[];
  layout?: Record<string, boolean>;
}

export interface ContentApprovalItem {
  id: string;
  contentType: string;
  title: string;
  status: PublishStatus;
  priority?: string;
  submittedBy?: { name: string; email: string };
  reviewedBy?: { name: string };
  rejectionReason?: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id?: string;
  _id?: string;
  action: string;
  module: string;
  summary: string;
  createdAt: string;
  actor?: { name: string; email: string };
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
