// Falas originais inspiradas na personalidade e nas relações do cânone; não são citações da obra.
// Chave: ids em ordem alfabética unidos por '+'. Valor: { [id]: fala }.
export const PAIR_LINES = {
  'kaiser+kian': {
    kian: 'Você já desapareceu uma vez. Não confunda voltar com vencer.',
    kaiser: 'Dessa vez eu não vou sumir. Nem por você, nem por ninguém.',
  },
  'kian+joui': {
    kian: 'Você ainda não entendeu a magnitude do meu plano, garoto.',
    joui: 'Eu entendi o suficiente: você já perdeu.',
  },
  'kian+gal_sal': {
    gal_sal: 'Você me traiu, Kian. Eu vou te matar!',
    kian: 'Você foi útil, Gal. Só isso.',
  },
  'gal_sal+joui': {
    joui: 'Você tirou de mim quem me criou. Hoje eu cobro.',
    gal_sal: 'Injustiça, né? Muito prazer.',
  },
  'arthur+joui': {
    arthur: 'Se eu tiver que lutar com você, irmão, que seja de verdade.',
    joui: 'Arthur-san... não vou pegar leve.',
  },
  'arthur+kaiser': {
    arthur: 'Sem fugir da conversa dessa vez, Kaiser. A luta vem depois.',
    kaiser: 'Tá bom, pai. Mas se eu ganhar, você paga o lanche.',
  },
  'arthur+aghata': {
    arthur: 'Vou tomar cuidado com você, pequena.',
    aghata: 'Pequena é o seu braço que sobrou, Arthur.',
  },
  'arthur+kian': {
    arthur: 'Eu já furei sua testa uma vez. Faço de novo.',
    kian: 'E eu continuei vivo. Imortal, lembra?',
  },
  'arthur+gal_sal': {
    gal_sal: 'Ainda olha por cima do ombro, Arthur?',
    arthur: 'Aprendi a não dar as costas pra você, Gal.',
  },
  'kian+aghata': {
    kian: 'Um grimório que eu nunca vi... curioso.',
    aghata: 'Você sabe tudo, né? Então já sabe que vai sangrar.',
  },
};

// Dante (cânone): amigo de infância do Leo — o receptáculo de Kian; cresceu com o Gal no orfanato (Gaspar);
// parceiro da Agatha nas pesquisas; Força D com Arthur, Joui e Kaiser (que o chamava de "Padre").
Object.assign(PAIR_LINES, {
  'dante+kian': {
    dante: 'Você usou o Leo. Usou a minha infância inteira.',
    kian: 'E você fez exatamente o que eu previ, Gaspar.',
  },
  'dante+gal_sal': {
    gal_sal: 'Gaspar... ainda tenta salvar todo mundo?',
    dante: 'Só quem ainda pode escolher, Gal.',
  },
  'dante+aghata': {
    aghata: 'Treino? Então não reclama se eu sujar teu xale.',
    dante: 'Mostra o que aprendeu com aquele grimório.',
  },
  'arthur+dante': {
    arthur: 'Vai com calma nesses rituais aí, rabiscado.',
    dante: 'Calma eu tenho. Quem não tem é o lodo.',
  },
  'dante+joui': {
    joui: 'Dante, sem meias palavras dessa vez?',
    dante: 'Joui, eu nunca prometi isso.',
  },
  'kaiser+dante': {
    kaiser: 'Bora, Padre. Sem sermão.',
    dante: 'O sermão vem depois, Kaiser.',
  },
});

// Erin (cânone): Equipe Brasa / Força D; apaixonada pelo Joui (a granada Sakura foi presente para ele);
// deu a Nebulosa ao Kaiser; morta pelo Gal com a Ereshkigal — e se explodiu levando ele junto.
// Aguiar (cânone): o Mutilador Noturno; em Hexatombe a Agatha fez o ritual de troca de corpos dos Mascarados.
Object.assign(PAIR_LINES, {
  'erin+joui': {
    erin: 'Joui! Fiz uma granada nova pra você... quer ver de perto?',
    joui: 'Erin... vai ficar tudo bem. Mas não joga isso em mim.',
  },
  'erin+gal_sal': {
    gal_sal: 'Eu lembro do seu cheiro de pólvora. E do seu sangue na Ereshkigal.',
    erin: 'Só o Caos não tem fim. E dessa vez eu levo você inteiro comigo.',
  },
  'kaiser+erin': {
    kaiser: 'Ainda tenho a Nebulosa que você me deu.',
    erin: 'Usa direito dessa vez, Kaiser. Ela é linda quando explode.',
  },
  'arthur+erin': {
    arthur: 'Cuidado com essas granadas aí, guria.',
    erin: 'Relaxa, Arthur. Eu sei exatamente onde cada uma vai cair.',
  },
  'dante+erin': {
    erin: 'Ainda não confio em você, Dante.',
    dante: 'Justo. Eu também não confiaria em mim.',
  },
  'kian+erin': {
    kian: 'Uma engenheira com fósforos. Previsível.',
    erin: 'Previsível? Então prevê isso aqui: Kaboom.',
  },
  'erin+aghata': {
    aghata: 'Esse amuleto elétrico saiu da minha loja, sabia?',
    erin: 'E funciona que é uma beleza. Quer testar?',
  },
  'aguiar+aghata': {
    aguiar: 'Foi você que mexeu no meu corpo, bruxa.',
    aghata: 'Eu emprestei. Devolvo quando terminar.',
  },
  'aguiar+joui': {
    joui: 'Uma máscara não te torna maior, assassino.',
    aguiar: 'Ha ha ha... diz isso pra sua.',
  },
  'aguiar+erin': {
    aguiar: 'Jovens... sempre correndo pro lado errado.',
    erin: 'Eu não corro. Eu explodo.',
  },
  'aguiar+kaiser': {
    aguiar: 'Névoa não esconde cheiro, garoto.',
    kaiser: 'Então vem me farejar.',
  },
  'arthur+aguiar': {
    arthur: 'Meu rifle já viu coisa pior. Tenta chegar perto, Aguiar.',
    aguiar: 'Um braço só. Vai ser rápido.',
  },
  'aguiar+gal_sal': {
    gal_sal: 'Um assassino de acampamento. Que injustiça comigo.',
    aguiar: 'A próxima rodada sou eu.',
  },
  'aguiar+dante': {
    dante: 'Eu conheço gente como você. Cresci com um.',
    aguiar: 'Então sabe como isso termina.',
  },
  'aguiar+kian': {
    kian: 'Uma ferramenta sem mente. Útil.',
    aguiar: 'Ferramenta é o machado. Eu sou quem segura.',
  },
});

// Labirinto (cânone): reuniu os Assassinos; nos Mascarados é o corpo do Remi (líder); a Agatha fez o ritual.
// Xande (cânone): Os Cinco (Sinais do Outro Lado), skatista ocultista; também conhece Cinerária e Descarnar.
Object.assign(PAIR_LINES, {
  'aguiar+labirinto': {
    labirinto: 'Você chama de justiça o caminho que escolheu.',
    aguiar: 'E você chama de caminho qualquer coisa que leve a Tenebris.',
  },
  'labirinto+aghata': {
    aghata: 'Para de falar em caminhos e tenta me acompanhar.',
    labirinto: 'Você quer uma saída. Eu quero saber quem a construiu.',
  },
  'kian+labirinto': {
    kian: 'Você se esconde atrás de enigmas. Eu conheço esse truque.',
    labirinto: 'E ainda assim você não sabe o que vem depois.',
  },
  'labirinto+xande': {
    xande: 'Tá, eu não entendi o capacete. Mas vou passar por você.',
    labirinto: 'Todo caminho passa por aqui. O seu também.',
  },
  'kaiser+xande': {
    xande: 'Cinerária? Eu também sei fazer essa névoa aí.',
    kaiser: 'Então vamos ver de quem a névoa gosta mais.',
  },
  'aghata+xande': {
    aghata: 'Descarnar, é? Vamos ver quem corta mais fundo.',
    xande: 'Por eles... não vou perder pra uma ocultista qualquer.',
  },
  'erin+xande': {
    erin: 'Esse skate aguenta um teste de impacto?',
    xande: 'Aguenta. Só não prometo que você vai gostar do resultado.',
  },
  'aguiar+xande': {
    aguiar: 'Skatista... sempre fugindo dos cachorros.',
    xande: 'Cachorro eu temo. Você não.',
  },
});

// Lírio × Xande: amigos de longa data d'Os Cinco, vivem discordando, mas um se arrisca pelo outro
PAIR_LINES['lirio+xande'] = {
  lirio: 'Xande, sai da frente que hoje a Leonora tá com saudade!',
  xande: 'Lírio, tu vai mesmo bater em mim com essa coisa? Mano...',
};

export const SOLO_LINES = {
  kaiser: 'A névoa está do meu lado.',
  arthur: 'Eu sou um Gaudério. A gente morre por quem ama.',
  joui: 'Sombra da Morte. Shi no Kage.',
  aghata: 'As pessoas têm o que merecem.',
  gal_sal: 'Muito prazer, eu sou a injustiça.',
  kian: 'Kian sabe.',
  dante: 'É ironia do destino. Uma Divina Comédia.',
  erin: 'Só o Caos não tem fim. Eu sou o Caos.',
  aguiar: 'Ha ha ha... Jovens...',
  labirinto: 'O que espera no final do labirinto... é você.',
  xande: 'Por eles... Por eles... Por eles...',
  lirio: "Hoje 'cê vai conhecer a Leonora!",
  ferreiro: 'Eu não posso permitir que vocês destruam minha cidade.',
  juan: 'Eu não quero morrer... eu quero um novo começo.',
  kemi: 'Um contrato é um contrato. Nada pessoal.',
};

const INTRO_FALLBACKS = {
  kaiser: (other) => `Já perdi tempo demais esperando a névoa decidir. Vem, ${other}.`,
  arthur: (other) => `Fica atrás de mim se precisar. Mas não espera que eu pegue leve, ${other}.`,
  joui: (other) => `Não vou deixar você machucar mais ninguém, ${other}.`,
  aghata: (other) => `Vamos descobrir se você é tão interessante quanto parece, ${other}.`,
  dante: (other) => `Vamos resolver isso com calma, ${other}. Quer dizer, com a calma possível.`,
  erin: (other) => `Tenho uma ideia. Ela envolve você e uma explosão, ${other}!`,
  gal_sal: (other) => `Todo mundo chama de justiça quando a lâmina está do lado deles, ${other}.`,
  kian: (other) => `Você ainda acredita que pode mudar o resultado, ${other}?`,
  aguiar: (other) => `Acha que está do lado certo? Ha ha... vamos descobrir, ${other}.`,
  labirinto: (other) => `Não há saída para você aqui, ${other}.`,
  xande: (other) => `Por eles. Depois eu penso no resto, ${other}.`,
  lirio: (other) => `Aguenta firme, Leonora. ${other}, lá vou eu!`,
  ferreiro: (other) => `Não vou deixar você pôr Santo Berço em risco, ${other}.`,
  juan: (other) => `Não quero ser aquele homem outra vez. Mas não vou fugir, ${other}.`,
  kemi: (other) => `Não é pessoal, ${other}. Só trabalho.`,
};

const CHARACTER_NAMES = {
  kaiser: 'Kaiser',
  arthur: 'Arthur Cervero',
  joui: 'Joui Jouki',
  aghata: 'Aghata',
  dante: 'Dante',
  erin: 'Erin Parker',
  gal_sal: 'Gal Sal',
  kian: 'Kian',
  aguiar: 'Aguiar',
  labirinto: 'Labirinto',
  xande: 'Xande',
  lirio: 'Lírio',
  ferreiro: 'Ferreiro',
  juan: 'Juan',
  kemi: 'Kemi',
};

const BASE_CHARACTER = { deus_morte: 'ferreiro', diabo: 'juan', fantasma: 'kemi' };

// ---------------- FALAS DE VITÓRIA: [vencedor][derrotado] (ou .default)
export const VICTORY_LINES = {
  ferreiro: {
    default: 'Santo Berço continua de pé. Volte para a floresta, Ignaro.',
    lirio: 'Martelo forte... mas a Espada Consumidora come qualquer ferro.',
    kemi: 'Nem a Fantasma se esconde do Ferreiro dentro da cidade dele.',
  },
  juan: {
    default: 'Doeu? Que bom. Eu senti cada pedaço.',
    kemi: 'Nem a Fantasma escapa de quem já sentou no trono.',
    aguiar: 'Corta mais, Aguiar. Eu gosto.',
  },
  kemi: {
    default: 'Alvo neutralizado. Pagamento confirmado.',
    juan: 'Trono nenhum aguenta um tiro na cabeça.',
    labirinto: 'Labirinto ou não, a bala acha o caminho.',
  },
  lirio: {
    default: 'A parede ficou de pé. Graças a Deus... e à Leonora.',
    xande: 'Levanta, Xande. Depois a gente come uma pizza de tomate seco.',
    labirinto: 'Esquisito... mas a Leonora entende qualquer língua.',
    aguiar: 'Machado nenhum passa por essa parede.',
  },
  kaiser: {
    default: 'Eu já perdi gente demais pra perder pra você.',
    kian: 'Dessa vez quem sumiu foi você, Kian.',
    arthur: 'Você sempre levanta. Mas hoje fica no chão um pouco, Arthur.',
    gal_sal: 'A névoa vê tudo, Gal. Até quem não enxerga.',
    dante: 'Sem sermão, Padre. Só o resultado.',
  },
  arthur: {
    default: 'Eu sou um Gaudério. A gente não fica no chão.',
    kian: 'Furo tua testa quantas vezes precisar.',
    joui: 'Irmão... não some de novo, tá?',
    aghata: 'Tu tá ficando forte, pequena. Mas não hoje.',
    gal_sal: 'Dessa vez eu vi você chegando.',
    dante: 'Teu lodo não segura um Gaudério, rabiscado.',
  },
  joui: {
    default: 'Shi no Kage. A sombra corta antes de você ver.',
    kian: 'Eu disse. Você já tinha perdido.',
    gal_sal: 'Isso foi pela mulher que me criou.',
    arthur: 'Arthur-san... foi mal. Te pago um lanche.',
    dante: 'Três clones e nenhum me pegou.',
  },
  aghata: {
    default: 'As pessoas têm o que merecem.',
    arthur: 'Viu, Arthurzinho? Não precisa me proteger.',
    kian: 'Nem o Deus do Conhecimento conhecia esse grimório.',
    dante: 'Fala pra eles que eu sou a melhor ocultista da Ordem.',
    gal_sal: 'Sangra igual a todo mundo, né, Gal?',
  },
  gal_sal: {
    default: 'Injustiça, né? Muito prazer.',
    kian: 'Você me deixou pra morrer. Agora sente.',
    joui: 'Ainda acha que me supera, inseto?',
    dante: 'Gaspar... o orfanato sempre te alcança.',
    arthur: 'Da próxima vez, olhe para trás.',
  },
  kian: {
    default: 'Kian sabe. Kian sempre soube.',
    kaiser: 'Ninguém vai lembrar o seu nome. De novo.',
    joui: 'Infantil. Não entende a magnitude do meu plano.',
    gal_sal: 'Você foi útil, Gal. Só isso.',
    dante: 'Gaspar, você fez exatamente o que eu previ.',
    arthur: 'Eu ainda sou imortal.',
  },
  dante: {
    default: 'É ironia do destino. Uma Divina Comédia.',
    kian: 'Isso foi pelo Leo. E por todos que você usou.',
    gal_sal: 'O orfanato já queimou, Gal. Deixa ele em paz.',
    aghata: 'Bom trabalho com o grimório. Quase.',
    joui: 'Combinado: só três clones.',
    kaiser: 'O sermão vem agora, Kaiser.',
  },
  erin: {
    default: 'Supernova! Viu? Bomba perfeita.',
    joui: 'Vai ficar tudo bem, Joui. Eu prometo.',
    gal_sal: 'Dessa vez quem sobrou fui eu, Gal.',
    kaiser: 'Viu como explode bonito, Kaiser?',
    dante: 'Tá, talvez eu confie um pouquinho em você agora.',
    kian: 'Previu essa, Deus do Conhecimento?',
    aguiar: 'Corre agora, Mutilador. Corre.',
  },
  labirinto: {
    default: 'Perdido. O labirinto cresce.',
    aguiar: 'Você também é só um caminho, Aguiar.',
    kian: 'Nem o Deus do Conhecimento acha a saída.',
    xande: 'Sua música acabou, garoto.',
  },
  xande: {
    default: 'Eu já sabia. Por eles.',
    labirinto: 'Achei a saída, careca.',
    kaiser: 'Minha névoa é mais bonita, mano.',
    aguiar: 'Esse não me pegou.',
    lirio: 'Boa, Leonora. Agora ajuda o Lírio a levantar.',
  },
  aguiar: {
    default: 'A próxima rodada sou eu.',
    erin: 'Jovens... ha ha ha.',
    aghata: 'Devolve meu corpo inteiro da próxima vez.',
    joui: 'Sua máscara rachou primeiro.',
    arthur: 'Eu disse que ia ser rápido.',
    kaiser: 'Achei você pelo cheiro.',
  },
};

const VICTORY_FALLBACKS = {
  kaiser: 'A névoa não escolheu por mim. Desta vez, eu fiquei.',
  arthur: 'Acabou. Agora posso garantir que ninguém mais se machuque.',
  joui: 'Terminou. Eu devia ter encontrado outro jeito.',
  aghata: (other) => `Interessante. Eu estava certa sobre você, ${other}.`,
  dante: 'Fim da peça. O roteiro continua uma porcaria.',
  erin: 'Teste concluído! A explosão ficou ainda melhor do que eu esperava.',
  gal_sal: (other) => `Não chama isso de justiça. Eu sei a diferença, ${other}.`,
  kian: 'Mais um resultado previsto. Não confunda isso com escolha.',
  aguiar: (other) => `Ha ha... e você achou que era o caçador, ${other}.`,
  labirinto: 'A saída esteve ali o tempo todo. Você não a viu.',
  xande: 'Por eles. Sempre por eles.',
  lirio: 'A parede ficou de pé. Boa, Leonora.',
  ferreiro: 'Santo Berço fica em pé. É tudo que importa.',
  juan: 'Não foi redenção. Mas foi um começo.',
  kemi: 'Alvo abatido. Trabalho encerrado.',
};

export function victoryLine(winner, loser, loserName = CHARACTER_NAMES[loser] || loser) {
  winner = BASE_CHARACTER[winner] || winner;
  loser = BASE_CHARACTER[loser] || loser;
  const w = VICTORY_LINES[winner] || {};
  const fallback = VICTORY_FALLBACKS[winner];
  return w[loser] || (typeof fallback === 'function' ? fallback(loserName) : fallback) || w.default || '';
}

// Retorna [[id, fala], [id, fala]] na ordem dos lutadores.
export function introLines(idA, idB, nameA = CHARACTER_NAMES[idA], nameB = CHARACTER_NAMES[idB]) {
  const key = [idA, idB].sort().join('+');
  const pair = PAIR_LINES[key] || {};
  const fallbackA = INTRO_FALLBACKS[idA];
  const fallbackB = INTRO_FALLBACKS[idB];
  return [
    [idA, pair[idA] || (fallbackA ? fallbackA(nameB || idB) : SOLO_LINES[idA]) || ''],
    [idB, idA === idB ? '...' : pair[idB] || (fallbackB ? fallbackB(nameA || idA) : SOLO_LINES[idB]) || ''],
  ];
}
