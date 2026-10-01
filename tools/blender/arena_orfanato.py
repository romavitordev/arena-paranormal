"""
ORFANATO SANTA MEGA-FREIRA — public/arenas/orfanato.glb
UM casarão (referência 1: tijolo e pedra, telhado de telha vermelha, chaminés, janelas em arco,
torre arredondada), visto do pátio num dia NUBLADO: gramado seco, pinheiros enormes com
balanços de corda, raízes expostas, toco, troncos caídos, lago com juncos, cerca e névoa.
Coordenadas do jogo: arena no centro (raio andável ~19 m); o casarão fica em +x.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU
import bmesh
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'orfanato.glb'
random.seed(11)
start()

M = {
    'grass': material('grass_dry', '#8a7a4a', 1),
    'dirt': material('dirt', '#6a5038', 1),
    'brick': material('brick_manor', '#7a4a38', 0.95),
    'stone': material('stone_manor', '#8a8274', 0.95),
    'trim': material('stone_trim', '#a8a092', 0.9),
    'roof': material('roof_red', '#8a3a26', 0.85),
    'win_lit': material('window_lit', '#ffcf80', 0.4, emission='#ffb860', strength=2.5),
    'win_dark': material('window_dark', '#1e242a', 0.2, metal=0.3),
    'frame': material('window_frame', '#e8e0d0', 0.8),
    'bark': material('bark', '#3a2c22', 1),
    'leaves': material('foliage_pine', '#1e3226', 1),
    'rope': material('rope_swing', '#a89070', 1),
    'wood': material('wood_plank', '#6a4a30', 0.9),
    'hedge': material('hedge', '#2e3a22', 1),
    'water': material('water_pond', '#3a4a46', 0.1),
    'iron': material('iron', '#1a1a1c', 0.5, metal=0.7),
    'statue': material('statue_stone', '#9a968c', 0.9),
    'reed': material('reed', '#9a8a5a', 1),
    'door': material('door_wood', '#3a2418', 0.8),
}

# ---------------- chão
g = cyl('GROUND_grass', (0, -0.2, 0), 70, 0.2, M['grass'], seg=48)
for i in range(7):
    a = random.random() * TAU
    r = random.uniform(4, 15)
    cyl(f'FLOOR_dirt{i}', (math.sin(a) * r, 0.005, math.cos(a) * r), random.uniform(1.5, 3.5), 0.01, M['dirt'], seg=16)
# caminho de terra batida da entrada até o meio
box('FLOOR_path', (11, 0.008, 0), (22, 0.01, 3.2), M['dirt'])

# ---------------- casarão (um só), fachada em x = 22 olhando para o pátio (-x)
FX = 22.0
LEN = 34.0
DEPTH = 11.0
H = 11.0
box('OCC_manor_main', (FX + DEPTH / 2, H / 2, 0), (DEPTH, H, LEN), M['brick'])
# faixas e cantos de pedra
for y in (0.6, H * 0.5, H - 0.3):
    box(f'band{y}', (FX - 0.05, y, 0), (0.3, 0.35, LEN + 0.2), M['trim'])
for z in (-LEN / 2, LEN / 2):
    box(f'quoin{z}', (FX + 0.1, H / 2, z), (0.5, H, 0.6), M['stone'])
# telhado em prisma (duas águas) com telhas
def roof_prism(name, cx, cz, length, width, base_y, height, mat):
    bm = bmesh.new()
    hw = width / 2
    pts = [(-hw, 0), (hw, 0), (0, height)]
    verts = []
    for z in (-length / 2, length / 2):
        verts.append([bm.verts.new(B(cx + x, base_y + y, cz + z)) for x, y in pts])
    a, b = verts
    bm.faces.new([a[0], a[1], a[2]])
    bm.faces.new([b[2], b[1], b[0]])
    bm.faces.new([a[0], a[2], b[2], b[0]])
    bm.faces.new([a[2], a[1], b[1], b[2]])
    bm.faces.new([a[1], a[0], b[0], b[1]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    o = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o
roof_prism('roof_main', FX + DEPTH / 2, 0, LEN + 1, DEPTH + 1.2, H, 4.2, M['roof'])
# chaminés
for z in (-12, -4, 5, 13):
    box(f'chimney{z}', (FX + DEPTH / 2 + random.uniform(-2, 2), H + 4.4, z), (1.0, 3.2, 1.0), M['brick'])
    box(f'chimneycap{z}', (FX + DEPTH / 2, H + 6.05, z), (1.2, 0.2, 1.2), M['trim'])
# janelas em arco: 2 andares + sótão
def window(name, x, y, z, lit):
    box(f'{name}_frame', (x - 0.06, y, z), (0.15, 2.0, 1.25), M['frame'])
    box(f'{name}_glass', (x - 0.12, y - 0.05, z), (0.06, 1.7, 0.95), M['win_lit'] if lit else M['win_dark'])
    arch_ring(f'{name}_arch', (x - 0.1, y + 0.55, z), 1.0, 0.95, 0.18, 0.12, M['trim'], rot_y=math.pi / 2, seg=8)
    box(f'{name}_sill', (x - 0.2, y - 1.05, z), (0.35, 0.12, 1.4), M['trim'])
for floor, y in enumerate((2.6, 6.8)):
    for i, z in enumerate(range(-14, 15, 4)):
        if floor == 0 and abs(z) < 3:
            continue
        window(f'win{floor}_{i}', FX, y, z, lit=random.random() < (0.35 if floor else 0.25))
# entrada central com pórtico de pedra, porta e escadaria
box('entry_block', (FX - 1.2, 3.3, 0), (2.4, 6.6, 6.0), M['stone'])
arch_ring('entry_arch', (FX - 2.45, 0.0, 0), 2.6, 4.2, 0.4, 0.45, M['trim'], rot_y=math.pi / 2, seg=12)
box('door', (FX - 2.3, 1.6, 0), (0.12, 3.2, 2.4), M['door'])
for k in range(4):
    box(f'step{k}', (FX - 3.2 - k * 0.45, 0.1 + (3 - k) * 0.18, 0), (0.45, 0.2 + (3 - k) * 0.36, 5.0 - k * 0.2), M['stone'])
col_box('entry', (FX - 3.2, 1, 0), (2.4, 2, 5.4))
# torre arredondada na ponta (como na referência)
TX, TZ = FX + 2.5, -LEN / 2 + 1.5
cyl('OCC_tower', (TX, 0, TZ), 3.4, 15, M['brick'], seg=20)
cyl('tower_roof', (TX, 15, TZ), 3.9, 4.5, M['roof'], seg=20, r_top=0.1)
for k, y in enumerate((3, 7.5, 11.5)):
    for a in (-0.6, 0, 0.6):
        ang = math.pi + a
        wx, wz = TX + math.sin(ang) * 3.42, TZ + math.cos(ang) * 3.42
        box(f'towerwin{k}{a}', (wx, y, wz), (0.12, 1.6, 0.8), M['win_lit'] if (k == 2 and a == 0) else M['win_dark'], rot_y=ang)
col_cyl('tower', (TX, 0, TZ), 3.5, 15)
# parede do casarão como limite físico
col_box('manor', (FX + DEPTH / 2, 3, 0), (DEPTH, 6, LEN))

# ---------------- pinheiros com balanços (dentro e em volta do pátio)
trees = [(-9, 9, 15), (-13, -6, 17), (7, -13, 16), (5, 12, 14), (-17, 4, 18), (14, 9, 16), (-4, -16, 15), (13, -6, 17)]
for i, (x, z, h) in enumerate(trees):
    r = 0.42 + random.random() * 0.12
    tree_pine(f'pine{i}', (x, 0, z), h, M, r=r, layers=6)
    if i in (0, 3):
        # galho grosso + balanço de corda e tábua
        bx = x + 1.6
        cyl(f'branch{i}', (x + 0.2, 5.0, z), 0.16, 2.6, M['bark'], seg=6, r_top=0.08, rot_z=-math.pi / 2)
        swing(f'swing{i}', (bx, 5.0, z), 4.3, M, rot_y=random.uniform(-0.3, 0.3))
# toco cortado e troncos caídos (obstáculos baixos)
cyl('stump', (-3, 0, -9), 0.6, 0.5, M['bark'], seg=12)
col_cyl('stump', (-3, 0, -9), 0.65, 0.5)
for k, (x, z, a) in enumerate([(-11, -11, 0.6), (9, 4, -0.3)]):
    cyl(f'log{k}', (x, 0.35, z), 0.35, 4.2, M['bark'], seg=10, rot_y=a, rot_z=math.pi / 2)
    col_box(f'log{k}', (x, 0.4, z), (3.6 if abs(a) < 0.5 else 3.0, 0.8, 1.2))

# ---------------- estátua da Santa Mega-Freira num pedestal (fica transparente se tampar)
SX, SZ = -11, 7
before = set(o.name for o in bpy.context.scene.objects)
box('pedestal', (SX, 0.5, SZ), (1.7, 1.0, 1.7), M['trim'], bevel=0.05)
box('pedestal_top', (SX, 1.05, SZ), (1.9, 0.12, 1.9), M['trim'])
# hábito longo com dobras, capuz/véu, rosto, mãos unidas em oração
cyl('nun_robe', (SX, 1.1, SZ), 0.62, 1.7, M['statue'], seg=16, r_top=0.36)
for k in range(8):
    a = k / 8 * TAU
    cyl(f'nun_fold{k}', (SX + math.sin(a) * 0.5, 1.1, SZ + math.cos(a) * 0.5), 0.08, 1.6, M['statue'], seg=6, r_top=0.03)
cyl('nun_chest', (SX, 2.75, SZ), 0.36, 0.5, M['statue'], seg=16, r_top=0.26)
sphere('nun_head', (SX, 3.5, SZ), (0.19, 0.23, 0.2), M['statue'])
cyl('nun_veil', (SX, 3.05, SZ + 0.04), 0.4, 0.75, M['statue'], seg=16, r_top=0.21)
sphere('nun_veiltop', (SX, 3.65, SZ + 0.02), (0.23, 0.18, 0.24), M['statue'])
box('nun_coif', (SX, 3.32, SZ - 0.17), (0.34, 0.06, 0.04), M['trim'])
for s2 in (-1, 1):
    cyl(f'nun_arm{s2}', (SX + s2 * 0.3, 3.0, SZ), 0.08, 0.42, M['statue'], seg=8, rot_x=math.radians(-40), rot_z=s2 * 0.7)
sphere('nun_hands', (SX, 2.8, SZ - 0.3), (0.09, 0.14, 0.08), M['statue'])
new = [o for o in bpy.context.scene.objects if o.name not in before]
rebase(join_objs(new, 'OCC_statue'))
col_box('statue', (SX, 1, SZ), (1.9, 2, 1.9))

# ---------------- lago com juncos (canto) — não dá para entrar
PX, PZ = -6, 15
cyl('FLOOR_pond', (PX, 0.02, PZ), 3.6, 0.02, M['water'], seg=28)
for k in range(18):
    a = k / 18 * TAU
    box(f'pondrim{k}', (PX + math.sin(a) * 3.75, 0.12, PZ + math.cos(a) * 3.75), (1.3, 0.25, 0.45), M['stone'], rot_y=a)
for k in range(30):
    a = random.random() * TAU
    rr = 3.4 + random.random() * 0.8
    cyl(f'reed{k}', (PX + math.sin(a) * rr, 0, PZ + math.cos(a) * rr), 0.02, random.uniform(0.7, 1.3), M['reed'], seg=4, r_top=0.005)
col_cyl('pond', (PX, 0, PZ), 3.9, 0.6)

# ---------------- bancos, cerca e cerca viva no limite do pátio
for k, (x, z, a) in enumerate([(-5, -12, 0.3), (2, 15, math.pi)]):
    box(f'bench{k}', (x, 0.45, z), (1.8, 0.08, 0.5), M['wood'], rot_y=a)
    for s in (-1, 1):
        box(f'benchleg{k}{s}', (x + math.cos(a) * s * 0.75, 0.22, z - math.sin(a) * s * 0.75), (0.08, 0.45, 0.45), M['iron'], rot_y=a)
for k in range(56):
    a = k / 56 * TAU
    x, z = math.sin(a) * 21, math.cos(a) * 21
    if x > 19:  # o casarão fecha esse lado
        continue
    cyl(f'fence{k}', (x, 0, z), 0.04, 1.6, M['iron'], seg=5)
    box(f'hedge{k}', (math.sin(a) * 22.5, 0.7, math.cos(a) * 22.5), (2.6, 1.4, 1.1), M['hedge'], rot_y=a)
# cerca: barras horizontais
for y in (0.4, 1.4):
    for k in range(28):
        a0, a1 = k / 28 * TAU, (k + 1) / 28 * TAU
        mx, mz = math.sin((a0 + a1) / 2) * 21, math.cos((a0 + a1) / 2) * 21
        if mx > 19:
            continue
        box(f'rail{y}_{k}', (mx, y, mz), (0.04, 0.05, 21 * (a1 - a0)), M['iron'], rot_y=(a0 + a1) / 2 + math.pi / 2)

# ---------------- linha de árvores ao longe (fundo na névoa)
for k in range(40):
    a = k / 40 * TAU + random.random() * 0.1
    r = random.uniform(30, 44)
    x, z = math.sin(a) * r, math.cos(a) * r
    if x > 20 and abs(z) < 22:
        continue
    tree_pine(f'far{k}', (x, 0, z), random.uniform(14, 22), M, r=0.5, layers=4, collider=False)

finalize(OUT)
