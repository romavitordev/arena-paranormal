# Changelog

## v2.5 — 2026-10-03

### Equilíbrio
- Combos mais rápidos para leves/médios (`stats.attackSpeed`); pesados com mais vida (Lírio 1350, Ferreiro 1250, Aguiar 1150).
- Juan 82% → 61%: mais lento, menos cura/sangramento, Vínculo 30%, armadura automática mais fraca.
- Gal 29% → 41%: Velocidade Mortal e a sanidade drenada vai para ele.

## v2.4 — 2026-10-03

### Alterado
- HUD: nomes de habilidade em até 2 linhas (nome inteiro no title).
- Build dividido: three.js e personagens em arquivos próprios (sem o aviso de 500 kB).

## v2.3 — 2026-10-03
### Alterado
- Santo Berço com névoa; CPU limpa invocações fracas; Arthur paga rituais com vida sem sanidade.
- Diabo: Veias de Sangue saindo do próprio alvo; garras pingando sangue.
- Juan: Lâmina de Sangue em meia-lua (sangramento); Armadura de Sangue nasce sozinha ao sangrar (220 de dano).
- Aghata: Passagem de Conhecimento e Leitura de Rituais (cânone).
- Aguiar mascarado: o machado sangra também arremessado.

## v2.2 — 2026-10-03

### Alterado
- O Diabo (Juan) reformulado pelo cânone de Hexatombe: Pacto com escolha (aceitar/recusar), Lança de Sangue que
  empala e deixa poça (3 variações por direção), poças de sangue, Ódio do Diabo no alvo, Transportar pelo Sangue que
  arrasta o adversário, Regeneração mais forte ferido e ódio ao Conhecimento (+15%).
- Armadura de Sangue do Juan pela referência (carne porosa num lado do corpo, espinhos, veias, garras); quem conjura
  ganha o braço da faca de sangue (+25% físico); pela assistência, só resistência a golpes físicos e tiros.
- Arthur: sem Armadura de Sangue (não é do cânone); entra Analisar Brecha (+25% de dano físico no alvo por 7 s).

### Equilíbrio
- Diabo (medido já na forma desde o 1º round): 86% → 75% — sangramento da Lança 4→3/s (1,5 s), Ódio +20→+15%,
  roubo de vida 0,12→0,08, vida 1250→1150. Dante 46% e Juan (base) 64% na faixa.
- Defesa + toque na direção = passo rápido (Storm).
- Poça de Lodo do Dante é uma poça no chão; Zumbis sobem/morrem em poças; foice da Marionete risca o chão; agarrão
  da Marionete solta mais cedo apertando botões.

## v2.1 — 2026-10-03

### Alterado
- A Marionete (Dante) refeita no Blender e com IA nova: anda aos trancos, atravessa obstáculos, Reflexos Perfeitos e
  Ironia do Destino (agarra, arrasta e repassa 50% do dano que leva).
- Zumbis de Sangue (Diabo) refeitos: fraco e forte; Senhor do Sangue invoca 1–3 fracos ou 2 fracos + 1 forte.

### Corrigido
- Retratos da seleção com um personagem "fantasma" atrás (canvas não era limpo).
- Recursão sem fim ao montar o contorno dos modelos de invocação.

## v2.0 — 2026-10-03

### Corrigido
- Recuperados os IDs novos, as 420 introduções, as vitórias variadas e os valores da Fantasma desfeitos pelo commit
  `29f1170` (mantida a parte mobile dele).
- Tela de vitória com câmera dentro do cenário (no Bar Suvaco Seco ficava atrás da parede) e vencedor no centro.
- Mobile: menu cabe no celular deitado; seleção 5 × 3 sem 3D vazando; botões de combate fora da apresentação (toque
  pula); tela cheia fora da vida do P2; textos de toque no título.
- Ficha da seleção sem cortar habilidades/especial; COMANDOS rolável; especiais de transformação/invocação descritos.
- Campos do Online com fonte legível.

### Adicionado
- Pose de vitória própria para cada personagem.
- Nomes da equipe vencedora sob cada modelo.

### Desempenho
- Raios da câmera a 10 Hz: simulação ~4× mais leve.

## v1.9 — 2026-10-03

### Corrigido
- Restaurada a tela de vitória com a equipe vencedora em pose 3D no cenário atual, em vez de um retrato sobre fundo separado.

## v1.8 — 2026-10-03

### Adicionado
- 420 cenas de introdução pré-luta para os 210 confrontos, em um sistema separado das falas de vitória.
- Duas variações de vitória para cada confronto, escolhidas aleatoriamente.
- Tempo de leitura ajustado ao tamanho das falas, pausa antes de “LUTEM” e HUD de combate oculta durante a cena.

## v1.7 — 2026-10-03

### Adicionado
- Tela de vitória com o cenário atual, equipe vencedora completa em poses e fala do personagem ativo.
- Apresentação da primeira luta com entradas caminhando, falas originais e chamada “LUTEM”; a cena pode ser pulada
  com ×/Start.
- Falas originais de introdução e vitória contextualizadas pelas relações conhecidas e personalidade dos personagens.

### Corrigido
- Equipe vencedora agora mostra os integrantes corretos sem repetir o personagem que estava ativo no fim da luta.
- CPUs não controlam a navegação do menu de pausa; o controlador é restaurado ao continuar.

### Renomeado
- IDs e arquivos internos dos personagens atualizados: `desconjurado` → `kian`, `abutre` → `arthur`,
  `cineraria` → `kaiser`, `mascarado` → `joui`, `vampira` → `aghata` e `injustica` → `gal_sal`.
- Imports, registros de modelos, scripts Blender e assets `.glb` atualizados em conjunto.

### Validação
- `npm run build`
- `npm run check`
- `git diff --check`
