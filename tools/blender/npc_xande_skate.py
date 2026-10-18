"""
SKATE CAÓTICO do Xande (arma/escudo, não é invocação: só usa o mesmo carregador de peças rígidas do jogo) — a partir da
arte oficial "Skate Amaldiçoado do Alexandre" (wiki): shape amarelo com lixa, as GUARDAS DE METAL grossas em volta do
bico e da rabeta e as LÂMINAS curvas nas laterais, rodas VERMELHAS, trucks prateados com ESPINHOS dourados nas pontas dos
eixos, a ALÇA vermelha (é por ela que ele segura o skate como escudo) e, no shape, "OCULTO" numa faixa, o triângulo e o
símbolo redondo; as RUNAS VERDES do Caos brilhando (as do jogo: os Sigilos de Energia por baixo).

Orientação (a mesma do skate antigo feito em código, models/weapons.js → chaosSkate): o comprimento no eixo Y do jogo
(de +0,09 a -0,69, centro -0,3), a espessura em X (a lixa em +X, as rodas em -X), a largura em Z. Em coordenadas do jogo
(npc_lib.T converte para o Blender).
  node tools/blender/build.mjs xande_skate   → public/npcs/xande_skate.glb (carregado como arma: models/weapons.js)
"""
import sys
import os
import math

import bpy
from mathutils import Vector

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, TAU
from npc_lib import T, rod, blob, spike, joint, add, parts, finish
from lib import make_obj

reset()
M = {
    'deck': material('deck_skate', '#e2b524', 0.85),  # a lixa amarela
    'deckside': material('deck_wood', '#8a5a2a', 0.7),  # a borda das lâminas de madeira
    'metal': material('guard_metal', '#9a9ca4', 0.3, metal=0.85),
    'metal2': material('guard_metal_dark', '#5e6068', 0.35, metal=0.8),
    'wheel': material('wheel_red', '#b8302a', 0.5),
    'truck': material('truck_silver', '#c8c8d0', 0.25, metal=0.9),
    'gold': material('spike_gold', '#d8b04a', 0.3, metal=0.85),
    'rail': material('rail_red', '#a82420', 0.45),
    'ink': material('deck_ink', '#141414', 0.6),
    'rune': material('glow_rune', '#5aff6a', 0.3, emission='#5aff6a', strength=2.2),
}
J = joint('J_skate', (0, 0, 0))
L, W, TH = 0.78, 0.22, 0.026
YC = -0.3


def outline(n=56, grow=0.0):
    """o contorno do shape (popsicle): reta no meio, bico e rabeta redondos; em (u ao longo, v na largura)"""
    pts = []
    half = L / 2 + grow
    r = W / 2 + grow
    flat = half - r
    for i in range(n):
        a = i / n * TAU
        x, y = math.cos(a), math.sin(a)
        u = (flat + r) * x if abs(x * (flat + r)) > flat else flat * x / max(abs(x), 1e-6) * min(1, abs(x) * (flat + r) / flat)
        if abs(x) * (flat + r) <= flat:
            u = x * (flat + r)
            v = y * r if abs(y) > 0 else 0
            v = math.copysign(r, y) if abs(x) * (flat + r) < flat else y * r
        # forma de estádio: ponto no estádio na direção (x, y)
        pts.append((x, y))
    # gera o estádio de verdade por parâmetro de comprimento de arco
    out = []
    per = 2 * (2 * flat) + 2 * math.pi * r
    for i in range(n):
        d = i / n * per
        if d < 2 * flat:
            out.append((-flat + d, r))
        elif d < 2 * flat + math.pi * r:
            a = (d - 2 * flat) / r
            out.append((flat + math.sin(a) * r, math.cos(a) * r))
        elif d < 4 * flat + math.pi * r:
            out.append((flat - (d - 2 * flat - math.pi * r), -r))
        else:
            a = (d - 4 * flat - math.pi * r) / r
            out.append((-flat - math.sin(a) * r, -math.cos(a) * r))
    return out


def lift(u):
    """o empeno das pontas (kick): sobe para +X nas pontas"""
    k = max(0.0, abs(u) - (L / 2 - 0.13)) / 0.13
    return 0.035 * k * k


def slab(name, contour, x0, x1, mat, uz=0.0):
    """placa com o contorno dado, de x0 a x1 (na espessura), seguindo o empeno das pontas"""
    n = len(contour)
    V, F, U = [], [], []
    for x in (x0, x1):
        for u, v in contour:
            V.append(tuple(T(x + lift(u), YC + u, v)))
            U.append((0.5 + u / L, 0.5 + v / W))
    for i in range(n):
        a, b = i, (i + 1) % n
        F.append((a, b, b + n, a + n))
    c0, c1 = len(V), len(V) + 1
    V.append(tuple(T(x0, YC, 0)))
    V.append(tuple(T(x1, YC, 0)))
    U += [(0.5, 0.5), (0.5, 0.5)]
    for i in range(n):
        F.append((c0, (i + 1) % n, i))
        F.append((c1, n + i, n + (i + 1) % n))
    return add(J, name, (V, F, U), mat)


# ---------------- o shape: madeira na borda, a lixa amarela por cima
slab('deckWood', outline(64), -TH / 2, TH / 2 - 0.004, M['deckside'])
slab('deckTop', [(u * 0.97, v * 0.93) for u, v in outline(64)], TH / 2 - 0.004, TH / 2 + 0.001, M['deck'])

# ---------------- as GUARDAS DE METAL: crescentes grossos em volta do bico e da rabeta (com rebites)
for s in (1, -1):
    ring_out = outline(80, 0.035)
    ring_in = outline(80, -0.004)
    pts_o = [(u, v) for u, v in ring_out if s * u > L / 2 - 0.16]
    pts_i = [(u, v) for u, v in ring_in if s * u > L / 2 - 0.16]
    pts_o.sort(key=lambda p: math.atan2(p[1], s * (p[0] - s * (L / 2 - 0.11))))
    pts_i.sort(key=lambda p: math.atan2(p[1], s * (p[0] - s * (L / 2 - 0.11))))
    m = min(len(pts_o), len(pts_i))
    V, F, U = [], [], []
    for x in (-TH / 2 - 0.006, TH / 2 + 0.006):
        for (u, v) in pts_o[:m]:
            V.append(tuple(T(x + lift(u), YC + u, v)))
            U.append((0, 0))
        for (u, v) in pts_i[:m]:
            V.append(tuple(T(x + lift(u), YC + u, v)))
            U.append((0, 0))
    o_b, i_b, o_t, i_t = 0, m, 2 * m, 3 * m
    for i in range(m - 1):
        F.append((o_t + i, o_t + i + 1, i_t + i + 1, i_t + i))  # em cima
        F.append((o_b + i, i_b + i, i_b + i + 1, o_b + i + 1))  # embaixo
        F.append((o_b + i, o_b + i + 1, o_t + i + 1, o_t + i))  # borda de fora
        F.append((i_b + i, i_t + i, i_t + i + 1, i_b + i + 1))  # borda de dentro
    F.append((o_b, o_t, i_t, i_b))
    F.append((o_b + m - 1, i_b + m - 1, i_t + m - 1, o_t + m - 1))
    add(J, f'guard{s}', (V, F, U), M['metal'])
    for k in range(5):  # rebites
        a = (k - 2) / 2 * 1.1
        u = s * (L / 2 - 0.11) + s * math.cos(a) * 0.115
        v = math.sin(a) * 0.115
        add(J, f'rivet{s}{k}', blob((TH / 2 + 0.008 + lift(u), YC + u, v), (0.006, 0.009, 0.009), 6, 4), M['metal2'])

# ---------------- as LÂMINAS curvas nas laterais (o meio do shape), abrindo para fora
for side in (1, -1):
    V, F, U = [], [], []
    N = 14
    for i in range(N + 1):
        t = i / N
        u = -0.17 + 0.34 * t
        flare = 0.03 * math.sin(math.pi * t) + 0.012
        for x in (-TH / 2 - 0.004, TH / 2 + 0.004):
            V.append(tuple(T(x, YC + u, side * (W / 2 - 0.006))))
            V.append(tuple(T(x, YC + u, side * (W / 2 + flare))))
            U += [(t, 0), (t, 1)]
    for i in range(N):
        a = i * 4
        b = a + 4
        F += [(a, b, b + 1, a + 1), (a + 2, a + 3, b + 3, b + 2), (a + 1, b + 1, b + 3, a + 3), (a, a + 2, b + 2, b)]
    F += [(0, 1, 3, 2), (N * 4, N * 4 + 2, N * 4 + 3, N * 4 + 1)]
    add(J, f'blade{side}', (V, F, U), M['metal'])
    for k in range(4):  # os dentes da serra na borda da lâmina
        u = -0.13 + k * 0.087
        add(J, f'tooth{side}{k}', spike((0, YC + u, side * (W / 2 + 0.03)), (0, YC + u - 0.02, side * (W / 2 + 0.06)), 0.01, seg=4), M['metal2'])

# ---------------- TRUCKS, RODAS vermelhas e os ESPINHOS dourados nas pontas dos eixos (embaixo, em -X)
for u in (L / 2 - 0.13, -(L / 2 - 0.13)):
    y = YC + u
    add(J, f'base{u:.2f}', blob((-TH / 2 - 0.012, y, 0), (0.012, 0.035, 0.04), 8, 6), M['truck'])
    add(J, f'hanger{u:.2f}', rod([(-TH / 2 - 0.03, y, -0.1), (-TH / 2 - 0.034, y, 0.0), (-TH / 2 - 0.03, y, 0.1)], 0.011, seg=8), M['truck'])
    for s in (1, -1):
        z = s * 0.1
        add(J, f'wheel{u:.2f}{s}', rod([(-TH / 2 - 0.032, y, z - s * 0.02), (-TH / 2 - 0.032, y, z + s * 0.02)], 0.033, seg=14), M['wheel'])
        add(J, f'spike{u:.2f}{s}', spike((-TH / 2 - 0.032, y, z + s * 0.02), (-TH / 2 - 0.032, y, z + s * 0.08), 0.014, seg=6), M['gold'])

# ---------------- a ALÇA vermelha (o punho do escudo), por cima, perto da ponta de cima
for v in (-0.05, 0.05):
    add(J, f'railPost{v}', rod([(TH / 2, -0.02, v), (TH / 2 + 0.035, -0.02, v)], 0.008, seg=6), M['rail'])
    add(J, f'railPost2{v}', rod([(TH / 2, -0.17, v), (TH / 2 + 0.035, -0.17, v)], 0.008, seg=6), M['rail'])
for v in (-0.05, 0.05):
    add(J, f'rail{v}', rod([(TH / 2 + 0.035, -0.02, v), (TH / 2 + 0.035, -0.17, v)], 0.009, seg=6), M['rail'])

# ---------------- a arte do shape: "OCULTO" numa faixa, o triângulo e o símbolo redondo (em relevo, preto)
def text_mesh(txt, size, pos_game, rot_deg, name, mat, depth=0.0015):
    bpy.ops.object.text_add()
    t = bpy.context.object
    t.data.body = txt
    t.data.size = size
    t.data.extrude = depth
    t.data.align_x = 'CENTER'
    t.data.align_y = 'CENTER'
    bpy.ops.object.convert(target='MESH')
    o = bpy.context.object
    o.name = name
    # o texto nasce deitado no plano XY do Blender; vira para a face +X do skate, ao longo do comprimento
    o.rotation_euler = (math.radians(90), 0, math.radians(90))
    o.rotation_euler.rotate_axis('Z', 0)
    o.location = T(*pos_game)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    o.data.materials.clear()
    o.data.materials.append(mat)
    o.parent = J
    if not o.data.uv_layers:
        o.data.uv_layers.new(name='UVMap')
    parts.setdefault(J.name, []).append(o)
    return o


x_top = TH / 2 + 0.0045
text_mesh('OCULTO', 0.05, (x_top, YC + 0.05, 0.0), 0, 'oculto', M['ink'])
# a faixa (fita) em volta do texto
for dy in (0.032, -0.032):  # a faixa: uma linha em cima e outra embaixo do texto
    add(J, f'banner{dy}', rod([(x_top - 0.001, YC + 0.05 + dy, -0.085), (x_top - 0.001, YC + 0.05 + dy, 0.085)], 0.003, seg=4), M['ink'])
# o triângulo e o símbolo redondo (anel com o círculo no meio e os raios)
tri = [(x_top, YC - 0.07 + 0.035 * math.cos(a), 0.035 * math.sin(a)) for a in [math.pi / 2 + i * TAU / 3 for i in range(4)]]
add(J, 'triangle', rod(tri, 0.003, seg=4), M['ink'])
cx = YC - 0.16
add(J, 'sigil', rod([(x_top, cx + 0.05 * math.cos(a), 0.05 * math.sin(a)) for a in [i / 24 * TAU for i in range(25)]], 0.0035, seg=4), M['ink'])
add(J, 'sigil2', rod([(x_top, cx + 0.022 * math.cos(a), 0.022 * math.sin(a)) for a in [i / 16 * TAU for i in range(17)]], 0.003, seg=4), M['ink'])
for k in range(10):
    a = k / 10 * TAU
    add(J, f'ray{k}', rod([(x_top, cx + 0.058 * math.cos(a), 0.058 * math.sin(a)), (x_top, cx + 0.085 * math.cos(a), 0.085 * math.sin(a))], 0.0025, seg=4), M['ink'])

# ---------------- as RUNAS VERDES do Caos: por baixo (o brilho do jogo) e algumas na lixa, perto das pontas
import random
random.seed(5)
glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'
try:
    rn = []
    for k in range(10):
        u = -0.3 + k * 0.066
        t = text_mesh(random.choice('ZXWVKN'), 0.045, (-TH / 2 - 0.003, YC + u, random.uniform(-0.06, 0.06)), 0, f'rune{k}', M['rune'])
        # por baixo: espelha para a face -X
        for v in t.data.vertices:
            v.co.x = -abs(v.co.x) - TH / 2 - 0.002
    for k in range(6):
        s = 1 if k < 3 else -1
        u = s * (L / 2 - 0.08 - (k % 3) * 0.035)
        text_mesh(random.choice('ZXWVKN'), 0.03, (x_top + lift(u) + 0.001, YC + u, (k % 3 - 1) * 0.05), 0, f'runeTop{k}', M['rune'])
except Exception as e:  # sem fonte: segue sem as runas de texto
    print('runas: ', e)

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'xande_skate.blend'), check_existing=False)
export_glb(out)
