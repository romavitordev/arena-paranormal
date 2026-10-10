"""
DALMO MAGNO — "O COLOSSO" (Natal Macabro / Hexatombe) — public/models/dalmo.glb.
Referências: Referencias visuais/Personagens/Dalmo ("Dalmo corpo intiero", "dalmo cintura pra cima", "Dalmo rosto",
"Dalmo rosto 2", "Colosso corpo inteiro", "Dalmo colocando mascara", "Dalmo se tornando Colosso", o gif e o dossiê) e a
wiki: 1,85 m, pele escura, porte ENORME — peitoral e barriga grandes, ombros redondos, braços muito grossos, pescoço
largo; dreads que caem pela testa e pelos lados; cicatrizes pelo corpo.
  DALMO (base): camisa social escura, folgada, de gola grande e pontuda, o botão de cima aberto (o peito aparece no
    decote), mangas arregaçadas até o antebraço e a FRALDA PARA FORA (abre por cima da calça); antebraços enfaixados;
    pulseira com o PINGENTE DE AXOLOTE rosa (a filha, Manu); calça cargo verde larga, rasgada nos joelhos, com bolsos
    na lateral, faixa enrolada embaixo do joelho e franzida por cima dos coturnos; coturnos marrom-claros de cano alto,
    cadarço cruzado, biqueira e sola escuras.
  COLOSSO (prop_colosso, ligado na Transformação): o tronco quase todo exposto (cicatrizes); gola de cobre rebitada do
    escafandro com espinhos; retalhos de pano cru caindo do ombro esquerdo e na frente; mangueiras vermelhas; arnês de
    tiras de couro com espinhos cruzando o peito e a barriga; o cinturão redondo cheio de espinhos; as MANOPLAS: braçadeiras
    de cobre com faixas e espinhos e o punho todo de metal (ferro e cobre, espinhos nos nós dos dedos); bolsas na coxa; botas/caneleiras de cobre com espinhos.
  O ESCAFANDRO (capacete com os três visores vermelhos rachados e o axolote pendurado na frente) é montado em código
  (src/models/props.js → colossoHelmet), para a cena da Transformação poder levá-lo do peito à cabeça.
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
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
shirt = material('shirt_dalmo', '#ffffff', 0.85)         # camisa escura com vincos (textura)
pants = material('pants_dalmo', '#ffffff', 0.9)          # cargo verde rasgado (textura)
bandage = material('bandage_dalmo', '#c4b8a2', 0.9)
boots = material('boots_dalmo', '#9a7c5a', 0.75)
toecap = material('toecap_dalmo', '#4a3a2c', 0.7)
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
iron = material('iron_colosso', '#6c6460', 0.35, metal=0.85)  # o ferro escuro das Manoplas

M = {
    'skin': skin,
    'face': material('face_dalmo', '#ffffff', 0.75),
    'torso': material('torso_dalmo', '#ffffff', 0.75),  # pele com cicatrizes (textura) — à mostra no Colosso
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


# ---------------------------------------------------------------- TRONCO: barriga e peitoral enormes, ombros caídos
# (z relativo ao quadril, meia-largura, profundidade da FRENTE, profundidade das COSTAS) — em frações de H
TT = [
    (-0.16, 0.205, 0.15, 0.15),
    (-0.06, 0.225, 0.18, 0.16),
    (0.04, 0.255, 0.225, 0.165),   # a barriga começa
    (0.14, 0.28, 0.255, 0.17),     # barriga
    (0.24, 0.29, 0.255, 0.172),
    (0.33, 0.292, 0.235, 0.178),   # embaixo do peito
    (0.42, 0.292, 0.225, 0.182),   # peitoral
    (0.5, 0.286, 0.2, 0.184),
    (0.56, 0.27, 0.17, 0.176),
    (0.6, 0.235, 0.14, 0.158),     # trapézio: desce do pescoço largo até o ombro
    (0.64, 0.19, 0.118, 0.135),
    (0.675, 0.135, 0.098, 0.108),
    (0.71, 0.105, 0.088, 0.092),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    """ponto na superfície do tronco (antes da escala), a = ângulo (0 = frente), z relativo ao quadril em H."""
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def dalmo_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = dalmo_torso  # o b.body usa este tronco (barriga para a frente) no lugar do tubo simétrico

hc = b.body(M, [], arms=(), legs=False, head_r=(0.15, 0.158, 0.168), neck_r=0.108)


def spikes_on(pts_normals, ln=0.035, r=0.012):
    return [cone(tuple(p), tuple(p + n * ln * H), r * H, 5) for p, n in pts_normals]


def outward(p):
    v = Vector((p.x, p.y, 0))
    return v.normalized() if v.length > 1e-6 else Vector((0, 1, 0))


# ---------------------------------------------------------------- BRAÇOS: ombro redondo, bíceps enorme, antebraço grosso
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    shtop = s + Vector((-sx * 0.025 * H, 0, 0.0))
    cuff = e.lerp(h, 0.2)
    # manga (camisa) do ombro até logo abaixo do cotovelo: bíceps bem cheio
    rings = []
    for i in range(9):
        t = i / 8
        p = shtop.lerp(e, t)
        r = 0.108 + 0.018 * math.sin(t * math.pi * 0.9) - 0.006 * t
        rings.append((p.x, p.y, p.z, r, r * 1.04))
    for i in range(1, 4):
        p = e.lerp(cuff, i / 3)
        rings.append((p.x, p.y, p.z, 0.106, 0.106))
    b.add('sleeve' + side, tube(rings, 16), shirt, region='arm' + side, subdiv=0)
    # deltoide: a cabeça do ombro arredondada (some o "ombro quadrado")
    b.add('delt' + side, ellipsoid((s.x - sx * 0.005 * H, s.y, s.z - 0.03 * H), (0.1 * H, 0.112 * H, 0.09 * H), 16, 12), shirt, region='arm' + side, subdiv=0)
    # antebraço de pele, grosso perto do cotovelo
    fr = []
    for i in range(7):
        t = 0.08 + i / 6 * 0.86
        p = e.lerp(h, t)
        r = 0.1 - 0.024 * t + 0.008 * math.sin(t * math.pi)
        fr.append((p.x, p.y, p.z, r, r * 0.92))
    b.add('forearm' + side, tube(fr, 14), skin, region='e' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.09), skin, region='e' + side)
    # faixas enroladas no antebraço (as mãos de lutador): mais no direito
    ts = (0.5, 0.6, 0.7, 0.8) if side == 'R' else (0.62, 0.72)
    wraps = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.075), 0.1 - t * 0.024 + 0.006, 0.1 - t * 0.024 + 0.005, n=1), 14) for t in ts]
    b.add('wraps' + side, merge(*wraps), bandage, region='e' + side, subdiv=0)

# pulseira com o axolote rosa no pulso esquerdo
eL, hL = sk['eL'], sk['handL']
b.add('bracelet', tube(limb_rings(eL.lerp(hL, 0.86), eL.lerp(hL, 0.91), 0.08, 0.08, n=1), 12), band, region='eL', subdiv=0)
wp = eL.lerp(hL, 0.89)
ax = [ellipsoid((wp.x + 0.082 * 1.34, wp.y - 0.02, wp.z - 0.03), (0.02, 0.014, 0.032), 8, 6)]
for s_ in (-1, 1):
    ax.append(ellipsoid((wp.x + 0.082 * 1.34, wp.y - 0.02 + s_ * 0.02, wp.z - 0.01), (0.007, 0.013, 0.009), 5, 4))
b.add('axolotl_charm', merge(*ax), pink, region='eL', subdiv=0)


# ---------------------------------------------------------------- CAMISA (prop_shirt: some no Colosso)
def shirt_pt(u, v):
    z_top = 0.655
    z_lin = z_top - v * 0.82
    g = 0.2 * smoothstep(0.46, 0.63, z_lin)          # decote: o botão de cima aberto
    a = g + u * (TAU - 2 * g)                        # a costura do decote fica na frente
    hem = -0.13 - 0.075 * abs(math.cos(a)) + 0.02 * math.cos(2 * a) ** 2  # fralda: mais comprida na frente e atrás
    z = z_top - v * (z_top - hem)
    folds = 0.006 * math.sin(a * 9 + v * 2.5) * smoothstep(0.15, 0.8, v)
    extra = 0.02 + 0.008 * v + folds + max(0.0, 0.02 - z) * 0.45  # abre por cima da calça
    # sobre a barriga a camisa fica esticada; nos lados, sobra pano
    p = torso_pt(a, max(z, -0.16), 1.0, extra)
    p.z = hz + z * H
    return p


b.add('prop_shirt_body', grid(shirt_pt, 40, 16), shirt, region='torso', subdiv=0)
# gola social grande: a faixa em volta do pescoço e as duas abas pontudas viradas para baixo
collar = []
ring = [torso_pt(0.24 + k / 20 * (TAU - 0.48), 0.66, 1.0, 0.03) + Vector((0, 0, 0.012 * H)) for k in range(21)]
collar.append(rod(ring, [0.02 * H] * 21, 5))
b.add('prop_shirt_band', merge(*collar), shirt, region='torso', subdiv=0)
flaps = []
for s_ in (1, -1):
    def flap(u, v, s_=s_):
        a = s_ * (math.pi - u * (math.pi - 0.26))
        base = torso_pt(a, 0.672, 1.0, 0.04)
        ln = 0.05 + 0.09 * u ** 3
        tip = torso_pt(a + s_ * 0.2 * u ** 2, 0.665 - ln, 1.0, 0.052 + 0.02 * u)
        p = base.lerp(tip, v)
        return p + outward(p) * 0.012 * H * math.sin(v * math.pi)
    flaps.append(grid(flap, 14, 3, flip=(s_ > 0)))
b.add('prop_shirt_collar', merge(*flaps), shirt, region='torso', subdiv=0)
btn = [ellipsoid(tuple(torso_pt(0, z, 1.0, 0.034)), (0.011 * H, 0.006 * H, 0.011 * H), 6, 4) for z in (0.44, 0.33, 0.22, 0.11, 0.0, -0.11)]
b.add('prop_shirt_buttons', merge(*btn), button, region='torso', subdiv=0)
b.add('prop_shirt_placket', rod([torso_pt(0, z, 1.0, 0.03) for z in (0.47, 0.3, 0.12, -0.05, -0.2)], [0.018 * H] * 5, 4, flat=(outward, 0.25)), shirt, region='torso', subdiv=0)
# dobra grossa da manga arregaçada
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    b.add('prop_shirt_cuff' + side, tube(limb_rings(e.lerp(h, 0.1), e.lerp(h, 0.24), 0.116, 0.112, n=2, bulge=0.05), 16), shirt, region='e' + side, subdiv=0)
b.group('prop_shirt')

# ---------------------------------------------------------------- CALÇA CARGO larga e COTURNOS
# o quadril da calça (embaixo da fralda; aparece no Colosso)
b.add('pants_hip', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.05 - v * 0.27, 1.0, 0.012), 32, 4), pants, region='torso', subdiv=0)
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    sx = 1 if side == 'L' else -1
    topp = Vector((l.x, l.y, l.z + 0.07 * H))
    rings = []
    for t, r in ((0.0, 0.122), (0.25, 0.124), (0.55, 0.118), (0.85, 0.108), (1.0, 0.104)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    # abaixo do joelho: a faixa e o pano franzido por cima do cano do coturno
    for t, r in ((0.15, 0.1), (0.27, 0.098), (0.36, 0.104), (0.43, 0.106), (0.48, 0.098)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('pants' + side, tube(rings, 16), pants, region='leg' + side, subdiv=0)
    # bolsos cargo na lateral da coxa
    pc = topp.lerp(k, 0.55)
    b.add('cargo' + side, box((pc.x + sx * 0.112 * H, pc.y, pc.z), (0.03 * H, 0.1 * H, 0.12 * H), bevel=0.01), pants, region='leg' + side, subdiv=0)
    b.add('knee_wrap' + side, tube(limb_rings(k.lerp(f, 0.1), k.lerp(f, 0.24), 0.104, 0.102, n=2), 16), bandage, region='k' + side, subdiv=0)
    # coturno: cano alto (entra embaixo da calça), biqueira escura, sola grossa e cadarço cruzado
    b.add('boot_shaft' + side, tube(limb_rings(k.lerp(f, 0.4), k.lerp(f, 0.97), 0.09, 0.085, n=3), 16), boots, region='k' + side, subdiv=0)
    b.add('boot_foot' + side, ellipsoid((f.x, f.y - 0.07 * H, f.z + 0.045 * H), (0.068 * H, 0.15 * H, 0.06 * H), 14, 10, theta_max=math.pi * 0.56), boots, region='foot' + side, subdiv=0)
    b.add('boot_toe' + side, ellipsoid((f.x, f.y - 0.15 * H, f.z + 0.032 * H), (0.064 * H, 0.08 * H, 0.05 * H), 12, 8, theta_max=math.pi * 0.56), toecap, region='foot' + side, subdiv=0)
    b.add('sole' + side, box((f.x, f.y - 0.07 * H, f.z - 0.008 * H), (0.145 * H, 0.33 * H, 0.04 * H), bevel=0.008), sole, region='foot' + side, subdiv=0)
    xs = []
    for j in range(5):
        t0 = 0.52 + j * 0.08
        p0, p1 = k.lerp(f, t0), k.lerp(f, t0 + 0.055)
        for s_ in (-1, 1):
            xs.append(rod([(p0.x + s_ * 0.045, p0.y - 0.088 * 1.3, p0.z), (p1.x - s_ * 0.045, p1.y - 0.088 * 1.3, p1.z)], [0.006, 0.006], 4))
    b.add('prop_laces' + side, merge(*xs), lace, region='k' + side, subdiv=0)  # some no Colosso (bota de cobre)
b.group('prop_laces')

# ---------------------------------------------------------------- CABELO: dreads que caem pela testa e pelos lados
HR = (0.156 * H, 0.164 * H, 0.172 * H)
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.012))


def hp(phi, th, r=1.0):
    return HC + Vector((math.sin(th) * math.sin(phi) * HR[0] * r, -math.sin(th) * math.cos(phi) * HR[1] * r, math.cos(th) * HR[2] * r))


b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.98, HR[1] * 0.98, HR[2] * 0.98), front=0.2, side=0.52, back=0.66), hairm, region='head')
dreads = []
N = 84
for i in range(N):
    phi = (i / N) * TAU - math.pi + random.uniform(-0.05, 0.05)
    front = math.cos(phi)               # 1 = testa, -1 = nuca
    th0 = random.uniform(0.12, 0.42)
    # comprimento: na testa caem até a sobrancelha / olho; nos lados até a mandíbula; atrás até a nuca
    if front > 0.55:
        end_z = HC.z + random.uniform(0.035, 0.08) * H
    elif front > -0.2:
        end_z = HC.z - random.uniform(0.06, 0.12) * H
    else:
        end_z = HC.z - random.uniform(0.14, 0.2) * H
    pts = [hp(phi, th0, 1.0)]
    th = th0
    # acompanha o crânio até a "aba", depois cai por gravidade, um pouco afastado do rosto
    while th < 1.25 and pts[-1].z > end_z + 0.04 * H:
        th += 0.22
        pts.append(hp(phi + random.uniform(-0.04, 0.04), th, 1.07 + 0.03 * (th - th0)))
    last = pts[-1]
    lean = Vector((math.sin(phi) * 0.02 * H, -math.cos(phi) * 0.02 * H, 0)) if front > 0.55 else Vector((math.sin(phi) * 0.012 * H, -math.cos(phi) * 0.012 * H, 0))
    while last.z > end_z:
        last = last + Vector((0, 0, -0.045 * H)) + lean * 0.4
        pts.append(last)
    pts[-1].z = max(pts[-1].z, end_z)
    if len(pts) < 3:
        pts.insert(1, pts[0].lerp(pts[-1], 0.5))
    rad = [0.021 * H] * (len(pts) - 1) + [0.016 * H]
    dreads.append(rod(pts, rad, 6))
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
_fp = torso_pt(0, 0.03, 1.0, 0.085)
b.add('prop_colosso_belt_ring', tube([(0, _fp.y, _fp.z, 0.05 * H, 0.012), (0, _fp.y - 0.006, _fp.z + 0.001 * H, 0.05 * H, 0.012)], 14), brass, region='torso', subdiv=0)
# MANOPLAS: braçadeira de cobre no antebraço com faixas de latão e espinhos; a manopla de metal fechando o punho
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    b.add('prop_colosso_bracer' + side, tube(limb_rings(e.lerp(h, 0.12), e.lerp(h, 0.88), 0.108, 0.096, n=4, bulge=0.04), 16), copper, region='e' + side, subdiv=0)
    bands = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.06), 0.114 - t * 0.012, 0.113 - t * 0.012, n=1), 16) for t in (0.18, 0.5, 0.78)]
    b.add('prop_colosso_bracer_bands' + side, merge(*bands), brass, region='e' + side, subdiv=0)
    gsp = []
    for t in (0.3, 0.62):
        c = e.lerp(h, t)
        for ang in (-1.2, 0.0, 1.2, 2.6):
            n = Vector((math.cos(ang) * sx, -math.sin(ang), 0.0)).normalized()
            gsp.append(cone(tuple(c + n * 0.1), tuple(c + n * 0.16), 0.014, 5))
    b.add('prop_colosso_bracer_spikes' + side, merge(*gsp), spike, region='e' + side, subdiv=0)
    # a MANOPLA de metal (wiki: "manoplas com espinhos feitas de metal"): cobre o punho inteiro — casca de ferro,
    # placa de cobre nas costas da mão, barra grossa nos nós dos dedos com 4 espinhos para a frente do soco e o
    # punho rebitado que encaixa na braçadeira
    c = h + Vector((0, 0, -0.04 * H))
    r = 0.09
    out_x = sx  # costas da mão para fora do corpo
    b.add('prop_colosso_gauntlet' + side, merge(
        ellipsoid((c.x + out_x * 0.006, c.y, c.z + 0.006), (r * 0.98, r * 1.14, r * 1.22), 14, 10),
        tube(limb_rings(c + Vector((0, 0, r * 0.95)), c + Vector((0, 0, r * 1.5)), r * 1.02, r * 1.08, n=1), 14),
    ), iron, region='e' + side, subdiv=0)
    b.add('prop_colosso_gauntlet_plate' + side, merge(
        ellipsoid((c.x + out_x * r * 0.72, c.y, c.z + r * 0.1), (r * 0.32, r * 0.98, r * 1.0), 10, 8),
        tube(limb_rings(c + Vector((0, 0, r * 1.2)), c + Vector((0, 0, r * 1.32)), r * 1.1, r * 1.1, n=1), 14),
    ), copper, region='e' + side, subdiv=0)
    kb = rod([(c.x, c.y - r * 0.9, c.z - r * 1.02), (c.x, c.y + r * 0.9, c.z - r * 1.02)], [r * 0.32, r * 0.32], 8)
    ks = [cone((c.x, c.y + (i - 1.5) * r * 0.5, c.z - r * 1.25), (c.x, c.y + (i - 1.5) * r * 0.5, c.z - r * 1.25 - 0.05), 0.016, 6) for i in range(4)]
    ks += [cone((c.x + out_x * r * 0.95, c.y + dy * r, c.z + r * 0.15), (c.x + out_x * (r * 0.95 + 0.04), c.y + dy * r, c.z + r * 0.15), 0.013, 5) for dy in (-0.5, 0.5)]
    b.add('prop_colosso_gauntlet_knuckles' + side, kb, iron, region='e' + side, subdiv=0)
    b.add('prop_colosso_gauntlet_spikes' + side, merge(*ks), spike, region='e' + side, subdiv=0)
# bolsas na coxa direita e caneleiras/botas de cobre com espinhos
l, k = sk['lR'], sk['kR']
pc = l.lerp(k, 0.5)
b.add('prop_colosso_pouches', merge(box((pc.x - 0.035, pc.y - 0.158, pc.z), (0.075, 0.055, 0.11), bevel=0.01), box((pc.x + 0.05, pc.y - 0.15, pc.z), (0.075, 0.055, 0.11), bevel=0.01)), leather, region='legR', subdiv=0)
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('prop_colosso_greave' + side, tube(limb_rings(k.lerp(f, 0.42), k.lerp(f, 1.0), 0.116, 0.1, n=3), 16), copper, region='k' + side, subdiv=0)
    b.add('prop_colosso_boot' + side, ellipsoid((f.x, f.y - 0.075 * H, f.z + 0.05 * H), (0.076 * H, 0.162 * H, 0.068 * H), 12, 8, theta_max=math.pi * 0.55), copper, region='foot' + side, subdiv=0)
    gs = []
    for t in (0.55, 0.8):
        c = k.lerp(f, t)
        for ang in (-0.9, 0.9, math.pi):
            n = Vector((math.sin(ang), -math.cos(ang), 0))
            gs.append(cone(tuple(c + n * 0.1), tuple(c + n * 0.16), 0.016, 5))
    for dx in (-0.03, 0.0, 0.03):
        gs.append(cone((f.x + dx * H, f.y - 0.22 * H, f.z + 0.03 * H), (f.x + dx * H, f.y - 0.28 * H, f.z + 0.02 * H), 0.012 * H, 5))
    b.add('prop_colosso_greave_spikes' + side, merge(*gs), spike, region='k' + side, subdiv=0)
b.group('prop_colosso')

b.export(OUT)
