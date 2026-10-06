"""
BALU (Antônio Pontevedra) — public/models/balu.glb
Referências: Referencias visuais/Personagens/Balu (desenho de Calamidade, rosto, camisa amarela, machado, arma de
sangue, sem camisa) + wiki. Ex-agente veterano da Ordo Realitas, 1,90 m, grande e forte (gosta de comer).
Cabelo preto com volume, penteado para trás com gel; sobrancelhas grossas; BIGODE grosso e cavanhaque curto só no
meio do queixo; sem a orelha DIREITA (arrancada por um Titã de Sangue — cicatriz em espiral da Cicatrização do Dante,
pintada na textura). Camisa POLO VERDE-CLARA (o desenho de Calamidade, base do modelo), gola grande aberta e mangas
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
b = Builder(width=1.12, bulk=1.16, height=1.05)  # 1,90 m, largo e pesado
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_balu', '#c8946e', 0.8),
    'face': material('face_balu', '#ffffff', 0.8),
    'torso': material('shirt_balu', '#ffffff', 0.85),  # polo verde-clara (textura)
    'arm': material('arms_balu', '#ffffff', 0.8),  # antebraços peludos (textura)
    'hand': material('skin_balu', '#c8946e', 0.8),
    'legs': material('jeans_balu', '#ffffff', 0.9),  # jeans azul-claro (textura)
    'feet': material('shoe_balu', '#6a4024', 0.55),
}
shirt = M['torso']
collar = material('collar_balu', '#8ab48c', 0.85)  # gola e barra das mangas no verde da polo
belt = material('belt_balu', '#5a3a20', 0.7)
buckle = material('amulet_balu', '#ffffff', 0.4, metal=0.6)  # fivela com veias vermelhas (textura)
hairm = material('hair_balu', '#141114', 0.45)
hairhi = material('hairshine_balu', '#4a4e5c', 0.3)  # brilho do gel nas mechas penteadas para trás
stache = material('stache_balu', '#1a1412', 0.7)
sole = material('sole_balu', '#3a2414', 0.8)

# tronco largo, barriga um pouco saliente (gosta de comer), ombros fortes
# (v2, referências do usuário: peito e ombros bem mais largos, braços fortes)
hc = b.body(M, [(-0.12, 0.18), (0.0, 0.188), (0.17, 0.196), (0.3, 0.218), (0.42, 0.252), (0.5, 0.262), (0.58, 0.14), (0.65, 0.08)],
            arm_r=(0.086, 0.071, 0.056), leg_r=(0.088, 0.068, 0.054), head_r=(0.142, 0.152, 0.164), neck_r=0.072)

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
    b.add('sleeve' + side, tube(limb_rings(sh + Vector((0, 0, 0.03)), sh.lerp(e, 0.5), 0.102, 0.097, n=3), 14), shirt, region='arm' + side)
    b.add('sleeveroll' + side, tube(limb_rings(sh.lerp(e, 0.44), sh.lerp(e, 0.56), 0.108, 0.105, n=1), 14), collar, region='arm' + side, subdiv=0)

# ---------------- gola de polo: aba larga deitada em volta do pescoço e as duas pontas curtas abertas no peito
gola = []
for s_ in (1, -1):
    pts = []
    for k in range(4):
        t = k / 3
        x = s_ * (0.05 + t * 0.09) * H
        y = -0.075 * H - t * 0.035 * H
        z = top + 0.05 * H - t * 0.06 * H
        pts.append((x, y, z, 0.034 * H * (1 - t * 0.35), 0.009))
    gola.append(tube(pts, 6))
    gola.append(ellipsoid((s_ * 0.085 * H, -0.03 * H, top + 0.035 * H), (0.06 * H, 0.06 * H, 0.012), 10, 4))
b.add('collar', merge(*gola), collar, region='torso', subdiv=0)
b.add('collarband', tube([(0, 0.01, top + 0.02 * H, 0.1 * H, 0.094 * H), (0, 0.015, top + 0.075 * H, 0.088 * H, 0.084 * H)], 18), collar, region='neck', subdiv=0)

# ---------------- cinto marrom com a fivela do Amuleto de Proteção Elemental; camisa por dentro da calça
b.add('belt', tube([(0, 0, hz + 0.07 * H, 0.2 * H, 0.15 * H), (0, 0, hz + 0.115 * H, 0.2 * H, 0.15 * H)], 22), belt, region='torso', subdiv=0)
b.add('buckle', box((0, -0.153 * H, hz + 0.093 * H), (0.075, 0.016, 0.055), bevel=0.006), buckle, region='torso', subdiv=0)
for k, a in enumerate((-0.95, -0.55, 0.55, 0.95)):  # passadores
    p = Vector((math.sin(a) * 0.204 * H, -math.cos(a) * 0.154 * H, hz + 0.093 * H))
    b.add(f'loop{k}', box(tuple(p), (0.014, 0.012, 0.05)), belt, region='torso', subdiv=0)

# a calça cobre o quadril até o cinto (antes a barra da polo aparecia entre as pernas)
b.add('jeans_hip', tube([(0, 0, hz - 0.13 * H, 0.19 * H, 0.15 * H), (0, 0, hz + 0.02 * H, 0.198 * H, 0.152 * H), (0, 0, hz + 0.085 * H, 0.2 * H, 0.152 * H)], 22), M['legs'], region='torso', subdiv=0)

# ---------------- sapato social marrom (bico arredondado, sola escura)
for side in ('L', 'R'):
    f = sk['foot' + side]
    b.add('sole' + side, box((f.x, f.y - 0.05, f.z - 0.02), (0.108 * H, 0.27 * H, 0.025)), sole, region='k' + side, subdiv=0)

# ---------------- cabelo preto VOLUMOSO todo penteado para trás com gel (referências do usuário): massa fechada por
# cima da cabeça (linha do cabelo alta na testa, sem cobrir as orelhas), topete alto na frente, nuca coberta e mechas
# finas acompanhando a curva da frente para trás
VOL_C = Vector((hc.x, hc.y + 0.045 * H, hc.z + 0.1 * H))
VOL_R = Vector((0.164 * H, 0.172 * H, 0.112 * H))
hair_parts = [
    ellipsoid(tuple(VOL_C), tuple(VOL_R), 22, 14),
    ellipsoid((hc.x, hc.y - 0.045 * H, hc.z + 0.175 * H), (0.125 * H, 0.1 * H, 0.06 * H), 18, 10),  # topete
    ellipsoid((hc.x, hc.y + 0.08 * H, hc.z + 0.01 * H), (0.15 * H, 0.115 * H, 0.125 * H), 18, 10),  # nuca
]
b.add('hair_volume', merge(*hair_parts), hairm, region='head', subdiv=0)


def strand(x, th0=0.7, th1=2.5):
    k = math.sqrt(max(0.05, 1 - (x / (VOL_R.x * 1.02)) ** 2))
    pts = []
    for n in range(9):
        th = th0 + (th1 - th0) * n / 8
        y = VOL_C.y - math.cos(th) * VOL_R.y * 1.025 * k
        z = VOL_C.z + math.sin(th) * VOL_R.z * 1.03 * k
        pts.append((VOL_C.x + x, y, z, 0.01, 0.004))
    return tube(pts, 5)


b.add('hair_strands', merge(*[strand((i - 4) * 0.034 * H) for i in range(1, 8)]), hairhi, region='head', subdiv=0)

# ---------------- bigode grosso (volume por cima da pintura) e cavanhaque curto no meio do queixo
mx = []
for s in (1, -1):
    mx.append(ellipsoid((hc.x + s * 0.03 * H, hc.y - 0.152 * H, hc.z - 0.062 * H), (0.04 * H, 0.018 * H, 0.017 * H), 10, 6))
    mx.append(ellipsoid((hc.x + s * 0.06 * H, hc.y - 0.142 * H, hc.z - 0.074 * H), (0.014 * H, 0.014 * H, 0.018 * H), 8, 6))  # pontas caídas
b.add('mustache', merge(*mx), stache, region='head', subdiv=0)
b.add('goatee', ellipsoid((hc.x, hc.y - 0.122 * H, hc.z - 0.146 * H), (0.012 * H, 0.006 * H, 0.015 * H), 8, 6), stache, region='head', subdiv=0)  # tufo só no meio do queixo
# sobrancelhas grossas
br = []
for s in (1, -1):
    br.append(tube([(s * 0.025 * H, hc.y - 0.15 * H, hc.z + 0.03 * H, 0.009, 0.006), (s * 0.075 * H, hc.y - 0.138 * H, hc.z + 0.036 * H, 0.008, 0.005)], 5))
b.add('brows', merge(*br), stache, region='head', subdiv=0)

b.export(OUT)
