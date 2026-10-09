"""Importa efeitos sonoros dos pacotes CC0 baixados em assets_src/kenney/ (não vão para o git) para public/sounds/.

Cada som do jogo (nome usado em AudioManager / sound / hitSound nos kits) recebe 1 ou mais variações; no jogo uma é
sorteada a cada toque, com um pouco de variação de tom. Som sem arquivo continua sintetizado (AudioManager.SYNTHS).

Uso:  python tools/import-sounds.py      (precisa do ffmpeg no PATH)
Gera: public/sounds/<nome>_<n>.ogg (mono, 64 kbps) e src/audio/soundFiles.js (a lista que o jogo carrega).
"""
import glob
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets_src', 'kenney')
OUT = os.path.join(ROOT, 'public', 'sounds')
LIST = os.path.join(ROOT, 'src', 'audio', 'soundFiles.js')

IMPACT = 'kenney_impact-sounds'
RPG = 'kenney_rpg-audio'
SCIFI = 'kenney_sci-fi-sounds'
UI = 'kenney_interface-sounds'

# nome no jogo → (pacote, padrão de arquivo, opções). opções: max = segundos (corta com fade), gain = dB
MAP = {
    # socos e chutes
    'punch': [(IMPACT, 'impactPunch_medium_*.ogg', {})],
    'heavyPunch': [(IMPACT, 'impactPunch_heavy_*.ogg', {})],
    'kick': [(IMPACT, 'impactSoft_heavy_*.ogg', {'max': 0.4})],
    'impact': [(IMPACT, 'impactPunch_heavy_*.ogg', {'gain': -2})],
    # lâminas, machados, armas brancas
    'bladeHit': [(RPG, 'knifeSlice.ogg', {}), (RPG, 'knifeSlice2.ogg', {}), (RPG, 'chop.ogg', {})],
    'axeHit': [(RPG, 'chop.ogg', {}), (IMPACT, 'impactWood_heavy_*.ogg', {})],
    'knifeThrow': [(RPG, 'drawKnife*.ogg', {})],
    'trapSnap': [(RPG, 'metalLatch.ogg', {})],
    'grenadePin': [(RPG, 'metalClick.ogg', {})],
    'reload': [(RPG, 'metalClick.ogg', {})],
    # defesa
    'blockHit': [(IMPACT, 'impactMetal_medium_*.ogg', {})],
    'guardBreak': [(IMPACT, 'impactMetal_heavy_*.ogg', {'gain': 2})],
    'perfectBlock': [(IMPACT, 'impactBell_heavy_*.ogg', {'max': 0.8})],
    # explosões
    'explosion': [(SCIFI, 'explosionCrunch_*.ogg', {'gain': 2}), (SCIFI, 'lowFrequency_explosion_*.ogg', {'max': 1.4})],
    'shockwave': [(SCIFI, 'lowFrequency_explosion_*.ogg', {'max': 1.0})],
    # menus
    'select': [(UI, 'select_00[1-4].ogg', {'gain': -4})],
    'confirm': [(UI, 'confirmation_00[1-2].ogg', {'gain': -3})],
    'denied': [(UI, 'error_00[1-4].ogg', {'gain': -3})],
    'tick': [(UI, 'tick_00[1-2].ogg', {})],
    'button': [(UI, 'click_00[1-3].ogg', {})],
}


def convert(src, dst, opts):
    af = []
    if 'max' in opts:
        d = opts['max']
        af.append(f'atrim=0:{d},afade=t=out:st={max(0, d - 0.15)}:d=0.15')
    if 'gain' in opts:
        af.append(f"volume={opts['gain']}dB")
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-c:a', 'libvorbis', '-b:a', '64k']
    if af:
        cmd += ['-af', ','.join(af)]
    subprocess.run(cmd + [dst], check=True)


def main():
    if not os.path.isdir(SRC):
        sys.exit(f'Pacotes não encontrados em {SRC} (ver assets_src/README.md).')
    os.makedirs(OUT, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, '*.ogg')):
        os.remove(f)
    lines = []
    for name, sources in MAP.items():
        files = []
        for pack, pattern, opts in sources:
            for src in sorted(glob.glob(os.path.join(SRC, pack, '**', pattern), recursive=True)):
                dst = f'{name}_{len(files)}.ogg'
                convert(src, os.path.join(OUT, dst), opts)
                files.append(f'sounds/{dst}')
        if not files:
            print(f'aviso: nenhum arquivo para {name}')
            continue
        lines.append(f"  {name}: [{', '.join(repr(x) for x in files)}],")
        print(f'{name}: {len(files)}')
    header = ('// GERADO por tools/import-sounds.py — não editar à mão.\n'
              '// Efeitos sonoros CC0 (Kenney: Impact Sounds, RPG Audio, Sci-Fi Sounds, Interface Sounds). Cada nome tem\n'
              '// variações; o AudioManager sorteia uma. Nomes fora daqui continuam sintetizados.\n')
    with open(LIST, 'w', encoding='utf8', newline='\n') as fh:
        fh.write(header + 'export const SOUND_FILES = {\n' + '\n'.join(lines) + '\n};\n')
    total = sum(os.path.getsize(f) for f in glob.glob(os.path.join(OUT, '*.ogg')))
    print(f'total: {total / 1024:.0f} KB')


if __name__ == '__main__':
    main()
