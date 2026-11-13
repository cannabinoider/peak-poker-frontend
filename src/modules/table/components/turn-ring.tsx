"use client";

import { useSecondsLeft } from "@/modules/table/hooks/use-clock";
import { timeFraction, timeTone } from "@/modules/table/utils/countdown";

import { TONE_COLOR } from "./time-tone";

type TurnRingProps = {
  /** Seconds left, as the server sent it. */
  seconds: number;
  /** The full decision time. */
  total: number;
  /** Ring diameter in px. */
  size: number;
};

/** Shrinking ring around the avatar of the player whose turn it is. */
export const TurnRing = ({ seconds, total, size }: TurnRingProps) => {
  const left = useSecondsLeft(seconds) ?? seconds;
  const f = timeFraction(left, Math.max(total, seconds));
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      className="pointer-events-none absolute left-0 top-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={TONE_COLOR[timeTone(f)]}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - f)}
        style={{ transition: "stroke-dashoffset 250ms linear, stroke 250ms" }}
      />
    </svg>
  );
};
