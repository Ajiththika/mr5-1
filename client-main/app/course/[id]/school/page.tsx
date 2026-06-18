"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import { CourseAccessGate } from "@/components/course/CourseAccessGate";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { SchoolCampusSceneProps } from "@/components/3d/school-campus-scene";

export default function SchoolPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [SchoolCampusScene, setSchoolCampusScene] =
    useState<ComponentType<SchoolCampusSceneProps> | null>(null);

  useEffect(() => {
    import("@/components/3d/school-campus-scene").then((mod) => {
      setSchoolCampusScene(() => mod.SchoolCampusScene);
    });
  }, []);

  const backToCourse = () => router.push(`/course/${courseId}`);

  return (
    <CourseAccessGate courseId={courseId}>
      <div className="min-h-screen bg-[#020617]">
        {SchoolCampusScene ? (
          <SchoolCampusScene
            courseId={courseId}
            variant="immersive"
            className="rounded-none border-0"
            onBack={backToCourse}
          />
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
            <p className="text-sm text-sky-200 animate-pulse">Preparing virtual campus…</p>
            <Button variant="outline" onClick={backToCourse} className="border-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
            </Button>
          </div>
        )}
      </div>
    </CourseAccessGate>
  );
}
