// O ANFITRIÃO nas falas de fim de luta e de combate (2026-10-30). O das Relíquias e o Amphitruo (o Gaius) são a MESMA
// consciência da Relíquia de Energia — as mesmas falas. O tom (wiki "O Anfitrião"): agitado, prepotente, sarcástico, ri
// dos outros, interrompe, muda as regras no meio, fala com a plateia, quer só o entretenimento da agonia alheia.
// As ligações do cânone: o Arnaldo e o Gaius foram portadores; a Celestine venceu os jogos de Amphitruo e virou a
// Magistrada (a única que pode destroná-lo); o Jogo do Orfanato contra o Kian (que o Dante estragou salvando o menino);
// a Erin presa num dos jogos em Desconjuração; o Veríssimo, amigo do Arnaldo; o Diabo, aliado em Calamidade.

// [vencedor anfitriao][derrotado] — sem par próprio, o default (sorteado)
export const HOST_VICTORY = {
  default: [
    'E o prêmio vai para... ninguém! Plateia, aplausos para o NINGUÉM!',
    'Regra nova: quem cai, perde. Ah, você já caiu? Que coincidência, acabei de inventar.',
    'Hahaha! Que derrota linda! Faz de novo, faz de novo, a plateia não viu!',
    'Calma, foi só o primeiro jogo. Tem mais quarenta. Não, mentira. Tem infinitos.',
    'Você jogou tão bem que eu quase te deixei sair. Quase. Hm. Não.',
    'Silêncio! ...Ninguém tava falando? Ótimo. Continua assim, no chão.',
    'Tique, taque. Acabou o seu tempo. O meu? O meu nunca acaba!',
    'Eu disse que as regras mudavam. Não disse quando. Nem pra quem. HAHA!',
  ],
  arnaldo: ['Arnaldo, Arnaldo... você ainda acha que esse corpo é seu? Que gracinha.', 'Fecham-se as cortinas! Eu sempre fui o protagonista, querido. Você era o figurino.'],
  gaius: ['Gaius, meu velho! Ainda reclamando das costas? Eu resolvi isso: tirei o resto também!', 'O primeiro corpo a gente nunca esquece. Ah, esquece sim. Esqueci. Quem é você?'],
  celestine: ['Celestine! A campeã dos meus jogos! E olha só: perdeu o jogo de agora. Ironia é tudo.', 'Você ganhou a Máscara, menina. Eu ganhei a graça de te ver no chão. Empate?'],
  magistrada: ['A única que pode me destronar... ajoelhada. A plateia vai ao delírio!', 'Equilíbrio? Que palavra chata. Eu prefiro: GANHEI.'],
  kian: ['O menino do orfanato! Cresceu! Continua sem conseguir conjurar nada perto de mim. HAHA!', 'Jogo do Orfanato, segunda temporada! Agora sem o Dante pra estragar o final.'],
  dante: ['Você estragou o meu Jogo do Orfanato, sabia? Considera isso a cobrança. Com juros.', 'Herói do incêndio! Hoje ninguém te salva. Que pena. Que delícia.'],
  erin: ['Erin! Você de novo no meu programa! A audiência AMA você explodindo e caindo.', 'Lembra do meu jogo? Esse foi a continuação. Spoiler: você não escapa de novo.'],
  o_diabo: ['Sócio! Nada pessoal. Mentira, foi bem pessoal e muito divertido.', 'Pactos, pactos... eu prefiro jogos. Os jogos não pedem assinatura.'],
  juan: ['O masoquista! Gostou? Gostou, né? Eu sabia! Bis!', 'Sangue pra todo lado. O Diabo vai me cobrar a faxina.'],
  amigo: ['...ninguém ri... Que plateia horrível você é.', 'Tinta pra todo lado. Que bagunça. Adorei.'],
  estrangeiro: ['Ninguém vai lembrar disso? EU vou lembrar. Pra sempre. Em detalhes.', 'Sinal ruim, hein? Desliga e liga de novo. HAHA!'],
};

// [vencedor][anfitriao] — o que cada um diz depois de derrubar o Anfitrião (o das Relíquias ou o Amphitruo)
export const VICTORY_VS_HOST = {
  kaiser: ['Acabou o show. Ninguém pediu bis.', 'Engasga com a sua plateia, palhaço.'],
  arthur: ['Fim do jogo, Anfitrião. Ninguém mais entra na sua roleta.', 'Eu já toquei em bar pior. Pelo menos lá a plateia era real.'],
  joui: ['O seu jogo não tinha regra. O meu tinha uma: te parar.', 'Ria agora. Eu espero.'],
  aghata: ['Anotado: o Caos também cai. Página nova no grimório.', 'Sua charada tinha resposta, sabia? Era eu.'],
  dante: ['Eu já estraguei um jogo seu. Dois é tradição.', 'Fim da peça. O vilão saiu mais cedo.'],
  erin: ['KABOOM! Quero ver mudar ESSA regra!', 'Você me prendeu num jogo uma vez. Agora eu escolho o final!'],
  gal_sal: ['O Caos não escapa da justiça. Só demora.', 'Suas regras acabaram. As minhas não.'],
  nubi: ['Você tem pressa. A Morte não.', 'Silêncio, enfim.'],
  kian: ['O orfanato queimou. Eu não. Lembre disso.', 'Você mudou as regras. Eu escrevi o resultado.'],
  aguiar: ['Ha ha... a plateia gosta de sangue. Eu também.', 'Presa barulhenta. Ainda presa.'],
  labirinto: ['Seu jogo tinha muitas saídas. Você não achou nenhuma.', 'Toquei. Agora a plateia aplaude.'],
  xande: ['Seu jogo acabou. A gente vai pra casa inteiro.', 'Ninguém mais brinca com os meus amigos.'],
  lirio: ['A Leonora não ri das suas piadas.', 'Plateia nenhuma salva tu da marreta.'],
  ferreiro: ['Santo Berço não participa de jogos.', 'O Caos se curva. Hoje, pelo menos.'],
  juan: ['Gostei do jogo. Pena que acabou rápido.', 'Sangue e Energia. O Sangue ganha.'],
  kemi: ['Contrato cumprido. Sem plateia.', 'Um tiro. Sem regra nova.'],
  balu: ['Hahaha! Gostei do show, mas o urso pegou o palhaço!', 'Que bagunça, hein! Agora arruma tudo isso.'],
  arnaldo: ['Sai da minha cabeça. Esse palco é meu.', 'Fecham-se as cortinas. Pra você, de vez.'],
  verissimo: ['Arnaldo, se você ainda está aí dentro: aguenta firme.', 'Caso encerrado. O Caos vai para o arquivo.'],
  jae: ['Shh... nada de plateia agora.', 'Você grita bonito, Anfitrião.'],
  dalmo: ['Arena de verdade é sem regra mudando no meio, neném.', 'A plateia é minha agora.'],
  guizo: ['GRAVEI O ANFITRIÃO CAINDO! O fórum vai PIRAR!', 'Corta! Corta! ...Ele ainda tá rindo?'],
  o_diabo: ['Sócio, você esqueceu de ler as letras miúdas.', 'Todo jogo termina num pacto. O seu terminou comigo.'],
  magistrada: ['Destronado. Como sempre esteve escrito.', 'O Equilíbrio não ri das suas piadas.'],
  estrangeiro: ['Ninguém vai lembrar do seu jogo.', 'Ruído. Só ruído.'],
  amigo: ['...a plateia... derreteu...', '...mais um quadro... sorrindo...'],
  cristino: ['Eu odeio gente barulhenta. Você era a pior.', 'Não é pessoal. É só que você fala demais.'],
  cristopher: ['CORTA! Esse vilão eu derrubo sem dublê!', 'Fim de filme! Créditos subindo!'],
  raziel: ['Um anfitrião que não serve o jantar. Que deselegante.', 'O banquete acabou. E a sua festa também.'],
  celestine: ['Ganhei os seus jogos uma vez. Ganhei de novo. Chato!', 'Nada pessoal, Anfitrião. Você que é chato demais.'],
  gaius: ['Sai do meu rosto, coisa. Eu já fui você. Nunca mais.', 'Velho, mas livre. Leva as suas vozes embora.'],
};

// frases de COMBATE (vida baixa, especial, transformação) para quem ainda não tinha — e as do Anfitrião no tom certo
export const BATTLE_EXTRA = {
  critical: {
    nubi: 'Tanto tempo... e ainda é cedo pra mim.',
    raziel: 'Um arranhão. Que deselegante da sua parte.',
    celestine: 'Ai! ...Hehe. Agora sim a endorfina subiu.',
    gaius: 'Minhas costas... tudo bem, eu já tava quebrado mesmo.',
    anfitriao: 'AI! Doeu! Faz de novo! Não, espera, regra nova: ninguém pode me machucar.',
  },
  special: {
    nubi: 'Sente-se. A Esfinge pergunta, e você responde.',
    raziel: 'A ceia está servida.',
    celestine: 'Nada pessoal. Duelo final.',
    gaius: 'Ainda dou conta! Olha só!',
    anfitriao: 'Vamos começar os jogos? HAHAHA!',
  },
  transform: {
    raziel_verdadeiro: 'Chega de etiqueta.',
    celestine_magistrada: 'Saber tudo... que chato. Mas eu topo.',
    amphitruo: 'Agora é minha vez de brilhar!',
    anfitriao: 'Olha só que roupa nova! E esse sorriso? Nem eu sei de quem é.',
  },
};
export const BATTLE_REPLIES_EXTRA = {
  critical: {
    nubi: 'Respira. Ainda temos tempo.',
    raziel: 'Que sangue teimoso. Gosto disso.',
    celestine: 'Levanta, chato. Ainda não terminei.',
    gaius: 'Levanta, filho. O velho espera.',
    anfitriao: 'Ah, não morre ainda! O intervalo é só depois do terceiro ato!',
  },
  special: {
    nubi: 'Pode vir. Eu vi isso chegando há horas.',
    raziel: 'Que oferta generosa. Aceito.',
    celestine: 'Ui. Que medo. Vem.',
    gaius: 'Já vi coisa pior. Já fui coisa pior.',
    anfitriao: 'Que golpe lindo! Nota dez! A plateia votou: ninguém liga!',
  },
  transform: {
    nubi: 'Uma nova forma. A mesma pressa.',
    raziel: 'Mudou de pele. O sabor continua.',
    celestine: 'Fantasia nova? Que fofo.',
    gaius: 'Isso eu já vi em Roma. Não terminou bem.',
    anfitriao: 'Uau! Que figurino! Quem é seu estilista? Eu quero o contato. Pra demitir.',
  },
};
