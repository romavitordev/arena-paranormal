"""
AGUIAR / MUTILADOR NOTURNO — public/models/aguiar.glb
Referência: arte do Mutilador Noturno em Natal Macabro (wiki). Homem de pele clara, 1,80 m, musculoso,
cabelo preto ondulado até a nuca, barba feita, cicatrizes nos braços (textura arms_aguiar).
Camiseta branca justa; JAQUETA VERMELHA com as mangas arrancadas (bordas rasgadas); suspensório de
couro marrom cruzado em X no peito, preso num cinto de utilidades largo; braçadeiras de couro com
fivela acima do cotovelo e nos punhos; distintivo de delegado no pescoço; jeans cinza rasgado nos
joelhos; botas vermelhas e brancas com ESPORAS.
prop_maskOn: máscara branca com a MÃO VERMELHA (textura mask_mutilador) — aparece ao virar o Mutilador.
O machado é adicionado em código (ele não usa arma de fogo; arremessa o machado amarrado na corda).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'aguiar.glb'
b = Builder(width=1.04, bulk=1.1, height=1.03)
sk = b.sk
H = sk.h
hz = sk['hips'].z

M = {
    'skin': material('skin_aguiar', '#d9ad8e', 0.8),
    'face': material('face_aguiar', '#ffffff', 0.8),
    'torso': material('shirt_white', '#e4e0d6', 0.85),
    'arm': material('arms_aguiar', '#ffffff', 0.8),  # cicatrizes
    'legs': material('jeans_grey', '#4a5550', 0.9),
    'feet': material('boots_red', '#9a1e1e', 0.6),
}
red = material('jacket_red', '#9e2420', 0.8)
red_d = material('jacket_red_dark', '#6e1612', 0.85)
leather = material('leather_brown', '#4a3020', 0.7)
brass = material('brass', '#b08a3a', 0.35, metal=0.8)
hairm = material('hair_aguiar', '#0e0d0f', 0.55)
white = material('boot_white', '#e8e4dc', 0.7)
steel = material('spur_steel', '#8a8a90', 0.3, metal=0.9)
maskm = material('mask_mutilador', '#ffffff', 0.5)

hc = b.body(M, [(-0.12, 0.172), (0.0, 0.172), (0.17, 0.17), (0.36, 0.228), (0.48, 0.24), (0.58, 0.132), (0.65, 0.076)],
            arm_r=(0.08, 0.064, 0.052), leg_r=(0.094, 0.074, 0.058), head_r=(0.138, 0.148, 0.16), neck_r=0.066)
# peitoral marcado sob a camiseta justa
for s in (1, -1):
    b.add(f'pec{s}', ellipsoid((s * 0.085 * H, -0.09 * H, hz + 0.41 * H), (0.095 * H, 0.055 * H, 0.075 * H), 12, 8), M['torso'], region='torso')

# ---------------- jaqueta vermelha sem mangas (rasgadas), aberta, até o quadril
jk = [(hz - 0.06 * H, 0.2 * H, 0.15 * H), (hz + 0.16 * H, 0.19 * H, 0.142 * H), (hz + 0.36 * H, 0.238 * H, 0.165 * H), (hz + 0.48 * H, 0.248 * H, 0.17 * H), (hz + 0.57 * H, 0.17 * H, 0.124 * H), (hz + 0.63 * H, 0.118 * H, 0.1 * H)]
b.add('jacket', open_tube(jk, gap=0.13, seg=28), red, region='torso')
# gola larga levantada
b.add('collar', open_tube([(hz + 0.6 * H, 0.13 * H, 0.108 * H), (hz + 0.69 * H, 0.122 * H, 0.104 * H)], gap=0.16, seg=24), red_d, region='torso', subdiv=0)
# bordas rasgadas: fiapos nas cavas (onde as mangas foram arrancadas) e na barra
random.seed(5)
torn = []
for side in ('L', 'R'):
    sh = sk['s' + side]
    sx = 1 if side == 'L' else -1
    for i in range(9):
        a = i / 9 * TAU
        base = Vector((sh.x * 1.0 + sx * 0.03 + math.cos(a) * 0.012, sh.y + math.sin(a) * 0.09, sh.z - 0.02 + math.cos(a) * 0.07))
        tip = base + Vector((sx * (0.03 + random.random() * 0.03), math.sin(a) * 0.02, -0.03 - random.random() * 0.03))
        torn.append(cone(tuple(base), tuple(tip), 0.016, 3))
for i in range(30):
    a = 0.13 * TAU + (i / 29) * (1 - 0.26) * TAU
    base = Vector((math.sin(a) * 0.2 * H, -math.cos(a) * 0.15 * H, hz - 0.055 * H))
    torn.append(cone(tuple(base), tuple(base + Vector((0, 0, -0.03 - random.random() * 0.04))), 0.018, 3))
b.add('jacket_torn', merge(*torn), red_d, region='torso', subdiv=0)

# ---------------- suspensório de couro em X (frente e costas) + cinto de utilidades
for s in (1, -1):
    for back in (False, True):
        y = (0.17 if back else -0.15) * H
        pts = [(s * 0.1 * H, y * 0.75, 1.6 * H, 0.022, 0.008), (s * 0.02 * H, y * 1.02, hz + 0.4 * H, 0.022, 0.008), (-s * 0.1 * H, y * 0.95, hz + 0.1 * H, 0.022, 0.008)]
        b.add(f'strap{s}{int(back)}', tube(pts, 6), leather, region='torso', subdiv=0)
b.add('belt', tube([(0, 0, hz + 0.0 * H, 0.185 * H, 0.137 * H), (0, 0, hz + 0.09 * H, 0.185 * H, 0.137 * H)], 22), leather, region='torso', subdiv=0)
b.add('belt2', tube([(0, 0, hz - 0.06 * H, 0.19 * H, 0.142 * H), (0, 0, hz - 0.03 * H, 0.19 * H, 0.142 * H)], 22), leather, region='torso', subdiv=0)
b.add('buckle', box((0, -0.142 * H, hz + 0.045 * H), (0.07, 0.012, 0.055)), brass, region='torso', subdiv=0)
for k, a in enumerate((-1.1, 1.1, 2.2)):
    p = Vector((math.sin(a) * 0.192 * H, -math.cos(a) * 0.143 * H, hz + 0.03 * H))
    b.add(f'pouch{k}', box(tuple(p), (0.07, 0.045, 0.08), bevel=0.006), leather, region='torso', subdiv=0)
# corda enrolada no cinto (para amarrar no machado e arremessar)
b.add('rope_coil', merge(*[tube([(-0.2 * H, 0.0, hz - 0.06 * H + k * 0.018, 0.05 + k * 0.004, 0.05 + k * 0.004), (-0.2 * H, 0.0, hz - 0.05 * H + k * 0.018, 0.05 + k * 0.004, 0.05 + k * 0.004)], 10) for k in range(4)]), material('rope', '#8a6a44', 0.9), region='skirt', subdiv=0)
# distintivo de delegado pendurado no pescoço
b.add('badge_cord', tube([(-0.05, -0.08 * H, 1.6 * H, 0.004, 0.004), (0, -0.13 * H, 1.47 * H, 0.004, 0.004), (0.05, -0.08 * H, 1.6 * H, 0.004, 0.004)], 4), leather, region='torso', subdiv=0)
b.add('badge', ellipsoid((0, -0.135 * H, 1.45 * H), (0.03, 0.008, 0.036), 8, 6), brass, region='torso', subdiv=0)

# ---------------- braçadeiras de couro com fivela (acima do cotovelo e nos punhos)
for side in ('L', 'R'):
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    for k, (p0, p1, r) in enumerate(((sh.lerp(e, 0.62), sh.lerp(e, 0.78), 0.072), (e.lerp(h, 0.72), e.lerp(h, 0.92), 0.058))):
        b.add(f'armband{side}{k}', tube(limb_rings(p0, p1, r, r, n=1), 12), leather, region='arm' + side, subdiv=0)
        c = p0.lerp(p1, 0.5)
        sx = 1 if side == 'L' else -1
        b.add(f'armbuckle{side}{k}', box((c.x + sx * r * 0.95, c.y, c.z), (0.01, 0.03, 0.03)), brass, region='arm' + side, subdiv=0)

# ---------------- jeans rasgado nos joelhos, botas vermelhas/brancas com esporas
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('rip' + side, ellipsoid((k.x, k.y - 0.075, k.z), (0.045, 0.012, 0.035), 8, 6), M['skin'], region='l' + side, subdiv=0)
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.62), f + Vector((0, 0, 0.05)), 0.062, 0.062, n=3), 12), M['feet'], region='k' + side)
    b.add('bootcuff' + side, tube(limb_rings(k.lerp(f, 0.6), k.lerp(f, 0.66), 0.066, 0.066, n=1), 12), white, region='k' + side, subdiv=0)
    b.add('bootsole' + side, box((f.x, f.y - 0.05, f.z - 0.02), (0.108 * H, 0.255 * H, 0.03)), white, region='k' + side, subdiv=0)
    # espora: haste atrás do calcanhar + rosela estrelada
    heel = Vector((f.x, f.y + 0.07, f.z + 0.03))
    rowel = heel + Vector((0, 0.06, 0))
    spur = [tube([(heel.x, heel.y, heel.z, 0.006, 0.006), (rowel.x, rowel.y, rowel.z, 0.006, 0.006)], 5)]
    for j in range(6):
        a = j / 6 * TAU
        spur.append(cone(tuple(rowel), (rowel.x + 0.006, rowel.y + math.sin(a) * 0.035, rowel.z + math.cos(a) * 0.035), 0.008, 3))
    b.add('spur' + side, merge(*spur), steel, region='k' + side, subdiv=0)

# ---------------- cabelo preto ondulado até a nuca
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.008, hc.z + 0.016), (0.147 * H, 0.157 * H, 0.169 * H), front=0.27, side=0.46, back=0.64), hairm, region='head')


def lock(root, d, ln, r, wave=0.012):
    pts = []
    for k in range(6):
        t = k / 5
        p = root + d * (ln * t) + Vector((0, 0, -ln * 0.35 * t * t))
        p += Vector((math.sin(t * 7) * wave, math.cos(t * 7) * wave * 0.5, 0))  # ondulado
        pts.append((p.x, p.y, p.z, r * (1 - 0.7 * t) + 0.003, r * 0.65 * (1 - 0.7 * t) + 0.003))
    return tube(pts, 7)


random.seed(9)
C = Vector((hc.x, hc.y + 0.01, hc.z + 0.03))
locks = []
for layer, (zoff, n, ln, r) in enumerate([(0.12, 10, 0.11, 0.048), (0.05, 12, 0.15, 0.046), (-0.02, 11, 0.19, 0.042)]):
    for i in range(n):
        a = (i + 0.5 * layer) / n * TAU
        if math.cos(a) > (0.3 if layer == 0 else -0.1):
            continue  # rosto livre
        rad = 0.135 + layer * 0.01
        root = C + Vector((math.sin(a) * rad, -math.cos(a) * rad * 1.05, zoff))
        d = Vector((math.sin(a) * 0.6, -math.cos(a) * 0.6, -0.55 - layer * 0.2))
        d.normalize()
        locks.append(lock(root, d, ln + random.uniform(-0.02, 0.03), r))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
# mechas da frente penteadas para trás com uma caindo na testa
for i in range(5):
    x = -0.06 + i * 0.03
    root = Vector((x, -0.12, hc.z + 0.15))
    d = Vector((0.1, -0.3, -1 if i == 3 else 0.2))
    d.normalize()
    b.add(f'front{i}', lock(root, d, 0.09 if i == 3 else 0.06, 0.032, wave=0.008), hairm, region='head', subdiv=0)

# ---------------- MÁSCARA do Mutilador (frente do rosto, com relevo de testa, nariz e queixo)
shell = ellipsoid((hc.x, hc.y - 0.016, hc.z - 0.01), (0.152 * H, 0.16 * H, 0.172 * H), 22, 16, theta_max=math.pi * 0.86, phi=(0.29, 0.71))


def relief(p):
    brow = math.exp(-((p.z - (hc.z + 0.05)) ** 2) / 0.0005) * 0.014
    nose = math.exp(-(p.x ** 2) / 0.0007 - ((p.z - (hc.z - 0.02)) ** 2) / 0.0028) * 0.028
    chin = math.exp(-(p.x ** 2) / 0.004 - ((p.z - (hc.z - 0.13)) ** 2) / 0.002) * 0.012
    return Vector((p.x, p.y - brow - nose - chin, p.z))


b.add('prop_maskOn', xform(shell, relief), maskm, region='head', subdiv=1)

b.export(OUT)
