# Arena Paranormal — protótipo (V2)

Jogo de luta 3D em arena com temática paranormal. Combate rápido e acessível, com
movimentação livre, ataques direcionais, defesa, esquiva, habilidades por combinação de
botões e especiais cinematográficos. Feito com **Three.js + Vite**, roda no navegador.

```bash
npm install
npm run dev      # abre em http://localhost:5173 (ou a porta indicada)
npm run check    # verifica as regras do elenco (dano, X/Y da Injustiça, Desconjurado sem armas…)
npm run moves    # regenera HABILIDADES.md a partir dos dados dos personagens
```

- **[HABILIDADES.md](HABILIDADES.md)** — todos os golpes e habilidades com números (gerado dos dados).
- `gallery.html` — mostra todos os modelos e animações (ferramenta de desenvolvimento).

## Controles

| Ação | PlayStation | Xbox | P1 teclado | P2 teclado |
|---|---|---|---|---|
| Mover | Analógico | Analógico | W A S D | Setas |
| Ataque físico | ○ | B | F | Num1 / K |
| Ataque/habilidade principal | □ | X | G | Num2 / L |
| Carga de Poder (segurar = energia) | △ | Y | H | Num3 / Ç |
| Pulo | × | A | Espaço | Num0 / J |
| Defesa (segurar) | R2 | RT | Q | Num4 / U |
| **Esquiva** (+ direção) | L2 | LT | Shift esq. | Num . / P |
| **Dash** | × + × | A + A | Espaço + Espaço | Num0 + Num0 |
| **Dash longo** (Mascarado: teleporte) | △ + × | Y + A | H + Espaço | Num3 + Num0 |
| **Agarrão** (não defensável) | R2 + ○ | RT + B | Q + F | Num4 + Num1 |
| **Físico forte** | △ + ○ | Y + B | H + F | Num3 + Num1 |
| **Principal forte** | △ + □ | Y + X | H + G | Num3 + Num2 |
| Modificador (segurar + botão) | R1 | RB | R | Num6 / O |
| Pausa | Start | Start | Esc | Backspace |

- **Variações do físico:** ○ parado = sequência · frente + ○ = avanço · trás + ○ = defensivo/evasivo ·
  lado + ○ = golpe com passo lateral · no ar + ○ = golpe aéreo. A sequência termina num finalizador
  (lança, derruba, afasta ou atordoa).
- **Especial:** △ → △ → ○ (Y → Y → B). Custa 50 de sanidade.
- **Habilidades secundárias:** R1/RB + botão (veja cada personagem).
- **Dash:** × + × (toque duplo no pulo) avança rápido. △ + × é o dash longo, que persegue o adversário (10 de sanidade); no Mascarado, △ + × é o Teleporte das Sombras.
- **Agarrão:** Defesa + ○ (RT + B). Pega de perto e arremessa; não pode ser defendido, só esquivado. Errar deixa você exposto.
- **Versões fortes (como o dash longo):** △ + ○ = físico forte (finalizador ×1,6 que gasta 60 da defesa, 15 de sanidade) · △ + □ = principal forte (×1,6, projétil maior, +20 de sanidade).
- **Câmera:** sempre travada no adversário. L1/LB fica livre para funções futuras.
- Cada jogador lê teclado **e** controle ao mesmo tempo.
- **Menus:** A/× (Pulo, Enter) confirma · B/○ (Ataque físico, Esc) volta.
- **Fluxo:** Tela inicial → Batalha Solo / Batalha em Equipe (P1 VS P2, P1 VS CPU, CPU VS CPU) ou Treinamento →
  Personagens (os dois confirmam) → **COMEÇAR** → **Configurações** (tempo 30/60/90/99/120/∞, dificuldade da CPU
  Fácil/Normal/Difícil/Muito Difícil, rounds 1–3) → Cenário (com preview) → Carregamento → 3, 2, 1, LUTAR.
- **Seleção:** Y/△ escolhe personagem ou cenário **aleatório**; B/○ na seleção de personagens (com ninguém confirmado) volta para a tela inicial.
- **Opções** (menu principal e pausa): Tutorial (comandos na tela) · Tempo da luta · **Movimento**: direções da tela
  (padrão) ou relativo ao inimigo (↑ aproxima, ↓ recua, ←/→ orbitam).
- **Combo infinito (estilo Storm):** na sequência de ○, antes do finalizador, aperte **△ + ×** depois de acertar: o
  personagem dá um rush atrás do alvo e a sequência de ○ recomeça do 1º golpe — dá para repetir ○○○ → △+× → ○○○...
  Cada rush gasta 8 de sanidade; o dano cai com a escala de combo e quem apanha pode usar a Substituição.
- **Batalha em equipe:** líder + 2 assistências. **D-pad ◀ / ▶** (teclado P1 Z / C, P2 N / M) **chama** a assistência:
  com você **andando** ela apoia (buff, névoa, puxão, cura); **parado** ela ataca. Recarga de 18 s.
  **Analógico direito ◀ / ▶** (teclado P1 X / V, P2 Numpad / e * ou , e .) **troca** o personagem em campo pelo daquela
  assistência (estilo Storm 4): vida e sanidade são da equipe; quem sai vira a assistência. Recarga de 5 s.
- **Treinamento:** alvo parado (ou defendendo, ou CPU), vida que volta depois do combo, sanidade infinita, recargas
  sem espera — tudo na pausa. Select (Tab no teclado) reinicia a posição.
- **Tela de vitória:** vencedor no centro (render 3D na pose de vitória), fala conforme quem ele derrotou e a equipe.
- **PAUSA → COMANDOS** mostra todos os golpes dos dois lutadores.
- Teclas em `src/config/controls.js`. Nada no código usa tecla fixa.

## Elenco

| Personagem | Origem | Elemento | □ principal | R1/RB + botão | Especial | Passiva |
|---|---|---|---|---|---|---|
| KAISER | Ordo Realitas | Energia | M4 (varia com a direção) | □ Baforada Cinerária · ○ Acácia | Cinerária (névoa, sem dano direto) | Resistente (−10% de dano físico) |
| ARTHUR CERVERO | Ordo Realitas | Sangue | Sniper (segure □: ajoelha e mira — mais tempo, mais dano) | □ Rebirth · ○ Ódio Incontrolável "Templo do Ódio" · △ Paralisia de Sangue "Dystopia" | Arma de Sangue | — (luta só com chutes: tem um braço) |
| JOUI JOUKI | Ordo Realitas | Conhecimento | Sombra Rasteira | ○ Olhar do Desespero (△ + × Teleporte das Sombras) | Shi no Kage | Golpe pelas costas · Decepar |
| AGHATA | Ordo Realitas | Sangue | Faca Arremessada | □ Amaldiçoar Arma (Sangue) | Descarnar | Colar Banhado em Sangue |
| DANTE | Ordo Realitas | Morte | Decadenza (fumaça que apodrece) | □ Embaralhar "Trinitá" (3 clones com IA, 50% do dano) · ○ Tentáculos de Lodo · △ Cicatrização "Paradiso" | Invocação: A Marionete (NPC por 18 s, barra preta, pode ser destruída) | Concentração Inquebrável (rituais −10% de sanidade) |
| ERIN PARKER | Ordo Realitas | Energia | Escopeta calibre 12 (leque de chumbo) | □ Granada "Supernova" · × Granada "Nebulosa" (névoa) · ○ Bênção Maldita · △ Black Hole (cura) | Supernova (corre, tiro de escopeta e granada) | Amuleto Elétrico (choque em quem bate nela) |
| GAL SAL | Escriptas | Conhecimento | Corrente de Captura (procura, prende e puxa) | □ Corrente Gancho · × Teletransporte | Injustiça né? | Cura que cobra sanidade · Desviar de Balas · Bloqueio Perfeito |
| KIAN | Escriptas | Conhecimento | Impacto Sigilar | □ Teletransporte · ○ Lâmina do Medo · △ Transcendência · × Rejeitar Névoa | Inexistir (1x por partida, +1 ao Transcender) | Precognição |
| AGUIAR | Mascarados | Sangue | Machado na Corda (arremessa, sangra e puxa) | ○ Máscara do Mutilador Noturno · L2 Armadilha de Urso · × Predador de Sangue | Finalização do Mutilador | Filho da Dor (apanhando seguido, resiste mais) |

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
- **Queda:** derrubado fica no chão sem tomar dano; × ou L2 logo ao cair levanta rolando; senão levanta sozinho.
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
- **Esquiva:** L2/LT + direção. 4 cargas que recuperam conforme toma dano.
- **Substituição:** L2/LT **enquanto apanha** gasta 1 carga e reaparece atrás do atacante (como no Storm).
- **Agarrão:** R2 + ○. Não pode ser defendido; quem é agarrado escapa com **R2 + ○ logo no começo**, ou esquivando antes.
- **△ + ○ (físico forte):** gasta 60 da defesa do alvo — só quebra se ela já estiver gasta.
- **Transcender (todos):** com a vida em 30% ou menos, segure △ por 1 s. 1x por partida: +15% de dano por 12 s,
  aguenta 1 golpe sem reagir e recupera 30 de sanidade. (No Kian, também libera mais um Inexistir.)
- **Falas de introdução:** antes do ROUND 1, cada dupla tem falas baseadas no cânone (pule com × ou Start).

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
  arena/         arenas (ruinas.js) + registro
  fx/ audio/     partículas, correntes, marcas de corte, distorções; sons substituíveis
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

### Sons
Os sons são sintetizados na hora. Para usar arquivos, coloque-os em `public/sounds/` e liste
em `SOUND_FILES` (`src/audio/AudioManager.js`) com o mesmo nome do som.

## Limitações conhecidas
- Modelos, animações e sons são provisórios (serão refeitos com as referências visuais).
- Suporte a controle usa a Gamepad API do navegador (layout padrão Xbox/PlayStation); não testado com controle físico.
- Uma arena por enquanto.
