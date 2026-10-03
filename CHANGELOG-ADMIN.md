# Registro administrativo de alterações

## Correção da tela de vitória
- Restaurada a formação 3D da equipe vencedora sobre a arena da luta; a versão anterior mostrava um retrato recortado em um fundo separado.
- `src/game/World.js` posiciona e anima os modelos de vitória no cenário e ajusta a câmera ao redimensionar.
- `src/ui/Screens.js` e `src/styles.css` exibem texto e opções sem cobrir a arena; a HUD de combate é ocultada no resultado.
- Validação: `npm.cmd run build`, `npm.cmd run check` e simulações no navegador confirmaram a arena e os modelos em vitórias solo e em equipe.

## v1.9 — melhorias mobile e navegação
- Registro público correspondente adicionado a `CHANGELOG-CLIENTE.md`; as entradas v1.8 e v1.7 foram preservadas.
- `src/config/version.js` passou a anunciar a versão 1.9, com as novidades v1.9, v1.8 e v1.7 também disponíveis no menu do jogo.

## Interface responsiva sem rolagem
- As telas `.screen`, a página e o documento bloqueiam rolagem e overscroll.
- Seleção de personagens e cenários usam grades e espaçamentos responsivos; em telas baixas, previews e textos secundários são reduzidos.
- A caixa de comandos não rola; menus e novidades usam espaçamento e tipografia compactos em viewports baixos.
- Uma seta no canto superior esquerdo permite voltar das telas internas por toque; os atalhos existentes continuam funcionando.

## Controles touch e navegação
- O HUD de combate virtual só é exibido no estado `fight`; os menus não recebem direcional nem botões virtuais de confirmar.
- As opções e cartões de personagem/cenário continuam acessíveis por toque/clique direto; o changelog tem botões touch para trocar de versão.
- Menus touch exibem a seta de voltar quando aplicável e a opção de fullscreen.
- A opção local P1 vs P2 é ocultada nos modos solo e equipe em dispositivos touch.
- A interface touch bloqueia o modo retrato com um aviso para girar o dispositivo.
- O viewport desativa zoom e os gestos de pinça do Safari são prevenidos.
- Foi incluído um botão de fullscreen com atualização de estado, tratamento de erros e aviso quando a API não está disponível.
- As instruções de teclado/PC são ocultadas em dispositivos touch e substituídas por orientações de toque na tela inicial.

## Texto público
- Os textos do changelog exibido no jogo foram reescritos em linguagem voltada a jogadores, removendo contagens, nomes de estruturas internas, ferramentas e detalhes de implementação.
- `CHANGELOG-CLIENTE.md` contém a versão pública e o histórico de novidades para jogadores.
- Este arquivo administrativo registra as alterações de implementação e validação desta entrega.

## Arquivos de implementação
- `index.html`: bloqueio de zoom via configuração do viewport.
- `src/main.js`: detecção compartilhada de dispositivo touch e prevenção de gestos de zoom no iOS.
- `src/ui/touchControls.js`: visibilidade dos controles por estado, botão fullscreen e aviso de orientação.
- `src/ui/Screens.js`: menus adaptados a touch; ações de navegação na seleção de cenários.
- `src/styles.css`: layouts compactos e sem rolagem para telas, menus, seleções e comandos.
- `src/config/version.js`: linguagem simplificada nas novidades exibidas dentro do jogo.

## Validação
- `npm.cmd run build` — concluído; Vite reporta o aviso já conhecido de bundle acima de 500 kB.
- `npm.cmd run check` — verificações de elenco, diálogos e nomes concluídas.
- `git diff --check` — sem erros de whitespace.
- Testes no navegador confirmaram a orientação obrigatória em retrato, menus sem controles de combate, toque direto nas opções e P1 vs P2 local disponível no desktop, mas não em touch.
- Medições no navegador confirmaram que a seleção de cenários cabe na viewport em desktop e paisagem mobile sem sobreposição.
