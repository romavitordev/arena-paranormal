# TODO — ARENA PARANORMAL

**Versão de referência atual:** v3.40.0 (revisado em 2026-10-25: Balu e Lírio remodelados no Blender pela arte)
**Documento:** TODO principal
**Histórico de desenvolvimento:** Changelog Admin + Changelog Cliente

---


# PRÓXIMA GRANDE ATUALIZAÇÃO — LUTA + MODO PvE (planejamento de 2026-10-18)

**Estado em 2026-10-22 (v3.34.0):**
- [~] 2.2 Modelos antigos: Xande e Aguiar (v3.33.0), Fantasma, Kemi e Gal Sal + as lâminas Ereškigal (v3.34.0) refeitos
  pelas artes oficiais; próximos, em ordem de data: Kaiser, Balu... (ver *MODELOS — PRÓXIMOS PASSOS*).
- [~] 2.3 Especiais em equipe: Barra de Equipe, Especial simplificado e Transformação em equipe prontos (F1/F2/F3); a tabela de ligações
  `src/config/teamLinks.js` existe mas ainda não está ligada (F4, ver *EQUIPE*).
- [ ] 2.1 Animações de movimentação, 2.4 câmera de cutscenes.
- [ ] 3–14 Modo PvE, que vai se chamar **Outro Lado** (dungeons, Espreitador como chefe, progressão, salvamento,
  cooperativo): não iniciado; já anunciado como "em desenvolvimento, sem data" na página Sobre.
- [x] arrumar posição das facas/espadas nas mãos dos personagens (feito em 2026-10-23: o cabo atravessa o punho fechado
  — `inFist` em `models/props.js` —, a lâmina sai pelo lado do polegar e o pomo aparece embaixo).

## 1. Objetivo da atualização

Esta atualização tem como objetivo ampliar o Arena Paranormal sem descaracterizar sua proposta original de jogo de luta 3D. O desenvolvimento será dividido em duas frentes principais:

- **Melhorias no jogo de luta atual:** animações, modelos, especiais em equipe, câmera e interface de combate.
- **Criação de um novo modo PvE:** dungeons, chefes, progressão, melhorias temporárias e permanentes, salvamento e possibilidade de jogar cooperativamente.

O desenvolvimento deverá aproveitar os sistemas existentes sempre que possível. Antes de criar ou substituir qualquer sistema, será necessário analisar a arquitetura atual do jogo, seus personagens, as arenas, a inteligência artificial, a sincronização multiplayer e os mecanismos de salvamento.

### Importante: separar o que será feito agora do que ficará para o futuro

A criação do modo PvE e a implementação das primeiras dungeons fazem parte do escopo desta atualização.

**A adição do Espreitador como personagem selecionável e jogável é uma possibilidade futura, não uma entrega obrigatória desta atualização.** Nesta etapa, ele poderá ser desenvolvido como chefe de uma dungeon, com comportamentos, animações e habilidades específicas para esse confronto. Sua versão jogável poderá ser planejada posteriormente, depois de o modo PvE estar estabelecido.

O projeto também deverá ser preparado para receber novas dungeons e chefes em futuras atualizações, sem exigir a reconstrução do modo PvE a cada expansão.

---

## 2. Melhorias no jogo de luta atual

ARENA PARANORMAL — FEEDBACK
Auditoria e revisão de Kian e Joui: habilidades, transformações e fidelidade ao cânone
Data: 25/10/2026

IMPORTANTE
Este documento reúne o feedback do Vitor até agora. NÃO é autorização para reconstruir os personagens do zero nem para alterar o balanceamento global. Antes de implementar, leia o código REAL da versão atual do repositório e a documentação existente. Não presuma que uma habilidade existe, não existe ou funciona de determinada maneira sem conferir a implementação.

OBJETIVO GERAL
Alguns personagens possuem transformações narrativamente importantes. Quando ativadas, essas formas devem representar suas versões mais poderosas e mudar de verdade o kit de habilidades: poderes, funções, efeitos, animações e possibilidades de combate. Não basta aumentar dano, velocidade ou resistência e manter as mesmas skills.

Preservar o que já funciona, manter compatibilidade com o sistema de combate e fazer alterações localizadas. O foco é fidelidade ao cânone e identidade mecânica de cada forma.

ETAPA 1 — AUDITORIA OBRIGATÓRIA DO REPOSITÓRIO
1. Leia README.md, TODO.md, CHANGELOG-ADMIN.md, HABILIDADES.md e quaisquer documentos específicos sobre personagens/transformações.
2. Localize os arquivos reais de Kian e Joui e todos os pontos que definem:
   - kit normal e kit transformado;
   - nomes, descrições, dano, custo de energia, cooldown e duração;
   - condições de ativação, encerramento e retorno à forma normal;
   - animações, VFX, hitboxes, telegraph, interrupções, invulnerabilidade e efeitos de status;
   - Ultimate, passivas, IA/CPU e lógica de seleção de habilidade.
3. Faça uma tabela de auditoria para cada personagem: habilidade atual, comportamento real no código, relação com o cânone, problema encontrado e recomendação.
4. Diferencie claramente fatos do código, fatos canônicos e propostas de design. Não apresente ideias novas como se fossem habilidades oficiais.
5. Não comece a implementar antes de concluir essa auditoria e conferir as referências canônicas.

KIAN — PROBLEMAS E DIREÇÃO DE DESIGN
Feedback do Vitor:
- Kian está forte fisicamente e consegue fazer combos. Isso não é a prioridade principal da revisão.
- As habilidades atuais não parecem suficientemente fiéis ao cânone; revisar principalmente a versão transformada, que deve representar Kian em Calamidade, na sua versão de maior poder.
- A forma transformada precisa ter um kit próprio e claramente mais poderoso, centrado em rituais e manifestações de Conhecimento, e não ser apenas Kian normal com atributos aumentados.
- Revisar também habilidades que se tornam pouco úteis em partidas normais.

PONTO ESPECÍFICO: REJEITAR NÉVOA
O feedback do jogador é que Rejeitar Névoa fica praticamente inútil quando não há um Kaiser como adversário.
- Inspecione a implementação atual e identifique exatamente o que o poder faz, quais condições o ativam e por que depende do Kaiser.
- Não mantenha uma habilidade situacional quase sem função em confrontos comuns sem avaliar alternativas.
- Proponha uma função útil contra outros personagens, coerente com o ritual e com as regras já existentes. Exemplos de DIREÇÃO POSSÍVEL, não decisões fechadas: dissipar/neutralizar uma manifestação paranormal ativa, interromper ou enfraquecer um efeito sobrenatural específico, ou criar uma janela curta de proteção/negação contra um ataque paranormal.
- Não invente uma mecânica genérica que contradiga o ritual. Defina alvos válidos, duração, alcance, custo, cooldown, feedback visual e contrajogo.
- Se a interação exclusiva com Kaiser for importante para a fidelidade, preserve-a como interação especial, mas faça a habilidade continuar tendo utilidade equilibrada fora desse confronto.
- Evite transformar a habilidade em um botão universal que anula qualquer skill. Teste contra personagens diferentes e documente as exceções.

REFERÊNCIAS CANÔNICAS A INVESTIGAR PARA KIAN
Verifique fontes confiáveis da wiki e/ou material canônico antes de fechar nomes e funções. Investigue, quando aplicável à fase escolhida, Inexistir, Teletransporte, Toque da Morte, Lâmina do Medo, Rejeitar Névoa e o domínio de Kian sobre rituais. Confirme a nomenclatura e o contexto de cada habilidade; não inclua automaticamente todas no jogo.
A versão selecionada precisa ser explícita: Kian em Calamidade, com a condição de poderes correspondente à fase narrativa escolhida. Não misture fases contraditórias.

Direção de gameplay para Kian transformado:
- identidade de ocultista extremamente poderoso;
- controle sobrenatural e manipulação de posição/estado do adversário;
- rituais com funções distintas: controle, mobilidade, pressão e finalização;
- efeitos visuais de Conhecimento/sigilos consistentes com o estilo visual já existente;
- ultimate e transformação com apresentação própria, sem copiar literalmente cenas da série em todo golpe;
- manter o combate físico atual onde ele funciona, sem deixar que ele seja a única parte interessante do personagem.

JOUI — TRANSFORMAÇÃO E KATANA DA MAGISTRADA
Feedback do Vitor:
- Joui tem problema semelhante ao Kian: a forma transformada deve representar uma versão realmente mais poderosa, com kit diferente.
- A transformação do Joui pode usar a katana recebida de Magistrada: Shi no Kage.
- A transformação deve comunicar visual e mecanicamente que a arma e o conjunto de habilidades mudaram. Não basta trocar a aparência ou aumentar atributos.

IMPORTANTE SOBRE AS FASES DO JOUI
Investigue e diferencie corretamente:
- Joui usando os poderes da máscara / fase da Seita das Máscaras;
- Joui após deixar de ter a máscara e receber a Shi no Kage, a katana de Conhecimento concedida por Magistrada.
Não misture automaticamente poderes da máscara com a fase posterior. A decisão de qual fase a transformação do jogo representa precisa ficar explícita e coerente com o cânone.

DIREÇÃO DE DESIGN PARA A FORMA TRANSFORMADA DO JOUI
- Usar a Shi no Kage como arma visual e mecânica da transformação, se isso se encaixar no sistema e no modelo já disponível.
- A katana deve mudar os golpes, o alcance/ritmo e as animações de forma perceptível, respeitando o que os assets atuais permitem.
- Priorizar esgrima técnica, cortes precisos, pressão ofensiva e movimentação ágil; não transformar Joui em um conjurador genérico.
- Se a transformação escolhida for especificamente Joui Mascarado, o kit deve ser baseado na máscara e nos poderes correspondentes, incluindo o uso de sombras/teleporte apenas se a fonte canônica e a implementação justificarem.
- Se a forma for Joui com Shi no Kage, não conceder automaticamente todos os poderes da máscara. Pode ser necessário tratar essas como fases/formas diferentes.
- Verifique a existência de modelo, textura, katana e animações antes de propor assets novos. Reutilize os recursos existentes sempre que possível; não invente caminhos de arquivo.

REFERÊNCIAS CANÔNICAS A INVESTIGAR PARA JOUI
Confirme em fontes confiáveis:
- a origem e o nome correto da katana Shi no Kage;
- a relação da arma com Magistrada e Conhecimento;
- quais poderes pertencem à fase da máscara e quais pertencem ao Joui posterior;
- a nomenclatura e os feitos realmente mostrados em material canônico.
Não apresente propostas de gameplay como se fossem poderes oficiais.

CRITÉRIOS PARA A TRANSFORMAÇÃO DOS DOIS
Uma transformação importante deve:
1. Ter identidade visual inequívoca.
2. Trocar ou modificar significativamente o kit de skills.
3. Ter nomes e efeitos fiéis à versão narrativa escolhida.
4. Fazer o jogador sentir que desbloqueou a versão mais poderosa daquele personagem.
5. Ter animações, VFX, telegraphs, hitboxes e feedback legíveis.
6. Continuar balanceada no contexto do jogo, sem resolver tudo com dano excessivo.
7. Funcionar contra vários personagens e na CPU, não apenas em uma interação específica.
8. Retornar ao estado normal corretamente ao terminar, sem deixar buffs, armas ou estados presos.

TESTES OBRIGATÓRIOS
- Testar transformação e retorno à forma normal.
- Testar todas as habilidades novas e modificadas com energia suficiente e insuficiente.
- Testar cooldown, interrupção, bloqueio, esquiva, acerto, erro e KO durante as animações.
- Testar contra vários personagens, incluindo Kaiser para Rejeitar Névoa, e também adversários que não sejam Kaiser.
- Verificar que a IA/CPU consegue escolher e executar as habilidades sem travar ou repeti-las de forma problemática.
- Verificar que trocar de personagem, reiniciar partida ou terminar a luta não deixa efeitos residuais.
- Rodar os testes/comandos existentes no projeto e relatar exatamente o que foi executado. Não afirmar que algo foi testado se não foi.

DOCUMENTAÇÃO E ENTREGA
Após a auditoria e, se autorizada/necessária, a implementação:
- Atualize HABILIDADES.md com nomes, funções, custos e cooldowns reais.
- Atualize TODO.md marcando apenas o que foi efetivamente concluído.
- Atualize CHANGELOG-ADMIN.md com resumo das alterações e testes realizados.
- Atualize README/versão por último, seguindo o fluxo existente do projeto.
- Preserve o estilo e a arquitetura atuais; não faça refatoração ampla nem passe de balanceamento geral fora do escopo.
- Apresente ao Vitor um resumo: o que estava errado, o que foi alterado, quais referências canônicas foram usadas, testes executados e limitações restantes.

ESCOPO ATUAL
Este é um feedback. Kian e Joui são o foco inicial. Não considere o feedback global finalizado; outras observações do Vitor podem ser acrescentadas depois.

### 2.1. Novas animações de movimentação

Adicionar e aprimorar animações de movimentação para deixar os personagens mais naturais e responsivos durante as batalhas.

As animações deverão respeitar o estilo de luta de cada personagem e ser compatíveis com os sistemas atuais de movimentação, ataques, esquivas e habilidades.

### 2.2. Atualização dos modelos antigos

Revisar os modelos 3D dos personagens antigos, identificando problemas visuais, diferenças de qualidade e oportunidades de melhoria.

As alterações deverão preservar a identidade visual dos personagens e a compatibilidade com suas animações, habilidades e sistemas de combate.

### 2.3. Melhoria dos especiais em equipe

Aprimorar os ataques especiais realizados em conjunto, dando mais destaque às animações, à participação dos personagens envolvidos, aos efeitos visuais e à sensação de impacto.

As melhorias deverão considerar a sincronização entre os personagens, a câmera e o momento em que o dano é aplicado.

### 2.4. Melhorias na câmera de cutscenes

Aprimorar os enquadramentos e movimentos da câmera durante as cenas especiais, ataques cinematográficos e transições.

A câmera deverá valorizar os personagens e as ações importantes sem perder o controle da posição dos jogadores nem causar cortes bruscos ou enquadramentos inadequados.

---

## 3. Novo modo PvE — dungeons e chefes

### 3.1. Conceito do modo

O modo PvE será uma experiência de progressão baseada em dungeons, exploração, combate contra inimigos e confrontos contra chefes inspirados nas criaturas do Outro Lado.

O jogador poderá iniciar uma campanha, escolher um personagem disponível e avançar por diferentes dungeons. Cada dungeon terá uma identidade própria, com cenário, ambientação, desafios e um chefe principal.

A experiência deverá ter uma progressão inspirada em jogos como *Vampire Survivors*: durante uma tentativa, o jogador conquista melhorias temporárias e desenvolve uma combinação de poderes. Ao morrer, perde essa evolução temporária, mas mantém parte do progresso permanente conquistado.

O objetivo é incentivar o jogador a aprender os padrões dos chefes, experimentar combinações de habilidades e tentar avançar cada vez mais longe.

### 3.2. Formas de jogar

O modo deverá ser planejado para funcionar em três formatos:

- **Solo:** um jogador enfrenta a dungeon e seus desafios.
- **Cooperativo local:** dois jogadores enfrentam os inimigos e o chefe juntos.
- **Cooperativo online:** jogadores em uma mesma sessão compartilham a experiência de explorar e derrotar os chefes.

No PvE cooperativo, os jogadores lutarão contra os desafios da dungeon. Não deverá ser utilizado o formato tradicional de batalha em equipe do jogo de luta atual como estrutura obrigatória desse modo.

O cooperativo deverá ter regras próprias para inimigos, chefes, recompensas, progressão e sincronização. A implementação online precisa ser analisada com cuidado, pois o multiplayer de luta existente não garante, por si só, que já exista suporte para sincronizar uma dungeon inteira.

### 3.3. Seleção de personagens

Os jogadores poderão utilizar os personagens jogáveis disponíveis no jogo, respeitando as restrições específicas de cada dungeon.

Criaturas do Outro Lado que forem utilizadas como chefes não deverão poder ser selecionadas pelos jogadores naquela dungeon enquanto isso permitiria escolher o próprio chefe ou quebrar a proposta do confronto.

Essa restrição deverá ser definida por dungeon, evitando uma proibição global desnecessária de personagens que não sejam chefes naquele conteúdo.

---

## 4. Como as dungeons funcionarão

### 4.1. Estrutura geral de uma dungeon

Cada dungeon deverá funcionar como uma pequena experiência completa, e não apenas como uma arena com um chefe no centro.

O fluxo pretendido será:

1. O jogador entra em uma dungeon e conhece o ambiente.
2. Explora o mapa, identifica caminhos e se prepara para o confronto.
3. Caso sejam implementados inimigos menores, enfrenta esses adversários e pode obter recursos para sobreviver.
4. Encontra a área ou o evento que inicia o confronto contra o chefe.
5. Enfrenta o chefe, que deverá ter padrões de ataque, habilidades e comportamentos próprios.
6. Após a vitória, recebe acesso à saída e pode coletar as recompensas.
7. Atravessa a porta de saída para avançar para a próxima dungeon.

A duração, o tamanho do mapa e a quantidade de desafios poderão variar de acordo com o chefe e com a proposta da dungeon.

**A prioridade é fazer cada dungeon parecer um território pertencente à criatura que o domina.** O cenário, os obstáculos, a iluminação, os efeitos e os desafios deverão reforçar a identidade do chefe enfrentado.

### 4.2. Mapas personalizados

As dungeons deverão contar com mapas próprios, criados para o modo PvE. Não basta reutilizar as arenas tradicionais de luta e apenas colocar um chefe nelas.

Cada mapa poderá ter:

- Corredores, salas, passagens estreitas e áreas abertas.
- Obstáculos e elementos de cenário que influenciem o combate.
- Rotas que ajudem a criar tensão ou preparar o encontro com o chefe.
- Elementos visuais que indiquem a presença e a influência da criatura.
- Uma área apropriada para o confronto principal.
- Uma saída que só seja liberada depois da vitória contra o chefe.

Nem todas as dungeons precisam seguir a mesma estrutura. Algumas podem enfatizar exploração e tensão; outras podem ser mais diretas e focadas no combate. O importante é que cada uma tenha personalidade própria.

### 4.3. Inimigos menores antes do chefe

A presença de inimigos menores antes do chefe deverá ser avaliada durante o desenvolvimento. Essa mecânica é interessante porque pode transformar a dungeon em uma jornada com preparação, em vez de levar o jogador diretamente para uma luta isolada.

Caso sejam implementados, esses inimigos deverão ser mais simples do que o chefe principal. Eles poderão testar a capacidade de combate do jogador, ocupar determinadas áreas do mapa e aumentar a tensão antes do confronto final.

Entretanto, eles não deverão ser usados apenas para aumentar artificialmente a duração da dungeon. Sua quantidade, resistência e dano deverão ser adequados à progressão, especialmente no modo cooperativo.

#### Drops de cura

**Os inimigos menores deverão ter uma chance de deixar itens de cura, garantindo uma possibilidade de recuperação antes do chefe.**

O sistema de drops deverá ser configurável, permitindo ajustar a probabilidade e a quantidade de itens sem alterar diretamente o código de cada inimigo.

As regras pretendidas são:

- Inimigos menores poderão deixar itens de cura ao serem derrotados.
- A cura não deverá ser garantida a cada eliminação, mas a chance precisa ser relevante o suficiente para ter utilidade prática.
- Os itens deverão aparecer em uma posição acessível, permitindo que o jogador os colete.
- A quantidade de cura deverá ser equilibrada para ajudar na preparação sem eliminar a necessidade de jogar bem.
- A dificuldade do chefe e o tamanho da dungeon deverão ser considerados ao ajustar as chances de drop.
- No cooperativo, as regras de coleta e distribuição dos itens deverão ser definidas para evitar disputas injustas entre os jogadores.

A cura antes do chefe é especialmente importante porque o jogador poderá chegar ao confronto com a vida reduzida após a exploração ou os combates anteriores.

Se os testes indicarem que uma dungeon é excessivamente punitiva, deverão ser ajustados os drops, os desafios anteriores ou os recursos disponíveis. Não se deve depender exclusivamente de o jogador já possuir melhorias permanentes para conseguir sobreviver.

### 4.4. Aleatoriedade e expansão futura

Inicialmente, o desenvolvimento poderá começar com uma quantidade pequena de dungeons, suficiente para validar o funcionamento do modo PvE.

**No futuro, quando houver várias dungeons disponíveis, a próxima dungeon poderá ser selecionada aleatoriamente após o jogador atravessar a porta de saída.**

A ideia é aumentar a variedade entre tentativas, fazendo com que o jogador não enfrente necessariamente a mesma sequência de dungeons em todas as campanhas.

O sistema deverá ser planejado para permitir:

- Adicionar novas dungeons sem reconstruir a lógica de progressão.
- Registrar quais dungeons estão disponíveis para seleção.
- Definir requisitos, restrições e chefes de cada dungeon.
- Selecionar aleatoriamente uma dungeon válida para a próxima etapa.
- Evitar a seleção de conteúdo bloqueado, indisponível ou incompatível com o progresso atual.
- Manter a progressão sincronizada entre os jogadores de uma sessão cooperativa.

A aleatoriedade deverá respeitar a estrutura da campanha. Uma dungeon não poderá ser escolhida se o jogador ainda não tiver cumprido seus requisitos ou se ela não estiver habilitada para aquela etapa.

Também será necessário avaliar a repetição de dungeons consecutivas. Caso a quantidade de opções permita, o sistema poderá priorizar dungeons diferentes da anterior.

Não é necessário implementar uma aleatoriedade complexa antes de haver conteúdo suficiente. A primeira versão pode utilizar uma sequência controlada ou uma lista pequena de opções, desde que a arquitetura facilite a expansão futura.

### 4.5. Dificuldade

Os chefes deverão ser desafiadores mesmo na dificuldade Fácil. Isso não significa torná-los injustos, mas exigir que o jogador observe os padrões de ataque, escolha os momentos de atacar e utilize suas habilidades corretamente.

A dificuldade poderá influenciar:

- Dano e resistência dos inimigos.
- Frequência, velocidade e combinação de ataques.
- Comportamento e pressão exercida pelo chefe.
- Recursos de recuperação disponíveis.
- Quantidade e força dos inimigos menores.
- Escalonamento de desafios no cooperativo.

No multiplayer, a dificuldade deverá aumentar de maneira controlada para considerar a presença de mais de um jogador. Não se deve simplesmente multiplicar a vida do chefe sem avaliar o tempo de combate, a quantidade de ataques e a dificuldade de evitar o dano.

O objetivo é que o cooperativo ofereça um desafio próprio, sem se tornar automaticamente mais fácil ou injustamente mais difícil.

---

## 5. Primeira dungeon: o território do Espreitador

### 5.1. Papel do Espreitador

O Espreitador será utilizado como referência para a primeira dungeon temática, caso essa seja a criatura escolhida para iniciar o desenvolvimento do modo PvE.

Ele será tratado inicialmente como um chefe controlado pela inteligência artificial, e não como um personagem selecionável.

**A criação do Espreitador como personagem jogável fica para uma atualização futura.** O desenvolvimento do chefe poderá aproveitar conceitos de suas habilidades, mas não deverá depender da conclusão de uma versão jogável completa.

### 5.2. Conceito do mapa

A dungeon deverá representar um território dominado pelo Espreitador, com sensação constante de vulnerabilidade e perseguição.

O mapa poderá apresentar:

- Corredores estreitos, salas conectadas e frestas.
- Armários espalhados pelo cenário, relacionados à identidade da criatura.
- Pontos de passagem que criem dúvidas sobre a rota mais segura.
- Áreas de pouca visibilidade e elementos que indiquem a presença do chefe.
- Um espaço final apropriado para a luta principal.

As frestas e passagens deverão fazer parte do desenho do mapa, não apenas servir como decoração. Elas poderão criar caminhos alternativos, áreas de risco ou pontos de observação, desde que isso seja compatível com os sistemas de movimentação existentes.

### 5.3. Etapas do confronto

A dungeon poderá ser organizada em três momentos:

**Etapa 1 — Exploração e tensão**

O jogador começa a explorar o território e entende gradualmente a disposição do mapa. Caso existam inimigos menores, eles poderão aparecer nessa etapa, oferecendo combate e uma oportunidade de obter cura antes do chefe.

**Etapa 2 — Perseguição e domínio do território**

O Espreitador começa a demonstrar sua presença por meio de eventos, aparições ou ataques. Armários e passagens do mapa poderão participar da mecânica de perseguição, preparando o jogador para o confronto.

Esses eventos deverão ser desenvolvidos com cuidado para não prender o jogador em sequências inevitáveis de dano. A ameaça precisa ser compreensível e oferecer oportunidades de reação.

**Etapa 3 — Confronto contra o chefe**

O jogador enfrenta o Espreitador diretamente. O chefe deverá utilizar habilidades compatíveis com sua identidade, com sinais visuais ou animações que permitam reconhecer ataques importantes.

A luta deverá ter espaço suficiente para movimentação, esquiva e utilização das habilidades dos personagens escolhidos.

As três etapas são uma proposta de estrutura, não uma exigência de que todas as dungeons futuras tenham exatamente o mesmo formato.

---

## 6. Recompensas, experiência e melhorias durante a dungeon

### 6.1. Recompensa física após derrotar o chefe

Quando o chefe for derrotado, deverá surgir um item de recompensa na região em que ele morreu.

O jogador precisará ir até esse local e coletar a recompensa para receber a experiência ou os recursos correspondentes.

A coleta deverá ser perceptível, com indicação visual e retorno na interface. Isso cria um pequeno momento de conclusão e evita que todas as recompensas sejam concedidas automaticamente sem interação.

No cooperativo, o sistema deverá definir claramente se a recompensa será individual ou compartilhada, evitando que um jogador fique sem progresso por não conseguir alcançar o item a tempo.

### 6.2. Evolução temporária durante a campanha

Durante a dungeon, o jogador poderá ganhar experiência e subir de nível. Cada evolução poderá oferecer opções de melhoria, como:

- Aumentar temporariamente a vida máxima.
- Aumentar o dano de ataques ou habilidades.
- Melhorar a defesa ou a capacidade de sobrevivência.
- Melhorar a eficiência de energia.
- Modificar o funcionamento de uma habilidade.
- Criar sinergias entre habilidades e atributos.

As escolhas deverão permitir estilos diferentes de jogo. Uma combinação poderá favorecer dano elevado, enquanto outra poderá priorizar sobrevivência ou uso frequente de habilidades.

O sistema deverá começar simples, com um conjunto limitado de melhorias bem definidas. A quantidade de opções poderá crescer conforme novas dungeons e personagens forem adicionados.

### 6.3. Sinergias

Algumas melhorias poderão interagir entre si para produzir resultados mais interessantes do que aumentos isolados de atributos.

Por exemplo, uma melhoria pode aumentar o dano de uma habilidade, enquanto outra reduz seu custo de energia. Quando combinadas, elas criam uma configuração especializada.

As sinergias deverão ser legíveis na interface, e seus efeitos precisarão ser testados para evitar combinações que tornem os chefes triviais ou que quebrem o sistema de combate.

### 6.4. Builds no cooperativo

Cada jogador deverá desenvolver sua própria configuração temporária.

Um jogador poderá focar em dano e outro em sobrevivência, por exemplo. As escolhas de um jogador não deverão substituir automaticamente as melhorias do outro.

O balanceamento deverá considerar que os jogadores podem criar combinações complementares.

---

## 7. Morte e progressão permanente

### 7.1. Consequências da morte

A morte deverá encerrar a tentativa atual da dungeon ou da sequência de dungeons, conforme as regras da campanha.

Ao morrer, o jogador perderá os níveis, a experiência não convertida e as melhorias temporárias obtidas naquela tentativa.

**A morte não deverá apagar a campanha inteira nem os pontos de progressão permanente já conquistados.**

Essa separação é essencial: cada tentativa oferece uma oportunidade de experimentar novas combinações, enquanto o progresso permanente permite que o jogador avance gradualmente ao longo de várias tentativas.

As regras de derrota no cooperativo precisarão ser definidas durante a implementação. Por exemplo, será necessário decidir se a derrota de um jogador encerra a tentativa imediatamente ou se o outro poderá continuar e tentar revivê-lo.

### 7.2. Pontos permanentes

O jogador deverá conquistar pontos permanentes por meio da progressão, de chefes derrotados e de outros objetivos definidos pelo jogo.

Esses pontos serão mantidos entre as tentativas e poderão ser gastos em uma árvore permanente de melhorias.

A distribuição de pontos deverá recompensar o avanço real e evitar que a melhor estratégia seja repetir indefinidamente uma atividade trivial apenas para acumular recursos.

### 7.3. Árvore permanente de melhorias

A árvore permanente deverá ser simples e fácil de entender, com melhorias como:

- Vida máxima.
- Dano.
- Defesa ou redução de dano.
- Eficiência de energia.
- Outros atributos que façam sentido para o sistema de combate.

Cada melhoria deverá ter custos e limites definidos. A progressão permanente deve ajudar o jogador a evoluir, mas não substituir a necessidade de aprender os padrões dos chefes.

Os pontos permanentes serão diferentes das melhorias temporárias: os primeiros permanecem salvos entre as tentativas; as segundas são perdidas quando a tentativa termina em morte.

No cooperativo, os pontos permanentes deverão ser associados ao perfil individual de cada jogador, mesmo quando o avanço pela dungeon for compartilhado.

---

## 8. Sistema de salvamento e gerenciamento de campanha

O modo PvE deverá ter um sistema de salvamento separado da lógica das partidas tradicionais de luta.

O jogador deverá encontrar opções claras para:

- **Continuar:** retomar a campanha salva, respeitando o estado que o sistema consegue recuperar com segurança.
- **Nova campanha:** iniciar uma campanha separada ou substituir a atual somente após confirmação.
- **Reiniciar campanha:** apagar o progresso da campanha selecionada e começar novamente.
- **Apagar dados do PvE:** remover os dados do modo PvE sem apagar configurações ou outros dados do jogo que não estejam relacionados a ele.
- **Exportar e importar backup:** avaliar a possibilidade de permitir que o jogador guarde uma cópia dos dados e os restaure posteriormente.

O armazenamento local deverá ser analisado. IndexedDB pode ser uma opção adequada caso o volume e a estrutura dos dados justifiquem sua utilização, mas a escolha deve considerar a arquitetura existente.

Os dados deverão distinguir:

1. **Perfil:** informações permanentes de cada jogador, incluindo melhorias e pontos permanentes.
2. **Campanha:** progresso geral, dungeons concluídas e regras de avanço.
3. **Tentativa atual:** dungeon atual, vida, experiência, níveis e melhorias temporárias, quando for possível e desejável restaurar esse estado.

O jogo deverá evitar perda acidental de dados, corrupção de salvamentos, duplicação de recompensas e incompatibilidades entre versões.

No cooperativo online, será necessário definir qual sistema é responsável por validar e persistir o progresso compartilhado. Não se deve confiar apenas nos dados enviados pelos clientes para conceder recompensas permanentes.

---

## 9. Transição entre dungeons e cutscenes

Após derrotar o chefe, a porta de saída da dungeon deverá ser liberada.

A saída deverá ser visualmente identificável e poderá contar com efeitos ou animações que indiquem que o jogador concluiu o desafio.

Ao atravessar a porta, deverá começar uma transição cinematográfica:

1. A câmera passa para uma posição atrás do personagem.
2. O personagem começa a caminhar por um túnel, corredor ou passagem.
3. A câmera acompanha o movimento, criando a sensação de continuidade.
4. Durante a transição, o jogo prepara e carrega a próxima dungeon.
5. A nova área é apresentada e o controle volta ao jogador.

A transição não deverá expor carregamentos abruptos nem deixar o jogador preso caso o carregamento falhe.

No cooperativo, a transição deverá manter os jogadores sincronizados. O sistema precisará definir como lidar com quem atravessa a porta primeiro, quem ainda está coletando recompensas e o que acontece caso um participante fique para trás.

A futura seleção aleatória de dungeons deverá acontecer de maneira compatível com essa transição, para que o jogador não veja uma área escolhida diferente daquela carregada para os demais participantes.

---

## 10. Interface do modo PvE

### 10.1. Posicionamento da vida do jogador e do chefe

A interface deverá ser adaptada para permitir que a vida do jogador e a vida do chefe fiquem visíveis simultaneamente.

**A barra de vida do jogador deverá ser deslocada para o canto inferior esquerdo da tela. A barra de vida do chefe deverá ficar centralizada na parte superior.**

A organização visual pretendida será:

- **Canto inferior esquerdo:** vida do jogador e informações pessoais de combate necessárias.
- **Centro superior:** nome do chefe e sua barra de vida.
- **Demais áreas:** energia, habilidades, experiência, nível e informações contextuais, posicionadas sem sobrecarregar a tela.

<escape>
[ CANTO SUPERIOR ESQUERDO ]                    [ CANTO SUPERIOR DIREITO ]

                       NOME DO CHEFE
                    [ BARRA DE VIDA DO CHEFE ]



                           ÁREA DE COMBATE



[ VIDA DO JOGADOR ]                         [ ENERGIA / HABILIDADES ]
CANTO INFERIOR ESQUERDO
</escape>

O esquema é apenas uma referência de posicionamento, não uma exigência visual definitiva.

A barra do chefe deverá ser suficientemente destacada para que o jogador acompanhe sua vida durante o combate, sem cobrir informações importantes nem prejudicar a visão da arena.

No cooperativo, será necessário avaliar como apresentar as informações de cada jogador sem duplicar excessivamente a interface. A solução deverá funcionar nas diferentes resoluções suportadas pelo jogo.

### 10.2. Informações de progressão

Durante a tentativa, a interface deverá informar de forma clara:

- Vida e energia do jogador.
- Nível e experiência temporários.
- Melhorias temporárias selecionadas.
- Vida do chefe durante o confronto.
- Indicação de recompensas coletáveis.
- Avisos de conclusão, saída liberada e mudança de dungeon.

As informações devem aparecer quando forem relevantes, evitando preencher permanentemente a tela com elementos desnecessários.

---

## 11. Compatibilidade com a arquitetura atual

Antes de implementar o novo modo, deverá ser feita uma análise dos sistemas existentes:

- Combate e aplicação de dano.
- Personagens, modelos e animações.
- Inteligência artificial.
- Arenas e carregamento de cenários.
- Câmera e cutscenes.
- Interface de usuário.
- Partidas locais para dois jogadores.
- Partidas contra a CPU.
- Multiplayer online/LAN e sincronização.
- Armazenamento e persistência de dados.

O objetivo é reutilizar sistemas compatíveis, isolando as regras específicas do PvE quando necessário.

A implementação deverá evitar duplicar sistemas de combate ou alterar o funcionamento das batalhas tradicionais sem necessidade.

O multiplayer atual de luta deverá ser auditado antes de se assumir que suporta o cooperativo contra chefes. O PvE online precisará sincronizar corretamente inimigos, chefes, ataques, vida, itens, recompensas, transições e progresso da sessão.

---

## 12. Ordem sugerida de implementação

A ordem abaixo prioriza uma base funcional e reduz o risco de desenvolver vários sistemas complexos ao mesmo tempo.

### Etapa 1 — Auditoria e melhorias de combate

- Ler README, TODO e changelog-admin.
- Analisar a arquitetura e identificar os sistemas reutilizáveis.
- Implementar e testar as melhorias de movimentação, modelos, especiais em equipe e câmera.
- Ajustar a posição das barras de vida para o PvE sem prejudicar o modo de luta atual.

### Etapa 2 — Protótipo de uma dungeon

- Criar um mapa PvE próprio.
- Definir o fluxo de entrada, exploração, chefe e saída.
- Implementar o primeiro chefe com inteligência artificial.
- Avaliar a presença de inimigos menores e implementar drops de cura.
- Validar a experiência em solo antes de expandir o conteúdo.

### Etapa 3 — Progressão temporária

- Implementar experiência e evolução durante a tentativa.
- Criar opções de melhorias temporárias.
- Adicionar sinergias iniciais.
- Implementar a coleta de recompensas após o chefe.

### Etapa 4 — Progressão permanente e salvamentos

- Criar a árvore permanente.
- Separar dados de perfil, campanha e tentativa.
- Implementar continuar, nova campanha e reiniciar com confirmação.
- Testar a persistência e as regras de morte.

### Etapa 5 — Transições e expansão de dungeons

- Implementar a porta de saída.
- Criar a cutscene de caminhada pelo corredor.
- Preparar o carregamento de novas dungeons.
- Estruturar o cadastro de dungeons para futuras expansões.
- Quando houver opções suficientes, implementar a seleção aleatória da próxima dungeon.

### Etapa 6 — Cooperativo local

- Permitir que dois jogadores enfrentem juntos as dungeons.
- Adaptar a interface para dois jogadores.
- Definir regras de cura, coleta, derrota e recompensas.
- Ajustar a dificuldade para o cooperativo.

### Etapa 7 — Cooperativo online

- Auditar e adaptar a sincronização existente.
- Sincronizar chefes, inimigos, ataques, itens e transições.
- Definir autoridade sobre o progresso e as recompensas.
- Testar desconexões, reconexões e situações de falha.

### Etapa 8 — Expansão e balanceamento

- Adicionar novas dungeons e chefes.
- Expandir as melhorias e sinergias.
- Ajustar dificuldade, drops e progressão com base em testes.
- Planejar o Espreitador como personagem jogável em uma atualização futura, caso essa prioridade seja mantida.

A ordem poderá ser ajustada após a auditoria técnica, mas o projeto não deverá tentar implementar todas as funcionalidades simultaneamente.

---

## 13. Critérios de aceitação

A atualização deverá ser considerada funcional quando os seguintes pontos aplicáveis estiverem concluídos e testados:

### Jogo de luta

- [ ] As melhorias de animações, modelos, especiais em equipe e câmera foram implementadas sem quebrar as batalhas existentes.
- [ ] A interface foi ajustada sem prejudicar o modo de luta tradicional.

### Dungeons e chefes

- [ ] Existe pelo menos uma dungeon PvE funcional com mapa próprio.
- [ ] O jogador consegue entrar, explorar, enfrentar o chefe e concluir a dungeon.
- [ ] A presença de inimigos menores foi avaliada e, caso implementada, eles possuem uma chance configurável de deixar itens de cura antes do chefe.
- [ ] A saída é liberada após a vitória.
- [ ] A transição para a próxima dungeon funciona sem erros.
- [ ] A estrutura permite adicionar novas dungeons futuramente.
- [ ] A seleção aleatória fica prevista para quando houver conteúdo suficiente.

### Progressão e salvamentos

- [ ] As melhorias temporárias são perdidas conforme as regras da morte.
- [ ] A progressão permanente permanece salva.
- [ ] O jogador consegue iniciar, continuar e reiniciar uma campanha com segurança.
- [ ] O salvamento não apaga dados não relacionados ao PvE.

### Interface

- [ ] A barra de vida do jogador fica no canto inferior esquerdo.
- [ ] A barra de vida do chefe fica centralizada na parte superior.
- [ ] As informações continuam legíveis durante o combate.

### Cooperativo

- [ ] As regras de progressão, cura e recompensas estão definidas.
- [ ] A sincronização funciona no formato cooperativo efetivamente implementado.
- [ ] O jogo trata falhas de conexão e transições de maneira previsível.

### Escopo futuro

- [ ] O Espreitador funciona como chefe conforme o escopo da dungeon.
- [ ] Sua implementação como personagem selecionável não é tratada como requisito obrigatório desta atualização.

---

## 14. Diretrizes de desenvolvimento

Antes de alterar os arquivos, consultar a documentação e o estado atual do repositório.

Durante o desenvolvimento:

- Não recriar o jogo do zero.
- Não substituir sistemas existentes sem justificativa técnica.
- Fazer alterações incrementais e compatíveis com a arquitetura atual.
- Testar as funcionalidades existentes depois de mudanças importantes.
- Atualizar o TODO e o changelog-admin de acordo com o progresso real.
- Registrar a versão e o resumo das alterações no changelog destinado ao jogador ao concluir uma versão estável.
- Seguir o fluxo de commit e push definido para o projeto.
- Não marcar uma funcionalidade como concluída sem que ela tenha sido implementada e verificada.

Quando uma decisão técnica depender de informações ausentes no código ou na documentação, investigar antes de escolher uma solução definitiva.

## Resultado esperado

O Arena Paranormal continuará sendo um jogo de luta 3D, mas passará a contar com um modo PvE próprio, estruturado em dungeons temáticas e confrontos contra chefes.

A experiência combinará exploração, possibilidade de recuperação antes dos chefes, melhorias temporárias durante cada tentativa, progressão permanente entre tentativas, salvamentos seguros e transições cinematográficas.

A arquitetura deverá permitir que novas dungeons sejam adicionadas ao longo do tempo e, futuramente, selecionadas aleatoriamente para aumentar a variedade. O Espreitador será desenvolvido inicialmente como chefe, deixando sua versão jogável para uma atualização posterior.

# REGRA PRIORITÁRIA — RECUPERAÇÃO DA UPDATE, AUDITORIA E REVISÃO DO ELENCO

**Estado em 2026-10-22:** a recuperação (item 1) foi feita na revisão da v3.34.0 — os commits de 18/10 (skate do
Xande voltando para a mão, enquadramento do close de rosto da galeria, README, `teamLinks.js` e este planejamento)
conferidos contra o código; o import sem uso em `assists.js` saiu. A auditoria do elenco (item 2) segue pelos modelos
mais antigos.

## 1. PRIMEIRA PRIORIDADE: RECUPERAR A ATUALIZAÇÃO INTERROMPIDA

A última atualização foi interrompida no meio do trabalho do Claude, mas as alterações realizadas foram commitadas e enviadas ao GitHub. Portanto, não presuma que o último trabalho foi concluído corretamente nem que está perdido.

Antes de iniciar qualquer outra tarefa:

1. Leia integralmente `README.md`, `TODO.md`, `CHANGELOG-ADMIN.md` e `CHANGELOG-CLIENTE.md`.
2. Confira `git status`, os commits recentes, o último commit enviado ao GitHub e as diferenças entre os commits relevantes.
3. Identifique exatamente quais alterações entraram no último commit, quais partes da implementação ficaram incompletas e quais tarefas estavam em andamento.
4. Examine o código alterado, incluindo modelos, habilidades, invocações, animações, efeitos, configurações dos personagens e integrações com os sistemas existentes.
5. Verifique se existem implementações pela metade, referências quebradas, arquivos esquecidos, comportamentos provisórios ou divergências entre código, TODO e changelogs.
6. Recupere o trabalho a partir do estado atual do repositório. Não reverta o commit simplesmente porque a atualização foi interrompida e não refaça tudo do zero.
7. Corrija primeiro os problemas deixados pela interrupção e conclua as partes iniciadas que pertençam ao escopo atual.

Preserve todo o trabalho válido já enviado. Não faça reset destrutivo, não descarte alterações existentes e não reescreva o histórico do Git sem necessidade.

## 2. SEGUNDA PRIORIDADE: AUDITORIA COMPLETA DOS PERSONAGENS

Recentemente, muitos personagens foram adicionados ao jogo, mas nem todos passaram por uma revisão cuidadosa dos modelos, poderes, invocações, animações e efeitos. Os personagens antigos também precisam de melhorias.

Por isso, antes de considerar o elenco concluído, faça uma auditoria individual de TODOS os personagens selecionáveis existentes no código atual, incluindo personagens recentes, antigos, formas alternativas, transformações e personagens que utilizem invocações.

Não se limite aos personagens destacados nas tarefas antigas do TODO. A auditoria deve considerar o elenco real encontrado no projeto.

Para cada personagem, examine separadamente:

### A. Modelo visual

- Fidelidade ao personagem de referência.
- Silhueta, proporções, rosto, cabelo, roupas, acessórios, armas e elementos característicos.
- Qualidade e coerência dos materiais, texturas, cores e detalhes.
- Animação em repouso, poses de combate, ataques, dano, vitória e transformação.
- Clipping, deformações, partes atravessando o corpo, acessórios flutuantes e problemas de posicionamento.
- Escala, orientação, ponto de origem e compatibilidade com a câmera.
- Qualidade do modelo em combate, e não apenas na tela de seleção.
- Uso excessivo de modelos genéricos, peças reaproveitadas ou soluções provisórias que prejudiquem a identidade visual.

Não refaça automaticamente todos os modelos. Identifique os problemas concretos, preserve o que já está bom e implemente melhorias proporcionais à necessidade.

### B. Poderes, golpes e habilidades

- Fidelidade aos poderes, feitos e estilo de luta do personagem.
- Variedade real entre ataques básicos, habilidades, especiais, passivas e transformações, quando aplicáveis.
- Animações correspondentes ao golpe executado.
- Hitboxes, alcance, trajetória, tempo de execução, recuperação e interação com o adversário.
- Efeitos visuais e sonoros coerentes com o poder representado.
- Avisos visuais claros para ataques que possam ser esquivados ou interrompidos.
- Integração com energia, sanidade, cooldowns, combos, defesa e demais sistemas existentes.
- Ausência de ataques genéricos que poderiam pertencer a qualquer outro personagem, salvo quando houver justificativa.
- Ausência de habilidades provisórias, placeholders ou efeitos que não correspondam à ação executada.

Não iniciar um balanceamento geral nesta etapa. Corrija habilidades quebradas, incoerentes ou incompletas e registre eventuais questões de equilíbrio para uma fase posterior.

### C. Invocações, criaturas e entidades

Para todo personagem que invoque criaturas, entidades, marionetes, aliados, armas autônomas ou outras manifestações, faça uma revisão específica:

- Verifique se a entidade correta é invocada e se corresponde à referência do personagem.
- Revise modelo, escala, materiais, animações, posição e orientação.
- Confira a animação de entrada, permanência em campo, ataque, dano, desaparecimento e encerramento.
- Garanta que a invocação apareça no momento correto e não surja abruptamente ou sem contexto visual.
- Verifique se ataca o alvo correto, respeita o alcance previsto e interage adequadamente com colisões, câmera e cenário.
- Confira se a entidade desaparece corretamente e se não permanece presa, invisível ou duplicada.
- Revise efeitos, partículas, sons e telegraphs.
- Verifique desempenho e consumo de recursos, especialmente quando várias entidades aparecem simultaneamente.
- Confira a integração com IA, multiplayer ou batalha em equipe quando esses sistemas forem aplicáveis.

Não considere uma invocação concluída apenas porque o comando de ativação funciona. A apresentação visual e o comportamento durante toda a execução também precisam ser revisados.

### D. Identidade e integração no jogo

- Verifique se o personagem possui identidade própria de combate.
- Revise introduções, falas, poses de vitória e transformações.
- Confira o funcionamento da CPU e o uso adequado das habilidades.
- Verifique seleção, HUD, retratos, nomes, formas alternativas e integração com equipes e assistências, quando aplicáveis.
- Identifique animações compartilhadas que não combinem com o personagem.
- Preserve as particularidades já implementadas e evite substituir mecânicas próprias por soluções genéricas.

## 3. TERCEIRA PRIORIDADE: EXECUTAR AS MELHORIAS IDENTIFICADAS

Depois da auditoria, organize os resultados por prioridade:

**P0 — Correções críticas:** funcionalidades quebradas, modelos ausentes, invocações que não funcionam, erros que impedem jogar, referências inválidas e regressões introduzidas pela atualização interrompida.

**P1 — Revisão de qualidade:** modelos visualmente inadequados, poderes incompletos, invocações sem apresentação apropriada, animações genéricas, efeitos incoerentes e falta de identidade mecânica.

**P2 — Polimento:** melhorias adicionais de poses, materiais, efeitos, sons, animações secundárias e apresentação cinematográfica.

**P3 — Futuro:** personagens novos, grandes expansões de conteúdo, novos modos e melhorias que não sejam necessárias para concluir a versão estável atual.

Não comece várias revisões simultaneamente. Trabalhe por personagem ou conjunto de sistemas relacionados, conclua cada etapa e teste o resultado antes de avançar.

Priorize as correções P0, depois os problemas P1 que comprometam significativamente a qualidade do elenco. Os itens P2 e P3 podem continuar no TODO para etapas futuras.

## 4. REFERÊNCIAS E FIDELIDADE

Quando a revisão depender de fidelidade a uma obra ou personagem, consulte referências confiáveis, como episódios, cenas, wikis e materiais disponíveis.

Diferencie informações canônicas de adaptações criadas para o jogo. Não invente poderes, feitos, falas ou características como se fossem oficiais.

Quando houver informações insuficientes, implemente apenas o que estiver fundamentado e registre a dúvida ou a necessidade de pesquisa.

## 5. TESTES OBRIGATÓRIOS

Após cada revisão significativa:

- Execute as verificações técnicas disponíveis no projeto.
- Execute o build de produção quando apropriado.
- Teste o personagem em combate real, não apenas na seleção.
- Teste habilidades, especiais, invocações, transformações e animações alteradas.
- Verifique a CPU, colisões, hitboxes, câmera e efeitos.
- Confira se outros personagens e sistemas não foram afetados.
- Teste em mobile quando a mudança puder afetar desempenho, interface ou controles.
- Registre falhas que não puderem ser reproduzidas ou verificadas no ambiente disponível.

Não declare uma revisão concluída se apenas inspecionou o código e não verificou o comportamento necessário.

## 6. DOCUMENTAÇÃO, COMMITS E CONTINUIDADE

- Atualize o TODO conforme o estado real do código, removendo tarefas concluídas e mantendo as pendências verdadeiras.
- Registre as alterações técnicas no `CHANGELOG-ADMIN.md`.
- Registre no `CHANGELOG-CLIENTE.md` somente as novidades relevantes para os jogadores.
- Faça commits claros após marcos significativos e envie-os ao GitHub quando possível.
- Nunca presuma que o changelog ou o TODO está atualizado só porque o código foi commitado.
- Atualize a versão do cliente e finalize a documentação de lançamento somente quando a próxima versão estável estiver realmente pronta.

## 7. RESTRIÇÕES DE ESCOPO

- Não iniciar o balanceamento geral nesta etapa.
- Não adicionar novos personagens em massa antes de revisar o elenco existente.
- Não recriar o jogo, sistemas completos ou modelos que já estejam adequados.
- Não substituir mecânicas próprias por golpes genéricos apenas para acelerar o desenvolvimento.
- Não iniciar a migração para executável ou software instalável.
- Não interromper o trabalho para pedir confirmação sobre decisões técnicas reversíveis e de baixo risco. Se uma decisão depender realmente do usuário, documente o bloqueio e continue com tarefas independentes.

## ORDEM FINAL DE EXECUÇÃO

1. Recuperar e concluir o trabalho interrompido.
2. Auditar o TODO e a documentação contra o código atual.
3. Corrigir regressões e implementações incompletas da última atualização.
4. Auditar todos os personagens, incluindo modelos, poderes, invocações, animações e integração.
5. Corrigir os problemas críticos e executar melhorias prioritárias de qualidade.
6. Validar estabilidade, build, combate, IA e mobile crítico.
7. Atualizar TODO e changelogs.
8. Finalizar a próxima versão estável e atualizar a versão do cliente apenas no encerramento.

**A prioridade é recuperar o estado real do projeto, concluir o que ficou incompleto e elevar a qualidade do elenco inteiro antes de expandi-lo ainda mais.**

# 0. REGRA DESTE TODO

Este documento contém apenas:

* tarefas pendentes;
* melhorias;
* testes;
* decisões ainda abertas;
* sistemas planejados;
* problemas que precisam de validação.

Os **commits, implementações concluídas e histórico de versões** já estão documentados nos Changelogs Admin e Cliente.

### Regra de manutenção

Quando uma tarefa for concluída:

**TODO → remover da lista → registrar no Changelog**

Não transformar este documento em histórico.

---

# 1. VISÃO ATUAL DO PROJETO

O Arena Paranormal é um jogo de luta 3D em arena, com foco em:

* combate rápido;
* movimentação livre;
* combos;
* defesa;
* esquiva;
* substituição;
* grabs;
* especiais;
* transformações;
* personagens com kits próprios;
* IA;
* batalha em equipe;
* assistências;
* LAN/Online;
* diferentes modos de jogo;
* identidade visual própria.

O projeto deve continuar evoluindo sem recriar sistemas já existentes.

---

# 2. PRIORIDADES

## 🔴 P0 — Estabilidade

1. Limpeza
2. Build
3. Regressão
4. Correção de problemas atuais
5. Revisão dos personagens recentes

## 🔴 P1 — Gameplay

6. Mecânicas de combate
7. Transformações
8. IA
9. Telemetria
10. Balanceamento

   - **Equipe: Barra de Equipe, transformação em equipe e Especial em Equipe (△ △ △ ○)** — ver a seção
     *EQUIPE — BARRA DE EQUIPE E ESPECIAIS EM EQUIPE* logo abaixo (pedido de 2026-10-17, inspirado no Storm 4).

## 🟠 P1 — Infraestrutura

11. LAN real
12. Mobile
13. Sistema de idiomas

## 🟠 P1 — Novos modos

14. Torneio
15. Torre

## 🟡 P2 — Polimento

16. Animações
17. Câmera
18. HUD
19. Menus
20. Áudio
21. Efeitos
22. Cenários

## 🟢 P3 — Conteúdo futuro

23. Novas formas
24. Novos personagens
25. Novos cenários
26. Novos modos

---

# NUBI — PERSONAGEM NOVA (Escriptas)

- [x] Modelo, texturas, golpes, Desvio Imperturbável, Decadência, Ritual de Drenagem, Afinidade com a Morte, agarrão, falas.
- [x] Carniçal da Esfinge: invocação com barra de vida (não trai a Nubi), Amedrontar, Saltar, Vomitar Lodo, Estômago.
- [x] Enigma nas 3 marcas da barra (75/50/25%): Y/A/B/X, 52 enigmas sem repetir; acertou = paralisa, errou = devorada.
- [x] Acabamento do modelo da Esfinge (pedido: "depois melhore o modelo"): proporções de leão, patas mais grossas, Menés
      lisa com listras nítidas, asas maiores e menos ruidosas; refazer a base e refinar pelo MCP.
- [x] Ajustes do teste: Esfinge paralisada (não a vítima), 35 s com o relógio parado na paralisia, olhos pretos na
      Transformação, Lodo que Prende e Sentença do Chacal.
- [~] **Terminar a Esfinge** (pedido de 2026-10-23): modelo aproximado da arte oficial ("Miniatura Carniçal da Esfinge
      em Calamidade") — pele e ossos verde-oliva, Menés escura com listras roxas e o LEQUE de espinhos roxos, colar de
      crânios em duas fileiras, asas de membrana roxa, cauda fina enrolada, garras longas. Falta: a POSTURA (na arte
      ela fica agachada, réptil, com o peito alto; hoje as patas animadas em código a deixam em pé como um cão) —
      junto do REAJUSTE DAS ANIMAÇÕES.
- [x] BALANCEAMENTO GERAL DOS PERSONAGENS (v3.32.0): 4 rodadas de telemetria, ajustes em `src/config/balance.js`.
      Repetir a medição a cada personagem novo (`runBalance({ focus: 'id' })`) e a cada mudança grande de kit.

# MODELOS — PRÓXIMOS PASSOS

- [x] Xande e Aguiar refeitos pelas artes oficiais (modelos, texturas, machado, taco e skate no Blender); mãos e sapatos de todos.
- [ ] **Lírio**: remodelar a LEONORA no Blender (como o taco e o skate do Xande) quando o Lírio for atualizado. Ela já
      recebe a maldição do Xande pela assistência (Amaldiçoar Arma por elemento) — conferir a textura nela depois.
- [x] Fantasma remodelada pela arte oficial (sobretudo, faixas, facas, dreads; texturas novas).
- [x] Kemi remodelada pela arte oficial (top, mochila, faixas, casaco amarrado, dreads; texturas novas).
- [x] Gal Sal remodelado pela arte de Desconjuração (poncho com caimento real, cabelo, venda, correntes) e as lâminas Ereškigal no Blender.
- [x] Kaiser remodelada pela arte de Desconjuração (versão queimada/50%: casaco do avesso, braço esquerdo queimado, faixas, olhos roxos).
- [~] Arthur e Joui: na v3.39.0 só ajustes no script antigo (cores, cabelo, colete, tênis, chinelos). Falta o REMODEL de verdade no Blender, na técnica atual (sculpt_lib, como Kaiser/Balu), revisado pelo MCP em 4 vistas contra a miniatura de Calamidade — o dono apontou que ficou abaixo do padrão.
- [x] Balu (miniatura de Calamidade) e Lírio (miniatura de Sinais do Outro Lado) remodelados no Blender — v3.40.0.
- [x] Retratos com a cabeça cortada (Kian no tríptico): `renderPortraits` enquadra pela altura da cabeça — v3.39.0.
- [ ] Os outros modelos mais antigos, em ordem de data: Anfitrião, Arnaldo e Veríssimo (06/10), depois Diabo e Kian (10/10)...

# EQUIPE — BARRA DE EQUIPE E ESPECIAIS EM EQUIPE

Pedido de 2026-10-17 (inspirado no Naruto Storm 4). Vale só na **batalha em equipe** (líder + 2 assistências). Por
enquanto é documentação; a implementação vai por fases (abaixo).

### Barra de Equipe
- Uma barra por lado, embaixo do painel do líder, que **enche quanto mais o jogador usa as assistências**.
  Balanceamento (v3.32.0): cada chamada de assistência **+6%**, cada troca **+3%** — cerca de 17 chamadas para encher,
  ≈ uma vez por partida (o Especial em Equipe é raro). Não esvazia sozinha; reinicia a cada partida (não a cada round).
- **Cheia + Transformação** (segurar △ com a Barra de Transformação pronta): o líder **e as assistências** se
  transformam juntos — as assistências que têm forma (Dante → Olhos Abertos, Arnaldo → Anfitrião etc.) aparecem
  transformadas até o fim do round. **Gasta a barra inteira.**
- **Cheia + △ △ △ ○**: o **Especial em Equipe**. **Gasta a barra inteira** (e a sanidade do especial normal).
  Sem a barra cheia, △ △ △ ○ continua sendo o especial normal (△ △ ○).
- O comando usa a mesma janela curta da Carga (0,45 s entre os toques, v3.31.0): os três △ precisam ser seguidos.

### Especial em Equipe — dano
- **Dano = especial normal do líder + 100** (com o especial base de 250: 350). Não é a soma das partes: os golpes das
  assistências entram dentro desses +100 (cada parte delas tem dano limitado), e o especial do líder sai inteiro.
- O alvo não pode defender nem fugir depois que a primeira parte acerta (como o especial normal).

### Especial em Equipe SIMPLIFICADO (quem não tem ligação na lore)
1. A assistência 1 entra e dá uma sequência de socos **ou** a habilidade △ → ○ dela;
2. a assistência 2 entra e faz o mesmo;
3. o líder fecha com o **próprio especial** (△ △ ○).

### Especiais CUSTOMIZADOS (ligação na lore) — regra de prioridade
Cada equipe tem um especial próprio só quando os personagens têm **ligação na lore**. Ordem (a primeira que valer):
1. **Os 3 do mesmo grupo com especial de grupo** (ex.: 3 Mascarados) → o especial do grupo, em que **aparecem todos os
   membros do grupo** (mesmo dano de qualquer Especial em Equipe; muda só a animação).
2. **Um trio com especial próprio** (ex.: Joui + Kaiser + Arthur) → o especial do trio.
3. **Uma dupla com ligação** (ex.: Cristopher + Kaiser) → o terceiro (sem ligação) **ataca primeiro** (socos ou a
   habilidade dele) e depois a dupla faz o **especial dela**. Se houver duas duplas possíveis, vale a que tem o líder.
   Uma dupla de um grupo **não precisa do grupo completo** para ter o especial dela.
4. **Ninguém ligado** → o simplificado.

Exemplos do Storm 4 que serviram de base: Naruto + Sasuke + Kiba → o Kiba ataca e Naruto e Sasuke fazem o especial
deles; Pain + Konan + Hidan → o especial da Akatsuki; Pain + Konan + Sasuke → o especial do Pain e da Konan (o Sasuke
ataca antes).

### Ligações (a tabela vai para `src/config/teamLinks.js`)
Confirmadas pelo pedido:
- [ ] **Joui + Kaiser + Arthur** — especial de trio.
- [ ] **Cristopher + Kaiser** — especial de dupla.
- [ ] **Mascarados** (Dalmo, Aguiar, Jae, Kemi, Labirinto, Juan) — especial de grupo com 3 ou mais na equipe (aparecem
  todos os membros).
A confirmar (o dono decide antes de entrar):
- [ ] Outras duplas/trios da Ordo Realitas (ex.: a Equipe Abutres de Calamidade), Escriptas (Kian + Gal Sal) e os
  Portadores (são inimigos entre si — provavelmente nenhuma ligação).
- **Os Cinco** (Xande, Guizo, Lírio): grupo incompleto no elenco — **sem especial de grupo** até todos estarem no jogo.

### Fases
- [x] **F1** Barra de Equipe: enche com as assistências (+6) e trocas (+3), aparece na HUD (e no toque), reinicia por
  partida (`COMBAT.teamGauge`, `Fighter.addTeamGauge`).
- [x] **F2** △ △ △ ○ com a barra cheia → Especial em Equipe **simplificado** para todo mundo (+ a IA usando; no toque, o
  botão ESPECIAL vira o de equipe com a barra cheia). `abilities.js teamSpecial`, `COMBAT.teamSpecial` (bônus 100).
- [x] **F3** Transformação em equipe com a barra cheia (2026-10-25): gasta a barra; quem tem forma entra com o modelo e a
  ficha dela (Dante → Olhos Abertos...), quem só desperta entra com aura e +25% de dano; dura até o fim do round ou até
  entrar em campo numa troca. Cinemática do tríptico (`HUD.teamCut`, referência do dono: três painéis inclinados com
  linhas na cor de cada um).
- [~] **F4** `teamLinks.js` + a regra de prioridade + os primeiros especiais customizados (Mascarados, Joui/Kaiser/
  Arthur, Cristopher/Kaiser). A tabela e o `getTeamLink` (trio > grupo > dupla) já existem; falta ligá-los ao
  Especial em Equipe e fazer as animações próprias.
- [ ] Telas: mostrar na seleção da equipe quando o trio escolhido tem especial próprio.

---

# 3. LIMPEZA E SAÚDE DO PROJETO

## Git

* [x] Procurar arquivos temporários
* [ ] Procurar código morto
* [x] Procurar imports antigos
* [x] Procurar arquivos duplicados
* [x] Corrigir referências quebradas

## Validação

* [x] Conferir erros de console
* [x] Conferir warnings
* [x] Testar inicialização
* [x] Testar menu
* [x] Testar seleção
* [x] Testar batalha
* [x] Testar vitória
* [x] Testar retorno ao menu
* [x] Testar reinício
* [x] Testar troca entre modos

---

> Conferido na versão estável (2026-10-08): nada temporário versionado; imports sem uso removidos; build sem aviso
> (textos num chunk próprio); versão compilada testada: menu → batalha → vitória → revanche → menu → treinamento.
> "Procurar código morto" (funções sem uso) fica para depois.

# 4. ARNALDO FRITZ / O ANFITRIÃO / SENHOR VERÍSSIMO

Os três **já possuem modelos próprios prontos**.

Não recriar os modelos.

O trabalho pendente é:

* melhoria;
* correção;
* animação;
* rig;
* materiais;
* efeitos;
* câmera;
* IA;
* balanceamento;
* integração final.

---

# 5. ARNALDO FRITZ

## Modelo

* [x] Revisar proporções
* [x] Revisar rosto
* [x] Revisar cabelo/barba
* [x] Revisar óculos
* [x] Revisar roupas
* [x] Revisar relógio
* [x] Revisar espada
* [x] Revisar materiais
* [x] Revisar texturas
* [x] Conferir rig
* [x] Conferir qualidade no jogo

## Animações

* [x] Idle
* [x] Caminhada
* [x] Corrida
* [x] Ataques
* [x] Espada
* [x] Emissor de Pulsos
* [x] Finta Teatral
* [x] Pulso Paranormal
* [x] Rodopio da Fita
* [x] Aniquilador
* [x] Ensaio Geral
* [x] Ato Final
* [x] Transformação
* [x] Vitória

## Combate

* [x] Testar dano
* [x] Testar cooldown
* [x] Testar custos
* [x] Testar hitboxes
* [x] Testar telegraphs
* [x] Testar IA
* [ ] Balancear

---

> Finalizado na versão estável: modelo revisado no jogo (sem problema visível), todas as animações existem e rodam,
> pose de vitória própria (`vic_arnaldo`), kit inteiro testado sem erro, CPU usa o kit todo e transforma. "Balancear"
> fica para a etapa de balanceamento.

# 6. O ANFITRIÃO

## Modelo

* [x] Revisar matéria de Energia
* [x] Revisar máscara
* [x] Revisar olhos
* [x] Revisar cabos
* [x] Revisar relógio
* [x] Revisar aura
* [x] Revisar materiais
* [x] Revisar efeitos
* [x] Conferir rig
* [x] Conferir leitura durante combate

## Animações

* [x] Idle
* [x] Movimentação
* [x] Ataques
* [x] Braços de Energia
* [x] Distorção
* [x] Tempo Distorcido
* [x] Transformação
* [x] Vitória

## Combate

* [x] Disparo do Caos
* [x] Regra do Jogo
* [x] Distorção
* [x] Tempo Distorcido
* [x] A Plateia
* [x] ChronoSense
* [x] Jogo do Anfitrião
* [x] Conferir telegraphs
* [x] Conferir counterplay
* [x] Conferir aleatoriedade
* [x] Garantir que aleatoriedade nunca determine um acerto invisível
* [x] Revisar IA
* [ ] Balancear

## Personalidade

O Anfitrião deve continuar:

* teatral;
* caótico;
* imprevisível;
* provocador;
* absurdo;
* com humor ácido.

Evitar falas genéricas.

---

> Finalizado na versão estável: as 9 habilidades, □, especial (aviso de 1 s com sigilo no alvo) e agarrão testados
> sem erro; Percepção Anacrônica desvia o 1º golpe e entra em recarga; pose de vitória própria (`vic_anfitriao`);
> corrigida a tela preta do cabo do relógio. "Balancear" fica para a etapa de balanceamento.

# 7. SENHOR VERÍSSIMO

## Modelo

* [x] Revisar proporções
* [x] Revisar rosto
* [x] Revisar cabelo
* [x] Revisar barba
* [x] Revisar roupa
* [x] Revisar gravata
* [x] Revisar jaqueta
* [x] Revisar espada
* [x] Revisar materiais
* [x] Revisar texturas
* [x] Conferir rig

## Animações

* [x] Idle
* [x] Caminhada
* [x] Corrida
* [x] Ataques
* [x] Guarda do Comandante
* [x] Inteligência Estratégica
* [x] Análise Tática
* [x] Investida dos Aniquiladores
* [x] Jaqueta de Veríssimo
* [x] Especial
* [x] Vitória

## Combate

* [x] Testar Guarda do Comandante
* [x] Testar Inteligência Estratégica
* [x] Testar Análise Tática
* [x] Testar Investida dos Aniquiladores
* [x] Testar Jaqueta
* [x] Testar Segredo de Veríssimo
* [x] Revisar IA
* [ ] Balancear

---

> Finalizado na versão estável: Guarda do Comandante contra-ataca, Inteligência Estratégica dá o corte extra (26 → 38),
> Segredo deixa com 1 de vida, kit e especial sem erro, pose de vitória própria (`vic_verissimo`). "Balancear" fica
> para a etapa de balanceamento.

# 8. ESPADA DE ARNALDO / VERÍSSIMO

* [x] Conferir modelo
* [x] Conferir proporções
* [x] Conferir posicionamento
* [ ] Conferir bainha
* [x] Fazer fita vermelha reagir aos movimentos
* [ ] Corrigir clipping
* [x] Garantir movimentação adequada em cada personagem

---

> Fita voltou a ficar vermelha (o flash de dano zerava o brilho dela). Bainha e clipping fino ficam para depois.

# 9. COMBATE — SISTEMAS UNIVERSAIS

## Combo

* [ ] Conferir escalonamento
* [ ] Conferir limite
* [ ] Conferir especiais
* [ ] Conferir grabs
* [ ] Conferir finalizadores
* [ ] Conferir HUD
* [ ] Evitar infinitos

Referência inicial:

```text
1º = 100%
2º = 100%
3º = 90%
4º = 80%
5º = 70%
6º = 60%
mínimo = 50%
```

**Esses valores não são definitivos.**

---

# 10. DODGE

* [ ] Testar contra combos
* [ ] Testar contra projéteis

---

# 11. SUBSTITUIÇÃO

* [ ] Confirmar funcionamento durante stun
* [ ] Confirmar interrupção de combo
* [ ] Conferir deslocamento lateral
* [ ] Evitar aparecer diretamente atrás por padrão
* [ ] Conferir cargas
* [ ] Conferir cooldown
* [ ] Testar com todo o elenco

---

# 12. GRAB / THROW TECH

* [ ] Conferir dano
* [ ] Conferir defesa
* [ ] Conferir cenas
* [ ] Conferir câmera
* [ ] Criar/revisar variações individuais

### Exemplos

* [ ] Kaiser — braço
* [ ] Juan — faca no pescoço
* [ ] Aguiar — machado
* [ ] Outros personagens

---

# 13. DEATH GOD

Death God é **SPECIAL/ULT**, não grab.

* [ ] Uma utilização por rodada
* [ ] Cooldown
* [ ] Telegraph
* [ ] Escape
* [ ] Debuff
* [ ] Duração
* [ ] Câmera
* [ ] Modelo
* [ ] Rig
* [ ] Material
* [ ] Efeitos

---

# 14. WAKEUP

* [ ] Invulnerabilidade
* [ ] Roll
* [ ] Ataque
* [ ] Pressão justa
* [ ] Evitar loops

---

# 15. INPUT BUFFER

* [ ] □
* [ ] ○
* [ ] △
* [ ] L2
* [ ] Buffer durante recuperação
* [ ] Evitar comandos acidentais
* [ ] Conferir janela

---

# 16. DEFESA

* [ ] Defesa normal
* [ ] Perfect Block
* [ ] Resistência
* [ ] Guard Break
* [ ] Golpe △+○
* [ ] Consumo de defesa
* [ ] Interação com grabs
* [ ] Evitar quebra injusta

---

# 17. ANTI-REPETIÇÃO

* [ ] Limite de lançamentos
* [ ] Limite de projéteis
* [ ] Redução por repetição
* [ ] Proteção contra loops
* [ ] Não prejudicar personagens dependentes de repetição

---

# 18. ESPECIAIS / TELEGRAPHS

Todo especial de grande impacto deve possuir leitura clara.

* [ ] Conferir todos os especiais
* [ ] Conferir projéteis
* [ ] Supernova
* [ ] Em Nome do Caos
* [ ] Especiais do Anfitrião
* [ ] Flash Grenade
* [ ] Conferir esquiva
* [ ] Conferir interrupção quando aplicável
* [ ] Evitar dano sem feedback

---

# 19. TRANSFORMAÇÕES

## Geral

* [ ] Barra
* [ ] Condição
* [ ] Custo
* [ ] Duração
* [ ] Animação
* [ ] Câmera
* [ ] Efeitos
* [ ] Retorno
* [ ] Vitória

## Formas

* [ ] Fantasma
* [ ] Mutilador
* [ ] ???
* [ ] Erin — Em Nome do Caos
* [ ] Anfitrião
* [ ] Juan — Portador do Trono
* [ ] Outras formas

---

# 20. KIAN — TRANSCENDÊNCIA

> Obsoleto (conferido em 2026-10-10): o kit atual do Kian não tem mais a Transcendência como habilidade — a
> Transformação dele é o Invólucro do Conhecimento (`awakenMode`). O tipo `transcend` continua em `abilities.js`
> (sem custo de regeneração e com dreno no fim), mas nenhum lutador usa.

* [x] Conferir Precognição (passiva `precognition`: não é pego desprevenido)
* [x] Evitar esquiva automática injusta (a Precognição não esquiva sozinha)

---

# 21. ELEMENTOS

Os elementos devem continuar ligados principalmente aos **rituais**.

Não criar multiplicador elemental universal para todos os ataques sem nova decisão.

## Ciclo

```text
SANGUE
↓
CONHECIMENTO
↓
ENERGIA
↓
MORTE
↓
SANGUE
```

## Medo

* Fora do ciclo
* Ligado ao Outro Lado

## Cores

* Sangue → vermelho
* Conhecimento → dourado
* Energia → roxo/verde
* Morte → preto/cinza
* Medo → identidade própria

### Validação

* [ ] Conferir rituais
* [ ] Conferir cores
* [x] Conferir seleção (elemento aparece na seleção e na lista de golpes)
* [ ] Conferir nomenclatura
* [x] Não aplicar dano elemental universal

---

# 22. SANIDADE / PE

Utilizar:

**SANIDADE / PE**

Não criar barra separada de Exposição Paranormal sem nova decisão.

* [ ] Conferir HUD
* [ ] Conferir custos
* [ ] Conferir regeneração
* [ ] Conferir transformações
* [ ] Conferir habilidades

---

# 23. PERSONAGENS — FIDELIDADE

## KAISER

* [ ] Revisar Cinerária
* [ ] Conferir duração
* [ ] Revisar rituais
* [ ] Avaliar Acácia
* [ ] Avaliar Dissipar Espíritos
* [ ] Revisar Resistência
* [x] Desert Eagle
* [x] Karambit
* [x] Balas amaldiçoadas
* [x] Nebulosa
* [ ] Conferir visual

---

## ARTHUR

* [x] Conferir braço esquerdo
* [ ] Revisar Arma de Sangue
* [x] Arma de Sangue deve consumir vida (passiva `bloodPrice`: sem sanidade, paga com vida)
* [ ] Revisar Rebirth
* [ ] Revisar crânios
* [ ] Revisar raios
* [ ] Revisar Dystopia
* [ ] Revisar Templo do Ódio
* [x] Revisar sniper carregado (v3.14.0: laser com atraso e aviso — dá para desviar)
* [ ] Conferir risco/recompensa

---

## JOUI

* [x] Teleporte das Sombras
* [x] Olhar do Desespero
* [x] Shi no Kage
* [ ] Máscara das Pessoas nas Sombras (ainda NÃO existe no kit)
* [x] Coincidência Forçada
* [x] Decepar
* [x] +30% finisher abaixo de 20%
* [ ] Conferir alcance
* [ ] Conferir combos
* [ ] Evitar pressão excessiva

---

## AGHATA

**Nome oficial: AGHATA**

* [ ] Utilizar referência visual definida (remodel na técnica nova — §23.5)
* [ ] Descarnar
* [ ] Livro
* [ ] Faca
* [ ] Projétil de Sangue
* [ ] Ritual de Leitura
* [ ] Colar Encharcado de Sangue
* [ ] Conferir bleed
* [ ] Conferir dano físico
* [ ] Conferir resistência
* [ ] Avaliar aumento do combo

Referência inicial:

```text
+15% bleed
-20% dano de Sangue
```

---

## GAL

Conferido no código em 2026-10-22 (revisão da Ultimate e do despertar): os itens marcados existem no kit atual.
* [x] Ereshkigal (Ativar Ereshkigal, trás + □)
* [x] Duas lâminas (modelo Ereškigal no Blender, v3.34.0)
* [x] Correntes (Corrente de Captura □, Corrente Gancho △ + □, puxão trás + ○)
* [x] Corrente Giratória
* [x] Controle Mental
* [x] Perfect Block (`defense.perfectBlock`: 0,15 s, contra-ataque 0,7 s)
* [x] Teleporte
* [x] Desviar Balas (passiva `bulletDodge`)
* [ ] Rejeitar Névoa — não existe no kit; a origem do pedido não foi encontrada na wiki (conferir antes de fazer)
* [ ] Arremesso — a habilidade "Arremessar" da wiki (acertar e arremessar o alvo para longe) não tem golpe próprio
* [x] Mortal Speed (Velocidade Mortal)
* [x] Passiva (dreno X/Y enquanto a Ereshkigal está ativa)
* [ ] Conferir controle de espaço
* [x] **Ultimate Injustiça refeita pela cena do cânone** (2026-10-22): corrente → Controle Mental (o alvo ajoelha sob o
  sigilo) → a fala inteira → 3 cortes "sabidos antes" (Bênção Maldita) → cruz final que derruba. Mesmo dano, custo e
  recarga; dano em cada impacto; esquiva/defesa da corrente continuam valendo.
* [x] **Despertar Afinidade com Precognição pela wiki** (2026-10-22): passa a dar a passiva Precognição (não é pego
  desprevenido) e a janela do Bloqueio Perfeito vai a 0,2 s; velocidade +15% → +10%.
* [x] **Nomes (pedido de 2026-10-22):** a Ultimate se chama **"Injustiça né?"** (banner curto) e a transformação
  **"O Realizador do Destino"** (apelido oficial do Gal; o poder continua sendo a Afinidade com Precognição).
* [x] Destacar a venda (brilho dourado) na ativação do despertar: as marcas da venda acendem e pulsam enquanto durar
  (`awakenMode.glowMat`).
* [x] **Cura que cobra sanidade deixa de ser passiva** (pedido do usuário, 2026-10-08): vira uma HABILIDADE que liga a
  cura do alvo + o roubo de sanidade por alguns segundos; fora dela, o físico do Gal é normal

---

## DANTE

* [ ] Tentáculos de Lodo
* [ ] Decadência
* [ ] Hold
* [ ] Slow
* [ ] Conferir alcance
* [ ] Conferir dano
* [ ] Evitar loop

---

## ERIN

* [ ] Em Nome do Caos
* [ ] Máscara de gás
* [ ] Custo em vida
* [ ] Sem barra de sanidade adicional
* [ ] Cena de suicídio
* [ ] Vitória caso o rival vá junto
* [ ] Supernova
* [ ] Black Hole
* [ ] Cura
* [ ] Telegraph

---

## AGUIAR

* [ ] Máscara
* [ ] Sangramento
* [ ] Machado
* [ ] Cura
* [ ] Efeitos próprios
* [ ] IA

---

## LABIRINTO

* [ ] Tempestade Caótica
* [ ] Raio contínuo
* [ ] Rastreamento
* [ ] Counterplay
* [ ] Identidade própria
* [ ] Não aumentar força apenas por tier

---

## XANDE

* [ ] Revisar kit
* [ ] Conferir elemento/rituais
* [ ] Conferir mobilidade
* [ ] Conferir dano
* [ ] Conferir identidade

---

## LÍRIO

* [ ] Revisar kit
* [ ] Conferir dano
* [ ] Conferir alcance
* [ ] Conferir visual
* [ ] Conferir IA

---

## FERREIRO

* [ ] Spiral Hypnosis
* [ ] Tiros amaldiçoados
* [ ] Controle de distância
* [ ] Dano
* [ ] IA

---

## JUAN / DIABO

* [ ] Pacto
* [ ] Lança de Sangue
* [ ] Poças
* [ ] Transporte
* [ ] Hate
* [ ] Regeneração
* [ ] Blood Armor
* [ ] Explosão do ombro
* [ ] Portador do Trono
* [ ] Testar comeback

Referências antigas de teste:

```text
Bleed: 4 → 3/s
Hate: +20% → +15%
Lifesteal: 0.12 → 0.08
Vida da forma: 1250 → 1150
```

**Todos esses valores são provisórios e devem obrigatoriamente ser reanalisados após os testes de balanceamento.**

---

## KEMI

* [ ] Rodar nova telemetria
* [ ] Conferir winrate
* [ ] Conferir dano
* [ ] Conferir facilidade de execução
* [ ] Não nerfar com base em poucas partidas

---

## BALU

* [ ] Conferir modelo
* [ ] Conferir animações
* [ ] Machado
* [x] **Machado em Giro arremessa a arma que está na mão** (pedido do usuário, 2026-10-08): com o Machado
  Demônio ativo (machado virou clava/maça de sangue), o □ deve lançar a clava — hoje lança o machado comum
* [ ] Blood Curse
* [ ] Demon Axe
* [ ] Imposing Voice
* [ ] Resistência
* [ ] Ataque de chão
* [ ] Coração de Urso
* [ ] IA
* [ ] Balanceamento

---

# 23.5 REMODELAR COM A TÉCNICA NOVA (Blender MCP + `sculpt_lib`)

A partir da v3.23 os modelos passaram a ser feitos com a técnica nova (`tools/blender/sculpt_lib.py`: escultura por
metaballs, relevo na própria malha, roupa por `clothe`, cascas por `shell_grid`), conferindo com as referências da
wiki. Os modelos abaixo ainda são da técnica antiga (peças geométricas coladas) e devem ser refeitos na mesma
qualidade do Cristino / Cristopher / Dante v2 — um por vez, com o kit e as juntas preservados.
(A Aghata já teve um remodel, mas foi antes da técnica nova: entra aqui.)

**Já na técnica nova:** Cristino, Cristopher, Dante (+ Olhos Abertos), Juan / Henri, Deus da Morte, Existido de Morte, A Marionete.

- [ ] **O Carniçal como personagem jogável** (criatura do Outro Lado) — saiu das invocações na v3.31.0 (o Deus da Morte
  agora invoca um Existido de Morte). Reaproveitar `tools/blender/npc_carnical.py` / `public/npcs/carnical.glb` e o kit
  antigo (Garra da Morte, Pancada Poderosa, o salto, Hipnose Espiral, Corpo Fechado, Instinto Mortal — no histórico da
  v3.30.1, `src/combat/beasts.js`).

## Personagens jogáveis

* [ ] Aghata
* [ ] Aguiar
* [ ] Amigo Imaginário
* [ ] Arnaldo Fritz
* [ ] Arthur Cervero
* [ ] Balu
* [ ] Dalmo (e o Colosso)
* [ ] Erin
* [ ] O Estrangeiro
* [ ] Ferreiro
* [ ] Gal Sal
* [ ] Guizo
* [ ] Jae
* [ ] Joui
* [ ] Kaiser
* [ ] Kemi
* [ ] Kian
* [ ] Labirinto
* [ ] Lírio
* [ ] A Magistrada
* [ ] O Diabo
* [ ] Senhor Veríssimo
* [ ] Xande

## Formas com modelo próprio

* [ ] O Anfitrião
* [ ] O Portador do Trono (forma do Juan)
* [ ] A Fantasma (forma da Kemi)

## Invocações

* [ ] Os Mananciais (Ferreiro)
* [ ] Zumbi de Sangue e Zumbi de Sangue forte (O Diabo / Portador do Trono)
* [ ] As feras de tinta — cão e javali (Amigo Imaginário)

---

# 24. CURAS

Cada personagem deve possuir identidade visual própria.

* [ ] Revisar efeitos
* [ ] Evitar reutilizar exatamente o mesmo efeito
* [ ] Conferir cores
* [ ] Conferir partículas
* [ ] Conferir animação
* [ ] Conferir leitura

---

# 25. TELEPORTES

Cada personagem deve possuir identidade própria.

* [ ] Rastro específico
* [ ] Evitar mesmo efeito para todos
* [ ] Conferir velocidade
* [ ] Conferir origem/destino
* [ ] Conferir câmera
* [ ] Conferir colisão
* [ ] Conferir interação com ataques

---

# 26. FANTASMA / MUTILADOR / FORMAS ESPECIAIS

## Fantasma

* [ ] Animações próprias
* [ ] Loop de balas
* [ ] Bandagens envolvendo o corpo
* [ ] Efeito próprio de transformação
* [ ] Rastro de teleporte
* [ ] Pose
* [ ] Vitória

## Mutilador

Título:

**??? · MUTILADOR NOTURNO · A FANTASMA**

* [ ] Conferir apresentação
* [ ] Conferir máscara
* [ ] Conferir transformação
* [ ] Conferir pose

## Juan

Título:

**PORTADOR DO TRONO**

* [ ] Conferir apresentação
* [ ] Blood Armor
* [ ] Explosão do ombro
* [ ] Transformação

---

# 27. ANIMAÇÕES

* [ ] Revisar placeholders
* [ ] Criar animações próprias das formas
* [ ] Revisar transformações
* [ ] Revisar ataques especiais
* [ ] Revisar vitórias
* [ ] Revisar derrotas
* [ ] Revisar transições
* [ ] Corrigir clipping
* [ ] Corrigir poses artificiais

---

# 28. CÂMERA

## Combate

* [ ] Distância
* [ ] Acompanhamento
* [ ] Movimentação lateral
* [ ] Zoom
* [ ] Transformações
* [ ] Especiais cinematográficos
* [ ] Evitar atravessar cenário
* [ ] Evitar esconder personagens
* [ ] Equipe
* [ ] Personagens grandes
* [ ] Personagens pequenos

## Vitória

* [ ] Centralizar vencedor
* [ ] Enquadrar vencedor
* [ ] Movimento cinematográfico
* [ ] Pose própria
* [ ] Frase
* [ ] Subtítulo
* [ ] Iluminação
* [ ] Transformação

---

# 29. INTRODUÇÕES

O sistema de introdução deve permanecer separado das frases de vitória.

## Estrutura

* [ ] `INTRO_DIALOGUES`
* [ ] `VICTORY_LINES`

Nunca misturar os dois.

## Conteúdo

Referência atual do sistema:

* 15 personagens;
* 210 confrontos;
* 2 variações por confronto;
* 420 cenas;
* 840 falas.

## Apresentação

* [ ] Duração dinâmica
* [ ] Destaque de quem fala
* [ ] Câmera enquadrando os dois
* [ ] Sem HUD
* [ ] Sem cronômetro
* [ ] Transição para batalha
* [ ] Variações

## Escrita

* [ ] Personagem responde ao outro
* [ ] Evitar frases genéricas
* [ ] Evitar clichês
* [ ] Manter personalidade
* [ ] Manter rivalidades
* [ ] Manter humor
* [ ] Anfitrião especialmente ácido
* [ ] Não fazer todos falarem igual

---

# 30. FRASES DE VITÓRIA

* [ ] Revisar todas
* [ ] Conferir personalidade
* [ ] Conferir formas
* [ ] Conferir subtítulos
* [ ] Conferir câmera
* [ ] Conferir animação
* [ ] Diferenciar de introduções
* [ ] Evitar clichês

---

# 31. IA

## Estratégia

* [ ] Reconhecer repetição
* [ ] Evitar spam
* [ ] Reagir a telegraphs
* [ ] Reagir à Flash Grenade
* [ ] Priorizar summons
* [ ] Utilizar recursos
* [ ] Transformar
* [ ] Recuar
* [ ] Pressionar
* [ ] Utilizar assistência

## Dificuldades

* [ ] Fácil
* [ ] Normal
* [ ] Difícil
* [ ] Muito Difícil

A dificuldade deve melhorar comportamento, não apenas aumentar dano.

## Treinamento

* [ ] Rodar CPU × CPU
* [ ] Atualizar `public/ai/learned.json`
* [ ] Treinar novamente após mudanças importantes

---

# 32. TELEMETRIA

Após finalizar alterações relevantes dos kits:

* [ ] Rodar `npm run balance` (o script ainda não existe — ver §76.5)
* [ ] CPU × CPU
* [ ] 2–3 partidas por confronto
* [ ] Registrar vitórias
* [ ] Registrar dano
* [ ] Registrar uso de habilidades
* [ ] Registrar combos
* [ ] Registrar duração
* [ ] Registrar transformações
* [ ] Registrar especiais
* [ ] Registrar comportamento da IA

---

# 33. REGRA ABSOLUTA DE BUFFS E NERFS

**Nenhum buff ou nerf presente neste TODO é definitivo.**

Todos os valores são hipóteses de trabalho.

Isso inclui:

* dano;
* vida;
* PE;
* custo;
* cooldown;
* velocidade;
* duração;
* bleed;
* lifesteal;
* Hate;
* resistência;
* multiplicadores;
* força de transformação;
* assistências;
* especiais;
* alcance;
* recuperação.

Depois dos testes:

* [ ] Confirmar
* [ ] Aumentar
* [ ] Reduzir
* [ ] Remover
* [ ] Reverter
* [ ] Criar novo ajuste

conforme os dados.

### Processo

1. Rodar telemetria.
2. Identificar outliers.
3. Alterar pouco.
4. Rodar novamente.
5. Comparar.
6. Testar manualmente.
7. Verificar se a mudança não criou outro problema.
8. Repetir.
9. Só então considerar o personagem estabilizado.

Uma única partida nunca deve determinar um nerf ou buff.

Oscilações de aproximadamente 10–20% podem acontecer em poucas partidas.

---

# 34. OBJETIVO DE BALANCEAMENTO

## S

* Kian
* Gal
* Formas especiais

## A

* Dante
* Joui
* Juan
* Ferreiro

## B

* Kaiser
* Arthur
* Erin
* Aghata
* Kemi
* Aguiar
* Balu

## C

* Xande
* Lírio
* Labirinto

Referência de equilíbrio:

**35%–65%**

Tier representa função/força geral e não necessariamente uma obrigação de winrate.

---

# 35. LAN / ONLINE

## Teste real

* [ ] PC 1 host
* [ ] PC 2 convidado
* [ ] Código
* [ ] Senha
* [ ] Sala pública
* [ ] Sala privada
* [ ] Entrada por código
* [ ] Seleção
* [ ] Batalha
* [ ] Sincronização
* [ ] RNG
* [ ] Checksum
* [ ] Correção de estado

## Radmin

* [ ] Testar PC × PC
* [ ] Testar IP virtual
* [ ] Testar latência
* [ ] Testar desconexão
* [ ] Testar reconexão

## Falhas

* [ ] Queda do host
* [ ] Failover
* [ ] Fechamento
* [ ] Retorno ao menu

## Futuro

* [ ] Equipe em LAN
* [ ] Assistências em rede
* [ ] Mais jogadores

---

# 36. MOBILE

## Testes reais

* [ ] Android
* [ ] iPhone
* [ ] Toque nos menus
* [ ] Seleção
* [ ] Batalha
* [ ] HUD
* [ ] Controles
* [ ] Orientação
* [ ] Resoluções
* [ ] Performance

## HUD

* [ ] Compactação
* [ ] Skill strip
* [ ] Vida
* [ ] PE
* [ ] Dodge
* [ ] Timer
* [ ] Assistências

---

# 37. SISTEMA DE IDIOMAS

> ✅ **Interface ligada (próxima versão após a v3.10.1):** OPÇÕES → IDIOMA troca na hora toda a interface (menu
> principal, opções, seleção, configurações da batalha, cenário, carregamento, vitória, pausa/treino, comandos, online,
> HUD, chamadas da luta e botões de toque). Os 13 arquivos `src/i18n/locales/*.js` têm as mesmas chaves (teste em
> `tests/i18n.test.js`). **Ainda em português:** conteúdo dos personagens (golpes, habilidades, descrições, falas),
> novidades (aviso na tela), nomes/descrições dos cenários, passos do Tutorial e os avisos de combate que são nomes de
> poderes/frases dos personagens. Os avisos do SISTEMA (errou, recarregando, longe demais, bloqueio perfeito…) e as
> mensagens da partida online já traduzem (`tAlert` em `src/i18n/index.js`).

Criar:

**CONFIGURAÇÕES → IDIOMA**

O jogador deve poder escolher manualmente o idioma do jogo.

---

# 38. IDIOMAS PRIORITÁRIOS

## Primeira camada

* [x] 🇧🇷 Português — Brasil (`pt-BR`)
* [x] 🇵🇹 Português — Portugal (`pt-PT`)
* [x] 🇺🇸 Inglês (`en`)
* [x] 🇪🇸 Espanhol (`es`)
* [x] 🇩🇪 Alemão (`de`)
* [x] 🇫🇷 Francês (`fr`)
* [x] 🇮🇹 Italiano (`it`)
* [x] 🇷🇺 Russo (`ru`)
* [x] 🇨🇳 Chinês (`zh`)
* [x] 🇯🇵 Japonês (`ja`)
* [x] 🇰🇷 Coreano (`ko`)
* [x] 🇹🇷 Turco (`tr`)
* [x] 🇵🇱 Polonês (`pl`)

(interface traduzida nos 13; o conteúdo segue a §40)

## Expansão futura

* [ ] Holandês
* [ ] Sueco
* [ ] Tcheco
* [ ] Árabe
* [ ] Hindi
* [ ] Outros idiomas conforme demanda

A arquitetura deve permitir adicionar idiomas sem modificar a lógica do jogo.

---

# 39. SISTEMA DE LOCALIZAÇÃO

Estrutura centralizada implementada em `src/i18n/`.

* [ ] Remover textos hardcoded gradualmente

---

# 40. TEXTOS LOCALIZÁVEIS

Todo texto visível deve passar pelo sistema.

## Interface

* [x] Menu
* [x] Configurações
* [x] Seleção
* [x] Loading
* [x] Pausa
* [x] Vitória
* [ ] Derrota

## Combate

* [ ] Habilidades
* [ ] Descrições
* [x] Alerts (os do sistema; nomes de poderes ficam como conteúdo)
* [x] SPECIAL
* [x] MISS
* [x] DODGED
* [x] NO DODGES
* [x] DANO
* [ ] HITS
* [x] Timer
* [ ] Assistências
* [ ] Transformações

## Conteúdo

* [ ] Personagens
* [ ] Títulos
* [ ] Introduções
* [ ] Vitórias
* [ ] Tutorial
* [ ] Torre
* [ ] Torneio
* [x] LAN
* [x] Online

## PRÓXIMA TAREFA (pedido do usuário em 2026-10-09, depois do Torneio local)

Traduzir o resto do jogo para os 13 idiomas:

* [ ] DIÁLOGOS (falas de introdução, vitória e batalha em `config/dialogues.js`)
* [ ] Nomes de golpes, habilidades, especiais e transformações
* [ ] Descrições e informações dos personagens (estilo, identidade, frases)
* [ ] Nome do jogo (logo/título por idioma, se fizer sentido)
* [ ] Novidades, cenários (nomes e descrições), passos do Tutorial e o resto que ainda está em português

---

# 41. DIÁLOGOS LOCALIZADOS

Os diálogos devem utilizar IDs, não texto diretamente na lógica.

Exemplo:

```text
dialogue.characterA.characterB.01
dialogue.characterA.characterB.02
```

Idiomas:

```text
pt-BR
pt-PT
en
es
de
fr
it
ru
zh
ja
ko
tr
pl
```

* [ ] Todas as introduções
* [ ] Todas as vitórias
* [ ] Todas as frases especiais
* [ ] Fallback
* [ ] Verificação de tradução ausente

---

# 42. FONTES INTERNACIONAIS

Suportar:

* [ ] Latin
* [ ] Cirílico
* [ ] Japonês
* [ ] Chinês
* [ ] Coreano

Testar:

* [ ] Menu
* [ ] HUD
* [ ] Nomes
* [ ] Diálogos
* [ ] Habilidades
* [ ] Vitória
* [ ] Torre
* [ ] Torneio

Evitar fonte que gere quadrados ou caracteres ausentes.

---

# 43. TEXTOS DINÂMICOS

Suportar:

```text
"Vencedor: {player}"
"Andar {floor}"
"{hits} HITS"
"{damage} DANO"
```

* [ ] Pluralização
* [ ] Números
* [ ] Gênero quando necessário
* [ ] Ordem das palavras
* [ ] Datas
* [ ] Valores
* [ ] Percentuais

Não montar frases concatenando palavras fixas quando a ordem mudar entre idiomas.

---

# 44. DETECÇÃO AUTOMÁTICA DE IDIOMA

Implementado em `src/i18n/index.js` via `detectBrowserLanguage()` respeitando a preferência manual do jogador em primeiro lugar.

---

# 45. TORNEIO

## Objetivo

Criar modo inspirado no sistema de torneio de jogos de arena, permitindo montar um campeonato personalizado.

O jogador deve poder escolher os participantes e as equipes.

> v1 LOCAL (2026-10-09, escopo escolhido pelo usuário: local primeiro, online depois; lutas só de CPU sempre
> sorteadas): `src/game/tournament.js` (chave, testes em `tests/tournament.test.js`) + `TournamentSetupScreen` /
> `TournamentScreen`. 2–8 participantes humano/CPU, solo ou equipe (líder + 2), tempo/rounds/dificuldade/cenário
> (fixo ou aleatório), cada humano escolhe na vez, CPU sorteia; eliminatória com "passa direto"; humano × CPU com o
> humano no P1, humano × humano P1 × P2; tela de campeão. Falta o ONLINE (§48).

---

# 46. TORNEIO — JOGADORES

Suportar:

**1 a 8 jogadores**

* [ ] 1 jogador (o mínimo é 2 participantes; 1 humano + CPUs funciona)
* [x] 2 jogadores
* [x] 3 jogadores
* [x] 4 jogadores
* [x] 5 jogadores
* [x] 6 jogadores
* [x] 7 jogadores
* [x] 8 jogadores

Participantes podem ser:

* humanos locais;
* humanos online;
* CPU.

---

# 47. TORNEIO — LOCAL

* [x] Escolher quantidade de jogadores
* [x] Definir cada jogador
* [x] Definir CPU
* [x] Escolher controles (humano × humano: P1 × P2; humano × CPU: humano no P1)
* [x] Escolher equipes
* [x] Escolher personagens
* [x] Configurar regras

---

# 48. TORNEIO — ONLINE

* [ ] Criar sala
* [ ] Código
* [ ] Senha opcional
* [ ] Número de jogadores
* [ ] Lista de participantes
* [ ] Ready
* [ ] Host controla configurações
* [ ] Distribuição dos participantes
* [ ] Sincronização da chave
* [ ] Sincronização dos resultados
* [ ] Desconexão
* [ ] Reconexão
* [ ] Tratamento de abandono

---

# 49. TORNEIO — EQUIPES

Cada equipe deve poder ser configurada individualmente.

Exemplo:

```text
TIME 1
- Personagem A
- Personagem B
- Personagem C

TIME 2
- Personagem D
- Personagem E
- Personagem F
```

* [ ] Quantidade de integrantes (fixo: líder + 2)
* [x] Personagens individuais
* [x] Humano/CPU
* [ ] Repetição quando permitido
* [x] Assistências
* [x] Trocas
* [x] HUD

---

# 50. TORNEIO — CHAVE

Criar representação visual.

* [x] Rodada inicial
* [x] Quartas
* [x] Semifinal
* [x] Final
* [x] Vencedor
* [x] Eliminado
* [x] Avanço automático
* [x] CPU × CPU (sorteado)
* [x] Humano × CPU
* [x] Humano × Humano

A estrutura deve adaptar-se ao número de participantes.

---

# 51. TORNEIO — REGRAS

* [x] Tempo
* [x] Rounds
* [x] Dificuldade
* [x] Cenário
* [x] Equipes
* [x] Assistências
* [x] Condição de vitória
* [ ] Revanche
* [x] Avanço
* [x] Eliminação

---

# 52. TORNEIO — APRESENTAÇÃO

* [ ] Abertura
* [ ] Participantes
* [ ] Equipes
* [ ] Chave
* [ ] Transição
* [ ] Resultado
* [ ] Atualização da chave
* [ ] Próximo confronto
* [ ] Final
* [ ] Campeão
* [ ] Tela final

---

# 53. TORNEIO — IDIOMAS

Todas as informações do torneio devem ser localizáveis.

* [x] Nome das rodadas
* [x] Jogadores
* [x] Equipes
* [x] Chave
* [x] Resultados
* [x] Campeão
* [x] Eliminado
* [x] Configurações

---

# 54. TORRE

## Conceito

Modo inspirado na Torre de Mortal Kombat.

O jogador começa no primeiro andar e enfrenta uma sequência de adversários.

Ao vencer:

**sobe um andar.**

Objetivo:

**chegar ao topo da torre.**

---

# 55. TORRE — ESTRUTURA

> v2 (2026-10-09, pedido do usuário): menu com **8 torres** (4 em cima, 4 embaixo); só a 1ª livre, as outras com
> cadeado até zerar a anterior. Clicou → a torre em **3D estilo Babel** (`ui/towerStage.js`): a câmera sobe da base
> ao topo e afasta mostrando a torre inteira. Escolhe UM lutador (não troca, nem na pausa) e a **dificuldade, que vale
> para todos os andares**. Andares sem repetir adversário (o próprio lutador pode aparecer: Kaiser × Kaiser vale).
> No topo um **vilão sorteado a cada subida** (Anfitrião, Fantasma, Mutilador, ???, Erin do Caos, Portador do Trono,
> Deus da Morte) **fortalecido** conforme a dificuldade (vida ×1,3–2,2, dano ×1,1–1,5, recebe menos). Torre VIII =
> Torre de Babel: os andares são os vilões e o Deus da Morte no topo, ainda mais forte. O menu mostra a dificuldade
> MAIS DIFÍCIL já zerada em cada torre (`localStorage['arena_torres']`).

* [x] Criar modo
* [x] Tela de seleção
* [x] Mapa vertical
* [x] Andares
* [x] Adversários
* [x] Progressão
* [x] Chefes
* [x] Topo
* [x] Tela de conclusão

---

# 56. TORRE — PROGRESSÃO

Estrutura:

```text
ANDAR 1
   ↓
ANDAR 2
   ↓
ANDAR 3
   ↓
ANDAR 4
   ↓
ANDAR 5
   ↓
...
   ↓
TOPO
```

* [x] Definir quantidade de andares (8)
* [x] Definir adversários
* [x] Definir dificuldade
* [x] Definir chefes
* [x] Definir chefe final
* [ ] Definir recompensas
* [ ] Definir condições especiais

---

# 57. TORRE — ADVERSÁRIOS

Podem existir:

* personagem normal;

* personagem transformado;

* equipe;

* CPU difícil;

* batalha especial;

* chefe.

* [x] Lista de adversários

* [x] Progressão

* [x] Evitar repetição

* [ ] Encontros especiais

* [ ] Chefes

---

# 58. TORRE — ENTRE BATALHAS

Definir o que acontece depois da vitória.

Possibilidades:

* [ ] Recuperação de vida
* [ ] Recuperação de PE
* [ ] Recuperação parcial
* [ ] Modificadores
* [ ] Escolha de caminho
* [ ] Recompensas
* [ ] Bônus
* [ ] Penalidades
* [ ] Batalhas especiais

Regra principal:

**venceu → sobe.**

---

# 59. TORRE — DERROTA

Definir:

* [ ] Derrota encerra a torre (escolhido: não encerra — dá para tentar o andar de novo)
* [x] Retry
* [x] Checkpoint (o andar atual)
* [x] Andar máximo
* [ ] Salvar progresso
* [ ] Estatísticas

---

# 60. TORRE — CHEFES

* [ ] Batalhas especiais
* [ ] Apresentações
* [ ] HUD
* [ ] Música
* [ ] Dificuldade
* [ ] Recompensa
* [ ] Chefe final

---

# 61. TORRE — RECOMPENSAS

Definir posteriormente.

Possibilidades:

* [ ] Personagem
* [ ] Forma
* [ ] Cenário
* [ ] Cosméticos
* [ ] Títulos
* [ ] Frases
* [ ] Ícones
* [ ] Estatísticas
* [ ] Apenas recorde/progressão

Não criar um sistema enorme de recompensas antes de definir o escopo.

---

# 62. TORRE — IDIOMAS

* [x] Andar
* [x] Chefe
* [x] Próximo andar
* [x] Vitória
* [x] Derrota
* [x] Topo
* [ ] Recompensa
* [x] Recorde
* [x] Continuar
* [x] Reiniciar
* [ ] Falas dos chefes (o Deus da Morte usa as falas do Ferreiro; falas próprias de chefe ficam para depois)

---

# 63. TREINO

* [ ] Bot parado
* [ ] Regeneração
* [ ] Reset
* [ ] Reset de posição
* [ ] Reset de vida
* [ ] Reset de PE
* [ ] Reset de cooldown
* [ ] Mostrar dano
* [ ] Mostrar combo
* [ ] Testar transformações
* [ ] Testar especiais
* [ ] Testar grabs
* [ ] Testar assists

---

# 64. CPU × CPU

* [ ] Selecionar personagem
* [ ] Selecionar personagem adversário
* [ ] Dificuldade
* [ ] Cenário
* [ ] Tempo
* [ ] Início automático
* [ ] Reinício
* [ ] Estatísticas
* [ ] Telemetria
* [ ] Múltiplas partidas

---

# 65. MODOS PRINCIPAIS

O menu deve contemplar:

```text
BATALHA
TREINO
CPU × CPU
TORNEIO
TORRE
LAN / ONLINE
```

Futuramente:

```text
NOVOS MODOS
```

---

# 66. BATALHA EM EQUIPE

* [ ] 2×2
* [ ] Troca
* [ ] Assistência
* [ ] HUD
* [ ] Câmera
* [ ] IA
* [ ] Vitória
* [ ] Transformações
* [ ] LAN
* [ ] Online

---

# 67. ASSISTÊNCIAS

Entradas:

* [ ] Analógico esquerdo
* [ ] Analógico direito
* [ ] D-pad esquerda
* [ ] D-pad direita
* [ ] Assist 1
* [ ] Assist 2

Comportamentos:

* [ ] Movimento
* [ ] Sem movimento
* [ ] Arthur — Ódio Incontrolável
* [ ] Arthur — Descarnar
* [ ] Conferir todos os demais assists
* [ ] Balancear cooldown
* [ ] Conferir leitura

---

# 68. HUD

## Geral

* [ ] Portraits
* [ ] Vida
* [ ] SANIDADE / PE
* [ ] Dodge
* [ ] Timer
* [ ] Combo
* [ ] Dano
* [ ] Assistências
* [ ] Alertas
* [ ] Cores dos jogadores

## Indicadores

* [x] **Banner do nome do especial/transformação refeito** (pedido de 2026-10-22; feito no mesmo dia: faixa cresce com o
  texto, letra pela largura, duas linhas se precisar): hoje é só um texto por cima da tela
  (`#banner` em `styles.css`, `HUD.banner`) e fica bugado — a fonte (até 160 px, linha de 140 px) sai para fora da faixa
  preta de 120 px atrás, nomes longos não quebram nem cabem (o tamanho só cai por contagem de letras), o texto e a faixa
  inclinam juntos e cortam nas bordas, e no celular ocupa a tela toda. Fazer a faixa crescer com o texto, limitar o
  tamanho pela largura real, quebrar em duas linhas se precisar e manter o banner curto (ex.: "Injustiça né?").
* [ ] SPECIAL
* [ ] MISS
* [ ] DODGED
* [ ] NO DODGES
* [ ] DANO ###
* [ ] N HITS

---

# 69. MENU PRINCIPAL

* [ ] Definir nome final
* [ ] Definir logo final
* [ ] Tipografia
* [ ] Música
* [ ] Cartões
* [ ] Ícones
* [ ] Navegação
* [ ] Transições
* [ ] Consistência entre telas

---

# 70. SELEÇÃO DE PERSONAGEM

* [ ] Layout
* [ ] Portraits
* [ ] Informações
* [ ] Elementos
* [ ] Nomes
* [ ] Formas
* [ ] Fundos temáticos
* [ ] Equipes
* [ ] Assistências
* [ ] Mobile
* [ ] Idiomas

---

# 71. ÁUDIO

Buscar recursos com licença compatível.

> 2026-10-09: efeitos sonoros CC0 do Kenney (Impact Sounds, RPG Audio, Sci-Fi Sounds, Interface Sounds) via
> `tools/import-sounds.py`. O usuário ouviu e reprovou os socos e a espada do Kenney (soavam como pancada em saco) →
> golpes trocados por pacotes CC0 de combate do OpenGameArt (37 hits/punches, Punch, 20 Sword Sound Effects, swishes):
> silêncio do começo cortado (chegava a 270 ms), pico normalizado, espada acertando = aço + golpe no corpo, whoosh no
> ar. Depois (2º pedido): tiros (M4, escopeta, sniper — cada disparo da biblioteca de armas vira uma variação),
> garras/carne, correntes, chicote, teleporte, batimento, pulo/aterrissagem, medo e K.O. — 39 sons gravados.
> 3º pedido: os sons paranormais também (ritual, carga, especial armado/início, power-up, dreno, renascer, lâmina do
> medo, máscara, fumaça, faixa, aplausos e o zumbido em loop da Carga de Poder) — 52 sons gravados. Seguem
> sintetizados `ready` (aviso de interface) e `laugh` (a risada gravada do Anfitrião foi reprovada pelo usuário). Trocar um som: mapa de `tools/import-sounds.py`.
> O foco é efeito sonoro, não música (pedido do usuário).

* [x] Socos
* [x] Impactos
* [x] Bloqueios
* [ ] Esquivas
* [ ] Transformações
* [ ] Especiais
* [x] Menus
* [ ] Vitória
* [ ] Música do menu
* [ ] Música de batalha
* [ ] Música de transformação
* [ ] Música de chefes
* [ ] Música de Torneio
* [ ] Música de Torre

---

# 72. EFEITOS VISUAIS

> 2026-10-09: texturas CC0 do Kenney Particle Pack (`tools/import-fx.py` → `public/fx/`): fumaça de verdade em todas
> as partículas de fumaça (girando), clarão de estrela nos golpes, bola de fogo + estouro + pedrinhas na explosão,
> pedrinhas nos golpes pesados no chão, faíscas elétricas na energia paranormal e brilho no bloqueio perfeito.

* [x] Socos
* [x] Impactos
* [x] Explosões
* [x] Cortes (arco com degradê, borda quente e varredura)
* [ ] Tiros
* [ ] Projéteis
* [x] Fumaça
* [x] Energia
* [ ] Sangue
* [ ] Teleporte
* [ ] Efeitos paranormais

Os efeitos não podem prejudicar a leitura do combate.

---

# 73. CENÁRIOS / BLENDER

## Orfanato / cidade

* [ ] Dividir grandes blocos
* [ ] Corrigir oclusão
* [ ] Corrigir transparência
* [ ] Corrigir colisão
* [ ] Conferir câmera
* [ ] Conferir performance

## Cemitério / ruínas

* [ ] Dividir grandes blocos
* [ ] Corrigir oclusão
* [ ] Corrigir colisão
* [ ] Conferir câmera
* [ ] Conferir performance

## Técnica

A solução definitiva deve preferencialmente ser feita no Blender.

O protótipo de divisão automática com:

* `union-find`;
* `autoOcc`;
* separação de geometria;

pode servir como apoio.

---

# 74. PERFORMANCE

* [ ] FPS em batalha
* [ ] FPS em transformação
* [ ] FPS com muitos efeitos
* [ ] FPS em cenários grandes
* [ ] Memória
* [ ] Loading
* [ ] Descarregamento
* [ ] Partículas
* [ ] Listeners
* [ ] Objetos não destruídos
* [ ] Mobile

---

# 76. ARQUITETURA DOS MODOS

Torneio e Torre devem reutilizar:

* [ ] Sistema de combate
* [ ] Sistema de personagens
* [ ] Sistema de IA
* [ ] Sistema de HUD
* [ ] Sistema de câmera
* [ ] Sistema de seleção
* [ ] Sistema de regras
* [ ] Sistema de áudio
* [ ] Sistema de localização

Não criar um segundo sistema de combate separado para cada modo.

---

# 76.5 ANÁLISE DO JOGO (v3.10.1) — MELHORIAS NOVAS

Levantado em 2026-10-08 olhando o código e o jogo rodando. Só entra aqui o que ainda NÃO estava no TODO (ou estava
genérico demais), com o motivo. Nenhum item é de balanceamento.

## Carregamento e desempenho (celular primeiro)

* [ ] **Carregar sob demanda:** hoje a abertura baixa TUDO — `preloadModels` (todos os ~25 `.glb`, 22 MB) e
  `preloadArenas` (os 5 cenários, 16 MB). Baixar só no "Carregamento" os lutadores escolhidos (2, ou 6 na equipe) +
  as formas deles + o cenário, com cache; a seleção mostra os retratos/miniaturas.
* [ ] **Comprimir os `.glb`** (meshopt ou Draco; texturas em KTX2/WebP). O maior é o Diabo (1,6 MB).
* [x] **Contador de desempenho de dev** (feito em 2026-10-22: `src/dev/perf.js`, `?perf` ou F8 no dev) (FPS, memória, objetos na cena) para medir cada cenário/personagem antes e
  depois das otimizações acima.

## Opções e acessibilidade

* [ ] **Remapear teclas e botões** (hoje fixos em `config/controls.js`), salvo no navegador.
* [x] **Falas:** opção de desligar as falas durante a luta (Opções › Partida › Falas na luta, 2026-10-22).

## Personagens e animação

* [x] **Pose de vitória própria para o Arthur** (`vic_arthur`: a sniper apoiada no ombro; `victoryProp` mostra a arma
  na vitória). Correção da análise: a Lírio já tinha a dela (`victory_hammer`, a Leonora erguida).
* [~] **REAJUSTE DAS ANIMAÇÕES** — 1ª parte feita em 2026-10-23 (`anim/locomotionClips.js`): corrida, caminhada, pulo,
  queda, dash, esquiva e reação a golpe refeitos à mão com ciclos de verdade (contato, absorção, passagem, impulso; giro
  do quadril, contra-giro do tronco, cabeça estabilizada); a caminhada de costas e as das formas saem deles. FALTA a
  importação de um pacote gratuito: precisa do OK do dono para o pacote escolhido (ex.: Quaternius Universal Animation
  Library, CC0) — baixar arquivos de terceiros não é feito sem aprovação — e o redirecionamento para o esqueleto.
  Pedido original (2026-10-23: "as animações do jogo já são antigas pro nível que está o jogo"): importar animações de movimento GRATUITAS e de licença livre (ex.: Quaternius Universal Animation Library,
  CC0; conferir a licença de cada pacote antes de usar), redirecionar para o esqueleto do jogo (`anim/clips.js` hoje é
  todo feito à mão em poses-chave) e ajustar para o estilo da luta: andar, correr, pular, cair, esquiva, dash, idle,
  levar golpe. Começar pela movimentação (é o que mais aparece) e manter as poses de golpe próprias de cada personagem.
* [x] **Idles próprios** (2026-10-23, `anim/idleClips.js`): 18 posturas novas — os 8 que dividiam `idle_knife`, os 4 de
  `idle_katana` e os 6 de `idle_fist` ganharam a sua (ex.: Jae agachada com o punhal perto do rosto, Xande com o taco no
  ombro e o skate à frente, Joui no iaijutsu, Cristopher gingando na guarda de boxe, Kian sereno de braços abertos).
  Ainda dividem: Balu e Lírio (`idle_hammer`), Erin e Gal Sal (`idle_dual`), Arnaldo e Magistrada (`idle_arnaldo`).

## Qualidade do código e testes

* [ ] **Dividir os arquivos gigantes:** `combat/abilities.js` (3 024 linhas) e `combat/Fighter.js` (2 810) em módulos
  por família (movimento, buffs, invocações, agarrão, esquiva, transformação).
* [ ] **Teste de fumaça automático dos kits:** todas as habilidades, especiais, agarrões e transformações de todos os
  personagens, sem erro e sem cinemática presa (hoje é feito à mão no navegador) — num navegador sem tela (ex.:
  Playwright) dentro do `npm test`.
* [ ] **Mais testes de sistema:** só 28 testes hoje; faltam Barra de Transformação, Despertar, volta da forma no fim do
  round, cutscene do agarrão e o aprendizado da CPU.
* [ ] **Script `npm run balance`:** o §32 manda rodar, mas ele não existe no `package.json` — rodar o `runBalance` num
  navegador sem tela e salvar a tabela em arquivo.

## Online

* [ ] **Netcode com rollback** no lugar do lockstep com atraso (hoje a luta espera o quadro do outro chegar): muito
  melhor com ping alto. A simulação já usa sorteio com semente; falta salvar/restaurar o estado da luta.

## Para o jogador (fora do Torneio/Torre)

* [ ] **Perfil e estatísticas salvas:** vitórias por personagem, mais usado, maior combo, tempo jogado.
* [ ] **Fichas dos personagens:** galeria com a lore de cada um (o banco `lore/membros.json` já existe).
* [ ] **Desafios de combo** curtos por personagem, dentro do Treino.

---

# 77. REGRESSÃO FINAL

## Combate

* [ ] Sem combo infinito
* [ ] Sem grab impossível
* [ ] Sem especial invisível
* [ ] Sem esquiva sem counterplay
* [ ] Sem transformação quebrada
* [ ] Sem habilidade inútil
* [ ] Sem loops

## Personagens

* [ ] Todos carregam
* [ ] Todos possuem habilidades
* [ ] Todos possuem vitória
* [ ] Todos possuem introduções
* [ ] Todos possuem IA
* [ ] Todos possuem transformação quando aplicável
* [ ] Nenhum placeholder inesperado

## Rede

* [ ] LAN
* [ ] Radmin
* [ ] Sincronização
* [ ] Desconexão
* [ ] Failover

## Modos

* [ ] Batalha
* [ ] Treino
* [ ] CPU × CPU
* [ ] LAN/Online
* [ ] Torneio
* [ ] Torre

## Mobile

* [ ] Menu
* [ ] Seleção
* [ ] Batalha
* [ ] HUD
* [ ] Controles

## Idiomas

* [ ] Português BR
* [ ] Português PT
* [ ] Inglês
* [ ] Espanhol
* [ ] Alemão
* [ ] Francês
* [ ] Italiano
* [ ] Russo
* [ ] Chinês
* [ ] Japonês
* [ ] Coreano
* [ ] Turco
* [ ] Polonês

---

# 78. NÃO FAZER AGORA

* [ ] Não recriar modelos que já estão bons
* [ ] Não adicionar personagens em massa antes do balanceamento
* [ ] Não tratar buffs/nerfs como definitivos
* [ ] Não criar sistema elemental universal
* [ ] Não transformar TODO em changelog
* [ ] Não balancear com uma única partida
* [ ] Não criar segundo sistema de combate para Torneio/Torre
* [ ] Não criar dezenas de recompensas antes de definir a Torre
* [ ] Não polir cenários antes de estabilizar gameplay
* [ ] Não adicionar efeitos que prejudiquem leitura
* [ ] Não criar tradução hardcoded
* [ ] Não depender de uma única fonte que não suporte idiomas asiáticos/cirílicos
* [ ] Não implementar sistemas grandes sem reutilizar arquitetura existente

---

# 79. ORDEM FINAL DE EXECUÇÃO

## ETAPA 1 — ESTABILIDADE

* [x] Git
* [x] Limpeza
* [x] Check
* [x] Build
* [x] Regressão

## ETAPA 2 — PERSONAGENS RECENTES

* [x] Arnaldo
* [x] Anfitrião
* [x] Veríssimo
* [x] Animações
* [x] Efeitos
* [x] IA
* [x] Testes

## ETAPA 3 — COMBATE

> Etapas 3, 4 e 5 testadas e confirmadas pelo usuário em 2026-10-09.

* [x] Dodge
* [x] Substitution
* [x] Grab
* [x] Throw tech
* [x] Combo
* [x] Defesa
* [x] Wakeup
* [x] Telegraphs
* [x] Transformações
* [x] Assists

## ETAPA 4 — BALANCEAMENTO

* [x] Telemetria
* [x] CPU × CPU
* [x] 2–3 partidas por confronto
* [x] Buffs
* [x] Nerfs
* [x] Reanálise
* [x] Testes manuais
* [x] Nova telemetria

**Nenhum valor é definitivo antes desta etapa.**

## ETAPA 5 — INFRAESTRUTURA

* [x] Sistema de idiomas (interface; conteúdo dos personagens ainda em português — §37/§40)
* [x] Português BR
* [x] Português PT
* [x] Inglês
* [x] Espanhol
* [x] Alemão
* [x] Francês
* [x] Italiano
* [x] Russo
* [x] Chinês
* [x] Japonês
* [x] Coreano
* [x] Turco
* [x] Polonês
* [x] LAN
* [x] Radmin
* [x] Mobile
* [x] iPhone
* [x] Android

## ETAPA 6 — NOVOS MODOS

### Torneio

* [x] Local
* [ ] Online
* [x] 1–8 jogadores (2–8 participantes)
* [x] CPU
* [x] Equipes
* [x] Assistências
* [x] Chave
* [x] Regras
* [x] Resultados
* [x] Campeão

### Torre

* [x] Seleção
* [x] Andares
* [x] Adversários
* [x] Progressão
* [x] Recuperação (cada andar começa com vida e sanidade cheias)
* [ ] Modificadores
* [x] Chefes (vilão fortalecido no topo de cada uma das 8 torres)
* [x] Chefe final (Torre de Babel)
* [ ] Recompensas
* [x] Topo
* [x] Recorde

## ETAPA 7 — POLIMENTO

* [ ] HUD
* [ ] Menus
* [ ] Seleção
* [ ] Câmera
* [ ] Vitória
* [ ] Animações
* [ ] Efeitos
* [ ] Áudio
* [ ] Cenários
* [ ] Performance

## ETAPA 8 — CONTEÚDO FUTURO

* [x] Jae-yoon (Jae → X)
* [x] Dalmo (Dalmo → Colosso)
* [ ] Novas transformações
* [ ] Novos personagens
* [ ] Novos cenários
* [ ] Novos idiomas
* [ ] Novos modos

---

# 80. CHECKLIST DE LANÇAMENTO

Antes de considerar uma versão realmente pronta:

## Gameplay

* [ ] Combate estável
* [ ] Balanceamento testado
* [ ] Sem infinitos
* [ ] Sem exploits conhecidos
* [ ] Specials legíveis
* [ ] Transformações funcionando
* [ ] IA funcionando

## Conteúdo

* [ ] Personagens
* [ ] Introduções
* [ ] Vitórias
* [ ] Transformações
* [ ] Cenários
* [ ] Efeitos
* [ ] Áudio

## Modos

* [ ] Batalha
* [ ] Treino
* [ ] CPU × CPU
* [ ] LAN/Online
* [ ] Torneio
* [ ] Torre

## Rede

* [ ] PC × PC
* [ ] Radmin
* [ ] Sincronização
* [ ] Desconexão

## Mobile

* [ ] Android
* [ ] iPhone

## Internacionalização

* [ ] PT-BR
* [ ] PT-PT
* [ ] EN
* [ ] ES
* [ ] DE
* [ ] FR
* [ ] IT
* [ ] RU
* [ ] ZH
* [ ] JA
* [ ] KO
* [ ] TR
* [ ] PL

## Interface

* [ ] Menu
* [ ] Seleção
* [ ] Configurações
* [ ] HUD
* [ ] Vitória
* [ ] Derrota
* [ ] Loading
* [ ] Idioma

---

# 81. VISÃO FINAL

O Arena Paranormal deve chegar a um estado em que seja possível:

### LUTAR

Combate 3D completo com:

* combos;
* defesa;
* dodge;
* substituição;
* grabs;
* especiais;
* transformações;
* assistências;
* equipes.

### JOGAR DIFERENTES MODOS

```text
BATALHA
TREINO
CPU × CPU
TORNEIO
TORRE
LAN / ONLINE
```

### DISPUTAR TORNEIOS

Permitir:

**1–8 jogadores → local/online → equipes → chave → confrontos → final → campeão.**

### SUBIR A TORRE

Permitir:

**andar → batalha → vitória → subir → batalha mais difícil → chefe → topo.**

### JOGAR NO IDIOMA PREFERIDO

Permitir seleção entre os principais idiomas:

**Português BR, Português PT, Inglês, Espanhol, Alemão, Francês, Italiano, Russo, Chinês, Japonês, Coreano, Turco, Polonês e futuras expansões.**

### TER PERSONAGENS ÚNICOS

Cada personagem deve possuir:

* personalidade;
* diálogos;
* introduções;
* frases de vitória;
* habilidades próprias;
* efeitos próprios;
* animações;
* transformações;
* IA coerente;
* identidade visual.

### REGRA PRINCIPAL DO PROJETO

> **O jogo deve ficar bom antes de ficar enorme.**

E, principalmente:

> **Nenhum buff, nerf ou valor de balanceamento deste TODO deve ser considerado definitivo antes da bateria de testes. Os dados de telemetria, partidas CPU × CPU e testes manuais devem determinar o balanceamento final.**
