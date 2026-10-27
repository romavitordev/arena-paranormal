"""
MEMBRO DA SEITA DAS MÁSCARAS — public/models/seita.glb (as invocações da Magistrada: Chamar as Máscaras)
Referência: wiki "Seita das Máscaras" — "longas túnicas brancas com regiões pretas que ocultam boa parte de seu corpo";
as CORDAS amarradas no pescoço com NÓ DE FORCA e na cintura como cinto; Símbolos Ocultistas TATUADOS nos braços; cada
um com a sua MÁSCARA (branca, preta ou riscada de vermelho) — as máscaras são peças em código (src/models/weapons.js
seitaMask), uma por membro, no rosto escuro debaixo do capuz.
Corpo neutro e esguio (servem de qualquer um), a túnica branca até os pés, o capuz, a pelerine e a faixa pretas.
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'seita.glb'
random.seed(7)
b = Builder(width=0.94, bulk=0.9, height=1.0)
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_seita', '#b08a70', 0.8)
robe = material('robe_seita', '#ece8e0', 0.9)
robe_in = material('robe_seita_in', '#cfcac0', 0.9)
black = material('black_seita', '#18161a', 0.85)
pants = material('pants_seita', '#24222a', 0.9)
shoe = material('shoe_seita', '#141216', 0.7)
rope = material('rope_seita', '#c8b078', 0.9)
ink = material('ink_seita', '#1a1020', 0.7)

# o rosto debaixo do capuz fica na sombra (a máscara em código cobre a frente)
M = {'skin': skin, 'face': material('face_seita', '#141014', 0.9), 'torso': robe, 'hand': skin}


def lerp_table(tab, x):
    if x <= tab[0][0]:
        return tab[0][1:]
    for a, c in zip(tab, tab[1:]):
        if x <= c[0]:
            t = (x - a[0]) / (c[0] - a[0])
            return tuple(p + (q - p) * t for p, q in zip(a[1:], c[1:]))
    return tab[-1][1:]


def rod(pts, radii, seg=6):
    pts = [Vector(p) for p in pts]
    verts, faces, uvs = [], [], []
    n = len(pts)
    prev = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        side = (prev - t * prev.dot(t)) if prev is not None else t.orthogonal()
        side.normalize()
        prev = side
        up = t.cross(side)
        for s in range(seg + 1):
            a = s / seg * TAU
            verts.append(tuple(p + side * math.cos(a) * radii[i] + up * math.sin(a) * radii[i]))
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


# ---------------------------------------------------------------- TRONCO neutro e esguio
TT = [
    (-0.16, 0.17, 0.12, 0.13),
    (-0.04, 0.168, 0.118, 0.128),
    (0.08, 0.15, 0.108, 0.116),
    (0.2, 0.156, 0.114, 0.116),
    (0.32, 0.176, 0.13, 0.12),
    (0.42, 0.19, 0.132, 0.124),
    (0.5, 0.198, 0.124, 0.128),
    (0.56, 0.19, 0.114, 0.122),
    (0.6, 0.168, 0.1, 0.112),
    (0.64, 0.12, 0.082, 0.094),
    (0.675, 0.078, 0.066, 0.07),
    (0.7, 0.058, 0.054, 0.058),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def seita_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = seita_torso
hc = b.body(M, [], arms=(), legs=False, head_r=(0.122, 0.132, 0.16), neck_r=0.052)


def robe_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.6 * H, p.z) * 0.35
    w_hip = smoothstep(hz + 0.3 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    w_chest = max(0.0, 1 - w_leg - w_hip)
    return {'chest': w_chest, 'hips': w_hip, 'l' + side: w_leg}


# ---------------------------------------------------------------- BRAÇOS: manga branca larga até o cotovelo, antebraço
# à mostra com os Símbolos tatuados
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    top = s + Vector((-sx * 0.02 * H, 0, 0.005 * H))
    up = []
    for i in range(6):
        t = i / 5
        p = top.lerp(e + (e - s).normalized() * 0.03 * H, t)
        r = 0.07 + 0.03 * t  # a manga abre em sino
        up.append((p.x, p.y, p.z, r, r))
    b.add('sleeve' + side, tube(up, 14), robe, region='arm' + side, subdiv=0)
    b.add('delt' + side, ellipsoid((s.x - sx * 0.006 * H, s.y, s.z - 0.012 * H), (0.062 * H, 0.068 * H, 0.056 * H), 12, 8), robe, region='arm' + side, subdiv=0)
    lo = [(q.x, q.y, q.z, r, r * 0.95) for q, r in ((e.lerp(h, t), 0.05 - 0.01 * t) for t in (0.0, 0.3, 0.6, 0.9))]
    b.add('forearm' + side, tube(lo, 12), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.048), skin, region='e' + side)
    # tatuagens: dois anéis e as marcas do Símbolo (pontos e traços) em volta do antebraço
    marks = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.022), 0.0505, 0.05, n=1), 12) for t in (0.18, 0.72)]
    d = (h - e).normalized()
    ref = d.orthogonal().normalized()
    for k in range(7):
        a = k / 7 * TAU
        side_v = (ref * math.cos(a) + d.cross(ref) * math.sin(a)).normalized()
        c = e.lerp(h, 0.45) + side_v * 0.046 * H
        if k % 2:
            marks.append(rod([c - d * 0.03 * H, c + d * 0.03 * H], [0.006 * H, 0.006 * H], 4))
        else:
            marks.append(ellipsoid(tuple(c), (0.009 * H, 0.009 * H, 0.009 * H), 6, 4))
    b.add('tattoo' + side, merge(*marks), ink, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- PERNAS (quase não aparecem: só nos passos)
b.add('pants_hip', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.06 - v * 0.24, 1.0, 0.012), 32, 4), pants, region='torso', subdiv=0)
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    topp = Vector((l.x, l.y, l.z + 0.07 * H))
    rings = []
    for t, r in ((0.0, 0.084), (0.5, 0.078), (1.0, 0.068)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.4, 0.062), (0.9, 0.056), (0.98, 0.054)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('pants' + side, tube(rings, 12), pants, region='leg' + side, subdiv=0)
    b.add('shoe' + side, ellipsoid((f.x, f.y - 0.05 * H, f.z + 0.025 * H), (0.046 * H, 0.12 * H, 0.036 * H), 12, 8, theta_max=math.pi * 0.6), shoe, region='foot' + side, subdiv=0)
    b.add('sole' + side, sole_part((f.x, f.y - 0.05 * H, f.z - 0.006 * H), (0.095 * H, 0.24 * H, 0.02 * H), bevel=0.005), shoe, region='foot' + side, subdiv=0)

# ---------------------------------------------------------------- TÚNICA BRANCA longa, fechada, abrindo em sino até os pés
Z_TOP, Z_BOT = 0.64, -0.94


def robe_pt(u, v, out=1.0):
    a = (u - 0.5) * TAU + math.pi  # começa e fecha nas costas
    z = Z_TOP - v * (Z_TOP - Z_BOT)
    zc = min(max(z, -0.16), 0.62)
    flare = 0.022 + max(0.0, 0.06 - z) * 0.1
    p = torso_pt(a, zc, 1.0, flare)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.3
        p.y *= 1 + (-0.16 - z) * 0.34
    return Vector((p.x * out, p.y * out, p.z))


b.add('robe', grid(lambda u, v: robe_pt(u, v), 48, 22), robe, region='torso', weight_fn=robe_weights, subdiv=0)
b.add('robe_in', grid(lambda u, v: robe_pt(u, v, 0.985), 48, 22, flip=True), robe_in, region='torso', weight_fn=robe_weights, subdiv=0)

# REGIÕES PRETAS: a faixa larga descendo pela frente e pelas costas, a barra e a pelerine curta nos ombros
for name, u0, u1 in (('panel_front', 0.475, 0.525), ('panel_back', -0.06, 0.06)):
    b.add(name, grid(lambda u, v, u0=u0, u1=u1: robe_pt(u0 + (u1 - u0) * u, 0.12 + v * 0.88, 1.012), 6, 20), black, region='torso', weight_fn=robe_weights, subdiv=0)
b.add('hem', grid(lambda u, v: robe_pt(u, 0.9 + v * 0.1, 1.014), 48, 2), black, region='torso', weight_fn=robe_weights, subdiv=0)


def mantle_pt(u, v, out=1.0):
    a = (u - 0.5) * TAU + math.pi
    z = 0.66 - v * 0.15
    p = torso_pt(a, max(z, 0.5), 1.0, 0.03 + v * 0.025)
    p.z = hz + z * H
    return Vector((p.x * out, p.y * out, p.z))


b.add('mantle', grid(lambda u, v: mantle_pt(u, v), 40, 6), black, region='torso', subdiv=0)
b.add('mantle_in', grid(lambda u, v: mantle_pt(u, v, 0.975), 40, 6, flip=True), black, region='torso', subdiv=0)
# franja curta na borda da pelerine
fr = [cone(tuple(mantle_pt(i / 47, 1.0)), tuple(mantle_pt(i / 47, 1.0) + Vector((0, 0, -0.03 * H))), 0.008 * H, 3) for i in range(48)]
b.add('mantle_fringe', merge(*fr), black, region='torso', subdiv=0)

# ---------------------------------------------------------------- CAPUZ branco, aberto na frente (o rosto fica na sombra)
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.01))
HR = (0.15 * H, 0.16 * H, 0.18 * H)
OPEN = 0.26  # fração da volta aberta na frente


def hood_pt(u, v, out=1.0):
    a = (OPEN / 2 + u * (1 - OPEN)) * TAU  # 0 = frente (−y), dá a volta pelas costas
    el = math.pi / 2 - v * math.pi * 0.78  # do alto da cabeça até o pescoço
    r = math.cos(el)
    x = math.sin(a) * r * HR[0]
    y = -math.cos(a) * r * HR[1]
    z = math.sin(el) * HR[2]
    p = HC + Vector((x, y, z)) * out
    if v > 0.55:  # embaixo, o capuz cai sobre os ombros
        k = (v - 0.55) / 0.45
        p += Vector((x, y, 0)).normalized() * k * 0.07 * H
    p.y += 0.012 * H  # um pouco para trás: a borda da frente não encosta na máscara
    return p


b.add('hood', grid(lambda u, v: hood_pt(u, v), 30, 12), robe, region='head', subdiv=0)
b.add('hood_in', grid(lambda u, v: hood_pt(u, v, 0.96), 30, 12, flip=True), black, region='head', subdiv=0)
# a dobra grossa da borda do capuz
edge = [hood_pt(0.0, v / 12, 1.01) for v in range(13)][::-1] + [hood_pt(1.0, v / 12, 1.01) for v in range(13)]
b.add('hood_edge', rod(edge, [0.014 * H] * len(edge), 6), black, region='head', subdiv=0)

# ---------------------------------------------------------------- CORDAS: nó de forca no pescoço, corda na cintura
noose = [torso_pt((k / 24 - 0.5) * TAU, 0.69, 1.0, 0.016) + Vector((0, 0, 0.02 * H)) for k in range(25)]
knot = torso_pt(0, 0.6, 1.0, 0.05)
coils = [tube([(knot.x, knot.y, knot.z - k * 0.022 * H, 0.03 * H, 0.024 * H), (knot.x, knot.y, knot.z - k * 0.022 * H - 0.016 * H, 0.03 * H, 0.024 * H)], 10) for k in range(5)]
tail = rod([knot + Vector((0, 0, -0.11 * H)), knot + Vector((0.005 * H, -0.004 * H, -0.2 * H)), knot + Vector((0.0, -0.002 * H, -0.3 * H))], [0.013 * H, 0.012 * H, 0.01 * H], 6)
b.add('noose', merge(rod(noose, [0.012 * H] * 25, 6), *coils, tail), rope, region='torso', subdiv=0)
belt = [torso_pt((k / 28 - 0.5) * TAU, 0.08, 1.0, 0.03) for k in range(29)]
bk = torso_pt(0.18, 0.08, 1.0, 0.04)
b.add('belt_rope', merge(rod(belt, [0.015 * H] * 29, 6), ellipsoid(tuple(bk), (0.026 * H, 0.017 * H, 0.026 * H), 8, 6),
                         rod([bk, bk + Vector((0.005 * H, -0.008 * H, -0.14 * H)), bk + Vector((0.0, -0.012 * H, -0.3 * H))], [0.013 * H, 0.012 * H, 0.01 * H], 6)), rope,
      region='torso', weight_fn=robe_weights, subdiv=0)

b.export(OUT)
