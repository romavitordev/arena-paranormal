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
    'torso': material('skin_torso_juan', '#ffffff', 0.8),  # cortes e tatuagens de texto (skin_: a luz da arena não tinge)
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
# barra e bordas da frente ESFIAPADAS: tiras pontudas de comprimentos diferentes
rags = []
for s_ in range(0, SEG + 1, 2):
    t = GAP + (1 - 2 * GAP) * s_ / SEG
    a = t * TAU
    q = Vector(m_pt(a, 1.0, s_))
    q = Vector((q.x * K_TX, q.y * K_TY, q.z))
    o_ = Vector((q.x, q.y, 0)).normalized()
    ln = (0.04 + 0.07 * TEAR[(s_ * 7) % (SEG + 1)]) * H
    rags.append(cone(tuple(q), tuple(q + o_ * 0.006 * H + Vector((0, 0, -ln * 0.8))), 0.016 * H, 3))
for s_, t in ((0, GAP), (SEG, 1 - GAP)):
    for i in range(1, ROWS, 2):
        v = i / ROWS
        q = Vector(m_pt(t * TAU, v, s_))
        q = Vector((q.x * K_TX, q.y * K_TY, q.z))
        side = 1 if q.x > 0 else -1
        rags.append(cone(tuple(q), tuple(q + Vector((-side * 0.016 * H, -0.01 * H, -0.03 * H))), 0.011 * H, 3))
b.add('mantle_rags', merge(*rags), red, region='torso', weight_fn=m_weights, subdiv=0)
# capuz caído nas costas
b.add('hood', ellipsoid((0, 0.1 * H, top + 0.03 * H), (0.12 * H, 0.08 * H, 0.08 * H), 14, 8, theta_max=math.pi * 0.6), red, region='chest', subdiv=0)
# mangas soltas, rasgadas nas pontas (a direita inteira; a esquerda rasgada no ombro — braço esquerdo exposto)
sR, eR = sk['sR'], sk['eR']
b.add('sleeveR', tube(limb_rings(sR + Vector((0, 0, 0.04)), eR, 0.07, 0.076, n=3), 14), red, region='armR')
b.add('sleeveR_lo', tube(limb_rings(eR, eR.lerp(sk['handR'], 0.78), 0.076, 0.092, n=3), 14), red, region='eR', subdiv=0)
frays = []
p = eR.lerp(sk['handR'], 0.78)
for k in range(7):
    a = k / 7 * TAU
    frays.append(cone((p.x + math.sin(a) * 0.09, p.y + math.cos(a) * 0.09, p.z), (p.x + math.sin(a) * 0.093, p.y + math.cos(a) * 0.093, p.z - 0.025 - random.random() * 0.03), 0.012, 3))
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

# ---------------- cabelo castanho LONGO e bagunçado até os ombros (a arte "juan normal"): mechas soltas por cima da
# cabeça caindo nas costas e nos lados, meio rabo preso atrás, franja comprida desfiada caindo sobre o olho ESQUERDO
# dele (o olho perdido) e o lado esquerdo raspado escuro atrás da orelha
hair_dk = material('hair_juan_dk', '#2a1a10', 0.7)
HC = Vector((hc.x, hc.y + 0.006, hc.z + 0.014))
HR = (0.144 * H, 0.154 * H, 0.166 * H)
b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.99, HR[1] * 0.99, HR[2] * 0.99), front=0.2, side=0.42, back=0.6), hairm, region='head')


def hair_pt(gam, beta, r):
    return HC + Vector((math.sin(gam) * HR[0] * r, -math.cos(beta) * math.cos(gam) * HR[1] * r, math.sin(beta) * math.cos(gam) * HR[2] * r))


def strand(pts, radii, seg=6):
    return tube([(q.x, q.y, q.z, r, r) for q, r in zip(pts, radii)], seg)


random.seed(21)
locks, darks = [], []
for i in range(26):
    gam = -1.3 + 2.6 * i / 25 + random.uniform(-0.04, 0.04)
    if gam > 0.85:
        continue  # lado esquerdo: raspado (ver abaixo)
    b0 = 0.62 + 0.35 * abs(gam) ** 1.6
    pts, rad = [], []
    for k in range(7):
        t = k / 6
        beta = b0 + (2.7 - b0) * t
        pts.append(hair_pt(gam, beta, 1.07 + 0.06 * math.sin(t * math.pi)))
        rad.append(0.024 * H * (1 - 0.25 * t))
    last = pts[-1]
    out = Vector((math.sin(gam) * 0.6, 0.35, 0)).normalized()
    ln = random.uniform(0.18, 0.3) * H
    for k in range(1, 4):
        t = k / 3
        pts.append(last + out * 0.035 * H * t + Vector((random.uniform(-0.01, 0.01) * H, 0, -ln * t)))
        rad.append(0.022 * H * (1 - 0.75 * t))
    (darks if i % 5 == 0 else locks).append(strand(pts, rad))
# lado direito: mechas da têmpora caindo até o ombro
for j in range(6):
    p0 = hair_pt(-1.15 - j * 0.06, 0.8 + j * 0.1, 1.05)
    locks.append(strand([p0, p0 + Vector((-0.02 * H, 0.02 * H, -0.09 * H)), p0 + Vector((-0.035 * H, 0.04 * H, -0.2 * H)), p0 + Vector((-0.04 * H, 0.05 * H, -0.28 * H - j * 0.01 * H))], [0.024 * H, 0.022 * H, 0.016 * H, 0.004 * H]))
# franja desfiada: a maior parte cai sobre o olho esquerdo (x > 0)
for j in range(9):
    gam = -0.45 + j * 0.13
    p0 = hair_pt(gam, 1.0, 1.08)
    drop = (0.1 + 0.08 * smoothstep(-0.1, 0.5, gam)) * H
    tip = p0 + Vector((0.02 * H, -0.04 * H, -drop))
    locks.append(strand([p0, p0.lerp(tip, 0.5) + Vector((0, -0.02 * H, 0)), tip], [0.018 * H, 0.014 * H, 0.003 * H], 5))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
b.add('hair_dark', merge(*darks), hair_dk, region='head', subdiv=0)
# meio rabo preso atrás, no alto
tie = hair_pt(0.0, 2.05, 1.06)
tail = [tie, tie + Vector((0, 0.04 * H, -0.06 * H)), tie + Vector((0.01 * H, 0.06 * H, -0.16 * H)), tie + Vector((0.0, 0.06 * H, -0.26 * H))]
b.add('ponytail', strand(tail, [0.034 * H, 0.03 * H, 0.022 * H, 0.006 * H], 8), hairm, region='head', subdiv=0)
b.add('hair_tie', strand([tie + Vector((0, -0.006 * H, 0.008 * H)), tie + Vector((0, 0.008 * H, -0.01 * H))], [0.03 * H, 0.03 * H], 8), red_dk, region='head', subdiv=0)
# lado esquerdo raspado (cabelo bem curto e escuro atrás da orelha)
shaved = ellipsoid((HC.x + 0.11 * H, HC.y + 0.075 * H, HC.z - 0.03 * H), (0.04 * H, 0.06 * H, 0.06 * H), 12, 8)
def on_skull(q):
    d = (q - HC).normalized()
    r = 1.0 / math.sqrt((d.x / HR[0]) ** 2 + (d.y / HR[1]) ** 2 + (d.z / HR[2]) ** 2)
    return HC + d * r * 1.012


b.add('undercut', xform(shaved, on_skull), hair_dk, region='head', subdiv=0)
# alargadores pretos nas orelhas (referência)
gauges = []
for s in (1, -1):
    x = s * (0.136 * H + 0.008)
    gauges.append(tube([(x, hc.y + 0.01, hc.z - 0.035, 0.016, 0.016), (x + s * 0.008, hc.y + 0.01, hc.z - 0.035, 0.016, 0.016)], 10))
b.add('gauges', merge(*gauges), material('gauge_black', '#0e0e10', 0.4), region='head', subdiv=0)

b.export(OUT)
