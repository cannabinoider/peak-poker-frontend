"use client";

import { type Audio, envelope, filter, getAudio, oscillator, playNoise } from "./audio";

/** Runs `draw` with the audio context and the current time, if sound can play. */
const withAudio = (draw: (a: Audio, now: number) => void, delay = 0) => {
  const a = getAudio();
  if (a?.ctx.state !== "running") {
    return;
  }
  draw(a, a.ctx.currentTime + 0.01 + delay);
};

const jitter = (base: number, spread: number) =>
  base * (1 + (Math.random() - 0.5) * spread);

/** One clay chip clicking on another: a bright filtered tick plus a tiny ring. */
const clack = (a: Audio, at: number, volume: number) => {
  const bp = filter(a, "bandpass", jitter(4200, 0.3), 6);
  const g = envelope(a, at, volume, 0.001, 0.004, 0.035);
  bp.connect(g).connect(a.out);
  playNoise(a, at, 0.05, bp);

  const ring = envelope(a, at, volume * 0.35, 0.001, 0, 0.06);
  ring.connect(a.out);
  oscillator(a, "triangle", at, [[0, jitter(2900, 0.2)]], ring);
};

/** Chips pushed into the pot. `count` clacks; more for raises and all-ins. */
export const playChips = (count = 4, delay = 0) =>
  withAudio((a, now) => {
    let t = now;
    for (let i = 0; i < count; i++) {
      clack(a, t, jitter(0.5, 0.4));
      t += jitter(0.045, 0.6);
    }
    if (count >= 8) {
      // All-in: a soft thud of the whole stack landing.
      const lp = filter(a, "lowpass", 220);
      const g = envelope(a, now, 0.5, 0.005, 0.02, 0.18);
      lp.connect(g).connect(a.out);
      playNoise(a, now, 0.25, lp);
    }
  }, delay);

/** Check: two knuckle taps on the felt. */
export const playCheck = (delay = 0) =>
  withAudio((a, now) => {
    for (const t of [0, 0.12]) {
      const g = envelope(a, now + t, 0.7, 0.002, 0.005, 0.09);
      g.connect(a.out);
      oscillator(
        a,
        "sine",
        now + t,
        [
          [0, 190],
          [0.08, 90],
        ],
        g,
      );
      const lp = filter(a, "lowpass", 900);
      const ng = envelope(a, now + t, 0.25, 0.001, 0.003, 0.04);
      lp.connect(ng).connect(a.out);
      playNoise(a, now + t, 0.05, lp);
    }
  }, delay);

/** Fold: cards slid away, a soft swish. */
export const playFold = (delay = 0) =>
  withAudio((a, now) => {
    const bp = filter(a, "bandpass", 2400, 1.2);
    bp.frequency.setValueAtTime(2400, now);
    bp.frequency.exponentialRampToValueAtTime(500, now + 0.28);
    const g = envelope(a, now, 0.35, 0.03, 0.08, 0.2);
    bp.connect(g).connect(a.out);
    playNoise(a, now, 0.35, bp);
  }, delay);

/** One card flicked onto the table. */
const flick = (a: Audio, at: number) => {
  const hp = filter(a, "highpass", jitter(1800, 0.3));
  const g = envelope(a, at, 0.32, 0.002, 0.01, 0.05);
  hp.connect(g).connect(a.out);
  playNoise(a, at, 0.08, hp);
};

/** Board cards turned over (or a discard): one flick per card. */
export const playCards = (count = 1, delay = 0) =>
  withAudio((a, now) => {
    for (let i = 0; i < Math.min(count, 5); i++) {
      flick(a, now + i * 0.09);
    }
  }, delay);

/** A new hand: a quick riffle of cards being dealt round the table. */
export const playDeal = (delay = 0) =>
  withAudio((a, now) => {
    for (let i = 0; i < 6; i++) {
      flick(a, now + i * jitter(0.07, 0.3));
    }
  }, delay);

/** Your turn: a gentle two-note chime. */
export const playYourTurn = (delay = 0) =>
  withAudio((a, now) => {
    [880, 1320].forEach((hz, i) => {
      const g = envelope(a, now + i * 0.13, 0.22, 0.01, 0.05, 0.35);
      g.connect(a.out);
      oscillator(a, "sine", now + i * 0.13, [[0, hz]], g);
    });
  }, delay);

/** The pot sliding to the winner: a long cascade of chips. */
export const playPotWon = (delay = 0) =>
  withAudio((a, now) => {
    let t = now;
    for (let i = 0; i < 14; i++) {
      clack(a, t, jitter(0.45, 0.5));
      t += jitter(0.05, 0.8);
    }
  }, delay);

/** A short rising fanfare (winners without an animal). */
export const playFanfare = (delay = 0) =>
  withAudio((a, now) => {
    [523, 659, 784, 1047].forEach((hz, i) => {
      const g = envelope(a, now + i * 0.11, 0.25, 0.01, 0.06, 0.3);
      g.connect(a.out);
      oscillator(a, "triangle", now + i * 0.11, [[0, hz]], g);
    });
  }, delay);
