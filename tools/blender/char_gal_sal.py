"""
GAL SAL (personagem masculino, Desconjuração) — public/models/gal_sal.glb. Refeito com a técnica atual (sculpt_lib:
metaballs, relevo, peças coladas na superfície por raio) a partir das ARTES OFICIAIS "Miniatura Gal em Desconjuração",
"Miniatura Gal em combate em Desconjuração" e "Arte promocional - Gal" (wiki "Gal").

Referência (de cima a baixo):
  - CABELO preto liso e longo, repartido no meio, puxado para os lados e caindo na frente dos ombros até o peito e
    atrás até o meio das costas;
  - a VENDA preta larga por cima do cabelo, com as marcas douradas na frente (textura blindfold_gal), o nó e as pontas
    atrás; o sorriso largo de lábios escuros; o BRINCO pendurado na orelha direita; a GARGANTILHA preta;
  - a PELE toda coberta de TEXTO escrito (textura skin_injustica);
  - o PONCHO preto de pano gasto: cai em PONTA na frente e atrás, cobre os braços até o cotovelo dos lados, o DECOTE
    em V com a costura dourada, a barra rasgada com a FRANJA dourada;
  - as CORRENTES enroladas nos antebraços; a calça preta; DESCALÇO.
As lâminas Ereshkigal estão em npc_gal_blade.py (carregadas em models/weapons.js → sickleBlade).
  node tools/blender/build.mjs gal_sal   → public/models/gal_sal.glb (+ tools/blender/fonte/gal_sal.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, relief, clothe, shell_grid, chain_mesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'gal_sal.glb'
random.seed(77)

b = Builder(width=0.98, bulk=0.96, height=1.02)
sk = b.sk
H = sk.h
hz = sk['hips'].z

skin = material('skin_injustica', '#ffffff', 0.8)  # textura com a escrita
M = {
    'skin': skin,
    'face': material('face_injustica', '#ffffff', 0.8),
    'torso': skin,
    'arm': skin,
    'legs': material('pants_inj', '#ffffff', 0.9),  # a calça preta (textura: pano gasto)
    'feet': skin,
}
black = material('poncho_gal', '#ffffff', 0.85)  # o poncho (textura: pano preto gasto com remendos)
lining = material('poncho_lining', '#0b0a0d', 0.9)
gold = material('gold_trim', '#c9a24a', 0.35, metal=0.8)
hairm = material('hair_inj', '#0b0b0d', 0.45)
choker = material('choker', '#0a0a0c', 0.5)
blind = material('blindfold_gal', '#ffffff', 0.6)  # textura: preto com as marcas douradas
chainm = material('chain_gal', '#3a3a40', 0.35, metal=0.85)
PREVIEW = {'skin_injustica': '#d8c4bc', 'face_injustica': '#d8c4bc', 'pants_inj': '#16151a', 'poncho_gal': '#1c1a20', 'blindfold_gal': '#0d0c10'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

TP = [(-0.12, 0.165), (0.0, 0.165), (0.18, 0.158), (0.38, 0.205), (0.5, 0.215), (0.6, 0.115), (0.66, 0.068)]
hc = b.body(M, TP, arm_r=(0.062, 0.05, 0.043), feet='bare')


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


def outer(names, c, d, off):
    """o ponto mais de fora entre as peças, num raio que vem de fora (c + d) em direção a c"""
    best = None
    for nm in names:
        q = surf(nm, c + d * 0.6 * H, -d, off)
        if q and (best is None or (q - c).dot(d) > (best - c).dot(d)):
            best = q
    return best


def spiral(a_, b_, r, turns, n=60, phase=0.0):
    return [a_.lerp(b_, i / n) + Vector((math.sin(phase + i / n * turns * TAU) * r, -math.cos(phase + i / n * turns * TAU) * r, 0)) for i in range(n + 1)]


# ================================================================ a CALÇA preta: o pano com dobras e a barra puída acima do tornozelo
for side in ('L', 'R'):
    relief(part('leg' + side), lambda p: 0.006 * H * (ridge(p.z / H * 20 + n3(p, 10) * 1.6, 2) - 0.4))
b.add('pantsHip', clothe(part('torso'), lambda p: p.z < hz + 0.12 * H, 0.012 * H, cuts=1), M['legs'], region='body', weight_fn=W('torso'), subdiv=0)

# ================================================================ o PONCHO: ponta na frente e atrás, até o cotovelo dos lados, decote em V
TOP = 1.62 * H
LEN_FRONT = 0.86 * H
LEN_SIDE = 0.46 * H
NA, NV = 96, 16
BODY = ['torso', 'armL', 'armR', 'pantsHip']


def hem_len(a):
    d = min(abs(math.atan2(math.sin(a), math.cos(a))), abs(math.atan2(math.sin(a - math.pi), math.cos(a - math.pi))))
    f = 1 - d / (math.pi / 2)  # 1 na frente/atrás, 0 nos lados
    rag = 0.035 * H * (ridge(a * 9 + n3(Vector((a, 0, 0)), 3) * 2, 2) - 0.4)  # a barra rasgada
    return LEN_SIDE + (LEN_FRONT - LEN_SIDE) * f ** 1.15 + rag


def v_start(a):
    # o decote em V: a borda de cima desce na frente (a = 0) até o meio do peito
    return 0.3 * max(0.0, 1 - abs(math.atan2(math.sin(a), math.cos(a))) / 0.5) ** 1.3


_prof = {}
OFF = 0.016 * H


def profile(a):
    """o caimento do pano numa direção: sai do pescoço, passa POR CIMA dos ombros e dos braços (raio de cima) e, da
    borda do corpo para fora, cai na vertical até a barra. Devolve a polilinha (r, z) e o comprimento total"""
    if a in _prof:
        return _prof[a]
    d = Vector((math.sin(a), -math.cos(a), 0))
    r0 = 0.072 * H
    rs = [r0 + 0.32 * H * k / 40 for k in range(41)]
    tops = []
    for r in rs:
        q = outer(['torso', 'armL', 'armR'], d * r + Vector((0, 0, 1.2 * H)), Vector((0, 0, 1)), 0.0)
        tops.append(q.z + OFF if q and q.z > TOP - 0.45 * H else None)
    edge = max((k for k, t in enumerate(tops) if t is not None), default=0)
    pts = []
    run = -1e9
    zs = [None] * (edge + 1)
    for k in range(edge, -1, -1):  # o pano não afunda entre os ombros e o pescoço: o máximo de fora para dentro
        if tops[k] is not None:
            run = max(run, tops[k])
        zs[k] = run
    for k in range(edge + 1):
        pts.append((rs[k], min(TOP, max(zs[k], TOP - 0.35 * (rs[k] - r0)))))
    re, ze = pts[-1]
    hz_ = TOP - hem_len(a)
    pts.append((re + 0.02 * H, ze - 0.025 * H))  # a quina por cima da borda
    for k in range(1, 7):  # a queda, abrindo um pouco embaixo
        t = k / 6
        pts.append((re + 0.022 * H + 0.04 * H * t * t, ze - 0.025 * H + (hz_ - ze + 0.025 * H) * t))
    L = [0.0]
    for p, q in zip(pts, pts[1:]):
        L.append(L[-1] + math.hypot(q[0] - p[0], q[1] - p[1]))
    _prof[a] = (pts, L)
    return _prof[a]


def poncho_pt(a, v):
    pts, L = profile(a)
    s = v * L[-1]
    k = max(0, min(len(L) - 2, next((i for i in range(len(L) - 1) if L[i + 1] >= s), len(L) - 2)))
    t = (s - L[k]) / max(L[k + 1] - L[k], 1e-9)
    r = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t
    z = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t
    r *= 1 + 0.06 * v * (ridge(a * 8 + n3(Vector((a, v, 0)), 3), 2) - 0.4)  # as dobras do pano embaixo
    d = Vector((math.sin(a), -math.cos(a), 0))
    q = d * r + Vector((0, 0, z))
    # nunca por dentro do corpo: o raio de fora para o eixo acha a pele e o pano fica sempre um pouco por cima
    hit = outer(BODY, Vector((0, 0, z)), d, 0.0)
    if hit:
        r_need = Vector((hit.x, hit.y, 0)).length + 0.014 * H
        if r_need > r:
            q = d * r_need + Vector((0, 0, z))
    return q


def poncho_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.12 * H, 0.3 * H, abs(p.x)) * 0.65
    w_hip = smoothstep(hz + 0.15 * H, hz - 0.1 * H, p.z) * (1 - w_arm) * 0.6
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


ANG = [-math.pi + TAU * j / NA for j in range(NA + 1)]  # começa atrás: u = 0,5 é a frente
rows = []
for i in range(NV + 1):
    t = i / NV
    rows.append([poncho_pt(a, v_start(a) + (1 - v_start(a)) * t) for a in ANG])
b.add('poncho', shell_grid(rows, 0.007 * H), black, region='body', weight_fn=poncho_weights, subdiv=0)

# a FRANJA dourada da barra: a fita e os fios caindo (de tamanhos diferentes)
hem = [poncho_pt(a, 0.995) for a in ANG]
fr = [rod(hem, 0.006 * H, 5, caps=False)]
for k in range(NA * 2):
    a = -math.pi + TAU * (k + 0.5) / (NA * 2)
    p = poncho_pt(a, 1.0)
    ln = (0.025 + 0.025 * random.random()) * H
    fr.append(rod([p, p + Vector((0, 0, -ln))], [0.0035 * H, 0.0008 * H], 4))
b.add('ponchoFringe', merge(*fr), gold, region='body', weight_fn=poncho_weights, subdiv=0)
# a costura dourada do decote: a linha e os pontos atravessados
va = [a for a in ANG if abs(a) < 0.62]
vline = [poncho_pt(a, v_start(a) + 0.012) for a in va]
vn = [rod(vline, 0.005 * H, 5, caps=False)]
for k in range(1, len(vline) - 1, 2):
    p, q = vline[k - 1], vline[k + 1]
    t = (q - p).normalized()
    n = t.cross(Vector((p.x, p.y, 0)).normalized()).normalized()
    c = vline[k] + Vector((p.x, p.y, 0)).normalized() * 0.003 * H
    vn.append(rod([c - n * 0.014 * H, c + n * 0.014 * H], 0.0028 * H, 4))
b.add('vneckGold', merge(*vn), gold, region='body', weight_fn=poncho_weights, subdiv=0)

# ================================================================ as CORRENTES enroladas nos antebraços
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    sp = spiral(e.lerp(h, 0.3), e.lerp(h, 0.9), 0.056 * H, 2.4, n=50, phase=0.5 if side == 'L' else 2.0)
    b.add('armChain' + side, chain_mesh(sp, link=0.03 * H, r=0.0042 * H), chainm, region='body', weight_fn=W('e' + side), subdiv=0)

# ================================================================ a GARGANTILHA e o BRINCO na orelha direita (-x)
nk = part('neck')
nz = 1.655 * H
ring = [outer(['neck'], Vector((0, 0, nz)), Vector((math.sin(a), -math.cos(a), 0)), 0.006 * H) for a in [i / 24 * TAU for i in range(25)]]
ring = [q for q in ring if q]
b.add('choker', rod(ring, 0.012 * H, 6, caps=False, flat=(outward((0, 0)), 0.5)), choker, region='body', weight_fn=lambda p: {'neck': 1.0}, subdiv=0)
ear = part('ear-1')
ec = ear.matrix_world @ (sum((v.co for v in ear.data.vertices), Vector()) / len(ear.data.vertices))
lobe = ec + Vector((-0.012 * H, -0.004 * H, -0.035 * H))
er = [rod([lobe + Vector((0, math.sin(a) * 0.008 * H, -math.cos(a) * 0.008 * H + 0.008 * H)) for a in [i / 12 * TAU for i in range(13)]], 0.0018 * H, 4, caps=False),
      rod([lobe + Vector((0, 0, -0.016 * H)), lobe + Vector((0, 0, -0.05 * H))], [0.003 * H, 0.002 * H], 5),
      rod([lobe + Vector((0, -0.009 * H, -0.04 * H)), lobe + Vector((0, 0.009 * H, -0.04 * H))], 0.002 * H, 4)]
b.add('earring', merge(*er), gold, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

# ================================================================ CABELO preto liso: repartido no meio, puxado para os lados e caindo comprido
D = Sculpt()
NSd = 22
for s in (1, -1):
    for i in range(NSd):
        t = i / (NSd - 1)  # 0 = frente da risca, 1 = nuca
        a = s * (0.22 + 0.78 * t) * math.pi
        th = math.radians(35 + 125 * t)  # da testa (na frente) até o alto da nuca, pela risca do meio
        root = outer(['head'], Vector((hc.x, hc.y, hc.z)), Vector((s * 0.06, -math.cos(th), math.sin(th))).normalized(), 0.002 * H)
        if not root:
            continue
        d = Vector((math.sin(a), -math.cos(a), 0))
        side_p = outer(['head', 'ear1', 'ear-1'], Vector((hc.x, hc.y, hc.z + 0.02 * H)), d, 0.01 * H)
        if not side_p:
            continue
        top_p = outer(['head'], Vector((hc.x, hc.y, hc.z)), (d + Vector((0, 0, 1.2))).normalized(), 0.004 * H) or root.lerp(side_p, 0.5)
        ln = (0.47 + 0.07 * random.random()) * H
        if t < 0.3:  # as mechas da frente caem NA FRENTE dos ombros até o peito
            fall = [side_p + Vector((s * 0.02 * H, -0.02 * H, -0.12 * H)), side_p + Vector((s * 0.05 * H, -0.08 * H, -0.3 * H)),
                    side_p + Vector((s * 0.06 * H, -0.12 * H, -ln * 0.75)), side_p + Vector((s * 0.06 * H, -0.13 * H, -ln))]
        else:  # o resto cai pelas costas
            back = 0.05 * H * t
            fall = [side_p + Vector((s * 0.015 * H, 0.02 * H + back, -0.14 * H)), side_p + Vector((s * 0.03 * H * (1 - t), 0.06 * H + back, -0.35 * H)),
                    side_p + Vector((s * 0.03 * H * (1 - t), 0.08 * H + back, -ln * 0.8)), side_p + Vector((s * 0.03 * H * (1 - t), 0.08 * H + back, -ln * 1.05))]
        D.chain([root, top_p, side_p] + fall, [0.009 * H, 0.011 * H, 0.013 * H, 0.015 * H, 0.014 * H, 0.012 * H, 0.009 * H], step=0.45)
b.add('hair', D.mesh(res=0.0055, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.x / H * 140 + p.y / H * 90, 2) - 0.4), target=6500), hairm, region='body', weight_fn=lambda p: {'hd': 1.0} if p.z > hc.z - 0.12 * H else {'hd': 0.5, 'chest': 0.5}, subdiv=0)

# ================================================================ a VENDA por cima do cabelo (u = 0,5 é a frente), o nó e as pontas atrás
brow = []
for dz in (-0.045, -0.015, 0.015, 0.045):
    z = hc.z + dz * H
    row = []
    for a in ANG[::2]:
        d = Vector((math.sin(a), -math.cos(a), 0))
        q = outer(['head', 'hair'], Vector((hc.x, hc.y, z)), d, 0.007 * H)
        row.append(q if q else Vector((hc.x, hc.y, z)) + d * 0.16 * H)
    brow.append(row)
b.add('blindfold', shell_grid(brow, 0.006 * H), blind, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
kb = outer(['hair'], Vector((hc.x, hc.y, hc.z)), Vector((0, 1, 0)), 0.02 * H) or hc + Vector((0, 0.17 * H, 0))
K = Sculpt()
K.ell(kb, (0.026 * H, 0.016 * H, 0.022 * H))
for dx, ln in ((0.02, 0.18), (-0.024, 0.24)):
    K.chain([kb, kb + Vector((dx * H, 0.02 * H, -ln * 0.5 * H)), kb + Vector((dx * 1.6 * H, 0.03 * H, -ln * H))], [0.014 * H, 0.012 * H, 0.009 * H], step=0.45)
b.add('blindKnot', K.mesh(res=0.004, smooth=2, target=500), choker, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'gal_sal.blend'), check_existing=False)
