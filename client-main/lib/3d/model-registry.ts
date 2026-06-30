/**
 * MR5 3D model registry — paths, credits, AWS CDN keys.
 * CC BY 4.0 attribution is mandatory; never remove from UI.
 */

import registry from "@/data/3d-asset-registry.json";

/** Exact mandatory credit — do not alter wording (license compliance). */
export const GANESHA_CREDIT_MANDATORY =
  "Indigo Ganesha - Avatar by ultranique (https://skfb.ly/6FRHv) is licensed under CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/)";

/** @deprecated Use GANESHA_CREDIT_MANDATORY */
export const GANESHA_CREDIT_FULL = GANESHA_CREDIT_MANDATORY;

export const GANESHA_CREDIT_SHORT =
  "Indigo Ganesha - Avatar by ultranique — CC BY 4.0";

export const GANESHA_ASSET_ID = "ganesha-welcome-guide";

export const MODEL_ASSETS = {
  classroom: {
    id: "classroom-room",
    path: "/assets/3d/rooms/classroom.glb",
    credit: null,
    estimatedMb: 2,
    cdnEnvKey: "NEXT_PUBLIC_CDN_CLASSROOM_MODEL" as const,
  },
  ganesha: {
    id: GANESHA_ASSET_ID,
    path: "/models/ganesha.glb",
    licenseFile: "/licenses/ganesha.txt",
    credit: GANESHA_CREDIT_MANDATORY,
    creditShort: GANESHA_CREDIT_SHORT,
    sourceUrl: "https://skfb.ly/6FRHv",
    author: "ultranique",
    license: "CC BY 4.0",
    licenseUrl: "http://creativecommons.org/licenses/by/4.0/",
    estimatedMb: 26,
    teacherHeight: 1.65,
    displayScale: 0.85,
    textureTarget: 1024,
    cdnEnvKey: "NEXT_PUBLIC_CDN_GANESHA_MODEL" as const,
  },
  joe: {
    id: "joe-realistic-teacher",
    path: "/models/joe.glb",
    credit: "Joe realistic human 3D model — MR5 School classroom teacher avatar",
    creditShort: "Joe — Realistic Teacher",
    estimatedMb: 21,
    teacherHeight: 1.72,
    displayScale: 0.9,
    textureTarget: 2048,
    cdnEnvKey: "NEXT_PUBLIC_CDN_JOE_MODEL" as const,
  },
  roger: {
    id: "roger-classroom-teacher",
    path: "/models/roger.glb",
    credit: "Roger CC character — MR5 School classroom teacher avatar",
    creditShort: "Roger — Classroom Teacher",
    estimatedMb: 5,
    teacherHeight: 1.72,
    displayScale: 0.9,
    textureTarget: 2048,
    cdnEnvKey: "NEXT_PUBLIC_CDN_ROGER_MODEL" as const,
  },
} as const;

/** @deprecated Alias for ganesha */
export const ganeshaWelcome = MODEL_ASSETS.ganesha;

export type ModelAssetKey = keyof typeof MODEL_ASSETS;

export function getAssetRegistry() {
  return registry;
}

export function getGaneshaAssetMeta() {
  return registry.assets.find((a) => a.id === GANESHA_ASSET_ID) ?? null;
}

export function getModelStructuredData() {
  const g = MODEL_ASSETS.ganesha;
  return {
    "@context": "https://schema.org",
    "@type": "3DModel",
    name: "Indigo Ganesha - Avatar",
    url: g.sourceUrl,
    creator: { "@type": "Person", name: g.author },
    license: g.licenseUrl,
    description: GANESHA_CREDIT_MANDATORY,
  };
}
