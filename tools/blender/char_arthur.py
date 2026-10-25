"""
ARTHUR CERVERO (Calamidade) — public/models/arthur.glb. Refeito com a técnica atual (sculpt_lib: roupa a partir do corpo,
metaballs, relevo, peças coladas na superfície por raio), a partir da ARTE OFICIAL "Miniatura do Arthur em Calamidade"
(wiki "Arthur Cervero") e do texto da wiki. 1,65 m, baixo e forte. Possui SÓ o braço DIREITO.

Referência (de cima a baixo):
  - cabelo castanho na altura dos ombros, MEIO-PRESO num rabinho atrás, com as mechas BRANCAS largas do lado direito
    dele (Afinidade com Sangue); barba cheia grisalha com o bigode castanho; a cicatriz diagonal e os olhos de cores
    diferentes (textura face_abutre); brincos na orelha esquerda;
  - camisa social clara, gola aberta, a manga direita dobrada até o cotovelo; do lado esquerdo a manga VAZIA dobrada e
    presa (nenhuma animação a move);
  - COLETE PRETO fechado por uma fileira de botões, bolsos com aba no peito e na barriga, o brasão dos Gaudérios Abutres
    (escudo com asas) do lado ESQUERDO (+x); a ALÇA da capa de guitarra cruzando o peito do quadril direito ao ombro
    esquerdo; a Marca do Guaxinim tatuada na mão direita (textura hand_abutre);
  - calça preta com bolsos grandes e amarrações nas coxas; tênis de cano alto com o cadarço e o solado claros.
A capa de guitarra, a sniper, a Arma de Sangue e os olhos do Rebirth continuam em código (models/props.js).
  node tools/blender/build.mjs arthur   → public/models/arthur.glb (+ tools/blender/fonte/arthur.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'arthur.glb'
random.seed(2207)

b = Builder(width=1.0, bulk=1.06, height=0.93)  # 1,65 m (mais baixo e forte)
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_abutre', '#c09a80', 0.8)
shirt = material('shirt_cream', '#e2dcbc', 0.85)
vest = material('vest', '#1e1e21', 0.8)
pants = material('pants_abutre', '#26272b', 0.9)
shoes = material('boots_abutre', '#18181a', 0.7)
solem = material('sneaker_sole', '#d8d6d0', 0.7)
lace = material('sneaker_lace', '#bcbab4', 0.8)
button = material('buttons', '#8a8a90', 0.4, metal=0.6)
crest_m = material('crest_abutres', '#8c8a86', 0.5, metal=0.3)
strapm = material('case_strap', '#141416', 0.7)
beltm = material('belt_abutre', '#241c16', 0.7)
hairm = material('hair_brown', '#3e3028', 0.6)
gray = material('hair_gray', '#d2cec6', 0.6)
beard = material('beard_gray', '#6a635c', 0.85)
stache = material('mustache', '#4a3626', 0.8)
tie_m = material('hair_tie', '#141414', 0.6)
metal = material('earring', '#c8c8cc', 0.3, metal=0.9)
M = {
    'skin': skin,
    'face': material('face_abutre', '#ffffff', 0.8),
    'torso': shirt,
    'arm': shirt,
    'handR': material('hand_abutre', '#ffffff', 0.8),  # a Marca do Guaxinim tatuada (textura)
    'hand': skin,
    'legs': pants,
    'feet': shoes,
}
PREVIEW = {'face_abutre': '#c09a80', 'hand_abutre': '#c09a80'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.17), (0.0, 0.17), (0.18, 0.168), (0.38, 0.214), (0.5, 0.224), (0.6, 0.12), (0.66, 0.07)]
hc = b.body(M, TP, arms=('R',), feet='bare')


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
        out.append(q if q else c + d * 0.08 * H)
    return out


tor = part('torso')
relief(tor, lambda p: 0.004 * H * (ridge(p.z / H * 16 + n3(p, 8) * 1.4, 2) - 0.4))

# ================================================================ a calça sobe até o cinto (nada de camisa aparecendo entre o colete e a calça)
b.add('pantsHip', clothe(tor, lambda p: p.z < hz + 0.04 * H, 0.012 * H, cuts=1), pants, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ o COLETE PRETO, fechado na frente, da cintura ao peito; a gola da camisa
# aparece num V estreito em cima; as cavas ficam abertas (a manga da camisa sai por elas)
def in_vest(p):
    if not (hz - 0.02 * H < p.z < top - 0.02 * H):
        return False
    if p.x < -0.16 * H and p.z > hz + 0.4 * H and abs(p.y) < 0.1 * H:
        return False  # a cava do lado DIREITO (-x); do esquerdo não tem braço: o colete fecha
    return True


vest_o = b.add('vest', clothe(tor, in_vest, 0.02 * H, cuts=1), vest, region='body', weight_fn=W('torso'), subdiv=0)
relief(vest_o, lambda p: 0.004 * H * (ridge(p.z / H * 10 + n3(p, 6), 2) - 0.4))
bts = [front('vest', 0.0, hz + (0.04 + 0.085 * i) * H, 0.004 * H) for i in range(5)]
b.add('vestButtons', merge(*[ellipsoid(tuple(q), (0.01 * H, 0.006 * H, 0.01 * H), 6, 4) for q in bts if q]), button, region='body', weight_fn=W('torso'), subdiv=0)
pk = []
for s in (1, -1):
    for z, w, h_ in ((hz + 0.34 * H, 0.075, 0.06), (hz + 0.1 * H, 0.085, 0.07)):
        c = front('vest', s * 0.1 * H, z, 0.006 * H)
        if c:
            pk.append(box(tuple(c), (w * H, 0.008 * H, h_ * H), bevel=0.003))
            pk.append(box(tuple(c + Vector((0, -0.005 * H, h_ * 0.45 * H))), ((w + 0.006) * H, 0.01 * H, 0.02 * H), bevel=0.003))
b.add('vestPockets', merge(*pk), vest, region='body', weight_fn=W('torso'), subdiv=0)
# o BRASÃO dos Gaudérios Abutres no lado esquerdo: o escudo e as duas asas abertas
cr = front('vest', 0.1 * H, hz + 0.43 * H, 0.012 * H)
if cr:
    parts_ = [ellipsoid(tuple(cr), (0.02 * H, 0.006 * H, 0.025 * H), 8, 6)]
    for s in (1, -1):
        for k in range(3):
            parts_.append(ellipsoid(tuple(cr + Vector((s * (0.025 + k * 0.012) * H, 0.002 * H, (0.008 - k * 0.006) * H))), (0.012 * H, 0.004 * H, (0.016 - k * 0.003) * H), 6, 4))
    b.add('crest', merge(*parts_), crest_m, region='body', weight_fn=W('torso'), subdiv=0)
# a gola aberta da camisa, as pontas deitadas sobre o colete
for s in (1, -1):
    pts = [front('vest', s * (0.025 + 0.055 * t) * H, top + 0.03 * H - 0.11 * H * t, 0.012 * H) or front('torso', s * (0.025 + 0.055 * t) * H, top + 0.03 * H - 0.11 * H * t, 0.02 * H) for t in (0.0, 0.35, 0.7, 1.0)]
    pts = [q for q in pts if q]
    if len(pts) > 2:
        b.add(f'collar{s}', rod(pts, [0.026 * H, 0.032 * H, 0.026 * H, 0.006 * H][:len(pts)], 6, flat=(outward((0, 0)), 0.22)), shirt, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ o braço DIREITO: manga dobrada até o cotovelo, o antebraço de fora
armR = part('armR')
sR, eR, hR = sk['sR'], sk['eR'], sk['handR']
b.add('forearmR', clothe(armR, lambda p: p.z < eR.z - 0.03 * H, 0.003 * H, cuts=1), skin, region='body', weight_fn=W('eR'), subdiv=0)
b.add('rolledSleeve', rod(limb_ring('armR', eR + (hR - eR).normalized() * 0.02 * H, hR - eR, 0.016 * H), 0.022 * H, 6, caps=False), shirt, region='body', weight_fn=W('armR'), subdiv=0)

# ================================================================ o lado ESQUERDO: o ombro e a manga VAZIA dobrada e presa junto ao corpo
sL = sk['sL']
Sl = Sculpt()
Sl.ell(Vector((sL.x - 0.015 * H, 0, sL.z - 0.02 * H)), (0.07 * H, 0.075 * H, 0.068 * H))
Sl.chain([Vector((sL.x, -0.01 * H, sL.z - 0.06 * H)), Vector((sL.x + 0.012 * H, -0.025 * H, sL.z - 0.22 * H)), Vector((sL.x + 0.008 * H, -0.04 * H, sL.z - 0.34 * H))],
         [0.042 * H, 0.03 * H, 0.028 * H], step=0.45)
b.add('emptySleeve', Sl.mesh(res=0.006, smooth=2, disp=lambda p: 0.004 * H * (ridge(p.z / H * 30 + n3(p, 10), 2) - 0.4), target=1200), shirt, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ a ALÇA da capa de guitarra: do quadril direito, cruzando o peito, por cima do ombro esquerdo
st = [front('vest', (-0.16 + 0.26 * t) * H, hz + (0.06 + 0.52 * t) * H, 0.014 * H) for t in [k / 12 for k in range(13)]]
st = [q for q in st if q]
ov = surf('emptySleeve', Vector((sL.x - 0.03 * H, 0.0, top + 0.5 * H)), Vector((0, 0, -1)), 0.012 * H) or surf('torso', Vector((0.12 * H, 0.0, top + 0.5 * H)), Vector((0, 0, -1)), 0.02 * H)
if ov:
    st.append(ov)
bk = front('vest', 0.08 * H, hz + 0.45 * H, 0.014 * H, back=True)
if bk:
    st.append(bk)
b.add('caseStrap', rod(st, 0.018 * H, 6, flat=(outward((0, 0)), 0.3)), strapm, region='body', weight_fn=W('torso'), subdiv=0)
bq = front('vest', -0.06 * H, hz + 0.24 * H, 0.03 * H)
if bq:
    b.add('strapBuckle', box(tuple(bq), (0.034 * H, 0.008 * H, 0.024 * H), bevel=0.002), button, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ CALÇA preta: cinto, bolsos grandes, amarrações nas coxas
bl = around('pantsHip', hz + 0.01 * H, 0.004 * H)
b.add('belt', rod(bl, 0.02 * H, 6, caps=False, flat=(outward((0, 0)), 0.35)), beltm, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    leg = part('leg' + side)
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    pl = b.add('pants' + side, clothe(leg, lambda p, f=f: p.z > f.z + 0.12 * H, 0.014 * H, cuts=1), pants, region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.006 * H * (ridge(p.z / H * 20 + n3(p, 9) * 1.5, 2) - 0.4))
    # o bolso lateral grande na coxa: a peça é feita colada na superfície (raios de fora para dentro)
    cz = l.lerp(k, 0.5).z
    C = Sculpt()
    for dz in (-0.05, 0.0, 0.05):
        for dy in (-0.03, 0.03):
            q = surf('pants' + side, Vector((s * 0.6 * H, l.y + dy * H, cz + dz * H)), Vector((-s, 0, 0)), 0.006 * H)
            if q:
                C.ell(q, (0.022 * H, 0.04 * H, 0.04 * H))
    if C.els:
        b.add('cargo' + side, C.mesh(res=0.005, smooth=2, target=600), pants, region='body', weight_fn=W('leg' + side), subdiv=0)
    for t in (0.25, 0.72):
        c = l.lerp(k, t)
        b.add(f'tie{side}{t}', rod(limb_ring('pants' + side, c, k - l, 0.006 * H, 20), 0.01 * H, 5, caps=False), strapm, region='body', weight_fn=W('leg' + side), subdiv=0)

# ================================================================ TÊNIS de cano alto pretos, cadarço claro na frente, solado branco
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f, k = sk['foot' + side], sk['k' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.155 * H, f.z + 0.008 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.012 * H)), toe], [0.052 * H, 0.054 * H, 0.046 * H], step=0.45)
    U.ell(toe + Vector((0, 0.008 * H, 0.01 * H)), (0.048 * H, 0.044 * H, 0.03 * H))
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), f.lerp(k, 0.38)], [0.064 * H, 0.06 * H], step=0.45)  # o cano alto
    b.add('shoe' + side, U.mesh(res=0.006, smooth=2, target=1000), shoes, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.008 * H, -0.024 * H)), toe + Vector((0, -0.012 * H, -0.006 * H))], [0.058 * H, 0.052 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=500)
    so = ([(x, y, max(z, f.z - 0.036 * H) if z < f.z - 0.006 * H else min(z, f.z + 0.004 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('sole' + side, so, solem, region='body', weight_fn=W('k' + side), subdiv=0)
    lc = [surf('shoe' + side, Vector((f.x, f.y - 0.5 * H, z)), Vector((0, 1, 0)), 0.003 * H) for z in [f.z + 0.03 * H + (f.lerp(k, 0.36).z - f.z - 0.03 * H) * t for t in [j / 8 for j in range(9)]]]
    lc = [q for q in lc if q]
    if len(lc) > 2:
        b.add('laces' + side, rod(lc, 0.012 * H, 5, caps=False, flat=(lambda p: Vector((0, -1, 0)), 0.3)), lace, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CABELO castanho até os ombros, MEIO-PRESO num rabinho atrás, com as mechas brancas
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


def white_side(a):
    """as mechas brancas: a faixa larga do lado DIREITO dele (-x), da frente até o meio da cabeça"""
    return -1.25 < a < -0.35


D = Sculpt()   # castanho
G = Sculpt()   # branco
# a calota colada na cabeça
for i in range(28):
    for j in range(6):
        a = (i / 28 - 0.5) * TAU
        el = 0.25 + 0.6 * j / 5
        if math.cos(a) > 0.5 and el < 0.78:
            continue  # testa e rosto
        q = on_head(a, el, (0.03 if abs(math.sin(a)) > 0.8 and el < 0.5 else 0.008) * H)  # o cabelo solto cobre as orelhas
        if q:
            (G if white_side(a) and el > 0.45 else D).ell(q, (0.03 * H, 0.03 * H, 0.026 * H))
# o NÓ do meio-preso atrás e no alto, e o rabinho caindo pela nuca
knot = on_head(math.pi, 0.85, 0.035 * H)
if knot:
    D.ell(knot, (0.04 * H, 0.036 * H, 0.032 * H))
    D.chain([knot, knot + Vector((0, 0.035 * H, -0.06 * H)), knot + Vector((0, 0.045 * H, -0.13 * H))], [0.028 * H, 0.022 * H, 0.007 * H], step=0.5)
    b.add('hairTie', rod([knot + Vector((math.cos(a) * 0.03 * H, 0.012 * H + math.sin(a) * 0.004 * H, math.sin(a) * 0.03 * H)) for a in [k / 12 * TAU for k in range(13)]], 0.006 * H, 4, caps=False),
          tie_m, region='body', weight_fn=HEAD, subdiv=0)
# as mechas do alto, puxadas da testa até o nó (as do lado direito brancas)
for i in range(17):
    a0 = (i / 16 - 0.5) * 2.2
    pts = [on_head(a0 * 0.75, 0.97 - 0.1 * abs(a0), 0.018 * H), on_head(a0 * 0.75, 1.3, 0.026 * H)]
    pts = [q for q in pts if q] + ([knot] if knot else [])
    if len(pts) > 2:
        (G if white_side(a0 * 0.75) else D).chain(pts, [0.018 * H, 0.02 * H, 0.014 * H], step=0.5)
# o resto SOLTO: das laterais e da nuca, caindo até a altura dos ombros
rnd = random.Random(31)
for i in range(16):
    a = (i / 15 - 0.5) * 2 * 2.5  # dos lados (±1,25 rad) passando pela nuca
    a = math.copysign(1.15 + (abs(a) - 0.0) * 0.4, a) if abs(a) < 0.01 else math.copysign(min(math.pi, 1.15 + abs(a) * 0.8), a)
    p0 = on_head(a, 0.42, 0.014 * H)
    if not p0:
        continue
    d = Vector((math.sin(a), -math.cos(a), 0)).normalized()
    ln = rnd.uniform(0.22, 0.28) * H
    pts = [p0 + Vector((0, 0, 0.03 * H)), p0, p0 + d * 0.025 * H + Vector((0, 0.008 * H, -ln * 0.45)), p0 + d * 0.035 * H + Vector((0, 0.012 * H, -ln * 0.8)), p0 + d * 0.035 * H + Vector((0, 0.015 * H, -ln))]
    (G if white_side(a) and i % 2 == 0 else D).chain(pts, [0.024 * H, 0.026 * H, 0.024 * H, 0.016 * H, 0.005 * H], step=0.5)
# uma mecha branca solta na testa (lado direito dele)
p0 = on_head(-0.35, 0.9, 0.018 * H)
if p0:
    G.chain([p0, p0 + Vector((-0.012 * H, -0.022 * H, -0.06 * H)), p0 + Vector((-0.018 * H, -0.026 * H, -0.1 * H))], [0.011 * H, 0.008 * H, 0.003 * H], step=0.5)
hd_ = lambda p: 0.002 * H * (ridge(p.x / H * 100 + p.z / H * 30 + n3(p, 30), 2) - 0.4)
b.add('hair', D.mesh(res=0.0045, smooth=2, disp=hd_, target=5000), hairm, region='body', weight_fn=HEAD, subdiv=0)
b.add('hairStreak', G.mesh(res=0.0045, smooth=2, disp=hd_, target=1800), gray, region='body', weight_fn=HEAD, subdiv=0)

# ================================================================ BARBA cheia grisalha colada no queixo e nas bochechas (a boca livre)
# (no rosto: olhos em el ≈ +0,18, a boca em ≈ −0,47, o queixo em ≈ −0,75)
B = Sculpt()
for i in range(19):
    a = (i / 18 - 0.5) * 2.7
    for el in (-0.3, -0.45, -0.6, -0.75):
        if abs(a) < 0.34 and el > -0.55:
            continue  # a boca e o bigode
        if abs(a) < 0.75 and el > -0.42:
            continue  # as bochechas acima da linha da boca ficam livres
        q = on_head(a, el, 0.003 * H)
        if q:
            B.ell(q, (0.024 * H, 0.024 * H, 0.022 * H))
# as costeletas subindo até a orelha
for s in (1, -1):
    for el in (-0.05, 0.1):
        q = on_head(s * 1.2, el, 0.003 * H)
        if q:
            B.ell(q, (0.02 * H, 0.02 * H, 0.024 * H))
chin = on_head(0.0, -0.8, 0.014 * H)
if chin:
    B.chain([chin, chin + Vector((0, -0.012 * H, -0.05 * H))], [0.03 * H, 0.012 * H], step=0.5)
b.add('beard', B.mesh(res=0.004, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 140 + p.z / H * 40, 2) - 0.4), target=2500), beard, region='body', weight_fn=HEAD, subdiv=0)
# o BIGODE castanho caindo pelos cantos da boca até a barba
Mu = Sculpt()
for s in (1, -1):
    pts = [on_head(s * a, el, 0.012 * H) for a, el in ((0.03, -0.36), (0.16, -0.38), (0.28, -0.45), (0.31, -0.58))]
    pts = [q for q in pts if q]
    if len(pts) > 1:
        Mu.chain(pts, [0.013 * H, 0.015 * H, 0.011 * H, 0.007 * H][:len(pts)], step=0.45)
b.add('mustache', Mu.mesh(res=0.0035, smooth=2, target=1000), stache, region='body', weight_fn=HEAD, subdiv=0)

# brincos na orelha esquerda (+x)
ears = [o for o in b.parts if o.name.startswith('ear')]
ear = max(ears, key=lambda o: (o.matrix_world @ o.data.vertices[0].co).x) if ears else None
if ear:
    ec = ear.matrix_world @ (sum((v.co for v in ear.data.vertices), Vector()) / len(ear.data.vertices))
    for i in range(2):
        b.add(f'earring{i}', ellipsoid(tuple(ec + Vector((0.01 * H, (-0.004 + i * 0.012) * H, (-0.03 - i * 0.012) * H))), (0.006 * H, 0.006 * H, 0.006 * H), 6, 4), metal, region='body', weight_fn=HEAD, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'arthur.blend'), check_existing=False)
