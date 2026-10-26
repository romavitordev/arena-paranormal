"""
KIAN (Kian no corpo marcado — Desconjuração / Calamidade) — public/models/kian.glb
Referências: Referencias visuais/Personagens/Kian ("desconjurado corpo inteiro", "desconjurado", "desconjurado sério",
"desconjurado pose") + a wiki (Kian: "Miniatura Kian marcado em Desconjuração" e "Miniatura Kian em Calamidade").
Pele escura, corpo forte; cabelo black power; sigilo luminoso na testa e o traço dourado descendo do olho esquerdo,
três riscos escuros na outra bochecha, olhos dourados (textura face_desconjurado); sem camisa: LINHAS DOURADAS
luminosas descendo do pescoço, cruzando o peito em V e pelo abdômen, terminando em setas (textura torso_kian); os
BRAÇOS inteiros cobertos de fileiras de escrita que brilha (arms_kian), as mãos e os pés também; calça cinza-escura;
descalço. NENHUMA arma.
Peças da Transformação (Desconjuração → CALAMIDADE, ligadas na cena "calamity"): a barba cresce em três etapas
(prop_beard_s rala → prop_beard_m → prop_beard_f cheia) e aparecem as FAIXAS brancas nos antebraços com as pontas soltas
(prop_wraps) — a miniatura de Calamidade.
Coordenadas do tronco ANTES da escala do Builder (x × k_tx, y × k_ty); espessuras em frações de H.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import lib
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'kian.glb'
random.seed(3150)  # Kushim
b = Builder(width=1.06, bulk=1.18, height=1.03)
sk = b.sk
H = sk.h
hz = sk['hips'].z

torso_m = material('skin_torso_kian', '#ffffff', 0.75)  # 'skin_': mantém o tom de pele sob a luz colorida das arenas       # pele com as linhas douradas (textura + brilho)
arms_m = material('arms_kian', '#ffffff', 0.75)         # pele coberta de escrita que brilha
skin = material('skin_kian', '#4e3426', 0.75)
pants = material('pants_desc', '#3a3836', 0.9)
waist = material('waistband', '#2a2a2e', 0.8)
wrap = material('wraps_desc', '#dcd6c8', 0.95)
hairm = material('hair_short', '#121010', 0.9)
beard = material('beard_desc', '#2a1c16', 0.85)

M = {
    'skin': skin,
    'face': material('face_desconjurado', '#ffffff', 0.8),
    'torso': torso_m,
    'hand': arms_m,
}


def lerp_table(tab, x):
    if x <= tab[0][0]:
        return tab[0][1:]
    for a, c in zip(tab, tab[1:]):
        if x <= c[0]:
            t = (x - a[0]) / (c[0] - a[0])
            return tuple(p + (q - p) * t for p, q in zip(a[1:], c[1:]))
    return tab[-1][1:]


def rod(pts, radii, seg=6):
    pts = [Vector(p) for p in pts]
    verts, faces, uvs = [], [], []
    n = len(pts)
    prev = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        side = (prev - t * prev.dot(t)) if prev is not None else t.orthogonal()
        side.normalize()
        prev = side
        up = t.cross(side)
        for s in range(seg + 1):
            a = s / seg * TAU
            verts.append(tuple(p + side * math.cos(a) * radii[i] + up * math.sin(a) * radii[i]))
            uvs.append((s / seg, i / (n - 1)))
    row = seg + 1
    for i in range(n - 1):
        for s in range(seg):
            a = i * row + s
            faces.append((a, a + row, a + 1 + row, a + 1))
    return verts, faces, uvs


def grid(fn, nu, nv, flip=False):
    verts, faces, uvs = [], [], []
    for j in range(nv + 1):
        for i in range(nu + 1):
            verts.append(tuple(fn(i / nu, j / nv)))
            uvs.append((i / nu, 1 - j / nv))
    row = nu + 1
    for j in range(nv):
        for i in range(nu):
            a = j * row + i
            f = (a, a + 1, a + 1 + row, a + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


# ---------------------------------------------------------------- TRONCO forte (peito e ombros largos, abdômen marcado)
TT = [
    (-0.16, 0.182, 0.134, 0.134),
    (-0.06, 0.184, 0.136, 0.138),
    (0.04, 0.186, 0.14, 0.142),
    (0.14, 0.198, 0.148, 0.148),
    (0.24, 0.22, 0.158, 0.154),
    (0.33, 0.25, 0.172, 0.162),
    (0.42, 0.268, 0.184, 0.168),   # peitoral
    (0.5, 0.272, 0.18, 0.17),
    (0.56, 0.252, 0.16, 0.164),
    (0.6, 0.222, 0.136, 0.15),
    (0.64, 0.17, 0.112, 0.128),    # trapézio
    (0.675, 0.12, 0.092, 0.1),
    (0.71, 0.092, 0.08, 0.084),
]


def torso_pt(a, z, out=1.0, extra=0.0):
    w, f, bk = lerp_table(TT, z)
    c = math.cos(a)
    dep = f if c > 0 else bk
    return Vector((math.sin(a) * (w + extra) * out * H, -c * (dep + extra) * out * H, hz + z * H))


def kian_torso(sk_, profile, seg=18, depth=0.62):
    rings = [(0, 0, hz + z * H, w * H, 1.0) for z, w, f, bk in TT]
    v, f, u = tube(rings, 32)
    out = []
    for x, y, z in v:
        w_, fd, bd = lerp_table(TT, (z - hz) / H)
        out.append((x, y * (fd if y < 0 else bd) * H, z))
    return out, f, u


lib.torso_part = kian_torso
hc = b.body(M, [], arms=(), legs=False, head_r=(0.14, 0.15, 0.162), neck_r=0.085)

# ---------------------------------------------------------------- BRAÇOS fortes, inteiros escritos
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    rings = []
    shtop = s + Vector((-sx * 0.02 * H, 0, 0.0))
    for i in range(8):
        t = i / 7
        p = shtop.lerp(e, t)
        r = 0.088 + 0.022 * math.sin(t * math.pi * 0.95) - 0.016 * t
        rings.append((p.x, p.y, p.z, r, r * 1.04))
    for i in range(1, 7):
        t = i / 6 * 0.94
        p = e.lerp(h, t)
        r = 0.07 + 0.02 * math.sin(min(1.0, t * 2.2) * math.pi * 0.5) * (1 - t) - 0.014 * t
        rings.append((p.x, p.y, p.z, r, r * 0.92))
    b.add('arm' + side, tube(rings, 16), arms_m, region='arm' + side, subdiv=0)
    b.add('delt' + side, ellipsoid((s.x + sx * 0.005 * H, s.y, s.z - 0.02 * H), (0.088 * H, 0.094 * H, 0.08 * H), 16, 12), arms_m, region='arm' + side, subdiv=0)
    b.add('hand' + side, hand_part(sk, side, 0.07), arms_m, region='e' + side)

# ---------------------------------------------------------------- CALÇA cinza-escura e PÉS descalços escritos
b.add('pants_hip', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.05 - v * 0.27, 1.0, 0.01), 32, 4), pants, region='torso', subdiv=0)
b.add('waistband', grid(lambda u, v: torso_pt((u - 0.5) * TAU, 0.06 - v * 0.04, 1.0, 0.016), 32, 1), waist, region='torso', subdiv=0)
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    topp = Vector((l.x, l.y, l.z + 0.07 * H))
    rings = []
    for t, r in ((0.0, 0.1), (0.35, 0.098), (0.75, 0.086), (1.0, 0.08)):
        p = topp.lerp(k, t)
        rings.append((p.x, p.y, p.z, r, r))
    for t, r in ((0.3, 0.074), (0.6, 0.068), (0.85, 0.066), (0.93, 0.07)):
        p = k.lerp(f, t)
        rings.append((p.x, p.y, p.z, r, r))
    b.add('pants' + side, tube(rings, 14), pants, region='leg' + side, subdiv=0)
    b.add('ankle' + side, tube(limb_rings(k.lerp(f, 0.9), k.lerp(f, 1.0), 0.05, 0.048, n=1), 12), arms_m, region='k' + side, subdiv=0)
    b.add('foot' + side, ellipsoid((f.x, f.y - 0.05 * H, f.z + 0.018 * H), (0.05 * H, 0.12 * H, 0.04 * H), 12, 8), arms_m, region='foot' + side, subdiv=0)
    toes = [ellipsoid((f.x + (i - 1.5) * 0.017 * H, f.y - 0.16 * H, f.z + 0.012 * H), (0.009 * H, 0.014 * H, 0.009 * H), 6, 4) for i in range(4)]
    b.add('toes' + side, merge(*toes), arms_m, region='foot' + side, subdiv=0)


# ================================================================ TÉCNICA ATUAL (sculpt_lib) por cima do corpo base (que guarda os UVs das texturas
# das linhas e da escrita): MÚSCULOS em relevo, a calça com dobras, o AFRO esculpido, as barbas e as faixas espirais
from sculpt_lib import Sculpt, ridge, n3, outward, relief
from sculpt_lib import rod as srod
from mathutils.bvhtree import BVHTree


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


def bump(p, c, r, amp):
    d2 = ((p.x - c[0]) / r[0]) ** 2 + ((p.y - c[1]) / r[1]) ** 2 + ((p.z - c[2]) / r[2]) ** 2
    return amp * math.exp(-d2 * 2.2)


def muscles(p):
    """peitoral, abdômen em seis gomos com a linha alba, oblíquos e as costas (dorsais e a coluna)"""
    v = 0.0
    if p.y < 0.02 * H:  # frente
        for s in (1, -1):
            v += bump(p, (s * 0.1 * H, -0.18 * H, hz + 0.46 * H), (0.09 * H, 0.2 * H, 0.06 * H), 0.016 * H)  # peitoral
            v += bump(p, (s * 0.15 * H, -0.12 * H, hz + 0.2 * H), (0.04 * H, 0.2 * H, 0.1 * H), 0.006 * H)   # oblíquos
            for z in (0.13, 0.21, 0.29):
                v += bump(p, (s * 0.036 * H, -0.15 * H, hz + z * H), (0.03 * H, 0.2 * H, 0.03 * H), 0.008 * H)  # gomos
        if hz + 0.08 * H < p.z < hz + 0.4 * H:
            v -= 0.006 * H * math.exp(-(p.x / (0.008 * H)) ** 2)  # linha alba
        if abs(p.x) < 0.17 * H:
            v -= 0.006 * H * math.exp(-((p.z - hz - 0.395 * H) / (0.012 * H)) ** 2)  # sob o peitoral
    else:  # costas
        for s in (1, -1):
            v += bump(p, (s * 0.12 * H, 0.14 * H, hz + 0.4 * H), (0.08 * H, 0.2 * H, 0.14 * H), 0.012 * H)  # dorsais
        if p.z > hz + 0.1 * H:
            v -= 0.006 * H * math.exp(-(p.x / (0.01 * H)) ** 2)  # a coluna
    return v


def densify(o, levels=2):
    """subdivide a peça (mantém o UV) para o relevo dos músculos ter vértices onde aparecer"""
    md = o.modifiers.new('dens', 'SUBSURF')
    md.levels = levels
    md.render_levels = levels
    bpy.context.view_layer.objects.active = o
    for x in bpy.context.selected_objects:
        x.select_set(False)
    o.select_set(True)
    bpy.ops.object.modifier_apply(modifier=md.name)


densify(part('torso'), 1)
relief(part('torso'), muscles)
for side in ('L', 'R'):
    densify(part('arm' + side), 1)
    s_, e_, h_ = sk['s' + side], sk['e' + side], sk['hand' + side]
    bc = s_.lerp(e_, 0.55)
    fc = e_.lerp(h_, 0.25)
    relief(part('arm' + side), lambda p, bc=bc, fc=fc: bump(p, (bc.x, bc.y - 0.04 * H, bc.z), (0.06 * H, 0.06 * H, 0.09 * H), 0.012 * H)
           + bump(p, (fc.x, fc.y, fc.z), (0.07 * H, 0.07 * H, 0.08 * H), 0.007 * H))

# ================================================================ FAIXAS (Calamidade): espiral colada do cotovelo aos nós dos dedos e as duas
# pontas soltas caindo do pulso
for side in ('L', 'R'):
    e_, h_ = sk['e' + side], sk['hand' + side]
    sx = 1 if side == 'L' else -1
    ax = (h_ - e_).normalized()
    u = ax.orthogonal().normalized()
    v = ax.cross(u)
    wr = []
    for i in range(241):
        t = i / 240
        c = e_.lerp(h_ + ax * 0.06 * H, 0.08 + 0.92 * t)
        a = t * 13.0 * TAU
        d = u * math.cos(a) + v * math.sin(a)
        q = surf('arm' + side, c + d * 0.4 * H, -d, 0.002 * H) or surf('hand' + side, c + d * 0.4 * H, -d, 0.002 * H)
        if q:
            wr.append(q)
    if len(wr) > 3:
        b.add('prop_wraps_arm' + side, srod(wr, 0.014 * H, 5, caps=False, flat=(lambda p, e_=e_, ax=ax: (p - e_ - ax * (p - e_).dot(ax)), 0.85)), wrap, region='body', weight_fn=W('e' + side), subdiv=0)
    tails = []
    for k in range(2):
        p0 = e_.lerp(h_, 0.86) + Vector((sx * 0.055 * H, (0.015 - 0.03 * k) * H, 0.0))
        pts = [p0, p0 + Vector((sx * 0.025 * H, 0.008 * H, -0.06 * H)), p0 + Vector((sx * 0.035 * H, 0.012 * H, -0.13 * H - 0.03 * k * H))]
        tails.append(srod(pts, [0.012 * H, 0.01 * H, 0.006 * H], 4, flat=(outward((e_.x, e_.y)), 0.3)))
    b.add('prop_wraps_tails' + side, merge(*tails), wrap, region='body', weight_fn=W('e' + side), subdiv=0)
b.group('prop_wraps')

# ================================================================ a CALÇA cinza: as dobras
for side in ('L', 'R'):
    relief(part('pants' + side), lambda p: 0.005 * H * (ridge(p.z / H * 16 + n3(p, 9) * 1.6, 2) - 0.4))
relief(part('pants_hip'), lambda p: 0.004 * H * (ridge(p.z / H * 16 + n3(p, 9) * 1.4, 2) - 0.4))

# ================================================================ o cabelo CURTO e rente (Desconjuração e Calamidade)
HCv = Vector((hc.x, hc.y, hc.z))


def on_head(a, el, off):
    """a = ângulo a partir da frente (+ = lado esquerdo dele, +x), el = elevação a partir do equador"""
    d = Vector((math.sin(a) * math.cos(el), -math.cos(a) * math.cos(el), math.sin(el)))
    return surf('head', HCv + d * 0.6 * H, -d, off)


D = Sculpt()
for i in range(30):
    for j in range(12):
        a = (i / 30 - 0.5) * TAU
        el = -0.35 + 1.9 * j / 11
        if math.cos(a) > 0.5 and el < 0.72:
            continue  # testa e rosto (a linha do cabelo reta na testa)
        if el < 0.12 and math.cos(a) > -0.3:
            continue  # dos lados vai até o alto da orelha
        if el < -0.12 and math.cos(a) > -0.8:
            continue
        # RENTE (pedido do dono: ele não tem black power): as bolas ficam com o centro DENTRO da cabeça e só a casca fina
        # sai para fora — o cabelo raspado curto das referências "desconjurado", com um pouco mais de volume no alto
        off = (-0.026 + 0.008 * max(0.0, math.sin(el))) * H
        q = on_head(a, el, off)
        if q:
            D.ell(q, (0.032 * H, 0.032 * H, 0.03 * H))
short_disp = lambda p: 0.0012 * H * (n3(p, 300) * 0.8 - 0.2)  # o crespo bem curto
b.add('hair_short', D.mesh(res=0.004, smooth=2, disp=short_disp, target=4000), hairm, region='body', weight_fn=HEAD, subdiv=0)


# ================================================================ as BARBAS da Transformação: média (crescendo) e cheia (Calamidade)
def beard_sculpt(name, off, r, chin_drop, mus_r):
    B = Sculpt()
    for i in range(19):
        a = (i / 18 - 0.5) * 2.75
        for el in (-0.24, -0.38, -0.52, -0.66, -0.8):
            if abs(a) < 0.34 and el > -0.56:
                continue  # a boca
            if abs(a) < 0.72 and el > -0.36:
                continue  # as maçãs do rosto
            q = on_head(a, el, off)
            if q:
                B.ell(q, (r, r, r * 0.9))
    for s in (1, -1):
        for el in (-0.1, 0.05):
            q = on_head(s * 1.25, el, off)
            if q:
                B.ell(q, (r * 0.85, r * 0.85, r))
    chin = on_head(0.0, -0.82, off + 0.006 * H)
    if chin and chin_drop > 0:
        B.chain([chin, chin + Vector((0, -0.01 * H, -chin_drop))], [r * 1.3, r * 0.8], step=0.5)
    b.add(name, B.mesh(res=0.004, smooth=2, disp=lambda p: 0.002 * H * (ridge(p.x / H * 140 + p.z / H * 40 + n3(p, 40), 2) - 0.4), target=2600), beard, region='body', weight_fn=HEAD, subdiv=0)
    Mu = Sculpt()
    for s in (1, -1):
        pts = [on_head(s * a, el, off + 0.008 * H) for a, el in ((0.03, -0.36), (0.16, -0.38), (0.28, -0.46), (0.32, -0.56))]
        pts = [q for q in pts if q]
        if len(pts) > 1:
            Mu.chain(pts, [mus_r, mus_r * 1.1, mus_r * 0.8, mus_r * 0.5][:len(pts)], step=0.45)
    b.add(name + '_mustache', Mu.mesh(res=0.0035, smooth=2, target=900), beard, region='body', weight_fn=HEAD, subdiv=0)


beard_sculpt('prop_beard_m', 0.0, 0.016 * H, 0.0, 0.008 * H)  # crescendo: rente
beard_sculpt('prop_beard_f', 0.01 * H, 0.03 * H, 0.05 * H, 0.015 * H)  # cheia e densa (Calamidade)
b.group('prop_beard_m')
b.group('prop_beard_f')

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'kian.blend'), check_existing=False)
