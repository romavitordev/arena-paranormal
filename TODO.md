# TODO — Arena Paranormal

> Pesquisa de 2026-10-01: wiki de Ordem Paranormal (personagens, rituais, elementos) + mecânicas de jogos de luta
> (Naruto Storm 4 e jogos de luta tradicionais). Cada item diz **o que é**, **por quê** (cânone ou equilíbrio) e
> **como fazer** no código. Prioridade: 🔴 alta · 🟡 média · 🟢 baixa/ideia.
> Nada daqui está implementado, exceto o que estiver marcado com ✅.

---

## 0. Já feito nesta rodada

- ✅ **Kian: Transcender libera mais um Inexistir.** A primeira Transcendência da partida dá +1 uso do especial
  (máximo de 2 na partida). `special.bonusUseOnTranscend` em `src/characters/desconjurado.js`; o
  Fighter soma `specialBonusUses`. Testado no jogo: após o 1º Inexistir, ficou "USADO"; depois de Transcender,
  liberou e o 2º Inexistir funcionou; uma 2ª Transcendência não dá mais usos.
- ✅ **Origem e elemento** de cada lutador na seleção (sem arma) — §1.1.
- ✅ **Banco de membros das origens** para futuras adições: `lore/membros.json`, `lore/MEMBROS.md` e
  `lore/NOTAS.md` (`npm run lore`). 40 membros da Ordo Realitas e dos Escriptas com elemento, rituais e habilidades.

### Rodada 2 (2026-10-01) — implementado e testado no jogo
- ✅ 1.1 elementos com vantagem/desvantagem (+10% / −10%, Medo neutro) e elemento na HUD.
- ✅ 1.2 "energia" passou a se chamar **sanidade** na HUD, avisos e listas de comandos.
- ✅ 1.3 Transcendência do Kian cobra sanidade (sem regenerar durante, −15 no fim).
- ✅ 1.4 falas de introdução por dupla antes do ROUND 1 (`src/config/dialogues.js`, pula com × ou Start).
- ✅ 2.1 Kian: combo 250 → 212 (saiu o "Golpe no corpo"), Precognição, Lâmina do Medo é Medo, Rejeitar Névoa (R1 + ×).
- ✅ 2.2 Kaiser: Cinerária em 5 m, Resistente (−10% físico), Acácia (R1 + ○).
- ✅ 2.3 Arthur: Arma de Sangue (R1 + ○, paga 40 de vida) e Paralisia de Sangue "Dystopia" (R1 + △, paga 15 de vida).
- ✅ 2.4 Joui: contra-ataque virou Coincidência Forçada "Rodolfo", Decepar, alcance da sequência 2,4 → 2,2 m.
- ✅ 2.5 Agatha: combo 152 → 172, Colar Banhado em Sangue. (Nome e visual canônicos **ainda aguardam decisão**.)
- ✅ 2.6 Gal: Teletransporte em faíscas douradas (R1 + ×) e Desviar de Balas.
- ✅ 3.1 escala de combo + limite de 1 lançamento por combo + contador "N ACERTOS".
- ✅ 3.2 Substituição (L2 apanhando, 1 carga).
- ✅ 3.3 escapar do agarrão (R2 + ○ logo no começo).
- ✅ 3.4 Transcender para todos (vida ≤ 30%, segurar △).
- ✅ 3.6 buffer de comandos e pausa no impacto por peso.
- ✅ 3.7 invulnerabilidade ao levantar.
- ✅ 3.9 △ + ○ gasta 60 da defesa em vez de quebrar.
- ✅ 3.10 telemetria: `src/dev/balance.js` (`runBalance()` no console).
- ✅ Tela inicial nova (logo, círculo dos elementos, elenco por origem, menu com descrições); B na seleção volta para ela.
- ✅ Preview dos cenários (imagem renderizada de cada um; enquadramento em `thumbCamera`).
- ✅ Y/△ = personagem e cenário aleatórios.
- ✅ Bar Suvaco Seco: porta de 4,6 m sem a parede invisível (retângulos andáveis com sobreposição de verdade + checagem automática), mesa tirada da frente da porta, rua grande andável (calçadas dos dois lados, faixa, beco), árvores, prédios vizinhos com letreiros, postes, carros, ponto de ônibus.
- ✅ Telemetria (CPU × CPU, 5 lutas por par, 150 lutas): antes dos ajustes a Aghata vencia 98%; depois de faca mais lenta para sair (0,06 → 0,09 s), sangramento menor, Gal +4 por golpe, Arma de Sangue 7/s e Kaiser Resistente −10%, ficou: Kian 58% · Arthur 56% · Aghata 56% · Kaiser 44% · Gal 44% · Joui 42%.
- ✅ (revisado em 2026-10-01) 3.5 dash longo derrubável por agarrão/quebra, 3.8 limite de rajadas por dono
  (`COMBAT.maxVolleys`) e repetição do mesmo golpe (`COMBAT.repeat`), Templo do Ódio, Toque da Morte, Controle
  Mental e os visuais da V3 já estão no jogo.

### V2.3 (2026-10-01) — implementado por fases e testado no jogo
- ✅ Fase 1: limpeza entre partidas (HUD, marcadores, falas, NPCs, timers), fluxo Seleção → COMEÇAR → Configurações
  (tempo, dificuldade da CPU, rounds) → Cenário → Carregamento → 3, 2, 1, LUTAR; marcador de dano por combo.
- ✅ Fase 2: combo contínuo (atordoamento do físico cobre o próximo golpe), ↑ + ○ lançador + combo aéreo, ↓ + ○ derruba,
  dash de perseguição no combo, queda invulnerável com levantar rolando. Corrigidos: botões perdidos durante a pausa de
  impacto e ○ ignorado no começo de cada golpe.
- ✅ Fases 3–4: órbita com lock-on, dash direcional/diagonal, carregar andando (45%/50%), defesa direcional,
  Perfect Block para todos, esquiva com contra-ataque mais cedo. Opção de movimento relativo ao inimigo.
- ✅ Fase 5: sniper do Arthur ajoelhado com carga; especial renomeado para ARMA DE SANGUE; Templo do Ódio;
  Corrente de Captura do Gal; golpes ↑/↓ próprios dos 7; Kian mais pesado; anti-spam do teleporte do Joui.
- ✅ Fase 6: Treinamento (opções na pausa), CPU VS CPU, IA com 4 dificuldades (erra de propósito, defende,
  esquiva, perfect block, substituição, levanta rolando, joga na defensiva com vida baixa).
- ✅ Fase 7: Batalha Solo / Equipe, líder + 2 assistências contextuais (andando = apoio, parado = ataque), recarga, HUD.
- ✅ Fase 8: Trinitá = Dante + 3 clones com IA (50% do dano, um eco só de Decadenza/Tentáculos), clones destrutíveis;
  Marionete = NPC real (modelo, IA, 4 ataques, 450 de vida, 25 s, recarga 40 s, às vezes ataca o Dante),
  barra preta no topo e vinheta.
- ✅ Fase 9: tela de vitória (render 3D, falas por adversário, equipe), placa SUVAÇO SECO cabendo, câmera no aéreo,
  liberação de memória dos NPCs.
- ✅ Fase 10: casos extremos (especiais simultâneos, Trinitá + Marionete, fim de round, interrupções, tempo zerando,
  KO no dash, revanche), equipes CPU × CPU, telemetria final.
- Decisão do usuário: mapeamento de botões atual mantido (não o L1/R2/L2 sugerido no prompt).

### Rodada V3 + novos lutadores (2026-10-01)
- ✅ Elementos: vantagem/desvantagem só nos RITUAIS (habilidades e especiais), não em golpes físicos nem no □.
- ✅ Dash longo interrompível (golpe pesado/agarrão derruba), no máximo 2 disparos de um jogador no ar,
  mesmo golpe 3× seguidas causa 70%.
- ✅ Toque da Morte (Kian, R1 + L2) e Controle Mental (Gal, R1 + ○).
- ✅ V3 visual em todos: punhos fechados (fim das mãos-bola); Gal com poncho de verdade (ponta na frente/atrás,
  franja dourada, decote em V), cabelo repartido e venda com marcas; Arma de Sangue do Arthur virou um BRAÇO de
  sangue no ombro esquerdo (textura molhada, garras e espinhos; o especial bate com ele); 3 cicatrizes do Arthur;
  cabelo volumoso do Kaiser; pulseira Brasil/Itália/Japão do Joui; glifos KI/AN do Kian; xale do Dante com franja.
- ✅ ERIN PARKER (Ordo Realitas, Energia): adagas, escopeta, granadas Supernova/Nebulosa, Bênção Maldita, Black Hole,
  Amuleto Elétrico, especial Kaboom!.
- ✅ AGUIAR / MUTILADOR NOTURNO (Mascarados, Sangue): machado que faz sangrar, □ Machado na Corda (sem arma de fogo),
  Máscara do Mutilador (forte, rápido, armadura, sem defesa), Armadilha de Urso, Predador de Sangue, Filho da Dor,
  especial Finalização do Mutilador. Nova origem MASCARADOS na tela inicial e no banco de lore.
- ✅ Seleção estilo Storm 4: grade do P1 à esquerda e do P2 à direita (3 × 3), lutadores em 3D animados no centro
  (entram deslizando, pose de vitória ao confirmar; na equipe as assistências ficam atrás). Tela inicial sem os personagens.
- ✅ Equipe: D-pad ◀/▶ chama a assistência; analógico direito ◀/▶ TROCA de personagem (vida da equipe, recarga 5 s).
- ✅ Kian com físico ágil e encadeado (8 acertos em 2,1 s, empurrão baixo, rajada sigilar).
- ✅ Especial da Erin virou SUPERNOVA cinemático (corre com a escopeta, tiro, granada na mão, explosão, ela sorrindo).
- ✅ Combo infinito estilo Storm: △+× depois de acertar reinicia a sequência de ○ (custa 8 de sanidade por rush).
- ✅ LABIRINTO (Mascarados, Energia): A Antena, Rajada Caótica, Labirinto Mental, Consumir Momento, Capacete do ???,
  especial O Labirinto é a Resposta (muros sobem em volta do alvo + Tempestade Caótica), Mente Labiríntica.
- ✅ XANDE (Os Cinco, Sangue): taco com arame farpado, Skate Caótico (vai e volta), Amaldiçoar Arma, Polarização Caótica,
  Tela de Ruído (escudo), Velocidade Mortal, Gladiador Paranormal, especial Por Eles. Nova origem OS CINCO.
- Telemetria com 11 (1 luta por par): Dante 65%, Kian 65%, Joui/Aghata/Erin 55%, Kaiser 50%, Gal/Aguiar/Labirinto 45%,
  Arthur 35% (era 19%), Xande 35% (reforçado: skate 38, escudo 140).
- ✅ Xande anda de SKATE: andando um instante sobe no Skate Caótico (+40% de velocidade, pose de skatista, faíscas
  verdes); parar, atacar, defender ou apanhar desce. Configurável por personagem (def.mount).
### V4 — pipeline de assets (em andamento, do mais essencial/fácil para o mais complexo)
- ✅ Etapa 21 Exportação: auditoria automática `npm run audit` (ossos obrigatórios, UV, pesos, até 4 influências,
  escala aplicada, materiais duplicados, orçamento de triângulos). Todos os 11 personagens e 3 cenários passam.
- ✅ Etapa 20 Otimização: peças com o mesmo material são unidas na exportação (prop_* continuam separadas):
  de 26–75 malhas por personagem para 7–21 (menos chamadas de desenho). Triângulos: 21k–40k (Gal no limite).
- ✅ Etapa 15 Teste de pose: 9 poses (T, braço levantado, soco, chute, corrida, salto, agachamento, defesa, arma)
  em `src/dev/poseTest.js`. Nenhuma deformação de peso; corrigidos: faixas do Kian (viravam luvas gigantes) e a
  parabólica do Labirinto (tapava o rosto).
- ✅ Proporções pelo cânone (Joui 1,80 m = escala 1,0): Aghata 1,62 · Arthur 1,65 · Erin 1,70 · Kaiser/Xande 1,75 ·
  Aguiar 1,80 · Labirinto 1,95 (Dante, Kian e Gal sem altura na wiki: mantidos).
- ✅ Escultura do rosto (todos): nariz, arco das sobrancelhas, olhos fundos, maçãs, lábios e queixo em relevo, alinhados
  com a textura do rosto (cabeça com 4× mais resolução).
- ✅ Revisão por personagem: Kaiser (jaqueta acolchoada com forro roxo, mangas fofas, ribana, botões, mochila, franja
  mais fina mostrando o rosto); Arthur (colete trespassado com lapelas, manga esquerda vazia caindo até o quadril).
- ✅ Joui: corda da cintura trançada (3 voltas, textura de fios) com laçadas penduradas, cordão cru em X no peito e pingente.
- ✅ Aghata (só gráfico, mesmo design): colar com argola, cinto com fivela e corrente, rasgos nos joelhos, mecha vermelha.
- ✅ Dante: xale virou MANTO até os joelhos (aberto na frente, dobras de geometria, lados acompanham os ombros);
  cabelo liso com franja reta e laterais rentes (antes espetado).
- ✅ Kian: pontas das faixas curtas (antes tiras até o cotovelo) e calça cobrindo o quadril (aparecia pele na virilha).
- ✅ V4 etapa 7 Materiais: nomes MAT_<CATEGORIA>_<nome> (SKIN, HAIR, CLOTH, METAL, LEATHER, WEAPON, EFFECT) gerados
  automaticamente na exportação; o jogo procura a textura pelo nome curto.
- ✅ Especial interrompível: preparo de 0,45 s vulnerável; projétil/golpe cancela (CPU tenta interromper com tiro).
- ✅ Kaiser reforçado com o cânone: combo ágil com a karambit vermelha, Dendrobium (raízes), Balas Amaldiçoadas
  (Desert Eagle), granada Nebulosa, Afinidade Elemental (+15% em rituais) e especial Cinerária: solta a névoa, conjura a Acácia amplificada por ela (250) e a névoa fica parada no mapa por 10 s (bônus só com o Kaiser dentro).
- ✅ Xande: no skate o corpo vira para onde anda; ao bater o skate vai para as costas e o taco é seguro com as duas mãos;
  na defesa ergue o skate como escudo (bloqueio perfeito um pouco mais fácil).
- ✅ RB+LT (mod + esquiva) para todos: Armadura de Sangue (Arthur), Poça de Lodo (Dante), Granada de Luz (Erin,
  atordoa), Corrente Giratória (Gal), Tempestade Caótica (Labirinto), Corte das Sombras (Joui), Facas Amaldiçoadas
  (Aghata) e Cicatrização (Xande); Kaiser, Aguiar e Kian já tinham. Tipos novos: `sweepStrike` e `dashStrike`.
- ✅ Toque da Morte (Kian): recarga 55 s, alcance 1,3 m (colado, como o Inexistir) e o alvo fica FRACO (−20% de dano)
  até o fim do round.
- ✅ Machado do Aguiar: o fio branco flutuava do outro lado do cabo (era uma caixa reta); agora é uma faixa de aço
  curva no gume, com olho de ferro, contrapeso e manchas de sangue. O machado arremessado usa o mesmo modelo.
- ✅ NOVO: LÍRIO TELLINI (Os Cinco, Sinais do Outro Lado) — "a parede", Combatente Tropa de Choque (wiki).
  - Visual (arte promocional + miniaturas): 1,85 m robusto, cabelo loiro longo com mecha laranja, barba e costeleta;
    camisa azul de mangas rasgadas com emblema; sobretudo azul-escuro com pelugem branca; ombreira, joelheiras, alças,
    bolsas, walkie-talkie e broche de pata; luva com pata dourada (dir.) e pano laranja (esq.); plaqueta "Voytek";
    cicatrizes e ataduras. 36k triângulos, 18 ossos (auditoria ok).
  - LEONORA (código): cabeça-tambor de madeira com cintas de ferro, duas fileiras de espinhos e a pata dourada nas
    faces; cabo longo. Duas mãos sempre (grip.twoHand); andando/correndo vai no ombro; capacete azul na Proteção Pesada.
  - Kit: combo de 4 (horizontal → diagonal → vertical pesado → finalizador com resistência), ↑ lançador, ↓ crava no
    chão, golpe no chão em quem está CAÍDO (1 por queda), investida de aproximação, aéreo que crava. Habilidades:
    Golpe Pesado (6 fases, aguenta um golpe pequeno, errar deixa aberto), Cai Dentro (corre/ombrada, provoca: o inimigo
    só ataca de perto por 4 s), Amarras de Sangue "Magras", Leonora Amaldiçoada (Sangue), Proteção Pesada (capacete).
    Passivas: Sangue de Ferro (+15% vida), Casca Grossa (menos recuo, menos desgaste na defesa), Mão Pesada (mais
    impacto). Especial "Leonora" físico (pó, pedras, tremor). Bloqueio pesado com animação própria.
  - Equipe: como assistência, se o parceiro está apanhando entra CORRENDO (sem teletransporte), ombrada, provoca e dá
    3 s protegido ao parceiro; após 3 golpes seguidos no parceiro entra sozinho (recarga ×1,35).
  - IA: dicas por habilidade (Golpe Pesado só com abertura, Cai Dentro de longe, Proteção com vida baixa), golpe no
    chão quando o rival cai e sem repetir a mesma habilidade em seguida.
  - Sistemas genéricos novos: passivas knockbackMod/knockbackTakenMod/hitstunBonus/blockChipMod/guardDamageMod,
    `superArmor` temporária, golpes `otg`, buffs `takenMult`, `provoked`, FX_DUST e FX_GROUND_SMASH, efeito
    de especial 'smash', `runBalance({ focus })`.
  - Equilíbrio (CPU × CPU, 66 lutas por rodada contra todo o elenco): 1ª rodada 29% — a marretada de abertura era
    interrompida em ~35% das vezes (acertava aos 0,17 s); abertura mais rápida (0,11 s) → 52%. IA passou a usar o Golpe
    Pesado também contra quem defende → 52% (variação grande entre rodadas). Contra o Kaiser perdeu 5 de 6 nas duas
    rodadas: o kit dele é cheio de lentidão (névoa, Nebulosa, Dendrobium), que pune o personagem mais lento — contra
    natural, mantido. Vence com folga quem luta colado (Arthur, Joui, Gal, Kian).
- Gal, Erin, Aguiar, Labirinto e Xande já foram feitos/revisados com as referências nas rodadas anteriores.
- ✅ V4 etapa 12 Armature: esqueleto com root → hips → sp → chest → neck → hd, mãos (handL/R) e pés (footL/R),
  18 ossos em todos os 11 personagens (auditoria exige). Pesos: mão abaixo do punho, pé abaixo do tornozelo, pescoço
  misturado com a cabeça, peito no tronco de cima. Os ossos novos ainda seguem o pai (poses iguais); as armas agora
  ficam presas no osso da MÃO e mochila/capa no PEITO.
- ✅ V4 etapa 19 Efeitos: biblioteca `src/fx/library.js` com FX_HIT_SMALL, FX_HIT_HEAVY, FX_DASH, FX_BLOCK,
  FX_PERFECT_BLOCK, FX_BLOOD, FX_ENERGY, FX_EXPLOSION e FX_TELEPORT; golpes, defesa, bloqueio perfeito, dash,
  sangramento, explosões, troca e substituição usam os efeitos pelo nome (`world.fx.play`).
- ✅ Movimento secundário automático (glbRig): o pescoço leva 40% da rotação da cabeça; com o pé perto do chão e o
  corpo em pé, o tornozelo deixa o pé plano (agachado: pé de −48° para −5°; no chute/corrida o pé no ar fica livre).
  Custo ~0,02 ms por quadro. `rig.autoSecondary = false` desliga.
- ✅ V4 etapa 16 Animações: adicionadas CAMINHADA (analógico até a metade) e DERROTA (perdeu no tempo: cai de joelho,
  cabisbaixo). Todas as da lista agora existem (idle, caminhada, corrida, dash, salto, defesa, esquiva, ataques, combo,
  aéreo, especial, queda, levantar, vitória, derrota).
- ✅ V4 etapa 17 Movimento: com a câmera travada o lutador olha o adversário, então a locomoção agora segue a direção:
  frente = caminhada/corrida; trás = recuo de guarda (walk_back); lado andando = passo lateral (strafe_L/R);
  lado correndo = pernas giram até 70° para onde vai e o peito continua no adversário. A velocidade do clipe acompanha
  o deslocamento (campo `stride` em alturas de quadril; limite 1,9×) para o pé de apoio não patinar.
  Contato com o chão: se a pose afunda um pé no piso (parado −5 cm, defesa −12 cm), o quadril sobe o necessário.
- Equilíbrio (2 lutas por par, 40 por personagem): Dante 60%, Kaiser 55%, Erin 53%, Joui/Kian 48%, Xande 40% (era 28%),
  Arthur 38% (era 15%: chutes com menos empurrão), Gal/Aguiar 35%, Aghata 25%, Labirinto 20% (média de 3 medições 35%:
  reforçado combo 194 e Rajada 56). Variação entre rodadas ainda é de ±15% — amostras maiores ajudariam.
- Fidelidade (revisão com a wiki):
  - Aguiar ✔ visual completo (máscara da mão vermelha, colete rasgado, suspensório em X, esporas, cicatrizes, distintivo),
    machado vermelho que sangra, machado na corda (cena do píer), armadilha de urso, Predador de Sangue, máscara
    (Ataque Mutilador/Predador Perfeito). ✅ Adicionados os CÃES DE CAÇA (Rottweilers). Fica de fora: o revólver .38
    (cânone, removido a pedido) e o cronômetro. "Filho da Dor" é do Jasper (agente no corpo dele em Hexatombe).
  - Labirinto ✔ visual completo (cicatrizes em labirinto, túnica rasgada, retalhos, descalço, elmo do sorriso com papéis,
    cesto, a Antena), Rajada/Tempestade Caótica, Labirinto Mental, Consumir Momento, capacete, mente labiríntica.
    ✅ Labirinto Abissal agora é fiel: a direção é ESCOLHIDA por ele (a vítima anda até o Labirinto).
    Fica de fora (não são de combate): Capturar Momento e Mapa/Revelação Sanguínea.
  - Xande ✔ visual (boné, bandana, camiseta "oculto", joelheiras, broche dos Cinco, correntes, taco, skate);
    ✅ adicionados fones no pescoço, discman e os cabos neon dos Tênis Lépidos. Rituais: Amaldiçoar Arma, Polarização
    Caótica, Tela de Ruído, Velocidade Mortal e Gladiador Paranormal são fiéis. Ficam de fora: Vislumbre do Fim (óculos),
    Descarnar, Armadura de Sangue, Cicatrização, Perturbação, Tecer Ilusão, Sopro do Caos e o afinidade de Conhecimento
    do Amaldiçoar Arma (candidatos a variações futuras).
- Telemetria anterior (1 luta por par, CPU normal): Kaiser 69%, Kian 69%, Dante 63%, Aguiar 63%, Erin 56%, Joui 38%,
  Aghata 38%, Gal 38%, Arthur 19% — Arthur precisa de atenção na próxima rodada de equilíbrio.

---

## 1. Universo — o que vale trazer para o jogo

### 1.1 Os cinco elementos e o ciclo de vantagem 🔴

Segundo o *Diário de Deus* (wiki, "Elementos do Outro Lado"), cada elemento supera outro:

```
Sangue ──supera──▶ Conhecimento ──supera──▶ Energia ──supera──▶ Morte ──supera──▶ Sangue
                         (Medo fica fora do ciclo: é o próprio Outro Lado)
```

- *Sangue* (sentimento: dor, ódio, fome) — vermelho; rituais brutais, que custam dor/sangue.
- *Morte* (tempo: espirais, Lodo Preto, desacelerar/envelhecer) — preto e cinza.
- *Conhecimento* (consciência: sigilos, controle mental, teleporte) — dourado.
- *Energia* (caos: eletricidade, transformação, imprevisível) — roxo/verde.
- *Medo* — o desconhecido; só Marcados conjuram rituais de Medo (ex.: Lâmina do Medo, Inexistir).

Afinidade e origem de cada lutador — ✅ já no jogo (`origin`/`element` nos personagens, `src/config/elements.js`, mostrados na seleção). Origem: Kaiser, Arthur, Joui e Agatha = Ordo Realitas; Gal e Kian = Escriptas.

| Lutador | Afinidade (wiki) | Observação |
|---|---|---|
| Kaiser | **Energia** | Cinerária "pertence a todo o Outro Lado" (ícone de Medo) |
| Arthur Cervero | **Sangue** | Rebirth é ritual de Energia (verde em Desconjuração, roxo em Calamidade) |
| Joui Jouki | **Conhecimento** (definido pelo usuário) | Katana Erosiva (Morte) → Shi no Kage (Conhecimento) |
| Agatha | **Sangue** | Descarnar, Amaldiçoar Balas com Sangue, colar banhado em sangue |
| Gal | **Conhecimento** | Ereshkigal amaldiçoada com Conhecimento |
| Kian | **Conhecimento** (+ Medo, por ser Marcado) | Deus do Conhecimento |

**Proposta:** cada habilidade/projétil ganha `element`. Golpe de elemento que *supera* o do alvo: +10% de dano e
+20% de dano na defesa; elemento *superado*: −10%. Medo ignora o ciclo. Mostrar o ícone do elemento na HUD e na
seleção. Arquivos: `src/config/elements.js` (novo), `damage.js` (multiplicador), `characters/*.js` (`element`).
Cuidado: com 2 de Sangue e 2 de Conhecimento o ciclo fica desigual — validar com lutas CPU × CPU antes.

### 1.2 Sanidade, PE e Exposição Paranormal (NEX) 🟡

- No RPG, a **energia** do jogo corresponde a PE (pontos de esforço) e a **Sanidade** cai ao ver/usar o paranormal.
  Hoje "energia" e "sanidade" são a mesma barra (o Gal drena "sanidade", o Inexistir olha "sanidade cheia").
- **Proposta:** renomear a barra de energia para **SANIDADE / PE** de forma consistente na HUD e nos textos
  (já se fala "sanidade" nos popups). Opcional depois: barra de **Exposição Paranormal** que sobe com o uso de rituais
  (ver 3.4, Despertar).

### 1.3 Transcender tem custo ✅ (não regenera e drena no fim)

No cânone, transcender aumenta o poder, mas **custa sanidade** (e é como Kian virou Marcado). Hoje a Transcendência
do Kian custa só 35 de energia. **Proposta:** durante a Transcendência o Kian não regenera energia, e ela termina
drenando 15 de energia — combina com o "+1 Inexistir" sem deixar de graça.

### 1.4 Falas/intro de luta por par de personagens ✅ (`src/config/dialogues.js`)

A wiki dá relações fortes para usar em diálogos antes do 3, 2, 1 (estilo Storm):
- Kian × Kaiser: Kaiser foi **apagado** pelo Inexistir de Kian ao se sacrificar pelos amigos.
- Kian × Joui: Kian espancou Joui até a morte no **Coliseu** (a arena existe!); Joui deixou nas costas de Kian a
  ferida em forma do kanji "Morte" com a Shi no Kage.
- Kian × Gal: Kian **traiu** Gal com a Lâmina do Medo; Gal jurou matá-lo. Gal-Sal (o nome) era o líder escripta
  que torturou os pais de Kushim há 4000 anos.
- Joui × Gal: ódio mútuo — Gal matou a figura materna de Joui; Joui decepou o braço de Gal e tomou uma Ereshkigal.
- Arthur × Joui/Kaiser: "irmãos"; Arthur pegou a Shi no Kage depois da morte de Joui.
- Arthur × Agatha: ele a trata como irmã mais nova.
- Frase do Gal: "Injustiça, né? Muito prazer, eu sou a injustiça." (já virou o banner).
Arquivo novo `src/config/dialogues.js` com `{ [idA+idB]: [falaA, falaB] }`; mostrar na `beginIntro` do Match.

---

## 2. Personagens — fidelidade e equilíbrio

### Números atuais (referência)

| Lutador | Combo ○ (total) | Golpes | Alcance | Principal □ |
|---|---|---|---|---|
| Kaiser | 174 | 4 | 1,6–2,0 m | M4 16×4 = 64 (2,6 s) |
| Arthur | 184 | 4 | 1,4–2,0 m | Sniper 110 (3,6 s) |
| Joui | 194 | 6 | **2,3–2,6 m** | Sombra Rasteira 30 (4 s, 10 PE) |
| Agatha | 152 (+sangramento) | 5 | 1,55–1,8 m | Faca 40 (1,8 s) |
| Gal | 196 bruto (≈145 líquido, inimigo cura Y) | 5 | 2,0–3,6 m | Corrente 25 (5 s, 15 PE) |
| Kian | **250** | 6 | 1,5–1,8 m | Impacto Sigilar 70 (3,5 s, 20 PE) |

Leitura rápida: **Kian está forte demais** (maior combo + Lâmina do Medo 160 + Transcendência indefensável + agora
2 Inexistir). **Agatha é a mais fraca no corpo a corpo**. Joui tem o melhor alcance com o 2º maior combo.

### 2.1 Kian 🔴 (equilíbrio)
- Reduzir o combo de 250 para ~205: tirar o "Golpe no corpo" (38) ou baixar o finalizador para 54.
- **Precognição** (cânone: não pode ser pego desprevenido): imune ao bônus de costas do Joui e ao "surpreso" do
  teleporte. É fiel e dá identidade sem aumentar dano.
- **Lâmina do Medo**: no cânone mata na hora (Boris caiu instantaneamente). No jogo: manter 160, mas exigir a
  Transcendência ativa OU subir o custo para 50. Som de "melodia impossível" ao manifestar (cânone).
- **Rejeitar Névoa** (cânone): ritual que enfraquece rituais na área — contra-ataque natural à Cinerária do Kaiser.
  Ideia de habilidade nova se o kit precisar (ex.: R1+× anula zonas inimigas por 3 s).
- **Toque da Morte** (envelhecer o alvo) — reservar como ideia, é Morte, não combina com a afinidade.
- Visual (Calamidade): sem camisa, calça bege, descalço, barba preta grande, sigilos dourados no corpo e glifos
  KI/AN no lado direito do rosto, faixas nos antebraços. Conferir com o modelo atual na V3.

### 2.2 Kaiser 🟡
- **Cinerária** (cânone): névoa num raio de **5 m** que fortalece rituais dentro dela e dá bônus de esquiva e
  furtividade. O jogo já faz isso — conferir se a área está perto de 5 m e se "fortalece rituais" (bônus de
  dano em habilidades, não só no físico).
- **Acácia "Dissipar Espíritos"**: chuva de pequenas flores roxas que machuca o alvo (forte contra Energia).
  Candidata a habilidade R1 nova ou variação do □ (Kaiser hoje tem só Baforada + M4 com variações).
- **Resistente** (cânone): armadura natural de 3 contra dano físico → no jogo, −5% de dano físico recebido.
- Arsenal canônico para variar: Desert Eagle, faca karambit vermelha, **balas amaldiçoadas** (9), granada Nebulosa.
- Visual: cabelo preto volumoso até os ombros, olheiras, postura curvada, barba curta no queixo.

### 2.3 Arthur Cervero 🔴 (fidelidade)
- Cânone confirma: perdeu o **braço esquerdo** (arrancado pelo Minerador). ✔ igual ao jogo.
- **Arma de Sangue** (cânone): gasta PV para criar uma lâmina do próprio sangue — é a **Lâmina de Sangue** com que
  ele perfurou a testa de Kian. O especial continua com 250 (regra geral), mas ganha um uso extra fiel ao
  cânone: R1+○ cria a lâmina por 6 s (golpes físicos com mais alcance e sangramento) ao custo de 40 de vida.
- **Rebirth**: cânone tem caveiras que se movem na arma ✔. Em Calamidade os raios são **roxos**; em
  Desconjuração, **verdes** (o jogo usa verde, a pedido do usuário). Manter verde.
- **Paralisia de Sangue "Dystopia"**: paralisa o alvo (marca com o símbolo, arame farpado no braço). Boa
  habilidade nova de controle (ex.: tiro marca o alvo; R1+△ paralisa por 0,8 s quem estiver marcado).
- **Templo do Ódio**: dá força sobre-humana temporária, mas obriga a atacar. Ideia de buff: +20% de dano físico
  e não pode defender por 5 s.
- **Mira de Elite / Atirador de Elite**: segurar □ para mirar = mais dano e crítico (hoje o tiro é instantâneo).
- Visual: 1,65 m, forte, barba longa, cabelo castanho raspado nas laterais, **heterocromia** (olho esquerdo
  verde-azulado, direito castanho), três cicatrizes de garra no rosto. Conferir na V3.

### 2.4 Joui Jouki 🟡
- Cânone ✔: Teleporte das Sombras, Olhar do Desespero (paralisa de medo), Shi no Kage (katana preta com sigilos
  dourados, "Sombra da Morte"), Máscara das Pessoas nas Sombras (preta com detalhes vermelhos).
- **Coincidência Forçada "Rodolfo"** (cânone): vantagem para contra-atacar e bloquear golpes físicos — é a
  postura de contra que ele já tem; dar esse nome no jogo.
- **Decepar** (cânone): quando o alvo está "morrendo", decepa. Ideia: +30% de dano no finalizador se o inimigo
  estiver com menos de 20% de vida.
- **Um por Um**/**Ataque Poderoso**: casam com o novo △+○ (físico forte).
- Equilíbrio: tem o maior alcance do elenco (2,4 m) + bônus de costas. Reduzir o alcance da sequência para 2,2 m
  ou cortar um golpe da sequência rápida (6 → 5 golpes).
- Visual: nipo-brasileiro, 1,80 m, esguio (ginasta), cabelo curto e liso, roupas pretas; pulseira com bandeiras
  do Brasil, Itália e Japão (detalhe para a V3).

### 2.5 Agatha 🔴 (fidelidade + equilíbrio)
- **Nome:** na wiki é **"Agatha Volkomenn"**; no jogo está "AGHATA". Confirmar com o usuário qual grafia quer.
- **Aparência canônica bem diferente do modelo atual:** por causa da troca de corpos ela tem o físico do Gabriel
  (1,70 m, cabelo escuro curto raspado em degradê nas laterais), **manca de um pé** (tiro do Thiago), braço
  esquerdo coberto de cicatrizes/bandagens e símbolos tatuados, casaco vermelho sem mangas (às vezes um preto por
  cima), calça escura rasgada, colar com pingente, dentes caninos afiados (afinidade com Sangue). Perguntar ao
  usuário se segue a referência dele ou o cânone antes da V3.
- **Descarnar** ✔ (especial). **Livro** (grimório) e **faca** de lâmina curva com cabo de osso ✔.
- **Amaldiçoar Balas com Sangue**: fiel ao cânone e mais coerente que só a faca — o □ dela poderia ganhar
  "facas amaldiçoadas" que aplicam sangramento (hoje o sangramento vem do R1+□).
- **Colar Banhado em Sangue**: resistência a dano de Sangue e rituais de Sangue mais fortes → passiva: +15% no
  dano de sangramento e −20% de dano recebido de golpes de Sangue (Arthur especial, Agatha espelho).
- Equilíbrio: combo mais fraco (152). Subir para ~170 (+4 em cada golpe) ou deixar o sangramento acumular.

### 2.6 Gal 🟡
- Cânone ✔: Ereshkigal (lâminas duplas presas por correntes nos braços, arremessam e puxam; os cortes
  **sangram e curam** — "mecanismo de tortura"): é exatamente a regra X/Y. Bloqueio Perfeito ✔.
- ✅ **Teletransporte em faíscas douradas atrás do alvo** (usou em Arthur e Erin) — no kit como R1+×.
- **Desviar de Balas** (cânone): esquivar projéteis sem gastar reação → passiva: esquiva contra projéteis não
  gasta carga (ou 50% de chance de desviar tiros quando parado).
- **Arremessar** (cânone): acertos arremessam o alvo → o agarrão dele pode jogar mais longe.
- **Velocidade Mortal** (Calamidade): ação extra → buff curto de velocidade.
- **Controle Mental**: ideia de especial alternativo (inverter os controles do rival por 2 s) — 🟢.
- Visual (Desconjuração): pele pálida, cabelo escuro longo até o peito, **venda preta com dourado escrito
  "Gal-Sal" em cuneiforme**, poncho preto com dourado, suspensórios, gargantilha de couro, **batom preto**,
  descalço, textos tatuados (no pescoço: frase de Gregório VII em latim). Calamidade: jaqueta de retalhos e
  correntes douradas. O jogo hoje usa sobretudo + capa — conferir.

---

## 3. Mecânicas — o que os jogos de luta fazem e falta aqui

### 3.1 Escala de dano em combos ✅ (`comboScale` em damage.js)
Quase todo jogo de luta reduz o dano de cada golpe seguinte no mesmo combo, para combos longos não decidirem a
luta. Proposta: `COMBAT.comboScaling = [1, 1, 0.9, 0.8, 0.7, 0.6]` (mínimo 0.5) por acerto consecutivo sem o
alvo voltar a neutro; especial e agarrão com piso de 0.7. Contador `victim.comboHits` zera quando sai do hitstun.
Arquivo: `damage.js`. Mostrar "N HITS" na HUD (estilo Storm). Resolve parte da diferença entre combos de 4 e 6
golpes.

### 3.2 Substituição (escape no meio do combo) ✅ (`trySubstitution`)
No Storm 4 a **substituição** usa a mesma barra de 4 cargas e funciona **enquanto você apanha** — o jogo já tem 4
cargas de esquiva que recuperam tomando dano (igual ao Storm), mas a esquiva só sai do neutro. Proposta: L2 durante
o hitstun gasta 1 carga (ou 2) e teleporta o personagem para as costas/lado do atacante com um tronco/efeito do
elemento dele (fumaça preta Kaiser, sangue Agatha, sigilos Kian...). Bloquear durante especiais e agarrões.
Arquivos: `Fighter.updateHitstun`, `tryDodge` com flag `substitution`.

### 3.3 Escapar do agarrão (throw tech) ✅ ("ESCAPOU!")
Em jogos tradicionais, quem é agarrado pode apertar o botão de agarrão na hora para se soltar. Proposta: se a
vítima apertar R2+○ nos primeiros 0,2 s do agarrão, os dois se empurram (sem dano). Hoje só a esquiva escapa.
Arquivo: `Fighter.tryGrab` (checar `caught.input.pressed.physical && caught.input.held.block`).

### 3.4 Despertar / Transcender universal ✅ (`COMBAT.awaken`)
No Storm 4, o **Despertar** fica disponível com a vida baixa (perdeu a 1ª barra + 25% da 2ª) e dá buffs ou
transforma o personagem. Em Ordem Paranormal isso é **Transcender**. Proposta: com vida ≤ 30%, segurar △ por 1 s
→ cada personagem entra na sua forma (Arthur com os olhos vermelhos de Sangue, Joui com a máscara/Medo, Gal com as
correntes douradas, Agatha com veias e dentes, Kaiser envolto na névoa, Kian já transcende pelo kit, então ganha
outra coisa). Buffs: +15% de dano, superarmor em um golpe, 1 vez por partida. Comeback mecânico e fiel ao tema.

### 3.5 Dash de energia e guarda com "quebra" (Storm) ✅
O Storm 4 tem **Chakra Dash** (energia + pulo) — já é o dash longo △+× ✔ — e um **Guard Break** que vence
defesa, dash e investidas. O novo agarrão já cumpre esse papel. Ajustar: dash longo agora pode ser **agarrado** e
**derrubado** por golpe com `guardBreak` (hoje ele só para perto do alvo).

### 3.6 Buffer de comandos e hitstop variável ✅ (`buffered`, `hitstopFor`)
- Jogos de luta guardam o comando apertado por alguns quadros antes da hora (buffer de ~4–6 quadros) para
  combos não "engolirem" botões. Hoje: `queued` só para ○ dentro do golpe. Proposta: buffer genérico de
  0,1 s para ○ □ △ L2 em qualquer estado de recuperação (`InputManager.pressTime` já existe).
- O hitstop já existe (0,055 s; ×2 no lançamento). Variar por golpe: leve 0,04, pesado 0,08, finalizador 0,12.
  Dá peso e ajuda a confirmar combos.

### 3.7 Levantar do chão (wakeup) ✅ (`COMBAT.wakeupInvuln`, rolagem)
Depois de ser lançado/derrubado: invulnerável ao levantar (~0,3 s), opção de rolar para os lados (direção ao
cair) e levantar atacando (custa 10 de energia). Evita repetir o mesmo golpe na pessoa caída (*okizeme* infinito).

### 3.8 Proteções contra repetição ✅
- Limite de lançamentos por combo (um 2º lançamento vira empurrão).
- Projéteis no ar: no máximo 2 do mesmo dono por vez.
- Repetir o mesmo golpe 3× seguidas → escala mais forte (incentiva variar).

### 3.9 Equilíbrio do novo kit universal ✅ (△+○ gasta 60 de defesa)
- O △+○ (físico forte) hoje sai com o finalizador de cada um ×1,6 e **quebra a defesa** com 100 de resistência
  (testado: 96 de dano direto no Arthur). Pode ficar forte demais contra defesa: trocar `guardBreak` por gastar
  60 de defesa (quebra só se a defesa já estiver gasta).
- O agarrão (70) ignora a defesa; a defesa só escapa esquivando — com o throw tech (3.3) fica justo.

### 3.10 Telemetria de equilíbrio ✅ (`src/dev/balance.js`)
Ferramenta `npm run balance`: roda N lutas CPU × CPU para todos os pares (sem renderizar, como os testes atuais
do navegador) e gera tabela de vitórias, dano médio por golpe e uso de cada habilidade. Base para todos os ajustes
acima. Precisa rodar no navegador (Three.js) → script em `src/dev/balance.js` chamado pelo console, salvando JSON.

### 3.11 Partidas LAN por código 🟡
No menu **Jogar**, adicionar **Partida LAN** com as opções **Criar partida** (gera um código para compartilhar) e
**Entrar em partida** (campo para digitar o código do amigo). Sincronizar os comandos e o estado da luta entre os dois
jogadores; permitir conexão pela rede virtual do Radmin. O código deve levar o convidado até a partida do anfitrião.

---

## 4. Ordem sugerida
1. 3.10 telemetria → 3.1 escala de dano → 2.1 nerf do Kian / 2.5 buff da Agatha → medir de novo.
2. 3.2 substituição + 3.3 escape do agarrão + 3.6 buffer.
3. 1.1 elementos (com ícones) + 1.2 nomenclatura de sanidade.
4. Habilidades novas fiéis (Acácia, Dystopia, Teletransporte do Gal, Rejeitar Névoa).
5. 3.4 Transcender universal + 1.4 falas de intro.
6. V3 visual com os detalhes canônicos acima (perguntar sobre a Agatha antes).

## 5. Dúvidas para o usuário — ✅ todas respondidas: nome AGHATA com o visual da referência; nerf do Kian e
Precognição ok; elementos só nos rituais; Transcender com o nome do cânone.

---

## Fontes
- Ordem Paranormal Wiki: [Kian](https://ordemparanormal.fandom.com/wiki/Kian) · [Arthur Cervero](https://ordemparanormal.fandom.com/wiki/Arthur_Cervero) · [Joui Jouki](https://ordemparanormal.fandom.com/wiki/Joui_Jouki) · [Kaiser (Cesar Oliveira Cohen)](https://ordemparanormal.fandom.com/wiki/Cesar_Oliveira_Cohen) · [Gal](https://ordemparanormal.fandom.com/wiki/Gal) · [Agatha Volkomenn](https://ordemparanormal.fandom.com/wiki/Agatha_Volkomenn) · [Elementos do Outro Lado](https://ordemparanormal.fandom.com/wiki/Elementos_do_Outro_Lado) · [Ordem da Desconjuração](https://ordemparanormal.fandom.com/wiki/Ordem_da_Desconjura%C3%A7%C3%A3o)
- Naruto Storm 4: [Push Square — dicas](https://www.pushsquare.com/news/2016/02/guide_naruto_shippuden_ultimate_ninja_storm_4_hints_and_tips_for_a_future_hokage) · [TrueAchievements — dicas gerais](https://www.trueachievements.com/game/Naruto-Shippuden-Ultimate-Ninja-Storm-4/walkthrough/2) · [Player.One — guia de batalha](https://www.player.one/naruto-shippuden-ultimate-ninja-storm-4-battle-guide-secret-techniques-substitution-511035)
- Jogos de luta: [Glossário (Wiktionary)](https://en.wiktionary.org/wiki/Appendix:Glossary_of_fighting_games) · [Damage Scaling](https://mugen.fandom.com/wiki/Damage_Scaling) · [Dustloop — prevenção de infinitos e mecânicas de combo](https://www.dustloop.com/w/User:Slimegirl-scientist/Infinite_Prevention_and_Combo_Mechanics) · [SuperCombo — dados do SF6](https://wiki.supercombo.gg/w/Street_Fighter_6/Game_Data) · [Guia prático para fazer jogo de luta, parte 7](https://andrea-jens.medium.com/i-wanna-make-a-fighting-game-a-practical-guide-for-beginners-part-7-56f32f706a46)
