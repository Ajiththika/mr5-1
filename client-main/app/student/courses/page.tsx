"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { enrollmentService, Enrollment } from "@/services/enrollment.service";
import { CourseCard } from "@/components/dashboard/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, CheckCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    enrollmentService
      .getMyEnrollments({ limit: 50 })
      .then((response) => setEnrollments(response.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = enrollment.course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || enrollment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const completedCount = enrollments.filter((e) => e.status === "completed").length;

  return (
    <>
      <StudentPageHeader
        title="My Courses"
        description="Track progress and jump back into your enrolled lessons."
        actions={
          <Button size="sm" asChild>
            <Link href="/courses">
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Link>
          </Button>
        }
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="rounded-lg bg-primary/15 p-2 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Active</p>
              <p className="text-lg font-bold">{activeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="rounded-lg bg-green-500/15 p-2 text-green-500">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search my courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex rounded-lg border border-border p-1">
            {(["all", "active", "completed"] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "secondary" : "ghost"}
                size="sm"
                className="h-8 capitalize"
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredEnrollments.map((enrollment, index) => (
            <motion.div
              key={enrollment._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <CourseCard
                courseId={enrollment.course._id}
                title={enrollment.course.title}
                progress={enrollment.progress}
                iconPath={enrollment.course.thumbnail}
                instructor={enrollment.course.teacher.name}
                status={enrollment.status}
                className="h-full"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term."
              : "Browse the library and enroll in your first course."}
          </p>
          {!searchQuery && (
            <Button className="mt-6" asChild>
              <Link href="/courses">Browse Library</Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
