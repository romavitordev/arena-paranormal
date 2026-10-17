"""
EXISTIDO DE MORTE (invocação do Deus da Morte) — wiki "Existidos de Morte" (Desconjuração ep. 6; Calamidade ep. 10):
Existido com influência da Morte. Corpo GRANDE e de MÚSCULOS DEFINIDOS, pele CINZENTA, rosto com aspecto de CRÂNIO
(careca, órbitas vazias, bochechas afundadas, dentes tortos), ESCRITAS pelo corpo em formato ESPIRAL e LODO PRETO
derramando das órbitas pelo rosto e pelo peito — e bastante nos BRAÇOS (antebraços e mãos tomados, pingando).

Referências: a miniatura de Desconjuração, a variação e a arte de Vendeta Oculta (wiki). O corpo inteiro coberto de
ESCRITA miúda (linhas de texto com as frases dos Existidos, tools/blender/tex/existido_texto.png) dando a volta nos
membros (UV cilíndrico por peça), crânio grande e careca com os olhos saltados e as duas fileiras de dentes à mostra, o
LODO PRETO brilhante tomando antebraços e mãos (pingando) e escorrendo da boca e dos olhos pelo peito.

Mesmo esqueleto do Carniçal / Zumbi de Sangue (J_body/chest/neck/jaw/sh/el/hand/hip/knee): metaballs fundidos; a cor
por vértice (sombra nos sulcos, manchas do Lodo) multiplica a textura no jogo.
O Carniçal (npc_carnical.py) fica guardado para virar personagem jogável.

  node tools/blender/build.mjs existido_morte   → public/npcs/existido_morte.glb (+ tools/blender/fonte/existido_morte.blend)
"""
import sys
import os
import math
import random

import bpy
import bmesh
from mathutils import Vector, noise

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, hex_rgb, TAU
from npc_lib import T, rod, curve, spike, joint, add, parts, finish

random.seed(11)
reset()


def vcol_material(name):
    """material cuja cor vem do atributo de vértice (o glTF exporta COLOR_0; o jogo usa vertexColors)"""
    m = material(name, '#ffffff', 0.55)
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Col'
    nt.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
    return m


# ================================================================ escultura por metaballs
class Sculpt:
    """uma forma orgânica: elementos que se fundem; grupos dizem a cor (e negativos cavam)"""

    def __init__(self, name):
        self.name = name
        self.els = []  # (centro, raios(x,y,z jogo), dir ou None, negativo, grupo)

    def ell(self, c, r, group='skin', dir=None, neg=False):
        if not isinstance(r, (tuple, list)):
            r = (r, r, r)
        self.els.append((Vector(c), tuple(r), Vector(dir).normalized() if dir else None, neg, group))

    def chain(self, pts, radii, group='skin', step=0.45):
        """bolas ao longo de uma polilinha (membros, tendões, dedos), espaçadas para fundir lisas"""
        n = len(pts)
        rs = radii if isinstance(radii, (list, tuple)) else [radii] * n
        if len(rs) != n:
            rs = [rs[0] + (rs[-1] - rs[0]) * i / (n - 1) for i in range(n)]
        for i in range(n - 1):
            a, b = Vector(pts[i]), Vector(pts[i + 1])
            k = max(1, int((b - a).length / (min(rs[i], rs[i + 1]) * step)))
            for j in range(k):
                t = j / k
                self.ell(a.lerp(b, t), rs[i] + (rs[i + 1] - rs[i]) * t, group)
        self.ell(pts[-1], rs[-1], group)

    def field(self, p):
        """o campo de cada grupo em p (para colorir): soma das contribuições dos elementos"""
        out = {}
        for c, r, d, neg, g in self.els:
            q = p - c
            if d is None:
                x, y, z = q.x / r[0], q.y / r[1], q.z / r[2]
            else:  # elipsoide orientado: r[1] ao longo de d
                along = q.dot(d)
                perp = (q - d * along).length
                x, y, z = perp / r[0], along / r[1], 0
            dd = (x * x + y * y + z * z) * K * K
            if dd < 1:
                out[g] = out.get(g, 0) + 2 * (1 - dd) ** 3
        return out

    def build(self, jnt, mat, target, res=0.009, smooth=4, disp=None, color=None):
        mb = bpy.data.metaballs.new('MB' + self.name)
        mb.resolution = res
        mb.render_resolution = res
        mb.threshold = 0.6
        for c, r, d, neg, g in self.els:
            e = mb.elements.new(type='ELLIPSOID')
            e.co = g2b(c)
            e.radius = 1 / K
            e.stiffness = 8.0 if neg else 2.0  # o negativo forte cava de verdade (órbitas, topo rompido)
            e.use_negative = neg
            if d is None:
                e.size_x, e.size_y, e.size_z = r[0], r[2], r[1]
            else:
                e.size_x, e.size_y, e.size_z = r[0], r[0], r[1]
                e.rotation = Vector((0, 0, 1)).rotation_difference(g2b(d))
        mob = bpy.data.objects.new('MB' + self.name, mb)  # nome único = família de metaball própria
        bpy.context.scene.collection.objects.link(mob)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(mob.evaluated_get(dg))
        bpy.data.objects.remove(mob)
        bpy.data.metaballs.remove(mb)
        o = bpy.data.objects.new(self.name, me)
        bpy.context.scene.collection.objects.link(o)
        o.parent = jnt
        # limpa a malha do marching cubes (vértices duplicados) e suaviza
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=res * 0.25)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        for _ in range(smooth):
            bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bm.normal_update()
        # esculpe: as fibras (e rachaduras) por deslocamento ao longo da normal
        if disp:
            for v in bm.verts:
                v.co += v.normal * disp(b2g(v.co))
        bm.to_mesh(me)
        bm.free()
        # decima para o orçamento
        tris = len(me.polygons)
        if tris > target:
            m = o.modifiers.new('dec', 'DECIMATE')
            m.ratio = target / tris
            m.use_collapse_triangulate = True
            dg = bpy.context.evaluated_depsgraph_get()
            me2 = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
            o.modifiers.clear()
            o.data = me2
            bpy.data.meshes.remove(me)
            me = me2
        me.shade_smooth()
        me.materials.append(mat)
        # cor por vértice
        if color:
            ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
            for v in me.vertices:
                c = color(b2g(v.co), self)
                ca.data[v.index].color = (c.x, c.y, c.z, 1)
        parts.setdefault(jnt.name, []).append(o)
        print('SCULPT', self.name, len(me.polygons))
        return o




# ================================================================ materiais
TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tex', 'existido_texto.png')


def skin_material(name):
    """pele com as ESCRITAS (textura) × cor por vértice (manchas de Lodo e sombra nos sulcos)"""
    m = material(name, '#ffffff', 0.7)
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(TEX, check_existing=True)
    tex.interpolation = 'Linear'
    nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    return m


M = {
    'skin': skin_material('pele_existido'),
    'head': skin_material('cranio_existido'),
    'lodo': material('lodo_existido', '#07060a', 0.12),  # o Lodo Preto: preto molhado, brilhante
    'tooth': material('dente_existido', '#c9c0aa', 0.55),
    'eye': material('olho_existido', '#a9a596', 0.12),  # olhos saltados, úmidos (branco sujo)
    'pupil': material('lodo_pupila_existido', '#050407', 0.1),
}

C = {k: Vector(hex_rgb(v)) for k, v in {'white': '#e4e2de', 'crease': '#7c7872', 'stain': '#1c1a20', 'hole': '#0c0a0e'}.items()}

hipY = 1.04
shX, shY, shZ = 0.29, 0.6, 0.02
upL, foreL = 0.34, 0.33
thighL, shinL, hipX = 0.50, 0.54, 0.12
K = 0.575
W = 1.16


def g2b(p):
    return T(*p)


def b2g(v):
    return Vector((v.x, v.z, -v.y))


def n3(p, s=1.0):
    return noise.noise(Vector(p) * s)


def ridge(x, sharp=3):
    return (0.5 + 0.5 * math.cos(x)) ** sharp


# ---------------------------------------------------------------- UV cilíndrico: a escrita dá a volta no membro
def apply_uv(o, a, ax, ru=2.0, rv=1.6, ref=None):
    """u = ângulo em volta do eixo a→ax (ru voltas da textura), v = altura ao longo do eixo (rv texturas por metro)"""
    me = o.data
    a, ax = Vector(a), Vector(ax).normalized()
    r1 = Vector(ref) if ref else (Vector((0, 0, 1)) if abs(ax.z) < 0.9 else Vector((1, 0, 0)))
    r1 = (r1 - ax * r1.dot(ax)).normalized()
    r2 = ax.cross(r1)
    uvl = me.uv_layers.new(name='UVMap')
    for poly in me.polygons:
        us = []
        for li in poly.loop_indices:
            p = b2g(me.vertices[me.loops[li].vertex_index].co) - a
            t = p.dot(ax)
            q = p - ax * t
            ang = math.atan2(q.dot(r2), q.dot(r1)) / TAU
            us.append([ang * ru, t * rv])
        # emenda do ângulo: o polígono que cruza a volta fica todo do mesmo lado
        mn = min(u[0] for u in us)
        mx = max(u[0] for u in us)
        if mx - mn > ru * 0.5:
            for u in us:
                if u[0] < 0:
                    u[0] += ru
        for li, u in zip(poly.loop_indices, us):
            uvl.data[li].uv = u


def shade(p, sc, extra=0.0):
    """cor por vértice: branco (a textura aparece pura), sombra leve nos sulcos e manchas onde o Lodo escorreu"""
    lo = sc.field(p).get('stain', 0)
    c = C['white'].lerp(C['crease'], max(0.0, min(1.0, extra)))
    return c.lerp(C['stain'], min(1.0, lo * 1.5))


# ================================================================ juntas (as mesmas do Carniçal / Zumbi de Sangue)
body = joint('J_body', (0, 0, 0))
chest = joint('J_chest', (0, hipY, 0), body)
neck = joint('J_neck', (0, 0.64, 0.06), chest)
jaw = joint('J_jaw', (0, 0.1, 0.07), neck)

# ================================================================ TRONCO: ombros largos, peito e abdômen marcados, costelas
S = Sculpt('torso')
S.ell((0, -0.07, 0.0), (0.135 * W, 0.1, 0.09 * W))  # pelve
S.ell((0, 0.09, 0.0), (0.105 * W, 0.1, 0.075 * W))  # cintura fina
S.ell((0, 0.27, 0.0), (0.14 * W, 0.14, 0.09 * W))
S.ell((0, 0.45, 0.0), (0.19 * W, 0.15, 0.105 * W))  # caixa torácica
S.ell((0, 0.59, -0.02), (0.23 * W, 0.065, 0.085 * W))  # cintura escapular larga
for s in (1, -1):
    S.ell((s * 0.095 * W, 0.5, 0.07), (0.095 * W, 0.075, 0.06))  # peitoral
    S.ell((s * 0.16 * W, 0.41, -0.035), (0.065 * W, 0.16, 0.065), dir=(s * 0.35, 1, 0))  # dorsal (V)
    S.ell((s * 0.14 * W, 0.63, -0.03), (0.065 * W, 0.13, 0.06), dir=(s * 1, 0.45, 0))  # trapézio alto
    S.ell((s * 0.13 * W, 0.2, 0.03), (0.045 * W, 0.13, 0.05), dir=(s * 0.25, 1, 0.1))  # oblíquo
    S.ell((s * 0.085 * W, -0.09, -0.045), (0.07 * W, 0.08, 0.06))  # glúteo
    S.ell((s * 0.115 * W, -0.04, 0.035), (0.05 * W, 0.06, 0.048))
    for k in range(3):  # abdômen
        S.ell((s * 0.042 * W, 0.33 - k * 0.088, 0.068), (0.038, 0.04, 0.036))
    S.ell((s * 0.235 * W, 0.565, 0.0), (0.075, 0.075, 0.075))  # a ponta do ombro (une o braço ao tronco)
    S.ell((s * 0.11 * W, -0.11, 0.005), (0.08, 0.085, 0.075))  # o quadril (une a coxa)
    for k in range(4):  # costelas aparecendo nos flancos
        S.ell((s * 0.15 * W, 0.47 - k * 0.055, 0.03), (0.03, 0.014, 0.05), dir=(s * 0.6, 0.3, 1))
# o Lodo que desce da boca pelo peito (manchas: só cor)
for s in (1, -1, 0):
    S.chain(curve((s * 0.02, 0.7, 0.09), (s * 0.04, 0.55, 0.13), (s * 0.06, 0.3, 0.12), 6), [0.02, 0.02, 0.018, 0.016, 0.012, 0.008], group='stain', step=0.6)


def torso_disp(p):
    x, y, z = p
    ax = abs(x)
    if z > 0.03 and 0.05 < y <= 0.42 and ax < 0.1:  # gomos do abdômen
        g = min(abs(y - yk) for yk in (0.375, 0.287, 0.199, 0.111))
        v = 0.9 - math.exp(-(g / 0.012) ** 2) - math.exp(-(ax / 0.011) ** 2) * 0.9
        return 0.006 * (v - 0.35)
    if z > 0.0 and 0.44 < y < 0.62 and ax < 0.06:  # o sulco do esterno
        return -0.004 * math.exp(-(ax / 0.012) ** 2)
    return 0.0015 * n3(p, 30)


def torso_shade(p, sc):
    d = torso_disp(p)
    return shade(p, sc, max(0.0, -d / 0.006) * 0.8)


o = S.build(chest, M['skin'], 4200, disp=torso_disp, color=torso_shade)
apply_uv(o, (0, -0.2, 0), (0, 1, 0), ru=2.0, rv=1.1)

# o Lodo PRETO escorrendo da boca pelo peito (fios em relevo, brilhantes)
for k, s in enumerate((0.6, -0.4, 0.0, -0.9)):
    pts = curve((s * 0.03, 0.7, 0.1), (s * 0.06, 0.58, 0.135), (s * 0.09, 0.4, 0.12 + 0.01 * k), 6, jitter=0.01)
    add(chest, f'lodoPeito{k}', rod(pts, [0.012, 0.011, 0.01, 0.008, 0.006, 0.003], seg=5), M['lodo'])

# ================================================================ CABEÇA: a CAVEIRA (crânio grande, careca), olhos saltados e dentes à mostra
H = Sculpt('head')
for s in (1, -1):  # pescoço de tendões
    H.chain(curve((s * 0.035, -0.08, -0.01), (s * 0.05, 0.02, 0.0), (s * 0.045, 0.12, 0.0), 5), [0.05, 0.052, 0.048, 0.044, 0.04], step=0.6)
H.ell((0, -0.02, -0.03), (0.05, 0.08, 0.05))
H.ell((0, 0.255, -0.005), (0.105, 0.108, 0.118))  # o crânio grande
H.ell((0, 0.2, 0.075), (0.085, 0.075, 0.07))  # testa e órbitas
H.ell((0, 0.14, 0.07), (0.046, 0.03, 0.036))  # maxila (recuada: os dentes ficam na frente)
for s in (1, -1):
    H.ell((s * 0.072, 0.165, 0.075), (0.026, 0.022, 0.045), dir=(0, 0, 1))  # zigomático
    H.ell((s * 0.044, 0.243, 0.115), (0.038, 0.017, 0.022))  # arcada
    H.ell((s * 0.04, 0.2, 0.14), (0.032, 0.031, 0.04), 'hole', neg=True)  # órbita funda
    H.ell((s * 0.075, 0.11, 0.06), (0.022, 0.03, 0.03), 'hole', neg=True)  # bochecha afundada (só osso)
    H.ell((s * 0.04, 0.2, 0.118), (0.04, 0.038, 0.024), 'stain')  # o Lodo em volta e no fundo das órbitas (o anel escuro)
    # o Lodo que escorre dos olhos pelo rosto
    H.chain(curve((s * 0.04, 0.18, 0.13), (s * 0.048, 0.12, 0.13), (s * 0.05, 0.05, 0.11), 5), [0.02, 0.019, 0.017, 0.014, 0.01], 'stain', step=0.5)
H.ell((0, 0.163, 0.145), (0.013, 0.02, 0.03), 'hole', neg=True)  # nariz
H.ell((0, 0.105, 0.115), (0.058, 0.03, 0.055), 'hole', neg=True)  # a boca (sem lábios: os dentes ficam à mostra)


def head_disp(p):
    c = abs(n3(p, 20))
    v = -0.003 * max(0.0, 0.08 - c) / 0.08
    # os sulcos entre os dentes (a "grade" da caveira) logo acima da boca
    if p[2] > 0.08 and 0.11 < p[1] < 0.14 and abs(p[0]) < 0.05:
        v -= 0.003 * ridge(p[0] * 150, 4)
    return v


def head_shade(p, sc):
    f = sc.field(p)
    if f.get('hole', 0) > 0.35:
        return C['hole']
    return shade(p, sc)


oh = H.build(neck, M['head'], 3000, res=0.008, smooth=5, disp=head_disp, color=head_shade)
apply_uv(oh, (0, 0.0, 0), (0, 1, 0), ru=1.4, rv=1.5)

# os OLHOS saltados (brancos úmidos com o Lodo no meio) dentro das órbitas
for s in (1, -1):
    eye = Sculpt(f'eye{s}')
    eye.ell((s * 0.04, 0.2, 0.122), (0.019, 0.019, 0.018))
    eye.build(neck, M['eye'], 200, res=0.004, smooth=2)
    pu = Sculpt(f'pupil{s}')
    pu.ell((s * 0.04, 0.2, 0.139), (0.009, 0.009, 0.004))
    pu.build(neck, M['pupil'], 80, res=0.003, smooth=1)

# a MANDÍBULA (J_jaw) de osso, com a fileira de baixo
Jw = Sculpt('jaw')
Jw.chain(curve((-0.068, 0.05, -0.03), (0, -0.045, 0.06), (0.068, 0.05, -0.03), 9), [0.014, 0.017, 0.019, 0.02, 0.021, 0.02, 0.019, 0.017, 0.014], step=0.5)
Jw.ell((0, -0.01, 0.045), (0.03, 0.02, 0.022))  # o queixo (recuado: os dentes ficam na frente)
ojw = Jw.build(jaw, M['head'], 600, res=0.005, smooth=2, color=lambda p, sc: shade(p, sc))
apply_uv(ojw, (0, -0.05, 0), (0, 1, 0), ru=2.0, rv=2.0)
# DENTES: as duas fileiras inteiras, tortos (sem lábios)
for i in range(9):
    x = -0.04 + i * 0.01
    zf = 0.124 - (x / 0.05) ** 2 * 0.03
    tilt = 0.003 * math.sin(i * 2.3)
    add(neck, f'toothU{i}', spike((x, 0.128, zf - 0.006), (x + tilt, 0.096 - 0.004 * (i % 2), zf + 0.002), 0.0068, seg=5), M['tooth'])
    zj = 0.068 - (x / 0.05) ** 2 * 0.025
    add(jaw, f'toothD{i}', spike((x, -0.018, zj), (x - tilt, 0.018 + 0.004 * (i % 2), zj + 0.004), 0.0066, seg=5), M['tooth'])


# ================================================================ BRAÇOS: longos; o LODO cobre antebraços e mãos e pinga
def lodo_shell(jnt, name, pts, radii, target=700, drips=()):
    """casca preta e brilhante de Lodo por cima do membro (com gotas penduradas)"""
    L = Sculpt(name)
    L.chain(pts, radii, step=0.55)
    for c, r in drips:
        L.ell(c, r)
    L.build(jnt, M['lodo'], target, res=0.007, smooth=3, disp=lambda p: 0.004 * n3(p, 18))


def arm(s, name):
    sh = joint(f'J_sh{name}', (s * shX, shY, shZ), chest)
    U = Sculpt(f'upper{name}')
    U.ell((s * 0.018, -0.05, 0.0), (0.062 * W, 0.1, 0.064 * W), dir=(s * 0.25, 1, 0))  # deltoide
    U.chain([(0, -0.08, 0.0), (0, -0.18, 0.006), (0, -upL + 0.02, 0.0)], [0.048 * W, 0.05 * W, 0.04 * W], step=0.7)
    U.ell((0, -0.19, 0.03), (0.038 * W, 0.085, 0.036 * W))  # bíceps
    U.ell((s * 0.004, -0.16, -0.033), (0.038 * W, 0.095, 0.034 * W))  # tríceps
    ou = U.build(sh, M['skin'], 1000, color=lambda p, sc: shade(p, sc))
    apply_uv(ou, (0, 0.05, 0), (0, -1, 0), ru=1.0, rv=1.4)

    el = joint(f'J_el{name}', (0, -upL, 0), sh)
    F = Sculpt(f'fore{name}')
    F.chain([(0, 0.01, -0.01), (0, -0.09, 0.012), (0, -0.2, 0.008), (0, -foreL + 0.02, 0.0)], [0.044 * W, 0.05 * W, 0.04 * W, 0.031 * W], step=0.7)
    of = F.build(el, M['skin'], 600, color=lambda p, sc: shade(p, sc))
    apply_uv(of, (0, 0.02, 0), (0, -1, 0), ru=1.0, rv=1.4)
    # o Lodo toma o antebraço inteiro (começa logo abaixo do cotovelo, irregular) e pinga
    pts = [(0, 0.03, -0.01), (0, -0.06, 0.012), (0, -0.16, 0.01), (0, -0.26, 0.004), (0, -foreL + 0.01, 0.0)]
    rad = [0.04 * W, 0.056 * W, 0.054 * W, 0.046 * W, 0.037 * W]
    drips = [((s * 0.03, -0.12 - k * 0.07, 0.05), (0.012, 0.04, 0.012)) for k in range(3)] + [((s * -0.03, -0.2, -0.04), (0.012, 0.05, 0.012))]
    lodo_shell(el, f'lodoFore{name}', pts, rad, 800, drips)

    hand = joint(f'J_hand{name}', (0, -foreL, 0), el)
    # a MÃO grande e comprida, toda de Lodo (dedos longos)
    Hd = Sculpt(f'hand{name}')
    Hd.chain([(0, 0.03, 0.0), (0, -0.03, 0.006)], [0.038, 0.044])
    Hd.ell((0, -0.08, 0.014), (0.058, 0.072, 0.026))
    for i in range(4):
        aa = (i - 1.5) * 0.36
        x0 = math.sin(aa) * 0.07
        Hd.chain([(x0, -0.13, 0.022), (x0 * 1.25, -0.23, 0.036), (x0 * 1.35, -0.31, 0.07)], [0.016, 0.014, 0.011], step=0.5)
    Hd.chain([(-s * 0.058, -0.05, 0.03), (-s * 0.1, -0.13, 0.075), (-s * 0.095, -0.19, 0.115)], [0.022, 0.018, 0.014], step=0.5)
    Hd.ell((s * 0.0, -0.36, 0.06), (0.01, 0.04, 0.01))  # um fio de Lodo pingando da mão
    Hd.build(hand, M['lodo'], 900, res=0.006, smooth=2)


arm(1, 'L')
arm(-1, 'R')

# ================================================================ PERNAS (pés descalços com dedos compridos)
for s, name in ((1, 'L'), (-1, 'R')):
    hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
    Th = Sculpt(f'thigh{name}')
    Th.chain([(0, 0.0, 0.0), (0, -0.15, 0.02), (0, -0.32, 0.02), (0, -thighL + 0.02, 0.015)], [0.08 * W, 0.084 * W, 0.07 * W, 0.054 * W])
    Th.ell((s * 0.015, -0.25, 0.048), (0.056 * W, 0.15, 0.045), dir=(s * -0.1, 1, 0))
    Th.ell((0, -0.24, -0.048), (0.052 * W, 0.14, 0.043))
    ot = Th.build(hip, M['skin'], 1000, color=lambda p, sc: shade(p, sc))
    apply_uv(ot, (0, 0.02, 0), (0, -1, 0), ru=1.2, rv=1.3)

    knee = joint(f'J_knee{name}', (0, -thighL, 0.02), hip)
    Sh = Sculpt(f'shin{name}')
    Sh.chain([(0, 0.02, 0.0), (0, -0.12, -0.01), (0, -0.3, -0.012), (0, -shinL + 0.08, -0.005)], [0.054 * W, 0.056 * W, 0.042 * W, 0.034 * W])
    Sh.ell((0, -0.16, -0.045), (0.05 * W, 0.12, 0.045))
    Sh.ell((0, -shinL + 0.06, 0.0), (0.042, 0.048, 0.045))
    Sh.ell((0, -shinL + 0.03, 0.07), (0.05, 0.03, 0.1))
    Sh.ell((0, -shinL + 0.03, -0.025), (0.036, 0.03, 0.038))
    for i in range(4):
        aa = (i - 1.5) * 0.25
        Sh.chain([(math.sin(aa) * 0.038, -shinL + 0.024, 0.15), (math.sin(aa) * 0.05, -shinL + 0.015, 0.215)], [0.016, 0.011], step=0.5)
    os_ = Sh.build(knee, M['skin'], 1000, color=lambda p, sc: shade(p, sc))
    apply_uv(os_, (0, 0.0, 0), (0, -1, 0), ru=1.2, rv=1.3)

for objs in parts.values():
    for o in objs:
        if 'Col' not in o.data.color_attributes:
            ca = o.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
            for d in ca.data:
                d.color = (1, 1, 1, 1)
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()

if '--' in sys.argv and not os.environ.get('EXISTIDO_NO_EXPORT'):
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
    os.makedirs(src, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'existido_morte.blend'), check_existing=False)
    out = sys.argv[sys.argv.index('--') + 1]
    for ob in bpy.context.selected_objects:
        ob.select_set(False)
    # a cor por vértice vai junto da textura (o jogo multiplica as duas)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_skins=True, export_animations=False,
                              export_yup=True, export_materials='EXPORT', export_lights=False, export_cameras=False,
                              export_vertex_color='ACTIVE', export_image_format='WEBP')
    print('EXPORTADO', out)
