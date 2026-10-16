# Padrão de qualidade — página SOBRE / BAIXAR (`sobre.html`)

Status do checklist do padrão de qualidade de sites (Roma & Buganza) para esta página, em 2026-10-16 (v3.27.1).
`[x]` feito · `[~]` parcial · `[ ]` pendente · **N/A** não se aplica (com o motivo).

Medido com Lighthouse 12 (modo celular, Edge headless) no build de produção: **Performance 99 · Acessibilidade 100 ·
Boas práticas 100 · SEO 100** — LCP 1,7 s · CLS 0,059 · TBT 0 ms · FCP 0,9 s.

## 1. Design e referências
- [x] Direção visual a partir de referências — ThoughtLab (Refero Styles), ver [DESIGN-SOBRE.md](DESIGN-SOBRE.md) e o README.
- [x] Tokens antes das telas (variáveis CSS em `src/sobre.css`: cores com papel, espaçamento 8·16·24·48·96, raios).
- [x] No máximo 2 famílias de fonte (Bebas Neue + Inter); um `h1`, hierarquia h2/h3.
- [x] Contraste WCAG AA: corpo 13:1, texto fraco 6:1, botão carmesim com texto branco 5,7:1.
- [x] `prefers-reduced-motion` respeitado (sem rolagem suave nem transições).
- N/A Efeitos pesados (WebGL/shader), Cult UI e ShaderGradient — a página é HTML/CSS puro, sem React; o 3D é o próprio
  jogo, a um clique.
- N/A Modelos 3D na página — usamos capturas reais do jogo (WebP), não o modelo.

## 2. Frontend
- [x] Mobile first; conferido em 360, 768, 1280 e 1920 px, sem rolagem horizontal (a tabela de controles rola dentro dela).
- [x] Áreas de toque ≥ 44 px (botões, links do menu, perguntas, "como instalar").
- N/A Tema claro/escuro — a marca do jogo é escura (decisão registrada no DESIGN-SOBRE.md).
- [x] CTA principal acima da dobra (no celular de 360 px termina em 541 de 780 px) e escolhido pelo aparelho de quem vê.
- N/A WhatsApp, formulário e prova social de negócio — é um jogo grátis de fã, sem contato comercial. As "provas" são as
  telas reais do jogo ao lado de cada afirmação.
- [x] Imagens WebP com `width`/`height`, `srcset` (480 px no celular), `loading="lazy"` abaixo da dobra e
  `fetchpriority="high"` na imagem do topo.
- [x] Fontes com `display=swap`, sem bloquear a primeira pintura (carregadas por `preload` + troca).
- N/A Scripts de terceiros — não há analytics, pixel nem chat.
- [x] HTML semântico (`header`, `nav`, `main`, `section`, `footer`), link "Pular para o conteúdo", foco visível.
- [x] `alt` descritivo em todas as imagens de conteúdo.
- N/A Labels de formulário — a página não tem formulário.
- [x] `title` e `meta description` próprios, canonical, Open Graph e Twitter Card (com `og.jpg`).
- [x] JSON-LD `VideoGame` + `FAQPage`.
- [x] `sitemap.xml` e `robots.txt` (em `public/`, valem para o site todo).
- [ ] Search Console — precisa da conta do dono do site (romavitordev) para verificar o domínio github.io.
- N/A Google Business Profile e GA4 — não é negócio local e o jogo não usa analytics.

## 3. Backend
- N/A — página estática no GitHub Pages (HTTPS do próprio GitHub); sem servidor, rotas, banco nem segredos.
  Segredos: a auditoria do commit continua (nenhum segredo no repositório).

## 4. Compliance e LGPD
- N/A Consentimento, cookies e controlador — a página não coleta dado pessoal nem usa cookies; as opções do jogo ficam
  só no `localStorage` do aparelho. Única chamada externa: as fontes do Google Fonts (o navegador manda o IP ao Google)
  — se quiser zero terceiros, dá para hospedar as fontes junto do jogo.

## 5. Entrega
- [x] README com a página e as referências visuais usadas.
- [x] Textos e telas reais, sem placeholder (tamanhos dos downloads tirados da release v3.26.1).
- [~] Testado em Chrome/Edge (preview e Lighthouse); falta conferir no Safari do iPhone e no Samsung Internet.
- [x] Favicon e imagem de compartilhamento (`public/sobre/og.jpg`).
- [x] Página 404 personalizada (`public/404.html`).
- N/A Treinamento de painel — não há painel.

## Pendente
- Search Console (conta do dono).
- Teste em Safari (iOS) e Samsung Internet, em aparelho real.
- Opcional: hospedar as fontes localmente para não depender do Google Fonts.
- Opcional: traduzir a página (o jogo tem 13 idiomas; a página está só em pt-BR).
