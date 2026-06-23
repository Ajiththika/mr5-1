export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  POWER_LEADER: "power_leader",
  CONTENT_ADMIN: "content_admin",
  TEACHER_MANAGER: "teacher_manager",
  COURSE_CREATOR: "course_creator",
  REVIEWER: "reviewer",
  ANALYTICS_VIEWER: "analytics_viewer",
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];

export const PERMISSIONS = {
  VIEW_OVERVIEW: "view_overview",
  MANAGE_TEACHERS: "manage_teachers",
  MANAGE_TEACHER_STUDIO: "manage_teacher_studio",
  MANAGE_COURSES: "manage_courses",
  MANAGE_CLASSROOMS: "manage_classrooms",
  REVIEW_CONTENT: "review_content",
  PUBLISH_CONTENT: "publish_content",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_ROLES: "manage_roles",
  VIEW_ACTIVITY: "view_activity",
  MANAGE_USERS: "manage_users",
  MANAGE_PAYMENTS: "manage_payments",
  USE_AI_ASSIST: "use_ai_assist",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [ADMIN_ROLES.SUPER_ADMIN]: ALL,
  [ADMIN_ROLES.POWER_LEADER]: [
    PERMISSIONS.VIEW_OVERVIEW,
    PERMISSIONS.MANAGE_TEACHERS,
    PERMISSIONS.MANAGE_TEACHER_STUDIO,
    PERMISSIONS.MANAGE_CLASSROOMS,
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ACTIVITY,
    PERMISSIONS.USE_AI_ASSIST,
  ],
  [ADMIN_ROLES.CONTENT_ADMIN]: [
    PERMISSIONS.VIEW_OVERVIEW,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.VIEW_ACTIVITY,
    PERMISSIONS.USE_AI_ASSIST,
  ],
  [ADMIN_ROLES.TEACHER_MANAGER]: [
    PERMISSIONS.VIEW_OVERVIEW,
    PERMISSIONS.MANAGE_TEACHERS,
    PERMISSIONS.MANAGE_TEACHER_STUDIO,
    PERMISSIONS.MANAGE_CLASSROOMS,
    PERMISSIONS.VIEW_ACTIVITY,
  ],
  [ADMIN_ROLES.COURSE_CREATOR]: [
    PERMISSIONS.VIEW_OVERVIEW,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.USE_AI_ASSIST,
  ],
  [ADMIN_ROLES.REVIEWER]: [
    PERMISSIONS.VIEW_OVERVIEW,
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.VIEW_ACTIVITY,
  ],
  [ADMIN_ROLES.ANALYTICS_VIEWER]: [
    PERMISSIONS.VIEW_OVERVIEW,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_ACTIVITY,
  ],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  [ADMIN_ROLES.SUPER_ADMIN]: "Super Admin",
  [ADMIN_ROLES.POWER_LEADER]: "Power Leader",
  [ADMIN_ROLES.CONTENT_ADMIN]: "Content Admin",
  [ADMIN_ROLES.TEACHER_MANAGER]: "Teacher Manager",
  [ADMIN_ROLES.COURSE_CREATOR]: "Course Creator",
  [ADMIN_ROLES.REVIEWER]: "Reviewer",
  [ADMIN_ROLES.ANALYTICS_VIEWER]: "Analytics Viewer",
};

export function resolveAdminRole(user?: { role?: string; adminRole?: string }): AdminRole | null {
  if (!user || user.role !== "admin") return null;
  return (user.adminRole as AdminRole) || ADMIN_ROLES.SUPER_ADMIN;
}

export function getPermissions(user?: { role?: string; adminRole?: string }): Permission[] {
  const hubRole = resolveAdminRole(user);
  if (!hubRole) return [];
  return ROLE_PERMISSIONS[hubRole] || [];
}

export function hasPermission(
  user: { role?: string; adminRole?: string } | null | undefined,
  permission: Permission,
): boolean {
  return getPermissions(user ?? undefined).includes(permission);
}
