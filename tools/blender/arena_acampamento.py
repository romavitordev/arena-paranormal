"""
ACAMPAMENTO VARMINHO (Sinais do Outro Lado) — public/arenas/acampamento.glb
Wiki (Estação de Transmissão, Varminho/MG): ao lado de uma estação de TV abandonada, um acampamento de gente que espera
ser levada pelos alienígenas (Edimeia, Eriberto e Ludismila). A noite, a céu aberto, no meio do mato.
  - no centro, a FOGUEIRA (animada em código: configs.js → fires) com a clareira de terra batida, toras como bancos;
  - barracas de várias cores viradas para o fogo, cadeiras, mesa com rádio, placas de papelão escritas à mão
    ("ELES ESTÃO VINDO!", "NOS LEVEM JUNTO"...), um prato de satélite caseiro apontado para o céu e um varal de lâmpadas;
  - ao fundo, a VAN dos Cinco ("Chico Eletrônicos": escura, grafite verde neon com o alienígena de asas, antena
    parabólica e bagageiro no teto — arte conceitual da wiki) e a ESTAÇÃO DE TRANSMISSÃO (galpão escuro de chapa com a
    porta dupla de metal e o símbolo pichado, e a torre de treliça com as antenas e a luz vermelha no alto);
  - muitas árvores em volta (Nature Kit do Kenney, CC0).
Coordenadas do jogo: arena redonda, raio andável ~20 m; o fundo é -z.
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from arena_lib import *
from lib import material, TAU, hex_rgb
from kenney import put
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'acampamento.glb'
random.seed(51)  # AR0051, a placa da van
start()

R = 20.0
M = {
    'ground': material('ground_camp', '#1e2a1c', 1),
    'dirt': material('camp_dirt', '#ffffff', 1, alpha=0.99),
    'van': material('van_paint', '#16241c', 0.45),
    'van_dark': material('van_trim', '#0c0e0e', 0.6),
    'glass': material('van_glass', '#0a1418', 0.15),
    'tire': material('tire_rubber', '#121212', 0.9),
    'chrome': material('chrome_rim', '#9aa0a8', 0.3, metal=0.8),
    'head': material('headlight_glow', '#fff4c8', 0.3, emission='#fff0c0', strength=4),
    'tail': material('taillight_glow', '#ff2020', 0.3, emission='#ff2020', strength=2),
    'van_side': material('van_side', '#ffffff', 0.5, alpha=0.99),
    'shed': material('shed_metal', '#26262c', 0.8),
    'door': material('shed_door', '#5a5e68', 0.6),
    'tag': material('station_tag', '#ffffff', 0.9, alpha=0.99),
    'concrete': material('concrete_floor', '#6a6a70', 0.95),
    'steel': material('tower_steel', '#2a2a30', 0.5, metal=0.6),
    'dish': material('dish_white', '#c8ccd4', 0.4),
    'red_light': material('beacon_glow', '#ff1010', 0.3, emission='#ff1010', strength=6),
    'bulb': material('bulb_glow', '#ffd890', 0.3, emission='#ffcf7a', strength=5),
    'lantern': material('lantern_glow', '#ffc070', 0.3, emission='#ffb050', strength=5),
    'wire': material('wire_black', '#101010', 0.8),
    'wood': material('wood_plank', '#6a4a2e', 0.9),
    'cloth': material('tarp_blue', '#2a4a7a', 0.9),
    'chair': material('chair_canvas', '#3a5a3a', 0.9),
    'radio': material('radio_black', '#1a1a1c', 0.5),
    'foil': material('foil_silver', '#c8ccd0', 0.25, metal=0.9),
    'signs': [material(n, '#ffffff', 0.95) for n in ('sign_vindo', 'sign_levem', 'sign_sinal', 'sign_varminho')],
}


def beam(name, p0, p1, r, mat, seg=6):
    """Haste entre dois pontos do jogo (treliça da torre, tripé, postes)."""
    a, b = Vector(B(*p0)), Vector(B(*p1))
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    o.name = name
    o.data.materials.append(mat)
    return o


# ---------------- chão: mato escuro + a clareira de terra batida em volta da fogueira
cyl('GROUND_camp', (0, -0.25, 0), 80, 0.2, M['ground'], seg=48)
plane('DECAL_dirt', (0, 0.02, 0), (17, 17), M['dirt'], facing='up')

# ---------------- FOGUEIRA no centro (o fogo em si é animado no jogo) e toras como bancos em volta
put('nature', 'campfire_stones', (0, 0, 0), 0.3, 4.2)
put('nature', 'campfire_logs', (0, 0.05, 0), 0.0, 4.6)
col_cyl('fire', (0, 0, 0), 1.25, 1.2)
LOG_TINT = {'woodBark': hex_rgb('#3a2616'), 'woodInner': hex_rgb('#7a5a3a')}
for i, a in enumerate((0.5, 2.1, 3.9, 5.3)):
    x, z = math.sin(a) * 4.6, math.cos(a) * 4.6
    put('nature', 'log_large', (x, 0, z), a + math.pi / 2, 1.9, tint=LOG_TINT)
put('nature', 'log_stack', (-3.2, 0, 2.8), 0.6, 2.2, tint=LOG_TINT)
# o violão do Eriberto encostado numa tora (arte da recapitulação do ep. 2: ele toca na beira do fogo)
gx, gz = math.sin(2.1) * 4.6 + 0.6, math.cos(2.1) * 4.6 + 0.5
guitar = [sphere('gtr_body', (0, 0.32, 0), (0.3, 0.36, 0.1), M['wood'], seg=12, rings=8),
          sphere('gtr_body2', (0, 0.66, 0), (0.22, 0.24, 0.09), M['wood'], seg=12, rings=8),
          cyl('gtr_hole', (0, 0.5, 0.085), 0.07, 0.02, M['radio'], seg=10, rot_x=math.pi / 2),
          box('gtr_neck', (0, 1.1, 0), (0.07, 0.75, 0.05), M['radio']),
          box('gtr_head', (0, 1.55, 0), (0.1, 0.18, 0.04), M['radio'])]
g = join_objs(guitar, 'guitar')
rebase(g)
g.location = B(gx, 0, gz)
g.rotation_euler = (math.radians(-18), 0, 2.1)
# o telescópio da Ludismila (ela passa o tempo olhando as estrelas, à espera dos Alheios que levaram o pai)
tx, tz = -5.5, -6.5
for k in range(3):
    a = k / 3 * TAU
    beam(f'scope_leg{k}', (tx + math.sin(a) * 0.45, 0, tz + math.cos(a) * 0.45), (tx, 1.2, tz), 0.025, M['radio'])
beam('scope_tube', (tx - 0.25, 1.05, tz + 0.35), (tx + 0.3, 1.75, tz - 0.4), 0.09, M['dish'], seg=10)
col_cyl('scope', (tx, 0, tz), 0.5, 1.6)
plane('blanket', (tx + 1.2, 0.03, tz + 0.6), (1.8, 1.3), M['cloth'], rot_y=0.4, facing='up')

# ---------------- BARRACAS de várias cores viradas para o fogo (o fundo, -z, fica livre para ver a van e a estação)
TENT_COLORS = [('#c8a040', '#8a6a20'), ('#3a6a9a', '#24486a'), ('#a83a2a', '#6a2018'), ('#4a7a3a', '#2a4a22'), ('#d07a2a', '#8a4a14'), ('#6a5a8a', '#3e3460')]
tents = [(0.75, 12.5, 'tent_detailedOpen'), (1.6, 13.5, 'tent_detailedClosed'), (2.35, 12.8, 'tent_smallOpen'),
         (-0.8, 12.5, 'tent_detailedClosed'), (-1.65, 13.6, 'tent_detailedOpen'), (-2.4, 12.6, 'tent_smallOpen')]
for k, (a, r, kind) in enumerate(tents):
    x, z = math.sin(a) * r, math.cos(a) * r
    c, cd = TENT_COLORS[k]
    face = math.atan2(-x, -z)  # a porta da barraca para o fogo
    put('nature', kind, (x, 0, z), face + math.pi, 4.0, tint={'colorRed': hex_rgb(c), 'colorRedDark': hex_rgb(cd)})
    col_cyl(f'tent{k}', (x, 0, z), 1.55 if 'small' not in kind else 1.1, 2.2)
    # lampião aceso na porta
    lx, lz = x - math.sin(face) * -2.3, z - math.cos(face) * -2.3
    cyl(f'lantern_base{k}', (lx, 0, lz), 0.12, 0.08, M['radio'], seg=8)
    box(f'FLICKER_lantern{k}', (lx, 0.08, lz), (0.16, 0.24, 0.16), M['lantern'])

# ---------------- cadeiras de lona, mesa com o rádio e papéis, placas de papelão, prato de satélite caseiro
for k, (x, z, ry) in enumerate(((6.2, -3.0, -1.1), (-6.4, -2.2, 1.0), (5.0, 5.4, -2.4))):
    plastic_chair(f'chair{k}', (x, 0, z), M['chair'], ry)
table_square('table', (-6.8, 0, 5.6), M['wood'], M['radio'], size=1.1)
box('radio', (-6.8, 0.76, 5.5), (0.42, 0.24, 0.18), M['radio'])
beam('radio_antenna', (-6.65, 0.88, 5.5), (-6.4, 1.6, 5.4), 0.008, M['chrome'])
box('papers', (-7.05, 0.765, 5.8), (0.3, 0.01, 0.38), M['dish'], rot_y=0.3)
col_box('table', (-6.8, 0, 5.6), (1.2, 1.0, 1.2))
# placas em estacas (uma de cada lado, viradas para o centro)
for k, (a, r) in enumerate(((1.15, 16.5), (-1.2, 16.0), (2.75, 15.5), (-2.8, 15.8))):
    x, z = math.sin(a) * r, math.cos(a) * r
    face = math.atan2(-x, -z)
    beam(f'stake{k}', (x, 0, z), (x, 1.5, z), 0.05, M['wood'])
    plane(f'DECAL_sign{k}', (x - math.sin(face) * -0.06, 1.45, z - math.cos(face) * -0.06), (1.1, 1.1), M['signs'][k], rot_y=face)
    col_cyl(f'stake{k}', (x, 0, z), 0.3, 1.5)
# prato de satélite caseiro num tripé, apontado para o céu, coberto de papel-alumínio
sx, sz = 9.5, -8.5
for k in range(3):
    a = k / 3 * TAU
    beam(f'tripod{k}', (sx + math.sin(a) * 0.7, 0, sz + math.cos(a) * 0.7), (sx, 1.6, sz), 0.035, M['wood'])
dish = sphere('dish', (sx, 1.85, sz), (0.95, 0.2, 0.95), M['foil'], seg=16, rings=6)
dish.rotation_euler = (math.radians(30), 0, math.radians(20))
beam('dish_feed', (sx, 1.85, sz), (sx + 0.2, 2.6, sz + 0.25), 0.02, M['chrome'])
col_cyl('dish', (sx, 0, sz), 0.9, 2.2)

# ---------------- varal de lâmpadas entre dois postes (luz quente sobre um lado do acampamento)
p0, p1 = (-12.5, 0, -4.0), (-8.0, 0, -11.5)
for p in (p0, p1):
    beam(f'pole{p[0]}', p, (p[0], 3.4, p[2]), 0.07, M['wood'])
    col_cyl(f'pole{p[0]}', p, 0.25, 3.4)
N = 12
prev = None
for i in range(N + 1):
    t = i / N
    x = p0[0] + (p1[0] - p0[0]) * t
    z = p0[2] + (p1[2] - p0[2]) * t
    y = 3.3 - math.sin(t * math.pi) * 0.6
    if prev:
        beam(f'wire{i}', prev, (x, y, z), 0.012, M['wire'], seg=4)
    prev = (x, y, z)
    if 0 < i < N:
        sphere(f'FLICKER_bulb{i}' if i % 4 == 0 else f'bulb{i}', (x, y - 0.12, z), (0.09, 0.12, 0.09), M['bulb'], seg=8, rings=6)

# ---------------- a VAN dos Cinco ao fundo (montada à mão a partir da arte conceitual), de lado para o acampamento
VX, VZ, VR = -7.0, -24.5, 0.18
parts = []
L, Wd, Hb = 5.0, 2.0, 2.05
parts.append(box('van_body', (0.35, 0.55 + Hb / 2 - 0.15, 0), (L - 0.7, Hb - 0.3, Wd), M['van'], bevel=0.08))
parts.append(box('van_nose', (-L / 2 + 0.45, 0.55 + 0.55, 0), (0.9, 1.1, Wd), M['van'], bevel=0.08))
parts.append(box('van_windshield', (-L / 2 + 0.95, 0.55 + 1.45, 0), (0.12, 0.75, Wd - 0.2), M['glass'], rot_z=math.radians(-18)))
for s in (-1, 1):
    parts.append(box(f'van_win{s}', (-1.05, 0.55 + 1.5, s * (Wd / 2 + 0.005)), (1.1, 0.6, 0.02), M['glass']))
    parts.append(box(f'van_winb{s}', (1.9, 0.55 + 1.5, s * (Wd / 2 + 0.005)), (0.9, 0.55, 0.02), M['glass']))
parts.append(box('van_bumper_f', (-L / 2 + 0.02, 0.5, 0), (0.18, 0.22, Wd + 0.05), M['van_dark']))
parts.append(box('van_bumper_b', (L / 2 - 0.3, 0.5, 0), (0.18, 0.22, Wd + 0.05), M['van_dark']))
for s in (-1, 1):
    parts.append(box(f'van_head{s}', (-L / 2 - 0.03, 0.9, s * 0.68), (0.06, 0.2, 0.3), M['head']))
    parts.append(box(f'van_tail{s}', (L / 2 - 0.37, 1.0, s * 0.8), (0.06, 0.3, 0.16), M['tail']))
    for wx in (-1.45, 1.55):
        w = cyl(f'van_tire{s}{wx}', (wx, 0.42, s * (Wd / 2 - 0.12)), 0.42, 0.3, M['tire'], seg=14, rot_x=math.pi / 2)
        parts.append(w)
        parts.append(cyl(f'van_rim{s}{wx}', (wx, 0.42, s * (Wd / 2 + 0.03)), 0.22, 0.04, M['chrome'], seg=10, rot_x=math.pi / 2))
# bagageiro e a antena parabólica no teto
for s in (-1, 1):
    parts.append(box(f'van_rail{s}', (0.6, 0.55 + Hb - 0.05, s * 0.85), (3.4, 0.06, 0.06), M['van_dark']))
for k in range(4):
    parts.append(box(f'van_cross{k}', (-0.6 + k * 0.8, 0.55 + Hb - 0.05, 0), (0.06, 0.06, 1.76), M['van_dark']))
parts.append(cyl('van_dish_post', (1.6, 0.55 + Hb - 0.05, 0), 0.05, 0.55, M['van_dark'], seg=6))
vd = sphere('van_dish', (1.6, 0.55 + Hb + 0.6, 0), (0.55, 0.14, 0.55), M['dish'], seg=14, rings=5)
vd.rotation_euler = (math.radians(35), math.radians(-25), 0)
parts.append(vd)
# grafite nas duas laterais
for s in (-1, 1):
    d = plane(f'van_art{s}', (0.3, 1.25, s * (Wd / 2 + 0.03)), (4.4, 1.42), M['van_side'], rot_y=0 if s > 0 else math.pi)
    parts.append(d)
van = join_objs(parts, 'DECAL_van')
rebase(van)
van.location = B(VX, 0, VZ)
van.rotation_euler = (0, 0, VR)
col_box('van', (VX, 0, VZ), (5.4, 2.4, 2.6))

# ---------------- ESTAÇÃO DE TRANSMISSÃO: galpão de chapa escura com a porta dupla de metal e a pichação, torre de treliça
GX, GZ = 9.5, -27.0
box('OCC_shed', (GX, 0, GZ), (7.5, 3.4, 4.5), M['shed'])
box('shed_roof', (GX, 3.4, GZ), (7.9, 0.15, 4.9), M['steel'], rot_x=math.radians(3))
plane('DECAL_shed_door', (GX - 1.2, 1.15, GZ + 2.27), (1.9, 2.3), M['door'])
plane('DECAL_station_tag', (GX + 2.0, 1.9, GZ + 2.27), (2.2, 2.2), M['tag'])
col_box('shed', (GX, 0, GZ), (7.7, 3.6, 4.7))
TX, TZ, TH = 18.0, -31.0, 26.0
base_half, top_half = 2.4, 0.55
corners = [(-1, -1), (1, -1), (1, 1), (-1, 1)]


def leg_at(cx, cz, y):
    h = base_half + (top_half - base_half) * (y / TH)
    return (TX + cx * h, y, TZ + cz * h)


for k, (cx, cz) in enumerate(corners):
    beam(f'tower_leg{k}', leg_at(cx, cz, 0), leg_at(cx, cz, TH), 0.12, M['steel'])
    box(f'footing{k}', (TX + cx * base_half, 0, TZ + cz * base_half), (1.1, 0.9, 1.1), M['concrete'])
levels = [0.0, 3.2, 6.6, 10.2, 13.8, 17.2, 20.4, 23.4, TH]
for li in range(len(levels) - 1):
    y0, y1 = levels[li], levels[li + 1]
    for k in range(4):
        a, b2 = corners[k], corners[(k + 1) % 4]
        beam(f'brace{li}_{k}a', leg_at(*a, y0), leg_at(*b2, y1), 0.05, M['steel'], seg=4)
        beam(f'brace{li}_{k}b', leg_at(*b2, y0), leg_at(*a, y1), 0.05, M['steel'], seg=4)
        beam(f'ring{li}_{k}', leg_at(*a, y1), leg_at(*b2, y1), 0.05, M['steel'], seg=4)
for k, (y, ang) in enumerate(((15.5, 0.6), (19.5, -0.9), (22.0, 2.3))):
    hx = base_half + (top_half - base_half) * (y / TH)
    px, pz = TX + math.sin(ang) * (hx + 0.6), TZ + math.cos(ang) * (hx + 0.6)
    dsh = cyl(f'tower_dish{k}', (px, y, pz), 0.9, 0.25, M['dish'], seg=16, rot_x=math.pi / 2, rot_y=ang)
beam('mast', (TX, TH, TZ), (TX, TH + 3.5, TZ), 0.08, M['steel'])
sphere('FLICKER_beacon', (TX, TH + 3.6, TZ), (0.28, 0.28, 0.28), M['red_light'], seg=10, rings=8)
col_cyl('tower', (TX, 0, TZ), 3.4, TH)

# ---------------- MATO: árvores escuras e pinheiros em volta (algumas dentro do limite, com colisão), arbustos e pedras
GRASS_TINT = {'*': hex_rgb('#1e3a1a')}
TREES = ['tree_detailed_dark', 'tree_oak_dark', 'tree_fat_darkh', 'tree_tall_dark', 'tree_default_dark', 'tree_pineTallA_detailed',
         'tree_pineTallB_detailed', 'tree_pineRoundA', 'tree_pineRoundC', 'tree_cone_dark', 'tree_thin_dark', 'tree_simple_dark']
clear = [(VX, VZ, 5.0), (GX, GZ, 6.0), (TX, TZ, 6.5), (0, -40, 0)]
placed = []
for i in range(230):
    a = random.uniform(0, TAU)
    r = R + 1.5 + random.random() ** 0.8 * 36
    x, z = math.sin(a) * r, math.cos(a) * r
    if any(math.hypot(x - cx, z - cz) < cr for cx, cz, cr in clear):
        continue
    # a vista do fundo (van e estação) fica mais aberta perto do limite
    if z < -R and abs(x) < 24 and r < R + 14 and random.random() < 0.7:
        continue
    if any(math.hypot(x - px, z - pz) < 2.4 for px, pz in placed):
        continue
    placed.append((x, z))
    kind = random.choice(TREES)
    sc = random.uniform(6.5, 9.5) * (1.15 if 'pine' in kind else 1)
    put('nature', kind, (x, 0, z), random.uniform(0, TAU), sc)
    if r < R + 6:
        col_cyl(f'tree{i}', (x, 0, z), 0.7, 6)
for i in range(70):
    a = random.uniform(0, TAU)
    r = random.uniform(15.5, R + 6)
    x, z = math.sin(a) * r, math.cos(a) * r
    if any(math.hypot(x - cx, z - cz) < cr for cx, cz, cr in clear):
        continue
    put('nature', random.choice(['plant_bushLarge', 'plant_bushDetailed', 'plant_bush', 'grass_large', 'grass_leafsLarge']), (x, 0, z), random.uniform(0, TAU), random.uniform(3.0, 5.0), tint=GRASS_TINT)
for i in range(90):
    a = random.uniform(0, TAU)
    r = random.uniform(6.5, R)
    x, z = math.sin(a) * r, math.cos(a) * r
    put('nature', random.choice(['grass', 'grass_large', 'grass_leafs']), (x, 0, z), random.uniform(0, TAU), random.uniform(2.2, 3.4), tint=GRASS_TINT)
for i in range(12):
    a = random.uniform(0, TAU)
    r = random.uniform(R - 2, R + 8)
    put('nature', random.choice(['rock_largeA', 'rock_largeC', 'rock_tallB', 'stump_old', 'stump_oldTall', 'log']), (math.sin(a) * r, 0, math.cos(a) * r), random.uniform(0, TAU), random.uniform(2.5, 4))

finalize(OUT)
