// Cor de cada equipe/temporada (fundo dos retratos e etiqueta na seleÃ§Ã£o). Ordo amarelo, Mascarados vermelho, Os Cinco
// verde, Escriptas roxo, Portadores das RelÃ­quias branco-osso. Quem nÃ£o tem equipe (vilÃµes, formas sem origem) usa a prÃ³pria cor.
export const TEAM_COLORS = {
  'Ordo Realitas': '#e8b830',
  Escriptas: '#9a6aff',
  'Os Cinco': '#3ec878',
  Mascarados: '#e83a42',
  Transtornados: '#d0702c',
  Vampiros: '#b01020', // os Vampiros de Hexatombe (Raziel e a ceia na Igreja Antiga): vermelho-sangue escuro // a equipe do Cristino em Hexatombe (ApÃ³stolos de Sangue): ferrugem/laranja do lampiÃ£o
  // (2026-10-27) PORTADORES â‰  RELÃQUIAS: quem CARREGA a RelÃ­quia (Juan / Sangue, Arnaldo / Energia, Ferreiro / Morte) fica
  // no branco-osso; quem Ã‰ a RelÃ­quia (O Diabo, O Deus da Morte, A Magistrada, O AnfitriÃ£o) no MAGENTA (o dourado de
  // antes era quase o amarelo da Ordo â€” nenhuma outra equipe usa magenta); e os Sinos de Tenebris (o Estrangeiro e o
  // Amigo ImaginÃ¡rio) no verde-acinzentado do OUTRO LADO
  Portadores: '#d8cfb8',
  'RelÃ­quias': '#d63c8c',
  'Outro Lado': '#7fa89a',
  'Ordo Calamitas': '#4a62e0', // a ordem de 67 d.C. (Celestine, Gaius, Amalia, Cornelius): azul-real, nenhuma outra usa
};

export const TEAM_SHORT = { 'Ordo Realitas': 'Ordo', 'Ordo Calamitas': 'Calamitas' }; // cabe no cartÃ£o pequeno

export function teamColor(def) {
  return TEAM_COLORS[def && def.origin] || null;
}

// todas as equipes do personagem: a principal (origin) e as outras (teams) â€” ex.: Celestine = Portadores + Ordo Calamitas
export function defTeams(def) {
  return def ? [def.origin, ...(def.teams || [])].filter(Boolean) : [];
}
