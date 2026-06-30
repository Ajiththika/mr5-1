import bpy
from collections import defaultdict
path = "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend"
bpy.ops.wm.open_mainfile(filepath=path)
obj = [o for o in bpy.data.objects if o.type=='MESH'][0]
me = obj.data
uv = me.uv_layers.active
mw = obj.matrix_world
stats = defaultdict(lambda: {'faces':0,'x':0,'y':0,'z':0})
for poly in me.polygons:
    uvs = [uv.data[li].uv for li in poly.loop_indices]
    tile = int(min(u for u,v in uvs))
    coords = [mw @ me.vertices[me.loops[li].vertex_index].co for li in poly.loop_indices]
    cx = sum(c.x for c in coords)/len(coords)
    cy = sum(c.y for c in coords)/len(coords)
    cz = sum(c.z for c in coords)/len(coords)
    s = stats[tile]
    s['faces'] += 1
    s['x'] += cx; s['y'] += cy; s['z'] += cz
for tile in sorted(stats):
    s = stats[tile]
    n = s['faces']
    print(f"udim {1001+tile}: faces={n} center=({s['x']/n:.1f},{s['y']/n:.1f},{s['z']/n:.1f})")
