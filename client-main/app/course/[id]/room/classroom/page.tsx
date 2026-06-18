"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, type ComponentType } from "react";
import { CourseAccessGate } from "@/components/course/CourseAccessGate";

type ClassroomRoomSceneProps = {
  courseId?: string;
  onExit?: () => void;
};

export default function ClassroomPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [ClassroomRoomScene, setClassroomRoomScene] =
    useState<ComponentType<ClassroomRoomSceneProps> | null>(null);

  useEffect(() => {
    import("@/components/3d/classroom-room-scene").then((mod) => {
      setClassroomRoomScene(() => mod.ClassroomRoomScene);
    });
  }, []);

  const backToCampus = () => router.push(`/course/${courseId}`);

  return (
    <CourseAccessGate courseId={courseId}>
      <div className="h-screen w-full overflow-hidden">
        {ClassroomRoomScene ? (
          <ClassroomRoomScene courseId={courseId} onExit={backToCampus} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-950">
            <div className="animate-pulse text-sm text-indigo-200">
              Loading classroom…
            </div>
          </div>
        )}
      </div>
    </CourseAccessGate>
  );
}
