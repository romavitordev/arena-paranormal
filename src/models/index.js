import { addKaiserProps, addArthurProps, addJouiProps, addAghataProps, addGalSalProps, addKianProps, addErinProps, addAguiarProps, addLabirintoProps, addXandeProps, addLirioProps, addFerreiroProps, addJuanProps, addKemiProps, addFantasmaProps, addBaluProps, addErinCaosProps, addLabirintoElmoProps, addAguiarMutiladorProps, addArnaldoProps, addAnfitriaoProps, addVerissimoProps, addJaeProps, addJaeXProps, addDalmoProps, addColossoProps, addGuizoProps, addGuizoETProps, addKianCalamidadeProps, addJuanOdioProps, addMagistradaProps, addGuizoBombadoProps, addGuizoVelhoProps, addCristinoProps, addCristinoDesertorProps, addDanteProps, addDanteAbertoProps, addJouiShinokageProps, addRazielProps, addRazielVerdadeiroProps, addCelestineProps, addCelestineMagistradaProps, addSeitaProps, addGaiusProps, addAmphitruoProps } from './props.js';
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
  nubi: { url: 'models/nubi.glb', props: null }, // a bengala de chacal vem no próprio modelo
  dante: { url: 'models/dante.glb', props: addDanteProps }, // sem armas (Calamidade, de olhos fechados)
  erin: { url: 'models/erin.glb', props: addErinProps },
  aguiar: { url: 'models/aguiar.glb', props: addAguiarProps },
  labirinto: { url: 'models/labirinto.glb', props: addLabirintoProps },
  xande: { url: 'models/xande.glb', props: addXandeProps },
  lirio: { url: 'models/lirio.glb', props: addLirioProps },
  ferreiro: { url: 'models/ferreiro.glb', props: addFerreiroProps }, // o Luzidio de Santo Berço
  deus_morte: { url: 'models/deus_morte.glb', props: null }, // forma de chefe (sem armas)
  juan: { url: 'models/juan.glb', props: addJuanProps },
  diabo: { url: 'models/diabo.glb', props: null }, // Portador do Trono (garras)
  o_diabo: { url: 'models/o_diabo.glb', props: null }, // O Diabo de Ordem Paranormal (o Portador do Trono é a transformação dele)
  magistrada: { url: 'models/magistrada.glb', props: addMagistradaProps },
  estrangeiro: { url: 'models/estrangeiro.glb', props: null },
  amigo: { url: 'models/amigo.glb', props: null }, // o Amigo Imaginário (O Segredo na Ilha)
  manancial: { url: 'models/manancial.glb', props: null }, // os Mananciais (invocação do Ferreiro; fora da seleção)
  kemi: { url: 'models/kemi.glb', props: addKemiProps },
  fantasma: { url: 'models/fantasma.glb', props: addFantasmaProps }, // forma das Faixas
  balu: { url: 'models/balu.glb', props: addBaluProps }, // Antônio "Balu" Pontevedra (Machado Lancinante)
  arnaldo: { url: 'models/arnaldo.glb', props: addArnaldoProps }, // Arnaldo Fritz (Desconjuração/Calamidade)
  anfitriao: { url: 'models/anfitriao.glb', props: addAnfitriaoProps }, // O Anfitrião (máscara fundida, cabos)
  verissimo: { url: 'models/verissimo.glb', props: addVerissimoProps }, // Senhor Veríssimo (Calamidade)
  jae: { url: 'models/jae.glb', props: addJaeProps }, // Park Jae-Yoon (Hexatombe)
  dalmo: { url: 'models/dalmo.glb', props: addDalmoProps }, // Dalmo Magno, o Colosso (Hexatombe)
  guizo: { url: 'models/guizo.glb', props: addGuizoProps }, // Guilherme "Guizo" Santos (Sinais do Outro Lado)
  cristino: { url: 'models/cristino.glb', props: addCristinoProps }, // Cristino, o Cangaceiro (Transtornados, Hexatombe)
  cristopher: { url: 'models/cristopher.glb', props: null }, // Cristopher Cohen, o dublê (Ordo Realitas, OSNF) — luta de punhos
  raziel: { url: 'models/raziel.glb', props: addRazielProps }, // Raziel, o líder dos Vampiros (Hexatombe)
  celestine: { url: 'models/celestine.glb', props: addCelestineProps }, // Celestine, guerreira da Ordo Calamitas (Calamidade, 67 d.C.)
  seita: { url: 'models/seita.glb', props: addSeitaProps },
  gaius: { url: 'models/gaius.glb', props: addGaiusProps }, // Gaius (Ordo Calamitas, Calamidade, 67 d.C.) // membro da Seita das Máscaras (as invocações da Magistrada)
};

// Formas que reaproveitam o .glb de outro modelo, só com os acessórios diferentes (máscaras dos Mascarados, Erin)
const MODEL_VARIANTS = {
  erin_caos: { base: 'erin', props: addErinCaosProps }, // máscara de gás (Em Nome do Caos)
  labirinto_elmo: { base: 'labirinto', props: addLabirintoElmoProps }, // Capacete do ???
  aguiar_mutilador: { base: 'aguiar', props: addAguiarMutiladorProps }, // máscara do Mutilador Noturno
  jae_x: { base: 'jae', props: addJaeXProps }, // capuz do X
  colosso: { base: 'dalmo', props: addColossoProps }, // o escafandro e as Manoplas
  guizo_et: { base: 'guizo', props: addGuizoETProps },
  guizo_bombado: { base: 'guizo', props: addGuizoBombadoProps }, // Distorcer Aparência: a versão bombada
  guizo_velho: { base: 'guizo', props: addGuizoVelhoProps }, // Distorcer Aparência: a versão velha
  juan_odio: { base: 'juan', props: addJuanOdioProps }, // Ódio do Diabo: garras de sangue, capuz e o olho vermelho
  dante_aberto: { base: 'dante', props: addDanteAbertoProps }, // Olhos Abertos: olhos pretos, as faixas, as tatuagens e as orelhas pontudas
  cristino_desertor: { base: 'cristino', props: addCristinoDesertorProps }, // Tocado pela Coroa: rabiscos vermelhos e o rifle
  joui_shinokage: { base: 'joui', props: addJouiShinokageProps }, // sem a máscara, com a Shi no Kage (fase final)
  raziel_verdadeiro: { base: 'raziel', props: addRazielVerdadeiroProps }, // rasga as vestes: costelas, braços rasgados, a língua
  celestine_magistrada: { base: 'celestine', props: addCelestineMagistradaProps },
  amphitruo: { base: 'gaius', props: addAmphitruoProps }, // Amphitruo: o Gaius com a máscara da Relíquia de Energia e as chamas roxas // a Máscara do Desespero no rosto
  kian_calamidade: { base: 'kian', props: addKianCalamidadeProps }, // a barba cheia e as faixas // Distorcer Aparência: o disfarce alienígena
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
