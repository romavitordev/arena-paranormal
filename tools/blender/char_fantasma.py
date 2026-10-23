"""
A FANTASMA (Kemi com as faixas, Hexatombe) — public/models/fantasma.glb. Refeita com a técnica atual (sculpt_lib: roupa a
partir do corpo, metaballs, relevo, peças coladas na superfície por raio), a partir da ARTE OFICIAL "Fantasma com
Revólver em Hexatombe" (wiki "Kemi", de frente e de costas) e da descrição: "um grande casaco marrom de couro e gola
alta, acompanhado de suas faixas, que agora escondem seu rosto, deixando apenas seus olhos à mostra".

Referência (de cima a baixo):
  - mulher de 1,60 m; o ROSTO TODO ENFAIXADO (a fresta escura dos olhos é a textura face_fantasma) com voltas de faixa
    em relevo e pontas soltas atrás; os DREADS loiros quase brancos presos num RABO ALTO no topo da cabeça;
  - o SOBRETUDO de couro marrom até acima do joelho, ABOTOADO na frente, a GOLA ALTA levantada e aberta em V, os ombros
    e os cantos da barra REMENDADOS em couro mais escuro, mangas compridas com o punho escuro;
  - a FAIXA de pano amarrada na cintura com o nó e as pontas compridas caindo;
  - as TRÊS FACAS curvas embainhadas na diagonal do peito (lado direito dela) e a alça do rifle cruzando o peito;
  - FAIXAS enroladas nos antebraços e nas mãos, com tiras soltas penduradas;
  - CALÇA marrom larga com FAIXAS cruzadas nas canelas; COTURNOS escuros de cadarço com a sola clara.
O rifle (pingando lodo), a faca e o revólver continuam em código (models/props.js → kemiProps).
A Kemi (sem as faixas) está em char_kemi.py.
  node tools/blender/build.mjs fantasma   → public/models/fantasma.glb (+ tools/blender/fonte/fantasma.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, relief, clothe, shell_grid, chain_mesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'fantasma.glb'
random.seed(1999)

b = Builder(width=0.88, bulk=0.9, height=0.89)  # 1,60 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_kemi', '#3a2216', 0.75)
coat = material('coat_fantasma', '#ffffff', 0.7)  # couro marrom (textura: gasto, costuras)
coat_d = material('coat_fantasma_in', '#24180f', 0.85)  # os remendos escuros, o forro e os punhos
band = material('bandage_fantasma', '#ffffff', 0.95)  # as faixas (textura: trama suja)
band_dk = material('bandage_dirty', '#b8aa8c', 0.95)
pants = material('pants_fantasma', '#ffffff', 0.9)  # a calça larga (textura)
boots = material('boots_kemi', '#1c1612', 0.55)
sole = material('sole_fantasma', '#a8987c', 0.8)
laces = material('laces_kemi', '#c8c0b0', 0.8)
hairm = material('dreads_kemi', '#c8b47a', 0.8)
leather = material('strap_dark', '#1e1612', 0.7)
blade = material('knife_blade_fantasma', '#c8c8cc', 0.25, metal=0.9)
grip = material('knife_grip_fantasma', '#2a2420', 0.6)
button = material('coat_button', '#5a4630', 0.4, metal=0.4)
M = {
    'skin': skin,
    'face': material('face_fantasma', '#ffffff', 0.85),
    'torso': coat,
    'arm': coat,
    'hand': band_dk,  # as mãos enfaixadas
    'legs': pants,
    'feet': boots,
}
PREVIEW = {'coat_fantasma': '#5a3c26', 'face_fantasma': '#ddd2ba', 'bandage_fantasma': '#ddd2ba', 'pants_fantasma': '#4a3a2a'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.158), (0.0, 0.15), (0.17, 0.132), (0.36, 0.182), (0.47, 0.19), (0.57, 0.104), (0.63, 0.062)]
hc = b.body(M, TP, arm_r=(0.056, 0.046, 0.039), leg_r=(0.08, 0.062, 0.05), head_r=(0.132, 0.142, 0.156), feet='bare')


def part(name):
    return next(o for o in b.parts if o.name == name)


for _o in [o for o in b.parts if o.name.startswith('ear')]:  # as orelhas ficam por baixo das faixas
    b.parts.remove(_o)
    bpy.data.objects.remove(_o, do_unlink=True)


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
    if hit[0] is None:
        return None
    return hit[0] + hit[1] * off


def around(name, center, z, off, n=24, a0=0.0, a1=TAU):
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


def spiral(a_, b_, r, turns, n=60, phase=0.0, tilt=0.0):
    pts = []
    for i in range(n + 1):
        t = i / n
        c = a_.lerp(b_, t)
        a = phase + t * turns * TAU
        pts.append(c + Vector((math.sin(a) * r, -math.cos(a) * r, tilt * math.sin(a))))
    return pts


tor = part('torso')

# ================================================================ SOBRETUDO: o tronco (abotoado), a saia até acima do joelho e as mangas
b.add('coatTop', clothe(tor, lambda p: p.z > hz - 0.06 * H and p.z < top + 0.02 * H, 0.017 * H, cuts=1), coat, region='body', weight_fn=W('torso'), subdiv=0)


def skirt_pt(a, v):
    # da cintura (v = 0) até acima do joelho (v = 1): abre um pouco em sino, as dobras afundam embaixo; a frente sobrepõe
    rx = (0.178 + 0.05 * v) * H
    ry = (0.13 + 0.045 * v) * H
    fold = 1 + 0.045 * v * (ridge(a * 7 + n3(Vector((a, v, 0)), 3), 2) - 0.4)
    z = hz - 0.04 * H - v * 0.5 * H
    return Vector((math.sin(a) * rx * fold / b.k_tx, -math.cos(a) * ry * fold / b.k_ty, z))


SL = 0.012  # a abertura entre as abas da frente (quase fechada, como na arte)
rows = [[skirt_pt((SL + (1 - 2 * SL) * j / 60) * TAU, v) for j in range(61)] for v in [k / 10 for k in range(11)]]


def skirt_w(p):
    side = 'L' if p.x > 0 else 'R'
    t = lim((hz - p.z) / (0.5 * H))
    return {'hips': 1 - t * 0.6, ('l' + side): t * 0.45, ('k' + side): t * 0.15}


sk_o = b.add('coatSkirt', shell_grid(rows, 0.007 * H), coat, region='body', weight_fn=skirt_w, subdiv=0)
for side in ('L', 'R'):
    arm = part('arm' + side)
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    zs, ze = sh.z + 0.05 * H, e.lerp(h, 0.55).z
    sl = b.add('coatSleeve' + side, clothe(arm, lambda p, zs=zs, ze=ze: ze < p.z < zs, 0.011 * H, cuts=1), coat, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(sl, lambda p: 0.004 * H * (ridge(p.z / H * 40 + n3(p, 14), 2) - 0.4))  # as dobras do couro no cotovelo
    c = e.lerp(h, 0.55)
    cuff = around('arm' + side, c, c.z, 0.02 * H, n=18)
    if len(cuff) > 6:
        b.add('cuff' + side, rod(cuff, 0.012 * H, 6, caps=False), coat_d, region='body', weight_fn=W('arm' + side), subdiv=0)
# os REMENDOS escuros: ombros e os cantos da barra
for side in (1, -1):
    sh = sk['sL' if side > 0 else 'sR']
    b.add(f'patchShoulder{side}', clothe(tor, lambda p, s=side, sh=sh: s * p.x > 0.09 * H and p.z > sh.z - 0.03 * H, 0.021 * H, cuts=1), coat_d, region='body', weight_fn=W('torso'), subdiv=0)
pr = []
for side in (1, -1):
    for v0, v1, a0, a1 in ((0.8, 1.0, 0.035, 0.07), (0.8, 1.0, 0.93, 0.965)):
        rr = [[skirt_pt(((a0 + (a1 - a0) * j / 6)) * TAU, v) + Vector((0, -0.003 * H, 0)) * 0 for j in range(7)] for v in [v0 + (v1 - v0) * k / 4 for k in range(5)]]
        pr.append(shell_grid([[p + (p - Vector((0, 0, p.z))).normalized() * 0.006 * H for p in r] for r in rr], 0.004 * H))
    break
b.add('patchHem', merge(*pr), coat_d, region='body', weight_fn=skirt_w, subdiv=0)
# os BOTÕES na frente (do peito até a barra)
bts = []
for k in range(9):
    z = top - 0.08 * H - k * 0.105 * H
    p = front('torso', 0.012 * H, z, 0.03 * H) if z > hz - 0.06 * H else skirt_pt(0.012 * TAU, (hz - 0.04 * H - z) / (0.5 * H)) + Vector((0, -0.008 * H, 0))
    if p:
        bts.append(ellipsoid(tuple(p), (0.009 * H, 0.004 * H, 0.009 * H), 8, 5))
b.add('buttons', merge(*bts), button, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ a GOLA ALTA levantada, aberta em V na frente, com as pontas
cr = []
for i in range(7):
    v = i / 6
    row = []
    for j in range(31):
        a = math.radians(30 + 300 * j / 30)  # aberta na frente (±30°)
        r = (0.085 + 0.045 * v) * H  # alarga para cima
        tip = 0.04 * H * max(0.0, math.cos(a)) ** 6 * v  # as pontas da frente sobem mais
        row.append(Vector((math.sin(a) * r, -math.cos(a) * r * 0.92 + 0.005 * H, top + 0.0 * H + v * 0.17 * H + tip)))
    cr.append(row)
b.add('collar', shell_grid(cr, 0.008 * H), coat, region='body', weight_fn=lambda p: {'chest': 0.5, 'neck': 0.5}, subdiv=0)

# ================================================================ a FAIXA amarrada na cintura, o nó e as pontas compridas
b.add('sash', clothe(tor, lambda p: hz + 0.04 * H < p.z < hz + 0.11 * H, 0.034 * H, cuts=1), band, region='body', weight_fn=W('torso'), subdiv=0)
kn = front('torso', 0.06 * H, hz + 0.075 * H, 0.05 * H)
K = Sculpt()
K.ell(kn, (0.028 * H, 0.016 * H, 0.024 * H))
b.add('sashKnot', K.mesh(res=0.004, smooth=2, target=300), band, region='body', weight_fn=W('torso'), subdiv=0)
tails = []
for dx, ln in ((0.0, 0.42), (0.03, 0.34)):
    p0 = kn + Vector((dx * H, -0.004 * H, -0.01 * H))
    tails.append(rod([p0, p0 + Vector((0.01 * H, -0.02 * H, -ln * 0.4 * H)), p0 + Vector((0.004 * H, -0.03 * H, -ln * 0.8 * H)), p0 + Vector((0.012 * H, -0.03 * H, -ln * H))], 0.016 * H, 6, flat=(outward((0, 0)), 0.2)))
b.add('sashTails', merge(*tails), band, region='body', weight_fn=lambda p: {'hips': 0.6, 'lL': 0.4}, subdiv=0)

# ================================================================ as TRÊS FACAS curvas embainhadas na diagonal do peito (lado direito dela: -x)
kv = []
kg = []
ks = []
for i in range(3):
    base = front('torso', (-0.05 - i * 0.03) * H, hz + (0.36 - i * 0.04) * H, 0.032 * H)
    if not base:
        continue
    d = Vector((-0.35, -0.08, -1)).normalized()
    ks.append(rod([base, base + d * 0.12 * H], 0.013 * H, 6, flat=(outward((0, 0)), 0.5)))  # a bainha
    kg.append(rod([base, base - d * 0.06 * H], 0.009 * H, 6))  # o cabo para cima
    tip = base + d * 0.13 * H
    kv.append(rod([base + d * 0.11 * H, tip + Vector((-0.02 * H, 0, 0.005 * H)), tip + Vector((-0.03 * H, 0, 0.03 * H))], [0.007 * H, 0.005 * H, 0.001 * H], 5))  # a ponta curva aparecendo
b.add('knifeSheaths', merge(*ks), leather, region='body', weight_fn=W('torso'), subdiv=0)
b.add('knifeGrips', merge(*kg), grip, region='body', weight_fn=W('torso'), subdiv=0)
b.add('knifeBlades', merge(*kv), blade, region='body', weight_fn=W('torso'), subdiv=0)
# a alça do rifle cruzando o peito (do ombro esquerdo dela ao quadril direito)
strap = [p for p in (front('torso', (0.13 - 0.27 * t) * H, (top - 0.02 * H) * (1 - t) + (hz + 0.12 * H) * t, 0.03 * H) for t in [k / 10 for k in range(11)]) if p]
b.add('rifleStrap', rod(strap, 0.014 * H, 6, flat=(outward((0, 0)), 0.3)), leather, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ FAIXAS nos antebraços e nas mãos, com as tiras soltas
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    e, h = sk['e' + side], sk['hand' + side]
    wr = spiral(e.lerp(h, 0.55), h + Vector((0, 0, -0.03 * H)), 0.042 * H, 4.5, n=80, tilt=0.008 * H)
    b.add('armWrap' + side, rod(wr, 0.0075 * H, 5, caps=False, flat=(outward((h.x, h.y)), 0.35)), band, region='body', weight_fn=W('e' + side), subdiv=0)
    p = e.lerp(h, 0.85)
    tt = [rod([p + Vector((s * 0.04 * H, 0.01 * H, 0)), p + Vector((s * 0.05 * H, 0.02 * H, -0.08 * H)), p + Vector((s * 0.045 * H, 0.03 * H, -(0.16 + 0.05 * k) * H))], 0.012 * H, 5, flat=(outward((p.x, p.y)), 0.2)) for k in range(2)]
    b.add('armTails' + side, merge(*tt), band, region='body', weight_fn=W('e' + side), subdiv=0)

# ================================================================ CALÇA marrom larga e as FAIXAS cruzadas nas canelas
for side in ('L', 'R'):
    leg = part('leg' + side)
    k, f = sk['k' + side], sk['foot' + side]
    pl = b.add('pants' + side, clothe(leg, lambda p, f=f: p.z > f.z + 0.14 * H, 0.02 * H, cuts=1), pants, region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.005 * H * (ridge(p.z / H * 22 + n3(p, 10) * 1.5, 2) - 0.4))
    # as faixas cruzadas: duas espirais em sentidos opostos (o X)
    for ph, tw in ((0.0, 2.5), (math.pi, -2.5)):
        sw = spiral(k.lerp(f, 0.12), k.lerp(f, 0.78), 0.094 * H, tw, n=60, phase=ph)
        b.add(f'shinWrap{side}{ph:.0f}', rod(sw, 0.009 * H, 5, caps=False, flat=(outward((k.x, k.y)), 0.35)), band, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ COTURNOS escuros de cadarço, sola clara
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    k, f = sk['k' + side], sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.008 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.012 * H)), toe], [0.05 * H, 0.052 * H, 0.044 * H], step=0.45)
    U.ell(toe + Vector((0, 0.008 * H, 0.01 * H)), (0.046 * H, 0.042 * H, 0.032 * H))
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.1 * H)), Vector((f.x, f.y + 0.004 * H, f.z + 0.16 * H))], [0.064 * H, 0.062 * H, 0.062 * H], step=0.45)
    U.ell(Vector((f.x, f.y + 0.004 * H, f.z + 0.165 * H)), (0.068 * H, 0.066 * H, 0.016 * H))  # a boca do cano dobrada
    U.chain([Vector((f.x, f.y - 0.062 * H, f.z + 0.05 * H)), Vector((f.x, f.y - 0.048 * H, f.z + 0.17 * H))], [0.03 * H, 0.026 * H], step=0.45)
    b.add('boot' + side, U.mesh(res=0.006, smooth=2, target=1100), boots, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.008 * H, -0.024 * H)), toe + Vector((0, -0.012 * H, -0.006 * H))], [0.056 * H, 0.05 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=550)
    so = ([(x, y, max(z, f.z - 0.036 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('bootSole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)
    lc = []
    for j in range(6):
        z = f.z + 0.05 * H + j * 0.02 * H
        y = f.y - 0.1 * H + j * 0.008 * H
        lc.append(rod([Vector((f.x - 0.02 * H, y, z)), Vector((f.x + 0.02 * H, y, z + 0.011 * H))], 0.0035 * H, 4))
        lc.append(rod([Vector((f.x + 0.02 * H, y, z)), Vector((f.x - 0.02 * H, y, z + 0.011 * H))], 0.0035 * H, 4))
    b.add('laces' + side, merge(*lc), laces, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CABEÇA: as voltas de faixa em relevo e as pontas soltas atrás
hw = []
for k in range(5):
    tilt = 0.1 * math.sin(k * 1.7)
    z0 = hc.z + (0.1 - k * 0.045) * H
    pts = []
    for i in range(29):
        a = i / 28 * TAU
        if k == 2 and (a < 0.3 * TAU or a > 0.7 * TAU):  # a volta da altura dos olhos só passa por trás: a fresta fica à mostra
            continue
        d = Vector((math.sin(a), -math.cos(a), tilt * math.sin(a))).normalized()
        q = surf('head', Vector((hc.x, hc.y, z0)) + d * 0.6 * H, -d, 0.008 * H)
        if q:
            pts.append(q)
    if len(pts) > 10:
        hw.append(rod(pts, 0.009 * H, 5, caps=False, flat=(outward((hc.x, hc.y)), 0.35)))
for dx, ln in ((0.02, 0.2), (-0.025, 0.26)):
    p0 = hc + Vector((dx * H, 0.14 * H, 0.0))
    hw.append(rod([p0, p0 + Vector((dx * 0.5 * H, 0.04 * H, -ln * 0.5 * H)), p0 + Vector((dx * H, 0.05 * H, -ln * H))], 0.014 * H, 5, flat=(outward((hc.x, hc.y)), 0.2)))
b.add('headWraps', merge(*hw), band, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# ================================================================ DREADS loiros presos num RABO ALTO no topo da cabeça
tie = hc + Vector((0, 0.04 * H, 0.16 * H))
D = Sculpt()
D.ell(tie, (0.04 * H, 0.04 * H, 0.03 * H))
NL = 22
for i in range(NL):
    a = i / NL * TAU
    dx, dy = math.sin(a) * 0.028 * H, math.cos(a) * 0.026 * H
    ln = (0.34 + 0.12 * random.random()) * H
    sway = 0.02 * H * math.sin(i * 1.3)
    pts = [tie + Vector((dx, dy, 0.0)), tie + Vector((dx * 1.4, dy * 1.4 + 0.02 * H, 0.06 * H)), tie + Vector((dx * 2.2 + sway, dy * 1.8 + 0.07 * H, 0.04 * H)),
           tie + Vector((dx * 2.6 + sway, dy * 1.8 + 0.12 * H, -0.08 * H)), tie + Vector((dx * 2.8 + sway, dy * 1.6 + 0.14 * H, -ln * 0.6)), tie + Vector((dx * 3.0 + sway, dy * 1.4 + 0.14 * H, -ln))]
    D.chain(pts, [0.013 * H, 0.013 * H, 0.012 * H, 0.012 * H, 0.011 * H, 0.008 * H], step=0.5)
b.add('dreads', D.mesh(res=0.0045, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.z / H * 160, 2) - 0.4), target=3600), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
b.add('dreadTie', rod([Vector((tie.x + math.sin(a) * 0.042 * H, tie.y + math.cos(a) * 0.04 * H, tie.z)) for a in [i / 16 * TAU for i in range(17)]], 0.012 * H, 6, caps=False), band, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'fantasma.blend'), check_existing=False)
