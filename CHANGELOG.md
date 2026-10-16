# Changelog

## v3.27.0 — 2026-10-16

### Adicionado
- `src/ui/OptionsScreen.js`: a tela de OPÇÕES em seções, com linhas `slider` (barra arrastável por `pointer` com captura, ◀ ▶ de 5 em 5, toque no valor = mudo) e `choice` (até 4 → botões; mais → ◀ valor ▶), descrição da linha selecionada e o VOLTAR. Cada mudança chama `onChange(id, v)`; o idioma pede a tela de novo (`'relabel'`).
- `AudioManager`: canais `sfx` / `ui` / `hum` (ganhos entre os sons e o `master`), `setChannel(ch, k)`, `channelOf(name)` (`UI_SOUNDS`: select, confirm, denied, back, move); os blocos de síntese ligam no canal do som em montagem (`this.out`, guardado e devolvido em sons aninhados); os loops da Carga vão para `hum`.
- Opções `volSfx`, `volUi`, `volHum` (0–100); os volumes aceitam qualquer valor de 0 a 100 (a barra), não só de 10 em 10.
- Chaves `opt.sec.*`, `opt.vol.*`, `opt.desc.*`, `opt.*.label`, `opt.hint` nos 13 idiomas.

### Alterado
- `main.js`: `toOptions` monta a `OptionsScreen` (sai a lista do `MenuScreen` e os rótulos `opt.volume`/`opt.fx`/`opt.gfx` da tela).
- `menu.fanmade` mais curto em todos os idiomas ("Jogo fan made por romavitordev · inspirado em Ordem Paranormal") e o estilo `.fanmade` numa linha só, menor.
- `menu.options.desc`: "Som, imagem, tempo da luta e idioma."

## v3.26.1 — 2026-10-16

### Corrigido
- Vazamento de memória de GPU: a textura de ossos de cada `Skeleton` (`computeBoneTexture`) nunca era liberada — ~30 texturas a mais por luta (765 → 900+ em cinco lutas; agora estável em ~260). `glbRig.disposeSkeletons(root)` chamado em `World.dispose`, `DanteClone.dispose`, `HoloCopy.dispose`, `portraits` e `selectStage.dispose`.
- `glbRig`: as texturas pintadas (`MATERIAL_TEXTURES`) são feitas UMA vez por material e compartilhadas (`paintedTexture`), em vez de repintadas a cada cópia do modelo.
- Ciclo de imports `damage → guizoAbilities → abilities → beasts → npcs → damage`: `shuffleDodge` passou para `damage.js`.

### Adicionado
- Opção `graphics` (`GFX_OPTIONS`: auto · high · medium · low; `gfxProfile`, `gfxLevel`, `autoGraphics` — auto = low com ponteiro `coarse` ou `deviceMemory ≤ 4`): `pixelRatio` (2 / 1,5 / 1), `antialias` (só ao abrir o jogo), sombras (PCFSoft 2048 / PCF 1024 / sem), luzes pontuais dos cenários (8 / 2 / 1, as mais fortes), luzes de contorno da tela de título (8 / 2 / 0) e `maxFps` (sem limite / 60 / 60). Chaves `opt.gfx*` nos 13 idiomas. Nada que mude a luta nem o sorteio dos efeitos (o online depende disso).
- `WebGLRenderer({ powerPreference: 'high-performance' })`.

## v3.26.0 — 2026-10-16

### Adicionado
- Forma `dante_aberto` (`src/characters/forms/dante_aberto.js`), a Transformação do Dante (`maskTransform`, cena nova `eyes`): de olhos fechados, o Lodo sobe do chão e ele abre os olhos (o rosto troca ao vivo com `swapFace`, as orelhas pontudas por `swap`). Kit: Decadência `fromMouth`, Trinitá Aprimorado (4 cópias, `recast`), Tentáculos maiores, Paradiso `noAging`, Paradoxo, Eco Espiral, Rotura no ← + □ (`ranged.variants.back`), especial com `ranged`, passiva `deathMarked`.
- `src/combat/danteAbilities.js`: tipos `paradox` (`addParadoxZone`: espiral no chão, dano por segundo, lentidão, dano em invocações inimigas) e `echoPain` (buff `ecoDolor`; `damage.js` repete cada golpe do dono com `echo: true`).
- `Fighter.useAbility`: `recast` — com a habilidade recarregando, `ABILITY_TYPES[type].recast` pode dar um segundo uso (o Embaralhar troca de lugar com uma cópia, uma vez a cada 1,2 s).
- Embaralhar `fight: true` (só o Dante): as cópias são `DanteClone` (andam, cercam e batem a 50%; `shatter()` para levarem o golpe), escurecidas.
- A Marionete: golpe `slash` (projétil `boneCrescent`), só com `o.ranged` (invocada pela forma `dante_aberto`).
- Passiva `deathMarked` (dano de Morte × 0,8); `decadence.fromMouth`; `agingHeal.noAging`.
- Variante de modelo `dante_aberto` (`addDanteAbertoProps`: troca `face_dante`/`skin_dante` por `face_dante_open`/`skin_dante_open` e mostra `prop_eartip`); `addDanteProps` esconde as orelhas pontudas.
- Texturas `face_dante` (olhos fechados, cicatriz, sigilo), `face_dante_open`, `skin_dante` (sem tatuagens), `skin_dante_open` (as tatuagens), `shawl_dante`, `wraps_dante`.
- Fala de transformação do `dante_aberto`; `check-roster`: regras do Trinitá que luta e da forma.

### Alterado
- `tools/blender/char_dante.py` v2 (técnica do Cristino/Cristopher): camiseta por `clothe`, calça e cabelo esculpidos, o xale em casca (`shell_grid`) com a aba cruzada, cintos com `chain_mesh` → `public/models/dante.glb` (~47 mil triângulos; fonte `tools/blender/fonte/dante.blend`).
- `tools/blender/npc_marionette.py` v2, esculpida (tronco, crânio, mandíbula, cabelo, galhos dos braços, cabo e dorso da foice por metaballs; saia de tiras e lâmina em meia-lua por `shell_grid`) → `public/npcs/marionette.glb`. Mesmas juntas da v1.
- Dante: a Transformação deixa de ser o despertar "Afinidade com o Outro Lado" (`awakenMode`) e vira a forma Olhos Abertos.
- `guizoAbilities.js` pega `DanteClone` por `abilities.js` (importar `npcs.js` direto fechava um ciclo com `damage.js`).

## v3.25.1 — 2026-10-16

### Adicionado
- Tela de título: `.fanmade` dentro do logo (`menu.fanmade` nos 13 idiomas), escondido quando o menu abre.

### Alterado
- Dalmo e a forma Colosso: `element` `energia` → `sangue` (o personagem, a Pressão Atmosférica, os golpes das Manoplas e o soco do Colosso).

## v3.25.0 — 2026-10-16

### Adicionado
- `sobre.html` (+ `src/sobre.js`, `src/sobre.css`), terceira entrada do Vite: como o jogo funciona, modos, elenco (lido de `ROSTER`), controles e os downloads (`releases/latest/download/Arena-Paranormal-Windows.exe` / `Arena-Paranormal-Android.apk`); destaca o aparelho de quem vê e esconde os downloads dentro dos apps.
- Opção `about` no menu principal (`homeOptions`, `main.js` → `BASE_URL + sobre.html`); chaves `menu.about` / `menu.about.desc` nos 13 idiomas.
- Versão para PC com Electron: `electron/main.cjs` (protocolo privilegiado `app://` servindo `dist/`, porque o fetch dos `.glb` não funciona em `file://`; tela cheia, F11, links externos no navegador) e a configuração `build` do electron-builder (NSIS x64, `Arena-Paranormal-Windows.exe`); scripts `pc` e `dist:pc`.
- Versão Android com Capacitor: `capacitor.config.json` (`com.romavitordev.arenaparanormal`, `webDir: dist`); script `dist:android`.
- Workflow `.github/workflows/release-apps.yml`: numa tag `v*` (ou à mão) gera o `.exe` (windows-latest) e o `.apk` (ubuntu + JDK 17: `cap add android`, horizontal com `sensorLandscape`, `versionCode`/`versionName` do package.json, `assembleDebug`) e publica a release com as notas de `tools/release-notes.mjs` (a entrada mais nova do CHANGELOG).
- `vite.config.js`: `APP_BASE` sobrepõe o `base` (os apps servem o jogo na raiz mesmo com o build no GitHub Actions).

### Alterado
- Menu principal: em tela grande começa a 27vh e as opções usam `clamp(24px, 3.9vh, 30px)`; em tela baixa `clamp(15px, 5.6vh, 26px)` — as 10 opções cabem em 812×375.
- `deploy-pages.yml`: `ELECTRON_SKIP_BINARY_DOWNLOAD=1` no `npm ci` (o site não precisa do Electron).
- `.gitignore`: `release/` e `android/` (gerados).

## v3.24.1 — 2026-10-16

### Adicionado
- `awakenMode`: `drain` / `drainMax` / `drainRamp` / `drainFloor` (perde vida com o tempo sem passar do piso) e `lowHealth` `{ from, min, max }` (o multiplicador de dano sobe em linha reta conforme a vida cai).
- Opções `volume` (`VOLUME_OPTIONS`, `AudioManager.setVolume`) e `reduceFx` (`FX_OPTIONS`: `World.screenFlash` não pisca e `CameraRig.shake` a 25%); chaves `opt.volume` / `opt.fx*` nos 13 idiomas.
- `check-roster`: todo `type` de habilidade, □, especial e transformação existe nos registros e todo som dos kits existe (`AudioManager.SOUND_NAMES`).

### Alterado
- Cristopher: especial "Por Você, Filho!"; Transformação "Último Sacrifício" (`lowHealth` 1,25 → 1,8 a partir de 35% da vida, só físico; `drain` 3 → 5 em 40 s, piso 1; `knockbackTakenMult` 0,5; `armorEvery` 4).
- `props.liveCable` (cabo do Anfitrião): buffer de vértices fixo reescrito no lugar, sem criar um `TubeGeometry` por quadro.
- `TODO.md`: versão de referência v3.24.1; saíram os itens já prontos (§75 e quatro itens do §76.5).

## v3.24.0 — 2026-10-16

### Adicionado
- Lutador `cristopher` (`src/characters/cristopher.js`, Ordo Realitas, Sangue), na página 1 depois do Veríssimo.
- `src/combat/cristopherAbilities.js`: tipo `stuntCar` (o carro vem por trás, ele desvia, o carro atropela e capota na parede) e o modelo `stuntCar()`.
- Modelo `tools/blender/char_cristopher.py` → `public/models/cristopher.glb` (fonte `tools/blender/fonte/cristopher.blend`): relevo dos músculos com `relief`, a regata e o cabelo com `clothe` (cópia inflada e cortada da malha do tronco / da cabeça), calça e sapatos por escultura.
- `sculpt_lib.clothe` (roupa justa a partir de uma peça do corpo, com a malha avaliada e subdividida antes do corte).
- Texturas `face_/skin_torso_/arms_/tank_cristopher`; pose `vic_cristopher`; cena de agarrão `cristopher`; falas (introdução, vitória, batalha) e regras no `check-roster`.
- `tools/fetch-lore.mjs`: `cristopher` como id do Cristopher Cohen.

## v3.23.1 — 2026-10-16

### Alterado
- Rituais compartilhados na versão mais nova (v3.16/v3.19): Dante □ Decadenza `projectile` → `decadence`; Dante Embaralhar "Trinitá" `shadowClones` → `shuffle`; Cicatrização do Dante ("Paradiso") e do Xande `healOverTime` → `agingHeal`; Velocidade Mortal do Xande `selfBuff` → `deadlySpeedTrail`; `curseWeapon` de Aghata, Balu, Xande e Lírio com os números do Guizo (20 / 18 s / 8 s / sangramento 4 por 3 s).
- `Fighter.tryRanged`: um □ cujo `type` é um tipo de `ABILITY_TYPES` (que não seja `projectile`) roda como habilidade, com a recarga e o custo do □.
- Modelos refeitos: `char_juan.py` (relevo esculpido no tronco com `relief`, manto `shell_grid` rasgado, capuz/cabelo/calça/chaparreiras por escultura, correntes `chain_mesh`, grampos 3D) e `char_deus_morte.py` (corpo esculpido por partes com estrias e a espiral do peito por deslocamento, cor por vértice, espiral emissiva, fios de Lodo); fontes em `tools/blender/fonte/`.
- `sculpt_lib.py`: `rod`, `outward`, `ring_pts`, `shell_grid` (vindos do Cristino), `relief`, `chain_mesh`, `vcol_material` e `paint`.
- `glbRig`: `vertexColors` quando a malha tem `COLOR_0`; material com `fine_` no nome fica sem contorno.
- `weapons.peixeira`: lâmina de ~50 cm, dorso reto, guarda de latão e cabo de chifre.
- `check-roster`: regra dos rituais compartilhados; regras do Dante e do Xande atualizadas.

## v3.23.0 — 2026-10-16

### Adicionado
- Lutador `cristino` (`src/characters/cristino.js`, origem `Transtornados`, Sangue) e a forma `cristino_desertor` (`forms/cristino_desertor.js`); equipe `Transtornados` em `config/teams.js`, no título e na página 2 da seleção.
- `src/combat/cristinoAbilities.js`: `addFireZone` (fogo no chão), `lanternBlast`, `placeLantern`/`lanternsOf`/`explodeLantern`, `detonateLanterns` (detonação em cadeia num cone), `lobLantern` e os tipos `lanternThrow` e `lanternTrap`.
- Especial `lanternCount` (`specials/lanternCount.js`): três lampiões em cerco → cinemática com a contagem e o tiro → três explosões + a grande (250 dividido); fora do cerco, os lampiões viram armadilhas.
- Modelo `tools/blender/char_cristino.py` → `public/models/cristino.glb` (fonte `tools/blender/fonte/cristino.blend`); `tools/blender/sculpt_lib.py` (escultura orgânica por metaballs para os `char_*`); armas `socadeira`, `peixeira`, `spikedLantern`, `tenebrisPendant` (`weapons.js`); `addCristinoProps`/`addCristinoDesertorProps` (rabiscos vermelhos como mapa de brilho); texturas `face_/shirt_/jacket_/trim_/pants_/bandage_/hat_cristino`, `bloodSymbol` e `leather`.
- Pose `vic_cristino`, cena de agarrão `cristino`/`cristino_desertor`, falas (introdução, vitória contra os 25, batalha) e regras no `check-roster`.

### Alterado
- `teleportBehind`: `a.rope` (sobe pela corda e cai atrás em vez de afundar na sombra). `heavyBlow`: `a.bleed` e `a.downBonus` (mais dano em alvo atordoado, agarrado ou puxado).
- `Fighter.tryRanged`: `ranged.ignitesLanterns` detona os lampiões do lutador no primeiro disparo. `rig.showProp('a+b')` mostra/esconde as duas peças.
- Carniçal refeito: `npc_carnical.py` agora esculpe cada parte com metaballs (estrias por deslocamento, cor por vértice `COLOR_0`) e guarda `tools/blender/fonte/carnical.blend`; `buildNpcModel` liga `vertexColors` quando a malha tem cor por vértice.
- `tools/fetch-lore.mjs`: origem `Transtornados` (Cristino e a equipe); `lore/membros.json`/`MEMBROS.md` regerados; `lore/NOTAS.md` com o arsenal e o mapeamento do kit do Cristino.

## v3.22.0 — 2026-10-16

### Adicionado
- `summonMananciais` (Ferreiro), `summonCarnical` (Deus da Morte) e `summonInkBeasts` (Amigo) em `abilities.js`; NPCs `Carnical` e `InkBeast` em `src/combat/beasts.js` (modelos em `src/models/beasts.js`).
- Modelos: `char_manancial.py` (models/manancial.glb, fora da seleção), `npc_carnical.py`, `npc_bicho_lib.py` (+ `npc_javali_tinta.py`, `npc_cao_tinta.py`); texturas `face_/gown_/pants_manancial`; clipes `man_*`; som `siren`.
- `def.hpBar` (barras de vida dos Portadores, `.hb-*` em `styles.css`); `Fighter.untrackable()` e `STICKY_SPECIALS` (Shhh sem rastro); `DanteClone` aceita `o.anims` e `o.onSlain`; `hitBy(..., { bullet })` para o Corpo Fechado.

### Alterado
- `COMBAT.maxHealth` 1000 → 1500 e `roundTime`/`timer` 99 → 150 (`TIMER_OPTIONS` 45–180); vida individual removida do elenco (Portadores 1800; formas de Portador 1800–2100; outras formas 1500 + bônus); o número de vida saiu do HUD e da barra de chefe (`def.boss`).
- Senhor do Sangue: O Diabo só zumbis fracos; o Portador do Trono sempre com o forte.
- `.gitignore`: `__pycache__/` (os .pyc que entraram no commit anterior foram tirados do repositório).

## v3.21.0 — 2026-10-11

### Adicionado
- `src/combat/amigoPowers.js` (`AMIGO_TYPES`, registrado em `abilities.js`): `inkMelt` (Derreter), `inkTentacles` (Tentáculos que Prendem), `bellToll` (O Sino), `inkDissolve` (Dissolver) e `meltFace` (o debuff `meltedFace`).
- `src/combat/specials/inkRequiem.js`: especial Todo Mundo Vai Morrer (tentáculos erguem, garras, derreter, última badalada).
- `src/fx/inkFx.js`: `inkTentacle`, `inkSplash`, `ghostBell`, `bellWave`.
- `Fighter.updateInkStream` (`def.inkStream`: jorro de tinta do socket da boca até o chão com poça), golpes com `tentacle` (`spawnStrikeTentacle`) e `impactFx: 'ink'`.
- Clipes `ai_*` em `anim/charClips.js` (run/walk/strafe/dash, claw_r/l, lash/lash_l, rake, tear, up, down, air, fling, point, pour, bell, dissolve, block, charge, frenzy).
- Projétil `inkClaw` e `ropeColor`/`ropeThick` para a corda do `chain`; sons sintetizados `bellToll` e `inkPour`; cena de agarrão própria do `amigo` com o finalizador `ink`.

### Alterado
- `char_amigo.py`: capuz em visor com dentes, barbatanas nas costas e no capuz, cauda do manto, fitas, tendões na frente, 12 tentáculos enrolados, mangas rasgadas e garras curvas.

## v3.20.0 — 2026-10-11

### Adicionado
- Lutador `amigo` (`src/characters/amigo.js`, `tools/blender/char_amigo.py`, clips `ai_idle` e `vic_amigo`): elemento `tinta`, `drips` no socket da boca, falas completas.

## v3.19.1 — 2026-10-11

### Adicionado
- Elementos `transmissao` (#5aff6a) e `tinta` (#8a5a2a) em `src/config/elements.js` (neutros: fora do `BEATS`).
- Especial `mindTorture` (`src/combat/specials/mindTorture.js`): aviso com sigilo, paralisia com fios de sinal, 3 autogolpes com os golpes do próprio alvo, `forced_kneel`, apagar memória (recargas no máximo, `sp.forget`, sanidade 0) e o toque final.
- Habilidade `abductBeam` (Estrangeiro — Abdução, R2 + △): círculo de aviso, ergue (`launch` alto) e crava (`spike`).
- Clip `forced_kneel`.

### Alterado
- `estrangeiro`: elemento `transmissao`, especial `mindTorture`, golpe novo "Pulso de Sinal" (`wave_punch`, 3,6 m).
- `titleStage` LINEUP: um lutador de cada equipe (Xande, Kian, Arthur, Jae, O Diabo).

## v3.19.0 — 2026-10-11

### Adicionado
- Lutador `estrangeiro` (`src/characters/estrangeiro.js`, `char_estrangeiro.py`, `face_estrangeiro`, `vic_estrangeiro`).
- Modelo `o_diabo.glb` (`char_o_diabo.py`, `face_o_diabo`): o Diabo canônico; `o_diabo.awakening` = `devilPact` → forma `diabo`.
- Habilidade `summonMasks` (Magistrada — Chamar as Máscaras): `DanteClone` parametrizado (`restyle`, `setup`, `strikes`, `hp`, `rise`); texturas `mask_seita_*`.
- `cinematicCombo`: `sp.sphere` (esfera da Prisão das Sombras, animada pelo próprio especial).
- `maskTransform`: `sp.randomForms` (sorteio da forma); formas `guizo_bombado` e `guizo_velho` (variantes de modelo).
- `teleportBehind`: `a.vanishFx` ('sigil' / 'signal') e a borda do poço na cor da habilidade (`shadowDisc` `rim`).
- Joui: `Envelhecimento Localizado "Mateo"` (`healOverTime`).

### Alterado
- Magistrada: físico novo (bengala + Mão das Sombras, `impactFx: 'sigil'`), especial com a esfera.
- Gal: Velocidade Mortal → `deadlySpeedTrail`. Dante: `pocaLodo` → `rotura` (`decadence`).
- `gen-moves`: `launchHigh` e variações do □ que disparam habilidades; `HABILIDADES.md` regenerado.

## v3.18.0 — 2026-10-10

### Adicionado
- Equipe `Portadores das Relíquias` (`src/config/teams.js`, curta "Portadores"): `o_diabo`, `magistrada`, `arnaldo`, `ferreiro`.
- Lutadora `magistrada` (`src/characters/magistrada.js`, `tools/blender/char_magistrada.py`, `face_magistrada`, `bengala()`, `vic_magistrada`, agarrão do Arnaldo, falas completas e pares com Kian, Joui e Arnaldo).
- Lutador `o_diabo` (`src/characters/o_diabo.js`): kit da forma `diabo` + golpes frente/trás/lado; despertar `awakenMode` "Coroa de Espinhos"; agarrão, falas de introdução, vitória e batalha.
- Forma `juan_odio` (`src/characters/forms/juan_odio.js`) + variante de modelo `juan_odio` (`addJuanOdioProps`: `bloodHand`, `hoodUp`, `hateEye`); cena `maskTransform` `'hate'`.
- Transformação em dois estágios: `awakening.chain` (a Barra enche dentro da forma; `awakening.fill` acelera) — Juan → `juan_odio` → `diabo`.

### Alterado
- `juan.awakening`: `devilPact` → `maskTransform` (`scene: 'hate'`, `form: 'juan_odio'`); o `devilPact` virou o 2º estágio.
- `devilPact.canStart` aceita `sp.chain`; o trono afunda pelo flag `transformed` (não mais por `!f.baseForm`).
- Ordem do `ROSTER`: Arnaldo e Ferreiro saem da Ordo / Luzidios para os Portadores; título com "PORTADORES".

## v3.17.1 — 2026-10-10

### Alterado
- `char_juan.py`: cabelo em mechas (`hair_pt`/`strand`), franja sobre o olho esquerdo, meio rabo, raspado (`undercut` projetado no crânio); manga direita até o punho; tiras esfiapadas na barra e nas bordas do manto.
- `char_dante.py`: xale com abertura menor (`GAP` 0.13 → 0.075) e frente curta (poncho); `skin_dante` com manchas graúdas e espirais maiores.
- `char_erin.py`: cabelo de trás em mechas onduladas no lugar do tubo + cones.

### Corrigido
- Troncos do Juan e do Diabo com material de pele (`skin_torso_juan`, `skin_torso_diabo`): não ficam mais tingidos pela luz das arenas.

## v3.17.0 — 2026-10-10

### Alterado
- `katana()` / `scabbard()` (`src/models/weapons.js`): lâmina curva (`katanaShape`, corpo + hamon), tsuba octogonal, ito em losangos, saya curva com sageo.
- `char_joui.py`: capuz caído grande; `char_labirinto.py` reescrito com tronco próprio (robe transpassado); `char_arthur.py`: cabelo em mechas até o coque, barba em ponta, gola e suspensórios; `char_aghata.py`: jaqueta curta, gola alta, luvas, coturnos.
- Texturas `skin_labirinto` / `face_labirinto` (pele acinzentada), `plaid` (flanela cáqui), `arms_vampira` (sigilos menores).

### Corrigido
- `Fighter.setOpacity` religava o contorno de peças escondidas; o contorno agora guarda a malha de origem (`userData.source`) e só aparece com ela.

## v3.16.4 — 2026-10-10

### Alterado
- `char_lirio.py`: sem a malha de barba/bigode (só a barba rala pintada em `face_lirio`).
- `leonora()` (`src/models/weapons.js`): barril de tábuas, espinhos de metal nas cintas, tufo de pelo, faixa preta no cabo.

## v3.16.3 — 2026-10-10

### Adicionado
- Passiva `kianScript` (A Escrita, `src/combat/kianPowers.js`), visual `scriptWave`, `blink.strike`, `onHit.script`, marcas na Levitação.

### Alterado
- Modelo do Lírio refeito (`char_lirio.py`); `shirt_lirio` desenhada na orientação certa.

### Corrigido
- Tronco nu do Kian/Colosso com material de pele (`skin_torso_*`): não fica mais tingido pela luz das arenas.

## v3.16.2 — 2026-10-10

### Adicionado
- Forma `kian_calamidade` (Transformação do Kian, cena `calamity` no maskTransform; `unblockableMelee` no Fighter).
- Texturas `torso_kian` e `arms_kian` (com brilho).

### Alterado
- Modelo do Kian refeito (`char_kian.py`), rosto `face_desconjurado` refeito.
- Guizo: pele, cabelo, ombros, gola e barra da calça.

## v3.16.1 — 2026-10-10

### Alterado
- Furtividade (`stealth`) desenhada por quem olha a tela: silhueta + anel para o dono, invisível no online para o adversário (`world.viewSlot`); câmera usa a última posição vista contra a CPU (`Fighter.camPos`).
- Cego e surdo com efeito visual enquanto duram.

## v3.16.0 — 2026-10-10

### Adicionado
- Lutador GUIZO (Os Cinco) e a forma Disfarce Alienígena (`guizo_et`): modelo, câmera/faca/cabeça de ET em código, kit, falas, agarrão, vitória.
- `src/combat/holo.js` (cópias que copiam a pose do dono) e `src/combat/guizoAbilities.js` (decadence, doomSpirals, shuffle, deadlySpeedTrail, agingHeal, mindLink).
- Cena `distort` no maskTransform; `copies`/`outro` no cinematicCombo; visual `mindSigil`; `onHit.label`/`onHit.distort` nos projéteis; `grip.stow`/`grip.bothHands`.

### Alterado
- Modelo do Ferreiro refeito.
- CPU: carrega sanidade quando falta para as habilidades, gasta mais com a barra cheia, habilidade guardada por 1,6 s; chance base de habilidade maior em todos os níveis.

### Corrigido
- Cena de abertura Lírio × Xande (chave 'xande+lirio' → 'lirio+xande').

## v3.15.1 — 2026-10-10

### Adicionado
- Clipe `fist_clang`; `cinematicCombo` com `prepare.beats` e golpes de cena `noHit`.
- Sons sintetizados `metalPunch` e `fistClang`.
- `src/config/teams.js`: cor por equipe no fundo dos retratos.

### Alterado
- Colosso: manoplas de metal no modelo, especial com o choque dos punhos, `hitSound` de manopla em golpes e habilidades.
- Escolha de cenário em grade 3 × 2 com ▲ ▼ por linha.

## v3.15.0 — 2026-10-10

### Adicionado
- Lutador DALMO MAGNO / O COLOSSO (Mascarados, Energia): modelo, kit, transformação `helmet` com troca de roupa (`sp.swap`, `sp.finalAnim`), forma Colosso, falas, agarrões, vitórias e vilão das Torres.
- Tipos de habilidade `arenaGrab`, `stompQuake` e `arenaCounterStance`; □ do tipo `counter` (postura que segura o golpe e devolve com um `arenaGrab`); `heavyBlow` com `stun` e `pressure`.
- Assistência própria do Dalmo (Atropelar / cabeçada + soco).

### Alterado
- Modelo do Dalmo refeito: tronco com barriga e peito, ombros redondos, braços grossos, camisa folgada com gola grande e fralda para fora, calça cargo larga, coturnos de cano alto, dreads caindo pela testa.
- Juan de volta aos Mascarados; seleção com quebra de página por equipe e etiqueta de equipe.

### Corrigido
- Câmera com aspecto NaN (tela de tamanho zero) levava lutadores para posição NaN.

## v3.14.0 — 2026-10-09

### Adicionado
- Cenário ACAMPAMENTO VARMINHO (Sinais do Outro Lado): fogueira animada, barracas, van dos Cinco, Estação de Transmissão, céu estrelado.
- Cenários: estrelas, fogueiras animadas e várias camadas de partículas por config.

### Alterado
- Tiro carregado da sniper (Arthur, Kemi, Fantasma): laser com atraso, tiro no ponto do laser, aviso antes do disparo automático, bala mais lenta.

### Corrigido
- Modelo antigo de outro personagem aparecendo quando um .glb falhava (modelos procedurais removidos; download com novas tentativas e aviso).

## v3.13.0 — 2026-10-09

### Adicionado
- Modo TORNEIO local (2 a 8 participantes, solo/equipe, humano/CPU por vaga) com montagem em 3 passos e chave em árvore espelhada.
- Lutadora JAE (Park Jae-Yoon) e a forma X: modelo próprio, kit (Punhal X, Shhh..., Assassinato Furtivo, Zona dos Sussurros, A Marca do X; X: Zona das Sombras e Assassinato Cruel), cena de transformação do capuz, falas e agarrão.

### Alterado
- CPU guarda a habilidade escolhida no meio de um golpe e usa no primeiro quadro livre; transformação priorizada.

### Corrigido
- Transformação do Juan (Renascimento) congelava o jogo.
- Punhais arremessados da Jae não acertavam.

## v3.12.0 — 2026-10-09

### Alterado
- Efeitos sonoros gravados (CC0) no lugar dos sintetizados: golpes, espadas, whoosh, bloqueios, K.O., tiros (M4, escopetas, sniper), sons paranormais, garras, correntes, teleporte e o zumbido da Carga de Poder (em loop). A risada do Anfitrião continua a sintetizada.
- Efeitos visuais com texturas (CC0): fumaça, clarão de golpe, explosão, pedrinhas, faíscas elétricas; corte de lâmina com degradê e varredura.

## v3.11.0 — 2026-10-09

### Adicionado
- Modo TORRES: 8 torres com cadeado, torre em 3D com câmera subindo, lutador fixo, dificuldade para a torre inteira e vilão fortalecido no topo; melhor dificuldade zerada por torre.
- Interface traduzida em 13 idiomas, trocando na hora (avisos de combate e mensagens online incluídos).
- Pose de vitória própria do Arthur.

### Removido
- Opção de movimento "relativo ao inimigo".

### Corrigido
- Luta espelho travando na introdução.

## v3.10.1 — 2026-10-08

### Corrigido
- Fita da espada do Arnaldo/Veríssimo preta quando pendurada parada.

### Alterado
- Senhor Veríssimo: golpes e habilidades com nomes da série e do RPG (Olhos Sempre Abertos!, Em Seu Caminho, Brecha na Guarda, Oficial Comandante, Escopeta de Varredura, Líder da Ordo Realitas).

## v3.10.0 — 2026-10-08

### Adicionado
- Arnaldo Fritz (transforma em O Anfitrião) e Senhor Veríssimo.
- Gal: Ativar Ereshkigal (trás + □) liga a cura que cobra sanidade por 6 s.
- Falas curtas durante a luta (vida crítica, especiais, transformações).

### Alterado
- Vantagem/desvantagem elemental dos rituais: ±10% → ±15%; Xande de Conhecimento.
- Passo da defesa contínuo; escape do agarrão nas duas ordens.
- Balu arremessa a maça do Machado Demônio quando ela está na mão.

### Corrigido
- Tela preta na vitória com O Anfitrião; fita vermelha da espada voltando a ficar preta.

## v3.9.4 — 2026-10-06

### Alterado
- Balu, Resistência à Dor (transformação): agora vira um TANQUE — recebe 45% menos dano, quase não é empurrado, aguenta golpes sem recuar (guarda até 2, um novo a cada 1,5 s), recupera 25% da vida ao transformar e bate 20% mais forte; em troca anda um pouco mais devagar.

## v3.9.3 — 2026-10-06

### Alterado
- Balu com modelo novo, seguindo as referências: cabelo preto volumoso penteado para trás com gel, bigode grosso e cavanhaque só no meio do queixo, ombros e braços bem mais fortes, polo verde-clara de gola aberta e jeans até o cinto.
- Machado do Balu refeito: lâmina grande em barba com o fio de aço claro, miolo escuro com furos e gravações, ponta-lança no alto, gancho atrás e o cabo de madeira com faixas de pano enroladas.

## v3.9.2 — 2026-10-06

### Corrigido
- Online no celular: dá para escolher o lutador TOCANDO nele (antes o toque não fazia nada na partida online). O 1º toque olha, o 2º confirma.
- Online: os dois jogadores escolhem AO MESMO TEMPO, cada um na própria grade (marcada com "VOCÊ"), e confirmam — ninguém precisa esperar o outro. Depois, qualquer um toca em COMEÇAR.
- Online no celular: as configurações da batalha, a escolha do cenário, a pausa e a tela de vitória também aceitam toque.

## v3.9.1 — 2026-10-06

### Corrigido
- Celular: as opções do menu respondem ao PRIMEIRO toque (antes, no submenu, às vezes era preciso tocar duas vezes).
- Celular: a HUD da luta volta a mostrar as habilidades, numa faixa compacta com o comando de cada uma, a recarga e o contorno de pronta.
- Celular: os comandos na HUD e nas dicas aparecem com os botões da tela (△ □ ○ × DEF ESQ) em vez das teclas do teclado.
- HUD: quem paga rituais com vida (Arthur, Erin Em Nome do Caos) não aparece mais com as habilidades bloqueadas por "sem sanidade".

## v3.9.0 — 2026-10-06

### Alterado
- Tela inicial nova: os lutadores em 3D contra a luz (contorno na cor do poder de cada um) sobre o círculo ritual brilhando, cinzas subindo, neblina e a câmera se aproximando devagar; logo redesenhado ("ARENA" sobre "PARANORMAL" metálico com brilho e glitch, a linha dos cinco elementos), vinheta e granulado de filme. Com o menu aberto, o logo vai para o canto e o menu vira uma coluna à esquerda.
- Corrigido: depois de uma partida, os personagens podiam ficar invisíveis na seleção (só a arma aparecia).
- Corrigido: a Erin (e o Labirinto/Aguiar) voltava mascarada no round seguinte depois de transformar.
- Erin, Em Nome do Caos: o especial agora também começa com a granada de luz — dá para sair de baixo, esquivar ou defender. Se cegar: ela corre até o adversário, dá o tiro de escopeta e se explode. Se errar, ela fica exposta e não se explode.
- Labirinto (???): a Tempestade Caótica do □ virou um RAIO CONTÍNUO que sai da Antena por uns 2 segundos e persegue o adversário (correndo de lado ou com dash dá para escapar; a defesa segura). Sem o capacete continua sendo a bola de energia.

## v3.8.2 — 2026-10-06

### Alterado
- Erin: o especial Supernova agora precisa ser PEGO. Ela arremessa primeiro uma granada de luz (no ar, sem parar o tempo) no lugar onde o adversário está. Dá para escapar: sair de baixo, esquivar na hora ou defender de frente para ela (cobre os olhos). Se errar, ela fica parada e aberta. Se o clarão cegar o adversário, aí sim vem a cutscene: ela corre até ele, dá o tiro de escopeta à queima-roupa e o explode com a granada do coração vermelho.

## v3.8.1 — 2026-10-06

### Alterado
- Erin: a transformação Em Nome do Caos agora tem cena própria — ela ajoelha rindo descontrolada com a mão agarrando o rosto, levanta e VESTE a máscara de gás, que acende em verde (sem o vermelho dos Mascarados: ela não é uma deles). A máscara fica no rosto o round inteiro.
- Máscara de gás da Erin remodelada como nas referências: borracha preta dos olhos ao queixo, duas lentes redondas com aro brilhando em verde, filtro na frente da boca, cartucho grande na bochecha e tubos verdes brilhantes descendo até o peito.

## v3.8.0 — 2026-10-06

### Alterado
- Transformações dos Mascarados refeitas seguindo as animações de referência: o Labirinto segura o capacete sorridente no peito, ergue acima da cabeça e encaixa; o Aguiar agacha com o machado esticado e leva a máscara ao rosto; a Kemi solta as faixas dos braços, que chicoteiam num rastro vermelho, e abre o braço como a Fantasma. Quando a máscara encaixa a cena fica vermelha e o assassino fica com uma aura vermelha até o fim do round.
- Juan: a Armadura de Sangue Diabólica agora explode do ombro em espinhos de sangue antes de endurecer. Transformado, o nome dele é PORTADOR DO TRONO.
- Erin, Em Nome do Caos: SEM SANIDADE — a barra fica zerada e travada e tudo que gastaria sanidade (granadas, Bênção Maldita, dash longo) sai da VIDA; os golpes ficaram ainda mais fortes. O especial ganhou uma cutscene: se ela alcança o adversário, o tempo para, close na máscara de gás (ela ri), nas três granadas sem pino, nos dois — e a explosão vista de longe.

## v3.7.1 — 2026-10-06

### Alterado
- Mascarados: ao pôr a máscara na Transformação, o nome na tela muda para o do assassino — A FANTASMA (Kemi), ??? (Labirinto) e MUTILADOR NOTURNO (Aguiar).

## v3.7.0 — 2026-10-06

### Alterado
- Mascarados: a máscara agora é só da TRANSFORMAÇÃO (como no cânone, é ela que desperta a Intenção de Assassino) — e ficou bem mais forte, trocando o kit inteiro até o fim do round.
- Labirinto: o Capacete do ??? saiu do kit normal. Sem o capacete: Rajada Caótica, Labirinto Mental, Mapa Sanguíneo e Capturar Momento (e o especial não põe mais o capacete). Na Transformação vira o ???: Tempestade Caótica no □, Labirinto Abissal, Consumir Momento, Tempestade Caótica em área, Revelação Sanguínea, golpes 25% mais fortes e especial mais forte.
- Aguiar: a Máscara do Mutilador Noturno saiu do kit normal (no lugar: Ataque Especial, um golpe pesado de machado; o especial virou Caçada no Acampamento). Na Transformação vira o MUTILADOR NOTURNO: todo golpe do machado sangra, Ataque Mutilador, Predador Perfeito, resiste aos golpes e o especial Finalização do Mutilador fica mais forte.
- Erin: nova Transformação EM NOME DO CAOS — põe a máscara de gás e enlouquece: cortes mais rápidos e explosivos, granadas mais fortes, sem cura. Especial Em Nome do Caos: puxa os pinos de três granadas, corre até o adversário e se explode (450 de dano; esquiva desvia, defesa segura metade). Ela morre na explosão: se o adversário também cair, a Erin ganha o round; se ele sobreviver, ela perde.
- Especiais que acertam de longe agora têm AVISO: Descarnar (Aghata), O Labirinto é a Resposta, Contrato de Morte e Disparo Espiral (Kemi / Fantasma), Supernova (Erin), Shi no Kage (Joui) e Cinerária com a Acácia (Kaiser). Depois do preparo, quem usa faz o gesto — a Aghata ergue o braço, a Kemi ajoelha e mira — e um sigilo pulsa no chão do alvo (ou a mira brilha nele). Esquive ou use a Substituição no fim do aviso para desviar (quem usou fica exposto), ou defenda de frente. O Descarnar continua acertando de qualquer distância.
- Acertar quem está no aviso interrompe o especial, como no preparo. A CPU também reage ao aviso (mais nas dificuldades altas).
- Esquiva: ao gastar TODAS as cargas, por 3 s o dano recebido não conta para recarregar (a barra fica vermelha).

### Documentação
- Pesquisa e propostas de kit para Arnaldo Fritz (→ O Anfitrião) e Senhor Veríssimo; plano de redesenho da tela de início, da HUD e da identidade do jogo (`TODO.md`).

## v3.6.0 — 2026-10-06

### Alterado
- Esquiva: as cargas voltam mais rápido conforme você apanha — 1 carga a cada 70 de dano (antes 120).
- Habilidades △ → ○ e △ → □: o segundo botão precisa vir logo depois do △ (até 0,4 s). Antes, dava para apertar △, andar alguns segundos e soltar a habilidade com ○ sem querer.
- Defesa + direção (como no Storm 4): segurando R2/RT, o analógico não faz mais andar — o personagem emenda passos rápidos para os lados e para trás, sempre de frente para o rival.
- Substituição: também funciona atordoado e agora interrompe o combo do adversário (ele bate no “tronco” e fica exposto), então dá mesmo para escapar no meio da sequência.

## v3.5.1 — 2026-10-05

### Corrigido
- Substituição: ao usar L2 enquanto apanha, o lutador desvia do golpe com um passo curto para o lado (para onde o direcional aponta) e reaparece perto de onde estava — não teleporta mais para as costas do adversário. Também corrige a substituição, que não estava funcionando.

## v3.5.0 — 2026-10-04

### Adicionado
- Modo online pronto: crie ou entre em salas públicas e privadas por código e jogue partidas sincronizadas pela internet.

### Alterado
- Substituição: ao usar L2 enquanto apanha, reaparece atrás do adversário em um ponto livre da arena, interrompe o combo e ganha invulnerabilidade breve.

## v3.4.1 — 2026-10-04

### Corrigido
- Substituição: ao usar L2 enquanto apanha, o lutador cancela o golpe e reaparece no mesmo lugar, sem teleportar para trás do atacante.

## v3.4.0 — 2026-10-04

### Corrigido
- Tela de vitória: só a forma de quem venceu transformado.

### Alterado
- Super Difícil mais forte (reações, punição, esquiva de tiros, combos longos, +15%/−15%).
- Deus da Morte: especial Envelhecimento (agarra pelo pescoço, envelhece o alvo até o fim do round).

## v3.3.0 — 2026-10-04

### Adicionado
- CPU Super Difícil que aprende (ações por situação e o perfil do jogador), salvo no navegador e em public/ai/learned.json.

### Alterado
- Esquiva só gasta carga quando desvia de algo.

## v3.2.1 — 2026-10-04

### Alterado
- Dante: Decadenza soprada de médio alcance (8 m), nuvem que abre; CPU respeita o alcance do □.

## v3.2.0 — 2026-10-04

### Alterado
- Agarrão próprio para cada personagem (e formas), com finalizador dos seus poderes.

## v3.1.0 — 2026-10-04

### Alterado
- Agarrão em cutscene (câmera, dois golpes no estilo do personagem, arremesso).

## v3.0.0 — 2026-10-04

### Adicionado
- Despertar (Barra de Transformação) para os 13 personagens sem forma própria, com estados do cânone.

## v2.7.0 — 2026-10-04

### Adicionado
- Barra de Transformação (Juan, Kemi, Ferreiro): cheia + vida ≤ 35% → segurar △ passa da sanidade cheia e transforma.
- Especiais Hemorragia Severa (Juan), Contrato de Morte (Kemi), Consumir (Ferreiro); Levitação (Kian).

### Removido
- Transcender (todos) e a Transcendência do Kian; transformações pelo especial.

### Alterado
- Diabo: asas de braços e boca vertical no modelo.

## v2.6.0 — 2026-10-03

### Alterado
- Fantasma: Faixas enrolam o alvo como múmia (até 2,2 s; apertar botões solta antes).
- Teleportes com rastro (Kian, Fantasma); câmera de cinema na tela de vitória.

## v2.5.0 — 2026-10-03

### Alterado
- Curas com visual e regra próprios (Erin a mais forte; Dante parado; Ferreiro quebra ao apanhar).
- Ferreiro: Hipnose Espiral própria; Labirinto: Tempestade Caótica em área; Aghata: facas que voltam.
- Fantasma: Disparo Espiral com a bala dando a volta na arena e a câmera seguindo.

## v2.4.0 — 2026-10-03

### Adicionado
- Novo lutador: Balu (Antônio Pontevedra) — pesado da Ordo Realitas, Machado em Giro, Machado Demônio (paga com vida),
  Fala Imponente, 110%, Colete, especial Pancada do Urso, falas e assistência.
- Seleção em duas páginas (16 lutadores).

## v2.3.2 — 2026-10-03

### Equilíbrio
- Combos mais rápidos para leves/médios (`stats.attackSpeed`); pesados com mais vida (Lírio 1350, Ferreiro 1250, Aguiar 1150).
- Juan 82% → 61%: mais lento, menos cura/sangramento, Vínculo 30%, armadura automática mais fraca.
- Gal 29% → 41%: Velocidade Mortal e a sanidade drenada vai para ele.

## v2.3.1 — 2026-10-03

### Alterado
- HUD: nomes de habilidade em até 2 linhas (nome inteiro no title).
- Build dividido: three.js e personagens em arquivos próprios (sem o aviso de 500 kB).

## v2.3.0 — 2026-10-03
### Alterado
- Santo Berço com névoa; CPU limpa invocações fracas; Arthur paga rituais com vida sem sanidade.
- Diabo: Veias de Sangue saindo do próprio alvo; garras pingando sangue.
- Juan: Lâmina de Sangue em meia-lua (sangramento); Armadura de Sangue nasce sozinha ao sangrar (220 de dano).
- Aghata: Passagem de Conhecimento e Leitura de Rituais (cânone).
- Aguiar mascarado: o machado sangra também arremessado.

## v2.2.0 — 2026-10-03

### Alterado
- O Diabo (Juan) reformulado pelo cânone de Hexatombe: Pacto com escolha (aceitar/recusar), Lança de Sangue que
  empala e deixa poça (3 variações por direção), poças de sangue, Ódio do Diabo no alvo, Transportar pelo Sangue que
  arrasta o adversário, Regeneração mais forte ferido e ódio ao Conhecimento (+15%).
- Armadura de Sangue do Juan pela referência (carne porosa num lado do corpo, espinhos, veias, garras); quem conjura
  ganha o braço da faca de sangue (+25% físico); pela assistência, só resistência a golpes físicos e tiros.
- Arthur: sem Armadura de Sangue (não é do cânone); entra Analisar Brecha (+25% de dano físico no alvo por 7 s).

### Equilíbrio
- Diabo (medido já na forma desde o 1º round): 86% → 75% — sangramento da Lança 4→3/s (1,5 s), Ódio +20→+15%,
  roubo de vida 0,12→0,08, vida 1250→1150. Dante 46% e Juan (base) 64% na faixa.
- Defesa + toque na direção = passo rápido (Storm).
- Poça de Lodo do Dante é uma poça no chão; Zumbis sobem/morrem em poças; foice da Marionete risca o chão; agarrão
  da Marionete solta mais cedo apertando botões.

## v2.1.0 — 2026-10-03

### Alterado
- A Marionete (Dante) refeita no Blender e com IA nova: anda aos trancos, atravessa obstáculos, Reflexos Perfeitos e
  Ironia do Destino (agarra, arrasta e repassa 50% do dano que leva).
- Zumbis de Sangue (Diabo) refeitos: fraco e forte; Senhor do Sangue invoca 1–3 fracos ou 2 fracos + 1 forte.

### Corrigido
- Retratos da seleção com um personagem "fantasma" atrás (canvas não era limpo).
- Recursão sem fim ao montar o contorno dos modelos de invocação.

## v2.0.0 — 2026-10-03

### Corrigido
- Recuperados os IDs novos, as 420 introduções, as vitórias variadas e os valores da Fantasma desfeitos pelo commit
  `29f1170` (mantida a parte mobile dele).
- Tela de vitória com câmera dentro do cenário (no Bar Suvaco Seco ficava atrás da parede) e vencedor no centro.
- Mobile: menu cabe no celular deitado; seleção 5 × 3 sem 3D vazando; botões de combate fora da apresentação (toque
  pula); tela cheia fora da vida do P2; textos de toque no título.
- Ficha da seleção sem cortar habilidades/especial; COMANDOS rolável; especiais de transformação/invocação descritos.
- Campos do Online com fonte legível.

### Adicionado
- Pose de vitória própria para cada personagem.
- Nomes da equipe vencedora sob cada modelo.

### Desempenho
- Raios da câmera a 10 Hz: simulação ~4× mais leve.

## v1.6.0 — 2026-10-03

### Corrigido
- Restaurada a tela de vitória com a equipe vencedora em pose 3D no cenário atual, em vez de um retrato sobre fundo separado.

## v1.5.0 — 2026-10-03

### Adicionado
- 420 cenas de introdução pré-luta para os 210 confrontos, em um sistema separado das falas de vitória.
- Duas variações de vitória para cada confronto, escolhidas aleatoriamente.
- Tempo de leitura ajustado ao tamanho das falas, pausa antes de “LUTEM” e HUD de combate oculta durante a cena.

## v1.4.0 — 2026-10-03

### Adicionado
- Tela de vitória com o cenário atual, equipe vencedora completa em poses e fala do personagem ativo.
- Apresentação da primeira luta com entradas caminhando, falas originais e chamada “LUTEM”; a cena pode ser pulada
  com ×/Start.
- Falas originais de introdução e vitória contextualizadas pelas relações conhecidas e personalidade dos personagens.

### Corrigido
- Equipe vencedora agora mostra os integrantes corretos sem repetir o personagem que estava ativo no fim da luta.
- CPUs não controlam a navegação do menu de pausa; o controlador é restaurado ao continuar.

### Renomeado
- IDs e arquivos internos dos personagens atualizados: `desconjurado` → `kian`, `abutre` → `arthur`,
  `cineraria` → `kaiser`, `mascarado` → `joui`, `vampira` → `aghata` e `injustica` → `gal_sal`.
- Imports, registros de modelos, scripts Blender e assets `.glb` atualizados em conjunto.

### Validação
- `npm run build`
- `npm run check`
- `git diff --check`
