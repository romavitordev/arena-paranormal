"""
DOPPELGANGER — "OS HOMENS DE TERNO" — public/models/doppel.glb (as invocações do Estrangeiro: Homens de Terno)
Referência: wiki "Doppelganger" (Sinais do Outro Lado ep. 3: chegam na van preta "vestindo ternos e chapéus"):
  o corpo quase humano, a pele estranha (esverdeada); o ROSTO distorcido com a grande DIVISÓRIA VERTICAL que corta a cara
  ao meio, os OLHOS pequenos redondos, pretos com a pupila verde, e as DOBRAS perto dos olhos; DEDOS longos e pontudos;
  a roupa faz parte da pele (terno escuro, camisa branca, gravata preta) e o CHAPÉU. A arma (o Fuzil Alheio: uma pistola
  de plasma verde) é peça em código (src/models/weapons.js alienPistol).
  node tools/blender/build.mjs doppel   → public/models/doppel.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'doppel.glb'
random.seed(1990)

b = Builder(width=0.96, bulk=0.92, height=1.04)  # esguio, um pouco alto demais
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_doppel', '#a8b49a', 0.8)  # a pele esverdeada e sem vida
face = material('face_doppel', '#a3b096', 0.85)
suit = material('suit_doppel', '#1e2026', 0.85)
suit_d = material('suit_doppel_d', '#15161b', 0.85)
shirt = material('shirt_doppel', '#e8e6e0', 0.85)
tie = material('tie_doppel', '#0c0c10', 0.6)
hatm = material('hat_doppel', '#121216', 0.7)
band = material('hatband_doppel', '#2a2a30', 0.6)
shoe = material('shoe_doppel', '#0e0e12', 0.4)
eye_b = material('eye_doppel', '#050506', 0.3)
eye_g = material('pupil_doppel', '#7aff4a', 0.4, emission='#7aff4a', strength=2.0)
slit = material('slit_doppel', '#2a3424', 0.9)
M = {'skin': skin, 'face': face, 'torso': suit, 'arm': suit, 'hand': skin, 'legs': suit, 'feet': shoe}

TP = [(-0.12, 0.168), (0.0, 0.17), (0.18, 0.168), (0.38, 0.214), (0.5, 0.226), (0.6, 0.122), (0.66, 0.07)]
hc = b.body(M, TP, arm_r=(0.068, 0.056, 0.046), leg_r=(0.088, 0.072, 0.056), neck_r=0.058, feet='shoe', head_r=(0.136, 0.148, 0.176))


def part(name):
    return next(o for o in b.parts if o.name == name)


def W(reg):
    return lambda p: auto_weights(sk, p, reg)


HEAD = lambda p: {'hd': 1.0}
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


def around(name, z, off, n=40):
    pts = []
    for i in range(n + 1):
        a = i / n * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = surf(name, Vector((0, 0, z)) + d * 0.6 * H, -d, off)
        if q:
            pts.append(q)
    return pts


HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


# ================================================================ o ROSTO: a DIVISÓRIA VERTICAL afundada no meio da cara (da testa ao queixo)
g = lambda x, s: math.exp(-(x / s) ** 2)
head = part('head')


def face_fn(p):
    if p.y > hc.y - 0.02 * H:
        return 0
    d = -0.011 * H * g(p.x, 0.006 * H) * g((p.z - hc.z) / H, 0.16)  # o sulco do meio
    # as dobras em volta dos olhos (rugas concêntricas)
    for s in (1, -1):
        r = math.hypot(p.x - s * 0.05 * H, p.z - (hc.z + 0.005 * H)) / H
        d += 0.0026 * H * math.sin(r * 260) * g(r - 0.03, 0.02)
    return d


relief(head, face_fn)
# o fundo escuro da fenda (uma tira fina dentro do sulco)
sl = []
for k in range(15):
    el = -0.95 + 1.75 * k / 14
    q = on_head(0.0, el, -0.004 * H)
    if q:
        sl.append(q)
if len(sl) > 2:
    b.add('faceSlit', rod(sl, 0.005 * H, 5), slit, region='body', weight_fn=HEAD, subdiv=0)
# os OLHOS pequenos e redondos: pretos com a pupila verde
for s in (1, -1):
    c = on_head(s * 0.36, 0.05, -0.004 * H)
    if c:
        b.add(f'eye{s}', ellipsoid(tuple(c), (0.017 * H, 0.012 * H, 0.017 * H), 10, 8), eye_b, region='body', weight_fn=HEAD, subdiv=0)
        p = c + (c - HCv).normalized() * 0.011 * H
        b.add(f'pupil{s}', ellipsoid(tuple(p), (0.006 * H, 0.004 * H, 0.006 * H), 8, 6), eye_g, region='body', weight_fn=HEAD, subdiv=0)

# ================================================================ o TERNO: o paletó (barra solta e o vinco), as LAPELAS, a camisa e a gravata preta
tor = part('torso')
relief(tor, lambda p: 0.0025 * H * (ridge(p.z / H * 14 + n3(p, 8) * 1.2, 2) - 0.4))
hem = around('torso', hz - 0.06 * H, 0.012 * H, 40)
if len(hem) > 3:
    b.add('jacketHem', rod(hem, 0.014 * H, 6, caps=False, flat=(outward((0, 0)), 0.4)), suit, region='body', weight_fn=W('torso'), subdiv=0)
# a camisa branca no V do paletó
V = Sculpt()
for k in range(12):
    t = k / 11
    z = top - 0.02 * H - t * 0.25 * H
    w = 0.048 * H * (1 - t) + 0.008 * H
    q = front('torso', 0.0, z, -0.002 * H)
    if q:
        V.ell(q, (w, 0.008 * H, 0.03 * H))
b.add('shirtV', V.mesh(res=0.003, smooth=3, target=900), shirt, region='body', weight_fn=W('torso'), subdiv=0)
b.add('shirtCollar', clothe(part('neck'), lambda p: p.z < top + 0.06 * H, 0.008 * H, cuts=1), shirt, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
# as lapelas: do colarinho até o botão, abrindo para os lados
for s in (1, -1):
    pts = [front('torso', s * x, z, 0.009 * H) for x, z in ((0.05 * H, top - 0.01 * H), (0.075 * H, top - 0.1 * H), (0.055 * H, top - 0.2 * H), (0.012 * H, top - 0.29 * H))]
    pts = [q for q in pts if q]
    if len(pts) > 2:
        b.add(f'lapel{s}', rod(pts, [0.02 * H, 0.026 * H, 0.018 * H, 0.008 * H][:len(pts)], 6, flat=(lambda p: Vector((0, -1, 0)), 0.3)), suit_d, region='body', weight_fn=W('torso'), subdiv=0)
# a gravata preta, reta e apertada (nada de desleixo: eles imitam o humano "certinho")
kn = front('torso', 0.0, top - 0.035 * H, 0.012 * H)
if kn:
    K = Sculpt()
    K.ell(kn, (0.016 * H, 0.011 * H, 0.018 * H))
    b.add('tieKnot', K.mesh(res=0.003, smooth=2, target=300), tie, region='body', weight_fn=W('torso'), subdiv=0)
    tb = [kn + Vector((0, 0.002 * H, -0.015 * H))]
    for k in range(1, 7):
        q = front('torso', 0.0, top - 0.035 * H - 0.24 * H * k / 6, 0.007 * H)
        if q:
            tb.append(q)
    if len(tb) > 2:
        b.add('tieBody', rod(tb, [0.011 * H + 0.01 * H * k / (len(tb) - 1) for k in range(len(tb))], 6, flat=(lambda p: Vector((0, -1, 0)), 0.25)), tie, region='body', weight_fn=W('torso'), subdiv=0)
# dois botões
bts = []
for i in range(2):
    c = front('torso', 0.0, top - (0.31 + 0.07 * i) * H, 0.004 * H)
    if c:
        bts.append(ellipsoid(tuple(c), (0.008 * H, 0.004 * H, 0.008 * H), 8, 5))
if bts:
    b.add('buttons', merge(*bts), suit_d, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    relief(part('arm' + side), lambda p: 0.003 * H * (ridge(p.z / H * 18 + n3(p, 9) * 1.4, 2) - 0.4))
    relief(part('leg' + side), lambda p: 0.003 * H * (ridge(p.z / H * 16 + n3(p, 9) * 1.4, 2) - 0.4))

# ================================================================ os DEDOS longos e pontudos (garras finas saindo das mãos)
for side in ('L', 'R'):
    h = sk['hand' + side]
    e = sk['e' + side]
    ax = (h - e).normalized()
    s = 1 if side == 'L' else -1
    for k in range(4):
        base = h + ax * 0.05 * H + Vector((0, (k - 1.5) * 0.014 * H, 0))
        tip = base + ax * 0.075 * H + Vector((0, (k - 1.5) * 0.006 * H, 0))
        b.add(f'finger{side}{k}', cone(tuple(base), tuple(tip), 0.007 * H, 6), skin, region='body', weight_fn=W('e' + side), subdiv=0)

# ================================================================ o CHAPÉU (fedora): a copa com o vinco em cima, a fita e a aba
crown_c = HCv + Vector((0, 0.004 * H, 0.12 * H))
C = Sculpt()
C.chain([crown_c + Vector((0, 0, -0.03 * H)), crown_c + Vector((0, 0, 0.05 * H))], [0.13 * H, 0.112 * H], step=0.3)


def crown_disp(p):
    # o vinco no alto (de frente para trás) e as duas apertadas na frente
    d = -0.016 * H * g(p.x - crown_c.x, 0.03 * H) * (1 if p.z > crown_c.z + 0.05 * H else 0)
    return d


b.add('hatCrown', C.mesh(res=0.004, smooth=2, disp=crown_disp, target=2200), hatm, region='body', weight_fn=HEAD, subdiv=0)
bandp = []
for i in range(41):
    a = i / 40 * TAU
    bandp.append(crown_c + Vector((math.sin(a) * 0.131 * H, -math.cos(a) * 0.141 * H, -0.045 * H)))
b.add('hatBand', rod(bandp, 0.012 * H, 6, caps=False), band, region='body', weight_fn=HEAD, subdiv=0)
# a aba: um disco achatado, caído na frente e levantado atrás
brim = []
for r in range(4):
    ring = []
    for i in range(48):
        a = i / 48 * TAU
        rr = 0.13 + 0.03 * r
        z = -0.058 * H - 0.012 * H * max(0, -math.cos(a)) * r / 3 + 0.008 * H * max(0, math.cos(a)) * r / 3
        ring.append(crown_c + Vector((math.sin(a) * rr * H, -math.cos(a) * (rr + 0.012) * H, z)))
    brim.append(ring)
verts, faces = [], []
for r, ring in enumerate(brim):
    for q in ring:
        verts.append(tuple(q))
n = 48
for r in range(len(brim) - 1):
    for i in range(n):
        a0, a1 = r * n + i, r * n + (i + 1) % n
        b0, b1 = (r + 1) * n + i, (r + 1) * n + (i + 1) % n
        faces.append((a0, a1, b1, b0))
# espessura: uma segunda camada um pouco abaixo
off = len(verts)
for q in list(verts):
    verts.append((q[0], q[1], q[2] - 0.006 * H))
for r in range(len(brim) - 1):
    for i in range(n):
        a0, a1 = off + r * n + i, off + r * n + (i + 1) % n
        b0, b1 = off + (r + 1) * n + i, off + (r + 1) * n + (i + 1) % n
        faces.append((a0, b0, b1, a1))
last = (len(brim) - 1) * n
for i in range(n):
    faces.append((last + i, off + last + i, off + last + (i + 1) % n, last + (i + 1) % n))
b.add('hatBrim', (verts, faces, None), hatm, region='body', weight_fn=HEAD, subdiv=0)

b.export(OUT)
