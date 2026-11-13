"use client";

import { useSecondsLeft } from "@/modules/table/hooks/use-clock";
import { timeFraction, timeTone } from "@/modules/table/utils/countdown";

import { TONE_COLOR } from "./time-tone";

/** Countdown bar above your action buttons. */
export const TurnBar = ({ seconds, total }: { seconds: number; total: number }) => {
  const full = Math.max(total, seconds);
  const left = useSecondsLeft(seconds) ?? seconds;
  const f = timeFraction(left, full);
  const color = TONE_COLOR[timeTone(f)];
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div
        role="progressbar"
        aria-label="Time left to act"
        aria-valuemin={0}
        aria-valuemax={full}
        aria-valuenow={Math.ceil(left)}
        className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/[0.12]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${f * 100}%`,
            backgroundColor: color,
            transition: "width 250ms linear, background-color 250ms",
          }}
        />
      </div>
      <span className="tabular text-xs font-extrabold" style={{ color }}>
        {Math.ceil(left)}s
      </span>
    </div>
  );
};
