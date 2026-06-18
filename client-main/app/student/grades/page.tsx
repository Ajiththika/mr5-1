"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2, TrendingUp } from "lucide-react";
import { enrollmentService, Enrollment } from "@/services/enrollment.service";

export default function StudentGrades() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentService
      .getMyEnrollments({ limit: 50 })
      .then((res) => setEnrollments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    if (!enrollments.length) return { average: 0, completed: 0 };
    const average = Math.round(
      enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length,
    );
    const completed = enrollments.filter((e) => e.status === "completed").length;
    return { average, completed };
  }, [enrollments]);

  return (
    <>
      <StudentPageHeader
        title="Grades & Progress"
        description="Course completion and learning progress across your enrollments."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-primary/15 p-3 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Average Progress</p>
              <p className="text-3xl font-bold">{summary.average}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-green-500/15 p-3 text-green-500">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Courses Completed</p>
              <p className="text-3xl font-bold">{summary.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                No progress yet. Complete lessons to see grades here.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/student/courses">Go to My Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{enrollment.course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.course.teacher.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          enrollment.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {enrollment.status}
                      </Badge>
                      <span className="text-lg font-bold text-primary">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                  <div className="mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/course/${enrollment.course._id}`}>
                        Open course
                      </Link>
                    </Button>
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
