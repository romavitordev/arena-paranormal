"""
MACHADO DO MUTILADOR NOTURNO (arma do Aguiar; usa o carregador de peças rígidas do jogo) — a partir da arte oficial
"Machado Mutilador Noturno" (Natal Macabro, wiki): a LÂMINA VERMELHA curva com o bico de cima puxado para cima, o FIO
de aço gasto, o olho de ferro com o contrapeso atrás, o CABO de madeira levemente curvo com a empunhadura de couro e a
CORDA amarrada na ponta (ele arremessa o machado e puxa a vítima). Sangue escorrendo da lâmina.

Orientação (a mesma do machado antigo feito em código, models/weapons.js → mutilatorAxe): a empunhadura na origem, o cabo
descendo em -Y, a cabeça em y ≈ -0,5 com o FIO virado para -Z (a frente do golpe) e o contrapeso em +Z.
  node tools/blender/build.mjs aguiar_axe   → public/npcs/aguiar_axe.glb (carregado como arma: models/weapons.js)
"""
import sys
import os
import math
import random

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, TAU
from npc_lib import T, rod, blob, spike, joint, add, parts, finish

random.seed(13)
reset()
M = {
    'wood': material('axe_wood', '#5e3a20', 0.75),
    'grip': material('axe_grip', '#2a1a10', 0.8),
    'blade': material('axe_blade_red', '#a01818', 0.45, metal=0.4),
    'edge': material('axe_edge_steel', '#c8c4c0', 0.25, metal=0.9),
    'iron': material('axe_iron', '#2e2a2a', 0.4, metal=0.7),
    'blood': material('axe_blood', '#5a0008', 0.15),
    'rope': material('axe_rope', '#8a6a44', 0.9),
}
J = joint('J_axe', (0, 0, 0))

# o CABO: levemente curvo (a barriga para trás) e mais grosso embaixo, com a ponta arredondada
handle = []
for i in range(14):
    t = i / 13
    y = 0.14 - t * 0.74
    z = 0.012 * math.sin(t * math.pi)
    handle.append((0, y, z))
add(J, 'handle', rod(handle, [0.024 + 0.006 * (i / 13) for i in range(14)], seg=10), M['wood'])
add(J, 'knob', blob((0, 0.145, 0), (0.028, 0.016, 0.028), 10, 6), M['wood'])
# a empunhadura de couro enrolada
wrap = [(0.0262 * math.cos(t * 7 * TAU), 0.12 - t * 0.17, 0.0262 * math.sin(t * 7 * TAU)) for t in [k / 70 for k in range(71)]]
add(J, 'grip', rod(wrap, 0.006, seg=5, caps=False), M['grip'])

# a CABEÇA: o olho de ferro em volta do cabo e o contrapeso atrás (+Z)
hy = -0.5
add(J, 'eye', blob((0, hy, 0.0), (0.034, 0.075, 0.042), 10, 8), M['iron'])
add(J, 'poll', blob((0, hy, 0.055), (0.03, 0.045, 0.03), 8, 6), M['iron'])


# a LÂMINA vermelha: perfil curvo (bico de cima puxado para cima, a barba de baixo descendo), extrudada fina e afinando
# para o fio; o fio de aço é uma faixa curva na borda da frente (-Z)
def blade_profile(n=24):
    """contorno no plano (y, z): da junta de cima, pela borda de cima, o FIO curvo e a borda de baixo de volta"""
    pts = []
    top = [(hy + 0.05, -0.03), (hy + 0.07, -0.09), (hy + 0.11, -0.16), (hy + 0.15, -0.205)]  # a borda de cima sobe ao bico
    fio = []
    for i in range(n + 1):  # o fio: arco do bico de cima até a barba de baixo
        a = i / n
        y = hy + 0.15 - a * 0.3
        z = -0.205 - 0.05 * math.sin(a * math.pi) - 0.01 * a
        fio.append((y, z))
    bot = [(hy - 0.15, -0.215), (hy - 0.1, -0.16), (hy - 0.06, -0.09), (hy - 0.045, -0.03)]  # a barba volta à junta
    return top + fio[1:] + bot


prof = blade_profile()
n = len(prof)
V, F, U = [], [], []
for x, thick in ((0.012, 1), (-0.012, 1)):
    for (y, z) in prof:
        # afina em direção ao fio (mais longe do olho = mais fino)
        k = max(0.25, 1 - (-z - 0.03) / 0.22 * 0.7)
        V.append(tuple(T(x * k, y, z)))
        U.append((0.5 + z, y - hy + 0.5))
for i in range(n - 1):
    F.append((i, i + 1, i + 1 + n, i + n))
F.append((n - 1, 0, n, 2 * n - 1))
c0, c1 = len(V), len(V) + 1
V.append(tuple(T(0.012, hy, -0.12)))
V.append(tuple(T(-0.012, hy, -0.12)))
U += [(0.5, 0.5), (0.5, 0.5)]
for i in range(n):
    j = (i + 1) % n
    F.append((c0, j, i))
    F.append((c1, n + i, n + j))
add(J, 'blade', (V, F, U), M['blade'])
# o FIO de aço gasto (acompanha a borda curva, um pouco para fora)
fio = [(0, y, z - 0.008) for (y, z) in prof[4:4 + 25]]
add(J, 'edge', rod(fio, 0.0055, seg=6, caps=False), M['edge'])
# o sangue escorrendo da lâmina (gotas e fios dos dois lados)
for k in range(5):
    y0 = hy + random.uniform(-0.1, 0.1)
    z0 = random.uniform(-0.16, -0.08)
    for s in (1, -1):
        add(J, f'blood{k}{s}', rod([(s * 0.009, y0, z0), (s * 0.01, y0 - 0.04, z0 + 0.004), (s * 0.009, y0 - 0.075, z0)], [0.006, 0.004, 0.0015], seg=5), M['blood'])

# a CORDA amarrada na ponta do cabo (algumas voltas e a ponta solta)
tie = [(0.03 * math.cos(t * 3 * TAU), -0.58 + t * 0.03, 0.03 * math.sin(t * 3 * TAU)) for t in [k / 30 for k in range(31)]]
add(J, 'ropeTie', rod(tie, 0.006, seg=5, caps=False), M['rope'])
add(J, 'ropeEnd', rod([(0.03, -0.58, 0), (0.05, -0.64, 0.02), (0.04, -0.72, 0.05), (0.02, -0.8, 0.04)], 0.006, seg=5), M['rope'])

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'aguiar_axe.blend'), check_existing=False)
export_glb(out)
