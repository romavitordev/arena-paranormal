"""
XANDE (Alexandre) — public/models/xande.glb. Refeito com a técnica atual (sculpt_lib: roupa a partir do corpo,
metaballs, relevo, peças coladas na superfície por raio), a partir da ARTE OFICIAL de Sinais do Outro Lado (wiki
"Alexandre": arte do personagem, arte promocional e as miniaturas).

Referência (a arte, de cima a baixo):
  - 1,75 m, pele clara, olhos azuis; cabelo LONGO, ONDULADO, castanho-dourado, cheio, caindo além dos ombros e
    emoldurando o rosto;
  - BONÉ AMARELO virado para trás (aba atrás, um pouco de lado) com marcas pretas (riscos em triângulo);
  - a BALACLAVA/gola cinza-esverdeada abaixada, embolada no pescoço; FONES DE OUVIDO pretos por cima;
  - CAMISETA AMARELA (os 3 triângulos e "oculto" — textura shirt_xande) com MANGAS CINZA largas até o meio do braço,
    a BLUSA PRETA de mangas arregaçadas por baixo;
  - o BROCHE DOURADO dos Cinco no meio do peito, onde cruzam as TIRAS DE COURO (suspensório em X que desce dos
    ombros); o CINTO de couro com os FRASCOS azuis, o walkman e bolsas; a BOLSA de quadril com duas bolsinhas;
  - BERMUDA PRETA até o joelho com a BARRA AMARELA de triângulos pretos e as fitas amarelas penduradas; as JOELHEIRAS
    com um OLHO desenhado; arranhões nas canelas (textura legs_xande);
  - LUVAS SEM DEDOS pretas com munhequeiras amarelas; CORRENTE enrolada no antebraço direito e na canela esquerda;
  - TÊNIS AMARELOS de cano alto com sola branca e cadarço.
O taco com arame farpado e o Skate Caótico são adicionados em código (models/props.js).
  node tools/blender/build.mjs xande   → public/models/xande.glb (+ tools/blender/fonte/xande.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, relief, clothe, chain_mesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'xande.glb'
random.seed(1978)  # Minas Gerais, 27 de novembro de 1978

b = Builder(width=0.96, bulk=0.95, height=0.97)  # 1,75 m, magro
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_xande', '#e6bea2', 0.8),
    'face': material('face_xande', '#ffffff', 0.8),
    'torso': material('shirt_xande', '#ffffff', 0.85),  # camiseta amarela com os triângulos e "oculto"
    'arm': material('skin_xande', '#e6bea2', 0.8),
    'hand': material('glove_xande', '#1a1a1c', 0.7),  # luva sem dedos
    'legs': material('legs_xande', '#ffffff', 0.8),  # canelas com os arranhões (textura)
    'feet': material('skin_xande', '#e6bea2', 0.8),  # escondidos dentro do tênis
}
yellow = material('cap_yellow', '#e2b524', 0.6)
grey = material('sleeve_xande', '#ffffff', 0.9)  # as mangas largas da camiseta (textura: malha e a barra)
gaiter = material('gaiter_xande', '#ffffff', 0.95)  # a balaclava cinza-esverdeada no pescoço (textura canelada)
black = material('black_cloth', '#17171a', 0.9)
shorts = material('shorts_xande', '#ffffff', 0.9)  # a bermuda (textura: sarja e costuras)
leather = material('leather_brown', '#5c3a22', 0.7)
leather2 = material('leather_dark', '#3e2616', 0.75)
silver = material('chain_silver', '#b8b8c0', 0.25, metal=0.9)
gold = material('gold_brooch', '#c9a24a', 0.3, metal=0.85)
hairm = material('hair_xande', '#7a5230', 0.55)
white = material('sole_white', '#e8e4dc', 0.7)
vial = material('vial_blue', '#3aa0d8', 0.15)
trim = material('trim_xande', '#ffffff', 0.7)  # a barra amarela com os triângulos pretos (textura)
padm = material('kneepad_xande', '#d8d8d4', 0.5)
iris = material('kneepad_iris', '#1c1c20', 0.4)
phone = material('headphone', '#232326', 0.45)
neon = material('neon_green', '#5aff6a', 0.3, emission='#5aff6a', strength=1.5)  # Tênis de Energia (item do jogo)
radio = material('radio_yellow', '#d8a81c', 0.5)

PREVIEW = {'shirt_xande': '#e2b524', 'face_xande': '#e6bea2', 'legs_xande': '#e6bea2', 'trim_xande': '#e2b524', 'sleeve_xande': '#6e7066', 'gaiter_xande': '#5f6656', 'shorts_xande': '#18181b'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

# magro de ombros largos (skatista): o tronco afina na cintura
TP = [(-0.12, 0.16), (0.0, 0.158), (0.17, 0.148), (0.36, 0.192), (0.48, 0.205), (0.58, 0.112), (0.65, 0.066)]
hc = b.body(M, TP, arm_r=(0.058, 0.047, 0.04), leg_r=(0.074, 0.058, 0.047), head_r=(0.134, 0.146, 0.158), feet='bare')


def part(name):
    return next(o for o in b.parts if o.name == name)


def lim(x):
    return max(0.0, min(1.0, x))


def ring_at(c, rx, ry, n=12):
    return [Vector((c.x + q.x, c.y + q.y, c.z)) for q in ring_pts(0, rx, ry, 0, TAU, n)]


def W(reg):
    return lambda p: auto_weights(sk, p, reg)


# ---------------------------------------------------------------- superfície do corpo (para colar tiras, cinto e bolsas)
_bvh = {}


def bvh(name):
    if name not in _bvh:
        o = part(name)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        me.transform(o.matrix_world)
        bm = bmesh.new()
        bm.from_mesh(me)
        _bvh[name] = BVHTree.FromBMesh(bm)
        bm.free()
        bpy.data.meshes.remove(me)
    return _bvh[name]


def surf(name, origin, direction, off=0.0):
    """o ponto da peça `name` atingido pelo raio (origem fora, direção para dentro), afastado `off` pela normal"""
    hit = bvh(name).ray_cast(Vector(origin), Vector(direction).normalized())
    if hit[0] is None:
        return None
    return hit[0] + hit[1] * off


def around(name, center, z, off, n=24, a0=0.0, a1=TAU):
    """volta horizontal colada na peça: raios de fora para o eixo `center` na altura z (a = 0 na frente, -y)"""
    pts = []
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
        d = Vector((math.sin(a), -math.cos(a), 0))
        p = surf(name, Vector((center.x, center.y, z)) + d * 0.6 * H, -d, off)
        if p:
            pts.append(p)
    return pts


def front(name, x, z, off=0.0, back=False):
    s = 1 if back else -1
    return surf(name, Vector((x, s * 0.6 * H, z)), Vector((0, -s, 0)), off)


# ================================================================ CAMISETA: barra solta, ombros e mangas cinza largas
tor = part('torso')
# a barra da camiseta caindo solta por cima do cós (um pouco afastada do corpo)
b.add('shirtHem', clothe(tor, lambda p: hz - 0.02 * H < p.z < hz + 0.1 * H, 0.012 * H, cuts=1), M['torso'], region='body', weight_fn=W('torso'), subdiv=0)
# a costura raglan: o alto dos ombros já é cinza
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    arm = part('arm' + side)
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    zs, ze = sh.z + 0.09 * H, sh.lerp(e, 0.6).z
    zb = e.lerp(h, 0.3).z
    # manga cinza: larga e caída (o tecido afasta mais embaixo, na boca da manga)
    sl = b.add('sleeve' + side, clothe(arm, lambda p: ze < p.z < zs, 0.009 * H, cuts=1), grey, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(sl, lambda p, zs=zs, ze=ze: 0.007 * H * lim((zs - p.z) / (zs - ze)) ** 1.5 + 0.0025 * H * (ridge(p.z / H * 60 + n3(p, 20), 2) - 0.4))
    # a blusa preta por baixo, arregaçada logo abaixo do cotovelo, e o rolo do punho dobrado
    b.add('undersleeve' + side, clothe(arm, lambda p: zb < p.z < ze + 0.02 * H, 0.007 * H, cuts=1), black, region='body', weight_fn=W('arm' + side), subdiv=0)
    c = e.lerp(h, 0.3)
    roll = around('arm' + side, c, c.z, 0.012 * H, n=18)
    if len(roll) > 6:
        b.add('roll' + side, rod(roll, 0.012 * H, 6, caps=False), black, region='body', weight_fn=W('arm' + side), subdiv=0)
    # munhequeira amarela com os triângulos pretos (a luva sem dedos é o material da mão)
    wr = e.lerp(h, 0.9)
    band = around('arm' + side, wr, wr.z, 0.006 * H, n=16)
    if len(band) > 6:
        b.add('wrist' + side, tube([(q.x, q.y, q.z, 0.0, 0.0) for q in []] or [(wr.x, wr.y, wr.z - 0.012 * H, 0.046 * H, 0.04 * H), (wr.x, wr.y, wr.z + 0.012 * H, 0.046 * H, 0.04 * H)], 14), trim, region='body', weight_fn=W('e' + side), subdiv=0)

# ================================================================ BALACLAVA abaixada, embolada no pescoço, e os FONES por cima
G = Sculpt()
nb = Vector((0, 0.004 * H, 1.575 * H))
for i in range(4):  # três-quatro voltas fofas de tecido, a de cima chegando no queixo, caída na frente
    z = nb.z + i * 0.03 * H
    r = (0.072 - 0.004 * i) * H
    for k in range(18):
        a = k / 18 * TAU
        sag = 0.012 * H * max(0.0, -math.cos(a)) * (i / 3)
        G.ell(Vector((math.sin(a) * r, -math.cos(a) * r * 0.95 + 0.004 * H, z - sag)), (0.03 * H, 0.03 * H, 0.022 * H))
b.add('gaiter', G.mesh(res=0.006, smooth=3, disp=lambda p: 0.002 * H * (ridge(math.atan2(p.x, p.y) * 9 + n3(p, 30), 2) - 0.4), target=2200), gaiter, region='body',
      weight_fn=lambda p: {'chest': 1 - lim((p.z - 1.57 * H) / (0.1 * H)), 'neck': lim((p.z - 1.57 * H) / (0.1 * H))}, subdiv=0)
ph = []
band = [Vector((math.sin(a) * 0.088 * H, -math.cos(a) * 0.084 * H + 0.012 * H, 1.578 * H - 0.012 * H * math.cos(a))) for a in [math.pi * (0.62 + 0.76 * i / 16) for i in range(17)]]
ph.append(rod(band, 0.009 * H, 6))
for s in (1, -1):  # as conchas caídas sobre as clavículas
    c = Vector((s * 0.07 * H, -0.075 * H, 1.555 * H))
    ph.append(rod([c + Vector((s * 0.012 * H, 0, 0)), c - Vector((s * 0.012 * H, 0, 0))], 0.03 * H, 14))
b.add('headphones', merge(*ph), phone, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ SUSPENSÓRIO DE COURO em X, CINTO, FRASCOS, BOLSAS e o BROCHE
xc = Vector((0, 0, hz + 0.44 * H))  # onde as tiras cruzam (o broche)
straps = []
for s in (1, -1):
    pts = []
    # do ombro (atrás, por cima) ao cruzamento no peito e ao cinto do outro lado
    top = [surf('torso', Vector((s * 0.12 * H, 0, hz + 0.75 * H)), Vector((0, 0, -1)), 0.006 * H)]
    for t in [k / 10 for k in range(11)]:
        x = s * 0.115 * H * (1 - t) + (-s) * 0.13 * H * t
        z = (hz + 0.6 * H) * (1 - t) + (hz + 0.1 * H) * t
        q = front('torso', x, z, 0.007 * H)
        if q:
            pts.append(q)
    pts = [p for p in top if p] + pts
    straps.append(rod(pts, 0.011 * H, 6, flat=(outward((0, 0)), 0.35)))
    # e atrás: do ombro até o cinto do mesmo lado
    bk = [front('torso', s * (0.115 * H - 0.03 * H * t), (hz + 0.6 * H) * (1 - t) + (hz + 0.1 * H) * t, 0.007 * H, back=True) for t in [k / 8 for k in range(9)]]
    bk = [p for p in top if p] + [p for p in bk if p]
    straps.append(rod(bk, 0.011 * H, 6, flat=(outward((0, 0)), 0.35)))
b.add('straps', merge(*straps), leather, region='body', weight_fn=W('torso'), subdiv=0)
belt = around('torso', Vector((0, 0, 0)), hz + 0.1 * H, 0.016 * H, n=32)
b.add('belt', rod(belt, 0.022 * H, 6, caps=False, flat=(outward((0, 0)), 0.45)), leather2, region='body', weight_fn=W('torso'), subdiv=0)
bk_ = front('torso', 0, hz + 0.1 * H, 0.03 * H)
b.add('buckle', box(tuple(bk_), (0.05 * H, 0.012 * H, 0.04 * H), bevel=0.004), silver, region='body', weight_fn=W('torso'), subdiv=0)
gear = []
# os FRASCOS azuis presos no cinto (frente, à esquerda dele) e o walkman/rádio amarelo
for k in range(3):
    p = front('torso', 0.045 * H + k * 0.028 * H, hz + 0.14 * H, 0.03 * H)
    gear.append(('vial', rod([p, p + Vector((0, 0, 0.05 * H))], 0.011 * H, 8)))
    gear.append(('cap', rod([p + Vector((0, 0, 0.05 * H)), p + Vector((0, 0, 0.062 * H))], 0.008 * H, 8)))
p = front('torso', 0.14 * H, hz + 0.15 * H, 0.04 * H)
gear.append(('radio', box(tuple(p), (0.045 * H, 0.025 * H, 0.075 * H), bevel=0.004)))
gear.append(('dark', rod([p + Vector((0.012 * H, 0, 0.035 * H)), p + Vector((0.012 * H, 0, 0.09 * H))], 0.003 * H, 4)))  # a antena
# bolsas de couro no cinto (frente e lados) e a bolsa grande de quadril com duas bolsinhas (lado direito dele)
for x, w in ((-0.06 * H, 0.06 * H), (0.17 * H, 0.05 * H)):
    p = front('torso', x, hz + 0.07 * H, 0.04 * H)
    gear.append(('pouch', box(tuple(p), (w, 0.04 * H, 0.065 * H), bevel=0.006)))
    gear.append(('flap', box(tuple(p + Vector((0, -0.021 * H, 0.02 * H))), (w * 1.02, 0.006 * H, 0.03 * H), bevel=0.003)))
for k, dz in enumerate((0.0, 0.0)):
    p = Vector((-0.2 * H, -0.06 * H + k * 0.075 * H, hz - 0.1 * H))
    gear.append(('pouch', box(tuple(p), (0.05 * H, 0.06 * H, 0.085 * H), bevel=0.008)))
    gear.append(('flap', box(tuple(p + Vector((-0.026 * H, 0, 0.025 * H))), (0.008 * H, 0.062 * H, 0.04 * H), bevel=0.003)))
hipstrap = around('torso', Vector((0, 0, 0)), hz - 0.02 * H, 0.03 * H, n=24, a0=-0.15 * TAU, a1=-0.38 * TAU)
if len(hipstrap) > 3:
    gear.append(('strap', rod(hipstrap, 0.008 * H, 5, flat=(outward((0, 0)), 0.4))))
# a faca na bainha (lado direito, no cinto)
p = front('torso', -0.14 * H, hz + 0.02 * H, 0.04 * H)
gear.append(('sheath', rod([p, p + Vector((0.01 * H, 0, -0.13 * H))], [0.014 * H, 0.008 * H], 6, flat=(outward((0, 0)), 0.5))))
gear.append(('dark', rod([p, p + Vector((0, 0, 0.06 * H))], 0.009 * H, 6)))
mats = {'vial': vial, 'cap': silver, 'radio': radio, 'dark': phone, 'pouch': leather, 'flap': leather2, 'strap': leather2, 'sheath': leather2}
for kind in mats:
    gs = [g for k, g in gear if k == kind]
    if gs:
        b.add('gear_' + kind, merge(*gs), mats[kind], region='body', weight_fn=W('torso'), subdiv=0)
# o BROCHE dos Cinco no cruzamento das tiras: disco com a borda e o símbolo em relevo
bc = front('torso', 0, xc.z, 0.02 * H)
br = [rod([bc + Vector((0, 0.004 * H, 0)), bc - Vector((0, 0.006 * H, 0))], 0.032 * H, 16)]
br.append(rod(ring_pts(0, 0.032 * H, 0.032 * H, 0, TAU, 20), 0.0035 * H, 5, caps=False))
for i in range(5):  # cinco pontas (os Cinco)
    a = i / 5 * TAU
    br.append(rod([bc + Vector((0, -0.007 * H, 0)), bc + Vector((math.sin(a) * 0.022 * H, -0.007 * H, math.cos(a) * 0.022 * H))], 0.003 * H, 4))
# o anel da borda foi feito em volta da origem: leva para o broche (de pé, virado para a frente)
v, f, u = br[1]
br[1] = ([tuple(bc + Vector((q[0], -0.007 * H, q[1]))) for q in v], f, u)
b.add('brooch', merge(*br), gold, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ BERMUDA preta até o joelho, barra amarela, fitas e JOELHEIRAS de olho
b.add('shortsHips', clothe(tor, lambda p: p.z < hz + 0.08 * H, 0.01 * H, cuts=1), shorts, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    leg = part('leg' + side)
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    zk = l.lerp(k, 0.93).z
    sh = b.add('shorts' + side, clothe(leg, lambda p, zk=zk: p.z > zk, 0.016 * H, cuts=1), shorts, region='body', weight_fn=W('leg' + side), subdiv=0)
    # pano largo: as pregas verticais
    relief(sh, lambda p: 0.004 * H * (ridge(math.atan2(p.x - sk['k' + side].x, p.y) * 5 + n3(p, 12), 2) - 0.35))
    # a barra amarela de triângulos pretos
    c = Vector((k.x, k.y, zk + 0.012 * H))
    b.add('hem' + side, tube([(c.x, c.y + 0.004 * H, c.z - 0.018 * H, 0.095 * H, 0.088 * H), (c.x, c.y + 0.004 * H, c.z + 0.018 * H, 0.097 * H, 0.09 * H)], 20), trim, region='body', weight_fn=W('leg' + side), subdiv=0)
    # as fitas amarelas penduradas do lado de fora da barra
    rib = []
    for j in range(2):
        r0 = c + Vector((s * 0.095 * H, (j - 0.5) * 0.03 * H, -0.01 * H))
        rib.append(rod([r0, r0 + Vector((s * 0.008 * H, 0, -0.06 * H)), r0 + Vector((s * 0.004 * H, 0.004 * H, -0.12 * H))], 0.007 * H, 4, flat=(outward((0, 0)), 0.25)))
    b.add('ribbons' + side, merge(*rib), yellow, region='body', weight_fn=W('leg' + side), subdiv=0)
    # JOELHEIRA: a concha clara na frente do joelho com o OLHO (branco amendoado + íris escura)
    kp = surf('leg' + side, Vector((k.x, k.y - 0.6 * H, k.z - 0.035 * H)), Vector((0, 1, 0)), 0.016 * H)
    P = Sculpt()
    P.ell(kp, (0.056 * H, 0.022 * H, 0.06 * H))
    b.add('kneepad' + side, P.mesh(res=0.004, smooth=2, target=500), padm, region='body', weight_fn=W('k' + side), subdiv=0)
    eye = Sculpt()
    eye.ell(kp + Vector((0, -0.014 * H, 0)), (0.04 * H, 0.009 * H, 0.02 * H))
    b.add('kneeEye' + side, eye.mesh(res=0.003, smooth=1, target=200), white, region='body', weight_fn=W('k' + side), subdiv=0)
    ir = Sculpt()
    ir.ell(kp + Vector((0, -0.02 * H, 0)), (0.016 * H, 0.006 * H, 0.016 * H))
    b.add('kneeIris' + side, ir.mesh(res=0.0025, smooth=1, target=120), iris, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ TÊNIS AMARELOS de cano alto, sola branca e cadarço
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    k, f = sk['k' + side], sk['foot' + side]
    U = Sculpt()
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.005 * H))
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.012 * H)), toe], [0.048 * H, 0.05 * H, 0.04 * H], step=0.45)
    U.ell(toe + Vector((0, 0.008 * H, 0.008 * H)), (0.044 * H, 0.04 * H, 0.03 * H))  # o bico arredondado
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.1 * H)), Vector((f.x, f.y + 0.004 * H, f.z + 0.16 * H))], [0.062 * H, 0.06 * H, 0.058 * H], step=0.45)  # o cano alto
    U.ell(Vector((f.x, f.y + 0.006 * H, f.z + 0.17 * H)), (0.062 * H, 0.06 * H, 0.016 * H))  # a boca acolchoada
    U.chain([Vector((f.x, f.y - 0.06 * H, f.z + 0.05 * H)), Vector((f.x, f.y - 0.04 * H, f.z + 0.17 * H))], [0.03 * H, 0.026 * H], step=0.45)  # a lingueta
    b.add('sneaker' + side, U.mesh(res=0.006, smooth=2, target=1100), yellow, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.008 * H, -0.024 * H)), toe + Vector((0, -0.012 * H, -0.006 * H))], [0.052 * H, 0.046 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=550)
    so = ([(x, y, max(z, f.z - 0.035 * H) if z < f.z - 0.01 * H else min(z, f.z - 0.0)) for x, y, z in so[0]], so[1], so[2])
    b.add('sole' + side, so, white, region='body', weight_fn=W('k' + side), subdiv=0)
    lc = []
    for j in range(5):  # o cadarço em X subindo pela lingueta até o cano
        z = f.z + 0.05 * H + j * 0.024 * H
        y = f.y - 0.07 * H + j * 0.006 * H
        lc.append(rod([Vector((f.x - 0.018 * H, y - 0.03 * H + j * 0.012 * H, z)), Vector((f.x + 0.018 * H, y - 0.03 * H + j * 0.012 * H, z + 0.012 * H))], 0.0035 * H, 4))
        lc.append(rod([Vector((f.x + 0.018 * H, y - 0.03 * H + j * 0.012 * H, z)), Vector((f.x - 0.018 * H, y - 0.03 * H + j * 0.012 * H, z + 0.012 * H))], 0.0035 * H, 4))
    b.add('laces' + side, merge(*lc), white, region='body', weight_fn=W('k' + side), subdiv=0)
    # Tênis de Energia (o item do jogo): um filete neon contornando o cano
    nr = [Vector((f.x + math.sin(a) * 0.064 * H, f.y + 0.006 * H - math.cos(a) * 0.062 * H, f.z + 0.12 * H + 0.012 * H * math.sin(a * 2))) for a in [i / 18 * TAU for i in range(19)]]
    b.add('neon' + side, rod(nr, 0.004 * H, 4, caps=False), neon, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CORRENTES: enrolada no antebraço direito e na canela esquerda (elos de verdade)
def spiral(a_, b_, r, turns, n=60, phase=0.0):
    pts = []
    for i in range(n + 1):
        t = i / n
        c = a_.lerp(b_, t)
        a = phase + t * turns * TAU
        pts.append(c + Vector((math.sin(a) * r, -math.cos(a) * r, 0)))
    return pts


eR, hR = sk['eR'], sk['handR']
ch = chain_mesh(spiral(eR.lerp(hR, 0.35), eR.lerp(hR, 0.88), 0.06 * H, 2.6), link=0.028 * H, r=0.0038 * H)
b.add('chainArm', ch, silver, region='body', weight_fn=W('eR'), subdiv=0)
kL, fL = sk['kL'], sk['footL']
ch2 = chain_mesh(spiral(kL.lerp(fL, 0.22), kL.lerp(fL, 0.62), 0.072 * H, 3.2, phase=1.0), link=0.028 * H, r=0.0038 * H)
b.add('chainLeg', ch2, silver, region='body', weight_fn=W('kL'), subdiv=0)

# ================================================================ CABELO: longo, ondulado e cheio, caindo além dos ombros e emoldurando o rosto
def hair_keep(p):
    q = p - hc
    z, y = q.z / H, q.y / H
    line = 0.09 - 0.17 * smoothstep(-0.1, 0.04, y)  # a testa coberta pela franja repartida, as têmporas e a nuca
    return z > line


capm = b.add('hairCap', clothe(part('head'), hair_keep, 0.008 * H, cuts=1), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
relief(capm, lambda p: 0.004 * H * (ridge(math.atan2(p.x - hc.x, p.y - hc.y) * 14 + n3(p, 30) * 0.8, 2) - 0.35))
HS = Sculpt()
N = 40
for i in range(N):
    # as mechas nascem numa volta da cabeça, menos na frente do rosto (±75°): a = 0 é a frente (-y)
    a = math.radians(75) + (math.radians(285) - math.radians(75)) * i / (N - 1)
    back = -math.cos(a)  # 1 atrás, -1 na frente
    root = hc + Vector((math.sin(a) * 0.115 * H, -math.cos(a) * 0.12 * H + 0.008 * H, 0.035 * H))  # nasce por baixo da aba do boné
    out = Vector((math.sin(a), -math.cos(a), 0))
    ln = (0.43 + 0.06 * random.random() + 0.06 * max(0.0, back)) * H
    ph_ = random.random() * TAU
    pts, rs = [], []
    for j in range(10):
        t = j / 9
        wave = math.sin(t * 10 + ph_) * 0.02 * H * (0.3 + t)  # as ondas, mais soltas nas pontas
        swell = 0.055 * H * smoothstep(0.12, 0.75, t)  # cai rente do alto da cabeça e abre embaixo, sobre os ombros
        p = root + out * (swell + 0.004 * H) + Vector((0, 0, -ln * t)) + Vector((-out.y, out.x, 0)) * wave
        if back < -0.1:  # as mechas da frente (emoldurando o rosto) caem na frente dos ombros
            p += Vector((0, -0.06 * H * smoothstep(0.2, 1.0, t), 0))
        pts.append(p)
        side_ = abs(math.sin(a))  # dos lados (têmporas e orelhas) o cabelo é mais cheio
        rs.append((0.034 + 0.008 * side_ - 0.02 * t) * H)
    HS.chain(pts, rs, step=0.5)
b.add('hair', HS.mesh(res=0.006, smooth=3, disp=lambda p: 0.004 * H * (ridge(math.atan2(p.x - hc.x, p.y - hc.y) * 18 + p.z / H * 6 + n3(p, 25), 2) - 0.4), target=4000), hairm, region='body',
      weight_fn=lambda p: {'hd': lim((p.z - (hc.z - 0.2 * H)) / (0.12 * H)), 'neck': 1 - lim((p.z - (hc.z - 0.2 * H)) / (0.12 * H))}, subdiv=0)

# ================================================================ BONÉ AMARELO virado para trás, com as marcas pretas
def cap_keep(p):
    q = p - hc
    return q.z / H > 0.055 - 0.02 * (q.y / H)


crown = b.add('cap', clothe(part('head'), cap_keep, 0.02 * H, cuts=0), yellow, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
cb = around('head', hc, hc.z + 0.052 * H, 0.02 * H, n=28)
if len(cb) > 8:
    b.add('capBand', rod(cb, 0.008 * H, 6, caps=False), yellow, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
# a ABA atrás (um pouco de lado e levantada): uma lâmina curva grossa
brim = Sculpt()
bo = hc + Vector((-0.04 * H, 0.17 * H, 0.055 * H))
for t in [k / 8 for k in range(9)]:
    a = (t - 0.5) * 1.6
    p = bo + Vector((math.sin(a) * 0.1 * H, 0.06 * H * math.cos(a) * 0.9, 0.012 * H + 0.01 * H * abs(a)))
    brim.ell(p, (0.034 * H, 0.05 * H, 0.011 * H))
b.add('capBrim', brim.mesh(res=0.004, smooth=3, target=700), yellow, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
# o botão do topo e as marcas pretas (riscos em triângulo) coladas na copa, frente e lados
mk = [rod([hc + Vector((0, 0, 0.18 * H)), hc + Vector((0, 0, 0.165 * H))], 0.012 * H, 8)]
for s, a0 in ((0, 0.0), (1, 0.5), (-1, -0.5)):
    pts = []
    for j in range(4):  # um zigue-zague de 3 dentes
        a = a0 + (j - 1.5) * 0.12
        z = hc.z + (0.1 if j % 2 else 0.135) * H
        d = Vector((math.sin(a), -math.cos(a), 0.25)).normalized()
        q = surf('head', hc + Vector((0, 0, z - hc.z)) + d * 0.6 * H, -d, 0.024 * H)
        if q:
            pts.append(q)
    if len(pts) > 2:
        mk.append(rod(pts, 0.006 * H, 4))
capmark = material('cap_mark', '#141414', 0.6)
b.add('capMarks', merge(*mk), capmark, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'xande.blend'), check_existing=False)
