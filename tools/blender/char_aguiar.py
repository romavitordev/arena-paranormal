"""
AGUIAR / MUTILADOR NOTURNO — public/models/aguiar.glb. Refeito com a técnica atual (sculpt_lib: roupa a partir do corpo,
metaballs, relevo, peças coladas na superfície por raio), a partir das ARTES OFICIAIS de Natal Macabro (wiki "Jonas
Aguiar": o Mutilador Noturno de frente e de costas, o delegado sem a máscara e o machado).

Referência (de cima a baixo):
  - homem de pele clara bronzeada, 1,80 m, MUSCULOSO; cabelo PRETO ONDULADO e bagunçado até a nuca, barba feita (a
    sombra fica na textura do rosto); cicatrizes nos braços (textura arms_aguiar);
  - a FAIXA DE COURO alta no pescoço e o DISTINTIVO de delegado pendurado na corrente;
  - CAMISETA creme justa (o peitoral e o abdômen marcados) de manga curta;
  - o COLETE VERMELHO (a jaqueta com as mangas arrancadas): aberto na frente, as cavas e a barra ESFIAPADAS, a gola
    levantada e rasgada;
  - o SUSPENSÓRIO de couro cruzado em X no peito, preso no CINTO LARGO de couro (quase um espartilho) com duas TIRAS
    soltas penduradas na frente;
  - BRAÇADEIRAS de couro com fivela acima dos cotovelos e as MUNHEQUEIRAS largas com fivela;
  - o JEANS cinza-esverdeado escuro, folgado, RASGADO nos joelhos (a pele aparece no rasgo);
  - TÊNIS de cano alto vermelho e creme com cadarço escuro e as ESPORAS de roseta;
prop_maskOn: a máscara branca com a MÃO VERMELHA (textura mask_mutilador) — aparece ao virar o Mutilador (a mesma de antes).
O machado é uma arma à parte (tools/blender/npc_aguiar_axe.py).
  node tools/blender/build.mjs aguiar   → public/models/aguiar.glb (+ tools/blender/fonte/aguiar.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, relief, clothe, chain_mesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'aguiar.glb'
random.seed(1225)  # Natal Macabro

b = Builder(width=1.04, bulk=1.1, height=1.0)  # 1,80 m, musculoso
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_aguiar', '#a06a46', 0.8),
    'face': material('face_aguiar', '#ffffff', 0.8),
    'torso': material('shirt_aguiar', '#ffffff', 0.85),  # a camiseta creme (textura: trama, manchas)
    'arm': material('arms_aguiar', '#ffffff', 0.8),  # cicatrizes
    'hand': material('arms_aguiar', '#ffffff', 0.8),
    'legs': material('skin_aguiar', '#a06a46', 0.8),  # a pele por baixo do jeans (aparece nos rasgos)
    'feet': material('skin_aguiar', '#a06a46', 0.8),  # dentro do tênis
}
vest = material('vest_aguiar', '#ffffff', 0.85)  # o colete vermelho (textura: tecido gasto, manchas)
vest_d = material('jacket_red_dark', '#5e1410', 0.9)  # os fiapos e a gola rasgada
leather = material('leather_brown', '#4a3020', 0.7)
leather2 = material('leather_dark_aguiar', '#2e1c12', 0.75)
brass = material('brass', '#b08a3a', 0.35, metal=0.8)
gold = material('badge_gold', '#d8b04a', 0.3, metal=0.85)
chainm = material('badge_chain', '#9a8a60', 0.35, metal=0.8)
hairm = material('hair_aguiar', '#0e0d0f', 0.5)
jeans = material('jeans_aguiar', '#ffffff', 0.9)  # o jeans (textura: desbotado, costuras, fiapos)
redsh = material('sneaker_red_aguiar', '#8e1c1c', 0.6)
cream = material('sneaker_cream', '#e2dac8', 0.7)
lace = material('lace_dark', '#2a2420', 0.8)
steel = material('spur_steel', '#8a8a90', 0.3, metal=0.9)
maskm = material('mask_mutilador', '#ffffff', 0.5)

PREVIEW = {'shirt_aguiar': '#ddd6c6', 'face_aguiar': '#a06a46', 'arms_aguiar': '#a06a46', 'vest_aguiar': '#9e2420', 'jeans_aguiar': '#3e4840'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.172), (0.0, 0.172), (0.17, 0.17), (0.36, 0.228), (0.48, 0.24), (0.58, 0.132), (0.65, 0.076)]
hc = b.body(M, TP, arm_r=(0.08, 0.064, 0.052), leg_r=(0.094, 0.074, 0.058), head_r=(0.138, 0.148, 0.16), neck_r=0.066, feet='bare')


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


# ================================================================ o CORPO musculoso: peitoral e abdômen sob a camiseta justa
tor = part('torso')


def muscles(p):
    x, y, z = p.x, p.y, p.z - hz
    ax = abs(x)
    d = 0.0
    if y < 0:
        d += 0.022 * H * math.exp(-((ax - 0.085 * H) / (0.06 * H)) ** 2) * math.exp(-((z - 0.44 * H) / (0.055 * H)) ** 2)  # peitoral
        if 0.12 * H < z < 0.36 * H and ax < 0.09 * H:  # os gomos do abdômen
            g = min(abs(z - zk) for zk in (0.33 * H, 0.26 * H, 0.19 * H))
            d += 0.006 * H * (1 - math.exp(-(g / (0.012 * H)) ** 2)) - 0.004 * H * math.exp(-(ax / (0.01 * H)) ** 2)
    return d


relief(tor, muscles)
for side in ('L', 'R'):
    relief(part('arm' + side), lambda p, s=side: 0.008 * H * math.exp(-((p.z - sk['s' + s].lerp(sk['e' + s], 0.5).z) / (0.06 * H)) ** 2))  # bíceps

# ================================================================ CAMISETA: mangas curtas justas
for side in ('L', 'R'):
    arm = part('arm' + side)
    sh, e = sk['s' + side], sk['e' + side]
    zs, ze = sh.z + 0.08 * H, sh.lerp(e, 0.42).z
    b.add('tee' + side, clothe(arm, lambda p, zs=zs, ze=ze: ze < p.z < zs, 0.007 * H, cuts=1), M['torso'], region='body', weight_fn=W('arm' + side), subdiv=0)

# ================================================================ o COLETE VERMELHO: aberto na frente, cavas e barra esfiapadas
def vest_keep(p):
    z = (p.z - hz) / H
    if z < -0.09 or z > 0.66:
        return False
    if p.y < 0 and abs(p.x) < (0.1 + 0.02 * lim((0.5 - z) / 0.5) - 0.03 * lim((z - 0.55) / 0.1)) * H:  # a abertura da frente (larga no peito)
        return False
    return True


vst = b.add('vest', clothe(tor, vest_keep, 0.026 * H, cuts=3), vest, region='body', weight_fn=W('torso'), subdiv=0)
relief(vst, lambda p: 0.005 * H * (ridge(math.atan2(p.x, p.y) * 6 + n3(p, 9), 2) - 0.35) * lim((hz + 0.3 * H - p.z) / (0.3 * H)))  # dobras embaixo
frays = []
for side in (1, -1):  # os fiapos nas cavas (onde as mangas foram arrancadas)
    sh = sk['sL' if side > 0 else 'sR']
    for k in range(14):
        a = k / 14 * TAU
        c = Vector((sh.x * 0.92, sh.y, sh.z - 0.02 * H)) + Vector((0, math.cos(a) * 0.075 * H, math.sin(a) * 0.09 * H))
        d = Vector((side * 0.6, math.cos(a) * 0.4, math.sin(a) * 0.3 - 0.4)).normalized()
        frays.append(cone(tuple(c), tuple(c + d * (0.025 + 0.02 * random.random()) * H), 0.009 * H, 3))
for k in range(30):  # a barra esfiapada
    a = k / 30 * TAU
    if math.cos(a) > 0.92:
        continue
    p = surf('torso', Vector((math.sin(a) * 0.6 * H, -math.cos(a) * 0.6 * H, hz - 0.085 * H)), Vector((-math.sin(a), math.cos(a), 0)), 0.026 * H)
    if p:
        frays.append(cone(tuple(p), tuple(p + Vector((0, 0, -(0.02 + 0.025 * random.random()) * H))), 0.01 * H, 3))
b.add('vestFrays', merge(*frays), vest_d, region='body', weight_fn=W('torso'), subdiv=0)
# a gola levantada e rasgada (atrás e dos lados do pescoço)
G = Sculpt()
for k in range(16):
    a = math.radians(-120 + 240 * k / 15) + math.pi
    r = 0.105 * H
    c = Vector((math.sin(a) * r, -math.cos(a) * r * 0.95, 1.6 * H))
    G.ell(c, (0.022 * H, 0.022 * H, 0.045 * H))
    G.ell(c + Vector((math.sin(a) * 0.012 * H, -math.cos(a) * 0.012 * H, 0.05 * H + 0.015 * H * random.random())), (0.016 * H, 0.016 * H, 0.025 * H))
b.add('collar', G.mesh(res=0.007, smooth=2, disp=lambda p: 0.004 * H * n3(p, 30), target=1400), vest_d, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ FAIXA DE COURO no pescoço e o DISTINTIVO na corrente
N = Sculpt()
for k in range(20):
    a = k / 20 * TAU
    N.ell(Vector((math.sin(a) * 0.072 * H, -math.cos(a) * 0.068 * H, 1.62 * H)), (0.022 * H, 0.022 * H, 0.04 * H))
b.add('neckWrap', N.mesh(res=0.006, smooth=3, target=900), leather, region='body', weight_fn=lambda p: {'chest': 0.4, 'neck': 0.6}, subdiv=0)
bp = front('torso', 0, hz + 0.47 * H, 0.03 * H)
cord = [Vector((math.sin(a) * 0.075 * H, -math.cos(a) * 0.072 * H, 1.6 * H)) for a in [math.radians(-55 + 110 * t / 6) for t in range(7)]]
chain_pts = [cord[0], cord[0].lerp(bp, 0.5) + Vector((0, -0.02 * H, 0)), bp + Vector((0, 0, 0.03 * H)), cord[-1].lerp(bp, 0.5) + Vector((0, -0.02 * H, 0)), cord[-1]]
b.add('badgeChain', chain_mesh(chain_pts, link=0.016 * H, r=0.0022 * H), chainm, region='body', weight_fn=W('torso'), subdiv=0)
BD = Sculpt()  # o distintivo: escudo com a estrela no meio
BD.ell(bp, (0.03 * H, 0.008 * H, 0.036 * H))
BD.ell(bp + Vector((0, 0, -0.03 * H)), (0.018 * H, 0.008 * H, 0.016 * H))
b.add('badge', BD.mesh(res=0.003, smooth=2, target=300), gold, region='body', weight_fn=W('torso'), subdiv=0)
star = []
for i in range(5):
    a = i / 5 * TAU
    star.append(rod([bp + Vector((0, -0.01 * H, 0)), bp + Vector((math.sin(a) * 0.02 * H, -0.01 * H, math.cos(a) * 0.02 * H))], 0.003 * H, 4))
b.add('badgeStar', merge(*star), brass, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ SUSPENSÓRIO em X, CINTO LARGO com as fivelas e as TIRAS soltas
flat = (outward((0, 0)), 0.35)
straps = []
for s in (1, -1):
    top = surf('torso', Vector((s * 0.12 * H, 0, hz + 0.78 * H)), Vector((0, 0, -1)), 0.01 * H)
    pts = [top] if top else []
    for t in [k / 10 for k in range(11)]:
        q = front('torso', s * 0.12 * H * (1 - t) - s * 0.13 * H * t, (hz + 0.6 * H) * (1 - t) + (hz + 0.16 * H) * t, 0.012 * H)
        if q:
            pts.append(q)
    straps.append(rod(pts, 0.014 * H, 6, flat=flat))
    bk = [top] if top else []
    bk += [p for p in (front('torso', s * (0.12 * H - 0.03 * H * t), (hz + 0.6 * H) * (1 - t) + (hz + 0.16 * H) * t, 0.03 * H, back=True) for t in [k / 8 for k in range(9)]) if p]
    straps.append(rod(bk, 0.014 * H, 6, flat=flat))
b.add('suspenders', merge(*straps), leather, region='body', weight_fn=W('torso'), subdiv=0)
# o cinto largo (quase um espartilho): duas faixas e as presilhas com fivela
b.add('beltBand', clothe(tor, lambda p: hz + 0.035 * H < p.z < hz + 0.14 * H, 0.03 * H, cuts=1), leather2, region='body', weight_fn=W('torso'), subdiv=0)
belt = []
for z in (hz + 0.04 * H, hz + 0.135 * H):
    ring = around('torso', Vector((0, 0, 0)), z, 0.034 * H, n=32)
    belt.append(rod(ring, 0.014 * H, 6, caps=False))
b.add('belt', merge(*belt), leather, region='body', weight_fn=W('torso'), subdiv=0)
bk_ = []
for x in (-0.09 * H, 0.0, 0.09 * H):
    p = front('torso', x, hz + 0.088 * H, 0.04 * H)
    if p:
        bk_.append(box(tuple(p), (0.03 * H, 0.008 * H, 0.03 * H), bevel=0.003))
b.add('buckles', merge(*bk_), brass, region='body', weight_fn=W('torso'), subdiv=0)
hang = []
for s in (1, -1):  # as duas tiras soltas penduradas na frente, até a coxa
    p = front('torso', s * 0.07 * H, hz + 0.03 * H, 0.04 * H)
    if p:
        hang.append(rod([p, p + Vector((s * 0.004 * H, -0.01 * H, -0.12 * H)), p + Vector((s * 0.01 * H, -0.006 * H, -0.24 * H))], 0.011 * H, 5, flat=flat))
b.add('hangStraps', merge(*hang), leather2, region='body', weight_fn=lambda p: {'hips': 1.0}, subdiv=0)

# ================================================================ BRAÇADEIRAS (acima do cotovelo) e MUNHEQUEIRAS largas, com fivelas
for side in ('L', 'R'):
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    bands = []
    for c, w, rr in ((sh.lerp(e, 0.72), 0.026 * H, 0.012 * H), (e.lerp(h, 0.82), 0.05 * H, 0.016 * H)):
        ring = around('arm' + side, c, c.z, rr, n=18)
        if len(ring) > 6:
            for dz in (-w / 2, w / 2):
                bands.append(rod([q + Vector((0, 0, dz)) for q in ring], 0.012 * H, 5, caps=False))
            bands.append(tube([(c.x, c.y, c.z - w / 2, 0.0, 0.0)] and [(c.x, c.y, c.z - w / 2, (ring[0] - c).length, (ring[len(ring) // 4] - c).length), (c.x, c.y, c.z + w / 2, (ring[0] - c).length, (ring[len(ring) // 4] - c).length)], 18))
    b.add('bands' + side, merge(*bands), leather, region='body', weight_fn=W('arm' + side), subdiv=0)
    fb = []
    for c in (sh.lerp(e, 0.72), e.lerp(h, 0.82)):
        p = surf('arm' + side, c + Vector((0, -0.4 * H, 0)), Vector((0, 1, 0)), 0.02 * H)
        if p:
            fb.append(box(tuple(p), (0.022 * H, 0.008 * H, 0.02 * H), bevel=0.002))
    if fb:
        b.add('bandBuckles' + side, merge(*fb), brass, region='body', weight_fn=W('arm' + side), subdiv=0)

# ================================================================ JEANS folgado, rasgado nos joelhos (a pele aparece)
b.add('jeansHips', clothe(tor, lambda p: p.z < hz + 0.04 * H, 0.012 * H, cuts=1), jeans, region='body', weight_fn=W('torso'), subdiv=0)
for side in ('L', 'R'):
    leg = part('leg' + side)
    k, f = sk['k' + side], sk['foot' + side]

    def jeans_keep(p, k=k, f=f):
        if p.z < f.z + 0.165 * H:  # termina embolado por cima do cano do tênis
            return False
        # o RASGO no joelho (frente)
        if p.y < k.y - 0.02 * H and abs(p.z - (k.z - 0.02 * H)) < 0.035 * H and abs(p.x - k.x) < 0.04 * H:
            return False
        return True
    jl = b.add('jeans' + side, clothe(leg, jeans_keep, 0.016 * H, cuts=1), jeans, region='body', weight_fn=W('leg' + side), subdiv=0)
    hem = around('leg' + side, Vector((f.x, f.y, 0)), f.z + 0.175 * H, 0.03 * H, n=18)
    if len(hem) > 6:
        b.add('jeansHem' + side, rod(hem, 0.014 * H, 6, caps=False), jeans, region='body', weight_fn=W('k' + side), subdiv=0)
    relief(jl, lambda p, k=k: 0.005 * H * (ridge(p.z / H * 26 + n3(p, 10) * 1.5, 2) - 0.4) * (0.6 if abs(p.z - k.z) < 0.1 * H else 0.3))  # as dobras (mais no joelho)
    # os fiapos brancos na borda do rasgo
    fr = []
    for i in range(10):
        a = i / 10 * TAU
        c = Vector((k.x + math.cos(a) * 0.04 * H, 0, k.z - 0.02 * H + math.sin(a) * 0.035 * H))
        q = surf('leg' + side, Vector((c.x, k.y - 0.6 * H, c.z)), Vector((0, 1, 0)), 0.016 * H)
        if q:
            fr.append(rod([q, q + Vector((-math.cos(a) * 0.012 * H, -0.002 * H, -math.sin(a) * 0.01 * H))], 0.0025 * H, 4))
    b.add('rip' + side, merge(*fr), cream, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ TÊNIS de cano alto vermelho e creme, cadarço escuro e as ESPORAS
for side in ('L', 'R'):
    s = 1 if side == 'L' else -1
    k, f = sk['k' + side], sk['foot' + side]
    heel = Vector((f.x, f.y + 0.035 * H, f.z + 0.02 * H))
    toe = Vector((f.x - s * 0.004 * H, f.y - 0.15 * H, f.z + 0.005 * H))
    U = Sculpt()  # o cabedal vermelho
    U.chain([heel, heel.lerp(toe, 0.5) + Vector((0, 0, 0.012 * H)), toe], [0.05 * H, 0.052 * H, 0.042 * H], step=0.45)
    U.ell(toe + Vector((0, 0.008 * H, 0.008 * H)), (0.046 * H, 0.042 * H, 0.03 * H))
    U.chain([Vector((f.x, f.y + 0.012 * H, f.z + 0.03 * H)), Vector((f.x, f.y + 0.006 * H, f.z + 0.11 * H)), Vector((f.x, f.y + 0.004 * H, f.z + 0.19 * H))], [0.066 * H, 0.064 * H, 0.062 * H], step=0.45)
    U.chain([Vector((f.x, f.y - 0.062 * H, f.z + 0.05 * H)), Vector((f.x, f.y - 0.045 * H, f.z + 0.2 * H))], [0.03 * H, 0.026 * H], step=0.45)
    b.add('sneaker' + side, U.mesh(res=0.006, smooth=2, target=1100), redsh, region='body', weight_fn=W('k' + side), subdiv=0)
    C = Sculpt()  # os painéis creme: o bico, o calcanhar e a boca acolchoada
    C.ell(toe + Vector((0, 0.004 * H, 0.004 * H)), (0.049 * H, 0.04 * H, 0.026 * H))
    C.ell(heel + Vector((0, 0.008 * H, 0.012 * H)), (0.05 * H, 0.03 * H, 0.04 * H))
    C.ell(Vector((f.x, f.y + 0.006 * H, f.z + 0.2 * H)), (0.068 * H, 0.066 * H, 0.016 * H))
    b.add('sneakerPanel' + side, C.mesh(res=0.005, smooth=2, target=700), cream, region='body', weight_fn=W('k' + side), subdiv=0)
    S = Sculpt()
    S.chain([heel + Vector((0, 0.008 * H, -0.024 * H)), toe + Vector((0, -0.012 * H, -0.006 * H))], [0.054 * H, 0.048 * H], step=0.35)
    so = S.mesh(res=0.006, smooth=2, target=550)
    so = ([(x, y, max(z, f.z - 0.035 * H) if z < f.z - 0.01 * H else min(z, f.z - 0.0)) for x, y, z in so[0]], so[1], so[2])
    b.add('sole' + side, so, cream, region='body', weight_fn=W('k' + side), subdiv=0)
    lc = []
    for j in range(5):
        z = f.z + 0.05 * H + j * 0.022 * H
        y = f.y - 0.1 * H + j * 0.012 * H
        lc.append(rod([Vector((f.x - 0.018 * H, y, z)), Vector((f.x + 0.018 * H, y, z + 0.012 * H))], 0.0035 * H, 4))
        lc.append(rod([Vector((f.x + 0.018 * H, y, z)), Vector((f.x - 0.018 * H, y, z + 0.012 * H))], 0.0035 * H, 4))
    b.add('laces' + side, merge(*lc), lace, region='body', weight_fn=W('k' + side), subdiv=0)
    # a ESPORA: o arco em volta do calcanhar e a ROSETA de pontas atrás
    sp = []
    arc_ = [Vector((f.x + math.sin(a) * 0.058 * H, f.y + 0.02 * H + math.cos(a) * 0.05 * H, f.z + 0.05 * H)) for a in [math.radians(-80 + 160 * t / 8) for t in range(9)]]
    sp.append(rod(arc_, 0.005 * H, 5))
    rw = Vector((f.x, f.y + 0.1 * H, f.z + 0.055 * H))
    sp.append(rod([Vector((f.x, f.y + 0.07 * H, f.z + 0.05 * H)), rw], 0.005 * H, 5))
    for i in range(8):
        a = i / 8 * TAU
        sp.append(cone(tuple(rw), (rw.x, rw.y + math.sin(a) * 0.03 * H, rw.z + math.cos(a) * 0.03 * H), 0.006 * H, 3))
    b.add('spur' + side, merge(*sp), steel, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ CABELO preto ondulado e bagunçado até a nuca
def hair_keep(p):
    q = p - hc
    z, y = q.z / H, q.y / H
    line = 0.1 - 0.17 * smoothstep(-0.1, 0.04, y)
    return z > line


capm = b.add('hairCap', clothe(part('head'), hair_keep, 0.009 * H, cuts=1), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
relief(capm, lambda p: 0.005 * H * (ridge(math.atan2(p.x - hc.x, p.y - hc.y) * 12 + n3(p, 28) * 1.2, 2) - 0.35))
HS = Sculpt()
NL = 34
for i in range(NL):
    a = math.radians(70) + (math.radians(290) - math.radians(70)) * i / (NL - 1)
    back = -math.cos(a)
    root = hc + Vector((math.sin(a) * 0.118 * H, -math.cos(a) * 0.124 * H + 0.006 * H, 0.06 * H))
    out = Vector((math.sin(a), -math.cos(a), 0))
    ln = (0.16 + 0.05 * random.random() + 0.06 * max(0.0, back)) * H
    ph_ = random.random() * TAU
    pts, rs = [], []
    for j in range(8):
        t = j / 7
        wave = math.sin(t * 11 + ph_) * 0.018 * H * (0.4 + t)  # ondas e cachos nas pontas
        swell = 0.03 * H * smoothstep(0.05, 0.6, t)
        curl = Vector((0, 0, 0.02 * H * t * t)) if j > 5 else Vector((0, 0, 0))  # a ponta vira para cima
        p = root + out * (swell + 0.008 * H) + Vector((0, 0, -ln * t)) + Vector((-out.y, out.x, 0)) * wave + curl
        pts.append(p)
        rs.append((0.03 - 0.016 * t) * H)
    HS.chain(pts, rs, step=0.5)
# a franja jogada para trás: mechas finas coladas no couro cabeludo (por raio na cabeça), e uma mecha solta na testa
for x in (-0.07, -0.035, 0.0, 0.035, 0.07):
    pts = []
    for t in [k / 5 for k in range(6)]:
        a = math.radians(-10 + 70 * t)  # da testa para o alto da cabeça
        d = Vector((x * 1.2, -math.cos(a), math.sin(a) + 0.35)).normalized()
        q = surf('head', hc + d * 0.6 * H, -d, 0.012 * H)
        if q:
            pts.append(q)
    if len(pts) > 2:
        HS.chain(pts, [0.014 * H] * len(pts), step=0.5)
r0 = hc + Vector((0.03 * H, -0.135 * H, 0.1 * H))
HS.chain([r0, r0 + Vector((0.008 * H, -0.012 * H, -0.035 * H)), r0 + Vector((0.02 * H, -0.01 * H, -0.065 * H))], [0.012 * H, 0.01 * H, 0.006 * H], step=0.5)
b.add('hair', HS.mesh(res=0.006, smooth=3, disp=lambda p: 0.004 * H * (ridge(math.atan2(p.x - hc.x, p.y - hc.y) * 16 + p.z / H * 8 + n3(p, 25), 2) - 0.4), target=4200), hairm, region='body',
      weight_fn=lambda p: {'hd': lim((p.z - (hc.z - 0.15 * H)) / (0.1 * H)), 'neck': 1 - lim((p.z - (hc.z - 0.15 * H)) / (0.1 * H))}, subdiv=0)

# ================================================================ MÁSCARA do Mutilador (a mesma de antes: frente do rosto, relevo de testa, nariz e queixo)
shell = ellipsoid((hc.x, hc.y - 0.016, hc.z - 0.01), (0.152 * H, 0.16 * H, 0.172 * H), 22, 16, theta_max=math.pi * 0.86, phi=(0.29, 0.71))


def mask_relief(p):
    brow = math.exp(-((p.z - (hc.z + 0.05)) ** 2) / 0.0005) * 0.014
    nose = math.exp(-(p.x ** 2) / 0.0007 - ((p.z - (hc.z - 0.02)) ** 2) / 0.0028) * 0.028
    chin = math.exp(-(p.x ** 2) / 0.004 - ((p.z - (hc.z - 0.13)) ** 2) / 0.002) * 0.012
    return Vector((p.x, p.y - brow - nose - chin, p.z))


b.add('prop_maskOn', xform(shell, mask_relief), maskm, region='head', subdiv=1)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'aguiar.blend'), check_existing=False)
