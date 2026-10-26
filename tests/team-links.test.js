import test from 'node:test';
import assert from 'node:assert/strict';
import { getTeamLink, TEAM_LINKS } from '../src/config/teamLinks.js';
import xande from '../src/characters/xande.js';

test('team links identify Mascarados group', () => {
  const team = ['dalmo', 'aguiar', 'juan'];
  const link = getTeamLink(team);
  assert.ok(link);
  assert.equal(link.id, 'mascarados');
  assert.equal(link.banner, 'Execução dos Mascarados!');
});

test('team links identify Força D trio', () => {
  const team = ['arthur', 'kaiser', 'joui'];
  const link = getTeamLink(team);
  assert.ok(link);
  assert.equal(link.id, 'forca_d');
  assert.equal(link.banner, 'Força D!');
});

test('team links identify Cristopher and Kaiser duo', () => {
  const team = ['cristopher', 'kaiser', 'dante'];
  const link = getTeamLink(team);
  assert.ok(link);
  assert.equal(link.id, 'cristopher_kaiser');
  assert.equal(link.banner, 'A Muralha e o Disparo!');
});

test('Xande ranged attack uses Skate Caotico with hideProp and returnsProp', () => {
  assert.equal(xande.ranged.name, 'Skate Caótico');
  assert.equal(xande.ranged.visual, 'skate');
  assert.equal(xande.ranged.hideProp, 'skate');
  assert.equal(xande.ranged.returnsProp, 'skate');
  assert.equal(xande.ranged.boomerang, true);
});
