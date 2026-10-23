"""
EREŠKIGAL (as lâminas do Gal; usa o carregador de peças rígidas do jogo) — a partir da arte oficial "Miniatura Gal em
combate em Desconjuração" (wiki "Gal"): a lâmina longa em MEIA-LUA de aço escuro, com as duas pontas curvando para a
frente como um arco, a empunhadura dourada no meio com a GUARDA em anel (a argola onde a corrente prende) e a escrita
cuneiforme dourada gravada ao longo da lâmina.

Orientação (a mesma da lâmina antiga feita em código, models/weapons.js → sickleBlade): a empunhadura na origem, a parte
longa descendo em -Y, a curta subindo em +Y, as pontas e o fio virados para -Z (a frente do golpe).
  node tools/blender/build.mjs gal_blade   → public/npcs/gal_blade.glb (carregado como arma: models/weapons.js)
"""
import sys
import os
import math

import bpy

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, TAU
from npc_lib import T, rod, blob, ring, joint, add, parts, finish

reset()
M = {
    'blade': material('gal_blade_steel', '#4a4640', 0.35, metal=0.75),
    'edge': material('gal_blade_edge', '#a8a49a', 0.2, metal=0.9),
    'gold': material('gal_blade_gold', '#c9a24a', 0.3, metal=0.85),
    'grip': material('gal_blade_grip', '#1a1612', 0.7),
}
J = joint('J_blade', (0, 0, 0))


def half(y0, length, sign, n=26):
    """meia lâmina (y0 → ponta) no plano (y, z): o eixo curva para -Z (frente); a largura afina até a ponta.
    Devolve o contorno (do lado de trás pela ponta e de volta pelo fio) e o eixo"""
    axis, back, edge = [], [], []
    for i in range(n + 1):
        t = i / n
        y = y0 + sign * length * t
        z = -0.24 * length * t ** 2.1  # a curva de arco
        w = 0.06 * (1 - t) ** 0.8 + 0.004
        dy = sign * length
        dz = -0.24 * length * 2.1 * max(t, 1e-3) ** 1.1
        nl = math.hypot(dy, dz)
        ny, nz = -dz / nl * sign, dy / nl * sign  # a normal no plano (para trás, +Z)
        axis.append((y, z))
        back.append((y + ny * w * 0.4, z + abs(nz) * w * 0.4))
        edge.append((y - ny * w * 0.6, z - abs(nz) * w * 0.6))
    return back + edge[::-1][1:], axis, edge


def slab(outline, thick):
    """extruda o contorno (y, z) com espessura em x, afinando para o fio"""
    n = len(outline)
    V, F, U = [], [], []
    for x in (thick, -thick):
        for (y, z) in outline:
            V.append(tuple(T(x, y, z)))
            U.append((0.5 + z, 0.5 + y))
    for i in range(n):
        j = (i + 1) % n
        F.append((i, j, j + n, i + n))
    c0 = len(V)
    cy = sum(p[0] for p in outline) / n
    cz = sum(p[1] for p in outline) / n
    V.append(tuple(T(thick, cy, cz)))
    V.append(tuple(T(-thick, cy, cz)))
    U += [(0.5, 0.5), (0.5, 0.5)]
    for i in range(n):
        j = (i + 1) % n
        F.append((c0, i, j))
        F.append((c0 + 1, n + j, n + i))
    return V, F, U


for name, y0, ln, sg in (('lower', -0.07, 0.68, -1), ('upper', 0.07, 0.48, 1)):
    outline, axis, edge = half(y0, ln, sg)
    add(J, 'blade_' + name, slab(outline, 0.008), M['blade'])
    add(J, 'edge_' + name, rod([(0, y, z - 0.002) for (y, z) in edge[:-1]], [0.0045 * (1 - k / len(edge)) + 0.001 for k in range(len(edge) - 1)], seg=5, caps=False), M['edge'])
    # a escrita cuneiforme dourada gravada dos dois lados (cunhas curtas ao longo do eixo)
    for k in range(3, len(axis) - 6, 2):
        y, z = axis[k]
        for s in (1, -1):
            add(J, f'glyph_{name}{k}{s}', rod([(s * 0.0095, y - 0.008, z + 0.006), (s * 0.0095, y + 0.008, z + 0.002)], [0.0035, 0.001], seg=4), M['gold'])
    # o colar dourado onde a lâmina encontra a empunhadura
    add(J, 'collar_' + name, blob((0, y0 + sg * 0.012, -0.004), (0.02, 0.016, 0.034), 10, 6), M['gold'])

# a EMPUNHADURA: o cabo enrolado e a GUARDA em anel (fica do lado do fio, a mão passa por dentro)
add(J, 'grip', rod([(0, 0.07, 0), (0, -0.07, 0)], 0.017, seg=10), M['grip'])
wrap = [(0.019 * math.cos(t * 6 * TAU), 0.065 - t * 0.13, 0.019 * math.sin(t * 6 * TAU)) for t in [k / 60 for k in range(61)]]
add(J, 'gripWrap', rod(wrap, 0.0035, seg=4, caps=False), M['gold'])
guard = [(0, 0.06 * math.cos(a), -0.05 - 0.05 * math.sin(a)) for a in [math.pi * (-0.5 + k / 16 * 2) for k in range(17)]]
add(J, 'guard', rod(guard, 0.009, seg=8, caps=False), M['gold'])
add(J, 'pommelRing', ring((0, -0.085, 0.03), (1, 0, 0), 0.022, 0.006), M['gold'])  # a argola da corrente

for objs in parts.values():
    for o in objs:
        if not o.data.uv_layers:
            o.data.uv_layers.new(name='UVMap')
finish()
out = sys.argv[sys.argv.index('--') + 1]
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'gal_blade.blend'), check_existing=False)
export_glb(out)
