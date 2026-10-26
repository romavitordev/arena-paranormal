"""
IGREJA ANTIGA (a base dos Vampiros em Hexatombe) — public/arenas/igreja.glb. Só o INTERIOR, a partir do modelo 3D da
igreja usado no próprio RPG (wiki "Igreja Antiga": "Interior", "vista de cima", "Dama da Culpa", "Área dos anzóis") e da
cinemática da Ceia dos Vampiros:
  - a NAVE ampla e alta, de alvenaria gasta, com os PILARES grandes e os ARCOS de cada lado; em cima, as GALERIAS
    laterais com os BALCÕES de balaústres (o segundo nível);
  - as JANELAS altas em arco ogival com os VITRAIS VERMELHOS (a lua de sangue entra por eles e tinge tudo);
  - o TETO alto com as nervuras de madeira em arco ogival;
  - no centro, a MESA DO BANQUETE com a toalha manchada, os CANDELABROS e as cadeiras de encosto pontiagudo;
  - no fundo (o altar): a DAMA DA CULPA (a dama de ferro com o leque de espinhos e a pedra vermelha), atrás dela a
    estátua do SERAFIM VERMELHO decapitado e, no alto, o SÍMBOLO DE SANGUE (no lugar da cruz); os estandartes escuros;
  - a PORTA da frente TRANCADA (correntes e cadeado); a fileira de ANZÓIS com correntes numa parede; bancos quebrados e
    entulho (o interior revirado pela batalha). A NÉVOA DA MEMBRANA e a luz vermelha ficam na config (src/arena/configs.js).
Feito à mão (sem kits). Coordenadas do jogo: nave x ∈ [-10, 10], z ∈ [-18, 14]; altar ao fundo (z < -13); porta em z = 14.
  node tools/blender/build.mjs igreja   → public/arenas/igreja.glb
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
import bmesh
from arena_lib import *
from arena_lib import _obj_from_bmesh
from lib import material, TAU

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'igreja.glb'
random.seed(1666)
start()

M = {
    'stone': material('church_stone', '#5a5450', 0.95),
    'floor': material('church_floor', '#4a4440', 0.9),
    'pillar': material('stone_trim', '#7a7268', 0.9),
    'wood': material('wood_dark', '#3a2618', 0.75),
    'iron': material('iron_dark', '#26242a', 0.5, metal=0.7),
    'glass': material('stained_blood', '#ff2a1a', 0.3, emission='#ff1a10', strength=3.2),
    'cloth': material('table_cloth', '#d8d0c4', 0.8),
    'banner': material('banner_dark', '#1e1418', 0.9),
    'seraph': material('seraph_stone', '#6a2a2a', 0.85),
    'blood': material('blood_symbol', '#ff2020', 0.4, emission='#ff1010', strength=4),
    'gem': material('gem_blood', '#ff2a2a', 0.2, emission='#ff1010', strength=3),
    'wax': material('candle_wax', '#e8dcc0', 0.6),
    'flame': material('candle_flame', '#ffb050', 0.3, emission='#ff9a30', strength=6),
    'gold': material('gold_old', '#a88a3a', 0.4, metal=0.8),
    'rubble': material('rubble_stone', '#4a4440', 1),
    'stain': material('blood_stain', '#5a0a0a', 0.6),
}

X0, X1, Z0, Z1 = -10.0, 10.0, -18.0, 14.0
WH = 13.0          # altura das paredes
GAL = 5.0          # altura do piso das galerias
PX = 6.4           # x dos pilares da nave
PZ = [-12 + 4 * i for i in range(7)]  # z dos pilares (-12 … 12)


def poly_prism(name, pts2, depth, mat, pos, rot_y=0.0):
    """prisma a partir de um contorno 2D (x, y) no plano vertical, com espessura `depth` (janelas, portas, estandartes)"""
    bm = bmesh.new()
    front = [bm.verts.new((x, -depth / 2, y)) for x, y in pts2]
    back = [bm.verts.new((x, depth / 2, y)) for x, y in pts2]
    bm.faces.new(front)
    bm.faces.new(list(reversed(back)))
    n = len(pts2)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new([front[i], front[j], back[j], back[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = _obj_from_bmesh(name, bm, mat)
    return place(o, pos, rot_y)


def ogive(w, h, n=10):
    """contorno de uma janela em arco OGIVAL (gótico): retângulo com as duas curvas que se encontram na ponta"""
    r = w * 0.85  # raio das curvas (arco quebrado): o centro da curva da direita fica em (cx, s0)
    cx = w / 2 - r
    s0 = h - math.sqrt(r * r - cx * cx)  # onde a curva começa (a ponta fica em (0, h))
    amax = math.acos(-cx / r)
    right = [(cx + r * math.cos(amax * i / n), s0 + r * math.sin(amax * i / n)) for i in range(n + 1)]
    right[-1] = (0.0, h)
    left = [(-x, y) for x, y in reversed(right[:-1])]
    return [(-w / 2, 0.0), (w / 2, 0.0)] + right + left


def lancet(name, pos, w, h, rot_y, frame=0.18):
    """janela gótica: o vitral vermelho aceso, a moldura de pedra e o mainel com a travessa"""
    poly_prism(f'{name}_glass', ogive(w, h), 0.06, M['glass'], pos, rot_y)
    outer = ogive(w + frame * 2, h + frame)
    fr = poly_prism(f'{name}_frame', outer, 0.12, M['pillar'], pos, rot_y)
    fr.location.y += 0  # (a moldura fica atrás do vidro; o vidro aparece por dentro dela)
    dx, dz = math.cos(rot_y), -math.sin(rot_y)
    box(f'{name}_mullion', (pos[0], pos[1] + h * 0.45, pos[2]), (0.08, h * 0.9, 0.1), M['iron'], rot_y)
    box(f'{name}_transom', (pos[0], pos[1] + h * 0.42, pos[2]), (w, 0.07, 0.1), M['iron'], rot_y)


def segment(name, a, b, t, mat):
    """viga reta de a até b (no plano x-y do jogo, z fixo) com seção t×t"""
    ax, ay, az = a
    bx, by, bz = b
    L = math.hypot(bx - ax, by - ay)
    ang = math.atan2(by - ay, bx - ax)
    return box(name, ((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), (L + t * 0.4, t, t), mat, rot_z=ang)


# ================================================================ piso, paredes e o teto
box('FLOOR_church', (0, -0.05, (Z0 + Z1) / 2), (X1 - X0, 0.1, Z1 - Z0), M['floor'])
box('OCC_wall_left', (X0 - 0.3, WH / 2, (Z0 + Z1) / 2), (0.6, WH, Z1 - Z0 + 0.6), M['stone'])
box('OCC_wall_right', (X1 + 0.3, WH / 2, (Z0 + Z1) / 2), (0.6, WH, Z1 - Z0 + 0.6), M['stone'])
box('OCC_wall_back', (0, WH / 2, Z0 - 0.3), (X1 - X0 + 1.2, WH, 0.6), M['stone'])
box('OCC_wall_front', (0, WH / 2, Z1 + 0.3), (X1 - X0 + 1.2, WH, 0.6), M['stone'])
for nm, p, s in (('left', (X0 - 0.3, WH / 2, (Z0 + Z1) / 2), (0.6, WH, Z1 - Z0)), ('right', (X1 + 0.3, WH / 2, (Z0 + Z1) / 2), (0.6, WH, Z1 - Z0)),
                 ('back', (0, WH / 2, Z0 - 0.3), (X1 - X0, WH, 0.6)), ('front', (0, WH / 2, Z1 + 0.3), (X1 - X0, WH, 0.6))):
    col_box('wall_' + nm, p, s)
# o TELHADO em duas águas por cima das nervuras (a ponta a 18 m)
ROOF_PEAK = 18.0
half = (X1 - X0) / 2 + 0.6
ang = math.atan2(ROOF_PEAK - WH, half)
Lr = math.hypot(half, ROOF_PEAK - WH)
for s in (1, -1):
    box(f'OCC_roof{s}', (s * half / 2, (WH + ROOF_PEAK) / 2, (Z0 + Z1) / 2), (Lr, 0.3, Z1 - Z0 + 1.2), M['wood'], rot_z=-s * ang)
# as NERVURAS de madeira em arco ogival de um lado ao outro, a cada 4 m
for k, z in enumerate([Z0 + 2 + 4 * i for i in range(8)]):
    pts = []
    for i in range(13):
        t = i / 12
        x = X0 + (X1 - X0) * t
        y = WH + (ROOF_PEAK - 1.2 - WH) * math.sin(t * math.pi) ** 0.7
        pts.append((x, y, z))
    for i in range(12):
        segment(f'rib{k}_{i}', pts[i], pts[i + 1], 0.32, M['wood'])

# ================================================================ a NAVE: pilares, arcos laterais, galerias e balcões
for s in (1, -1):
    for i, z in enumerate(PZ):
        cyl(f'OCC_pillar{s}_{i}', (s * PX, 0, z), 0.5, WH, M['pillar'], seg=14)
        cyl(f'pillar_base{s}_{i}', (s * PX, 0, z), 0.7, 0.5, M['pillar'], seg=14)
        cyl(f'pillar_cap{s}_{i}', (s * PX, GAL - 0.4, z), 0.5, 0.4, M['pillar'], seg=14, r_top=0.72)
        col_cyl(f'pillar{s}_{i}', (s * PX, 0, z), 0.62, WH)
    # os arcos entre os pilares (abrem para o corredor lateral)
    for i in range(len(PZ) - 1):
        zc = (PZ[i] + PZ[i + 1]) / 2
        arch_ring(f'arch{s}_{i}', (s * PX, 0, zc), 3.0, GAL - 0.4, 0.8, 0.5, M['stone'], rot_y=math.pi / 2)
    # o piso da galeria sobre o corredor e o BALCÃO com balaústres virado para a nave
    gx = (s * PX + s * X1) / 2
    box(f'gallery{s}', (gx, GAL + 0.15, (PZ[0] + PZ[-1]) / 2), (X1 - PX + 0.6, 0.3, PZ[-1] - PZ[0] + 1.0), M['stone'])
    rx = s * (PX - 0.4)
    box(f'rail_top{s}', (rx, GAL + 1.25, (PZ[0] + PZ[-1]) / 2), (0.22, 0.14, PZ[-1] - PZ[0]), M['pillar'])
    box(f'rail_base{s}', (rx, GAL + 0.38, (PZ[0] + PZ[-1]) / 2), (0.3, 0.16, PZ[-1] - PZ[0]), M['pillar'])
    for zb in [PZ[0] + 0.4 * j for j in range(int((PZ[-1] - PZ[0]) / 0.4) + 1)]:
        if any(abs(zb - zp) < 0.55 for zp in PZ):
            continue
        cyl(f'baluster{s}_{zb:.1f}', (rx, GAL + 0.45, zb), 0.06, 0.8, M['pillar'], seg=6, r_top=0.09)
    # balcões salientes (o "camarote" de balaústres no meio de cada vão, como no modelo do RPG)
    for i in (1, 4):
        zc = (PZ[i] + PZ[i + 1]) / 2
        box(f'box_floor{s}_{i}', (s * (PX - 1.0), GAL + 0.15, zc), (1.3, 0.25, 2.2), M['stone'])
        for dz in (-1.0, 1.0):
            box(f'box_side{s}_{i}_{dz}', (s * (PX - 1.0), GAL + 0.8, zc + dz), (1.3, 1.0, 0.12), M['pillar'])
        box(f'box_front{s}_{i}', (s * (PX - 1.62), GAL + 0.8, zc), (0.12, 1.0, 2.2), M['pillar'])
        sphere(f'box_corbel{s}_{i}', (s * (PX - 1.0), GAL - 0.25, zc), (0.5, 0.45, 0.9), M['stone'], seg=10, rings=6)

# ================================================================ as JANELAS: as altas nas laterais (acima das galerias), as baixas nos
# corredores e as três grandes do fundo
for s in (1, -1):
    for i in range(len(PZ) - 1):
        zc = (PZ[i] + PZ[i + 1]) / 2
        lancet(f'win_hi{s}_{i}', (s * (X1 - 0.02), GAL + 1.6, zc), 1.7, 5.2, rot_y=s * math.pi / 2)
        lancet(f'win_lo{s}_{i}', (s * (X1 - 0.02), 1.3, zc), 1.0, 2.8, rot_y=s * math.pi / 2)
for dx, w, h in ((-3.4, 1.6, 5.4), (0.0, 2.0, 6.6), (3.4, 1.6, 5.4)):
    lancet(f'win_back{dx}', (dx, 6.0, Z0 + 0.02), w, h, rot_y=0.0)

# ================================================================ o ALTAR (fundo): degraus, a mesa do altar, o SERAFIM VERMELHO decapitado,
# a DAMA DA CULPA e o SÍMBOLO DE SANGUE no alto
for k, (zz, hh) in enumerate(((Z0 + 3.4, 0.25), (Z0 + 2.6, 0.5), (Z0 + 1.8, 0.75))):
    box(f'altar_step{k}', (0, hh / 2, zz - 0.4 + (Z0 - zz + 0.4) / 2 + 0.0), (12.0 - k * 1.2, hh, (zz + 0.4 - Z0)), M['stone'])
col_box('altar_steps', (0, 0.5, Z0 + 2.0), (12.0, 1.0, 4.0))
box('altar_table', (0, 1.25, Z0 + 1.0), (3.2, 1.0, 1.0), M['stone'])
box('altar_cloth', (0, 1.77, Z0 + 1.0), (3.4, 0.05, 1.1), M['banner'])
# o Serafim: o corpo de pé sem a cabeça, as asas abertas atrás (pedra avermelhada)
SZ = Z0 + 2.4  # o Serafim de pé nos degraus, entre o retábulo e a Dama
cyl('seraph_body', (0, 0.5, SZ), 0.55, 3.4, M['seraph'], seg=12, r_top=0.42)
sphere('seraph_chest', (0, 3.65, SZ), (0.75, 0.6, 0.45), M['seraph'], seg=12, rings=8)
cyl('seraph_neck', (0, 4.1, SZ), 0.22, 0.25, M['seraph'], seg=10)  # o pescoço cortado
for s in (1, -1):
    for j in range(5):  # as penas grandes da asa abrindo em leque
        a = 0.35 + j * 0.22
        L = 3.2 - j * 0.3
        box(f'seraph_wing{s}_{j}', (s * (0.5 + math.cos(a) * L / 2), 3.75 + math.sin(a) * L / 2, SZ - 0.1), (L, 0.35, 0.12), M['seraph'], rot_z=s * a)
def blood_symbol(name, cx, cy, z, k, mat, depth=0.08):
    """o SÍMBOLO DE SANGUE (wiki "Sangue"): o traço vertical com a ponta esfiapada em cima, a travessa no meio e a barra
    de baixo mais larga e um pouco torta — pincelado. Na igreja ele foi posto no lugar das cruzes."""
    box(f'{name}_v', (cx, cy, z), (0.3 * k, 3.0 * k, depth), mat)
    for j, dx in enumerate((-0.1, 0.0, 0.09)):  # as pontas do pincel no alto
        box(f'{name}_tip{j}', (cx + dx * k, cy + (1.5 + 0.12 + 0.06 * j) * k, z), (0.07 * k, (0.25 + 0.08 * j) * k, depth), mat)
    box(f'{name}_mid', (cx, cy + 0.15 * k, z), (2.1 * k, 0.26 * k, depth), mat, rot_z=0.02)
    box(f'{name}_base', (cx + 0.05 * k, cy - 1.35 * k, z), (2.6 * k, 0.32 * k, depth), mat, rot_z=-0.04)


# o SÍMBOLO DE SANGUE posto como a cruz do altar, aceso, acima da estátua (com os escorridos)
blood_symbol('blood_symbol', 0, 10.9, Z0 + 0.05, 1.05, M['blood'])
for dx in (-0.9, -0.3, 0.4, 0.95):
    box(f'blood_drip{dx}', (dx, 9.2 - abs(dx) * 0.3, Z0 + 0.05), (0.07, 0.6 + random.random() * 0.6, 0.06), M['blood'])
# a DAMA DA CULPA na frente do altar: o corpo de ferro, a "cabeça", o leque de espinhos e a pedra vermelha
DZ = Z0 + 4.4
cyl('maiden_body', (0, 0.0, DZ), 0.55, 2.0, M['iron'], seg=10, r_top=0.42)
sphere('maiden_head', (0, 2.25, DZ), (0.38, 0.42, 0.34), M['iron'], seg=10, rings=6)
cyl('maiden_ring', (0, 1.0, DZ), 0.6, 0.12, M['gold'], seg=12)
for j in range(11):
    a = math.pi * (0.1 + 0.8 * j / 10)
    cyl(f'maiden_spike{j}', (math.cos(a) * 0.35, 2.3 + math.sin(a) * 0.35, DZ + 0.18), 0.05, 0.9, M['iron'], seg=5, r_top=0.0, rot_z=a - math.pi / 2)
sphere('maiden_gem', (0, 2.35, DZ - 0.36), (0.12, 0.12, 0.08), M['gem'], seg=10, rings=6)
col_cyl('maiden', (0, 0, DZ), 0.7, 2.6)
# os ESTANDARTES escuros pontiagudos pendurados entre os pilares do fundo e na nave
for k, (x, z) in enumerate([(-PX + 0.0, -14.6), (PX, -14.6), (-3.8, Z0 + 0.25), (3.8, Z0 + 0.25)]):
    poly_prism(f'SWAY_banner{k}', [(-0.55, 0), (0.0, -0.6), (0.55, 0), (0.55, 3.2), (-0.55, 3.2)], 0.04, M['banner'], (x, 6.4, z), 0.0)

# ================================================================ a MESA DO BANQUETE no centro (o fundo da nave), as cadeiras e os candelabros
TZ0, TZ1 = -11.5, -5.5
box('table_top', (0, 0.95, (TZ0 + TZ1) / 2), (1.5, 0.1, TZ1 - TZ0), M['wood'])
box('table_cloth', (0, 1.02, (TZ0 + TZ1) / 2), (1.6, 0.04, TZ1 - TZ0 + 0.1), M['cloth'])
for s in (1, -1):
    box(f'table_cloth_side{s}', (s * 0.8, 0.8, (TZ0 + TZ1) / 2), (0.03, 0.42, TZ1 - TZ0 + 0.1), M['cloth'])
for x in (-0.6, 0.6):
    for z in (TZ0 + 0.3, (TZ0 + TZ1) / 2, TZ1 - 0.3):
        box(f'table_leg{x}_{z}', (x, 0.45, z), (0.12, 0.9, 0.12), M['wood'])
for k in range(7):  # as manchas de sangue na toalha
    sphere(f'cloth_stain{k}', (random.uniform(-0.6, 0.6), 1.045, random.uniform(TZ0 + 0.4, TZ1 - 0.4)), (random.uniform(0.15, 0.35), 0.008, random.uniform(0.15, 0.5)), M['stain'], seg=8, rings=4)
col_box('table', (0, 0.6, (TZ0 + TZ1) / 2), (2.6, 1.2, TZ1 - TZ0 + 1.0))


def chair(name, x, z, rot):
    """cadeira de encosto alto e pontiagudo (gótica)"""
    box(f'{name}_seat', (x, 0.5, z), (0.55, 0.08, 0.55), M['wood'], rot)
    for dx in (-0.22, 0.22):
        for dz in (-0.22, 0.22):
            cx = x + dx * math.cos(rot) + dz * math.sin(rot)
            cz = z - dx * math.sin(rot) + dz * math.cos(rot)
            box(f'{name}_leg{dx}{dz}', (cx, 0.25, cz), (0.06, 0.5, 0.06), M['wood'], rot)
    bx, bz = x + 0.26 * math.sin(rot), z + 0.26 * math.cos(rot)
    poly_prism(f'{name}_back', [(-0.27, 0), (0.27, 0), (0.27, 1.0), (0.0, 1.45), (-0.27, 1.0)], 0.06, M['wood'], (bx, 0.54, bz), rot)


for k, z in enumerate([TZ0 + 0.8 + 1.15 * i for i in range(5)]):
    chair(f'chairL{k}', -1.2, z, math.pi / 2 + random.uniform(-0.15, 0.15))
    chair(f'chairR{k}', 1.2, z, -math.pi / 2 + random.uniform(-0.15, 0.15))
chair('chairHead', 0, TZ0 - 0.9, 0.0)  # a cabeceira (o lugar do Raziel)
chair('chairTipped', 2.6, -3.2, 1.1)  # uma derrubada


def candelabra(name, x, y, z, tall=1.8, arms=3):
    """candelabro de ferro com as velas acesas (a chama pisca)"""
    cyl(f'{name}_foot', (x, y, z), 0.2, 0.08, M['iron'], seg=8)
    cyl(f'{name}_stem', (x, y, z), 0.035, tall, M['iron'], seg=6)
    for j in range(arms):
        a = j / arms * TAU
        cx, cz = x + math.cos(a) * 0.18 * (arms > 1), z + math.sin(a) * 0.18 * (arms > 1)
        cyl(f'{name}_cup{j}', (cx, y + tall, cz), 0.05, 0.04, M['iron'], seg=6)
        hgt = random.uniform(0.15, 0.3)
        cyl(f'{name}_candle{j}', (cx, y + tall + 0.04, cz), 0.028, hgt, M['wax'], seg=6)
        sphere(f'FLICKER_{name}_flame{j}', (cx, y + tall + 0.08 + hgt, cz), (0.022, 0.05, 0.022), M['flame'], seg=6, rings=4)
    if arms > 1:
        box(f'{name}_arm', (x, y + tall - 0.03, z), (0.4, 0.03, 0.03), M['iron'])


for k, z in enumerate((TZ0 + 0.6, (TZ0 + TZ1) / 2, TZ1 - 0.6)):
    candelabra(f'tcand{k}', 0, 1.04, z, tall=0.45, arms=3)
for k, (x, z) in enumerate(((-2.0, TZ0 - 0.6), (2.0, TZ0 - 0.6), (-2.0, TZ1 + 0.6), (2.0, TZ1 + 0.6), (-4.0, Z0 + 3.9), (4.0, Z0 + 3.9))):
    candelabra(f'fcand{k}', x, 0.0 if z > Z0 + 4 else 1.0, z, tall=1.9, arms=1)
    col_cyl(f'fcand{k}', (x, 0, z), 0.25, 2.0) if z > Z0 + 4 else None
# taças e pratos na mesa
for k, z in enumerate([TZ0 + 0.9 + 1.15 * i for i in range(5)]):
    for s in (1, -1):
        cyl(f'plate{k}{s}', (s * 0.45, 1.045, z), 0.16, 0.02, M['gold'], seg=10)
        cyl(f'goblet{k}{s}', (s * 0.62, 1.045, z + 0.25), 0.04, 0.2, M['gold'], seg=8, r_top=0.07)

# ================================================================ a PORTA da frente TRANCADA: as folhas de madeira em ogiva, as ferragens,
# a tranca atravessada, as CORRENTES e o cadeado
door = ogive(4.0, 6.5)
poly_prism('door_frame', ogive(5.0, 7.2), 0.5, M['pillar'], (0, 0, Z1 - 0.05), 0.0)
poly_prism('door_wood', door, 0.3, M['wood'], (0, 0, Z1 - 0.32), 0.0)
for y in (1.2, 3.0, 4.8):
    box(f'door_band{y}', (0, y, Z1 - 0.5), (3.9, 0.14, 0.06), M['iron'])
box('door_seam', (0, 3.0, Z1 - 0.5), (0.06, 6.0, 0.06), M['iron'])
box('door_bar', (0, 2.6, Z1 - 0.62), (4.6, 0.25, 0.16), M['wood'])
for s in (1, -1):
    box(f'door_bracket{s}', (s * 2.0, 2.6, Z1 - 0.62), (0.2, 0.42, 0.22), M['iron'])
# as correntes cruzadas em X e o cadeado no meio
for s in (1, -1):
    for j in range(16):
        t = j / 15
        x, y = -s * 1.7 + s * 3.4 * t, 4.4 - 3.4 * t
        cyl(f'door_chain{s}_{j}', (x, y, Z1 - 0.72), 0.07, 0.03, M['iron'], seg=8, rot_x=math.pi / 2, rot_z=j * 0.8)
box('padlock', (0, 2.55, Z1 - 0.8), (0.32, 0.38, 0.14), M['iron'])
cyl('padlock_shackle', (0, 2.74, Z1 - 0.8), 0.11, 0.03, M['iron'], seg=10, rot_x=math.pi / 2)

# ================================================================ a fileira de ANZÓIS com correntes no corredor da esquerda (a "área dos anzóis")
box('hook_beam', (X0 + 0.5, 3.6, -2.0), (0.3, 0.3, 10.0), M['wood'])
for k in range(9):
    z = -6.4 + k * 1.1
    L = random.uniform(0.6, 1.4)
    for j in range(int(L / 0.12)):
        cyl(f'hook_chain{k}_{j}', (X0 + 0.5, 3.45 - j * 0.12, z), 0.04, 0.025, M['iron'], seg=6, rot_z=math.pi / 2 if j % 2 else 0.0, rot_x=math.pi / 2)
    yb = 3.45 - L
    for j in range(7):  # o gancho em J
        a = math.pi * j / 6
        box(f'hook{k}_{j}', (X0 + 0.5 + math.sin(a) * 0.12, yb - 0.12 + math.cos(a) * 0.12 * -1 - 0.05, z), (0.04, 0.07, 0.04), M['iron'], rot_z=a)

# ================================================================ o interior REVIRADO: bancos quebrados, entulho e as poças de sangue
for k, (x, z, r) in enumerate(((-8.2, 6.0, 0.4), (8.0, 2.0, -0.3), (-8.4, -3.0, 0.2), (8.3, 9.5, 0.6), (7.8, -9.0, -0.5))):
    box(f'pew{k}_seat', (x, 0.45, z), (0.5, 0.08, 2.6), M['wood'], r)
    box(f'pew{k}_back', (x + 0.25, 0.85, z), (0.08, 0.8, 2.6), M['wood'], r, rot_z=0.15)
    for dz in (-1.1, 1.1):
        box(f'pew{k}_leg{dz}', (x, 0.22, z + dz), (0.45, 0.44, 0.08), M['wood'], r)
box('pew_broken_a', (-7.6, 0.3, 11.0), (0.5, 0.08, 1.6), M['wood'], 0.9, rot_z=0.4)
box('pew_broken_b', (-7.2, 0.15, 11.8), (0.5, 0.3, 1.2), M['wood'], -0.6, rot_x=0.3)
for k in range(26):
    x = random.choice((-1, 1)) * random.uniform(7.2, 9.4)
    z = random.uniform(-14, 13)
    r = random.uniform(0.12, 0.45)
    sphere(f'rubble{k}', (x, r * 0.4, z), (r * 1.3, r * 0.6, r), M['rubble'], seg=6, rings=4)
for k, (x, z, r) in enumerate(((1.8, -1.0, 0.7), (-2.4, 4.5, 0.5), (0.6, -13.0, 0.9), (-1.0, 9.0, 0.4))):
    sphere(f'DECAL_pool{k}', (x, 0.005, z), (r, 0.004, r * 0.8), M['stain'], seg=10, rings=3)

# ================================================================ detalhes das CENAS DO EPISÓDIO (Hexatombe ep. 9, "Banho de Sangue", a luta na igreja):
# o RETÁBULO DOURADO do altar com o trono no alto e o arco embaixo (5h05), as ARANDELAS acesas nos pilares (6h10), os
# PAINÉIS ENTALHADOS nos pilares da entrada (4h55) e a ROSÁCEA vermelha com o símbolo de sangue escuro sobre a porta (6h50)
GOLD = material('gold_retable', '#c89a3a', 0.35, metal=0.85, emission='#6a3a08', strength=0.15)
RZ = Z0 + 0.35
box('retable_back', (0, 5.6, RZ), (5.6, 3.2, 0.3), GOLD)
box('retable_ledge', (0, 4.05, RZ + 0.55), (6.0, 0.25, 1.1), GOLD)
for x in (-2.6, -1.3, 0.0, 1.3, 2.6):
    cyl(f'retable_col{x}', (x, 4.2, RZ + 0.95), 0.1, 2.6, GOLD, seg=8)
box('retable_top', (0, 6.9, RZ + 0.5), (6.0, 0.3, 1.0), GOLD)
# o trono dourado no alto do retábulo
box('throne_seat', (0, 7.3, RZ + 0.5), (1.2, 0.2, 0.9), GOLD)
box('throne_back', (0, 8.2, RZ + 0.15), (1.2, 1.8, 0.15), GOLD)
for s in (1, -1):
    box(f'throne_arm{s}', (s * 0.6, 7.6, RZ + 0.5), (0.12, 0.5, 0.9), GOLD)
    cyl(f'throne_spire{s}', (s * 0.55, 9.1, RZ + 0.15), 0.06, 0.6, GOLD, seg=6, r_top=0.0)
# o arco escuro embaixo do retábulo (a passagem atrás do altar)
arch_ring('altar_arch', (0, 0, Z0 + 0.1), 2.4, 3.6, 0.5, 0.35, M['pillar'])
# as ARANDELAS nos pilares (virados para a nave), com a chama acesa
for s in (1, -1):
    for i, z in enumerate(PZ):
        if i % 2:
            continue
        bx = s * (PX - 0.55)
        box(f'sconce_plate{s}_{i}', (bx, 3.0, z), (0.12, 0.45, 0.3), M['iron'])
        cyl(f'sconce_cup{s}_{i}', (bx - s * 0.18, 3.05, z), 0.1, 0.12, M['iron'], seg=8, r_top=0.14)
        sphere(f'FLICKER_sconce{s}_{i}', (bx - s * 0.18, 3.28, z), (0.07, 0.14, 0.07), M['flame'], seg=8, rings=5)
# os PAINÉIS ENTALHADOS (molduras com nichos) na face dos pilares da entrada
for s in (1, -1):
    for i in (len(PZ) - 1, len(PZ) - 2):
        z = PZ[i]
        for k, y in enumerate((1.2, 2.6)):
            box(f'panel_frame{s}_{i}_{k}', (s * (PX - 0.5), y, z), (0.08, 1.1, 0.75), M['pillar'])
            box(f'panel_in{s}_{i}_{k}', (s * (PX - 0.54), y, z), (0.04, 0.85, 0.52), M['stone'])
# a ROSÁCEA vermelha sobre a porta com a CRUZ escura atravessada
RC = (0, 9.6, Z1 - 0.05)
cyl('rose_glass', RC, 2.0, 0.06, M['glass'], seg=28, rot_x=math.pi / 2)
cyl('rose_frame', (RC[0], RC[1], RC[2] - 0.04), 2.2, 0.1, M['pillar'], seg=28, rot_x=math.pi / 2)
for j in range(8):
    a = j / 8 * math.pi
    box(f'rose_spoke{j}', (RC[0], RC[1], RC[2] - 0.08), (4.0, 0.08, 0.06), M['iron'], rot_z=a)
blood_symbol('rose_symbol', RC[0], RC[1], RC[2] - 0.12, 1.1, M['iron'], depth=0.1)  # o símbolo escuro na rosácea

finalize(OUT)
