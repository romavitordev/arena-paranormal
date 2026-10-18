// BALANCEAMENTO GERAL (ajuste fino por personagem). Um lugar só para o equilíbrio do elenco, em vez de mexer em dezenas de
// números espalhados pelos kits: `dealt` multiplica todo o dano que o personagem causa (golpes, tiros, rituais, especial
// e as invocações dele), `taken` multiplica o dano que ele recebe. Vale também nas formas (Transformação) — o
// coeficiente é o do personagem de origem. 1 = sem ajuste.
//
// Medido com `src/dev/balance.js` (CPU × CPU no nível normal, todos os pares). Alvo: 35%–65% de vitórias para todos
// (TODO §34 — o tier diz a função do personagem, não obriga uma taxa). Os ajustes são moderados de propósito: uma
// rodada tem ruído de uns ±7% por personagem, então a gente aproxima e mede de novo em vez de corrigir de uma vez.
//
// v3.32.0 — 1ª rodada (≈650 lutas): O Diabo 100%, Kian 90%, Dante 86%, Joui 73%, Gal Sal 66% | Nubi 10%,
// Cristopher 20%, Balu 24%, Arthur 25%, Erin 26%, Aghata 28%, Lírio 30%, Estrangeiro 30%, Veríssimo 34%.
// (O Diabo e o Kian também tiveram correções de kit: a regeneração do Diabo e o Inexistir do Kian.)
export const BALANCE = {
  // rodada 1 → 2 → 3 → 4 (o ruído de uma rodada é de uns ±7%: para quem não mudou, vale a média das rodadas 3 e 4)
  o_diabo: { dealt: 0.7, taken: 1.2 }, // 100 → 94 → 93 → 74 → 51% (focada) (o kit também perdeu vida, regeneração e roubo de vida)
  kian: { dealt: 0.86 }, // 90 → 93 → 59 → 59% (+ kit: Inexistir e Escrita)
  kemi: { dealt: 0.97 }, // 56 → 54 → 63 → 43%
  juan: { dealt: 0.97 }, // 62 → 65 → 46 → 57%
  ferreiro: { dealt: 0.97 }, // 63 → 65 → 49 → 59%
  dante: { dealt: 0.9, taken: 1.05 }, // 86 → 59 → 56 → 57%
  joui: { dealt: 0.94 }, // 73 → 59 → 48 → 48%
  gal_sal: { dealt: 0.97 }, // 66 → 46 → 59 → 52%
  erin: { dealt: 1.04, taken: 0.97 }, // 26 → 59 → 57 → 52%
  cristopher: { dealt: 1.1, taken: 0.93 }, // 20 → 56 → 26 → 41% (oscila muito entre rodadas)
  nubi: { dealt: 1.2, taken: 0.9 }, // 10 → 39 → 44 → 28 → 48% (focada)
  balu: { dealt: 1.16, taken: 0.9 }, // 24 → 37 → 26 → 46%
  guizo: { dealt: 1.07, taken: 0.97 }, // 48 → 37 → 32 → 65%
  magistrada: { dealt: 1.04 }, // 50 → 37 → 45 → 56%
  verissimo: { dealt: 1.15 }, // 34 → 35 → 35 → 33%
  dalmo: { dealt: 1.04 }, // 44 → 56 → 37 → 50%
  aguiar: { dealt: 1.06 }, // 46 → 50 → 37 → 37%
  lirio: { dealt: 1.13, taken: 0.92 }, // 30 → 35 → 44 → 28%
  labirinto: { dealt: 1.06, taken: 0.95 }, // 44 → 33 → 44 → 46%
  arnaldo: { dealt: 1.08, taken: 0.94 }, // 42 → 32 → 56 → 46%
  amigo: { dealt: 1.05, taken: 0.96 }, // 40 → 30 → 62 → 44%
  aghata: { dealt: 1.15, taken: 0.9 }, // 28 → 28 → 57 → 46%
  estrangeiro: { dealt: 1.14, taken: 0.9 }, // 30 → 28 → 46 → 48%
  arthur: { dealt: 1.16, taken: 0.9 }, // 25 → 24 → 48 → 52%
  cristino: { dealt: 1.03 }, // 48 → 57 → 42 → 35%
};

// o coeficiente de um lutador (transformado: o do personagem de origem)
export function balanceOf(f) {
  if (!f || !f.def) return null;
  const id = f.baseForm && f.baseForm.def ? f.baseForm.def.id : f.def.baseId || f.def.id;
  return BALANCE[id] || null;
}
