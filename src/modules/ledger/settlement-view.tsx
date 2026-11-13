"use client";

import Link from "next/link";

import { fmt, rupees } from "@/lib/utils/format";
import { rupeesFor } from "@/modules/rules";
import type { StateMessage } from "@/modules/table/api/contracts";

import { TrophyIcon } from "./components/icons";
import { MONEY_NOTE } from "./constants";
import { SettlementResults } from "./sections/settlement-results";
import { SettlementTransfers } from "./sections/settlement-transfers";

export interface SettlementViewProps {
  room: StateMessage;
}

/**
 * End-of-night screen: each player's final chips, exact value and net
 * (rounded to ₹1), then who pays whom. Data comes from `room.settlement`.
 */
export const SettlementView = ({ room }: SettlementViewProps) => {
  const { settlement, setup } = room;
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] lg:max-w-5xl lg:px-8 lg:pt-10">
      <div className="flex flex-col items-center text-center">
        <TrophyIcon className="size-11 text-gold" />
        <h1 className="pt-1.5 text-[28px] font-black">Game over</h1>
        <p className="tabular text-dim">
          ₹{fmt(setup.buyInRupees)} per buy-in · 1 chip = {rupees(rupeesFor(setup, 1))}
        </p>
      </div>
      {settlement ? (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
          <SettlementResults room={room} settlement={settlement} />
          <SettlementTransfers settlement={settlement} />
        </div>
      ) : (
        <p className="pt-6 text-center text-dim">Working out the final amounts…</p>
      )}
      <p className="pt-3 text-center text-xs text-faint">
        Amounts rounded to ₹1. {MONEY_NOTE}
      </p>
      <div className="flex justify-center pt-6">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium text-gold outline-none hover:bg-white/[0.08] focus-visible:bg-white/10">
          Back to home
        </Link>
      </div>
    </main>
  );
};
