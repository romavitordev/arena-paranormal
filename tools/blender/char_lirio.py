"""
LÍRIO TELLINI — public/models/lirio.glb
Referência: arte promocional de Sinais do Outro Lado e miniaturas de combate (wiki). Os Cinco, "a parede".
1,85 m, alto e robusto, pele clara. Cabelo loiro LONGO até o ombro, o alto jogado para trás, com uma mecha laranja;
barba aparada com a costeleta maior. Camisa azul de mangas rasgadas (emblema branco no peito); sobretudo azul escuro
com pelugem branca na gola, nos punhos e na barra; luva marrom com pelugem e uma pata dourada na mão DIREITA; pano
laranja amarrado na mão ESQUERDA; calça cinza e botas marrons. Cicatrizes e ataduras nos braços. Colar militar com o
nome "Voytek". Proteções por cima: ombreira de couro, joelheiras, alças com bolsas e bandoleira, walkie-talkie.
A marreta Leonora é adicionada em código (src/models/weapons.js).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'lirio.glb'
b = Builder(width=1.04, bulk=1.1, height=1.03)  # 1,85 m, ombros largos
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_lirio', '#e8c0a2', 0.8),
    'face': material('face_lirio', '#ffffff', 0.8),
    'torso': material('shirt_lirio', '#ffffff', 0.85),  # camisa azul com o emblema
    'arm': material('arms_lirio', '#ffffff', 0.8),  # antebraços com cicatrizes e ataduras
    'handR': material('glove_lirio', '#6a4428', 0.7),
    'handL': material('skin_lirio', '#e8c0a2', 0.8),
    'legs': material('pants_lirio', '#6e6e70', 0.9),
    'feet': material('boot_lirio', '#5a3820', 0.7),
}
coat = material('coat_lirio', '#1c2a44', 0.85)
coat_in = material('coat_lining', '#121a2c', 0.9)
fur = material('fur_white', '#e8e4dc', 0.95)
blue = material('shirt_blue', '#2c4f8a', 0.85)
leather = material('leather_lirio', '#6a4426', 0.75)
leather_dk = material('leather_dark', '#3e2614', 0.8)
gold = material('gold_paw', '#d0a640', 0.35, metal=0.8)
orange = material('cloth_orange', '#d9822a', 0.85)
silver = material('dogtag_silver', '#b8b8c0', 0.3, metal=0.9)
hairm = material('hair_lirio', '#b8903e', 0.55)
streak = material('hair_orange', '#d0702a', 0.55)
beardm = material('beard_lirio', '#a07c34', 0.7)
wrap = material('bandage', '#e0d6c0', 0.9)
radio = material('radio_black', '#232326', 0.5)

hc = b.body(M, [(-0.12, 0.175), (0.0, 0.178), (0.17, 0.17), (0.36, 0.22), (0.48, 0.236), (0.58, 0.126), (0.65, 0.074)],
            arm_r=(0.066, 0.056, 0.048), leg_r=(0.082, 0.064, 0.052), head_r=(0.138, 0.148, 0.16), neck_r=0.066)

# ---------------- camisa: mangas curtas RASGADAS (bordas irregulares) por cima dos braços
random.seed(7)
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), sh.lerp(e, 0.62), 0.078, 0.072, n=3), 14), blue, region='arm' + side)
    # farrapos pendurados na borda rasgada
    rag = []
    for k in range(6):
        a = k / 6 * TAU + random.random() * 0.4
        p = sh.lerp(e, 0.6)
        r = 0.074
        rag.append(cone((p.x + math.sin(a) * r, p.y + math.cos(a) * r, p.z), (p.x + math.sin(a) * r * 1.05, p.y + math.cos(a) * r * 1.05, p.z - 0.03 - random.random() * 0.03), 0.014, 3))
    b.add('rag' + side, merge(*rag), blue, region='arm' + side, subdiv=0)
    # ataduras no antebraço (faixas)
    h = sk['hand' + side]
    for k in range(3):
        p0 = e.lerp(h, 0.25 + k * 0.2)
        b.add(f'bandage{side}{k}', tube([(p0.x, p0.y, p0.z, 0.054, 0.054), (p0.x, p0.y, p0.z - 0.025, 0.053, 0.053)], 10), wrap, region='arm' + side, subdiv=0)

# ---------------- SOBRETUDO azul escuro (aberto na frente, até os joelhos) com mangas até o cotovelo
K_TX, K_TY = b.k_tx, b.k_ty
GAP = 0.1
SEG, ROWS = 52, 14


def coat_len(a):
    return (0.9 - 0.1 * max(0.0, math.cos(a)) ** 2) * H


def coat_pt(a, v, out=1.0):
    s = min(1.0, v * 3.2) ** 0.7
    rx = 0.2 * H + (0.27 * H - 0.2 * H) * s + v * 0.05 * H
    ry = 0.13 * H + (0.18 * H - 0.13 * H) * s + v * 0.06 * H
    fold = 1 + 0.04 * v * math.sin(a * 7)
    z = top - v * coat_len(a)
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
    # parte de cima no peito; abaixo da cintura acompanha o quadril e um pouco a perna do lado
    side = 'L' if p.x > 0 else 'R'
    w_leg = smoothstep(hz - 0.05 * H, hz - 0.45 * H, p.z) * 0.45
    w_hip = smoothstep(hz + 0.25 * H, hz - 0.05 * H, p.z) * (1 - w_leg)
    w_chest = max(0.0, 1 - w_leg - w_hip)
    return {'chest': w_chest, 'hips': w_hip, 'l' + side: w_leg}


b.add('coat', coat_mesh(), coat, region='torso', weight_fn=coat_weights, subdiv=0)
b.add('coat_in', coat_mesh(0.975, flip=True), coat_in, region='torso', weight_fn=coat_weights, subdiv=0)
# mangas do sobretudo (do ombro ao cotovelo) com pelugem no punho
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('coatsleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.05)), sh.lerp(e, 0.92), 0.088, 0.08, n=3), 14), coat, region='arm' + side)
    b.add('furcuff' + side, tube(limb_rings(sh.lerp(e, 0.86), sh.lerp(e, 1.0), 0.094, 0.092, n=1), 14), fur, region='arm' + side, subdiv=0)
# pelugem branca: gola grande e barra do sobretudo (tufos)
b.add('fur_collar', tube([(0, 0.01, top - 0.04 * H, 0.16 * H, 0.12 * H), (0, 0.015, top + 0.02 * H, 0.155 * H, 0.12 * H), (0, 0.02, top + 0.07 * H, 0.11 * H, 0.09 * H)], 22), fur, region='torso')
tufts = []
for s in range(60):  # barra: tufos sobrepostos formam uma faixa contínua de pelo
    t = GAP + (1 - 2 * GAP) * s / 59
    a = t * TAU
    x, y, z = coat_pt(a, 1.0, 1.02)
    tufts.append(ellipsoid((x, y, z + 0.02), (0.045, 0.034, 0.042 + 0.008 * (s % 3)), 6, 4))
for s in (1, -1):  # bordas da frente
    for k in range(22):
        v = k / 21
        x, y, z = coat_pt((GAP if s > 0 else 1 - GAP) * TAU, v, 1.02)
        tufts.append(ellipsoid((x, y, z), (0.032, 0.03, 0.045), 6, 4))
b.add('fur_trim', merge(*tufts), fur, region='torso', weight_fn=coat_weights, subdiv=0)

# ---------------- proteções: ombreira de couro no ombro ESQUERDO, joelheiras, alças com bolsas e bandoleira
sL = sk['sL']
pad = [ellipsoid((sL.x + 0.01, sL.y, sL.z + 0.03 - k * 0.045), (0.1 - k * 0.006, 0.1, 0.035), 12, 6, theta_max=math.pi * 0.55) for k in range(3)]
b.add('pauldron', merge(*pad), leather, region='sL', subdiv=0)
for side in ('L', 'R'):
    k = sk['k' + side]
    b.add('kneepad' + side, ellipsoid((k.x, k.y - 0.07, k.z), (0.068, 0.04, 0.075), 10, 8), leather, region='k' + side, subdiv=0)
    # botas marrons com pelugem no cano
    f = sk['foot' + side]
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.55), f + Vector((0, 0, 0.05)), 0.064, 0.064, n=3), 12), M['feet'], region='k' + side)
    b.add('bootfur' + side, tube(limb_rings(k.lerp(f, 0.52), k.lerp(f, 0.6), 0.074, 0.074, n=1), 12), fur, region='k' + side, subdiv=0)
    b.add('bootsole' + side, box((f.x, f.y - 0.05, f.z - 0.02), (0.112 * H, 0.27 * H, 0.03)), leather_dk, region='k' + side, subdiv=0)
# arreio: alças dos ombros até a cintura + faixa no peito
for s in (1, -1):
    b.add(f'strap{s}', tube([(s * 0.12 * H, -0.02 * H, top + 0.01 * H, 0.022, 0.008), (s * 0.12 * H, -0.16 * H, hz + 0.42 * H, 0.022, 0.008), (s * 0.13 * H, -0.15 * H, hz + 0.1 * H, 0.022, 0.008)], 6), leather_dk, region='torso', subdiv=0)
b.add('chest_strap', tube([(-0.14 * H, -0.165 * H, hz + 0.38 * H, 0.016, 0.008), (0.14 * H, -0.165 * H, hz + 0.38 * H, 0.016, 0.008)], 6), leather_dk, region='torso', subdiv=0)
b.add('bandolier', tube([(0.15 * H, -0.15 * H, top - 0.02 * H, 0.024, 0.009), (-0.02 * H, -0.18 * H, hz + 0.3 * H, 0.024, 0.009), (-0.2 * H, -0.06 * H, hz + 0.08 * H, 0.024, 0.009)], 6), leather, region='torso', subdiv=0)
b.add('belt', tube([(0, 0, hz + 0.07 * H, 0.186 * H, 0.138 * H), (0, 0, hz + 0.11 * H, 0.186 * H, 0.138 * H)], 22), leather_dk, region='torso', subdiv=0)
b.add('buckle', box((0, -0.142 * H, hz + 0.09 * H), (0.05, 0.012, 0.04)), gold, region='torso', subdiv=0)
for k, a in enumerate((-0.8, -0.35, 0.45, 0.9)):
    p = Vector((math.sin(a) * 0.192 * H, -math.cos(a) * 0.144 * H, hz + 0.05 * H))
    b.add(f'pouch{k}', box(tuple(p), (0.065, 0.045, 0.075), bevel=0.006), leather, region='torso', subdiv=0)
# walkie-talkie na alça e broche dourado (pata)
b.add('walkie', merge(box((0.12 * H, -0.17 * H, hz + 0.47 * H), (0.04, 0.025, 0.07), bevel=0.004), cone((0.135 * H, -0.17 * H, hz + 0.5 * H), (0.135 * H, -0.17 * H, hz + 0.56 * H), 0.004, 4)), radio, region='torso', subdiv=0)
b.add('paw_brooch', merge(ellipsoid((-0.12 * H, -0.175 * H, hz + 0.47 * H), (0.016, 0.006, 0.014), 8, 4),
                          *[ellipsoid((-0.12 * H + dx, -0.176 * H, hz + 0.488 * H + dz), (0.006, 0.004, 0.006), 6, 3) for dx, dz in ((-0.014, 0), (-0.005, 0.008), (0.005, 0.008), (0.014, 0))]), gold, region='torso', subdiv=0)
# colar militar com a plaqueta "Voytek"
b.add('dogtag_chain', tube([(-0.06 * H, -0.06 * H, top + 0.05 * H, 0.004, 0.004), (0, -0.155 * H, hz + 0.56 * H, 0.004, 0.004), (0.06 * H, -0.06 * H, top + 0.05 * H, 0.004, 0.004)], 4), silver, region='torso', subdiv=0)
b.add('dogtag', box((0, -0.165 * H, hz + 0.54 * H), (0.022, 0.004, 0.034), bevel=0.003), silver, region='torso', subdiv=0)
# mão direita: luva com pelugem e uma PATA dourada; mão esquerda: pano laranja amarrado
hR = sk['handR']
b.add('glovefur', tube(limb_rings(hR + Vector((0, 0, 0.03)), hR + Vector((0, 0, -0.005)), 0.062, 0.06, n=1), 12), fur, region='eR', subdiv=0)
b.add('glovepaw', ellipsoid((hR.x - 0.035, hR.y - 0.02, hR.z - 0.045), (0.008, 0.022, 0.022), 8, 4), gold, region='eR', subdiv=0)
hL = sk['handL']
b.add('handcloth', merge(tube(limb_rings(hL + Vector((0, 0, 0.02)), hL + Vector((0, 0, -0.06)), 0.058, 0.06, n=2), 12),
                         cone((hL.x + 0.03, hL.y + 0.02, hL.z), (hL.x + 0.06, hL.y + 0.05, hL.z - 0.08), 0.016, 4)), orange, region='eL', subdiv=0)

# ---------------- cabelo loiro longo (até o ombro), o alto jogado para trás, mecha laranja; barba e costeleta
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.008, hc.z + 0.016), (0.148 * H, 0.158 * H, 0.17 * H), front=0.16, side=0.5, back=0.66), hairm, region='head')


def lock(root, d, ln, r, curl=0.0):
    pts = []
    for k in range(6):
        t = k / 5
        p = root + d * (ln * t) + Vector((0, curl * t * t, -ln * 0.35 * t * t))
        pts.append((p.x, p.y, p.z, r * (1 - 0.6 * t) + 0.004, r * 0.7 * (1 - 0.6 * t) + 0.004))
    return tube(pts, 7)


C = Vector((hc.x, hc.y + 0.01, hc.z))
locks = []
random.seed(31)
for i in range(24):
    a = 0.14 * TAU + (i / 23) * 0.72 * TAU  # lados e trás
    root = C + Vector((math.sin(a) * 0.14 * H, -math.cos(a) * 0.15 * H, 0.05))
    d = Vector((math.sin(a) * 0.3, -math.cos(a) * 0.3, -1)).normalized()
    locks.append(lock(root, d, 0.26 + random.random() * 0.06, 0.042))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
# o alto jogado para trás: mechas grossas saindo da testa em direção à nuca
back = []
for i in range(7):
    x = (i - 3) * 0.035 * H
    root = Vector((x, hc.y - 0.135 * H, hc.z + 0.1 * H))
    back.append(lock(root, Vector((x * 0.5, 1.0, 0.35)).normalized(), 0.2, 0.04, curl=0.0))
b.add('hair_back', merge(*back), hairm, region='head', subdiv=0)
# mecha laranja (lado esquerdo do rosto)
b.add('hair_streak', lock(C + Vector((0.1 * H, -0.12 * H, 0.08)), Vector((0.25, -0.15, -1)).normalized(), 0.24, 0.032), streak, region='head', subdiv=0)
# barba aparada colada ao rosto, costeletas maiores
beard_shell = ellipsoid((hc.x, hc.y - 0.002, hc.z), (0.142 * H, 0.152 * H, 0.165 * H), 24, 16, phi=(0.17, 0.83))


def jaw(p):
    zmax = hc.z - 0.1 * H + smoothstep(0.03, 0.12, abs(p.x)) * 0.11 * H
    return Vector((p.x, p.y, min(p.z, zmax)))


b.add('beard', xform(beard_shell, jaw), beardm, region='head')

b.export(OUT)
