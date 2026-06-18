"""Export Classroom.fbx + textures to web-ready classroom.glb.

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender \\
    --background --python client-main/scripts/blender-export-classroom.py
"""
import bpy
import os

ROOT = os.environ.get(
    "MR5_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")),
)
FBX_INPUT = os.environ.get(
    "FBX_INPUT",
    "/Users/mr.ushantha/Downloads/classroom/source/Classroom.fbx",
)
TEXTURE_DIR = os.environ.get(
    "TEXTURE_DIR",
    "/Users/mr.ushantha/Downloads/classroom/textures",
)
GLB_OUTPUT = os.environ.get(
    "GLB_OUTPUT",
    os.path.join(ROOT, "client-main", "public", "assets", "3d", "rooms", "classroom.glb"),
)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_classroom():
    bpy.ops.import_scene.fbx(filepath=FBX_INPUT)


def _texture_index():
    index = {}
    if not os.path.isdir(TEXTURE_DIR):
        return index
    for name in os.listdir(TEXTURE_DIR):
        if name.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            key = name.lower().replace(".png", "").replace(".jpg", "").strip()
            index[key] = os.path.join(TEXTURE_DIR, name)
            index[name.lower()] = os.path.join(TEXTURE_DIR, name)
    return index


def remap_textures():
    tex_index = _texture_index()
    remapped = 0
    for image in bpy.data.images:
        if not image.filepath and not image.name:
            continue
        raw = (image.filepath or image.name).replace("\\", "/")
        basename = os.path.basename(raw)
        candidates = [
            basename,
            basename.lower(),
            basename.lower().replace(".png", "").strip(),
            image.name,
            image.name.lower(),
            image.name.lower().replace(".png", "").strip(),
        ]
        for candidate in candidates:
            path = tex_index.get(candidate.lower())
            if path and os.path.isfile(path):
                image.filepath = path
                image.reload()
                remapped += 1
                break
    print(f"Remapped {remapped} textures from {TEXTURE_DIR}")


def prepare_for_export():
    # Make instances real so transforms/materials export cleanly
    bpy.ops.object.select_all(action="SELECT")
    try:
        bpy.ops.object.make_single_user(type="ALL", object=True, obdata=True, material=True)
    except RuntimeError:
        pass
    bpy.ops.object.select_all(action="DESELECT")

    for obj in list(bpy.data.objects):
        if obj.type == "MESH" and "godray" in obj.name.lower():
            bpy.data.objects.remove(obj, do_unlink=True)


def export_glb():
    os.makedirs(os.path.dirname(GLB_OUTPUT), exist_ok=True)
    try:
        bpy.ops.file.pack_all()
    except RuntimeError:
        pass

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
    print(f"Exported classroom to {GLB_OUTPUT} ({size_mb:.2f} MB)")


def main():
    if not os.path.isfile(FBX_INPUT):
        raise FileNotFoundError(FBX_INPUT)
    clear_scene()
    print(f"Importing {FBX_INPUT}")
    import_classroom()
    remap_textures()
    prepare_for_export()
    export_glb()


if __name__ == "__main__":
    main()
