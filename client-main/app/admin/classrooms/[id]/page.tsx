"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/power-admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import apiClient from "@/lib/apiClient";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

const PANELS = ["chat", "notes", "quiz", "timer", "timeline", "resources"];
const MODES = [
  "normal",
  "demo",
  "discussion",
  "quiz",
  "exam",
  "revision",
  "live_interaction",
];

export default function ClassroomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [classroom, setClassroom] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiClient
      .get(`/api/power-admin/classrooms/${id}`)
      .then((r) => setClassroom(r.data.data))
      .catch(() => toast.error("Classroom not found"));
  }, [id]);

  const save = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/api/power-admin/classrooms/${id}`, classroom);
      toast.success("Classroom saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!classroom) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={classroom.name}
        description="Configure layout, panels, and classroom mode"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/classrooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </>
        }
      />

      <StatusBadge status={classroom.status || "draft"} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Mode & Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Classroom Mode</Label>
              <Select
                value={classroom.mode}
                onValueChange={(v) => setClassroom((c: any) => ({ ...c, mode: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODES.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={classroom.theme}
                onValueChange={(v) => setClassroom((c: any) => ({ ...c, theme: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["classic", "modern", "nature", "space", "minimal"].map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Layout & Panels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "blackboard", label: "Blackboard" },
              { key: "smartboard", label: "Smartboard" },
              { key: "studentArea", label: "Student Area" },
              { key: "teacherArea", label: "Teacher Area" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch
                  checked={classroom.layout?.[key] ?? true}
                  onCheckedChange={(v) =>
                    setClassroom((c: any) => ({
                      ...c,
                      layout: { ...c.layout, [key]: v },
                    }))
                  }
                />
              </div>
            ))}
            <div className="pt-2">
              <Label className="mb-2 block">Active Panels</Label>
              <div className="flex flex-wrap gap-2">
                {PANELS.map((p) => {
                  const active = (classroom.panels || []).includes(p);
                  return (
                    <Button
                      key={p}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="capitalize"
                      onClick={() => {
                        const panels = classroom.panels || [];
                        setClassroom((c: any) => ({
                          ...c,
                          panels: active ? panels.filter((x: string) => x !== p) : [...panels, p],
                        }));
                      }}
                    >
                      {p}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
