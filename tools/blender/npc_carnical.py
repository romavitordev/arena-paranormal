"""
O CARNIÇAL PRETO DA MORTE (invocação do Deus da Morte) — wiki "Carniçal Preto da Morte" (O Segredo na Floresta).
Humanoide de ~2 m, MAGRO e MUSCULOSO: a musculatura é uma figura anatômica feita de LODO PRETO que sai de trás da
cabeça e se entrelaça em TENDÕES. A cabeça é o resto de um CRÂNIO humano apodrecido, amarronzado e semiaberto, com o
SÍMBOLO ESPIRAL cravado na testa brilhando VERMELHO. Garras da Morte nas mãos.

Peças rígidas em juntas (J_*) com o MESMO esqueleto dos Zumbis de Sangue (body/chest/neck/jaw/sh/el/hand/hip/knee),
animadas em código (src/combat/npcs.js → Carnical, a pose do BloodZombie em pé e altiva).
"""
import sys
import os
import math
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from lib import reset, material, export_glb, TAU
from npc_lib import rod, curve, blob, spike, joint, add, finish

random.seed(4)
reset()
M = {
    'lodo': material('lodo_carnical', '#120e14', 0.45),  # o Lodo Preto
    'tendon': material('tendon_carnical', '#2c2234', 0.4),  # os tendões (um pouco mais claros, pegam a luz)
    'skull': material('skull_carnical', '#8a6a48', 0.7),  # crânio apodrecido, amarronzado
    'rot': material('rot_carnical', '#4a3422', 0.8),
    'claw': material('claw_carnical', '#0a080c', 0.35),
    'glow': material('glow_carnical', '#ff2a1a', 0.3, emission='#ff2a1a', strength=3.0),  # o Símbolo Espiral
}

hipY, shY, shZ, shX = 1.04, 0.66, 0.06, 0.25
upL, foreL = 0.34, 0.33
thighL, shinL, hipX = 0.5, 0.5, 0.11

body = joint('J_body', (0, 0, 0))
chest = joint('J_chest', (0, hipY, 0), body)

# ---------------- tronco: cintura fina, tórax em V (anatomia de Lodo), tendões cruzando
spine = curve((0, -0.05, 0), (0, shY * 0.5, -0.02), (0, shY, shZ), 6)
add(chest, 'torso', rod(spine, [0.1, 0.095, 0.11, 0.15, 0.18, 0.15], seg=14, wobble=0.03), M['lodo'])
add(chest, 'pelvis', blob((0, -0.02, 0), (0.13, 0.09, 0.1), 12, 8), M['lodo'])
top = spine[-1]
for s in (1, -1):
    add(chest, f'pec{s}', blob((s * 0.09, top[1] - 0.1, top[2] + 0.1), (0.1, 0.08, 0.06), 10, 8), M['tendon'])
    add(chest, f'lat{s}', blob((s * 0.13, top[1] - 0.26, top[2] - 0.02), (0.06, 0.18, 0.1), 10, 8), M['lodo'])
for r in range(3):
    for s in (1, -1):
        add(chest, f'ab{r}{s}', blob((s * 0.04, 0.3 - r * 0.09, 0.09), (0.04, 0.035, 0.025), 8, 6), M['tendon'])
# os tendões de Lodo que saem de TRÁS DA CABEÇA e se entrelaçam pelo corpo
for i in range(10):
    s = 1 if i % 2 else -1
    a0 = (top[0] + s * 0.03, top[1] + 0.12, top[2] - 0.1)
    a1 = (s * random.uniform(0.08, 0.17), random.uniform(0.25, 0.45), random.choice((0.12, -0.12)))
    a2 = (-s * random.uniform(0.0, 0.1), random.uniform(-0.02, 0.15), random.choice((0.1, -0.1)))
    add(chest, f'tendon{i}', rod(curve(a0, a1, a2, 9, jitter=0.01), [0.018, 0.012], seg=5), M['tendon'])

# ---------------- cabeça: crânio apodrecido semiaberto + o Símbolo Espiral vermelho na testa
neck = joint('J_neck', (0, top[1] + 0.04, top[2] + 0.02), chest)
add(neck, 'neckM', rod([(0, -0.05, -0.01), (0, 0.1, 0.02)], 0.05, seg=8), M['lodo'])
add(neck, 'cranium', blob((0, 0.2, 0.02), (0.11, 0.13, 0.13), 14, 10), M['skull'])
# o alto do crânio aberto: a borda irregular e o Lodo transbordando por cima
for i in range(9):
    a = i / 9 * TAU
    base = (math.sin(a) * 0.09, 0.3, 0.02 + math.cos(a) * 0.1)
    add(neck, f'crack{i}', spike(base, (base[0] * 1.1, 0.34 + random.uniform(0.0, 0.04), base[2] * 1.1), 0.025, seg=4), M['skull'])
add(neck, 'brainLodo', blob((0, 0.31, -0.01), (0.08, 0.05, 0.09), 10, 6), M['lodo'])
for i in range(4):  # o Lodo descendo pela nuca
    x = (i - 1.5) * 0.04
    add(neck, f'drip{i}', rod(curve((x, 0.3, -0.06), (x * 1.3, 0.2, -0.15), (x, 0.0, -0.12), 6), [0.02, 0.008], seg=5), M['lodo'])
add(neck, 'face', blob((0, 0.16, 0.11), (0.085, 0.08, 0.05), 10, 8), M['rot'])
for s in (1, -1):
    add(neck, f'socket{s}', blob((s * 0.04, 0.18, 0.135), (0.03, 0.028, 0.02), 8, 6), M['claw'])  # órbitas vazias
    add(neck, f'cheek{s}', blob((s * 0.07, 0.13, 0.1), (0.03, 0.025, 0.04), 8, 6), M['skull'])
# o Símbolo Espiral cravado na testa (brilha vermelho)
pts = []
for i in range(30):
    t = i / 29
    a = t * TAU * 2.2
    r = 0.004 + t * 0.028
    pts.append((math.cos(a) * r, 0.245 + math.sin(a) * r, 0.142 + 0.006 * (1 - t)))
add(neck, 'spiral', rod(pts, 0.0045, seg=4, caps=False), M['glow'])
jaw = joint('J_jaw', (0, 0.1, 0.06), neck)
add(jaw, 'jaw', blob((0, -0.02, 0.05), (0.07, 0.035, 0.06), 10, 6), M['skull'])
for i in range(6):
    x = -0.04 + i * 0.016
    add(jaw, f'tooth{i}', spike((x, 0.0, 0.1), (x, 0.03, 0.105), 0.007, seg=4), M['skull'])

# ---------------- braços magros e longos, garras da Morte
def arm(s, name):
    sh = joint(f'J_sh{name}', (s * shX, top[1] - 0.05, top[2] - 0.02), chest)
    add(sh, 'delt', blob((s * 0.02, -0.02, 0), (0.07, 0.07, 0.07), 10, 8), M['tendon'])
    add(sh, 'upper', rod(curve((0, 0, 0), (s * 0.01, -upL * 0.5, 0.02), (0, -upL, 0), 6), [0.055, 0.058, 0.05, 0.042, 0.038, 0.036], seg=10), M['lodo'])
    for k in range(2):
        add(sh, f'tU{k}', rod(curve((s * 0.03 * (1 if k else -1), -0.02, 0.03), (s * 0.05, -upL * 0.5, 0.04 * (1 if k else -1)), (0, -upL + 0.02, 0.0), 6), 0.009, seg=4), M['tendon'])
    el = joint(f'J_el{name}', (0, -upL, 0), sh)
    add(el, 'elbow', blob((0, 0, 0), (0.04, 0.04, 0.04), 8, 6), M['tendon'])
    add(el, 'fore', rod(curve((0, 0, 0), (0, -foreL * 0.4, 0.02), (0, -foreL, 0), 6), [0.04, 0.046, 0.04, 0.032, 0.028, 0.026], seg=10), M['lodo'])
    hand = joint(f'J_hand{name}', (0, -foreL, 0), el)
    add(hand, 'palm', blob((0, -0.04, 0.01), (0.045, 0.06, 0.025), 10, 8), M['lodo'])
    for i in range(4):
        a = (i - 1.5) * 0.35
        base = (math.sin(a) * 0.04, -0.08, 0.02)
        tip = (math.sin(a) * 0.07, -0.25, 0.08)
        add(hand, f'finger{i}', rod(curve(base, (math.sin(a) * 0.06, -0.17, 0.03), tip, 5), [0.012, 0.008], seg=5), M['tendon'])
        add(hand, f'claw{i}', spike(tip, (tip[0] * 1.1, -0.31, 0.15), 0.009, seg=5), M['claw'])
    add(hand, 'thumb', rod(curve((-s * 0.04, -0.04, 0.03), (-s * 0.07, -0.1, 0.07), (-s * 0.06, -0.14, 0.12), 5), [0.012, 0.007], seg=5), M['tendon'])


arm(1, 'L')
arm(-1, 'R')

# ---------------- pernas longas e musculosas (salta longe)
for s, name in ((1, 'L'), (-1, 'R')):
    hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
    add(hip, 'thigh', rod(curve((0, 0.02, 0), (s * 0.01, -thighL * 0.5, 0.03), (0, -thighL, 0.02), 6), [0.075, 0.08, 0.07, 0.055, 0.048, 0.046], seg=10), M['lodo'])
    add(hip, 'quad', blob((0, -thighL * 0.42, 0.04), (0.055, thighL * 0.28, 0.045), 10, 8), M['tendon'])
    knee = joint(f'J_knee{name}', (0, -thighL, 0.02), hip)
    add(knee, 'kneecap', blob((0, 0, 0.02), (0.045, 0.045, 0.045), 8, 6), M['tendon'])
    add(knee, 'shin', rod(curve((0, 0, 0), (0, -shinL * 0.4, -0.03), (0, -shinL, -0.02), 6), [0.05, 0.055, 0.045, 0.035, 0.03, 0.03], seg=9), M['lodo'])
    add(knee, 'calf', blob((0, -shinL * 0.3, -0.035), (0.04, shinL * 0.2, 0.035), 10, 8), M['tendon'])
    add(knee, 'foot', blob((0, -shinL - 0.01, 0.06), (0.045, 0.03, 0.1), 10, 6), M['lodo'])
    for i in range(3):
        a = (i - 1) * 0.35
        base = (math.sin(a) * 0.035, -shinL - 0.02, 0.14)
        add(knee, f'toe{i}', spike(base, (base[0] * 1.2, -shinL - 0.04, 0.21), 0.012, seg=5), M['claw'])

finish()
out = sys.argv[sys.argv.index('--') + 1]
export_glb(out)
