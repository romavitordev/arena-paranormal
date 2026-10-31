"""
GAIUS (Ordo Calamitas, 67 d.C.) — e, com a máscara da Relíquia de Energia, AMPHITRUO, o primeiro Anfitrião (a versão
transformada dele; o Anfitrião do Arnaldo continua com o visual do Arnaldo) — public/models/gaius.glb. Técnica atual (sculpt_lib), pela wiki "Amphitruo" e "Gaius": a arte de Arquivos Secretos, a
arte dos Anfitriões, a "Máscara de Amphitruo", as miniaturas de Calamidade (Gaius e Amphitruo) e a estátua de Gaius.
O primeiro portador conhecido da Relíquia de Energia é GAIUS (Ordo Calamitas, 67 d.C.), "um homem velho", consumido pela
Relíquia: "a fisionomia de Gaius, vestindo a mesma roupa — uma armadura com OMBREIRAS PONTUDAS que cobrem até o pescoço,
leves detalhes roxos nas laterais; por cima, um PANO no peitoral com o Símbolo da Ordo Calamitas e uma grande CAPA ROXA
com CAPUZ, dos ombros até os pés, derramando-se sobre o chão". Nas miniaturas: as CORDAS enroladas no tronco, a SAIA de
pano roxo, as braçadeiras de placas prateadas, a pele morena dos braços e as botas com grevas.
Gaius: "um homem velho, de cabelo curto e barba, ambos grisalhos", o capuz levantado. A MAÇA de ferro, a MÁSCARA
sorridente com as três mãos de metal (Amphitruo) e as CHAMAS roxas ficam em código (models/weapons.js → ironMace /
amphitruoMask; models/props.js → addGaiusProps / addAmphitruoProps).
  node tools/blender/build.mjs gaius   → public/models/gaius.glb (+ tools/blender/fonte/gaius.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'gaius.glb'
random.seed(67)

b = Builder(width=0.98, bulk=0.96, height=1.08)  # alto e largo de ombros (o velho guerreiro)
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_amphitruo', '#a87858', 0.7)
under = material('under_amphitruo', '#24222a', 0.85)
armor = material('armor_amphitruo', '#7a7e88', 0.32, metal=0.75)
armor_d = material('armor_amphitruo_dark', '#45474e', 0.4, metal=0.6)
purple = material('purple_amphitruo', '#5a3888', 0.85)
purple_d = material('purple_amphitruo_in', '#341f52', 0.9)
rope = material('rope_amphitruo', '#b8a888', 0.9)
leather = material('leather_amphitruo', '#2a2018', 0.6)
boots = material('boots_amphitruo', '#1c1a20', 0.55)
sole = material('sole_amphitruo', '#121014', 0.8)
tabard = material('tabard_amphitruo', '#ffffff', 0.9)  # o pano do peito com o Símbolo (textura)
M = {
    'skin': skin,
    'face': material('face_gaius', '#ffffff', 0.75),  # o rosto velho (textura); no Amphitruo a máscara cobre
    'torso': skin,
    'arm': skin,
    'hand': skin,
    'legs': under,
    'feet': boots,
}
PREVIEW = {'tabard_amphitruo': '#4a3a62', 'face_gaius': '#a87858'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.115, 0.17), (0.0, 0.164), (0.17, 0.15), (0.36, 0.19), (0.47, 0.205), (0.57, 0.112), (0.63, 0.066)]
hc = b.body(M, TP, arm_r=(0.064, 0.054, 0.044), leg_r=(0.09, 0.07, 0.056), head_r=(0.12, 0.13, 0.15), feet='bare')


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
    return None if hit[0] is None else hit[0] + hit[1] * off


def front(name, x, z, off=0.0):
    return surf(name, Vector((x, -0.6 * H, z)), Vector((0, 1, 0)), off)


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


tor = part('torso')

# ================================================================ a roupa de baixo escura e a ARMADURA do tronco (placas)
b.add('under', clothe(tor, lambda p: hz - 0.02 * H < p.z < top + 0.03 * H, 0.008 * H, cuts=2), under, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    f = sk['foot' + side]
    pl = b.add('pants' + side, clothe(part('leg' + side), lambda p, f=f: p.z > f.z + 0.2 * H, 0.018 * H, cuts=1), under, region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.004 * H * (ridge(p.z / H * 14 + n3(p, 9) * 1.4, 2) - 0.4))
cuirass = b.add('cuirass', clothe(tor, lambda p: hz + 0.08 * H < p.z < top - 0.02 * H, 0.03 * H, cuts=2), armor, region='body', weight_fn=W('torso'), subdiv=0)
# as placas em faixas horizontais (a lorica), com o friso de cada uma
relief(cuirass, lambda p: 0.006 * H * (ridge(p.z / H * 22, 3) - 0.3))
# mangas escuras até o cotovelo e as BRAÇADEIRAS de placas prateadas nos antebraços (a arte dos Anfitriões)
for side in ('L', 'R'):
    e_, h_ = sk['e' + side], sk['hand' + side]
    b.add('sleeve' + side, clothe(part('arm' + side), lambda p, e_=e_: p.z > e_.z + 0.02 * H, 0.01 * H, cuts=1), under, region='body', weight_fn=W('arm' + side), subdiv=0)
    br = b.add('bracer' + side, clothe(part('arm' + side), lambda p, e_=e_, h_=h_: h_.z + 0.03 * H < p.z < e_.z + 0.01 * H, 0.02 * H, cuts=1), armor, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(br, lambda p: 0.004 * H * (ridge(p.z / H * 26, 3) - 0.3))

# ================================================================ as OMBREIRAS PONTUDAS que sobem até o pescoço, com o friso roxo
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh = sk['s' + side]
    P = Sculpt()
    base = sh + Vector((s * 0.02 * H, 0.0, 0.035 * H))
    # a placa grande sobre o ombro e a PONTA que sobe por fora, à altura do pescoço
    P.ell(base, (0.09 * H, 0.1 * H, 0.04 * H))
    P.chain([base + Vector((s * 0.03 * H, 0, 0.0)), base + Vector((s * 0.05 * H, 0, 0.09 * H)), base + Vector((s * 0.035 * H, 0.0, 0.19 * H))],
            [0.07 * H, 0.045 * H, 0.008 * H], step=0.4)
    b.add('pauldron' + side, P.mesh(res=0.004, smooth=2, target=1200), armor, region='body', weight_fn=lambda p, s=s: {('sL' if s > 0 else 'sR'): 0.6, 'chest': 0.4}, subdiv=0)
    trim = Sculpt()
    trim.chain([base + Vector((s * 0.085 * H, -0.06 * H, -0.03 * H)), base + Vector((s * 0.095 * H, 0.0, -0.025 * H)), base + Vector((s * 0.085 * H, 0.06 * H, -0.03 * H))], [0.012 * H] * 3, step=0.4)
    b.add('pauldronTrim' + side, trim.mesh(res=0.003, smooth=1, target=300), purple, region='body', weight_fn=lambda p, s=s: {('sL' if s > 0 else 'sR'): 0.6, 'chest': 0.4}, subdiv=0)

# ================================================================ o CINTO e as CORDAS enroladas no tronco (as miniaturas)
b.add('belt', clothe(tor, lambda p: hz + 0.0 * H < p.z < hz + 0.05 * H, 0.04 * H, cuts=1), leather, region='body', weight_fn=W('torso'), subdiv=0)
cords = []
for k, (z0, tilt) in enumerate(((hz + 0.12 * H, 0.05), (hz + 0.18 * H, -0.04), (hz + 0.25 * H, 0.06))):
    pts = []
    for i in range(33):
        a = i / 32 * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        z = z0 + tilt * H * math.sin(a)
        q = surf('cuirass', Vector((0, 0, z)) + d * 0.6 * H, -d, 0.008 * H)
        if q:
            pts.append(q)
    if len(pts) > 6:
        cords.append(rod(pts + [pts[0]], [0.011 * H] * (len(pts) + 1), 5))
b.add('cords', merge(*cords), rope, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ o PANO DO PEITO com o Símbolo da Ordo Calamitas (cai até os joelhos)
Z_TOP, Z_BELT, Z_BOT = top - 0.07 * H, hz + 0.02 * H, hz - 0.5 * H
HALF = 0.09 * H
verts, faces, uvs = [], [], []
NX, NZ = 6, 22
belt_y = {}
for j in range(NZ + 1):
    t = j / NZ
    z = Z_TOP + (Z_BOT - Z_TOP) * t
    for i in range(NX + 1):
        u = i / NX
        x = (u - 0.5) * 2 * HALF * (1 + max(0.0, (Z_BELT - z) / H) * 0.6)
        if z >= Z_BELT:
            q = None
            for name in ('cuirass', 'belt', 'cords'):
                h = front(name, x, z, 0.012 * H)
                if h and (q is None or h.y < q.y):
                    q = h
            q = q or Vector((x, -0.15 * H, z))
            belt_y[i] = q.y
        else:
            q = Vector((x, belt_y.get(i, -0.15 * H) - 0.01 * H - (Z_BELT - z) * 0.1, z))
        verts.append(tuple(q))
        uvs.append((u, 1 - t))
row = NX + 1
for j in range(NZ):
    for i in range(NX):
        a = j * row + i
        faces.append((a, a + 1, a + 1 + row, a + row))


def hang_w(p):
    if p.z > Z_BELT:
        return W('torso')(p)
    k = min(1.0, (Z_BELT - p.z) / (0.35 * H))
    side = 'lL' if p.x > 0 else 'lR'
    return {'hips': 1 - 0.45 * k, side: 0.45 * k}


b.add('tabard', (verts, faces, uvs), tabard, region='body', weight_fn=hang_w, subdiv=0)

# ================================================================ a SAIA de pano roxo (atrás e dos lados), da cintura ao meio da canela
def skirt_pt(u, v, out=1.0):
    a = (u - 0.5) * TAU * 0.78 + math.pi  # dá a volta por trás, deixando a frente para o pano
    z = hz + 0.03 * H - v * 0.62 * H
    r = 0.2 * H + v * 0.08 * H
    return Vector((math.sin(a) * r * 1.05 * out, -math.cos(a) * r * 0.85 * out, z))


b.add('skirt', grid(skirt_pt, 28, 10), purple, region='body', weight_fn=hang_w, subdiv=0)
b.add('skirt_in', grid(lambda u, v: skirt_pt(u, v, 0.985), 28, 10, flip=True), purple_d, region='body', weight_fn=hang_w, subdiv=0)

# ================================================================ a GRANDE CAPA ROXA com CAPUZ, dos ombros até o chão, derramando no piso
GAP = 0.2  # fração da volta aberta na frente


def cape_pt(u, v, out=1.0):
    a = (GAP / 2 + u * (1 - GAP)) * TAU  # 0 = frente; dá a volta por trás
    z = top + 0.02 * H - v * (top + 0.02 * H)
    t = v
    w = 0.29 * H + 0.16 * H * t ** 1.3  # larga nos ombros (as ombreiras por baixo) e abrindo em sino
    d = 0.17 * H + 0.22 * H * t ** 1.3
    p = Vector((math.sin(a) * w * out, -math.cos(a) * d * out + 0.03 * H, max(z, 0.004 * H)))
    if v > 0.97:  # a barra derrama no chão, para trás
        p.y += (v - 0.97) * 3.0 * H * max(0.0, -math.cos(a))
    return p


def cape_w(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.7 * H, p.z) * 0.25
    w_hip = smoothstep(hz + 0.35 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


b.add('cape', grid(cape_pt, 40, 26), purple, region='body', weight_fn=cape_w, subdiv=0)
b.add('cape_in', grid(lambda u, v: cape_pt(u, v, 0.985), 40, 26, flip=True), purple_d, region='body', weight_fn=cape_w, subdiv=0)
# a gola grossa da capa em volta do pescoço (onde o capuz nasce)
S = Sculpt()
nk = sk['neck']
for i in range(24):
    a = i / 24 * TAU
    S.ell(Vector((nk.x + math.sin(a) * 0.11 * H, nk.y - math.cos(a) * 0.1 * H + 0.01 * H, top + 0.02 * H)), (0.05 * H, 0.05 * H, 0.04 * H))
b.add('collar', S.mesh(res=0.005, smooth=2, target=1800), purple, region='body', weight_fn=lambda p: {'neck': 0.5, 'chest': 0.5}, subdiv=0)

# o CAPUZ: aberto na frente (a máscara aparece), caindo sobre a gola
HC = Vector((hc.x, hc.y + 0.01 * H, hc.z + 0.012 * H))
HR = (0.16 * H, 0.17 * H, 0.19 * H)
OPEN = 0.3


def hood_pt(u, v, out=1.0):
    a = (OPEN / 2 + u * (1 - OPEN)) * TAU
    el = math.pi / 2 - v * math.pi * 0.8
    r = math.cos(el)
    x = math.sin(a) * r * HR[0]
    y = -math.cos(a) * r * HR[1]
    z = math.sin(el) * HR[2]
    p = HC + Vector((x, y, z)) * out
    if v > 0.55:
        k = (v - 0.55) / 0.45
        p += Vector((x, y, 0)).normalized() * k * 0.06 * H
    p.y += 0.02 * H
    return p


b.add('hood', grid(hood_pt, 30, 12), purple, region='head', subdiv=0)
b.add('hood_in', grid(lambda u, v: hood_pt(u, v, 0.96), 30, 12, flip=True), purple_d, region='head', subdiv=0)

# ================================================================ o CABELO curto e a BARBA grisalhos (o velho Gaius)
hairm = material('hair_gaius', '#7e7a76', 0.75)  # grisalho (o claro demais virava branco na luz)
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


C = Sculpt()
for i in range(22):
    a = i / 22 * TAU
    for el in (0.3, 0.6, 0.95, 1.25):
        if el < 0.65 and math.cos(a) > 0.4:
            continue  # a testa livre
        q = on_head(a, el, -0.012 * H)
        if q:
            C.ell(q, (0.03 * H, 0.03 * H, 0.022 * H))
b.add('hair', C.mesh(res=0.004, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.x / H * 80 + p.z / H * 40, 2) - 0.4), target=2600), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
# a barba curta e cheia: do queixo às costeletas
B = Sculpt()
for i in range(15):
    a = -1.0 + i / 14 * 2.0  # de uma mandíbula à outra, por baixo
    for el in (-0.5, -0.75):  # só o queixo e a mandíbula: a boca e as bochechas ficam livres
        q = on_head(a, el, -0.014 * H)
        if q:
            B.ell(q, (0.018 * H, 0.016 * H, 0.02 * H))
mq = on_head(0.0, -0.95, 0.0)
if mq:
    B.ell(mq + Vector((0, -0.006 * H, -0.004 * H)), (0.034 * H, 0.026 * H, 0.03 * H))
b.add('beard', B.mesh(res=0.004, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 60 + p.z / H * 90, 2) - 0.4), target=2000), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# ================================================================ BOTAS com as GREVAS prateadas
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f = sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.008 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.01 * H)), toe], [0.05 * H, 0.052 * H, 0.042 * H], step=0.45)
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.14 * H)), Vector((f.x, f.y + 0.004 * H, f.z + 0.22 * H))], [0.064 * H, 0.064 * H, 0.068 * H], step=0.45)
    b.add('boot' + side, U.mesh(res=0.006, smooth=2, target=1100), boots, region='body', weight_fn=W('k' + side), subdiv=0)
    S2 = Sculpt()
    S2.chain([heel + Vector((0, 0.008 * H, -0.022 * H)), toe + Vector((0, -0.01 * H, -0.006 * H))], [0.057 * H, 0.05 * H], step=0.35)
    so = S2.mesh(res=0.006, smooth=2, target=500)
    so = ([(x, y, max(z, f.z - 0.04 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('bootSole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)
    gq = front('leg' + side, f.x, f.z + 0.2 * H, 0.03 * H)
    if gq:
        gv = Sculpt()
        gv.ell(gq, (0.045 * H, 0.018 * H, 0.1 * H))
        b.add('greave' + side, gv.mesh(res=0.004, smooth=2, target=400), armor, region='body', weight_fn=W('k' + side), subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'gaius.blend'), check_existing=False)
