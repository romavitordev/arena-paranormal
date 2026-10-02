import { buildCineraria } from './characters/cineraria.js';
import { buildAbutre } from './characters/abutre.js';
import { buildMascarado } from './characters/mascarado.js';
import { addCinerariaProps, addAbutreProps, addMascaradoProps, addVampiraProps, addInjusticaProps, addDesconjuradoProps, addErinProps, addAguiarProps, addLabirintoProps, addXandeProps, addLirioProps, addFerreiroProps, addJuanProps, addKemiProps, addFantasmaProps } from './props.js';
import { buildVampira } from './characters/vampira.js';
import { buildInjustica } from './characters/injustica.js';
import { buildDesconjurado } from './characters/desconjurado.js';
import { buildDante } from './characters/dante.js';
import { loadGLB, rigFromGLB } from './glbRig.js';

// Registro de MODELOS, separado das habilidades.
// Cada personagem pode ter um modelo do Blender (.glb em public/models, gerado por
// tools/blender/char_<id>.py). Se o arquivo não existir, usa o modelo procedural.
export const MODEL_BUILDERS = {
  cineraria: buildCineraria,
  abutre: buildAbutre,
  mascarado: buildMascarado,
  vampira: buildVampira,
  injustica: buildInjustica,
  desconjurado: buildDesconjurado,
  dante: buildDante,
  // sem modelo procedural próprio: se o .glb faltar, usa um corpo provisório parecido
  erin: buildVampira,
  aguiar: buildMascarado,
  labirinto: buildDesconjurado,
  xande: buildCineraria,
  lirio: buildAbutre,
  ferreiro: buildAbutre,
  deus_morte: buildAbutre,
  juan: buildVampira,
  diabo: buildVampira,
  kemi: buildVampira,
  fantasma: buildVampira,
};

// Modelos do Blender + armas/acessórios adicionados em código
const BLENDER_MODELS = {
  cineraria: { url: 'models/cineraria.glb', props: addCinerariaProps },
  abutre: { url: 'models/abutre.glb', props: addAbutreProps },
  mascarado: { url: 'models/mascarado.glb', props: addMascaradoProps },
  vampira: { url: 'models/vampira.glb', props: addVampiraProps },
  injustica: { url: 'models/injustica.glb', props: addInjusticaProps },
  desconjurado: { url: 'models/desconjurado.glb', props: addDesconjuradoProps },
  dante: { url: 'models/dante.glb', props: null }, // sem armas
  erin: { url: 'models/erin.glb', props: addErinProps },
  aguiar: { url: 'models/aguiar.glb', props: addAguiarProps },
  labirinto: { url: 'models/labirinto.glb', props: addLabirintoProps },
  xande: { url: 'models/xande.glb', props: addXandeProps },
  lirio: { url: 'models/lirio.glb', props: addLirioProps },
  ferreiro: { url: 'models/ferreiro.glb', props: addFerreiroProps }, // o Luzidio de Santo Berço
  deus_morte: { url: 'models/deus_morte.glb', props: null }, // forma de chefe (sem armas)
  juan: { url: 'models/juan.glb', props: addJuanProps },
  diabo: { url: 'models/diabo.glb', props: null }, // Portador do Trono (garras)
  kemi: { url: 'models/kemi.glb', props: addKemiProps },
  fantasma: { url: 'models/fantasma.glb', props: addFantasmaProps }, // forma das Faixas
};

const loaded = {};

// Carrega todos os .glb disponíveis (chamado uma vez no início do jogo)
export async function preloadModels(onProgress) {
  const ids = Object.keys(BLENDER_MODELS);
  let done = 0;
  await Promise.all(ids.map(async (id) => {
    try {
      loaded[id] = await loadGLB(import.meta.env.BASE_URL + BLENDER_MODELS[id].url);
    } catch (e) {
      console.warn(`Modelo do Blender indisponível (${id}), usando o provisório.`, e);
    }
    done++;
    onProgress && onProgress(done / ids.length);
  }));
}

export function buildModel(id) {
  if (loaded[id]) {
    const rig = rigFromGLB(loaded[id]);
    BLENDER_MODELS[id].props && BLENDER_MODELS[id].props(rig);
    return rig.finish();
  }
  const fn = MODEL_BUILDERS[id];
  if (!fn) throw new Error(`Modelo não registrado: ${id}`);
  return fn();
}
