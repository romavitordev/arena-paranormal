import * as THREE from 'three';
import { Timeline, forwardFromYaw } from '../../core/util.js';
import { faceClose, orbit, lowAngle, socketClose } from '../../camera/shots.js';
import { transform } from '../forms.js';
import { hostMask } from '../../models/weapons.js';
import { MATERIAL_TEXTURES } from '../../models/textures.js';

// PÔR A MÁSCARA (transformação). Para os Mascarados a máscara é o momento em que a Intenção de Assassino desperta —
// só acontece aqui, na Transformação (Barra cheia + vida baixa, segurando △), nunca como habilidade comum:
// Labirinto → ??? (capacete) · Aguiar → Mutilador Noturno.
// A Erin (Ordo Realitas, NÃO é Mascarada) usa a mesma cena para pôr a máscara de gás e virar Em Nome do Caos.
//
// As cenas seguem as referências visuais de animação dos Mascarados (análise em
// Referencias visuais/ANALISE.md): quando a máscara encaixa, a cena fica VERMELHA (luz vermelha forte, clarão) e o
// assassino fica com uma AURA vermelha em volta até o fim do round.
//   sp.scene  'helmet' (Labirinto: segura o capacete no peito, ergue acima da cabeça e encaixa; o Dalmo usa a mesma
//             cena com o escafandro, troca a roupa e termina agachado de braços abertos — sp.swap / sp.finalAnim)
//             'mutilador' (Aguiar: close no olho, agacha com o machado esticado e leva a máscara ao rosto)
//             'gasmask' (Erin, que NÃO é Mascarada: ajoelha rindo com a mão no rosto, ergue-se levando a máscara de gás
//             ao rosto; verde no lugar do vermelho — referências do usuário)
//             'hood' (Jae → X: puxa o capuz, sorri e o rosto some com o X; sp.swap troca as peças do capuz)
//             'watch' (Arnaldo → O Anfitrião: tira o relógio de bolso, abre a tampa, a Relíquia de Energia brilha lá
//             dentro e ele ergue o relógio; a Energia toma o corpo em roxo, rosa e azul)
//             omitido: concentra e o acessório aparece
//   sp.prop   acessório do modelo base que entra no rosto (helmetOn / maskOn)
//   sp.anim   animação da cena padrão (padrão 'concentrate')
//   sp.formBanner  letreiro ao virar a forma
//   sp.tint   cor da cena e da aura quando a máscara encaixa (padrão vermelho; Erin: verde)
const RED = 0xff1a1a;

// leva o acessório (que mora no osso da cabeça) para outro ponto do mundo sem tirá-lo do lugar: a cada quadro a peça
// fica no ponto de descanso + `offset` (em coordenadas do mundo); offset zero = encaixada no rosto
function carryProp(prop) {
  if (!prop) return null;
  const parts = prop.parts || [prop];
  // malha presa ao esqueleto (ex.: a máscara do Aguiar) não sai do rosto: ela só aparece quando a mão chega lá
  if (parts.some((m) => m.isSkinnedMesh)) return null;
  const rest = parts.map((m) => m.position.clone());
  const tmp = new THREE.Vector3();
  return {
    set(offset) {
      parts.forEach((m, i) => {
        const parent = m.parent;
        if (!parent) return;
        parent.updateWorldMatrix(true, false);
        tmp.copy(rest[i]);
        parent.localToWorld(tmp).add(offset);
        m.position.copy(parent.worldToLocal(tmp));
      });
    },
    reset() { parts.forEach((m, i) => m.position.copy(rest[i])); },
  };
}

// troca a textura do rosto do modelo (ex.: o sorriso da Jae debaixo do capuz); devolve a função que desfaz
const _faceTex = {};
function swapFace(rig, from, to) {
  if (!MATERIAL_TEXTURES[to]) return () => {};
  if (!_faceTex[to]) {
    const t = MATERIAL_TEXTURES[to]();
    _faceTex[to] = t.isTexture ? t : t.map;
    _faceTex[to].flipY = false;
    _faceTex[to].needsUpdate = true;
  }
  const changed = [];
  rig.root.traverse((o) => {
    if (!o.isMesh || !o.material || o.userData.isOutline || !o.material.name || !o.material.name.endsWith('_' + from)) return;
    if (changed.some((c) => c.m === o.material)) return;
    changed.push({ m: o.material, map: o.material.map });
    o.material.map = _faceTex[to];
    o.material.needsUpdate = true;
  });
  return () => changed.forEach((c) => { c.m.map = c.map; c.m.needsUpdate = true; });
}

export const maskTransform = {
  canStart: (f) => !f.baseForm,
  blockMsg: 'JÁ TRANSFORMADO',
  start(f, sp, world) {
    const tl = new Timeline();
    const col = sp.color ?? f.def.energyColor ?? 0xffffff;
    const scene = sp.scene || null;
    const tint = sp.tint ?? RED;
    world.beginCinematic(f, null);
    f.vel.set(0, 0, 0);
    const head = () => f.rig.joints.hd.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.1, 0));
    const fwd = forwardFromYaw(f.yaw, new THREE.Vector3());
    const hy = head().y - f.pos.y; // altura do rosto deste personagem (os planos de câmera usam ela)
    const prop = sp.prop ? f.rig.props[sp.prop] : null;
    const carry = scene ? carryProp(prop) : null;
    const offset = new THREE.Vector3();
    let offsetFrom = null;
    let offsetTo = null;
    let tweenT = 0;
    let tweenDur = 0;
    const moveProp = (to, dur) => { offsetFrom = offset.clone(); offsetTo = to; tweenT = 0; tweenDur = dur; };

    // luz da cena: começa fraca na cor do poder e vira vermelho forte quando a máscara encaixa
    const light = new THREE.PointLight(col, 0, 9, 1.6);
    world.scene.add(light);
    let lightTo = 6;
    let lightColor = new THREE.Color(col);
    const aura = world.fx.emitter({ rate: 30, follow: () => f.chestPos(), particle: { color: col, speed: 1, up: 1, spread: 0.7, life: 0.6, size: 0.22 } });

    const maskOn = (big = true) => {
      if (prop) f.rig.showProp(sp.prop, true);
      // sp.swap: troca de roupa junto (Dalmo → Colosso: some a camisa, aparece o traje); sp.finalAnim: pose depois de
      // encaixar (o Colosso agacha de braços abertos e urra)
      for (const [p, v] of sp.swap || []) if (f.rig.props[p]) f.rig.showProp(p, v);
      if (sp.finalAnim) f.anim.play(sp.finalAnim, { restart: true, duration: 0.5 });
      world.audio.play(sp.sound || 'maskOn');
      world.fx.flash(head(), { color: tint, size: big ? 3 : 2, life: 0.22 });
      world.fx.burst(head(), { count: 50, color: tint, speed: 5, life: 0.7, size: 0.24, gravity: 3 });
      world.screenFlash && world.screenFlash('#' + new THREE.Color(tint).multiplyScalar(0.55).getHexString(), 0.25);
      world.cameraRig.shake(0.35, 0.3);
      lightColor = new THREE.Color(tint);
      lightTo = 14;
    };

    let total;
    let transformAt = null; // cena com epílogo: transforma antes do fim e mostra a forma nova (watch)
    let epilogue = null;
    const scrap = []; // peças temporárias da cena (removidas no fim ou se a cena for interrompida)
    if (scene === 'helmet') {
      // 1) segura o capacete sorridente no peito e olha por cima do ombro · 2) clarão · 3) ergue acima da cabeça e
      // encaixa · 4) a aura vermelha toma conta
      f.anim.play('mask_hold', { restart: true, duration: 0.5 });
      if (prop) f.rig.showProp(sp.prop, true);
      offset.copy(fwd).multiplyScalar(0.45).add(new THREE.Vector3(0, -0.55, 0));
      world.cameraRig.playShots([
        faceClose(f, { dur: 1.3, from: 2.9, to: 2.4, side: 0.7, height: hy - 0.3 }),
        lowAngle(f, { dur: 0.9, dist: 3.0, side: -0.6 }),
        faceClose(f, { dur: 1.0, from: 2.2, to: 1.6, side: 0.2, height: hy - 0.05 }),
      ]);
      tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(1.1, () => { world.screenFlash && world.screenFlash('#300000', 0.15); world.fx.distort(f.chestPos(), { color: RED, radius: 1.8, life: 0.25 }); });
      tl.add(1.3, () => {
        f.anim.play('mask_lift', { restart: true, duration: 1.0 });
        moveProp(fwd.clone().multiplyScalar(0.12).add(new THREE.Vector3(0, 0.55, 0)), 0.55);
      });
      tl.add(1.95, () => moveProp(new THREE.Vector3(), 0.3));
      tl.add(2.3, () => maskOn(true));
      total = 3.1;
    } else if (scene === 'mutilador') {
      // 1) close no olho no escuro · 2) agacha baixo com o machado na corda esticado de lado · 3) a mão leva a máscara
      // branca ao rosto · 4) tudo fica vermelho
      f.anim.play('mutilador_mask', { restart: true, duration: 1.6 }); // a mão chega ao rosto junto com a máscara (1,5 s)
      offset.copy(fwd).multiplyScalar(0.4).add(new THREE.Vector3(0, -0.35, 0));
      lightTo = 2;
      world.cameraRig.playShots([
        faceClose(f, { dur: 0.7, from: 1.5, to: 1.25, side: 0.2, height: hy - 0.35, fov: 32 }), // ele já está abaixando
        lowAngle(f, { dur: 1.2, dist: 3.2, side: 1.3 }),
        faceClose(f, { dur: 1.0, from: 2.0, to: 1.5, side: -0.4, height: hy - 0.45 }),
      ]);
      tl.add(0.25, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(0.75, () => {
        lightTo = 5;
        if (carry) { f.rig.showProp(sp.prop, true); moveProp(new THREE.Vector3(), 0.7); }
      });
      tl.add(1.5, () => maskOn(true));
      total = 2.6;
    } else if (scene === 'gasmask') {
      // 1) ajoelhada, a mão agarrando o rosto, rindo · 2) levanta levando a máscara de gás das mãos ao rosto ·
      // 3) as lentes acendem em verde
      f.anim.play('madness_kneel', { restart: true, duration: 1.2 });
      offset.copy(fwd).multiplyScalar(0.42).add(new THREE.Vector3(0, -0.45, 0));
      lightColor = new THREE.Color(tint);
      lightTo = 4;
      world.cameraRig.playShots([
        faceClose(f, { dur: 1.2, from: 2.0, to: 1.6, side: 0.45, height: hy * 0.62, fov: 40 }),
        faceClose(f, { dur: 1.3, from: 1.6, to: 1.15, side: -0.25, height: hy - 0.05, fov: 36 }),
      ]);
      world.audio.play('fearGaze', { volume: 0.7, pitch: 1.7 }); // a risada
      tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(0.6, () => world.audio.play('fearGaze', { volume: 0.6, pitch: 1.9 }));
      tl.add(1.2, () => {
        f.anim.play('mask_lift', { restart: true, duration: 1.0 });
        if (carry) { f.rig.showProp(sp.prop, true); moveProp(new THREE.Vector3(), 0.6); }
      });
      tl.add(1.85, () => maskOn(true));
      total = 2.6;
    } else if (scene === 'hood') {
      // JAE → X (o gif "jae colocando mascara"): 1) segura o capuz caído pelas bordas, olhando para a câmera · 2) puxa
      // por cima da cabeça — o rosto ainda aparece, sorrindo debaixo do capuz · 3) "Shhh..." · 4) tudo fica vermelho, o
      // rosto some na escuridão e o X acende
      f.anim.play('hood_grab', { restart: true, duration: 0.5 });
      lightTo = 2;
      world.cameraRig.playShots([
        faceClose(f, { dur: 1.0, from: 1.7, to: 1.35, side: 0.15, height: hy - 0.2, fov: 36 }),
        faceClose(f, { dur: 1.1, from: 1.3, to: 0.95, side: -0.12, height: hy - 0.02, fov: 32 }),
        lowAngle(f, { dur: 1.0, dist: 2.9, side: 0.7 }),
      ]);
      tl.add(0.25, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(0.8, () => {
        f.anim.play('hood_pull', { restart: true, duration: 0.6 });
        world.audio.play('swing', { volume: 0.5, pitch: 0.7 });
      });
      tl.add(1.15, () => {
        for (const [p, v] of sp.swap || []) if (f.rig.props[p]) f.rig.showProp(p, v);
      });
      // o sorriso aparece debaixo do capuz (o rosto ainda está à mostra até o X acender)
      tl.add(1.3, () => {
        if (sp.grin) { const undo = swapFace(f.rig, sp.grin[0], sp.grin[1]); scrap.push(undo); }
      });
      tl.add(1.5, () => world.audio.play('shhh', { volume: 1 }));
      tl.add(2.15, () => maskOn(true));
      total = 3.0;
    } else if (scene === 'distort') {
      // GUIZO — DISTORCER APARÊNCIA (o ritual da wiki: muda altura, pele, cabelo, voz...): 1) concentra · 2) passa a
      // mão na frente do rosto e a imagem dele CHIA como uma fita (distorções em volta da cabeça) · 3) quando a mão
      // sai, o rosto é o do alienígena (o disfarce de ET das referências) · 4) ergue a câmera e se filma, empolgado
      f.anim.play('concentrate', { restart: true, duration: 0.5 });
      lightTo = 3;
      world.cameraRig.playShots([
        faceClose(f, { dur: 1.0, from: 2.0, to: 1.6, side: 0.4, height: hy - 0.15, fov: 38 }),
        faceClose(f, { dur: 1.3, from: 1.5, to: 1.1, side: -0.2, height: hy - 0.04, fov: 34 }),
        lowAngle(f, { dur: 0.9, dist: 2.8, side: 0.6 }),
      ]);
      tl.add(0.25, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(0.5, () => {
        f.anim.play('face_wipe', { restart: true, duration: 0.8 });
        world.audio.play('blink', { volume: 0.8, pitch: 0.7 });
      });
      for (const t of [0.6, 0.72, 0.84, 0.96, 1.08]) {
        tl.add(t, () => {
          world.fx.distort(head(), { color: tint, radius: 0.9, life: 0.18 });
          world.fx.burst(head(), { count: 6, color: tint, speed: 2, life: 0.25, size: 0.08 });
        });
      }
      tl.add(0.95, () => world.screenFlash && world.screenFlash('#0a2a12', 0.12));
      tl.add(1.15, () => maskOn(true));
      total = 2.4;
    } else if (scene === 'watch') {
      // RELÍQUIA DE ENERGIA (Arnaldo → O Anfitrião) — uma cutscene de verdade, em nove fases:
      //  1 olha o relógio, que começa a brilhar · 2 o ambiente distorce (som estranho) · 3 a Relíquia se manifesta ·
      //  4 a Energia atravessa o corpo · 5 fios de Energia saltam do relógio para o corpo · 6 a máscara do Anfitrião
      //  aparece e se FUNDE ao rosto · 7 o corpo fica paranormal (roxo) · 8 a Energia explode · 9 surge o Anfitrião
      //  (a câmera mostra a forma nova rindo; o relógio gira sem parar)
      const watch = prop;
      const hand = () => (watch ? watch.getWorldPosition(new THREE.Vector3()) : f.chestPos());
      const COLORS = [0xb04aff, 0xff6ad0, 0x5aa0ff];
      if (watch) f.rig.showProp(sp.prop, true);
      f.anim.play('watch_open', { restart: true, duration: 0.9 });
      world.audio.play('heartbeat', { volume: 0.7 });
      lightTo = 1.5;
      world.cameraRig.playShots([
        faceClose(f, { dur: 0.9, from: 1.9, to: 1.5, side: 0.5, height: hy - 0.2, fov: 38 }),
        socketClose(f, hand, { dur: 1.3, dist: 0.85, side: 0.35, fov: 32 }),
        orbit(f, { dur: 1.1, radius: 2.6, height: 1.4, a0: -0.4, a1: 0.5, lookH: 1.4, fov: 46 }),
        faceClose(f, { dur: 1.0, from: 1.4, to: 1.0, side: 0.1, height: hy, fov: 34 }),
        lowAngle(f, { dur: 1.2, dist: 3.4, side: -0.8 }),
      ]);
      tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
      // 1–2: o relógio acende; o ar em volta distorce e o som fica estranho
      let lidT = -1;
      tl.add(0.8, () => {
        lidT = 0;
        world.audio.play('ritual', { volume: 0.8, pitch: 1.3 });
        world.fx.flash(hand(), { color: tint, size: 1.2, life: 0.25 });
        lightColor = new THREE.Color(tint);
        lightTo = 5;
      });
      tl.add(1.2, () => {
        world.fx.distort(f.chestPos(), { color: tint, radius: 3.4, life: 0.8 });
        world.audio.play('fearGaze', { volume: 0.6, pitch: 0.35 });
        world.screenFlash && world.screenFlash('#14062a', 0.25);
      });
      // 3: a Relíquia se manifesta (núcleo em três cores girando)
      let sparks = null;
      tl.add(1.5, () => {
        sparks = world.fx.emitter({ rate: 70, follow: hand, particle: { color: COLORS[Math.floor(Math.random() * 3)], speed: 1.4, spread: 0.7, life: 0.45, size: 0.12 } });
        COLORS.forEach((c) => world.fx.ring(hand(), { color: c, radius: 0.6, life: 0.5, vertical: true, yaw: f.yaw }));
      });
      // 4: a Energia atravessa o corpo (sobe do braço para o peito e a cabeça)
      let body = null;
      tl.add(2.1, () => {
        f.anim.play('watch_raise', { restart: true, duration: 0.7 });
        const J = ['eL', 'sL', 'sp', 'hd', 'sR', 'eR', 'kL', 'kR'];
        body = world.fx.emitter({ rate: 110, follow: () => f.rig.joints[J[Math.floor(Math.random() * J.length)]].getWorldPosition(new THREE.Vector3()), particle: { color: COLORS[Math.floor(Math.random() * 3)], speed: 0.8, spread: 0.4, up: 0.6, life: 0.45, size: 0.16 } });
        f.glowTint = { color: tint, base: 0.15 };
      });
      // 5: fios de Energia saltam do relógio e se enrolam no corpo
      tl.add(2.6, () => {
        for (let i = 0; i < 10; i++) {
          const to = f.chestPos().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.4) * 1.4, (Math.random() - 0.5) * 0.8));
          world.fx.lightning(hand(), to, { color: [0xff4ad0, 0x4ab8ff, 0xffe04a, 0x5aff8a][i % 4], life: 0.6 });
        }
        world.audio.play('shockwave', { volume: 0.6, pitch: 1.6 });
      });
      // 6: a máscara surge na frente do rosto e se FUNDE a ele
      let ghostMask = null;
      tl.add(3.0, () => {
        ghostMask = hostMask();
        ghostMask.scale.setScalar(0.01);
        ghostMask.position.set(0, -0.02, 0.25);
        f.rig.sockets.mouth.add(ghostMask);
        const gm = ghostMask;
        scrap.push(() => gm.parent && gm.parent.remove(gm));
        world.audio.play('maskOn', { volume: 0.9, pitch: 0.7 });
      });
      tl.each((time) => {
        if (!ghostMask || time > 3.75) return;
        const k = Math.min(1, (time - 3.0) / 0.6);
        ghostMask.scale.setScalar(0.01 + k * 0.99);
        ghostMask.position.z = 0.25 * (1 - k * k) - 0.01;
        ghostMask.rotation.z = (1 - k) * 2.5;
      });
      // 7: o corpo vira matéria paranormal (o brilho roxo toma conta)
      tl.add(3.6, () => {
        f.glowTint = { color: tint, base: 0.5 };
        world.fx.flash(head(), { color: tint, size: 2.4, life: 0.25 });
        world.screenFlash && world.screenFlash('#3a0a5a', 0.2);
      });
      // 8: a Energia explode
      tl.add(4.0, () => {
        sparks && sparks.stop();
        body && body.stop();
        const p = f.chestPos();
        world.fx.flash(p, { color: 0xffffff, size: 5, life: 0.3 });
        COLORS.forEach((c) => world.fx.burst(p, { count: 50, color: c, speed: 8, life: 0.9, size: 0.28 }));
        for (let i = 0; i < 3; i++) world.fx.ring(new THREE.Vector3(f.pos.x, 0.07, f.pos.z), { color: COLORS[i], radius: 2.5 + i * 1.5, life: 0.6 + i * 0.1 });
        world.fx.distort(p, { color: tint, radius: 3.4, life: 0.5 });
        world.screenFlash && world.screenFlash('#ffffff', 0.25);
        world.cameraRig.shake(0.6, 0.45);
        world.audio.play('explosion', { volume: 0.9, pitch: 1.2 });
        lightTo = 16;
        if (ghostMask) { ghostMask.parent && ghostMask.parent.remove(ghostMask); ghostMask = null; }
        f.glowTint = null;
      });
      const lid = watch && watch.userData.lid;
      tl.each((time, dt) => {
        if (lid && lidT >= 0 && lidT < 1) { lidT = Math.min(1, lidT + dt / 0.3); lid.rotation.y = -2.3 * lidT; }
      });
      transformAt = 4.05;
      // 9: o Anfitrião aparece — câmera nele, risada (feito depois do transform, com o modelo novo)
      epilogue = () => {
        f.anim.play('host_laugh', { restart: true, duration: 0.9 });
        world.audio.play('fearGaze', { volume: 0.8, pitch: 1.5 });
        world.cameraRig.playShots([faceClose(f, { dur: 1.2, from: 2.2, to: 1.6, side: 0.4, height: hy, fov: 40 })]);
      };
      total = 5.3;
    } else {
      f.anim.play(sp.anim || 'concentrate', { restart: true, duration: 1.5 });
      world.cameraRig.playShots([
        orbit(f, { dur: 0.8, radius: 3.4, height: 1.3, a0: -0.6, a1: 0.1, lookH: 1.1 }),
        faceClose(f, { dur: 0.9, from: 1.9, to: 1.3, side: 0.2, height: hy }),
      ]);
      world.audio.play(sp.startSound || 'fearGaze', { volume: 0.6, pitch: 0.6 });
      tl.add(0.3, () => world.showBanner(sp.banner || sp.name, f.def.color));
      tl.add(0.95, () => maskOn(false));
      total = 1.55;
    }
    if (carry) carry.set(offset);

    let done = false;
    const cleanup = () => {
      aura.stop();
      world.scene.remove(light);
      if (carry) carry.reset();
      if (prop && prop.userData && prop.userData.lid) prop.userData.lid.rotation.y = 0; // relógio fechado de novo
      scrap.forEach((fn) => fn());
      scrap.length = 0;
      if (scene === 'watch') f.glowTint = null;
    };
    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
      if (!epilogue) world.endCinematic();
      world.fx.ring(new THREE.Vector3(f.pos.x, 0.06, f.pos.z), { color: tint, radius: 3, life: 0.5 });
      world.fx.burst(f.chestPos(), { count: 50, color: col, speed: 5, life: 0.7, size: 0.3 });
      const bonus = sp.bonusHealth || 0;
      const baseRig = f.rig;
      transform(f, sp.form, { duration: sp.duration, health: f.health + bonus, bonusHealth: bonus, banner: sp.formBanner });
      // o modelo base fica guardado para o próximo round: a máscara mostrada na cena tem que sair dele, senão o
      // personagem volta mascarado (a forma tem a máscara no próprio modelo)
      if (sp.prop && baseRig.props[sp.prop]) baseRig.showProp(sp.prop, false);
      for (const [p, v] of sp.swap || []) if (baseRig.props[p]) baseRig.showProp(p, !v);
      f.invuln = Math.max(f.invuln, 0.8);
      f.energy = Math.max(f.energy, sp.energy ?? 40);
      // a aura da Intenção de Assassino (vermelha) fica em volta até o fim do round (os GIFs: contorno vermelho em
      // chamas); na Erin é o verde do Caos
      if (sp.redAura !== false && scene) {
        const red = world.fx.emitter({
          rate: 16,
          follow: () => new THREE.Vector3(f.pos.x + (Math.random() - 0.5) * 0.9, f.pos.y + 0.3 + Math.random() * 1.6, f.pos.z + (Math.random() - 0.5) * 0.9),
          particle: { color: tint, speed: 0.6, up: 1.4, spread: 0.3, life: 0.55, size: 0.2 },
        });
        f.addBuff({ type: 'killerIntent', time: Infinity, onEnd() { red.stop(); } });
      }
    };
    tl.add(transformAt ?? total - 0.1, () => {
      finish();
      if (!epilogue) return;
      // a troca de modelo (applyDef) descarta a sequência atual: o epílogo vira a sequência nova da forma, e é ELA que
      // encerra a cinematic (senão o mundo ficaria parado para sempre)
      epilogue();
      let et = 0;
      const rest = total - transformAt;
      f.setState('special');
      f.seq = {
        update(dt) { et += dt; if (et >= rest) { world.endCinematic(); return true; } return false; },
        cancel() { world.endCinematic(); },
      };
    });
    tl.end(total);
    return {
      update: (dt) => {
        // acessório viajando das mãos até o rosto
        if (offsetTo) {
          tweenT += dt;
          const k = Math.min(1, tweenT / tweenDur);
          const e = k * k * (3 - 2 * k);
          offset.lerpVectors(offsetFrom, offsetTo, e);
          if (k >= 1) offsetTo = null;
        }
        if (carry && !done) carry.set(offset);
        // luz acompanha o rosto e vai para a cor/força pedida
        light.position.copy(head()).addScaledVector(fwd, 0.8);
        light.intensity += (lightTo - light.intensity) * Math.min(1, dt * 6);
        light.color.lerp(lightColor, Math.min(1, dt * 5));
        return tl.update(dt);
      },
      cancel: () => {
        cleanup();
        world.endCinematic();
        if (!done && prop) f.rig.showProp(sp.prop, false); // cena interrompida: não fica mascarado sem transformar
        if (!done) for (const [p, v] of sp.swap || []) if (f.rig.props[p]) f.rig.showProp(p, !v);
      },
    };
  },
};
