# Design direction — página SOBRE / BAIXAR (`sobre.html`)

Reference: [ThoughtLab — Refero Styles](https://styles.refero.design/style/82d52a5f-b1bb-4a69-91a3-15a7eb8bbe99) ("Obsidian
monument with crimson signal"), revisada em 2026-10-16. Segunda referência de clima: Ciridae ("void chamber with ember
pulse"), da coleção Dark Mode do Refero.
Purpose: quem chega ao jogo (pelo menu SOBRE O JOGO / BAIXAR ou por um link compartilhado) entende em segundos o que é o
Arena Paranormal e baixa a versão do aparelho dele — ou joga no navegador.

## O que veio da referência
- Canvas quase preto e UMA cor de acento: o carmesim só na ação principal de cada tela (o botão de download do hero).
- Hierarquia por ESCALA (título enorme em caixa alta, linhas apertadas), não por caixas, sombras ou brilhos.
- Botões em pílula (`border-radius: 9999px`); cartões transparentes, separados por fio fino, sem preenchimento.
- Corpo em cinza claro (não branco puro) para cansar menos a vista no fundo escuro.

## O que mudou para o jogo
- Fontes do próprio jogo: **Bebas Neue** (display, caixa alta) + **Inter** (leitura). A referência usa uma fonte só;
  aqui são duas para manter a identidade do jogo (o limite do padrão é 2 famílias).
- O carmesim é o vermelho do jogo, escurecido para o texto branco passar no AA (≥ 4,5:1).
- As cores dos ELEMENTOS (Sangue, Morte, Conhecimento, Energia, Medo) aparecem só como marcadores do elenco — são
  informação, não decoração.
- Fotos reais do jogo ao lado de cada afirmação (luta, transformação, invocação, seleção), capturadas no próprio jogo.

## Typography
Display: Bebas Neue 400, `clamp(64px, 14vw, 176px)` no hero, line-height 0.9, letter-spacing .02em; títulos de seção
`clamp(36px, 6vw, 64px)`.
Body: Inter 400/600/800, 16px, line-height 1.6, largura de leitura até 64ch; labels 12px 800 caixa alta, tracking .2em.

## Color roles
| Papel | Token | Valor | Uso |
|---|---|---|---|
| Canvas | `--void` | `#0a0809` | fundo da página |
| Superfície | `--surface` | `#141012` | cartões de download, tabela, FAQ |
| Fio | `--line` | `#2a2226` | divisórias e bordas |
| Texto display | `--frost` | `#f4eff1` | títulos e números |
| Texto | `--ash` | `#c9c1c5` | corpo (13:1 no canvas) |
| Texto fraco | `--graphite` | `#948a90` | legendas, meta (≥ 5,5:1) |
| Ação | `--crimson` | `#c8183a` | SÓ o botão principal (branco sobre ele ≥ 5,6:1) |
| Foco | `--focus` | `#f4eff1` | anel de foco visível (2px + 2px de folga) |

## Layout
Content width: 1120px; margens laterais 16px no celular, 32px no tablet, 48px no desktop.
Spacing rhythm: 8 · 16 · 24 · 48 · 96 (seções separadas por 96px no desktop e 64px no celular).
Áreas de toque ≥ 44 × 44px.

## Open decisions
- Tema claro: não — o jogo é escuro e a marca é escura.
- Tradução da página: só pt-BR por enquanto (o jogo tem 13 idiomas; a página ainda não).
