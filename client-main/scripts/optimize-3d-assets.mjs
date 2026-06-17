#!/usr/bin/env node
/**
 * Mr5 3D asset optimization notes.
 *
 * Principal office (Ff-01.blend):
 *   /Applications/Blender.app/Contents/MacOS/Blender \\
 *     --background --python scripts/blender-export-principal.py
 *
 * Blender export settings (see scripts/blender-export-principal.py):
 * - GLB, apply transforms, Draco level 6
 * - Output: public/assets/3d/rooms/principal.glb (~10 KB)
 *
 * Other rooms (classroom, mensa, bathroom) can still be converted with:
 *   npx @gltf-transform/cli optimize INPUT.obj OUTPUT.glb --compress draco
 */
console.log(`
Mr5 3D Asset Optimization
=========================
Principal room: export from Blender via scripts/blender-export-principal.py

Other rooms: pre-built GLB placeholders (~4MB) or OBJ conversion:
  npx @gltf-transform/cli optimize INPUT.obj OUTPUT.glb --compress draco

Blender web export tips:
  - Bake textures to a single atlas when possible
  - Apply Decimate (ratio ~0.5) only if polygon count is high
  - Export GLB with Draco compression enabled
`);
