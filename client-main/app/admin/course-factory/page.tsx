"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateCourseModal } from "@/components/admin/create-course-modal";
import { StatusBadge } from "@/components/power-admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminService } from "@/services/admin.service";
import { Factory, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CourseFactoryPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCourses({ limit: 50 });
      setCourses(res.data);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Course Factory"
        description="Build courses: Topic → Lesson → Example → Quiz → Practice → Completion"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        }
      />

      <div className="mb-6 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Guided workflow</p>
        <p className="mt-1">
          Create a course, add modules and lessons, attach quizzes, then submit for approval before publishing.
        </p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id || c._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-primary" />
                      <div>
                        <Link
                          href={`/admin/course-factory/${c.id || c._id}`}
                          className="font-medium hover:text-primary"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{c.category || "—"}</TableCell>
                  <TableCell>{c.level || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.publishStatus || (c.isApproved ? "published" : "draft")} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/course-factory/${c.id || c._id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateCourseModal
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => {
          setShowCreate(false);
          load();
        }}
      />
    </div>
  );
}
