"""Import Grand Piano FBX → web GLB for MR5 classroom gaming time.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender \\
    --background --python client-main/scripts/blender-export-grand-piano.py
"""
import os
import bpy
import mathutils

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FBX_INPUT = os.environ.get(
    "FBX_INPUT",
    "/Users/mr.ushantha/Downloads/uploads-files-3786291-GrandPiano.fbx",
)
GLB_OUTPUT = os.environ.get(
    "GLB_OUTPUT",
    os.path.join(ROOT, "client-main", "public", "assets", "3d", "props", "grand-piano.glb"),
)
TARGET_WIDTH_M = float(os.environ.get("TARGET_WIDTH_M", "1.6"))
USE_DRACO = os.environ.get("USE_DRACO", "0") != "0"


def log(msg: str) -> None:
    print(f"[grand-piano] {msg}")


def import_fbx(path: str) -> None:
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=path)


def apply_transforms() -> None:
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        raise RuntimeError("No mesh in FBX")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    log(f"Applied transforms on {len(meshes)} meshes")


def normalize_scale() -> None:
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    min_c = [1e9, 1e9, 1e9]
    max_c = [-1e9, -1e9, -1e9]
    for obj in meshes:
        for corner in obj.bound_box:
            world = obj.matrix_world @ mathutils.Vector(corner)
            min_c = [min(min_c[i], world[i]) for i in range(3)]
            max_c = [max(max_c[i], world[i]) for i in range(3)]
    width = max(max_c[0] - min_c[0], 0.001)
    depth = max(max_c[2] - min_c[2], 0.001)
    height = max(max_c[1] - min_c[1], 0.001)
    log(f"Bounds W={width:.3f} D={depth:.3f} H={height:.3f}")

    longest = max(width, depth, height)
    factor = TARGET_WIDTH_M / longest if longest > 0.01 else 1.0
    if abs(factor - 1.0) < 0.02:
        return

    root = bpy.data.objects.new("MR5_Root", None)
    bpy.context.collection.objects.link(root)
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.parent is None:
            obj.parent = root
    root.scale = (factor, factor, factor)
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.object.transform_apply(scale=True)
    bpy.data.objects.remove(root, do_unlink=True)
    log(f"Scaled to ~{TARGET_WIDTH_M}m longest axis")


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
        export_jpeg_quality=82,
        export_draco_mesh_compression_enable=USE_DRACO,
        export_draco_mesh_compression_level=6,
    )
    bpy.ops.export_scene.gltf(**kwargs)
    size_mb = os.path.getsize(GLB_OUTPUT) / (1024 * 1024)
    log(f"Exported {GLB_OUTPUT} ({size_mb:.2f} MB)")


def main() -> None:
    log(f"Importing {FBX_INPUT}")
    import_fbx(FBX_INPUT)
    apply_transforms()
    normalize_scale()
    export_glb()


if __name__ == "__main__":
    main()
