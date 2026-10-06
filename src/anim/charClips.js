// Animações próprias do ARNALDO FRITZ, do ANFITRIÃO e do SENHOR VERÍSSIMO (UPD de 2026-10-06).
// Chamado no fim de clips.js (recebe CLIPS e o ajudante k para não criar import circular).
//   arn_*: ARNALDO — ator + espadachim experiente: guarda de esgrima de lado, mão livre atrás das costas, floreios,
//          reverências e estocadas em afundo; teatral, mas preciso (não é dança).
//   ver_*: VERÍSSIMO — comandante: coluna firme, espada baixa e econômica, golpes curtos e diretos, gestos de ordem.
//   host_*: ANFITRIÃO — apresentador do caos: cabeça inclinada, braços abertos, trancos, reverências e risadas.

export function addCharClips(CLIPS, k) {
  // ======================= ARNALDO =======================
  // guarda de esgrima: de lado, espada à frente com a ponta um pouco alta, mão esquerda nas costas
  const FENCE = {
    h: -0.1, hip: [0, -0.6, 0], sp: [0.05, 0.5, 0], hd: [0, -0.5, 0.04],
    sR: [-1.25, 0.1, -0.1], eR: [-0.5, 0, 0], sL: [0.55, 0.2, 0.35], eL: [-1.7, 0, 0],
    lL: [-0.38, 0, 0.16], kL: [0.45, 0, 0], lR: [0.36, 0, -0.1], kR: [0.32, 0, 0],
  };
  const FLEGS = { h: FENCE.h, hip: FENCE.hip, lL: FENCE.lL, kL: FENCE.kL, lR: FENCE.lR, kR: FENCE.kR };
  const LUNGE = { h: -0.26, hip: [0, -0.7, 0], lL: [-1.05, 0, 0.12], kL: [1.0, 0, 0], lR: [0.75, 0, -0.08], kR: [0.05, 0, 0] };
  const BOW = { ...FLEGS, h: -0.12, sp: [0.5, 0.2, 0], hd: [0.35, -0.2, 0], sR: [-0.5, 0, -1.15], eR: [-0.1, 0, 0], sL: [-0.75, -0.95, 0.1], eL: [-1.9, 0, 0] };
  Object.assign(CLIPS, {
    // a ponta da espada desenha pequenos círculos; o corpo respira na base de esgrima
    idle_arnaldo: { dur: 1.8, loop: true, keys: [
      k(0, FENCE),
      k(0.25, { ...FENCE, h: -0.12, sR: [-1.3, 0.16, -0.12] }),
      k(0.5, { ...FENCE, h: -0.13, sp: [0.08, 0.52, 0], sR: [-1.22, 0.2, -0.06] }),
      k(0.75, { ...FENCE, h: -0.11, sR: [-1.18, 0.12, -0.1] }),
      k(1, FENCE),
    ] },
    // 1 — Abertura de Cena: corte rápido e elegante (sem tirar a mão das costas)
    arn_open: { dur: 0.32, keys: [k(0, { ...FENCE, sp: [0.05, 0.85, 0], sR: [-1.4, -1.1, 0], eR: [-0.4, 0, 0] }), k(0.45, { ...FENCE, sp: [0.1, -0.2, 0], sR: [-1.45, 1.0, 0], eR: [-0.1, 0, 0] }), k(1, FENCE)] },
    // 2 — Estocada de Palco: afundo clássico, braço de trás jogado para trás
    arn_lunge: { dur: 0.36, keys: [k(0, { ...FENCE, sR: [-1.1, 0.1, -0.1], eR: [-1.6, 0, 0] }), k(0.45, { ...LUNGE, sp: [0.2, 0.15, 0], hd: [0, -0.2, 0], sR: [-1.6, 0, 0], eR: [0, 0, 0], sL: [0.7, 0, 0.9], eL: [-0.2, 0, 0] }), k(0.7, { ...LUNGE, sp: [0.2, 0.15, 0], hd: [0, -0.2, 0], sR: [-1.6, 0, 0], eR: [0, 0, 0], sL: [0.7, 0, 0.9], eL: [-0.2, 0, 0] }), k(1, FENCE)] },
    // 3 — Corte em Reverência: corte de volta e termina numa pequena reverência
    arn_bowcut: { dur: 0.42, keys: [k(0, { ...FENCE, sp: [0.1, -0.4, 0], sR: [-1.4, 1.0, 0], eR: [-0.2, 0, 0] }), k(0.4, { ...FENCE, sp: [0.1, 0.8, 0], sR: [-1.45, -1.2, 0], eR: [-0.1, 0, 0] }), k(0.75, BOW), k(1, FENCE)] },
    // 4 — Floreio: gira a espada na frente do corpo (a fita acompanha)
    arn_flourish: { dur: 0.42, keys: [k(0, FENCE), k(0.25, { ...FENCE, sp: [0.05, 0.3, 0], sR: [-1.5, -0.8, -0.3], eR: [-1.2, 0, 0] }), k(0.5, { ...FENCE, sp: [0.05, 0.7, 0], sR: [-1.9, 0.6, -0.1], eR: [-0.4, 0, 0] }), k(0.75, { ...FENCE, sp: [0.12, -0.3, 0], sR: [-1.3, 1.1, 0], eR: [-0.3, 0, 0] }), k(1, FENCE)] },
    // 5 — Ato Final: ergue a espada no alto e desce num grande corte, terminando de lado com a espada estendida
    arn_final: { dur: 0.62, keys: [k(0, FENCE), k(0.35, { ...FLEGS, h: 0, sp: [-0.25, 0.4, 0], hd: [-0.2, -0.3, 0], sR: [-3.0, 0, -0.2], eR: [-0.4, 0, 0], sL: [0.4, 0, 0.6], eL: [-0.4, 0, 0] }), k(0.55, { ...LUNGE, sp: [0.55, -0.3, 0], hd: [0.1, 0.2, 0], sR: [-0.5, 0.9, -0.2], eR: [0, 0, 0], sL: [0.6, 0, 1.0], eL: [-0.2, 0, 0] }), k(0.8, { ...LUNGE, sp: [0.3, -0.5, 0], hd: [0, 0.3, 0], sR: [-0.4, 0.1, -1.2], eR: [0, 0, 0], sL: [0.4, 0, 1.1], eL: [-0.3, 0, 0] }), k(1, FENCE)] },
    // reverência completa (Ato Final, Aniquilador, provocação)
    arn_bow: { dur: 0.7, keys: [k(0, FENCE), k(0.4, BOW), k(0.7, BOW), k(1, FENCE)] },
    // Finta Teatral: provoca com a mão livre (chama o adversário) antes de avançar
    arn_taunt: { dur: 0.42, keys: [k(0, FENCE), k(0.5, { ...FLEGS, h: -0.06, sp: [-0.1, 0.3, 0], hd: [-0.15, -0.3, 0.12], sR: [-0.5, 0, -0.5], eR: [-0.3, 0, 0], sL: [-1.4, -0.4, 0.2], eL: [-0.6, 0, 0] }), k(1, { ...FLEGS, h: -0.06, sp: [-0.1, 0.3, 0], hd: [-0.15, -0.3, 0.12], sR: [-0.5, 0, -0.5], eR: [-0.3, 0, 0], sL: [-1.4, -0.4, 0.2], eL: [-1.2, 0, 0] })] },
    // Rodopio: giro completo com a espada aberta (a fita gira junto)
    arn_spin: { dur: 0.5, keys: [k(0, { ...FENCE, sR: [-1.5, -0.3, -0.8], eR: [0, 0, 0] }), k(0.5, { ...FENCE, hip: [0, -3.74, 0], sR: [-1.5, -0.3, -0.9], eR: [0, 0, 0] }), k(1, { ...FENCE, hip: [0, -6.88, 0], sR: [-1.4, 0, -0.5], eR: [-0.2, 0, 0] })] },
    // Emissor de Pulsos: estende a mão esquerda com a caixa (a espada fica pronta atrás)
    arn_emit: { dur: 0.5, keys: [k(0, FENCE), k(0.4, { ...FLEGS, hip: [0, -0.2, 0], sp: [0.05, -0.2, 0], hd: [0, 0.1, 0], sL: [-1.5, 0.1, 0.1], eL: [-0.1, 0, 0], sR: [-0.6, 0, -0.4], eR: [-1.2, 0, 0] }), k(1, { ...FLEGS, hip: [0, -0.2, 0], sp: [0.05, -0.2, 0], hd: [0, 0.1, 0], sL: [-1.45, 0.1, 0.1], eL: [-0.2, 0, 0], sR: [-0.6, 0, -0.4], eR: [-1.3, 0, 0] })] },
    // Aniquilador: a postura muda — baixa o corpo, encara, a espada recolhe junto ao rosto (agressivo)
    arn_focus: { dur: 0.7, keys: [k(0, FENCE), k(0.5, { ...FENCE, h: -0.2, sp: [0.25, 0.6, 0], hd: [0.1, -0.6, 0], sR: [-1.9, 0.4, -0.2], eR: [-1.6, 0, 0], kL: [0.8, 0, 0], kR: [0.6, 0, 0] }), k(1, { ...FENCE, h: -0.18, sp: [0.2, 0.55, 0], hd: [0.05, -0.55, 0], sR: [-1.4, 0.2, -0.1], eR: [-0.7, 0, 0], kL: [0.7, 0, 0], kR: [0.5, 0, 0] })] },
    // Ensaio Geral: postura controlada, espada vertical na frente
    arn_guard: { dur: 0.5, keys: [k(0, FENCE), k(0.6, { ...FLEGS, sp: [0, 0.2, 0], hd: [0, -0.2, 0], sR: [-1.2, 0.5, 0], eR: [-1.6, 0, 0], sL: [0.55, 0.2, 0.35], eL: [-1.7, 0, 0] }), k(1, { ...FLEGS, sp: [0, 0.2, 0], hd: [0, -0.2, 0], sR: [-1.2, 0.5, 0], eR: [-1.6, 0, 0], sL: [0.55, 0.2, 0.35], eL: [-1.7, 0, 0] })] },
  });

  // ======================= VERÍSSIMO =======================
  // comandante: coluna firme, pés na largura dos ombros, espada baixa na diagonal, mão esquerda solta
  const CMD = {
    h: -0.05, hip: [0, -0.25, 0], sp: [-0.02, 0.2, 0], hd: [-0.05, -0.2, 0],
    sR: [-0.6, 0.15, -0.15], eR: [-0.55, 0, 0], sL: [-0.15, 0, 0.18], eL: [-0.45, 0, 0],
    lL: [-0.22, 0, 0.1], kL: [0.25, 0, 0], lR: [0.2, 0, -0.1], kR: [0.2, 0, 0],
  };
  const CLEGS = { h: CMD.h, hip: CMD.hip, lL: CMD.lL, kL: CMD.kL, lR: CMD.lR, kR: CMD.kR };
  Object.assign(CLIPS, {
    idle_verissimo: { dur: 2.4, loop: true, keys: [k(0, CMD), k(0.5, { ...CMD, h: -0.06, sp: [0, 0.2, 0] }), k(1, CMD)] },
    // estocada curta: o pé da frente avança pouco, braço reto, sem floreio
    ver_thrust: { dur: 0.3, keys: [k(0, { ...CMD, sR: [-1.0, 0.1, -0.1], eR: [-1.4, 0, 0] }), k(0.45, { ...CLEGS, h: -0.12, lL: [-0.55, 0, 0.1], kL: [0.55, 0, 0], sp: [0.1, -0.1, 0], hd: [0, 0, 0], sR: [-1.55, 0, 0], eR: [0, 0, 0], sL: [-0.1, 0, 0.3], eL: [-0.6, 0, 0] }), k(1, CMD)] },
    // corte seco e o retorno (curtos, do ombro, sem girar o corpo inteiro)
    ver_cut: { dur: 0.3, keys: [k(0, { ...CMD, sR: [-1.3, -0.9, 0], eR: [-0.5, 0, 0] }), k(0.45, { ...CMD, sp: [0.05, -0.2, 0], sR: [-1.4, 0.8, 0], eR: [-0.1, 0, 0] }), k(1, CMD)] },
    ver_back: { dur: 0.3, keys: [k(0, { ...CMD, sR: [-1.35, 0.8, 0], eR: [-0.3, 0, 0] }), k(0.45, { ...CMD, sp: [0.05, 0.45, 0], sR: [-1.4, -0.9, 0], eR: [-0.1, 0, 0] }), k(1, CMD)] },
    // Comando: golpe final forte, de cima, com o peso do corpo
    ver_command: { dur: 0.46, keys: [k(0, CMD), k(0.4, { ...CLEGS, h: -0.02, sp: [-0.2, 0.1, 0], hd: [-0.15, 0, 0], sR: [-2.9, 0, -0.1], eR: [-0.6, 0, 0], sL: [-2.7, 0.2, 0.1], eL: [-0.7, 0, 0] }), k(0.6, { ...CLEGS, h: -0.2, lL: [-0.6, 0, 0.1], kL: [0.7, 0, 0], sp: [0.5, 0, 0], hd: [0.1, 0, 0], sR: [-0.6, 0.1, 0], eR: [0, 0, 0], sL: [-0.6, -0.1, 0], eL: [-0.2, 0, 0] }), k(1, CMD)] },
    // ORDEM: observa, aponta com a mão esquerda e dá a ordem
    ver_order: { dur: 0.7, keys: [k(0, CMD), k(0.35, { ...CMD, hd: [0.05, -0.4, 0], sp: [0, 0.35, 0] }), k(0.6, { ...CLEGS, sp: [-0.05, -0.3, 0], hd: [-0.05, 0.25, 0], sL: [-1.6, -0.35, 0.15], eL: [0, 0, 0], sR: [-0.5, 0.1, -0.2], eR: [-0.5, 0, 0] }), k(1, { ...CLEGS, sp: [-0.05, -0.3, 0], hd: [-0.05, 0.25, 0], sL: [-1.55, -0.35, 0.15], eL: [-0.1, 0, 0], sR: [-0.5, 0.1, -0.2], eR: [-0.5, 0, 0] })] },
    // Guarda do Comandante: espada atravessada na frente, firme
    ver_guard: { dur: 0.62, keys: [k(0, CMD), k(0.25, { ...CLEGS, h: -0.12, sp: [0.1, 0.1, 0], hd: [0, -0.1, 0], sR: [-1.3, 0.6, -0.2], eR: [-1.3, 0, 0], sL: [-1.2, -0.4, 0.1], eL: [-1.5, 0, 0] }), k(1, { ...CLEGS, h: -0.12, sp: [0.1, 0.1, 0], hd: [0, -0.1, 0], sR: [-1.3, 0.6, -0.2], eR: [-1.3, 0, 0], sL: [-1.2, -0.4, 0.1], eL: [-1.5, 0, 0] })] },
    // Despertar: respira fundo, ajeita a roupa, puxa as mangas
    ver_sleeves: { dur: 1.4, keys: [
      k(0, CMD),
      k(0.2, { ...CLEGS, sp: [-0.15, 0, 0], hd: [-0.3, 0, 0], sL: [-0.3, 0, 0.3], eL: [-0.6, 0, 0], sR: [-0.3, 0, -0.3], eR: [-0.6, 0, 0] }),
      k(0.45, { ...CLEGS, sp: [0.1, 0, 0], hd: [0.2, 0, 0], sL: [-1.0, -0.8, 0.1], eL: [-1.6, 0, 0], sR: [-0.9, 0.3, -0.1], eR: [-1.5, 0, 0] }),
      k(0.7, { ...CLEGS, sp: [0.1, 0, 0], hd: [0.2, 0, 0], sR: [-1.0, 0.8, -0.1], eR: [-1.6, 0, 0], sL: [-0.9, -0.3, 0.1], eL: [-1.5, 0, 0] }),
      k(1, { ...CMD, h: -0.1, sR: [-1.1, 0.2, -0.1], eR: [-0.9, 0, 0] }),
    ] },
  });

  // ======================= ANFITRIÃO =======================
  // apresentador do caos: cabeça inclinada de lado, braços meio abertos, peso torto; trancos no meio da respiração
  const HOST = {
    h: -0.06, hip: [0, -0.1, 0.06], sp: [-0.08, 0.1, -0.08], hd: [0.12, 0.1, 0.42],
    sL: [-0.45, 0, 0.85], eL: [-0.7, 0, 0], sR: [-0.4, 0, -0.9], eR: [-0.6, 0, 0],
    lL: [-0.2, 0, 0.18], kL: [0.2, 0, 0], lR: [0.25, 0, -0.08], kR: [0.35, 0, 0],
  };
  const HLEGS = { h: HOST.h, hip: HOST.hip, lL: HOST.lL, kL: HOST.kL, lR: HOST.lR, kR: HOST.kR };
  Object.assign(CLIPS, {
    idle_host: { dur: 2.2, loop: true, keys: [
      k(0, HOST),
      k(0.3, { ...HOST, hd: [0.1, 0.12, 0.45] }),
      k(0.34, { ...HOST, hd: [0.05, -0.25, -0.35], sp: [-0.05, -0.15, 0.1] }), // tranco: a cabeça vira de repente
      k(0.6, { ...HOST, hd: [0.08, -0.2, -0.3], sp: [-0.05, -0.12, 0.08], sL: [-0.55, 0, 0.95] }),
      k(0.64, { ...HOST, hd: [0.2, 0.1, 0.5] }),
      k(1, HOST),
    ] },
    // reverência de apresentador: um braço dobrado na barriga, o outro aberto para a "plateia"
    host_bow: { dur: 0.9, keys: [k(0, HOST), k(0.45, { ...HLEGS, sp: [0.6, 0, 0], hd: [0.3, 0, 0], sR: [-0.7, -0.9, 0], eR: [-1.8, 0, 0], sL: [-0.2, 0, 1.3], eL: [-0.1, 0, 0], lL: [-0.35, 0, 0.18] }), k(0.75, { ...HLEGS, sp: [0.62, 0, 0], hd: [0.32, 0, 0], sR: [-0.7, -0.9, 0], eR: [-1.8, 0, 0], sL: [-0.2, 0, 1.35], eL: [-0.1, 0, 0] }), k(1, HOST)] },
    // risada: cabeça para trás, ombros sacudindo
    host_laugh: { dur: 0.8, keys: [k(0, HOST), k(0.2, { ...HLEGS, sp: [-0.3, 0, 0], hd: [-0.5, 0, 0.1], sL: [-0.2, 0, 1.1], eL: [-0.4, 0, 0], sR: [-0.2, 0, -1.1], eR: [-0.4, 0, 0] }), k(0.35, { ...HLEGS, sp: [-0.2, 0, 0], hd: [-0.35, 0, -0.1], sL: [-0.3, 0, 1.0], eL: [-0.5, 0, 0], sR: [-0.3, 0, -1.0], eR: [-0.5, 0, 0] }), k(0.5, { ...HLEGS, sp: [-0.32, 0, 0], hd: [-0.52, 0, 0.12], sL: [-0.2, 0, 1.15], eL: [-0.4, 0, 0], sR: [-0.2, 0, -1.15], eR: [-0.4, 0, 0] }), k(0.7, { ...HLEGS, sp: [-0.2, 0, 0], hd: [-0.3, 0, 0], sL: [-0.3, 0, 1.0], eL: [-0.5, 0, 0], sR: [-0.3, 0, -1.0], eR: [-0.5, 0, 0] }), k(1, HOST)] },
    // "apresentando o programa": varre o braço do relógio na frente do corpo
    host_present: { dur: 0.7, keys: [k(0, HOST), k(0.4, { ...HLEGS, sp: [-0.05, -0.5, 0], hd: [0, 0.4, 0.2], sL: [-1.5, -0.8, 0.2], eL: [-0.2, 0, 0], sR: [-0.3, 0, -0.9], eR: [-0.4, 0, 0] }), k(1, { ...HLEGS, sp: [-0.05, 0.4, 0], hd: [0, -0.3, 0.3], sL: [-1.5, 0.9, 0.4], eL: [-0.1, 0, 0], sR: [-0.3, 0, -0.9], eR: [-0.4, 0, 0] })] },
    // Chicotada do Caos: o braço sobe atrás da cabeça e desce estalando
    host_lash: { dur: 0.5, keys: [k(0, HOST), k(0.35, { ...HLEGS, sp: [-0.25, -0.5, 0], hd: [0, 0.3, 0.2], sL: [-2.9, 0.5, 0.4], eL: [-1.2, 0, 0] }), k(0.6, { ...HLEGS, h: -0.12, sp: [0.4, 0.4, 0], hd: [0.1, -0.2, 0.3], sL: [-1.0, -0.6, 0.1], eL: [0, 0, 0] }), k(1, HOST)] },
    // olha para a "câmera" (de frente, cabeça torta) — A Plateia e as ocorrências aleatórias
    host_look: { dur: 0.6, keys: [k(0, HOST), k(0.3, { ...HOST, hip: [0, 0.6, 0], sp: [0, 0.6, 0], hd: [0.05, 0.6, 0.6] }), k(1, { ...HOST, hip: [0, 0.6, 0], sp: [0, 0.6, 0], hd: [0.05, 0.62, 0.65] })] },
    // inclinação impossível (movimento "errado" do caos): o tronco dobra de lado além do normal
    host_tilt: { dur: 0.5, keys: [k(0, HOST), k(0.3, { ...HOST, sp: [0.1, 0, -0.9], hd: [0, 0, -0.8], sL: [-0.2, 0, 1.6], eL: [-0.1, 0, 0], sR: [-0.2, 0, -0.3], eR: [-0.2, 0, 0] }), k(0.7, { ...HOST, sp: [0.1, 0, -0.95], hd: [0, 0, -0.85], sL: [-0.2, 0, 1.6], eL: [-0.1, 0, 0] }), k(1, HOST)] },
    // Botão do Anfitrião: agacha, a mão paira sobre o botão (tensão)... e aperta
    host_press: { dur: 1.0, keys: [
      k(0, HOST),
      k(0.3, { h: -0.3, hip: [0, 0, 0], sp: [0.55, 0, 0.1], hd: [0.1, 0, 0.5], sR: [-2.0, 0, -0.35], eR: [-1.1, 0, 0], sL: [-0.2, 0, 1.3], eL: [-0.2, 0, 0], lL: [-0.8, 0, 0.12], kL: [1.3, 0, 0], lR: [-0.25, 0, -0.1], kR: [0.8, 0, 0] }),
      k(0.62, { h: -0.32, hip: [0, 0, 0], sp: [0.6, 0, 0.12], hd: [0.15, 0, 0.6], sR: [-2.1, 0, -0.3], eR: [-1.2, 0, 0], sL: [-0.2, 0, 1.35], eL: [-0.2, 0, 0], lL: [-0.8, 0, 0.12], kL: [1.3, 0, 0], lR: [-0.25, 0, -0.1], kR: [0.8, 0, 0] }),
      k(0.72, { h: -0.38, hip: [0, 0, 0], sp: [0.8, 0, 0], hd: [0.3, 0, 0.2], sR: [-1.1, 0, -0.15], eR: [-0.1, 0, 0], sL: [-0.2, 0, 1.4], eL: [-0.2, 0, 0], lL: [-0.85, 0, 0.12], kL: [1.4, 0, 0], lR: [-0.25, 0, -0.1], kR: [0.85, 0, 0] }),
      k(1, { h: -0.36, hip: [0, 0, 0], sp: [0.75, 0, 0], hd: [0.2, 0, 0.3], sR: [-1.15, 0, -0.15], eR: [-0.1, 0, 0], sL: [-0.2, 0, 1.4], eL: [-0.2, 0, 0], lL: [-0.85, 0, 0.12], kL: [1.4, 0, 0], lR: [-0.25, 0, -0.1], kR: [0.85, 0, 0] }),
    ] },
    // Tradição de Família: junta a Energia entre as mãos, tremendo... e abre os braços na explosão
    host_charge: { dur: 1.0, keys: [
      k(0, HOST),
      k(0.25, { h: -0.25, hip: [0, 0, 0], sp: [0.3, 0, 0], hd: [0.2, 0, 0.2], sL: [-1.2, 0.6, 0.25], eL: [-1.5, 0, 0], sR: [-1.2, -0.6, -0.25], eR: [-1.5, 0, 0], lL: [-0.55, 0, 0.25], kL: [0.9, 0, 0], lR: [-0.15, 0, -0.25], kR: [0.8, 0, 0] }),
      k(0.5, { h: -0.27, hip: [0, 0, 0], sp: [0.34, 0.05, 0.05], hd: [0.25, 0.05, 0.3], sL: [-1.25, 0.65, 0.2], eL: [-1.55, 0, 0], sR: [-1.25, -0.65, -0.2], eR: [-1.55, 0, 0], lL: [-0.55, 0, 0.25], kL: [0.95, 0, 0], lR: [-0.15, 0, -0.25], kR: [0.85, 0, 0] }),
      k(0.75, { h: -0.28, hip: [0, 0, 0], sp: [0.36, -0.05, -0.05], hd: [0.28, -0.05, 0.1], sL: [-1.2, 0.7, 0.2], eL: [-1.6, 0, 0], sR: [-1.2, -0.7, -0.2], eR: [-1.6, 0, 0], lL: [-0.55, 0, 0.25], kL: [0.95, 0, 0], lR: [-0.15, 0, -0.25], kR: [0.85, 0, 0] }),
      k(0.85, { h: 0, hip: [0, 0, 0], sp: [-0.35, 0, 0], hd: [-0.5, 0, 0], sL: [-0.6, 0, 1.6], eL: [-0.1, 0, 0], sR: [-0.6, 0, -1.6], eR: [-0.1, 0, 0], lL: [-0.3, 0, 0.3], kL: [0.2, 0, 0], lR: [0.1, 0, -0.3], kR: [0.2, 0, 0] }),
      k(1, { h: 0, hip: [0, 0, 0], sp: [-0.3, 0, 0], hd: [-0.45, 0, 0], sL: [-0.6, 0, 1.55], eL: [-0.1, 0, 0], sR: [-0.6, 0, -1.55], eR: [-0.1, 0, 0], lL: [-0.3, 0, 0.3], kL: [0.2, 0, 0], lR: [0.1, 0, -0.3], kR: [0.2, 0, 0] }),
    ] },
    // ergue o braço do relógio bem alto (Tempo Distorcido, Multiplicação, Regra do Caos)
    host_cast: { dur: 0.8, keys: [
      k(0, HOST),
      k(0.35, { ...HLEGS, sp: [-0.2, -0.2, 0.15], hd: [-0.35, -0.1, 0.35], sL: [-2.9, 0, 0.3], eL: [-0.2, 0, 0], sR: [-0.3, 0, -1.2], eR: [-0.3, 0, 0] }),
      k(0.8, { ...HLEGS, sp: [-0.22, -0.2, 0.18], hd: [-0.38, -0.1, 0.45], sL: [-2.95, 0, 0.32], eL: [-0.15, 0, 0], sR: [-0.3, 0, -1.25], eR: [-0.3, 0, 0] }),
      k(1, HOST),
    ] },
  });
}
