"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, type ComponentType } from "react";
import { CourseAccessGate } from "@/components/course/CourseAccessGate";

type PrincipalRoomSceneProps = {
  courseId?: string;
  onExit?: () => void;
};

export default function PrincipalRoomPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [PrincipalRoomScene, setPrincipalRoomScene] =
    useState<ComponentType<PrincipalRoomSceneProps> | null>(null);

  useEffect(() => {
    import("@/components/3d/principal-room-scene").then((mod) => {
      setPrincipalRoomScene(() => mod.PrincipalRoomScene);
    });
  }, []);

  const backToCampus = () => router.push(`/course/${courseId}`);

  return (
    <CourseAccessGate courseId={courseId}>
      <div className="relative h-screen w-full">
        <div className="absolute top-4 left-4 z-20">
          <Button
            onClick={backToCampus}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campus
          </Button>
        </div>
        {PrincipalRoomScene ? (
          <PrincipalRoomScene courseId={courseId} onExit={backToCampus} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1c1917]">
            <div className="text-white/90 text-sm">Loading principal office…</div>
          </div>
        )}
      </div>
    </CourseAccessGate>
  );
}
