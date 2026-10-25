# Auditoria — Kian e Joui (habilidades, transformações e cânone)

Feito em 2026-10-26 a partir do feedback do Vitor no TODO ("ARENA PARANORMAL — FEEDBACK", 25/10/2026). Código lido na
v3.41.0. Fontes canônicas: wiki pt-br de Ordem Paranormal — páginas *Kian*, *Rituais*, *Joui Jouki* e *A Magistrada*
(baixadas pela API do wiki em 2026-10-26).

Legenda das colunas: **Código** = o que a implementação faz de verdade · **Cânone** = o que a wiki registra ·
**Proposta** = decisão de design do jogo (não é poder oficial).

---

## KIAN

### Arquivos
- `src/characters/kian.js` (kit normal), `src/characters/forms/kian_calamidade.js` (a forma),
  `src/combat/kianPowers.js` (a Escrita), tipos em `src/combat/abilities.js` (`blink`, `levitation`, `fearBlade`,
  `rejectMist`, `deathTouch`), especial `src/combat/specials/erase.js`, transformação `specials/maskTransform.js`
  (cena `calamity`).

### Fatos canônicos (wiki *Kian* / *Rituais*)
- Depois de Luciano chegar a 50% e Kian adquirir a Marca, ele **sabe qualquer ritual**; até Carina completar o Grimório
  (Calamidade, ep. 11) os registrados são: **Inexistir**, **Teletransporte**, **Toque da Morte**, **Rejeitar Névoa**,
  **"Levitação"** e **Lâmina do Medo**. Habilidades: **Precognição**, **Físico Sobrenatural**, **Imortalidade**
  (entidade de Conhecimento: a Lâmina de Sangue do Arthur na testa só o desacordou).
- **Rejeitar Névoa** (Medo + Conhecimento): "em um raio de 20 metros a névoa é dissipada, fazendo com que **todos os
  rituais nesse raio demorem muito mais para serem conjurados**, e rituais de conjuração instantânea se tornam rituais
  de conjuração contínua". Usado contra a aproximação das Máscaras pelas sombras.
- **Lâmina do Medo** (Medo + Morte): lâmina translúcida na mão com uma melodia impossível; ao perfurar, deixa o alvo
  **morrendo no mesmo instante** (Gal, Boris).
- **Toque da Morte** (Morte): envelhece o alvo até definhar (4d10).
- Em **Calamidade**: teleporta-se entre locais (Orfanato → Domus Aurea), **imobiliza a Agatha** com as mãos, usa a
  Lâmina do Medo várias vezes, **derrota a Magistrada facilmente**, espanca Joui até a morte depois de perder os rituais.

### Tabela — kit normal
| Habilidade | Código (v3.41.0) | Cânone | Problema | Recomendação |
|---|---|---|---|---|
| Teletransporte (△+□) | `blink`: reaparece na direção do analógico ou do lado do alvo socando; 20 PE, 7 s | Ritual registrado | — | manter |
| Levitação (R2+△) | `levitation`: 5 pedras voam no alvo, 16 cada | "levitar e mover pequenos objetos" | — | manter |
| Lâmina do Medo (△+○) | `fearBlade`: golpe curto que quebra defesa, 160, 40 PE, 25 s | deixa o alvo morrendo | no normal é aceitável | manter; na forma, efeito "morrendo" |
| **Rejeitar Névoa** (R2+×) | `rejectMist`: apaga **zonas** inimigas no raio de 7 m e dá `ritualWeak` (×0,6 em habilidade e tiro) por 4 s em quem estiver no raio | conjuração muito mais lenta no raio; instantâneos viram contínuos | **só a Kaiser cria zonas** (`createMistZone`, névoa) — contra qualquer outro, sobra um debuff de 4 s que não muda a luta | refazer pelo cânone (abaixo) |
| Toque da Morte (△+L2) | `deathTouch`: definha, lento e −20% de dano até o fim do round | envelhece até definhar | — | manter |
| Inexistir (especial) | `erase`: 2 por partida, apaga quem tem ≤ 35% | ritual registrado | — | manter |
| Escrita (passiva) | `kianScript`: marcas, 5 detonam | o Conhecimento escreve nos Marcados (Escriptas) | — | manter |

### Tabela — Kian de Calamidade (forma)
| Item | Código | Problema |
|---|---|---|
| Kit | `...base` com **todos os números × 1,2**, `unblockableMelee`, Escrita com 4 marcas | **é o mesmo kit com atributos maiores** — o feedback pede kit próprio |
| Habilidades | `base.abilities.map(dano × 1,2)` | nenhuma habilidade muda de função |

### Proposta (design — não são poderes oficiais)
**Rejeitar Névoa (as duas formas), pelo texto do ritual:** cria por 6 s uma área (raio 6 m; 8 m na forma) em volta do
Kian onde a névoa se dissipa:
- **Conjuração contínua:** todo RITUAL do adversário (habilidade △/R2 e o especial) começado dentro da área precisa
  ser conjurado antes de sair — fica parado 0,7 s com o sigilo aparecendo, e **um golpe interrompe** (a sanidade gasta
  não volta). É o "demoram muito mais para serem conjurados" do cânone e vale contra o elenco inteiro.
- Os rituais que conseguirem sair de dentro da área causam −25% (o "enfraquecido drasticamente").
- **Interação especial com a Kaiser preservada:** as névoas dela (Baforada e Cinerária) que tocarem a área se
  dissipam na hora.
- Contrajogo: sair da área antes de conjurar, usar golpes físicos e tiros (não são rituais), ou bater no Kian.
- Exceções: armas e tiros comuns não são afetados; a Transformação não é afetada (é a Barra, não um ritual).

**Kian de Calamidade — kit próprio** (rituais com funções distintas):
- **Controle — Levitação: Suspender** (base canônica: a Levitação e a imobilização da Agatha): ergue o adversário no
  ar à distância (até 9 m), segura ~1 s sem ação e o arremessa no chão. Dá para esquivar no começo.
- **Mobilidade — Teletransporte de Calamidade:** recarga curta (3 s) e mais barato — ele se teleporta sem esforço.
- **Pressão — Impacto Sigilar maior** e a Escrita detonando com 4 marcas (já existia).
- **Finalização — Lâmina do Medo de Calamidade:** além do golpe, deixa o alvo **MORRENDO** (sangra Conhecimento por
  6 s e não regenera sanidade) — é o "morrendo no mesmo instante" do cânone, sem matar na hora.
- Rejeitar Névoa maior (8 m, 7 s). Toque da Morte e Inexistir iguais.

---

## JOUI

### Arquivos
- `src/characters/joui.js`, props `addJouiProps` (`src/models/props.js`: katana e bainha), modelo
  `tools/blender/char_joui.py` (máscara `prop_maskOn` / `prop_maskSide`), especial `specials/teleportStrike.js`,
  despertar `specials/awakenMode.js`.

### Fatos canônicos (wiki *Joui Jouki* / *A Magistrada*)
- **Fase da Seita das Máscaras** (Desconjuração ep. 17 → Calamidade ep. 9): usa a máscara preta com o símbolo da
  Máscara do Desespero; **sem a máscara, aparentava não poder usar os mesmos poderes**. Em Calamidade:
  **Teleporte das Sombras** (entra na própria sombra e surge de outra) e **Portal das Sombras** (traz um objeto, como a
  katana, para a mão).
- **Depois do ep. 9 de Calamidade:** a katana antiga vira a **Relíquia de Energia** (lâmina brilhante "como um sabre
  de luz"; a Magistrada faz uma bainha com Sigilos de Conhecimento roxos para contê-la); a Magistrada lhe dá uma
  **katana nova, a Shi no Kage ("Sombra da Morte")**: lâmina **preta, amaldiçoada com Conhecimento, com Sigilos de
  Conhecimento dourados** que brilham. Joui **entrega a máscara à Magistrada** e a perde para sempre.
- Rituais próprios (não da máscara): Envelhecimento Localizado "Mateo", Coincidência Forçada "Rodolfo", Pavor Anormal.
  Habilidades: Espadachim, Olhar do Desespero, Decepar, Um por Um, Técnica Secreta (Desarmar), Precognição,
  Resistência Paranormal.

### Tabela — kit atual
| Item | Código (v3.41.0) | Fase canônica | Problema |
|---|---|---|---|
| Teleporte das Sombras (△+×) | `teleportBehind` | **máscara** (Calamidade) | ok para o Joui mascarado |
| Sombra Rasteira (□) | projétil de sombra | **máscara** (proposta antiga) | ok para o mascarado |
| Corte das Sombras (△+L2) | `dashStrike` de sombra | **máscara** (proposta antiga) | ok para o mascarado |
| Mateo, Olhar do Desespero, Pavor Anormal | habilidades | próprios dele | ok |
| Especial **"Shi no Kage"** | `teleportStrike` (some nas sombras e golpeia pelas costas) | Shi no Kage é o **nome da katana** da fase SEM máscara | **nome errado** para um golpe de sombra da máscara |
| Despertar "Técnica Secreta" | `awakenMode`: +15% dano/velocidade, aura, Desarmar | habilidade dele | **mesmo kit com atributos** — o feedback pede kit diferente |

### Decisão de fase (explícita)
- **Joui normal = o Joui MASCARADO da Seita** (máscara, sombras, teleporte) — é o modelo atual.
- **Transformação = "Shi no Kage": o Joui depois do ep. 9 de Calamidade** — tira a máscara (a máscara some), troca a
  katana pela **Shi no Kage** (preta com sigilos dourados) e **perde os poderes da máscara** (sem Teleporte das
  Sombras, sem Sombra Rasteira, sem Corte das Sombras). A bainha com sigilos roxos guarda a **Relíquia de Energia**.
  Não mistura as duas fases.

### Proposta — kit da forma Shi no Kage (design)
- **Físico:** sequência nova de esgrima técnica com a Shi no Kage — cortes mais rápidos e um pouco mais longos, com o
  rastro dourado e dano de **Conhecimento**; o contra-ataque Coincidência Forçada fica.
- **□ Corte de Conhecimento:** um corte à distância (a onda dourada de sigilos) no lugar da Sombra Rasteira.
- **△+L2 Saque da Relíquia:** o iaijutsu sacando a **Relíquia de Energia** da bainha (lâmina de luz roxa): avanço
  cortante de Energia, o golpe mais forte do kit.
- **△+× Passo do Espadachim** no lugar do teleporte: um avanço rápido em linha (sem sombras — ele não tem mais a
  máscara).
- Ficam: Mateo, Olhar do Desespero, Pavor Anormal; passivas Decepar, Um por Um, Precognição, Resistência e a
  **Técnica Secreta (Desarmar)** passa a ser passiva da forma.
- **Especial "Shi no Kage" (Sombra da Morte):** muda para a forma (é o nome da katana): uma sequência de cortes da
  katana preta com os sigilos dourados acendendo. O especial do Joui mascarado passa a se chamar **"Execução das
  Sombras"** (proposta; o golpe pelas costas saindo da sombra).
- Volta ao normal no fim do round (sistema de formas: modelo, máscara e katana voltam).

## Testes a fazer (do feedback)
Transformação e retorno; habilidades com e sem sanidade; recarga, interrupção, defesa, esquiva, acerto, erro e KO
durante as animações; Rejeitar Névoa contra Kaiser e contra outros; CPU usando as habilidades; troca de personagem e
reinício sem efeitos residuais; `npm run check`, `npm test`, `npm run build`.

---

## Implementado (2026-10-26) — conferência "melhor de verdade, não só %"

Cada habilidade das formas foi comparada com a versão normal; as que só mudavam números ganharam uma função nova:

| Forma | Habilidade | Normal | Na forma (função nova) |
|---|---|---|---|
| Realizador da Calamidade | Teletransporte | um salto | **dois saltos** (o segundo de graça em 1,6 s) e o soco de chegada escreve 2 marcas |
| | Levitação → **Suspender** | pedras voam no alvo | ergue o **próprio adversário** e o arremessa no chão |
| | Lâmina do Medo | golpe que quebra a defesa | deixa **MORRENDO** (sangra 14/s por 6 s, sem regenerar sanidade) |
| | Rejeitar Névoa | conjuração contínua na área | + **desfaz os rituais que o adversário já tem ativos** |
| | Toque da Morte | envelhece e enfraquece | + **suga a sanidade** do alvo a zero, sem regenerar |
| | Impacto Sigilar | 2 marcas | **3 marcas** (com a Escrita detonando em 4) |
| Shi no Kage | □ | Sombra Rasteira | **Corte de Conhecimento** |
| | △+× | Teleporte das Sombras | **Saque da Relíquia** |
| | △+L2 | Corte das Sombras | **Decepar** (sangra, ferida aberta, decapita na vida baixa) |
| | Mateo | cura | cura e **fecha as feridas** (tira sangramento, MORRENDO, envelhecimento, cegueira...) |
| | Olhar do Desespero | paralisa | paralisa e deixa **ESMORECIDO** (−25% de dano por 5 s — o "esmorecido" do cânone) |
| | Pavor Anormal | armadilha à frente | o Símbolo surge **debaixo do adversário** (até 9 m, com aviso) |
| | Especial | Execução das Sombras (um golpe) | **Shi no Kage**: saca a Relíquia, duas lâminas, sigilo, Decepar, X final (~250 × ~180) |

Ainda pendente: animações próprias (tudo usa clipes existentes), trocar as propostas por feitos canônicos onde houver e
um visual próprio para o Suspender (ver TODO, "ANDAMENTO DO FEEDBACK").

### Depois (2026-10-26)
- Joui mascarado: **Portal das Sombras** (canônico) substituiu o Corte das Sombras (proposta); **Tomado pelo Ódio** (R2 + ×) ativa os poderes da máscara (pedido do dono).
- Suspender com os sigilos de Conhecimento (visual próprio). A cura que envelhece não deixa mais o cabelo branco (todos).
- CPU × CPU: 12 partidas sem erro nem estado preso.
