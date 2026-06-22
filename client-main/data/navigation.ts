import {
  LayoutDashboard,
  Users,
  GraduationCap,
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

export const adminNavigation: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "AI-TEACHERs", href: "/admin/AI-TEACHERs", icon: Bot },
      { title: "Students", href: "/admin/students", icon: UserCheck },
      { title: "Courses", href: "/admin/courses", icon: BookOpen },
      { title: "Enrollments", href: "/admin/enrollments", icon: ClipboardList },
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
    ],
  },
];

export const studentNavigation: NavigationItem[] = [
  { title: "Dashboard", href: "/student/portal", icon: LayoutDashboard },
  { title: "My Courses", href: "/student/courses", icon: BookOpen },
  { title: "Assignments", href: "/student/assignments", icon: FileText },
  { title: "Grades", href: "/student/grades", icon: Trophy },
  { title: "Avatar Shop", href: "/student/shop", icon: ShoppingBag },
  { title: "Schedule", href: "/student/schedule", icon: Calendar },
];

// AI-TEACHER routes use /admin and course management — legacy /teacher/* paths were removed.
