import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname),
  base: process.env.GITHUB_ACTIONS ? '/arena-paranormal/' : '/',
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
