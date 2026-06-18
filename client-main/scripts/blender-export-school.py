"""Import SketchUp school model and export web-optimized GLB.

NOTE (Blender 5.1 / Python 3.13): The macOS SketchUp importer addon only ships
cpython-311 binaries. Direct .skp import fails on Blender 5.1.

To use your SketchUp file (e.g. 3d66.com_7603767-1.skp):
  1. Open the .skp in SketchUp
  2. File → Export → 3D Model → Collada (.dae) or FBX (binary)
  3. Run: INPUT=/path/to/export.dae blender --background \\
       --python client-main/scripts/blender-export-school-from-dae.py

When a Python 3.13 SketchUp importer exists, this script will work headless:

  /Applications/Blender.app/Contents/MacOS/Blender \\
    --background --python client-main/scripts/blender-export-school.py
"""
import bpy
import os
import sys

ROOT = os.environ.get(
    "MR5_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)
ADDON_SRC = os.path.join(ROOT, "client-main", "scripts", "sketchup_importer", "sketchup_importer")
SKP_INPUT = os.environ.get(
    "SKP_INPUT",
    "/Users/mr.ushantha/Downloads/3d66.com_7603767-1.skp",
)
GLB_OUTPUT = os.environ.get(
    "GLB_OUTPUT",
    os.path.join(ROOT, "client-main", "public", "assets", "3d", "school-campus.glb"),
)
BLENDER_ADDONS = os.path.expanduser("~/Library/Application Support/Blender/5.1/scripts/addons")


def install_addon():
    os.makedirs(BLENDER_ADDONS, exist_ok=True)
    target = os.path.join(BLENDER_ADDONS, "sketchup_importer")
    if not os.path.isdir(target):
        import shutil
        shutil.copytree(ADDON_SRC, target)


def enable_addon():
    install_addon()
    import addon_utils
    addon_utils.modules_refresh()
    for mod in addon_utils.modules():
        if mod.__name__ == "sketchup_importer":
            if not addon_utils.check(mod.__name__)[1]:
                addon_utils.enable(mod.__name__, default_set=True, persistent=True)
            return
    raise RuntimeError("sketchup_importer addon not found after install")


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_skp():
    bpy.ops.import_scene.skp(
        filepath=SKP_INPUT,
        scenes_as_camera=False,
        import_camera=False,
        reuse_material=True,
        dedub_only=False,
        reuse_existing_groups=False,
        max_instance=200,
        import_scene="",
    )


def normalize_for_web():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        return

    # Join into one mesh for simpler web loading (optional but helps performance)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()

    obj = bpy.context.view_layer.objects.active
    if not obj:
        return

    # Center at origin
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0, 0, 0)

    # Scale to ~80 unit footprint for orbit camera
    dims = obj.dimensions
    max_dim = max(dims.x, dims.y, dims.z, 0.001)
    target = 80.0
    factor = target / max_dim
    obj.scale = (factor, factor, factor)
    bpy.ops.object.transform_apply(scale=True)


def export_glb():
    os.makedirs(os.path.dirname(GLB_OUTPUT), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=GLB_OUTPUT,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="JPEG",
        export_jpeg_quality=82,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    size_mb = os.path.getsize(GLB_OUTPUT) / (1024 * 1024)
    print(f"Exported school campus to {GLB_OUTPUT} ({size_mb:.2f} MB)")


def main():
    if not os.path.isfile(SKP_INPUT):
        raise FileNotFoundError(f"SKP not found: {SKP_INPUT}")

    enable_addon()
    clear_scene()
    print(f"Importing SketchUp model: {SKP_INPUT}")
    import_skp()
    print("Normalizing geometry for web...")
    normalize_for_web()
    print("Exporting GLB...")
    export_glb()


if __name__ == "__main__":
    main()
