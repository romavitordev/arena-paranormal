"""
O AMIGO IMAGINÁRIO — public/models/amigo.glb   ("A Obra de Arte Perfeita", o chefe de O Segredo na Ilha)
Referências: wiki "Amigo Imaginário" (a arte da cinematic do corpo e a miniatura de perfil). Criatura de 2 m, CURVADA
para a frente, de coluna retorcida com ESPINHOS nas costas; um CAPUZ enorme e pontudo, fundido ao corpo, que se
estende até o chão e se rasga em TIRAS; por baixo, TENTÁCULOS negros e dois braços secos e escuros de garras. Não tem
rosto: só um buraco de onde escorre sem parar a TINTA marrom (o jorro até o chão é feito em código).
REVISÃO (2026-10-31) pela "Miniatura Amigo Imaginário em O Segredo na Ilha": as BARBATANAS da crista bem maiores (a
fileira de espinhos de pano que domina o perfil), as PREGAS fundas do manto esculpidas (relief), a CAUDA de pano bem
mais longa arrastando para trás e os FIOS DE TINTA compridos escorrendo do buraco do rosto.
Elemento no jogo: TINTA (marrom).
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector, Matrix
from sculpt_lib import relief, ridge, n3

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
claw_m = material('claw_amigo', '#1c1412', 0.5)
sinew_m = material('sinew_amigo', '#2a1410', 0.7)  # o lado de baixo fibroso

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

# ---------------------------------------------------------------- CAPUZ (perfil e frente da wiki): um bulbo de pano que
# CAI para a frente como um visor por cima do buraco do rosto, com um bico pontudo no alto, pregas, e embaixo se FUNDE
# aos ombros caídos (sem fresta). A fileira de BARBATANAS de pano desce do alto do capuz pelas costas.
def hood_pt(u, v, out=1.0):
    # u: 0 = borda esquerda do rosto → por trás → 1 = borda direita; v: 0 = alto → 1 = ombros
    a = (u - 0.5) * 1.68 * math.pi + math.pi  # a fresta do rosto na frente (~0,32 π)
    beta = 1.5 - v * 2.05
    fold = 1 + 0.03 * math.sin(u * 41.0) * (0.2 + v)  # pregas do pano
    r = (1.12 + 0.42 * smoothstep(0.75, 0.15, v)) * out * fold
    sa, ca = math.sin(a), -math.cos(a)  # ca: +1 = costas, -1 = frente
    front = max(0.0, -ca)
    p = HC + Vector((sa * math.cos(beta) * 0.135 * H * r, ca * math.cos(beta) * 0.145 * H * r, math.sin(beta) * 0.15 * H * r))
    # o alto avança e a borda da frente desce sobre o rosto (o visor)
    top = smoothstep(-0.3, 1.1, beta)
    p.y -= top * 0.075 * H
    p.z -= front * top * 0.035 * H
    # o bico pontudo no alto, puxado um pouco para trás
    peak = max(0.0, math.sin(beta)) ** 5
    p.z += peak * 0.06 * H
    p.y += peak * 0.035 * H
    # embaixo o capuz se FUNDE aos ombros caídos
    k = smoothstep(0.55, 1.0, v)
    if k > 0:
        sh = torso_pt(a, 0.55, 1.0, 0.045) * out
        p = p.lerp(sh, k)
    return p


b.add('hood', grid(hood_pt, 34, 16), robe, region='head', subdiv=0)
b.add('hood_in', grid(lambda u, v: hood_pt(u, v, 0.965), 34, 16, flip=True), robe_in, region='head', subdiv=0)
# o buraco do rosto: um vazio escuro fundo dentro do capuz
b.add('face_hole', ellipsoid((hc.x, hc.y - 0.09 * H, hc.z - 0.005 * H), (0.085 * H, 0.04 * H, 0.11 * H), 14, 10), hole, region='head', subdiv=0)


def fin(base, nrm, tan, h, w, th=0.006):
    """Barbatana de pano: placa triangular fina, a ponta varrida para trás (tan)."""
    nrm = nrm.normalized()
    tan = (tan - nrm * tan.dot(nrm)).normalized()
    side = nrm.cross(tan).normalized() * th * H
    pts = [base - tan * w * 0.5, base + tan * w * 0.5, base + nrm * h + tan * w * 0.55]
    verts = [tuple(q + side) for q in pts] + [tuple(q - side) for q in pts]
    faces = [(0, 1, 2), (5, 4, 3), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]
    return verts, faces, [(0, 0), (1, 0), (0.5, 1)] * 2


# a borda do rosto em DENTES de pano pendurados (a franja rasgada da miniatura da wiki)
teeth = []
for side_u in (0.0, 1.0):
    for k in range(9):
        v = 0.08 + k * 0.06
        p = hood_pt(side_u, v)
        ln = (0.05 + 0.035 * ((k * 7) % 3)) * H
        inward = (HC - p)
        inward.z = 0
        inward = inward.normalized() * 0.012 * H
        teeth.append(cone(tuple(p + inward), tuple(p + inward + Vector((0, -0.006 * H, -ln))), 0.011 * H, 4))
# e na testa, por baixo do visor
for k in range(7):
    t = (k - 3) / 3
    p = hood_pt(0.0, 0.05).lerp(hood_pt(1.0, 0.05), 0.5) + Vector((t * 0.07 * H, 0.0, -0.035 * H))
    teeth.append(cone(tuple(p), tuple(p + Vector((0, -0.004 * H, -(0.04 + 0.03 * (k % 2)) * H))), 0.01 * H, 4))
b.add('hood_teeth', merge(*teeth), robe_in, region='head', subdiv=0)

# BARBATANAS: do alto do capuz, descendo pelas costas, cada vez menores
spine = [hood_pt(0.5, v) for v in (0.2, 0.32, 0.44, 0.56, 0.68)]
spine += [torso_pt(math.pi, z, 1.0, 0.05) for z in (0.48, 0.36, 0.24, 0.12, 0.0)]
fins_h, fins_t = [], []
for i, p in enumerate(spine):
    prv, nxt = spine[max(i - 1, 0)], spine[min(i + 1, len(spine) - 1)]
    tan = prv - nxt  # aponta para cima/trás ao longo da coluna
    if i < 5:
        nrm = p - HC
    else:
        nrm = Vector((p.x, p.y, 0.0)) + Vector((0, 0, 0.25 * p.y))
    t = i / (len(spine) - 1)
    f_ = fin(p - nrm.normalized() * 0.015 * H, nrm, -tan, (0.26 - 0.13 * t) * H, (0.17 - 0.07 * t) * H, 0.008)
    (fins_h if i < 5 else fins_t).append(f_)
b.add('fins_head', merge(*fins_h), robe, region='head', subdiv=0)
b.add('fins_back', merge(*fins_t), robe, region='torso', subdiv=0)
# espinhos menores nas laterais do capuz (a moldura pontuda da arte de frente)
side_fins = []
for side_u in (0.08, 0.92):
    for k in range(3):
        v = 0.3 + k * 0.14
        p = hood_pt(side_u, v)
        nrm = p - HC
        nrm.y *= 0.3
        side_fins.append(fin(p - nrm.normalized() * 0.01 * H, nrm, Vector((0, 0.3, 1)), (0.06 - 0.012 * k) * H, 0.05 * H))
b.add('fins_side', merge(*side_fins), robe, region='head', subdiv=0)

# FIOS DE TINTA saindo do buraco do rosto (o jorro grosso até o chão é feito em código: def.inkStream)
ink_strands = []
for k in range(9):
    x = (k - 4) * 0.014 * H
    top = Vector((hc.x + x, hc.y - 0.1 * H, hc.z - 0.05 * H + abs(k - 4) * 0.006 * H))
    ln = (0.22 + 0.3 * ((k * 37) % 5) / 5) * H  # os fios compridos da miniatura
    ink_strands.append(rod([top, top + Vector((0, -0.008 * H, -ln * 0.5)), top + Vector((0, -0.01 * H, -ln))], [0.009 * H, 0.006 * H, 0.002 * H], 5))
b.add('ink', merge(*ink_strands), ink, region='head', subdiv=0)

# ---------------------------------------------------------------- MANTO até o chão: pregas, a CAUDA que arrasta para
# trás (perfil da wiki) e a barra rasgada
Z_TOP, Z_BOT = 0.64, -0.95


def robe_pt(u, v, out=1.0):
    a = (u - 0.5) * TAU + math.pi
    z = Z_TOP - v * (Z_TOP - Z_BOT)
    zc = min(max(z, -0.16), 0.62)
    flare = 0.04 + max(0.0, 0.4 - z) * 0.1
    p = torso_pt(a, zc, 1.0, flare)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.55
        p.y *= 1 + (-0.16 - z) * 0.6
    fold = 1 + 0.045 * math.sin(u * TAU * 11) * smoothstep(0.45, -0.5, z)
    p.x *= fold
    p.y *= fold
    # a cauda: as costas se alongam para trás perto do chão
    back = max(0.0, -math.cos(a)) ** 2
    p.y += back * smoothstep(-0.2, -0.95, z) * 0.55 * H  # a cauda longa que arrasta (a miniatura de perfil)
    if v > 0.9:
        cut = (0.5 + 0.5 * math.sin(u * 47.0)) * (0.5 + 0.5 * math.sin(u * 13.0 + 1.3))
        p.z += cut * 0.12 * H * (v - 0.9) / 0.1
    return Vector((p.x * out, p.y * out, p.z))


def robe_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.6 * H, p.z) * 0.25
    w_hip = smoothstep(hz + 0.3 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


robe_o = b.add('robe', grid(lambda u, v: robe_pt(u, v), 96, 32), robe, region='torso', weight_fn=robe_weights, subdiv=0)
# as PREGAS fundas do pano (mais fundas embaixo), torcidas como na miniatura
relief(robe_o, lambda q: 0.012 * H * (ridge(math.atan2(q.x, q.y) * 7 + q.z / H * 3 + n3(q, 6) * 0.8, 2) - 0.45) * smoothstep(hz + 0.5 * H, hz - 0.6 * H, q.z))
b.add('robe_in', grid(lambda u, v: robe_pt(u, v, 0.97), 96, 32, flip=True), robe_in, region='torso', weight_fn=robe_weights, subdiv=0)
# a barra em TIRAS rasgadas que serpenteiam pelo chão
rags = []
for i in range(44):
    u = i / 44 + 0.01
    p = robe_pt(u, 1.0, 1.0)
    o = outward(p)
    ln = random.uniform(0.12, 0.34) * H
    w = random.uniform(0.02, 0.04) * H
    pts = []
    for k in range(5):
        t = k / 4
        side = Vector((-o.y, o.x, 0)) * math.sin(t * 6 + i) * 0.03 * H
        pts.append(p + o * ln * t + side + Vector((0, 0, -0.02 * H * t)))
    rags.append(rod(pts, [w, w * 0.8, w * 0.6, w * 0.4, 0.003 * H], 4, flat=(lambda q: Vector((0, 0, 1)), 0.25)))
# FITAS onduladas que se soltam das costas e escorrem para trás até o chão (as tiras ao vento da miniatura)
for i in range(9):
    u = 0.34 + 0.32 * i / 8
    v = 0.55 + 0.35 * ((i * 5) % 9) / 9
    p = robe_pt(u, v, 1.0)
    o = outward(p)
    sv = Vector((-o.y, o.x, 0)).normalized()
    ln = random.uniform(0.3, 0.46) * H
    drop = p.z - (hz - 0.93 * H)
    w = random.uniform(0.03, 0.045) * H
    pts = []
    for k in range(8):
        t = k / 7
        pts.append(p + o * (ln * t) + Vector((0, 0, -drop * smoothstep(0.0, 0.8, t) + math.sin(t * 7.5 + i) * 0.025 * H * t)) + sv * math.sin(t * 4 + i * 1.7) * 0.04 * H * t)
    rags.append(rod(pts, [w * (1 - 0.8 * k / 7) + 0.002 * H for k in range(8)], 4, flat=(lambda q, s=sv: s, 0.15)))
b.add('robe_rags', merge(*rags), robe, region='torso', weight_fn=robe_weights, subdiv=0)

# o LADO DE BAIXO fibroso e escuro, à mostra na frente: tendões verticais e costelas de pano (a arte de frente)
sinew = []
for i in range(9):
    u0 = (i - 4) * 0.018
    pts = [robe_pt(u0 + 0.008 * math.sin(v * 13 + i), v, 1.012) for v in (0.12, 0.3, 0.48, 0.66, 0.84, 0.97)]
    sinew.append(rod(pts, [0.008 * H, 0.011 * H, 0.012 * H, 0.013 * H, 0.012 * H, 0.009 * H], 5))
for k in range(5):
    v = 0.1 + k * 0.07
    pts = [robe_pt(u, v, 1.02) for u in (-0.09, -0.045, 0.0, 0.045, 0.09)]
    sinew.append(rod(pts, [0.005 * H, 0.008 * H, 0.009 * H, 0.008 * H, 0.005 * H], 5))
b.add('sinew', merge(*sinew), sinew_m, region='torso', weight_fn=robe_weights, subdiv=0)

# TENTÁCULOS negros saindo de baixo do manto, as pontas enroladas
tents = []
for i in range(12):
    a = (i / 12) * TAU + 0.2
    base = Vector((math.sin(a) * 0.16 * H, -math.cos(a) * 0.14 * H, hz - 0.72 * H))
    o = Vector((math.sin(a), -math.cos(a), 0))
    sv = Vector((-o.y, o.x, 0))
    ln = (0.4 + 0.18 * ((i * 7) % 4) / 4) * H
    pts = []
    for k in range(10):
        t = k / 9
        curl = smoothstep(0.65, 1.0, t)
        pts.append(base + o * (0.08 * H + t * ln - curl * 0.06 * H) + sv * (math.sin(t * 5 + i) * 0.06 * H + curl * 0.05 * H * (1 if i % 2 else -1))
                   + Vector((0, 0, -0.22 * H * min(t, 0.6) + 0.04 * H * math.sin(t * math.pi) + curl * 0.09 * H)))
    tents.append(rod(pts, [0.048 * H * (1 - 0.85 * k / 9) + 0.004 * H for k in range(10)], 6))
b.add('tentacles', merge(*tents), tent, region='torso', weight_fn=robe_weights, subdiv=0)

# ---------------------------------------------------------------- BRAÇOS secos e escuros (saem das mangas rasgadas) e
# as GARRAS longas e curvas
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    up = [(q.x, q.y, q.z, r, r) for q, r in ((s.lerp(e, t), 0.06 - 0.008 * t) for t in (0.0, 0.5, 1.0))]
    b.add('sleeve' + side, tube(up, 12), robe, region='arm' + side, subdiv=0)
    # a manga rasgada em pontas no cotovelo
    ax0 = (e - s).normalized()
    cuff = []
    for k in range(6):
        ang = k / 6 * TAU
        q = ax0.orthogonal().normalized()
        rr = Matrix.Rotation(ang, 3, ax0) @ q
        base = e + rr * 0.055 * H * 0.9 - ax0 * 0.02 * H
        cuff.append(cone(tuple(base), tuple(base + ax0 * (0.05 + 0.03 * (k % 2)) * H + rr * 0.008 * H), 0.016 * H, 3))
    b.add('cuff' + side, merge(*cuff), robe, region='arm' + side, subdiv=0)
    lo = [(q.x, q.y, q.z, r, r) for q, r in ((e.lerp(h, t), 0.032 - 0.01 * t) for t in (0.0, 0.5, 0.95))]
    b.add('fore' + side, tube(lo, 10), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.04), claw_m, region='e' + side)
    ax = (h - e).normalized()
    claws = []
    for k in range(5):
        off = Vector((sx * (k - 2) * 0.011 * H, (k - 2) * 0.004 * H, 0))
        base = h + ax * 0.04 * H + off
        ln = (0.16 - 0.02 * abs(k - 2)) * H
        mid = base + ax * ln * 0.55 + off * 0.3
        tip = base + ax * ln + Vector((0, -0.05 * H, 0)) + off * 0.6
        claws.append(rod([base, mid, tip], [0.009 * H, 0.006 * H, 0.0015 * H], 5))
    b.add('claws' + side, merge(*claws), claw_m, region='e' + side, subdiv=0)

b.export(OUT)
