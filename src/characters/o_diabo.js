// O DIABO (id: o_diabo) — PORTADORES DAS RELÍQUIAS. O Portador da Relíquia de Sangue — o DIABO DE ORDEM PARANORMAL
// (modelo próprio o_diabo.glb, a miniatura que o usuário mandou: pele vermelha, chifres anelados, sorriso de dentes
// finos, manto preto de capuz com frisos vermelhos, garras), lutando desde o começo da luta. Os golpes, rituais e o
// Pacto são os da forma do Trono (forms/diabo.js). TRANSFORMAÇÃO: o RENASCIMENTO — o Trono sobe e ele vira O PORTADOR
// DO TRONO (a fusão com o Henri, a forma 'diabo', a mesma que o Juan alcança no 2º estágio).
// Como joga a luta inteira, a vida volta ao padrão e a regeneração é menor que a da forma.
import form from './forms/diabo.js';

const { form: _isForm, baseId: _base, ...kit } = form;

export default {
  ...kit,
  id: 'o_diabo',
  name: 'O DIABO',
  model: 'o_diabo',
  color: '#a01818',
  origin: 'Relíquias', // a Relíquia de Sangue (2026-10-27: Portadores ≠ Relíquias)
  info: {
    weapon: 'Quatro braços com garras',
    style: 'Garras em sequência, lanças e poças de sangue, a horda de Zumbis de Sangue e o Pacto',
    identity: 'O Portador da Relíquia de Sangue: regenera, bebe o sangue derramado e oferece pactos',
    tagline: 'Eu vim te oferecer um pacto.',
  },
  // a forma do Trono tem regeneração forte por ser o fim do round; o Diabo comum: tamanho padrão e a vida de Portador
  stats: { moveSpeed: 8.0, maxHealth: 1550 }, // Portador das Relíquias: aguenta mais que o elenco (balanceamento v3.32: era 1800)
  regen: { every: 9, amount: 13, color: 0x7a0010, low: { below: 0.35, every: 6, amount: 19 }, onPool: 2 }, // balanceamento v3.32 (era 16/8 s e 24/5 s)
  // lutador desde o início: ganha os golpes com direção que a forma não tinha (frente, trás e lado)
  melee: {
    ...kit.melee,
    forward: { name: 'Bote do Diabo', anim: 'db_claw_r', dur: 0.42, active: [0.14, 0.26], damage: 38, range: 2.3, arc: 110, knockback: 1.8, motion: [{ t: [0, 0.24], fwd: 6.2, stopClose: true }], bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, tilt: 0.1 } },
    back: { name: 'Recua e rasga', anim: 'db_cross', dur: 0.5, actives: [[0.26, 0.32], [0.36, 0.42]], damage: 34, range: 2.2, arc: 120, knockback: 1.8, iframes: [0, 0.2], motion: [{ t: [0, 0.16], back: 2.6 }, { t: [0.2, 0.34], fwd: 2.6, stopClose: true }], bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, roll: 0.8 } },
    side: { name: 'Garra em giro', anim: 'db_claw_l', dur: 0.34, active: [0.1, 0.19], damage: 32, range: 2.2, arc: 150, knockback: 1.4, motion: [{ t: [0, 0.22], side: 2.8 }], bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, flip: true } },
  },
  // Senhor do Sangue: o Diabo comum chama MENOS zumbis e só os PEQUENOS; o grande vem só com a transformação
  abilities: kit.abilities.map((a) => (a.id !== 'senhorSangue' ? a : {
    ...a,
    description: 'Abre poças de sangue perto do adversário e delas sobem 1 ou 2 Zumbis de Sangue PEQUENOS que lutam pelo Diabo por 12 s. Transformado (Portador do Trono), o Zumbi GRANDE vem junto.',
    hordes: [['weak'], ['weak', 'weak']],
  })),
  // TRANSFORMAÇÃO (Barra cheia + vida baixa, segurando △): RENASCIMENTO — o Trono do Diabo sobe do sangue, ele senta e
  // vira O PORTADOR DO TRONO até o fim do round (quatro braços, asas de braços, a Coroa de Espinhos; +300 de vida)
  awakening: {
    name: 'Renascimento',
    banner: 'Renascimento',
    type: 'devilPact',
    form: 'diabo',
    duration: 0,
    bonusHealth: 150, // balanceamento v3.32 (era 300)
    color: 0xc01828,
  },
};
