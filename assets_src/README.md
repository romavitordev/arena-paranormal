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

## Sons e texturas de efeitos (CC0)

Efeitos sonoros e texturas de efeitos também vêm de pacotes CC0 do Kenney, extraídos aqui com o mesmo nome do zip:

| Pacote | Uso | Link |
|---|---|---|
| Impact Sounds | socos, chutes, impactos, bloqueios (metal), bloqueio perfeito (sino), machado (madeira) | https://kenney.nl/assets/impact-sounds |
| RPG Audio | lâmina cortando, machado, faca sacada, travas e cliques de metal | https://kenney.nl/assets/rpg-audio |
| Sci-Fi Sounds | explosões e ondas de choque | https://kenney.nl/assets/sci-fi-sounds |
| Interface Sounds | menus: escolher, confirmar, erro, tique, clique | https://kenney.nl/assets/interface-sounds |
| Particle Pack | texturas de fumaça, clarão, fogo, estouro, faísca elétrica, pedrinhas | https://kenney.nl/assets/particle-pack |

Os GOLPES (socos, chutes, espada, whoosh, bloqueio) vêm de pacotes CC0 do OpenGameArt — os do Kenney soavam como
pancada em saco e foram trocados. Extraídos em `assets_src/oga/<pasta>/`:

| Pasta | Pacote | Uso | Link |
|---|---|---|---|
| `hits` | 37 hits/punches (Independent.nu) | socos fortes, chutes, golpes no corpo | https://opengameart.org/content/37-hitspunches |
| `qubodup_punch` | Punch (qubodup) | socos | https://opengameart.org/content/punch |
| `sword_attack`, `sword_clash` | 20 Sword Sound Effects (StarNinjas — crédito apreciado) | aço da espada, bloqueio | https://opengameart.org/content/20-sword-sound-effects-attacks-and-clashes |
| `swishes` | swishes sound pack (artisticdude) | whoosh do golpe no ar | https://opengameart.org/content/swishes-sound-pack |
| `guns` | The Free Firearm Sound Library (194 MB) | tiros: M4 (AR-15), escopetas, sniper (bolt-action) | https://opengameart.org/content/the-free-firearm-sound-library |
| `squish` | 8 wet squish, slurp impacts (Independent.nu) | garras, carne, descarnar | https://opengameart.org/content/8-wet-squish-slurp-impacts |
| `teleport` | Teleport Spell | teleporte, piscar | https://opengameart.org/content/teleport-spell |
| `heartbeat` | Heartbeat (single sound) | batimento | https://opengameart.org/content/heartbeat-single-sound |
| `jumpland` | Jump Landing Sound | aterrissagem | https://opengameart.org/content/jump-landing-sound |
| `ghost` | Ghost Monster Voice Moaning & Growling (qubodup) | olhar do medo | https://opengameart.org/content/ghost-monster-voice-moaning-growling |

Depois: `python tools/import-sounds.py` (gera `public/sounds/*.ogg` e `src/audio/soundFiles.js`) e
`python tools/import-fx.py` (gera `public/fx/*.png`). Os dois precisam do `ffmpeg`. Nos scripts fica qual arquivo
vira qual som/efeito do jogo — para trocar um som, mude o mapa lá e rode de novo.
