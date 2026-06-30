import bpy
path = "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend"
bpy.ops.wm.open_mainfile(filepath=path)
obj = [o for o in bpy.data.objects if o.type=='MESH'][0]
me = obj.data
indices = set(p.material_index for p in me.polygons)
print('material indices', indices)
uv = me.uv_layers.active.data if me.uv_layers.active else None
if uv:
    us = [l.uv[0] for l in uv]
    vs = [l.uv[1] for l in uv]
    print('uv range U', min(us), max(us), 'V', min(vs), max(vs))
print('bounds', obj.bound_box)
