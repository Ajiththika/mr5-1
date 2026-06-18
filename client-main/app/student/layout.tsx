"use client";

import type { ReactNode } from "react";
import { StudentDashboardShell } from "@/components/student/StudentDashboardShell";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentDashboardShell>{children}</StudentDashboardShell>;
}
