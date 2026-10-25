"""
BALU (Antônio Pontevedra) — public/models/balu.glb. Refeito com a técnica atual (sculpt_lib: roupa a partir do corpo,
metaballs, relevo, peças coladas na superfície por raio), a partir da ARTE OFICIAL "Miniatura Antônio em Calamidade"
(wiki "Balu") e do texto da wiki. Ex-agente veterano da Ordo Realitas, 1,90 m, grande e pesado (gosta de comer).

Referência (de cima a baixo):
  - cabelo preto VOLUMOSO, todo penteado para trás com gel, num topete redondo e alto que avança sobre a testa;
    sobrancelhas grossas; BIGODE grosso e cheio; cavanhaque curto só no meio do queixo; sem a orelha DIREITA (arrancada
    por um Titã de Sangue — a cicatriz em espiral da Cicatrização do Dante está pintada na textura do rosto);
  - pescoço grosso e curto; polo VERDE-ACINZENTADA folgada, gola larga deitada e aberta em V com a carcela de dois botões,
    mangas curtas e largas até o meio do bíceps; a barriga redonda empurra a polo por cima do cinto;
  - antebraços fortes e peludos (textura); cinto marrom com a fivela do Amuleto de Proteção Elemental (textura);
  - jeans azul-acinzentado com dobras; mocassim marrom de sola escura.
O Machado Lancinante (pomo de pantera) e o Machado Demônio (maça de sangue) continuam em código (weapons.js).
  node tools/blender/build.mjs balu   → public/models/balu.glb (+ tools/blender/fonte/balu.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'balu.glb'
random.seed(1190)

b = Builder(width=1.06, bulk=1.26, height=1.05)  # 1,90 m, largo e pesado
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_balu', '#c8946e', 0.8)
shirt = material('shirt_balu', '#ffffff', 0.85)  # polo verde (textura)
arms = material('arms_balu', '#ffffff', 0.8)  # antebraços peludos (textura)
jeans = material('jeans_balu', '#ffffff', 0.9)  # jeans azul-acinzentado (textura)
collar_m = material('collar_balu', '#86ad88', 0.85)  # gola e barras no verde da polo
placket = material('placket_balu', '#6f9a72', 0.85)
button = material('button_balu', '#e8e4d8', 0.4)
beltm = material('belt_balu', '#5a3a20', 0.7)
buckle = material('amulet_balu', '#ffffff', 0.4, metal=0.6)  # fivela com veias vermelhas (textura)
shoes = material('shoe_balu', '#6a4024', 0.55)
sole = material('sole_balu', '#2e1c10', 0.8)
hairm = material('hair_balu', '#141114', 0.45)
stache = material('stache_balu', '#1a1412', 0.7)
M = {
    'skin': skin,
    'face': material('face_balu', '#ffffff', 0.8),
    'torso': shirt,
    'arm': arms,
    'hand': skin,
    'legs': jeans,
    'feet': shoes,
}
PREVIEW = {'shirt_balu': '#8fb391', 'arms_balu': '#c8946e', 'jeans_balu': '#7f9aa8', 'face_balu': '#c8946e', 'amulet_balu': '#b8a070'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

# tronco grande: barriga redonda, peito e ombros largos
TP = [(-0.12, 0.205), (0.0, 0.215), (0.12, 0.238), (0.24, 0.252), (0.36, 0.268), (0.46, 0.278), (0.54, 0.262), (0.6, 0.15), (0.66, 0.088)]
hc = b.body(M, TP, arm_r=(0.088, 0.08, 0.062), leg_r=(0.118, 0.094, 0.068), head_r=(0.148, 0.158, 0.17), neck_r=0.088, feet='bare')

# sem a orelha direita (-x): a cicatriz em espiral é pintada na textura do rosto
for o in list(b.parts):
    try:
        if o.name.startswith('ear-1'):
            bpy.data.objects.remove(o, do_unlink=True)
    except ReferenceError:
        pass


def alive(o):
    try:
        return bool(o.name)
    except ReferenceError:
        return False


b.parts = [o for o in b.parts if alive(o)]


def part(name):
    return next(o for o in b.parts if o.name == name)


def W(reg):
    return lambda p: auto_weights(sk, p, reg)


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
    hit = bvh(name).ray_cast(Vector(origin), Vector(direction).normalized())
    if hit[0] is None:
        return None
    return hit[0] + hit[1] * off


def front(name, x, z, off=0.0, back=False):
    s = 1 if back else -1
    return surf(name, Vector((x, s * 0.6 * H, z)), Vector((0, -s, 0)), off)


def around(name, z, off, n=40):
    """anel colado na superfície em volta do tronco na altura z (raios de fora para o eixo)"""
    pts = []
    for i in range(n + 1):
        a = i / n * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = surf(name, Vector((0, 0, z)) + d * 0.6 * H, -d, off)
        if q:
            pts.append(q)
    return pts


tor = part('torso')
# ================================================================ a BARRIGA redonda (gosta de comer): o tronco estufa na frente, abaixo do peito
relief(tor, lambda p: 0.12 * H * math.exp(-((p.z - (hz + 0.19 * H)) / (0.16 * H)) ** 2) * max(0.0, -p.y / (0.2 * H)) ** 1.3 * math.exp(-(p.x / (0.22 * H)) ** 2))
# a POLO folgada: dobras largas no tecido
relief(tor, lambda p: 0.006 * H * (ridge(p.z / H * 12 + n3(p, 7) * 1.6, 2) - 0.4) if p.z > hz + 0.1 * H else 0.0)
# a barra da polo caindo por cima do cinto (a barriga) — uma saia curta feita do próprio tronco
b.add('shirtHem', clothe(tor, lambda p: hz + 0.07 * H < p.z < hz + 0.2 * H, 0.012 * H, cuts=1), shirt, region='body', weight_fn=W('torso'), subdiv=0)

# as MANGAS curtas e largas até o meio do bíceps, com a barra dobrada no verde da gola
for side in ('L', 'R'):
    arm = part('arm' + side)
    s_, e_ = sk['s' + side], sk['e' + side]
    zc = s_.lerp(e_, 0.55).z
    sl = b.add('sleeve' + side, clothe(arm, lambda p, zc=zc: p.z > zc, 0.012 * H, cuts=1), shirt, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(sl, lambda p: 0.006 * H * (ridge(p.z / H * 20 + n3(p, 9), 2) - 0.4))
    c = s_.lerp(e_, 0.55)
    ax = (e_ - s_).normalized()
    u = ax.orthogonal().normalized()
    v = ax.cross(u)
    ring = []
    for k in range(25):
        a = k / 24 * TAU
        d = u * math.cos(a) + v * math.sin(a)
        q = surf('sleeve' + side, c + d * 0.5 * H, -d, 0.008 * H)
        ring.append(q if q else c + d * 0.1 * H)
    b.add('sleeveHem' + side, rod(ring, 0.016 * H, 6, caps=False), collar_m, region='body', weight_fn=W('arm' + side), subdiv=0)

# ================================================================ a GOLA da polo: faixa em volta do pescoço, as duas abas largas deitadas e
# abertas em V sobre o peito, a carcela com dois botões
neck = part('neck')
b.add('collarBand', clothe(neck, lambda p: p.z < top + 0.11 * H, 0.014 * H, cuts=1), collar_m, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
for s in (1, -1):
    # cada aba: placa LARGA que sai da faixa do pescoço, deita sobre o ombro e termina em ponta no peito
    pts = []
    for t in [k / 6 for k in range(7)]:
        x = s * (0.04 + 0.09 * t) * H
        z = top + 0.07 * H - 0.2 * H * t ** 1.2
        q = front('torso', x, z, 0.014 * H) or front('collarBand', x, z, 0.01 * H)
        if q:
            pts.append(q)
    if len(pts) > 2:
        b.add(f'collarFlap{s}', rod(pts, [0.05 * H, 0.065 * H, 0.07 * H, 0.064 * H, 0.05 * H, 0.03 * H, 0.008 * H][:len(pts)], 6, flat=(outward((0, 0)), 0.2)),
              collar_m, region='body', weight_fn=W('torso'), subdiv=0)
    # a parte de trás da aba, por cima do ombro
    back = [surf('torso', Vector((s * (0.05 + 0.05 * t) * H, 0.0, top + 0.4 * H)), Vector((0, 0, -1)), 0.012 * H) for t in [k / 4 for k in range(5)]]
    back = [q for q in back if q]
    if len(back) > 2:
        b.add(f'collarBack{s}', rod(back, 0.03 * H, 6, flat=(lambda p: Vector((0, 0, 1)), 0.25)), collar_m, region='body', weight_fn=W('torso'), subdiv=0)
pl = [front('torso', 0.0, top - z * H, 0.006 * H) for z in (0.06, 0.12, 0.18, 0.22)]
pl = [q for q in pl if q]
b.add('placket', rod(pl, 0.016 * H, 5, flat=(outward((0, 0)), 0.25)), placket, region='body', weight_fn=W('torso'), subdiv=0)
bt = [front('torso', 0.0, top - z * H, 0.014 * H) for z in (0.14, 0.2)]
b.add('poloButtons', merge(*[ellipsoid(tuple(q), (0.009 * H, 0.005 * H, 0.009 * H), 6, 4) for q in bt if q]), button, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ CINTO marrom com a fivela do Amuleto
bl = around('shirtHem', hz + 0.075 * H, 0.004 * H) or around('torso', hz + 0.075 * H, 0.016 * H)
b.add('belt', rod(bl, 0.022 * H, 6, caps=False, flat=(outward((0, 0)), 0.35)), beltm, region='body', weight_fn=W('torso'), subdiv=0)
bk = front('torso', 0.0, hz + 0.075 * H, 0.03 * H)
if bk:
    b.add('buckle', box(tuple(bk), (0.075 * H, 0.016 * H, 0.05 * H), bevel=0.005), buckle, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ JEANS: o quadril e as pernas com as dobras do tecido
b.add('jeansHip', clothe(tor, lambda p: p.z < hz + 0.075 * H, 0.008 * H, cuts=1), jeans, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    leg = part('leg' + side)
    f = sk['foot' + side]
    pl_ = b.add('jeans' + side, clothe(leg, lambda p, f=f: p.z > f.z + 0.09 * H, 0.012 * H, cuts=1), jeans, region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl_, lambda p: 0.006 * H * (ridge(p.z / H * 18 + n3(p, 9) * 1.5, 2) - 0.4))

# ================================================================ MOCASSIM marrom de bico arredondado e sola escura
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f = sk['foot' + side]
    heel = Vector((f.x, f.y + 0.04 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.165 * H, f.z + 0.006 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.014 * H)), toe], [0.054 * H, 0.056 * H, 0.046 * H], step=0.45)
    U.ell(toe + Vector((0, 0.01 * H, 0.008 * H)), (0.05 * H, 0.044 * H, 0.028 * H))
    U.chain([Vector((f.x, f.y + 0.014 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.01 * H, f.z + 0.08 * H))], [0.062 * H, 0.06 * H], step=0.45)
    b.add('shoe' + side, U.mesh(res=0.006, smooth=2, target=900), shoes, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.008 * H, -0.024 * H)), toe + Vector((0, -0.012 * H, -0.006 * H))], [0.06 * H, 0.054 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=500)
    so = ([(x, y, max(z, f.z - 0.036 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('sole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)
    # a tira do mocassim por cima do peito do pé
    tp = [surf('shoe' + side, Vector((f.x + (t - 0.5) * 0.12 * H, f.y - 0.07 * H, f.z + 0.4 * H)), Vector((0, 0, -1)), 0.003 * H) for t in [k / 6 for k in range(7)]]
    tp = [q for q in tp if q]
    if len(tp) > 2:
        b.add('shoeStrap' + side, rod(tp, 0.009 * H, 5, caps=False), sole, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CABELO preto volumoso penteado para trás com gel: a calota colada na cabeça,
# o TOPETE redondo e alto que avança sobre a testa e as mechas grossas varrendo da frente para a nuca
D = Sculpt()
HCv = Vector((hc.x, hc.y, hc.z))
for i in range(24):
    for j in range(7):
        a = i / 24 * TAU
        el = 0.22 + 0.62 * j / 6
        dd = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
        if dd.y < -0.4 and dd.z < 0.72:
            continue  # testa e rosto livres (a linha do cabelo é alta)
        if abs(dd.x) > 0.75 and dd.z < 0.35:
            continue  # sem cobrir a orelha
        q = surf('head', HCv + dd * 0.6 * H, -dd, 0.012 * H)
        if q:
            D.ell(q, (0.04 * H, 0.04 * H, 0.036 * H))
# o volume do alto (o gel segura o cabelo armado): uma cúpula cheia, bem acima do couro cabeludo
D.ell(HCv + Vector((0, 0.03 * H, 0.2 * H)), (0.16 * H, 0.17 * H, 0.09 * H))
D.ell(HCv + Vector((0, 0.03 * H, 0.135 * H)), (0.168 * H, 0.176 * H, 0.08 * H))  # liga o alto à calota (um volume só)
D.ell(HCv + Vector((0, 0.08 * H, 0.1 * H)), (0.155 * H, 0.13 * H, 0.11 * H))
# o TOPETE: rolo grosso de lado a lado na frente, alto e projetado sobre a testa (sem descer nas sobrancelhas)
for s in (-1, 0, 1):
    D.ell(HCv + Vector((s * 0.065 * H, -0.09 * H, 0.235 * H)), (0.08 * H, 0.075 * H, 0.065 * H))
# as mechas varrendo da linha do cabelo, por cima do topo, até a nuca
for i in range(13):
    x = (i - 6) / 6
    p0 = surf('head', Vector((hc.x + x * 0.11 * H, hc.y - 0.6 * H, hc.z + 0.16 * H)), Vector((0, 1, 0)), 0.03 * H)
    if not p0:
        continue
    pts = [p0 + Vector((0, 0, 0.03 * H))]
    for t in (0.3, 0.6, 0.85, 1.0):
        el = 1.1 - 1.2 * t
        d = Vector((x * 0.6, math.sin(t * 2.4) * 0.3 + 0.5 * t, math.cos(t * 1.4))).normalized()
        q = surf('head', HCv + d * 0.6 * H, -d, (0.06 - 0.03 * t) * H)
        if q:
            pts.append(q)
    D.chain(pts, [0.022 * H] * (len(pts) - 1) + [0.012 * H], step=0.5)
# a nuca cheia, cortada rente embaixo
for i in range(9):
    a = math.pi + (i - 4) * 0.22
    d = Vector((math.sin(a), -math.cos(a), 0.0))
    q = surf('head', Vector((hc.x, hc.y, hc.z - 0.02 * H)) + d * 0.6 * H, -d, 0.012 * H)
    if q:
        D.chain([q + Vector((0, 0, 0.1 * H)), q], [0.03 * H, 0.024 * H], step=0.5)
b.add('hair', D.mesh(res=0.005, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 70 + p.z / H * 10, 2) - 0.4), target=5000), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# ================================================================ BIGODE grosso e cheio, cavanhaque curto no meio do queixo, sobrancelhas grossas
F = Sculpt()
ml = [surf('head', Vector((hc.x + x * H, hc.y - 0.6 * H, hc.z - (0.062 + 0.03 * abs(x) / 0.07) * H)), Vector((0, 1, 0)), 0.012 * H) for x in (-0.075, -0.05, -0.025, 0.0, 0.025, 0.05, 0.075)]
ml = [q for q in ml if q]
if len(ml) > 2:
    F.chain(ml, [0.014 * H, 0.02 * H, 0.024 * H, 0.022 * H, 0.024 * H, 0.02 * H, 0.014 * H][:len(ml)], step=0.4)
gt = surf('head', Vector((hc.x, hc.y - 0.6 * H, hc.z - 0.15 * H)), Vector((0, 1, 0)), 0.006 * H)
if gt:
    F.ell(gt, (0.014 * H, 0.008 * H, 0.02 * H))
b.add('mustache', F.mesh(res=0.0035, smooth=2, disp=lambda p: 0.0012 * H * (ridge(p.x / H * 160, 2) - 0.4), target=1500), stache, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
for s in (1, -1):
    br = [surf('head', Vector((hc.x + x * s * H, hc.y - 0.6 * H, hc.z + (0.03 + 0.012 * math.sin(x / 0.08 * math.pi)) * H)), Vector((0, 1, 0)), 0.006 * H) for x in (0.02, 0.045, 0.07, 0.085)]
    br = [q for q in br if q]
    if len(br) > 1:
        b.add(f'brow{s}', rod(br, [0.009 * H, 0.011 * H, 0.01 * H, 0.006 * H][:len(br)], 5), stache, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'balu.blend'), check_existing=False)
