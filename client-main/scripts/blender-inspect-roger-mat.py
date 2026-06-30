import bpy
path = "/Users/mr.ushantha/Downloads/uploads-files-3612210-Roger+Blender/Roger Blender.blend"
bpy.ops.wm.open_mainfile(filepath=path)
for obj in bpy.data.objects:
    print('OBJ', obj.type, obj.name, 'mats', len(obj.data.materials) if hasattr(obj.data,'materials') else 0)
    if obj.type=='MESH':
        me = obj.data
        print(' verts', len(me.vertices), 'faces', len(me.polygons))
        print(' uv', len(me.uv_layers), 'vcols', len(me.color_attributes))
        print(' mats', [m.name if m else None for m in me.materials])
for mat in bpy.data.materials:
    print('MATDATA', mat.name, mat.use_nodes)
    if mat.node_tree:
        for n in mat.node_tree.nodes:
            print(' ', n.type, n.name)
