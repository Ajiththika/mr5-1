"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ClassroomLessonSection } from "@/types/classroom-session";
import { createChalkBoardTexture } from "@/lib/classroom/chalk-board-texture";

interface SmartBlackboardProps {
  boardBox: THREE.Box3;
  classDirection: THREE.Vector3;
  section: ClassroomLessonSection | null;
  courseTitle?: string;
  loading?: boolean;
}

/** Chalk lesson text painted directly on the physical board surface — no floating UI. */
export function SmartBlackboard({
  boardBox,
  classDirection,
  section,
  courseTitle,
  loading,
}: SmartBlackboardProps) {
  const size = useMemo(() => boardBox.getSize(new THREE.Vector3()), [boardBox]);
  const center = useMemo(() => boardBox.getCenter(new THREE.Vector3()), [boardBox]);

  const content = useMemo(() => {
    if (section?.boardLines?.length) {
      return {
        title: section.title,
        lines: section.boardLines,
        footer: section.diagramHint,
      };
    }
    if (loading) {
      return {
        title: courseTitle ?? "Today's Lesson",
        lines: ["Preparing your lesson…"],
      };
    }
    return {
      title: courseTitle ?? "MR5 School",
      lines: ["Welcome to class.", "Your lesson will appear here."],
    };
  }, [section, courseTitle, loading]);

  const { position, quaternion, planeW, planeH } = useMemo(() => {
    const dir = classDirection.clone().normalize();
    const pos = center.clone().add(dir.multiplyScalar(size.z * 0.5 + 0.006));
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dir,
    );
    return {
      position: pos,
      quaternion: quat,
      planeW: size.x * 0.9,
      planeH: size.y * 0.86,
    };
  }, [center, classDirection, size]);

  const texture = useMemo(() => createChalkBoardTexture(content), [content]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={position} quaternion={quaternion} renderOrder={2}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
