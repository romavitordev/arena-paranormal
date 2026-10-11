"""
MANANCIAL — public/models/manancial.glb   (invocação do FERREIRO; não aparece na seleção)
Wiki "Manancial" (O Segredo na Floresta): os filhos do Ferreiro, criados só para alimentar o Santo e sustentar Santo
Berço; presos nas salas brancas da Caverna do Labirinto Infinito até a morte, muitas vezes enlouquecendo, marcados
com o SÍMBOLO ESPIRAL. Aqui: magros e pálidos, roupa branca simples de cela (camisa com o Símbolo Espiral no peito,
calça branca), descalços, cabelo escuro comprido e embaraçado, olheiras fundas.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'manancial.glb'
random.seed(7)
b = Builder(width=0.9, bulk=0.84, height=1.0)  # magro, de cela
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_manancial', '#d8d0c6', 0.85)  # pálido de nunca ver o sol
white = material('cloth_manancial', '#e8e4dc', 0.9)
M = {
    'skin': skin,
    'face': material('face_manancial', '#ffffff', 0.8),
    'torso': material('gown_manancial', '#ffffff', 0.9),  # camisa branca com o Símbolo Espiral (textura)
    'arm': skin,
    'hand': skin,
    'legs': material('pants_manancial', '#ffffff', 0.9),
    'feet': skin,
}
hairm = material('hair_manancial', '#2a2220', 0.7)

hc = b.body(M, [(-0.12, 0.158), (0.0, 0.16), (0.18, 0.15), (0.38, 0.19), (0.5, 0.2), (0.6, 0.112), (0.66, 0.07)],
            arm_r=(0.062, 0.05, 0.042), leg_r=(0.08, 0.064, 0.05), head_r=(0.134, 0.146, 0.16), neck_r=0.054, feet='bare')

# mangas curtas da camisa branca, largas e gastas
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.02)), sh.lerp(e, 0.45), 0.078, 0.074, n=3), 12), white, region='arm' + side)
# a barra da camisa solta por cima da calça
b.add('hem', tube([(0, 0, hz + 0.02 * H, 0.172 * H, 0.122 * H), (0, 0, hz - 0.06 * H, 0.18 * H, 0.13 * H)], 20, cap_start=False, cap_end=False), white, region='torso', subdiv=0)

# cabelo escuro, comprido e EMBARAÇADO (anos na cela)
c = Vector((hc.x, hc.y + 0.02 * H, hc.z + 0.06 * H))
r = Vector((0.148 * H, 0.158 * H, 0.112 * H))
b.add('hair_cap', ellipsoid(tuple(c), tuple(r), 20, 12), hairm, region='head', subdiv=0)
locks = []
for i in range(26):
    a = (i / 26) * math.pi * 1.5 - math.pi * 0.75 + math.pi  # dos lados e atrás (a testa fica livre)
    top = Vector((c.x + math.sin(a) * r.x * 0.95, c.y - math.cos(a) * r.y * 0.95, c.z - 0.01 * H))
    ln = random.uniform(0.16, 0.3) * H
    out = Vector((math.sin(a), -math.cos(a), 0)) * random.uniform(0.01, 0.04) * H
    pts = [top, top + out + Vector((0, 0, -ln * 0.5)), top + out * 1.6 + Vector((random.uniform(-0.02, 0.02) * H, 0, -ln))]
    locks.append(tube([(p.x, p.y, p.z, w, w) for p, w in zip(pts, (0.024 * H, 0.018 * H, 0.004 * H))], 5))
# franja caída na testa
for i in range(5):
    x = (i - 2) * 0.03 * H
    top = Vector((hc.x + x, hc.y - 0.12 * H, hc.z + 0.1 * H))
    pts = [top, top + Vector((0, -0.03 * H, -0.06 * H)), top + Vector((x * 0.2, -0.035 * H, -0.12 * H))]
    locks.append(tube([(p.x, p.y, p.z, w, w) for p, w in zip(pts, (0.018 * H, 0.012 * H, 0.003 * H))], 5))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)

b.export(OUT)
