# Modelos prontos (fora do git)

Os cenários (`tools/blender/arena_*.py`) usam peças PRONTAS e gratuitas dos kits do **Kenney** (licença
**CC0**: domínio público, uso comercial livre, sem atribuição obrigatória). Os zips ficam aqui em
`assets_src/kenney/` e **não vão para o git** — só o `.glb` final de cada cenário (em `public/arenas/`).

Para gerar os cenários numa máquina nova, baixe e extraia cada zip numa pasta com o mesmo nome do zip:

| Kit | Uso | Link |
|---|---|---|
| Fantasy Town Kit 2.0 | casas medievais, sebes, fonte, carroça, barracas, lampiões | https://kenney.nl/assets/fantasy-town-kit |
| Nature Kit | árvores, troncos, pedras, cogumelos, flores | https://kenney.nl/assets/nature-kit |
| Graveyard Kit 5.0 | lápides, criptas, cercas, lanternas | https://kenney.nl/assets/graveyard-kit |
| Castle Kit | muralhas, torres, portões de pedra | https://kenney.nl/assets/castle-kit |
| Furniture Kit | móveis de interior | https://kenney.nl/assets/furniture-kit |
| City Kit (Suburban) | casas e prédios modernos | https://kenney.nl/assets/city-kit-suburban |
| City Kit (Roads) | ruas, calçadas, postes | https://kenney.nl/assets/city-kit-roads |

Estrutura esperada (ver `tools/blender/kenney.py`, dicionário `KITS`):

```
assets_src/kenney/kenney_fantasy-town-kit_2.0/Models/GLB format/*.glb
assets_src/kenney/kenney_nature-kit/Models/GLTF format/*.glb
...
```

Depois: `node tools/blender/build.mjs santo_berco` (ou outro id de cenário).
