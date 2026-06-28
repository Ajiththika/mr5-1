"use client";

import { useLayoutEffect, useRef } from "react";
import { Html } from "@react-three/drei";
import type * as THREE from "three";

const BOARD_LOGO_URL = "/images/mr5-logo.png";
const LOGO_MAX_HEIGHT_PX = 70;
const LOGO_MAX_WIDTH_PX = 70;

/**
 * Wall crest above the chalkboard — logo only, no backing plane.
 * The source PNG has an opaque black field; screen blend removes that rectangle
 * so only the gold crest reads on the wall.
 */
export function BoardWallLogo({
  position,
  lookAt,
}: {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(position);
    groupRef.current.lookAt(lookAt);
  }, [lookAt, position]);

  return (
    <group ref={groupRef} name="board_wall_logo">
      <Html
        transform
        occlude={false}
        distanceFactor={6.6}
        zIndexRange={[40, 0]}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          background: "transparent",
        }}
      >
        <img
          src={BOARD_LOGO_URL}
          alt=""
          decoding="async"
          draggable={false}
          style={{
            display: "block",
            height: `${LOGO_MAX_HEIGHT_PX}px`,
            width: "auto",
            maxHeight: `${LOGO_MAX_HEIGHT_PX}px`,
            maxWidth: `${LOGO_MAX_WIDTH_PX}px`,
            objectFit: "contain",
            background: "transparent",
            mixBlendMode: "screen",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.28))",
            imageRendering: "auto",
          }}
        />
      </Html>
    </group>
  );
}
