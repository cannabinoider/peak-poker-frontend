"use client";

import { create } from "zustand";

interface DealStore {
  /**
   * While the dealer is dealing: how many hole cards have landed at each seat.
   * Null when no deal is animating (show every card as normal).
   */
  landed: Readonly<Record<number, number>> | null;
  start: (seats: readonly number[]) => void;
  land: (seat: number) => void;
  finish: () => void;
}

/** Deal progress, so seats and your own hand only show cards that have arrived. */
export const useDealStore = create<DealStore>()((set) => ({
  landed: null,
  start: (seats) => set({ landed: Object.fromEntries(seats.map((s) => [s, 0])) }),
  land: (seat) =>
    set(({ landed }) =>
      landed ? { landed: { ...landed, [seat]: (landed[seat] ?? 0) + 1 } } : {},
    ),
  finish: () => set({ landed: null }),
}));

/** Cards to show for `seat` out of `total` (all of them when no deal is running). */
export const useLandedCount = (seat: number | null | undefined, total: number) =>
  useDealStore((s) =>
    s.landed === null || seat === null || seat === undefined
      ? total
      : Math.min(total, s.landed[seat] ?? total),
  );
