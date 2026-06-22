import type { Metadata } from "next";
import type { ReactNode } from "react";
import { generateMetadata as buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return buildMetadata({
    title: "Immersive Classroom",
    description:
      "Enter the MR5 School 3D classroom with live weather, local time-of-day lighting, and interactive learning tools.",
    url: `/course/${id}/room/classroom`,
    keywords: [
      "3D classroom",
      "virtual learning",
      "immersive education",
      "MR5 School",
      "live weather classroom",
    ],
    noIndex: true,
  });
}

export default function ClassroomRoomLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="h-dvh w-full overflow-hidden" aria-label="Immersive classroom experience">
      {children}
    </main>
  );
}
