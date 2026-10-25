"""
KAISER (Cesar Oliveira Cohen, Desconjuração) — public/models/kaiser.glb. Refeito com a técnica atual (sculpt_lib: roupa a
partir do corpo, metaballs, relevo, peças coladas na superfície por raio), a partir da ARTE OFICIAL "Miniatura Kaiser 50%
em Desconjuração" (wiki "Cesar Oliveira Cohen") e do texto da wiki: depois do ataque da Degolificada no orfanato a METADE
ESQUERDA do corpo ficou queimada (sem barba, sem a sobrancelha esquerda, boa parte do cabelo), o casaco virou do avesso,
cheio de buracos; com 50% de exposição os olhos ficaram roxos e o braço direito ganhou tatuagens de flores, tapadas pelas
faixas.

Referência (de cima a baixo):
  - cabelo preto bagunçado, a franja caindo sobre o lado DIREITO; do lado esquerdo (queimado) o cabelo é curto e ralo;
    o rosto queimado à esquerda (textura face_cineraria), cigarro no canto da boca, argola na orelha direita;
  - gola alta preta CANELADA; o casacão cinza-claro largo, ABERTO, com o capuz caído atrás, os painéis ROXOS dos lados,
    os bolsos com aba no peito e a barra rasgada; a manga ESQUERDA queimada (sobra a cava esfiapada): o braço esquerdo
    mostra a pele queimada até o cotovelo e a manga preta da gola alta no antebraço; a manga direita vai até o cotovelo;
  - FAIXAS no antebraço e na mão direitos; a ALÇA marrom transversal (a Polaroid) e a mochila escura com alças roxas;
  - calça preta com FAIXAS nas canelas; tênis pretos com a faixa roxa.
A M4, a Desert Eagle e a karambit vermelha continuam em código (models/props.js → addKaiserProps).
  node tools/blender/build.mjs kaiser   → public/models/kaiser.glb (+ tools/blender/fonte/kaiser.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe, shell_grid
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'kaiser.glb'
random.seed(1750)

b = Builder(width=1.0, bulk=1.05, height=0.97)  # 1,75 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_cineraria', '#c49478', 0.8)
burn = material('skin_burn_kaiser', '#ffffff', 0.85)  # a pele queimada do braço esquerdo (textura)
turtle = material('turtleneck_kaiser', '#ffffff', 0.9)  # a gola alta preta canelada (textura)
jacket = material('jacket_kaiser', '#ffffff', 0.85)  # o casacão cinza-claro gasto, com buracos (textura)
purple = material('purple_kaiser', '#5e2f96', 0.75)
pants = material('pants_kaiser', '#ffffff', 0.9)  # a calça preta (textura)
band = material('bandage_fantasma', '#ffffff', 0.95)  # as faixas (a mesma textura encardida)
shoes = material('sneakers_kaiser', '#18181c', 0.65)
sole = material('sole_kaiser', '#2a2a30', 0.8)
hairm = material('hair_kaiser', '#121214', 0.6)
strapm = material('strap_brown', '#5a3e28', 0.8)
pack = material('backpack_kaiser', '#22202a', 0.75)
cam = material('polaroid_kaiser', '#e8e6de', 0.5)
camy = material('polaroid_yellow', '#e0b630', 0.5)
silver = material('silver_kaiser', '#b8b8c0', 0.3, metal=0.9)
cig = material('cigarette', '#f2efe8', 0.8)
ember = material('ember', '#ff6a20', 0.5, emission='#ff5a10', strength=4)
M = {
    'skin': skin,
    'face': material('face_cineraria', '#ffffff', 0.8),
    'torso': turtle,
    'arm': turtle,  # as mangas pretas da gola alta (o casaco cobre por cima)
    'hand': skin,
    'legs': pants,
    'feet': shoes,
}
PREVIEW = {'skin_burn_kaiser': '#a8604a', 'turtleneck_kaiser': '#1a1a1e', 'jacket_kaiser': '#cfcdc4', 'pants_kaiser': '#1e1e22',
           'bandage_fantasma': '#ddd2ba', 'face_cineraria': '#c49478'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.17), (0.0, 0.17), (0.18, 0.165), (0.38, 0.215), (0.5, 0.228), (0.6, 0.12), (0.66, 0.07)]
hc = b.body(M, TP, feet='bare')


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
    """espiral em volta do eixo a_→b_ colada na superfície (raio de fora para o eixo)"""
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
# a gola alta CANELADA: o tronco ganha as nervuras verticais em relevo (o casaco cobre os lados)
relief(tor, lambda p: 0.0025 * H * (ridge(math.atan2(p.x, -p.y) * 34, 2) - 0.4) if p.z > hz + 0.05 * H else 0.0)
b.add('collar', clothe(part('neck'), lambda p: p.z < top + 0.12 * H, 0.008 * H, cuts=1), turtle, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)

# ================================================================ o CASACÃO cinza-claro: largo, ABERTO na frente, a barra esfiapada
open_front = lambda p: p.y < -0.05 * H and abs(p.x) < 0.055 * H + 0.12 * lim((hz + 0.5 * H - p.z) / (0.5 * H)) * H * 0.4
coat_o = b.add('coat', clothe(tor, lambda p: hz - 0.14 * H < p.z < top + 0.03 * H and not open_front(p), 0.022 * H, cuts=1), jacket, region='body', weight_fn=W('torso'), subdiv=0)
relief(coat_o, lambda p: 0.006 * H * (ridge(p.z / H * 16 + n3(p, 8) * 1.4, 2) - 0.4))  # as dobras do pano largo
# o forro ROXO aparecendo na abertura da frente e os painéis roxos dos lados (debaixo dos braços)
# as BORDAS da abertura em roxo (o forro virado), uma faixa lisa de cada lado do peito à barra
for s in (1, -1):
    ed = [front('coat', s * (0.07 + 0.05 * lim((hz + 0.5 * H - z) / (0.5 * H))) * H, z, 0.004 * H) for z in [hz - 0.12 * H + (top - hz + 0.1 * H) * k / 14 for k in range(15)]]
    ed = [q for q in ed if q]
    if len(ed) > 3:
        b.add(f'coatEdge{s}', rod(ed, 0.014 * H, 6, caps=False, flat=(outward((0, 0)), 0.45)), purple, region='body', weight_fn=W('torso'), subdiv=0)
b.add('coatSides', clothe(tor, lambda p: hz + 0.12 * H < p.z < hz + 0.47 * H and abs(p.x) > 0.17 * H and abs(p.y) < 0.09 * H, 0.034 * H, cuts=1), purple, region='body', weight_fn=W('torso'), subdiv=0)
# os BOLSOS do peito com aba e o botão de pressão
pk = []
bt = []
for s in (1, -1):
    c = front('torso', s * 0.12 * H, hz + 0.36 * H, 0.036 * H)
    if c:
        pk.append(box(tuple(c), (0.085 * H, 0.012 * H, 0.07 * H), bevel=0.004))
        pk.append(box(tuple(c + Vector((0, -0.008 * H, 0.03 * H))), (0.09 * H, 0.014 * H, 0.024 * H), bevel=0.003))
        bt.append(ellipsoid(tuple(c + Vector((0, -0.017 * H, 0.025 * H))), (0.008 * H, 0.005 * H, 0.008 * H), 6, 4))
    c = front('torso', s * 0.13 * H, hz + 0.02 * H, 0.036 * H)
    if c:
        pk.append(box(tuple(c), (0.1 * H, 0.012 * H, 0.08 * H), bevel=0.004))
b.add('pockets', merge(*pk), jacket, region='body', weight_fn=W('torso'), subdiv=0)
b.add('snaps', merge(*bt), silver, region='body', weight_fn=W('torso'), subdiv=0)
# o CAPUZ caído atrás, sobre os ombros
Hd = Sculpt()
nb = front('torso', 0.0, top - 0.02 * H, 0.0, back=True) or Vector((0, 0.12 * H, top))
Hd.ell(nb + Vector((0, 0.05 * H, 0.0)), (0.15 * H, 0.06 * H, 0.08 * H))
Hd.ell(nb + Vector((0, 0.06 * H, -0.07 * H)), (0.11 * H, 0.05 * H, 0.06 * H))
for s in (1, -1):
    Hd.ell(nb + Vector((s * 0.11 * H, -0.02 * H, 0.02 * H)), (0.06 * H, 0.06 * H, 0.05 * H))
b.add('hood', Hd.mesh(res=0.006, smooth=2, disp=lambda p: 0.004 * H * (ridge(p.z / H * 30, 2) - 0.4), target=1200), jacket, region='body', weight_fn=W('torso'), subdiv=0)
# a MANGA DIREITA até o cotovelo, com a borda dobrada; a ESQUERDA foi queimada: só a cava esfiapada
armR, armL = part('armR'), part('armL')
sR, eR, hR = sk['sR'], sk['eR'], sk['handR']
sL, eL, hL = sk['sL'], sk['eL'], sk['handL']
sl = b.add('sleeveR', clothe(armR, lambda p: p.z > eR.z - 0.03 * H, 0.018 * H, cuts=1), jacket, region='body', weight_fn=W('armR'), subdiv=0)
relief(sl, lambda p: 0.005 * H * (ridge(p.z / H * 24 + n3(p, 10), 2) - 0.4))
cuffp = wrap(['armR'], eR + Vector((0, 0, -0.01 * H)), eR + Vector((0, 0, -0.01 * H)), 0.07 * H, 1.0, 0.02 * H, n=20)
b.add('cuffR', rod(cuffp, 0.016 * H, 6, caps=False), jacket, region='body', weight_fn=W('armR'), subdiv=0)
b.add('armholeL', clothe(armL, lambda p: p.z > sL.z - 0.07 * H, 0.02 * H, cuts=1), jacket, region='body', weight_fn=W('armL'), subdiv=0)
# a PELE QUEIMADA do braço esquerdo (do ombro ao cotovelo, por cima da manga preta) — a manga da gola alta segue no antebraço
b.add('burnArmL', clothe(armL, lambda p: eL.z - 0.02 * H < p.z < sL.z - 0.05 * H, 0.004 * H, cuts=1), burn, region='body', weight_fn=W('armL'), subdiv=0)

# ================================================================ FAIXAS: antebraço e mão direitos; as canelas
wr = wrap(['armR', 'handR'], eR.lerp(hR, 0.15), hR + Vector((0, 0, -0.035 * H)), 0.05 * H, 9.0, 0.003 * H, n=150)
b.add('bandR', rod(wr, 0.012 * H, 5, caps=False, flat=(outward((hR.x, hR.y)), 0.72)), band, region='body', weight_fn=W('eR'), subdiv=0)
tl = hR + Vector((0, 0.01 * H, -0.02 * H))
b.add('bandTail', rod([tl, tl + Vector((-0.02 * H, 0.02 * H, -0.08 * H)), tl + Vector((-0.015 * H, 0.03 * H, -0.15 * H))], 0.011 * H, 5, flat=(outward((tl.x, tl.y)), 0.2)), band, region='body', weight_fn=W('eR'), subdiv=0)
for side in ('L', 'R'):
    leg = part('leg' + side)
    k, f = sk['k' + side], sk['foot' + side]
    pl = b.add('pants' + side, clothe(leg, lambda p, f=f: p.z > f.z + 0.12 * H, 0.016 * H, cuts=1), pants, region='body', weight_fn=W('leg' + side), subdiv=0)
    relief(pl, lambda p: 0.005 * H * (ridge(p.z / H * 22 + n3(p, 10) * 1.5, 2) - 0.4))
    sw = wrap(['pants' + side], k.lerp(f, 0.5), k.lerp(f, 0.86), 0.08 * H, 7.0, 0.003 * H, n=110, phase=0.6 if side == 'L' else 2.1)
    b.add('shinBand' + side, rod(sw, 0.012 * H, 5, caps=False, flat=(outward((k.x, k.y)), 0.72)), band, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ a ALÇA transversal marrom (do ombro direito ao quadril esquerdo) e a POLAROID
strap = [p for p in (front('coat', (-0.13 + 0.27 * t) * H, (top - 0.02 * H) * (1 - t) + (hz + 0.06 * H) * t, 0.022 * H) for t in [k / 12 for k in range(13)]) if p]
b.add('crossStrap', rod(strap, 0.012 * H, 6, flat=(outward((0, 0)), 0.35)), strapm, region='body', weight_fn=W('torso'), subdiv=0)
cp = surf('coat', Vector((0.6 * H, -0.05 * H, hz + 0.02 * H)), Vector((-1, 0, 0)), 0.045 * H)
if cp:
    b.add('polaroid', box(tuple(cp), (0.05 * H, 0.1 * H, 0.08 * H), bevel=0.008), cam, region='body', weight_fn=W('torso'), subdiv=0)
    b.add('polaroidLens', merge(ellipsoid(tuple(cp + Vector((0.02 * H, -0.02 * H, 0.0))), (0.03 * H, 0.02 * H, 0.03 * H), 10, 6),
                                box(tuple(cp + Vector((0.026 * H, 0.03 * H, 0.025 * H))), (0.008 * H, 0.02 * H, 0.012 * H))), camy, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ a MOCHILA escura nas costas com as alças roxas
bk = front('coat', 0.0, hz + 0.38 * H, 0.0, back=True)
pc = bk + Vector((0, 0.07 * H, 0))
P = Sculpt()
for dx in (-0.07, 0.07):
    for dz in (-0.1, 0.0, 0.1):
        P.ell(pc + Vector((dx * H, 0.0, dz * H)), (0.075 * H, 0.06 * H, 0.08 * H))
b.add('backpack', P.mesh(res=0.006, smooth=2, target=1100), pack, region='body', weight_fn=W('torso'), subdiv=0)
st = []
for s in (1, -1):
    pts = [pc + Vector((s * 0.08 * H, 0.0, 0.15 * H))]
    over = surf('coat', Vector((s * 0.1 * H, 0.0, top + 0.3 * H)), Vector((0, 0, -1)), 0.01 * H)
    if over:
        pts.append(over)
    for z in (top - 0.06 * H, top - 0.16 * H, hz + 0.3 * H):
        q = front('coat', s * 0.15 * H, z, 0.01 * H)
        if q:
            pts.append(q)
    sp_ = surf('coat', Vector((s * 0.6 * H, 0.0, hz + 0.24 * H)), Vector((-s, 0, 0)), 0.01 * H)
    if sp_:
        pts.append(sp_)
    pts.append(pc + Vector((s * 0.1 * H, -0.02 * H, -0.13 * H)))
    st.append(rod(pts, 0.012 * H, 6, flat=(outward((0, 0)), 0.45)))
b.add('packStraps', merge(*st), purple, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ TÊNIS pretos com a faixa roxa
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    f = sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.155 * H, f.z + 0.008 * H))
    U = Sculpt()
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.012 * H)), toe], [0.05 * H, 0.052 * H, 0.044 * H], step=0.45)
    U.ell(toe + Vector((0, 0.008 * H, 0.01 * H)), (0.046 * H, 0.042 * H, 0.03 * H))
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.11 * H))], [0.06 * H, 0.058 * H], step=0.45)
    b.add('shoe' + side, U.mesh(res=0.006, smooth=2, target=900), shoes, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.008 * H, -0.024 * H)), toe + Vector((0, -0.012 * H, -0.006 * H))], [0.056 * H, 0.05 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=500)
    so = ([(x, y, max(z, f.z - 0.036 * H) if z < f.z - 0.012 * H else min(z, f.z - 0.002 * H)) for x, y, z in so[0]], so[1], so[2])
    b.add('sole' + side, so, sole, region='body', weight_fn=W('k' + side), subdiv=0)
    stripe = [surf('shoe' + side, Vector((f.x + s * 0.3 * H, f.y - 0.06 * H + 0.08 * H * t, f.z + 0.03 * H)), Vector((-s, 0, 0)), 0.002 * H) for t in [k / 6 for k in range(7)]]
    stripe = [q for q in stripe if q]
    if len(stripe) > 2:
        b.add('shoeStripe' + side, rod(stripe, 0.008 * H, 5, caps=False), purple, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CABELO preto bagunçado: cheio à direita com a franja sobre o olho direito;
# do lado esquerdo (queimado) curto e ralo
D = Sculpt()
# a CALOTA: metaballs colados no couro cabeludo acima da linha do cabelo (mais finos e só no alto do lado queimado)
for i in range(22):
    for j in range(7):
        a = i / 22 * TAU
        el = 0.25 + 0.6 * j / 6  # elevação: da linha do cabelo ao topo
        dd = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
        if dd.y < -0.55 and dd.z < 0.62:
            continue  # deixa a testa e o rosto livres
        if math.sin(a) > 0.35 and el < 0.55:
            continue  # o lado esquerdo queimado: só o alto
        q = surf('head', Vector((hc.x, hc.y, hc.z)) + dd * 0.6 * H, -dd, 0.006 * H)
        if q:
            D.ell(q, (0.034 * H, 0.034 * H, 0.03 * H) if math.sin(a) < 0.35 else (0.022 * H, 0.022 * H, 0.018 * H))
NS = 30
for i in range(NS):
    a = i / NS * TAU
    sx = math.sin(a)
    burned = sx > 0.35  # o lado esquerdo (+x)
    fr = max(0.0, math.cos(a))
    hl = hc.z + (0.1 * fr ** 1.5 + 0.02) * H
    d = Vector((sx, -math.cos(a), 0))
    p0 = surf('head', Vector((hc.x, hc.y, hl)) + d * 0.6 * H, -d, 0.004 * H)
    crown = surf('head', Vector((hc.x, hc.y + 0.02 * H, hc.z + 0.6 * H)), Vector((0, 0, -1)), 0.006 * H)
    if not p0 or not crown:
        continue
    if burned:
        D.chain([crown, p0.lerp(crown, 0.5) + d * 0.006 * H], [0.012 * H, 0.008 * H], step=0.5)  # ralo e curto
        continue
    ln = (0.1 + 0.05 * random.random() + (0.06 if fr < 0.3 else 0)) * H
    mid = (p0 + crown) * 0.5 + d * 0.02 * H
    tip = p0 + d * 0.03 * H + Vector((random.uniform(-0.02, 0.02) * H, 0, -ln))
    D.chain([crown, mid, p0 + d * 0.012 * H, tip], [0.016 * H, 0.018 * H, 0.016 * H, 0.006 * H], step=0.5)
# a FRANJA caindo sobre o olho direito (-x), espetada em mechas
for j in range(5):
    r0 = surf('head', Vector((hc.x + (0.02 - 0.03 * j) * H, hc.y - 0.6 * H, hc.z + 0.12 * H)), Vector((0, 1, 0)), 0.01 * H)
    if not r0:
        continue
    D.chain([r0 + Vector((0, 0.02 * H, 0.03 * H)), r0 + Vector((-0.03 * H, -0.015 * H, -0.03 * H)), r0 + Vector((-0.06 * H - 0.01 * j * H, -0.02 * H, -0.09 * H))],
            [0.014 * H, 0.012 * H, 0.004 * H], step=0.5)
# pontas espetadas no alto
for j in range(6):
    a = random.uniform(-2.0, 1.2)
    c0 = Vector((hc.x + math.sin(a) * 0.05 * H, hc.y - math.cos(a) * 0.05 * H, hc.z + 0.16 * H))
    D.chain([c0, c0 + Vector((math.sin(a) * 0.06 * H, -math.cos(a) * 0.05 * H, 0.04 * H))], [0.014 * H, 0.004 * H], step=0.5)
b.add('hair', D.mesh(res=0.0045, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.z / H * 120 + p.x / H * 40, 2) - 0.4), target=4500), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# a ARGOLA na orelha direita (-x)
ear = part('ear-1')
ec = ear.matrix_world @ (sum((v.co for v in ear.data.vertices), Vector()) / len(ear.data.vertices))
lobe = ec + Vector((-0.012 * H, -0.004 * H, -0.03 * H))
b.add('earring', rod([lobe + Vector((0, math.sin(a) * 0.01 * H, -math.cos(a) * 0.01 * H + 0.01 * H)) for a in [i / 12 * TAU for i in range(13)]], 0.0022 * H, 4, caps=False), silver, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# o CIGARRO no canto da boca (lado direito) com a brasa — peças prop_ (o jogo esconde nos golpes de boca)
mouth = Vector((-0.04 * H, hc.y - 0.15 * H, hc.z - 0.075 * H))
b.add('prop_cigarette', tube([(mouth.x, mouth.y, mouth.z, 0.007, 0.007), (mouth.x - 0.05, mouth.y - 0.035, mouth.z - 0.012, 0.007, 0.007)], 6), cig, region='head', subdiv=0)
b.add('prop_cigaretteEmber', ellipsoid((mouth.x - 0.052, mouth.y - 0.037, mouth.z - 0.013), (0.008, 0.008, 0.008), 6, 4), ember, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'kaiser.blend'), check_existing=False)
