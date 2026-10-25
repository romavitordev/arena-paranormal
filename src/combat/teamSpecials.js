import { Timeline, distXZ } from '../core/util.js';
import { Assist, rushStrike, shoot } from './assists.js';
import { findSpotBehind, findFreeSpotNear } from './positioning.js';
import { ROSTER } from '../characters/index.js';
import { getTeamLink, linkId, inLink as inLinkOf, matchesEntry } from '../config/teamLinks.js';

// ESPECIAIS EM EQUIPE COM LIGAÇÃO (F4): a coreografia de cada ligação de config/teamLinks.js. O especial em si
// (abilities.js teamSpecial) cuida do dano (as partes valem COMBAT.teamSpecial.bonus) e o LÍDER sempre fecha com o
// próprio especial; aqui só se decide QUEM entra, ONDE e COM QUAL GOLPE.
//   dupla  → quem está fora da dupla ataca primeiro (o golpe dele), depois a dupla faz o golpe dela
//   trio   → as duas assistências fazem o golpe do trio quase juntas
//   grupo  → todos os membros do grupo aparecem em volta do alvo (até os que estão fora da equipe) e golpeiam um após o
//            outro (Mascarados: o golpe de roda; Equipe Abutres: o golpe próprio de cada um)

// GOLPES DA LIGAÇÃO: (ctx de Assist.enter) → Timeline
const LINK_MOVES = {
  // KAISER — rajada de Balas Amaldiçoadas da M4 (o tiro do filho)
  kaiser: (c) => {
    const tl = shoot(c, 'shoot_rifle', 5, 30, c.def.ranged && c.def.ranged.sound);
    tl.add(0.3, () => c.world.fx.flash(c.as.chest(), { color: 0xa865ff, size: 1.2, life: 0.15 }));
    return tl;
  },
  // CRISTOPHER — A MURALHA: avança, ombrada de armário e SEGURA o alvo no lugar para o disparo
  cristopher: (c) => {
    const tl = rushStrike(c, 'shoulder_bash', [[0.38, 50]], 'heavyPunch', { knockback: 0.4 });
    tl.add(0.4, () => {
      if (c.opp.state === 'ko' || c.opp.isInvulnerable()) return;
      c.opp.stun(1.3, 'stagger');
      c.opp.notify('SEGURADO!', true);
      c.world.fx.play('FX_DUST', c.opp.pos, { scale: 1 });
      c.world.cameraRig.shake(0.25, 0.2);
    });
    tl.add(0.55, () => c.as.play('block', 0.8));
    return tl.end(1.35);
  },
  // JOUI — some na sombra, surge atrás e corta (iai)
  joui: (c) => {
    const tl = new Timeline();
    tl.add(0.05, () => {
      const spot = findSpotBehind(c.world.arena, { x: c.opp.pos.x, z: c.opp.pos.z, yaw: c.opp.yaw }, { distance: 1.5, radius: 0.5 });
      if (spot) c.as.pos.set(spot.x, 0, spot.z);
      c.as.face(c.opp);
      c.world.fx.shadowDisc(c.as.pos, { radius: 1, life: 0.4 });
      c.as.play('iai_slash', 0.45);
    });
    tl.add(0.25, () => {
      c.hit(55, { knockback: 1, sound: 'slashFinal' });
      c.world.fx.slash(c.opp.chestPos(), c.as.yaw, { color: 0xffd84a, radius: 1.6, arc: 2.2, life: 0.3, width: 0.4, roll: 0.6 });
    });
    return tl.end(0.75);
  },
  // ARTHUR — o tiro do Rebirth (verde) de longe
  arthur: (c) => {
    const tl = shoot(c, 'shoot_sniper', 1, 60, 'sniper');
    tl.add(0.36, () => {
      if (distXZ(c.as.pos, c.opp.pos) > 30) return;
      c.world.fx.tracer(c.as.chest(), c.opp.chestPos(), { color: 0x3aff6a, life: 0.25, width: 0.06 });
      c.world.fx.flash(c.opp.chestPos(), { color: 0x3aff6a, size: 1.6, life: 0.18 });
    });
    return tl;
  },
};

// golpe de roda dos Mascarados: o último golpe da sequência de cada um, colado no alvo
function circleStrike(c) {
  const fin = c.def.melee.strikes.at(-1);
  const tl = rushStrike(c, fin.anim, [[0.3, 22]], fin.hitSound || 'heavyPunch', { knockback: 0.3, color: 0xc4241c });
  tl.add(0.31, () => c.world.fx.burst(c.opp.chestPos(), { count: 12, color: 0xc4241c, speed: 4, life: 0.35, size: 0.16 }));
  return tl.end(0.7);
}

function moveFor(def) {
  return LINK_MOVES[linkId(def)] || ((c) => {
    const fin = def.melee.strikes.at(-1);
    return rushStrike(c, fin.anim, [[0.4, 50]], fin.hitSound || 'heavyPunch', { knockback: 1 });
  });
}

// lista de quem aparece no tríptico/painéis do especial
export function teamLinkOf(f) {
  if (!f.assists) return null;
  return getTeamLink([f.def, ...f.assists.map((a) => a.def)]);
}

// Agenda as entradas no timeline do especial (t0 = início). Devolve { link, cleanup }.
// Sem ligação: o simplificado (assistência 1, depois a 2).
export function scheduleTeamParts(tl, f, world, TS) {
  const link = teamLinkOf(f);
  const assists = f.assists.filter(Boolean);
  if (!link) {
    tl.add(0.05, () => assists[0] && assists[0].callTeam());
    tl.add(TS.second, () => assists[1] && assists[1].callTeam());
    return { link: null, cleanup: () => {} };
  }
  const inLink = (a) => inLinkOf(link, a.def);
  const linked = assists.filter(inLink);
  const outside = assists.filter((a) => !inLink(a));
  const guests = [];

  if (link.kind === 'group') {
    // todos os membros do grupo: os da equipe (as assistências) + os de fora (convidados), em volta do alvo
    const team = [f.def, ...assists.map((a) => a.def)];
    for (const id of link.group) {
      if (team.some((d) => matchesEntry(id, d))) continue;
      // a versão base do personagem (com mais de uma versão no elenco, a que tem o id da ligação)
      const def = ROSTER.find((d) => d.id === id) || ROSTER.find((d) => linkId(d) === id);
      if (!def) continue;
      try { guests.push(new Assist(def, f, world, guests.length % 2)); } catch (e) { /* modelo indisponível: fica de fora */ }
    }
    f.teamGuests = guests;
    const crew = [...linked, ...guests];
    outside.forEach((a) => tl.add(0.05, () => a.callTeam()));
    crew.forEach((a, i) => {
      tl.add(0.1 + i * 0.2, () => {
        const opp = f.opponent;
        if (!opp) return;
        const ang = (i / crew.length) * Math.PI * 2;
        const want = { x: opp.pos.x + Math.cos(ang) * 2.4, z: opp.pos.z + Math.sin(ang) * 2.4 };
        const spot = findFreeSpotNear(world.arena, want.x, want.z, { radius: 0.5, others: [{ x: opp.pos.x, z: opp.pos.z, r: 0.6 }] }) || want;
        // style 'circle' (Mascarados): todos com o golpe de roda; senão cada um com o golpe próprio da ligação
        a.perform(link.style === 'circle' ? circleStrike : moveFor(a.def), { at: spot, quiet: i > 0, guest: guests.includes(a) });
      });
    });
  } else {
    // dupla/trio: quem está fora ataca primeiro; a ligação entra depois (ou logo, se não há ninguém de fora)
    const start = outside.length ? Math.min(TS.second, 0.9) : 0.05;
    outside.forEach((a, i) => tl.add(0.05 + i * 0.3, () => a.callTeam()));
    // a Muralha (quem segura) vem antes do disparo
    const order = linked.slice().sort((a, b) => (linkId(b.def) === 'cristopher') - (linkId(a.def) === 'cristopher'));
    order.forEach((a, i) => tl.add(start + i * 0.4, () => a.perform(moveFor(a.def))));
  }
  return {
    link,
    // os convidados somem no fim do especial
    cleanup: () => { guests.forEach((g) => g.reset()); if (f.teamGuests === guests) f.teamGuests = null; },
  };
}

// os retratos do tríptico de abertura: quem está na ligação (no grupo, todos os membros)
export function linkCards(link, f) {
  // quem está na equipe aparece com a versão escolhida; os de fora, com a versão da ligação; o líder por último
  const team = [...f.assists.map((a) => a.def), f.def];
  const cards = (link.group || link.members).map((e) => team.find((d) => matchesEntry(e, d)) || ROSTER.find((d) => d.id === e) || ROSTER.find((d) => d.baseId === e));
  const uniq = [...new Set(cards.filter(Boolean))];
  return [...uniq.filter((d) => d !== f.def), ...uniq.filter((d) => d === f.def)];
}
