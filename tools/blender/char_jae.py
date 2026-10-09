"""
PARK JAE-YOON — "JAE" / "X" (Hexatombe) — public/models/jae.glb.
Referências: Referencias visuais/Personagens/Jae ("jae corpo", "jae de costas", "jae", "jae rosto", "jae serio", "X",
"X corpo", "shiu", "ficha").
  1,70 m, magra; traços coreanos; cabelo preto liso com franja comprida caindo sobre um olho, até a nuca; maquiagem preta
  forte nos olhos, batom vermelho, pinta no queixo (rosto pintado em src/models/textures.js → face_jae).
  Gola alta preta canelada (blusa justa). SOBRETUDO VERMELHO longo (abaixo do joelho) aberto na frente, com lapelas,
  botões dourados, tiras cinza com fivelas de latão no peito e nos braços, tiras pretas em X perto dos punhos, barra com
  faixa cinza, laços pretos em X com rebites e tiras pretas penduradas; nas costas um arnês de tiras cinza com rebites
  dourados e duas tiras cinza atravessadas. Capuz caído nas costas (o capuz posto e o X no rosto são da forma X, em código:
  props.js → jaeHood). Luvas pretas sem dedos com punho cinza/vermelho. Calça preta cargo com bolsos cinza nas coxas, cinto
  vermelho e tiras VERMELHAS em X nas coxas e nas canelas. Coturnos pretos com polainas cinza caneladas.
  O Punhal X (adaga de guarda de latão) é adicionado em código.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'jae.glb'

b = Builder(width=0.86, bulk=0.86, height=0.945)  # 1,70 m, magra
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_jae', '#e6c4a8', 0.7)
black = material('turtleneck_jae', '#1b191d', 0.9)
pants = material('pants_jae', '#1d1b1f', 0.9)
red = material('coat_jae', '#a3192a', 0.7)
red_in = material('coat_jae_in', '#5a0c16', 0.85)
strap_red = material('strap_red_jae', '#8e1622', 0.6)
grey = material('strap_grey_jae', '#9a989c', 0.6)
dark = material('strap_dark_jae', '#141216', 0.6)
brass = material('brass_jae', '#c9a24a', 0.35, metal=0.8)
glove = material('glove_jae', '#161418', 0.7)
boots = material('boots_jae', '#141416', 0.55)
gaiter = material('gaiter_jae', '#4a484e', 0.8)
hairm = material('hair_jae', '#0e0c10', 0.65)

M = {
    'skin': skin,
    'face': material('face_jae', '#ffffff', 0.75),
    'torso': black,
    'arm': red,          # mangas do sobretudo
    'hand': glove,
    'legs': pants,
    'feet': boots,
}
hc = b.body(M, [(-0.11, 0.152), (0.0, 0.146), (0.17, 0.128), (0.36, 0.17), (0.47, 0.18), (0.57, 0.1), (0.63, 0.06)],
            arm_r=(0.06, 0.05, 0.042), leg_r=(0.08, 0.062, 0.05), head_r=(0.13, 0.14, 0.155))

# ---------------- gola alta canelada
b.add('turtleneck', tube([(0, 0, 1.56 * H, 0.068 * H, 0.068 * H), (0, 0, 1.69 * H, 0.064 * H, 0.064 * H)], 16), black, region='neck', subdiv=0)

# ---------------- calça: cinto vermelho, bolsos cinza nas coxas, tiras vermelhas em X nas coxas e canelas
b.add('belt', tube([(0, 0, hz + 0.05 * H, 0.162 * H, 0.122 * H), (0, 0, hz + 0.1 * H, 0.16 * H, 0.12 * H)], 20), strap_red, region='torso', subdiv=0)
b.add('buckle', box((0, -0.122 * H, hz + 0.075 * H), (0.05 * H, 0.012, 0.045 * H), bevel=0.004), strap_red, region='torso', subdiv=0)
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    sx = 1 if side == 'L' else -1
    # bolso cargo cinza na lateral da coxa
    pk = l.lerp(k, 0.48)
    b.add('pocket' + side, box((pk.x + sx * 0.07 * H, pk.y - 0.02, pk.z), (0.03 * H, 0.08 * H, 0.07 * H), bevel=0.006), grey, region='leg' + side, subdiv=0)
    # tiras em X: duas faixas inclinadas cruzando a coxa e duas na canela
    xs = []
    for (a0, a1) in ((0.2, 0.42), (0.42, 0.2)):
        p0, p1 = l.lerp(k, a0), l.lerp(k, a1)
        xs.append(tube([(p0.x - sx * 0.085, p0.y - 0.075, p0.z, 0.012, 0.006), (p1.x + sx * 0.085, p1.y - 0.075, p1.z - 0.06, 0.012, 0.006)], 4))
    for (a0, a1) in ((0.15, 0.4), (0.4, 0.15)):
        p0, p1 = k.lerp(f, a0), k.lerp(f, a1)
        xs.append(tube([(p0.x - sx * 0.07, p0.y - 0.065, p0.z, 0.012, 0.006), (p1.x + sx * 0.07, p1.y - 0.065, p1.z - 0.05, 0.012, 0.006)], 4))
    b.add('leg_x' + side, merge(*xs), strap_red, region='leg' + side, subdiv=0)
    rings = [tube(limb_rings(l.lerp(k, t), l.lerp(k, t + 0.04), 0.084, 0.083, n=1), 14) for t in (0.15, 0.45)]
    rings += [tube(limb_rings(k.lerp(f, t), k.lerp(f, t + 0.05), 0.066, 0.065, n=1), 14) for t in (0.12, 0.42)]
    b.add('leg_bands' + side, merge(*rings), strap_red, region='leg' + side, subdiv=0)
    # polaina cinza canelada + coturno
    b.add('gaiter' + side, tube(limb_rings(k.lerp(f, 0.62), k.lerp(f, 0.9), 0.06, 0.058, n=3, bulge=0.004), 14), gaiter, region='k' + side, subdiv=0)
    b.add('boot_shaft' + side, tube(limb_rings(k.lerp(f, 0.88), k.lerp(f, 0.99), 0.062, 0.06, n=1), 14), boots, region='k' + side, subdiv=0)

# ---------------- luvas sem dedos: punho cinza com faixa vermelha
for side in ('L', 'R'):
    e, h = sk['e' + side], sk['hand' + side]
    b.add('cuff_g' + side, tube(limb_rings(e.lerp(h, 0.82), e.lerp(h, 0.95), 0.05, 0.049, n=1), 12), grey, region='e' + side, subdiv=0)
    b.add('cuff_r' + side, tube(limb_rings(e.lerp(h, 0.76), e.lerp(h, 0.82), 0.051, 0.05, n=1), 12), strap_red, region='e' + side, subdiv=0)

# ---------------- SOBRETUDO VERMELHO aberto na frente até abaixo do joelho
K_TX, K_TY = b.k_tx, b.k_ty
GAP, SEG, ROWS = 0.085, 52, 14


def coat_len(a):
    # mais curto na frente aberta, longo atrás
    return (1.22 - 0.1 * max(0.0, math.cos(a)) ** 2) * H  # até o meio da canela (referências)


def coat_pt(a, v, out=1.0):
    s = min(1.0, v * 3.2) ** 0.7
    rx = 0.18 * H + (0.225 * H - 0.18 * H) * s + v * 0.07 * H
    ry = 0.12 * H + (0.16 * H - 0.12 * H) * s + v * 0.07 * H
    fold = 1 + 0.03 * v * math.sin(a * 7)
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


b.add('coat', coat_mesh(), red, region='torso', weight_fn=coat_weights, subdiv=0)
b.add('coat_in', coat_mesh(0.975, flip=True), red_in, region='torso', weight_fn=coat_weights, subdiv=0)


def ring_band(v, width=0.025, mat=grey, name='band', out=1.012, a0=GAP, a1=1 - GAP):
    """faixa em volta do sobretudo na altura v (0 = ombro, 1 = barra), só no arco a0..a1 (frações da volta)."""
    verts, faces, uvs = [], [], []
    n = 40
    for i, vv in enumerate((v, v + width)):
        for s in range(n + 1):
            t = a0 + (a1 - a0) * s / n
            verts.append(coat_pt(t * TAU, vv, out))
            uvs.append((s / n, i))
    for s in range(n):
        faces.append((s, s + 1, s + 2 + n, s + 1 + n))
    b.add(name, (verts, faces, uvs), mat, region='torso', weight_fn=coat_weights, subdiv=0)


# barra: faixa cinza larga com laços pretos em X e tiras penduradas
ring_band(0.9, 0.08, grey, 'hem_band')
hem = []
rivets = []
for k in range(14):
    t = GAP + (1 - 2 * GAP) * (k + 0.5) / 14
    a = t * TAU
    p0 = Vector(coat_pt(a - 0.12, 0.86, 1.02))
    p1 = Vector(coat_pt(a + 0.12, 0.93, 1.02))
    p2 = Vector(coat_pt(a + 0.12, 0.86, 1.02))
    p3 = Vector(coat_pt(a - 0.12, 0.93, 1.02))
    hem.append(tube([(p0.x, p0.y, p0.z, 0.006, 0.004), (p1.x, p1.y, p1.z, 0.006, 0.004)], 4))
    hem.append(tube([(p2.x, p2.y, p2.z, 0.006, 0.004), (p3.x, p3.y, p3.z, 0.006, 0.004)], 4))
    for pp in (p0, p2):
        rivets.append(ellipsoid((pp.x, pp.y, pp.z), (0.009, 0.009, 0.009), 6, 4))
    # tira pendurada abaixo da barra
    q0 = Vector(coat_pt(a, 0.99, 1.0))
    hem.append(tube([(q0.x, q0.y, q0.z, 0.01, 0.003), (q0.x, q0.y, q0.z - 0.08 * H, 0.009, 0.003)], 4))
b.add('hem_laces', merge(*hem), dark, region='torso', weight_fn=coat_weights, subdiv=0)
b.add('hem_rivets', merge(*rivets), brass, region='torso', weight_fn=coat_weights, subdiv=0)

# costas: duas tiras cinza atravessadas e o arnês nos ombros (só na metade de trás: a = 0,25..0,75 da volta)
ring_band(0.34, 0.03, grey, 'back_strap1', a0=0.28, a1=0.72)
ring_band(0.4, 0.03, grey, 'back_strap2', a0=0.28, a1=0.72)
ring_band(0.08, 0.025, grey, 'harness_top', a0=0.33, a1=0.67)
# peito: tiras cinza com fivelas de latão saindo da lapela
for sx in (1, -1):
    for k, zz in enumerate((top - 0.12 * H, top - 0.2 * H)):
        b.add(f'chest_strap{sx}{k}', box((sx * 0.13 * H, -0.135 * H, zz), (0.07 * H, 0.008, 0.016 * H), bevel=0.003), grey, region='chest', subdiv=0)
        b.add(f'chest_buckle{sx}{k}', box((sx * 0.1 * H, -0.142 * H, zz), (0.014 * H, 0.006, 0.022 * H), bevel=0.002), brass, region='chest', subdiv=0)
# lapelas largas viradas para fora com botões dourados
for sx in (1, -1):
    lap = [(sx * 0.045 * H, -0.125 * H, top - 0.02 * H, 0.03 * H, 0.004), (sx * 0.085 * H, -0.13 * H, top - 0.2 * H, 0.05 * H, 0.004), (sx * 0.075 * H, -0.135 * H, hz + 0.2 * H, 0.02 * H, 0.004)]
    b.add(f'lapel{sx}', tube(lap, 6), red, region='chest', subdiv=0)
    bt = [ellipsoid((sx * 0.06 * H, -0.142 * H, hz + (0.32 + i * 0.09) * H), (0.011, 0.007, 0.011), 6, 4) for i in range(4)]
    b.add(f'buttons{sx}', merge(*bt), brass, region='chest', subdiv=0)

# mangas: faixa cinza no braço com fivela e tiras pretas em X perto do punho
for side in ('L', 'R'):
    sh, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    b.add('arm_band' + side, tube(limb_rings(sh.lerp(e, 0.45), sh.lerp(e, 0.55), 0.064, 0.063, n=1), 12), grey, region='arm' + side, subdiv=0)
    xs = []
    for (a0, a1) in ((0.45, 0.7), (0.7, 0.45)):
        p0, p1 = e.lerp(h, a0), e.lerp(h, a1)
        xs.append(tube([(p0.x + 0.05, p0.y - 0.04, p0.z, 0.009, 0.005), (p1.x - 0.05, p1.y - 0.04, p1.z, 0.009, 0.005)], 4))
    b.add('sleeve_x' + side, merge(*xs), dark, region='e' + side, subdiv=0)
    # punho largo do sobretudo
    b.add('coat_cuff' + side, tube(limb_rings(e.lerp(h, 0.66), e.lerp(h, 0.76), 0.056, 0.058, n=1), 12), red, region='e' + side, subdiv=0)

# capuz caído nas costas
b.add('hood_down', ellipsoid((0, 0.115 * H, top + 0.02 * H), (0.12 * H, 0.06 * H, 0.09 * H), 14, 8, theta_max=math.pi * 0.62), red, region='chest', subdiv=0)
b.add('hood_down_in', ellipsoid((0, 0.11 * H, top + 0.025 * H), (0.105 * H, 0.05 * H, 0.075 * H), 12, 6, theta_max=math.pi * 0.55), red_in, region='chest', subdiv=0)

# ---------------- cabelo preto liso: tampa, franja comprida sobre o olho direito, laterais até o queixo e nuca
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.004, hc.z + 0.012), (0.138 * H, 0.148 * H, 0.162 * H), front=0.18, side=0.5, back=0.66), hairm, region='head')
locks = []
# franja: mechas caindo da risca para a direita do rosto (lado R, x < 0) cobrindo um olho
for i in range(7):
    x0 = (0.06 - i * 0.025) * H
    root = Vector((x0, hc.y - 0.11 * H, hc.z + 0.13 * H))
    mid = Vector((x0 - 0.035 * H, hc.y - 0.15 * H, hc.z + 0.03 * H))
    tip = Vector((x0 - 0.05 * H, hc.y - 0.15 * H, hc.z - (0.04 + 0.02 * (i % 3)) * H))
    locks.append(tube([(root.x, root.y, root.z, 0.018 * H, 0.008 * H), (mid.x, mid.y, mid.z, 0.02 * H, 0.008 * H), (tip.x, tip.y, tip.z, 0.006 * H, 0.004 * H)], 6))
# laterais até a altura do queixo
for sx in (1, -1):
    for j in range(3):
        root = Vector((sx * 0.13 * H, hc.y - (0.05 - j * 0.05) * H, hc.z + 0.06 * H))
        tip = Vector((sx * 0.135 * H, hc.y - (0.05 - j * 0.05) * H, hc.z - 0.12 * H))
        locks.append(tube([(root.x, root.y, root.z, 0.022 * H, 0.012 * H), (tip.x, tip.y, tip.z, 0.008 * H, 0.005 * H)], 6))
# nuca
for j in range(5):
    x = (-0.08 + j * 0.04) * H
    root = Vector((x, hc.y + 0.12 * H, hc.z + 0.04 * H))
    tip = Vector((x, hc.y + 0.13 * H, hc.z - 0.14 * H))
    locks.append(tube([(root.x, root.y, root.z, 0.024 * H, 0.012 * H), (tip.x, tip.y, tip.z, 0.01 * H, 0.006 * H)], 6))
b.add('hair_locks', merge(*locks), hairm, region='head', subdiv=0)
# brinco pequeno na orelha esquerda
b.add('earring', ellipsoid((0.138 * H, hc.y, hc.z - 0.04 * H), (0.008, 0.008, 0.012), 6, 4), brass, region='head', subdiv=0)

b.export(OUT)
