"""
LABIRINTO — public/models/labirinto.glb
Referência: artes de Hexatombe (wiki). 1,95 m, magro, pele branca pálida, cabeça RASPADA coberta de cicatrizes
geométricas em forma de labirinto (escarificação — textura skin_labirinto / face_labirinto), olhos cinzentos.
Túnica verde-escura gasta, RASGADA em tiras, amarrada na cintura por cordas; por baixo, retalhos de tecido
desenhado formando uma saia; descalço, pés sujos de sangue.
prop_helmetOn: o elmo de ferro arranhado com o SORRISO enorme (textura helmet_labirinto) e papéis com
labirintos colados caindo até o peito — aparece com o Capacete do ??? e no especial.
A Antena (lança com parabólica) é adicionada em código.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'labirinto.glb'
b = Builder(width=0.92, bulk=0.86, height=1.085)  # 1,95 m (o mais alto)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_labirinto', '#ffffff', 0.8),  # pele pálida com o labirinto escarificado
    'face': material('face_labirinto', '#ffffff', 0.8),
    'torso': material('skin_labirinto', '#ffffff', 0.8),
    'arm': material('skin_labirinto', '#ffffff', 0.8),
    'legs': material('skin_labirinto', '#ffffff', 0.8),
    'feet': material('feet_labirinto', '#8a5a4a', 0.9),  # sola suja de sangue
}
tunic = material('tunic_green', '#3c4a2e', 0.95)
tunic_d = material('tunic_green_dark', '#2a3420', 0.95)
rope = material('rope', '#6a5236', 0.9)
patch = material('patch_skirt', '#ffffff', 0.9)  # retalhos desenhados (textura)
helm = material('helmet_labirinto', '#ffffff', 0.45, metal=0.5)
paper = material('paper_maze', '#ffffff', 0.9)

hc = b.body(M, [(-0.11, 0.15), (0.0, 0.15), (0.17, 0.142), (0.36, 0.178), (0.48, 0.19), (0.58, 0.105), (0.65, 0.062)],
            arm_r=(0.052, 0.042, 0.036), leg_r=(0.07, 0.056, 0.045), head_r=(0.13, 0.142, 0.16), feet='bare', neck_r=0.052)

random.seed(4)
# ---------------- saia de retalhos por baixo (até a canela)
sk_r = [(hz + 0.02 * H, 0.16 * H, 0.12 * H), (hz - 0.2 * H, 0.185 * H, 0.14 * H), (hz - 0.46 * H, 0.2 * H, 0.15 * H)]
b.add('patch_skirt', open_tube(sk_r, gap=0.02, seg=22), patch, region='skirt')

# ---------------- túnica longa, gasta, aberta em V no peito, com barra rasgada em tiras
tu = [(hz - 0.36 * H, 0.215 * H, 0.16 * H), (hz - 0.12 * H, 0.2 * H, 0.148 * H), (hz + 0.06 * H, 0.18 * H, 0.135 * H),
      (hz + 0.2 * H, 0.174 * H, 0.13 * H), (hz + 0.36 * H, 0.2 * H, 0.142 * H), (hz + 0.48 * H, 0.208 * H, 0.146 * H),
      (hz + 0.57 * H, 0.14 * H, 0.104 * H), (hz + 0.62 * H, 0.1 * H, 0.084 * H)]
b.add('tunic', open_tube(tu, gap=0.045, seg=28), tunic, region='skirt')
# tiras rasgadas penduradas na barra (comprimentos diferentes)
strips = []
for i in range(26):
    a = 0.05 * TAU + (i / 25) * 0.9 * TAU
    x, y = math.sin(a) * 0.218 * H, -math.cos(a) * 0.162 * H
    ln = (0.06 + random.random() * 0.14) * H
    w = 0.03 + random.random() * 0.02
    z0 = hz - 0.34 * H
    strips.append(tube([(x, y, z0, w, 0.006), (x * 1.02, y * 1.02, z0 - ln * 0.6, w * 0.8, 0.005), (x * 1.03, y * 1.03, z0 - ln, 0.006, 0.004)], 4))
b.add('tunic_strips', merge(*strips), tunic_d, region='skirt', subdiv=0)
# mangas largas até o meio do antebraço, rasgadas
for side in ('L', 'R'):
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    b.add('sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), e.lerp(h, 0.45), 0.068, 0.085, n=5), 14), tunic, region='arm' + side)
    tails = []
    end = e.lerp(h, 0.45)
    for k in range(6):
        a = k / 6 * TAU
        p = end + Vector((math.cos(a) * 0.08, math.sin(a) * 0.08, 0))
        tails.append(cone(tuple(p), tuple(p + Vector((0, 0, -0.06 - random.random() * 0.06))), 0.02, 3))
    b.add('sleevetails' + side, merge(*tails), tunic_d, region='e' + side, subdiv=0)
# cordas na cintura (duas voltas) e uma corda cruzando o peito até a bolsa das costas
b.add('rope_belt', merge(tube([(0, 0, hz + 0.05 * H, 0.19 * H, 0.143 * H), (0, 0, hz + 0.075 * H, 0.19 * H, 0.143 * H)], 20),
                         tube([(0, 0, hz + 0.1 * H, 0.186 * H, 0.14 * H), (0, 0, hz + 0.122 * H, 0.186 * H, 0.14 * H)], 20)), rope, region='torso', subdiv=0)
b.add('rope_knot', merge(ellipsoid((0.06 * H, -0.145 * H, hz + 0.08 * H), (0.03, 0.02, 0.03), 8, 6),
                         tube([(0.06 * H, -0.15 * H, hz + 0.07 * H, 0.01, 0.01), (0.07 * H, -0.155 * H, hz - 0.12 * H, 0.009, 0.009)], 5)), rope, region='torso', subdiv=0)
b.add('rope_chest', tube([(0.12 * H, -0.1 * H, 1.58 * H, 0.012, 0.012), (0.0, -0.15 * H, hz + 0.4 * H, 0.012, 0.012), (-0.17 * H, -0.08 * H, hz + 0.15 * H, 0.012, 0.012)], 6), rope, region='torso', subdiv=0)
# cesto/bolsa de palha nas costas (onde a Antena fica encostada)
b.add('back_basket', ellipsoid((-0.06 * H, 0.15 * H, hz + 0.38 * H), (0.09 * H, 0.06 * H, 0.12 * H), 10, 8), rope, region='torso', subdiv=0)
# laço do decote (cordão cruzado)
lace = [cone((-0.03, -0.13 * H, hz + 0.5 * H - k * 0.03 * H), (0.03, -0.13 * H, hz + 0.47 * H - k * 0.03 * H), 0.005, 3) for k in range(3)]
b.add('neck_lace', merge(*lace), rope, region='torso', subdiv=0)

# ---------------- ELMO do sorriso (prop): esfera de ferro que cobre a cabeça + papéis colados
helmet = ellipsoid((hc.x, hc.y, hc.z + 0.005), (0.162 * H, 0.176 * H, 0.176 * H), 24, 16, theta_max=math.pi * 0.86)
papers = []
for i in range(9):
    a = math.pi * 0.35 + (i / 8) * math.pi * 1.3
    x, y = math.sin(a) * 0.15 * H, -math.cos(a) * 0.15 * H
    ln = (0.12 + random.random() * 0.12) * H
    papers.append(xform(box((x, y, hc.z - 0.16 * H - ln / 2), (0.05, 0.004, ln)), lambda p, a=a: Vector((p.x, p.y, p.z))))
b.add('prop_helmetOn', merge(helmet), helm, region='head', subdiv=0)
b.add('prop_helmetOn_papers', merge(*papers), paper, region='head', subdiv=0)

b.export(OUT)
