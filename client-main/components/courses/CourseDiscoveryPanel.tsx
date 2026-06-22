"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, GitMerge, ArrowRight, BookOpen } from "lucide-react";
import type { DiscoveryResult } from "@/services/courseDiscovery.service";

interface CourseDiscoveryPanelProps {
  discovery: DiscoveryResult;
  onOpenCourse: (courseId: string) => void;
  onGenerate: () => void;
  generating?: boolean;
}

export function CourseDiscoveryPanel({
  discovery,
  onOpenCourse,
  onGenerate,
  generating = false,
}: CourseDiscoveryPanelProps) {
  const { intent, recommendation, matches, partialModules } = discovery;

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/60 backdrop-blur p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono mb-2">
            Search Intent Detected
          </p>
          <h3 className="text-xl font-bold">{intent.topic}</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge>{intent.level}</Badge>
            <Badge variant="outline">{intent.intentType.replace("_", " ")}</Badge>
            <Badge variant="outline">~{intent.durationWeeks} weeks</Badge>
          </div>
          {intent.subtopics.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Subtopics: {intent.subtopics.slice(0, 4).join(", ")}
            </p>
          )}
        </div>

        {recommendation === "open_existing" && discovery.courseId && (
          <Button onClick={() => onOpenCourse(discovery.courseId!)} className="shrink-0">
            <BookOpen className="h-4 w-4 mr-2" />
            Open Course
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {matches.length > 0 && recommendation !== "open_existing" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Related courses found:</p>
          <div className="flex flex-wrap gap-2">
            {matches.slice(0, 3).map((match) => (
              <button
                key={match.courseId}
                type="button"
                onClick={() => onOpenCourse(match.courseId)}
                className="text-left rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-primary/50 transition-colors text-sm"
              >
                {match.title}
                <span className="block text-xs text-muted-foreground">{match.matchType} match</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {partialModules.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GitMerge className="h-4 w-4 text-primary" />
          {partialModules.length} related lesson(s) can be merged into a full course
        </div>
      )}

      {recommendation !== "open_existing" && (
        <div className="pt-2 border-t border-white/10">
          <Button
            onClick={onGenerate}
            disabled={generating}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {recommendation === "merge_partial"
              ? "Assemble Complete Course"
              : "Create New Course"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Uses approved sources and AI-generated original instructional content.
            New courses require admin review before publishing.
          </p>
        </div>
      )}
    </div>
  );
}
