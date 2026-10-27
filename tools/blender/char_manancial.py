"""
MANANCIAL — public/models/manancial.glb   (invocação do FERREIRO; não aparece na seleção). Técnica atual (sculpt_lib).
Wiki "Manancial" (O Segredo na Floresta): os filhos do Ferreiro, criados só para alimentar o Santo e sustentar Santo
Berço; presos nas salas brancas da Caverna do Labirinto Infinito até a morte, muitas vezes enlouquecendo, marcados com o
SÍMBOLO ESPIRAL. Pelas MINIATURAS oficiais (Manancial fugitivo, barbudo, velho, imóvel, castanho) e pela HQ (O Segredo na
Floresta — Parte 2, Manancial Fugitivo e Idoso):
  - a pele muito PÁLIDA, cinza-esverdeada, de quem nunca viu o sol; o corpo ESQUÁLIDO: as costelas, as clavículas, a
    barriga funda e a espinha marcadas;
  - as ORELHAS compridas e PONTUDAS; os olhos FUNDOS e PRETOS (covas escuras com olheiras); o rosto chupado;
  - o cabelo PRETO comprido, liso e EMBARAÇADO caindo nos ombros e nas costas;
  - quase nus: só TRAPOS escuros na cintura; descalços; os dedos longos e magros com as unhas sujas;
  - o Símbolo Espiral (a marca do Santo) no peito.
  node tools/blender/build.mjs manancial   → public/models/manancial.glb (+ tools/blender/fonte/manancial.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'manancial.glb'
random.seed(7)
b = Builder(width=0.86, bulk=0.74, height=0.98)  # esquálido, de cela
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_manancial', '#bcbdac', 0.85)  # 'skin_': mantém o tom pálido sob a luz colorida das arenas
M = {
    'skin': skin,
    'face': material('face_manancial', '#ffffff', 0.8),
    'torso': material('skin_manancial_torso', '#ffffff', 0.85),  # o tronco magro com o Símbolo Espiral (textura)
    'arm': skin,
    'hand': skin,
    'legs': skin,
    'feet': skin,
}
hairm = material('hair_manancial', '#141212', 0.75)
rags = material('rags_manancial', '#2a2624', 0.95)
nail = material('nail_manancial', '#6a5e4a', 0.6)
PREVIEW = {'face_manancial': '#bcbdac', 'skin_manancial_torso': '#bcbdac'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.15), (0.0, 0.15), (0.18, 0.13), (0.38, 0.17), (0.5, 0.18), (0.6, 0.1), (0.66, 0.062)]
hc = b.body(M, TP, arm_r=(0.05, 0.04, 0.034), leg_r=(0.066, 0.05, 0.04), head_r=(0.128, 0.14, 0.156), neck_r=0.046, feet='bare')


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


def densify(o, levels=1):
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


tor = part('torso')

# ================================================================ os TRAPOS escuros na cintura (antes do relevo: o pano não copia as costelas)
rag_band = b.add('rags', clothe(tor, lambda p: p.z < hz + 0.04 * H, 0.012 * H, cuts=1), rags, region='body', weight_fn=W('torso'), subdiv=0)
relief(rag_band, lambda p: 0.006 * H * (ridge(math.atan2(p.x, -p.y) * 9 + n3(p, 8) * 1.4, 2) - 0.4))
for side in ('L', 'R'):
    k_ = sk['k' + side]
    leg = part('leg' + side)
    b.add('ragsLeg' + side, clothe(leg, lambda p, k_=k_: p.z > k_.z + 0.3 * (hz - k_.z), 0.012 * H, cuts=1), rags, region='body', weight_fn=W('k' + side), subdiv=0)
# as tiras rasgadas caindo dos trapos
strips = []
for i in range(22):
    a = i / 22 * TAU
    d = Vector((math.sin(a), -math.cos(a), 0))
    z = hz - 0.1 * H
    q = surf('torso', Vector((0, 0, z)) + d * 0.6 * H, -d, 0.016 * H) or surf('legL' if d.x > 0 else 'legR', Vector((0, 0, z)) + d * 0.6 * H, -d, 0.016 * H)
    if q:
        strips.append(rod([q, q + d * 0.006 * H + Vector((0, 0, -random.uniform(0.05, 0.11) * H))], [0.02 * H, 0.004 * H], 4, flat=(outward((0, 0)), 0.3)))
b.add('ragStrips', merge(*strips), rags, region='body', weight_fn=W('torso'), subdiv=0)


# ================================================================ o corpo ESQUÁLIDO: costelas, clavículas, esterno, barriga funda e a espinha
def gaunt(p):
    v = 0.0
    chest = hz + 0.2 * H < p.z < hz + 0.5 * H
    if chest:
        # as costelas: anéis em volta do tronco (descendo para os lados), mais fortes dos lados e embaixo do peito
        side_k = min(1.0, abs(p.x) / (0.07 * H))
        v += 0.016 * H * side_k * (ridge((p.z - hz) / H * 34 + abs(p.x) / H * 9, 4) - 0.3)
    if p.y < 0:
        v += 0.016 * H * math.exp(-((p.z - (hz + 0.52 * H)) / (0.014 * H)) ** 2) * min(1.0, abs(p.x) / (0.03 * H))  # clavículas
        v -= 0.012 * H * math.exp(-(p.x / (0.014 * H)) ** 2) * (1.0 if chest else 0.0)  # o vão do esterno
        v -= 0.03 * H * math.exp(-((p.z - (hz + 0.13 * H)) / (0.07 * H)) ** 2) * math.exp(-(p.x / (0.09 * H)) ** 2)  # a barriga funda
        for s in (1, -1):
            v += bump(p, (s * 0.07 * H, -0.12 * H, hz + 0.03 * H), (0.03 * H, 0.2 * H, 0.05 * H), 0.014 * H)  # os ossos do quadril
    else:
        v += 0.014 * H * math.exp(-(p.x / (0.012 * H)) ** 2) * (0.5 + 0.5 * math.cos((p.z - hz) / H * 70))  # a espinha (vértebras)
        for s in (1, -1):
            v += bump(p, (s * 0.07 * H, 0.1 * H, hz + 0.44 * H), (0.05 * H, 0.2 * H, 0.06 * H), 0.018 * H)  # as escápulas
    return v + 0.003 * H * (n3(p, 12) - 0.5)


densify(tor)
relief(tor, gaunt)
for side in ('L', 'R'):
    s_, e_ = sk['s' + side], sk['e' + side]
    # braços ossudos: o cotovelo e o pulso aparecendo
    relief(part('arm' + side), lambda p, e_=e_: 0.006 * H * math.exp(-((p - e_).length / (0.03 * H)) ** 2) + 0.0015 * H * (n3(p, 14) - 0.5))
    k_ = sk['k' + side]
    relief(part('leg' + side), lambda p, k_=k_: 0.008 * H * math.exp(-((p - k_).length / (0.035 * H)) ** 2))  # os joelhos ossudos

# ================================================================ dedos LONGOS e magros com as unhas sujas; os pés descalços
for side in ('L', 'R'):
    e_, h_ = sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    ax = (h_ - e_).normalized()
    Fg = Sculpt()
    Nl = Sculpt()
    for k in range(5):
        off = Vector((sx * (k - 2) * 0.012 * H, (k - 2) * 0.005 * H, 0))
        if k == 0:
            off += Vector((sx * -0.008 * H, -0.018 * H, 0.016 * H))
        base = h_ + ax * 0.04 * H + off
        mid = base + ax * 0.055 * H + Vector((0, -0.006 * H, 0))
        tip = mid + ax * 0.045 * H + Vector((0, -0.012 * H, 0))
        Fg.chain([base, mid, tip], [0.0085 * H, 0.007 * H, 0.0055 * H], step=0.4)
        Nl.chain([tip, tip + ax * 0.016 * H + Vector((0, -0.006 * H, 0))], [0.005 * H, 0.002 * H], step=0.35)
    b.add('fingers' + side, Fg.mesh(res=0.0026, smooth=2, target=900), skin, region='e' + side, subdiv=0)
    b.add('nails' + side, Nl.mesh(res=0.0022, smooth=1, target=400), nail, region='e' + side, subdiv=0)
for side in ('L', 'R'):
    f = sk['foot' + side]
    Tg = Sculpt()
    Tn = Sculpt()
    Tg.chain([Vector((f.x, f.y + 0.02 * H, f.z + 0.02 * H)), Vector((f.x, f.y - 0.1 * H, f.z + 0.014 * H))], [0.038 * H, 0.032 * H], step=0.4)
    for t in (-1.5, -0.5, 0.5, 1.5):
        base = Vector((f.x + t * 0.017 * H, f.y - 0.105 * H, f.z + 0.014 * H))
        tip = base + Vector((t * 0.006 * H, -0.04 * H, -0.006 * H))
        Tg.chain([base, tip], [0.01 * H, 0.008 * H], step=0.4)
        Tn.chain([tip, tip + Vector((0, -0.014 * H, -0.004 * H))], [0.005 * H, 0.002 * H], step=0.35)
    b.add('footBones' + side, Tg.mesh(res=0.003, smooth=2, target=700), skin, region='body', weight_fn=W('k' + side), subdiv=0)
    b.add('toeNails' + side, Tn.mesh(res=0.0022, smooth=1, target=300), nail, region='body', weight_fn=W('k' + side), subdiv=0)

# ================================================================ a CABEÇA: o rosto chupado, as ORELHAS pontudas e o cabelo comprido embaraçado
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


# as maçãs e as covas dos olhos fundas, a têmpora chupada
relief(part('head'), lambda p: -0.006 * H * sum(math.exp(-((p.x - s * 0.045 * H) ** 2 + (p.z - (hc.z + 0.02 * H)) ** 2) / (0.022 * H) ** 2) for s in (1, -1)) * (1.0 if p.y < hc.y else 0.0)
       - 0.004 * H * sum(math.exp(-((p.x - s * 0.06 * H) ** 2 + (p.z - (hc.z - 0.05 * H)) ** 2) / (0.03 * H) ** 2) for s in (1, -1)) * (1.0 if p.y < hc.y else 0.0))

# as ORELHAS: longas, pontudas, para trás e para cima (como nas miniaturas e na HQ)
for s in (1, -1):
    root = on_head(s * math.pi / 2, -0.08, -0.004 * H) or HCv + Vector((s * 0.12 * H, 0, 0))
    E = Sculpt()
    # quase na horizontal: para fora e para trás, a ponta subindo um pouco
    E.chain([root, root + Vector((s * 0.045 * H, 0.02 * H, 0.012 * H)), root + Vector((s * 0.095 * H, 0.05 * H, 0.032 * H)), root + Vector((s * 0.14 * H, 0.08 * H, 0.06 * H))],
            [0.028 * H, 0.022 * H, 0.012 * H, 0.002 * H], step=0.35)
    ev, ef, _ = E.mesh(res=0.0028, smooth=2, target=700)
    # achata a orelha (fina, como uma folha) no eixo frente-trás
    ev = [(x, root.y + (y - root.y) * 0.45, z) for x, y, z in ev]
    b.add(f'ear{s}', (ev, ef, None), skin, region='body', weight_fn=HEAD, subdiv=0)

# o couro cabeludo (bolas por dentro da cabeça, como no Kian: o cabelo rente nasce dela)
C = Sculpt()
for i in range(22):
    a = i / 22 * TAU
    for el in (0.3, 0.55, 0.8, 1.05, 1.3):
        if el < 0.6 and math.cos(a) > 0.5:
            continue  # a testa fica livre
        q = on_head(a, el, -0.014 * H)
        if q:
            C.ell(q, (0.04 * H, 0.04 * H, 0.034 * H))
C.ell(HCv + Vector((0, 0.01 * H, 0.1 * H)), (0.1 * H, 0.11 * H, 0.06 * H))  # o alto da cabeça, sem buracos
b.add('hair_cap', C.mesh(res=0.004, smooth=2, disp=lambda p: 0.0015 * H * (ridge(math.atan2(p.x, p.y) * 30, 2) - 0.4), target=2200), hairm, region='body', weight_fn=HEAD, subdiv=0)

# as mechas COMPRIDAS, lisas e embaraçadas: caem dos lados (por cima das orelhas, que furam o cabelo) e nas costas
locks = Sculpt()
for i in range(38):
    a = (i / 37 - 0.5) * 1.4 * math.pi + math.pi  # dos lados e atrás (o rosto fica livre, emoldurado)
    q = on_head(a, 0.55 + random.uniform(-0.1, 0.15), 0.004 * H)
    if not q:
        continue
    d = Vector((math.sin(a), -math.cos(a), 0))
    back = math.cos(a - math.pi)  # 1 atrás, 0 dos lados
    ln = random.uniform(0.42, 0.62) * H * (0.8 + 0.3 * back)
    p1 = q + d * 0.03 * H + Vector((0, 0, -0.08 * H))
    p2 = p1 + d * (0.03 + 0.02 * back) * H + Vector((random.uniform(-0.02, 0.02) * H, 0.02 * H * back, -ln * 0.5))
    p3 = p2 + Vector((random.uniform(-0.03, 0.03) * H, 0.02 * H * back, -ln * 0.5))
    locks.chain([q, p1, p2, p3], [0.02 * H, 0.017 * H, 0.012 * H, 0.004 * H], step=0.4)
# repartido no meio: poucas mechas soltas caindo dos lados da testa (o rosto aparece, como nas miniaturas)
for s in (1, -1):
    for k in range(3):
        q = on_head(s * (0.12 + 0.12 * k), 1.25, 0.006 * H)  # nascem da risca no alto da cabeça
        mid = on_head(s * (0.55 + 0.12 * k), 0.55, 0.012 * H)  # passam pelo lado da testa
        if q and mid:
            low = mid + Vector((s * 0.012 * H, -0.004 * H, -0.12 * H - 0.03 * H * k))
            locks.chain([q, mid, low, low + Vector((s * 0.01 * H, 0.01 * H, -0.12 * H))], [0.016 * H, 0.014 * H, 0.011 * H, 0.003 * H], step=0.4)
b.add('hair_locks', locks.mesh(res=0.0035, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 120 + p.y / H * 60, 2) - 0.4), target=5000), hairm, region='body', weight_fn=lambda p: {'hd': 1.0} if p.z > hc.z - 0.12 * H else {'hd': 0.5, 'chest': 0.5}, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'manancial.blend'), check_existing=False)
