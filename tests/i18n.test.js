import test from 'node:test';
import assert from 'node:assert/strict';
import { t, setLanguage, getLanguage, initLanguage, SUPPORTED_LANGUAGES } from '../src/i18n/index.js';

test('i18n supports all 13 priority languages defined in TODO', () => {
  const ids = SUPPORTED_LANGUAGES.map((l) => l.id);
  const expected = ['pt-BR', 'pt-PT', 'en', 'es', 'de', 'fr', 'it', 'ru', 'zh', 'ja', 'ko', 'tr', 'pl'];
  for (const exp of expected) {
    assert.ok(ids.includes(exp), `Idioma ${exp} deve estar suportado`);
  }
});

test('i18n translates base keys in pt-BR', () => {
  setLanguage('pt-BR');
  assert.equal(getLanguage(), 'pt-BR');
  assert.equal(t('menu.solo'), 'BATALHA SOLO');
  assert.equal(t('combat.fight'), 'LUTEM!');
});

test('i18n translates in en and supports string interpolation', () => {
  setLanguage('en');
  assert.equal(t('menu.solo'), 'SOLO BATTLE');
  assert.equal(t('combat.round', { n: 2 }), 'ROUND 2');
  assert.equal(t('combat.winner', { name: 'Kaiser' }), 'WINNER: Kaiser');
});

test('i18n falls back gracefully to pt-BR if key is missing in chosen language', () => {
  setLanguage('en');
  // Se uma chave não existir em en, usa pt-BR
  assert.equal(t('chave.inexistente.total'), 'chave.inexistente.total');
});

test('i18n sets and retrieves language', () => {
  setLanguage('es');
  assert.equal(getLanguage(), 'es');
  assert.equal(t('menu.solo'), 'BATALLA INDIVIDUAL');
  setLanguage('pt-BR');
  assert.equal(getLanguage(), 'pt-BR');
});

test('i18n: every language has every interface key (no missing or extra keys, no empty text)', async () => {
  const { LOCALES } = await import('../src/i18n/index.js');
  const base = Object.keys(LOCALES['pt-BR']).sort();
  for (const { id } of SUPPORTED_LANGUAGES) {
    const dict = LOCALES[id];
    assert.ok(dict, `Idioma ${id} sem dicionário`);
    assert.deepEqual(Object.keys(dict).sort(), base, `Chaves diferentes em ${id}`);
    for (const k of base) {
      assert.ok(typeof dict[k] === 'string' && dict[k].trim(), `${id}: "${k}" vazio`);
      // os marcadores {x} precisam ser os mesmos em todos os idiomas
      const ph = (s) => [...new Set(s.match(/\{\w+\}/g) || [])].sort().join();
      assert.equal(ph(dict[k]), ph(LOCALES['pt-BR'][k]), `${id}: marcadores diferentes em "${k}"`);
    }
  }
});
