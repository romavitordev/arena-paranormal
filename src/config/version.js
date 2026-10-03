// Versão do jogo e NOVIDADES (changelog). Cada atualização conta, inclusive as que foram juntas numa só publicação.
// Para uma nova atualização: suba VERSION e acrescente a entrada no TOPO de CHANGELOG.
export const VERSION = 17;
export const VERSION_LABEL = `v${Math.floor(VERSION / 10)}.${VERSION % 10}`;

export function formatVersion(version) {
  return `v${Math.floor(version / 10)}.${version % 10}`;
}

export const CHANGELOG = [
  {
    v: 17,
    date: '2026-10-03',
    title: 'Apresentações, vitória e nomes atualizados',
    items: [
      'Tela de vitória com o cenário da luta, equipe vencedora completa em poses e fala do personagem ativo.',
      'Entradas caminhando e falas antes da primeira luta; “LUTEM” inicia o round. ×/Start pula a apresentação.',
      'Falas originais de introdução e vitória contextualizadas pelas relações conhecidas e personalidade dos personagens.',
      'Equipe vencedora sem integrantes repetidos e CPUs sem interferir na navegação durante a pausa.',
      'IDs internos, definições, modelos e assets atualizados para Kian, Arthur, Kaiser, Joui, Aghata e Gal Sal.',
    ],
  },
  {
    v: 16,
    date: '2026-10-02',
    title: 'Online / LAN, formas e Disparo Espiral',
    items: [
      'NOVO: ONLINE / LAN no menu inicial — escolha seu nome de usuário, crie uma SALA (código de 5 letras, senha opcional, pública ou privada), veja as SALAS ABERTAS no momento ou entre com o código. Funciona pela internet, na mesma rede ou pelo Radmin; os dois computadores andam juntos, quadro a quadro, e o nome de cada um aparece na luta.',
      'Habilidades de △ + ○ e △ + □ agora saem como no Storm 4: toque △, solte, e depois toque ○ (ou □). △ → △ → ○ continua sendo o especial.',
      'Fim de combo derruba sempre: quem apanhou cai, fica protegido no chão e levanta (~1,5 s) — dá tempo dos dois carregarem a sanidade.',
      'Os tiros não atravessam mais paredes (ex.: a parede do Bar Suvaco Seco).',
      'Disparo Espiral da Fantasma (cânone: "nega toda cobertura que não seja completa"): bala rápida, quase certeira, que acha o caminho por qualquer brecha (porta, vão) e pega em qualquer lugar do mapa — mas dá para ESQUIVAR. Mais dano no tiro e no especial (320).',
      'Kemi: o especial Disparo Espiral não fica mais travado 60 s depois de Vestir as Faixas (a recarga da transformação passava para ele); Vestir as Faixas: recarga de 60 para 30 s.',
      'Deus da Morte e Diabo com animações próprias (o gigante curvado que esmaga com o corpo todo; o predador agachado de garras abertas).',
      'Câmera: árvores, pedras, casas e colunas ficam transparentes quando tampam a luta (antes só algumas paredes); nos blocos grandes a câmera chega para a frente.',
      'Diabo: Sigilos de Conhecimento dourados no braço direito (onde o Juan tinha as tatuagens).',
      'Pele morena (Aguiar, Kemi) não fica mais rosada na luz roxa das Ruínas.',
      'Machado do Aguiar com o fio virado para a frente.',
    ],
  },
  {
    v: 15,
    date: '2026-10-02',
    title: 'Correções nos menus',
    items: [
      'Esc nos menus agora sempre VOLTA (antes, em algumas telas, avançava: seleção, configuração da batalha, vitória).',
      'Na seleção, Esc desfaz a escolha do P1 em vez de começar a luta.',
      'O cartão do tutorial não aparece mais por cima da pausa e dos outros menus.',
    ],
  },
  {
    v: 14,
    date: '2026-10-02',
    title: 'Tutorial, Ferreiro e controles revisados',
    items: [
      'NOVO modo TUTORIAL no menu inicial: escolha um personagem e aprenda todos os golpes dele, passo a passo, com as teclas do seu aparelho.',
      'Saiu a opção "Tutorial ON/OFF": os comandos aparecem sempre nos ícones da HUD.',
      'O Miguel virou o FERREIRO (o Luzidio de Santo Berço, com a Espada Consumidora); no Pacto do Santo, morrer o transforma no Deus da Morte. Nova habilidade: Armadura do Ferreiro (△ + L2).',
      'O nome no HUD volta ao normal quando a transformação acaba (antes ficava "O DEUS DA MORTE").',
      'A Fantasma (Kemi) agora dura até o fim do round.',
      'L1 / R1 chamam as assistências de TODOS os personagens (Ferreiro, Juan e Kemi não tinham assistência).',
      'Segurando △ para carregar, L2 esquiva: dá para fugir no meio da carga.',
      'Magras da Lírio: errando, a corda volta para a mão e some (antes ficava presa no cenário).',
      'Na batalha em equipe o D-pad volta a andar; a troca de personagem fica no analógico direito.',
      'Versão do jogo no menu e este quadro de novidades.',
    ],
  },
  {
    v: 13,
    date: '2026-10-02',
    title: 'Correção da publicação',
    items: ['Os arquivos do jogo voltaram a carregar no GitHub Pages.'],
  },
  {
    v: 12,
    date: '2026-10-02',
    title: 'Novo mapa de botões',
    items: [
      'L1 / R1 chamam as assistências; R2 defesa; L2 esquiva e substituição.',
      'Sem botão modificador: habilidades em △ + ○, △ + □, △ + L2, R2 + △ e R2 + × (R2 + ○ continua o agarrão).',
    ],
  },
  {
    v: 11,
    date: '2026-10-02',
    title: '△ como modificador',
    items: [
      '△ + ○ e △ + □ soltam habilidades (antes eram R1 + ○ / R1 + □).',
      'Saíram as "versões fortes" (o mesmo golpe com mais dano).',
    ],
  },
  {
    v: 10,
    date: '2026-10-02',
    title: 'Santo Berço e cenários refeitos',
    items: [
      'NOVO cenário: SANTO BERÇO — a praça dos Luzidios em frente ao Labirinto Infinito, com as estátuas dos Cinco Guardiões.',
      'Todos os cenários refeitos no Blender com modelos prontos gratuitos (Kenney): Ruínas, Orfanato, Bar, Coliseu e Santo Berço.',
      'Armas encantadas com Sangue usam a mesma textura de sangue da Arma de Sangue do Arthur.',
    ],
  },
  {
    v: 9,
    date: '2026-10-02',
    title: 'Polimento e equilíbrio',
    items: [
      'Equilíbrio medido contra todo o elenco: Kemi, Juan e Miguel ajustados.',
      'Falas de entrada e de vitória do Miguel, Juan e Kemi; jaqueta do Miguel corrigida.',
    ],
  },
  {
    v: 8,
    date: '2026-10-02',
    title: 'Personagens fiéis às referências',
    items: ['Kemi, Fantasma, Juan, Diabo, Aguiar e Labirinto refeitos com as referências visuais.'],
  },
  {
    v: 7,
    date: '2026-10-02',
    title: 'Três novos lutadores',
    items: [
      'Miguel Cariad (Luzidio e Deus da Morte), Juan (Renascimento no Trono do Diabo) e Kemi (A Fantasma).',
      'Seleção em páginas de 15 personagens; Magras da Lírio refeitas.',
    ],
  },
  {
    v: 6,
    date: '2026-10-02',
    title: 'Celular e cenários',
    items: ['Controles de toque melhorados e nova seleção de cenários.'],
  },
  {
    v: 5,
    date: '2026-10-01',
    title: 'Lírio',
    items: ['Lírio Tellini (Os Cinco) com a Leonora; habilidade em RB + LT para todos; polimento visual.'],
  },
  {
    v: 4,
    date: '2026-10-01',
    title: 'Primeira publicação',
    items: ['O jogo passou a rodar no GitHub Pages.'],
  },
  {
    v: 3,
    date: '2026-10-01',
    title: 'Labirinto e Xande',
    items: ['Novos lutadores: Labirinto (Mascarados) e Xande (Os Cinco).'],
  },
  {
    v: 2,
    date: '2026-10-01',
    title: 'Batalha em equipe',
    items: ['Troca de personagem na equipe, Kian mais ágil, Supernova da Erin e combo infinito.'],
  },
  {
    v: 1,
    date: '2026-10-01',
    title: 'Arena Paranormal',
    items: ['Jogo de luta 3D com 9 lutadores e seleção estilo Storm 4.'],
  },
];
