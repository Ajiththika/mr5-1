import bpy
from collections import defaultdict
path = "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend"
bpy.ops.wm.open_mainfile(filepath=path)
obj = [o for o in bpy.data.objects if o.type=='MESH'][0]
me = obj.data
uv = me.uv_layers.active
mw = obj.matrix_world
stats = defaultdict(lambda: {'faces':0,'z_sum':0,'z_min':1e9,'z_max':-1e9})
for poly in me.polygons:
    uvs = [uv.data[li].uv for li in poly.loop_indices]
    tile = int(min(u for u,v in uvs))
    zs = [ (mw @ me.vertices[me.loops[li].vertex_index].co).z for li in poly.loop_indices ]
    z = sum(zs)/len(zs)
    s = stats[tile]
    s['faces'] += 1
    s['z_sum'] += z
    s['z_min'] = min(s['z_min'], min(zs))
    s['z_max'] = max(s['z_max'], max(zs))
for tile in sorted(stats):
    s = stats[tile]
    avg = s['z_sum']/s['faces']
    print(f"tile {tile} udim {1001+tile} faces={s['faces']} z_avg={avg:.3f} z_range=[{s['z_min']:.3f},{s['z_max']:.3f}]")
