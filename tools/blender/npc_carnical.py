"""
O CARNIÇAL PRETO DA MORTE (invocação do Deus da Morte) — wiki "Carniçal Preto da Morte" (arte do livro de regras e
miniatura de O Segredo na Floresta). Modelo v2, refeito do zero sobre as duas referências.

Humanoide de ~2,1 m, MAGRO e MUSCULOSO: uma figura anatômica de LODO PRETO-ACINZENTADO com a musculatura toda
ESTRIADA. Ombros largos com um BRILHO VERMELHO por baixo (também nos flancos), cintura fina, pescoço longo de
tendões, TENDÕES PÁLIDOS soltos pelos braços e pela cintura. A cabeça é uma CAVEIRA bege rachada TOMADA PELO LODO: o
Lodo sai de trás da cabeça, escorre por cima do crânio e desce pelas costas; o topo rompido mostra o CÉREBRO
VERMELHO e o SÍMBOLO ESPIRAL brilha vermelho na testa. Mãos grandes com garras curvas.

TÉCNICA (para não parecer "formas coladas"): cada parte é UMA forma orgânica contínua — vários metaballs que se
fundem (músculos, ossos, Lodo; metaballs negativos cavam órbitas e o topo do crânio), suavizados, com as ESTRIAS
esculpidas por deslocamento ao longo das fibras e decimados para o orçamento. As cores (Lodo, crista das fibras,
osso, podre) vão por VÉRTICE (COLOR_0), então a transição osso → Lodo é gradual, sem costura.

Peças rígidas em juntas (J_*) com o MESMO esqueleto dos Zumbis de Sangue (body/chest/neck/jaw/sh/el/hand/hip/knee),
animadas em código (src/combat/beasts.js → Carnical, a pose do BloodZombie). Modelado em pé, braços e pernas retos
para baixo, olhando para +z. Coordenadas no espaço do jogo (x = esquerda, y = cima, z = frente).

  node tools/blender/build.mjs carnical      → public/npcs/carnical.glb (+ tools/blender/fonte/carnical.blend)
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

random.seed(7)
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


M = {
    'lodo': vcol_material('lodo_carnical'),  # o corpo (Lodo + estrias), cor por vértice
    'head': vcol_material('skull_carnical'),  # a caveira tomada pelo Lodo, cor por vértice
    'tendon': material('tendon_carnical', '#cdc5a4', 0.6),  # os tendões pálidos soltos
    'claw': material('claw_carnical', '#0c0a0e', 0.35),
    'glow': material('glow_carnical', '#ff2a1a', 0.3, emission='#ff2a1a', strength=3.0),  # o Símbolo Espiral
    'brain': material('glow_brain_carnical', '#9a1c18', 0.5, emission='#5a0e0c', strength=1.0),  # o cérebro exposto
    'ember': material('glow_ombro_carnical', '#6a1210', 0.5, emission='#5a0e0c', strength=1.0),  # o brilho sob os ombros
}

C = {k: Vector(hex_rgb(v)) for k, v in {
    'lodo': '#1c1a1f', 'crest': '#4c4855', 'skull': '#cbb68f', 'rot': '#7d5f40', 'hole': '#060508',
}.items()}

# medidas (metros) — batem com as juntas que o jogo espera
hipY = 1.04  # cintura (J_chest)
shX, shY, shZ = 0.25, 0.61, 0.04  # ombros (relativo ao J_chest)
upL, foreL = 0.34, 0.33
thighL, shinL, hipX = 0.50, 0.54, 0.11
K = 0.575  # metaball (rigidez 2, limiar 0.6): a superfície isolada fica em 0.575 × raio


def g2b(p):
    return T(*p)


def b2g(v):
    return Vector((v.x, v.z, -v.y))


def ridge(x, sharp=3):
    """crista de fibra: 1 no topo, 0 no sulco"""
    return (0.5 + 0.5 * math.cos(x)) ** sharp


def n3(p, s=1.0):
    return noise.noise(Vector(p) * s)


# ================================================================ escultura por metaballs
class Sculpt:
    """uma forma orgânica: elementos que se fundem; grupos dizem a cor (e negativos cavam)"""

    def __init__(self, name):
        self.name = name
        self.els = []  # (centro, raios(x,y,z jogo), dir ou None, negativo, grupo)

    def ell(self, c, r, group='lodo', dir=None, neg=False):
        if not isinstance(r, (tuple, list)):
            r = (r, r, r)
        self.els.append((Vector(c), tuple(r), Vector(dir).normalized() if dir else None, neg, group))

    def chain(self, pts, radii, group='lodo', step=0.45):
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


def limb_fibers(a, b, n, twist, amp, sharp=3):
    """deslocamento das estrias de um membro: n fibras em volta do eixo a→b, torcendo `twist` rad"""
    a, b = Vector(a), Vector(b)
    ax = (b - a)
    L = ax.length
    ax = ax / L

    def f(p):
        t = max(0.0, min(1.0, (p - a).dot(ax) / L))
        q = p - (a + ax * t * L)
        th = math.atan2(q.x, q.z)
        w = n3(p, 9) * 0.8
        return amp * (ridge(n * th + twist * t + w, sharp) - 0.35)
    return f


def body_color(disp_fn, amp):
    """Lodo escuro nos sulcos, cinza nas cristas das fibras"""
    def f(p, sc):
        k = max(0.0, min(1.0, disp_fn(p) / amp + 0.35)) if disp_fn else 0
        k = k ** 1.5
        return C['lodo'].lerp(C['crest'], k * 0.85)
    return f


# ================================================================ juntas
body = joint('J_body', (0, 0, 0))
chest = joint('J_chest', (0, hipY, 0), body)
neck = joint('J_neck', (0, 0.70, 0.08), chest)
jaw = joint('J_jaw', (0, 0.10, 0.06), neck)

# ================================================================ TRONCO (J_chest = cintura)
S = Sculpt('torso')
# coluna de massa: pelve estreita → cintura fina → tórax largo
S.ell((0, -0.07, 0.0), (0.125, 0.1, 0.085))  # pelve
S.ell((0, 0.08, 0.0), (0.095, 0.1, 0.07))  # cintura fina
S.ell((0, 0.27, 0.0), (0.13, 0.14, 0.085))  # costelas baixas
S.ell((0, 0.46, 0.0), (0.18, 0.15, 0.1))  # caixa torácica
S.ell((0, 0.6, -0.02), (0.2, 0.06, 0.08))  # cintura escapular
for s in (1, -1):
    S.ell((s * 0.085, 0.5, 0.06), (0.085, 0.07, 0.05))  # peitoral
    S.ell((s * 0.145, 0.42, -0.035), (0.06, 0.15, 0.06), dir=(s * 0.35, 1, 0))  # grande dorsal (o V)
    S.ell((s * 0.12, 0.62, -0.035), (0.05, 0.12, 0.05), dir=(s * 1, 0.35, 0))  # trapézio subindo ao pescoço
    S.ell((s * 0.12, 0.2, 0.03), (0.045, 0.13, 0.05), dir=(s * 0.25, 1, 0.1))  # oblíquo
    S.ell((s * 0.075, -0.09, -0.04), (0.065, 0.075, 0.055))  # glúteo
    S.ell((s * 0.11, -0.04, 0.035), (0.045, 0.06, 0.045))  # virilha (encaixe da coxa)
    for k in range(3):  # gomos do abdômen
        S.ell((s * 0.04, 0.33 - k * 0.09, 0.06), (0.036, 0.04, 0.035))
    for k in range(3):  # serrátil
        S.ell((s * 0.165, 0.42 - k * 0.055, 0.045), (0.022, 0.018, 0.03), dir=(s * 0.4, 1, 0.3))
# o Lodo que desce da nuca pelas costas (as tranças do capuz se entrelaçando no dorso)
for i in range(4):
    x = (i - 1.5) * 0.05
    S.chain(curve((x * 0.4, 0.74, -0.06), (x * 1.6, 0.55, -0.12), (x * 2.4, 0.18, -0.085), 6), [0.03, 0.028, 0.025, 0.022, 0.018, 0.014], step=0.6)


def torso_disp(p):
    x, y, z = p
    ax = abs(x)
    w = n3(p, 8) * 0.7
    amp = 0.0045
    if z > 0.03 and y > 0.4 and ax < 0.19:  # peitorais: leque do esterno ao ombro
        th = math.atan2(y - 0.6, ax + 0.02)
        v = ridge(th * 22 + w)
    elif z > 0.03 and 0.05 < y <= 0.4 and ax < 0.085:  # abdômen: gomos (sulcos horizontais e a linha do meio)
        g = min(abs(y - yk) for yk in (0.375, 0.285, 0.195, 0.105))
        v = 0.9 - math.exp(-(g / 0.012) ** 2) - math.exp(-(ax / 0.01) ** 2) * 0.9
        return amp * 1.3 * (v - 0.35)
    else:  # flancos e costas: fibras diagonais subindo para os ombros
        v = ridge((y * 1.0 + ax * (0.9 if z > -0.02 else -0.6)) * 95 + w)
    return amp * (v - 0.35)


S.build(chest, M['lodo'], 3900, disp=torso_disp, color=body_color(torso_disp, 0.0045))

# o BRILHO VERMELHO por baixo dos ombros e nos flancos: Lodo incandescente que aflora nas dobras
E = Sculpt('ember')
for s in (1, -1):
    E.ell((s * 0.205, 0.565, -0.035), (0.045, 0.045, 0.055))
    E.ell((s * 0.168, 0.36, -0.03), (0.026, 0.09, 0.04), dir=(s * 0.3, 1, 0))
E.build(chest, M['ember'], 500, smooth=2)

# TENDÕES PÁLIDOS soltos na CINTURA (pendurados dos quadris)
for s in (1, -1):
    for k in range(3):
        x0 = s * (0.085 + k * 0.025)
        pts = curve((x0, 0.17 - k * 0.04, 0.075), (s * (0.16 + k * 0.02), -0.04, 0.1), (s * (0.13 + k * 0.03), -0.22 - k * 0.05, 0.085), 7, jitter=0.01)
        add(chest, f'waistT{s}{k}', rod(pts, [0.0065, 0.0055, 0.005, 0.005, 0.0045, 0.004, 0.0025], seg=4), M['tendon'])
# a linha pálida do esterno (no desenho, um tendão claro no meio do peito)
add(chest, 'alba', rod(curve((0, 0.6, 0.1), (0, 0.42, 0.125), (0, 0.13, 0.1), 7), [0.004, 0.006, 0.006, 0.006, 0.005, 0.004, 0.003], seg=4), M['tendon'])

# ================================================================ PESCOÇO E CABEÇA (J_neck)
H = Sculpt('head')
# o pescoço LONGO de tendões (Lodo), torcido
for f in range(5):
    a = f / 5 * TAU
    pts = [(math.sin(a + t * 0.9) * 0.032, -0.1 + t * 0.27, -0.005 + math.cos(a + t * 0.9) * 0.028) for t in (0, 0.25, 0.5, 0.75, 1)]
    H.chain(pts, [0.024, 0.02, 0.019, 0.02, 0.022], step=0.6)
for s in (1, -1):  # esternocleidos
    H.chain(curve((s * 0.03, -0.09, 0.05), (s * 0.05, 0.03, 0.02), (s * 0.055, 0.15, -0.02), 5), [0.018, 0.02, 0.018, 0.016, 0.015], step=0.6)
# o CRÂNIO
H.ell((0, 0.25, 0.03), (0.09, 0.105, 0.11), 'skull')  # calota
H.ell((0, 0.21, 0.085), (0.075, 0.07, 0.06), 'skull')  # testa e órbitas
H.ell((0, 0.155, 0.1), (0.05, 0.04, 0.045), 'skull')  # maxila
for s in (1, -1):
    H.ell((s * 0.063, 0.185, 0.09), (0.025, 0.02, 0.04), 'skull', dir=(0, 0, 1))  # zigomático
    H.ell((s * 0.04, 0.252, 0.12), (0.034, 0.016, 0.02), 'skull')  # arcada da sobrancelha
    H.ell((s * 0.037, 0.218, 0.15), (0.025, 0.024, 0.035), 'hole', neg=True)  # órbita (cava)
H.ell((0, 0.181, 0.155), (0.011, 0.018, 0.025), 'hole', neg=True)  # cavidade nasal
H.ell((0, 0.4, 0.02), (0.066, 0.07, 0.082), 'hole', neg=True)  # o TOPO ROMPIDO
for i in range(11):  # o Lodo transbordando pela borda rachada
    a = i / 11 * TAU
    H.ell((math.sin(a) * 0.075, 0.33 + 0.012 * math.sin(a * 3), 0.025 + math.cos(a) * 0.088), (0.02, 0.016, 0.02))
# o LODO tomando o crânio: a massa atrás da cabeça, escorrendo por cima e pelos lados, descendo pela nuca
H.ell((0, 0.24, -0.045), (0.105, 0.13, 0.09))
H.chain(curve((0, 0.3, -0.09), (0, 0.13, -0.13), (0, -0.08, -0.08), 6), [0.06, 0.065, 0.06, 0.05, 0.04, 0.035])
for s in (1, -1):
    H.chain(curve((s * 0.08, 0.3, 0.0), (s * 0.1, 0.2, 0.03), (s * 0.085, 0.12, 0.05), 5), [0.03, 0.026, 0.022, 0.016, 0.01], step=0.6)  # escorrendo pelas têmporas
    H.chain(curve((s * 0.045, 0.335, 0.075), (s * 0.07, 0.29, 0.11), (s * 0.068, 0.25, 0.118), 5), [0.02, 0.019, 0.016, 0.012, 0.008], step=0.5)  # fios sobre a testa
    H.chain(curve((s * 0.085, 0.27, 0.06), (s * 0.08, 0.2, 0.1), (s * 0.06, 0.16, 0.11), 5), [0.02, 0.018, 0.015, 0.011, 0.007], step=0.5)  # escorrendo pela maçã do rosto
    H.ell((s * 0.037, 0.215, 0.1), (0.02, 0.02, 0.015))  # o Lodo no fundo das órbitas
H.ell((0, 0.18, 0.125), (0.008, 0.012, 0.01))  # e no fundo do nariz


def head_disp(p):
    x, y, z = p
    # rachaduras finas no osso (sulcos), rugas de Lodo nas costas
    c = abs(n3((x * 1.0, y * 0.5, z), 22))
    v = -0.004 * max(0.0, 0.1 - c) / 0.1
    if z < 0.0 or y < 0.1:
        v += 0.003 * (ridge((y * 1.0 + abs(x) * 0.5) * 120 + n3(p, 10)) - 0.35)
    return v


def head_color(p, sc):
    f = sc.field(p)
    sk, lo, ho = f.get('skull', 0), f.get('lodo', 0), f.get('hole', 0)
    if ho > 0.35:  # as órbitas e o nariz: escuros
        return C['hole']
    k = sk / (sk + lo * 3.0 + 1e-6)
    k = max(0.0, min(1.0, (k - 0.4) / 0.25))
    bone = C['skull'].lerp(C['rot'], max(0.0, min(1.0, n3(p, 14) * 1.2 + 0.25)))
    return C['lodo'].lerp(bone, k)


H.build(neck, M['head'], 2900, res=0.008, smooth=5, disp=head_disp, color=head_color)

# o CÉREBRO VERMELHO no topo rompido (dobras esculpidas)
B = Sculpt('brain')
B.ell((0, 0.3, 0.02), (0.064, 0.045, 0.078))
for s in (1, -1):
    B.ell((s * 0.03, 0.318, 0.02), (0.032, 0.032, 0.07))


def brain_disp(p):
    return 0.006 * (abs(n3(p, 38)) * -1 + 0.2)


B.build(neck, M['brain'], 500, res=0.006, smooth=2, disp=brain_disp)

# o SÍMBOLO ESPIRAL cravado na testa, brilhando vermelho
pts = []
for i in range(30):
    t = i / 29
    a = t * TAU * 2.3
    r = 0.003 + t * 0.027
    yy = 0.29 + math.sin(a) * r
    zz = 0.03 + 0.112 * math.sqrt(max(0.0, 1 - ((yy - 0.25) / 0.112) ** 2 - (math.cos(a) * r / 0.09) ** 2)) + 0.004
    pts.append((math.cos(a) * r, yy, zz))
add(neck, 'spiral', rod(pts, 0.0045, seg=4, caps=False), M['glow'])

# a MANDÍBULA (J_jaw)
J = Sculpt('jaw')
J.chain(curve((-0.06, 0.05, -0.02), (0, -0.04, 0.1), (0.06, 0.05, -0.02), 9), [0.013, 0.016, 0.018, 0.02, 0.021, 0.02, 0.018, 0.016, 0.013], 'skull', step=0.5)
J.ell((0, 0.0, 0.065), (0.03, 0.022, 0.025), 'skull')
for s in (1, -1):  # os fios de Lodo que prendem a mandíbula
    J.chain(curve((s * 0.045, 0.02, 0.03), (s * 0.04, -0.04, 0.0), (s * 0.03, -0.09, -0.03), 4), [0.012, 0.01, 0.008, 0.006], step=0.6)
J.build(jaw, M['head'], 500, res=0.005, smooth=2, color=head_color)
for i in range(7):  # os dentes: de baixo (na mandíbula) e de cima (no crânio)
    x = -0.03 + i * 0.01
    zf = 0.078 - abs(x) * 0.6
    add(jaw, f'toothD{i}', spike((x, 0.012, zf), (x, 0.038, zf + 0.003), 0.0055, seg=4), M['tendon'])
    add(neck, f'toothU{i}', spike((x, 0.142, zf + 0.06), (x, 0.118, zf + 0.063), 0.0055, seg=4), M['tendon'])


# ================================================================ BRAÇOS
def arm(s, name):
    sh = joint(f'J_sh{name}', (s * shX, shY, shZ), chest)
    U = Sculpt(f'upper{name}')
    U.ell((s * 0.028, -0.045, 0.0), (0.064, 0.1, 0.068), dir=(s * 0.25, 1, 0))  # deltoide largo
    U.chain([(0, -0.08, 0.0), (0, -0.18, 0.006), (0, -upL + 0.02, 0.0)], [0.04, 0.042, 0.034], step=0.7)
    U.ell((0, -0.19, 0.026), (0.032, 0.08, 0.032))  # bíceps
    U.ell((s * 0.004, -0.16, -0.03), (0.032, 0.09, 0.03))  # tríceps
    fu = limb_fibers((0, 0.04, 0), (0, -upL, 0), 13, 0.9 * s, 0.0045)
    U.build(sh, M['lodo'], 850, disp=fu, color=body_color(fu, 0.0045))
    add(sh, 'armT0', rod(curve((s * 0.06, -0.05, 0.05), (s * 0.075, -0.2, -0.04), (s * 0.04, -0.33, 0.05), 7, jitter=0.008), [0.006, 0.005, 0.005, 0.005, 0.0045, 0.004, 0.003], seg=4), M['tendon'])

    el = joint(f'J_el{name}', (0, -upL, 0), sh)
    F = Sculpt(f'fore{name}')
    F.chain([(0, 0.01, -0.01), (0, -0.09, 0.01), (0, -0.2, 0.006), (0, -foreL + 0.02, 0.0)], [0.036, 0.042, 0.033, 0.025], step=0.7)
    ff = limb_fibers((0, 0.02, 0), (0, -foreL, 0), 12, -0.8 * s, 0.004)
    F.build(el, M['lodo'], 650, disp=ff, color=body_color(ff, 0.004))
    add(el, 'foreT0', rod(curve((s * 0.045, -0.02, 0.03), (s * 0.055, -0.15, 0.055), (s * 0.02, -0.3, 0.035), 7, jitter=0.008), [0.0055, 0.005, 0.005, 0.0045, 0.0045, 0.004, 0.003], seg=4), M['tendon'])
    # um tendão PENDURADO solto do antebraço (o desenho tem fios caindo)
    add(el, 'foreHang', rod(curve((s * 0.045, -0.12, -0.02), (s * 0.09, -0.2, -0.04), (s * 0.075, -0.34, -0.03), 7, jitter=0.01), [0.005, 0.0045, 0.004, 0.004, 0.0035, 0.003, 0.002], seg=4), M['tendon'])

    hand = joint(f'J_hand{name}', (0, -foreL, 0), el)
    Hd = Sculpt(f'hand{name}')
    Hd.chain([(0, 0.03, 0.0), (0, -0.03, 0.006)], [0.03, 0.036])  # punho
    Hd.ell((0, -0.075, 0.014), (0.062, 0.07, 0.026))  # palma larga
    tips = []
    for i in range(4):
        a = (i - 1.5) * 0.32
        x0 = math.sin(a) * 0.058
        base = (x0, -0.12, 0.022)
        mid = (x0 * 1.3, -0.21, 0.042)
        tip = (x0 * 1.45, -0.28, 0.085)
        Hd.chain([base, mid, tip], [0.019, 0.016, 0.013], step=0.5)
        Hd.ell(mid, (0.019, 0.019, 0.019))  # nó do dedo
        tips.append(tip)
    th = [(-s * 0.055, -0.05, 0.03), (-s * 0.095, -0.12, 0.075), (-s * 0.09, -0.175, 0.12)]
    Hd.chain(th, [0.02, 0.016, 0.013], step=0.5)
    fh = limb_fibers((0, 0, 0), (0, -0.3, 0.05), 10, 0.0, 0.0025)
    Hd.build(hand, M['lodo'], 800, res=0.006, smooth=2, disp=fh, color=body_color(fh, 0.0025))
    # GARRAS curvas (gancho para a frente), da ponta de cada dedo
    for i, tip in enumerate(tips + [th[-1]]):
        big = 1.25 if i == 4 else 1.0
        c1 = (tip[0] * 1.05, tip[1] - 0.045 * big, tip[2] + 0.035 * big)
        c2 = (tip[0] * 1.08, tip[1] - 0.07 * big, tip[2] + 0.095 * big)
        add(hand, f'claw{i}', rod([tip, c1, c2], [0.012, 0.008, 0.0015], seg=5), M['claw'])


arm(1, 'L')
arm(-1, 'R')

# ================================================================ PERNAS
for s, name in ((1, 'L'), (-1, 'R')):
    hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
    Th = Sculpt(f'thigh{name}')
    Th.chain([(0, 0.0, 0.0), (0, -0.15, 0.02), (0, -0.32, 0.02), (0, -thighL + 0.02, 0.015)], [0.075, 0.078, 0.065, 0.05])
    Th.ell((s * 0.015, -0.25, 0.045), (0.055, 0.15, 0.042), dir=(s * -0.1, 1, 0))  # quadríceps
    Th.ell((s * 0.04, -0.12, 0.0), (0.04, 0.12, 0.05))  # vasto lateral
    Th.ell((0, -0.24, -0.045), (0.05, 0.14, 0.04))  # posterior
    ft = limb_fibers((0, 0.02, 0), (0, -thighL, 0.02), 15, 1.0 * s, 0.005)
    Th.build(hip, M['lodo'], 950, disp=ft, color=body_color(ft, 0.005))
    add(hip, 'legT', rod(curve((s * 0.06, -0.06, 0.06), (s * 0.09, -0.26, 0.0), (s * 0.05, -0.46, 0.06), 7, jitter=0.008), [0.0055, 0.005, 0.005, 0.0045, 0.0045, 0.004, 0.003], seg=4), M['tendon'])

    knee = joint(f'J_knee{name}', (0, -thighL, 0.02), hip)
    Sh = Sculpt(f'shin{name}')
    Sh.chain([(0, 0.02, 0.0), (0, -0.12, -0.01), (0, -0.3, -0.012), (0, -shinL + 0.08, -0.005)], [0.05, 0.052, 0.04, 0.032])
    Sh.ell((0, 0.0, 0.03), (0.04, 0.045, 0.028))  # patela
    Sh.ell((0, -0.16, -0.04), (0.048, 0.12, 0.042))  # panturrilha
    # o PÉ: tornozelo, peito do pé, calcanhar e três dedos (a sola no chão: y = -0.54 do joelho)
    Sh.ell((0, -shinL + 0.06, 0.0), (0.038, 0.045, 0.042))
    Sh.ell((0, -shinL + 0.032, 0.065), (0.046, 0.03, 0.095))
    Sh.ell((0, -shinL + 0.03, -0.025), (0.032, 0.03, 0.035))
    toes = []
    for i in range(3):
        a = (i - 1) * 0.3
        base = (math.sin(a) * 0.033, -shinL + 0.025, 0.14)
        tip = (math.sin(a) * 0.048, -shinL + 0.016, 0.195)
        Sh.chain([base, tip], [0.016, 0.012], step=0.5)
        toes.append(tip)
    fs = limb_fibers((0, 0.0, 0), (0, -shinL + 0.08, 0), 13, -0.9 * s, 0.0045)
    Sh.build(knee, M['lodo'], 1000, disp=fs, color=body_color(fs, 0.0045))
    for i, tip in enumerate(toes):
        add(knee, f'toeClaw{i}', rod([tip, (tip[0] * 1.1, -shinL + 0.012, 0.225), (tip[0] * 1.15, -shinL + 0.002, 0.25)], [0.01, 0.007, 0.0015], seg=5), M['claw'])

# as peças sem cor por vértice (tendões, garras, dentes, espiral) ganham branco: ao juntar com as esculturas o
# atributo viria zerado (preto) e escureceria a cor do material
for objs in parts.values():
    for o in objs:
        if 'Col' not in o.data.color_attributes:
            ca = o.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
            for d in ca.data:
                d.color = (1, 1, 1, 1)
finish()

# o .blend fonte fica guardado em tools/blender/fonte/ (fora do bundle do site)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'carnical.blend'), check_existing=False)

out = sys.argv[sys.argv.index('--') + 1]
export_glb(out)
