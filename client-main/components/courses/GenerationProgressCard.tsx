"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import type { GenerationJobStatus } from "@/services/courseDiscovery.service";

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued…",
  matching: "Searching existing courses…",
  assembling: "Assembling content…",
  generating: "Building your course…",
  completed: "Course ready!",
  failed: "Generation failed",
};

interface GenerationProgressCardProps {
  jobId: string;
  query: string;
  onComplete: (courseId: string) => void;
  onFailed?: (error: string) => void;
}

export function GenerationProgressCard({
  jobId,
  query,
  onComplete,
  onFailed,
}: GenerationProgressCardProps) {
  const [status, setStatus] = useState<GenerationJobStatus | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const response = await fetch(`/api/courses/generation/${jobId}`, {
          credentials: "include",
        });
        const body = await response.json();
        if (cancelled) return;

        const job = body.data as GenerationJobStatus;
        setStatus(job);

        if (job.status === "completed" && job.course?._id) {
          setPolling(false);
          if (interval) clearInterval(interval);
          onComplete(job.course._id);
        } else if (job.status === "failed") {
          setPolling(false);
          if (interval) clearInterval(interval);
          onFailed?.(job.error || "Generation failed");
        }
      } catch {
        if (!cancelled) onFailed?.("Unable to check generation status");
      }
    };

    void poll();
    interval = setInterval(poll, 2500);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [jobId, onComplete, onFailed]);

  const progress =
    status?.status === "queued"
      ? 10
      : status?.status === "matching"
        ? 25
        : status?.status === "assembling"
          ? 50
          : status?.status === "generating"
            ? 75
            : status?.status === "completed"
              ? 100
              : 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/30 bg-primary/5 p-6 max-w-xl mx-auto"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-primary/20 p-3">
          {polling ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : status?.status === "completed" ? (
            <BookOpen className="h-6 w-6 text-primary" />
          ) : (
            <Sparkles className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold">Creating your course</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Building a complete learning path for &ldquo;{query}&rdquo;
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{STATUS_LABELS[status?.status || "queued"]}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {status?.intent && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{status.intent.topic}</Badge>
              <Badge variant="outline">{status.intent.level}</Badge>
              <Badge variant="outline">{status.intent.intentType.replace("_", " ")}</Badge>
            </div>
          )}

          {status?.status === "failed" && (
            <p className="text-sm text-red-400">{status.error}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
