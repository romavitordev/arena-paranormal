# Registro administrativo de alterações

## v3.50.0 — Chamas e Sinais

- Versão: `VERSION` 3.49.0 → **3.50.0** (package.json/lock junto). Data: 2026-10-27. Reúne os commits 8f2c89a (retratos) e 6b5ef7c (chamas) e o Estrangeiro.
- **Página Sobre:** faltavam 5 retratos (ids novos desde a v3.39); os 33 foram renderizados de novo dos modelos atuais. O Deus da Morte ganhou a câmera mais afastada (enquadramento × 1,35). Conferido: nenhuma imagem quebrada; filtro com a Ordo Calamitas.
- **Celestine (pedido do dono, pelas miniaturas da wiki):** chamas turquesa no corpo e no cabelo. Conferidas na luta, na seleção e no retrato; o turquesa foi escurecido porque as chamas somadas estouravam para o branco.
- **Estrangeiro (pedido do dono):** ajustado pela arte do Livro de Regras e pela miniatura de Sinais do Outro Lado; depois, também a pedido do dono, ROSTO refeito do zero (máscara esculpida pela miniatura, de perto) e POSE PARADA própria (`est_idle`; antes usava a agachada do Diabo). Conferido no jogo de perto e de longe e no retrato.

## v3.49.0 — Celestine e a Máscara do Desespero

- Versão: `VERSION` 3.48.0 → **3.49.0** (package.json/lock junto). Data: 2026-10-27. Reúne os commits 557eb3e, fa60ee0 e fe06547.
- **Pesquisa na wiki (pedido do dono):** faltava uma Portadora de Conhecimento e a transformação da Magistrada não era canônica. Plano registrado no TODO ("Distribuição pelo cânone").
- **Magistrada:** Reescrever a Realidade testado (vida 450 → 987, sanidade 100, sangramento limpo, recargas zeradas, buff do adversário apagado); Conjuração Verdadeira (Olhar 25 → 19); Destronar o Anfitrião (127 de dano contra 94 no Kaiser).
- **Celestine (pedido do dono: Ordo Calamitas, que vira a Magistrada com os mesmos poderes e outra aparência):** testada no jogo — combo 154, □ puxa até 1,5 m e a machadinha volta, as 4 habilidades, especial 245, Transformação com a Máscara e as machadinhas; CPU × CPU contra a Magistrada sem erro. Fica nos Portadores logo depois do Ferreiro (pedido do dono); o grupo Ordo Calamitas recebe Gaius, Amalia, Cornelius depois. Pendente: retrato da página Sobre.
- **Equipes duplas (pedido do dono):** Celestine, Arnaldo (Aniquiladores, Ordo Realitas), Henri (Escripta da Desconjuração) e Juan Portador (Mascarados). Luzidios removida (o dono: a equipe não existe no jogo).
- **Seita das Máscaras:** modelo próprio conferido no jogo de perto (túnica branca predominante, faixas pretas, forca e cinto de corda colados ao corpo, as máscaras 3D por membro).
- **Retratos:** o Anfitrião e o Deus da Morte da seleção saíam sem a cor das Relíquias (o retrato de vilão das Torres, com o mesmo id, era gerado depois) — corrigido.

## v3.48.0 — Portadores e Relíquias

- Versão: `VERSION` 3.47.0 → **3.48.0** (package.json/lock junto). Data: 2026-10-27. Inclui o commit do dono "3.48.0 snapshot 1 teste" (09fb45e: equipes, Henri, Arma de Sangue no antebraço, selos da tela inicial).
- **Equipes (pedido do dono):** Portadores ≠ Relíquias. Portadores: Juan (forma `juan_odio`, selecionável), Arnaldo, Ferreiro. Relíquias: O Diabo, O Deus da Morte (selecionável), A Magistrada, O Anfitrião (selecionável). Outro Lado: Estrangeiro e Amigo. Henri (id `juan`) nos Mascarados. As formas selecionáveis usam as falas do personagem base e ficam fora das regras do elenco base (vida igual, especial 250, transformação obrigatória).
- **Arthur:** Arma de Sangue cobrindo o antebraço (`bloodForearmBlade`), conferida no jogo.
- **Kaiser:** Foto com Flash (← + □, energia 15, recarga 12 s, cega 2 s) — testado: olhando cega; de costas e esquivando escapa; a karambit volta depois.
- **Ferreiro:** 50% de chance de um Manancial ficar a ~6 m arremessando Lodo que tira 12 de sanidade — testado (5–6 m, "−12 SANIDADE").
- **CPU — inteligência única:** `kitProfile` + `matchupPlan` (os dois kits). Validado em 10 confrontos (5 sorteados), sem erro. Melhor: Kaiser × Dalmo 2,5 → 4,3 m; Arthur × Kian 6,2 m; quem enfrenta atirador pressiona e ganha. Pendente (TODO): atirador × perseguidor rápido com as duas CPUs ainda fica perto (~2 m).
- **Botão do Anfitrião:** a CPU corre e aperta primeiro (Fácil e Difícil, ~3 s com a contagem).
- **TODO (para depois):** modelos da Magistrada (e máscaras), do Estrangeiro (e os "soldados" alheios de terno com metralhadora) e do Amigo; transformação canônica do Estrangeiro; skin própria do Anfitrião do Arnaldo.

## v3.47.0 — Menus e Combos

- Versão: `VERSION` 3.46.0 → **3.47.0** (package.json/lock junto). Data: 2026-10-27. A troca de versão também renova o cache de modelos do service worker (`arena-arquivos-<versão>`): sem ela, quem já tinha a v3.46.0 continuava vendo os Mananciais antigos.
- **Menu principal:** seções LUTAR / PRATICAR / JOGO, opção OUTRO LADO com EM BREVE e aviso (pedido do dono: o PvE fica só a opção com o popup por enquanto); cartão de descrição ao lado; testado no teclado (Enter, ▼×4, Enter abre, Esc fecha) e em 375×812.
- **Torneio:** visual novo; LUTAS DA CPU (sorteio / rodar / assistir) testadas: RODAR — a luta corre a 10× atrás do painel e volta à chave com "CPU 1 VENCEU"; ASSISTIR — a final CPU × CPU na tela; PULAR → sorteio. Correção da navegação das regras pelo controle.
- **Combos:** limite de 3 s / 12 acertos (`comboBreak`); CPU usa a Substituição em combo longo. Bateria de 10 partidas CPU × CPU do Raziel contra 5 perfis: hitstun máximo caiu de ~7 s para ~3,5 s na maioria, 0–12 escapes por partida, sem erro.
- **Raziel balanceado:** roubo de vida 0,08 → 0,05 (forma 0,2 → 0,14), Bote 92 → 84: de 9/10 para 6/10 vitórias na mesma bateria.
- **Mananciais refeitos** (commit 162d942, entram nesta versão).
- **Animações (1ª leva):** `strikePolish.js` em 15 golpes genéricos; validado (sem NaN, cotovelos/joelhos sem inverter, acerto no mesmo instante).

## v3.46.0 — Sede Incontrolável

- Versão: `VERSION` 3.45.0 → **3.46.0** (package.json/lock junto). Data: 2026-10-26.
- **Revisão do v3.45.0 (feito por outra IA):** dois `hideRangedProps` no `Fighter.js` — o segundo, declarado depois, sobrescrevia o primeiro e perdia o `propLock` (maça do Machado Demônio do Balu). Juntados num só que usa `activeRanged` e mantém o `propLock`. O `CHANGELOG.md` técnico não tinha a v3.45.0: entrada incluída.
- **Raziel — plano RZ-01 a RZ-09 (TODO §2.5):**
  - RZ-01 Turno Extra: passiva `extraTurn` (finalizador → janela de 2 s; a próxima habilidade não entra em recarga; recarga interna 10 s, zera no round).
  - RZ-02 Sede Incontrolável: `thirst` no Devorar (alvo < 30%: +1,6 m de bote, ×1,4, dreno 100%); prioridade na CPU só com o alvo no alcance.
  - RZ-03 Banquete Bestial com roteiro próprio no `cinematicCombo` (+ opção `gore`), `endReaction.lowLaunch`.
  - RZ-04 □ Rasgo de Sangue (projétil sem base na ficha) → Vulto Retalhador (`dashStrike` 10 m, `bleed`, `aiRange`).
  - RZ-05 Maldição Sanguínea: 6 s, +10% dano recebido, gotejamento com `onEnd`, renova sem acumular.
  - RZ-06 Endurecer Sangue: crosta `bright`; testado −40%, 3 golpes de armadura, agarrão ainda pega.
  - RZ-07 forma com kit próprio: Língua (`tongueLash`, `unblockable`), Vulto Bestial, passiva `predator`.
  - RZ-08 Afinidade com Sangue: `elementalAffinity` ganhou `element` e `resist` (Kaiser/Nubi sem mudança).
  - RZ-09: 10 partidas CPU × CPU contra 5 perfis, sem erro/NaN/cena travada. Para o balanceamento: Raziel venceu 9 de 10; combos longos (5–7 s de hitstun) no motor.
  - Barra `hb-vampire` na forma verdadeira.
- **Auditoria 3.1 Arthur (TODO §3.1):** Templo do Ódio com `noRituals` (cânone: o afetado não conjura rituais); `ritual: true` em Rebirth, Templo, Dystopia e Arma de Sangue; Olhos Sempre Abertos com `bloodAffinity` (rituais de Sangue sem custo de vida, cânone de Calamidade); comentário das mechas brancas corrigido; check dos cortes de um braço da Arma de Sangue.
- **Testes:** `tests/raziel.test.js` (5); check com Raziel (Turno Extra, Afinidade) e Arthur (rituais, afinidade, um braço).

## v3.45.0 — Banquete de Sangue

- Versão: `VERSION` 3.44.0 → **3.45.0** (package.json/lock junto). Data: 2026-10-26.
- **Novo Personagem: Raziel (`src/characters/raziel.js`)**:
  - Nova equipe jogável **Vampiros** (tema vermelho-sangue).
  - Modelo 3D (`public/models/raziel.glb` via `char_raziel.py`): casacão escuro até o chão com forro e gola alta vermelha, dragonas com franjas, jabô com pedra vermelha, laços e correntes, cabeça descarnada sem olhos com o estigma da Coroa de Espinhos, dentes pontiagudos e garras longas.
  - Kit canônico:
    - Bote Retalhador com mecânica de raspão (`grazeOnDodge`: quem esquiva ainda leva metade do dano);
    - Mordida Vampírica (`vampireBite`: aproximação, agarra, desfere duas mordidas e cura vida);
    - Endurecer Sangue (crosta de sangue que reduz o dano sofrido);
    - Maldição Sanguínea (`bloodCurse`: debuff `ABALADO` reduzindo ataque e defesa do alvo);
    - Rasgo de Sangue (□) e passiva Turno Extra.
  - Especial: **Banquete de Sangue** (investida veloz, agarrão e mordida com drenagem de vida e fala canônica).
  - Transformação: **O Verdadeiro Raziel** (`forms/raziel_verdadeiro.js`): o mesmo `.glb` com troca de peças (`prop_up` off, `prop_true` on) exibindo costelas abertas, braços descarnados até o osso e língua bestial; mobilidade aprimorada, sede incontrolável, Devorar e Banquete Bestial.
  - Falas de intro contra Cristino, Juan, Jae, Labirinto e Dalmo; falas de vitória contra todo o elenco.
- **Novo Cenário: Igreja Antiga (`public/arenas/igreja.glb`, id `igreja`)**:
  - Interior gótico da Igreja de Sangue de Hexatombe (ep. 9 "Banho de Sangue").
  - Arquitetura com nave de pilares entalhados, arcos ogivais, vitrais vermelhos iluminados pela lua de sangue.
  - Altar com retábulo dourado e trono, Serafim Vermelho decapitado, Dama da Culpa com o leque de espinhos e pedra de sangue, símbolo de Sangue entalhado no lugar da cruz, porta trancada com correntes e cadeado, mesa do banquete macabro (toalha manchada, candelabros, taças), anzóis e névoa da Membrana.
- **Skate Caótico no Projétil do Xande**:
  - `VISUALS.skate` em `src/combat/projectiles.js` atualizado para clonar dinamicamente o modelo 3D atual do skate (`owner.rig.props.skate` ou `chaosSkate()` com mesh GLB detalhado, lâminas curvas, rodas vermelhas com espinhos e runas verdes do Caos), sem recorrer à geometria primitiva em caixa antiga.
  - O skate é ocultado da mão ao ser arremessado (`hideProp: 'skate'`) e restaurado ao retornar (`returnsProp: 'skate'`).
  - Salvaguarda na montaria (`mount(on)` em `Fighter.js` impede subir no skate enquanto ele estiver em voo/arremessado).
  - Implementado o método `hideRangedProps()` e registro de `activeRanged` em `Fighter.js`, garantindo limpeza e restauração de props em ataques à distância e charge shots.
- **Testes Unitários**:
  - Criado `tests/team-links.test.js` cobrindo o detector de ligações de equipe (*Mascarados*, *Força D*, *Cristopher + Kaiser*) e as propriedades de arremesso do *Skate Caótico*.
- **Planejamento no TODO**:
  - Incorporado o **Capítulo Complementar de Auditoria de Fidelidade ao Cânone** (§2.5) com plano de refinamento do Raziel (RZ-01 a RZ-09) e auditoria sistemática de todos os 28 personagens do elenco (§3.1 a §3.30).
  - Adicionada a meta de melhoria geral de todas as animações (§2.1) com base em referências de jogos de luta e animes.

## v3.44.0 — Laços de Equipe

- Versão: `VERSION` 3.43.0 → **3.44.0** (package.json/lock junto). Data: 2026-10-26.
- **Limpeza do projeto** (pedido: começar pela limpeza): varredura de código morto em todo `src`; build voltou a sair sem
  aviso; versão compilada testada (menu → seleção → cenário → luta, galeria).
- **F4 — Especiais em Equipe com ligação**: as três ligações e a tela da seleção. Pedidos durante o trabalho: o trio
  Joui/Kaiser/Arthur não é a Equipe Abutres (essa é de Calamidade, sem o Kaiser) — virou **Força D** (Desconjuração,
  conferido em `lore/`), com Thiago e Liz previstos; vão existir **várias versões do mesmo personagem** e especiais com
  membros em comum → entradas por versão (`baseId`) e regra de desempate. Testado no jogo: as três ligações, a equipe
  sem ligação e casos de versão com ligações de teste.
- **2.1 — Animações** (pacote aprovado pelo dono): Quaternius Universal Animation Library Standard (CC0, License.txt
  conferido), baixado de quaternius.itch.io e guardado em `assets_src/` (fora do git). Corrida, caminhada e queda
  trocadas; a reação a golpe do pacote foi comparada na tela e ficou a antiga (fraca demais para luta).
- **2.4 — Câmera de cutscenes**: transições, recuo no cenário e saída sem pulo; medido quadro a quadro nos especiais
  dos 28 personagens (maior salto 5,2 m → ~1 m).
- `npm run check`, `npm test` (43) e `npm run build` passando.

## v3.43.0 — Escrita e Raios

- Versão: `VERSION` 3.42.0 → **3.43.0** (package.json/lock junto). Data: 2026-10-26.
- **Animações próprias** (pendente do feedback de Kian e Joui: os kits novos usavam clipes emprestados): 6 clipes em
  `src/anim/powerClips.js` ligados ao Shi no Kage, Portal das Sombras, Suspender, Lâmina do Medo e à transformação do Kian.
- **Cena da Escrita** do Realizador da Calamidade: os sigilos sobem pelo corpo. Os tickers do mundo param na cinemática,
  então a lógica ficou na timeline (`tl.each`).
- **Leonora** remodelada no Blender pela arte oficial ("Marreta de Lírio em Sinais do Outro Lado"), revisada em 4 vistas;
  testada no jogo (orientação, escala e a maldição do Xande continua pegando).
- **Efeito de Energia** (pedido: "energia deveria ter raios e eletricidade em volta como efeito"): `energyHitFx` no
  `applyHit`. O `fx.lightning` (linhas de 1 px) não aparecia; os raios são feitos de segmentos grossos de `tracer`.
- Testes: partidas CPU × CPU sem erro, golpes de Energia conferidos na tela. `npm run check`, `npm test` (43) e
  `npm run build` passando.

## v3.42.0 — Sombra da Morte

- Versão: `VERSION` 3.41.0 → **3.42.0** (package.json/lock junto). Data: 2026-10-26.
- **Feedback do Vitor (TODO, 25/10/2026) sobre Kian e Joui**: auditoria primeiro (`docs/AUDITORIA-KIAN-JOUI.md`, wiki:
  Kian, Rituais, Joui Jouki, A Magistrada), depois a implementação. Decisões e pedidos durante o trabalho:
  - Rejeitar Névoa pelo texto do ritual (conjuração contínua no raio); vale contra todos; Kaiser preservada.
  - Kian transformado: nome **"Realizador da Calamidade"** (pedido: o nome "Kian de Calamidade" estava ruim; título
    canônico "destinado a realizar a Calamidade" / tema "Realizador da Calamidade") e kit próprio. Pedido "as habilidades
    devem ser realmente melhores, não só %" → cada uma conferida contra a versão normal e com função nova.
  - Joui transformado = fase final contra o Kian (pedido: "a transformação pode usar a katana Shi no Kage"), sem os
    poderes da máscara; **Decepar** como o do Cristino (pedido); ultimate diferente e mais forte na forma (pedido);
    a forma ficava mais fraca que o normal com o Tomado pelo Ódio → cortes +20%, ordem igual e velocidade maior
    (medido: Balu 144 / 180 / 182, Kian 159 / 197 / 203).
  - Joui mascarado: habilidade dos poderes da máscara sem a cena de pôr a máscara (pedido); nome **"Tomado pelo
    Ódio"** (do dono). Portal das Sombras canônico no lugar do Corte das Sombras.
- Arthur: Rebirth de volta ao **verde** (pedido: "são verdes, mudaram na HQ — cânone real").
- A cura que envelhece não deixa mais o cabelo branco em **ninguém** (pedido); o cabelo branco fica só no Guizo velho e
  no envelhecimento do Deus da Morte (outro código, intocado).
- **Modelos velhos na v3.41.0** (pedido: "a 3.41.0 não está com os modelos novos"): o service worker guardava os `.glb`
  num cache sem versão (`arena-arquivos`) e nunca apagava → agora `arena-arquivos-<versão>`; no PC o Electron limpa o
  cache e os service workers quando a versão muda. Os pacotes da v3.41.0 foram gerados do commit certo (5512bd4).
- Testes no jogo: transformação e volta (máscara, katana, Relíquia), cada habilidade nova, interrupção da conjuração,
  Kaiser, ultimate (~250 × ~180, ~5,4 s), e 12 partidas CPU × CPU (difícil) sem erro nem estado preso. `npm run check`,
  `npm test` (43) e `npm run build` passando.

## v3.41.0 — Lâmina de Sangue

- Versão: `VERSION` 3.40.0 → **3.41.0** (package.json/lock junto). Data: 2026-10-26.
- **Arma de Sangue no braço certo** (pedido: "o arthur estava colocando a arma de sangue no braço que ele não tem. Era
  pra ser no braço que ele tem, e nem estava usando esse braço pra bater na animação, apenas chutava"): o braço de sangue
  no ombro esquerdo (`claw`, `bloodArm`) saiu do Arthur; entra a lâmina `bloodBlade` no punho direito, e a habilidade
  troca o físico pela sequência de cortes (`a.melee`) enquanto dura — testado: cortes saem, 128 de dano em 3 golpes na
  Kaiser, e no fim volta ao "Combate de um braço" com a lâmina escondida. O físico normal do Arthur passa a ter o soco
  de direita (`onearm_punch`) e a cotovelada (`onearm_elbow`) entre os chutes.
- **Arthur e Joui remodelados no Blender** (o pendente da v3.39.0): os dois scripts reescritos na técnica atual e
  revisados pelo MCP em 4 vistas contra as miniaturas de Calamidade. Arthur: colete fechado (cava só do lado direito,
  o esquerdo fecha porque não tem braço), a calça subindo até o cinto, bolsos colados na coxa, barba e bigode refeitos
  pela altura da boca, o cabelo cobrindo as orelhas. Joui: casaco de cima a partir do tronco + a saia longa com dobras e
  o forro vermelho recuado (não vaza), mangas até o cotovelo, capuz, a risca no meio do cabelo (metaball negativa) e a
  nuca raspada; as duas máscaras (`prop_maskOn`/`prop_maskSide`) seguem como antes.

## v3.40.0 — Peso e Pelo

- Versão: `VERSION` 3.39.0 → **3.40.0** (package.json/lock junto). Data: 2026-10-25.
- **Balu e Lírio remodelados no Blender** (pedido: "Balu e Lirio precisam de remodel agora"; e a correção do dono: "voce
  não usou o blender pra recriar... Não recriou da melhor maneira"). Desta vez com o ciclo do pipeline: script na técnica
  atual, `.blend` fonte aberto no Blender pelo MCP com as cores de prévia, revisão em 4 vistas contra a arte e nova volta.
  - **Balu** (miniatura "Antônio em Calamidade"): `char_balu.py` reescrito do zero — tronco largo com a barriga em
    relevo, polo folgada com dobras e a barra por cima do cinto, gola larga em V e carcela, mangas curtas com a barra,
    cinto com a fivela do Amuleto, jeans com dobras, mocassim com a tira, topete em metaballs (corrigido: estava em dois
    andares e cobrindo a sobrancelha), bigode cheio, cavanhaque e sobrancelhas; sem a orelha direita (como antes).
  - **Lírio** (miniatura de Sinais do Outro Lado): sobretudo com dobras verticais (`relief`) em vez do tubo liso, pelo em
    tufos de metaball cinza (`fur_lirio`, para não mudar o `fur_white` do Ferreiro), ombreiras em 4 camadas sobrepostas,
    duas tiras horizontais no peito com fivelas, e o cabelo refeito em metaballs (calota, alto armado, mechas jogadas
    para trás até os ombros, cobrindo a nuca, e a mecha laranja por cima).
- **Arthur e Joui**: o remodel de verdade (no Blender, na técnica atual) ficou para a próxima atualização; o esboço do
  Arthur foi descartado e os modelos seguem os da v3.39.0.

## v3.39.0 — Olhos Sempre Abertos

- Versão: `VERSION` 3.38.0 → **3.39.0** (package.json/lock junto). Data: 2026-10-25.
- **Retratos cortados** (pedido: "alguns personagens ficam meio cortados... como kian nessa cinematic"): a câmera fixa
  do `renderPortraits` cortava as cabeças altas. Agora mede a altura do osso da cabeça e enquadra por ela (margem de
  0,42 acima). Vale para menu, seleção, versus, tríptico da equipe e os 28 retratos da página Sobre (regerados).
- **Arthur pelo cânone de Calamidade** (wiki "Arthur Cervero"): o especial virou o tiro de elite `eliteShot` —
  Treinado em Furtividade (some na fumaça), reaparece ajoelhado, Rebirth com os raios roxos, Mira de Elite e Golpe de
  Sorte (crítico ×1,1). Nome pedido pelo dono "algo que realmente seja do Arthur": **Solo do Abutre** ("O Guitarrista"
  que guarda o rifle na capa da guitarra, último dos Gaudérios Abutres). Transformação renomeada para **Olhos Sempre
  Abertos** (nome do dono). Arma de Sangue (2 PV no cânone) passou a habilidade R2 + × (40 de vida, 8 s, alcance +0,6
  e sangramento). Passivas Golpe de Sorte (25% de crítico ×1,5 no tiro) e Furtivo e letal (≥ 10 m, ×1,2). Rebirth roxo
  e de Energia. Testado no jogo: especial 319 de dano contra a Kaiser e termina limpo; Arma de Sangue cobra 40 e mostra
  a lâmina.
- **Joui pelo cânone** (wiki "Joui Jouki"): Pavor Anormal (Desconjuração) como armadilha △ + □ — 25 de dano de
  Conhecimento e 1,1 s de paralisia; Um por Um (finalizador +8 de sanidade), Precognição, Resistência Paranormal
  (`iKnewIt` ×0,85) e +5 de defesa no curto alcance (`resistant` ×0,93); a Técnica Secreta (despertar) ganha o
  Desarmar: o finalizador trava o ataque à distância do alvo por 4 s. Testado: a armadilha paralisou, o Desarmar
  avisou "DESARMADO" e travou o □ por 4 s.
- **Remodelos pela arte oficial** (pedido "faltou remodel do arthur e joui"): Arthur pela miniatura de Calamidade —
  cabelo até os ombros meio-preso com rabinho, mechas brancas largas, colete preto fechado com bolsos e o brasão
  (escudo com asas) do lado esquerdo, a alça da capa de guitarra cruzando o peito, sem os suspensórios, calça com
  bolsos grandes e amarrações, tênis de cano alto com cadarço e solado claros. Joui pela miniatura de Calamidade —
  laterais raspadas, o topo repartido no meio caindo para os lados (mechas presas à casca da cabeça), chinelos com
  meias (cânone) no lugar das botas.

## v3.38.0 — Todos Juntos

- Versão: `VERSION` 3.37.0 → **3.38.0** (package.json/lock junto). Data: 2026-10-25.
- **Transformação em equipe (F3 do TODO › EQUIPE)**, pedido "siga pra próxima upd, sem ser remodel": com a Barra de
  Equipe cheia, a transformação do líder gasta a barra e transforma as assistências (`Assist.empower`): quem tem
  `awakening.form` troca para a forma (modelo e ficha da forma; a ação genérica da assistência usa o kit dela) com dano
  ×1,15; quem só desperta (`awakenMode`) ganha aura na cor do líder e dano ×1,25. Dura até o fim do round (`reset` chama
  `revertEmpower`) ou até a assistência entrar em campo numa troca (`trySwitch` reverte antes). Conferido no jogo:
  Kian líder com Dante e Arthur — o Dante virou `dante_aberto` (×1,15), o Arthur ficou com aura (×1,25), a barra zerou.
- **Cinemática do tríptico** (referência do dono: três painéis inclinados com o personagem sobre linhas verticais
  coloridas): `HUD.teamCut` monta assistência 1 / líder / assistência 2 com o retrato aproximado no rosto, as linhas
  verticais animadas na cor do ELEMENTO de cada um, as divisórias pretas inclinadas e o nome; entram em sequência e
  somem juntos (~1,75 s). Os retratos do menu têm o fundo colorido do time e cobriam o painel, então a partida em
  equipe gera no começo retratos SEM fundo só dos 6 integrantes (`hud.cutPortraits`, `main.js`).

- **Kaiser remodelada pela arte oficial** (`tools/blender/char_kaiser.py` → `public/models/kaiser.glb`; referência
  "Miniatura Kaiser 50% em Desconjuração" e o texto da wiki "Cesar Oliveira Cohen": depois do orfanato a metade esquerda
  do corpo queimada, o casaco do avesso cheio de buracos, olhos roxos com 50% de exposição). Gola alta canelada (relevo
  no tronco + gola), casacão cinza-claro largo e ABERTO feito do corpo, bordas e laterais roxas, bolsos com aba, capuz
  caído, manga direita até o cotovelo e a esquerda queimada (só a cava) com a PELE QUEIMADA do braço até o cotovelo,
  faixas coladas por raio no antebraço/mão direitos e nas canelas, alça marrom transversal e a Polaroid branca e amarela,
  mochila com alças roxas, tênis com a faixa roxa, cabelo em metaballs (calota + mechas, a franja sobre o olho direito,
  ralo no lado queimado), argola na orelha direita e o cigarro. Materiais próprios (`*_kaiser`) para não mexer nas
  texturas antigas `jacket`/`turtleneck`, usadas por outros. Texturas novas `jacket_kaiser` (avesso, fuligem, buracos
  queimados), `turtleneck_kaiser`, `pants_kaiser` e `skin_burn_kaiser`; `face_cineraria` agora com os olhos roxos, sem
  barba e sem a sobrancelha esquerda. Revisado no Blender pelo MCP (4 vistas) e na galeria.

## v3.37.0 — Em Movimento

- Versão: `VERSION` 3.36.0 → **3.37.0** (package.json/lock junto). Data: 2026-10-23.
- **Empunhadura das armas** (`models/props.js`, pedido: "estão miradas pra frente atravessando os dedos"): no punho
  fechado dos modelos o canal do cabo corre de frente para trás (do indicador ao mínimo), perpendicular ao antebraço;
  as armas brancas eram giradas só ~−0,3 rad e a lâmina saía por dentro dos dedos. O ajudante novo `inFist` gira o cabo
  para atravessar o punho (−1,35 rad; −1,15 nas pesadas: machados, marreta, taco, lança, maça) e o desce até o meio da
  mão. Aplicado nas 22 armas brancas de mão (facas, adagas, karambit, katana, espadas, lâminas do Gal, Leonora, taco,
  machados, Antena, peixeira, Faca Predadora e a lâmina do Medo do Kian). As armas de fogo já eram giradas assim;
  a bengala da Nubi continua apontando para o chão. Conferido de perto (a lâmina sai do lado do polegar, o pomo embaixo)
  e na galeria.
- **Locomoção refeita** (`anim/locomotionClips.js`, 1ª parte do REAJUSTE DAS ANIMAÇÕES): corrida, caminhada, pulo,
  queda, dash, esquiva e reação a golpe com as fases de verdade (contato, absorção, passagem, impulso), giro do quadril,
  contra-giro do tronco, braços opostos às pernas e a cabeça desfazendo o giro; meio ciclo desenhado e o outro
  espelhado (`mirrorPose`). `stride` igual (o pé não escorrega). A caminhada de costas e as locomoções das formas
  continuam derivadas delas. As definições antigas saíram de `clips.js`. Conferido no jogo (corrida de lado em duas
  fases do ciclo) e numa rodada CPU × CPU com 8 personagens sem erro. A importação de um pacote gratuito de animações
  ficou para quando o dono aprovar o pacote (baixar arquivos de terceiros precisa do OK dele).

- **Esfinge mais perto da arte oficial** (`npc_esfinge.py`, pedido "a Esfinge não foi terminada ainda"): a pele e os
  ossos saíram do lilás (lia como um cão roxo) para o verde-oliva escuro da arte; a Menés virou oliva com listras roxas
  e ganhou o LEQUE de espinhos roxos em volta; o colar de crânios ficou maior, em duas fileiras; as asas têm membrana
  roxa; a cauda ficou fina e longa com a ponta enrolada; as garras ficaram mais longas. Mesmas juntas (o
  `SphinxGhoul` anima igual). A postura agachada da arte fica para o reajuste das animações.
- **Posturas paradas próprias** (`src/anim/idleClips.js`, registrado no fim de `clips.js`): 18 idles novos para quem
  dividia `idle_knife` (Aghata, Aguiar, Cristino, Fantasma, Jae, Juan, Kemi, Xande), `idle_katana` (Ferreiro, Joui,
  Labirinto, Veríssimo) e `idle_fist` (Cristopher, Dalmo, Dante, Guizo Bombado, Kaiser, Kian). A galeria passou a usar o
  `anims.idle` de cada ficha. Conferidos na galeria.
- TODO: saíram os testes online (funcionam) e a velocidade das legendas (pedido do dono); entrou o **REAJUSTE DAS
  ANIMAÇÕES** (importar animações de movimento gratuitas e de licença livre e redirecionar para o esqueleto do jogo).

- **Página Sobre / Baixar (`sobre.html`) ampliada com a wiki** (pedido: "melhorar ela com base na wiki, exemplo: sistema
  de elementos e explicar como isso funciona no jogo"). Duas seções novas, com links no menu do topo:
  - **O universo**: quatro cartões "na série / no jogo": o Outro Lado e a Membrana, a Ordem e os ocultistas, rituais e
    exposição paranormal (no jogo, a sanidade e o despertar), e os Marcados e as Relíquias da Calamidade (Trono, Máscara
    do Desespero, Relíquia de Energia e Parasita de Dimensões, com o portador de cada uma no elenco).
  - **Elementos**: o ciclo desenhado em SVG (Medo no centro, neutro), a regra do jogo ao lado (rituais +15% / −15%,
    físico fora do ciclo salvo arma amaldiçoada, Transmissão e Tinta neutras) e um cartão por elemento com a descrição
    resumida, quem supera e quem o supera, e "No elenco", preenchido pelos dados do jogo (`sobre.js` carrega o elenco uma
    vez, quando os elementos ou o elenco chegam perto da tela).
  - Fonte: as páginas Ocultismo, Sangue, Morte, Conhecimento, Energia, Medo e Relíquias da Calamidade da wiki, resumidas
    com palavras próprias. A wiki confirma o ciclo do código (`config/elements.js`): Sangue supera Conhecimento, que supera
    Energia, que supera Morte, que supera Sangue. Conferido no PC e no celular (375 px, sem rolagem lateral).
- **Elenco da página refeito:** um cartão por lutador com retrato (28 `.webp` de ~9 KB em `public/sobre/elenco`,
  renderizados uma vez dos modelos do jogo com `renderPortraits`), origem, elemento, frase, arma, especial e transformação,
  e filtros por origem e por elemento (`aria-pressed`, contagem anunciada para leitor de tela).
- **Modo futuro "Outro Lado"** explicado em Modos, marcado como em desenvolvimento e sem data (resumo do planejamento
  PvE do TODO).
- **Changelog corrigida:** a nota da v3.33.0 (no jogo e na CHANGELOG-CLIENTE) dizia o ciclo ao contrário ("Sangue supera
  Morte..."); agora diz "Morte supera Sangue, Energia supera Morte, Conhecimento supera Energia, Sangue supera
  Conhecimento". A CHANGELOG técnica passou a dizer a escolha do Xande sem ambiguidade ("contra Sangue usa Morte...").

## v3.36.0 — Na Faixa Certa

- Versão: `VERSION` 3.35.0 → **3.36.0** (package.json/lock junto). Data: 2026-10-22.
- **Gal — nomes:** a Ultimate passa a se chamar **"Injustiça né?"** (nome e banner; a fala inteira ficava enorme na
  tela) e a transformação **"O Realizador do Destino"** (apelido oficial do Gal na wiki; o poder continua sendo a
  Afinidade com Precognição). Substitui o pendente anterior, que trocava o nome da Ultimate.
- **Banner do especial/transformação refeito** (`#banner` em `styles.css`, `HUD.banner`): a faixa e o texto ficam na
  mesma célula de grade, então a faixa cresce com o texto; a inclinação é do conjunto; o tamanho da letra sai da
  largura real da tela (~0,6 em por letra) com teto de 17% da altura, e nomes longos quebram em duas linhas
  equilibradas (`text-wrap: balance`). Conferido no PC e no celular deitado (812×375) com "Injustiça né?",
  "Afinidade com Precognição" e a fala inteira do Gal: tudo dentro da faixa.
- **Gal — a venda brilha no despertar:** opção nova `glowMat` do `awakenMode` — clona o material (o espelho não muda),
  usa a própria textura como emissivo (só as marcas douradas acendem), pulsa enquanto durar e devolve o original no
  fim. Conferido no close.
- **Contador de desempenho de dev** (`src/dev/perf.js`): FPS, tempo de quadro (média e pior), chamadas de desenho,
  triângulos, geometrias e texturas na GPU, objetos na cena (contados 1×/s) e memória do JS. Liga com `?perf` na URL
  (vale no celular e no site) ou F8 no `npm run dev`; o módulo só carrega quando pedido.
- **Opções › Partida › Falas na luta (Ligadas/Desligadas)** (`SETTINGS.fightLines`, 13 idiomas): desligada, as falas
  do meio da luta (provocações, vida baixa) não aparecem; entrada e vitória continuam. A escolha da fala continua
  rodando e só a legenda some — ela usa o sorteio da simulação, e pular a escolha de um lado desencontraria uma
  partida em rede. Conferido: ligada mostra, desligada esconde, o estado interno é igual nos dois casos.

## v3.35.0 — Eu Sou a Injustiça

- Versão: `VERSION` 3.34.0 → **3.35.0** (package.json/lock junto). Data: 2026-10-22.
- **Gal Sal — Ultimate e despertar revistos pelo cânone** (pedido: `arena_paranormal_gal_sal_ultimate_transformacao.txt`).
  - Auditoria antes de mexer: a Injustiça era o `cinematicCombo` genérico (corrente → 5 golpes de espadachim → lançado)
    e o despertar só tinha números. A wiki "Gal" confirma: a fala inteira ("Injustiça, né? Muito prazer, eu sou a
    injustiça.") vem logo depois do Controle Mental em Joui (ajoelha numa reverência forçada) e antes da execução de
    Elizabeth; a Afinidade com Precognição (Calamidade) dá defesa a mais de perto e de longe e "não pode mais ser pego
    desprevenido"; a Bênção Maldita Discente sabe o resultado dos próximos ataques; "O Realizador do Destino" é apelido
    oficial (a proposta achava que não).
  - **Injustiça** (`gal_sal.js`): a corrente prende e puxa como antes (esquiva/defesa continuam valendo; errar não abre
    cena) → o sigilo do Controle Mental acende e o alvo AJOELHA (`forced_kneel`) → a fala inteira no banner → 3 cortes
    com o lampejo dourado no ponto do impacto um instante antes (Bênção Maldita) → a cruz final com as duas correntes,
    que DERRUBA o alvo (em vez de lançar longe). Dano 250, custo 50 e recarga 14 iguais; o dano cai em cada impacto
    (15/15/20/50%). Câmera nova `shots: 'control'` (por cima do ombro, aberta para o alvo ajoelhado aparecer).
  - `cinematicCombo.js` ganhou opções opcionais por golpe (`victimAnim`, `sigil`, `foresee`, `push`) e
    `sp.endReaction`; quem não as usa não muda. Também passou a tratar o passo `noHit` como parte 0 do dano — sem
    `share`, a divisão dava `NaN` no último golpe (pego no teste: a vida do alvo virava `null`).
  - **Despertar Afinidade com Precognição**: agora dá a passiva `precognition` enquanto durar (`awakenMode`
    `passives`, lida por `hasPassive`, que passou a considerar passivas de estados ativos) e alarga o Bloqueio Perfeito
    para 0,2 s (`perfectBlockWindow`, lido em `damage.js`); velocidade +15% → +10%. Dano +10%, −15% de dano recebido
    (a defesa é canônica) e cura de 10% ficam. A ficha de movimentos mostra os dois efeitos novos.
  - Testado no jogo (CPU × CPU no modo local, passo a passo): acerto (dano 36/36/44/98 contra o Joui), alvo nocauteado
    no meio da cena (termina no KO, sem travar), corrente longe demais (erra, sem cena), alvo defendendo (bloqueada,
    como antes), esquiva no tempo certo (escapa); despertar: Precognição só durante o estado, aparar com 0,18 s funciona
    e com 0,25 s vira defesa normal, sem despertar 0,18 s é defesa normal, e tudo some no round seguinte. Não testado:
    partida LAN/online.
  - Telemetria focada (`runBalance({ focus: 'gal_sal', fights: 1 })`, 54 lutas em 2 abas): **41%** de vitórias (48% como
    P1, 33% como P2), antes 52% (v3.32.0). Dentro da faixa 35–65% e perto do ruído de uma rodada (±7%); sem ajuste em
    `balance.js` nesta tarefa — rodar de novo na próxima rodada geral antes de mexer.

- CI: as ações dos fluxos `release-apps.yml` e `deploy-pages.yml` foram para as versões atuais (checkout v7,
  setup-node v7, setup-java v6, upload-artifact v7, download-artifact v8, action-gh-release v3, configure-pages v6,
  upload-pages-artifact v5, deploy-pages v5) e o Node do build de 20 para 24 — some o aviso de Node 20 obsoleto e o
  do setup-java v4.

## v3.34.0 — Faixas e Correntes

- Versão: `VERSION` 3.33.0 → **3.34.0** (package.json/lock junto). Data: 2026-10-22.
- Revisão dos commits de 18/10 feitos fora das sessões (pedido: "mexi em algumas coisas no jogo e na documentação"):
  - `93f415f` — Xande: `hideProp`/`returnsProp: 'skate'` no □ (o motor já trata os dois no ataque à distância, como o
    machado do Balu: `Fighter.hideRangedProps` e `Projectiles` ao terminar); o visual `skate` clona a peça da mão do
    dono (`owner.rig.props.skate`) e cai em `chaosSkate()` sem ela. Correto. O import de `getForm` em `assists.js`
    não era usado e saiu. `src/config/teamLinks.js` (tabela + `getTeamLink`) bate com a regra de prioridade do TODO,
    mas ainda não está ligado a nada — registrado como F4 em andamento.
  - `c1abe78` — galeria `?face`: câmera mais afastada e centralizada. `21bd324` — título do README sem "protótipo".
  - `410138e` — o planejamento da próxima grande atualização (PvE, dungeons, Espreitador) e a REGRA PRIORITÁRIA foram
    colados no TODO; virou a seção *PRÓXIMA GRANDE ATUALIZAÇÃO* (sem as aspas e a nota "atualizar o TODO"), com o
    estado de cada item.
- **Fantasma** (forma da Kemi; `tools/blender/char_fantasma.py` → `public/models/fantasma.glb`) remodelada pela arte e
  pelo texto oficiais ("faixas que agora escondem seu rosto, deixando apenas seus olhos à mostra"). O script ficou
  independente do antigo `kemi_common.py`: sobretudo de couro marrom feito a partir do corpo
  (`clothe` + saia em `shell_grid` até acima do joelho), gola alta aberta em V, ombreiras e remendos escuros, botões,
  faixa na cintura com nó e pontas, três facas curvas em bainhas, a alça do rifle, faixas em espiral nos antebraços e
  cruzadas nas canelas, calça cargo, botas esculpidas com sola e cadarço, voltas de faixa coladas na cabeça por raio
  (a volta da altura dos olhos só passa por trás, deixando a fresta à mostra) e os dreads loiros num rabo alto. As
  orelhas antigas saíram (ficavam por cima das faixas). Texturas novas `coat_fantasma`, `pants_fantasma` e
  `bandage_fantasma`; `face_fantasma` refeita (voltas de faixa com trama, fresta escura puída e olhos âmbar com
  brilho). Revisado no Blender pelo MCP (4 vistas) e na galeria; check, 43 testes e build ok.

- **Kemi** (`tools/blender/char_kemi.py` → `public/models/kemi.glb`) remodelada pelas artes oficiais "Arte de Kemi em
  Hexatombe" (de frente e de costas): dreads loiros puxados do couro cabeludo para o rabo alto e caindo até o meio das
  costas, com mechas soltas dos lados do rosto; argolas na orelha esquerda; top branco curto de alças largas com a
  barra do decote e a faixa marrom por baixo do busto; barriga à mostra com o abdômen e o umbigo em relevo; mochila
  preta (metaballs) com a tampa, as alças de couro claro pelos ombros e a tira cruzada; faixas coladas por raio no
  braço esquerdo inteiro e no antebraço/mão direitos, com as pontas penduradas; calça cáqui larga com o cós dobrado e
  dobras em relevo, bolsa de couro na coxa esquerda, faixas cruzadas na perna esquerda e no joelho direito; o casaco
  marrom amarrado na cintura (nó no quadril esquerdo, pontas das mangas) caindo pelo lado direito e por trás até o meio
  da canela, abotoado na borda, com a barra escura e sempre por cima da calça; coturnos cinza-escuros de cadarço com
  sola marrom. O `kemi_common.py` foi removido (a Fantasma já era independente). Texturas novas `top_kemi`,
  `pants_kemi` e `coat_kemi`. A sniper das costas da Kemi ficou mais afastada para passar por cima da mochila
  (`models/props.js`). Revisado no Blender pelo MCP (4 vistas a cada etapa) e na galeria; check, 43 testes e build ok.

- **Gal Sal** (`tools/blender/char_gal_sal.py` → `public/models/gal_sal.glb`) remodelado pelas artes oficiais de
  Desconjuração ("Miniatura Gal em Desconjuração", "... em combate" e "Arte promocional - Gal"): o PONCHO agora cai de
  verdade — o perfil de cada direção sai do pescoço, passa por cima dos ombros e dos braços (raio de cima) e cai na
  vertical a partir da borda do corpo até a barra em ponta (frente/trás) e no cotovelo (lados), com a barra rasgada,
  as dobras e nunca por dentro do corpo; decote em V aberto com a costura dourada em pontos; franja dourada de fios de
  tamanhos diferentes; cabelo preto liso em metaballs repartido no meio (da testa à nuca), caindo na frente dos ombros
  e pelas costas; venda por cima do cabelo com o nó e as pontas; gargantilha colada no pescoço; brinco pendurado na
  orelha direita; correntes de elos reais (`chain_mesh`) enroladas nos antebraços; calça com dobras. As lâminas
  **Ereškigal** foram modeladas no Blender (`npc_gal_blade.py` → `public/npcs/gal_blade.glb`): meia-lua de aço escuro
  com as pontas para a frente, escrita cuneiforme dourada, empunhadura enrolada e guarda em anel; `sickleBlade`
  (`models/weapons.js`) usa o .glb (a versão em código fica de reserva). Texturas novas `poncho_gal` (pano gasto com
  remendos costurados) e `pants_inj`. Revisado no Blender pelo MCP (4 vistas a cada etapa) e na galeria; check,
  43 testes e build ok.

## v3.33.0 — O Ocultista e o Mutilador

- Versão: `VERSION` 3.32.0 → **3.33.0** (package.json/lock junto). Data: 2026-10-18.
- Modelos remodelados pelas artes oficiais: **Xande** (Sinais do Outro Lado) e **Aguiar / Mutilador Noturno** (Natal Macabro), além das armas no Blender e mãos/pés anatômicos de todos os 33 lutadores.
- **Aguiar / Mutilador Noturno** (`tools/blender/char_aguiar.py` → `public/models/aguiar.glb`): musculatura aumentada e esculpida, cabelo preto ondulado até a nuca com mechas em Sculpt chain e mecha na testa, faixa de couro alta no pescoço, distintivo de delegado com corrente 3D em elos reais (`chain_mesh`), camiseta creme justa, colete vermelho esfiapado com gola levantada, suspensórios em X no cinto largo com tiras soltas penduradas, braçadeiras e munhequeiras com fivelas, jeans escuro rasgado nos joelhos com a pele aparecendo e tênis vermelhos/creme com esporas de roseta de ferro atrás. Machado do Mutilador modelado no Blender (`npc_aguiar_axe.py`).
- Pedido: "pegue o modelo que faz mais tempo que não é atualizado e melhore-o com as tecnologias que temos agora, se
  baseando de novo nas imagens do personagem, o mais próximo possível da imagem". O mais antigo era o do **Xande**
  (`char_xande.py`, último ajuste em 2026-10-01, ainda na técnica básica de tubos).
- Referência: a arte oficial de Sinais do Outro Lado (wiki "Alexandre", vista inteira e em detalhe no navegador do app —
  o CDN de imagens bloqueia download por linha de comando) e o texto de aparência da wiki.
- `tools/blender/char_xande.py` reescrito com a técnica atual (sculpt_lib): roupa a partir do corpo (`clothe`), cabelo
  longo ondulado em metaballs (40 mechas fundidas, nascendo sob o boné, emoldurando o rosto e caindo no peito), peças
  coladas na superfície por raio (BVH: suspensório em X, cinto, frascos, rádio, bolsas, broche dos Cinco, marcas do
  boné), balaclava embolada, fones no pescoço, mangas cinza largas e a blusa preta arregaçada, bermuda com pregas, a
  barra amarela de triângulos e as fitas, as JOELHEIRAS DE OLHO, correntes com elos de verdade (`chain_mesh`) no
  antebraço direito e na canela esquerda, tênis de cano alto com lingueta e cadarço. Texturas novas `legs_xande`
  (arranhões e mordidas nas canelas) e `trim_xande`. 37 mil faces, 2,1 MB (era 27 mil / 1,0 MB). O taco e o skate
  continuam em código. Revisado no Blender pelo MCP (4 vistas) a cada etapa e no jogo (galeria e luta CPU × CPU sem erro).
- Depois (pedido: "falta melhorar as armas dele, a textura das roupas, a do rosto, remodelar o skate/escudo; para todos
  os personagens, melhorar os sapatos e principalmente as mãos"):
  - **Mãos de todos** (`lib.py hand_part`): palma e dorso esculpidos + cada dedo em 3 falanges (tubo liso Catmull-Rom),
    nós marcados e o polegar cruzando por cima — antes eram elipsoides colados. **Sapatos de todos** (`foot_part`): bico
    redondo, calcanhar, peito do pé e sola reta (era uma caixa); as 12 solas em caixa dos personagens viraram
    `sole_part` (contorno de pé com a borda chanfrada) e o pé descalço ganhou arco e 5 dedos (`bare_foot_part`).
    Os 33 modelos refeitos e conferidos numa folha de contato (render de mãos e pés de todos).
  - **Armas do Xande no Blender**: o taco (`npc_xande_bat.py`: madeira com veios, fita enrolada, arame farpado com as
    farpas, pregos e a corrente no pomo) e o **Skate Caótico** refeito pela arte oficial (`npc_xande_skate.py`: guardas
    de metal com rebites, lâminas serrilhadas, rodas vermelhas com espinhos dourados, a alça vermelha do escudo,
    "OCULTO", o triângulo e o símbolo em relevo e as runas verdes). Carregados pelo `buildNpcModel`; o código antigo
    fica de reserva. O skate arremessado usa o mesmo modelo.
  - Texturas novas do Xande: rosto (limpo, olhos azuis, sombras suaves), camiseta (trama, dobras, gola canelada e a
    estampa dos 3 triângulos com "oculto" — havia um `shirt_xande` antigo duplicado que sobrescrevia o novo, removido),
    mangas, bermuda e balaclava com texturas próprias.
- **Amaldiçoar Arma por elemento** (pedido: "o Xande é um ocultista que sabe amaldiçoar arma com diversos elementos,
  para o elemento mais forte que o inimigo atual; uma textura para cada elemento"; "isso deve se aplicar a ele como
  assistência também"): `curseWeapon` com `adaptive` escolhe o elemento que supera o adversário (Sangue → Morte,
  Morte → Energia, Energia → Conhecimento, Conhecimento → Sangue; fora do ciclo, Sangue). Efeitos: Sangue sangra, Morte
  apodrece e deixa lento, Conhecimento drena 6 de sanidade por golpe, Energia 30% de choque extra (14); os golpes da
  arma amaldiçoada levam a vantagem do elemento. `weapons.js elementCoat` pinta uma textura por elemento (sangue
  molhado, Lodo com espirais, sigilos dourados que pulsam, raios violeta que piscam) — vale para todos que amaldiçoam
  (Aghata, Balu, Ferreiro com Morte, Guizo, Lírio). A **assistência do Xande andando** agora amaldiçoa a arma do
  parceiro (`applyWeaponCurse`, as armas que estão nas mãos dele; sem arma, o efeito vale no punho) — conferido com a
  Leonora do Lírio contra o Juan (Morte).

## v3.32.0 — O Enigma

- Versão: `VERSION` 3.31.0 → **3.32.0** (package.json/lock junto). Data: 2026-10-18.
- Também nesta versão (pedidos de 2026-10-17): Decepar do Cristino mais fácil de acertar + "não poder se curar por
  uns 15 s" (ficou 12 s); Barra de Equipe (F1) e Especial em Equipe simplificado △ △ △ ○ (F2) — "a barra está
  aumentando muito, tem que ser algo não frequente" (+6 por chamada, +3 por troca); página de download com os passos
  quebrados. As fases F3/F4 da equipe seguem documentadas no TODO.
- Nubi, a Escripta:

- Pedido: "Vamos adicionar uma nova personagem, uma escripta. Nubi" (com a ficha de implementação e a imagem de
  referência); especial **Carniçal da Esfinge**. Depois: "tem que ser uma invocação com barra de vida assim como a
  Marionete e, diferente da Marionete, não ataca o usuário"; "no meio da partida ela pode fazer um enigma com 4 opções
  Y A B X — errou toma dano considerável, acertou a criatura fica paralisada e toma dano"; "muitas variações, sem
  repetição"; "pode ter pontos da vida dela (3 na barra) onde você tem que responder um enigma"; "depois melhore o
  modelo, foque no funcionamento".
- Fontes: wiki Nubi (aparência, Orfanato Santa Menefreda, a percepção de tempo distorcida, Calamidade ep. 10) e wiki
  Carniçal da Esfinge (corpo quadrúpede esquelético com mãos e cauda, costelas em volta do estômago, pescoço em Menés,
  colar de crânios, roxo, asas rasgadas, Lodo; Amedrontar, Saltar, Vomitar Lodo, Enigma, Estômago).
- Cânone × adaptação documentados no cabeçalho de `src/characters/nubi.js` e de `src/combat/beasts.js` (SphinxGhoul).
  Os enigmas do jogo (`src/config/riddles.js`, 52) são adivinhas populares reescritas — **não** são os da série.
- Novo: modelo `tools/blender/char_nubi.py` → `public/models/nubi.glb`; `npc_esfinge.py` → `public/npcs/esfinge.glb`
  (base funcional; o acabamento do modelo fica para depois, a pedido); habilidade `calmEvade` (Desvio Imperturbável,
  janela de 0,45 s que usa a Substituição, não vale contra especiais); visual `lodoMass`; esquiva `calm`; cena de
  agarrão; especial `sphinx` (formação em etapas, poça sem objeto órfão); `combat/riddle.js` (o mundo para durante o
  enigma; no online o sorteio usa a semente da partida e a memória de "já vistos" fica desligada); a barra do topo
  vale para qualquer invocação com `bossBar` e mostra as 3 marcas do enigma.
- Conferido no jogo: invocação, Amedrontar, Saltar (46), marca de 75% → enigma, acerto (paralisada 4,5 s, −18%, +50%
  de dano), erro (mordida e Estômago curando a Esfinge), as marcas na barra; Nubi: Lodo da Morte, Decadência, Ritual
  de Drenagem, Desvio (0 de dano dentro da janela, dano normal fora dela e em especial), agarrão (70). `npm run check`,
  `npm test`, `npm run build` ok.
- Ajustes pedidos depois do teste ("quem congela ao acertar é o player, o certo era a esfinge; ela não deveria sumir";
  "a Nubi precisa de mais habilidades"; "a esfinge deve durar mais"; "transformação com olho preto"): a Esfinge dura
  35 s com 480 de vida e o relógio dela PARA enquanto está paralisada ou no urro do enigma (antes, o tempo de 14 s
  acabava durante a paralisia e ela afundava); a paralisia aparece nela (PARALISADA na barra, amarras roxas) e o aviso
  da vítima virou "ACERTOU! ATAQUE A ESFINGE"; a pausa do resultado caiu de 1,3 para 0,9 s e quem respondeu volta
  livre (atordoamento anterior limpo). Nubi ganhou **Lodo que Prende** (△+□, tentáculos de Lodo) e **Sentença do
  Chacal** (R2+×, pancada da bengala, 8 s sem cura). Afinidade com a Morte troca o rosto por `face_nubi_open` (olho
  inteiro preto, Lodo mais grosso) no close da transformação, com Lodo pingando do rosto; volta ao normal no fim do
  round (conferido).
- Modelo da Esfinge refeito (`npc_esfinge.py`): silhueta de leão (peito fundo, ombros e ancas fortes), patas grossas
  com mãos grandes, a Menés como superfície de pano de verdade com listras pretas/roxas nítidas, abas nos ombros e
  borda roxa emoldurando o crânio, asas maiores rasgadas só na borda, pele cinza-arroxeada legível no jogo. Revisado
  no Blender pelo MCP (4 vistas) e na luta. A esquiva da Nubi virou "Passo Imperturbável" (o nome repetia o da
  habilidade △+L2).
- **Balanceamento geral** (pedido: "pode começar o balanceamento geral dos personagens antes de lançar"; não era feito
  há muitas versões). Ferramenta: `src/dev/balance.js` (CPU × CPU, todos os 756 pares) agora divide a rodada entre
  abas (`attackers`) e não é segurada pela aba em segundo plano; 4 rodadas em 6 abas. Alvo do TODO §34: 35%–65%.
  Ajustes num lugar só, `src/config/balance.js` (multiplicador de dano causado/recebido por personagem, vale nas
  formas e nas invocações), mais correções de kit onde o problema era de mecânica: **Inexistir** (Kian) só apaga quem
  está com ≤35% da vida — antes matava na hora em qualquer vida; a **Escrita** do Kian detona com 30 de dano e 0,3 s
  (era 45 e 0,5 s); **O Diabo** com menos vida (1550; forma 1850), regeneração e roubo de vida menores e +150 de vida
  no Renascimento (era 300). A CPU passou a usar o Desvio Imperturbável só como reação.
  Resultado: personagens fora de 35–65% por rodada 14 → 10 → 4 → 4, e os ajustes finais (O Diabo 74% → **51%**,
  Nubi → **48%**, conferidos numa rodada focada de 54 lutas cada; Lírio, Veríssimo, Cristino e Aguiar subiram um
  pouco pela média das rodadas 3 e 4). Uma rodada tem ruído de ±7% por personagem: os valores ficam em
  `src/config/balance.js` com o histórico de cada um.
- Bug encontrado pela telemetria: o **Eco Espiral** do Dante travava o jogo contra a **Kemi** (a cópia tentava copiar
  um grupo lógico de armas que não é um nó 3D) — corrigido em `combat/holo.js`.
- Falta: testar o enigma numa partida online de verdade (dois aparelhos) — registrado no TODO.

## v3.31.0 — Fios e Escritas

- Versão: `VERSION` 3.30.1 → **3.31.0** (package.json/lock junto).
- Pedidos: (1) "por ter apertado antes o Y ele usa o Especial — sem esse salvamento, Y-B é o poder, Y-Y-B é especial,
  como no Storm"; (2) a Marionete com ataque à distância baseado nas habilidades dela na série → escolhido **Fios do
  Luto**; (3) "remover o Carniçal (vai ser jogável), transformar em Existido de Morte com habilidades mais simples e o
  movimento que varia do nada, lento e rápido" — sem barra própria, como os Zumbis; (4) "não parece nada com as imagens,
  busque mais referências e melhore via MCP".
- Fontes: wiki A Marionete (Foice Óssea, Momento Passivo, Reflexos Guiados por Corda, Ironia do Destino — nenhuma à
  distância; o fio veio dos fios que a erguem + "arrasta a vítima"), wiki Existidos de Morte (corpo, Lodo nos olhos e
  braços, Distorção Temporal, Aceleração, movimento errático) e as três artes da galeria (miniatura e variação de
  Desconjuração, arte de Vendeta Oculta).
- Conferido: os 6 casos da carga (só △ → △ → ○ seguido dá o especial; o caso do pedido virou habilidade); os Fios do
  Luto prendendo a 6,6 m, puxando e emendando o corte; o Existido com os dois ritmos, Pancadas, Aceleração e Distorção
  Temporal deixando o alvo lento; o modelo visto no jogo (npcs.html).
- O MCP do Blender perdeu a conexão no meio (script longo); o modelo foi terminado pelo Blender sem janela com
  prévias renderizadas (`preview_npc.py`).

## v3.30.1 — Tela Inteira

- Versão: `VERSION` 3.30.0 → **3.30.1** (package.json/lock junto).
- Pedido (com 3 fotos do iPhone): "a tela no app de iPhone está bugada, a partida fica cortada pra esquerda (no outro
  teste não ocorreu)"; "3 botões da Erin com o nome Granada, sendo que cada uma tem um nome"; "a tela de seleção de
  personagem do mobile está toda apertada — melhorar todo HUD do mobile nessa upd".
- Diagnóstico do iPhone: o pedaço que faltava tinha a altura da barra de status (~47 pt) e só acontecia ao abrir em pé e
  girar — erro conhecido do iOS em app da tela de início. A correção só liga quando o tamanho informado não bate com a tela.
- Conferido no navegador em 852 × 393 e 667 × 375: seleção solo e equipe até o COMEÇAR, configurações, cenário, luta,
  pausa, comandos, vitória e torneio (chave e duelo). Os rótulos dos 27 lutadores conferidos (nenhum repetido).
- Falta: confirmar a correção num iPhone de verdade (abrir em pé e deitar).

## v3.30.0 — Na Tela de Início

- Versão: `VERSION` 3.29.0 → **3.30.0** (package.json/lock junto).
- Pedido: "tem como fazer instalador pra iPhone?" → opções apresentadas (App Store/TestFlight: US$ 99/ano e risco alto
  de recusa por propriedade intelectual, guideline 5.2; sideload: expira em 7 dias; PWA) → escolhida a **3, PWA**.
- Conferido no build de produção (`vite preview`): service worker ativo controlando a página, casca com 16 arquivos,
  44 modelos e os cenários guardados depois de abrir o jogo; com o servidor DESLIGADO a página recarregou e uma luta
  começou, sem erro no console. Botão INSTALAR chama o pedido de instalação do navegador.
- Falta: testar num iPhone de verdade (Safari → Adicionar à Tela de Início) e num Android.

## v3.29.0 — Arquibancada

- Versão: `VERSION` 3.28.0 → **3.29.0** (package.json/lock junto).
- Pedidos: "opção de assistir as partidas das salas online que estão acontecendo" e "arrume o torneio: começo e
  instantaneamente todas as batalhas dos bots já aconteceram — tem que ser em ordem, uma de cada vez, mostrando quem
  ganhou e quem perdeu", com o desenho `Personagem 1 - - - I ⚔️ Personagem 2 - - - I`.
- Conferido no navegador: torneio de 5 CPUs do começo ao campeão (quartas → semis → final, cada luta ~3 s de duelo e
  ~3 s de resultado). Partida online real pelo corretor público (anfitrião, convidado e espectador em 3 abas): o
  espectador entrou com a luta carregando, refez ~1100 quadros em ~1 s e ficou igual quadro a quadro (uma diferença de
  0,2 na posição depois do fim da luta, corrigida pelo envio seguinte dos números); Esc sai e o anfitrião continua.
- Falta: testar com aparelhos diferentes (celular assistindo partida de PC) e com muitos espectadores ao mesmo tempo.

## v3.28.0 — Na Palma da Mão

- Versão: `VERSION` 3.27.1 → **3.28.0** (package.json/lock junto).
- Pedido: "o hud pode ser todo reformulado, não funciona pra uma tela de celular, está cheio de botões; facilitar a
  gameplay mobile e ajustar a posição dos botões".
- Antes: losango no canto, ESQ perdido à esquerda, ESPECIAL e DEF no alto, e duas filas de comandos (DEF+△, N8-N8...) na
  HUD que no toque não serviam — as habilidades pediam dois botões ao mesmo tempo.
- Conferido no navegador em modo celular (844 × 390, 667 × 375 e tablet 1024 × 768): todos os botões de habilidade
  soltam a habilidade (inclusive Rotura, ← + □, no Olhos Abertos), especial, esquiva, joystick flutuante, assistência
  e troca na equipe; os botões se refazem após a transformação e a troca. Falta testar em aparelho de verdade.
- Achado no caminho: o `node_modules/three` local estava com um arquivo corrompido (GLTFLoader.js com bytes binários);
  `npm ci` resolveu. Os arquivos do repositório estavam íntegros.

## v3.27.1 — Baixe e Jogue

- Versão: `VERSION` 3.27.0 → **3.27.1** (package.json/lock junto).
- Pedido: "antes do push, reformule a página de jogo/baixar com a skill de padrão de qualidade de sites" (a 3.27.0 já
  tinha subido; esta versão leva a página nova).
- Padrão aplicado: §1 (referências → ThoughtLab no Refero Styles; tokens antes das telas), §2 (layout, CTA, desempenho,
  acessibilidade, SEO) e §5 (entrega). §3 (backend) e §4 (LGPD) não se aplicam a uma página estática sem coleta de
  dados — o motivo de cada item está em `docs/QUALIDADE-SOBRE.md`.
- Lighthouse 12 no celular (Edge headless, build de produção): 92 → **99** de desempenho (as fontes bloqueavam a primeira
  pintura e as imagens eram maiores que o celular precisa), acessibilidade/boas práticas/SEO **100**; LCP 1,7 s, CLS 0,059.
- Telas da página capturadas no próprio jogo (título, luta com o Paradoxo e as cópias, o rosto de Olhos Abertos, a
  Marionete, a seleção). As capturas mostraram três problemas do Dante, corrigidos aqui: cópias acinzentadas, a franja
  cobrindo os olhos e a cena de transformação estourada de luz.
- Pendente (fora do alcance do código): Search Console com a conta do dono; testar no Safari do iPhone e no Samsung
  Internet.

## v3.27.0 — Do Seu Jeito

- Versão: `VERSION` 3.26.1 → **3.27.0** (package.json/lock junto).
- Pedido: "faça o menu melhor, volume com barra arrastável (slide) e opções de quais volumes vai mexer; toda a área de
  menu pode ser repensada para ficar mais fácil e intuitiva" e "a parte de Jogo fan made pode ser menor — Jogo Fan Made
  por romavitordev inspirado em Ordem Paranormal".
- Canais de volume: GERAL, EFEITOS DA LUTA, MENUS e CARGA DE PODER. Não há canal de MÚSICA porque o jogo ainda não tem
  música (§71 do TODO) — entra quando a música existir; as falas são só texto.
- Conferido no preview: arrastar com mouse (efeitos 49%) e com toque no modo celular (geral 40%), ◀ ▶ do teclado
  (menus 100 → 80), mudo pelo número, qualidade gráfica trocando na hora (pixel ratio e sombras), salvo no navegador;
  layout no PC e no celular deitado (rolagem, botões de canto do toque fora do painel).
- Verificações: `check-roster`, `npm test` (41), `npm run build`.

## v3.26.1 — Celular Mais Leve

- Versão: `VERSION` 3.26.0 → **3.26.1** (package.json/lock junto).
- Pedidos: "pegue e faça as mais simples [do TODO] e em seguida dê push" e, no meio, "o jogo está injogável em
  qualquer celular, trava muito" — o celular virou a prioridade; das simples entrou a correção do erro da galeria.
- **Diagnóstico** (medido no preview): numa luta, 801 texturas e 1415 geometrias na GPU, e as texturas cresciam ~35
  por luta. Rastreado (gancho no `needsUpdate` das texturas): a textura de ossos dos esqueletos, criada a cada cópia de
  modelo e nunca liberada. Lógica do jogo leve (0,7 ms por passo) e ~84 chamadas de desenho: o gargalo do celular é a
  GPU — resolução dobrada, antialias, sombras suaves de 2048 e as luzes pontuais em todo pixel do material toon.
- **Feito:** a liberação dos esqueletos (texturas estáveis em ~260 em seis lutas seguidas), as texturas pintadas
  compartilhadas e a QUALIDADE GRÁFICA com o automático (baixa no celular). Conferido no preview no modo celular:
  baixa automática, pixel ratio 1, sem sombras, 1 luz, 60 quadros desenhados por segundo.
- **Não mexido de propósito:** a quantidade de partículas — os efeitos sorteiam com o mesmo `Math.random` com semente
  do online; cortar partículas só de um lado dessincronizaria a luta em rede.
- **Ainda falta testar** num celular de verdade (o preview não simula a GPU do celular). Próximos passos se ainda pesar:
  carregar os modelos sob demanda e comprimir os `.glb` (§76.5).
- TODO: §23.5 com os modelos que ainda não passaram pela técnica nova (23 lutadores, 3 formas, 3 invocações); a versão
  instalável saiu do adendo (já feita na v3.25.0); a QUALIDADE GRÁFICA saiu do §76.5.

## v3.26.0 — Olhos Abertos

- Versão: `VERSION` 3.25.1 → **3.26.0** (package.json/lock junto).
- Pedidos: "Dante, quando usar o Trinitá na forma normal, pode deixar os clones andarem e baterem no inimigo, assim
  como outras invocações; a Marionete poderá usar ataques de longa distância se for invocada quando o Dante estiver
  transformado"; depois "quero uma transformação canônica pra ele, uma boa transformação com um kit de habilidades
  melhoradas" (aprovado: Olhos Abertos com o kit proposto) e "pode melhorar o modelo dele e da Marionete também?".
- **Cânone** (wiki "Dante" e "A Marionete", lidas de novo — as referências locais se perderam com a pasta antiga):
  - em Calamidade o Dante fica de olhos fechados e sem as tatuagens à mostra; "ao abrir seus olhos [...] as tatuagens
    reaparecem, seus olhos se tornam completamente pretos e duas faixas surgem [...] orelhas levemente pontudas —
    bastante similar à de um Luzidio";
  - o Trinitá aprimorado ("clones que agem de forma independente [...] trocar a sua posição com qualquer uma das
    cópias"), o Paradoxo e o Eco Espiral "Eco Dolor" estão na lista de rituais de Calamidade;
  - Marcado pela Morte (vantagem contra Morte) é habilidade da ficha.
- **Modelos:** Dante v2 (~47 mil triângulos, um pouco acima do orçamento de 40 mil, como os outros remodelados) e a
  Marionete v2. A forma usa o mesmo .glb com as texturas trocadas.
- **Números:** Paradoxo 16/s (raio 3 m, 5 s, lentidão 0,65; invocações 60/s); Eco 40% de cada golpe 0,35 s depois
  (medido: golpe de 27 → eco de 9 no Kaiser, Morte contra Energia); Trinitá Aprimorado 4 cópias (17% cada), 9 s, troca
  a cada 1,2 s; Decadência 72 (11 m, 6/s por 4 s); Paradiso 110 sem envelhecer; Marcado pela Morte ×0,8; +100 de vida.
- **Ambiente:** a pasta antiga (D:\arena-paranormal) foi apagada e o repositório foi baixado de novo em
  E:\arena paranormal. O cache do npm apontava para D:\npm-cache (não existe mais): o `npm ci` precisou de
  `--cache` em outra pasta. As referências visuais e os .blend que não estavam no git se perderam (o dante.blend é novo).
- Observado: a `gallery.html` já mostrava o erro "Cannot access 'BloodZombie' before initialization" (ciclo de
  imports antigo; o jogo não é afetado) — fica para depois.
- Verificações: `check-roster` (regras novas), `npm test` (41), `npm run build`; a cena da transformação, cada habilidade
  da forma, as cópias, o Paradoxo e a Marionete nova conferidos no preview.

## v3.25.1 — Feito por Fãs

- Versão: `VERSION` 3.25.0 → **3.25.1** (package.json/lock junto).
- Pedido: "deixe um aviso no título que o jogo é fan made e deixe Dalmo como Sangue".
  - aviso na tela de "pressione start", abaixo das origens (some com o menu aberto, para não apertar as 10 opções);
  - Dalmo: no cânone as Manoplas do Colosso são de Energia (ficha de Hexatombe) — no jogo vira tudo Sangue, a pedido do
    usuário; os comentários registram o cânone.
- Verificações: `check-roster`, `npm test` (41), `npm run build` e `npm run moves`; o aviso conferido no preview (desktop
  e 812×375).

## v3.25.0 — Leve a Arena com Você

- Versão: `VERSION` 3.24.1 → **3.25.0** (package.json/lock junto).
- **Download** (pedido: "um botão no menu principal que leva pra uma página explicando como o jogo funciona, opção de
  download para jogar em executável sem ser web, isso pra celular e pc, dois diferentes"):
  - página `sobre.html` com o "voltar ao jogo"; o TODO adiava a versão instalável, mas o pedido trouxe agora;
  - **PC:** Electron 33 + electron-builder 25 (instalador NSIS, ~95 MB, sem assinatura de código: o Windows mostra o
    aviso "Executar assim mesmo", explicado na página). Gerado e aberto aqui: menu, modelos, a página e o voltar
    funcionando dentro do app. No Windows sem modo desenvolvedor o electron-builder falha ao extrair o `winCodeSign`
    (links simbólicos do macOS) — extraído à mão no cache (`winCodeSign-2.6.0`);
  - **Android:** Capacitor 6; sem Java/Android SDK nesta máquina, o APK só é gerado no GitHub Actions
    (`release-apps.yml`). É o APK de debug (instala com "fontes desconhecidas"); para a Play Store faltaria uma chave
    de assinatura de release;
  - **iPhone:** fora da App Store não dá para instalar — a página manda jogar pelo site;
  - os botões apontam para `releases/latest/download/...`: dão 404 até a primeira release dos apps existir. **Para
    publicar:** depois do push, criar e enviar a tag `v3.25.0`; o workflow gera os dois arquivos e a release (com as
    notas desta versão).
- **Pergunta do usuário** ("por que essa última versão não teve changelog?"): a 3.24.1 tinha a entrada em `version.js`
  e no site publicado (conferido no bundle em produção); provavelmente o navegador ainda estava com a versão anterior
  em cache. A partir desta versão as notas também saem na release do GitHub.
- Verificações: `check-roster`, `npm test` (41) e `npm run build`; o menu (desktop e 812×375) e a página (375 px, sem
  rolagem lateral) conferidos no preview; o `.exe` instalado e testado por CDP.

## v3.24.1 — Último Sacrifício

- Versão: `VERSION` 3.24.0 → **3.24.1** (package.json/lock junto).
- **Cristopher** (pedidos: o especial "Por você, Filho!"; a Transformação "Último Sacrifício": "perde vida com o tempo,
  de pouco em pouco, mas ganha mais força física com seu instinto protetor"; depois "uns 3-5 de vida em troca de mais
  força"; e por fim "quanto menos vida, mais força — analise o quanto aumentar para quanto de vida"):
  - curva: entra com ≤ 35% da vida (~525) a ×1,25; em linha reta até ×1,8 perto de zero (com ~17%, ×1,52); medido no
    preview: o jab vai de 22 para 28 / 34 / 39;
  - perda: começa em 3/s e sobe até 5/s em 40 s (medido: ~3,5/s nos primeiros 20 s, ~4,8/s depois); para em 1 de vida —
    o sacrifício leva ao pico de força, mas o golpe final é sempre do adversário; o Levanta, Grandão! repõe 80;
  - vale só para a força física (socos, chutes, o mergulho, o suplex e o carro); o especial fica de fora.
- **TODO revisado** (pedido: "veja quais outras upds tem no todo para resolver"): 751 itens abertos, muitos defasados
  (o documento ainda dizia v3.10.0). Desta lista entraram os rápidos: volume, efeitos de tela reduzidos (as falas são
  só texto, então não há volume de falas), o cabo do Anfitrião e as checagens novas do `check-roster`. Continuam
  abertos, entre outros: a tradução das falas/golpes/descrições para os 13 idiomas, carregar sob demanda e comprimir os
  `.glb`, qualidade gráfica, a Máscara das Pessoas nas Sombras do Joui, a referência visual da Aghata, idles próprios,
  o `npm run balance`, o teste automático dos kits e os modos (Torre: modificadores/recompensas; Torneio online).
- Verificações: `check-roster` (com as regras novas), `npm test` (41) e `npm run build`; Opções, efeitos reduzidos, o
  cabo e a transformação conferidos no preview.

## v3.24.0 — Retroceder Nunca

- Versão: `VERSION` 3.23.1 → **3.24.0** (package.json/lock junto). O especial do Cristino ("Odeio Gente Barulhenta") já
  foi no commit do usuário "upd cristino".
- **Cristopher "Cris" Cohen** (pedido: "pesquise sobre Christopher Cohen"; kit aprovado com o elemento **Sangue**):
  - grafia oficial **Cristopher** (sem h; "Christopher" só na ficha do LJoga e na graphic novel); já estava no banco de
    lore, sem id; não tem afinidade no cânone — Sangue escolhido pelo usuário;
  - referências: wiki (arte promocional de OSNF, Desconjuração, graphic novel, miniatura) e Pinterest pelo Chrome do
    usuário; a wiki não lista arsenal — ele luta de punhos (a miniatura);
  - kit: Pancadaria de Dublê (fecha no chute giratório); □ Cena de Ação (`dashStrike` pelo □ de habilidade); Suplex
    de Dublê (`arenaGrab`); Direção Avançada (`stuntCar`, 78, quebra a defesa); Levanta, Grandão! (`healOverTime` 80);
    A Muralha (`heavyProtection`, −30% de dano, 3 golpes); passivas `thickSkin` + `heavyHand`; especial Retroceder
    Nunca, Render-se Jamais (`cinematicCombo`, 250); Transformação O Protetor (`awakenMode`: ×1,2 de dano, −20% de dano
    recebido, armadura a cada 3 s, 40% do empurrão, 3 de vida por segundo);
  - vida 1500 como todo o elenco humano; ~37 mil triângulos;
  - aprendido no caminho: o metaball negativo alcança bem além do próprio raio (cascas finas não funcionam por
    subtração) — o cabelo e a regata saíram melhor como cópia da malha do corpo (`clothe`).
- Verificações: `check-roster` (702 confrontos com falas + regras do Cristopher), `npm test` (41) e `npm run build`;
  todas as habilidades, o especial e a transformação executados no preview sem erro.

## v3.23.1 — Os Mesmos Rituais

- Versão: `VERSION` 3.23.0 → **3.23.1** (package.json/lock junto). A 3.22.0 e a 3.23.0 continuam sem commit.
- **Rituais padronizados** (pedido: "o Decadenza do Dante é de um jeito e o do Guizo é de outro, veja se acontece com
  outros golpes e deixe-os nas suas versões mais atualizadas"):
  - auditoria de todo o elenco e das formas pelo nome do ritual; divergências encontradas e a versão escolhida (a mais
    nova pelo `git log`): Decadência (espirais, v3.16), Embaralhar (`shuffle`, v3.16), Cicatrização (`agingHeal`, v3.16),
    Velocidade Mortal (`deadlySpeedTrail`, v3.16/v3.19), Amaldiçoar Arma com Sangue (números do Guizo, v3.16);
  - ficaram como estão, por serem da mesma versão e terem mecânicas próprias: o Teletransporte do Kian (`blink`) e o
    da Gal (`sparkTeleport`); Envelhecimento Localizado, Olhar do Desespero, Levitação e Controle Mental já eram iguais;
  - a Cicatrização só deixa grisalho quem tem a peça `hair` (o Guizo); no Dante e no Xande ela cura sem isso;
  - o Dante agora tem duas habilidades do tipo `decadence` (o □ Decadenza e a Destruição Temporal "Rotura").
- **Juan e Deus da Morte remodelados** (pedido: "os dois precisam de um remodel com a qualidade do Cristino"):
  - Juan: referências locais `Referencias visuais/Personagens/Juan Henri`; ~36 mil triângulos (o antigo tinha 29 mil);
    os acessórios em código (faca, braço de sangue, capuz erguido, olho vermelho) continuam no mesmo lugar;
  - Deus da Morte: referências da wiki "O Deus da Morte" (Livro de Regras, miniatura e cena de O Segredo na Floresta);
    mesmo esqueleto (~3,9 m); ~43 mil triângulos (o antigo tinha 37 mil); as texturas `lodo_tendon`/`lodo_chest`
    deixaram de ser usadas por ele;
  - corrigido no caminho: o contorno preto engolia as peças finas (grampos, franja) — material `fine_*` sem contorno.
- **Peixeira do Cristino** (pedido: "ele devia usar uma peixeira, uma espécie de machete brasileiro nordestino").
- Verificações: `check-roster` (com a regra nova), `npm test` (41) e `npm run build`; os três modelos conferidos no
  preview do jogo e as habilidades trocadas executadas sem erro.

## v3.23.0 — O Cangaceiro

- Versão: `VERSION` 3.22.0 → **3.23.0** (package.json/lock junto). A 3.22.0 continua sem commit; esta versão vai por cima.
- **Cristino** (pedido: "criar um novo personagem para testar a skill de modelagem"; referências: wiki "Cristino" — artes
  de frente, de costas, concept, Desertor, lampião, pingente, espingarda — e fan arts do Pinterest pelo Chrome do usuário,
  só para conferir leitura; equipe escolhida pelo usuário: **Transtornados**, página 2):
  - não existia em nenhuma documentação do projeto; a ficha alternativa dos Arquivos Secretos (Pacote 01) é paga e não
    está na wiki;
  - kit pelo cânone: Peixeira; Espingarda Socadeira (7 × 13, recarga 3,2 s, detona os lampiões em cadeia); Lampião
    Explosivo (55 + fogo 16/s por 5 s); Trilha de Lampiões (até 3, estouram a 1 m: 42 + fogo); Corda do Telhado
    (`teleportBehind` com `rope`); Decepar (60, sangra 6/s por 4 s, ×1,5 em alvo atordoado/agarrado/puxado); passiva
    Couro Curtido (`thickSkin` 0,7/0,7); especial Um, Dois, Três (`lanternCount`, 250 dividido 18/18/18/46%);
  - Transformação Tocado pela Coroa (`maskTransform` genérico, `cast_up`, vermelho) → **Cristino Desertor**: rifle
    3 × 26 sem a recarga longa, lampiões maiores, Corda e Decepar 25% mais rápidos, `precognition` (a Intenção),
    especial 300, +80 de vida;
  - vida 1500 como todo o elenco humano;
  - modelo: Builder (pesos do esqueleto) + escultura por metaballs em `sculpt_lib.py`, usada no cabelo, bigode, lenço,
    bolsa, copa do chapéu e calça bufante; ~45 mil triângulos (Jae 49 mil, Dalmo 38 mil);
  - corrigido no caminho: `irisR` no `eye()` é o raio da íris, não a cor do olho direito (o olho cego é pintado por cima);
    os rabiscos do Desertor só vão nas malhas com esqueleto e material toon (a chama do lampião é `MeshBasicMaterial`
    e quebrava o render).
- **Carniçal refeito do zero** (pedido; referências: arte do livro de regras e miniatura de O Segredo na Floresta; o
  usuário corrigiu: "não tem coroa de espinhos, é um crânio tomado por lodo" e "parece formas geométricas coladas"):
  - técnica nova: metaballs fundidos (negativos cavam órbitas e o topo do crânio), suavização, estrias por deslocamento,
    decimação e cor por vértice; ~18 mil triângulos (acima dos 5–15 mil sugeridos: as estrias precisam de geometria,
    porque o toon do jogo não usa normal map);
  - `npc_carnical.py` continua no `build.mjs` (é ele que gera o modelo novo); fonte `tools/blender/fonte/carnical.blend`;
  - `npcRig.js` liga `vertexColors` só em malha com `COLOR_0` (os outros NPCs não têm: conferido nos .glb).
- O Blender MCP conectou, mas sem Blender aberto com o addon; os modelos foram gerados pelo Blender do projeto em modo
  background (o mesmo `bpy`), com renders de conferência em 4 vistas e testes no preview do jogo.
- Verificações: `node tools/check-roster.mjs` (650 confrontos com falas + regras do Cristino), `npm test` (41) e
  `npm run build`.

## v3.22.0 — Do Outro Lado

- Versão: `VERSION` 3.21.0 → **3.22.0**. Parte do código já tinha ido no commit "upd pela metade" (4e64b97); esta
  versão fecha o pacote (verificações, changelogs, `.gitignore`).

- **Vida** (pedidos: "todos com a mesma vida 1500, sem mostrar o número"; "vida pesada não terá mais"; "os únicos com
  vida a mais serão os do Outro Lado — relíquias e futuramente criaturas"; "o tempo de round tem que caber na vida"):
  - `COMBAT.maxHealth` 1500. Saíram todos os `stats.maxHealth` do elenco humano (Lírio, Dalmo, Balu, Aguiar, Jae etc.).
  - Portadores 1800: O Diabo, Magistrada, Estrangeiro e Amigo. Ferreiro e Arnaldo só transformados:
    - Deus da Morte: máximo 1800, ergue-se com 1500 (`formHealth`);
    - Anfitrião: máximo 1800, `bonusHealth` 300.
  - Portador do Trono: máximo 2100 (O Diabo com `bonusHealth` 300). Demais formas: 1500 + o bônus da transformação.
  - O HUD não mostra mais o número (`.num` removido); o `HABILIDADES.md` também não.
  - Round: `roundTime` e `SETTINGS.timer` 150; `TIMER_OPTIONS` [45, 90, 120, 150, 180, ∞]. Um valor salvo antigo volta
    para 150.
  - A passiva Sangue de Ferro do Lírio virou só a marca do cânone.
- **Barras de vida**:
  - acabou a barra de chefe centralizada (`def.boss` removido do Deus da Morte); a da Marionete continua, porque é
    invocação;
  - `def.hpBar.style` → classes `.hb-blood`, `.hb-knowledge`, `.hb-signal`, `.hb-ink`, `.hb-death` e `.hb-energy`, com
    animação CSS; a vida baixa pulsa.
- **Mananciais** (wiki "Manancial": filhos do Ferreiro, salas brancas da Caverna, Símbolo Espiral):
  - `summonMananciais`: 3 `DanteClone` com o modelo `manancial`, animações `man_idle`/`man_run`/`man_scratch`/
    `man_grab`/`man_lunge`, 80 de vida, 10 s;
  - `onSlain`: toca a sirene (`siren`), escurece a tela e devolve 10 de sanidade ao Ferreiro.
- **O Carniçal** (wiki "Carniçal Preto da Morte"):
  - `npc_carnical.py`: corpo de Lodo em tendões, crânio apodrecido aberto e a espiral vermelha emissiva;
  - `Carnical` estende `BloodZombie` (claw, slam com knockback 7, bite como salto com derrubada, hypno que paralisa 1 s);
  - Corpo Fechado: imune a projéteis de bala (`isBullet`);
  - Instinto Mortal: abaixo de 50% fica 1,35× mais rápido e com recargas ×0,6;
  - um por vez, 380 de vida, 18 s.
- **Bichos da ilha** (wiki "Javalis Infectados" e os Cachorros Selvagens Infectados):
  - `npc_bicho_lib.py`: quadrúpedes de carne derretida, costelas, veias marrons, tinta escorrendo dos olhos e presas;
  - `InkBeast` estende `Marionette`: galope em diagonal, tremor e derrete numa poça ao morrer;
  - javali 170 (gore + charge que derruba), cão 80 (bite + pounce); matilhas sorteadas, 12 s.
- **Diabo**: hordas do O Diabo `[['weak'], ['weak', 'weak']]`; do Portador do Trono `[['weak', 'strong'], ['weak',
  'strong', 'weak']]`.
- **Jae**: o buff `veil` com `noLock`, usando `Fighter.untrackable()`:
  - os especiais de `STICKY_SPECIALS` erram com `whiffSpecial('hidden')`;
  - a bala curva e os projéteis teleguiados não a seguem.
- Testado:
  - Mananciais 62 de dano em 4 s, sirene e +10 de sanidade;
  - O Diabo sempre "ww" e o Portador do Trono "wSw";
  - Carniçal só 1, imune a tiro, Instinto Mortal ativa, 82 de dano em 5 s;
  - bichos 44 de dano em 5 s;
  - especial do Amigo contra a Jae no Shhh: erra; sem o Shhh: 206;
  - CPU × CPU sem erros.

## v3.21.0 — Quando o Sino Tocar

- Versão: `VERSION` 3.20.0 → **3.21.0**.

- **Amigo Imaginário: modelo, animações e golpes únicos** (pedido: "melhore o modelo do amigo imaginário, crie os golpes únicos
  dele, animações").
  - Modelo (`char_amigo.py`, referências: miniatura de perfil e a arte de frente da wiki). O capuz deixou de ser um tubo
    reto: virou um bulbo que cai em visor sobre o rosto, com bico pontudo e pregas, e se funde aos ombros caídos. A borda do
    rosto tem dentes de pano pendurados, inclusive na testa. Os espinhos de cone viraram BARBATANAS de pano: 5 no capuz e
    5 nas costas, diminuindo, e 3 de cada lado do capuz. O manto ganhou pregas e uma cauda que arrasta para trás, além de
    9 fitas que escorrem das costas até o chão. Na frente aparece o lado de baixo fibroso (tendões verticais e costelas
    em `sinew_amigo`). São 12 tentáculos, com as pontas enroladas, mangas rasgadas no cotovelo e garras longas e curvas.
    As mãos mudaram para o material das garras, porque com `skin` ficavam claras demais.
  - O JORRO de tinta (`def.inkStream`, `Fighter.updateInkStream`): dois cilindros ondulantes, presos ao `rig.root`, vão do
    socket `mouth` até o chão, com uma poça quando alcançam o chão. Somem em KO, derrubado ou invisível.
  - Animações `ai_*` (`charClips.js`): desliza em vez de correr, garras altas em diagonal (espelhadas por `mir`), chicote
    de corpo inteiro, dez garras, rasgar o quadro (cruza alto e rasga para fora), erguer, esmagar, desabar, arremesso do
    tentáculo, apontar, derramar (curva o capuz sobre a vítima), o sino (braços abertos, tremendo a cada badalada),
    dissolver, defesa de braços cruzados, carga e frenesi. O `anims` do Amigo remapeia point, gaze e breath para elas.
  - Golpes:
    - os chicotes (○ 3, ↑, trás, lado) fazem um `inkTentacle` sair do chão até o alvo (`s.tentacle`), e todo acerto
      espirra tinta (`impactFx: 'ink'`; os finalizadores também deixam poça);
    - □ com corda de tentáculo (`rope` + `ropeColor`/`ropeThick`) e a ponta `inkClaw`;
    - agarrão próprio: garras + `ai_tear`, com o finalizador `ink`.
  - Habilidades (`amigoPowers.js`):
    - **Derreter** (`inkMelt`): investida curta e agarrão de frente (110°), a tinta escorre por 0,9 s em 4 pulsos
      (44, sem defesa) e solta com `meltedFace` (5 s, 6/s, lento 0,85, fraco 0,9);
    - **Tentáculos que Prendem** (`inkTentacles`): poça de aviso debaixo do alvo (0,55 s), depois 4 tentáculos que se
      enrolam; preso por 1,3 s (32);
    - **O Sino** (`bellToll`): sino fantasma (`ghostBell`), 3 badaladas com ondas de 6 m (6 + 6 + 14, sem defesa); na
      última, atordoa (0,9 s) e aplica `bellDazed`, vulnerável ×1,2 por 4 s;
    - **Dissolver** (`inkDissolve`): o `rig.root` achata numa poça, invulnerável por 1,45 s, cura 90 e se refaz com um
      respingo (24 em 2,2 m).
  - Especial **Todo Mundo Vai Morrer** (`inkRequiem`):
    - aviso 0,6 s;
    - badalada, e 5 tentáculos erguem a vítima a 0,85 m;
    - desliza e dá 3 garras;
    - derrama tinta em 2 pulsos;
    - última badalada e o tentáculo bate a vítima no chão: `launch` + `lowLaunch`, com `meltedFace` de 4 s.
  - Testado:
    - Derreter 39 no Xande, com `meltedFace`;
    - Tentáculos 32, preso;
    - O Sino 25, com `bellDazed`;
    - Dissolver curou 88 e a escala voltou a 1;
    - especial 212, vítima derrubada;
    - combo com o tentáculo saindo do chão;
    - □ puxa.
  - CPU × CPU (10 lutas contra 5 do elenco): sem erros, com todos os golpes usados.

## v3.20.0 — O Amigo Imaginário

- Versão: `VERSION` 3.19.1 → **3.20.0**.

- **O Amigo Imaginário** (pedido: "comece a fazer o amigo imaginário de segredo na ilha"; elemento Tinta, marrom).
  Wiki "Amigo Imaginário" (arte da cinematic do corpo e a miniatura de perfil): 2 m, curvado para a frente, coluna
  retorcida com espinhos, capuz enorme e pontudo fundido ao corpo e rasgado em tiras até o chão, tentáculos negros,
  braços secos e escuros de garras, sem rosto (o buraco de onde escorre a tinta marrom).
  - Modelo `char_amigo.py`: capuz em `grid` que se projeta para a frente como um bico e, embaixo, se FUNDE aos ombros
    (a primeira versão deixava o capuz solto e um buraco no alto do manto); a borda do rosto em dentes de pano; o
    material do rosto escuro (sem textura ficava branco dentro do capuz); fios de tinta pendurados do rosto
    (`ink_amigo`) + `drips` no socket da boca em código; fileira de espinhos da nuca pelas costas; manto até o chão
    com a barra recortada em pontas; 40 tiras e 9 tentáculos pelo chão; braços com garras. Clip `ai_idle` (curvado).
  - Kit (elemento `tinta`): garras (`db_*`) e chicotes de tentáculo (`wave_punch`, 3,8 m); □ "Tentáculo" (`chainHook`
    que prende e puxa — o Agarrão da wiki); Derreter (`deathTouch`); Tentáculos que Prendem (`veinChains`); O Sino
    (`fearGaze` em 360°, 6 m); Dissolver (`healOverTime` 90); especial Todo Mundo Vai Morrer (`cinematicCombo`
    com `approach: 'chain'`); despertar Frenesi de Sangue (`awakenMode`: +20%, 1,3× velocidade, sangramento);
    passiva `lifesteal` 0,06. Vida 1100, tamanho 1,15, velocidade 7,0 (o Lírio continua o mais lento: 6,9).
  - Testado em luta: Derreter 57, Tentáculos 32, Dissolver cura 90, O Sino atordoa até quem está atrás, especial 216,
    Frenesi ativa. Falas: aberturas sussurradas ("o sino ecoa de dentro da criatura"), `VICTORY_AMIGO` com todo o
    elenco, vida baixa / especial / reação.
  - Agarrão: o do Diabo (garras). Os Portadores agora têm 6 (página 2: Mascarados + Portadores = 12 cartões).

## v3.19.1 — Transmissão e Tortura Mental

- Versão: `VERSION` 3.19.0 → **3.19.1**.

- **Elementos** (pedido: "Estrangeiro é do elemento de Transmissão (verde) e o Amigo Imaginário é de Tinta
  (marrom)"): `ELEMENTS.transmissao` e `ELEMENTS.tinta`. Fora do ciclo `BEATS` (Sangue > Conhecimento > Energia >
  Morte), então `elementMultiplier` devolve 1 contra eles. Todos os lugares que leem `ELEMENTS[...]` (HUD, seleção,
  lista de golpes, assistências, a cor do Fighter) já tinham reserva. O título mostra 7 losangos agora.
- **Estrangeiro** (pedidos: "rever os ataques do estrangeiro, melhorar a ultimate dele assim como ele faz com Xande no
  final de SDOL" e, corrigindo a primeira versão, "ele não abduz o Xande, ele o tortura fazendo se bater, o paralisa,
  controla seus movimentos"; "a abdução pode ser só mais um ataque, menos forte"). Wiki "Alexandre": "torturado pelo
  Estrangeiro e derretido pelo ser, perdendo todas as suas memórias".
  - Especial `mindTorture` "Tortura Mental" (`specials/mindTorture.js`): aviso de 0,75 s (sigilo verde debaixo do
    alvo; esquiva desvia; de frente defendendo → `trySpecialBlock`), o alvo TRAVA no chão (`stagger`) com fios de
    sinal (raios) da mão dele até cabeça/cotovelos/joelhos, três AUTOGOLPES com os próprios golpes do alvo
    (`melee.strikes[0..2]`, 15% cada, impacto na cabeça), `forced_kneel` (clip novo), APAGAR MEMÓRIA (recargas das
    habilidades no máximo × `sp.forget`, sanidade 0) e, depois de flutuar até a vítima, o TOQUE SUTIL (55%, lança
    baixo). 250 no total. Testado contra o Xande: 37/37/33 + 111 = 218, todas as recargas cheias, sanidade 1.
  - Habilidade `abductBeam` "Abdução" (R2 + △, 25 de custo, recarga 14 s, 40 de dano): círculo de aviso de 0,7 s; quem
    ficou dentro é ERGUIDO (`launch` alto, 16 de dano) e, 0,65 s depois, CRAVADO no chão (`spike`, 24). Testado: sobe
    2,3 m e cai derrubado.
  - Elemento `transmissao` em tudo; golpe novo "Pulso de Sinal" (3º da sequência, `wave_punch`, 3,6 m).
- **Menu** (pedido: "um personagem de cada equipe no lugar dos que estão no menu"): `titleStage` LINEUP era Aghata,
  Kaiser, Arthur, Joui e Gal (4 da Ordo + 1 Escripta) → Xande (Os Cinco), Kian (Escriptas), Arthur (Ordo, no centro),
  Jae (Mascarados) e O Diabo (Portadores).
- **Amigo Imaginário**: não fazer ainda (o usuário avisa); anotado no TODO com o elemento Tinta e o kit da wiki.
- **Conferência dos pedidos anteriores** (pedido: "conferir o que te pedi"): Dalmo Energia; Mascarados (Aguiar, Jae,
  Juan Sangue; Kemi Morte; Labirinto Energia); Diabo canônico com a transformação no Portador do Trono; Juan Ódio do
  Diabo → Portador do Trono; Magistrada (Máscaras, golpes novos, teleporte dourado, esfera); Guizo sorteando ET /
  bombado / velho; Gal e Guizo com a mesma Velocidade Mortal; Estrangeiro nos Portadores — tudo conferido no código.

## v3.19.0 — O Diabo, o Estrangeiro e as Máscaras

- Versão: `VERSION` 3.18.0 → **3.19.0**.

- **O Estrangeiro** (decisão do usuário: o Estrangeiro e o Amigo Imaginário entram nos Portadores mesmo sem portar
  Relíquia). Wiki "Estrangeiro" (arte do Livro de Regras): 2,5 m, máscara cinza de olhos verdes com a divisão, fios
  da máscara ao corpo, capa verde até o chão com ombreiras, roupa metálica esverdeada com detalhes pretos, manto que
  cobre as pernas, braços longos de pele cinza com braceletes e cinco garras. `char_estrangeiro.py` (Builder altura
  1,2; olhos e as formas do peito em material emissivo). Kit (Conhecimento — a ficha antes de Tenebris): garras nas
  animações do Diabo (`db_*`), □ `mindSigil` verde "Rajada Psíquica", Comandar (`mindControl`), Oblívio
  (`shadowVeil`), Aparição (`teleportBehind` `vanishFx: 'signal'`), Toque Sutil (`deathTouch`), especial Abdução
  (`cinematicCombo`), despertar Incubar (`awakenMode`), passiva `mindRead`. Falas completas e pares com Xande, Lírio
  e Guizo.
- **O Diabo canônico** (pedido: "o diabo não parece o diabo de Ordem Paranormal e sim a fusão dele com o Henri"):
  modelo novo `o_diabo.glb` pela miniatura que o usuário mandou (pele vermelha, chifres anelados curvados para trás,
  orelhas pontudas, sorriso de dentes finos, manto preto de capuz com frisos vermelhos, mangas largas, garras,
  pés de garras; o manto com abas sobrepostas para não mostrar as pernas). `o_diabo.awakening`: `awakenMode` Coroa de
  Espinhos → `devilPact` (Renascimento) para a forma `diabo` (o Portador do Trono, +150). O tamanho volta ao padrão.
  O Juan mantém Ódio do Diabo → Portador do Trono.
- **Magistrada**:
  - "Chamar as Máscaras" (pedido: "deve chamar as máscaras... pesquise sobre Nathaniel"; wiki "Seita das
    Máscaras" / "Nathaniel": túnicas brancas com partes pretas, corda de forca, cada máscara diferente — a do
    Nathaniel branca com o coração dourado invertido, estrelas de quatro pontas e lágrimas pretas). Habilidade
    `summonMasks` (△ → □, 35 de custo, recarga 24 s): 3 `DanteClone` com o modelo da Magistrada repintado
    (`restyle`), sem a bengala, subindo da sombra (`rise`), 70 de vida cada, socos e empurrões de sombra, 10 s.
    `DanteClone` ganhou `o` (`restyle`, `setup`, `strikes`, `hp`, `damageMult`, `element`, `rise`, `model`).
  - Físico refeito (pedido: os ataques "podem ser melhores"): no lugar da esgrima teatral do Arnaldo, a bengala
    (`slash_h` / `slash_h_back` / `slash_d` / `slash_finisher`) e a Mão das Sombras (`wave_punch`, 3,4 m); todo acerto
    com `impactFx: 'sigil'`.
  - Prisão das Sombras com `sp.sphere` (nova opção do `cinematicCombo`: esfera escura com anéis e Sigilos dourados
    girando; animada pelo update do especial, porque os tickers do mundo param na cinemática).
  - Teleporte (pedido: "está igual ao do Joui em vermelho"): `shadowDisc` aceita `rim` (a borda era vermelha fixa) e
    `teleportBehind` usa `a.color` + `a.vanishFx` ('sigil': distorção + anel dourado; 'signal': raios verdes).
- **Guizo** (pedido: "transformação aleatória... versão ET, versão bombado e outras"): `maskTransform` aceita
  `sp.randomForms` (sorteia `form`/`formBanner`/`swap`/`tint`; durante a partida em rede o `Math.random` é o sorteio
  com semente). Formas `guizo_bombado` (variante `addGuizoBombadoProps`: corpo ×1,24 de largura, sem a faca; socos do
  Kian ×1,25 de dano e ×1,3 de empurrão, 1100 de vida, `thickSkin`) e `guizo_velho` (referência "Guizo velho":
  cabelo grisalho e bigode; mais lento, □ ×1,35, rituais ×1,25 e recargas ×0,75). Testado: 0,1 → ET, 0,5 → bombado,
  0,9 → velho.
- **Gal** (pedido: "velocidade mortal de gal deve ser igual a do guizo"): `selfBuff` → `deadlySpeedTrail` com os
  mesmos números do Guizo (1,35 de velocidade, 1,25 de ritmo, esquivas de volta, rastros). ⚠ O Xande ainda usa a
  versão simples.
- **Elementos** (pedido: "dalmo é de sangue... pesquise"): a wiki diz Energia para as Manoplas do Colosso (Pressão
  Atmosférica) — o usuário mandou manter Energia. Os Assassinos fazem rituais de sacrifício de Sangue, mas cada um tem
  o seu: Kemi Morte (o rifle é amaldiçoado com Morte), Labirinto Energia, Aguiar/Jae/Juan Sangue. Nada mudou.
- **Revisão dos golpes pela wiki** (pedido: "verifique a documentação de todos os golpes"): script comparando o kit
  de cada um com os rituais/habilidades do `lore/MEMBROS.md`. Quase tudo bate; o que não está na wiki são itens do
  arsenal (granadas, correntes, revólver). Corrigido: Dante "Poça de Lodo" (inventada) → Destruição Temporal "Rotura"
  (`decadence`, cânone); Joui ganha Envelhecimento Localizado "Mateo" (R2 + △, `healOverTime` 80). O Xande está como
  Conhecimento por uma correção antiga; o `MEMBROS.md` diz Sangue, mas a wiki não define elemento para ele (rituais de
  Sangue, Conhecimento e Energia) — mantido. `gen-moves`: `launchHigh` mostrava "undefined" e as variações do □ que
  disparam habilidade também; `HABILIDADES.md` regenerado (agora com O Diabo, a Magistrada e o Estrangeiro).

## v3.18.0 — Portadores das Relíquias

- Versão: `VERSION` 3.17.1 → **3.18.0**.

- **Decisão do usuário**: separar o Diabo do Juan num grupo próprio, "Portadores das Relíquias", com Arnaldo e
  Ferreiro (que MANTÊM as transformações — Anfitrião e Deus da Morte) e, no futuro, a Magistrada, o Estrangeiro e o
  Amigo Imaginário (anotados no TODO). O Juan fica nos Mascarados com DUAS transformações: primeiro o Ódio do Diabo,
  depois, dentro dela, o Portador do Trono (a forma `diabo` de sempre). O Diabo também existe como lutador separado.
- **Equipe**: `TEAM_COLORS['Portadores das Relíquias'] = '#d8cfb8'` (branco-osso: não confunde com o amarelo da Ordo
  nem o vermelho dos Mascarados), `TEAM_SHORT` "Portadores". `ROSTER` termina em `oDiabo, arnaldo, ferreiro`; a seleção
  quebra a página por equipe (página 2: Mascarados + Portadores). Título: "... OS CINCO · MASCARADOS · PORTADORES".
- **O Diabo** (`o_diabo`): reaproveita o kit de `forms/diabo.js` (sem `form`/`baseId`). Como joga a luta inteira (a
  forma entra no fim do round, já ferida): vida padrão (1000, a forma tem 1150) e regeneração menor
  (`every` 6 → 8, `amount` 22 → 16; ferido 3,5 s/34 → 5 s/24). Golpes novos: Bote do Diabo (frente), Recua e Rasga
  (trás, dois acertos, invulnerável no recuo), Garra em Giro (lado) — todos fazem sangrar. Transformação
  `awakenMode` "Coroa de Espinhos": +15% de dano, −12% de dano recebido, todo golpe sangra, 3 de vida/s, cura 12%.
  `GRAB_SCENES.o_diabo = diabo`; diálogos: nome, gancho "um pacto", abertura/resposta, `VICTORY_DIABO` (21 × 2),
  fallback, vida baixa/especial/reação à transformação e o par especial `'juan+o_diabo'` na introdução.
  ⚠ Balanceamento não testado em partidas: valores de partida escolhidos por segurança; ajustar se o usuário pedir.
- **Juan — Ódio do Diabo** (`juan.awakening`: `maskTransform`, `scene: 'hate'`, `form: 'juan_odio'`, +80 de vida):
  cena nova em `maskTransform.js` — close na mão, corta o antebraço (sangue), o sangue sobe pelo braço (emissor),
  aparece `bloodHand` (o `bloodArm(...).fore` do Arthur preso em `eR`) e a faca some, `hood_pull` + `hoodUp` (capuz
  vermelho em código, `juanHood()`), `maskOn` acende o `hateEye` e a cena fica vermelha. Forma `juan_odio`: golpes
  físicos ×1,18, +0,3 de alcance, todos sangram, som de garra, roubo de vida 10% → 14%, velocidade 7,6 → 8,1, ritmo
  normal (attackSpeed 1,0), pinga sangue da mão direita.
- **Dois estágios** (`awakening.chain`): `Fighter.takeDamage` enche a Barra dentro de uma forma se o `awakening` dela
  tiver `chain` (com `fill` multiplicando — 3 no Ódio: ~240 de dano enchem); `canTransform` aceita forma com `chain`;
  `devilPact.canStart(f, sp)` aceita `sp.chain`. O `transform()` mantém o `baseForm` original (Juan), então o fim do
  round volta para o Juan. O trono afunda pelo flag `transformed` em vez de `!f.baseForm` (que agora já existe no 2º
  estágio). Testado: Juan → `juan_odio` (330/1000) → `diabo` (380/1150), `baseForm` = juan.
- **A Magistrada** (pedido "siga com o todo": o próximo Portador do TODO). Pesquisa na wiki ("A Magistrada",
  "Relíquias da Calamidade"): existem só QUATRO Relíquias — Sangue (Diabo), Conhecimento (Magistrada), Energia
  (Anfitrião) e Morte (Deus da Morte). ⚠ O Estrangeiro e o Amigo Imaginário NÃO são portadores no cânone (perguntar ao
  usuário se entram no grupo mesmo assim). Visual da última Magistrada (arte do Livro de Regras): `char_magistrada.py`
  com tronco próprio esguio, camisa branca, luvas pretas e pulseiras douradas, calça cinza-clara, capa marrom até os
  pés com franja e borda dourada, GOLA alta espetada atrás da cabeça (a face de dentro afastada — as duas na mesma
  superfície piscavam em xadrez), tecido branco do pescoço aos joelhos, corda de forca com o nó enrolado, corda na
  cintura, três correntes douradas, tranças. O rosto é a Máscara do Desespero pintada em `face_magistrada` (oval
  branca, três sulcos em folha, fenda de coração invertido, o Símbolo na testa). `bengala()` em `weapons.js` (haste,
  cabo em L dourado, corrente). Kit (Conhecimento): esgrima com a bengala nas animações do Arnaldo, □ `mindSigil`,
  `teleportBehind`, `fearGaze`, `mindControl` (2,5 s), `heavyProtection` (metade do dano por 5 s), `levitation`;
  especial `cinematicCombo` Prisão das Sombras (250); despertar `awakenMode` "Saber Tudo é Perder Tudo"; passiva
  `precognition` (Onipresença). Falas: abertura/resposta, `VICTORY_MAGISTRADA`, pares `kian+magistrada`,
  `joui+magistrada`, `arnaldo+magistrada`. Testado em luta: todas as habilidades rodam sem erro, especial 244 de dano.
- `check-roster`: ordem do elenco nova e o Juan conferindo os dois estágios.

## v3.17.1 — Retoques no elenco II

- Versão: `VERSION` 3.17.0 → **3.17.1**.

- Continuação da análise da v3.17.0 (pedido: "pode seguir com as upds"), agora com Dante, Juan, Erin e Xande.
- **Juan** (`char_juan.py`, arte "juan normal"): o cabelo era uma calota com um rabo em tubo e uma "placa" de franja.
  Agora: 26 mechas da testa até a nuca caindo nas costas (o lado esquerdo pulado), mechas da têmpora direita até o
  ombro, franja desfiada mais comprida sobre o olho esquerdo, meio rabo preso no alto de trás com a amarra vermelha e o
  raspado escuro atrás da orelha esquerda (`on_skull` cola a peça no crânio). Manto: manga direita inteira até o punho
  (abrindo), tiras esfiapadas na barra (`TEAR`) e nas bordas da abertura.
- **Pele do tronco** do Juan e do Diabo: `torso_juan`/`torso_diabo` caíam na categoria CLOTH (sem "skin" no nome) e
  eram tingidas pela luz da arena — ficavam rosadas/desbotadas ao lado dos braços. Renomeadas para `skin_torso_*`
  (texturas e materiais), como já tinha sido feito com o Kian e o Colosso. O `maskTransform` continua achando os
  materiais pelo sufixo `_juan`.
- **Dante** (`char_dante.py`, "dante corpo inteiro desenho"): o xale ficava quase todo atrás; `GAP` 0.13 → 0.075 e
  `cloak_len` com a frente bem mais curta (cobre o peito e para na barriga, os braços saem por baixo). `skin_dante`:
  manchas graúdas irregulares + pontilhado + espirais maiores (de longe lia como pontinhos soltos).
- **Erin** (`char_erin.py`): `hair_back` (tubo aberto) + 14 cones trocados por 24 mechas onduladas do alto da cabeça
  até os ombros, pontas virando para fora, uma em cada quatro no ruivo claro.
- **Xande**: o modelo já segue a descrição da wiki (não há imagens dele na pasta); o cabelo loiro-escuro fica rosado só
  sob a luz roxa do Cemitério. **Kaiser**: já fiel às referências. Sem mudanças nos dois.

## v3.17.0 — Retoques no elenco

- Versão: `VERSION` 3.16.4 → **3.17.0**.

- **Análise dos modelos** (pedido: "analise os modelos que precisam de update, como o da espada do joui"): os scripts
  mais antigos e simples eram Arthur, Aghata, Labirinto, Joui, Xande, Kaiser, Erin, Juan e Dante (90–180 linhas contra
  340–600 dos refeitos). Comparados com a pasta "Referencias visuais": Labirinto, Arthur, Aghata e a katana do Joui eram
  os mais distantes da arte; Kaiser já segue as referências; Xande não tem referência na pasta.
- **Katana do Joui** (`katana()`): `katanaShape(len, width, sori, side)` gera o perfil curvo em duas partes (`ji` aço
  escuro / `ha` fio claro com o hamon ondulado) e a ponta kissaki; tsuba vermelha octogonal com aro e seppa, habaki
  dourado, cabo branco com o ito vermelho em losangos, menuki, fuchi/kashira pretos e borla. `tipLength` 0.92 → 0.93.
  **Bainha** (`scabbard()`): `TubeGeometry` curva achatada, boca, kojiri com tampa, kurigata e o sageo enrolado com a
  laçada. Só visual.
- **Joui** (`char_joui.py`): o capuz caído virou um tubo grande nas costas com a borda vermelha e a costura.
- **Labirinto** (`char_labirinto.py` reescrito, mesmo esquema do Lírio): tronco `TT` magro, robe em `grid` com abertura
  `robe_gap(z)` — V fundo no peito e abas SOBREPOSTAS abaixo (gap negativo + `lap` empurrando a aba de cima para fora),
  dobra do transpasse, farrapos no decote e nos ombros, tiras na barra, saia de retalhos por baixo, mangas de robe que
  alargam até o punho com a barra esfiapada, corda diagonal dando a volta pelas costas + duas voltas na cintura com o
  nó, pernas e pés descalços, orelhas de abano. O elmo `prop_helmetOn` (+ papéis) continua igual. Textura da pele
  `#e2d2c6` com linhas avermelhadas → `#a99f95` com linhas finas escuras.
- **Arthur** (`char_arthur.py`): cabelo em mechas (`hair_pt`) que vão da testa até o COQUE no alto, grisalhas do lado
  direito, laterais soltas até a nuca, mecha na testa; barba `beard_shell` com borda em fios e o queixo em ponta, bigode
  castanho descendo até o cavanhaque; gola grande sobre o colete; suspensórios soltos nas coxas.
- **Aghata** (`char_aghata.py`): saem o colete com capuz e o lenço; entram a jaqueta curta (`leather_jacket`) de gola
  alta com bolsos e mangas até o meio do antebraço, a blusa de gola alta, correntes, luvas (`glove_red`), a flanela
  cáqui (`plaid` redesenhada) com a aba comprida na perna esquerda, jeans azul-petróleo e coturnos com cadarço e sola.
- **Correção dos contornos**: `Fighter.setOpacity` fazia `outline.visible = a > 0.95` em TODOS os contornos, inclusive
  os de props escondidos (`showProp(..., false)`) — o elmo do Labirinto, a `maskSide` do Joui etc. apareciam como
  silhuetas pretas. `rigFromGLB` grava `ol.userData.source` e `setOpacity` só mostra o contorno se a malha de origem e
  todos os pais estiverem visíveis (`shownInRig`).

## v3.16.4 — A Marreta Leonora

- Versão: `VERSION` 3.16.3 → **3.16.4**.

- **Lírio sem barba cheia** (pedido: "só uma barba rala"): `char_lirio.py` perdeu a malha de barba, o bigode e o
  material `beardm`; fica só a barba rala pintada em `face_lirio`. `lirio.glb` reconstruído.
- **Leonora refeita** (`leonora()` em `src/models/weapons.js`, arte da wiki "Marreta de Lírio"): cabeça um pouco mais
  comprida e estreita (R 0.19 → 0.17, L 0.42 → 0.46) com frisos de tábuas; as duas fileiras de espinhos de MADEIRA viraram
  espinhos curtos de METAL cravados nas cintas de ferro; tufo de pelo branco no encaixe do cabo; faixa preta enrolada no
  meio do cabo. Pata dourada e `userData.head` mantidos (só visual, sem mudança de alcance ou dano).

## v3.16.3 — A Escrita

- Versão: `VERSION` 3.16.2 → **3.16.3**.

- **Lírio refeito (referências da wiki: arte de Sinais do Outro Lado, miniatura, arte conceitual).** `char_lirio.py` novo:
  tronco robusto próprio, mangas azuis RASGADAS no cotovelo (farrapos), antebraços com cicatrizes e ataduras, luva com
  pelo e pata dourada (direita) e o pano laranja amarrado com as pontas (esquerda); sobretudo azul-escuro ABERTO e sem
  mangas até a canela, com pelo contínuo na barra, nas bordas, na gola e nas cavas (antes eram "cordas" de pelo);
  ombreiras de couro em camadas nos dois ombros, alças cruzando o peito, cinto com seis bolsinhas e fivela dourada, pata
  dourada, rádio e o colar "Voytek"; joelheiras e caneleiras de couro com tiras, sapatos marrons; cabelo longo jogado
  para trás com volume (mechas que descem da testa até a nuca e caem no ombro, mechas mais escuras, espetos no alto,
  mechas na testa) e a mecha LARANJA; barba rente com costeletas e bigode. `shirt_lirio` desenhada "em pé" (o emblema e a
  gola em V ficavam de cabeça para baixo).
- **Poderes do Kian — A ESCRITA** (`src/combat/kianPowers.js`, passiva `kianScript`): cada golpe físico escreve uma
  marca no adversário (a escrita brilha mais a cada marca); com 5 a escrita DETONA (45 de Conhecimento, não dá para
  defender, atordoa 0,5 s); as marcas somem com 5 s sem marcar. O Impacto Sigilar virou uma ONDA DE ESCRITA (visual
  `scriptWave`, deixa 2 marcas), o Teletransporte sem direção surge do lado dele já socando (34, 1 marca —
  `blink.strike`) e cada pedra da Levitação marca. Calamidade: detona com 4 marcas (60, atordoa 0,7 s).
- **Correção:** o tronco nu do Kian e do Colosso ficava roxo/rosa sob a luz das arenas (o material não era de pele) →
  `skin_torso_kian` / `skin_torso_dalmo`.

## v3.16.2 — Calamidade

- Versão: `VERSION` 3.16.1 → **3.16.2**.
- **Tatuagens do peito do Kian refeitas** (`torso_kian`): duas linhas paralelas de cada lado do pescoço até a clavícula e
  por cima dela até o ombro (seta), o V do ombro ao ESTERNO no meio do peito (antes cruzava baixo demais), a faixa sob o
  peitoral com setas, as diagonais de baixo que fecham o losango no umbigo, a linha do esterno; cada linha com halo de
  brilho; escrita escura em colunas dos dois lados da linha do meio e em fileiras nas clavículas.

- **Kian refeito (pedido do usuário; referências da pasta + miniaturas da wiki "Kian marcado em Desconjuração" e "Kian
  em Calamidade").** `char_kian.py` novo: tronco forte próprio (`TT`), braços com bíceps e antebraço, cabelo curto RENTE
  (como nas referências da pasta), calça cinza-escura, pés descalços com dedos. Texturas novas com brilho (`emissiveMap`):
  `torso_kian` (as linhas douradas dos lados do pescoço, por cima dos ombros com setas, o V até o esterno, a faixa sob o
  peitoral e a linha do abdômen; colunas de escrita escura; peito e gomos sombreados) e `arms_kian` (fileiras de escrita
  clara cobrindo braços, mãos e pés, com anéis dourados). Rosto refeito (`face_desconjurado`): SEM barba fora da Transformação, o sigilo anguloso na testa abaixo do cabelo, o
  traço dourado descendo do olho com o gancho e os três riscos escuros na diagonal (saíram o "KI AN" e a cruz), pele no
  tom do corpo, lábios mais cheios.
- **Transformação do Kian = Desconjuração → CALAMIDADE (pedido do usuário: "a barba cresce e ele fica mais
  poderoso").** Era o despertar Invólucro do Conhecimento (`awakenMode`); agora é `maskTransform` cena `calamity`: concentra, a
  escrita acende, a barba CRESCE (nenhuma → `prop_beard_m` → `prop_beard_f`:
  malha que contorna a mandíbula das costeletas ao queixo, abaixo do lábio, com bigode — a boca continua à mostra), as faixas se enrolam nos
  antebraços (`prop_wraps` com pontas soltas) e a luz dourada explode → forma `forms/kian_calamidade.js` (modelo
  `kian_calamidade`): físico +20% e impossível de defender (`unblockableMelee`, o Invólucro do Conhecimento continua),
  Impacto Sigilar 85, rituais +20%, mais rápido, Inexistir mais pesado, +100 de vida. Agarrão e fala de transformação.
- **Guizo:** pele bronzeada (`#c98d64`, era clara e rosada), cabelo refeito (mechas com volume que descem do topo e
  soltam as pontas, franja em pontas na testa, lados por cima das orelhas, espetos no alto inteiro, raiz preta); ombros arredondados da camiseta (antes quadrados) e manga que abre na barra, gola da camiseta e a gola
  listrada da camisa de baixo aparecendo, barra da calça dobrada em cima do coturno.

## v3.16.1 — Sombras no P1 vs P2

- Versão: `VERSION` 3.16.0 → **3.16.1**.

- **Habilidades que não funcionavam no P1 vs P2 (pedido do usuário: a invisibilidade da Jae).** Levantamento: nenhuma
  habilidade depende de a vítima ser CPU (cegueira, surdez e "perder o rastro" já valiam para humanos: o lutador para de
  se virar sozinho). Os clarões de tela são curtos e de cena (iguais para os dois). O problema era VISUAL — quem vê o
  quê numa tela só:
  - **Cego e surdo legíveis:** névoa escura na cabeça de quem está CEGO e chiado cinza em volta da cabeça de quem está
    SURDO, enquanto durarem (antes só o aviso escrito).
  - **"Shhh..." da Jae por quem olha a tela** (`stealth` no buff; `Fighter.ownerSees/stealthOpacity`): quem controla a
    Jae a vê como silhueta (38%) com um anel no chão na cor do jogador (P1 azul, P2 vermelho); no P1 vs P2 local os dois
    veem a silhueta e o que vale é o efeito em jogo (o adversário não se vira sozinho para ela, emboscada, bônus de
    assassina); contra a CPU continua quase invisível (12%); ONLINE ela some de verdade (6%) só na tela do adversário
    (`world.viewSlot` = lado deste computador — a transparência é só desenho, não mexe na simulação em lockstep).
  - **Câmera não entrega a Jae da CPU:** escondida de quem olha, a câmera enquadra o último lugar em que ela foi vista
    (`Fighter.camPos` → `CameraRig.update`). Só contra a CPU: no online a câmera define a direção do controle e precisa
    ser igual nos dois computadores; no P1 vs P2 a tela é uma só.

## v3.16.0 — Os Cinco gravando

- Versão: `VERSION` 3.15.1 → **3.16.0**.

- **Novo lutador: GUIZO (Guilherme R. Santos, Os Cinco, Morte)** — pedido do usuário com `Referencias visuais/Personagens/
  Guizo` (+ `guizo.txt`). Pesquisa na wiki (Guilherme_Santos, Alexandre): aparência, 9 rituais, habilidades (Eu Já
  Sabia...), arsenal (faca/machete de detalhes dourados), galeria (faca, adagas de Sangue e de Conhecimento, 7 disfarces
  do Distorcer Aparência), relação com o Alexandre (cumprimento secreto — não descrito, então não inventado).
  - **Modelo** `char_guizo.py`: tronco próprio (`TT`), camiseta AHLEVO (textura `shirt_guizo`: ovelha de cabeça para
    baixo, △ X O), camisa listrada (`sleeve_guizo`), fone no pescoço, colete de alças com bolsinhas e o rádio "GUIZO",
    fivela de alienígena dourada, pochete com adesivos e o pano xadrez (`plaid_guizo`), cinto atravessado com frascos,
    saco e a bainha, bolsas na coxa, calça rasgada (`pants_guizo`), coturnos com cadarço branco, mochila com adesivo de
    diabo, corrente, antena e lanterna; cabelo espetado vinho com raiz preta (`prop_hair`). Em código (`props.js`):
    `guizoKnife`, `camcorder` (mão esquerda; no ataque vai para o quadril — `grip.stow: 'hip'`), `etHead`.
  - **Kit** (`characters/guizo.js`): faca (5 golpes, o último com espiral de Morte — `impactFx: 'spiral'`), □ Invadir Mente
    (`mindSigil`, Conhecimento, "OS CINCO!" — o que ele fez no Fummu), △→○ Decadência, △→□ Amaldiçoar Arma com Sangue
    (`curseWeapon`), △+L2 Velocidade Mortal com rastros (`deadlySpeedTrail`, conjunto fixo de 5 rastros; 2 em tela de
    toque), R2+△ Embaralhar (`shuffle`: cópias `HoloCopy` que copiam a pose; `shuffleDodge` em damage.js), R2+×
    Espirais da Perdição (`doomSpirals`), ← + □ Cicatrização (`agingHeal`: cura e envelhece o cabelo), passivas
    Desacelerar Impacto (`slowImpact`) e Eu Já Sabia (`iKnewIt`). Especial Registro do Outro Lado (`cinematicCombo` com
    `copies` em volta do alvo, do lado oposto à câmera, e `outro`). Clipes `idle_guizo`, `film_cam`, `face_wipe`,
    `vic_guizo`.
  - **Transformação** Distorcer Aparência (cena `distort`) → `forms/guizo_et.js`: Conhecimento, faca dourada
    (`mindRead`), Rajada x3, Embaralhar com 4 cópias, Ligação Telepática (`mindLink`).
  - Falas (abertura/resposta, cenas com Xande e Lírio — "Chiquinho" e "Esquisito da Internet" são apelidos da wiki,
    20 vitórias e 20 derrotas, batalha), agarrões `guizo`/`guizo_et`, assistência genérica, `lore/membros.json`,
    `check-roster`. Seleção: Os Cinco = Xande, Guizo, Lírio (página 1 cheia).
  - Testado: combo 113, □ 30, Decadência 55 + decadência, Espirais 10 + lento/−25%, Embaralhar (2 golpes do Kaiser
    em cópias), Velocidade Mortal (rastros), Amaldiçoar (sangramento), Cicatrização 85 + cabelo, especial (3 cópias,
    sem sobras), transformação completa, Ligação Telepática, CPU × CPU sem NaN, ~7 ms/quadro no pior caso.
- **CPU (pergunta do usuário: "a inteligência não devia ser a mesma para todos?").** É a mesma lógica, mas ela ficava sem
  sanidade (só carregava a mais de 9 m) e a chance de habilidade era fixa e baixa — com qualquer personagem quase só
  socava; kits que funcionam sem sanidade (Gal) pareciam mais espertos. Agora: carrega o que falta quando nenhuma
  habilidade pronta cabe na sanidade e há espaço (> 4,5 m, sem ameaça); a chance cresce com a barra cheia
  (`spend`); a habilidade escolhida no meio de um combo vale por 1,6 s (era 0,9); chance base maior em todos os níveis.
  Tipos do Guizo nas listas da CPU (`SELF_TYPES`, `ACTIVE_BUFF_TYPES`, cura como `healOverTime`).
- **Correção:** a cena de abertura `'xande+lirio'` nunca aparecia (as chaves são em ordem alfabética) → `'lirio+xande'`.

- **Ferreiro refeito (pedido do usuário).** Referências da galeria da wiki (Portrait_Ferreiro, miniaturas de O Segredo
  na Floresta, arte dos Luzidios no Livro de Regras, capa do ep. 10, graphic novel) + a descrição da wiki. Modelo novo
  `tools/blender/char_ferreiro.py`: tronco em V próprio (`TT`, mesmo esquema do Dalmo), braços enormes com bíceps,
  cotovelo estreito e antebraço de ferreiro, inteiros com as queimaduras (textura `arms_luzidio` refeita: placas
  marrom-avermelhadas com contorno escuro, mais densas no antebraço); braceletes largos e lisos com bordas; peitoral de
  placa com decote, vinco e bordas grossas + 3 lâminas na barriga; alças de couro por cima dos ombros (o "avental"),
  rebites; pano vermelho (faixa na cintura + abas na frente e atrás) com duas correntes penduradas e uma em volta;
  calça marrom mais grossa, faixas abaixo do joelho, caneleira segmentada, joelheira, meia preta e chinela com tiras;
  orelhas pontudas longas; cabelo branco penteado para trás com topete (mechas da testa até a nuca); barba longa e
  pontuda até o peito com mechas e bigode caído (material `fur_white`). Saíram as ombreiras e a saia com tachas.
- `src/dev/lineup.js`: opção `size` (enquadra personagens grandes).

## v3.15.1 — Aí sim, neném!

- Versão: `VERSION` 3.15.0 → **3.15.1**.

- **"Aí Sim, Neném!" com o choque dos punhos (pedido do usuário).** Clipe novo `fist_clang` (abre os braços e bate um
  punho no outro na frente do peito, duas vezes). O especial do Colosso bate os punhos na preparação e de novo cara a
  cara, antes da sequência; o letreiro entra no segundo CLANG. `cinematicCombo` ganhou `prepare.beats` e golpes de cena
  `noHit` (sem dano) com `beats` → `beatFx` (som `fistClang`, faíscas, clarão, anel e distorção entre as mãos).
- **Manoplas de metal** (wiki: "manoplas com espinhos feitas de metal"): no Colosso a luva de couro virou manopla de
  ferro (`iron_colosso`) fechando o punho, placa de cobre nas costas da mão, punho rebitado, barra nos nós dos dedos
  com 4 espinhos para a frente e 2 nas costas.
- **Sons de porrada:** sons novos sintetizados `metalPunch` (soco gravado + tinido de metal) e `fistClang`. Colosso:
  todo golpe, habilidade, agarrão, contra-ataque e o especial soam `metalPunch` (`hitSound` em `heavyBlow`, `arenaGrab`,
  `stompQuake` e na passiva `arenaBlows`). Dalmo: joelhada com `heavyPunch` (era `kick`); o Pisão do Colosso não
  toca mais explosão — pancada grave + impacto.
- **Cor da equipe no fundo dos retratos** (`src/config/teams.js`, usado por `portraits.js` e `Screens.js`): Ordo
  amarelo, Mascarados vermelho, Os Cinco verde, Escriptas roxo, Luzidios azul-claro; quem não tem equipe usa a cor
  própria.
- **Menu de cenários:** grade 3 × 2 (antes 5 colunas com um cartão sozinho na 2ª linha); ◀ ▶ andam na linha e ▲ ▼
  trocam de linha na mesma coluna, dando a volta nas bordas (`cols()` lê a grade da tela, então vale no celular). Dica
  atualizada nos 13 idiomas.
- **TODO:** seção da Transcendência do Kian marcada como obsoleta (não está mais no kit); marcados como feitos os
  itens que já existem no código (Arma de Sangue consome vida, sniper carregado, Decepar +30%, habilidades do Joui e
  do Kaiser, elementos só nos rituais). Falta de verdade: Máscara das Pessoas nas Sombras (Joui).
- Testado: especial 263 de dano (igual a antes), 4 CLANGs e 5 socos de manopla; navegação dos cenários;
  check-roster 0 ✘, 41 testes, build.

## v3.15.0 — O Colosso

- Versão: `VERSION` 3.14.0 → **3.15.0** (Dalmo / O Colosso, Juan nos Mascarados, seleção por equipe, câmera NaN).

- **Dalmo refeito (pedido do usuário: o modelo base não estava bom e ele não deve ter arremessável).**
  - **Modelo** (`char_dalmo.py`): o tronco agora é próprio (`TT`: meia-largura, profundidade da FRENTE e das COSTAS por
    altura; `lib.torso_part` trocado por `dalmo_torso` antes do `b.body`), com barriga e peitoral para a frente e o
    trapézio descendo do pescoço largo até o ombro — acabou o "caixote". Braços montados à parte: manga com bíceps cheio,
    deltoide redondo, antebraço grosso de pele com faixas, punho maior. Camisa folgada (`shirt_pt`): decote aberto, fralda
    para fora mais comprida na frente e atrás, vincos; gola social grande (faixa + duas abas pontudas); textura nova
    `shirt_dalmo`. Calça cargo larga com quadril próprio, bolsos laterais, faixa abaixo do joelho e o pano franzido por
    cima do coturno; textura `pants_dalmo` com o joelho rasgado desfiado (antes era um círculo escuro). Coturno de cano
    alto com biqueira e sola escuras; o cadarço virou `prop_laces` (some no Colosso, por baixo da bota de cobre — `swap`
    e `addColossoProps`). Dreads (84) seguem o crânio e caem por gravidade: testa até a sobrancelha, lados até a
    mandíbula, nuca. Peças do Colosso reajustadas ao corpo novo (cinturão, caneleiras, botas, bolsos, braçadeiras, luvas).
  - **□ PODE VIR!** no lugar do Pneu Estourado (visual `tire` removido): `ranged.type = 'counter'` →
    `ABILITY_TYPES.arenaCounterStance` (clipe novo `arena_wall`). Na janela (0,10–0,85 s), golpe físico ou habilidade do
    ADVERSÁRIO vindo da frente e a até 3,4 m é anulado em `damage.js` (`'countered'`) → `Fighter.arenaRiposte` → um
    `arenaGrab` (`ranged.riposte`: cabeçada + empurrão, 52). Projéteis e especiais passam; no vazio, 0,4 s de
    recuperação. Colosso: **VEM, NENÉM!** (janela até 1,0 s; soco + cabeçada com pressão e crava no chão, 74). CPU: usa
    a postura quando o golpe vem chegando (`threat`), nunca de longe nem para interromper especial. Lista de golpes,
    tutorial e HABILIDADES.md mostram a descrição; assistência própria do Dalmo (sem tiro). `check-roster`: Dalmo e
    Colosso sem arremesso.
  - Testado: contra-ataque Dalmo 44 / Colosso 70 de dano (com escala de combo); no vazio volta ao normal em ~1,2 s;
    projétil da Kemi acerta normalmente durante a postura; CPU × CPU 90 s: 6 posturas, 2 contra-ataques, sem NaN.

- **Juan de volta aos Mascarados** (pedido do usuário; no futuro talvez vá para os "Sacrifícios"). A seleção agora quebra
  a página POR EQUIPE (`SEL_PAGES` em `Screens.js`): uma equipe que não cabe inteira no resto da página começa a
  próxima — os seis Mascarados ficam juntos na página 2.
- **Novo lutador: DALMO MAGNO / O COLOSSO (Mascarados, Energia).** Referências do usuário (`Referencias visuais/
  Personagens/Dalmo`, com o dossiê) + wiki (1,85 m, dreads, cicatrizes, axolote da filha Manu; o escafandro com três
  visores vermelhos rachados e o axolote pendurado; ficha FOR 4 / VIG 3 / AGI 1; Golpes de Arena, Pressão Atmosférica,
  Manoplas do Colosso). Modelo `tools/blender/char_dalmo.py` → `public/models/dalmo.glb` (enorme: camisa social escura
  `prop_shirt` com mangas arregaçadas, antebraços enfaixados, pulseira com o axolote, cargo verde rasgada, coturnos;
  `prop_colosso`: gola de cobre rebitada com espinhos, capa de pano cru no ombro, retalhos, mangueiras vermelhas, arnês e
  cinturão de espinhos, Manoplas de cobre, botas/caneleiras com espinhos). O escafandro é `colossoHelmet` (props.js).
  Texturas `face_dalmo`, `torso_dalmo` (cicatrizes), `pants_dalmo`.
  - **Kit:** combo de socos/cotovelada/joelhada (`arenaBlows`: o finalizador emenda uma cabeçada), □ **Pneu
    Estourado** (pneu de ônibus em arco, visual `tire`), △→○ **Pressão Atmosférica** (`heavyBlow` com `stun` e
    `pressure`: atordoa em vez de lançar, onda de pressão), △→□ **Agarrão de Arena** (tipo novo `arenaGrab`: agarra
    pela cabeça, cabeçadas segurando e crava no chão), △+L2 **Atropelar** (`dashStrike` que quebra a guarda), R2+△ **A
    Glória Era Viciante** (`selfBuff`: 3 golpes sem recuar, +15% dano, −15% recebido), especial **Finalização de Arena**
    (castiga, cabeçada, gancho e o PISÃO — a finalização do Mosto). Clipes novos `headbutt`, `stomp`, `head_hold`,
    `colosso_roar`, vitórias `vic_dalmo`/`vic_colosso`.
  - **Transformação O Colosso** (cena `helmet` do `maskTransform` + `sp.swap` + `sp.finalAnim`): segura o escafandro
    no peito, ergue, encaixa, a camisa some e o traje aparece, agacha de braços abertos e a aura vermelha explode (o gif).
    Forma `forms/colosso.js`: Manoplas (`atmosphericPressure`: todo soco solta pressão de Energia; finalizador atordoa),
    `thickSkin`, □ **Onda de Choque**, **Pressão Demolidora**, **Esmagar o Crânio**, **Pisão do Colosso** (tipo novo
    `stompQuake`), especial **Aí Sim, Neném!**. Entra na lista de vilões das Torres.
  - Falas (abertura/resposta/gancho, cenas com Aguiar, Kemi e Jae, 38 vitórias dele e 38 contra ele, falas de batalha),
    agarrões `dalmo`/`colosso`, `check-roster` com as regras do Dalmo/Colosso.
  - Testado: Pressão Atmosférica 58 + atordoa, Agarrão 72, Atropelar 44, pneu 42, especial 209; transformação na ordem
    certa (capacete → traje → urro → Colosso, 1420 de vida máx.); Pressão Demolidora 74 + atordoa, Esmagar o Crânio 103,
    Pisão 52, Onda de Choque 36, Aí Sim Neném 263; CPU usa Pressão/Agarrão/Glória e os Golpes de Arena emendam.
- **CORREÇÃO (câmera/NaN):** com a tela de tamanho zero (janela minimizada) o `aspect` da câmera virava NaN, a câmera e a
  direção do controle também, e um golpe lateral levava o lutador para posição NaN (sumia da arena para sempre). Agora a
  câmera usa 16:9 enquanto não há tamanho e a direção do controle nunca fica inválida.

- **Seleção agrupada por equipe/temporada (pedido do usuário).** `ROSTER` reordenado pelas associações da wiki
  (`lore/membros.json`): Ordo Realitas (Equipe E/Força D: Arthur, Joui, Kaiser, Dante, Erin, Aghata; Equipe Abutres:
  Balu; Aniquiladores: Arnaldo, Veríssimo) → Escriptas (Kian, Gal, Juan) → Os Cinco (Xande, Lírio) → Luzidios
  (Ferreiro) → página 2: Mascarados (Aguiar, Labirinto, Kemi, Jae). A grade é 3 × 5, então cada grupo ocupa linhas
  inteiras. Etiqueta colorida de equipe no canto de cada cartão (`TEAM_COLORS`/`TEAM_SHORT` em `Screens.js`, `.tm` no
  CSS). Juan passou a mostrar a origem "Escriptas" (a wiki o lista entre os Escriptas; antes aparecia como
  Mascarado). `check-roster` com a nova ordem.

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
