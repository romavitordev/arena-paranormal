"""
O ESTRANGEIRO — public/models/estrangeiro.glb
Referências: wiki "Estrangeiro" (a arte do Livro de Regras e a miniatura de Sinais do Outro Lado). A criatura de
Transmissão que abduz, apaga memórias e comanda: humanoide MAGRO de 2,5 m; o rosto é uma MÁSCARA cinza em forma de
cabeça humana, com dois grandes olhos VERDES acesos e uma divisão que a separa em duas; vários FIOS saem da máscara e
se ligam ao corpo. Capa enorme esverdeada dos ombros (quadrados, com grandes ombreiras por baixo) até o chão; no
torso, uma roupa metálica esverdeada com detalhes pretos e formas verdes acesas; da cintura para baixo, um manto que
cobre as pernas (ele parece flutuar); cordas verdes na cintura. Os braços são a única pele à mostra: longos, magros,
cinzentos, com braceletes verdes e CINCO GARRAS enormes em cada mão.
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'estrangeiro.glb'
random.seed(7)
b = Builder(width=0.86, bulk=0.82, height=1.2)  # 2,5 m — o mais alto do jogo
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_estrangeiro', '#9a9a8e', 0.7)
armor = material('armor_estrangeiro', '#4e5a3e', 0.4, metal=0.6)
green = material('cord_estrangeiro', '#5a7a34', 0.7)
dark = material('cable_estrangeiro', '#16181a', 0.6)
cape = material('cape_estrangeiro', '#4a5236', 0.9)
cape_in = material('cape_estrangeiro_in', '#262a1c', 0.9)
robe = material('robe_estrangeiro', '#2c3022', 0.9)
claw_m = material('claw_estrangeiro', '#d8d6c8', 0.5)
glow = material('eyeglow_estrangeiro', '#9aff5a', 0.4, emission='#7aff3a', strength=3)

M = {'skin': skin, 'face': material('face_estrangeiro', '#ffffff', 0.5), 'torso': armor, 'hand': skin}


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


# ---------------------------------------------------------------- TRONCO magro e comprido (o corpo quase não aparece)
TT = [
    (-0.16, 0.15, 0.11, 0.115),
    (-0.04, 0.148, 0.108, 0.114),
    (0.08, 0.13, 0.098, 0.104),
    (0.2, 0.14, 0.104, 0.108),
    (0.32, 0.168, 0.12, 0.118),
    (0.42, 0.186, 0.124, 0.122),
    (0.5, 0.196, 0.12, 0.124),
    (0.56, 0.19, 0.11, 0.118),
    (0.6, 0.17, 0.098, 0.108),
    (0.64, 0.12, 0.08, 0.09),
    (0.675, 0.074, 0.062, 0.066),
    (0.7, 0.054, 0.05, 0.054),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def est_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = est_torso
# a cabeça é a MÁSCARA: cinza, comprida, "em forma de cabeça humana" (face_estrangeiro)
hc = b.body(M, [], arms=(), legs=False, head_r=(0.118, 0.13, 0.17), neck_r=0.046)

# OLHOS: dois olhos verdes grandes e amendoados, acesos, na frente da máscara
for s_ in (1, -1):
    eye = ellipsoid((hc.x + s_ * 0.048 * H, hc.y - 0.128 * H, hc.z + 0.02 * H), (0.034 * H, 0.012 * H, 0.018 * H), 12, 8)
    b.add(f'eye{s_}', xform(eye, lambda p, s_=s_: Vector((p.x, p.y, p.z + (p.x - (hc.x + s_ * 0.048 * H)) * 0.45 * s_))), glow, region='head', subdiv=0)
# a divisão que separa a máscara em duas (friso escuro do alto da cabeça até o queixo, pela frente)
split = []
for i in range(13):
    t = i / 12
    beta = 1.45 - t * 2.45  # do topo até embaixo do queixo
    split.append(Vector((hc.x, hc.y - math.cos(beta) * 0.137 * H, hc.z + math.sin(beta) * 0.176 * H)))
b.add('mask_split', rod(split, [0.006 * H] * 13, 5), dark, region='head', subdiv=0)

# FIOS que saem da máscara e se ligam ao corpo (atrás e dos lados da cabeça até os ombros e o peito)
cables = []
random.seed(9)
for i in range(18):
    a = math.pi * 0.35 + (i / 17) * math.pi * 1.3
    root = Vector((hc.x + math.sin(a) * 0.12 * H, hc.y - math.cos(a) * 0.13 * H, hc.z + random.uniform(-0.04, 0.08) * H))
    end = torso_pt(a + random.uniform(-0.2, 0.2), random.uniform(0.5, 0.62), 1.0, 0.03)
    mid = root.lerp(end, 0.5) + Vector((math.sin(a) * 0.03 * H, -math.cos(a) * 0.03 * H, -0.03 * H))
    cables.append(rod([root, mid, end], [0.009 * H, 0.009 * H, 0.008 * H], 5))
b.add('cables', merge(*cables), dark, region='torso', subdiv=0)

# ---------------------------------------------------------------- BRAÇOS longos e magros de pele cinzenta, braceletes
# verdes e CINCO GARRAS enormes em cada mão
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    up = [(q.x, q.y, q.z, r, r) for q, r in ((s.lerp(e, t), 0.05 - 0.008 * t) for t in (0.0, 0.5, 1.0))]
    b.add('arm' + side, tube(up, 12), skin, region='arm' + side, subdiv=0)
    lo = [(q.x, q.y, q.z, r, r) for q, r in ((e.lerp(h, t), 0.042 - 0.008 * t) for t in (0.0, 0.5, 0.95))]
    b.add('fore' + side, tube(lo, 12), skin, region='e' + side, subdiv=0)
    bands = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.07), 0.05, 0.048, n=1), 12) for t in (0.18, 0.3, 0.42)]
    b.add('bracer' + side, merge(*bands), green, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.046), skin, region='e' + side)
    ax = (h - e).normalized()
    claws = []
    for k in range(5):
        off = Vector((sx * (k - 2) * 0.012 * H, (k - 2) * 0.004 * H, 0))
        base = h + ax * 0.05 * H + off
        tip = base + ax * 0.2 * H + Vector((0, -0.04 * H, 0)) + off * 0.6
        claws.append(cone(tuple(base), tuple(tip), 0.009 * H, 5))
    b.add('claws' + side, merge(*claws), claw_m, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- ARMADURA do torso: metal esverdeado com detalhes
# pretos, formas verdes acesas no peito e as tiras pretas cruzadas no alto
b.add('armor', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.66 - v * 0.6, 1.0, 0.012), 32, 8), armor, region='torso', subdiv=0)
leafs = []
for sx, z, sc in ((1, 0.46, 1.0), (-1, 0.46, 1.0), (1, 0.3, 0.8), (-1, 0.3, 0.8), (0, 0.38, 1.2)):
    p = torso_pt(sx * 0.32, z, 1.0, 0.024)
    leafs.append(xform(ellipsoid(tuple(p), (0.018 * H * sc, 0.008 * H, 0.05 * H * sc), 8, 6), lambda q, p=p, sx=sx: Vector((q.x + (q.z - p.z) * 0.25 * sx, q.y, q.z))))
b.add('chest_glow', merge(*leafs), glow, region='torso', subdiv=0)
xs = [rod([torso_pt(sx * 1.0, 0.64, 1.0, 0.02), torso_pt(0, 0.54, 1.0, 0.03), torso_pt(-sx * 0.6, 0.42, 1.0, 0.024)], [0.01 * H] * 3, 5) for sx in (1, -1)]
b.add('straps', merge(*xs), dark, region='torso', subdiv=0)
# cordas verdes dando duas voltas na cintura, com a ponta pendurada
belts = [rod([torso_pt((k / 28 - 0.5) * TAU, zb, 1.0, 0.03) for k in range(29)], [0.012 * H] * 29, 6) for zb in (0.08, 0.12)]
kn = torso_pt(-0.25, 0.1, 1.0, 0.04)
belts.append(rod([kn, kn + Vector((0, -0.006 * H, -0.14 * H)), kn + Vector((0.006 * H, -0.01 * H, -0.3 * H))], [0.011 * H, 0.01 * H, 0.008 * H], 6))
b.add('belt', merge(*belts), green, region='torso', subdiv=0)

# ---------------------------------------------------------------- MANTO longo da cintura até o chão (cobre as pernas:
# ele parece FLUTUAR) e a CAPA enorme dos ombros quadrados até o chão, aberta na frente
def robe_pt(u, v, out=1.0):
    a = (u - 0.5) * TAU + math.pi
    z = 0.06 - v * 1.02
    p = torso_pt(a, max(z, -0.16), 1.0, 0.02 + max(0.0, -z) * 0.05)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.28
        p.y *= 1 + (-0.16 - z) * 0.3
    return Vector((p.x * out, p.y * out, p.z))


def robe_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.1 * H, hz - 0.7 * H, p.z) * 0.25
    return {'hips': 1 - w_leg, 'l' + side: w_leg}


b.add('robe', grid(robe_pt, 36, 14), robe, region='torso', weight_fn=robe_weights, subdiv=0)
CGAP = 0.15


def cape_pt(u, v, out=1.0):
    a = (u - 0.5) * (1 - 2 * CGAP) * TAU + math.pi
    z = 0.66 - v * 1.66
    zc = min(max(z, -0.16), 0.62)
    # ombros QUADRADOS e largos (as ombreiras por baixo): no alto a capa sai bem para os lados
    shoulder = 0.12 * smoothstep(0.4, 0.62, z) * abs(math.sin(a))
    flare = 0.06 + shoulder + max(0.0, 0.3 - z) * 0.08
    p = torso_pt(a, zc, 1.0, flare)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.4
        p.y *= 1 + (-0.16 - z) * 0.45
    return Vector((p.x * out, p.y * out, p.z))


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.1 * H, hz - 0.7 * H, p.z) * 0.25
    w_hip = smoothstep(hz + 0.3 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


b.add('cape', grid(lambda u, v: cape_pt(u, v), 48, 22), cape, region='torso', weight_fn=cape_weights, subdiv=0)
b.add('cape_in', grid(lambda u, v: cape_pt(u, v, 0.985), 48, 22, flip=True), cape_in, region='torso', weight_fn=cape_weights, subdiv=0)
# ombreiras grandes por baixo da capa (aparecem na abertura)
for sx in (1, -1):
    s = sk['sL' if sx > 0 else 'sR']
    b.add(f'pauldron{sx}', box((s.x + sx * 0.04 * H, s.y, s.z + 0.03 * H), (0.13 * H, 0.15 * H, 0.04 * H), bevel=0.01), armor, region='torso', subdiv=0)
# a gola alta da capa, subindo atrás do pescoço
b.add('cape_collar', grid(lambda u, v: torso_pt((u - 0.5) * 1.5 * math.pi + math.pi, 0.64, 1.0, 0.07) + Vector((0, 0.01 * H * v, v * 0.12 * H)), 24, 3), cape, region='torso', subdiv=0)

b.export(OUT)
