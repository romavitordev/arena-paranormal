# Changelog

## v3.7 — 2026-10-04

### Adicionado
- Modo online pronto: crie ou entre em salas públicas e privadas por código e jogue partidas sincronizadas pela internet.

### Alterado
- Substituição: ao usar L2 enquanto apanha, reaparece atrás do adversário em um ponto livre da arena, interrompe o combo e ganha invulnerabilidade breve.

## v3.6 — 2026-10-04

### Corrigido
- Substituição: ao usar L2 enquanto apanha, o lutador cancela o golpe e reaparece no mesmo lugar, sem teleportar para trás do atacante.

## v3.5 — 2026-10-04

### Corrigido
- Tela de vitória: só a forma de quem venceu transformado.

### Alterado
- Super Difícil mais forte (reações, punição, esquiva de tiros, combos longos, +15%/−15%).
- Deus da Morte: especial Envelhecimento (agarra pelo pescoço, envelhece o alvo até o fim do round).

## v3.4 — 2026-10-04

### Adicionado
- CPU Super Difícil que aprende (ações por situação e o perfil do jogador), salvo no navegador e em public/ai/learned.json.

### Alterado
- Esquiva só gasta carga quando desvia de algo.

## v3.3 — 2026-10-04

### Alterado
- Dante: Decadenza soprada de médio alcance (8 m), nuvem que abre; CPU respeita o alcance do □.

## v3.2 — 2026-10-04

### Alterado
- Agarrão próprio para cada personagem (e formas), com finalizador dos seus poderes.

## v3.1 — 2026-10-04

### Alterado
- Agarrão em cutscene (câmera, dois golpes no estilo do personagem, arremesso).

## v3.0 — 2026-10-04

### Adicionado
- Despertar (Barra de Transformação) para os 13 personagens sem forma própria, com estados do cânone.

## v2.9 — 2026-10-04

### Adicionado
- Barra de Transformação (Juan, Kemi, Ferreiro): cheia + vida ≤ 35% → segurar △ passa da sanidade cheia e transforma.
- Especiais Hemorragia Severa (Juan), Contrato de Morte (Kemi), Consumir (Ferreiro); Levitação (Kian).

### Removido
- Transcender (todos) e a Transcendência do Kian; transformações pelo especial.

### Alterado
- Diabo: asas de braços e boca vertical no modelo.

## v2.8 — 2026-10-03

### Alterado
- Fantasma: Faixas enrolam o alvo como múmia (até 2,2 s; apertar botões solta antes).
- Teleportes com rastro (Kian, Fantasma); câmera de cinema na tela de vitória.

## v2.7 — 2026-10-03

### Alterado
- Curas com visual e regra próprios (Erin a mais forte; Dante parado; Ferreiro quebra ao apanhar).
- Ferreiro: Hipnose Espiral própria; Labirinto: Tempestade Caótica em área; Aghata: facas que voltam.
- Fantasma: Disparo Espiral com a bala dando a volta na arena e a câmera seguindo.

## v2.6 — 2026-10-03

### Adicionado
- Novo lutador: Balu (Antônio Pontevedra) — pesado da Ordo Realitas, Machado em Giro, Machado Demônio (paga com vida),
  Fala Imponente, 110%, Colete, especial Pancada do Urso, falas e assistência.
- Seleção em duas páginas (16 lutadores).

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
