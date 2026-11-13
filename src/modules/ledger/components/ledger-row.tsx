import { NetAmount } from "@/lib/components/chip";
import { fmt } from "@/lib/utils/format";

import type { LedgerLine } from "../types";

import { PlayerAvatar } from "./player-avatar";

/** One player in the live ledger: buy-ins, rupees paid, chips and profit/loss. */
export const LedgerRow = ({ line, animal }: { line: LedgerLine; animal?: string }) => (
  <li className="flex items-center gap-2.5 py-1.5">
    <PlayerAvatar name={line.name} seat={line.seat} animal={animal} size={36} />
    <div className="min-w-0 flex-1">
      <p className="truncate font-bold">{line.name}</p>
      <p className="tabular text-xs text-dim">
        {line.cashedOut
          ? `Left the game with ${fmt(line.chips)} chips for the group to settle`
          : `${line.buyIns}× buy-in · paid ₹${fmt(line.paid)} · ${fmt(line.chips)} chips`}
      </p>
    </div>
    <NetAmount value={line.net} className="shrink-0" />
  </li>
);
