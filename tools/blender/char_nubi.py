"""
NUBI — public/models/nubi.glb (Escriptas, Desconjuração / Calamidade). Técnica do Dante / Cristino (sculpt_lib).
Referências: a wiki "Nubi" (aparência de Desconjuração e Calamidade) e a arte enviada pelo dono do projeto:
  - mulher negra, ~1,68 m, magra; cabelo PRETO puxado para trás num RABO ALTO e comprido de tranças/locs com
    PRESILHAS DOURADAS; olhos pretos com uma FAIXA PRETA descendo de cada olho; "MORTE" escrito na testa (textura);
  - tatuagens dos Escriptas pelo corpo (textura da pele), JOIAS DE OURO: as voltas empilhadas no pescoço, os brincos
    compridos de barrinhas, anéis nos dedos;
  - MANTO PRETO caindo dos ombros até as canelas, aberto na frente; a faixa preta no peito e o pano preto enrolado
    na cintura até os tornozelos; PÉS DESCALÇOS;
  - a BENGALA com a CABEÇA DE CHACAL DOURADA (com o pequeno símbolo ocultista preto), na mão direita — modelada aqui,
    presa 100% ao osso da mão (no repouso ela pende para baixo, como as armas em código no soquete da mão).
  node tools/blender/build.mjs nubi   → public/models/nubi.glb (+ tools/blender/fonte/nubi.blend)
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from sculpt_lib import Sculpt, ridge, n3, rod, outward, ring_pts, shell_grid, relief, clothe
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'nubi.glb'
random.seed(2009)  # o incêndio do orfanato

b = Builder(width=0.88, bulk=0.88, height=0.94)  # ~1,68 m, magra
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

M = {
    'skin': material('skin_nubi', '#ffffff', 0.7),  # pele escura com as tatuagens dos Escriptas (textura)
    'face': material('face_nubi', '#ffffff', 0.7),  # olhos pretos, as faixas pretas, "MORTE" na testa (textura)
    'torso': material('skin_torso_nubi', '#ffffff', 0.7),
    'arm': material('skin_nubi', '#ffffff', 0.7),
    'hand': material('skin_nubi', '#ffffff', 0.7),
    'legs': material('skin_nubi', '#ffffff', 0.7),
    'feet': material('skin_nubi', '#ffffff', 0.7),
}
cloak = material('cloak_nubi', '#ffffff', 0.95)  # o manto preto com as dobras (textura)
cloth = material('wrap_nubi', '#1a1618', 0.9)  # a faixa do peito e o pano da cintura
hairm = material('hair_nubi', '#ffffff', 0.55)  # tranças pretas com brilho (textura)
gold = material('gold_nubi', '#d8b04a', 0.3, metal=0.85)
wood = material('cane_nubi', '#2a1c14', 0.6)
mark = material('sigil_nubi', '#0a0808', 0.4)  # o símbolo ocultista na cabeça de chacal

PREVIEW = {'skin_nubi': '#5a3826', 'skin_torso_nubi': '#5a3826', 'face_nubi': '#5a3826', 'cloak_nubi': '#1c1a1e', 'hair_nubi': '#141012'}
for m in bpy.data.materials:
    for k, c in PREVIEW.items():
        if m.name.endswith(k):
            m['preview'] = c

# magra: ombros estreitos, cintura fina, quadril um pouco mais largo
TP = [(-0.11, 0.158), (0.0, 0.152), (0.17, 0.13), (0.36, 0.18), (0.47, 0.188), (0.57, 0.104), (0.63, 0.062)]
hc = b.body(M, TP, arm_r=(0.058, 0.048, 0.04), leg_r=(0.08, 0.062, 0.048), head_r=(0.13, 0.142, 0.158), neck_r=0.05, feet='bare')


def ring_at(c, rx, ry, n=12):
    """anel horizontal centrado em c (ring_pts centra no eixo do corpo: serve só para o pescoço e a cintura)"""
    return [Vector((c.x + q.x, c.y + q.y, c.z)) for q in ring_pts(0, rx, ry, 0, TAU, n)]


def part(name):
    return next(o for o in b.parts if o.name == name)


def lim(x):
    return max(0.0, min(1.0, x))


# ================================================================ relevo: clavículas e o colo
def chest_relief(p):
    x, y, z = p.x, p.y, p.z - hz
    ax = abs(x)
    d = 0.0
    if y < 0 and z > 0.5 * H:
        d += 0.0035 * H * math.exp(-((z - (0.6 - ax / H * 0.25) * H) / (0.008 * H)) ** 2) * (ax < 0.14 * H)
    if y < -0.02 and 0.38 * H < z < 0.52 * H:  # o busto
        d += 0.022 * H * math.exp(-((ax - 0.07 * H) / (0.045 * H)) ** 2) * math.exp(-((z - 0.44 * H) / (0.045 * H)) ** 2)
    return d


relief(part('torso'), chest_relief)

# ================================================================ a FAIXA PRETA no peito (a malha do tronco, inflada)
def band_keep(p):
    z = (p.z - hz) / H
    return 0.37 < z < 0.51


b.add('chestBand', clothe(part('torso'), band_keep, 0.006 * H, cuts=1), cloth, region='body', weight_fn=lambda p: auto_weights(sk, p, 'torso'), subdiv=0)

# ================================================================ o PANO PRETO enrolado na cintura até os tornozelos (saia)
def skirt_pt(a, v):
    # v = 0 na cintura, 1 nos tornozelos; abre um pouco embaixo; a fenda na frente da perna direita
    rx = (0.17 + 0.05 * v) * H
    ry = (0.12 + 0.05 * v) * H
    fold = 1 + 0.05 * v * (ridge(a * 6 + v * 2 + n3(Vector((a, v, 0)), 3)) - 0.4)
    z = hz + 0.05 * H - v * (hz - 0.08 * H)
    return Vector((math.sin(a) * rx * fold / b.k_tx, -math.cos(a) * ry * fold / b.k_ty, z))


SL = 0.06  # a fenda (fração da volta), na frente da perna direita
skirt_rows = [[skirt_pt((0.03 + SL + (1 - SL) * j / 56) * TAU, v) for j in range(57)] for v in [k / 14 for k in range(15)]]


def skirt_weights(p):
    side = 'L' if p.x > 0 else 'R'
    t = lim((hz - p.z) / (hz - 0.1 * H))
    return {'hips': 1 - t * 0.7, ('l' + side): t * 0.5, ('k' + side): t * 0.2}


b.add('skirt', shell_grid(skirt_rows, 0.006 * H), cloth, region='torso', weight_fn=skirt_weights, subdiv=0)

# ================================================================ o MANTO PRETO: dos ombros até as canelas, aberto na frente
def cape_pt(a, v):
    # ombro REDONDO; depois do ombro fecha um pouco na cintura (cai rente aos braços) e abre em SINO na barra; atrás é
    # mais comprido; as dobras afundam mais embaixo (o pano pesa)
    V0 = 0.24
    th = min(1.0, v / V0) * math.pi / 2
    side = abs(math.sin(a))
    k = 0.55 + 0.45 * side
    t = max(0.0, v - V0) / (1 - V0)
    waist = -0.035 * H * math.sin(min(1.0, t / 0.55) * math.pi / 2) * (1 - smoothstep(0.55, 1.0, t))
    bell = 0.07 * H * smoothstep(0.45, 1.0, t)
    rx = 0.09 * H + (0.355 * H - 0.09 * H) * math.sin(th) * k + (waist + bell) * (0.6 + 0.4 * side)
    ry = 0.085 * H + (0.19 * H - 0.085 * H) * math.sin(th) + (waist * 0.5 + bell * 1.2)
    front = max(0.0, math.cos(a))
    ln = (1.28 - 0.18 * front ** 1.5) * H
    fold = 1 + (0.04 + 0.16 * smoothstep(0.1, 1.0, t)) * (ridge(a * 8 + n3(Vector((a * 2, v * 3, 0)), 2) * 1.6, 2) - 0.4)
    hem = 0.035 * H * math.sin(a * 5 + 0.7) * max(0.0, v - 0.85) / 0.15
    z = top + 0.13 * H - 0.07 * H * (1 - math.cos(th)) * k - t * ln + hem
    return Vector((math.sin(a) * rx * fold / b.k_tx, -math.cos(a) * ry * fold / b.k_ty, z))


def gap_at(v):
    """a abertura da frente (fração da volta): larga no peito (a faixa e a barriga tatuada à mostra), fechando embaixo"""
    return 0.13 - 0.06 * smoothstep(0.3, 1.0, v)


GAP = 0.13
cape_rows = [[cape_pt((gap_at(v) + (1 - 2 * gap_at(v)) * j / 72) * TAU, v) for j in range(73)] for v in [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.24] + [0.24 + 0.76 * k / 20 for k in range(1, 21)]]


def cape_weights(p):
    side = 'L' if p.x > 0 else 'R'
    w_arm = smoothstep(0.12 * H, 0.26 * H, abs(p.x)) * smoothstep(top - 0.55 * H, top - 0.12 * H, p.z) * 0.55
    w_hip = smoothstep(hz + 0.12 * H, hz - 0.3 * H, p.z) * (1 - w_arm) * 0.7
    return {'s' + side: w_arm, 'hips': w_hip, 'sp': max(0.0, 1 - w_arm - w_hip)}


cape = b.add('cloak', shell_grid(cape_rows, 0.008 * H), cloak, region='torso', weight_fn=cape_weights, subdiv=0)
relief(cape, lambda p: 0.004 * H * (ridge(math.atan2(p.x, p.y) * 7 + n3(p, 10) * 1.4, 2) - 0.35) * lim((top - p.z) / (0.3 * H)))
# a borda do manto em volta do pescoço: uma dobra fina e contínua (não uma gola grossa)
X = Sculpt()
X.chain([cape_pt((gap_at(0) + (1 - 2 * gap_at(0)) * j / 30) * TAU, 0.0) + Vector((0, 0, 0.006 * H)) for j in range(31)], 0.012 * H, step=0.5)
b.add('cloakCollar', X.mesh(res=0.005, smooth=2, target=700), cloak, region='torso', subdiv=0)

# ================================================================ JOIAS DE OURO
nk = Vector((0, 0, 1.6 * H))
rings = []
for i in range(5):  # as voltas empilhadas no pescoço
    z = 1.585 * H + i * 0.017 * H
    r = (0.056 + 0.002 * i) * H
    rings.append(rod(ring_pts(z, r, r * 0.95, 0, TAU, 20), 0.0055 * H, 6, caps=False))
b.add('neckRings', merge(*rings), gold, region='neck', subdiv=0)
er = []
for s in (1, -1):  # os brincos: argola + três barrinhas compridas penduradas
    e0 = Vector((s * 0.132 * H, 0.0, hc.z - 0.045 * H))
    er.append(rod(ring_at(e0, 0.009 * H, 0.009 * H, 10), 0.002 * H, 4, caps=False))
    for k in (-1, 0, 1):
        x0 = e0.x + s * 0.004 * H
        y0 = e0.y + k * 0.008 * H
        er.append(rod([(x0, y0, e0.z - 0.008 * H), (x0, y0, e0.z - 0.075 * H)], 0.0028 * H, 5))
b.add('earrings', merge(*er), gold, region='head', subdiv=0)
rg = []
for s in (1, -1):  # anéis nos dedos (duas voltas em cada mão)
    h = sk['hand' + ('L' if s > 0 else 'R')]
    for k in range(2):
        c = h + Vector((s * 0.004 * H, -0.02 * H + k * 0.02 * H, -0.085 * H))
        rg.append(rod(ring_at(c, 0.011 * H, 0.011 * H, 10), 0.0028 * H, 4, caps=False))
b.add('fingerRings', merge(*rg), gold, region='body', weight_fn=lambda p: {('handL' if p.x > 0 else 'handR'): 1.0}, subdiv=0)

# ================================================================ CABELO: puxado para trás, RABO ALTO de tranças com presilhas
def hair_keep(p):
    q = p - hc
    z, y = q.z / H, q.y / H
    line = 0.115 - 0.185 * smoothstep(-0.08, 0.06, y)  # testa ALTA (o "MORTE" fica à mostra) → têmporas → nuca, contínuo
    return z > line - 0.01 * abs(q.x / H) * 3


cap = b.add('hair', clothe(part('head'), hair_keep, 0.0055 * H, cuts=2), hairm, region='body', weight_fn=lambda p: {'hd': 1.0}, subdiv=0)  # cuts: a linha do cabelo lisa, sem degraus
relief(cap, lambda p: 0.0045 * H * (ridge(math.atan2(p.x - hc.x, p.z - hc.z) * 22 + n3(p, 40) * 0.6, 3) - 0.35))  # as tranças rentes, puxadas para trás (sulcos marcados)
tie = hc + Vector((0, 0.1 * H, 0.13 * H))
R = Sculpt()
R.ell(tie, (0.045 * H, 0.045 * H, 0.04 * H))
cuffs = []
for k in range(12):  # as tranças (locs) do rabo: sobem um pouco e caem até o meio das costas (feixe volumoso)
    a = (k / 12) * TAU
    dx, dy = math.sin(a) * 0.03 * H, math.cos(a) * 0.024 * H
    sway = 0.015 * H * math.sin(k * 1.7)
    pts = [tie + Vector((dx, dy, 0.0)), tie + Vector((dx * 1.2, 0.05 * H + dy, 0.03 * H)), tie + Vector((dx * 1.6 + sway, 0.1 * H + dy, -0.04 * H)),
           tie + Vector((dx * 1.8 + sway, 0.12 * H + dy, -0.18 * H)), tie + Vector((dx * 2.0 + sway, 0.11 * H + dy, -0.34 * H)), tie + Vector((dx * 2.1 + sway, 0.1 * H + dy, -0.46 * H - 0.02 * H * (k % 3)))]
    R.chain(pts, [0.017 * H, 0.017 * H, 0.016 * H, 0.016 * H, 0.015 * H, 0.011 * H], step=0.5)
    # duas presilhas douradas em cada trança
    for t in (2, 4):
        c = pts[t] + Vector((0, 0, 0.01 * H))
        cuffs.append(rod([c + Vector((0, 0, 0.012 * H)), c - Vector((0, 0, 0.012 * H))], 0.019 * H, 7))
b.add('ponytail', R.mesh(res=0.005, smooth=2, disp=lambda p: 0.0015 * H * (ridge(p.z / H * 140, 2) - 0.4), target=2600), hairm, region='head', subdiv=0)
cuffs.append(rod(ring_at(tie, 0.046 * H, 0.046 * H, 16), 0.009 * H, 6, caps=False))  # o prendedor dourado na base do rabo
b.add('hairCuffs', merge(*cuffs), gold, region='head', subdiv=0)
# (as sobrancelhas ficam na textura do rosto: a malha por cima dobrava o traço)

# ================================================================ a BENGALA com a CABEÇA DE CHACAL dourada (mão direita)
hR = sk['handR']
grip = hR + Vector((0.0, -0.01 * H, -0.075 * H))  # dentro da mão fechada
foot = Vector((grip.x, grip.y, 0.02 * H))
cane_w = lambda p: {'handR': 1.0}
b.add('caneShaft', rod([grip + Vector((0, 0, 0.05 * H)), grip.lerp(foot, 0.5), foot], [0.0135 * H, 0.012 * H, 0.0105 * H], 8), wood, region='body', weight_fn=cane_w, subdiv=0)
b.add('caneTip', rod([foot + Vector((0, 0, 0.03 * H)), foot], [0.0125 * H, 0.0135 * H], 8), gold, region='body', weight_fn=cane_w, subdiv=0)
b.add('caneCollar', rod([grip + Vector((0, 0, 0.04 * H)), grip + Vector((0, 0, 0.075 * H))], [0.019 * H, 0.02 * H], 10), gold, region='body', weight_fn=cane_w, subdiv=0)
# a CABEÇA DE CHACAL (o cabo): acima do punho e à frente, o focinho comprido apontando para a frente (-y), as orelhas
# altas e pontudas; no jogo a mão gira com a pose e a cabeça fica à mostra (como o cabo em L da bengala da Magistrada)
jc = grip + Vector((0, -0.035 * H, 0.085 * H))
J = Sculpt()
J.ell(jc, (0.034 * H, 0.04 * H, 0.04 * H))  # crânio
J.ell(jc + Vector((0, 0.008 * H, -0.03 * H)), (0.026 * H, 0.03 * H, 0.03 * H))  # a nuca descendo ao colar
J.chain([jc + Vector((0, -0.03 * H, -0.006 * H)), jc + Vector((0, -0.07 * H, -0.018 * H)), jc + Vector((0, -0.105 * H, -0.03 * H))], [0.026 * H, 0.019 * H, 0.012 * H], step=0.5)  # focinho
J.ell(jc + Vector((0, -0.108 * H, -0.026 * H)), (0.009 * H, 0.008 * H, 0.008 * H))  # a ponta do nariz
for s in (1, -1):
    J.chain([jc + Vector((s * 0.018 * H, 0.012 * H, 0.025 * H)), jc + Vector((s * 0.024 * H, 0.018 * H, 0.065 * H)), jc + Vector((s * 0.02 * H, 0.022 * H, 0.1 * H))], [0.013 * H, 0.01 * H, 0.003 * H], step=0.5)  # orelha
    J.ell(jc + Vector((s * 0.022 * H, -0.035 * H, 0.012 * H)), (0.006 * H, 0.006 * H, 0.004 * H), neg=True)  # olho cavado
J.chain([grip + Vector((0, 0, 0.07 * H)), jc + Vector((0, 0.006 * H, -0.035 * H))], [0.018 * H, 0.022 * H], step=0.5)  # liga ao colar da bengala
b.add('caneJackal', J.mesh(res=0.004, smooth=2, target=2000), gold, region='body', weight_fn=cane_w, subdiv=0)
# o pequeno SÍMBOLO OCULTISTA preto: um círculo com a cruz, na lateral da cabeça (dos dois lados)
sg = []
for s in (1, -1):
    c = jc + Vector((s * 0.0345 * H, -0.004 * H, 0.004 * H))
    sg.append(rod([c + Vector((0, math.sin(i / 12 * TAU) * 0.011 * H, math.cos(i / 12 * TAU) * 0.011 * H)) for i in range(13)], 0.0022 * H, 4, caps=False))
    sg.append(rod([c + Vector((0, 0, 0.011 * H)), c - Vector((0, 0, 0.011 * H))], 0.002 * H, 4))
    sg.append(rod([c + Vector((0, 0.011 * H, 0)), c - Vector((0, 0.011 * H, 0))], 0.002 * H, 4))
b.add('caneSigil', merge(*sg), mark, region='body', weight_fn=cane_w, subdiv=0)

b.export(OUT)

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonte')
os.makedirs(src, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(src, 'nubi.blend'), check_existing=False)
