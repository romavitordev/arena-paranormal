"""
ARTHUR — public/models/arthur.glb
Referências: cabelo castanho com mecha grisalha preso em coque; barba grisalha com bigode castanho;
cicatriz diagonal; olhos de cores diferentes (textura face_abutre); brincos; camisa creme com a manga
dobrada; colete azul-marinho com botões e broche de abutre; calça escura com bolsos; coturnos.
Possui SÓ o braço direito: do lado esquerdo há uma manga vazia dobrada e presa no ombro, ligada ao
tronco (nenhuma animação a move). O case de violão, a sniper, a Arma de Sangue e os olhos do Rebirth
são adicionados em código.
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'arthur.glb'
b = Builder(width=1.0, bulk=1.06, height=0.93)  # 1,65 m (mais baixo e forte)
sk = b.sk
hz = sk['hips'].z

M = {
    'skin': material('skin_abutre', '#c09a80', 0.8),
    'face': material('face_abutre', '#ffffff', 0.8),
    'torso': material('shirt_cream', '#d8cfb4', 0.85),
    'arm': material('shirt_cream', '#d8cfb4', 0.85),
    'handR': material('hand_abutre', '#ffffff', 0.8),  # textura com tatuagem
    'legs': material('pants_abutre', '#2e2f33', 0.9),
    'feet': material('boots_abutre', '#1a1816', 0.7),
}
vest = material('vest', '#1c2230', 0.8)
button = material('buttons', '#8a8a90', 0.4, metal=0.6)
brooch = material('brooch', '#b8a878', 0.35, metal=0.8)
hairm = material('hair_brown', '#3e3028', 0.6)
gray = material('hair_gray', '#c8c4bc', 0.6)
beard = material('beard_gray', '#57504a', 0.85)
stache = material('mustache', '#4a3626', 0.8)
metal = material('earring', '#c8c8cc', 0.3, metal=0.9)

# só o braço direito
hc = b.body(M, [(-0.12, 0.17), (0.0, 0.17), (0.18, 0.165), (0.38, 0.212), (0.5, 0.222), (0.6, 0.12), (0.66, 0.07)], arms=('R',))

# manga do braço direito dobrada no cotovelo, antebraço à mostra (pele)
sR, eR, hR = sk['sR'], sk['eR'], sk['handR']
b.add('forearmR', tube(limb_rings(eR.lerp(hR, 0.12), eR.lerp(hR, 0.93), 0.059, 0.05, n=4), 12), M['skin'], region='armR')
b.add('rolled_sleeve', tube(limb_rings(eR + Vector((0, 0, 0.03)), eR.lerp(hR, 0.18), 0.068, 0.066, n=2), 12), M['arm'], region='armR', subdiv=0)
# lado esquerdo: ombro com manga vazia dobrada e presa (fixa no tronco)
sL = sk['sL']
b.add('stump', ellipsoid((sL.x, 0, sL.z - 0.02), (0.075, 0.075, 0.08), 12, 8), M['arm'], region='sp')
# manga vazia caindo até o quadril (achatada, sem braço dentro), com o punho dobrado — como na arte
sleeve = [(sL.x + 0.01, 0.0, sL.z - 0.02, 0.07, 0.065), (sL.x + 0.03, -0.01, sL.z - 0.2, 0.06, 0.032), (sL.x + 0.035, -0.015, sL.z - 0.42, 0.055, 0.026), (sL.x + 0.03, -0.02, sL.z - 0.58, 0.052, 0.024)]
b.add('empty_sleeve', tube(sleeve, 12), M['arm'], region='sp')
b.add('empty_cuff', tube([(sL.x + 0.03, -0.02, sL.z - 0.56, 0.056, 0.028), (sL.x + 0.03, -0.02, sL.z - 0.62, 0.056, 0.028)], 12), M['arm'], region='sp', subdiv=0)

# colete com botões e broche de abutre
vest_rings = [(hz - 0.04, 0.185, 0.13), (hz + 0.15, 0.178, 0.125), (hz + 0.35, 0.226, 0.15), (hz + 0.47, 0.232, 0.152), (hz + 0.56, 0.16, 0.115)]
b.add('vest', open_tube(vest_rings, gap=0.03, seg=22), vest, region='torso')
# colete TRESPASSADO: duas fileiras de botões, lapelas em V e ponta na barra da frente
for i in range(4):
    for s in (1, -1):
        b.add(f'button{i}{s}', ellipsoid((s * 0.05, -0.156, hz + 0.08 + i * 0.08), (0.011, 0.006, 0.011), 6, 4), button, region='torso', subdiv=0)
for s in (1, -1):
    lap = [(s * 0.05, -0.14, hz + 0.56, 0.035, 0.008), (s * 0.08, -0.155, hz + 0.47, 0.045, 0.008), (s * 0.06, -0.158, hz + 0.39, 0.02, 0.006)]
    b.add(f'lapel{s}', tube(lap, 5), vest, region='torso', subdiv=0)
    b.add(f'vestpoint{s}', cone((s * 0.06, -0.135, hz - 0.03), (s * 0.03, -0.14, hz - 0.1), 0.05, 4), vest, region='torso', subdiv=0)
b.add('brooch', merge(ellipsoid((0.11, -0.158, hz + 0.4), (0.022, 0.008, 0.02), 8, 6),
                      xform(box((0.11, -0.16, hz + 0.41), (0.07, 0.005, 0.02)), lambda p: p)), brooch, region='torso', subdiv=0)
# gola GRANDE da camisa, aberta e deitada por cima do colete (as pontas descem sobre as lapelas — as artes)
for s in (1, -1):
    b.add(f'collar{s}', tube([(s * 0.05, -0.1, 1.585, 0.022, 0.012), (s * 0.075, -0.14, 1.55, 0.027, 0.007), (s * 0.095, -0.158, 1.5, 0.022, 0.006), (s * 0.105, -0.16, 1.465, 0.005, 0.004)], 8), M['torso'], region='torso', subdiv=0)
# suspensórios soltos, pendurados do cós até a coxa (a arte de corpo inteiro)
susp = material('suspenders', '#16161a', 0.7)
for s, side in ((1, 'L'), (-1, 'R')):
    l = sk['l' + side]
    b.add('suspender' + side, tube([(s * 0.12, -0.11, hz + 0.03, 0.014, 0.006), (s * 0.13, -0.115, hz - 0.12, 0.014, 0.006), (s * 0.14, -0.1, hz - 0.28, 0.014, 0.006), (s * 0.15, -0.06, hz - 0.36, 0.012, 0.006)], 6), susp, region='leg' + side, subdiv=0)
# cinto e bolsos da calça
b.add('belt', tube([(0, 0, hz + 0.02, 0.178, 0.125), (0, 0, hz + 0.07, 0.18, 0.127)], 18), material('belt_abutre', '#241c16', 0.7), region='torso', subdiv=0)
for s in (1, -1):
    b.add(f'cargo{s}', box((s * 0.15, -0.02, hz - 0.3), (0.03, 0.1, 0.13)), M['legs'], region='leg' + ('L' if s > 0 else 'R'), subdiv=0)
# coturnos
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.62), f + Vector((0, 0, 0.06)), 0.06, 0.058, n=3), 12), M['feet'], region='k' + side)

# cabelo castanho PUXADO PARA TRÁS em mechas até o COQUE no alto da cabeça, com as mechas grisalhas do lado direito
# dele; nas laterais o cabelo fica solto, passa por trás da orelha e cai até a nuca; uma mecha solta cai na testa
import random
random.seed(7)
HC = Vector((hc.x, hc.y + 0.01, hc.z + 0.012))
HR = (0.146, 0.156, 0.168)
b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.99, HR[1] * 0.99, HR[2] * 0.99), front=0.24, side=0.46, back=0.64), hairm, region='head')
BUN = Vector((0, 0.035, hc.z + 0.2))


def hair_pt(gam, beta, r):
    return HC + Vector((math.sin(gam) * HR[0] * r, -math.cos(beta) * math.cos(gam) * HR[1] * r, math.sin(beta) * math.cos(gam) * HR[2] * r))


def strand(pts, radii, seg=6):
    rings = [(q.x, q.y, q.z, r, r) for q, r in zip(pts, radii)]
    return tube(rings, seg)


browns, grays = [], []
for i in range(22):
    gam = -1.2 + 2.4 * i / 21 + random.uniform(-0.03, 0.03)
    b0 = 0.78 + 0.3 * abs(gam) ** 1.5
    pts = []
    for k in range(7):
        t = k / 6
        beta = b0 + (1.45 - b0) * t
        q = hair_pt(gam * (1 - 0.75 * t), beta, 1.05 + 0.05 * math.sin(t * math.pi))
        pts.append(q.lerp(BUN, smoothstep(0.55, 1.0, t) * 0.85))
    rad = [0.02 - 0.006 * k / 6 for k in range(7)]
    (grays if -0.5 < gam < -0.1 or i == 15 else browns).append(strand(pts, rad))
# laterais soltas: da têmpora, por trás da orelha, até a nuca
for s_ in (1, -1):
    for j in range(5):
        p0 = hair_pt(s_ * (1.05 + j * 0.08), 0.75 + j * 0.12, 1.04)
        pts = [p0, p0 + Vector((s_ * 0.012, 0.03, -0.05)), p0 + Vector((s_ * 0.014, 0.05, -0.1)), p0 + Vector((s_ * 0.01, 0.06, -0.13 - j * 0.008))]
        browns.append(strand(pts, [0.02, 0.018, 0.012, 0.004]))
# nuca
for j in range(7):
    gam = -0.9 + j * 0.3
    p0 = hair_pt(gam, 2.4, 1.03)
    browns.append(strand([p0, p0 + Vector((0, 0.02, -0.07)), p0 + Vector((0, 0.025, -0.12))], [0.024, 0.018, 0.005]))
# mecha solta caindo na testa (lado direito dele, grisalha)
p0 = hair_pt(-0.3, 0.8, 1.06)
grays.append(strand([p0, p0 + Vector((-0.012, -0.02, -0.05)), p0 + Vector((-0.022, -0.026, -0.09))], [0.008, 0.007, 0.002], 5))
b.add('hair_locks', merge(*browns), hairm, region='head', subdiv=0)
b.add('hair_streak', merge(*grays), gray, region='head', subdiv=0)
# coque no alto, com a faixa grisalha enrolada
b.add('bun', merge(ellipsoid(tuple(BUN + Vector((0, 0.005, 0.03))), (0.05, 0.045, 0.042), 10, 8), tube([(BUN.x, BUN.y, BUN.z - 0.01, 0.03, 0.028), (BUN.x, BUN.y, BUN.z + 0.02, 0.032, 0.03)], 8)), hairm, region='head')
b.add('bun_gray', ellipsoid(tuple(BUN + Vector((0.012, -0.012, 0.05))), (0.024, 0.02, 0.018), 8, 6), gray, region='head', subdiv=0)

# BARBA cheia grisalha colada no rosto (sobe pela mandíbula até a costeleta) terminando em PONTA abaixo do queixo;
# bigode CASTANHO que desce pelos cantos da boca até o cavanhaque castanho no meio da barba — como nas artes
beard_shell = ellipsoid((hc.x, hc.y - 0.002, hc.z), (0.145, 0.156, 0.17), 56, 20, phi=(0.17, 0.83))
def jaw(p):
    zmax = hc.z - 0.105 + smoothstep(0.03, 0.11, abs(p.x)) * 0.075
    zmax += 0.007 * math.sin(p.x * 260)  # borda de cima em fios (não fica com cara de máscara)
    q = Vector((p.x, p.y, min(p.z, zmax)))
    # o queixo desce em ponta
    d = max(0.0, (hc.z - 0.13) - q.z)
    q.z -= d * 0.9 * math.exp(-(q.x / 0.05) ** 2)
    q.y += d * 0.25
    return q
b.add('beard', xform(beard_shell, jaw), beard, region='head')
for s2 in (1, -1):
    b.add(f'mustache{s2}', tube([(s2 * 0.004, -0.153, hc.z - 0.066, 0.012, 0.009), (s2 * 0.03, -0.149, hc.z - 0.074, 0.013, 0.01), (s2 * 0.048, -0.14, hc.z - 0.1, 0.011, 0.009), (s2 * 0.04, -0.138, hc.z - 0.14, 0.01, 0.008), (s2 * 0.014, -0.135, hc.z - 0.17, 0.009, 0.008)], 8), stache, region='head', subdiv=0)
b.add('goatee', tube([(0, -0.156, hc.z - 0.115, 0.01, 0.005), (0, -0.152, hc.z - 0.15, 0.013, 0.006), (0, -0.14, hc.z - 0.19, 0.008, 0.005), (0, -0.13, hc.z - 0.215, 0.002, 0.002)], 8), stache, region='head', subdiv=0)
# brincos na orelha esquerda
for i in range(2):
    b.add(f'earring{i}', ellipsoid((0.142, 0.01 + i * 0.012, hc.z - 0.03 - i * 0.012), (0.006, 0.006, 0.006), 6, 4), metal, region='head', subdiv=0)

b.export(OUT)
