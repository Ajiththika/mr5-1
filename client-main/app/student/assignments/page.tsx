"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, AlertCircle, Loader2 } from "lucide-react";
import { assignmentService, Assignment } from "@/services/assignment.service";
import { enrollmentService } from "@/services/enrollment.service";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const enrollments = await enrollmentService.getMyEnrollments({ limit: 50 });
        const courseIds = (enrollments.data || []).map((e) => e.course._id);
        if (courseIds.length === 0) {
          setAssignments([]);
          return;
        }
        const results = await Promise.all(
          courseIds.map((courseId) =>
            assignmentService.getAssignments({ course: courseId, limit: 50 })
          )
        );
        const merged = results.flatMap((r) => r.data || []);
        setAssignments(merged);
      } catch (error) {
        console.error("Failed to load assignments", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDueDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground mt-1">Assignments from your enrolled courses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Assignment List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No assignments yet. Enroll in a course to see assignments here.
              </p>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-1" />
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.course?.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Due {formatDueDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        Pending
                      </Badge>
                    </div>
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
