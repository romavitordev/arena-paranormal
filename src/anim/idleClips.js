// POSTURAS PARADAS PRÓPRIAS (pedido de 2026-10-23: "idles podem ser já ajustados"). Antes, 8 personagens dividiam
// `idle_knife`, 4 `idle_katana` e 6 `idle_fist`; a pose parada é o que mais aparece (seleção, introdução, entre golpes),
// então cada um ganha a sua, com a personalidade dele. Chamado no fim de clips.js (recebe CLIPS e k).
// Mesmas convenções de clips.js: ombro x < 0 vai à frente, z abre para o lado (esq. +, dir. −), cotovelo x < 0 dobra,
// perna x < 0 vai à frente, joelho x > 0 dobra, tronco x > 0 inclina para a frente, h = altura do quadril.

// idle(dur, base, meio, extras): respira de `base` até `base + meio` e volta; extras = [t, pose parcial] no meio do ciclo
function idle(k, dur, base, mid, extras = []) {
  const keys = [k(0, base), ...extras.map(([t, p]) => k(t, { ...base, ...p })), k(0.5, { ...base, ...mid }), k(1, base)];
  keys.sort((a, b) => a.t - b.t);
  return { dur, loop: true, keys };
}

const LEGS = { lL: [-0.3, 0, 0.12], kL: [0.4, 0, 0], lR: [0.25, 0, -0.12], kR: [0.35, 0, 0] };
const WIDE = { lL: [-0.22, 0, 0.3], kL: [0.45, 0, 0], lR: [0.25, 0, -0.3], kR: [0.4, 0, 0] };
const LOW = { lL: [-0.55, 0, 0.16], kL: [0.85, 0, 0], lR: [0.42, 0, -0.16], kR: [0.75, 0, 0] };
const EASY = { lL: [-0.1, 0, 0.1], kL: [0.12, 0, 0], lR: [0.12, 0, -0.12], kR: [0.1, 0, 0] };

export function addIdleClips(CLIPS, k) {
  // ---------------- FACA / ARMA DE UMA MÃO ----------------
  // AGHATA: sorri antes de cortar — quadril de lado, mão na cintura, a faca balançando baixa e a cabeça inclinada
  const AGH = { h: -0.03, hip: [0, -0.25, 0.06], sp: [0.05, 0.3, -0.06], hd: [0, -0.3, 0.16], sR: [-0.3, 0, -0.25], eR: [-0.9, 0, 0], sL: [0.1, 0, 0.5], eL: [-1.6, 0, 0], ...EASY };
  // AGUIAR: o Mutilador — curvado e pesado, ombros caídos, o machado pendurado e a respiração lenta
  const AGU = { h: -0.12, hip: [0, -0.25, 0], sp: [0.35, 0.25, 0], hd: [-0.18, -0.25, 0], sR: [-0.25, 0, -0.2], eR: [-0.4, 0, 0], sL: [-0.6, 0, 0.35], eL: [-1.2, 0, 0], ...WIDE };
  // CRISTINO: não é pessoal — ereto e quieto, a peixeira baixa à frente e a outra mão perto do cinto (os lampiões)
  const CRI = { h: -0.04, hip: [0, -0.2, 0], sp: [0.02, 0.2, 0], hd: [0, -0.2, 0], sR: [-0.45, 0, -0.15], eR: [-0.7, 0, 0], sL: [0.05, 0, 0.25], eL: [-1.3, 0, 0], ...EASY };
  // FANTASMA: agachada e à espreita debaixo do sobretudo, as facas prontas, a cabeça à frente
  const FAN = { h: -0.2, hip: [0, -0.35, 0], sp: [0.3, 0.35, 0], hd: [-0.2, -0.35, 0], sR: [-0.7, 0, -0.4], eR: [-1.4, 0, 0], sL: [-0.9, 0, 0.35], eL: [-1.6, 0, 0], ...LOW };
  // JAE: "Shhh" — bem baixa, o punhal invertido perto do rosto e a outra mão estendida, de lado
  const JAE = { h: -0.22, hip: [0, -0.5, 0], sp: [0.3, 0.5, 0], hd: [-0.15, -0.5, 0], sR: [-1.3, 0.4, -0.3], eR: [-2.1, 0, 0], sL: [-1.0, -0.2, 0.2], eL: [-0.6, 0, 0], ...LOW };
  // JUAN: inquieto — a faca alta, a cabeça torta e pequenos trancos
  const JUA = { h: -0.12, hip: [0, -0.3, 0], sp: [0.2, 0.3, 0.08], hd: [0.1, -0.3, 0.25], sR: [-1.1, 0, -0.4], eR: [-1.2, 0, 0], sL: [-0.5, 0, 0.5], eL: [-0.8, 0, 0], ...LEGS };
  // KEMI: profissional — a faca à frente e baixa, a outra mão guardando o queixo, quase parada
  const KEM = { h: -0.08, hip: [0, -0.35, 0], sp: [0.1, 0.35, 0], hd: [0, -0.35, 0], sR: [-0.9, 0, -0.2], eR: [-1.0, 0, 0], sL: [-0.7, 0, 0.25], eL: [-1.9, 0, 0], ...LEGS };
  // XANDE: o Skate Caótico erguido no braço esquerdo como escudo, o taco descansando no ombro direito
  const XAN = { h: -0.1, hip: [0, -0.35, 0], sp: [0.15, 0.35, 0], hd: [0, -0.35, 0], sR: [-0.4, 0, -0.45], eR: [-2.4, 0, 0], sL: [-0.75, -0.55, 0.15], eL: [-1.65, 0, 0], ...WIDE };

  // ---------------- ESPADA / LANÇA ----------------
  // FERREIRO: a Espada Consumidora apoiada à frente com as duas mãos, de pé e imóvel como um guardião
  const FER = { h: -0.03, hip: [0, 0, 0], sp: [0.05, 0, 0], hd: [0, 0, 0], sR: [-0.6, 0.4, -0.1], eR: [-0.6, 0, 0], sL: [-0.6, -0.4, 0.1], eL: [-0.6, 0, 0], lL: [-0.1, 0, 0.18], kL: [0.1, 0, 0], lR: [0.1, 0, -0.18], kR: [0.1, 0, 0] };
  // JOUI: iaijutsu — agachado, a mão direita no cabo junto do quadril esquerdo e a esquerda segurando a bainha
  const JOU = { h: -0.18, hip: [0, -0.55, 0], sp: [0.2, 0.55, 0], hd: [0, -0.55, 0], sR: [-0.6, 0.5, -0.1], eR: [-1.0, 0, 0], sL: [-0.3, -0.3, 0.2], eL: [-1.0, 0, 0], ...LOW };
  // LABIRINTO: a Antena de lado com as duas mãos, ponta para o rival, base de lanceiro
  const LAB = { h: -0.12, hip: [0, -0.7, 0], sp: [0.1, 0.6, 0], hd: [0, -0.6, 0], sR: [-0.4, 0.3, -0.2], eR: [-1.2, 0, 0], sL: [-1.3, -0.4, 0.1], eL: [-0.3, 0, 0], lL: [-0.4, 0, 0.18], kL: [0.5, 0, 0], lR: [0.4, 0, -0.12], kR: [0.35, 0, 0] };
  // VERÍSSIMO: o comandante — coluna reta, a espada baixa na diagonal e a mão esquerda nas costas
  const VER = { h: -0.03, hip: [0, -0.25, 0], sp: [0, 0.25, 0], hd: [0, -0.25, 0], sR: [-0.55, 0, -0.15], eR: [-0.3, 0, 0], sL: [0.5, 0.2, 0.3], eL: [-1.6, 0, 0], ...EASY };

  // ---------------- PUNHOS / SEM ARMA ----------------
  // CRISTOPHER: dublê e boxeador — guarda alta e o gingado nos pés
  const CRS = { h: -0.1, hip: [0, -0.3, 0], sp: [0.15, 0.3, 0], hd: [0.15, -0.3, 0], sL: [-1.0, 0, 0.3], eL: [-2.2, 0, 0], sR: [-0.8, 0, -0.3], eR: [-2.3, 0, 0], ...LEGS };
  // DALMO: grandão — base larga, punhos baixos e pesados, os ombros rolando
  const DAL = { h: -0.15, hip: [0, -0.2, 0], sp: [0.25, 0.2, 0], hd: [-0.1, -0.2, 0], sL: [-0.4, 0, 0.45], eL: [-1.0, 0, 0], sR: [-0.35, 0, -0.45], eR: [-1.0, 0, 0], ...WIDE };
  // DANTE: é ironia do destino — de pé e à vontade, uma palma erguida (o ritual pronto), a outra mão largada
  const DAN = { h: -0.03, hip: [0, -0.2, 0], sp: [0, 0.15, 0], hd: [0.05, -0.15, 0.08], sR: [-0.9, 0.3, -0.2], eR: [-1.2, 0, 0], sL: [0.05, 0, 0.2], eL: [-0.4, 0, 0], ...EASY };
  // GUIZO BOMBADO: exibindo os músculos — braços dobrados para cima dos lados
  const GBO = { h: -0.08, hip: [0, 0, 0], sp: [0.05, 0, 0], hd: [-0.05, 0, 0], sL: [-0.2, 0, 1.3], eL: [-2.2, 0, 0], sR: [-0.2, 0, -1.3], eR: [-2.2, 0, 0], ...WIDE };
  // KAISER: soldado — a arma em posição baixa com as duas mãos, olhando em volta
  const KAI = { h: -0.1, hip: [0, -0.35, 0], sp: [0.12, 0.35, 0], hd: [0, -0.35, 0], sR: [-0.9, 0.35, -0.2], eR: [-1.6, 0, 0], sL: [-1.1, -0.4, 0.25], eL: [-1.3, 0, 0], ...LEGS };
  // KIAN: sereno — de pé, quase flutuando, os braços um pouco abertos (os sigilos seguram o que ele carrega)
  const KIA = { h: 0, hip: [0, -0.1, 0], sp: [-0.03, 0.1, 0], hd: [-0.05, -0.1, 0], sL: [-0.1, 0, 0.35], eL: [-0.3, 0, 0], sR: [-0.1, 0, -0.35], eR: [-0.3, 0, 0], lL: [0, 0, 0.05], kL: [0.05, 0, 0], lR: [0, 0, -0.05], kR: [0.05, 0, 0] };

  Object.assign(CLIPS, {
    idle_aghata: idle(k, 1.8, AGH, { hd: [0, -0.25, 0.22], sR: [-0.42, 0, -0.25], h: -0.05 }),
    idle_aguiar: idle(k, 2.2, AGU, { h: -0.15, sp: [0.42, 0.25, 0], sL: [-0.66, 0, 0.36] }),
    idle_cristino: idle(k, 2.4, CRI, { h: -0.055, sp: [0.04, 0.2, 0] }),
    idle_fantasma: idle(k, 1.6, FAN, { h: -0.23, sp: [0.34, 0.35, 0] }),
    idle_jae: idle(k, 1.5, JAE, { h: -0.24, hd: [-0.15, -0.4, 0.05] }),
    idle_juan: idle(k, 1.0, JUA, { h: -0.15, sR: [-1.2, 0, -0.42] }, [[0.2, { hd: [0.16, -0.2, 0.36] }], [0.32, { hd: [0.1, -0.3, 0.25] }], [0.72, { sp: [0.24, 0.36, 0.1] }]]),
    idle_kemi: idle(k, 2.0, KEM, { h: -0.1, sR: [-0.94, 0, -0.2] }),
    idle_xande: idle(k, 1.6, XAN, { h: -0.13, eR: [-2.3, 0, 0], sL: [-0.8, -0.55, 0.15] }),
    idle_ferreiro: idle(k, 2.6, FER, { h: -0.05, sp: [0.07, 0, 0] }),
    idle_joui: idle(k, 2.0, JOU, { h: -0.2, sp: [0.22, 0.55, 0] }),
    idle_labirinto: idle(k, 1.8, LAB, { h: -0.14, sp: [0.13, 0.62, 0], sL: [-1.34, -0.4, 0.1] }),
    idle_verissimo: idle(k, 2.4, VER, { h: -0.045, hd: [0, -0.2, 0] }),
    idle_cristopher: idle(k, 0.7, CRS, { h: -0.17, kL: [0.6, 0, 0], kR: [0.55, 0, 0] }, [[0.25, { h: -0.06 }], [0.75, { h: -0.06 }]]),
    idle_dalmo: idle(k, 2.0, DAL, { h: -0.18, sp: [0.3, 0.25, 0.05] }),
    idle_dante: idle(k, 2.4, DAN, { h: -0.04, sR: [-0.96, 0.3, -0.2], hd: [0.05, -0.1, 0.1] }),
    idle_guizo_bombado: idle(k, 1.6, GBO, { h: -0.1, sL: [-0.25, 0, 1.35], sR: [-0.25, 0, -1.35], eL: [-2.35, 0, 0], eR: [-2.35, 0, 0] }),
    idle_kaiser: idle(k, 2.0, KAI, { h: -0.12 }, [[0.25, { hd: [0, -0.55, 0] }], [0.75, { hd: [0, -0.15, 0] }]]),
    idle_kian: idle(k, 3.0, KIA, { h: 0.02, sL: [-0.12, 0, 0.4], sR: [-0.12, 0, -0.4] }),
  });
}
