"""
A MAGISTRADA — public/models/magistrada.glb
Referências: wiki "A Magistrada" (a arte do Livro de Regras, a miniatura de Desconjuração e a Máscara do Desespero).
A última Magistrada: mulher negra, alta e esguia, de TRANÇAS longas; o rosto é a MÁSCARA DO DESESPERO (textura
face_magistrada: branca, três sulcos descendo dos olhos e da boca, fenda de coração invertido no nariz, o Símbolo da
Relíquia de Conhecimento na testa). Camisa branca de mangas longas, calça cinza-clara larga, sapatos escuros; o longo
TECIDO BRANCO caindo do pescoço até os joelhos com franja; a corda com NÓ DE FORCA no pescoço e outra amarrada na
cintura; correntes douradas caindo pelo peito; luvas pretas e pulseiras douradas; a grande CAPA marrom-escura até os
pés, aberta na frente, com franja na barra e a GOLA DOURADA alta e espetada atrás da cabeça.
REVISÃO (2026-10-31) pela "Miniatura A Magistrada em Desconjuração": a CAPA PRETA-ACINZENTADA (não marrom) presa atrás dos
braços (os braços ficam de fora, como na miniatura); a GOLA DOURADA EM PÉ atrás da cabeça (não mais a bandeja aberta);
as OMBREIRAS escuras com a fileira de espinhos; a camisa branca de MANGAS BUFANTES puxadas até o cotovelo (o antebraço
à mostra), as luvas pretas com as FAIXAS no pulso; a GOLA ESCURA no pescoço por baixo do tecido; a calça clara.
A Máscara do Desespero em relevo é peça em código (weapons.js despairMask, a mesma da Celestine).
A bengala é adicionada em código (src/models/weapons.js bengala()).
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'magistrada.glb'
random.seed(42)
b = Builder(width=0.9, bulk=0.86, height=1.04)  # alta e esguia
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_magistrada', '#4a2e22', 0.75)
shirt = material('shirt_magistrada', '#e6e2da', 0.85)
scarf = material('scarf_magistrada', '#efebe2', 0.9)
pants = material('pants_magistrada', '#d6d2c8', 0.9)
glove = material('glove_magistrada', '#141214', 0.6)
shoe = material('shoe_magistrada', '#141216', 0.5)
shoe_w = material('shoe_magistrada_w', '#e8e4dc', 0.6)
gaiter = material('gaiter_magistrada', '#3c3c42', 0.9)
plate = material('plate_magistrada', '#2c2c32', 0.5, metal=0.3)
cape = material('cape_magistrada', '#26262c', 0.9)
cape_in = material('cape_magistrada_in', '#121216', 0.9)
gold = material('gold_magistrada', '#c8a048', 0.35, metal=0.8)
rope = material('rope_magistrada', '#c8b078', 0.9)
hairm = material('hair_magistrada', '#1a120e', 0.6)

M = {'skin': skin, 'face': material('face_magistrada', '#ffffff', 0.6), 'torso': shirt, 'hand': glove}


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


# ---------------------------------------------------------------- TRONCO esguio (feminino, ombros estreitos)
TT = [
    (-0.16, 0.168, 0.118, 0.128),
    (-0.04, 0.166, 0.116, 0.126),
    (0.08, 0.142, 0.104, 0.112),
    (0.2, 0.15, 0.11, 0.112),
    (0.32, 0.17, 0.13, 0.118),
    (0.42, 0.18, 0.13, 0.122),
    (0.5, 0.186, 0.12, 0.126),
    (0.56, 0.18, 0.11, 0.12),
    (0.6, 0.16, 0.098, 0.11),
    (0.64, 0.118, 0.08, 0.092),
    (0.675, 0.076, 0.064, 0.068),
    (0.7, 0.056, 0.052, 0.056),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def mag_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = mag_torso
# cabeça um pouco comprida (a Máscara é ovalada)
hc = b.body(M, [], arms=(), legs=False, head_r=(0.122, 0.134, 0.168), neck_r=0.05)

# ---------------------------------------------------------------- BRAÇOS: a camisa branca de MANGAS BUFANTES puxadas até o
# cotovelo (franzida no punho da manga), o antebraço à mostra, as luvas pretas e as faixas pretas enroladas no pulso
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    top = s + Vector((-sx * 0.02 * H, 0, 0.005 * H))
    up = []
    for i in range(7):
        t = i / 6
        p = top.lerp(e + (e - s).normalized() * 0.03 * H, t)
        r = 0.066 + 0.026 * math.sin(min(1.0, t * 1.15) * math.pi) ** 0.8  # bufante no meio, franzida nas pontas
        up.append((p.x, p.y, p.z, r, r))
    b.add('sleeve' + side, tube(up, 16), shirt, region='arm' + side, subdiv=0)
    b.add('delt' + side, ellipsoid((s.x - sx * 0.006 * H, s.y, s.z - 0.012 * H), (0.06 * H, 0.066 * H, 0.056 * H), 12, 8), shirt, region='arm' + side, subdiv=0)
    # a dobra franzida da manga no cotovelo
    cuff = e + (e - s).normalized() * 0.03 * H
    b.add('sleeveCuff' + side, tube(limb_rings(cuff, cuff + (h - e).normalized() * 0.022 * H, 0.06, 0.056, n=1), 14), shirt, region='e' + side, subdiv=0)
    lo = [(q.x, q.y, q.z, r, r * 0.95) for q, r in ((e.lerp(h, t), 0.05 - 0.01 * t) for t in (0.0, 0.3, 0.6, 0.86))]
    b.add('forearm' + side, tube(lo, 12), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.05), glove, region='e' + side)
    wraps = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.045), 0.05, 0.05, n=1), 12) for t in (0.62, 0.7, 0.78)]
    b.add('wristWraps' + side, merge(*wraps), glove, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- PERNAS: calça cinza larga, sapatos escuros
b.add('pants_hip', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.06 - v * 0.24, 1.0, 0.012), 32, 4), pants, region='torso', subdiv=0)
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    topp = Vector((l.x, l.y, l.z + 0.07 * H))
    rings = []
    for t, r in ((0.0, 0.086), (0.4, 0.082), (0.8, 0.072), (1.0, 0.07)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.3, 0.068), (0.65, 0.064), (0.9, 0.06), (0.98, 0.058)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('pants' + side, tube(rings, 14), pants, region='leg' + side, subdiv=0)
    b.add('shoe' + side, ellipsoid((f.x, f.y - 0.05 * H, f.z + 0.025 * H), (0.046 * H, 0.12 * H, 0.036 * H), 12, 8, theta_max=math.pi * 0.6), shoe, region='foot' + side, subdiv=0)
    b.add('shoeTop' + side, ellipsoid((f.x, f.y - 0.02 * H, f.z + 0.05 * H), (0.04 * H, 0.06 * H, 0.022 * H), 10, 6), shoe_w, region='foot' + side, subdiv=0)  # o peito do pé branco (os sapatos de duas cores)
    b.add('sole' + side, sole_part((f.x, f.y - 0.05 * H, f.z - 0.006 * H), (0.095 * H, 0.24 * H, 0.02 * H), bevel=0.005), shoe, region='foot' + side, subdiv=0)

# ---------------------------------------------------------------- CAPA marrom-escura até os pés, aberta na frente
GAP = 0.3  # bem aberta na frente: a capa cai por TRÁS dos braços (a miniatura)
Z_TOP, Z_BOT = 0.62, -0.92


def cape_pt(u, v, out=1.0):
    a = (u - 0.5) * (1 - 2 * GAP) * TAU + math.pi
    z = Z_TOP - v * (Z_TOP - Z_BOT)
    zc = min(max(z, -0.16), 0.6)
    # cai dos ombros abrindo em sino até o chão; atrás fica mais longe do corpo
    flare = 0.05 + max(0.0, 0.5 - z) * 0.11
    p = torso_pt(a, zc, 1.0, flare)
    p.z = hz + z * H
    if z < -0.16:
        p.x *= 1 + (-0.16 - z) * 0.32
        p.y *= 1 + (-0.16 - z) * 0.36
    return Vector((p.x * out, p.y * out, p.z))


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.6 * H, p.z) * 0.35
    w_hip = smoothstep(hz + 0.3 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    w_chest = max(0.0, 1 - w_leg - w_hip)
    return {'chest': w_chest, 'hips': w_hip, 'l' + side: w_leg}


b.add('cape', grid(lambda u, v: cape_pt(u, v), 48, 20), cape, region='torso', weight_fn=cape_weights, subdiv=0)
b.add('cape_in', grid(lambda u, v: cape_pt(u, v, 0.985), 48, 20, flip=True), cape_in, region='torso', weight_fn=cape_weights, subdiv=0)
# franja na barra da capa
fr = []
for i in range(56):
    u = i / 55
    p = cape_pt(u, 1.0, 1.0)
    fr.append(cone(tuple(p + Vector((0, 0, 0.01 * H))), tuple(p + outward(p) * 0.004 * H + Vector((0, 0, -0.05 * H))), 0.011 * H, 3))
b.add('cape_fringe', merge(*fr), cape, region='torso', weight_fn=cape_weights, subdiv=0)
# borda dourada nas duas frentes da capa
edges = [[cape_pt(eu, v / 20, 1.012) for v in range(21)] for eu in (0.0, 1.0)]
b.add('cape_edge', merge(*[rod(e_, [0.009 * H] * 21, 5) for e_ in edges]), gold, region='torso', weight_fn=cape_weights, subdiv=0)

# GOLA DOURADA alta, atrás da cabeça, abrindo para os lados com a franja espetada (a arte do Livro de Regras)
def collar_pt(u, v):
    a = (u - 0.5) * 1.3 * math.pi + math.pi  # de um ombro ao outro, passando por trás
    base = torso_pt(a, 0.62, 1.0, 0.06)
    up = v * 0.26 * H
    spread = 1 + v * 0.22  # EM PÉ atrás da cabeça, abrindo só um pouco
    return Vector((base.x * spread, base.y * spread + v * 0.02 * H, base.z + up))


b.add('collar', grid(collar_pt, 30, 4), cape, region='torso', subdiv=0)
# face de dentro um pouco para dentro (na mesma superfície as duas brigavam e piscavam em xadrez)
b.add('collar_in', grid(lambda u, v: collar_pt(u, v) * 0.97 + Vector((0, 0, collar_pt(u, v).z * 0.03)), 30, 4, flip=True), cape_in, region='torso', subdiv=0)
spikes = []
for i in range(34):
    u = i / 33
    p = collar_pt(u, 1.0)
    d = (p - Vector((0, 0, p.z))).normalized() * 0.35 + Vector((0, 0, 1))
    spikes.append(cone(tuple(p), tuple(p + d.normalized() * (0.04 + 0.02 * (i % 2)) * H), 0.008 * H, 3))
rim = [collar_pt(i / 30, 1.0) for i in range(31)]
b.add('collar_gold', merge(rod(rim, [0.012 * H] * 31, 5), *spikes), gold, region='torso', subdiv=0)

# ---------------------------------------------------------------- a GOLA ESCURA no pescoço (por baixo do tecido branco)
b.add('gaiter', tube([(0, 0, 1.56 * H, 0.066 * H, 0.066 * H), (0, 0, 1.62 * H, 0.062 * H, 0.062 * H), (0, 0, 1.69 * H, 0.058 * H, 0.056 * H)], 16), gaiter, region='neck', subdiv=0)

# ---------------------------------------------------------------- as OMBREIRAS escuras da capa com a fileira de espinhos
for sx in (1, -1):
    sh = sk['sL' if sx > 0 else 'sR']
    c = Vector((sh.x + sx * 0.01 * H, sh.y + 0.012 * H, sh.z + 0.03 * H))
    pl = ellipsoid(tuple(c), (0.085 * H, 0.09 * H, 0.05 * H), 14, 8, theta_max=math.pi * 0.62)
    sp = []
    for k in range(5):
        q = c + Vector((sx * (-0.035 + 0.02 * k) * H, 0.02 * H, 0.04 * H))
        sp.append(cone(tuple(q), tuple(q + Vector((sx * 0.012 * H, 0.004 * H, 0.05 * H))), 0.01 * H, 4))
    b.add(f'shoulderPlate{sx}', merge(pl, *sp), plate, region='torso', weight_fn=lambda p: {'chest': 1.0}, subdiv=0)

# ---------------------------------------------------------------- TECIDO BRANCO caindo do pescoço até os joelhos
for sx in (1, -1):
    pts = [torso_pt(sx * 0.5, 0.64, 1.0, 0.03), torso_pt(sx * 0.45, 0.42, 1.0, 0.035), torso_pt(sx * 0.42, 0.1, 1.0, 0.045),
           torso_pt(sx * 0.42, -0.14, 1.0, 0.06) + Vector((0, 0, -0.0)), torso_pt(sx * 0.42, -0.16, 1.0, 0.07) + Vector((0, -0.01 * H, -0.2 * H))]
    b.add(f'scarf{sx}', rod(pts, [0.036 * H, 0.04 * H, 0.042 * H, 0.042 * H, 0.04 * H], 6, flat=(outward, 0.14)), scarf, region='torso', weight_fn=cape_weights, subdiv=0)
    end = pts[-1]
    fringe = [cone(tuple(end + Vector((k * 0.012 * H, 0, 0))), tuple(end + Vector((k * 0.013 * H, -0.002 * H, -0.04 * H))), 0.004 * H, 3) for k in range(-3, 4)]
    b.add(f'scarf_fringe{sx}', merge(*fringe), scarf, region='torso', weight_fn=cape_weights, subdiv=0)
# volta do tecido em torno do pescoço
b.add('scarf_neck', rod([torso_pt((k / 24 - 0.5) * TAU, 0.66, 1.0, 0.04) + Vector((0, 0, 0.01 * H)) for k in range(25)], [0.03 * H] * 25, 8), scarf, region='torso', subdiv=0)

# ---------------------------------------------------------------- CORDAS: nó de forca no pescoço, corda na cintura
noose = [torso_pt((k / 24 - 0.5) * TAU, 0.69, 1.0, 0.022) + Vector((0, 0, 0.02 * H)) for k in range(25)]
knot = torso_pt(0, 0.6, 1.0, 0.06)
coils = [tube([(knot.x, knot.y, knot.z - k * 0.022 * H, 0.03 * H, 0.024 * H), (knot.x, knot.y, knot.z - k * 0.022 * H - 0.016 * H, 0.03 * H, 0.024 * H)], 10) for k in range(5)]
tail = rod([knot + Vector((0, 0, -0.11 * H)), knot + Vector((0.005 * H, -0.004 * H, -0.2 * H)), knot + Vector((0.0, -0.002 * H, -0.27 * H))], [0.013 * H, 0.012 * H, 0.01 * H], 6)
b.add('noose', merge(rod(noose, [0.012 * H] * 25, 6), *coils, tail), rope, region='torso', subdiv=0)
belt = [torso_pt((k / 28 - 0.5) * TAU, 0.06, 1.0, 0.028) for k in range(29)]
bk = torso_pt(0.12, 0.06, 1.0, 0.04)
b.add('belt_rope', merge(rod(belt, [0.014 * H] * 29, 6), ellipsoid(tuple(bk), (0.025 * H, 0.016 * H, 0.025 * H), 8, 6),
                         rod([bk, bk + Vector((0.005 * H, -0.006 * H, -0.12 * H)), bk + Vector((0.0, -0.008 * H, -0.24 * H))], [0.012 * H, 0.011 * H, 0.009 * H], 6)), rope, region='torso', subdiv=0)
# correntes douradas caindo pelo peito, de ombro a ombro
chains = []
for k, sag in enumerate((0.12, 0.2, 0.28)):
    pts = []
    for i in range(17):
        a = (i / 16 - 0.5) * 2.0
        z = 0.6 - sag * math.cos(a * 0.78) ** 2
        pts.append(torso_pt(a, z, 1.0, 0.045 + 0.004 * k))
    chains.append(rod(pts, [0.004 * H] * 17, 4))
b.add('chains', merge(*chains), gold, region='torso', subdiv=0)

# ---------------------------------------------------------------- CABELO: tranças finas caindo pelos lados e por trás
HC = Vector((hc.x, hc.y + 0.006, hc.z + 0.012))
HR = (0.128 * H, 0.14 * H, 0.172 * H)
b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), HR, front=0.22, side=0.5, back=0.66), hairm, region='head')
braids = []
for i in range(30):
    a = math.pi * 0.3 + (i / 29) * math.pi * 1.4
    root = HC + Vector((math.sin(a) * HR[0] * 0.95, -math.cos(a) * HR[1] * 0.95, HR[2] * 0.55))
    mid = HC + Vector((math.sin(a) * HR[0] * 1.08, -math.cos(a) * HR[1] * 1.08, -HR[2] * 0.2))
    ln = random.uniform(0.2, 0.32) * H
    o = Vector((math.sin(a), -math.cos(a), 0)) * 0.03 * H
    pts = [root, mid, mid + o + Vector((0, 0, -ln * 0.5)), mid + o * 1.4 + Vector((0, 0, -ln))]
    braids.append(rod(pts, [0.012 * H, 0.012 * H, 0.011 * H, 0.009 * H], 5))
    # contas douradas na ponta de algumas tranças
    if i % 4 == 0:
        braids.append(ellipsoid(tuple(pts[-1]), (0.011 * H, 0.011 * H, 0.016 * H), 6, 4))
b.add('braids', merge(*braids), hairm, region='head', subdiv=0)

b.export(OUT)
