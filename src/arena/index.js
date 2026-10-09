import { createGLBArena, preloadArena } from './glbArena.js';
import { ORFANATO, SUVACO, COLISEU, SANTO_BERCO, RUINAS, ACAMPAMENTO } from './configs.js';

// cenários do Blender carregados no início do jogo
const GLB_ARENAS = { orfanato: ORFANATO, suvaco: SUVACO, coliseu: COLISEU, santo_berco: SANTO_BERCO, ruinas: RUINAS, acampamento: ACAMPAMENTO };
export async function preloadArenas() {
  await Promise.all(Object.values(GLB_ARENAS).map((cfg) => preloadArena(cfg).catch((e) => {
    console.warn('Cenário indisponível:', cfg.id, e);
    ARENAS[cfg.id].available = false;
  })));
}

// Registro de cenários. Para adicionar um: monte o cenário no Blender (tools/blender/arena_<id>.py, com peças
// prontas do Kenney via kenney.py), descreva luz/céu/limites em configs.js, registre aqui e coloque o id em ARENA_ORDER.
//  available: false → aparece na seleção como "EM BREVE"
//  colors: [céu, chão, destaque] — usados no cartão da seleção enquanto o preview não fica pronto
//  thumbCamera: { pos, look } — enquadramento da imagem de preview (src/ui/arenaThumbs.js)
export const ARENAS = {
  ruinas: {
    name: 'Ruínas do Ritual',
    description: 'Cemitério abandonado com um círculo de invocação, pilares e névoa roxa.',
    colors: ['#1a1028', '#2a2232', '#a46bff'],
    available: true,
    thumbCamera: { pos: [0, 7, 15], look: [0, 0.5, 0] }, // enquadramento do preview na seleção
    create: () => createGLBArena(RUINAS),
  },
  orfanato: {
    name: 'Orfanato Santa Mega-Freira',
    description: 'O pátio de um casarão antigo num dia nublado: balanços nas árvores, raízes expostas e janelas que observam.',
    colors: ['#c9ccd0', '#6b5a3e', '#e8b860'],
    available: true,
    thumbCamera: { pos: [-10, 2.2, 0], look: [14, 5.5, 0] }, // enquadramento do preview na seleção
    create: () => createGLBArena(ORFANATO),
  },
  suvaco: {
    name: 'Bar Suvaco Seco',
    description: 'Bar de esquina à noite. A luta começa lá dentro, entre a sinuca e o balcão, e pode sair para a calçada.',
    colors: ['#14100c', '#3a2a1a', '#ffb347'],
    available: true,
    thumbCamera: { pos: [7.5, 2.6, 4.5], look: [-4, 1.4, -2] }, // enquadramento do preview na seleção
    create: () => createGLBArena(SUVACO),
  },
  coliseu: {
    name: 'Coliseu',
    description: 'Arena de areia ao entardecer cercada por muralhas e torres em ruínas, com estandartes, braseiros e catapultas destruídas.',
    colors: ['#e8915a', '#c9a46a', '#7a2a1a'],
    available: true,
    thumbCamera: { pos: [12, 2.5, -10], look: [-10, 6, 8] }, // enquadramento do preview na seleção
    create: () => createGLBArena(COLISEU),
  },
  santo_berco: {
    name: 'Santo Berço',
    description: 'A praça do vilarejo dos Luzidios, em frente ao Labirinto Infinito: casas medievais, as estátuas dos Cinco Guardiões e o Símbolo Espiral no chão.',
    colors: ['#f0c890', '#7a5a3a', '#b8a0ff'],
    available: true,
    thumbCamera: { pos: [0, 4.5, 16], look: [0, 3, -30] }, // a praça com o labirinto e as estátuas ao fundo
    create: () => createGLBArena(SANTO_BERCO),
  },
  acampamento: {
    name: 'Acampamento Varminho',
    description: 'Uma clareira no mato à noite, ao lado da estação de TV abandonada de Varminho: fogueira, barracas, a van dos Cinco e um céu cheio de estrelas.',
    colors: ['#0a1430', '#1e2a1c', '#ff8a3a'],
    available: true,
    thumbCamera: { pos: [6, 3.2, 13], look: [-2, 2.5, -20] }, // a fogueira com a van e a torre ao fundo
    create: () => createGLBArena(ACAMPAMENTO),
  },
};

export const ARENA_ORDER = ['orfanato', 'suvaco', 'coliseu', 'santo_berco', 'ruinas', 'acampamento'];
export const DEFAULT_ARENA = 'ruinas';
