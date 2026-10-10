// O COLOSSO (Dalmo com o escafandro, Hexatombe / Natal Macabro). Não aparece na seleção: o Dalmo vira esta forma na
// Transformação (Barra cheia + vida baixa, segurando △) e fica assim até o fim do round.
// Visual: o escafandro de cobre arranhado com os três visores vermelhos rachados e o axolote rosa pendurado na frente;
// o tronco cheio de cicatrizes à mostra, retalhos de pano cru, mangueiras, arnês e cinturão de espinhos, as MANOPLAS de
// cobre e as botas com espinhos (referência "Colosso corpo inteiro").
// Poderes com o escafandro — as MANOPLAS DO COLOSSO (Energia: "cada soco é acompanhado por uma pressão atmosférica
// demolidora"): todo soco solta uma onda de pressão (dano extra de Energia) e os finalizadores ATORDOAM; o □ vira o
// VEM, NENÉM! (a postura de contra com as Manoplas); Pressão Demolidora, Esmagar o Crânio (a lenda das arenas), Atropelar e o Pisão do Colosso
// (a finalização do Mosto). Especial "AÍ SIM, NENÉM!" (a frase do Tuco testando as Manoplas). Mais forte, aguenta mais
// e quase não é empurrado — mas continua lento.
import base from '../dalmo.js';

const RED = 0xff2a1e;
const PRESS = 0xffb070;
const heavier = (s) => ({ ...s, damage: Math.round(s.damage * 1.15), element: 'energia' });
const M = base.melee;
const byId = Object.fromEntries(base.abilities.map((a) => [a.id, a]));

export default {
  ...base,
  id: 'colosso',
  form: true,
  baseId: 'dalmo',
  name: 'COLOSSO',
  model: 'colosso',
  color: '#c8401e',
  energyColor: RED,
  info: {
    weapon: 'As Manoplas do Colosso (Energia)',
    style: 'O gladiador de escafandro: cada soco solta uma onda de pressão; agarra, esmaga e pisa',
    identity: 'Forma do Colosso (até o fim do round)',
    tagline: 'Aí sim, neném!',
  },
  stats: { moveSpeed: 6.95, maxHealth: 1420 }, // cabe a vida extra do escafandro (+120)
  anims: { ...base.anims, victory: 'vic_colosso' },
  chargeFx: { style: 'fists', color: RED },
  melee: {
    ...M,
    name: 'Manoplas do Colosso',
    strikes: M.strikes.map(heavier),
    up: heavier(M.up),
    down: heavier(M.down),
    forward: heavier(M.forward),
    back: heavier(M.back),
    side: heavier(M.side),
    air: heavier(M.air),
  },
  // □: VEM, NENÉM! — a postura do Pode Vir! com as Manoplas: janela maior, e quem bate é agarrado pela cabeça,
  // leva soco e cabeçada (cada um solta a pressão) e é cravado no chão
  ranged: {
    ...base.ranged,
    name: 'Vem, Neném!',
    description: 'A postura do Pode Vir! com as Manoplas: um golpe físico ou habilidade que chegar de frente é segurado — ele agarra quem bateu pela cabeça, castiga com soco e cabeçada (cada um solta a pressão) e crava no chão.',
    window: [0.1, 1.0],
    damage: 74,
    color: PRESS,
    label: 'VEM, NENÉM!',
    riposte: {
      ...base.ranged.riposte,
      hold: 0.8,
      blows: 2,
      blowAnims: ['hook_r', 'headbutt'],
      blowDamage: 18,
      final: 'slam',
      finalDamage: 38,
      pressure: true,
      element: 'energia',
      label: 'GOLPE SEGURADO!',
      color: PRESS,
    },
  },
  abilities: [
    {
      ...byId.pressaoAtmosferica,
      id: 'pressaoDemolidora',
      name: 'Pressão Demolidora',
      description: 'O soco das Manoplas com toda a força: uma onda de pressão bem maior, mais dano de Energia e o alvo ATORDOADO por mais tempo.',
      cooldown: 8,
      range: 3.0,
      arc: 130,
      damage: 74,
      stun: 1.4,
      pressure: 3.4,
    },
    {
      ...byId.agarraoArena,
      id: 'esmagarCranio',
      name: 'Esmagar o Crânio',
      description: 'Agarra pela cabeça com as Manoplas, castiga com socos e cabeçada (cada um solta pressão) e crava no chão — como o Colosso terminava as lutas nas arenas.',
      cooldown: 9,
      hold: 1.25,
      blows: 3,
      blowAnims: ['hook_r', 'hook_l', 'headbutt'],
      blowDamage: 20,
      finalDamage: 56,
      pressure: true,
      label: 'O CRÂNIO!',
      color: PRESS,
    },
    { ...byId.investida, damage: 54, cooldown: 7, color: RED },
    {
      id: 'pisaoColosso',
      name: 'Pisão do Colosso',
      input: 'block+carga', // R2 + △
      type: 'stompQuake',
      description: 'Ergue o joelho e crava a bota de cobre no chão: a onda de choque derruba quem estiver perto (no chão) e quebra a guarda. Aguenta golpes enquanto levanta o pé.',
      energyCost: 30,
      cooldown: 12,
      duration: 0.8,
      impact: 0.42,
      radius: 4.2,
      range: 4, // a CPU só pisa com o adversário perto
      damage: 52,
      element: 'energia',
      color: PRESS,
    },
  ],
  // "AÍ SIM, NENÉM!": avança, rajada de socos com as Manoplas, o duplo impacto (as duas de uma vez, a pressão explode),
  // gancho que levanta e o soco que crava no chão
  special: {
    name: 'Aí Sim, Neném!',
    banner: 'Aí Sim, Neném!',
    type: 'cinematicCombo',
    energyCost: 50,
    cooldown: 14,
    color: RED,
    sound: 'specialStart',
    damage: 310,
    prepare: { anim: 'colosso_roar', time: 0.5, fx: 'fistGlow' },
    dash: { speed: 20, maxTime: 0.5, contact: 1.9 },
    hits: [
      { t: 0.6, anim: 'dash_punch', dur: 0.3, share: 0.1, fx: { kind: 'punch', paranormal: true }, sound: 'heavyPunch' },
      { t: 0.95, anim: 'flurry', dur: 0.5, share: 0.16, fx: { kind: 'punch', paranormal: true }, sound: 'heavyPunch' },
      { t: 1.5, anim: 'wave_punch', dur: 0.42, share: 0.18, fx: { kind: 'punch', paranormal: true, big: true }, sound: 'shockwave' },
      { t: 2.0, anim: 'uppercut', dur: 0.4, share: 0.14, fx: { kind: 'punch', up: true, paranormal: true }, sound: 'heavyPunch' },
      { t: 2.6, anim: 'meteor_punch', dur: 0.55, share: 0.42, fx: { kind: 'smash', big: true }, sound: 'heavyPunch', final: true },
    ],
    bannerAt: 0.25,
    length: 3.6,
  },
  passives: [
    { type: 'arenaBlows', damage: 18, delay: 0.16 },
    { type: 'atmosphericPressure', damage: 7, stun: 0.7, color: PRESS },
    { type: 'thickSkin', knockback: 0.6, chip: 0.7, guard: 0.8 }, // o escafandro e o tamanho: quase não é empurrado
  ],
  awakening: undefined,
};
