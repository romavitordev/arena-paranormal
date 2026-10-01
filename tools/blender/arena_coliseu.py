"""
COLISEU — public/arenas/coliseu.glb
Ruínas ao ENTARDECER, SEM plateia (referências: arquibancadas e arcos em vários andares, muretas,
estandartes vermelhos com emblema dourado, areia rachada, entulho, braseiros de pedra, portão em arco).
Coordenadas do jogo: arena de areia redonda, raio andável ~22 m; arquibancadas e arcos em volta.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'coliseu.glb'
random.seed(21)
start()

M = {
    'sand': material('sand', '#c9a46a', 1),
    'block': material('stone_block', '#b8966a', 0.95),
    'worn': material('stone_worn', '#a8865a', 0.95),
    'banner': material('banner_red', '#9a2a1a', 0.9),
    'gold': material('banner_gold', '#d8a43a', 0.4, metal=0.6),
    'fire': material('brazier_fire', '#ff8a2a', 0.3, emission='#ff7a1a', strength=6),
    'dark': material('dark_stone', '#5a4a3a', 1),
    'wood': material('wood_plank', '#6a4a30', 0.9),
}

R_ARENA = 23.5   # mureta (podium) em volta da areia
# ---------------- areia
cyl('GROUND_sand', (0, -0.2, 0), 26, 0.2, M['sand'], seg=64)

# ---------------- mureta do pódio (segmentos que ficam transparentes) com alguns quebrados
N = 36
for k in range(N):
    a = (k + 0.5) / N * TAU
    if k in (9, 27):
        continue  # portões de entrada
    h = 3.0 if random.random() > 0.12 else random.uniform(1.0, 2.0)
    box(f'OCC_podium{k}', (math.sin(a) * (R_ARENA + 0.4), h / 2, math.cos(a) * (R_ARENA + 0.4)), (R_ARENA * TAU / N + 0.1, h, 0.8), M['block'], rot_y=a)
    box(f'podium_cap{k}', (math.sin(a) * (R_ARENA + 0.4), h + 0.08, math.cos(a) * (R_ARENA + 0.4)), (R_ARENA * TAU / N + 0.2, 0.16, 1.0), M['worn'], rot_y=a)

# ---------------- arquibancadas em degraus (anéis), com trechos desabados
for tier in range(9):
    r0 = R_ARENA + 1.2 + tier * 1.25
    y = 3.0 + tier * 0.75
    for k in range(48):
        if random.random() < 0.09 + tier * 0.012:
            continue  # buraco das ruínas
        a = (k + 0.5) / 48 * TAU
        box(f'seat{tier}_{k}', (math.sin(a) * r0, y, math.cos(a) * r0), (r0 * TAU / 48 + 0.05, 0.75 + 0.02, 1.3), M['worn'], rot_y=a)
# escadarias
for k in range(8):
    a = k / 8 * TAU + 0.2
    for s in range(9):
        r0 = R_ARENA + 1.2 + s * 1.25
        box(f'stair{k}_{s}', (math.sin(a) * r0, 3.0 + s * 0.75 + 0.2, math.cos(a) * r0), (1.4, 0.4, 1.3), M['block'], rot_y=a)

# ---------------- muro externo: três andares de arcos, parte em ruínas
R_OUT = R_ARENA + 13
for level, (y0, hh) in enumerate([(9.5, 5.5), (15.0, 5.0), (20.0, 4.5)]):
    n = 40
    for k in range(n):
        a = (k + 0.5) / n * TAU
        # ruína: o lado da câmera inicial (-x) está mais destruído para não esconder a luta
        broken = (math.sin(a) < -0.3 and level > 0) or random.random() < 0.08 * (level + 1)
        if broken:
            if level == 0 and random.random() < 0.6:
                box(f'stub{level}_{k}', (math.sin(a) * R_OUT, y0 + 1, math.cos(a) * R_OUT), (1.2, 2, 1.4), M['block'], rot_y=a)
            continue
        w = R_OUT * TAU / n
        arch_ring(f'arch{level}_{k}', (math.sin(a) * R_OUT, y0, math.cos(a) * R_OUT), w * 0.62, hh, 1.4, w * 0.19, M['block'], rot_y=a, seg=8)
        box(f'cornice{level}_{k}', (math.sin(a) * R_OUT, y0 + hh + 0.15, math.cos(a) * R_OUT), (w + 0.05, 0.3, 1.6), M['worn'], rot_y=a)
# base maciça do muro externo
for k in range(40):
    a = (k + 0.5) / 40 * TAU
    box(f'outerbase{k}', (math.sin(a) * R_OUT, 4.75, math.cos(a) * R_OUT), (R_OUT * TAU / 40 + 0.05, 9.5, 1.6), M['block'], rot_y=a)

# ---------------- portões em arco (dois lados) com estandartes
for k, a in enumerate((9.5 / 36 * TAU, 27.5 / 36 * TAU)):
    x, z = math.sin(a) * (R_ARENA + 0.4), math.cos(a) * (R_ARENA + 0.4)
    arch_ring(f'gate{k}', (x, 0, z), 3.6, 5.2, 1.8, 0.9, M['block'], rot_y=a, seg=12)
    box(f'gatedark{k}', (math.sin(a) * (R_ARENA + 1.4), 2.2, math.cos(a) * (R_ARENA + 1.4)), (3.6, 4.4, 0.2), M['dark'], rot_y=a)
# estandartes vermelhos rasgados pendurados nos arcos do primeiro andar
for k in range(8):
    a = (k * 5 + 2.5) / 40 * TAU
    x, z = math.sin(a) * (R_OUT - 0.9), math.cos(a) * (R_OUT - 0.9)
    plane(f'SWAY_banner{k}', (x, 12.0, z), (2.2, 6.5), M['banner'], rot_y=a + math.pi)
    box(f'banner_rod{k}', (x, 15.3, z), (2.6, 0.12, 0.12), M['gold'], rot_y=a)

# ---------------- entulho e colunas quebradas na areia (obstáculos)
rubble = [(-12, 6), (8, -11), (14, 7), (-6, -14), (3, 15), (-16, -4)]
for k, (x, z) in enumerate(rubble):
    for j in range(4):
        box(f'rubble{k}_{j}', (x + random.uniform(-0.8, 0.8), 0.3 + j * 0.15, z + random.uniform(-0.8, 0.8)),
            (random.uniform(0.6, 1.3), random.uniform(0.4, 0.8), random.uniform(0.6, 1.2)), M['block'], rot_y=random.random() * 3, rot_x=random.uniform(-0.2, 0.2))
    col_cyl(f'rubble{k}', (x, 0, z), 1.1, 1.2)
for k, (x, z, h) in enumerate([(10, 2, 4.5), (-9, -8, 2.5), (-4, 10, 3.6)]):
    cyl(f'OCC_column{k}', (x, 0, z), 0.55, h, M['worn'], seg=14)
    if h > 3:
        box(f'colcap{k}', (x, h + 0.15, z), (1.4, 0.3, 1.4), M['block'])
    col_cyl(f'column{k}', (x, 0, z), 0.6, h)
# coluna tombada
cyl('fallen_col', (0, 0.5, -6), 0.5, 5.5, M['worn'], seg=12, rot_y=0.4, rot_z=math.pi / 2)
col_box('fallen_col', (0, 0.5, -6), (5.0, 1.0, 1.4))

# ---------------- braseiros de pedra com fogo
for k in range(6):
    a = (k + 0.5) / 6 * TAU
    x, z = math.sin(a) * (R_ARENA - 1.6), math.cos(a) * (R_ARENA - 1.6)
    cyl(f'brazier_base{k}', (x, 0, z), 0.35, 0.9, M['block'], seg=10, r_top=0.25)
    cyl(f'brazier_bowl{k}', (x, 0.9, z), 0.45, 0.35, M['dark'], seg=12, r_top=0.65)
    cyl(f'FLICKER_fire{k}', (x, 1.1, z), 0.45, 0.6, M['fire'], seg=8, r_top=0.05)
    col_cyl(f'brazier{k}', (x, 0, z), 0.7, 1.4)

# ---------------- falésias ao fundo (o coliseu encostado em rocha, como na referência 1)
for k in range(14):
    a = (k / 14) * math.pi + math.pi * 0.25
    r = R_OUT + 14 + random.uniform(0, 6)
    h = random.uniform(22, 34)
    box(f'cliff{k}', (math.sin(a) * r, h / 2 - 2, math.cos(a) * r), (random.uniform(10, 16), h, random.uniform(8, 12)), M['worn'], rot_y=a + random.uniform(-0.3, 0.3))

finalize(OUT)
