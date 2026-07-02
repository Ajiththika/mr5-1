"use client";

import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import * as THREE from "three";

export type BicycleTransportSlug =
  | "item_bicycle_stark_temper"
  | "item_bicycle_wabi_lightning"
  | "item_bicycle_heymall_classic";

const BICYCLE_ASSETS: Record<
  Exclude<BicycleTransportSlug, "item_bicycle_heymall_classic">,
  { obj: string; mtl: string; textures: string; length: number }
> = {
  item_bicycle_stark_temper: {
    obj: "/models/bicycles/stark-temper-mtb/assembled.obj",
    mtl: "/models/bicycles/stark-temper-mtb/assembled.mtl",
    textures: "/models/bicycles/stark-temper-mtb/textures/",
    length: 1.72,
  },
  item_bicycle_wabi_lightning: {
    obj: "/models/bicycles/wabi-lightning-se/assembled.obj",
    mtl: "/models/bicycles/wabi-lightning-se/assembled.mtl",
    textures: "/models/bicycles/wabi-lightning-se/textures/",
    length: 1.58,
  },
};

function tuneMeshes(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of materials) {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.envMapIntensity = 0.62;
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
      }
    }
  });
}

function normalizeBicycle(root: THREE.Object3D, targetLength: number) {
  root.rotation.set(-Math.PI / 2, 0, 0);
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  root.scale.setScalar(targetLength / maxDim);
  root.updateMatrixWorld(true);

  const centered = new THREE.Box3().setFromObject(root);
  const center = centered.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.position.y -= centered.min.y * (targetLength / maxDim);
  root.updateMatrixWorld(true);
  tuneMeshes(root);
  return root;
}

function useObjBicycle(obj: string, mtl: string, textures: string) {
  const materials = useLoader(MTLLoader, mtl, (loader) => {
    loader.setResourcePath(textures);
  });
  return useLoader(OBJLoader, obj, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });
}

function ObjBicycleModel({
  slug,
}: {
  slug: Exclude<BicycleTransportSlug, "item_bicycle_heymall_classic">;
}) {
  const asset = BICYCLE_ASSETS[slug];
  const loaded = useObjBicycle(asset.obj, asset.mtl, asset.textures);
  const model = useMemo(
    () => normalizeBicycle(loaded.clone(true), asset.length),
    [loaded, asset.length],
  );
  return <primitive object={model} />;
}

function ClassicBicycleModel() {
  const frame = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c2410c", metalness: 0.35, roughness: 0.45 }),
    [],
  );
  const rubber = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1e293b", metalness: 0.05, roughness: 0.88 }),
    [],
  );
  const chrome = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.75, roughness: 0.28 }),
    [],
  );

  return (
    <group scale={0.9}>
      <mesh position={[0, 0.34, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={frame}>
        <torusGeometry args={[0.28, 0.018, 12, 48, Math.PI * 1.12]} />
      </mesh>
      <mesh position={[0.12, 0.52, 0]} rotation={[0, 0, -0.55]} castShadow material={frame}>
        <cylinderGeometry args={[0.012, 0.012, 0.42, 10]} />
      </mesh>
      <mesh position={[-0.18, 0.62, 0]} castShadow material={chrome}>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 10]} />
      </mesh>
      <mesh position={[-0.18, 0.88, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={chrome}>
        <cylinderGeometry args={[0.01, 0.01, 0.34, 10]} />
      </mesh>
      <mesh position={[0.28, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={rubber}>
        <torusGeometry args={[0.34, 0.03, 16, 48]} />
      </mesh>
      <mesh position={[-0.28, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow material={rubber}>
        <torusGeometry args={[0.34, 0.03, 16, 48]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow material={chrome}>
        <cylinderGeometry args={[0.018, 0.018, 0.62, 12]} />
      </mesh>
    </group>
  );
}

export function BicycleModel({ slug }: { slug: BicycleTransportSlug }) {
  if (slug === "item_bicycle_heymall_classic") {
    return <ClassicBicycleModel />;
  }
  return <ObjBicycleModel slug={slug} />;
}

export const BICYCLE_TRANSPORT_SLUGS = new Set<string>([
  "item_bicycle_stark_temper",
  "item_bicycle_wabi_lightning",
  "item_bicycle_heymall_classic",
]);
