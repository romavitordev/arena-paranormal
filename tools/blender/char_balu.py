"""
BALU (Antônio Pontevedra) — public/models/balu.glb
Referências: Referencias visuais/Personagens/Balu (desenho de Calamidade, rosto, camisa amarela, machado, arma de
sangue, sem camisa) + wiki. Ex-agente veterano da Ordo Realitas, 1,90 m, grande e forte (gosta de comer).
Cabelo preto com volume, penteado para trás com gel; sobrancelhas grossas; BIGODE grosso e cavanhaque curto só no
meio do queixo; sem a orelha DIREITA (arrancada por um Titã de Sangue — cicatriz em espiral da Cicatrização do Dante,
pintada na textura). Camisa POLO branca com flores amarelas (a roupa mais conhecida), gola grande aberta e mangas
arregaçadas até o meio do bíceps, por dentro da calça; cinto marrom com a fivela do Amuleto de Proteção Elemental
(veias vermelhas e o Símbolo de Sangue); calça jeans azul-clara; sapato social marrom. Antebraços fortes e peludos.
O Machado Lancinante (pomo de pantera) e o Machado Demônio (maça de sangue) são adicionados em código
(src/models/weapons.js → baluAxe, demonMace).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'balu.glb'
b = Builder(width=1.08, bulk=1.14, height=1.05)  # 1,90 m, largo e pesado
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_balu', '#c8946e', 0.8),
    'face': material('face_balu', '#ffffff', 0.8),
    'torso': material('shirt_balu', '#ffffff', 0.85),  # polo branca com flores amarelas (textura)
    'arm': material('arms_balu', '#ffffff', 0.8),  # antebraços peludos (textura)
    'hand': material('skin_balu', '#c8946e', 0.8),
    'legs': material('jeans_balu', '#ffffff', 0.9),  # jeans azul-claro (textura)
    'feet': material('shoe_balu', '#6a4024', 0.55),
}
shirt = M['torso']
collar = material('collar_balu', '#f2eee4', 0.85)
belt = material('belt_balu', '#5a3a20', 0.7)
buckle = material('amulet_balu', '#ffffff', 0.4, metal=0.6)  # fivela com veias vermelhas (textura)
hairm = material('hair_balu', '#141114', 0.45)
stache = material('stache_balu', '#1a1412', 0.7)
sole = material('sole_balu', '#3a2414', 0.8)

# tronco largo, barriga um pouco saliente (gosta de comer), ombros fortes
hc = b.body(M, [(-0.12, 0.18), (0.0, 0.186), (0.17, 0.19), (0.3, 0.205), (0.42, 0.232), (0.5, 0.24), (0.58, 0.13), (0.65, 0.078)],
            arm_r=(0.072, 0.06, 0.05), leg_r=(0.088, 0.068, 0.054), head_r=(0.142, 0.152, 0.164), neck_r=0.072)

# sem a orelha direita (arrancada pelo Titã de Sangue): a cicatriz em espiral é pintada na textura do rosto
for o in list(b.parts):
    try:
        if o.name.startswith('ear-1'):
            bpy.data.objects.remove(o, do_unlink=True)
    except ReferenceError:
        pass
def alive(o):
    try:
        return bool(o.name)
    except ReferenceError:
        return False


b.parts = [o for o in b.parts if alive(o)]

# ---------------- mangas da polo arregaçadas até o meio do bíceps (dobra mais grossa na borda)
for side in ('L', 'R'):
    sh, e = sk['s' + side], sk['e' + side]
    b.add('sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), sh.lerp(e, 0.5), 0.088, 0.084, n=3), 14), shirt, region='arm' + side)
    b.add('sleeveroll' + side, tube(limb_rings(sh.lerp(e, 0.44), sh.lerp(e, 0.56), 0.094, 0.092, n=1), 14), collar, region='arm' + side, subdiv=0)

# ---------------- gola grande de polo, aberta em V no peito
gola = []
for s in (1, -1):
    pts = []
    for k in range(5):
        t = k / 4
        x = s * (0.035 + t * 0.12) * H
        y = -0.03 * H - t * 0.13 * H
        z = top + 0.06 * H - t * 0.16 * H
        pts.append((x, y, z, 0.03 * H * (1 - t * 0.3), 0.008))
    gola.append(tube(pts, 6))
    # aba da gola deitada sobre o ombro
    gola.append(ellipsoid((s * 0.1 * H, -0.06 * H, top + 0.02 * H), (0.07 * H, 0.05 * H, 0.012), 10, 4))
b.add('collar', merge(*gola), collar, region='torso', subdiv=0)
b.add('collarband', tube([(0, 0.005, top + 0.03 * H, 0.085 * H, 0.08 * H), (0, 0.01, top + 0.085 * H, 0.08 * H, 0.075 * H)], 18), collar, region='neck', subdiv=0)

# ---------------- cinto marrom com a fivela do Amuleto de Proteção Elemental; camisa por dentro da calça
b.add('belt', tube([(0, 0, hz + 0.07 * H, 0.2 * H, 0.15 * H), (0, 0, hz + 0.115 * H, 0.2 * H, 0.15 * H)], 22), belt, region='torso', subdiv=0)
b.add('buckle', box((0, -0.153 * H, hz + 0.093 * H), (0.075, 0.016, 0.055), bevel=0.006), buckle, region='torso', subdiv=0)
for k, a in enumerate((-0.95, -0.55, 0.55, 0.95)):  # passadores
    p = Vector((math.sin(a) * 0.204 * H, -math.cos(a) * 0.154 * H, hz + 0.093 * H))
    b.add(f'loop{k}', box(tuple(p), (0.014, 0.012, 0.05)), belt, region='torso', subdiv=0)

# ---------------- sapato social marrom (bico arredondado, sola escura)
for side in ('L', 'R'):
    f = sk['foot' + side]
    b.add('sole' + side, box((f.x, f.y - 0.05, f.z - 0.02), (0.108 * H, 0.27 * H, 0.025)), sole, region='k' + side, subdiv=0)

# ---------------- cabelo preto com volume, todo penteado para trás (gel)
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.03), (0.15 * H, 0.162 * H, 0.17 * H), front=0.14, side=0.42, back=0.62), hairm, region='head')


def lock(root, d, ln, r, rise=0.0):
    pts = []
    for k in range(6):
        t = k / 5
        p = root + d * (ln * t) + Vector((0, 0, rise * math.sin(t * math.pi)))
        pts.append((p.x, p.y, p.z, r * (1 - 0.45 * t) + 0.004, r * 0.75 * (1 - 0.45 * t) + 0.004))
    return tube(pts, 7)


back = []
for i in range(9):  # mechas grossas da testa para a nuca, com volume no alto (topete penteado para trás)
    x = (i - 4) * 0.032 * H
    root = Vector((x, hc.y - 0.13 * H, hc.z + 0.09 * H))
    back.append(lock(root, Vector((x * 0.6, 1.0, -0.15)).normalized(), 0.24 * H, 0.045, rise=0.05 * H))
b.add('hair_back', merge(*back), hairm, region='head', subdiv=0)

# ---------------- bigode grosso (volume por cima da pintura) e cavanhaque curto no meio do queixo
mx = []
for s in (1, -1):
    mx.append(ellipsoid((hc.x + s * 0.03 * H, hc.y - 0.148 * H, hc.z - 0.075 * H), (0.04 * H, 0.016 * H, 0.016 * H), 10, 6))
b.add('mustache', merge(*mx), stache, region='head', subdiv=0)
b.add('goatee', ellipsoid((hc.x, hc.y - 0.136 * H, hc.z - 0.135 * H), (0.018 * H, 0.012 * H, 0.022 * H), 8, 6), stache, region='head', subdiv=0)
# sobrancelhas grossas
br = []
for s in (1, -1):
    br.append(tube([(s * 0.025 * H, hc.y - 0.15 * H, hc.z + 0.03 * H, 0.009, 0.006), (s * 0.075 * H, hc.y - 0.138 * H, hc.z + 0.036 * H, 0.008, 0.005)], 5))
b.add('brows', merge(*br), stache, region='head', subdiv=0)

b.export(OUT)
