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
b = Builder(width=0.78, bulk=0.74, height=1.24)  # 2,5 m — o mais alto do jogo, e bem magro (as artes)
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
glow = material('eyeglow_estrangeiro', '#22e83a', 0.4, emission='#12d02a', strength=1.6)  # verde (forte demais virava amarelo)
leaf = material('leaf_estrangeiro', '#4e8a34', 0.5, emission='#2e6a22', strength=0.25)  # os ornamentos do peito
sash = material('sash_estrangeiro', '#3a4230', 0.9)  # a faixa de pano enrolada na cintura

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
# a cabeça base fica pequena, escondida dentro da MÁSCARA esculpida abaixo
hc = b.body(M, [], arms=(), legs=False, head_r=(0.07, 0.085, 0.13), neck_r=0.042)

# ---------------------------------------------------------------- A MÁSCARA (rosto refeito pela miniatura de Sinais do
# Outro Lado): crânio ALTO de topo achatado, largo na testa, que afina num QUEIXO longo e pontudo; a TESTA pesada cai
# sobre os olhos fundos, inclinados e VERDES; um sulco desce do alto do crânio até a testa; abaixo dos olhos, RUGAS
# verticais até o queixo — sem boca. Seção de "caixa arredondada" (superelipse) no crânio, mais redonda no rosto.
HP = [  # (z relativo ao centro, meia-largura, meia-profundidade, expoente da seção) — em frações de H
    (0.235, 0.03, 0.04, 2.0),
    (0.228, 0.07, 0.085, 3.0),
    (0.21, 0.094, 0.11, 3.2),
    (0.15, 0.104, 0.122, 3.0),
    (0.07, 0.106, 0.124, 2.8),
    (0.02, 0.102, 0.12, 2.6),
    (-0.04, 0.092, 0.112, 2.4),
    (-0.1, 0.078, 0.1, 2.2),
    (-0.16, 0.058, 0.084, 2.1),
    (-0.21, 0.034, 0.066, 2.0),
    (-0.245, 0.012, 0.04, 2.0),
    (-0.255, 0.0, 0.0, 2.0),
]
HP_UP = [(-q[0],) + q[1:] for q in HP]  # lerp_table quer o x crescendo
EYE_Z, EYE_X = -0.005, 0.044
mask_m = material('mask_estrangeiro', '#8e937e', 0.6)  # cinza-esverdeado da miniatura


def spow(v, e):
    return math.copysign(abs(v) ** e, v)


def head_pt(a, z, out=0.0):
    """a = ângulo em volta (0 = frente, −y), z = altura relativa ao centro (frações de H); out empurra para fora."""
    w, d, n = lerp_table(HP_UP, -z)
    x = spow(math.sin(a), 2 / n) * (w + out)
    y = -spow(math.cos(a), 2 / n) * (d + out)
    front = max(0.0, math.cos(a))
    # TESTA pesada: um friso para a frente logo acima dos olhos
    y -= 0.016 * front ** 3 * math.exp(-((z - 0.045) / 0.022) ** 2)
    # OLHOS FUNDOS: as órbitas afundam
    for s in (1, -1):
        dx = x - s * EYE_X
        y += 0.02 * front * math.exp(-(dx / 0.03) ** 2 - ((z - EYE_Z) / 0.022) ** 2)
    # rosto mais chato embaixo dos olhos (as maçãs marcam os lados)
    if z < EYE_Z:
        y *= 1 - 0.1 * front ** 2 * min(1.0, (EYE_Z - z) / 0.06)
    return Vector((hc.x + x * H, hc.y + y * H, hc.z + z * H))


b.add('mask', grid(lambda u, v: head_pt((u - 0.5) * TAU + math.pi, HP[0][0] - (HP[0][0] - HP[-1][0]) * v), 40, 30), mask_m, region='head', subdiv=1)

# OLHOS: amendoados e inclinados (o canto de fora mais alto), acesos de verde, no fundo das órbitas
for s_ in (1, -1):
    c = head_pt(s_ * 0.42, EYE_Z) + Vector((0, -0.004 * H, 0))  # um pouco para fora do fundo da órbita: aparece aceso
    eye = ellipsoid(tuple(c), (0.032 * H, 0.013 * H, 0.016 * H), 12, 8)
    b.add(f'eye{s_}', xform(eye, lambda p, c=c, s_=s_: Vector((p.x, p.y, p.z + (p.x - c.x) * 0.5 * s_))), glow, region='head', subdiv=0)


def groove(pts):
    return rod(pts, [0.0026 * H] * len(pts), 4)  # fino e meio afundado: risco, não barra


lines = []
# o sulco do meio: do alto do crânio até a testa
lines.append(groove([head_pt(0.0, z, -0.0005) for z in (0.225, 0.2, 0.16, 0.12, 0.08, 0.06)]))
# os dois sulcos das têmporas, descendo pelos lados do crânio
for s in (1, -1):
    lines.append(groove([head_pt(s * a_, z, 0.002) for a_, z in ((0.5, 0.215), (0.62, 0.17), (0.72, 0.11), (0.78, 0.05))]))
# a borda de cima das órbitas (a testa pesada)
for s in (1, -1):
    lines.append(groove([head_pt(s * a_, EYE_Z + 0.03, 0.003) for a_ in (0.1, 0.25, 0.42, 0.6)]))
# RUGAS verticais embaixo dos olhos até o queixo (sem boca)
for xa, top, bot in ((0.0, -0.05, -0.22), (0.16, -0.045, -0.18), (-0.16, -0.045, -0.18), (0.34, -0.035, -0.12), (-0.34, -0.035, -0.12)):
    lines.append(groove([head_pt(xa * (1 + 0.15 * t), top + (bot - top) * t, 0.001) for t in (0.0, 0.33, 0.66, 1.0)]))
b.add('mask_lines', merge(*lines), material('crease_estrangeiro', '#3e4236', 0.8), region='head', subdiv=0)

# FIOS verde-escuros que entram por ENCAIXES nas laterais e atrás da cabeça e caem até os ombros e as costas
cable_m = material('cable_estrangeiro_green', '#1e3a24', 0.5)
cables, ports = [], []
random.seed(9)
for i in range(16):
    s = 1 if i % 2 else -1
    a = s * (1.45 + (i // 2) * 0.17)  # dos lados para trás
    z = 0.13 - (i // 2 % 4) * 0.035
    root = head_pt(a, z, 0.006)
    outv = (root - Vector((hc.x, hc.y, root.z))).normalized()
    ports.append(rod([root - outv * 0.01 * H, root + outv * 0.022 * H], [0.013 * H, 0.012 * H], 6))
    end = torso_pt(a * 1.05 + random.uniform(-0.2, 0.2), random.uniform(0.46, 0.6), 1.0, 0.04)
    mid = root + outv * 0.05 * H + Vector((0, 0, -0.1 * H))
    cables.append(rod([root + outv * 0.02 * H, mid, end], [0.008 * H, 0.008 * H, 0.007 * H], 5))


def cable_weights(p):
    w = smoothstep(hc.z - 0.3 * H, hc.z, p.z)
    return {'hd': w, 'chest': 1 - w}


b.add('cable_ports', merge(*ports), dark, region='head', subdiv=0)
b.add('cables', merge(*cables), cable_m, region='torso', weight_fn=cable_weights, subdiv=0)

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
        # dedos longos e finos que viram garras (as artes: as garras passam do meio da coxa)
        base = h + ax * 0.05 * H + off
        knuckle = base + ax * 0.1 * H + off * 0.4
        tip = knuckle + ax * 0.2 * H + Vector((0, -0.05 * H, 0)) + off * 0.5
        claws.append(rod([base, knuckle], [0.008 * H, 0.007 * H], 5))
        claws.append(cone(tuple(knuckle), tuple(tip), 0.007 * H, 5))
    b.add('claws' + side, merge(*claws), claw_m, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- ARMADURA do torso: metal esverdeado com detalhes
# pretos, formas verdes acesas no peito e as tiras pretas cruzadas no alto
b.add('armor', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.66 - v * 0.6, 1.0, 0.012), 32, 8), armor, region='torso', subdiv=0)
# os ORNAMENTOS do peito (as artes): folhas verdes em leque, abrindo do meio do peito para cima, com as nervuras
# escuras descendo até a cintura
leafs, veins = [], []
for sx, z, a_, sc in ((0, 0.5, 0, 1.15), (1, 0.48, 0.16, 1.0), (-1, 0.48, 0.16, 1.0), (1, 0.44, 0.32, 0.85), (-1, 0.44, 0.32, 0.85), (1, 0.38, 0.46, 0.7), (-1, 0.38, 0.46, 0.7)):
    p = torso_pt(sx * a_, z, 1.0, 0.026)
    leafs.append(xform(ellipsoid(tuple(p), (0.016 * H * sc, 0.007 * H, 0.046 * H * sc), 8, 6), lambda q, p=p, sx=sx: Vector((q.x + (q.z - p.z) * 0.35 * sx, q.y, q.z))))
    veins.append(rod([torso_pt(sx * a_ * 0.6, z - 0.05, 1.0, 0.024), torso_pt(sx * a_ * 0.4, 0.3, 1.0, 0.022), torso_pt(sx * a_ * 0.25, 0.16, 1.0, 0.02)], [0.005 * H] * 3, 4))
b.add('chest_leaves', merge(*leafs), leaf, region='torso', subdiv=0)
b.add('chest_veins', merge(*veins), dark, region='torso', subdiv=0)
# a FAIXA de pano dando três voltas largas na cintura, a ponta caindo na frente
belts = [rod([torso_pt((k / 28 - 0.5) * TAU, zb, 1.0, 0.03 + i * 0.006) for k in range(29)], [0.02 * H] * 29, 6, flat=(outward, 0.4)) for i, zb in enumerate((0.06, 0.1, 0.14))]
kn = torso_pt(-0.2, 0.1, 1.0, 0.05)
belts.append(rod([kn, kn + Vector((0, -0.008 * H, -0.16 * H)), kn + Vector((0.006 * H, -0.012 * H, -0.36 * H))], [0.02 * H, 0.018 * H, 0.016 * H], 6, flat=(outward, 0.35)))
b.add('belt', merge(*belts), sash, region='torso', subdiv=0)

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
    # as OMBREIRAS ALTAS E PONTUDAS da capa (as artes): nos lados, a borda de cima sobe em ponta até a altura das
    # orelhas, dura como papelão
    side = abs(math.sin(a)) ** 4
    lift = max(0.0, 1 - v / 0.22)
    p.z += 0.26 * H * side * lift
    p.x *= 1 + 0.18 * side * lift
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.55
        p.y *= 1 + (-0.16 - z) * 0.6
    return Vector((p.x * out, p.y * out, p.z))


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.1 * H, hz - 0.7 * H, p.z) * 0.25
    w_hip = smoothstep(hz + 0.3 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


b.add('cape', grid(lambda u, v: cape_pt(u, v), 48, 22), cape, region='torso', weight_fn=cape_weights, subdiv=0)
b.add('cape_in', grid(lambda u, v: cape_pt(u, v, 0.985), 48, 22, flip=True), cape_in, region='torso', weight_fn=cape_weights, subdiv=0)
# a gola alta da capa, subindo atrás do pescoço
b.add('cape_collar', grid(lambda u, v: torso_pt((u - 0.5) * 1.5 * math.pi + math.pi, 0.64, 1.0, 0.07) + Vector((0, 0.01 * H * v, v * 0.12 * H)), 24, 3), cape, region='torso', subdiv=0)

# PÉS de garra aparecendo embaixo do manto: dedos ossudos compridos com unhas (as artes)
for side in ('L', 'R'):
    f = sk['foot' + side]
    sx = 1 if side == 'L' else -1
    toes = [rod([(f.x, f.y + 0.02 * H, f.z + 0.06 * H), (f.x, f.y - 0.02 * H, f.z + 0.02 * H)], [0.03 * H, 0.026 * H], 8)]
    for k in (-1, 0, 1):
        base = Vector((f.x + k * 0.024 * H, f.y - 0.03 * H, f.z + 0.016 * H))
        mid = base + Vector((k * 0.02 * H, -0.08 * H, -0.008 * H))
        toes.append(rod([base, mid], [0.011 * H, 0.009 * H], 5))
        toes.append(cone(tuple(mid), tuple(mid + Vector((k * 0.008 * H, -0.05 * H, -0.012 * H))), 0.008 * H, 5))
    b.add('foot' + side, merge(*toes), skin, region='foot' + side, subdiv=0)

b.export(OUT)
