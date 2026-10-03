// Gera os modelos e cenários com o Blender (modo background) e salva em public/.
//   node tools/blender/build.mjs              → tudo
//   node tools/blender/build.mjs mascarado    → só um
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const BLENDER = process.env.BLENDER || 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe';
if (!existsSync(BLENDER)) {
  console.error('Blender não encontrado em', BLENDER, '(defina a variável BLENDER)');
  process.exit(1);
}

const jobs = readdirSync(here)
  .filter((f) => /^(char|arena)_.+\.py$/.test(f) && f !== 'arena_lib.py') // arena_lib.py é biblioteca, não cenário
  .map((f) => {
    const [kind, id] = f.replace('.py', '').split(/_(.+)/);
    const dir = kind === 'char' ? 'models' : 'arenas';
    return { file: f, id, out: join(root, 'public', dir, `${id}.glb`) };
  });

const only = process.argv.slice(2);
for (const j of jobs) {
  if (only.length && !only.includes(j.id)) continue;
  mkdirSync(dirname(j.out), { recursive: true });
  const t0 = Date.now();
  process.stdout.write(`→ ${j.id} ... `);
  const r = spawnSync(BLENDER, ['-b', '--factory-startup', '-P', join(here, j.file), '--', j.out], { encoding: 'utf8' });
  const log = `${r.stdout}\n${r.stderr}`;
  const ok = log.includes('EXPORTADO');
  console.log(ok ? `ok (${((Date.now() - t0) / 1000).toFixed(1)}s)` : 'FALHOU');
  if (!ok) {
    const lines = log.split('\n');
    const at = lines.findIndex((l) => l.includes('Traceback'));
    console.log((at >= 0 ? lines.slice(at, at + 30) : lines.slice(-20)).join('\n'));
    process.exitCode = 1;
  }
}
