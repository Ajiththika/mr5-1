"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { getGamingSpookySoundManager } from "@/lib/audio/GamingSpookySoundManager";

export const CREEP_FBX = "/models/creep.fbx";

interface GamingCreepSpecterProps {
  visible: boolean;
  floorY: number;
  roomCenter: THREE.Vector3;
  classDirection: THREE.Vector3;
}

function pickCreepClip(clips: THREE.AnimationClip[], preferRoar = false): THREE.AnimationClip | null {
  if (!clips.length) return null;
  if (preferRoar) {
    return clips.find((c) => /roar/i.test(c.name)) ?? clips[0];
  }
  return (
    clips.find((c) => /idle/i.test(c.name)) ??
    clips.find((c) => /sniff/i.test(c.name)) ??
    clips[0]
  );
}

function CreepSpecterInner({
  visible,
  floorY,
  roomCenter,
  classDirection,
}: GamingCreepSpecterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const reveal = useRef(0);
  const fbx = useLoader(FBXLoader, CREEP_FBX);
  const clips = useMemo(() => {
    const idle = pickCreepClip(fbx.animations || []);
    return idle ? [idle] : [];
  }, [fbx]);
  const { actions, mixer } = useAnimations(clips, groupRef);

  const { position, rotationY, targetHeight } = useMemo(() => {
    const back = classDirection.clone().multiplyScalar(-3.6);
    const side = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), classDirection)
      .normalize()
      .multiplyScalar(2.4);
    const pos = roomCenter.clone().add(back).add(side);
    pos.y = floorY;
    const rotY = Math.atan2(roomCenter.x - pos.x, roomCenter.z - pos.z);
    return { position: pos, rotationY: rotY, targetHeight: 1.65 };
  }, [roomCenter, classDirection, floorY]);

  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(fbx) as THREE.Object3D;
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    let height = Math.max(size.y, size.x, size.z);
    if (height > 20) height /= 100;
    const scale = targetHeight / Math.max(height, 0.001);
    clone.scale.setScalar(scale);
    clone.updateMatrixWorld(true);

    const grounded = new THREE.Box3().setFromObject(clone);
    clone.position.y -= grounded.min.y;

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [fbx, targetHeight]);

  useEffect(() => {
    if (!visible) return;
    const action = actions[Object.keys(actions)[0] ?? ""];
    if (!action) return;
    action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, visible]);

  useEffect(() => {
    if (visible) reveal.current = 0;
  }, [visible]);

  useFrame((_, delta) => {
    reveal.current = THREE.MathUtils.damp(reveal.current, visible ? 1 : 0, 4, delta);
    if (groupRef.current) {
      groupRef.current.visible = reveal.current > 0.02;
      groupRef.current.scale.setScalar(0.7 + reveal.current * 0.3);
    }
    if (mixer) mixer.update(delta);
  });

  const playRoar = () => {
    void getGamingSpookySoundManager().playScreech();
    const roar = pickCreepClip(fbx.animations || [], true);
    if (!roar) return;
    const action = mixer?.clipAction(roar);
    if (!action) return;
    action.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;
    action.fadeIn(0.15).play();
    action.getMixer().addEventListener("finished", () => {
      const idle = pickCreepClip(fbx.animations || []);
      if (!idle) return;
      const idleAction = mixer?.clipAction(idle);
      idleAction?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.3).play();
    });
  };

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, rotationY, 0]}
      visible={false}
      onClick={(event) => {
        event.stopPropagation();
        playRoar();
      }}
    >
      <primitive object={model} />
      <pointLight position={[0, 1.6, 0.4]} intensity={0.35} color="#8b5cf6" distance={3} />
    </group>
  );
}

export function GamingCreepSpecter(props: GamingCreepSpecterProps) {
  if (!props.visible) return null;
  return (
    <Suspense fallback={null}>
      <CreepSpecterInner {...props} />
    </Suspense>
  );
}
