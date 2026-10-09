# Registro administrativo de alterações

## v3.14.0 — Acampamento Varminho

- Versão: `VERSION` 3.13.0 → **3.14.0** (Acampamento Varminho, sniper desviável, modelos antigos removidos).

- **Novo cenário: ACAMPAMENTO VARMINHO (Sinais do Outro Lado, ep. 2).** Pesquisa na wiki: o acampamento
  fica ao lado da Estação de Transmissão de Varminho (galpão queimado com o símbolo da emissora pichado, torre de
  treliça com antenas), gente esperando ser abduzida (Edimeia, Eriberto, Ludismila — que vive olhando as estrelas); a
  arte da recapitulação mostra a fogueira com toras de banco, o violão e as árvores em volta; a van dos Cinco é a
  "Chico Eletrônicos" (escura, grafite verde neon com alienígena de asas, parabólica e bagageiro, placa AR0051).
  `tools/blender/arena_acampamento.py` → `public/arenas/acampamento.glb`: fogueira com colisão, clareira de terra,
  toras, barracas coloridas viradas para o fogo com lampiões, cadeiras, mesa com rádio, 4 placas de papelão, prato de
  satélite caseiro de papel-alumínio, varal de lâmpadas, violão, telescópio e manta da Ludismila, a van feita à mão
  (com faróis e o grafite nas laterais), o galpão e a torre de 26 m com a luz vermelha, ~200 árvores escuras e pinheiros,
  grama e arbustos. Peças prontas do Nature Kit do Kenney (CC0, já baixado). Texturas novas em `arenaTextures.js`
  (`ground_camp`, `camp_dirt`, `van_side`, placas `sign_*` via `cardboard()`, `shed_metal`, `shed_door`,
  `station_tag`). `glbArena.js` ganhou `stars` (cúpula de estrelas), `fires` (fogueira animada com cones aditivos) e
  `particles` em lista (brasas na fogueira + vaga-lumes). Config `ACAMPAMENTO` (luar azul, luz da fogueira piscando,
  lâmpadas, faróis, luz verde na van, luz da torre), registrado em `ARENAS`/`ARENA_ORDER`. Testado: carrega sem erros,
  fogueira bloqueia (não dá para atravessar), limite em 19,5 m, luta com CPU.

- **Sniper do Arthur dava para desviar? Não dava — agora dá (usuário: "o tiro gruda").** Três causas: o laser ficava
  sempre colado no alvo, a mira cheia disparava sozinha na hora sem aviso e a bala a 170 m/s chegava praticamente no
  mesmo quadro. `startChargeShot` (Fighter): o ponto do laser persegue o alvo com atraso (`chargeShot.track`, 5 m/s —
  correndo de lado você sai da mira), o tiro vai para onde o LASER está (`r.aimAt` no `fireProjectile`), e com a mira
  cheia o laser trava e pisca vermelho por `lockWarn` (0,35 s) antes do disparo automático. Bala do Arthur 170 → 95 e
  da Kemi 170 → 100 (a Kemi e a Fantasma usam o mesmo tiro carregado e ganham o mesmo comportamento). Testado (alvo a
  12 m): parado leva 160 (a 25 m também); correndo de lado o tempo todo ou só no fim: erra; esquivando no aviso:
  erra; toque rápido parado: 70; Kemi parado 150 e de lado erra; CPU do Arthur continua atirando.

- **Modelos antigos apagados (Erin aparecia com o corpo antigo da Aghata).** Quando um `.glb` falhava ao baixar (o
  servidor devolvia HTML no lugar do arquivo), `preloadModels` só avisava no console e `buildModel` montava o modelo
  procedural provisório registrado para aquele id — a Erin caía no `buildAghata`. Apagados `src/models/characters/`
  (kaiser, arthur, joui, aghata, gal_sal, kian, dante), `MODEL_BUILDERS` e o rig humanoide antigo do `rig.js`
  (`buildHumanoid`, `faceTexture`, `paintEyes`, `paintMouth`); `addJouiProps` foi para `props.js`. Agora:
  `loadGLB` não guarda a falha no cache, `preloadModels` tenta cada modelo 4 vezes (com espera e `?r=n` para não
  reaproveitar resposta ruim) e, se ainda falhar, o jogo mostra "Não foi possível carregar os modelos" com
  RECARREGAR. `MODEL_IDS` (galeria) no lugar de `MODEL_BUILDERS`. Testado: os 27 modelos (personagens e formas)
  montam do Blender; Erin, Aghata, Joui (com a katana) e Kaiser conferidos na tela; luta Joui × Erin sem erros.

## v3.13.0 — Torneio e o X

- Versão: `VERSION` 3.12.0 → **3.13.0** (Torneio, Jae, correções da CPU e do Juan).
- **CPU se transforma de verdade:** a Transformação só era tentada a mais de 4 m e depois das habilidades — colada no
  adversário a CPU ficava carregando e nunca passava do limite. Agora é prioridade a partir de 1,8 m e a CPU carrega
  andando para longe. Testado: Juan, Jae e Aguiar transformam em 13–23 s contra um P1 agressivo, sem erros.

- **Nova lutadora: JAE (Park Jae-Yoon, Mascarados/Hexatombe, Sangue)** — referências do usuário em
  `Referencias visuais/Personagens/Jae`. `src/characters/jae.js` (kit exportado em `JAE_KIT`) e a forma X
  (`forms/jae_x.js`: +20% nos golpes, cooldowns −30%, cegueira +0,4 s, bônus de assassina 1,45). Modelo próprio
  `tools/blender/char_jae.py` → `public/models/jae.glb` (sobretudo vermelho longo aberto com lapelas, botões e tiras
  cinza com fivelas, laços em X e tiras na barra, arnês nas costas, gola alta canelada, tiras vermelhas em X nas
  pernas, polainas, cabelo com franja). Rosto `face_jae` (maquiagem preta, batom vermelho, pinta) e
  `turtleneck_jae` em `textures.js`. Props (`props.js`): Punhal X (adaga de guarda de latão) e o capuz do X (casca
  vermelha aberta, interior escuro, tiras e rebites, rosto escuro com o X vermelho em pinceladas) — variante `jae_x`
  em `MODEL_VARIANTS`. Habilidades novas em `abilities.js`: `whisperZone` (X no chão; dentro: +25% dano e +12%
  velocidade), `shadowTrap` (armadilha de Conhecimento quase invisível que cega) e `blindFighter` (CEGO: `noBlock`,
  derruba a guarda e deixa desprevenido); `dashStrike` aceita `blind`. Passiva `backstab` com `surprised: true`
  (vale também em desprevenido/cego). Especial Assassinato Cruel (`cinematicCombo`, final em X). Pose de vitória
  `vic_jae` (o "shh" com a mão esquerda). Falas: abertura/resposta/gancho, cenas próprias com Aguiar e Kemi, 36
  falas de vitória dela e 36 contra ela, falas de batalha. Agarrão `jae`/`jae_x` (corte na garganta). CPU:
  Zona dos Sussurros como habilidade de si mesma. `check-roster` com a regra da Jae. Testado no navegador: todas as
  habilidades, especial, agarrão, transformação, CPU × CPU, introdução e seleção.
- **Jae refeita (pedido do usuário: modelo e habilidades abaixo dos outros e das referências).** Pesquisa na wiki
  (Park Jae-Yoon, Natal Macabro/Hexatombe): anuncia o ataque com "Shhh...", espreita nas sombras, inspirada no
  Ghostface, pessoa não-binária (qualquer pronome); Punhal X = cabo preto, guarda amarela, lâmina longa com recorte;
  Capuz de X melhora as habilidades (Assassinato Furtivo → Assassinato Cruel, ganha a Zona das Sombras: cego e surdo).
  - **Modelo novo** (`char_jae.py` reescrito): sobretudo de couro AJUSTADO ao tronco (antes era um tubo que engolia os
    braços), aberto na frente e abrindo abaixo da cintura; lapelas largas com debrum cinza e botões; cordão do capuz;
    CAPELETA nos ombros com arnês de tiras e rebites nas costas; tiras na cintura de trás; barra com faixa cinza, laços
    em X e tirinhas; mangas com faixas/fivelas e X pretos; suspensórios, cinto, abas de bolso, tiras vermelhas em X,
    meias caneladas e coturnos de sola grossa; cabelo em mechas pontudas (duas cores para separar), franja varrida
    sobre o olho direito, nuca repicada. Capuz agora é do próprio modelo: `prop_hoodDown` (embolado nas costas),
    `prop_hoodUp` (alto e pontudo, desce nos ombros, tira em X com rebites) e `prop_hoodX` (escuridão + X brilhando).
    Textura `coat_jae` (couro com vincos e costura das costas); delineado gatinho no `face_jae` (não parece mais olho
    roxo). Punhal X refeito em `props.js`. Ferramenta `src/dev/lineup.js` para comparar modelos lado a lado.
  - **Kit novo:** △→□ **Shhh...** (`shadowVeil`/`veilFighter`: quase invisível 4 s, +15% velocidade, o adversário
    perde o rastro — `Fighter.lostTrack` não deixa a mira/defesa virar sozinha; a CPU fica perdida — e o primeiro
    ataque deixa o alvo desprevenido e a revela; dentro da Zona dos Sussurros atacar não revela; tomar dano revela).
    △+L2 **Assassinato Furtivo** agora surge APUNHALANDO (`teleportBehind` com `strike`). Punhal X com o segundo risco
    do X (`xSlash`). Zona dos Sussurros: lá dentro todo golpe dela entra como assassinato (`backstab` lê o buff;
    mult 1,1). Especial **A Marca do X** (começa com o "shh", termina sangrando). Forma X: **Zona das Sombras** no
    △→□ (cega e deixa **SURDO** 3,5 s — `deafFighter` — e ela some 2,5 s ao armar) e **Assassinato Cruel** (58 + sangra)
    no △+L2; especial com 300 de dano.
  - **Transformação com cena própria** (`maskTransform` cena `'hood'`, o gif "jae colocando mascara"): segura o capuz
    (`hood_grab`), puxa por cima da cabeça (`hood_pull`, o rosto ainda aparece), "Shhh..." (som sintetizado `shhh`) e o
    vermelho com o X acendendo. `sp.swap` troca as peças do capuz e desfaz no modelo base/na cena interrompida.
  - Testado no navegador: Shhh (esconde, a CPU perde o rastro, o golpe do escuro entra com bônus: 26 no Kaiser),
    Furtivo 44, Punhal X 38 + cego, Zona, transformação (sequência das peças certa, vira X com 280 → +80), Zona das
    Sombras 69 + cego + surdo, Assassinato Cruel 86 + sangra, especial 251, luta contra a CPU sem erros.
    `check-roster` atualizado; checagens, 41 testes e build ok.
  - **Sorriso na cena do capuz:** `face_jae_grin` (sorriso com dentes e batom) em `textures.js` (`jaeFace(grin)`); a
    cena `'hood'` troca a textura do rosto (`sp.grin`, `swapFace` em `maskTransform.js`) quando o capuz sobe e desfaz
    no fim/na interrupção.
  - **CORREÇÃO: os punhais arremessados (□) da Jae nunca acertavam.** `spread: 4` foi escrito como graus, mas o
    `Fighter` soma o spread direto no vetor de mira (fração): as facas saíam para cima e até para trás. Agora 0,06 —
    testado: as duas facas acertam (44) de 3 a 22 m, de lado, com o alvo andando e na forma X.
- **CPU usa mais as habilidades (todos os personagens):** a escolha de habilidade feita no meio de um golpe se perdia
  (o jogo ignora △/R2 + botão enquanto o lutador não está livre). Agora `pressAbility` guarda a escolha
  (`pendingAbility`, 0,9 s) e aperta no primeiro quadro livre. `def.ai.abilityRate` multiplica a chance por
  personagem (Jae 1,8). Medido em 60 s contra um P1 ativo: a Jae foi de 1 para 4–5 habilidades (o limite agora é a
  sanidade).
- **Transformação do Juan reverificada (não trava):** pelo comando real (segurar △ com a barra cheia) como P1 e P2,
  espelho Juan × Juan, interrompida por golpe, contra Kaiser/Jae, e o round seguinte volta normal — sem erros.
- **CORREÇÃO (travava o jogo): Renascimento do Juan.** No fim da transformação a sequência (`seq.update`) troca a forma
  e zera `this.seq` por dentro; o `Fighter.update` lia `this.seq` de novo depois e dava `TypeError` (onDone de null),
  que derrubava o laço do jogo — tela congelada. Agora guarda a sequência antes de atualizar e não reseta se ela foi
  trocada por outra. Testadas as transformações de todos os 18 personagens sem erro.

- **TORNEIO local (v1):** escopo escolhido pelo usuário — local primeiro (online numa próxima versão) e lutas só de
  CPU sempre sorteadas. `src/game/tournament.js`: chave de eliminatória simples (tamanho = potência de 2; a 1ª rodada
  junta `order[i]` com `order[i + size/2]`, então nunca sobra luta vazia; quem fica sozinho passa direto),
  `nextMatch`, `setWinner`, `autoResolve` (resolve TODAS as lutas só de CPU prontas, mesmo com uma de humano antes).
  Telas `TournamentSetupScreen` (quantidade 2–8, solo/equipe, humano/CPU por vaga, tempo, rounds, dificuldade,
  cenário fixo/aleatório) e `TournamentScreen` (colunas por rodada, vencedor ✔, sorteadas 🎲, PRÓXIMA LUTA ou
  CAMPEÃO). Cada humano escolhe na `SelectScreen` (modo `tournament`, `heading` "VEZ DE: JOGADOR n", equipe com 3);
  CPUs sorteiam. Humano × CPU: humano no P1 (troca os lados se preciso); humano × humano: P1 × P2. A tela de
  vitória mostra o nome do participante e só CONTINUAR; na pausa SELEÇÃO vira SAIR DO TORNEIO. 26 chaves novas × 13
  idiomas. 6 testes novos.
- TODO: tradução do resto do jogo (diálogos, golpes, descrições, nome do jogo…) anotada como a PRÓXIMA TAREFA.
- **Torneio refeito no estilo Naruto Storm (o usuário achou a 1ª versão feia e pouco intuitiva):** montagem em 3
  passos numerados (① formato, ② participantes, ③ regras) com 8 cartas de vaga — seletor VAZIO | HUMANO | CPU sempre
  visível em cada carta (clique direto ou A/×), a área do retrato é o botão de escolher o lutador (Y/△ ou clique;
  CPU sem escolha = sorteado), vagas vazias com "+ ADICIONAR", contador de participantes, regras em pílulas com
  ◀ ▶ clicáveis, COMEÇAR que avisa quando faltam participantes e barra de dicas que mostra só os botões do item
  selecionado. A chave virou uma árvore espelhada (SVG) convergindo para o troféu no centro, com medalhões de
  retrato, caminho do vencedor aceso em dourado, eliminados em cinza, a luta da vez pulsando, painel VS grande e o
  campeão no centro. Fundo opaco (o 3D do menu atrapalhava).

## v3.12.0 — Golpes que se ouvem

- Versão: `VERSION` 3.11.0 → **3.12.0** (sons e efeitos). Risada gravada do Anfitrião removida a pedido do usuário
  (`laugh` volta ao sintetizado).

- **Efeitos sonoros importados (CC0, Kenney):** `tools/import-sounds.py` converte (ffmpeg, mono, 64 kbps) os arquivos
  escolhidos de `assets_src/kenney/` para `public/sounds/<nome>_<n>.ogg` e gera `src/audio/soundFiles.js`. 20 nomes
  (punch, heavyPunch, kick, impact, bladeHit, axeHit, knifeThrow, trapSnap, grenadePin, reload, blockHit, guardBreak,
  perfectBlock, explosion, shockwave, select, confirm, denied, tick, button), 74 arquivos, 428 KB. O `AudioManager`
  guarda várias variações por nome, sorteia uma e varia o tom ±5%; se um arquivo não carregar (ou o navegador não
  decodificar .ogg) volta ao som sintetizado.
- **Golpes refeitos (o usuário reprovou soco e espada do Kenney):** pacotes CC0 de combate do OpenGameArt em
  `assets_src/oga/` (37 hits/punches, Punch do qubodup, 20 Sword Sound Effects, swishes). Medido sem ouvir: os do
  Kenney tinham 0,4–0,65 s de cauda abafada e o chute era só grave (centroide 88 Hz); o pacote de golpes tinha até
  270 ms de silêncio antes do impacto. O script agora corta o silêncio inicial, normaliza o pico (−1 dB), descarta
  variações com pico tardio (> 90 ms) e monta `bladeHit`/`slashFinal`/`axeHit` misturando aço + golpe no corpo.
  `swing`/`blade` (whoosh) agora gravados. Sem camada sintetizada por cima (tentativa intermediária, removida).
- **Tiros e o resto dos sons (2º pedido):** biblioteca de armas CC0 (194 MB, fora do git) — cada arquivo tem 2–4
  disparos; achados por análise de energia e cortados um a um (`shots(..., at=)`). Descartadas as gravações que eram
  só o estalo (20–70 ms acima de −30 dB). `m4` 4 × AR-15 (0,4 s), `shotgun` 8 (Model 12, Nova, Mossberg), `sniper` 8
  (Tikka, Arisaka, Springfield 1917). Também: clawHit/bloodClaw/descarnar (carne molhada + golpe), chainThrow/
  chainPull, whip (whoosh + estalo), teleport/blink, heartbeat, land, jump, fearGaze (gemido fantasma), ko (golpe +
  estrondo grave). 39 nomes, 884 KB.
- **Sons paranormais (3º pedido):** "Magic Spell SFX", "Spell sounds", "Evil laughter" (OpenGameArt) e aplausos do
  BigSoundBank (todos CC0) + campo de força / propulsor / motor do Kenney Sci-Fi. Os arquivos de "Spell sounds" têm o
  mesmo efeito várias vezes em 8–22 s: trechos achados por energia e cortados (`at`, também por camada no `mix`).
  `startLoop` usa a gravação em loop quando existe (`chargeHum`: motor grave subindo o tom de 0,85× a 1,35× em
  2,5 s), senão o oscilador de antes. 53 nomes, 155 arquivos, 1,16 MB. Restam sintetizados `ready` e `bladeWave`
  (sem uso).
- **VFX de corte e impacto:** `slash()` com UV polar e textura de degradê (cauda transparente → ponta forte, borda
  externa quase branca), varredura da ponta no 1º terço da vida e camada de brilho largo por trás. `FX_HIT_SMALL`:
  núcleo branco em estrela + estouro espinhoso da cor crescendo + faíscas mais rápidas e finas.
- **Texturas de efeitos (CC0, Kenney Particle Pack):** `tools/import-fx.py` → `public/fx/*.png` (7 texturas, ~75 KB).
  `ParticlePool` aceita textura (girada por partícula no shader); a fumaça usa `smoke`; pools novos `debris` e
  `spark`; `fx.flash({ tex, grow })`. Receitas da `library.js`: golpe (estrela), golpe pesado (pedrinhas), bloqueio
  perfeito (flare), energia (faíscas), explosão (fogo + estouro + pedrinhas), marretada no chão (pedrinhas).
  Créditos/links em `assets_src/README.md`.

## v3.11.0 — As Torres

- Versão: `VERSION` 3.10.1 → **3.11.0** (modo novo + idiomas ligados). Changelog dos jogadores com tudo o que
  estava "em andamento".

- Arthur: pose de vitória própria `vic_arthur` (a sniper apoiada no ombro do único braço, corpo de lado, olhar baixo)
  no lugar de `victory_onearm` (era o punho erguido genérico). Campo novo `def.victoryProp`: `World.showVictoryLineup`
  mostra uma arma que no resto do tempo só aparece em uso (aqui `sniperHand`). A Lírio já tinha pose própria
  (`victory_hammer`) — a análise da v3.10.1 tinha contado errado.
- TODO: removida a lista de ferramentas de Treino da §76.5 (pedido do usuário).
- **Idiomas ligados:** trocar o idioma em OPÇÕES traduz a interface na hora (a tela de opções é remontada no novo
  idioma sem sair da linha IDIOMA; as outras telas leem o idioma ao serem montadas; os botões de toque escutam o
  `onLanguageChange`). 222 chaves × 13 idiomas em `src/i18n/locales/` (gerados da mesma tabela; pt-PT tem arquivo
  próprio). Ligados ao `t()`: Screens.js (início, submenus, título, seleção, configurações, vitória, cenário, dicas do
  carregamento, online, novidades, comandos/controles), main.js (opções, pausa/treino/tutorial, opções da vitória),
  HUD.js, Match.js (LUTEM, ROUND n, K.O., TEMPO!, RESET, popups do dreno), settings.js (`timerLabel`, `cpuLabel`) e
  touchControls.js. Teste novo: todo idioma tem todas as chaves, sem texto vazio e com os mesmos marcadores `{x}`.
  Fica em português (anotado na §37): conteúdo dos personagens, novidades (com aviso), cenários, Tutorial, `notify`
  de combate e erros da conexão.
- **Idiomas — avisos de combate e online:** `tAlert(texto)` (`src/i18n/index.js`) acha a chave `alert.*` / `combat.*` /
  `net.*` cujo texto em pt-BR é igual ao do código e devolve no idioma atual (padrões: "X: RECARREGANDO",
  "PRECISA DE N% DE SANIDADE", versões diferentes). Chamado em `Fighter.notify`, no `netToast` e no erro da tela ONLINE;
  o selo ONLINE usa `t()`. Assim as ~195 chamadas de `notify` não mudaram: o que é sistema traduz, o que é nome de
  poder/frase de personagem fica como conteúdo. 279 chaves × 13 idiomas; teste novo do `tAlert`.
- **TORRES v2 (refeito a pedido do usuário):** menu `TowerSelectScreen` com 8 torres 4 × 2 (cadeado até zerar a
  anterior; mostra a dificuldade mais difícil zerada, `saveTowerClear` só troca por uma mais difícil). Torre 3D em
  `src/ui/towerStage.js` (zigurate redondo de andares com arcos acesos, rampa em espiral, santuário com feixe de luz,
  placas com os retratos dos adversários; câmera `intro()` base → topo → afasta e `focus(i)`), desenhada no
  `render()` no estado `towerview`. `TowerScreen` com modos intro / diff / map / done. Vilão do topo sorteado
  (`pickBoss`, `VILLAINS`) e buffado em `setupControllers` (maxHealth × e `cpuEdge` dealt/taken × por dificuldade,
  `BOSS_BUFF`; o jogador não vê esses números — pedido do usuário); Torre VIII (Babel) fixa. A dificuldade escolhida vale para todos os andares. Lutador fixo: na pausa da
  torre SELEÇÃO DE PERSONAGENS vira DESISTIR. Retratos dos vilões gerados com o elenco. Correções junto: luta
  espelho (Kaiser × Kaiser) travava na introdução por não ter fala registrada — agora entra sem falas; Mutilador,
  Erin do Caos e ??? (Elmo) usam as falas da base (`BASE_CHARACTER`).
- **TORRE (modo novo, menu principal) — v1, substituída pela v2 acima:** `src/game/tower.js` (montagem com semente + recorde em
  `localStorage['arena_torre_recorde']`) e `TowerScreen` (mapa vertical). Seleção com `MODES.tower.soloPick` (só o P1
  escolhe; o lado 2 some). 7 adversários sem repetir com a dificuldade subindo + O DEUS DA MORTE (`getForm`) no topo;
  `setupControllers` usa o nível do andar; a vitória mostra PRÓXIMO ANDAR / DESISTIR ou TENTAR DE NOVO / DESISTIR.
  Retrato do chefe gerado junto com o elenco. Correção junto: `Match` achava quem fala na introdução só pelo id —
  com uma forma (Deus da Morte usa as falas do Ferreiro) quebrava; agora cai para o id da base e, sem achar, para a
  ordem da fala. Teste novo `tests/tower.test.js`. ETAPAS 3–5 marcadas (testadas pelo usuário).
- **Removida a opção MOVIMENTO "relativo ao inimigo"** (pedido do usuário: ruim de jogar). `moveBasis()` devolve
  sempre a base da câmera; `moveMode` saiu dos padrões, é apagado das configurações salvas e não vai mais no
  `settings` da sala online.

## v3.10.1 — Olhos sempre abertos

- Fita da espada (o usuário viu que continuava preta depois do `baseEmissive` da v3.10.0): a causa real era a largura
  em `physicsRibbon` — `side = (dir.z, 0, −dir.x)` dá ZERO com a fita pendurada reta para baixo → triângulos sem área →
  normais NaN → a luz do `MeshToonMaterial` virava NaN e o pixel saía PRETO (o brilho junto). Agora a largura é
  `dir × eixo Z da espada` (com fallback), sem NaN; brilho próprio 0,35 → 0,7 para o vermelho não sumir na sombra.
  Medido renderizando num render target: pixel da fita 0,0,0 → 255,5,44 (Veríssimo) e 255,4,27 (Arnaldo).
- Veríssimo (pedido do usuário: nomes genéricos, "Aniquiladores" não aparece na série — na wiki é a equipe de Varredura
  que ele liderou, citada em Calamidade 4×12): só NOMES/descrições mudaram, nenhum número. Fontes: wiki "Senhor
  Veríssimo" ("Olhos sempre abertos!" ao bloquear o golpe do Gal e salvar o Arthur com a espada do Arnaldo; a fala
  "…que também sintam medo. Porque nós estaremos em seu caminho"; Varredura) e a trilha Comandante de Campo do RPG
  (Brecha na Guarda, Oficial Comandante — nomes do livro de regras, não confirmados na wiki). Golpes: Estocada do
  Veterano, Corte de Varredura, Revés do Comandante, Pela Ordo Realitas, Ergam-se Agentes (↑), Fim da Varredura (↓),
  Interceptação (frente), Olhos Sempre Abertos! (trás, contra-ataque), Flanco da Ordem (lado), Salto do Veterano (ar);
  □ Escopeta de Varredura; Análise Tática → Brecha na Guarda; Investida dos Aniquiladores → Em Seu Caminho; especial
  Ordem de Ataque → Oficial Comandante (banner "Que também sintam medo!"); Despertar → Líder da Ordo Realitas;
  frase de seleção "Olhos sempre abertos.". O "Aniquilador" do Arnaldo ficou (decisão pendente com o usuário).

## v3.10.0 — Os Aniquiladores (versão estável: Arnaldo, Anfitrião, Veríssimo e correções do TODO)

- Estado do repositório (2026-10-08): o diretório de trabalho tinha 61 arquivos sobrescritos às 14:27:46 com o
  conteúdo antigo da v3.5 (VERSION 35) por cima do HEAD 3.9.4+. Mesmo padrão da reversão das 03:45: guardado no
  `git stash` ("reversão acidental 2026-10-08 14:27:46 …", não aplicar) e o trabalho seguiu do HEAD.
- Tela preta (estabilidade): `liveCable` (`models/props.js`, cabo peito → relógio do Anfitrião) refazia o
  `TubeGeometry` no `onBeforeRender`; num modelo recém-criado (antes da primeira pose, juntas no mesmo ponto) a curva
  tinha comprimento zero e o `CatmullRomCurve3` lançava erro DENTRO da renderização — o quadro inteiro ficava preto
  (visto na tela de vitória com O Anfitrião). Agora o cabo degenerado/NaN não é refeito naquele quadro.
- Balu (pedido do usuário): o Machado em Giro arremessa a arma que está NA MÃO. `ranged.whileBuff` (novo, Fighter):
  com o buff `bloodBlade` (Machado Demônio) o □ usa a variante `{ hideProp/returnsProp: 'demonMace', visual:
  'demonMace' }` (visual novo em projectiles.js com a `demonMace()` de weapons.js). `returnsFallback` (novo,
  `giveBack`): se o buff acabar no meio do voo, volta para a mão o machado. `demonAxe.onEnd` conta a maça no ar.
  Dano igual. Testado: machado normal vai e volta; com o Demônio a maça vai e volta; buff acabando no ar → machado.
- Gal (pedido do usuário): a cura que cobra sanidade deixou de ser passiva. `meleeDrain` aceita `whileBuff` (só vale
  com o buff); habilidade nova **Ativar Ereshkigal** (nome escolhido pelo usuário — as lâminas Ereshkigal do Gal) em trás + □ (`ranged.variants.back.ability`,
  mesmo mecanismo do Anfitrião — os 5 atalhos △○/△□/△L2/R2△/R2× já estavam ocupados): `selfBuff` `ereshkigal` por 6 s,
  15 de sanidade, recarga 14 s, dica de IA `max: 5`. Mesmas proporções da passiva antiga (Y dos golpes, ×1,5 de
  sanidade para o Gal). Testado: sem a Ereshkigal o golpe não cura nem drena; com ela, cura o alvo, drena e dá ao Gal;
  desliga em 6 s.
- Fita da espada do Arnaldo/Veríssimo voltou a ficar vermelha (pergunta do usuário): desde a física da fita
  (`physicsRibbon`, commit 52b00c0) o material é criado em código e entrava na lista do "flash" de dano do rig
  (`glbRig.setTint`), que zera o `emissive` a cada quadro; sem o brilho próprio, o vermelho `0xd01c30` ficava quase
  preto na luz dos cenários. Agora a fita e o nó marcam `userData.baseEmissive` (vermelho, 0,35), que o `setTint`
  devolve. Conferido: emissive `#d01c30@0.35` nas duas espadas depois de um flash de dano.
- Arnaldo, Anfitrião e Veríssimo finalizados (escopo obrigatório da versão): poses de vitória próprias
  (`vic_arnaldo` — reverência teatral com a espada aberta; `vic_verissimo` — espada de ponta para baixo, as duas mãos
  no punho; `vic_anfitriao` — braços abertos para a plateia, cabeça tombada) em `anim/victoryClips.js`; comentários de
  "modelo PROVISÓRIO" atualizados (os `.glb` próprios já existem). Testes no navegador: todas as habilidades, □,
  especiais (Ato Final 217, Ordem de Ataque 214, O Jogo do Anfitrião 239), agarrões, Transformação pela Barra
  (Arnaldo → Anfitrião), Segredo de Veríssimo, Guarda do Comandante, corte extra da Inteligência Estratégica,
  Percepção Anacrônica — sem erro de console; 30 lutas CPU × CPU (nível difícil) com os três usando o kit inteiro.
  Animações referenciadas pelos três: todas existem em `CLIPS`. README: linhas do elenco do Arnaldo e do Veríssimo,
  Super Difícil na lista de níveis. HABILIDADES.md regenerado.
- Limpeza: imports sem uso removidos (`abilities.js`: buildModel/Animator; `props.js`: hostMask, mustache, necktie,
  watchChain; `Screens.js`: COMBAT). Build: o `main` passava de 650 kB (aviso) → chunk `textos` (falas + i18n) no
  `manualChunks`; `main` 595 kB, sem aviso. Versão compilada (`vite preview`) testada: abre, luta, vitória, revanche,
  menu principal, treinamento, seleção com a página 2 (Balu, Arnaldo, Veríssimo).
- Versão: `VERSION` 3.9.4 → **3.10.0** ("atualização concreta": 3 lutadores novos anunciados). Changelog dos
  jogadores com o que estava "em andamento" sem anúncio (Arnaldo/Anfitrião/Veríssimo, afinidades ±15%, falas de
  batalha, passo da defesa contínuo, throw tech nas duas ordens) + o desta versão.
- NÃO anunciado aos jogadores: o seletor de idioma (CONFIGURAÇÕES → IDIOMA) existe, mas as telas ainda não usam o
  `t()` do `src/i18n` — trocar o idioma não traduz o jogo. Ligar os textos é a ETAPA 5 do TODO; esconder o seletor até
  lá depende de decisão do usuário (anotado no TODO).

## (anunciado na v3.10.0) — estabilidade, limpeza e mecânicas universais de combate (Dodge e Throw Tech)

- Limpeza Git: exclusão da branch remota `refs-gifs`, exclusão da branch local `refs-gifs` e atualização de referências em `ANALISE.md` e `maskTransform.js`.
- Correção de teste unitário: corrigido mock em `tests/cpu-ai.test.js` para garantir cobertura correta de múltiplos buffs ativos (`heavyProtection` e `healing`).
- Regeneração da documentação de habilidades: `HABILIDADES.md` atualizado via `npm run moves` incluindo Arnaldo Fritz, Senhor Veríssimo e vantagens elementais ajustadas (+15% / −15%).
- Esquiva contínua da defesa: `COMBAT.dash.step.cooldown` igualado à duração (0.2s) e `Fighter.updateDash` atualizado para encadear passos rápidos continuamente ao segurar Defesa + Direção e retornar imediatamente à postura de guarda ao soltar a direção.
- Escape de agarrão (Throw Tech): `Fighter.tryGrab` atualizado para registrar a evasão tanto ao apertar físico segurando defesa quanto ao apertar defesa segurando físico dentro da janela de `grabTech.window` (0.22s).
- Nova suíte de testes unitários: adicionado `tests/combat-universal.test.js` cobrindo regras de esquiva, passos da defesa, substituição, throw tech e ciclo elemental.
- Sistema centralizado de internacionalização (i18n): criado módulo `src/i18n/` com suporte estruturado aos 13 idiomas do TODO (`pt-BR`, `pt-PT`, `en`, `es`, `de`, `fr`, `it`, `ru`, `zh`, `ja`, `ko`, `tr`, `pl`), fallback para `pt-BR`, detecção automática de navegador com prioridade manual e interpolação dinâmica (`t(key, params)`).
- Opção de idioma nas configurações: adicionado seletor `CONFIGURAÇÕES → IDIOMA` integrado ao `SETTINGS.language` e persistido em `localStorage`.
- Suíte de testes de internacionalização: adicionado `tests/i18n.test.js` cobrindo tradução, interpolação, fallback e troca de idiomas (28 testes passando com sucesso).

## (anunciado na v3.10.0) — falas do Anfitrião, falas de batalha e afinidade do Xande

- Afinidade do Xande corrigida para Conhecimento; adicionada verificação ao `npm run check`.
- Falas de batalha adicionadas para vida crítica, especiais e transformações. São trocas curtas de legendas sem
  pausar o combate, com intervalo mínimo para não se repetirem em excesso.
- Falas do Anfitrião reescritas com humor ácido, absurdo e provocações pessoais.
- `src/config/dialogues.js` continua concentrando as falas de introdução e vitória, além das novas falas de batalha.
  `npm run export:dialogues` exporta todas as falas para `dialogues-export.json`.

## (anunciado na v3.10.0) — afinidades e vantagem elemental

- Bônus do ciclo em `COMBAT.elements`: vantagem passou de +10% para +15% e desvantagem de −10% para −15%; Medo
  permanece neutro. O ciclo só modifica habilidades e especiais, não golpes físicos nem ataques principais à distância.
- Projéteis em arco agora encaminham o elemento declarado para `applyHit`; a fraqueza específica à Energia respeita
  elemento explícito e só infere Energia da afinidade do atacante quando o golpe não declara elemento.
- Afinidades corrigidas: Arnaldo Fritz → Energia (o Emissor continua Conhecimento por usar Sigilos de Conhecimento);
  Senhor Veríssimo → Medo.
- Cobertura adicionada ao `npm run check` para o ciclo, neutralidade de Medo, exceções da fraqueza à Energia e as
  afinidades de Arnaldo e Veríssimo. Validado também com `npm test` e `npm run build`.

## (anunciado na v3.10.0) — UPD etapas 10-11: O Anfitrião e o sistema de caos

- Botão do Anfitrião: substituído o evento automático por uma disputa; após o estalo, ambos voltam aos pontos de
  início da arena, correm até o botão central e acionam-no com o botão físico. Quem apertar primeiro dispara o evento
  do caos contra o adversário; empate no mesmo quadro usa desempate determinístico. A disputa tem contagem
  regressiva, bloqueia ataques durante a corrida e encerra com segurança em KO, cancelamento, reset ou timeout.
- `combat/chaos.js` (novo): `pickChaos` com raridade (comum 60 · incomum 28 · raro 10 · muito raro 2), histórico de 3
  por sorteio (sem repetir), `chaosBoost` (A Plateia deixa o raro mais provável), combinações só em pares permitidos;
  `world.chaosLog[chave][id]` conta tudo (testes). Disparo do Caos de 8 cores (`rollChaosShot`: ROXO impacto, AZUL
  lento, ROSA repulsão, AMARELO choque, VERDE troca, VERMELHO explosão, BRANCO duplicação, PRETO falha que volta de
  outra direção) com ganchos novos nos projéteis (`hitFn`, `expireFn`, `afterFire`, `color2`). Eventos do caos (Botão,
  roleta gigante, raros): raio, choque, empurrão, lento, explosão, troca, teleporte, controles invertidos, chicote,
  ataque falso, clone, distorção, sumir, falha na realidade, tiro de outra direção, multidão, relógios, tempestade,
  Jogo do Orfanato. `HostClone` (máx. 3, tempo limitado, explode no fim perto do alvo). Manias de ambiente
  (`def.quirks` → `tickHostQuirks`; `Fighter.gestureT` segura o gesto parado).
- `combat/hostAbilities.js` (novo): `chaosRule` (8 regras, castigo sorteado), `chaosWhip`, `hostDistortion` (pode
  falhar), `hostTime`, `hostAudience`, `hostButton`, `orphanGame`, `hostClones`, `familyTradition`.
- `□ + direção` pode soltar uma habilidade (`ranged.variants.X.ability`; recarregando, sai o □ normal); inputs
  `ranged+forward/back/side` na HUD, lista de comandos e seleção.
- `hostGame` refeito: apresentador → palco → roleta de 7 casas (textura em canvas) → resultado (RAIO, CHOQUE, CHICOTE,
  TROCA, DISTORÇÃO, EXPLOSÃO, CLONES) → reverência; variações raras (risada, relógio, roleta falha e gira de novo,
  reverência atrás do alvo, clone na reverência). Dano 200–300.
- Agarrão: Visão Traumática (close na máscara via `scene.shots`, tela escura, −20 de sanidade, controles invertidos
  1,8 s — `fin.invert`). Percepção Anacrônica: o desvio automático dá +20% de dano por 1,5 s.
- CPU: usa o kit todo (inclusive □ + direção) e obedece às 8 regras. Sons novos: `whip`, `laugh`, `tick`, `button`,
  `applause`. Clipes novos: `host_press`, `host_charge`, `host_cast`.
- Testado no navegador: as 9 habilidades sem erro (voltam a `idle`, visível, sem NPC sobrando), □ + frente solta a
  Chicotada, 300 tiros com as 8 cores e combinações, 40 eventos do Botão, 6 ultimates (237–267, sem cinemática presa,
  variações sorteadas), agarrão com controles invertidos.

## v3.9.4 — Balu tanque

- `balu.awakening` (Resistência à Dor): `takenMult` 0,8 → 0,55, `armorEvery` 3,5 → 1,5 com `armorMax: 2` (novo em
  `awakenMode`: acumula golpes de armadura), `knockbackTakenMult: 0.4` (novo: buff que reduz o empurrão, lido em
  `damage.applyHit`), `heal` 0,1 → 0,25, `speedMult: 0.92`.
- Testado: golpe de abertura do Kaiser 20 → 11 (8 nos seguintes com a escala de combo), golpes absorvidos sem recuar,
  empurrão ~0.

## v3.9.3 — Balu novo (+ Arnaldo/Anfitrião/Veríssimo provisórios na main, sem anúncio)

- Referências do usuário na branch `refs-arnaldo` (pastas `Balu/` e `arnaldo verissimo ref/`; pode ser apagada depois).
- `char_balu.py` v2 (gerado aqui com o `bpy` 4.5 do pip — o mesmo `lib.py`): o cabelo era uma calota menor que a
  cabeça (ficava careca com uma faixa das mechas em volta) → massa fechada (`hair_volume`: topo, topete e nuca) +
  mechas com brilho de gel (`hairshine_balu`); bigode maior com pontas caídas e cavanhaque achatado no queixo; tronco e
  braços mais largos (`width 1.12`, perfil e `arm_r` maiores, mangas mais grossas); gola de polo aberta; `jeans_hip`
  cobrindo o quadril (a barra da polo aparecia entre as pernas). Textura `shirt_balu`: polo verde-clara (desenho base).
- `baluAxe` refeito pela referência (lâmina em barba, miolo escuro com furos, ponta-lança, gancho, cabo de madeira com
  faixa de pano em espiral); pomo de pantera e veias mantidos.
- Arnaldo/Anfitrião/Veríssimo: visual provisório pelas referências (espada da referência, óculos rosa, fios neon,
  Veríssimo sem casaco) — entram na main e na seleção, mas continuam fora do changelog dos jogadores.

## (anunciado na v3.10.0) — Arnaldo Fritz → O Anfitrião e Senhor Veríssimo

Pedido do usuário: só entra no changelog dos jogadores depois da implementação completa (modelos do Blender).
- Novos no elenco: `arnaldo`, `verissimo`; forma `anfitriao` (detalhes do kit no TODO, seção dos próximos lutadores).
- Modelos provisórios em `MODEL_VARIANTS` (corpo do Joui / Lírio + `addArnaldoProps` / `addAnfitriaoProps` /
  `addVerissimoProps`); acessórios novos em `weapons.js`: `swordArnaldo` (fita vermelha), `pocketWatch` (tampa
  articulada; com a Relíquia os ponteiros giram sem parar), `hostMask`, `roundGlasses`, `mustache`, `necktie`.
- `maskTransform` cena `watch` + clipes `watch_open` / `watch_raise`.
- Especial novo `hostGame` (roleta; aviso por `telegraph`); habilidade nova `gameRule` (ticker do mundo,
  `world.activeRule`; conta pulos e dashes por `Fighter.jumps` / `Fighter.dashes`).
- `ranged.chaos` (efeito sorteado por disparo, em `fireProjectile`); projéteis aceitam `launch`; puxão do projétil
  aceita `onHit.pull.anim/sound`; `dashStrike` aceita `guardBreak`; `selfBuff` aceita `extraHit`
  (`checkMeleeHit`: corte extra depois de cada golpe físico que acerta).
- Passivas `chronoSense` (em `applyHit`: `trySubstitution({ free: true })`, recarga `chronoCd`) e `verissimoSecret`
  (em `takeDamage`; `secretUsed` por partida, `secretRound` contra o Kian).
- Testado no navegador: transformação, roleta (aviso + dano 200–300), Regra do Jogo, Disparo do Caos, Percepção
  Cronológica, corte extra (26 → 38), Segredo de Veríssimo (fica com 1, o próximo golpe derruba), Emissor puxando e
  Finta quebrando a defesa. `npm run check` com as regras novas.

## v3.9.2 — Seleção online no celular

- Causa: na partida online `body.netplay #screens` tinha `pointer-events: none` (cliques não eram sincronizados entre
  os dois aparelhos), então no celular — sem teclado/controle — não havia como escolher.
- `Screens.js` `NET_UI` + `onTap`: no online o toque vira um código (1–249: item/lutador, 250: confirmar/COMEÇAR,
  251/252: página) que viaja nos `flags` do quadro sincronizado (`main.js` `packLocal`, bit 1+, com o nº da tela
  `uiSeq` nos bits 11+); `applyNetTaps` aplica nos dois aparelhos no mesmo quadro via `screen.netTap(code, slot)`.
  Toque de uma tela que já fechou é descartado. Telas: seleção, configurações, cenário, pausa (só quem pausou) e
  vitória (classe `net-taps` libera o toque nelas).
- Seleção online: cada jogador só toca na própria grade (cabeçalho "VOCÊ"); os dois escolhem e confirmam ao mesmo
  tempo.
- `__game.devNet(sessão)`: teste do online sem internet (duas abas ligadas por `BroadcastChannel`).
- Testado com Playwright: dois celulares deitados (844×390, toque) escolhendo juntos, convidado confirmando antes do
  anfitrião, COMEÇAR, configurações e cenário — os dois chegam ao carregamento com as mesmas escolhas.

## v3.9.1 — Celular

- `HomeScreen`: destaque da opção por `pointerenter` só com `pointerType === 'mouse'` (o `mouseenter` mudava a tela
  no "hover" do toque e o navegador engolia o 1º toque).
- CSS (celular deitado): `.panel .abilities` compacta (38×26, só `.k`, recarga e `.ready`) em vez de escondida.
- `HUD`: `nocost` ignora quem tem a passiva `bloodPrice`.
- `actionLabel` com `source === 'touch'` usa `BUTTON_LABELS.touch` (antes caía nas teclas do teclado: "J", "E+K").
- Testado com Playwright em modo celular (844×390, toque): um toque abre o submenu e um toque escolhe.

## v3.9.0 — Tela inicial nova

- `ui/titleStage.js` (`TitleStage`): fundo 3D dos menus — 5 lutadores (`LINEUP`) em idle com `SpotLight` de contorno
  na cor do poder, chão + círculo ritual aditivo girando, `FogExp2`, cinzas (`Points`), câmera com push-in/balanço;
  montado em `ready()` quando os .glb carregam. Substitui os anéis antigos (`menuScene`) em `main.js`.
- `HomeScreen`: logo novo (`.t-arena`, `h1[data-text]` com gradiente animado + glitch em `::before/::after`,
  `.elements`), `.vignette` e `.grain`; sem o SVG do sigilo. CSS: layout de tela grande (título no terço de cima,
  menu em coluna à esquerda com o logo no canto).
- Bug dos modelos invisíveis: `rigFromGLB` marca `userData.sharedGeometry` / `material.userData.sharedMap`;
  `World.dispose`, `SelectStage.dispose`, `portraits` e a Marionete não liberam mais geometria/textura compartilhada
  do .glb (liberar derrubava as cópias da seleção).
- `maskTransform`: esconde `sp.prop` no modelo base depois de transformar (e se a cena for cancelada).
- `kamikaze` reescrito: granada de luz (mesma regra da Supernova, `f.threatLob` para a CPU) → cutscene
  (corre, escopeta `shotShare`, pinos, explosão) → morte; erro = `stun` com `whiffRecovery`, sem se explodir.
- Ranged `type: 'beam'` (`Fighter.startBeam`): raio canalizado com ponta que persegue (`track` m/s), pulsos de
  `damage` a cada `tick` sem reação (dá para fugir). `labirinto_elmo.ranged` usa ele.

## v3.8.2 — Supernova com granada de luz

- `supernova`: sem `telegraph`; o especial começa com uma granada de luz real (arco de `sp.flash.flight` s até onde o
  alvo estava, raio `sp.flash.radius`). No estouro: fora do raio / invulnerável → "DESVIOU" ou erro; defendendo de
  frente para a Erin → "COBRIU OS OLHOS!"; senão "CEGO!" e a cinemática antiga (corre, escopeta, granada) começa
  (`startCinematic`, alvo com a animação `fear`). Erro: `stun(missRecovery)` com `whiffRecovery`.
- `f.threatLob` expõe a granada no ar; a CPU esquiva/defende perto do estouro (mesma chance do aviso).
- Testado: parado → cinemática (225); saindo de baixo → erro; esquiva → erro; defesa de frente → erro.

## v3.8.1 — A máscara de gás da Erin

- `gasMask()` (weapons.js) refeita: concha de borracha (metade frontal de esfera), lentes com aro + vidro/halo
  `glowMat`, bocal e tampa, cartucho na bochecha, dois `TubeGeometry` brilhantes até o peito, alças.
- `addErinProps` cria a máscara escondida no socket `mouth` (a cena leva das mãos ao rosto com `carryProp`);
  `addErinCaosProps` só a mostra.
- `maskTransform`: cena `gasmask` (clipe novo `madness_kneel` → `mask_lift`) e `sp.tint` (cor da cena/aura; Erin verde).

## v3.8.0 — Máscaras como nas referências

- Referências: GIFs do usuário (branch `refs-gifs`, `mascarados ref anm/`), análise em `Referencias visuais/ANALISE.md`.
- `maskTransform`: cenas `helmet` (Labirinto) e `mutilador` (Aguiar) com planos pela altura real do rosto, `PointLight`
  que vai da cor do poder ao vermelho, clarão vermelho e buff `killerIntent` (aura vermelha até o fim do round).
  `carryProp` leva o acessório das mãos à cabeça (malha presa ao esqueleto não é movida — a do Aguiar só aparece).
  `labirinto` expõe `props.helmetOn.parts`. Clipes novos: `mask_hold`, `mask_lift`, `mutilador_mask`, `bands_spread`.
- `ghostBands` (Kemi): anéis nos cotovelos/ombros que chicoteiam (rastro vermelho), `bands_spread` e `killerIntent`.
- Juan: `bloodEruption` na `heavyProtection` com `bloodArmor`; forma `diabo` com nome "PORTADOR DO TRONO".
- Erin (`erin_caos`): passivas `noSanity` (energia travada em 0 — `addEnergy`, regen e `spendEnergy` pagam em vida) +
  `bloodPrice` (1 de vida por ponto, mínimo 3%); dano ×1,35; especial sem custo. HUD: `.bar.energy.locked`
  ("SEM SANIDADE"). `kamikaze`: ao encostar num alvo que não esquiva → cinemática (rosto, granadas, os dois,
  `pullBack`) e a explosão aos 1,9 s; a morte dela espera o fim da cena (`setVisible(false)` até lá).

## v3.7.1 — Nomes dos assassinos

- `name` das formas dos Mascarados sem o nome do agente: `fantasma` → "A FANTASMA", `labirinto_elmo` → "???",
  `aguiar_mutilador` → "MUTILADOR NOTURNO" (a HUD mostra `def.name` da forma ativa).

## v3.7.0 — Especiais com aviso + máscaras na Transformação

- Novos tipos de especial: `maskTransform` (cena de pôr a máscara/capacete → `transform` para `sp.form`, +bonusHealth;
  `sp.prop` aparece no modelo base durante a cena) e `kamikaze` (pinos → corre `sp.speed` até `sp.contact` ou `sp.run`
  s → explode `sp.damage` em `sp.radius`; defesa de frente leva `guardedMult` e quebra; quem usa marca
  `sacrificeWin` e morre). `Match.endRound`: os dois em K.O. → vence quem tem `sacrificeWin`.
- `MODEL_VARIANTS` em `models/index.js`: formas que reaproveitam um .glb com acessórios diferentes
  (`labirinto_elmo` com `helmetOn`, `aguiar_mutilador` com `maskOn`, `erin_caos` com `gasMask()` procedural no socket
  `mouth`).
- Formas novas (`characters/forms/`): `labirinto_elmo`, `aguiar_mutilador`, `erin_caos` (espalham o kit base e
  sobrescrevem). Awakenings de Labirinto/Aguiar/Erin viraram `maskTransform`.
- Labirinto: sem `helmetForm`/`consumeMoment`/`chaosStorm` no kit base (entram Mapa Sanguíneo `predatorScent` e
  Capturar Momento `blessing`); `abyssMaze` não mostra mais o capacete. Aguiar: sem `maskForm` (entra Ataque Especial
  `heavyBlow`), especial sem `prepare.showProp`.
- CPU: `sacrificeOk` — só usa o especial `kamikaze` se o adversário tiver vida ≤ 80% do dano.

- Novo `src/combat/specials/telegraph.js`: tipos de especial que acertam à distância sem projétil definem
  `telegraph(f, sp)` → `{ time, anim, mark }` (ritual 0,85 s `cast_up` · abyssMaze 0,85 s · spiralSnipe 0,8 s
  `sniper_kneel` + mira · supernova 0,75 s · teleportStrike 0,7 s `iai_ready` · mistField 0,8 s só com
  `flowerStorm`). `special.telegraph` no personagem sobrescreve (objeto) ou desliga (`false`).
- `Fighter.updateSpecialStart`: depois do preparo (0,45 s) roda o aviso (ainda em `specialStart`, então golpe
  interrompe); no fim, `telegraphMissed`: fora de alcance / alvo sumiu / alvo em `dodge`, invulnerável ou que
  esquivou/substituiu nos últimos `TELEGRAPH.evadeWindow` (0,45 s) → `whiffSpecial` (ERROU, `stun` 0,6 s sem
  Substituição — `whiffRecovery`). Defesa de frente continua no `trySpecialBlock` de cada tipo.
- `lastEvadeAt` marcado em `tryDodge` e `trySubstitution`; `senseDodgeThreat` conta o aviso como ameaça (gasta a carga).
- CPU: perto do fim do aviso esquiva para o lado (ou defende sem carga) com chance `min(0,92, (block + dodge) × 2)`.
- Esquiva: `COMBAT.dodge.emptyLockout` 3 s — `spendDodges` ao zerar trava o acúmulo de dano (e zera o acumulado);
  HUD marca a barra com `.dodges.locked`.
- TODO: seções dos próximos lutadores (Arnaldo Fritz → O Anfitrião, Senhor Veríssimo, espada compartilhada) e do
  redesenho da tela de início / HUD / identidade.

## v3.6.0 — Defesa estilo Storm + escapes

- Esquiva: `COMBAT.dodge.damagePerCharge` 120 → 70.
- △ → ○ / △ → □: `chordWithCarga` passa a medir o tempo desde o aperto do △ (`COMBAT.cargaComboWindow` 0,4 s) em vez de
  usar a janela da sequência do especial (`cargaWindow` 2,5 s, que ainda vale para △ → △ → ○).
- Defesa + direção: `updateBlock` não anda mais (removidos a defesa andando e `block.moveSpeedMult`); com a direção
  segurada emenda `startDash('step')` (passo 2,6 m / 0,2 s / recarga 0,38 s, animação `dodge`), de frente para o rival.
- Substituição: também no estado `stun`; marca `opp.combo.blocked` (a sequência do atacante não emenda e ele recua como
  em golpe defendido) e zera `opp.airCombo`.
- Verificado no navegador com `src/dev/testkit.js` (substituição no meio do combo de ○, saindo de atordoamento, △ → ○
  rápido × lento, passos da defesa).

## v3.5.1 — Substituição corrigida

### Posicionamento da substituição (v3.5.1)
- Bug: `Fighter.trySubstitution` chamava `findSpotBehind(arena, opp.pos, …)`; `opp.pos` (Vector3) não tem `yaw`, o
  cálculo dava `NaN` e a função sempre retornava `null` — a substituição nunca acontecia (L2 apanhando não fazia nada).
- Novo `findSubstitutionSpot` (`positioning.js`): passo curto para o lado em relação ao atacante
  (`COMBAT.substitution.sidestep` 1,2 m + `back` 0,4 m), lado escolhido pelo direcional (sem direcional: direita,
  depois esquerda), recua se os lados estiverem bloqueados e, sem espaço, fica no mesmo lugar. Determinístico (online).
  Remove `COMBAT.substitution.behind`. Testes em `tests/positioning.test.js`.

## v3.5.0 — Substituição aprimorada + Online pronto

### Posicionamento da substituição (v3.5.0)
- `Fighter.trySubstitution` usa `findSpotBehind` para escolher um local livre atrás do oponente, considerando hitboxes, obstáculos e limites da arena. Sem local seguro, a ação não consome carga nem recarga.
- A substituição mantém o cancelamento do hitstun/combo, a invulnerabilidade breve e os efeitos; a lógica é determinística para os dois lados no modo online.

### Modo online pronto
- A changelog para jogadores registra a disponibilidade das salas públicas/privadas por código e das partidas sincronizadas já implementadas em `NetSession`.

## v3.4.1 — Substituição no lugar

### Posicionamento da substituição (v3.4.1)
- `Fighter.trySubstitution`: remove o cálculo de coordenadas atrás do oponente; o lutador conserva X/Z ao escapar, zera Y/velocidade e recebe invulnerabilidade breve. Player e CPU usam a mesma implementação.
- Remove `COMBAT.substitution.behind`; atualiza os textos do README, dos movimentos e do TODO.

## v3.4.0 — Super Difícil de verdade

### Vitória sem duplicar formas + Super Difícil mais forte (v3.4.0)
- `Match` (fim da partida): na equipe, a forma (`winningFighter.def`) entra NO LUGAR do personagem base.
- `superhard`: think 0,05–0,1 s, block 0,42, dodge 0,3, perfect 0,75, subst 0,12, combo 5–7, rush 0,85, vertical
  0,9, tech 1; `edge` { dealt 1,15, taken 0,85 } → `Fighter.cpuEdge` (damage.js). Reações novas (smart): punição
  imediata de abertura a < 2,4 m (combo sem esperar o think) e esquiva lateral de projétil vindo na direção dela.
- Medido (12 lutas, Super Difícil × Muito Difícil): 7 × 5 → **11 × 1** (10 vitórias por 2 × 0).
- Deus da Morte: especial `ageGrab` (novo, `specials/ageGrab.js`) — preparo de 0,55 s avançando (`dm_lift`), agarra
  se estiver a ≤ 2,6 m × tamanho × 0,6; cena de 2,8 s pelo pescoço; `ageVictim`: materiais de cabelo/barba → branco e
  pele → acinzentada (clonados por malha, restaurados no fim), `rig.body` 0,9 de altura e inclinado; buff `aged`
  até o fim do round (mult 0,6 em tudo, speedMult 0,7, noRegen). `canStart` recusa quem já está `aged` (1x por
  round). 150 de dano, recarga 60 s.

## v3.3.0 — CPU que aprende

### IA que aprende + esquiva (v3.3.0)
- Nível `superhard` (Super Difícil) em `CPU_LEVELS` (IA e configurações): mistake 0, think 0,07–0,14 s, perfect 0,5,
  `smart` (defesa lida pelo perfil do jogador; atiradores — □ com alcance ≥ 14 e tiro carregado/forte — ficam a 7 m) e
  `learn`.
- `src/ai/learner.js`: bandit contextual por tabela. Estado = distância (4 faixas) × estado do adversário (ataca /
  defende / vulnerável / neutro) × vida baixa. Ações (`CpuController.options`): combo, agarrão, defender, recuar,
  dash, □, cada habilidade, especial, teleporte/dash longo, carregar, esperar — cada uma com um prior. Escolha:
  softmax(log prior × 0,6 + Q × 2,2 × confiança) com 8% de exploração. Recompensa 1,5 s depois: (dano causado −
  1,1 × dano recebido) / 100 (`Fighter.dmgTaken`, total da partida). Tabela do personagem + geral (`_all`).
  Perfil dos jogadores HUMANOS (adversário sem `input.cpu`): por faixa de distância, quanto atacam / defendem / pulam /
  atiram (`playerTendency`).
- Persistência: `localStorage` 'arena.ai.v1' (só o delta deste navegador) + `public/ai/learned.json` (vai com o jogo,
  `loadLearned` no boot). No dev, `saveLearned` faz POST `/__ai/learned` e o plugin `ai-learned` (vite.config.js) soma
  o delta no arquivo (o watch ignora `public/ai/**` para não recarregar a página). Salva no fim de cada round
  (`World.roundNo`) e de vez em quando. O servidor de equilíbrio usa os mesmos plugins (treino CPU × CPU também salva).
- Esquiva: `tryDodge` não gasta mais na hora; `settleDodge` (ao sair do estado) gasta 1 carga só se `dodge.threat`:
  golpe/ritual/especial do adversário em andamento a < 3,6 m, projétil inimigo a < 1,8 m, ou acerto anulado pela
  invulnerabilidade (damage.js). Desviar de Balas (Gal): projétil não gasta.
- Medido (12 lutas CPU × CPU, Super Difícil × Muito Difícil, pares variados): do zero 6 × 6; com os priors ajustados
  (combo pesa mais de perto, habilidades sem abertura pesam menos) e o que aprendeu nas 12 anteriores, 7 × 5. O
  `public/ai/learned.json` sai com esse treino inicial CPU × CPU (sem perfil de jogador — esse só vem de humanos).

## v3.2.1 — Cinzas da Decadenza

### Decadenza de médio alcance (v3.2.1)
- Projéteis: `a.grow` (novo) — raio de acerto `p.r = radius × (1 + grow × fração do alcance)` e a malha escala junto
  (também vale para NPCs). Visual `decay` solta cinzas claras além da fumaça.
- Dante: Decadenza `range` 20 → 8, `speed` 17 → 12, `radius` 0,65 → 0,5, `grow` 1,6 (até ~1,3 m).
- CPU: só usa o □ se a distância for menor que `ranged.range` + 0,5.

## v3.2.0 — Cada um agarra do seu jeito

### Agarrão próprio de cada um (v3.2.0)
- `src/combat/grabScenes.js`: `GRAB_SCENES[id]` = { beats (2 golpes com anims do kit), fin { t, anim, dur, fx, sound,
  bleed, drain, heal, slow } } para os 16 + Diabo, Fantasma e Deus da Morte; `FINISHERS` (efeitos visuais por poder).
  `Fighter.tryGrab` → `startGrabScene` usa a cena do `def.id` (fallback: os dois primeiros golpes do combo). Dano
  20% + 20% + 60% de 70; o finalizador roda o efeito, fecha a cinemática e arremessa. `check-roster` exige cena para
  todos (forms incluídas).

## v3.1.0 — Agarrão de cinema

### Agarrão em cutscene (v3.1.0)
- `Fighter.tryGrab`: passada a janela `COMBAT.grabTech.window`, `startGrabScene()` — `beginCinematic(self, caught)`,
  `twoShot` + `orbit`, golpes em `def.grab.scene` (opcional: [{ t, anim, dur, share, fx, sound }]) ou, sem ela, os dois
  primeiros golpes do combo do kit (anim + trail → fx 'slash'/'punch'), 20% + 20% + arremesso 60% de `G.damage` (70);
  o arremesso sai com o mundo andando (`endCinematic` antes do `applyHit` final). Escape e erro sem mudança.

## v3.0.0 — Todos despertam

### Despertar para todos (v3.0.0)
- `awakenMode` (novo tipo em `src/combat/specials/awakenMode.js`): cena de 1,4 s (faceClose + orbit, banner, anel,
  flash) e o buff `awakened` até o fim do round (`time: Infinity`; `reset()` limpa os buffs). Campos: `mult`/`affects`,
  `takenMult`, `speedMult`, `cdRate`, `energyRegenMult`, `regen`, `armorEvery`, `unblockable`, `meleeBleed`,
  `bloodArmSide` (+ `bloodArmor`), `heal`, `aura` ('flame' | 'smoke' | 'sigil' | 'blood').
- Fighter: `cdRate` dos buffs acelera as recargas (menos a da esquiva); `energyRegenMult` multiplica a regeneração de
  sanidade; `unblockable` de qualquer buff vale para o físico (antes só o buff `transcend`).
- `awakening` nos 13 kits sem forma (nomes do cânone, ver `lore/membros.json`); `check-roster` exige `awakening` em
  todos; `specialSummary` descreve o `awakenMode`; HUD corta nomes longos na barra.

## v2.7.0 — Barra de Transformação

### Barra de Transformação (v2.7.0)
- `COMBAT.storm` { fillPerHealth 1,4, healthRatio 0,35, overcharge 1 s, decay 1,5 } no lugar de `COMBAT.awaken`.
  `Fighter.storm` (0–100) enche em `takeDamage` (só com `def.awakening` e na forma base) e zera em `reset()`.
  `canTransform()`: barra cheia + vida ≤ 35% (no treino com sanidade infinita: barra cheia e sem a exigência da vida,
  `trainingAwaken`). Em `updateCharging`, com a sanidade cheia, `overcharge` sobe 1/s; em 1 → `startAwakening()`, que
  roda o tipo de especial de `def.awakening` (devilPact / ghostBands / santoPact) direto, sem o preparo vulnerável.
  Fora da carga o `overcharge` cai 1,5/s. Saíram `canAwaken`/`awaken`/`awakened` e o `bonusUseOnTranscend` do Kian.
- HUD: `.bar.storm` (só para quem tem `awakening`), com o nome da transformação, `full` / `ready` (pulsa) e o branco
  do `overcharge`; aviso "SEGURE △: TRANSFORMAR". CPU: com `canTransform()` segura a carga o tempo de encher a
  sanidade + overcharge.
- `santoPact` com `immediate`: a mesma cena, e no fim `riseAsDeathGod` (antes só ao morrer dentro do pacto de 45 s).
- Especiais novos (250, padrão): Juan `cinematicCombo` Hemorragia Severa (faca; `hits[].bleed` novo no cinematicCombo:
  8/s por 5 s no último corte; Faca Predadora rouba vida); Kemi `spiralSnipe` com `path: 'straight'` (novo: bala reta,
  1 s de voo, espiral em volta); Ferreiro `cinematicCombo` Consumir (espada, prep `bladeGlow`).
- Kian: `levitation` (novo tipo): 5 pedras sobem e giram em volta dele em 0,55 s e partem a cada 0,16 s para onde o
  alvo está (24 m/s, 16 de dano cada, dá para defender/sair). A Transcendência (tipo `transcend`) ficou só na
  assistência do Kian (buff no parceiro).
- Gal: buff ainda NÃO aplicado (a medição saiu inválida — servidor de equilíbrio com código antigo); ficaram no motor
  `mindControl.walkTo/noBlock` e `sweepStrike.pull`, sem uso por enquanto. Detalhes no TODO.

## v2.6.0 — Múmia, rastros e vitória de cinema

### Lote 2 do TODO (v2.6.0)
- Fantasma: `bloodBind` com `mummy: true` → `mummyWrap` (`abilities.js`): 10 faixas (cilindros abertos com textura de pano)
  dos pés ao rosto, uma a cada 0,04 s, apertando; pontas soltas; `hold` 1,1 → 2,2 s e o alvo se solta mais cedo
  apertando botões (cada toque tira 0,15 s do `stunTime`). Não está na wiki (adaptação anotada no código).
- `blink` com `a.residue`: 'sigil' (Kian) e 'smoke' (Fantasma).
- Vitória: `World.updateVictoryCam` (aproxima de 1,35× a distância e +0,9 m em 1,6 s, depois balança ±0,07 rad);
  `main.js` reprojeta os nomes a cada quadro enquanto `victoryCam` existe.
- Conferidos e marcados no TODO: ciclo dos elementos (1.1), Sanidade/PE (1.2), tiros amaldiçoados restantes (já
  diferentes), equilíbrio do Dante/Juan com as invocações.
- Equilíbrio depois da v2.5.0 (1 luta por par, 30 lutas cada): Labirinto 50% (era 39%, com a Tempestade em área),
  Erin 60% (Black Hole mais forte), Ferreiro 57% (Conforto/Hipnose) — todos na faixa 35–65%.

## v2.5.0 — Rituais com cara própria

### Lote do TODO (v2.5.0)
- `healOverTime` com `a.style` ('mist' Dante, 'ash' Erin, 'blood' Xande, 'comfort' Ferreiro), `a.stillBonus` (Dante 1,25)
  e `a.breakOnHit` (Ferreiro); buff `healing` com o nome do ritual (antes todos eram "PARADISO"). Valores: Erin 80 em
  1,8 s (cânone: mais forte que Dante/Joui), Dante 60 (75 parado), Xande 70, Ferreiro 100 em 4 s.
  Nota: a anotação antiga do TODO (Black Hole como zona de dano) estava errada — no cânone é cura.
- `hypnoSpiral` (novo, Ferreiro): tubo em espiral de Lodo no chão; buff `hypno` com `spiralTo` (em
  `Fighter.moveInputWorld`: o corpo anda em volta e para dentro do centro, os comandos valem 30%) e `noBlock`;
  centro a `offset` 1,6 m do alvo, do lado do Ferreiro; chegou (ou acabou o tempo) → `stun` 0,8.
- `chaosStorm` (novo, Labirinto): aviso de 0,55 s e 8 raios em 2 s num círculo de 3,2 m (metade mira o alvo se ele
  ainda estiver na área), 20 de dano cada. Teste: parado na área 72, saindo 0.
- Aghata: Facas Amaldiçoadas com `boomerang` (alcance 20, velocidade 30).
- `spiralSnipe`: trajetória `CatmullRomCurve3` em volta do alvo (raio até 8 m) em `sp.flight` 1,6 s com a espiral em
  volta da curva; câmera `chaseShot` presa à bala e corte no rosto do alvo; fim em 1,5 + voo + 1 s.

## v2.4.0 — Chegou o Balu

### Novo lutador: BALU (`src/characters/balu.js`)
- Modelo `tools/blender/char_balu.py` (Builder 1,08 × 1,14 × 1,05 ≈ 1,90 m; sem a orelha direita — espiral pintada no
  rosto; polo com gola grande e mangas arregaçadas, cinto com a fivela do Amuleto, sapato social; cabelo com gel,
  bigode e cavanhaque em malha). Texturas `face_balu`, `shirt_balu` (flores amarelas), `arms_balu`, `jeans_balu`,
  `amulet_balu` (`textures.js`). Armas `baluAxe` (pomo de pantera, veias) e `demonMace` (`weapons.js`);
  `addBaluProps`. Auditoria: 21k triângulos, altura 2,14 (Lírio 2,09).
- Kit: animações de duas mãos da Lírio (`hammer_*`, `grip.twoHand`); `ground` com `otg` (Derrubar e Atacar);
  □ bumerangue com `returnsProp: 'axe'` (novo: o projétil devolve a peça ao dono em todos os caminhos de remoção —
  `Projectiles.giveBack`; `hideRangedProps` espera o machado voltar). `demonAxe` (novo tipo): custo em vida
  (`hpCost`), troca `axe` → `demonMace`, buff `bloodBlade` (alcance + sangramento) com `mult` 1,25 e armadura;
  `propLock` impede o machado de reaparecer por cima da maça. Fala Imponente = `caiDentro` com `near: 99`.
  Especial `cinematicCombo` com `prepare.hideProp` (novo: troca de peça no especial e devolve no fim).
- Integração: `ROSTER`, `models/index.js`, `vic_balu`, falas (`dialogues.js`: 30 vitórias novas + trocas com
  Arthur/Dante/Agatha/Joui/Kian/Juan), assistência (Colete no parceiro / machadada), `lore/membros.json` (id),
  `check-roster` com contagem de confrontos dinâmica (240) e verificação do kit do Balu.
- Equilíbrio (CPU × CPU, 2 lutas por par, 60 lutas): **Balu 50%** — melhor contra Arthur e Kemi (4/4), pior contra
  Joui, Erin e Juan (0/4). Dano: sangramento do Amaldiçoar Arma, machadadas laterais/cruzadas, especial e o giro.

## v2.3.2 — Equilíbrio: rápidos e pesados

### Equilíbrio (CPU × CPU, 75 s)
- `stats.attackSpeed` (novo, `characters/index.js` → `applyAttackSpeed`): divide `dur`, `active`/`actives`, `iframes` e
  `motion.t` de todos os golpes físicos; a animação acompanha (toca com a duração do golpe). Ágeis: Joui/Aghata/Erin
  1,12–1,18, Xande 1,1, Gal 1,1, Kian 1,14, Labirinto 1,08, Dante/Kaiser 1,06; Juan 0,92; pesados 1,0.
- Pesados com mais vida: Lírio 1350, Ferreiro 1250, Aguiar 1150 (1200 deu 71%, 1100 deu 36%).
- Juan: velocidade 8,1 → 7,6; `lifesteal` 0,15 → 0,10; `masochist` 0,12 → 0,08; sangramento do Banho de Sangue 5/s·2,5 s
  → 4/s·2 s e da meia-lua 3 → 2/s; Vínculo 0,4 → 0,3; `bloodHardens` 220 → 400, a armadura automática dura
  `autoDuration` 0,6 e põe a habilidade na recarga inteira (era a causa: 82% mesmo depois dos outros cortes).
- Gal: Velocidade Mortal (R2 + △, `selfBuff` ×1,3) e `meleeDrain.giveEnergyToAttacker: true`.
- Medições: rodada geral (1 luta por par) Aguiar 71 · Juan 71 · Kemi 61 · Joui/Ferreiro 57 · Kaiser 54 · Xande/Lírio 50 ·
  Dante/Erin 43 · Arthur/Labirinto 39 · Aghata/Kian 32 · Gal 29. Depois dos ajustes: Juan 61% (56 lutas), Gal 41% (56),
  Kian 54% (28), Aghata 39% (28).

## v2.3.1 — Interface e carregamento

### HUD e carregamento
- `.ab .n` com `line-clamp: 2` + `overflow-wrap: break-word`; classe `long` (8,5 px) para nome > 18 letras ou com palavra > 10 letras; `title` com o nome inteiro (`HUD.js`).
- `vite.config.js`: `manualChunks` → `three` (node_modules/three, ~608 kB) e `personagens` (`src/characters`, `src/anim`, ~144 kB); principal ~488 kB; `chunkSizeWarningLimit` 650 só por causa do three. Testado no build (`vite preview`, porta 3032): carrega e luta sem erros.

## v2.3.0 — Ajustes do TODO

### Lote 1 do TODO
- Santo Berço: `cfg.mist` → `makeMist` (`glbArena.js`): sprites com textura radial (canvas), anel baixo girando (`inner`/`radius`/`swirl`) e `banks` fixos (sobre o labirinto em z ≈ −40); `raycast` vazio (não entra nos raios da câmera); névoa do céu 0,014 → 0,018.
- CPU (`CpuController.produce`): antes de pensar, procura invocação hostil FRACA (`isClone` ou `maxHp ≤ 120`) a < 5 m e mais perto que o rival (ou rival > 4 m): anda até ela e bate (a mira do golpe já escolhe o NPC mais perto). Transportar do Diabo com `ai: { max: 2.2 }`.
- Arthur: passiva `bloodPrice` (`hpPerPoint` 2, `minHealth` 0,15). `Fighter.bloodPrice(cost)` → vida a pagar (0 = sanidade; −1 = não dá) e `payCost(cost, blood)`, usados em `useAbility` e `trySpecial`.
- Diabo: novo tipo `veinChains` (o `bloodBind` continua para Lírio e Fantasma): acerto direto no alcance/arco, `stun` pelo `hold`, 4 correntes `fx.chain` do peito do alvo (segue o alvo) até âncoras fixas no chão a 1,4 m; ticker pingando sangue. `def.drips` + `Fighter.updateDrips` (gotas alternando entre os soquetes das mãos).
- Juan: visual `bloodCrescent` (meia-lua de toro deitada, fio claro) + gotas no caminho (também na Lança); dano 28 → 24 com sangramento 3/s por 1,5 s. Passiva `bloodHardens` (`onHitTaken` acumula `bloodLost`; ≥ 220 → `autoArmor`), ativada em `Fighter.updateBloodShell` com o mesmo buff da habilidade (sem custo; recarga da habilidade vai a ≥ 50%).

### Lote 2
- Aghata: novo tipo `mindSwap` (troca as posições, `stun` + `surprised` e o alvo virado de costas; falha em cinemática/invulnerável) em R2 + ×; Leitura de Rituais em R2 + △ com `selfBuff` (o `selfBuff` agora repassa `takenMult`/`takenKinds`), ×0,6 contra `ability`/`special` por 7 s.
- Aguiar: o `meleeBleed` da máscara vale para `melee` E `ranged` em `damage.js` (antes o machado na corda não sangrava); o `strike.bleed` continua só no corpo a corpo.

## v2.2.0 — O Diabo reformulado (cânone: wiki "O Diabo", habilidades de Hexatombe)

### Poças de sangue (`src/combat/bloodPools.js`, novo)
- `addBloodPool(world, owner, x, z, { radius, life })`: ticker do mundo (some sozinha e no fim do round), contorno de
  respingo determinístico (`splatGeo`, sem `Math.random` — não mexe no sorteio do netplay), até 6 por dono, poça em
  cima de outra só renova/cresce. Atola quem é do outro lado (`bloodPool`, ×0,75). `poolsOf`, `poolAt`.
- Fontes: Lança (onde para, no alvo ou antes da parede), Sangue nos Arredores (`a.pools`), Senhor do Sangue (uma por
  zumbi; o zumbi não desenha mais a própria poça: `noPool`), zumbi morto, Transportar e Pacto.

### Diabo (`src/characters/forms/diabo.js`)
- Lança de Sangue: visual `bloodSpear`; `stick` (fica cravada: o mesh passa a um ticker), `pool`,
  `onHit.impale` (buff `impaled`, velocidade ×0,1). Variações: frente (Lança Cravada 46), lados (Quatro Lanças 4×13
  com passo lateral), trás (recuo 24).
- `devilHate` (novo tipo): buff `enraged` no alvo (`noBlock`, `meleeOnly` + `lockMsg`, `takenMult` 1,2, +10% físico)
  e `hateFeed` no Diabo (+20% dano, ×1,12 velocidade). `Fighter.meleeLocked()` generaliza o "Provocado".
  CPU: `ai: { max: 10 }`.
- `bloodTransport` (novo tipo): poça mais perto do alvo, ou atrás dele; com o alvo a ≤ 2,2 m, arrasta (estado
  `grabbed`, os dois somem) para a poça mais longe (ou uma fenda a ~6 m) e o cospe caído (34 + sangramento).
- `regen.low` (abaixo de 40%: a cada 3,5 s, +34) e `regen.onPool` (relógio ×2 em cima das poças) em `forms.js`.
- Passiva `hatesElement` (Conhecimento ×1,15, "Decepar Máscara").
- Pacto (`specials/devilDeal.js` refeito): cinemática; o Diabo sai na frente do alvo; janela de escolha
  (`sp.choice` 1,6 s) lida no `input` da vítima (○ = `pressed.physical`; Defesa = `held.block` depois de soltar;
  sem escolha = aceita). Aceitar: cura 15%, sanidade cheia, `transtornado` 9 s (sem defesa, ×1,25, drena 9/s e
  metade vai para o Diabo), Diabo +80. Recusar: 3 × 36 sem reação + 70 que arremessa, sangramento 8/s, Transtorno
  4 s. Câmera proporcional a `stats.size`. CPU decide uma vez (`f.pactOffer`; aceita mais com pouca vida).

### Armadura de Sangue (referência: arte do Henri com a armadura)
- `src/models/bloodArmor.js` (novo) — `buildBloodArmor(rig, { weaponSide, yaw })`: peças presas DIRETO nos ossos
  (os ossos crescem no +Y local até o filho; `along()` alinha o −Y da peça com o osso, então acompanha qualquer pose —
  o `rig.attach` copia a orientação do osso NO MOMENTO e ficava torto quando nascia numa pose de guarda). Ombro, peito
  e pés usam um quadro alinhado ao mundo no momento (`worldFrame`) com as direções do personagem (`yaw`).
- Material poroso: furos por células (Voronoi no espaço do objeto, `discard`) com borda escura, carne escura por
  baixo. Lado esquerdo: manga no braço/antebraço, punho, ombro com espinhos, placa e veias no peito, coxa e canela
  (por cima da calça); garras nos dois pés.
- Quem conjura (`a.bloodArm: { side, meleeMult }`, só o Juan, braço da faca): manga porosa no antebraço, mão de
  sangue e `bloodCoat` na faca; +25% físico (`bloodArmBuff`). Assistência do Juan: `takenKinds: ['melee', 'ranged']`.
- `bloodCoat` não pinta mais malhas transparentes/escondidas (o halo da faca virava uma bola vermelha).
- A casca no corpo inteiro (`bloodShell`) saiu (ficou feia).

### Equilíbrio (`runBalance` com `g.quick` envolvido para transformar o Juan no começo de cada luta)
- Diabo desde o 1º round, 28 lutas: 86% → 82% (Lança `bleed` 4/s·2 s → 3/s·1,5 s, `selfMult` 1,2 → 1,15,
  `lifesteal` 0,12 → 0,08) → 75% (`stats.maxHealth` 1250 → 1150). Dante 46% (28 lutas), Juan base 64% (56 lutas).

### Arthur
- Armadura de Sangue removida (não está nos rituais/habilidades dele na wiki); no △ + L2 entra **Analisar Brecha**
  (cânone, Desconjuração 40%): tipo `analyze` com `buffType: 'brecha'` e `takenKinds: ['melee']` (×1,25, 7 s).
  `analyze` passou a aceitar `buffType`/`takenKinds`.

### Outros
- Passo da defesa: `COMBAT.dash.step` (3,4 m / 0,18 s); em `updateBlock`, toque saindo do neutro (`blockStickPrev`).
- Poça de Lodo: `mist.pool` → mancha no chão (MeshStandard brilhante, `splatGeo`) com bolhas; fumaça a 20%.
- NPCs: `riseTime/risePose/vanishPose` (Zumbi rasteja para fora e derrete ao morrer), `scytheTrail` (ponta da foice
  no chão), mash para soltar o agarrão da Marionete (−0,15 s por toque).
- CRLF: arquivos editados por script no Windows voltaram para LF (o repositório é LF).

## v2.1.0 — Marionete e Zumbis de Sangue refeitos

### Modelos das invocações (Blender, `tools/blender/npc_*.py` → `public/npcs/*.glb`)
- Novo tipo `npc_` no `build.mjs` (sai em `public/npcs`); `*_lib.py` são bibliotecas e não viram modelo.
- `npc_lib.py`: ajudantes de peças rígidas (tubo por curva com transporte paralelo, Bézier, anel de corda, elipsoide,
  cone, fita) e juntas (empties `J_*`); `finish()` junta as peças de cada junta numa malha `P_*`.
- `npc_marionette.py`: crânio com mandíbula (`J_jaw`) aberta por fios, cabelo (`J_hair`) com a frente livre, foice de
  ossos no `J_handR`, garra no `J_handL`, estacas, vestido em tiras, Lodo com brilho. Sem cruzeta (fios invisíveis).
- `npc_zumbi_lib.py` + `npc_zumbi_sangue.py` (fraco, magro, cabeça-boca para cima) e `npc_zumbi_sangue_forte.py`
  (massa de músculo, trapézio enorme, cabeça afundada). Saem em pé e retos: a postura vem do jogo.
- `src/models/npcRig.js`: carrega os GLB junto com os personagens (`preloadNpcModels`), converte para toon e põe
  contorno por normal. **Correção:** o contorno era adicionado durante o `traverse` e o `traverse` o visitava de novo
  (recursão sem fim) — agora a lista de malhas é juntada antes.
- `src/models/bloodZombie.js`; `marionette.js` usa o GLB e mantém o provisório (`buildMarionetteProcedural`) como
  reserva.

### Comportamento (`src/combat/npcs.js`)
- `Marionette` generalizada (`configFor`, `buildModel`, `restY`, `pickAttack`, `stepSpeed`, `swingFx`, `bob`) para os
  Zumbis herdarem. Pose de marionete (`posePuppet`) com ruído em degraus (`jerk`, sem `Math.random`: não mexe no
  sorteio do netplay); a pose antiga ficou em `poseLegacy` para o modelo provisório.
- Movimentos Desconexos (passos aos trancos, média 3,6 m/s), Momento Passivo (colisão só com os limites:
  `this.bounds`), Reflexos Perfeitos (`reflex` < 1,6 m), Ironia do Destino (`irony`: cortes em 0,35 s e 0,62 s,
  agarra em 0,82 s → estado `drag` por até 1,1 s, solta com 26 de dano e derrubada; `hitBy` repassa 50% do dano para
  quem está preso com `reaction: false`). `special` (giro) saiu. Traição × 0,4 contra adversário de Energia.
- `BLOOD_ZOMBIE.weak` (90 de vida, 5,2 m/s, garra 12 / mordida em investida 20) e `.strong` (260, 4 m/s, garra 24,
  pancada 42 que derruba, mordida 30). Leais; agachados com os pés no chão (`restY` pela dobra das pernas).
  `isMarionette` agora é só da Marionete (o Zumbi herdava e mostrava a barra preta e bloqueava o especial do Dante).
- `summonBlood` (`abilities.js`): sorteia uma horda de `a.hordes` (`diabo.js`: [f], [f, f], [f, f, f], [f, F, f]) em
  leque do lado do Diabo; uma horda por vez.

### Outros
- `src/ui/portraits.js`: o canvas reaproveitado não era limpo entre personagens — o retrato anterior aparecia atrás
  (fundo semitransparente embaixo). `clearRect` antes de desenhar.
- `npcs.html` + `src/dev/npcView.js` (só no dev): as três invocações lado a lado, com cada golpe em loop e parâmetros
  de câmera/pose na URL (`#focus=0&mode=heavy&at=0.55`).

## v2.0.0 — reanálise geral, recuperação e correções

### Recuperação do histórico
- O commit `29f1170` ("improve mobile play") partiu de uma cópia antiga (`aa0b93d`) e desfez os IDs novos, as 420
  introduções, as vitórias variadas e os valores da Fantasma. Reconstruído a partir de `da2771b` + só a parte mobile do
  `29f1170` + os commits seguintes (`9541e7f`, `5d529c3`, `4fe62ee`), num commit novo (sem reescrever o histórico).
- Uma segunda reversão acidental (12 arquivos antigos gravados às 03:45 por cima do HEAD) foi guardada com
  `git stash` ("reversao acidental 03:45") e não entrou no commit.

### Tela de vitória (`src/game/World.js`, `src/main.js`, `src/ui/Screens.js`)
- `layoutVictoryLineup`: centro na posição do vencedor; câmera testa 16 direções × 4 distâncias com linha livre
  (`arena.blocksPoint`) e sem bloco grande no caminho (raio contra `arena.solids`), preferindo olhar para o meio da
  arena; espaçamento calculado pela largura visível; vencedor no centro e equipe alternando dos lados.
- Nomes da equipe projetados sob cada modelo (`placeVictoryLabels`, refeito no resize).
- Poses próprias em `src/anim/victoryClips.js` (`vic_*`), ligadas em `anims.victory` de cada personagem.

### Interface
- Seleção (PC): ficha com uma linha por habilidade (`.abl` com reticências), especial antes das habilidades, estilo
  em até 2 linhas. Classe `.ab` evitada (colidia com os botões da HUD).
- `specialSummary` em `src/ui/moves.js` usado na seleção, em COMANDOS e no gerador do HABILIDADES.md.
- COMANDOS: `.content` rolável e ▲ ▼ rolam pelo controle.
- Online: `font: … inherit` inválido trocado por propriedades separadas nos campos.

### Mobile (`src/styles.css`, `src/ui/touchControls.js`, `src/main.js`, `src/ui/Screens.js`)
- Altura ≤ 520 px: `.hopt` compacto e logo oculto com o menu aberto (a regra antiga mirava `.menu-home .opt`).
- Altura ≤ 520 px e largura ≤ 760 px: grade 5 × 3, retrato com foco no rosto, lados opacos e sem render 3D da
  seleção (`PHONE_LANDSCAPE` em main.js).
- `touch.sync(..., scene)`: classe `scene` esconde `.t-fight` durante `entrance`/`dialogue`; toque fora dos botões
  vira × (pula). Botão de tela cheia oculto em `.fighting`. Textos de toque no título (`touchOnly`).

### Desempenho (`src/camera/CameraRig.js`)
- `updateOcclusion` e `avoidSolids` a 10 Hz (distância livre guardada entre as checagens): simulação de ~1,9 para
  ~0,45 ms por quadro (CPU × CPU, Orfanato/Santo Berço/Suvaco).

### Equilíbrio
- Rodada geral (210 lutas, CPU normal, 60 s, melhor de 3): Kaiser 75% e Gal Sal 25% fora da margem (±18).
- `gal_sal.js`: `heal` × 0,6 em todos os golpes → 46% (28 lutas). `kaiser.js`: Jab 20, Direto 23, karambit 30, Chute
  giratório 56 (combo 194) → 63% (56 lutas). Tabela completa no TODO.md ("Estado na v2.0.0").

### Validação
- `npm run check`, `npm run build`, `npm run audit`, `npm run moves`.
- Navegador: fluxo completo no PC (título → menu → seleção → configurações → cenário → apresentação → luta → vitória
  solo e equipe em Suvaco, Santo Berço e Ruínas), pausa → comandos, tutorial, online; celular deitado (740 × 360 com
  toque emulado) do título até a luta; retrato pede para girar.

## Correção da tela de vitória
- Restaurada a formação 3D da equipe vencedora sobre a arena da luta; a versão anterior mostrava um retrato recortado em um fundo separado.
- `src/game/World.js` posiciona e anima os modelos de vitória no cenário e ajusta a câmera ao redimensionar.
- `src/ui/Screens.js` e `src/styles.css` exibem texto e opções sem cobrir a arena; a HUD de combate é ocultada no resultado.
- Validação: `npm.cmd run build`, `npm.cmd run check` e simulações no navegador confirmaram a arena e os modelos em vitórias solo e em equipe.

## v1.6.0 — melhorias mobile e navegação
- Registro público correspondente adicionado a `CHANGELOG-CLIENTE.md`; as entradas v1.5.0 e v1.4.0 foram preservadas.
- `src/config/version.js` passou a anunciar a versão 1.6.0, com as novidades v1.6.0, v1.5.0 e v1.4.0 também disponíveis no menu do jogo.

## Interface responsiva sem rolagem
- As telas `.screen`, a página e o documento bloqueiam rolagem e overscroll.
- Seleção de personagens e cenários usam grades e espaçamentos responsivos; em telas baixas, previews e textos secundários são reduzidos.
- A caixa de comandos não rola; menus e novidades usam espaçamento e tipografia compactos em viewports baixos.
- Uma seta no canto superior esquerdo permite voltar das telas internas por toque; os atalhos existentes continuam funcionando.

## Controles touch e navegação
- O HUD de combate virtual só é exibido no estado `fight`; os menus não recebem direcional nem botões virtuais de confirmar.
- As opções e cartões de personagem/cenário continuam acessíveis por toque/clique direto; o changelog tem botões touch para trocar de versão.
- Menus touch exibem a seta de voltar quando aplicável e a opção de fullscreen.
- A opção local P1 vs P2 é ocultada nos modos solo e equipe em dispositivos touch.
- A interface touch bloqueia o modo retrato com um aviso para girar o dispositivo.
- O viewport desativa zoom e os gestos de pinça do Safari são prevenidos.
- Foi incluído um botão de fullscreen com atualização de estado, tratamento de erros e aviso quando a API não está disponível.
- As instruções de teclado/PC são ocultadas em dispositivos touch e substituídas por orientações de toque na tela inicial.

## Texto público
- Os textos do changelog exibido no jogo foram reescritos em linguagem voltada a jogadores, removendo contagens, nomes de estruturas internas, ferramentas e detalhes de implementação.
- `CHANGELOG-CLIENTE.md` contém a versão pública e o histórico de novidades para jogadores.
- Este arquivo administrativo registra as alterações de implementação e validação desta entrega.

## Arquivos de implementação
- `index.html`: bloqueio de zoom via configuração do viewport.
- `src/main.js`: detecção compartilhada de dispositivo touch e prevenção de gestos de zoom no iOS.
- `src/ui/touchControls.js`: visibilidade dos controles por estado, botão fullscreen e aviso de orientação.
- `src/ui/Screens.js`: menus adaptados a touch; ações de navegação na seleção de cenários.
- `src/styles.css`: layouts compactos e sem rolagem para telas, menus, seleções e comandos.
- `src/config/version.js`: linguagem simplificada nas novidades exibidas dentro do jogo.

## Validação
- `npm.cmd run build` — concluído; Vite reporta o aviso já conhecido de bundle acima de 500 kB.
- `npm.cmd run check` — verificações de elenco, diálogos e nomes concluídas.
- `git diff --check` — sem erros de whitespace.
- Testes no navegador confirmaram a orientação obrigatória em retrato, menus sem controles de combate, toque direto nas opções e P1 vs P2 local disponível no desktop, mas não em touch.
- Medições no navegador confirmaram que a seleção de cenários cabe na viewport em desktop e paisagem mobile sem sobreposição.
