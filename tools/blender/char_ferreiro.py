"""
FERREIRO (o Luzidio de Santo Berço) — public/models/ferreiro.glb
Referência: arte dos Luzidios no Livro de Regras e miniaturas (wiki). 2,20 m, o maior humano da série. Pele
acinzentada, olhos todo pretos, orelhas pontudas, faixas pretas no rosto (dos olhos às bochechas e do nariz subindo
pela cabeça). Cabelo branco penteado para trás e barba branca longa. Peitoral e braceletes de metal, pano vermelho na
cintura com correntes, calça marrom, caneleiras de metal segmentadas, faixas nas pernas, chinelas. Queimaduras nos
braços. A Espada Consumidora é adicionada em código.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ferreiro.glb'
b = Builder(width=1.12, bulk=1.32, height=1.22)  # 2,20 m, enorme
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_luzidio', '#8e9096', 0.85),
    'face': material('face_luzidio', '#ffffff', 0.85),
    'torso': material('skin_luzidio', '#8e9096', 0.85),
    'arm': material('arms_luzidio', '#ffffff', 0.85),  # queimaduras
    'legs': material('pants_brown', '#5a3e28', 0.9),
    'feet': material('skin_luzidio', '#8e9096', 0.85),
}
steel = material('plate_steel', '#55585f', 0.3, metal=0.9)
steel_dk = material('plate_dark', '#4a4c52', 0.4, metal=0.85)
red = material('cloth_red', '#7a1418', 0.85)
leather = material('leather_sandal', '#5a3a22', 0.8)
wrap = material('leg_wrap', '#6e6656', 0.9)
chainm = material('chain_iron', '#5a5a60', 0.4, metal=0.9)
white = material('hair_white', '#e4e2dc', 0.6)

hc = b.body(M, [(-0.12, 0.18), (0.0, 0.18), (0.17, 0.18), (0.36, 0.236), (0.48, 0.26), (0.58, 0.14), (0.65, 0.084)],
            arm_r=(0.078, 0.066, 0.055), leg_r=(0.09, 0.07, 0.056), head_r=(0.134, 0.144, 0.156), neck_r=0.08, feet='bare')

# ---------------- peitoral de metal (frente e costas) com placas nos ombros
b.add('chestplate', tube([(0, 0.0, hz + 0.3 * H, 0.21 * H, 0.15 * H), (0, 0.0, hz + 0.46 * H, 0.255 * H, 0.17 * H), (0, 0.0, hz + 0.58 * H, 0.2 * H, 0.15 * H)], 22, cap_start=False, cap_end=False), steel, region='torso', subdiv=0)
b.add('plate_rivets', merge(*[ellipsoid((x * H, -0.172 * H, hz + z * H), (0.012, 0.006, 0.012), 6, 4) for x, z in ((-0.12, 0.52), (0.12, 0.52), (-0.16, 0.4), (0.16, 0.4), (0, 0.33))]), steel_dk, region='torso', subdiv=0)
for side in ('L', 'R'):
    s = sk['s' + side]
    pads = [ellipsoid((s.x * 1.02, s.y, s.z + 0.04 - k * 0.05), (0.11 - k * 0.008, 0.11, 0.036), 12, 6, theta_max=math.pi * 0.55) for k in range(3)]
    b.add('pauldron' + side, merge(*pads), steel_dk, region='s' + side, subdiv=0)
    # braceletes de metal
    e, h = sk['e' + side], sk['hand' + side]
    b.add('bracer' + side, tube(limb_rings(e.lerp(h, 0.35), e.lerp(h, 0.85), 0.07, 0.066, n=2), 14), steel, region='arm' + side, subdiv=0)
# pano vermelho na cintura com correntes por cima
b.add('waistcloth', tube([(0, 0, hz + 0.12 * H, 0.196 * H, 0.148 * H), (0, 0, hz - 0.05 * H, 0.21 * H, 0.158 * H), (0, 0, hz - 0.2 * H, 0.2 * H, 0.15 * H)], 22, cap_start=False, cap_end=False), red, region='skirt')
chains = []
for k in range(3):
    z = hz + (0.06 - k * 0.07) * H
    for i in range(18):
        a = i / 18 * TAU + k * 0.3
        chains.append(ellipsoid((math.sin(a) * 0.206 * H, -math.cos(a) * 0.156 * H, z - math.sin(a * 2) * 0.02), (0.016, 0.016, 0.01), 5, 3))
b.add('waist_chains', merge(*chains), chainm, region='torso', subdiv=0)
# caneleiras segmentadas, faixas e chinelas
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    for i in range(5):
        p0 = k.lerp(f, 0.15 + i * 0.15)
        b.add(f'greave{side}{i}', tube([(p0.x, p0.y, p0.z, 0.07, 0.07), (p0.x, p0.y, p0.z - 0.05, 0.068, 0.068)], 12), steel_dk, region='k' + side, subdiv=0)
    b.add('kneecap' + side, ellipsoid((k.x, k.y - 0.07, k.z), (0.07, 0.04, 0.075), 10, 8), steel, region='k' + side, subdiv=0)
    b.add('sandal' + side, box((f.x, f.y - 0.05, f.z - 0.022), (0.12 * H, 0.27 * H, 0.025)), leather, region='k' + side, subdiv=0)

# ---------------- orelhas pontudas, cabelo branco penteado para trás e barba branca longa
for s in (1, -1):
    b.add(f'ear_tip{s}', cone((s * 0.13 * H, 0.0, hc.z + 0.0), (s * 0.19 * H, 0.03, hc.z + 0.08 * H), 0.022, 6), M['skin'], region='head', subdiv=0)
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.01, hc.z + 0.02), (0.142 * H, 0.152 * H, 0.164 * H), front=0.22, side=0.4, back=0.62), white, region='head')
back = []
for i in range(9):
    x = (i - 4) * 0.026 * H
    root = Vector((x, hc.y - 0.12 * H, hc.z + 0.12 * H))
    pts = []
    for k in range(6):
        t = k / 5
        p = root + Vector((x * 0.4 * t, 0.26 * H * t, 0.05 * H * math.sin(t * 2.4) - 0.12 * H * t * t))
        pts.append((p.x, p.y, p.z, 0.03 * (1 - 0.5 * t) + 0.004, 0.022 * (1 - 0.5 * t) + 0.004))
    back.append(tube(pts, 7))
b.add('hair_back', merge(*back), white, region='head', subdiv=0)
beard_shell = ellipsoid((hc.x, hc.y - 0.002, hc.z), (0.14 * H, 0.15 * H, 0.162 * H), 24, 16, phi=(0.17, 0.83))


def jaw(p):
    zmax = hc.z - 0.1 * H + smoothstep(0.03, 0.12, abs(p.x)) * 0.09 * H
    return Vector((p.x, p.y, min(p.z, zmax)))


b.add('beard_base', xform(beard_shell, jaw), white, region='head')
# a barba longa cai até o peito em mechas
random.seed(9)
locks = []
for i in range(9):
    x = (i - 4) * 0.022 * H
    root = Vector((x, hc.y - 0.12 * H, hc.z - 0.14 * H))
    pts = []
    ln = (0.26 - abs(i - 4) * 0.025) * H
    for k in range(6):
        t = k / 5
        p = root + Vector((x * 0.2 * t, -0.02 * H * t, -ln * t))
        pts.append((p.x, p.y, p.z, 0.026 * (1 - 0.6 * t) + 0.004, 0.018 * (1 - 0.6 * t) + 0.004))
    locks.append(tube(pts, 6))
b.add('beard_long', merge(*locks), white, region='head', subdiv=0)

b.export(OUT)
