"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Loader2, AlertCircle } from "lucide-react";
import { assignmentService, Assignment } from "@/services/assignment.service";
import { enrollmentService } from "@/services/enrollment.service";

function formatDueDate(date: string) {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function dueStatus(dueDate: string) {
  const due = new Date(dueDate).getTime();
  const now = Date.now();
  const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Overdue", variant: "destructive" as const };
  if (days <= 3) return { label: "Due soon", variant: "default" as const };
  return { label: "Upcoming", variant: "outline" as const };
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "overdue">("all");

  useEffect(() => {
    const load = async () => {
      try {
        const enrollments = await enrollmentService.getMyEnrollments({ limit: 50 });
        const courseIds = (enrollments.data || []).map((e) => e.course._id);
        if (!courseIds.length) {
          setAssignments([]);
          return;
        }
        const results = await Promise.all(
          courseIds.map((courseId) =>
            assignmentService.getAssignments({ course: courseId, limit: 50 }),
          ),
        );
        const merged = results
          .flatMap((r) => r.data || [])
          .sort(
            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
          );
        setAssignments(merged);
      } catch (error) {
        console.error("Failed to load assignments", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    return assignments.filter((assignment) => {
      const due = new Date(assignment.dueDate).getTime();
      if (filter === "overdue") return due < now;
      if (filter === "upcoming") return due >= now;
      return true;
    });
  }, [assignments, filter]);

  const overdueCount = assignments.filter(
    (a) => new Date(a.dueDate).getTime() < Date.now(),
  ).length;

  return (
    <>
      <StudentPageHeader
        title="Assignments"
        description="Deadlines and tasks from all your enrolled courses."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "upcoming", "overdue"] as const).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "secondary" : "outline"}
            onClick={() => setFilter(key)}
            className="capitalize"
          >
            {key}
            {key === "overdue" && overdueCount > 0 && (
              <span className="ml-2 rounded-full bg-destructive/15 px-1.5 text-[10px] text-destructive">
                {overdueCount}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Assignment List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">No assignments {filter !== "all" ? `(${filter})` : ""}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enroll in a course to see assignments here.
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((assignment) => {
                const status = dueStatus(assignment.dueDate);
                return (
                  <div
                    key={assignment._id}
                    className="flex items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-500">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{assignment.title}</h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {assignment.course?.title}
                      </p>
                      {assignment.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {assignment.description}
                        </p>
                      )}
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due {formatDueDate(assignment.dueDate)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
