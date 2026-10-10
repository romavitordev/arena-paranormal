# TODO — ARENA PARANORMAL

**Versão de referência atual:** v3.10.0
**Documento:** TODO principal
**Histórico de desenvolvimento:** Changelog Admin + Changelog Cliente

---

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

* [ ] Utilizar referência visual definida
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

* [ ] Ereshkigal
* [ ] Duas lâminas
* [ ] Correntes
* [ ] Corrente Giratória
* [ ] Controle Mental
* [ ] Perfect Block
* [ ] Teleporte
* [ ] Desviar Balas
* [ ] Rejeitar Névoa
* [ ] Arremesso
* [ ] Mortal Speed
* [ ] Passiva
* [ ] Conferir controle de espaço
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

# 75. NOVAS TRANSFORMAÇÕES FUTURAS

## Park Jae-yoon

> 2026-10-09: ADICIONADA como lutadora (Jae) com a forma X (`forms/jae_x.js`), a partir das referências do usuário em
> `Referencias visuais/Personagens/Jae`. A cena usa o `maskTransform` padrão (concentra, o capuz aparece, vermelho);
> uma cena própria (puxar o capuz, sorriso, fundo vermelho) como no vídeo de referência fica para depois.

* [x] Capuz
* [x] X vermelho
* [x] Explosão (clarão vermelho do `maskTransform`)
* [ ] Pose (cena própria de puxar o capuz)
* [ ] Animação (idem)
* [x] `maskTransform`

## Dalmo Magno

* [x] Capacete (o escafandro em código: `props.js → colossoHelmet`, para a cena levá-lo do peito à cabeça)
* [x] Olho vermelho (os três visores vermelhos rachados)
* [x] Explosão vermelha (clarão e aura do `maskTransform`)
* [x] Pose (`colosso_roar`: agachado de braços abertos, como no gif)
* [x] Animação (cena `helmet`: segura no peito, ergue, encaixa; troca camisa → traje com `sp.swap`)
* [x] `maskTransform`

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
* [ ] **Opção QUALIDADE GRÁFICA (Alta / Média / Baixa):** antialias, pixel ratio até 2 e sombras ficam sempre ligados
  (`main.js`). No Baixa: pixel ratio 1, sem sombras, menos partículas e rastros.
* [ ] **Cabo do Anfitrião** (`props.js` → `liveCable`) cria um `TubeGeometry` novo a cada quadro (lixo de memória a
  60 fps). Trocar por um buffer fixo atualizado no lugar, como já é feito na fita da espada.
* [ ] **Contador de desempenho de dev** (FPS, memória, objetos na cena) para medir cada cenário/personagem antes e
  depois das otimizações acima.

## Opções e acessibilidade

* [ ] **Volume** (geral, efeitos, falas): não existe nas OPÇÕES; o `AudioManager` já aceita volume por som.
* [ ] **Remapear teclas e botões** (hoje fixos em `config/controls.js`), salvo no navegador.
* [ ] **Reduzir flashes e tremor de câmera** (conforto/fotossensibilidade): `screenFlash` e `cameraRig.shake` aparecem
  em quase todo especial e transformação.
* [ ] **Falas:** velocidade das legendas e opção de desligar as falas durante a luta.

## Personagens e animação

* [x] **Pose de vitória própria para o Arthur** (`vic_arthur`: a sniper apoiada no ombro; `victoryProp` mostra a arma
  na vitória). Correção da análise: a Lírio já tinha a dela (`victory_hammer`, a Leonora erguida).
* [ ] **Idles próprios:** 5 personagens dividem `idle_knife`, 4 `idle_katana` e 3 `idle_fist`; a pose parada é o que
  mais aparece (seleção, introdução, entre golpes) e devia mostrar a personalidade de cada um.

## Qualidade do código e testes

* [ ] **Dividir os arquivos gigantes:** `combat/abilities.js` (3 024 linhas) e `combat/Fighter.js` (2 810) em módulos
  por família (movimento, buffs, invocações, agarrão, esquiva, transformação).
* [ ] **`npm run check` conferir mais:** toda `anim` usada pelos kits existe em `CLIPS` (hoje só conferido à mão), todo
  `type` de habilidade/especial existe e todo `sound` existe no `AudioManager`.
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

## ADENDO FINAL — FUTURO: VERSÃO INSTALÁVEL / SOFTWARE

### Objetivo futuro

O Arena Paranormal não deve permanecer indefinidamente como um jogo executado exclusivamente pelo navegador.

Futuramente, o projeto deverá ser transformado em uma **versão instalável e executável diretamente na máquina do jogador**, funcionando como um software/jogo independente, sem depender da abertura do navegador para jogar.

O formato técnico ainda não está definido e deverá ser estudado posteriormente (por exemplo, executável para Windows ou outra solução adequada à tecnologia utilizada pelo projeto).

### Prioridade atual

**Não iniciar essa migração agora.**

Antes disso, a prioridade é:

* otimizar a versão atual para **mobile**;
* reduzir travamentos e quedas de desempenho;
* melhorar consumo de memória;
* otimizar renderização 3D;
* reduzir processamento desnecessário;
* melhorar carregamento de modelos, texturas, efeitos e cenários;
* testar em dispositivos móveis reais;
* garantir que a experiência mobile seja estável antes de iniciar uma nova etapa de distribuição.

### Etapa futura — versão instalável para PC

Quando a versão web estiver suficientemente estável e otimizada, estudar a transformação do jogo em uma aplicação/jogo instalável para PC.

Essa etapa deverá avaliar:

* tecnologia mais adequada para empacotar o projeto atual;
* geração de executável/instalador;
* execução sem navegador;
* gerenciamento de arquivos e assets;
* carregamento e armazenamento local;
* desempenho superior ou equivalente ao da versão web;
* suporte a teclado, mouse e controles;
* resolução e configurações gráficas;
* sistema de atualização;
* tratamento de erros e logs;
* compatibilidade com diferentes máquinas;
* tamanho final da instalação;
* possibilidade de versão portátil, caso faça sentido.

**Não assumir antecipadamente que o formato será `.exe`**. A tecnologia e o formato final devem ser escolhidos depois de avaliar a arquitetura do projeto e as opções disponíveis.

### Distribuição futura

O próprio site oficial do Arena Paranormal deverá futuramente oferecer uma área de **Download**, permitindo que o jogador escolha a versão adequada e instale o jogo diretamente.

Possível estrutura futura:

* **Jogar no navegador**
* **Download para PC**
* futuramente, caso seja viável:

  * versão Android;
  * versão iOS;
  * outras plataformas.

A versão web e a versão instalável devem compartilhar o máximo possível da mesma base do jogo, evitando manter projetos completamente separados.

### Regra de prioridade

A ordem deve ser:

**Otimização mobile → estabilidade geral → versão instalável para PC → distribuição pelo site → possíveis versões para outras plataformas.**

A transformação em software é uma **meta futura de produto**, não uma tarefa imediata do desenvolvimento atual.
