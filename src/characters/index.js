import kaiser from './kaiser.js';
import arthur from './arthur.js';
import joui from './joui.js';
import aghata from './aghata.js';
import gal_sal from './gal_sal.js';
import nubi from './nubi.js';
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
import balu from './balu.js';
import arnaldo from './arnaldo.js';
import verissimo from './verissimo.js';
import jae from './jae.js';
import dalmo from './dalmo.js';
import guizo from './guizo.js';
import oDiabo from './o_diabo.js';
import magistrada from './magistrada.js';
import estrangeiro from './estrangeiro.js';
import amigo from './amigo.js';
import cristino from './cristino.js';
import cristopher from './cristopher.js';
import raziel from './raziel.js';
import celestine from './celestine.js';
import gaius from './gaius.js';
import amalia from './amalia.js';
import { juanPortador, deusMorteReliquia, anfitriaoReliquia } from './selectableForms.js';

// Elenco jogável, na ordem da tela de seleção — AGRUPADO POR EQUIPE/TEMPORADA (a grade tem 3 colunas × 5 linhas por
// página, então cada grupo ocupa linhas inteiras):
//   página 1: Ordo Realitas — Equipe E / Força D (Arthur, Joui, Kaiser, Dante, Erin, Aghata), Equipe Abutres (Balu),
//             Veríssimo e o Cristopher (Equipe E de OSNF) · Escriptas (Kian, Gal) · Os Cinco (Xande, Guizo, Lírio)
//   página 2: Mascarados / Assassinos de Hexatombe (Dalmo, Aguiar, Jae, Kemi, Labirinto, Juan), os Transtornados de
//             Hexatombe (Cristino) e os Portadores das Relíquias (O Diabo, A Magistrada, Arnaldo, Ferreiro, O Estrangeiro,
//             O Amigo Imaginário) — a seleção quebra a página por equipe (Screens.js → SEL_PAGES),
//             então cada grupo fica junto mesmo se a página anterior não encher
// Para adicionar um personagem: crie o arquivo de definição aqui, registre o modelo em models/index.js e coloque-o
// junto da equipe dele nesta lista.
export const ROSTER = [
  arthur, joui, kaiser, dante, erin, aghata, balu, verissimo, cristopher, // Ordo Realitas (o Cris fecha a Equipe E de OSNF)
  kian, gal_sal, nubi, // Escriptas
  xande, guizo, lirio, // Os Cinco (Sinais do Outro Lado) — o Guizo do lado do melhor amigo
  dalmo, aguiar, jae, kemi, labirinto, juan, // Mascarados (Hexatombe) — o HENRI (id juan); no ódio ele vira o Juan
  cristino, // Transtornados (Hexatombe) — o cangaceiro que não queria jogar o jogo
  raziel, // Vampiros (Hexatombe) — o líder; Alvira, Velisar, Zéfero e Sabara entram depois
  // (2026-10-27) PORTADORES ≠ RELÍQUIAS: quem CARREGA a Relíquia e quem É a Relíquia. As formas ainda acontecem na luta
  // (Henri → Juan (Portador) → Portador do Trono; Arnaldo → Anfitrião; Ferreiro → Deus da Morte), mas também dá para
  // começar já como elas (selectableForms.js)
  // quem é de DUAS equipes (2026-10-27): `origin` é a equipe em que ele fica na seleção (e a cor do retrato); `teams`
  // lista as outras — aparecem como etiqueta extra no cartão e na ficha (ex.: a Celestine, Portadora E Ordo Calamitas)
  juanPortador, arnaldo, ferreiro, celestine, // Portadores (Sangue, Energia, Morte, Conhecimento) — a Celestine também é da Ordo Calamitas
  gaius, // Ordo Calamitas (Calamidade, 67 d.C.) — o Gaius; no RB/LB, o AMPHITRUO (a versão transformada)
  amalia, // Ordo Calamitas — A Flecha, a arqueira (Calamidade). Faustus, Marius, Remus, Cascadia, Cornelius... depois
  oDiabo, deusMorteReliquia, magistrada, anfitriaoReliquia, // Relíquias (Sangue, Morte, Conhecimento, Energia)
  estrangeiro, amigo, // Outro Lado (os Sinos de Tenebris: Transmissão e Tinta)
];

// VERSÕES do mesmo personagem (seleção: RB/LB trocam a versão sem sair do cartão, como no Naruto Storm). A ordem é a do
// ciclo: no Henri, RB → Juan → Henri; LB volta pelo outro lado. Cada versão também tem o próprio cartão na grade.
export const VERSION_GROUPS = [
  ['juan', 'juan_odio'], // Henri → Juan (Portador)
  ['gaius', 'anfitriao'], // Gaius → Amphitruo (o Anfitrião das Relíquias tem a aparência dele; o do Arnaldo é só transformação)
  ['ferreiro', 'deus_morte'], // Ferreiro → O Deus da Morte
];

// índices no ROSTER das versões do lutador do índice i (ele mesmo incluído; só ele quando não tem outras)
export function versionsOf(i) {
  const id = ROSTER[i] && ROSTER[i].id;
  const group = VERSION_GROUPS.find((g) => g.includes(id));
  return group ? group.map((v) => ROSTER.findIndex((c) => c.id === v)).filter((k) => k >= 0) : [i];
}

// RITMO DOS COMBOS (stats.attackSpeed): > 1 deixa os golpes físicos mais rápidos (duração, janelas de acerto,
// movimentos e invulnerabilidade escalam juntos; a animação acompanha porque toca com a duração do golpe).
// Aplicado uma vez, ao carregar. Ágeis/leves acima de 1; pesados em 1 (aguentam pela vida); Juan abaixo de 1.
export function applyAttackSpeed(def) {
  const k = def.stats && def.stats.attackSpeed;
  if (!k || k === 1 || def.attackSpeedApplied) return def;
  def.attackSpeedApplied = true;
  const scale = (s) => {
    if (!s || typeof s !== 'object') return;
    if (s.dur) s.dur /= k;
    if (s.active) s.active = s.active.map((t) => t / k);
    if (s.actives) s.actives = s.actives.map((w) => w.map((t) => t / k));
    if (s.iframes) s.iframes = s.iframes.map((t) => t / k);
    if (s.motion) s.motion = s.motion.map((m) => ({ ...m, t: m.t.map((t) => t / k) }));
  };
  const m = def.melee || {};
  (m.strikes || []).forEach(scale);
  for (const key of ['up', 'down', 'forward', 'back', 'side', 'air', 'ground']) scale(m[key]);
  return def;
}
ROSTER.forEach(applyAttackSpeed);
