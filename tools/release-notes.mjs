// Notas da release no GitHub (workflow release-apps.yml): a entrada mais nova do CHANGELOG do jogo (src/config/version.js),
// a mesma que aparece em NOVIDADES — assim a página de download também mostra o que mudou.
import { CHANGELOG } from '../src/config/version.js';

const c = CHANGELOG[0];
const base = 'https://github.com/romavitordev/arena-paranormal/releases/latest/download';
console.log(`## v${c.v} — ${c.title}\n`);
for (const item of c.items) console.log(`- ${item}`);
console.log(`
### Baixar
- **PC (Windows):** [Arena-Paranormal-Windows.exe](${base}/Arena-Paranormal-Windows.exe) — se o Windows avisar, "Mais informações → Executar assim mesmo".
- **Celular (Android):** [Arena-Paranormal-Android.apk](${base}/Arena-Paranormal-Android.apk) — permita instalar apps de fontes desconhecidas.
- **Navegador / iPhone:** https://romavitordev.github.io/arena-paranormal/`);
