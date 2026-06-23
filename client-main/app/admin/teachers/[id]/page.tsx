"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/power-admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { powerAdminService } from "@/services/power-admin.service";
import type { TeacherProfile } from "@/lib/power-admin/types";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);

  useEffect(() => {
    if (!id) return;
    powerAdminService
      .getTeacher(id)
      .then(setTeacher)
      .catch(() => toast.error("Teacher not found"));
  }, [id]);

  if (!teacher) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={teacher.displayName || teacher.user?.name || "Teacher Profile"}
        description={teacher.specialization}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/teachers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/teacher-studio?teacher=${id}`}>
                <Sparkles className="mr-2 h-4 w-4" />
                Edit in Studio
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={teacher.status || "active"} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tone</span>
              <span className="capitalize">{teacher.teachingTone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Experience</span>
              <span className="capitalize">{teacher.experienceLevel}</span>
            </div>
            <div>
              <p className="text-muted-foreground">Bio</p>
              <p className="mt-1">{teacher.bio || "No bio yet."}</p>
            </div>
            {teacher.notes && (
              <div>
                <p className="text-muted-foreground">Admin Notes</p>
                <p className="mt-1">{teacher.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">3D Studio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avatar</span>
              <span className="capitalize">{teacher.studio?.avatarType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voice</span>
              <span className="capitalize">{teacher.studio?.voiceProfile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Friendliness</span>
              <span>{teacher.studio?.friendliness ?? 75}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span>{teacher.studio?.expertMode ? "Expert" : "Beginner-friendly"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
