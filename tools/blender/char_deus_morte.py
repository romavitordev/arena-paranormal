"""
O DEUS DA MORTE (Relíquia de Morte no corpo do Ferreiro) — public/models/deus_morte.glb
Referências: arte do Livro de Regras, cinemática, Toca dos Monstros e a HQ (wiki / enviadas pelo usuário).
O DOBRO do tamanho do Miguel (~3,9 m) e com silhueta de GORILA:
  - trapézio e ombros gigantes formando uma corcunda que sobe ACIMA da cabeça; cintura mais estreita;
  - braços enormes e compridos (punhos quase nos joelhos), pernas grossas, pés grandes descalços;
  - o corpo todo é de TENDÕES de Lodo preto/cinza (cordas fibrosas), com fios de Lodo ondulando nos ombros/costas;
  - CRÂNIO pequeno, baixo e à frente, saindo de um capuz de Lodo; faixa preta vertical no osso e a longa barba
    branca do Ferreiro;
  - ESPIRAL de tendões no peito, que brilha em vermelho;
  - braceletes grossos de metal nos pulsos e tornozelos, CORRENTES enroladas na cintura e nas coxas e penduradas
    dos braceletes.
Todas as medidas são frações da altura H (o construtor não escala as espessuras sozinho).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'deus_morte.glb'
b = Builder(width=1.25, bulk=1.45, height=2.17)  # ~3,9 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

lodo = material('lodo_tendon', '#ffffff', 0.75)  # tendões (textura)
M = {
    'skin': lodo,
    'face': material('face_skull', '#ffffff', 0.6),
    'torso': material('lodo_chest', '#ffffff', 0.75),  # espiral que brilha
    'arm': lodo,
    'legs': lodo,
    'feet': lodo,
}
steel = material('band_steel', '#7a7a80', 0.35, metal=0.85)
chainm = material('chain_iron', '#5a5a62', 0.4, metal=0.9)
white = material('beard_white', '#e2e0d8', 0.7)
bone = material('face_skull', '#ffffff', 0.6)

# tronco em V: cintura média, peito largo, ombros enormes (frações de H)
b.body(M, [(-0.12, 0.17), (0.0, 0.17), (0.12, 0.165), (0.26, 0.21), (0.38, 0.27), (0.48, 0.3), (0.56, 0.24), (0.62, 0.14)],
       arm_r=(0.115 * H, 0.098 * H, 0.084 * H), leg_r=(0.112 * H, 0.084 * H, 0.068 * H), neck_r=0.1, feet='bare', head=False)

# ---------------- corcunda: trapézio enorme que sobe acima da cabeça, por trás
b.add('hump', ellipsoid((0, 0.06 * H, 1.62 * H), (0.29 * H, 0.18 * H, 0.21 * H), 20, 14), lodo, region='chest')
for s in (1, -1):
    # deltoides grandes arredondados
    sh = sk['sL'] if s > 0 else sk['sR']
    b.add(f'delt{s}', ellipsoid((sh.x * 1.02, sh.y, sh.z - 0.02 * H), (0.13 * H, 0.13 * H, 0.12 * H), 16, 12), lodo, region='s' + ('L' if s > 0 else 'R'))
# peitorais salientes
b.add('pecs', ellipsoid((0, -0.11 * H, hz + 0.44 * H), (0.24 * H, 0.1 * H, 0.11 * H), 18, 12, theta_max=math.pi * 0.75), M['torso'], region='chest')

# ---------------- crânio baixo e à frente, saindo de um capuz de Lodo + barba branca longa
hd = sk['hd']
skull_drop = Vector((0, -0.1 * H, -0.18 * H))  # mais baixo e à frente que uma cabeça normal
skull = xform(head_part(sk, radii=(0.082, 0.09, 0.1)), lambda p: p + skull_drop)
b.add('skull', skull, bone, region='head', subdiv=0)
hc = head_center(sk) + skull_drop
b.add('hood', hair_cap((hc.x, hc.y + 0.02 * H, hc.z + 0.02 * H), (0.11 * H, 0.12 * H, 0.13 * H), front=0.16, side=0.55, back=0.75), lodo, region='head', subdiv=0)
random.seed(8)
beard = []
for i in range(11):
    x = (i - 5) * 0.012 * H
    root = Vector((x, hc.y - 0.085 * H, hc.z - 0.085 * H))
    ln = (0.2 - abs(i - 5) * 0.012) * H
    pts = []
    for k in range(6):
        t = k / 5
        p = root + Vector((x * 0.25 * t + math.sin(t * 6 + i) * 0.006 * H, -0.03 * H * t, -ln * t))
        pts.append((p.x, p.y, p.z, 0.012 * H * (1 - 0.6 * t) + 0.004, 0.008 * H * (1 - 0.6 * t) + 0.004))
    beard.append(tube(pts, 6))
b.add('beard', merge(*beard), white, region='head', subdiv=0)

# ---------------- antebraços longos e punhos enormes (quase nos joelhos)
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    low = h + Vector((0, 0, -0.1 * H))
    b.add('forearm_ext' + side, tube(limb_rings(e.lerp(h, 0.6), low, 0.092 * H, 0.086 * H, n=3), 14), lodo, region='hand' + side, subdiv=0)
    b.add('fist' + side, ellipsoid((low.x, low.y - 0.01 * H, low.z - 0.04 * H), (0.085 * H, 0.08 * H, 0.09 * H), 14, 10), lodo, region='hand' + side, subdiv=0)
    # bracelete grosso no pulso + corrente pendurada
    b.add('cuff' + side, tube(limb_rings(e.lerp(h, 0.82), e.lerp(h, 1.0), 0.1 * H, 0.1 * H, n=1), 18), steel, region='e' + side, subdiv=0)
    # tornozelo
    k, f = sk['k' + side], sk['foot' + side]
    b.add('anklecuff' + side, tube(limb_rings(k.lerp(f, 0.8), k.lerp(f, 0.93), 0.078 * H, 0.078 * H, n=1), 18), steel, region='k' + side, subdiv=0)


# ---------------- correntes de ELOS de verdade
def link(c, d, up, L, w, rw):
    """Um elo oval: centro c, direção d (ao longo da corrente), up = normal do plano do elo."""
    d = d.normalized()
    side = d.cross(up).normalized()
    pts = []
    n = 10
    for i in range(n + 1):
        a = i / n * TAU
        p = c + d * (math.cos(a) * L * 0.5) + side * (math.sin(a) * w * 0.5)
        pts.append((p.x, p.y, p.z, rw, rw))
    return tube(pts, 5, cap_start=False, cap_end=False)


def chain_path(path, L, w, rw):
    """Elos ao longo de uma polilinha, alternando o plano de cada elo (90°)."""
    out = []
    k = 0
    for i in range(len(path) - 1):
        a, bb = Vector(path[i]), Vector(path[i + 1])
        seg = bb - a
        n = max(1, int(seg.length / (L * 0.8)))
        d = seg.normalized()
        ref = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))
        up0 = d.cross(ref).normalized()
        for j in range(n):
            c = a + seg * ((j + 0.5) / n)
            up = up0 if k % 2 == 0 else d.cross(up0).normalized()
            out.append(link(c, d, up, L, w, rw))
            k += 1
    return out


L_, W_, R_ = 0.04 * H, 0.026 * H, 0.0055 * H
links = []
# duas voltas na cintura (em espiral) + uma descendo pela coxa direita
for turn in range(2):
    path = []
    for i in range(25):
        a = i / 24 * TAU
        z = hz + (0.12 - turn * 0.07) * H - i / 24 * 0.05 * H
        path.append((math.sin(a) * 0.205 * H, -math.cos(a) * 0.16 * H, z))
    links += chain_path(path, L_, W_, R_)
lR, kR = sk['lR'], sk['kR']
thigh = []
for i in range(13):
    t = i / 12
    a = t * TAU * 1.5
    c = lR.lerp(kR, 0.1 + t * 0.7)
    thigh.append((c.x + math.sin(a) * 0.1 * H, c.y - math.cos(a) * 0.1 * H, c.z))
thigh_links = chain_path(thigh, L_, W_, R_)
b.add('chains_waist', merge(*links), chainm, region='torso', subdiv=0)
b.add('chains_thigh', merge(*thigh_links), chainm, region='lR', subdiv=0)
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    top = e.lerp(h, 0.9) + Vector((0.05 * H if side == 'L' else -0.05 * H, 0, -0.02 * H))
    hang = chain_path([tuple(top), tuple(top + Vector((0, 0.02 * H, -0.22 * H)))], L_, W_, R_)
    b.add('chains_hang' + side, merge(*hang), chainm, region='e' + side, subdiv=0)

# ---------------- fios de Lodo ondulando nos ombros, costas e braços (como chamas pretas)
random.seed(21)
wisps_t, wisps_l, wisps_r = [], [], []
for i in range(26):
    zone = i % 3
    if zone == 0:  # corcunda/costas
        a = random.uniform(-1.3, 1.3)
        base = Vector((math.sin(a) * 0.24 * H, 0.08 * H + math.cos(a) * 0.08 * H, 1.58 * H + random.uniform(-0.05, 0.12) * H))
        dirv = Vector((math.sin(a) * 0.4, 0.5, 1)).normalized()
        dest = wisps_t
    else:  # ombros / braços
        side = 'L' if zone == 1 else 'R'
        s, e = sk['s' + side], sk['e' + side]
        base = s.lerp(e, random.uniform(0, 0.6)) + Vector(((0.1 if side == 'L' else -0.1) * H, random.uniform(-0.05, 0.08) * H, 0.04 * H))
        dirv = Vector(((0.7 if side == 'L' else -0.7), 0.3, 0.8)).normalized()
        dest = wisps_l if side == 'L' else wisps_r
    ln = random.uniform(0.1, 0.2) * H
    pts = []
    for k in range(6):
        t = k / 5
        wig = Vector((math.sin(t * 7 + i) * 0.02 * H, math.cos(t * 6 + i) * 0.02 * H, 0))
        p = base + dirv * (ln * t) + wig
        r = 0.016 * H * (1 - 0.85 * t) + 0.002
        pts.append((p.x, p.y, p.z, r, r))
    dest.append(tube(pts, 5))
b.add('wisps_back', merge(*wisps_t), lodo, region='chest', subdiv=0)
b.add('wisps_L', merge(*wisps_l), lodo, region='sL', subdiv=0)
b.add('wisps_R', merge(*wisps_r), lodo, region='sR', subdiv=0)

b.export(OUT)
