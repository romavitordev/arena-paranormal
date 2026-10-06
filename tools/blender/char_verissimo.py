"""
SENHOR VERÍSSIMO — public/models/verissimo.glb
Época: Desconjuração/Calamidade (wiki colada pelo usuário + referências em refs-arnaldo):
  alto e FORTE, 60 anos; cabelo CURTO grisalho/esbranquiçado que desce em COSTELETAS e se junta à BARBA com CAVANHAQUE
  (em Calamidade maior e mais bagunçada); OLHEIRAS grandes, rosto esvaído e pálido; COLETE PRETO, camisa branca de gola
  com as MANGAS ARREGAÇADAS até os cotovelos, GRAVATA AZUL afrouxada (gola meio aberta), calça azulada da mesma cor da
  BOTA. A espada do Arnaldo e a escopeta são adicionadas em código (src/models/weapons.js).
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector
from arnaldo_common import lower_shell

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'verissimo.glb'
b = Builder(width=1.06, bulk=1.06, height=1.06)  # alto e forte
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

shirt = material('shirt_verissimo', '#ffffff', 0.85)  # camisa branca com dobras (textura)
M = {
    'skin': material('skin_verissimo', '#d8b49c', 0.8),  # pele mais pálida (Calamidade)
    'face': material('face_verissimo', '#ffffff', 0.8),
    'torso': material('vest_verissimo', '#ffffff', 0.8),  # colete preto + camisa branca em V (textura)
    'arm': material('skin_verissimo', '#d8b49c', 0.8),  # antebraços à mostra (mangas arregaçadas por cima)
    'hand': material('skin_verissimo', '#d8b49c', 0.8),
    'legs': material('pants_verissimo', '#ffffff', 0.85),  # calça azulada (textura)
    'feet': material('boot_verissimo', '#2e3a52', 0.5),  # bota da mesma cor da calça
}
tie = material('tie_verissimo', '#3a6ab0', 0.6)
hairm = material('hair_verissimo', '#b4b0aa', 0.6)
hairhi = material('hairshine_verissimo', '#dcd8d2', 0.5)
beardm = material('beard_verissimo', '#c4c0ba', 0.75)
btn = material('button_verissimo', '#1a1a1c', 0.4)

hc = b.body(M, [(-0.12, 0.176), (0.0, 0.178), (0.18, 0.176), (0.38, 0.226), (0.5, 0.238), (0.6, 0.128), (0.66, 0.074)],
            arm_r=(0.078, 0.064, 0.052), leg_r=(0.094, 0.076, 0.058), head_r=(0.14, 0.15, 0.164), neck_r=0.062)

# ---------------- mangas da camisa ARREGAÇADAS até os cotovelos (dobra grossa na borda)
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), sh.lerp(e, 0.96), 0.09, 0.082, n=4), 14), shirt, region='arm' + side)
    b.add('sleeveroll' + side, tube(limb_rings(sh.lerp(e, 0.86), sh.lerp(e, 1.04), 0.088, 0.086, n=1), 14), shirt, region='arm' + side, subdiv=0)
# gola da camisa meio aberta (bagunçada) e a gravata azul afrouxada
gola = []
for s in (1, -1):
    gola.append(tube([(s * 0.03 * H, -0.075 * H, top + 0.07 * H, 0.03 * H, 0.008), (s * 0.08 * H, -0.1 * H, top + 0.0 * H, 0.026 * H, 0.008), (s * 0.1 * H, -0.12 * H, top - 0.05 * H, 0.016 * H, 0.008)], 6))
b.add('collar', merge(*gola), shirt, region='torso', subdiv=0)
b.add('collarband', tube([(0, 0.006, top + 0.02 * H, 0.078 * H, 0.074 * H), (0, 0.008, top + 0.07 * H, 0.072 * H, 0.068 * H)], 16), shirt, region='neck', subdiv=0)
b.add('tie_knot', ellipsoid((0.006, -0.078 * H, top - 0.0 * H), (0.02 * H, 0.012 * H, 0.022 * H), 8, 6), tie, region='torso', subdiv=0)
b.add('tie_body', tube([(0.006, -0.12 * H, hz + 0.52 * H, 0.016 * H, 0.004), (0.012, -0.148 * H, hz + 0.4 * H, 0.026 * H, 0.004), (0.014, -0.146 * H, hz + 0.3 * H, 0.02 * H, 0.004)], 6), tie, region='torso', subdiv=0)
for i in range(4):
    b.add(f'vest_btn{i}', ellipsoid((0, -0.15 * H, hz + (0.12 + i * 0.06) * H), (0.008, 0.004, 0.008), 6, 4), btn, region='torso', subdiv=0)
# cinto preto
b.add('belt', tube([(0, 0, hz + 0.06 * H, 0.196 * H, 0.142 * H), (0, 0, hz + 0.1 * H, 0.196 * H, 0.142 * H)], 22), btn, region='torso', subdiv=0)

# ---------------- cabelo CURTO grisalho (um pouco bagunçado em Calamidade), penteado para trás
c = Vector((hc.x, hc.y + 0.035 * H, hc.z + 0.08 * H))
r = Vector((0.15 * H, 0.162 * H, 0.1 * H))
b.add('hair_volume', merge(
    ellipsoid(tuple(c), tuple(r), 22, 14),
    ellipsoid((hc.x, hc.y + 0.075 * H, hc.z - 0.01 * H), (0.142 * H, 0.105 * H, 0.115 * H), 16, 10),
), hairm, region='head', subdiv=0)


def strand(x, th0=0.55, th1=2.4):
    k = math.sqrt(max(0.05, 1 - (x / (r.x * 1.02)) ** 2))
    pts = []
    for n in range(8):
        th = th0 + (th1 - th0) * n / 7
        pts.append((c.x + x, c.y - math.cos(th) * r.y * 1.01 * k, c.z + math.sin(th) * r.z * 1.01 * k, 0.006, 0.003))
    return tube(pts, 5)


# (sem mechas por cima: no cabelo curto grisalho elas viravam um "pente")
# costeletas descendo pelos lados até a barba
for s in (1, -1):
    b.add(f'sideburn{s}', ellipsoid((s * 0.128 * H, hc.y - 0.03 * H, hc.z, ), (0.016 * H, 0.03 * H, 0.06 * H), 8, 6), beardm, region='head', subdiv=0)
# barba grisalha (rala nas bochechas, cheia no queixo) + bigode cheio + cavanhaque maior (Calamidade)
b.add('beard', lower_shell((hc.x, hc.y - 0.004, hc.z - 0.01 * H), (0.145 * H, 0.155 * H, 0.17 * H), upto=0.4, phi=(0.2, 0.8)), beardm, region='head', subdiv=0)
mx = []
for s in (1, -1):
    mx.append(ellipsoid((hc.x + s * 0.028 * H, hc.y - 0.152 * H, hc.z - 0.064 * H), (0.036 * H, 0.016 * H, 0.016 * H), 8, 6))
    mx.append(ellipsoid((hc.x + s * 0.054 * H, hc.y - 0.142 * H, hc.z - 0.08 * H), (0.012 * H, 0.012 * H, 0.02 * H), 8, 6))
b.add('mustache', merge(*mx), beardm, region='head', subdiv=0)
b.add('goatee', ellipsoid((hc.x, hc.y - 0.13 * H, hc.z - 0.15 * H), (0.026 * H, 0.016 * H, 0.04 * H), 10, 8), beardm, region='head', subdiv=0)
b.export(OUT)
