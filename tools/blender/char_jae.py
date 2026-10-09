"""
PARK JAE-YOON — "JAE" / "X" (Natal Macabro / Hexatombe) — public/models/jae.glb.
Referências: Referencias visuais/Personagens/Jae ("jae corpo", "jae de costas", "X", "X corpo", "jae", "jae rosto",
"jae serio", "shiu", o gif "jae colocando mascara") e a wiki (1,70 m, traços coreanos, maquiagem preta forte nos olhos,
batom vermelho, pinta falsa no queixo; sobretudo de COURO vermelho com capuz por cima de roupa preta, vários cintos pelo
corpo, luvas sem dedos; com o capuz posto o rosto some e um X vermelho aparece na frente dele).
O que precisa ler de longe:
  - SOBRETUDO VERMELHO longo (até o meio da canela) ajustado no tronco e ABERTO na frente: no peito mostra a gola alta
    preta, abaixo da cintura as abas abrem e mostram as pernas; lapelas largas com debrum cinza e botões dourados; o
    cordão preto do capuz pendurado dos dois lados da abertura;
  - CAPELETA sobre os ombros (o "ombro duplo" da arte de costas) com o ARNÊS de tiras cinza e rebites dourados nas
    costas, duas tiras cinza atravessando a cintura atrás, tiras cinza com fivelas nos braços e tiras pretas em X nos
    antebraços; barra com faixa cinza, laços pretos em X e tirinhas pretas penduradas;
  - por baixo: gola alta preta canelada, suspensórios cinza, cinto vermelho, calça preta com abas de bolso cinza e tiras
    VERMELHAS em X nas coxas, joelhos e canelas; meias cinza caneladas e coturnos baixos; pochete na perna (wiki);
  - cabelo preto em camadas, franja comprida varrida de lado cobrindo o olho direito, nuca repicada;
  - CAPUZ: caído e embolado nas costas (prop_hoodDown) ou posto (prop_hoodUp — forma X): capuz alto e pontudo que avança
    sobre o rosto, cai sobre os ombros, tira preta em X com rebites no lado esquerdo e, dentro, só escuridão com o X
    vermelho brilhando. O jogo mostra só um dos dois (props.js → addJaeProps / addJaeXProps).
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); tudo em frações de H.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'jae.glb'

b = Builder(width=0.86, bulk=0.86, height=0.945)  # 1,70 m, magra
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_jae', '#e6c4a8', 0.7)
black = material('turtleneck_jae', '#1b191d', 0.9)
pants = material('pants_jae', '#1d1b1f', 0.9)
red = material('coat_jae', '#a3192a', 0.6)          # couro vermelho (textura coat_jae)
red_in = material('coat_lining_jae', '#4a0a12', 0.85)
strap_red = material('strap_red_jae', '#8e1622', 0.6)
grey = material('strap_grey_jae', '#a9a6ab', 0.6)
dark = material('strap_dark_jae', '#141216', 0.6)
brass = material('brass_jae', '#c9a24a', 0.35, metal=0.8)
glove = material('glove_jae', '#161418', 0.7)
boots = material('boots_jae', '#141416', 0.55)
sole = material('sole_jae', '#2a282c', 0.8)
sock = material('sock_jae', '#56545a', 0.85)
hairm = material('hair_jae', '#0d0b0f', 0.55)
void = material('hood_void_jae', '#020102', 1.0)
xglow = material('x_glow_jae', '#ff0a14', 0.5, emission='#ff0010', strength=3)

M = {
    'skin': skin,
    'face': material('face_jae', '#ffffff', 0.75),
    'torso': black,
    'arm': red,          # mangas do sobretudo
    'hand': glove,       # luvas pretas (sem dedos na arte; de longe lê como luva inteira)
    'legs': pants,
    'feet': boots,
}
hc = b.body(M, [(-0.11, 0.152), (0.0, 0.146), (0.17, 0.128), (0.36, 0.17), (0.47, 0.18), (0.57, 0.1), (0.63, 0.06)],
            arm_r=(0.064, 0.054, 0.046), leg_r=(0.08, 0.064, 0.052), head_r=(0.13, 0.14, 0.155))


# ---------------------------------------------------------------- utilidades
def lerp_table(tab, x):
    """interpola uma tabela [(x, valores...)] ordenada por x."""
    if x <= tab[0][0]:
        return tab[0][1:]
    for a, c in zip(tab, tab[1:]):
        if x <= c[0]:
            t = (x - a[0]) / (c[0] - a[0])
            return tuple(p + (q - p) * t for p, q in zip(a[1:], c[1:]))
    return tab[-1][1:]


def rod(pts, radii, seg=6, caps=True, flat=None):
    """Tubo com anéis perpendiculares ao caminho. flat=(normal_fn, achatamento): seção elíptica achatada na direção
    da normal (tiras e mechas de cabelo)."""
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
    """superfície por parâmetros (u, v) em [0,1]²."""
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


def rivet(p, r=0.0085):
    return ellipsoid(tuple(p), (r, r, r), 6, 4)


# ---------------------------------------------------------------- SOBRETUDO
# perfil (z relativo ao quadril em H → meia-largura, meia-profundidade), antes da escala do tronco
COAT_PROF = [(-0.76, 0.27, 0.205), (-0.6, 0.255, 0.19), (-0.35, 0.222, 0.162), (-0.12, 0.185, 0.134), (0.04, 0.168, 0.118),
             (0.2, 0.158, 0.108), (0.36, 0.192, 0.127), (0.47, 0.201, 0.136), (0.55, 0.19, 0.13), (0.6, 0.13, 0.104), (0.645, 0.085, 0.082)]
# abertura da frente (meio-ângulo em radianos): estreita na gola, mostra a gola alta no peito, abre bem abaixo da cintura
COAT_GAP = [(-0.76, 1.0), (-0.4, 0.92), (-0.1, 0.8), (0.06, 0.72), (0.22, 0.66), (0.4, 0.6), (0.55, 0.52), (0.645, 0.5)]
Z_TOP = 0.645


def hem_z(a):
    # barra um pouco mais alta na frente
    return -0.74 + 0.04 * max(0.0, math.cos(a)) ** 2


def coat_pt(a, z, out=1.0):
    rx, ry = lerp_table(COAT_PROF, z)
    # pregas leves na saia
    if z < -0.05:
        k = smoothstep(-0.05, -0.6, z)
        rx *= 1 + 0.022 * k * math.sin(a * 7)
        ry *= 1 + 0.022 * k * math.sin(a * 7)
    return Vector((math.sin(a) * rx * out * H, -math.cos(a) * ry * out * H, hz + z * H))


def gap_at(z):
    return lerp_table(COAT_GAP, z)[0]


def coat_param(u, v, out=1.0):
    """u: 0 = borda esquerda da abertura (x>0) → 1 = borda direita, pelas costas; v: 0 = gola → 1 = barra."""
    # z primeiro por uma estimativa do ângulo (a barra depende do ângulo)
    z = Z_TOP + (hem_z(math.pi) - Z_TOP) * v
    g = gap_at(z)
    a = g + (TAU - 2 * g) * u
    z = Z_TOP + (hem_z(a) - Z_TOP) * v
    g = gap_at(z)
    a = g + (TAU - 2 * g) * u
    return coat_pt(a, z, out), a, z


def coat_w(p):
    if p.z >= hz - 0.02 * H:
        return auto_weights(sk, p, 'torso')
    drop = smoothstep(hz, sk['kL'].z, p.z)
    lw = drop * 0.5
    sl = smoothstep(-0.04 * H, 0.04 * H, p.x)
    return {'hips': 1 - lw, 'lL': lw * sl, 'lR': lw * (1 - sl)}


NU, NV = 56, 34
b.add('coat', grid(lambda u, v: coat_param(u, v)[0], NU, NV), red, region='torso', weight_fn=coat_w, subdiv=0)
b.add('coat_in', grid(lambda u, v: coat_param(u, v, 0.975)[0], NU, NV, flip=True), red_in, region='torso', weight_fn=coat_w, subdiv=0)


def on_coat(a, z, out=1.012):
    return coat_pt(a, z, out)


# debrum cinza nas duas bordas da abertura (da gola à barra) e o cordão preto do capuz caindo do lado de dentro
trim, cords = [], []
for s in (1, -1):
    pts = []
    for k in range(40):
        z = Z_TOP - (Z_TOP - hem_z(0.9)) * k / 39
        g = gap_at(z)
        a = g if s > 0 else TAU - g
        pts.append(on_coat(a, z, 1.006))
    trim.append(rod(pts, [0.0075 * H] * len(pts), 5))
    cp = []
    for k in range(14):
        z = 0.6 - 0.72 * k / 13
        g = gap_at(z) - 0.1
        a = g if s > 0 else TAU - g
        p = on_coat(a, z, 0.99) + Vector((0, -0.012 * H, 0))
        cp.append(p)
    cords.append(rod(cp, [0.009 * H] * len(cp), 5))
    # ponteira de latão do cordão
    trim.append(rivet(cp[-1] + Vector((0, 0, -0.008 * H)), 0.007 * H))
b.add('coat_trim', merge(*trim), grey, region='torso', weight_fn=coat_w, subdiv=0)
b.add('hood_cords', merge(*cords), dark, region='torso', weight_fn=coat_w, subdiv=0)

# lapelas largas viradas para fora (da gola até a altura do umbigo), com botões dourados perto da borda
LAP_TOP, LAP_BOT = 0.6, 0.24


def lapel_w(v):
    # largura (rad): sobe rápido, entalhe pequeno perto do topo, afina até a ponta embaixo
    w = 0.52 * math.sin(min(1.0, v / 0.35) * math.pi / 2) * (1 - smoothstep(0.35, 1.0, v) * 0.98)
    if 0.12 < v < 0.2:
        w *= 0.72  # entalhe da lapela
    return w


lap_parts, lap_trim, buttons = [], [], []
for s in (1, -1):
    def lap(u, v, out=1.03, s=s):
        z = LAP_TOP + (LAP_BOT - LAP_TOP) * v
        g = gap_at(z)
        a = g + lapel_w(v) * u
        if s < 0:
            a = TAU - a
        return on_coat(a, z, out + 0.012 * (1 - u))
    lap_parts.append(grid(lap, 6, 18, flip=s < 0))
    edge = [lap(1.0, k / 24, 1.036) for k in range(25)]
    lap_trim.append(rod(edge, [0.0065 * H] * len(edge), 5))
    for v in (0.32, 0.5, 0.68):
        buttons.append(rivet(lap(0.62, v, 1.05), 0.011 * H))
b.add('lapels', merge(*lap_parts), red, region='torso', weight_fn=coat_w, subdiv=0)
b.add('lapel_trim', merge(*lap_trim), grey, region='torso', weight_fn=coat_w, subdiv=0)
b.add('coat_buttons', merge(*buttons), brass, region='torso', weight_fn=coat_w, subdiv=0)

# ---------------------------------------------------------------- CAPELETA nos ombros (aberta na frente, cobre o alto
# dos braços) com debrum embaixo
CAPE_A0 = 0.95
CAPE_PROF = [(0.36, 0.262, 0.172), (0.44, 0.255, 0.168), (0.52, 0.238, 0.158), (0.58, 0.19, 0.135), (0.625, 0.112, 0.1)]


def cape_pt(a, z, out=1.0):
    rx, ry = lerp_table(CAPE_PROF, z)
    return Vector((math.sin(a) * rx * out * H, -math.cos(a) * ry * out * H, hz + z * H))


def cape_param(u, v, out=1.0):
    a = CAPE_A0 + (TAU - 2 * CAPE_A0) * u
    z = 0.625 - (0.625 - 0.37 - 0.03 * math.cos(a)) * v  # um pouco mais curta na frente
    return cape_pt(a, z, out)


def cape_w(p):
    w = auto_weights(sk, p, 'torso')
    sh = smoothstep(0.17 * H, 0.26 * H, abs(p.x)) * 0.55
    side = 'L' if p.x > 0 else 'R'
    out = {k: v * (1 - sh) for k, v in w.items()}
    out['s' + side] = out.get('s' + side, 0) + sh
    return out


b.add('capelet', grid(lambda u, v: cape_param(u, v), 40, 10), red, region='torso', weight_fn=cape_w, subdiv=0)
b.add('capelet_in', grid(lambda u, v: cape_param(u, v, 0.975), 40, 10, flip=True), red_in, region='torso', weight_fn=cape_w, subdiv=0)
cape_hem = [cape_param(k / 40, 1.0, 1.01) for k in range(41)]
b.add('capelet_trim', rod(cape_hem, [0.007 * H] * len(cape_hem), 5), grey, region='torso', weight_fn=cape_w, subdiv=0)

# ---------------------------------------------------------------- ARNÊS de tiras cinza com rebites (costas, ombros, peito)
straps, rivets = [], []
FLAT_T = 0.35


def strap_path(pts, w=0.016, flat_out=None):
    c = Vector((0, 0, sk['chest'].z))
    nf = flat_out or (lambda p: Vector((p.x, p.y, 0)).normalized() if Vector((p.x, p.y, 0)).length > 1e-6 else Vector((0, 1, 0)))
    return rod(pts, [w * H] * len(pts), 6, flat=(nf, FLAT_T))


# faixa horizontal nas costas na base da capeleta e outra no alto, entre as escápulas
for z, a0, a1 in ((0.47, 2.25, TAU - 2.25), (0.56, 2.5, TAU - 2.5)):
    pts = [cape_pt(a0 + (a1 - a0) * k / 12, z, 1.035) for k in range(13)]
    straps.append(strap_path(pts, 0.017))
    for k in (0, 4, 8, 12):
        rivets.append(rivet(cape_pt(a0 + (a1 - a0) * k / 12, z, 1.07), 0.012 * H))
# tiras do ombro: da frente da capeleta, por cima do ombro, até a faixa de cima nas costas (com fivela na frente)
for s in (1, -1):
    pts = []
    for k in range(11):
        t = k / 10
        a = 1.15 + (2.5 - 1.15) * t
        z = 0.5 + 0.12 * math.sin(t * math.pi)
        pts.append(cape_pt(a if s > 0 else TAU - a, z, 1.04 + 0.03 * math.sin(t * math.pi)))
    straps.append(strap_path(pts, 0.016))
    bk = cape_pt(1.25 if s > 0 else TAU - 1.25, 0.53, 1.09)
    rivets.append(box(tuple(bk), (0.03 * H, 0.012 * H, 0.03 * H), bevel=0.003))
# duas tiras cinza atravessando a cintura nas costas (com dois rebites cada)
for z in (0.2, 0.12):
    a0, a1 = 1.7, TAU - 1.7
    pts = [on_coat(a0 + (a1 - a0) * k / 12, z, 1.025) for k in range(13)]
    straps.append(strap_path(pts, 0.016))
    for k in (4, 8):
        rivets.append(rivet(on_coat(a0 + (a1 - a0) * k / 12, z, 1.06), 0.012 * H))
# peito: duas tiras cinza curtas com fivela de latão saindo da lapela de cada lado (arte "X")
for s in (1, -1):
    for z in (0.43, 0.36):
        g = gap_at(z) + lapel_w((LAP_TOP - z) / (LAP_TOP - LAP_BOT)) + 0.04
        pts = [on_coat((g + 0.5 * k / 6) if s > 0 else TAU - (g + 0.5 * k / 6), z - 0.012 * k / 6, 1.03) for k in range(7)]
        straps.append(strap_path(pts, 0.013))
        rivets.append(box(tuple(on_coat(g + 0.08 if s > 0 else TAU - g - 0.08, z, 1.06)), (0.022 * H, 0.012 * H, 0.03 * H), bevel=0.003))
b.add('harness', merge(*straps), grey, region='torso', weight_fn=cape_w, subdiv=0)
b.add('harness_rivets', merge(*rivets), brass, region='torso', weight_fn=cape_w, subdiv=0)

# ---------------------------------------------------------------- BARRA: faixa cinza, laços pretos em X com rebites e
# tirinhas penduradas
band = grid(lambda u, v: coat_param(u, 0.915 + 0.085 * v, 1.01)[0], 56, 2)
b.add('hem_band', band, grey, region='torso', weight_fn=coat_w, subdiv=0)
laces, hem_rivets, tassels = [], [], []
for k in range(15):
    u = (k + 0.5) / 15
    du = 0.018
    p0 = coat_param(u - du, 0.85, 1.018)[0]
    p1 = coat_param(u + du, 0.915, 1.018)[0]
    p2 = coat_param(u + du, 0.85, 1.018)[0]
    p3 = coat_param(u - du, 0.915, 1.018)[0]
    laces.append(rod([p0, p1], [0.0055 * H] * 2, 4))
    laces.append(rod([p2, p3], [0.0055 * H] * 2, 4))
    for pp in (p0, p2):
        hem_rivets.append(rivet(pp, 0.0085 * H))
    for j, off in enumerate((-0.006, 0.006)):
        q, a, z = coat_param(u + off, 1.0, 1.0)
        d = (j * 2 - 1) * 0.004 * H
        tassels.append(rod([q, q + Vector((0, 0, -0.04 * H)), q + Vector((d, 0, -0.085 * H))], [0.006 * H, 0.0055 * H, 0.004 * H], 4, flat=(lambda p: Vector((p.x, p.y, 0)).normalized(), 0.4)))
b.add('hem_laces', merge(*laces, *tassels), dark, region='torso', weight_fn=coat_w, subdiv=0)
b.add('hem_rivets', merge(*hem_rivets), brass, region='torso', weight_fn=coat_w, subdiv=0)

# ---------------------------------------------------------------- MANGAS: punho largo, faixas cinza com fivela, tiras
# pretas em X no antebraço
for side in ('L', 'R'):
    sx = 1 if side == 'L' else -1
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    b.add('coat_cuff' + side, tube(limb_rings(e.lerp(h, 0.58), e.lerp(h, 0.78), 0.056, 0.061, n=2), 14), red, region='e' + side, subdiv=0)
    b.add('cuff_trim' + side, tube(limb_rings(e.lerp(h, 0.76), e.lerp(h, 0.8), 0.062, 0.062, n=1), 14), grey, region='e' + side, subdiv=0)
    bands = []
    # braço esquerdo com três faixas (arte "X"), o direito com uma
    for t in ((0.55, 0.7, 0.85) if side == 'L' else (0.62,)):
        bands.append(tube(limb_rings(sh.lerp(e, t), sh.lerp(e, t + 0.065), 0.0675, 0.066, n=1), 14))
    b.add('arm_bands' + side, merge(*bands), grey, region='arm' + side, subdiv=0)
    bk = [box((sh.lerp(e, t).x + sx * 0.066, sh.lerp(e, t).y - 0.02, sh.lerp(e, t).z - 0.01), (0.012, 0.024, 0.026), bevel=0.002)
          for t in ((0.55, 0.7, 0.85) if side == 'L' else (0.62,))]
    b.add('arm_buckles' + side, merge(*bk), brass, region='arm' + side, subdiv=0)
    xs = []
    for (a0, a1) in ((0.18, 0.5), (0.5, 0.18)):
        for ph in (0.0, math.pi):
            p0, p1 = e.lerp(h, a0), e.lerp(h, a1)
            c0 = Vector((p0.x + math.sin(ph + 0.9) * 0.057, p0.y - math.cos(ph + 0.9) * 0.057, p0.z))
            c1 = Vector((p1.x + math.sin(ph - 0.9) * 0.057, p1.y - math.cos(ph - 0.9) * 0.057, p1.z))
            xs.append(rod([c0, c0.lerp(c1, 0.5) + (c0.lerp(c1, 0.5) - p0.lerp(p1, 0.5)).normalized() * 0.004, c1], [0.008, 0.008, 0.008], 4))
    b.add('sleeve_x' + side, merge(*xs), dark, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- por baixo: gola alta, suspensórios, cinto
b.add('turtleneck', tube([(0, 0, 1.555 * H, 0.072 * H, 0.07 * H), (0, 0, 1.62 * H, 0.07 * H, 0.068 * H), (0, 0, 1.7 * H, 0.066 * H, 0.064 * H)], 18), black, region='neck', subdiv=0)
b.add('turtleneck_fold', tube([(0, 0, 1.6 * H, 0.076 * H, 0.074 * H), (0, 0, 1.655 * H, 0.074 * H, 0.072 * H)], 18), black, region='neck', subdiv=0)
for s in (1, -1):
    # suspensório cinza visível na abertura do casaco
    pts = []
    for k in range(9):
        z = 0.56 - 0.48 * k / 8
        w = lerp_table([(0.08, 0.162), (0.2, 0.13), (0.36, 0.17), (0.47, 0.18), (0.56, 0.12)], z)[0]
        x = s * (0.085 - 0.01 * k / 8) * H
        y = -math.sqrt(max(0.0, 1 - (x / (w * H)) ** 2)) * w * 0.62 * H - 0.004 * H
        pts.append(Vector((x, y, hz + z * H)))
    b.add(f'suspender{s}', strap_path(pts, 0.012), grey, region='torso', subdiv=0)
    clip = pts[-1]
    b.add(f'susp_clip{s}', box((clip.x, clip.y - 0.004 * H, clip.z + 0.012 * H), (0.024 * H, 0.008 * H, 0.03 * H), bevel=0.002), brass, region='torso', subdiv=0)
b.add('belt', tube([(0, 0, hz + 0.035 * H, 0.164 * H, 0.106 * H), (0, 0, hz + 0.09 * H, 0.162 * H, 0.104 * H)], 24), strap_red, region='torso', subdiv=0)
b.add('belt_loop', merge(box((0, -0.108 * H, hz + 0.062 * H), (0.05 * H, 0.012 * H, 0.06 * H), bevel=0.004),
                         box((0, -0.115 * H, hz + 0.062 * H), (0.026 * H, 0.01 * H, 0.03 * H), bevel=0.003)), strap_red, region='torso', subdiv=0)

# ---------------------------------------------------------------- calça: abas de bolso cinza na frente das coxas, tiras
# vermelhas (arnês do cinto até a coxa, X nos joelhos e nas canelas), pochete na perna direita
leg_x, leg_bands, flaps = [], [], []
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    sx = 1 if side == 'L' else -1
    pk = l.lerp(k, 0.5)
    flaps.append((side, box((pk.x + sx * 0.012, pk.y - 0.075, pk.z + 0.02), (0.075, 0.02, 0.045), bevel=0.006)))

    def around(c, r, a):
        return Vector((c.x + math.sin(a) * r, c.y - math.cos(a) * r, c.z))
    def leg_c(t, l=l, k=k, f=f):
        # 0..1 coxa (quadril → joelho), 1..2 canela (joelho → tornozelo)
        return l.lerp(k, t) if t <= 1 else k.lerp(f, t - 1)
    for (t0, t1, r) in ((0.8, 1.04, 0.076), (1.16, 1.4, 0.07)):
        # X: duas tiras cruzadas em volta da perna (meia volta pela frente)
        for flip in (1, -1):
            pts = []
            for j in range(9):
                u = j / 8
                c = leg_c(t0 + (t1 - t0) * (u if flip > 0 else 1 - u))
                pts.append(around(c, r + 0.004, (u - 0.5) * 2.6))
            leg_x.append((side, rod(pts, [0.009] * len(pts), 4, flat=(lambda p, ll=l: Vector((p.x - ll.x, p.y - ll.y, 0)).normalized(), 0.5))))
    rings = [tube(limb_rings(l.lerp(k, t), l.lerp(k, t + 0.035), 0.086, 0.085, n=1), 14) for t in (0.32,)]
    rings += [tube(limb_rings(k.lerp(f, t), k.lerp(f, t + 0.045), 0.071, 0.07, n=1), 14) for t in (0.08, 0.5)]
    leg_bands.append((side, merge(*rings)))
    # meia cinza canelada + coturno baixo com sola grossa
    b.add('sock' + side, tube(limb_rings(k.lerp(f, 0.66), k.lerp(f, 0.93), 0.062, 0.06, n=4, bulge=0.003), 14), sock, region='k' + side, subdiv=0)
    b.add('boot_top' + side, tube(limb_rings(k.lerp(f, 0.9), k.lerp(f, 1.0), 0.066, 0.068, n=1), 14), boots, region='k' + side, subdiv=0)
    b.add('boot_toe' + side, ellipsoid((f.x, f.y - 0.1 * H, f.z + 0.03 * H), (0.052 * H, 0.075 * H, 0.04 * H), 12, 8, theta_max=math.pi * 0.55), boots, region='foot' + side, subdiv=0)
    b.add('sole' + side, box((f.x, f.y - 0.05 * H, f.z - 0.012 * H), (0.108 * H, 0.27 * H, 0.03 * H), bevel=0.006), sole, region='foot' + side, subdiv=0)
for side in ('L', 'R'):
    b.add('leg_x' + side, merge(*[p for s_, p in leg_x if s_ == side]), strap_red, region='leg' + side, subdiv=0)
    b.add('leg_bands' + side, merge(*[p for s_, p in leg_bands if s_ == side]), strap_red, region='leg' + side, subdiv=0)
    b.add('pocket_flap' + side, merge(*[p for s_, p in flaps if s_ == side]), grey, region='leg' + side, subdiv=0)
# ---------------------------------------------------------------- luvas sem dedos (palma e dorso; dedos de fora) com
# punho cinza e faixa vermelha
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    r = 0.046 * 1.15
    c = h + Vector((0, 0, -0.04 * H))
    b.add('glove_cuff' + side, tube(limb_rings(e.lerp(h, 0.88), e.lerp(h, 1.02), 0.05, 0.051, n=1), 12), glove, region='e' + side, subdiv=0)
    b.add('wrist_g' + side, tube(limb_rings(e.lerp(h, 0.82), e.lerp(h, 0.88), 0.052, 0.052, n=1), 12), grey, region='e' + side, subdiv=0)

# ---------------------------------------------------------------- CABELO: preto em camadas, franja varrida de lado
HR = (0.141 * H, 0.151 * H, 0.165 * H)
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.01))


def hp(phi, th, r=1.0):
    """ponto na casca do cabelo: phi 0 = frente, > 0 = lado esquerdo dela (x > 0); th 0 = topo."""
    return HC + Vector((math.sin(th) * math.sin(phi) * HR[0] * r, -math.sin(th) * math.cos(phi) * HR[1] * r, math.cos(th) * HR[2] * r))


def head_out(p):
    d = p - HC
    return d.normalized() if d.length > 1e-6 else Vector((0, 0, 1))


def lock(phi0, th0, phi1, th1, w=0.03, r0=1.0, r1=1.06, n=7, drop=0.0, curl=0.0):
    pts, rad = [], []
    for j in range(n):
        t = j / (n - 1)
        ph = phi0 + (phi1 - phi0) * t
        th = th0 + (th1 - th0) * t
        r = r0 + (r1 - r0) * t + 0.05 * math.sin(t * math.pi)  # volume no meio da mecha
        p = hp(ph, th, r) + Vector((0, 0, -drop * H * t * t))
        p += head_out(p) * curl * H * t * t
        pts.append(p)
        rad.append(w * H * (1 - 0.88 * t ** 1.4) + 0.002 * H)
    return rod(pts, rad, 6, flat=(head_out, 0.32))


b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z + 0.002), (HR[0] * 0.985, HR[1] * 0.985, HR[2] * 0.985), front=0.2, side=0.5, back=0.66), hairm, region='head')
locks = []
# coroa e costas: camadas caindo para trás e para baixo, nuca repicada
for i in range(16):
    phi = 1.15 + (TAU - 2.3) * i / 15
    back = abs(math.cos(phi)) if math.cos(phi) < 0 else 0
    locks.append(lock(phi * 0.6, 0.12, phi, 1.95 + 0.38 * back, 0.036, 1.0, 1.05 + 0.04 * back, drop=0.0, curl=0.012))
for i in range(11):
    phi = 2.0 + (TAU - 4.0) * i / 10
    locks.append(lock(phi, 0.9, phi + (i - 5) * 0.045, 2.55 + 0.12 * (i % 2), 0.034, 1.03, 1.02, curl=0.05))
# laterais: emolduram o rosto até o queixo, passando por cima da orelha
for s in (1, -1):
    for j, ph in enumerate((0.95, 1.2, 1.45)):
        locks.append(lock(s * (ph + 0.3), 0.55, s * (ph - 0.08), 2.0 + 0.05 * j, 0.032, 1.02, 1.07))
# FRANJA: nasce na risca do lado esquerdo e varre para a direita em mechas pontudas separadas; as mais compridas
# passam por cima do olho direito (x < 0), deixando ver um pouco dele entre as pontas
for i in range(13):
    t = i / 12
    phi0 = 0.8 - 1.0 * t
    th0 = 0.26 + 0.24 * t
    phi1 = 0.25 - 0.95 * t + 0.04 * math.sin(i * 2.3)
    th1 = 1.15 + 0.5 * math.sin(t * math.pi * 0.85) + 0.06 * ((i * 7) % 3 - 1)
    locks.append(lock(phi0, th0, phi1, th1, 0.021 + 0.006 * math.sin(t * math.pi), 1.03, 1.15, n=8))
# mechas curtas do lado esquerdo da testa (o olho esquerdo fica à mostra)
for i in range(4):
    locks.append(lock(0.85 + i * 0.13, 0.33, 0.5 + i * 0.14, 1.12 + 0.05 * (i % 2), 0.02, 1.03, 1.1))
# pontas soltas em volta do rosto (dos dois lados, na altura do queixo)
for s_ in (1, -1):
    for j in range(3):
        locks.append(lock(s_ * (1.05 + 0.16 * j), 0.9, s_ * (0.95 + 0.17 * j), 2.05 + 0.08 * j, 0.022, 1.05, 1.1, curl=0.02))
# mechas alternando o preto e um preto azulado mais claro: separa as pontas (o contorno sozinho virava um bloco)
hair_hi = material('hair_jae_hi', '#2c2834', 0.5)
b.add('hair_locks', merge(*locks[0::2]), hairm, region='head', subdiv=0)
b.add('hair_locks_hi', merge(*locks[1::2]), hair_hi, region='head', subdiv=0)
# brinco pequeno na orelha esquerda
b.add('earring', ellipsoid((0.132 * H, hc.y + 0.004, hc.z - 0.045 * H), (0.007, 0.007, 0.011), 6, 4), brass, region='head', subdiv=0)

# ---------------------------------------------------------------- CAPUZ CAÍDO (prop_hoodDown): embolado atrás do pescoço
# e caindo nas costas com a ponta
roll = []
for k in range(17):
    a = 1.15 + (TAU - 2.3) * k / 16
    roll.append(Vector((math.sin(a) * 0.105 * H, -math.cos(a) * 0.098 * H + 0.012 * H, top + (0.045 + 0.025 * max(0, -math.cos(a))) * H)))
b.add('prop_hoodDown_roll', rod(roll, [0.038 * H] * len(roll), 10), red, region='torso', subdiv=0)


def hood_drape(u, v, out=1.0):
    x = (u - 0.5) * 2
    w = 0.15 * H * (1 - v ** 1.5 * 0.94)
    z = top + 0.07 * H - v * 0.34 * H
    rx, ry = lerp_table(CAPE_PROF, (z - hz) / H)
    xx = x * w
    bulge = 0.022 * H * (1 - abs(x) ** 2) * math.sin(min(1.0, v * 1.3) * math.pi)
    yy = math.sqrt(max(0.0, 1 - (xx / (rx * H * 1.08)) ** 2)) * ry * H * 1.1 + 0.01 * H + bulge
    return Vector((xx, yy * out, z))


b.add('prop_hoodDown_drape', grid(hood_drape, 12, 14), red, region='torso', subdiv=0)
b.add('prop_hoodDown_in', grid(lambda u, v: hood_drape(u, v, 0.985), 12, 14, flip=True), red_in, region='torso', subdiv=0)
# a abertura do capuz dobrada (forro escuro aparecendo) logo abaixo do rolo, e a costura do meio até a ponta
lip = [hood_drape(k / 12, 0.04, 1.02) + Vector((0, 0, -0.01 * H)) for k in range(13)]
b.add('prop_hoodDown_lip', rod(lip, [0.012 * H] * 13, 6), red_in, region='torso', subdiv=0)
seam = [hood_drape(0.5, 0.1 + 0.88 * k / 10, 1.012) for k in range(11)]
b.add('prop_hoodDown_seam', rod(seam, [0.005 * H] * 11, 4), red_in, region='torso', subdiv=0)
b.group('prop_hoodDown')

# ---------------------------------------------------------------- CAPUZ POSTO (prop_hoodUp): forma X
HOOD_C = hc + Vector((0, 0.012 * H, 0.012 * H))
HOOD_R = (0.178 * H, 0.19 * H, 0.2 * H)
TH_END = 2.75


def hood_open(th):
    # meio-ângulo da abertura do rosto (fechado no alto, aberto da testa para baixo)
    return 0.85 * smoothstep(0.38, 0.8, th) - 0.25 * smoothstep(2.1, TH_END, th)


def hood_pt(phi, th, out=1.0):
    e = HOOD_C + Vector((math.sin(th) * math.sin(phi) * HOOD_R[0] * out, -math.sin(th) * math.cos(phi) * HOOD_R[1] * out, math.cos(th) * HOOD_R[2] * out))
    # ponta alta (como a arte: o capuz sobe em bico) e a borda da frente avançando sobre o rosto
    peak = max(0.0, 1 - th / 0.95)
    e += Vector((0, -0.02 * H * peak, 0.075 * H * peak * peak))
    front = max(0.0, math.cos(phi)) ** 2 * smoothstep(0.4, 1.1, th)
    e += Vector((0, -0.04 * H * front, 0))
    # embaixo: abre e desce por cima dos ombros
    t = smoothstep(1.85, TH_END, th)
    ring = Vector((math.sin(phi) * 0.25 * H * out, -math.cos(phi) * 0.18 * H * out + 0.02 * H, top + 0.02 * H))
    return e.lerp(ring, t)


def hood_param(u, v, out=1.0):
    th = v * TH_END
    op = hood_open(th)
    phi = op + (TAU - 2 * op) * u
    return hood_pt(phi, th, out)


def hood_w(p):
    t = smoothstep(sk['neck'].z + 0.02 * H, sk['hd'].z + 0.06 * H, p.z)
    return {'hd': t, 'neck': (1 - t) * 0.4, 'chest': (1 - t) * 0.6}


b.add('prop_hoodUp_shell', grid(hood_param, 44, 22), red, region='head', weight_fn=hood_w, subdiv=0)
b.add('prop_hoodUp_in', grid(lambda u, v: hood_param(u, v, 0.965), 44, 22, flip=True), red_in, region='head', weight_fn=hood_w, subdiv=0)
# borda da abertura (dobra do couro)
rim = [hood_pt(hood_open(th) if s > 0 else TAU - hood_open(th), th, 1.005) for s, th in
       [(1, 2.6 - 2.2 * k / 20) for k in range(21)] + [(-1, 0.4 + 2.2 * k / 20) for k in range(21)]]
b.add('prop_hoodUp_rim', rod(rim, [0.009 * H] * len(rim), 6), red, region='head', weight_fn=hood_w, subdiv=0)
# escuridão no lugar do rosto (na frente do rosto, recuada da borda) e o X vermelho brilhando nela
VC = hc + Vector((0, 0, -0.01 * H))
VR = (0.15 * H, 0.185 * H, 0.2 * H)


def void_pt(u, v):
    phi = (u - 0.5) * 2 * 1.05
    th = 0.55 + v * 1.75
    return VC + Vector((math.sin(th) * math.sin(phi) * VR[0], -math.sin(th) * math.cos(phi) * VR[1], math.cos(th) * VR[2]))


b.add('prop_hoodX_void', grid(void_pt, 16, 14), void, region='head', weight_fn=hood_w, subdiv=0)


def on_void(x, z, lift=0.004):
    dx, dz = x / VR[0], (z - VC.z) / VR[2]
    y = -math.sqrt(max(0.0, 1 - dx * dx - dz * dz)) * VR[1] - lift * H
    return Vector((x, VC.y + y, z))


strokes = []
for s in (1, -1):
    # pincelada: mais grossa no meio, com uma segunda risca fina ao lado
    for off, wmax in ((0.0, 0.013), (0.016, 0.0055)):
        pts, rad = [], []
        for k in range(9):
            t = k / 8
            x = s * (-0.085 + 0.17 * t) * H + off * H
            z = hc.z + (0.1 - 0.2 * t) * H - 0.005 * H
            pts.append(on_void(x, z))
            rad.append((wmax * math.sin(0.15 + t * 0.85 * math.pi) + 0.002) * H)
        strokes.append(rod(pts, rad, 5, flat=(lambda p: Vector((0, -1, 0)), 0.35)))
b.add('prop_hoodX_x', merge(*strokes), xglow, region='head', weight_fn=hood_w, subdiv=0)
# tira preta em X com rebites dourados no lado esquerdo do capuz (arte "X")
hx, hr = [], []
for (p0, p1) in (((0.95, 0.75), (1.45, 1.35)), ((1.45, 0.75), (0.95, 1.35))):
    pts = [hood_pt(p0[0] + (p1[0] - p0[0]) * k / 6, p0[1] + (p1[1] - p0[1]) * k / 6, 1.03) for k in range(7)]
    hx.append(rod(pts, [0.011 * H] * 7, 6, flat=(lambda p: (p - HOOD_C).normalized(), 0.35)))
    for pp in (p0, p1):
        hr.append(rivet(hood_pt(pp[0], pp[1], 1.06), 0.011 * H))
b.add('prop_hoodUp_strap', merge(*hx), dark, region='head', weight_fn=hood_w, subdiv=0)
b.add('prop_hoodUp_rivets', merge(*hr), brass, region='head', weight_fn=hood_w, subdiv=0)
b.group('prop_hoodUp')
b.group('prop_hoodX')

b.export(OUT)
