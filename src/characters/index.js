import cineraria from './cineraria.js';
import abutre from './abutre.js';
import mascarado from './mascarado.js';
import vampira from './vampira.js';
import injustica from './injustica.js';
import desconjurado from './desconjurado.js';
import dante from './dante.js';
import erin from './erin.js';
import aguiar from './aguiar.js';
import labirinto from './labirinto.js';
import xande from './xande.js';
import lirio from './lirio.js';
import miguel from './miguel.js';
import juan from './juan.js';
import kemi from './kemi.js';

// Elenco jogável, na ordem da tela de seleção.
// Para adicionar um personagem: crie o arquivo de definição aqui, registre o
// modelo em models/index.js e acrescente nesta lista.
export const ROSTER = [cineraria, abutre, mascarado, vampira, dante, erin, injustica, desconjurado, aguiar, labirinto, xande, lirio, miguel, juan, kemi];

export function getCharacter(id) {
  return ROSTER.find((c) => c.id === id);
}
