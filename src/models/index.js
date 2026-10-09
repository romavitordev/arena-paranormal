import { addKaiserProps, addArthurProps, addJouiProps, addAghataProps, addGalSalProps, addKianProps, addErinProps, addAguiarProps, addLabirintoProps, addXandeProps, addLirioProps, addFerreiroProps, addJuanProps, addKemiProps, addFantasmaProps, addBaluProps, addErinCaosProps, addLabirintoElmoProps, addAguiarMutiladorProps, addArnaldoProps, addAnfitriaoProps, addVerissimoProps, addJaeProps, addJaeXProps } from './props.js';
import { loadGLB, rigFromGLB } from './glbRig.js';
import { preloadNpcModels } from './npcRig.js';

// Registro de MODELOS, separado das habilidades.
// Todo personagem tem o seu modelo do Blender (.glb em public/models, gerado por tools/blender/char_<id>.py). Os modelos
// procedurais antigos (corpos provisórios montados em código) foram APAGADOS: quando um .glb falhava ao carregar o jogo
// mostrava o corpo antigo de outro personagem (ex.: a Erin com a Aghata antiga). Agora o carregamento tenta de novo.
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
  arnaldo: { url: 'models/arnaldo.glb', props: addArnaldoProps }, // Arnaldo Fritz (Desconjuração/Calamidade)
  anfitriao: { url: 'models/anfitriao.glb', props: addAnfitriaoProps }, // O Anfitrião (máscara fundida, cabos)
  verissimo: { url: 'models/verissimo.glb', props: addVerissimoProps }, // Senhor Veríssimo (Calamidade)
  jae: { url: 'models/jae.glb', props: addJaeProps }, // Park Jae-Yoon (Hexatombe)
};

// Formas que reaproveitam o .glb de outro modelo, só com os acessórios diferentes (máscaras dos Mascarados, Erin)
const MODEL_VARIANTS = {
  erin_caos: { base: 'erin', props: addErinCaosProps }, // máscara de gás (Em Nome do Caos)
  labirinto_elmo: { base: 'labirinto', props: addLabirintoElmoProps }, // Capacete do ???
  aguiar_mutilador: { base: 'aguiar', props: addAguiarMutiladorProps }, // máscara do Mutilador Noturno
  jae_x: { base: 'jae', props: addJaeXProps }, // capuz do X
};

// todos os modelos que o jogo sabe montar (personagens e formas)
export const MODEL_IDS = [...Object.keys(BLENDER_MODELS), ...Object.keys(MODEL_VARIANTS)];

const loaded = {};
const RETRIES = 4;

// baixa um .glb tentando de novo (servidor ocupado, rede instável, resposta errada): só desiste depois de RETRIES vezes
async function loadWithRetry(url) {
  let last;
  for (let i = 0; i < RETRIES; i++) {
    try {
      return await loadGLB(i ? `${url}?r=${i}` : url);
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw last;
}

// Carrega todos os .glb (chamado uma vez no início do jogo). Falhou mesmo tentando de novo → erro (o jogo avisa)
export async function preloadModels(onProgress) {
  const ids = Object.keys(BLENDER_MODELS);
  let done = 0;
  const npcs = preloadNpcModels(); // invocações (Marionete, Zumbis de Sangue)
  const failed = [];
  await Promise.all(ids.map(async (id) => {
    if (loaded[id]) { done++; return; }
    try {
      loaded[id] = await loadWithRetry(import.meta.env.BASE_URL + BLENDER_MODELS[id].url);
    } catch (e) {
      console.error(`Modelo ${id} não carregou`, e);
      failed.push(id);
    }
    done++;
    onProgress && onProgress(done / ids.length);
  }));
  await npcs;
  if (failed.length) throw new Error(`Modelos que não carregaram: ${failed.join(', ')}`);
}

export function buildModel(id) {
  const variant = MODEL_VARIANTS[id];
  const base = variant ? variant.base : id;
  const gltf = loaded[base];
  if (!gltf) throw new Error(`Modelo não carregado: ${id}`);
  const rig = rigFromGLB(gltf);
  const props = variant ? variant.props : BLENDER_MODELS[id] && BLENDER_MODELS[id].props;
  if (props) props(rig);
  return rig.finish();
}
