// Versão do jogo e NOVIDADES (changelog). Cada atualização conta, inclusive as que foram juntas numa só publicação.
// Para uma nova atualização: suba VERSION e acrescente a entrada no TOPO de CHANGELOG (textos para jogadores, os mesmos
// do CHANGELOG-CLIENTE.md; detalhes técnicos vão no CHANGELOG-ADMIN.md).
export const VERSION = 24;
export const VERSION_LABEL = `v${Math.floor(VERSION / 10)}.${VERSION % 10}`;

export function formatVersion(version) {
  return `v${Math.floor(version / 10)}.${version % 10}`;
}

export const CHANGELOG = [
  {
    v: 24,
    date: '2026-10-03',
    title: 'Interface e carregamento',
    items: [
      'Na luta pelo PC em janela pequena, os nomes longos das habilidades não estouram mais as caixas: ficam em até duas linhas (com reticências) e o nome inteiro aparece ao passar o mouse.',
      'O jogo abre mais rápido nas próximas visitas: a parte gráfica (three.js) e os dados dos personagens ficam em arquivos separados, e o navegador guarda a parte gráfica entre uma atualização e outra.',
    ],
  },
  {
    v: 23,
    date: '2026-10-03',
    title: 'Ajustes do TODO',
    items: [
      'Santo Berço ganhou névoa: nuvens baixas girando pela praça e um banco de névoa denso sobre o Labirinto Infinito.',
      'A CPU agora limpa as invocações fracas do adversário que estiverem por perto (Zumbis de Sangue fracos, clones do Trinitá) antes de voltar para a luta, e o Diabo da CPU usa o Transportar pelo Sangue para arrastar quando está colado.',
      'Arthur: sem sanidade, ele paga os rituais e a Arma de Sangue com o próprio sangue (2 de vida por ponto que faltar, nunca abaixo de 15% da vida).',
      'Veias de Sangue do Diabo: agora o sangue rompe as veias do alvo e vira correntes que saem do peito dele e se cravam no chão em volta — nada sai da mão do Diabo.',
      'Amaldiçoar Arma do Diabo: as garras pingam sangue o tempo todo.',
      'Juan: a Lâmina de Sangue virou uma meia-lua de sangue cortada pela faca, que pinga no caminho e faz sangrar.',
      'Juan: a Armadura de Sangue Diabólica também nasce sozinha depois que ele sangra o bastante (a cada 220 de dano recebido).',
      'Aghata ganhou dois rituais do cânone: Passagem de Conhecimento (troca de mente com o adversário — os dois trocam de lugar e ele volta de costas, atordoado e desorientado) e Leitura de Rituais (por 7 s recebe 40% menos dano de rituais e especiais).',
      'Aguiar: com a Máscara do Mutilador Noturno, todo golpe do machado faz sangrar enquanto ele estiver mascarado — no corpo a corpo e também o machado arremessado na corda.',
    ],
  },
  {
    v: 22,
    date: '2026-10-03',
    title: 'O Diabo reformulado',
    items: [
      'O Diabo (Juan) foi reformulado com base no cânone de Hexatombe. Pacto, o especial, agora é uma escolha: o Diabo sai do Símbolo do Pacto cara a cara com você e oferece um pacto — aperte Golpe para aceitar ou Defesa para recusar (calar é consentir).',
      'Aceitar o Pacto: você ganha o presente (cura e sanidade cheia), mas fica Transtornado por 9 s — não defende, leva mais dano e a sanidade escorre de volta para o Diabo. Recusar: o Diabo cobra à força, com três garradas e um rasgo que arremessa e faz sangrar.',
      'Lança de Sangue refeita: uma lança de verdade, que empala (prende os pés por um instante), faz sangrar, fica cravada na parede e deixa uma poça de sangue. Com direção: para a frente a Lança Cravada, para os lados Quatro Lanças (uma de cada braço) e para trás um salto com arremesso.',
      'Poças de sangue: quem pisa nelas atola, o Diabo regenera mais rápido em cima delas e o Transportar pelo Sangue sai por elas. Nascem da Lança, do Sangue nos Arredores, dos Zumbis e do Pacto.',
      'Ódio do Diabo agora é lançado no adversário, como no cânone: ele fica cego de ódio por 6 s — bate um pouco mais forte, mas não defende, não usa rituais nem tiros e leva mais dano — enquanto o Diabo se alimenta do ódio.',
      'Transportar pelo Sangue: sai pela poça mais perto do adversário; com o adversário colado, arrasta-o junto e o cospe caído em outra poça.',
      'A Regeneração do Diabo fica mais forte quando ele está ferido, e ele bate mais forte em quem é de Conhecimento, o elemento que ele jurou destruir.',
      'Os Zumbis de Sangue sobem rastejando de poças de sangue e, ao morrer, se desmancham numa poça.',
      'Armadura de Sangue do Juan refeita como na arte de referência: o sangue cresce sobre um lado do corpo numa carne porosa cheia de furos — espinhos no ombro, o braço e a perna tomados, veias pelo peito e garras nos pés. Em quem conjura, o braço da faca vira arma de sangue (luva de sangue e lâmina ensanguentada, golpes físicos 25% mais fortes); recebida pela assistência do Juan, só protege de golpes físicos e tiros.',
      'Arthur: a Armadura de Sangue saiu do kit dele (não existe no cânone) — o sangue dele fica só na Arma de Sangue. No lugar entrou Analisar Brecha (cânone): ele acha uma brecha no adversário, que recebe 25% a mais dos golpes físicos por 7 s.',
      'Defesa + um toque na direção: passo rápido para aquele lado, de frente para o adversário (como no Storm). Segurando a direção, continua andando defendendo.',
      'A Poça de Lodo do Dante agora é uma poça preta e brilhante no chão, com bolhas, em vez de uma nuvem de fumaça.',
      'A foice da Marionete risca o chão enquanto ela anda, e dá para escapar mais cedo do agarrão dela apertando os botões sem parar.',
      'Equilíbrio do Diabo: menos sangramento na Lança, Ódio do Diabo dá +15% (era +20%), menos roubo de vida e um pouco menos de vida na forma (1150).',
    ],
  },
  {
    v: 21,
    date: '2026-10-03',
    title: 'A Marionete e a horda de sangue',
    items: [
      'A Marionete do Dante foi refeita do zero: um crânio com a mandíbula forçada aberta por fios, cabelo preto comprido, braços de galho erguidos como se puxados por cordas invisíveis, estacas nas costas e uma foice feita de ossos amarrada no braço direito.',
      'A Marionete agora anda devagar e aos trancos, atravessa paredes e obstáculos, revida na hora quem chega perto e tem um golpe novo, Ironia do Destino: dois cortes da foice, agarra e arrasta a vítima — e metade do dano que ela levar enquanto segura vai para quem está preso.',
      'A Marionete prefere caçar adversários de Energia: contra eles, quase não se volta contra o Dante.',
      'Os Zumbis de Sangue do Diabo ganharam modelos novos: carne viva vermelha, sem olhos, a cabeça tomada por uma boca cheia de presas e braços longos com garras.',
      'Senhor do Sangue agora invoca uma horda: 1, 2 ou 3 zumbis fracos e rápidos, ou 2 fracos e 1 zumbi forte, enorme e quase de quatro, cuja pancada derruba.',
      'Na seleção de personagens, os retratos não mostram mais um personagem "fantasma" de outro lutador atrás de cada um.',
    ],
  },
  {
    v: 20,
    date: '2026-10-03',
    title: 'Vitória, celular e correções',
    items: [
      'Tudo o que tinha sumido numa atualização anterior voltou: as conversas antes de cada confronto, as falas de vitória variadas e os nomes atualizados dos personagens.',
      'Tela de vitória: os vencedores aparecem onde a luta terminou, de frente para a câmera, com quem venceu no meio, uma pose de vitória própria para cada personagem e o nome embaixo de cada um.',
      'No Bar Suvaco Seco, a tela de vitória não mostra mais a parede do bar por fora.',
      'Celular deitado: o menu inteiro cabe na tela, a seleção mostra os rostos dos personagens e, na apresentação, os botões saem da frente das falas — um toque pula a cena.',
      'Na luta pelo celular, o botão de tela cheia não cobre mais a vida do adversário.',
      'A ficha da seleção de personagens mostra todas as habilidades e o especial sem cortar.',
      'Especiais que transformam ou invocam (como Vestir as Faixas, Renascimento e Pacto do Santo) agora são descritos corretamente.',
      'Na pausa, a lista de comandos pode ser rolada até o fim.',
      'A luta ficou mais leve para rodar.',
      'No Online, os campos de nome, código e senha voltaram a ter letras legíveis.',
      'Equilíbrio: Gal Sal ficou mais forte (os cortes curam menos o adversário) e Kaiser um pouco mais fraco nos socos rápidos.',
    ],
  },
  {
    v: 19,
    date: '2026-10-03',
    title: 'Mobile mais fácil de jogar',
    items: [
      'Na tela de vitória, o personagem e a equipe vencedora aparecem em pose 3D no próprio cenário da luta.',
      'A interface mobile foi reorganizada para usar melhor o espaço da tela, sem rolagem nos menus e seleções.',
      'Os controles de combate aparecem somente durante a partida; os menus podem ser usados tocando nas opções.',
      'Adicionada uma seta para voltar nas telas internas, além de opção de tela cheia.',
      'No celular, o jogo pede orientação horizontal para facilitar os controles.',
    ],
  },
  {
    v: 18,
    date: '2026-10-03',
    title: 'Novas falas e apresentações',
    items: [
      'Os personagens agora têm falas próprias antes da luta e ao vencer, com variações para cada rival.',
      'As apresentações ficaram mais naturais e podem ser acompanhadas antes do início da luta.',
      'As falas ficam na tela por mais tempo para você conseguir ler tudo com calma.',
      'A luta só começa depois da apresentação, sem consumir o tempo do combate.',
    ],
  },
  {
    v: 17,
    date: '2026-10-03',
    title: 'Apresentações e finais aprimorados',
    items: [
      'A tela de vitória agora mostra a equipe vencedora e uma fala especial do personagem.',
      'Os lutadores entram em cena e conversam antes da luta; se preferir, você pode pular a apresentação.',
      'As falas de entrada e vitória combinam melhor com a personalidade e a relação entre os personagens.',
      'Ajustes na pausa e na formação das equipes deixam as partidas mais organizadas.',
    ],
  },
  {
    v: 16,
    date: '2026-10-02',
    title: 'Partidas online e novidades de combate',
    items: [
      'NOVO: jogue online ou pela rede local. Crie uma sala pública ou privada, com senha opcional, ou entre usando um código.',
      'Os comandos de algumas habilidades foram ajustados; △ + ○ e △ + □ agora são feitos em sequência, soltando △ antes do segundo botão.',
      'Os combos e as quedas ficaram mais equilibrados, dando aos lutadores um momento para se recuperar.',
      'Os tiros respeitam as paredes, enquanto o Disparo Espiral encontra passagens abertas — mas ainda pode ser esquivado.',
      'Ajustes nas habilidades e nos tempos de recarga da Kemi.',
      'As formas Deus da Morte e Diabo ganharam movimentos próprios.',
      'Ajustes visuais e na câmera deixam os cenários e as lutas mais fáceis de acompanhar.',
    ],
  },
  {
    v: 15,
    date: '2026-10-02',
    title: 'Menus mais fáceis de usar',
    items: [
      'O comando de voltar agora funciona de forma consistente em todas as telas.',
      'Na seleção de lutadores, voltar desfaz a escolha em vez de iniciar a partida.',
      'Ajustes na tela do tutorial durante a pausa.',
    ],
  },
  {
    v: 14,
    date: '2026-10-02',
    title: 'Tutorial, novo lutador e controles',
    items: [
      'NOVO: aprenda os golpes de cada personagem em um tutorial passo a passo.',
      'Miguel agora luta como Ferreiro, com novos poderes e uma transformação especial.',
      'A forma Fantasma da Kemi permanece até o fim da luta.',
      'Assistências e esquivas foram ajustadas, e agora é possível esquivar enquanto carrega energia.',
      'Melhorias nos golpes da Lírio e nos comandos para trocar de personagem em equipe.',
    ],
  },
  {
    v: 13,
    date: '2026-10-02',
    title: 'Correção ao abrir o jogo',
    items: [
      'Corrigido um problema que impedia o jogo de carregar corretamente.',
    ],
  },
  {
    v: 12,
    date: '2026-10-02',
    title: 'Controles revisados',
    items: [
      'Os comandos de defesa, esquiva e assistência ficaram mais simples.',
      'Habilidades agora usam combinações de botões mais fáceis de lembrar.',
    ],
  },
  {
    v: 11,
    date: '2026-10-02',
    title: 'Novos comandos de habilidade',
    items: [
      '△ + ○ e △ + □ agora ativam habilidades especiais.',
      'Os golpes foram simplificados para evitar comandos repetidos para a mesma habilidade.',
    ],
  },
  {
    v: 10,
    date: '2026-10-02',
    title: 'Novo cenário e arenas renovadas',
    items: [
      'NOVO cenário: Santo Berço, a praça dos Luzidios diante do Labirinto Infinito.',
      'As arenas Ruínas, Orfanato, Bar e Coliseu ganharam uma aparência renovada.',
      'Efeitos visuais de algumas armas foram aprimorados.',
    ],
  },
  {
    v: 9,
    date: '2026-10-02',
    title: 'Combate mais equilibrado',
    items: [
      'Ajustes de equilíbrio para Kemi, Juan e Ferreiro.',
      'Novas falas de entrada e vitória para esses personagens.',
      'Melhorias visuais no Ferreiro.',
    ],
  },
  {
    v: 8,
    date: '2026-10-02',
    title: 'Aparência dos personagens renovada',
    items: [
      'Kemi, Fantasma, Juan, Diabo, Aguiar e Labirinto receberam melhorias visuais.',
    ],
  },
  {
    v: 7,
    date: '2026-10-02',
    title: 'Três novos lutadores',
    items: [
      'Conheça três novos lutadores: Ferreiro, Juan e Kemi.',
      'A seleção de personagens ficou mais fácil de navegar, e os golpes da Lírio foram aprimorados.',
    ],
  },
  {
    v: 6,
    date: '2026-10-02',
    title: 'Celular e cenários',
    items: [
      'Controles de toque aprimorados e uma nova tela para escolher o cenário.',
    ],
  },
  {
    v: 5,
    date: '2026-10-01',
    title: 'Lírio',
    items: [
      'Lírio Tellini chegou ao elenco com sua arma Leonora e novos golpes.',
    ],
  },
  {
    v: 4,
    date: '2026-10-01',
    title: 'Primeira publicação',
    items: [
      'A primeira versão de Arena Paranormal ficou disponível para jogar.',
    ],
  },
  {
    v: 3,
    date: '2026-10-01',
    title: 'Labirinto e Xande',
    items: [
      'Labirinto e Xande chegaram ao elenco.',
    ],
  },
  {
    v: 2,
    date: '2026-10-01',
    title: 'Batalha em equipe',
    items: [
      'Chegou o modo de batalha em equipe, com troca de personagem e novas habilidades para Kian e Erin.',
    ],
  },
  {
    v: 1,
    date: '2026-10-01',
    title: 'Arena Paranormal',
    items: [
      'Comece sua aventura em uma arena de luta 3D com nove personagens jogáveis.',
    ],
  },
];
