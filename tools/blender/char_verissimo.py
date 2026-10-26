"""
SENHOR VERÍSSIMO — public/models/verissimo.glb. Refeito com a técnica atual (sculpt_lib: roupa a partir do corpo,
metaballs, relevo, peças coladas na superfície por raio) a partir da ARTE OFICIAL "Miniatura Senhor Veríssimo em
Calamidade" (wiki "Senhor Veríssimo"):
  alto e FORTE, ~60 anos; cabelo GRISALHO volumoso PENTEADO PARA TRÁS (ondulado no alto, os lados puxados para trás por
  cima das orelhas); barba grisalha CURTA e aparada com o BIGODE e o CAVANHAQUE; o rosto cansado com olheiras (textura);
  COLETE escuro RISCADO DE GIZ abotoado; camisa BRANCA com as MANGAS ARREGAÇADAS até os cotovelos e a gola aberta; a
  GRAVATA AZUL afrouxada; calça escura riscada; sapatos pretos.
A espada do Arnaldo, a bandoleira e a escopeta continuam em código (src/models/props.js → addVerissimoProps).
  node tools/blender/build.mjs verissimo   → public/models/verissimo.glb (+ tools/blender/fonte/verissimo.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'verissimo.glb'
random.seed(1960)

b = Builder(width=1.06, bulk=1.06, height=1.06)  # alto e forte
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_verissimo', '#d8b49c', 0.8)  # pele pálida (Calamidade)
shirt = material('shirt_verissimo', '#ffffff', 0.85)  # camisa branca com dobras (textura)
vest = material('vest_verissimo', '#ffffff', 0.8)  # colete escuro riscado + camisa branca no V (textura)
pants = material('pants_verissimo', '#ffffff', 0.85)  # calça escura riscada (textura)
M = {'skin': skin, 'face': material('face_verissimo', '#ffffff', 0.8), 'torso': vest, 'arm': skin, 'hand': skin, 'legs': pants, 'feet': skin}
tie = material('tie_verissimo', '#3a6ab0', 0.6)
hairm = material('hair_verissimo', '#a8a49e', 0.6)
beardm = material('beard_verissimo', '#bdb9b2', 0.8)
btn = material('button_verissimo', '#1a1a1c', 0.4)
shoe = material('shoe_verissimo', '#141214', 0.4)
sole = material('sole_verissimo', '#26201e', 0.8)
PREVIEW = {'shirt_verissimo': '#efece6', 'vest_verissimo': '#26262c', 'pants_verissimo': '#2c2c32', 'face_verissimo': '#d8b49c'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.176), (0.0, 0.178), (0.18, 0.176), (0.38, 0.226), (0.5, 0.238), (0.6, 0.128), (0.66, 0.074)]
hc = b.body(M, TP, arm_r=(0.074, 0.06, 0.05), leg_r=(0.094, 0.076, 0.058), neck_r=0.062, feet='bare')


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


def front(name, x, z, off=0.0, back=False):
    s = 1 if back else -1
    return surf(name, Vector((x, s * 0.6 * H, z)), Vector((0, -s, 0)), off)


def around(name, z, off, n=40):
    pts = []
    for i in range(n + 1):
        a = i / n * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = surf(name, Vector((0, 0, z)) + d * 0.6 * H, -d, off)
        if q:
            pts.append(q)
    return pts


def limb_ring(name, c, ax, off, n=24):
    ax = ax.normalized()
    u = ax.orthogonal().normalized()
    v = ax.cross(u)
    out = []
    for k in range(n + 1):
        a = k / n * TAU
        d = u * math.cos(a) + v * math.sin(a)
        q = surf(name, c + d * 0.4 * H, -d, off)
        out.append(q if q else c + d * 0.07 * H)
    return out


tor = part('torso')
# ================================================================ o COLETE riscado (textura) assentado no corpo, os botões e a barra
relief(tor, lambda p: 0.003 * H * (ridge(p.z / H * 16 + n3(p, 8) * 1.2, 2) - 0.4))
bts = []
for i in range(5):
    c = front('torso', 0.0, hz + (0.08 + 0.06 * i) * H, 0.004 * H)
    if c:
        bts.append(ellipsoid(tuple(c), (0.009 * H, 0.005 * H, 0.009 * H), 8, 5))
b.add('vestButtons', merge(*bts), btn, region='body', weight_fn=W('torso'), subdiv=0)
belt = around('torso', hz + 0.02 * H, 0.006 * H, 40)
if len(belt) > 3:
    b.add('vestHem', rod(belt, 0.012 * H, 6, caps=False, flat=(outward((0, 0)), 0.4)), vest, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ a GOLA da camisa ABERTA (as pontas soltas) e a GRAVATA AZUL afrouxada
b.add('shirtCollar', clothe(part('neck'), lambda p: p.z < top + 0.07 * H, 0.009 * H, cuts=1), shirt, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
for s in (1, -1):
    c = front('neck', s * 0.035 * H, top + 0.02 * H, 0.012 * H)
    if c:
        b.add(f'collarTip{s}', rod([c + Vector((s * 0.008 * H, 0, 0.04 * H)), c + Vector((s * 0.02 * H, -0.006 * H, 0.0)), c + Vector((s * 0.035 * H, -0.01 * H, -0.04 * H))],
                                   0.012 * H, 5, flat=(lambda p: Vector((0, -1, 0)), 0.3)), shirt, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
# o nó frouxo, mais baixo e torto, e a gravata caindo sobre o colete
kn = front('torso', 0.012 * H, top - 0.07 * H, 0.016 * H)
if kn:
    K = Sculpt()
    K.ell(kn, (0.022 * H, 0.014 * H, 0.024 * H))
    b.add('tieKnot', K.mesh(res=0.003, smooth=2, target=400), tie, region='body', weight_fn=W('torso'), subdiv=0)
    tb = [kn + Vector((0, 0.002 * H, -0.02 * H))]
    for k in range(1, 8):
        q = front('torso', (0.012 + 0.012 * k / 7) * H, top - 0.07 * H - 0.3 * H * k / 7, 0.01 * H)
        if q:
            tb.append(q)
    if len(tb) > 2:
        b.add('tieBody', rod(tb, [0.014 * H + 0.012 * H * k / (len(tb) - 1) for k in range(len(tb))], 6, flat=(lambda p: Vector((0, -1, 0)), 0.25)), tie, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ as MANGAS da camisa ARREGAÇADAS até o cotovelo (a dobra grossa)
for side in ('L', 'R'):
    arm = part('arm' + side)
    s_, e_, h_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    sl = b.add('sleeve' + side, clothe(arm, lambda p, e_=e_: p.z > e_.z + 0.02 * H, 0.009 * H, cuts=1), shirt, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(sl, lambda p: 0.004 * H * (ridge(p.z / H * 20 + n3(p, 9) * 1.4, 2) - 0.4))
    roll = limb_ring('arm' + side, s_.lerp(e_, 0.92), e_ - s_, 0.016 * H)
    b.add('sleeveRoll' + side, rod(roll, 0.016 * H, 6, caps=False), shirt, region='body', weight_fn=W('arm' + side), subdiv=0)

# ================================================================ a CALÇA riscada (vinco e dobras) e os SAPATOS pretos
for side in ('L', 'R'):
    relief(part('leg' + side), lambda p: 0.004 * H * (ridge(p.z / H * 18 + n3(p, 9) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f = sk['foot' + side]
    heel = Vector((f.x, f.y + 0.03 * H, f.z + 0.018 * H))
    toe = Vector((f.x - s * 0.003 * H, f.y - 0.16 * H, f.z + 0.006 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.55) + Vector((0, 0, 0.013 * H)), toe], [0.047 * H, 0.048 * H, 0.038 * H], step=0.45)
    U.chain([Vector((f.x, f.y + 0.01 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.085 * H))], [0.054 * H, 0.052 * H], step=0.45)
    b.add('shoe' + side, U.mesh(res=0.005, smooth=2, target=800), shoe, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.006 * H, -0.02 * H)), toe + Vector((0, -0.008 * H, -0.004 * H))], [0.05 * H, 0.042 * H], step=0.35)
    so = S.mesh(res=0.005, smooth=2, target=400)
    so = ([(x, y, max(z, f.z - 0.03 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.004 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('sole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CABELO grisalho volumoso PENTEADO PARA TRÁS
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


D = Sculpt()
# a calota (do alto até a nuca; dos lados até o alto da orelha) — as bolas se sobrepõem para fundir
for i in range(30):
    for j in range(11):
        a = (i / 30 - 0.5) * TAU
        el = -0.42 + 1.85 * j / 10
        if math.cos(a) > 0.45 and el < 0.78:
            continue  # testa e rosto
        if el < 0.12 and math.cos(a) > -0.35:
            continue
        if el < -0.1 and math.cos(a) > -0.8:
            continue
        q = on_head(a, el, (0.012 if abs(math.sin(a)) > 0.8 and el < 0.5 else 0.008) * H)
        if q:
            D.ell(q, (0.032 * H, 0.032 * H, 0.028 * H))
# as mechas grossas: saem da linha do cabelo na testa, sobem (o topete ondulado) e vão para trás até a nuca
for i in range(13):
    a = (i / 12 - 0.5) * 1.6
    pts = [on_head(a, 0.78, 0.022 * H), on_head(a * 0.9, 1.05, 0.04 * H), on_head(a * 0.8, 1.45, 0.034 * H), on_head(math.pi - a * 0.5, 0.95, 0.026 * H), on_head(math.pi - a * 0.6, 0.45, 0.018 * H)]
    pts = [q for q in pts if q]
    if len(pts) > 2:
        D.chain(pts, [0.022 * H, 0.028 * H, 0.026 * H, 0.022 * H, 0.014 * H][:len(pts)], step=0.5)
# os lados puxados para trás por cima das orelhas
for s in (1, -1):
    for k in range(4):
        el = 0.25 + 0.15 * k
        pts = [on_head(s * 1.0, el, 0.016 * H), on_head(s * 1.7, el + 0.05, 0.02 * H), on_head(s * 2.4, el, 0.018 * H)]
        pts = [q for q in pts if q]
        if len(pts) > 1:
            D.chain(pts, [0.018 * H, 0.02 * H, 0.014 * H][:len(pts)], step=0.5)
hd_ = lambda p: 0.0022 * H * (ridge(p.y / H * 90 + p.z / H * 50 + n3(p, 30), 2) - 0.4)  # os fios penteados para trás
b.add('hair', D.mesh(res=0.0045, smooth=2, disp=hd_, target=5000), hairm, region='body', weight_fn=HEAD, subdiv=0)

# ================================================================ BARBA grisalha CURTA e aparada (rente) com o BIGODE e o CAVANHAQUE
B = Sculpt()
for i in range(19):
    a = (i / 18 - 0.5) * 2.75
    for el in (-0.3, -0.44, -0.58, -0.72):
        if abs(a) < 0.34 and el > -0.56:
            continue  # a boca
        if abs(a) < 0.72 and el > -0.42:
            continue
        q = on_head(a, el, -0.002 * H)
        if q:
            B.ell(q, (0.02 * H, 0.02 * H, 0.018 * H))
for s in (1, -1):
    for el in (-0.12, 0.04):
        q = on_head(s * 1.25, el, -0.002 * H)
        if q:
            B.ell(q, (0.018 * H, 0.018 * H, 0.022 * H))
chin = on_head(0.0, -0.8, 0.012 * H)
if chin:
    B.chain([chin, chin + Vector((0, -0.012 * H, -0.045 * H))], [0.026 * H, 0.012 * H], step=0.5)  # o cavanhaque
b.add('beard', B.mesh(res=0.004, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.x / H * 160 + p.z / H * 40, 2) - 0.4), target=2400), beardm, region='body', weight_fn=HEAD, subdiv=0)
Mu = Sculpt()
for s in (1, -1):
    pts = [on_head(s * a, el, 0.012 * H) for a, el in ((0.03, -0.36), (0.16, -0.38), (0.28, -0.46), (0.31, -0.56))]
    pts = [q for q in pts if q]
    if len(pts) > 1:
        Mu.chain(pts, [0.015 * H, 0.017 * H, 0.012 * H, 0.008 * H][:len(pts)], step=0.45)
b.add('mustache', Mu.mesh(res=0.0035, smooth=2, target=1000), beardm, region='body', weight_fn=HEAD, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'verissimo.blend'), check_existing=False)
