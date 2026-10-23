"""
KEMI (Hexatombe) — public/models/kemi.glb. Refeita com a técnica atual (sculpt_lib: roupa a partir do corpo, metaballs,
relevo, peças coladas na superfície por raio), a partir da ARTE OFICIAL "Arte de Kemi em Hexatombe" e "Arte Kemi de
costas em Hexatombe" (wiki "Kemi") e da descrição: mulher negra de 1,60 m, dreads loiros quase brancos presos num rabo
alto, olhos âmbar, piercing no septo e argolas na orelha.

Referência (de cima a baixo):
  - os DREADS loiros puxados para trás num RABO ALTO, caindo até o meio das costas, e algumas mechas soltas dos dois
    lados do rosto; ARGOLAS na orelha esquerda;
  - o TOP branco curto de alças largas e decote cavado, com a FAIXA marrom-escura por baixo do busto; a BARRIGA à
    mostra (abdômen definido);
  - a MOCHILA preta nas costas com alças de couro claro passando pelos ombros e uma tira cruzada por cima;
  - FAIXAS no braço esquerdo inteiro (do ombro à mão, com pontas compridas penduradas no pulso) e no antebraço e na mão
    direitos;
  - a CALÇA cáqui larga com o cós dobrado, a BOLSA de couro na coxa esquerda, FAIXAS cruzadas na perna esquerda (da
    coxa ao coturno) e no joelho direito;
  - o CASACO marrom AMARRADO na cintura (as mangas dão a volta e o nó fica no quadril esquerdo), caindo pelo lado
    direito e por trás até o meio da canela, abotoado na borda e com a barra escura;
  - COTURNOS cinza-escuros de cano médio, cadarço claro e sola marrom.
A faca, a Sniper Fantasma nas costas e o revólver continuam em código (models/props.js → kemiProps).
  node tools/blender/build.mjs kemi   → public/models/kemi.glb (+ tools/blender/fonte/kemi.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe, shell_grid
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'kemi.glb'
random.seed(2024)

b = Builder(width=0.88, bulk=0.9, height=0.89)  # 1,60 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_kemi', '#3a2216', 0.7)
top_m = material('top_kemi', '#ffffff', 0.85)  # o top branco (textura: malha canelada encardida)
under = material('band_kemi', '#2e2018', 0.8)  # a faixa marrom-escura por baixo do busto
pants = material('pants_kemi', '#ffffff', 0.9)  # a calça cáqui (textura)
pants_cuff = material('pants_kemi_fold', '#a8977a', 0.9)  # o cós dobrado
coat = material('coat_kemi', '#ffffff', 0.85)  # o casaco de pano marrom (textura)
coat_d = material('coat_kemi_hem', '#1e1612', 0.85)  # a barra escura
band = material('bandage_fantasma', '#ffffff', 0.95)  # as faixas (a mesma textura da Fantasma)
pack = material('backpack_kemi', '#26282a', 0.6)
pack_d = material('backpack_kemi_flap', '#1a1c1e', 0.55)
strap = material('strap_kemi', '#8a7256', 0.7)  # as alças de couro claro
pouch = material('pouch_kemi', '#5a3a22', 0.6)
boots = material('boots_kemi', '#2a2a2e', 0.55)
sole = material('sole_kemi', '#4e3624', 0.8)
laces = material('laces_kemi', '#c8c0b0', 0.8)
hairm = material('dreads_kemi', '#cdbb88', 0.8)
silver = material('silver_kemi', '#c0c0c8', 0.3, metal=0.9)
button = material('coat_button', '#5a4630', 0.4, metal=0.4)
M = {
    'skin': skin,
    'face': material('face_kemi', '#ffffff', 0.75),
    'torso': skin,
    'arm': skin,
    'hand': skin,
    'legs': pants,
    'feet': boots,
}
PREVIEW = {'top_kemi': '#dcd6c8', 'pants_kemi': '#9a8a6e', 'coat_kemi': '#5a3c26', 'bandage_fantasma': '#ddd2ba', 'face_kemi': '#3a2216'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.11, 0.158), (0.0, 0.148), (0.17, 0.128), (0.36, 0.18), (0.47, 0.19), (0.57, 0.104), (0.63, 0.062)]
hc = b.body(M, TP, arm_r=(0.054, 0.045, 0.038), leg_r=(0.08, 0.062, 0.05), head_r=(0.132, 0.142, 0.156), feet='bare')


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
    if hit[0] is None:
        return None
    return hit[0] + hit[1] * off


def front(name, x, z, off=0.0, back=False):
    s = 1 if back else -1
    return surf(name, Vector((x, s * 0.6 * H, z)), Vector((0, -s, 0)), off)


def wrap(names, a_, b_, r, turns, off, n=70, phase=0.0, tilt=0.0):
    """espiral em volta do eixo a_→b_ colada na superfície (raio de fora para o eixo); r só dá a direção do raio"""
    pts = []
    for i in range(n + 1):
        t = i / n
        c = a_.lerp(b_, t)
        a = phase + t * turns * TAU
        d = Vector((math.sin(a), -math.cos(a), tilt * math.sin(a))).normalized()
        best = None
        for nm in names:
            q = surf(nm, c + d * 0.4 * H, -d, off)
            if q and (best is None or (q - c).length > (best - c).length):
                best = q
        pts.append(best if best else c + d * r)
    return pts


tor = part('torso')

# ================================================================ BARRIGA à mostra: o abdômen definido e o umbigo
def abs_relief(p):
    if p.y > -0.02 * H or not (hz + 0.02 * H < p.z < hz + 0.3 * H):
        return 0.0
    fade = lim((p.z - hz - 0.02 * H) / (0.05 * H)) * lim((hz + 0.3 * H - p.z) / (0.04 * H))
    d = -0.004 * H * math.exp(-(p.x / (0.008 * H)) ** 2)  # a linha do meio
    for zz in (0.22, 0.16, 0.1):  # as divisões
        d -= 0.0022 * H * math.exp(-((p.z - hz - zz * H) / (0.008 * H)) ** 2) * lim(1 - abs(p.x) / (0.07 * H))
    d -= 0.006 * H * math.exp(-((p.x / (0.009 * H)) ** 2 + ((p.z - hz - 0.07 * H) / (0.009 * H)) ** 2))  # o umbigo
    return d * fade


relief(tor, abs_relief)

# ================================================================ o TOP branco curto (alças largas, decote cavado) e a faixa embaixo
sL = sk['sL']
neck_cut = lambda p: p.y < 0 and p.z > top - 0.13 * H + 0.9 * abs(p.x)  # o decote
arm_hole = lambda p: abs(p.x) > 0.105 * H and p.z > sL.z - 0.1 * H + 0.5 * (abs(p.x) - 0.105 * H)  # as cavas (ombros de fora)
b.add('top', clothe(tor, lambda p: hz + 0.3 * H < p.z < top + 0.02 * H and not neck_cut(p) and not arm_hole(p), 0.009 * H, cuts=2), top_m, region='body', weight_fn=W('torso'), subdiv=0)
# as ALÇAS largas do top passando pelos ombros
for s in (1, -1):
    sp = [front('torso', s * 0.085 * H, top - 0.1 * H, 0.011 * H),
          surf('torso', Vector((s * 0.088 * H, -0.03 * H, top + 0.3 * H)), Vector((0, 0, -1)), 0.011 * H),
          surf('torso', Vector((s * 0.088 * H, 0.03 * H, top + 0.3 * H)), Vector((0, 0, -1)), 0.011 * H),
          front('torso', s * 0.085 * H, top - 0.1 * H, 0.011 * H, back=True)]
    sp = [q for q in sp if q]
    if len(sp) > 2:
        b.add(f'topStrap{s}', rod(sp, 0.016 * H, 6, caps=False, flat=(outward((0, 0)), 0.65)), top_m, region='body', weight_fn=W('torso'), subdiv=0)
# a barra do decote (esconde o serrilhado do recorte)
nk = [front('torso', x * H, top - 0.13 * H + 0.9 * abs(x * H) + 0.004 * H, 0.012 * H) for x in [-0.12 + 0.24 * i / 24 for i in range(25)]]
nk = [q for q in nk if q]
b.add('topTrim', rod(nk, 0.006 * H, 6, caps=False), top_m, region='body', weight_fn=W('torso'), subdiv=0)
b.add('underBand', clothe(tor, lambda p: hz + 0.25 * H < p.z < hz + 0.315 * H, 0.013 * H, cuts=1), under, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ CALÇA cáqui larga: o quadril, as pernas e o cós dobrado
b.add('pantsHip', clothe(tor, lambda p: p.z < hz + 0.03 * H, 0.02 * H, cuts=1), pants, region='body', weight_fn=W('torso'), subdiv=0)
b.add('pantsFold', clothe(tor, lambda p: hz + 0.0 * H < p.z < hz + 0.05 * H, 0.03 * H, cuts=1), pants_cuff, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    leg = part('leg' + side)
    k, f = sk['k' + side], sk['foot' + side]
    pl = b.add('pants' + side, clothe(leg, lambda p, f=f: p.z > f.z + 0.15 * H, 0.03 * H, cuts=1), pants, region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.007 * H * (ridge(p.z / H * 18 + n3(p, 9) * 1.6, 2) - 0.4))  # as dobras do pano largo

# ================================================================ o CASACO amarrado na cintura: as mangas em volta, o nó e o corpo caindo
b.add('coatTie', clothe(tor, lambda p: hz - 0.02 * H < p.z < hz + 0.045 * H, 0.045 * H, cuts=1), coat, region='body', weight_fn=W('torso'), subdiv=0)
kn = front('torso', 0.1 * H, hz + 0.01 * H, 0.06 * H)
K = Sculpt()
K.ell(kn, (0.04 * H, 0.025 * H, 0.032 * H))
K.ell(kn + Vector((0.025 * H, 0.01 * H, -0.03 * H)), (0.025 * H, 0.02 * H, 0.03 * H))
b.add('coatKnot', K.mesh(res=0.005, smooth=2, target=400), coat, region='body', weight_fn=W('torso'), subdiv=0)
# as pontas das mangas saindo do nó
ct = []
for dx, ln in ((0.0, 0.2), (0.035, 0.15)):
    p0 = kn + Vector((dx * H, -0.01 * H, -0.03 * H))
    ct.append(rod([p0, p0 + Vector((0.01 * H, -0.01 * H, -ln * 0.5 * H)), p0 + Vector((0.015 * H, -0.005 * H, -ln * H))], [0.026 * H, 0.03 * H, 0.03 * H], 8))
b.add('coatSleeves', merge(*ct), coat, region='body', weight_fn=lambda p: {'hips': 0.5, 'lL': 0.5}, subdiv=0)

A0, A1 = -0.05, -0.64  # da frente (perto do meio, lado direito dela) passando pelo lado direito e por trás até o lado esquerdo


def coat_len(u):
    # comprido (meio da canela) na frente e no lado direito, mais curto atrás à esquerda
    return (0.66 - 0.32 * lim((u - 0.62) / 0.38)) * H


def coat_pt(u, v):
    a = (A0 + (A1 - A0) * u) * TAU
    ln = coat_len(u)
    rx = (0.215 + 0.08 * v) * H
    ry = (0.165 + 0.06 * v) * H
    fold = 1 + 0.06 * v * (ridge(a * 6 + n3(Vector((a, v, 0)), 3), 2) - 0.4)
    z = hz - 0.0 * H - v * ln
    q = Vector((math.sin(a) * rx * fold / b.k_tx, -math.cos(a) * ry * fold / b.k_ty, z))
    # nunca por dentro da calça: o raio de fora para o eixo acha a calça e o casaco fica sempre um pouco por cima
    d = Vector((q.x, q.y, 0)).normalized()
    for nm in ('pantsHip', 'pantsFold', 'pantsL', 'pantsR'):
        hit = surf(nm, Vector((0, 0, z)) + d * 0.6 * H, -d, 0.0)
        if hit:
            r_need = Vector((hit.x, hit.y, 0)).length + 0.016 * H
            if r_need > Vector((q.x, q.y, 0)).length:
                q = Vector((d.x * r_need, d.y * r_need, z))
    return q


def coat_w(p):
    side = 'L' if p.x > 0 else 'R'
    t = lim((hz - p.z) / (0.6 * H))
    return {'hips': 1 - t * 0.7, ('l' + side): t * 0.5, ('k' + side): t * 0.2}


NU = 44
b.add('coatBody', shell_grid([[coat_pt(j / NU, v) for j in range(NU + 1)] for v in [k / 12 * 0.94 for k in range(13)]], 0.006 * H), coat, region='body', weight_fn=coat_w, subdiv=0)
b.add('coatHem', shell_grid([[coat_pt(j / NU, v) * 1.0 + Vector((0, 0, 0)) for j in range(NU + 1)] for v in [0.93 + 0.07 * k / 2 for k in range(3)]], 0.008 * H), coat_d, region='body', weight_fn=coat_w, subdiv=0)
bts = []
for k in range(6):
    v = 0.1 + k * 0.15
    p = coat_pt(0.012, v)
    p = p + (p - Vector((0, 0, p.z))).normalized() * 0.008 * H
    bts.append(ellipsoid(tuple(p), (0.008 * H, 0.004 * H, 0.008 * H), 8, 5))
b.add('buttons', merge(*bts), button, region='body', weight_fn=coat_w, subdiv=0)

# ================================================================ a BOLSA de couro na coxa esquerda (+x) e a tira em volta da coxa
lL, kL = sk['lL'], sk['kL']
pz = lL.lerp(kL, 0.4)
pp = surf('pantsL', pz + Vector((0.4 * H, -0.06 * H, 0)), Vector((-1, 0.15, 0)), 0.02 * H)
if pp:
    P = Sculpt()
    P.ell(pp, (0.03 * H, 0.03 * H, 0.06 * H))
    P.ell(pp + Vector((0.006 * H, -0.006 * H, 0.045 * H)), (0.034 * H, 0.033 * H, 0.016 * H))  # a tampa
    b.add('pouch', P.mesh(res=0.004, smooth=2, target=500), pouch, region='body', weight_fn=W('legL'), subdiv=0)
    ring = wrap(['pantsL'], pz + Vector((0, 0, -0.02 * H)), pz + Vector((0, 0, -0.02 * H)), 0.1 * H, 1.0, 0.006 * H, n=24)
    b.add('pouchStrap', rod(ring, 0.009 * H, 5, caps=False, flat=(outward((pz.x, pz.y)), 0.3)), pouch, region='body', weight_fn=W('legL'), subdiv=0)

# ================================================================ FAIXAS: braço esquerdo inteiro, antebraço e mão direitos, as pernas
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    names = ['arm' + side, 'hand' + side]
    if side == 'L':
        wr = wrap(names, sh.lerp(e, 0.3), e, 0.06 * H, 9.0, 0.003 * H, n=140) + wrap(names, e, h + Vector((0, 0, -0.035 * H)), 0.045 * H, 14.0, 0.003 * H, n=200)[1:]
    else:
        wr = wrap(names, e.lerp(h, 0.4), h + Vector((0, 0, -0.03 * H)), 0.045 * H, 9.0, 0.003 * H, n=140, phase=1.0)
    b.add('armWrap' + side, rod(wr, 0.012 * H, 5, caps=False, flat=(outward((h.x, h.y)), 0.72)), band, region='body', weight_fn=W('e' + side), subdiv=0)
    p = e.lerp(h, 0.9)
    n_t = 2 if side == 'L' else 1
    tt = [rod([p + Vector((s * 0.035 * H, 0.012 * H, 0)), p + Vector((s * 0.045 * H, 0.02 * H, -0.1 * H)), p + Vector((s * 0.04 * H, 0.025 * H, -(0.2 + 0.07 * k) * H))], 0.011 * H, 5, flat=(outward((p.x, p.y)), 0.2)) for k in range(n_t)]
    b.add('armTails' + side, merge(*tt), band, region='body', weight_fn=W('e' + side), subdiv=0)
# a perna esquerda: as faixas cruzadas da coxa ao coturno; a direita: só o joelho
kR, fL, fR = sk['kR'], sk['footL'], sk['footR']
for ph, tw in ((0.0, 3.0), (math.pi, -3.0)):
    sw = wrap(['pantsL'], lL.lerp(kL, 0.55), kL.lerp(fL, 0.75), 0.1 * H, tw, 0.006 * H, n=90, phase=ph)
    b.add(f'legWrapL{ph:.0f}', rod(sw, 0.0085 * H, 5, caps=False, flat=(outward((kL.x, kL.y)), 0.35)), band, region='body', weight_fn=W('legL'), subdiv=0)
sw = wrap(['pantsR'], kR + Vector((0, 0, 0.05 * H)), kR + Vector((0, 0, -0.06 * H)), 0.1 * H, 2.0, 0.006 * H, n=40, tilt=0.15)
b.add('legWrapR', rod(sw, 0.0085 * H, 5, caps=False, flat=(outward((kR.x, kR.y)), 0.35)), band, region='body', weight_fn=W('kR'), subdiv=0)

# ================================================================ a MOCHILA preta nas costas, a tampa, as alças pelos ombros e a tira cruzada
bk = front('torso', 0.0, hz + 0.4 * H, 0.0, back=True)
pc = bk + Vector((0, 0.07 * H, -0.02 * H))
B = Sculpt()
for dx in (-0.065, 0.065):
    for dz in (-0.1, 0.0, 0.1):
        B.ell(pc + Vector((dx * H, 0.0, dz * H)), (0.075 * H, 0.06 * H, 0.08 * H))
b.add('backpack', B.mesh(res=0.006, smooth=2, target=1200), pack, region='body', weight_fn=W('torso'), subdiv=0)
F = Sculpt()
F.ell(pc + Vector((0, 0.05 * H, 0.09 * H)), (0.14 * H, 0.035 * H, 0.1 * H))  # a tampa por cima
b.add('backpackFlap', F.mesh(res=0.005, smooth=2, target=600), pack_d, region='body', weight_fn=W('torso'), subdiv=0)
st = []
for s in (1, -1):
    x0 = s * 0.075 * H
    pts = [pc + Vector((x0, 0.0, 0.14 * H))]
    over = surf('torso', Vector((s * 0.095 * H, 0.0, top + 0.3 * H)), Vector((0, 0, -1)), 0.012 * H)  # por cima do ombro
    if over:
        pts.append(over)
    for z in (top - 0.05 * H, top - 0.13 * H, hz + 0.32 * H):  # descendo pela frente por cima do top
        q = front('torso', s * 0.1 * H, z, 0.02 * H)
        if q:
            pts.append(q)
    side_p = surf('torso', Vector((s * 0.6 * H, 0.0, hz + 0.27 * H)), Vector((-s, 0, 0)), 0.018 * H)  # por baixo do braço
    if side_p:
        pts.append(side_p)
    pts.append(pc + Vector((s * 0.09 * H, -0.02 * H, -0.12 * H)))
    st.append(rod(pts, 0.012 * H, 6, flat=(outward((0, 0)), 0.45)))
# a tira cruzada por cima da tampa
cr = [surf('backpackFlap', pc + Vector(((0.12 - 0.24 * t) * H, 0.4 * H, (0.13 - 0.2 * t) * H)), Vector((0, -1, 0)), 0.005 * H) for t in [k / 10 for k in range(11)]]
cr = [q for q in cr if q]
if len(cr) > 3:
    st.append(rod(cr, 0.011 * H, 6, flat=(outward((pc.x, pc.y - 0.2 * H)), 0.5)))
b.add('packStraps', merge(*st), strap, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ COTURNOS cinza-escuros de cadarço, sola marrom
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    k, f = sk['k' + side], sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.008 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.012 * H)), toe], [0.05 * H, 0.052 * H, 0.044 * H], step=0.45)
    U.ell(toe + Vector((0, 0.008 * H, 0.01 * H)), (0.046 * H, 0.042 * H, 0.032 * H))
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.1 * H)), Vector((f.x, f.y + 0.004 * H, f.z + 0.17 * H))], [0.066 * H, 0.066 * H, 0.068 * H], step=0.45)
    U.ell(Vector((f.x, f.y + 0.004 * H, f.z + 0.175 * H)), (0.072 * H, 0.07 * H, 0.016 * H))  # a boca do cano
    U.chain([Vector((f.x, f.y - 0.062 * H, f.z + 0.05 * H)), Vector((f.x, f.y - 0.05 * H, f.z + 0.17 * H))], [0.03 * H, 0.026 * H], step=0.45)
    b.add('boot' + side, U.mesh(res=0.006, smooth=2, target=1100), boots, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.008 * H, -0.024 * H)), toe + Vector((0, -0.012 * H, -0.006 * H))], [0.057 * H, 0.051 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=550)
    so = ([(x, y, max(z, f.z - 0.04 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('bootSole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)
    lc = []
    for j in range(7):
        z = f.z + 0.05 * H + j * 0.019 * H
        y = f.y - 0.1 * H + j * 0.0075 * H
        lc.append(rod([Vector((f.x - 0.022 * H, y, z)), Vector((f.x + 0.022 * H, y, z + 0.011 * H))], 0.0035 * H, 4))
        lc.append(rod([Vector((f.x + 0.022 * H, y, z)), Vector((f.x - 0.022 * H, y, z + 0.011 * H))], 0.0035 * H, 4))
    b.add('laces' + side, merge(*lc), laces, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ DREADS: puxados do couro cabeludo para o RABO ALTO, caindo até as costas,
# e as mechas soltas dos lados do rosto
tie = hc + Vector((0, 0.05 * H, 0.15 * H))
D = Sculpt()
D.ell(tie, (0.042 * H, 0.042 * H, 0.03 * H))
NS = 40
for i in range(NS):
    a = i / NS * TAU
    fr = max(0.0, math.cos(a))  # 1 na frente
    hl = hc.z + (-0.07 + 0.15 * fr ** 1.5 + 0.06 * (1 - fr) * abs(math.sin(a))) * H  # a linha do cabelo
    if abs(math.sin(a)) > 0.75 and math.cos(a) > -0.3:
        hl = hc.z + 0.04 * H  # as têmporas (acima das orelhas)
    d = Vector((math.sin(a), -math.cos(a), 0))
    p0 = surf('head', Vector((hc.x, hc.y, hl)) + d * 0.6 * H, -d, 0.004 * H)
    if not p0:
        continue
    mid = (p0 + tie) * 0.5
    dm = (mid - Vector((hc.x, hc.y, hc.z))).normalized()
    pm = surf('head', Vector((hc.x, hc.y, hc.z)) + dm * 0.6 * H, -dm, 0.008 * H) or mid
    D.chain([p0, pm, tie], [0.0085 * H, 0.0095 * H, 0.01 * H], step=0.45)
NL = 24
for i in range(NL):
    a = i / NL * TAU
    dx, dy = math.sin(a) * 0.03 * H, math.cos(a) * 0.028 * H
    ln = (0.5 + 0.12 * random.random()) * H
    sway = 0.022 * H * math.sin(i * 1.3)
    pts = [tie + Vector((dx, dy, 0.0)), tie + Vector((dx * 1.4, dy * 1.4 + 0.02 * H, 0.06 * H)), tie + Vector((dx * 2.2 + sway, dy * 1.8 + 0.07 * H, 0.05 * H)),
           tie + Vector((dx * 2.5 + sway, dy * 1.6 + 0.13 * H, -0.08 * H)), tie + Vector((dx * 2.4 + sway, dy * 1.3 + 0.17 * H, -ln * 0.55)), tie + Vector((dx * 2.4 + sway * 1.5, dy * 1.1 + 0.17 * H, -ln))]
    D.chain(pts, [0.012 * H, 0.012 * H, 0.0115 * H, 0.011 * H, 0.0105 * H, 0.0075 * H], step=0.5)
# as mechas soltas: nascem perto do topo, caem pelos lados do rosto até os ombros
for s in (1, -1):
    for j, (ox, ln) in enumerate(((0.07, 0.3), (0.1, 0.36), (0.045, 0.26))):
        r0 = surf('head', Vector((hc.x + s * ox * H, hc.y - 0.6 * H, hc.z + 0.11 * H)), Vector((0, 1, 0)), 0.012 * H)
        if not r0:
            continue
        side_p = Vector((hc.x + s * (0.128 + 0.012 * j) * H, hc.y - 0.075 * H, hc.z - 0.03 * H))
        D.chain([r0, r0 + Vector((s * 0.05 * H, 0.0, -0.04 * H)), side_p, side_p + Vector((s * 0.02 * H, 0.01 * H, -ln * 0.6 * H)), side_p + Vector((s * 0.025 * H, 0.02 * H, -ln * H))],
                [0.011 * H, 0.011 * H, 0.011 * H, 0.01 * H, 0.007 * H], step=0.5)
b.add('dreads', D.mesh(res=0.0045, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.z / H * 160, 2) - 0.4), target=5200), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
b.add('dreadTie', rod([Vector((tie.x + math.sin(a) * 0.044 * H, tie.y + math.cos(a) * 0.042 * H, tie.z)) for a in [i / 16 * TAU for i in range(17)]], 0.011 * H, 6, caps=False), strap, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# ================================================================ as ARGOLAS na orelha esquerda (+x)
ear = part('ear1')
ec = ear.matrix_world @ (sum((v.co for v in ear.data.vertices), Vector()) / len(ear.data.vertices))
rings = []
for k, (dz, rr) in enumerate(((-0.035, 0.016), (-0.015, 0.011), (0.012, 0.009))):
    c = ec + Vector((0.016 * H, 0.004 * H * k, dz * H))
    rings.append(rod([c + Vector((0, math.sin(a) * rr * H, -math.cos(a) * rr * H + rr * H)) for a in [i / 14 * TAU for i in range(15)]], 0.0022 * H, 5, caps=False))
b.add('earrings', merge(*rings), silver, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'kemi.blend'), check_existing=False)
