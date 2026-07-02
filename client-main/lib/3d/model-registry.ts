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
  manuel: {
    id: "manuel-dance-master",
    path: "/models/manuel.fbx",
    licenseFile: "/licenses/manuel.txt",
    credit:
      "rp_manuel_animated_001_dancing by renderpeople (https://www.cgtrader.com/designers/renderpeople) — CGTrader / RenderPeople license",
    creditShort: "Manuel — Dance Master (renderpeople)",
    sourceUrl: "https://www.cgtrader.com/designers/renderpeople",
    author: "renderpeople",
    estimatedMb: 9,
    teacherHeight: 1.72,
    displayScale: 0.9,
    textureTarget: 1024,
    cdnEnvKey: "NEXT_PUBLIC_CDN_MANUEL_MODEL" as const,
  },
  creep: {
    id: "creep-spooky-master",
    path: "/models/creep.fbx",
    licenseFile: "/licenses/creep.txt",
    credit:
      "Creep character by andriichykrii (https://www.cgtrader.com/designers/andriichykrii) — CGTrader license",
    creditShort: "Creep — Spooky Master (andriichykrii)",
    sourceUrl: "https://www.cgtrader.com/designers/andriichykrii",
    author: "andriichykrii",
    estimatedMb: 6,
    teacherHeight: 1.65,
    displayScale: 0.9,
    textureTarget: 1024,
    cdnEnvKey: "NEXT_PUBLIC_CDN_CREEP_MODEL" as const,
  },
  sophiaFashion: {
    id: "sophia-fashion-teacher",
    path: "/models/sophia-fashion.fbx",
    licenseFile: "/licenses/sophia-fashion.txt",
    credit:
      "rp_sophia_animated_003_idling by renderpeople (https://www.cgtrader.com/designers/renderpeople) — CGTrader / RenderPeople license",
    creditShort: "Sophia — Fashion Teacher (renderpeople)",
    sourceUrl: "https://www.cgtrader.com/designers/renderpeople",
    author: "renderpeople",
    estimatedMb: 1,
    teacherHeight: 1.7,
    displayScale: 0.9,
    textureTarget: 1024,
    cdnEnvKey: "NEXT_PUBLIC_CDN_SOPHIA_FASHION_MODEL" as const,
  },
  clock3dhaupt: {
    id: "clock-3dhaupt-wall",
    path: "/models/clock-3dhaupt.fbx",
    licenseFile: "/licenses/clock-3dhaupt.txt",
    credit:
      "Clock_fbx by 3dhaupt / Dennis Haupt (https://www.cgtrader.com/designers/3dhaupt) — CGTrader license",
    creditShort: "Classic Wall Clock (3dhaupt)",
    sourceUrl: "https://www.cgtrader.com/designers/3dhaupt",
    author: "3dhaupt",
    estimatedMb: 0.14,
    cdnEnvKey: "NEXT_PUBLIC_CDN_CLOCK_3DHAUPT_MODEL" as const,
  },
  fan3dhaupt: {
    id: "fan-3dhaupt-desk",
    path: "/models/fan-3dhaupt.fbx",
    licenseFile: "/licenses/fan-3dhaupt.txt",
    credit:
      "Fan_Done2_Rigged by 3dhaupt / Dennis Haupt (https://www.cgtrader.com/designers/3dhaupt) — CGTrader license",
    creditShort: "Teacher Table Fan (3dhaupt)",
    sourceUrl: "https://www.cgtrader.com/designers/3dhaupt",
    author: "3dhaupt",
    estimatedMb: 0.14,
    cdnEnvKey: "NEXT_PUBLIC_CDN_FAN_3DHAUPT_MODEL" as const,
  },
  bicycleStarkTemper: {
    id: "bicycle-stark-temper-mtb",
    path: "/models/bicycles/stark-temper-mtb/assembled.obj",
    licenseFile: "/licenses/bicycle-stark-temper.txt",
    credit:
      "Stark Temper MTB by semyonfilippov (https://www.cgtrader.com/designers/semyonfilippov) — CGTrader license",
    creditShort: "Stark Temper MTB (semyonfilippov)",
    sourceUrl: "https://www.cgtrader.com/designers/semyonfilippov",
    author: "semyonfilippov",
    estimatedMb: 19,
  },
  bicycleWabiLightning: {
    id: "bicycle-wabi-lightning-se",
    path: "/models/bicycles/wabi-lightning-se/assembled.obj",
    licenseFile: "/licenses/bicycle-wabi-lightning.txt",
    credit:
      "Wabi Lightning SE by semyonfilippov (https://www.cgtrader.com/designers/semyonfilippov) — CGTrader license",
    creditShort: "Wabi Lightning SE (semyonfilippov)",
    sourceUrl: "https://www.cgtrader.com/designers/semyonfilippov",
    author: "semyonfilippov",
    estimatedMb: 17,
  },
  bicycleHeymall: {
    id: "bicycle-heymall-classic",
    path: "/models/bicycles/heymall-classic/bicycle.blend1",
    licenseFile: "/licenses/bicycle-heymall.txt",
    credit:
      "Bicycle by heymall (https://www.cgtrader.com/designers/heymall) — CGTrader license",
    creditShort: "Classic Bicycle (heymall)",
    sourceUrl: "https://www.cgtrader.com/designers/heymall",
    author: "heymall",
    estimatedMb: 98,
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
