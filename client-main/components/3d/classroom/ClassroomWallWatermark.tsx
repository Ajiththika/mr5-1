"use client";

import { Suspense, memo, useLayoutEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  MR5_WALL_LOGO_OPACITY,
  MR5_WALL_LOGO_URL,
  type WallWatermarkPlacement,
} from "@/lib/classroom/wall-watermark-placement";

interface ClassroomWallWatermarkProps {
  placement: WallWatermarkPlacement;
}

function WatermarkPlanes({ placement }: ClassroomWallWatermarkProps) {
  const { position, width, height, rotationY } = placement;
  const texture = useTexture(MR5_WALL_LOGO_URL);

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  const shadowSize = useMemo(
    () => [width * 1.04, height * 1.04] as [number, number],
    [width, height],
  );

  return (
    <group
      name="mr5_wall_watermark"
      position={position}
      rotation={[0, rotationY, 0]}
    >
      <mesh position={[0, 0, -0.004]} renderOrder={8} raycast={() => null}>
        <planeGeometry args={shadowSize} />
        <meshBasicMaterial
          color="#0a1020"
          transparent
          opacity={0.08}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh renderOrder={9} raycast={() => null}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={MR5_WALL_LOGO_OPACITY}
          depthWrite={false}
          depthTest
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
        />
      </mesh>
    </group>
  );
}

function ClassroomWallWatermarkInner({ placement }: ClassroomWallWatermarkProps) {
  return (
    <Suspense fallback={null}>
      <WatermarkPlanes placement={placement} />
    </Suspense>
  );
}

export const ClassroomWallWatermark = memo(ClassroomWallWatermarkInner);

useTexture.preload(MR5_WALL_LOGO_URL);
