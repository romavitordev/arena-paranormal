"""Importa efeitos sonoros dos pacotes CC0 baixados em assets_src/ (não vão para o git) para public/sounds/.

Cada som do jogo (nome usado em AudioManager / sound / hitSound nos kits) recebe 1 ou mais variações; no jogo uma é
sorteada a cada toque, com um pouco de variação de tom. Som sem arquivo continua sintetizado (AudioManager.SYNTHS).

Pacotes (créditos e links em assets_src/README.md):
  assets_src/oga/   OpenGameArt — golpes de verdade: "37 hits/punches" (Independent.nu), "Punch" (qubodup),
                    "20 Sword Sound Effects" (StarNinjas), "swishes sound pack" (artisticdude); tiros: "The Free
                    Firearm Sound Library"; carne: "8 wet squish, slurp impacts"; "Teleport Spell", "Heartbeat",
                    "Jump Landing Sound", "Ghost Monster Voice Moaning & Growling"
  assets_src/kenney/ Kenney — explosões, metal, menus (os golpes do Kenney soavam como pancada em saco: trocados)

Todos os arquivos perdem o silêncio do começo (no pacote de golpes chegava a 270 ms: o som saía atrasado) e são
normalizados no mesmo volume de pico. "mix" monta um som juntando camadas (ex.: espada acertando = aço + corpo).

Uso:  python tools/import-sounds.py      (precisa do ffmpeg no PATH)
Gera: public/sounds/<nome>_<n>.ogg (mono, 64 kbps) e src/audio/soundFiles.js (a lista que o jogo carrega).
"""
import glob
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'assets_src')
OUT = os.path.join(ROOT, 'public', 'sounds')
LIST = os.path.join(ROOT, 'src', 'audio', 'soundFiles.js')

HITS = 'oga/hits/hits/hit{:02d}.mp3.flac'
PUNCH = 'oga/qubodup_punch/qubodupPunch/qubodupPunch{:02d}.flac'
SWORD = 'oga/sword_attack/sword - StarNinjas/sword.{}.ogg'
CLASH = 'oga/sword_clash/sword_clash.{}.ogg'
SWISH = 'oga/swishes/swishes/swish-{}.wav'
GUN = 'oga/guns/Prepared SFX Library/{}'
SQUISH = 'oga/squish/impsplat/impactsplat{:02d}.mp3.flac'
GHOST = 'oga/ghost/qubodup-GhostMoans/wav/qubodup-GhostMoan{:02d}.wav'
TELEPORT = 'oga/teleport/teleport.wav'
HEART = 'oga/heartbeat/heartbeat.mp3_.flac'
LAND = 'oga/jumpland/jumpland.wav'
MAGIC = 'oga/magic/magical_{}.ogg'
SPELL = 'oga/spells/{}.ogg'
LAUGH = 'oga/laugh/qubodupevillaughter.flac'
APPLAUSE = 'oga/applause/2480.mp3'
K_IMPACT = 'kenney/kenney_impact-sounds/Audio/{}.ogg'
K_RPG = 'kenney/kenney_rpg-audio/Audio/{}.ogg'
K_SCIFI = 'kenney/kenney_sci-fi-sounds/Audio/{}.ogg'
K_UI = 'kenney/kenney_interface-sounds/Audio/{}.ogg'


def many(tpl, ids, **opts):
    return [(tpl.format(i), opts) for i in ids]


def shots(file, times, **opts):
    """cada arquivo da biblioteca de armas tem 2–4 disparos: um por variação (at = início do disparo, em s)"""
    return [(GUN.format(file), {**opts, 'at': max(0, t - 0.02)}) for t in times]


def mix(*layers, **opts):
    """layers: (arquivo, ganho em dB, atraso em ms[, início no arquivo em s])"""
    return [('mix', {'layers': layers, **opts})]


# nome no jogo → lista de (arquivo, opções). opções: max = segundos (corta com fade), gain = dB, pitch = fator
MAP = {
    # socos: ataque instantâneo e corpo grave (qubodup + os mais secos do pacote de golpes)
    'punch': many(PUNCH, range(1, 6), max=0.28) + many(HITS, [10, 15, 28], max=0.26),
    # socos fortes: os golpes com mais grave (80–86%)
    # (21 e 24 ficaram de fora: o pico chega 90–110 ms depois — o soco soaria atrasado)
    'heavyPunch': many(HITS, [2, 22, 27, 29], max=0.38) + many(PUNCH, [2, 3], max=0.36, pitch=0.82),
    'kick': many(HITS, [25, 26, 30, 32, 34], max=0.3),
    'impact': many(HITS, [11, 12, 13, 17, 23], max=0.3, gain=-2),
    # espada acertando o corpo: o "shing" do aço + o golpe no corpo, juntos
    # (só as espadas 6 e 8: as outras deslizam devagar e o pico chegava 130–150 ms depois)
    'bladeHit': (mix((SWORD.format(6), -5, 0), (HITS.format(14), 0, 0), max=0.32)
                 + mix((SWORD.format(8), -5, 0), (HITS.format(17), 0, 0), max=0.32)
                 + mix((SWORD.format(6), -5, 0), (HITS.format(23), 0, 0), max=0.32, pitch=0.92)
                 + mix((SWORD.format(8), -5, 0), (HITS.format(15), 0, 0), max=0.32, pitch=1.06)),
    'slashFinal': (mix((SWORD.format(1), -2, 0), (HITS.format(22), 0, 20), max=0.7)
                   + mix((SWORD.format(10), -2, 0), (HITS.format(21), 0, 20), max=0.7)),
    'axeHit': (mix((K_RPG.format('chop'), -2, 0), (HITS.format(22), 0, 0), max=0.4)
               + mix((K_RPG.format('chop'), -2, 0), (HITS.format(29), 0, 0), max=0.4)),
    # golpe no ar: whoosh (os mais encorpados para socos/chutes, os mais finos para lâminas)
    'swing': many(SWISH, [1, 2, 3, 5, 6, 7, 8], gain=-3),
    'blade': many(SWISH, [4, 9, 10, 11, 12, 13], gain=-2),
    # defesa: choque de aço curto
    'blockHit': many(CLASH, [2, 4, 5, 7, 8], max=0.25, gain=-3),
    'guardBreak': many(K_IMPACT, [f'impactMetal_heavy_00{i}' for i in range(5)], gain=2),
    'perfectBlock': many(CLASH, [1, 3, 10], max=0.45),
    # TIROS ("The Free Firearm Sound Library"): cada disparo alto vira uma variação
    'm4': shots('AR-15/D_32P.wav', [0.70, 5.66], max=0.4) + shots('AR-15/D_24P.wav', [0.55, 3.92], max=0.4),
    # (as gravações "near" da Nova, CD, 2º tiro da Mossberg e da Savage (fina demais para sniper) eram só o estalo — 20–70 ms acima de −30 dB,
    # soariam como clique: usadas as de distância média, com o corpo do disparo)
    'shotgun': (shots('Model 12/K_22P.wav', [0.84, 7.46], max=0.8) + shots('Model 12/K_17P.wav', [0.91, 7.07], max=0.8)
                + shots('Nova/O_17P.wav', [0.69, 3.71], max=0.8) + shots('Mossberg/N_26P.wav', [0.79, 4.58], max=0.8)),
    'sniper': (shots('Tikka/W_29P.wav', [0.58, 5.67], max=1.2) + shots('Tikka/W_24P.wav', [0.76, 5.38], max=1.2)
               + shots('Arisaka/E_25P.wav', [0.52, 4.04], max=1.2) + shots('1917/B_24P.wav', [1.31, 6.75], max=1.2)),
    # garras e carne
    'clawHit': (mix((SQUISH.format(6), -3, 0), (HITS.format(17), 0, 0), max=0.4)
                + mix((SQUISH.format(3), -3, 0), (HITS.format(23), 0, 0), max=0.4)),
    'bloodClaw': many(SQUISH, [6, 3], max=0.5),
    'descarnar': many(SQUISH, [2, 5], max=0.8),
    # correntes e chicote
    'chainThrow': (mix((SWISH.format(4), 0, 0), (K_RPG.format('handleCoins'), -4, 30), max=0.45)
                   + mix((SWISH.format(9), 0, 0), (K_RPG.format('handleCoins2'), -4, 30), max=0.45)),
    'chainPull': (mix((K_RPG.format('handleCoins2'), 0, 0), (K_RPG.format('metalLatch'), -3, 120), max=0.5)
                  + mix((K_RPG.format('handleCoins'), 0, 0), (K_RPG.format('metalLatch'), -3, 120), max=0.5)),
    'whip': (mix((SWISH.format(12), 0, 0), (HITS.format(14), -2, 60), max=0.35)
             + mix((SWISH.format(13), 0, 0), (HITS.format(10), -2, 60), max=0.35)),
    # paranormal e corpo
    'teleport': [(TELEPORT, {'max': 0.9})],
    'blink': [(TELEPORT, {'max': 0.4, 'pitch': 1.25})],
    'fearGaze': many(GHOST, [5, 1], max=1.6, gain=-4),
    'heartbeat': [(HEART, {'max': 1.0})],
    'land': [(LAND, {})],
    'jump': many(SWISH, [8, 3], gain=-8, pitch=0.8),
    'ko': (mix((HITS.format(22), 0, 0), (K_SCIFI.format('lowFrequency_explosion_000'), -6, 0), max=1.0)
           + mix((HITS.format(2), 0, 0), (K_SCIFI.format('lowFrequency_explosion_001'), -6, 0), max=1.0)),
    # PARANORMAL ("Magic Spell SFX", "Spell sounds", Kenney Sci-Fi): rituais, carga, especial, dreno, renascer…
    'ritual': many(MAGIC, [1, 4], max=1.3),
    'carga': many(MAGIC, [3, 5, 6], max=0.6, gain=-3),
    'armed': [(SPELL.format('electricspell2'), {'at': 9.08, 'max': 0.9})],
    'specialStart': (mix((MAGIC.format(4), 0, 0), (K_SCIFI.format('forceField_002'), -4, 0), max=1.2)
                     + mix((MAGIC.format(1), 0, 0), (K_SCIFI.format('forceField_000'), -4, 0), max=1.2)),
    'powerUp': many(K_SCIFI, ['forceField_000', 'forceField_001', 'forceField_003'], max=0.9),
    'drain': ([(SPELL.format('healing'), {'at': 11.5, 'max': 0.7, 'pitch': 0.75})]
              + many(K_SCIFI, ['forceField_004'], max=0.6, pitch=0.7)),
    'rebirth': mix((SPELL.format('healing'), 0, 0, 11.5), (MAGIC.format(7), -4, 200), max=1.8),
    'fearBlade': (mix((SWISH.format(10), 0, 0), (MAGIC.format(2), -4, 0), max=0.6)
                  + mix((SWISH.format(11), 0, 0), (MAGIC.format(5), -4, 0), max=0.6)),
    'maskOn': mix((MAGIC.format(6), 0, 0), (GHOST.format(5), -6, 0), max=0.9),
    'smoke': many(K_SCIFI, ['thrusterFire_000', 'thrusterFire_001', 'thrusterFire_002'], max=0.6, gain=-6),
    'banner': (mix((SWISH.format(4), 0, 0), (MAGIC.format(5), -6, 0), max=0.7)
               + mix((SWISH.format(9), 0, 0), (MAGIC.format(3), -6, 0), max=0.7)),
    'laugh': [(LAUGH, {'max': 2.2, 'gain': -3})],
    'applause': [(APPLAUSE, {'max': 3.0, 'gain': -6})],
    # zumbido da Carga de Poder (startLoop): toca em loop, sem corte
    'chargeHum': many(K_SCIFI, ['spaceEngineLow_000'], gain=-4),
    # armas brancas e travas
    'knifeThrow': many(K_RPG, ['drawKnife1', 'drawKnife2', 'drawKnife3']),
    'trapSnap': many(K_RPG, ['metalLatch']),
    'grenadePin': many(K_RPG, ['metalClick']),
    'reload': many(K_RPG, ['metalClick']),
    # explosões
    'explosion': many(K_SCIFI, [f'explosionCrunch_00{i}' for i in range(5)], gain=2)
                 + many(K_SCIFI, ['lowFrequency_explosion_000', 'lowFrequency_explosion_001'], max=1.4),
    'shockwave': many(K_SCIFI, ['lowFrequency_explosion_000', 'lowFrequency_explosion_001'], max=1.0),
    # menus
    'select': many(K_UI, [f'select_00{i}' for i in range(1, 5)], gain=-4),
    'confirm': many(K_UI, ['confirmation_001', 'confirmation_002'], gain=-3),
    'denied': many(K_UI, [f'error_00{i}' for i in range(1, 5)], gain=-3),
    'tick': many(K_UI, ['tick_001', 'tick_002']),
    'button': many(K_UI, [f'click_00{i}' for i in range(1, 4)]),
}

TRIM = 'silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.005'


def peak_db(path):
    r = subprocess.run(['ffmpeg', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True)
    m = re.search(r'max_volume: ([-0-9.]+) dB', r.stderr)
    return float(m.group(1)) if m else 0.0


def tail(opts):
    af = []
    if 'pitch' in opts:
        af.append(f"asetrate=44100*{opts['pitch']},aresample=44100")
    if 'max' in opts:
        d = opts['max']
        af.append(f'atrim=0:{d},afade=t=out:st={max(0, d - 0.12)}:d=0.12')
    return af


def convert(src, dst, opts):
    tmp = dst + '.wav'
    if src == 'mix':
        layers = opts['layers']
        cmd = ['ffmpeg', '-v', 'error', '-y']
        for f, *_ in layers:
            cmd += ['-i', os.path.join(ASSETS, f)]
        parts = []
        for i, layer in enumerate(layers):
            _, gain, delay = layer[:3]
            at = f'atrim=start={layer[3]},asetpts=PTS-STARTPTS,' if len(layer) > 3 else ''
            parts.append(f'[{i}]aformat=channel_layouts=mono,aresample=44100,{at}{TRIM},volume={gain}dB,adelay={delay}[l{i}]')
        ins = ''.join(f'[l{i}]' for i in range(len(layers)))
        chain = ','.join(['amix=inputs=%d:duration=longest:normalize=0' % len(layers)] + tail(opts))
        cmd += ['-filter_complex', ';'.join(parts) + f';{ins}{chain}', tmp]
    else:
        start = [f"atrim=start={opts['at']}", 'asetpts=PTS-STARTPTS'] if 'at' in opts else []
        cmd = ['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(ASSETS, src), '-ac', '1', '-ar', '44100',
               '-af', ','.join(start + [TRIM] + tail(opts)), tmp]
    subprocess.run(cmd, check=True)
    # mesmo volume de pico (−1 dB) para todos; depois o ganho próprio do som
    gain = -1 - peak_db(tmp) + opts.get('gain', 0)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.95',
                    '-c:a', 'libvorbis', '-b:a', '64k', dst], check=True)
    os.remove(tmp)


def main():
    os.makedirs(OUT, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, '*.ogg')):
        os.remove(f)
    lines = []
    for name, sources in MAP.items():
        files = []
        for src, opts in sources:
            if src != 'mix' and not os.path.exists(os.path.join(ASSETS, src)):
                print(f'aviso: falta {src}')
                continue
            dst = f'{name}_{len(files)}.ogg'
            convert(src, os.path.join(OUT, dst), opts)
            files.append(f'sounds/{dst}')
        if not files:
            print(f'aviso: nenhum arquivo para {name}')
            continue
        lines.append(f"  {name}: [{', '.join(repr(x) for x in files)}],")
        print(f'{name}: {len(files)}')
    header = ('// GERADO por tools/import-sounds.py — não editar à mão.\n'
              '// Efeitos sonoros CC0 (OpenGameArt: Independent.nu, qubodup, StarNinjas, artisticdude; Kenney). Cada nome\n'
              '// tem variações; o AudioManager sorteia uma. Nomes fora daqui continuam sintetizados.\n')
    with open(LIST, 'w', encoding='utf8', newline='\n') as fh:
        fh.write(header + 'export const SOUND_FILES = {\n' + '\n'.join(lines) + '\n};\n')
    total = sum(os.path.getsize(f) for f in glob.glob(os.path.join(OUT, '*.ogg')))
    print(f'total: {total / 1024:.0f} KB')


if __name__ == '__main__':
    if not os.path.isdir(os.path.join(ASSETS, 'oga')):
        sys.exit('Pacotes não encontrados em assets_src/oga e assets_src/kenney (ver assets_src/README.md).')
    main()
