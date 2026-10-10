// Falas de introducao pre-luta; independentes do resultado.
export const CHARACTER_NAMES = {
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
  balu: 'Balu',
  arnaldo: 'Arnaldo',
  verissimo: 'Veríssimo',
  jae: 'Jae',
  dalmo: 'Dalmo',
  guizo: 'Guizo',
};

export const BASE_CHARACTER = { deus_morte: 'ferreiro', diabo: 'juan', fantasma: 'kemi', anfitriao: 'arnaldo', aguiar_mutilador: 'aguiar', erin_caos: 'erin', labirinto_elmo: 'labirinto', jae_x: 'jae', colosso: 'dalmo', guizo_et: 'guizo', kian_calamidade: 'kian' };

export const INTRO_IDS = Object.keys(CHARACTER_NAMES);
const INTRO_HOOKS = {
  kaiser: 'a névoa',
  arthur: 'o rifle',
  joui: 'a katana',
  aghata: 'o grimório',
  dante: 'o lodo',
  erin: 'as granadas',
  gal_sal: 'as correntes',
  kian: 'os presságios',
  aguiar: 'a máscara',
  labirinto: 'o capacete',
  xande: 'o skate',
  lirio: 'a Leonora',
  ferreiro: 'a Espada Consumidora',
  juan: 'o trono',
  kemi: 'o contrato',
  balu: 'o machado',
  arnaldo: 'a espada da fita vermelha',
  verissimo: 'a espada do Arnaldo',
  jae: 'o punhal X',
  dalmo: 'esses punhos',
  guizo: 'uma faca e uma câmera',
};

const INTRO_OPENERS = {
  kaiser: (other, hook) => `${other}, trouxe ${hook} pra conversa ou veio só ouvir?`,
  arthur: (other, hook) => `${other}, com ${hook} por perto fica difícil conversar. O que te trouxe?`,
  joui: (other, hook) => `${other}, ${hook} já diz bastante. Quer contar o resto?`,
  aghata: (other, hook) => `${other}, vim perguntar sobre ${hook}. Ou isso é mais uma pista?`,
  dante: (other, hook) => `${other}, eu poderia começar perguntando sobre ${hook}. Qual é a história?`,
  erin: (other, hook) => `${other}, pergunta rápida: devo me preocupar com ${hook}?`,
  gal_sal: (other, hook) => `${other}, ${hook} te trouxe até aqui, ou foi escolha sua?`,
  kian: (other, hook) => `${other}, ${hook} foi escolha sua ou consequência?`,
  aguiar: (other, hook) => `${other}, devo me preocupar com ${hook} ou com a intenção?`,
  labirinto: (other, hook) => `${other}, você veio com ${hook}; isso é parte do caminho ou o destino?`,
  xande: (other, hook) => `${other}, vi ${hook} quando você chegou. A gente pode falar primeiro?`,
  lirio: (other, hook) => `${other}, tu trouxe ${hook} pra conversa? A Leonora também veio.`,
  ferreiro: (other, hook) => `${other}, você chegou com ${hook}. É motivo de preocupação?`,
  juan: (other, hook) => `${other}, quando os outros veem ${hook}, você acha que enxergam você?`,
  kemi: (other, hook) => `${other}, com ${hook} assim, isso é pessoal ou trabalho?`,
  balu: (other, hook) => `Opa, ${other}! Chegou com ${hook}, hein. Bora conversar antes ou já vamos pra parte divertida?`,
  arnaldo: (other, hook) => `${other}, que entrada! Trouxe ${hook} para o palco, então. Qual é o seu papel nesta cena?`,
  verissimo: (other, hook) => `${other}. Vi ${hook} no relatório. Me diga o que veio fazer aqui, sem rodeios.`,
  jae: (other, hook) => `${other}... trouxe ${hook}? Shh. Vamos brincar de esconde-esconde.`,
  dalmo: (other, hook) => `${other}, eu sou grande, mas não sou dois. Vem com ${hook} que eu te mostro a arena.`,
  guizo: (other, hook) => `Mano, é ${other} de verdade! Tô gravando — vem com ${hook} que isso vai pro site!`,
};

const INTRO_REPLIES = {
  kaiser: (other, hook) => `${other}, percebi ${hook}. Só não sei se devo confiar.`,
  arthur: (other, hook) => `Se ${hook} veio com você, é porque não deu pra deixar em casa, né, ${other}?`,
  joui: (other, hook) => `${other}, com ${hook} na conversa, acho que já entendi.`,
  aghata: (other, hook) => `${other}, eu estava curiosa sobre ${hook}. Agora estou mais ainda.`,
  dante: (other, hook) => `Entendo. Não esperava que você trouxesse ${hook}, ${other}.`,
  erin: (other, hook) => `${other}, posso olhar ${hook} depois? Prometo não desmontar.`,
  gal_sal: (other, hook) => `Não culpe ${hook}, ${other}. Você ainda pode escolher.`,
  kian: (other, hook) => `${other}, ${hook} não muda o que você decidiu.`,
  aguiar: (other, hook) => `Ha ha... você veio com ${hook}. Chamou minha atenção, ${other}.`,
  labirinto: (other, hook) => `${other}, então esse é o caminho que você escolheu com ${hook}.`,
  xande: (other, hook) => `Justo. Eu também trouxe meu jeito de fazer as coisas, ${other}.`,
  lirio: (other, hook) => `Então tu veio com ${hook}. A Leonora respeita isso, eu acho, ${other}.`,
  ferreiro: (other, hook) => `Entendo. ${hook} pode esperar enquanto conversamos, ${other}?`,
  juan: (other, hook) => `${other}, reconheço ${hook}. Ainda quero ouvir você.`,
  kemi: (other, hook) => `${other}, não vou tirar conclusões só por causa de ${hook}. O resto fica no relatório.`,
  balu: (other, hook) => `Hahaha! Tá bom, ${other}. Mas aviso: o tio Balu já lutou com coisa pior que ${hook}.`,
  arnaldo: (other, hook) => `Ah, ${other}, ${hook} rende um belo segundo ato. Vamos ver se você sabe as falas.`,
  verissimo: (other, hook) => `Anotado, ${other}. ${hook} não muda o plano. Nunca muda.`,
  jae: (other, hook) => `Que fofo, ${other}. Só ${hook}? Não grita, tá?`,
  dalmo: (other, hook) => `${hook}? Já apanhei de coisa pior na arena, ${other}. Segura aí.`,
  guizo: (other, hook) => `${hook}? ...Tá, eu tô com um pouco de medo. Mas a câmera tá ligada, ${other}!`,
};

const INTRO_EXCHANGES = {
  'kaiser+arthur': [
    { starter: 'arthur', line: 'Kaiser, você não precisa carregar tudo sozinho, filho.', response: 'kaiser', responseLine: 'Eu sei, pai. Só não aprendi a largar ainda.' },
    { starter: 'kaiser', line: 'Arthur, você sempre aparece quando alguém precisa de ajuda.', response: 'arthur', responseLine: 'E você sempre finge que não precisava, César.' },
  ],
  'kaiser+dante': [
    { starter: 'kaiser', line: 'Padre, dá pra gente conversar sem você transformar isso num sermão?', response: 'dante', responseLine: 'Dá. Mas você vai sentir falta do sermão depois, Kaiser.' },
    { starter: 'dante', line: 'Kaiser, ainda me chama de Padre quando quer mudar de assunto?', response: 'kaiser', responseLine: 'Só quando funciona, Padre.' },
  ],
  'kaiser+erin': [
    { starter: 'erin', line: 'Kaiser, ainda guardou a Nebulosa que eu te dei?', response: 'kaiser', responseLine: 'Guardei. E dessa vez eu li as instruções.' },
    { starter: 'kaiser', line: 'Erin, aquela Nebulosa continua sendo um presente ou uma ameaça?', response: 'erin', responseLine: 'Depende de como você usa. Eu fiz as duas coisas.' },
  ],
  'arthur+joui': [
    { starter: 'arthur', line: 'Joui, lembra quando você dizia que eu não sabia dançar?', response: 'joui', responseLine: 'Lembro. Você continua sem saber, Arthur-san.' },
    { starter: 'joui', line: 'Arthur-san, depois disso você ainda vai me pagar aquele lanche?', response: 'arthur', responseLine: 'Vou. Mas você escolhe um lugar que não tenha granadas, beleza?' },
  ],
  'arthur+aghata': [
    { starter: 'arthur', line: 'Agatha, você continua se metendo em problema que não é seu?', response: 'aghata', responseLine: 'E você continua tentando me proteger sem eu pedir.' },
    { starter: 'aghata', line: 'Arthur, não precisa fazer essa cara. Eu sei cuidar de mim.', response: 'arthur', responseLine: 'Eu sei, pequena. Mesmo assim, vou perguntar se está tudo bem.' },
  ],
  'arthur+gal_sal': [
    { starter: 'gal_sal', line: 'Arthur, ainda olha por cima do ombro quando eu chego?', response: 'arthur', responseLine: 'Aprendi que é melhor não dar as costas pra você, Gal.' },
    { starter: 'arthur', line: 'Gal, tem coisa que a gente precisa resolver olhando um pro outro.', response: 'gal_sal', responseLine: 'Então olha direito, Arthur. Eu não sou mais aquele garoto.' },
  ],
  'arthur+dante': [
    { starter: 'arthur', line: 'Dante, vai com calma nesses rituais aí, rabiscado.', response: 'dante', responseLine: 'Calma eu tenho, Arthur. Quem não tem é o lodo.' },
    { starter: 'dante', line: 'Arthur, você ainda chama isso de rabisco?', response: 'arthur', responseLine: 'Enquanto parecer rabisco, vou chamar.' },
  ],
  'kian+gal_sal': [
    { starter: 'gal_sal', line: 'Kian, eu lembro de cada coisa que você me fez fazer.', response: 'kian', responseLine: 'E ainda assim está aqui, Gal. Essa escolha é sua.' },
    { starter: 'kian', line: 'Gal, ainda procura um sentido em tudo que aconteceu?', response: 'gal_sal', responseLine: 'Não. Só quero que você pare de decidir por mim.' },
  ],
  'gal_sal+joui': [
    { starter: 'joui', line: 'Gal, você tirou de mim quem me criou. Eu não esqueci.', response: 'gal_sal', responseLine: 'Eu também não esqueci quem me deixou pra trás, Joui.' },
    { starter: 'gal_sal', line: 'Joui, você ainda acha que existe um jeito certo de fazer isso?', response: 'joui', responseLine: 'Acho que ainda dá pra escolher não machucar todo mundo.' },
  ],
  'dante+kian': [
    { starter: 'dante', line: 'Kian, você usou o Leo. Usou a minha infância inteira.', response: 'kian', responseLine: 'E você ainda tenta encontrar uma explicação que torne isso suportável.' },
    { starter: 'kian', line: 'Gaspar, ainda espera encontrar o Leo em tudo que eu faço?', response: 'dante', responseLine: 'Não. Mas não vou deixar você apagar o que ele foi.' },
  ],
  'dante+gal_sal': [
    { starter: 'gal_sal', line: 'Gaspar... ainda tenta salvar todo mundo?', response: 'dante', responseLine: 'Só quem ainda pode escolher, Gal.' },
    { starter: 'dante', line: 'Gal, o orfanato não precisa decidir quem você é agora.', response: 'gal_sal', responseLine: 'Fácil dizer isso quando você conseguiu sair de lá, Gaspar.' },
  ],
  'dante+aghata': [
    { starter: 'aghata', line: 'Dante, aquele grimório ainda está cheio de perguntas?', response: 'dante', responseLine: 'Está. Algumas respostas eu prefiro encontrar com você por perto.' },
    { starter: 'dante', line: 'Agatha, ainda chama isso de treino quando quase derruba a sala?', response: 'aghata', responseLine: 'Só quando a sala fica de pé no final.' },
  ],
  'erin+joui': [
    { starter: 'erin', line: 'Joui! Fiz uma granada nova pra você... quer ver de perto?', response: 'joui', responseLine: 'Erin... vai ficar tudo bem. Mas não joga isso em mim.' },
    { starter: 'joui', line: 'Erin, você ainda guarda a Sakura?', response: 'erin', responseLine: 'Claro. Foi feita pra você. E essa aqui também pode ser.' },
  ],
  'erin+gal_sal': [
    { starter: 'gal_sal', line: 'Eu lembro do seu cheiro de pólvora. E do seu sangue na Ereshkigal.', response: 'erin', responseLine: 'Então lembra também que eu escolhi o que fazer até o fim.' },
    { starter: 'erin', line: 'Gal, eu não esqueci o que aconteceu. Só não vou deixar isso falar por mim.', response: 'gal_sal', responseLine: 'Você sempre teve esse jeito de transformar dor em decisão.' },
  ],
  'kaiser+xande': [
    { starter: 'xande', line: 'Kaiser, Cinerária? Eu também sei mexer com essa névoa aí.', response: 'kaiser', responseLine: 'Então me conta, Xande: a sua também tem cheiro de lanche queimado?' },
    { starter: 'kaiser', line: 'Xande, ainda mistura skate e ritual como se fosse a coisa mais normal do mundo?', response: 'xande', responseLine: 'É normal pra mim, mano. Você que precisa sair um pouco da névoa.' },
  ],
  'guizo+xande': [
    { starter: 'xande', line: 'Gui! O cumprimento antes, né? Senão dá azar.', response: 'guizo', responseLine: 'Óbvio! Depois eu te bato. Com carinho. E gravando.' },
    { starter: 'guizo', line: 'Xande, depois dessa você me ajuda a editar o vídeo, tá?', response: 'xande', responseLine: 'Só se você me emprestar a câmera por uma semana, idiota.' },
  ],
  'guizo+lirio': [
    { starter: 'lirio', line: 'Ô Chiquinho! Para de me filmar e luta!', response: 'guizo', responseLine: 'Eu consigo fazer os dois, Lírio! É o que eu faço!' },
    { starter: 'guizo', line: 'Lírio, por que você nunca fica quieto numa missão?', response: 'lirio', responseLine: 'E você, Esquisito da Internet, por que filma TUDO?' },
  ],
  'lirio+xande': [
    { starter: 'lirio', line: 'Xande, sai da frente que hoje a Leonora tá com saudade!', response: 'xande', responseLine: 'Lírio, tu vai mesmo bater em mim com essa coisa? Mano...' },
    { starter: 'xande', line: 'Lírio, tu trouxe a Leonora de novo? Ela nunca tira folga?', response: 'lirio', responseLine: 'Ela tira quando quer, Xande. Hoje ela quis vir.' },
  ],
  'aguiar+aghata': [
    { starter: 'aguiar', line: 'Foi você que mexeu no meu corpo, bruxa?', response: 'aghata', responseLine: 'Eu emprestei. Devolvo quando terminar.' },
    { starter: 'aghata', line: 'Aguiar, você ainda está bravo com a troca de corpos?', response: 'aguiar', responseLine: 'Bravo? Ha ha... estou curioso pra saber o que mais você esconde.' },
  ],
  'aguiar+joui': [
    { starter: 'joui', line: 'Uma máscara não te torna maior, assassino.', response: 'aguiar', responseLine: 'Ha ha ha... diz isso pra sua.' },
    { starter: 'aguiar', line: 'Joui, você ainda acha que sabe quem está por trás da máscara?', response: 'joui', responseLine: 'Não preciso saber seu nome pra saber o que você faz.' },
  ],
  'aguiar+kaiser': [
    { starter: 'aguiar', line: 'Névoa não esconde cheiro, garoto.', response: 'kaiser', responseLine: 'Então vem me farejar, Aguiar.' },
    { starter: 'kaiser', line: 'Aguiar, você sempre fareja perigo antes de entrar num lugar?', response: 'aguiar', responseLine: 'Ha ha... só quando alguém tenta esconder alguma coisa.' },
  ],
  'aguiar+arthur': [
    { starter: 'arthur', line: 'Meu rifle já viu coisa pior. Tenta chegar perto, Aguiar.', response: 'aguiar', responseLine: 'Um braço só. Vai ser rápido.' },
    { starter: 'aguiar', line: 'Arthur, você aprendeu a mirar com um braço ou apesar dele?', response: 'arthur', responseLine: 'Aprendi a não desperdiçar tiro com pergunta boba.' },
  ],
  'aguiar+labirinto': [
    { starter: 'labirinto', line: 'Você chama de justiça o caminho que escolheu.', response: 'aguiar', responseLine: 'E você chama de caminho qualquer coisa que leve a Tenebris.' },
    { starter: 'aguiar', line: 'Labirinto, ainda acredita que toda pergunta tem uma saída?', response: 'labirinto', responseLine: 'Não. Algumas portas só servem pra mostrar quem está procurando.' },
  ],
  'arthur+balu': [
    { starter: 'balu', line: 'Arthur! Depois disso, macarrão? Eu pago. Quer dizer... a Ordem paga.', response: 'arthur', responseLine: 'Fechado, Balu. Mas dessa vez tu não pede três pratos.' },
    { starter: 'arthur', line: 'Balu, tu vai mesmo entrar de machado numa conversa?', response: 'balu', responseLine: 'Arthur, eu entro de machado até em velório. Nunca se sabe.' },
  ],
  'balu+dante': [
    { starter: 'balu', line: 'Dante, valeu pela orelha nova. A espiral até combina comigo.', response: 'dante', responseLine: 'Foi o que deu pra fazer com o que o Titã deixou, Balu.' },
    { starter: 'dante', line: 'Balu, você sabe que eu consertei esse machado, né? Não quebra de novo.', response: 'balu', responseLine: 'Não quebro. No máximo amasso um pouquinho em alguém.' },
  ],
  'aghata+balu': [
    { starter: 'aghata', line: 'Balu, você ainda se recusa a transcender?', response: 'balu', responseLine: 'Me recuso, Agatha. O meu Outro Lado é um bom churrasco.' },
    { starter: 'balu', line: 'Agatha, se esse livro morder, eu juro que corto ele no meio.', response: 'aghata', responseLine: 'Ele não morde. Eu, às vezes.' },
  ],
  'balu+joui': [
    { starter: 'balu', line: 'Joui, meu filho, tu come direito? Tá muito magro pra segurar essa espada.', response: 'joui', responseLine: 'Como, Balu-san. Só não como por três.' },
    { starter: 'joui', line: 'Balu-san, você sempre sorri antes de lutar?', response: 'balu', responseLine: 'Sempre. Se eu ficar sério, aí sim tu pode se preocupar.' },
  ],
  'balu+kian': [
    { starter: 'balu', line: 'Tu quebrou meu machado no meio, Kian. Isso eu não esqueço.', response: 'kian', responseLine: 'Quebrarei de novo. E você também.' },
    { starter: 'kian', line: 'Um homem que repudia o paranormal, carregando uma arma amaldiçoada. Previsível.', response: 'balu', responseLine: 'Previsível é a pancada que tu vai levar, Veríssimo— digo, Kian.' },
  ],
  'balu+juan': [
    { starter: 'balu', line: 'Foi tu, ou aquele bicho aí dentro, que amaldiçoou meu machado?', response: 'juan', responseLine: 'Nós dois, Balu. E você gostou do presente.' },
    { starter: 'juan', line: 'O Diabo lembra do seu machado no ombro dele, sabia?', response: 'balu', responseLine: 'Ótimo. Então ele já sabe onde vai doer de novo.' },
  ],
  'aguiar+jae': [
    { starter: 'jae', line: 'Aguiar, deixa o machado. Hoje eu quero brincar sozinha.', response: 'aguiar', responseLine: 'Ha ha... a parceira acordou com fome.' },
    { starter: 'aguiar', line: 'X. Ainda trancando gente na Casa Juno?', response: 'jae', responseLine: 'Só quem merece. Quer uma chave?' },
  ],
  'jae+kemi': [
    { starter: 'kemi', line: 'Jae. O Dalmo sabe que você está aqui?', response: 'jae', responseLine: 'O Colosso não manda em mim, Kemi. Ninguém manda.' },
    { starter: 'jae', line: 'Kemi, larga esse rifle. De perto é mais divertido.', response: 'kemi', responseLine: 'De perto não tem contrato. Só bagunça.' },
  ],
  'aguiar+dalmo': [
    { starter: 'aguiar', line: 'Dalmo! Trouxe mais passageiro pro acampamento?', response: 'dalmo', responseLine: 'Trouxe você, Aguiar. Desce no próximo ponto.' },
    { starter: 'dalmo', line: 'Larga o machado, delegado. Arena é no braço.', response: 'aguiar', responseLine: 'Ha ha... então vem, grandão.' },
  ],
  'dalmo+kemi': [
    { starter: 'kemi', line: 'Da última vez eu baixei o rifle, Dalmo.', response: 'dalmo', responseLine: 'Porque viu a Manu comigo. Hoje ela não tá aqui, Kemi.' },
    { starter: 'dalmo', line: 'Fui eu que te trouxe pro grupo, Kemi.', response: 'kemi', responseLine: 'E eu ainda não cobrei por isso.' },
  ],
  'dalmo+jae': [
    { starter: 'jae', line: 'Shh, Colosso. Você faz barulho demais.', response: 'dalmo', responseLine: 'E você some demais, Jae. Na arena não tem sombra.' },
    { starter: 'dalmo', line: 'Jae, a glória é minha hoje.', response: 'jae', responseLine: 'Fica com a glória. Eu fico com as costas.' },
  ],
  'arnaldo+verissimo': [
    { starter: 'verissimo', line: 'Arnaldo, você ainda segura a espada como se tivesse plateia.', response: 'arnaldo', responseLine: 'Sempre tem plateia, meu velho. Hoje é você.' },
    { starter: 'arnaldo', line: 'Cuide bem dessa espada quando for sua, Veríssimo.', response: 'verissimo', responseLine: 'Não fale assim. Eu ainda preciso de você na Ordem.' },
  ],
  'arnaldo+dante': [
    { starter: 'arnaldo', line: 'Dante! O menino do Santa Menefreda. Olha o tamanho que ficou.', response: 'dante', responseLine: 'O orfanato só ficou de pé por sua causa, Arnaldo. Eu não esqueço.' },
    { starter: 'dante', line: 'Arnaldo, você financiava o orfanato e nunca contou pra ninguém.', response: 'arnaldo', responseLine: 'Um bom ator sabe a hora de ficar fora do palco, Dante.' },
  ],
  'arnaldo+kian': [
    { starter: 'arnaldo', line: 'Eu perguntei à Magistrada como derrotar você, Kian. A resposta veio num relógio.', response: 'kian', responseLine: 'Então você já sabe o preço dessa resposta, ator.' },
    { starter: 'kian', line: 'Arnaldo Fritz. Uma fama inteira construída sobre uma mentira.', response: 'arnaldo', responseLine: 'A fama era o figurino. A Ordem sempre foi o papel.' },
  ],
  'kian+verissimo': [
    { starter: 'kian', line: 'Veríssimo. Eu conheço o fim de todos. O seu continua escondido.', response: 'verissimo', responseLine: 'E vai continuar, Kian. Esse segredo não é seu.' },
    { starter: 'verissimo', line: 'Da última vez eu parei o seu golpe com uma espada comum.', response: 'kian', responseLine: 'Da última vez eu não estava com pressa.' },
  ],
  'arthur+verissimo': [
    { starter: 'verissimo', line: 'Arthur, de pé. Missão nenhuma termina com agente sentado.', response: 'arthur', responseLine: 'Sim, senhor. Mas o senhor sabe que eu sento quando dá.' },
    { starter: 'arthur', line: 'Senhor Veríssimo, obrigado por aquela vez com o Kian.', response: 'verissimo', responseLine: 'Não agradeça. Só não me faça repetir.' },
  ],
  'balu+verissimo': [
    { starter: 'balu', line: 'Veríssimo! Voltei porque tu pediu. Agora não reclama do barulho.', response: 'verissimo', responseLine: 'Eu pedi o Balu inteiro, barulho incluído.' },
    { starter: 'verissimo', line: 'Balu, sem decisões precipitadas hoje.', response: 'balu', responseLine: 'Precipitado eu? Eu só chego antes do plano.' },
  ],
  'arnaldo+erin': [
    { starter: 'erin', line: 'Arnaldo, esse relógio de bolso... posso abrir?', response: 'arnaldo', responseLine: 'Esse não, Erin. Esse guarda a coisa mais preciosa que eu tenho.' },
    { starter: 'arnaldo', line: 'Erin, querida, granada não é adereço de cena.', response: 'erin', responseLine: 'Tudo é adereço de cena se você for corajoso o bastante.' },
  ],
  'labirinto+xande': [
    { starter: 'xande', line: 'Tá, eu não entendi o capacete. Mas vou passar por você.', response: 'labirinto', responseLine: 'Todo caminho passa por aqui. O seu também.' },
    { starter: 'labirinto', line: 'Xande, você sempre escolhe o caminho mais barulhento?', response: 'xande', responseLine: 'Só quando quero que meus amigos saibam onde estou.' },
  ],
};

function buildIntroDialogues() {
  const dialogues = Object.fromEntries(INTRO_IDS.map((id) => [id, {}]));
  for (let i = 0; i < INTRO_IDS.length; i++) {
    for (let j = i + 1; j < INTRO_IDS.length; j++) {
      const first = INTRO_IDS[i];
      const second = INTRO_IDS[j];
      const pairKey = [first, second].sort().join('+');
      const scenes = INTRO_EXCHANGES[pairKey] || [
        {
          starter: first,
          line: INTRO_OPENERS[first](CHARACTER_NAMES[second], INTRO_HOOKS[second]),
          response: second,
          responseLine: INTRO_REPLIES[second](CHARACTER_NAMES[first], INTRO_HOOKS[first]),
        },
        {
          starter: second,
          line: INTRO_OPENERS[second](CHARACTER_NAMES[first], INTRO_HOOKS[first]),
          response: first,
          responseLine: INTRO_REPLIES[first](CHARACTER_NAMES[second], INTRO_HOOKS[second]),
        },
      ];
      dialogues[first][second] = scenes;
      dialogues[second][first] = scenes;
    }
  }
  return dialogues;
}

export const INTRO_DIALOGUES = buildIntroDialogues();

// ---------------- FALAS DE VITÓRIA: [vencedor][derrotado] (ou .default)
export const VICTORY_LINES = {
  balu: {
    kaiser: [
      'Kaiser, garoto, tu luta bem. Só precisa comer mais.',
      'Essa névoa aí não segura um urso, Kaiser.'
    ],
    arthur: [
      'Foi mal, Arthur! O macarrão é por minha conta, prometo.',
      'Arthur, levanta. Ninguém vai saber que foi o tio Balu.'
    ],
    joui: [
      'Joui, meu filho, espada bonita. Mas machado é machado.',
      'Calma, Joui. Respira. Foi só um susto.'
    ],
    aghata: [
      'Desculpa, Agatha! Eu juro que mirei no livro.',
      'Agatha, tu é esperta demais. Por isso eu não deixei tu pensar.'
    ],
    dante: [
      'Desculpa, Dante. Mas tu que me ensinou a não ter medo de nada.',
      'Calma, Dante, respira. Já passou.'
    ],
    erin: [
      'Granada é bonito, Erin. Mas o tio Balu chega antes da explosão.',
      'Erin, guarda essas coisas antes que alguém se machuque. Tipo eu.'
    ],
    gal_sal: [
      'Corrente nenhuma segura esse machado, rapaz.',
      'Tu dança bonito, Gal. Pena que eu não sei dançar, só bater.'
    ],
    kian: [
      'Isso é pelo machado, Kian. O resto da conta a Ordem cobra.',
      'Quatro mil anos e ainda não aprendeu a desviar de um urso.'
    ],
    aguiar: [
      'Machado contra machado, delegado. O meu é maior.',
      'Tira essa máscara, Aguiar. Tu não assusta ninguém aqui.'
    ],
    labirinto: [
      'Eu não entendi nada do teu labirinto. Por isso fui reto.',
      'Saída? Eu fiz uma, ali na parede.'
    ],
    xande: [
      'Skate é legal, menino. Mas tu precisa de mais músculo.',
      'Bora, Xande, levanta. O tio Balu te paga um lanche.'
    ],
    lirio: [
      'Tu é forte, grandão! Mas o urso aqui é mais velho.',
      'Leonora e o Machado: empate técnico. Mas quem ficou de pé fui eu.'
    ],
    ferreiro: [
      'Tu é alto, Ferreiro. Mas cai igual a todo mundo.',
      'Espada de lodo, machado de sangue. Hoje o sangue ganhou.'
    ],
    juan: [
      'O Diabo me deu um machado novo. Eu só devolvi o favor.',
      'Fica tranquilo, Juan. Dói menos do que parece... eu acho.'
    ],
    kemi: [
      'Atiradora boa, menina. Mas eu já levei tiro à queima-roupa e tô aqui.',
      'Contrato cancelado, Kemi. O tio Balu não estava no orçamento.'
    ]
  },
  kaiser: {
    arthur: [
      'Arthur... você continua sendo uma das poucas pessoas que eu realmente não queria derrotar.',
      'Foi mal, Arthur. Se isso chegar nos seus pais, eu vou dizer que você tropeçou.'
    ],
    joui: [
      'Joui, eu sabia que você não ia facilitar. Só não sabia que ia terminar assim.',
      'Você me deu trabalho, Joui. Como sempre.'
    ],
    aghata: [
      'Agatha, o Arthur vai ficar bravo comigo por isso. Então vamos fingir que foi acidente.',
      'Desculpa, Agatha. Eu prometo que não vou contar pro Arthur como foi fácil... porque não foi.'
    ],
    dante: [
      'Dante, você pensa em dez possibilidades antes de agir. Eu só precisei de uma.',
      'Você analisou tudo, Dante. Só esqueceu de analisar o momento em que eu ia atacar.'
    ],
    erin: [
      'Essa vitória não foi explosiva pra você, Erin?',
      'Erin, eu esperava uma explosão. Recebi uma derrota. Acho que alguém perdeu o timing.'
    ],
    gal_sal: [
      'Gal, você já entrou nessa luta achando que sabia como ela terminaria. Esse foi seu primeiro erro.',
      'Você parecia muito confiante, Gal. Pena que confiança não muda o resultado.'
    ],
    kian: [
      'Você passou tempo demais achando que conhecia todas as respostas, Kian.',
      'Kian, você fala como se já soubesse o final de tudo. Dessa vez, não sabia.'
    ],
    aguiar: [
      'Aguiar, experiência é uma coisa. Saber quando está encurralado é outra.',
      'Você já viu muita coisa, Aguiar. Mas aparentemente ainda tinha uma surpresa guardada.'
    ],
    labirinto: [
      'Labirinto, você fechou todas as saídas. Só esqueceu que eu gosto de achar portas.',
      'Você construiu um labirinto inteiro e ainda assim terminou sem saída.'
    ],
    xande: [
      'Xande, você aguenta pancada pra caramba. Só não aguenta todas.',
      'Você bate forte, Xande. Eu só precisei garantir que a última pancada fosse minha.'
    ],
    lirio: [
      'Lírio, eu não vou perguntar como você consegue carregar essa marreta. Eu só vou comemorar que ela não me acertou.',
      'Lírio, aquela marreta é assustadora. Ainda bem que você não conseguiu usar direito.'
    ],
    ferreiro: [
      'Ferreiro, você é estranhamente tranquilo pra alguém que acabou de perder uma luta.',
      'Você encara a derrota com uma calma impressionante, Ferreiro. Eu não sei se admiro ou me preocupo.'
    ],
    juan: [
      'Juan, depois de tudo que eu já vi, você vai precisar de mais do que isso pra me assustar.',
      'Juan, eu já enfrentei coisa pior. Você só conseguiu me dar trabalho.'
    ],
    kemi: [
      'Kemi, você quase me pegou. Quase ainda conta como erro.',
      'Você foi rápida, Kemi. Mas eu só precisava acertar uma vez.'
    ],
    balu: [
      'Balu, você aguenta pancada demais. Ainda bem que a névoa não cansa.',
      'Fica deitado um pouco, Balu. Eu cuido do resto.'
    ]
  },

  arthur: {
    kaiser: [
      'César, foi mal, irmão. Hoje eu realmente precisava ganhar essa.',
      'Mano, eu gosto de você, mas dessa vez eu não ia deixar barato.'
    ],
    joui: [
      'Joui, eu vou fingir que você deixou eu ganhar. Facilita pros dois.',
      'Joui, você sabe que eu não ia conseguir comemorar isso sem te provocar um pouco.'
    ],
    aghata: [
      'Agatha, você é praticamente minha irmãzinha. Mas irmãzinha nenhuma ganha de mim hoje.',
      'Agatha, desculpa. Eu sei que você vai querer revanche depois dessa.'
    ],
    dante: [
      'Dante, eu sabia que você ia vir preparado. Só não sabia que eu ia ter que bater tanto em você.',
      'Você quase me pegou, Dante. E eu definitivamente não quero repetir essa luta tão cedo.'
    ],
    erin: [
      'Erin, eu tava esperando alguma explosão. Pelo menos a minha vitória veio sem incendiar nada.',
      'Erin, você quase explodiu metade do lugar. Ainda bem que eu terminei isso antes.'
    ],
    gal_sal: [
      'Gal, você pode ficar olhando torto. Eu continuo sendo o cara que ficou de pé.',
      'Gal, não adianta fazer essa cara. Você perdeu e eu ainda tô aqui.'
    ],
    kian: [
      'Kian, você gosta tanto de agir como se soubesse tudo. Hoje faltou uma resposta.',
      'Você fala como se todo mundo fosse previsível, Kian. Eu não sou.'
    ],
    aguiar: [
      'Aguiar, você luta sério demais. Ainda bem que eu também sei levar uma briga a sério.',
      'Aguiar, foi uma luta pesada. Respeito quem consegue chegar até esse ponto.'
    ],
    labirinto: [
      'Labirinto, eu não entendi metade do que você fez. Mas pelo menos entendi o final.',
      'Você tentou me deixar perdido, Labirinto. Só esqueceu que eu posso simplesmente continuar andando.'
    ],
    xande: [
      'Xande, você bate forte pra caramba. Ainda bem que eu também sei levantar.',
      'Xande, essa foi uma daquelas lutas que eu vou sentir amanhã.'
    ],
    lirio: [
      'Lírio, essa marreta é assustadora. O problema foi chegar perto o suficiente pra usar.',
      'Lírio, eu não vou mentir: eu passei metade da luta olhando pra essa marreta.'
    ],
    ferreiro: [
      'Ferreiro, você parece gente boa. Só não precisava ser tão difícil de derrubar.',
      'Você é tranquilo demais, Ferreiro. Pena que não foi tranquilo o bastante pra me vencer.'
    ],
    juan: [
      'Juan, eu já vi coisa muito mais estranha que você. Mas admito que essa foi uma luta e tanto.',
      'Juan, eu não sei exatamente o que você é, mas sei que acabou de perder.'
    ],
    kemi: [
      'Kemi, você quase me fez procurar de onde vinha o tiro. Quase.',
      'Kemi, você é rápida. Só não foi rápida o bastante dessa vez.'
    ],
    balu: [
      'Te devo um macarrão, Balu. Mas hoje quem paga é tu.',
      'Desculpa, véio. Um braço só, mas mira não falta.'
    ]
  },

  joui: {
    kaiser: [
      'César... desculpa, irmão. Dessa vez eu não consegui deixar você ganhar.',
      'César, você sabe que eu não queria te derrubar. Mas numa luta, eu não posso hesitar.'
    ],
    arthur: [
      'Arthur, foi mal! Na próxima você escolhe a música.',
      'Arthur, você sabe que eu vou ouvir piada sobre isso depois. Então deixa eu aproveitar enquanto posso.'
    ],
    aghata: [
      'Agatha, eu sabia que você não ia cair fácil. Ainda assim, eu precisava tentar.',
      'Agatha, você lutou muito bem. Só não conseguiu acompanhar hoje.'
    ],
    dante: [
      'Dante, você continua olhando pra tudo como se já soubesse o que vem depois. Hoje não.',
      'Dante, dessa vez não adiantou prever meus movimentos.'
    ],
    erin: [
      'Erin! Eu sabia que lutar contra você ia ser uma péssima ideia. Foi divertido mesmo assim.',
      'Erin, eu não sei se eu ganhei uma luta ou sobrevivi a uma explosão.'
    ],
    gal_sal: [
      'Gal... depois de tudo que aconteceu, eu não vou fingir que essa vitória não significa nada.',
      'Gal, eu não esqueci nada. E hoje você vai ter que encarar a derrota também.'
    ],
    kian: [
      'Você já tirou gente demais de mim, Kian. Hoje quem caiu foi você.',
      'Kian, você pode falar o que quiser. Eu não vou abaixar a cabeça pra você.'
    ],
    aguiar: [
      'Aguiar, você luta como alguém que já aprendeu a desconfiar de tudo. Eu respeito isso.',
      'Você não chegou até aqui por sorte, Aguiar. Foi uma luta difícil.'
    ],
    labirinto: [
      'Labirinto, você tentou me fazer correr em círculos. Eu só precisava chegar até você.',
      'Você pode mudar o caminho quantas vezes quiser. Uma hora eu encontro você.'
    ],
    xande: [
      'Xande, você é forte pra caramba. Mas eu não cheguei até aqui só na força.',
      'Xande, se eu tivesse tentado ganhar de você só na pancada, eu estaria no chão agora.'
    ],
    lirio: [
      'Lírio, essa marreta quase me mandou conhecer o Outro Lado de perto.',
      'Lírio, eu definitivamente não quero ficar do lado errado dessa marreta de novo.'
    ],
    ferreiro: [
      'Ferreiro, você é tranquilo demais pra alguém que bate desse jeito.',
      'Você luta com uma calma estranha, Ferreiro. Quase me fez esquecer o perigo.'
    ],
    juan: [
      'Juan, eu não sei exatamente o que você é. Só sei que hoje você ficou no chão.',
      'Juan, seja lá o que estiver por trás de você, hoje não foi suficiente.'
    ],
    kemi: [
      'Kemi, você quase me fez esquecer que uma luta pode terminar num segundo.',
      'Kemi, você espera o momento certo. Eu só precisei chegar primeiro.'
    ],
    balu: [
      'Balu-san, desculpe. Você ainda é o mais forte da sala.',
      'Força não basta, Balu-san. Precisa de silêncio também.'
    ]
  },

  aghata: {
    kaiser: [
      'César, você sempre parece estar calculando alguma coisa. Hoje eu fui mais rápida que a sua conta.',
      'Kaiser, você tentou prever meus movimentos. Eu mudei o plano no meio da luta.'
    ],
    arthur: [
      'Arthur, você é forte demais pra alguém que insiste em proteger todo mundo.',
      'Arthur, desculpa. Você sabe que eu não gosto de lutar contra você.'
    ],
    joui: [
      'Joui... eu sabia que você não ia cair fácil. Ainda assim, eu precisava tentar.',
      'Joui, você continua sendo difícil de acompanhar. Hoje eu consegui.'
    ],
    dante: [
      'Dante, você consegue ficar calmo até quando tudo está dando errado. Eu não consigo entender como.',
      'Dante, você ficou calmo até o fim. Eu só fui mais rápida.'
    ],
    erin: [
      'Erin, eu sabia que você ia tentar explodir alguma coisa. Só não sabia que seria você.',
      'Erin, por favor, da próxima vez avisa antes de transformar a luta numa zona de guerra.'
    ],
    gal_sal: [
      'Gal, eu já vi gente falar muito antes de fazer alguma coisa. Você não foi diferente.',
      'Você fala como se já tivesse vencido antes da luta começar. Esse foi o problema.'
    ],
    kian: [
      'Kian... seu broxa. Você fala como se soubesse tudo e ainda conseguiu perder.',
      'Ratinha pra cá, ratinha pra lá... e no fim foi você que acabou no chão, Kian.'
    ],
    aguiar: [
      'Aguiar, você tem experiência. Eu tenho sangue suficiente pra não deixar isso me parar.',
      'Você sabe lutar, Aguiar. Mas eu aprendi a não depender só de experiência.'
    ],
    labirinto: [
      'Labirinto, você pode mudar o caminho quantas vezes quiser. Eu ainda consigo te encontrar.',
      'Você tentou me fazer perder a direção. Só esqueceu que eu também posso mudar o caminho.'
    ],
    xande: [
      'Xande, força não resolve tudo. Principalmente quando eu não deixo você chegar perto.',
      'Você tentou ganhar na força, Xande. Eu preferi não deixar você chegar perto.'
    ],
    lirio: [
      'Lírio, essa marreta parece muito mais assustadora quando não está acertando minha cabeça.',
      'Lírio, eu admito: essa marreta me deu medo. Mas você ainda precisava acertar.'
    ],
    ferreiro: [
      'Ferreiro, você é assustador... mas estranhamente educado pra alguém que acabou de tentar me matar.',
      'Você é uma pessoa estranha, Ferreiro. Até perdendo você parece tranquilo.'
    ],
    juan: [
      'Juan, eu não preciso entender o que você é pra saber onde te machucar.',
      'Juan, eu não sei o que existe dentro de você. Mas descobri onde derrubar.'
    ],
    kemi: [
      'Kemi, você passou a luta inteira tentando desaparecer. Eu só precisei esperar.',
      'Você é boa em se esconder, Kemi. Só não é boa o bastante pra desaparecer de mim.'
    ],
    balu: [
      'Força física é ótima, Balu. Ritual é melhor.',
      'Te avisei que esse machado ia te dar dor de cabeça.'
    ]
  },

  dante: {
    kaiser: [
      'César, você continua tentando encontrar uma saída para tudo. Desta vez, não encontrou.',
      'César, você costuma encontrar soluções. Hoje eu não deixei nenhuma disponível.'
    ],
    arthur: [
      'Arthur, você lutou até o fim. Eu esperava exatamente isso de você.',
      'Arthur, sua determinação não mudou nem quando a derrota ficou evidente.'
    ],
    joui: [
      'Joui, sua determinação continua sendo uma das coisas mais difíceis de enfrentar.',
      'Joui, você continua avançando mesmo quando deveria recuar. É admirável.'
    ],
    aghata: [
      'Agatha, você já passou por coisas suficientes. Ainda assim, continua de pé. Isso é admirável.',
      'Agatha, você não desistiu nem quando a luta já parecia perdida.'
    ],
    erin: [
      'Erin, eu deveria ter previsto que você faria alguma coisa completamente imprevisível.',
      'Erin, admitir que eu não previ isso é provavelmente a parte mais irritante dessa vitória.'
    ],
    gal_sal: [
      'Gal, você fala com muita convicção. Convicção não impede uma derrota.',
      'Gal, confiança é útil. Quando acompanhada de precisão, é ainda melhor.'
    ],
    kian: [
      'Kian, você fala do inevitável como se tivesse inventado o conceito.',
      'Kian, você está acostumado a falar como se o resultado já estivesse decidido. Hoje não estava.'
    ],
    aguiar: [
      'Aguiar, você observa antes de agir. Isso o torna perigoso. Hoje, porém, não foi suficiente.',
      'Aguiar, sua experiência tornou essa luta difícil. Não impossível.'
    ],
    labirinto: [
      'Labirinto, há caminhos que parecem infinitos até encontrarmos a saída.',
      'Você criou caminhos demais, Labirinto. Em algum momento, um deles precisaria terminar.'
    ],
    xande: [
      'Xande, sua força é impressionante. Mas força sem precisão deixa muitas aberturas.',
      'Xande, você tem poder suficiente para vencer. Só precisava acertar.'
    ],
    lirio: [
      'Lírio, sua solução para quase tudo parece ser a mesma: bater mais forte.',
      'Lírio, devo admitir que sua estratégia é simples. E surpreendentemente perigosa.'
    ],
    ferreiro: [
      'Ferreiro, você encara a derrota com uma tranquilidade incomum. Eu respeito isso.',
      'Você parece confortável demais com a ideia de perder, Ferreiro.'
    ],
    juan: [
      'Juan, sua natureza pode ser difícil de compreender. Sua derrota, não.',
      'Juan, eu não preciso compreender completamente você para saber como vencê-lo.'
    ],
    kemi: [
      'Kemi, você passou tempo demais observando minhas mãos. Deveria ter observado meus pés.',
      'Kemi, você percebeu meu ataque tarde demais.'
    ],
    balu: [
      'Sem orelha e agora sem fôlego. Descansa, Balu.',
      'Eu conserto o machado de novo. Mas você fica parado.'
    ]
  },

  erin: {
    kaiser: [
      'César, você é difícil de derrubar! Ainda bem que eu trouxe criatividade.',
      'César, eu sabia que você ia dar trabalho. Só não sabia que ia ser tanto!'
    ],
    arthur: [
      'Arthur! Eu gosto de você, mas amizade não dá ponto extra na luta.',
      'Arthur, nada pessoal! Tá, talvez um pouquinho pessoal.'
    ],
    joui: [
      'Joui! Eu sabia que você ia dar trabalho. Ainda bem que eu adoro uma competição.',
      'Joui, você é rápido! Mas eu sou mais criativa.'
    ],
    aghata: [
      'Agatha, você é assustadora quando fica séria. Eu quase esqueci que era uma luta.',
      'Agatha, você ficou séria demais! Eu tive que compensar com o dobro de caos.'
    ],
    dante: [
      'Dante, você pensa demais! Às vezes é melhor só sair correndo e ver o que acontece.',
      'Dante, você quase previu tudo. O problema é que eu nem eu sabia o que ia fazer.'
    ],
    gal_sal: [
      'Gal, você queria uma luta séria. Eu trouxe exatamente o contrário.',
      'Gal, você parecia tão sério... foi quase divertido demais.'
    ],
    kian: [
      'Kian, você realmente acha que sabe tudo? Que pena. Acabei de te ensinar uma coisa.',
      'Kian, você fala como se tivesse todas as respostas. Eu tenho uma: kabum. Bem, não literalmente.'
    ],
    aguiar: [
      'Aguiar, você tem cara de quem já viu todo tipo de maluquice. Aposto que essa foi nova.',
      'Aguiar, você já enfrentou muita coisa estranha. Espero que tenha gostado dessa.'
    ],
    labirinto: [
      'Labirinto! Eu não entendi seu plano, mas gostei da parte em que você perdeu.',
      'Labirinto, eu me perdi umas três vezes. Ainda assim, achei você no final!'
    ],
    xande: [
      'Xande, você é praticamente uma parede! Uma parede que eu consegui derrubar.',
      'Xande, você aguenta pancada demais! Eu precisei ser criativa.'
    ],
    lirio: [
      'Lírio, essa marreta é ENORME! Eu achei que ia precisar correr pra sempre.',
      'Lírio, você quase acertou essa coisa em mim! Eu ainda estou comemorando que não acertou.'
    ],
    ferreiro: [
      'Ferreiro, você é muito grande! Ainda bem que explosão não precisa pedir licença.',
      'Ferreiro, eu acho que você e eu temos definições muito diferentes de uma luta tranquila.'
    ],
    juan: [
      'Juan, eu não faço ideia do que você é. Mas foi muito divertido te derrubar.',
      'Juan, isso foi estranho até pros meus padrões. E olha que meus padrões são baixos.'
    ],
    kemi: [
      'Kemi, você quase me acertou! Isso foi assustador. Faz de novo depois.',
      'Kemi, você é assustadoramente rápida. Eu gostei.'
    ],
    balu: [
      'Desculpa, Balu! A granada era pro outro lado, juro.',
      'Tamanho não segura explosão, grandão.'
    ]
  },

  gal_sal: {
    kaiser: [
      'César, você sempre parece estar procurando a próxima jogada. Eu só precisei esperar você escolher.',
      'Você tenta calcular cada movimento, César. Eu apenas esperei o erro.'
    ],
    arthur: [
      'Arthur, você insiste em levantar. É uma qualidade admirável. Também é cansativa.',
      'Arthur, sua persistência é impressionante. Pena que não foi suficiente.'
    ],
    joui: [
      'Joui, você ainda luta como se tivesse algo a provar. Eu já sei exatamente do que você é capaz.',
      'Joui, você não mudou tanto quanto pensa. A diferença é que agora eu sei o que esperar.'
    ],
    aghata: [
      'Agatha, você aprendeu bastante desde que nos conhecemos. Ainda não o suficiente.',
      'Você evoluiu, Agatha. Eu seria um tolo se ignorasse isso. Ainda assim, você perdeu.'
    ],
    dante: [
      'Dante, essa sua calma é interessante. Quero saber quanto dela sobra depois de perder.',
      'Dante, você manteve a compostura até o fim. Isso merece respeito.'
    ],
    erin: [
      'Erin... você continua gostando de explosões. Pena que dessa vez não conseguiu fazer uma.',
      'Erin, seu caos quase funcionou. Quase.'
    ],
    kian: [
      'Kian, você passou a vida tratando pessoas como peças. Não esqueça que peças também podem quebrar o tabuleiro.',
      'Você gosta de mover todos ao seu redor, Kian. Dessa vez alguém moveu você.'
    ],
    aguiar: [
      'Aguiar, você não hesita. Eu respeito isso. Só não confunda respeito com misericórdia.',
      'Você não hesitou nem por um segundo, Aguiar. Foi por isso que a luta durou tanto.'
    ],
    labirinto: [
      'Labirinto, você gosta de esconder o caminho. Eu gosto de cortar caminho.',
      'Você tornou o caminho complicado. Não necessariamente difícil.'
    ],
    xande: [
      'Xande, força é ótima. Principalmente quando você sabe onde acertar.',
      'Xande, sua força seria assustadora se eu tivesse deixado você usá-la.'
    ],
    lirio: [
      'Lírio, você realmente acha que uma marreta resolve qualquer problema?',
      'Lírio, sua marreta é impressionante. Sua estratégia, nem tanto.'
    ],
    ferreiro: [
      'Ferreiro, você tem uma tranquilidade curiosa para alguém que acabou de perder.',
      'Você aceita a derrota com muita facilidade, Ferreiro. Isso é raro.'
    ],
    juan: [
      'Juan, você sorri demais para alguém que acabou de descobrir que pode perder.',
      'Juan, esse sorriso desapareceu rápido.'
    ],
    kemi: [
      'Kemi, você fala pouco. Ainda assim, eu consegui entender exatamente o que você faria.',
      'Você tentou ser imprevisível, Kemi. Não foi suficiente.'
    ],
    balu: [
      'Um urso acorrentado. Que imagem bonita.',
      'Você protege todo mundo, Balu. Quem protege você?'
    ]
  },

  kian: {
    kaiser: [
      'César, você sempre tentou transformar o impossível em um problema que pudesse resolver. Hoje não havia solução.',
      'Você procura lógica onde ela não existe, César. Foi isso que o fez perder.'
    ],
    arthur: [
      'Arthur, você continua protegendo pessoas que inevitavelmente perderá. É uma escolha curiosa.',
      'Você insiste em proteger todos ao seu redor. Um dia descobrirá o preço disso.'
    ],
    joui: [
      'Seu Anjo está queimando no inferno, Joui. E mesmo assim você continua fingindo que pode salvá-lo.',
      'Joui, você chama isso de coragem. Eu vejo apenas alguém incapaz de aceitar o que perdeu.'
    ],
    aghata: [
      'Ratinha... você ainda corre atrás de respostas que não consegue compreender.',
      'Ratinha, você continua tentando parecer maior do que é.'
    ],
    dante: [
      'Dante, tanto conhecimento acumulado e ainda assim você permanece preso às mesmas limitações.',
      'Você estudou tanto, Dante. E mesmo assim não encontrou uma maneira de me vencer.'
    ],
    erin: [
      'Erin, até o seu caos possui padrões. E tudo que possui um padrão pode ser compreendido.',
      'Seu caos é previsível, Erin. Só demorou um pouco para eu perceber.'
    ],
    gal_sal: [
      'Gal, você passou tanto tempo tentando servir a um propósito que esqueceu de descobrir se ele era seu.',
      'Você confunde propósito com submissão, Gal. É por isso que continua preso.'
    ],
    aguiar: [
      'Aguiar, experiência é uma ferramenta. Contra mim, ela é apenas mais uma ferramenta inútil.',
      'Você acumulou experiência durante anos. Eu existo há muito mais tempo.'
    ],
    labirinto: [
      'Labirinto, você passou tanto tempo procurando caminhos que esqueceu de perguntar onde eles terminavam.',
      'Você criou caminhos demais. Eu simplesmente escolhi aquele que levava à sua derrota.'
    ],
    xande: [
      'Xande, força física é uma solução bastante simples para um problema que não é.',
      'Você tentou resolver algo complexo usando apenas força. Era previsível.'
    ],
    lirio: [
      'Lírio, sua marreta pode destruir muitas coisas. Conhecimento não é uma delas.',
      'Você pode quebrar pedra, Lírio. Não pode quebrar aquilo que não entende.'
    ],
    ferreiro: [
      'Ferreiro, você representa a morte. Eu passei tempo demais aprendendo o que existe além dela.',
      'Você conhece a morte. Eu conheço aquilo que está além dela.'
    ],
    juan: [
      'Juan, você chama isso de poder. Eu chamaria de mais uma consequência da ignorância.',
      'Você possui poder, Juan. Isso não significa que compreenda o que ele é.'
    ],
    kemi: [
      'Kemi, você aprendeu a sobreviver escondida. Não confunda sobrevivência com liberdade.',
      'Você sabe desaparecer, Kemi. Mas não pode desaparecer de alguém como eu.'
    ],
    balu: [
      'O machado quebrou uma vez. O homem quebra do mesmo jeito.',
      'Força bruta. A forma mais antiga e mais previsível de perder.'
    ]
  },

  aguiar: {
    kaiser: [
      'Kaiser, você é bom. Mas eu aprendi faz tempo a não dar uma segunda chance.',
      'Você é habilidoso, Kaiser. Só não foi cuidadoso o bastante.'
    ],
    arthur: [
      'Arthur, você lutou bem. Agora levanta, respira e aprende com isso.',
      'Boa luta, Arthur. Você tem muito mais força do que parece.'
    ],
    joui: [
      'Joui, velocidade é ótima. Saber quando parar é melhor.',
      'Você é rápido, Joui. Mas velocidade sem controle abre espaço.'
    ],
    aghata: [
      'Agatha, você tem força de sobra. Só precisa escolher melhor quando gastar.',
      'Você tem coragem, Agatha. Só precisa aprender quando transformar coragem em estratégia.'
    ],
    dante: [
      'Dante, você é perigoso. Foi por isso que eu não deixei você ditar o ritmo.',
      'Eu sabia que você seria um problema, Dante. Por isso não te dei tempo.'
    ],
    erin: [
      'Erin, você quase transformou isso numa bagunça. Quase.',
      'Erin, você quase me pegou no meio daquela confusão.'
    ],
    gal_sal: [
      'Gal, ameaça não me impressiona. Resultado também não se anuncia.',
      'Você gosta de parecer perigoso, Gal. Eu prefiro simplesmente fazer o trabalho.'
    ],
    kian: [
      'Kian, conhecer o paranormal não significa saber lutar contra alguém.',
      'Você sabe muita coisa, Kian. Mas saber não é o mesmo que vencer.'
    ],
    labirinto: [
      'Labirinto, você tentou conduzir a luta. Eu só conduzi você até o fim.',
      'Você controlou o terreno. Eu controlei o combate.'
    ],
    xande: [
      'Xande, você tem força de sobra. Técnica fez a diferença hoje.',
      'Você bate forte, Xande. Eu só fui mais preciso.'
    ],
    lirio: [
      'Lírio, eu já vi muita gente grande cair. Você não seria o primeiro.',
      'Essa marreta é pesada, Lírio. Mas não pesa tanto quanto uma abertura.'
    ],
    ferreiro: [
      'Ferreiro, não precisa levar pro lado pessoal. Foi só uma luta.',
      'Boa luta, Ferreiro. Você aguenta mais do que parece.'
    ],
    juan: [
      'Juan, seja lá qual for sua forma, a regra continua a mesma: não deixe o adversário chegar perto.',
      'Juan, eu não preciso saber o que você é. Só preciso saber como derrubar você.'
    ],
    kemi: [
      'Kemi, você sabe esperar. Eu também.',
      'Você esperou pelo momento certo, Kemi. Eu também estava esperando.'
    ],
    balu: [
      'Ha ha... urso grande, pele grossa. Dá mais trabalho, só isso.',
      'Machado bonito, Balu. Vai ficar ótimo na minha coleção.'
    ]
  },

  labirinto: {
    kaiser: [
      'Kaiser, você procurou uma saída. Eu só precisei mudar a porta.',
      'Você encontrou muitas portas, Kaiser. Nenhuma levava para onde precisava.'
    ],
    arthur: [
      'Arthur, você continua sorrindo mesmo quando não entende o caminho. Interessante.',
      'Arthur, você não precisa entender o caminho para continuar andando. Isso é raro.'
    ],
    joui: [
      'Joui, você correu bastante. No fim, chegou exatamente onde eu queria.',
      'Você tentou fugir do caminho, Joui. O caminho já tinha escolhido você.'
    ],
    aghata: [
      'Agatha, você tentou quebrar meu ritmo. Eu só mudei o caminho.',
      'Você percebeu o truque, Agatha. Só não percebeu o próximo.'
    ],
    dante: [
      'Dante, você entende muitas coisas. Hoje não entendeu esta.',
      'Você procurou uma explicação, Dante. Algumas coisas não precisam de uma.'
    ],
    erin: [
      'Erin, você procurou lógica demais onde não existia nenhuma.',
      'Erin, você tentou transformar o labirinto em um experimento. Ele não colaborou.'
    ],
    gal_sal: [
      'Gal, você gosta de controlar o caminho. Eu gosto quando alguém tenta fazer isso.',
      'Você gosta de acreditar que escolhe o caminho, Gal. Nem sempre escolhe.'
    ],
    kian: [
      'Kian, até você pode se perder quando o caminho deixa de obedecer.',
      'Você conhece muitos caminhos, Kian. Hoje nenhum deles serviu.'
    ],
    aguiar: [
      'Aguiar, experiência deixa rastros. Eu só precisei seguir os seus.',
      'Você deixou poucas pistas, Aguiar. Foram suficientes.'
    ],
    xande: [
      'Xande, você tentou atravessar tudo pela força. Eu só movi a passagem.',
      'Você tentou quebrar o caminho, Xande. Eu simplesmente mudei o caminho.'
    ],
    lirio: [
      'Lírio, você gosta de abrir portas. Hoje nenhuma delas levou até mim.',
      'Você pode quebrar portas, Lírio. Isso não significa que encontrará a saída.'
    ],
    ferreiro: [
      'Ferreiro, até a morte precisa encontrar um caminho para chegar.',
      'Você conhece o fim, Ferreiro. Eu conheço os caminhos que levam até ele.'
    ],
    juan: [
      'Juan, você entrou achando que conhecia o lugar. Agora conhece a saída.',
      'Você entrou confiante, Juan. Saiu sabendo que estava perdido.'
    ],
    kemi: [
      'Kemi, você sabe se esconder. Eu sei procurar.',
      'Você quase desapareceu de mim, Kemi. Quase.'
    ],
    balu: [
      'Você foi reto. O labirinto não tem reta.',
      'A força te trouxe até a porta. Não te deu a chave.'
    ]
  },

  xande: {
    kaiser: [
      'Kaiser, você aguenta bastante. Mas eu também sei bater.',
      'Kaiser, você é resistente. Só não mais que eu.'
    ],
    arthur: [
      'Arthur, foi mal, mano. Essa luta foi boa demais pra eu aliviar.',
      'Arthur, você é gente boa. Mas quando começa a luta, eu não seguro a mão.'
    ],
    joui: [
      'Joui, você é rápido pra caramba! Só não conseguiu escapar de tudo.',
      'Joui, você quase me fez correr atrás de você a luta inteira.'
    ],
    aghata: [
      'Agatha, você veio com vontade. Eu gosto de quem não foge.',
      'Agatha, você não arregou nem quando ficou difícil. Respeito isso.'
    ],
    dante: [
      'Dante, esses seus truques são sinistros. Ainda assim, eu consegui te acertar.',
      'Dante, eu não entendi metade dos seus movimentos. Só precisei acertar a outra metade.'
    ],
    erin: [
      'Erin, nunca vi alguém tão feliz em transformar uma luta numa explosão.',
      'Erin, você conseguiu fazer barulho suficiente por dez pessoas.'
    ],
    gal_sal: [
      'Gal, falar é fácil. Quero ver levantar depois dessa.',
      'Gal, pode parar de olhar assim. A luta já acabou.'
    ],
    kian: [
      'Kian, você sabe muita coisa. Eu só precisava saber bater.',
      'Kian, você fala difícil demais. Eu prefiro resolver no soco.'
    ],
    aguiar: [
      'Aguiar, você luta sério. Foi bom encontrar alguém que não fica de brincadeira.',
      'Aguiar, essa foi uma luta de verdade. Gostei.'
    ],
    labirinto: [
      'Labirinto, eu não preciso entender o caminho. Só preciso abrir passagem.',
      'Você pode mudar o caminho, Labirinto. Eu posso quebrar o que estiver na frente.'
    ],
    lirio: [
      'Lírio... essa foi briga de verdade. Gostei.',
      'Lírio, agora sim! Uma luta que valeu cada pancada.'
    ],
    ferreiro: [
      'Ferreiro, você é grande. Eu ainda sou mais teimoso.',
      'Você aguenta pancada, Ferreiro. Mas eu também.'
    ],
    juan: [
      'Juan, não importa o que você virou. Se dá pra acertar, dá pra derrubar.',
      'Juan, seja lá o que você virou, ainda dá pra te derrubar.'
    ],
    kemi: [
      'Kemi, você é rápida demais! Quase me fez correr atrás de você.',
      'Kemi, você quase desapareceu antes que eu conseguisse acertar.'
    ],
    balu: [
      'Desculpa, tio Balu! O skate pegou mais forte do que eu queria.',
      'Por eles... e um pouquinho por mim também.'
    ]
  },

  lirio: {
    kaiser: [
      'César, você é um cabra difícil de derrubar. Mas eu sou mais teimoso.',
      'César, você deu trabalho, rapaz. Mas uma hora a marreta encontra o caminho.'
    ],
    arthur: [
      'Arthur, rapaz, você luta bem! Só que hoje a marreta falou mais alto.',
      'Arthur, você é bom de briga. Mas hoje não foi seu dia.'
    ],
    joui: [
      'Joui, você corre que nem um danado. Mas uma hora tinha que parar.',
      'Joui, menino, você quase me fez cansar só de correr atrás.'
    ],
    aghata: [
      'Agatha, você é valente! Pena que valentia não segura pancada.',
      'Agatha, gostei da sua coragem. Só faltou ela aguentar a marreta.'
    ],
    dante: [
      'Dante, você pensa demais. Enquanto pensa, eu bato.',
      'Dante, enquanto você calculava, eu já estava com a marreta descendo.'
    ],
    erin: [
      'Erin, eu nunca vi alguém gostar tanto de explosão. Quase fiquei com medo!',
      'Erin, menina, você fez mais barulho que a minha marreta!'
    ],
    gal_sal: [
      'Gal, pode parar com essa cara. Aqui não tem mistério: eu ganhei.',
      'Gal, não precisa fazer essa cara feia. Foi uma boa luta.'
    ],
    kian: [
      'Kian, você fala bonito demais pra quem acabou de levar uma marretada.',
      'Kian, rapaz, pode explicar o paranormal depois. Agora fica no chão.'
    ],
    aguiar: [
      'Aguiar, gostei da luta! Mas hoje quem ficou de pé fui eu.',
      'Aguiar, você sabe lutar. Mas eu sei bater mais forte.'
    ],
    labirinto: [
      'Labirinto, eu não preciso achar o caminho. Eu abro um.',
      'Você pode esconder a saída. Eu faço outra.'
    ],
    xande: [
      'Xande, ô rapaz... essa foi briga de verdade!',
      'Xande, agora sim eu achei alguém que aguenta uma pancada!'
    ],
    ferreiro: [
      'Ferreiro, você parece gente boa. Mas não vou deixar de te derrubar por isso.',
      'Ferreiro, nada pessoal, rapaz. Uma luta é uma luta.'
    ],
    juan: [
      'Juan, não sei que diabo você é. Só sei que minha marreta acertou.',
      'Juan, você é esquisito demais. Ainda bem que minha marreta não faz perguntas.'
    ],
    kemi: [
      'Kemi, menina, você some ligeiro! Ainda bem que eu acertei quando apareceu.',
      'Kemi, você é ligeira que só. Mas uma hora aparece no lugar errado.'
    ],
    balu: [
      'A Leonora gostou de você, Balu. Bate igual a ela.',
      'Parede contra urso. A parede ficou.'
    ]
  },

  ferreiro: {
    kaiser: [
      'César, rapaz... você lutou muito bem. Só não precisava continuar depois que já tinha perdido.',
      'César, você é resistente. Foi uma boa luta, rapaz.'
    ],
    arthur: [
      'Arthur, você tem um coração forte. Foi uma boa luta, rapaz.',
      'Arthur, você protege os outros até quando devia pensar em si mesmo.'
    ],
    joui: [
      'Joui, você luta com muita vontade. Não deixe uma derrota tirar isso de você.',
      'Joui, essa determinação sua é coisa rara. Continue assim.'
    ],
    aghata: [
      'Agatha, você é determinada. O Arthur não exagerava quando falava de você.',
      'Agatha, você é mais forte do que parece. Não deixe essa derrota te convencer do contrário.'
    ],
    dante: [
      'Dante, você sempre parece estar pensando em alguma coisa. Eu respeito essa calma.',
      'Dante, você luta com uma calma que eu não vejo em muita gente.'
    ],
    erin: [
      'Erin, você é barulhenta demais! Mas confesso que essa energia é difícil de não gostar.',
      'Erin, menina, você consegue transformar qualquer luta numa festa.'
    ],
    gal_sal: [
      'Gal, você parece carregar coisa demais dentro de si. Hoje pode descansar um pouco.',
      'Gal, você parece estar lutando contra mais do que só o adversário.'
    ],
    kian: [
      'Kian, você fala como se soubesse o destino de todo mundo. Eu não compro essa conversa.',
      'Kian, rapaz, conhecer o destino não significa controlar tudo.'
    ],
    aguiar: [
      'Aguiar, você luta com experiência. Foi uma luta honesta.',
      'Aguiar, você tem muita estrada. Foi bom enfrentar alguém assim.'
    ],
    labirinto: [
      'Labirinto, não entendi metade do que você fez. Mas gostei do desafio.',
      'Você gosta de complicar as coisas, Labirinto. Às vezes o caminho simples também funciona.'
    ],
    xande: [
      'Xande, rapaz, você bate forte! Foi uma boa pancadaria.',
      'Xande, você tem força de sobra. Foi difícil ficar de pé contra você.'
    ],
    lirio: [
      'Lírio, você é tão barulhento quanto forte. Gostei de lutar com você.',
      'Lírio, essa sua marreta faz um barulho que ninguém esquece.'
    ],
    juan: [
      'Juan, você parece carregar algo muito pesado consigo. Espero que um dia consiga largar.',
      'Juan, tem alguma coisa em você que parece estar sempre procurando uma saída.'
    ],
    kemi: [
      'Kemi, você luta como alguém que aprendeu cedo a não depender de ninguém.',
      'Kemi, você aprendeu a lutar sozinha. Espero que um dia não precise mais.'
    ],
    balu: [
      'Força e fé, Balu. Faltou a fé.',
      'Santo Berço não cai para um homem só.'
    ]
  },

  juan: {
    kaiser: [
      'César, você ainda procura uma explicação pra tudo. Que adorável.',
      'Você tenta entender tudo antes de agir, César. Eu prefiro agir primeiro.'
    ],
    arthur: [
      'Arthur, esse sorriso continua aí? Você realmente é difícil de quebrar.',
      'Arthur, você continua sorrindo mesmo depois de perceber que perdeu.'
    ],
    joui: [
      'Joui, você insiste em lutar mesmo quando sabe que está perdendo. Coragem ou teimosia?',
      'Joui, você não sabe quando parar. Talvez seja isso que torna você interessante.'
    ],
    aghata: [
      'Agatha, você não hesitou. Eu gosto disso em uma presa.',
      'Agatha, você não fugiu. Pelo menos isso tornou a luta interessante.'
    ],
    dante: [
      'Dante, você tenta esconder muito bem o que sente. Eu ainda consigo perceber.',
      'Dante, você é bom em esconder emoções. Não tão bom em esconder intenções.'
    ],
    erin: [
      'Erin, você gosta de explosões? Que coincidência... eu gosto de ver coisas se desfazerem.',
      'Erin, você transforma tudo em caos. Eu simplesmente deixo o caos terminar o trabalho.'
    ],
    gal_sal: [
      'Gal, você tem tanta certeza de si. É quase uma pena estragar isso.',
      'Gal, confiança demais costuma deixar uma abertura enorme.'
    ],
    kian: [
      'Kian, você acredita que conhece todas as respostas. Eu gosto mais das perguntas.',
      'Você gosta de falar como se o mundo já tivesse sido explicado, Kian. Que limitado.'
    ],
    aguiar: [
      'Aguiar, você já enfrentou monstros antes. Talvez ainda não tenha entendido o que está diante de você.',
      'Você já viu muita coisa, Aguiar. Mas ainda não viu tudo.'
    ],
    labirinto: [
      'Labirinto, você gosta de esconder as coisas. Eu gosto de encontrá-las.',
      'Você constrói caminhos para ninguém encontrar você. Eu achei mesmo assim.'
    ],
    xande: [
      'Xande, você tentou resolver tudo com força. Eu simplesmente mudei as regras.',
      'Força não adianta quando o jogo muda, Xande.'
    ],
    lirio: [
      'Lírio, você tem uma maneira muito simples de resolver problemas. Admito que é divertida.',
      'Lírio, eu gosto dessa sua solução para tudo. Pena que hoje ela falhou.'
    ],
    ferreiro: [
      'Ferreiro... você conhece a morte. Eu conheço algo um pouco mais interessante.',
      'Ferreiro, você encara a morte como se ela fosse o fim. Eu não tenho tanta certeza.'
    ],
    kemi: [
      'Kemi, você me olhou a luta inteira como se estivesse calculando um contrato.',
      'Kemi, você observa demais. Às vezes é melhor agir antes.'
    ],
    balu: [
      'O machado ainda é meu, Balu. Você só empresta.',
      'Doeu? Que bom. O sangue lembra.'
    ]
  },

  kemi: {
    kaiser: [
      'Kaiser, você demorou demais pra decidir. Eu não.',
      'Você hesitou por meio segundo, Kaiser. Foi o bastante.'
    ],
    arthur: [
      'Arthur, você tenta deixar todo mundo confortável. Comigo isso não funciona.',
      'Você tenta proteger todo mundo, Arthur. Eu só precisei esperar uma abertura.'
    ],
    joui: [
      'Joui, você corre muito. Eu gosto de alvo que dá trabalho.',
      'Você é rápido, Joui. Isso tornou a luta mais interessante.'
    ],
    aghata: [
      'Agatha, você passou a luta inteira tentando me encontrar. Eu estava esperando você chegar.',
      'Você quase me encontrou, Agatha. Quase.'
    ],
    dante: [
      'Dante, você me observou demais. Devia ter prestado atenção no resto.',
      'Você analisou meus movimentos. Eu só mudei um deles.'
    ],
    erin: [
      'Erin, explosões fazem muito barulho. Ótimas pra esconder um tiro.',
      'Erin, você fez barulho suficiente pra eu nem precisar procurar você.'
    ],
    gal_sal: [
      'Gal, você fala como se estivesse no controle. Não estava.',
      'Você gosta de parecer no controle, Gal. Não conseguiu dessa vez.'
    ],
    kian: [
      'Kian, você olha pras pessoas como peças. Eu não sou uma peça.',
      'Você tentou me tratar como parte do seu jogo. Eu não jogo pelas suas regras.'
    ],
    aguiar: [
      'Aguiar, você percebeu a armadilha. Só não percebeu a segunda.',
      'Você percebeu meu primeiro movimento, Aguiar. O segundo já foi tarde demais.'
    ],
    labirinto: [
      'Labirinto, você prepara o terreno muito bem. Eu também.',
      'Você controla o lugar. Eu controlo o momento.'
    ],
    xande: [
      'Xande, você faz muito barulho. Foi fácil saber onde estava.',
      'Você é difícil de derrubar, Xande. Mas impossível de esconder.'
    ],
    lirio: [
      'Lírio, você é grande demais pra se esconder. Facilitou meu trabalho.',
      'Você não precisa procurar você, Lírio. Dá pra ouvir a marreta de longe.'
    ],
    ferreiro: [
      'Ferreiro, você é estranho. Não parece alguém que eu deveria matar... mas contrato não pergunta.',
      'Você parece tranquilo demais pra alguém com um trabalho desses.'
    ],
    juan: [
      'Juan... você não parece um alvo comum. Isso torna o trabalho mais interessante.',
      'Você não é um alvo normal, Juan. Finalmente uma coisa interessante.'
    ],
    balu: [
      'Alvo grande, fácil de acertar.',
      'Nada pessoal, Balu. Mas você estava no caminho do contrato.'
    ]
  }
};

// ARNALDO FRITZ e SENHOR VERÍSSIMO: as falas de vitória deles e as de quem vence contra eles
const VICTORY_NEW = {
  anfitriao: {
    default: [
      'Você lutou com tanta confiança que quase me senti mal. Quase; passou.',
      'Eu tinha preparado um prêmio pra você. Aí você perdeu e fiquei com o prêmio.',
      'Se alguém perguntar, eu te dei uma chance. Não precisa explicar que era mentira.',
      'Essa cara é de derrota ou você sempre fica assim quando pensa?',
      'Você quase me venceu. Eu também quase paguei minhas contas ontem.',
      'Eu ia deixar você escolher qualquer coisa. Aí lembrei que você escolhe mal.',
      'Não fica triste. Até aquela cadeira ali achou que ia ganhar.',
      'Foi por pouco. Quer dizer, por bastante. Mas o "pouco" consola.',
      'Eu apostei em você. Perdi dinheiro e um pouco do respeito que eu tinha por mim.',
      'Boa tentativa. Minha esposa também acha que insistir muda alguma coisa.',
      'Se eu devolver sua dignidade, promete não perder de novo?',
      'Você caiu de um jeito tão dramático que quase estragou meu humor. Quase.',
      'Eu gostei de você. Não o suficiente pra parar, mas o suficiente pra lembrar seu nome.',
      'Pode culpar a sorte. Ela já está acostumada a levar a culpa por você.',
      'Seus amigos vão perguntar como foi. Mente; diz que eu estava distraído.',
      'Eu ia te consolar, mas isso exigiria fingir que me importo.',
      'Não foi uma derrota. Foi uma demonstração pública das suas limitações.',
      'Você sobreviveu? Ah. Então preciso pensar num prêmio melhor.',
    ],
  },
  arnaldo: {
    kaiser: [
      'Kaiser, você tem presença de palco. Falta só ensaiar a queda.',
      'Belíssima névoa, rapaz. Mas o holofote é meu esta noite.'
    ],
    arthur: [
      'Arthur, eu treinei a sua equipe. Achou mesmo que eu não conhecia os seus truques?',
      'Levanta, Arthur. Agente da Ordem não fica no chão depois do terceiro ato.'
    ],
    joui: [
      'Joui, katana bonita. Mas uma espada comum, bem empunhada, ainda faz milagres.',
      'Rápido demais, garoto. O público nem viu. Eu vi.'
    ],
    aghata: [
      'Agatha, você lê rituais. Eu leio pessoas. Hoje ganhou a leitura mais antiga.',
      'Que estreia, Agatha. Volte quando tiver decorado o texto.'
    ],
    dante: [
      'Dante, me perdoe. O Santa Menefreda continua sendo a sua casa.',
      'Você cresceu, menino. Mas o velho Arnaldo ainda sabe um passo ou dois.'
    ],
    erin: [
      'Erin, explosões são ótimas no cinema. Na vida real, eu prefiro a espada.',
      'Bravo, Erin! Só faltou a parte em que você acerta.'
    ],
    gal_sal: [
      'Correntes, Gal? Já vi números de escapismo melhores.',
      'O seu Deus pode assistir. Eu faço questão de plateia.'
    ],
    kian: [
      'Mais uma cena que você não previu, Kian.',
      'O relógio do Thiago ainda bate. O seu tempo, não.'
    ],
    aguiar: [
      'Máscara não é personagem, Aguiar. Personagem é quem está por baixo.',
      'Caçador da noite? O espetáculo acabou antes do seu toque de recolher.'
    ],
    labirinto: [
      'Um labirinto é só um cenário mal iluminado, rapaz.',
      'Encontrei a saída. Ela estava na ponta da minha espada.'
    ],
    xande: [
      'Xande, energia demais e roteiro de menos.',
      'Que vigor! Eu tinha isso aos vinte. Hoje tenho experiência.'
    ],
    lirio: [
      'Lírio, a Leonora é pesada. Eu só precisei desviar dela.',
      'Você é a parede, Lírio. Eu sou a porta dos fundos.'
    ],
    ferreiro: [
      'Guardião de Santo Berço, que presença! Mas o palco é meu.',
      'Uma espada consumidora contra uma espada comum. Quem diria, não?'
    ],
    juan: [
      'Juan, o Diabo é um coadjuvante muito exigente.',
      'Sangue e drama. Eu prefiro o meu drama sem manchas.'
    ],
    kemi: [
      'Kemi, você atira como quem já ensaiou. Eu também ensaiei.',
      'A Fantasma sai de cena. Aplausos para a atiradora.'
    ],
    balu: [
      'Balu, meu caro! Força bruta precisa de coreografia.',
      'O tio Balu caiu. Alguém traga um prato de comida pra ele.'
    ],
    verissimo: [
      'Desculpe, velho amigo. Hoje o protagonista sou eu.',
      'Veríssimo, guarde a lição: nunca subestime um ator.'
    ],
  },
  verissimo: {
    kaiser: [
      'Kaiser, coragem não substitui plano.',
      'Bom trabalho, agente. Ainda não é o suficiente.'
    ],
    arthur: [
      'Arthur, relatório completo amanhã. Inclusive desta derrota.',
      'Você é bom, Arthur. Por isso eu exijo mais.'
    ],
    joui: [
      'Joui, velocidade sem disciplina é só pressa.',
      'Levante. Vou te mandar para o treinamento outra vez.'
    ],
    aghata: [
      'Agatha, pare de se meter onde não foi chamada.',
      'Inteligência você tem. Agora aprenda a obedecer uma ordem.'
    ],
    dante: [
      'Dante, o Lodo não ganha discussão comigo.',
      'Você é teimoso, Dante. Eu sou mais.'
    ],
    erin: [
      'Erin, a próxima granada vai para o almoxarifado. Fechada.',
      'Agente Parker, menos explosão e mais estratégia.'
    ],
    gal_sal: [
      'Correntes não seguram quem já planejou a saída.',
      'A Ordem não negocia com a sua justiça, Gal.'
    ],
    kian: [
      'Eu disse que você não consegue me matar, Kian.',
      'O meu segredo continua guardado. E você, no chão.'
    ],
    aguiar: [
      'Mais um Mascarado no relatório.',
      'A noite acabou para você, Aguiar.'
    ],
    labirinto: [
      'Todo labirinto tem saída para quem anda com mapa.',
      'Arquivem esse capacete com o resto das evidências.'
    ],
    xande: [
      'Xande, a raiva te deixa previsível.',
      'Força tem limite. Disciplina, não.'
    ],
    lirio: [
      'Lírio, proteger os outros é nobre. Proteger a si mesmo também é necessário.',
      'Boa parede, Lírio. Parede não anda.'
    ],
    ferreiro: [
      'Ferreiro, Santo Berço vai continuar de pé. Você só vai descansar um pouco.',
      'Espada contra espada. A minha tinha dono melhor.'
    ],
    juan: [
      'Juan, o Diabo não comanda esta operação.',
      'Contenham o alvo. Ele não sai mais daqui.'
    ],
    kemi: [
      'Kemi, mira perfeita. Posição errada.',
      'Atiradora neutralizada. Próximo.'
    ],
    balu: [
      'Balu, eu te chamei de volta para ajudar, não para apanhar.',
      'De pé, Balu. A Ordem ainda precisa de você.'
    ],
    arnaldo: [
      'Arnaldo... a espada sempre foi melhor na sua mão.',
      'Velho amigo, você me ensinou essa estocada.'
    ],
  },
  kaiser: {
    arnaldo: [
      'Senhor Arnaldo, o senhor faz um show, mas a névoa não aplaude.',
      'Arnaldo, pede desculpa pro público por mim.'
    ],
    verissimo: [
      'Senhor Veríssimo, desculpa. Eu segui o plano... o meu.',
      'Relatório? Escreve que a névoa venceu, chefe.'
    ],
  },
  arthur: {
    arnaldo: [
      'Arnaldo, você me treinou bem demais. Agora aguenta.',
      'Foi mal, mestre. A aula de hoje foi minha.'
    ],
    verissimo: [
      'Senhor, de pé. Missão nenhuma termina com o chefe sentado.',
      'Senhor Veríssimo, eu aprendi. Só não do jeito que o senhor queria.'
    ],
  },
  joui: {
    arnaldo: [
      'Arnaldo-san, muito teatral. Eu só cortei o roteiro.',
      'Belo floreio, Arnaldo-san. O meu foi mais curto.'
    ],
    verissimo: [
      'Senhor Veríssimo, perdão. A sombra chegou antes da ordem.',
      'Disciplina, senhor? Eu chamo de velocidade.'
    ],
  },
  aghata: {
    arnaldo: [
      'Arnaldo, eu li o seu relógio antes de você abrir.',
      'Lindo espetáculo, Arnaldo. Pena que eu sei o final.'
    ],
    verissimo: [
      'Senhor Veríssimo, eu me meti, e deu certo.',
      'Viu? Às vezes desobedecer funciona.'
    ],
  },
  dante: {
    arnaldo: [
      'Arnaldo, eu devo tudo a você. Hoje paguei uma parte com uma surra.',
      'Desculpa, Arnaldo. O orfanato continua de pé, e o senhor também, mais ou menos.'
    ],
    verissimo: [
      'Senhor Veríssimo, o Lodo nunca foi bom em seguir ordens.',
      'O senhor é teimoso. Eu fui criado por freiras.'
    ],
  },
  erin: {
    arnaldo: [
      'Arnaldo, eu disse que queria abrir o relógio!',
      'Bum! Esse foi o efeito especial, seu Arnaldo.'
    ],
    verissimo: [
      'Almoxarifado? Tarde demais, chefe!',
      'Senhor Veríssimo, isso foi estratégia. Explosiva, mas estratégia.'
    ],
  },
  gal_sal: {
    arnaldo: [
      'A sua peça terminou, ator.',
      'Belo figurino, Arnaldo. Ainda assim, injusto.'
    ],
    verissimo: [
      'A Ordem caiu primeiro, Veríssimo.',
      'Ordens não seguram correntes.'
    ],
  },
  kian: {
    arnaldo: [
      'O relógio não te salvou, Arnaldo. Ele só marcou a hora.',
      'Eu sabia o fim desta cena antes de você subir ao palco.'
    ],
    verissimo: [
      'Você continua vivo, Veríssimo. Por enquanto.',
      'O seu segredo te protege. A sua espada, não.'
    ],
  },
  aguiar: {
    arnaldo: [
      'Ha ha... o ator caiu sem roteiro.',
      'Eu caço quem faz barulho, Arnaldo. E você faz muito.'
    ],
    verissimo: [
      'O chefe da Ordem no chão. Isso dá uma bela história.',
      'Ha ha... ordens não funcionam na floresta.'
    ],
  },
  labirinto: {
    arnaldo: [
      'O palco também era um labirinto, Arnaldo.',
      'Você procurou a plateia. Achou só paredes.'
    ],
    verissimo: [
      'Nenhum mapa da Ordem cobre esta saída.',
      'Até o líder se perde aqui dentro.'
    ],
  },
  xande: {
    arnaldo: [
      'Seu Arnaldo, o show foi bom, mas o meu bateu mais forte.',
      'Valeu pela aula, mestre. Hoje eu dei a minha.'
    ],
    verissimo: [
      'Senhor Veríssimo, com todo respeito: pancada também é estratégia.',
      'Por eles, chefe. Sempre por eles.'
    ],
  },
  lirio: {
    arnaldo: [
      'Seu Arnaldo, a Leonora não entende de teatro.',
      'Foi uma luta bonita, Arnaldo. A parede só não caiu.'
    ],
    verissimo: [
      'Senhor Veríssimo, eu protegi o senhor de si mesmo.',
      'Parede não anda, mas também não cai, chefe.'
    ],
  },
  ferreiro: {
    arnaldo: [
      'Ator de longe, guerreiro de perto. Santo Berço respeita os dois.',
      'A sua espada é comum, Arnaldo. A sua coragem, não.'
    ],
    verissimo: [
      'Líder de homens, descanse. Santo Berço segue de pé.',
      'A espada do seu amigo é boa. A mão ainda treme.'
    ],
  },
  juan: {
    arnaldo: [
      'O Diabo adorou a sua apresentação, Arnaldo.',
      'Mais um rosto famoso para o trono.'
    ],
    verissimo: [
      'Veríssimo, o Diabo não recebe ordens.',
      'A Ordem inteira não segura o que mora em mim.'
    ],
  },
  kemi: {
    arnaldo: [
      'Alvo famoso abatido. Sem autógrafo.',
      'Um tiro limpo, Arnaldo. Nada de bis.'
    ],
    verissimo: [
      'O líder caiu. O contrato continua.',
      'Mira perfeita, posição perfeita, senhor Veríssimo.'
    ],
  },
  balu: {
    arnaldo: [
      'Arnaldo, tu é bom ator. Mas machado não lê roteiro.',
      'Foi mal, seu Arnaldo! Depois eu pago o jantar.'
    ],
    verissimo: [
      'Viu, Veríssimo? Valeu me chamar de volta.',
      'Desculpa, chefe! Decisão precipitada, mas funcionou.'
    ],
  },
};
for (const [w, m] of Object.entries(VICTORY_NEW)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };


// JAE (Park Jae-Yoon): falas de vitória dela contra cada um e de cada um contra ela
const VICTORY_JAE = {
  jae: {
    kaiser: ['Shh, Kaiser. A névoa não esconde você de mim.', 'Tanta fumaça... e eu te achei pelo cheiro do medo.'],
    arthur: ['Um braço só e ainda tentou me alcançar. Que fofo.', 'Shh, Arthur. Dorme. Ninguém vem te buscar.'],
    joui: ['Você também some nas sombras? As minhas são mais escuras.', 'Katana bonita. Pena que eu cheguei antes dela.'],
    aghata: ['Todo esse conhecimento e você não viu o X debaixo do pé.', 'Lê mais uma página, Aghata. Eu espero... não, não espero.'],
    dante: ['Fim da peça? Eu nem comecei a me divertir.', 'Seu relógio parou, Dante. O meu nunca começou.'],
    erin: ['Barulho demais, Erin. Assassinato bom é em silêncio.', 'Suas bombas são lindas. O meu punhal é mais rápido.'],
    gal_sal: ['Justiça? Eu mato porque posso, Gal. Simples assim.', 'Corrente nenhuma segura quem já está nas suas costas.'],
    kian: ['Você previu tudo... menos onde eu ia estar.', 'O futuro tinha um X marcado. Era em você.'],
    aguiar: ['Desculpa, parceiro. Hoje a caçada era minha.', 'Fica com o machado, Aguiar. O troféu é meu.'],
    labirinto: ['Achei a saída do seu labirinto: passava por você.', 'Labirinto bonito. Eu prefiro casa trancada.'],
    xande: ['Seus amigos não chegaram a tempo, Xande. Ninguém chega.', 'Tanto barulho pra proteger os outros... e quem protegeu você?'],
    lirio: ['Grande e lenta, Lírio. Do jeito que eu gosto.', 'A Leonora pesa demais pra acompanhar uma sombra.'],
    ferreiro: ['Santo Berço vai ter que achar outro protetor.', 'O Luzidio apagou. Shh.'],
    juan: ['Fugindo de quem você era, Juan? Eu nunca fugi de quem eu sou.', 'O trono pode esperar. Eu não.'],
    kemi: ['Contrato cancelado, Kemi. Nada pessoal... ou talvez um pouco.', 'Você mira de longe. Eu prefiro sentir de perto.'],
    balu: ['Quanto mais alto, maior a queda, tio Balu.', 'Toda essa força e nenhum olho nas costas.'],
    arnaldo: ['Fim do espetáculo, Arnaldo. Sem aplausos.', 'A plateia era só eu. E eu gostei.'],
    verissimo: ['Olhos sempre abertos? Eu entrei pelas costas, velho.', 'A Ordo perdeu o líder pra uma garota com um punhal.'],
  },
  kaiser: { jae: ['Rápida. Mas a névoa vê quem se esconde nela.', 'Guarda esse punhal, Jae. Acabou o jogo.'] },
  arthur: { jae: ['Pelas costas de novo? Eu aprendi a olhar pra trás.', 'Sem jogo hoje, Jae. Só eu de pé.'] },
  joui: { jae: ['Você mata porque pode. Eu luto porque preciso.', 'As sombras também me conhecem, Jae.'] },
  aghata: { jae: ['Eu li cada passo seu antes de você dar.', 'Seu X no chão era previsível, Jae.'] },
  dante: { jae: ['Que personagem chata. Saiu de cena cedo.', 'Teatro de assassina? Já vi bem melhores.'] },
  erin: { jae: ['Boom! O silêncio também tem limite, hein?', 'Anotado: assassina rápida, não é à prova de explosão!'] },
  gal_sal: { jae: ['Pra quem mata porque pode, você caiu bem fácil.', 'Isso é justiça, Jae. Do meu jeito.'] },
  kian: { jae: ['Eu vi o seu fim antes do capuz cair.', 'O X nunca esteve no meu caminho.'] },
  aguiar: { jae: ['Ha ha... parceira, a caça é minha.', 'Volta pra Casa Juno, Jae. Ainda tem chave pra esconder.'] },
  labirinto: { jae: ['Até você se perde aqui dentro.', 'Seu jogo das chaves é brincadeira perto do meu.'] },
  xande: { jae: ['Meus amigos estão salvos. Você não vai tocar neles.', 'Acabou a brincadeira, Jae.'] },
  lirio: { jae: ['Rapidinha, hein? A Leonora é mais.', 'Pega leve com esse punhal, menina.'] },
  ferreiro: { jae: ['Santo Berço não abre a porta pra assassina.', 'O fogo do Luzidio enxerga no escuro.'] },
  juan: { jae: ['Eu já fui pior que você. Por isso eu sei como parar.', 'Matar porque pode não é liberdade, Jae.'] },
  kemi: { jae: ['Alvo abatido. Mesmo sendo colega.', 'Você chega perto demais, Jae. Eu nem precisei mirar.'] },
  balu: { jae: ['Hahaha! Pequena e rápida, mas o tio Balu é maior!', 'Ninguém foge do machado do tio Balu!'] },
  arnaldo: { jae: ['Que entrada! Mas a saída foi minha.', 'Bravo, Jae! Uma vilã de respeito.'] },
  verissimo: { jae: ['Olhos sempre abertos, Jae. Inclusive nas costas.', 'Mais uma assassina fora das ruas.'] },
};
for (const [w, m] of Object.entries(VICTORY_JAE)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };


// DALMO (o Colosso): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_DALMO = {
  dalmo: {
    kaiser: ['Névoa não segura soco, Kaiser.', 'Respira fundo. Ah, não dá, né? Fumaça demais.'],
    arthur: ['Um braço só contra mim? Coragem você tem, Cervero.', 'Fica no chão, motoqueiro. Ninguém vai te buscar.'],
    joui: ['Rápido, ligeiro... e no chão. Como todos.', 'Katana bonita. Pena que quebrou na minha mão.'],
    aghata: ['Todo esse estudo e nenhum livro ensina a apanhar.', 'Volta pros livros, menina. Arena não é lugar de ritual.'],
    dante: ['Faz um discurso agora. Eu espero.', 'Fecha a cortina, Dante. O show acabou no primeiro soco.'],
    erin: ['Bomba nenhuma derruba um prédio desse tamanho.', 'Barulho bonito. Agora fica quietinha aí.'],
    gal_sal: ['Corrente? Eu já arrebentei coisa mais grossa.', 'Justiça é pra quem tem tempo, Gal. Eu tenho conta pra pagar.'],
    kian: ['Previu isso aqui? Previu a minha mão?', 'Muito poder, pouca casca. Rachou.'],
    aguiar: ['Desculpa, parceiro. Na arena não tem parceiro.', 'Guarda o machado, Aguiar. Hoje a glória é minha.'],
    labirinto: ['Labirinto? Eu atravessei a parede.', 'Achei a saída. Era passando por cima de você.'],
    xande: ['Skate não foge de mim, moleque.', 'Teoria da conspiração nenhuma explica esse soco.'],
    lirio: ['Parede contra parede. A minha é mais grossa.', 'Marreta boa. Mão melhor ainda.'],
    ferreiro: ['Gigante de Santo Berço... tombou igual aos outros.', 'Espada bonita. Não corta o que não alcança.'],
    juan: ['Sangue não me assusta, Juan. Eu nado nele toda luta.', 'Vai rindo, vai. Ri no chão agora.'],
    kemi: ['Você hesitou da primeira vez, Kemi. Hesitou de novo.', 'Eu te trouxe pro grupo. Eu te tiro da arena.'],
    balu: ['Dois grandões, um só de pé. Adivinha qual.', 'Machado bonito, tio. Agora vai pro chão.'],
    arnaldo: ['Aplausos? Eu só escuto a plateia gritando o meu nome.', 'Teatro é bonito. Arena é de verdade.'],
    verissimo: ['A Ordo inteira ia precisar de muito mais.', 'Relatório pronto, velho: perdeu pro motorista.'],
    jae: ['Pequena, rápida... e embaixo do meu pé.', 'Esconde-esconde acabou, Jae. Te achei.'],
  },
  kaiser: { dalmo: ['Grande demais pra desviar da névoa.', 'Até um colosso precisa respirar, Dalmo.'] },
  arthur: { dalmo: ['Um tiro no lugar certo derruba qualquer tamanho.', 'Não importa o tamanho, Dalmo. Importa a mira.'] },
  joui: { dalmo: ['Força bruta não alcança sombra.', 'Você bate forte. Eu só não estava lá.'] },
  aghata: { dalmo: ['Eu sabia exatamente onde você ia pisar.', 'Previsível como uma rota de ônibus, Dalmo.'] },
  dante: { dalmo: ['Que personagem pesado. Saiu de cena com estrondo.', 'O tempo derruba até colosso.'] },
  erin: { dalmo: ['Boom! Prédio grande, implosão maior!', 'Calculei a carga certinho pro seu tamanho!'] },
  gal_sal: { dalmo: ['Grande, forte e preso na minha corrente.', 'Tamanho não é justiça, Dalmo.'] },
  kian: { dalmo: ['Eu vi o colosso cair antes de você levantar o punho.', 'Força sem visão. Que desperdício.'] },
  aguiar: { dalmo: ['Ha ha... o grandão caiu. A caça fica comigo.', 'Volta pro ônibus, Dalmo. A estrada é minha.'] },
  labirinto: { dalmo: ['Grande demais pra caber nos meus corredores.', 'Você se perdeu, Dalmo. Todos se perdem.'] },
  xande: { dalmo: ['Grande e lento! Valeu, skate!', 'Por eles, Dalmo. Você não ia passar.'] },
  lirio: { dalmo: ['A parede aguentou. A Leonora agradece.', 'Grandão, mas eu sou mais teimoso.'] },
  ferreiro: { dalmo: ['Santo Berço já viu gigantes maiores.', 'A Espada Consumidora não liga pro tamanho.'] },
  juan: { dalmo: ['Seu sangue tem gosto de arena, Dalmo.', 'Ha! O colosso sangra igual a todo mundo.'] },
  kemi: { dalmo: ['Contrato antigo, Dalmo. Hoje eu terminei.', 'Você me poupou uma vez. Eu não poupei.'] },
  balu: { dalmo: ['Hahaha! Pode ser grande, mas o tio Balu é maior!', 'Que pancada! Bora comer alguma coisa depois?'] },
  arnaldo: { dalmo: ['Que entrada! O público adorou a queda.', 'Bravo, Colosso! Mas o último ato era meu.'] },
  verissimo: { dalmo: ['Olhos sempre abertos, Dalmo. Até pros gigantes.', 'A Ordo tem um lugar pra você. Uma cela.'] },
  jae: { dalmo: ['Shh, grandão. Dorme.', 'Quanto maior, mais barulho cai. Shh.'] },
};
for (const [w, m] of Object.entries(VICTORY_DALMO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };


// GUIZO (Os Cinco): falas de vitória dele contra cada um e de cada um contra ele
const VICTORY_GUIZO = {
  guizo: {
    kaiser: ['Névoa paranormal ao vivo! Kaiser, você é conteúdo puro.', 'Desculpa a fumaça no vídeo, galera. Era a Kaiser.'],
    arthur: ['Um braço de sangue! Arthur, posso filmar mais de perto?', 'Gravado! Ninguém vai acreditar que eu derrubei o Cervero.'],
    joui: ['Você é rápido, mas a câmera é mais. Pausei no frame certo.', 'Fica parado aí, Joui. Preciso de um close.'],
    aghata: ['Um grimório de verdade! Posso só ler uma página?', 'Ritual contra ritual. Hoje o meu deu certo, Aghata!'],
    dante: ['Meu Deus, as espirais! Você também mexe com tempo, Dante?', 'Bravo pro vídeo! Agora fica quietinho aí.'],
    erin: ['Isso explodiu demais! Eu tô tremendo, mas gravei!', 'Erin, eu tinha certeza que a gente ia voar junto.'],
    gal_sal: ['Corrente com vida própria? Isso vai pro site hoje.', 'Gal, foi mal. A câmera tava rodando, eu tinha que ganhar.'],
    kian: ['Você me viu ganhar antes? Então por que não desviou?', 'Eu Já Sabia, Kian. É uma habilidade, sabia?'],
    aguiar: ['Machado de corda! Mano, que medo... mas que vídeo!', 'Desculpa, delegado. Isso aqui vai virar documentário.'],
    labirinto: ['O ??? em pessoa! Eu sempre quis filmar um mascarado desses!', 'Achei a saída, Labirinto. Tava na minha câmera.'],
    xande: ['Desculpa, Xande! Depois a gente faz o cumprimento, tá?', 'Ganhei do meu melhor amigo. Isso é estranho... mas tá gravado!'],
    lirio: ['Ganhei de você, Lírio! Agora deixa eu filmar a Leonora.', 'Lírio, cadê aquela confiança toda? Tô gravando, fala pra câmera!'],
    ferreiro: ['Um Luzidio! Orelha pontuda e tudo! Que dia!', 'Desculpa, Ferreiro. Eu filmo e vou embora, juro.'],
    dalmo: ['Pode vir... ele disse. E eu fui! E ganhei!', 'Mano, ele é ENORME. A galera não vai acreditar no tamanho.'],
    jae: ['Shh, eu sei. Mas não dá pra ficar quieto, eu ganhei!', 'Te achei no escuro, Jae. A câmera tem visão noturna.'],
    kemi: ['Desviei de uma sniper! Isso nunca aconteceu antes!', 'Kemi, você treme menos que eu. Mas eu ganhei.'],
    juan: ['Muito sangue, mano... mas eu tô vivo!', 'Juan, ri pra câmera. Agora é a sua vez de aparecer.'],
    balu: ['Derrubei o Balu! Agora alguém me ajuda a levantar ele?', 'Desculpa, tio Balu. Te devo um macarrão.'],
    arnaldo: ['Bravo, Arnaldo! Mas o público aqui é a minha câmera.', 'Teatro paranormal ao vivo. Que espetáculo!'],
    verissimo: ['O chefe da Ordem! Sr. Veríssimo, uma entrevista?', 'Olhos sempre abertos? Os meus também. Pela lente.'],
  },
  kaiser: { guizo: ['Desliga essa câmera, garoto. A névoa não gosta de plateia.', 'Isso não vai pro seu site, Guizo.'] },
  arthur: { guizo: ['Para de filmar e aprende a esquivar.', 'Um tiro. Nem precisou de mira, Guizo.'] },
  joui: { guizo: ['Você grava o que vê. Eu não estava onde você via.', 'Muito barulho para um ocultista.'] },
  aghata: { guizo: ['Ritual bonito. Mal executado.', 'Lê de novo, Guizo. Desta vez com atenção.'] },
  dante: { guizo: ['Que cena curiosa. O câmera virou a matéria.', 'Decadência por decadência, a minha é mais antiga.'] },
  erin: { guizo: ['Boom! Você filmou essa? Fala que você filmou essa!', 'Calma, eu fico com a sua câmera um pouquinho!'] },
  gal_sal: { guizo: ['A corrente não aparece no vídeo. Só a queda.', 'Justiça não precisa de plateia, Guizo.'] },
  kian: { guizo: ['Eu sabia antes de você sacar a faca.', 'Previsto. E nem foi difícil.'] },
  aguiar: { guizo: ['Ha ha... grava isso: a caça acabou.', 'Pequeno, rápido e assustado. A presa perfeita.'] },
  labirinto: { guizo: ['Sua câmera não grava os meus corredores.', 'Você se perdeu, Guizo. Todos se perdem.'] },
  xande: { guizo: ['Foi mal, Gui! Depois a gente faz o cumprimento.', 'Mano, você piscou no meio do ritual!'] },
  lirio: { guizo: ['Esquisito da Internet no chão! Que dia lindo!', 'Chiquinho, a Leonora mandou um beijo!'] },
  ferreiro: { guizo: ['Eu não posso permitir que você filme a minha cidade.', 'Santo Berço não aparece em vídeo, garoto.'] },
  dalmo: { guizo: ['Pode filmar agora, rapaz. A queda foi bonita.', 'Eu sou grande, mas não sou dois. Você, nem um.'] },
  jae: { guizo: ['Shh... desliga a câmera. Pronto.', 'Gravou? Não gravou. Shh.'] },
  kemi: { guizo: ['Eu enxerguei você antes da sua lente.', 'Um tiro. A câmera nem focou.'] },
  juan: { guizo: ['Ha! Que vídeo bonito vai dar. Vermelho do começo ao fim.', 'Grava isso aqui, ó: você caindo.'] },
  balu: { guizo: ['Hahaha! Desculpa, menino! Bora comer um macarrão?', 'Ê, rapaz! Bom de faca, ruim de queda.'] },
  arnaldo: { guizo: ['Que entrada! Mas o protagonista sou eu.', 'Corta! Repete a cena, garoto.'] },
  verissimo: { guizo: ['Ocultismo de iniciante. A Ordo tem um curso pra isso.', 'Olhos sempre abertos, Guizo. Até para câmeras.'] },
};
for (const [w, m] of Object.entries(VICTORY_GUIZO)) VICTORY_LINES[w] = { ...(VICTORY_LINES[w] || {}), ...m };

export const VICTORY_FALLBACKS = {
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
  balu: 'Viu? Eu falei que o tio Balu resolvia.',
  arnaldo: 'E fecham-se as cortinas. Aplausos, por favor.',
  verissimo: 'Missão cumprida. Relatório na minha mesa amanhã.',
  jae: 'Shh. Acabou.',
  dalmo: 'Pela Manu. Sempre pela Manu.',
  guizo: 'Gravado. Isso é real e eu tenho provas!',
};

export const BATTLE_DIALOGUES = {
  critical: {
    kaiser: 'Eu já sobrevivi a coisa pior. Não vou cair aqui.',
    arthur: 'Ainda tô de pé. Vai precisar mais que isso.',
    joui: 'Eu ainda posso escolher como essa luta termina.',
    aghata: 'Não vou deixar o medo decidir por mim.',
    dante: 'A peça não acaba enquanto eu estiver de pé.',
    erin: 'Isso foi só um teste. Eu ainda tenho uma solução.',
    gal_sal: 'Eu não vou deixar você decidir o meu fim.',
    kian: 'O resultado ainda pode surpreender.',
    aguiar: 'Ha... agora ficou interessante.',
    labirinto: 'O caminho fica estreito. Ainda há uma saída.',
    xande: 'Não vou cair antes de tirar os meus daqui.',
    lirio: 'A Leonora ainda está comigo.',
    ferreiro: 'Santo Berço precisa de mim. Eu não caio.',
    juan: 'Eu não vou voltar a ser quem fui.',
    kemi: 'A mira ainda está viva, e o contrato não fechou.',
    balu: 'Hahaha! O tio Balu aguenta mais que isso!',
    arnaldo: 'O espetáculo está longe do último ato!',
    verissimo: 'Já vi situação pior no relatório. Sigo.',
    jae: 'Sangrando? Ótimo. Agora eu tô acordada.',
    dalmo: 'Eu já levantei de coisa pior. A plateia quer mais.',
    guizo: 'Tá doendo... tá doendo muito... mas não para de gravar!',
    anfitriao: 'Essa dor combina com você. Não sei por quê; combina.',
  },
  special: {
    kaiser: 'A névoa fecha o caminho. Agora, acabou.',
    arthur: 'Eu queria resolver isso de outro jeito. Mas vamos lá.',
    joui: 'Vou acabar com isso sem perder quem eu sou.',
    aghata: 'Encontrei a resposta. Está bem na sua frente.',
    dante: 'A luz apaga. A peça termina.',
    erin: 'Anota aí: essa parte vai ser incrível!',
    gal_sal: 'Você teve a chance de parar. Agora aguenta.',
    kian: 'Eu já vi este momento acontecer.',
    aguiar: 'O caçador chegou ao fim da trilha.',
    labirinto: 'Você entrou no caminho errado.',
    xande: 'Chegou a hora de virar o jogo!',
    lirio: 'Leonora, comigo! Vamos nessa!',
    ferreiro: 'Pelo Santo Berço!',
    juan: 'Eu escolho o que fazer com esse poder.',
    kemi: 'Contrato aceito. Alvo marcado.',
    balu: 'Agora o tio Balu vai mostrar serviço!',
    arnaldo: 'Senhoras e senhores... chegou a atração principal!',
    verissimo: 'Chega de conversa. Vou encerrar a missão.',
    jae: 'Shh. Não grita.',
    dalmo: 'Agora você vai ver por que me chamam de Colosso.',
    guizo: 'Sorria! Você tá no Registro do Outro Lado!',
    anfitriao: 'Eu ia deixar você sair andando. Aí você me olhou com essa cara.',
  },
  transform: {
    deus_morte: 'A Morte não espera. Ela vem buscar.',
    diabo: 'Chega de fugir de quem eu sou.',
    fantasma: 'O contrato cobra. Eu pago.',
    anfitriao: 'Olha só. Eu também ganhei uma fantasia nova. A sua continua sendo essa cara?',
    jae_x: 'Capuz no lugar. Agora você não vê o meu rosto.',
    colosso: 'Aí sim, neném!',
    guizo_et: 'Eu sou o que eu sempre quis encontrar!',
    kian_calamidade: 'Eu fui Kushim. Eu sou Kian. Eu sou a Calamidade.',
  },
};

export const BATTLE_REPLIES = {
  critical: {
    kaiser: 'Então vai ter que me tirar daqui.',
    arthur: 'Você não vai me fazer cair só porque achou a brecha.',
    joui: 'Ainda dá tempo de parar.',
    aghata: 'Você não me empurra pra fora do mapa sem antes eu provar que estava errado.',
    dante: 'Quero ver se isso funciona de novo sem o meu relógio perto.',
    erin: 'Ótimo! Eu ainda tenho mais ideias.',
    gal_sal: 'Não vou deixar você escolher por mim.',
    kian: 'Você ainda acredita que pode mudar o resultado?',
    aguiar: 'Ha ha... vamos ver quanto tempo dura.',
    labirinto: 'Toda saída cobra um preço.',
    xande: 'Então vem. Eu não vou deixar meus amigos pra trás.',
    lirio: 'A Leonora também não vai deixar.',
    ferreiro: 'Eu não abandono o meu povo.',
    juan: 'Eu sei exatamente o que está em jogo.',
    kemi: 'Ainda tem um alvo vivo e um contrato em aberto.',
    balu: 'Aí sim! Gosto de quem aguenta a pressão.',
    arnaldo: 'O público quer mais! Não decepcione a plateia.',
    verissimo: 'Então continue. Eu ainda não encerrei o caso.',
    jae: 'Shh... só mais um pouquinho.',
    dalmo: 'Aguenta firme. Ainda falta o último round.',
    guizo: 'Calma, calma... respira e enquadra, Guizo.',
    anfitriao: 'Sua coragem é comovente. Quase tanto quanto essa estratégia.',
  },
  special: {
    kaiser: 'Eu ainda consigo atravessar essa névoa.',
    arthur: 'Você não chega perto dos meus sem me fazer ouvir a última palavra.',
    joui: 'Eu vou encontrar outro caminho.',
    aghata: 'Você escondeu um detalhe muito bom. Eu ainda vou encontrar o resto.',
    dante: 'Essa pressão tem um padrão. Você só precisa esperar o erro aparecer.',
    erin: 'Espera, eu não terminei de analisar!',
    gal_sal: 'Você não decide quando isso acaba.',
    kian: 'Já considerei essa possibilidade.',
    aguiar: 'Dessa vez, a presa escapou.',
    labirinto: 'Esse caminho ainda tem uma saída.',
    xande: 'Pode vir. Eu já vi coisa mais estranha.',
    lirio: 'A gente ainda tá junto, Xande.',
    ferreiro: 'Santo Berço não vai cair.',
    juan: 'Esse poder não vai me controlar.',
    kemi: 'Não. O contrato ainda está em aberto.',
    balu: 'Hahaha! Agora a brincadeira ficou séria. Me dá um segundo e eu devolvo.',
    arnaldo: 'Que espetáculo! Mas ainda não acabou.',
    verissimo: 'A missão continua. Só que agora você está no centro da mira.',
    jae: 'Grita mais alto. Eu gosto.',
    dalmo: 'Pode vir. Eu sou grande, mas não sou dois.',
    guizo: 'Isso foi INCRÍVEL! Você pode fazer de novo? A luz tava ruim.',
    anfitriao: 'Vai, capricha. Quero uma história boa pra contar quando você cair.',
  },
  transform: {
    kaiser: 'Eu não vou deixar você perder o controle.',
    arthur: 'Volta pra si! Ainda dá tempo.',
    joui: 'Não precisa enfrentar isso sozinho.',
    aghata: 'O que aconteceu com você?',
    dante: 'Essa presença... eu conheço.',
    erin: 'Isso definitivamente não estava no protocolo.',
    gal_sal: 'Esse poder não muda o que você escolheu.',
    kian: 'A transformação não altera o desfecho.',
    aguiar: 'Ha ha... agora a caçada ficou séria.',
    labirinto: 'Uma nova forma. O mesmo caminho.',
    xande: 'Seja lá o que for, eu não vou fugir.',
    lirio: 'Xande, tô contigo!',
    ferreiro: 'Eu já vi essa escuridão antes.',
    juan: 'Eu sei o que é ser consumido por isso.',
    kemi: 'O contrato mudou de forma. Não de preço.',
    balu: 'Eita! Agora o negócio ficou grande!',
    arnaldo: 'Uma transformação no meio do ato! Magnífico!',
    verissimo: 'Identifiquei a mudança. Mantenham a posição.',
    jae: 'Fantasia nova? A minha tem capuz.',
    dalmo: 'Bonito. O meu escafandro é maior.',
    guizo: 'Mano, que transformação! Fica parado, deixa eu focar!',
    anfitriao: 'Isso era pra me assustar? Eu já vi coisa mais convincente no espelho.',
  },
};

const DIALOGUE_BASE_IDS = { deus_morte: 'ferreiro', diabo: 'juan', fantasma: 'kemi' };

export function battleLines(speakerId, opponentId, event) {
  const lines = BATTLE_DIALOGUES[event];
  const replies = BATTLE_REPLIES[event];
  if (!lines || !replies) return null;

  const speaker = lines[speakerId] ? speakerId : DIALOGUE_BASE_IDS[speakerId] || speakerId;
  const opponent = replies[opponentId] ? opponentId : DIALOGUE_BASE_IDS[opponentId] || opponentId;
  const opening = lines[speaker];
  const response = replies[opponent];
  if (!opening || !response) return null;
  return [[speakerId, opening], [opponentId, response]];
}

export function victoryLines(winner, loser, loserName = CHARACTER_NAMES[loser] || loser) {
  if (winner !== 'anfitriao') winner = BASE_CHARACTER[winner] || winner;
  loser = BASE_CHARACTER[loser] || loser;
  const w = VICTORY_LINES[winner] || {};
  const matchup = w[loser];
  const lines = Array.isArray(matchup) && matchup.length ? matchup : w.default;
  if (Array.isArray(lines) && lines.length) return lines;
  if (typeof matchup === 'string' && matchup) return [matchup];
  const fallback = VICTORY_FALLBACKS[winner];
  const line = (typeof fallback === 'function' ? fallback(loserName) : fallback) || (typeof w.default === 'string' ? w.default : '');
  return line ? [line] : [];
}

export function victoryLine(winner, loser, loserName = CHARACTER_NAMES[loser] || loser) {
  const lines = victoryLines(winner, loser, loserName);
  return lines.length ? lines[Math.floor(Math.random() * lines.length)] : '';
}

export function introLines(idA, idB) {
  idA = BASE_CHARACTER[idA] || idA;
  idB = BASE_CHARACTER[idB] || idB;
  const variations = INTRO_DIALOGUES[idA]?.[idB];
  if (!variations?.length) throw new Error(`Fala de introdução não registrada: ${idA} vs ${idB}`);
  const scene = variations[Math.floor(Math.random() * variations.length)];
  return [
    [scene.starter, scene.line],
    [scene.response, scene.responseLine],
  ];
}
