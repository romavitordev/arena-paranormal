// CELESTINE, A MAGISTRADA — forma da Celestine (Transformação: veste a MÁSCARA DO DESESPERO; Calamidade ep. 6). Não
// aparece na seleção e fica até o fim do round. Os MESMOS PODERES da Magistrada das Relíquias (pedido do dono, como o
// Anfitrião do Arnaldo × o Anfitrião separado), com a APARÊNCIA dela: o corpo da Celestine, as machadinhas e a Máscara
// no rosto (models/index.js: variante celestine_magistrada).
import magistrada from '../magistrada.js';

const BLUE = 0x8ad8ff;

export default {
  ...magistrada,
  id: 'celestine_magistrada',
  form: true,
  baseId: 'celestine',
  name: 'CELESTINE, A MAGISTRADA',
  model: 'celestine_magistrada',
  color: '#8ad8ff',
  origin: 'Portadores',
  teams: ['Ordo Calamitas'],
  info: {
    ...magistrada.info,
    weapon: 'As machadinhas e a Máscara do Desespero',
    identity: 'Forma A Magistrada (até o fim do round)',
    tagline: 'Saber tudo é perder tudo. Nada pessoal.',
  },
  stats: { ...magistrada.stats, moveSpeed: 8.0 },
  anims: { ...magistrada.anims, idle: 'idle_dual' },
  awakening: null, // já é a forma final
};
