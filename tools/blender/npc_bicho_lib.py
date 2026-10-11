"""
ANIMAIS INFECTADOS PELA TINTA (invocação do Amigo Imaginário) — O Segredo na Ilha, wiki "Javalis Infectados" e os
Cachorros Selvagens Infectados de Tipora. Cadáveres ambulantes: carne exposta e DERRETIDA, gosmenta, costelas à
mostra, VEIAS MARRONS enormes pulsando por cima do pelo e ligadas ao líquido que ESCORRE DOS OLHOS; a boca aberta de
um jeito monstruoso, dentes muito maiores que o normal; pelo escuro amarronzado, patas com unhas enormes; olhos
pequenos, avermelhados e arregalados.
  - javali (npc_javali_tinta.py): enorme e baixo, corcunda nos ombros, focinho comprido e PRESAS gigantes;
  - cão (npc_cao_tinta.py): magro e comprido, a boca escancarada cheia de dentes.

Peças rígidas em juntas (J_*): body, torso, head, jaw, as quatro pernas (legFL/FR/BL/BR, cada uma com o joelho knee*)
e tail — animadas em código (src/combat/npcs.js → InkBeast).
"""
import sys
import math
import random

from lib import reset, material, export_glb, TAU
from npc_lib import rod, curve, blob, spike, joint, add, finish


def build(kind):
    boar = kind == 'javali'
    random.seed(17 if boar else 23)
    reset()
    M = {
        'fur': material('fur_bicho', '#2e2018' if boar else '#3a3026', 0.85),
        'fur2': material('fur2_bicho', '#22160f' if boar else '#2a221c', 0.9),
        'flesh': material('flesh_bicho', '#7a2a1c', 0.5),  # carne exposta, derretida
        'goo': material('goo_bicho', '#5a2410', 0.3),  # a gosma da Tinta
        'bone': material('bone_bicho', '#cdbd9c', 0.6),
        'vein': material('vein_bicho', '#6a3414', 0.45),
        'tooth': material('tooth_bicho', '#e6dcc0', 0.4),
        'maw': material('maw_bicho', '#1a0604', 0.8),
        'claw': material('claw_bicho', '#14100c', 0.4),
        'eye': material('glow_bicho', '#ff3a20', 0.3, emission='#ff3a20', strength=2.5),
        'ink': material('ink_bicho', '#3a1408', 0.25),
    }
    # proporções
    if boar:
        legH, halfL, bodyR, humpH, headL = 0.5, 0.62, (0.34, 0.36), 0.18, 0.5
        legR, legX = (0.075, 0.055), 0.2
    else:
        legH, halfL, bodyR, humpH, headL = 0.52, 0.42, (0.17, 0.2), 0.05, 0.36
        legR, legX = (0.045, 0.03), 0.12

    body = joint('J_body', (0, 0, 0))
    torso = joint('J_torso', (0, legH, 0), body)
    # ---------------- tronco (corcunda nos ombros), pelo, carne derretida e costelas à mostra
    spine, radii = [], []
    for i in range(11):
        t = i / 10
        z = -halfL + t * 2 * halfL
        hump = humpH * math.sin(min(1.0, t * 1.3) * math.pi * 0.5) * (1 - max(0.0, t - 0.8) * 2)
        spine.append((0, bodyR[1] * 0.1 + hump * 0.5, z))
        radii.append(bodyR[0] * (0.55 + 0.5 * math.sin(math.pi * (0.15 + t * 0.75))) + hump * 0.35)
    add(torso, 'body', rod(spine, radii, seg=18, wobble=0.02), M['fur'])
    add(torso, 'belly', blob((0, -bodyR[1] * 0.25, 0), (bodyR[0] * 0.85, bodyR[1] * 0.55, halfL * 0.9), 14, 10), M['fur2'])
    # crina/pelos eriçados no dorso
    for i in range(14 if boar else 9):
        t = i / (13 if boar else 8)
        z = -halfL * 0.8 + t * halfL * 1.6
        y = bodyR[1] * 0.45 + humpH * math.sin(min(1, t * 1.4) * math.pi * 0.5) + (0.1 if boar else 0.05)
        add(torso, f'bristle{i}', spike((0, y - 0.06, z), (0, y + (0.12 if boar else 0.06) + random.uniform(0, 0.05), z - 0.06), 0.03 if boar else 0.018, seg=4), M['fur2'])
    # o flanco derretido: carne exposta e as costelas
    side = random.choice((1, -1))
    add(torso, 'meltPatch', blob((side * bodyR[0] * 0.75, bodyR[1] * 0.05, 0.02), (bodyR[0] * 0.35, bodyR[1] * 0.5, halfL * 0.45), 10, 8), M['flesh'])
    for r in range(5 if boar else 4):
        z = -halfL * 0.25 + r * halfL * 0.16
        rib = curve((side * bodyR[0] * 0.6, bodyR[1] * 0.45, z), (side * bodyR[0] * 1.08, bodyR[1] * 0.05, z + 0.02), (side * bodyR[0] * 0.7, -bodyR[1] * 0.4, z), 7)
        add(torso, f'rib{r}', rod(rib, 0.018 if boar else 0.011, seg=5), M['bone'])
    for i in range(6):  # gosma pingando da barriga
        x = random.uniform(-bodyR[0] * 0.6, bodyR[0] * 0.6)
        z = random.uniform(-halfL * 0.6, halfL * 0.6)
        ln = random.uniform(0.08, 0.2)
        add(torso, f'goo{i}', rod([(x, -bodyR[1] * 0.7, z), (x, -bodyR[1] * 0.7 - ln * 0.6, z + 0.01), (x, -bodyR[1] * 0.7 - ln, z)], [0.022, 0.014, 0.004], seg=5), M['goo'])
    # VEIAS MARRONS por cima do pelo, indo para a cabeça (ligadas ao líquido dos olhos)
    for i in range(7 if boar else 5):
        a = random.uniform(-1.4, 1.4)
        z0 = random.uniform(-halfL * 0.8, halfL * 0.2)
        pts = []
        for j in range(7):
            z = z0 + (halfL * 1.05 - z0) * j / 6
            aa = a + math.sin(j * 1.3 + i) * 0.15
            pts.append((math.sin(aa) * bodyR[0] * 1.02, bodyR[1] * 0.2 + math.cos(aa) * bodyR[1] * 0.45 + humpH * 0.6 * (j / 6), z))
        add(torso, f'vein{i}', rod(pts, 0.014 if boar else 0.009, seg=4), M['vein'])

    # ---------------- cabeça: focinho, boca monstruosa, presas, olhos vermelhos com a tinta escorrendo
    head = joint('J_head', (0, bodyR[1] * 0.3 + humpH * 0.6, halfL * 0.95), torso)
    if boar:
        add(head, 'skull', rod([(0, 0.06, -0.05), (0, 0.04, headL * 0.35), (0, -0.02, headL * 0.75), (0, -0.05, headL)], [0.2, 0.17, 0.11, 0.08], seg=12), M['fur'])
        add(head, 'snout', blob((0, -0.05, headL + 0.02), (0.075, 0.07, 0.04), 10, 8), M['flesh'])
        for s in (1, -1):
            add(head, f'nostril{s}', blob((s * 0.03, -0.04, headL + 0.055), (0.015, 0.02, 0.01), 6, 4), M['maw'])
            add(head, f'ear{s}', spike((s * 0.12, 0.17, 0.02), (s * 0.2, 0.3, -0.05), 0.045, seg=4), M['fur2'])
            # PRESAS gigantes, curvas para cima e para trás
            add(head, f'tusk{s}', rod(curve((s * 0.07, -0.08, headL * 0.72), (s * 0.18, -0.06, headL * 0.95), (s * 0.15, 0.14, headL * 0.82), 7), [0.032, 0.022, 0.005], seg=7), M['tooth'])
            add(head, f'eye{s}', blob((s * 0.11, 0.1, headL * 0.32), (0.022, 0.022, 0.018), 8, 6), M['eye'])
            add(head, f'tear{s}', rod([(s * 0.12, 0.08, headL * 0.33), (s * 0.13, -0.02, headL * 0.36), (s * 0.12, -0.16, headL * 0.33)], [0.014, 0.01, 0.003], seg=5), M['ink'])
        jawZ = headL * 0.45
    else:
        add(head, 'skull', rod([(0, 0.05, -0.04), (0, 0.04, headL * 0.4), (0, 0.0, headL * 0.8), (0, -0.01, headL)], [0.11, 0.1, 0.06, 0.045], seg=12), M['fur'])
        add(head, 'nose', blob((0, 0.0, headL + 0.01), (0.03, 0.025, 0.025), 8, 6), M['maw'])
        for s in (1, -1):
            add(head, f'ear{s}', spike((s * 0.06, 0.12, 0.0), (s * 0.1, 0.26, -0.06), 0.035, seg=4), M['fur2'])
            add(head, f'eye{s}', blob((s * 0.06, 0.07, headL * 0.38), (0.016, 0.016, 0.014), 8, 6), M['eye'])
            add(head, f'tear{s}', rod([(s * 0.065, 0.055, headL * 0.39), (s * 0.07, -0.03, headL * 0.42), (s * 0.068, -0.13, headL * 0.4)], [0.01, 0.007, 0.002], seg=5), M['ink'])
        jawZ = headL * 0.3
    # gengiva/dentes de cima (dentes que crescem para fora da boca)
    add(head, 'mawU', blob((0, -0.06, jawZ + headL * 0.25), (0.07 if boar else 0.045, 0.03, headL * 0.32), 10, 6), M['maw'])
    for i in range(8 if boar else 10):
        t = i / (7 if boar else 9)
        s = 1 if i % 2 else -1
        z = jawZ + t * headL * 0.55
        x = s * (0.065 if boar else 0.04) * (1 - t * 0.4)
        ln = random.uniform(0.05, 0.1) if boar else random.uniform(0.04, 0.08)
        add(head, f'toothU{i}', spike((x, -0.06, z), (x * 1.4, -0.06 - ln, z + 0.02), 0.012 if boar else 0.008, seg=4), M['tooth'])
    jaw = joint('J_jaw', (0, -0.08, jawZ), head)
    add(jaw, 'jaw', rod([(0, -0.02, -0.02), (0, -0.04, headL * 0.3), (0, -0.04, headL * 0.55)], [0.09 if boar else 0.05, 0.07 if boar else 0.04, 0.04 if boar else 0.025], seg=10), M['fur2'])
    add(jaw, 'mawL', blob((0, -0.0, headL * 0.3), (0.06 if boar else 0.035, 0.02, headL * 0.25), 8, 6), M['maw'])
    for i in range(6 if boar else 8):
        t = i / (5 if boar else 7)
        s = 1 if i % 2 else -1
        z = t * headL * 0.5
        x = s * (0.055 if boar else 0.032)
        add(jaw, f'toothL{i}', spike((x, -0.0, z), (x * 1.3, 0.06 + random.uniform(0, 0.04), z + 0.02), 0.01 if boar else 0.007, seg=4), M['tooth'])
    add(jaw, 'drool', rod([(0, -0.05, headL * 0.4), (0, -0.15, headL * 0.42), (0, -0.28, headL * 0.4)], [0.016, 0.01, 0.003], seg=5), M['goo'])

    # ---------------- pernas (um pivô no ombro/quadril, um no joelho) com unhas enormes
    upper, lower = legH * 0.52, legH * 0.5
    for name, x, z in (('FL', legX, halfL * 0.62), ('FR', -legX, halfL * 0.62), ('BL', legX, -halfL * 0.62), ('BR', -legX, -halfL * 0.62)):
        leg = joint(f'J_leg{name}', (x, 0, z), torso)
        add(leg, 'thigh', rod([(0, 0.08, 0), (0, -upper * 0.5, 0.02), (0, -upper, 0)], [legR[0] * 1.5, legR[0] * 1.1, legR[0]], seg=8), M['fur'])
        knee = joint(f'J_knee{name}', (0, -upper, 0), leg)
        add(knee, 'shin', rod([(0, 0, 0), (0, -lower * 0.6, 0.01), (0, -lower + 0.03, 0.02)], [legR[0], legR[1] * 1.1, legR[1]], seg=8), M['fur2'])
        add(knee, 'hoof', blob((0, -lower + 0.02, 0.04), (legR[1] * 1.4, 0.03, legR[1] * 1.7), 8, 6), M['claw'])
        for i in range(3):
            a = (i - 1) * 0.45
            base = (math.sin(a) * legR[1], -lower + 0.01, 0.06 + legR[1])
            add(knee, f'nail{i}', spike(base, (base[0] * 1.3, -lower - 0.01, base[2] + (0.08 if boar else 0.06)), 0.014 if boar else 0.01, seg=4), M['claw'])

    # ---------------- rabo
    tail = joint('J_tail', (0, bodyR[1] * 0.35, -halfL * 1.02), torso)
    if boar:
        add(tail, 'tail', rod(curve((0, 0, 0), (0, -0.05, -0.08), (0.03, -0.18, -0.06), 6), [0.025, 0.008], seg=5), M['fur2'])
    else:
        add(tail, 'tail', rod(curve((0, 0, 0), (0, 0.04, -0.2), (0, -0.12, -0.35), 7), [0.03, 0.01], seg=6), M['fur'])

    finish()
    out = sys.argv[sys.argv.index('--') + 1]
    export_glb(out)
