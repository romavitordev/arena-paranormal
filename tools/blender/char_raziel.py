"""
RAZIEL (líder dos VAMPIROS, Hexatombe) — public/models/raziel.glb. Técnica atual (sculpt_lib: roupa a partir do corpo,
metaballs, relevo, peças coladas na superfície por raio), a partir da ARTE OFICIAL "Arte Raziel em Hexatombe", das
cinemáticas ("O Verdadeiro Raziel", "Raziel ferindo Remi") e do modelo dele no próprio RPG (ep. 9, "Banho de Sangue"):
  - 1,90 m, forte; a pele toda DESCARNADA, rosada/vermelho-fundo, a cabeça CARECA cheia de cicatrizes, SEM OLHOS NEM
    NARIZ, a boca de fera sem lábios com os DENTES amarelados e compridos; o ESTIGMA da Coroa de Espinhos cortado na
    testa (textura face_raziel);
  - o CASACÃO pesado até o chão, preto-avermelhado e manchado de sangue, com o FORRO vermelho, os OMBROS ALTOS (as
    dragonas com franjas douradas) e a GOLA ALTA e rígida que emoldura a cabeça (escura por fora, vermelha por dentro);
  - o JABÔ vermelho de babados com a PEDRA VERMELHA, as CORRENTES douradas pendendo no peito e os LAÇOS amarelados que
    prendem o colete escuro; a camisa escura; a calça escura de barra rasgada;
  - as mãos de GARRAS com os dedos longos; DESCALÇO, com as unhas pontudas.
A TRANSFORMAÇÃO "O Verdadeiro Raziel" (forms/raziel_verdadeiro.js, modelo raziel_verdadeiro): ele RASGA a parte de cima
das roupas — o jogo esconde as peças prop_up* e mostra as prop_true*: o tronco descarnado com a grande FERIDA que mostra
as COSTELAS, os braços RASGADOS até o osso e a LÍNGUA comprida e afiada para fora. A saia do casaco e a calça ficam.
  node tools/blender/build.mjs raziel   → public/models/raziel.glb (+ tools/blender/fonte/raziel.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe, shell_grid
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'raziel.glb'
random.seed(390)  # os 390 PV que a Intenção do Remi viu

b = Builder(width=1.0, bulk=1.02, height=1.06)  # 1,90 m
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

flesh = material('skin_raziel', '#b8746c', 0.7)  # 'skin_': mantém o tom sob a luz colorida das arenas
M = {
    'skin': flesh,
    'face': material('face_raziel', '#ffffff', 0.7),
    'torso': material('skin_raziel_torso', '#ffffff', 0.7),  # o tronco descarnado (textura: músculos, cortes, sangue)
    'arm': flesh,
    'hand': flesh,
    'legs': material('pants_raziel', '#ffffff', 0.9),  # calça escura manchada (textura)
    'feet': flesh,
}
coat = material('coat_raziel', '#ffffff', 0.85)  # o casacão preto-avermelhado manchado de sangue (textura)
lining = material('lining_raziel', '#8a0e16', 0.7)
shirt = material('shirt_raziel', '#1c1418', 0.85)
vest = material('vest_raziel', '#2a0c10', 0.8)
gold = material('gold_raziel', '#c8a040', 0.35, metal=0.85)
lace = material('lace_raziel', '#d8c070', 0.6)
jabot_m = material('jabot_raziel', '#a01420', 0.7)
gem = material('gem_raziel', '#ff2030', 0.2, emission='#ff1020', strength=2.5)
teeth_m = material('teeth_raziel', '#e0d090', 0.45)
gum = material('gum_raziel', '#6a1418', 0.6)
claw_m = material('claw_raziel', '#2a1212', 0.45)
bone = material('bone_raziel', '#e8dcc0', 0.6)
raw = material('raw_raziel', '#7a0a12', 0.5)  # a carne viva das feridas
tongue_m = material('tongue_raziel', '#c0384a', 0.45)
PREVIEW = {'face_raziel': '#c08078', 'skin_raziel_torso': '#b8746c', 'pants_raziel': '#1e1a1e', 'coat_raziel': '#3a1216'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.17), (0.0, 0.172), (0.18, 0.17), (0.38, 0.222), (0.5, 0.236), (0.6, 0.126), (0.66, 0.072)]
hc = b.body(M, TP, arm_r=(0.066, 0.054, 0.044), leg_r=(0.09, 0.072, 0.056), feet='bare')


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
        out.append(q if q else c + d * 0.07 * H)
    return out


def lim(x):
    return max(0.0, min(1.0, x))


tor = part('torso')
# ================================================================ o CORPO descarnado: as fibras dos músculos em relevo no tronco e nos braços
def densify(o, levels=1):
    """subdivide a peça (mantém o UV) para o relevo dos músculos ter vértices onde aparecer"""
    md = o.modifiers.new('dens', 'SUBSURF')
    md.levels = levels
    md.render_levels = levels
    bpy.context.view_layer.objects.active = o
    for x in bpy.context.selected_objects:
        x.select_set(False)
    o.select_set(True)
    bpy.ops.object.modifier_apply(modifier=md.name)
    _bvh.pop(o.name, None)


def bump(p, c, r, amp):
    d2 = ((p.x - c[0]) / r[0]) ** 2 + ((p.y - c[1]) / r[1]) ** 2 + ((p.z - c[2]) / r[2]) ** 2
    return amp * math.exp(-d2 * 2.2)


def muscles(p):
    """decrépito e musculoso ao mesmo tempo: peitoral, os gomos do abdômen, oblíquos, as dorsais e as fibras"""
    v = 0.004 * H * (ridge(p.z / H * 30 + p.x / H * 8 + n3(p, 10) * 1.5, 2) - 0.4)
    if p.y < 0.02 * H:
        for s in (1, -1):
            v += bump(p, (s * 0.1 * H, -0.18 * H, hz + 0.46 * H), (0.09 * H, 0.2 * H, 0.06 * H), 0.018 * H)
            v += bump(p, (s * 0.15 * H, -0.12 * H, hz + 0.2 * H), (0.04 * H, 0.2 * H, 0.1 * H), 0.007 * H)
            for z in (0.13, 0.21, 0.29):
                v += bump(p, (s * 0.036 * H, -0.15 * H, hz + z * H), (0.03 * H, 0.2 * H, 0.03 * H), 0.008 * H)
        if hz + 0.08 * H < p.z < hz + 0.4 * H:
            v -= 0.006 * H * math.exp(-(p.x / (0.008 * H)) ** 2)
    else:
        for s in (1, -1):
            v += bump(p, (s * 0.12 * H, 0.14 * H, hz + 0.4 * H), (0.08 * H, 0.2 * H, 0.14 * H), 0.014 * H)
    return v


for side in ('L', 'R'):
    relief(part('arm' + side), lambda p: 0.003 * H * (ridge(p.z / H * 40 + n3(p, 14) * 1.5, 2) - 0.4))

# ================================================================ a CAMISA escura e o COLETE com os LAÇOS amarelados (a parte de cima: some
# na transformação — prefixo prop_up)
b.add('prop_upShirt', clothe(tor, lambda p: p.z > hz - 0.16 * H, 0.01 * H, cuts=1), shirt, region='body', weight_fn=W('torso'), subdiv=0)
open_vest = lambda p: p.y < -0.05 * H and abs(p.x) < 0.04 * H + 0.06 * lim((p.z - hz - 0.25 * H) / (0.3 * H)) * H
b.add('prop_upVest', clothe(tor, lambda p: hz - 0.05 * H < p.z < top - 0.08 * H and not open_vest(p), 0.014 * H, cuts=1), vest, region='body', weight_fn=W('torso'), subdiv=0)
lc = []
for k in range(5):
    z = hz + (0.06 + 0.075 * k) * H
    pts = [front('torso', x * H, z, 0.02 * H) for x in (-0.1, -0.05, 0.0, 0.05, 0.1)]
    pts = [q for q in pts if q]
    if len(pts) > 2:
        lc.append(rod(pts, 0.006 * H, 5, caps=False))
b.add('prop_upLaces', merge(*lc), lace, region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ o CASACÃO: a parte de cima (do tronco, aberta na frente) some na
# transformação; a SAIA até o chão fica (o forro vermelho por dentro e a barra rasgada)
open_front = lambda p: p.y < -0.05 * H and abs(p.x) < 0.07 * H + 0.07 * lim((top - p.z) / (top - hz)) * H
cu = b.add('prop_upCoat', clothe(tor, lambda p: hz - 0.04 * H < p.z < top + 0.02 * H and not open_front(p), 0.028 * H, cuts=1), coat, region='body', weight_fn=W('torso'), subdiv=0)
relief(cu, lambda p: 0.005 * H * (ridge(p.z / H * 10 + n3(p, 7) * 1.3, 2) - 0.4))
GAP = 0.085
floor_z = 0.03 * H
SK_Z = [hz + 0.02 * H, hz - 0.25 * H, hz - 0.55 * H, floor_z + 0.02 * H]
rings = [(z, 0.205 * H * (1.0 + 0.1 * k), 0.15 * H * (1.0 + 0.12 * k)) for k, z in enumerate(SK_Z)]
sk_o = b.add('coatSkirt', open_tube(rings, gap=GAP, seg=44), coat, region='skirt', subdiv=1)
relief(sk_o, lambda p: (0.004 + 0.012 * lim((hz - p.z) / (0.8 * H))) * H * ridge(math.atan2(p.x, -p.y) * 7 + n3(p, 5) * 1.3, 2))
b.add('coatSkirtIn', open_tube([(z, rx * 0.93, ry * 0.93) for z, rx, ry in rings], gap=GAP + 0.004, seg=44), lining, region='skirt', subdiv=1)
# as bordas vermelhas da abertura: em cima (somem com a parte de cima) e na saia
for s in (1, -1):
    ed = [front('torso', s * (0.07 + 0.07 * lim((top - z) / (top - hz))) * H + s * 0.004 * H, z, 0.032 * H) for z in [hz + (top - hz) * k / 12 for k in range(13)]]
    ed = [q for q in ed if q]
    if len(ed) > 3:
        b.add(f'prop_upCoatEdge{s}', rod(ed, 0.016 * H, 6, caps=False, flat=(outward((0, 0)), 0.4)), lining, region='body', weight_fn=W('torso'), subdiv=0)
    a = (GAP if s > 0 else 1 - GAP) * TAU
    edge = [Vector((math.sin(a) * rx * 1.01, -math.cos(a) * ry * 1.01, z)) for z, rx, ry in rings]
    b.add(f'coatEdgeSkirt{s}', rod(edge, 0.015 * H, 6, caps=False), lining, region='skirt', subdiv=0)
# a barra RASGADA em tiras pontudas caindo do casaco
tears = []
for i in range(30):
    a = (GAP + (1 - 2 * GAP) * (i + 0.5) / 30) * TAU
    z, rx, ry = rings[-1]
    p0 = Vector((math.sin(a) * rx, -math.cos(a) * ry, z + 0.03 * H))
    tears.append(rod([p0, p0 + Vector((0, 0, -random.uniform(0.02, 0.05) * H))], [0.022 * H, 0.004 * H], 4, caps=True, flat=(outward((0, 0)), 0.3)))
b.add('coatTears', merge(*tears), coat, region='skirt', subdiv=0)

# as MANGAS do casaco com o punho vermelho (somem)
for side in ('L', 'R'):
    arm = part('arm' + side)
    s_, e_, h_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    sl = b.add('prop_upSleeve' + side, clothe(arm, lambda p: True, 0.016 * H, cuts=1), coat, region='body', weight_fn=W('arm' + side), subdiv=0)
    relief(sl, lambda p: 0.005 * H * (ridge(p.z / H * 18 + n3(p, 9), 2) - 0.4))
    b.add('prop_upCuff' + side, rod(limb_ring('arm' + side, e_.lerp(h_, 0.86), h_ - e_, 0.026 * H), 0.02 * H, 6, caps=False), lining, region='body', weight_fn=W('arm' + side), subdiv=0)

# as DRAGONAS (ombros altos) com as FRANJAS douradas
for s in (1, -1):
    sh = sk['sL' if s > 0 else 'sR']
    top_sh = surf('prop_upSleeve' + ('L' if s > 0 else 'R'), sh + Vector((s * 0.02 * H, 0, 0.4 * H)), Vector((0, 0, -1)), 0.004 * H) or sh + Vector((0, 0, 0.08 * H))
    E = Sculpt()
    E.ell(top_sh + Vector((s * 0.01 * H, 0, 0.02 * H)), (0.1 * H, 0.09 * H, 0.04 * H))
    E.ell(top_sh + Vector((s * 0.05 * H, 0, 0.0)), (0.06 * H, 0.08 * H, 0.05 * H))
    b.add(f'prop_upEpaulette{s}', E.mesh(res=0.004, smooth=2, disp=lambda p: 0.003 * H * (ridge(p.y / H * 60, 2) - 0.4), target=700), coat, region='body', weight_fn=W('torso'), subdiv=0)
    fr = []
    for k in range(9):
        a = (k / 8 - 0.5) * 2.6
        p0 = top_sh + Vector((s * (0.07 + 0.03 * math.cos(a)) * H, math.sin(a) * 0.08 * H, -0.01 * H))
        fr.append(rod([p0, p0 + Vector((s * 0.01 * H, 0, -0.09 * H))], 0.0045 * H, 4))
    b.add(f'prop_upFringe{s}', merge(*fr), gold, region='body', weight_fn=W('torso'), subdiv=0)

# a GOLA ALTA e rígida: sobe em leque atrás e dos lados da cabeça; escura por fora e vermelha por dentro
def collar_rows(out_k):
    rows = []
    for j in range(7):
        t = j / 6
        z = top - 0.02 * H + t * 0.34 * H
        r = (0.11 + 0.13 * t) * H * out_k
        row = []
        for i in range(17):
            a = (0.22 + 0.56 * i / 16) * TAU  # de um lado do rosto, por trás, ao outro
            row.append(Vector((math.sin(a) * r, -math.cos(a) * r * 0.92 + 0.02 * H, z)))
        rows.append(row)
    return rows


b.add('prop_upCollar', shell_grid(collar_rows(1.0), thick=0.008 * H), coat, region='body', weight_fn=lambda p: {'neck': 0.6, 'chest': 0.4}, subdiv=0)
b.add('prop_upCollarIn', shell_grid(collar_rows(0.965), thick=0.004 * H), lining, region='body', weight_fn=lambda p: {'neck': 0.6, 'chest': 0.4}, subdiv=0)

# o JABÔ vermelho de babados embaixo do queixo, a PEDRA vermelha no cordão dourado e as CORRENTES douradas
jc = front('neck', 0.0, top + 0.02 * H, 0.02 * H) or Vector((0, -0.08 * H, top))
J = Sculpt()
for k in range(6):
    J.ell(jc + Vector((random.uniform(-0.02, 0.02) * H, -0.01 * H * k, -0.035 * H * k)), (0.055 * H - 0.004 * H * k, 0.02 * H, 0.03 * H))
b.add('prop_upJabot', J.mesh(res=0.003, smooth=2, disp=lambda p: 0.003 * H * ridge(p.z / H * 140, 2), target=900), jabot_m, region='body', weight_fn=W('torso'), subdiv=0)
gp = jc + Vector((0, -0.05 * H, -0.2 * H))
b.add('prop_upGem', ellipsoid(tuple(gp), (0.018 * H, 0.01 * H, 0.026 * H), 10, 6), gem, region='body', weight_fn=W('torso'), subdiv=0)
b.add('prop_upGemFrame', rod([gp + Vector((math.cos(a) * 0.024 * H, 0.004 * H, math.sin(a) * 0.032 * H)) for a in [i / 16 * TAU for i in range(17)]], 0.004 * H, 4, caps=False), gold, region='body', weight_fn=W('torso'), subdiv=0)
ch = []
for s in (1, -1):
    for drop in (0.14, 0.24):
        pts = [front('torso', s * (0.17 - 0.17 * t) * H, top - 0.06 * H - math.sin(t * math.pi) * drop * H, 0.04 * H) for t in [k / 12 for k in range(13)]]
        pts = [q for q in pts if q]
        if len(pts) > 3:
            ch.append(rod(pts, 0.0045 * H, 4, caps=False))
b.add('prop_upChains', merge(*ch), gold, region='body', weight_fn=W('torso'), subdiv=0)

# os músculos do tronco DEPOIS das roupas (que copiam a malha do tronco: senão ficavam densas também)
densify(tor)
relief(tor, muscles)

# ================================================================ as GARRAS: os dedos longos e as unhas escuras (mãos) e os pés descalços
for side in ('L', 'R'):
    e_, h_ = sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    ax = (h_ - e_).normalized()
    Fg = Sculpt()
    Cl = Sculpt()
    for k in range(5):
        off = Vector((sx * (k - 2) * 0.014 * H, (k - 2) * 0.006 * H, 0))
        if k == 0:
            off += Vector((sx * -0.01 * H, -0.02 * H, 0.02 * H))
        base = h_ + ax * 0.045 * H + off
        mid = base + ax * 0.06 * H + Vector((0, -0.01 * H, 0))
        tip = mid + ax * 0.05 * H + Vector((0, -0.02 * H, 0))
        Fg.chain([base, mid, tip], [0.011 * H, 0.009 * H, 0.007 * H], step=0.4)
        Cl.chain([tip, tip + ax * 0.04 * H + Vector((0, -0.025 * H, 0))], [0.0065 * H, 0.0015 * H], step=0.35)
    b.add('fingers' + side, Fg.mesh(res=0.0028, smooth=2, target=900), flesh, region='e' + side, subdiv=0)
    b.add('claws' + side, Cl.mesh(res=0.0022, smooth=1, target=500), claw_m, region='e' + side, subdiv=0)
for side in ('L', 'R'):
    f = sk['foot' + side]
    Tg = Sculpt()
    Tc = Sculpt()
    Tg.chain([Vector((f.x, f.y + 0.02 * H, f.z + 0.02 * H)), Vector((f.x, f.y - 0.1 * H, f.z + 0.015 * H))], [0.045 * H, 0.04 * H], step=0.4)
    for t in (-1.5, -0.5, 0.5, 1.5):
        base = Vector((f.x + t * 0.02 * H, f.y - 0.11 * H, f.z + 0.016 * H))
        tip = base + Vector((t * 0.008 * H, -0.05 * H, -0.008 * H))
        Tg.chain([base, tip], [0.012 * H, 0.009 * H], step=0.4)
        Tc.chain([tip, tip + Vector((0, -0.03 * H, -0.012 * H))], [0.006 * H, 0.0015 * H], step=0.35)
    b.add('footFlesh' + side, Tg.mesh(res=0.003, smooth=2, target=700), flesh, region='body', weight_fn=W('k' + side), subdiv=0)
    b.add('toeClaws' + side, Tc.mesh(res=0.0022, smooth=1, target=400), claw_m, region='body', weight_fn=W('k' + side), subdiv=0)
# a barra RASGADA da calça (tiras soltas em volta do tornozelo)
for side in ('L', 'R'):
    k_, f = sk['k' + side], sk['foot' + side]
    relief(part('leg' + side), lambda p: 0.004 * H * (ridge(p.z / H * 16 + n3(p, 9) * 1.6, 2) - 0.4))
    rag = []
    c = k_.lerp(f, 0.82)
    for i in range(10):
        a = i / 10 * TAU
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = surf('leg' + side, c + d * 0.3 * H, -d, 0.004 * H)
        if q:
            rag.append(rod([q, q + d * 0.006 * H + Vector((0, 0, -random.uniform(0.03, 0.07) * H))], [0.014 * H, 0.003 * H], 4, flat=(outward((c.x, c.y)), 0.3)))
    b.add('pantsRag' + side, merge(*rag), M['legs'], region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ a CABEÇA: careca, as cicatrizes em relevo e a BOCA de fera sem lábios
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


relief(part('head'), lambda p: -0.002 * H * ridge(p.x / H * 50 + p.z / H * 30 + n3(p, 20) * 3, 6))  # as cicatrizes do crânio
# a gengiva em arco (sem lábios) e as duas fileiras de DENTES compridos e amarelados
G = Sculpt()
upper, lower = [], []
for i in range(15):
    a = (i / 14 - 0.5) * 1.5
    q = on_head(a, -0.36, 0.008 * H)
    q2 = on_head(a * 0.95, -0.56, 0.008 * H)
    if q:
        G.ell(q, (0.016 * H, 0.012 * H, 0.012 * H))
        upper.append(q)
    if q2:
        G.ell(q2, (0.015 * H, 0.012 * H, 0.011 * H))
        lower.append(q2)
b.add('gums', G.mesh(res=0.0028, smooth=2, target=800), gum, region='body', weight_fn=HEAD, subdiv=0)
T_ = Sculpt()
for q in upper:
    ln = random.uniform(0.028, 0.045) * H
    T_.chain([q, q + Vector((0, -0.006 * H, -ln))], [0.0075 * H, 0.0025 * H], step=0.35)
for q in lower:
    ln = random.uniform(0.022, 0.036) * H
    T_.chain([q, q + Vector((0, -0.006 * H, ln))], [0.007 * H, 0.0022 * H], step=0.35)
b.add('teeth', T_.mesh(res=0.0022, smooth=1, target=1600), teeth_m, region='body', weight_fn=HEAD, subdiv=0)

# ================================================================ O VERDADEIRO RAZIEL (peças prop_true: só aparecem na transformação)
# a grande FERIDA no tronco: a carne viva funda e as COSTELAS à mostra
wc = front('torso', 0.02 * H, hz + 0.36 * H, 0.0)
if wc:
    Wd = Sculpt()
    Wd.ell(wc + Vector((0, 0.01 * H, 0)), (0.11 * H, 0.03 * H, 0.13 * H))
    b.add('prop_trueWound', Wd.mesh(res=0.004, smooth=2, disp=lambda p: 0.004 * H * n3(p, 40), target=900), raw, region='body', weight_fn=W('torso'), subdiv=0)
    ribs = []
    for k in range(5):
        z = wc.z + (0.09 - 0.045 * k) * H
        for s in (1, -1):
            pts = [wc + Vector((s * x * H, -0.022 * H + 0.03 * H * (x / 0.11) ** 2, z - wc.z - 0.01 * H * (x / 0.11))) for x in (0.0, 0.03, 0.06, 0.09, 0.11)]
            ribs.append(rod(pts, 0.0075 * H, 5, caps=True))
    ribs.append(rod([wc + Vector((0, -0.024 * H, 0.11 * H)), wc + Vector((0, -0.024 * H, -0.1 * H))], 0.009 * H, 5))  # o esterno
    b.add('prop_trueRibs', merge(*ribs), bone, region='body', weight_fn=W('torso'), subdiv=0)
# os BRAÇOS RASGADOS: as tiras de carne soltas e o OSSO aparecendo no antebraço
for side in ('L', 'R'):
    s_, e_, h_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    ax = (h_ - e_).normalized()
    u = ax.orthogonal().normalized()
    bs = [e_.lerp(h_, 0.2) + u * 0.02 * H, e_.lerp(h_, 0.7) + u * 0.022 * H]
    b.add('prop_trueBone' + side, rod(bs, [0.012 * H, 0.01 * H], 6), bone, region='body', weight_fn=W('e' + side), subdiv=0)
    gash = []
    for t in (0.25, 0.45, 0.65):
        c = e_.lerp(h_, t)
        q = surf('arm' + side, c + u * 0.3 * H, -u, 0.003 * H)
        if q:
            gash.append(rod([q - ax * 0.05 * H, q, q + ax * 0.05 * H], [0.006 * H, 0.016 * H, 0.006 * H], 5, flat=(lambda p, u=u: u, 0.3)))
    up_c = s_.lerp(e_, 0.5)
    q = surf('arm' + side, up_c + u * 0.3 * H, -u, 0.003 * H)
    if q:
        gash.append(rod([q - (e_ - s_).normalized() * 0.07 * H, q, q + (e_ - s_).normalized() * 0.07 * H], [0.006 * H, 0.02 * H, 0.006 * H], 5, flat=(lambda p, u=u: u, 0.3)))
    b.add('prop_trueGash' + side, merge(*gash), raw, region='body', weight_fn=W('arm' + side), subdiv=0)
    strips = []
    for k in range(3):
        p0 = s_.lerp(e_, 0.7 + 0.1 * k) + u * 0.05 * H
        strips.append(rod([p0, p0 + Vector((0, -0.01 * H, -0.05 * H)), p0 + Vector((0.005 * H, -0.012 * H, -0.1 * H))], [0.012 * H, 0.008 * H, 0.003 * H], 4, flat=(lambda p, u=u: u, 0.35)))
    b.add('prop_trueFlesh' + side, merge(*strips), flesh, region='body', weight_fn=W('arm' + side), subdiv=0)
# a LÍNGUA comprida e afiada pendendo da boca
mouth = on_head(0.0, -0.46, 0.01 * H)
if mouth:
    Tg = Sculpt()
    Tg.chain([mouth, mouth + Vector((0.01 * H, -0.03 * H, -0.08 * H)), mouth + Vector((-0.005 * H, -0.04 * H, -0.18 * H)), mouth + Vector((0.01 * H, -0.03 * H, -0.27 * H))],
             [0.02 * H, 0.017 * H, 0.012 * H, 0.002 * H], step=0.4)
    b.add('prop_trueTongue', Tg.mesh(res=0.003, smooth=2, target=700), tongue_m, region='body', weight_fn=HEAD, subdiv=0)

b.group('prop_up')
b.group('prop_true')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'raziel.blend'), check_existing=False)
