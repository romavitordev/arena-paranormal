"""
CRISTOPHER "CRIS" COHEN — public/models/cristopher.glb (Ordo Realitas, Equipe E / O Segredo na Floresta).
Referências: wiki "Cristopher Cohen" (arte promocional de OSNF, a versão de Desconjuração, a graphic novel, a
miniatura) e fan arts do Pinterest (só para conferir leitura). O dublê do Van Damme: ~2 m, "um armário" — enorme e
muito musculoso; 59 anos, cabelo GRISALHO curto, barba por fazer, olhos azuis, rugas; a grande CICATRIZ DE QUEIMADURA
cobrindo o lado ESQUERDO do rosto (em faixas vermelho-arroxeadas, até a orelha); REGATA branca (gasta, suja), calça
preta, sapatos simples; TATUAGENS TRIBAIS nos dois braços e as ESCAMAS (dragão ou cobra) tatuadas nas costas. Luta de
punhos fechados (a miniatura).
TÉCNICA (a do Cristino): corpo pelo Builder; o relevo dos músculos esculpido NA malha dos braços, do tronco e da regata
(relief: mantém o UV das tatuagens e do tecido); cabelo, calça e sapatos por escultura de metaballs; a regata como
superfície com espessura (decote, cavas e alças).
  node tools/blender/build.mjs cristopher   → public/models/cristopher.glb (+ tools/blender/fonte/cristopher.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, shell_grid, relief, clothe
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'cristopher.glb'
random.seed(1960)  # o ano em que ele nasceu, na Califórnia

b = Builder(width=1.16, bulk=1.24, height=1.1)  # ~2 m, "um armário"
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_cristopher', '#d8a080', 0.75),
    'face': material('face_cristopher', '#ffffff', 0.75),  # a queimadura, a barba por fazer, os olhos azuis (textura)
    'torso': material('skin_torso_cristopher', '#ffffff', 0.75),  # as escamas tatuadas nas costas (textura)
    'arm': material('arms_cristopher', '#ffffff', 0.75),  # as tatuagens tribais (textura)
    'hand': material('skin_cristopher', '#d8a080', 0.75),
    'legs': material('pants_cristopher', '#1c1c20', 0.85),
    'feet': material('skin_cristopher', '#d8a080', 0.75),
}
tank = material('tank_cristopher', '#ffffff', 0.85)  # regata branca canelada, suja (textura)
belt = material('belt_cristopher', '#141214', 0.6)
buckle = material('buckle_cristopher', '#a8a8ae', 0.35, metal=0.8)
shoe = material('shoe_cristopher', '#141416', 0.6)
sole = material('sole_cristopher', '#2a2a2c', 0.8)
hairm = material('hair_cristopher', '#b8b6b2', 0.65)  # grisalho

PREVIEW = {'face_cristopher': '#d8a080', 'skin_torso_cristopher': '#d8a080', 'arms_cristopher': '#d8a080', 'tank_cristopher': '#e8e4dc'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

# o tronco do armário: peito e ombros largos, cintura grossa
TP = [(-0.12, 0.17), (0.0, 0.176), (0.17, 0.178), (0.34, 0.214), (0.47, 0.236), (0.56, 0.222), (0.615, 0.15), (0.66, 0.09)]
hc = b.body(M, TP, arm_r=(0.084, 0.07, 0.054), leg_r=(0.09, 0.07, 0.055), head_r=(0.142, 0.152, 0.164), neck_r=0.092, feet='bare')


def part(name):
    return next(o for o in b.parts if o.name == name)


# ================================================================ os MÚSCULOS (relevo na própria malha: as tatuagens continuam)
def chest_relief(p, front_only=False):
    x, y, z = p.x, p.y, p.z - hz
    ax = abs(x)
    d = 0.0
    if y < -0.02:
        d += 0.016 * H * math.exp(-((ax - 0.085 * H) / (0.07 * H)) ** 2) * math.exp(-((z - 0.46 * H) / (0.055 * H)) ** 2)  # peitorais
        d -= 0.006 * H * math.exp(-((z - 0.4 * H) / (0.014 * H)) ** 2) * (ax < 0.15 * H)
        if 0.1 * H < z < 0.38 * H and ax < 0.08 * H:  # o abdômen (um pouco de barriga: gomos suaves)
            d += 0.005 * H - 0.004 * H * math.exp(-(x / (0.01 * H)) ** 2)
            for zk in (0.33, 0.25, 0.17):
                d -= 0.003 * H * math.exp(-((z - zk * H) / (0.01 * H)) ** 2)
    elif not front_only:  # as costas largas: dorsais e a coluna
        d += 0.01 * H * math.exp(-((ax - 0.12 * H) / (0.06 * H)) ** 2) * math.exp(-((z - 0.38 * H) / (0.12 * H)) ** 2)
        d -= 0.004 * H * math.exp(-(x / (0.014 * H)) ** 2)
    if z > 0.52 * H:  # o trapézio subindo para o pescoço
        d += 0.012 * H * math.exp(-((ax - 0.12 * H) / (0.05 * H)) ** 2) * min(1.0, (z - 0.52 * H) / (0.06 * H))
    return d


relief(part('torso'), chest_relief)


def arm_relief(side):
    s_, e, h = sk['s' + side], sk['e' + side], sk['hand' + side]

    def f(p):
        if p.z > s_.z + 0.05 * H:
            return 0.0
        if p.z >= e.z:
            t = (s_.z + 0.05 * H - p.z) / (s_.z + 0.05 * H - e.z)
            front = lim((s_.y - p.y) / (0.05 * H))
            back = lim((p.y - s_.y) / (0.05 * H))
            return (0.032 * H * math.exp(-((t - 0.12) / 0.15) ** 2)  # o deltoide redondo
                    + 0.026 * H * math.sin(min(1, t) * math.pi) * front ** 0.7  # o bíceps
                    + 0.02 * H * math.sin(min(1, t) * math.pi) * back ** 0.7)  # o tríceps
        t = (e.z - p.z) / (e.z - h.z)
        return 0.02 * H * math.exp(-((t - 0.25) / 0.22) ** 2) - 0.008 * H * lim((t - 0.7) / 0.3)  # o antebraço grosso perto do cotovelo
    return f


def lim(x):
    return max(0.0, min(1.0, x))


for side in ('L', 'R'):
    relief(part('arm' + side), arm_relief(side))


# ================================================================ a REGATA branca: a própria malha do tronco, inflada e cortada
# (decote em U na frente, mais alto atrás, cavas largas e as alças por cima dos ombros)
def tank_keep(p):
    z = (p.z - hz) / H
    ax = abs(p.x) / H
    front = p.y < 0
    if z < 0.03 or z > 0.66:
        return False  # a barra fica por cima do cinto
    if z > 0.44 and ax > 0.165:
        return False  # as cavas
    if front and z > 0.47 and ax < 0.07 + (z - 0.47) * 0.5:
        return False  # o decote em U
    if not front and z > 0.55 and ax < 0.07 + (z - 0.55) * 0.5:
        return False  # o decote das costas, mais alto
    if z > 0.6 and ax < 0.09:
        return False
    return True


tk = b.add('tank', clothe(part('torso'), tank_keep, 0.007 * H), tank, region='body', weight_fn=lambda p: auto_weights(sk, p, 'torso'), subdiv=0)
relief(tk, lambda p: 0.0015 * H * (ridge(p.z / H * 300) - 0.4) * (p.z < hz + 0.08 * H))  # a barra canelada

# ================================================================ CALÇA PRETA, cinto e SAPATOS simples
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    P = Sculpt()
    P.chain([l + Vector((0, 0, 0.07 * H)), l.lerp(k, 0.5), k + Vector((0, -0.004 * H, 0)), k.lerp(f, 0.6), f + Vector((0, 0, 0.08 * H))],
            [0.098 * H, 0.09 * H, 0.078 * H, 0.072 * H, 0.068 * H], step=0.45)
    c2 = (l.x, l.y)
    fold = lambda p, c=c2: 0.0035 * H * (ridge(math.atan2(p.x - c[0], p.y - c[1]) * 5 + p.z / H * 26 + n3(p, 16)) - 0.35)
    b.add('pants' + side, P.mesh(res=0.011, smooth=3, disp=fold, target=1300), M['legs'], region='leg' + side, subdiv=0)
    S = Sculpt()
    S.ell(f + Vector((0, -0.05 * H, 0.025 * H)), (0.058 * H, 0.13 * H, 0.045 * H))
    S.ell(f + Vector((0, 0.03 * H, 0.04 * H)), (0.05 * H, 0.05 * H, 0.05 * H))
    S.ell(f + Vector((0, -0.12 * H, 0.03 * H)), (0.05 * H, 0.05 * H, 0.03 * H))
    b.add('shoe' + side, S.mesh(res=0.008, smooth=3, target=700), shoe, region='k' + side, subdiv=0)
    b.add('sole' + side, sole_part((f.x, f.y - 0.045 * H, f.z - 0.012 * H), (0.112 * H, 0.27 * H, 0.022 * H), bevel=0.01), sole, region='k' + side, subdiv=0)
Hp = Sculpt()  # o quadril da calça, unindo as duas pernas
Hp.ell(Vector((0, 0.0, hz - 0.03 * H)), (0.19 * H, 0.135 * H, 0.12 * H))
Hp.ell(Vector((0, 0.04 * H, hz - 0.06 * H)), (0.17 * H, 0.12 * H, 0.1 * H))
b.add('pantsHip', Hp.mesh(res=0.012, smooth=3, disp=lambda p: 0.002 * H * n3(p, 14), target=900), M['legs'], region='body', weight_fn=lambda p: auto_weights(sk, p, None), subdiv=0)
b.add('belt', rod([(math.sin(a) * 0.182 * H, -math.cos(a) * 0.13 * H, hz + 0.07 * H) for a in [i / 26 * TAU for i in range(27)]], 0.022 * H, 6, caps=False, flat=(outward((0, 0)), 0.3)),
      belt, region='torso', subdiv=0)
b.add('buckle', box((0, -0.138 * H, hz + 0.07 * H), (0.07 * H, 0.012 * H, 0.05 * H), bevel=0.006), buckle, region='torso', subdiv=0)

# ================================================================ CABELO grisalho curto (escovinha) e o relevo da queimadura
HC = Vector((hc.x, hc.y + 0.004, hc.z + 0.012))


def hair_keep(p):
    q = p - hc
    z, y = q.z / H, q.y / H
    if q.x > 0.08 * H and z < 0.07:
        return False  # o cabelo não cresce na queimadura (lado esquerdo)
    line = 0.06 if y < -0.06 else (0.0 if y < 0.06 else -0.08)  # testa · têmporas · nuca
    return z > line + 0.012 * math.sin(q.x / H * 40)


hair = b.add('hair', clothe(part('head'), hair_keep, 0.009 * H, cuts=1), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)
relief(hair, lambda p: 0.0016 * H * (ridge(n3(p, 90) * 9, 2) - 0.4))  # a escovinha arrepiada


def burn(p):
    # a pele repuxada da queimadura: faixas em relevo no lado esquerdo do rosto (x > 0)
    q = p - hc
    if q.x < 0.035 * H or q.y > 0.04 * H:
        return 0.0
    k = lim((q.x - 0.035 * H) / (0.04 * H))
    return 0.0022 * H * k * (ridge((q.z + q.x * 0.6) / H * 160 + n3(p, 60) * 2, 2) - 0.3)


relief(part('head'), burn)
br = []
for s in (1, -1):  # as sobrancelhas grossas e grisalhas (a esquerda falha, na queimadura)
    pts = [(s * 0.022 * H, hc.y - 0.15 * H, hc.z + 0.036 * H), (s * 0.05 * H, hc.y - 0.147 * H, hc.z + 0.042 * H), (s * 0.075 * H, hc.y - 0.137 * H, hc.z + 0.036 * H)]
    if s > 0:
        pts = pts[:2]
    br.append(rod(pts, 0.007 * H, 5, flat=(lambda q: q - hc, 0.5)))
b.add('brows', merge(*br), hairm, region='head', subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'cristopher.blend'), check_existing=False)
