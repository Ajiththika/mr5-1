"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
import { powerAdminService } from "@/services/power-admin.service";
import type { TeacherProfile } from "@/lib/power-admin/types";
import { Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function TeacherStudioPage() {
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacher");
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [selectedId, setSelectedId] = useState(teacherId || "");
  const [studio, setStudio] = useState({
    avatarType: "cadet",
    voiceProfile: "warm",
    speakingSpeed: 1,
    friendliness: 75,
    expertMode: false,
    emotionPreset: "focused",
    backgroundScene: "classroom-default",
    classroomBehavior: "interactive",
    templateName: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    powerAdminService.getTeachers({ limit: 50 }).then((r) => setTeachers(r.data));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    powerAdminService.getTeacher(selectedId).then((t) => {
      if (t.studio) {
        setStudio({
          avatarType: t.studio.avatarType || "cadet",
          voiceProfile: t.studio.voiceProfile || "warm",
          speakingSpeed: t.studio.speakingSpeed ?? 1,
          friendliness: t.studio.friendliness ?? 75,
          expertMode: t.studio.expertMode ?? false,
          emotionPreset: t.studio.emotionPreset || "focused",
          backgroundScene: t.studio.backgroundScene || "classroom-default",
          classroomBehavior: t.studio.classroomBehavior || "interactive",
          templateName: t.studio.templateName || "",
        });
      }
    });
  }, [selectedId]);

  const save = async () => {
    if (!selectedId) {
      toast.error("Select a teacher first");
      return;
    }
    try {
      setSaving(true);
      await powerAdminService.updateTeacher(selectedId, { studio });
      toast.success("Studio settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="3D Teacher Studio"
        description="Configure avatar, voice, emotion, and classroom behavior for virtual teachers."
        actions={
          <Button onClick={save} disabled={saving || !selectedId}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        }
      />

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Select Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose a teacher to configure" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.displayName || t.user?.name} — {t.specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Avatar & Voice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>3D Avatar Type</Label>
              <Select
                value={studio.avatarType}
                onValueChange={(v) => setStudio((s) => ({ ...s, avatarType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["cadet", "professor", "mentor", "custom"].map((a) => (
                    <SelectItem key={a} value={a} className="capitalize">
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Voice Profile</Label>
              <Select
                value={studio.voiceProfile}
                onValueChange={(v) => setStudio((s) => ({ ...s, voiceProfile: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["warm", "clear", "energetic", "calm"].map((v) => (
                    <SelectItem key={v} value={v} className="capitalize">
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Speaking Speed: {studio.speakingSpeed.toFixed(1)}x</Label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={studio.speakingSpeed}
                className="w-full accent-primary"
                onChange={(e) =>
                  setStudio((s) => ({ ...s, speakingSpeed: parseFloat(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Friendliness: {studio.friendliness}%</Label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={studio.friendliness}
                className="w-full accent-primary"
                onChange={(e) =>
                  setStudio((s) => ({ ...s, friendliness: parseInt(e.target.value, 10) }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Behavior & Scene</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label>Expert Mode</Label>
              <Switch
                checked={studio.expertMode}
                onCheckedChange={(v) => setStudio((s) => ({ ...s, expertMode: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Emotion Preset</Label>
              <Select
                value={studio.emotionPreset}
                onValueChange={(v) => setStudio((s) => ({ ...s, emotionPreset: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["neutral", "happy", "focused", "empathetic"].map((e) => (
                    <SelectItem key={e} value={e} className="capitalize">
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Classroom Behavior</Label>
              <Select
                value={studio.classroomBehavior}
                onValueChange={(v) => setStudio((s) => ({ ...s, classroomBehavior: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["lecture", "interactive", "coach", "facilitator"].map((b) => (
                    <SelectItem key={b} value={b} className="capitalize">
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Live 3D preview connects to the classroom scene engine (Phase 2).
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
