"""
FERREIRO (o Luzidio de Santo Berço; Miguel Cariad) — public/models/ferreiro.glb
Referências (wiki, galeria do Ferreiro): Portrait_Ferreiro, as miniaturas de O Segredo na Floresta (normal e "mais
forte"), a arte dos Luzidios no Livro de Regras, a capa do ep. 10 e as páginas da graphic novel.
Aparência (wiki): 2,20 m, alto e forte; cabelo e barba BRANCOS; pele acinzentada, olhos todo pretos, orelhas
pontiagudas; faixas pretas no rosto (dos olhos descendo e curvando para as bochechas, e do nariz subindo pela cabeça);
peitoral e braceletes de metal, pano vermelho na cintura, calça marrom, faixas nas pernas, meias pretas e chinelas
marrons; queimaduras pelos braços e um pouco no rosto.
Nas artes: braços e ombros ENORMES (todo o braço manchado das queimaduras), cabelo volumoso penteado para trás, barba
longa e pontuda até o peito com bigode, peitoral de placas (as de baixo em lâminas) com alças de couro por cima dos
ombros (como um avental de ferreiro), braceletes largos e lisos, o pano vermelho caindo na frente, correntes na
cintura e caneleiras de metal segmentadas por cima das faixas.
A Espada Consumidora é adicionada em código (props.js → espadaConsumidora).
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'ferreiro.glb'
random.seed(2020)  # Santo Berço
b = Builder(width=1.12, bulk=1.32, height=1.22)  # 2,20 m, enorme
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_luzidio', '#8e9096', 0.85)
arms = material('arms_luzidio', '#ffffff', 0.85)        # braços inteiros queimados (textura)
pants = material('pants_brown', '#5a3e28', 0.9)
steel = material('plate_steel', '#8a8e96', 0.3, metal=0.85)
steel_dk = material('plate_dark', '#4a4c52', 0.4, metal=0.85)
strap = material('leather_strap', '#3e2a1c', 0.75)
red = material('cloth_red', '#8a1a1e', 0.85)
leather = material('leather_sandal', '#6a4428', 0.8)
sock = material('sock_black', '#1c1a1c', 0.9)
wrap = material('leg_wrap', '#8a8070', 0.9)
chainm = material('chain_iron', '#5a5a60', 0.4, metal=0.9)
white = material('fur_white', '#ffffff', 0.7)            # cabelo e barba brancos (textura de fios)

M = {
    'skin': skin,
    'face': material('face_luzidio', '#ffffff', 0.85),
    'torso': skin,
    'hand': skin,
}


# ---------------------------------------------------------------- utilidades
def lerp_table(tab, x):
    if x <= tab[0][0]:
        return tab[0][1:]
    for a, c in zip(tab, tab[1:]):
        if x <= c[0]:
            t = (x - a[0]) / (c[0] - a[0])
            return tuple(p + (q - p) * t for p, q in zip(a[1:], c[1:]))
    return tab[-1][1:]


def rod(pts, radii, seg=6, caps=True, flat=None):
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
    if caps:
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


# ---------------------------------------------------------------- TRONCO em V: cintura firme, dorsais e peito enormes,
# trapézio alto (z relativo ao quadril, meia-largura, profundidade da FRENTE, das COSTAS — frações de H)
TT = [
    (-0.16, 0.19, 0.14, 0.14),
    (-0.06, 0.192, 0.142, 0.145),
    (0.04, 0.196, 0.148, 0.15),    # cintura
    (0.14, 0.212, 0.158, 0.158),
    (0.24, 0.24, 0.17, 0.166),
    (0.33, 0.272, 0.186, 0.174),   # dorsais
    (0.42, 0.292, 0.198, 0.18),    # peitoral
    (0.5, 0.298, 0.196, 0.184),
    (0.56, 0.278, 0.172, 0.178),
    (0.6, 0.25, 0.145, 0.165),
    (0.64, 0.2, 0.122, 0.142),     # trapézio
    (0.675, 0.14, 0.1, 0.112),
    (0.71, 0.105, 0.088, 0.092),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    """ponto na superfície do tronco (antes da escala), a = ângulo (0 = frente), z relativo ao quadril em H."""
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def luz_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = luz_torso
hc = b.body(M, [], arms=(), legs=False, head_r=(0.134, 0.144, 0.156), neck_r=0.1)

# ---------------------------------------------------------------- BRAÇOS enormes, inteiros queimados
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    rings = []
    shtop = s + Vector((-sx * 0.025 * H, 0, 0.0))
    for i in range(9):
        t = i / 8
        p = shtop.lerp(e, t)
        r = 0.104 + 0.032 * math.sin(t * math.pi * 0.95) - 0.024 * t   # bíceps cheio, afina no cotovelo
        rings.append((p.x, p.y, p.z, r, r * 1.05))
    for i in range(1, 8):
        t = i / 7 * 0.94
        p = e.lerp(h, t)
        r = 0.08 + 0.03 * math.sin(min(1.0, t * 2.2) * math.pi * 0.5) * (1 - t) - 0.018 * t + 0.006 * (1 - t)  # antebraço de ferreiro: estreito no cotovelo, cheio logo abaixo
        rings.append((p.x, p.y, p.z, r, r * 0.92))
    b.add('arm' + side, tube(rings, 16), arms, region='arm' + side, subdiv=0)
    b.add('delt' + side, ellipsoid((s.x + sx * 0.008 * H, s.y, s.z - 0.02 * H), (0.108 * H, 0.115 * H, 0.1 * H), 16, 12), arms, region='arm' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.085), skin, region='e' + side)
    # BRACELETE de metal: largo e liso, com as bordas mais grossas
    b.add('bracer' + side, tube(limb_rings(e.lerp(h, 0.5), e.lerp(h, 0.86), 0.094, 0.088, n=2), 16), steel, region='e' + side, subdiv=0)
    rims = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.05), 0.1 - t * 0.012, 0.1 - t * 0.012, n=1), 16) for t in (0.49, 0.82)]
    b.add('bracer_rim' + side, merge(*rims), steel_dk, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- PEITORAL de placas
# placa do peito (frente e costas), com o decote na frente; embaixo, 3 lâminas sobrepostas sobre a barriga
def plate_top(a):
    return 0.575 - 0.06 * max(0.0, math.cos(a)) ** 6


b.add('chestplate', grid(lambda u, v: (lambda a: (lambda p: p)(torso_pt(a, plate_top(a) - v * (plate_top(a) - 0.3), 1.0, 0.035)))((u - 0.5) * TAU), 36, 8), steel, region='torso', subdiv=0)
lames = []
for i in range(3):
    z0 = 0.3 - i * 0.075
    lames.append(grid(lambda u, v, z0=z0, i=i: torso_pt((u - 0.5) * TAU, z0 + 0.012 - v * 0.087, 1.0, 0.04 + 0.006 * (2 - i) + 0.004 * v), 36, 2))
b.add('lames', merge(*lames), steel, region='torso', subdiv=0)
lrims = [rod([torso_pt(a, 0.3 - i * 0.075 - 0.075, 1.0, 0.05 + 0.006 * (2 - i)) for a in [(k / 36 - 0.5) * TAU for k in range(37)]], [0.007 * H] * 37, 5) for i in range(3)]
b.add('lame_rims', merge(*lrims), steel_dk, region='torso', subdiv=0)
# bordas grossas da placa e o vinco do meio do peito
rim_top = [torso_pt(a, plate_top(a), 1.0, 0.042) for a in [(k / 36 - 0.5) * TAU for k in range(37)]]
rim_bot = [torso_pt(a, 0.3, 1.0, 0.044) for a in [(k / 36 - 0.5) * TAU for k in range(37)]]
ridge = [torso_pt(0, z, 1.0, 0.045) for z in (0.31, 0.4, 0.48, 0.52)]
b.add('plate_rims', merge(rod(rim_top, [0.012 * H] * 37, 6), rod(rim_bot, [0.011 * H] * 37, 6), rod(ridge, [0.008 * H] * 4, 5)), steel_dk, region='torso', subdiv=0)
# alças de couro: da placa, por cima dos ombros, até as costas (o "avental" do ferreiro), com rebites
straps, rv = [], []
for s_ in (1, -1):
    pts = [torso_pt(s_ * 0.55, 0.53, 1.0, 0.05), torso_pt(s_ * 0.85, 0.62, 1.0, 0.06), torso_pt(s_ * 1.6, 0.665, 1.0, 0.06),
           torso_pt(s_ * 2.35, 0.62, 1.0, 0.06), torso_pt(s_ * 2.6, 0.53, 1.0, 0.05)]
    straps.append(rod(pts, [0.024 * H] * 5, 6, flat=(outward, 0.3)))
    for p in (pts[0], pts[-1]):
        rv.append(ellipsoid(tuple(p + outward(p) * 0.012 * H), (0.012 * H,) * 3, 6, 4))
for a in (-1.2, -0.6, 0.6, 1.2):
    p = torso_pt(a, 0.44, 1.0, 0.042)
    rv.append(ellipsoid(tuple(p + outward(p) * 0.004 * H), (0.01 * H,) * 3, 6, 4))
b.add('straps', merge(*straps), strap, region='torso', subdiv=0)
b.add('rivets', merge(*rv), steel_dk, region='torso', subdiv=0)

# ---------------------------------------------------------------- PANO VERMELHO na cintura e correntes
b.add('sash', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.1 - v * 0.2, 1.0, 0.03 + 0.01 * v), 32, 3), red, region='torso', subdiv=0)
for s_ in (0, math.pi):  # aba que cai na frente e atrás, abrindo um pouco
    def flap(u, v, s_=s_):
        a = s_ + (u - 0.5) * 0.85 * (1 + 0.2 * v)
        p = torso_pt(a, -0.08, 1.0, 0.04)
        sw = math.sin(u * math.pi * 3 + v * 2) * 0.006 * H * v
        return Vector((p.x, p.y * (1 + 0.15 * v) - (0.01 * H * v if s_ == 0 else -0.01 * H * v) + sw, hz - 0.08 * H - v * (0.32 if s_ == 0 else 0.28) * H * (1 - 0.35 * abs(u - 0.5) ** 1.5)))
    b.add('loincloth' + ('F' if s_ == 0 else 'B'), grid(flap, 8, 6), red, region='skirt', subdiv=0)
# duas correntes penduradas na frente (de um quadril ao outro, em curva) e uma em volta da cintura
links = []
def chain_links(pts, r=0.016 * H):
    for i in range(len(pts) - 1):
        p, q = pts[i], pts[i + 1]
        c = (p + q) / 2
        links.append(ellipsoid(tuple(c), (r * 1.2 if i % 2 else r * 0.7, r * 0.7 if i % 2 else r * 1.2, r * 0.55), 6, 4))
for k, (z0, sag) in enumerate(((0.02, 0.1), (-0.02, 0.18))):
    pts = []
    for i in range(23):
        t = i / 22
        a = -1.35 + t * 2.7
        p = torso_pt(a, z0 - sag * math.sin(t * math.pi), 1.0, 0.065 + 0.02 * math.sin(t * math.pi))
        pts.append(p)
    chain_links(pts)
ring_pts = [torso_pt(a, 0.1, 1.0, 0.045) for a in [(k / 40 - 0.5) * TAU for k in range(41)]]
chain_links(ring_pts, 0.012 * H)
b.add('chains', merge(*links), chainm, region='torso', subdiv=0)

# ---------------------------------------------------------------- PERNAS: calça marrom, faixas, caneleiras e chinelas
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    sx = 1 if side == 'L' else -1
    topp = Vector((l.x, l.y, l.z + 0.07 * H))
    rings = []
    for t, r in ((0.0, 0.125), (0.3, 0.124), (0.65, 0.108), (1.0, 0.092)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.2, 0.09), (0.45, 0.082), (0.7, 0.07), (0.9, 0.062)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('pants' + side, tube(rings, 16), pants, region='leg' + side, subdiv=0)
    # faixas enroladas do joelho até a caneleira
    wr = [tube(limb_rings(k.lerp(f, t), k.lerp(f, t + 0.06), 0.093 - t * 0.02, 0.092 - t * 0.02, n=1), 14) for t in (0.04, 0.12, 0.2, 0.28)]
    b.add('wraps' + side, merge(*wr), wrap, region='k' + side, subdiv=0)
    # caneleira de metal SEGMENTADA (anéis sobrepostos que afinam até o tornozelo) e a joelheira
    gs = [tube(limb_rings(k.lerp(f, 0.36 + i * 0.11), k.lerp(f, 0.36 + i * 0.11 + 0.09), 0.09 - i * 0.006, 0.084 - i * 0.006, n=1), 14) for i in range(5)]
    b.add('greave' + side, merge(*gs), steel_dk, region='k' + side, subdiv=0)
    b.add('kneecap' + side, ellipsoid((k.x, k.y - 0.088, k.z - 0.02), (0.058, 0.03, 0.062), 10, 8, theta_max=math.pi * 0.8), steel_dk, region='k' + side, subdiv=0)
    # meia preta e a chinela marrom (sola com tiras)
    b.add('sock' + side, ellipsoid((f.x, f.y - 0.06 * H, f.z + 0.035 * H), (0.058 * H, 0.13 * H, 0.05 * H), 12, 8), sock, region='foot' + side, subdiv=0)
    b.add('sandal' + side, box((f.x, f.y - 0.065 * H, f.z - 0.012 * H), (0.13 * H, 0.3 * H, 0.03 * H), bevel=0.006), leather, region='foot' + side, subdiv=0)
    tiras = [tube([(f.x, f.y - yy * H, f.z + 0.03 * H, 0.062 * H, 0.045 * H), (f.x, f.y - yy * H - 0.018 * H, f.z + 0.03 * H, 0.062 * H, 0.045 * H)], 12) for yy in (0.02, 0.12)]
    b.add('sandal_straps' + side, merge(*tiras), leather, region='foot' + side, subdiv=0)

# ---------------------------------------------------------------- CABEÇA: orelhas pontudas, cabelo, barba e bigode
HR = (0.138 * H, 0.148 * H, 0.16 * H)
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.01))
# orelhas de Luzidio: folha longa e fina apontando para cima e para trás
ears = []
for s_ in (1, -1):
    base = Vector((s_ * 0.13 * H, 0.004 * H, hc.z - 0.005 * H))
    pts = [base, base + Vector((s_ * 0.035 * H, 0.012 * H, 0.045 * H)), base + Vector((s_ * 0.06 * H, 0.03 * H, 0.1 * H)), base + Vector((s_ * 0.075 * H, 0.045 * H, 0.15 * H))]
    ears.append(rod(pts, [0.03 * H, 0.03 * H, 0.018 * H, 0.004 * H], 8, flat=(lambda p, s_=s_: Vector((s_, 0, 0)), 0.35)))
b.add('ears_pointy', merge(*ears), skin, region='head', subdiv=0)

b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.98, HR[1] * 0.98, HR[2] * 0.98), front=0.24, side=0.42, back=0.66), white, region='head')


# cabelo PENTEADO PARA TRÁS com volume na frente: mechas que correm da testa por cima da cabeça até a nuca
# (gam = posição de lado a lado, beta = ao longo da mecha, da testa até a nuca)
def hair_pt(gam, beta, r):
    return HC + Vector((math.sin(gam) * HR[0] * r, -math.cos(beta) * math.cos(gam) * HR[1] * r, math.sin(beta) * math.cos(gam) * HR[2] * r))


locks = []
N = 26
for i in range(N):
    gam = -1.15 + 2.3 * i / (N - 1) + random.uniform(-0.03, 0.03)
    b0 = 0.62 + 0.45 * abs(gam) ** 1.5 + random.uniform(-0.04, 0.04)
    b1 = 3.45 + random.uniform(-0.1, 0.1) - 0.25 * abs(gam)
    pts, rad = [], []
    for k in range(10):
        t = k / 9
        beta = b0 + (b1 - b0) * t
        puff = 0.16 * math.exp(-((beta - 1.25) / 0.5) ** 2) * (1 - 0.6 * abs(gam))   # topete
        r = 1.06 + puff + 0.02 * math.sin(t * 7 + i)
        pts.append(hair_pt(gam, beta, r))
        rad.append((0.03 + 0.012 * math.sin(t * math.pi)) * H * (1 - 0.55 * t ** 3))
    locks.append(rod(pts, rad, 7))
b.add('hair_locks', merge(*locks), white, region='head', subdiv=0)

# BARBA longa e pontuda: do rosto até o meio do peito, sempre na frente do peitoral
rings = []
for k in range(12):
    t = k / 11
    z = hc.z - 0.035 * H - t * 0.44 * H
    w = 0.142 * H * (1 - t) ** 0.65 + 0.006 * H
    d = (0.075 - 0.035 * t) * H
    y = hc.y - (0.06 + 0.25 * t ** 1.25) * H
    rings.append((0.0, y, z, w, d))
beard = tube(rings, 20)
b.add('beard', beard, white, region='head', subdiv=0)
# mechas soltas por cima da barba (volume e ponta)
strands = []
for i in range(9):
    x = (i - 4) / 4
    pts, rad = [], []
    for k in range(7):
        t = k / 6
        tt = 0.08 + t * (0.88 - 0.25 * abs(x))
        z = hc.z - 0.035 * H - tt * 0.44 * H
        w = 0.142 * H * (1 - tt) ** 0.65
        y = hc.y - (0.06 + 0.25 * tt ** 1.25) * H - (0.075 - 0.035 * tt) * H * 0.85 * math.cos(x * 1.1)
        pts.append(Vector((x * w * 0.85, y, z)))
        rad.append(0.018 * H * (1 - 0.6 * t))
    strands.append(rod(pts, rad, 6))
b.add('beard_strands', merge(*strands), white, region='head', subdiv=0)
# bigode grosso caindo pelos lados da boca
mus = []
for s_ in (1, -1):
    pts = [Vector((s_ * 0.004 * H, hc.y - 0.148 * H, hc.z - 0.03 * H)), Vector((s_ * 0.035 * H, hc.y - 0.145 * H, hc.z - 0.045 * H)),
           Vector((s_ * 0.06 * H, hc.y - 0.13 * H, hc.z - 0.07 * H)), Vector((s_ * 0.07 * H, hc.y - 0.12 * H, hc.z - 0.1 * H))]
    mus.append(rod(pts, [0.016 * H, 0.02 * H, 0.016 * H, 0.008 * H], 7))
b.add('mustache', merge(*mus), white, region='head', subdiv=0)

b.export(OUT)
