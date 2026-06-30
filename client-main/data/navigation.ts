import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  CreditCard,
  FileText,
  Calendar,
  UserCheck,
  DollarSign,
  Globe,
  Trophy,
  ShoppingBag,
  Bot,
  ClipboardList,
  Sparkles,
  School,
  CheckCircle2,
  Shield,
  Library,
  Activity,
  Factory,
  Box,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  label?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

/** @deprecated Use NavigationSection for grouped admin nav */
export interface LegacyNavigationItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: LegacyNavigationItem[];
  label?: string;
}

/** MR5 Power Admin Hub navigation */
export const powerAdminNavigation: NavigationSection[] = [
  {
    title: "Command Center",
    items: [
      { title: "Overview", href: "/admin", icon: LayoutDashboard },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { title: "Activity Logs", href: "/admin/activity", icon: Activity },
    ],
  },
  {
    title: "Learning Engine",
    items: [
      { title: "Teacher Database", href: "/admin/teachers", icon: Bot },
      { title: "3D Teacher Studio", href: "/admin/teacher-studio", icon: Sparkles },
      { title: "Course Factory", href: "/admin/course-factory", icon: Factory },
      { title: "Classroom Builder", href: "/admin/classrooms", icon: School },
      { title: "Content Library", href: "/admin/content-library", icon: Library },
      { title: "3D Assets", href: "/admin/assets", icon: Box },
      { title: "Approval Queue", href: "/admin/approvals", icon: CheckCircle2 },
    ],
  },
  {
    title: "People & Access",
    items: [
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Students", href: "/admin/students", icon: UserCheck },
      { title: "Enrollments", href: "/admin/enrollments", icon: ClipboardList },
      { title: "Roles & Permissions", href: "/admin/roles", icon: Shield },
    ],
  },
  {
    title: "Finance",
    items: [
      { title: "Payments", href: "/admin/payments", icon: CreditCard },
      { title: "Revenue", href: "/admin/revenue", icon: DollarSign },
      { title: "Regional Pricing", href: "/admin/pricing", icon: Globe },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings },
      { title: "Reports", href: "/admin/reports", icon: FileText },
      { title: "Legacy Courses", href: "/admin/courses", icon: BookOpen },
      { title: "Legacy AI-TEACHERs", href: "/admin/AI-TEACHERs", icon: Bot },
    ],
  },
];

/** @deprecated Use powerAdminNavigation */
export const adminNavigation = powerAdminNavigation;

export const studentNavigation: NavigationItem[] = [
  { title: "Dashboard", href: "/student/portal", icon: LayoutDashboard },
  { title: "My Courses", href: "/student/courses", icon: BookOpen },
  { title: "Assignments", href: "/student/assignments", icon: FileText },
  { title: "Grades", href: "/student/grades", icon: Trophy },
  { title: "Own Store", href: "/avatar-shop", icon: ShoppingBag },
  { title: "Schedule", href: "/student/schedule", icon: Calendar },
];

// AI-TEACHER routes use /admin and course management — legacy /teacher/* paths were removed.
