// VOZES DAS INTRODUÇÕES (2026-10-29): cada personagem fala do JEITO DELE e reage a QUEM o adversário é — não só à arma.
// Para os confrontos sem cena própria do cânone (INTRO_EXCHANGES em dialogues.js), a cena é montada daqui:
//   ally  — os dois são da mesma equipe (defTeams): conversa de colega
//   rival — equipes diferentes: a fala cita a equipe do outro (o.one = "alguém da Ordo", o.group = "a Ordo"...)
//   any   — duas falas soltas, da personalidade; o par escolhe uma (sempre a mesma para o mesmo par)
// Cada fala recebe o = { name, one, group } do OUTRO. Nada de resultado da luta aqui (ganhar/perder/vencer ficam para
// as falas de vitória — check-roster confere).

export const TEAM_REF = {
  'Ordo Realitas': { one: 'alguém da Ordo', group: 'a Ordo' },
  Escriptas: { one: 'um Escripta', group: 'os Escriptas' },
  'Os Cinco': { one: 'um dos Cinco', group: 'os Cinco' },
  Mascarados: { one: 'um Mascarado', group: 'os Mascarados' },
  Transtornados: { one: 'um Transtornado', group: 'os Transtornados' },
  Vampiros: { one: 'um vampiro', group: 'os Vampiros' },
  Portadores: { one: 'quem carrega uma Relíquia', group: 'os Portadores' },
  'Ordo Calamitas': { one: 'alguém da Ordo Calamitas', group: 'a Ordo Calamitas' },
  'Relíquias': { one: 'uma Relíquia', group: 'as Relíquias' },
  'Outro Lado': { one: 'algo do Outro Lado', group: 'o Outro Lado' },
};

// [opener, reply] por personagem
export const VOICES = {
  kaiser: {
    open: {
      ally: (o) => `${o.name}, fica atrás de mim quando a névoa subir. Não quero ter que te achar no meio dela.`,
      rival: (o) => `${o.name}. Já fiz relatório sobre ${o.group}. Nenhum terminou bem pra vocês.`,
      any: [(o) => `${o.name}, eu tô cansado, com fome e sem paciência. Vamos resolver rápido.`, (o) => `Sorri pra foto, ${o.name}. Vai ser a última normal que você tira.`],
    },
    reply: {
      ally: (o) => `Tá, ${o.name}. Mas se a coisa apertar, você corre e eu seguro.`,
      rival: (o) => `O pessoal de ${o.group} sempre manda alguém pra conversar antes. Eu prefiro ir direto, ${o.name}.`,
      any: [(o) => `Hm. Já ouvi pior, ${o.name}. Vamos logo.`, (o) => `Respira fundo, ${o.name}. Daqui a pouco não vai dar.`],
    },
  },
  arthur: {
    open: {
      ally: (o) => `${o.name}! Que bom te ver. Só não pega leve comigo, tá?`,
      rival: (o) => `${o.name}, eu não tenho nada contra ${o.group}. Mas não vou deixar você machucar ninguém.`,
      any: [(o) => `Eu preferia resolver isso tocando uma música, ${o.name}. Mas pelo jeito não vai rolar.`, (o) => `Um braço só e ainda assim eu tô aqui, ${o.name}. Pensa nisso.`],
    },
    reply: {
      ally: (o) => `Fechado, ${o.name}. E depois a gente vai comer alguma coisa.`,
      rival: (o) => `Já cruzei com ${o.group} antes, ${o.name}. Eu lembro de cada um.`,
      any: [(o) => `Tudo bem, ${o.name}. Só promete que ninguém de fora vai sair ferido.`, (o) => `Não precisa ser assim, ${o.name}. Mas se for, eu tô pronto.`],
    },
  },
  joui: {
    open: {
      ally: (o) => `${o.name}. Treino é treino. Não segura a mão.`,
      rival: (o) => `${o.name}... eu conheço o jeito como ${o.group} pensa. É previsível.`,
      any: [(o) => `${o.name}. Você não vai me ver chegando.`, (o) => `Eu já usei uma Máscara, ${o.name}. Sei o que é perder o rosto. Não me provoca.`],
    },
    reply: {
      ally: (o) => `Sem segurar, ${o.name}. Prometo.`,
      rival: (o) => `O pessoal de ${o.group} sempre fala demais, ${o.name}.`,
      any: [(o) => `...Entendido, ${o.name}.`, (o) => `Silêncio, ${o.name}. Escuta a sua sombra.`],
    },
  },
  aghata: {
    open: {
      ally: (o) => `${o.name}, posso anotar como você luta? É pra pesquisa, juro.`,
      rival: (o) => `${o.name}, ${o.one}... interessante. Tenho uma página vazia no grimório só pra você.`,
      any: [(o) => `${o.name}, tem um padrão no seu comportamento. Eu vou descobrir qual é.`, (o) => `O Sangue me contou uma coisa sobre você, ${o.name}. Quer saber o quê?`],
    },
    reply: {
      ally: (o) => `Pode olhar, ${o.name}. Só não conta pros outros os meus segredos.`,
      rival: (o) => `${o.group}? Já li três teorias sobre vocês, ${o.name}. Todas assustadoras.`,
      any: [(o) => `Curioso, ${o.name}. Muito curioso.`, (o) => `Isso foi uma pista ou só nervosismo, ${o.name}?`],
    },
  },
  dante: {
    open: {
      ally: (o) => `${o.name}, meu caro. Uma cena entre amigos. Tente não roubar o meu momento.`,
      rival: (o) => `${o.name}... ${o.one}. Que personagem previsível me deram para contracenar.`,
      any: [(o) => `${o.name}, o roteiro deste encontro é horrível. Vamos improvisar.`, (o) => `As luzes se apagam, ${o.name}. É a sua deixa.`],
    },
    reply: {
      ally: (o) => `Roubar a cena, ${o.name}? Eu só divido o palco.`,
      rival: (o) => `O pessoal de ${o.group} sempre entra sem ensaiar, ${o.name}. Dá pra ver.`,
      any: [(o) => `Belo monólogo, ${o.name}. Ninguém pediu.`, (o) => `O tempo está do meu lado, ${o.name}. Sempre esteve.`],
    },
  },
  erin: {
    open: {
      ally: (o) => `${o.name}! Treino? Ótimo, tenho uma granada nova que eu PRECISO testar.`,
      rival: (o) => `${o.name}, ${o.one}! Sempre quis saber se vocês explodem diferente.`,
      any: [(o) => `${o.name}, fica parado um segundo. Tô calculando o raio.`, (o) => `Ei, ${o.name}! Você gosta de barulho? Porque vai ter muito.`],
    },
    reply: {
      ally: (o) => `Só não explode a minha bancada de novo, ${o.name}!`,
      rival: (o) => `${o.group}? Anotado na lista de testes, ${o.name}!`,
      any: [(o) => `Hehe. Isso foi fofo, ${o.name}. Agora se abaixa.`, (o) => `Pergunta séria, ${o.name}: você é inflamável?`],
    },
  },
  gal_sal: {
    open: {
      ally: (o) => `${o.name}, os Escriptas não brigam entre si à toa. Isto é um teste, não é?`,
      rival: (o) => `${o.name}. Eu vou te julgar por quem você é, não por ${o.group}.`,
      any: [(o) => `Você ainda pode escolher, ${o.name}. É a última vez que eu ofereço.`, (o) => `Justiça não é vingança, ${o.name}. Mas às vezes se parece.`],
    },
    reply: {
      ally: (o) => `É um teste, ${o.name}. E eu não pretendo facilitar.`,
      rival: (o) => `O pessoal de ${o.group} já me deu motivo demais, ${o.name}.`,
      any: [(o) => `Escolha feita, ${o.name}. Agora carrega o peso dela.`, (o) => `As correntes não mentem, ${o.name}.`],
    },
  },
  nubi: {
    open: {
      ally: (o) => `${o.name}. Lute devagar comigo. Eu vou ver tudo de qualquer jeito.`,
      rival: (o) => `${o.name}. Eu já esperei séculos por ${o.group}. Posso esperar mais um pouco.`,
      any: [(o) => `${o.name}. Você piscou. Pra mim, foi uma tarde inteira.`, (o) => `A Morte é paciente, ${o.name}. Eu também.`],
    },
    reply: {
      ally: (o) => `Devagar, ${o.name}. Como sempre.`,
      rival: (o) => `${o.group}. Já vi tantos de vocês passarem, ${o.name}.`,
      any: [(o) => `Calma, ${o.name}. Respira. Ainda temos tempo.`, (o) => `Hm. ${o.name}. Eu ouvi antes de você falar.`],
    },
  },
  kian: {
    open: {
      ally: (o) => `${o.name}. Eu já vi esse treino. Você vai hesitar no terceiro golpe.`,
      rival: (o) => `${o.name}. O pessoal de ${o.group} sempre acha que tem escolha. Não tem.`,
      any: [(o) => `${o.name}, os presságios falaram de você. Pouco, mas falaram.`, (o) => `Isto já aconteceu, ${o.name}. Você só está chegando atrasado.`],
    },
    reply: {
      ally: (o) => `Então não vou hesitar, ${o.name}. Ou vou. Você já sabe.`,
      rival: (o) => `Até o pessoal de ${o.group} estava escrito, ${o.name}.`,
      any: [(o) => `Previsível, ${o.name}.`, (o) => `Você acredita mesmo nisso, ${o.name}? Que pena.`],
    },
  },
  aguiar: {
    open: {
      ally: (o) => `Ha ha... ${o.name}. Treinar com você é quase tão bom quanto caçar.`,
      rival: (o) => `${o.name}... ${o.one}. Ha ha. A carne de vocês tem outro cheiro.`,
      any: [(o) => `Corre, ${o.name}. Eu gosto quando correm.`, (o) => `O acampamento tá quieto hoje, ${o.name}. Ha ha... por enquanto.`],
    },
    reply: {
      ally: (o) => `Ha ha. Cuidado comigo, ${o.name}. Eu esqueço que é treino.`,
      rival: (o) => `${o.group}. Ha ha... já cacei um de vocês, ${o.name}.`,
      any: [(o) => `Ha ha... valente, ${o.name}. Gosto disso na presa.`, (o) => `Você tá suando, ${o.name}. Eu sinto daqui.`],
    },
  },
  labirinto: {
    open: {
      ally: (o) => `${o.name}. Entre nós, o caminho é curto. Não se perca.`,
      rival: (o) => `${o.name}. O pessoal de ${o.group} sempre entra no labirinto achando que conhece a saída.`,
      any: [(o) => `Todo caminho termina em algum lugar, ${o.name}. Escolha bem o seu.`, (o) => `Encosta em mim, ${o.name}. Só uma vez. Eu insisto.`],
    },
    reply: {
      ally: (o) => `Eu nunca me perco, ${o.name}. Eu sou o caminho.`,
      rival: (o) => `${o.group}. Mais um corredor sem saída, ${o.name}.`,
      any: [(o) => `Esquerda ou direita, ${o.name}? Dá no mesmo.`, (o) => `O centro está perto, ${o.name}. Você sente?`],
    },
  },
  xande: {
    open: {
      ally: (o) => `${o.name}! Bora treinar, mas sem mandar ninguém pro hospital dessa vez.`,
      rival: (o) => `${o.name}, eu não ligo pra ${o.group}. Só não chega perto dos meus amigos.`,
      any: [(o) => `${o.name}, a gente pode conversar antes? ...Não? Tá bom então.`, (o) => `Eu andei a cidade toda de skate pra chegar aqui, ${o.name}. Não vou voltar agora.`],
    },
    reply: {
      ally: (o) => `Sem hospital, ${o.name}. Prometo. Talvez.`,
      rival: (o) => `${o.group}? Já encarei coisa mais estranha, ${o.name}.`,
      any: [(o) => `Beleza, ${o.name}. Do meu jeito, então.`, (o) => `Pelos meus amigos, ${o.name}. Sempre por eles.`],
    },
  },
  lirio: {
    open: {
      ally: (o) => `${o.name}, bah, tu e eu? A Leonora vai se divertir.`,
      rival: (o) => `${o.name}, ${o.one}? Tu não assusta a Leonora, não.`,
      any: [(o) => `Fica ali, ${o.name}. Eu sou a parede, e paredes não saem do lugar.`, (o) => `${o.name}, tu chegou bem na hora. A Leonora tava com saudade de bater em alguém.`],
    },
    reply: {
      ally: (o) => `Bora, ${o.name}. Mas devagar com a Leonora, que ela é sensível.`,
      rival: (o) => `${o.group}, é? Pode vir, ${o.name}. A marreta é pesada pros dois lados.`,
      any: [(o) => `Tá, ${o.name}. Tu que pediu.`, (o) => `Eu não saio daqui, ${o.name}. Nem que tu empurre.`],
    },
  },
  ferreiro: {
    open: {
      ally: (o) => `${o.name}. Um treino honrado. Santo Berço aprova.`,
      rival: (o) => `${o.name}. Ninguém de ${o.group} pisa em Santo Berço sem a minha permissão.`,
      any: [(o) => `${o.name}, eu guardo um povo inteiro. Você guarda o quê?`, (o) => `Abaixe a voz, ${o.name}. Aqui se luta com respeito.`],
    },
    reply: {
      ally: (o) => `Com honra, ${o.name}. Sempre.`,
      rival: (o) => `Já enfrentei ${o.group} antes, ${o.name}. Santo Berço continua de pé.`,
      any: [(o) => `Entendo, ${o.name}. Que seja.`, (o) => `Meu povo me espera, ${o.name}. Não demore.`],
    },
  },
  juan: {
    open: {
      ally: (o) => `${o.name}... treino? Me machuca de verdade, vai. Eu gosto.`,
      rival: (o) => `${o.name}, ${o.one}... você também ouve as vozes, ou é só comigo?`,
      any: [(o) => `${o.name}. Eu não quero mais ser quem eu era. Me ajuda a esquecer.`, (o) => `Sangra pra mim, ${o.name}. Só um pouquinho.`],
    },
    reply: {
      ally: (o) => `Isso, ${o.name}. Assim. Mais forte.`,
      rival: (o) => `${o.group}... eu já fui um de muita coisa, ${o.name}. Nenhuma presta.`,
      any: [(o) => `Hehe... ${o.name}. Que bonito.`, (o) => `Dói? Que bom, ${o.name}. Dói em mim também.`],
    },
  },
  kemi: {
    open: {
      ally: (o) => `${o.name}. Treino não paga, então vai ser rápido.`,
      rival: (o) => `${o.name}. Já fiz contrato contra ${o.group}. O seu nome tá na lista?`,
      any: [(o) => `Nada pessoal, ${o.name}. É só trabalho.`, (o) => `${o.name}, você tá na minha mira desde que entrou.`],
    },
    reply: {
      ally: (o) => `Rápido, ${o.name}. E sem drama.`,
      rival: (o) => `${o.group}. Paga bem, ${o.name}. Pouca coisa paga tão bem.`,
      any: [(o) => `Anotado, ${o.name}.`, (o) => `Fala o que quiser, ${o.name}. A bala não escuta.`],
    },
  },
  balu: {
    open: {
      ally: (o) => `Hahaha! ${o.name}! Vem, que o tio Balu ensina umas coisinhas!`,
      rival: (o) => `Opa, ${o.name}! ${o.one}, é? O tio Balu já desmontou uns três de vocês.`,
      any: [(o) => `${o.name}! Comeu bem hoje? Porque vai precisar de energia!`, (o) => `Ô ${o.name}, não precisa ficar com essa cara. Vai ser divertido!`],
    },
    reply: {
      ally: (o) => `Hahaha! É assim que se fala, ${o.name}!`,
      rival: (o) => `${o.group}? Hahaha! Manda mais, ${o.name}, que o urso tá com fome!`,
      any: [(o) => `Gostei de você, ${o.name}! Pena que vai doer.`, (o) => `Hahaha! Boa, ${o.name}! Agora segura essa!`],
    },
  },
  arnaldo: {
    open: {
      ally: (o) => `${o.name}! Que alegria dividir o palco com você. Não esqueça as falas.`,
      rival: (o) => `${o.name}... ${o.one}. Todo grande drama precisa de um bom antagonista.`,
      any: [(o) => `Senhoras e senhores, ${o.name}! Que entrada. Agora, o segundo ato.`, (o) => `${o.name}, o público está esperando. Vamos dar a eles um espetáculo.`],
    },
    reply: {
      ally: (o) => `Eu sei todas, ${o.name}. As minhas e as suas.`,
      rival: (o) => `${o.group}! Que figurino, ${o.name}. Péssimo roteiro, mas que figurino.`,
      any: [(o) => `Bravo, ${o.name}! Que deixa perfeita.`, (o) => `Improviso, ${o.name}? Eu adoro improviso.`],
    },
  },
  verissimo: {
    open: {
      ally: (o) => `${o.name}. Treino curto. Quero você descansado pra próxima missão.`,
      rival: (o) => `${o.name}. ${o.group} está no meu relatório há meses. Hoje eu fecho esse capítulo.`,
      any: [(o) => `${o.name}. Diga o que veio fazer, sem rodeios.`, (o) => `Mantenha a posição, ${o.name}. Eu dou as ordens aqui.`],
    },
    reply: {
      ally: (o) => `Sim, senhor... digo, combinado, ${o.name}.`,
      rival: (o) => `${o.group}. Anotado, ${o.name}. Nada muda o plano.`,
      any: [(o) => `Entendido, ${o.name}. Prossiga.`, (o) => `Relatório na minha mesa depois, ${o.name}.`],
    },
  },
  jae: {
    open: {
      ally: (o) => `Shh, ${o.name}. Treino de esconde-esconde. Você conta.`,
      rival: (o) => `${o.name}... ${o.one}. Shh. Eu adoro quando vocês gritam.`,
      any: [(o) => `Shh, ${o.name}. Não grita. Ainda não.`, (o) => `Você tá olhando pro lugar errado, ${o.name}.`],
    },
    reply: {
      ally: (o) => `Um... dois... shh, ${o.name}.`,
      rival: (o) => `${o.group}... que gostinho bom, ${o.name}.`,
      any: [(o) => `Que fofo, ${o.name}. Shh.`, (o) => `Grita mais alto, ${o.name}. Eu gosto.`],
    },
  },
  dalmo: {
    open: {
      ally: (o) => `${o.name}, neném! Vem, que a arena é nossa hoje.`,
      rival: (o) => `${o.name}, ${o.one}... eu sou grande, mas não sou dois. Vai ser só eu contra vocês.`,
      any: [(o) => `Pela Manu, ${o.name}. Tudo é pela Manu.`, (o) => `A plateia quer sangue, ${o.name}. Eu dou o que a plateia quer.`],
    },
    reply: {
      ally: (o) => `Aí sim, neném! Segura essa, ${o.name}!`,
      rival: (o) => `${o.group}? Já esmaguei coisa maior na arena, ${o.name}.`,
      any: [(o) => `Pode vir, ${o.name}. Eu aguento.`, (o) => `Grande e de pé, ${o.name}. Sempre.`],
    },
  },
  guizo: {
    open: {
      ally: (o) => `${o.name}! Treino gravado vale pro canal, né? Fala oi pra câmera!`,
      rival: (o) => `Mano, ${o.name}! ${o.one} DE VERDADE! O pessoal do fórum não vai acreditar!`,
      any: [(o) => `${o.name}, segura um segundo, a luz tá ruim... pronto, pode me matar.`, (o) => `Isso é real, ${o.name}. Eu tenho provas. Vou ter, daqui a pouco.`],
    },
    reply: {
      ally: (o) => `Oi, câmera! ...Vai, ${o.name}, faz a pose!`,
      rival: (o) => `${o.group}... tá, eu tô com medo, ${o.name}. Mas não paro de gravar!`,
      any: [(o) => `Mano, ${o.name}, repete isso? Não pegou o áudio.`, (o) => `Calma, calma... enquadra, Guizo... vai, ${o.name}!`],
    },
  },
  o_diabo: {
    open: {
      ally: (o) => `${o.name}... até entre nós, tudo tem um preço.`,
      rival: (o) => `${o.name}. O pessoal de ${o.group} sempre vem pedindo alguma coisa. O que você quer?`,
      any: [(o) => `Eu sei o que você deseja, ${o.name}. Assina aqui.`, (o) => `${o.name}... seu sangue tem um cheiro tão honesto.`],
    },
    reply: {
      ally: (o) => `Um preço que eu cobro com prazer, ${o.name}.`,
      rival: (o) => `${o.group}. Todos assinam no fim, ${o.name}.`,
      any: [(o) => `Que gracinha, ${o.name}. Ninguém lê as letras miúdas.`, (o) => `Interessante oferta, ${o.name}. A minha é melhor.`],
    },
  },
  magistrada: {
    open: {
      ally: (o) => `${o.name}. Eu já sei como este treino termina. Mesmo assim, venha.`,
      rival: (o) => `${o.name}. O pessoal de ${o.group} pesou demais na balança. Eu vim acertá-la.`,
      any: [(o) => `${o.name}. Eu sei tudo o que você vai dizer. Diga mesmo assim.`, (o) => `O Equilíbrio me trouxe até você, ${o.name}. Não é pessoal.`],
    },
    reply: {
      ally: (o) => `Venha, ${o.name}. Eu também já vi o fim.`,
      rival: (o) => `${o.group}... a Seita observa vocês há séculos, ${o.name}.`,
      any: [(o) => `Nostis omnia, ${o.name}. Saber tudo custa tudo. Você ainda não pagou.`, (o) => `Previsto, ${o.name}.`],
    },
  },
  estrangeiro: {
    open: {
      ally: (o) => `${o.name}. O sinal é o mesmo. A frequência, não.`,
      rival: (o) => `${o.name}. ${o.group}. Memórias tão... barulhentas.`,
      any: [(o) => `${o.name}. Amanhã ninguém vai lembrar de você.`, (o) => `O que é pior do que a Dor e a Morte, ${o.name}?`],
    },
    reply: {
      ally: (o) => `Ajustando a frequência, ${o.name}.`,
      rival: (o) => `${o.group}. Já apaguei tantos de vocês, ${o.name}.`,
      any: [(o) => `Interessante, ${o.name}. Repita.`, (o) => `Você ouviu o sinal, ${o.name}. Agora não para mais.`],
    },
  },
  amigo: {
    open: {
      ally: (o) => `...${o.name}... brincar... juntos?...`,
      rival: (o) => `...${o.name}... ${o.group}... quadro novo... na igreja...`,
      any: [(o) => `(o sino toca) ...${o.name}... ninguém lembra... quando parou...`, (o) => `...${o.name}... a tinta... gosta de você...`],
    },
    reply: {
      ally: (o) => `...sim... ${o.name}... brincar...`,
      rival: (o) => `...${o.group}... derretem... igual...`,
      any: [(o) => `(a tinta pinga no chão) ...${o.name}...`, (o) => `...todo mundo... vai morrer... ${o.name}...`],
    },
  },
  cristino: {
    open: {
      ally: (o) => `${o.name}. Treino. Rápido. E calado.`,
      rival: (o) => `${o.name}. Não ligo pra ${o.group}. Só sai do meu caminho.`,
      any: [(o) => `Não é pessoal, ${o.name}. Eu já disse que não me importo com os joguinhos de vocês.`, (o) => `Eu odeio gente barulhenta, ${o.name}. Fala baixo.`],
    },
    reply: {
      ally: (o) => `Hm. Pode vir, ${o.name}.`,
      rival: (o) => `${o.group}. Já cacei bicho pior no mato, ${o.name}.`,
      any: [(o) => `Fala menos, ${o.name}.`, (o) => `Um... dois... três, ${o.name}.`],
    },
  },
  cristopher: {
    open: {
      ally: (o) => `${o.name}! Treino de cena! Eu faço a queda, você faz o soco!`,
      rival: (o) => `HEY, ${o.name}! ${o.one}? Já fiz filme com vilão bem mais assustador!`,
      any: [(o) => `${o.name}, aqui é cena de ação, e eu faço as minhas sem dublê!`, (o) => `Ninguém encosta na minha equipe, ${o.name}! Ninguém!`],
    },
    reply: {
      ally: (o) => `Isso, ${o.name}! Sentiu a energia? AÇÃO!`,
      rival: (o) => `${o.group}? Retroceder nunca, render-se jamais, ${o.name}!`,
      any: [(o) => `Boa, ${o.name}! Mas o tio já caiu de prédio por menos!`, (o) => `Corta! Não, espera, ${o.name}, continua gravando!`],
    },
  },
  raziel: {
    open: {
      ally: (o) => `${o.name}. Um treino entre os nossos. Tente não me morder primeiro.`,
      rival: (o) => `${o.name}. ${o.group}... um prato que eu ainda não provei.`,
      any: [(o) => `${o.name}. Desculpe a entrada sem convite. O banquete é por minha conta.`, (o) => `Que cheiro esplêndido, ${o.name}. Sente-se. A ceia já vai começar.`],
    },
    reply: {
      ally: (o) => `Nunca primeiro, ${o.name}. Sou educado.`,
      rival: (o) => `${o.group}. Que gentileza virem até a minha mesa, ${o.name}.`,
      any: [(o) => `Que gentileza, ${o.name}. Eu já sinto o gosto daqui.`, (o) => `Sem pressa, ${o.name}. Uma boa refeição se aprecia.`],
    },
  },
  celestine: {
    open: {
      ally: (o) => `${o.name}! Treino? Ótimo. Não chora quando eu te trair, tá?`,
      rival: (o) => `Ih, ${o.name}, ${o.one}? Que fofo. Já tô entediada.`,
      any: [(o) => `Aproveita e reza pra deixar de ser chato, ${o.name}... Chato!`, (o) => `Nada pessoal, ${o.name}. Mentira. Um pouquinho pessoal.`],
    },
    reply: {
      ally: (o) => `Hahaha! Tá bom, ${o.name}. Nada pessoal mesmo.`,
      rival: (o) => `${o.group}? Já quebrei a cara de uns três, ${o.name}. Fica tranquilo.`,
      any: [(o) => `Que medo, ${o.name}. Vem logo, que a minha endorfina já subiu.`, (o) => `Fala mais, ${o.name}. Adoro quando ficam bravos.`],
    },
  },
  gaius: {
    open: {
      ally: (o) => `${o.name}, de novo? Minhas costas pedem trégua, mas a maça não.`,
      rival: (o) => `Ah, ${o.name}... ${o.one}. Na minha época, o pessoal de ${o.group} pelo menos dizia bom dia.`,
      any: [(o) => `Ah, a juventude, ${o.name}... Senta aí, que o velho vai te mostrar.`, (o) => `${o.name}, eu tô velho demais pra isso. Então vamos rápido.`],
    },
    reply: {
      ally: (o) => `Tá bom, ${o.name}. Mas depois você me carrega pra casa.`,
      rival: (o) => `${o.group}? Já vi Roma pegar fogo, ${o.name}. Vocês não me assustam.`,
      any: [(o) => `Já vi coisa pior, ${o.name}. Já fui coisa pior.`, (o) => `Calma, ${o.name}. O velho ainda dá conta.`],
    },
  },
  // AMALIA (Ordo Calamitas): quieta, fala só o necessário; a flecha fala por ela
  amalia: {
    open: {
      ally: (o) => `${o.name}. Fica fora da linha da flecha.`,
      rival: (o) => `${o.name}. ${o.one}. Já mirei em coisa pior.`,
      any: [(o) => `${o.name}. Uma flecha. Talvez duas.`, (o) => `Cabeça no lugar, ${o.name}. Eu não erro.`],
    },
    reply: {
      ally: (o) => `Tá. Mas de longe, ${o.name}.`,
      rival: (o) => `${o.group}. Anotado. Agora some da minha mira.`,
      any: [(o) => `Hm. Fala menos, ${o.name}.`, (o) => `Já te achei, ${o.name}.`],
    },
  },
  // O ANFITRIÃO — a mesma consciência no Arnaldo e no Gaius (Amphitruo): o apresentador do caos, os JOGOS com regras que
  // ele inventa na hora, a plateia, os enigmas, as vozes que trocam de tom no meio da frase
  // Irônico, debochado, o caos puro (wiki: "agitado, prepotente e confiante, rindo dos outros, sarcástico, rude,
  // interrompe as pessoas"; só quer se divertir com a agonia alheia). Interrompe a própria frase, muda as regras no meio,
  // fala com a plateia, troca de voz. O bordão de abertura dos jogos é dele.
  anfitriao: {
    open: {
      ally: (o) => `${o.name}! Meu jogador favorito! Ou era o outro? Ah, tanto faz, vocês todos têm a mesma cara de quem vai chorar.`,
      rival: (o) => `Vamos começar os jogos? HAHA! Plateia, olhem só: ${o.one}! Façam suas apostas — não nele, claro.`,
      any: [
        (o) => `${o.name}, regras do jogo: um, você não pode me tocar. Dois, eu posso. Três... ah, eu invento quando chegar lá.`,
        (o) => `Ei, ${o.name}, uma charada: o que é que sobe, desce e grita? ...Você. Daqui a pouco. HAHAHA!`,
        (o) => `Silêncio, silêncio! ${o.name} vai falar uma coisa muito importan— não, mudei de ideia, ninguém liga.`,
      ],
    },
    reply: {
      ally: (o) => `Ah, ${o.name}, que amizade linda. Vai ficar ótima no programa de hoje: "Amigos que se Machucam".`,
      rival: (o) => `${o.group}! Eu AMO o pessoal de ${o.group}! Sempre acham que entenderam as regras, ${o.name}. Ninguém entende as regras. Nem eu!`,
      any: [
        (o) => `Que discurso, ${o.name}! A plateia chorou. De rir. Mas chorou.`,
        (o) => `Hm, hm, hm. Interessante, ${o.name}. Agora repete com MENOS dignidade.`,
        (o) => `Tique. Taque. Ouviu, ${o.name}? É o relógio. Ele também tá rindo de você.`,
      ],
    },
  },
};
