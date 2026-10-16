"""
DANTE — public/models/dante.glb (Ordo Realitas, Calamidade). v2 (a técnica do Cristino / Cristopher).
Referências (wiki "Dante"): a arte promocional de Calamidade, a miniatura de Calamidade, a miniatura "com Olhos Abertos"
e a "em combate em Calamidade".
  - ~1,78 m, magro, pele pálida; cabelo loiro com FRANJA reta na testa e o resto puxado num RABO ALTO no topo de trás;
  - de OLHOS FECHADOS (a cegueira de Desconjuração), sem as tatuagens à mostra, cicatriz na têmpora direita;
  - o grande XALE BRANCO enrolado no pescoço e nos ombros, cruzado no peito e caindo até os joelhos (o "capuz branco
    longo" da wiki), preso pelo broche AZUL no peito esquerdo; camiseta escura de manga curta;
  - cinto de couro + o cinto de CORRENTE, a bolsinha e a bainha da faca no quadril direito; calça escura larga;
  - pés descalços ENFAIXADOS do tornozelo ao peito do pé.
FORMA "OLHOS ABERTOS" (dante_aberto, a Transformação): o MESMO modelo — o jogo troca as texturas (olhos pretos, as duas
faixas no rosto, as tatuagens de pintas e espirais no pescoço e nos braços) e liga as ORELHAS PONTUDAS (prop_eartip).
  node tools/blender/build.mjs dante   → public/models/dante.glb (+ tools/blender/fonte/dante.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, clothe, chain_mesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'dante.glb'
random.seed(1265)  # Dante Alighieri

b = Builder(width=0.95, bulk=0.96, height=1.0)  # 1,78 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_dante', '#ffffff', 0.8),  # pele pálida (no Olhos Abertos: as tatuagens — textura)
    'face': material('face_dante', '#ffffff', 0.8),  # olhos fechados, a cicatriz (no Olhos Abertos: olhos pretos e faixas)
    'torso': material('skin_dante', '#ffffff', 0.8),
    'arm': material('skin_dante', '#ffffff', 0.8),
    'hand': material('skin_dante', '#ffffff', 0.8),
    'legs': material('pants_dante', '#26252a', 0.9),
    'feet': material('skin_dante', '#ffffff', 0.8),
}
shirt = material('shirt_dante', '#3a3c38', 0.9)
shawl = material('shawl_dante', '#ffffff', 0.95)  # o xale branco com as dobras sombreadas (textura)
shawl_in = material('shawl_in_dante', '#b8b6b0', 0.95)
wrap = material('wraps_dante', '#ffffff', 0.95)  # faixas encardidas (textura)
hairm = material('hair_dante', '#c8aa78', 0.6)
hair_dk = material('hair_dante_dark', '#9a8058', 0.65)
leather = material('belt_dante', '#4a3424', 0.7)
leather_dk = material('sheath_dante', '#2a1e18', 0.7)
chainm = material('chain_dante', '#6a6a70', 0.4, metal=0.8)
gem = material('brooch_dante', '#5ab8e8', 0.25, emission='#2a88c8', strength=0.6)
gem_rim = material('brooch_rim_dante', '#9ab8c8', 0.35, metal=0.6)
bone = material('knife_grip_dante', '#d8d0c0', 0.5)

PREVIEW = {'skin_dante': '#e2c8bc', 'face_dante': '#e2c8bc', 'shawl_dante': '#ecebe6', 'wraps_dante': '#c8c2b4'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

# magro: ombros estreitos, peito raso, cintura fina
TP = [(-0.12, 0.162), (0.0, 0.164), (0.17, 0.152), (0.36, 0.19), (0.48, 0.206), (0.57, 0.118), (0.64, 0.07)]
hc = b.body(M, TP, arm_r=(0.064, 0.052, 0.044), leg_r=(0.082, 0.064, 0.05), head_r=(0.136, 0.146, 0.16), neck_r=0.056, feet='bare')


def part(name):
    return next(o for o in b.parts if o.name == name)


def lim(x):
    return max(0.0, min(1.0, x))


# ================================================================ o relevo do corpo magro (clavículas, braços finos)
def chest_relief(p):
    x, y, z = p.x, p.y, p.z - hz
    ax = abs(x)
    d = 0.0
    if y < 0 and z > 0.5 * H:  # as clavículas marcadas
        d += 0.004 * H * math.exp(-((z - (0.6 - ax / H * 0.25) * H) / (0.008 * H)) ** 2) * (ax < 0.15 * H)
    if y < -0.02 and 0.38 * H < z < 0.52 * H:  # peitorais rasos
        d += 0.005 * H * math.exp(-((ax - 0.08 * H) / (0.06 * H)) ** 2) * math.exp(-((z - 0.45 * H) / (0.05 * H)) ** 2)
    return d


relief(part('torso'), chest_relief)


def arm_relief(side):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]

    def f(p):
        if p.z > s_.z + 0.05 * H or p.z < e.z:
            return 0.0
        t = (s_.z + 0.05 * H - p.z) / (s_.z + 0.05 * H - e.z)
        return 0.008 * H * math.exp(-((t - 0.15) / 0.18) ** 2)  # o deltoide pequeno
    return f


for side in ('L', 'R'):
    relief(part('arm' + side), arm_relief(side))

# ================================================================ CAMISETA escura de manga curta (a malha do tronco, inflada)
def shirt_keep(p):
    z = (p.z - hz) / H
    ax = abs(p.x) / H
    if z < -0.02 or z > 0.655:
        return False
    if p.y < 0 and z > 0.6 and ax < 0.06 + (z - 0.6) * 0.8:
        return False  # a gola redonda
    return True


b.add('shirt', clothe(part('torso'), shirt_keep, 0.006 * H, cuts=1), shirt, region='body', weight_fn=lambda p: auto_weights(sk, p, 'torso'), subdiv=0)
for side in ('L', 'R'):  # as mangas curtas (escultura: o ombro redondo e a boca da manga folgada)
    s_, e = sk['s' + side], sk['e' + side]
    Sl = Sculpt()
    Sl.chain([s_ + Vector((0, 0, 0.03 * H)), s_.lerp(e, 0.22), s_.lerp(e, 0.42)], [0.072 * H, 0.07 * H, 0.068 * H], step=0.45)
    b.add('sleeve' + side, Sl.mesh(res=0.008, smooth=3, disp=lambda p: 0.002 * H * n3(p, 20), target=600), shirt, region='arm' + side, subdiv=0)

# ================================================================ CALÇA escura larga, enfiada nas faixas
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.004 * H, 0)), k.lerp(f, 0.55)],
            [0.08 * H, 0.072 * H, 0.064 * H, 0.06 * H], step=0.45)
    P.ell(k.lerp(f, 0.55) + Vector((0, 0, 0.01 * H)), (0.068 * H, 0.068 * H, 0.045 * H))  # a barra amontoada sobre as faixas
    c2 = (l.x, l.y)
    fold = lambda p, c=c2: 0.003 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 5 + p.z / H * 22 + n3(p, 14) * 1.5) - 0.35)
    b.add('pants' + side, P.mesh(res=0.011, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    # as FAIXAS enroladas da canela ao peito do pé (espiral) — os dedos ficam de fora
    wr = []
    z0, z1 = k.z - (k.z - f.z) * 0.6, f.z + 0.03 * H
    turns = 5
    n = turns * 14
    for i in range(n + 1):
        t = i / n
        a = t * turns * TAU
        z = z0 + (z1 - z0) * t
        rr = (0.06 - 0.012 * t) * H
        wr.append(Vector((f.x + math.sin(a) * rr, f.y - math.cos(a) * rr * 0.95 - 0.02 * H * t * t, z + 0.006 * math.sin(a * 0.5))))
    b.add('wrap' + side, rod(wr, 0.016 * H, 6, flat=(outward((f.x, f.y)), 0.22)), wrap, region='leg' + side, subdiv=0)
    fw = []  # o peito do pé enfaixado (voltas por cima, deixando os dedos)
    for j in range(3):
        y0 = f.y - (0.03 + j * 0.03) * H
        fw.append(rod([(f.x + math.sin(a) * 0.052 * H, y0, f.z + 0.016 * H + math.cos(a) * 0.036 * H) for a in [-1.9 + i / 10 * 3.8 for i in range(11)]], 0.013 * H, 5, flat=(lambda q, c=Vector((f.x, y0, f.z)): q - c, 0.3)))
    b.add('footWrap' + side, merge(*fw), wrap, region='k' + side, subdiv=0)
Hp = Sculpt()  # o quadril da calça
Hp.ell(Vector((0, 0.0, hz - 0.03 * H)), (0.165 * H, 0.118 * H, 0.115 * H))
Hp.ell(Vector((0, 0.03 * H, hz - 0.06 * H)), (0.15 * H, 0.108 * H, 0.095 * H))
b.add('pantsHip', Hp.mesh(res=0.012, smooth=3, disp=lambda p: 0.002 * H * n3(p, 14), target=900), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)

# ================================================================ CINTOS: couro + a CORRENTE caída, a bolsinha e a faca
belt_pts = [(math.sin(a) * 0.17 * H, -math.cos(a) * 0.125 * H, hz + 0.07 * H) for a in [i / 26 * TAU for i in range(27)]]
b.add('belt', rod(belt_pts, 0.02 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)), leather, region='torso', subdiv=0)
cpath = [Vector((math.sin(a) * 0.185 * H, -math.cos(a) * 0.138 * H, hz + (0.03 - 0.035 * max(0.0, math.cos(a))) * H)) for a in [i / 40 * TAU for i in range(41)]]
b.add('chainBelt', chain_mesh(cpath, link=0.042 * H, r=0.005 * H, closed=True), chainm, region='torso', subdiv=0)
pp = Vector((0.13 * H, -0.12 * H, hz + 0.02 * H))  # a bolsinha na frente, do lado esquerdo
Pb = Sculpt()
Pb.ell(pp, (0.04 * H, 0.025 * H, 0.04 * H))
Pb.ell(pp + Vector((0, -0.006 * H, 0.03 * H)), (0.042 * H, 0.02 * H, 0.016 * H))  # a aba
b.add('pouch', Pb.mesh(res=0.006, smooth=3, disp=lambda p: 0.0015 * n3(p, 40), target=500), leather, region='torso', subdiv=0)
# a bainha da faca, inclinada no quadril direito, com o cabo claro para cima
s0 = Vector((-0.17 * H, -0.06 * H, hz + 0.05 * H))
s1 = Vector((-0.2 * H, -0.03 * H, hz - 0.16 * H))
b.add('sheath', rod([s0, s0.lerp(s1, 0.5), s1], [0.02 * H, 0.018 * H, 0.008 * H], 8, flat=(outward((0, 0)), 0.45)), leather_dk, region='torso', subdiv=0)
g0 = s0 + (s0 - s1).normalized() * 0.01 * H
g1 = s0 + (s0 - s1).normalized() * 0.075 * H
b.add('knifeGrip', rod([g0, g1], [0.011 * H, 0.012 * H], 8), bone, region='torso', subdiv=0)

# ================================================================ o XALE BRANCO
# 1) a volta grossa enrolada no pescoço e nos ombros (escultura, com as dobras do pano)
X = Sculpt()
X.chain(ring_pts(top + 0.05 * H, 0.105 * H / 1.15, 0.095 * H / 1.2, 0, TAU, 22), 0.042 * H, step=0.55)
X.chain(ring_pts(top + 0.095 * H, 0.085 * H / 1.15, 0.08 * H / 1.2, 0, TAU, 20), 0.03 * H, step=0.55)


def shawl_folds(p):
    a = math.atan2(p.x, p.y)
    return 0.005 * H * (ridge(a * 6 + p.z / H * 14 + n3(p, 16) * 1.6, 2) - 0.4)


b.add('shawlWrap', X.mesh(res=0.008, smooth=3, disp=shawl_folds, target=1600), shawl, region='torso', subdiv=0)


# 2) o manto caindo dos ombros até os joelhos (casca com espessura), aberto embaixo na frente e os braços passando por baixo
def cape_pt(a, v):
    # medidas FINAIS (o tronco é escalado depois por k_tx / k_ty): do pescoço sobe por cima dos ombros e cai
    # v < V0: sai do pescoço quase na horizontal e passa POR CIMA dos ombros (os braços ficam a ~0,3 H do centro);
    # depois cai reto até os joelhos
    V0 = 0.18
    th = min(1.0, v / V0) * math.pi / 2  # o ombro é um ARCO: sai para fora e vira para baixo, redondo
    side = abs(math.sin(a))
    k = 0.6 + 0.4 * side
    rx = 0.1 * H + (0.42 * H - 0.1 * H) * math.sin(th) * k + max(0.0, v - V0) * 0.06 * H
    ry = 0.095 * H + (0.21 * H - 0.095 * H) * math.sin(th) + max(0.0, v - V0) * 0.07 * H
    front = max(0.0, math.cos(a))
    ln = (0.86 - 0.36 * front ** 1.6) * H  # comprido atrás e dos lados; a frente para na barriga
    fold = 1 + 0.09 * min(1.0, v * 2.5) * (ridge(a * 3.5 + v * 1.5 + n3(Vector((a, v, 0)), 3)) - 0.4)
    hem = 0.03 * H * math.sin(a * 5) * max(0.0, v - 0.85) / 0.15  # a barra ondulada
    z = top + 0.16 * H - 0.08 * H * (1 - math.cos(th)) * k - max(0.0, v - V0) / (1 - V0) * ln + hem
    return Vector((math.sin(a) * rx * fold / b.k_tx, -math.cos(a) * ry * fold / b.k_ty, z))


GAP = 0.07  # a abertura estreita da frente (a aba cruzada cobre por cima)
cape_rows = [[cape_pt((GAP + (1 - 2 * GAP) * j / 64) * TAU, v) for j in range(65)] for v in [0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18] + [0.18 + 0.82 * k / 16 for k in range(1, 17)]]


# a ABA CRUZADA na frente: o pano largo que vem do ombro direito e cobre o peito até o lado esquerdo da cintura
def flap_pt(u, v):
    a = Vector((-0.17 * H, -0.07 * H, top + 0.13 * H))  # o ombro direito
    c = Vector((0.2 * H, -0.12 * H, top - 0.38 * H))  # o lado esquerdo, na cintura
    p = a.lerp(c, v)
    w = (0.15 + 0.07 * math.sin(v * math.pi) + 0.04 * v) * H  # mais largo no meio do peito
    across = Vector((0.55, 0, 0.83)).normalized()
    q = p + across * (u - 0.5) * w
    y = -(0.15 + 0.03 * math.sin(v * math.pi) - 0.04 * (1 - v) ** 3) * H - 0.012 * H * math.sin(u * math.pi)
    return Vector((q.x / b.k_tx, y / b.k_ty, q.z))


flap_rows = [[flap_pt(j / 8, i / 12) for j in range(9)] for i in range(13)]


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.13 * H, 0.27 * H, abs(p.x)) * smoothstep(top - 0.55 * H, top - 0.12 * H, p.z) * 0.55
    w_hip = smoothstep(hz + 0.12 * H, hz - 0.3 * H, p.z) * (1 - w_arm) * 0.7
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


cape = b.add('shawlCape', shell_grid(cape_rows, 0.008 * H), shawl, region='torso', weight_fn=cape_weights, subdiv=0)
flap = b.add('shawlFlap', shell_grid(flap_rows, 0.008 * H), shawl, region='torso', subdiv=1)
relief(flap, lambda p: 0.004 * H * (ridge((p.x * 0.8 + p.z * 0.6) / H * 30 + n3(p, 12), 2) - 0.35))
relief(cape, lambda p: 0.004 * H * (ridge(math.atan2(p.x, p.y) * 7 + n3(p, 10) * 1.4, 2) - 0.35) * lim((top - p.z) / (0.3 * H)))
# a ponta desfiada que sobra do lado esquerdo da frente
tail = [Vector((0.17 * H / 1.15, -0.14 * H / 1.2, top - 0.34 * H)), Vector((0.18 * H / 1.15, -0.15 * H / 1.2, top - 0.48 * H)), Vector((0.17 * H / 1.15, -0.14 * H / 1.2, top - 0.6 * H))]
T = Sculpt()
T.chain(tail, [0.04 * H, 0.045 * H, 0.02 * H], step=0.5)
b.add('shawlTail', T.mesh(res=0.007, smooth=3, disp=shawl_folds, target=700), shawl, region='torso', subdiv=0)
# o BROCHE azul no peito esquerdo (hexágono com o aro claro)
bc = Vector((0.1 * H / 1.15, -0.19 * H / 1.2, top - 0.12 * H))
hexa = []
for k in range(6):
    a0, a1 = k / 6 * TAU, (k + 1) / 6 * TAU
    hexa.append(cone(tuple(bc), tuple(bc + Vector((math.sin(a0) * 0.03 * H, -0.004 * H, math.cos(a0) * 0.03 * H))), 0.018 * H, 4))
b.add('brooch', merge(ellipsoid(tuple(bc + Vector((0, -0.004 * H, 0))), (0.028 * H, 0.008 * H, 0.03 * H), 6, 4), *hexa), gem, region='torso', subdiv=0)
b.add('broochRim', rod([bc + Vector((math.sin(a) * 0.032 * H, -0.006 * H, math.cos(a) * 0.034 * H)) for a in [i / 6 * TAU for i in range(7)]], 0.004 * H, 4, caps=False), gem_rim, region='torso', subdiv=0)

# ================================================================ CABELO loiro: a touca, a FRANJA reta e o RABO ALTO
def hair_keep(p):
    q = p - hc
    z, y = q.z / H, q.y / H
    line = 0.075 if y < -0.07 else (0.02 if y < 0.04 else -0.07)  # testa · têmporas · nuca
    return z > line - 0.01 * abs(q.x / H) * 3


cap = b.add('hair', clothe(part('head'), hair_keep, 0.01 * H, cuts=0), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
relief(cap, lambda p: 0.0018 * H * (ridge(math.atan2(p.x - hc.x, p.z - hc.z) * 30 + n3(p, 40), 2) - 0.4))  # mechas penteadas para trás
F = Sculpt()  # a franja: mechas grossas caindo retas até as sobrancelhas
for k in range(9):
    x = (-0.1 + k * 0.025) * H
    yb = hc.y - (0.142 - 0.5 * (x / H) ** 2 / 0.14) * H
    ln = 0.075 + (0.01 if k % 3 == 1 else 0.0) - (0.008 if k % 4 == 0 else 0.0)
    F.chain([Vector((x, yb + 0.03 * H, hc.z + 0.13 * H)), Vector((x * 1.04, yb - 0.004 * H, hc.z + 0.09 * H)), Vector((x * 1.06, yb - 0.008 * H, hc.z + (0.135 - ln) * H))],
            [0.02 * H, 0.016 * H, 0.008 * H], step=0.5)
for s in (1, -1):  # as laterais curtas cobrindo as têmporas (as orelhas ficam de fora)
    F.chain([hc + Vector((s * 0.128 * H, -0.075 * H, 0.1 * H)), hc + Vector((s * 0.138 * H, -0.085 * H, 0.05 * H)), hc + Vector((s * 0.138 * H, -0.09 * H, 0.02 * H))],
            [0.016 * H, 0.012 * H, 0.006 * H], step=0.5)
b.add('bangs', F.mesh(res=0.0055, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.x / H * 160, 2) - 0.4), target=1600), hairm, region='head', subdiv=0)
R = Sculpt()  # o rabo alto: preso no alto de trás, sobe e cai para trás em mechas
tie = hc + Vector((0, 0.11 * H, 0.15 * H))
R.ell(tie, (0.03 * H, 0.03 * H, 0.03 * H))
R.chain([tie, tie + Vector((0, 0.015 * H, 0.05 * H)), tie + Vector((0, 0.05 * H, 0.08 * H)), tie + Vector((0, 0.1 * H, 0.06 * H)), tie + Vector((0, 0.13 * H, 0.0)), tie + Vector((0, 0.14 * H, -0.06 * H))],
        [0.03 * H, 0.04 * H, 0.04 * H, 0.032 * H, 0.02 * H, 0.006 * H], step=0.45)
for s in (1, -1):
    R.chain([tie + Vector((0, 0.06 * H, 0.06 * H)), tie + Vector((s * 0.04 * H, 0.1 * H, 0.03 * H)), tie + Vector((s * 0.05 * H, 0.12 * H, -0.03 * H))],
            [0.016 * H, 0.012 * H, 0.004 * H], step=0.5)
b.add('ponytail', R.mesh(res=0.006, smooth=3, disp=lambda p: 0.0018 * H * (ridge(math.atan2(p.x, p.z - tie.z) * 18 + n3(p, 30), 2) - 0.4), target=1400), hairm, region='head', subdiv=0)
b.add('hairTie', rod(ring_pts(tie.z - 0.004 * H, 0.028 * H, 0.028 * H, 0, TAU, 12), 0.007 * H, 5, caps=False), leather_dk, region='head', subdiv=0)
# sobrancelhas loiras finas
br = []
for s in (1, -1):
    br.append(rod([(s * 0.022 * H, hc.y - 0.147 * H, hc.z + 0.038 * H), (s * 0.05 * H, hc.y - 0.143 * H, hc.z + 0.044 * H), (s * 0.075 * H, hc.y - 0.132 * H, hc.z + 0.038 * H)], 0.0045 * H, 5, flat=(lambda q: q - hc, 0.5)))
b.add('brows', merge(*br), hair_dk, region='head', subdiv=0)

# ================================================================ ORELHAS PONTUDAS (prop_eartip: só no Olhos Abertos)
tips = []
for s in (1, -1):
    base = Vector((s * 0.136 * H, 0.004 * H, hc.z + 0.012 * H))
    E = Sculpt()
    E.chain([base, base + Vector((s * 0.016 * H, 0.02 * H, 0.04 * H)), base + Vector((s * 0.028 * H, 0.034 * H, 0.07 * H))], [0.018 * H, 0.012 * H, 0.003 * H], step=0.5)
    b.add(f'prop_eartip_{"L" if s > 0 else "R"}', E.mesh(res=0.004, smooth=2, target=300), M['skin'], region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'dante.blend'), check_existing=False)
