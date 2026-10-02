"""
MIGUEL CARIAD — public/models/miguel.glb
Referência: arte do Livro de Regras (wiki). Agente da Ordo Realitas (Equipe Kelvin), ex-fisiculturista: alto e
muito forte, pele clara, cabelo preto curto e espetado, olhos castanhos. Jaqueta preta com as mangas dobradas até o
cotovelo por cima de uma camiseta verde-escura, calça e sapatos pretos. Tatuagem tribal preta no antebraço DIREITO
(igual à dos colegas da equipe). O revólver Magnum é adicionado em código.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'miguel.glb'
b = Builder(width=1.06, bulk=1.2, height=1.08)  # ~1,95 m, ombros de fisiculturista
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_miguel', '#e2b89a', 0.8),
    'face': material('face_miguel', '#ffffff', 0.8),
    'torso': material('tee_miguel', '#3a4436', 0.85),  # camiseta verde-escura
    'armL': material('skin_miguel', '#e2b89a', 0.8),
    'armR': material('arms_miguel', '#ffffff', 0.8),  # antebraço direito tatuado
    'legs': material('pants_black', '#1c1c1f', 0.85),
    'feet': material('shoe_black', '#111113', 0.6),
}
jacket = material('jacket_miguel', '#16161a', 0.8)
jacket_in = material('jacket_lining', '#222226', 0.85)
hairm = material('hair_black', '#121214', 0.55)
belt = material('belt_black', '#0e0e10', 0.6)
metal = material('buckle_steel', '#a8a8ae', 0.3, metal=0.9)

hc = b.body(M, [(-0.12, 0.17), (0.0, 0.172), (0.17, 0.165), (0.36, 0.226), (0.48, 0.246), (0.58, 0.13), (0.65, 0.078)],
            arm_r=(0.072, 0.06, 0.05), leg_r=(0.086, 0.066, 0.052), head_r=(0.136, 0.146, 0.158), neck_r=0.072)

# ---------------- jaqueta preta aberta, mangas dobradas até o cotovelo
K_TX, K_TY = b.k_tx, b.k_ty
GAP = 0.08
SEG, ROWS = 44, 8


def jk_pt(a, v, out=1.0):
    rx = 0.25 * H + v * 0.012 * H
    ry = 0.165 * H + v * 0.01 * H
    z = top - v * (top - (hz - 0.04 * H))
    return (math.sin(a) * rx * out / K_TX, -math.cos(a) * ry * out / K_TY, z)


def jk_mesh(out=1.0, flip=False):
    verts, faces, uvs = [], [], []
    for i in range(ROWS + 1):
        v = i / ROWS
        for s in range(SEG + 1):
            t = GAP + (1 - 2 * GAP) * s / SEG
            verts.append(jk_pt(t * TAU, v, out))
            uvs.append((s / SEG, 1 - v))
    row = SEG + 1
    for i in range(ROWS):
        for s in range(SEG):
            p = i * row + s
            f = (p, p + 1, p + 1 + row, p + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


def jk_weights(p):
    w_hip = smoothstep(hz + 0.3 * H, hz, p.z)
    return {'chest': 1 - w_hip, 'hips': w_hip}


b.add('jacket', jk_mesh(), jacket, region='torso', weight_fn=jk_weights, subdiv=0)
b.add('jacket_in', jk_mesh(0.97, flip=True), jacket_in, region='torso', weight_fn=jk_weights, subdiv=0)
# gola levantada
b.add('collar', tube([(0, 0.01, top - 0.02 * H, 0.15 * H, 0.11 * H), (0, 0.02, top + 0.06 * H, 0.13 * H, 0.1 * H)], 20, cap_start=False, cap_end=False), jacket, region='torso', subdiv=0)
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('jsleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.05)), sh.lerp(e, 0.95), 0.092, 0.084, n=3), 14), jacket, region='arm' + side)
    # dobra da manga (punho grosso)
    b.add('jroll' + side, tube(limb_rings(sh.lerp(e, 0.9), sh.lerp(e, 1.06), 0.094, 0.092, n=1), 14), jacket_in, region='arm' + side, subdiv=0)
    # bolsos no peito
    b.add('pocket' + side, box(((0.1 if side == 'L' else -0.1) * H, -0.17 * H, hz + 0.47 * H), (0.075, 0.012, 0.07), bevel=0.004), jacket, region='torso', subdiv=0)
# cinto
b.add('belt', tube([(0, 0, hz + 0.02 * H, 0.176 * H, 0.13 * H), (0, 0, hz + 0.06 * H, 0.176 * H, 0.13 * H)], 20), belt, region='torso', subdiv=0)
b.add('buckle', box((0, -0.134 * H, hz + 0.04 * H), (0.045, 0.01, 0.035)), metal, region='torso', subdiv=0)
for side in ('L', 'R'):
    f = sk['foot' + side]
    b.add('sole' + side, box((f.x, f.y - 0.05, f.z - 0.02), (0.11 * H, 0.26 * H, 0.03)), belt, region='k' + side, subdiv=0)

# ---------------- cabelo preto curto e espetado
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.018), (0.142 * H, 0.152 * H, 0.164 * H), front=0.3, side=0.38, back=0.55), hairm, region='head')
random.seed(5)
spikes = []
for i in range(16):
    a = -0.6 + (i % 8) * 0.17
    row = i // 8
    base = Vector((math.sin(a) * 0.09 * H, -0.06 * H + row * 0.05 * H - math.cos(a) * 0.02, hc.z + 0.13 * H - row * 0.01))
    tip = base + Vector((math.sin(a) * 0.03, -0.05 + row * 0.03, 0.06 + random.random() * 0.03))
    spikes.append(cone(tuple(base), tuple(tip), 0.03, 5))
b.add('hair_spikes', merge(*spikes), hairm, region='head', subdiv=0)

b.export(OUT)
