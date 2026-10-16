"""
ESCULTURA ORGÂNICA para os personagens (char_*.py): em vez de juntar primitivas (que ficam com cara de "formas
coladas"), a peça é UMA forma contínua — vários metaballs que se fundem (metaballs negativos cavam), suavizados, com
relevo esculpido por deslocamento ao longo da normal e decimados para o orçamento. Mesma técnica do Carniçal
(npc_carnical.py), aqui em coordenadas do Blender (x = esquerda do boneco, -y = frente, z = cima), para entrar no
Builder com b.add(nome, s.mesh(...), material, region=..., subdiv=0) e ganhar os pesos do esqueleto como qualquer peça.
"""
import math

import bpy
import bmesh
from mathutils import Vector, noise

K = 0.575  # metaball (rigidez 2, limiar 0.6): a superfície de um elemento isolado fica em 0.575 × raio


def ridge(x, sharp=3):
    """crista: 1 no topo, 0 no sulco (fios de cabelo, fibras, dobras)"""
    return (0.5 + 0.5 * math.cos(x)) ** sharp


def n3(p, s=1.0):
    return noise.noise(Vector(p) * s)


class Sculpt:
    _n = 0

    def __init__(self):
        self.els = []  # (centro, raios (x, y, z), direção ou None, negativo)

    def ell(self, c, r, dir=None, neg=False):
        """elipsoide; com `dir`, r[2] é o raio AO LONGO de dir e r[0] o de través"""
        if not isinstance(r, (tuple, list)):
            r = (r, r, r)
        self.els.append((Vector(c), tuple(r), Vector(dir).normalized() if dir else None, neg))
        return self

    def chain(self, pts, radii, step=0.45):
        """bolas ao longo de uma polilinha, próximas o bastante para fundir num tubo liso"""
        n = len(pts)
        rs = radii if isinstance(radii, (list, tuple)) else [radii] * n
        if len(rs) != n:
            rs = [rs[0] + (rs[-1] - rs[0]) * i / (n - 1) for i in range(n)]
        for i in range(n - 1):
            a, b = Vector(pts[i]), Vector(pts[i + 1])
            k = max(1, int((b - a).length / (min(rs[i], rs[i + 1]) * step)))
            for j in range(k):
                t = j / k
                self.ell(a.lerp(b, t), rs[i] + (rs[i + 1] - rs[i]) * t)
        self.ell(pts[-1], rs[-1])
        return self

    def mesh(self, res=0.008, smooth=3, disp=None, target=None):
        """a malha (verts, faces, uvs=None) em coordenadas do mundo, pronta para o Builder"""
        Sculpt._n += 1
        name = f'MBsculpt{Sculpt._n}'  # nome único = família de metaball própria (não funde com outras peças)
        mb = bpy.data.metaballs.new(name)
        mb.resolution = res
        mb.render_resolution = res
        mb.threshold = 0.6
        for c, r, d, neg in self.els:
            e = mb.elements.new(type='ELLIPSOID')
            e.co = c
            e.radius = 1 / K
            e.stiffness = 8.0 if neg else 2.0  # o negativo forte cava de verdade
            e.use_negative = neg
            e.size_x, e.size_y, e.size_z = r
            if d is not None:
                e.rotation = Vector((0, 0, 1)).rotation_difference(d)
        ob = bpy.data.objects.new(name, mb)
        bpy.context.scene.collection.objects.link(ob)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
        bpy.data.objects.remove(ob)
        bpy.data.metaballs.remove(mb)
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=res * 0.25)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        for _ in range(smooth):
            bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bm.normal_update()
        if disp:
            for v in bm.verts:
                v.co += v.normal * disp(v.co.copy())
        bm.to_mesh(me)
        bm.free()
        if target and len(me.polygons) > target:
            tmp = bpy.data.objects.new(name, me)
            bpy.context.scene.collection.objects.link(tmp)
            m = tmp.modifiers.new('dec', 'DECIMATE')
            m.ratio = target / len(me.polygons)
            m.use_collapse_triangulate = True
            dg = bpy.context.evaluated_depsgraph_get()
            me2 = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
            bpy.data.objects.remove(tmp)
            bpy.data.meshes.remove(me)
            me = me2
        verts = [tuple(v.co) for v in me.vertices]
        faces = [tuple(p.vertices) for p in me.polygons]
        bpy.data.meshes.remove(me)
        return verts, faces, None
