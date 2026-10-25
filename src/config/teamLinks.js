// Ligações de Lore para a Batalha em Equipe (equipe de 3: líder + 2 assistências)
// Inspirado na mecânica do Naruto Storm 4 (TODO, *EQUIPE — BARRA DE EQUIPE E ESPECIAIS EM EQUIPE*).
// Cada ligação muda só a ANIMAÇÃO do Especial em Equipe (o dano é o mesmo de qualquer um); a coreografia de cada uma
// fica em combat/teamSpecials.js.
//   members  os personagens da ligação (trio ou dupla; todos precisam estar na equipe)
//   group + min  grupo: vale com `min` membros na equipe e aparecem TODOS os membros, mesmo os de fora da equipe
//   priority  (opcional) desempate manual quando duas ligações valem para a mesma equipe (maior ganha)
//
// VERSÕES DO MESMO PERSONAGEM (pedido de 2026-10-26: vão existir várias versões, e especiais diferentes com membros em
// comum — nem sempre todos, às vezes outra versão dos mesmos). Cada versão nova é uma ficha com `baseId` apontando
// para o personagem (como as formas: `baseId: 'kaiser'`). Na lista de uma ligação:
//   'kaiser'             vale para QUALQUER versão do Kaiser (o id dele ou a baseId das versões)
//   'kaiser_calamidade'  vale SÓ para essa versão
// Duas versões do mesmo personagem na equipe contam como UM membro. Se mais de uma ligação valer, ganha: `priority`,
// depois grupo > trio > dupla (regra do TODO), depois a mais ESPECÍFICA (mais versões exatas), depois a que tem o líder.

export const MASCARADOS = ['dalmo', 'aguiar', 'jae', 'kemi', 'labirinto', 'juan'];
// FORÇA D (Desconjuração): Arthur, Kaiser e Joui hoje; Thiago e Liz entram quando estiverem no elenco (ids que ainda não
// existem são ignorados). A Equipe Abutres é a equipe de Calamidade (sem o Kaiser) — outra ligação, com as versões de
// Calamidade, quando elas estiverem no jogo.
export const FORCA_D = ['arthur', 'kaiser', 'joui', 'thiago', 'liz'];

export const TEAM_LINKS = {
  // Grupo dos Mascarados (3 ou mais na equipe): os seis cercam o alvo
  mascarados: {
    id: 'mascarados',
    kind: 'group',
    name: 'EXECUÇÃO DOS MASCARADOS',
    banner: 'Execução dos Mascarados!',
    group: MASCARADOS,
    min: 3,
    style: 'circle',
    color: 0xc4241c,
  },
  // Força D: vale com 3 da equipe e aparecem todos os membros, cada um com o golpe próprio
  forca_d: {
    id: 'forca_d',
    kind: 'group',
    name: 'FORÇA D',
    banner: 'Força D!',
    group: FORCA_D,
    min: 3,
    color: 0x4a90e2,
  },
  // Dupla Cristopher + Kaiser (pai e filho: o dublê segura, o filho atira)
  cristopher_kaiser: {
    id: 'cristopher_kaiser',
    kind: 'duo',
    name: 'A MURALHA E O DISPARO',
    banner: 'A Muralha e o Disparo!',
    members: ['cristopher', 'kaiser'],
    color: 0xd9822b,
  },
};

const KIND_ORDER = { group: 0, trio: 1, duo: 2 };

// a ficha de quem está na equipe (aceita id, ficha ou lutador/assistência)
const defOf = (m) => (typeof m === 'string' ? { id: m } : (m && m.def) || m || {});

// id de base (uma versão ou forma conta como o personagem: Colosso → dalmo)
export const linkId = (m) => { const d = defOf(m); return d.baseId || d.id || ''; };

// a entrada da ligação vale para essa ficha? ('kaiser' → qualquer versão; 'kaiser_x' → só ela)
export const matchesEntry = (entry, m) => { const d = defOf(m); return d.id === entry || d.baseId === entry; };

// a ficha faz parte da ligação?
export const inLink = (link, m) => (link.group || link.members).some((e) => matchesEntry(e, m));

// quantas entradas da ligação a equipe cobre, e quantas por versão exata
function coverage(link, defs) {
  let hit = 0;
  let exact = 0;
  for (const e of link.group || link.members) {
    const d = defs.find((x) => matchesEntry(e, x));
    if (!d) continue;
    hit++;
    if (d.baseId && d.id === e) exact++;
  }
  return { hit, exact };
}

// A ligação da equipe (ou null). members[0] é o líder.
export function getTeamLink(members) {
  if (!members || members.length < 2) return null;
  const defs = members.map(defOf).filter((d) => d.id);
  // duas versões do mesmo personagem contam como um membro
  const people = new Set(defs.map(linkId)).size;
  const leader = defs[0];
  const ok = [];
  Object.values(TEAM_LINKS).forEach((l, order) => {
    const c = coverage(l, defs);
    const entries = (l.group || l.members).length;
    const valid = l.group ? c.hit >= l.min && people >= l.min && new Set(defs.filter((d) => inLink(l, d)).map(linkId)).size >= l.min : c.hit === entries;
    if (valid) ok.push({ l, order, exact: c.exact, lead: inLink(l, leader) ? 1 : 0 });
  });
  ok.sort((a, b) => (b.l.priority || 0) - (a.l.priority || 0) || KIND_ORDER[a.l.kind] - KIND_ORDER[b.l.kind] || b.exact - a.exact || b.lead - a.lead || a.order - b.order);
  return ok.length ? ok[0].l : null;
}
