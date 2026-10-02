"""
JUAN (Henri) — public/models/juan.glb
Referência: arte de Hexatombe (wiki). 1,65 m, porte forte e magro, cabelo castanho LONGO preso em rabo de cavalo
com franja do lado do olho perdido; o olho que resta esbranquiçado. Manto VERMELHO rasgado com capuz (caído nas
costas), aberto e cobrindo pouco: torso exposto, cheio de cortes e tatuagens de frases; duas correntes em volta do
torso e uma no braço; calça escura com chaparreiras mais claras e um pano amarrado na cintura; descalço.
A Faca Predadora (lâmina ondulada) é adicionada em código.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'juan.glb'
b = Builder(width=0.94, bulk=0.96, height=0.92)  # 1,65 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_juan', '#d8a888', 0.8),
    'face': material('face_juan', '#ffffff', 0.8),
    'torso': material('torso_juan', '#ffffff', 0.8),  # cortes e tatuagens de texto
    'arm': material('arms_juan', '#ffffff', 0.8),
    'legs': material('pants_juan', '#2e2c2e', 0.9),
    'feet': material('skin_juan', '#d8a888', 0.8),
}
red = material('mantle_red', '#8a1a1e', 0.85)
red_dk = material('mantle_red_dark', '#5a0e12', 0.9)
chaps = material('chaps_juan', '#4a4644', 0.9)
sash = material('sash_juan', '#b8a888', 0.9)
chainm = material('chain_juan', '#8a8a90', 0.35, metal=0.9)
hairm = material('hair_juan', '#5a3a22', 0.6)

hc = b.body(M, [(-0.12, 0.158), (0.0, 0.16), (0.17, 0.145), (0.36, 0.18), (0.48, 0.196), (0.58, 0.108), (0.65, 0.064)],
            arm_r=(0.056, 0.046, 0.04), leg_r=(0.074, 0.058, 0.047), head_r=(0.134, 0.144, 0.156), feet='bare')

# ---------------- manto vermelho rasgado: aberto na frente (mostra o torso), comprido atrás, mangas soltas rasgadas
K_TX, K_TY = b.k_tx, b.k_ty
GAP = 0.2  # abertura larga na frente
SEG, ROWS = 44, 12
random.seed(13)
TEAR = [random.random() for _ in range(SEG + 1)]


def m_len(a, s):
    # rasgado: comprimento irregular por coluna, mais longo atrás
    return (0.7 - 0.25 * max(0.0, math.cos(a)) ** 2) * H * (0.8 + 0.25 * TEAR[s])


def m_pt(a, v, s, out=1.0):
    sh = min(1.0, v * 3.5) ** 0.6
    rx = 0.15 * H + (0.24 * H - 0.15 * H) * sh + v * 0.03 * H
    ry = 0.11 * H + (0.16 * H - 0.11 * H) * sh + v * 0.03 * H
    z = top + 0.01 * H - v * m_len(a, s)
    return (math.sin(a) * rx * out / K_TX, -math.cos(a) * ry * out / K_TY, z)


def m_mesh(out=1.0, flip=False):
    verts, faces, uvs = [], [], []
    for i in range(ROWS + 1):
        v = i / ROWS
        for s in range(SEG + 1):
            t = GAP + (1 - 2 * GAP) * s / SEG
            verts.append(m_pt(t * TAU, v, s, out))
            uvs.append((s / SEG, 1 - v))
    row = SEG + 1
    for i in range(ROWS):
        for s in range(SEG):
            p = i * row + s
            f = (p, p + 1, p + 1 + row, p + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


def m_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.12 * H, 0.26 * H, abs(p.x)) * smoothstep(top - 0.4 * H, top - 0.05 * H, p.z) * 0.5
    w_hip = smoothstep(hz + 0.15 * H, hz - 0.3 * H, p.z) * (1 - w_arm) * 0.7
    return {'s' + side: w_arm, 'hips': w_hip, 'chest': max(0.0, 1 - w_arm - w_hip)}


b.add('mantle', m_mesh(), red, region='torso', weight_fn=m_weights, subdiv=0)
b.add('mantle_in', m_mesh(0.975, flip=True), red_dk, region='torso', weight_fn=m_weights, subdiv=0)
# capuz caído nas costas
b.add('hood', ellipsoid((0, 0.1 * H, top + 0.03 * H), (0.12 * H, 0.08 * H, 0.08 * H), 14, 8, theta_max=math.pi * 0.6), red, region='chest', subdiv=0)
# mangas soltas, rasgadas nas pontas (a direita inteira; a esquerda rasgada no ombro — braço esquerdo exposto)
sR, eR = sk['sR'], sk['eR']
b.add('sleeveR', tube(limb_rings(sR + Vector((0, 0, 0.04)), eR.lerp(sk['handR'], 0.55), 0.07, 0.085, n=4), 14), red, region='armR')
frays = []
p = eR.lerp(sk['handR'], 0.55)
for k in range(7):
    a = k / 7 * TAU
    frays.append(cone((p.x + math.sin(a) * 0.08, p.y + math.cos(a) * 0.08, p.z), (p.x + math.sin(a) * 0.085, p.y + math.cos(a) * 0.085, p.z - 0.04 - random.random() * 0.05), 0.016, 3))
b.add('sleeve_fray', merge(*frays), red, region='eR', subdiv=0)
b.add('sleeveL_rag', tube(limb_rings(sk['sL'] + Vector((0, 0, 0.04)), sk['sL'].lerp(sk['eL'], 0.3), 0.068, 0.07, n=2), 12), red_dk, region='armL', subdiv=0)
# correntes: duas em volta do torso (diagonal) e uma no braço esquerdo
links = []
for k, (z0, tilt) in enumerate(((hz + 0.42 * H, 0.08), (hz + 0.3 * H, -0.06))):
    for i in range(24):
        a = i / 24 * TAU
        links.append(ellipsoid((math.sin(a) * 0.168 * H, -math.cos(a) * 0.118 * H, z0 + math.sin(a) * tilt * H), (0.012, 0.012, 0.008), 5, 3))
eL = sk['eL']
for i in range(10):
    a = i / 10 * TAU
    pz = sk['sL'].lerp(eL, 0.6)
    links.append(ellipsoid((pz.x + math.sin(a) * 0.058, pz.y + math.cos(a) * 0.058, pz.z + math.sin(a * 0.5) * 0.02), (0.011, 0.011, 0.008), 5, 3))
b.add('chains', merge(*links), chainm, region=None, subdiv=0)
# cintura: cós da calça, pano claro amarrado caindo de um lado, chaparreiras por cima da calça
b.add('waistband', tube([(0, 0, hz + 0.04 * H, 0.168 * H, 0.122 * H), (0, 0, hz + 0.08 * H, 0.168 * H, 0.122 * H)], 18), chaps, region='torso', subdiv=0)
b.add('sash', tube([(0.12 * H, -0.06, hz + 0.02 * H, 0.06 * H, 0.03 * H), (0.15 * H, -0.04, hz - 0.12 * H, 0.06 * H, 0.025 * H), (0.16 * H, -0.03, hz - 0.22 * H, 0.05 * H, 0.02 * H)], 10), sash, region='legL')
for side in ('L', 'R'):
    l, k = sk['l' + side], sk['k' + side]
    b.add('chap' + side, tube(limb_rings(l.lerp(k, 0.15), k.lerp(sk['foot' + side], 0.8), 0.088, 0.066, n=4), 14), chaps, region='leg' + side)

# ---------------- cabelo castanho longo em rabo de cavalo, franja longa sobre o olho perdido (esquerdo)
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.014), (0.144 * H, 0.154 * H, 0.166 * H), front=0.22, side=0.42, back=0.6), hairm, region='head')
tail = []
for kk in range(8):
    t = kk / 7
    tail.append((0, hc.y + 0.15 * H + 0.04 * H * t, hc.z + 0.04 * H - 0.36 * H * t, 0.035 * (1 - 0.5 * t) + 0.006, 0.03 * (1 - 0.5 * t) + 0.006))
b.add('ponytail', tube(tail, 8), hairm, region='head', subdiv=0)
b.add('hair_tie', tube([(0, hc.y + 0.148 * H, hc.z + 0.045 * H, 0.03, 0.03), (0, hc.y + 0.152 * H, hc.z + 0.025 * H, 0.03, 0.03)], 8), red_dk, region='head', subdiv=0)
fringe = []
for kk in range(6):
    t = kk / 5
    fringe.append((0.06 * H + 0.02 * H * t, hc.y - 0.14 * H - 0.01 * t, hc.z + 0.1 * H - 0.2 * H * t, 0.026 * (1 - 0.4 * t) + 0.004, 0.012))
b.add('fringe', tube(fringe, 6), hairm, region='head', subdiv=0)

b.export(OUT)
