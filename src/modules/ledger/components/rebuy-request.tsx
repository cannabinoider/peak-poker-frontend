import { TextButton } from "@/lib/components/button";

import { BankIcon } from "./icons";

type RebuyRequestProps = {
  name: string;
  /** Which buy-in this would be (#2, #3…). */
  buyIn: number;
  onDecide: (approve: boolean) => void;
};

/** A busted player's rebuy request, for the banker to approve or deny. */
export const RebuyRequest = ({ name, buyIn, onDecide }: RebuyRequestProps) => (
  <div className="flex items-center gap-2 rounded-input border border-gold/60 bg-gold/[0.12] py-2 pl-3 pr-2">
    <BankIcon className="size-[18px] shrink-0 text-gold" />
    <p className="min-w-0 flex-1 text-sm">
      {name} wants to rebuy <span className="tabular text-dim">(buy-in #{buyIn})</span>
    </p>
    <TextButton tone="danger" onClick={() => onDecide(false)}>
      Deny
    </TextButton>
    <button
      type="button"
      onClick={() => onDecide(true)}
      className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-gold px-4 text-sm font-semibold text-black outline-none transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-gold/60 active:brightness-90">
      Approve
    </button>
  </div>
);
