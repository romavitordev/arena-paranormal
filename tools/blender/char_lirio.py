"""
LÍRIO TELLINI — public/models/lirio.glb
Referências (wiki Lírio_Tellini): a arte de Sinais do Outro Lado, a miniatura, a arte conceitual e as miniaturas de
combate com a Leonora. Os Cinco, "a parede". 1,85 m, alto e robusto, pele clara.
Cabelo loiro LONGO até o ombro, o alto jogado para trás com volume, uma mecha LARANJA; barba RALA (só pintada no rosto). Camisa azul de gola em V amarrada, mangas rasgadas na altura do cotovelo; antebraços com cicatrizes e ataduras.
Sobretudo azul-escuro comprido, ABERTO, sem mangas, com pelo branco na gola, nas cavas, nas bordas da frente e na barra.
Por cima: ombreiras de couro em camadas nos dois ombros, alças de couro cruzando o peito, o cinto cheio de bolsinhas,
a pata dourada, o rádio com o nome dele e o colar militar "Voytek". Luva marrom com faixa azul, pelo e a pata dourada na
mão DIREITA; pano laranja amarrado na ESQUERDA. Calça cinza, joelheiras e caneleiras de couro com tiras, sapatos marrons.
A marreta Leonora é adicionada em código (src/models/weapons.js).
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'lirio.glb'
random.seed(1997)
b = Builder(width=1.04, bulk=1.1, height=1.03)  # 1,85 m, ombros largos
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_lirio', '#e8c0a2', 0.8)
arms_m = material('arms_lirio', '#ffffff', 0.8)          # antebraços com cicatrizes (textura)
shirt = material('shirt_lirio', '#ffffff', 0.85)         # camisa azul (textura)
blue = material('shirt_blue', '#2c4f8a', 0.85)
glove = material('glove_lirio', '#ffffff', 0.7)
pants = material('pants_lirio', '#6e6e72', 0.9)
coat = material('coat_lirio', '#ffffff', 0.85)
coat_in = material('coat_lining', '#121a2c', 0.9)
fur = material('fur_white', '#ffffff', 0.95)
leather = material('leather_lirio', '#7a4e2c', 0.75)
leather_dk = material('leather_dark', '#3e2614', 0.8)
shoe = material('shoe_lirio', '#5a3820', 0.7)
sole = material('sole_lirio', '#2a1c12', 0.8)
gold = material('gold_paw', '#d0a640', 0.35, metal=0.8)
orange = material('cloth_orange', '#d9822a', 0.85)
silver = material('dogtag_silver', '#b8b8c0', 0.3, metal=0.9)
hairm = material('hair_lirio', '#b88f3e', 0.55)
hair_dk = material('hair_lirio_dk', '#8a6a2a', 0.6)
streak = material('hair_orange', '#d0702a', 0.55)
wrap = material('bandage', '#e0d6c0', 0.9)
radio = material('radio_black', '#232326', 0.5)

M = {'skin': skin, 'face': material('face_lirio', '#ffffff', 0.8), 'torso': shirt, 'hand': skin}


def lerp_table(tab, x):
    if x <= tab[0][0]:
        return tab[0][1:]
    for a, c in zip(tab, tab[1:]):
        if x <= c[0]:
            t = (x - a[0]) / (c[0] - a[0])
            return tuple(p + (q - p) * t for p, q in zip(a[1:], c[1:]))
    return tab[-1][1:]


def rod(pts, radii, seg=6, flat=None):
    pts = [Vector(p) for p in pts]
    verts, faces, uvs = [], [], []
    n = len(pts)
    prev = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        if flat:
            nn = flat[0](p)
            nn = (nn - t * nn.dot(t)).normalized()
            side = t.cross(nn).normalized()
            up = nn
        else:
            side = (prev - t * prev.dot(t)) if prev is not None else t.orthogonal()
            side.normalize()
            prev = side
            up = t.cross(side)
        k = flat[1] if flat else 1.0
        for s in range(seg + 1):
            a = s / seg * TAU
            verts.append(tuple(p + side * math.cos(a) * radii[i] + up * math.sin(a) * radii[i] * k))
            uvs.append((s / seg, i / (n - 1)))
    row = seg + 1
    for i in range(n - 1):
        for s in range(seg):
            a = i * row + s
            faces.append((a, a + row, a + 1 + row, a + 1))
    for k_, flip in ((0, True), (n - 1, False)):
        c = len(verts)
        verts.append(tuple(pts[k_]))
        uvs.append((0.5, k_ / (n - 1)))
        for s in range(seg):
            faces.append((c, k_ * row + s + 1, k_ * row + s) if flip else (c, k_ * row + s, k_ * row + s + 1))
    return verts, faces, uvs


def grid(fn, nu, nv, flip=False):
    verts, faces, uvs = [], [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            verts.append(tuple(fn(i / nu, j / nv)))
            uvs.append((i / nu, 1 - j / nv))
    row = nu + 1
    for j in range(nv):
        for i in range(nu):
            a = j * row + i
            f = (a, a + 1, a + 1 + row, a + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


def outward(p):
    v = Vector((p.x, p.y, 0))
    return v.normalized() if v.length > 1e-6 else Vector((0, 1, 0))


# ---------------------------------------------------------------- TRONCO robusto
TT = [
    (-0.16, 0.18, 0.132, 0.134),
    (-0.04, 0.182, 0.134, 0.136),
    (0.08, 0.184, 0.136, 0.138),
    (0.2, 0.2, 0.144, 0.144),
    (0.32, 0.228, 0.156, 0.15),
    (0.42, 0.246, 0.164, 0.156),
    (0.5, 0.25, 0.162, 0.158),
    (0.56, 0.236, 0.148, 0.152),
    (0.6, 0.21, 0.13, 0.142),
    (0.64, 0.16, 0.108, 0.12),
    (0.675, 0.11, 0.088, 0.094),
    (0.7, 0.086, 0.076, 0.08),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def lirio_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = lirio_torso
hc = b.body(M, [], arms=(), legs=False, head_r=(0.14, 0.15, 0.162), neck_r=0.072)

# ---------------------------------------------------------------- BRAÇOS: manga azul rasgada no cotovelo, antebraço com
# cicatrizes e ataduras; luva com pata dourada na direita, pano laranja na esquerda
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    shtop = s + Vector((-sx * 0.02 * H, 0, 0.0))
    up = []
    for i in range(7):
        t = i / 6
        p = shtop.lerp(e, t * 0.96)
        r = 0.08 + 0.014 * math.sin(t * math.pi) - 0.008 * t
        up.append((p.x, p.y, p.z, r, r))
    b.add('sleeve' + side, tube(up, 14), blue, region='arm' + side, subdiv=0)
    b.add('delt' + side, ellipsoid((s.x - sx * 0.008 * H, s.y, s.z - 0.014 * H), (0.074 * H, 0.08 * H, 0.068 * H), 14, 10), blue, region='arm' + side, subdiv=0)
    # borda rasgada: farrapos caindo da manga
    rag = []
    for k in range(7):
        a = k / 7 * TAU + random.random() * 0.4
        p = shtop.lerp(e, 0.94)
        n = Vector((math.cos(a) * sx, math.sin(a), 0))
        rag.append(cone(tuple(p + n * 0.075), tuple(p + n * 0.078 + Vector((0, 0, -0.03 - random.random() * 0.035))), 0.016, 3))
    b.add('rag' + side, merge(*rag), blue, region='arm' + side, subdiv=0)
    fr = [(q.x, q.y, q.z, r, r * 0.92) for q, r in ((e.lerp(h, t), 0.066 - 0.014 * t + 0.008 * math.sin(t * math.pi)) for t in (0.0, 0.25, 0.5, 0.75, 0.94))]
    b.add('forearm' + side, tube(fr, 12), arms_m, region='e' + side, subdiv=0)
    # ataduras no antebraço
    bands = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.06), 0.068 - t * 0.012, 0.067 - t * 0.012, n=1), 12) for t in ((0.3, 0.42) if side == 'L' else (0.36,))]
    b.add('bandage' + side, merge(*bands), wrap, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.062), glove if side == 'R' else skin, region='e' + side)
hR, eR = sk['handR'], sk['eR']
b.add('glovefur', tube(limb_rings(eR.lerp(hR, 0.78), eR.lerp(hR, 0.9), 0.07, 0.07, n=1), 12), fur, region='eR', subdiv=0)
b.add('glovepaw', merge(ellipsoid((hR.x - 0.06, hR.y, hR.z - 0.045), (0.006, 0.018, 0.018), 8, 4),
                        *[ellipsoid((hR.x - 0.061, hR.y + dy, hR.z - 0.02), (0.004, 0.006, 0.006), 5, 3) for dy in (-0.014, -0.005, 0.005, 0.014)]), gold, region='eR', subdiv=0)
hL, eL = sk['handL'], sk['eL']
b.add('handcloth', merge(tube(limb_rings(eL.lerp(hL, 0.84), hL + Vector((0, 0, -0.03)), 0.064, 0.06, n=2), 12),
                         rod([hL + Vector((0.05, 0.02, 0.0)), hL + Vector((0.08, 0.04, -0.05)), hL + Vector((0.09, 0.05, -0.1))], [0.014, 0.012, 0.006], 4),
                         rod([hL + Vector((0.05, -0.01, 0.0)), hL + Vector((0.075, -0.02, -0.06))], [0.012, 0.006], 4)), orange, region='eL', subdiv=0)

# ---------------------------------------------------------------- SOBRETUDO azul-escuro, aberto e sem mangas
GAP = 0.085


def coat_pt(u, v, out=1.0):
    a = (u - 0.5) * (1 - 2 * GAP) * TAU + math.pi  # a abertura fica na frente (a = 0)
    z = 0.6 - v * 1.2                       # do ombro até a metade da canela
    zc = max(z, -0.16)
    flare = max(0.0, -z - 0.1) * 0.1 + 0.022
    p = torso_pt(a, zc, 1.0, 0.03 + flare)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.12
        p.y *= 1 + (-0.16 - z) * 0.14
    k = out
    return Vector((p.x * k, p.y * k, p.z))


def coat_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.5 * H, p.z) * 0.45
    w_hip = smoothstep(hz + 0.25 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    w_chest = max(0.0, 1 - w_leg - w_hip)
    return {'chest': w_chest, 'hips': w_hip, 'l' + side: w_leg}


b.add('coat', grid(lambda u, v: coat_pt(u, v), 44, 16), coat, region='torso', weight_fn=coat_weights, subdiv=0)
b.add('coat_in', grid(lambda u, v: coat_pt(u, v, 0.985), 44, 16, flip=True), coat_in, region='torso', weight_fn=coat_weights, subdiv=0)
# PELO: barra, as duas bordas da frente, a gola alta e as cavas
hem = [coat_pt(u / 40, 1.0, 1.01) for u in range(41)]
edges = [[coat_pt(0.0, v / 16, 1.02) for v in range(17)], [coat_pt(1.0, v / 16, 1.02) for v in range(17)]]
b.add('fur_hem', merge(rod(hem, [0.034 * H] * 41, 8), *[rod(e_, [0.028 * H] * 17, 8) for e_ in edges]), fur, region='torso', weight_fn=coat_weights, subdiv=0)
collar = [torso_pt((k / 28 - 0.5) * (1 - 2 * GAP) * TAU + math.pi, 0.64, 1.0, 0.07) + Vector((0, 0, 0.02 * H)) for k in range(29)]
b.add('fur_collar', rod(collar, [0.045 * H] * 29, 8), fur, region='torso', subdiv=0)
for side in ('L', 'R'):
    s = sk['s' + side]
    sx = 1 if side == 'L' else -1
    ring = [s + Vector((-sx * 0.02 * H + math.cos(a) * 0.0 * H, math.sin(a) * 0.1 * H, math.cos(a) * 0.1 * H - 0.02 * H)) for a in [k / 16 * TAU for k in range(17)]]
    b.add('fur_arm' + side, rod(ring, [0.026 * H] * 17, 6), fur, region='arm' + side, subdiv=0)

# ---------------------------------------------------------------- COURO: ombreiras, alças, cinto de bolsas, detalhes
for side in ('L', 'R'):
    s = sk['s' + side]
    sx = 1 if side == 'L' else -1
    pads = [ellipsoid((s.x + sx * 0.01 * H, s.y, s.z + 0.04 * H - k * 0.045 * H), (0.09 * H - k * 0.006 * H, 0.1 * H, 0.03 * H), 12, 6, theta_max=math.pi * 0.55) for k in range(3)]
    b.add('pauldron' + side, merge(*pads), leather, region='s' + side, subdiv=0)
straps = []
for s_ in (1, -1):
    pts = [torso_pt(s_ * 0.5, 0.64, 1.0, 0.04), torso_pt(s_ * 0.45, 0.46, 1.0, 0.03), torso_pt(s_ * 0.38, 0.12, 1.0, 0.03)]
    straps.append(rod(pts, [0.022 * H] * 3, 5, flat=(outward, 0.3)))
    pts = [torso_pt(s_ * 2.6, 0.64, 1.0, 0.04), torso_pt(s_ * 2.7, 0.3, 1.0, 0.03), torso_pt(s_ * 2.75, 0.1, 1.0, 0.03)]
    straps.append(rod(pts, [0.022 * H] * 3, 5, flat=(outward, 0.3)))
straps.append(rod([torso_pt(a, 0.36, 1.0, 0.032) for a in [(-0.75 + k * 0.1) for k in range(16)]], [0.018 * H] * 16, 5, flat=(outward, 0.3)))
straps.append(rod([torso_pt(a, 0.08, 1.0, 0.036) for a in [(k / 32 - 0.5) * TAU for k in range(33)]], [0.026 * H] * 33, 5, flat=(outward, 0.35)))
b.add('straps', merge(*straps), leather_dk, region='torso', subdiv=0)
pouches = []
for a in (-1.0, -0.62, -0.3, 0.3, 0.62, 1.0):
    p = torso_pt(a, 0.05, 1.0, 0.06)
    pouches.append(box(tuple(p), (0.05 * H, 0.04 * H, 0.07 * H), bevel=0.006))
b.add('pouches', merge(*pouches), leather, region='torso', subdiv=0)
bk_ = torso_pt(0, 0.08, 1.0, 0.05)
b.add('buckle', box(tuple(bk_), (0.05 * H, 0.012 * H, 0.04 * H), bevel=0.004), gold, region='torso', subdiv=0)
pw = torso_pt(-0.42, 0.44, 1.0, 0.05)
b.add('paw_brooch', merge(ellipsoid(tuple(pw), (0.018 * H, 0.008 * H, 0.016 * H), 8, 4),
                          *[ellipsoid((pw.x + dx * H, pw.y - 0.002 * H, pw.z + dz * H), (0.006 * H, 0.004 * H, 0.006 * H), 6, 3) for dx, dz in ((-0.015, 0.016), (-0.005, 0.024), (0.006, 0.024), (0.016, 0.016))]), gold, region='torso', subdiv=0)
wk = torso_pt(0.42, 0.44, 1.0, 0.06)
b.add('walkie', merge(box(tuple(wk), (0.035 * H, 0.025 * H, 0.07 * H), bevel=0.004), cone((wk.x + 0.01 * H, wk.y, wk.z + 0.035 * H), (wk.x + 0.012 * H, wk.y, wk.z + 0.11 * H), 0.004 * H, 4)), radio, region='torso', subdiv=0)
tag = torso_pt(0, 0.5, 1.0, 0.03)
b.add('dogtag_chain', rod([torso_pt(a, 0.64 - 0.15 * max(0.0, math.cos(a)) ** 4, 1.0, 0.012) for a in [(k / 20 - 0.5) * 2.2 for k in range(21)]], [0.004 * H] * 21, 4), silver, region='torso', subdiv=0)
b.add('dogtag', box(tuple(tag), (0.022 * H, 0.006 * H, 0.034 * H), bevel=0.003), silver, region='torso', subdiv=0)

# ---------------------------------------------------------------- PERNAS: calça cinza, joelheiras e caneleiras de couro
b.add('pants_hip', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.04 - v * 0.24, 1.0, 0.01), 32, 4), pants, region='torso', subdiv=0)
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    topp = Vector((l.x, l.y, l.z + 0.07 * H))
    rings = []
    for t, r in ((0.0, 0.094), (0.35, 0.09), (0.75, 0.078), (1.0, 0.072)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.3, 0.066), (0.6, 0.06), (0.85, 0.056), (0.95, 0.056)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('pants' + side, tube(rings, 14), pants, region='leg' + side, subdiv=0)
    # joelheira de couro (placa arredondada) com a tira
    b.add('kneepad' + side, ellipsoid((k.x, k.y - 0.06 * H, k.z), (0.06 * H, 0.03 * H, 0.07 * H), 12, 8, theta_max=math.pi), leather, region='k' + side, subdiv=0)
    b.add('kneestrap' + side, tube(limb_rings(k.lerp(f, 0.04), k.lerp(f, 0.09), 0.078, 0.077, n=1), 12), leather_dk, region='k' + side, subdiv=0)
    # caneleira de couro na frente da canela, presa por tiras
    b.add('shin' + side, ellipsoid(tuple(k.lerp(f, 0.55) + Vector((0, -0.055 * H, 0))), (0.05 * H, 0.025 * H, 0.15 * H), 10, 8), leather, region='k' + side, subdiv=0)
    sts = [tube(limb_rings(k.lerp(f, t), k.lerp(f, t + 0.04), 0.07, 0.069, n=1), 12) for t in (0.4, 0.68)]
    b.add('shinstraps' + side, merge(*sts), leather_dk, region='k' + side, subdiv=0)
    # sapato marrom
    b.add('shoe' + side, ellipsoid((f.x, f.y - 0.06 * H, f.z + 0.035 * H), (0.056 * H, 0.13 * H, 0.05 * H), 12, 8, theta_max=math.pi * 0.56), shoe, region='foot' + side, subdiv=0)
    b.add('sole' + side, box((f.x, f.y - 0.06 * H, f.z - 0.006 * H), (0.115 * H, 0.27 * H, 0.03 * H), bevel=0.006), sole, region='foot' + side, subdiv=0)

# ---------------------------------------------------------------- CABEÇA: cabelo longo jogado para trás + mecha laranja
HR = (0.144 * H, 0.154 * H, 0.166 * H)
HC = Vector((hc.x, hc.y + 0.006, hc.z + 0.012))
b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.99, HR[1] * 0.99, HR[2] * 0.99), front=0.2, side=0.5, back=0.66), hairm, region='head')


def hair_pt(gam, beta, r):
    return HC + Vector((math.sin(gam) * HR[0] * r, -math.cos(beta) * math.cos(gam) * HR[1] * r, math.sin(beta) * math.cos(gam) * HR[2] * r))


locks, darks = [], []
# o alto: mechas da testa por cima da cabeça até a nuca, e de lá caem até o ombro
for i in range(30):
    gam = -1.25 + 2.5 * i / 29 + random.uniform(-0.04, 0.04)
    b0 = 0.55 + 0.4 * abs(gam) ** 1.6 + random.uniform(-0.05, 0.05)
    pts, rad = [], []
    for k in range(9):
        t = k / 8
        beta = b0 + (3.3 - b0) * t
        puff = (0.2 + 0.06 * math.sin(i * 2.3)) * math.exp(-((beta - 1.25) / 0.6) ** 2) * (1 - 0.4 * abs(gam))  # volume bagunçado no alto
        pts.append(hair_pt(gam, beta, 1.06 + puff))
        rad.append(0.03 * H * (1 - 0.3 * t))
    # depois da nuca: caem até o ombro, abrindo um pouco
    last = pts[-1]
    out = Vector((math.sin(gam) * 0.5, 0.4, 0)).normalized()
    ln = random.uniform(0.2, 0.3) * H
    for k in range(1, 4):
        t = k / 3
        pts.append(last + out * 0.03 * H * t + Vector((0, 0, -ln * t)))
        rad.append(0.028 * H * (1 - 0.65 * t))
    (darks if i % 4 == 0 else locks).append(rod(pts, rad, 6, flat=(lambda p: (p - HC).normalized(), 0.55)))
# os lados: mechas que saem das têmporas, passam por trás da orelha e caem até o ombro
for s_ in (1, -1):
    for j in range(7):
        th = 0.9 + j * 0.06
        ph = s_ * (1.15 + j * 0.15)
        p0 = HC + Vector((math.sin(th) * math.sin(ph) * HR[0] * 1.05, -math.sin(th) * math.cos(ph) * HR[1] * 1.05, math.cos(th) * HR[2] * 1.05))
        pts = [p0, p0 + Vector((s_ * 0.025 * H, 0.03 * H, -0.08 * H)), p0 + Vector((s_ * 0.04 * H, 0.05 * H, -0.18 * H)), p0 + Vector((s_ * 0.05 * H, 0.06 * H, -0.26 * H - j * 0.008 * H))]
        locks.append(rod(pts, [0.03 * H, 0.03 * H, 0.022 * H, 0.006 * H], 6, flat=(lambda p: outward(p - HC + Vector((0, 0, 0))), 0.6)))
# duas mechas soltas caindo na testa
for s_ in (1, -1):
    p0 = hair_pt(s_ * 0.25, 0.7, 1.08)
    locks.append(rod([p0, p0 + Vector((s_ * 0.02 * H, -0.03 * H, -0.06 * H)), p0 + Vector((s_ * 0.035 * H, -0.035 * H, -0.12 * H))], [0.016 * H, 0.012 * H, 0.003 * H], 5))
for i in range(22):
    gam = random.uniform(-0.9, 0.9)
    beta = random.uniform(0.8, 1.9)
    p0 = hair_pt(gam, beta, 1.12)
    nn = (p0 - HC).normalized()
    tip = p0 + (nn * 0.7 + Vector((random.uniform(-0.2, 0.2), 0.45, 0.2))).normalized() * random.uniform(0.05, 0.09) * H
    locks.append(rod([p0, p0.lerp(tip, 0.5), tip], [0.024 * H, 0.015 * H, 0.003 * H], 5))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
b.add('hair_dark', merge(*darks), hair_dk, region='head', subdiv=0)
# a mecha LARANJA, no lado esquerdo dele
st = []
for gam in (0.42, 0.5, 0.58):
    pts = [hair_pt(gam, 0.6 + 0.3 * k, 1.16 + 0.12 * math.exp(-((0.6 + 0.3 * k - 1.25) / 0.6) ** 2)) for k in range(7)]
    st.append(rod(pts, [0.03 * H] * 6 + [0.01 * H], 6, flat=(lambda p: (p - HC).normalized(), 0.55)))
b.add('hair_streak', merge(*st), streak, region='head', subdiv=0)


# sem barba de malha: só a barba RALA pintada no rosto (face_lirio)

b.export(OUT)
