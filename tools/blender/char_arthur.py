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
beard = material('beard_gray', '#8e8780', 0.85)
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
# gola aberta da camisa
for s in (1, -1):
    b.add(f'collar{s}', xform(box((s * 0.05, -0.1, 1.6), (0.06, 0.06, 0.012)), lambda p, s=s: Vector((p.x, p.y, p.z + abs(p.x) * 0.3))), M['torso'], region='torso', subdiv=0)
# cinto e bolsos da calça
b.add('belt', tube([(0, 0, hz + 0.02, 0.178, 0.125), (0, 0, hz + 0.07, 0.18, 0.127)], 18), material('belt_abutre', '#241c16', 0.7), region='torso', subdiv=0)
for s in (1, -1):
    b.add(f'cargo{s}', box((s * 0.15, -0.02, hz - 0.3), (0.03, 0.1, 0.13)), M['legs'], region='leg' + ('L' if s > 0 else 'R'), subdiv=0)
# coturnos
for side in ('L', 'R'):
    k, f = sk['k' + side], sk['foot' + side]
    b.add('bootshaft' + side, tube(limb_rings(k.lerp(f, 0.62), f + Vector((0, 0, 0.06)), 0.06, 0.058, n=3), 12), M['feet'], region='k' + side)

# cabelo castanho penteado para trás com mecha grisalha e coque
b.add('hair_cap', hair_cap((hc.x, hc.y + 0.01, hc.z + 0.012), (0.146, 0.156, 0.168), front=0.3, side=0.42, back=0.62), hairm, region='head')
b.add('hair_back', ellipsoid((hc.x, hc.y + 0.045, hc.z - 0.02), (0.142, 0.12, 0.14), 16, 10, theta_max=math.pi * 0.72, phi=(0.62, 1.38)), hairm, region='head')
b.add('hair_streak', xform(box((-0.04, -0.02, hc.z + 0.16), (0.045, 0.3, 0.03)), lambda p: Vector((p.x, p.y, p.z - (p.y ** 2) * 2.2))), gray, region='head', subdiv=1)
b.add('bun', merge(ellipsoid((0, 0.06, hc.z + 0.19), (0.045, 0.045, 0.04), 10, 8), tube([(0, 0.06, hc.z + 0.15, 0.02, 0.02), (0, 0.06, hc.z + 0.17, 0.022, 0.022)], 8)), hairm, region='head')
# barba grisalha + bigode castanho
# barba: só o volume do queixo/mandíbula, colado ao rosto (o resto é pintado na textura)
beard_shell = ellipsoid((hc.x, hc.y - 0.002, hc.z), (0.143, 0.153, 0.168), 24, 16, phi=(0.17, 0.83))
def jaw(p):
    # sobe pelas laterais do rosto (costeleta) e fica abaixo da boca no meio
    zmax = hc.z - 0.105 + smoothstep(0.03, 0.11, abs(p.x)) * 0.075
    return Vector((p.x, p.y, min(p.z, zmax)))
b.add('beard', xform(beard_shell, jaw), beard, region='head')
b.add('goatee', ellipsoid((0, -0.118, hc.z - 0.168), (0.038, 0.026, 0.05), 12, 8), beard, region='head')
for s2 in (1, -1):
    b.add(f'mustache{s2}', tube([(s2 * 0.004, -0.152, hc.z - 0.066, 0.012, 0.01), (s2 * 0.03, -0.148, hc.z - 0.074, 0.013, 0.011), (s2 * 0.055, -0.135, hc.z - 0.095, 0.009, 0.008)], 8), stache, region='head', subdiv=0)
# brincos na orelha esquerda
for i in range(2):
    b.add(f'earring{i}', ellipsoid((0.142, 0.01 + i * 0.012, hc.z - 0.03 - i * 0.012), (0.006, 0.006, 0.006), 6, 4), metal, region='head', subdiv=0)

b.export(OUT)
