"""
LABIRINTO — public/models/labirinto.glb
Referências (pasta Labirinto: "labirinto", "sem mascara", "de mascara", close cinematográfico): 1,95 m, MAGRO e de
ombros ossudos, pele pálida acinzentada coberta de cicatrizes finas em labirinto (textura skin_labirinto /
face_labirinto), cabeça RASPADA com orelhas de abano, olhos cinzentos e caídos, pescoço comprido.
ROBE verde-oliva gasto e TRANSPASSADO: decote fundo em V com as bordas rasgadas, farrapos espetados nos ombros, mangas
LARGAS até o punho com a barra esfiapada; uma CORDA atravessa o peito do ombro esquerdo até o quadril direito e dá duas
voltas na cintura com o nó na frente; barra rasgada em tiras até o joelho e, por baixo, a saia de retalhos desenhados
com labirintos. Descalço, pés sujos de sangue.
prop_helmetOn: o elmo de ferro arranhado com o SORRISO enorme (textura helmet_labirinto), gola rebitada e papéis com
labirintos colados caindo até o peito — aparece com o Capacete do ??? e no especial.
A Antena (lança com parabólica) é adicionada em código.
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'labirinto.glb'
random.seed(4)
b = Builder(width=0.92, bulk=0.86, height=1.085)  # 1,95 m (o mais alto)
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_labirinto', '#ffffff', 0.8)  # pele pálida com o labirinto escarificado (textura)
feet_m = material('feet_labirinto', '#8a5a4a', 0.9)  # sola suja de sangue
robe = material('tunic_green', '#566a36', 0.95)
robe_in = material('tunic_green_in', '#262c1a', 0.95)
robe_d = material('tunic_green_dark', '#3e4c28', 0.95)
rope = material('rope', '#6a5236', 0.9)
patch = material('patch_skirt', '#ffffff', 0.9)  # retalhos desenhados (textura)
helm = material('helmet_labirinto', '#ffffff', 0.45, metal=0.5)
paper = material('paper_maze', '#ffffff', 0.9)

M = {'skin': skin, 'face': material('face_labirinto', '#ffffff', 0.8), 'torso': skin, 'hand': skin}


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


# ---------------------------------------------------------------- TRONCO magro, ombros ossudos
TT = [
    (-0.16, 0.15, 0.11, 0.112),
    (-0.04, 0.152, 0.11, 0.114),
    (0.08, 0.146, 0.106, 0.11),
    (0.2, 0.156, 0.11, 0.114),
    (0.32, 0.18, 0.12, 0.122),
    (0.42, 0.198, 0.124, 0.128),
    (0.5, 0.206, 0.122, 0.13),
    (0.56, 0.196, 0.112, 0.124),
    (0.6, 0.172, 0.1, 0.114),
    (0.64, 0.126, 0.084, 0.096),
    (0.675, 0.08, 0.066, 0.072),
    (0.7, 0.058, 0.054, 0.058),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def lab_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = lab_torso
hc = b.body(M, [], arms=(), legs=False, head_r=(0.126, 0.138, 0.158), neck_r=0.05)

# orelhas de abano (a cabeça raspada deixa as orelhas bem à mostra)
for s_ in (1, -1):
    ear = ellipsoid((hc.x + s_ * 0.127 * H, hc.y + 0.012 * H, hc.z - 0.004 * H), (0.014 * H, 0.03 * H, 0.046 * H), 10, 8)
    b.add(f'ear{s_}', xform(ear, lambda p, s_=s_: Vector((p.x + s_ * max(0.0, p.y - hc.y) * 0.25, p.y, p.z))), skin, region='head', subdiv=0)

# ---------------------------------------------------------------- ROBE transpassado: V fundo no peito, até o joelho
Z_TOP, Z_BOT = 0.635, -0.44


def robe_gap(z):
    # abertura (fração de cada lado) — fundo V do pescoço até o meio do peito; fechado (transpassado) abaixo
    return -0.035 + 0.12 * smoothstep(0.26, 0.62, z) ** 0.8  # negativo = as abas se sobrepõem


def robe_pt(u, v, out=1.0):
    z = Z_TOP - v * (Z_TOP - Z_BOT)
    g = robe_gap(z)
    a = (u - 0.5) * (1 - 2 * g) * TAU + math.pi
    zc = max(z, -0.16)
    flare = max(0.0, -z) * 0.09 + 0.024
    lap = 0.012 * smoothstep(0.85, 1.0, u)  # a aba de cima (a ponta u≈1) passa POR FORA da de baixo
    p = torso_pt(a, zc, 1.0, 0.026 + flare + lap)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.14
        p.y *= 1 + (-0.16 - z) * 0.16
    return Vector((p.x * out, p.y * out, p.z))


def robe_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.45 * H, p.z) * 0.45
    w_hip = smoothstep(hz + 0.25 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    w_chest = max(0.0, 1 - w_leg - w_hip)
    return {'chest': w_chest, 'hips': w_hip, 'l' + side: w_leg}


b.add('robe', grid(lambda u, v: robe_pt(u, v), 44, 18), robe, region='torso', weight_fn=robe_weights, subdiv=0)
b.add('robe_in', grid(lambda u, v: robe_pt(u, v, 0.985), 44, 18, flip=True), robe_in, region='torso', weight_fn=robe_weights, subdiv=0)
# a aba de cima do transpasse: dobra mais escura descendo do ombro esquerdo até a cintura do lado direito
flap = [robe_pt(1.0, v / 10, 1.012).lerp(robe_pt(0.47, 0.62, 1.012), max(0.0, (v / 10 - 0.25) / 0.75) ** 1.4) for v in range(11)]
b.add('robe_fold', rod(flap, [0.012 * H] * 11, 5, flat=(outward, 0.4)), robe_d, region='torso', weight_fn=robe_weights, subdiv=0)
# bordas RASGADAS do decote: farrapos pontudos caindo para dentro
rags = []
for edge_u in (0.0, 1.0):
    for k in range(9):
        v = 0.02 + k * 0.03
        p = robe_pt(edge_u, v, 1.01)
        d = Vector((-p.x, -p.y, 0)).normalized() * 0.028 * H + Vector((0, 0, -0.03 * H))
        rags.append(cone(tuple(p), tuple(p + d * random.uniform(0.7, 1.3)), 0.016 * H, 3))
# farrapos espetados nos ombros e na gola (a silhueta rasgada da arte)
for k in range(16):
    side = 1 if k < 8 else -1
    t = (k % 8) / 7
    base = torso_pt(side * (1.0 + 0.9 * t), 0.6 - 0.04 * t, 1.0, 0.05)
    tip = base + Vector((side * random.uniform(0.04, 0.08) * H, random.uniform(-0.01, 0.03) * H, random.uniform(0.0, 0.05) * H))
    rags.append(cone(tuple(base), tuple(tip), 0.022 * H, 3))
b.add('robe_rags', merge(*rags), robe, region='torso', subdiv=0)
# barra rasgada em tiras de comprimentos diferentes
strips = []
for i in range(30):
    u = i / 29
    p = robe_pt(u, 1.0, 1.0)
    ln = random.uniform(0.04, 0.13) * H
    w = random.uniform(0.022, 0.034) * H
    o = outward(p)
    strips.append(rod([p, p + o * 0.004 * H + Vector((0, 0, -ln * 0.6)), p + o * 0.008 * H + Vector((0, 0, -ln))], [w, w * 0.75, 0.004 * H], 4, flat=(outward, 0.18)))
b.add('robe_strips', merge(*strips), robe_d, region='torso', weight_fn=robe_weights, subdiv=0)

# saia de retalhos por baixo, aparecendo entre as tiras até a canela
b.add('patch_skirt', grid(lambda u, v: robe_pt(u, 0.55 + v * 0.45, 0.96) + Vector((0, 0, -v * 0.14 * H)), 32, 6),
      patch, region='torso', weight_fn=robe_weights, subdiv=0)

# ---------------------------------------------------------------- MANGAS largas até o punho, barra esfiapada
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    top = s + Vector((-sx * 0.02 * H, 0, 0.005 * H))
    up = []
    for i in range(6):
        t = i / 5
        p = top.lerp(e, t)
        r = 0.074 + 0.01 * math.sin(t * math.pi) + 0.006 * t
        up.append((p.x, p.y, p.z, r, r))
    b.add('sleeve' + side, tube(up, 14), robe, region='arm' + side, subdiv=0)
    b.add('delt' + side, ellipsoid((s.x - sx * 0.006 * H, s.y, s.z - 0.012 * H), (0.064 * H, 0.07 * H, 0.06 * H), 12, 8), robe, region='arm' + side, subdiv=0)
    lo = []
    for i in range(6):
        t = i / 5 * 0.9
        p = e.lerp(h, t)
        r = 0.08 + 0.04 * t ** 1.5  # alarga até o punho (manga de robe)
        lo.append((p.x, p.y, p.z, r, r * 0.95))
    b.add('sleeve_lo' + side, tube(lo, 14, cap_end=False), robe, region='e' + side, subdiv=0)
    b.add('sleeve_in' + side, tube([(q[0], q[1], q[2], q[3] * 0.96, q[4] * 0.96) for q in lo[-3:]], 14, cap_start=False, cap_end=False), robe_in, region='e' + side, subdiv=0)
    tails = []
    end = e.lerp(h, 0.9)
    ax = (h - e).normalized()
    ref = Vector((0, 0, 1)) if abs(ax.z) < 0.9 else Vector((1, 0, 0))
    u1 = ax.cross(ref).normalized()
    u2 = ax.cross(u1).normalized()
    for k in range(9):
        a = k / 9 * TAU + random.random() * 0.3
        p = end + (u1 * math.cos(a) + u2 * math.sin(a)) * 0.112
        tails.append(cone(tuple(p), tuple(p + ax * random.uniform(0.02, 0.045) + Vector((0, 0, -0.012))), 0.016, 3))
    b.add('sleevetails' + side, merge(*tails), robe_d, region='e' + side, subdiv=0)
    # antebraço magro aparecendo dentro da manga + mão
    fr = [(q.x, q.y, q.z, r, r * 0.92) for q, r in ((e.lerp(h, t), 0.05 - 0.01 * t) for t in (0.3, 0.6, 0.94))]
    b.add('forearm' + side, tube(fr, 10), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.054), skin, region='e' + side)

# ---------------------------------------------------------------- CORDAS: diagonal do ombro esquerdo ao quadril direito,
# passando pelas costas, e duas voltas na cintura com o nó na frente
diag = []
N = 40
for k in range(N + 1):
    t = k / N
    a = 1.15 - t * TAU
    z = 0.62 - (0.52 * t / 0.42 if t < 0.42 else 0.52 * (1 - (t - 0.42) / 0.58))
    diag.append(torso_pt(a, z, 1.0, 0.062))
b.add('rope_diag', rod(diag, [0.014 * H] * (N + 1), 6), rope, region='torso', subdiv=0)
belts = []
for zb in (0.07, 0.12):
    belts.append(rod([torso_pt((k / 32 - 0.5) * TAU, zb, 1.0, 0.062) for k in range(33)], [0.014 * H] * 33, 6))
kn = torso_pt(-0.25, 0.095, 1.0, 0.075)
belts.append(ellipsoid(tuple(kn), (0.026 * H, 0.018 * H, 0.026 * H), 8, 6))
belts.append(rod([kn, kn + Vector((-0.01 * H, -0.006 * H, -0.12 * H)), kn + Vector((0.0, -0.01 * H, -0.24 * H))], [0.012 * H, 0.011 * H, 0.008 * H], 5))
belts.append(rod([kn, kn + Vector((0.02 * H, -0.006 * H, -0.1 * H)), kn + Vector((0.03 * H, -0.01 * H, -0.18 * H))], [0.012 * H, 0.011 * H, 0.008 * H], 5))
b.add('rope_belt', merge(*belts), rope, region='torso', subdiv=0)
# trouxa de palha nas costas (onde a Antena fica encostada)
bk = torso_pt(math.pi - 0.3, 0.38, 1.0, 0.1)
b.add('back_basket', ellipsoid(tuple(bk), (0.08 * H, 0.05 * H, 0.11 * H), 10, 8), rope, region='torso', subdiv=0)

# ---------------------------------------------------------------- PERNAS magras e pés descalços
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    topp = Vector((l.x, l.y, l.z + 0.05 * H))
    rings = []
    for t, r in ((0.0, 0.074), (0.4, 0.068), (0.8, 0.056), (1.0, 0.052)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.3, 0.05), (0.65, 0.042), (0.9, 0.036), (1.0, 0.036)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('leg' + side, tube(rings, 12), skin, region='leg' + side, subdiv=0)
    b.add('foot' + side, ellipsoid((f.x, f.y - 0.05 * H, f.z + 0.02 * H), (0.044 * H, 0.12 * H, 0.032 * H), 12, 8), feet_m, region='foot' + side, subdiv=0)

# ---------------------------------------------------------------- ELMO do sorriso (prop): esfera de ferro + papéis colados
helmet = ellipsoid((hc.x, hc.y, hc.z + 0.005), (0.162 * H, 0.176 * H, 0.176 * H), 24, 16, theta_max=math.pi * 0.86)
papers = []
for i in range(9):
    a = math.pi * 0.35 + (i / 8) * math.pi * 1.3
    x, y = math.sin(a) * 0.15 * H, -math.cos(a) * 0.15 * H
    ln = (0.12 + random.random() * 0.12) * H
    papers.append(box((x, y, hc.z - 0.16 * H - ln / 2), (0.05, 0.004, ln)))
# gola de metal rebitada fechando o pescoço (parte do elmo)
gorget = [tube([(0, 0, 1.57 * H, 0.1 * H, 0.095 * H), (0, 0, 1.63 * H, 0.092 * H, 0.088 * H), (0, 0, 1.66 * H, 0.08 * H, 0.078 * H)], 20)]
for i in range(14):
    a = i / 14 * TAU
    gorget.append(ellipsoid((math.sin(a) * 0.101 * H, -math.cos(a) * 0.096 * H, 1.595 * H), (0.008, 0.008, 0.008), 5, 4))
b.add('prop_helmetOn', merge(helmet, *gorget), helm, region='head', subdiv=0)
b.add('prop_helmetOn_papers', merge(*papers), paper, region='head', subdiv=0)

# acabamento da técnica atual (sculpt_lib, 2026-10-31): as dobras do pano em relevo
import sculpt_lib
sculpt_lib.cloth_pass(b.parts, ['tunic_green', 'patch_skirt'], H)
b.export(OUT)
