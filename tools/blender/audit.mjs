// Auditoria dos modelos exportados (V4 — Exportação e Otimização).
//   node tools/blender/audit.mjs            → todos os personagens e cenários
//   node tools/blender/audit.mjs xande      → só um
// Regras: ossos obrigatórios presentes, nada sem UV, nenhum vértice sem peso, até 4 influências por vértice,
// escala aplicada, materiais sem duplicata e orçamento de triângulos (personagem ≤ 40k, cenário ≤ 150k).
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const BLENDER = process.env.BLENDER || 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe';
// V4 etapa 12: root, pelvis (hips), spine (sp), chest, neck, head (hd), braços, mãos, pernas e pés
const REQUIRED_BONES = ['root', 'hips', 'sp', 'chest', 'neck', 'hd', 'sL', 'eL', 'handL', 'sR', 'eR', 'handR', 'lL', 'kL', 'footL', 'lR', 'kR', 'footR'];
const BUDGET = { models: 40000, arenas: 150000 };

const only = process.argv.slice(2);
const files = [];
for (const dir of ['models', 'arenas']) {
  const d = join(root, 'public', dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d)) if (f.endsWith('.glb') && (!only.length || only.includes(f.replace('.glb', '')))) files.push({ dir, f, p: join(d, f) });
}

let problems = 0;
const rows = [];
for (const { dir, f, p } of files) {
  const r = spawnSync(BLENDER, ['-b', '--factory-startup', '-P', join(here, 'audit_glb.py'), '--', p], { encoding: 'utf8' });
  const line = (r.stdout || '').split('\n').find((l) => l.startsWith('AUDIT '));
  if (!line) { console.log(`✘ ${f}: falhou a auditoria`); problems++; continue; }
  const a = JSON.parse(line.slice(6));
  const issues = [];
  if (dir === 'models') {
    const missing = REQUIRED_BONES.filter((b) => !a.bones.includes(b));
    if (missing.length) issues.push(`ossos faltando: ${missing.join(', ')}`);
    if (a.unweighted) issues.push(`${a.unweighted} vértices sem peso`);
    if (a.over4) issues.push(`${a.over4} vértices com +4 influências`);
  }
  if (a.noUV.length) issues.push(`sem UV: ${a.noUV.slice(0, 4).join(', ')}${a.noUV.length > 4 ? '…' : ''}`);
  if (a.notApplied.length) issues.push(`transform não aplicado: ${a.notApplied.slice(0, 3).join(', ')}`);
  if (a.dupMaterials.length) issues.push(`materiais duplicados: ${a.dupMaterials.join(', ')}`);
  if (a.tris > BUDGET[dir]) issues.push(`${a.tris} triângulos (orçamento ${BUDGET[dir]})`);
  problems += issues.length;
  rows.push({ arquivo: f, tris: a.tris, malhas: a.meshes, materiais: a.materials, ossos: a.bones.length, altura: a.height, problemas: issues.join(' · ') || 'ok' });
}
console.table(rows);
console.log(problems ? `${problems} problema(s) encontrado(s).` : 'Tudo certo.');
process.exitCode = problems ? 1 : 0;
