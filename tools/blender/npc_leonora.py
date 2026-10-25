"""
A LEONORA — a marreta do Lírio (arma; usa o carregador de peças rígidas do jogo), a partir da arte oficial "Marreta de
Lírio em Sinais do Outro Lado" (wiki): a CABEÇA é um tambor de madeira (barrilzinho) com o veio radial nas faces e a
PATA DOURADA em relevo na face; duas CINTAS DE FERRO escuras nas bordas, cheias de CRAVOS; um tufo de PELO branco na
junção da cabeça com o cabo; o cabo de madeira com a FAIXA PRETA enrolada perto da cabeça e outra perto do fim, e a ponta
de madeira à mostra.

Orientação (a mesma da Leonora antiga feita em código, models/weapons.js → leonora): o cabo no Y do jogo, a ponta do
cabo em cima (+0,20) e a cabeça embaixo (centro em −0,88), o eixo do tambor em Z. Coordenadas do jogo (npc_lib.T).
  node tools/blender/build.mjs leonora   → public/npcs/leonora.glb (carregado como arma: models/weapons.js)
"""
import sys
import os
import math
import random

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, TAU
from npc_lib import T, rod, blob, spike, joint, add, parts, finish

random.seed(1985)
reset()
M = {
    'wood': material('leonora_wood', '#7a4a28', 0.75),
    'wood2': material('leonora_wood_dark', '#4a2a14', 0.8),
    'head': material('leonora_head', '#8a5630', 0.75),
    'iron': material('leonora_iron', '#2e2c32', 0.45, metal=0.7),
    'spike': material('leonora_spike', '#5c5a62', 0.35, metal=0.8),
    'gold': material('leonora_paw', '#d6a32c', 0.3, metal=0.8),
    'wrap': material('leonora_wrap', '#18161a', 0.85),
    'fur': material('leonora_fur', '#e2ddd2', 0.95),
}
J = joint('J_leonora', (0, 0, 0))

HC = -0.88   # centro da cabeça (Y do jogo)
R = 0.17     # raio do tambor
L = 0.46     # comprimento do tambor (eixo Z)


def lathe_y(prof, seg=20):
    """sólido de revolução em volta do eixo Y (o cabo)"""
    V, F, U = [], [], []
    for i, (y, r) in enumerate(prof):
        for j in range(seg):
            a = j / seg * TAU
            V.append(tuple(T(math.cos(a) * r, y, math.sin(a) * r)))
            U.append((j / seg, i / (len(prof) - 1)))
    for i in range(len(prof) - 1):
        for j in range(seg):
            a = i * seg + j
            b = i * seg + (j + 1) % seg
            F.append((a, b, b + seg, a + seg))
    return V, F, U


def drum(seg=36, rings=10):
    """o tambor da cabeça: eixo Z, um pouco BOJUDO no meio (barril) e com as tampas"""
    V, F, U = [], [], []
    for i in range(rings + 1):
        t = i / rings
        z = -L / 2 + L * t
        r = R * (1 + 0.04 * math.sin(t * math.pi))
        for j in range(seg):
            a = j / seg * TAU
            V.append(tuple(T(math.cos(a) * r, HC + math.sin(a) * r, z)))
            U.append((j / seg, t))
    for i in range(rings):
        for j in range(seg):
            a = i * seg + j
            b = i * seg + (j + 1) % seg
            F.append((a, b, b + seg, a + seg))
    for z, ring0, flip in ((-L / 2, 0, True), (L / 2, rings * seg, False)):
        c = len(V)
        V.append(tuple(T(0, HC, z)))
        U.append((0.5, 0.5))
        for j in range(seg):
            a0, a1 = ring0 + j, ring0 + (j + 1) % seg
            F.append((c, a1, a0) if flip else (c, a0, a1))
    return V, F, U


# ---------------- o CABO: da ponta de madeira (em cima) até dentro da cabeça
PROF = [(0.205, 0.0), (0.2, 0.024), (0.19, 0.03), (0.1, 0.032), (-0.2, 0.034), (-0.5, 0.036), (-0.7, 0.037), (-0.74, 0.038)]
add(J, 'handle', lathe_y(PROF, 18), M['wood'])
for k in range(4):  # veios do cabo
    a = k / 4 * TAU + 0.4
    pts = [(math.cos(a) * 0.0335, y, math.sin(a) * 0.0335) for y in [0.18 - i * 0.05 for i in range(19)]]
    add(J, f'grain{k}', rod(pts, 0.0016, seg=4, caps=False), M['wood2'])


def wrap(y0, y1, turns, r, name):
    pts = []
    n = int(turns * 28)
    for i in range(n + 1):
        t = i / n
        y = y0 + (y1 - y0) * t
        a = t * turns * TAU
        pts.append((math.cos(a) * r, y - 0.004 * math.sin(a), math.sin(a) * r))
    add(J, name, rod(pts, 0.0135, seg=6, caps=False, flat=0.6), M['wrap'])


wrap(-0.3, -0.63, 17, 0.038, 'wrapTop')   # a faixa preta perto da cabeça
wrap(0.0, 0.15, 8, 0.035, 'wrapLow')     # a faixa perto do fim do cabo (a ponta fica à mostra)

# ---------------- o TUFO DE PELO branco na junção com a cabeça
for i in range(34):
    a = i / 34 * TAU + random.uniform(-0.1, 0.1)
    base = (math.cos(a) * 0.035, HC + R - 0.005, math.sin(a) * 0.035)
    ln = random.uniform(0.05, 0.085)
    tip = (math.cos(a) * (0.035 + ln), HC + R + random.uniform(0.0, 0.05), math.sin(a) * (0.035 + ln))
    add(J, f'fur{i}', spike(base, tip, 0.012, seg=4), M['fur'])

# ---------------- a CABEÇA (tambor) com as tábuas
add(J, 'drum', drum(), M['head'])
for k in range(16):
    a = k / 16 * TAU
    r = R * 1.005
    pts = [(math.cos(a) * r * (1 + 0.04 * math.sin(t * math.pi)), HC + math.sin(a) * r * (1 + 0.04 * math.sin(t * math.pi)), -L / 2 + L * t) for t in [i / 8 for i in range(9)]]
    add(J, f'plank{k}', rod(pts, 0.0022, seg=4, caps=False), M['wood2'])
# o veio RADIAL e os anéis nas duas faces
for z in (L / 2 + 0.002, -L / 2 - 0.002):
    for k in range(12):
        a = k / 12 * TAU + 0.13
        add(J, f'ray{z > 0}{k}', rod([(math.cos(a) * 0.03, HC + math.sin(a) * 0.03, z), (math.cos(a) * R * 0.95, HC + math.sin(a) * R * 0.95, z)], 0.0018, seg=4, caps=False), M['wood2'])
    for rr in (0.06, 0.115):
        add(J, f'ring{z > 0}{rr}', rod([(math.cos(a) * rr, HC + math.sin(a) * rr, z) for a in [i / 28 * TAU for i in range(29)]], 0.0022, seg=4, caps=False), M['wood2'])

# ---------------- a PATA DOURADA em relevo (nas duas faces): a almofada e os quatro dedos
for z, s in ((L / 2 + 0.008, 1), (-L / 2 - 0.008, -1)):
    add(J, f'pawPad{s}', blob((0, HC - 0.03, z), (0.052, 0.042, 0.012), 14, 6), M['gold'])
    add(J, f'pawPadLow{s}', blob((0, HC - 0.06, z), (0.036, 0.022, 0.011), 12, 5), M['gold'])
    for dx, dy, rr in ((-0.062, 0.03, 0.019), (-0.024, 0.065, 0.021), (0.024, 0.065, 0.021), (0.062, 0.03, 0.019)):
        add(J, f'toe{s}{dx}', blob((dx, HC + dy, z), (rr, rr * 1.25, 0.011), 10, 5), M['gold'])

# ---------------- as CINTAS DE FERRO nas bordas, cheias de CRAVOS
for bi, z in enumerate((L / 2 - 0.045, -L / 2 + 0.045)):
    band = [(math.cos(a) * (R * 1.06), HC + math.sin(a) * (R * 1.06), z) for a in [i / 40 * TAU for i in range(41)]]
    add(J, f'band{bi}', rod(band, 0.022, seg=6, caps=False, flat=0.5), M['iron'])
    for k in range(18):
        a = k / 18 * TAU + (0.17 if bi else 0)
        b0 = (math.cos(a) * R * 1.1, HC + math.sin(a) * R * 1.1, z)
        tip = (math.cos(a) * (R + 0.075), HC + math.sin(a) * (R + 0.075), z)
        add(J, f'stud{bi}{k}', spike(b0, tip, 0.012, seg=5), M['spike'])

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'leonora.blend'), check_existing=False)
export_glb(out)
