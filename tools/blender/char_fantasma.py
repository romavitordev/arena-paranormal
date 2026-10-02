"""
A FANTASMA (Kemi com as faixas, Hexatombe) — public/models/fantasma.glb. Corpo em kemi_common.py (ghost=True):
rosto todo enfaixado, sobretudo de couro longo de gola alta, faixas na canela e penduradas.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from kemi_common import build

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'fantasma.glb'
build(True, OUT)
