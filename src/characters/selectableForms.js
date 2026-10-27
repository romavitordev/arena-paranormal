// FORMAS QUE TAMBÉM SÃO SELECIONÁVEIS (pedido de 2026-10-27): dá para começar a luta já como a Relíquia ou o Portador.
// São as MESMAS definições das formas (forms/*.js: mesmo id, modelo, kit, falas e retrato), só com a equipe da seleção e
// cópias próprias dos golpes (o ritmo de ataque do elenco — applyAttackSpeed — mexe nos golpes, e a forma usada na
// transformação não pode mudar junto).
//   PORTADORES: JUAN (o Portador; a forma com ódio do Henri) → Portador do Trono
//   RELÍQUIAS:  O DEUS DA MORTE (Morte) e O ANFITRIÃO (Energia), ao lado do Diabo (Sangue) e da Magistrada (Conhecimento)
import juanOdio from './forms/juan_odio.js';
import anfitriao from './forms/anfitriao.js';
import deusMorte from './forms/deus_morte.js';

const copyMelee = (m) => {
  if (!m) return m;
  const out = { ...m, strikes: (m.strikes || []).map((s) => ({ ...s })) };
  for (const k of ['up', 'down', 'forward', 'back', 'side', 'air', 'ground']) if (m[k]) out[k] = { ...m[k] };
  return out;
};
// selectableForm: a forma como lutador da seleção — já é a forma final de alguém, então fica fora das regras do elenco
// base (vida igual, especial de 250, transformação obrigatória) e fala pelas falas do personagem base (dialogues.js)
const selectable = (form, extra) => ({ ...form, form: false, selectableForm: true, melee: copyMelee(form.melee), ...extra });

export const juanPortador = selectable(juanOdio, { origin: 'Portadores', teams: ['Mascarados'] });
export const deusMorteReliquia = selectable(deusMorte, { origin: 'Relíquias', teams: [], relic: 'morte' });
export const anfitriaoReliquia = selectable(anfitriao, { origin: 'Relíquias', teams: [], relic: 'energia' });
