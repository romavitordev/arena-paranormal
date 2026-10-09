// Versão semântica do jogo e NOVIDADES (changelog).
// Para uma nova atualização: atualize VERSION e acrescente a entrada no TOPO de CHANGELOG.
export const VERSION = '3.11.0';
export const VERSION_LABEL = `v${VERSION}`;

export function formatVersion(version) {
  if (typeof version === 'number') {
    return `v${Math.floor(version / 10)}.${version % 10}`;
  }
  return `v${version}`;
}

export const CHANGELOG = [
  {
    v: '3.11.0',
    date: '2026-10-09',
    title: 'As Torres',
    items: [
      'Novo modo: TORRES (menu principal). São 8 torres — só a primeira começa aberta; zerar uma destrava a próxima. Escolha a torre e a câmera sobe da base até o topo e se afasta mostrando a torre inteira.',
      'Em cada torre você escolhe UM lutador para subir até o fim (não dá para trocar) e a dificuldade, que vale para todos os andares. Venceu, sobe; perdeu, tenta o mesmo andar de novo ou desiste.',
      'No topo espera um vilão, diferente a cada subida: O Anfitrião, A Fantasma, o Mutilador Noturno, ???, Erin em Nome do Caos, o Portador do Trono ou O Deus da Morte — mais forte do que numa luta comum. A Torre VIII, a Torre de Babel, coloca os vilões nos andares e O Deus da Morte no topo.',
      'Cada torre mostra no menu a dificuldade mais difícil em que você já a zerou.',
      'Idiomas: trocar o idioma em OPÇÕES agora traduz o jogo na hora — menus, seleção, pausa, HUD, avisos da luta e partida online, em 13 idiomas. Nomes de golpes, falas e novidades ainda estão em português.',
      'Removida a opção de movimento "relativo ao inimigo": o movimento é sempre pelas direções da tela.',
      'Arthur ganhou pose de vitória própria, com a sniper apoiada no ombro.',
      'Correção: uma luta espelho (por exemplo Kaiser × Kaiser) travava na apresentação.',
    ],
  },
  {
    v: '3.10.1',
    date: '2026-10-08',
    title: 'Olhos sempre abertos',
    items: [
      'A fita da espada do Arnaldo e do Veríssimo agora fica VERMELHA de verdade — pendurada parada ela aparecia preta.',
      'Senhor Veríssimo com nomes da série e do RPG no lugar dos genéricos: Olhos Sempre Abertos! (trás + ○, a frase dele ao bloquear o golpe do Gal e salvar o Arthur — bloqueia e contra-ataca), Em Seu Caminho (a investida, da fala "nós estaremos em seu caminho"), Brecha na Guarda e o especial Oficial Comandante (poderes da trilha Comandante de Campo), Escopeta de Varredura, o Despertar Líder da Ordo Realitas e golpes como Corte de Varredura e Pela Ordo Realitas. Só os nomes mudaram.',
    ],
  },
  {
    v: '3.10.0',
    date: '2026-10-08',
    title: 'Os Aniquiladores',
    items: [
      'Novo lutador: ARNALDO FRITZ (Ordo Realitas, Energia) — o ator dos Aniquiladores. Esgrima teatral com a espada da fita vermelha, o Emissor de Pulsos Paranormais que puxa o adversário até a ponta da espada (ou o joga longe), Finta Teatral que quebra a defesa, Rodopio da Fita, Aniquilador, Ensaio Geral e o especial Ato Final.',
      'Transformação do Arnaldo: ele abre o relógio de bolso, a Relíquia de Energia está lá dentro, e ele vira O ANFITRIÃO até o fim do round — kit todo novo: Disparo do Caos que sorteia uma de 8 cores, Regra do Caos (vale para os dois), cópias que explodem, Distorção, Tempo Distorcido, o Jogo do Orfanato, o Botão do Anfitrião (os dois correm até o botão no meio da arena), □ + direção com a Chicotada do Caos, a Tradição de Família e A Plateia, e o especial O Jogo do Anfitrião, um programa de auditório com roleta. Percepção Anacrônica: de tempos em tempos ele desvia sozinho de um golpe.',
      'Novo lutador: SENHOR VERÍSSIMO (Ordo Realitas, Medo) — o líder da Ordem, com a espada do Arnaldo e uma escopeta curta. Inteligência Estratégica (cada golpe que acerta ganha um corte extra), Análise Tática, Investida dos Aniquiladores, Jaqueta de Veríssimo, Guarda do Comandante (trás + ○: bloqueia e contra-ataca), Bloqueio Perfeito mais fácil e o especial Ordem de Ataque. Segredo de Veríssimo: o primeiro golpe fatal da partida o deixa com 1 de vida.',
      'Os três têm modelos próprios, poses de vitória, introduções e falas com o elenco todo, agarrão próprio e a CPU usa o kit inteiro.',
      'Gal: a cura que cobra sanidade não é mais passiva — agora é ATIVAR ERESHKIGAL (trás + □): por 6 s, cada golpe físico faz o inimigo recuperar parte da vida e pagar com sanidade, que vai para o Gal.',
      'Balu: com o Machado Demônio ativo, o Machado em Giro arremessa a maça de sangue que está na mão (antes saía o machado comum).',
      'Elementos: a vantagem do ciclo nos rituais passou de 10% para 15% (e a desvantagem de −10% para −15%). Xande agora é de Conhecimento.',
      'Falas durante a luta: curtas, sem pausar o combate — com a vida no fim, nos especiais e nas transformações.',
      'Defesa: segurando Defesa + direção, os passos rápidos emendam um no outro e voltam à guarda ao soltar. Escapar do agarrão vale nas duas ordens (Defesa + ○ ou ○ + Defesa).',
      'Correções: a tela não fica mais preta na vitória com O Anfitrião; a fita da espada do Arnaldo e do Veríssimo voltou a ficar vermelha.',
    ],
  },
  {
    v: '3.9.4',
    date: '2026-10-06',
    title: 'Balu tanque',
    items: [
      'Balu, Resistência à Dor (transformação): agora vira um TANQUE — recebe 45% menos dano, quase não é empurrado, aguenta golpes sem recuar (guarda até 2, um novo a cada 1,5 s), recupera 25% da vida ao transformar e bate 20% mais forte; em troca anda um pouco mais devagar.',
    ],
  },
  {
    v: '3.9.3',
    date: '2026-10-06',
    title: 'Balu novo',
    items: [
      'Balu com modelo novo, seguindo as referências: cabelo preto volumoso penteado para trás com gel, bigode grosso e cavanhaque só no meio do queixo, ombros e braços bem mais fortes, polo verde-clara de gola aberta e jeans até o cinto.',
      'Machado do Balu refeito: lâmina grande em barba com o fio de aço claro, miolo escuro com furos e gravações, ponta-lança no alto, gancho atrás e o cabo de madeira com faixas de pano enroladas.',
    ],
  },
  {
    v: '3.9.2',
    date: '2026-10-06',
    title: 'Seleção online no celular',
    items: [
      'Online no celular: dá para escolher o lutador TOCANDO nele (antes o toque não fazia nada na partida online). O 1º toque olha, o 2º confirma.',
      'Online: os dois jogadores escolhem AO MESMO TEMPO, cada um na própria grade (marcada com "VOCÊ"), e confirmam — ninguém precisa esperar o outro. Depois, qualquer um toca em COMEÇAR.',
      'Online no celular: as configurações da batalha, a escolha do cenário, a pausa e a tela de vitória também aceitam toque.',
    ],
  },
  {
    v: '3.9.1',
    date: '2026-10-06',
    title: 'Celular',
    items: [
      'Celular: as opções do menu respondem ao PRIMEIRO toque (antes, no submenu, às vezes era preciso tocar duas vezes).',
      'Celular: a HUD da luta volta a mostrar as habilidades, numa faixa compacta com o comando de cada uma, a recarga e o contorno de pronta.',
      'Celular: os comandos na HUD e nas dicas aparecem com os botões da tela (△ □ ○ × DEF ESQ) em vez das teclas do teclado.',
      'HUD: quem paga rituais com vida (Arthur, Erin Em Nome do Caos) não aparece mais com as habilidades bloqueadas por "sem sanidade".',
    ],
  },
  {
    v: '3.9.0',
    date: '2026-10-06',
    title: 'Tela inicial nova',
    items: [
      'Tela inicial nova: os lutadores em 3D contra a luz (contorno na cor do poder de cada um) sobre o círculo ritual brilhando, cinzas subindo, neblina e a câmera se aproximando devagar; logo redesenhado ("ARENA" sobre "PARANORMAL" metálico com brilho e glitch, a linha dos cinco elementos), vinheta e granulado de filme. Com o menu aberto, o logo vai para o canto e o menu vira uma coluna à esquerda.',
      'Corrigido: depois de uma partida, os personagens podiam ficar invisíveis na seleção (só a arma aparecia).',
      'Corrigido: a Erin (e o Labirinto/Aguiar) voltava mascarada no round seguinte depois de transformar.',
      'Erin, Em Nome do Caos: o especial agora também começa com a granada de luz — dá para sair de baixo, esquivar ou defender. Se cegar: ela corre até o adversário, dá o tiro de escopeta e se explode. Se errar, ela fica exposta e não se explode.',
      'Labirinto (???): a Tempestade Caótica do □ virou um RAIO CONTÍNUO que sai da Antena por uns 2 segundos e persegue o adversário (correndo de lado ou com dash dá para escapar; a defesa segura). Sem o capacete continua sendo a bola de energia.',
    ],
  },
  {
    v: '3.8.2',
    date: '2026-10-06',
    title: 'Supernova com granada de luz',
    items: [
      'Erin: o especial Supernova agora precisa ser PEGO. Ela arremessa primeiro uma granada de luz (no ar, sem parar o tempo) no lugar onde o adversário está. Dá para escapar: sair de baixo, esquivar na hora ou defender de frente para ela (cobre os olhos). Se errar, ela fica parada e aberta. Se o clarão cegar o adversário, aí sim vem a cutscene: ela corre até ele, dá o tiro de escopeta à queima-roupa e o explode com a granada do coração vermelho.',
    ],
  },
  {
    v: '3.8.1',
    date: '2026-10-06',
    title: 'A máscara de gás da Erin',
    items: [
      'Erin: a transformação Em Nome do Caos agora tem cena própria — ela ajoelha rindo descontrolada com a mão agarrando o rosto, levanta e VESTE a máscara de gás, que acende em verde (sem o vermelho dos Mascarados: ela não é uma deles). A máscara fica no rosto o round inteiro.',
      'Máscara de gás da Erin remodelada como nas referências: borracha preta dos olhos ao queixo, duas lentes redondas com aro brilhando em verde, filtro na frente da boca, cartucho grande na bochecha e tubos verdes brilhantes descendo até o peito.',
    ],
  },
  {
    v: '3.8.0',
    date: '2026-10-06',
    title: 'Máscaras como nas referências',
    items: [
      'Transformações dos Mascarados refeitas seguindo as animações de referência: o Labirinto segura o capacete sorridente no peito, ergue acima da cabeça e encaixa; o Aguiar agacha com o machado esticado e leva a máscara ao rosto; a Kemi solta as faixas dos braços, que chicoteiam num rastro vermelho, e abre o braço como a Fantasma. Quando a máscara encaixa a cena fica vermelha e o assassino fica com uma aura vermelha até o fim do round.',
      'Juan: a Armadura de Sangue Diabólica agora explode do ombro em espinhos de sangue antes de endurecer. Transformado, o nome dele é PORTADOR DO TRONO.',
      'Erin, Em Nome do Caos: SEM SANIDADE — a barra fica zerada e travada e tudo que gastaria sanidade (granadas, Bênção Maldita, dash longo) sai da VIDA; os golpes ficaram ainda mais fortes. O especial ganhou uma cutscene: se ela alcança o adversário, o tempo para, close na máscara de gás (ela ri), nas três granadas sem pino, nos dois — e a explosão vista de longe.',
    ],
  },
  {
    v: '3.7.1',
    date: '2026-10-06',
    title: 'Nomes dos assassinos',
    items: [
      'Mascarados: ao pôr a máscara na Transformação, o nome na tela muda para o do assassino — A FANTASMA (Kemi), ??? (Labirinto) e MUTILADOR NOTURNO (Aguiar).',
    ],
  },
  {
    v: '3.7.0',
    date: '2026-10-06',
    title: 'Especiais com aviso + máscaras na Transformação',
    items: [
      'Mascarados: a máscara agora é só da TRANSFORMAÇÃO (como no cânone, é ela que desperta a Intenção de Assassino) — e ficou bem mais forte, trocando o kit inteiro até o fim do round.',
      'Labirinto: o Capacete do ??? saiu do kit normal. Sem o capacete: Rajada Caótica, Labirinto Mental, Mapa Sanguíneo e Capturar Momento (e o especial não põe mais o capacete). Na Transformação vira o ???: Tempestade Caótica no □, Labirinto Abissal, Consumir Momento, Tempestade Caótica em área, Revelação Sanguínea, golpes 25% mais fortes e especial mais forte.',
      'Aguiar: a Máscara do Mutilador Noturno saiu do kit normal (no lugar: Ataque Especial, um golpe pesado de machado; o especial virou Caçada no Acampamento). Na Transformação vira o MUTILADOR NOTURNO: todo golpe do machado sangra, Ataque Mutilador, Predador Perfeito, resiste aos golpes e o especial Finalização do Mutilador fica mais forte.',
      'Erin: nova Transformação EM NOME DO CAOS — põe a máscara de gás e enlouquece: cortes mais rápidos e explosivos, granadas mais fortes, sem cura. Especial Em Nome do Caos: puxa os pinos de três granadas, corre até o adversário e se explode (450 de dano; esquiva desvia, defesa segura metade). Ela morre na explosão: se o adversário também cair, a Erin ganha o round; se ele sobreviver, ela perde.',
      'Especiais que acertam de longe agora têm AVISO: Descarnar (Aghata), O Labirinto é a Resposta, Contrato de Morte e Disparo Espiral (Kemi / Fantasma), Supernova (Erin), Shi no Kage (Joui) e Cinerária com a Acácia (Kaiser). Depois do preparo, quem usa faz o gesto — a Aghata ergue o braço, a Kemi ajoelha e mira — e um sigilo pulsa no chão do alvo (ou a mira brilha nele). Esquive ou use a Substituição no fim do aviso para desviar (quem usou fica exposto), ou defenda de frente. O Descarnar continua acertando de qualquer distância.',
      'Acertar quem está no aviso interrompe o especial, como no preparo. A CPU também reage ao aviso (mais nas dificuldades altas).',
      'Esquiva: ao gastar TODAS as cargas, por 3 s o dano recebido não conta para recarregar (a barra fica vermelha).',
    ],
  },
  {
    v: '3.6.0',
    date: '2026-10-06',
    title: 'Defesa estilo Storm + escapes',
    items: [
      'Esquiva: as cargas voltam mais rápido conforme você apanha — 1 carga a cada 70 de dano (antes 120).',
      'Habilidades △ → ○ e △ → □: o segundo botão precisa vir logo depois do △ (até 0,4 s). Antes, dava para apertar △, andar alguns segundos e soltar a habilidade com ○ sem querer.',
      'Defesa + direção (como no Storm 4): segurando R2/RT, o analógico não faz mais andar — o personagem emenda passos rápidos para os lados e para trás, sempre de frente para o rival.',
      'Substituição: também funciona atordoado e agora interrompe o combo do adversário (ele bate no “tronco” e fica exposto), então dá mesmo para escapar no meio da sequência.',
    ],
  },
  {
    v: '3.5.1',
    date: '2026-10-05',
    title: 'Substituição corrigida',
    items: [
      'Substituição: ao usar L2 enquanto apanha, o lutador desvia do golpe com um passo curto para o lado (para onde o direcional aponta) e reaparece perto de onde estava — não teleporta mais para as costas do adversário. Também corrige a substituição, que não estava funcionando.',
    ],
  },
  {
    v: '3.5.0',
    date: '2026-10-04',
    title: 'Substituição aprimorada + Online pronto',
    items: [
      'Substituição: ao usar L2 enquanto apanha, reaparece atrás do adversário em um ponto livre da arena, interrompe o combo e ganha invulnerabilidade breve.',
      'Modo online pronto: crie ou entre em salas públicas e privadas por código e jogue partidas sincronizadas pela internet.',
    ],
  },
  {
    v: '3.4.1',
    date: '2026-10-04',
    title: 'Substituição no lugar',
    items: [
      'Substituição: ao usar L2 enquanto apanha, o lutador cancela o golpe e reaparece no mesmo lugar, sem teleportar para trás do atacante.',
    ],
  },
  {
    v: '3.4.0',
    date: '2026-10-04',
    title: 'Super Difícil de verdade',
    items: [
      'Tela de vitória: quem venceu transformado aparece SÓ na forma (Diabo, Deus da Morte ou Fantasma) — antes, na batalha em equipe, o Juan/Ferreiro/Kemi aparecia junto com a forma.',
      'Deus da Morte: novo especial ENVELHECIMENTO (no lugar do Heilag Vagga) — agarra o adversário pelo pescoço, ergue e o envelhece: cabelo branco, pele acinzentada, corpo curvado, e fica fraco até o fim do round (40% menos dano, 30% mais lento, sem recuperar sanidade). O preparo é visível (dá para esquivar), só pega de perto, uma vez por round e com recarga longa.',
      'Super Difícil bem mais difícil: defende e acerta o Perfect Block muito mais, escapa de combos com a Substituição, pune na hora quem erra um golpe perto, desvia dos tiros para o lado, faz combos mais longos — e, como um chefe, bate 15% mais forte e recebe 15% menos dano.',
    ],
  },
  {
    v: '3.3.0',
    date: '2026-10-04',
    title: 'CPU que aprende',
    items: [
      'Novo nível de CPU: SUPER DIFÍCIL. Reage mais rápido, não erra de propósito, pune quem erra um golpe, atiradores mantêm distância — e APRENDE: a cada luta ela vê quais ações deram certo em cada situação (perto, longe, você atacando, você defendendo...) e passa a usá-las mais. Também aprende o SEU jeito de jogar: se você ataca muito de perto, ela defende mais; se defende muito, ela agarra.',
      'O que a CPU aprende fica salvo no seu navegador e, a cada versão, um pouco do que ela aprendeu vem junto com o jogo — a IA vai ficando mais esperta a cada atualização.',
      'Esquiva: a carga só é gasta quando a esquiva desvia de algo (golpe, ritual, tiro). Esquivar no vazio, só para se mexer, não gasta mais.',
    ],
  },
  {
    v: '3.2.1',
    date: '2026-10-04',
    title: 'Cinzas da Decadenza',
    items: [
      'Decadenza do Dante refeita: como no cânone, ele ASSOPRA a fumaça preta com cinzas — agora é de médio alcance (8 m, antes 20), a nuvem anda mais devagar e abre conforme avança (fica mais difícil de desviar de perto, some antes de chegar longe). Dano e decadência contínua iguais.',
      'A CPU não gasta mais ataques à distância fora do alcance deles.',
    ],
  },
  {
    v: '3.2.0',
    date: '2026-10-04',
    title: 'Cada um agarra do seu jeito',
    items: [
      'Cada personagem tem o seu próprio agarrão, fechando com um golpe dos seus poderes: Acácia explodindo (Kaiser), a garra da Arma de Sangue (Arthur), poça de sombra e corte em X (Joui), Descarnar (Aghata e Xande), Tentáculos de Lodo que deixam lento (Dante), bomba (Erin), sigilo e correntes que roubam sanidade (Gal), a escrita do Inexistir (Kian), machado na nuca (Aguiar), raios caóticos (Labirinto), martelo/machado enterrando no chão (Lírio e Balu), a Espada Consumidora (Ferreiro), faca no pescoço que cura (Juan), tiro à queima-roupa (Kemi) — e também Diabo, Fantasma e Deus da Morte.',
      'O dano total do agarrão continua 70; os efeitos extras são pequenos (sangramento curto, um pouco de sanidade, lentidão curta).',
    ],
  },
  {
    v: '3.1.0',
    date: '2026-10-04',
    title: 'Agarrão de cinema',
    items: [
      'Agarrão (Defesa + ○) virou cena: depois do instante de escape, a câmera chega perto e gira em volta dos dois, quem agarrou dá dois golpes do seu próprio jeito (faca, machado, socos, espada...) e arremessa. O dano total continua o mesmo, e o escape (Defesa + ○ logo no começo) funciona igual.',
    ],
  },
  {
    v: '3.0.0',
    date: '2026-10-04',
    title: 'Todos despertam',
    items: [
      'Todos os personagens agora têm a Barra de Transformação. Quem não tem uma forma própria DESPERTA (cena curta, cura 10% e fica assim até o fim do round), cada um com um estado do cânone:',
      'Kaiser — Combate Perfeito (mais dano e velocidade, recargas mais rápidas) · Arthur — Magnum Opus (Arma de Sangue no ombro que ele perdeu, mais dano, aguenta mais) · Joui — Técnica Secreta (mais rápido e forte) · Aghata — Passagem de Conhecimento Expandido (rituais voltam e recarregam muito mais rápido) · Dante — Afinidade com o Outro Lado (rituais de Morte mais fortes, regenera vida).',
      'Erin — Bênção Maldita (regenera vida, mais sanidade) · Gal — Afinidade com Precognição (recebe menos dano, mais rápido) · Kian — Invólucro do Conhecimento (golpes físicos atravessam a defesa) · Aguiar — Predador Perfeito (todo golpe do machado sangra) · Labirinto — Consumir Momento (recargas bem mais rápidas).',
      'Xande — Gladiador Paranormal (físico mais forte, aguenta 1 golpe sem reagir a cada 4 s) · Lírio — Sangue de Ferro (recebe 25% menos dano, aguenta golpes) · Balu — Resistência à Dor (com raiva: recebe menos dano e bate mais forte).',
      'Juan, Kemi e Ferreiro continuam se transformando no Diabo, na Fantasma e no Deus da Morte.',
    ],
  },
  {
    v: '2.7.0',
    date: '2026-10-04',
    title: 'Barra de Transformação',
    items: [
      'Nova Barra de Transformação (Juan, Kemi e Ferreiro): enche conforme você apanha. Com ela cheia e a vida baixa (35% ou menos), segure Y/△ até a sanidade encher e passar do limite — o personagem se transforma (Diabo, Fantasma ou Deus da Morte). A barra zera a cada round.',
      'As transformações saíram do especial, e o Transcender (vida baixa + segurar Y/△) saiu do jogo para todos.',
      'Especiais novos para quem transformava: Hemorragia Severa (Juan — cinco cortes de faca, o último deixa uma hemorragia forte), Contrato de Morte (Kemi — o tempo desacelera e a bala vai reta até o alvo, girando a espiral de Morte) e Consumir (Ferreiro — quatro cortes enormes da Espada Consumidora).',
      'Pacto do Santo: virou a transformação do Ferreiro — ele se ergue como Deus da Morte na hora, sem precisar morrer durante o pacto.',
      'Kian: a Transcendência deu lugar à Levitação (ritual do cânone) — ergue a mão, pedras do chão flutuam em volta dele e voam uma a uma contra o alvo. Como o Transcender saiu, o Inexistir passa a valer duas vezes por partida (antes era uma, +1 depois de transcender).',
      'Diabo: asas de braços refeitas pela arte do trono (leque de braços com mãos abertas) e a boca vertical em relevo do peito ao umbigo.',
    ],
  },
  {
    v: '2.6.0',
    date: '2026-10-03',
    title: 'Múmia, rastros e vitória de cinema',
    items: [
      'Faixas da Fantasma: agora cobrem o alvo dos pés ao rosto como uma múmia e o prendem por até 2,2 s — apertando os botões sem parar, dá para se soltar antes. (Adaptação: a wiki só diz que as faixas melhoram as habilidades dela e puxam o rifle.)',
      'Teletransportes deixam rastro no lugar de onde saíram: sigilos dourados no Kian e a fumaça preta das faixas na Fantasma (os outros já tinham sombra, faíscas e poça de sangue).',
      'Tela de vitória com câmera de cinema: aproxima dos vencedores e balança de leve, com os nomes acompanhando.',
    ],
  },
  {
    v: '2.5.0',
    date: '2026-10-03',
    title: 'Rituais com cara própria',
    items: [
      'As curas agora são diferentes entre si: o Black Hole da Erin (cinzas pretas que fecham a ferida em espiral) é a mais forte e rápida, como no cânone; o Paradiso do Dante cura 25% mais parado; a Cicatrização do Xande fecha com fios de sangue; o Conforto de Santo Berço do Ferreiro cura muito, devagar — mas a ilusão se quebra se ele apanhar.',
      'Hipnose Espiral do Ferreiro refeita: o Lodo desenha uma espiral no chão e o alvo anda em círculos até o centro, perto do Ferreiro, sem conseguir defender; lá fica parado, hipnotizado.',
      'Tempestade Caótica do Labirinto refeita: um círculo marca a área do alvo e raios caóticos caem nela por 2 s — dá para sair de baixo.',
      'As Facas Amaldiçoadas da Aghata voltam para a mão: a que errou na ida ainda pode acertar na volta.',
      'Disparo Espiral da Fantasma (especial) agora é cinematográfico: a bala dá a volta na arena desenhando a espiral de Morte e a câmera vai atrás dela até atravessar o alvo.',
    ],
  },
  {
    v: '2.4.0',
    date: '2026-10-03',
    title: 'Chegou o Balu',
    items: [
      'NOVO LUTADOR: BALU (Antônio Pontevedra), o ex-agente veterano da Ordo Realitas — o "tanque" da Equipe Abutres. Camisa polo de flores amarelas, bigode, cabelo com gel e o Machado Lancinante com o pomo de pantera.',
      'Balu é pesado (1300 de vida, um pouco mais rápido que a Lírio): machadadas com as duas mãos que derrubam e aguentam um golpe pequeno, e uma machadada a mais em quem está caído (Derrubar e Atacar).',
      'Machado em Giro (□): arremessa o machado girando e ele volta para a mão — enquanto voa, a mão fica vazia.',
      'Machado Demônio (△ + ○): crava o pomo de pantera no próprio peito, paga 60 de VIDA, e o machado vira uma maça-estrela de sangue por 10 s (mais força, alcance e sangramento). Também tem Amaldiçoar Arma com Sangue, Fala Imponente (provoca o adversário), 110% e o Colete Físico-Balístico.',
      'Especial do Balu: Pancada do Urso — a maça de sangue nasce na mão e ele desce três machadadas no adversário.',
      'Falas próprias com todo o elenco (as da Equipe Abutres, do Kian que quebrou o machado e do Diabo que o amaldiçoou), pose de vitória e assistência na batalha em equipe.',
      'A seleção de personagens ganhou a página 2 (LB/RB trocam de página).',
    ],
  },
  {
    v: '2.3.2',
    date: '2026-10-03',
    title: 'Equilíbrio: rápidos e pesados',
    items: [
      'Equilíbrio geral: os personagens leves e médios ficaram mais ágeis nos combos (golpes mais rápidos) e um pouco mais velozes — Joui, Aghata, Erin, Xande, Kian, Labirinto, Dante, Kaiser e Gal.',
      'Os pesados continuam lentos, mas aguentam mais para segurar os rápidos: Lírio com 1350 de vida, Ferreiro com 1250 e Aguiar com 1150.',
      'Juan (Henri) estava ganhando demais: anda e corta mais devagar, a Faca Predadora cura 10% (era 15%), sangra menos, demora mais para chegar ao Renascimento, o Vínculo de Sangue replica 30% (era 40%) e a armadura que nasce sozinha agora pede 400 de dano, dura menos e gasta a recarga da habilidade.',
      'Gal ganhou o ritual Velocidade Mortal (o do Leque da Fatalidade, R2 + △): fica muito mais rápido e recupera todas as esquivas. E a sanidade que os cortes dele tiram do adversário agora vai para ele.',
    ],
  },
  {
    v: '2.3.1',
    date: '2026-10-03',
    title: 'Interface e carregamento',
    items: [
      'Na luta pelo PC em janela pequena, os nomes longos das habilidades não estouram mais as caixas: ficam em até duas linhas (com reticências) e o nome inteiro aparece ao passar o mouse.',
      'O jogo abre mais rápido nas próximas visitas: a parte gráfica (three.js) e os dados dos personagens ficam em arquivos separados, e o navegador guarda a parte gráfica entre uma atualização e outra.',
    ],
  },
  {
    v: '2.3.0',
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
    v: '2.2.0',
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
    v: '2.1.0',
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
    v: '2.0.0',
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
    v: '1.6.0',
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
    v: '1.5.0',
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
    v: '1.4.0',
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
    v: '1.3.0',
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
    v: '1.2.1',
    date: '2026-10-02',
    title: 'Menus mais fáceis de usar',
    items: [
      'O comando de voltar agora funciona de forma consistente em todas as telas.',
      'Na seleção de lutadores, voltar desfaz a escolha em vez de iniciar a partida.',
      'Ajustes na tela do tutorial durante a pausa.',
    ],
  },
  {
    v: '1.2.0',
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
    v: '1.1.2',
    date: '2026-10-02',
    title: 'Correção ao abrir o jogo',
    items: [
      'Corrigido um problema que impedia o jogo de carregar corretamente.',
    ],
  },
  {
    v: '1.1.1',
    date: '2026-10-02',
    title: 'Controles revisados',
    items: [
      'Os comandos de defesa, esquiva e assistência ficaram mais simples.',
      'Habilidades agora usam combinações de botões mais fáceis de lembrar.',
    ],
  },
  {
    v: '1.1.0',
    date: '2026-10-02',
    title: 'Novos comandos de habilidade',
    items: [
      '△ + ○ e △ + □ agora ativam habilidades especiais.',
      'Os golpes foram simplificados para evitar comandos repetidos para a mesma habilidade.',
    ],
  },
  {
    v: '1.0.0',
    date: '2026-10-02',
    title: 'Novo cenário e arenas renovadas',
    items: [
      'NOVO cenário: Santo Berço, a praça dos Luzidios diante do Labirinto Infinito.',
      'As arenas Ruínas, Orfanato, Bar e Coliseu ganharam uma aparência renovada.',
      'Efeitos visuais de algumas armas foram aprimorados.',
    ],
  },
  {
    v: '0.8.1',
    date: '2026-10-02',
    title: 'Combate mais equilibrado',
    items: [
      'Ajustes de equilíbrio para Kemi, Juan e Ferreiro.',
      'Novas falas de entrada e vitória para esses personagens.',
      'Melhorias visuais no Ferreiro.',
    ],
  },
  {
    v: '0.8.0',
    date: '2026-10-02',
    title: 'Aparência dos personagens renovada',
    items: [
      'Kemi, Fantasma, Juan, Diabo, Aguiar e Labirinto receberam melhorias visuais.',
    ],
  },
  {
    v: '0.7.0',
    date: '2026-10-02',
    title: 'Três novos lutadores',
    items: [
      'Conheça três novos lutadores: Ferreiro, Juan e Kemi.',
      'A seleção de personagens ficou mais fácil de navegar, e os golpes da Lírio foram aprimorados.',
    ],
  },
  {
    v: '0.6.0',
    date: '2026-10-02',
    title: 'Celular e cenários',
    items: [
      'Controles de toque aprimorados e uma nova tela para escolher o cenário.',
    ],
  },
  {
    v: '0.5.0',
    date: '2026-10-01',
    title: 'Lírio',
    items: [
      'Lírio Tellini chegou ao elenco com sua arma Leonora e novos golpes.',
    ],
  },
  {
    v: '0.4.0',
    date: '2026-10-01',
    title: 'Primeira publicação',
    items: [
      'A primeira versão de Arena Paranormal ficou disponível para jogar.',
    ],
  },
  {
    v: '0.3.0',
    date: '2026-10-01',
    title: 'Labirinto e Xande',
    items: [
      'Labirinto e Xande chegaram ao elenco.',
    ],
  },
  {
    v: '0.2.0',
    date: '2026-10-01',
    title: 'Batalha em equipe',
    items: [
      'Chegou o modo de batalha em equipe, com troca de personagem e novas habilidades para Kian e Erin.',
    ],
  },
  {
    v: '0.1.0',
    date: '2026-10-01',
    title: 'Arena Paranormal',
    items: [
      'Comece sua aventura em uma arena de luta 3D com nove personagens jogáveis.',
    ],
  },
];
