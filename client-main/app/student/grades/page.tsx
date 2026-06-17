"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Loader2 } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground mt-1">Course progress from your enrollments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : enrollments.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No grades yet. Complete lessons in your enrolled courses to track progress.
              </p>
            ) : (
              <div className="space-y-6">
                {enrollments.map((enrollment) => (
                  <div key={enrollment._id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{enrollment.course.title}</p>
                        <p className="text-sm text-muted-foreground">{enrollment.course.teacher.name}</p>
                      </div>
                      <span className="font-bold text-primary">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
