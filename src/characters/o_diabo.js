// O DIABO (id: o_diabo) — PORTADORES DAS RELÍQUIAS. O Portador da Relíquia de Sangue como lutador próprio, desde o
// começo da luta (pedido do usuário: o Diabo separado do Juan, junto de Arnaldo e Ferreiro e, no futuro, da Magistrada,
// do Estrangeiro e do Amigo Imaginário). Mesmo modelo, golpes, rituais e Pacto da forma do Juan (forms/diabo.js) —
// lá ele aparece no fim do round, já ferido; aqui a luta inteira, então a vida volta ao padrão e a regeneração é menor.
// Transformação: COROA DE ESPINHOS — a coroa dourada acende e o Senhor do Sangue desperta até o fim do round.
import form from './forms/diabo.js';

const { form: _isForm, baseId: _base, ...kit } = form;

export default {
  ...kit,
  id: 'o_diabo',
  name: 'O DIABO',
  color: '#a01818',
  origin: 'Portadores das Relíquias',
  info: {
    weapon: 'Quatro braços com garras',
    style: 'Garras em sequência, lanças e poças de sangue, a horda de Zumbis de Sangue e o Pacto',
    identity: 'O Portador da Relíquia de Sangue: regenera, bebe o sangue derramado e oferece pactos',
    tagline: 'Eu vim te oferecer um pacto.',
  },
  // forma do Juan: 1150 de vida e regeneração forte por ser o fim do round; lutador desde o início: padrão (1000)
  stats: { moveSpeed: 8.0, size: 1.35 },
  regen: { every: 8, amount: 16, color: 0x7a0010, low: { below: 0.35, every: 5, amount: 24 }, onPool: 2 },
  // lutador desde o início: ganha os golpes com direção que a forma não tinha (frente, trás e lado)
  melee: {
    ...kit.melee,
    forward: { name: 'Bote do Diabo', anim: 'db_claw_r', dur: 0.42, active: [0.14, 0.26], damage: 38, range: 2.3, arc: 110, knockback: 1.8, motion: [{ t: [0, 0.24], fwd: 6.2, stopClose: true }], bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, tilt: 0.1 } },
    back: { name: 'Recua e rasga', anim: 'db_cross', dur: 0.5, actives: [[0.26, 0.32], [0.36, 0.42]], damage: 34, range: 2.2, arc: 120, knockback: 1.8, iframes: [0, 0.2], motion: [{ t: [0, 0.16], back: 2.6 }, { t: [0.2, 0.34], fwd: 2.6, stopClose: true }], bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, roll: 0.8 } },
    side: { name: 'Garra em giro', anim: 'db_claw_l', dur: 0.34, active: [0.1, 0.19], damage: 32, range: 2.2, arc: 150, knockback: 1.4, motion: [{ t: [0, 0.22], side: 2.8 }], bleed: { dps: 3, duration: 1.5 }, sound: 'blade', hitSound: 'clawHit', trail: { color: 0xff2a3d, flip: true } },
  },
  awakening: {
    name: 'Coroa de Espinhos',
    banner: 'Coroa de Espinhos',
    type: 'awakenMode',
    mult: 1.15, takenMult: 0.88, meleeBleed: true, regen: 3, aura: 'blood', color: 0xff2a3d, heal: 0.12,
  },
};
