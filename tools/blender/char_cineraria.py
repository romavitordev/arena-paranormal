"""
CINERARIA — public/models/cineraria.glb
Referências: cabelo preto bagunçado com franja caindo sobre o lado queimado; queimadura no lado
ESQUERDO do rosto (textura face_cineraria); cigarro na boca; jaqueta cinza-clara aberta com capuz e
detalhes roxos; gola alta preta canelada; alça transversal marrom; alças de mochila roxas; mão
direita enfaixada; calça preta; tênis escuro com roxo.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'cineraria.glb'
b = Builder(width=1.0, bulk=1.05, height=1.0)
sk, H = b.sk, 1.0
hz = sk['hips'].z

M = {
    'skin': material('skin_cineraria', '#c49478', 0.8),
    'face': material('face_cineraria', '#ffffff', 0.8),
    'torso': material('turtleneck', '#141416', 0.9),
    'arm': material('jacket', '#d6d4cc', 0.85),
    'legs': material('pants_black', '#222226', 0.9),
    'feet': material('sneakers', '#1a1a1e', 0.7),
    'handR': material('bandage', '#ddd6c6', 0.95),
}
jacket = M['arm']
purple = material('purple', '#6a3aa8', 0.7)
strap = material('strap_brown', '#5a3e28', 0.8)
hair = material('hair_black', '#121214', 0.6)
cig = material('cigarette', '#f2efe8', 0.8)
ember = material('ember', '#ff6a20', 0.5, emission='#ff5a10', strength=4)

hc = b.body(M, [(-0.12, 0.17), (0.0, 0.17), (0.18, 0.165), (0.38, 0.215), (0.5, 0.228), (0.6, 0.12), (0.66, 0.07)])

# gola alta canelada
b.add('collar', tube([(0, 0, 1.58, 0.072, 0.07), (0, 0, 1.69, 0.068, 0.066)], 14), M['torso'], region='torso', subdiv=0)
# jaqueta aberta na frente (cobre tronco), com barra e capuz
jk = [(hz - 0.1, 0.19, 0.135), (hz + 0.1, 0.185, 0.13), (hz + 0.33, 0.235, 0.155), (hz + 0.47, 0.246, 0.16), (hz + 0.56, 0.17, 0.12), (hz + 0.62, 0.11, 0.09)]
b.add('jacket_body', open_tube(jk, gap=0.06, seg=22), jacket, region='torso')
# forro roxo nas bordas da frente
for s in (1, -1):
    b.add(f'lining{s}', box((s * 0.06, -0.15, hz + 0.22), (0.022, 0.012, 0.6)), purple, region='torso', subdiv=0)
# bolsos com aba
for s in (1, -1):
    b.add(f'pocket{s}', box((s * 0.12, -0.17, hz + 0.02), (0.1, 0.02, 0.07)), jacket, region='torso', subdiv=0)
    b.add(f'chestpocket{s}', box((s * 0.12, -0.165, hz + 0.36), (0.08, 0.018, 0.06)), jacket, region='torso', subdiv=0)
# capuz caído atrás
hood = ellipsoid((0, 0.11, 1.6), (0.18, 0.12, 0.13), 16, 10, theta_max=math.pi * 0.62)
b.add('hood', xform(hood, lambda p: Vector((p.x, p.y + max(0, (1.66 - p.z)) * 0.3, p.z))), jacket, region='torso')
# mangas da jaqueta mais largas por cima do braço (até o punho)
for side in ('L', 'R'):
    s, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]
    b.add('cuff' + side, tube(limb_rings(e.lerp(h, 0.8), e.lerp(h, 0.9), 0.056, 0.056, n=1), 12), jacket, region='arm' + side, subdiv=0)
# faixas na mão/antebraço direito
e, h = sk['eR'], sk['handR']
b.add('bandage', tube(limb_rings(e.lerp(h, 0.55), e.lerp(h, 1.02), 0.05, 0.05, n=4), 12), M['handR'], region='armR')
# alça marrom transversal e alças roxas da mochila
b.add('crossstrap', xform(box((0, -0.16, hz + 0.32), (0.035, 0.012, 0.66)), lambda p: Vector((p.x + (p.z - (hz + 0.32)) * 0.75, p.y, p.z))), strap, region='torso', subdiv=0)
for s in (1, -1):
    b.add(f'bagstrap{s}', tube([(s * 0.13, -0.125, hz + 0.6, 0.018, 0.008), (s * 0.15, -0.162, hz + 0.42, 0.018, 0.008), (s * 0.16, -0.16, hz + 0.2, 0.018, 0.008)], 6), purple, region='torso', subdiv=0)
b.add('backpack', box((0, 0.17, hz + 0.38), (0.26, 0.12, 0.3)), material('backpack', '#2a2430', 0.8), region='torso', subdiv=1)
# tênis com faixa roxa
for side in ('L', 'R'):
    f = sk['foot' + side]
    b.add('shoestripe' + side, box((f.x + (0.051 if side == 'L' else -0.051), f.y - 0.05, f.z + 0.02), (0.006, 0.18, 0.02)), purple, region='k' + side, subdiv=0)

# cabelo preto bagunçado, franja caindo sobre o lado ESQUERDO (queimado)
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.008, hc.z + 0.015), (0.146, 0.156, 0.168), front=0.28, side=0.42, back=0.62), hair, region='head')
import random
random.seed(7)


def lock(root, d, ln, r, curl=0.25):
    # mecha: sai da raiz na direção d, cai com a gravidade e afina até a ponta
    pts = []
    for k in range(5):
        t = k / 4
        p = root + d * (ln * t) + Vector((0, 0, -ln * curl * t * t * 2.2))
        pts.append((p.x, p.y, p.z, r * (1 - 0.75 * t) + 0.003, r * 0.6 * (1 - 0.75 * t) + 0.003))
    return tube(pts, 7)


C = Vector((hc.x, hc.y + 0.01, hc.z + 0.03))
locks = []
# camadas em volta da cabeça: de cima para baixo, cada camada mais comprida (volume até a nuca)
for layer, (zoff, n, ln, r) in enumerate([(0.13, 10, 0.1, 0.05), (0.07, 12, 0.14, 0.048), (0.0, 12, 0.17, 0.044)]):
    for i in range(n):
        a = (i + 0.5 * layer) / n * TAU
        front = math.cos(a)  # 1 = frente (-Y)
        if front > (0.2 if layer == 0 else -0.05):
            continue  # deixa o rosto livre
        rad = 0.135 + layer * 0.01
        root = C + Vector((math.sin(a) * rad, -math.cos(a) * rad * 1.05, zoff))
        d = Vector((math.sin(a) * 0.7, -math.cos(a) * 0.7, -0.45 - layer * 0.2 + random.uniform(-0.1, 0.1)))
        d.normalize()
        locks.append(lock(root, d, ln * (1.0 if front < 0 else 0.8) + random.uniform(-0.02, 0.03), r))
# topo bagunçado: algumas pontas para cima/lado
for i in range(6):
    a = random.uniform(0, TAU)
    root = C + Vector((math.sin(a) * 0.06, -math.cos(a) * 0.06, 0.16))
    d = Vector((math.sin(a) * 0.8, -math.cos(a) * 0.8, 0.45))
    d.normalize()
    locks.append(lock(root, d, 0.1, 0.035, curl=0.6))
b.add('hair_locks', merge(*locks), hair, region='head', subdiv=0)
# franja: mechas grossas caindo sobre a testa, mais longas do lado ESQUERDO (queimado)
for i in range(6):
    x = -0.07 + i * 0.03
    root = Vector((x, -0.12, hc.z + 0.14))
    d = Vector((0.25 + 0.1 * (i % 2), -0.35, -1))
    d.normalize()
    b.add(f'bang{i}', lock(root, d, 0.09 + (0.03 if x > 0 else 0), 0.03, curl=0.1), hair, region='head', subdiv=0)
# cigarro no canto da boca (lado direito)
mouth = Vector((-0.04, -0.15, hc.z - 0.075))
b.add('prop_cigarette', merge(
    tube([(mouth.x, mouth.y, mouth.z, 0.007, 0.007), (mouth.x - 0.05, mouth.y - 0.035, mouth.z - 0.012, 0.007, 0.007)], 6),
), cig, region='head', subdiv=0)
b.add('prop_cigaretteEmber', ellipsoid((mouth.x - 0.052, mouth.y - 0.037, mouth.z - 0.013), (0.008, 0.008, 0.008), 6, 4), ember, region='head', subdiv=0)

b.export(OUT)
