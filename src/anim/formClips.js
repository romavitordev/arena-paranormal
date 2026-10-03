// Animações próprias das FORMAS (Deus da Morte e Diabo). Antes elas usavam os golpes humanos (socos, facas).
// Chamado no fim de clips.js (recebe CLIPS e os ajudantes para não criar import circular).
//   dm_*: DEUS DA MORTE — primata gigante e curvado, braços longos e pesados, golpes lentos com o corpo inteiro.
//   db_*: DIABO — predador agachado em pernas de bode, garras abertas, ataques rápidos e selvagens.

export function addFormClips(CLIPS, k, mirrorPose) {
  const legsOf = (p) => ({ h: p.h, lL: p.lL, kL: p.kL, lR: p.lR, kR: p.kR });
  // espelha só a parte de cima (braços/tronco) e mantém a base das pernas: golpe com o outro braço sem trocar a guarda
  const mirrorTop = (p) => ({ ...mirrorPose(p), ...legsOf(p), hip: p.hip });
  // locomoção travada (passo lateral / recuo): pernas do clipe genérico, tronco e braços da forma
  const withTop = (clip, top, dh) => ({ ...clip, keys: clip.keys.map((key) => ({ t: key.t, pose: { ...key.pose, ...top, h: (key.pose.h || 0) + dh } })) });

  // ======================= DEUS DA MORTE =======================
  const DM = { h: -0.1, hip: [0, -0.15, 0], sp: [0.45, 0.1, 0], hd: [-0.2, -0.1, 0], sL: [-0.25, 0, 0.35], eL: [-0.5, 0, 0], sR: [-0.25, 0, -0.35], eR: [-0.5, 0, 0], lL: [-0.2, 0, 0.16], kL: [0.35, 0, 0], lR: [0.2, 0, -0.16], kR: [0.35, 0, 0] };
  const DM_LEGS = legsOf(DM);
  const DM_TOP = { sp: DM.sp, hd: DM.hd, sL: DM.sL, eL: DM.eL, sR: DM.sR, eR: DM.eR };
  const DM_LUNGE = { h: -0.2, lL: [-0.7, 0, 0.14], kL: [0.75, 0, 0], lR: [0.5, 0, -0.14], kR: [0.5, 0, 0] };
  const DM_SQUAT = { h: -0.45, lL: [-0.95, 0, 0.25], kL: [1.3, 0, 0], lR: [0.5, 0, -0.25], kR: [1.05, 0, 0] };
  const dmStep = { h: -0.12, hip: [0, -0.1, 0.06], sp: [0.5, 0.15, -0.1], hd: [-0.25, -0.1, 0.08], sL: [0.3, 0, 0.4], eL: [-0.4, 0, 0], sR: [-0.45, 0, -0.4], eR: [-0.7, 0, 0], lL: [-0.65, 0, 0.1], kL: [0.25, 0, 0], lR: [0.45, 0, -0.1], kR: [0.45, 0, 0] };
  const dmPass = { h: -0.04, hip: [0, 0, 0], sp: [0.48, 0, 0], hd: [-0.22, 0, 0], sL: [0, 0, 0.4], eL: [-0.5, 0, 0], sR: [0, 0, -0.4], eR: [-0.5, 0, 0], lL: [-0.15, 0, 0.12], kL: [0.2, 0, 0], lR: [0, 0, -0.12], kR: [0.85, 0, 0] };
  const dmCharge = { h: -0.18, hip: [0, 0, 0], sp: [0.2, 0, 0], hd: [-0.35, 0, 0], sL: [-0.5, 0, 1.1], eL: [-0.6, 0, 0], sR: [-0.5, 0, -1.1], eR: [-0.6, 0, 0], lL: [-0.25, 0, 0.3], kL: [0.55, 0, 0], lR: [0.25, 0, -0.3], kR: [0.55, 0, 0] };
  const dmSmashHit = { ...DM_SQUAT, hip: [0, 0, 0], sp: [1.05, 0, 0], hd: [0.1, 0, 0], sL: [-0.5, -0.25, 0.05], eL: [-0.1, 0, 0], sR: [-0.5, 0.25, -0.05], eR: [-0.1, 0, 0] };
  const dmGround = { ...DM_SQUAT, h: -0.55, sp: [1.1, 0, 0], hd: [0, 0, 0], sL: [-0.9, -0.2, 0.3], eL: [-0.1, 0, 0], sR: [-0.9, 0.2, -0.3], eR: [-0.1, 0, 0] };
  const dmLift = { ...DM_LEGS, h: -0.02, sp: [-0.1, 0.25, 0], hd: [-0.45, 0, 0], sR: [-2.95, 0.1, -0.1], eR: [-0.15, 0, 0], sL: [-0.3, 0, 0.6], eL: [-0.5, 0, 0] };
  const dmStompHit = { h: -0.3, hip: [0, 0, 0], sp: [0.75, 0, 0], hd: [0.3, 0, 0], sL: [-0.3, 0, 0.7], eL: [-0.5, 0, 0], sR: [-0.3, 0, -0.7], eR: [-0.5, 0, 0], lL: [0.15, 0, 0.15], kL: [0.6, 0, 0], lR: [-0.75, 0, -0.12], kR: [0.6, 0, 0] };
  const dmAirHit = { sp: [1.0, 0, 0], hd: [0.2, 0, 0], sL: [-0.6, -0.25, 0], eL: [-0.1, 0, 0], sR: [-0.6, 0.25, 0], eR: [-0.1, 0, 0], lL: [-0.6, 0, 0], kL: [1.0, 0, 0], lR: [0.1, 0, 0], kR: [0.8, 0, 0] };
  const dmGrab = { ...DM_LUNGE, sp: [0.7, 0, 0], hd: [-0.1, 0, 0], sL: [-1.4, -0.4, 0.1], eL: [-0.25, 0, 0], sR: [-1.4, 0.4, -0.1], eR: [-0.25, 0, 0] };
  const dmPoint = { ...DM_LEGS, hip: DM.hip, sp: [0.35, 0.4, 0], hd: [-0.15, -0.3, 0], sR: [-1.5, 0.1, -0.1], eR: [-0.1, 0, 0], sL: DM.sL, eL: DM.eL };
  const dmBlock = { ...DM, sp: [0.55, 0, 0], sL: [-1.4, -0.4, 0.2], eL: [-1.9, 0, 0], sR: [-1.4, 0.4, -0.2], eR: [-1.9, 0, 0] };
  Object.assign(CLIPS, {
    // caminhada pesada: o corpo balança de um lado para o outro e os braços longos pendulam
    dm_walk: { dur: 1.3, loop: true, stride: 1.5, keys: [k(0, dmStep), k(0.25, dmPass), k(0.5, mirrorPose(dmStep)), k(0.75, mirrorPose(dmPass)), k(1, dmStep)] },
    dm_strafe_L: withTop(CLIPS.strafe_L, DM_TOP, -0.04),
    dm_strafe_R: withTop(CLIPS.strafe_R, { ...DM_TOP, sp: [0.45, -0.1, 0], hd: [-0.2, 0.1, 0] }, -0.04),
    dm_walk_back: withTop(CLIPS.walk_back, DM_TOP, -0.06),
    // arrancada: inclina muito e arrasta os braços
    dm_dash: {
      dur: 0.5, loop: true, keys: [
        k(0, { h: -0.26, sp: [0.85, 0, 0], hd: [-0.55, 0, 0], sL: [0.6, 0, 0.5], eL: [-0.3, 0, 0], sR: [0.6, 0, -0.5], eR: [-0.3, 0, 0], lL: [-1.0, 0, 0], kL: [0.9, 0, 0], lR: [0.8, 0, 0], kR: [1.2, 0, 0] }),
        k(0.5, { h: -0.2, sp: [0.8, 0, 0], hd: [-0.5, 0, 0], sL: [0.5, 0, 0.5], eL: [-0.3, 0, 0], sR: [0.5, 0, -0.5], eR: [-0.3, 0, 0], lL: [0.7, 0, 0], kL: [1.2, 0, 0], lR: [-0.9, 0, 0], kR: [0.8, 0, 0] }),
        k(1, { h: -0.26, sp: [0.85, 0, 0], hd: [-0.55, 0, 0], sL: [0.6, 0, 0.5], eL: [-0.3, 0, 0], sR: [0.6, 0, -0.5], eR: [-0.3, 0, 0], lL: [-1.0, 0, 0], kL: [0.9, 0, 0], lR: [0.8, 0, 0], kR: [1.2, 0, 0] }),
      ],
    },
    // tapa de costas da mão direita: abre o braço todo para o lado e varre por dentro
    dm_slap: {
      dur: 0.5, keys: [
        k(0, DM),
        k(0.3, { ...DM_LEGS, hip: [0, -0.35, 0], sp: [0.4, -0.5, 0], hd: [-0.2, 0.35, 0], sR: [-1.3, -1.1, -0.3], eR: [-0.6, 0, 0], sL: [-0.4, 0, 0.5], eL: [-0.6, 0, 0] }),
        k(0.5, { ...DM_LUNGE, hip: [0, 0.4, 0], sp: [0.55, 0.8, 0], hd: [-0.2, -0.3, 0], sR: [-1.45, 0.9, -0.1], eR: [-0.15, 0, 0], sL: [-0.2, 0, 0.6], eL: [-0.5, 0, 0] }),
        k(0.72, { ...DM_LUNGE, hip: [0, 0.45, 0], sp: [0.55, 0.95, 0], hd: [-0.2, -0.35, 0], sR: [-1.2, 1.3, 0], eR: [-0.2, 0, 0], sL: [-0.2, 0, 0.6], eL: [-0.5, 0, 0] }),
        k(1, DM),
      ],
    },
    // gancho da esquerda: o braço longo sobe por cima e desce cruzando
    dm_hook: {
      dur: 0.54, keys: [
        k(0, DM),
        k(0.33, { ...DM_LEGS, hip: [0, 0.3, 0], sp: [0.3, 0.55, 0], hd: [-0.3, -0.3, 0], sL: [-2.4, 0.6, 0.6], eL: [-0.8, 0, 0], sR: [-0.3, 0, -0.5], eR: [-0.6, 0, 0] }),
        k(0.55, { ...DM_LUNGE, hip: [0, -0.35, 0], sp: [0.65, -0.7, 0], hd: [-0.2, 0.35, 0], sL: [-1.3, -0.9, 0.1], eL: [-0.4, 0, 0], sR: [-0.2, 0, -0.6], eR: [-0.5, 0, 0] }),
        k(0.75, { ...DM_LUNGE, hip: [0, -0.4, 0], sp: [0.65, -0.85, 0], hd: [-0.2, 0.4, 0], sL: [-1.1, -1.2, 0.1], eL: [-0.4, 0, 0], sR: [-0.2, 0, -0.6], eR: [-0.5, 0, 0] }),
        k(1, DM),
      ],
    },
    // martelada dupla: junta os punhos acima da cabeça e esmaga com o corpo inteiro
    dm_smash: {
      dur: 0.7, keys: [
        k(0, DM),
        k(0.4, { ...DM_LEGS, h: -0.02, sp: [-0.25, 0, 0], hd: [-0.4, 0, 0], sL: [-2.9, -0.3, 0.1], eL: [-0.6, 0, 0], sR: [-2.9, 0.3, -0.1], eR: [-0.6, 0, 0] }),
        k(0.56, dmSmashHit),
        k(0.78, { ...dmSmashHit, sp: [1.0, 0, 0] }),
        k(1, DM),
      ],
    },
    // erguer pelo pescoço: estica a mão baixa à frente e levanta o braço reto acima da cabeça
    dm_lift: { dur: 0.56, keys: [k(0, DM), k(0.3, { ...DM_LUNGE, sp: [0.75, 0.3, 0], hd: [0, 0, 0], sR: [-1.2, 0.3, -0.1], eR: [-0.2, 0, 0], sL: [-0.2, 0, 0.5], eL: [-0.5, 0, 0] }), k(0.56, dmLift), k(0.8, dmLift), k(1, DM)] },
    // pisão: ergue a perna enorme e afunda o chão
    dm_stomp: {
      dur: 0.62, keys: [
        k(0, DM),
        k(0.38, { h: -0.04, hip: [0, 0, 0], sp: [0.3, 0, 0.08], hd: [0.1, 0, 0], sL: [-0.6, 0, 0.9], eL: [-0.5, 0, 0], sR: [-0.6, 0, -0.9], eR: [-0.5, 0, 0], lL: [0, 0, 0.12], kL: [0.2, 0, 0], lR: [-1.3, 0, -0.1], kR: [1.5, 0, 0] }),
        k(0.58, dmStompHit),
        k(0.8, dmStompHit),
        k(1, DM),
      ],
    },
    // queda do deus: no ar, punhos acima da cabeça, despenca com tudo
    dm_air: {
      dur: 0.5, keys: [
        k(0, { sp: [-0.3, 0, 0], hd: [-0.3, 0, 0], sL: [-3.0, -0.3, 0.2], eL: [-0.5, 0, 0], sR: [-3.0, 0.3, -0.2], eR: [-0.5, 0, 0], lL: [-0.8, 0, 0], kL: [1.3, 0, 0], lR: [-0.3, 0, 0], kR: [1.2, 0, 0] }),
        k(0.45, dmAirHit),
        k(1, { ...dmAirHit, sp: [0.85, 0, 0] }),
      ],
    },
    // onda de lodo / mãos dos mortos: ergue as palmas e bate as duas no chão
    dm_cast: { dur: 0.8, keys: [k(0, DM), k(0.35, { ...DM_LEGS, h: -0.05, sp: [0.1, 0, 0], hd: [-0.3, 0, 0], sL: [-2.6, 0, 0.5], eL: [-0.7, 0, 0], sR: [-2.6, 0, -0.5], eR: [-0.7, 0, 0] }), k(0.55, dmGround), k(0.85, dmGround), k(1, DM)] },
    // agarra com as duas mãos enormes
    dm_grab: { dur: 0.36, keys: [k(0, DM), k(0.6, dmGrab), k(1, { ...dmGrab, sL: [-1.35, -0.5, 0.1], eL: [-0.8, 0, 0], sR: [-1.35, 0.5, -0.1], eR: [-0.8, 0, 0] })] },
    // estende a palma devagar (Senhor do Tempo)
    dm_point: { dur: 0.6, keys: [k(0, DM), k(0.4, dmPoint), k(1, dmPoint)] },
    // carga / concentração: abre os braços com as palmas para cima, cabeça para trás
    dm_charge: { dur: 1.0, loop: true, keys: [k(0, dmCharge), k(0.5, { ...dmCharge, h: -0.22, hd: [-0.42, 0, 0], sL: [-0.55, 0, 1.18], sR: [-0.55, 0, -1.18] }), k(1, dmCharge)] },
    // golpe recebido: quase não se mexe (massa enorme)
    dm_hit: { dur: 0.32, keys: [k(0, DM), k(0.3, { ...DM, h: -0.14, sp: [0.25, 0, 0.08], hd: [-0.4, 0, 0], sL: [-0.4, 0, 0.5], sR: [-0.4, 0, -0.5] }), k(1, DM)] },
    dm_block: { dur: 0.8, loop: true, keys: [k(0, dmBlock), k(1, { ...dmBlock, sp: [0.57, 0, 0] })] },
    dm_block_hit: { dur: 0.3, keys: [k(0, { ...dmBlock, h: -0.16, sp: [0.35, 0, 0] }), k(1, dmBlock)] },
    // vitória: endireita o corpo, abre os braços e olha para baixo, para a vítima
    dm_victory: { dur: 1.4, keys: [k(0, DM), k(1, { h: -0.02, hip: [0, 0, 0], sp: [0.1, 0, 0], hd: [0.25, 0, 0.15], sL: [-0.4, 0, 0.75], eL: [-0.3, 0, 0], sR: [-0.4, 0, -0.75], eR: [-0.3, 0, 0], lL: [-0.1, 0, 0.18], kL: [0.1, 0, 0], lR: [0.1, 0, -0.18], kR: [0.1, 0, 0] })] },
  });

  // ======================= DIABO =======================
  const DB = { h: -0.22, hip: [0, -0.2, 0], sp: [0.5, 0.2, 0], hd: [-0.4, -0.2, 0], sL: [-0.7, 0, 0.75], eL: [-1.1, 0, 0], sR: [-0.7, 0, -0.75], eR: [-1.1, 0, 0], lL: [-0.55, 0, 0.25], kL: [0.95, 0, 0], lR: [0.3, 0, -0.25], kR: [0.8, 0, 0] };
  const DB_LEGS = legsOf(DB);
  const DB_TOP = { sp: DB.sp, hd: DB.hd, sL: DB.sL, eL: DB.eL, sR: DB.sR, eR: DB.eR };
  const DB_LUNGE = { h: -0.3, lL: [-1.0, 0, 0.2], kL: [1.05, 0, 0], lR: [0.7, 0, -0.2], kR: [0.55, 0, 0] };
  const DB_LOW = { h: -0.5, lL: [-1.05, 0, 0.3], kL: [1.5, 0, 0], lR: [0.5, 0, -0.3], kR: [1.4, 0, 0] };
  const dbWindR = { ...DB_LEGS, hip: [0, -0.35, 0], sp: [0.4, -0.5, 0], hd: [-0.35, 0.3, 0], sR: [-2.0, -1.0, -0.6], eR: [-0.5, 0, 0], sL: [-0.6, 0, 0.8], eL: [-1.1, 0, 0] };
  const dbHitR = { ...DB_LUNGE, hip: [0, 0.3, 0], sp: [0.65, 0.8, 0], hd: [-0.4, -0.3, 0], sR: [-1.0, 1.1, -0.1], eR: [-0.2, 0, 0], sL: [-0.5, 0, 0.9], eL: [-1.0, 0, 0] };
  const dbRendUp = { ...DB_LEGS, h: -0.12, sp: [-0.15, 0, 0], hd: [-0.5, 0, 0], sL: [-2.8, 0, 0.6], eL: [-0.5, 0, 0], sR: [-2.8, 0, -0.6], eR: [-0.5, 0, 0] };
  const dbRendHit = { ...DB_LUNGE, sp: [0.95, 0, 0], hd: [-0.2, 0, 0], sL: [-0.6, 0, 1.1], eL: [-0.2, 0, 0], sR: [-0.6, 0, -1.1], eR: [-0.2, 0, 0] };
  const dbDownHit = { ...DB_LOW, h: -0.55, hip: [0, 0, 0], sp: [1.15, 0, 0], hd: [-0.4, 0, 0], sL: [-0.9, -0.2, 0.2], eL: [-0.1, 0, 0], sR: [-0.9, 0.2, -0.2], eR: [-0.1, 0, 0] };
  const dbAirHit = { sp: [0.9, 0, 0], hd: [-0.6, 0, 0], sL: [-1.2, -0.3, 0.2], eL: [-0.1, 0, 0], sR: [-1.2, 0.3, -0.2], eR: [-0.1, 0, 0], lL: [0.3, 0, 0.1], kL: [1.0, 0, 0], lR: [0.4, 0, -0.1], kR: [1.1, 0, 0] };
  const dbRoar = { h: -0.1, hip: [0, 0, 0], lL: [-0.4, 0, 0.35], kL: [0.6, 0, 0], lR: [0.35, 0, -0.35], kR: [0.6, 0, 0], sp: [-0.35, 0, 0], hd: [-0.6, 0, 0], sL: [-2.0, 0, 1.2], eL: [-0.6, 0, 0], sR: [-2.0, 0, -1.2], eR: [-0.6, 0, 0] };
  const dbCharge = { h: -0.32, hip: [0, 0, 0], lL: [-0.4, 0, 0.4], kL: [0.95, 0, 0], lR: [0.4, 0, -0.4], kR: [0.95, 0, 0], sp: [0.55, 0, 0], hd: [0.1, 0, 0], sL: [-0.4, 0, 1.0], eL: [-1.0, 0, 0], sR: [-0.4, 0, -1.0], eR: [-1.0, 0, 0] };
  const dbBlock = { ...DB_LEGS, h: -0.28, hip: DB.hip, sp: [0.55, 0, 0], hd: [0.1, 0, 0], sL: [-1.5, -0.55, 0.1], eL: [-1.8, 0, 0], sR: [-1.5, 0.55, -0.1], eR: [-1.8, 0, 0] };
  const dbPoint = { ...DB_LEGS, hip: DB.hip, sp: [0.5, 0.4, 0], hd: [-0.4, -0.3, 0], sR: [-1.55, 0.1, -0.1], eR: [-0.1, 0, 0], sL: DB.sL, eL: DB.eL };
  const dbVictory = { h: -0.05, hip: [0, 0, 0], lL: [-0.2, 0, 0.25], kL: [0.3, 0, 0], lR: [0.2, 0, -0.25], kR: [0.3, 0, 0], sp: [-0.3, 0, 0], hd: [-0.55, 0, 0], sL: [-2.3, 0, 1.1], eL: [-0.5, 0, 0], sR: [-2.3, 0, -1.1], eR: [-0.5, 0, 0] };
  Object.assign(CLIPS, {
    // agachado nas pernas de bode, garras abertas, respiração rápida
    db_idle: { dur: 0.9, loop: true, keys: [k(0, DB), k(0.5, { ...DB, h: -0.25, sp: [0.55, 0.2, 0], sL: [-0.75, 0, 0.85], eL: [-1.2, 0, 0], sR: [-0.75, 0, -0.85], eR: [-1.2, 0, 0] }), k(1, DB)] },
    // corrida de predador: bem inclinado, braços (e garras) para trás
    db_run: {
      ...CLIPS.run,
      keys: CLIPS.run.keys.map((key) => ({ t: key.t, pose: { ...key.pose, h: key.pose.h - 0.1, sp: [0.75, key.pose.sp[1], 0], hd: [-0.6, 0, 0], sL: [0.9, 0, 0.5], eL: [-0.4, 0, 0], sR: [0.9, 0, -0.5], eR: [-0.4, 0, 0] } })),
    },
    db_strafe_L: withTop(CLIPS.strafe_L, DB_TOP, -0.14),
    db_strafe_R: withTop(CLIPS.strafe_R, { ...DB_TOP, sp: [0.5, -0.2, 0], hd: [-0.4, 0.2, 0] }, -0.14),
    db_walk_back: withTop(CLIPS.walk_back, DB_TOP, -0.16),
    db_dash: { dur: 0.4, loop: true, keys: [k(0, { ...DB_LUNGE, h: -0.36, sp: [0.9, 0, 0], hd: [-0.7, 0, 0], sL: [0.9, 0, 0.6], eL: [-0.3, 0, 0], sR: [0.9, 0, -0.6], eR: [-0.3, 0, 0] }), k(1, { ...DB_LUNGE, h: -0.32, sp: [0.85, 0, 0], hd: [-0.65, 0, 0], sL: [0.8, 0, 0.6], eL: [-0.3, 0, 0], sR: [0.8, 0, -0.6], eR: [-0.3, 0, 0] })] },
    // garras: varrem de fora para dentro com o corpo girando
    db_claw_r: { dur: 0.28, keys: [k(0, DB), k(0.25, dbWindR), k(0.5, dbHitR), k(1, DB)] },
    db_claw_l: { dur: 0.28, keys: [k(0, DB), k(0.25, mirrorTop(dbWindR)), k(0.5, mirrorTop(dbHitR)), k(1, DB)] },
    // quatro garras: direita e esquerda em seguida
    db_cross: { dur: 0.4, keys: [k(0, DB), k(0.15, dbWindR), k(0.38, dbHitR), k(0.7, mirrorTop(dbHitR)), k(1, DB)] },
    // rasgar: ergue as garras e rasga para baixo e para fora
    db_rend: { dur: 0.55, keys: [k(0, DB), k(0.35, dbRendUp), k(0.58, dbRendHit), k(0.8, dbRendHit), k(1, DB)] },
    // garra ascendente: agacha fundo e arranca para cima com as duas mãos
    db_up: {
      dur: 0.4, keys: [
        k(0, DB),
        k(0.3, { ...DB_LOW, h: -0.42, sp: [0.85, 0, 0], hd: [-0.5, 0, 0], sL: [-0.3, 0, 0.4], eL: [-0.3, 0, 0], sR: [-0.3, 0, -0.4], eR: [-0.3, 0, 0] }),
        k(0.6, { h: 0.02, lL: [-0.3, 0, 0.15], kL: [0.3, 0, 0], lR: [0.3, 0, -0.15], kR: [0.6, 0, 0], sp: [-0.3, 0, 0], hd: [-0.5, 0, 0], sL: [-2.9, 0, 0.35], eL: [-0.3, 0, 0], sR: [-2.9, 0, -0.35], eR: [-0.3, 0, 0] }),
        k(1, DB),
      ],
    },
    // cravar: salta de leve e enterra as garras no chão
    db_down: { dur: 0.46, keys: [k(0, DB), k(0.35, { ...DB_LEGS, h: -0.08, sp: [0.1, 0, 0], hd: [-0.45, 0, 0], sL: [-2.5, -0.2, 0.5], eL: [-0.9, 0, 0], sR: [-2.5, 0.2, -0.5], eR: [-0.9, 0, 0] }), k(0.58, dbDownHit), k(0.8, dbDownHit), k(1, DB)] },
    // mergulho: no ar, garras à frente e para baixo
    db_air: { dur: 0.42, keys: [k(0, { sp: [-0.2, 0, 0], hd: [-0.3, 0, 0], sL: [-2.6, 0, 0.7], eL: [-0.7, 0, 0], sR: [-2.6, 0, -0.7], eR: [-0.7, 0, 0], lL: [-0.9, 0, 0], kL: [1.6, 0, 0], lR: [-0.5, 0, 0], kR: [1.5, 0, 0] }), k(0.4, dbAirHit), k(1, { ...dbAirHit, sL: [-1.0, -0.3, 0.2], sR: [-1.0, 0.3, -0.2] })] },
    // lança de sangue: puxa o braço por cima e arremessa com o corpo
    db_throw: {
      dur: 0.45, keys: [
        k(0, DB),
        k(0.35, { ...DB_LEGS, hip: DB.hip, sp: [0.2, -0.6, 0], hd: [-0.4, 0.4, 0], sR: [-2.7, -0.4, -0.3], eR: [-1.2, 0, 0], sL: [-1.2, 0.3, 0.4], eL: [-0.6, 0, 0] }),
        k(0.6, { ...DB_LUNGE, hip: DB.hip, sp: [0.7, 0.6, 0], hd: [-0.5, -0.3, 0], sR: [-1.3, 0.4, -0.1], eR: [-0.1, 0, 0], sL: [-0.3, 0, 0.8], eL: [-0.9, 0, 0] }),
        k(1, DB),
      ],
    },
    db_point: { dur: 0.5, keys: [k(0, DB), k(0.4, dbPoint), k(1, dbPoint)] },
    // ódio do diabo: urra com o peito aberto e os braços para cima
    db_powerup: { dur: 0.6, keys: [k(0, DB), k(0.4, dbRoar), k(0.8, { ...dbRoar, hd: [-0.7, 0, 0], sL: [-2.1, 0, 1.25], sR: [-2.1, 0, -1.25] }), k(1, DB)] },
    db_charge: { dur: 0.7, loop: true, keys: [k(0, dbCharge), k(0.5, { ...dbCharge, h: -0.36, sp: [0.6, 0, 0], sL: [-0.45, 0, 1.08], sR: [-0.45, 0, -1.08] }), k(1, dbCharge)] },
    db_block: { dur: 0.8, loop: true, keys: [k(0, dbBlock), k(1, { ...dbBlock, h: -0.3 })] },
    db_block_hit: { dur: 0.3, keys: [k(0, { ...dbBlock, h: -0.34, sp: [0.3, 0, 0] }), k(1, dbBlock)] },
    // vitória: braços abertos para o alto, cabeça para trás, rindo
    db_victory: { dur: 1.2, keys: [k(0, DB), k(0.6, dbVictory), k(0.8, { ...dbVictory, hd: [-0.45, 0, 0] }), k(1, dbVictory)] },
  });
}
