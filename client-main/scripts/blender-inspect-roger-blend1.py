import bpy
path = "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend1"
bpy.ops.wm.open_mainfile(filepath=path)
obj = [o for o in bpy.data.objects if o.type=='MESH'][0]
print('mats', len(obj.data.materials), [m.name if m else None for m in obj.data.materials])
print('images', len(bpy.data.images), [i.name for i in bpy.data.images if i.size[0]>0])
