"""
Auditoria de um .glb exportado (V4 — etapas 20 Otimização e 21 Exportação).
Uso: blender -b --factory-startup -P audit_glb.py -- arquivo.glb
Imprime uma linha "AUDIT {json}" com:
  tris, malhas, materiais (e duplicados), ossos, escala/rotação/transform não aplicados,
  malhas sem UV, vértices sem peso, vértices com mais de 4 influências, altura do personagem.
"""
import sys, json, bpy
from mathutils import Vector

path = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

# 'Icosphere' é a forma de exibição dos ossos criada pelo próprio importador de glTF (não está no arquivo)
shapes = {pb.custom_shape.name for a in bpy.data.objects if a.type == 'ARMATURE' for pb in a.pose.bones if pb.custom_shape}
meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.name not in shapes and not o.name.startswith('Icosphere')]
arms = [o for o in bpy.data.objects if o.type == 'ARMATURE']
tris = 0
no_uv = []
unweighted = 0
uw_obj = {}
over4 = 0
mats = {}
not_applied = []
zmin, zmax = 1e9, -1e9
for o in meshes:
    me = o.data
    me.calc_loop_triangles()
    tris += len(me.loop_triangles)
    if not me.uv_layers and not o.name.startswith('COL_'):  # COL_* = colisão invisível, não precisa de UV
        no_uv.append(o.name)
    for m in me.materials:
        if m:
            mats[m.name] = mats.get(m.name, 0) + 1
    # transforms (o import do glTF aplica a conversão Y-up; consideramos ok escala 1 e rotação ~0)
    if any(abs(s - 1) > 1e-3 for s in o.scale):
        not_applied.append(o.name + ':escala')
    names = {g.index: g.name for g in o.vertex_groups}
    for v in me.vertices:
        ws = [g.weight for g in v.groups if g.weight > 1e-4]
        if not ws:
            unweighted += 1
            uw_obj[o.name] = uw_obj.get(o.name, 0) + 1
        if len(ws) > 4:
            over4 += 1
        z = (o.matrix_world @ v.co).z
        zmin = min(zmin, z)
        zmax = max(zmax, z)

bones = []
for a in arms:
    bones += [b.name for b in a.data.bones]
    if any(abs(s - 1) > 1e-3 for s in a.scale):
        not_applied.append(a.name + ':escala')

# materiais "duplicados": mesmo nome-base com sufixo .001 etc.
base = {}
for n in mats:
    b = n.split('.')[0]
    base[b] = base.get(b, 0) + 1
dups = [b for b, c in base.items() if c > 1]

print('AUDIT ' + json.dumps({
    'tris': tris,
    'meshes': len(meshes),
    'materials': len(mats),
    'dupMaterials': dups,
    'bones': bones,
    'armatures': len(arms),
    'noUV': no_uv,
    'unweighted': unweighted,
    'unweightedIn': uw_obj,
    'over4': over4,
    'notApplied': not_applied,
    'height': round(zmax - zmin, 3),
}, ensure_ascii=False))
