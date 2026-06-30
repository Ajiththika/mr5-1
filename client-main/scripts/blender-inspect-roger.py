import bpy
import os

path = "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend"
bpy.ops.wm.open_mainfile(filepath=path)

print("OBJECTS", [(o.name, o.type, o.hide_render) for o in bpy.data.objects])
print("MESHES", len([o for o in bpy.data.objects if o.type == 'MESH']))
print("ARMATURES", len([o for o in bpy.data.objects if o.type == 'ARMATURE']))
print("IMAGES", len(bpy.data.images))
for img in bpy.data.images[:15]:
    print(" IMG", img.name, img.size[:], img.filepath, img.packed_file is not None)
print("MATERIALS", len(bpy.data.materials))
for m in bpy.data.materials[:5]:
    print(" MAT", m.name)
