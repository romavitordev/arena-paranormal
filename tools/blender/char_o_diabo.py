"""
O DIABO (o de Ordem Paranormal) — public/models/o_diabo.glb
Referência do usuário (a miniatura do Diabo): pele VERMELHA, dois CHIFRES altos e curvados para trás, anelados e cor
de osso, orelhas pontudas, o sorriso enorme de dentes finos (textura face_o_diabo), o MANTO PRETO com CAPUZ e os
frisos vermelhos descendo pela frente, mangas largas, mãos vermelhas de garras, pernas finas e pés de garras.
É o Diabo "normal": o Portador do Trono (a fusão com o Henri, modelo diabo.glb) é a TRANSFORMAÇÃO dele.
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'o_diabo.glb'
random.seed(66)
b = Builder(width=0.9, bulk=0.86, height=1.02)
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_o_diabo', '#a8262a', 0.7)
horn = material('horn_o_diabo', '#d8ccb0', 0.6)
horn_dk = material('horn_o_diabo_dk', '#9a8c74', 0.7)
robe = material('robe_o_diabo', '#1a1516', 0.9)
robe_in = material('robe_o_diabo_in', '#2a0a0e', 0.9)
red = material('trim_o_diabo', '#8a1418', 0.8)
claw_m = material('claw_o_diabo', '#2a1010', 0.5)

M = {'skin': skin, 'face': material('face_o_diabo', '#ffffff', 0.7), 'torso': robe, 'hand': skin}


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


# ---------------------------------------------------------------- TRONCO magro e curvado (o manto esconde quase tudo)
TT = [
    (-0.16, 0.16, 0.115, 0.12),
    (-0.04, 0.158, 0.112, 0.118),
    (0.08, 0.14, 0.104, 0.11),
    (0.2, 0.15, 0.11, 0.114),
    (0.32, 0.172, 0.122, 0.122),
    (0.42, 0.188, 0.126, 0.13),
    (0.5, 0.194, 0.122, 0.136),
    (0.56, 0.184, 0.112, 0.13),
    (0.6, 0.164, 0.1, 0.12),
    (0.64, 0.12, 0.084, 0.1),
    (0.675, 0.076, 0.066, 0.072),
    (0.7, 0.056, 0.054, 0.058),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def od_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = od_torso
hc = b.body(M, [], arms=(), legs=False, head_r=(0.128, 0.138, 0.16), neck_r=0.05)
HC = Vector((hc.x, hc.y, hc.z))
HR = (0.128 * H, 0.138 * H, 0.16 * H)

# ORELHAS pontudas para os lados
for s_ in (1, -1):
    base = HC + Vector((s_ * HR[0] * 0.95, 0.01 * H, 0.0))
    b.add(f'ear{s_}', merge(cone(tuple(base), tuple(base + Vector((s_ * 0.1 * H, 0.03 * H, 0.05 * H))), 0.03 * H, 6)), skin, region='head', subdiv=0)

# CHIFRES altos, curvados para trás e anelados (bege), saindo do alto da testa
horn_rings = []
for s_ in (1, -1):
    pts, rad = [], []
    for k in range(10):
        t = k / 9
        p = HC + Vector((s_ * (0.06 + 0.05 * t) * H, (-0.07 + 0.3 * t ** 1.6) * H, (0.12 + 0.28 * t - 0.05 * t * t) * H))
        pts.append(p)
        rad.append((0.034 * (1 - t) ** 0.9 + 0.003) * H)
    b.add(f'horn{s_}', rod(pts, rad, 8), horn, region='head', subdiv=0)
    for k in range(1, 8):
        t = k / 9
        q = pts[k]
        horn_rings.append(rod([q - (pts[k + 1] - q).normalized() * 0.006 * H, q + (pts[k + 1] - q).normalized() * 0.006 * H], [rad[k] * 1.12] * 2, 8))
b.add('horn_ridges', merge(*horn_rings), horn_dk, region='head', subdiv=0)

# ---------------------------------------------------------------- MANTO PRETO com CAPUZ (os chifres atravessam) e os
# frisos vermelhos descendo pela frente e nas mangas
def hood_pt(u, v):
    # casca atrás e dos lados da cabeça, aberta na frente; desce até os ombros
    a = (u - 0.5) * 1.55 * math.pi + math.pi
    beta = 1.5 - v * 2.3
    r = 1.14 + 0.05 * v
    p = HC + Vector((math.sin(a) * math.cos(beta) * HR[0] * r, -math.cos(a) * math.cos(beta) * HR[1] * r + 0.02 * H, math.sin(beta) * HR[2] * r * 1.05))
    return p


b.add('hood', grid(hood_pt, 26, 10), robe, region='head', subdiv=0)
b.add('hood_in', grid(lambda u, v: HC + (hood_pt(u, v) - HC) * 0.97, 26, 10, flip=True), robe_in, region='head', subdiv=0)
b.add('hood_trim', merge(*[rod([hood_pt(eu, v / 10) for v in range(11)], [0.008 * H] * 11, 5) for eu in (0.0, 1.0)]), red, region='head', subdiv=0)

GAP = -0.03  # negativo: as abas da frente se sobrepõem (o manto fica fechado e não mostra as pernas)
Z_TOP, Z_BOT = 0.64, -0.86


def robe_pt(u, v, out=1.0):
    a = (u - 0.5) * (1 - 2 * GAP) * TAU + math.pi
    z = Z_TOP - v * (Z_TOP - Z_BOT)
    zc = min(max(z, -0.16), 0.62)
    flare = 0.03 + max(0.0, 0.2 - z) * 0.11 + 0.01 * smoothstep(0.85, 1.0, u)  # a aba de cima passa por fora
    p = torso_pt(a, zc, 1.0, flare)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.2
        p.y *= 1 + (-0.16 - z) * 0.24
    # barra rasgada em pontas
    if v > 0.96:
        p.z -= (0.02 + 0.03 * (math.sin(u * 60) * 0.5 + 0.5)) * H
    return Vector((p.x * out, p.y * out, p.z))


def robe_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.55 * H, p.z) * 0.45
    w_hip = smoothstep(hz + 0.25 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


b.add('robe', grid(lambda u, v: robe_pt(u, v), 44, 22), robe, region='torso', weight_fn=robe_weights, subdiv=0)
b.add('robe_in', grid(lambda u, v: robe_pt(u, v, 0.985), 44, 22, flip=True), robe_in, region='torso', weight_fn=robe_weights, subdiv=0)
# frisos vermelhos: as duas bordas da frente e duas listras paralelas descendo do peito
trims = [rod([robe_pt(eu, v / 22, 1.012) for v in range(23)], [0.009 * H] * 23, 5) for eu in (0.0, 1.0)]
for off in (0.05, 0.95):
    trims.append(rod([robe_pt(off, v / 22, 1.014) for v in range(4, 23)], [0.006 * H] * 19, 4))
b.add('robe_trim', merge(*trims), red, region='torso', weight_fn=robe_weights, subdiv=0)
# faixa vermelha na cintura
b.add('sash', rod([torso_pt((k / 28 - 0.5) * TAU, 0.06, 1.0, 0.05) for k in range(29)], [0.016 * H] * 29, 6), red, region='torso', subdiv=0)

# ---------------------------------------------------------------- BRAÇOS: mangas largas pretas com friso vermelho, mãos
# vermelhas com GARRAS
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    up = [(q.x, q.y, q.z, r, r) for q, r in ((s.lerp(e, t), 0.07 + 0.006 * t) for t in (0.0, 0.5, 1.0))]
    b.add('sleeve' + side, tube(up, 14), robe, region='arm' + side, subdiv=0)
    lo = [(q.x, q.y, q.z, r, r * 0.95) for q, r in ((e.lerp(h, t), 0.076 + 0.03 * t) for t in (0.0, 0.4, 0.8))]
    b.add('sleeve_lo' + side, tube(lo, 14, cap_end=False), robe, region='e' + side, subdiv=0)
    b.add('cuff' + side, tube(limb_rings(e.lerp(h, 0.74), e.lerp(h, 0.79), 0.1, 0.101, n=1), 14, cap_start=False, cap_end=False), red, region='e' + side, subdiv=0)
    b.add('sleeve_in' + side, tube([(q[0], q[1], q[2], q[3] * 0.96, q[4] * 0.96) for q in lo[1:]], 14, cap_start=False, cap_end=False), robe_in, region='e' + side, subdiv=0)
    fr = [(q.x, q.y, q.z, r, r) for q, r in ((e.lerp(h, t), 0.04 - 0.006 * t) for t in (0.4, 0.95))]
    b.add('wrist' + side, tube(fr, 10), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.05), skin, region='e' + side)
    ax = (h - e).normalized()
    claws = []
    for k in range(5):
        off = Vector((sx * (k - 2) * 0.013 * H, (k - 2) * 0.005 * H, 0))
        base = h + ax * 0.055 * H + off
        claws.append(cone(tuple(base), tuple(base + ax * 0.08 * H + Vector((0, -0.03 * H, 0))), 0.008 * H, 5))
    b.add('claws' + side, merge(*claws), claw_m, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- PERNAS finas e PÉS de garras (aparecem embaixo do manto)
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    topp = Vector((l.x, l.y, l.z + 0.05 * H))
    rings = []
    for t, r in ((0.0, 0.07), (0.5, 0.062), (1.0, 0.05)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.4, 0.044), (0.8, 0.036), (1.0, 0.034)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('leg' + side, tube(rings, 12), skin, region='leg' + side, subdiv=0)
    b.add('foot' + side, ellipsoid((f.x, f.y - 0.05 * H, f.z + 0.025 * H), (0.045 * H, 0.1 * H, 0.03 * H), 10, 8), skin, region='foot' + side, subdiv=0)
    toes = []
    for t in (-1, 0, 1):
        base = Vector((f.x + t * 0.025 * H, f.y - 0.13 * H, f.z + 0.02 * H))
        toes.append(cone(tuple(base), tuple(base + Vector((t * 0.01 * H, -0.06 * H, -0.02 * H))), 0.012 * H, 5))
    b.add('toes' + side, merge(*toes), claw_m, region='foot' + side, subdiv=0)

b.export(OUT)
