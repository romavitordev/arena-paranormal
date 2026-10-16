"""
O DEUS DA MORTE (a Relíquia de Morte no corpo do Ferreiro) — public/models/deus_morte.glb. Modelo v2, refeito do zero
no padrão do Cristino / do Carniçal.
Referências: wiki "O Deus da Morte" (arte do Livro de Regras, lineart, miniatura e cena de O Segredo na Floresta,
Calamidade). Wiki: "uma enorme figura humanoide, com um porte físico extremamente forte. Seu corpo é completamente
formado por Lodo, com TENDÕES que simulam a anatomia muscular humana, e no seu peito os tendões se retorcem em uma
ESPIRAL. O rosto foi arrancado, ficou só o CRÂNIO; mantém a longa BARBA BRANCA do Ferreiro e as faixas dele, agora
estampadas no crânio; BRACELETES de metal nos pulsos e tornozelos e CORRENTES presas à cintura."
Silhueta (arte do Livro de Regras): o TRAPÉZIO gigante sobe como uma corcunda ACIMA do crânio, que fica pequeno, baixo
e à frente, saindo de um capuz de Lodo; ombros e braços enormes, punhos grandes, cintura mais estreita, pernas
grossas e pés grandes descalços; tudo ESTRIADO. Miniatura: a espiral do peito e as rachaduras brilham VERMELHO e fios
de Lodo sobem dos ombros como chamas pretas. ~3,9 m (o dobro do Ferreiro).

TÉCNICA: cada parte (tronco com a corcunda, braços, pernas, capuz, barba) é UMA forma orgânica de metaballs fundidos
(sculpt_lib), com as ESTRIAS dos tendões e a ESPIRAL do peito esculpidas por deslocamento e a cor por vértice (Lodo
escuro nos sulcos, cinza nas cristas, vermelho na espiral); as partes ficam separadas para dobrar bem nas juntas e
ganham os pesos do esqueleto do Builder. O crânio usa a cabeça do Builder (a textura face_skull com a faixa preta).
  node tools/blender/build.mjs deus_morte   → public/models/deus_morte.glb (+ tools/blender/fonte/deus_morte.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, chain_mesh, vcol_material, paint
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'deus_morte.glb'
random.seed(66)

b = Builder(width=1.25, bulk=1.45, height=2.17)  # ~3,9 m — o mesmo esqueleto de antes (as cenas e a câmera contam com ele)
sk = b.sk
H = sk.h
hz = sk['hips'].z

lodo = vcol_material('lodo_god')  # o corpo: Lodo + cristas dos tendões + a espiral, pela cor por vértice
wisp = material('lodo_wisp', '#141216', 0.6)
bone = material('face_skull', '#ffffff', 0.6)  # o crânio com a faixa preta (textura)
white = material('beard_white', '#e2e0d8', 0.7)
steel = material('band_steel', '#7a7a80', 0.35, metal=0.85)
chainm = material('chain_iron', '#5a5a62', 0.4, metal=0.9)
glow = material('glow_spiral_dm', '#ff2a1a', 0.3, emission='#ff2a1a', strength=2.5)  # a espiral do peito brilhando
bone['preview'] = '#d8d0bc'

C = {k: Vector(hex_rgb(v)) for k, v in {'lodo': '#141217', 'crest': '#2c2930', 'ember': '#6a120e'}.items()}
AMP = 0.0055 * H  # profundidade das estrias


def V(x, y, z):
    return Vector((x * H, y * H, z * H))


def lim(t):
    return max(0.0, min(1.0, t))


def fibers(a, b_, n, twist, amp=AMP):
    """estrias de um membro: n tendões em volta do eixo a→b, torcendo `twist` rad"""
    a, b_ = Vector(a), Vector(b_)
    ax = b_ - a
    L = ax.length
    ax = ax / L

    def f(p):
        t = lim((p - a).dot(ax) / L)
        q = p - (a + ax * t * L)
        th = math.atan2(q.x, q.y)
        k = 0.55 + 0.45 * (n3(p, 1.1) * 0.5 + 0.5)  # o tendão engrossa e afina ao longo do músculo
        return amp * k * (ridge(n * th + twist * t + n3(p, 1.8) * 1.6, 2) - 0.35)
    return f


def shade_by(fn, amp=AMP, extra=None):
    """cor por vértice: sulco escuro, crista cinza (e o vermelho onde `extra` disser)"""
    def f(p):
        k = lim(fn(p) / amp + 0.35) ** 1.5
        c = C['lodo'].lerp(C['crest'], k * 0.7)
        if extra:
            e = extra(p)
            if e > 0:
                c = c.lerp(C['ember'], min(1.0, e))
        return c
    return f


def weights(region):
    return lambda p: auto_weights(sk, p, region)


def add_sculpt(name, S, fn, target, region, res=0.024, smooth=3, extra=None):
    o = b.add(name, S.mesh(res=res, smooth=smooth, disp=fn, target=target), lodo, region='body', weight_fn=weights(region), subdiv=0)
    paint(o, shade_by(fn, extra=extra))
    return o


# ================================================================ TRONCO + a CORCUNDA do trapézio
T = Sculpt()
T.ell(V(0, 0, 0.92), (0.2 * H, 0.15 * H, 0.12 * H))  # pelve
T.ell(V(0, 0, 1.07), (0.185 * H, 0.14 * H, 0.12 * H))  # cintura (mais estreita)
T.ell(V(0, 0.0, 1.22), (0.26 * H, 0.17 * H, 0.13 * H))  # costelas baixas
T.ell(V(0, -0.01, 1.38), (0.33 * H, 0.2 * H, 0.15 * H))  # o peito enorme
T.ell(V(0, 0.05, 1.6), (0.28 * H, 0.17 * H, 0.2 * H))  # a CORCUNDA: o trapézio subindo acima do crânio
T.ell(V(0, -0.03, 1.53), (0.13 * H, 0.12 * H, 0.1 * H))  # a base do pescoço
for s in (1, -1):
    T.ell(V(s * 0.15, -0.12, 1.41), (0.15 * H, 0.08 * H, 0.1 * H))  # peitorais
    T.ell(V(s * 0.27, 0.03, 1.54), (0.16 * H, 0.14 * H, 0.13 * H), dir=(s * 1, 0, -0.35))  # trapézio descendo ao ombro
    T.ell(V(s * 0.27, 0.06, 1.26), (0.08 * H, 0.12 * H, 0.2 * H), dir=(s * 0.3, 0, 1))  # grande dorsal
    T.ell(V(s * 0.14, -0.06, 1.06), (0.06 * H, 0.06 * H, 0.15 * H), dir=(s * 0.25, -0.1, 1))  # oblíquos
    T.ell(V(s * 0.1, 0.07, 0.88), (0.11 * H, 0.09 * H, 0.1 * H))  # glúteos
    for k in range(3):
        T.ell(V(s * 0.06, -0.12, 1.28 - k * 0.085), (0.06 * H, 0.05 * H, 0.045 * H))  # o abdômen em gomos
SPC = V(0, -0.205, 1.36)  # o centro da espiral do peito


def spiral_v(p):
    """o quanto p está numa das quatro voltas da espiral de tendões do peito (0..1)"""
    if p.y > -0.12 * H:
        return 0.0
    dx, dz = p.x - SPC.x, p.z - SPC.z
    rho = math.hypot(dx, dz)
    if rho > 0.17 * H:
        return 0.0
    th = math.atan2(dz, dx)
    return ridge(4 * th + rho / (0.014 * H), 2) * (1 - rho / (0.17 * H))


def torso_fn(p):
    ax = abs(p.x)
    z = p.z / H
    w = n3(p, 2.4) * 0.8
    sv = spiral_v(p)
    if sv > 0:
        return AMP * 1.4 * (sv - 0.3)
    if p.y < -0.06 * H and z > 1.32 and ax < 0.32 * H:  # peitorais: leque do esterno ao ombro
        v = ridge(math.atan2(p.z - 1.55 * H, ax + 0.02 * H) * 26 + w)
    elif p.y < -0.06 * H and 0.98 < z <= 1.32 and ax < 0.12 * H:  # abdômen: gomos
        g = min(abs(z - zk) for zk in (1.325, 1.24, 1.155, 1.07))
        v = 0.9 - math.exp(-(g / 0.012) ** 2) - math.exp(-(ax / (0.012 * H)) ** 2) * 0.9
        return AMP * 1.3 * (v - 0.35)
    elif z > 1.5:  # a corcunda: tendões subindo para o pescoço
        v = ridge(math.atan2(p.x, p.y + 0.3 * H) * 30 + w)
    else:  # flancos e costas: diagonais subindo para os ombros
        v = ridge((p.z + ax * (0.8 if p.y < 0 else -0.6)) / H * 80 + w)
    return AMP * (v - 0.35)


add_sculpt('torso', T, torso_fn, 9000, 'torso', extra=lambda p: spiral_v(p) * 1.2 - 0.15)

# a ESPIRAL acesa (tendões que brilham vermelho, por cima do peito)
sp = []
for arm in range(4):
    pts = []
    for i in range(22):
        t = i / 21
        rho = (0.02 + t * 0.14) * H
        th = arm * math.pi / 2 - rho / (0.014 * H) / 4
        pts.append(Vector((SPC.x + math.cos(th) * rho, SPC.y - 0.012 * H * (1 - t) - 0.004 * H, SPC.z + math.sin(th) * rho)))
    sp.append(rod(pts, [0.009 * H * (1 - 0.6 * k / 21) for k in range(22)], 5))
b.add('spiral', merge(*sp), glow, region='body', weight_fn=weights('chest'), subdiv=0)


# ================================================================ BRAÇOS enormes e os PUNHOS
def arm(side):
    s = 1 if side == 'L' else -1
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    A = Sculpt()
    A.ell(sh + V(s * 0.015, 0, 0.0), (0.16 * H, 0.15 * H, 0.15 * H))  # deltoide
    A.chain([sh + V(0, 0, 0.02), sh.lerp(e, 0.5), e + V(0, 0, 0.02)], [0.105 * H, 0.09 * H, 0.075 * H], step=0.5)
    A.ell(sh.lerp(e, 0.5) + V(0, -0.06, 0.0), (0.1 * H, 0.09 * H, 0.14 * H))  # bíceps
    A.ell(sh.lerp(e, 0.45) + V(s * 0.01, 0.06, 0.0), (0.1 * H, 0.09 * H, 0.15 * H))  # tríceps
    A.chain([e, e.lerp(h, 0.5), h + V(0, 0, 0.03)], [0.08 * H, 0.075 * H, 0.06 * H], step=0.5)
    A.ell(e.lerp(h, 0.3) + V(s * 0.01, -0.02, 0.0), (0.11 * H, 0.1 * H, 0.13 * H))  # antebraço (grosso perto do cotovelo)
    fist = h + V(0, -0.02, -0.06)
    A.ell(fist, (0.095 * H, 0.1 * H, 0.1 * H))  # o PUNHO fechado
    A.chain([fist + V(-s * 0.02, -0.08, -0.04), fist + V(s * 0.03, -0.08, -0.04)], [0.045 * H, 0.045 * H], step=0.6)  # os nós dos dedos
    A.ell(fist + V(-s * 0.06, -0.07, 0.01), (0.04 * H, 0.04 * H, 0.05 * H))  # o polegar
    f_up = fibers(sh + V(0, 0, 0.1), e, 10, 1.6 * s)
    f_lo = fibers(e, h, 9, -1.4 * s)
    fn = lambda p: f_up(p) if p.z > e.z else (f_lo(p) if p.z > h.z + 0.02 * H else AMP * 0.4 * (ridge(p.x / H * 160) - 0.35))
    add_sculpt('arm' + side, A, fn, 4200, 'arm' + side)
    # BRACELETE grosso de metal no pulso, com os rebites
    b.add('cuff' + side, tube(limb_rings(e.lerp(h, 0.72), e.lerp(h, 0.98), 0.118 * H, 0.118 * H, n=1), 20), steel, region='e' + side, subdiv=0)
    rv = []
    for k in range(10):
        a = k / 10 * TAU
        c = e.lerp(h, 0.85)
        rv.append(ellipsoid((c.x + math.sin(a) * 0.122 * H, c.y - math.cos(a) * 0.122 * H, c.z), (0.012 * H, 0.012 * H, 0.012 * H), 6, 4))
    b.add('rivets' + side, merge(*rv), steel, region='e' + side, subdiv=0)
    # a corrente pendurada do bracelete
    top = e.lerp(h, 0.92) + V(s * 0.1, 0.0, -0.01)
    b.add('chainHang' + side, chain_mesh([top, top + V(0.0, 0.02, -0.12), top + V(-s * 0.01, 0.03, -0.24)], link=0.05 * H, r=0.006 * H), chainm, region='e' + side, subdiv=0)


arm('L')
arm('R')


# ================================================================ PERNAS grossas e os PÉS grandes descalços
def leg(side):
    s = 1 if side == 'L' else -1
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    Lg = Sculpt()
    Lg.chain([l + V(0, 0, 0.06), l.lerp(k, 0.5), k + V(0, 0, 0.02)], [0.125 * H, 0.1 * H, 0.075 * H], step=0.5)
    Lg.ell(l.lerp(k, 0.4) + V(s * 0.015, -0.05, 0), (0.11 * H, 0.09 * H, 0.19 * H))  # quadríceps
    Lg.ell(l.lerp(k, 0.5) + V(0, 0.05, 0), (0.1 * H, 0.09 * H, 0.18 * H))  # posterior
    Lg.chain([k, k.lerp(f, 0.5), f + V(0, 0, 0.07)], [0.075 * H, 0.065 * H, 0.05 * H], step=0.5)
    Lg.ell(k.lerp(f, 0.3) + V(0, 0.04, 0), (0.085 * H, 0.075 * H, 0.12 * H))  # panturrilha
    Lg.ell(f + V(0, -0.06, 0.005), (0.075 * H, 0.15 * H, 0.045 * H))  # o pé
    Lg.ell(f + V(0, 0.04, 0.02), (0.06 * H, 0.06 * H, 0.05 * H))  # o calcanhar
    for i in range(4):  # os dedos
        Lg.ell(f + V(s * (0.035 - i * 0.022), -0.19, 0.0), (0.02 * H, 0.03 * H, 0.022 * H))
    f_th = fibers(l + V(0, 0, 0.06), k, 11, 1.8 * s)
    f_sh = fibers(k, f + V(0, 0, 0.07), 9, -1.4 * s)
    fn = lambda p: f_th(p) if p.z > k.z else (f_sh(p) if p.z > f.z + 0.08 * H else AMP * 0.3 * (ridge(p.y / H * 120) - 0.35))
    add_sculpt('leg' + side, Lg, fn, 3800, 'leg' + side)
    b.add('anklecuff' + side, tube(limb_rings(k.lerp(f, 0.78), k.lerp(f, 0.92), 0.085 * H, 0.085 * H, n=1), 20), steel, region='k' + side, subdiv=0)


leg('L')
leg('R')

# ================================================================ o CRÂNIO baixo e à frente, o capuz de Lodo e a BARBA BRANCA
skull_drop = Vector((0, -0.1 * H, -0.18 * H))
b.add('skull', xform(head_part(sk, radii=(0.082, 0.09, 0.1)), lambda p: p + skull_drop), bone, region='head', subdiv=0)
hc = head_center(sk) + skull_drop
Hd = Sculpt()
Hd.ell(hc + V(0, 0.03, 0.02), (0.12 * H, 0.12 * H, 0.13 * H))  # o capuz de Lodo envolvendo o crânio por trás
Hd.ell(hc + V(0, 0.08, -0.06), (0.13 * H, 0.1 * H, 0.12 * H))
Hd.ell(hc + V(0, -0.07, -0.01), (0.09 * H, 0.08 * H, 0.11 * H), neg=True)  # o rosto (o crânio) livre
hood_fn = lambda p: AMP * 0.8 * (ridge(math.atan2(p.x - hc.x, p.z - hc.z) * 18 + n3(p, 4)) - 0.35)
add_sculpt('hood', Hd, hood_fn, 1600, 'head', res=0.016)
Bd = Sculpt()
for i in range(9):  # a barba longa caindo até o peito, em mechas que se fundem
    x = (i - 4) * 0.016
    root = hc + V(x, -0.07, -0.075)
    ln = 0.15 - abs(i - 4) * 0.014
    Bd.chain([root, root + V(x * 0.2, -0.03, -ln * 0.5), root + V(x * 0.35, -0.04, -ln)], [0.03 * H, 0.025 * H, 0.008 * H], step=0.6)
beard_fn = lambda p: 0.004 * H * (ridge((p.x - hc.x) / H * 260 + n3(p, 5) * 2, 2) - 0.4)
b.add('beard', Bd.mesh(res=0.012, smooth=3, disp=beard_fn, target=1800), white, region='body', weight_fn=weights('head'), subdiv=0)

# ================================================================ CORRENTES presas à cintura e enroladas na coxa
waist = []
for turn in range(2):
    for i in range(30):
        a = i / 30 * TAU
        waist.append(Vector((math.sin(a) * 0.215 * H, -math.cos(a) * 0.165 * H, hz + (0.13 - turn * 0.07 - i / 30 * 0.05) * H)))
b.add('chainsWaist', chain_mesh(waist, link=0.05 * H, r=0.0065 * H), chainm, region='body', weight_fn=weights('torso'), subdiv=0)
lR, kR = sk['lR'], sk['kR']
th = []
for i in range(20):
    t = i / 19
    a = t * TAU * 1.5
    c = lR.lerp(kR, 0.1 + t * 0.7)
    th.append(Vector((c.x + math.sin(a) * 0.14 * H, c.y - math.cos(a) * 0.14 * H, c.z)))
b.add('chainsThigh', chain_mesh(th, link=0.05 * H, r=0.0065 * H), chainm, region='lR', subdiv=0)

# ================================================================ os FIOS DE LODO subindo dos ombros e da corcunda (chamas pretas)
wt, wl, wr = [], [], []
for i in range(36):
    zone = i % 3
    if zone == 0:
        a = random.uniform(-1.2, 1.2)
        base = V(math.sin(a) * 0.22, 0.1 + math.cos(a) * 0.06, 1.72 + random.uniform(-0.06, 0.04))
        dirv = Vector((math.sin(a) * 0.5, 0.35, 1)).normalized()
        dest = wt
    else:
        side = 'L' if zone == 1 else 'R'
        sh = sk['s' + side]
        base = sh + V((0.06 if side == 'L' else -0.06) + random.uniform(-0.05, 0.05), random.uniform(-0.04, 0.08), 0.1)
        dirv = Vector(((0.5 if side == 'L' else -0.5), 0.25, 1)).normalized()
        dest = wl if side == 'L' else wr
    ln = random.uniform(0.12, 0.22) * H
    side_v = dirv.cross(Vector((0, 1, 0))).normalized()
    ph = random.uniform(0, TAU)
    # a chama: sobe ondulando de um lado para o outro e afina até a ponta
    pts = [base + dirv * ln * (k / 8) + side_v * math.sin(k * 0.9 + ph) * 0.035 * H * (k / 8) + Vector((0, 0.02 * H * math.cos(k * 0.7 + ph) * (k / 8), 0)) for k in range(9)]
    dest.append(rod(pts, [0.03 * H * (1 - 0.95 * k / 8) + 0.002 for k in range(9)], 6))
b.add('wispsBack', merge(*wt), wisp, region='chest', subdiv=0)
b.add('wispsL', merge(*wl), wisp, region='sL', subdiv=0)
b.add('wispsR', merge(*wr), wisp, region='sR', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'deus_morte.blend'), check_existing=False)
