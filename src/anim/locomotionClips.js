// LOCOMOÇÃO REFEITA (2026-10-23, pedido: "as animações do jogo já são antigas pro nível que está o jogo"). Antes a corrida e
// a caminhada tinham 4 poses por ciclo, sem giro do quadril, contra-giro do tronco nem cabeça estabilizada, e o dash era
// uma pose parada. Aqui cada ciclo segue as fases de verdade, meio ciclo desenhado e o outro espelhado:
//   CONTATO (o pé da frente toca o chão, o corpo no ponto baixo) → ABSORÇÃO (o joelho cede) → PASSAGEM (a perna de trás
//   passa dobrada sob o corpo) → IMPULSO (o pé de apoio empurra; na corrida, a fase no ar).
// O quadril gira para o lado da perna que avança e o tronco gira ao contrário (os braços balançam opostos às pernas);
// a cabeça desfaz o giro do tronco para continuar olhando para a frente. `stride` igual ao de antes: o Fighter casa a
// velocidade do clipe com a do lutador e o pé de apoio não escorrega.
// Mesmas convenções de clips.js (perna x < 0 à frente, joelho x > 0 dobra, ombro x < 0 à frente, tronco y > 0 gira o
// ombro direito para a frente, h = altura do quadril).

// cicla meio passo (poses de 0 a 0,5) e espelha a outra metade
function cycle(k, mirror, half) {
  const keys = half.map(([t, p]) => k(t, p));
  for (const [t, p] of half) keys.push(k(t + 0.5, mirror(p)));
  keys.push(k(1, half[0][1]));
  return keys;
}

export function locomotionClips(k, mirror, GUARD) {
  // ---------------- CORRIDA: inclinada, braços dobrados a ~90°, joelho alto na passagem, fase no ar no impulso
  const run = {
    dur: 0.64, loop: true, stride: 2.32,
    keys: cycle(k, mirror, [
      // contato: perna esquerda à frente quase reta, a direita atrás terminando o empurrão
      [0, { h: -0.08, hip: [0, -0.12, 0], sp: [0.26, 0.2, 0], hd: [-0.12, -0.16, 0], sL: [0.55, 0, 0.12], eL: [-1.25, 0, 0], sR: [-0.85, 0, -0.12], eR: [-1.6, 0, 0], lL: [-0.95, 0, 0.02], kL: [0.25, 0, 0], lR: [0.65, 0, -0.02], kR: [0.9, 0, 0] }],
      // absorção: o joelho de apoio cede e a perna de trás começa a dobrar para cima
      [0.125, { h: -0.13, hip: [0, -0.06, 0], sp: [0.3, 0.1, 0], hd: [-0.15, -0.08, 0], sL: [0.3, 0, 0.12], eL: [-1.35, 0, 0], sR: [-0.5, 0, -0.12], eR: [-1.6, 0, 0], lL: [-0.55, 0, 0.02], kL: [0.6, 0, 0], lR: [0.45, 0, -0.02], kR: [1.65, 0, 0] }],
      // passagem: apoio sob o corpo, a perna livre passa bem dobrada (calcanhar perto do quadril)
      [0.25, { h: -0.04, hip: [0, 0, 0], sp: [0.27, 0, 0], hd: [-0.12, 0, 0], sL: [0, 0, 0.12], eL: [-1.45, 0, 0], sR: [-0.05, 0, -0.12], eR: [-1.5, 0, 0], lL: [-0.08, 0, 0.02], kL: [0.35, 0, 0], lR: [-0.35, 0, -0.02], kR: [2.0, 0, 0] }],
      // impulso / no ar: o pé de apoio empurra atrás e a perna livre estende à frente
      [0.375, { h: 0.03, hip: [0, 0.08, 0], sp: [0.24, -0.12, 0], hd: [-0.1, 0.1, 0], sL: [-0.55, 0, 0.12], eL: [-1.55, 0, 0], sR: [0.35, 0, -0.12], eR: [-1.3, 0, 0], lL: [0.5, 0, 0.02], kL: [0.55, 0, 0], lR: [-0.85, 0, -0.02], kR: [1.15, 0, 0] }],
    ]),
  };

  // ---------------- CAMINHADA: ereta, passos curtos, o calcanhar toca primeiro, braços soltos
  const walk = {
    dur: 1.0, loop: true, stride: 1.36,
    keys: cycle(k, mirror, [
      [0, { h: -0.03, hip: [0, -0.07, 0], sp: [0.05, 0.09, 0], hd: [0.02, -0.07, 0], sL: [0.32, 0, 0.12], eL: [-0.28, 0, 0], sR: [-0.32, 0, -0.12], eR: [-0.45, 0, 0], lL: [-0.45, 0, 0.02], kL: [0.06, 0, 0], lR: [0.32, 0, -0.02], kR: [0.18, 0, 0] }],
      [0.125, { h: -0.06, hip: [0, -0.04, 0], sp: [0.06, 0.05, 0], hd: [0.03, -0.04, 0], sL: [0.2, 0, 0.12], eL: [-0.32, 0, 0], sR: [-0.2, 0, -0.12], eR: [-0.42, 0, 0], lL: [-0.32, 0, 0.02], kL: [0.24, 0, 0], lR: [0.36, 0, -0.02], kR: [0.42, 0, 0] }],
      [0.25, { h: -0.005, hip: [0, 0, 0], sp: [0.05, 0, 0], hd: [0.02, 0, 0], sL: [0, 0, 0.12], eL: [-0.38, 0, 0], sR: [0, 0, -0.12], eR: [-0.38, 0, 0], lL: [-0.04, 0, 0.02], kL: [0.1, 0, 0], lR: [-0.12, 0, -0.02], kR: [0.82, 0, 0] }],
      [0.375, { h: 0.01, hip: [0, 0.04, 0], sp: [0.05, -0.05, 0], hd: [0.02, 0.04, 0], sL: [-0.18, 0, 0.12], eL: [-0.45, 0, 0], sR: [0.18, 0, -0.12], eR: [-0.3, 0, 0], lL: [0.2, 0, 0.02], kL: [0.12, 0, 0], lR: [-0.38, 0, -0.02], kR: [0.4, 0, 0] }],
    ]),
  };

  // ---------------- PULO: agacha (antecipação) → estica explodindo com os braços → encolhe no alto
  const jump = {
    dur: 0.34, keys: [
      k(0, { h: -0.3, sp: [0.38, 0, 0], hd: [-0.2, 0, 0], sL: [0.65, 0, 0.2], eL: [-0.6, 0, 0], sR: [0.65, 0, -0.2], eR: [-0.6, 0, 0], lL: [-0.55, 0, 0.06], kL: [1.15, 0, 0], lR: [-0.45, 0, -0.06], kR: [1.1, 0, 0] }),
      k(0.35, { h: 0.02, sp: [-0.06, 0, 0], hd: [-0.12, 0, 0], sL: [-2.35, 0, 0.35], eL: [-0.35, 0, 0], sR: [-2.35, 0, -0.35], eR: [-0.35, 0, 0], lL: [0.12, 0, 0.04], kL: [0.12, 0, 0], lR: [0.2, 0, -0.04], kR: [0.25, 0, 0] }),
      k(1, { h: -0.02, sp: [0.12, 0, 0], hd: [0, 0, 0], sL: [-1.7, 0, 0.5], eL: [-0.9, 0, 0], sR: [-1.7, 0, -0.5], eR: [-0.9, 0, 0], lL: [-1.0, 0, 0.06], kL: [1.6, 0, 0], lR: [-0.35, 0, -0.06], kR: [1.25, 0, 0] }),
    ],
  };

  // ---------------- QUEDA: pernas buscando o chão, braços abertos equilibrando, um leve pedalar
  const FALL = { sp: [0.1, 0, 0], hd: [0.12, 0, 0], sL: [-1.0, 0, 0.9], eL: [-0.6, 0, 0], sR: [-1.0, 0, -0.9], eR: [-0.6, 0, 0], lL: [-0.5, 0, 0.06], kL: [0.9, 0, 0], lR: [0.1, 0, -0.06], kR: [0.6, 0, 0] };
  const fall = {
    dur: 0.6, loop: true, keys: [
      k(0, FALL),
      k(0.5, { ...FALL, sL: [-1.15, 0, 1.0], sR: [-1.15, 0, -1.0], lL: [-0.3, 0, 0.06], kL: [0.6, 0, 0], lR: [-0.12, 0, -0.06], kR: [0.85, 0, 0] }),
      k(1, FALL),
    ],
  };

  // ---------------- DASH: arrancada baixa com as pernas correndo de verdade e os braços jogados para trás
  const DASH = { h: -0.18, sp: [0.62, 0, 0], hd: [-0.45, 0, 0], sL: [0.95, 0, 0.3], eL: [-0.4, 0, 0], sR: [0.95, 0, -0.3], eR: [-0.4, 0, 0] };
  const dash = {
    dur: 0.34, loop: true, keys: [
      k(0, { ...DASH, hip: [0, -0.1, 0], lL: [-1.05, 0, 0], kL: [0.85, 0, 0], lR: [0.75, 0, 0], kR: [1.3, 0, 0] }),
      k(0.25, { ...DASH, h: -0.13, lL: [-0.2, 0, 0], kL: [0.5, 0, 0], lR: [-0.2, 0, 0], kR: [1.9, 0, 0] }),
      k(0.5, { ...DASH, hip: [0, 0.1, 0], lL: [0.75, 0, 0], kL: [1.3, 0, 0], lR: [-1.05, 0, 0], kR: [0.85, 0, 0] }),
      k(0.75, { ...DASH, h: -0.13, lL: [-0.2, 0, 0], kL: [1.9, 0, 0], lR: [-0.2, 0, 0], kR: [0.5, 0, 0] }),
      k(1, { ...DASH, hip: [0, -0.1, 0], lL: [-1.05, 0, 0], kL: [0.85, 0, 0], lR: [0.75, 0, 0], kR: [1.3, 0, 0] }),
    ],
  };

  // ---------------- ESQUIVA: abaixa de lado com o tronco girando e volta à guarda (antes: só abaixava e voltava)
  const dodge = {
    dur: 0.26, keys: [
      k(0, GUARD),
      k(0.3, { h: -0.32, hip: [0, 0.2, 0], sp: [0.5, 0.2, 0.08], hd: [-0.25, -0.15, 0], sL: [0.4, 0, 0.5], eL: [-1.2, 0, 0], sR: [0.4, 0, -0.5], eR: [-1.2, 0, 0], lL: [-0.8, 0, 0.12], kL: [1.3, 0, 0], lR: [0.6, 0, -0.12], kR: [1.5, 0, 0] }),
      k(0.7, { h: -0.18, hip: [0, -0.1, 0], sp: [0.3, 0.25, 0], hd: [-0.25, -0.2, 0], sL: [-0.6, 0, 0.35], eL: [-1.7, 0, 0], sR: [-0.4, 0, -0.35], eR: [-1.8, 0, 0], lL: [-0.45, 0, 0.12], kL: [0.7, 0, 0], lR: [0.35, 0, -0.12], kR: [0.6, 0, 0] }),
      k(1, GUARD),
    ],
  };

  // ---------------- LEVAR GOLPE: o tranco para trás (a cabeça vai junto), os braços soltam e recupera em duas fases
  const hit = {
    dur: 0.34, keys: [
      k(0, GUARD),
      k(0.18, { h: -0.12, hip: [0, 0, 0], sp: [-0.5, 0, 0.1], hd: [-0.5, 0, 0.08], sL: [-0.25, 0, 0.65], eL: [-0.7, 0, 0], sR: [-0.25, 0, -0.65], eR: [-0.7, 0, 0], lL: [-0.3, 0, 0.12], kL: [0.5, 0, 0], lR: [0.35, 0, -0.12], kR: [0.32, 0, 0] }),
      k(0.5, { ...GUARD, h: -0.14, sp: [-0.15, 0.2, 0.04], hd: [-0.15, -0.2, 0] }),
      k(1, GUARD),
    ],
  };

  return { run, walk, jump, fall, dash, dodge, hit };
}
