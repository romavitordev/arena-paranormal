# Registro administrativo de alterações

## v2.3 — Ajustes do TODO

### Lote 1 do TODO
- Santo Berço: `cfg.mist` → `makeMist` (`glbArena.js`): sprites com textura radial (canvas), anel baixo girando (`inner`/`radius`/`swirl`) e `banks` fixos (sobre o labirinto em z ≈ −40); `raycast` vazio (não entra nos raios da câmera); névoa do céu 0,014 → 0,018.
- CPU (`CpuController.produce`): antes de pensar, procura invocação hostil FRACA (`isClone` ou `maxHp ≤ 120`) a < 5 m e mais perto que o rival (ou rival > 4 m): anda até ela e bate (a mira do golpe já escolhe o NPC mais perto). Transportar do Diabo com `ai: { max: 2.2 }`.
- Arthur: passiva `bloodPrice` (`hpPerPoint` 2, `minHealth` 0,15). `Fighter.bloodPrice(cost)` → vida a pagar (0 = sanidade; −1 = não dá) e `payCost(cost, blood)`, usados em `useAbility` e `trySpecial`.
- Diabo: novo tipo `veinChains` (o `bloodBind` continua para Lírio e Fantasma): acerto direto no alcance/arco, `stun` pelo `hold`, 4 correntes `fx.chain` do peito do alvo (segue o alvo) até âncoras fixas no chão a 1,4 m; ticker pingando sangue. `def.drips` + `Fighter.updateDrips` (gotas alternando entre os soquetes das mãos).
- Juan: visual `bloodCrescent` (meia-lua de toro deitada, fio claro) + gotas no caminho (também na Lança); dano 28 → 24 com sangramento 3/s por 1,5 s. Passiva `bloodHardens` (`onHitTaken` acumula `bloodLost`; ≥ 220 → `autoArmor`), ativada em `Fighter.updateBloodShell` com o mesmo buff da habilidade (sem custo; recarga da habilidade vai a ≥ 50%).

## v2.2 — O Diabo reformulado (cânone: wiki "O Diabo", habilidades de Hexatombe)

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

## v2.1 — Marionete e Zumbis de Sangue refeitos

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

## v2.0 — reanálise geral, recuperação e correções

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
  giratório 56 (combo 194) → 63% (56 lutas). Tabela completa no TODO.md ("Estado na v2.0").

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

## v1.9 — melhorias mobile e navegação
- Registro público correspondente adicionado a `CHANGELOG-CLIENTE.md`; as entradas v1.8 e v1.7 foram preservadas.
- `src/config/version.js` passou a anunciar a versão 1.9, com as novidades v1.9, v1.8 e v1.7 também disponíveis no menu do jogo.

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
