"""
VAMPIRA — public/models/vampira.glb (visual da PRIMEIRA referência)
Cabelo preto curto e bagunçado, brinco de pena, colete cinza-azulado sem mangas com capuz sobre
camisa vermelha, lenço vermelho, braços tatuados (textura arms_vampira), camisa xadrez amarrada na
cintura, calça escura, tênis bordô, livro preso na cintura. A faca é adicionada em código.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'vampira.glb'
b = Builder(width=0.9, bulk=0.92, height=0.97)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_vampira', '#d6a68c', 0.8),
    'face': material('face_vampira', '#ffffff', 0.8),
    'torso': material('shirt_red', '#a01e24', 0.85),
    'arm': material('arms_vampira', '#ffffff', 0.8),
    'legs': material('jeans_dark', '#2e3440', 0.9),
    'feet': material('sneakers_maroon', '#5a2228', 0.7),
}
vest = material('vest_teal', '#3a4448', 0.85)
red = M['torso']
hairm = material('hair_vampira', '#101216', 0.6)
plaid = material('plaid', '#ffffff', 0.9)
feather = material('feather', '#cfc6b4', 0.9)
book = material('book', '#5a4a38', 0.8)

hc = b.body(M, [(-0.11, 0.155), (0.0, 0.155), (0.17, 0.145), (0.36, 0.19), (0.47, 0.2), (0.57, 0.11), (0.63, 0.065)],
            arm_r=(0.062, 0.05, 0.042), leg_r=(0.082, 0.064, 0.05), head_r=(0.135, 0.145, 0.158))

# colete sem mangas aberto na frente, com capuz
vr = [(hz - 0.02 * H, 0.168 * H, 0.118 * H), (hz + 0.16 * H, 0.158 * H, 0.112 * H), (hz + 0.34 * H, 0.2 * H, 0.135 * H), (hz + 0.46 * H, 0.207 * H, 0.138 * H), (hz + 0.55 * H, 0.14 * H, 0.1 * H)]
b.add('vest', open_tube(vr, gap=0.07, seg=22), vest, region='torso')
hood = ellipsoid((0, 0.1 * H, 1.58 * H), (0.17 * H, 0.11 * H, 0.13 * H), 16, 10, theta_max=math.pi * 0.62)
b.add('hood', xform(hood, lambda p: Vector((p.x, p.y + max(0, (1.63 * H - p.z)) * 0.3, p.z))), vest, region='torso')
# lenço vermelho no pescoço
b.add('scarf', tube([(0, 0, 1.56 * H, 0.09 * H, 0.08 * H), (0, -0.005, 1.6 * H, 0.095 * H, 0.085 * H), (0, 0, 1.64 * H, 0.08 * H, 0.075 * H)], 16), red, region='torso')
b.add('scarf_tail', tube([(0.03, -0.09 * H, 1.55 * H, 0.03, 0.012), (0.05, -0.12 * H, 1.42 * H, 0.025, 0.01)], 8), red, region='torso', subdiv=0)
# camisa xadrez amarrada na cintura (com o nó na frente)
b.add('tied_shirt', tube([(0, 0, hz + 0.08 * H, 0.165 * H, 0.12 * H), (0, 0, hz - 0.05 * H, 0.19 * H, 0.14 * H), (0, 0, hz - 0.2 * H, 0.215 * H, 0.16 * H)], 20, cap_start=False, cap_end=False), plaid, region='skirt')
b.add('shirt_knot', ellipsoid((0.02, -0.14 * H, hz + 0.04 * H), (0.05, 0.03, 0.04), 8, 6), plaid, region='torso', subdiv=0)
for s in (1, -1):
    b.add(f'sleeve_knot{s}', tube([(s * 0.03, -0.15 * H, hz + 0.03 * H, 0.025, 0.02), (s * 0.06, -0.16 * H, hz - 0.16 * H, 0.022, 0.018)], 8), plaid, region='skirt', subdiv=0)
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
# brinco de pena (orelha esquerda)
b.add('feather', cone((0.138 * H, 0.0, hc.z - 0.05), (0.14 * H, 0.0, hc.z - 0.17), 0.016, 5), feather, region='head', subdiv=0)

b.export(OUT)
