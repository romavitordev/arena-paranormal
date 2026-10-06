"""
ARNALDO — public/models/arnaldo.glb (corpo em arnaldo_common.py; ver as referências lá e no TODO)
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from arnaldo_common import build

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'arnaldo.glb'
build('arnaldo', OUT)
