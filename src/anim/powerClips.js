// Animações próprias dos poderes do KIAN e do JOUI (feedback de 25/10/2026: os kits novos usavam clipes emprestados).
// Chamado no fim de clips.js (recebe CLIPS e o ajudante k para não criar import circular).
// Mesmas convenções de clips.js: personagem olha para +Z; ombro x < 0 → braço para a frente; ombro y + → varre para a
// esquerda dele; ombro z → abre para o lado (esq. +, dir. −); cotovelo x < 0 → dobra; perna x < 0 → à frente.
//   relic_draw     JOUI (Shi no Kage): agacha e leva as DUAS mãos aos dois cabos — a direita na Shi no Kage, a esquerda
//                  na Relíquia de Energia da bainha — os braços cruzados na cintura, o tronco torcido, pronto para sacar
//   iai_double     JOUI: o X final — as duas lâminas saem juntas em sentidos opostos (a direita varre de baixo para cima
//                  para a direita, a esquerda para a esquerda), o corpo avança e termina no zanshin, braços abertos
//   shadow_plunge  JOUI (Portal das Sombras): pegada invertida, ergue a katana e a CRAVA na própria sombra à frente
//   levitate_raise KIAN (Suspender): a palma aberta voltada para cima sobe devagar até acima da cabeça, a outra mão
//                  aberta ao lado — ele ergue o adversário sem tocar
//   fear_pierce    KIAN (Lâmina do Medo de Calamidade): a lâmina translúcida junto do ouvido (a melodia), um passo
//                  longo e a ESTOCADA reta que perfura, o braço inteiro esticado

export function addPowerClips(CLIPS, k) {
  const BASE_LEGS = { lL: [-0.3, 0, 0.12], kL: [0.4, 0, 0], lR: [0.25, 0, -0.12], kR: [0.35, 0, 0] };
  const CROUCH = { h: -0.3, lL: [-0.7, 0, 0.18], kL: [1.15, 0, 0], lR: [0.45, 0, -0.16], kR: [0.95, 0, 0] };
  const LUNGE = { h: -0.32, hip: [0, 0.35, 0], lL: [-1.15, 0, 0.1], kL: [1.1, 0, 0], lR: [0.85, 0, -0.08], kR: [0.15, 0, 0] };

  // ---------- JOUI ----------
  // as duas mãos nos dois cabos, cruzadas na cintura (direita no quadril esquerdo, esquerda no direito)
  const DRAW = {
    ...CROUCH, hip: [0, -0.45, 0], sp: [0.32, -0.55, 0], hd: [0, 0.55, 0],
    sR: [-0.55, 1.05, -0.05], eR: [-1.35, 0, 0], sL: [-0.6, -1.0, 0.1], eL: [-1.3, 0, 0],
  };
  // o fim do X: avançou, as lâminas abertas para os lados, o olhar firme à frente (zanshin)
  const ZANSHIN = {
    ...LUNGE, sp: [0.35, 0.1, 0], hd: [0, -0.1, 0],
    sR: [-1.0, -1.45, -0.25], eR: [-0.1, 0, 0], sL: [-1.0, 1.45, 0.25], eL: [-0.1, 0, 0],
  };
  // pegada invertida, a katana erguida acima do ombro direito com a ponta para baixo
  const PLUNGE_UP = { h: -0.06, ...BASE_LEGS, sp: [-0.12, 0.35, 0], hd: [0.1, -0.3, 0], sR: [-2.7, 0.25, -0.35], eR: [-1.6, 0, 0], sL: [-1.0, -0.2, 0.3], eL: [-1.4, 0, 0] };
  const PLUNGE_DOWN = { ...CROUCH, h: -0.42, sp: [0.85, 0.15, 0], hd: [0.45, 0, 0], sR: [-1.0, 0.15, -0.1], eR: [-0.15, 0, 0], sL: [-0.7, -0.3, 0.45], eL: [-0.9, 0, 0] };

  // ---------- KIAN ----------
  const RAISE_LOW = { h: -0.04, ...BASE_LEGS, sp: [-0.05, -0.2, 0], hd: [-0.1, 0.2, 0], sR: [-1.2, -0.15, -0.15], eR: [-0.2, 0, 0], sL: [-0.2, 0, 0.75], eL: [-0.3, 0, 0] };
  const RAISE_HIGH = { h: 0.0, ...BASE_LEGS, sp: [-0.25, -0.25, 0], hd: [-0.45, 0.2, 0], sR: [-2.75, -0.15, -0.2], eR: [-0.15, 0, 0], sL: [-0.35, 0, 1.0], eL: [-0.25, 0, 0] };
  // a lâmina junto do ouvido: o braço direito dobrado para trás, a mão esquerda à frente medindo a distância
  const EAR = { h: -0.12, ...BASE_LEGS, hip: [0, -0.35, 0], sp: [0.05, 0.75, 0], hd: [0.05, -0.6, 0], sR: [-1.6, 0.9, -0.55], eR: [-2.2, 0, 0], sL: [-1.45, -0.35, 0.15], eL: [-0.25, 0, 0] };
  const PIERCE = { ...LUNGE, sp: [0.4, -0.75, 0], hd: [0, 0.55, 0], sR: [-1.62, -0.2, 0], eR: [0, 0, 0], sL: [-0.2, 0.3, 0.55], eL: [-0.6, 0, 0] };

  Object.assign(CLIPS, {
    relic_draw: { dur: 0.75, keys: [k(0, { ...BASE_LEGS, h: -0.08, sp: [0.1, 0.35, 0] }), k(0.55, DRAW), k(1, { ...DRAW, h: -0.33, sp: [0.36, -0.6, 0] })] },
    iai_double: { dur: 0.5, keys: [
      k(0, DRAW),
      // as lâminas cruzam na frente do corpo no meio do corte
      k(0.3, { ...LUNGE, sp: [0.4, 0, 0], hd: [0, 0, 0], sR: [-1.55, 0.2, -0.1], eR: [-0.2, 0, 0], sL: [-1.55, -0.2, 0.1], eL: [-0.2, 0, 0] }),
      k(0.6, ZANSHIN),
      k(1, ZANSHIN),
    ] },
    shadow_plunge: { dur: 0.45, keys: [k(0, { ...BASE_LEGS, h: -0.08, sp: [0.1, 0.35, 0], sR: [-0.7, 0, -0.25], eR: [-2.0, 0, 0] }), k(0.35, PLUNGE_UP), k(0.62, PLUNGE_DOWN), k(1, PLUNGE_DOWN)] },
    levitate_raise: { dur: 0.6, keys: [k(0, { ...BASE_LEGS, h: -0.08 }), k(0.35, RAISE_LOW), k(1, RAISE_HIGH)] },
    // KIAN (Transformação "Realizador da Calamidade"): a ESCRITA TOMA O CORPO — de pé, os braços abrem para baixo com as
    // palmas para fora, o peito se abre e a cabeça vai para trás enquanto os sigilos sobem das mãos ao rosto
    script_surge: { dur: 1.6, keys: [
      k(0, { ...BASE_LEGS, h: -0.08 }),
      k(0.3, { h: -0.14, lL: [-0.2, 0, 0.18], kL: [0.35, 0, 0], lR: [0.15, 0, -0.18], kR: [0.3, 0, 0], sp: [0.25, 0, 0], hd: [0.45, 0, 0], sL: [0.15, 0, 0.45], eL: [-0.3, 0, 0], sR: [0.15, 0, -0.45], eR: [-0.3, 0, 0] }),
      k(0.75, { h: -0.06, lL: [-0.2, 0, 0.2], kL: [0.25, 0, 0], lR: [0.15, 0, -0.2], kR: [0.2, 0, 0], sp: [-0.25, 0, 0], hd: [-0.55, 0, 0], sL: [0.25, 0, 0.75], eL: [-0.15, 0, 0], sR: [0.25, 0, -0.75], eR: [-0.15, 0, 0] }),
      k(1, { h: -0.04, lL: [-0.2, 0, 0.2], kL: [0.25, 0, 0], lR: [0.15, 0, -0.2], kR: [0.2, 0, 0], sp: [-0.3, 0, 0], hd: [-0.6, 0, 0], sL: [0.2, 0, 0.85], eL: [-0.1, 0, 0], sR: [0.2, 0, -0.85], eR: [-0.1, 0, 0] }),
    ] },
    fear_pierce: { dur: 0.75, keys: [k(0, { ...BASE_LEGS, h: -0.08 }), k(0.5, EAR), k(0.62, PIERCE), k(0.85, PIERCE), k(1, { ...PIERCE, h: -0.2, sR: [-1.4, -0.2, 0] })] },
  });
}
