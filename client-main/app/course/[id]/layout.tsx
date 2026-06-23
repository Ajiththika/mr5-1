import type { ReactNode } from "react";
import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@/lib/seo";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://127.0.0.1:5001";

type CourseMeta = {
  title?: string;
  description?: string;
  category?: string;
  updatedAt?: string;
};

async function fetchCourse(id: string): Promise<CourseMeta | null> {
  try {
    const response = await fetch(`${API_URL}/api/courses/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? payload ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await fetchCourse(id);

  if (!course?.title) {
    return genMeta({
      title: "Course",
      description: "Explore immersive online courses at MR5 School.",
      url: `/course/${id}`,
      type: "article",
    });
  }

  const description =
    course.description?.slice(0, 155) ||
    `Learn ${course.title} inside MR5 School's 3D virtual classroom with AI-guided lessons.`;

  return genMeta({
    title: course.title,
    description,
    keywords: [
      course.title,
      course.category || "online course",
      "MR5 School",
      "3D classroom",
      "AI learning",
    ],
    url: `/course/${id}`,
    type: "article",
    modifiedTime: course.updatedAt,
  });
}

export default function CourseLayout({ children }: { children: ReactNode }) {
  return children;
}
