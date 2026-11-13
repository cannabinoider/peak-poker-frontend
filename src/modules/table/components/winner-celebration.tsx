"use client";

import type { CSSProperties, ReactNode } from "react";

import { type Animal, AnimalFace, isAnimal } from "@/lib/components/avatar";
import { fmt } from "@/lib/utils/format";
import { cn } from "@/lib/utils/styles";
import type { Win } from "@/modules/table/utils/sound-events";

import s from "./winner-celebration.module.css";

const FACE_SIZE = 124;
const CHIP_COUNT = 14;

type Motion =
  | "roar"
  | "fly"
  | "trumpet"
  | "hop"
  | "bounce"
  | "wag"
  | "swish"
  | "roll"
  | "sway"
  | "slither"
  | "burp"
  | "scratch";

const MOTIONS: Record<Animal, Motion> = {
  lion: "roar",
  monkey: "scratch",
  bear: "roar",
  owl: "fly",
  elephant: "trumpet",
  frog: "hop",
  rabbit: "bounce",
  fox: "wag",
  cat: "swish",
  panda: "roll",
  koala: "sway",
  snake: "slither",
  pig: "burp",
};

const Wing = ({ side }: { side: "left" | "right" }) => (
  <span className={cn(s.wingSlot, side === "left" ? s.wingLeft : s.wingRight)}>
    <svg viewBox="0 0 60 80" className={s.wing} aria-hidden>
      <path d="M58 12C22 2 0 40 6 78C22 62 40 52 58 46Z" fill="#7C3AED" />
      <path
        d="M50 22C30 22 16 40 14 62M52 32C36 34 26 46 24 60"
        fill="none"
        stroke="#C4B5FD"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </span>
);

const Tail = ({ kind }: { kind: "fox" | "cat" }) => (
  <svg
    viewBox="0 0 80 80"
    className={cn(s.tail, kind === "cat" && s.catTail)}
    aria-hidden>
    {kind === "fox" ? (
      <>
        <path d="M6 74C18 40 44 10 74 8C66 30 46 60 14 78Z" fill="#F97316" />
        <path d="M74 8C70 18 64 26 58 30C60 20 64 12 74 8Z" fill="#FFFFFF" />
      </>
    ) : (
      <path
        d="M8 74C40 70 30 30 58 20C66 17 72 22 70 30"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="9"
        strokeLinecap="round"
      />
    )}
  </svg>
);

const NOTE = "M9 18a3 3 0 1 1-2-2.8V4.5l12-2.5v12.5a3 3 0 1 1-2-2.8V6.6L9 8.2z";
const HEART =
  "M12 21s-7-4.4-9.5-8.6C.7 9.2 2.4 5 6.2 5c2.2 0 3.6 1.3 5.8 3.6C14.2 6.3 15.6 5 17.8 5c3.8 0 5.5 4.2 3.7 7.4C19 16.6 12 21 12 21z";
const BUBBLE = "M12 3a9 9 0 1 0 0.01 0z";
const STAR = "12,2 15,9 22,9.5 16.6,14 18.5,21 12,17 5.5,21 7.4,14 2,9.5 9,9";

const Floaters = ({ path, className }: { path: string; className: string }) => (
  <>
    {[0, 1, 2].map((i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        aria-hidden
        className={cn(s.floater, className)}
        style={{ "--i": i } as CSSProperties}>
        <path d={path} fill="currentColor" />
      </svg>
    ))}
  </>
);

/** Extra bits around the face for each motion (wings, tails, roar rings...). */
const extras = (motion: Motion): ReactNode => {
  switch (motion) {
    case "fly":
      return (
        <>
          <Wing side="left" />
          <Wing side="right" />
        </>
      );
    case "roar":
      return [0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className={s.wave}
          style={{ "--i": i } as CSSProperties}
        />
      ));
    case "trumpet":
      return <Floaters path={NOTE} className={s.note} />;
    case "sway":
      return <Floaters path={HEART} className={s.heart} />;
    case "burp":
      return <Floaters path={BUBBLE} className={s.bubble} />;
    case "wag":
      return <Tail kind="fox" />;
    case "swish":
      return <Tail kind="cat" />;
    default:
      return null;
  }
};

/**
 * The hand winner's animal pops up over the table with gold rays, a burst of
 * chips and its own little act: the lion roars, the owl flies in, the
 * elephant raises its trunk...
 */
export const WinnerCelebration = ({ win }: { win: Win }) => {
  const animal = isAnimal(win.animal) ? win.animal : null;
  const motion = animal ? MOTIONS[animal] : "bounce";
  return (
    <div className={s.overlay} role="status" aria-live="polite">
      <div key={win.key} className={s.stage}>
        <div aria-hidden className={s.rays} />
        <div aria-hidden className={s.burst}>
          {Array.from({ length: CHIP_COUNT }, (_, i) => (
            <span
              key={i}
              className={s.chip}
              style={
                {
                  "--a": `${(i * 360) / CHIP_COUNT + (i % 2) * 9}deg`,
                  "--d": `${90 + (i % 3) * 26}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className={cn(s.actor, s[motion])}>
          {extras(motion)}
          <div className={s.pop}>
            <div aria-hidden className={s.glow} />
            {animal ? (
              <AnimalFace animal={animal} size={FACE_SIZE} lively className={s.face} />
            ) : (
              <div className={cn(s.face, s.trophy)}>
                <svg viewBox="0 0 24 24" width={64} height={64} aria-hidden>
                  <polygon points={STAR} fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        </div>
        <p className={s.caption}>
          <span className={s.name}>{win.you ? "You win!" : `${win.name} wins`}</span>
          <span className={s.amount}>+{fmt(win.amount)}</span>
        </p>
      </div>
    </div>
  );
};
