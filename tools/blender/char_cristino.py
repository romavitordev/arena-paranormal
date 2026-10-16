"""
CRISTINO — "o Cangaceiro" / "Lampião" (Transtornados, Hexatombe) — public/models/cristino.glb.
Referências: wiki "Cristino" (arte de frente, de costas, concept, versão Desertor, lampião, pingente, espingarda) e
fan arts do Pinterest (só para conferir leitura do chapéu, dos óculos e do rosto). 45 anos, PORTE ROBUSTO, cabelo
castanho LONGO até os ombros, BIGODE grosso, um olho CEGO (ferimento de combate) e cicatrizes pelo corpo.
Traje de cangaceiro:
  - CHAPÉU de couro em meia-lua (aba virada para cima na frente e atrás, as pontas nos lados), com a ESTRELA de seis
    pontas na frente, tachas de metal na aba e ESPINHOS cravados no topo (a Coroa de Espinhos); faíscas laranja em X;
  - ÓCULOS redondos de lentes VERMELHAS; LENÇO grande vermelho amarrado no pescoço;
  - CAMISA social azul-esverdeada; JAQUETA de couro marrom-avermelhada aberta, mangas largas até o meio do antebraço,
    acabamento branco em ziguezague nas bordas e o grande SÍMBOLO DE SANGUE costurado nas costas;
  - CARTUCHEIRAS cruzando o peito, cintos de couro, a BOLSA AMARELA (embornal) no quadril esquerdo;
  - CALÇA de couro com costuras em X até o joelho, FAIXAS ENSANGUENTADAS nas canelas, ALPERCATAS de couro;
  - luvas escuras sem dedos.
A Espingarda Socadeira (roda de espinhos na coronha), a Peixeira e o Lampião de espinhos são montados em código
(src/models/props.js → addCristinoProps), para as habilidades poderem mostrá-los, escondê-los e arremessar o lampião.

TÉCNICA: corpo e roupas pelo Builder (pesos do esqueleto); as formas orgânicas — cabelo, bigode, lenço, bolsa e o
volume do chapéu — saem da ESCULTURA por metaballs (sculpt_lib.py), sem "formas coladas".
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); tudo em frações de H.
  node tools/blender/build.mjs cristino   → public/models/cristino.glb (+ tools/blender/fonte/cristino.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'cristino.glb'
random.seed(1938)  # o ano em que Corisco (Cristino Gomes da Silva Cleto) caiu

b = Builder(width=1.08, bulk=1.1, height=1.0)  # ~1,80 m, robusto
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_cristino', '#b07a58', 0.75),
    'face': material('face_cristino', '#ffffff', 0.75),  # olho cego, cicatrizes, barba por fazer (textura)
    'torso': material('shirt_cristino', '#ffffff', 0.85),  # camisa azul-esverdeada (textura)
    'arm': material('shirt_cristino', '#ffffff', 0.85),
    'hand': material('glove_cristino', '#3a2a22', 0.7),
    'legs': material('pants_cristino', '#ffffff', 0.8),  # couro com costuras em X (textura)
    'feet': material('skin_cristino', '#b07a58', 0.75),
}
jacket = material('jacket_cristino', '#ffffff', 0.7)  # couro marrom-avermelhado + o Símbolo de Sangue nas costas (textura)
jacket_in = material('jacket_lining_cristino', '#4a2418', 0.85)
trim = material('trim_cristino', '#ffffff', 0.8)  # acabamento branco em ziguezague (textura)
scarf = material('scarf_cristino', '#b4202a', 0.8)
scarf_w = material('scarf_white_cristino', '#e8e0d4', 0.85)
strap = material('strap_cristino', '#4a2a1a', 0.65)
brass = material('brass_cristino', '#c8a048', 0.35, metal=0.8)
shell = material('shell_cristino', '#b88a3a', 0.35, metal=0.7)  # cartuchos
bag = material('bag_cristino', '#c9a040', 0.85)
bandage = material('bandage_cristino', '#ffffff', 0.9)  # faixas com sangue (textura)
sole = material('sole_cristino', '#3a2414', 0.8)
sandal = material('sandal_cristino', '#6a3c22', 0.7)
hat = material('hat_cristino', '#ffffff', 0.7)  # couro do chapéu (textura)
hat_band = material('hat_band_cristino', '#5a2c18', 0.7)
thorn = material('thorn_cristino', '#b8b4ae', 0.3, metal=0.8)
hairm = material('hair_cristino', '#4a3020', 0.6)
stache = material('stache_cristino', '#35231a', 0.7)
lens = material('lens_cristino', '#d01020', 0.15)
frame = material('frame_cristino', '#2a201a', 0.4, metal=0.6)
spark = material('spark_glow_cristino', '#ff9a3a', 0.3, emission='#ff8a2a', strength=3.0)  # as faíscas em X do chapéu

# cores de conferência no Blender para as peças que o jogo pinta por textura (o .glb as exporta brancas)
PREVIEW = {'face_cristino': '#b88262', 'shirt_cristino': '#3f8a86', 'pants_cristino': '#7a4630', 'jacket_cristino': '#8a4a2c',
           'trim_cristino': '#e8e0d0', 'bandage_cristino': '#d8ccbc', 'hat_cristino': '#9a5a34'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

# tronco robusto: peito largo, barriga firme, ombros fortes
hc = b.body(M, [(-0.12, 0.172), (0.0, 0.178), (0.17, 0.174), (0.36, 0.212), (0.48, 0.226), (0.57, 0.13), (0.64, 0.074)],
            arm_r=(0.076, 0.062, 0.05), leg_r=(0.09, 0.07, 0.055), head_r=(0.14, 0.15, 0.164), neck_r=0.064, feet='bare')


def ring_pts(z, rx, ry, a0, a1, n):
    """pontos de um anel elíptico (ângulo 0 = frente, -y), de a0 a a1"""
    out = []
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
        out.append(Vector((math.sin(a) * rx, -math.cos(a) * ry, z)))
    return out


def rod(pts, radii, seg=6, caps=True, flat=None):
    """Tubo com anéis perpendiculares ao caminho (o tube() do lib faz anéis horizontais: só serve para peças em pé).
    flat=(normal_fn, achatamento): seção achatada na direção da normal — tiras de couro e faixas rentes ao corpo."""
    pts = [Vector(p) for p in pts]
    n = len(pts)
    rs = radii if isinstance(radii, (list, tuple)) else [radii] * n
    verts, faces, uvs = [], [], []
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
        for j in range(seg + 1):
            a = j / seg * TAU
            verts.append(tuple(p + side * math.cos(a) * rs[i] + up * math.sin(a) * rs[i] * k))
            uvs.append((j / seg, i / (n - 1)))
    row = seg + 1
    for i in range(n - 1):
        for j in range(seg):
            a = i * row + j
            faces.append((a, a + row, a + 1 + row, a + 1))
    if caps:
        for k_, flip in ((0, True), (n - 1, False)):
            c = len(verts)
            verts.append(tuple(pts[k_]))
            uvs.append((0.5, k_ / (n - 1)))
            for j in range(seg):
                faces.append((c, k_ * row + j + 1, k_ * row + j) if flip else (c, k_ * row + j, k_ * row + j + 1))
    return verts, faces, uvs


def outward(c):
    """normal "para fora" a partir de um eixo vertical em c (x, y): fitas deitadas na superfície do corpo"""
    return lambda p: Vector((p.x - c[0], p.y - c[1], 0)) if (p.x - c[0]) ** 2 + (p.y - c[1]) ** 2 > 1e-9 else Vector((0, -1, 0))


def shell_grid(rows, thick=0.006):
    """superfície por linhas de pontos (todas do mesmo tamanho), com espessura (frente e verso + bordas)"""
    nr, nc = len(rows), len(rows[0])
    verts, faces, uvs = [], [], []
    # normal aproximada por diferenças finitas
    def nrm(i, j):
        a = rows[min(i + 1, nr - 1)][j] - rows[max(i - 1, 0)][j]
        b_ = rows[i][min(j + 1, nc - 1)] - rows[i][max(j - 1, 0)]
        n = a.cross(b_)
        return n.normalized() if n.length > 1e-9 else Vector((0, 0, 1))
    for side in (1, -1):
        for i in range(nr):
            for j in range(nc):
                verts.append(tuple(rows[i][j] + nrm(i, j) * thick * 0.5 * side))
                uvs.append((j / (nc - 1), 1 - i / (nr - 1)))
    off = nr * nc
    for i in range(nr - 1):
        for j in range(nc - 1):
            a = i * nc + j
            faces.append((a, a + 1, a + 1 + nc, a + nc))
            faces.append((off + a + nc, off + a + 1 + nc, off + a + 1, off + a))
    # bordas fechando as duas faces
    loop = [(0, j) for j in range(nc)] + [(i, nc - 1) for i in range(1, nr)] + [(nr - 1, j) for j in range(nc - 2, -1, -1)] + [(i, 0) for i in range(nr - 2, 0, -1)]
    for k in range(len(loop)):
        i0, j0 = loop[k]
        i1, j1 = loop[(k + 1) % len(loop)]
        a, c = i0 * nc + j0, i1 * nc + j1
        faces.append((a, off + a, off + c, c))
    return verts, faces, uvs


# ================================================================ JAQUETA de couro aberta
# perfil (z relativo ao quadril → meia-largura, meia-profundidade, meio-ângulo da abertura da frente)
JK = [(-0.17, 0.205, 0.155, 0.36), (-0.06, 0.198, 0.148, 0.32), (0.08, 0.19, 0.138, 0.3), (0.22, 0.196, 0.14, 0.32),
      (0.36, 0.232, 0.158, 0.36), (0.48, 0.246, 0.168, 0.38), (0.56, 0.215, 0.15, 0.4), (0.61, 0.15, 0.125, 0.5)]
rows = []
for dz, rx, ry, gap in JK:
    rows.append(ring_pts(hz + dz * H, rx * H, ry * H, gap, TAU - gap, 30))
b.add('jacket', shell_grid(rows, 0.008), jacket, region='torso', subdiv=1)
# acabamento branco em ziguezague nas bordas da abertura e na barra
for s in (1, -1):
    pts = []
    for dz, rx, ry, gap in JK:
        a = gap if s > 0 else TAU - gap
        p = Vector((math.sin(a) * rx * H, -math.cos(a) * ry * H, hz + dz * H))
        pts.append((p.x, p.y - 0.004, p.z, 0.016 * H, 0.006))
    b.add(f'trimFront{s}', tube(pts, 6), trim, region='torso', subdiv=0)
hem = [(math.sin(a) * 0.207 * H, -math.cos(a) * 0.157 * H, hz - 0.17 * H) for a in [0.36 + (TAU - 0.72) * i / 30 for i in range(31)]]
b.add('trimHem', rod(hem, 0.016 * H, 6, flat=(outward((0, 0)), 0.35)), trim, region='torso', subdiv=0)
# a gola alta da jaqueta, dobrada para fora atrás do lenço
gola = [ring_pts(top + (0.04 + k * 0.035) * H, (0.135 + k * 0.01) * H, (0.115 + k * 0.012) * H, 0.75, TAU - 0.75, 18) for k in range(3)]
b.add('jacketCollar', shell_grid(gola, 0.007), jacket_in, region='neck', subdiv=0)

# mangas LARGAS até o meio do antebraço (boca de sino) com o ziguezague branco na boca
for side in ('L', 'R'):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    end = e.lerp(h, 0.45)
    rings = limb_rings(s_ + Vector((0, 0, 0.03 * H)), e, 0.076 * H, 0.072 * H, n=4, bulge=0.04)[:-1]
    rings += limb_rings(e, end, 0.074 * H, 0.088 * H, n=3)
    b.add('sleeve' + side, tube(rings, 14), jacket, region='arm' + side)
    b.add('sleeveTrim' + side, tube(limb_rings(end + Vector((0, 0, 0.015 * H)), end - Vector((0, 0, 0.008 * H)), 0.092 * H, 0.094 * H, n=1), 14), trim, region='arm' + side, subdiv=0)
    # punho com faixa vermelha (as luvas sem dedos amarradas)
    b.add('wristWrap' + side, tube(limb_rings(h + Vector((0, 0, 0.035 * H)), h - Vector((0, 0, 0.0)), 0.056 * H, 0.054 * H, n=1), 10), scarf, region='e' + side, subdiv=0)

# ================================================================ CARTUCHEIRAS cruzadas, cintos, a bolsa
def strap_path(p0, p1, p2, n=12):
    out = []
    for i in range(n + 1):
        t = i / n
        p = p0 * (1 - t) ** 2 + p1 * 2 * (1 - t) * t + p2 * t * t
        out.append(p)
    return out


def bandolier(name, s, bullets=True):
    # do ombro (lado s) cruzando o peito até o quadril do outro lado, rente ao tronco (antes da escala)
    p0 = Vector((s * 0.15 * H, -0.06 * H, top + 0.02 * H))
    p1 = Vector((0.0, -0.165 * H, hz + 0.33 * H))
    p2 = Vector((-s * 0.17 * H, -0.12 * H, hz + 0.06 * H))
    pts = strap_path(p0, p1, p2, 14)
    b.add(name, rod(pts, 0.026 * H, 6, flat=(outward((0, 0)), 0.3)), strap, region='torso', subdiv=0)
    if bullets:
        cart = []
        for i in range(2, 13):
            p = pts[i]
            t = (pts[i + 1] - pts[i - 1]).normalized()
            q = p + Vector((0, -0.01 * H, 0))
            cart.append(cone(tuple(q - t * 0.012), tuple(q + Vector((0, -0.028 * H, 0.0))), 0.0075, 6))
        b.add(name + 'Shells', merge(*cart), shell, region='torso', subdiv=0)


bandolier('bandolierA', 1)
bandolier('bandolierB', -1)
# cinto da calça (fivela de metal) e o cinto de couro baixo, inclinado, com bolsinhas
b.add('belt', tube([(0, 0, hz + 0.06 * H, 0.186 * H, 0.142 * H), (0, 0, hz + 0.1 * H, 0.188 * H, 0.143 * H)], 22), strap, region='torso', subdiv=0)
b.add('buckle', box((0, -0.145 * H, hz + 0.08 * H), (0.06, 0.014, 0.042), bevel=0.005), brass, region='torso', subdiv=0)
low = [(math.sin(a) * 0.2 * H, -math.cos(a) * 0.153 * H, hz + (0.0 + 0.05 * math.sin(a)) * H) for a in [i / 24 * TAU for i in range(25)]]
b.add('beltLow', rod(low, 0.022 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), strap, region='torso', subdiv=0)
for k, a in enumerate((-0.9, -0.5, 0.5)):
    p = Vector((math.sin(a) * 0.212 * H, -math.cos(a) * 0.162 * H, hz + (0.05 * math.sin(a) - 0.02) * H))
    b.add(f'pouch{k}', box(tuple(p), (0.05, 0.03, 0.055), bevel=0.008), strap, region='torso', subdiv=0)

# a BOLSA AMARELA (embornal) no quadril esquerdo, com a alça cruzando do ombro direito — forma orgânica (escultura)
bp = Vector((0.205 * H, -0.06 * H, hz - 0.06 * H))
B = Sculpt()
B.ell(bp, (0.05 * H, 0.04 * H, 0.075 * H))
B.ell(bp + Vector((0, -0.012, 0.05 * H)), (0.052 * H, 0.03 * H, 0.03 * H))  # a aba dobrada por cima
B.ell(bp + Vector((0, 0.0, -0.05 * H)), (0.045 * H, 0.036 * H, 0.03 * H))  # o fundo pesado
b.add('bag', B.mesh(res=0.007, smooth=3, disp=lambda p: 0.002 * n3(p, 40), target=900), bag, region='torso', subdiv=0)
sl = strap_path(Vector((-0.16 * H, 0.0, top + 0.03 * H)), Vector((0.02 * H, -0.172 * H, hz + 0.32 * H)), bp + Vector((0, 0, 0.07 * H)), 14)
b.add('bagStrap', rod(sl, 0.018 * H, 6, flat=(outward((0, 0)), 0.3)), bag, region='torso', subdiv=0)

# ================================================================ LENÇO vermelho e branco no pescoço (escultura)
L = Sculpt()
L.chain(ring_pts(top + 0.075 * H, 0.078 * H, 0.076 * H, 0, TAU, 18), 0.03 * H, step=0.6)  # a volta no pescoço
knot = Vector((0.0, -0.14 * H, top + 0.02 * H))
L.ell(knot, (0.034 * H, 0.026 * H, 0.03 * H))  # o nó
for s in (1, -1):  # as duas pontas do nó caindo no peito, e o pano do nó até a volta
    L.chain([knot + Vector((s * 0.018 * H, -0.012 * H, -0.01 * H)), knot + Vector((s * 0.045 * H, -0.016 * H, -0.09 * H)), knot + Vector((s * 0.04 * H, -0.012 * H, -0.17 * H))],
            [0.022 * H, 0.02 * H, 0.012 * H], step=0.55)
    L.chain([knot + Vector((s * 0.03, 0.02, 0.03)), Vector((s * 0.07 * H, -0.06 * H, top + 0.065 * H))], [0.024 * H, 0.026 * H], step=0.6)


def scarf_folds(p):
    return 0.003 * (ridge((p.x * 1.0 + p.z * 0.5) * 140 + n3(p, 30)) - 0.35)


b.add('scarf', L.mesh(res=0.006, smooth=3, disp=scarf_folds, target=1800), scarf, region='torso', subdiv=0)
# o triângulo do lenço deitado no peito (por baixo do nó), com a barra branca
tri = []
for i in range(7):
    v = i / 6
    z = top + 0.05 * H - v * 0.22 * H
    half = (0.13 * (1 - v) + 0.006) * H
    row = []
    for j in range(9):
        u = j / 8 * 2 - 1
        row.append(Vector((u * half, -0.146 * H - 0.012 * H * (1 - u * u) - 0.01 * H * v, z - 0.02 * H * u * u * (1 - v))))
    tri.append(row)
b.add('scarfDrape', shell_grid(tri, 0.006), scarf, region='torso', subdiv=1)
edge = [tri[i][0] + Vector((0, -0.004, 0)) for i in range(7)] + [tri[6 - i][8] + Vector((0, -0.004, 0)) for i in range(1, 7)]
b.add('scarfEdge', rod(edge, 0.0075 * H, 5), scarf_w, region='torso', subdiv=0)

# ================================================================ CALÇA até o joelho, FAIXAS nas canelas, ALPERCATAS
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    # a calça de couro BUFANTE (escultura): larga na coxa, franzida logo abaixo do joelho, com as dobras do couro
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.05 * H)), l.lerp(k, 0.45) + Vector((0, -0.005 * H, 0)), k + Vector((0, -0.006 * H, 0.03 * H)), k - Vector((0, 0, 0.055 * H))],
            [0.1 * H, 0.098 * H, 0.09 * H, 0.078 * H], step=0.45)
    P.ell(k - Vector((0, 0.004 * H, 0.03 * H)), (0.088 * H, 0.088 * H, 0.04 * H))  # a calça amontoada no joelho
    c = (l.x, l.y)
    fold = lambda p, c=c: 0.004 * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 7 + p.z * 18 + n3(p, 20)) - 0.35)
    b.add('breeches' + side, P.mesh(res=0.01, smooth=3, disp=fold, target=1400), M['legs'], region='leg' + side, subdiv=0)
    # faixas ensanguentadas enroladas da canela ao tornozelo (espiral de faixa)
    wraps = []
    z0, z1 = k.z - 0.06 * H, f.z + 0.07 * H
    turns = 6
    n = turns * 14
    for i in range(n + 1):
        t = i / n
        a = t * turns * TAU
        z = z0 + (z1 - z0) * t
        rr = (0.069 - 0.014 * t) * H
        wraps.append(Vector((f.x + math.sin(a) * rr, f.y - math.cos(a) * rr * 0.95, z + 0.008 * math.sin(a * 0.5))))
    b.add('bandage' + side, rod(wraps, 0.017 * H, 6, flat=(outward((f.x, f.y)), 0.22)), bandage, region='leg' + side, subdiv=0)
    # alpercata: sola grossa e as tiras de couro cruzando o peito do pé e o calcanhar
    b.add('sole' + side, box((f.x, f.y - 0.05 * H, f.z - 0.022 * H), (0.11 * H, 0.27 * H, 0.03 * H), bevel=0.01), sole, region='k' + side, subdiv=0)
    st = []
    st.append(tube([(f.x - 0.052 * H, f.y - 0.08 * H, f.z, 0.012 * H, 0.005), (f.x, f.y - 0.1 * H, f.z + 0.042 * H, 0.012 * H, 0.005), (f.x + 0.052 * H, f.y - 0.08 * H, f.z, 0.012 * H, 0.005)], 6))
    st.append(tube([(f.x - 0.05 * H, f.y + 0.02 * H, f.z, 0.012 * H, 0.005), (f.x, f.y + 0.05 * H, f.z + 0.07 * H, 0.012 * H, 0.005), (f.x + 0.05 * H, f.y + 0.02 * H, f.z, 0.012 * H, 0.005)], 6))
    st.append(tube([(f.x + math.sin(a) * 0.058 * H, f.y - math.cos(a) * 0.055 * H, f.z + 0.075 * H, 0.011 * H, 0.005) for a in [i / 12 * TAU for i in range(13)]], 6))
    b.add('sandal' + side, merge(*st), sandal, region='k' + side, subdiv=0)

# ================================================================ CABELO longo e BIGODE (escultura)
Hr = Sculpt()
# a massa por trás e pelos lados da cabeça, caindo até os ombros (por baixo do chapéu)
Hr.ell(hc + Vector((0, 0.035 * H, 0.05 * H)), (0.152 * H, 0.15 * H, 0.13 * H))
for s in (1, -1):
    Hr.chain([hc + Vector((s * 0.13 * H, 0.02 * H, 0.04 * H)), hc + Vector((s * 0.15 * H, 0.04 * H, -0.08 * H)), hc + Vector((s * 0.14 * H, 0.06 * H, -0.2 * H)), hc + Vector((s * 0.15 * H, 0.08 * H, -0.27 * H))],
             [0.05 * H, 0.055 * H, 0.05 * H, 0.03 * H], step=0.5)
Hr.chain([hc + Vector((0, 0.1 * H, 0.0)), hc + Vector((0, 0.13 * H, -0.12 * H)), hc + Vector((0, 0.12 * H, -0.25 * H))], [0.12 * H, 0.11 * H, 0.07 * H], step=0.5)
# o rosto fica livre: cava a frente
Hr.ell(hc + Vector((0, -0.09 * H, -0.04 * H)), (0.13 * H, 0.1 * H, 0.17 * H), neg=True)


def hair_strands(p):
    a = math.atan2(p.x - hc.x, p.y - hc.y)
    return 0.004 * (ridge(a * 26 + n3(p, 18) * 1.5, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.009, smooth=3, disp=hair_strands, target=2200), hairm, region='neck', subdiv=0)

St = Sculpt()
for s in (1, -1):  # bigode grosso de pontas caídas
    St.chain([hc + Vector((s * 0.008, -0.153 * H, -0.06 * H)), hc + Vector((s * 0.035 * H, -0.15 * H, -0.064 * H)), hc + Vector((s * 0.058 * H, -0.138 * H, -0.085 * H)), hc + Vector((s * 0.062 * H, -0.13 * H, -0.115 * H))],
             [0.017 * H, 0.019 * H, 0.015 * H, 0.009 * H], step=0.5)
b.add('mustache', St.mesh(res=0.004, smooth=2, disp=lambda p: 0.0012 * (ridge(p.x * 900, 2) - 0.4), target=700), stache, region='head', subdiv=0)
br = []
for s in (1, -1):  # sobrancelhas grossas (por cima dos óculos)
    br.append(tube([(s * 0.022 * H, hc.y - 0.15 * H, hc.z + 0.038 * H, 0.009, 0.006), (s * 0.075 * H, hc.y - 0.137 * H, hc.z + 0.044 * H, 0.008, 0.005)], 5))
b.add('brows', merge(*br), stache, region='head', subdiv=0)

# ================================================================ ÓCULOS redondos de lentes vermelhas
gl = []
for s in (1, -1):
    c = Vector((s * 0.047 * H, hc.y - 0.158 * H, hc.z + 0.008 * H))
    gl.append(ellipsoid(tuple(c), (0.024 * H, 0.004, 0.024 * H), 14, 6))
b.add('lenses', merge(*gl), lens, region='head', subdiv=0)
fr = []
for s in (1, -1):
    c = Vector((s * 0.047 * H, hc.y - 0.16 * H, hc.z + 0.008 * H))
    fr.append(tube([(c.x + math.sin(a) * 0.026 * H, c.y, c.z + math.cos(a) * 0.026 * H, 0.0028, 0.0028) for a in [i / 16 * TAU for i in range(17)]], 4))
    fr.append(tube([(s * 0.073 * H, hc.y - 0.155 * H, hc.z + 0.012 * H, 0.0025, 0.0025), (s * 0.138 * H, hc.y - 0.06 * H, hc.z + 0.012 * H, 0.0025, 0.0025)], 4))  # haste
fr.append(tube([(-0.022 * H, hc.y - 0.162 * H, hc.z + 0.016 * H, 0.0025, 0.0025), (0, hc.y - 0.166 * H, hc.z + 0.02 * H, 0.0025, 0.0025), (0.022 * H, hc.y - 0.162 * H, hc.z + 0.016 * H, 0.0025, 0.0025)], 4))
b.add('glassFrame', merge(*fr), frame, region='head', subdiv=0)

# ================================================================ O CHAPÉU DE CANGACEIRO
hb = hc + Vector((0, 0.005 * H, 0.105 * H))  # a base da copa (a testa)
# copa: escultura (couro amassado), assentada sobre a cabeça
Cp = Sculpt()
Cp.ell(hb + Vector((0, 0.0, 0.035 * H)), (0.152 * H, 0.165 * H, 0.085 * H))
Cp.ell(hb + Vector((0, 0.0, 0.075 * H)), (0.12 * H, 0.13 * H, 0.06 * H))
b.add('hatCrown', Cp.mesh(res=0.008, smooth=4, disp=lambda p: 0.002 * n3(p, 24), target=1400), hat, region='head', subdiv=0)
b.add('hatBand', tube([(0, hb.y, hb.z + 0.012 * H, 0.155 * H, 0.168 * H), (0, hb.y, hb.z + 0.04 * H, 0.153 * H, 0.166 * H)], 26), hat_band, region='head', subdiv=0)


# a aba em meia-lua: na frente e atrás sobe na vertical; nos lados vira as pontas
def brim_pt(a, t):
    w = abs(math.cos(a)) ** 0.7  # 1 na frente/atrás, 0 nos lados
    base = Vector((math.sin(a) * 0.158 * H, hb.y - math.cos(a) * 0.17 * H, hb.z + 0.01 * H))
    out = Vector((math.sin(a), -math.cos(a), 0))
    up = Vector((0, 0, 1))
    side_len = 0.085 * H * (1 - w)
    fb_len = (0.19 if math.cos(a) > 0 else 0.15) * H * w  # a frente é a meia-lua mais alta
    p = base + out * (side_len + 0.012 * H * w) * t + up * (fb_len + 0.075 * H * (1 - w)) * t
    # a meia-lua inclina para fora em cima (a frente debruçada sobre a testa)
    p += out * 0.05 * H * w * t * t
    return p


brim_rows = [[brim_pt(a, t) for a in [math.pi + i / 48 * TAU for i in range(49)]] for t in (0, 0.33, 0.66, 1.0)]
b.add('hatBrim', shell_grid(brim_rows, 0.009 * H), hat, region='head', subdiv=1)
# a ESTRELA de seis pontas na frente da aba (metal), as tachas pela aba e os espinhos no topo da copa
fa = 0.0
fc = brim_pt(fa, 0.55) + Vector((0, -0.008, 0))
star = []
for k in range(6):  # dois triângulos sobrepostos, em relevo
    a = k / 6 * TAU
    tip = fc + Vector((math.sin(a) * 0.05 * H, 0, math.cos(a) * 0.05 * H))
    star.append(cone(tuple(fc), tuple(tip), 0.012 * H, 4))
star.append(ellipsoid(tuple(fc + Vector((0, -0.004, 0))), (0.016 * H, 0.008, 0.016 * H), 10, 6))
b.add('hatStar', merge(*star), brass, region='head', subdiv=0)
studs = []
for t in (0.85,):
    for i in range(-9, 10):
        a = i * 0.11
        if abs(a) < 0.2:
            continue
        for back in (0, math.pi):
            p = brim_pt(a + back, t) - Vector((math.sin(a + back), -math.cos(a + back), 0)) * 0.006
            studs.append(ellipsoid(tuple(p), (0.008, 0.008, 0.008), 6, 4))
b.add('hatStuds', merge(*studs), brass, region='head', subdiv=0)
th = []
for i in range(11):  # a Coroa de Espinhos cravada no topo
    a = i / 11 * TAU + 0.2
    base = hb + Vector((math.sin(a) * 0.1 * H, -math.cos(a) * 0.11 * H, 0.1 * H))
    tip = base + Vector((math.sin(a) * 0.06 * H, -math.cos(a) * 0.06 * H, 0.09 * H + random.uniform(-0.01, 0.03) * H))
    th.append(cone(tuple(base), tuple(tip), 0.009 * H, 5))
th.append(cone(tuple(hb + Vector((0, 0, 0.13 * H))), tuple(hb + Vector((0, 0, 0.25 * H))), 0.01 * H, 5))
b.add('hatThorns', merge(*th), thorn, region='head', subdiv=0)
# as faíscas laranja em X nas pontas da aba (o brilho da Intenção nas artes)
sp = []
for s in (1, -1):
    c = brim_pt(s * math.pi / 2, 1.0) + Vector((s * 0.03 * H, 0, 0.02 * H))
    for rot in (0.785, -0.785):
        d = Vector((math.cos(rot), 0, math.sin(rot))) * 0.035 * H
        sp.append(tube([(c.x - d.x, c.y, c.z - d.z, 0.004, 0.004), (c.x, c.y, c.z, 0.007, 0.007), (c.x + d.x, c.y, c.z + d.z, 0.004, 0.004)], 4))
b.add('hatSparks', merge(*sp), spark, region='head', subdiv=0)

b.export(OUT)

# o .blend fonte fica em tools/blender/fonte/ (fora do bundle do jogo)
src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'cristino.blend'), check_existing=False)
