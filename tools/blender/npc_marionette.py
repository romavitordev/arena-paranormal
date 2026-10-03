"""
A MARIONETE (invocação de Morte do Dante) — referências em "Referencias visuais/Personagens/A marionete":
a marionete.webp / a marionete morta.webp (HQ), marionete irl.png (versão realista) e o texto da wiki.

Cânone usado aqui:
  - corpo esquelético e esticado, FLUTUANDO, misturado com fios amarrados e Lodo Preto escorrendo;
  - braços longos e retorcidos, ERGUIDOS como se puxados por uma corda invisível (sem cruzeta visível);
  - uma grande FOICE FEITA DE OSSOS amarrada no braço direito — a única coisa que toca o chão;
  - mandíbula FORÇADA ABERTA por fios que se entrelaçam pelo crânio;
  - a do Dante: cabelo preto longo e um vestido escuro amarrado no corpo;
  - (irl/HQ) estacas de madeira espetadas nas costas, panos rasgados, pingentes pendurados por fios.

Não é um personagem com esqueleto: são PEÇAS RÍGIDAS penduradas em juntas (empties J_*) que o jogo anima em código
(src/combat/npcs.js → Marionette.pose). Coordenadas escritas no espaço do jogo (x = esquerda do boneco, y = cima,
z = frente) e convertidas para o Blender (Z para cima, frente −Y) por T().
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

random.seed(13)
reset()


# ---------------------------------------------------------------- materiais
M = {
    'bone': material('bone_marionete', '#4a4038', 0.8),
    'skull': material('skull_marionete', '#a29a8c', 0.7),
    'tooth': material('tooth_marionete', '#cfc6b0', 0.5),
    'socket': material('socket_marionete', '#050405', 0.9),
    'rope': material('rope_marionete', '#7d6a4e', 0.9),
    'cloth': material('cloth_marionete', '#212833', 0.95),
    'cloth2': material('cloth2_marionete', '#34414f', 0.95),
    'hair': material('hair_marionete', '#0b0a0d', 0.6),
    'lodo': material('lodo_marionete', '#06080a', 0.15, metal=0.3),
    'glow': material('glow_lodo_marionete', '#58d0b8', 0.4, emission='#58d0b8', strength=1.2),
    'blade': material('blade_marionete', '#7a7266', 0.5),
}


body = joint('J_body', (0, 0, 0))
chest = joint('J_chest', (0, 1.75, 0), body)

# ---------------- tronco: espinha retorcida, costelas, esterno, "travessa" dos ombros, pelve
spine = [(random.uniform(-0.01, 0.01), 0.06 - i * 0.1, -0.05 - math.sin(i / 10 * math.pi) * 0.05) for i in range(11)]
add(chest, 'spine', rod(spine, [0.045, 0.035], seg=8, wobble=0.08), M['bone'])
for i, p in enumerate(spine[1:-1]):
    if i % 2 == 0:
        add(chest, f'vert{i}', blob(p, (0.05, 0.03, 0.045), 8, 6), M['bone'])
for i in range(5):
    y = -0.1 - i * 0.11
    rx = 0.2 - i * 0.013
    for s in (1, -1):
        rib = curve((s * 0.03, y, -0.09), (s * rx * 1.15, y - 0.02, -0.02), (s * 0.06, y - 0.08, 0.14), 9, jitter=0.006)
        add(chest, f'rib{i}{s}', rod(rib, [0.017, 0.012], seg=6), M['bone'])
add(chest, 'sternum', rod([(0, -0.04, 0.15), (0.01, -0.25, 0.155), (0, -0.48, 0.14)], [0.025, 0.018], seg=6), M['bone'])
yoke = curve((-0.3, 0.0, -0.01), (0, 0.1, 0.02), (0.3, 0.0, -0.01), 9, jitter=0.01)
add(chest, 'yoke', rod(yoke, 0.034, seg=7, wobble=0.1), M['bone'])
add(chest, 'pelvis', blob((0, -0.98, -0.02), (0.15, 0.07, 0.1), 12, 8), M['bone'])
for k, (p, ax) in enumerate([((0, -0.3, -0.07), (0, 1, 0)), ((0, -0.62, -0.08), (0, 1, 0)), ((0.2, 0.01, 0), (1, 0.1, 0)), ((-0.2, 0.01, 0), (1, -0.1, 0))]):
    add(chest, f'wrapT{k}', ring(p, ax, 0.06), M['rope'])

# ---------------- vestido escuro amarrado no corpo: faixas no peito + saia rasgada em tiras
for k in range(3):
    y = -0.2 - k * 0.13
    pts = []
    for i in range(15):
        a = -math.pi * 0.95 + i / 14 * math.pi * 1.9
        pts.append((math.sin(a) * (0.23 - k * 0.012), y + math.sin(i * 1.7) * 0.02, math.cos(a) * 0.19))
    add(chest, f'band{k}', ribbon(pts, [0.09] * 15, normal=(0, 1, 0)), M['cloth2'])
for i in range(16):
    a = i / 16 * TAU + random.uniform(-0.1, 0.1)
    top = (math.sin(a) * 0.17, -0.58, math.cos(a) * 0.14)
    length = random.uniform(0.75, 1.1)
    bot = (math.sin(a) * random.uniform(0.38, 0.52), -0.58 - length, math.cos(a) * random.uniform(0.3, 0.45))
    mid = ((top[0] + bot[0]) / 2 + random.uniform(-0.04, 0.04), (top[1] + bot[1]) / 2, (top[2] + bot[2]) / 2)
    add(chest, f'skirt{i}', ribbon(curve(top, mid, bot, 6), random.uniform(0.15, 0.22), normal=(math.sin(a), 0, math.cos(a))), M['cloth'] if i % 3 else M['cloth2'])
# trapos pendurados dos ombros
for s in (1, -1):
    for k in range(2):
        x = s * (0.12 + k * 0.1)
        add(chest, f'rag{s}{k}', ribbon(curve((x, 0.02, 0.05), (x + s * 0.02, -0.25, 0.1), (x, -0.55 - k * 0.15, 0.08), 6), 0.08, normal=(0, 0, 1)), M['cloth2'])

# ---------------- estacas de madeira espetadas nas costas (irl / HQ)
for k, (bx, by, bz, tx, ty, tz) in enumerate([
    (0.08, -0.02, -0.1, 0.25, 0.75, -0.55), (-0.1, -0.05, -0.1, -0.2, 0.85, -0.45), (0.0, -0.12, -0.12, 0.06, 0.95, -0.6),
    (0.2, -0.05, -0.08, 0.6, 0.55, -0.4), (-0.2, -0.08, -0.08, -0.55, 0.65, -0.5), (0.05, -0.25, -0.12, -0.1, 0.5, -0.75)]):
    add(chest, f'stake{k}', spike((bx, by, bz), (tx, ty, tz), 0.03, seg=6), M['bone'])
    add(chest, f'stakeWrap{k}', ring((bx + (tx - bx) * 0.12, by + (ty - by) * 0.12, bz + (tz - bz) * 0.12), (tx - bx, ty - by, tz - bz), 0.035, 0.01), M['rope'])

# ---------------- Lodo Preto escorrendo (gotas alongadas) + brilho verde-água do Lodo
drips = [(0.12, -0.18, 0.15), (-0.15, -0.3, 0.12), (0.05, -0.55, 0.15), (-0.06, -0.02, 0.08), (0.2, -0.08, 0.06), (-0.22, -0.45, 0.02)]
for k, p in enumerate(drips):
    add(chest, f'lodo{k}', blob((p[0], p[1] - 0.05, p[2]), (0.03, 0.08, 0.03), 8, 8), M['lodo'])
    add(chest, f'lodoGlow{k}', blob((p[0] + 0.01, p[1] - 0.02, p[2] + 0.02), (0.012, 0.025, 0.01), 6, 4), M['glow'])

# ---------------- cabeça: crânio caído para a frente, mandíbula forçada aberta por fios, cabelo preto longo
neck = joint('J_neck', (0, 0.06, 0.14), chest)
add(neck, 'neckBones', rod([(0, -0.02, -0.04), (0, 0.06, 0.0), (0, 0.11, 0.02)], 0.032, seg=7), M['bone'])
SK = (0, 0.21, 0.04)  # centro do crânio
add(neck, 'skull', blob(SK, (0.15, 0.16, 0.17), 16, 12), M['skull'])
add(neck, 'brow', rod(curve((0.12, 0.2, 0.15), (0, 0.24, 0.22), (-0.12, 0.2, 0.15), 7), 0.025, seg=6), M['skull'])
for s in (1, -1):
    add(neck, f'eye{s}', blob((s * 0.058, 0.18, 0.18), (0.042, 0.04, 0.03), 10, 8), M['socket'])
    add(neck, f'cheek{s}', blob((s * 0.1, 0.12, 0.13), (0.035, 0.03, 0.04), 8, 6), M['skull'])
add(neck, 'nose', spike((0, 0.15, 0.2), (0, 0.11, 0.205), 0.018, seg=3), M['socket'])
for i in range(8):  # dentes de cima
    x = -0.07 + i * 0.02
    add(neck, f'toothU{i}', spike((x, 0.085, 0.165 - abs(x) * 0.5), (x, 0.045, 0.17 - abs(x) * 0.5), 0.011, seg=4), M['tooth'])
# fios entrelaçados pelo crânio (vários ângulos)
for k, ax in enumerate([(0, 1, 0.2), (1, 0.2, 0), (0.3, 0.6, 1), (-0.4, 0.5, 1), (0.8, 1, -0.3)]):
    add(neck, f'skullString{k}', ring(SK, ax, 0.165, 0.007, seg=20), M['rope'])

jaw = joint('J_jaw', (0, 0.1, 0.0), neck)
for s in (1, -1):
    add(jaw, f'mandible{s}', rod(curve((s * 0.1, 0.0, -0.01), (s * 0.09, -0.11, 0.06), (s * 0.03, -0.16, 0.16), 7), [0.022, 0.018], seg=6), M['skull'])
add(jaw, 'chin', blob((0, -0.165, 0.17), (0.04, 0.025, 0.03), 8, 6), M['skull'])
for i in range(7):  # dentes de baixo (abertos)
    x = -0.06 + i * 0.02
    add(jaw, f'toothL{i}', spike((x, -0.15 + abs(x) * 0.4, 0.16 - abs(x) * 0.6), (x, -0.11 + abs(x) * 0.4, 0.165 - abs(x) * 0.6), 0.01, seg=4), M['tooth'])
# fios que FORÇAM a mandíbula aberta (do crânio até o queixo, esticados)
for s in (1, -1):
    for k in range(2):
        add(jaw, f'jawString{s}{k}', rod([(s * (0.06 + k * 0.03), 0.12, 0.1 - k * 0.04), (s * (0.03 + k * 0.03), -0.15, 0.15 - k * 0.04)], 0.005, seg=4), M['rope'])

hair = joint('J_hair', (0, 0.28, -0.02), neck)
add(hair, 'hairCap', blob((0, -0.05, 0.01), (0.165, 0.12, 0.17), 14, 8), M['hair'])
for i in range(16):
    a = math.pi * 0.3 + i / 15 * math.pi * 1.4  # da lateral, por trás, até a outra lateral (frente livre)
    x0, z0 = math.sin(a) * 0.15, math.cos(a) * 0.14  # a = 0 é a frente: fica livre
    length = random.uniform(0.9, 1.3)
    pts = curve((x0, -0.04, z0), (x0 * 1.25 + random.uniform(-0.04, 0.04), -length * 0.5, z0 * 1.3), (x0 * 1.1 + random.uniform(-0.08, 0.08), -length, z0 * 1.1 + random.uniform(-0.05, 0.05)), 7, jitter=0.02)
    add(hair, f'lock{i}', ribbon(pts, random.uniform(0.07, 0.11), normal=(math.sin(a), 0, math.cos(a))), M['hair'])


# ---------------- braços longos e retorcidos (galhos amarrados), garra na esquerda e FOICE DE OSSOS na direita
def arm(side, name):
    s = side
    sh = joint(f'J_sh{name}', (s * 0.3, 0.02, 0), chest)
    up = [(s * random.uniform(-0.01, 0.01), -i * 0.1, random.uniform(-0.012, 0.012)) for i in range(9)]
    add(sh, 'upperA', rod(up, [0.04, 0.03], seg=7, wobble=0.12), M['bone'])
    add(sh, 'upperB', rod([(p[0] + s * 0.03, p[1], p[2] + 0.02) for p in up], [0.022, 0.016], seg=6, wobble=0.12), M['bone'])
    add(sh, 'shoulderKnob', blob((0, 0, 0), (0.06, 0.06, 0.06), 10, 8), M['bone'])
    for k, y in enumerate((-0.15, -0.45, -0.72)):
        add(sh, f'wrapU{k}', ring((s * 0.012, y, 0.01), (0, 1, 0), 0.05), M['rope'])
    add(sh, 'rag', ribbon(curve((s * 0.02, -0.3, 0.04), (s * 0.08, -0.55, 0.06), (s * 0.04, -0.9, 0.05), 6), 0.1, normal=(0, 0, 1)), M['cloth'])
    el = joint(f'J_el{name}', (0, -0.82, 0), sh)
    add(el, 'elbowKnob', blob((0, 0, 0), (0.05, 0.055, 0.05), 10, 8), M['bone'])
    fore = [(random.uniform(-0.012, 0.012), -i * 0.1, random.uniform(-0.012, 0.012)) for i in range(9)]
    add(el, 'fore', rod(fore, [0.032, 0.022], seg=7, wobble=0.12), M['bone'])
    for k, y in enumerate((-0.12, -0.6)):
        add(el, f'wrapF{k}', ring((0, y, 0), (0, 1, 0), 0.04), M['rope'])
    for k in range(3):  # esporas de osso
        y = -0.2 - k * 0.2
        add(el, f'spur{k}', spike((s * 0.02, y, 0), (s * 0.09, y + 0.06, -0.02), 0.012, seg=4), M['bone'])
    # pingentes pendurados por fios (irl)
    for k, (y, ln) in enumerate(((-0.35, 0.22), (-0.7, 0.3))):
        add(el, f'thread{k}', rod([(0, y, 0.03), (0, y - ln, 0.05)], 0.004, seg=3), M['rope'])
        add(el, f'charm{k}', spike((0, y - ln, 0.05), (0, y - ln - 0.08, 0.05), 0.02, seg=3), M['tooth'])
    hand = joint(f'J_hand{name}', (0, -0.86, 0), el)
    add(hand, 'palm', blob((0, -0.03, 0.01), (0.045, 0.05, 0.03), 8, 6), M['bone'])
    return sh, el, hand


shL, elL, handL = arm(1, 'L')
shR, elR, handR = arm(-1, 'R')
# garra: dedos longos e finos, curvados
for i in range(5):
    a = (i - 2) * 0.32
    base = (math.sin(a) * 0.04, -0.06, 0.02 + math.cos(a) * 0.01)
    mid = (math.sin(a) * 0.12, -0.22, 0.08)
    tip = (math.sin(a) * 0.14, -0.33, 0.2)
    add(handL, f'finger{i}', rod(curve(base, mid, tip, 6), [0.012, 0.004], seg=5), M['bone'])
# FOICE DE OSSOS amarrada no braço direito: cabo com espinhos preso ao antebraço + lâmina longa e curva até o chão
shaft = [(0, 0.55 - i * 0.12, 0.03) for i in range(10)]
add(handR, 'shaft', rod(shaft, [0.034, 0.03], seg=7, wobble=0.1), M['bone'])
for k in range(5):
    y = 0.45 - k * 0.2
    add(handR, f'shaftSpike{k}', spike((-0.02, y, 0.03), (-0.13, y + 0.05, 0.02 + (k % 2) * 0.05), 0.016, seg=4), M['bone'])
for k, y in enumerate((0.42, 0.15, -0.3)):
    add(handR, f'shaftWrap{k}', ring((0, y, 0.03), (0, 1, 0), 0.05, 0.012), M['rope'])
S = -1  # a lâmina abre para fora (direita do boneco = −x)
spineB = curve((0, -0.55, 0.03), (S * 0.75, -0.95, 0.25), (S * 0.55, -2.15, 0.55), 14)
add(handR, 'bladeBack', rod(spineB, [0.035, 0.012], seg=6), M['bone'])
# corpo da lâmina: achatado, mais largo no meio, fio para dentro da curva
bl = curve((0.04, -0.6, 0.06), (S * 0.62, -1.02, 0.36), (S * 0.5, -2.2, 0.62), 14)
widths = [0.02 + 0.09 * math.sin(math.pi * min(1, i / 13 * 1.15)) for i in range(14)]
add(handR, 'blade', rod(bl, widths, seg=8, flat=0.18), M['blade'])
for k in range(0, 14, 2):  # "vértebras" ao longo do dorso da lâmina (feita de ossos)
    add(handR, f'bladeVert{k}', blob(spineB[k], (0.04, 0.03, 0.04), 8, 6), M['bone'])
add(handR, 'bladeLodo', blob((S * 0.3, -0.8, 0.15), (0.03, 0.09, 0.03), 8, 8), M['lodo'])

# ---------------- pernas finas penduradas, pés em ponta
for s, name in ((1, 'L'), (-1, 'R')):
    hip = joint(f'J_hip{name}', (s * 0.1, -0.98, 0), chest)
    add(hip, 'thigh', rod([(0, 0, 0), (s * 0.01, -0.3, 0.02), (0, -0.62, 0.03)], [0.032, 0.024], seg=7, wobble=0.1), M['bone'])
    add(hip, 'thighWrap', ring((0, -0.25, 0.01), (0, 1, 0), 0.042), M['rope'])
    knee = joint(f'J_knee{name}', (0, -0.64, 0.03), hip)
    add(knee, 'kneeKnob', blob((0, 0, 0), (0.04, 0.045, 0.04), 8, 6), M['bone'])
    add(knee, 'shin', rod([(0, 0, 0), (0, -0.35, -0.01), (0, -0.7, 0)], [0.024, 0.012], seg=6, wobble=0.1), M['bone'])
    add(knee, 'foot', spike((0, -0.7, 0), (0, -0.82, 0.12), 0.022, seg=5), M['bone'])

finish()

out = sys.argv[sys.argv.index('--') + 1]
export_glb(out)
