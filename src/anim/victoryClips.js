// Poses de VITÓRIA de cada personagem (tela de vitória: os vencedores de frente para a câmera). Antes quase todos
// erguiam o mesmo punho. Cada uma conversa com a arma e o jeito do personagem.
// Chamado no fim de clips.js (recebe CLIPS e o ajudante de keyframe, sem import circular).

export function addVictoryClips(CLIPS, k) {
  const STAND = { h: -0.02, hip: [0, 0, 0], sp: [0, 0, 0], hd: [0, 0, 0], sL: [0.05, 0, 0.15], eL: [-0.3, 0, 0], sR: [0.05, 0, -0.15], eR: [-0.3, 0, 0], lL: [-0.1, 0, 0.12], kL: [0.12, 0, 0], lR: [0.1, 0, -0.12], kR: [0.12, 0, 0] };
  // entra na pose e respira de leve no fim (fica parada na última pose)
  const pose = (p) => {
    const P = { ...STAND, ...p };
    return { dur: 1.3, keys: [k(0, STAND), k(0.55, P), k(1, { ...P, h: (P.h || 0) - 0.02 })] };
  };
  Object.assign(CLIPS, {
    // Kaiser: M4 apoiada no ombro direito, cabeça inclinada, "queimada, séria e perigosa"
    vic_kaiser: pose({ hip: [0, 0.2, 0], sp: [-0.05, -0.2, 0], hd: [0.05, 0.3, 0.1], sR: [-2.0, 0.3, -0.6], eR: [-2.3, 0, 0], sL: [0.1, 0, 0.25], eL: [-0.35, 0, 0] }),
    // Joui: katana baixa na diagonal, a outra mão no peito e a cabeça baixa (calma de duelista)
    vic_joui: pose({ sp: [0.15, 0, 0], hd: [0.35, 0, 0], sR: [-0.5, 0, -0.45], eR: [-0.2, 0, 0], sL: [-1.2, -0.6, 0.1], eL: [-1.6, 0, 0] }),
    // Aghata: faca perto do rosto, o grimório na outra mão, corpo de lado
    vic_aghata: pose({ hip: [0, -0.3, 0], sp: [0, 0.3, 0.1], hd: [-0.1, -0.3, 0.15], sR: [-2.0, 0.5, -0.2], eR: [-2.0, 0, 0], sL: [-0.9, -0.5, 0.2], eL: [-1.4, 0, 0] }),
    // Gal: braços abertos para baixo com as lâminas nas correntes, queixo erguido
    vic_gal: pose({ sp: [-0.15, 0, 0], hd: [-0.3, 0, 0], sL: [-0.3, 0, 0.9], eL: [-0.2, 0, 0], sR: [-0.3, 0, -0.9], eR: [-0.2, 0, 0], lL: [-0.1, 0, 0.2], lR: [0.1, 0, -0.2] }),
    // Kian: braços cruzados, pés afastados
    vic_kian: pose({ sp: [-0.05, 0, 0], hd: [-0.15, 0, 0], sL: [-0.55, -0.95, 0.1], eL: [-2.05, 0, 0], sR: [-0.6, 0.95, -0.1], eR: [-2.0, 0, 0], lL: [-0.1, 0, 0.22], lR: [0.1, 0, -0.22] }),
    // Dante: mão no peito e a outra estendida, cabeça baixa (bênção)
    vic_dante: pose({ sp: [0.12, 0, 0], hd: [0.3, 0, 0], sR: [-1.0, 0.8, -0.1], eR: [-2.2, 0, 0], sL: [-1.0, 0.2, 0.3], eL: [-0.4, 0, 0] }),
    // Erin: escopeta no ombro e a outra mão na cintura
    vic_erin: pose({ hip: [0, 0.25, 0.05], hd: [0, 0.2, -0.12], sR: [-2.1, 0.2, -0.5], eR: [-2.2, 0, 0], sL: [0.25, 0, 0.65], eL: [-1.6, 0, 0], lL: [-0.15, 0, 0.1], kL: [0.25, 0, 0] }),
    // Aguiar: aponta o machado para a câmera, inclinado para a frente
    vic_aguiar: pose({ h: -0.12, sp: [0.25, 0.3, 0], hd: [0.1, -0.25, 0], sR: [-1.5, 0.2, -0.1], eR: [-0.15, 0, 0], sL: [-0.4, 0, 0.4], eL: [-1.4, 0, 0], lL: [-0.5, 0, 0.15], kL: [0.5, 0, 0], lR: [0.35, 0, -0.1], kR: [0.3, 0, 0] }),
    // Labirinto: braços abertos e a cabeça tombada de lado (perturbador)
    vic_labirinto: pose({ sp: [0.1, 0, 0.1], hd: [0.1, 0, 0.45], sL: [-0.6, 0, 1.3], eL: [-0.3, 0, 0], sR: [-0.6, 0, -1.3], eR: [-0.3, 0, 0] }),
    // Xande: taco atrás do pescoço com os dois braços pendurados nele
    vic_xande: pose({ hip: [0, 0.1, 0], hd: [-0.1, 0, -0.15], sR: [-2.6, -0.3, -0.9], eR: [-1.9, 0, 0], sL: [-2.6, 0.3, 0.9], eL: [-1.9, 0, 0] }),
    // Ferreiro: a espada cravada à frente, as duas mãos no punho
    vic_ferreiro: pose({ sp: [0.1, 0, 0], hd: [0.05, 0, 0], sR: [-0.9, 0.35, 0], eR: [-0.5, 0, 0], sL: [-0.9, -0.35, 0], eL: [-0.5, 0, 0], lL: [-0.1, 0, 0.2], lR: [0.1, 0, -0.2] }),
    // Juan: reverência debochada — mão no peito, curvado, olhando para cima
    vic_juan: pose({ sp: [0.45, 0, 0], hd: [-0.35, 0, 0], sR: [-1.0, 0.8, -0.1], eR: [-2.2, 0, 0], sL: [-0.2, 0, 0.8], eL: [-0.2, 0, 0], lR: [0.3, 0, -0.1], kR: [0.25, 0, 0] }),
    // Kemi: braços cruzados, peso numa perna, cabeça baixa ("um contrato é um contrato")
    vic_kemi: pose({ hip: [0, 0.2, 0.06], hd: [0.25, 0.2, 0], sL: [-0.55, -0.95, 0.1], eL: [-2.05, 0, 0], sR: [-0.6, 0.95, -0.1], eR: [-2.0, 0, 0], lL: [-0.15, 0, 0.08], kL: [0.35, 0, 0] }),
    // A Fantasma: aponta para a câmera — o próximo alvo
    vic_fantasma: pose({ sp: [0.05, -0.25, 0], hd: [0.1, 0.15, 0], sR: [-1.75, 0.4, -0.1], eR: [-0.05, 0, 0] }),
  });
}
