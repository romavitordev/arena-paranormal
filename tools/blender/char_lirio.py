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
from sculpt_lib import Sculpt, ridge, n3, relief
from mathutils import Vector
from mathutils.bvhtree import BVHTree

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
fur = material('fur_lirio', '#ffffff', 0.95)
leather = material('leather_lirio', '#7a4e2c', 0.75)
leather_dk = material('leather_dark', '#3e2614', 0.8)
shoe = material('shoe_lirio', '#5a3820', 0.7)
sole = material('sole_lirio', '#2a1c12', 0.8)
gold = material('gold_paw', '#d0a640', 0.35, metal=0.8)
orange = material('cloth_orange', '#d9822a', 0.85)
silver = material('dogtag_silver', '#b8b8c0', 0.3, metal=0.9)
hairm = material('hair_lirio', '#a07434', 0.55)   # loiro-escuro puxando para o castanho (a miniatura)
hair_dk = material('hair_lirio_dk', '#6e4c22', 0.6)
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
gfur = Sculpt()
gc = eR.lerp(hR, 0.84)
for k in range(12):
    a = k / 12 * TAU
    gfur.ell(gc + Vector((math.cos(a) * 0.066, math.sin(a) * 0.066, 0)), (0.024, 0.024, 0.022))
b.add('glovefur', gfur.mesh(res=0.004, smooth=2, disp=lambda p: 0.004 * (ridge(p.y * 300 + p.z * 200, 2) - 0.4), target=600), fur, region='eR', subdiv=0)
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


# o pano pesado cai em DOBRAS verticais que abrem para a barra (o sobretudo da miniatura, não um tubo liso)
def coat_folds(p):
    a = math.atan2(p.x, -p.y)
    low = max(0.0, min(1.0, (hz + 0.3 * H - p.z) / (0.9 * H)))
    return (0.004 + 0.012 * low) * H * (ridge(a * 7 + n3(p, 6) * 1.2, 2) - 0.4)


coat_o = b.add('coat', grid(lambda u, v: coat_pt(u, v), 64, 28), coat, region='torso', weight_fn=coat_weights, subdiv=0)
relief(coat_o, coat_folds)
coat_io = b.add('coat_in', grid(lambda u, v: coat_pt(u, v, 0.985), 64, 28, flip=True), coat_in, region='torso', weight_fn=coat_weights, subdiv=0)
relief(coat_io, lambda p: -coat_folds(p))


# PELO cinza FOFO: tufos de metaball ao longo da barra, das duas bordas da frente, da gola alta e das cavas
def fluffy(paths, r, seed):
    rnd = random.Random(seed)
    F = Sculpt()
    for path in paths:
        for i, q in enumerate(path):
            k = rnd.uniform(0.75, 1.25)
            F.ell(q, (r * k, r * rnd.uniform(0.8, 1.2), r * k * 0.9))
            if i + 1 < len(path):
                F.ell(q.lerp(path[i + 1], 0.5), (r * 0.8, r * 0.8, r * 0.8))
    return F.mesh(res=0.0055, smooth=2, disp=lambda p: 0.006 * H * (ridge(p.x / H * 90 + p.z / H * 140 + n3(p, 40) * 2, 2) - 0.4), target=2600)


hem = [coat_pt(u / 48, 1.0, 1.01) for u in range(49)]
edges = [[coat_pt(0.0, v / 24, 1.02) for v in range(25)], [coat_pt(1.0, v / 24, 1.02) for v in range(25)]]
b.add('fur_hem', fluffy([hem] + edges, 0.034 * H, 11), fur, region='torso', weight_fn=coat_weights, subdiv=0)
collar = [torso_pt((k / 28 - 0.5) * (1 - 2 * GAP) * TAU + math.pi, 0.64, 1.0, 0.07) + Vector((0, 0, 0.02 * H)) for k in range(29)]
b.add('fur_collar', fluffy([collar], 0.05 * H, 12), fur, region='torso', subdiv=0)
for side in ('L', 'R'):
    s = sk['s' + side]
    sx = 1 if side == 'L' else -1
    ring = [s + Vector((-sx * 0.02 * H, math.sin(a) * 0.1 * H, math.cos(a) * 0.1 * H - 0.02 * H)) for a in [k / 16 * TAU for k in range(17)]]
    b.add('fur_arm' + side, fluffy([ring], 0.026 * H, 13 if side == 'L' else 14), fur, region='arm' + side, subdiv=0)

# ---------------------------------------------------------------- COURO: ombreiras, alças, cinto de bolsas, detalhes
# ombreiras GRANDES em camadas (a miniatura): placas de couro que cobrem o ombro e descem pelo braço até o meio do bíceps,
# cada uma um pouco mais para fora e mais baixa, com uma faixa de pelo na borda da de cima
for side in ('L', 'R'):
    s = sk['s' + side]
    sx = 1 if side == 'L' else -1
    # calotas que abraçam o ombro (theta até 0,72·π) e se sobrepõem — escamas de couro, não discos soltos
    pads = [ellipsoid((s.x + sx * (0.0 + k * 0.014) * H, s.y, s.z + 0.035 * H - k * 0.045 * H), (0.1 * H - k * 0.006 * H, 0.108 * H - k * 0.006 * H, 0.075 * H), 16, 8, theta_max=math.pi * 0.72) for k in range(4)]
    b.add('pauldron' + side, merge(*pads), leather, region='s' + side, subdiv=0)
straps = []
for s_ in (1, -1):
    pts = [torso_pt(s_ * 0.5, 0.64, 1.0, 0.04), torso_pt(s_ * 0.45, 0.46, 1.0, 0.03), torso_pt(s_ * 0.38, 0.12, 1.0, 0.03)]
    straps.append(rod(pts, [0.022 * H] * 3, 5, flat=(outward, 0.3)))
    pts = [torso_pt(s_ * 2.6, 0.64, 1.0, 0.04), torso_pt(s_ * 2.7, 0.3, 1.0, 0.03), torso_pt(s_ * 2.75, 0.1, 1.0, 0.03)]
    straps.append(rod(pts, [0.022 * H] * 3, 5, flat=(outward, 0.3)))
straps.append(rod([torso_pt(a, 0.36, 1.0, 0.032) for a in [(-0.75 + k * 0.1) for k in range(16)]], [0.018 * H] * 16, 5, flat=(outward, 0.3)))
straps.append(rod([torso_pt(a, 0.08, 1.0, 0.036) for a in [(k / 32 - 0.5) * TAU for k in range(33)]], [0.026 * H] * 33, 5, flat=(outward, 0.35)))
# as tiras horizontais que fecham o peito e a barriga (a miniatura: o tronco todo amarrado em couro)
for z_ in (0.27, 0.18):
    straps.append(rod([torso_pt(a, z_, 1.0, 0.03) for a in [(-0.85 + k * 0.1) for k in range(18)]], [0.016 * H] * 18, 5, flat=(outward, 0.3)))
b.add('straps', merge(*straps), leather_dk, region='torso', subdiv=0)
b.add('strap_buckles', merge(*[box(tuple(torso_pt(0.06, z_, 1.0, 0.04)), (0.03 * H, 0.008 * H, 0.026 * H), bevel=0.002) for z_ in (0.36, 0.27, 0.18)]), silver, region='torso', subdiv=0)
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
    b.add('sole' + side, sole_part((f.x, f.y - 0.06 * H, f.z - 0.006 * H), (0.115 * H, 0.27 * H, 0.03 * H), bevel=0.006), sole, region='foot' + side, subdiv=0)

# ---------------------------------------------------------------- CABEÇA: cabelo longo, grosso e bagunçado, jogado para trás
# (a miniatura): calota de metaballs colada na cabeça, o alto armado, mechas GROSSAS que varrem da testa para trás e caem
# até os ombros abrindo em pontas, duas mechas soltas na testa e a mecha LARANJA no lado esquerdo dele (+x)
_bvh = {}


def bvh(name):
    if name not in _bvh:
        o = next(o for o in b.parts if o.name == name)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        me.transform(o.matrix_world)
        bm = bmesh.new()
        bm.from_mesh(me)
        _bvh[name] = BVHTree.FromBMesh(bm)
        bm.free()
        bpy.data.meshes.remove(me)
    return _bvh[name]


def surf(name, origin, direction, off=0.0):
    hit = bvh(name).ray_cast(Vector(origin), Vector(direction).normalized())
    return None if hit[0] is None else hit[0] + hit[1] * off


HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    """ponto na cabeça: a = ângulo a partir da frente (para +x), el = elevação a partir do equador"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


D = Sculpt()      # o castanho-dourado
Dk = Sculpt()     # as mechas mais escuras por baixo
O = Sculpt()      # a mecha laranja
# a calota
for i in range(26):
    for j in range(7):
        a = i / 26 * TAU
        el = 0.2 + 0.62 * j / 6
        if math.cos(a) > 0.55 and el < 0.75:
            continue  # testa e rosto livres
        if abs(math.sin(a)) > 0.8 and el < 0.32:
            continue  # a orelha fica por baixo das mechas, não da calota
        q = on_head(a, el, 0.014 * H)
        if q:
            D.ell(q, (0.036 * H, 0.036 * H, 0.032 * H))
# o alto ARMADO (volume bagunçado jogado para trás)
D.ell(HCv + Vector((0, 0.02 * H, 0.15 * H)), (0.15 * H, 0.165 * H, 0.08 * H))
# as mechas grossas JOGADAS PARA TRÁS: da linha do cabelo, por cima do alto, até a nuca, e de lá caem até os ombros
rnd = random.Random(1997)


def swept(a0, off=0.0):
    """caminho de uma mecha: frente (ângulo a0) → alto → nuca do mesmo lado → pendurada até o ombro"""
    ab = math.pi - a0 * 0.9  # o lado de trás correspondente
    pts = [on_head(a0 * 0.7, 0.95 - 0.15 * abs(a0), (0.035 + off) * H), on_head(a0 * 0.8, 1.32, (0.06 + off) * H),
           on_head(ab, 1.0, (0.05 + off) * H), on_head(ab, 0.45, (0.035 + off) * H), on_head(ab, 0.0, (0.03 + off) * H)]
    pts = [q for q in pts if q]
    if len(pts) < 3:
        return pts
    last = pts[-1]
    out = Vector((last.x - HCv.x, last.y - HCv.y, 0)).normalized()
    ln = rnd.uniform(0.14, 0.22) * H
    pts.append(last + out * 0.025 * H + Vector((0, 0, -ln * 0.6)))
    pts.append(last + out * 0.045 * H + Vector((rnd.uniform(-0.02, 0.02) * H, 0, -ln)))
    return pts


for i in range(24):
    a0 = (i / 23 - 0.5) * 2.4
    pts = swept(a0)
    if len(pts) > 2:
        rad = [0.03 * H] + [0.034 * H] * (len(pts) - 3) + [0.024 * H, 0.006 * H]
        (Dk if i % 5 == 2 else D).chain(pts, rad, step=0.5)
# os lados: das têmporas, passam por cima da orelha e caem até o ombro
for s in (1, -1):
    for j in range(4):
        p0 = on_head(s * (1.2 + j * 0.25), 0.55 - j * 0.05, 0.02 * H)
        if not p0:
            continue
        d = Vector((s, 0.4, 0)).normalized()
        pts = [p0, p0 + d * 0.035 * H + Vector((0, 0, -0.08 * H)), p0 + d * 0.05 * H + Vector((0, 0.01 * H, -0.18 * H)), p0 + d * 0.06 * H + Vector((0, 0.02 * H, -0.27 * H - j * 0.01 * H))]
        D.chain(pts, [0.03 * H, 0.03 * H, 0.022 * H, 0.006 * H], step=0.5)
# duas mechas soltas caindo na testa
for s in (1, -1):
    p0 = on_head(s * 0.3, 0.85, 0.03 * H)
    if p0:
        D.chain([p0, p0 + Vector((s * 0.02 * H, -0.035 * H, -0.06 * H)), p0 + Vector((s * 0.035 * H, -0.04 * H, -0.12 * H))], [0.016 * H, 0.012 * H, 0.004 * H], step=0.5)
# pontas espetadas no alto (o bagunçado da miniatura), deitadas para trás
for j in range(9):
    a = rnd.uniform(-1.0, 1.0)
    p0 = on_head(a, rnd.uniform(1.05, 1.3), 0.06 * H)
    if p0:
        tip = p0 + Vector((math.sin(a) * 0.03 * H, 0.06 * H, 0.025 * H))
        D.chain([p0, tip], [0.022 * H, 0.004 * H], step=0.5)
# a mecha LARANJA: três mechas juntas do lado esquerdo dele (+x), jogadas para trás como o resto, por cima
for k in range(3):
    pts = swept(0.5 + k * 0.09, 0.028)
    if len(pts) > 2:
        O.chain(pts, [0.022 * H] * (len(pts) - 1) + [0.006 * H], step=0.5)

hair_disp = lambda p: 0.0025 * H * (ridge(p.x / H * 90 + p.z / H * 30 + n3(p, 30), 2) - 0.4)
b.add('hair', D.mesh(res=0.005, smooth=2, disp=hair_disp, target=5500), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
b.add('hair_dark', Dk.mesh(res=0.005, smooth=2, disp=hair_disp, target=1200), hair_dk, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
b.add('hair_streak', O.mesh(res=0.0045, smooth=2, disp=hair_disp, target=900), streak, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# sem barba de malha: só a barba RALA pintada no rosto (face_lirio)

b.export(OUT)

# o .blend fonte (com as cores de prévia das texturas) para revisar no Blender
PREVIEW = {'arms_lirio': '#e8c0a2', 'shirt_lirio': '#2c4f8a', 'glove_lirio': '#6a4428', 'coat_lirio': '#1c2a44', 'fur_lirio': '#d6d1c8', 'face_lirio': '#e8c0a2'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'lirio.blend'), check_existing=False)
