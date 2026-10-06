import { buildKaiser } from './characters/kaiser.js';
import { buildArthur } from './characters/arthur.js';
import { buildJoui } from './characters/joui.js';
import { addKaiserProps, addArthurProps, addJouiProps, addAghataProps, addGalSalProps, addKianProps, addErinProps, addAguiarProps, addLabirintoProps, addXandeProps, addLirioProps, addFerreiroProps, addJuanProps, addKemiProps, addFantasmaProps, addBaluProps, addErinCaosProps, addLabirintoElmoProps, addAguiarMutiladorProps, addArnaldoProps, addAnfitriaoProps, addVerissimoProps } from './props.js';
import { buildAghata } from './characters/aghata.js';
import { buildGalSal } from './characters/gal_sal.js';
import { buildKian } from './characters/kian.js';
import { buildDante } from './characters/dante.js';
import { loadGLB, rigFromGLB } from './glbRig.js';
import { preloadNpcModels } from './npcRig.js';

// Registro de MODELOS, separado das habilidades.
// Cada personagem pode ter um modelo do Blender (.glb em public/models, gerado por
// tools/blender/char_<id>.py). Se o arquivo não existir, usa o modelo procedural.
export const MODEL_BUILDERS = {
  kaiser: buildKaiser,
  arthur: buildArthur,
  joui: buildJoui,
  aghata: buildAghata,
  gal_sal: buildGalSal,
  kian: buildKian,
  dante: buildDante,
  // sem modelo procedural próprio: se o .glb faltar, usa um corpo provisório parecido
  erin: buildAghata,
  aguiar: buildJoui,
  labirinto: buildKian,
  xande: buildKaiser,
  lirio: buildArthur,
  ferreiro: buildArthur,
  deus_morte: buildArthur,
  juan: buildAghata,
  diabo: buildAghata,
  kemi: buildAghata,
  fantasma: buildAghata,
  balu: buildArthur,
  erin_caos: buildAghata,
  labirinto_elmo: buildKian,
  aguiar_mutilador: buildJoui,
  arnaldo: buildJoui,
  anfitriao: buildJoui,
  verissimo: buildArthur,
};

// Modelos do Blender + armas/acessórios adicionados em código
const BLENDER_MODELS = {
  kaiser: { url: 'models/kaiser.glb', props: addKaiserProps },
  arthur: { url: 'models/arthur.glb', props: addArthurProps },
  joui: { url: 'models/joui.glb', props: addJouiProps },
  aghata: { url: 'models/aghata.glb', props: addAghataProps },
  gal_sal: { url: 'models/gal_sal.glb', props: addGalSalProps },
  kian: { url: 'models/kian.glb', props: addKianProps },
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
  balu: { url: 'models/balu.glb', props: addBaluProps }, // Antônio "Balu" Pontevedra (Machado Lancinante)
};

// Formas que reaproveitam o .glb de outro modelo, só com os acessórios diferentes (máscaras dos Mascarados, Erin)
const MODEL_VARIANTS = {
  erin_caos: { base: 'erin', props: addErinCaosProps }, // máscara de gás (Em Nome do Caos)
  labirinto_elmo: { base: 'labirinto', props: addLabirintoElmoProps }, // Capacete do ???
  aguiar_mutilador: { base: 'aguiar', props: addAguiarMutiladorProps }, // máscara do Mutilador Noturno
  // PROVISÓRIOS até os modelos do Blender (TODO: Arnaldo, Anfitrião e Veríssimo): corpo de outro lutador + acessórios
  arnaldo: { base: 'joui', props: addArnaldoProps }, // espada da fita, óculos, gravata vermelha, relógio de bolso
  anfitriao: { base: 'joui', props: addAnfitriaoProps }, // máscara do Anfitrião + relógio com a Relíquia no braço
  verissimo: { base: 'lirio', props: addVerissimoProps }, // espada do Arnaldo, bigode, gravata azul, escopeta
};

const loaded = {};

// Carrega todos os .glb disponíveis (chamado uma vez no início do jogo)
export async function preloadModels(onProgress) {
  const ids = Object.keys(BLENDER_MODELS);
  let done = 0;
  const npcs = preloadNpcModels(); // invocações (Marionete, Zumbis de Sangue)
  await Promise.all(ids.map(async (id) => {
    try {
      loaded[id] = await loadGLB(import.meta.env.BASE_URL + BLENDER_MODELS[id].url);
    } catch (e) {
      console.warn(`Modelo do Blender indisponível (${id}), usando o provisório.`, e);
    }
    done++;
    onProgress && onProgress(done / ids.length);
  }));
  await npcs;
}

export function buildModel(id) {
  const variant = MODEL_VARIANTS[id];
  if (variant && loaded[variant.base]) {
    const rig = rigFromGLB(loaded[variant.base]);
    variant.props(rig);
    return rig.finish();
  }
  if (loaded[id]) {
    const rig = rigFromGLB(loaded[id]);
    BLENDER_MODELS[id].props && BLENDER_MODELS[id].props(rig);
    return rig.finish();
  }
  const fn = MODEL_BUILDERS[id];
  if (!fn) throw new Error(`Modelo não registrado: ${id}`);
  return fn();
}
