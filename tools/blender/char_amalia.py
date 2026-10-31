"""
AMALIA (Ordo Calamitas, Calamidade) — public/models/amalia.glb. Técnica atual (sculpt_lib), pela wiki "Amalia" (a
miniatura de Calamidade, o retrato, a estátua) e a descrição: "uma mulher negra com cabelos cacheados escuros; uma espécie
de VESTIDO com um MANTO VERDE, FIVELAS que seguiam até o pescoço, um CACHECOL, OMBREIRAS METÁLICAS PONTUDAS e o Símbolo da
Ordo Calamitas no peito; uma grande CICATRIZ EM CRUZ no rosto" (a cicatriz e os olhos acesos ficam na textura face_amalia).
De cima a baixo: o CAPUZ verde (os cachos escapando na testa), o cachecol escuro enrolado, as ombreiras pontudas de metal,
o vestido verde-escuro com o pano do Símbolo, as CORREIAS cruzadas com as fivelas subindo até o pescoço, o manto verde
caindo atrás, a ALJAVA nas costas, a calça justa e as botas.
O ARCO verde de pontas brancas (wiki "Arsenal") e as chamas ciano da aura ficam em código (models/weapons.js amaliaBow,
models/props.js addAmaliaProps).
  node tools/blender/build.mjs amalia   → public/models/amalia.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'amalia.glb'
random.seed(1067)

b = Builder(width=0.9, bulk=0.9, height=0.95)  # ~1,70 m, esguia (arqueira)
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_amalia', '#5e3c2c', 0.7)
dress = material('dress_amalia', '#2c4a34', 0.88)
green = material('mantle_amalia', '#3a6a44', 0.88)
green_d = material('mantle_amalia_in', '#1c3022', 0.9)
pants = material('pants_amalia', '#22262a', 0.85)
armor = material('armor_amalia', '#4c4e56', 0.35, metal=0.7)
scarf = material('scarf_amalia', '#1a1c1e', 0.95)
leather = material('leather_amalia', '#2a2018', 0.6)
buckle = material('buckle_amalia', '#a8a8b0', 0.3, metal=0.85)
boots = material('boots_amalia', '#1c1a1e', 0.55)
sole = material('sole_amalia', '#121014', 0.8)
hairm = material('hair_amalia', '#16100e', 0.6)
tabard = material('tabard_amalia', '#ffffff', 0.9)  # o pano do peito com o Símbolo (textura)
fletch = material('fletch_amalia', '#e8ece6', 0.8)
M = {
    'skin': skin,
    'face': material('face_amalia', '#ffffff', 0.75),
    'torso': skin,
    'arm': skin,
    'hand': skin,
    'legs': pants,
    'feet': boots,
}
PREVIEW = {'face_amalia': '#5e3c2c', 'tabard_amalia': '#2c3a30'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.115, 0.164), (0.0, 0.158), (0.17, 0.118), (0.36, 0.162), (0.47, 0.17), (0.57, 0.102), (0.63, 0.06)]
hc = b.body(M, TP, arm_r=(0.056, 0.046, 0.039), leg_r=(0.082, 0.064, 0.05), head_r=(0.13, 0.14, 0.154), feet='bare')


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


def frontmost(names, x, z, off):
    best = None
    for name in names:
        q = front(name, x, z, off)
        if q and (best is None or q.y < best.y):
            best = q
    return best


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
HEAD = lambda p: {'hd': 1.0}

# ================================================================ o VESTIDO verde-escuro (tronco e saia até o joelho), mangas e calça
b.add('dressTop', clothe(tor, lambda p: hz - 0.02 * H < p.z < top + 0.03 * H, 0.01 * H, cuts=2), dress, region='body', weight_fn=W('torso'), subdiv=0)
BS = Sculpt()
for s in (1, -1):
    q = front('torso', s * 0.054 * H, top - 0.17 * H, 0.0)
    if q:
        BS.ell(q + Vector((0, 0.012 * H, -0.006 * H)), (0.05 * H, 0.038 * H, 0.044 * H))
b.add('bust', BS.mesh(res=0.004, smooth=2, target=800), dress, region='body', weight_fn=lambda p: {'chest': 1.0}, subdiv=0)
for side in ('L', 'R'):
    e_ = sk['e' + side]
    b.add('sleeve' + side, clothe(part('arm' + side), lambda p, e_=e_: p.z > e_.z - 0.06 * H, 0.01 * H, cuts=1), dress, region='body', weight_fn=W('arm' + side), subdiv=0)
    f = sk['foot' + side]
    b.add('pants' + side, clothe(part('leg' + side), lambda p, f=f: p.z > f.z + 0.2 * H, 0.012 * H, cuts=1), pants, region='body', weight_fn=W('leg' + side), subdiv=0)


def skirt_pt(u, v, out=1.0):
    a = u * TAU
    z = hz + 0.04 * H - v * 0.5 * H
    r = 0.165 * H + v * 0.09 * H
    fold = 1 + 0.05 * math.sin(u * TAU * 9) * v
    return Vector((math.sin(a) * r * 1.05 * out * fold, -math.cos(a) * r * 0.82 * out * fold, z))


def hang_w(p):
    k = min(1.0, max(0.0, (hz - p.z) / (0.35 * H)))
    side = 'lL' if p.x > 0 else 'lR'
    return {'hips': 1 - 0.45 * k, side: 0.45 * k}


b.add('skirt', grid(skirt_pt, 36, 10), dress, region='body', weight_fn=hang_w, subdiv=0)
b.add('skirt_in', grid(lambda u, v: skirt_pt(u, v, 0.98), 36, 10, flip=True), green_d, region='body', weight_fn=hang_w, subdiv=0)

# ================================================================ o PANO DO PEITO com o Símbolo (do peito até um pouco abaixo do cinto)
Z_TOP, Z_BOT = top - 0.08 * H, hz - 0.12 * H
HALF = 0.075 * H
verts, faces, uvs = [], [], []
NX, NZ = 6, 14
for j in range(NZ + 1):
    t = j / NZ
    z = Z_TOP + (Z_BOT - Z_TOP) * t
    for i in range(NX + 1):
        u = i / NX
        x = (u - 0.5) * 2 * HALF
        q = frontmost(('dressTop', 'bust', 'skirt'), x, z, 0.012 * H) or Vector((x, -0.13 * H, z))
        verts.append(tuple(q))
        uvs.append((u, 1 - t))
row = NX + 1
for j in range(NZ):
    for i in range(NX):
        a = j * row + i
        faces.append((a, a + 1, a + 1 + row, a + row))
b.add('tabard', (verts, faces, uvs), tabard, region='body', weight_fn=lambda p: W('torso')(p) if p.z > hz else hang_w(p), subdiv=0)

# ================================================================ as CORREIAS cruzadas no peito, o cinto e as FIVELAS subindo até o pescoço
straps = []
for s in (1, -1):
    pts = []
    for k in range(9):
        t = k / 8
        q = frontmost(('tabard', 'dressTop', 'bust'), s * (0.12 - 0.24 * t) * H, top - 0.02 * H - t * 0.36 * H, 0.008 * H)
        if q:
            pts.append(q)
    if len(pts) > 3:
        straps.append(rod(pts, [0.011 * H] * len(pts), 5, flat=(lambda p: Vector((0, -1, 0)), 0.35)))
b.add('straps', merge(*straps), leather, region='body', weight_fn=W('torso'), subdiv=0)
bks = []
for k in range(4):
    q = frontmost(('tabard', 'dressTop'), 0.045 * H, top - 0.03 * H - k * 0.06 * H, 0.012 * H)
    if q:
        bks.append(ellipsoid(tuple(q), (0.014 * H, 0.006 * H, 0.01 * H), 8, 5))
b.add('buckles', merge(*bks), buckle, region='body', weight_fn=W('torso'), subdiv=0)
b.add('belt', clothe(tor, lambda p: hz + 0.0 * H < p.z < hz + 0.04 * H, 0.03 * H, cuts=1), leather, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ as OMBREIRAS METÁLICAS PONTUDAS (a ponta sobe por fora) e as braçadeiras de couro
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh = sk['s' + side]
    P = Sculpt()
    base = sh + Vector((s * 0.02 * H, 0.0, 0.03 * H))
    P.ell(base, (0.075 * H, 0.085 * H, 0.034 * H))
    P.chain([base + Vector((s * 0.03 * H, 0, 0.0)), base + Vector((s * 0.06 * H, 0, 0.06 * H)), base + Vector((s * 0.08 * H, 0.0, 0.13 * H))],
            [0.055 * H, 0.032 * H, 0.006 * H], step=0.4)
    b.add('pauldron' + side, P.mesh(res=0.004, smooth=2, target=1000), armor, region='body', weight_fn=lambda p, s=s: {('sL' if s > 0 else 'sR'): 0.6, 'chest': 0.4}, subdiv=0)
    e_, h_ = sk['e' + side], sk['hand' + side]
    br = b.add('bracer' + side, clothe(part('arm' + side), lambda p, e_=e_, h_=h_: h_.z + 0.02 * H < p.z < e_.z - 0.04 * H, 0.014 * H, cuts=1), leather, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(br, lambda p: 0.003 * H * (ridge(p.z / H * 30, 3) - 0.3))

# ================================================================ o CACHECOL escuro enrolado no pescoço
S = Sculpt()
nk = sk['neck']
for i in range(24):
    a = i / 24 * TAU
    r = 0.098 * H + 0.01 * H * math.sin(a * 3)
    S.ell(Vector((nk.x + math.sin(a) * r, nk.y - math.cos(a) * r * 0.9, top + 0.025 * H + 0.012 * H * math.cos(a * 2))), (0.046 * H, 0.046 * H, 0.042 * H))
for i in range(20):
    a = i / 20 * TAU
    S.ell(Vector((nk.x + math.sin(a) * 0.072 * H, nk.y - math.cos(a) * 0.066 * H + 0.01 * H, top + 0.055 * H)), (0.032 * H, 0.032 * H, 0.028 * H))
b.add('scarf', S.mesh(res=0.005, smooth=2, disp=lambda p: 0.004 * H * (ridge(math.atan2(p.x, -p.y) * 5 + p.z / H * 20 + n3(p, 6), 2) - 0.4), target=2400),
      scarf, region='body', weight_fn=lambda p: {'neck': 0.6, 'chest': 0.4}, subdiv=0)

# ================================================================ o MANTO VERDE caindo atrás (dos ombros até a panturrilha)
GAP = 0.36


def cape_pt(u, v, out=1.0):
    a = (GAP / 2 + u * (1 - GAP)) * TAU
    z = top + 0.02 * H - v * (top + 0.02 * H - 0.25 * H)
    w = 0.24 * H + 0.08 * H * v ** 1.2
    d = 0.15 * H + 0.12 * H * v ** 1.2
    fold = 1 + 0.035 * math.sin(u * TAU * 7) * v
    return Vector((math.sin(a) * w * out * fold, -math.cos(a) * d * out * fold + 0.03 * H, z))


def cape_w(p):
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.7 * H, p.z) * 0.25
    w_hip = smoothstep(hz + 0.35 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}


b.add('cape', grid(cape_pt, 34, 20), green, region='body', weight_fn=cape_w, subdiv=0)
b.add('cape_in', grid(lambda u, v: cape_pt(u, v, 0.985), 34, 20, flip=True), green_d, region='body', weight_fn=cape_w, subdiv=0)

# ================================================================ a ALJAVA nas costas (por cima do manto), com as penas brancas das flechas
qa = Vector((-0.05 * H, 0.2 * H, top - 0.32 * H))
qb = Vector((0.07 * H, 0.17 * H, top + 0.04 * H))
b.add('quiver', rod([qa, qa.lerp(qb, 0.5), qb], [0.04 * H, 0.044 * H, 0.046 * H], 10), leather, region='body', weight_fn=lambda p: {'chest': 1.0}, subdiv=0)
qd = (qb - qa).normalized()
fl = []
for k in range(5):
    o = Vector(((k - 2) * 0.016 * H, (k % 2) * 0.012 * H, 0))
    tip = qb + qd * (0.08 + 0.02 * (k % 2)) * H + o
    fl.append(rod([qb + o, tip], [0.004 * H, 0.004 * H], 4))
    fl.append(ellipsoid(tuple(tip - qd * 0.02 * H), (0.012 * H, 0.004 * H, 0.03 * H), 6, 4))
b.add('arrows', merge(*fl), fletch, region='body', weight_fn=lambda p: {'chest': 1.0}, subdiv=0)

# ================================================================ BOTAS
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f = sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.14 * H, f.z + 0.008 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.01 * H)), toe], [0.046 * H, 0.048 * H, 0.038 * H], step=0.45)
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.2 * H))], [0.058 * H, 0.062 * H], step=0.45)
    b.add('boot' + side, U.mesh(res=0.006, smooth=2, target=1000), boots, region='body', weight_fn=W('k' + side), subdiv=0)
    S2 = Sculpt()
    S2.chain([heel + Vector((0, 0.008 * H, -0.022 * H)), toe + Vector((0, -0.01 * H, -0.006 * H))], [0.052 * H, 0.046 * H], step=0.35)
    so = S2.mesh(res=0.006, smooth=2, target=500)
    so = ([(x, y, max(z, f.z - 0.04 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('bootSole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ o CABELO cacheado escuro (a massa de cachos sob o capuz, escapando na testa)
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


C = Sculpt()
for i in range(26):
    a = i / 26 * TAU
    for el in (0.1, 0.4, 0.7, 1.0, 1.3):
        if el < 0.6 and math.cos(a) > 0.35:
            continue
        q = on_head(a, el, 0.01 * H)
        if q:
            C.ell(q, (0.034 * H, 0.034 * H, 0.032 * H))
for k in range(9):  # os cachos pequenos na testa (a franja que escapa do capuz)
    q = on_head((k - 4) * 0.13, 0.62 + 0.04 * (k % 2), 0.012 * H)
    if q:
        C.ell(q, (0.02 * H, 0.018 * H, 0.02 * H))
b.add('hair', C.mesh(res=0.004, smooth=2, disp=lambda p: 0.004 * H * (math.sin(p.x / H * 160) * math.sin(p.y / H * 150) * math.sin(p.z / H * 140)), target=4200),
      hairm, region='body', weight_fn=HEAD, subdiv=0)

# ================================================================ o CAPUZ verde (aberto na frente), caindo sobre o cachecol
HC = Vector((hc.x, hc.y + 0.01 * H, hc.z + 0.012 * H))
HR = (0.168 * H, 0.176 * H, 0.19 * H)
OPEN = 0.32


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
        p += Vector((x, y, 0)).normalized() * k * 0.05 * H
    p.y += 0.016 * H
    return p


b.add('hood', grid(hood_pt, 30, 12), green, region='head', subdiv=0)
b.add('hood_in', grid(lambda u, v: hood_pt(u, v, 0.96), 30, 12, flip=True), green_d, region='head', subdiv=0)

b.export(OUT)
