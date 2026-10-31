// AMPHITRUO — forma do Gaius (Transformação: a Relíquia de Energia se projeta no rosto dele; Calamidade ep. 5). O
// primeiro Anfitrião conhecido: o MESMO kit do Anfitrião (forms/anfitriao.js), com a aparência do Gaius consumido — a
// máscara sorridente com as três mãos de metal, a capa roxa e as chamas roxas (models/index.js: variante amphitruo).
// Fala pelas falas do Anfitrião (config/dialogues.js BASE_CHARACTER).
import anfitriao from './anfitriao.js';

export default {
  ...anfitriao,
  id: 'amphitruo',
  baseId: 'gaius',
  name: 'AMPHITRUO',
  model: 'amphitruo',
  origin: 'Relíquias',
  info: {
    ...anfitriao.info,
    weapon: 'A Relíquia de Energia: a máscara em constante transformação',
    identity: 'Forma Amphitruo (até o fim do round): o Gaius consumido pela Relíquia de Energia, o primeiro Anfitrião',
    tagline: 'Agora é minha vez de brilhar!', // a fala dele em Calamidade
  },
};
