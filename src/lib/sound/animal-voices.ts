"use client";

import type { Animal } from "@/lib/components/avatar";

import {
  type Audio,
  envelope,
  filter,
  getAudio,
  oscillator,
  type PitchCurve,
  playNoise,
  wobble,
} from "./audio";

/*
 * Cartoon animal voices, synthesised to match the cartoon avatars: big cats
 * and the bear roar (detuned saws with a growl), the cat meows (a formant
 * sweep), the elephant trumpets, the owl hoots, the frog ribbits, and so on.
 */

interface Roar {
  pitch: PitchCurve;
  dur: number;
  cutoff: number;
  growl: number;
  volume: number;
}

/** Lion / bear / koala: two detuned saws, a growl wobble and breathy noise. */
const roar = (a: Audio, at: number, r: Roar) => {
  const lp = filter(a, "lowpass", r.cutoff, 2);
  lp.frequency.setValueAtTime(r.cutoff * 1.4, at);
  lp.frequency.exponentialRampToValueAtTime(r.cutoff * 0.6, at + r.dur);
  const g = envelope(a, at, r.volume, 0.08, r.dur * 0.55, r.dur * 0.45);
  wobble(a, g.gain, at, r.dur, r.growl, r.volume * 0.45);
  lp.connect(g).connect(a.out);
  oscillator(a, "sawtooth", at, r.pitch, lp);
  oscillator(
    a,
    "sawtooth",
    at,
    r.pitch.map(([t, hz]) => [t, hz * 1.012] as const),
    lp,
  );
  const bp = filter(a, "bandpass", r.cutoff * 0.7, 0.8);
  const ng = envelope(a, at, r.volume * 0.5, 0.1, r.dur * 0.5, r.dur * 0.4);
  bp.connect(ng).connect(a.out);
  playNoise(a, at, r.dur, bp);
};

/** A pitched syllable through a bandpass "mouth" that can sweep (meow, bleat, yip). */
const call = (
  a: Audio,
  at: number,
  type: OscillatorType,
  pitch: PitchCurve,
  mouth: PitchCurve,
  dur: number,
  volume: number,
  vibrato = 0,
) => {
  const bp = filter(a, "bandpass", mouth[0][1], 3);
  for (const [t, hz] of mouth) {
    bp.frequency.exponentialRampToValueAtTime(hz, at + t + 0.001);
  }
  const g = envelope(a, at, volume, 0.03, dur * 0.5, dur * 0.5);
  bp.connect(g).connect(a.out);
  const o = oscillator(a, type, at, pitch, bp);
  if (vibrato > 0) {
    wobble(a, o.frequency, at, dur, 7, vibrato);
  }
};

const VOICES: Record<Animal, (a: Audio, at: number) => void> = {
  lion: (a, at) =>
    roar(a, at, {
      pitch: [
        [0, 120],
        [0.35, 105],
        [1.2, 70],
      ],
      dur: 1.25,
      cutoff: 900,
      growl: 28,
      volume: 0.7,
    }),
  monkey: (a, at) => {
    // "Ooh ooh ooh aah-aah!": rising hoots, then two bright shrieks.
    for (const t of [0, 0.2, 0.4]) {
      call(
        a,
        at + t,
        "triangle",
        [
          [0, 380],
          [0.14, 560],
        ],
        [
          [0, 700],
          [0.14, 1000],
        ],
        0.16,
        0.45,
      );
    }
    for (const t of [0.66, 0.92]) {
      call(
        a,
        at + t,
        "sawtooth",
        [
          [0, 900],
          [0.08, 1300],
          [0.22, 1000],
        ],
        [
          [0, 1500],
          [0.08, 2400],
          [0.22, 1700],
        ],
        0.24,
        0.4,
        30,
      );
    }
  },
  bear: (a, at) =>
    roar(a, at, {
      pitch: [
        [0, 95],
        [0.4, 85],
        [1, 62],
      ],
      dur: 1.05,
      cutoff: 620,
      growl: 21,
      volume: 0.8,
    }),
  elephant: (a, at) => {
    // Trumpet: a bright, brassy swoop with a wide wobble.
    call(
      a,
      at,
      "sawtooth",
      [
        [0, 330],
        [0.18, 720],
        [0.7, 640],
        [0.95, 480],
      ],
      [
        [0, 1100],
        [0.2, 2200],
        [0.95, 1300],
      ],
      1,
      0.55,
      22,
    );
    const hp = filter(a, "bandpass", 2600, 1);
    const g = envelope(a, at, 0.18, 0.05, 0.5, 0.4);
    hp.connect(g).connect(a.out);
    playNoise(a, at, 1, hp);
  },
  cat: (a, at) =>
    call(
      a,
      at,
      "sawtooth",
      [
        [0, 480],
        [0.22, 760],
        [0.65, 430],
      ],
      [
        [0, 900],
        [0.25, 1900],
        [0.65, 850],
      ],
      0.7,
      0.5,
    ),
  fox: (a, at) => {
    for (const t of [0, 0.19, 0.38]) {
      call(
        a,
        at + t,
        "square",
        [
          [0, 1050],
          [0.12, 640],
        ],
        [
          [0, 1700],
          [0.12, 1100],
        ],
        0.13,
        0.3,
      );
    }
  },
  pig: (a, at) => {
    // A big burp: a low, croaky rasp that wobbles irregularly, then a happy oink.
    const lp = filter(a, "lowpass", 700, 6);
    lp.frequency.setValueAtTime(900, at);
    lp.frequency.exponentialRampToValueAtTime(380, at + 0.8);
    const g = envelope(a, at, 0.85, 0.03, 0.5, 0.3);
    wobble(a, g.gain, at, 0.85, 23, 0.5);
    wobble(a, g.gain, at, 0.85, 37, 0.25);
    lp.connect(g).connect(a.out);
    oscillator(
      a,
      "sawtooth",
      at,
      [
        [0, 105],
        [0.15, 125],
        [0.55, 92],
        [0.83, 70],
      ],
      lp,
    );
    call(
      a,
      at + 1.05,
      "square",
      [
        [0, 330],
        [0.18, 250],
      ],
      [
        [0, 900],
        [0.18, 650],
      ],
      0.2,
      0.35,
    );
  },
  snake: (a, at) => {
    // A long hiss, a short one, and a dry rattle.
    for (const [t, dur, peak] of [
      [0, 0.75, 0.5],
      [0.85, 0.35, 0.4],
    ] as const) {
      const bp = filter(a, "bandpass", 5200, 0.9);
      bp.frequency.setValueAtTime(4200, at + t);
      bp.frequency.exponentialRampToValueAtTime(6800, at + t + dur);
      const g = envelope(a, at + t, peak, 0.12, dur * 0.5, dur * 0.35);
      bp.connect(g).connect(a.out);
      playNoise(a, at + t, dur, bp);
    }
    const hp = filter(a, "highpass", 2500);
    const rattle = envelope(a, at + 1.25, 0.3, 0.02, 0.35, 0.15);
    wobble(a, rattle.gain, at + 1.25, 0.55, 28, 0.3);
    hp.connect(rattle).connect(a.out);
    playNoise(a, at + 1.25, 0.55, hp);
  },
  owl: (a, at) => {
    for (const [t, dur] of [
      [0, 0.32],
      [0.45, 0.16],
      [0.66, 0.42],
    ] as const) {
      const g = envelope(a, at + t, 0.45, 0.06, dur * 0.4, dur * 0.6);
      g.connect(a.out);
      const o = oscillator(
        a,
        "sine",
        at + t,
        [
          [0, 410],
          [dur, 360],
        ],
        g,
      );
      wobble(a, o.frequency, at + t, dur, 6, 6);
    }
  },
  frog: (a, at) => {
    for (const t of [0, 0.28]) {
      const lp = filter(a, "lowpass", 1100, 4);
      const g = envelope(a, at + t, 0.5, 0.01, 0.1, 0.08);
      wobble(a, g.gain, at + t, 0.2, 42, 0.35);
      lp.connect(g).connect(a.out);
      oscillator(
        a,
        "square",
        at + t,
        [
          [0, 210],
          [0.18, 150],
        ],
        lp,
      );
    }
  },
  panda: (a, at) => {
    for (const t of [0, 0.32]) {
      call(
        a,
        at + t,
        "triangle",
        [
          [0, 620],
          [0.12, 720],
          [0.28, 560],
        ],
        [
          [0, 1200],
          [0.28, 900],
        ],
        0.28,
        0.45,
        18,
      );
    }
  },
  rabbit: (a, at) => {
    for (const t of [0, 0.11, 0.22, 0.4]) {
      const g = envelope(a, at + t, 0.3, 0.005, 0.02, 0.05);
      g.connect(a.out);
      oscillator(
        a,
        "sine",
        at + t,
        [
          [0, 1800],
          [0.07, 2500],
        ],
        g,
      );
    }
  },
  koala: (a, at) => {
    roar(a, at, {
      pitch: [
        [0, 78],
        [0.3, 70],
        [0.7, 58],
      ],
      dur: 0.75,
      cutoff: 480,
      growl: 17,
      volume: 0.65,
    });
    // ...then a snorty inhale.
    const bp = filter(a, "bandpass", 1500, 1.5);
    const g = envelope(a, at + 0.85, 0.25, 0.12, 0.1, 0.15);
    bp.connect(g).connect(a.out);
    playNoise(a, at + 0.85, 0.4, bp);
  },
};

/** Plays `animal`'s cartoon voice after `delay` seconds (if sound can play). */
export const playAnimal = (animal: Animal, delay = 0) => {
  const a = getAudio();
  if (a?.ctx.state !== "running") {
    return;
  }
  VOICES[animal](a, a.ctx.currentTime + 0.01 + delay);
};
