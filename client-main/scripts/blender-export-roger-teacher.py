"""Optimize Roger CC character blend → web GLB for MR5 School teacher avatar.

The Sketchfab/CC blend ships as bare geometry; external CC textures live beside the
.blend file. This script assigns UDIM tile textures, decimates safely, normalizes
height, and exports a browser-ready GLB.

Usage (MacBook Air M3):
  /Applications/Blender.app/Contents/MacOS/Blender \\
    --background --python client-main/scripts/blender-export-roger-teacher.py
"""
from __future__ import annotations

import glob
import os
from collections import defaultdict

import bpy
import mathutils

ROOT = os.environ.get(
    "MR5_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)
BLEND_INPUT = os.environ.get(
    "BLEND_INPUT",
    "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend",
)
TEXTURE_ROOT = os.environ.get(
    "TEXTURE_ROOT",
    os.path.join(os.path.dirname(BLEND_INPUT), "textures"),
)
GLB_OUTPUT = os.environ.get(
    "GLB_OUTPUT",
    os.path.join(ROOT, "client-main", "public", "models", "roger.glb"),
)

MAX_TEX_SIZE = int(os.environ.get("MAX_TEX_SIZE", "1024"))
JPEG_QUALITY = int(os.environ.get("JPEG_QUALITY", "82"))
DECIMATE_FACE_THRESHOLD = int(os.environ.get("DECIMATE_FACE_THRESHOLD", "18000"))
DECIMATE_RATIO = float(os.environ.get("DECIMATE_RATIO", "0.55"))
TARGET_HEIGHT_M = float(os.environ.get("TARGET_HEIGHT_M", "1.72"))
USE_DRACO = os.environ.get("USE_DRACO", "1") != "0"

# UDIM tile (1001-based) → glob pattern relative to TEXTURE_ROOT
UDIM_COLOR_PATTERNS: dict[int, str] = {
    1001: "**/Std_Skin_Head/*BCBMap*",
    1002: "**/Std_Skin_Head/*BCBMap*",
    1003: "**/Short_blowback/**/Hair_vertexcolormap*",
    1004: "**/Std_Skin_Head/*BCBMap*",
    1005: "**/Boxers/**/Boxers_ao*",
    1006: "**/Short_blowback/**/Hair_vertexcolormap*",
}

UDIM_NORMAL_PATTERNS: dict[int, str] = {
    1001: "**/Std_Skin_Head/*NBMap*",
}


def log(msg: str) -> None:
    print(f"[roger-export] {msg}")


def find_texture(pattern: str) -> str | None:
    matches = glob.glob(os.path.join(TEXTURE_ROOT, pattern), recursive=True)
    matches = [m for m in matches if os.path.isfile(m)]
    if not matches:
        return None
    matches.sort(key=lambda p: (0 if p.lower().endswith((".jpg", ".jpeg")) else 1, len(p)))
    return matches[0]


def open_blend(path: str) -> None:
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    bpy.ops.wm.open_mainfile(filepath=path)


def get_export_mesh() -> bpy.types.Object:
    meshes = [o for o in bpy.data.objects if o.type == "MESH" and o.data and len(o.data.polygons)]
    if not meshes:
        raise RuntimeError("No mesh objects found in blend file")
    return max(meshes, key=lambda o: len(o.data.polygons))


def remove_non_export_objects(keep: bpy.types.Object) -> None:
    remove_types = {"LIGHT", "CAMERA", "SPEAKER", "LIGHT_PROBE"}
    skip_name_parts = ("hdr", "environment", "backdrop", "background")
    removed = 0
    for obj in list(bpy.data.objects):
        if obj == keep:
            continue
        name = obj.name.lower()
        if obj.type in remove_types or any(p in name for p in skip_name_parts):
            bpy.data.objects.remove(obj, do_unlink=True)
            removed += 1
    log(f"Removed {removed} non-export objects")


def apply_transforms(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    log("Applied transforms")


def mesh_height_m(obj: bpy.types.Object) -> float:
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    corners = [eval_obj.matrix_world @ mathutils.Vector(c) for c in eval_obj.bound_box]
    zs = [c.z for c in corners]
    return max(zs) - min(zs)


def normalize_height(obj: bpy.types.Object) -> None:
    height = mesh_height_m(obj)
    if height <= 0.001:
        log("Skip height normalize — could not measure bounds")
        return

    # Blend uses ~cm; values around 170 → convert to meters first if huge.
    if height > 20.0:
        height_m = height / 100.0
        obj.scale = (0.01, 0.01, 0.01)
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(scale=True)
        height = mesh_height_m(obj)
        height_m = height
    else:
        height_m = height

    if abs(height_m - TARGET_HEIGHT_M) < 0.03:
        # Feet on ground
        depsgraph = bpy.context.evaluated_depsgraph_get()
        eval_obj = obj.evaluated_get(depsgraph)
        min_z = min((eval_obj.matrix_world @ mathutils.Vector(c)).z for c in eval_obj.bound_box)
        obj.location.z -= min_z
        log(f"Height already ~{height_m:.2f}m")
        return

    factor = TARGET_HEIGHT_M / height_m
    obj.scale = (factor, factor, factor)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(scale=True)

    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    min_z = min((eval_obj.matrix_world @ mathutils.Vector(c)).z for c in eval_obj.bound_box)
    obj.location.z -= min_z
    log(f"Normalized height to ~{TARGET_HEIGHT_M}m (was {height_m:.2f}m)")


def udim_tile_for_poly(poly, uv_layer) -> int:
    uvs = [uv_layer.data[li].uv for li in poly.loop_indices]
    return 1001 + int(min(u for u, _ in uvs))


def assign_udim_materials(obj: bpy.types.Object) -> None:
    me = obj.data
    uv_layer = me.uv_layers.active
    if not uv_layer:
        raise RuntimeError("Mesh has no UV layer")

    tile_faces: dict[int, list] = defaultdict(list)
    for poly in me.polygons:
        tile_faces[udim_tile_for_poly(poly, uv_layer)].append(poly.index)

    log(f"UDIM tiles in mesh: {sorted(tile_faces)}")

    # Clear old materials
    me.materials.clear()
    tile_to_mat_index: dict[int, int] = {}

    for tile in sorted(tile_faces):
        color_path = find_texture(UDIM_COLOR_PATTERNS.get(tile, ""))
        normal_path = find_texture(UDIM_NORMAL_PATTERNS.get(tile, ""))
        if not color_path:
            log(f"WARN: no color texture for UDIM {tile}, using skin fallback")
            color_path = find_texture("**/Std_Skin_Head/*BCBMap*")

        mat = bpy.data.materials.new(name=f"Roger_UDIM_{tile}")
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        output = nodes.new("ShaderNodeOutputMaterial")
        output.location = (400, 0)
        principled = nodes.new("ShaderNodeBsdfPrincipled")
        principled.location = (100, 0)
        links.new(principled.outputs["BSDF"], output.inputs["Surface"])

        texcoord = nodes.new("ShaderNodeTexCoord")
        texcoord.location = (-700, 0)
        mapping = nodes.new("ShaderNodeMapping")
        mapping.location = (-500, 0)
        links.new(texcoord.outputs["UV"], mapping.inputs["Vector"])

        # Shift UV from UDIM tile back to 0-1 for the tile texture.
        tile_offset = tile - 1001
        mapping.inputs["Location"].default_value[0] = -float(tile_offset)

        if color_path:
            img = bpy.data.images.load(color_path, check_existing=True)
            if max(img.size) > MAX_TEX_SIZE:
                w, h = img.size
                scale = MAX_TEX_SIZE / float(max(w, h))
                img.scale(int(w * scale), int(h * scale))
            tex = nodes.new("ShaderNodeTexImage")
            tex.image = img
            tex.location = (-250, 100)
            links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
            links.new(tex.outputs["Color"], principled.inputs["Base Color"])
            if color_path.lower().endswith((".png", ".tga")) and "mask" in color_path.lower():
                links.new(tex.outputs["Alpha"], principled.inputs["Alpha"])
                mat.blend_method = "BLEND"
            log(f"UDIM {tile}: color ← {os.path.basename(color_path)}")
        else:
            principled.inputs["Base Color"].default_value = (0.76, 0.62, 0.52, 1.0)

        if normal_path:
            nimg = bpy.data.images.load(normal_path, check_existing=True)
            if max(nimg.size) > MAX_TEX_SIZE:
                w, h = nimg.size
                scale = MAX_TEX_SIZE / float(max(w, h))
                nimg.scale(int(w * scale), int(h * scale))
            ntex = nodes.new("ShaderNodeTexImage")
            ntex.image = nimg
            ntex.image.colorspace_settings.name = "Non-Color"
            ntex.location = (-250, -120)
            normal = nodes.new("ShaderNodeNormalMap")
            normal.location = (-50, -120)
            links.new(mapping.outputs["Vector"], ntex.inputs["Vector"])
            links.new(ntex.outputs["Color"], normal.inputs["Color"])
            links.new(normal.outputs["Normal"], principled.inputs["Normal"])
            log(f"UDIM {tile}: normal ← {os.path.basename(normal_path)}")

        principled.inputs["Roughness"].default_value = 0.55

        me.materials.append(mat)
        tile_to_mat_index[tile] = len(me.materials) - 1

    for tile, poly_indices in tile_faces.items():
        mat_index = tile_to_mat_index[tile]
        for idx in poly_indices:
            me.polygons[idx].material_index = mat_index

    log(f"Assigned {len(me.materials)} UDIM materials")


def safe_decimate(obj: bpy.types.Object) -> None:
    faces = len(obj.data.polygons)
    if faces < DECIMATE_FACE_THRESHOLD:
        log(f"No decimation needed ({faces} faces)")
        return
    mod = obj.modifiers.new(name="MR5_Decimate", type="DECIMATE")
    mod.ratio = DECIMATE_RATIO
    mod.use_collapse_triangulate = False
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)
    log(f"Decimated: {faces} → {len(obj.data.polygons)} faces")


def export_glb() -> None:
    os.makedirs(os.path.dirname(GLB_OUTPUT), exist_ok=True)
    kwargs = dict(
        filepath=GLB_OUTPUT,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="JPEG",
        export_jpeg_quality=JPEG_QUALITY,
        export_skins=False,
        export_animations=False,
        export_morph=False,
        export_draco_mesh_compression_enable=USE_DRACO,
        export_draco_mesh_compression_level=6,
    )
    bpy.ops.export_scene.gltf(**kwargs)
    size_mb = os.path.getsize(GLB_OUTPUT) / (1024 * 1024)
    log(f"Exported {GLB_OUTPUT} ({size_mb:.2f} MB)")


def main() -> None:
    log(f"Opening {BLEND_INPUT}")
    open_blend(BLEND_INPUT)
    obj = get_export_mesh()
    log(f"Export mesh: {obj.name} ({len(obj.data.polygons)} faces)")
    remove_non_export_objects(obj)
    apply_transforms(obj)
    assign_udim_materials(obj)
    safe_decimate(obj)
    normalize_height(obj)
    export_glb()


if __name__ == "__main__":
    main()
