"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClassroomLesson, ClassroomLessonSection } from "@/types/classroom-session";
import {
  readClassroomProgress,
  writeClassroomProgress,
} from "@/lib/classroom/progress-storage";

const CACHE_PREFIX = "mr5_classroom_lesson_";

function parseLessonJson(raw: string, courseName: string): ClassroomLesson | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as ClassroomLesson;
    if (!parsed?.sections?.length) return null;
    return {
      courseName: parsed.courseName || courseName,
      title: parsed.title || courseName,
      subject: parsed.subject || "General",
      sections: parsed.sections,
      citations: parsed.citations ?? [],
    };
  } catch {
    return null;
  }
}

function fallbackLesson(courseName: string): ClassroomLesson {
  return {
    courseName,
    title: courseName,
    subject: "Interactive Learning",
    citations: ["Wikipedia", "Open Educational Resources"],
    sections: [
      {
        id: "intro",
        title: "Introduction",
        kind: "intro",
        boardLines: [courseName, "Welcome to MR5 School", "AI Teacher is ready"],
      },
      {
        id: "objectives",
        title: "Objectives",
        kind: "objectives",
        boardLines: [
          "Learn key concepts",
          "Apply real-world examples",
          "Practice with activities",
        ],
      },
      {
        id: "theory",
        title: "Theory",
        kind: "theory",
        boardLines: [
          `Core ideas of ${courseName}`,
          "Step-by-step explanation",
          "Ask the AI Teacher anytime",
        ],
      },
      {
        id: "example",
        title: "Real-World Example",
        kind: "example",
        boardLines: ["Everyday application", "Visual diagram on board", "Discuss with class"],
        diagramHint: "Flow from concept → example → practice",
      },
      {
        id: "activity",
        title: "Activity",
        kind: "exercise",
        boardLines: ["Try it yourself", "Short exercise", "Check understanding"],
      },
      {
        id: "quiz",
        title: "Quick Quiz",
        kind: "quiz",
        boardLines: ["Q1: Recall main idea", "Q2: Apply concept", "Q3: Explain in your words"],
      },
      {
        id: "summary",
        title: "Summary",
        kind: "summary",
        boardLines: ["Key takeaways", "Homework preview", "Great work today!"],
      },
    ],
  };
}

export function useClassroomLesson(courseId?: string, courseTitle?: string) {
  const [lesson, setLesson] = useState<ClassroomLesson | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const courseName = courseTitle?.trim() || "Today's Lesson";

  const load = useCallback(async () => {
    if (!courseId) return;

    const cacheKey = `${CACHE_PREFIX}${courseId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as ClassroomLesson;
        if (parsed?.sections?.length) {
          setLesson(parsed);
          const progress = readClassroomProgress(courseId);
          if (progress) setSectionIndex(progress.sectionIndex);
          return;
        }
      }
    } catch {
      /* ignore */
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const systemPrompt = [
      "You are an expert curriculum designer for MR5 School.",
      "Use only safe educational knowledge (Wikipedia summaries, OER, official docs, government education portals).",
      "Transform sources into student-friendly lessons. Never dump raw scraped text.",
      "Return ONLY valid JSON (no markdown) matching this schema:",
      "{ courseName, title, subject, sections: [{ id, title, kind, boardLines: string[], narration, diagramHint }], citations: string[] }",
      "Include sections: intro, objectives, theory, example, exercise, quiz, summary.",
      "boardLines are short chalkboard lines (max 6 per section). Include math, code, or formulas when relevant.",
      "citations must list source names (e.g. Wikipedia: Topic Name).",
    ].join("\n");

    const userPrompt = `Create a complete automatic lesson for course: "${courseName}" (id: ${courseId}).`;

    try {
      const res = await fetch("/api/ai/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          options: { temperature: 0.55, max_tokens: 2200 },
        }),
      });

      if (!res.ok) throw new Error("Lesson generation failed");
      const data = (await res.json()) as { response?: string };
      const parsed = data.response
        ? parseLessonJson(data.response, courseName)
        : null;

      const next = parsed ?? fallbackLesson(courseName);
      setLesson(next);
      const progress = readClassroomProgress(courseId);
      setSectionIndex(progress?.sectionIndex ?? 0);

      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load lesson");
      setLesson(fallbackLesson(courseName));
    } finally {
      setLoading(false);
    }
  }, [courseId, courseName]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  useEffect(() => {
    if (!courseId || !lesson) return;
    writeClassroomProgress({
      courseId,
      sectionIndex,
      completedTopics: lesson.sections.slice(0, sectionIndex + 1).map((s) => s.title),
      updatedAt: Date.now(),
    });
  }, [courseId, lesson, sectionIndex]);

  const currentSection: ClassroomLessonSection | null =
    lesson?.sections[sectionIndex] ?? null;

  const advanceSection = useCallback(() => {
    setSectionIndex((i) => {
      if (!lesson) return i;
      return Math.min(i + 1, lesson.sections.length - 1);
    });
  }, [lesson]);

  return {
    lesson,
    currentSection,
    sectionIndex,
    loading,
    error,
    advanceSection,
    setSectionIndex,
    reload: load,
  };
}
