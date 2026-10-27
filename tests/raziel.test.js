import test from 'node:test';
import assert from 'node:assert/strict';
import raziel from '../src/characters/raziel.js';
import verdadeiro from '../src/characters/forms/raziel_verdadeiro.js';
import { PASSIVES } from '../src/combat/passives.js';

const pas = (def, type) => (def.passives || []).find((p) => p.type === type);

test('Raziel: Turno Extra e Afinidade com Sangue nas duas formas', () => {
  for (const def of [raziel, verdadeiro]) {
    assert.ok(pas(def, 'extraTurn'), `${def.id}: Turno Extra`);
    const aff = pas(def, 'elementalAffinity');
    assert.equal(aff.element, 'sangue');
    assert.ok(aff.mult > 1 && aff.resist < 1);
  }
});

test('Afinidade com Sangue: só rituais de Sangue ficam mais fortes e só eles são resistidos', () => {
  const aff = pas(raziel, 'elementalAffinity');
  const P = PASSIVES.elementalAffinity;
  const attacker = { def: raziel };
  assert.equal(P.damageMod({ attacker, kind: 'ability', passive: aff, o: { element: 'sangue' } }), aff.mult);
  assert.equal(P.damageMod({ attacker, kind: 'melee', passive: aff, o: {} }), 1);
  assert.equal(P.damageMod({ attacker, kind: 'ability', passive: aff, o: { element: 'morte' } }), 1);
  assert.equal(P.damageTakenMod({ element: 'sangue', passive: aff }), aff.resist);
  assert.equal(P.damageTakenMod({ element: 'energia', passive: aff }), 1);
  // o Kaiser (sem element) continua com o bônus em todo ritual
  assert.equal(P.damageMod({ attacker: { def: { element: 'energia' } }, kind: 'special', passive: { mult: 1.15 }, o: {} }), 1.15);
});

test('Raziel: □ é a investida Vulto Retalhador (sem projétil) e a CPU usa de longe', () => {
  assert.equal(raziel.ranged.type, 'dashStrike');
  assert.ok(raziel.ranged.aiRange >= raziel.ranged.distance);
  assert.ok(raziel.ranged.bleed);
  assert.equal(verdadeiro.ranged.type, 'dashStrike');
  assert.ok(verdadeiro.ranged.damage > raziel.ranged.damage);
});

test('O Verdadeiro Raziel: kit próprio (Língua no lugar do Endurecer, Sede no Devorar, Predador, barra de sangue)', () => {
  const ids = verdadeiro.abilities.map((a) => a.id);
  assert.ok(ids.includes('lingua') && !ids.includes('endurecerSangue'));
  assert.ok(verdadeiro.abilities.find((a) => a.id === 'devorar').thirst);
  assert.ok(pas(verdadeiro, 'predator'));
  assert.equal(verdadeiro.hpBar.style, 'vampire');
  // o Banquete Bestial não é o Banquete de Sangue recolorido
  assert.notDeepEqual(verdadeiro.special.hits.map((h) => h.anim), raziel.special.hits.map((h) => h.anim));
  assert.ok(verdadeiro.special.hits.some((h) => h.gore));
});

test('Predador: +20% só em quem está vulnerável', () => {
  const p = pas(verdadeiro, 'predator');
  const victim = (state, health = 100) => ({ state, health, maxHealth: 100 });
  assert.equal(PASSIVES.predator.damageMod({ victim: victim('idle'), kind: 'melee', passive: p }), 1);
  assert.equal(PASSIVES.predator.damageMod({ victim: victim('stun'), kind: 'melee', passive: p }), p.mult);
  assert.equal(PASSIVES.predator.damageMod({ victim: victim('idle', 20), kind: 'ability', passive: p }), p.mult);
  assert.equal(PASSIVES.predator.damageMod({ victim: victim('stun'), kind: 'special', passive: p }), 1);
});
