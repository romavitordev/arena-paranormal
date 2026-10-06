# Registro administrativo de alterações

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

## (em andamento, sem versão nem changelog dos jogadores) — Arnaldo Fritz → O Anfitrião e Senhor Veríssimo

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
