// FORMAS: definições completas de personagem que NÃO aparecem na seleção — o lutador vira uma delas no meio da luta
// (ver combat/forms.js). Ex.: Ferreiro → Deus da Morte; Juan → Ódio do Diabo → Diabo (dois estágios); Kemi → Fantasma.
import deusMorte from './deus_morte.js';
import diabo from './diabo.js';
import fantasma from './fantasma.js';
import labirintoElmo from './labirinto_elmo.js';
import aguiarMutilador from './aguiar_mutilador.js';
import erinCaos from './erin_caos.js';
import anfitriao from './anfitriao.js';
import jaeX from './jae_x.js';
import colosso from './colosso.js';
import guizoEt from './guizo_et.js';
import kianCalamidade from './kian_calamidade.js';
import juanOdio from './juan_odio.js';
import guizoBombado from './guizo_bombado.js';
import guizoVelho from './guizo_velho.js';
import cristinoDesertor from './cristino_desertor.js';
import danteAberto from './dante_aberto.js';
import jouiShinokage from './joui_shinokage.js';

export const FORMS = {};

export function registerForm(def) {
  FORMS[def.id] = def;
  return def;
}

export function getForm(id) {
  return FORMS[id];
}

[deusMorte, diabo, fantasma, labirintoElmo, aguiarMutilador, erinCaos, anfitriao, jaeX, colosso, guizoEt, kianCalamidade, juanOdio, guizoBombado, guizoVelho, cristinoDesertor, danteAberto, jouiShinokage].forEach(registerForm);
