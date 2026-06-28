export interface TrialStatus {
    active: boolean;
    used: boolean;
    expiresAt: string | null;
    startedAt: string | null;
    remainingMs: number;
    canStart: boolean;
    hasProAccess: boolean;
    durationHours: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: "student" | "AI-TEACHER" | "admin";
    mr5Uid?: string;
    coverImageUrl?: string;
    status: string;
    avatarUrl?: string;
    avatarPreset?: string;
    onboardingCompleted?: boolean;
    welcomeChatCompleted?: boolean;
    trial?: TrialStatus;
    age?: number;
    educationLevel?: string;
    language?: string;
    timezone?: string;
    gradingSystem?: string;
    regionalPreferences?: {
        schoolHours: string;
        academicCalendar: string;
        holidays: string;
        additionalInfo: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: "student" | "AI-TEACHER";
    acceptLegal?: boolean;
    documentVersionIds?: string[];
}

export interface UserProfile extends User {
    bio?: string;
    avatar?: string;
    phone?: string;
    // Add other profile fields as needed
}
