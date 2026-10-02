"""
KEMI (Hexatombe) — public/models/kemi.glb. O corpo e as roupas estão em kemi_common.py (compartilhado com a Fantasma).
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from kemi_common import build

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'kemi.glb'
build(False, OUT)
