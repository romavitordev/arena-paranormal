"""
Corpo compartilhado do ARNALDO FRITZ e do ANFITRIÃO (forma dele) — usado por char_arnaldo.py e char_anfitriao.py.
Época: Desconjuração/Calamidade (wiki colada pelo usuário):
  ARNALDO: ~50 anos, cabelo arrumado e barba CASTANHOS, óculos finos e arredondados (em código: props.js); casaco
  meio longo ESCURO (gola alta, aberto), camisa social BRANCA, gravata VERMELHA, colete MARROM, calça e sapatos
  MARRONS; relógio de bolso de OURO no bolso do colete (corrente; o relógio em si é prop em código).
  ANFITRIÃO: as MESMAS ROUPAS do dia em que a Relíquia apareceu; o corpo vira matéria caótica da Energia (roxo/rosa/
  azul, emissivo); MÁSCARA DE GÁS FIXA no rosto com o Símbolo do Anfitrião e olhos roxos; um CABO sai do peito até o
  relógio no braço esquerdo (em código, acompanha o braço); CABOS enrolados pelo corpo todo; aura roxa (em código).
"""
import math
from lib import *
from mathutils import Vector


def lower_shell(center, radii, upto=0.42, phi=(0.2, 0.8), seg=20, rings=8):
    """Casca da parte de BAIXO de um elipsoide (barba): vai do queixo até `upto`·pi para cima, só na frente (phi)."""
    v, f, u = ellipsoid(center, radii, seg, rings, theta_max=math.pi * upto, phi=phi)
    cz = center[2]
    v = [(x, y, 2 * cz - z) for (x, y, z) in v]  # espelha em Z: vira a parte de baixo
    f = [tuple(reversed(face)) for face in f]  # mantém as normais para fora
    return v, f, u


def build(kind, OUT):
    host = kind == 'anfitriao'
    b = Builder(width=1.0, bulk=1.0, height=1.02)
    sk = b.sk
    H = sk.h
    hz = sk['hips'].z
    top = 1.55 * H

    if host:
        # matéria caótica da Energia: roxo emissivo (a textura alterna rosa e azul em veias)
        skin = material('skin_anfitriao', '#ffffff', 0.5, emission='#5a1aa0', strength=0.5)
        face = material('face_anfitriao', '#ffffff', 0.5, emission='#5a1aa0', strength=0.5)
    else:
        skin = material('skin_arnaldo', '#d4a484', 0.8)
        face = material('face_arnaldo', '#ffffff', 0.8)
    coat = material('coat_arnaldo', '#ffffff', 0.85)  # casaco meio longo escuro (textura de lã)
    M = {
        'skin': skin,
        'face': face,
        'torso': material('vest_arnaldo', '#ffffff', 0.8),  # colete marrom + camisa branca em V (textura)
        'arm': coat,
        'hand': skin,
        'legs': material('pants_arnaldo', '#ffffff', 0.85),  # calça marrom (textura)
        'feet': material('shoe_arnaldo', '#4a2a16', 0.45),
    }
    shirt = material('shirt_arnaldo', '#eeeae2', 0.8)
    tie = material('tie_arnaldo', '#9a1018', 0.6)
    gold = material('gold_arnaldo', '#d4a640', 0.3, metal=0.9)
    lining = material('lining_arnaldo', '#4a1418', 0.8)  # forro vinho do casaco
    hairm = material('hair_arnaldo', '#4a2e1a', 0.55)
    hairhi = material('hairshine_arnaldo', '#7a5232', 0.4)
    beardm = material('beard_arnaldo', '#3e2614', 0.7)

    hc = b.body(M, [(-0.12, 0.168), (0.0, 0.17), (0.18, 0.166), (0.38, 0.214), (0.5, 0.226), (0.6, 0.122), (0.66, 0.07)],
                arm_r=(0.074, 0.06, 0.05), leg_r=(0.09, 0.072, 0.056), head_r=(0.136, 0.148, 0.162), neck_r=0.058)

    # ---------------- colarinho branco, gravata vermelha (nó + corpo) e a corrente de ouro do relógio no colete
    b.add('shirt_collar', tube([(0, 0.004, top + 0.02 * H, 0.074 * H, 0.07 * H), (0, 0.006, top + 0.07 * H, 0.066 * H, 0.062 * H)], 16), shirt, region='neck', subdiv=0)
    b.add('tie_knot', ellipsoid((0, -0.071 * H, top + 0.025 * H), (0.02 * H, 0.012 * H, 0.022 * H), 8, 6), tie, region='torso', subdiv=0)
    b.add('tie_body', tube([(0, -0.128 * H, hz + 0.53 * H, 0.016 * H, 0.004), (0, -0.142 * H, hz + 0.4 * H, 0.026 * H, 0.004), (0, -0.14 * H, hz + 0.28 * H, 0.02 * H, 0.004)], 6), tie, region='torso', subdiv=0)
    chain = []
    for k in range(9):
        t = k / 8
        x = (-0.09 + t * 0.15) * H
        z = hz + (0.22 - math.sin(t * math.pi) * 0.04) * H
        chain.append((x, -0.142 * H - 0.004, z, 0.004, 0.004))
    b.add('watch_chain', tube(chain, 5), gold, region='torso', subdiv=0)
    b.add('watch_bulge', ellipsoid((0.075 * H, -0.138 * H, hz + 0.2 * H), (0.026 * H, 0.008, 0.026 * H), 8, 6), M['torso'], region='torso', subdiv=0)
    for i in range(4):  # botões do colete
        b.add(f'vest_btn{i}', ellipsoid((0, -0.143 * H, hz + (0.12 + i * 0.06) * H), (0.008, 0.004, 0.008), 6, 4), gold, region='torso', subdiv=0)

    # ---------------- casaco meio longo escuro, ABERTO, com gola alta e lapelas; forro vinho
    gap = 0.11
    coat_top = [(hz + 0.0, 0.196, 0.142), (hz + 0.18, 0.19, 0.138), (hz + 0.38, 0.236, 0.162), (hz + 0.5, 0.246, 0.168), (hz + 0.58, 0.168, 0.124), (hz + 0.63, 0.114, 0.094)]
    coat_top = [(z, rx * H, ry * H) for z, rx, ry in coat_top]
    b.add('coat', open_tube(coat_top, gap=gap, seg=26), coat, region='torso')
    skirt = [(hz + 0.05 * H, 0.206 * H, 0.15 * H), (hz - 0.2 * H, 0.236 * H, 0.17 * H), (hz - 0.42 * H, 0.262 * H, 0.19 * H)]
    b.add('coat_skirt', open_tube(skirt, gap=0.12, seg=26), coat, region='skirt')
    b.add('coat_lining', open_tube([(z, rx - 0.006, ry - 0.006) for z, rx, ry in skirt], gap=0.125, seg=26), lining, region='skirt', subdiv=0)
    # gola alta virada (sobe em volta do pescoço, aberta na frente)
    b.add('coat_collar', open_tube([(top - 0.01 * H, 0.118 * H, 0.098 * H), (top + 0.06 * H, 0.112 * H, 0.096 * H), (top + 0.12 * H, 0.124 * H, 0.106 * H)], gap=0.16, seg=20), coat, region='neck', subdiv=0)
    # lapelas largas descendo do colarinho até a cintura
    for s in (1, -1):
        lap = []
        for k in range(5):
            t = k / 4
            lap.append((s * (0.07 + 0.05 * math.sin(t * math.pi)) * H, -(0.13 + 0.03 * (1 - t)) * H, top - (0.02 + t * 0.32) * H, 0.03 * H * (1 - 0.5 * t) + 0.01, 0.006))
        b.add(f'lapel{s}', tube(lap, 6), coat, region='torso', subdiv=0)
    # mangas compridas do casaco com punho
    for side in ('L', 'R'):
        sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
        b.add('cuff' + side, tube(limb_rings(e.lerp(h, 0.82), e.lerp(h, 0.9), 0.064, 0.064, n=1), 12), coat, region='arm' + side, subdiv=0)
        b.add('shirtcuff' + side, tube(limb_rings(e.lerp(h, 0.88), e.lerp(h, 0.93), 0.054, 0.054, n=1), 12), shirt, region='arm' + side, subdiv=0)

    if host:
        _host_head(b, sk, H, hc)
    else:
        _arnaldo_head(b, sk, H, hc, hairm, hairhi, beardm)
    b.export(OUT)


def _arnaldo_head(b, sk, H, hc, hairm, hairhi, beardm):
    # ---------------- cabelo castanho ARRUMADO: massa fechada com a risca do lado e topete baixo penteado para trás
    c = Vector((hc.x, hc.y + 0.03 * H, hc.z + 0.085 * H))
    r = Vector((0.148 * H, 0.162 * H, 0.105 * H))
    parts = [
        ellipsoid(tuple(c), tuple(r), 22, 14),
        ellipsoid((hc.x - 0.02 * H, hc.y - 0.07 * H, hc.z + 0.14 * H), (0.11 * H, 0.08 * H, 0.05 * H), 16, 10),  # topete
        ellipsoid((hc.x, hc.y + 0.07 * H, hc.z + 0.0), (0.138 * H, 0.105 * H, 0.12 * H), 16, 10),  # nuca curta
    ]
    b.add('hair_volume', merge(*parts), hairm, region='head', subdiv=0)

    def strand(x, th0=0.6, th1=2.4):
        k = math.sqrt(max(0.05, 1 - (x / (r.x * 1.02)) ** 2))
        pts = []
        for n in range(8):
            th = th0 + (th1 - th0) * n / 7
            pts.append((c.x + x + 0.02 * H * math.sin(th), c.y - math.cos(th) * r.y * 1.01 * k, c.z + math.sin(th) * r.z * 1.01 * k, 0.006, 0.003))
        return tube(pts, 5)
    b.add('hair_strands', merge(*[strand((i - 2) * 0.05 * H) for i in range(5)]), hairhi, region='head', subdiv=0)
    # risca do lado esquerdo (sulco escuro)
    b.add('hair_part', tube([(0.05 * H, hc.y - 0.12 * H, hc.z + 0.16 * H, 0.004, 0.004), (0.06 * H, hc.y + 0.02 * H, hc.z + 0.19 * H, 0.004, 0.004)], 4), beardm, region='head', subdiv=0)
    # ---------------- barba castanha curta e bem aparada (casca sobre o queixo e as bochechas) + bigode
    b.add('beard', lower_shell((hc.x, hc.y - 0.004, hc.z - 0.02 * H), (0.14 * H, 0.152 * H, 0.168 * H), upto=0.27, phi=(0.26, 0.74)), beardm, region='head', subdiv=0)  # só o queixo e a linha da mandíbula (a boca fica livre)
    mx = []
    for s in (1, -1):
        mx.append(ellipsoid((hc.x + s * 0.024 * H, hc.y - 0.15 * H, hc.z - 0.066 * H), (0.03 * H, 0.012 * H, 0.011 * H), 8, 6))
    b.add('mustache', merge(*mx), beardm, region='head', subdiv=0)


def _host_head(b, sk, H, hc):
    # ---------------- MÁSCARA DE GÁS fundida ao rosto: concha escura, lentes redondas grandes brilhando em roxo,
    # filtro redondo na frente da boca, Símbolo do Anfitrião na testa, alças e cabos saindo da máscara
    rubber = material('mask_anfitriao', '#1a1420', 0.45)
    glowp = material('eyes_anfitriao', '#b040ff', 0.4, emission='#b040ff', strength=1.6)  # olhos roxos (forte demais estoura para branco)
    sym = material('symbol_anfitriao', '#ff8ad8', 0.4, emission='#ff6ad0', strength=4)
    cab = [material('cable_pink', '#ff4ad0', 0.4, emission='#ff4ad0', strength=3),
           material('cable_blue', '#4ab8ff', 0.4, emission='#4ab8ff', strength=3),
           material('cable_yellow', '#ffe04a', 0.4, emission='#ffe04a', strength=3),
           material('cable_green', '#5aff8a', 0.4, emission='#5aff8a', strength=3)]
    # capuz de borracha cobrindo a cabeça (a máscara "engoliu" o cabelo) e a concha da frente
    b.add('mask_hood', ellipsoid((hc.x, hc.y + 0.01 * H, hc.z + 0.01 * H), (0.146 * H, 0.158 * H, 0.17 * H), 22, 14), rubber, region='head', subdiv=0)
    b.add('mask_front', ellipsoid((hc.x, hc.y - 0.06 * H, hc.z - 0.01 * H), (0.13 * H, 0.11 * H, 0.15 * H), 20, 12, phi=(0.25, 0.75)), rubber, region='head', subdiv=0)
    for s in (1, -1):
        ex, ey, ez = hc.x + s * 0.05 * H, hc.y - 0.168 * H, hc.z + 0.02 * H
        b.add(f'lens_rim{s}', tube([(ex, ey + 0.01, ez, 0.042 * H, 0.042 * H), (ex, ey - 0.012, ez, 0.044 * H, 0.044 * H)], 16), rubber, region='head', subdiv=0)
        b.add(f'lens{s}', ellipsoid((ex, ey - 0.008, ez), (0.036 * H, 0.008, 0.036 * H), 14, 6), glowp, region='head', subdiv=0)
    b.add('filter', tube([(hc.x, hc.y - 0.16 * H, hc.z - 0.085 * H, 0.04 * H, 0.04 * H), (hc.x, hc.y - 0.215 * H, hc.z - 0.095 * H, 0.05 * H, 0.05 * H)], 16), rubber, region='head', subdiv=0)
    b.add('filter_cap', ellipsoid((hc.x, hc.y - 0.218 * H, hc.z - 0.095 * H), (0.048 * H, 0.008, 0.048 * H), 14, 6), glowp, region='head', subdiv=0)
    # Símbolo do Anfitrião na testa (triângulo + olho)
    tri = []
    for k in range(4):
        a = k / 3 * math.tau + math.pi / 2
        tri.append((hc.x + math.cos(a) * 0.03 * H, hc.y - 0.158 * H, hc.z + 0.1 * H + math.sin(a) * 0.03 * H, 0.004, 0.004))
    b.add('host_symbol', merge(tube(tri, 4), ellipsoid((hc.x, hc.y - 0.16 * H, hc.z + 0.1 * H), (0.008, 0.004, 0.008), 6, 4)), sym, region='head', subdiv=0)
    # alças em volta da cabeça
    for z in (0.06, -0.02):
        b.add(f'strap{z}', tube([(hc.x, hc.y + 0.01 * H, hc.z + z * H, 0.15 * H, 0.162 * H), (hc.x, hc.y + 0.01 * H, hc.z + (z + 0.018) * H, 0.15 * H, 0.162 * H)], 20), rubber, region='head', subdiv=0)
    # cabos saindo da máscara (das laterais do filtro, descendo pelo pescoço até o peito)
    for i, s in enumerate((1, -1, 1, -1)):
        pts = []
        for k in range(7):
            t = k / 6
            pts.append((hc.x + s * (0.05 + 0.08 * t + 0.02 * i) * H, hc.y - (0.17 - 0.12 * t) * H, hc.z - (0.1 + t * 0.32) * H, 0.007, 0.007))
        b.add(f'mask_cable{i}', tube(pts, 6), cab[i], region='torso' if i % 2 else 'neck', subdiv=0)
    # os cabos enrolados pelo corpo (tronco, braços, pernas) ficam em código: anéis finos que balançam (props.js)
