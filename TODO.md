# TODO — ARENA PARANORMAL

**Versão de referência atual:** v3.49.0 (revisado em 2026-10-27: Celestine e a Máscara do Desespero — Celestine (Portadores / Ordo Calamitas) e a forma Celestine, a Magistrada, a Magistrada canônica (Reescrever a Realidade), a Seita das Máscaras refeita, equipes duplas e as cores das Relíquias)
**Documento:** TODO principal
**Histórico de desenvolvimento:** Changelog Admin + Changelog Cliente

---


# PRÓXIMA GRANDE ATUALIZAÇÃO — LUTA + MODO PvE (planejamento de 2026-10-18)

**Estado em 2026-10-27 (v3.49.0):**
- [~] 2.2 Modelos antigos: Xande e Aguiar (v3.33.0), Fantasma, Kemi e Gal Sal + as lâminas Ereškigal (v3.34.0), Kaiser
  (v3.38.0), Balu e Lírio (v3.40.0), Arthur e Joui (v3.41.0), Arnaldo, Anfitrião, Veríssimo, Kian e O Diabo (2026-10-26)
  refeitos pelas artes oficiais; faltam os outros antigos
  (ver *MODELOS — PRÓXIMOS PASSOS*).
- [x] Feedback de Kian e Joui (25/10/2026): auditoria, Rejeitar Névoa pelo cânone, transformações com kit próprio
  (Realizador da Calamidade, Shi no Kage), ultimates diferentes no Joui, Tomado pelo Ódio, Portal das Sombras — v3.42.0;
  animações próprias, cena da Escrita, Leonora e raios de Energia — v3.43.0 (ver *ANDAMENTO DO FEEDBACK*).
- [x] 2.3 Especiais em equipe: Barra de Equipe, Especial simplificado, Transformação em equipe (F1/F2/F3) e os especiais
  com ligação na lore — Mascarados, Joui + Kaiser + Arthur, Cristopher + Kaiser (F4, ver *EQUIPE*). Novas ligações
  ficam "a confirmar" pelo dono.
- [x] 2.1 Animações de movimentação: 1ª parte na v3.37.0 (corrida, caminhada, pulo, queda, dash, esquiva, reação e 18
  posturas paradas próprias); 2ª parte (2026-10-26): pacote gratuito importado e redirecionado — corrida, caminhada e
  queda (ver *REAJUSTE DAS ANIMAÇÕES*).
- [~] **MELHORIA GERAL DE TODAS AS ANIMAÇÕES** — 1ª leva na v3.47.0 (`anim/strikePolish.js`): os 15 golpes genéricos
  (jab, direto, ganchos, gancho de baixo, soco pesado, os chutes, joelhada, soco de um braço, cortes de faca) ganharam
  antecipação, passagem (overshoot) e peso na volta, com o acerto no mesmo instante de antes. Depois (pedido de
  2026-10-27): os socos do DALMO com o mesmo impacto dos do Kian — `impactFx: 'shock'` (anel de ar, onda que distorce,
  poeira e tranco na câmera, sem o sigilo paranormal), escala de impacto e pausa no impacto maiores; anel 2,3 / onda 1,8
  (finalizador 3,4 + eco 4,4 / 2,6) — ele é pesado, golpes lentos e de impacto. O COLOSSO (a forma mais forte) fica acima:
  a onda da Pressão Atmosférica com anel 3,0 / onda 2,4 e, no finalizador, anel 4,4 + dois ecos (5,6 e 6,8), onda 3,4 e o
  anel de choque no chão (sem duplicar com o 'shock'). Próximas levas: combos e
  finalizadores próprios, esquivas, habilidades. Pedido original (2026-10-26): Todas as animações de movimento, ataques básicos,
  combos, finalizadores, esquivas e habilidades de todos os personagens precisam ser melhoradas e retrabalhadas. Buscar
  referências da internet (jogos de luta consagrados como Naruto Storm, Guilty Gear, Tekken, além de coreografias de artes
  marciais e animes de ação) para trazer muito mais impacto, fluidez, peso e naturalidade (ver *2.1*).
- [x] 2.4 Câmera de cutscenes (2026-10-26): sem cortes bruscos e sem a câmera entrar no cenário — ver *2.4*.
- [~] 2.5 Auditoria de fidelidade ao cânone de todos os personagens (Capítulo Complementar v3.44.0/v3.45.0): **Raziel
  CONCLUÍDO (RZ-01 a RZ-09, 2026-10-26)** — Turno Extra, Sede Incontrolável, Banquete Bestial próprio, Vulto Retalhador
  no lugar do projétil, Maldição revista, crosta visível, kit próprio da forma (Língua, Predador), Afinidade com Sangue e
  validação. **Arthur (§3.1) auditado na v3.46.0.** Falta a revisão dos outros personagens do elenco (§3.2 a §3.30).
- [x] **FEITO (v3.45.0/v3.46.0) — CENÁRIO NOVO + EQUIPE VAMPIROS.** Um cenário novo — pode ser o **interior da
  Igreja dos Vampiros de Hexatombe** (a Igreja de Sangue, ep. 9) — que entra junto com um **personagem novo de uma
  equipe nova, os VAMPIROS: Raziel**. Antes de começar: levantar o Raziel e a igreja na wiki/HQ (`lore/`, arte
  oficial), o kit pelo cânone (o braço do Raziel já aparece na lore do Cristino, ep. 9), o modelo no Blender (sculpt_lib),
  o cenário no Blender (kits CC0 + peças próprias) e a nova origem/equipe "Vampiros" na seleção, nas ligações de equipe
  e na CPU.
  **O CENÁRIO (notas do dono):** buscar as referências visuais em CENAS DOS EPISÓDIOS de Hexatombe; é só o INTERIOR (mais
  fácil). Igreja GÓTICA; a PORTA trancada; o ambiente cheio da NÉVOA DA MEMBRANA; iluminada pela LUA VERMELHA DE SANGUE
  (entrando pelos vitrais/janelas). São só pontos de partida — confirmar e completar ao pesquisar.
  - [x] **CENÁRIO "Igreja Antiga"** (2026-10-26, `tools/blender/arena_igreja.py` → `public/arenas/igreja.glb`, id `igreja`, na
        seleção de cenários). Referências: o modelo 3D da igreja usado no próprio RPG (wiki "Igreja Antiga": interior, vista
        de cima, Dama da Culpa, área dos anzóis), a cinemática da Ceia dos Vampiros e QUADROS DO EPISÓDIO (Hexatombe ep. 9
        "Banho de Sangue", YouTube p5alZam12ss: 4h55 a entrada com os pilares entalhados, 5h05 o altar com o retábulo
        dourado e o trono, 5h20 a nave vista de cima, 6h10 a luta com as arandelas e os balcões, 6h50 a rosácea com o símbolo).
        Feito à mão: a nave com os pilares e os arcos, as galerias com os balcões, as janelas ogivais com os vitrais
        vermelhos, as nervuras de madeira do teto, a mesa do banquete (toalha manchada, candelabros, taças, cadeiras de
        encosto pontiagudo), o altar (retábulo dourado com o trono, o Serafim Vermelho decapitado, a Dama da Culpa com o
        leque de espinhos e a pedra vermelha, o SÍMBOLO DE SANGUE aceso no lugar da cruz — wiki "Sangue"), a porta TRANCADA com correntes e cadeado, a rosácea
        com o símbolo de sangue, os anzóis com correntes, bancos quebrados e entulho. A névoa da membrana (vermelho-escura, mais densa no
        altar e na porta) e a luz da lua de sangue ficam na config. Testado no jogo.
  - [x] **RAZIEL** (2026-10-26, kit aprovado pelo dono) — jogável, equipe nova **Vampiros** (cor vermelho-sangue, na
        seleção depois dos Transtornados e no título). Modelo `tools/blender/char_raziel.py` → `public/models/raziel.glb`
        (técnica atual, revisado no Blender e no jogo): o casacão até o chão com a gola alta vermelha por dentro, as
        dragonas com franjas, o jabô e a pedra vermelha, as correntes e os laços, a cabeça descarnada sem olhos com o
        estigma aceso e os dentes, garras e pés descalços; a TRANSFORMAÇÃO "O Verdadeiro Raziel" é o mesmo .glb trocando as
        peças (prop_up some; prop_true mostra a ferida com as costelas, os braços rasgados até o osso e a língua).
        Kit: Garras (físico), Vulto Retalhador (□; era o Rasgo de Sangue, trocado no RZ-04), Bote Retalhador (heavyBlow com `grazeOnDodge`: quem esquiva toma
        metade), Mordida (`vampireBite`: segura, morde duas vezes e cura), Endurecer Sangue (crosta de sangue, menos dano),
        Maldição Sanguínea (`bloodCurse`: ABALADO), Turno Extra (ataca mais rápido), especial Banquete de Sangue (as
        mordidas curam: `h.drain` no cinematicCombo); na forma: Devorar, Frenesi e o Banquete Bestial. Agarrão próprio
        (garras + mordida), falas de introdução (cenas do cânone com Cristino, Juan, Jae, Labirinto e Dalmo) e de vitória
        contra os 28. Testado: cada golpe, o raspão na esquiva, a transformação e 4 partidas CPU × CPU sem erro.
        Na forma verdadeira, BARRA DE VIDA PRÓPRIA (`hpBar: { style: 'vampire' }`, `.hb-vampire` em styles.css): sangue
        escuro coagulado com veias pulsando e GOTAS escorrendo pela barra. Na seleção fica logo depois do Cristino.
        Revisão da v3.45.0 (outra IA): o commit deixou DOIS `hideRangedProps` no Fighter — o segundo apagava a trava da
        maça do Machado Demônio (Balu); juntados num só, que usa o `activeRanged` e mantém o `propLock`.
        Kian: o cabelo voltou a ser CURTO e rente (não é black power).
        Proposta original (para referência): líder dos Vampiros, Sangue, Combatente (trilha Monstruoso), 1,90 m, rápido "como um vulto".
        Visual (arte de Hexatombe): a cabeça careca descarnada sem olhos nem nariz, a boca de fera com os dentes amarelos e
        o estigma da Coroa de Espinhos cortado na testa; o casacão preto/vermelho até o chão de ombros altos com a gola alta
        e rígida, o forro vermelho, os laços dourados e correntes no peito, o lenço com a pedra vermelha; garras longas;
        descalço com unhas pontudas; tudo manchado de sangue.
        Kit: físico de GARRAS e MORDIDA (a mordida suga vida); ENDURECER SANGUE (resistência a todo dano por alguns
        segundos, a crosta de sangue por cima da roupa); BOTE RETALHADOR (o bote enorme; quem esquiva toma metade);
        MALDIÇÃO SANGUÍNEA (apodrece o sangue do alvo: ABALADO, dano e defesa menores); TURNO EXTRA (passiva: às vezes um
        golpe a mais / ação extra); especial "BANQUETE DE SANGUE" (agarra, morde e bebe, curando — "Eu espero que vocês
        aproveitem esse banquete"); TRANSFORMAÇÃO "O VERDADEIRO RAZIEL" (rasga a parte de cima das roupas: o corpo
        descarnado com as costelas à mostra e os braços rasgados até o osso, a língua comprida; descontrolado, mais rápido
        e forte, SEDE INCONTROLÁVEL: devora quem está morrendo e se cura).
        Equipe nova "Vampiros" (Alvira, Velisar, Zéfero, Sabara quando entrarem).
- [ ] 3–14 Modo PvE, que vai se chamar **Outro Lado** (dungeons, Espreitador como chefe, progressão, salvamento,
  cooperativo): não iniciado; já anunciado como "em desenvolvimento, sem data" na página Sobre. Na v3.47.0 entrou só a
  opção OUTRO LADO no menu principal (selo EM BREVE e aviso ao escolher), como pedido.
- [x] **Menu principal em seções** (v3.47.0): LUTAR / PRATICAR / JOGO, Outro Lado com EM BREVE, descrição em cartão ao
  lado (telas grandes), opções de JOGO menores, lista que rola em telas baixas.
- [x] **Limite de combo e balanceamento** (v3.47.0): `COMBAT.comboBreak` (3 s ou 12 acertos → ESCAPOU DO COMBO, 0,5 s
  invulnerável; especial e agarrão não são cortados); a CPU usa a Substituição num combo longo mesmo com 1 carga. Raziel:
  roubo de vida 8% → 5% (forma 20% → 14%), Bote Retalhador 92 → 84 — de 9 em 10 vitórias para 6 em 10; hitstun máximo
  de ~7 s para ~3,5 s na maioria das lutas.
- [x] **Torneio** (v3.47.0): montagem com o visual novo (cantos cortados, faixa de cor por tipo de vaga, número da vaga,
  regras num painel só) e a regra **LUTAS DA CPU**: SORTEIO (como antes, só o resultado), RODAR (a luta de verdade
  acelerada atrás do painel "lutando…" com a vida dos dois; mostra só quem venceu) ou ASSISTIR (a luta inteira na tela).
  Corrigido: nas regras ◀ ▶ mudavam o valor e não dava para chegar às outras regras pelo controle (agora ◀ ▶ escolhem e
  A/× muda o valor). A chave ganhou o fundo roxo do menu.
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

ANDAMENTO DO FEEDBACK (2026-10-26 — auditoria completa em `docs/AUDITORIA-KIAN-JOUI.md`)
- [x] Etapa 1 — auditoria do código e do cânone (wiki: Kian, Rituais, Joui Jouki, A Magistrada), com fatos do código,
      fatos canônicos e propostas separados.
- [x] Rejeitar Névoa pelo cânone ("todos os rituais no raio demoram muito mais para serem conjurados"): área de 6 s
      onde todo ritual do adversário vira CONJURAÇÃO CONTÍNUA (0,7 s parado, um golpe interrompe) e sai 25% mais fraco;
      vale contra todo o elenco; a névoa da Kaiser some na hora (interação preservada). Testado contra Arthur e Kaiser.
- [x] Kian transformado com KIT PRÓPRIO, não só números — **Realizador da Calamidade** (nome canônico; antes "Kian de
      Calamidade"): Teletransporte com DOIS SALTOS seguidos; Levitação: SUSPENDER (ergue e arremessa o adversário);
      Lâmina do Medo que deixa MORRENDO (sangra e não regenera); Rejeitar Névoa que DESFAZ os rituais ativos do
      adversário; Toque da Morte que SUGA A SANIDADE; Impacto Sigilar com 3 marcas da Escrita. Testado no jogo.
- [x] Joui transformado = **Shi no Kage**, a fase final contra o Kian (decisão de fase explícita): sem a máscara (perde os
      poderes dela), a Shi no Kage preta de sigilos dourados (prop novo) e a bainha da Relíquia de Energia (prop novo);
      esgrima de Conhecimento, Corte de Conhecimento, Saque da Relíquia, **DECEPAR** (como o do Cristino: sangra, ferida
      aberta; decapita na vida baixa), Mateo que FECHA AS FERIDAS, Olhar do Desespero que deixa ESMORECIDO, Pavor
      Anormal riscado DEBAIXO do alvo, Técnica Secreta (Desarmar) passiva. Testado no jogo.
- [x] Ultimate do Joui diferente nas duas versões: o mascarado tem a **Execução das Sombras** (golpe pelas costas saindo da
      sombra; "Shi no Kage" é o nome da katana); a forma tem a **Shi no Kage** — saca a Relíquia de Energia na mão
      esquerda e luta com as duas lâminas: sigilo de Conhecimento no alvo, cortes previstos, o Decepar que ajoelha e
      sangra e o X dourado e roxo (~250 contra ~180 da versão normal, medido no jogo).
- [x] Voltar à forma normal no fim do round sem estados presos (máscara, katana, Relíquia, habilidades) — testado.
- [x] Joui mascarado: **Tomado pelo Ódio** (R2 + ×) — ativa os poderes da máscara como os outros Mascarados, sem a
      cena de pôr a máscara: postura de saque, aura vermelha, 6 s com +20% de dano, mais velocidade e cortes que fazem
      sangrar de leve (pedido de 2026-10-26). Testado: 88 → 109 na mesma sequência, o alvo sangra, some em 6 s.
- [x] A forma Shi no Kage acima do Joui mascarado mesmo com o Tomado pelo Ódio ativo (pedido: "o normal não ficou mais forte
      que a transformada?" — ficava): cortes da Shi no Kage +20%, a sequência na mesma ordem da normal, velocidade 9,3 /
      1,28. Medido no jogo, sequência inteira: Balu 144 normal · 180 com o Tomado pelo Ódio · 182 forma; Kian 159 · 197 · 203. O
      Decepar (o golpe que arranca) já era só da forma.
- [x] A cura que envelhece (Cicatrização do Guizo e do Xande, Paradiso do Dante) NÃO deixa mais o cabelo branco — para
      TODOS os personagens (pedido de 2026-10-26): o `agingHeal` é só a cura; a função `ageHair` saiu.
- [x] HABILIDADES.md regerado (`npm run moves`); `npm run check`, `npm test` (43) e `npm run build` passando.
- [x] EFEITO DE ENERGIA no impacto (pedido de 2026-10-26: "energia deveria ter raios e eletricidade em volta"): todo
      golpe de Energia — rituais e especiais de quem é de Energia, tiros com elemento Energia (o Rebirth do Arthur, as Balas
      Amaldiçoadas da Kaiser...) e a arma amaldiçoada de Energia — solta raios em zigue-zague em volta do corpo de quem
      apanha (na cor do golpe e em branco), faíscas, um clarão e o estalo (`damage.js energyHitFx`).
- [x] ANIMAÇÕES NOVAS (`src/anim/powerClips.js`, 2026-10-26): `relic_draw` (o Joui agacha com as duas mãos nos dois
      cabos), `iai_double` (o X final das duas lâminas até o zanshin), `shadow_plunge` (crava a katana na sombra — Portal
      das Sombras), `levitate_raise` (o Kian ergue a palma — Suspender) e `fear_pierce` (a lâmina junto do ouvido e a
      estocada que perfura); e o efeito da MELODIA da Lâmina do Medo de Calamidade (anéis de som saindo da mão). Testado no
      jogo: cada habilidade usa o clipe novo, sem erro.
- [x] A ESCRITA TOMA O CORPO na Transformação "Realizador da Calamidade": pose nova `script_surge` (braços abrindo, a
      cabeça para trás), os sigilos dourados sobem das mãos pelos braços até o peito e o rosto, e o corpo acende cada vez
      mais até o clarão (a barba cresce e as faixas aparecem como antes). Testado: a forma entra e o brilho apaga no fim.
- [x] Joui mascarado: **Portal das Sombras** (cânone de Calamidade: "um portal pelas sombras; um objeto, como sua katana,
      seria transportado para sua mão") no lugar do Corte das Sombras (que era proposta): crava a katana na sombra e ela
      sobe de um portal debaixo do adversário, cortando e lançando; volta para a mão. Testado: acerta parado, erra quem sai.
- [x] Suspender com visual próprio do Kian: os sigilos de Conhecimento sobem do chão e giram em volta do alvo suspenso
      (antes era o feixe de luz do Estrangeiro); o texto é "SUSPENSO".
- [~] Trocar as PROPOSTAS restantes por feitos canônicos onde houver: no Kian, a luta contra a Magistrada ("derrota a
      Magistrada facilmente"); no Joui da Shi no Kage, o Corte de Conhecimento e o Saque da Relíquia continuam proposta
      (a Relíquia na bainha é canônica, o golpe não).
- [x] CPU com o kit novo (2026-10-26): 12 partidas CPU × CPU (difícil) — Kian e Joui, normais e transformados, contra
      Kaiser, Arthur e Balu: nenhum erro, nenhum estado preso; a CPU usa Suspender, Rejeitar Névoa, Saque da Relíquia,
      Decepar e Tomado pelo Ódio. (O especial Shi no Kage dura ~5,4 s e sempre termina.)

### 2.1. Novas animações de movimentação e melhoria geral de todas as animações

Adicionar e aprimorar animações de movimentação para deixar os personagens mais naturais e responsivos durante as batalhas.

As animações deverão respeitar o estilo de luta de cada personagem e ser compatíveis com os sistemas atuais de movimentação, ataques, esquivas e habilidades.

- [ ] **Melhoria geral de todas as animações do jogo (pedido de 2026-10-26):** todas as animações de movimento (corrida, caminhada, esquivas, dash, pulo, transições), ataques normais, sequências de combo, finalizadores e habilidades precisam ser aprimoradas para maior fluidez, impacto e naturalidade.
- [ ] **Pesquisa e uso de referências visuais da internet:** buscar referências de alta qualidade em jogos de luta consagrados (Naruto Storm, Guilty Gear, Tekken, Street Fighter), coreografias de artes marciais reais e cenas de ação em animes para guiar o timing, arcos de movimento (anticipation, follow-through, peso e inércia).
- [ ] **Polimento individual por estilo de combate:** garantir que cada combatente tenha animações fiéis ao seu estilo e personalidade narrativa (ex.: agilidade e esgrima de Joui, brutalidade pesada de Balu e Aguiar, técnica militar de Kaiser e Veríssimo, loucura caótica de Xande e Anfitrião, elegância sobrenatural de Kian).

### 2.2. Atualização dos modelos antigos

Revisar os modelos 3D dos personagens antigos, identificando problemas visuais, diferenças de qualidade e oportunidades de melhoria.

As alterações deverão preservar a identidade visual dos personagens e a compatibilidade com suas animações, habilidades e sistemas de combate.

### 2.3. Melhoria dos especiais em equipe

Aprimorar os ataques especiais realizados em conjunto, dando mais destaque às animações, à participação dos personagens envolvidos, aos efeitos visuais e à sensação de impacto.

As melhorias deverão considerar a sincronização entre os personagens, a câmera e o momento em que o dano é aplicado.

### 2.4. Melhorias na câmera de cutscenes

Aprimorar os enquadramentos e movimentos da câmera durante as cenas especiais, ataques cinematográficos e transições.

A câmera deverá valorizar os personagens e as ações importantes sem perder o controle da posição dos jogadores nem causar cortes bruscos ou enquadramentos inadequados.

- [x] Feito em 2026-10-26 (`camera/CameraRig.js`, vale para os 46 usos de `playShots` em 24 especiais e na cutscene do
  agarrão): a cinemática ENTRA saindo de onde a câmera de luta estava (0,3 s); cada plano novo CHEGA num movimento
  curto a partir do anterior (0,16 s; um plano pode pedir o corte seco com `cut: true` ou outro tempo com `blend`); se o
  personagem do plano teleporta/atravessa, a câmera corre até ele (máx. 30 m/s) em vez de pular; no FIM volta à luta
  da mesma posição e altura, com o olhar deslizando até os lutadores (antes pulava ~2 m); os planos não entram mais
  dentro de casas/muralhas (o recuo contra os blocos sólidos agora vale na cinemática); plano com conta inválida não
  leva a câmera para NaN. Medido quadro a quadro nos especiais dos 28 personagens: o maior salto caiu de 5,2 m para
  ~1 m (só as transições rápidas), sem erro.

### 2.5. Capítulo Complementar — Auditoria de Fidelidade ao Cânone de Todos os Personagens (v3.44.0 / v3.45.0)

**Data de elaboração:** 26/10/2026  
**Escopo:** complemento à vistoria de personagens da v3.44.0/v3.45.0. Não substitui o TODO existente, não invalida tarefas marcadas como concluídas e não autoriza rebalanceamento geral.  
**Prioridade imediata:** Raziel e sua forma **O Verdadeiro Raziel**; depois, revisão sistemática dos demais personagens do elenco.

#### Objetivo
Revisar os personagens comparando três fontes que devem ficar separadas no relatório:
1. **Implementação real:** o que os arquivos do jogo executam de fato.
2. **Cânone narrativo:** o que aparece nos episódios oficiais, artes e materiais oficiais.
3. **Cânone mecânico:** regras de *Ordem Paranormal RPG*, incluindo *Sobrevivendo ao Horror*, quando aplicáveis.

A wiki comunitária é um índice e uma ferramenta para localizar fatos e cenas, não a autoridade final. Quando houver divergência, dar prioridade ao material oficial e aos episódios; anotar a divergência em vez de inventar uma conciliação. Não copiar literalmente as regras de mesa se elas não funcionarem em um jogo de luta: registrar a regra original e explicar a adaptação de gameplay.

#### 1. Processo obrigatório para cada personagem
Antes de propor alterações:
- [ ] Conferir o código atual e listar todos os kits: base, forma(s), passivas, especial, agarrão, armas, assistências, efeitos de status e interações de equipe.
- [ ] Confirmar em quais arquivos estão definidos os golpes, animações, hitboxes, dano, cooldown, custo de energia, VFX, IA/CPU, HUD e transformações.
- [ ] Consultar a página da wiki do personagem, as páginas das habilidades/elementos/trilhas relacionadas e as referências indicadas nelas.
- [ ] Verificar as cenas relevantes nos episódios oficiais. Registrar episódio, cena e timestamp quando possível; não inventar timestamp se não foi conferido.
- [ ] Para poderes que vêm do RPG, consultar a descrição mecânica no livro/suplemento. Se o texto integral não estiver disponível legalmente, não reconstruir regras detalhadas de memória: usar a descrição pública e marcar a incerteza.
- [ ] Criar uma tabela: **habilidade atual → comportamento real no código → referência canônica → divergência → proposta → impacto técnico → teste de aceite**.
- [ ] Marcar cada conclusão como uma destas categorias:
  - **CONFIRMADO:** aparece em fonte oficial ou descrição mecânica identificável.
  - **ADAPTAÇÃO:** efeito criado para traduzir a habilidade para combate em tempo real.
  - **PROPOSTA NÃO CANÔNICA:** ideia nova de gameplay; nunca a descrever como poder oficial.
  - **INCERTO:** a fonte consultada não permite confirmar.
- [ ] Só depois da auditoria, propor mudanças. Não remover habilidade existente sem explicar o que entra no lugar.
- [ ] Depois de qualquer implementação, atualizar este TODO, `CHANGELOG-ADMIN.md`, `HABILIDADES.md` e os documentos de versão pertinentes; executar `npm run check`, `npm test` e `npm run build`, e realizar testes visuais.

---

#### 2. Raziel — Conclusão da pesquisa de cânone e plano de melhoria

##### 2.1 Referências para consulta
- **Episódios oficiais de Hexatombe:**
  - Episódio 7 — "Consequências": https://www.youtube.com/watch?v=K_c2VdmPuLg
  - Episódio 8 — "Culpa": https://www.youtube.com/watch?v=-7prXUHT8OM
  - Episódio 9 — "Banho de Sangue": https://www.youtube.com/watch?v=p5alZam12ss
- **Páginas de referência comunitária:**
  - Raziel: https://ordemparanormal.fandom.com/wiki/Raziel
  - Vampiros: https://ordemparanormal.fandom.com/wiki/Vampiros
  - Monstruosos: https://ordemparanormal.fandom.com/wiki/Monstruosos
  - *Sobrevivendo ao Horror*: https://ordemparanormal.fandom.com/wiki/Ordem_Paranormal_RPG%3A_Sobrevivendo_ao_Horror

A página de Raziel aponta o episódio 7 como sua aparição completa, o episódio 8 como parte de sua história e o episódio 9 como o confronto final. O episódio 9 é a principal referência visual/comportamental para a forma verdadeira. A wiki cita por volta de **5h12m15s** para a fala do banquete no episódio 9. O TODO da v3.44.0 também aponta cenas da igreja por volta de 4h55, 5h05, 5h20, 6h10 e 6h50 para a construção da arena.

##### 2.2 Identidade canônica que o jogo deve preservar
Raziel é descrito como **Combatente da trilha Monstruoso, afinidade com Sangue**, líder dos Vampiros. Ele alterna duas faces que não devem ser tratadas como simples troca de roupa:
- **Forma base — predador aristocrático:** postura controlada, fala educada e teatral, inteligência tática e violência súbita. Rápido e fisicamente dominante sem agir como um bruto desorientado o tempo todo.
- **O Verdadeiro Raziel — bestialidade exposta:** depois de sofrer ferimentos graves, rasga as vestes e passa a agir com muito mais agressividade, gritos e perda de controle. Ataca alvos ao alcance, devora vítimas vulneráveis e fica mais brutal. Ainda conserva reações emocionais e algum direcionamento: não deve virar uma IA aleatória que só corre sem conseguir lutar.

A forma base é a tradução de sua ficha mais ritualística/elegante; a forma verdadeira deve se concentrar em ataques diretos, pressão, mordida, resistência e devoração. Não tratar a forma verdadeira apenas como a mesma lista de golpes com multiplicadores maiores.

##### 2.3 Evidências narrativas e consequências para o kit
| Evidência em Hexatombe / material de referência | Tradução recomendada para o jogo | Limite da interpretação |
|---|---|---|
| Raziel é líder dos Vampiros e consegue derrubar Harpia com um golpe. | Golpes físicos pesados e reação de impacto convincente; força como identidade do personagem. | Não significa que todo golpe deva causar dano extremo ou quebrar qualquer defesa. |
| Ele entra no incêndio do circo e continua avançando, mas a narrativa indica que ainda sente o dano. | Pode ter postura destemida e avançar sob pressão; usar resistência geral de Endurecer Sangue quando ativado. | **Não conceder imunidade a fogo** com base nessa cena. Ele sente o dano. |
| Avança sobre Henri em velocidade descrita como um vulto; agarra-o e morde-o duas vezes. | A Mordida deve ter aproximação curta/rápida, agarrão claro, duas mordidas e cura. | Evitar teleporte literal se a referência só sustenta velocidade extrema. |
| Uma facada de Henri parece não detê-lo; Raziel usa Endurecer Sangue. | Endurecer Sangue é a ferramenta defensiva principal: resistência temporária, crosta visual de sangue e reação de impacto reduzida. | Resistência não deve ser invulnerabilidade; permitir contrajogo, fim de duração e interrupções coerentes. |
| Maldição Sanguínea apodrece o sangue do alvo e o deixa Abalado, com penalidade de −1 dado para testes durante a cena; pode ser resistida. | Manter o ritual como debuff relevante, com duração/recarga legíveis e possibilidade de resistência ou redução por defesa. | Como o jogo não usa testes por dados, mapear explicitamente −1 dado para um efeito de gameplay; não afirmar que o debuff atual equivale perfeitamente à regra. |
| Bote Retalhador causa dano enorme; se o alvo esquiva, ainda recebe metade, até 105 na descrição da wiki. | Preservar a regra especial de raspão em esquiva, restrita ao alcance e arco do bote. Dar telegraph suficiente para que o golpe seja forte, mas legível. | O valor 105 é uma referência de ficha, não obrigação de copiar literalmente para o balanceamento do jogo. |
| Turno Extra permite realizar duas ações/turnos por rodada na descrição mecânica. | Traduzir a economia de ações para um jogo em tempo real: janela limitada para golpe/ação adicional após acerto, ou cancelamento especial de recuperação. | `attackSpeed: 1.12` sozinho **não** implementa uma ação extra. Não criar ataques extras infinitos nem retirar todo o contrajogo. |
| No estado bestial, quando vê um corpo morrendo próximo, Raziel não consegue se controlar e o devora. | Sede Incontrolável deve ser contextual e característica da forma verdadeira: identificar alvo vulnerável próximo, entrar numa animação de devoração, causar dano/consumir uma oportunidade e recuperar vida. | Não aplicar a corpos já em KO se a lógica de combate não suporta interação pós-KO; a ação deve acontecer antes do encerramento definitivo e não prolongar artificialmente o round. |
| Na luta da igreja, após sofrer dano grave e um tiro na cabeça, ele rasga as roupas e revela a forma verdadeira; devora Cindy e Maria quando estão morrendo. | A transformação deve ter apresentação própria e mudar o comportamento. Pode ser ativada pelo jogador; se houver gatilho automático por vida, ele precisa ser opcional/consistente com as regras de transformação do jogo. Sede Incontrolável deve priorizar alvos vulneráveis. | Não exigir a reprodução literal do evento da cena em toda partida. A forma é uma tradução jogável, não uma cutscene obrigatória. |
| Cristino arranca um braço de Raziel e ele continua tentando atacar Remi antes de Juan finalizá-lo. | A forma verdadeira pode continuar ofensiva mesmo sob pressão e demonstrar ferimentos sem perder a capacidade de lutar. | Desmembramento permanente não é necessário em partidas normais; pode ficar restrito à cinemática/efeito especial. |
| Raziel devora vítimas e, ao final, Juan o mata e devora sua cabeça. | Especial de banquete deve comunicar agarrão, mordida e recuperação de vida. Uma interação especial com Juan pode ser considerada, mas apenas como conteúdo opcional e aprovado pelo dono. | Não dar imortalidade, ressurreição ou devoração universal ao Raziel com base no fato de ser vampiro. |

##### 2.4 Auditoria do código atual e tarefas propostas para Raziel
O código atual já contém `src/characters/raziel.js`, `src/characters/forms/raziel_verdadeiro.js`, `src/combat/razielAbilities.js` e clipes próprios em `src/anim/razielClips.js`. Não recomeçar o personagem do zero.

- [x] **RZ-01 — Turno Extra** (2026-10-26): passiva `extraTurn` — o FINALIZADOR do combo que acerta abre 2 s em que a
  próxima habilidade é a "ação extra" (não entra em recarga; gasta a janela); recarga interna de 10 s, zera no round;
  vale também na forma verdadeira. Testado: a Mordida dentro da janela sai sem recarga; CPU × CPU sem erro.
  Pedido original: Rever a implementação atual (a passiva está representada apenas por `attackSpeed: 1.12`). Escolher e documentar uma adaptação real de ação extra para combate em tempo real (ex.: janela limitada para golpe/ação adicional após acerto com cooldown interno). Limitar a uma oportunidade por janela/cooldown para não encadear infinitos. Testar jogador, CPU, bloqueio, esquiva, combo, interrupção e fim de round.
- [x] **RZ-02 — Sede Incontrolável** (2026-10-26): no DEVORAR da forma verdadeira (`thirst` em `vampireBite`), contra
  alvo abaixo de 30% da vida: aviso "SEDE INCONTROLÁVEL" (anel e sangue, batida de coração), o bote vai 1,6 m mais
  longe, morde 1,4× e bebe 100%; a CPU prioriza o Devorar nessa hora só com o alvo no alcance do bote. Testado: de 3,2 m
  pegou, 90 de dano, bebeu tudo. Pedido original: Implementar a condição de alvo vulnerável/morrendo próximo apenas na forma verdadeira. Adicionar indicação visual/sonora breve e uma ação de devoração legível. Definir raio, limiar de vida/estado, duração, cura e recarga com base no balanceamento existente. Fazer a CPU usar a mecânica com prioridade contextual sem ficar presa tentando devorar um alvo fora de alcance. Testar KO, interrupção, alvo protegido, multiplayer e encerramento da luta.
- [x] **RZ-03 — Banquete Bestial próprio** (2026-10-26): roteiro novo no `cinematicCombo` — ruge e explode em sangue
  (`db_powerup` + `bloodBurst`), investida mais rápida (30 m/s), câmera das garras (`shots: 'claw'`), frenesi de 4 garras
  (sangramento), o DEVORAR no centro (duas mordidas longas com o alvo de joelhos, `drain: 1` e a opção nova `gore`:
  sangue jorrando do pescoço e tremor) e o rasgo final que joga no chão (`endReaction.lowLaunch`). Dano fixo de 320
  (sem execução contextual). Testado: 242 de dano/74 de cura contra o Balu, KO no meio fecha a cena, interrupção por
  golpe libera os dois, cena de ~3,7 s. Pedido original: O especial da forma verdadeira não deve apenas herdar a sequência do especial base mudando cor e dano. Base: encenação de anfitrião/predador controlado, agarrão e mordidas com drenagem. Forma verdadeira: início explosivo, garras/rasgos, mordida/devorar como centro e finalização visual mais animalesca. Se não existir mecânica segura de execução contextual, aplicar dano fixo em cinemática brutal. Testar interrupção, invulnerabilidade, KO e duração da cutscene.
- [x] **RZ-04 — Rasgo de Sangue → VULTO RETALHADOR** (2026-10-26, opção B): no cânone o Raziel não atira; o □ virou a
  investida longa (`dashStrike`, 10 m a 34 m/s) que termina num X de garras com sangramento (opção `bleed` nova no
  `dashStrike`); `aiRange: 10` para a CPU usar de longe (opção nova lida pela CPU). Diferente do Frente + ○ (bote curto
  do combo). Testado: de 9 m acerta 28 + sangra, a 14 m erra sem dano, na defesa tira 7; CPU usa. Pedido original: O projétil em meia-lua é uma adaptação de gameplay, não uma habilidade canônica confirmada. Decidir explicitamente entre (A) mantê-lo como licença de gameplay, documentada como adaptação; ou (B) substituí-lo por uma investida rápida de garras (dash/bote frontal), que comunica melhor a velocidade de vulto e o combate direto do episódio. Preservar o botão e função de gameplay do golpe; testar alcance, bloqueio, esquiva e combos.
- [x] **RZ-05 — Maldição Sanguínea** (2026-10-26): −1 dado → bate 20% mais fraco; apanha 10% mais (era 12%); 6 s (era
  8 s: ficava 57% do tempo no ar, agora ~43%); renova sem acumular; quem defende resiste a metade; o alvo pinga sangue
  podre enquanto durar (some no fim e na troca de round, testado). Pedido original: Manter a penalidade de −1 dado como a referência do RPG e documentar a tradução para combate em tempo real. A implementação atual de dano inicial + `ABALADO` + redução de dano causado + aumento de dano recebido é uma adaptação; verificar se o efeito é compreensível e não excessivo. Rever duração, resistência, defesa, substituição de estado e encerramento de round.
- [x] **RZ-06 — Endurecer Sangue** (2026-10-26): a crosta (`buildBloodArmor`) sumia no casacão vermelho — opção nova
  `bright` (mais viva, molhada e pulsando; `brightBloodArmor: true` no Raziel), conferida no jogo. Testado: −40% de todo
  dano (116 → 70 físico; especial 56), 3 golpes sem recuar e o 4º faz recuar, o AGARRÃO ainda pega (não é imunidade), e
  ao fim dos 6 s a crosta, o buff e as armaduras saem. Pedido original: Confirmar visualmente a crosta de sangue sobre a roupa e a leitura clara de defesa temporária. Testar dano físico, paranormal, agarrões, especiais, interrupções e fim de duração. Não converter a resistência em imunidade a todos os efeitos.
- [x] **RZ-07 — Forma verdadeira com kit próprio** (2026-10-26): a fera não se protege — o Endurecer Sangue sai e entra
  a LÍNGUA (`tongueLash`: dispara até 6,5 m, enrola, puxa para as garras e atordoa; não defensável, a esquiva escapa;
  errar deixa exposto); □ VULTO BESTIAL (mais rápido, 36, sangra mais); passiva PREDADOR (+20% em atordoado, caído,
  tomando golpe ou < 30% da vida); somam-se Devorar com a Sede (RZ-02), o Frenesi e o Banquete Bestial (RZ-03).
  Testado: Língua pega (25 + sangra), atravessa a defesa (24), a esquiva escapa, de 9 m erra; Predador 90 → 108; no
  round seguinte volta ao Raziel normal com `prop_up`/`prop_true` trocados de volta; CPU usa a Língua. Pedido original: Preservar os golpes de base que ainda fazem sentido, mas dar função mecânica distinta à forma: pressão física, aproximação rápida, cura por mordida/devoração e punição de oponentes vulneráveis. Não depender apenas de aumento de atributos, sangramento e cor de VFX. Revisar se Endurecer Sangue precisa permanecer no kit transformado. Validar retorno à forma normal/round seguinte e troca das peças visuais `prop_up`/`prop_true`.
- [x] **RZ-08 — Afinidade com Sangue** (2026-10-26): registrado no código e no HABILIDADES — Combatente, trilha
  Monstruoso, afinidade com Sangue. A `elementalAffinity` ganhou `element` (só os rituais desse elemento ficam mais
  fortes) e `resist` (resiste a rituais desse elemento): Raziel +10% nos rituais de Sangue e −15% dos rituais de Sangue
  dos outros; a fraqueza a Morte já vem do ciclo. Penalidades de interpretação/progressão do Monstruoso não entram.
  Kaiser e Nubi seguem iguais. Testado: ritual de Sangue da Agatha 115 → 98; Kaiser 115 (igual). Pedido original: Registrar que Raziel é um Combatente Monstruoso com afinidade em Sangue. Não transformar Afinidade Elemental numa habilidade genérica sem função; usá-la para orientar a identidade de rituais e resistências. Não importar para o jogo todas as penalidades de interpretação e progressão do RPG sem decisão explícita.
- [x] **RZ-09 — Validação final** (2026-10-26): CPU × CPU (difícil, na Igreja) contra um de cada perfil, dos dois lados
  — rápido (Gal), tanque (Lírio), zoner (Arthur), agarrador (Dalmo), ritualista (Magistrada): 10 partidas até o fim, sem
  erro, sem NaN, sem cena travada (a maior: Banquete Bestial, 3,9 s), forma verdadeira entrando e saindo. Testes do jogador
  feitos com o testkit em cada item (RZ-01 a RZ-08); `tests/raziel.test.js` (5 testes) e o check cobrem o kit.
  **Para a fase de balanceamento (não mexido agora):** (1) o Raziel venceu 9 das 10; (2) combos longos de 5 a 7 s em
  hitstun contínuo (Gal e Magistrada no Raziel, Raziel na Magistrada) — não é estado travado (a vida cai a cada golpe),
  é o motor permitindo combos longos e a CPU sem usar a Substituição para sair. Pedido original: Testar base e forma verdadeira contra pelo menos um personagem de cada perfil (rápido, tanque, zoner, agarrador e ritualista). Testar CPU × CPU e jogador × CPU. Verificar hitboxes, câmera, animações, VFX, barra de vida, energia e cooldown. Verificar se o especial não trava o oponente após interrupção/KO. Atualizar documentações e testes.

---

#### 3. Auditoria de fidelidade — Elenco completo, personagem por personagem

Para cada personagem, produzir a análise `habilidade atual → código real → fonte/cena → divergência → proposta → teste`, com links e timestamps conferidos:

- [x] **3.1 Arthur Cervero — auditado (2026-10-26)** contra a wiki "Arthur Cervero" (seções Aparência, Rituais e
  Habilidades de Desconjuração e Calamidade):
  | Habilidade | Código | Fonte | Divergência | Feito |
  |---|---|---|---|---|
  | Um braço | `oneArm`, modelo sem o esquerdo (manga vazia) | braço ESQUERDO arrancado pelo Minerador (Santo Berço) | os cortes da Arma de Sangue não eram checados | check novo: os cortes também são de um braço |
  | Sniper | □ 110 + tiro carregado, Golpe de Sorte, Furtivo e Letal | Atirador de Elite (Calamidade), margem 16–20, d8 furtivo | — (rifle é o centro; chutes são o corpo a corpo de um braço) | — |
  | Rebirth | arma amaldiçoada, raios VERDES | Desconj.: Amaldiçoar Tecnologia (verde); Calam.: Amaldiçoar Arma com Energia (roxo) | verde por pedido do dono (HQ) | mantido, documentado |
  | Templo do Ódio | +35% físico, não defende | Calam.: +1 dado ataque/dano corpo a corpo, NÃO CONJURA RITUAIS, precisa atacar | faltava "não conjura rituais" | `noRituals`: Rebirth, Dystopia e Arma de Sangue bloqueados (tiro e chutes liberados); vale na assistência; CPU respeita |
  | Dystopia | paralisa à frente, custa vida | marca o alvo, arame no braço, sangue no Símbolo do peito, olhos vermelhos | — | — |
  | Olhos Sempre Abertos | +15% / −15%, aura de sangue | nome do jogo; cânone: Afinidade com Sangue (50%): vantagem nos rituais de Sangue e, em Calamidade, rituais de Sangue SEM INGREDIENTES | só multiplicadores | passiva `bloodAffinity`: Templo, Dystopia e Arma de Sangue não custam vida na forma; comentário corrigido (as mechas brancas são do Medo, não da afinidade) |
  Testado: o Templo bloqueia a Dystopia e libera Brecha e o tiro; na forma a Dystopia e a Arma custam 0 de vida (fora dela
  a Arma custa 40); CPU × CPU sem erro (a CPU às vezes enfileira um ritual logo antes do Templo pegar: só o aviso).
  Itens originais da auditoria:
  - Conferir se a animação corporal respeita a regra de um braço em todos os golpes, esquivas, vitória, especial e transformação.
  - Confirmar que o rifle é o centro do kit de longo alcance e que golpes corpo a corpo são opções de emergência.
  - Comparar Rebirth com a arma amaldiçoada e seus efeitos de Energia na fase correta; distinguir a versão de Desconjuração da de Calamidade.
  - Verificar se Templo do Ódio representa o ritual e não um buff sem custo/risco; definir como a fúria se traduz sem suicídio de IA.
  - A forma Olhos Sempre Abertos deve ter mudança visual e mecânica legível.
  - Testar mira, alcance, hitboxes do rifle, interrupção do especial, colisão com cenário e golpes de um braço.

- [ ] **3.2 Joui Jouki (`src/characters/joui.js`; forma `forms/joui_shinokage.js`):**
  - Conferir a fase exata de cada poder de sombra, máscara e katana.
  - A transformação Shi no Kage deve usar a katana da Magistrada apenas se a referência temporal e narrativa confirmar a associação desejada; não misturar o kit da máscara com a fase da nova katana.
  - Confirmar o efeito e o nome de cada ritual, especialmente Envelhecimento Localizado e Portal das Sombras.
  - Separar mobilidade de sombra, corte físico e controle por medo em funções diferentes.
  - Testar troca de forma, modelo/arma, cancelamento de teleporte, distância máxima, ataques aéreos e retorno de round.

- [ ] **3.3 Kaiser (`src/characters/kaiser.js`):**
  - Confirmar quais armas aparecem em cada fase e não alternar entre M4, Desert Eagle e karambit sem transição visual.
  - Separar disparo balístico, bala amaldiçoada e ritual de área. Cada um deve ter telegraph, alcance e resposta diferentes.
  - Verificar a fidelidade visual de Cinerária/névoa e Acácia, evitando que o efeito de Energia vire explosão roxa genérica.
  - Auditar a interação com Rejeitar Névoa do Kian: responder aos efeitos compatíveis sem anular todo o kit da Kaiser.
  - Testar munição, cadência, recarga/cooldown, bloqueio, projéteis simultâneos e câmera.

- [ ] **3.4 Dante (`src/characters/dante.js`; forma `forms/dante_aberto.js`):**
  - Conferir nome e efeito de cada ritual por fase; evitar que Decadenza, Paradiso e Rotura sejam confundidos como “lodo que causa dano”.
  - Diferenciar debuff/doença, controle de espaço, cura e especial temporal por animação, som e resposta do adversário.
  - Verificar se Invocação: A Marionete pertence à versão/fase correta e se sua execução representa a fonte.
  - A forma Olhos Abertos deve ter kit coerente com a mudança de fase, não só multiplicadores de dano.
  - Testar duração de efeitos, cura, hitboxes dos tentáculos e leitura visual em cenários escuros.

- [ ] **3.5 Erin Parker (`src/characters/erin.js`; forma `forms/erin_caos.js`):**
  - Conferir o efeito de cada granada e manter diferenças reais de área, tempo de detonação e contrajogo.
  - Distinguir Bênção Maldita (visão/previsão) da cura de Black Hole; não transformar ambos em projéteis de dano.
  - Verificar a forma Em Nome do Caos na cena de origem: mudança de postura, poder, visual e intenção.
  - Confirmar se o amuleto elétrico deve atuar como reação ao ser atingida.
  - Testar explosões perto de ambos os jogadores, autocolisão, bloqueio, esquiva e tempo de detonação.

- [ ] **3.6 Aghata (`src/characters/aghata.js`):**
  - Confirmar o que demonstra em cada campanha/fase e quais poderes pertencem à ficha de RPG.
  - Diferenciar leitura/análise de ritual, preparação de arma e dano direto.
  - Verificar se Passagem de Conhecimento muda uma condição do combate ou só causa dano; descrição, VFX e efeito devem coincidir.
  - Documentar qual habilidade se amplia na forma expandida.
  - Testar legibilidade de sigilos, custo de energia, interrupção e variedade de ataques.

- [ ] **3.7 Gal Sal (`src/characters/gal_sal.js`):**
  - Confirmar se cada habilidade está ligada ao personagem, à arma Ereškigal ou a um ritual.
  - Verificar a regra especial de “cura invertida”: quem recupera vida, quem perde energia e se o HUD corresponde ao código.
  - Distinguir puxão, captura, controle mental e teletransporte.
  - Confirmar a forma Realizador do Destino e comportamento próprio além de atributos.
  - Testar correntes em alvos no ar, bloqueio, esquiva, limites de distância e cancelamento de captura.

- [ ] **3.8 Nubi (`src/characters/nubi.js`):**
  - Conferir a cena da Mansão Leone e separar o ritual do Carniçal da Esfinge dos ataques comuns de lodo.
  - Verificar se Desvio Imperturbável comunica antecipação/percepção alterada, em vez de esquiva instantânea sem leitura.
  - Distinguir aprisionamento, drenagem, decadência e invocação em funções e animações.
  - Revisar a classificação elemental para não deduzir apenas pela cor do VFX.
  - Testar invocação, colisão da criatura, alcance da bengala e duração do lodo.

- [ ] **3.9 Xande / Alexandre (`src/characters/xande.js`):**
  - Conferir se o skate aparece como ferramenta de mobilidade e ataque de modo consistente, sem sumiço/teleporte sem animação.
  - Diferenciar Polarização Caótica de Tela de Ruído por função e efeito visual; confirmar elemento e ritual de cada um.
  - Verificar a passiva Gladiador Paranormal e adaptação da recuperação de recurso sem gerar energia infinita.
  - Confirmar coerência entre cicatrização, velocidade e ataques com o taco.
  - Testar trajetória do skate arremessado, retorno à mão, colisão, hitbox do taco e cancelamento aéreo.

- [ ] **3.10 Guizo (`src/characters/guizo.js`; formas ET, bombado e velho):**
  - Confirmar o que cada forma representa na narrativa e não tratar ET, bombado e velho como simples skins se houver habilidades diferentes.
  - A câmera deve fazer parte da identidade visual/comportamental sem ocupar a mão da faca de modo impossível.
  - Verificar se Invadir Mente, Embaralhar e Espirais da Perdição têm efeitos distintos.
  - Se as formas bombado/velho multiplicam dano e reduzem cooldown, avaliar suficiência da variação sem inventar poderes sem fonte.
  - Testar troca de forma, escala, hitbox e animação da faca com a câmera.

- [ ] **3.11 Lírio Tellini (`src/characters/lirio.js`):**
  - Confirmar a modelagem exata da Leonora e como as miniaturas amaldiçoadas aparecem durante os ataques.
  - Diferenciar proteção/absorção de dano de superarmadura: resistir sem ignorar todos os ataques.
  - Verificar se Amarras de Sangue controla o alvo com duração, escape e telegraph.
  - Compensar lentidão e curta distância com impacto real sem invulnerabilidade absoluta.
  - Testar empurrão, agarrões, ataques aéreos, superarmadura e proteção de aliado.

- [ ] **3.12 Balu (`src/characters/balu.js`):**
  - Conferir a transformação do machado: a arma comum deve virar a maça-estrela de sangue na habilidade correta.
  - Distinguir Fala Imponente (pressão/controle), 110% (esforço físico) e Colete (defesa balística).
  - Verificar custo em sangue/vida associado ao Machado Demônio se presente na fonte.
  - A personalidade protetora deve aparecer em postura, reação e defesa.
  - Testar armadura contra tiros, corpo a corpo, agarrões e visual antes/depois da maldição.

- [ ] **3.13 Cristino (`src/characters/cristino.js`; forma `forms/cristino_desertor.js`):**
  - Conferir ordem de uso das armas: espingarda carregada pela boca tem ritmo diferente de arma moderna.
  - Diferenciar lampiões como controle/preparação de área em vez de simples granada.
  - Validar a corda e deslocamento em relação às cenas sem conceder teleporte não mostrado.
  - Verificar mudança de kit na forma Desertor e se o rifle altera o ritmo e a distância preferencial.
  - Testar munição/cooldown, explosão, corda, troca de forma e hitboxes da peixeira.

- [ ] **3.14 Cristopher Cohen (`src/characters/cristopher.js`):**
  - Confirmar movimentos de dublê/luta coreografada: quedas, rolamentos e agarrões legíveis.
  - A Muralha e Último Sacrifício devem ter função defensiva e protetora clara, não apenas dano alto.
  - Conferir relação entre Último Sacrifício e Kaiser (ataque conjunto, assistência ou cena independente).
  - Evitar transformar o personagem num tanque genérico sem as técnicas de dublê.
  - Testar agarrões, rolamentos, proteção, invulnerabilidade e especial conjunto.

- [ ] **3.15 Dalmo Magno (`src/characters/dalmo.js`; forma `forms/colosso.js`):**
  - Conferir velocidade menor compensada por alcance e impacto.
  - Golpes de Arena deve recompensar combate corpo a corpo sem gerar ataques infinitos.
  - A Glória Era Viciante precisa refletir a sede de arena de forma mecânica/narrativa coerente.
  - Na forma Colosso, confirmar escala, câmera, alcance e hitbox sem desalinhar colisão.
  - Testar agarrões, atropelamento, pressão e limites da arena.

- [ ] **3.16 Jonas Aguiar (`src/characters/aguiar.js`; forma `forms/aguiar_mutilador.js`):**
  - Distinguir Aguiar sem máscara do Mutilador Noturno; não misturar poderes entre as duas fases.
  - Confirmar o machado arremessado pela corda com trajetória legível e puxão evitável.
  - Armadilha de Urso e Cães de Caça devem controlar e pressionar o espaço com funções distintas.
  - Validar elemento Sangue com a fonte oficial.
  - Testar armadilhas no cenário, limite de armadilhas, puxão e troca de forma no round.

- [ ] **3.17 Park Jae-Yoon (`src/characters/jae.js`; forma `forms/jae_x.js`):**
  - Confirmar distinção entre Jae sem máscara e X/Capuz de X com mudança de comportamento.
  - Furtividade deve criar janela tática curta com aviso sonoro/visual e resposta, sem invisibilidade injusta.
  - Diferenciar punhaladas rápidas, arremesso e ataque surpresa em alcance e recuperação.
  - Confirmar pronome e nome consistentes na UI (Jae, X, Park Jae-Yoon).
  - Testar furtividade contra CPU, lock-on, ataque pelas costas e esquiva.

- [ ] **3.18 Kemi (`src/characters/kemi.js`; forma `forms/fantasma.js`):**
  - Separar rifle de precisão, revólver, faca e Pistola Transtornada em funções distintas.
  - Confirmar se Sede de Vingança pertence à Kemi, à Lena ou à condição do corpo utilizado.
  - A forma A Fantasma deve alterar o padrão de luta de modo coerente com as faixas e o papel de assassina.
  - Verificar tempo de reação na mira e contrajogo justo.
  - Testar distância máxima, colisão do projétil, execução e troca de modelo.

- [ ] **3.19 Labirinto (`src/characters/labirinto.js`; forma `forms/labirinto_elmo.js`):**
  - Conferir identidade do capacete antes de nomear a forma (manter "???" se não confirmado).
  - Diferenciar Rajada Caótica, Labirinto Mental, Mapa Sanguíneo e Capturar Momento.
  - Validar a função narrativa de cada poder com cenas em vez de apenas pacote genérico de Energia.
  - Garantir antena na mão correta em ataques, bloqueios, corrida e especial.
  - Testar zonas, efeitos temporais, câmera e retorno de forma.

- [ ] **3.20 Juan / Henri (`src/characters/juan.js`; forma `forms/juan_odio.js`):**
  - Conferir cronologia e nomenclatura: Henri/Juan, Ódio do Diabo, pacto e Portador do Trono.
  - Verificar custo físico do pacto, sangue como recurso e progressão de forma.
  - Diferenciar Faca Predadora (dreno), Vínculo (controle), Perturbação (mental) e Descarnar (físico).
  - Confirmar ativação e duração da transformação por round.
  - Testar transições, regeneração, especial e consistência com o personagem O Diabo.

- [ ] **3.21 O Diabo (`src/characters/o_diabo.js`; forma `forms/diabo.js`):**
  - Separar a entidade O Diabo selecionável da transformação de Juan; manter semelhanças mecânicas sem copiar identidade integralmente.
  - Conferir se Renascimento é transformação/estado e como funciona o retorno.
  - Verificar escala corporal, garras, chifres, manto e hitboxes.
  - Distinguir agressividade, agarrão, regeneração e pactos sem imunidades ilimitadas.
  - Testar espelhamento contra Juan transformado e transições.

- [ ] **3.22 Ferreiro / Deus da Morte (`src/characters/ferreiro.js`; forma `forms/deus_morte.js`):**
  - Confirmar condição de transformação e relação entre sanidade, tempo e morte com regra visível.
  - Diferenciar Espada Consumidora, lodo, hipnose e mananciais.
  - No Deus da Morte, ajustar escala de hitbox, câmera, distância e vulnerabilidade; confirmar fraquezas elementais com fonte confiável.
  - Evitar que tamanho e regeneração criem luta sem contrajogo.
  - Testar transformação por morte, reset de round e fraquezas.

- [ ] **3.23 Arnaldo Fritz / O Anfitrião (`src/characters/arnaldo.js`; forma `forms/anfitriao.js`):**
  - Separar esgrima teatral de Arnaldo do kit de caos/tempo do Anfitrião.
  - Conferir relógio/relíquia na transição e duração da forma por round.
  - Validar atração/repulsão do Emissor de Pulsos com leitura direcional clara.
  - Anfitrião com animações e especial próprios, sem ser apenas espada com efeitos de Energia.
  - Testar transição, efeitos de atração, colisão e retorno de round.

- [ ] **3.24 Senhor Veríssimo (`src/characters/verissimo.js`):**
  - Diferenciar a esgrima disciplinada de Veríssimo da teatralidade de Arnaldo, apesar da mesma espada.
  - Inteligência Estratégica deve refletir comando e abertura tática.
  - Conferir Segredo de Veríssimo e Olhos Sempre Abertos com a fonte.
  - Limitar liderança para evitar loops de ações extras com assistências/CPU.
  - Testar interceptação, proteção de aliado e combate solo.

- [ ] **3.25 O Estrangeiro (`src/characters/estrangeiro.js`):**
  - Confirmar poderes próprios versus adaptações; justificar presença sem inventar posse de Relíquia se não houver fonte.
  - Diferenciar Comandar (controle), Oblívio (apagamento), Aparição (deslocamento) e Abdução (transporte).
  - Confirmar visual da máscara, fios, capa e proporções.
  - Fornecer contrajogo ao controle mental (telegraph, duração, escape).
  - Testar abdução em bordas, câmera, interrupção e fim de round.

- [ ] **3.26 Amigo Imaginário (`src/characters/amigo.js`):**
  - Distinguir tentáculo físico, tinta/derreter, aprisionamento, dissolução e efeitos do Sino.
  - Confirmar vínculo com Barnabé, Tipora e o sino.
  - O especial Todo Mundo Vai Morrer deve representar o horror/escala da criatura.
  - Conferir animação irregular/assimétrica do corpo e tentáculos sem atravessar o chão.
  - Testar agarrão, dissolução, colisão e leitura em cenários escuros.

- [ ] **3.27 A Magistrada (`src/characters/magistrada.js`):**
  - Confirmar uso das máscaras e controle coerente.
  - Diferenciar Dimensão das Sombras, Mão das Sombras e controle mental.
  - Verificar Dispersão de Dano (quem recebe, limite e contrajogo).
  - Conferir forma Saber Tudo é Perder Tudo sem ser mero buff de atributos.
  - Testar controle de alvo, absorção/redistribuição de dano e reset de round.

- [ ] **3.28 Kian (`src/characters/kian.js`; forma `forms/kian_calamidade.js`):**
  - Reaproveitar `docs/AUDITORIA-KIAN-JOUI.md` e conferir poderes por fase.
  - Rejeitar Névoa com utilidade ampla contra efeitos compatíveis sem anular tudo.
  - Distinguir teletransporte, levitação, combate físico e rituais.
  - Forma Realizador da Calamidade com kit e presença visual coerentes.
  - Testar contra Kaiser e personagens sem névoa para balanceamento consistente.

- [x] **3.29 Raziel (`src/characters/raziel.js`; forma `forms/raziel_verdadeiro.js`):** feito pelo plano RZ-01 a RZ-09 (v3.46.0).
  - Seguir o plano RZ-01 a RZ-09: Turno Extra, Sede Incontrolável, Banquete Bestial diferenciado, investida de garras no lugar de projétil ou licença documentada, Endurecer Sangue com crosta visual, e kit bestial exclusivo.
  - Testes com CPU, jogador, alvos críticos, esquiva e finalizadores.

- [ ] **3.30 Revisão final cruzada — Formas, elementos e documentação:**
  - Comparar `src/characters/forms/index.js` com `src/characters/index.js`; garantir registro de todas as formas sem aliases confusos.
  - Classificar cada forma: transformação temporária, estado narrativo, chefe, entidade separada ou skin.
  - Conferir `element` e `energyColor` contra fontes canônicas (cor não comprova elemento).
  - Verificar correspondência exata em `HABILIDADES.md` (nomes, efeitos, custos e durações).
  - Revisão visual dos modelos, armas, roupas, poses e silhueta.
  - Executar testes e atualizar `CHANGELOG-ADMIN.md`, `TODO.md` e versões.

---

#### 4. Regras para preservar a qualidade do jogo
- **Fidelidade não é cópia literal:** uma ação de turno do RPG pode virar uma janela de cancelamento ou uma ação contextual, desde que a intenção original seja preservada e a adaptação esteja documentada.
- **Não criar imunidades a partir de uma única cena:** resistir, continuar lutando ou avançar não significa ser imune.
- **Não transformar todo poder em dano:** rituais, controle, defesa, mobilidade, pressão, suporte e condição contextual devem continuar diferentes.
- **Transformação importante exige identidade própria:** novos golpes, regras de uso, animações e/ou interação; não só dano/velocidade/vida.
- **Oponentes vulneráveis não são necessariamente alvos em KO:** qualquer devoração contextual deve ser executada antes do estado terminal e respeitar o fluxo de combate.
- **Não alterar o balanceamento global nesta etapa:** primeiro implementar as lacunas canônicas aprovadas; depois medir dano, duração e taxa de vitória.
- **Não remover o que já funciona sem substituição aprovada.** Se uma habilidade for uma licença de gameplay, pode permanecer, desde que seja identificada como adaptação.
- **O jogador decide o que vira escopo:** propostas de novas habilidades, interações de equipe e especiais canônicos precisam de aprovação antes de implementação.

#### 5. Referências e fontes
- [Raziel — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Raziel)
- [Vampiros — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Vampiros)
- [Monstruosos — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Monstruosos)
- [Sobrevivendo ao Horror — Ordem Paranormal Wiki](https://ordemparanormal.fandom.com/wiki/Ordem_Paranormal_RPG%3A_Sobrevivendo_ao_Horror)
- [Hexatombe, episódio 7 — "Consequências" (canal oficial)](https://www.youtube.com/watch?v=K_c2VdmPuLg)
- [Hexatombe, episódio 8 — "Culpa" (canal oficial)](https://www.youtube.com/watch?v=-7prXUHT8OM)
- [Hexatombe, episódio 9 — "Banho de Sangue" (canal oficial)](https://www.youtube.com/watch?v=p5alZam12ss)
- [Site oficial de Ordem Paranormal](https://ordemparanormal.com.br/)

**Ordem de execução sugerida:** RZ-01 e RZ-02 → RZ-03 → RZ-04 e RZ-05 → RZ-06 e RZ-07 → testes RZ-09 → auditoria individual do elenco nos grupos prioritários.

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
- [x] **Lírio**: a LEONORA remodelada no Blender pela arte oficial (`tools/blender/npc_leonora.py` → `public/npcs/leonora.glb`):
      o tambor com a pata dourada nas duas faces, as cintas de ferro com os cravos, o tufo de pelo e o cabo com as faixas
      pretas; a versão em código ficou de reserva. A maldição do Xande (Amaldiçoar Arma) continua pegando nela.
- [x] Fantasma remodelada pela arte oficial (sobretudo, faixas, facas, dreads; texturas novas).
- [x] Kemi remodelada pela arte oficial (top, mochila, faixas, casaco amarrado, dreads; texturas novas).
- [x] Gal Sal remodelado pela arte de Desconjuração (poncho com caimento real, cabelo, venda, correntes) e as lâminas Ereškigal no Blender.
- [x] Kaiser remodelada pela arte de Desconjuração (versão queimada/50%: casaco do avesso, braço esquerdo queimado, faixas, olhos roxos).
- [x] Arthur e Joui remodelados no Blender na técnica atual (sculpt_lib), revisados pelo MCP em 4 vistas contra as miniaturas de Calamidade — v3.41.0.
- [x] Arma de Sangue do Arthur no punho DIREITO (o braço que ele tem) e o físico vira cortes com a lâmina enquanto dura; o físico normal usa o braço direito (soco e cotovelada) — v3.41.0.
- [x] Balu (miniatura de Calamidade) e Lírio (miniatura de Sinais do Outro Lado) remodelados no Blender — v3.40.0.
- [x] Retratos com a cabeça cortada (Kian no tríptico): `renderPortraits` enquadra pela altura da cabeça — v3.39.0.
- [x] **Arnaldo** remodelado no Blender na técnica atual (sculpt_lib) pela "Arte do Arnaldo em Desconjuração" e a miniatura
      de Desconjuração, revisado pelo MCP em 4 vistas e no jogo (2026-10-26): o casacão escuro até o joelho, aberto, com as
      lapelas e a gola virada e o forro vinho; colete marrom com os botões e a corrente de ouro; colarinho branco e a
      gravata vermelha colada no peito; mangas compridas com o punho da camisa; calça com vinco; sapatos sociais pretos;
      o cabelo castanho volumoso penteado de lado (risca à direita, cobrindo o alto das orelhas e a nuca) e a barba cheia
      com o bigode. Os óculos redondos, a espada e o relógio continuam em código. (`tools/blender/arnaldo_common.py`, que
      agora também salva `fonte/<id>.blend`.)
- [x] **Anfitrião** remodelado pela "Miniatura O Anfitrião em Calamidade" (2026-10-26): o corpo e as roupas novas do Arnaldo
      (as mesmas roupas, como no cânone) e a cabeça refeita na técnica atual — a MÁSCARA lisa e escura cobrindo a cabeça,
      o SÍMBOLO DO ANFITRIÃO gravado em luz (círculo duplo com as runas, o triângulo), as LENTES redondas rosa acesas, o
      FILTRO canelado no queixo com a mangueira até o peito e as runas acesas, e as MANGUEIRAS CANELADAS (cinza, rosa e azul)
      que saem do alto, emolduram a máscara e descem pelas costas. Revisado pelo MCP em 4 vistas e no jogo.
- [x] **Veríssimo** remodelado pela "Miniatura Senhor Veríssimo em Calamidade" (2026-10-26, `char_verissimo.py` na técnica
      atual): o cabelo grisalho volumoso penteado para trás, a barba curta com o bigode e o cavanhaque, o colete escuro
      RISCADO DE GIZ abotoado, a camisa branca de gola aberta com as mangas arregaçadas até o cotovelo, a gravata azul
      afrouxada, a calça escura riscada (antes azulada, da época de Desconjuração) e os sapatos pretos. Revisado pelo MCP
      em 4 vistas e no jogo.
- [x] **Kian** (2026-10-26) pelas miniaturas "Kian marcado em Desconjuração" e "Kian em Calamidade": o corpo base (que guarda
      os UVs das linhas douradas e da escrita) ganhou a técnica atual — MÚSCULOS em relevo (peitoral, seis gomos com a
      linha alba, oblíquos, dorsais, bíceps), o AFRO curto e arredondado esculpido (antes uma calota raspada), as BARBAS da
      Transformação esculpidas (média e a cheia densa de Calamidade, com o bigode), as FAIXAS em espiral rentes do cotovelo
      aos nós dos dedos com as pontas soltas e as dobras da calça. Os nomes das peças (beard_m, beard_f, wraps) seguem os
      mesmos. Revisado pelo MCP e no jogo, normal e Calamidade (1,9 MB).
- [x] **O Diabo** (2026-10-26) pela "Miniatura O Diabo em Calamidade": os CHIFRES altos esculpidos com os anéis em relevo,
      os DEDOS longos vermelhos com as GARRAS escuras (mãos e pés), o manto, o capuz e as mangas com DOBRAS de verdade e a
      barra rasgada. Revisado pelo MCP e no jogo.
- [ ] **PARA DEPOIS (pedido de 2026-10-27) — upgrade de modelos: A MAGISTRADA (e as MÁSCARAS que ela invoca), O
      ESTRANGEIRO e O AMIGO IMAGINÁRIO** na técnica atual (sculpt_lib), pelas artes oficiais.
- [ ] **PARA DEPOIS (2026-10-27) — O ESTRANGEIRO: os "SOLDADOS"** — ele pode invocar os seus soldados ETs: ALHEIOS de terno
      e gravata que parecem humanos e usam METRALHADORAS (modelo novo + invocação; conferir no cânone de Sinais do Outro Lado).
- [x] **Pedidos de 2026-10-27 (feitos):**
      - EQUIPES: HENRI (o antigo "Juan", id `juan`) nos Mascarados → no ódio vira o JUAN (Portador) → Portador do Trono.
        PORTADORES ≠ RELÍQUIAS: Portadores = Juan (selecionável, `juan_odio`), Arnaldo, Ferreiro; Relíquias = O Diabo, O Deus
        da Morte (selecionável), A Magistrada, O Anfitrião (selecionável) — dá para começar já como a Relíquia
        (`characters/selectableForms.js`, mesmas definições das formas); OUTRO LADO = Estrangeiro e Amigo Imaginário. Cores,
        páginas da seleção, falas (pelo personagem base), página Sobre e check atualizados.
      - Tela inicial: as equipes em chips pequenos com a cor de cada uma (gerados da lista), somem com o menu aberto.
      - ARTHUR: a Arma de Sangue cobre o ANTEBRAÇO e a lâmina sai dele na linha do braço (`bloodForearmBlade`), não é mais
        segurada como espada.
      - KAISER: FOTO COM FLASH (← + □, no lugar do Disparo de Emergência): a câmera fotográfica cega quem está à frente
        olhando para ele (de costas ou esquivando escapa).
      - FERREIRO: 50% de chance de um dos Mananciais ser o que fica LONGE (~6 m) e arremessa o LODO que tira SANIDADE
        (`DanteClone` com `o.sludge`; `onHit.drainSanity`).
      - CPU — INTELIGÊNCIA ÚNICA ("uma IA que saiba usar qualquer personagem contra qualquer outro"): sem IA por personagem
        nem por confronto. `kitProfile(def)` lê o kit — ATIRADOR (tiro carregado ou arma automática de longe: Arthur, Kaiser,
        Kemi), PERSEGUIDOR (rápido ou com 2+ formas de encurtar a distância: investidas, botes, puxões, teleporte) e a
        velocidade — e `matchupPlan(meu, dele)` monta o plano com os DOIS kits: atirador × perseguidor fica a 9 m, foge a
        4,5 m e prioriza o que trava (Dystopia); atirador × resto a 7,5 m / 3,5 m; quem enfrenta um atirador PRESSIONA
        (encurta ziguezagueando, entra de dash bem mais vezes). Validado em 10 confrontos (5 sorteados do elenco), sem erro.
      - [ ] **Ainda a melhorar:** atirador × perseguidor rápido quando OS DOIS são CPU (Arthur × Raziel, Kaiser × Jae ficam
        ~2 m): o perseguidor, mais rápido e agora também pressionando, vence a corrida pela distância. Próximo passo: o
        atirador ler a investida do outro (o telegraph) e esquivar no tempo certo, e usar o cenário (pilares) para fugir.
      - CPU no BOTÃO DO ANFITRIÃO: larga tudo, corre até o botão e aperta primeiro (testado no Fácil e no Difícil).
- [ ] **PLANEJAMENTO — DISTRIBUIÇÃO PELO CÂNONE (pesquisa de 2026-10-27, wiki "Relíquias da Calamidade" e "A
      Magistrada").** Cada Relíquia é um OBJETO, e quem a porta recebe um TÍTULO:
      | Elemento | Relíquia (objeto) | Título do portador | Portadores no cânone |
      |---|---|---|---|
      | Sangue | O Trono | O Diabo | Juan (nascido Lúcio Davo, antes chamado Henri) |
      | Conhecimento | A Máscara do Desespero | A/O Magistrada(o) | Celestine (67 d.C.), a "Última Magistrada" (sem nome) |
      | Energia | (etérea; hoje na antiga katana do Joui) | O Anfitrião | Amphitruo, Aeneas, Liber, Silenus, Plautus, Arnaldo Fritz |
      | Morte | O Parasita de Dimensões | O Deus da Morte | portador desconhecido; receptáculos: um Deus da Morte desconhecido e O Ferreiro |
      Propostas (decidir com o dono antes de mexer):
      1. **Portadora de CONHECIMENTO que falta: CELESTINE** — guerreira da Ordo Calamitas em 67 d.C. (loira, cabelo curto
         jogado de lado, armadura com o Símbolo da Ordo Calamitas). Transformação CANÔNICA: depois dos jogos de Amphitruo
         ela coloca a Máscara do Desespero e vira A MAGISTRADA. Fecha o padrão dos Portadores: Juan → O Diabo/Portador do
         Trono, Celestine → A Magistrada, Arnaldo → O Anfitrião, Ferreiro → O Deus da Morte. Precisa de modelo novo
         (Blender) e kit (guerreira romana da Ordo Calamitas).
      2. **A transformação da MAGISTRADA não é canônica** ("Saber Tudo é Perder Tudo" é um fortalecimento genérico do
         jogo; no cânone ela é o título de quem porta a Máscara e não se transforma). Sugestão: as RELÍQUIAS não se
         transformam (como o Anfitrião e o Deus da Morte selecionáveis) e as habilidades canônicas dela entram no kit:
         REESCREVER A REALIDADE (recupera corpo e mente / reescreve o estado do alvo), CONJURAÇÃO VERDADEIRA (qualquer ritual
         de Conhecimento) e DESTRONAR O ANFITRIÃO (a única capaz de solucionar o Enigma de Medo e dizimar o Anfitrião —
         uma interação própria contra ele).
      3. **HENRI pela linha do tempo:** no cânone "Henri" é o nome do tempo de Escripta (Desconjuração, Dia Final, onde
         perdeu a mão e o olho esquerdos); "Juan" é o de Hexatombe (o Pacto, o Estigma, vence como sacrifício) e o portador
         do Trono é O Diabo. Avaliar se o Henri fica nos ESCRIPTAS em vez dos Mascarados.
      4. **O ANFITRIÃO selecionável com o visual de AMPHITRUO** (o primeiro Anfitrião conhecido: máscara sorridente com três
         mãos que se fundem ao rosto, armadura romana de ombreiras pontudas, a grande capa roxa com capuz, chamas roxas) — e
         o Anfitrião do Arnaldo com o visual do Arnaldo. Bate com o pedido da skin diferente (item abaixo).
      5. **O Ferreiro** no cânone é RECEPTÁCULO (o portador da Morte é desconhecido): continua nos Portadores, que é o mais
         próximo.
      6. A **cor das Relíquias** era quase o amarelo da Ordo: trocada por MAGENTA (`#d63c8c`), única entre as equipes (feito).
         E os retratos do Anfitrião e do Deus da Morte na seleção saíam sem a cor da equipe (o retrato de vilão da Torre,
         com o mesmo id, era gerado depois e sobrescrevia) — corrigido (os do elenco são gerados por último).
      - [x] **2 (feito em 2026-10-27): A MAGISTRADA sem a transformação inventada** — a Barra dela agora é REESCREVER A
        REALIDADE (`specials/realityRewrite.js`, não é transformação: 30% da vida, sanidade cheia, sem nada de ruim em cima,
        recargas zeradas e os buffs do adversário apagados) + CONJURAÇÃO VERDADEIRA (rituais 25% mais baratos) + DESTRONAR O
        ANFITRIÃO (+30% de dano nele). Testado no jogo.
      - [x] **1 (feito em 2026-10-27): CELESTINE** — jogável: Portadores (logo depois do Ferreiro) com a etiqueta da Ordo Calamitas; kit das machadinhas na corrente (□ crava e puxa), Corrente Giratória, Código, Investida Rebelde, Endorfina, especial Duelo Final, passiva Nada Pessoal (+20% pelas costas) e a Transformação que vira CELESTINE, A MAGISTRADA (o kit da Magistrada com a aparência dela). Falas contra o elenco inteiro. Testado no jogo. Falta só o retrato da página Sobre (`public/sobre/elenco/celestine.webp`). — pedido do dono: entra numa equipe NOVA, a **ORDO CALAMITAS** (depois entram os
        outros membros: Gaius, Amalia, Cornelius...). Pesquisa (wiki "Celestine"): guerreira de 67 d.C., pele clara, cabelo
        loiro curto, armadura com panos, cachecol, o Símbolo da Ordo Calamitas no peito; arma: DUAS MACHADINHAS com talhos
        azuis LIGADAS POR UMA CORRENTE; habilidades da ficha: NADA PESSOAL (+1 dado ao trair) e CÓDIGO (sussurra mensagens);
        energética e debochada. Transformação canônica (Calamidade ep. 6): veste a MÁSCARA DO DESESPERO e vira A MAGISTRADA —
        **com os MESMOS PODERES da Magistrada das Relíquias, mas a APARÊNCIA dela** (pedido do dono; como o Anfitrião do
        Arnaldo × o Anfitrião separado).
        Feito: o modelo `tools/blender/char_celestine.py` → `public/models/celestine.glb` (sculpt_lib; revisado no Blender),
        as MACHADINHAS (`weapons.js chainHatchet`) e a MÁSCARA DO DESESPERO (`despairMask`) em código, `addCelestineProps` /
        `addCelestineMagistradaProps` e as variantes `celestine` / `celestine_magistrada` em `models/index.js`, as texturas
        `face_celestine` e `shirt_celestine` (o Símbolo da Ordo Calamitas), o visual `hatchet` do arremesso e as cenas de
        agarrão. **Falta:** `characters/celestine.js` (machadinhas: combo duplo, □ = a machadinha na corrente que puxa,
        Corrente Giratória, Nada Pessoal, Código, Endorfina; especial "Duelo Final"), a forma `forms/celestine_magistrada.js`
        (o kit da Magistrada com a aparência dela; maskTransform com a Máscara), a equipe "Ordo Calamitas" (cor, ordem), as
        falas (intro e vitória contra o elenco), a CPU, o check e os testes no jogo.
      - [x] **EQUIPES DUPLAS (2026-10-27)**: `teams` no personagem = outras equipes além da `origin` (que decide o grupo na seleção e a cor do retrato); aparecem como etiquetas extras no cartão, na ficha, nos golpes e no filtro da página Sobre (`config/teams.js defTeams`). Marcados: Celestine (Portadores + Ordo Calamitas), Arnaldo (Portadores + Ordo Realitas), Henri (Mascarados + Escriptas), Juan Portador (Portadores + Mascarados). A equipe Luzidios saiu (não existe no jogo).
      - [ ] **ORDO CALAMITAS**: Gaius, Amalia, Cornelius... (grupo próprio entre os Portadores e as Relíquias).
      - [x] **O MODELO DAS MÁSCARAS** (feito em 2026-10-27: modelo próprio `tools/blender/char_seita.py` → `public/models/seita.glb` — túnica branca longa com as regiões pretas, capuz, pelerine, forca no pescoço, corda na cintura e os Símbolos tatuados nos antebraços, como na wiki; as máscaras em 3D, uma por membro: Nathaniel, riscada de vermelho, preta e a do sorriso — `weapons.js seitaMask`) que a Magistrada chama (os membros da Seita das Máscaras) — refazer na técnica atual
        (pedido de 2026-10-27).
- [ ] **PARA DEPOIS (2026-10-27) — SKIN do ANFITRIÃO do ARNALDO ≠ ANFITRIÃO base:** o Anfitrião que sai da
      transformação do Arnaldo terá uma skin diferente do Anfitrião selecionável das Relíquias — mesmas habilidades, só o
      visual muda (modelo/textura próprios para a forma `anfitriao` do Arnaldo vs. o personagem `anfitriao` da seleção).
- [ ] **PARA DEPOIS (2026-10-27) — O ESTRANGEIRO: ajuste da TRANSFORMAÇÃO** com o nome canônico (e o que ela faz) pela
      wiki/episódios.
- [ ] **O Portador do Trono** (`char_diabo.py`, a Transformação do Diabo/Juan): ainda na técnica antiga — refazer pela
      "Arte Completa Cinematic O Portador do Trono" (coroa de espinhos, asas de braços, quatro braços, pernas de bode).
- [ ] Os outros que ainda não usam a técnica atual (`char_*.py` sem `sculpt_lib`, conferido em 2026-10-26): Aghata, Amigo,
      Dalmo, Erin, Estrangeiro, Ferreiro, Guizo, Jae, Labirinto e Magistrada (fora o Portador do Trono acima; o Manancial
      foi refeito em 2026-10-26).

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
- [x] **Joui + Kaiser + Arthur** — virou o grupo **FORÇA D** (a equipe de Desconjuração; pedido do dono: a Equipe Abutres
  é a de Calamidade, sem o Kaiser). Vale com 3 da equipe; Thiago e Liz entram quando estiverem no elenco. Joui surge
  atrás e corta, Kaiser a rajada de Balas Amaldiçoadas, Arthur o tiro do Rebirth (verde); o líder fecha com o especial.
- [x] **Cristopher + Kaiser** — especial de dupla "A Muralha e o Disparo": o terceiro ataca primeiro, o Cristopher dá a
  ombrada e SEGURA o alvo e o Kaiser (o filho) dispara.
- [x] **Mascarados** (Dalmo, Aguiar, Jae, Kemi, Labirinto, Juan) — especial de grupo com 3 ou mais na equipe: os seis
  aparecem em roda em volta do alvo (os de fora da equipe entram como convidados) e golpeiam um após o outro.
A confirmar (o dono decide antes de entrar):
- [ ] Outras duplas/trios da Ordo Realitas (ex.: a Equipe Abutres de Calamidade), Escriptas (Kian + Gal Sal) e os
  Portadores (são inimigos entre si — provavelmente nenhuma ligação).
- [ ] **Equipe Abutres** (Calamidade): ligação própria com as versões de Calamidade, quando elas estiverem no jogo
  (o dono confirma os membros).
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
- [x] **F4** (2026-10-26) `teamLinks.js` ligado ao Especial em Equipe com a regra do TODO (grupo > trio > dupla; duas
  duplas → a do líder) e os três primeiros especiais customizados (`combat/teamSpecials.js`): banner e painéis da
  ligação (versão curta, para não esconder os golpes), golpe próprio de cada membro, o líder fecha com o especial dele e
  o dano é o mesmo de qualquer Especial em Equipe. Testado: as três ligações + a equipe sem ligação (simplificado).
  **Versões do mesmo personagem** (pedido): uma versão nova é uma ficha com `baseId`; na ligação, `'kaiser'` vale para
  qualquer versão e `'kaiser_calamidade'` só para ela; duas versões na mesma equipe contam como um membro; com várias
  ligações valendo, ganha `priority` > grupo/trio/dupla > a mais específica > a do líder (testado com ligações de teste).
- [x] Telas: a placa da seleção da equipe mostra "ESPECIAL EM EQUIPE · <nome>" (tracejado enquanto o cursor completa a
  ligação, cheio quando ela está escolhida), no PC e no celular.

---

# 3. LIMPEZA E SAÚDE DO PROJETO

## Git

* [x] Procurar arquivos temporários
* [x] Procurar código morto
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
>
> Código morto (2026-10-26, depois da v3.43.0): varredura de todo `src` (arquivos que nenhuma página/ferramenta alcança,
> exports sem uso, declarações locais sem uso). Removidos: `TitleScreen` (+ a chave `title.press` nas 13 línguas e o CSS
> `#title`), `watchChain`, `necktie`, `getCharacter`, `isArenaLoaded`, `learnedStats`, `VOLUME_CHANNELS`,
> `VOLUME_OPTIONS`, `volumeLabel`, `fxLabel`, `FX_NAMES` e o `UP` de `projectiles.js`. Ficam de propósito: `src/dev/*`
> (ferramentas do console), `sw-template.js` (lido pelo `vite.config.js`) e `teamLinks.js` (a F4). O build voltou a sair
> sem aviso: o `main` tinha 878 kB → chunks `modelos` e `especiais` (main 532 kB); versão compilada testada (menu →
> seleção → cenário → luta, galeria) sem erro no console.

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

* [x] Conferir escalonamento (`COMBAT.comboScaling` 100/100/90/80/72/65/58/50%)
* [x] Conferir limite (piso de 50%)
* [x] Conferir especiais (`comboScalingFloor.special` 75%)
* [x] Conferir grabs (`comboScalingFloor.grab` 75%)
* [ ] Conferir finalizadores
* [ ] Conferir HUD
* [x] Evitar infinitos (`maxLaunchesPerCombo` 1 + anti-repetição)

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
* [x] Conferir deslocamento lateral (passo curto para o lado — teste `positioning`)
* [x] Evitar aparecer diretamente atrás por padrão (nunca nas costas do atacante — teste `positioning`)
* [x] Conferir cargas (1 carga de esquiva — teste `combat-universal`)
* [x] Conferir cooldown (1,2 s — `COMBAT.substitution`)
* [ ] Testar com todo o elenco

---

# 12. GRAB / THROW TECH

* [ ] Conferir dano
* [x] Conferir defesa (Defesa + ○ no começo escapa — `COMBAT.grabTech`, teste `combat-universal`)
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

* [x] Invulnerabilidade (`COMBAT.wakeupInvuln` + invulnerável caído)
* [x] Roll (× ou L2 logo depois de cair levanta rolando — `COMBAT.down`)
* [ ] Ataque
* [ ] Pressão justa
* [ ] Evitar loops

---

# 15. INPUT BUFFER

* [ ] □
* [ ] ○
* [ ] △
* [ ] L2
* [x] Buffer durante recuperação (`COMBAT.inputBuffer` 0,12 s)
* [ ] Evitar comandos acidentais
* [ ] Conferir janela

---

# 16. DEFESA

* [x] Defesa normal
* [x] Perfect Block (`COMBAT.defense.perfect` 0,1 s + contra-atordoamento)
* [x] Resistência (barra de defesa com regeneração)
* [x] Guard Break (`guardCrush` / som `guardBreak`)
* [ ] Golpe △+○
* [x] Consumo de defesa (`guardDamage` 0,9 por ponto bloqueado)
* [ ] Interação com grabs
* [ ] Evitar quebra injusta

---

# 17. ANTI-REPETIÇÃO

* [x] Limite de lançamentos (`maxLaunchesPerCombo`)
* [x] Limite de projéteis (`maxVolleys` 2 no ar)
* [x] Redução por repetição (`COMBAT.repeat`: 3ª vez seguida 70%)
* [x] Proteção contra loops
* [ ] Não prejudicar personagens dependentes de repetição

---

# 18. ESPECIAIS / TELEGRAPHS

Todo especial de grande impacto deve possuir leitura clara.

* [ ] Conferir todos os especiais
* [ ] Conferir projéteis
* [x] Supernova (a Granada de Luz real pega o especial)
* [x] Em Nome do Caos (mesma granada; errou, ela não se explode)
* [ ] Especiais do Anfitrião
* [x] Flash Grenade (Granada de Luz)
* [ ] Conferir esquiva
* [ ] Conferir interrupção quando aplicável
* [ ] Evitar dano sem feedback

---

# 19. TRANSFORMAÇÕES

## Geral

* [x] Barra (Barra de Transformação `COMBAT.storm`)
* [x] Condição (cheia + vida ≤ 35%)
* [ ] Custo
* [x] Duração (até o fim do round)
* [ ] Animação
* [ ] Câmera
* [ ] Efeitos
* [x] Retorno (volta da forma no fim do round)
* [ ] Vitória

## Formas

* [x] Fantasma (forms/fantasma.js)
* [x] Mutilador (forms/aguiar_mutilador.js)
* [x] ??? (Capacete do ??? — forms/labirinto_elmo.js)
* [x] Erin — Em Nome do Caos (forms/erin_caos.js)
* [x] Anfitrião (forms/anfitriao.js)
* [x] Juan — Portador do Trono (forms/diabo.js)
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
* [x] Conferir cores (`config/elements.js`: Sangue vermelho, Conhecimento dourado, Energia roxo, Morte cinza)
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
* [x] Avaliar Acácia (no kit)
* [ ] Avaliar Dissipar Espíritos
* [ ] Revisar Resistência
* [x] Desert Eagle
* [x] Karambit
* [x] Balas amaldiçoadas
* [x] Nebulosa
* [x] Conferir visual (remodelada pela arte na v3.38.0)

---

## ARTHUR

* [x] Conferir braço esquerdo
* [x] Revisar Arma de Sangue (v3.39.0: habilidade R2 + ×, paga 40 de vida, alcance e sangramento; v3.41.0: a lâmina nasce do punho direito e o físico vira cortes)
* [x] Arma de Sangue deve consumir vida (passiva `bloodPrice`: sem sanidade, paga com vida)
* [x] Revisar Rebirth (v3.39.0: roxo de Calamidade, Energia)
* [x] Revisar crânios (caveirinhas de energia no Rebirth)
* [x] Revisar raios (raios roxos nos tiros)
* [ ] Revisar Dystopia
* [ ] Revisar Templo do Ódio
* [x] Revisar sniper carregado (v3.14.0: laser com atraso e aviso — dá para desviar)
* [ ] Conferir risco/recompensa

---

## JOUI

* [x] Teleporte das Sombras
* [x] Olhar do Desespero
* [x] Shi no Kage
* [x] Máscara das Pessoas nas Sombras: o modelo usa a máscara e a habilidade **Tomado pelo Ódio** (R2 + ×) ativa os poderes dela; na forma Shi no Kage ele a entregou à Magistrada (v3.42.0)
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
* [x] Descarnar (especial)
* [ ] Livro
* [x] Faca
* [ ] Projétil de Sangue
* [x] Ritual de Leitura (Leitura de Rituais)
* [x] Colar Encharcado de Sangue (passiva `bloodNecklace`)
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

* [x] Tentáculos de Lodo
* [x] Decadência
* [x] Hold
* [x] Slow
* [ ] Conferir alcance
* [ ] Conferir dano
* [ ] Evitar loop

---

## ERIN

* [x] Em Nome do Caos (forms/erin_caos.js)
* [x] Máscara de gás
* [x] Custo em vida (passiva `noSanity`)
* [x] Sem barra de sanidade adicional (barra zerada e travada)
* [x] Cena de suicídio (specials/kamikaze.js)
* [x] Vitória caso o rival vá junto (`sacrificeWin`)
* [x] Supernova
* [x] Black Hole (Envelhecimento Localizado "Black Hole")
* [ ] Cura
* [x] Telegraph (Granada de Luz)

---

## AGUIAR

* [x] Máscara
* [x] Sangramento
* [x] Machado (remodelado no Blender (v3.33.0))
* [ ] Cura
* [ ] Efeitos próprios
* [ ] IA

---

## LABIRINTO

* [x] Tempestade Caótica (forms/labirinto_elmo.js)
* [x] Raio contínuo (`beam`)
* [x] Rastreamento (a ponta segue o alvo (`track` 6,5))
* [x] Counterplay (um dash escapa do raio)
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
* [x] Conferir visual (remodelado no Blender na v3.40.0)
* [ ] Conferir IA

---

## FERREIRO

* [x] Spiral Hypnosis
* [x] Tiros amaldiçoados
* [ ] Controle de distância
* [ ] Dano
* [ ] IA

---

## JUAN / DIABO

* [x] Pacto
* [x] Lança de Sangue (forms/diabo.js)
* [x] Poças
* [x] Transporte
* [x] Hate (`devilHate`)
* [x] Regeneração (`regen` da forma)
* [x] Blood Armor (Armadura de Sangue Diabólica)
* [ ] Explosão do ombro
* [x] Portador do Trono
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

* [x] Conferir modelo (remodelado no Blender na v3.40.0)
* [ ] Conferir animações
* [x] Machado
* [x] **Machado em Giro arremessa a arma que está na mão** (pedido do usuário, 2026-10-08): com o Machado
  Demônio ativo (machado virou clava/maça de sangue), o □ deve lançar a clava — hoje lança o machado comum
* [x] Blood Curse (Amaldiçoar Arma com Sangue)
* [x] Demon Axe (Machado Demônio)
* [x] Imposing Voice (Fala Imponente)
* [x] Resistência (Colete Físico-Balístico)
* [x] Ataque de chão (Derrubar e Atacar)
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
* [x] Aguiar (v3.33.0)
* [ ] Amigo Imaginário
* [ ] Arnaldo Fritz
* [x] Arthur Cervero (v3.41.0)
* [x] Balu (v3.40.0)
* [ ] Dalmo (e o Colosso)
* [ ] Erin
* [ ] O Estrangeiro
* [ ] Ferreiro
* [x] Gal Sal (v3.34.0)
* [ ] Guizo
* [ ] Jae
* [x] Joui (v3.41.0)
* [x] Kaiser (v3.38.0)
* [x] Kemi (v3.34.0)
* [ ] Kian
* [ ] Labirinto
* [ ] Lírio
* [ ] A Magistrada
* [ ] O Diabo
* [ ] Senhor Veríssimo
* [x] Xande (v3.33.0)

## Formas com modelo próprio

* [ ] O Anfitrião
* [ ] O Portador do Trono (forma do Juan)
* [x] A Fantasma (forma da Kemi) (v3.34.0)

## Invocações

* [x] Os Mananciais (Ferreiro) — refeitos na técnica atual (2026-10-26, `char_manancial.py` com `sculpt_lib`) pelas
  miniaturas oficiais (fugitivo, barbudo, velho, imóvel, castanho) e pela HQ de O Segredo na Floresta Pt. 2: pele pálida
  cinza-esverdeada, corpo esquálido (costelas, clavículas, espinha, escápulas, barriga funda), ORELHAS pontudas, olhos
  FUNDOS e PRETOS, cabelo preto comprido repartido emoldurando o rosto, só TRAPOS escuros, dedos longos com unhas sujas e o
  Símbolo Espiral no peito (texturas `face_manancial` e `skin_manancial_torso`; a camisa/calça brancas antigas saíram).
  Revisado no Blender e no jogo (Chamar os Mananciais).
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
* [x] Especiais cinematográficos (v3.44.0: transições suaves, sem entrar no cenário)
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
* [x] **REAJUSTE DAS ANIMAÇÕES** — 2ª parte (2026-10-26, pacote aprovado pelo dono): Quaternius **Universal Animation
  Library** (Standard, grátis, licença CC0 conferida no License.txt), baixado de quaternius.itch.io. O pacote NÃO vai
  para o repositório; `tools/anim/retarget-ual.mjs` redireciona as animações para o esqueleto do jogo (giro de cada
  osso desde a pose T da fonte, calibrado para o repouso do jogo; quadril e tronco medidos como segmento; passada tirada
  do arquivo com root motion) e grava `src/anim/ualClips.js` (12 clipes `ual_*`: andar, trote, corrida, pulo, queda,
  rolamento, reações, idle, agachado, morte). No jogo: `run` ← Jog_Fwd_Loop, `walk` ← Walk_Loop, `fall` ← Jump_Loop
  (as feitas à mão ficam como `*_classic`); interpolação linear para clipes densos (`clip.linear`). Ficam os próprios:
  pulo, dash, esquiva (tempo de jogabilidade) e a reação a golpe (o Hit_Chest do pacote é fraco demais — comparado na
  tela). Conferido na tela: tronco igual ao da fonte (idle 2°, andar 5°, trote 23°), corrida casando a velocidade.
  1ª parte feita em 2026-10-23 (`anim/locomotionClips.js`): corrida, caminhada, pulo,
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
