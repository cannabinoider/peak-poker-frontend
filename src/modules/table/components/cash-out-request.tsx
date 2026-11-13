"use client";

import { fmt } from "@/lib/utils/format";
import { useGameStore } from "@/modules/table/state/game-store";
import type { Room } from "@/modules/table/types";
import {
  cashOutRequestsForYou,
  chipsForCashOut,
  nameOf,
} from "@/modules/table/utils/room";

import { Icon } from "./icons";

type CashOutRequestProps = {
  name: string;
  /** Chips they would leave with. The group settles this; nothing is paid out. */
  chips: number;
  onDecide: (approve: boolean) => void;
};

/** Banker: agree or refuse a player leaving with their chips. */
export const CashOutRequest = ({ name, chips, onDecide }: CashOutRequestProps) => (
  <div className="flex items-center gap-2 rounded-[14px] border border-gold/60 bg-gold/[0.12] py-2 pl-3 pr-2">
    <Icon name="door" size={18} className="shrink-0 text-gold" />
    <p className="min-w-0 flex-1 text-sm text-white">
      {name} wants to leave with <span className="tabular">{fmt(chips)}</span> chips
      <span className="mt-0.5 block text-xs text-dim">
        For the group to settle — not a payout
      </span>
    </p>
    <button
      type="button"
      onClick={() => onDecide(false)}
      aria-label={`Deny ${name} leaving`}
      className="min-h-11 shrink-0 rounded-full px-3 text-sm font-medium text-red outline-none hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-red">
      Deny
    </button>
    <button
      type="button"
      onClick={() => onDecide(true)}
      aria-label={`Approve ${name} leaving`}
      className="min-h-11 shrink-0 rounded-full bg-gold px-4 text-sm font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-white">
      Approve
    </button>
  </div>
);

/** Pending leave requests for the owner or banker, beside the rebuy approvals. */
export const CashOutRequests = ({ room }: { room: Room }) => {
  const decideCashOut = useGameStore((s) => s.decideCashOut);
  const seats = cashOutRequestsForYou(room);
  if (seats.length === 0) {
    return null;
  }
  return (
    <>
      {seats.map((seat) => (
        <CashOutRequest
          key={seat}
          name={nameOf(room, seat)}
          chips={chipsForCashOut(room, seat)}
          onDecide={(ok) => decideCashOut(seat, ok)}
        />
      ))}
    </>
  );
};
