/**
 * Export RenderPeople Manuel dancing FBX → web GLB via Three.js.
 * Merges per-bone FBX clips into one dance animation; strips textures for headless export.
 *
 * Usage: node client-main/scripts/export-manuel-fbx.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const FBX_INPUT =
  process.env.FBX_INPUT ||
  "/Users/mr.ushantha/Downloads/uploads-files-1833558-cgtrader_optimized_rp_manuel_animated_001_dancing.fbx";
const GLB_OUTPUT =
  process.env.GLB_OUTPUT || path.join(ROOT, "client-main", "public", "models", "manuel.glb");

function setupDom() {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLImageElement = dom.window.HTMLImageElement;
  globalThis.Blob = dom.window.Blob;
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        this.onload?.({ target: this });
      });
    }
  };
  globalThis.Image = class extends dom.window.Image {
    set src(_v) {
      queueMicrotask(() => this.onload?.());
    }
  };
}

function stripTextures(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!mat) continue;
      mat.map = null;
      mat.normalMap = null;
      mat.roughnessMap = null;
      mat.metalnessMap = null;
      mat.aoMap = null;
      mat.emissiveMap = null;
      if ("color" in mat && mat.color) mat.color.setRGB(0.72, 0.58, 0.48);
    }
  });
}

function mergeDanceClips(clips) {
  const THREE = globalThis.THREE;
  const tracks = [];
  let maxDuration = 0;
  const keepBone = (name) => {
    const n = name.toLowerCase();
    if (n.includes("_end_") || n.includes("eye") || n.includes("jaw") || n.includes("tooth")) {
      return false;
    }
    return (
      n.includes("hip") ||
      n.includes("spine") ||
      n.includes("neck") ||
      n.includes("head") ||
      n.includes("shoulder") ||
      n.includes("arm") ||
      n.includes("forearm") ||
      n.includes("hand") ||
      n.includes("leg") ||
      n.includes("foot") ||
      n.includes("thigh") ||
      n.includes("calf") ||
      n.includes("root")
    );
  };

  for (const clip of clips) {
    if (!clip?.tracks?.length) continue;
    if (!keepBone(clip.name)) continue;
    tracks.push(...clip.tracks);
    maxDuration = Math.max(maxDuration, clip.duration || 0);
  }
  return new THREE.AnimationClip("dance", maxDuration || 44, tracks);
}

async function main() {
  setupDom();
  const THREE = await import("three");
  globalThis.THREE = THREE;
  const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
  const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");

  if (!fs.existsSync(FBX_INPUT)) {
    throw new Error(`FBX not found: ${FBX_INPUT}`);
  }

  console.log("[manuel-export] Loading", FBX_INPUT);
  const buf = fs.readFileSync(FBX_INPUT);
  const group = new FBXLoader().parse(buf.buffer, FBX_INPUT);

  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  console.log(
    "[manuel-export] Bounds (m):",
    size.x.toFixed(2),
    size.y.toFixed(2),
    size.z.toFixed(2),
  );

  stripTextures(group);

  const dance = mergeDanceClips(group.animations || []);
  group.animations = dance.tracks.length ? [dance] : [];
  console.log(
    "[manuel-export] Merged dance clip:",
    dance.duration.toFixed(1),
    "s,",
    dance.tracks.length,
    "tracks",
  );

  const exporter = new GLTFExporter();
  const glb = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("GLTFExporter timed out")), 120_000);
    exporter.parse(
      group,
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
      {
        binary: true,
        animations: group.animations,
        truncateDrawRange: true,
        maxTextureSize: 1024,
      },
    );
  });

  fs.mkdirSync(path.dirname(GLB_OUTPUT), { recursive: true });
  fs.writeFileSync(GLB_OUTPUT, Buffer.from(glb));
  const mb = glb.byteLength / (1024 * 1024);
  console.log(`[manuel-export] Wrote ${GLB_OUTPUT} (${mb.toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
