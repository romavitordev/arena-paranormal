// KIAN DE CALAMIDADE (Transformação). Não aparece na seleção: o Kian vira esta forma na Transformação (Barra cheia +
// vida baixa, segurando △) e fica assim até o fim do round. Pedido do usuário: "a barba cresce e ele fica mais poderoso,
// como o Kian de Desconjuração × Calamidade" — as miniaturas da wiki ("Kian marcado em Desconjuração" e "Kian em
// Calamidade"): em Calamidade a barba está cheia e os antebraços enfaixados, e ele é o Kian no auge (o Invólucro do
// Conhecimento: os textos tomam o corpo e os golpes atravessam a defesa).
// Golpes físicos 20% mais fortes e IMPOSSÍVEIS DE DEFENDER, Impacto Sigilar maior, mais rápido, o Inexistir mais pesado
// e — desde a v3.42.0 — um KIT PRÓPRIO de rituais (abaixo): Teletransporte sem esforço, Levitação: Suspender, a Lâmina do
// Medo que deixa MORRENDO e o Rejeitar Névoa maior.
import base from '../kian.js';

const GOLD = 0xffd27a;
const stronger = (s) => ({ ...s, damage: Math.round(s.damage * 1.2) });
const M = base.melee;

export default {
  ...base,
  id: 'kian_calamidade',
  form: true,
  baseId: 'kian',
  name: 'KIAN',
  model: 'kian_calamidade',
  energyColor: GOLD,
  unblockableMelee: true, // Invólucro do Conhecimento: os golpes físicos atravessam a defesa
  info: {
    ...base.info,
    identity: 'O Realizador da Calamidade: barba cheia, faixas nos braços, os textos tomam o corpo (até o fim do round)',
    tagline: 'O conhecimento não se defende. Se aceita.',
  },
  stats: { ...base.stats, moveSpeed: 8.3, attackSpeed: 1.22, maxHealth: 1600 }, // cabe a vida extra da transformação
  melee: {
    ...M,
    name: 'Punhos de Calamidade',
    strikes: M.strikes.map(stronger),
    up: stronger(M.up),
    down: stronger(M.down),
    forward: stronger(M.forward),
    back: stronger(M.back),
    side: stronger(M.side),
    air: stronger(M.air),
  },
  // o Impacto Sigilar de Calamidade escreve TRÊS marcas (com a Escrita detonando em 4, o segundo acerto já explode)
  ranged: { ...base.ranged, name: 'Impacto Sigilar de Calamidade', damage: 85, radius: 1.3, cooldown: 3, onHit: { script: 3 } },
  // KIT DE CALAMIDADE (feedback de 25/10/2026: a forma precisa de rituais com funções próprias, não só números maiores).
  // Base canônica: em Calamidade ele sabe qualquer ritual, teleporta-se entre lugares, imobiliza a Agatha, usa a Lâmina
  // do Medo várias vezes e derrota a Magistrada. Funções: controle (Suspender, Rejeitar Névoa), mobilidade
  // (Teletransporte sem esforço), finalização (a Lâmina que deixa MORRENDO, o Inexistir). Ver docs/AUDITORIA-KIAN-JOUI.md.
  abilities: base.abilities.map((a) => {
    switch (a.id) {
      // MOBILIDADE: o Teletransporte sai sem esforço — recarga curta e barato (ele se teleporta entre lugares à vontade)
      case 'teletransporte':
        return {
          ...a, name: 'Teletransporte de Calamidade', energyCost: 12, cooldown: 5, distance: 8, strike: { ...a.strike, damage: 42, script: 2 }, color: GOLD,
          recast: true, recastWindow: 1.6, // DOIS SALTOS: o segundo sai de graça apertando de novo logo depois
          description: 'Teleporta sem esforço: some e reaparece (na direção do analógico ou ao lado dele, socando e escrevendo 2 marcas) — e apertando de novo em 1,6 s salta OUTRA VEZ de graça.',
        };
      // CONTROLE: a Levitação ergue o PRÓPRIO ADVERSÁRIO — o círculo dourado avisa, quem não sair de cima sobe no ar,
      // fica preso e é arremessado no chão (base: a Levitação e a Agatha imobilizada nas mãos dele)
      case 'levitacao':
        return {
          id: 'suspender', name: 'Levitação: Suspender', input: a.input, type: 'abductBeam',
          description: 'Ergue a mão: o círculo dourado marca o adversário e, se ele não sair de cima, sobe no ar preso e é arremessado no chão. Dá para escapar correndo ou esquivando.',
          energyCost: 30, cooldown: 14, range: 11, radius: 1.5, windup: 0.6, damage: 90, lift: 0.9, drop: 0.7, element: 'conhecimento', color: GOLD, sigils: true, anim: 'levitate_raise', hitLabel: 'SUSPENSO', missLabel: 'ESCAPOU', // os sigilos de Conhecimento (não o feixe de luz)
        };
      // FINALIZAÇÃO: a Lâmina do Medo de Calamidade deixa o alvo MORRENDO (sangra medo e não regenera sanidade)
      case 'laminaMedo':
        return {
          ...a, name: 'Lâmina do Medo de Calamidade', damage: 170, cooldown: 18, energyCost: 35, dying: { dps: 14, duration: 6 }, anim: 'fear_pierce', melody: true,
          description: 'A lâmina translúcida com a melodia impossível: o golpe quebra a defesa e deixa o alvo MORRENDO — sangra medo por 6 s e não regenera sanidade.',
        };
      // CONTROLE: a área do Rejeitar Névoa é maior e dura mais
      case 'rejeitarNevoa':
        return { ...a, radius: 8, duration: 7, dispel: true, description: 'Dissipa a névoa em volta dele por 7 s (área maior): os rituais que o adversário JÁ TEM ATIVOS se desfazem, e todo ritual novo lá dentro vira conjuração contínua (0,7 s parado, um golpe interrompe) e sai 25% mais fraco.' };
      // o Toque da Morte de Calamidade SUGA A VIDA: além de envelhecer, a sanidade do alvo vai a zero e não regenera
      case 'toqueMorte':
        return { ...a, name: 'Toque da Morte de Calamidade', damage: 36, drainAll: true, description: 'Toca o alvo e suga a vida dele: envelhece, definha e fica lento, a SANIDADE vai a zero e não regenera enquanto definha, e ele fica FRACO (−20% de dano) até o fim do round. Curtíssimo alcance — dá para esquivar.' };
      default:
        return a.damage ? { ...a, damage: Math.round(a.damage * 1.2) } : a;
    }
  }),
  special: { ...base.special, resistDamage: 520 },
  // a Escrita de Calamidade: detona com 4 marcas e bem mais forte
  passives: base.passives.map((p) => (p.type === 'kianScript' ? { ...p, max: 4, burst: 60, stun: 0.7 } : p)),
  awakening: undefined,
};
