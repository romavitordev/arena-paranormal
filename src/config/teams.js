// Cor de cada equipe/temporada (fundo dos retratos e etiqueta na seleção). Ordo amarelo, Mascarados vermelho, Os Cinco
// verde, Escriptas roxo, Luzidios azul-claro, Portadores das Relíquias branco-osso. Quem não tem equipe (vilões, formas sem origem) usa a própria cor.
export const TEAM_COLORS = {
  'Ordo Realitas': '#e8b830',
  Escriptas: '#9a6aff',
  'Os Cinco': '#3ec878',
  Luzidios: '#6ac8f0',
  Mascarados: '#e83a42',
  Transtornados: '#d0702c',
  Vampiros: '#b01020', // os Vampiros de Hexatombe (Raziel e a ceia na Igreja Antiga): vermelho-sangue escuro // a equipe do Cristino em Hexatombe (Apóstolos de Sangue): ferrugem/laranja do lampião
  // (2026-10-27) PORTADORES ≠ RELÍQUIAS: quem CARREGA a Relíquia (Juan / Sangue, Arnaldo / Energia, Ferreiro / Morte) fica
  // no branco-osso; quem É a Relíquia (O Diabo, O Deus da Morte, A Magistrada, O Anfitrião) no MAGENTA (o dourado de
  // antes era quase o amarelo da Ordo — nenhuma outra equipe usa magenta); e os Sinos de Tenebris (o Estrangeiro e o
  // Amigo Imaginário) no verde-acinzentado do OUTRO LADO
  Portadores: '#d8cfb8',
  'Relíquias': '#d63c8c',
  'Outro Lado': '#7fa89a',
};

export const TEAM_SHORT = { 'Ordo Realitas': 'Ordo' }; // cabe no cartão pequeno

export function teamColor(def) {
  return TEAM_COLORS[def && def.origin] || null;
}
