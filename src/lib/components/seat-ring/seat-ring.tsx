import type { ReactNode } from "react";

import { seatRingPosition } from "@/lib/utils/seat-ring";
import { cn } from "@/lib/utils/styles";

type SeatRingProps = {
  /** Number of seats around the table. */
  count: number;
  /** What sits in seat `i` (a button, an avatar…), centred on its spot. */
  renderSeat: (i: number) => ReactNode;
  /** Shown in the middle of the felt. */
  center?: ReactNode;
  className?: string;
};

/** A small felt oval with the seats placed around it, seat 0 at the top. */
export const SeatRing = ({ count, renderSeat, center, className }: SeatRingProps) => (
  <div className={cn("relative mx-auto aspect-[4/3] w-full max-w-[340px]", className)}>
    <div
      aria-hidden
      className="absolute inset-[18%] rounded-full border-[6px] border-rim bg-felt"
    />
    {center && (
      <div className="absolute inset-[18%] flex items-center justify-center px-4 text-center text-xs text-dim">
        {center}
      </div>
    )}
    {Array.from({ length: count }, (_, i) => {
      const p = seatRingPosition(i, count);
      return (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}>
          {renderSeat(i)}
        </div>
      );
    })}
  </div>
);
