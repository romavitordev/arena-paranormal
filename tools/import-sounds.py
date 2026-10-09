"""Importa efeitos sonoros dos pacotes CC0 baixados em assets_src/ (não vão para o git) para public/sounds/.

Cada som do jogo (nome usado em AudioManager / sound / hitSound nos kits) recebe 1 ou mais variações; no jogo uma é
sorteada a cada toque, com um pouco de variação de tom. Som sem arquivo continua sintetizado (AudioManager.SYNTHS).

Pacotes (créditos e links em assets_src/README.md):
  assets_src/oga/   OpenGameArt — golpes de verdade: "37 hits/punches" (Independent.nu), "Punch" (qubodup),
                    "20 Sword Sound Effects" (StarNinjas) e "swishes sound pack" (artisticdude)
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
K_IMPACT = 'kenney/kenney_impact-sounds/Audio/{}.ogg'
K_RPG = 'kenney/kenney_rpg-audio/Audio/{}.ogg'
K_SCIFI = 'kenney/kenney_sci-fi-sounds/Audio/{}.ogg'
K_UI = 'kenney/kenney_interface-sounds/Audio/{}.ogg'


def many(tpl, ids, **opts):
    return [(tpl.format(i), opts) for i in ids]


def mix(*layers, **opts):
    """layers: (arquivo, ganho em dB, atraso em ms)"""
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
        for f, _, _ in layers:
            cmd += ['-i', os.path.join(ASSETS, f)]
        parts = []
        for i, (_, gain, delay) in enumerate(layers):
            parts.append(f'[{i}]aformat=channel_layouts=mono,aresample=44100,{TRIM},volume={gain}dB,adelay={delay}[l{i}]')
        ins = ''.join(f'[l{i}]' for i in range(len(layers)))
        chain = ','.join(['amix=inputs=%d:duration=longest:normalize=0' % len(layers)] + tail(opts))
        cmd += ['-filter_complex', ';'.join(parts) + f';{ins}{chain}', tmp]
    else:
        cmd = ['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(ASSETS, src), '-ac', '1', '-ar', '44100',
               '-af', ','.join([TRIM] + tail(opts)), tmp]
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
