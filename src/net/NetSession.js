// PARTIDA ONLINE / LAN
//
// Conexão: quem cria a sala recebe um código curto e se registra no "corretor" público do PeerJS, que só repassa as
// mensagens de apresentação do WebRTC (oferta, resposta e candidatos de rede). Depois disso a conversa é DIRETA entre
// os dois computadores (DataChannel do WebRTC): na mesma rede, numa rede virtual como o Radmin, ou pela internet.
// Salas: código + senha opcional; públicas aparecem na lista de SALAS ABERTAS (ver Lobby), privadas só pelo código.
//
// Sincronia (lockstep): os dois rodam a MESMA simulação, quadro a quadro (60 por segundo, passo fixo). Por quadro só
// viajam os comandos de cada jogador; um quadro só é simulado quando os comandos dos dois para ele já chegaram. Os
// comandos locais valem DELAY quadros depois (atraso de entrada), o que esconde a latência da rede.
// A cada CHECK quadros os dois comparam um resumo do estado; se divergirem, o anfitrião manda os números da luta e o
// convidado corrige.

import { VERSION, formatVersion } from '../config/version.js';

const BROKER = 'wss://0.peerjs.com:443/peerjs';
const BROKER_KEY = 'peerjs';
const ID_PREFIX = 'arena-paranormal-v1-';
const LOBBY_ID = ID_PREFIX + 'lobby';
const ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I, para não confundir ao ditar
export const DELAY = 4;
export const CHECK = 120;
export const NAME_MAX = 16;

const rid = (n) => Array.from({ length: n }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
export const cleanName = (s) => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, NAME_MAX);

// ------------------------------------------------------------------ corretor (servidor PeerJS)
// Cliente mínimo do protocolo do servidor PeerJS (WebSocket): OPEN, HEARTBEAT e repasse de OFFER/ANSWER/CANDIDATE.
// O servidor público só repassa mensagens no formato do cliente oficial (por isso os campos extras no payload).
class Broker {
  constructor(id) {
    this.id = id;
    this.links = new Map(); // id do outro lado → Link
    this.onOffer = null;
  }

  open() {
    return new Promise((resolve, reject) => {
      const token = rid(12).toLowerCase();
      let done = false;
      const ws = new WebSocket(`${BROKER}?key=${BROKER_KEY}&id=${encodeURIComponent(this.id)}&token=${token}&version=1.5.4`);
      this.ws = ws;
      const fail = (msg, code) => {
        if (done) return;
        done = true;
        const e = new Error(msg);
        e.code = code;
        reject(e);
      };
      const timer = setTimeout(() => fail('O servidor de salas não respondeu. Verifique a internet.'), 10000);
      ws.onerror = () => fail('Não foi possível falar com o servidor de salas.');
      ws.onclose = () => { fail('A conexão com o servidor de salas caiu.'); this.closed = true; };
      ws.onmessage = (e) => {
        let m;
        try { m = JSON.parse(e.data); } catch { return; }
        if (m.type === 'OPEN') {
          done = true;
          clearTimeout(timer);
          this.beat = setInterval(() => this.raw({ type: 'HEARTBEAT' }), 5000);
          resolve();
          return;
        }
        if (m.type === 'ID-TAKEN') { clearTimeout(timer); fail('Código em uso.', 'taken'); return; }
        if (m.type === 'ERROR') return fail((m.payload && m.payload.msg) || 'Erro no servidor de salas.');
        if (m.type === 'OFFER' && this.onOffer) return this.onOffer(m);
        const link = this.links.get(m.src);
        if (link) link.signal(m);
      };
    });
  }

  raw(m) {
    if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(m));
  }

  send(type, dst, payload) {
    this.raw({ type, dst, payload });
  }

  close() {
    clearInterval(this.beat);
    for (const l of this.links.values()) l.signalDone = true;
    if (this.ws) { this.ws.onclose = null; this.ws.close(); }
  }
}

// ------------------------------------------------------------------ uma conexão direta (WebRTC DataChannel)
class Link {
  constructor(broker, peer) {
    this.broker = broker;
    this.peer = peer;
    this.closed = false;
    this.onmessage = null;
    this.onclose = null;
    this.candQueue = [];
    this.pendingCand = [];
    broker.links.set(peer, this);
    this.pc = new RTCPeerConnection({ iceServers: ICE });
    this.pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      if (this.pc.localDescription) this.sendCandidate(e.candidate);
      else this.pendingCand.push(e.candidate);
    };
    this.pc.onconnectionstatechange = () => {
      if (['failed', 'closed'].includes(this.pc.connectionState)) this.close();
    };
  }

  // quem chama (convidado / cliente do lobby)
  static connect(broker, dst, timeoutMs = 15000) {
    const link = new Link(broker, dst);
    link.connId = 'dc_' + rid(11).toLowerCase();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { link.close(); reject(new Error('Ninguém respondeu nesse código.')); }, timeoutMs);
      link.fail = (err) => { clearTimeout(timer); reject(err); };
      const ch = link.pc.createDataChannel('arena', { ordered: true });
      link.bind(ch, () => { clearTimeout(timer); resolve(link); });
      link.pc.createOffer().then(async (offer) => {
        await link.pc.setLocalDescription(offer);
        broker.send('OFFER', dst, { sdp: link.pc.localDescription.toJSON(), type: 'data', connectionId: link.connId, label: link.connId, reliable: true, serialization: 'json', browser: 'chrome' });
        link.flush();
      }).catch((e) => link.fail(e));
    });
  }

  // quem recebe a oferta (anfitrião / dono do lobby)
  static accept(broker, m) {
    const link = new Link(broker, m.src);
    link.connId = m.payload.connectionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { link.close(); reject(new Error('A conexão não completou.')); }, 15000);
      link.pc.ondatachannel = (e) => link.bind(e.channel, () => { clearTimeout(timer); resolve(link); });
      (async () => {
        await link.setRemote(m.payload.sdp);
        const answer = await link.pc.createAnswer();
        await link.pc.setLocalDescription(answer);
        broker.send('ANSWER', m.src, { sdp: link.pc.localDescription.toJSON(), type: 'data', connectionId: link.connId, browser: 'chrome' });
        link.flush();
      })().catch((e) => { clearTimeout(timer); reject(e); });
    });
  }

  signal(m) {
    if (m.type === 'ANSWER') this.setRemote(m.payload.sdp).catch(() => {});
    else if (m.type === 'CANDIDATE' && m.payload && m.payload.candidate) {
      if (this.remoteSet) this.pc.addIceCandidate(m.payload.candidate).catch(() => {});
      else this.candQueue.push(m.payload.candidate);
    } else if ((m.type === 'EXPIRE' || m.type === 'LEAVE') && this.fail) this.fail(new Error('Ninguém está esperando nesse código.'));
  }

  // candidatos de rede do outro lado: só valem depois da descrição remota (antes disso ficam na fila)
  async setRemote(sdp) {
    await this.pc.setRemoteDescription(sdp);
    this.remoteSet = true;
    for (const c of this.candQueue) this.pc.addIceCandidate(c).catch(() => {});
    this.candQueue = [];
  }

  sendCandidate(c) {
    if (!this.signalDone) this.broker.send('CANDIDATE', this.peer, { candidate: c.toJSON(), type: 'data', connectionId: this.connId });
  }

  flush() {
    for (const c of this.pendingCand) this.sendCandidate(c);
    this.pendingCand = [];
  }

  bind(ch, onOpen) {
    this.ch = ch;
    ch.onopen = () => onOpen();
    ch.onmessage = (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      if (this.onmessage) this.onmessage(m);
    };
    ch.onclose = () => this.close();
  }

  send(m) {
    if (this.ch && this.ch.readyState === 'open') this.ch.send(JSON.stringify(m));
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.broker.links.delete(this.peer);
    try { if (this.ch) this.ch.close(); } catch { /* já fechado */ }
    try { this.pc.close(); } catch { /* já fechado */ }
    if (this.onclose) this.onclose();
  }
}

// ------------------------------------------------------------------ partida (lockstep entre dois)
export class NetSession {
  constructor(role) {
    this.role = role; // 'host' (P1) | 'guest' (P2)
    this.slot = role === 'host' ? 0 : 1;
    this.frame = 0; // próximo quadro a simular
    this.localNext = 0; // próximo quadro local a registrar/enviar
    this.local = new Map();
    this.remote = new Map();
    this.hashes = new Map();
    this.acc = 0;
    this.closed = false;
    this.closeReason = '';
    this.ping = 0;
    this.waiting = 0; // tempo parado esperando o outro
    this.desyncs = 0;
    this.fixes = [];
    this.names = ['P1', 'P2'];
  }

  // Cria a sala e espera alguém entrar com o código (e a senha, se houver). onCode(código) assim que vale.
  static async host({ name, password = '', settings, onCode, onSession }) {
    const s = new NetSession('host');
    onSession && onSession(s);
    s.names[0] = cleanName(name) || 'P1';
    s.seed = Math.floor(Math.random() * 2 ** 31);
    s.settings = settings;
    // tenta alguns códigos (no raro caso de um já estar em uso)
    for (let k = 0; ; k++) {
      s.code = rid(5);
      s.broker = new Broker(ID_PREFIX + s.code);
      try { await s.broker.open(); break; } catch (e) { if (e.code !== 'taken' || k > 3) throw e; }
    }
    if (s.closed) throw new Error('cancelado');
    onCode && onCode(s.code);
    const link = await new Promise((resolve, reject) => {
      s.cancel = () => reject(new Error('cancelado'));
      s.broker.onOffer = async (m) => {
        if (s.link) return; // a sala já tem dois
        let l;
        try { l = await Link.accept(s.broker, m); } catch { return; }
        l.onmessage = (h) => {
          if (h.t !== 'hello' || s.link) return;
          const deny = (reason) => { l.send({ t: 'deny', reason }); setTimeout(() => l.close(), 300); };
          if (h.v !== VERSION) return deny(`Versões diferentes do jogo (v${formatVersion(VERSION)} na sala, v${formatVersion(h.v)} aí). Atualizem a página.`);
          if (password && h.password !== password) return deny('Senha errada.');
          s.names[1] = cleanName(h.name) || 'P2';
          l.send({ t: 'welcome', v: VERSION, seed: s.seed, settings: s.settings, name: s.names[0] });
          resolve(l);
        };
      };
    });
    s.useLink(link);
    return s;
  }

  // Entra na sala do código
  static async join(code, { name, password = '', onSession } = {}) {
    const s = new NetSession('guest');
    onSession && onSession(s);
    s.names[1] = cleanName(name) || 'P2';
    s.code = String(code || '').trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(s.code)) throw new Error('O código tem 5 letras/números.');
    s.broker = new Broker(ID_PREFIX + 'g-' + rid(10));
    await s.broker.open();
    if (s.closed) throw new Error('cancelado');
    const link = await Promise.race([
      Link.connect(s.broker, ID_PREFIX + s.code),
      new Promise((_, reject) => { s.cancel = () => reject(new Error('cancelado')); }),
    ]);
    await new Promise((resolve, reject) => {
      s.cancel = () => { link.close(); reject(new Error('cancelado')); };
      const timer = setTimeout(() => { link.close(); reject(new Error('A sala não respondeu.')); }, 10000);
      link.onmessage = (m) => {
        if (m.t === 'deny') { clearTimeout(timer); link.onclose = null; link.close(); reject(new Error(m.reason || 'A sala recusou a entrada.')); }
        if (m.t === 'welcome') {
          clearTimeout(timer);
          s.seed = m.seed;
          s.settings = m.settings;
          s.names[0] = cleanName(m.name) || 'P1';
          resolve();
        }
      };
      link.onclose = () => { clearTimeout(timer); reject(new Error('A sala fechou a conexão.')); };
      link.send({ t: 'hello', v: VERSION, name: s.names[1], password });
    });
    s.useLink(link);
    return s;
  }

  // daqui em diante a conversa é direta: larga o corretor e passa a usar o canal da partida
  useLink(link) {
    this.link = link;
    this.broker.close();
    link.onmessage = (m) => this.onMessage(m);
    link.onclose = () => this.close('O outro jogador saiu da partida.');
    this.pingTimer = setInterval(() => this.send({ t: 'ping', k: performance.now() }), 1000);
  }

  send(m) {
    if (this.link) this.link.send(m);
  }

  onMessage(m) {
    if (m.t === 'i') this.remote.set(m.f, m.d);
    else if (m.t === 'h') this.checkHash(m.f, m.h);
    else if (m.t === 'fix') this.fixes.push(m.s);
    else if (m.t === 'ping') this.send({ t: 'pong', k: m.k });
    else if (m.t === 'pong') this.ping = Math.round(performance.now() - m.k);
    else if (m.t === 'bye') this.close('O outro jogador saiu da partida.');
  }

  close(reason = '') {
    if (this.closed) return;
    this.closed = true;
    this.closeReason = this.closeReason || reason;
    clearInterval(this.pingTimer);
    if (this.cancel) this.cancel();
    if (this.broker) this.broker.close();
    if (this.link) this.link.close();
  }

  leave() {
    this.send({ t: 'bye' });
    this.closeReason = 'Você saiu da partida.';
    setTimeout(() => this.close(), 100);
  }

  // ---------------------------------------------------------------- lockstep
  // registra (e envia) os comandos locais até DELAY quadros à frente do quadro atual
  fill(read) {
    while (this.localNext < this.frame + DELAY) {
      const d = read();
      this.local.set(this.localNext, d);
      this.send({ t: 'i', f: this.localNext, d });
      this.localNext++;
    }
  }

  ready() {
    return this.local.has(this.frame) && this.remote.has(this.frame);
  }

  // comandos do quadro atual, na ordem dos lados [P1, P2]
  take() {
    const mine = this.local.get(this.frame);
    const theirs = this.remote.get(this.frame);
    this.local.delete(this.frame);
    this.remote.delete(this.frame);
    this.frame++;
    return this.slot === 0 ? [mine, theirs] : [theirs, mine];
  }

  // depois de simular um quadro: de tempos em tempos compara o resumo do estado
  afterTick(hashFn, snapshotFn) {
    const f = this.frame - 1;
    if (f % CHECK !== 0) return;
    const h = hashFn();
    this.hashes.set(f, h);
    this.snapshot = this.role === 'host' ? { f, s: snapshotFn() } : null;
    this.send({ t: 'h', f, h });
    const theirs = this.theirHash && this.theirHash[f];
    if (theirs !== undefined) this.compare(f, h, theirs);
  }

  checkHash(f, h) {
    (this.theirHash || (this.theirHash = {}))[f] = h;
    const mine = this.hashes.get(f);
    if (mine !== undefined) this.compare(f, mine, h);
  }

  compare(f, a, b) {
    this.hashes.delete(f);
    if (this.theirHash) delete this.theirHash[f];
    if (a === b) return;
    this.desyncs++;
    // fora de sincronia: o anfitrião manda os números da luta naquele quadro e o convidado corrige
    if (this.role === 'host' && this.snapshot && this.snapshot.f === f) this.send({ t: 'fix', s: this.snapshot.s });
  }
}

// ------------------------------------------------------------------ SALAS ABERTAS (lobby sem servidor próprio)
// Quem estiver na tela ONLINE tenta ocupar um endereço fixo (LOBBY_ID) no corretor: o primeiro vira o "dono da lista";
// os outros se conectam a ele. Salas públicas se anunciam a cada 4 s (somem 12 s depois do último aviso). Se o dono
// sair, a conexão cai e alguém que ficou ocupa o endereço — a lista se refaz sozinha com os próximos avisos.
export class Lobby {
  constructor({ onRooms } = {}) {
    this.onRooms = onRooms;
    this.rooms = new Map(); // (dono) código → { sala, até }
    this.mine = new Map(); // salas públicas que este computador anuncia
    this.list = [];
    this.stopped = false;
  }

  start() {
    this.stopped = false;
    this.connect();
    this.timer = setInterval(() => this.tick(), 4000);
  }

  async connect() {
    if (this.stopped || this.connecting) return;
    this.connecting = true;
    try {
      // 1) tenta ser o dono da lista
      const b = new Broker(LOBBY_ID);
      try {
        await b.open();
        if (this.stopped) { b.close(); return; }
        this.broker = b;
        this.owner = true;
        b.onOffer = async (m) => {
          let l;
          try { l = await Link.accept(b, m); } catch { return; }
          l.onmessage = (msg) => this.onOwnerMessage(l, msg);
        };
        b.ws.onclose = () => { this.broker = null; this.owner = false; this.retry(); };
        this.tick();
        return;
      } catch (e) {
        if (e.code !== 'taken') throw e;
      }
      // 2) já tem dono: conecta nele
      const cb = new Broker(ID_PREFIX + 'l-' + rid(10));
      await cb.open();
      if (this.stopped) { cb.close(); return; }
      this.broker = cb;
      this.owner = false;
      const link = await Link.connect(cb, LOBBY_ID, 10000);
      if (this.stopped) { link.close(); cb.close(); return; }
      this.link = link;
      link.onmessage = (msg) => { if (msg.t === 'rooms') this.setList(msg.list); };
      link.onclose = () => { this.link = null; if (this.broker) this.broker.close(); this.broker = null; this.retry(); };
      this.tick();
    } catch {
      if (this.broker) this.broker.close();
      this.broker = null;
      this.retry();
    } finally {
      this.connecting = false;
    }
  }

  retry() {
    if (this.stopped) return;
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.connect(), 600 + Math.random() * 1500);
  }

  onOwnerMessage(link, msg) {
    if (msg.t === 'announce' && msg.room) this.store(msg.room);
    else if (msg.t === 'remove') this.rooms.delete(msg.code);
    if (msg.t === 'list' || msg.t === 'announce' || msg.t === 'remove') link.send({ t: 'rooms', list: this.current() });
  }

  store(room) {
    const r = { code: String(room.code || '').slice(0, 5), name: cleanName(room.name) || 'Sala', locked: !!room.locked };
    if (!/^[A-Z0-9]{5}$/.test(r.code)) return;
    this.rooms.set(r.code, { room: r, until: Date.now() + 12000 });
  }

  current() {
    const now = Date.now();
    for (const [k, v] of this.rooms) if (v.until < now) this.rooms.delete(k);
    return [...this.rooms.values()].map((v) => v.room);
  }

  setList(list) {
    this.list = Array.isArray(list) ? list.slice(0, 50) : [];
    if (this.onRooms) this.onRooms(this.list);
  }

  // a cada 4 s: reanuncia as salas daqui e pede a lista atualizada
  tick() {
    if (this.owner) {
      for (const r of this.mine.values()) this.store(r);
      this.setList(this.current());
    } else if (this.link) {
      for (const r of this.mine.values()) this.link.send({ t: 'announce', room: r });
      this.link.send({ t: 'list' });
    }
  }

  announce(room) {
    this.mine.set(room.code, room);
    this.tick();
  }

  remove(code) {
    this.mine.delete(code);
    if (this.owner) this.rooms.delete(code);
    else if (this.link) this.link.send({ t: 'remove', code });
  }

  refresh() {
    this.tick();
  }

  stop() {
    this.stopped = true;
    clearInterval(this.timer);
    clearTimeout(this.retryTimer);
    for (const code of [...this.mine.keys()]) this.remove(code);
    if (this.link) { this.link.onclose = null; this.link.close(); }
    if (this.broker) { if (this.broker.ws) this.broker.ws.onclose = null; this.broker.close(); }
    this.link = null;
    this.broker = null;
  }
}

// comandos de um quadro em formato compacto: movimento (-100..100) e botões (bits)
export const NET_ACTIONS = ['physical', 'ranged', 'carga', 'jump', 'block', 'dodge', 'start', 'select', 'assist1', 'assist2', 'switch1', 'switch2', 'pageL', 'pageR'];
export function packInput(mx, my, held, flags = 0) {
  let b = 0;
  NET_ACTIONS.forEach((a, i) => { if (held[a]) b |= 1 << i; });
  return [Math.round(mx * 100), Math.round(my * 100), b, flags];
}
export function unpackInput(d) {
  const held = {};
  NET_ACTIONS.forEach((a, i) => { held[a] = !!(d[2] & (1 << i)); });
  return { moveX: d[0] / 100, moveY: d[1] / 100, held, flags: d[3] || 0 };
}

// sorteio com semente (a simulação usa este no lugar do Math.random durante a partida em rede)
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
