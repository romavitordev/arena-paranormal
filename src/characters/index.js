import kaiser from './kaiser.js';
import arthur from './arthur.js';
import joui from './joui.js';
import aghata from './aghata.js';
import gal_sal from './gal_sal.js';
import kian from './kian.js';
import dante from './dante.js';
import erin from './erin.js';
import aguiar from './aguiar.js';
import labirinto from './labirinto.js';
import xande from './xande.js';
import lirio from './lirio.js';
import ferreiro from './ferreiro.js';
import juan from './juan.js';
import kemi from './kemi.js';

// Elenco jogável, na ordem da tela de seleção.
// Para adicionar um personagem: crie o arquivo de definição aqui, registre o
// modelo em models/index.js e acrescente nesta lista.
export const ROSTER = [kaiser, arthur, joui, aghata, dante, erin, gal_sal, kian, aguiar, labirinto, xande, lirio, ferreiro, juan, kemi];

export function getCharacter(id) {
  return ROSTER.find((c) => c.id === id);
}
