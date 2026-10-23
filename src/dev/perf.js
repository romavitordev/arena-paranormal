// CONTADOR DE DESEMPENHO (dev): FPS, tempo de quadro, chamadas de desenho, triângulos, geometrias/texturas na GPU,
// objetos na cena e memória do JS — para medir cada cenário/personagem antes e depois de mexer.
// Liga com ?perf na URL (vale também no celular e no site publicado) ou F8 no `npm run dev`. Não faz parte do jogo.
export function createPerf(renderer, getScene) {
  const el = document.createElement('div');
  el.id = 'perf';
  el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;padding:6px 9px;background:rgba(8,6,12,.82);'
    + 'color:#d8ffd0;font:12px/1.35 ui-monospace,Consolas,monospace;white-space:pre;pointer-events:none;border-radius:4px';
  document.body.appendChild(el);
  let frames = 0;
  let acc = 0;
  let worst = 0;
  let objects = 0;
  let objClock = 1;
  let on = true;
  const countObjects = (scene) => {
    let n = 0;
    scene.traverse(() => { n++; });
    return n;
  };
  return {
    toggle() {
      on = !on;
      el.style.display = on ? '' : 'none';
    },
    // chamado depois do render de cada quadro (renderer.info já tem os números deste quadro)
    update(dt) {
      if (!on) return;
      frames++;
      acc += dt;
      worst = Math.max(worst, dt);
      objClock += dt;
      if (acc < 0.5) return;
      const scene = getScene();
      if (objClock >= 1 && scene) { objects = countObjects(scene); objClock = 0; } // percorrer a cena custa: 1×/s
      const r = renderer.info.render;
      const m = renderer.info.memory;
      const heap = performance.memory ? `${(performance.memory.usedJSHeapSize / 1048576).toFixed(0)} MB` : 'n/d';
      el.textContent = `${Math.round(frames / acc)} FPS · ${(acc / frames * 1000).toFixed(1)} ms (pior ${(worst * 1000).toFixed(0)} ms)\n`
        + `desenhos ${r.calls} · triângulos ${(r.triangles / 1000).toFixed(1).replace('.', ',')} mil\n`
        + `geometrias ${m.geometries} · texturas ${m.textures} · objetos ${objects}\n`
        + `memória JS ${heap}`;
      frames = 0;
      acc = 0;
      worst = 0;
    },
  };
}
