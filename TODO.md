# TODO — Arena Paranormal

> Pesquisa de 2026-10-01: wiki de Ordem Paranormal (personagens, rituais, elementos) + mecânicas de jogos de luta
> (Naruto Storm 4 e jogos de luta tradicionais). Cada item diz **o que é**, **por quê** (cânone ou equilíbrio) e
> **como fazer** no código. Prioridade: 🔴 alta · 🟡 média · 🟢 baixa/ideia.
> Nada daqui está implementado, exceto o que estiver marcado com ✅.

---

## Novo lutador: BALU (Antônio "Balu" Pontevedra) — ✅ adicionado na v2.6

Pesquisa de 2026-10-03 (wiki "Antônio Pontevedra" + lore/MEMBROS.md). ✅ Implementado na v2.6 (modelo, kit, falas,
assistência). Equilíbrio: 50% em 60 lutas (meta 45–55%). Pendente: 🟢 animações
próprias (hoje usa as de duas mãos da Lírio).

### Quem é (cânone)
- Ex-agente aposentado da **Ordo Realitas** (Equipe Abutres, Calamidade), voltou a pedido do Senhor Veríssimo.
  **Combatente / Duelista**. 1,90 m, forte, "um soco desacorda uma pessoa comum".
- Personalidade: bobo, piadista, fala alto, sempre sorrindo; muito protetor com a equipe; decisões precipitadas;
  gosta de comer. Sério e furioso quando ameaçam a família (o irmão morreu há ~15 anos; a sobrinha Stella).
- **Repudia o paranormal** (recusa transcender), mas usa o machado amaldiçoado e o ritual Amaldiçoar Arma com Sangue.
- Referências a Mogli (o apelido Balu, a pantera no cabo, o papel de parede de urso e pantera) e a Tarzan (ele canta e
  toca viola). Mentia para a sobrinha que já tinha lutado com um leopardo. Celular flip antigo.
- Inimizades: o **Diabo** (o golpe nele amaldiçoou o machado) e o **Kian** (quebrou o machado ao meio; o Dante restaurou).

### Feitos (escala de poder: nível B, o "tanque" humano — ver `lore/ESCALA.md`)
- Luta corpo a corpo o combate inteiro mesmo gravemente ferido; matou o Carente; cravou o machado no ombro do Diabo
  (que o amaldiçoou); enfrentou um Titã de Sangue (perdeu a orelha direita); Resistência à Dor: aguenta tiro à
  queima-roupa. Sem feitos de distância → kit de corpo a corpo, muita vida, golpes pesados com armadura.

### Aparência — referências salvas pelo usuário em `Referencias visuais/Personagens/Balu`
- `balu desenho.jpg` / `balu rosto.webp` (base do modelo): cabelo preto penteado para trás com volume, sobrancelhas
  grossas, olhos pequenos e simpáticos, **bigode** grosso e cavanhaque curto só no meio do queixo, rosto largo e sorriso
  aberto; polo **verde-clara** de gola grande, mangas arregaçadas nos bíceps, braços fortes, calça jeans azul-clara por
  dentro do cinto, sapato social marrom.
- `balu com camisa amarela.jpg`: polo **branca com flores amarelas** e o machado normal (cabo escuro com tiras, lâmina
  prateada larga, de um lado só, com saliências).
- `balu com machado.jpg` (fan art): antebraços enfaixados, machado ornamentado segurado com as duas mãos.
- `balu arma de sangue.webp`: polo **roxa** e o **Machado Demônio** (bola espinhosa de sangue no lugar da lâmina).
- `balu sem camisa.webp`: tronco forte sem camisa, cheio de queimaduras/rachaduras (depois do Anfitrião) e pelos no
  peito — boa skin alternativa.

### Aparência (links da wiki — conferidos no navegador)
- Cabelo preto penteado para trás com gel, **bigode** marcante e cavanhaque curto que não chega ao queixo; porte grande.
- Roupa padrão: **camisa polo** de mangas arregaçadas, por dentro da **calça jeans azul**, **cinto marrom** com a fivela
  (Amuleto de Proteção Elemental: veias vermelhas e o Símbolo de Sangue) e **sapato social marrom**.
- Variações (skins): polo **verde-claro** (início de Calamidade) · polo **branca com pétalas amarelas** (a mais
  conhecida — usar como padrão) · polo **roxa com zigue-zagues brancos** (depois de "Escolha"), com queimaduras pelo tronco
  e uma queimadura em forma de mão no pescoço. Sem a orelha direita: cicatriz em **espiral** (Cicatrização do Dante).
- **Machado Lancinante**: cabo longo de metal escuro com tiras de couro bege enroladas, **pomo em cabeça de pantera**,
  lâmina ornamentada com saliências feitas à mão e uma ponta curva; amaldiçoado: **veias vermelhas** sobre a lâmina.
- **Machado Demônio** (inspirado no Bloodletter de Bloodborne): ele crava o pomo de pantera no próprio peito e o sangue
  vira uma **maça-estrela de sangue** no lugar da lâmina (bola espinhosa vermelho-escura).
- Links (wiki, para conferir / salvar manualmente em `Referencias visuais/Personagens/Balu`):
  - padrão: https://static.wikia.nocookie.net/ordemparanormal/images/a/a6/Miniatura_Ant%C3%B4nio_em_Calamidade.png
  - florida: https://static.wikia.nocookie.net/ordemparanormal/images/a/a9/Miniatura_Ant%C3%B4nio_roupa_florida.png
  - roxa: https://static.wikia.nocookie.net/ordemparanormal/images/9/99/Miniatura_Ant%C3%B4nio_roupa_roxa.png
  - Machado Demônio em combate: https://static.wikia.nocookie.net/ordemparanormal/images/8/80/Miniatura_Ant%C3%B4nio_em_combate_com_seu_Mangual_de_Sangue.png
  - machado amaldiçoado: https://static.wikia.nocookie.net/ordemparanormal/images/b/bf/Machado_amaldi%C3%A7oado_do_Balu.png
  - machado transformado: https://static.wikia.nocookie.net/ordemparanormal/images/9/95/Machado_de_Ant%C3%B4nio_transformado.png
  - retrato (pós "Escolha"): https://static.wikia.nocookie.net/ordemparanormal/images/6/6a/Portrait_de_Balu_ap%C3%B3s_os_eventos_de_Escolha_em_Calamidade.png

### Proposta de kit (arquétipo: PESADO — aguenta os rápidos)
- `id: 'balu'`, origem Ordo Realitas, elemento **Sangue** (machado amaldiçoado pelo Diabo). `stats: { moveSpeed: 7.0,
  maxHealth: 1300, attackSpeed: 1.0 }` — pesado como Lírio/Ferreiro, um pouco mais rápido que a Lírio.
- ○ **Machado Lancinante** (duas mãos, golpes largos): 4 golpes + golpe por cima que derruba; ↑ machado de baixo para
  cima (lança); ↓ machadada no chão; aéreo: queda com o machado. Pode reaproveitar as animações de duas mãos da Lírio.
- □ **Machado em Giro**: arremessa o machado girando, que volta para a mão (bumerangue — diferente do Aguiar, que
  arremessa preso na corda). Ou "Soco do Balu" (curto, atordoa) se o arremesso ficar parecido demais.
- △ + □ **Amaldiçoar Arma com Sangue** (cânone): veias na lâmina, todo golpe sangra por alguns segundos.
- △ + ○ **Machado Demônio** (cânone): crava a pantera no peito (custa VIDA, não sanidade — ele repudia o paranormal) e
  por ~10 s o machado vira a maça-estrela de sangue: mais alcance e dano, golpes pesados com armadura.
- R2 + △ **Fala Imponente** (cânone, ex-vendedor): grita com o adversário — Provocado (só corpo a corpo) por 4 s; na
  equipe, tira o parceiro de Transtornado/medo.
- △ + L2 **110%** (cânone): explosão de força — os próximos 3 golpes físicos ganham +5 de "dano bônus" cada e o último
  derruba.
- Passivas: **Resistência à Dor** (aguenta tiro à queima-roupa: o 1º golpe de cada combo recebido não o faz recuar),
  **Colete Físico-Balístico** (−10% de dano físico e de tiros), **Derrubar e Atacar** (depois de derrubar, um golpe extra
  no chão como o da Lírio).
- Especial **"Coração de Urso"**: cinemática curta — segura o adversário, três machadadas e termina com o Machado Demônio
  esmagando o chão (Sangue, 250).
- Falas: tom alto e brincalhão; com o Diabo (raiva: "você amaldiçoou meu machado"), com o Kian ("quebrou meu machado,
  agora paga"), com Arthur/Dante/Joui/Kaiser (Equipe Abutres, camaradagem). Pode cantarolar uma música da Disney na
  vitória — SEM citar letra de música (direito autoral): só a ação ("cantarola uma música de filme").

### Passos de implementação
1. ✅ Referências salvas pelo usuário em `Referencias visuais/Personagens/Balu` (6 imagens, descritas acima).
2. Modelo no Blender (`tools/blender/char_balu.py`, mesmo pipeline dos outros `char_*`): corpo grande, polo florida,
   jeans, cinto com a fivela de veias, sapato social; cabeça com cabelo de gel, bigode e cavanhaque, orelha direita com
   a espiral. Props: machado (normal/amaldiçoado) e a maça-estrela de sangue.
3. `src/characters/balu.js` + registrar no `ROSTER`, `models/index.js`, retratos, seleção, `HABILIDADES.md`
   (`npm run moves`), `tools/check-roster.mjs` e falas de entrada/vitória (`config/dialogues.js`).
4. Novos tipos: `demonAxe` (troca o prop, custo em vida), `imposingVoice` (Provocado + limpeza no parceiro), `power110`.
5. Rodada de equilíbrio focada no Balu (meta 45–55%).

## Estado na v2.2 (2026-10-03) — O Diabo reformulado

Cânone usado (wiki "O Diabo"): Ódio do Diabo (faz o ALVO sentir ódio extremo, mais forte), Sangue nos Arredores,
Transportar pelo Sangue (fendas/poças, pode levar outro ser), Veias de Sangue, Regeneração ("quando fraco ou ferido"),
Amaldiçoar Arma, Senhor do Sangue, Decepar Máscara (odeia o Conhecimento) e o Pacto ("cumpre a parte dele, mas
distorce o resultado"; a vítima vira Transtornada).

- ✅ **Pacto (especial)** com escolha da vítima: aceitar = presente (cura, sanidade cheia) + Transtorno de 9 s que
  devolve a sanidade ao Diabo; recusar = cobrança à força (3 garradas + rasgo, sangramento). A CPU escolhe sozinha.
- ✅ **Lança de Sangue** de verdade: empala, sangra, crava na parede e deixa poça; frente / lados / trás.
- ✅ **Poças de sangue** (atolam o adversário, regeneração ×2 para o Diabo, passagem do Transportar).
- ✅ **Ódio do Diabo** no alvo (cego de ódio: sem defesa, só corpo a corpo, +20% de dano recebido) + o Diabo se alimenta.
- ✅ **Transportar pelo Sangue** arrasta o adversário colado e o cospe caído em outra poça.
- ✅ Regeneração mais forte ferido; +15% contra Conhecimento.
- ✅ Armadura de Sangue do Juan pela arte de referência (carne porosa num lado do corpo) + braço da faca de quem conjura;
  Arthur sem Armadura de Sangue (não é do cânone) → Analisar Brecha; passo da defesa; Poça de Lodo no chão.
- Equilíbrio (CPU × CPU, 90 s): Juan 64% (56 lutas, quase só na forma base) · Dante 46% (28 lutas, com a Marionete
  nova). Juan JÁ como Diabo desde o 1º round (28 lutas): 86% → ajuste (sangramento da Lança 4→3/s, Ódio +20→+15%,
  roubo de vida 0,12→0,08) 82% → vida da forma 1250→1150: **75%**. Aceitável para uma forma de "carta na manga"
  (uma vez por partida, pelo Renascimento); 🟡 medir com mais lutas por par e numa partida normal (forma no meio).

### O que mais pode ser reformulado (análise da v2.2)
✅ (v2.5) Analisar se todos personagens de ataque rápido, como gal e Henri, etc.. sem ser personagens pesados como Lirio, ou personagens estratégicos como Arthur e Kemi, estão agéis o suficientes em combos, gal eu sei que está, mas analisar os outros. → `stats.attackSpeed` nos leves/médios, pesados com mais vida, Juan 82% → 61%, Gal 29% → 41%.
🟡 **Escala de poder pelo cânone** (`lore/ESCALA.md`, feitos de cada um na wiki): S Kian, Gal (e as formas) · A Dante, Joui,
Juan, Ferreiro · B Balu, Kaiser, Arthur, Erin, Agatha, Kemi, Aguiar · C Xande, Lírio, Labirinto. Não decide quem ganha
(todos em 35–65%), decide a sensação do kit. Fora da escala hoje: **Gal (S) 41%** e **Dante (A) 43%** abaixo do que
deviam passar; **Kemi (B) 61%** e **Xande (C) 50%** acima — sugestões no fim do arquivo.
🟡 **Buffs a fazer (decisão do usuário, ainda NÃO aplicados):** (v2.8: o Labirinto subiu para 50% com a Tempestade
Caótica em área; Erin 60%, Ferreiro 57%) alguns personagens precisam de buff — em especial o
**Labirinto** (39%, quase sem ferramentas próprias), e pela escala também Gal (S, 41%), Dante (A, 43%), Arthur (39%) e
Aghata (39%). Medir com 2–3 lutas por par antes e depois de cada mudança.
🟡 Equilíbrio: a rodada geral com 1 luta por par oscila ±10–20% (o Aguiar foi de 71% a 36% com −100 de vida). Rodar 2–3 lutas por par para os ajustes finos; conferir Kemi (61%) e Aghata (39%).
✅ (v2.3) Adição de Névoa no mapa do Santo Berço
Levantado comparando cada kit com o cânone e procurando habilidades que só reaproveitam um tipo genérico.
- ✅ (v2.3) **Juan (forma base):** meia-lua de sangue no □ e armadura que nasce ao sangrar (220 de dano). Era: o □ "Lâmina de Sangue" usa a onda em X genérica (`crossWave`, a mesma de outros) — no cânone
  ele luta com a faca de lâmina ondulada; trocar por arremesso/corte da faca com rastro de sangue. A **Armadura de
  Sangue Diabólica** deveria nascer de SANGRAR ("após sangrar o suficiente"): carregar com o dano recebido e ativar
  sozinha (ou ficar mais forte quanto mais ele apanhou), com espinhos no ombro esquerdo como na forma do Diabo.
- 🔴 **Diabo:** ✅ (v2.3) Veias saindo do próprio alvo e garras pingando sangue. Falta: o modelo ainda não tem as asas de braços nem a boca vertical do torso descritas na wiki; Veias de
  Sangue é a mesma corda das Amarras da Lírio — trocar por correntes saindo das veias do PRÓPRIO alvo (sem corda
  vindo da mão). Amaldiçoar Arma é só o sangramento das garras: dar um efeito visível (garras com sangue escorrendo).
- ✅ (v2.3) **Arthur:** sem sanidade, paga rituais e a Arma de Sangue com vida (passiva Preço de Sangue). Era: o kit dele no cânone tem Arma de Sangue (lâmina do próprio sangue, gastando vida) — hoje é só o
  especial; avaliar uma versão curta como habilidade (custa vida em vez de sanidade) Ele pode gastar vida ao invés de sanidade para fazer o ritual.
- ✅ (v2.7) **Erin:** CORREÇÃO — no cânone o Black Hole É uma cura (cinzas assopradas, mais forte que a do Dante); ficou
  como a cura mais forte e rápida, com visual próprio. Anotação antiga (errada): "é só cura ao longo do tempo; no cânone é um
  ritual de Energia/Morte que envelhece uma área — virar zona que acelera o tempo do adversário (recargas mais
  lentas, dano contínuo) ou que cura a Erin às custas de quem estiver dentro.
- ✅ (v2.7) **Ferreiro:** Hipnose Espiral própria (espiral de Lodo, anda em círculos até o centro). Era: reaproveita o Controle Mental do Gal; dar a espiral própria (o Lodo girando no chão
  e o alvo andando em círculos até a espiral).
- ✅ (v2.7, em parte) **Tiros amaldiçoados:** Tempestade Caótica virou chuva de raios em área; facas da Aghata voltam.
  ✅ (v2.8, conferido) os outros já eram diferentes entre si — Balas Amaldiçoadas (Kaiser: três que perseguem, Energia),
  Pistola Transtornada (arame: sangra e deixa lento) e Revólver .38 (leque de seis, de perto); só o TIPO interno é o mesmo. Era: `cursedShots` em 6 kits (Kaiser, Aghata, Labirinto, Kemi ×2, Fantasma): diferenciar —
  Tempestade Caótica do Labirinto como chuva de projéteis em área; Facas Amaldiçoadas da Aghata voltando para a mão.
- ✅ (v2.3) **Aghata:** + Passagem de Conhecimento (troca de lugar/mente) e Leitura de Rituais (−40% de dano de rituais), ambos do cânone — agora tem 4.
- ✅ (v2.3) **Aguiar:** mascarado, todo golpe do machado sangra (corpo a corpo e arremessado).
- ✅ (v2.7) **Curas** com visual e regra próprios. Era: `healOverTime` em 4 kits (Dante, Erin, Xande, Ferreiro): cada uma com um visual e uma
  condição própria (Paradiso do Dante só funciona parado; Conforto de Santo Berço cura mais perto do altar etc.).
- 🟡 **Fantasma:** ✅ (v2.7) especial cinematográfico (a bala dá a volta e a câmera segue). ✅ (v2.8) Faixas enrolam o alvo
  como múmia (pedido do usuário; adaptação — não está na wiki). Falta: usa as animações humanas da Kemi (já anotado) e o Disparo Espiral é ao mesmo tempo o □ e o especial
  — o especial podia ser uma versão cinematográfica (um disparo em volta da arena e a câmera seguindo a bala até atingir o adversário).
- ✅ (v2.8) **Teleportes:** todos deixam rastro no ponto de partida — sombra (Joui), faíscas (Gal), poça de sangue (Diabo), sigilos dourados (Kian) e fumaça das faixas (Fantasma).
- ✅ (v2.3) **CPU:** foca invocações fracas (zumbis, clones do Trinitá) e usa o Transportar para arrastar quando colado.

## Estado na v2.1 (2026-10-03)

- ✅ **Retratos da seleção:** o personagem transparente atrás de cada retrato era o retrato ANTERIOR (o canvas era
  reaproveitado sem limpar) — por isso parecia "embaralhado".
- ✅ **A Marionete refeita** (modelo do Blender + IA): crânio de mandíbula aberta por fios, braços erguidos por fios
  invisíveis, foice de ossos; anda aos trancos, atravessa obstáculos, Reflexos Perfeitos e Ironia do Destino.
- ✅ **Zumbis de Sangue refeitos:** fraco (magro, rápido) e forte (massa de músculo, pancada que derruba);
  Senhor do Sangue sorteia 1–3 fracos ou 2 fracos + 1 forte.
- ✅ (v2.2) Marionete: a foice risca o chão enquanto ela anda.
- ✅ (v2.2) Zumbis: sobem rastejando de poças de sangue de verdade e derretem numa poça ao morrer.
- 🟡 CPU: ✅ (v2.2) o agarrão da Marionete solta mais cedo apertando botões (a CPU já aperta); falta a CPU focar nos zumbis
  fracos para limpar a horda (hoje só bate se estiverem no caminho).
- ✅ (v2.5) Rodar a rodada de equilíbrio do Dante e do Juan com as invocações novas (Dante 46%, Juan 61%) (a Marionete perdeu o giro com medo e
  ganhou o agarrão; a horda pode somar mais dano que o zumbi único de 220 de vida).

## Estado na v2.0 (2026-10-03)

### Feito nesta versão
- ✅ **Recuperação do commit 29f1170** ("improve mobile play"): ele partiu de uma cópia antiga do projeto e desfez os IDs
  novos (kaiser, arthur, joui, aghata, gal_sal, kian), as 420 introduções e as vitórias variadas e os valores da
  Fantasma. Voltou tudo, mantendo a parte mobile. Uma segunda reversão acidental (arquivos antigos gravados às 03:45
  por cima do HEAD) ficou guardada no `git stash` em vez de ser commitada.
- ✅ **Tela de vitória:** os vencedores ficam onde a luta terminou, de frente para a câmera, com quem venceu no meio e a
  equipe dos lados (o espaço se ajusta à largura da tela); a câmera procura um ângulo com visão livre, de preferência
  olhando para o meio da arena (no Bar Suvaco Seco ela ficava do lado de fora, mostrando a fachada); o nome de cada um
  aparece embaixo do próprio modelo. **Pose de vitória própria** para cada personagem (`src/anim/victoryClips.js`).
- ✅ **Celular deitado:** o menu principal cabe inteiro (o logo sai com o menu aberto; a regra antiga mirava `.opt` e as
  opções são `.hopt`); seleção de personagens em 5 × 3 cartões em pé (com 3 × 5 viravam tiras) e sem o 3D vazando
  por trás; na apresentação os botões de combate somem (cobriam as falas) e um toque pula; o botão de tela cheia não
  fica mais em cima da vida do P2 durante a luta; tela inicial com instruções de toque (estavam no changelog, mas não
  no jogo); o COMEÇAR não mostra mais "A/× ou Start" no toque.
- ✅ **Seleção de personagens (PC):** a ficha não corta mais as habilidades nem o especial (uma linha por habilidade).
- ✅ **Especiais descritos certo** na seleção, em PAUSA → COMANDOS e no HABILIDADES.md: transformações, invocações e
  pactos não aparecem mais como "250 de dano".
- ✅ **PAUSA → COMANDOS:** a lista de golpes rola (▲ ▼, roda do mouse ou dedo); antes o fim ficava fora da tela.
- ✅ **Desempenho:** os raios da câmera (objetos que somem e blocos que a câmera evita) rodavam a cada quadro e custavam
  mais que a luta inteira; agora 10× por segundo — de 1,9 para ~0,45 ms por quadro de simulação.
- ✅ **Online:** os campos de nome/senha/código voltaram a ter letra legível (o atalho `font: … inherit` era inválido).
- ✅ Telemetria (`src/dev/balance.js`): progresso e parciais em `window.__balanceProgress` durante a rodada.

### Equilíbrio na v2.0 (CPU × CPU, 1 luta por par, todos contra todos, 60 s, melhor de 3)
Rodada geral (210 lutas, 28 por personagem, CPU normal; margem de ±18 pontos com essa amostra):
Kaiser 75% · Kemi 68% · Joui 61% · Dante 61% · Juan 57% · Erin 50% · Aguiar 50% · Labirinto 50% · Lírio 50% ·
Kian 46% · Ferreiro 43% · Arthur 39% · Xande 39% · Aghata 36% · Gal Sal 25%.
- Fora da margem: **Kaiser** (alto: o Jab e o Direto concentram o dano) e **Gal Sal** (baixo: a cura Y devolvia ~¼ do
  dano — ela causava o 2º maior dano e ainda perdia).
- Ajustes: Gal Sal — Y (cura do alvo) −40% em todos os golpes → **46%** (28 lutas). Kaiser — Jab 26 → 20, Direto
  28 → 23, karambit 32 → 30, Chute giratório 60 → 56 (combo 212 → 194) → **63%** (56 lutas).
- Dentro da margem, de olho na próxima rodada: Kemi 68% (Fantasma até o fim do round + Disparo Espiral) e Aghata 36%.
- Ferramenta: `runBalance({ fights, maxTime, focus })` em `src/dev/balance.js` (progresso em `window.__balanceProgress`);
  para medir sem a página recarregar a cada edição, rodar num `vite` sem HMR.

### Pendências (prioridade)
	✅ (v2.2) Nova (editado por mim): Ao segurar defesa (RT) e mover o analógico/wasd você dá um dash para os lados {referencia a jogos da saga naruto storm,}  para melhor movimentação em combate. → Defesa + TOQUE na direção = passo rápido (de frente para o rival); segurando a direção, anda defendendo.
	✅ (v2.2) Armadura de sangue deve ter textura de sangue (vale pra todos personagens que possuem essa habilidade ou a recebem da assistencia) → carne de sangue porosa num lado do corpo, como na arte do Henri; quem conjura (Juan) também ganha o braço da faca de sangue (+25% físico); pela assistência, só resistência a físico e tiros. Arthur não tem essa habilidade no cânone: saiu do kit.
	✅ (v2.2) Poça de lodo deve parecer uma poça no chão → mancha preta brilhante de contorno irregular, com bolhas.
- 🔴 **Online de verdade:** testar com dois computadores (internet e Radmin); batalha em equipe pela rede; o servidor
  público do PeerJS é ponto único de falha (avaliar servidor próprio de apresentação/lista de salas).
- 🔴 **Equilíbrio:** ajustar quem ficou fora da faixa 35–65% na rodada acima e medir de novo com mais lutas por par.
- 🟡 **Mobile:** no emulador, a 1ª toque num submenu às vezes não escolhe a opção (o 2º sim) — conferir num aparelho;
  HUD do celular sem os nomes das habilidades (só ícones): avaliar ícones por personagem.
- ✅ (v2.4) **HUD no PC em janela pequena:** nomes longos de habilidade ("Granada \"Nebulosa\"") estouram as caixas.
- ✅ (v2.4: three.js e personagens em arquivos próprios, principal < 500 kB) **Carregamento:** o pacote principal passa de 500 kB (aviso do Vite); dividir por tela/personagem para abrir mais
  rápido no celular.
- 🟡 **Cenários:** peças juntadas num bloco só (a cidade do Orfanato, o cemitério das Ruínas) não ficam transparentes
  quando tampam a luta (a câmera só chega para a frente) — separar as peças no Blender.
- ✅ (v2.8) **Tela de vitória cinematográfica:** a câmera aproxima e balança de leve (os nomes acompanham). Falta: 🟢 poses refeitas com referência.
- 🟢 **Formas:** a Fantasma ainda usa as animações humanas da Kemi (só Deus da Morte e Diabo têm as próprias).

---

## 0. Já feito nesta rodada

- ✅ **Kian: Transcender libera mais um Inexistir.** A primeira Transcendência da partida dá +1 uso do especial
  (máximo de 2 na partida). `special.bonusUseOnTranscend` em `src/characters/kian.js`; o
  Fighter soma `specialBonusUses`. Testado no jogo: após o 1º Inexistir, ficou "USADO"; depois de Transcender,
  liberou e o 2º Inexistir funcionou; uma 2ª Transcendência não dá mais usos.
- ✅ **Origem e elemento** de cada lutador na seleção (sem arma) — §1.1.
- ✅ **Banco de membros das origens** para futuras adições: `lore/membros.json`, `lore/MEMBROS.md` e
  `lore/NOTAS.md` (`npm run lore`). 40 membros da Ordo Realitas e dos Escriptas com elemento, rituais e habilidades.

### Rodada 2 (2026-10-01) — implementado e testado no jogo
- ✅ 1.1 elementos com vantagem/desvantagem (+10% / −10%, Medo neutro) e elemento na HUD.
- ✅ 1.2 "energia" passou a se chamar **sanidade** na HUD, avisos e listas de comandos.
- ✅ 1.3 Transcendência do Kian cobra sanidade (sem regenerar durante, −15 no fim).
- ✅ 1.4 falas originais contextualizadas por dupla e personalidade; entradas caminhando antes do primeiro round, “LUTEM” inicia (×/Start pula). Falas não reproduzem diálogos da obra; confrontos sem encontro canônico evitam inventar passado em comum.
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

### Atualização (2026-10-03)
- ✅ Tela de vitória aprimorada: cenário atual como fundo, equipe vencedora completa em poses e fala central apenas
  do personagem ativo no fim da luta.
- ✅ Apresentação pré-round com entradas caminhando e falas originais; “LUTEM” inicia o combate. ×/Start pula a cena.
- ✅ Controladores CPU suspensos enquanto o menu de pausa está aberto, sem interferir na navegação.
- ✅ IDs internos, definições, modelos e assets atualizados para Kian, Arthur, Kaiser, Joui, Aghata e Gal Sal.

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
- ✅ NOVO: MIGUEL CARIAD (3 formas). Sanidade em Queda (apanhar tira sanidade); sanidade zerada → LUZIDIO (2,20 m,
  pele cinza, barba branca, Espada Consumidora; especial PACTO DO SANTO exige 85% e dura 45 s); morrer no pacto →
  DEUS DA MORTE (chefe 2x maior, 1300 de vida, barra preta no centro, fraco a fogo/Energia ×1,5, regenera 60 a cada
  6 s, inabalável após 3 golpes seguidos; Espiral Descendente, Controlar Mortos, Senhor do Tempo). Sistema genérico de
  FORMAS (combat/forms.js + characters/forms/), câmera se ajusta ao tamanho, HUD troca nome/habilidades.
- ✅ NOVO: JUAN (Henri) — Faca Predadora (cura), Descarnar Discente, Perturbação Discente, Vínculo de Sangue, Armadura
  de Sangue Diabólica, Masoquista; especial PACTO DO HEXATOMBE → O DIABO por 40 s (+350 de vida que se perde ao voltar).
- ✅ Seleção com páginas de 15 (3×5, sem rolagem); LB/RB, Q/E ou PgUp/PgDn trocam de página.
- ✅ Teclado refeito: losango I J K L = △ □ × ○ (como no controle), Q = R1, E = R2, Shift = L2, 1-4 equipe; P2 no numérico.
- ✅ Celular: joystick, losango, R1/DEF/ESQ, ESPECIAL, pausa e equipe na tela; menus com setas/OK/VOLTAR; HUD e menus
  compactos em tela baixa; aviso para girar em retrato. Some sozinho quando o jogador usa teclado/controle.
- ✅ Juan: Renascimento no Trono do Diabo (Portador do Trono até o fim do round, poderes do cânone); modelo do Diabo pela
  referência (galhada clara, cabelo preto longo, 4 braços, asas de braços, pernas de bode); Juan com boca costurada,
  ferida em cruz e alargadores.
- ✅ Kemi / A Fantasma; Magras da Lírio (tripas trançadas que enrolam o alvo, +60% contra Conhecimento).
- ✅ Aguiar (gola de pelo, lenço, mangas, riscos da máscara) e elmo do Labirinto (sorriso entre faixas rebitadas, gola).
- ✅ Polimento (2026-10-02): jaqueta do Miguel acompanha o corpo (sem a camiseta vazando nas costas/quadril, dobras
  das mangas no tamanho certo); HUD das formas conferido; falas de entrada/vitória do Miguel, Juan e Kemi.
- ✅ Equilíbrio medido com a telemetria (CPU × elenco): Kemi 68% → 54% (Disparo Espiral gasta a defesa em vez de
  ignorá-la, Fantasma 40 s/+150, sangramento e Sede de Vingança menores); Juan 61% → 54% (Diabo: sangramento, cura e
  vida menores, Renascimento +150); Miguel 77% → 64% (Luzidio com combo de 212 e menos alcance, Deus da Morte com
  850 de vida e regeneração menor) e Luzidio suavizado depois disso (resistência 8%, espada sangra 4/s).
- ✅ Telemetria corrigida: lutadores transformados contam para o personagem de origem (antes travava).
- ✅ NOVO cenário: SANTO BERÇO (praça do vilarejo dos Luzidios em frente ao Labirinto Infinito, estátuas dos Cinco
  Guardiões, Símbolo Espiral, névoa girando, cristais, Lodo, Torre do Porteiro, Ferraria, Taverna, Bosque da Provação).
- ✅ Cenários refeitos no Blender com MODELOS PRONTOS gratuitos (Kenney, CC0 — assets_src/README.md): Santo Berço
  (Fantasy Town + Nature), Ruínas do Ritual (Graveyard; antes era montado em código no jogo), Coliseu (Castle Kit:
  muralhas, torres, estandartes, catapultas destruídas), Orfanato (casarão e torre do Fantasy Town, pinheiros,
  grade, bancos) e Bar Suvaco Seco (móveis, rua, postes, carros e prédios dos City/Car/Furniture Kits).
- ✅ Armas encantadas com Sangue (Amaldiçoar Arma da Lírio, Aghata e Xande; Arma de Sangue) usam o mesmo material de
  sangue da Arma de Sangue do Arthur, em vez de brilhar.
- ✅ Controles: o △/Y virou o MODIFICADOR de ○ e □ — △ + ○ e △ + □ soltam as habilidades que eram R1 + ○ / R1 + □
  (juntos, logo em seguida ou segurando △ enquanto carrega). Saíram as "versões fortes" (mesmo golpe com mais dano).
  R1/RB + △, × e L2 continuam; o especial continua △ → △ → ○. CPU, HUD, lista de golpes e tutorial atualizados.
- ✅ Controles revisados: L1 / R1 chamam as assistências; R2 defesa; L2 esquiva/substituição; sem botão modificador —
  habilidades em △ + ○ / □ / L2 e R2 + △ / × (R2 + ○ agarrão). Segurando △ para carregar, L2 esquiva (dá para fugir
  no meio da carga). O D-pad volta a andar na batalha em equipe; a troca de personagem fica no analógico direito.
- ✅ Assistências do Ferreiro, Juan e Kemi (antes não saíam: faltava a ação delas) + assistência genérica para
  qualquer lutador novo.
- ✅ Magras da Lírio: errando, a corda vai até o alcance (ou até um obstáculo) e volta para a mão; nunca fica presa.
- ✅ Miguel humano removido: o personagem é o FERREIRO (Luzidio, Espada Consumidora) → Pacto do Santo → Deus da Morte.
  O HUD volta para o nome da forma base quando a transformação termina (antes ficava "O DEUS DA MORTE").
- ✅ A Fantasma (Kemi) dura até o fim do round.
- ✅ Modo TUTORIAL no menu inicial: escolhe o personagem e ensina passo a passo todos os golpes dele (detecta cada
  ação de verdade). Saiu a opção "Tutorial ON/OFF": os comandos aparecem sempre nos ícones da HUD.
- ✅ Esc nos menus sempre volta (não avança mais na seleção/configuração/vitória); o cartão do tutorial some fora da luta.
- ✅ Machado do Aguiar: o fio da lâmina aponta para a FRENTE (para onde ele golpeia).
- ✅ Animações próprias das formas (`src/anim/formClips.js`): Deus da Morte (curvado, caminhada pesada, tapa de costas,
  martelada dupla, erguer pelo pescoço, pisão, palmas no chão) e Diabo (agachado, corrida de predador, garras, rasgar,
  mergulho, urro do Ódio).
- ✅ Diabo: Sigilos de Conhecimento dourados (com brilho) no braço direito; os sigilos do peito e o brilho batem.
- ✅ Pele morena (Aguiar/Kemi) rosada na luz roxa: na pele a luz muda o brilho mas mantém o tom (70%).
- ✅ △ → ○ / △ → □ em toques separados (como no Storm 4) soltam as habilidades.
- ✅ Fim de combo sempre derruba (o "empurrão" do Dante também); caído ~1,4 s + 0,35 s protegido ao levantar.
- ✅ Projéteis param nas paredes do Bar Suvaco Seco (faltavam os obstáculos das paredes).
- ✅ Disparo Espiral (Fantasma) com rota pelo mapa: passa pelas brechas, pega em qualquer lugar e só erra com esquiva.
  Recarga do especial não fica mais presa na da transformação.
- ✅ Câmera: qualquer objeto alto do cenário some quando tampa os lutadores (cabeça, peito e quadril); nos blocos
  grandes juntados a câmera chega para a frente do obstáculo.
- ✅ Equilíbrio da Kemi e do Ferreiro medido na rodada geral da v2.0 (ver "Estado na v2.0").
- ⏭ Online: batalha em equipe pela rede; testar com dois computadores de verdade (internet e Radmin).
- ✅ 3.11 Partida LAN por código (ver abaixo) + ONLINE com salas: nome de usuário, sala com código + senha opcional,
  pública (na lista de SALAS ABERTAS) ou privada (só pelo código).
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

### 1.1 Os cinco elementos e o ciclo de vantagem ✅ (conferido na v2.8: ciclo em `damage.js`, só para rituais; elemento na HUD e na seleção)

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

### 1.2 Sanidade, PE e Exposição Paranormal (NEX) ✅ (conferido na v2.8: a barra é "Sanidade (PE)" e os avisos dizem "SEM SANIDADE"; a barra de Exposição continua só ideia)

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

Atualizado na v2.0 (soma da sequência de ○; vida 1000, Lírio 1150):

| Lutador | Combo ○ | Golpes | Alcance | Principal □ |
|---|---|---|---|---|
| Kaiser | 194 (era 212) | 6 | 1,7–2,0 m | M4 16 × 4 |
| Arthur | 184 | 4 | 1,7–2,0 m | Sniper 110 (carregável) |
| Joui | 203 | 6 | 2,1–2,4 m | Sombra Rasteira 30 |
| Aghata | 152 (+sangramento) | 5 | 1,6–1,8 m | Faca Arremessada 40 |
| Gal Sal | 216 | 5 | 2,0–3,6 m | Corrente de Captura 25 |
| Kian | 210 | 6 | 1,7–1,9 m | Impacto Sigilar 70 |
| Dante | 204 | 5 | 1,7–2,2 m | Decadenza 30 |
| Erin | 148 | 5 | 1,6–1,9 m | Escopeta 11 × 6 |
| Aguiar | 200 | 5 | 1,7–2,2 m | Machado na Corda 30 |
| Labirinto | 192 | 5 | 2,4–3,0 m | Rajada Caótica 56 |
| Xande | 198 | 5 | 1,8–2,1 m | Skate Caótico 38 |
| Lírio | 192 | 4 | 2,2–2,4 m | Canivete de osso 22 |
| Ferreiro | 212 | 5 | 2,3–2,4 m | Lodo arremessado 34 |
| Juan | 160 | 5 | 1,7–1,9 m | Lâmina de Sangue 28 |
| Kemi | 160 | 5 | 1,6–1,9 m | Sniper Fantasma 100 (carregável) |

Tabela antiga (2026-10-01), para comparação: Kaiser 174 · Arthur 184 · Joui 194 · Agatha 152 · Gal 196 · Kian 250.

Leitura rápida: **Kian está forte demais** (maior combo + Lâmina do Medo 160 + Transcendência indefensável + agora
2 Inexistir). **Agatha é a mais fraca no corpo a corpo**. Joui tem o melhor alcance com o 2º maior combo.

### 2.1 Kian ✅ (combo 250 → 210, Precognição e Rejeitar Névoa no kit)
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

### 2.2 Kaiser ✅ (Acácia e Resistente no kit)
- **Cinerária** (cânone): névoa num raio de **5 m** que fortalece rituais dentro dela e dá bônus de esquiva e
  furtividade. O jogo já faz isso — conferir se a área está perto de 5 m e se "fortalece rituais" (bônus de
  dano em habilidades, não só no físico).
- **Acácia "Dissipar Espíritos"**: chuva de pequenas flores roxas que machuca o alvo (forte contra Energia).
  Candidata a habilidade R1 nova ou variação do □ (Kaiser hoje tem só Baforada + M4 com variações).
- **Resistente** (cânone): armadura natural de 3 contra dano físico → no jogo, −5% de dano físico recebido.
- Arsenal canônico para variar: Desert Eagle, faca karambit vermelha, **balas amaldiçoadas** (9), granada Nebulosa.
- Visual: cabelo preto volumoso até os ombros, olheiras, postura curvada, barba curta no queixo.

### 2.3 Arthur Cervero ✅ (Arma de Sangue, Dystopia, Templo do Ódio e sniper carregável no kit)
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

### 2.4 Joui Jouki ✅ (Coincidência Forçada "Rodolfo" e Decepar no kit)
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

### 2.5 Agatha ✅ (Colar Banhado em Sangue no kit; combo ainda 152 — ver equilíbrio)
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

### 2.6 Gal ✅ (teleporte em faíscas, Desviar de Balas e Controle Mental no kit)
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

### 3.11 Partidas LAN por código ✅ (`src/net/NetSession.js`)
Feito: menu **ONLINE / LAN** → nome de usuário · **Criar sala** (código de 5 letras, senha opcional, pública/privada) ·
**Salas abertas** · **Entrar com código**. A lista de salas não tem servidor próprio: quem está na tela ONLINE ocupa um
endereço fixo no corretor e vira o "dono da lista"; os outros se conectam nele e as salas públicas se anunciam a cada
4 s (se o dono sair, outro assume). A apresentação usa o
servidor público do PeerJS só para trocar oferta/resposta do WebRTC; depois a conexão é direta (rede local, Radmin ou
internet). Sincronia em lockstep (60 quadros/s, atraso de entrada de 4 quadros, sorteio com semente, conferência do
estado a cada 2 s com correção pelo anfitrião). Só batalha solo P1 × P2 por enquanto; quem cria é o P1 e as opções
(tempo, rounds, movimento) são as do anfitrião. Pendente: batalha em equipe na LAN e testar com dois computadores de
verdade numa rede Radmin.

Pedido original:
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
7. ✅ Tela de vitória: vencedores centralizados na arena, voltados para a câmera, com pose de vitória própria (v2.0). Falta o movimento de câmera cinematográfico.

## 5. Dúvidas para o usuário — ✅ todas respondidas: nome AGHATA com o visual da referência; nerf do Kian e
Precognição ok; elementos só nos rituais; Transcender com o nome do cânone.

---

## Fontes
- Ordem Paranormal Wiki: [Kian](https://ordemparanormal.fandom.com/wiki/Kian) · [Arthur Cervero](https://ordemparanormal.fandom.com/wiki/Arthur_Cervero) · [Joui Jouki](https://ordemparanormal.fandom.com/wiki/Joui_Jouki) · [Kaiser (Cesar Oliveira Cohen)](https://ordemparanormal.fandom.com/wiki/Cesar_Oliveira_Cohen) · [Gal](https://ordemparanormal.fandom.com/wiki/Gal) · [Agatha Volkomenn](https://ordemparanormal.fandom.com/wiki/Agatha_Volkomenn) · [Elementos do Outro Lado](https://ordemparanormal.fandom.com/wiki/Elementos_do_Outro_Lado) · [Ordem da Desconjuração](https://ordemparanormal.fandom.com/wiki/Ordem_da_Desconjura%C3%A7%C3%A3o)
- Referências de personalidade e relações nas campanhas (falas do jogo são originais, não transcrições): [Kaiser, Arthur e Joui — O Segredo na Floresta, ep. 16](https://www.youtube.com/watch?v=BH-yFQo882w) · [Arthur e Joui — Calamidade, ep. 5](https://www.youtube.com/watch?v=2sxn1WyqMq0&t=554s) · [Joui, Erin, Gal e Dante — Desconjuração, ep. 17](https://www.youtube.com/watch?v=nAqPmCAuWxo&t=14230s) · [Agatha e Arthur — Desconjuração, ep. 16](https://www.youtube.com/watch?v=kqF7svnqhy0&t=1403s) · [Xande e Lírio — Sinais do Outro Lado, ep. 1](https://www.youtube.com/watch?v=k5y48mQTdpE&t=793s) · [Juan e Kian — Calamidade, ep. 12](https://www.youtube.com/watch?v=tdb8jng7qwQ&t=15898s) · [Assassinos — Hexatombe, eps. 1–2](https://www.youtube.com/watch?v=DMzwnM6gwBY&t=329s)
- Naruto Storm 4: [Push Square — dicas](https://www.pushsquare.com/news/2016/02/guide_naruto_shippuden_ultimate_ninja_storm_4_hints_and_tips_for_a_future_hokage) · [TrueAchievements — dicas gerais](https://www.trueachievements.com/game/Naruto-Shippuden-Ultimate-Ninja-Storm-4/walkthrough/2) · [Player.One — guia de batalha](https://www.player.one/naruto-shippuden-ultimate-ninja-storm-4-battle-guide-secret-techniques-substitution-511035)
- Jogos de luta: [Glossário (Wiktionary)](https://en.wiktionary.org/wiki/Appendix:Glossary_of_fighting_games) · [Damage Scaling](https://mugen.fandom.com/wiki/Damage_Scaling) · [Dustloop — prevenção de infinitos e mecânicas de combo](https://www.dustloop.com/w/User:Slimegirl-scientist/Infinite_Prevention_and_Combo_Mechanics) · [SuperCombo — dados do SF6](https://wiki.supercombo.gg/w/Street_Fighter_6/Game_Data) · [Guia prático para fazer jogo de luta, parte 7](https://andrea-jens.medium.com/i-wanna-make-a-fighting-game-a-practical-guide-for-beginners-part-7-56f32f706a46)
