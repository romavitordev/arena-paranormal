"""
DALMO MAGNO — "O COLOSSO" (Natal Macabro / Hexatombe) — public/models/dalmo.glb.
Referências: Referencias visuais/Personagens/Dalmo ("Dalmo corpo intiero", "dalmo cintura pra cima", "Dalmo rosto",
"Dalmo rosto 2", "Colosso corpo inteiro", "Dalmo colocando mascara", "Dalmo se tornando Colosso", o gif e o dossiê) e a
wiki: 1,85 m, pele escura, porte enorme (ombros, braços e barriga), dreads curtos bem cuidados, cicatrizes pelo corpo.
  DALMO (base): camisa social escura de gola, mangas arregaçadas até o antebraço, fralda para fora; antebraços
    enfaixados; pulseira com o PINGENTE DE AXOLOTE rosa (a filha, Manu); calça cargo verde rasgada nos joelhos com
    faixa enrolada embaixo do joelho; coturnos marrom-claros de cadarço.
  COLOSSO (prop_colosso, ligado na Transformação): o tronco quase todo exposto (cicatrizes); gola de cobre rebitada do
    escafandro com espinhos; retalhos de pano cru caindo do ombro esquerdo e na frente; mangueiras vermelhas; arnês de
    tiras de couro com espinhos cruzando o peito e a barriga; o cinturão redondo cheio de espinhos; as MANOPLAS: braçadeiras
    de cobre com faixas e espinhos; bolsas na coxa; botas/caneleiras de cobre com espinhos.
  O ESCAFANDRO (capacete com os três visores vermelhos rachados e o axolote pendurado na frente) é montado em código
  (src/models/props.js → colossoHelmet), para a cena da Transformação poder levá-lo do peito à cabeça.
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'dalmo.glb'
random.seed(1979)  # Aracaju

b = Builder(width=1.26, bulk=1.3, height=1.03)  # 1,85 m, enorme (o maior do elenco)
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_dalmo', '#5a3a2a', 0.7)
shirt = material('shirt_dalmo', '#2e2d32', 0.85)
pants = material('pants_dalmo', '#ffffff', 0.9)          # cargo verde rasgado (textura)
bandage = material('bandage_dalmo', '#d8d0c0', 0.9)
boots = material('boots_dalmo', '#8a7052', 0.75)
sole = material('sole_dalmo', '#2a221a', 0.8)
lace = material('lace_dalmo', '#1a1612', 0.8)
hairm = material('hair_dalmo', '#141012', 0.6)
hairhi = material('hair_dalmo_hi', '#2c2422', 0.5)
button = material('button_dalmo', '#c8c4bc', 0.4)
band = material('strap_bracelet', '#2a1e18', 0.6)
pink = material('axolotl_pink', '#ff8ab8', 0.5)
# Colosso
copper = material('copper_colosso', '#b0602e', 0.4, metal=0.7)
brass = material('brass_colosso', '#c89a48', 0.35, metal=0.8)
spike = material('spike_steel', '#c8c8cc', 0.3, metal=0.8)
leather = material('leather_colosso', '#4a3020', 0.7)
cloth = material('cloth_colosso', '#c8a868', 0.95)       # pano cru dos retalhos
hose = material('hose_red', '#8a2a24', 0.6)
glove = material('glove_colosso', '#3a2a20', 0.75)

M = {
    'skin': skin,
    'face': material('face_dalmo', '#ffffff', 0.75),
    'torso': material('torso_dalmo', '#ffffff', 0.75),  # pele com cicatrizes (textura) — à mostra no Colosso
    'arm': shirt,          # mangas da camisa escura (no Colosso, o que sobrou da camisa rasgada)
    'hand': skin,
    'legs': pants,
    'feet': boots,
}
PROF = [(-0.12, 0.205), (0.0, 0.225), (0.12, 0.27), (0.24, 0.29), (0.36, 0.285), (0.46, 0.285), (0.54, 0.25), (0.6, 0.15), (0.66, 0.09)]  # barriga e peitoral enormes
hc = b.body(M, PROF, arm_r=(0.11, 0.095, 0.074), leg_r=(0.112, 0.088, 0.07), head_r=(0.148, 0.158, 0.168), neck_r=0.084)


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


def torso_pt(a, z, out=1.0, extra=0.0):
    """ponto na superfície do tronco (antes da escala), a = ângulo (0 = frente), z relativo ao quadril em H."""
    w = lerp_table(PROF, z)[0]
    return Vector((math.sin(a) * (w + extra) * out * H, -math.cos(a) * (w * 0.62 + extra) * out * H, hz + z * H))


def spikes_on(pts_normals, ln=0.035, r=0.012):
    return [cone(tuple(p), tuple(p + n * ln * H), r * H, 5) for p, n in pts_normals]


def outward(p):
    v = Vector((p.x, p.y, 0))
    return v.normalized() if v.length > 1e-6 else Vector((0, 1, 0))


# ---------------------------------------------------------------- CAMISA (prop_shirt: some no Colosso)
def shirt_pt(u, v, out=1.0):
    a = (u - 0.5) * TAU + math.pi  # costura nas costas
    z = 0.6 - v * 0.74            # da gola até abaixo da cintura (fralda para fora)
    p = torso_pt(a, max(z, -0.12), 1.0, 0.018 + 0.012 * v)
    if z < -0.12:
        p.z = hz + z * H
    # fralda solta: abre um pouco embaixo
    p.x *= 1 + max(0.0, -z - 0.05) * 0.25
    p.y *= 1 + max(0.0, -z - 0.05) * 0.25
    return p * 1.0


b.add('prop_shirt_body', grid(lambda u, v: shirt_pt(u, v), 36, 14), shirt, region='torso', subdiv=0)
# gola de camisa social (duas pontas viradas na frente) e a carcela com botões
collar = []
for s in (1, -1):
    pts = [torso_pt(s * 0.15, 0.62, 1.02, 0.02), torso_pt(s * 0.5, 0.6, 1.04, 0.025), torso_pt(s * 0.32, 0.5, 1.05, 0.03)]
    collar.append(rod(pts, [0.03 * H, 0.03 * H, 0.012 * H], 5, flat=(outward, 0.3)))
ring = [torso_pt(k / 16 * TAU, 0.625, 1.02, 0.02) for k in range(17)]
collar.append(rod(ring, [0.022 * H] * 17, 5))
b.add('prop_shirt_collar', merge(*collar), shirt, region='torso', subdiv=0)
btn = [ellipsoid(tuple(torso_pt(0, z, 1.0, 0.032)), (0.01 * H, 0.006 * H, 0.01 * H), 6, 4) for z in (0.48, 0.36, 0.24, 0.12, 0.0)]
b.add('prop_shirt_buttons', merge(*btn), button, region='torso', subdiv=0)
b.add('prop_shirt_placket', rod([torso_pt(0, 0.58, 1.0, 0.026), torso_pt(0, -0.18, 1.0, 0.05)], [0.016 * H, 0.016 * H], 4, flat=(outward, 0.25)), shirt, region='torso', subdiv=0)
# mangas arregaçadas (dobra grossa no antebraço) e antebraço de pele com faixas
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    b.add('prop_shirt_cuff' + side, tube(limb_rings(e.lerp(h, 0.05), e.lerp(h, 0.22), 0.108, 0.104, n=2), 14), shirt, region='e' + side, subdiv=0)
b.group('prop_shirt')

for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    b.add('forearm' + side, tube(limb_rings(e.lerp(h, 0.08), e.lerp(h, 0.92), 0.096, 0.076, n=4), 14), skin, region='e' + side, subdiv=0)
    # faixas enroladas no antebraço (as duas mãos de lutador)
    wraps = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.07), 0.098 - t * 0.02, 0.097 - t * 0.02, n=1), 14) for t in (0.55, 0.66, 0.77)]
    b.add('wraps' + side, merge(*wraps), bandage, region='e' + side, subdiv=0)
# pulseira com o axolote rosa no pulso esquerdo
eL, hL = sk['eL'], sk['handL']
b.add('bracelet', tube(limb_rings(eL.lerp(hL, 0.88), eL.lerp(hL, 0.93), 0.074, 0.074, n=1), 12), band, region='eL', subdiv=0)
wp = eL.lerp(hL, 0.9)
ax = [ellipsoid((wp.x + 0.075 * 1.34, wp.y - 0.02, wp.z - 0.03), (0.018, 0.012, 0.03), 8, 6)]
for s in (-1, 1):
    ax.append(ellipsoid((wp.x + 0.075 * 1.34, wp.y - 0.02 + s * 0.018, wp.z - 0.012), (0.006, 0.012, 0.008), 5, 4))
b.add('axolotl_charm', merge(*ax), pink, region='eL', subdiv=0)

# ---------------------------------------------------------------- calça: faixa abaixo do joelho, coturnos de cadarço
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    b.add('knee_wrap' + side, tube(limb_rings(k.lerp(f, 0.06), k.lerp(f, 0.2), 0.084, 0.082, n=2), 14), bandage, region='k' + side, subdiv=0)
    b.add('boot_shaft' + side, tube(limb_rings(k.lerp(f, 0.62), k.lerp(f, 1.0), 0.072, 0.07, n=3), 14), boots, region='k' + side, subdiv=0)
    b.add('boot_toe' + side, ellipsoid((f.x, f.y - 0.1 * H, f.z + 0.035 * H), (0.06 * H, 0.085 * H, 0.045 * H), 12, 8, theta_max=math.pi * 0.55), boots, region='foot' + side, subdiv=0)
    b.add('sole' + side, box((f.x, f.y - 0.05 * H, f.z - 0.012 * H), (0.125 * H, 0.29 * H, 0.035 * H), bevel=0.006), sole, region='foot' + side, subdiv=0)
    xs = []
    for j in range(5):
        t0 = 0.66 + j * 0.065
        p0, p1 = k.lerp(f, t0), k.lerp(f, t0 + 0.05)
        for s in (-1, 1):
            xs.append(rod([(p0.x + s * 0.04, p0.y - 0.075, p0.z), (p1.x - s * 0.04, p1.y - 0.075, p1.z)], [0.005, 0.005], 4))
    b.add('laces' + side, merge(*xs), lace, region='k' + side, subdiv=0)

# ---------------------------------------------------------------- CABELO: dreads curtos e bem cuidados
HR = (0.153 * H, 0.163 * H, 0.172 * H)
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.01))


def hp(phi, th, r=1.0):
    return HC + Vector((math.sin(th) * math.sin(phi) * HR[0] * r, -math.sin(th) * math.cos(phi) * HR[1] * r, math.cos(th) * HR[2] * r))


b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.98, HR[1] * 0.98, HR[2] * 0.98), front=0.22, side=0.5, back=0.62), hairm, region='head')
dreads = []
for i in range(64):
    phi = random.uniform(-math.pi, math.pi)
    th0 = random.uniform(0.15, 0.6)
    front = math.cos(phi) > 0.6
    ln = random.uniform(0.2, 0.32) * H * (0.75 if front else 1.0)
    p0 = hp(phi, th0, 1.0)
    out = (p0 - HC).normalized()
    p1 = p0 + out * 0.025 * H + Vector((0, 0, -0.02 * H))
    # caem para baixo e um pouco para fora; na frente caem sobre a testa
    drop = Vector((out.x * 0.35, out.y * 0.35 - (0.05 if front else 0), -1)).normalized()
    p2 = p1 + drop * ln * 0.5
    p3 = p1 + drop * ln + Vector((random.uniform(-0.01, 0.01), random.uniform(-0.01, 0.01), 0))
    # não atravessar o rosto: as da frente param na altura das sobrancelhas
    if front:
        p3.z = max(p3.z, HC.z + 0.02 * H)
        p2.z = max(p2.z, HC.z + 0.06 * H)
    dreads.append(rod([p0, p1, p2, p3], [0.021 * H, 0.022 * H, 0.02 * H, 0.016 * H], 6))
b.add('dreads', merge(*dreads[0::2]), hairm, region='head', subdiv=0)
b.add('dreads_hi', merge(*dreads[1::2]), hairhi, region='head', subdiv=0)

# ---------------------------------------------------------------- COLOSSO (prop_colosso)
# gola de cobre do escafandro: anel grosso rebitado sobre os ombros, com espinhos na borda
GOR = []
for k in range(33):
    a = k / 32 * TAU
    p = torso_pt(a, 0.565, 1.0, 0.07)
    GOR.append(p + Vector((0, 0, 0.02 * H)))
gor_ring = []
for j, (dz, ex) in enumerate(((0.0, 0.0), (-0.05, 0.035), (-0.1, 0.05))):
    pts = []
    for k in range(33):
        a = k / 32 * TAU
        p = torso_pt(a, 0.58 + dz, 1.0, 0.06 + ex)
        pts.append(p)
    gor_ring.append(pts)
gorget = grid(lambda u, v: gor_ring[0][int(round(u * 32))].lerp(gor_ring[2][int(round(u * 32))], v), 32, 2)
b.add('prop_colosso_gorget', gorget, copper, region='torso', subdiv=0)
rv, sp = [], []
for k in range(0, 32, 2):
    p = gor_ring[1][k]
    rv.append(ellipsoid(tuple(p + outward(p) * 0.01 * H), (0.012 * H,) * 3, 6, 4))
for k in range(1, 32, 2):
    p = gor_ring[2][k]
    sp.append((p, (outward(p) + Vector((0, 0, -0.4))).normalized()))
b.add('prop_colosso_gorget_rivets', merge(*rv), brass, region='torso', subdiv=0)
b.add('prop_colosso_gorget_spikes', merge(*spikes_on(sp, 0.04, 0.011)), spike, region='torso', subdiv=0)
# retalhos de pano cru: capa rasgada no ombro esquerdo (cai pelas costas) e tiras na frente
def cape_pt(u, v):
    a = 0.95 + u * 2.25        # da frente do ombro esquerdo, por cima do ombro e do braço, até o meio das costas
    z = 0.6 - v * (0.62 + 0.22 * math.sin(u * 9 + 1) ** 2)
    side = max(0.0, math.sin(a))  # no lado esquerdo a capa passa por fora do braço
    extra = 0.06 + 0.2 * side * smoothstep(0.2, 0.55, z) + 0.05 * v
    p = torso_pt(a, max(z, -0.12), 1.0, extra)
    p.z = hz + z * H
    return p


def cape_w(p):
    w = auto_weights(sk, p, 'torso')
    sh = smoothstep(0.2 * H, 0.42 * H, p.x) * 0.5
    out = {k: v * (1 - sh) for k, v in w.items()}
    out['sL'] = out.get('sL', 0) + sh
    return out


b.add('prop_colosso_cape', grid(cape_pt, 16, 10), cloth, region='torso', weight_fn=cape_w, subdiv=0)
strips = []
for k in range(5):
    a = -0.75 + k * 0.12
    p0 = torso_pt(a, 0.52, 1.0, 0.085)
    ln = random.uniform(0.12, 0.26) * H
    strips.append(grid(lambda u, v, a=a, p0=p0, ln=ln: Vector((p0.x + (u - 0.5) * 0.045 * H * (1 - 0.6 * v), p0.y - 0.004 * H * v, p0.z - v * ln)), 1, 3))
b.add('prop_colosso_rags', merge(*strips), cloth, region='torso', subdiv=0)
# mangueiras vermelhas do escafandro: da gola, pelos ombros, até as costas
hoses = []
for s in (1, -1):
    pts = [torso_pt(s * 0.9, 0.56, 1.0, 0.09), torso_pt(s * 1.6, 0.5, 1.0, 0.13), torso_pt(s * 2.3, 0.35, 1.0, 0.12), torso_pt(s * 2.7, 0.2, 1.0, 0.09)]
    hoses.append(rod(pts, [0.02 * H] * 4, 7))
    for k in range(6):
        p = pts[0].lerp(pts[-1], k / 5)
b.add('prop_colosso_hoses', merge(*hoses), hose, region='torso', subdiv=0)
# arnês de couro com espinhos cruzando o peito e a barriga, e o CINTURÃO redondo de espinhos
straps, ssp = [], []
for (a0, z0), (a1, z1) in (((-1.0, 0.52), (0.9, 0.06)), ((1.0, 0.52), (-0.9, 0.06)), ((-1.3, 0.25), (1.3, 0.25))):
    pts = [torso_pt(a0 + (a1 - a0) * t, z0 + (z1 - z0) * t, 1.0, 0.03) for t in [i / 8 for i in range(9)]]
    straps.append(rod(pts, [0.022 * H] * 9, 6, flat=(outward, 0.3)))
    for p in pts[1:-1:2]:
        ssp.append((p, outward(p)))
belt_pts = [torso_pt(k / 24 * TAU, 0.03, 1.0, 0.045) for k in range(25)]
straps.append(rod(belt_pts, [0.05 * H] * 25, 8, flat=(outward, 0.45)))
for p in belt_pts[:-1]:
    ssp.append((p + outward(p) * 0.018 * H, outward(p)))
b.add('prop_colosso_harness', merge(*straps), leather, region='torso', subdiv=0)
b.add('prop_colosso_harness_spikes', merge(*spikes_on(ssp, 0.04, 0.012)), spike, region='torso', subdiv=0)
b.add('prop_colosso_belt_ring', tube([(0, -0.17 * H * 1.0 - 0.02, hz + 0.03 * H, 0.05 * H, 0.012), (0, -0.17 * H - 0.025, hz + 0.031 * H, 0.05 * H, 0.012)], 14), brass, region='torso', subdiv=0)
# MANOPLAS: braçadeira de cobre no antebraço com faixas de latão e espinhos; luva de couro sem dedos
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    b.add('prop_colosso_bracer' + side, tube(limb_rings(e.lerp(h, 0.12), e.lerp(h, 0.88), 0.1, 0.09, n=4, bulge=0.04), 16), copper, region='e' + side, subdiv=0)
    bands = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.06), 0.105 - t * 0.012, 0.104 - t * 0.012, n=1), 16) for t in (0.18, 0.5, 0.78)]
    b.add('prop_colosso_bracer_bands' + side, merge(*bands), brass, region='e' + side, subdiv=0)
    gsp = []
    for t in (0.3, 0.62):
        c = e.lerp(h, t)
        for ang in (-1.2, 0.0, 1.2, 2.6):
            n = Vector((math.cos(ang) * sx, -math.sin(ang), 0.0)).normalized()
            gsp.append(cone(tuple(c + n * 0.095), tuple(c + n * 0.15), 0.014, 5))
    b.add('prop_colosso_bracer_spikes' + side, merge(*gsp), spike, region='e' + side, subdiv=0)
    hc2 = h + Vector((0, 0, -0.04 * H))
    b.add('prop_colosso_glove' + side, ellipsoid((hc2.x, hc2.y, hc2.z + 0.015), (0.06, 0.075, 0.07), 10, 8), glove, region='e' + side, subdiv=0)
# bolsas na coxa direita e caneleiras/botas de cobre com espinhos
l, k = sk['lR'], sk['kR']
pc = l.lerp(k, 0.5)
b.add('prop_colosso_pouches', merge(box((pc.x - 0.04, pc.y - 0.11, pc.z), (0.07, 0.05, 0.1), bevel=0.01), box((pc.x + 0.05, pc.y - 0.11, pc.z), (0.07, 0.05, 0.1), bevel=0.01)), leather, region='legR', subdiv=0)
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('prop_colosso_greave' + side, tube(limb_rings(k.lerp(f, 0.45), k.lerp(f, 1.0), 0.085, 0.082, n=3), 16), copper, region='k' + side, subdiv=0)
    b.add('prop_colosso_boot' + side, ellipsoid((f.x, f.y - 0.1 * H, f.z + 0.045 * H), (0.068 * H, 0.095 * H, 0.055 * H), 12, 8, theta_max=math.pi * 0.55), copper, region='foot' + side, subdiv=0)
    gs = []
    for t in (0.55, 0.8):
        c = k.lerp(f, t)
        for ang in (-0.9, 0.9, math.pi):
            n = Vector((math.sin(ang), -math.cos(ang), 0))
            gs.append(cone(tuple(c + n * 0.08), tuple(c + n * 0.14), 0.016, 5))
    for dx in (-0.03, 0.0, 0.03):
        gs.append(cone((f.x + dx * H, f.y - 0.17 * H, f.z + 0.02 * H), (f.x + dx * H, f.y - 0.23 * H, f.z + 0.01 * H), 0.012 * H, 5))
    b.add('prop_colosso_greave_spikes' + side, merge(*gs), spike, region='k' + side, subdiv=0)
b.group('prop_colosso')

b.export(OUT)
