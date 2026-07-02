#!/usr/bin/env node
/**
 * Copies semyonfilippov bicycle OBJ exports into public/models/bicycles/
 * and rewrites MTL texture paths to local filenames.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const downloads = path.join(process.env.HOME || "", "Downloads");

const BIKES = [
  {
    id: "stark-temper-mtb",
    src: path.join(downloads, "uploads-files-814136-stark-temper-mtb"),
    textureDirs: ["blend/textures"],
  },
  {
    id: "wabi-lightning-se",
    src: path.join(downloads, "uploads-files-815016-wabi-lightning-se"),
    textureDirs: ["textures/wabi", "textures"],
  },
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else if (!fs.existsSync(to)) fs.copyFileSync(from, to);
  }
}

function collectTextures(srcDir, textureDirs) {
  const names = new Set();
  for (const rel of textureDirs) {
    const dir = path.join(srcDir, rel);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.walkSync(dir)) {
      if (file.isFile()) names.add(path.basename(file.name));
    }
  }
  return names;
}

function rewriteMtl(mtlPath, textureNames) {
  let text = fs.readFileSync(mtlPath, "utf8");
  text = text.replace(/^map_(\w+)\s+.+$/gm, (line, kind) => {
    const base = path.basename(line.trim().split(/\s+/).pop() || "");
    if (textureNames.has(base)) return `map_${kind} ${base}`;
    return line;
  });
  fs.writeFileSync(mtlPath, text);
}

for (const bike of BIKES) {
  const dest = path.join(root, "public/models/bicycles", bike.id);
  const objSrc = path.join(bike.src, "obj");
  if (!fs.existsSync(objSrc)) {
    console.warn(`Skip ${bike.id}: missing ${objSrc}`);
    continue;
  }

  fs.mkdirSync(dest, { recursive: true });
  fs.mkdirSync(path.join(dest, "textures"), { recursive: true });

  for (const file of ["assembled.obj", "assembled.mtl"]) {
    fs.copyFileSync(path.join(objSrc, file), path.join(dest, file));
  }

  for (const rel of bike.textureDirs) {
    copyDir(path.join(bike.src, rel), path.join(dest, "textures"));
  }

  const textureNames = new Set(
    fs.readdirSync(path.join(dest, "textures")).filter((f) => !f.startsWith(".")),
  );
  rewriteMtl(path.join(dest, "assembled.mtl"), textureNames);
  console.log(`Prepared ${bike.id} (${textureNames.size} textures)`);
}

const heymallBlend = path.join(
  downloads,
  "uploads-files-3940084-Bicycle(for+CGTrader).blend1",
);
const heymallDest = path.join(root, "public/models/bicycles/heymall-classic");
if (fs.existsSync(heymallBlend)) {
  fs.mkdirSync(heymallDest, { recursive: true });
  const target = path.join(heymallDest, "bicycle.blend1");
  if (!fs.existsSync(target)) {
    fs.copyFileSync(heymallBlend, target);
    console.log("Copied heymall-classic source blend");
  }
}

console.log("Bicycle assets ready.");
