"use client";

import { Suspense, memo, useLayoutEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  MR5_LOGO_URL,
  MR5_SURFACE_STICKER_OPACITY,
  MR5_WALL_STICKER_OPACITY,
  type ClassroomBrandPlacements,
  type SurfaceStickerPlacement,
  type WallStickerPlacement,
} from "@/lib/classroom/classroom-brand-placement";

function StickerPlane({
  width,
  height,
  opacity,
  renderOrder,
  texture,
}: {
  width: number;
  height: number;
  opacity: number;
  renderOrder: number;
  texture: THREE.Texture;
}) {
  return (
    <group>
      <mesh position={[0, 0, -0.003]} renderOrder={renderOrder} raycast={() => null}>
        <planeGeometry args={[width * 1.04, height * 1.04]} />
        <meshBasicMaterial
          color="#0a1020"
          transparent
          opacity={opacity * 0.35}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh renderOrder={renderOrder + 1} raycast={() => null}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
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

function WallSticker({
  placement,
  texture,
}: {
  placement: WallStickerPlacement;
  texture: THREE.Texture;
}) {
  const { position, width, height, rotationY } = placement;
  return (
    <group
      name="mr5_wall_sticker"
      position={position}
      rotation={[0, rotationY, 0]}
    >
      <StickerPlane
        width={width}
        height={height}
        opacity={MR5_WALL_STICKER_OPACITY}
        renderOrder={8}
        texture={texture}
      />
    </group>
  );
}

function SurfaceSticker({
  placement,
  texture,
}: {
  placement: SurfaceStickerPlacement;
  texture: THREE.Texture;
}) {
  const { position, width, height, rotation } = placement;
  return (
    <group name="mr5_surface_sticker" position={position} rotation={rotation}>
      <StickerPlane
        width={width}
        height={height}
        opacity={MR5_SURFACE_STICKER_OPACITY}
        renderOrder={10}
        texture={texture}
      />
    </group>
  );
}

function BrandStickersInner({ placements }: { placements: ClassroomBrandPlacements }) {
  const texture = useTexture(MR5_LOGO_URL);

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 12;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <>
      <WallSticker placement={placements.wall} texture={texture} />
      <SurfaceSticker placement={placements.board} texture={texture} />
      {placements.desks.map((desk, index) => (
        <SurfaceSticker key={`desk-sticker-${index}`} placement={desk} texture={texture} />
      ))}
    </>
  );
}

function ClassroomBrandStickersInner({
  placements,
}: {
  placements: ClassroomBrandPlacements;
}) {
  return (
    <Suspense fallback={null}>
      <BrandStickersInner placements={placements} />
    </Suspense>
  );
}

export const ClassroomBrandStickers = memo(ClassroomBrandStickersInner);

useTexture.preload(MR5_LOGO_URL);
