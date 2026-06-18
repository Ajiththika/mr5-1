"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  BookOpen,
  Loader2,
  Clock,
  GraduationCap,
} from "lucide-react";
import { assignmentService } from "@/services/assignment.service";
import { enrollmentService, Enrollment } from "@/services/enrollment.service";

interface ScheduleItem {
  id: string;
  title: string;
  subtitle: string;
  date: Date;
  type: "assignment" | "course";
}

function groupByDay(items: ScheduleItem[]) {
  const groups = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    const key = item.date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries());
}

export default function StudentSchedule() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const enrollmentRes = await enrollmentService.getMyEnrollments({ limit: 50 });
        const enrollments: Enrollment[] = enrollmentRes.data || [];
        const scheduleItems: ScheduleItem[] = [];

        for (const enrollment of enrollments) {
          scheduleItems.push({
            id: `course-${enrollment._id}`,
            title: enrollment.course.title,
            subtitle: `Continue learning · ${enrollment.progress}% complete`,
            date: new Date(enrollment.updatedAt || enrollment.enrolledAt),
            type: "course",
          });
        }

        const courseIds = enrollments.map((e) => e.course._id);
        if (courseIds.length) {
          const assignmentLists = await Promise.all(
            courseIds.map((courseId) =>
              assignmentService.getAssignments({ course: courseId, limit: 30 }),
            ),
          );
          for (const assignment of assignmentLists.flatMap((r) => r.data || [])) {
            scheduleItems.push({
              id: assignment._id,
              title: assignment.title,
              subtitle: assignment.course?.title || "Assignment",
              date: new Date(assignment.dueDate),
              type: "assignment",
            });
          }
        }

        scheduleItems.sort((a, b) => a.date.getTime() - b.date.getTime());
        setItems(scheduleItems);
      } catch (error) {
        console.error("Failed to load schedule", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => groupByDay(items), [items]);
  const upcomingCount = items.filter(
    (item) => item.type === "assignment" && item.date.getTime() >= Date.now(),
  ).length;

  return (
    <>
      <StudentPageHeader
        title="Schedule"
        description="Your upcoming assignments, course activity, and learning timeline."
        actions={
          <Badge variant="secondary" className="px-3 py-1">
            {upcomingCount} upcoming deadlines
          </Badge>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Learning Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : grouped.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Your schedule is clear</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enroll in courses or check assignments for upcoming dates.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/student/assignments">Assignments</Link>
                </Button>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map(([day, dayItems]) => (
                <div key={day}>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {day}
                  </h3>
                  <div className="space-y-3">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-xl border border-border p-4"
                      >
                        <div
                          className={`rounded-lg p-2 ${
                            item.type === "assignment"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {item.type === "assignment" ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <GraduationCap className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{item.title}</p>
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.date.toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {item.type === "course" && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link href="/student/courses">
                              <BookOpen className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
