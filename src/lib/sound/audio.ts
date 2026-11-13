"use client";

/*
 * Shared Web Audio plumbing. Every sound is synthesised on the fly (no audio
 * files): oscillators and filtered noise shaped by short envelopes.
 */

export interface Audio {
  ctx: AudioContext;
  out: GainNode;
}

const MASTER_VOLUME = 0.55;

let shared: Audio | null = null;
let noise: AudioBuffer | null = null;

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

/** The page's audio context (created on first use); null on the server or old browsers. */
export const getAudio = (): Audio | null => {
  if (shared) {
    return shared;
  }
  if (typeof window === "undefined") {
    return null;
  }
  const Ctor = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  const ctx = new Ctor();
  const out = ctx.createGain();
  out.gain.value = MASTER_VOLUME;
  out.connect(ctx.destination);
  shared = { ctx, out };
  return shared;
};

/** Browsers only allow sound after a tap or key press: call this from one. */
export const unlockAudio = () => {
  const a = getAudio();
  if (a?.ctx.state === "suspended") {
    void a.ctx.resume();
  }
};

/** One second of white noise, made once. */
export const noiseBuffer = (ctx: AudioContext) => {
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noise;
};

/** A gain node with an attack / hold / release envelope starting at `at`. */
export const envelope = (
  a: Audio,
  at: number,
  peak: number,
  attack: number,
  hold: number,
  release: number,
) => {
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.setValueAtTime(peak, at + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  return g;
};

/** Plays a noise burst through `filter` into `dest`, for `dur` seconds from `at`. */
export const playNoise = (a: Audio, at: number, dur: number, dest: AudioNode) => {
  const src = a.ctx.createBufferSource();
  src.buffer = noiseBuffer(a.ctx);
  src.loop = true;
  src.connect(dest);
  src.start(at, Math.random() * 0.5);
  src.stop(at + dur + 0.05);
};

export const filter = (
  a: Audio,
  type: BiquadFilterType,
  frequency: number,
  q = 1,
): BiquadFilterNode => {
  const f = a.ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = q;
  return f;
};

/** Pitch points `[secondsFromStart, hz]`, ramped exponentially between them. */
export type PitchCurve = readonly (readonly [number, number])[];

export const oscillator = (
  a: Audio,
  type: OscillatorType,
  at: number,
  curve: PitchCurve,
  dest: AudioNode,
) => {
  const o = a.ctx.createOscillator();
  o.type = type;
  const [first, ...rest] = curve;
  o.frequency.setValueAtTime(first[1], at + first[0]);
  for (const [t, hz] of rest) {
    o.frequency.exponentialRampToValueAtTime(hz, at + t);
  }
  o.connect(dest);
  o.start(at + first[0]);
  o.stop(at + (curve.at(-1)?.[0] ?? 0) + 0.6);
  return o;
};

/** Wobbles `param` by ±`depth` at `rate` Hz (growl, vibrato). */
export const wobble = (
  a: Audio,
  param: AudioParam,
  at: number,
  dur: number,
  rate: number,
  depth: number,
) => {
  const lfo = a.ctx.createOscillator();
  lfo.frequency.value = rate;
  const amount = a.ctx.createGain();
  amount.gain.value = depth;
  lfo.connect(amount);
  amount.connect(param);
  lfo.start(at);
  lfo.stop(at + dur + 0.1);
};
