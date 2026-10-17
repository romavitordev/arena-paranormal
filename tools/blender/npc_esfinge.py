"""
CARNIÇAL DA ESFINGE (especial da Nubi) — wiki "Carniçal da Esfinge" (Calamidade ep. 10, Mansão Leone).

Referência (texto da wiki): corpo QUADRÚPEDE e ESQUELÉTICO, mas também de carne — tem MÃOS e CAUDA. O estômago é
RODEADO POR COSTELAS (é ali que fica quem ela devora), que levam a um GRANDE PESCOÇO no formato de uma MENÉS (o
toucado listrado dos faraós), com um COLAR DE CRÂNIOS, ambos com detalhes em ROXO. O rosto é um CRÂNIO HUMANOIDE de
dentes afiados com DOIS CHIFRES: um na testa protuberante e outro no queixo, imitando a barba do faraó. Um par de ASAS
RASGADAS de morcego e LODO PRETO escorrendo pelo corpo todo.

Modelo do jogo (adaptação de proporções): ~2,6 m até o topo do chifre, ~2,2 m de comprimento sem a cauda.
TÉCNICA (a mesma do Existido de Morte): cada parte é uma forma contínua de metaballs fundidos, suavizada e decimada; as
cores (osso, carne, as listras da Menés, o roxo, o Lodo) vão por VÉRTICE, sem costura.

Peças rígidas em juntas (J_*), animadas em código (src/combat/beasts.js → SphinxGhoul):
  body, torso, neck, head, jaw, legFL/FR/BL/BR (+ kneeFL/...), tail, wingL, wingR.
Modelado parado nas quatro patas, olhando para +z. Coordenadas no espaço do jogo (x = esquerda, y = cima, z = frente).

  node tools/blender/build.mjs esfinge   → public/npcs/esfinge.glb (+ tools/blender/fonte/esfinge.blend)
"""
import sys
import os
import math
import random

import bpy
import bmesh
from mathutils import Vector, noise

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, hex_rgb, TAU
from npc_lib import T, rod, curve, spike, blob, joint, add, parts, finish

random.seed(29)
reset()
K = 0.575


def g2b(p):
    return T(*p)


def b2g(v):
    return Vector((v.x, v.z, -v.y))


def n3(p, s=1.0):
    return noise.noise(Vector(p) * s)


def vcol_material(name, rough=0.6):
    m = material(name, '#ffffff', rough)
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Col'
    nt.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
    return m


class Sculpt:
    """forma orgânica de metaballs (ver npc_existido_morte.py); os grupos dizem a cor e os negativos cavam"""

    def __init__(self, name):
        self.name = name
        self.els = []

    def ell(self, c, r, group='flesh', dir=None, neg=False):
        if not isinstance(r, (tuple, list)):
            r = (r, r, r)
        self.els.append((Vector(c), tuple(r), Vector(dir).normalized() if dir else None, neg, group))

    def chain(self, pts, radii, group='flesh', step=0.45):
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
        out = {}
        for c, r, d, neg, g in self.els:
            q = p - c
            if d is None:
                x, y, z = q.x / r[0], q.y / r[1], q.z / r[2]
            else:
                along = q.dot(d)
                perp = (q - d * along).length
                x, y, z = perp / r[0], along / r[1], 0
            dd = (x * x + y * y + z * z) * K * K
            if dd < 1:
                out[g] = out.get(g, 0) + 2 * (1 - dd) ** 3
        return out

    def build(self, jnt, mat, target, res=0.012, smooth=4, disp=None, color=None):
        mb = bpy.data.metaballs.new('MB' + self.name)
        mb.resolution = res
        mb.render_resolution = res
        mb.threshold = 0.6
        for c, r, d, neg, g in self.els:
            e = mb.elements.new(type='ELLIPSOID')
            e.co = g2b(c)
            e.radius = 1 / K
            e.stiffness = 8.0 if neg else 2.0
            e.use_negative = neg
            if d is None:
                e.size_x, e.size_y, e.size_z = r[0], r[2], r[1]
            else:
                e.size_x, e.size_y, e.size_z = r[0], r[0], r[1]
                e.rotation = Vector((0, 0, 1)).rotation_difference(g2b(d))
        mob = bpy.data.objects.new('MB' + self.name, mb)
        bpy.context.scene.collection.objects.link(mob)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(mob.evaluated_get(dg))
        bpy.data.objects.remove(mob)
        bpy.data.metaballs.remove(mb)
        o = bpy.data.objects.new(self.name, me)
        bpy.context.scene.collection.objects.link(o)
        o.parent = jnt
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=res * 0.25)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        for _ in range(smooth):
            bmesh.ops.smooth_vert(bm, verts=bm.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        bm.normal_update()
        if disp:
            for v in bm.verts:
                v.co += v.normal * disp(b2g(v.co))
        bm.to_mesh(me)
        bm.free()
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
        ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
        for v in me.vertices:
            c = (color or paint)(b2g(v.co), self)
            ca.data[v.index].color = (c.x, c.y, c.z, 1)
        parts.setdefault(jnt.name, []).append(o)
        print('SCULPT', self.name, len(me.polygons))
        return o


# ================================================================ materiais e cores
M = {
    'body': vcol_material('corpo_esfinge', 0.62),
    'lodo': material('lodo_esfinge', '#07060a', 0.12),  # Lodo Preto: preto molhado, brilhante
    'tooth': material('dente_esfinge', '#d6ccb2', 0.5),
    'bone': material('osso_esfinge', '#c4b698', 0.6),
    'hole': material('lodo_orbita_esfinge', '#050407', 0.2),
    'purple': material('roxo_esfinge', '#6a3488', 0.45),
    'wing': material('asa_esfinge', '#241c26', 0.7),
}
C = {k: Vector(hex_rgb(v)) for k, v in {
    'bone': '#cbbd9f', 'bone2': '#9a8c74', 'flesh': '#3c3036', 'flesh2': '#2a2028', 'nemesA': '#1c1820', 'nemesB': '#5c2c78',
    'purple': '#6a3488', 'stain': '#0c0a0e', 'hole': '#060508',
}.items()}


def paint(p, sc):
    f = sc.field(p)
    if f.get('hole', 0) > 0.35:
        return C['hole']
    if not f:
        return C['flesh']
    g = max(f, key=f.get)
    st = min(1.0, f.get('stain', 0) * 1.4)
    if g == 'bone':
        c = C['bone'].lerp(C['bone2'], max(0.0, min(1.0, 0.5 + n3(p, 9) * 0.8)))
    elif g == 'nemes':
        # as LISTRAS da Menés: faixas horizontais pretas e roxas
        c = C['nemesB'] if math.sin(p[1] * 30) > 0.2 else C['nemesA']
    elif g == 'purple':
        c = C['purple']
    elif g == 'stain':
        c = C['stain']
    else:
        c = C['flesh'].lerp(C['flesh2'], max(0.0, min(1.0, 0.5 + n3(p, 7))))
        # onde a carne encosta no osso, clareia (transição gradual)
        b = f.get('bone', 0)
        if b > 0:
            c = c.lerp(C['bone2'], min(0.6, b * 0.5))
    return c.lerp(C['stain'], st * 0.85)


def drip(jnt, name, top, ln, r=0.022):
    """um fio de Lodo pingando"""
    x, y, z = top
    pts = [(x, y, z), (x + random.uniform(-0.01, 0.01), y - ln * 0.5, z), (x, y - ln, z + random.uniform(-0.01, 0.01))]
    add(jnt, name, rod(pts, [r, r * 0.7, r * 0.25], seg=6), M['lodo'])
    add(jnt, name + 'g', blob((x, y - ln, z), (r * 0.9, r * 1.3, r * 0.9), 6, 5), M['lodo'])


# ================================================================ juntas
legH = 0.95
halfL = 0.72
body = joint('J_body', (0, 0, 0))
torso = joint('J_torso', (0, legH, 0), body)

# ================================================================ TRONCO: espinha, bacia, ombros e a barriga de carne (dentro das costelas)
S = Sculpt('torso')
S.chain([(0, 0.06, -halfL), (0, 0.13, -0.3), (0, 0.16, 0.1), (0, 0.17, halfL * 0.8)], [0.07, 0.075, 0.08, 0.09], 'bone', step=0.6)
S.ell((0, 0.02, -halfL + 0.04), (0.2, 0.13, 0.16), 'bone')  # bacia
for s in (1, -1):
    S.ell((s * 0.13, -0.02, -halfL + 0.06), (0.09, 0.13, 0.1), 'flesh')  # a anca (une a coxa)
    S.ell((s * 0.17, 0.06, halfL * 0.72), (0.11, 0.17, 0.13), 'flesh', dir=(s * 0.3, 1, 0.2))  # ombro
    S.ell((s * 0.12, 0.14, halfL * 0.6), (0.1, 0.03, 0.14), 'bone')  # escápula
S.ell((0, -0.08, 0.06), (0.17, 0.17, 0.38), 'flesh')  # a barriga (o "estômago" cercado pelas costelas)
S.ell((0, 0.04, halfL * 0.62), (0.2, 0.17, 0.2), 'flesh')  # o peito
S.ell((0, -0.08, 0.1), (0.1, 0.1, 0.2), 'stain')  # mancha do Lodo na barriga
for k in range(12):  # vértebras salientes no dorso
    z = -halfL + 0.1 + k * 0.115
    S.ell((0, 0.22 + 0.01 * math.sin(k), z), (0.035, 0.05, 0.03), 'bone')
ot = S.build(torso, M['body'], 5200, disp=lambda p: 0.004 * n3(p, 14))

# as COSTELAS em volta da barriga (gaiola aberta: dá para ver a carne lá dentro)
for i in range(8):
    z = -0.3 + i * 0.105
    w = 0.3 - abs(i - 3.5) * 0.018
    for s in (1, -1):
        pts = curve((s * 0.05, 0.16, z), (s * (w + 0.04), 0.06, z + 0.02), (s * (w - 0.06), -0.3, z + 0.05), 8)
        pts.append((s * 0.05, -0.36, z + 0.07))
        add(torso, f'rib{i}{s}', rod(pts, [0.024, 0.026, 0.026, 0.024, 0.022, 0.02, 0.018, 0.016, 0.014], seg=6), M['bone'])
add(torso, 'sterno', rod([(0, -0.36, -0.25), (0, -0.38, 0.1), (0, -0.33, 0.5)], [0.03, 0.034, 0.03], seg=6), M['bone'])
for i in range(7):  # o Lodo pingando da barriga e das costelas
    drip(torso, f'dripB{i}', (random.uniform(-0.2, 0.2), -0.33, random.uniform(-0.25, 0.5)), random.uniform(0.12, 0.3))

# ================================================================ PESCOÇO: o enorme pescoço em forma de MENÉS e o COLAR DE CRÂNIOS
neck = joint('J_neck', (0, 0.14, halfL * 0.82), torso)
Nk = Sculpt('neck')
Nk.chain([(0, -0.05, -0.05), (0, 0.3, 0.1), (0, 0.6, 0.26), (0, 0.84, 0.38)], [0.17, 0.15, 0.13, 0.12], 'flesh', step=0.6)
# a MENÉS: o toucado listrado — o pano liso que cobre o alto da cabeça, abre em leque achatado dos lados (como um capuz)
# e cai em duas ABAS CHATAS e largas na frente dos ombros
Nk.ell((0, 0.98, 0.26), (0.2, 0.13, 0.17), 'nemes')  # o alto (por cima e atrás do crânio)
Nk.ell((0, 0.78, 0.12), (0.2, 0.3, 0.07), 'nemes')  # as costas do pano (achatado)
Nk.ell((0, 0.5, 0.04), (0.17, 0.26, 0.06), 'nemes')
for s in (1, -1):
    Nk.ell((s * 0.24, 0.86, 0.24), (0.15, 0.2, 0.04), 'nemes', dir=(s * 0.45, 1, 0))  # o leque achatado do lado da cabeça
    Nk.ell((s * 0.32, 0.6, 0.27), (0.11, 0.2, 0.035), 'nemes', dir=(s * 0.2, 1, 0.15))
    for k in range(5):  # a ABA chata que desce na frente do ombro, alargando
        Nk.ell((s * (0.3 - k * 0.006), 0.42 - k * 0.085, 0.3 + k * 0.012), (0.1 + k * 0.006, 0.07, 0.03), 'nemes')
    Nk.ell((s * 0.27, -0.02, 0.36), (0.12, 0.03, 0.035), 'purple')  # a barra roxa da ponta da aba
Nk.ell((0, 1.0, 0.42), (0.19, 0.05, 0.05), 'purple', dir=(1, 0, 0))  # a faixa roxa da testa da Menés
Nk.build(neck, M['body'], 3600, res=0.011, disp=lambda p: 0.003 * n3(p, 16))

# o COLAR DE CRÂNIOS na base do pescoço (crânios pequenos de osso e contas roxas)
for i in range(11):
    a = -1.25 + i * 0.25  # só na frente e nos lados (atrás fica a Menés)
    cx, cz = math.sin(a) * 0.27, math.cos(a) * 0.22 + 0.06
    cy = 0.12 - math.cos(a) * 0.05
    add(neck, f'sk{i}', blob((cx, cy, cz), (0.045, 0.05, 0.042), 9, 7), M['bone'])
    nx, nz = math.sin(a), math.cos(a)
    for e in (1, -1):
        ex = cx + nx * 0.035 + nz * e * 0.017
        ez = cz + nz * 0.035 - nx * e * 0.017
        add(neck, f'ske{i}{e}', blob((ex, cy + 0.008, ez), (0.012, 0.013, 0.008), 6, 4), M['hole'])
    add(neck, f'bead{i}', blob((math.sin(a + 0.125) * 0.29, cy - 0.04, math.cos(a + 0.125) * 0.24 + 0.06), (0.018, 0.018, 0.018), 6, 5), M['purple'])

# ================================================================ CABEÇA: crânio humanoide, testa protuberante com chifre, dentes afiados
head = joint('J_head', (0, 0.9, 0.46), neck)
head.scale = (1.25, 1.25, 1.25)
Hd = Sculpt('head')
Hd.ell((0, 0.06, -0.02), (0.15, 0.16, 0.16), 'bone')  # crânio
Hd.ell((0, 0.12, 0.1), (0.13, 0.08, 0.09), 'bone')  # a TESTA protuberante
Hd.ell((0, -0.03, 0.1), (0.075, 0.05, 0.06), 'bone')  # maxila
for s in (1, -1):
    Hd.ell((s * 0.09, 0.0, 0.08), (0.035, 0.03, 0.06), 'bone', dir=(0, 0, 1))  # zigomático
    Hd.ell((s * 0.055, 0.04, 0.17), (0.045, 0.042, 0.05), 'hole', neg=True)  # órbita funda
    Hd.ell((s * 0.1, -0.05, 0.07), (0.03, 0.04, 0.04), 'hole', neg=True)  # bochecha cavada
    Hd.ell((s * 0.055, 0.03, 0.15), (0.055, 0.05, 0.03), 'stain')  # o Lodo em volta das órbitas
    Hd.chain(curve((s * 0.055, 0.0, 0.17), (s * 0.06, -0.06, 0.17), (s * 0.065, -0.13, 0.14), 5), 0.018, 'stain', step=0.5)
Hd.ell((0, -0.01, 0.18), (0.018, 0.028, 0.04), 'hole', neg=True)  # nariz
Hd.ell((0, -0.08, 0.15), (0.075, 0.03, 0.06), 'hole', neg=True)  # a boca sem lábios
Hd.build(head, M['body'], 2600, res=0.008, smooth=5, disp=lambda p: -0.003 * max(0.0, 0.08 - abs(n3(p, 22))) / 0.08)
# o CHIFRE da testa (curvo para cima e para a frente)
add(head, 'hornF', rod(curve((0, 0.15, 0.14), (0, 0.32, 0.19), (0, 0.44, 0.3), 8), [0.05, 0.045, 0.04, 0.034, 0.027, 0.02, 0.012, 0.003], seg=8), M['bone'])
for k in range(4):  # anéis do chifre
    t = 0.15 + k * 0.1
    add(head, f'hornR{k}', blob((0, 0.15 + t * 0.6, 0.15 + t * 0.15), (0.045 - k * 0.006, 0.012, 0.045 - k * 0.006), 8, 4), M['bone'])
# DENTES de cima: afiados, compridos
for i in range(10):
    x = -0.06 + i * 0.0133
    zf = 0.17 - (x / 0.07) ** 2 * 0.045
    add(head, f'toothU{i}', spike((x, -0.06, zf - 0.006), (x * 1.05, -0.115 - 0.012 * (i % 2), zf + 0.006), 0.009, seg=5), M['tooth'])

# a MANDÍBULA, com a fileira de baixo e o CHIFRE DO QUEIXO (a "barba" do faraó)
jaw = joint('J_jaw', (0, -0.1, 0.03), head)
Jw = Sculpt('jaw')
Jw.chain(curve((-0.1, 0.06, -0.06), (0, -0.05, 0.14), (0.1, 0.06, -0.06), 9), [0.02, 0.025, 0.028, 0.03, 0.032, 0.03, 0.028, 0.025, 0.02], 'bone', step=0.5)
Jw.ell((0, -0.04, 0.11), (0.045, 0.035, 0.035), 'bone')
Jw.build(jaw, M['body'], 700, res=0.006, smooth=2)
add(jaw, 'hornC', rod(curve((0, -0.05, 0.12), (0, -0.2, 0.15), (0, -0.34, 0.24), 8), [0.034, 0.032, 0.03, 0.026, 0.021, 0.015, 0.009, 0.002], seg=8), M['bone'])
for k in range(3):  # trançado da barba
    add(jaw, f'beardR{k}', blob((0, -0.1 - k * 0.07, 0.13 + k * 0.025), (0.034 - k * 0.005, 0.012, 0.034 - k * 0.005), 8, 4), M['purple'])
for i in range(9):
    x = -0.055 + i * 0.0137
    zj = 0.13 - (x / 0.065) ** 2 * 0.045
    add(jaw, f'toothD{i}', spike((x, 0.0, zj), (x * 1.05, 0.05 + 0.01 * (i % 2), zj + 0.006), 0.008, seg=5), M['tooth'])
drip(jaw, 'dripJ', (0.03, -0.04, 0.12), 0.25, 0.02)
drip(jaw, 'dripJ2', (-0.05, -0.02, 0.09), 0.18, 0.016)

# ================================================================ PATAS: na frente MÃOS (dedos longos com garras); atrás, patas de osso
upper, lower = legH * 0.5, legH * 0.5
for name, s, z, front in (('FL', 1, halfL * 0.72, True), ('FR', -1, halfL * 0.72, True), ('BL', 1, -halfL + 0.06, False), ('BR', -1, -halfL + 0.06, False)):
    x = s * (0.25 if front else 0.2)
    leg = joint(f'J_leg{name}', (x, -0.02, z), torso)
    U = Sculpt(f'thigh{name}')
    if front:
        U.chain([(0, 0.06, 0), (0, -0.2, 0.01), (0, -upper + 0.02, 0)], [0.1, 0.078, 0.058], 'flesh', step=0.6)
        U.chain([(s * 0.03, 0.0, -0.03), (s * 0.03, -upper + 0.04, -0.02)], 0.025, 'bone', step=0.6)  # o úmero aparecendo
    else:
        U.chain([(0, 0.06, 0), (0, -0.2, -0.03), (0, -upper + 0.02, -0.02)], [0.11, 0.08, 0.055], 'flesh', step=0.6)
        U.ell((s * 0.02, -0.12, 0.03), (0.07, 0.15, 0.06), 'flesh')
    U.ell((0, -upper, 0), (0.05, 0.05, 0.05), 'bone')  # o joelho / cotovelo de osso
    U.build(leg, M['body'], 900, res=0.01)
    knee = joint(f'J_knee{name}', (0, -upper, 0), leg)
    L = Sculpt(f'shin{name}')
    L.chain([(0, 0.0, 0), (0, -0.22, 0.01), (0, -lower + 0.06, 0.02)], [0.058, 0.05, 0.04], 'bone' if not front else 'flesh', step=0.6)
    if front:
        # a MÃO apoiada no chão: palma e cinco dedos compridos para a frente
        L.ell((0, -lower + 0.04, 0.07), (0.075, 0.03, 0.09), 'flesh')
        for i in range(4):
            a = (i - 1.5) * 0.28
            x0 = math.sin(a) * 0.06
            L.chain([(x0, -lower + 0.035, 0.13), (x0 * 1.4, -lower + 0.03, 0.21), (x0 * 1.6, -lower + 0.015, 0.27)], [0.02, 0.017, 0.013], 'flesh', step=0.5)
        L.chain([(s * 0.07, -lower + 0.04, 0.05), (s * 0.12, -lower + 0.025, 0.12)], [0.022, 0.016], 'flesh', step=0.5)  # polegar
    else:
        L.ell((0, -lower + 0.04, 0.05), (0.06, 0.035, 0.1), 'bone')
        for i in range(3):
            a = (i - 1) * 0.35
            L.chain([(math.sin(a) * 0.04, -lower + 0.03, 0.1), (math.sin(a) * 0.07, -lower + 0.02, 0.18)], [0.02, 0.014], 'bone', step=0.5)
    L.build(knee, M['body'], 1100, res=0.008)
    # garras
    n = 4 if front else 3
    for i in range(n):
        a = (i - (n - 1) / 2) * (0.28 if front else 0.35)
        bx = math.sin(a) * (0.06 * 1.6 if front else 0.07)
        bz = 0.27 if front else 0.18
        add(knee, f'claw{i}', spike((bx, -lower + 0.02, bz - 0.01), (bx * 1.1, -lower - 0.005, bz + 0.07), 0.011, seg=5), M['tooth'])
    if front:
        drip(knee, 'dripH', (s * 0.03, -0.25, 0.04), 0.2, 0.018)

# ================================================================ CAUDA: longa, de vértebras, curvando para trás e para cima
tail = joint('J_tail', (0, 0.07, -halfL - 0.02), torso)
Tl = Sculpt('tail')
tp = curve((0, 0, 0), (0, -0.05, -0.55), (0, 0.4, -0.95), 12)
Tl.chain(tp, [0.06 - i * 0.0045 for i in range(12)], 'flesh', step=0.6)
for i, p in enumerate(tp[:-1]):
    Tl.ell((p[0], p[1] + 0.045 - i * 0.003, p[2]), (0.022, 0.03, 0.022), 'bone')
Tl.build(tail, M['body'], 1000, res=0.008)
add(tail, 'tailTip', spike(tp[-2], (0, 0.52, -1.05), 0.022, seg=6), M['bone'])

# ================================================================ ASAS RASGADAS de morcego (ossos e membrana com rasgos)
for s, name in ((1, 'L'), (-1, 'R')):
    wing = joint(f'J_wing{name}', (s * 0.16, 0.2, halfL * 0.5), torso)
    elbow = (s * 0.5, 0.62, -0.1)
    wrist = (s * 0.9, 1.05, -0.38)
    add(wing, 'arm', rod([(0, 0, 0), elbow, wrist], [0.035, 0.03, 0.022], seg=7), M['bone'])
    add(wing, 'elbowK', blob(elbow, (0.035, 0.035, 0.035), 7, 5), M['bone'])
    add(wing, 'thumb', spike(wrist, (s * 0.98, 1.22, -0.28), 0.016, seg=5), M['tooth'])
    tips = [(s * 1.6, 0.95, -0.7), (s * 1.5, 0.35, -0.95), (s * 1.12, -0.05, -0.95), (s * 0.66, -0.1, -0.7)]
    for i, tpt in enumerate(tips):
        mid = tuple(wrist[k] + (tpt[k] - wrist[k]) * 0.5 + (0, -0.04, 0)[k] for k in range(3))
        add(wing, f'finger{i}', rod([wrist, mid, tpt], [0.018, 0.013, 0.005], seg=5), M['bone'])
    # membrana: painéis entre o corpo/ dedos, uma grade com buracos e a borda rasgada
    edges = [[(0, -0.05, -0.05), elbow, wrist]] + [[wrist, tpt] for tpt in tips] + [[(0, -0.05, -0.05), (s * 0.18, -0.2, -0.35)]]
    root = Vector((0, -0.05, -0.05))
    anchors = [Vector(wrist)] + [Vector(t) for t in tips] + [Vector((s * 0.18, -0.2, -0.35))]
    V, F, U = [], [], []
    R = 6  # anéis do pulso até a borda
    for pi in range(len(anchors) - 1):
        a0, a1 = anchors[pi], anchors[pi + 1]
        base = len(V)
        # o painel liga o pulso (ou o corpo, no último) às pontas de dois dedos vizinhos
        hub = Vector(wrist) if pi < len(anchors) - 2 else root
        if pi == 0:
            hub = Vector(elbow)
        cols = 6
        for r in range(R + 1):
            t = r / R
            for c in range(cols + 1):
                u = c / cols
                edge = a0.lerp(a1, u)
                # a borda de fuga se curva para dentro entre os dedos (o recorte da asa de morcego)
                sag = math.sin(u * math.pi) * 0.22 * t
                p = hub.lerp(edge, t * (1 - sag))
                p += Vector((0, -0.02, 0)) * math.sin(u * math.pi) * t
                V.append(tuple(T(p.x, p.y, p.z)))
                U.append((u, t))
        for r in range(R):
            for c in range(cols):
                # os RASGOS: alguns quadrados somem (mais perto da borda) e a borda fica irregular
                hole = (r >= 2 and random.random() < 0.12 + 0.05 * r) or (r == R - 1 and random.random() < 0.35)
                if hole:
                    continue
                a = base + r * (cols + 1) + c
                F.append((a, a + 1, a + cols + 2, a + cols + 1))
    o = add(wing, 'membrane', (V, F, U), M['wing'])
    o.data.materials[0].use_backface_culling = False

# o Lodo escorrendo pelo resto do corpo (ombros e pescoço)
for i in range(4):
    drip(neck, f'dripN{i}', (random.uniform(-0.15, 0.15), random.uniform(0.1, 0.4), 0.18), random.uniform(0.12, 0.25), 0.02)

for objs in parts.values():
    for o in objs:
        if 'Col' not in o.data.color_attributes:
            ca = o.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
            for d in ca.data:
                d.color = (1, 1, 1, 1)
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()

if '--' in sys.argv:
    src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
    os.makedirs(src, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'esfinge.blend'), check_existing=False)
    out = sys.argv[sys.argv.index('--') + 1]
    for ob in bpy.context.selected_objects:
        ob.select_set(False)
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_skins=False, export_animations=False,
                              export_yup=True, export_materials='EXPORT', export_lights=False, export_cameras=False,
                              export_vertex_color='ACTIVE')
    print('EXPORTADO', out)
