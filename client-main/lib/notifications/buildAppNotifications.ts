import { assignmentService } from "@/services/assignment.service";
import { enrollmentService } from "@/services/enrollment.service";
import { legalService } from "@/services/legal.service";
import type { AppNotification } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / MS_PER_DAY);
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
}

/**
 * Builds actionable notifications from live LMS data (assignments, courses, legal).
 */
export async function buildAppNotifications(): Promise<AppNotification[]> {
  const items: AppNotification[] = [];
  const now = new Date();

  try {
    const pendingLegal = await legalService.getRequired();
    if (pendingLegal.length > 0) {
      items.push({
        id: "legal-consent-required",
        title: "Legal agreements required",
        message: `Accept ${pendingLegal.length} document${pendingLegal.length > 1 ? "s" : ""} to unlock full platform access.`,
        type: "warning",
        timestamp: now,
        read: false,
        href: "/legal/accept",
        action: { label: "Review & accept", href: "/legal/accept" },
      });
    }
  } catch {
    // User may not be authenticated yet
  }

  try {
    const [assignmentsRes, enrollmentsRes] = await Promise.all([
      assignmentService.getAssignments({ limit: 20 }),
      enrollmentService.getMyEnrollments({ limit: 20 }),
    ]);

    for (const assignment of assignmentsRes.data ?? []) {
      const due = new Date(assignment.dueDate);
      const remaining = daysUntil(due);

      if (remaining < 0) {
        items.push({
          id: `assignment-overdue-${assignment._id}`,
          title: "Assignment overdue",
          message: `"${assignment.title}" in ${assignment.course.title} was due ${Math.abs(remaining)} day${Math.abs(remaining) !== 1 ? "s" : ""} ago.`,
          type: "error",
          timestamp: now,
          read: false,
          href: "/student/assignments",
          action: { label: "View assignments", href: "/student/assignments" },
        });
      } else if (remaining <= 3) {
        items.push({
          id: `assignment-due-${assignment._id}`,
          title: remaining === 0 ? "Assignment due today" : `Due in ${remaining} day${remaining !== 1 ? "s" : ""}`,
          message: `"${assignment.title}" — ${assignment.course.title}`,
          type: "warning",
          timestamp: now,
          read: false,
          href: "/student/assignments",
          action: { label: "Open assignments", href: "/student/assignments" },
        });
      }
    }

    for (const enrollment of enrollmentsRes.data ?? []) {
      if (enrollment.status === "completed") continue;

      const progress = enrollment.progress ?? 0;
      const enrolledDays = daysSince(new Date(enrollment.enrolledAt));

      if (progress < 25 && enrolledDays >= 2) {
        items.push({
          id: `course-continue-${enrollment.course._id}`,
          title: "Continue your course",
          message: `"${enrollment.course.title}" is at ${Math.round(progress)}% — pick up where you left off.`,
          type: "info",
          timestamp: now,
          read: false,
          href: `/course/${enrollment.course._id}`,
          action: { label: "Resume learning", href: `/course/${enrollment.course._id}` },
        });
      } else if (progress >= 100) {
        items.push({
          id: `course-completed-${enrollment.course._id}`,
          title: "Course completed!",
          message: `Great work finishing "${enrollment.course.title}".`,
          type: "success",
          timestamp: now,
          read: false,
          href: `/course/${enrollment.course._id}`,
        });
      }
    }
  } catch {
    // Non-student roles or API unavailable
  }

  const priority: Record<AppNotification["type"], number> = {
    error: 0,
    warning: 1,
    info: 2,
    success: 3,
  };

  return items.sort((a, b) => priority[a.type] - priority[b.type]).slice(0, 12);
}
