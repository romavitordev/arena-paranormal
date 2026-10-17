"""
Prévia de uma invocação (npc_*.py): abre o .blend fonte e renderiza frente, lado e três-quartos num PNG por vista.
  blender -b tools/blender/fonte/<id>.blend -P tools/blender/preview_npc.py -- <pasta de saída>
"""
import sys
import os
import math

import bpy
from mathutils import Vector

out = sys.argv[sys.argv.index('--') + 1]
os.makedirs(out, exist_ok=True)
sc = bpy.context.scene
try:
    sc.render.engine = 'BLENDER_EEVEE_NEXT'
except TypeError:
    try:
        sc.render.engine = 'BLENDER_EEVEE'
    except TypeError:
        pass
sc.render.resolution_x, sc.render.resolution_y = 640, 900
sc.render.film_transparent = False
world = sc.world or bpy.data.worlds.new('W')
sc.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs['Color'].default_value = (0.08, 0.08, 0.09, 1)
bg.inputs['Strength'].default_value = 1.0

meshes = [o for o in sc.objects if o.type == 'MESH']

# como no jogo: a textura da cor multiplicada pela cor por vértice (o .glb leva as duas; aqui só para a prévia)
for m in bpy.data.materials:
    if not m.use_nodes:
        continue
    nt = m.node_tree
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if not bsdf or not bsdf.inputs['Base Color'].is_linked:
        continue
    src = bsdf.inputs['Base Color'].links[0].from_socket
    if src.node.type != 'TEX_IMAGE':
        continue
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Col'
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = 1.0
    nt.links.new(src, mix.inputs['A'])
    nt.links.new(attr.outputs['Color'], mix.inputs['B'])
    nt.links.new(mix.outputs['Result'], bsdf.inputs['Base Color'])
lo = Vector((1e9, 1e9, 1e9))
hi = Vector((-1e9, -1e9, -1e9))
for o in meshes:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        lo = Vector(map(min, lo, w))
        hi = Vector(map(max, hi, w))
center = (lo + hi) / 2
height = hi.z - lo.z

for name, energy, rot in (('key', 900, (0.9, 0, 0.6)), ('fill', 300, (1.1, 0, -1.4)), ('rim', 500, (1.2, 0, 3.0))):
    L = bpy.data.lights.new(name, 'AREA')
    L.energy = energy
    L.size = 3
    ob = bpy.data.objects.new(name, L)
    sc.collection.objects.link(ob)
    d = Vector((math.sin(rot[2]) * math.cos(rot[0]), -math.cos(rot[2]) * math.cos(rot[0]), math.sin(rot[0]))) * 5
    ob.location = center + d
    ob.rotation_euler = (center - ob.location).to_track_quat('-Z', 'Y').to_euler()

cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 60
cam = bpy.data.objects.new('cam', cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
views = sys.argv[sys.argv.index('--') + 2:] or ['front', 'side', 'three', 'face']
for v in views:
    dist = height * 2.2
    target = center.copy()
    if v == 'front':
        d = Vector((0, -1, 0.05))
    elif v == 'side':
        d = Vector((1, 0, 0.05))
    elif v == 'three':
        d = Vector((0.7, -0.7, 0.15))
    else:  # face: close no rosto
        d = Vector((0.15, -1, 0.05))
        target = Vector((center.x, center.y, hi.z - height * 0.1))
        dist = height * 0.7
    cam.location = target + d.normalized() * dist
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = os.path.join(out, f'{v}.png')
    bpy.ops.render.render(write_still=True)
    print('RENDER', sc.render.filepath)
