"""Convert intermediate school export (DAE/OBJ/FBX) to web GLB.

SketchUp (.skp) cannot be read on Blender 5.1 until a Python 3.13
SketchUp importer build is available. Export from SketchUp first:
  File → Export → 3D Model → Collada (.dae) or FBX (.fbx)

Then run:
  INPUT=/path/to/school.dae /Applications/Blender.app/Contents/MacOS/Blender \\
    --background --python client-main/scripts/blender-export-school-from-dae.py
"""
import bpy
import os

ROOT = os.environ.get(
    "MR5_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)
INPUT = os.environ.get(
    "INPUT",
    "/Users/mr.ushantha/Downloads/3d66.com_7603767-1.skp",
)
GLB_OUTPUT = os.environ.get(
    "GLB_OUTPUT",
    os.path.join(ROOT, "client-main", "public", "assets", "3d", "school-campus.glb"),
)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_model(path: str):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".dae":
        bpy.ops.wm.collada_import(filepath=path)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=path)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=path)
    elif ext == ".glb" or ext == ".gltf":
        bpy.ops.import_scene.gltf(filepath=path)
    else:
        raise ValueError(
            f"Unsupported input {ext}. Export from SketchUp as .dae or .fbx first."
        )


def normalize_for_web():
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        return

    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()

    obj = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0, 0, 0)

    max_dim = max(obj.dimensions.x, obj.dimensions.y, obj.dimensions.z, 0.001)
    factor = 80.0 / max_dim
    obj.scale = (factor, factor, factor)
    bpy.ops.object.transform_apply(scale=True)


def export_glb():
    os.makedirs(os.path.dirname(GLB_OUTPUT), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=GLB_OUTPUT,
        export_format="GLB",
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="JPEG",
        export_jpeg_quality=80,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
    print(f"Exported {GLB_OUTPUT} ({os.path.getsize(GLB_OUTPUT) / 1024 / 1024:.2f} MB)")


def main():
    if not os.path.isfile(INPUT):
        raise FileNotFoundError(INPUT)
    clear_scene()
    print(f"Importing {INPUT}")
    import_model(INPUT)
    normalize_for_web()
    export_glb()


if __name__ == "__main__":
    main()
