"""
GAL SAL (personagem masculino) — public/models/injustica.glb
Referências: 'Referencias visuais/Personagens/Gal' (corpo inteiro / com armas / rosto).
- PONCHO preto de verdade: cai em PONTA na frente e atrás (até o meio da coxa) e cobre os braços até o
  cotovelo dos lados; decote em V dourado; barra com fita dourada e franja de dentes em zigue-zague.
- Cabelo preto liso e longo, repartido no meio, caindo NA FRENTE dos ombros até o peito; presilha dourada.
- Venda preta com marcas douradas (textura blindfold_gal), gargantilha, sorriso largo com lábios escuros.
- Pele coberta de TEXTO escrito (textura skin_injustica); calça preta; descalço.
As lâminas (Ereshkigal) e as correntes são adicionadas em código.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'injustica.glb'
b = Builder(width=0.98, bulk=0.96, height=1.02)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_injustica', '#ffffff', 0.8),  # textura com escrita
    'face': material('face_injustica', '#ffffff', 0.8),
    'torso': material('skin_injustica', '#ffffff', 0.8),
    'arm': material('skin_injustica', '#ffffff', 0.8),
    'legs': material('pants_inj', '#141416', 0.9),
    'feet': material('skin_injustica', '#ffffff', 0.8),
}
black = material('poncho_gal', '#17151b', 0.85)
lining = material('poncho_lining', '#0b0a0d', 0.9)
gold = material('gold_trim', '#c9a24a', 0.35, metal=0.8)
hairm = material('hair_inj', '#0b0b0d', 0.5)
choker = material('choker', '#0a0a0c', 0.5)
blind = material('blindfold_gal', '#ffffff', 0.6)  # textura: preto com marcas douradas

hc = b.body(M, [(-0.12, 0.165), (0.0, 0.165), (0.18, 0.158), (0.38, 0.205), (0.5, 0.215), (0.6, 0.115), (0.66, 0.068)],
            arm_r=(0.062, 0.05, 0.043), feet='bare')
b.add('choker', tube([(0, 0, 1.64 * H, 0.062 * H, 0.06 * H), (0, 0, 1.675 * H, 0.062 * H, 0.06 * H)], 14), choker, region='head', subdiv=0)

# ---------------------------------------------------------------- PONCHO
TOP = 1.62 * H
LEN_FRONT = 0.86 * H   # ponta da frente/de trás: até o meio da coxa
LEN_SIDE = 0.44 * H    # nos lados: até o cotovelo
SEG = 64
ROWS = 14
K_TX, K_TY = b.k_tx, b.k_ty  # o Builder engrossa o tronco; o poncho é desenhado já no tamanho final


def hem_len(a):
    # a = 0 na frente (-Y), π atrás: losango (pontas na frente e atrás, mais curto nos lados)
    d = min(abs(math.atan2(math.sin(a), math.cos(a))), abs(math.atan2(math.sin(a - math.pi), math.cos(a - math.pi))))
    f = 1 - d / (math.pi / 2)  # 1 na frente/atrás, 0 nos lados: barra em V (ponta)
    return LEN_SIDE + (LEN_FRONT - LEN_SIDE) * f ** 1.15


def radius(v):
    # sai rente ao pescoço, desce sobre os ombros e abre de leve até a barra
    s = min(1.0, v * 5.0) ** 0.5
    rx = 0.085 * H + (0.335 * H - 0.085 * H) * s
    ry = 0.075 * H + (0.19 * H - 0.075 * H) * s + v * 0.03 * H
    return rx / K_TX, ry / K_TY


def surf(a, v, out=1.0):
    rx, ry = radius(v)
    # sobe um pouco por cima da cabeça do ombro (o braço não atravessa o pano)
    lift = 0.075 * H * max(0.0, 1 - abs(v - 0.09) / 0.09) * abs(math.sin(a))
    z = TOP - v * hem_len(a) + lift
    return (math.sin(a) * rx * out, -math.cos(a) * ry * out, z)


def poncho_mesh(out=1.0, flip=False):
    verts, faces, uvs = [], [], []
    for i in range(ROWS + 1):
        v = i / ROWS
        for s in range(SEG + 1):
            a = (s / SEG) * TAU
            verts.append(surf(a, v, out))
            uvs.append((s / SEG, 1 - v))
    row = SEG + 1
    for i in range(ROWS):
        for s in range(SEG):
            p = i * row + s
            f = (p, p + 1, p + 1 + row, p + row)
            faces.append(tuple(reversed(f)) if flip else f)
    return verts, faces, uvs


def poncho_weights(p):
    # o centro segue o tronco; as abas dos lados (sobre os braços) acompanham um pouco os ombros
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.12 * H, 0.3 * H, abs(p.x)) * 0.65
    w_hip = smoothstep(hz + 0.15 * H, hz - 0.1 * H, p.z) * (1 - w_arm) * 0.6
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


b.add('poncho', poncho_mesh(), black, region='torso', weight_fn=poncho_weights)
b.add('poncho_lining', poncho_mesh(0.975, flip=True), lining, region='torso', weight_fn=poncho_weights)

# barra: fita dourada acompanhando a borda + dentes de franja apontando para baixo
N = 72
trim = []
for k in range(N):
    a0, a1 = k / N * TAU, (k + 1) / N * TAU
    p0, p1 = surf(a0, 0.985, 1.012), surf(a1, 0.985, 1.012)
    trim.append(cone(p0, p1, 0.011, 4))
    q0, q1 = surf(a0, 0.94, 1.012), surf(a1, 0.94, 1.012)
    trim.append(cone(q0, q1, 0.006, 3))
    # zigue-zague entre as duas linhas
    m = surf((a0 + a1) / 2, 0.94, 1.014)
    trim.append(cone(p0, m, 0.005, 3))
    trim.append(cone(m, p1, 0.005, 3))
    # franja: dente fino caindo da barra
    pm = surf((a0 + a1) / 2, 1.0, 1.012)
    trim.append(cone(pm, (pm[0] * 1.015, pm[1] * 1.015, pm[2] - 0.035 * H), 0.008, 4))
b.add('poncho_trim', merge(*trim), gold, region='torso', subdiv=0, weight_fn=poncho_weights)

# decote em V dourado (gola larga com dentes), por cima do poncho
for s2 in (1, -1):
    vt = []
    for k in range(7):
        t = k / 6
        a = s2 * (0.55 - 0.55 * t)  # sai do lado do pescoço e chega ao centro do peito
        v = 0.02 + 0.3 * t
        p = surf(a, v, 1.02)
        vt.append(p)
    for k in range(6):
        b.add(f'vneck{s2}_{k}', cone(vt[k], vt[k + 1], 0.014, 5), gold, region='torso', subdiv=0, weight_fn=poncho_weights)
        mid = [(vt[k][j] + vt[k + 1][j]) / 2 for j in range(3)]
        tip = (mid[0] + s2 * 0.022, mid[1] - 0.006, mid[2] - 0.035)
        b.add(f'vtooth{s2}_{k}', cone(mid, tip, 0.01, 3), gold, region='torso', subdiv=0, weight_fn=poncho_weights)

# cós da calça por baixo do poncho (não deixa a barriga à mostra pelos lados)
b.add('waist', tube([(0, 0, hz - 0.03 * H, 0.19 * H / K_TX, 0.14 * H / K_TY), (0, 0, hz + 0.16 * H, 0.185 * H / K_TX, 0.135 * H / K_TY)], 18), M['legs'], region='torso', subdiv=0)

# ---------------------------------------------------------------- CABELO
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.005, hc.z + 0.012), (0.148 * H, 0.158 * H, 0.17 * H), front=0.22, side=0.52, back=0.66), hairm, region='head')
# risca no meio: duas metades que descem em curva para os lados da testa
for s2 in (1, -1):
    part = [(s2 * 0.01, -0.12 * H, hc.z + 0.15 * H * 0.9, 0.03, 0.018), (s2 * 0.07 * H, -0.135 * H, hc.z + 0.1 * H, 0.04, 0.02),
            (s2 * 0.12 * H, -0.11 * H, hc.z + 0.03 * H, 0.04, 0.02)]
    b.add(f'hair_part{s2}', tube(part, 8), hairm, region='head')
# massa de trás, longa e lisa (até o meio das costas)
hr = [(hc.z + 0.07, 0.152 * H, 0.162 * H), (hc.z - 0.02, 0.158 * H, 0.168 * H), (hc.z - 0.15, 0.17 * H, 0.17 * H),
      (hc.z - 0.32, 0.2 * H, 0.165 * H), (hc.z - 0.48, 0.215 * H, 0.155 * H), (hc.z - 0.6, 0.2 * H, 0.14 * H)]
b.add('hair_back', open_tube(hr, gap=0.22, seg=26, cy=0.03), hairm, region='head')
# cortinas da frente: caem na frente dos ombros até o peito, por cima do poncho
for s2 in (1, -1):
    curtain = [(s2 * 0.118 * H, -0.085 * H, hc.z + 0.06, 0.03, 0.028), (s2 * 0.13 * H, -0.105 * H, hc.z - 0.06, 0.04, 0.028),
               (s2 * 0.15 * H, -0.14 * H, hc.z - 0.2, 0.048, 0.022), (s2 * 0.155 * H, -0.165 * H, hc.z - 0.34, 0.046, 0.02),
               (s2 * 0.15 * H, -0.175 * H, hc.z - 0.46, 0.036, 0.016), (s2 * 0.145 * H, -0.175 * H, hc.z - 0.54, 0.018, 0.01)]
    b.add(f'hair_front{s2}', tube(curtain, 10), hairm, region='head')
# presilha dourada no lado direito do rosto (como na arte)
b.add('hair_clip', merge(box((-0.125 * H, -0.095 * H, hc.z + 0.09), (0.012, 0.055, 0.014)), box((-0.127 * H, -0.093 * H, hc.z + 0.068), (0.012, 0.04, 0.01))), gold, region='head', subdiv=0)

# ---------------------------------------------------------------- VENDA
# faixa larga em volta da cabeça, por FORA do rosto, cobrindo os olhos (textura com as marcas douradas)
blindband = tube([(0, 0, hc.z - 0.035, 0.151 * H, 0.161 * H), (0, -0.002, hc.z + 0.005, 0.156 * H, 0.166 * H), (0, 0, hc.z + 0.05, 0.15 * H, 0.16 * H)], 32, cap_start=False, cap_end=False)
b.add('blindfold', blindband, blind, region='head', subdiv=0)
b.add('blind_knot', ellipsoid((0, 0.165 * H, hc.z + 0.01), (0.03, 0.02, 0.025), 8, 6), choker, region='head', subdiv=0)

b.export(OUT)
