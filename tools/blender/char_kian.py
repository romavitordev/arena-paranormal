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

torso_m = material('torso_kian', '#ffffff', 0.75)       # pele com as linhas douradas (textura + brilho)
arms_m = material('arms_kian', '#ffffff', 0.75)         # pele coberta de escrita que brilha
skin = material('skin_kian', '#4e3426', 0.75)
pants = material('pants_desc', '#3a3836', 0.9)
waist = material('waistband', '#2a2a2e', 0.8)
wrap = material('wraps_desc', '#dcd6c8', 0.95)
hairm = material('hair_afro', '#121010', 0.9)
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
    # FAIXAS (Calamidade): do meio do antebraço até a mão, com as pontas soltas caindo
    wr = [tube(limb_rings(e.lerp(h, t), e.lerp(h, t + 0.09), 0.08 - t * 0.016, 0.079 - t * 0.016, n=1), 14) for t in (0.28, 0.4, 0.52, 0.64, 0.76, 0.88)]
    b.add('prop_wraps_arm' + side, merge(*wr), wrap, region='e' + side, subdiv=0)
    c = h + Vector((0, 0, -0.04 * H))
    b.add('prop_wraps_fist' + side, ellipsoid((c.x, c.y, c.z + 0.012), (0.068, 0.082, 0.07), 10, 8), wrap, region='e' + side, subdiv=0)
    tails = []
    for k in range(2):
        # pontas curtas, saindo do punho para FORA e caindo (não apontam para cima quando ele ergue o punho)
        p0 = e.lerp(h, 0.82) + Vector((sx * 0.06, 0.02 - 0.04 * k, 0.0))
        pts = [p0, p0 + Vector((sx * 0.03, 0.01, -0.03 * H)), p0 + Vector((sx * 0.04, 0.012 + 0.01 * k, -0.07 * H))]
        tails.append(rod(pts, [0.013, 0.01, 0.006], 4))
    b.add('prop_wraps_tails' + side, merge(*tails), wrap, region='e' + side, subdiv=0)
b.group('prop_wraps')

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

# ---------------------------------------------------------------- CABEÇA: cabelo curto rente e as barbas da Transformação
HR = (0.143 * H, 0.153 * H, 0.166 * H)
HC = Vector((hc.x, hc.y + 0.006, hc.z + 0.01))
# cabelo raspado curto (referências "desconjurado", "desconjurado sério", "desconjurado pose"): uma calota rente com a
# linha da testa marcada e um pouco mais de volume no alto
b.add('hair_short', hair_cap((HC.x, HC.y, HC.z + 0.004 * H), (HR[0] * 1.015, HR[1] * 1.02, HR[2] * 1.03), front=0.26, side=0.4, back=0.58), hairm, region='head')


def beard_mesh(name, thick, chin, cheek, mat_):
    """barba que acompanha a mandíbula: sobe pelas costeletas até a frente da orelha, contorna o queixo e deixa a boca
    à mostra. thick = espessura; chin = quanto o queixo desce; cheek = até onde sobe na bochecha."""
    nu, nv = 28, 6
    def pt(u, v):
        # u: de uma costeleta à outra passando pelo queixo; v: da borda de cima (bochecha) à de baixo (sob a mandíbula)
        a = (u - 0.5) * math.pi * 1.25           # ângulo em volta do rosto (0 = queixo/frente)
        side = abs(math.sin(a))
        # (o rosto é mapeado pelo ângulo: boca ≈ hc.z − 0,081 H, queixo ≈ − 0,128 H, nariz ≈ − 0,023 H)
        top_z = hc.z - 0.105 * H + side ** 1.5 * (cheek + 0.03 * H)  # na frente começa ABAIXO do lábio; nos lados sobe pela bochecha
        bot_z = hc.z - 0.165 * H - (1 - side) * chin + side * 0.06 * H
        z = top_z + (bot_z - top_z) * v
        # raio da cabeça nessa altura (encolhe embaixo — o queixo) + a espessura da barba
        k = max(0.25, 1 - ((hc.z - z) / (0.17 * H)) ** 2) ** 0.5
        rx = HR[0] * (0.78 + 0.2 * k) + thick * (0.5 + 0.5 * math.sin(v * math.pi))
        ry = HR[1] * (0.74 + 0.2 * k) + thick * (0.5 + 0.5 * math.sin(v * math.pi)) + (1 - side) * chin * 0.15
        return Vector((hc.x + math.sin(a) * rx, hc.y - math.cos(a) * ry, z))
    b.add(name, grid(pt, nu, nv), mat_, region='head', subdiv=0)


beard_mesh('prop_beard_m', 0.006 * H, 0.01 * H, 0.02 * H, beard)    # crescendo
beard_mesh('prop_beard_f', 0.014 * H, 0.04 * H, 0.04 * H, beard)    # cheia (Calamidade)
mus = [rod([Vector((s_ * 0.004 * H, hc.y - 0.148 * H, hc.z - 0.058 * H)), Vector((s_ * 0.034 * H, hc.y - 0.138 * H, hc.z - 0.068 * H)), Vector((s_ * 0.05 * H, hc.y - 0.122 * H, hc.z - 0.1 * H))], [0.011 * H, 0.012 * H, 0.009 * H], 6) for s_ in (1, -1)]
b.add('prop_beard_f_mustache', merge(*mus), beard, region='head', subdiv=0)
b.add('prop_beard_m_mustache', merge(*[rod([Vector((s_ * 0.004 * H, hc.y - 0.148 * H, hc.z - 0.058 * H)), Vector((s_ * 0.034 * H, hc.y - 0.138 * H, hc.z - 0.068 * H))], [0.006 * H, 0.006 * H], 5) for s_ in (1, -1)]), beard, region='head', subdiv=0)
b.group('prop_beard_m')
b.group('prop_beard_f')

b.export(OUT)
