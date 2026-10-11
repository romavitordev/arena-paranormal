// Elementos do Outro Lado (Ordem Paranormal). Ciclo do Diário de Deus:
// Sangue supera Conhecimento, que supera Energia, que supera Morte, que supera Sangue. Medo fica fora.
export const ELEMENTS = {
  sangue: { name: 'Sangue', color: '#e3263a' },
  morte: { name: 'Morte', color: '#a7a3ad' },
  conhecimento: { name: 'Conhecimento', color: '#f2c230' },
  energia: { name: 'Energia', color: '#a865ff' },
  medo: { name: 'Medo', color: '#f4f1ff' },
  // elementos dos Sinos de Tenebris (fora do ciclo: neutros contra os outros)
  transmissao: { name: 'Transmissão', color: '#5aff6a' }, // o Estrangeiro e os Alheios (Sinais do Outro Lado)
  tinta: { name: 'Tinta', color: '#8a5a2a' }, // o Amigo Imaginário (O Segredo na Ilha)
};

// quem cada elemento supera
export const BEATS = { sangue: 'conhecimento', conhecimento: 'energia', energia: 'morte', morte: 'sangue' };

// Multiplicador de dano pelo ciclo (Medo e elementos ausentes ficam neutros)
export function elementMultiplier(attackEl, defendEl, adv = 1.1, dis = 0.9) {
  if (!attackEl || !defendEl || attackEl === 'medo' || defendEl === 'medo') return 1;
  if (BEATS[attackEl] === defendEl) return adv;
  if (BEATS[defendEl] === attackEl) return dis;
  return 1;
}
