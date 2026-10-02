"""
Corpo compartilhado da KEMI e da FANTASMA (Hexatombe) — usado por char_kemi.py e char_fantasma.py.
Referência: arte da wiki (Kemi com bandagens e sniper) e a descrição:
  KEMI: mulher negra de 1,60 m, dreads loiros quase brancos presos num coque alto, olhos âmbar, piercings no septo e
  nas orelhas, top branco curto com faixa preta, calça larga clara, casaco marrom amarrado na cintura, bandagens nos
  braços e mãos, coturnos pretos de cadarço.
  FANTASMA: as faixas cobrem o rosto todo (só os olhos na escuridão), sobretudo de couro marrom LONGO com gola alta e
  ombros mais escuros, faixa/cinto marrom na cintura, calça marrom com faixas enroladas na canela, coturnos, faixas
  soltas penduradas dos braços. O rifle (com lodo pingando) é adicionado em código.
"""
import math, random
from lib import *
from mathutils import Vector


def build(ghost, OUT):
    b = Builder(width=0.88, bulk=0.9, height=0.89)  # 1,60 m
    sk = b.sk
    H = sk.h
    hz = sk['hips'].z
    top = 1.55 * H

    skin = material('skin_kemi', '#5a3a28', 0.75)
    band = material('bandage', '#ddd2ba', 0.95)
    band_dk = material('bandage_dirty', '#b8aa8c', 0.95)
    boots = material('boots_kemi', '#141416', 0.55)
    laces = material('laces_kemi', '#c8c0b0', 0.8)
    silver = material('silver_kemi', '#c0c0c8', 0.3, metal=0.9)
    hairm = material('dreads_kemi', '#e6d9aa', 0.75)
    if ghost:
        M = {
            'skin': skin,
            'face': material('face_fantasma', '#ffffff', 0.85),
            'torso': material('coat_fantasma', '#3e2e22', 0.7),
            'arm': material('coat_fantasma', '#3e2e22', 0.7),
            'legs': material('pants_fantasma', '#4a3c2e', 0.9),
            'feet': boots,
        }
    else:
        M = {
            'skin': skin,
            'face': material('face_kemi', '#ffffff', 0.75),
            'torso': material('top_kemi', '#e8e4dc', 0.8),  # regata branca
            'arm': skin,
            'legs': material('pants_kemi', '#6e5a44', 0.9),
            'feet': boots,
        }
    hc = b.body(M, [(-0.11, 0.158), (0.0, 0.15), (0.17, 0.132), (0.36, 0.182), (0.47, 0.19), (0.57, 0.104), (0.63, 0.062)],
                arm_r=(0.056, 0.046, 0.039), leg_r=(0.08, 0.062, 0.05), head_r=(0.132, 0.142, 0.156))

    # ---------------- calça larga: pernas mais largas que o corpo até o coturno
    for side in ('L', 'R'):
        l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
        b.add('pants_wide' + side, tube(limb_rings(l + Vector((0, 0, 0.02)), k.lerp(f, 0.62), 0.088, 0.078, n=5, bulge=0.012), 14), M['legs'], region='leg' + side)
        # coturno: cano alto com cadarço cruzado
        b.add('boot_shaft' + side, tube(limb_rings(k.lerp(f, 0.6), k.lerp(f, 0.98), 0.06, 0.056, n=2), 14), boots, region='k' + side, subdiv=0)
        lc = []
        for i in range(5):
            p0 = k.lerp(f, 0.64 + i * 0.07)
            lc.append(tube([(p0.x - 0.022, p0.y - 0.058, p0.z, 0.004, 0.004), (p0.x + 0.022, p0.y - 0.058, p0.z - 0.025, 0.004, 0.004)], 4))
            lc.append(tube([(p0.x + 0.022, p0.y - 0.058, p0.z, 0.004, 0.004), (p0.x - 0.022, p0.y - 0.058, p0.z - 0.025, 0.004, 0.004)], 4))
        b.add('laces' + side, merge(*lc), laces, region='k' + side, subdiv=0)
        if ghost:
            # faixas enroladas na canela, por cima da calça
            wr = [tube(limb_rings(k.lerp(f, 0.2 + i * 0.1), k.lerp(f, 0.24 + i * 0.1), 0.083 - i * 0.003, 0.082 - i * 0.003, n=1), 14) for i in range(4)]
            b.add('shin_wraps' + side, merge(*wr), band, region='k' + side, subdiv=0)

    # ---------------- bandagens nos antebraços e mãos (as duas formas)
    for side in ('L', 'R'):
        e, h = sk['e' + side], sk['hand' + side]
        rr = 0.052 if ghost else 0.046
        wr = [tube(limb_rings(e.lerp(h, 0.12 + i * 0.16), e.lerp(h, 0.2 + i * 0.16), rr - i * 0.002, rr - i * 0.002, n=1), 12) for i in range(5)]
        b.add('arm_wraps' + side, merge(*wr), band, region='e' + side, subdiv=0)
        b.add('hand_wrap' + side, tube(limb_rings(h + Vector((0, 0, 0.02)), h + Vector((0, 0, -0.03)), 0.046, 0.044, n=1), 12), band_dk, region='hand' + side, subdiv=0)
        # pontas soltas penduradas
        p = e.lerp(h, 0.5)
        sx = 1 if side == 'L' else -1
        tails = [tube([(p.x + sx * 0.04, p.y + 0.01, p.z, 0.012, 0.004), (p.x + sx * 0.05, p.y + 0.02, p.z - 0.12 - k * 0.04, 0.011, 0.003)], 4) for k in range(2 if ghost else 1)]
        b.add('arm_tails' + side, merge(*tails), band, region='e' + side, subdiv=0)

    K_TX, K_TY = b.k_tx, b.k_ty
    if ghost:
        # ---------------- SOBRETUDO de couro marrom até abaixo do joelho, quase fechado, gola alta
        coat = M['torso']
        coat_in = material('coat_fantasma_in', '#2a1e16', 0.9)
        GAP, SEG, ROWS = 0.04, 52, 14

        def coat_len(a):
            return (0.95 - 0.08 * max(0.0, math.cos(a)) ** 2) * H

        def coat_pt(a, v, out=1.0):
            s = min(1.0, v * 3.2) ** 0.7
            rx = 0.185 * H + (0.235 * H - 0.185 * H) * s + v * 0.06 * H
            ry = 0.125 * H + (0.165 * H - 0.125 * H) * s + v * 0.06 * H
            fold = 1 + 0.035 * v * math.sin(a * 7)
            z = top + 0.01 * H - v * coat_len(a)
            return (math.sin(a) * rx * fold * out / K_TX, -math.cos(a) * ry * fold * out / K_TY, z)

        def coat_mesh(out=1.0, flip=False):
            verts, faces, uvs = [], [], []
            for i in range(ROWS + 1):
                v = i / ROWS
                for s in range(SEG + 1):
                    t = GAP + (1 - 2 * GAP) * s / SEG
                    verts.append(coat_pt(t * TAU, v, out))
                    uvs.append((s / SEG, 1 - v))
            row = SEG + 1
            for i in range(ROWS):
                for s in range(SEG):
                    p = i * row + s
                    f = (p, p + 1, p + 1 + row, p + row)
                    faces.append(tuple(reversed(f)) if flip else f)
            return verts, faces, uvs

        def coat_weights(p):
            side = 'L' if p.x > 0 else 'R'
            w_leg = smoothstep(hz - 0.05 * H, hz - 0.45 * H, p.z) * 0.45
            w_hip = smoothstep(hz + 0.25 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
            return {'chest': max(0.0, 1 - w_leg - w_hip), 'hips': w_hip, 'l' + side: w_leg}

        b.add('coat', coat_mesh(), coat, region='torso', weight_fn=coat_weights, subdiv=0)
        b.add('coat_in', coat_mesh(0.975, flip=True), coat_in, region='torso', weight_fn=coat_weights, subdiv=0)
        for side in ('L', 'R'):
            sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
            b.add('coatsleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.04)), sh.lerp(e, 0.95), 0.07, 0.062, n=3), 14), coat, region='arm' + side)
            b.add('coatfore' + side, tube(limb_rings(e.lerp(h, 0.0), e.lerp(h, 0.55), 0.058, 0.056, n=2), 14), coat, region='e' + side, subdiv=0)
            # ombros mais escuros (couro remendado)
            b.add('shoulder_patch' + side, ellipsoid((sh.x * 1.02, sh.y, sh.z + 0.02), (0.075, 0.075, 0.05), 12, 6, theta_max=math.pi * 0.55), coat_in, region='s' + side, subdiv=0)
        # gola alta aberta na frente
        b.add('collar', open_tube([(top - 0.03 * H, 0.11 * H, 0.09 * H), (top + 0.06 * H, 0.105 * H, 0.09 * H), (top + 0.16 * H, 0.12 * H, 0.105 * H)], gap=0.1, seg=18), coat, region='chest', subdiv=0)
        b.add('collar_in', open_tube([(top - 0.03 * H, 0.105 * H, 0.085 * H), (top + 0.06 * H, 0.1 * H, 0.085 * H), (top + 0.155 * H, 0.115 * H, 0.1 * H)], gap=0.1, seg=18), coat_in, region='chest', subdiv=0)
        # faixa/cinto na cintura com a ponta caindo na frente
        b.add('sash', tube([(0, 0, hz + 0.06 * H, 0.2 * H, 0.15 * H), (0, 0, hz + 0.11 * H, 0.2 * H, 0.15 * H)], 22), coat_in, region='torso', subdiv=0)
        b.add('sash_tail', tube([(0.05, -0.15 * H, hz + 0.08 * H, 0.03, 0.01), (0.07, -0.16 * H, hz - 0.12 * H, 0.03, 0.01), (0.06, -0.16 * H, hz - 0.3 * H, 0.025, 0.008)], 6), band_dk, region='torso', subdiv=0)
        # alça da bandoleira do rifle cruzando o peito
        b.add('strap', tube([(0.17 * H, -0.06, top - 0.02 * H, 0.012, 0.006), (0, -0.15 * H, hz + 0.35 * H, 0.012, 0.006), (-0.18 * H, -0.08, hz + 0.1 * H, 0.012, 0.006)], 6), material('strap_dark', '#1e1612', 0.7), region='torso', subdiv=0)
    else:
        # ---------------- faixa preta na cintura, pano marrom longo caindo do lado esquerdo até a canela,
        # faixas enroladas nas pernas e a mochila cinza nas costas (referência de costas)
        brown = material('coat_kemi', '#5a4632', 0.85)
        b.add('waistband', tube([(0, 0, hz + 0.04 * H, 0.162 * H, 0.122 * H), (0, 0, hz + 0.1 * H, 0.16 * H, 0.12 * H)], 20), material('band_black', '#141416', 0.7), region='torso', subdiv=0)
        b.add('drape', tube([(0.1 * H, 0.02, hz + 0.04 * H, 0.09 * H, 0.05 * H), (0.13 * H, 0.03, hz - 0.3 * H, 0.1 * H, 0.05 * H), (0.13 * H, 0.03, hz - 0.68 * H, 0.1 * H, 0.05 * H)], 12, cap_start=False, cap_end=False), brown, region='legL')
        for side in ('L', 'R'):
            l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
            wr = [tube(limb_rings(l.lerp(f, 0.3 + i * 0.13), l.lerp(f, 0.33 + i * 0.13), 0.09, 0.089, n=1), 14) for i in range(4)]
            b.add('leg_wraps' + side, merge(*wr), band, region='leg' + side, subdiv=0)
        grey = material('backpack', '#3a3e42', 0.7)
        b.add('backpack', box((0, 0.17 * H, hz + 0.38 * H), (0.26 * H, 0.1 * H, 0.3 * H), bevel=0.02), grey, region='chest', subdiv=0)
        for sx in (1, -1):
            b.add(f'pack_strap{sx}', tube([(sx * 0.09 * H, 0.12 * H, top + 0.01 * H, 0.012, 0.006), (sx * 0.1 * H, -0.12 * H, top - 0.06 * H, 0.012, 0.006), (sx * 0.12 * H, -0.1 * H, hz + 0.3 * H, 0.012, 0.006)], 6), band, region='chest', subdiv=0)

    # ---------------- cabeça: dreads loiros quase brancos num coque alto + algumas mechas soltas
    b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.012), (0.142 * H, 0.152 * H, 0.164 * H), front=0.24, side=0.44, back=0.62), hairm, region='head')
    # rabo ALTO preso com faixa, dreads longos caindo até o meio das costas + mechas soltas na frente do rosto
    tie = Vector((hc.x, hc.y + 0.1 * H, hc.z + 0.15 * H))
    random.seed(7)
    dr = []
    for i in range(14):
        a = i / 14 * TAU
        root = Vector((hc.x + math.sin(a) * 0.12 * H, hc.y - math.cos(a) * 0.12 * H, hc.z + 0.05 * H))
        dr.append(tube([(root.x, root.y, root.z, 0.015, 0.015), (tie.x, tie.y, tie.z, 0.013, 0.013)], 6))
    for i in range(14):
        a = i / 14 * TAU
        pts = []
        ln = (0.5 + 0.15 * random.random()) * H
        for k in range(8):
            t = k / 7
            p = tie + Vector((math.sin(a) * (0.03 + 0.05 * t), 0.03 + math.cos(a) * 0.03 + 0.06 * t - 0.05 * t * t, 0.04 * (1 - t) * 2 - ln * t * t))
            pts.append((p.x, p.y, p.z, 0.014, 0.014))
        dr.append(tube(pts, 6))
    for sx in (1, -1):
        for j in range(2):
            s0 = Vector((sx * (0.09 + j * 0.03) * H, hc.y - 0.1 * H, hc.z + 0.1 * H))
            dr.append(tube([(s0.x, s0.y, s0.z, 0.013, 0.013), (s0.x + sx * 0.03, s0.y - 0.03, hc.z - 0.1 * H, 0.013, 0.013), (s0.x + sx * 0.02, s0.y - 0.02, hc.z - 0.3 * H, 0.012, 0.012)], 6))
    b.add('hair_tie', tube([(tie.x, tie.y, tie.z - 0.02, 0.03, 0.03), (tie.x, tie.y, tie.z + 0.03, 0.03, 0.03)], 10), band, region='head', subdiv=0)
    b.add('dreads', merge(*dr), hairm, region='head', subdiv=0)
    # piercings nas orelhas
    pr = []
    for s in (1, -1):
        for k in range(3):
            pr.append(tube([(s * (0.138 * H + 0.006), hc.y + 0.01 + k * 0.012, hc.z - 0.02 - k * 0.02, 0.009, 0.009), (s * (0.138 * H + 0.012), hc.y + 0.01 + k * 0.012, hc.z - 0.02 - k * 0.02, 0.009, 0.009)], 8, cap_start=False, cap_end=False))
    b.add('piercings', merge(*pr), silver, region='head', subdiv=0)
    if ghost:
        # faixas por cima do cabelo, dando a volta na cabeça, e pontas soltas atrás
        hw = []
        for k in range(3):
            z = hc.z + 0.09 * H - k * 0.05 * H
            hw.append(tube([(0, hc.y, z, 0.148 * H, 0.158 * H), (0, hc.y, z + 0.02, 0.146 * H, 0.156 * H)], 22, cap_start=False, cap_end=False))
        hw.append(tube([(0.02, hc.y + 0.15 * H, hc.z + 0.04 * H, 0.016, 0.005), (0.04, hc.y + 0.2 * H, hc.z - 0.12 * H, 0.016, 0.005)], 4))
        hw.append(tube([(-0.02, hc.y + 0.15 * H, hc.z + 0.03 * H, 0.016, 0.005), (-0.05, hc.y + 0.19 * H, hc.z - 0.18 * H, 0.016, 0.005)], 4))
        b.add('head_wraps', merge(*hw), band, region='head', subdiv=0)

    b.export(OUT)
