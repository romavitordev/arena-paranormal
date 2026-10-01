// Falas antes do ROUND 1 (estilo Storm), baseadas nas relações do cânone (ver TODO.md §1.4).
// Chave: ids em ordem alfabética unidos por '+'. Valor: { [id]: fala }.
// Pares sem fala própria usam a fala genérica de cada personagem.
export const PAIR_LINES = {
  'cineraria+desconjurado': {
    desconjurado: 'Eu já apaguei você uma vez. Ninguém lembrou do seu nome.',
    cineraria: 'Hoje eu não sou Cesar, nem Kaiser. Hoje eu fico até o fim.',
  },
  'desconjurado+mascarado': {
    desconjurado: 'Você ainda não entendeu a magnitude do meu plano, garoto.',
    mascarado: 'Eu entendi o suficiente: você já perdeu.',
  },
  'desconjurado+injustica': {
    injustica: 'Você me traiu, Kian. Eu vou te matar!',
    desconjurado: 'Você foi útil, Gal. Só isso.',
  },
  'injustica+mascarado': {
    mascarado: 'Você tirou de mim quem me criou. Hoje eu cobro.',
    injustica: 'Injustiça, né? Muito prazer.',
  },
  'abutre+mascarado': {
    abutre: 'Se eu tiver que lutar com você, irmão, que seja de verdade.',
    mascarado: 'Arthur-san... não vou pegar leve.',
  },
  'abutre+cineraria': {
    abutre: 'Treino é treino, Kaiser. Sem chorar depois.',
    cineraria: 'Você sempre levanta. Vamos ver hoje.',
  },
  'abutre+vampira': {
    abutre: 'Vou tomar cuidado com você, pequena.',
    vampira: 'Pequena é o seu braço que sobrou, Arthur.',
  },
  'abutre+desconjurado': {
    abutre: 'Eu já furei sua testa uma vez. Faço de novo.',
    desconjurado: 'E eu continuei vivo. Imortal, lembra?',
  },
  'abutre+injustica': {
    injustica: 'Da última vez eu surgi pelas suas costas. Lembra?',
    abutre: 'Lembro. Por isso hoje eu não tiro o olho de você.',
  },
  'desconjurado+vampira': {
    desconjurado: 'Um grimório que eu nunca vi... curioso.',
    vampira: 'Você sabe tudo, né? Então já sabe que vai sangrar.',
  },
};

// Dante (cânone): amigo de infância do Leo — o receptáculo de Kian; cresceu com o Gal no orfanato (Gaspar);
// parceiro da Agatha nas pesquisas; Força D com Arthur, Joui e Kaiser (que o chamava de "Padre").
Object.assign(PAIR_LINES, {
  'dante+desconjurado': {
    dante: 'Você usou o Leo. Usou a minha infância inteira.',
    desconjurado: 'E você fez exatamente o que eu previ, Gaspar.',
  },
  'dante+injustica': {
    injustica: 'Gaspar... o orfanato manda lembranças.',
    dante: 'O orfanato queimou, Gal. Você devia ter ido junto.',
  },
  'dante+vampira': {
    vampira: 'Treino? Então não reclama se eu sujar teu xale.',
    dante: 'Mostra o que aprendeu com aquele grimório.',
  },
  'abutre+dante': {
    abutre: 'Vai com calma nesses rituais aí, rabiscado.',
    dante: 'Calma eu tenho. Quem não tem é o lodo.',
  },
  'dante+mascarado': {
    mascarado: 'Dante! Sem clones dessa vez, combinado?',
    dante: 'Combinado. Só três.',
  },
  'cineraria+dante': {
    cineraria: 'Bora, Padre. Sem sermão.',
    dante: 'O sermão vem depois, Kaiser.',
  },
});

// Erin (cânone): Equipe Brasa / Força D; apaixonada pelo Joui (a granada Sakura foi presente para ele);
// deu a Nebulosa ao Kaiser; morta pelo Gal com a Ereshkigal — e se explodiu levando ele junto.
// Aguiar (cânone): o Mutilador Noturno; em Hexatombe a Agatha fez o ritual de troca de corpos dos Mascarados.
Object.assign(PAIR_LINES, {
  'erin+mascarado': {
    erin: 'Joui! Fiz uma granada nova pra você... quer ver de perto?',
    mascarado: 'Erin... vai ficar tudo bem. Mas não joga isso em mim.',
  },
  'erin+injustica': {
    injustica: 'Eu lembro do seu cheiro de pólvora. E do seu sangue na Ereshkigal.',
    erin: 'Só o Caos não tem fim. E dessa vez eu levo você inteiro comigo.',
  },
  'cineraria+erin': {
    cineraria: 'Ainda tenho a Nebulosa que você me deu.',
    erin: 'Usa direito dessa vez, Kaiser. Ela é linda quando explode.',
  },
  'abutre+erin': {
    abutre: 'Cuidado com essas granadas aí, guria.',
    erin: 'Relaxa, Arthur. Eu sei exatamente onde cada uma vai cair.',
  },
  'dante+erin': {
    erin: 'Ainda não confio em você, Dante.',
    dante: 'Justo. Eu também não confiaria em mim.',
  },
  'desconjurado+erin': {
    desconjurado: 'Uma engenheira com fósforos. Previsível.',
    erin: 'Previsível? Então prevê isso aqui: Kaboom.',
  },
  'erin+vampira': {
    vampira: 'Esse amuleto elétrico saiu da minha loja, sabia?',
    erin: 'E funciona que é uma beleza. Quer testar?',
  },
  'aguiar+vampira': {
    aguiar: 'Foi você que mexeu no meu corpo, bruxa.',
    vampira: 'Eu emprestei. Devolvo quando terminar.',
  },
  'aguiar+mascarado': {
    mascarado: 'Uma máscara não te torna maior, assassino.',
    aguiar: 'Ha ha ha... diz isso pra sua.',
  },
  'aguiar+erin': {
    aguiar: 'Jovens... sempre correndo pro lado errado.',
    erin: 'Eu não corro. Eu explodo.',
  },
  'aguiar+cineraria': {
    aguiar: 'Névoa não esconde cheiro, garoto.',
    cineraria: 'Então vem me farejar.',
  },
  'abutre+aguiar': {
    abutre: 'Machado contra um Gaudério? Tu escolheu mal.',
    aguiar: 'Um braço só. Vai ser rápido.',
  },
  'aguiar+injustica': {
    injustica: 'Um assassino de acampamento. Que injustiça comigo.',
    aguiar: 'A próxima rodada sou eu.',
  },
  'aguiar+dante': {
    dante: 'Eu conheço gente como você. Cresci com um.',
    aguiar: 'Então sabe como isso termina.',
  },
  'aguiar+desconjurado': {
    desconjurado: 'Uma ferramenta sem mente. Útil.',
    aguiar: 'Ferramenta é o machado. Eu sou quem segura.',
  },
});

export const SOLO_LINES = {
  cineraria: 'A névoa está do meu lado.',
  abutre: 'Eu sou um Gaudério. A gente morre por quem ama.',
  mascarado: 'Sombra da Morte. Shi no Kage.',
  vampira: 'As pessoas têm o que merecem.',
  injustica: 'Muito prazer, eu sou a injustiça.',
  desconjurado: 'Kian sabe.',
  dante: 'É ironia do destino. Uma Divina Comédia.',
  erin: 'Só o Caos não tem fim. Eu sou o Caos.',
  aguiar: 'Ha ha ha... Jovens...',
};

// ---------------- FALAS DE VITÓRIA: [vencedor][derrotado] (ou .default)
export const VICTORY_LINES = {
  cineraria: {
    default: 'Eu já perdi gente demais pra perder pra você.',
    desconjurado: 'Dessa vez quem sumiu foi você, Kian.',
    abutre: 'Você sempre levanta. Mas hoje fica no chão um pouco, Arthur.',
    injustica: 'A névoa vê tudo, Gal. Até quem não enxerga.',
    dante: 'Sem sermão, Padre. Só o resultado.',
  },
  abutre: {
    default: 'Eu sou um Gaudério. A gente não fica no chão.',
    desconjurado: 'Furo tua testa quantas vezes precisar.',
    mascarado: 'Irmão... não some de novo, tá?',
    vampira: 'Tu tá ficando forte, pequena. Mas não hoje.',
    injustica: 'Dessa vez eu vi você chegando.',
    dante: 'Teu lodo não segura um Gaudério, rabiscado.',
  },
  mascarado: {
    default: 'Shi no Kage. A sombra corta antes de você ver.',
    desconjurado: 'Eu disse. Você já tinha perdido.',
    injustica: 'Isso foi pela mulher que me criou.',
    abutre: 'Arthur-san... foi mal. Te pago um lanche.',
    dante: 'Três clones e nenhum me pegou.',
  },
  vampira: {
    default: 'As pessoas têm o que merecem.',
    abutre: 'Viu, Arthurzinho? Não precisa me proteger.',
    desconjurado: 'Nem o Deus do Conhecimento conhecia esse grimório.',
    dante: 'Fala pra eles que eu sou a melhor ocultista da Ordem.',
    injustica: 'Sangra igual a todo mundo, né, Gal?',
  },
  injustica: {
    default: 'Injustiça, né? Muito prazer.',
    desconjurado: 'Você me deixou pra morrer. Agora sente.',
    mascarado: 'Ainda acha que me supera, inseto?',
    dante: 'Gaspar... o orfanato sempre te alcança.',
    abutre: 'Da próxima vez, olhe para trás.',
  },
  desconjurado: {
    default: 'Kian sabe. Kian sempre soube.',
    cineraria: 'Ninguém vai lembrar o seu nome. De novo.',
    mascarado: 'Infantil. Não entende a magnitude do meu plano.',
    injustica: 'Você foi útil, Gal. Só isso.',
    dante: 'Gaspar, você fez exatamente o que eu previ.',
    abutre: 'Eu ainda sou imortal.',
  },
  dante: {
    default: 'É ironia do destino. Uma Divina Comédia.',
    desconjurado: 'Isso foi pelo Leo. E por todos que você usou.',
    injustica: 'O orfanato já queimou, Gal. Deixa ele em paz.',
    vampira: 'Bom trabalho com o grimório. Quase.',
    mascarado: 'Combinado: só três clones.',
    cineraria: 'O sermão vem agora, Kaiser.',
  },
  erin: {
    default: 'Supernova! Viu? Bomba perfeita.',
    mascarado: 'Vai ficar tudo bem, Joui. Eu prometo.',
    injustica: 'Dessa vez quem sobrou fui eu, Gal.',
    cineraria: 'Viu como explode bonito, Kaiser?',
    dante: 'Tá, talvez eu confie um pouquinho em você agora.',
    desconjurado: 'Previu essa, Deus do Conhecimento?',
    aguiar: 'Corre agora, Mutilador. Corre.',
  },
  aguiar: {
    default: 'A próxima rodada sou eu.',
    erin: 'Jovens... ha ha ha.',
    vampira: 'Devolve meu corpo inteiro da próxima vez.',
    mascarado: 'Sua máscara rachou primeiro.',
    abutre: 'Eu disse que ia ser rápido.',
    cineraria: 'Achei você pelo cheiro.',
  },
};

export function victoryLine(winner, loser) {
  const w = VICTORY_LINES[winner] || {};
  return w[loser] || w.default || '';
}

// Retorna [[id, fala], [id, fala]] na ordem dos lutadores
export function introLines(idA, idB) {
  const key = [idA, idB].sort().join('+');
  const pair = PAIR_LINES[key] || {};
  return [
    [idA, pair[idA] || SOLO_LINES[idA] || ''],
    [idB, idA === idB ? '...' : pair[idB] || SOLO_LINES[idB] || ''],
  ];
}
