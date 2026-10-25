"""
ARTHUR — public/models/arthur.glb
Referência: a miniatura oficial de CALAMIDADE (o kit do jogo é o dessa campanha). Cabelo castanho na altura dos
ombros, MEIO-PRESO num rabo de cavalo pequeno atrás, com mechas brancas grandes (Afinidade com Sangue); barba
grisalha com bigode castanho; cicatriz diagonal; olhos de cores diferentes (textura face_abutre); brincos; camisa
social clara com a manga dobrada; COLETE PRETO com o brasão dos Gaudérios Abutres do lado esquerdo; a alça da capa
de guitarra cruzando o peito; calça preta com bolsos grandes e amarrações; tênis de cano alto.
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
    'torso': material('shirt_cream', '#e2dcbc', 0.85),
    'arm': material('shirt_cream', '#e2dcbc', 0.85),
    'handR': material('hand_abutre', '#ffffff', 0.8),  # textura com tatuagem
    'legs': material('pants_abutre', '#26272b', 0.9),
    'feet': material('boots_abutre', '#18181a', 0.7),
}
vest = material('vest', '#1e1e21', 0.8)
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

# COLETE PRETO fechado por uma fileira de botões, com bolsos no peito e o brasão dos Gaudérios Abutres (escudo com
# asas) do lado ESQUERDO dele (+x) — a miniatura de Calamidade
vest_rings = [(hz - 0.06, 0.188, 0.132), (hz + 0.15, 0.18, 0.127), (hz + 0.35, 0.228, 0.152), (hz + 0.47, 0.234, 0.154), (hz + 0.56, 0.162, 0.117)]
b.add('vest', open_tube(vest_rings, gap=0.002, seg=24), vest, region='torso')
for i in range(5):
    b.add(f'button{i}', ellipsoid((0.0, -0.158, hz + 0.0 + i * 0.09), (0.009, 0.005, 0.009), 6, 4), button, region='torso', subdiv=0)
for s in (1, -1):
    lap = [(s * 0.045, -0.14, hz + 0.56, 0.03, 0.008), (s * 0.06, -0.156, hz + 0.5, 0.032, 0.008), (s * 0.03, -0.16, hz + 0.44, 0.012, 0.006)]
    b.add(f'lapel{s}', tube(lap, 5), vest, region='torso', subdiv=0)
    # bolsos de peito e da barriga (abas costuradas)
    b.add(f'chestpocket{s}', box((s * 0.1, -0.162, hz + 0.33), (0.07, 0.008, 0.055)), vest, region='torso', subdiv=0)
    b.add(f'bellypocket{s}', box((s * 0.1, -0.15, hz + 0.08), (0.075, 0.008, 0.06)), vest, region='torso', subdiv=0)
crest_m = material('crest_abutres', '#8c8a86', 0.5, metal=0.3)
crest = [ellipsoid((0.1, -0.17, hz + 0.39), (0.02, 0.006, 0.024), 8, 6)]
for s in (1, -1):  # as asas nas extremidades do escudo
    crest.append(xform(box((0.1 + s * 0.03, -0.169, hz + 0.4), (0.03, 0.004, 0.014)), lambda p, s=s: Vector((p.x, p.y, p.z + (p.x - 0.1) * s * 0.35))))
b.add('crest', merge(*crest), crest_m, region='torso', subdiv=0)
b.add('brooch', ellipsoid((0.1, -0.172, hz + 0.39), (0.008, 0.004, 0.009), 6, 4), brooch, region='torso', subdiv=0)
# a ALÇA da capa de guitarra cruzando o peito: do quadril direito ao ombro esquerdo e por cima dele até as costas
strap = material('case_strap', '#141416', 0.7)
b.add('case_strap', tube([(-0.17, -0.12, hz + 0.08, 0.02, 0.006), (-0.06, -0.168, hz + 0.24, 0.022, 0.006), (0.07, -0.17, hz + 0.44, 0.022, 0.006),
                          (0.13, -0.11, hz + 0.58, 0.022, 0.006), (0.14, 0.0, hz + 0.62, 0.022, 0.006), (0.12, 0.12, hz + 0.52, 0.022, 0.006)], 6),
      strap, region='torso', subdiv=0)
b.add('strap_buckle', box((-0.06, -0.175, hz + 0.24), (0.03, 0.006, 0.02)), button, region='torso', subdiv=0)
# gola GRANDE da camisa, aberta e deitada por cima do colete (as pontas descem sobre as lapelas — as artes)
for s in (1, -1):
    b.add(f'collar{s}', tube([(s * 0.05, -0.1, 1.585, 0.022, 0.012), (s * 0.075, -0.14, 1.55, 0.027, 0.007), (s * 0.095, -0.158, 1.5, 0.022, 0.006), (s * 0.105, -0.16, 1.465, 0.005, 0.004)], 8), M['torso'], region='torso', subdiv=0)
# cinto, bolsos GRANDES da calça e as amarrações (tiras) nas coxas
b.add('belt', tube([(0, 0, hz + 0.02, 0.178, 0.125), (0, 0, hz + 0.07, 0.18, 0.127)], 18), material('belt_abutre', '#241c16', 0.7), region='torso', subdiv=0)
for s in (1, -1):
    side = 'L' if s > 0 else 'R'
    b.add(f'cargo{s}', box((s * 0.15, -0.03, hz - 0.3), (0.035, 0.12, 0.15)), M['legs'], region='leg' + side, subdiv=0)
    h, k = sk['l' + side], sk['k' + side]
    for t in (0.3, 0.72):
        c = h.lerp(k, t)
        b.add(f'tie{s}{t}', tube([(c.x, c.y, c.z - 0.008, 0.086 - t * 0.012, 0.086 - t * 0.012), (c.x, c.y, c.z + 0.008, 0.086 - t * 0.012, 0.086 - t * 0.012)], 12), strap, region='leg' + side, subdiv=0)
# tênis de CANO ALTO: cano escuro até o meio da canela, cadarço claro na frente e solado branco
sole = material('sneaker_sole', '#d8d6d0', 0.7)
lace = material('sneaker_lace', '#bcbab4', 0.8)
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.58), f + Vector((0, 0, 0.06)), 0.062, 0.06, n=3), 12), M['feet'], region='k' + side)
    top = k.lerp(f, 0.6)
    # medidas do pé do Builder (lib.foot_part: comprimento 0,24·H, largura 0,1·H, sola em f.z - 0,03, centro em f.y - 0,05)
    H = -sk['toe' + side].y / 0.14
    L, W, bot, cy = 0.24 * H, 0.1 * H, f.z - 0.03, f.y - 0.05
    yc, ylen = cy + (-0.06 * L + 0.02 * W) / 2, 0.78 * L + 0.9 * W + 0.014
    top_z = bot + 0.42 * 0.075 * H + 0.5 * W
    b.add('laces' + side, tube([(top.x, top.y - 0.064, top.z, 0.012, 0.004), (f.x, cy - 0.05 * L, top_z + 0.012, 0.014, 0.004), (f.x, cy - 0.22 * L, top_z - 0.004, 0.014, 0.004)], 5), lace, region='k' + side, subdiv=0)
    b.add('sole' + side, box((f.x, yc, bot + 0.004), (1.04 * W + 0.014, ylen, 0.026), bevel=0.006), sole, region='foot' + side, subdiv=0)

# cabelo castanho PUXADO PARA TRÁS em mechas até o RABO DE CAVALO pequeno atrás da cabeça (meio-preso), com as mechas
# BRANCAS largas do lado direito dele; nas laterais e na nuca o cabelo fica solto até a altura dos ombros (Calamidade)
import random
random.seed(7)
HC = Vector((hc.x, hc.y + 0.01, hc.z + 0.012))
HR = (0.146, 0.156, 0.168)
b.add('hair_cap', hair_cap((HC.x, HC.y, HC.z), (HR[0] * 0.99, HR[1] * 0.99, HR[2] * 0.99), front=0.24, side=0.46, back=0.64), hairm, region='head')
BUN = Vector((0, 0.13, hc.z + 0.13))  # o nó do meio-preso, atrás e no alto da cabeça


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
    (grays if -0.75 < gam < -0.08 or i in (14, 15) else browns).append(strand(pts, rad))
# laterais soltas: da têmpora, por trás da orelha, caindo até os ombros
for s_ in (1, -1):
    for j in range(5):
        p0 = hair_pt(s_ * (1.05 + j * 0.08), 0.75 + j * 0.12, 1.04)
        pts = [p0, p0 + Vector((s_ * 0.014, 0.03, -0.06)), p0 + Vector((s_ * 0.02, 0.05, -0.13)), p0 + Vector((s_ * 0.022, 0.06, -0.2)), p0 + Vector((s_ * 0.02, 0.065, -0.25 - j * 0.01))]
        (grays if s_ < 0 and j == 1 else browns).append(strand(pts, [0.021, 0.02, 0.016, 0.011, 0.004]))
# nuca: solta até os ombros
for j in range(9):
    gam = -1.0 + j * 0.25
    for beta in (2.1, 2.45):  # duas camadas: cobre a nuca sem deixar a pele aparecer entre as mechas
        p0 = hair_pt(gam, beta, 1.03)
        browns.append(strand([p0, p0 + Vector((0, 0.03, -0.08)), p0 + Vector((0, 0.045, -0.17)), p0 + Vector((gam * 0.012, 0.055, -0.25)), p0 + Vector((gam * 0.015, 0.06, -0.3))], [0.034, 0.032, 0.026, 0.018, 0.005]))
# mecha solta caindo na testa (lado direito dele, grisalha)
p0 = hair_pt(-0.3, 0.8, 1.06)
grays.append(strand([p0, p0 + Vector((-0.012, -0.02, -0.05)), p0 + Vector((-0.022, -0.026, -0.09))], [0.008, 0.007, 0.002], 5))
b.add('hair_locks', merge(*browns), hairm, region='head', subdiv=0)
b.add('hair_streak', merge(*grays), gray, region='head', subdiv=0)
# o rabinho do meio-preso: nó atrás da cabeça e a ponta caindo pela nuca, com uma mecha branca
tie_m = material('hair_tie', '#141414', 0.6)
b.add('ponytail', tube([(BUN.x, BUN.y - 0.01, BUN.z + 0.005, 0.03, 0.026), (BUN.x, BUN.y + 0.03, BUN.z - 0.02, 0.028, 0.024),
                        (BUN.x, BUN.y + 0.05, BUN.z - 0.08, 0.022, 0.02), (BUN.x, BUN.y + 0.05, BUN.z - 0.14, 0.006, 0.006)], 8), hairm, region='head')
b.add('ponytail_gray', tube([(BUN.x - 0.012, BUN.y + 0.02, BUN.z - 0.01, 0.01, 0.01), (BUN.x - 0.012, BUN.y + 0.06, BUN.z - 0.08, 0.008, 0.008), (BUN.x - 0.01, BUN.y + 0.06, BUN.z - 0.12, 0.003, 0.003)], 6), gray, region='head', subdiv=0)
b.add('hair_tie', tube([(BUN.x, BUN.y + 0.005, BUN.z, 0.032, 0.029), (BUN.x, BUN.y + 0.015, BUN.z - 0.012, 0.032, 0.029)], 8), tie_m, region='head', subdiv=0)

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
