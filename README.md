# Arena Paranormal — protótipo (V2)

Jogo de luta 3D em arena com temática paranormal. Combate rápido e acessível, com
movimentação livre, ataques direcionais, defesa, esquiva, habilidades por combinação de
botões e especiais cinematográficos. Feito com **Three.js + Vite**, roda no navegador.

Versão atual do jogo: **v3.9.0**.

A numeração segue **MAJOR.MINOR.PATCH**: microatualizações usam `x.y.z`, atualizações concretas usam `x.y.0` e grandes marcos usam `x.0.0`.

```bash
npm install
npm run dev      # abre em http://localhost:5173 (ou a porta indicada)
npm run check    # verifica as regras do elenco (dano, X/Y da Injustiça, Kian sem armas…)
npm run moves    # regenera HABILIDADES.md a partir dos dados dos personagens
```

- **[HABILIDADES.md](HABILIDADES.md)** — todos os golpes e habilidades com números (gerado dos dados).
- `gallery.html` — mostra todos os modelos e animações (ferramenta de desenvolvimento).

## Controles

| Ação | PlayStation | Xbox | P1 teclado | P2 teclado | Celular |
|---|---|---|---|---|---|
| Mover | Analógico | Analógico | W A S D | Setas | Joystick |
| Carga de Poder (segurar = energia) | △ | Y | **I** | Num8 | △ |
| Ataque/habilidade principal | □ | X | **J** | Num4 | □ |
| Ataque físico | ○ | B | **L** | Num6 | ○ |
| Pulo | × | A | **K** / Espaço | Num2 / Num0 | × |
| **Assistência 1 / 2** (equipe) | L1 / R1 | LB / RB | **Q** / **R** (ou 1 / 2) | Num7 / Num3 | AS1 / AS2 |
| Defesa (segurar) | R2 | RT | **E** | Num9 | DEF |
| **Esquiva** (+ direção) | L2 | LT | Shift | Num1 | ESQ |
| **Dash** | × + × | A + A | K + K | Num2 + Num2 | × + × |
| **Dash longo** (Joui: teleporte) | △ + × | Y + A | I + K | Num8 + Num2 | △ + × |
| **Agarrão** (não defensável) | R2 + ○ | RT + B | E + L | Num9 + Num6 | DEF + ○ |
| **Habilidade de △ → ○** | △ → ○ | Y → B | I → L | Num8 → Num6 | △ → ○ |
| **Habilidade de △ → □** | △ → □ | Y → X | I → J | Num8 → Num4 | △ → □ |
| **Habilidade de △ + L2** | △ + L2 | Y + LT | I + Shift | Num8 + Num1 | △ + ESQ |
| **Habilidade de R2 + △** | R2 + △ | RT + Y | E + I | Num9 + Num8 | DEF + △ |
| **Habilidade de R2 + ×** | R2 + × | RT + A | E + K | Num9 + Num2 | DEF + × |
| **Especial** | △ → △ → ○ | Y → Y → B | I → I → L | Num8 → Num8 → Num6 | ESPECIAL |
| Trocar de personagem (equipe) | analógico dir. ◀ ▶ | analógico dir. ◀ ▶ | 3 / 4 | N- / N+ | ⇄1 ⇄2 |
| Página da seleção | L1 / R1 | LB / RB | Q / E | PgUp / PgDn | ◀ ▶ na grade |
| Pausa | Start | Start | Esc | Backspace | II |

- **Teclado:** os quatro botões de ação ficam em **losango (I J K L)**, na mesma posição do △ □ × ○ do controle;
  a mão esquerda fica com WASD + E (R2) + Shift (L2), e Q / R são o L1 / R1 (assistências). O jogador 2 usa o mesmo losango no teclado numérico.
- **Celular/tablet:** os botões aparecem sozinhos com tela de toque (no PC dá para testar com `?touch=1`); jogue
  com o aparelho deitado. Os cartões e opções dos menus também aceitam toque direto.

- **Variações do físico:** ○ parado = sequência · frente + ○ = avanço · trás + ○ = defensivo/evasivo ·
  lado + ○ = golpe com passo lateral · no ar + ○ = golpe aéreo. A sequência termina num finalizador
  (lança, derruba, afasta ou atordoa).
- **Especial:** △ → △ → ○ (Y → Y → B; teclado I → I → L). Custa 50 de sanidade.
- **Habilidades secundárias** (sem botão modificador): **△ → ○** e **△ → □** como no Storm 4 (toque △, solte e
  toque ○ / □ logo em seguida, em até 0,4 s — também valem juntos ou segurando △), **△ + L2** (juntos ou △ logo antes) e **R2 + △** / **R2 + ×** (segurando a defesa). R2 + ○ é o agarrão.
  Segurando △ para carregar, L2 sozinho continua sendo **esquiva** — dá para fugir no meio da carga.
- **Dash:** × + × (toque duplo no pulo) avança rápido. △ + × é o dash longo, que persegue o adversário (10 de sanidade); no Joui, △ + × é o Teleporte das Sombras.
- **Agarrão:** Defesa + ○ (RT + B). Pega de perto e arremessa; não pode ser defendido, só esquivado. Errar deixa você exposto.
- **Substituição:** aperte L2 enquanto apanha para gastar uma carga, escapar do combo e desviar com um passo curto para o lado (para onde o direcional aponta), reaparecendo perto de onde estava — nunca nas costas do adversário.
- **Câmera:** sempre travada no adversário. **L1 / R1** chamam as assistências na batalha em equipe.
- Cada jogador lê teclado **e** controle ao mesmo tempo.
- **Menus:** A/× (Pulo, Enter) confirma · B/○ (Ataque físico, Esc) volta.
- **Fluxo:** Tela inicial → Batalha Solo / Batalha em Equipe (P1 VS P2, P1 VS CPU, CPU VS CPU), Tutorial ou Treinamento →
  Personagens (os dois confirmam) → **COMEÇAR** → **Configurações** (tempo 30/60/90/99/120/∞, dificuldade da CPU
  Fácil/Normal/Difícil/Muito Difícil, rounds 1–3) → Cenário (com preview) → Carregamento → entrada dos lutadores com
  falas → **LUTEM** → round. ×/Start pula a apresentação; nos rounds seguintes, a chamada mostra o número do round.
- **Seleção:** Y/△ escolhe personagem ou cenário **aleatório**; B/○ na seleção de personagens (com ninguém confirmado) volta para a tela inicial.
- **Opções** (menu principal e pausa): Tempo da luta · **Movimento**: direções da tela
  (padrão) ou relativo ao inimigo (↑ aproxima, ↓ recua, ←/→ orbitam).
- **Especial pode ser interrompido:** ao ativar, o lutador concentra a energia por 0,45 s e fica vulnerável — um projétil
  (ou qualquer golpe) nesse momento cancela o especial (a sanidade gasta se perde; recarga curta de 4 s).
- **Combo infinito (estilo Storm):** na sequência de ○, antes do finalizador, aperte **△ + ×** depois de acertar: o
  personagem dá um rush atrás do alvo e a sequência de ○ recomeça do 1º golpe — dá para repetir ○○○ → △+× → ○○○...
  Cada rush gasta 8 de sanidade; o dano cai com a escala de combo e quem apanha pode usar a Substituição.
- **Online / LAN (pronto):** no menu inicial, **ONLINE / LAN**: escreva seu **nome de usuário** (fica salvo) e
  - **CRIAR SALA** — senha opcional e visibilidade **PÚBLICA** (aparece em SALAS ABERTAS) ou **PRIVADA** (só com o
    código); a sala recebe um código de 5 letras;
  - **SALAS ABERTAS** — lista das salas públicas abertas agora (🔒 = com senha); escolha uma para entrar;
  - **ENTRAR COM CÓDIGO** — código + senha (se tiver).
  Funciona pela internet, na mesma rede ou pela rede virtual do Radmin (precisa de internet para a apresentação e
  para a lista de salas). Quem cria a sala é o P1; cada um joga com o teclado do P1 (ou controle) do próprio
  computador. Os dois rodam a mesma luta, quadro a quadro; o canto da tela mostra os nomes, o ping e avisa quando está
  esperando o outro. Por enquanto só batalha solo (1 × 1).
- **Tutorial:** escolha um personagem e aprenda todos os golpes dele, passo a passo, contra um alvo parado: o cartão
  mostra o comando com as teclas do aparelho que você está usando e só avança quando você faz o golpe (a pausa pula
  um passo). Os comandos de cada ataque também aparecem sempre nos ícones da HUD.
- **Batalha em equipe:** líder + 2 assistências. **L1 / R1** (teclado P1 Q / R ou 1 / 2, P2 Num7 / Num3) **chama** a assistência:
  com você **andando** ela apoia (buff, névoa, puxão, cura); **parado** ela ataca. Recarga de 18 s.
  **Analógico direito ◀ / ▶** (teclado P1 3 / 4, P2 Num- / Num+) **troca** o personagem em campo pelo daquela
  assistência (estilo Storm 4): vida e sanidade são da equipe; quem sai vira a assistência. Recarga de 5 s.
- **Pausa:** enquanto o menu está aberto, os controladores de CPU ficam suspensos; CPUs não movem a seleção nem
  escolhem opções. Ao continuar, o controle da luta é restaurado.
- **Treinamento:** alvo parado (ou defendendo, ou CPU), vida que volta depois do combo, sanidade infinita, recargas
  sem espera — tudo na pausa. Select (Tab no teclado) reinicia a posição.
- **Tela de vitória:** os vencedores ficam no cenário, onde a luta terminou, de frente para a câmera — quem terminou
  a luta no meio, a equipe dos lados, cada um com a **pose de vitória própria** e o nome embaixo; a câmera escolhe um
  ângulo com visão livre. A fala, centralizada abaixo, é do personagem que terminou a luta. Os botões permitem revanche,
  retorno e saída.
- **PAUSA → COMANDOS** mostra todos os golpes dos dois lutadores (a lista rola com ▲ ▼, roda do mouse ou dedo).
- Teclas em `src/config/controls.js`. Nada no código usa tecla fixa.

## Elenco

| Personagem | Origem | Elemento | □ principal | Habilidades (□ / ○ / L2 = △ + botão · △ / × = R2 + botão) | Especial | Passiva |
|---|---|---|---|---|---|---|
| KAISER | Ordo Realitas | Energia | M4 (varia com a direção) | □ Baforada Cinerária · ○ Acácia · △ Dendrobium (raízes) · × Balas Amaldiçoadas (Desert Eagle) · L2 Granada Nebulosa | Cinerária (névoa → Acácia amplificada, 250; a névoa fica no mapa) | Resistente · Afinidade Elemental (rituais +15%) |
| ARTHUR CERVERO | Ordo Realitas | Sangue | Sniper (segure □: ajoelha e mira — mais tempo, mais dano) | □ Rebirth · ○ Ódio Incontrolável "Templo do Ódio" · △ Paralisia de Sangue "Dystopia" · L2 Analisar Brecha (+25% de dano físico no alvo) | Arma de Sangue | — (luta só com chutes: tem um braço) |
|JOUI JOUKI | Ordo Realitas | Conhecimento | Sombra Rasteira | ○ Olhar do Desespero · L2 Corte das Sombras (investida) (△ + × Teleporte das Sombras) | Shi no Kage | Golpe pelas costas · Decepar |
| AGHATA | Ordo Realitas | Sangue | Faca Arremessada | □ Amaldiçoar Arma (Sangue) · L2 Facas Amaldiçoadas · R2+× Passagem de Conhecimento · R2+△ Leitura de Rituais (3 em leque) | Descarnar | Colar Banhado em Sangue |
| DANTE | Ordo Realitas | Morte | Decadenza (fumaça que apodrece) | □ Embaralhar "Trinitá" (3 clones com IA, 50% do dano) · ○ Tentáculos de Lodo · △ Cicatrização "Paradiso" · L2 Poça de Lodo (lentidão) | Invocação: A Marionete (NPC por 18 s, barra preta, pode ser destruída; anda aos trancos, atravessa obstáculos e agarra com a Ironia do Destino) | Concentração Inquebrável (rituais −10% de sanidade) |
| ERIN PARKER | Ordo Realitas | Energia | Escopeta calibre 12 (leque de chumbo) | □ Granada "Supernova" · × Granada "Nebulosa" (névoa) · ○ Bênção Maldita · △ Black Hole (cura) · L2 Granada de Luz (atordoa) | Supernova (granada de luz que dá para evitar; se cegar: corre, tiro de escopeta e granada) · **Transformação:** Em Nome do Caos (máscara de gás, enlouquece: golpes e granadas mais fortes, sem cura; especial Em Nome do Caos — corre e se explode: 450 de dano, ela morre; se levar o rival junto ganha o round, senão perde) | Amuleto Elétrico (choque em quem bate nela) |
| GAL SAL | Escriptas | Conhecimento | Corrente de Captura (procura, prende e puxa) | □ Corrente Gancho · × Teletransporte · L2 Corrente Giratória (área) | Injustiça né? | Cura que cobra sanidade · Desviar de Balas · Bloqueio Perfeito |
| KIAN | Escriptas | Conhecimento | Impacto Sigilar | □ Teletransporte · ○ Lâmina do Medo · △ Levitação · × Rejeitar Névoa | Inexistir (2x por partida) | Precognição |
| LABIRINTO | Mascarados | Energia | Rajada Caótica (raio da Antena) | □ Labirinto Mental · ○ Mapa Sanguíneo · L2 Capturar Momento | O Labirinto é a Resposta · **Transformação:** Capacete do ??? → **???** até o fim do round (□ Tempestade Caótica · Labirinto Abissal · Consumir Momento · Tempestade Caótica em área · Revelação Sanguínea; especial mais forte) | Mente Labiríntica (atordoamentos −40%) |
| LÍRIO | Os Cinco | Sangue | Canivete de osso (curto e fraco: ele é de perto) | △ Golpe Pesado · ○ Cai Dentro (corre, ombrada, provoca) · □ Amarras de Sangue "Magras" · × Leonora Amaldiçoada · L2 Proteção Pesada | Leonora ("Hoje 'cê vai conhecer a Leonora!") | Sangue de Ferro (+15% de vida) · Casca Grossa (menos recuo e desgaste na defesa) · Mão Pesada (mais impacto) |
| FERREIRO | Luzidios | Morte | Lodo arremessado | ○ Hipnose Espiral · × Espada Consumidora (sangra) · △ Conforto de Santo Berço (cura) · L2 Armadura do Ferreiro | Consumir (4 cortes da Espada Consumidora) · **Transformação:** Pacto do Santo → **DEUS DA MORTE** (chefe 2x maior, barra preta, fraco a fogo e Energia, regenera) | Corpo de Luzidio (−8% de dano físico) |
| JUAN | Mascarados | Sangue | Lâmina de Sangue | △ Descarnar Discente · ○ Perturbação Discente · □ Vínculo de Sangue · L2 Armadura de Sangue Diabólica | Hemorragia Severa (5 cortes, o último sangra) · **Transformação:** Renascimento → sobe no Trono do Diabo e vira **O PORTADOR DO TRONO** até o fim do round (Senhor do Sangue — horda de 1–3 Zumbis de Sangue fracos ou 2 fracos + 1 forte, Sangue nos Arredores, Lança de Sangue que empala e deixa poça, Amaldiçoar Arma, Veias, Ódio do Diabo no alvo, Transportar que arrasta, Regeneração; especial Pacto: o alvo escolhe aceitar ou recusar) | Faca Predadora (cura 10%) · Masoquista (apanhar dá sanidade) · Sangue que Endurece (armadura a cada 400 de dano) |
| KEMI | Mascarados | Morte | Sniper Fantasma (segurar para mirar) | △ Disparo da Morte (tempo lento) · ○ Pistola Transtornada (arame farpado) · □ Perita · L2 Revólver .38 | Contrato de Morte (bala reta em câmera lenta com a espiral) · **Transformação:** Vestir as Faixas → **A FANTASMA** até o fim do round (Disparo Espiral: bala curva e rápida que acha o caminho por qualquer brecha e pega em qualquer lugar do mapa — só a esquiva escapa — e gasta muito da defesa · Sniper da Morte · Faixas · Some na Escuridão · Analítica) | Sede de Vingança (abaixo de 30% de vida: mais dano, velocidade e sanidade, 1x por round) |
| BALU | Ordo Realitas | Sangue | Machado em Giro (o machado volta para a mão) | △ Amaldiçoar Arma com Sangue · ○ Machado Demônio (paga com vida: maça de sangue) · R2+△ Fala Imponente (provoca) · L2 110% · R2+× Colete Físico-Balístico | Pancada do Urso | Resistência à Dor · Força Física · Derrubar e Atacar |
| XANDE | Os Cinco | Sangue | Skate Caótico (vai e volta) | □ Amaldiçoar Arma · ○ Polarização Caótica · △ Tela de Ruído (escudo de 140) · × Velocidade Mortal · L2 Cicatrização | Por Eles | Gladiador Paranormal (+3 sanidade por golpe) |
| AGUIAR | Mascarados | Sangue | Machado na Corda (arremessa, sangra e puxa) | ○ Ataque Especial · L2 Armadilha de Urso · × Predador de Sangue · △ Cães de Caça | Caçada no Acampamento · **Transformação:** Máscara do Mutilador Noturno → **MUTILADOR NOTURNO** até o fim do round (todo golpe sangra, Ataque Mutilador, Predador Perfeito, Finalização do Mutilador) | Filho da Dor (apanhando seguido, resiste mais) |

Todos os especiais ofensivos causam 250 de 1000 de vida (`COMBAT.specialDamage`), nenhum é hitkill.
Números de tudo em [HABILIDADES.md](HABILIDADES.md). Banco de outros membros das origens (para novos lutadores):
[lore/MEMBROS.md](lore/MEMBROS.md) · guia em [lore/NOTAS.md](lore/NOTAS.md).

**Regra do Gal Sal** (golpe físico): o golpe tira X de vida do inimigo, em seguida o **inimigo**
recupera Y (Y < X) e perde Y × 1,5 de sanidade. O Gal não se cura.
Exemplo: X=100, Y=60 → o inimigo perde 100, recupera 60 (saldo −40) e perde 90 de sanidade.

## Mecânicas

- **Sanidade (barra azul):** é o PE do cânone — gasta em rituais, habilidades e especial; enche segurando △.
- **Elementos:** Sangue supera Conhecimento, que supera Energia, que supera Morte, que supera Sangue (ciclo do
  *Diário de Deus*). Vale só para **rituais** (habilidades e especiais): ritual de quem supera causa +10%; de quem é
  superado, −10%. Golpes físicos e o ataque principal não mudam. Medo (Lâmina do Medo) é neutro.
- **Escala de combo:** a partir do 3º acerto seguido, cada golpe vale menos (até 50%). Especial e agarrão nunca
  caem abaixo de 75%. Só 1 lançamento por combo — o próximo vira empurrão. O contador "N ACERTOS" aparece na HUD.
- **Pausa no impacto** varia com o peso do golpe (leve, médio, pesado, lançamento).
- **Buffer:** ○ □ △ e L2 apertados um pouco antes de poder agir saem no primeiro quadro livre.
- **Marcador de dano:** mostra só o dano do combo atual, perto de quem bate, na cor do jogador (P1 azul, P2 vermelho);
  some pouco depois do combo acabar.
- **Combo vertical (dentro do combo):** ↑ + ○ lança para cima e o atacante sobe junto (até 3 golpes aéreos e o último
  crava no chão); ↓ + ○ derruba. × depois de acertar = dash de perseguição (até 2 por combo, inclusive no ar).
- **Queda:** todo fim de combo derruba. Derrubado fica no chão sem tomar dano (~1,4 s e mais 0,35 s ao levantar) —
  tempo para os dois carregarem a sanidade; × ou L2 logo ao cair levanta rolando; senão levanta sozinho.
- **Dash direcional:** × + × vai na direção do analógico (frente, trás, lados, diagonais); sem direção, vai até o inimigo.
- **Órbita:** com o lock-on, andar para o lado gira em volta do adversário mantendo a distância.
- **Carregar andando:** dá para andar segurando △ (anda a 45% e carrega a 50%).

## Defesa, esquiva e escapes

- **Defesa:** segurar R2/RT bloqueia golpes vindos da frente. Passa só 15% do dano físico (35% do resto),
  gasta a resistência (barra fina abaixo da sanidade) e quebra ao zerar, deixando o personagem
  atordoado. Quem bate na defesa fica exposto para contra-ataque. Defende até especiais (menos o Inexistir).
- **Perfect Block (todos):** apertar a defesa no instante do impacto anula o dano; golpe físico deixa o atacante aberto
  para contra-atacar. O Gal tem uma janela maior e atordoa mais.
- **Defesa direcional:** parado, a defesa gira devagar para acompanhar o adversário — golpes pelos lados podem passar e
  pelas costas não defende.
- **Passo da defesa:** segurando R2/RT, a direção não anda: o personagem emenda passos rápidos para os lados / trás,
  sempre de frente para o rival (como no Storm 4).
- **Esquiva:** L2/LT + direção. 4 cargas; recupera 1 a cada 70 de dano recebido. Gastou todas: por 3 s o dano não conta.
- **Especiais à distância têm aviso:** depois do preparo, o lutador faz o gesto e um sigilo pulsa no chão do alvo (ou a mira
  brilha nele). Esquive / Substituição no fim do aviso para desviar (quem usou fica exposto) ou defenda de frente.
- **Substituição:** L2/LT **enquanto apanha ou atordoado** gasta 1 carga, interrompe o combo do adversário (ele fica exposto) e desvia com um passo curto para o lado (direcional escolhe o lado); sem espaço, fica no mesmo lugar.
- **Agarrão:** R2 + ○. Não pode ser defendido; quem é agarrado escapa com **R2 + ○ logo no começo**, ou esquivando antes.
- **Barra de Transformação (todos):** enche conforme apanha. Cheia e com a vida em 35% ou menos, segure
  △ até a sanidade encher e passar do limite (+1 s): Juan, Kemi e Ferreiro se transformam (Diabo, Fantasma, Deus da
  Morte); os outros DESPERTAM num estado do cânone até o fim do round (Magnum Opus, Predador Perfeito, Sangue de Ferro...).
  Zera a cada round. (O antigo Transcender para todos saiu na v2.7.0.)
- **Falas de introdução:** antes do ROUND 1, cada dupla tem entradas caminhando e falas originais baseadas na
  personalidade e nas relações conhecidas (pule com × ou Start); depois aparece **LUTEM**. As falas de vitória também
  variam por confronto. Quando não há relação canônica conhecida, as provocações evitam inventar um passado comum.

### Identificadores internos dos personagens

Os IDs do elenco usam os nomes atuais: `kian`, `arthur`, `kaiser`, `joui`, `aghata` e `gal_sal`. Eles também nomeiam
seus arquivos de definição, scripts de modelo e assets `.glb`; nomes de rituais, habilidades e grupos da história
continuam com seus próprios termos canônicos.

## Arquitetura

```
src/
  config/        combat.js (regras globais, defesa, esquiva, finalizadores), controls.js
  characters/    UM arquivo de dados por personagem + index.js (elenco)
  models/        modelos 3D (separados das habilidades) + armas
  anim/          animações procedurais por keyframes (clips.js) e Animator
  combat/        Fighter (genérico), dano (defesa/contra-ataque/costas), projéteis, passivas,
                 abilities.js (habilidades por tipo), chargeFx, specials/ (mistField, cinematicCombo,
                 teleportStrike, ritual)
  camera/        CameraRig (enquadramento, colisão) e shots.js (planos de cinematic)
  arena/         cenários .glb (configs.js: luz/céu/limites) + registro (index.js) + texturas
  fx/ audio/     partículas, correntes, marcas de corte, distorções; sons substituíveis;
                 fx/library.js = efeitos com nome (FX_HIT_SMALL, FX_HIT_HEAVY, FX_DASH, FX_BLOCK,
                 FX_PERFECT_BLOCK, FX_BLOOD, FX_ENERGY, FX_EXPLOSION, FX_TELEPORT) via world.fx.play(nome, pos, opções)
  ui/ game/ ai/  HUD, telas, partida/rodadas, mundo da luta (zonas de névoa), CPU opcional
  dev/           ferramentas de teste usadas no console do navegador
```

O `Fighter` não tem código específico de personagem: tudo vem da definição.

### Adicionar um personagem ou habilidade
1. Crie `src/characters/novo.js` copiando um existente e ajuste golpes (`melee.strikes`,
   `forward`, `back`, `side`, `air`), `ranged`, `abilities` (escolha um `type` de `combat/abilities.js`),
   `special` (um `type` de `combat/specials/`), `passives`, `dodge` e `defense`.
2. Registre o modelo em `src/models/index.js` e adicione na lista `ROSTER`.
3. `npm run check` e `npm run moves`.

### Trocando os modelos (Blender)
Os modelos atuais são **provisórios**, montados com formas simples por código.
Para usar um modelo do Blender, exporte em `.glb` e troque a função do personagem em
`src/models/index.js` por uma que carregue o arquivo (GLTFLoader) e devolva um objeto com a
mesma interface do rig (`root`, `body`, `joints`, `sockets` como `handR`, `back` e `mouth`, `props`,
`showProp`, `setTint`). Para animações próprias, substitua o `Animator` por um que use
`THREE.AnimationMixer`, mantendo os mesmos nomes de clipe. Referências visuais futuras: `Referencias visuais/`.

### Cenários (Blender + modelos prontos)
Os 5 cenários (Ruínas do Ritual, Orfanato, Bar Suvaco Seco, Coliseu e Santo Berço) são montados no Blender por
`tools/blender/arena_<id>.py` com **peças prontas e gratuitas dos kits do Kenney** (CC0) — casas, árvores, muralhas,
lápides, móveis, ruas, carros — posicionadas por `tools/blender/kenney.py` (`put`, `house`, `tower`). Só os
elementos únicos de cada lugar são feitos à mão (Símbolo Espiral, círculo ritual, estátuas, placas). Os kits ficam em
`assets_src/kenney/` (fora do git; ver `assets_src/README.md`). Gerar: `node tools/blender/build.mjs <id>`.

### Sons
Os sons são sintetizados na hora. Para usar arquivos, coloque-os em `public/sounds/` e liste
em `SOUND_FILES` (`src/audio/AudioManager.js`) com o mesmo nome do som.

## Limitações conhecidas
- Modelos, animações e sons são provisórios (serão refeitos com as referências visuais).
- Suporte a controle usa a Gamepad API do navegador (layout padrão Xbox/PlayStation); não testado com controle físico.
- Os cenários dependem dos kits do Kenney baixados em `assets_src/` para serem gerados de novo (o `.glb` pronto já está em `public/arenas/`).
