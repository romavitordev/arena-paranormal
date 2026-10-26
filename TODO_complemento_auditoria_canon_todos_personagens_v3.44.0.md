# CAPÍTULO COMPLEMENTAR --- AUDITORIA DE FIDELIDADE AO CÂNONE (v3.44.0)

**Data:** 26/10/2026\
**Escopo:** complemento à vistoria de personagens da v3.44.0. Não
substitui o TODO existente, não invalida tarefas marcadas como
concluídas e não autoriza rebalanceamento geral.\
**Prioridade imediata:** Raziel e sua forma **O Verdadeiro Raziel**;
depois, revisão sistemática dos demais personagens.

## Objetivo

Revisar os personagens comparando três fontes que devem ficar separadas
no relatório:

1.  **Implementação real:** o que os arquivos do jogo executam de fato.
2.  **Cânone narrativo:** o que aparece nos episódios oficiais, artes e
    materiais oficiais.
3.  **Cânone mecânico:** regras de *Ordem Paranormal RPG*, incluindo
    *Sobrevivendo ao Horror*, quando aplicáveis.

A wiki comunitária é um índice e uma ferramenta para localizar fatos e
cenas, não a autoridade final. Quando houver divergência, dar prioridade
ao material oficial e aos episódios; anotar a divergência em vez de
inventar uma conciliação. Não copiar literalmente as regras de mesa se
elas não funcionarem em um jogo de luta: registrar a regra original e
explicar a adaptação de gameplay.

## 1. Processo obrigatório para cada personagem

Antes de propor alterações:

-   [ ] Conferir o código atual e listar todos os kits: base, forma(s),
    passivas, especial, agarrão, armas, assistências, efeitos de status
    e interações de equipe.
-   [ ] Confirmar em quais arquivos estão definidos os golpes,
    animações, hitboxes, dano, cooldown, custo de energia, VFX, IA/CPU,
    HUD e transformações.
-   [ ] Consultar a página da wiki do personagem, as páginas das
    habilidades/elementos/trilhas relacionadas e as referências
    indicadas nelas.
-   [ ] Verificar as cenas relevantes nos episódios oficiais. Registrar
    episódio, cena e timestamp quando possível; não inventar timestamp
    se não foi conferido.
-   [ ] Para poderes que vêm do RPG, consultar a descrição mecânica no
    livro/suplemento. Se o texto integral não estiver disponível
    legalmente, não reconstruir regras detalhadas de memória: usar a
    descrição pública e marcar a incerteza.
-   [ ] Criar uma tabela: **habilidade atual → comportamento real no
    código → referência canônica → divergência → proposta → impacto
    técnico → teste de aceite**.
-   [ ] Marcar cada conclusão como uma destas categorias:
    -   **CONFIRMADO:** aparece em fonte oficial ou descrição mecânica
        identificável.
    -   **ADAPTAÇÃO:** efeito criado para traduzir a habilidade para
        combate em tempo real.
    -   **PROPOSTA NÃO CANÔNICA:** ideia nova de gameplay; nunca a
        descrever como poder oficial.
    -   **INCERTO:** a fonte consultada não permite confirmar.
-   [ ] Só depois da auditoria, propor mudanças. Não remover habilidade
    existente sem explicar o que entra no lugar.
-   [ ] Depois de qualquer implementação, atualizar este TODO,
    `CHANGELOG-ADMIN.md`, `HABILIDADES.md` e os documentos de versão
    pertinentes; executar `npm ci`, `npm run check`, `npm test` e
    `npm run build`, quando disponíveis, e realizar testes visuais.

## 2. Raziel --- conclusão da pesquisa de cânone e plano de melhoria

### 2.1 Referências para consulta

**Episódios oficiais de Hexatombe:** - Episódio 7 --- "Consequências":
https://www.youtube.com/watch?v=K_c2VdmPuLg - Episódio 8 --- "Culpa":
https://www.youtube.com/watch?v=-7prXUHT8OM - Episódio 9 --- "Banho de
Sangue": https://www.youtube.com/watch?v=p5alZam12ss

**Páginas de referência comunitária:** - Raziel:
https://ordemparanormal.fandom.com/wiki/Raziel - Vampiros:
https://ordemparanormal.fandom.com/wiki/Vampiros - Monstruosos:
https://ordemparanormal.fandom.com/wiki/Monstruosos - *Sobrevivendo ao
Horror*:
https://ordemparanormal.fandom.com/wiki/Ordem_Paranormal_RPG%3A_Sobrevivendo_ao_Horror

A página de Raziel aponta o episódio 7 como sua aparição completa, o
episódio 8 como parte de sua história e o episódio 9 como o confronto
final. O episódio 9 é a principal referência visual/comportamental para
a forma verdadeira. A wiki cita por volta de **5h12m15s** para a fala do
banquete no episódio 9; confirmar o timestamp no vídeo antes de usar
como referência de implementação. O TODO da v3.44.0 também já aponta
cenas da igreja por volta de 4h55, 5h05, 5h20, 6h10 e 6h50 para a
construção da arena; esses timestamps são referências de cenário e não
substituem a revisão das cenas do personagem.

**Limitação desta pesquisa:** as wikis foram consultadas como índices e
os episódios oficiais foram identificados para revisão direta. Este
capítulo não declara uma análise quadro a quadro de todos os vídeos nem
uma transcrição completa dos episódios. Antes de afirmar detalhe que
dependa de um movimento específico, rever a cena no vídeo oficial.

### 2.2 Identidade canônica que o jogo deve preservar

Raziel é descrito como **Combatente da trilha Monstruoso, afinidade com
Sangue**, líder dos Vampiros. Ele alterna duas faces que não devem ser
tratadas como simples troca de roupa:

-   **Forma base --- predador aristocrático:** postura controlada, fala
    educada e teatral, inteligência tática e violência súbita. Deve
    parecer rápido e fisicamente dominante sem agir como um bruto
    desorientado o tempo todo.
-   **O Verdadeiro Raziel --- bestialidade exposta:** depois de sofrer
    ferimentos graves, rasga as vestes e passa a agir com muito mais
    agressividade, gritos e perda de controle. Ataca alvos ao alcance,
    devora vítimas vulneráveis e fica mais brutal. Ainda conserva
    reações emocionais e algum direcionamento: não deve virar uma IA
    aleatória que só corre sem conseguir lutar.

A forma base é principalmente a tradução de sua ficha mais
ritualística/elegante; a forma verdadeira deve se concentrar em ataques
diretos, pressão, mordida, resistência e devoração. Não tratar a forma
verdadeira apenas como a mesma lista de golpes com multiplicadores
maiores.

### 2.3 Evidências narrativas e consequências para o kit

  -----------------------------------------------------------------------
  Evidência em Hexatombe  Tradução recomendada    Limite da interpretação
  / material de           para o jogo             
  referência                                      
  ----------------------- ----------------------- -----------------------
  Raziel é líder dos      Golpes físicos pesados  Não significa que todo
  Vampiros e consegue     e reação de impacto     golpe deva causar dano
  derrubar Harpia com um  convincente; força como extremo ou quebrar
  golpe.                  identidade do           qualquer defesa.
                          personagem.             

  Ele entra no incêndio   Pode ter postura        **Não conceder
  do circo e continua     destemida e avançar sob imunidade a fogo** com
  avançando, mas a        pressão; usar           base nessa cena. Ele
  narrativa indica que    resistência geral de    sente o dano.
  ainda sente o dano.     Endurecer Sangue quando 
                          ativado.                

  Avança sobre Henri em   A Mordida deve ter      Evitar teleporte
  velocidade descrita     aproximação             literal se a referência
  como um vulto; agarra-o curta/rápida, agarrão   só sustenta velocidade
  e morde-o duas vezes.   claro, duas mordidas e  extrema.
                          cura.                   

  Uma facada de Henri     Endurecer Sangue é a    Resistência não deve
  parece não detê-lo;     ferramenta defensiva    ser invulnerabilidade;
  Raziel usa Endurecer    principal: resistência  permitir contrajogo,
  Sangue.                 temporária, crosta      fim de duração e
                          visual de sangue e      interrupções coerentes.
                          reação de impacto       
                          reduzida.               

  Maldição Sanguínea      Manter o ritual como    Como o jogo não usa
  apodrece o sangue do    debuff relevante, com   testes por dados,
  alvo e o deixa Abalado, duração/recarga         mapear explicitamente
  com penalidade de −1    legíveis e              −1 dado para um efeito
  dado para testes        possibilidade de        de gameplay; não
  durante a cena; pode    resistência ou redução  afirmar que o debuff
  ser resistida.          por defesa.             atual equivale
                                                  perfeitamente à regra.

  Bote Retalhador causa   Preservar a regra       O valor 105 é uma
  dano enorme; se o alvo  especial de raspão em   referência de ficha,
  esquiva, ainda recebe   esquiva, restrita ao    não obrigação de copiar
  metade, até 105 na      alcance e arco do bote. literalmente para o
  descrição da wiki.      Dar telegraph           balanceamento do jogo.
                          suficiente para que o   
                          golpe seja forte, mas   
                          legível.                

  Turno Extra permite     Traduzir a economia de  `attackSpeed: 1.12`
  realizar duas           ações para um jogo em   sozinho **não**
  ações/turnos por rodada tempo real: janela      implementa uma ação
  na descrição mecânica.  limitada para           extra. Não criar
                          golpe/ação adicional    ataques extras
                          após acerto, ou         infinitos nem retirar
                          cancelamento especial   todo o contrajogo.
                          de recuperação.         

  No estado bestial,      Sede Incontrolável deve Não aplicar a corpos já
  quando vê um corpo      ser contextual e        em KO se a lógica de
  morrendo próximo,       característica da forma combate não suporta
  Raziel não consegue se  verdadeira: identificar interação pós-KO; a
  controlar e o devora.   alvo vulnerável         ação deve acontecer
                          próximo, entrar numa    antes do encerramento
                          animação de devoração,  definitivo e não
                          causar dano/consumir    prolongar
                          uma oportunidade e      artificialmente o
                          recuperar vida.         round.

  Na luta da igreja, após A transformação deve    Não exigir a reprodução
  sofrer dano grave e um  ter apresentação        literal do evento da
  tiro na cabeça, ele     própria e mudar o       cena em toda partida. A
  rasga as roupas e       comportamento. Pode ser forma é uma tradução
  revela a forma          ativada pelo jogador;   jogável, não uma
  verdadeira; devora      se houver gatilho       cutscene obrigatória.
  Cindy e Maria quando    automático por vida,    
  estão morrendo.         ele precisa ser         
                          opcional/consistente    
                          com as regras de        
                          transformação do jogo.  
                          Sede Incontrolável deve 
                          priorizar alvos         
                          vulneráveis.            

  Cristino arranca um     A forma verdadeira pode Desmembramento
  braço de Raziel e ele   continuar ofensiva      permanente não é
  continua tentando       mesmo sob pressão e     necessário em partidas
  atacar Remi antes de    demonstrar ferimentos   normais; pode ficar
  Juan finalizá-lo.       sem perder a capacidade restrito à
                          de lutar.               cinemática/efeito
                                                  especial.

  Raziel devora vítimas   Especial de banquete    Não dar imortalidade,
  e, ao final, Juan o     deve comunicar agarrão, ressurreição ou
  mata e devora sua       mordida e recuperação   devoração universal ao
  cabeça.                 de vida. Uma interação  Raziel com base no fato
                          especial com Juan pode  de ser vampiro.
                          ser considerada, mas    
                          apenas como conteúdo    
                          opcional e aprovado     
                          pelo dono.              
  -----------------------------------------------------------------------

### 2.4 Auditoria do código atual e tarefas propostas

O código da v3.44.0 já contém `src/characters/raziel.js`,
`src/characters/forms/raziel_verdadeiro.js`,
`src/combat/razielAbilities.js` e clipes próprios em
`src/anim/razielClips.js`. Não recomeçar o personagem do zero.

#### \[ \] RZ-01 --- Turno Extra

-   Rever a implementação atual: a passiva está representada
    principalmente por `attackSpeed: 1.12`.
-   Escolher e documentar uma adaptação real de ação extra para combate
    em tempo real.
-   Limitar a uma oportunidade por janela/cooldown e garantir que não
    possa ser encadeada infinitamente.
-   Testar jogador, CPU, bloqueio, esquiva, combo, interrupção e fim de
    round.

#### \[ \] RZ-02 --- Sede Incontrolável

-   Implementar a condição de alvo vulnerável/morrendo próximo apenas na
    forma verdadeira, salvo evidência de que a ficha base também a
    exige.
-   Adicionar indicação visual/sonora breve e uma ação de devoração
    legível.
-   Definir raio, limiar de vida/estado, duração, cura e recarga com
    base no balanceamento existente.
-   Fazer a CPU usar a mecânica com prioridade contextual sem ficar
    presa tentando devorar um alvo fora de alcance.
-   Testar KO, interrupção, alvo protegido, alvo sem vulnerabilidade,
    multiplayer e encerramento da luta.

#### \[ \] RZ-03 --- Diferenciar Banquete de Sangue e Banquete Bestial

-   O especial da forma verdadeira não deve apenas herdar a sequência do
    especial base e mudar nome, cor e dano.
-   Base: encenação de anfitrião/predador controlado, agarrão e mordidas
    com drenagem.
-   Forma verdadeira: início explosivo, garras/rasgos, mordida/devorar
    como centro e finalização visual mais animalesca.
-   Se não existir uma mecânica segura de execução contextual, não
    prometer execução garantida na descrição; fazer uma cinemática
    brutal e aplicar dano fixo.
-   Testar interrupção, invulnerabilidade, KO e duração da cutscene.

#### \[ \] RZ-04 --- Revisar Rasgo de Sangue

-   O projétil em meia-lua é uma adaptação de gameplay, não uma
    habilidade canônica confirmada nas referências consultadas.
-   Decidir explicitamente entre (A) mantê-lo como licença de gameplay,
    documentada como adaptação; ou (B) substituí-lo por uma investida
    rápida de garras, que comunica melhor a velocidade de vulto e o
    combate direto mostrados no episódio.
-   Não chamar o projétil de ritual/poder oficial sem fonte.
-   Preservar o botão e a função de gameplay do golpe ao substituir;
    testar alcance, bloqueio, esquiva e combos.

#### \[ \] RZ-05 --- Maldição Sanguínea

-   Manter a penalidade de −1 dado como a referência do RPG e documentar
    a tradução para combate em tempo real.
-   A implementação atual de dano inicial + `ABALADO` + redução de dano
    causado + aumento de dano recebido é uma adaptação; verificar se o
    efeito é compreensível e não excessivo.
-   Rever duração, resistência, defesa, substituição de estado e
    encerramento de round.
-   Descrição, HUD e código devem dizer a mesma coisa.

#### \[ \] RZ-06 --- Endurecer Sangue

-   Confirmar visualmente a crosta de sangue sobre a roupa e a leitura
    clara de que é uma defesa temporária.
-   Testar dano físico, paranormal, agarrões, especiais, interrupções e
    fim de duração.
-   Não converter a resistência em imunidade a todos os efeitos.

#### \[ \] RZ-07 --- Forma verdadeira como kit próprio

-   Preservar os golpes de base que ainda fazem sentido, mas dar função
    mecânica distinta à forma: pressão física, aproximação rápida, cura
    por mordida/devoração e punição de oponentes vulneráveis.
-   Não depender apenas de aumento de atributos, sangramento e cor de
    VFX.
-   Revisar se Endurecer Sangue precisa permanecer no kit transformado
    ou se ocupa um espaço que deveria reforçar a identidade bestial.
-   Validar retorno à forma normal/round seguinte e troca das peças
    visuais `prop_up`/`prop_true`.

#### \[ \] RZ-08 --- Afinidade com Sangue e ficha do Monstruoso

-   Registrar que Raziel é um Combatente Monstruoso com afinidade em
    Sangue.
-   Não transformar Afinidade Elemental numa habilidade de combate
    genérica sem função. Usá-la para orientar a identidade de rituais e
    resistências, respeitando o que o sistema atual consegue
    representar.
-   Não importar para o jogo todas as penalidades de interpretação e
    progressão do RPG sem uma decisão de design explícita.

#### \[ \] RZ-09 --- Validação final

-   [ ] Testar base e forma verdadeira contra pelo menos um personagem
    de cada perfil (rápido, tanque, zoner, agarrador e ritualista).
-   [ ] Testar CPU × CPU e jogador × CPU.
-   [ ] Verificar hitboxes, câmera, animações, VFX, barra de vida,
    energia e cooldown.
-   [ ] Verificar se o especial não trava o oponente após
    interrupção/KO.
-   [ ] Atualizar `HABILIDADES.md`, `CHANGELOG-ADMIN.md`, TODO e versão
    do cliente apenas depois dos testes.

## 3. Auditoria de fidelidade — elenco completo, personagem por personagem

**Como ler as entradas:** “implementação” descreve o que existe nos arquivos da v3.44.0; “alvo canônico” é a identidade a confirmar nas fontes; “auditoria” é o que precisa ser conferido antes de mudar o kit. As observações abaixo são uma triagem técnica com base no código e nas páginas de referência. Não são uma afirmação de que cada cena foi revista quadro a quadro. A wiki é comunitária; validar detalhes importantes em episódios e materiais oficiais.

Para cada personagem, o Claude deve produzir a tabela detalhada `habilidade atual → código real → fonte/cena → divergência → proposta → teste`, com links e timestamps somente quando efetivamente conferidos. Não criar poderes canônicos por associação temática.

### 3.1 Arthur Cervero — `src/characters/arthur.js`
**Implementação observada:** combate de um braço, rifle de precisão, Rebirth, Templo do Ódio, Analisar Brecha, Arma/Lâmina de Sangue e forma Olhos Sempre Abertos.

**Âncoras canônicas:** atirador de elite, precisão balística, combate com um braço, rifle de precisão, vínculo com os Gaudérios Abutres e rituais associados a Energia/Sangue conforme a fase.

**Auditoria proposta**
- [ ] Conferir se a animação corporal respeita a regra de um braço em todos os golpes, esquivas, vitória, especial e transformação.
- [ ] Confirmar que o rifle é o centro do kit de longo alcance e que golpes corpo a corpo são opções de emergência, não um kit de lutador genérico.
- [ ] Comparar Rebirth com a arma amaldiçoada e seus efeitos elétricos/energia na fase correta; distinguir a versão de Desconjuração da de Calamidade.
- [ ] Verificar se Templo do Ódio representa o ritual e não um buff sem custo/risco; definir como o efeito de fúria se traduz sem obrigar a IA a agir de forma suicida.
- [ ] A forma Olhos Sempre Abertos deve ter uma mudança visual e mecânica legível. Confirmar na fonte se o efeito é só visual ou se altera ataques específicos.
- [ ] Testar mira, alcance, hitboxes do rifle, interrupção do especial, colisão com cenário e uso da arma durante os golpes de um braço.

**Referência inicial:** [Arthur Cervero — wiki](https://ordemparanormal.fandom.com/wiki/Arthur_Cervero); episódios de *O Segredo na Floresta*, *Desconjuração*, *Calamidade* e aparição em *Hexatombe*.

### 3.2 Joui Jouki — `src/characters/joui.js`; forma `forms/joui_shinokage.js`
**Implementação observada:** katana, cortes rápidos, Sombra Rasteira, Teleporte das Sombras, Envelhecimento Localizado, Olhar do Desespero e Portal das Sombras. A forma Shi no Kage tem kit separado.

**Âncoras canônicas:** Joui tem fases distintas: membro da Ordo, período sob influência da Seita das Máscaras e fase posterior à perda da máscara e à obtenção de uma nova katana. Não combinar poderes de todas as fases sem critério.

**Auditoria proposta**
- [ ] Conferir a fase exata de cada poder de sombra, máscara e katana.
- [ ] A transformação Shi no Kage deve usar a katana da Magistrada apenas se a referência temporal e narrativa confirmar a associação desejada; não misturar automaticamente o kit da máscara com a fase da nova katana.
- [ ] Confirmar o efeito e o nome de cada ritual, especialmente Envelhecimento Localizado e Portal das Sombras, em vez de tratar tudo como teleporte genérico.
- [ ] Separar mobilidade de sombra, corte físico e controle por medo em funções diferentes.
- [ ] Testar troca de forma, modelo/arma, cancelamento de teleporte, distância máxima, ataques aéreos e retorno de round.

**Referência inicial:** [Joui Jouki — wiki](https://ordemparanormal.fandom.com/wiki/Joui_Jouki); *Desconjuração* e *Calamidade*, sobretudo episódios que mostram o uso da máscara e a fase posterior.

### 3.3 Kaiser — `src/characters/kaiser.js`
**Implementação observada:** M4, Desert Eagle/karambit descritas no kit, Balas Amaldiçoadas, Sentir Através, Baforada Cinerária, Acácia, Dendrobium, Nebulosa e especial Cinerária.

**Âncoras canônicas:** atirador e combatente tático; armas de fogo, munição amaldiçoada e rituais/efeitos de Energia. A névoa e os efeitos de área devem ter leitura tática própria.

**Auditoria proposta**
- [ ] Confirmar quais armas aparecem em cada fase e não alternar entre M4, Desert Eagle e karambit sem uma transição visual.
- [ ] Separar disparo balístico, bala amaldiçoada e ritual de área. Cada um deve ter telegraph, alcance e resposta diferentes.
- [ ] Verificar a fidelidade visual de Cinerária/névoa e Acácia, evitando que o efeito de Energia vire apenas uma explosão roxa genérica.
- [ ] Auditar a interação com Rejeitar Névoa do Kian: a habilidade deve responder aos efeitos compatíveis, sem anular toda habilidade de Kaiser.
- [ ] Testar munição, cadência, recarga/cooldown, bloqueio, projéteis simultâneos, câmera e efeitos que permanecem após o fim do especial.

**Referência inicial:** [Kaiser — wiki](https://ordemparanormal.fandom.com/wiki/Kaiser); *O Segredo na Floresta*, *Desconjuração* e *Calamidade*.

### 3.4 Dante — `src/characters/dante.js`; forma `forms/dante_aberto.js`
**Implementação observada:** palmas de Lodo, Decadenza, Embaralhar/Trinitá, Tentáculos de Lodo, Cicatrização/Paradiso, Destruição Temporal/Rotura, Invocação: A Marionete e Olhos Abertos.

**Âncoras canônicas:** ocultista associado à Morte e ao lodo preto, com rituais de degradação, distorção, cura e efeitos mentais/temporais conforme as fases.

**Auditoria proposta**
- [ ] Conferir nome e efeito de cada ritual por fase; evitar que Decadenza, Paradiso e Rotura sejam confundidos como “lodo que causa dano”.
- [ ] Diferenciar debuff/doença, controle de espaço, cura e especial temporal por animação, som e resposta do adversário.
- [ ] Verificar se Invocação: A Marionete pertence à versão/fase correta e se sua execução representa a fonte, não apenas um golpe de tentáculo genérico.
- [ ] A forma Olhos Abertos deve ter kit coerente com a mudança de fase, não só multiplicadores de dano.
- [ ] Testar duração de efeitos, cura, hitboxes dos tentáculos, estados interrompíveis e leitura visual em cenários escuros.

**Referência inicial:** [Dante — wiki](https://ordemparanormal.fandom.com/wiki/Dante); *Desconjuração* e *Calamidade*.

### 3.5 Erin Parker — `src/characters/erin.js`; forma `forms/erin_caos.js`
**Implementação observada:** adagas, escopeta calibre 12, granadas (incluindo Supernova/Nebulosa/Sakura), Bênção Maldita, Envelhecimento Localizado/Black Hole e forma Em Nome do Caos.

**Âncoras canônicas:** engenheira que cria explosivos; combate com armas e granadas, além de rituais de Energia/Conhecimento e cura. A fase Em Nome do Caos representa uma virada narrativa e não deve ser reduzida a “mais dano”.

**Auditoria proposta**
- [ ] Conferir o efeito de cada granada e manter diferenças reais de área, tempo de detonação e contrajogo.
- [ ] Distinguir a Bênção Maldita (visão/previsão dos resultados) da cura de Black Hole; não transformar ambos em projéteis de dano.
- [ ] Verificar a forma Em Nome do Caos diretamente na cena de origem: o que muda em postura, poder, visual e intenção.
- [ ] Confirmar se o código implementa corretamente o amuleto elétrico como reação ao ser atingida, caso continue no escopo da personagem.
- [ ] Testar explosões perto de ambos os jogadores, autocolisão, bloqueio, esquiva, tempo de detonação e legibilidade de cada área.

**Referência inicial:** [Erin Parker — wiki](https://ordemparanormal.fandom.com/wiki/Erin_Parker); *Desconjuração*, *Calamidade* e *O Jogo do Anfitrião*.

### 3.6 Aghata — `src/characters/aghata.js`
**Implementação observada:** faca, Amaldiçoar Arma, Facas Amaldiçoadas, Passagem de Conhecimento, Leitura de Rituais, Descarnar e Passagem de Conhecimento Expandido.

**Âncoras canônicas:** agente ligada ao Conhecimento, leitura e manipulação de rituais; sua habilidade não deve ser resumida a uma sequência de facadas.

**Auditoria proposta**
- [ ] Confirmar o que a personagem efetivamente demonstra em cada campanha/fase e quais poderes pertencem à ficha de RPG.
- [ ] Diferenciar leitura/análise de ritual, preparação de arma e dano direto.
- [ ] Verificar se Passagem de Conhecimento muda uma condição do combate ou só causa dano; a descrição, VFX e efeito devem coincidir.
- [ ] Se houver forma expandida, documentar qual habilidade se amplia e qual é a condição de uso.
- [ ] Testar a legibilidade de sigilos, custo de energia, interrupção e se as habilidades não se tornam apenas variações de projétil.

**Referência inicial:** [Agatha Volkomenn — wiki](https://ordemparanormal.fandom.com/wiki/Agatha_Volkomenn); temporadas e material de RPG em que a versão usada pelo jogo aparece. Confirmar qual Agatha é representada no modelo.

### 3.7 Gal Sal — `src/characters/gal_sal.js`
**Implementação observada:** lâminas e correntes, Corrente de Captura, Ereshkigal, Corrente Gancho, teletransporte, controle mental e Velocidade Mortal. O comentário do código define uma mecânica de cura invertida/drenagem de sanidade.

**Âncoras canônicas:** personagem dos Escriptas com relação a Ereshkigal e correntes; identidade e origem da arma precisam ser separadas das habilidades pessoais.

**Auditoria proposta**
- [ ] Confirmar se cada habilidade está ligada ao personagem, à arma Ereshkigal ou a um ritual.
- [ ] Verificar a regra especial de “cura invertida”: quem recupera vida, quem perde energia e se a explicação no HUD corresponde ao código.
- [ ] Distinguir puxão, captura, controle mental e teletransporte; evitar que todas as habilidades sejam apenas aproximação forçada.
- [ ] Confirmar a forma Realizador do Destino e se ela tem comportamento próprio além de atributos.
- [ ] Testar correntes em alvos no ar, bloqueio, esquiva, colisões, limite de distância e cancelamento da captura.

**Referência inicial:** [Gal — wiki](https://ordemparanormal.fandom.com/wiki/Gal); *Desconjuração*, *Calamidade* e aparições posteriores relevantes.

### 3.8 Nubi — `src/characters/nubi.js`
**Implementação observada:** bengala ritualística, Lodo da Morte, Desvio Imperturbável, Decadência, Lodo que Prende, Sentença do Chacal, Ritual de Drenagem e Afinidade com a Morte.

**Âncoras canônicas:** Escripta ocultista de Morte; sua percepção temporal é distorcida após o ritual envolvendo Nina, e ela usa lodo para conjurar o Carniçal da Esfinge.

**Auditoria proposta**
- [ ] Conferir a cena da Mansão Leone e separar o ritual do Carniçal da Esfinge dos ataques comuns de lodo.
- [ ] Verificar se Desvio Imperturbável comunica antecipação/percepção alterada, em vez de ser uma esquiva instantânea sem explicação.
- [ ] Distinguir aprisionamento, drenagem, decadência e invocação em funções e animações.
- [ ] Revisar a classificação elemental: não deduzir o elemento apenas pela cor do VFX.
- [ ] Testar invocação, colisão da criatura, alcance da bengala, duração do lodo e recuperação após interrupção.

**Referência inicial:** [Nubi — wiki](https://ordemparanormal.fandom.com/wiki/Nubi); *Calamidade*, especialmente a cena da Mansão Leone.

### 3.9 Xande (Alexandre) — `src/characters/xande.js`
**Implementação observada:** taco com arame farpado, Skate Caótico, Amaldiçoar Arma, Polarização Caótica, Tela de Ruído, Velocidade Mortal, Cicatrização e passiva Gladiador Paranormal.

**Âncoras canônicas:** membro de Os Cinco, skatista e ocultista; o skate, o taco e os rituais devem ter usos reconhecíveis e não ser apenas cosméticos.

**Auditoria proposta**
- [ ] Conferir se o skate aparece como ferramenta de mobilidade e ataque de modo consistente, e se não some/teleporta sem animação.
- [ ] Diferenciar Polarização Caótica de Tela de Ruído por função e efeito visual; confirmar qual elemento e ritual pertencem a cada um.
- [ ] Verificar a passiva Gladiador Paranormal e como a recuperação de recurso é adaptada ao jogo sem gerar energia infinita.
- [ ] Confirmar a coerência entre cicatrização, velocidade e ataques com taco.
- [ ] Testar a trajetória do skate, retorno ao personagem, colisão com parede, hitbox do taco e cancelamento aéreo.

**Referência inicial:** [Alexandre — wiki](https://ordemparanormal.fandom.com/wiki/Alexandre); *Sinais do Outro Lado*.

### 3.10 Guizo — `src/characters/guizo.js`; formas ET, bombado e velho
**Implementação observada:** faca dourada, Invadir Mente, Decadência, Amaldiçoar Arma com Sangue, Velocidade Mortal, Embaralhar, Espirais da Perdição, Cicatrização e Registro do Outro Lado. As formas são registradas separadamente.

**Âncoras canônicas:** Guilherme Santos, membro de Os Cinco e ocultista da trilha Graduado; documenta o paranormal com sua câmera e é expressivo, mas pode demonstrar medo. O ET é uma manifestação/forma distinta.

**Auditoria proposta**
- [ ] Confirmar o que cada forma representa na narrativa e não tratar ET, bombado e velho como simples skins intercambiáveis se houver habilidades diferentes.
- [ ] A câmera deve fazer parte da identidade visual/comportamental sem ocupar a mão da faca de modo impossível.
- [ ] Verificar se Invadir Mente, Embaralhar e Espirais da Perdição têm efeitos distintos, não apenas controle visual.
- [ ] Se as formas bombado/velho só multiplicam dano e reduzem cooldown, avaliar se isso é suficiente para a variação específica — não criar poder novo sem fonte.
- [ ] Testar troca de forma, modelo, escala, hitbox, animação de faca e compatibilidade da câmera com golpes.

**Referência inicial:** [Guizo — wiki](https://ordemparanormal.fandom.com/wiki/Guizo); *Sinais do Outro Lado*.

### 3.11 Lírio Tellini — `src/characters/lirio.js`
**Implementação observada:** marreta Leonora, Golpe Pesado, Cai Dentro, Amarras de Sangue, Leonora Amaldiçoada, Proteção Pesada e passivas defensivas.

**Âncoras canônicas:** combatente Tropa de Choque, “a parede” de Os Cinco; grande resistência, proteção dos aliados e golpes físicos pesados. Leonora é parte central da identidade.

**Auditoria proposta**
- [ ] Confirmar a forma exata de Leonora e como as miniaturas amaldiçoadas aparecem durante os ataques.
- [ ] Diferenciar proteção/absorção de dano de superarmadura: o personagem pode resistir sem ignorar todos os ataques.
- [ ] Verificar se Amarras de Sangue controla o alvo e se o controle tem duração, escape e telegraph.
- [ ] Garantir que a lentidão e a curta distância sejam compensadas por impacto real, sem tornar o personagem impossível de punir.
- [ ] Testar empurrão, agarrões, ataques aéreos, superarmadura, interrupção e proteção de aliado quando aplicável.

**Referência inicial:** [Lírio Tellini — wiki](https://ordemparanormal.fandom.com/wiki/L%C3%ADrio_Tellini); *Sinais do Outro Lado*.

### 3.12 Balu — `src/characters/balu.js`
**Implementação observada:** machado, Machado Demônio, Fala Imponente, 110%, Colete Físico-Balístico, Pancada do Urso e golpes de força.

**Âncoras canônicas:** veterano protetor da Equipe Abutres, brincalhão e fisicamente forte; repudia o paranormal, mas usa o Machado Demônio e equipamentos defensivos.

**Auditoria proposta**
- [ ] Conferir a transformação do machado: a arma comum deve virar a maça-estrela de sangue na habilidade correta, sem parecer uma arma permanentemente diferente.
- [ ] Distinguir Fala Imponente (pressão/controle) de 110% (esforço físico) e de Colete (defesa balística).
- [ ] Verificar o custo em sangue/vida associado ao Machado Demônio se isso estiver presente na regra da fonte.
- [ ] A personalidade protetora pode aparecer em postura, reação e habilidade defensiva; não precisa ser convertida em dano extra.
- [ ] Testar armadura contra tiros, golpes corpo a corpo, agarrões, interrupções e visual do machado antes/depois da maldição.

**Referência inicial:** [Balu — wiki](https://ordemparanormal.fandom.com/wiki/Balu); *Calamidade* e *O Jogo do Anfitrião*.

### 3.13 Cristino — `src/characters/cristino.js`; forma `forms/cristino_desertor.js`
**Implementação observada:** peixeira, espingarda socadeira, Lampião Explosivo, Trilha de Lampiões, Corda do Telhado, Decepar, Odeio Gente Barulhenta e forma Desertor.

**Âncoras canônicas:** transtornado/cangaceiro de Hexatombe, tático e resistente; combina peixeira, espingarda e ferramentas de caça. A forma Desertor deve ser conferida na fase narrativa correta.

**Auditoria proposta**
- [ ] Conferir a ordem de uso das armas: a espingarda é carregada pela boca e pode ter comportamento diferente de uma arma moderna automática.
- [ ] Diferenciar os lampiões como preparação/controle de área de uma granada comum.
- [ ] Validar a corda e o deslocamento vertical/horizontal em relação às cenas, sem conceder teleporte não mostrado.
- [ ] Verificar a mudança de kit na forma Desertor e se o rifle altera a distância preferencial e o ritmo do personagem.
- [ ] Testar munição/cooldown, explosão, corda, troca de forma, hitboxes da peixeira e arma de fogo.

**Referência inicial:** [Cristino — wiki](https://ordemparanormal.fandom.com/wiki/Cristino); *Hexatombe*, especialmente episódios de confronto dos Mascarados.

### 3.14 Cristopher Cohen — `src/characters/cristopher.js`
**Implementação observada:** pancadaria de dublê, Suplex de Dublê, Direção Avançada, Levanta, Grandão!, A Muralha, Por Você, Filho! e Último Sacrifício.

**Âncoras canônicas:** dublê/instrutor, grande força física, pai de Kaiser e amigo de Arnaldo; sacrifica-se para proteger um companheiro. Sua identidade é força, resistência e proteção, não ocultismo genérico.

**Auditoria proposta**
- [ ] Confirmar quais movimentos vêm de luta coreografada/dublê e manter a leitura de quedas, rolamentos e agarrões.
- [ ] A Muralha e o sacrifício devem ter função defensiva clara; não serem apenas especiais de dano alto.
- [ ] Conferir a relação entre Último Sacrifício e Kaiser, incluindo se é um ataque conjunto, assistência ou cena independente no código.
- [ ] Evitar transformar o personagem numa versão genérica de tanque sem os movimentos de dublê.
- [ ] Testar agarrões, rolamentos, colisão no chão, proteção, invulnerabilidade e especial conjunto.

**Referência inicial:** [Cristopher Cohen — wiki](https://ordemparanormal.fandom.com/wiki/Cristopher_Cohen); *O Segredo na Floresta*.

### 3.15 Dalmo Magno — `src/characters/dalmo.js`; forma `forms/colosso.js`
**Implementação observada:** golpes de arena, Pressão Atmosférica, Agarrão de Arena, Atropelar, A Glória Era Viciante, Finalização de Arena e forma Colosso.

**Âncoras canônicas:** Mascarado e gladiador do submundo ocultista, forte e resistente, mais lento; luta por dinheiro para o tratamento da filha e se vicia na glória da arena.

**Auditoria proposta**
- [ ] Conferir que a velocidade de movimento e recuperação é menor que a dos assassinos ágeis, compensada por alcance e impacto.
- [ ] Golpes de Arena deve recompensar corpo a corpo/manobras sem gerar uma sequência infinita de ataques extras.
- [ ] A Glória Era Viciante precisa refletir o prazer de lutar/arena de forma mecânica ou narrativa coerente, não apenas buff sem condição.
- [ ] Na forma Colosso, confirmar escala, câmera, alcance e hitbox do corpo; não multiplicar o tamanho sem ajustar colisão.
- [ ] Testar agarrões, atropelamento, pressão, ataques contra alvos no ar, limites da arena e interações com a IA.

**Referência inicial:** [Dalmo Magno — wiki](https://ordemparanormal.fandom.com/wiki/Dalmo_Magno); *Hexatombe* e *Natal Macabro*.

### 3.16 Aguiar — `src/characters/aguiar.js`; forma `forms/aguiar_mutilador.js`
**Implementação observada:** machado do Mutilador com corda, Armadilha de Urso, Cães de Caça, Predador de Sangue, Caçada no Acampamento e máscara do Mutilador Noturno na transformação.

**Âncoras canônicas:** Jonas Aguiar, assassino em série e caçador; a identidade do Mutilador Noturno pertence à forma mascarada. Armadilhas, machado e caça devem ter função tática.

**Auditoria proposta**
- [ ] Distinguir o Aguiar sem máscara do Mutilador Noturno; não misturar aparência/poderes entre as duas fases.
- [ ] Confirmar o uso do machado arremessado pela corda e garantir que o puxão tenha uma trajetória legível e possa ser evitado.
- [ ] Armadilha de Urso e Cães de Caça devem controlar/pressionar o espaço, não ser três versões do mesmo ataque.
- [ ] Validar o elemento Sangue com a fonte e não apenas com a cor vermelha.
- [ ] Testar armadilhas invisíveis/visíveis, limite de armadilhas, remoção após round, puxão contra bloqueio e forma no round seguinte.

**Referência inicial:** [Jonas Aguiar — wiki](https://ordemparanormal.fandom.com/wiki/Jonas_Aguiar); *Hexatombe* e *Natal Macabro*.

### 3.17 Park Jae-Yoon — `src/characters/jae.js`; forma `forms/jae_x.js`
**Implementação observada:** punhal X, Punhais Arremessados, Shhh..., Assassinato Furtivo, Zona dos Sussurros, A Marca do X e forma Capuz de X.

**Âncoras canônicas:** assassina furtiva e veloz, associada aos Mascarados; aproxima-se sem ser percebida e ataca quando o alvo está vulnerável. A ficha aponta agilidade alta e pouca resistência.

**Auditoria proposta**
- [ ] Confirmar a distinção entre Jae sem máscara e X/Capuz de X; a forma deve ter uma mudança de comportamento, não apenas cor/dano.
- [ ] A furtividade deve criar uma janela tática curta, com sinais de áudio/visual e possibilidade de resposta; não tornar a personagem invisível por tempo excessivo.
- [ ] Diferenciar punhaladas rápidas, arremesso e ataque surpresa em alcance e recuperação.
- [ ] Confirmar pronome/nome exibidos na UI e evitar textos inconsistentes entre Jae, X e Park Jae-Yoon.
- [ ] Testar furtividade contra CPU, lock-on/câmera, hitbox de ataque por trás, esquiva e retorno à forma base.

**Referência inicial:** [Park Jae-Yoon — wiki](https://ordemparanormal.fandom.com/wiki/Park_Jae-Yoon); *Hexatombe* e *Natal Macabro*.

### 3.18 Kemi — `src/characters/kemi.js`; forma `forms/fantasma.js`
**Implementação observada:** faca, Sniper Fantasma, Disparo da Morte, Pistola Transtornada/arame farpado, Perita, Revólver .38, Contrato de Morte e transformação A Fantasma.

**Âncoras canônicas:** assassina silenciosa/mercenária, com rifle, revólver e faca; a forma Fantasma é associada às faixas e a uma identidade de execução furtiva.

**Auditoria proposta**
- [ ] Separar rifle de precisão, revólver, faca e Pistola Transtornada; não usar todos como projéteis equivalentes.
- [ ] Confirmar se Sede de Vingança/Intenção pertence à Kemi, à Lena ou à condição do corpo utilizado, e como o jogo representa essa herança.
- [ ] A forma A Fantasma deve alterar o padrão de luta de modo coerente com as faixas e o papel de assassina; evitar apenas aumentar dano.
- [ ] Verificar se a mira dá tempo de reação e se o tiro tem contrajogo justo.
- [ ] Testar distância máxima, colisão do projétil, mira fora da tela, CPU, execução e troca de modelo/efeitos.

**Referência inicial:** [Kemi — wiki](https://ordemparanormal.fandom.com/wiki/Kemi); *Hexatombe*.

### 3.19 Labirinto — `src/characters/labirinto.js`; forma `forms/labirinto_elmo.js`
**Implementação observada:** Antena, Rajada Caótica, Labirinto Mental, Mapa Sanguíneo, Capturar Momento; forma do capacete com Tempestade Caótica, Labirinto Abissal, Consumir Momento e Revelação Sanguínea.

**Âncoras canônicas:** ocultista/assassino dos Mascarados, corpo do agente Remi; usa uma antena/parabólica como arma e instrumento de rituais. A obsessão com labirintos, mapas e captura de momentos deve guiar o kit.

**Auditoria proposta**
- [ ] Conferir a identidade e origem do capacete antes de nomear a forma; manter “???” se a referência não confirmar o nome.
- [ ] Diferenciar Rajada Caótica (dano), Labirinto Mental (controle), Mapa Sanguíneo (rastreamento/posicionamento) e Capturar Momento (tempo/ação).
- [ ] A forma não deve ser só um pacote de Energia; validar a função narrativa de cada poder com cenas.
- [ ] Garantir que a antena esteja na mão e na posição correta em ataques, bloqueios, corrida e especial.
- [ ] Testar zonas, efeitos temporais, duração, UI, câmera e retorno da forma.

**Referência inicial:** [Labirinto — wiki](https://ordemparanormal.fandom.com/wiki/Labirinto); *Hexatombe*.

### 3.20 Juan / Henri — `src/characters/juan.js`; forma `forms/juan_odio.js`
**Implementação observada:** Faca Predadora, Descarnar Discente, Perturbação Discente, Vínculo de Sangue, Armadura de Sangue Diabólica, Hemorragia Severa; Ódio do Diabo e renascimento/Portador do Trono.

**Âncoras canônicas:** Henri/Juan é Escripta e, em Hexatombe, faz pacto com o Diabo. O estado Ódio do Diabo e a transformação no Portador do Trono são fases distintas; O Diabo também é personagem selecionável separado.

**Auditoria proposta**
- [ ] Conferir cronologia e nomenclatura: Henri/Juan, Ódio do Diabo, pacto e Portador do Trono. A UI não deve apresentar a mesma forma como se fosse entidade separada em todos os contextos.
- [ ] Verificar o custo físico do pacto, o sangue como recurso e a progressão de forma.
- [ ] Diferenciar Faca Predadora (dreno/recuperação), Vínculo (conexão/controle), Perturbação (estado mental) e Descarnar (dano físico).
- [ ] Confirmar se a transformação deve ser ativada pelo jogador ou por condição e se dura até o fim do round.
- [ ] Testar transições, barra de vida, regeneração, especial e consistência com o personagem O Diabo.

**Referência inicial:** [Juan — wiki](https://ordemparanormal.fandom.com/wiki/Juan); *Desconjuração*, *Calamidade* e *Hexatombe*.

### 3.21 O Diabo — `src/characters/o_diabo.js`; forma `forms/diabo.js`
**Implementação observada:** Bote do Diabo, garras, Renascimento e kit derivado da forma do Trono.

**Âncoras canônicas:** Relíquia de Sangue. Não é simplesmente outro nome de Juan: o Portador do Trono é a forma/fusão alcançada em uma fase narrativa específica.

**Auditoria proposta**
- [ ] Separar a entidade O Diabo selecionável da transformação de Juan; manter a semelhança mecânica onde justificada sem copiar identidade, atributos e contexto integralmente.
- [ ] Conferir se Renascimento é transformação/estado e como funciona o retorno ao kit base.
- [ ] Verificar a escala corporal, garras, chifres, manto e hitboxes em todos os golpes.
- [ ] Distinguir agressividade, agarrão, regeneração e pactos; evitar dar imunidade ou regeneração ilimitada sem fonte.
- [ ] Testar espelhamento O Diabo versus Juan transformado, KO durante transformação e retorno do modelo.

**Referência inicial:** [O Diabo — wiki](https://ordemparanormal.fandom.com/wiki/O_Diabo); *Calamidade*, *O Jogo do Anfitrião* e *Hexatombe*.

### 3.22 Ferreiro / Deus da Morte — `src/characters/ferreiro.js`; forma `forms/deus_morte.js`
**Implementação observada:** Espada Consumidora, Lodo arremessado, Hipnose Espiral, Mananciais, Conforto de Santo Berço, Armadura do Ferreiro e Pacto do Santo que pode levar ao Deus da Morte.

**Âncoras canônicas:** Ferreiro é o Luzidio que guarda Santo Berço e tem relação direta com a Relíquia de Morte; o Deus da Morte é um estado/chefe distinto e de escala muito maior.

**Auditoria proposta**
- [ ] Confirmar a condição exata de transformação e a relação entre sanidade, tempo e morte no código; garantir que a regra seja visível e não surpreenda injustamente.
- [ ] Diferenciar a espada que consome, o lodo, hipnose e os mananciais em efeitos claros.
- [ ] No Deus da Morte, ajustar escala de hitbox, câmera, distância e vulnerabilidade; confirmar fraquezas elementais somente com fonte confiável.
- [ ] Evitar que regeneração e tamanho tornem a luta sem contrajogo.
- [ ] Testar transformação por morte, reset de round, fraquezas, regeneração e encerramento de partida.

**Referência inicial:** [O Deus da Morte — wiki](https://ordemparanormal.fandom.com/wiki/Deus_da_Morte); [Santo Berço](https://ordemparanormal.fandom.com/wiki/Santo_Ber%C3%A7o); *O Segredo na Floresta*.

### 3.23 Arnaldo Fritz / O Anfitrião — `src/characters/arnaldo.js`; forma `forms/anfitriao.js`
**Implementação observada:** espada com fita vermelha, esgrima teatral, Emissor de Pulsos Paranormais, Finta Teatral, Pulso Paranormal e Rodopio da Fita. A relíquia do relógio permite transformar-se em O Anfitrião.

**Âncoras canônicas:** Arnaldo é ator e agente experiente; seu estilo é teatral, com floreios. O Anfitrião é a entidade/portador da Relíquia de Energia e deve ter identidade própria.

**Auditoria proposta**
- [ ] Separar a esgrima teatral de Arnaldo do kit de caos/tempo do Anfitrião.
- [ ] Conferir se o relógio/relíquia aparece na transição e se a forma dura pelo período definido pelo jogo.
- [ ] Validar se os pulsos do emissor atraem/afastam como previsto e se o jogador entende a direção do efeito.
- [ ] A forma Anfitrião deve ter animações e especial próprios, não ser só a espada com efeitos de Energia.
- [ ] Testar transição, efeitos de atração/repulsão, colisão, troca de modelo e retorno no próximo round.

**Referência inicial:** [Arnaldo Fritz — wiki](https://ordemparanormal.fandom.com/wiki/Arnaldo_Fritz); [O Anfitrião — wiki](https://ordemparanormal.fandom.com/wiki/O_Anfitri%C3%A3o); *Iniciação*, *Calamidade* e *O Jogo do Anfitrião*.

### 3.24 Senhor Veríssimo — `src/characters/verissimo.js`
**Implementação observada:** Espada do Arnaldo, Inteligência Estratégica, Brecha na Guarda, Em Seu Caminho, Jaqueta de Veríssimo, Oficial Comandante, Líder da Ordo Realitas e especial Olhos Sempre Abertos.

**Âncoras canônicas:** comandante da Ordo, estrategista, mentor e líder de equipe; usa a espada herdada de Arnaldo com esgrima disciplinada e econômica. Há uma exceção narrativa importante em sua relação com Kian e sua própria morte.

**Auditoria proposta**
- [ ] Diferenciar a esgrima de Veríssimo da teatralidade de Arnaldo, apesar de compartilharem a espada.
- [ ] Inteligência Estratégica deve refletir comando/abertura tática, não ser só um ataque de dano.
- [ ] Conferir Segredo de Veríssimo e Olhos Sempre Abertos com a fonte e decidir se a referência será mecânica, narrativa ou apenas visual.
- [ ] Se a habilidade de liderança conceder ação extra a aliados, limitar e testar para evitar loops em modo 2 jogadores/CPU.
- [ ] Testar interceptação, proteção de aliado, comandos de equipe e combate solo sem perder a identidade de comandante.

**Referência inicial:** [Senhor Veríssimo — wiki](https://ordemparanormal.fandom.com/wiki/Senhor_Ver%C3%ADssimo); temporadas da Ordo Realitas, especialmente *Iniciação*, *Calamidade* e *O Jogo do Anfitrião*.

### 3.25 O Estrangeiro — `src/characters/estrangeiro.js`
**Implementação observada:** garras longas, Rajada Psíquica, Comandar, Oblívio, Aparição, Abdução, Toque Sutil e Tortura Mental.

**Âncoras canônicas:** criatura ligada à transmissão de sinais, abdução, apagamento/controle e presença alienígena. O kit deve comunicar controle e horror psicológico, não só dano de garras.

**Auditoria proposta**
- [ ] Confirmar quais poderes pertencem ao Estrangeiro e quais são adaptações do jogo; a inclusão no grupo de Portadores é uma decisão de elenco, não prova de que porta uma Relíquia.
- [ ] Diferenciar Comandar (controle), Oblívio (apagamento/ausência), Aparição (deslocamento) e Abdução (captura/transporte).
- [ ] Confirmar visual da máscara, fios, capa e proporções com a referência; não inventar teleporte ilimitado se a cena não sustenta.
- [ ] Dar contrajogo ao controle mental: telegraph, duração, resistência ou escape.
- [ ] Testar abdução em bordas, câmera, retorno do alvo, interrupção, invulnerabilidade e fim de round.

**Referência inicial:** [O Estrangeiro — wiki](https://ordemparanormal.fandom.com/wiki/O_Estrangeiro); *O Segredo na Ilha* e material associado.

### 3.26 Amigo Imaginário — `src/characters/amigo.js`
**Implementação observada:** garras/tentáculos, Derreter, Tentáculos que Prendem, O Sino, Bichos da Ilha, Dissolver e especial Todo Mundo Vai Morrer.

**Âncoras canônicas:** criatura de *O Segredo na Ilha*, “A Obra de Arte Perfeita”, associada à tinta, aos sinos e a uma união impossível de elementos. A aparência curvada, capuz, tentáculos e rosto sem feições deve estar alinhada à fonte.

**Auditoria proposta**
- [ ] Distinguir tentáculo físico, tinta/derreter, aprisionamento, dissolução e efeitos do Sino.
- [ ] Confirmar o vínculo entre a criatura, Barnabé, Tipora e o sino; não atribuir poderes por cor ou por tema sem fonte.
- [ ] Verificar se o especial Todo Mundo Vai Morrer representa o horror/escala da criatura sem ser apenas uma explosão de tinta.
- [ ] Conferir se o corpo tem animação irregular/assimétrica e se os tentáculos acompanham o movimento sem atravessar o chão de modo acidental.
- [ ] Testar agarrão, dissolução, invulnerabilidade, colisão de tentáculos, câmera e legibilidade contra cenários escuros.

**Referência inicial:** [Amigo Imaginário — wiki](https://ordemparanormal.fandom.com/wiki/Amigo_Imagin%C3%A1rio); *O Segredo na Ilha*.

### 3.27 A Magistrada — `src/characters/magistrada.js`
**Implementação observada:** bengala e Mão das Sombras, Chamar as Máscaras, Dimensão das Sombras, Olhar do Desespero, Controle Mental, Dispersão de Dano, Levitação e forma/estado Saber Tudo é Perder Tudo.

**Âncoras canônicas:** portadora da Relíquia de Conhecimento, líder da Seita das Máscaras, ligada a regras, sombras e ao custo de saber. A autoridade dela deve aparecer em controle e decisão, não somente em ataques de energia.

**Auditoria proposta**
- [ ] Confirmar o que a Magistrada faz com as máscaras e se o jogo representa chamar/controlar as máscaras de forma coerente.
- [ ] Diferenciar Dimensão das Sombras, Mão das Sombras e controle mental por função, telegraph e contrajogo.
- [ ] Verificar Dispersão de Dano: quem recebe o dano e qual é o limite; garantir que não resulte em invulnerabilidade permanente.
- [ ] Conferir a forma/estado Saber Tudo é Perder Tudo e evitar transformar o conceito em mero buff de atributos.
- [ ] Testar controle de alvo, múltiplas máscaras, alvos fora da tela, absorção/redistribuição de dano e reset de round.

**Referência inicial:** [A Magistrada — wiki](https://ordemparanormal.fandom.com/wiki/A_Magistrada); [Relíquias da Calamidade](https://ordemparanormal.fandom.com/wiki/Rel%C3%ADquias_da_Calamidade); *Desconjuração* e *Calamidade*.

### 3.28 Kian — `src/characters/kian.js`; forma `forms/kian_calamidade.js`
**Implementação observada:** luta desarmada, Teletransporte, Levitação, Lâmina do Medo, Rejeitar Névoa, Toque da Morte, Inexistir e Realizador da Calamidade.

**Âncoras canônicas:** primeiro ocultista, força física e paranormal excepcional, ligado a Conhecimento/Calamidade; a Lâmina do Medo é uma manifestação temporária, não uma espada comum.

**Auditoria proposta**
- [ ] Reaproveitar `docs/AUDITORIA-KIAN-JOUI.md` e conferir cada poder por fase.
- [ ] Rejeitar Névoa precisa ter uma função útil contra os efeitos compatíveis do elenco, sem anular todo especial, projétil ou transformação.
- [ ] Distinguir teletransporte, levitação, força física e rituais; evitar que todos virem ataques de avanço.
- [ ] A forma Realizador da Calamidade deve mudar o kit e a presença visual de forma coerente; não apenas aumentar dano/vida.
- [ ] Testar contra Kaiser e outros usuários de zona/névoa, mas também contra personagens sem névoa, para assegurar que a habilidade tenha uma utilidade consistente.

**Referência inicial:** [Kian — wiki](https://ordemparanormal.fandom.com/wiki/Kian); *Desconjuração* e *Calamidade*.

### 3.29 Raziel — `src/characters/raziel.js`; forma `forms/raziel_verdadeiro.js`
**Implementação observada:** garras, Rasgo de Sangue, Bote Retalhador, Mordida, Endurecer Sangue, Maldição Sanguínea, Banquete de Sangue e O Verdadeiro Raziel.

**Âncoras canônicas:** líder dos Vampiros, Combatente Monstruoso com afinidade em Sangue; postura aristocrática na forma base, velocidade de vulto, resistência temporária, mordidas e devoração de vítimas vulneráveis na forma bestial.

**Auditoria proposta**
- [ ] RZ-01: Turno Extra não deve ser representado só por `attackSpeed: 1.12`; definir uma ação adicional/cancelamento limitado com contrajogo.
- [ ] RZ-02: Sede Incontrolável precisa reconhecer alvo vulnerável próximo e acionar devoração na forma verdadeira, sem tentar executar um alvo já em KO.
- [ ] RZ-03: Banquete Bestial deve ter sequência própria, mais brutal, diferente do Banquete de Sangue.
- [ ] RZ-04: documentar Rasgo de Sangue como adaptação de gameplay ou substituí-lo por avanço de garras mais fiel à velocidade de vulto.
- [ ] RZ-05: documentar a conversão da penalidade de −1 dado da Maldição Sanguínea para um debuff de combate em tempo real.
- [ ] RZ-06: Endurecer Sangue deve reduzir dano sem virar imunidade universal.
- [ ] RZ-07: separar mecanicamente forma aristocrática e forma bestial; a segunda deve priorizar pressão, mordida, devoração e punição de vulneráveis.
- [ ] RZ-08: não importar toda a ficha de RPG sem adaptação consciente.
- [ ] RZ-09: testar esquiva, bloqueio, alvo crítico, CPU, multiplayer, KO, transformação, especial e retorno de round.

**Referências iniciais:** [Raziel — wiki](https://ordemparanormal.fandom.com/wiki/Raziel), [Vampiros — wiki](https://ordemparanormal.fandom.com/wiki/Vampiros), [Monstruosos — wiki](https://ordemparanormal.fandom.com/wiki/Monstruosos); *Hexatombe*, episódios 7–9, principalmente “Banho de Sangue”.

### 3.30 Revisão final cruzada — formas, elementos e documentação
- [ ] Comparar `src/characters/forms/index.js` com `src/characters/index.js`; garantir que toda forma esteja registrada e que a UI não exponha alias confuso.
- [ ] Para cada forma, identificar se é transformação temporária, estado narrativo, chefe, entidade separada ou skin. Não misturar essas categorias.
- [ ] Conferir `element` e `energyColor` contra a fonte canônica; cor não comprova elemento.
- [ ] Verificar que cada habilidade documentada em `HABILIDADES.md` exista no código com o mesmo nome, efeito, custo, duração e condição.
- [ ] Verificar especiais acima do padrão global documentado; registrar discrepâncias, não corrigir números sem teste e aprovação.
- [ ] Fazer a revisão visual dos modelos, armas, roupas, poses e animações; um nome correto não garante fidelidade de silhueta ou comportamento.
- [ ] Depois das alterações aprovadas, atualizar `TODO.md`, `CHANGELOG-ADMIN.md`, `HABILIDADES.md` e versão do cliente; rodar `npm ci`, `npm run check`, `npm test` e `npm run build`.

## 4. Regras para preservar a qualidade do jogo

-   **Fidelidade não é cópia literal:** uma ação de turno do RPG pode
    virar uma janela de cancelamento ou uma ação contextual, desde que a
    intenção original seja preservada e a adaptação esteja documentada.
-   **Não criar imunidades a partir de uma única cena:** resistir,
    continuar lutando ou avançar não significa ser imune.
-   **Não transformar todo poder em dano:** rituais, controle, defesa,
    mobilidade, pressão, suporte e condição contextual devem continuar
    diferentes.
-   **Transformação importante exige identidade própria:** novos golpes,
    regras de uso, animações e/ou interação; não só
    dano/velocidade/vida.
-   **Oponentes vulneráveis não são necessariamente alvos em KO:**
    qualquer devoração contextual deve ser executada antes do estado
    terminal e respeitar o fluxo de combate.
-   **Não alterar o balanceamento global nesta etapa:** primeiro
    implementar as lacunas canônicas aprovadas; depois medir dano,
    duração e taxa de vitória.
-   **Não remover o que já funciona sem substituição aprovada.** Se uma
    habilidade for uma licença de gameplay, pode permanecer, desde que
    seja identificada como adaptação.
-   **O jogador decide o que vira escopo:** propostas de novas
    habilidades, interações de equipe e especiais canônicos precisam de
    aprovação antes de implementação.

## 5. Referências e fontes

-   [Raziel --- Ordem Paranormal
    Wiki](https://ordemparanormal.fandom.com/wiki/Raziel)
-   [Vampiros --- Ordem Paranormal
    Wiki](https://ordemparanormal.fandom.com/wiki/Vampiros)
-   [Monstruosos --- Ordem Paranormal
    Wiki](https://ordemparanormal.fandom.com/wiki/Monstruosos)
-   [Sobrevivendo ao Horror --- Ordem Paranormal
    Wiki](https://ordemparanormal.fandom.com/wiki/Ordem_Paranormal_RPG%3A_Sobrevivendo_ao_Horror)
-   [Hexatombe, episódio 7 --- "Consequências" (canal
    oficial)](https://www.youtube.com/watch?v=K_c2VdmPuLg)
-   [Hexatombe, episódio 8 --- "Culpa" (canal
    oficial)](https://www.youtube.com/watch?v=-7prXUHT8OM)
-   [Hexatombe, episódio 9 --- "Banho de Sangue" (canal
    oficial)](https://www.youtube.com/watch?v=p5alZam12ss)
-   [Site oficial de Ordem Paranormal](https://ordemparanormal.com.br/)

**Ordem de execução sugerida:** RZ-01 e RZ-02 → RZ-03 → RZ-04 e RZ-05 →
RZ-06 e RZ-07 → testes RZ-09 → auditoria de Kian/Joui e dos demais
grupos. Não começar a auditoria inteira do elenco com uma alteração
global ou uma reescrita dos personagens.
