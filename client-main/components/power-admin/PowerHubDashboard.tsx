"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HubStatCard } from "@/components/power-admin/HubStatCard";
import { ActivityFeed } from "@/components/power-admin/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { powerAdminService } from "@/services/power-admin.service";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { ActivityLogItem, HubOverview } from "@/lib/power-admin/types";
import {
  Bot,
  BookOpen,
  School,
  Users,
  CheckCircle2,
  Activity,
  Sparkles,
  Factory,
  ArrowRight,
  HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

export function PowerHubDashboard() {
  const { roleLabel } = useAdminPermissions();
  const [overview, setOverview] = useState<HubOverview | null>(null);
  const [activity, setActivity] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [ov, act] = await Promise.all([
        powerAdminService.getOverview(),
        powerAdminService.getActivity(12),
      ]);
      setOverview(ov);
      setActivity(act);
    } catch {
      toast.error("Could not load Power Admin Hub overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Power Admin Hub"
        description={
          roleLabel
            ? `Central command center · ${roleLabel}`
            : "Central command center for MR5 School"
        }
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HubStatCard
          title="Teachers"
          value={loading ? "—" : overview?.totalTeachers ?? 0}
          subtitle="3D AI teacher profiles"
          icon={Bot}
        />
        <HubStatCard
          title="Courses"
          value={loading ? "—" : overview?.totalCourses ?? 0}
          subtitle={`${overview?.publishedContent ?? 0} published · ${overview?.draftContent ?? 0} draft`}
          icon={BookOpen}
        />
        <HubStatCard
          title="Classrooms"
          value={loading ? "—" : overview?.totalClassrooms ?? 0}
          subtitle={`${overview?.activeClassrooms ?? 0} active`}
          icon={School}
        />
        <HubStatCard
          title="Students"
          value={loading ? "—" : overview?.totalStudents ?? 0}
          subtitle={`${overview?.engagementRate ?? 0}% engagement`}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HubStatCard
          title="Pending Approvals"
          value={loading ? "—" : overview?.pendingApprovals ?? 0}
          subtitle="Awaiting review"
          icon={CheckCircle2}
          className="lg:col-span-1"
        />
        <HubStatCard
          title="Active Sessions"
          value={loading ? "—" : overview?.activeSessions ?? 0}
          subtitle="Last 30 days"
          icon={Activity}
          className="lg:col-span-1"
        />
        <Card className="lg:col-span-1 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <HeartPulse className="h-4 w-4 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {["api", "database", "aiService"].map((key) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize text-muted-foreground">
                  {key === "aiService" ? "AI Service" : key}
                </span>
                <span className="font-medium capitalize text-emerald-600">
                  {overview?.systemHealth?.[key as keyof HubOverview["systemHealth"]] ?? "—"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/admin/teacher-studio", label: "3D Teacher Studio", icon: Sparkles },
              { href: "/admin/course-factory", label: "Course Factory", icon: Factory },
              { href: "/admin/classrooms", label: "Build Classroom", icon: School },
              { href: "/admin/approvals", label: "Review Content", icon: CheckCircle2 },
            ].map(({ href, label, icon: Icon }) => (
              <Button key={href} variant="outline" className="h-auto justify-between py-3" asChild>
                <Link href={href}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/activity">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
