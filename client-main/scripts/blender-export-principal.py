"""Headless Blender export: Ff-01.blend -> principal.glb

Export settings (Blender 5.x glTF exporter):
- Format: GLB
- Apply modifiers / transforms
- Materials: EXPORT (mesh colors assigned in R3F scene)
- Draco mesh compression: level 6

Usage:
  /Applications/Blender.app/Contents/MacOS/Blender \\
    --background --python client-main/scripts/blender-export-principal.py
"""
import bpy
import os

BLEND = os.environ.get("BLEND_INPUT", "/Users/mr.ushantha/Downloads/cube_diorama/Ff-01.blend")
OUT = os.environ.get(
    "GLB_OUTPUT",
    "/Users/mr.ushantha/Downloads/Mr5/client-main/public/assets/3d/rooms/principal.glb",
)

bpy.ops.wm.open_mainfile(filepath=BLEND)

# Apply transforms so scale/rotation export cleanly
for obj in bpy.data.objects:
    if obj.type == "MESH":
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        obj.select_set(False)

# Export GLB (Blender 4.x / 3.x compatible)
try:
    bpy.ops.export_scene.gltf(
        filepath=OUT,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
    )
except TypeError:
    bpy.ops.export_scene.gltf(
        filepath=OUT,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
    )

print(f"Exported principal room to {OUT}")
