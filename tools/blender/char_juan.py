"""
JUAN (Henri) — public/models/juan.glb. Modelo v2, refeito do zero no padrão do Cristino.
Referências: Referencias visuais/Personagens/Juan Henri ("henri hexatombe", "juan normal", "pose ultimate", "juan forma
diabo") e a arte de Hexatombe (wiki). 1,65 m, magro e definido (o torso nu cheio de FRASES TATUADAS e cortes);
cabelo castanho LONGO preso num RABO alto, com a lateral esquerda RASPADA e a franja desfiada caindo sobre o olho
esquerdo — o olho PERDIDO, com o corte em cruz costurado com grampos de metal; a BOCA COSTURADA por grampos; barba por
fazer; ALARGADORES pretos nas orelhas. MANTO VERMELHO de pano rasgado, aberto na frente, caindo em tiras pontudas
(curto na frente, até a panturrilha atrás), com o capuz amontoado nas costas; a manga direita inteira e rasgada na
ponta, o braço esquerdo nu (só um trapo no ombro). CORRENTES: uma atravessando o peito na diagonal e outra enrolada no
braço esquerdo. Calça escura folgada, chaparreiras de couro por cima, um pano claro amarrado caindo do quadril;
descalço.
A Faca Predadora, o braço de sangue, o capuz erguido e o olho vermelho do Ódio do Diabo ficam em código
(src/models/props.js → addJuanProps): o rosto segue a cabeça padrão do Builder (o olho direito no mesmo lugar).

TÉCNICA (a do Cristino): corpo e roupas pelo Builder (pesos do esqueleto); o relevo dos músculos é esculpido NA malha do
tronco (relief: mantém o UV, então as tatuagens continuam); cabelo, capuz, calça e chaparreiras saem da escultura por
metaballs; manto e faixas como superfícies com espessura.
  node tools/blender/build.mjs juan   → public/models/juan.glb (+ tools/blender/fonte/juan.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'juan.glb'
random.seed(1313)

b = Builder(width=0.94, bulk=0.96, height=0.92)  # 1,65 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_juan', '#d8a888', 0.8),
    'face': material('face_juan', '#ffffff', 0.8),  # olho costurado, boca costurada (textura)
    'torso': material('skin_torso_juan', '#ffffff', 0.8),  # frases tatuadas e cortes (textura)
    'arm': material('arms_juan', '#ffffff', 0.8),
    'legs': material('pants_juan', '#2e2c2e', 0.9),
    'feet': material('skin_juan', '#d8a888', 0.8),
}
red = material('mantle_red', '#8a1a1e', 0.85)
red_dk = material('mantle_red_dark', '#5a0e12', 0.9)
chaps = material('chaps_juan', '#5a4c44', 0.85)
sash = material('sash_juan', '#b8a888', 0.9)
chainm = material('chain_juan', '#8a8a90', 0.35, metal=0.9)
staple = material('fine_staple_juan', '#c8c8d0', 0.3, metal=0.9)  # fine_: sem contorno no jogo
fringe_m = material('fine_hair_juan', '#5a3a22', 0.6)
hairm = material('hair_juan', '#5a3a22', 0.6)
hair_dk = material('hair_juan_dk', '#2a1a10', 0.7)
gauge = material('gauge_black', '#0e0e10', 0.4)

PREVIEW = {'face_juan': '#d8a888', 'skin_torso_juan': '#d0a082', 'arms_juan': '#d0a082'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

hc = b.body(M, [(-0.12, 0.158), (0.0, 0.16), (0.17, 0.142), (0.36, 0.178), (0.48, 0.196), (0.58, 0.108), (0.65, 0.064)],
            arm_r=(0.056, 0.046, 0.04), leg_r=(0.074, 0.058, 0.047), head_r=(0.134, 0.144, 0.156), feet='bare')


def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ o TRONCO definido (relevo esculpido na própria malha)
def torso_relief(p):
    x, y, z = p.x, p.y, p.z - hz
    if y > -0.02:  # costas: só a coluna e as escápulas
        return 0.004 * H * math.exp(-((abs(x) - 0.07 * H) / (0.04 * H)) ** 2) * math.exp(-((z - 0.5 * H) / (0.07 * H)) ** 2) - 0.003 * H * math.exp(-(x / (0.012 * H)) ** 2)
    ax = abs(x)
    d = 0.0
    # peitorais
    d += 0.012 * H * math.exp(-((ax - 0.075 * H) / (0.06 * H)) ** 2) * math.exp(-((z - 0.47 * H) / (0.05 * H)) ** 2)
    d -= 0.006 * H * math.exp(-((z - 0.415 * H) / (0.012 * H)) ** 2) * (ax < 0.13 * H)  # o vinco embaixo do peito
    # abdômen: seis gomos (sulco do meio e três horizontais)
    if 0.12 * H < z < 0.4 * H and ax < 0.07 * H:
        d += 0.006 * H
        d -= 0.006 * H * math.exp(-(x / (0.008 * H)) ** 2)
        for zk in (0.36, 0.28, 0.2):
            d -= 0.005 * H * math.exp(-((z - zk * H) / (0.008 * H)) ** 2)
    # serrátil e o V da cintura
    if 0.25 * H < z < 0.42 * H and 0.1 * H < ax < 0.16 * H:
        d += 0.003 * H * ridge(z / H * 90)
    d += 0.005 * H * math.exp(-((ax - 0.085 * H + (z - 0.08 * H) * 0.3) / (0.012 * H)) ** 2) * (0.0 < z < 0.16 * H)
    return d


relief(part('torso'), torso_relief)


def arm_relief(side):
    s_, e = sk['s' + side], sk['e' + side]

    def f(p):
        if p.z > s_.z or p.z < e.z - 0.02 * H:
            return 0.0
        t = (s_.z - p.z) / (s_.z - e.z)
        front = max(0.0, -(p.y - s_.y)) / (0.06 * H)
        return 0.008 * H * math.sin(t * math.pi) * min(1.0, front) + 0.005 * H * math.exp(-((t - 0.1) / 0.12) ** 2)  # bíceps e deltoide
    return f


for side in ('L', 'R'):
    relief(part('arm' + side), arm_relief(side))

# ================================================================ o MANTO vermelho rasgado
# (dz do quadril → meia-largura, meia-profundidade), de cima para baixo; o rasgo de baixo varia por coluna
MP = [(0.66, 0.11, 0.095), (0.62, 0.2, 0.145), (0.55, 0.218, 0.158), (0.42, 0.21, 0.152), (0.25, 0.198, 0.146),
      (0.08, 0.2, 0.15), (-0.1, 0.214, 0.16), (-0.3, 0.232, 0.172), (-0.5, 0.25, 0.185)]
COLS = 46
TEAR = [random.uniform(-1, 1) for _ in range(COLS + 1)]


def lerp_prof(v):
    f = v * (len(MP) - 1)
    i = min(len(MP) - 2, int(f))
    t = f - i
    return tuple(MP[i][k] + (MP[i + 1][k] - MP[i][k]) * t for k in range(3))


def mantle_rows():
    rows = []
    NR = 18
    for i in range(NR + 1):
        v = i / NR
        row = []
        for j in range(COLS + 1):
            u = j / COLS
            gap = 0.17 + 0.16 * v  # aberto na frente, abrindo mais embaixo
            a = gap + (TAU - 2 * gap) * u
            back = 0.5 - 0.5 * math.cos(a)  # 0 na frente, 1 atrás
            # o comprimento: curto na frente (coxa), comprido atrás (panturrilha), rasgado em tiras pontudas
            bottom = -0.08 - 0.5 * back ** 1.2 + 0.07 * TEAR[j] * (1 if j % 2 else 0.4)
            dz_top = MP[0][0]
            dz = dz_top + (bottom - dz_top) * v
            vv = (dz_top - dz) / (dz_top - MP[-1][0])
            dz_p, rx, ry = lerp_prof(max(0.0, min(1.0, vv)))
            fold = 1 + 0.035 * math.sin(a * 9 + v * 2.5) * min(1.0, v * 2)  # as dobras do pano caindo
            row.append(Vector((math.sin(a) * rx * fold * H, -math.cos(a) * ry * fold * H, hz + dz * H)))
        rows.append(row)
    return rows


def mantle_weights(p):
    # em cima segue o peito; embaixo balança com o quadril e as pernas (como o casaco do Builder)
    if p.z > hz + 0.08 * H:
        return auto_weights(sk, p, 'torso')
    side = 'L' if p.x > 0 else 'R'
    drop = smoothstep(hz + 0.08 * H, sk['kL'].z, p.z)
    return {'hips': 1 - drop * 0.4, 'l' + side: drop * 0.4}


b.add('mantle', shell_grid(mantle_rows(), 0.007 * H), red, region='skirt', weight_fn=mantle_weights, subdiv=0)

# o CAPUZ amontoado nas costas (escultura: o pano dobrado)
Hd = Sculpt()
hb = Vector((0, 0.1 * H, top + 0.03 * H))
Hd.ell(hb, (0.12 * H, 0.06 * H, 0.07 * H))
Hd.ell(hb + Vector((0, 0.025 * H, -0.06 * H)), (0.1 * H, 0.05 * H, 0.06 * H))
for s in (1, -1):
    Hd.ell(hb + Vector((s * 0.1 * H, -0.04 * H, 0.0)), (0.05 * H, 0.06 * H, 0.05 * H))
Hd.ell(hb + Vector((0, -0.04 * H, 0.0)), (0.08 * H, 0.05 * H, 0.06 * H), neg=True)
b.add('hood', Hd.mesh(res=0.008, smooth=3, disp=lambda p: 0.004 * H * (ridge(math.atan2(p.x, p.y) * 7 + p.z * 40 + n3(p, 20)) - 0.4), target=1400),
      red, region='chest', subdiv=0)

# a MANGA DIREITA inteira, larga e rasgada na ponta; o braço esquerdo nu, com um trapo no ombro
sR, eR, hR = sk['sR'], sk['eR'], sk['handR']
end = eR.lerp(hR, 0.72)
rings = limb_rings(sR + Vector((0, 0, 0.075 * H)), eR, 0.064 * H, 0.062 * H, n=4, bulge=0.06)[:-1]
rings += limb_rings(eR, end, 0.062 * H, 0.078 * H, n=3)
b.add('sleeveR', tube(rings, 14), red, region='armR')
frays = []
for k in range(9):
    a = k / 9 * TAU
    base = Vector((end.x + math.sin(a) * 0.077 * H, end.y + math.cos(a) * 0.077 * H, end.z + 0.004))
    frays.append(cone(tuple(base), tuple(base + Vector((math.sin(a) * 0.006, math.cos(a) * 0.006, -(0.03 + random.random() * 0.05) * H))), 0.016 * H, 3))
b.add('sleeveFray', merge(*frays), red, region='eR', subdiv=0)
sL = sk['sL']
# o trapo do ombro esquerdo: o pano rasgado caído em cima do ombro (escultura), com as tiras penduradas
Rg = Sculpt()
Rg.ell(sL + Vector((0.01 * H, 0.0, 0.035 * H)), (0.075 * H, 0.078 * H, 0.06 * H))
Rg.ell(sL + Vector((0.025 * H, 0.0, -0.03 * H)), (0.066 * H, 0.07 * H, 0.05 * H))
b.add('sleeveL_rag', Rg.mesh(res=0.007, smooth=3, disp=lambda q: 0.003 * H * (ridge(q.z * 120 + n3(q, 25)) - 0.4), target=600), red_dk, region='sL', subdiv=0)
rr = []
p = sL + Vector((0.025 * H, 0, -0.06 * H))
for k in range(9):
    a = k / 9 * TAU + 0.3
    base = Vector((p.x + math.sin(a) * 0.06 * H, p.y + math.cos(a) * 0.06 * H, p.z))
    rr.append(cone(tuple(base), tuple(base + Vector((0, 0, -(0.03 + random.random() * 0.07) * H))), 0.012 * H, 3))
b.add('sleeveL_fray', merge(*rr), red_dk, region='armL', subdiv=0)


# ================================================================ CORRENTES de verdade (elos alternados)
cz = hz + 0.36 * H
diag = []
for i in range(40):
    a = i / 40 * TAU
    x = math.sin(a) * 0.182 * H
    y = -math.cos(a) * 0.118 * H
    diag.append((x, y, cz - 0.17 * H * (x / (0.182 * H))))  # do ombro direito (x < 0) desce até o quadril esquerdo
b.add('chainChest', chain_mesh(diag, closed=True), chainm, region='torso', subdiv=0)
eL = sk['eL']
coil = []
for i in range(34):  # duas voltas no braço esquerdo, da metade do braço até o cotovelo
    t = i / 33
    a = t * 2 * TAU
    c = sL.lerp(eL, 0.45 + 0.55 * t)
    coil.append((c.x + math.sin(a) * 0.06 * H, c.y - math.cos(a) * 0.06 * H, c.z))
b.add('chainArm', chain_mesh(coil), chainm, region='armL', subdiv=0)

# ================================================================ CINTURA E PERNAS: calça folgada, chaparreiras, o pano
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.06 * H)), l.lerp(k, 0.5), k + Vector((0, -0.004 * H, 0)), k.lerp(f, 0.55), f + Vector((0, 0, 0.09 * H))],
            [0.09 * H, 0.084 * H, 0.074 * H, 0.068 * H, 0.062 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2: 0.004 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 6 + p.z * 22 + n3(p, 18)) - 0.35)
    b.add('pants' + side, P.mesh(res=0.01, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    # chaparreira: o couro por cima da frente e do lado de fora da coxa, até o joelho
    C = Sculpt()
    s = 1 if side == 'L' else -1
    C.chain([l + Vector((s * 0.012 * H, -0.01 * H, 0.03 * H)), l.lerp(k, 0.5) + Vector((s * 0.012 * H, -0.012 * H, 0)), k + Vector((s * 0.01 * H, -0.01 * H, 0.03 * H))],
            [0.094 * H, 0.088 * H, 0.078 * H], step=0.5)
    C.ell(l.lerp(k, 0.5) + Vector((-s * 0.045 * H, 0.05 * H, 0)), (0.08 * H, 0.08 * H, 0.32 * H), neg=True)  # aberta por trás e por dentro
    b.add('chap' + side, C.mesh(res=0.009, smooth=3, disp=lambda p: 0.002 * H * n3(p, 30), target=700), chaps, region='leg' + side, subdiv=0)
b.add('waistband', rod([(math.sin(a) * 0.166 * H, -math.cos(a) * 0.122 * H, hz + 0.06 * H) for a in [i / 24 * TAU for i in range(25)]], 0.02 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)),
      chaps, region='torso', subdiv=0)
# o pano claro amarrado na cintura, caindo do quadril esquerdo
sash_rows = []
for i in range(9):
    v = i / 8
    row = []
    for j in range(5):
        u = j / 4 - 0.5
        a = 1.15 + u * 0.5
        rad = (0.172 + 0.02 * v) * H
        row.append(Vector((math.sin(a) * rad, -math.cos(a) * rad * 0.74 - 0.01 * H * math.sin(v * 5), hz + (0.06 - 0.3 * v - 0.04 * abs(u) * v) * H)))
    sash_rows.append(row)
b.add('sash', shell_grid(sash_rows, 0.006 * H), sash, region='skirt', weight_fn=mantle_weights, subdiv=0)

# ================================================================ CABELO: rabo alto, franja sobre o olho perdido, lateral raspada
HC = Vector((hc.x, hc.y + 0.006, hc.z + 0.014))
Hr = Sculpt()
Hr.ell(HC + Vector((-0.006 * H, 0.012 * H, 0.03 * H)), (0.146 * H, 0.16 * H, 0.158 * H))  # a massa cobrindo o alto da cabeça
Hr.ell(HC + Vector((-0.02 * H, 0.06 * H, -0.03 * H)), (0.13 * H, 0.11 * H, 0.12 * H))  # a nuca
Hr.ell(HC + Vector((-0.03 * H, -0.05 * H, 0.11 * H)), (0.11 * H, 0.08 * H, 0.06 * H))  # o volume da frente, penteado para trás
Hr.ell(HC + Vector((0.12 * H, 0.02 * H, -0.05 * H)), (0.05 * H, 0.12 * H, 0.09 * H), neg=True)  # a lateral ESQUERDA raspada (baixa)
Hr.ell(HC + Vector((0, -0.11 * H, -0.06 * H)), (0.13 * H, 0.08 * H, 0.15 * H), neg=True)  # o rosto livre
tie = HC + Vector((0, 0.11 * H, 0.1 * H))
Hr.chain([tie, tie + Vector((0, 0.045 * H, -0.04 * H)), tie + Vector((0.005 * H, 0.07 * H, -0.14 * H)), tie + Vector((0, 0.065 * H, -0.27 * H))],
         [0.036 * H, 0.034 * H, 0.026 * H, 0.012 * H], step=0.5)  # o RABO alto
Hr.chain([HC + Vector((-0.13 * H, -0.01 * H, 0.0)), HC + Vector((-0.15 * H, 0.0, -0.12 * H)), HC + Vector((-0.14 * H, 0.03 * H, -0.24 * H))],
         [0.03 * H, 0.026 * H, 0.012 * H], step=0.5)  # a mecha da têmpora direita caindo até o ombro


def hair_flow(p):
    a = math.atan2(p.x - HC.x, p.z - HC.z)
    return 0.004 * H * (ridge(a * 22 + n3(p, 16) * 1.4, 2) - 0.4)


b.add('hair', Hr.mesh(res=0.008, smooth=3, disp=hair_flow, target=2200), hairm, region='head', subdiv=0)
# a franja desfiada caindo sobre o olho esquerdo (x > 0): mechas achatadas
fr = []
for j, (g, ln) in enumerate(((0.0, 0.1), (0.022, 0.15), (0.042, 0.17), (0.06, 0.13), (-0.024, 0.08))):
    p0 = HC + Vector((g * H, -0.135 * H, 0.105 * H))
    tip = p0 + Vector((0.035 * H, -0.03 * H, -ln * H))
    mid = p0.lerp(tip, 0.45) + Vector((0.012 * H, -0.03 * H, 0.0))
    fr.append(rod([p0, mid, tip], [0.011 * H, 0.009 * H, 0.0015 * H], 5, flat=(lambda q: q - HC, 0.5)))
b.add('fringe', merge(*fr), fringe_m, region='head', subdiv=0)
b.add('hair_tie', rod([tie + Vector((0, -0.01 * H, 0.012 * H)), tie + Vector((0, 0.01 * H, -0.012 * H))], 0.04 * H, 10), red_dk, region='head', subdiv=0)
# a lateral raspada: cabelo bem curto e escuro rente ao crânio (atrás da orelha esquerda)
Sv = Sculpt()
Sv.ell(HC + Vector((0.115 * H, 0.04 * H, 0.0)), (0.035 * H, 0.1 * H, 0.09 * H))
Sv.ell(HC, (0.132 * H, 0.142 * H, 0.152 * H), neg=True)
b.add('undercut', Sv.mesh(res=0.006, smooth=2, target=500), hair_dk, region='head', subdiv=0)
# alargadores pretos nas orelhas
gg = []
for s in (1, -1):
    c = Vector((s * (0.136 * H + 0.006), hc.y + 0.01, hc.z - 0.035))
    gg.append(rod([c + Vector((0.0, math.sin(a) * 0.014, math.cos(a) * 0.014)) for a in [i / 12 * TAU for i in range(13)]], 0.005, 5, caps=False))
b.add('gauges', merge(*gg), gauge, region='head', subdiv=0)

# ================================================================ a BOCA e o OLHO costurados: grampos de metal em relevo
st = []
fy = hc.y - 0.141 * H  # a frente do rosto na altura da boca
mz = hc.z - 0.076 * H
for k in range(-3, 4):
    x = k * 0.0105 * H
    yy = fy + 0.0045 * H * (k / 3) ** 2
    st.append(rod([(x, yy - 0.002, mz + 0.013 * H), (x + 0.001, yy - 0.004, mz), (x + 0.002, yy - 0.002, mz - 0.013 * H)], 0.0018, 4))
ex, ez = 0.047 * H, hc.z + 0.006 * H  # o olho esquerdo perdido
for k in range(5):
    z = ez + 0.024 * H - k * 0.012 * H
    st.append(rod([(ex - 0.012 * H, hc.y - 0.137 * H, z), (ex, hc.y - 0.14 * H, z + 0.002), (ex + 0.012 * H, hc.y - 0.135 * H, z + 0.004)], 0.0016, 4))
b.add('staples', merge(*st), staple, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'juan.blend'), check_existing=False)
