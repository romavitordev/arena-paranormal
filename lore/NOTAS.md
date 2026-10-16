# Notas de design — novos lutadores

`lore/membros.json` (e a versão legível `lore/MEMBROS.md`) guarda, por **origem**, todos os membros conhecidos com
elemento (afinidade), classe, trilha, rituais, habilidades, arsenal e aparência, direto da wiki.
Atualizar: `npm run lore` (tudo) ou `npm run lore -- Dante` (só um nome). Para incluir alguém novo, acrescente em
`ORIGINS` no topo de `tools/fetch-lore.mjs`.

## Como adicionar um lutador (ex.: "quero adicionar o Dante")
1. Ler a entrada dele em `lore/MEMBROS.md` → origem, elemento, rituais e habilidades.
2. Montar o kit com a mesma estrutura dos outros (`src/characters/<id>.js`):
   - `origin`, `element` (de `src/config/elements.js`), `color`/`energyColor` puxando a cor do elemento;
   - físico ○ (sequência + frente/trás/lado/aéreo), principal □, até 4 secundárias em R1 + (□ ○ △ ×),
     especial △→△→○ (250 de dano, regra geral) e 1 passiva tirada de uma habilidade do cânone;
   - nomes de golpes/rituais exatamente como na wiki (ex.: `Destruição Temporal "Rotura"`).
3. Modelo no Blender (`tools/blender/char_<id>.py`) seguindo a aparência da wiki + referências do usuário.
4. Registrar em `src/characters/index.js`, rodar `npm run check`, `npm run moves` e lutas CPU × CPU.

## Rascunhos de kit (prontos para virar personagem)

| Lutador | Origem | Elemento | Ideia de kit a partir do cânone |
|---|---|---|---|
| **Dante** | Ordo Realitas | Morte | □ Decadência "Decadenza" (fumaça preta que causa dano contínuo) · R1+□ Embaralhar "Trinitá" (cria cópias; troca de lugar com uma) · R1+○ Tentáculos de Lodo (prende em área) · R1+△ Cicatrização "Paradiso" (cura a si) · especial Destruição Temporal "Rotura" (o alvo apodrece em espiral) · passiva Concentração Inquebrável (pode usar 2 rituais seguidos) |
| **Rubens Naluti** | Ordo Realitas | Energia | ver `MEMBROS.md` (1 ritual + habilidades de combate) |
| **Carina Leone** | Ordo Realitas | Conhecimento | 19 habilidades (sem rituais próprios na wiki) — lutadora técnica |
| **Balu (Antônio Pontevedra)** | Ordo Realitas | — | tanque: aguenta golpes pelos aliados (cânone: "leva ataques no lugar dos aliados") |
| **Artemis** | Escriptas | Sangue | 3 rituais de Sangue (disfarce usado no Gal) |
| **Damir Lukic** | Escriptas | Conhecimento | 8 rituais — ocultista de longa distância |
| **Boris Lukic** | Escriptas | Morte | brutamontes corpo a corpo |
| **T-Bag (Theodore Bagwell)** | Escriptas | Sangue | 2 rituais de Sangue + 6 habilidades |
| **Juan (Henri)** | Escriptas | Sangue | 6 rituais de Sangue |
| **Rana** | Escriptas | Energia | leques — o Leque da Fatalidade (Velocidade Mortal) ficou com a Ordem depois da morte dela |

**Próximos (2026-10-06):** **Arnaldo Fritz** (transforma em **O Anfitrião** com a Relíquia de Energia do relógio de
bolso) e **Senhor Veríssimo** (usa a espada do Arnaldo) — pesquisa e propostas de kit em `TODO.md`.

Quem tem poucos dados na wiki (Aaron, Tirigan, Dagan, Hugo, Cassiano, Tim...) precisa de mais pesquisa ou de
decisões do usuário antes de virar lutador.

## Cristino (Transtornados, Hexatombe) — no jogo desde 2026-10-16

A wiki não traz o arsenal em tabela (o `npm run lore` grava `arsenal: ""`), então fica registrado aqui:

- **Arsenal (wiki):** Espingarda Socadeira (carrega pela boca; a coronha com a roda de espinhos vira bastão), Peixeira,
  Lampiões Explosivos. O Pingente de Tenebris (o medalhão que o Quibungo roubou) é acessório no peito.
- **Ficha de Hexatombe:** 120 PV (visto pela Intenção do Remi) → passiva Couro Curtido; a ficha alternativa dos Arquivos
  Secretos (Pacote 01) é paga e não está na wiki.
- **Cena → golpe:** a armadilha do Quibungo (ep. 5) → Lampião Explosivo, Trilha de Lampiões, o tiro que detona os
  lampiões em cadeia e o especial *Um, Dois, Três*; a Igreja de Sangue (ep. 9) → Corda do Telhado; o braço do Raziel e o
  Caíto → Decepar; tocar a Verdadeira Coroa de Espinhos (ep. 9) → a Transformação *Tocado pela Coroa* (Cristino
  Desertor: rabiscos vermelhos, o rifle das artes e a ligação com a Intenção).
- **Modelo:** `tools/blender/char_cristino.py` (fonte `tools/blender/fonte/cristino.blend`); cabelo, bigode, lenço, bolsa,
  copa do chapéu e calça bufante saem da escultura orgânica de `tools/blender/sculpt_lib.py`.
