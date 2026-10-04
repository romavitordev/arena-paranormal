"""
O DIABO — O PORTADOR DO TRONO (Juan no fim de Hexatombe) — public/models/diabo.glb
Referência: wiki (Juan / O Diabo / Trono do Diabo) e a arte do trono. O que precisa ler de longe:
  - a COROA DE ESPINHOS dourada atrás da cabeça, como um halo de espinhos;
  - as ASAS DE BRAÇOS: galhos de braços vermelhos que saem das costas, se ramificam e terminam em mãos abertas;
  - chifres GROSSOS: um par subindo e um par que entorta para baixo como foices;
  - QUATRO braços com garras (o par de baixo sai das costelas, bem visível);
  - pernas de BODE (coxa de pelo, jarrete dobrado para trás, canela fina, casco fendido) com bocas dentadas na tíbia;
  - rosto do Juan com o sorriso enorme, piercings e o olho faltando; capuz vermelho rasgado e correntes no torso;
  - símbolo de Sangue enorme no peito, boca vertical no umbigo e Sigilos dourados brilhando (textura torso_diabo).
Todas as espessuras em frações de H (o construtor NÃO escala arm_r/leg_r sozinho).
"""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'diabo.glb'
b = Builder(width=1.08, bulk=1.2, height=1.25)
sk = b.sk
H = sk.h
hz = sk['hips'].z
top = 1.55 * H

skin = material('skin_diabo', '#a01818', 0.7)
M = {
    'skin': skin,
    'face': material('face_diabo', '#ffffff', 0.7),
    'torso': material('torso_diabo', '#ffffff', 0.7),  # símbolo de Sangue, boca vertical, sigilos dourados
    'arm': skin,
    'armR': material('arms_diabo', '#ffffff', 0.7),  # Sigilos de Conhecimento dourados (onde o Juan tinha tatuagens)
    'legs': material('goat_fur', '#3a1210', 0.95),
    'feet': material('hoof', '#141010', 0.5),
}
horn = material('horn_diabo', '#1a1412', 0.45)
red = material('mantle_red', '#8a1a1e', 0.85)
red_dk = material('mantle_red_dark', '#5a0e12', 0.9)
chainm = material('chain_juan', '#8a8a90', 0.35, metal=0.9)
spike = material('blood_spike', '#6a0a10', 0.4)
claw = material('claw_black', '#120c0c', 0.4)
gold = material('crown_gold', '#b87810', 0.35, metal=0.7)  # sem emissão: o bloom deixava o dourado branco
wing = material('wing_flesh', '#b0141c', 0.65)

hc = b.body(M, [(-0.12, 0.17), (0.0, 0.17), (0.17, 0.155), (0.36, 0.215), (0.48, 0.24), (0.58, 0.13), (0.65, 0.07)],
            arm_r=(0.068 * H, 0.056 * H, 0.046 * H), leg_r=(0.085 * H, 0.05 * H, 0.04 * H), head_r=(0.14, 0.15, 0.164), feet='bare')


def curve_tube(base, d1, d2, ln, r0, r1=0.003, n=10, seg=8):
    pts = []
    for k in range(n + 1):
        t = k / n
        p = base + d1 * (ln * t) + d2 * (ln * t * t)
        r = r0 * (1 - t) + r1 * t
        pts.append((p.x, p.y, p.z, r, r))
    return tube(pts, seg)


# ---------------- GALHADA: dois chifres grandes e claros que sobem e abrem com pontas (como galhada de cervo) e
# uma coroa de chifres curtos no alto da cabeça (referência da forma do Diabo)
horns = []
for s in (1, -1):
    base = Vector((s * 0.09 * H, hc.y - 0.01 * H, hc.z + 0.1 * H))
    d1 = Vector((s * 0.55, 0.1, 1)).normalized()
    d2 = Vector((s * 0.6, 0.2, -0.25))
    ln = 0.42 * H
    horns.append(curve_tube(base, d1, d2, ln, 0.038 * H, n=12))
    # pontas (galhos) saindo do chifre principal, viradas para cima
    for k, (t, l2, out) in enumerate(((0.35, 0.16, 0.15), (0.6, 0.2, 0.05), (0.82, 0.14, -0.1))):
        p = base + d1 * (ln * t) + d2 * (ln * t * t)
        horns.append(curve_tube(p, Vector((s * out, 0.05, 1)).normalized(), Vector((s * 0.15, 0.05, 0)), l2 * H, 0.022 * H, n=6))
for k in range(5):
    x = (k - 2) * 0.035 * H
    p = Vector((x, hc.y - 0.02 * H, hc.z + 0.15 * H))
    horns.append(curve_tube(p, Vector((x * 2, 0.05, 1)).normalized(), Vector((0, 0.1, 0)), (0.13 - abs(k - 2) * 0.025) * H, 0.016 * H, n=5))
b.add('horns', merge(*horns), material('antler', '#a89060', 0.65), region='head', subdiv=0)
# orelhas pontudas
ears = [cone((s * 0.13 * H, hc.y + 0.01, hc.z + 0.0), (s * 0.24 * H, hc.y + 0.04 * H, hc.z + 0.07 * H), 0.035, 6) for s in (1, -1)]
b.add('ears', merge(*ears), skin, region='head', subdiv=0)
# cabelo PRETO longo e liso caindo até o peito e as costas
hairm = material('hair_diabo', '#141012', 0.6)
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.006, hc.z + 0.014), (0.146 * H, 0.156 * H, 0.168 * H), front=0.2, side=0.42, back=0.62), hairm, region='head')
strands = []
for i in range(18):
    a = -2.3 + i / 17 * 4.6  # de um lado ao outro, passando por trás
    r0 = Vector((math.sin(a) * 0.14 * H, hc.y + math.cos(a) * 0.14 * H, hc.z + 0.05 * H))
    front = abs(a) > 1.6
    ln = (0.5 if front else 0.62) * H
    pts = []
    for k in range(6):
        t = k / 5
        p = r0 + Vector((math.sin(a) * 0.05 * H * t, (math.cos(a) * 0.06 - (0.06 if front else 0)) * H * t, -ln * t))
        pts.append((p.x, p.y, p.z, 0.03 * (1 - 0.5 * t) + 0.006, 0.014))
    strands.append(tube(pts, 6))
b.add('hair_long', merge(*strands), hairm, region='head', subdiv=0)

# ---------------- ASAS DE BRAÇOS (arte do trono): de cada lado, um "osso de asa" grosso de carne vermelha sobe das
# costas e abre para fora (ombro → cotovelo → punho, como a asa de um pássaro); dele pendem DEZENAS de braços em
# leque, como penas — os de perto das costas caem para baixo, os da ponta apontam para fora —, cada um com cotovelo
# dobrado e terminando numa mão aberta de dedos compridos. Três fileiras (cada uma menor e mais à frente), para dar volume.
def rod(pts, radii, seg=7, cap_start=False):
    """Tubo com anéis PERPENDICULARES ao caminho (o `tube` da lib deixa os anéis deitados e achata o que é horizontal).
    Sem tampa no começo por padrão: todo começo fica enterrado em outra peça."""
    pts = [Vector(p) for p in pts]
    verts, faces, uvs = [], [], []
    n = len(pts)
    prev_side = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        side = (prev_side - t * prev_side.dot(t)) if prev_side is not None else t.orthogonal()
        side.normalize()
        prev_side = side
        up = t.cross(side)
        for s in range(seg + 1):
            a = s / seg * TAU
            verts.append(tuple(p + (side * math.cos(a) + up * math.sin(a)) * radii[i]))
            uvs.append((s / seg, i / (n - 1)))
    row = seg + 1
    for i in range(n - 1):
        for s in range(seg):
            a = i * row + s
            faces.append((a, a + row, a + 1 + row, a + 1))
    for k, flip in (((0, True),) if cap_start else ()) + ((n - 1, False),):
        c = len(verts)
        verts.append(tuple(pts[k]))
        uvs.append((0.5, k / (n - 1)))
        for s in range(seg):
            f = (c, k * row + s + 1, k * row + s) if flip else (c, k * row + s, k * row + s + 1)
            faces.append(f)
    return verts, faces, uvs


def open_hand(p, d, sz, spread, fingers=4, thumb=True):
    """Mão aberta: palma, dedos em leque de duas falanges e o polegar para o lado (as fileiras de trás vêm mais simples)."""
    d = d.normalized()
    side = spread.normalized()
    normal = d.cross(side).normalized()
    parts = [ellipsoid(tuple(p + d * sz * 0.5), (sz * 0.9, sz * 0.9, sz * 0.9), 6, 4)]
    c = (fingers - 1) / 2
    for f in range(fingers):
        fd = (d + side * ((f - c) * 0.28)).normalized()
        k0 = p + d * sz * 0.9 + side * ((f - c) * sz * 0.42)
        ln = sz * (2.0 - abs(f - c) * 0.35)
        k1 = k0 + fd * ln * 0.55
        k2 = k1 + (fd + normal * 0.35).normalized() * ln * 0.5  # ponta levemente curvada, como garra
        parts.append(rod([k0, k1, k2], [sz * 0.24, sz * 0.2, sz * 0.06], 4))
    if not thumb:
        return parts
    th = (side * 1.0 + d * 0.4).normalized()
    t0 = p + d * sz * 0.4 + side * sz * 0.7
    parts.append(rod([t0, t0 + th * sz * 1.1, t0 + (th + d * 0.6).normalized() * sz * 1.9], [sz * 0.26, sz * 0.2, sz * 0.06], 4))
    return parts


def feather_arm(root, d, ln, r0, bend, spread, out, front=True):
    """Um braço-pena: braço → cotovelo dobrado → antebraço → mão aberta."""
    d = d.normalized()
    elbow = root + d * ln * 0.48
    d2 = (d + bend).normalized()
    wrist = elbow + d2 * ln * 0.46
    mid1 = root.lerp(elbow, 0.5) + bend * ln * -0.04
    mid2 = elbow.lerp(wrist, 0.45)
    out.append(rod([root, mid1, elbow, mid2, wrist], [r0, r0 * 1.08, r0 * 0.82, r0 * 0.86, r0 * 0.58], 6))
    if front:
        out.append(ellipsoid(tuple(elbow), (r0 * 0.9,) * 3, 5, 3))
    out.extend(open_hand(wrist, d2, r0 * 0.95, spread, 4 if front else 3, front))


def bez(a, b, c, t):
    return a * ((1 - t) ** 2) + b * (2 * (1 - t) * t) + c * (t * t)


random.seed(66)
wings, bones = [], []
for s in (1, -1):
    X = Vector((s, 0, 0))
    # osso da asa: das costas (entre as escápulas) para trás, para fora e para cima, depois abre na horizontal
    r0 = Vector((s * 0.07 * H, 0.12 * H, top - 0.08 * H))
    j1 = r0 + Vector((s * 0.2 * H, 0.18 * H, 0.1 * H))   # "ombro" da asa
    j2 = j1 + Vector((s * 0.36 * H, 0.08 * H, 0.34 * H))   # "cotovelo": o ponto mais alto
    j3 = j2 + Vector((s * 0.42 * H, 0.03 * H, -0.06 * H))  # "punho": a ponta
    spine = [r0, j1, j1.lerp(j2, 0.5) + Vector((0, 0, 0.02 * H)), j2, j2.lerp(j3, 0.5) + Vector((0, 0, 0.03 * H)), j3]
    bones.append(rod(spine, [0.05 * H, 0.056 * H, 0.046 * H, 0.05 * H, 0.04 * H, 0.032 * H], 9))
    for j in (j1, j2):
        bones.append(ellipsoid(tuple(j), (0.062 * H,) * 3, 8, 6))  # juntas nodosas
    # garra/mão grande na ponta da asa
    tipd = (j3 - j2).normalized()
    wings.extend(open_hand(j3, tipd, 0.042 * H, Vector((0, 0, 1)).cross(tipd).cross(tipd) * -1))
    # espinho no "cotovelo" (como o polegar de uma asa de morcego)
    bones.append(cone(tuple(j2 + Vector((0, 0, 0.03 * H))), tuple(j2 + Vector((s * -0.04 * H, 0.03 * H, 0.2 * H))), 0.028 * H, 6))

    # pontos ao longo do osso para pendurar os braços-pena
    def along(u):
        if u < 0.5:
            return bez(j1, j1.lerp(j2, 0.5), j2, u * 2)
        return bez(j2, j2.lerp(j3, 0.5), j3, (u - 0.5) * 2)

    for row, (N, scale, dy, u0, u1) in enumerate(((15, 1.12, 0.0, 0.0, 1.0), (10, 0.72, -0.035, 0.04, 0.9), (6, 0.45, -0.065, 0.1, 0.8))):
        for i in range(N):
            u = u0 + (u1 - u0) * i / (N - 1)
            p = along(u) + Vector((0, dy * H, 0))
            # leque: perto das costas aponta para baixo, na ponta aponta para fora (levemente para cima)
            ang = (0.12 + u * 1.55) + (random.random() - 0.5) * 0.12  # 0 = para baixo, pi/2 = para fora
            d = Vector((s * math.sin(ang), 0.12 + random.random() * 0.08, -math.cos(ang)))
            ln = (0.3 + 0.26 * math.sin(min(1.0, u * 1.25) * math.pi * 0.85)) * H * scale * (0.92 + random.random() * 0.16)
            bend = Vector((s * -0.25, 0.05, -0.25)) * (0.8 + random.random() * 0.4)  # o antebraço cai um pouco
            spread = Vector((0, 1, 0)).cross(d)  # dedos abrem no plano da asa
            feather_arm(p, d, ln, (0.021, 0.018, 0.015)[row] * H * (1.1 - 0.3 * u), bend, spread, wings, row == 0)
b.add('wing_bones', merge(*bones), material('wing_bone', '#7a0c12', 0.6), region='chest', subdiv=0)
b.add('arm_wings', merge(*wings), wing, region='chest', subdiv=0)

# ---------------- tanga vermelha rasgada na cintura
loin = [tube([(0, 0.0, hz + 0.06 * H, 0.17 * H, 0.125 * H), (0, 0.0, hz - 0.1 * H, 0.19 * H, 0.14 * H)], 20, cap_start=False, cap_end=False)]
random.seed(9)
for i in range(16):
    a = i / 16 * TAU
    p0 = Vector((math.sin(a) * 0.19 * H, -math.cos(a) * 0.14 * H, hz - 0.1 * H))
    loin.append(cone(tuple(p0), tuple(p0 + Vector((math.sin(a) * 0.01, -math.cos(a) * 0.01, -(0.06 + random.random() * 0.1) * H))), 0.035, 4))
b.add('loincloth', merge(*loin), red_dk, region='skirt', subdiv=0)
# espinhos da Armadura de Sangue saindo do ombro esquerdo
random.seed(4)
spikes = []
sL = sk['sL']
for k in range(10):
    a = random.random() * TAU
    base = sL + Vector((math.sin(a) * 0.04 * H, math.cos(a) * 0.04 * H, (0.02 + random.random() * 0.04) * H))
    tip = base + Vector(((0.07 + random.random() * 0.08) * H, (random.random() - 0.5) * 0.1 * H, (0.07 + random.random() * 0.12) * H))
    spikes.append(cone(tuple(base), tuple(tip), 0.02 * H, 5))
b.add('shoulder_spikes', merge(*spikes), spike, region='sL', subdiv=0)
# correntes do Juan cruzando o torso
links = []
for z0, tilt in ((hz + 0.42 * H, 0.08), (hz + 0.3 * H, -0.06)):
    for i in range(28):
        a = i / 28 * TAU
        links.append(ellipsoid((math.sin(a) * 0.22 * H, -math.cos(a) * 0.15 * H, z0 + math.sin(a) * tilt * H), (0.012 * H, 0.012 * H, 0.008 * H), 5, 3))
b.add('chains', merge(*links), chainm, region='torso', subdiv=0)
# garras compridas nas mãos
for side in ('L', 'R'):
    h = sk['hand' + side]
    cl = [cone((h.x + (i - 1.5) * 0.015 * H, h.y - 0.015 * H, h.z - 0.055 * H), (h.x + (i - 1.5) * 0.018 * H, h.y - 0.04 * H, h.z - 0.15 * H), 0.009 * H, 4) for i in range(4)]
    b.add('claws' + side, merge(*cl), claw, region='hand' + side, subdiv=0)


# ---------------- QUATRO BRAÇOS: o par de baixo sai das COSTELAS e fica aberto para os lados, garras à mostra
def extra_arm_weights(side):
    e = sk['e' + side]

    def fn(p):
        w_fore = smoothstep(e.z + 0.02 * H, e.z - 0.1 * H, p.z)
        return {'e' + side: w_fore, 's' + side: 1 - w_fore}
    return fn


for side in ('L', 'R'):
    sx = 1 if side == 'L' else -1
    root = Vector((sx * 0.17 * H, 0.0, hz + 0.3 * H))
    elbow = Vector((root.x + sx * 0.25 * H, 0.02 * H, root.z - 0.06 * H))
    wrist = Vector((elbow.x + sx * 0.08 * H, -0.16 * H, elbow.z - 0.12 * H))
    arm = merge(tube(limb_rings(root, elbow, 0.055 * H, 0.045 * H, n=4), 12), ellipsoid(tuple(elbow), (0.046 * H, 0.046 * H, 0.046 * H), 10, 8),
                tube(limb_rings(elbow, wrist, 0.045 * H, 0.036 * H, n=4), 12))
    b.add('extra_arm' + side, arm, skin, region='extra', weight_fn=extra_arm_weights(side), subdiv=0)
    d = (wrist - elbow).normalized()
    hand = [ellipsoid(tuple(wrist + d * 0.035 * H), (0.04 * H, 0.03 * H, 0.04 * H), 8, 6)]
    for i in range(4):
        o = Vector(((i - 1.5) * 0.016 * H, 0, (i - 1.5) * 0.006 * H))
        bse = wrist + d * 0.06 * H + o
        hand.append(cone(tuple(bse), tuple(bse + d * 0.11 * H + Vector((0, 0, -0.03 * H))), 0.009 * H, 4))
    b.add('extra_hand' + side, merge(*hand), claw, region='extra', weight_fn=lambda p, side=side: {'e' + side: 1.0}, subdiv=0)

# ---------------- pernas de BODE: coxa grossa de pelo, jarrete dobrado para trás, canela fina, casco fendido;
# boca dentada no meio da tíbia
for side in ('L', 'R'):
    l, k, f = sk['l' + side], sk['k' + side], sk['foot' + side]
    b.add('goat_thigh' + side, tube(limb_rings(l + Vector((0, 0, 0.02 * H)), l.lerp(k, 0.92), 0.11 * H, 0.075 * H, n=4), 14), M['legs'], region='leg' + side)
    hock = k.lerp(f, 0.55) + Vector((0, 0.07 * H, 0))
    b.add('goat_hock' + side, merge(tube(limb_rings(k, hock, 0.06 * H, 0.045 * H, n=3), 12), ellipsoid(tuple(hock), (0.045 * H, 0.05 * H, 0.045 * H), 10, 8),
                                    tube(limb_rings(hock, f + Vector((0, -0.02 * H, 0.03 * H)), 0.042 * H, 0.034 * H, n=3), 12)), M['legs'], region='k' + side, subdiv=0)
    b.add('hoof' + side, merge(box((f.x - 0.018 * H, f.y - 0.04 * H, f.z - 0.005 * H), (0.034 * H, 0.08 * H, 0.05 * H), bevel=0.008 * H),
                               box((f.x + 0.018 * H, f.y - 0.04 * H, f.z - 0.005 * H), (0.034 * H, 0.08 * H, 0.05 * H), bevel=0.008 * H)), M['feet'], region='foot' + side, subdiv=0)
    mo = k.lerp(hock, 0.55) + Vector((0, -0.05 * H, 0))
    teeth = [cone((mo.x + (i - 2) * 0.011 * H, mo.y - 0.004 * H, mo.z + 0.012 * H), (mo.x + (i - 2) * 0.011 * H, mo.y - 0.008 * H, mo.z - 0.003 * H), 0.004 * H, 3) for i in range(5)]
    teeth += [cone((mo.x + (i - 2) * 0.011 * H, mo.y - 0.004 * H, mo.z - 0.016 * H), (mo.x + (i - 2) * 0.011 * H, mo.y - 0.008 * H, mo.z - 0.002 * H), 0.004 * H, 3) for i in range(5)]
    b.add('shin_mouth' + side, merge(ellipsoid(tuple(mo), (0.03 * H, 0.012 * H, 0.022 * H), 8, 4), *teeth), claw, region='k' + side, subdiv=0)

b.export(OUT)
