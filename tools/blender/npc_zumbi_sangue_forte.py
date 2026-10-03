"""ZUMBI DE SANGUE FORTE — massa de músculo (ver npc_zumbi_lib.py)."""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from npc_zumbi_lib import build

build(strong=True)
