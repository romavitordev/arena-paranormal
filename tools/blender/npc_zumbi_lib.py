"""
ZUMBI DE SANGUE (invocação do Diabo, "Senhor do Sangue") — referências em "Referencias visuais/Personagens/Zumbi de sangue".

Cânone das referências: carne VIVA vermelha com músculos expostos e veias, sem olhos; a cabeça é quase só uma BOCA
escancarada cheia de presas longas cor de marfim; braços longos terminando em garras; corpo curvado de predador.
Duas variações (build(strong)):
  - FRACO (npc_zumbi_sangue.py): magro e comprido, cabeça-boca virada para cima, costelas marcadas;
  - FORTE (npc_zumbi_sangue_forte.py): massa de músculo, ombros e trapézio enormes, cabeça afundada no peito,
    braços grossos que chegam ao chão (anda quase de quatro).

Peças rígidas em juntas (J_*), animadas em código (src/combat/npcs.js → BloodZombie.pose). O modelo sai em pé e
com os membros retos; a postura curvada/agachada é dada pelo jogo.
"""
import sys
import math
import random

from lib import reset, material, export_glb, TAU
from npc_lib import rod, curve, blob, spike, ribbon, joint, add, finish


def build(strong):
    random.seed(31 if strong else 7)
    reset()
    M = {
        'flesh': material('flesh_zumbi', '#8c1a20', 0.55),
        'flesh2': material('flesh2_zumbi', '#5c0d14', 0.6),
        'muscle': material('muscle_zumbi', '#b8363c', 0.45),
        'fang': material('fang_zumbi', '#e2d6ba', 0.4),
        'maw': material('maw_zumbi', '#1c0306', 0.8),
        'gum': material('gum_zumbi', '#c24a5a', 0.5),
        'claw': material('claw_zumbi', '#2a0709', 0.4),
        'vein': material('vein_zumbi', '#3a0409', 0.5),
    }

    # ---------------- proporções das duas variações
    if strong:
        hipY, shY, shZ, shX = 0.95, 0.78, 0.22, 0.44
        torsoR = [0.22, 0.24, 0.3, 0.38, 0.44, 0.42]
        upL, foreL, upR, foreR = 0.6, 0.66, (0.17, 0.13), (0.16, 0.09)
        thighL, shinL, thighR, shinR, hipX = 0.46, 0.44, (0.16, 0.11), (0.12, 0.07), 0.22
        fingerL, clawL = 0.18, 0.12
    else:
        hipY, shY, shZ, shX = 1.0, 0.64, 0.14, 0.24
        torsoR = [0.12, 0.12, 0.14, 0.17, 0.19, 0.17]
        upL, foreL, upR, foreR = 0.5, 0.52, (0.06, 0.045), (0.05, 0.03)
        thighL, shinL, thighR, shinR, hipX = 0.5, 0.48, (0.07, 0.05), (0.05, 0.03), 0.12
        fingerL, clawL = 0.17, 0.1

    body = joint('J_body', (0, 0, 0))
    chest = joint('J_chest', (0, hipY, 0), body)  # pivô na cintura: o tronco sobe e vai para a frente

    # ---------------- tronco
    spine = curve((0, -0.05, 0), (0, shY * 0.55, -0.04), (0, shY, shZ), 6)
    add(chest, 'torso', rod(spine, torsoR, seg=14, wobble=0.04), M['flesh'])
    add(chest, 'pelvis', blob((0, -0.02, -0.01), (torsoR[0] * 1.25, 0.1, torsoR[0] * 0.95), 12, 8), M['flesh2'])
    top = spine[-1]
    if strong:
        # trapézio/dorso gigante, peitorais e "gomos" do abdome
        add(chest, 'traps', blob((0, top[1] + 0.06, top[2] - 0.16), (0.46, 0.22, 0.3), 16, 10), M['flesh'])
        for s in (1, -1):
            add(chest, f'pec{s}', blob((s * 0.17, top[1] - 0.12, top[2] + 0.2), (0.17, 0.12, 0.1), 12, 8), M['muscle'])
            add(chest, f'lat{s}', blob((s * 0.28, top[1] - 0.3, top[2] - 0.05), (0.12, 0.26, 0.18), 10, 8), M['flesh'])
            add(chest, f'back{s}', blob((s * 0.16, top[1] - 0.1, top[2] - 0.28), (0.18, 0.2, 0.14), 10, 8), M['muscle'])
        for r in range(3):
            for s in (1, -1):
                y = 0.42 - r * 0.13
                z = spine[3][2] + torsoR[3] * 0.85 - r * 0.02
                add(chest, f'ab{r}{s}', blob((s * 0.07, y, z), (0.065, 0.055, 0.04), 8, 6), M['muscle'])
    else:
        # magro: costelas marcadas na frente, saliências da coluna nas costas
        for r in range(5):
            y = shY * 0.45 + r * 0.06
            z = spine[3][2] + 0.03 + r * 0.025
            for s in (1, -1):
                rib = curve((s * 0.02, y, z + 0.13), (s * 0.15, y - 0.02, z + 0.05), (s * 0.15, y - 0.03, z - 0.08), 7)
                add(chest, f'rib{r}{s}', rod(rib, 0.016, seg=5), M['flesh2'])
        for r in range(7):
            p = curve((0, 0, -0.1), (0, shY * 0.55, -0.16), (0, shY, shZ - 0.16), 7)[r]
            add(chest, f'vert{r}', blob(p, (0.035, 0.03, 0.035), 8, 6), M['muscle'])
        for s in (1, -1):
            add(chest, f'collar{s}', rod(curve((0, top[1] + 0.02, top[2] + 0.1), (s * 0.12, top[1] + 0.04, top[2] + 0.06), (s * shX, top[1] - 0.02, top[2] - 0.02), 6), 0.025, seg=6), M['muscle'])
    # veias pelo tronco
    for i in range(6 if strong else 4):
        a = random.uniform(-1.2, 1.2) + (math.pi if i % 2 else 0)
        y0 = random.uniform(0.1, shY * 0.8)
        R = torsoR[3] * 1.02
        pts = [(math.sin(a + j * 0.12) * R, y0 + j * 0.07, math.cos(a + j * 0.12) * R + shZ * (y0 + j * 0.07) / shY * 0.6) for j in range(5)]
        add(chest, f'veinT{i}', rod(pts, 0.008 if not strong else 0.012, seg=4), M['vein'])

    # ---------------- cabeça-boca (sem olhos) e mandíbula
    if strong:
        neck = joint('J_neck', (0, top[1] - 0.04, top[2] + 0.2), chest)  # afundada entre os ombros
        add(neck, 'skull', blob((0, 0.05, 0.12), (0.22, 0.17, 0.22), 14, 10), M['flesh'])
        add(neck, 'brow', blob((0, 0.13, 0.22), (0.2, 0.07, 0.12), 12, 8), M['muscle'])
        add(neck, 'mawU', blob((0, -0.04, 0.27), (0.17, 0.08, 0.08), 12, 8), M['maw'])
        for i in range(11):  # presas de cima: longas, para baixo e um pouco para dentro
            a = (i - 5) / 5 * 1.25
            base = (math.sin(a) * 0.19, -0.02, 0.2 + math.cos(a) * 0.12)
            ln = 0.15 + 0.06 * math.cos(a * 1.2) + random.uniform(-0.02, 0.02)
            tip = (base[0] * 0.9, base[1] - ln, base[2] + 0.02)
            add(neck, f'fangU{i}', rod(curve(base, (base[0], base[1] - ln * 0.6, base[2] + 0.05), tip, 5), [0.028, 0.004], seg=6), M['fang'])
        add(neck, 'gumU', rod(curve((0.2, -0.02, 0.16), (0, -0.03, 0.4), (-0.2, -0.02, 0.16), 9), 0.03, seg=6), M['gum'])
        jaw = joint('J_jaw', (0, -0.06, 0.06), neck)
        add(jaw, 'jaw', blob((0, -0.08, 0.14), (0.2, 0.08, 0.2), 12, 8), M['flesh'])
        add(jaw, 'mawL', blob((0, -0.03, 0.2), (0.15, 0.05, 0.12), 10, 6), M['maw'])
        for i in range(9):
            a = (i - 4) / 4 * 1.15
            base = (math.sin(a) * 0.17, -0.04, 0.14 + math.cos(a) * 0.15)
            ln = 0.11 + random.uniform(-0.02, 0.02)
            add(jaw, f'fangL{i}', rod(curve(base, (base[0], base[1] + ln * 0.6, base[2] + 0.03), (base[0] * 0.92, base[1] + ln, base[2] - 0.01), 5), [0.024, 0.004], seg=6), M['fang'])
    else:
        neck = joint('J_neck', (0, top[1] + 0.03, top[2] + 0.06), chest)
        add(neck, 'neckM', rod([(0, -0.04, -0.02), (0, 0.1, 0.02)], 0.06, seg=8), M['flesh'])
        # cabeça comprida em capuz, a boca aberta para a frente/cima tomando quase tudo
        add(neck, 'skull', blob((0, 0.24, 0.02), (0.14, 0.22, 0.15), 14, 10), M['flesh'])
        add(neck, 'crest', rod(curve((0, 0.44, -0.04), (0, 0.38, -0.15), (0, 0.16, -0.16), 6), [0.05, 0.03], seg=7), M['muscle'])
        add(neck, 'maw', blob((0, 0.24, 0.12), (0.11, 0.17, 0.06), 12, 8), M['maw'])
        add(neck, 'lip', rod([(math.sin(i / 16 * TAU) * 0.115, 0.24 + math.cos(i / 16 * TAU) * 0.18, 0.12) for i in range(17)], 0.022, seg=6, caps=False), M['gum'])
        for i in range(10):  # presas em volta da boca, curvadas para dentro (como uma flor de dentes)
            a = (i / 10) * TAU + 0.3
            if abs(math.sin(a)) < 0.25 and math.cos(a) < 0:
                continue  # deixa o "queixo" livre (a mandíbula tem as dela)
            base = (math.sin(a) * 0.12, 0.24 + math.cos(a) * 0.18, 0.12)
            ln = random.uniform(0.13, 0.2)
            out = (math.sin(a) * 0.2, 0.24 + math.cos(a) * 0.27, 0.22)
            tip = (math.sin(a) * 0.08, 0.24 + math.cos(a) * 0.12, 0.12 + ln)
            add(neck, f'fang{i}', rod(curve(base, out, tip, 6), [0.02, 0.003], seg=5), M['fang'])
        jaw = joint('J_jaw', (0, 0.08, 0.06), neck)
        add(jaw, 'jaw', blob((0, -0.02, 0.06), (0.09, 0.05, 0.1), 10, 6), M['flesh'])
        for i in range(4):
            x = -0.05 + i * 0.033
            add(jaw, f'fangL{i}', rod(curve((x, -0.0, 0.1), (x * 1.3, 0.05, 0.17), (x, 0.08, 0.15), 5), [0.016, 0.003], seg=5), M['fang'])

    # ---------------- braços longos com garras
    def arm(side, name):
        s = side
        sh = joint(f'J_sh{name}', (s * shX, top[1] - 0.06, top[2] - 0.03), chest)
        add(sh, 'delt', blob((s * 0.02, -0.03, 0), (upR[0] * 1.3, upR[0] * 1.25, upR[0] * 1.25), 12, 8), M['muscle'] if strong else M['flesh'])
        add(sh, 'upper', rod(curve((0, 0, 0), (s * 0.02, -upL * 0.5, 0.02), (0, -upL, 0), 6), [upR[0], upR[0] * 1.05, upR[0], upR[1] * 1.05, upR[1], upR[1]], seg=10, wobble=0.05), M['flesh'])
        add(sh, 'bicep', blob((0, -upL * 0.45, 0.03 + upR[0] * 0.4), (upR[0] * 0.7, upL * 0.28, upR[0] * 0.65), 10, 8), M['muscle'])
        for i in range(2):
            pts = [(s * upR[0] * (0.9 - 0.1 * i), -upL * (0.1 + j * 0.2), upR[0] * 0.4 * (1 if i else -1)) for j in range(5)]
            add(sh, f'veinU{i}', rod(pts, 0.007 if not strong else 0.011, seg=4), M['vein'])
        el = joint(f'J_el{name}', (0, -upL, 0), sh)
        add(el, 'elbow', blob((0, 0, 0), (upR[1], upR[1], upR[1]), 10, 8), M['flesh2'])
        add(el, 'fore', rod(curve((0, 0, 0), (0, -foreL * 0.4, 0.02), (0, -foreL, 0), 6), [foreR[0] * 0.9, foreR[0] * 1.15, foreR[0] * 1.05, foreR[0] * 0.8, foreR[1], foreR[1]], seg=10, wobble=0.05), M['flesh'])
        add(el, 'foreM', blob((s * foreR[0] * 0.3, -foreL * 0.3, 0.02), (foreR[0] * 0.8, foreL * 0.22, foreR[0] * 0.75), 10, 8), M['muscle'])
        hand = joint(f'J_hand{name}', (0, -foreL, 0), el)
        hw = foreR[1] * 1.6
        add(hand, 'palm', blob((0, -0.05, 0.02), (hw, 0.07, hw * 0.6), 10, 8), M['flesh2'])
        n_f = 4
        for i in range(n_f):
            a = (i - (n_f - 1) / 2) * 0.4
            base = (math.sin(a) * hw * 0.9, -0.08, 0.03)
            mid = (math.sin(a) * (hw + fingerL * 0.35), -0.08 - fingerL * 0.7, 0.07)
            tip = (math.sin(a) * (hw + fingerL * 0.4), -0.08 - fingerL, 0.13)
            add(hand, f'finger{i}', rod(curve(base, mid, tip, 5), [hw * 0.28, hw * 0.2], seg=6), M['flesh'])
            ctip = (tip[0] * 1.05, tip[1] - clawL * 0.35, tip[2] + clawL * 0.95)
            add(hand, f'claw{i}', rod(curve(tip, (tip[0], tip[1] - clawL * 0.4, tip[2] + clawL * 0.5), ctip, 5), [hw * 0.18, 0.002], seg=5), M['claw'])
        # polegar
        add(hand, 'thumb', rod(curve((-s * hw * 0.8, -0.05, 0.04), (-s * hw * 1.3, -0.1, 0.1), (-s * hw * 1.2, -0.12, 0.18), 5), [hw * 0.26, hw * 0.12], seg=6), M['flesh'])
        add(hand, 'thumbClaw', spike((-s * hw * 1.2, -0.12, 0.18), (-s * hw * 1.15, -0.13, 0.18 + clawL * 0.8), hw * 0.12, seg=5), M['claw'])

    arm(1, 'L')
    arm(-1, 'R')

    # ---------------- pernas (dobradas pelo jogo) com pés de garras
    for s, name in ((1, 'L'), (-1, 'R')):
        hip = joint(f'J_hip{name}', (s * hipX, 0, 0), chest)
        add(hip, 'thigh', rod(curve((0, 0.02, 0), (s * 0.01, -thighL * 0.5, 0.04), (0, -thighL, 0.02), 6), [thighR[0], thighR[0] * 1.05, thighR[0], thighR[1] * 1.1, thighR[1], thighR[1]], seg=10, wobble=0.05), M['flesh'])
        add(hip, 'quad', blob((0, -thighL * 0.45, thighR[0] * 0.45), (thighR[0] * 0.75, thighL * 0.3, thighR[0] * 0.6), 10, 8), M['muscle'])
        knee = joint(f'J_knee{name}', (0, -thighL, 0.02), hip)
        add(knee, 'kneecap', blob((0, 0, 0.02), (thighR[1], thighR[1], thighR[1]), 10, 8), M['flesh2'])
        add(knee, 'shin', rod(curve((0, 0, 0), (0, -shinL * 0.4, -0.04), (0, -shinL, -0.02), 6), [shinR[0], shinR[0] * 1.1, shinR[0], shinR[1] * 1.1, shinR[1], shinR[1]], seg=9, wobble=0.05), M['flesh'])
        add(knee, 'calf', blob((0, -shinL * 0.3, -shinR[0] * 0.5), (shinR[0] * 0.8, shinL * 0.22, shinR[0] * 0.7), 10, 8), M['muscle'])
        fw = shinR[1] * 2.2
        add(knee, 'foot', blob((0, -shinL - 0.01, 0.06), (fw, 0.04, fw * 1.6), 10, 6), M['flesh2'])
        for i in range(3):
            a = (i - 1) * 0.4
            base = (math.sin(a) * fw * 0.8, -shinL - 0.02, 0.06 + fw * 1.2)
            add(knee, f'toe{i}', spike(base, (base[0] * 1.2, -shinL - 0.05, base[2] + 0.06 + fw * 0.5), fw * 0.3, seg=5), M['claw'])

    finish()
    out = sys.argv[sys.argv.index('--') + 1]
    export_glb(out)
