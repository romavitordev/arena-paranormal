import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

// APRENDIZADO DA CPU (Super Difícil): no servidor de desenvolvimento o jogo envia o que a IA aprendeu jogando
// (contra jogadores e CPU × CPU) e ele é somado em public/ai/learned.json — o arquivo vai no próximo commit/push e a
// versão publicada já sai com a IA mais treinada. Só existe no `npm run dev` (a versão publicada guarda no navegador).
function aiLearnedPlugin() {
  const file = resolve(import.meta.dirname, 'public/ai/learned.json');
  return {
    name: 'ai-learned',
    apply: 'serve',
    async configureServer(server) {
      const { _mergeInto } = await server.ssrLoadModule('/src/ai/learner.js');
      server.middlewares.use('/__ai/learned', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        let body = '';
        req.on('data', (c) => { body += c; if (body.length > 5e6) req.destroy(); });
        req.on('end', () => {
          try {
            const { version, delta } = JSON.parse(body);
            let cur = { version: 1, games: 0, tables: {}, player: {} };
            try { cur = JSON.parse(readFileSync(file, 'utf8')); } catch { /* arquivo novo */ }
            if (version !== cur.version || !delta) throw new Error('versão diferente');
            _mergeInto(cur, delta);
            writeFileSync(file, `${JSON.stringify(cur, null, 1)}\n`);
            res.statusCode = 204;
          } catch (e) {
            res.statusCode = 400;
          }
          res.end();
        });
      });
    },
  };
}

export default defineConfig({
  root: resolve(import.meta.dirname),
  base: process.env.GITHUB_ACTIONS ? '/arena-paranormal/' : '/',
  plugins: [aiLearnedPlugin()],
  // gravar o aprendizado não pode recarregar a página no meio da luta
  server: { watch: { ignored: ['**/public/ai/**'] } },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 650, // o three.js sozinho tem ~610 kB (biblioteca, fica em cache); o resto fica abaixo de 500
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        gallery: resolve(import.meta.dirname, 'gallery.html'),
      },
      // three.js num arquivo próprio: o código do jogo muda a cada versão, a biblioteca não — o navegador guarda o
      // three em cache entre atualizações. Personagens e animações (dados) também ficam à parte do motor do jogo.
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three')) return 'three';
          if (/[\/]src[\/](characters|anim)[\/]/.test(id)) return 'personagens';
          return undefined;
        },
      },
    },
  },
});
