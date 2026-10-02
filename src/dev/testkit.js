// Ferramentas de teste usadas no console do navegador (não fazem parte do jogo).
//   const { T } = await import('/src/dev/testkit.js');
//   const [m, a, b] = T.setup('mascarado', 'injustica', 1.5);
export const T = {
  set(pi, held = {}, move = [0, 0]) {
    window.__game.input.players[pi].setVirtual({ moveX: move[0], moveY: move[1], held });
  },
  tap(pi, held, frames = 3, move = [0, 0]) {
    T.set(pi, held, move);
    window.__game.step(frames);
    T.set(pi, {});
    window.__game.step(2);
  },
  step(n) {
    window.__game.step(n);
  },
  sec(s) {
    window.__game.step(Math.round(s * 60));
  },
  // direção do analógico (relativa à câmera) para frente/trás/lado em relação ao adversário
  moveFor(w, f, kind) {
    const o = w.opponentOf(f);
    let dx = o.pos.x - f.pos.x;
    let dz = o.pos.z - f.pos.z;
    const l = Math.hypot(dx, dz) || 1;
    dx /= l;
    dz /= l;
    let wx = dx;
    let wz = dz;
    if (kind === 'back') { wx = -dx; wz = -dz; }
    if (kind === 'side') { wx = -dz; wz = dx; }
    const b = f.moveBasis();
    return [wx * b.right.x + wz * b.right.z, wx * b.forward.x + wz * b.forward.z];
  },
  setup(p1, p2, dist = 1.5) {
    const m = window.__game.quick(p1, p2);
    T.set(0);
    T.set(1);
    T.sec(3.1); // ROUND → 3, 2, 1 → LUTE!
    const [a, b] = m.fighters;
    a.pos.set(0, 0, 0);
    b.pos.set(0, 0, dist);
    a.yaw = 0;
    b.yaw = Math.PI;
    return [m, a, b];
  },
  // habilidade pelo botão que era "R1 + btn" antes: ○/□/L2 usam △, △/× usam R2 (defesa)
  mod(pi, btn) {
    const key = btn === 'carga' || btn === 'jump' ? 'block' : 'carga';
    T.set(pi, { [key]: true });
    T.step(2);
    T.set(pi, { [key]: true, [btn]: true });
    T.step(3);
    T.set(pi, {});
    T.step(1);
  },
  special(pi) {
    T.tap(pi, { carga: true });
    T.tap(pi, { carga: true });
    T.tap(pi, { physical: true });
  },
};
