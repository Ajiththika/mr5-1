/**
 * Lazy Ganesha GLB loader — performance + license-safe path resolution.
 */

import { getGaneshaModelUrl } from "./aws-assets";
import { GANESHA_CREDIT_MANDATORY, MODEL_ASSETS } from "./model-registry";

export const GANESHA_MODEL_URL = () => getGaneshaModelUrl();

export const GANESHA_LICENSE_FILE = MODEL_ASSETS.ganesha.licenseFile;

export const GANESHA_METADATA = {
  id: MODEL_ASSETS.ganesha.id,
  path: MODEL_ASSETS.ganesha.path,
  author: MODEL_ASSETS.ganesha.author,
  sourceUrl: MODEL_ASSETS.ganesha.sourceUrl,
  license: MODEL_ASSETS.ganesha.license,
  licenseUrl: MODEL_ASSETS.ganesha.licenseUrl,
  attribution: GANESHA_CREDIT_MANDATORY,
  displayScale: MODEL_ASSETS.ganesha.displayScale,
  teacherHeight: MODEL_ASSETS.ganesha.teacherHeight,
} as const;

/**
 * Dynamic import of the R3F scene component (code-split ~26MB GLB fetch).
 */
export async function loadGaneshaSceneComponent() {
  const mod = await import("@/components/3d/GaneshaModel");
  return mod.GaneshaModel;
}

/**
 * Preload hint — call only when user is about to enter classroom.
 */
export function preloadGaneshaModel(useGLTF: (url: string) => void, preload: (url: string) => void) {
  const url = getGaneshaModelUrl();
  preload(url);
  return url;
}
