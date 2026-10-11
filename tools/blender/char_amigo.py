"""
O AMIGO IMAGINÁRIO — public/models/amigo.glb   ("A Obra de Arte Perfeita", o chefe de O Segredo na Ilha)
Referências: wiki "Amigo Imaginário" (a arte da cinematic do corpo e a miniatura de perfil). Criatura de 2 m, CURVADA
para a frente, de coluna retorcida com ESPINHOS nas costas; um CAPUZ enorme e pontudo, fundido ao corpo, que se
estende até o chão e se rasga em TIRAS; por baixo, TENTÁCULOS negros e dois braços secos e escuros de garras. Não tem
rosto: só um buraco de onde escorre sem parar a TINTA marrom (o jorro até o chão é feito em código).
Elemento no jogo: TINTA (marrom).
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'amigo.glb'
random.seed(13)
b = Builder(width=0.9, bulk=0.86, height=1.1)  # 2 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_amigo', '#241c1a', 0.8)  # os braços secos e escuros
robe = material('robe_amigo', '#33231a', 0.9)
robe_in = material('robe_amigo_in', '#140c08', 0.9)
tent = material('tentacle_amigo', '#1c1412', 0.6)
ink = material('ink_amigo', '#5a1e10', 0.3)
hole = material('hole_amigo', '#050304', 0.9)
claw_m = material('claw_amigo', '#3a2e2a', 0.5)

M = {'skin': skin, 'face': material('face_amigo', '#070405', 0.9), 'torso': robe_in, 'hand': skin}  # o rosto: só o escuro do buraco


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


# ---------------------------------------------------------------- TRONCO magro (quase todo escondido pelo manto)
TT = [
    (-0.16, 0.15, 0.11, 0.115),
    (-0.04, 0.148, 0.108, 0.114),
    (0.08, 0.13, 0.098, 0.106),
    (0.2, 0.14, 0.104, 0.112),
    (0.32, 0.165, 0.12, 0.126),
    (0.42, 0.18, 0.124, 0.134),
    (0.5, 0.186, 0.12, 0.138),
    (0.56, 0.178, 0.11, 0.132),
    (0.6, 0.158, 0.098, 0.122),
    (0.64, 0.116, 0.08, 0.1),
    (0.675, 0.074, 0.062, 0.07),
    (0.7, 0.054, 0.05, 0.056),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def ai_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = ai_torso
# a cabeça fica escondida dentro do capuz: o "rosto" é só o buraco escuro (face_amigo)
hc = b.body(M, [], arms=(), legs=False, head_r=(0.12, 0.13, 0.15), neck_r=0.05)
HC = Vector((hc.x, hc.y, hc.z))

# ---------------------------------------------------------------- CAPUZ alto e pontudo, projetado para a frente como um
# bico, fundido ao manto; a FILEIRA DE ESPINHOS desce do alto do capuz pelas costas
def hood_pt(u, v, out=1.0):
    # u: volta (0 = lado esquerdo do rosto, passando por trás, até 1 = lado direito); v: do alto (0) até os ombros (1)
    a = (u - 0.5) * 1.8 * math.pi + math.pi
    beta = 1.55 - v * 2.1
    r = (1.25 + 0.35 * (1 - v)) * out
    # a ponta sobe alta e vai para a frente (o bico do capuz)
    tip = max(0.0, math.sin(beta)) ** 3
    p = HC + Vector((math.sin(a) * math.cos(beta) * 0.13 * H * r, -math.cos(a) * math.cos(beta) * 0.14 * H * r - tip * 0.06 * H, math.sin(beta) * 0.16 * H * r + tip * 0.14 * H))
    # embaixo o capuz se FUNDE aos ombros (desce e abre até a largura do manto, sem deixar fresta)
    k = smoothstep(0.5, 1.0, v)
    if k > 0:
        sh = torso_pt(a, 0.56, 1.0, 0.07) * out
        p = p.lerp(sh, k)
    return p


b.add('hood', grid(hood_pt, 30, 14), robe, region='head', subdiv=0)
b.add('hood_in', grid(lambda u, v: hood_pt(u, v, 0.97), 30, 14, flip=True), robe_in, region='head', subdiv=0)
# o buraco do rosto: um disco escuro fundo dentro do capuz
b.add('face_hole', ellipsoid((hc.x, hc.y - 0.1 * H, hc.z - 0.01 * H), (0.075 * H, 0.03 * H, 0.1 * H), 14, 10), hole, region='head', subdiv=0)
# a borda do capuz em volta do rosto, irregular (dentes de pano)
rim = []
for k in range(16):
    t = k / 15
    a = (t - 0.5) * 2.6
    p = HC + Vector((math.sin(a) * 0.11 * H, -0.14 * H - (1 - abs(t - 0.5) * 2) * 0.03 * H, math.cos(a) * 0.12 * H - 0.02 * H))
    rim.append(cone(tuple(p), tuple(p + Vector((0, -0.01 * H, -0.035 * H - (k % 3) * 0.012 * H))), 0.012 * H, 3))
b.add('hood_teeth', merge(*rim), robe_in, region='head', subdiv=0)
# a fileira de espinhos: do alto do capuz, descendo pelas costas
spikes = []
for k in range(9):
    t = k / 8
    if t < 0.35:
        base = hood_pt(0.5, 0.3 + t / 0.35 * 0.45, 0.98)
    else:
        base = torso_pt(math.pi, 0.62 - (t - 0.35) / 0.65 * 0.6, 1.0, 0.07)
    up = (base - Vector((0, 0, hz))).normalized() * 0.2 + Vector((0, 0.9, 0.5))
    spikes.append(cone(tuple(base - up.normalized() * 0.015 * H), tuple(base + up.normalized() * (0.08 - 0.035 * t) * H), (0.04 - 0.015 * t) * H, 5))
b.add('spikes', merge(*spikes), robe, region='torso', subdiv=0)

# FIOS DE TINTA escorrendo do buraco do rosto (o resto do jorro é feito em código: def.drips)
ink_strands = []
for k in range(7):
    x = (k - 3) * 0.018 * H
    top = Vector((hc.x + x, hc.y - 0.12 * H, hc.z - 0.06 * H))
    ln = (0.22 + 0.12 * ((k * 37) % 5) / 5) * H
    ink_strands.append(rod([top, top + Vector((0, -0.01 * H, -ln * 0.5)), top + Vector((0, -0.012 * H, -ln))], [0.008 * H, 0.006 * H, 0.002 * H], 5))
b.add('ink', merge(*ink_strands), ink, region='head', subdiv=0)

# ---------------------------------------------------------------- MANTO até o chão, que se abre em tiras rasgadas
Z_TOP, Z_BOT = 0.64, -0.95


def robe_pt(u, v, out=1.0):
    a = (u - 0.5) * TAU + math.pi
    z = Z_TOP - v * (Z_TOP - Z_BOT)
    zc = min(max(z, -0.16), 0.62)
    flare = 0.05 + max(0.0, 0.4 - z) * 0.1
    p = torso_pt(a, zc, 1.0, flare)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.5
        p.y *= 1 + (-0.16 - z) * 0.55
    # a barra RASGADA em pontas de comprimentos diferentes
    if v > 0.9:
        cut = (0.5 + 0.5 * math.sin(u * 47.0)) * (0.5 + 0.5 * math.sin(u * 13.0 + 1.3))
        p.z += cut * 0.12 * H * (v - 0.9) / 0.1
    return Vector((p.x * out, p.y * out, p.z))


def robe_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.6 * H, p.z) * 0.25
    w_hip = smoothstep(hz + 0.3 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


b.add('robe', grid(lambda u, v: robe_pt(u, v), 48, 22), robe, region='torso', weight_fn=robe_weights, subdiv=0)
b.add('robe_in', grid(lambda u, v: robe_pt(u, v, 0.985), 48, 22, flip=True), robe_in, region='torso', weight_fn=robe_weights, subdiv=0)
# a barra em TIRAS rasgadas que serpenteiam pelo chão
rags = []
for i in range(40):
    u = i / 40 + 0.01
    p = robe_pt(u, 1.0, 1.0)
    o = outward(p)
    ln = random.uniform(0.12, 0.32) * H
    w = random.uniform(0.02, 0.04) * H
    pts = []
    for k in range(5):
        t = k / 4
        side = Vector((-o.y, o.x, 0)) * math.sin(t * 6 + i) * 0.03 * H
        pts.append(p + o * ln * t + side + Vector((0, 0, -0.02 * H * t)))
    rags.append(rod(pts, [w, w * 0.8, w * 0.6, w * 0.4, 0.003 * H], 4, flat=(lambda q: Vector((0, 0, 1)), 0.25)))
b.add('robe_rags', merge(*rags), robe, region='torso', weight_fn=robe_weights, subdiv=0)
# TENTÁCULOS negros saindo de baixo do manto
tents = []
for i in range(9):
    a = (i / 9) * TAU + 0.3
    base = Vector((math.sin(a) * 0.16 * H, -math.cos(a) * 0.14 * H, hz - 0.75 * H))
    o = Vector((math.sin(a), -math.cos(a), 0))
    pts = []
    for k in range(7):
        t = k / 6
        pts.append(base + o * (0.1 + t * 0.42) * H + Vector((-o.y, o.x, 0)) * math.sin(t * 5 + i) * 0.06 * H + Vector((0, 0, -0.2 * H * t + 0.05 * H * math.sin(t * math.pi))))
    tents.append(rod(pts, [0.04 * H * (1 - 0.8 * k / 6) + 0.004 * H for k in range(7)], 6))
b.add('tentacles', merge(*tents), tent, region='torso', weight_fn=robe_weights, subdiv=0)

# ---------------------------------------------------------------- BRAÇOS secos e escuros (saem pela frente do manto) e
# as GARRAS
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    up = [(q.x, q.y, q.z, r, r) for q, r in ((s.lerp(e, t), 0.075 - 0.01 * t) for t in (0.0, 0.5, 1.0))]
    b.add('sleeve' + side, tube(up, 12), robe, region='arm' + side, subdiv=0)
    lo = [(q.x, q.y, q.z, r, r) for q, r in ((e.lerp(h, t), 0.034 - 0.008 * t) for t in (0.0, 0.5, 0.95))]
    b.add('fore' + side, tube(lo, 10), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.04), skin, region='e' + side)
    ax = (h - e).normalized()
    claws = []
    for k in range(5):
        off = Vector((sx * (k - 2) * 0.01 * H, (k - 2) * 0.004 * H, 0))
        base = h + ax * 0.045 * H + off
        claws.append(cone(tuple(base), tuple(base + ax * 0.13 * H + Vector((0, -0.03 * H, 0)) + off * 0.5), 0.008 * H, 5))
    b.add('claws' + side, merge(*claws), claw_m, region='e' + side, subdiv=0)

b.export(OUT)
