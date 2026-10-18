"""
TACO DE BASEBALL COM ARAME FARPADO do Xande (arma; usa o carregador de peças rígidas do jogo) — a partir da arte oficial
de Sinais do Outro Lado: madeira marrom-escura gasta, o cabo enrolado em FITA branca suja, o ARAME FARPADO dando voltas
pela parte grossa com as farpas (nós de duas pontas), alguns PREGOS cravados e a CORRENTE presa no pomo (a que vai
enrolada no braço dele).

Orientação (a mesma do taco antigo feito em código, models/weapons.js → barbedBat): o eixo no Y do jogo, o pomo em cima
(+0,18) e a ponta grossa embaixo (-0,82). Coordenadas do jogo (npc_lib.T converte para o Blender).
  node tools/blender/build.mjs xande_bat   → public/npcs/xande_bat.glb (carregado como arma: models/weapons.js)
"""
import sys
import os
import math
import random

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, TAU
from npc_lib import T, rod, blob, spike, joint, add, parts, finish

random.seed(27)
reset()
M = {
    'wood': material('bat_wood', '#6a3e20', 0.75),
    'wood2': material('bat_wood_dark', '#4a2a14', 0.8),
    'tape': material('bat_tape', '#d8d2c2', 0.85),
    'wire': material('barbed_wire', '#a8a8b0', 0.3, metal=0.85),
    'nail': material('bat_nail', '#7a7a80', 0.35, metal=0.8),
}
J = joint('J_bat', (0, 0, 0))

# o perfil do taco (raio por altura): pomo, cabo fino, alarga até a parte grossa e fecha arredondado na ponta
PROF = [(0.18, 0.0), (0.178, 0.026), (0.165, 0.034), (0.15, 0.022), (0.1, 0.021), (0.0, 0.023), (-0.15, 0.028), (-0.3, 0.037),
        (-0.45, 0.046), (-0.6, 0.051), (-0.72, 0.052), (-0.79, 0.048), (-0.815, 0.036), (-0.825, 0.018), (-0.828, 0.0)]


def lathe(prof, seg=20, dent=0.0):
    V, F, U = [], [], []
    for i, (y, r) in enumerate(prof):
        for j in range(seg):
            a = j / seg * TAU
            rr = r * (1 + dent * math.sin(a * 3 + y * 40) * (y < -0.25))  # amassados na parte que bate
            V.append(tuple(T(math.cos(a) * rr, y, math.sin(a) * rr)))
            U.append((j / seg, i / (len(prof) - 1)))
    for i in range(len(prof) - 1):
        for j in range(seg):
            a = i * seg + j
            b = i * seg + (j + 1) % seg
            F.append((a, b, b + seg, a + seg))
    return V, F, U


# interpola o perfil para ficar liso
dense = []
for (y0, r0), (y1, r1) in zip(PROF, PROF[1:]):
    for k in range(4):
        t = k / 4
        dense.append((y0 + (y1 - y0) * t, r0 + (r1 - r0) * t))
dense.append(PROF[-1])
add(J, 'wood', lathe(dense, 24, dent=0.03), M['wood'])
# veios escuros da madeira (faixas finas ao longo)
for k in range(5):
    a = k / 5 * TAU + 0.3
    pts = [(math.cos(a) * (r + 0.0006), y, math.sin(a) * (r + 0.0006)) for y, r in dense if -0.8 < y < 0.1]
    add(J, f'grain{k}', rod(pts, 0.0018, seg=4, caps=False), M['wood2'])

# a FITA branca enrolada no cabo (espiral levemente torta)
tape = []
for i in range(200):
    t = i / 199
    y = 0.15 - t * 0.27
    r = 0.0235 + 0.001 * math.sin(i * 0.7)
    a = t * 13 * TAU
    tape.append((math.cos(a) * r, y - 0.004 * math.sin(a), math.sin(a) * r))
add(J, 'tape', rod(tape, 0.0068, seg=6, caps=False), M['tape'])
add(J, 'tapeEnd', rod([(0.024, -0.12, 0.0), (0.03, -0.15, 0.004), (0.028, -0.17, 0.01)], [0.004, 0.0035, 0.002], seg=4), M['tape'])  # a ponta solta

# o ARAME FARPADO: duas voltas largas e bagunçadas pela parte grossa, com as farpas
wire = []
N = 200
for i in range(N):
    t = i / (N - 1)
    y = -0.28 - t * 0.5
    r = next(rr for yy, rr in dense if yy <= y) + 0.004
    a = t * 6.5 * TAU + 0.3 * math.sin(t * 17)
    wire.append((math.cos(a) * r, y + 0.006 * math.sin(t * 40), math.sin(a) * r))
add(J, 'wire', rod(wire, 0.0034, seg=5, caps=False), M['wire'])
for i in range(8, N - 4, 9):  # a farpa: um nó com duas pontinhas
    x, y, z = wire[i]
    n = (x, 0, z)
    ln = math.hypot(x, z) or 1
    nx, nz = x / ln, z / ln
    for s in (1, -1):
        add(J, f'barb{i}{s}', spike((x, y, z), (x + nx * 0.024 + s * nz * 0.012, y + s * 0.012, z + nz * 0.024 - s * nx * 0.012), 0.0028, seg=3), M['wire'])
    add(J, f'knot{i}', blob((x, y, z), (0.0065, 0.0065, 0.0065), 5, 4), M['wire'])

# PREGOS cravados na ponta
for k in range(6):
    a = k / 6 * TAU + random.uniform(-0.3, 0.3)
    y = random.uniform(-0.75, -0.5)
    r = next(rr for yy, rr in dense if yy <= y)
    p0 = (math.cos(a) * r * 0.6, y, math.sin(a) * r * 0.6)
    p1 = (math.cos(a) * (r + 0.045), y + random.uniform(-0.01, 0.01), math.sin(a) * (r + 0.045))
    add(J, f'nail{k}', spike(p0, p1, 0.0042, seg=5), M['nail'])
    add(J, f'nailHead{k}', blob(p0, (0.005, 0.002, 0.005), 6, 3), M['nail'])

# a CORRENTE presa no pomo (três elos pendurados; o resto vai no braço, no modelo do Xande)
for k in range(3):
    y = 0.19 + k * 0.03
    ring = [(0.012 * math.cos(a) if k % 2 == 0 else 0, y + 0.018 * math.sin(a), 0 if k % 2 == 0 else 0.012 * math.cos(a)) for a in [i / 10 * TAU for i in range(11)]]
    add(J, f'link{k}', rod(ring, 0.003, seg=4, caps=False), M['wire'])

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'xande_bat.blend'), check_existing=False)
export_glb(out)
