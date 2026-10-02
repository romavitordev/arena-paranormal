"""
SANTO BERÇO — public/arenas/santo_berco.glb
Referências (wiki "Santo Berço", O Segredo na Floresta): vilarejo medieval escondido no meio da floresta, criado pela
Relíquia de Morte. Casas de enxaimel com telhado vermelho, estradas de terra, o LABIRINTO INFINITO no centro coberto
de névoa (que gira em espiral na "Noite"), as estátuas dos CINCO GUARDIÕES em volta dele, a Torre do Porteiro perto
do portão de madeira "SANTO BERÇO", a Ferraria com a forja acesa, a Taverna, o Bosque da Provação com os troncos
cortados, árvores de cores estranhas, cristais (verde, vermelho, azul, preto) e Lodo Preto.
A luta acontece na PRAÇA de terra do vilarejo, em frente à entrada do Labirinto, com o Símbolo Espiral no chão.

Casas, árvores, sebes, troncos, pedras, carroça, barracas, lampiões e a fonte são PEÇAS PRONTAS dos kits gratuitos
do Kenney (CC0): Fantasy Town Kit e Nature Kit (tools/blender/kenney.py). Feitos aqui só os elementos únicos do lugar:
o Símbolo Espiral, a névoa do labirinto, os cristais, as estátuas dos Guardiões, o Lodo e a placa do portão.
Coordenadas do jogo: x direita, y cima, z na direção da câmera inicial. Praça andável com raio ~19,5 m.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU
from kenney import put, house, tower

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'santo_berco.glb'
random.seed(8)
start()

M = {
    'dirt': material('dirt', '#7a5a3a', 1),
    'grass': material('grass_lush', '#4a6a2a', 1),
    'stone': material('stone_block', '#8a8478', 0.95),
    'statue': material('statue_stone', '#9a968c', 0.95),
    'wood': material('wood_plank', '#6a4a30', 0.9),
    'forge': material('forge_fire', '#ff7a2a', 0.3, emission='#ff6a1a', strength=6),
    'symbol': material('spiral_symbol', '#ffffff', 0.9, alpha=0.99),  # fundo transparente: só o entalhe aparece
    'lodo': material('lodo_black', '#060508', 0.15),
    'mist': material('mist_spiral', '#d8d4e0', 0.9, alpha=0.32),
    'carve': material('sign_carve', '#2a1a10', 0.9),
}
CRYSTAL = {
    'verde': material('crystal_green', '#3aff8a', 0.2, emission='#2aff7a', strength=0.8),
    'vermelho': material('crystal_red', '#ff3a4a', 0.2, emission='#ff2a3a', strength=0.8),
    'azul': material('crystal_blue', '#3a8aff', 0.2, emission='#2a7aff', strength=0.8),
    'preto': material('crystal_black', '#14101a', 0.15, metal=0.4),
}
# folhas de cores estranhas (o Santo Berço muda a vegetação): tingem as árvores do Nature Kit
STRANGE = [(0.42, 0.24, 0.55), (0.78, 0.62, 0.22), (0.18, 0.48, 0.42), (0.66, 0.3, 0.42), (0.3, 0.45, 0.2)]
TREES = ['tree_oak', 'tree_fat', 'tree_default', 'tree_detailed', 'tree_plateau', 'tree_tall']

R_PLAZA = 20.5


def tree(pos, h=9.0, strange=True, prefix=''):
    name = random.choice(TREES)
    tint = {'leafsGreen': random.choice(STRANGE)} if strange else None
    return put('nature', name, pos, random.uniform(0, TAU), h / 1.25, prefix, tint=tint)


def crystals(name, pos, kind, size=1.0):
    x, y, z = pos
    for k in range(5):
        a = k / 5 * TAU + random.uniform(-0.3, 0.3)
        hh = size * random.uniform(0.7, 1.6)
        cyl(f'{name}_{k}', (x + math.sin(a) * 0.25 * size, y, z + math.cos(a) * 0.25 * size), 0.18 * size, hh, CRYSTAL[kind], seg=6, r_top=0.0, rot_y=a, rot_x=random.uniform(0.15, 0.5))


# ================================================================ chão
cyl('GROUND_grass', (0, -0.25, 0), 70, 0.2, M['grass'], seg=48)
cyl('FLOOR_plaza', (0, -0.06, 0), R_PLAZA + 1.2, 0.08, M['dirt'], seg=64)
for k, a in enumerate((0.0, math.pi, math.pi / 2, -math.pi / 2)):
    L = 30
    box(f'FLOOR_road{k}', (math.sin(a) * (R_PLAZA + L / 2 - 2), -0.05, math.cos(a) * (R_PLAZA + L / 2 - 2)), (5.5, 0.08, L), M['dirt'], rot_y=a)
# o Símbolo Espiral entalhado numa laje redonda no centro da praça
cyl('FLOOR_symbol_slab', (0, -0.04, 0), 3.3, 0.08, M['stone'], seg=40)
plane('DECAL_spiral', (0, 0.05, 0), (6.4, 6.4), M['symbol'], facing='up')

# ================================================================ LABIRINTO INFINITO (norte, -z): anéis de sebe (kit) + névoa
LAB = (0.0, -44.0)
HS = 5.0  # escala da sebe do kit (1 unidade -> 5 m de comprimento, 3 m de altura)
for ring, (rad, gaps) in enumerate(((9.0, (0.0,)), (14.0, (2.6,)), (19.0, (0.4, 3.6)))):
    n = int(rad * TAU / HS) + 1
    for k in range(n):
        a = (k + 0.5) / n * TAU
        if any(abs(((a - g + math.pi) % TAU) - math.pi) < 0.32 for g in gaps):
            continue  # passagens
        x, z = LAB[0] + math.sin(a) * rad, LAB[1] + math.cos(a) * rad
        # a peça fica na face +X da célula: girada para a parede ficar tangente ao anel
        put('town', 'hedge-large', (x, 0, z), a - math.pi / 2, HS)
for k in range(5):
    cyl(f'SPIN_mist{k}', (LAB[0], 3.5 + k * 1.3, LAB[1]), 21 - k * 3.2, 0.6, M['mist'], seg=28, r_top=19 - k * 3.2)
# as estátuas dos CINCO GUARDIÕES (doutores de manto e capuz, com um livro) em frente ao labirinto
for k in range(5):
    a = (k - 2) * 0.24  # arco na frente do labirinto, virado para a praça
    x, z = LAB[0] + math.sin(a) * 23.0, LAB[1] + math.cos(a) * 23.0
    box(f'ped{k}', (x, 0.6, z), (1.8, 1.2, 1.8), M['stone'])
    cyl(f'robe{k}', (x, 1.2, z), 0.75, 3.0, M['statue'], seg=12, r_top=0.32)
    sphere(f'head{k}', (x, 4.45, z), (0.36, 0.42, 0.38), M['statue'])
    cyl(f'hood{k}', (x, 4.1, z), 0.48, 0.85, M['statue'], seg=10, r_top=0.12)
    box(f'book{k}', (x - math.sin(a) * 0.55, 3.0, z - math.cos(a) * 0.55), (0.6, 0.5, 0.18), M['statue'], rot_y=a)

# ================================================================ casas do vilarejo (kit) em anel em volta da praça
houses = [
    # (ângulo, raio, células (frente, fundo), andares)
    (0.55, 28, (3, 2), 2), (0.98, 29, (2, 2), 1), (1.4, 28, (3, 2), 1),
    (2.1, 28, (2, 2), 2), (2.5, 29, (3, 1), 1),
    (3.75, 28, (3, 2), 1), (4.15, 29, (2, 2), 2),
    (4.95, 28, (2, 2), 1), (5.35, 29, (3, 2), 2), (5.78, 28, (3, 1), 1),
]
for k, (a, r, cells, fl) in enumerate(houses):
    # fachada (+z local) virada para o centro da praça; as do lado da câmera inicial ficam transparentes
    house(f'house{k}', (math.sin(a) * r, 0, math.cos(a) * r), a + math.pi, cells, fl, prefix='OCC_' if math.cos(a) > 0.2 else '')

# ---------------- FERRARIA (noroeste): casa de pedra com chaminé, forja acesa na frente e lâminas
FX, FZ = -18.0, -21.0
fa = math.atan2(-FX, -FZ)
house('smithy', (FX, 0, FZ), fa, (2, 2), 1, wood=False)
put('town', 'chimney', (FX - 2.5, 3.0, FZ - 1.0), fa, 3.0)
cyl('forge_hearth', (FX + 3.2, 0, FZ + 2.6), 0.9, 1.0, M['stone'], seg=10)
cyl('FLICKER_forgefire', (FX + 3.2, 1.0, FZ + 2.6), 0.6, 0.4, M['forge'], seg=10, r_top=0.15)
put('town', 'blade', (FX + 1.5, 0, FZ + 3.4), fa, 3.0)
col_cyl('forge', (FX + 3.2, 0, FZ + 2.6), 1.0, 1.0)

# ---------------- TAVERNA (nordeste): casa grande de dois andares com barraca do lado
TX, TZ = 18.5, -21.0
house('tavern', (TX, 0, TZ), math.atan2(-TX, -TZ), (3, 2), 2)
put('town', 'stall-red', (12.5, 0, -17.5), 0.8, 3.0)
put('town', 'stall-bench', (11.0, 0, -15.5), 0.8, 3.0)
put('town', 'stall-stool', (13.6, 0, -15.2), 0.2, 3.0)
col_cyl('stall', (12.5, 0, -17.5), 1.8, 3.6)

# ---------------- TORRE DO PORTEIRO (perto do portão, sul): torre de pedra de 4 andares com telhado em ponta
TWX, TWZ = 9.0, 32.0
tower('porteiro', (TWX, 0, TWZ), floors=4, door_face=-math.pi / 2)
col_box('tower', (TWX, 0, TWZ), (3.2, 12, 3.2))

# ---------------- PORTÃO "SANTO BERÇO" (sul) com cerca dos dois lados
GZ = 34.0
for sx in (-1, 1):
    cyl(f'gate_post{sx}', (sx * 3.2, 0, GZ), 0.35, 5.6, M['wood'], seg=10)
box('gate_beam', (0, 5.3, GZ), (7.4, 0.4, 0.4), M['wood'])
box('gate_sign', (0, 4.4, GZ - 0.25), (5.4, 1.1, 0.15), M['wood'])
text('gate_text', 'SANTO BERÇO', (0, 4.1, GZ - 0.36), 0.7, M['carve'], rot_y=math.pi, depth=0.03)
for side in (-1, 1):
    for k in range(9):
        put('town', 'fence', (side * (4.0 + k * 3.0), 0, GZ), math.pi / 2, 3.0)

# ---------------- BOSQUE DA PROVAÇÃO (sudoeste): troncos cortados, um de cada morador
STUMPS = ['stump_old', 'stump_oldTall', 'stump_round', 'stump_roundDetailed', 'stump_square', 'stump_squareDetailed']
for k in range(26):
    x, z = -25 + (k % 6) * 2.2 + random.uniform(-0.4, 0.4), 19 + (k // 6) * 2.2 + random.uniform(-0.4, 0.4)
    put('nature', random.choice(STUMPS), (x, 0, z), random.uniform(0, TAU), 3.0)

# ================================================================ obstáculos dentro da praça
# fonte redonda do kit com a água virando Lodo Preto
put('town', 'fountain-round', (-9.5, 0, 6.5), 0.0, 1.6, tint={'Water': (0.02, 0.02, 0.03)})
col_cyl('fountain', (-9.5, 0, 6.5), 1.7, 0.6)
# carroça e barraca de feira
put('town', 'cart-high', (10.5, 0, 7.0), 0.4, 3.0)
col_cyl('cart', (10.5, 0, 7.0), 2.0, 1.8)
put('town', 'stall-green', (8.5, 0, -11.0), -0.6, 3.0)
col_cyl('stall2', (8.5, 0, -11.0), 1.7, 3.6)
# cristais saindo do chão da praça, com pedras do kit
crystals('crys_plaza', (-8.5, 0, -9.5), 'verde', 1.3)
put('nature', 'rock_largeB', (-9.3, 0, -10.6), 0.5, 3.0)
col_cyl('crys_plaza', (-8.5, 0, -9.5), 1.2, 1.6)
# Lodo Preto escorrendo perto do labirinto
for k, (x, z, r) in enumerate(((-4.0, -18.5, 1.6), (5.5, -17.0, 1.1), (1.0, -21.5, 2.2))):
    cyl(f'FLOOR_lodo{k}', (x, -0.02, z), r, 0.06, M['lodo'], seg=18)
# cristais nas bordas
for k, (x, z, kind) in enumerate(((-21.5, -6, 'vermelho'), (22, 8, 'azul'), (-20, 12, 'preto'), (21, -9, 'verde'))):
    crystals(f'crys{k}', (x, 0, z), kind, 1.6)
    put('nature', random.choice(['rock_smallA', 'rock_smallC', 'rock_smallFlatA']), (x + 1.0, 0, z + 0.6), random.uniform(0, TAU), 3.0)

# lampiões do kit em volta da praça
for k in range(8):
    a = (k + 0.5) / 8 * TAU
    put('town', 'lantern', (math.sin(a) * (R_PLAZA + 0.8), 0, math.cos(a) * (R_PLAZA + 0.8)), a, 2.4)

# ================================================================ vegetação: árvores coloridas, arbustos, cogumelos, flores
# fora do caminho da câmera (ela anda até 23 m do centro)
for k, a in enumerate((1.75, 4.55, 5.05, 0.2, 6.05)):  # nenhuma na frente do labirinto (norte)
    tree((math.sin(a) * 31, 0, math.cos(a) * 31), random.uniform(9, 11))
for k in range(70):
    a = random.uniform(0, TAU)
    r = random.uniform(36, 60)
    x, z = math.sin(a) * r, math.cos(a) * r
    if z < -22 and abs(x) < 28:
        continue  # deixa o labirinto à vista
    tree((x, 0, z), random.uniform(10, 16), strange=random.random() < 0.6)
DECOR = ['plant_bushLarge', 'plant_bush', 'grass_large', 'mushroom_redGroup', 'mushroom_tanGroup', 'flower_purpleA', 'flower_yellowB', 'flower_redA']
for k in range(90):
    a = random.uniform(0, TAU)
    r = random.uniform(R_PLAZA + 1.5, 34)
    put('nature', random.choice(DECOR), (math.sin(a) * r, 0, math.cos(a) * r), random.uniform(0, TAU), random.uniform(3, 5))
# o moinho do vilarejo ao longe (marco na paisagem)
put('town', 'windmill', (-34, 6, 26), 0.6, 4.0)

finalize(OUT)
