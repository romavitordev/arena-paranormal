"""
AGHATA — public/models/aghata.glb (a arte de CORPO INTEIRO da pasta Aghata, "Vampira corpo inteiro")
Cabelo preto curto e bagunçado com a mecha VERMELHA, brinco de pena; JAQUETA DE COURO cinza-azulada CURTA (até o
cinto), de gola alta, com os bolsos do peito forrados de vermelho e as mangas puxadas até o meio do antebraço (o punho
vermelho da blusa aparece); blusa vermelha de gola alta; correntes no pescoço e o cordão com a argola prateada; braços
tatuados (textura arms_vampira); LUVAS VERMELHAS; cinto com a corrente dupla; a camisa xadrez CÁQUI amarrada na cintura,
caindo comprida do lado esquerdo; jeans azul-petróleo rasgado nos joelhos; COTURNOS vermelhos de cadarço com a sola
preta; livro preso na cintura. A faca é adicionada em código.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'aghata.glb'
b = Builder(width=0.9, bulk=0.92, height=0.9)  # 1,62 m
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_vampira', '#d6a68c', 0.8),
    'face': material('face_vampira', '#ffffff', 0.8),
    'torso': material('shirt_red', '#a01e24', 0.85),
    'arm': material('arms_vampira', '#ffffff', 0.8),
    'hand': material('glove_red', '#8e1a22', 0.6),
    'legs': material('jeans_teal', '#2c4654', 0.9),
    'feet': material('boot_red', '#8a2026', 0.65),
}
jacket = material('leather_jacket', '#24282e', 0.55)
jacket_dk = material('leather_jacket_dk', '#14171b', 0.6)
red = M['torso']
hairm = material('hair_vampira', '#101216', 0.6)
plaid = material('plaid', '#ffffff', 0.9)
feather = material('feather', '#cfc6b4', 0.9)
book = material('book', '#5a4a38', 0.8)

hc = b.body(M, [(-0.11, 0.155), (0.0, 0.155), (0.17, 0.145), (0.36, 0.19), (0.47, 0.2), (0.57, 0.11), (0.63, 0.065)],
            arm_r=(0.054, 0.045, 0.038), leg_r=(0.08, 0.062, 0.048), head_r=(0.135, 0.145, 0.158))

# JAQUETA de couro curta, aberta, até o cinto
silver = material('silver_vampira', '#b8b8c0', 0.3, metal=0.9)
jr = [(hz + 0.13 * H, 0.172 * H, 0.126 * H), (hz + 0.22 * H, 0.168 * H, 0.121 * H), (hz + 0.35 * H, 0.206 * H, 0.141 * H), (hz + 0.46 * H, 0.214 * H, 0.145 * H), (hz + 0.55 * H, 0.146 * H, 0.106 * H), (hz + 0.6 * H, 0.1 * H, 0.084 * H)]
b.add('jacket', open_tube(jr, gap=0.1, seg=24), jacket, region='torso')
b.add('jacket_hem', open_tube([(hz + 0.125 * H, 0.176 * H, 0.13 * H), (hz + 0.16 * H, 0.175 * H, 0.129 * H)], gap=0.1, seg=24), jacket_dk, region='torso', subdiv=0)
# gola alta da jaqueta, aberta na frente e abrindo para fora
b.add('jacket_collar', open_tube([(1.55 * H, 0.104 * H, 0.09 * H), (1.62 * H, 0.11 * H, 0.096 * H), (1.69 * H, 0.124 * H, 0.108 * H)], gap=0.17, seg=18), jacket, region='torso', subdiv=0)
# bolsos do peito com a lapela forrada de vermelho + botões de pressão
for sx in (1, -1):
    b.add(f'pocket{sx}', box((sx * 0.085 * H, -0.143 * H, hz + 0.38 * H), (0.07 * H, 0.012 * H, 0.08 * H), bevel=0.004), jacket_dk, region='torso', subdiv=0)
    b.add(f'pocket_flap{sx}', box((sx * 0.085 * H, -0.15 * H, hz + 0.425 * H), (0.074 * H, 0.012 * H, 0.025 * H), bevel=0.003), red, region='torso', subdiv=0)
    b.add(f'snap{sx}', ellipsoid((sx * 0.085 * H, -0.158 * H, hz + 0.42 * H), (0.008, 0.004, 0.008), 6, 4), silver, region='torso', subdiv=0)
# mangas da jaqueta puxadas até o meio do antebraço, com o punho vermelho da blusa por baixo
for side in ('L', 'R'):
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    b.add('jsleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.02)), e, 0.07, 0.066, n=4), 14), jacket, region='arm' + side)
    b.add('jsleeve_lo' + side, tube(limb_rings(e, e.lerp(h, 0.42), 0.066, 0.062, n=2), 14), jacket, region='e' + side, subdiv=0)
    b.add('jcuff' + side, tube(limb_rings(e.lerp(h, 0.36), e.lerp(h, 0.45), 0.068, 0.066, n=1), 14), jacket_dk, region='e' + side, subdiv=0)
    b.add('redcuff' + side, tube(limb_rings(e.lerp(h, 0.44), e.lerp(h, 0.5), 0.056, 0.054, n=1), 12), red, region='e' + side, subdiv=0)
    # punho da luva vermelha
    b.add('glovecuff' + side, tube(limb_rings(e.lerp(h, 0.84), e.lerp(h, 0.96), 0.05, 0.054, n=1), 12), M['hand'], region='e' + side, subdiv=0)
# blusa vermelha de GOLA ALTA
b.add('turtleneck', tube([(0, 0, 1.55 * H, 0.078 * H, 0.074 * H), (0, 0, 1.6 * H, 0.072 * H, 0.068 * H), (0, 0, 1.655 * H, 0.068 * H, 0.064 * H)], 16), red, region='torso')
# correntes no pescoço (duas voltas) + o cordão com a argola
chains = []
for k, (z0, dz) in enumerate(((1.58 * H, 0.05 * H), (1.56 * H, 0.1 * H))):
    pts = []
    for i in range(15):
        a = (i / 14 - 0.5) * 2.0
        pts.append((math.sin(a) * 0.082 * H, -math.cos(a) * 0.078 * H - 0.004, z0 - dz * math.cos(a) ** 6, 0.005, 0.005))
    chains.append(tube(pts, 5))
b.add('neck_chains', merge(*chains), silver, region='torso', subdiv=0)
# camisa xadrez CÁQUI amarrada na cintura: faixa na cintura, as mangas com o nó na frente, a aba das costas e a aba
# comprida caindo do lado esquerdo até o joelho
b.add('tied_shirt', tube([(0, 0, hz + 0.08 * H, 0.168 * H, 0.124 * H), (0, 0, hz + 0.02 * H, 0.18 * H, 0.134 * H)], 20, cap_start=False, cap_end=False), plaid, region='torso', subdiv=0)
b.add('shirt_back', open_tube([(hz + 0.04 * H, 0.18 * H, 0.134 * H), (hz - 0.12 * H, 0.2 * H, 0.15 * H), (hz - 0.26 * H, 0.212 * H, 0.16 * H)], gap=0.3, seg=16), plaid, region='skirt')
b.add('shirt_flap', tube([(0.11 * H, -0.07 * H, hz + 0.02 * H, 0.08 * H, 0.03 * H), (0.13 * H, -0.08 * H, hz - 0.2 * H, 0.1 * H, 0.025 * H), (0.135 * H, -0.075 * H, hz - 0.42 * H, 0.095 * H, 0.02 * H)], 12), plaid, region='lL')
b.add('shirt_knot', ellipsoid((-0.02, -0.14 * H, hz + 0.05 * H), (0.045, 0.03, 0.036), 8, 6), plaid, region='torso', subdiv=0)
for sx in (1, -1):
    b.add(f'sleeve_knot{sx}', tube([(sx * 0.02 - 0.02, -0.15 * H, hz + 0.04 * H, 0.024, 0.018), (sx * 0.05 - 0.02, -0.16 * H, hz - 0.12 * H, 0.022, 0.017)], 8), plaid, region='skirt', subdiv=0)
# livro preso na cintura (lado direito)
b.add('book', box((-0.17 * H, 0.0, hz - 0.02 * H), (0.04, 0.12, 0.16)), book, region='torso', subdiv=0)

# cabelo curto bagunçado
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.008, hc.z + 0.01), (0.148 * H, 0.158 * H, 0.17 * H), front=0.3, side=0.48, back=0.66), hairm, region='head')
import random
random.seed(3)
for i in range(13):
    a = -1.25 + (i / 12) * 2.5
    base = Vector((hc.x + math.sin(a) * 0.12 * H, hc.y - math.cos(a) * 0.12 * H, hc.z + 0.1 * H))
    drop = 0.05 if abs(a) < 0.7 else 0.11  # franja da frente curta para não cobrir os olhos
    tip = base + Vector((math.sin(a) * 0.04, -math.cos(a) * 0.035, -drop - random.random() * 0.03))
    b.add(f'lock{i}', cone(tuple(base), tuple(tip), 0.04, 6), hairm, region='head', subdiv=0)
for i in range(8):
    a = math.pi * 0.6 + (i / 7) * math.pi * 0.8
    base = Vector((hc.x + math.sin(a) * 0.1, hc.y - math.cos(a) * 0.1, hc.z + 0.05))
    tip = base + Vector((math.sin(a) * 0.05, -math.cos(a) * 0.06, -0.12))
    b.add(f'backlock{i}', cone(tuple(base), tuple(tip), 0.045, 6), hairm, region='head', subdiv=0)
# colar: cordão preto com pingente de argola prateada (presente nas duas artes)
b.add('necklace', tube([(-0.06 * H, -0.06 * H, 1.6 * H, 0.004, 0.004), (0, -0.135 * H, 1.47 * H, 0.004, 0.004), (0.06 * H, -0.06 * H, 1.6 * H, 0.004, 0.004)], 5), material('cord_black', '#101012', 0.6), region='torso', subdiv=0)
b.add('pendant', tube([(0, -0.14 * H, 1.455 * H, 0.016, 0.016), (0, -0.142 * H, 1.462 * H, 0.016, 0.016)], 10, cap_start=False, cap_end=False), silver, region='torso', subdiv=0)
# cinto com fivela e corrente pendurada
b.add('belt_v', tube([(0, 0, hz + 0.1 * H, 0.168 * H, 0.122 * H), (0, 0, hz + 0.135 * H, 0.168 * H, 0.122 * H)], 20), material('belt_black', '#141416', 0.6), region='torso', subdiv=0)
b.add('buckle_v', box((0, -0.124 * H, hz + 0.118 * H), (0.05, 0.01, 0.035)), silver, region='torso', subdiv=0)
chain = [tube([(0.06 + k * 0.02, -0.12 * H, hz + 0.09 * H - math.sin(k / 6 * math.pi) * 0.06, 0.007, 0.007), (0.07 + k * 0.02, -0.12 * H, hz + 0.09 * H - math.sin((k + 1) / 6 * math.pi) * 0.06, 0.007, 0.007)], 5) for k in range(6)]
b.add('belt_chain', merge(*chain), silver, region='torso', subdiv=0)
# rasgos nos joelhos do jeans (pele aparecendo)
for side in ('L', 'R'):
    k = sk['k' + side]
    b.add('rip' + side, ellipsoid((k.x, k.y - 0.062, k.z + 0.01), (0.038, 0.01, 0.026), 8, 6), M['skin'], region='l' + side, subdiv=0)
# mecha vermelha no cabelo (lado direito da franja)
b.add('red_streak', merge(*[cone((-0.05 * H - k * 0.012, -0.12 * H, hc.z + 0.1 * H), (-0.07 * H - k * 0.015, -0.135 * H, hc.z + 0.02 * H), 0.024, 6) for k in range(2)]), material('hair_red', '#a8182a', 0.6), region='head', subdiv=0)

# COTURNOS vermelhos de cadarço, cano até o meio da canela, com a sola preta
laces = material('laces', '#d8c49a', 0.8)
sole = material('sole_black', '#141416', 0.8)
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.5), f + Vector((0, 0, 0.05)), 0.058, 0.058, n=3), 12), M['feet'], region='k' + side)
    b.add('bootcuff' + side, tube(limb_rings(k.lerp(f, 0.47), k.lerp(f, 0.55), 0.062, 0.061, n=1), 12), jacket_dk, region='k' + side, subdiv=0)
    xs = []
    for i in range(5):
        p = k.lerp(f, 0.58 + i * 0.075)
        xs.append(box((p.x, p.y - 0.056, p.z), (0.05, 0.006, 0.008)))
    b.add('laces' + side, merge(*xs), laces, region='k' + side, subdiv=0)
    b.add('bootsole' + side, sole_part((f.x, f.y - 0.04 * H, f.z - 0.012 * H), (0.1 * H, 0.23 * H, 0.03 * H), bevel=0.006), sole, region='k' + side, subdiv=0)

# brinco de pena (orelha esquerda)
b.add('feather', cone((0.138 * H, 0.0, hc.z - 0.05), (0.14 * H, 0.0, hc.z - 0.17), 0.016, 5), feather, region='head', subdiv=0)

b.export(OUT)
