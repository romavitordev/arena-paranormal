"""
A MARIONETE (invocação de Morte do Dante) — v2, esculpida (a técnica do Carniçal / Cristino).
Referências: wiki "A Marionete" (a miniatura de Calamidade e a "Marionete morta") e o texto da wiki.

Cânone usado aqui:
  - corpo esquelético e esticado, FLUTUANDO, misturado com fios amarrados e Lodo Preto escorrendo;
  - braços longos e retorcidos (galhos de osso com farpas), ERGUIDOS como se puxados por uma corda invisível;
  - uma grande FOICE FEITA DE OSSOS amarrada no braço direito — a única coisa que toca o chão;
  - mandíbula FORÇADA ABERTA por fios que se entrelaçam pelo crânio;
  - a do Dante: cabelo preto LONGO e um vestido escuro (azul-acinzentado) amarrado no corpo em TIRAS rasgadas;
  - estacas de osso espetadas nas costas e nos ombros; o Lodo com o brilho verde-água pingando das juntas;
  - pernas finas penduradas, pés descalços.

Não é um personagem com esqueleto: são PEÇAS RÍGIDAS penduradas em juntas (empties J_*) que o jogo anima em código
(src/combat/npcs.js → Marionette.pose). As juntas e os nomes são os mesmos da v1.
Coordenadas no espaço do jogo (x = esquerda do boneco, y = cima, z = frente), convertidas para o Blender por T().
"""
import bpy
import sys
import os
import math
import random
from mathutils import Vector

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, TAU
from npc_lib import T, rod, curve, ring, blob, spike, ribbon, joint, add, finish
from sculpt_lib import Sculpt, ridge, n3, shell_grid
import sculpt_lib

random.seed(13)
reset()

M = {
    'bone': material('bone_marionete', '#8a7a68', 0.8),
    'bone_dk': material('bone_dark_marionete', '#5a4c40', 0.85),
    'skull': material('skull_marionete', '#c4b8a4', 0.7),
    'tooth': material('tooth_marionete', '#ddd4bc', 0.5),
    'socket': material('socket_marionete', '#050405', 0.9),
    'rope': material('rope_marionete', '#8a7656', 0.9),
    'cloth': material('cloth_marionete', '#34485c', 0.95),
    'cloth2': material('cloth2_marionete', '#56708a', 0.95),
    'hair': material('hair_marionete', '#0b0a0d', 0.6),
    'lodo': material('lodo_marionete', '#06080a', 0.15, metal=0.3),
    'glow': material('glow_lodo_marionete', '#58d0b8', 0.4, emission='#58d0b8', strength=1.4),
    'blade': material('blade_marionete', '#b8a890', 0.55),
}


def TV(p):
    return T(*p)


def sc_chain(S, pts, radii, step=0.45):
    S.chain([TV(p) for p in pts], radii, step)


def sc_ell(S, c, r, neg=False):
    S.ell(TV(c), (r[0], r[2], r[1]), neg=neg)  # raios do jogo (x, y, z) → Blender (x, z→y, y→z)


def wobble_path(p0, p1, n, amp, seed):
    rnd = random.Random(seed)
    out = []
    for i in range(n + 1):
        t = i / n
        p = [p0[k] + (p1[k] - p0[k]) * t for k in range(3)]
        if 0 < i < n:
            p = [p[0] + rnd.uniform(-amp, amp), p[1], p[2] + rnd.uniform(-amp, amp)]
        out.append(tuple(p))
    return out


def taper(pts, r0, r1, r2=None):
    n = len(pts)
    return [r0 + (r1 - r0) * min(1, i / (n - 1) * 2) if r2 is None or i < n / 2 else r1 + (r2 - r1) * (i / (n - 1) * 2 - 1) for i in range(n)]


def grain(p):  # a textura de galho / osso rachado
    return 0.004 * (ridge(p.z * 60 + n3(p, 30) * 2, 2) - 0.4)


body = joint('J_body', (0, 0, 0))
chest = joint('J_chest', (0, 1.75, 0), body)

# ---------------- tronco: o corpo esquelético esticado (escultura), costelas saltadas, a pelve
Tr = Sculpt()
sc_chain(Tr, [(0, 0.05, -0.06), (0, -0.25, -0.08), (0, -0.55, -0.07), (0, -0.85, -0.04), (0, -0.98, -0.02)], [0.07, 0.06, 0.05, 0.055, 0.075])
sc_ell(Tr, (0, -0.2, 0.02), (0.17, 0.2, 0.12))  # a caixa torácica
sc_ell(Tr, (0, -0.48, 0.0), (0.12, 0.1, 0.09))  # o ventre afundado
sc_ell(Tr, (0, -0.95, -0.02), (0.16, 0.08, 0.1))  # a pelve
add(chest, 'torsoCore', Tr.mesh(res=0.012, smooth=3, disp=grain, target=1400), M['bone_dk'])
for i in range(5):
    y = -0.08 - i * 0.085
    rx = 0.19 - i * 0.012
    for s in (1, -1):
        rib = curve((s * 0.03, y, -0.09), (s * rx * 1.12, y - 0.02, -0.0), (s * 0.06, y - 0.07, 0.15), 9, jitter=0.006)
        add(chest, f'rib{i}{s}', rod(rib, [0.02, 0.013], seg=6), M['bone'])
add(chest, 'sternum', rod([(0, -0.03, 0.15), (0.01, -0.22, 0.16), (0, -0.42, 0.15)], [0.028, 0.02], seg=6), M['bone'])
yoke = curve((-0.31, 0.0, -0.01), (0, 0.08, 0.02), (0.31, 0.0, -0.01), 9, jitter=0.01)
add(chest, 'yoke', rod(yoke, 0.04, seg=7, wobble=0.1), M['bone'])

# ---------------- o vestido amarrado: as faixas largas no peito e a SAIA de tiras rasgadas (casca com espessura)
for k in range(3):
    y = -0.16 - k * 0.12
    pts = []
    for i in range(17):
        a = -math.pi * 0.95 + i / 16 * math.pi * 1.9
        pts.append(TV((math.sin(a) * (0.235 - k * 0.012), y + math.sin(i * 1.7) * 0.025, math.cos(a) * 0.17)))
    add(chest, f'band{k}', sculpt_lib.rod(pts, 0.05, 6, flat=(lambda q: q - TV((0, y, 0)), 0.3)), M['cloth2'] if k % 2 else M['cloth'])
rnd = random.Random(5)


def skirt_strip(a0, a1, top_y, length, r0, r1, seed):
    """uma tira de pano caindo da cintura: larga em cima, rasgada e desencontrada na barra"""
    rr = random.Random(seed)
    rows = []
    for i in range(9):
        v = i / 8
        row = []
        for j in range(5):
            u = j / 4
            a = a0 + (a1 - a0) * u
            ln = length * (1 - 0.25 * rr.random() * v)
            r = r0 + (r1 - r0) * v ** 0.8 + 0.03 * math.sin(a * 7 + v * 4)
            y = top_y - ln * v - 0.08 * v * math.sin(u * math.pi) * rr.random()
            row.append(TV((math.sin(a) * r, y, math.cos(a) * r * 0.85)))
        rows.append(row)
    return shell_grid(rows, 0.012)


n_str = 18
for i in range(n_str):
    a = i / n_str * TAU + rnd.uniform(-0.08, 0.08)
    w = TAU / n_str * rnd.uniform(0.9, 1.4)
    add(chest, f'skirt{i}', skirt_strip(a - w / 2, a + w / 2, -0.55 + rnd.uniform(-0.03, 0.03), rnd.uniform(0.8, 1.2), 0.2, rnd.uniform(0.42, 0.58), i), M['cloth'] if i % 3 else M['cloth2'])
# os trapos caindo dos ombros e as tiras soltas pelo corpo
for s in (1, -1):
    for k in range(2):
        x = s * (0.12 + k * 0.1)
        add(chest, f'rag{s}{k}', sculpt_lib.rod([TV(p) for p in curve((x, 0.03, 0.06), (x + s * 0.03, -0.3, 0.12), (x, -0.62 - k * 0.15, 0.1), 7)], taper(range(7), 0.05, 0.045, 0.02), 6, flat=(lambda q: Vector((0, -1, 0)), 0.25)), M['cloth2'])

# ---------------- ESTACAS de osso espetadas nas costas e nos ombros (a silhueta de espinhos da HQ)
for k, (bx, by, bz, tx, ty, tz) in enumerate([
    (0.08, -0.02, -0.1, 0.25, 0.7, -0.5), (-0.1, -0.05, -0.1, -0.22, 0.8, -0.42), (0.0, -0.12, -0.12, 0.06, 0.9, -0.55),
    (0.22, -0.02, -0.06, 0.62, 0.5, -0.35), (-0.22, -0.04, -0.06, -0.58, 0.6, -0.42), (0.05, -0.25, -0.12, -0.1, 0.45, -0.72),
    (0.16, -0.35, 0.1, 0.42, -0.1, 0.42), (-0.14, -0.3, 0.12, -0.4, 0.0, 0.4)]):
    add(chest, f'stake{k}', spike((bx, by, bz), (tx, ty, tz), 0.038, seg=7), M['bone'])
    add(chest, f'stakeWrap{k}', ring((bx + (tx - bx) * 0.14, by + (ty - by) * 0.14, bz + (tz - bz) * 0.14), (tx - bx, ty - by, tz - bz), 0.042, 0.012), M['rope'])

# ---------------- Lodo Preto escorrendo (gotas alongadas) + o brilho verde-água
drips = [(0.12, -0.18, 0.16), (-0.15, -0.3, 0.13), (0.05, -0.5, 0.16), (-0.06, -0.02, 0.1), (0.2, -0.08, 0.07), (-0.22, -0.45, 0.03), (0.0, -0.75, 0.12)]
for k, p in enumerate(drips):
    L = Sculpt()
    sc_chain(L, [p, (p[0], p[1] - 0.06, p[2] + 0.005), (p[0], p[1] - 0.14, p[2] + 0.01)], [0.028, 0.02, 0.012], step=0.5)
    sc_ell(L, (p[0], p[1] - 0.15, p[2] + 0.01), (0.02, 0.025, 0.02))
    add(chest, f'lodo{k}', L.mesh(res=0.006, smooth=2, target=200), M['lodo'])
    add(chest, f'lodoGlow{k}', blob((p[0] + 0.01, p[1] - 0.03, p[2] + 0.02), (0.014, 0.03, 0.012), 6, 4), M['glow'])

# ---------------- cabeça: o CRÂNIO esculpido caído para a frente, a mandíbula forçada aberta, o cabelo preto longo
neck = joint('J_neck', (0, 0.06, 0.14), chest)
add(neck, 'neckBones', rod([(0, -0.02, -0.04), (0, 0.06, 0.0), (0, 0.11, 0.02)], 0.034, seg=7), M['bone'])
SK = (0, 0.21, 0.04)
Sk = Sculpt()
sc_ell(Sk, (0, 0.24, 0.0), (0.14, 0.14, 0.16))  # a calota
sc_ell(Sk, (0, 0.17, 0.08), (0.11, 0.09, 0.1))  # a face
for s in (1, -1):
    sc_ell(Sk, (s * 0.085, 0.13, 0.13), (0.04, 0.03, 0.04))  # as maçãs
sc_ell(Sk, (0, 0.21, 0.18), (0.12, 0.025, 0.03))  # o arco da sobrancelha
for s in (1, -1):
    sc_ell(Sk, (s * 0.055, 0.17, 0.2), (0.04, 0.035, 0.05), neg=True)  # as órbitas fundas
sc_ell(Sk, (0, 0.12, 0.2), (0.016, 0.022, 0.04), neg=True)  # o nariz
add(neck, 'skull', Sk.mesh(res=0.007, smooth=3, disp=lambda p: 0.0025 * n3(p, 40), target=1800), M['skull'])
for s in (1, -1):
    add(neck, f'eye{s}', blob((s * 0.055, 0.17, 0.165), (0.036, 0.032, 0.02), 10, 8), M['socket'])
    add(neck, f'eyeGlow{s}', blob((s * 0.055, 0.17, 0.18), (0.008, 0.008, 0.006), 6, 4), M['glow'])
for i in range(8):  # dentes de cima
    x = -0.07 + i * 0.02
    add(neck, f'toothU{i}', spike((x, 0.09, 0.17 - abs(x) * 0.5), (x, 0.045, 0.175 - abs(x) * 0.5), 0.012, seg=4), M['tooth'])
# os fios entrelaçados pelo crânio
for k, ax in enumerate([(0, 1, 0.2), (1, 0.2, 0), (0.3, 0.6, 1), (-0.4, 0.5, 1), (0.8, 1, -0.3)]):
    add(neck, f'skullString{k}', ring(SK, ax, 0.168, 0.006, seg=22), M['rope'])

jaw = joint('J_jaw', (0, 0.1, 0.0), neck)
Jw = Sculpt()
for s in (1, -1):
    sc_chain(Jw, [(s * 0.1, 0.0, -0.01), (s * 0.09, -0.1, 0.06), (s * 0.03, -0.16, 0.16)], [0.026, 0.022, 0.02], step=0.5)
sc_ell(Jw, (0, -0.165, 0.17), (0.045, 0.028, 0.035))
add(jaw, 'mandible', Jw.mesh(res=0.006, smooth=3, target=700), M['skull'])
for i in range(7):  # dentes de baixo (abertos)
    x = -0.06 + i * 0.02
    add(jaw, f'toothL{i}', spike((x, -0.15 + abs(x) * 0.4, 0.165 - abs(x) * 0.6), (x, -0.105 + abs(x) * 0.4, 0.17 - abs(x) * 0.6), 0.011, seg=4), M['tooth'])
for s in (1, -1):  # os fios que FORÇAM a mandíbula aberta
    for k in range(2):
        add(jaw, f'jawString{s}{k}', rod([(s * (0.06 + k * 0.03), 0.12, 0.1 - k * 0.04), (s * (0.03 + k * 0.03), -0.15, 0.16 - k * 0.04)], 0.005, seg=4), M['rope'])

hair = joint('J_hair', (0, 0.28, -0.02), neck)
Hr = Sculpt()
sc_ell(Hr, (0, -0.02, -0.02), (0.17, 0.11, 0.17))  # por cima da calota
for i in range(14):  # as mechas longas caindo pelas costas e pelos lados (a frente livre)
    a = math.pi * 0.32 + i / 13 * math.pi * 1.36
    x0, z0 = math.sin(a) * 0.15, math.cos(a) * 0.14
    ln = rnd.uniform(0.9, 1.35)
    pts = [(x0, -0.03, z0), (x0 * 1.25 + rnd.uniform(-0.04, 0.04), -ln * 0.35, z0 * 1.3), (x0 * 1.2 + rnd.uniform(-0.06, 0.06), -ln * 0.7, z0 * 1.2),
           (x0 * 1.05 + rnd.uniform(-0.08, 0.08), -ln, z0 * 1.05 + rnd.uniform(-0.05, 0.05))]
    sc_chain(Hr, pts, [0.06, 0.055, 0.04, 0.012], step=0.5)


def hair_strands(p):
    return 0.005 * (ridge(math.atan2(p.x, p.y) * 30 + n3(p, 20), 2) - 0.4)


add(hair, 'hairMass', Hr.mesh(res=0.01, smooth=3, disp=hair_strands, target=2600), M['hair'])


# ---------------- braços longos e retorcidos: GALHOS de osso (escultura com nós), farpas, faixas de pano e fios
def arm(side, name):
    s = side
    sh = joint(f'J_sh{name}', (s * 0.3, 0.02, 0), chest)
    U = Sculpt()
    up = wobble_path((0, 0.0, 0), (s * 0.01, -0.8, 0.0), 8, 0.02, 11 + s)
    sc_chain(U, up, [0.07] + [0.04 + 0.01 * ((i * 7) % 3) for i in range(7)] + [0.05], step=0.5)
    sc_chain(U, [(p[0] + s * 0.035, p[1], p[2] + 0.02) for p in up[1:-1]], 0.022, step=0.5)  # o galho torcido junto
    add(sh, 'upper', U.mesh(res=0.009, smooth=3, disp=grain, target=900), M['bone'])
    for k, y in enumerate((-0.15, -0.45, -0.7)):
        add(sh, f'wrapU{k}', ring((s * 0.012, y, 0.01), (0, 1, 0.1 * k), 0.058, 0.016), M['cloth'] if k % 2 else M['rope'])
    for k in range(3):  # as farpas de osso saindo do galho
        y = -0.2 - k * 0.22
        add(sh, f'barbU{k}', spike((s * 0.03, y, 0), (s * 0.13, y + 0.08, -0.04 + 0.05 * k), 0.016, seg=5), M['bone'])
    add(sh, 'rag', sculpt_lib.rod([TV(p) for p in curve((s * 0.03, -0.3, 0.05), (s * 0.1, -0.55, 0.07), (s * 0.05, -0.92, 0.06), 7)], taper(range(7), 0.05, 0.04, 0.015), 6, flat=(lambda q: Vector((0, -1, 0)), 0.25)), M['cloth2'])
    el = joint(f'J_el{name}', (0, -0.82, 0), sh)
    Fo = Sculpt()
    fore = wobble_path((0, 0.02, 0), (0, -0.86, 0.0), 8, 0.018, 21 + s)
    sc_chain(Fo, fore, [0.06] + [0.034 + 0.008 * ((i * 5) % 3) for i in range(7)] + [0.03], step=0.5)
    add(el, 'fore', Fo.mesh(res=0.008, smooth=3, disp=grain, target=800), M['bone'])
    for k, y in enumerate((-0.12, -0.6)):
        add(el, f'wrapF{k}', ring((0, y, 0), (0, 1, 0), 0.046, 0.014), M['cloth'])
    for k in range(3):
        y = -0.2 - k * 0.2
        add(el, f'spur{k}', spike((s * 0.02, y, 0), (s * 0.1, y + 0.07, -0.02), 0.014, seg=4), M['bone'])
    for k, (y, ln) in enumerate(((-0.35, 0.22), (-0.7, 0.3))):  # pingentes pendurados por fios
        add(el, f'thread{k}', rod([(0, y, 0.03), (0, y - ln, 0.05)], 0.004, seg=3), M['rope'])
        add(el, f'charm{k}', spike((0, y - ln, 0.05), (0, y - ln - 0.08, 0.05), 0.02, seg=3), M['tooth'])
        add(el, f'charmGlow{k}', blob((0, y - ln - 0.02, 0.06), (0.008, 0.012, 0.008), 5, 4), M['glow'])
    hand = joint(f'J_hand{name}', (0, -0.86, 0), el)
    add(hand, 'palm', blob((0, -0.03, 0.01), (0.05, 0.055, 0.032), 8, 6), M['bone'])
    return sh, el, hand


shL, elL, handL = arm(1, 'L')
shR, elR, handR = arm(-1, 'R')
for i in range(5):  # a garra: dedos longos de osso, curvados
    a = (i - 2) * 0.32
    base = (math.sin(a) * 0.04, -0.06, 0.02 + math.cos(a) * 0.01)
    mid = (math.sin(a) * 0.12, -0.22, 0.08)
    tip = (math.sin(a) * 0.15, -0.34, 0.21)
    add(handL, f'finger{i}', rod(curve(base, mid, tip, 6), [0.014, 0.004], seg=5), M['bone'])

# ---------------- a FOICE DE OSSOS: o cabo de ossos amarrado ao antebraço e a LÂMINA larga em meia-lua até o chão
shaft = [(0, 0.55 - i * 0.12, 0.03) for i in range(10)]
Sh = Sculpt()
sc_chain(Sh, shaft, 0.036, step=0.5)
for k in range(0, 10, 2):  # os nós das vértebras
    sc_ell(Sh, shaft[k], (0.05, 0.035, 0.05))
add(handR, 'shaft', Sh.mesh(res=0.008, smooth=3, disp=grain, target=900), M['bone'])
for k in range(5):
    y = 0.45 - k * 0.2
    add(handR, f'shaftSpike{k}', spike((-0.02, y, 0.03), (-0.14, y + 0.06, 0.02 + (k % 2) * 0.05), 0.018, seg=4), M['bone'])
for k, y in enumerate((0.42, 0.15, -0.3)):
    add(handR, f'shaftWrap{k}', ring((0, y, 0.03), (0, 1, 0), 0.055, 0.014), M['rope'])
S = -1  # a lâmina abre para fora (direita do boneco = −x)


def blade_pt(u, v):
    # v: do cabo (0) à ponta (1); u: do dorso (0) ao fio (1). A meia-lua desce do braço até tocar o chão
    p0, p1, p2 = Vector((0, -0.55, 0.03)), Vector((S * 0.8, -0.95, 0.25)), Vector((S * 0.6, -2.18, 0.58))
    q = p0 * (1 - v) ** 2 + p1 * 2 * (1 - v) * v + p2 * v * v
    d = (p1 - p0) * 2 * (1 - v) + (p2 - p1) * 2 * v
    inward = Vector((-d.y, d.x, 0)).normalized() * S  # para dentro da curva
    w = 0.03 + 0.2 * math.sin(math.pi * min(1.0, v * 1.12)) ** 0.8
    return TV(tuple(q + inward * w * u))


blade_rows = [[blade_pt(j / 4, i / 22) for j in range(5)] for i in range(23)]
add(handR, 'blade', shell_grid(blade_rows, 0.03), M['blade'])
spineB = [tuple(blade_pt(0, i / 14)) for i in range(15)]
Bs = Sculpt()
for k, p in enumerate(spineB):  # o dorso de "vértebras" (feita de ossos)
    Bs.ell(p, (0.045 - 0.002 * k, 0.045 - 0.002 * k, 0.04 - 0.002 * k))
add(handR, 'bladeBack', Bs.mesh(res=0.008, smooth=2, disp=grain, target=900), M['bone'])
for k in range(3, 14, 3):  # farpas no dorso
    p = Vector(spineB[k])
    add(handR, f'bladeBarb{k}', spike(tuple(Vector((p.x, p.z, -p.y))), tuple(Vector((p.x, p.z, -p.y)) + Vector((S * 0.12, 0.06, -0.03))), 0.016, seg=4), M['bone'])
add(handR, 'bladeLodo', blob((S * 0.3, -0.8, 0.15), (0.03, 0.09, 0.03), 8, 8), M['lodo'])
add(handR, 'bladeGlow', blob((S * 0.31, -0.84, 0.17), (0.01, 0.03, 0.01), 6, 4), M['glow'])

# ---------------- pernas finas penduradas, pés descalços em ponta
for s, name in ((1, 'L'), (-1, 'R')):
    hip = joint(f'J_hip{name}', (s * 0.1, -0.98, 0), chest)
    Th = Sculpt()
    sc_chain(Th, [(0, 0, 0), (s * 0.01, -0.3, 0.02), (0, -0.62, 0.03)], [0.045, 0.032, 0.036], step=0.5)
    add(hip, 'thigh', Th.mesh(res=0.008, smooth=3, disp=grain, target=500), M['bone'])
    add(hip, 'thighWrap', ring((0, -0.25, 0.01), (0, 1, 0), 0.044, 0.014), M['cloth'])
    knee = joint(f'J_knee{name}', (0, -0.64, 0.03), hip)
    Sn = Sculpt()
    sc_chain(Sn, [(0, 0, 0), (0, -0.35, -0.01), (0, -0.68, 0)], [0.036, 0.024, 0.02], step=0.5)
    sc_ell(Sn, (0, -0.72, 0.05), (0.03, 0.03, 0.09))  # o pé esticado em ponta
    add(knee, 'shin', Sn.mesh(res=0.007, smooth=3, disp=grain, target=500), M['bone'])

finish()

out = sys.argv[sys.argv.index('--') + 1]
export_glb(out)
