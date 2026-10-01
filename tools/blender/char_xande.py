"""
XANDE (Alexandre) — public/models/xande.glb
Referência: arte de Sinais do Outro Lado (wiki). 1,75 m, pele clara, cabelo LONGO ondulado loiro-escuro, olhos
azuis. Boné amarelo virado para trás com triângulos; balaclava/bandana preta abaixada no pescoço; camiseta amarela
de mangas cinzas com 3 triângulos pretos e "oculto" (textura shirt_xande) sobre blusa preta de mangas arregaçadas;
broche dourado dos Cinco no peito; bandoleiras e bolsas marrons (frascos, walkman); bermuda preta com joelheiras;
correntes no braço direito e no tornozelo esquerdo; luvas sem dedos; tênis amarelos de cano alto.
O taco com arame farpado e o Skate Caótico são adicionados em código.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'xande.glb'
b = Builder(width=0.96, bulk=0.95, height=0.99)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_xande', '#e6bea2', 0.8),
    'face': material('face_xande', '#ffffff', 0.8),
    'torso': material('shirt_xande', '#ffffff', 0.85),  # camiseta amarela com os triângulos
    'arm': material('skin_xande', '#e6bea2', 0.8),
    'hand': material('glove_xande', '#1a1a1c', 0.7),
    'legs': material('skin_xande', '#e6bea2', 0.8),  # pernas à mostra abaixo da bermuda
    'feet': material('sneaker_yellow', '#e8bc22', 0.6),
}
yellow = material('cap_yellow', '#e8bc22', 0.6)
grey = material('sleeve_grey', '#7a7a74', 0.85)
black = material('black_cloth', '#16161a', 0.85)
leather = material('leather_brown', '#5a3a22', 0.75)
silver = material('chain_silver', '#b8b8c0', 0.25, metal=0.9)
gold = material('gold_brooch', '#c9a24a', 0.35, metal=0.8)
hairm = material('hair_xande', '#8a6a3a', 0.55)
white = material('sole_white', '#e8e4dc', 0.7)
vial = material('vial_blue', '#4ab0e0', 0.2)

hc = b.body(M, [(-0.12, 0.16), (0.0, 0.16), (0.17, 0.152), (0.36, 0.196), (0.48, 0.206), (0.58, 0.112), (0.65, 0.066)],
            arm_r=(0.058, 0.047, 0.04), leg_r=(0.074, 0.058, 0.047), head_r=(0.136, 0.146, 0.158))

# ---------------- roupa: mangas cinzas da camiseta + blusa preta arregaçada por baixo
for side in ('L', 'R'):
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    b.add('tsleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), sh.lerp(e, 0.55), 0.072, 0.07, n=3), 14), grey, region='arm' + side)
    b.add('blk' + side, tube(limb_rings(sh.lerp(e, 0.5), e.lerp(h, 0.25), 0.064, 0.058, n=3), 12), black, region='arm' + side)
    b.add('roll' + side, tube(limb_rings(e.lerp(h, 0.2), e.lerp(h, 0.3), 0.064, 0.064, n=1), 12), black, region='arm' + side, subdiv=0)
# bermuda preta com faixa amarela e joelheiras redondas
b.add('shorts', tube([(0, 0, hz + 0.06 * H, 0.172 * H, 0.128 * H), (0, 0, hz - 0.08 * H, 0.182 * H, 0.134 * H)], 20, cap_start=False, cap_end=False), black, region='torso')
for side in ('L', 'R'):
    l, k = sk['l' + side], sk['k' + side]
    b.add('shortleg' + side, tube(limb_rings(l + Vector((0, 0, 0.02)), l.lerp(k, 0.82), 0.098, 0.086, n=3), 14), black, region='leg' + side)
    b.add('shorttrim' + side, tube(limb_rings(l.lerp(k, 0.78), l.lerp(k, 0.84), 0.09, 0.09, n=1), 14), yellow, region='leg' + side, subdiv=0)
    b.add('kneepad' + side, ellipsoid((k.x, k.y - 0.065, k.z), (0.06, 0.035, 0.06), 10, 8), grey, region='k' + side, subdiv=0)
    # tênis de cano alto com sola branca
    f = sk['foot' + side]
    b.add('hightop' + side, tube(limb_rings(k.lerp(f, 0.78), f + Vector((0, 0, 0.04)), 0.056, 0.058, n=2), 12), M['feet'], region='k' + side)
    b.add('sole' + side, box((f.x, f.y - 0.05, f.z - 0.02), (0.1 * H, 0.25 * H, 0.03)), white, region='k' + side, subdiv=0)
# bandoleiras cruzadas, cinto com bolsas e frascos, broche dourado
for s in (1, -1):
    b.add(f'band{s}', tube([(s * 0.1 * H, -0.13 * H, 1.58 * H, 0.02, 0.007), (-s * 0.02 * H, -0.15 * H, hz + 0.32 * H, 0.02, 0.007), (-s * 0.17 * H, -0.08 * H, hz + 0.08 * H, 0.02, 0.007)], 6), leather, region='torso', subdiv=0)
b.add('belt', tube([(0, 0, hz + 0.08 * H, 0.176 * H, 0.131 * H), (0, 0, hz + 0.12 * H, 0.176 * H, 0.131 * H)], 20), leather, region='torso', subdiv=0)
for k, a in enumerate((-0.7, 0.2, 0.9, 2.5)):
    p = Vector((math.sin(a) * 0.182 * H, -math.cos(a) * 0.136 * H, hz + 0.07 * H))
    b.add(f'pouch{k}', box(tuple(p), (0.06, 0.04, 0.07), bevel=0.006), leather, region='torso', subdiv=0)
for k in range(3):
    b.add(f'vial{k}', tube([(-0.02 + k * 0.025, -0.138 * H, hz + 0.13 * H, 0.009, 0.009), (-0.02 + k * 0.025, -0.138 * H, hz + 0.17 * H, 0.009, 0.009)], 6), vial, region='torso', subdiv=0)
b.add('brooch', ellipsoid((0, -0.155 * H, hz + 0.5 * H), (0.028, 0.01, 0.028), 10, 6), gold, region='torso', subdiv=0)
# bandana/balaclava preta abaixada no pescoço
b.add('bandana', tube([(0, -0.005, 1.56 * H, 0.085 * H, 0.08 * H), (0, -0.01, 1.62 * H, 0.09 * H, 0.085 * H), (0, 0, 1.66 * H, 0.075 * H, 0.07 * H)], 16), black, region='torso')
# correntes: braço direito e tornozelo esquerdo
chains = []
eR, hR = sk['eR'], sk['handR']
for k in range(7):
    p = eR.lerp(hR, 0.15 + k * 0.1)
    chains.append(tube([(p.x, p.y, p.z, 0.055, 0.055), (p.x, p.y, p.z + 0.012, 0.055, 0.055)], 8))
kL, fL = sk['kL'], sk['footL']
for k in range(5):
    p = kL.lerp(fL, 0.3 + k * 0.1)
    chains.append(tube([(p.x, p.y, p.z, 0.058, 0.058), (p.x, p.y, p.z + 0.012, 0.058, 0.058)], 8))
b.add('chains', merge(*chains), silver, region=None, subdiv=0)

# ---------------- cabelo longo ondulado (até os ombros) e boné amarelo virado para trás
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.012), (0.146 * H, 0.156 * H, 0.168 * H), front=0.24, side=0.5, back=0.64), hairm, region='head')
random.seed(21)


def lock(root, d, ln, r):
    pts = []
    for k in range(6):
        t = k / 5
        p = root + d * (ln * t) + Vector((math.sin(t * 8) * 0.012, math.cos(t * 8) * 0.008, -ln * 0.4 * t * t))
        pts.append((p.x, p.y, p.z, r * (1 - 0.7 * t) + 0.004, r * 0.7 * (1 - 0.7 * t) + 0.004))
    return tube(pts, 7)


C = Vector((hc.x, hc.y + 0.01, hc.z))
locks = []
for i in range(22):
    a = 0.12 * TAU + (i / 21) * 0.76 * TAU  # dos lados e de trás (rosto livre)
    root = C + Vector((math.sin(a) * 0.14 * H, -math.cos(a) * 0.15 * H, 0.04))
    d = Vector((math.sin(a) * 0.25, -math.cos(a) * 0.25, -1))
    d.normalize()
    locks.append(lock(root, d, 0.24 + random.random() * 0.06, 0.04))
# mechas da frente caindo dos lados do rosto
for s in (1, -1):
    locks.append(lock(C + Vector((s * 0.11 * H, -0.11 * H, 0.06)), Vector((s * 0.15, -0.2, -1)).normalized(), 0.26, 0.035))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
cap_top = ellipsoid((hc.x, hc.y + 0.005, hc.z + 0.05 * H), (0.152 * H, 0.162 * H, 0.13 * H), 20, 10, theta_max=math.pi * 0.5)
b.add('cap', cap_top, yellow, region='head', subdiv=0)
b.add('cap_band', tube([(0, 0.004, hc.z + 0.04 * H, 0.154 * H, 0.164 * H), (0, 0.004, hc.z + 0.065 * H, 0.153 * H, 0.163 * H)], 22), black, region='head', subdiv=0)
# aba virada para TRÁS
brim = ellipsoid((0, 0.21 * H, hc.z + 0.05 * H), (0.1 * H, 0.09 * H, 0.012), 14, 6)
b.add('cap_brim', brim, yellow, region='head', subdiv=0)
# triângulos brancos na copa do boné
tri = [cone((s * 0.06 * H, -0.12 * H, hc.z + 0.12 * H), (s * 0.06 * H, -0.135 * H, hc.z + 0.16 * H), 0.025, 3) for s in (-1, 0, 1)]
b.add('cap_tri', merge(*tri), white, region='head', subdiv=0)

b.export(OUT)
