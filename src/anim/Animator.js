import { CLIPS, JOINTS } from './clips.js';
import { smooth } from '../core/util.js';

// Toca clipes procedurais num rig (ver models/rig.js) com transição suave.
// Quando os modelos definitivos chegarem com animações próprias, basta
// trocar esta classe por uma que use THREE.AnimationMixer mantendo a mesma API
// (play / update / setOverride).
export class Animator {
  constructor(rig, animMap = {}) {
    this.rig = rig;
    this.animMap = animMap; // nome lógico → nome do clipe (por personagem)
    this.current = null;
    this.time = 0;
    this.speed = 1;
    this.duration = 1;
    this.prevPose = null;
    this.blend = 1;
    this.blendTime = 0.08;
    this.pose = emptyPose();
  }

  resolve(name) {
    return this.animMap[name] || name;
  }

  // duration: força a duração (usado nos golpes para casar com o hitbox)
  play(name, { duration, restart = false, blend = 0.08 } = {}) {
    const clipName = this.resolve(name);
    const clip = CLIPS[clipName];
    if (!clip) {
      console.warn('Clipe inexistente:', clipName);
      return;
    }
    if (this.current === clip && !restart) return;
    this.prevPose = clonePose(this.pose);
    this.current = clip;
    this.currentName = clipName;
    this.time = 0;
    this.duration = duration || clip.dur;
    this.blend = blend > 0 ? 0 : 1;
    this.blendTime = blend;
  }

  get progress() {
    return Math.min(1, this.time / this.duration);
  }

  update(dt) {
    if (!this.current) return;
    this.time += dt * this.speed;
    if (this.blend < 1) this.blend = Math.min(1, this.blend + dt / this.blendTime);
    const clip = this.current;
    let t = this.time / this.duration;
    t = clip.loop ? t % 1 : Math.min(1, t);
    sample(clip, t, this.pose);
    if (this.blend < 1 && this.prevPose) mixPose(this.prevPose, this.pose, smooth(this.blend), this.pose);
    this.apply();
  }

  apply() {
    if (this.rig.applyPose) {
      // rig com esqueleto vindo do Blender
      this.rig.applyPose(this.pose);
      return;
    }
    const r = this.rig.joints;
    const p = this.pose;
    r.hips.position.y = this.rig.hipHeight + p.h;
    for (const j of JOINTS) {
      const node = r[j];
      if (!node) continue;
      const v = p[j];
      node.rotation.set(v[0], v[1], v[2]);
    }
  }
}

function emptyPose() {
  const p = { h: 0 };
  for (const j of JOINTS) p[j] = [0, 0, 0];
  return p;
}

function clonePose(p) {
  const o = { h: p.h };
  for (const j of JOINTS) o[j] = [...p[j]];
  return o;
}

function mixPose(a, b, t, out) {
  out.h = a.h + (b.h - a.h) * t;
  for (const j of JOINTS) for (let i = 0; i < 3; i++) out[j][i] = a[j][i] + (b[j][i] - a[j][i]) * t;
}

function sample(clip, t, out) {
  const keys = clip.keys;
  let i = 0;
  while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[Math.min(i + 1, keys.length - 1)];
  const span = b.t - a.t;
  const lt = span > 0 ? smooth(Math.min(1, Math.max(0, (t - a.t) / span))) : 1;
  out.h = (a.pose.h || 0) + ((b.pose.h || 0) - (a.pose.h || 0)) * lt;
  for (const j of JOINTS) {
    const va = a.pose[j] || ZERO;
    const vb = b.pose[j] || ZERO;
    for (let n = 0; n < 3; n++) out[j][n] = va[n] + (vb[n] - va[n]) * lt;
  }
}
const ZERO = [0, 0, 0];
