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


# ---------------- chifres grossos: par de cima (sobe e abre) e par em FOICE (sai para o lado e cai para frente)
horns = []
for s in (1, -1):
    horns.append(curve_tube(Vector((s * 0.075 * H, hc.y - 0.03 * H, hc.z + 0.11 * H)), Vector((s * 0.3, 0.15, 1)).normalized(), Vector((s * 0.55, 0.5, 0.15)), 0.36 * H, 0.048 * H, n=12))
    horns.append(curve_tube(Vector((s * 0.12 * H, hc.y + 0.01 * H, hc.z + 0.05 * H)), Vector((s * 1, 0.35, 0.35)).normalized(), Vector((s * 0.1, -0.55, -1.2)), 0.34 * H, 0.042 * H, n=12))
b.add('horns', merge(*horns), horn, region='head', subdiv=0)

# ---------------- COROA DE ESPINHOS: halo dourado atrás da cabeça, espinhos para fora e alguns trançados no anel
cc = Vector((hc.x, hc.y + 0.17 * H, hc.z + 0.06 * H))
R = 0.25 * H
crown = []
ring = []
for i in range(41):
    a = i / 40 * TAU
    ring.append((cc.x + math.cos(a) * R, cc.y, cc.z + math.sin(a) * R, 0.014 * H, 0.014 * H))
crown.append(tube(ring, 8, cap_start=False, cap_end=False))
random.seed(11)
for i in range(22):
    a = i / 22 * TAU + random.uniform(-0.05, 0.05)
    base = Vector((cc.x + math.cos(a) * R, cc.y, cc.z + math.sin(a) * R))
    out = Vector((math.cos(a), random.uniform(-0.25, 0.1), math.sin(a))).normalized()
    ln = (0.1 + (i % 2) * 0.08 + random.uniform(0, 0.04)) * H
    crown.append(cone(tuple(base), tuple(base + out * ln), 0.016 * H, 5))
for i in range(16):
    a = i / 16 * TAU + 0.2
    base = Vector((cc.x + math.cos(a) * R, cc.y, cc.z + math.sin(a) * R))
    crown.append(cone(tuple(base), tuple(base + Vector((math.cos(a + 1.4) * 0.05 * H, -0.04 * H, math.sin(a + 1.4) * 0.05 * H))), 0.008 * H, 4))
b.add('crown', merge(*crown), gold, region='head', subdiv=0)


# ---------------- ASAS DE BRAÇOS: das costas saem braços vermelhos que se ramificam e terminam em mãos abertas
def open_hand(p, d, sz):
    d = d.normalized()
    side = d.cross(Vector((0, 1, 0)))
    if side.length < 0.1:
        side = Vector((1, 0, 0))
    side.normalize()
    parts = [ellipsoid(tuple(p), (sz, sz * 0.6, sz), 8, 6)]
    for f in range(5):
        fd = (d + side * ((f - 2) * 0.32)).normalized()
        parts.append(cone(tuple(p + fd * sz * 0.6), tuple(p + fd * sz * 2.4), sz * 0.28, 4))
    return parts


def branch(start, d, ln, r0, depth, out):
    d = d.normalized()
    end = start + d * ln
    mid = start.lerp(end, 0.5) + Vector((0, 0.02 * H, 0.03 * H))
    out.append(tube([(start.x, start.y, start.z, r0, r0), (mid.x, mid.y, mid.z, r0 * 0.8, r0 * 0.8), (end.x, end.y, end.z, r0 * 0.6, r0 * 0.6)], 7))
    if depth == 0:
        out.extend(open_hand(end, d, r0 * 1.5))
        return
    out.append(ellipsoid(tuple(end), (r0 * 0.75, r0 * 0.75, r0 * 0.75), 6, 4))  # "cotovelo"
    sx = 1 if d.x >= 0 else -1
    for turn in (-0.45, 0.4):
        nd = Vector((d.x * math.cos(turn) - d.z * math.sin(turn) * sx, d.y + 0.15, d.z * math.cos(turn) + abs(d.x) * math.sin(turn)))
        branch(end, nd, ln * 0.72, r0 * 0.7, depth - 1, out)


wings = []
for s in (1, -1):
    for k, (ang, ln) in enumerate(((0.35, 0.36), (0.75, 0.42), (1.15, 0.38), (1.5, 0.3))):
        root = Vector((s * (0.06 + k * 0.02) * H, 0.13 * H, top - (0.02 + k * 0.05) * H))
        d = Vector((s * math.sin(ang), 0.45, math.cos(ang)))
        branch(root, d, ln * H, 0.032 * H, 1 if k < 3 else 0, wings)
b.add('arm_wings', merge(*wings), wing, region='chest', subdiv=0)

# ---------------- capuz do Juan (rasgado, aberto no rosto) e manto curto nos ombros
b.add('hood', ellipsoid((hc.x, hc.y + 0.03 * H, hc.z + 0.02 * H), (0.17 * H, 0.17 * H, 0.18 * H), 16, 10, theta_max=math.pi * 0.62, phi=(0.15, 0.85)), red, region='head', subdiv=0)
b.add('cape', tube([(0, 0.035 * H, top + 0.02 * H, 0.21 * H, 0.15 * H), (0, 0.05 * H, top - 0.2 * H, 0.27 * H, 0.18 * H), (0, 0.06 * H, hz + 0.05 * H, 0.28 * H, 0.19 * H)], 20, cap_start=False, cap_end=False), red_dk, region='chest')
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
