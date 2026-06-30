import bpy
from collections import Counter
path = "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend"
bpy.ops.wm.open_mainfile(filepath=path)
obj = [o for o in bpy.data.objects if o.type=='MESH'][0]
me = obj.data
uv = me.uv_layers.active
tiles = Counter()
for poly in me.polygons:
    uvs = [uv.data[li].uv for li in poly.loop_indices]
    u_min = min(u for u,v in uvs)
    u_max = max(u for u,v in uvs)
    tile = int(u_min)
    tiles[tile] += 1
print('face count per U tile (int(u_min)):', dict(sorted(tiles.items())))
# sample centers
for t in sorted(tiles.keys())[:8]:
    print('tile', t, 'faces', tiles[t])
