"""
CELESTINE (Ordo Calamitas, Calamidade) — public/models/celestine.glb. Técnica atual (sculpt_lib), pela wiki "Celestine"
(retrato oficial, miniaturas de Calamidade, a estátua) e a descrição: "pele clara e cabelos loiros curtos; armadura com
alguns panos, um cachecol, e o Símbolo da Ordo Calamitas num pano no peito".
Referência (de cima a baixo):
  - o cabelo LOIRO-PLATINADO curto, penteado de lado (volume em cima caindo para um lado, a nuca curta);
  - o CACHECOL/capuz preto grosso enrolado no pescoço e nos ombros, com uma ponta caindo na frente;
  - a camisa preta com o SÍMBOLO DA ORDO CALAMITAS branco no peito (textura shirt_celestine);
  - a ARMADURA cinza-escura: as OMBREIRAS em placas, as braçadeiras nos antebraços, o cinto com as tiras;
  - a calça escura e as botas de cano alto.
As MACHADINHAS presas pela corrente e a MÁSCARA DO DESESPERO (a forma Celestine, a Magistrada) ficam em código
(models/weapons.js → chainHatchet / despairMask; models/props.js → addCelestineProps).
  node tools/blender/build.mjs celestine   → public/models/celestine.glb (+ tools/blender/fonte/celestine.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'celestine.glb'
random.seed(67)  # 67 d.C.

b = Builder(width=0.92, bulk=0.93, height=0.95)  # ~1,70 m, guerreira
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_celestine', '#e8c8b0', 0.7)
shirt = material('shirt_celestine', '#ffffff', 0.85)  # a camisa preta com o Símbolo da Ordo Calamitas (textura)
pants = material('pants_celestine', '#26242a', 0.85)
armor = material('armor_celestine', '#4a4c54', 0.35, metal=0.7)
armor_d = material('armor_celestine_dark', '#2c2e34', 0.4, metal=0.6)
scarf = material('scarf_celestine', '#141316', 0.95)
leather = material('leather_celestine', '#2a2018', 0.6)
boots = material('boots_celestine', '#1c1a1e', 0.55)
sole = material('sole_celestine', '#121014', 0.8)
hairm = material('hair_celestine', '#d8d2c4', 0.65)
M = {
    'skin': skin,
    'face': material('face_celestine', '#ffffff', 0.75),
    'torso': skin,
    'arm': skin,
    'hand': skin,
    'legs': pants,
    'feet': boots,
}
PREVIEW = {'shirt_celestine': '#1a1a1e', 'face_celestine': '#e8c8b0'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.115, 0.158), (0.0, 0.15), (0.17, 0.132), (0.36, 0.178), (0.47, 0.19), (0.57, 0.108), (0.63, 0.064)]
hc = b.body(M, TP, arm_r=(0.058, 0.048, 0.04), leg_r=(0.084, 0.066, 0.052), head_r=(0.13, 0.14, 0.154), feet='bare')


def part(name):
    return next(o for o in b.parts if o.name == name)


def lim(x):
    return max(0.0, min(1.0, x))


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


def front(name, x, z, off=0.0, back=False):
    s = 1 if back else -1
    return surf(name, Vector((x, s * 0.6 * H, z)), Vector((0, -s, 0)), off)


tor = part('torso')
HEAD = lambda p: {'hd': 1.0}

# ================================================================ a CAMISA preta (com o Símbolo na textura) e a CALÇA escura
b.add('shirt', clothe(tor, lambda p: hz - 0.02 * H < p.z < top + 0.03 * H, 0.009 * H, cuts=2), shirt, region='body', weight_fn=W('torso'), subdiv=0)
b.add('pantsHip', clothe(tor, lambda p: p.z < hz + 0.02 * H, 0.016 * H, cuts=1), pants, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    f = sk['foot' + side]
    pl = b.add('pants' + side, clothe(part('leg' + side), lambda p, f=f: p.z > f.z + 0.2 * H, 0.02 * H, cuts=1), pants, region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.005 * H * (ridge(p.z / H * 16 + n3(p, 9) * 1.4, 2) - 0.4))
# as mangas da camisa até o cotovelo
for side in ('L', 'R'):
    e_ = sk['e' + side]
    b.add('sleeve' + side, clothe(part('arm' + side), lambda p, e_=e_: p.z > e_.z - 0.01 * H, 0.01 * H, cuts=1), shirt, region='body', weight_fn=W('arm' + side), subdiv=0)

# ================================================================ o CINTO de couro com as tiras e a fivela de metal
b.add('belt', clothe(tor, lambda p: hz + 0.0 * H < p.z < hz + 0.045 * H, 0.026 * H, cuts=1), leather, region='body', weight_fn=W('torso'), subdiv=0)
bk = front('torso', 0.0, hz + 0.022 * H, 0.03 * H)
if bk:
    b.add('buckle', ellipsoid(tuple(bk), (0.03 * H, 0.008 * H, 0.022 * H), 10, 6), armor, region='body', weight_fn=W('torso'), subdiv=0)
# as tiras de couro caindo do cinto pela frente das coxas (o "saiote" curto de guerreira)
tabs = []
for k in range(6):
    a = (-0.32 + 0.64 * k / 5)
    d = Vector((math.sin(a), -math.cos(a), 0))
    q = surf('belt', Vector((0, 0, hz)) + d * 0.6 * H, -d, 0.004 * H)
    if q:
        tabs.append(rod([q, q + d * 0.01 * H + Vector((0, 0, -0.11 * H))], [0.03 * H, 0.026 * H], 4, flat=(outward((0, 0)), 0.25)))
b.add('beltTabs', merge(*tabs), leather, region='body', weight_fn=lambda p: {'hips': 1.0}, subdiv=0)

# ================================================================ as OMBREIRAS em placas (três lâminas sobrepostas) e as braçadeiras
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh = sk['s' + side]
    arm = part('arm' + side)
    # três placas em degrau abraçando o ombro (a de cima maior, as de baixo menores e mais rentes), as bordas em relevo
    for k, (top_off, low, off) in enumerate(((0.05, 0.0, 0.034), (0.02, -0.04, 0.026), (-0.015, -0.075, 0.02))):
        pl = b.add(f'pauldron{side}{k}', clothe(arm, lambda p, sh=sh, low=low: p.z > sh.z + low * H, off * H, cuts=1), armor if k != 1 else armor_d,
                   region='body', weight_fn=lambda p, s=s: {('sL' if s > 0 else 'sR'): 0.7, 'chest': 0.3}, subdiv=0)
        relief(pl, lambda p, sh=sh, low=low: 0.004 * H * math.exp(-((p.z - (sh.z + low * H)) / (0.008 * H)) ** 2))
    # a calota por cima do ombro (cobre a junção com o tronco)
    cap = surf('arm' + side, sh + Vector((s * 0.02 * H, 0.0, 0.4 * H)), Vector((0, 0, -1)), 0.03 * H)
    if cap:
        P = Sculpt()
        P.ell(cap, (0.075 * H, 0.085 * H, 0.03 * H))
        b.add('pauldronCap' + side, P.mesh(res=0.004, smooth=2, target=600), armor, region='body', weight_fn=lambda p, s=s: {('sL' if s > 0 else 'sR'): 0.6, 'chest': 0.4}, subdiv=0)
    # a braçadeira no antebraço (com as bordas mais escuras)
    e_, h_ = sk['e' + side], sk['hand' + side]
    br = b.add('bracer' + side, clothe(part('arm' + side), lambda p, e_=e_, h_=h_: h_.z + 0.02 * H < p.z < e_.z - 0.03 * H, 0.016 * H, cuts=1), armor_d, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(br, lambda p: 0.003 * H * (ridge(p.z / H * 30, 3) - 0.3))

# ================================================================ o CACHECOL preto grosso: o rolo em volta do pescoço/ombros e a ponta na frente
S = Sculpt()
nk = sk['neck']
for i in range(26):
    a = i / 26 * TAU
    r = 0.105 * H + 0.012 * H * math.sin(a * 3)
    c = Vector((nk.x + math.sin(a) * r, nk.y - math.cos(a) * r * 0.9, top + 0.02 * H + 0.015 * H * math.cos(a * 2)))
    S.ell(c, (0.05 * H, 0.05 * H, 0.045 * H))
# a segunda volta, mais alta (cobre o queixo de lado, como um capuz baixo)
for i in range(20):
    a = i / 20 * TAU
    c = Vector((nk.x + math.sin(a) * 0.08 * H, nk.y - math.cos(a) * 0.075 * H + 0.01 * H, top + 0.075 * H))
    S.ell(c, (0.04 * H, 0.04 * H, 0.035 * H))
b.add('scarf', S.mesh(res=0.005, smooth=2, disp=lambda p: 0.004 * H * (ridge(math.atan2(p.x, -p.y) * 5 + p.z / H * 20 + n3(p, 6), 2) - 0.4), target=2600),
      scarf, region='body', weight_fn=lambda p: {'neck': 0.6, 'chest': 0.4}, subdiv=0)
# a ponta caindo pela frente, do lado direito dela (−x)
p0 = front('torso', -0.06 * H, top - 0.02 * H, 0.05 * H) or Vector((-0.06 * H, -0.12 * H, top))
end = rod([p0, p0 + Vector((-0.01 * H, -0.02 * H, -0.12 * H)), p0 + Vector((0.0, -0.025 * H, -0.24 * H))], [0.05 * H, 0.046 * H, 0.04 * H], 8, flat=(lambda p: Vector((0, -1, 0)), 0.45))
b.add('scarfEnd', end, scarf, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ BOTAS de cano alto
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f = sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.14 * H, f.z + 0.008 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.01 * H)), toe], [0.048 * H, 0.05 * H, 0.04 * H], step=0.45)
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.14 * H)), Vector((f.x, f.y + 0.004 * H, f.z + 0.24 * H))], [0.062 * H, 0.062 * H, 0.066 * H], step=0.45)
    U.ell(Vector((f.x, f.y + 0.004 * H, f.z + 0.245 * H)), (0.07 * H, 0.068 * H, 0.016 * H))
    b.add('boot' + side, U.mesh(res=0.006, smooth=2, target=1100), boots, region='body', weight_fn=W('k' + side), subdiv=0)
    S2 = Sculpt()
    S2.chain([heel + Vector((0, 0.008 * H, -0.022 * H)), toe + Vector((0, -0.01 * H, -0.006 * H))], [0.055 * H, 0.048 * H], step=0.35)
    so = S2.mesh(res=0.006, smooth=2, target=500)
    so = ([(x, y, max(z, f.z - 0.04 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('bootSole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)
    # a placa da canela (greva)
    k_ = sk['k' + side]
    gv = Sculpt()
    gq = front('leg' + side, f.x, f.z + 0.2 * H, 0.03 * H)
    if gq:
        gv.ell(gq, (0.04 * H, 0.016 * H, 0.08 * H))
        b.add('greave' + side, gv.mesh(res=0.004, smooth=2, target=400), armor, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ o CABELO loiro-platinado CURTO, penteado de lado (risca à esquerda dela, +x)
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


C = Sculpt()
# o couro cabeludo rente (a nuca e os lados curtos)
for i in range(22):
    a = i / 22 * TAU
    for el in (0.25, 0.55, 0.85, 1.15):
        if el < 0.5 and math.cos(a) > 0.45:
            continue  # a testa livre
        q = on_head(a, el, -0.02 * H)
        if q:
            C.ell(q, (0.032 * H, 0.032 * H, 0.026 * H))
C.ell(HCv + Vector((0, 0.01 * H, 0.09 * H)), (0.095 * H, 0.105 * H, 0.055 * H))
# o VOLUME de cima: mechas que nascem na risca (lado +x) e caem para o outro lado (−x), por cima da testa
part_x = 0.045 * H
for k in range(14):
    t = k / 13
    yy = -0.11 * H + 0.2 * H * t
    root = surf('head', Vector((hc.x + part_x, hc.y + yy, hc.z + 0.6 * H)), Vector((0, 0, -1)), 0.01 * H)
    if not root:
        continue
    over = surf('head', Vector((hc.x - 0.02 * H, hc.y + yy * 0.9, hc.z + 0.6 * H)), Vector((0, 0, -1)), 0.022 * H) or root
    fall = surf('head', Vector((hc.x - 0.6 * H, hc.y + yy * 0.8, hc.z + 0.045 * H)), Vector((1, 0, 0)), 0.014 * H)
    pts = [root, over, fall] if fall else [root, over]
    C.chain(pts, [0.02 * H, 0.022 * H, 0.012 * H][:len(pts)], step=0.4)
# a franja varrida caindo na testa do lado −x
for k in range(4):
    root = surf('head', Vector((hc.x + part_x, hc.y - 0.6 * H, hc.z + 0.1 * H - k * 0.006 * H)), Vector((0, 1, 0)), 0.012 * H)
    if root:
        C.chain([root, root + Vector((-0.05 * H, -0.012 * H, -0.02 * H)), root + Vector((-0.1 * H, -0.006 * H, -0.06 * H - 0.012 * H * k))], [0.022 * H, 0.018 * H, 0.008 * H], step=0.4)
b.add('hair', C.mesh(res=0.004, smooth=2, disp=lambda p: 0.0018 * H * (ridge(p.x / H * 90 + p.y / H * 40, 2) - 0.4), target=4200), hairm, region='body', weight_fn=HEAD, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'celestine.blend'), check_existing=False)
