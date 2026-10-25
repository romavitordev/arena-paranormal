"""
JOUI JOUKI (Calamidade) — public/models/joui.glb. Refeito com a técnica atual (sculpt_lib: roupa a partir do corpo,
metaballs, relevo, peças coladas na superfície por raio), a partir das ARTES OFICIAIS "Miniatura Joui Jouki em
Calamidade", "Miniatura de Joui Jouki em combate em Calamidade" e "Miniatura Joui após receber a Shinokage" (wiki
"Joui Jouki") e do texto da wiki.

Referência (de cima a baixo):
  - cabelo preto RASPADO nas laterais e maior no topo, repartido no meio e caindo para os lados em mechas grossas;
    a cicatriz em X na bochecha esquerda (textura face_mascarado); a máscara preta estilo oni com as marcas vermelhas
    e as fendas brancas — duas versões (prop_maskOn no rosto / prop_maskSide puxada para o lado), o jogo mostra UMA;
  - a corda com o nó de forca no pescoço (Seita das Máscaras); a túnica cinza de gola chinesa (Tangzhuang) com os
    fechos vermelhos; por cima, o casaco/capa longo cinza-escuro ABERTO, com a borda vermelha em toda a volta, mangas
    até o cotovelo com o punho vermelho e o capuz caído com a borda vermelha;
  - a corda vermelha trançada amarrada na cintura, com o nó e as pontas e laçadas penduradas; faixas no antebraço;
    luvas sem dedos; a pulseira com as bandeiras do Brasil, Itália e Japão (punho esquerdo);
  - calça cinza larga presa por faixas na canela; CHINELOS COM MEIAS.
A katana e a bainha continuam em código (models/props.js).
  node tools/blender/build.mjs joui   → public/models/joui.glb (+ tools/blender/fonte/joui.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'joui.glb'
random.seed(1803)

b = Builder(width=0.98, bulk=1.0, height=1.0)  # 1,80 m, esguio e atlético
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_mascarado', '#d0a888', 0.8),
    'face': material('face_mascarado', '#ffffff', 0.8),
    'torso': material('tunic', '#3e3d42', 0.85),
    'arm': material('tunic', '#3e3d42', 0.85),
    'hand': material('gloves', '#141416', 0.7),
    'legs': material('pants', '#3a3a3f', 0.9),
    'feet': material('socks', '#232327', 0.9),  # meias escuras (os chinelos por cima)
}
tunic = M['torso']
coat = material('coat', '#26252a', 0.9)
red = material('trim_red', '#8a1018', 0.7)
twist_red = material('rope_twist_red', '#ffffff', 0.85)    # corda trançada vermelha e escura (textura)
twist_cream = material('rope_twist_cream', '#ffffff', 0.9)  # cordão cru trançado (textura)
rope = material('rope', '#b8a07a', 0.9)
wrapm = material('wraps', '#2a2a2e', 0.9)
hairm = material('hair', '#0e0e10', 0.6)
shaved = material('hair_shaved', '#2a2628', 0.9)
maskm = material('mask', '#1c1b1f', 0.45)
glow = material('eyeglow', '#ffffff', 0.5, emission='#ffffff', strength=3)
sandal = material('sandal', '#cfccc4', 0.8)
sandal_strap = material('sandal_strap', '#2c2c30', 0.7)
PREVIEW = {'face_mascarado': '#d0a888', 'rope_twist_red': '#8a1018', 'rope_twist_cream': '#d8c8a8'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.165), (0.0, 0.165), (0.18, 0.16), (0.38, 0.21), (0.5, 0.222), (0.6, 0.12), (0.66, 0.07)]
hc = b.body(M, TP, leg_r=(0.1, 0.085, 0.07), feet='bare')


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


def around(name, z, off, n=40, a0=0.0, a1=TAU):
    pts = []
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
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
        out.append(q if q else c + d * 0.08 * H)
    return out


def lim(x):
    return max(0.0, min(1.0, x))


tor = part('torso')
# ================================================================ a TÚNICA de gola chinesa: dobras leves, a gola em pé e os fechos vermelhos
relief(tor, lambda p: 0.004 * H * (ridge(p.z / H * 14 + n3(p, 8) * 1.4, 2) - 0.4))
b.add('mandarinCollar', clothe(part('neck'), lambda p: p.z < top + 0.09 * H, 0.012 * H, cuts=1), tunic, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
b.add('collarTrim', rod(around('neck', top + 0.09 * H, 0.014 * H, 24), 0.007 * H, 5, caps=False), red, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
frogs = []
for i in range(5):
    c = front('torso', 0.0, hz + (0.2 + 0.075 * i) * H, 0.008 * H)
    if c:
        frogs.append(rod([c + Vector((-0.06 * H, 0, 0)), c + Vector((-0.02 * H, -0.003 * H, 0.004 * H)), c + Vector((0.02 * H, -0.003 * H, 0.004 * H)), c + Vector((0.06 * H, 0, 0))], 0.008 * H, 5))
        frogs.append(ellipsoid(tuple(c + Vector((0, -0.006 * H, 0.004 * H))), (0.01 * H, 0.008 * H, 0.01 * H), 6, 4))
b.add('frogs', merge(*frogs), red, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ o CASACO longo cinza-escuro, ABERTO na frente: a parte de cima vem do tronco,
# a saia comprida é uma casca que desce do quadril até a canela, abrindo e caindo em dobras
open_front = lambda p: p.y < -0.06 * H and abs(p.x) < 0.07 * H + 0.06 * lim((top - p.z) / (top - hz)) * H
coat_up = b.add('coat', clothe(tor, lambda p: hz - 0.05 * H < p.z < top + 0.02 * H and not open_front(p), 0.024 * H, cuts=1), coat, region='body', weight_fn=W('torso'), subdiv=0)
relief(coat_up, lambda p: 0.005 * H * (ridge(p.z / H * 12 + n3(p, 7) * 1.3, 2) - 0.4))
GAP = 0.085
SK_Z = [hz + 0.02 * H, hz - 0.2 * H, hz - 0.42 * H, hz - 0.6 * H]
skirt_rings = []
for k, z in enumerate(SK_Z):
    flare = 1.0 + 0.1 * k
    skirt_rings.append((z, 0.205 * H * flare, 0.152 * H * flare))
skirt = b.add('coatSkirt', open_tube(skirt_rings, gap=GAP, seg=40), coat, region='skirt', subdiv=1)
relief(skirt, lambda p: (0.004 + 0.01 * lim((hz - p.z) / (0.6 * H))) * H * ridge(math.atan2(p.x, -p.y) * 6 + n3(p, 5) * 1.2, 2))  # só para fora
# o forro vermelho por dentro (bem recuado: as dobras de fora não deixam ele vazar)
b.add('coatSkirtIn', open_tube([(z, rx * 0.93, ry * 0.93) for z, rx, ry in skirt_rings], gap=GAP + 0.004, seg=40), red, region='skirt', subdiv=1)
# a BORDA vermelha: a barra da saia e as duas bordas da abertura, do peito à barra
hem_z = SK_Z[-1]
hem = [Vector((math.sin(a) * skirt_rings[-1][1] * 1.01, -math.cos(a) * skirt_rings[-1][2] * 1.01, hem_z + 0.01 * H)) for a in [(GAP + (1 - 2 * GAP) * k / 48) * TAU for k in range(49)]]
b.add('coatHem', rod(hem, 0.016 * H, 6, caps=False), red, region='skirt', subdiv=0)
for s in (1, -1):
    edge = []
    a = (GAP if s > 0 else 1 - GAP) * TAU
    for z, rx, ry in skirt_rings:
        edge.append(Vector((math.sin(a) * rx * 1.012, -math.cos(a) * ry * 1.012, z)))
    ed_up = [front('coat', s * (0.07 + 0.06 * lim((top - z) / (top - hz))) * H, z, 0.004 * H) for z in [hz + (top - hz) * k / 10 for k in range(11)]]
    ed_up = [q for q in ed_up if q]
    b.add(f'coatEdgeUp{s}', rod(ed_up, 0.014 * H, 6, caps=False, flat=(outward((0, 0)), 0.45)), red, region='body', weight_fn=W('torso'), subdiv=0)
    b.add(f'coatEdgeSkirt{s}', rod(list(reversed(edge)), 0.014 * H, 6, caps=False), red, region='skirt', subdiv=0)
# as MANGAS do casaco até o cotovelo, com o punho vermelho
for side in ('L', 'R'):
    arm = part('arm' + side)
    s_, e_, h_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    sl = b.add('coatSleeve' + side, clothe(arm, lambda p, e_=e_: p.z > e_.z - 0.01 * H, 0.013 * H, cuts=1), coat, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(sl, lambda p: 0.005 * H * (ridge(p.z / H * 20 + n3(p, 9), 2) - 0.4))
    b.add('coatCuff' + side, rod(limb_ring('coatSleeve' + side, e_ + (h_ - e_).normalized() * -0.01 * H, h_ - e_, 0.006 * H), 0.016 * H, 6, caps=False), red, region='body', weight_fn=W('arm' + side), subdiv=0)
    # as FAIXAS no antebraço (espiral colada) e a luva sem dedos
    wr = []
    ax = (h_ - e_)
    for i in range(121):
        t = i / 120
        c = e_.lerp(h_, 0.15 + 0.75 * t)
        u = ax.normalized().orthogonal().normalized()
        v = ax.normalized().cross(u)
        a = t * 6.5 * TAU
        d = u * math.cos(a) + v * math.sin(a)
        q = surf('arm' + side, c + d * 0.4 * H, -d, 0.004 * H) or surf('hand' + side, c + d * 0.4 * H, -d, 0.004 * H)
        if q:
            wr.append(q)
    if len(wr) > 3:
        b.add('wrap' + side, rod(wr, 0.011 * H, 5, caps=False, flat=(outward((e_.x, e_.y)), 0.7)), wrapm, region='body', weight_fn=W('e' + side), subdiv=0)
# o CAPUZ caído nas costas, com a borda vermelha e a costura no meio
Hd = Sculpt()
nb = front('coat', 0.0, top - 0.02 * H, 0.0, back=True) or Vector((0, 0.13 * H, top))
Hd.ell(nb + Vector((0, 0.05 * H, 0.0)), (0.15 * H, 0.06 * H, 0.08 * H))
Hd.ell(nb + Vector((0, 0.065 * H, -0.09 * H)), (0.12 * H, 0.05 * H, 0.08 * H))
Hd.ell(nb + Vector((0, 0.06 * H, -0.17 * H)), (0.06 * H, 0.04 * H, 0.05 * H))
for s in (1, -1):
    Hd.ell(nb + Vector((s * 0.11 * H, -0.02 * H, 0.02 * H)), (0.06 * H, 0.06 * H, 0.05 * H))
b.add('hood', Hd.mesh(res=0.006, smooth=2, disp=lambda p: 0.004 * H * (ridge(p.z / H * 30, 2) - 0.4), target=1300), coat, region='body', weight_fn=W('torso'), subdiv=0)
hr = [q for q in (surf('hood', nb + Vector((math.sin(a) * 0.2 * H, 0.0, 0.06 * H + math.cos(a) * 0.02 * H)) + Vector((0, 0.3 * H, 0)), Vector((0, -1, 0)), 0.003 * H) for a in [(-1.3 + 2.6 * k / 16) for k in range(17)]) if q]
if len(hr) > 3:
    b.add('hoodTrim', rod(hr, 0.012 * H, 5, caps=False), red, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ a CORDA com o nó de forca no pescoço e o cordão cru cruzado no peito
nr = around('mandarinCollar', top + 0.03 * H, 0.012 * H, 24)
b.add('neckRope', rod(nr, 0.011 * H, 6, caps=False), rope, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
kn = front('torso', 0.0, top - 0.06 * H, 0.03 * H)
if kn:
    K = Sculpt()
    K.ell(kn, (0.03 * H, 0.022 * H, 0.04 * H))
    K.chain([kn, kn + Vector((0.008 * H, -0.006 * H, -0.12 * H))], [0.013 * H, 0.011 * H], step=0.5)
    K.chain([kn, kn + Vector((-0.012 * H, -0.006 * H, -0.1 * H))], [0.013 * H, 0.011 * H], step=0.5)
    b.add('ropeKnot', K.mesh(res=0.004, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.z / H * 200, 2) - 0.4), target=700), rope, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ a CORDA VERMELHA trançada na cintura (três voltas), o nó, as pontas e as laçadas
belt = []
for k, dz in enumerate((0.03, 0.065, 0.1)):
    ring = around('coat', hz + dz * H, 0.014 * H, 36) or around('torso', hz + dz * H, 0.04 * H, 36)
    if ring:
        belt.append(rod(ring, 0.017 * H, 6, caps=False))
b.add('beltRope', merge(*belt), twist_red, region='body', weight_fn=W('torso'), subdiv=0)
bk = front('coat', 0.11 * H, hz + 0.065 * H, 0.03 * H) or front('torso', 0.11 * H, hz + 0.065 * H, 0.05 * H)
if bk:
    R = Sculpt()
    R.ell(bk, (0.04 * H, 0.03 * H, 0.04 * H))
    for dx in (0.0, 0.03):
        R.chain([bk, bk + Vector((dx * H + 0.02 * H, -0.01 * H, -0.18 * H)), bk + Vector((dx * H + 0.01 * H, -0.012 * H, -0.36 * H))], [0.014 * H, 0.013 * H, 0.011 * H], step=0.5)
    b.add('beltKnot', R.mesh(res=0.004, smooth=2, disp=lambda p: 0.002 * H * (ridge((p.x + p.z) / H * 160, 2) - 0.4), target=1200), twist_red, region='body', weight_fn=W('torso'), subdiv=0)
loops = []
side_pt = surf('coat', Vector((0.6 * H, 0.0, hz + 0.02 * H)), Vector((-1, 0, 0)), 0.03 * H)
if side_pt:
    for k in range(3):
        c = side_pt + Vector((0.004 * H * k, (-0.02 + k * 0.025) * H, -0.04 * H * k))
        pts = [c + Vector((0, math.sin(j / 12 * TAU) * 0.05 * H, -0.09 * H + math.cos(j / 12 * TAU) * 0.09 * H)) for j in range(13)]
        loops.append(rod(pts, 0.011 * H, 6, caps=False))
    b.add('ropeLoops', merge(*loops), twist_red, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ a PULSEIRA de miçangas com as bandeiras do Brasil, Itália e Japão (punho esquerdo)
flags = [('#1f9a3a', '#f2d22a'), ('#1f9a3a', '#f4f4f0', '#d42a2a'), ('#f4f4f0', '#d42a2a')]
cols = [c for f in flags for c in f]
wrp = limb_ring('armL', sk['handL'].lerp(sk['eL'], 0.08), sk['handL'] - sk['eL'], 0.012 * H, len(cols) * 2)
for c in set(cols):
    bead = [ellipsoid(tuple(q), (0.012 * H, 0.012 * H, 0.011 * H), 6, 4) for i, q in enumerate(wrp[:-1]) if (cols * 2)[i] == c]
    if bead:
        b.add('bracelet' + c[1:], merge(*bead), material('bead' + c[1:], c, 0.5), region='body', weight_fn=W('eL'), subdiv=0)

# ================================================================ CALÇA cinza larga com dobras, presa por faixas na canela
for side in ('L', 'R'):
    leg = part('leg' + side)
    k, f = sk['k' + side], sk['foot' + side]
    pl = b.add('pants' + side, clothe(leg, lambda p, f=f: p.z > f.z + 0.1 * H, 0.02 * H, cuts=1), M['legs'], region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.008 * H * (ridge(p.z / H * 16 + n3(p, 8) * 1.6, 2) - 0.4))
    sw = []
    for i in range(101):
        t = i / 100
        c = k.lerp(f, 0.5 + 0.38 * t)
        a = t * 6.0 * TAU + (0.6 if side == 'L' else 2.1)
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = surf('pants' + side, c + d * 0.4 * H, -d, 0.003 * H)
        if q:
            sw.append(q)
    if len(sw) > 3:
        b.add('shinWrap' + side, rod(sw, 0.012 * H, 5, caps=False, flat=(outward((k.x, k.y)), 0.72)), wrapm, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ MEIAS e CHINELOS: o pé de meia esculpido, o solado claro e a tira em V
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f = sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.006 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.01 * H)), toe], [0.048 * H, 0.05 * H, 0.04 * H], step=0.45)
    U.ell(toe + Vector((0, 0.008 * H, 0.008 * H)), (0.044 * H, 0.04 * H, 0.026 * H))
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.008 * H, f.z + 0.1 * H))], [0.05 * H, 0.05 * H], step=0.45)
    b.add('sock' + side, U.mesh(res=0.006, smooth=2, target=900), M['feet'], region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.012 * H, -0.024 * H)), toe + Vector((0, -0.016 * H, -0.006 * H))], [0.054 * H, 0.05 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=500)
    so = ([(x, y, max(z, f.z - 0.036 * H) if z < f.z - 0.014 * H else min(z, f.z - 0.006 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('sandal' + side, so, sandal, region='body', weight_fn=W('k' + side), subdiv=0)
    tip = surf('sock' + side, Vector((f.x, f.y - 0.5 * H, f.z + 0.01 * H)), Vector((0, 1, 0)), 0.003 * H)
    for s2 in (1, -1):
        side_q = surf('sock' + side, Vector((f.x + s2 * 0.4 * H, f.y - 0.02 * H, f.z - 0.004 * H)), Vector((-s2, 0, 0)), 0.003 * H)
        top_q = surf('sock' + side, Vector((f.x + s2 * 0.012 * H, f.y - 0.08 * H, f.z + 0.4 * H)), Vector((0, 0, -1)), 0.003 * H)
        pts = [q for q in (side_q, top_q, tip) if q]
        if len(pts) > 2:
            b.add(f'sandalStrap{side}{s2}', rod(pts, 0.008 * H, 5), sandal_strap, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CABELO: laterais RASPADAS (a sombra curta rente) e o topo maior, repartido no
# meio, caindo para os lados em mechas grossas que passam da sobrancelha
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


Sh = Sculpt()
for i in range(28):
    for j in range(5):
        a = (i / 28 - 0.5) * TAU
        el = 0.25 + 0.55 * j / 4
        if math.cos(a) > 0.5 and el < 0.8:
            continue
        if abs(math.sin(a)) > 0.8 and el < 0.3:
            continue
        q = on_head(a, el, 0.009 * H)
        if q:
            Sh.ell(q, (0.026 * H, 0.026 * H, 0.02 * H))
# a nuca raspada desce até a base do crânio
for i in range(15):
    a = math.pi + (i - 7) * 0.2
    for el in (-0.32, -0.18, -0.04, 0.1, 0.22):
        q = on_head(a, el, 0.008 * H)
        if q:
            Sh.ell(q, (0.026 * H, 0.026 * H, 0.022 * H))
b.add('hairShaved', Sh.mesh(res=0.0045, smooth=3, target=2500), shaved, region='body', weight_fn=HEAD, subdiv=0)
D = Sculpt()
D.ell(HCv + Vector((0, 0.01 * H, 0.15 * H)), (0.13 * H, 0.15 * H, 0.06 * H))  # o volume do topo
for s in (1, -1):
    for j in range(7):
        # da RISCA no meio, cada mecha desce para o seu lado e abre para fora (as da frente viram a franja repartida
        # em cortina; as de trás cobrem a lateral até a orelha)
        a0 = s * (0.1 + j * 0.22)
        a1 = a0 + s * 0.4 * (1 - j / 7)
        pts = [on_head(s * 0.04, 1.4 - j * 0.04, 0.03 * H), on_head(a0 * 0.8, 1.08, 0.036 * H), on_head((a0 + a1) * 0.5, 0.74 - j * 0.03, 0.03 * H), on_head(a1, 0.46 - j * 0.04, 0.024 * H)]
        pts = [q for q in pts if q]
        if len(pts) > 2:
            D.chain(pts, [0.026 * H, 0.032 * H, 0.024 * H, 0.006 * H][:len(pts)], step=0.5)
# a RISCA: um sulco fino do alto da testa até o meio da cabeça
for t in range(9):
    q = on_head(0.0, 0.95 + t * 0.08, 0.05 * H)
    if q:
        D.ell(q, (0.008 * H, 0.03 * H, 0.03 * H), neg=True)
# atrás: o topo cai sobre a nuca raspada em pontas curtas
for i in range(9):
    a = math.pi + (i - 4) * 0.25
    pts = [on_head(a * 0.9 if abs(a) < 0.1 else a, 1.25, 0.03 * H), on_head(a, 0.85, 0.03 * H), on_head(a, 0.6, 0.02 * H)]
    pts = [q for q in pts if q]
    if len(pts) > 1:
        D.chain(pts, [0.03 * H, 0.024 * H, 0.006 * H][:len(pts)], step=0.5)
b.add('hair', D.mesh(res=0.0045, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 100 + p.z / H * 30 + n3(p, 30), 2) - 0.4), target=4500), hairm, region='body', weight_fn=HEAD, subdiv=0)


# ================================================================ a MÁSCARA oni: só a frente do rosto, com relevo de nariz/sobrancelha
def mask_parts(fn):
    shell = ellipsoid((hc.x, hc.y - 0.014, hc.z - 0.006), (0.15, 0.156, 0.168), 20, 14, theta_max=math.pi * 0.8, phi=(0.29, 0.71))

    def rel(p):
        brow = math.exp(-((p.z - (hc.z + 0.055)) ** 2) / 0.0004) * 0.012
        nose = math.exp(-((p.x) ** 2) / 0.0006 - ((p.z - (hc.z - 0.02)) ** 2) / 0.0025) * 0.03
        return Vector((p.x, p.y - brow - nose, p.z))
    shell = xform(shell, rel)
    marks = []
    for s in (1, -1):
        marks.append(xform(box((s * 0.058, -0.17, hc.z + 0.07), (0.075, 0.01, 0.016)), lambda p, s=s: Vector((p.x, p.y, p.z + (p.x - s * 0.058) * 0.35 * s))))
        marks.append(xform(box((s * 0.075, -0.158, hc.z - 0.03), (0.012, 0.01, 0.07)), lambda p, s=s: Vector((p.x + (p.z - (hc.z - 0.03)) * -0.4 * s, p.y, p.z))))
    eyes = [xform(ellipsoid((s * 0.052, -0.168, hc.z + 0.03), (0.026, 0.006, 0.01), 8, 6), lambda p, s=s: Vector((p.x, p.y, p.z + (p.x - s * 0.052) * 0.35 * s))) for s in (1, -1)]
    return xform(shell, fn), xform(merge(*marks), fn), xform(merge(*eyes), fn)


def side_fn(p):
    # gira ~80° para o lado direito do personagem e sobe (a máscara fica presa na faixa)
    c = Vector((hc.x, hc.y, hc.z))
    d = p - c
    a = math.radians(-82)
    x = d.x * math.cos(a) - d.y * math.sin(a)
    y = d.x * math.sin(a) + d.y * math.cos(a)
    return c + Vector((x * 1.04, y * 1.04, d.z * 0.9 + 0.06))


for variant, fn in (('prop_maskOn', lambda p: p), ('prop_maskSide', side_fn)):
    shell, marks, eyes = mask_parts(fn)
    b.add(variant + '_shell', shell, maskm, region='head', subdiv=1)
    b.add(variant + '_marks', marks, red, region='head', subdiv=0)
    if variant == 'prop_maskOn':
        b.add(variant + '_eyes', eyes, glow, region='head', subdiv=0)
    b.group(variant)
# a faixa que prende a máscara (aparece nas duas versões)
b.add('mask_band', tube([(0, 0.0, hc.z + 0.065, 0.152, 0.162), (0, 0.0, hc.z + 0.09, 0.153, 0.163)], 22), maskm, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'joui.blend'), check_existing=False)
