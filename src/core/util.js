import * as THREE from 'three';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const DEG = Math.PI / 180;

export function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function turnTowards(current, target, maxStep) {
  const d = angleDiff(current, target);
  return current + clamp(d, -maxStep, maxStep);
}

// Ângulo (yaw) para olhar de "from" para "to" no plano XZ. Modelos olham para +Z.
export function yawTo(from, to) {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

export function forwardFromYaw(yaw, out = new THREE.Vector3()) {
  return out.set(Math.sin(yaw), 0, Math.cos(yaw));
}

export function distXZ(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

// Linha do tempo simples para sequências (especiais, cinematics).
// add(t, fn) agenda fn no segundo t; each(fn) roda todo frame com (time, dt).
export class Timeline {
  constructor() {
    this.time = 0;
    this.events = [];
    this.tickers = [];
    this.length = 0;
    this.done = false;
  }
  add(t, fn) {
    this.events.push({ t, fn, fired: false });
    this.length = Math.max(this.length, t);
    return this;
  }
  each(fn) {
    this.tickers.push(fn);
    return this;
  }
  end(t) {
    this.length = t;
    return this;
  }
  update(dt) {
    if (this.done) return true;
    this.time += dt;
    for (const fn of this.tickers) fn(this.time, dt);
    for (const e of this.events) {
      if (!e.fired && this.time >= e.t) {
        e.fired = true;
        e.fn(this.time);
      }
    }
    if (this.time >= this.length) this.done = true;
    return this.done;
  }
}
