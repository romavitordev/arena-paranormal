// Cor de cada equipe/temporada (fundo dos retratos e etiqueta na seleção). Ordo amarelo, Mascarados vermelho, Os Cinco
// verde, Escriptas roxo, Luzidios azul-claro. Quem não tem equipe (vilões, formas sem origem) usa a própria cor.
export const TEAM_COLORS = {
  'Ordo Realitas': '#e8b830',
  Escriptas: '#9a6aff',
  'Os Cinco': '#3ec878',
  Luzidios: '#6ac8f0',
  Mascarados: '#e83a42',
};

export const TEAM_SHORT = { 'Ordo Realitas': 'Ordo' }; // cabe no cartão pequeno

export function teamColor(def) {
  return TEAM_COLORS[def && def.origin] || null;
}
