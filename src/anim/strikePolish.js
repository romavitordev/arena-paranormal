// MELHORIA DAS ANIMAÇÕES — 1ª leva (TODO 2.1, pedido de 2026-10-26): os golpes genéricos que quase todo o elenco usa
// eram 3 poses (guarda → golpe → guarda) e pareciam duros. Aqui cada um ganha, a partir das próprias poses:
//   ANTECIPAÇÃO — o corpo carrega antes (tronco e braços vão um pouco para o lado OPOSTO do golpe, quadril desce);
//   o GOLPE no mesmo instante de antes (a janela de acerto dos golpes continua batendo com a animação);
//   PASSAGEM (overshoot) — o golpe passa um pouco do ponto, dá o "estalo" do impacto;
//   PESO NA VOLTA — volta devagar até a guarda (segue o movimento em vez de voltar de mola).
// Cotovelos e joelhos nunca dobram ao contrário (o "passar do ponto" não estica além do reto).
const UPPER = ['hip', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR'];
const ALL = ['hip', 'sp', 'hd', 'sL', 'eL', 'sR', 'eR', 'lL', 'kL', 'lR', 'kR'];

// pose = guarda + (alvo − guarda) × f, junta a junta (só nas juntas pedidas; as outras seguem a pose base)
function blend(guard, target, f, joints, base = target) {
  const out = { ...base };
  out.h = (guard.h ?? 0) + ((target.h ?? 0) - (guard.h ?? 0)) * f;
  for (const j of joints) {
    const g = guard[j] || [0, 0, 0];
    const t = target[j] || g;
    out[j] = [0, 1, 2].map((i) => g[i] + (t[i] - g[i]) * f);
  }
  // cotovelo dobra só para um lado (x ≤ 0) e o joelho só para o outro (x ≥ 0)
  for (const j of ['eL', 'eR']) if (out[j]) out[j] = [Math.min(0, out[j][0]), out[j][1], out[j][2]];
  for (const j of ['kL', 'kR']) if (out[j]) out[j] = [Math.max(0, out[j][0]), out[j][1], out[j][2]];
  return out;
}

export function polishStrikes(CLIPS, k, GUARD, names) {
  for (const name of names) {
    const c = CLIPS[name];
    if (!c || c.loop || c.polished || c.keys.length < 3) continue;
    const keys = c.keys;
    const start = keys[0].pose; // a guarda, ou o preparo (os cortes de faca já começam armados)
    const end = keys[keys.length - 1].pose; // para onde o golpe volta
    const hit = keys[keys.length - 2]; // a pose do golpe (a última antes de voltar)
    const th = hit.t;
    const out = [keys[0]];
    if (keys.length === 3) {
      // sem pose de preparo: a antecipação leva o começo um pouco mais para o lado contrário do golpe, só na parte de
      // cima (as pernas ficam firmes); o quadril desce um pouco
      const anti = blend(start, hit.pose, -0.22, UPPER, start);
      anti.h = (start.h ?? GUARD.h ?? 0) - 0.035;
      out.push(k(th * 0.45, anti));
    } else {
      out.push(...keys.slice(1, -2));
    }
    out.push(hit);
    const rest = 1 - th;
    out.push(k(th + rest * 0.16, blend(start, hit.pose, 1.1, ALL)));
    out.push(k(th + rest * 0.55, blend(end, hit.pose, 0.42, ALL)));
    out.push(keys[keys.length - 1]);
    CLIPS[name] = { ...c, keys: out, polished: true };
  }
}

// os golpes genéricos (soco, gancho, chutes, joelhada, cortes de faca): usados por boa parte do elenco
export const POLISHED_STRIKES = ['jab', 'cross', 'hook_l', 'hook_r', 'uppercut', 'heavy_punch', 'kick_front', 'kick_round', 'kick_low', 'spin_kick', 'knee', 'onearm_punch', 'knife_1', 'knife_2', 'knife_3'];
