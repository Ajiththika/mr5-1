"""Import RenderPeople Manuel dancing FBX → web GLB for MR5 School dance master teacher.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender \\
    --background --python client-main/scripts/blender-export-manuel-dance-teacher.py
"""
from __future__ import annotations

import os
import math

import bpy
import mathutils

ROOT = os.environ.get(
    "MR5_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)
FBX_INPUT = os.environ.get(
    "FBX_INPUT",
    "/Users/mr.ushantha/Downloads/uploads-files-1833558-cgtrader_optimized_rp_manuel_animated_001_dancing.fbx",
)
GLB_OUTPUT = os.environ.get(
    "GLB_OUTPUT",
    os.path.join(ROOT, "client-main", "public", "models", "manuel.glb"),
)

TARGET_HEIGHT_M = float(os.environ.get("TARGET_HEIGHT_M", "1.72"))
MAX_TEX_SIZE = int(os.environ.get("MAX_TEX_SIZE", "1024"))
JPEG_QUALITY = int(os.environ.get("JPEG_QUALITY", "82"))
DECIMATE_FACE_THRESHOLD = int(os.environ.get("DECIMATE_FACE_THRESHOLD", "22000"))
DECIMATE_RATIO = float(os.environ.get("DECIMATE_RATIO", "0.65"))
USE_DRACO = os.environ.get("USE_DRACO", "0") != "0"


def log(msg: str) -> None:
    print(f"[manuel-export] {msg}")


def import_fbx(path: str) -> None:
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=path, bake_space_transform=True)


def repair_armature_scale() -> None:
    """RenderPeople optimized FBX often imports root armature with Y scale = 0."""
    for obj in bpy.data.objects:
        if obj.type != "ARMATURE":
            continue
        sx, sy, sz = obj.scale
        if abs(sy) < 1e-6:
            obj.scale = (sx or 1.0, 1.0, sz or 1.0)
            log(f"Repaired zero Y scale on {obj.name}")


def scene_bounds() -> tuple[mathutils.Vector, mathutils.Vector]:
    min_c = mathutils.Vector((1e9, 1e9, 1e9))
    max_c = mathutils.Vector((-1e9, -1e9, -1e9))
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            world = obj.matrix_world @ mathutils.Vector(corner)
            min_c.x = min(min_c.x, world.x)
            min_c.y = min(min_c.y, world.y)
            min_c.z = min(min_c.z, world.z)
            max_c.x = max(max_c.x, world.x)
            max_c.y = max(max_c.y, world.y)
            max_c.z = max(max_c.z, world.z)
    return min_c, max_c


def bounds_size(min_c: mathutils.Vector, max_c: mathutils.Vector) -> mathutils.Vector:
    return max_c - min_c


def primary_height(min_c: mathutils.Vector, max_c: mathutils.Vector) -> float:
    size = bounds_size(min_c, max_c)
    return max(size.x, size.y, size.z, 0.001)


def upright_character() -> None:
    """RenderPeople FBX often imports with the rig lying along X; stand upright on Y."""
    min_c, max_c = scene_bounds()
    size = bounds_size(min_c, max_c)
    log(f"Pre-upright size X={size.x:.3f} Y={size.y:.3f} Z={size.z:.3f}")

    # Tall axis should become Y-up.
    tall_axis = max(range(3), key=lambda i: size[i])
    if tall_axis == 1:
        log("Character already Y-up")
        return

    root = bpy.data.objects.new("MR5_UprightRoot", None)
    bpy.context.collection.objects.link(root)
    for obj in bpy.data.objects:
        if obj.type in {"MESH", "ARMATURE"} and obj.parent is None:
            obj.parent = root

    if tall_axis == 0:
        root.rotation_euler = (0.0, 0.0, math.radians(90))
        log("Rotated +90° Z (X-up → Y-up)")
    elif tall_axis == 2:
        root.rotation_euler = (math.radians(90), 0.0, 0.0)
        log("Rotated +90° X (Z-up → Y-up)")

    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.object.transform_apply(rotation=True)
    bpy.data.objects.remove(root, do_unlink=True)


def collapse_dance_animation() -> None:
    """Keep one armature dance clip instead of hundreds of per-bone FBX actions."""
    armatures = [o for o in bpy.data.objects if o.type == "ARMATURE"]
    if not armatures:
        log("No armature — skip animation collapse")
        return
    arm = armatures[0]
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)

    preferred = None
    for action in bpy.data.actions:
        name = action.name.lower()
        if "dancing_root" in name or name.endswith("_root"):
            preferred = action
            break
    if preferred is None:
        for action in bpy.data.actions:
            if "dancing" in action.name.lower():
                preferred = action
                break
    if preferred is None and bpy.data.actions:
        preferred = bpy.data.actions[0]

    stale = [a for a in bpy.data.actions if a != preferred]
    for action in stale:
        bpy.data.actions.remove(action)
    log(f"Kept animation: {preferred.name if preferred else 'none'} (removed {len(stale)} extras)")

    if preferred:
        if arm.animation_data is None:
            arm.animation_data_create()
        arm.animation_data.action = preferred
        preferred.name = "dance"


def apply_transforms() -> None:
    targets = [o for o in bpy.data.objects if o.type in {"MESH", "ARMATURE"}]
    if not targets:
        raise RuntimeError("No mesh or armature in FBX")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in targets:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = targets[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    log(f"Applied transforms on {len(targets)} objects")


def downscale_textures() -> None:
    for img in bpy.data.images:
        if not img.size[0] or not img.size[1]:
            continue
        w, h = img.size
        if max(w, h) <= MAX_TEX_SIZE:
            continue
        scale = MAX_TEX_SIZE / float(max(w, h))
        img.scale(int(w * scale), int(h * scale))
        log(f"Downscaled texture {img.name} → {img.size[0]}x{img.size[1]}")


def safe_decimate_meshes() -> None:
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        faces = len(obj.data.polygons)
        if faces < DECIMATE_FACE_THRESHOLD:
            continue
        mod = obj.modifiers.new(name="MR5_Decimate", type="DECIMATE")
        mod.ratio = DECIMATE_RATIO
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)
        log(f"Decimated {obj.name}: {faces} → {len(obj.data.polygons)} faces")


def normalize_height() -> None:
    min_c, max_c = scene_bounds()
    height = primary_height(min_c, max_c)
    log(f"Bounds height before normalize: {height:.3f}")

    # RenderPeople FBX is usually centimeters when the tallest axis > 20.
    if height > 20.0:
        factor = 0.01
        root = bpy.data.objects.new("MR5_ScaleRoot", None)
        bpy.context.collection.objects.link(root)
        for obj in bpy.data.objects:
            if obj.type in {"MESH", "ARMATURE"} and obj.parent is None:
                obj.parent = root
        root.scale = (factor, factor, factor)
        bpy.ops.object.select_all(action="DESELECT")
        root.select_set(True)
        bpy.context.view_layer.objects.active = root
        bpy.ops.object.transform_apply(scale=True)
        bpy.data.objects.remove(root, do_unlink=True)
        min_c, max_c = scene_bounds()
        height = primary_height(min_c, max_c)
        log(f"Converted cm → m, height now {height:.3f}")

    if abs(height - TARGET_HEIGHT_M) > 0.03:
        scale_factor = TARGET_HEIGHT_M / height
        root = bpy.data.objects.new("MR5_HeightRoot", None)
        bpy.context.collection.objects.link(root)
        for obj in bpy.data.objects:
            if obj.type in {"MESH", "ARMATURE"} and obj.parent is None:
                obj.parent = root
        root.scale = (scale_factor, scale_factor, scale_factor)
        bpy.ops.object.select_all(action="DESELECT")
        root.select_set(True)
        bpy.context.view_layer.objects.active = root
        bpy.ops.object.transform_apply(scale=True)
        bpy.data.objects.remove(root, do_unlink=True)
        min_c, max_c = scene_bounds()
        log(f"Scaled to target height ~{TARGET_HEIGHT_M}m")

    # Feet on ground (Y-up in Blender)
    min_c, max_c = scene_bounds()
    offset = -min_c.y
    if abs(offset) > 0.0001:
        for obj in bpy.data.objects:
            if obj.type in {"MESH", "ARMATURE"}:
                obj.location.y += offset
        log(f"Grounded model (offset {offset:.3f})")


def list_animations() -> None:
    if not bpy.data.actions:
        log("WARN: no actions found — export will be static")
        return
    for action in bpy.data.actions:
        log(f"Animation: {action.name} ({action.frame_range[0]:.0f}-{action.frame_range[1]:.0f})")


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
        export_skins=True,
        export_animations=True,
        export_morph=False,
        export_draco_mesh_compression_enable=USE_DRACO,
        export_draco_mesh_compression_level=6,
    )
    bpy.ops.export_scene.gltf(**kwargs)
    size_mb = os.path.getsize(GLB_OUTPUT) / (1024 * 1024)
    log(f"Exported {GLB_OUTPUT} ({size_mb:.2f} MB)")


def main() -> None:
    log(f"Importing {FBX_INPUT}")
    import_fbx(FBX_INPUT)
    repair_armature_scale()
    apply_transforms()
    collapse_dance_animation()
    downscale_textures()
    safe_decimate_meshes()
    normalize_height()
    list_animations()
    export_glb()


if __name__ == "__main__":
    main()
