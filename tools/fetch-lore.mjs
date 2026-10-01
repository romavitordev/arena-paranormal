// Baixa da Ordem Paranormal Wiki os dados dos membros das origens (Ordo Realitas, Escriptas...)
// para futuras adições ao elenco: afinidade (elemento), classe, rituais, habilidades, arsenal e aparência.
//   npm run lore            → atualiza lore/membros.json e lore/MEMBROS.md
//   npm run lore -- Dante   → só os nomes passados (mescla com o que já existe)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { ROSTER } from '../src/characters/index.js';

const API = 'https://ordemparanormal.fandom.com/api.php';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

// Membros por origem. `page` = título na wiki; `id` = id interno se já estiver no jogo.
export const ORIGINS = {
  'Ordo Realitas': [
    { page: 'Arthur Cervero', id: 'abutre' },
    { page: 'Joui Jouki', id: 'mascarado' },
    { page: 'Cesar Oliveira Cohen', name: 'Kaiser', id: 'cineraria' },
    { page: 'Agatha Volkomenn', id: 'vampira' },
    { page: 'Dante', id: 'dante' },
    { page: 'Elizabeth Webber' },
    { page: 'Thiago Fritz' },
    { page: 'Rubens' },
    { page: 'Antônio Pontevedra', name: 'Balu' },
    { page: 'Erin Parker', id: 'erin' },
    { page: 'Carina Leone' },
    { page: 'Senhor Veríssimo' },
    { page: 'Aaron' },
    { page: 'Mia' },
    { page: 'Luciano Carvalho' },
    { page: 'Beatrice Portinari' },
    { page: 'Cristopher Cohen' },
    { page: 'Arnaldo Fritz' },
    { page: 'Chizue Akechi' },
    { page: 'Tristan' },
    { page: 'Daniel Hartmann' },
    { page: 'Gustavo Dohmer' },
    { page: 'Clarissa Leão' },
    { page: 'Eduarda Flom' },
    { page: 'Cassiano Menta' },
    { page: 'Hugo Longo' },
    { page: 'Tim Flom' },
  ],
  Escriptas: [
    { page: 'Kian', id: 'desconjurado' },
    { page: 'Gal', id: 'injustica' },
    { page: 'Artemis Deordelin', name: 'Artemis' },
    { page: 'Tirigan' },
    { page: 'Anthony Scelto' },
    { page: 'Vanessa Ângelo' },
    { page: 'Boris Lukic' },
    { page: 'Damir Lukic' },
    { page: 'Theodore Bagwell', name: 'T-Bag' },
    { page: 'Dagan' },
    { page: 'Juan', name: 'Juan (Henri)' },
    { page: 'Clara' },
    { page: 'Rana' },
  ],
  // Equipe Mascarados (Hexatombe): agentes da Ordem nos corpos dos assassinos do Natal Macabro
  Mascarados: [
    { page: 'Jonas Aguiar', name: 'Aguiar (Mutilador Noturno)', id: 'aguiar' },
    { page: 'Labirinto', id: 'labirinto' },
    { page: 'Park Jae-Yoon' },
    { page: 'Dalmo Magno' },
    { page: 'Kemi' },
  ],
  // Os Cinco (Sinais do Outro Lado): o grupo de Morato Vertaler
  'Os Cinco': [
    { page: 'Alexandre', name: 'Xande (Alexandre)', id: 'xande' },
    { page: 'Dara Alice Venturini' },
    { page: 'Francisco Albuquerque' },
    { page: 'Lírio Tellini' },
    { page: 'Voytek Nowak' },
    { page: 'Morato Vertaler' },
  ],
};

const ELEMENT_IDS = { sangue: 'sangue', morte: 'morte', conhecimento: 'conhecimento', energia: 'energia', medo: 'medo' };

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${r.status} em ${url}`);
  return r.json();
}

async function wikitext(page) {
  let j = await api({ action: 'parse', page, prop: 'wikitext', redirects: '1' });
  if (j.error) {
    // tenta achar o título certo pela busca
    const s = await api({ action: 'opensearch', search: page, limit: '1' });
    const t = s[1] && s[1][0];
    if (!t) return null;
    j = await api({ action: 'parse', page: t, prop: 'wikitext', redirects: '1' });
    if (j.error) return null;
  }
  return { title: j.parse.title, text: j.parse.wikitext };
}

// remove {{...}} com aninhamento
function stripTemplates(s) {
  let out = '';
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{' && s[i + 1] === '{') { depth++; i++; continue; }
    if (s[i] === '}' && s[i + 1] === '}' && depth > 0) { depth--; i++; continue; }
    if (depth === 0) out += s[i];
  }
  return out;
}

function clean(s) {
  return stripTemplates(
    s
      .replace(/<ref[^>]*\/>/g, '')
      .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<gallery[\s\S]*?<\/gallery>/g, ''),
  )
    .replace(/\[\[(Arquivo|File|Imagem|Categoria|Category):[^\]]*(\[\[[^\]]*\]\][^\]]*)*\]\]/gi, '')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[https?:[^\s\]]+ ([^\]]*)\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function infobox(text) {
  const start = text.indexOf('{{Infobox');
  if (start < 0) return {};
  let depth = 0;
  let end = start;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{' && text[i + 1] === '{') { depth++; i++; } else if (text[i] === '}' && text[i + 1] === '}') { depth--; i++; if (depth === 0) { end = i; break; } }
  }
  const body = text.slice(start, end);
  const fields = {};
  for (const part of body.split(/\n\|/).slice(1)) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    if (!['nome', 'afinidade', 'classe', 'trilha', 'origem', 'associação', 'ocupação', 'status', 'idade'].includes(k)) continue;
    fields[k] = clean(part.slice(eq + 1)).split('\n').map((x) => x.replace(/^\*\s*/, '').trim()).filter(Boolean);
  }
  return fields;
}

// seções "== Título ==" (nível 2)
function sections(text) {
  const out = {};
  const re = /^==([^=].*?)==\s*$/gm;
  const marks = [...text.matchAll(re)];
  out.intro = text.slice(0, marks[0] ? marks[0].index : text.length);
  marks.forEach((m, i) => {
    out[m[1].trim()] = text.slice(m.index + m[0].length, marks[i + 1] ? marks[i + 1].index : text.length);
  });
  return out;
}

// '''[[Rituais#...|Nome]]:''' descrição  →  { nome, descricao, fase, tipo }
function powers(sec) {
  if (!sec) return [];
  const list = [];
  let tipo = '';
  let fase = '';
  for (const raw of sec.split('\n')) {
    const h3 = raw.match(/^===([^=].*?)===\s*$/);
    if (h3) { tipo = clean(h3[1]); fase = ''; continue; }
    const h4 = raw.match(/^====([^=].*?)====\s*$/);
    if (h4) { fase = clean(h4[1]); continue; }
    const m = raw.match(/^\s*\*?\s*'''(.+?):?'''\s*:?\s*(.+)$/);
    if (!m) continue;
    const nome = clean(m[1]).replace(/:$/, '');
    const descricao = clean(m[2]);
    if (nome && descricao.length > 15) list.push({ nome, descricao, tipo, fase });
  }
  return list;
}

function firstParagraph(intro) {
  const lines = clean(intro).split('\n').filter((l) => l.length > 80 && !/^(\||!|\{)/.test(l));
  return lines.slice(0, 2).join(' ').slice(0, 900);
}

async function member(origin, m) {
  const w = await wikitext(m.page);
  if (!w) return { ...m, origin, erro: 'página não encontrada' };
  const info = infobox(w.text);
  const secs = sections(w.text);
  const key = (re) => Object.keys(secs).find((k) => re.test(k));
  const rh = Object.keys(secs).filter((k) => /Rituais|Habilidades|Poderes|Aptidões/.test(k)).map((k) => secs[k]).join('\n');
  const ap = secs[key(/Aparência/) || ''] || '';
  const ars = secs[key(/Arsenal|Itens/) || ''] || '';
  const all = powers(rh);
  const afinidade = (info.afinidade || [])[0] || '';
  // quem já está no jogo usa o elemento definido no jogo (ex.: Joui = Conhecimento, decisão do usuário)
  const inGame = m.id && ROSTER.find((c) => c.id === m.id);
  return {
    name: m.name || (info.nome || [])[0] || w.title,
    page: w.title,
    url: `https://ordemparanormal.fandom.com/wiki/${encodeURIComponent(w.title.replace(/ /g, '_'))}`,
    id: m.id || null,
    origin,
    element: (inGame && inGame.element) || ELEMENT_IDS[afinidade.toLowerCase()] || null,
    afinidade: afinidade || null,
    classe: (info.classe || []).join(', ') || null,
    trilha: (info.trilha || []).join(', ') || null,
    associacao: info['associação'] || [],
    status: (info.status || []).join(', ') || null,
    resumo: firstParagraph(secs.intro),
    aparencia: clean(ap).slice(0, 1500),
    rituais: all.filter((p) => /Ritua/i.test(p.tipo) || (!p.tipo && /"|Ritual/.test(p.nome))),
    habilidades: all.filter((p) => !(/Ritua/i.test(p.tipo) || (!p.tipo && /"|Ritual/.test(p.nome)))),
    arsenal: clean(ars).slice(0, 2500),
  };
}

function toMarkdown(db) {
  const EL = { sangue: 'Sangue', morte: 'Morte', conhecimento: 'Conhecimento', energia: 'Energia', medo: 'Medo' };
  let md = `# Membros das origens — banco para futuras adições\n\n> Gerado por \`npm run lore\` a partir da [Ordem Paranormal Wiki](https://ordemparanormal.fandom.com). Não edite à mão;\n> notas de design ficam em \`lore/NOTAS.md\`. Atualizado em ${db.updated}.\n\n`;
  for (const [origin, list] of Object.entries(db.origins)) {
    md += `## ${origin}\n\n| Nome | Elemento | Classe / Trilha | No jogo | Rituais |\n|---|---|---|---|---|\n`;
    for (const m of list) md += `| [${m.name}](#${slug(m.name)}) | ${EL[m.element] || m.afinidade || '—'} | ${[m.classe, m.trilha].filter(Boolean).join(' / ') || '—'} | ${m.id ? `✅ \`${m.id}\`` : ''} | ${m.rituais ? m.rituais.length : 0} |\n`;
    md += '\n';
  }
  for (const list of Object.values(db.origins)) {
    for (const m of list) {
      md += `---\n\n### ${m.name}\n\n`;
      if (m.erro) { md += `_${m.erro}_\n\n`; continue; }
      md += `**Origem:** ${m.origin} · **Elemento:** ${EL[m.element] || m.afinidade || '—'} · **Classe:** ${m.classe || '—'} · **Trilha:** ${m.trilha || '—'} · **Status:** ${m.status || '—'} · [wiki](${m.url})\n\n`;
      if (m.resumo) md += `${m.resumo}\n\n`;
      if (m.rituais.length) md += `**Rituais**\n\n${m.rituais.map((p) => `- **${p.nome}**${p.fase ? ` _(${p.fase})_` : ''}: ${p.descricao}`).join('\n')}\n\n`;
      if (m.habilidades.length) md += `**Habilidades**\n\n${m.habilidades.map((p) => `- **${p.nome}**${p.fase ? ` _(${p.fase})_` : ''}: ${p.descricao}`).join('\n')}\n\n`;
      if (m.arsenal) md += `**Arsenal / itens:** ${m.arsenal.replace(/\n/g, ' · ')}\n\n`;
      if (m.aparencia) md += `**Aparência:** ${m.aparencia.replace(/\n/g, ' ')}\n\n`;
    }
  }
  return md;
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  const only = process.argv.slice(2).map((s) => s.toLowerCase());
  const dir = new URL('../lore/', import.meta.url);
  if (!existsSync(dir)) mkdirSync(dir);
  const file = new URL('membros.json', dir);
  const prev = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { origins: {} };
  const db = { updated: new Date().toISOString().slice(0, 10), origins: {} };
  for (const [origin, list] of Object.entries(ORIGINS)) {
    db.origins[origin] = [];
    for (const m of list) {
      const old = (prev.origins[origin] || []).find((x) => x.page === m.page || x.name === (m.name || m.page));
      if (only.length && !only.some((o) => (m.name || m.page).toLowerCase().includes(o)) && old) {
        db.origins[origin].push(old);
        continue;
      }
      try {
        const r = await member(origin, m);
        db.origins[origin].push(r);
        console.log(`✔ ${origin}: ${r.name} (${r.afinidade || '—'}) · ${r.rituais?.length ?? 0} rituais, ${r.habilidades?.length ?? 0} habilidades`);
      } catch (e) {
        console.log(`✘ ${m.page}: ${e.message}`);
        db.origins[origin].push(old || { ...m, origin, erro: e.message });
      }
    }
  }
  writeFileSync(file, JSON.stringify(db, null, 2));
  writeFileSync(new URL('MEMBROS.md', dir), toMarkdown(db));
  console.log('lore/membros.json e lore/MEMBROS.md atualizados.');
}

main();
