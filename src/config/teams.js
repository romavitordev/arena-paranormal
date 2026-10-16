// Cor de cada equipe/temporada (fundo dos retratos e etiqueta na seleção). Ordo amarelo, Mascarados vermelho, Os Cinco
// verde, Escriptas roxo, Luzidios azul-claro, Portadores das Relíquias branco-osso. Quem não tem equipe (vilões, formas sem origem) usa a própria cor.
export const TEAM_COLORS = {
  'Ordo Realitas': '#e8b830',
  Escriptas: '#9a6aff',
  'Os Cinco': '#3ec878',
  Luzidios: '#6ac8f0',
  Mascarados: '#e83a42',
  Transtornados: '#d0702c', // a equipe do Cristino em Hexatombe (Apóstolos de Sangue): ferrugem/laranja do lampião
  // quem carrega uma Relíquia (Diabo / Sangue, Magistrada / Conhecimento, Arnaldo / Energia, Ferreiro / Morte) e, por pedido do usuário, o Estrangeiro e o Amigo Imaginário: branco-osso, para não confundir com o amarelo da Ordo nem o vermelho dos Mascarados
  'Portadores das Relíquias': '#d8cfb8',
};

export const TEAM_SHORT = { 'Ordo Realitas': 'Ordo', 'Portadores das Relíquias': 'Portadores' }; // cabe no cartão pequeno

export function teamColor(def) {
  return TEAM_COLORS[def && def.origin] || null;
}
