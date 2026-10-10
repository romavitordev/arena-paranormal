"""
GUIZO (Guilherme R. Santos) — Os Cinco (Sinais do Outro Lado) — public/models/guizo.glb
Referências: Referencias visuais/Personagens/Guizo ("guizo corpo todo" = arte promocional, "Guizo rosto", "Guizo e sua
camera", "Guizo ET", "Guizo velho") + a wiki (Guilherme_Santos: aparência, miniaturas e galeria dos disfarces).
Wiki: 1,72 m, pele clara, rosto fino, olhos avermelhados, cabelo liso bagunçado pintado de VERMELHO-VINHO com a raiz
PRETA; camiseta preta da banda "ahlevo" (ovelha de cabeça para baixo) por cima de uma camisa listrada vermelha e
branca; calça rasgada; cinto ATRAVESSADO com frascos, um saco e a faca de detalhes dourados; vários bolsos; POCHETE
com adesivos (alienígena, nave, a ovelha, "OVNI") e um pano XADREZ preto e vermelho preso nela; a câmera na mão
direita (aqui na esquerda: a direita é da faca); MOCHILA com uma CORRENTE presa embaixo e o adesivo de diabo.
Na arte: fone de ouvido no pescoço, colete de alças de couro com bolsinhas na barriga, rádio "GUIZO" na alça,
fivela dourada de cabeça de alienígena, bolsas na coxa esquerda, munhequeiras, relógio, coturnos pretos de cano alto
com cadarço branco, uma antena parabólica e uma lanterna presas na mochila.
O cabelo é a peça `prop_hair` (some no disfarce alienígena da Transformação). A câmera, a faca e a cabeça de ET são
montadas em código (src/models/props.js → camcorder, facaGuizo, etHead).
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'guizo.glb'
random.seed(1997)  # Varminho
b = Builder(width=0.94, bulk=0.92, height=0.955)  # 1,72 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_guizo', '#e2b08c', 0.75)
shirt = material('shirt_guizo', '#ffffff', 0.85)        # camiseta preta "ahlevo" (textura)
sleeve = material('sleeve_guizo', '#ffffff', 0.85)      # camisa listrada vermelha e branca (textura)
black = material('tee_black', '#232126', 0.85)
pants = material('pants_guizo', '#ffffff', 0.9)         # calça cinza-oliva rasgada (textura)
leather = material('leather_guizo', '#6a4428', 0.7)
leather_dk = material('leather_guizo_dk', '#4a2e1a', 0.75)
brass = material('brass_guizo', '#d8a830', 0.35, metal=0.8)
boot = material('boot_guizo', '#1e1c22', 0.6)
sole = material('sole_white', '#e8e4dc', 0.7)
lace = material('lace_white', '#dedad2', 0.8)
grey = material('gear_grey', '#7a7c84', 0.5, metal=0.4)
red = material('gear_red', '#b02028', 0.6)
glass = material('vial_glass', '#9ad0e8', 0.15, alpha=0.85)
green = material('sticker_green', '#3aa040', 0.6)
orange = material('sticker_orange', '#e8902a', 0.6)
white = material('sticker_white', '#e8e8e8', 0.6)
plaid = material('plaid_guizo', '#ffffff', 0.9)         # pano xadrez preto e vermelho (textura)
chainm = material('chain_guizo', '#9a9aa2', 0.35, metal=0.9)
hair_red = material('hair_guizo', '#8a1a2c', 0.55)
hair_root = material('hair_guizo_root', '#18121a', 0.6)

M = {
    'skin': skin,
    'face': material('face_guizo', '#ffffff', 0.75),
    'torso': shirt,
    'hand': skin,
    'legs': pants,
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


# ---------------------------------------------------------------- TRONCO magro (camiseta folgada)
TT = [
    (-0.16, 0.168, 0.124, 0.124),
    (-0.04, 0.168, 0.124, 0.122),
    (0.1, 0.162, 0.12, 0.12),
    (0.22, 0.168, 0.122, 0.122),
    (0.34, 0.186, 0.13, 0.124),
    (0.44, 0.196, 0.134, 0.126),
    (0.52, 0.19, 0.126, 0.122),
    (0.575, 0.158, 0.106, 0.108),
    (0.62, 0.11, 0.082, 0.086),
    (0.655, 0.076, 0.066, 0.068),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def guizo_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = guizo_torso
hc = b.body(M, [], arms=(), legs=False, head_r=(0.128, 0.14, 0.156), neck_r=0.058)

# ---------------------------------------------------------------- BRAÇOS: manga curta preta por cima da listrada
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    top = s + Vector((-sx * 0.012 * H, 0, 0.03 * H))
    rings = []
    for i in range(7):
        t = i / 6
        p = top.lerp(e, t)
        r = 0.064 + 0.006 * math.sin(t * math.pi) - 0.008 * t
        rings.append((p.x, p.y, p.z, r, r))
    for i in range(1, 5):
        t = i / 4 * 0.5
        p = e.lerp(h, t)
        rings.append((p.x, p.y, p.z, 0.055 - 0.004 * t, 0.055 - 0.004 * t))
    b.add('stripes' + side, tube(rings, 14), sleeve, region='arm' + side, subdiv=0)
    # dobra da manga listrada arregaçada no antebraço
    b.add('stripes_cuff' + side, tube(limb_rings(e.lerp(h, 0.44), e.lerp(h, 0.54), 0.06, 0.059, n=1), 14), sleeve, region='e' + side, subdiv=0)
    # antebraço de pele e a mão
    fr = [(p.x, p.y, p.z, r, r) for p, r in ((e.lerp(h, t), 0.05 - 0.008 * t) for t in (0.45, 0.6, 0.75, 0.9))]
    b.add('forearm' + side, tube(fr, 12), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.05), skin, region='e' + side)
    # manga curta da camiseta preta (folgada, quase até o cotovelo)
    tee = []
    for i in range(4):
        t = 0.06 + i / 3 * 0.52
        p = top.lerp(e, t)
        r = 0.07 - 0.004 * t
        tee.append((p.x, p.y, p.z, r, r))
    b.add('tee_sleeve' + side, tube(tee, 14), black, region='arm' + side, subdiv=0)
# munhequeiras: na esquerda a pulseira preta "ahlevo" e uma de couro; na direita o relógio
eL, hL, eR, hR = sk['eL'], sk['handL'], sk['eR'], sk['handR']
b.add('wristbands', merge(tube(limb_rings(eL.lerp(hL, 0.8), eL.lerp(hL, 0.9), 0.05, 0.05, n=1), 12), tube(limb_rings(eL.lerp(hL, 0.91), eL.lerp(hL, 0.95), 0.046, 0.046, n=1), 12)), black, region='eL', subdiv=0)
b.add('wristband_leather', tube(limb_rings(eL.lerp(hL, 0.72), eL.lerp(hL, 0.78), 0.05, 0.05, n=1), 12), leather_dk, region='eL', subdiv=0)
b.add('watch_band', tube(limb_rings(eR.lerp(hR, 0.84), eR.lerp(hR, 0.9), 0.047, 0.047, n=1), 12), black, region='eR', subdiv=0)
wp = eR.lerp(hR, 0.87)
b.add('watch_face', ellipsoid((wp.x - 0.047 * 1.34, wp.y - 0.004, wp.z), (0.008, 0.02, 0.02), 8, 6), grey, region='eR', subdiv=0)

# ---------------------------------------------------------------- PESCOÇO: fone de ouvido e colar de cordão
neck_z = hz + 0.64 * H
phones = [rod([Vector((math.sin(a) * 0.07 * H, -math.cos(a) * 0.066 * H, neck_z + 0.012 * H - 0.02 * H * math.cos(a))) for a in [(k / 20 - 0.5) * TAU * 0.9 for k in range(21)]], [0.009 * H] * 21, 6)]
b.add('headphone_band', merge(*phones), grey, region='torso', subdiv=0)
cups = []
for s_ in (1, -1):
    c = Vector((s_ * 0.06 * H, -0.075 * H, neck_z - 0.025 * H))
    cups.append(ellipsoid(tuple(c), (0.024 * H, 0.014 * H, 0.026 * H), 10, 8))
b.add('headphone_cups', merge(*cups), black, region='torso', subdiv=0)
b.add('headphone_rings', merge(*[tube([(s_ * 0.06 * H, -0.08 * H, neck_z - 0.025 * H, 0.026 * H, 0.008 * H), (s_ * 0.06 * H, -0.084 * H, neck_z - 0.025 * H, 0.026 * H, 0.008 * H)], 12) for s_ in (1, -1)]), red, region='torso', subdiv=0)
b.add('cord_necklace', rod([torso_pt(a, 0.58 - 0.12 * max(0.0, math.cos(a)) ** 3, 1.0, 0.012) for a in [(k / 24 - 0.5) * TAU for k in range(25)]], [0.004 * H] * 25, 4), leather_dk, region='torso', subdiv=0)

# ---------------------------------------------------------------- COLETE DE ALÇAS, bolsinhas, rádio
straps = []
for s_ in (1, -1):
    pts = [torso_pt(s_ * 0.42, 0.2, 1.0, 0.03), torso_pt(s_ * 0.5, 0.42, 1.0, 0.025), torso_pt(s_ * 0.62, 0.56, 1.0, 0.03), torso_pt(s_ * 1.4, 0.64, 1.0, 0.035),
           torso_pt(s_ * 2.4, 0.56, 1.0, 0.03), torso_pt(s_ * 2.7, 0.3, 1.0, 0.03)]
    straps.append(rod(pts, [0.016 * H] * 6, 5, flat=(outward, 0.3)))
# o cinto do colete na barriga
straps.append(rod([torso_pt(a, 0.2, 1.0, 0.026) for a in [(k / 32 - 0.5) * TAU for k in range(33)]], [0.022 * H] * 33, 5, flat=(outward, 0.35)))
b.add('vest_straps', merge(*straps), leather, region='torso', subdiv=0)
pouches = []
for a in (-0.75, -0.3, 0.2, 0.62, 1.05):
    p = torso_pt(a, 0.2, 1.0, 0.045)
    n = outward(p)
    c = p + n * 0.01 * H
    pouches.append(box((c.x, c.y, c.z), (0.07 * H * abs(math.cos(a)) + 0.03 * H, 0.04 * H + 0.03 * H * abs(math.sin(a)), 0.08 * H), bevel=0.006))
b.add('vest_pouches', merge(*pouches), leather_dk, region='torso', subdiv=0)
flaps = [box(tuple(torso_pt(a, 0.235, 1.0, 0.07)), (0.072 * H, 0.012 * H, 0.03 * H), bevel=0.004) for a in (-0.3, 0.2)]
b.add('vest_flaps', merge(*flaps), leather, region='torso', subdiv=0)
# rádio "GUIZO" na alça esquerda (do lado dele) e a antena
rp = torso_pt(0.55, 0.47, 1.0, 0.06)
b.add('radio', box((rp.x, rp.y, rp.z), (0.045 * H, 0.025 * H, 0.075 * H), bevel=0.004), grey, region='torso', subdiv=0)
b.add('radio_bits', merge(cone((rp.x + 0.012 * H, rp.y, rp.z + 0.035 * H), (rp.x + 0.014 * H, rp.y + 0.004, rp.z + 0.13 * H), 0.004 * H, 5),
                          box((rp.x, rp.y - 0.013 * H, rp.z + 0.018 * H), (0.03 * H, 0.004 * H, 0.016 * H))), red, region='torso', subdiv=0)

# ---------------------------------------------------------------- CINTURA: cinto, fivela de alienígena, pochete e xadrez
b.add('belt', rod([torso_pt(a, -0.02, 1.0, 0.018) for a in [(k / 32 - 0.5) * TAU for k in range(33)]], [0.018 * H] * 33, 5, flat=(outward, 0.4)), leather_dk, region='torso', subdiv=0)
bk_ = torso_pt(0, -0.02, 1.0, 0.03)
b.add('alien_buckle', merge(ellipsoid((bk_.x, bk_.y, bk_.z), (0.032 * H, 0.012 * H, 0.036 * H), 10, 8),
                            cone((bk_.x - 0.03 * H, bk_.y, bk_.z), (bk_.x - 0.06 * H, bk_.y + 0.004, bk_.z + 0.02 * H), 0.012 * H, 5),
                            cone((bk_.x + 0.03 * H, bk_.y, bk_.z), (bk_.x + 0.06 * H, bk_.y + 0.004, bk_.z + 0.02 * H), 0.012 * H, 5)), brass, region='torso', subdiv=0)
b.add('alien_buckle_eyes', merge(*[ellipsoid((bk_.x + s_ * 0.011 * H, bk_.y - 0.011 * H, bk_.z + 0.006 * H), (0.008 * H, 0.004 * H, 0.005 * H), 6, 4) for s_ in (1, -1)]), black, region='torso', subdiv=0)
# pochete: na frente, do lado esquerdo dele, um pouco abaixo do cinto
pc = torso_pt(-0.62, 0.04, 1.0, 0.07)  # do lado direito dele (na arte, à esquerda de quem olha)
b.add('fanny_pack', ellipsoid((pc.x, pc.y, pc.z), (0.085 * H, 0.05 * H, 0.05 * H), 14, 10), leather, region='torso', subdiv=0)
pn = outward(pc)
st = []
st_green = ellipsoid(tuple(pc + pn * 0.05 * H + Vector((0.03 * H, 0, -0.012 * H))), (0.012 * H,) * 3, 8, 6)
st_white = ellipsoid(tuple(pc + pn * 0.048 * H + Vector((-0.01 * H, 0, -0.015 * H))), (0.013 * H, 0.01 * H, 0.01 * H), 8, 6)
b.add('sticker_alien', st_green, green, region='torso', subdiv=0)
b.add('sticker_sheep', st_white, white, region='torso', subdiv=0)
b.add('sticker_ovni', box(tuple(pc + pn * 0.048 * H + Vector((-0.035 * H, 0, 0.018 * H))), (0.04 * H, 0.012 * H, 0.016 * H)), orange, region='torso', subdiv=0)


# pano xadrez preso na pochete, caindo pelo quadril esquerdo
def plaid_pt(u, v):
    p = torso_pt(-0.95 - u * 0.55, 0.0, 1.0, 0.03 + 0.03 * v)
    return Vector((p.x * (1 + 0.15 * v), p.y * (1 + 0.1 * v), hz - v * 0.26 * H * (1 - 0.3 * abs(u - 0.4)) + 0.005 * H * math.sin(u * 14)))


b.add('plaid_cloth', grid(plaid_pt, 6, 5), plaid, region='skirt', subdiv=0)

# ---------------------------------------------------------------- PERNAS: calça larga rasgada e coturnos pretos
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    topp = Vector((l.x, l.y, l.z + 0.06 * H))
    rings = []
    for t, r in ((0.0, 0.088), (0.35, 0.084), (0.75, 0.076), (1.0, 0.072)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.25, 0.07), (0.5, 0.068), (0.68, 0.072), (0.76, 0.068)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('pants' + side, tube(rings, 14), pants, region='leg' + side, subdiv=0)
    b.add('boot_shaft' + side, tube(limb_rings(k.lerp(f, 0.62), k.lerp(f, 0.98), 0.058, 0.056, n=3), 14), boot, region='k' + side, subdiv=0)
    b.add('boot_foot' + side, ellipsoid((f.x, f.y - 0.065 * H, f.z + 0.04 * H), (0.056 * H, 0.13 * H, 0.05 * H), 12, 8, theta_max=math.pi * 0.56), boot, region='foot' + side, subdiv=0)
    b.add('sole' + side, box((f.x, f.y - 0.065 * H, f.z - 0.006 * H), (0.12 * H, 0.27 * H, 0.03 * H), bevel=0.006), sole, region='foot' + side, subdiv=0)
    xs = []
    for j in range(5):
        t0 = 0.66 + j * 0.06
        p0, p1 = k.lerp(f, t0), k.lerp(f, t0 + 0.045)
        for s_ in (-1, 1):
            xs.append(rod([(p0.x + s_ * 0.032, p0.y - 0.058 * 1.3, p0.z), (p1.x - s_ * 0.032, p1.y - 0.058 * 1.3, p1.z)], [0.0045, 0.0045], 4))
    b.add('laces' + side, merge(*xs), lace, region='k' + side, subdiv=0)
# bolsas duplas na coxa esquerda (do lado dele)
lL, kL = sk['lL'], sk['kL']
tp = lL.lerp(kL, 0.55)
b.add('thigh_strap', merge(tube(limb_rings(lL.lerp(kL, 0.4), lL.lerp(kL, 0.44), 0.09, 0.09, n=1), 14), tube(limb_rings(lL.lerp(kL, 0.7), lL.lerp(kL, 0.74), 0.084, 0.084, n=1), 14)), leather_dk, region='legL', subdiv=0)
b.add('thigh_pouches', merge(box((tp.x + 0.05, tp.y - 0.075, tp.z), (0.045, 0.035, 0.09), bevel=0.006), box((tp.x + 0.095, tp.y - 0.045, tp.z), (0.04, 0.04, 0.09), bevel=0.006)), leather, region='legL', subdiv=0)

# ---------------------------------------------------------------- CINTO ATRAVESSADO: frascos, saquinho e a bainha
lR_, kR_ = sk['lR'], sk['kR']
d0 = torso_pt(1.1, 0.03, 1.0, 0.03)
d1 = torso_pt(0.0, -0.12, 1.0, 0.05)
d2 = Vector((sk['lR'].x - 0.02 * H, -0.105 * H, hz - 0.2 * H))
diag = [d0, d0.lerp(d1, 0.5) + Vector((0, -0.01 * H, 0)), d1, d1.lerp(d2, 0.5), d2]
b.add('diag_belt', rod(diag, [0.013 * H] * 5, 5, flat=(outward, 0.35)), leather_dk, region='skirt', subdiv=0)
vials = []
for i, t in enumerate((0.35, 0.5)):
    p = d0.lerp(d1, t) + Vector((0, -0.025 * H, -0.02 * H))
    vials.append(tube([(p.x, p.y, p.z - 0.03 * H, 0.012 * H, 0.012 * H), (p.x, p.y, p.z + 0.02 * H, 0.012 * H, 0.012 * H), (p.x, p.y, p.z + 0.03 * H, 0.006 * H, 0.006 * H)], 8))
b.add('vials', merge(*vials), glass, region='skirt', subdiv=0)
sp_ = d1.lerp(d2, 0.25) + Vector((0, -0.03 * H, -0.035 * H))
b.add('sack', ellipsoid((sp_.x, sp_.y, sp_.z), (0.03 * H, 0.025 * H, 0.04 * H), 10, 8), leather, region='skirt', subdiv=0)
sh0 = d1.lerp(d2, 0.55) + Vector((0, -0.022 * H, 0.02 * H))
sh1 = sh0 + Vector((-0.07 * H, -0.004 * H, -0.2 * H))
b.add('sheath', rod([sh0, sh0.lerp(sh1, 0.5), sh1], [0.014 * H, 0.012 * H, 0.004 * H], 6), leather_dk, region='skirt', subdiv=0)
b.add('sheath_tip', ellipsoid(tuple(sh0 + Vector((0, 0, 0.004 * H))), (0.016 * H, 0.012 * H, 0.008 * H), 8, 6), brass, region='skirt', subdiv=0)

# ---------------------------------------------------------------- MOCHILA: adesivo de diabo, corrente, antena e lanterna
bp = torso_pt(math.pi, 0.36, 1.0, 0.0)
bc = Vector((bp.x, bp.y + 0.075 * H, bp.z))
b.add('backpack', ellipsoid((bc.x, bc.y, bc.z), (0.15 * H, 0.08 * H, 0.17 * H), 16, 12), leather, region='torso', subdiv=0)
b.add('backpack_pocket', ellipsoid((bc.x, bc.y + 0.07 * H, bc.z - 0.06 * H), (0.1 * H, 0.03 * H, 0.07 * H), 12, 8), leather_dk, region='torso', subdiv=0)
b.add('backpack_straps', merge(*[rod([torso_pt(s_ * 2.6, 0.58, 1.0, 0.02), torso_pt(s_ * 2.9, 0.42, 1.0, 0.02), torso_pt(s_ * 2.8, 0.22, 1.0, 0.03)], [0.012 * H] * 3, 5) for s_ in (1, -1)]), leather_dk, region='torso', subdiv=0)
b.add('devil_sticker', merge(ellipsoid((bc.x - 0.05 * H, bc.y + 0.1 * H, bc.z - 0.05 * H), (0.018 * H, 0.004 * H, 0.018 * H), 8, 6),
                             cone((bc.x - 0.062 * H, bc.y + 0.1 * H, bc.z - 0.04 * H), (bc.x - 0.07 * H, bc.y + 0.1 * H, bc.z - 0.02 * H), 0.005 * H, 4),
                             cone((bc.x - 0.038 * H, bc.y + 0.1 * H, bc.z - 0.04 * H), (bc.x - 0.03 * H, bc.y + 0.1 * H, bc.z - 0.02 * H), 0.005 * H, 4)), red, region='torso', subdiv=0)
b.add('devil_paper', box((bc.x - 0.05 * H, bc.y + 0.098 * H, bc.z - 0.085 * H), (0.045 * H, 0.004 * H, 0.016 * H)), material('paper_yellow', '#e8d040', 0.8), region='torso', subdiv=0)
# antena parabólica pequena presa no alto da mochila (lado dele direito) e a lanterna pendurada do outro lado
dish_c = Vector((bc.x - 0.12 * H, bc.y + 0.02 * H, bc.z + 0.13 * H))
b.add('dish', ellipsoid(tuple(dish_c), (0.008 * H, 0.05 * H, 0.05 * H), 12, 8, theta_max=math.pi * 0.5), grey, region='torso', subdiv=0)
b.add('dish_tip', cone(tuple(dish_c), tuple(dish_c + Vector((-0.04 * H, 0, 0))), 0.01 * H, 6), red, region='torso', subdiv=0)
fl = Vector((bc.x + 0.13 * H, bc.y + 0.02 * H, bc.z - 0.14 * H))
b.add('flashlight', tube([(fl.x, fl.y, fl.z, 0.016 * H, 0.016 * H), (fl.x, fl.y, fl.z - 0.12 * H, 0.014 * H, 0.014 * H), (fl.x, fl.y, fl.z - 0.13 * H, 0.02 * H, 0.02 * H)], 10), black, region='torso', subdiv=0)
# corrente presa embaixo da mochila, pendurada em curva
links = []
c0 = Vector((bc.x + 0.1 * H, bc.y + 0.04 * H, bc.z - 0.16 * H))
c1 = Vector((bc.x - 0.04 * H, bc.y + 0.05 * H, bc.z - 0.17 * H))
pts = []
for i in range(17):
    t = i / 16
    p = c0.lerp(c1, t) + Vector((0, 0.01 * H * math.sin(t * math.pi), -0.16 * H * math.sin(t * math.pi)))
    pts.append(p)
for i in range(len(pts) - 1):
    c = (pts[i] + pts[i + 1]) / 2
    r = 0.009 * H
    links.append(ellipsoid(tuple(c), (r * 0.6, r * 0.9, r * 1.3) if i % 2 else (r * 0.9, r * 0.6, r * 1.3), 6, 4))
b.add('backpack_chain', merge(*links), chainm, region='torso', subdiv=0)

# ---------------------------------------------------------------- CABELO espetado vinho com a raiz preta (prop_hair)
HR = (0.132 * H, 0.144 * H, 0.16 * H)
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.012))


def hp(phi, th, r=1.0):
    return HC + Vector((math.sin(th) * math.sin(phi) * HR[0] * r, -math.sin(th) * math.cos(phi) * HR[1] * r, math.cos(th) * HR[2] * r))


b.add('prop_hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.99, HR[1] * 0.99, HR[2] * 0.99), front=0.24, side=0.5, back=0.64), hair_root, region='head')
roots, spikes = [], []
for i in range(120):
    # distribuição pela cabeça toda (topo, lados e nuca), mais densa em cima
    phi = random.uniform(-math.pi, math.pi)
    front = math.cos(phi)
    th = math.acos(1 - random.random() * (1.25 if front < 0.3 else 0.85)) if front > -0.6 else math.acos(1 - random.random() * 1.45)
    if front > 0.55 and th > 0.95:
        continue  # nada na testa abaixo da linha do cabelo
    p0 = hp(phi, th, 0.97)
    n = (p0 - HC).normalized()
    if front > 0.45 and th > 0.38:
        # franja: mechas pontudas caindo sobre a testa, para a frente e para baixo, abrindo para os lados
        d = (n * 0.45 + Vector((math.sin(phi) * 0.4, -0.55, -0.6))).normalized()
        ln = random.uniform(0.06, 0.1) * H
    elif th > 0.85:
        # lados e nuca: caem para baixo e para fora, curtas
        d = (n * 0.7 + Vector((0, 0.15, -0.55))).normalized()
        ln = random.uniform(0.05, 0.085) * H
    else:
        # topo: espetadas para cima e para trás, bagunçadas
        d = (n * 0.8 + Vector((random.uniform(-0.25, 0.25), 0.3, 0.35))).normalized()
        ln = random.uniform(0.08, 0.13) * H
    mid = p0 + n * 0.018 * H
    tip = mid + d * ln
    bend = mid.lerp(tip, 0.55) + n * 0.01 * H
    roots.append(rod([p0, mid], [0.022 * H, 0.02 * H], 6))
    spikes.append(rod([mid, bend, tip], [0.021 * H, 0.013 * H, 0.002 * H], 6))
b.add('prop_hair_roots', merge(*roots), hair_root, region='head', subdiv=0)
b.add('prop_hair_spikes', merge(*spikes), hair_red, region='head', subdiv=0)
b.group('prop_hair')

b.export(OUT)
