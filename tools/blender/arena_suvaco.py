"""
BAR SUVACO SECO — public/arenas/suvaco.glb
Interior (referências 'interior' e 'interior 2' + planta vista de cima): paredes de azulejo branco
encardido e tijolo aparente, balcão de madeira escura com prateleiras de garrafas coloridas, alvo
de dardos, geladeira amarela, engradados vermelho/azul/amarelo, cadeiras de plástico empilhadas,
bebedouro, lixeira, quadro-negro com placar, pôsteres ("Choro dos Anjos" e a chama), sinuca,
mesas, lâmpadas fluorescentes. A porta larga dá para a CALÇADA da esquina (referência 'por fora'):
piso xadrez, mesas e cadeiras de plástico, placa de madeira "SUVACO SECO", postes, rua.
Coordenadas do jogo: salão x ∈ [-9, 9], z ∈ [-6, 6], altura 3,6; porta de 4,6 m; calçada z ∈ [6.25, 14.5],
rua z ∈ [14.5, 24.5], calçada da frente até z 27, beco à direita (x 17–20.5) e prédios em volta.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'suvaco.glb'
random.seed(5)
start()

M = {
    'tile': material('tile_white', '#dcdad2', 0.35),
    'brick': material('brick_red', '#8c4030', 0.95),
    'floor': material('concrete_floor', '#4a4642', 0.9),
    'ceiling': material('ceiling', '#3a3836', 1),
    'wood': material('wood_dark', '#3a2618', 0.7),
    'checker': material('checker_floor', '#888', 0.6),
    'sidewalk': material('sidewalk', '#6a6862', 0.9),
    'asphalt': material('asphalt', '#2a2a2c', 0.95),
    'felt': material('felt_green', '#1e6a3a', 1),
    'fluor': material('fluorescent', '#f4f6ee', 0.3, emission='#f8faf0', strength=4),
    'lamp': material('street_lamp', '#ffd890', 0.3, emission='#ffc070', strength=5),
    'metal': material('metal_gray', '#6a6c70', 0.5, metal=0.6),
    'fridge': material('fridge_yellow', '#d8a624', 0.5),
    'glass': material('fridge_glass', '#a8c8d0', 0.1, emission='#d8f0ff', strength=0.6),
    'red': material('plastic_red', '#c02a24', 0.6),
    'yellow': material('plastic_yellow', '#d8b04a', 0.6),
    'beige': material('plastic_beige', '#d8c69a', 0.6),
    'crate_r': material('crate_red', '#b82a24', 0.7),
    'crate_b': material('crate_blue', '#2a4ab0', 0.7),
    'crate_y': material('crate_yellow', '#d8a624', 0.7),
    'cooler': material('cooler_blue', '#4a8ad8', 0.1, emission='#2a5aa0', strength=0.4),
    'white': material('plastic_white', '#e8e6de', 0.6),
    'plant': material('plant_green', '#2a6a2a', 1),
    'awning': material('awning', '#3a5a4a', 0.8),
    'window_lit': material('window_lit_bar', '#ffd08a', 0.4, emission='#ffb860', strength=2),
    'window_dark': material('window_dark_bar', '#14181c', 0.2),
    'ac': material('ac_unit', '#b8b8b2', 0.6),
}
bottle_mats = [material(f'bottle{i}', c, 0.15, emission=c, strength=0.35) for i, c in enumerate(['#e8302a', '#8a3ad8', '#3ad86a', '#e8a02a', '#2a8ae8', '#f0e0c0', '#a02040'])]

W0, W1, D0, D1, HH = -9.0, 9.0, -6.0, 6.0, 3.6
T = 0.25  # espessura das paredes

# ---------------- piso, teto, paredes (paredes e teto ficam transparentes quando tampam a luta)
box('FLOOR_bar', (0, -0.05, 0), (W1 - W0, 0.1, D1 - D0), M['floor'])
box('OCC_ceiling', (0, HH + 0.05, 0), (W1 - W0 + 0.5, 0.1, D1 - D0 + 0.5), M['ceiling'])
box('OCC_wall_back', (0, HH / 2, D0 - T / 2), (W1 - W0 + 0.5, HH, T), M['tile'])
box('OCC_wall_left', (W0 - T / 2, HH / 2, 0), (T, HH, D1 - D0), M['brick'])
# parede direita: metade azulejo, metade tijolo (como na referência)
box('OCC_wall_right_tile', (W1 + T / 2, HH / 2, -3), (T, HH, 6), M['tile'])
box('OCC_wall_right_brick', (W1 + T / 2, HH / 2, 3), (T, HH, 6), M['brick'])
# parede da frente com porta larga (4 m) para a calçada
DOOR = 2.3  # meia largura da porta (porta de 4,6 m)
for s, x0, x1 in ((-1, W0 - 0.25, -DOOR), (1, DOOR, W1 + 0.25)):
    box(f'OCC_wall_front{s}', ((x0 + x1) / 2, HH / 2, D1 + T / 2), (x1 - x0, HH, T), M['brick'])
box('OCC_door_lintel', (0, HH - 0.3, D1 + T / 2), (DOOR * 2, 0.6, T), M['brick'])
# rodapé escuro e coluna de tijolo
box('baseboard', (0, 0.1, D0 + 0.02), (W1 - W0, 0.2, 0.05), M['wood'])
box('OCC_pillar', (2.5, HH / 2, D0 + 0.3), (0.6, HH, 0.6), M['brick'])
# lâmpadas fluorescentes no teto
for k, (x, z) in enumerate([(-5, -2), (0, -2), (5, -2), (-4, 2.5), (4, 2.5)]):
    box(f'FLICKER_tube{k}', (x, HH - 0.08, z), (1.6, 0.08, 0.16), M['fluor'])
    box(f'tubebase{k}', (x, HH - 0.02, z), (1.75, 0.05, 0.25), M['metal'])

# ---------------- balcão e prateleiras de garrafas (parede do fundo)
box('counter', (-1.5, 0.55, D0 + 1.3), (9.0, 1.1, 0.8), M['wood'])
box('counter_top', (-1.5, 1.13, D0 + 1.3), (9.3, 0.07, 1.0), M['wood'])
col_box('counter', (-1.5, 0.6, D0 + 1.3), (9.3, 1.2, 1.0))
for row, y in enumerate((1.5, 2.15, 2.8)):
    box(f'shelf{row}', (-2.0, y, D0 + 0.18), (7.5, 0.06, 0.32), M['wood'])
    for k in range(17):
        x = -5.5 + k * 0.43 + random.uniform(-0.05, 0.05)
        h = random.uniform(0.26, 0.4)
        m = random.choice(bottle_mats)
        cyl(f'bottle{row}_{k}', (x, y + 0.03, D0 + 0.18), 0.045, h * 0.7, m, seg=8)
        cyl(f'bneck{row}_{k}', (x, y + 0.03 + h * 0.7, D0 + 0.18), 0.018, h * 0.3, m, seg=6)
# banquetas no balcão
for k in range(5):
    x = -5 + k * 1.6
    cyl(f'stool{k}', (x, 0, D0 + 2.2), 0.04, 0.72, M['metal'], seg=6)
    cyl(f'stooltop{k}', (x, 0.72, D0 + 2.2), 0.2, 0.06, M['red'], seg=12)

# ---------------- sinuca
PX, PZ = 4.6, 1.4
box('pool_body', (PX, 0.65, PZ), (2.7, 0.22, 1.5), M['wood'])
box('pool_felt', (PX, 0.77, PZ), (2.4, 0.02, 1.2), M['felt'])
for sx in (-1, 1):
    for sz in (-1, 1):
        box(f'pool_leg{sx}{sz}', (PX + sx * 1.15, 0.28, PZ + sz * 0.6), (0.14, 0.56, 0.14), M['wood'])
for k in range(10):
    sphere(f'ball{k}', (PX - 0.6 + (k % 4) * 0.12, 0.81, PZ - 0.2 + (k // 4) * 0.12), (0.04, 0.04, 0.04), random.choice(bottle_mats))
col_box('pool', (PX, 0.6, PZ), (2.8, 1.0, 1.6))

# ---------------- mesas e cadeiras de plástico
for k, (x, z) in enumerate([(-5.5, 2.5), (-3.4, -0.4), (0.5, -1.2)]):  # nada na frente da porta
    table_square(f'table{k}', (x, 0, z), M['red'] if k % 2 else M['yellow'], M['metal'])
    col_cyl(f'table{k}', (x, 0, z), 0.5, 0.8)
    for j, a in enumerate((0, math.pi / 2, math.pi)):
        cx, cz = x + math.sin(a) * 0.75, z + math.cos(a) * 0.75
        plastic_chair(f'chair{k}_{j}', (cx, 0, cz), M['red'] if (k + j) % 2 else M['yellow'], rot_y=a + math.pi)

# ---------------- canto: engradados, cadeiras empilhadas, bebedouro, lixeira, geladeira
for c in range(3):
    for r in range(5):
        m = [M['crate_r'], M['crate_b'], M['crate_y']][(c + r) % 3]
        box(f'crate{c}_{r}', (W0 + 0.5 + c * 0.55, 0.17 + r * 0.33, D0 + 0.6), (0.5, 0.32, 0.4), m)
col_box('crates', (W0 + 1.05, 0.8, D0 + 0.6), (1.7, 1.6, 0.6))
for k in range(9):
    plastic_chair(f'stack{k}', (W0 + 2.8, k * 0.09, D0 + 0.55), M['beige'], rot_y=math.pi)
col_box('stack', (W0 + 2.8, 0.8, D0 + 0.55), (0.6, 1.6, 0.6))
box('cooler_base', (W0 + 3.8, 0.5, D0 + 0.4), (0.38, 1.0, 0.36), M['white'])
cyl('cooler_jug', (W0 + 3.8, 1.0, D0 + 0.4), 0.15, 0.45, M['cooler'], seg=12)
cyl('trash', (W0 + 4.4, 0, D0 + 0.4), 0.2, 0.62, M['metal'], seg=12)
box('fridge', (W1 - 0.5, 1.0, D0 + 0.55), (0.9, 2.0, 0.8), M['fridge'])
box('fridge_glass', (W1 - 0.5, 1.05, D0 + 0.96), (0.7, 1.6, 0.03), M['glass'])
col_box('fridge', (W1 - 0.5, 1.0, D0 + 0.55), (0.95, 2.0, 0.85))

# ---------------- decoração das paredes (planos com a imagem inteira)
plane('DECAL_dartboard', (W1 - 0.02, 1.7, -3.5), (0.55, 0.55), material('dartboard', '#ffffff', 0.7), rot_y=-math.pi / 2)
plane('DECAL_chalk', (W1 - 0.02, 1.7, 2.6), (1.9, 1.2), material('chalkboard', '#ffffff', 0.9), rot_y=-math.pi / 2)
box('chalk_frame', (W1 - 0.01, 1.7, 2.6), (0.04, 1.3, 2.0), M['wood'])
plane('DECAL_poster_choro', (W0 + 0.02, 2.0, -2.0), (1.4, 1.0), material('poster_choro', '#ffffff', 0.8), rot_y=math.pi / 2)
plane('DECAL_poster_flame', (W0 + 0.02, 1.9, 1.0), (0.6, 0.85), material('poster_flame', '#ffffff', 0.8), rot_y=math.pi / 2)

# ---------------- RUA DA ESQUINA (lado de fora da porta) ----------------
# Área andável: calçada do bar (z 6.25–14.5), rua (z 14.5–24.5), calçada da frente (z 24.5–27) e um beco
# à direita (x 17–20.5, até z -5). Prédios vizinhos dos dois lados do bar e do outro lado da rua.
M.update({
    'bark': material('bark_street', '#3a2a1e', 1),
    'canopy': material('canopy_street', '#2c4a26', 1),
    'canopy2': material('canopy_street2', '#3a5a2a', 1),
    'stripe': material('road_stripe', '#d8d4c0', 0.8),
    'stripe_y': material('road_stripe_yellow', '#d8b040', 0.8),
    'plaster': material('plaster_wall', '#7a6e62', 0.95),
    'plaster2': material('plaster_wall2', '#5e6670', 0.95),
    'plaster3': material('plaster_wall3', '#8a7a5a', 0.95),
    'shutter': material('shutter_metal', '#4a4c50', 0.6, metal=0.4),
    'car_red': material('car_red', '#8a1e1a', 0.35, metal=0.3),
    'car_blue': material('car_blue', '#1e3a6a', 0.35, metal=0.3),
    'tire': material('tire', '#141414', 0.9),
    'car_glass': material('car_glass', '#1a2430', 0.1),
    'headlight': material('headlight', '#fff6d0', 0.2, emission='#fff0c0', strength=2),
    'neon_green': material('neon_green', '#4aff7a', 0.3, emission='#3aff6a', strength=5),
    'neon_pink': material('neon_pink', '#ff4ab0', 0.3, emission='#ff3aa0', strength=5),
    'neon_blue': material('neon_blue', '#4ac8ff', 0.3, emission='#3ab8ff', strength=5),
    'trashbag': material('trash_bag', '#141416', 0.4),
    'dumpster': material('dumpster', '#2a5a3a', 0.7),
    'hydrant': material('hydrant', '#c02a24', 0.5),
    'bus_glass': material('bus_glass', '#8ab0c0', 0.1, emission='#3a5a6a', strength=0.3),
})


def tree_round(name, pos, h, r=0.18):
    """Árvore de rua com copa arredondada (junta em OCC_ para ficar transparente se tampar a luta)."""
    x, y, z = pos
    before = set(o.name for o in bpy.context.scene.objects)
    cyl(f'{name}_trunk', (x, y, z), r, h * 0.55, M['bark'], seg=8, r_top=r * 0.7)
    for k in range(4):
        a = k / 4 * TAU + random.random()
        rr = h * random.uniform(0.2, 0.28)
        sphere(f'{name}_c{k}', (x + math.sin(a) * h * 0.12, y + h * random.uniform(0.62, 0.8), z + math.cos(a) * h * 0.12), (rr, rr * 0.85, rr), random.choice([M['canopy'], M['canopy2']]), seg=10, rings=7)
    box(f'{name}_pit', (x, 0.02, z), (1.1, 0.04, 1.1), M['floor'])
    new = [o for o in bpy.context.scene.objects if o.name not in before]
    rebase(join_objs(new, f'OCC_{name}'))
    col_cyl(name, (x, y, z), r + 0.2, h * 0.5)


def building(name, x0, x1, z_front, depth, h, wall, facing=1, shop=None, sign=None, sign_mat=None):
    """Prédio de esquina. facing=1: fachada virada para +z; -1: para -z."""
    cx = (x0 + x1) / 2
    w = x1 - x0
    cz = z_front - facing * depth / 2
    box(f'OCC_{name}', (cx, h / 2, cz), (w, h, depth), wall)
    fz = z_front + facing * 0.03
    # janelas dos andares de cima
    for wy in range(4, int(h) - 1, 3):
        n = max(1, int(w // 3))
        for k in range(n):
            wx = x0 + (k + 0.5) * w / n
            lit = random.random() < 0.4
            box(f'{name}_w{wy}_{k}', (wx, wy, fz), (1.1, 1.3, 0.05), M['window_lit'] if lit else M['window_dark'])
    # térreo: porta de aço de loja fechada ou vitrine acesa
    if shop == 'shutter':
        box(f'{name}_shutter', (cx, 1.4, fz), (min(w - 1.0, 4.5), 2.6, 0.06), M['shutter'])
        for k in range(8):
            box(f'{name}_sl{k}', (cx, 0.3 + k * 0.32, fz + facing * 0.02), (min(w - 1.0, 4.5), 0.03, 0.02), M['metal'])
    elif shop == 'lit':
        box(f'{name}_shopwin', (cx, 1.3, fz), (min(w - 1.0, 5.0), 2.0, 0.05), M['window_lit'])
    if sign:
        box(f'{name}_signbox', (cx, 3.15, fz + facing * 0.12), (len(sign) * 0.42 + 0.6, 0.7, 0.18), M['wood'])
        t = text(f'{name}_sign', sign, (cx, 2.95, fz + facing * 0.23), 0.55, sign_mat, rot_y=0 if facing == 1 else math.pi)


# chão: calçada do bar em xadrez, resto em cimento; rua de asfalto; calçada da frente
box('FLOOR_terrace', (0, -0.04, 10.35), (18.5, 0.08, 8.2), M['checker'])
for s in (-1, 1):
    box(f'FLOOR_sidewalk{s}', (s * 24.6, -0.045, 10.35), (30.7, 0.08, 8.2), M['sidewalk'])
box('GROUND_street', (0, -0.08, 19.5), (90, 0.08, 10), M['asphalt'])
box('FLOOR_sidewalk_far', (0, -0.045, 25.75), (90, 0.08, 2.5), M['sidewalk'])
box('curb', (0, 0.06, 14.5), (80, 0.14, 0.3), M['sidewalk'])
box('curb_far', (0, 0.06, 24.5), (80, 0.14, 0.3), M['sidewalk'])
# faixa central tracejada e faixa de pedestres
for k in range(-11, 12):
    box(f'lane{k}', (k * 3.6, 0.0, 19.5), (1.8, 0.02, 0.18), M['stripe_y'])
for k in range(8):
    box(f'zebra{k}', (-14 + (k - 3.5) * 0.9, 0.0, 19.5), (0.5, 0.02, 9.4), M['stripe'])
box('manhole', (5, 0.0, 21.5), (0.9, 0.02, 0.9), M['metal'])

# fachada do bar: placa iluminada, segundo andar, ar-condicionado, toldo
box('OCC_facade_upper', (0, HH + 1.8, D1 + T / 2), (W1 - W0 + 0.5, 3.6, T), M['brick'])
plane('DECAL_sign', (0, 2.95, D1 + T + 0.03), (3.4, 1.2), material('sign_suvaco', '#ffffff', 0.7))
box('sign_lamp', (0, 3.75, D1 + 0.6), (0.4, 0.1, 0.25), M['lamp'])
for k, x in enumerate((-6, -3, 3, 6)):
    lit = k in (1, 3)
    box(f'upwin{k}', (x, HH + 2.0, D1 + T + 0.02), (1.1, 1.3, 0.05), M['window_lit'] if lit else M['window_dark'])
    if k % 2 == 0:
        box(f'ac{k}', (x + 0.9, HH + 1.1, D1 + T + 0.25), (0.8, 0.5, 0.45), M['ac'])
box('awning', (-6.5, 2.9, D1 + 1.2), (5.5, 0.08, 2.4), M['awning'], rot_x=math.radians(-12))

# prédios vizinhos do bar (mesma calçada) e beco à direita (x 17–20.5)
FZ = D1 + T
building('nb_l1', -18.0, W0 - T, FZ, 12.5, 8.0, M['plaster'], shop='lit', sign='LANCHES', sign_mat=M['neon_pink'])
building('nb_l2', -30.0, -18.0, FZ, 12.5, 11.0, M['plaster2'], shop='shutter')
building('nb_r1', W1 + T, 17.0, FZ, 12.5, 7.0, M['plaster3'], shop='shutter')
building('nb_r2', 20.5, 32.0, FZ, 12.5, 10.0, M['plaster'], shop='lit', sign='FARMÁCIA', sign_mat=M['neon_green'])
# beco: paredes laterais já são os prédios; fundo fechado, caçamba e sacos de lixo
box('OCC_alley_back', (18.75, 3.0, -5.6), (3.6, 6.0, 0.3), M['brick'])
box('FLOOR_alley', (18.75, -0.045, 0.3), (3.5, 0.08, 12.0), M['floor'])
box('dumpster', (19.6, 0.65, -3.6), (1.5, 1.3, 1.0), M['dumpster'])
col_box('dumpster', (19.6, 0.65, -3.6), (1.6, 1.3, 1.1))
for k in range(5):
    sphere(f'bag{k}', (17.8 + random.random() * 0.6, 0.28, -4.5 + k * 0.45), (0.32, 0.3, 0.3), M['trashbag'])
col_box('bags', (18.1, 0.3, -3.6), (0.9, 0.6, 2.4))
box('alley_lamp', (17.15, 3.4, -1.0), (0.2, 0.25, 0.4), M['lamp'])

# mesas de plástico na calçada do bar
for k, (x, z, m) in enumerate([(-7, 9.5, M['red']), (6.5, 9.0, M['yellow']), (-2.5, 12.0, M['yellow'])]):
    table_square(f'otable{k}', (x, 0, z), m, M['metal'])
    col_cyl(f'otable{k}', (x, 0, z), 0.5, 0.8)
    for j, a in enumerate((0.3, math.pi + 0.3)):
        plastic_chair(f'ochair{k}_{j}', (x + math.sin(a) * 0.78, 0, z + math.cos(a) * 0.78), m, rot_y=a + math.pi)
# vaso com plantas ao lado da porta
box('planter', (3.6, 0.3, D1 + 0.75), (1.4, 0.6, 0.6), M['brick'])
for k in range(6):
    sphere(f'plant{k}', (3.1 + k * 0.2, 0.75 + random.random() * 0.2, D1 + 0.75), (0.2, 0.28, 0.2), M['plant'])
col_box('planter', (3.6, 0.3, D1 + 0.75), (1.5, 0.6, 0.7))

# árvores na beira da calçada (longe da porta) e do outro lado
for k, x in enumerate((-24, -15, 13, 25)):
    tree_round(f'tree{k}', (x, 0, 13.4), random.uniform(5.0, 6.2))
for k, x in enumerate((-30, -6, 20)):
    tree_round(f'treefar{k}', (x, 0, 25.6), random.uniform(5.0, 6.0))

# postes com luz amarela dos dois lados da rua
for k, (x, z, d) in enumerate(((-10, 14.1, 1), (10, 14.1, -1), (-24, 24.9, 1), (24, 24.9, -1), (0, 24.9, 1))):
    side = 1 if z < 20 else -1  # braço do poste aponta para a rua
    cyl(f'pole{k}', (x, 0, z), 0.08, 5.2, M['metal'], seg=8)
    box(f'polearm{k}', (x, 5.15, z + side * 0.6), (0.08, 0.08, 1.3), M['metal'])
    box(f'lamphead{k}', (x, 5.05, z + side * 1.15), (0.3, 0.14, 0.5), M['lamp'])
    col_cyl(f'pole{k}', (x, 0, z), 0.2, 5)
# fios entre os postes do lado do bar
for k, (xa, xb) in enumerate(((-10, 10),)):
    box(f'wire{k}', ((xa + xb) / 2, 5.0, 14.1), (abs(xb - xa), 0.02, 0.02), M['tire'])

# carros estacionados
def car(name, x, z, mat, rot=0.0):
    box(f'{name}_body', (x, 0.55, z), (4.0, 0.7, 1.8), mat, rot_y=rot)
    box(f'{name}_cabin', (x - 0.2, 1.15, z), (2.2, 0.6, 1.6), M['car_glass'], rot_y=rot)
    for sx in (-1.3, 1.3):
        for sz in (-0.85, 0.85):
            cyl(f'{name}_wheel{sx}{sz}', (x + sx, 0.33, z + sz), 0.33, 0.25, M['tire'], seg=10, rot_x=math.pi / 2)
    box(f'{name}_lights', (x + 2.0, 0.6, z), (0.05, 0.18, 1.4), M['headlight'], rot_y=rot)
    col_box(name, (x, 0.6, z), (4.2, 1.4, 2.0))

car('car1', 7.5, 16.0, M['car_red'])
car('car2', -21.0, 23.0, M['car_blue'])

# ponto de ônibus e hidrante
box('bus_roof', (12, 2.5, 25.9), (3.2, 0.1, 1.2), M['metal'])
box('bus_back', (12, 1.3, 26.45), (3.2, 2.2, 0.06), M['bus_glass'])
for sx in (-1.5, 1.5):
    box(f'bus_post{sx}', (12 + sx, 1.25, 26.4), (0.08, 2.5, 0.08), M['metal'])
box('bus_bench', (12, 0.45, 26.2), (2.6, 0.08, 0.45), M['wood'])
col_box('busstop', (12, 1.2, 26.25), (3.3, 2.4, 0.7))
cyl('hydrant', (-12.5, 0, 13.8), 0.16, 0.7, M['hydrant'], seg=10)
col_cyl('hydrant', (-12.5, 0, 13.8), 0.25, 0.7)

# prédios do outro lado da rua (fachada virada para a rua)
xs = [-44, -33, -22, -12, -2, 8, 18, 28, 38]
for k in range(len(xs) - 1):
    h = random.uniform(8, 15)
    wall = random.choice([M['brick'], M['plaster'], M['plaster2'], M['plaster3']])
    shop = random.choice(['lit', 'shutter', None])
    sign = {2: 'PADARIA', 5: 'BAR', 6: 'HOTEL'}.get(k)
    building(f'bld{k}', xs[k] + 0.2, xs[k + 1] - 0.2, 27.0, 7.0, h, wall, facing=-1, shop=shop, sign=sign,
             sign_mat=[M['neon_blue'], M['neon_pink'], M['neon_green']][k % 3])

finalize(OUT)
