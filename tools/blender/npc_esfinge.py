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
    'wing': material('asa_esfinge', '#2c2030', 0.7),
    'menesA': material('menes_preto_esfinge', '#18141c', 0.55),  # as listras da Menés
    'menesB': material('menes_roxo_esfinge', '#6a3488', 0.5),
}
C = {k: Vector(hex_rgb(v)) for k, v in {
    'bone': '#ddd0b4', 'bone2': '#a89880', 'flesh': '#5e4a54', 'flesh2': '#463840', 'gut': '#22161e',
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
    elif g == 'gut':
        c = C['gut']
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
legH = 1.0
halfL = 0.8
body = joint('J_body', (0, 0, 0))
torso = joint('J_torso', (0, legH, 0), body)


def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


# ================================================================ TRONCO (silhueta de leão): peito fundo, ombros e ancas fortes; a barriga
# escura fica dentro da gaiola de costelas
S = Sculpt('torso')
S.ell((0, -0.02, 0.56), (0.26, 0.3, 0.25), 'flesh')  # o peito fundo
for s in (1, -1):
    S.ell((s * 0.19, 0.06, 0.55), (0.13, 0.23, 0.17), 'flesh', dir=(s * 0.2, 1, 0.1))  # ombro (cobre o alto da pata)
    S.ell((s * 0.13, 0.26, 0.5), (0.11, 0.03, 0.16), 'bone')  # escápula aparecendo
    S.ell((s * 0.15, 0.02, -0.62), (0.15, 0.24, 0.22), 'flesh')  # anca
    S.ell((s * 0.12, 0.22, -0.6), (0.06, 0.04, 0.11), 'bone')  # a crista da bacia
S.chain([(0, 0.16, 0.5), (0, 0.2, 0.1), (0, 0.17, -0.35), (0, 0.12, -0.7)], [0.17, 0.12, 0.12, 0.15], 'flesh', step=0.6)  # o dorso
S.ell((0, 0.08, -0.74), (0.19, 0.16, 0.15), 'flesh')  # garupa
S.ell((0, -0.13, 0.02), (0.14, 0.14, 0.3), 'gut')  # o estômago (dentro das costelas)
for k in range(14):  # vértebras salientes no dorso
    z = -0.78 + k * 0.105
    y = 0.28 + 0.04 * math.sin((k / 13) * math.pi)
    S.ell((0, y, z), (0.032, 0.045, 0.03), 'bone')
for s in (1, -1, 0):  # Lodo escorrendo pelos flancos (manchas)
    S.chain([(s * 0.18, 0.2, 0.42), (s * 0.24, -0.05, 0.45), (s * 0.22, -0.25, 0.48)], 0.04, 'stain', step=0.6)
S.build(torso, M['body'], 6000, disp=lambda p: 0.004 * n3(p, 12))

# as COSTELAS: gaiola aberta em volta do estômago, presa ao dorso e ao esterno
for i in range(8):
    z = -0.34 + i * 0.1
    w = 0.29 - abs(i - 3.5) * 0.016
    for s in (1, -1):
        pts = curve((s * 0.06, 0.22, z), (s * (w + 0.06), 0.06, z + 0.02), (s * (w - 0.05), -0.3, z + 0.04), 8)
        pts.append((s * 0.05, -0.37, z + 0.06))
        add(torso, f'rib{i}{s}', rod(pts, [0.028, 0.03, 0.03, 0.028, 0.026, 0.024, 0.021, 0.019, 0.016], seg=6), M['bone'])
add(torso, 'sterno', rod([(0, -0.37, -0.3), (0, -0.39, 0.1), (0, -0.3, 0.42)], [0.032, 0.036, 0.032], seg=6), M['bone'])
for i in range(5):
    drip(torso, f'dripB{i}', (random.uniform(-0.15, 0.15), -0.36, random.uniform(-0.25, 0.4)), random.uniform(0.15, 0.32))

# ================================================================ PESCOÇO: coluna grossa de tendões que sobe do peito; o COLAR DE CRÂNIOS na base
neck = joint('J_neck', (0, 0.22, 0.72), torso)
Nk = Sculpt('neck')
Nk.chain([(0, -0.08, -0.06), (0, 0.3, 0.12), (0, 0.58, 0.24), (0, 0.8, 0.3)], [0.2, 0.16, 0.14, 0.13], 'flesh', step=0.6)
for s in (1, -1):  # tendões
    Nk.chain([(s * 0.08, 0.0, 0.05), (s * 0.07, 0.4, 0.2), (s * 0.05, 0.75, 0.32)], 0.04, 'flesh', step=0.6)
Nk.chain([(0, 0.05, 0.15), (0, 0.45, 0.3), (0, 0.72, 0.38)], 0.03, 'stain', step=0.6)  # o Lodo que desce da boca
Nk.build(neck, M['body'], 2400, res=0.011, disp=lambda p: 0.003 * n3(p, 16))

for i in range(11):
    a = -1.3 + i * 0.26
    cx, cz = math.sin(a) * 0.29, math.cos(a) * 0.24 + 0.04
    cy = 0.1 - math.cos(a) * 0.05
    add(neck, f'sk{i}', blob((cx, cy, cz), (0.05, 0.056, 0.047), 9, 7), M['bone'])
    nx, nz = math.sin(a), math.cos(a)
    for e in (1, -1):
        ex = cx + nx * 0.04 + nz * e * 0.019
        ez = cz + nz * 0.04 - nx * e * 0.019
        add(neck, f'ske{i}{e}', blob((ex, cy + 0.01, ez), (0.013, 0.015, 0.009), 6, 4), M['hole'])
    add(neck, f'bead{i}', blob((math.sin(a + 0.13) * 0.31, cy - 0.045, math.cos(a + 0.13) * 0.26 + 0.04), (0.02, 0.02, 0.02), 6, 5), M['purple'])
add(neck, 'cord', rod([(math.sin(-1.45 + t * 0.29) * 0.3, 0.1 - math.cos(-1.45 + t * 0.29) * 0.05, math.cos(-1.45 + t * 0.29) * 0.25 + 0.04) for t in range(11)], 0.012, seg=5), M['purple'])

# ================================================================ CABEÇA: crânio humanoide, testa protuberante com chifre, dentes afiados
head = joint('J_head', (0, 0.84, 0.36), neck)
head.scale = (1.25, 1.25, 1.25)
Hd = Sculpt('head')
Hd.ell((0, 0.06, -0.02), (0.15, 0.16, 0.16), 'bone')
Hd.ell((0, 0.12, 0.1), (0.13, 0.08, 0.09), 'bone')  # a TESTA protuberante
Hd.ell((0, -0.03, 0.1), (0.075, 0.05, 0.06), 'bone')
for s in (1, -1):
    Hd.ell((s * 0.09, 0.0, 0.08), (0.035, 0.03, 0.06), 'bone', dir=(0, 0, 1))
    Hd.ell((s * 0.055, 0.04, 0.17), (0.045, 0.042, 0.05), 'hole', neg=True)  # órbita funda
    Hd.ell((s * 0.1, -0.05, 0.07), (0.03, 0.04, 0.04), 'hole', neg=True)
    Hd.ell((s * 0.055, 0.03, 0.15), (0.055, 0.05, 0.03), 'stain')
    Hd.chain(curve((s * 0.055, 0.0, 0.17), (s * 0.06, -0.06, 0.17), (s * 0.065, -0.13, 0.14), 5), 0.018, 'stain', step=0.5)
Hd.ell((0, -0.01, 0.18), (0.018, 0.028, 0.04), 'hole', neg=True)
Hd.ell((0, -0.08, 0.15), (0.075, 0.03, 0.06), 'hole', neg=True)
Hd.build(head, M['body'], 2600, res=0.008, smooth=5, disp=lambda p: -0.003 * max(0.0, 0.08 - abs(n3(p, 22))) / 0.08)
add(head, 'hornF', rod(curve((0, 0.15, 0.14), (0, 0.32, 0.19), (0, 0.44, 0.3), 8), [0.05, 0.045, 0.04, 0.034, 0.027, 0.02, 0.012, 0.003], seg=8), M['bone'])
for k in range(4):
    t = 0.15 + k * 0.1
    add(head, f'hornR{k}', blob((0, 0.15 + t * 0.6, 0.15 + t * 0.15), (0.045 - k * 0.006, 0.012, 0.045 - k * 0.006), 8, 4), M['bone'])
for i in range(10):
    x = -0.06 + i * 0.0133
    zf = 0.17 - (x / 0.07) ** 2 * 0.045
    add(head, f'toothU{i}', spike((x, -0.06, zf - 0.006), (x * 1.05, -0.115 - 0.012 * (i % 2), zf + 0.006), 0.009, seg=5), M['tooth'])


# ---------------------------------------------------------------- a MENÉS: superfície de pano de verdade (não bolhas), com listras nítidas
def nemes():
    """o toucado: capuz que cobre o alto e os lados do crânio, abre em leque nas têmporas, duas abas chatas caem na
    frente dos ombros e um rabo de pano atrás. Listras horizontais pretas e roxas por face (material)."""
    V, U, rows = [], [], []
    R, C = 16, 30
    top, bot = 0.25, -0.3
    for r in range(R + 1):
        v = r / R
        y = top + (bot - top) * v
        dome = math.sin(min(1.0, v / 0.2) * math.pi / 2)
        rad = (0.192 * dome + 0.01) + 0.11 * smoothstep(0.2, 0.75, v)
        amax = math.pi * (0.97 - 0.36 * smoothstep(0.08, 0.3, v))  # em cima cobre tudo; embaixo abre o rosto
        row = []
        for c in range(C + 1):
            a = -amax + 2 * amax * c / C  # 0 = nuca
            x = math.sin(a) * rad
            z = -math.cos(a) * rad * 0.9 - 0.02 + 0.05 * dome
            V.append((x, y, z))
            U.append((c / C, v))
            row.append(len(V) - 1)
        rows.append(row)
    F = [(rows[r][c], rows[r][c + 1], rows[r + 1][c + 1], rows[r + 1][c]) for r in range(R) for c in range(C)]
    yl = [top + (bot - top) * r / R for r in range(R)]
    stripe = [int((yl[r] - 0.3) / -0.055) % 2 for r in range(R) for c in range(C)]
    # as ABAS: continuam da borda da frente para baixo, chatas e alargando
    lap_edges = []
    for s in (1, -1):
        c0 = C if s > 0 else 0
        base = rows[R][c0]
        bx, by, bz = V[base]
        n = 9
        lrows = []
        for i in range(n + 1):
            t = i / n
            y = by + 0.03 - t * 0.5
            w = 0.07 + 0.05 * t
            cx = bx * (1 - 0.15 * t)
            cz = bz + 0.07 * math.sin(t * math.pi * 0.6)
            lrows.append([len(V), len(V) + 1])
            V.append((cx - w, y, cz)); U.append((0, t))
            V.append((cx + w, y, cz)); U.append((1, t))
        for i in range(n):
            a0, a1 = lrows[i]
            b0, b1 = lrows[i + 1]
            F.append((a0, a1, b1, b0))
            stripe.append(int(((by - (i + 0.5) / n * 0.48) - 0.3) / -0.055) % 2)
        lap_edges.append([V[lrows[i][0 if s < 0 else 1]] for i in range(n + 1)])
    # o rabo de pano atrás (a Menés juntada na nuca)
    bk = rows[R][C // 2]
    bx, by, bz = V[bk]
    n = 6
    trows = []
    for i in range(n + 1):
        t = i / n
        w = 0.17 * (1 - 0.65 * t)
        y = by - t * 0.3
        z = bz - 0.03 * t
        trows.append([len(V), len(V) + 1])
        V.append((-w, y, z)); U.append((0, t))
        V.append((w, y, z)); U.append((1, t))
    for i in range(n):
        a0, a1 = trows[i]
        b0, b1 = trows[i + 1]
        F.append((a1, a0, b0, b1))
        stripe.append(int(((by - (i + 0.5) / n * 0.3) - 0.3) / -0.055) % 2)
    # a borda da frente (emoldura o rosto) em roxo: segue a borda do capuz e desce pelas abas
    edge = [V[rows[r][C]] for r in range(R + 1)][::-1] + [V[rows[r][0]] for r in range(R + 1)]
    return [tuple(T(*q)) for q in V], F, U, stripe, edge  # a malha vai em coordenadas do Blender (como o rod)


V, F, U, stripe, edge = nemes()
for k, mat in ((0, M['menesA']), (1, M['menesB'])):
    add(head, f'menes{k}', (V, [f for f, st in zip(F, stripe) if st == k], U), mat)
add(head, 'menesEdge', rod([(p[0] * 1.03, p[1], p[2] + 0.01) for p in edge], 0.016, seg=6, caps=False), M['purple'])
add(head, 'menesBand', rod([(math.sin(a) * 0.185, 0.17, -math.cos(a) * 0.17 + 0.03) for a in [math.pi * (0.62 + 0.76 * i / 14) for i in range(15)]], 0.018, seg=6), M['purple'])

# a MANDÍBULA, a fileira de baixo e o CHIFRE DO QUEIXO (a "barba" do faraó)
jaw = joint('J_jaw', (0, -0.1, 0.03), head)
Jw = Sculpt('jaw')
Jw.chain(curve((-0.1, 0.06, -0.06), (0, -0.05, 0.14), (0.1, 0.06, -0.06), 9), [0.02, 0.025, 0.028, 0.03, 0.032, 0.03, 0.028, 0.025, 0.02], 'bone', step=0.5)
Jw.ell((0, -0.04, 0.11), (0.045, 0.035, 0.035), 'bone')
Jw.build(jaw, M['body'], 700, res=0.006, smooth=2)
add(jaw, 'hornC', rod(curve((0, -0.05, 0.12), (0, -0.2, 0.15), (0, -0.34, 0.24), 8), [0.034, 0.032, 0.03, 0.026, 0.021, 0.015, 0.009, 0.002], seg=8), M['bone'])
for k in range(3):
    add(jaw, f'beardR{k}', blob((0, -0.1 - k * 0.07, 0.13 + k * 0.025), (0.034 - k * 0.005, 0.012, 0.034 - k * 0.005), 8, 4), M['purple'])
for i in range(9):
    x = -0.055 + i * 0.0137
    zj = 0.13 - (x / 0.065) ** 2 * 0.045
    add(jaw, f'toothD{i}', spike((x, 0.0, zj), (x * 1.05, 0.05 + 0.01 * (i % 2), zj + 0.006), 0.008, seg=5), M['tooth'])
drip(jaw, 'dripJ', (0.03, -0.04, 0.12), 0.25, 0.02)

# ================================================================ PATAS: grossas; na frente MÃOS grandes, atrás patas de osso
upper, lower = legH * 0.5, legH * 0.5
for name, s, z, front in (('FL', 1, 0.58, True), ('FR', -1, 0.58, True), ('BL', 1, -0.64, False), ('BR', -1, -0.64, False)):
    x = s * (0.24 if front else 0.18)
    leg = joint(f'J_leg{name}', (x, -0.04, z), torso)
    U_ = Sculpt(f'thigh{name}')
    if front:
        U_.chain([(0, 0.1, 0), (0, -0.2, 0.01), (0, -upper + 0.03, 0)], [0.13, 0.1, 0.075], 'flesh', step=0.6)
        U_.ell((0, -0.12, 0.04), (0.09, 0.15, 0.08), 'flesh')
    else:
        U_.chain([(0, 0.1, 0), (0, -0.2, -0.03), (0, -upper + 0.03, 0.02)], [0.15, 0.11, 0.075], 'flesh', step=0.6)
        U_.ell((s * 0.02, -0.1, 0.04), (0.11, 0.2, 0.13), 'flesh')
    U_.ell((0, -upper, -0.03), (0.06, 0.06, 0.06), 'bone')  # joelho / cotovelo de osso
    U_.build(leg, M['body'], 1200, res=0.01)
    knee = joint(f'J_knee{name}', (0, -upper, 0), leg)
    L = Sculpt(f'shin{name}')
    if front:
        L.chain([(0, 0.0, 0), (0, -0.22, 0.01), (0, -lower + 0.07, 0.02)], [0.08, 0.068, 0.058], 'flesh', step=0.6)
        L.chain([(0, -0.05, -0.05), (0, -lower + 0.1, -0.03)], 0.026, 'bone', step=0.6)  # o osso do antebraço
        L.ell((0, -lower + 0.045, 0.08), (0.095, 0.035, 0.11), 'flesh')  # a palma no chão
        for i in range(4):
            a = (i - 1.5) * 0.3
            x0 = math.sin(a) * 0.075
            L.chain([(x0, -lower + 0.04, 0.15), (x0 * 1.35, -lower + 0.034, 0.24), (x0 * 1.5, -lower + 0.02, 0.31)], [0.026, 0.022, 0.017], 'flesh', step=0.5)
        L.chain([(s * 0.085, -lower + 0.045, 0.05), (s * 0.14, -lower + 0.03, 0.13)], [0.026, 0.02], 'flesh', step=0.5)
        L.chain([(s * 0.02, -0.15, 0.06), (s * 0.03, -lower + 0.06, 0.1)], 0.02, 'stain', step=0.6)  # Lodo descendo
    else:
        L.chain([(0, 0.0, 0.02), (0, -0.25, -0.06), (0, -lower + 0.07, -0.02)], [0.07, 0.05, 0.045], 'bone', step=0.6)
        L.chain([(0, -0.02, -0.04), (0, -0.22, -0.08)], [0.06, 0.045], 'flesh', step=0.6)
        L.ell((0, -lower + 0.045, 0.06), (0.075, 0.04, 0.12), 'bone')
        for i in range(3):
            a = (i - 1) * 0.35
            L.chain([(math.sin(a) * 0.05, -lower + 0.035, 0.12), (math.sin(a) * 0.08, -lower + 0.022, 0.21)], [0.024, 0.017], 'bone', step=0.5)
    L.build(knee, M['body'], 1400, res=0.008)
    n = 4 if front else 3
    for i in range(n):
        a = (i - (n - 1) / 2) * (0.3 if front else 0.35)
        bx = math.sin(a) * (0.075 * 1.5 if front else 0.08)
        bz = 0.31 if front else 0.21
        add(knee, f'claw{i}', spike((bx, -lower + 0.022, bz - 0.01), (bx * 1.1, -lower - 0.004, bz + 0.08), 0.013, seg=5), M['tooth'])

# ================================================================ CAUDA: grossa na base, de vértebras, curvando para trás e para cima
tail = joint('J_tail', (0, 0.1, -halfL - 0.02), torso)
Tl = Sculpt('tail')
tp = curve((0, 0, 0), (0, -0.08, -0.6), (0, 0.42, -1.05), 13)
Tl.chain(tp, [0.08 - i * 0.0055 for i in range(13)], 'flesh', step=0.6)
for i, p in enumerate(tp[:-1]):
    Tl.ell((p[0], p[1] + 0.055 - i * 0.003, p[2]), (0.024, 0.032, 0.024), 'bone')
Tl.build(tail, M['body'], 1100, res=0.008)
add(tail, 'tailTip', spike(tp[-2], (0, 0.55, -1.16), 0.024, seg=6), M['bone'])

# ================================================================ ASAS RASGADAS de morcego (grandes; rasgos só na borda e alguns furos)
for s, name in ((1, 'L'), (-1, 'R')):
    wing = joint(f'J_wing{name}', (s * 0.15, 0.26, 0.42), torso)
    elbow = (s * 0.52, 0.66, -0.12)
    wrist = (s * 0.95, 1.12, -0.42)
    add(wing, 'arm', rod([(0, 0, 0), elbow, wrist], [0.042, 0.034, 0.025], seg=7), M['bone'])
    add(wing, 'elbowK', blob(elbow, (0.04, 0.04, 0.04), 7, 5), M['bone'])
    add(wing, 'thumb', spike(wrist, (s * 1.02, 1.3, -0.3), 0.018, seg=5), M['tooth'])
    tips = [(s * 1.7, 1.02, -0.78), (s * 1.6, 0.38, -1.02), (s * 1.2, -0.04, -1.02), (s * 0.7, -0.1, -0.76)]
    for i, tpt in enumerate(tips):
        mid = tuple(wrist[k] + (tpt[k] - wrist[k]) * 0.5 + (0, -0.05, 0)[k] for k in range(3))
        add(wing, f'finger{i}', rod([wrist, mid, tpt], [0.02, 0.014, 0.005], seg=5), M['bone'])
    root = Vector((0, -0.05, -0.05))
    anchors = [Vector(wrist)] + [Vector(t) for t in tips]  # (sem o painel até o corpo: de lado virava uma lâmina)
    V, F, U = [], [], []
    R = 7
    for pi in range(len(anchors) - 1):
        a0, a1 = anchors[pi], anchors[pi + 1]
        base = len(V)
        hub = Vector(elbow) if pi == 0 else (Vector(wrist) if pi < len(anchors) - 2 else root)
        cols = 6
        for r in range(R + 1):
            t = r / R
            for c in range(cols + 1):
                u = c / cols
                edge_p = a0.lerp(a1, u)
                sag = math.sin(u * math.pi) * 0.2 * t
                p = hub.lerp(edge_p, t * (1 - sag))
                p += Vector((0, -0.03, 0)) * math.sin(u * math.pi) * t
                V.append(tuple(T(p.x, p.y, p.z)))
                U.append((u, t))
        for r in range(R):
            for c in range(cols):
                hole = (r == R - 1 and random.random() < 0.3) or (3 <= r < R - 1 and random.random() < 0.05)
                if hole:
                    continue
                a = base + r * (cols + 1) + c
                F.append((a, a + 1, a + cols + 2, a + cols + 1))
    o = add(wing, 'membrane', (V, F, U), M['wing'])
    o.data.materials[0].use_backface_culling = False

for i in range(3):
    drip(neck, f'dripN{i}', (random.uniform(-0.12, 0.12), random.uniform(0.2, 0.45), 0.24), random.uniform(0.12, 0.22), 0.02)

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
