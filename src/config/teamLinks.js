// Ligações de Lore para a Batalha em Equipe (equipe de 3: líder + 2 assistências)
// Inspirado na mecânica do Naruto Storm 4 (TODO seções 280-337).

export const MASCARADOS = ['dalmo', 'aguiar', 'jae', 'kemi', 'labirinto', 'juan'];

export const TEAM_LINKS = {
  // Trio dos Abutres / Ordo Realitas clássica
  abutres: {
    id: 'abutres',
    name: 'O SEGREDO NA FLORESTA',
    banner: 'O Segredo na Floresta!',
    members: ['joui', 'kaiser', 'arthur'],
    color: 0x4a90e2,
    priority: 1,
  },
  // Grupo dos Mascarados (3 ou mais na equipe)
  mascarados: {
    id: 'mascarados',
    name: 'EXECUÇÃO DOS MASCARADOS',
    banner: 'Execução dos Mascarados!',
    group: MASCARADOS,
    min: 3,
    color: 0xc4241c,
    priority: 2,
  },
  // Dupla Cristopher + Kaiser (Dublê e Atirador)
  cristopher_kaiser: {
    id: 'cristopher_kaiser',
    name: 'A MURALHA E O DISPARO',
    banner: 'A Muralha e o Disparo!',
    members: ['cristopher', 'kaiser'],
    color: 0xd9822b,
    priority: 3,
  },
};

// Retorna a ligação da equipe (ou null): prioridade trio > grupo > dupla
export function getTeamLink(members) {
  if (!members || members.length < 2) return null;
  const ids = members.map((m) => (typeof m === 'string' ? m : m.id || m.def?.id || '')).filter(Boolean);

  // 1. Trio completo (Joui + Kaiser + Arthur)
  if (['joui', 'kaiser', 'arthur'].every((id) => ids.includes(id))) {
    return TEAM_LINKS.abutres;
  }

  // 2. Grupo dos Mascarados (pelo menos 3 membros)
  const mascCount = ids.filter((id) => MASCARADOS.includes(id)).length;
  if (mascCount >= 3) {
    return TEAM_LINKS.mascarados;
  }

  // 3. Dupla com ligação (Cristopher + Kaiser)
  if (ids.includes('cristopher') && ids.includes('kaiser')) {
    return TEAM_LINKS.cristopher_kaiser;
  }

  return null;
}
