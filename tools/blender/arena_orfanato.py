"""
ORFANATO SANTA MEGA-FREIRA — public/arenas/orfanato.glb
UM casarão de pedra de três andares com telhado vermelho e uma torre, visto do pátio num dia NUBLADO: gramado seco,
pinheiros enormes com balanços de corda, toco, troncos caídos, lago com pedras, bancos, grade de ferro, sebe e névoa.
Casarão, torre, pinheiros, troncos, pedras, bancos, grade e sebe são PEÇAS PRONTAS dos kits do Kenney (CC0:
Fantasy Town, Nature e Graveyard Kit — tools/blender/kenney.py). Feitos aqui só: a estátua da Santa Mega-Freira,
os balanços e a água do lago.
Coordenadas do jogo: arena no centro (raio andável ~19 m); o casarão fica em +x, com a fachada olhando o pátio (-x).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU
from kenney import put, house, tower

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'orfanato.glb'
random.seed(11)
start()

M = {
    'grass': material('grass_dry', '#8a7a4a', 1),
    'dirt': material('dirt', '#6a5038', 1),
    'bark': material('bark', '#3a2c22', 1),
    'wood': material('wood_plank', '#6a4a30', 0.9),
    'rope': material('rope', '#8a6a44', 0.9),
    'statue': material('statue_stone', '#9a968c', 0.95),
    'trim': material('stone_trim', '#a8a092', 0.9),
    'water': material('water_pond', '#3a4a46', 0.1),
}

# ---------------- chão
cyl('GROUND_grass', (0, -0.2, 0), 70, 0.2, M['grass'], seg=48)
for i in range(7):
    a = random.random() * TAU
    r = random.uniform(4, 15)
    cyl(f'FLOOR_dirt{i}', (math.sin(a) * r, 0.005, math.cos(a) * r), random.uniform(1.5, 3.5), 0.01, M['dirt'], seg=16)
box('FLOOR_path', (11, 0.008, 0), (22, 0.01, 3.2), M['dirt'])

# ---------------- o casarão: pedra, 3 andares, 11 células de fachada (33 m), porta no meio, olhando para o pátio (-x)
S = 3.0
house('manor', (22.0 + S, 0, 0), -math.pi / 2, cells=(11, 2), floors=3, s=S, wood=False, door_at=5, prefix='OCC_')
for z in (-12, -3, 6, 13):
    put('town', 'chimney', (25.5, 9.0, z), 0.0, 4.0)
# escadaria de pedra na porta
put('town', 'stairs-wide-stone', (20.6, 0, 0), math.pi / 2, S)
col_box('manor', (22.0 + S, 3, 0), (2 * S, 6, 11 * S))
col_box('entry', (20.6, 1, 0), (2.4, 2, 3.4))
# torre de pedra na ponta do casarão
TX, TZ = 23.5, -19.0
tower('orfanato', (TX, 0, TZ), floors=5, window='wall-window-stone', window_face=math.pi)
col_box('tower', (TX, 0, TZ), (3.2, 15, 3.2))

# ---------------- pinheiros enormes (dois com balanço) dentro e em volta do pátio
PINES = ['tree_pineTallA_detailed', 'tree_pineTallB_detailed', 'tree_pineTallC_detailed', 'tree_pineTallD_detailed']
trees = [(-9, 9, 15), (-13, -6, 17), (7, -13, 16), (5, 12, 14), (-17, 4, 18), (14, 9, 16), (-4, -16, 15), (13, -6, 17)]
for i, (x, z, h) in enumerate(trees):
    put('nature', random.choice(PINES), (x, 0, z), random.uniform(0, TAU), h / 1.9, 'OCC_')
    col_cyl(f'pine{i}', (x, 0, z), 0.7, h * 0.6)
    if i in (0, 3):
        # galho + balanço de corda e tábua
        cyl(f'branch{i}', (x + 0.2, 5.0, z), 0.16, 2.6, M['bark'], seg=6, r_top=0.08, rot_z=-math.pi / 2)
        swing(f'swing{i}', (x + 1.6, 5.0, z), 4.3, {'bark': M['bark'], 'wood': M['wood'], 'rope': M['rope'], 'leaves': M['bark']}, rot_y=random.uniform(-0.3, 0.3))
# toco e troncos caídos (obstáculos baixos)
put('nature', 'stump_oldTall', (-3, 0, -9), 0.4, 2.2)
col_cyl('stump', (-3, 0, -9), 0.65, 0.6)
for k, (x, z, a) in enumerate([(-11, -11, 0.6), (9, 4, -0.3)]):
    put('nature', 'log_large', (x, 0, z), a, 4.0)
    col_box(f'log{k}', (x, 0.4, z), (3.6 if abs(a) < 0.5 else 3.0, 0.8, 1.6))

# ---------------- estátua da Santa Mega-Freira num pedestal (fica transparente se tampar)
SX, SZ = -11, 7
before = set(o.name for o in bpy.context.scene.objects)
box('pedestal', (SX, 0.5, SZ), (1.7, 1.0, 1.7), M['trim'], bevel=0.05)
box('pedestal_top', (SX, 1.05, SZ), (1.9, 0.12, 1.9), M['trim'])
cyl('nun_robe', (SX, 1.1, SZ), 0.62, 1.7, M['statue'], seg=16, r_top=0.36)
for k in range(8):
    a = k / 8 * TAU
    cyl(f'nun_fold{k}', (SX + math.sin(a) * 0.5, 1.1, SZ + math.cos(a) * 0.5), 0.08, 1.6, M['statue'], seg=6, r_top=0.03)
cyl('nun_chest', (SX, 2.75, SZ), 0.36, 0.5, M['statue'], seg=16, r_top=0.26)
sphere('nun_head', (SX, 3.5, SZ), (0.19, 0.23, 0.2), M['statue'])
cyl('nun_veil', (SX, 3.05, SZ + 0.04), 0.4, 0.75, M['statue'], seg=16, r_top=0.21)
sphere('nun_veiltop', (SX, 3.65, SZ + 0.02), (0.23, 0.18, 0.24), M['statue'])
for s2 in (-1, 1):
    cyl(f'nun_arm{s2}', (SX + s2 * 0.3, 3.0, SZ), 0.08, 0.42, M['statue'], seg=8, rot_x=math.radians(-40), rot_z=s2 * 0.7)
sphere('nun_hands', (SX, 2.8, SZ - 0.3), (0.09, 0.14, 0.08), M['statue'])
new = [o for o in bpy.context.scene.objects if o.name not in before]
rebase(join_objs(new, 'OCC_statue'))
col_box('statue', (SX, 1, SZ), (1.9, 2, 1.9))

# ---------------- lago com pedras do kit em volta (não dá para entrar)
PX, PZ = -6, 15
cyl('FLOOR_pond', (PX, 0.02, PZ), 3.6, 0.02, M['water'], seg=28)
for k in range(14):
    a = k / 14 * TAU
    put('nature', random.choice(['rock_smallA', 'rock_smallB', 'rock_smallC', 'rock_smallFlatA']), (PX + math.sin(a) * 3.8, 0, PZ + math.cos(a) * 3.8), random.uniform(0, TAU), 3.0)
for k in range(10):
    a = random.random() * TAU
    put('nature', 'grass_large', (PX + math.sin(a) * 3.5, 0, PZ + math.cos(a) * 3.5), random.uniform(0, TAU), 4.0)
col_cyl('pond', (PX, 0, PZ), 3.9, 0.6)

# ---------------- bancos, grade de ferro e sebe no limite do pátio
for k, (x, z, a) in enumerate([(-5, -12, 0.3), (2, 15, math.pi)]):
    put('graveyard', 'bench', (x, 0, z), a, 2.4)
    col_box(f'bench{k}', (x, 0.4, z), (1.8, 0.9, 0.8))
n = 44
for k in range(n):
    a = (k + 0.5) / n * TAU
    x, z = math.sin(a) * 21, math.cos(a) * 21
    if x > 19:  # o casarão fecha esse lado
        continue
    put('graveyard', 'iron-fence', (x, 0, z), a, 3.0)
    put('town', 'hedge-large', (math.sin(a) * 22.6, 0, math.cos(a) * 22.6), a - math.pi / 2, 3.0)

# ---------------- linha de pinheiros ao longe (fundo na névoa)
for k in range(40):
    a = k / 40 * TAU + random.random() * 0.1
    r = random.uniform(30, 44)
    x, z = math.sin(a) * r, math.cos(a) * r
    if x > 20 and abs(z) < 22:
        continue
    put('nature', random.choice(PINES + ['tree_pineRoundA', 'tree_pineRoundC']), (x, 0, z), random.uniform(0, TAU), random.uniform(7, 11))

finalize(OUT)
