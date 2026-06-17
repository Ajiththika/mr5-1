"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, type ComponentType } from "react";
import { CourseAccessGate } from "@/components/course/CourseAccessGate";

type RoomSceneProps = {
  modelUrl: string;
  name: string;
  courseId?: string;
  showTeacher?: boolean;
  showHotspots?: boolean;
};

export default function ClassroomPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const [RoomScene, setRoomScene] = useState<ComponentType<RoomSceneProps> | null>(null);

  useEffect(() => {
    import("@/components/3d/room-scene").then((mod) => {
      setRoomScene(() => mod.RoomScene);
    });
  }, []);

  return (
    <CourseAccessGate courseId={courseId}>
      <div className="relative h-screen w-full">
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={() => router.push(`/course/${courseId}`)}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campus
          </Button>
        </div>
        {RoomScene ? (
          <RoomScene
            modelUrl="/assets/3d/rooms/classroom.glb"
            name="Classroom"
            courseId={courseId}
            showTeacher
            showHotspots
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-white">Loading 3D environment...</div>
          </div>
        )}
      </div>
    </CourseAccessGate>
  );
}
