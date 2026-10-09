"""Copia texturas de efeitos (Kenney Particle Pack, CC0) de assets_src/kenney/ (fora do git) para public/fx/.

As texturas são brancas com transparência: o jogo pinta com a cor de cada efeito. Reduzidas para 128 px (leves).
Uso:  python tools/import-fx.py      (precisa do ffmpeg no PATH)
"""
import glob
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets_src', 'kenney', 'kenney_particle-pack', 'PNG (Transparent)')
OUT = os.path.join(ROOT, 'public', 'fx')

# nome no jogo → arquivo do pacote
FX = {
    'smoke': 'smoke_07.png',   # fumaça (todas as partículas de fumaça do jogo)
    'star': 'star_06.png',     # clarão de golpe (estrela de 4 pontas)
    'burst': 'scorch_01.png',  # estouro espinhoso (explosão)
    'fire': 'fire_01.png',     # bola de fogo (explosão)
    'spark': 'spark_02.png',   # faíscas elétricas (energia paranormal)
    'debris': 'dirt_01.png',   # pedrinhas e terra (golpe pesado no chão)
    'flare': 'flare_01.png',   # brilho com risco (bloqueio perfeito)
}


def main():
    if not os.path.isdir(SRC):
        sys.exit(f'Pacote não encontrado em {SRC} (ver assets_src/README.md).')
    os.makedirs(OUT, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, '*.png')):
        os.remove(f)
    for name, file in FX.items():
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(SRC, file), '-vf', 'scale=128:128:flags=lanczos,format=rgba',
                        os.path.join(OUT, f'{name}.png')], check=True)
        print(name, os.path.getsize(os.path.join(OUT, f'{name}.png')) // 1024, 'KB')


if __name__ == '__main__':
    main()
