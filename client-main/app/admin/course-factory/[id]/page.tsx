"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/power-admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { powerAdminService } from "@/services/power-admin.service";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

export default function CourseFactoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiResult, setAiResult] = useState("");

  useEffect(() => {
    if (!id) return;
    powerAdminService.getCourseDetail(id).then(setData).catch(() => toast.error("Course not found"));
  }, [id]);

  const runAi = async (type: string) => {
    try {
      const result = await powerAdminService.aiLessonAssist({
        type,
        topic: aiTopic || data?.course?.title,
      });
      setAiResult(typeof result.result === "string" ? result.result : JSON.stringify(result.result, null, 2));
      toast.success("AI assist complete");
    } catch {
      toast.error("AI assist unavailable — check API keys");
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const { course, lessons } = data;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={course.title}
        description="Lesson builder & AI-assisted content creation"
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/course-factory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <StatusBadge status={course.publishStatus || "draft"} />
        <span className="text-sm text-muted-foreground">{course.category} · {course.level}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Lessons ({lessons.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons yet. Use AI assist to generate an outline.</p>
            ) : (
              lessons.map((l: any, i: number) => (
                <div key={l.id} className="rounded-lg border border-border/60 p-4">
                  <p className="font-medium">
                    {i + 1}. {l.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l.moduleTitle || "Module"} · {l.duration || "—"} min
                  </p>
                  <StatusBadge status={l.publishStatus || "draft"} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Lesson Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Topic for AI generation"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "outline", label: "Outline" },
                { type: "examples", label: "Examples" },
                { type: "quiz", label: "Quiz" },
                { type: "summary", label: "Summary" },
                { type: "simplify", label: "Simplify" },
                { type: "translate", label: "Tanglish" },
              ].map(({ type, label }) => (
                <Button key={type} variant="outline" size="sm" onClick={() => runAi(type)}>
                  {label}
                </Button>
              ))}
            </div>
            {aiResult && (
              <Textarea value={aiResult} readOnly rows={10} className="text-xs font-mono" />
            )}
            <Button className="w-full" variant="secondary">
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
